// ── Context Compression Middleware (libroom) ─────────────────────────────────
// Compresses conversation history and context to fit within token limits

export interface CompressedMessage {
  role: "system" | "user" | "assistant";
  content: string;
  compressed: boolean;
  originalTokens?: number;
}

export interface CompressionResult {
  messages: CompressedMessage[];
  totalTokens: number;
  compressed: boolean;
}

// ── Rough token estimation ───────────────────────────────────────────────────
export function estimateTokens(text: string): number {
  // Rough heuristic: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
}

// ── Sliding window compression ───────────────────────────────────────────────
export function compressHistory(
  messages: CompressedMessage[],
  maxTokens: number = 8000
): CompressionResult {
  let totalTokens = 0;
  const kept: CompressedMessage[] = [];

  // Always keep system messages
  const systemMsgs = messages.filter((m) => m.role === "system");
  const otherMsgs = messages.filter((m) => m.role !== "system");

  for (const msg of systemMsgs) {
    totalTokens += estimateTokens(msg.content);
    kept.push(msg);
  }

  // Keep most recent messages that fit
  for (let i = otherMsgs.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(otherMsgs[i].content);
    if (totalTokens + tokens <= maxTokens) {
      totalTokens += tokens;
      kept.splice(systemMsgs.length, 0, otherMsgs[i]);
    } else {
      // Compress the oldest message that doesn't fit
      if (kept.length === systemMsgs.length) {
        const summary = summarizeContent(otherMsgs[i].content);
        const compressed: CompressedMessage = {
          ...otherMsgs[i],
          content: summary,
          compressed: true,
          originalTokens: tokens,
        };
        kept.splice(systemMsgs.length, 0, compressed);
        totalTokens += estimateTokens(summary);
      }
      break;
    }
  }

  return { messages: kept, totalTokens, compressed: kept.length < messages.length };
}

// ── Content summarization ────────────────────────────────────────────────────
export function summarizeContent(content: string, maxLen: number = 200): string {
  if (content.length <= maxLen) return content;

  // Take first sentence + last sentence as summary
  const firstSentence = content.match(/^[^.!?]+[.!?]/)?.[0] ?? content.slice(0, 80);
  const lastSentence = content.match(/[.!?][^.!?]*$/)?.[0] ?? content.slice(-80);

  const summary = firstSentence.length + lastSentence.length + 10 < maxLen
    ? `${firstSentence} ${lastSentence}`
    : `${firstSentence}...`;

  return `[Compressed] ${summary}`;
}

// ── Context window builder ───────────────────────────────────────────────────
export function buildContextWindow(
  systemPrompt: string,
  history: { role: string; content: string }[],
  currentUserMessage: string,
  maxContextTokens: number = 12000
): { messages: CompressedMessage[]; tokens: number } {
  const allMessages: CompressedMessage[] = [
    { role: "system", content: systemPrompt, compressed: false },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      compressed: false,
    })),
    { role: "user", content: currentUserMessage, compressed: false },
  ];

  const result = compressHistory(allMessages, maxContextTokens);
  return { messages: result.messages, tokens: result.totalTokens };
}

// ── RAG context injection ────────────────────────────────────────────────────
export function injectRagContext(
  query: string,
  relevantChunks: { content: string; score: number }[],
  maxContextChars: number = 3000
): string {
  if (relevantChunks.length === 0) return "";

  let context = "\n\n## Relevant Knowledge:\n";
  let currentLen = context.length;

  for (const chunk of relevantChunks) {
    const addition = `\n- ${chunk.content.slice(0, 300)}`;
    if (currentLen + addition.length > maxContextChars) break;
    context += addition;
    currentLen += addition.length;
  }

  return context;
}
