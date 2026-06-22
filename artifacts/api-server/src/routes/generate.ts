import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import {
  chatComplete,
  getLLMProvider,
  llm,
  LLM_BASE_URL,
  LLM_MODEL,
  LLM_API_KEY,
  type ChatMessage,
} from "../lib/llm";

const router: IRouter = Router();

const STYLE_KEYWORDS: Record<string, string> = {
  dark: "dark-mode", black: "dark-mode", minimal: "minimal", clean: "minimal",
  glass: "glassmorphism", frosted: "glassmorphism", brutal: "brutalist",
  bold: "brutalist", saas: "linear-style", startup: "stripe-style",
  corporate: "apple-style", enterprise: "apple-style",
};

function detectStyleFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const [kw, style] of Object.entries(STYLE_KEYWORDS)) {
    if (lower.includes(kw)) return style;
  }
  return "minimal";
}

const STYLE_PALETTES: Record<string, string[]> = {
  minimal: ["#ffffff", "#f8f8f8", "#222222", "#666666", "#0066ff"],
  glassmorphism: ["#ffffff33", "#ffffff1a", "#6366f1", "#8b5cf6", "#06b6d4"],
  brutalist: ["#000000", "#ffffff", "#ff0000", "#ffff00", "#0000ff"],
  "dark-mode": ["#0f0f0f", "#1a1a1a", "#ffffff", "#888888", "#6366f1"],
  "apple-style": ["#f5f5f7", "#ffffff", "#1d1d1f", "#6e6e73", "#0066cc"],
  "stripe-style": ["#0a2540", "#00d4ff", "#ffffff", "#635bff", "#f6f9fc"],
  "linear-style": ["#090909", "#1a1a1a", "#ffffff", "#5e6ad2", "#e8e8e8"],
};

