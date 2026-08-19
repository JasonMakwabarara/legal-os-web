import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import * as db from "../db";
import { completeLlm, LlmError } from "./llm";

/**
 * Contract review pipeline shared by the web app (full text) and the Word
 * add-in ({paragraphs}). One structured-output call produces risks, a
 * paragraph-anchored redline list, and the full [REDLINE]-marked text.
 */

export type AnalysisParagraph = { index: number; text: string };

export type ContractRisk = {
  level: "low" | "medium" | "high";
  issue: string;
  exposureEstimate: number;
  recommendation: string;
  clauseExcerpt: string;
};

export type ContractRedline = {
  paragraphIndex: number;
  originalText: string;
  suggestedText: string;
  rationale: string;
};

export type ContractAnalysis = {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  risks: ContractRisk[];
  redlines: ContractRedline[];
  redlinedText: string;
};

const RISK_LEVELS = ["low", "medium", "high"] as const;

/** Keep prompts well inside the context window even for long agreements. */
const MAX_ANALYSIS_CHARS = 300_000;

const ANALYSIS_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    riskLevel: { type: "string", enum: [...RISK_LEVELS] },
    summary: {
      type: "string",
      description: "3-6 sentence summary of the agreement and its overall risk posture.",
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          level: { type: "string", enum: [...RISK_LEVELS] },
          issue: { type: "string", description: "Short name of the problem." },
          exposureEstimate: {
            type: "number",
            description: "Estimated financial exposure in USD. 0 when not quantifiable.",
          },
          recommendation: { type: "string" },
          clauseExcerpt: {
            type: "string",
            description: "Short verbatim excerpt of the problematic clause.",
          },
        },
        required: ["level", "issue", "exposureEstimate", "recommendation", "clauseExcerpt"],
        additionalProperties: false,
      },
    },
    redlines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          paragraphIndex: {
            type: "integer",
            description: "Index of the paragraph the change applies to, from the numbered input.",
          },
          originalText: {
            type: "string",
            description: "Exact text being replaced, verbatim from that paragraph.",
          },
          suggestedText: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["paragraphIndex", "originalText", "suggestedText", "rationale"],
        additionalProperties: false,
      },
    },
    redlinedText: {
      type: "string",
      description:
        "The full contract text with every proposed change inserted inline as [REDLINE: replacement text] immediately after the original wording.",
    },
  },
  required: ["riskLevel", "summary", "risks", "redlines", "redlinedText"],
  additionalProperties: false,
};

const REVIEW_SYSTEM_PROMPT = `You are a senior contract attorney performing a first-pass review for a small law firm (1-25 lawyers). You review English-language commercial agreements.

Your job:
1. Identify the concrete risks in the agreement — uncapped liability, broad indemnities, one-sided termination, IP assignment overreach, auto-renewal traps, missing limitation periods, unclear payment terms, and similar. Estimate a plausible USD exposure for each risk (0 if genuinely unquantifiable) and give a concise, actionable recommendation.
2. Propose specific redlines. Each redline must quote the exact original wording from a single numbered paragraph and give replacement wording a lawyer could accept as-is, plus a one-or-two-sentence rationale.
3. Produce the full redlined text: reproduce the contract and, wherever you propose a change, keep the original wording and insert the replacement immediately after it in the form [REDLINE: replacement text]. Do not silently rewrite anything else.

Ground rules: only flag genuine issues; do not pad the risk list. Quote originalText verbatim (it is matched mechanically against the document). Keep each originalText under 200 characters by anchoring on the most distinctive span of the clause being changed. This is decision support for a qualified lawyer, not legal advice.`;

export function splitIntoParagraphs(text: string): AnalysisParagraph[] {
  return text
    .split(/\r?\n+/)
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map((part, index) => ({ index, text: part }));
}

function clampRiskLevel(value: unknown): "low" | "medium" | "high" {
  return RISK_LEVELS.includes(value as never) ? (value as "low" | "medium" | "high") : "medium";
}

