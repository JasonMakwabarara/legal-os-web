import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeLlm,
  DEFAULT_ANTHROPIC_MODEL,
  getLlmModelName,
  getLlmProvider,
  LlmError,
  resetLlmClientForTests,
} from "./llm";

const ENV_KEYS = ["LLM_PROVIDER", "LLM_MODEL", "LLM_BASE_URL", "LLM_API_KEY", "ANTHROPIC_API_KEY"] as const;
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  resetLlmClientForTests();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  resetLlmClientForTests();
  vi.restoreAllMocks();
});

describe("provider selection", () => {
  it("defaults to anthropic with claude-sonnet-5", () => {
    expect(getLlmProvider()).toBe("anthropic");
    expect(getLlmModelName()).toBe(DEFAULT_ANTHROPIC_MODEL);
    expect(DEFAULT_ANTHROPIC_MODEL).toBe("claude-sonnet-5");
  });

  it("honours LLM_MODEL overrides", () => {
    process.env.LLM_MODEL = "claude-opus-5";
    expect(getLlmModelName()).toBe("claude-opus-5");
  });

  it("selects the OpenAI-compatible driver via LLM_PROVIDER", () => {
    process.env.LLM_PROVIDER = "openai_compatible";
    expect(getLlmProvider()).toBe("openai_compatible");
  });

  it("requires LLM_MODEL for the OpenAI-compatible driver", () => {
    process.env.LLM_PROVIDER = "openai_compatible";
    expect(() => getLlmModelName()).toThrow(LlmError);
  });
});

describe("anthropic driver configuration", () => {
  it("fails fast without ANTHROPIC_API_KEY", async () => {
    await expect(
      completeLlm({ messages: [{ role: "user", content: "hi" }] })
    ).rejects.toMatchObject({ name: "LlmError", message: expect.stringContaining("ANTHROPIC_API_KEY") });
  });

  it("rejects empty message lists", async () => {
    await expect(completeLlm({ messages: [] })).rejects.toThrow("At least one message");
  });
});

describe("openai-compatible driver", () => {
  beforeEach(() => {
    process.env.LLM_PROVIDER = "openai_compatible";
    process.env.LLM_BASE_URL = "https://ark.example.com/api/v3/";
    process.env.LLM_API_KEY = "test-key";
    process.env.LLM_MODEL = "deepseek-v3-1";
  });

  it("posts an OpenAI-shaped body and returns the completion text", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "deepseek-v3-1",
          choices: [{ message: { content: "hello from ark" }, finish_reason: "stop" }],
        }),
        { status: 200 }
      )
    );

    const result = await completeLlm({
      system: "You are terse.",
      messages: [{ role: "user", content: "hi" }],
      jsonSchema: { type: "object", properties: {}, additionalProperties: false, required: [] },
    });

    expect(result.text).toBe("hello from ark");
    expect(result.model).toBe("deepseek-v3-1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://ark.example.com/api/v3/chat/completions");
    const body = JSON.parse(String(init?.body));
    expect(body.model).toBe("deepseek-v3-1");
    expect(body.messages[0]).toEqual({ role: "system", content: "You are terse." });
    expect(body.messages[1]).toEqual({ role: "user", content: "hi" });
    expect(body.response_format.type).toBe("json_schema");
    expect(init?.headers).toMatchObject({ authorization: "Bearer test-key" });
  });

  it("maps 429 responses to a retryable LlmError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("slow down", { status: 429 })
    );

    const error = await completeLlm({ messages: [{ role: "user", content: "hi" }] }).catch(
      e => e
    );
    expect(error).toBeInstanceOf(LlmError);
    expect(error.retryable).toBe(true);
  });

  it("requires LLM_BASE_URL", async () => {
    delete process.env.LLM_BASE_URL;
    await expect(
      completeLlm({ messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow("LLM_BASE_URL");
  });
});
