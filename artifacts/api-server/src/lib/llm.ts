/**
 * Unified LLM client — works with Ollama, OpenRouter, LM Studio, OpenAI, or any
 * OpenAI-compatible endpoint.
 *
 * Configure via environment variables:
 *   LLM_BASE_URL      default: http://localhost:11434/v1  (Ollama)
 *   LLM_API_KEY       default: "ollama"  (Ollama ignores the key)
 *   LLM_MODEL         default: "llama3.2"
 *   LLM_VISION_MODEL  default: LLM_MODEL  (use a vision-capable model for screenshot-to-code)
 *
 * Quick-start examples:
 *   Ollama (local):       LLM_BASE_URL=http://localhost:11434/v1  LLM_MODEL=llama3.2
 *   OpenRouter (free):    LLM_BASE_URL=https://openrouter.ai/api/v1  LLM_API_KEY=sk-or-...
 *                         LLM_MODEL=meta-llama/llama-3.3-70b-instruct:free
 *   LM Studio:            LLM_BASE_URL=http://localhost:1234/v1  LLM_MODEL=<your-model>
 *   OpenAI:               LLM_API_KEY=sk-...  LLM_MODEL=gpt-4o-mini
 */

import OpenAI from "openai";

export const LLM_BASE_URL    = process.env.LLM_BASE_URL    ?? "http://localhost:11434/v1";
export const LLM_API_KEY     = process.env.LLM_API_KEY     ?? "ollama";
export const LLM_MODEL       = process.env.LLM_MODEL       ?? "llama3.2";
export const LLM_VISION_MODEL = process.env.LLM_VISION_MODEL ?? LLM_MODEL;

export const llm = new OpenAI({
  baseURL: LLM_BASE_URL,
  apiKey:  LLM_API_KEY,
  ...(process.env.OPENROUTER_REFERER
    ? { defaultHeaders: { "HTTP-Referer": process.env.OPENROUTER_REFERER, "X-Title": "WWW Studio" } }
    : {}),
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getLLMProvider(): string {
  if (LLM_BASE_URL.includes("openrouter")) return "OpenRouter";
  if (LLM_BASE_URL.includes("openai.com")) return "OpenAI";
  if (LLM_BASE_URL.includes("localhost:11434")) return "Ollama";
  if (LLM_BASE_URL.includes("localhost:1234")) return "LM Studio";
  return "Custom";
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