function generateTreeFromPrompt(prompt: string, title: string, style: string): string {
  const lower = prompt.toLowerCase();
  const isDark = ["dark", "linear-style", "stripe-style"].includes(style);
  const bg = isDark ? "from-gray-950 to-black" : "from-white to-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200";

  const hasPortfolio = lower.includes("portfolio") || lower.includes("personal");
  const hasPricing = lower.includes("pricing") || lower.includes("plan") || lower.includes("saas");
  const hasTestimonials = lower.includes("testimonial") || lower.includes("review");
  const hasCTA = lower.includes("cta") || lower.includes("signup") || lower.includes("waitlist");

  const sections = [
    {
      type: "section",
      name: "Hero",
      className: `relative min-h-screen flex items-center justify-center bg-gradient-to-br ${bg} overflow-hidden`,
      children: [
        {
          type: "div",
          name: "HeroContent",
          className: "text-center max-w-4xl mx-auto px-6 space-y-6",
          children: [
            { type: "h1", content: title, className: `text-6xl font-bold tracking-tight ${textPrimary}` },
            { type: "p", content: `${prompt.slice(0, 120)}${prompt.length > 120 ? "..." : ""}`, className: `text-xl ${textSecondary} max-w-2xl mx-auto` },
            {
              type: "div",
              name: "CTAButtons",
              className: "flex gap-4 justify-center",
              children: [
                { type: "button", content: "Get Started", className: "px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors" },
                { type: "button", content: "Learn More", className: `px-8 py-3 rounded-full font-semibold border ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-300 text-gray-700 hover:bg-gray-50"} transition-colors` },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "section",
      name: "Features",
      className: `py-24 px-6 ${isDark ? "bg-gray-950" : "bg-white"}`,
      children: [
        {
          type: "div",
          name: "FeaturesGrid",
          className: "max-w-6xl mx-auto",
          children: [
            { type: "h2", content: "Everything you need", className: `text-4xl font-bold text-center mb-4 ${textPrimary}` },
            { type: "p", content: "Powerful features to help you build faster.", className: `text-center ${textSecondary} mb-16 text-lg` },
            {
              type: "div",
              name: "Grid",
              className: "grid grid-cols-1 md:grid-cols-3 gap-8",
              children: [
                { type: "card", name: "Feature 1", className: `p-8 rounded-2xl border ${cardBg}`, children: [
                  { type: "div", name: "Icon", className: "w-10 h-10 rounded-xl bg-blue-600 mb-4" },
                  { type: "h3", content: "Lightning Fast", className: `font-semibold text-lg mb-2 ${textPrimary}` },
                  { type: "p", content: "Built for speed and performance from the ground up.", className: textSecondary },
                ]},
                { type: "card", name: "Feature 2", className: `p-8 rounded-2xl border ${cardBg}`, children: [
                  { type: "div", name: "Icon", className: "w-10 h-10 rounded-xl bg-purple-600 mb-4" },
                  { type: "h3", content: "Fully Flexible", className: `font-semibold text-lg mb-2 ${textPrimary}` },
                  { type: "p", content: "Customize every aspect to match your brand perfectly.", className: textSecondary },
                ]},
                { type: "card", name: "Feature 3", className: `p-8 rounded-2xl border ${cardBg}`, children: [
                  { type: "div", name: "Icon", className: "w-10 h-10 rounded-xl bg-cyan-600 mb-4" },
                  { type: "h3", content: "Secure by Default", className: `font-semibold text-lg mb-2 ${textPrimary}` },
                  { type: "p", content: "Enterprise-grade security and compliance built in.", className: textSecondary },
                ]},
              ],
            },
          ],
        },
      ],
    },
  ];

  if (hasPricing) {
    sections.push({
      type: "section",
      name: "Pricing",
      className: `py-24 px-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`,
      children: [
        {
          type: "div",
          name: "PricingGrid",
          className: "max-w-5xl mx-auto",
          children: [
            { type: "h2", content: "Simple Pricing", className: `text-4xl font-bold text-center mb-16 ${textPrimary}` },
            {
              type: "div",
              name: "Plans",
              className: "grid grid-cols-1 md:grid-cols-3 gap-8",
              children: [
                { type: "card", name: "Starter", className: `p-8 rounded-2xl border ${cardBg}`, children: [
                  { type: "h3", content: "Starter", className: `font-bold text-xl mb-2 ${textPrimary}` },
                  { type: "p", content: "$0/mo", className: "text-3xl font-bold text-blue-600 mb-6" },
                  { type: "button", content: "Get Started", className: "w-full py-2 rounded-lg border border-blue-600 text-blue-600 font-medium" },
                ]},
                { type: "card", name: "Pro", className: "p-8 rounded-2xl border border-blue-600 bg-blue-600", children: [
                  { type: "h3", content: "Pro", className: "font-bold text-xl mb-2 text-white" },
                  { type: "p", content: "$20/mo", className: "text-3xl font-bold text-white mb-6" },
                  { type: "button", content: "Start Free Trial", className: "w-full py-2 rounded-lg bg-white text-blue-600 font-semibold" },
                ]},
                { type: "card", name: "Enterprise", className: `p-8 rounded-2xl border ${cardBg}`, children: [
                  { type: "h3", content: "Enterprise", className: `font-bold text-xl mb-2 ${textPrimary}` },
                  { type: "p", content: "Custom", className: "text-3xl font-bold text-blue-600 mb-6" },
                  { type: "button", content: "Contact Us", className: "w-full py-2 rounded-lg border border-blue-600 text-blue-600 font-medium" },
                ]},
              ],
            },
          ],
        },
      ],
    } as any);
  }

  if (hasTestimonials) {
    sections.push({
      type: "section",
      name: "Testimonials",
      className: `py-24 px-6 ${isDark ? "bg-gray-950" : "bg-white"}`,
      children: [
        { type: "h2", content: "Loved by thousands", className: `text-4xl font-bold text-center mb-16 ${textPrimary}` },
        {
          type: "div",
          name: "TestimonialsGrid",
          className: "max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6",
          children: [
            { type: "card", name: "T1", className: `p-6 rounded-2xl border ${cardBg}`, children: [
              { type: "p", content: '"This product completely changed how we work. Highly recommended!"', className: `${textSecondary} mb-4 italic` },
              { type: "p", content: "— Sarah K., Founder", className: `text-sm font-semibold ${textPrimary}` },
            ]},
            { type: "card", name: "T2", className: `p-6 rounded-2xl border ${cardBg}`, children: [
              { type: "p", content: '"Best investment we made this year. The results speak for themselves."', className: `${textSecondary} mb-4 italic` },
              { type: "p", content: "— Marcus J., CTO", className: `text-sm font-semibold ${textPrimary}` },
            ]},
            { type: "card", name: "T3", className: `p-6 rounded-2xl border ${cardBg}`, children: [
              { type: "p", content: '"Incredible support and a product that just works. 10/10."', className: `${textSecondary} mb-4 italic` },
              { type: "p", content: "— Priya M., Product Lead", className: `text-sm font-semibold ${textPrimary}` },
            ]},
          ],
        },
      ],
    } as any);
  }

  sections.push({
    type: "section",
    name: "Footer",
    className: `py-12 border-t ${isDark ? "border-white/10 bg-gray-950" : "border-gray-200 bg-white"}`,
    children: [
      { type: "p", content: `© ${new Date().getFullYear()} ${title}. All rights reserved.`, className: `text-center text-sm ${textSecondary}` },
    ],
  } as any);

  return JSON.stringify({ type: "page", name: title, prompt, children: sections }, null, 2);
}

async function generateWithLLM(prompt: string, title: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a web design AI. Given a prompt, return a JSON component tree for a beautiful website.
The tree must be valid JSON with this shape:
{
  "type": "page",
  "name": "string",
  "prompt": "string",
  "children": [ ...sections ]
}
Each section/child: { "type": "section"|"div"|"h1"|"h2"|"p"|"button"|"card", "name": "string", "content": "string (for text nodes)", "className": "tailwind classes", "children": [...] }
Use Tailwind CSS classes. Return ONLY the JSON, no markdown, no explanation.`,
    },
    {
      role: "user",
      content: `Create a beautiful website for: "${prompt}"\nPage title: "${title}"`,
    },
  ];

  const raw = await chatComplete(messages, { model: LLM_MODEL, maxTokens: 3000 });
  JSON.parse(raw); // validate
  return raw;
}

router.post("/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const words = prompt.trim().split(/\s+/).slice(0, 5).join(" ");
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  const detectedStyle = detectStyleFromPrompt(prompt);
  const colors = STYLE_PALETTES[detectedStyle] ?? STYLE_PALETTES.minimal;

  let componentTree: string;

  // Try the unified LLM client if an API key is configured or the base URL is reachable
  const provider = getLLMProvider();
  const hasApiKey = !!LLM_API_KEY && LLM_API_KEY !== "ollama";
  const isLocalProxy = LLM_BASE_URL.includes("localhost") || LLM_BASE_URL.includes("127.0.0.1");

  if (hasApiKey || isLocalProxy) {
    try {
      componentTree = await generateWithLLM(prompt, title);
    } catch {
      componentTree = generateTreeFromPrompt(prompt, title, detectedStyle);
    }
  } else {
    componentTree = generateTreeFromPrompt(prompt, title, detectedStyle);
  }

  let projectId: string | undefined;
  if (req.isAuthenticated()) {
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const [newProject] = await db
      .insert(projectsTable)
      .values({
        userId: req.user.id,
        name: title,
        slug,
        componentTree,
        status: "draft",
      })
      .returning();
    projectId = newProject.id;
  } else {
    projectId = "preview-" + Date.now();
  }

  res.json({ projectId, componentTree, title, detectedStyle, colors });
});

// POST /generate-image
router.post("/generate-image", async (req: Request, res: Response) => {
  const { prompt, size = "1024x1024" } = req.body as { prompt?: string; size?: string };
  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  // Image generation requires OpenAI API key — use the unified client if configured
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  if (hasOpenAIKey) {
    try {
      const response = await llm.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: size as "1024x1024" | "1792x1024" | "1024x1792",
        response_format: "url",
      });
      res.json({ url: response.data[0]?.url, prompt });
      return;
    } catch {
      // fall through to placeholder
    }
  }

  // Fallback: return an Unsplash placeholder based on keywords
  const keywords = prompt.split(" ").slice(0, 3).join(",");
  const url = `https://source.unsplash.com/1024x768/?${encodeURIComponent(keywords)}`;
  res.json({ url, prompt, fallback: true });
});

export default router;
