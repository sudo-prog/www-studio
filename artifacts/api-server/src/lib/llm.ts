/**
 * Unified LLM client — works with Gemini Web2API, OpenRouter, Ollama, LM Studio, OpenAI,
 * or any OpenAI-compatible endpoint.
 *
 * DEFAULT: Gemini Web2API (local proxy at localhost:8081)
 * FALLBACK: OpenRouter (free tier: openrouter/free)
 *
 * Configure via environment variables:
 *   LLM_BASE_URL      default: http://localhost:8081/v1  (Gemini Web2API)
 *   LLM_API_KEY       default: "gemini-web2api"
 *   LLM_MODEL         default: "gemini-3.5-flash"
 *   LLM_VISION_MODEL  default: LLM_MODEL
 *
 * Quick-start examples:
 *   Gemini Web2API (default): LLM_BASE_URL=http://localhost:8081/v1  LLM_MODEL=gemini-3.5-flash
 *   OpenRouter (free):        LLM_BASE_URL=https://openrouter.ai/api/v1  LLM_API_KEY=sk-or-...
 *                             LLM_MODEL=openrouter/free
 *   Ollama (local):           LLM_BASE_URL=http://localhost:11434/v1  LLM_MODEL=llama3.2
 *   OpenAI:                   LLM_API_KEY=sk-...  LLM_MODEL=gpt-4o-mini
 */

import OpenAI from "openai";

export const LLM_BASE_URL    = process.env.LLM_BASE_URL    ?? "http://localhost:8081/v1";
export const LLM_API_KEY     = process.env.LLM_API_KEY     ?? "gemini-web2api";
export const LLM_MODEL       = process.env.LLM_MODEL       ?? "gemini-3.5-flash";
export const LLM_VISION_MODEL = process.env.LLM_VISION_MODEL ?? LLM_MODEL;

export const llm = new OpenAI({
  baseURL: LLM_BASE_URL,
  apiKey:  LLM_API_KEY,
  ...(process.env.OPENROUTER_REFERER
    ? { defaultHeaders: { "HTTP-Referer": process.env.OPENROUTER_REFERER, "X-Title": "WWW Studio" } }
    : {}),
});

// ── OpenRouter fallback client ──────────────────────────────────────────────────
let _openrouterClient: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  if (!_openrouterClient) {
    _openrouterClient = new OpenAI({
      baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
      apiKey:  process.env.OPENROUTER_API_KEY ?? "",
      defaultHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "https://www-studio.vercel.app",
        "X-Title": "WWW Studio",
      },
    });
  }
  return _openrouterClient;
}

/** Check whether OpenRouter is configured and reachable. */
export async function isOpenRouterReachable(): Promise<boolean> {
  if (!process.env.OPENROUTER_API_KEY) return false;
  try {
    const client = getOpenRouterClient();
    await Promise.race([
      client.models.list(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

// ── Gemini Web2API proxy ──────────────────────────────────────────────────────

export const GEMINI_WEB2API_BASE_URL = process.env.GEMINI_WEB2API_BASE_URL ?? "http://localhost:8081/v1";
export const GEMINI_WEB2API_MODEL     = process.env.GEMINI_WEB2API_MODEL     ?? "gemini-3.5-flash";

let _geminiClient: OpenAI | null = null;

/** Get (or lazily create) an OpenAI client pointed at the gemini-web2api proxy. */
export function getGeminiWeb2APIClient(): OpenAI {
  if (!_geminiClient) {
    _geminiClient = new OpenAI({
      baseURL: GEMINI_WEB2API_BASE_URL,
      apiKey:  process.env.GEMINI_WEB2API_API_KEY ?? "gemini-web2api",
    });
  }
  return _geminiClient;
}

/** Check whether the Gemini Web2API proxy is reachable. */
export async function isGeminiWeb2APIReachable(): Promise<boolean> {
  try {
    const client = getGeminiWeb2APIClient();
    await Promise.race([
      client.models.list(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getLLMProvider(): string {
  if (LLM_BASE_URL.includes("openrouter")) return "OpenRouter";
  if (LLM_BASE_URL.includes("openai.com")) return "OpenAI";
  if (LLM_BASE_URL.includes("localhost:11434")) return "Ollama";
  if (LLM_BASE_URL.includes("localhost:1234")) return "LM Studio";
  if (LLM_BASE_URL.includes("localhost:8081") || LLM_BASE_URL.includes("gemini")) return "Gemini Web2API";
  return "Custom";
}

/**
 * Try the primary LLM first, fall back to OpenRouter if available.
 * Returns { content, provider } with the provider that succeeded.
 */
export async function chatCompleteWithFallback(
  messages: ChatMessage[],
  opts: {
    model?:       string;
    temperature?: number;
    maxTokens?:   number;
    jsonMode?:    boolean;
  } = {},
): Promise<{ content: string; provider: string }> {
  try {
    const content = await chatComplete(messages, opts);
    return { content, provider: getLLMProvider() };
  } catch (primaryErr) {
    // Try OpenRouter fallback
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const client = getOpenRouterClient();
        const res = await client.chat.completions.create({
          model:       process.env.OPENROUTER_FALLBACK_MODEL ?? "openrouter/free",
          messages,
          temperature: opts.temperature ?? 0.7,
          max_tokens:  opts.maxTokens   ?? 2048,
          ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
        });
        const content = res.choices[0]?.message?.content ?? "";
        return { content, provider: "OpenRouter (fallback)" };
      } catch {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}

/** One-shot completion → full response text */
export async function chatComplete(
  messages: ChatMessage[],
  opts: {
    model?:       string;
    temperature?: number;
    maxTokens?:   number;
    jsonMode?:    boolean;
  } = {},
): Promise<string> {
  const res = await llm.chat.completions.create({
    model:       opts.model       ?? LLM_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens:  opts.maxTokens   ?? 2048,
    ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
  });
  return res.choices[0]?.message?.content ?? "";
}

/** Streaming chat — yields text deltas as they arrive */
export async function* streamChat(
  messages: ChatMessage[],
  opts: { model?: string; temperature?: number } = {},
): AsyncGenerator<string> {
  const stream = await llm.chat.completions.create({
    model:       opts.model       ?? LLM_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    stream:      true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/** Vision completion for screenshot-to-code */
export async function visionComplete(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  opts: { model?: string } = {},
): Promise<string> {
  const res = await llm.chat.completions.create({
    model:      opts.model ?? LLM_VISION_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "high" } },
          { type: "text", text: prompt },
        ],
      },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

/** Quick health check — returns true if the LLM endpoint responds */
export async function isLLMReachable(): Promise<boolean> {
  try {
    await Promise.race([
      llm.models.list(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return true;
  } catch {
    return false;
  }
}
