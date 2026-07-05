import { Router, type IRouter, type Request, type Response } from "express";
import {
  chatComplete,
  streamChat,
  getLLMProvider,
  LLM_MODEL,
  type ChatMessage,
} from "../lib/llm";

const router: IRouter = Router();

/**
 * POST /api/ai/chat — Vercel serverless proxy for AI chat
 * Primary: Gemini Web2API (no API key needed)
 * Fallback: OpenRouter (requires OPENROUTER_API_KEY)
 * This endpoint is used by FreeformAIChat.tsx in the frontend
 */
router.post("/ai/chat", async (req: Request, res: Response) => {
  const { messages, systemContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const systemContent = systemContext
    ? `You are an AI design assistant. ${systemContext}`
    : `You are an AI design assistant for a freeform canvas editor. The canvas is 1440x900px.
Help with element placement, design suggestions, and creative ideas. Be concise and actionable.`;

  const chatMessages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const content = await chatComplete(chatMessages, {
      temperature: 0.7,
      maxTokens: 1024,
    });
    res.json({ content, model: LLM_MODEL, provider: getLLMProvider() });
  } catch (err) {
    // Local AI fallback for when no LLM is configured
    res.json({
      content: `I'm your canvas AI assistant! I can help you add elements, apply designs, and suggest improvements. Currently offline — try: "Add floating shapes", "Create a hero section", "Make it more minimal"`,
      model: "local-fallback",
      provider: "Local AI",
    });
  }
});

/**
 * POST /api/ai/chat/stream — Streaming version
 */
router.post("/ai/chat/stream", async (req: Request, res: Response) => {
  const { messages, systemContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const systemContent = systemContext
    ? `You are an AI design assistant. ${systemContext}`
    : `You are an AI design assistant for a freeform canvas editor.`;

  const chatMessages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    for await (const delta of streamChat(chatMessages, { temperature: 0.7 })) {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    res.write(
      `data: ${JSON.stringify({
        delta: `I'm your canvas AI assistant! I can help you add elements, apply designs, and suggest improvements. Currently offline — try: "Add floating shapes", "Create a hero section", "Make it more minimal"`,
        done: true,
      })}\n\n`,
    );
    res.end();
  }
});

export default router;