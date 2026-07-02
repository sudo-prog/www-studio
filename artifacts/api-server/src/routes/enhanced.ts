import { Router, type IRouter, type Request, type Response } from "express";
import { db, componentsTable, knowledgeChunksTable, templatesTable, pagesTable } from "@workspace/db";
import { eq, ilike, or, desc, sql, and } from "drizzle-orm";
import { z } from "zod";
import { chatComplete } from "../lib/llm";

const router: IRouter = Router();

// ── Components ───────────────────────────────────────────────────────────────

const GetComponentQuery = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().default(50),
});

router.get("/components", async (req: Request, res: Response) => {
  const { category, search, tag, limit } = GetComponentQuery.parse(req.query);
  const conditions = [];

  if (category) conditions.push(eq(componentsTable.category, category));
  if (search) {
    conditions.push(
      or(
        ilike(componentsTable.name, `%${search}%`),
        ilike(componentsTable.category, `%${search}%`)
      )
    );
  }
  if (tag) {
    conditions.push(sql`${componentsTable.tags} ILIKE ${'%' + tag + '%'}`);
  }

  const rows = await (conditions.length > 0
    ? db.select().from(componentsTable).where(and(...conditions)).limit(limit)
    : db.select().from(componentsTable).limit(limit));

  const result = rows.map((c) => ({
    ...c,
    tags: (() => { try { return JSON.parse(c.tags); } catch { return []; } })(),
  }));

  res.json(result);
});

const IngestComponentBody = z.object({
  code: z.string().min(10),
  name: z.string().min(1).optional(),
  sourceUrl: z.string().url().optional(),
});

router.post("/components/ingest", async (req: Request, res: Response) => {
  const { code, name, sourceUrl } = IngestComponentBody.parse(req.body);

  // AI-powered categorization
  let category = "Misc";
  let tags: string[] = [];
  let componentName = name || "Unnamed Component";

  try {
    const analysis = await chatComplete([
      {
        role: "system",
        content: `Analyze this HTML/Tailwind component code. Respond with JSON: { "name": "descriptive name", "category": "one of: Buttons, Cards, Forms, Navigation, Hero, Footer, Loading UI, Modals, Badges, Pricing, Testimonials, Layout", "tags": ["tag1", "tag2", "tag3"] }`,
      },
      { role: "user", content: code.slice(0, 2000) },
    ], { jsonMode: true, temperature: 0.3 });

    const parsed = JSON.parse(analysis);
    category = parsed.category || category;
    tags = Array.isArray(parsed.tags) ? parsed.tags : [];
    componentName = parsed.name || componentName;
  } catch {
    // Fallback: basic keyword matching
    if (code.includes("button") || code.includes("btn")) category = "Buttons";
    else if (code.includes("card")) category = "Cards";
    else if (code.includes("input") || code.includes("form")) category = "Forms";
    else if (code.includes("nav") || code.includes("menu")) category = "Navigation";
    else if (code.includes("hero") || code.includes("banner")) category = "Hero";
    else if (code.includes("footer")) category = "Footer";
    else if (code.includes("skeleton") || code.includes("spinner") || code.includes("loading")) category = "Loading UI";
  }

  const [component] = await db
    .insert(componentsTable)
    .values({
      name: componentName,
      category,
      tags: JSON.stringify(tags),
      code,
      sourceUrl: sourceUrl || null,
    })
    .returning();

  res.status(201).json({
    ...component,
    tags: (() => { try { return JSON.parse(component.tags); } catch { return []; } })(),
  });
});

// ── Templates ────────────────────────────────────────────────────────────────

router.get("/templates", async (req: Request, res: Response) => {
  const { search, tag } = req.query;
  const conditions = [];

  if (search && typeof search === "string") {
    conditions.push(
      or(
        ilike(templatesTable.title, `%${search}%`),
        ilike(templatesTable.description, `%${search}%`)
      )
    );
  }
  if (tag && typeof tag === "string") {
    conditions.push(sql`${templatesTable.tags} ILIKE ${'%' + tag + '%'}`);
  }

  const rows = await (conditions.length > 0
    ? db.select().from(templatesTable).where(and(...conditions)).orderBy(desc(templatesTable.createdAt))
    : db.select().from(templatesTable).orderBy(desc(templatesTable.createdAt)));

  const result = rows.map((t) => ({
    ...t,
    tags: (() => { try { return JSON.parse(t.tags); } catch { return []; } })(),
  }));

  res.json(result);
});

// ── Knowledge Chunks (RAG) ──────────────────────────────────────────────────

const IngestKnowledgeBody = z.object({
  content: z.string().min(1),
  source: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

router.post("/rag/ingest", async (req: Request, res: Response) => {
  const { content, source, metadata } = IngestKnowledgeBody.parse(req.body);

  // Simple chunking by paragraphs
  const chunks = content.split(/\n\n+/).filter((c) => c.trim().length > 20);
  const inserted = [];

  for (const chunk of chunks) {
    const values: Record<string, unknown> = {
      content: chunk.trim(),
      metadata: metadata || {},
    };
    if (source != null) values.source = source;
    const [row] = await db
      .insert(knowledgeChunksTable)
      .values(values)
      .returning();
    inserted.push(row);
  }

  res.status(201).json({
    success: true,
    chunksInserted: inserted.length,
    source: source || null,
    ids: inserted.map((r) => r.id),
  });
});

const SearchKnowledgeQuery = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().default(10),
});