function sanitizeAnalysis(raw: unknown, fallbackText: string): ContractAnalysis {
  const data = (raw ?? {}) as Record<string, unknown>;

  const risks: ContractRisk[] = Array.isArray(data.risks)
    ? (data.risks as Array<Record<string, unknown>>).map(risk => ({
        level: clampRiskLevel(risk.level),
        issue: String(risk.issue ?? "Unspecified risk"),
        exposureEstimate: Number.isFinite(Number(risk.exposureEstimate))
          ? Math.max(0, Number(risk.exposureEstimate))
          : 0,
        recommendation: String(risk.recommendation ?? ""),
        clauseExcerpt: String(risk.clauseExcerpt ?? ""),
      }))
    : [];

  const redlines: ContractRedline[] = Array.isArray(data.redlines)
    ? (data.redlines as Array<Record<string, unknown>>).map(redline => ({
        paragraphIndex: Number.isInteger(Number(redline.paragraphIndex))
          ? Number(redline.paragraphIndex)
          : -1,
        originalText: String(redline.originalText ?? ""),
        suggestedText: String(redline.suggestedText ?? ""),
        rationale: String(redline.rationale ?? ""),
      }))
    : [];

  const redlinedText =
    typeof data.redlinedText === "string" && data.redlinedText.trim().length > 0
      ? data.redlinedText
      : fallbackText;

  return {
    riskLevel: clampRiskLevel(data.riskLevel),
    summary: String(data.summary ?? ""),
    risks,
    redlines,
    redlinedText,
  };
}

export async function analyzeContract(
  input: { text: string } | { paragraphs: AnalysisParagraph[] }
): Promise<ContractAnalysis> {
  const paragraphs =
    "paragraphs" in input
      ? input.paragraphs.filter(p => p.text.trim().length > 0)
      : splitIntoParagraphs(input.text);

  if (paragraphs.length === 0) {
    throw new LlmError("The document contains no readable text to review.");
  }

  let numbered = paragraphs.map(p => `[${p.index}] ${p.text}`).join("\n\n");
  let truncated = false;
  if (numbered.length > MAX_ANALYSIS_CHARS) {
    numbered = numbered.slice(0, MAX_ANALYSIS_CHARS);
    truncated = true;
  }

  const plainText = paragraphs.map(p => p.text).join("\n\n");

  const userPrompt = `Review the contract below. Paragraphs are numbered [index] for reference — use those indexes in the redlines you return.${
    truncated ? " NOTE: the document was truncated for length; review what is shown." : ""
  }\n\n${numbered}`;

  const response = await completeLlm({
    system: REVIEW_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    jsonSchema: ANALYSIS_SCHEMA,
    maxTokens: 64000,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.text);
  } catch (error) {
    throw new LlmError("The AI review returned malformed output — please retry.", {
      retryable: true,
      cause: error,
    });
  }

  return sanitizeAnalysis(parsed, plainText);
}

/** Extract plain text from an uploaded file. Supports .txt/.md, .docx and .pdf. */
export async function extractTextFromUpload(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const lowerName = fileName.toLowerCase();
  const mime = (mimeType ?? "").toLowerCase();

  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mime === "application/pdf" || lowerName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy().catch(() => {});
    }
  }

  if (mime === "application/msword" || lowerName.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files are not supported — save the document as .docx and upload again."
    );
  }

  if (
    mime.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    mime === ""
  ) {
    return buffer.toString("utf8").trim();
  }

  throw new Error(`Unsupported file type "${mimeType}". Upload a .pdf, .docx or .txt file.`);
}

export function totalExposureOf(risks: ContractRisk[]): number {
  return risks.reduce((sum, risk) => sum + risk.exposureEstimate, 0);
}

/**
 * Run the AI review for a stored contract and persist the results
 * (riskAlerts rows + redlinedText/riskLevel/totalExposure/reviewProgress).
 * Designed to run in the background after upload — never throws.
 */
export async function runContractReview(contractId: number, text: string): Promise<void> {
  try {
    await db.updateContract(contractId, { reviewProgress: 10 });

    const analysis = await analyzeContract({ text });

    for (const risk of analysis.risks) {
      await db.createRiskAlert({
        contractId,
        level: risk.level,
        issue: risk.clauseExcerpt ? `${risk.issue} — "${risk.clauseExcerpt}"` : risk.issue,
        exposure: risk.exposureEstimate.toFixed(2),
        recommendation: risk.recommendation,
        status: "open",
      });
    }

    await db.updateContract(contractId, {
      redlinedText: analysis.redlinedText,
      analysisSummary: analysis.summary,
      riskLevel: analysis.riskLevel,
      totalExposure: totalExposureOf(analysis.risks).toFixed(2),
      reviewProgress: 100,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[contractAnalysis] Review failed for contract ${contractId}:`, message);
    await db
      .updateContract(contractId, {
        analysisSummary: `AI review failed: ${message}`,
        reviewProgress: 0,
      })
      .catch(persistError =>
        console.error("[contractAnalysis] Could not record failure:", persistError)
      );
  }
}
