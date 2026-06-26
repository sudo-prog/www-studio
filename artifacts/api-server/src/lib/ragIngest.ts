// ── RAG Auto-Ingest ────────────────────────────────────────────────────
// Ingests a completed design extraction into the knowledge_chunks table
// by splitting the outputDesignMd by ## headings (one chunk per section).

import { db, designExtractions, knowledgeChunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function ingestExtractionIntoRag(
  extractionId: string,
): Promise<void> {
  // 1. Load extraction from DB
  const [extraction] = await db
    .select()
    .from(designExtractions)
    .where(eq(designExtractions.id, extractionId));

  if (!extraction) {
    throw new Error(`Extraction ${extractionId} not found`);
  }

  if (!extraction.outputDesignMd) {
    throw new Error(`Extraction ${extractionId} has no outputDesignMd`);
  }

  // 2. Split outputDesignMd by ## headings
  const mdContent = extraction.outputDesignMd;
  const sections = mdContent.split(/^## /m).filter(Boolean);

  // 3. Insert each chunk into knowledge_chunks with metadata
  for (const section of sections) {
    const title = section.split("\n")[0].trim();

    await db.insert(knowledgeChunksTable).values({
      projectId: extraction.projectId,
      source: "design_extraction",
      sourceId: extractionId,
      section: title,
      content: section.trim(),
      metadata: {
        primaryUrl: extraction.primaryUrl,
        extractionId,
        projectId: extraction.projectId,
      },
    });
  }

  // 4. Mark extraction savedToKb = true
  await db
    .update(designExtractions)
    .set({ savedToKb: true })
    .where(eq(designExtractions.id, extractionId));
}
