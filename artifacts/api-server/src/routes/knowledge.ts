// ── Knowledge RAG endpoints ────────────────────────────────────────────────
// Embedding generation via Gemini embedding API
// Storage via Drizzle ORM → knowledge_chunks table

import { Router, type Request, type Response } from "express";
import { db, knowledgeChunksTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

// ── Embed content ─────────────────────────────────────────────────────────
// POST /api/knowledge/embed
// Body: { content: string, source: string, sourceType: string, projectId?: string }
router.post("/embed", async (req: Request, res: Response) => {
  const { content, source, sourceType, projectId } = req.body;
  if (!content || !source) {
    return res.status(400).json({ error: "content and source required" });
  }

  try {
    // Generate embedding via Gemini embedding API
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "LLM_API_KEY not configured" });
    }

    const embeddingRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: content }] },
        }),
      }
    );

    if (!embeddingRes.ok) {
      const errText = await embeddingRes.text();
      return res.status(500).json({ error: `Embedding API error: ${errText}` });
    }

    const embeddingData = (await embeddingRes.json()) as {
      embedding?: { values: number[] };
    };
    const embedding = embeddingData.embedding?.values;
    if (!embedding) throw new Error("Embedding generation failed");

    // Store in knowledge_chunks table
    const [inserted] = await db
      .insert(knowledgeChunksTable)
      .values({
        projectId: projectId || null,
        source,
        sourceId: null,
        section: sourceType || "doc",
        content,
        embedding: JSON.stringify(embedding),
        metadata: { sourceType: sourceType || "doc", projectId: projectId || null },
      })
      .returning({ id: knowledgeChunksTable.id });

    if (!inserted) throw new Error("Insert returned no id");

    return res.json({ id: inserted.id, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ── Search knowledge ──────────────────────────────────────────────────────
// POST /api/knowledge/search
// Body: { query: string, projectId?: string, limit?: number }
router.post("/search", async (req: Request, res: Response) => {
  const { query, projectId, limit = 5 } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "LLM_API_KEY not configured" });
    }

    // Generate embedding for the query
    const embeddingRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: query }] },
        }),
      }
    );

    if (!embeddingRes.ok) {
      const errText = await embeddingRes.text();
      return res.status(500).json({ error: `Embedding API error: ${errText}` });
    }

    const embeddingData = (await embeddingRes.json()) as {
      embedding?: { values: number[] };
    };
    const queryEmbedding = embeddingData.embedding?.values;
    if (!queryEmbedding) throw new Error("Query embedding generation failed");

    // Use pgvector cosine similarity if available, fallback to ILIKE text search
    const embeddingStr = JSON.stringify(queryEmbedding);

    // Try vector search first (requires pgvector extension)
    let results;
    try {
      const vectorResults = await db.execute(sql`
        SELECT id, source, section, content,
               1 - (embedding::vector <=> ${embeddingStr}::vector) AS similarity
        FROM knowledge_chunks
        WHERE embedding IS NOT NULL
          AND (project_id IS NULL OR project_id = ${projectId || null}::uuid)
        ORDER BY embedding::vector <=> ${embeddingStr}::vector
        LIMIT ${limit}
      `);
      results = vectorResults.rows || vectorResults;
    } catch {
      // Fallback: text search if pgvector not available
      const textResults = await db
        .select({
          id: knowledgeChunksTable.id,
          source: knowledgeChunksTable.source,
          section: knowledgeChunksTable.section,
          content: knowledgeChunksTable.content,
        })
        .from(knowledgeChunksTable)
        .where(
          sql`${knowledgeChunksTable.content} ILIKE ${"%" + query + "%"}`
        )
        .limit(limit);
      results = textResults.map((r: any) => ({ ...r, similarity: 0 }));
    }

    return res.json({ results: results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ── List knowledge chunks ────────────────────────────────────────────────
// GET /api/knowledge/list?source=&limit=
router.get("/list", async (req: Request, res: Response) => {
  const { source, limit = "50" } = req.query;
  const lim = Math.min(Number(limit) || 50, 200);

  try {
    const columns = {
      id: knowledgeChunksTable.id,
      source: knowledgeChunksTable.source,
      section: knowledgeChunksTable.section,
      content: knowledgeChunksTable.content,
      metadata: knowledgeChunksTable.metadata,
      createdAt: knowledgeChunksTable.createdAt,
    };

    let results;
    if (source && typeof source === "string") {
      results = await db
        .select(columns)
        .from(knowledgeChunksTable)
        .where(sql`${knowledgeChunksTable.source} ILIKE ${"%" + source + "%"}`)
        .orderBy(desc(knowledgeChunksTable.createdAt))
        .limit(lim);
    } else {
      results = await db
        .select(columns)
        .from(knowledgeChunksTable)
        .orderBy(desc(knowledgeChunksTable.createdAt))
        .limit(lim);
    }

    return res.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
