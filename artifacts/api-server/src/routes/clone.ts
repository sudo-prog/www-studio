import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const STYLE_PALETTES: Record<string, string[]> = {
  minimal: ["#ffffff", "#f8f8f8", "#222222", "#666666", "#0066ff"],
  glassmorphism: ["#ffffff33", "#ffffff1a", "#6366f1", "#8b5cf6", "#06b6d4"],
  brutalist: ["#000000", "#ffffff", "#ff0000", "#ffff00", "#0000ff"],
  "dark-mode": ["#0f0f0f", "#1a1a1a", "#ffffff", "#888888", "#6366f1"],
  "apple-style": ["#f5f5f7", "#ffffff", "#1d1d1f", "#6e6e73", "#0066cc"],
  "stripe-style": ["#0a2540", "#00d4ff", "#ffffff", "#635bff", "#f6f9fc"],
  "linear-style": ["#090909", "#1a1a1a", "#ffffff", "#5e6ad2", "#e8e8e8"],
};

function detectStyle(url: string): string {
  const domain = url.toLowerCase();
  if (domain.includes("apple")) return "apple-style";
  if (domain.includes("stripe")) return "stripe-style";
  if (domain.includes("linear")) return "linear-style";
  if (domain.includes("vercel") || domain.includes("nextjs")) return "dark-mode";
  return "minimal";
}

function generateComponentTree(url: string, title: string): string {
  return JSON.stringify({
    type: "page",
    name: title,
    sourceUrl: url,
    children: [
      {
        type: "section",
        name: "Hero",
        className: "relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black",
        children: [
          { type: "h1", content: title, className: "text-5xl font-bold text-white" },
          { type: "p", content: "Cloned and ready to edit.", className: "mt-4 text-xl text-gray-400" }
        ]
      },
      {
        type: "section",
        name: "Features",
        className: "py-20 px-6 max-w-6xl mx-auto grid grid-cols-3 gap-8",
        children: [
          { type: "card", name: "Feature 1", className: "p-6 rounded-2xl border border-white/10 bg-white/5" },
          { type: "card", name: "Feature 2", className: "p-6 rounded-2xl border border-white/10 bg-white/5" },
          { type: "card", name: "Feature 3", className: "p-6 rounded-2xl border border-white/10 bg-white/5" }
        ]
      },
      {
        type: "section",
        name: "Footer",
        className: "py-10 border-t border-white/10 text-center text-gray-500",
        children: [
          { type: "p", content: `© ${new Date().getFullYear()} ${title}. Cloned by WWW Studio.`, className: "text-sm" }
        ]
      }
    ]
  }, null, 2);
}

router.post("/clone", async (req: Request, res: Response) => {
  const { url, projectId } = req.body;

  if (!url) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  const domain = parsedUrl.hostname.replace("www.", "");
  const title = domain.charAt(0).toUpperCase() + domain.slice(1) + " Clone";
  const detectedStyle = detectStyle(url);
  const colors = STYLE_PALETTES[detectedStyle] || STYLE_PALETTES.minimal;
  const componentTree = generateComponentTree(url, title);

  let resultProjectId = projectId;
  if (!resultProjectId && req.isAuthenticated()) {
    const slug = domain.replace(/\./g, "-") + "-" + Date.now();
    const [newProject] = await db
      .insert(projectsTable)
      .values({
        userId: req.user.id,
        name: title,
        slug,
        sourceUrl: url,
        componentTree,
        status: "draft",
      })
      .returning();
    resultProjectId = newProject.id;
  } else if (resultProjectId && req.isAuthenticated()) {
    await db
      .update(projectsTable)
      .set({ componentTree, sourceUrl: url })
      .where(eq(projectsTable.id, resultProjectId));
  } else {
    resultProjectId = "preview-" + Date.now();
  }

  res.json({
    projectId: resultProjectId,
    componentTree,
    thumbnailUrl: `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`,
    title,
    detectedStyle,
    colors,
  });
});

export default router;
