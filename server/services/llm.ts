import Anthropic from "@anthropic-ai/sdk";

/**
 * LLM provider module.
 *
 * Default provider is the official Anthropic SDK with `claude-sonnet-5`
 * (override with LLM_MODEL; e.g. `claude-opus-5` for Enterprise tenants).
 *
 * Set LLM_PROVIDER=openai_compatible plus LLM_BASE_URL / LLM_API_KEY /
 * LLM_MODEL to route through any OpenAI-compatible endpoint instead
 * (BytePlus ModelArk / DeepSeek, and later the SpiderNet inference plane).
 */

export type LlmChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  system?: string;
  messages: LlmChatMessage[];
  /** Hard cap on generated tokens. Defaults to 16000; long outputs stream either way. */
  maxTokens?: number;
  /** JSON Schema — when set the model must return JSON matching it. */
  jsonSchema?: Record<string, unknown>;
};

export type LlmResponse = {
  text: string;
  model: string;
  stopReason: string | null;
};

export class LlmError extends Error {
  readonly retryable: boolean;

  constructor(message: string, options: { retryable?: boolean; cause?: unknown } = {}) {
    super(message);
    this.name = "LlmError";
    this.retryable = options.retryable ?? false;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";

type LlmProvider = "anthropic" | "openai_compatible";

export function getLlmProvider(): LlmProvider {
  return process.env.LLM_PROVIDER === "openai_compatible"
    ? "openai_compatible"
    : "anthropic";
}

export function getLlmModelName(): string {
  const configured = process.env.LLM_MODEL?.trim();
  if (configured) return configured;
  if (getLlmProvider() === "openai_compatible") {
    throw new LlmError("LLM_MODEL is required when LLM_PROVIDER=openai_compatible");
  }
  return DEFAULT_ANTHROPIC_MODEL;
}

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new LlmError(
      "ANTHROPIC_API_KEY is not configured. Set it in the server environment to enable AI features."
    );
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

/** Test hook: reset the memoized client (e.g. after changing env vars). */
export function resetLlmClientForTests() {
  anthropicClient = null;
}

async function completeWithAnthropic(request: LlmRequest): Promise<LlmResponse> {
  const client = getAnthropicClient();
  const model = getLlmModelName();

  try {
    // Streaming keeps long reviews clear of HTTP timeouts; adaptive thinking
    // is the model default on claude-sonnet-5 / claude-opus-5, so no
    // `thinking` parameter is sent (also keeps older models compatible).
    const stream = client.messages.stream({
      model,
      max_tokens: request.maxTokens ?? 16000,
      ...(request.system ? { system: request.system } : {}),
      ...(request.jsonSchema
        ? {
            output_config: {
              format: { type: "json_schema" as const, schema: request.jsonSchema },
            },
          }
        : {}),
      messages: request.messages.map(message => ({
        role: message.role,
        content: message.content,
      })),
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new LlmError("The AI provider declined to process this request.");
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map(block => block.text)
      .join("");

    if (message.stop_reason === "max_tokens" && request.jsonSchema) {
      throw new LlmError(
        "The AI response was truncated before completing — try a shorter document.",
        { retryable: true }
      );
    }

    return { text, model: message.model, stopReason: message.stop_reason };
  } catch (error) {
    if (error instanceof LlmError) throw error;
    if (error instanceof Anthropic.RateLimitError) {
      throw new LlmError(
        "The AI service is rate-limited right now — please retry in a few seconds.",
        { retryable: true, cause: error }
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      throw new LlmError("The configured ANTHROPIC_API_KEY was rejected.", { cause: error });
    }
    if (error instanceof Anthropic.APIConnectionError) {
      throw new LlmError("Could not reach the AI service — please retry.", {
        retryable: true,
        cause: error,
      });
    }
    if (error instanceof Anthropic.APIError) {
      const status = typeof error.status === "number" ? error.status : 0;
      throw new LlmError(`AI request failed (${status || "unknown"}): ${error.message}`, {
        retryable: status >= 500,
        cause: error,
      });
    }
    throw new LlmError(`AI request failed: ${(error as Error).message}`, { cause: error });
  }
}

async function completeWithOpenAiCompatible(request: LlmRequest): Promise<LlmResponse> {
  const baseUrl = (process.env.LLM_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const apiKey = process.env.LLM_API_KEY;
  if (!baseUrl) {
    throw new LlmError("LLM_BASE_URL is required when LLM_PROVIDER=openai_compatible");
  }
  if (!apiKey) {
    throw new LlmError("LLM_API_KEY is required when LLM_PROVIDER=openai_compatible");
  }
  const model = getLlmModelName();

  const body: Record<string, unknown> = {
    model,
    max_tokens: request.maxTokens ?? 16000,
    messages: [
      ...(request.system ? [{ role: "system", content: request.system }] : []),
      ...request.messages,
    ],
  };
  if (request.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "output", strict: true, schema: request.jsonSchema },
    };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new LlmError(`AI request failed (${response.status}): ${detail}`, {
      retryable: response.status === 429 || response.status >= 500,
    });
  }

  const data = (await response.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string }; finish_reason?: string | null }>;
  };
  const choice = data.choices?.[0];

  return {
    text: choice?.message?.content ?? "",
    model: data.model ?? model,
    stopReason: choice?.finish_reason ?? null,
  };
}

/** Single entry point for every LLM call in the product. */
export async function completeLlm(request: LlmRequest): Promise<LlmResponse> {
  if (request.messages.length === 0) {
    throw new LlmError("At least one message is required");
  }
  return getLlmProvider() === "openai_compatible"
    ? completeWithOpenAiCompatible(request)
    : completeWithAnthropic(request);
}