router.get("/rag/search", async (req: Request, res: Response) => {
  const { q, limit } = SearchKnowledgeQuery.parse(req.query);

  // Full-text search using ILIKE on content
  const rows = await db
    .select()
    .from(knowledgeChunksTable)
    .where(ilike(knowledgeChunksTable.content, `%${q}%`))
    .limit(limit);

  // Also search by source
  const sourceRows = await db
    .select()
    .from(knowledgeChunksTable)
    .where(ilike(knowledgeChunksTable.source, `%${q}%`))
    .limit(limit);

  const combined = [...rows];
  for (const r of sourceRows) {
    if (!combined.find((c) => c.id === r.id)) combined.push(r);
  }

  res.json({
    query: q,
    results: combined.slice(0, limit),
    total: combined.length,
  });
});

router.get("/rag/status", async (req: Request, res: Response) => {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(knowledgeChunksTable);

  res.json({
    totalChunks: count,
    status: "ready",
    lastIndexed: new Date().toISOString(),
  });
});

// ── Pages (multi-page support) ──────────────────────────────────────────────

router.get("/pages/:projectId", async (req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.projectId, req.params.projectId as string))
    .orderBy(desc(pagesTable.createdAt));
  res.json(rows);
});

router.post("/pages", async (req: Request, res: Response) => {
  const { projectId, title, slug, elements, styles } = req.body;
  if (!projectId || !title) {
    res.status(400).json({ error: "projectId and title are required" });
    return;
  }
  const [page] = await db
    .insert(pagesTable)
    .values({
      projectId,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      elements: elements || "[]",
      styles: styles || "{}",
    })
    .returning();
  res.status(201).json(page);
});

// ── Bookmarks Analyzer ───────────────────────────────────────────────────────

const AnalyzeBookmarkBody = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
});

router.post("/bookmarks/analyze", async (req: Request, res: Response) => {
  const { url, title, description } = AnalyzeBookmarkBody.parse(req.body);

  let analysis;
  try {
    analysis = await chatComplete([
      {
        role: "system",
        content: `Analyze this bookmark and suggest how to recreate it as a web component. Return JSON: { "suggestedLayout": "hero|landing|dashboard|blog|portfolio", "keyElements": ["element1", "element2"], "colorScheme": "description of colors", "complexity": "simple|medium|complex", "components": ["Component1", "Component2"] }`,
      },
      {
        role: "user",
        content: `URL: ${url}\nTitle: ${title || ""}\nDescription: ${description || ""}`,
      },
    ], { jsonMode: true, temperature: 0.5 });
  } catch {
    analysis = JSON.stringify({
      suggestedLayout: "landing",
      keyElements: ["header", "hero section", "content area"],
      colorScheme: "neutral with accent",
      complexity: "medium",
      components: ["Nav", "Hero", "Card", "Footer"],
    });
  }

  res.json({
    url,
    analysis: JSON.parse(analysis),
    timestamp: new Date().toISOString(),
  });
});

// ── AI Layout Suggestions ────────────────────────────────────────────────────

const SuggestLayoutBody = z.object({
  prompt: z.string().min(5),
  pageType: z.string().optional(),
  components: z.array(z.string()).optional(),
});

router.post("/ai/suggest-layout", async (req: Request, res: Response) => {
  const { prompt, pageType, components } = SuggestLayoutBody.parse(req.body);

  let suggestion;
  try {
    suggestion = await chatComplete([
      {
        role: "system",
        content: `You are a web design expert. Based on the user's description, suggest a page layout structure. Return JSON: { "layout": "description", "sections": [{ "name": "section name", "type": "hero|features|testimonials|cta|footer|pricing|gallery|contact", "gridCols": 1, "suggestedComponents": ["comp1"] }], "colorPalette": ["#color1", "#color2"], "tailwindClasses": { "container": "classes", "section": "classes" } }`,
      },
      {
        role: "user",
        content: `Create a ${pageType || "web page"} layout for: ${prompt}\nAvailable components: ${components?.join(", ") || "any"}`,
      },
    ], { jsonMode: true, temperature: 0.7 });
  } catch {
    suggestion = JSON.stringify({
      layout: `Layout for: ${prompt}`,
      sections: [
        { name: "Hero", type: "hero", gridCols: 1, suggestedComponents: ["Hero"] },
        { name: "Features", type: "features", gridCols: 3, suggestedComponents: ["Card", "Card", "Card"] },
        { name: "Call to Action", type: "cta", gridCols: 1, suggestedComponents: ["Button"] },
      ],
      colorPalette: ["#0d1117", "#7FB5A0", "#ffffff"],
      tailwindClasses: { container: "max-w-6xl mx-auto px-4", section: "py-16" },
    });
  }

  res.json({
    prompt,
    suggestion: JSON.parse(suggestion),
    timestamp: new Date().toISOString(),
  });
});

// ── MCP Search endpoint ──────────────────────────────────────────────────────

router.get("/mcp/search", async (req: Request, res: Response) => {
  const { q, limit } = req.query;
  if (!q || typeof q !== "string") {
    res.status(400).json({ error: "query parameter 'q' is required" });
    return;
  }

  // Search across components and knowledge chunks
  const [components, chunks] = await Promise.all([
    db.select().from(componentsTable).where(
      or(
        ilike(componentsTable.name, `%${q}%`),
        ilike(componentsTable.category, `%${q}%`)
      )
    ).limit(Number(limit) || 5),
    db.select().from(knowledgeChunksTable).where(
      ilike(knowledgeChunksTable.content, `%${q}%`)
    ).limit(Number(limit) || 5),
  ]);

  res.json({
    query: q,
    components,
    knowledge: chunks,
    total: components.length + chunks.length,
  });
});

export default router;
