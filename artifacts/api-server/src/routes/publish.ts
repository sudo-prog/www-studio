import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";

const router: IRouter = Router();

interface TreeNode {
  type: string;
  name?: string;
  content?: string;
  className?: string;
  children?: TreeNode[];
}

const TAG_MAP: Record<string, string> = {
  section: "section", div: "div", h1: "h1", h2: "h2", h3: "h3",
  h4: "h4", p: "p", button: "button", img: "img", nav: "nav",
  header: "header", footer: "footer", card: "div", page: "div",
  ul: "ul", li: "li", a: "a", span: "span",
};

function renderNode(node: TreeNode, depth = 0): string {
  const tag = TAG_MAP[node.type] ?? "div";
  const cls = node.className ? ` class="${node.className}"` : "";
  const indent = "  ".repeat(depth);

  if (tag === "img") {
    const src = (node as any).src || "https://placehold.co/800x400/111827/ffffff?text=Image";
    const alt = node.content || node.name || "image";
    return `${indent}<img${cls} src="${src}" alt="${alt}" />\n`;
  }

  const children = (node.children ?? []).map((c) => renderNode(c, depth + 1)).join("");
  const inner = node.content ? `${indent}  ${node.content}\n` : children;
  return `${indent}<${tag}${cls}>\n${inner}${indent}</${tag}>\n`;
}

// POST /projects/:id/publish — mark as published and return the live URL
router.post("/projects/:id/publish", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set({ status: "published" })
    .where(and(eq(projectsTable.id, String(req.params.id)), eq(projectsTable.userId, req.user.id)))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const host = req.get("host") ?? "localhost";
  const protocol = req.protocol;
  const liveUrl = `${protocol}://${host}/api/s/${project.slug}`;

  res.json({ success: true, liveUrl, slug: project.slug, status: "published" });
});

// GET /s/:slug — serve the published project as HTML
router.get("/s/:slug", async (req: Request, res: Response) => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.slug, String(req.params.slug)), eq(projectsTable.status, "published")));

  if (!project) {
    res.status(404).send(`<!DOCTYPE html>
<html><head><title>Not Found</title>
<script src="https://cdn.tailwindcss.com"></script>
</head><body class="min-h-screen bg-gray-950 flex items-center justify-center">
<div class="text-center"><h1 class="text-4xl font-bold text-white mb-4">404</h1>
<p class="text-gray-400">This project has not been published yet.</p>
<a href="/" class="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">Back to Studio</a>
</div></body></html>`);
    return;
  }

  let bodyHtml = "";
  if (project.componentTree) {
    try {
      const tree: TreeNode = JSON.parse(project.componentTree);
      bodyHtml = (tree.children ?? [tree]).map((n) => renderNode(n, 2)).join("\n");
    } catch {
      bodyHtml = "  <p>Error rendering project.</p>\n";
    }
  }

  let cssVars = "";
  if (project.themeTokens) {
    try {
      const tokens = JSON.parse(project.themeTokens) as Record<string, string>;
      cssVars = Object.entries(tokens).map(([k, v]) => `    ${k}: ${v};`).join("\n");
    } catch { /* ignore */ }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name}</title>
  <meta property="og:title" content="${project.name}" />
  <meta property="og:description" content="Built with WWW Studio" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
${cssVars || '    --background: 0 0% 9%;\n    --foreground: 0 0% 98%;'}
    }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; }
  </style>
</head>
<body>
${bodyHtml}
  <footer style="padding:16px;text-align:center;font-size:12px;color:#666;border-top:1px solid #222;margin-top:40px;">
    Built with <a href="/" style="color:#3b82f6;text-decoration:none;">WWW Studio</a>
  </footer>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default router;
