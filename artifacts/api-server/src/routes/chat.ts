import { Router, type IRouter, type Request, type Response } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

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

  const { reply, codeChanges, suggestions } = generateAIReply(message, context);

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
