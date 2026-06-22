import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import {
  visionComplete,
  getLLMProvider,
  LLM_VISION_MODEL,
  LLM_API_KEY,
  LLM_BASE_URL,
} from "../lib/llm";

const router: IRouter = Router();

function fallbackTreeFromFilename(name: string): string {
  const title = name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  return JSON.stringify({
    type: "page",
    name: title || "Screenshot Clone",
    children: [
      {
        type: "section",
        name: "Hero",
        className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black",
        children: [
          {
            type: "div",
            name: "Content",
            className: "text-center max-w-3xl mx-auto px-6",
            children: [
              { type: "h1", content: title || "Screenshot Clone", className: "text-5xl font-bold text-white mb-4" },
              { type: "p", content: "Generated from uploaded screenshot. Configure an LLM provider for precise code extraction.", className: "text-gray-400 text-xl mb-8" },
              { type: "button", content: "Get Started", className: "px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition" },
            ],
          },
        ],
      },
      {
        type: "section",
        name: "Features",
        className: "py-20 px-6 bg-gray-950",
        children: [
          {
            type: "div",
            name: "Grid",
            className: "max-w-5xl mx-auto grid grid-cols-3 gap-6",
            children: [
              { type: "card", name: "Card 1", className: "p-6 rounded-xl bg-white/5 border border-white/10" },
              { type: "card", name: "Card 2", className: "p-6 rounded-xl bg-white/5 border border-white/10" },
              { type: "card", name: "Card 3", className: "p-6 rounded-xl bg-white/5 border border-white/10" },
            ],
          },
        ],
      },
    ],
  }, null, 2);
}

async function extractCodeFromImage(base64Image: string, mimeType: string): Promise<string> {
  const prompt = `You are a web design AI that converts UI screenshots into JSON component trees.
Analyze the screenshot and return ONLY a JSON component tree with this shape:
{
  "type": "page",
  "name": "string",
  "children": [ ...sections ]
}
Each node: { "type": "section"|"div"|"h1"|"h2"|"p"|"button"|"img"|"card"|"nav", "name": "string", "content": "string (for text)", "className": "tailwind classes matching the screenshot", "children": [...] }
Match the layout, spacing, colors, and typography from the screenshot as closely as possible using Tailwind CSS. Return ONLY the JSON.`;

  const raw = await visionComplete(base64Image, mimeType, prompt, { model: LLM_VISION_MODEL });
  // strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  JSON.parse(cleaned); // validate
  return cleaned;
}

router.post("/screenshot-to-code", async (req: Request, res: Response) => {
  const { image, mimeType = "image/png", filename = "screenshot" } = req.body as {
    image?: string;
    mimeType?: string;
    filename?: string;
  };

  if (!image) {
    res.status(400).json({ error: "image (base64) is required" });
    return;
  }

  let componentTree: string;

  // Try the unified LLM client if an API key is configured or a local proxy is used
  const hasApiKey = !!LLM_API_KEY && LLM_API_KEY !== "ollama";
  const isLocalProxy = LLM_BASE_URL.includes("localhost") || LLM_BASE_URL.includes("127.0.0.1");

  if (hasApiKey || isLocalProxy) {
    try {
      componentTree = await extractCodeFromImage(image, mimeType);
    } catch {
      componentTree = fallbackTreeFromFilename(filename);
    }
  } else {
    componentTree = fallbackTreeFromFilename(filename);
  }

  let projectId: string;
  const name = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") || "Screenshot Clone";

  if (req.isAuthenticated()) {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const [newProject] = await db
      .insert(projectsTable)
      .values({
        userId: req.user.id,
        name,
        slug,
        componentTree,
        status: "draft",
      })
      .returning();
    projectId = newProject.id;
  } else {
    projectId = "preview-" + Date.now();
  }

  res.json({ projectId, componentTree, name });
});

export default router;
