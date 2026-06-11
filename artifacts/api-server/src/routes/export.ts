import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
  const inner = node.content
    ? `${indent}  ${node.content}\n`
    : children;

  return `${indent}<${tag}${cls}>\n${inner}${indent}</${tag}>\n`;
}

router.get("/projects/:id/export", async (req: Request, res: Response) => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, String(req.params.id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  let bodyHtml = "";
  if (project.componentTree) {
    try {
      const tree: TreeNode = JSON.parse(project.componentTree);
      bodyHtml = (tree.children ?? [tree]).map((n) => renderNode(n, 2)).join("\n");
    } catch {
      bodyHtml = "  <p>Unable to render component tree.</p>\n";
    }
  }

  // Build CSS variables from themeTokens
  let cssVars = "";
  if (project.themeTokens) {
    try {
      const tokens = JSON.parse(project.themeTokens) as Record<string, string>;
      cssVars = Object.entries(tokens)
        .map(([k, v]) => `    ${k}: ${v};`)
        .join("\n");
    } catch { /* ignore */ }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name}</title>
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
</body>
</html>`;

  const filename = `${project.slug ?? project.name.toLowerCase().replace(/\s+/g, "-")}.html`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(html);
});

// Also serve as inline preview (no download header)
router.get("/projects/:id/preview-html", async (req: Request, res: Response) => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, String(req.params.id)));

  if (!project) {
    res.status(404).send("<p>Not found</p>");
    return;
  }

  let bodyHtml = "";
  if (project.componentTree) {
    try {
      const tree: TreeNode = JSON.parse(project.componentTree);
      bodyHtml = (tree.children ?? [tree]).map((n) => renderNode(n, 2)).join("\n");
    } catch {
      bodyHtml = "  <p>Unable to render component tree.</p>\n";
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root { ${cssVars} }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default router;
