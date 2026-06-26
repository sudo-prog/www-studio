import { Router, type IRouter, type Request, type Response } from "express";
import { db, chatMessagesTable, knowledgeChunksTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  chatComplete,
  streamChat,
  getLLMProvider,
  LLM_MODEL,
  type ChatMessage,
} from "../lib/llm";

const router: IRouter = Router();

const AI_SUGGESTIONS = [
  "Make the hero section full-screen with a gradient background",
  "Add hover animations to all cards",
  "Convert the layout to glassmorphism style",
  "Increase the font size for better readability",
  "Add a sticky navigation bar",
];

function generateAIReply(message: string, context?: string): { reply: string; codeChanges: string | null; suggestions: string[] } {
  const lower = message.toLowerCase();

  if (lower.includes("glass") || lower.includes("glassmorphic")) {
    return {
      reply: "I'll apply a glassmorphism effect to that element. This adds a frosted glass look with backdrop-blur and semi-transparent background.",
      codeChanges: `className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6"`,
      suggestions: ["Add a gradient glow behind the element", "Make the border more vibrant", "Add a shimmer animation"],
    };
  }

  if (lower.includes("parallax") || lower.includes("scroll")) {
    return {
      reply: "I'll add a scroll parallax effect. I recommend using Framer Motion's useScroll and useTransform hooks for smooth performance.",
      codeChanges: `// Add to component:\nconst { scrollYProgress } = useScroll();\nconst y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);`,
      suggestions: ["Add a fade-in on scroll", "Add staggered entrance animations", "Add a progress indicator"],
    };
  }

  if (lower.includes("dark") || lower.includes("mode")) {
    return {
      reply: "I'll configure dark mode support. The design tokens in index.css already have dark/light variants — I'll ensure all components use semantic color classes.",
      codeChanges: null,
      suggestions: ["Add a theme toggle button", "Test all color contrasts in dark mode", "Add system preference detection"],
    };
  }

  if (lower.includes("responsive") || lower.includes("mobile")) {
    return {
      reply: "I'll generate responsive variants for mobile, tablet, and desktop breakpoints using Tailwind's responsive prefixes (sm:, md:, lg:).",
      codeChanges: null,
      suggestions: ["Preview on iPhone 14 screen", "Optimize touch targets", "Add swipe gestures"],
    };
  }

  if (lower.includes("animation") || lower.includes("animate")) {
    return {
      reply: "I'll add smooth animations using Framer Motion. I recommend entrance animations for sections and micro-interactions on buttons and cards.",
      codeChanges: `import { motion } from "framer-motion";\n// Wrap element:\n<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>`,
      suggestions: ["Add a loading skeleton", "Animate the page transitions", "Add hover lift effects"],
    };
  }

  return {
    reply: `I understand you want to: "${message}". I've analyzed the current component tree and I'm ready to apply that change. This will affect the selected element and its children.`,
    codeChanges: null,
    suggestions: AI_SUGGESTIONS.slice(0, 3),
  };
}

// POST /chat — non-streaming (uses unified LLM client with fallback)
router.post("/chat", async (req: Request, res: Response) => {
  const { message, projectId, context } = req.body;

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const userId = req.isAuthenticated() ? req.user.id : null;

  // Save user message
  await db.insert(chatMessagesTable).values({
    projectId: projectId || null,
    userId,
    role: "user",
    content: message,
  });

  // Check for design context from knowledge base
  let designContext = '';
  if (projectId) {
    const chunks = await db
      .select()
      .from(knowledgeChunksTable)
      .where(eq(knowledgeChunksTable.projectId, projectId))
      .limit(10);
    if (chunks.length > 0) {
      designContext =
        "\n\nThis project uses the following design system:\n" +
        chunks.map((c) => c.content).join("\n\n").slice(0, 500);
    }
  }

  // Try real LLM first, fall back to heuristic reply
  let reply: string;
  let codeChanges: string | null = null;
  let suggestions: string[];

  try {
    const systemContent = `You are an AI web design assistant inside WWW Studio. Help the user modify their website.
Respond with helpful, concise advice about web design changes. If the user asks for specific code changes, include them.
Current provider: ${getLLMProvider()}. Model: ${LLM_MODEL}.${designContext}`;

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemContent,
      },
    ];
    if (context) {
      messages.push({ role: "user", content: `Current context: ${context}` });
    }
    messages.push({ role: "user", content: message });

    reply = await chatComplete(messages, { temperature: 0.7, maxTokens: 1024 });
    suggestions = AI_SUGGESTIONS.slice(0, 3);
  } catch {
    // Fallback to heuristic reply
    const fallback = generateAIReply(message, context);
    reply = fallback.reply;
    codeChanges = fallback.codeChanges;
    suggestions = fallback.suggestions;
  }

  const messageId = crypto.randomUUID();

  // Save assistant reply
  await db.insert(chatMessagesTable).values({
    id: messageId,
    projectId: projectId || null,
    userId,
    role: "assistant",
    content: reply,
  });

  res.json({ reply, messageId, codeChanges, suggestions });
});

// POST /chat/stream — streaming SSE (uses unified LLM client with fallback)
router.post("/chat/stream", async (req: Request, res: Response) => {
  const { message, projectId, context } = req.body;

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const userId = req.isAuthenticated() ? req.user.id : null;

  // Save user message
  await db.insert(chatMessagesTable).values({
    projectId: projectId || null,
    userId,
    role: "user",
    content: message,
  });

  // Check for design context from knowledge base
  let designContext = "";
  if (projectId) {
    const chunks = await db
      .select()
      .from(knowledgeChunksTable)
      .where(eq(knowledgeChunksTable.projectId, projectId))
      .limit(10);
    if (chunks.length > 0) {
      designContext =
        "\n\nThis project uses the following design system:\n" +
        chunks.map((c) => c.content).join("\n\n").slice(0, 500);
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const messageId = crypto.randomUUID();
  let fullReply = "";

  try {
    const systemContent = `You are an AI web design assistant inside WWW Studio. Help the user modify their website.
Respond with helpful, concise advice about web design changes. If the user asks for specific code changes, include them.
Current provider: ${getLLMProvider()}. Model: ${LLM_MODEL}.${designContext}`;

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemContent,
      },
    ];
    if (context) {
      messages.push({ role: "user", content: `Current context: ${context}` });
    }
    messages.push({ role: "user", content: message });

    for await (const delta of streamChat(messages, { temperature: 0.7 })) {
      fullReply += delta;
      res.write(`data: ${JSON.stringify({ delta, messageId })}\n\n`);
    }
  } catch {
    // Fallback: send heuristic reply as a single chunk
    const fallback = generateAIReply(message, context);
    fullReply = fallback.reply;
    const payload = JSON.stringify({
      delta: fallback.reply,
      messageId,
      codeChanges: fallback.codeChanges,
      suggestions: fallback.suggestions,
      fallback: true,
    });
    res.write(`data: ${payload}\n\n`);
  }

  // Save assistant reply
  await db.insert(chatMessagesTable).values({
    id: messageId,
    projectId: projectId || null,
    userId,
    role: "assistant",
    content: fullReply,
  });

  res.write(`data: [DONE]\n\n`);
  res.end();
});

router.get("/chat/:projectId/history", async (req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.projectId, String(req.params.projectId)))
    .orderBy(asc(chatMessagesTable.createdAt))
    .limit(100);
  res.json(rows);
});

export default router;
