import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/projects/recent", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.json([]);
    return;
  }
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, req.user.id))
    .orderBy(desc(projectsTable.updatedAt))
    .limit(6);
  res.json(rows);
});

router.get("/projects", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.json([]);
    return;
  }
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, req.user.id))
    .orderBy(desc(projectsTable.updatedAt));
  res.json(rows);
});

router.post("/projects", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { name, sourceUrl, templateId } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
  const [project] = await db
    .insert(projectsTable)
    .values({ userId: req.user.id, name, slug, sourceUrl: sourceUrl || null })
    .returning();
  res.status(201).json(project);
});

router.get("/projects/:id", async (req: Request, res: Response) => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, String(req.params.id)));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.patch("/projects/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { name, thumbnailUrl, componentTree, themeTokens, status } = req.body;
  const [project] = await db
    .update(projectsTable)
    .set({ name, thumbnailUrl, componentTree, themeTokens, status })
    .where(and(eq(projectsTable.id, String(req.params.id)), eq(projectsTable.userId, req.user.id)))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.delete("/projects/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await db
    .delete(projectsTable)
    .where(and(eq(projectsTable.id, String(req.params.id)), eq(projectsTable.userId, req.user.id)));
  res.status(204).send();
});

export default router;
