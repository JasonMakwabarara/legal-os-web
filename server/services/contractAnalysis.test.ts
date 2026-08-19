import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./llm", async importOriginal => {
  const actual = await importOriginal<typeof import("./llm")>();
  return { ...actual, completeLlm: vi.fn() };
});

import { completeLlm } from "./llm";
import {
  analyzeContract,
  extractTextFromUpload,
  splitIntoParagraphs,
  totalExposureOf,
} from "./contractAnalysis";

const completeLlmMock = vi.mocked(completeLlm);

const validAnalysis = {
  riskLevel: "high",
  summary: "One-sided supplier agreement.",
  risks: [
    {
      level: "high",
      issue: "Unlimited liability",
      exposureEstimate: 500000,
      recommendation: "Cap at 12 months of fees",
      clauseExcerpt: "liability shall be unlimited",
    },
    {
      level: "medium",
      issue: "Auto-renewal",
      exposureEstimate: 25000,
      recommendation: "Add 60-day opt-out notice",
      clauseExcerpt: "renews automatically",
    },
  ],
  redlines: [
    {
      paragraphIndex: 1,
      originalText: "liability shall be unlimited",
      suggestedText: "liability shall not exceed fees paid in the preceding 12 months",
      rationale: "Uncapped exposure is unacceptable for a firm this size.",
    },
  ],
  redlinedText: "Clause 1... liability shall be unlimited [REDLINE: liability shall not exceed fees paid in the preceding 12 months]",
};

beforeEach(() => {
  completeLlmMock.mockReset();
});

describe("splitIntoParagraphs", () => {
  it("splits on newlines, trims, and indexes sequentially", () => {
    const result = splitIntoParagraphs("First clause.\n\n  Second clause.  \r\n\r\nThird.");
    expect(result).toEqual([
      { index: 0, text: "First clause." },
      { index: 1, text: "Second clause." },
      { index: 2, text: "Third." },
    ]);
  });

  it("returns an empty list for whitespace-only text", () => {
    expect(splitIntoParagraphs("  \n \r\n ")).toEqual([]);
  });
});

describe("analyzeContract", () => {
  it("sends a numbered prompt with the schema and returns the parsed analysis", async () => {
    completeLlmMock.mockResolvedValue({
      text: JSON.stringify(validAnalysis),
      model: "claude-sonnet-5",
      stopReason: "end_turn",
    });

    const analysis = await analyzeContract({
      text: "Preamble.\nThe Supplier's liability shall be unlimited.",
    });

    expect(analysis.riskLevel).toBe("high");
    expect(analysis.risks).toHaveLength(2);
    expect(analysis.redlines[0].paragraphIndex).toBe(1);
    expect(analysis.redlinedText).toContain("[REDLINE:");

    const request = completeLlmMock.mock.calls[0][0];
    expect(request.jsonSchema).toBeDefined();
    expect(request.system).toContain("contract attorney");
    expect(request.messages[0].content).toContain("[0] Preamble.");
    expect(request.messages[0].content).toContain("[1] The Supplier's liability shall be unlimited.");
  });

  it("accepts pre-chunked paragraphs (the Word add-in path)", async () => {
    completeLlmMock.mockResolvedValue({
      text: JSON.stringify(validAnalysis),
      model: "claude-sonnet-5",
      stopReason: "end_turn",
    });

    await analyzeContract({
      paragraphs: [
        { index: 0, text: "Recitals" },
        { index: 4, text: "Liability is unlimited." },
      ],
    });

    const request = completeLlmMock.mock.calls[0][0];
    expect(request.messages[0].content).toContain("[4] Liability is unlimited.");
  });

  it("sanitizes malformed field values instead of crashing", async () => {
    completeLlmMock.mockResolvedValue({
      text: JSON.stringify({
        riskLevel: "catastrophic",
        summary: 42,
        risks: [{ level: "??", issue: "x", exposureEstimate: "not-a-number", recommendation: 1, clauseExcerpt: null }],
        redlines: [{ paragraphIndex: "seven", originalText: 0, suggestedText: 1, rationale: 2 }],
        redlinedText: "",
      }),
      model: "claude-sonnet-5",
      stopReason: "end_turn",
    });

    const analysis = await analyzeContract({ text: "Some clause text." });

    expect(analysis.riskLevel).toBe("medium");
    expect(analysis.risks[0].level).toBe("medium");
    expect(analysis.risks[0].exposureEstimate).toBe(0);
    expect(analysis.redlines[0].paragraphIndex).toBe(-1);
    // Empty redlinedText falls back to the original document text.
    expect(analysis.redlinedText).toBe("Some clause text.");
  });

  it("throws a retryable LlmError on malformed JSON", async () => {
    completeLlmMock.mockResolvedValue({
      text: "not json at all",
      model: "claude-sonnet-5",
      stopReason: "end_turn",
    });

    const error = await analyzeContract({ text: "Clause." }).catch(e => e);
    expect(error.name).toBe("LlmError");
    expect(error.retryable).toBe(true);
  });

  it("rejects documents with no readable text", async () => {
    await expect(analyzeContract({ text: "   \n  " })).rejects.toThrow("no readable text");
    expect(completeLlmMock).not.toHaveBeenCalled();
  });
});

describe("extractTextFromUpload", () => {
  it("decodes plain text files", async () => {
    const text = await extractTextFromUpload(
      Buffer.from("Hello agreement\n", "utf8"),
      "contract.txt",
      "text/plain"
    );
    expect(text).toBe("Hello agreement");
  });

  it("rejects legacy .doc files with guidance", async () => {
    await expect(
      extractTextFromUpload(Buffer.from(""), "old.doc", "application/msword")
    ).rejects.toThrow(".docx");
  });

  it("rejects unknown binary types", async () => {
    await expect(
      extractTextFromUpload(Buffer.from(""), "img.png", "image/png")
    ).rejects.toThrow("Unsupported file type");
  });
});

describe("totalExposureOf", () => {
  it("sums exposure estimates", () => {
    expect(
      totalExposureOf([
        { level: "high", issue: "a", exposureEstimate: 100, recommendation: "", clauseExcerpt: "" },
        { level: "low", issue: "b", exposureEstimate: 50.5, recommendation: "", clauseExcerpt: "" },
      ])
    ).toBe(150.5);
  });
});
