import { Router, type IRouter, type Request, type Response } from "express";
import { db, galleryTemplatesTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/gallery", async (req: Request, res: Response) => {
  const { style, search, sort } = req.query;
  let query = db.select().from(galleryTemplatesTable);

  const conditions = [];
  if (style && typeof style === "string") {
    conditions.push(eq(galleryTemplatesTable.style, style));
  }
  if (search && typeof search === "string") {
    conditions.push(
      or(
        ilike(galleryTemplatesTable.title, `%${search}%`),
        ilike(galleryTemplatesTable.creator, `%${search}%`)
      )
    );
  }

  const rows = await (conditions.length > 0
    ? db.select().from(galleryTemplatesTable).where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
    : db.select().from(galleryTemplatesTable));

  const sorted = [...rows].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "popular") return b.likes - a.likes;
    return b.likes - a.likes; // trending default
  });

  const result = sorted.map((t) => ({
    ...t,
    tags: (() => { try { return JSON.parse(t.tags); } catch { return []; } })(),
  }));

  res.json(result);
});

router.get("/gallery/stats", async (req: Request, res: Response) => {
  const rows = await db.select().from(galleryTemplatesTable);
  const byStyle: Record<string, number> = {};
  let featured = 0;
  for (const r of rows) {
    byStyle[r.style] = (byStyle[r.style] || 0) + 1;
    if (r.isFeatured) featured++;
  }
  res.json({ total: rows.length, byStyle, featured });
});

router.get("/gallery/:id", async (req: Request, res: Response) => {
  const [template] = await db
    .select()
    .from(galleryTemplatesTable)
    .where(eq(galleryTemplatesTable.id, String(req.params.id)));

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json({
    ...template,
    tags: (() => { try { return JSON.parse(template.tags); } catch { return []; } })(),
  });
});

export default router;
