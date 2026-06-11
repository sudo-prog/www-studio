import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectSnapshotsTable, projectsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/projects/:id/snapshots", async (req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(projectSnapshotsTable)
    .where(eq(projectSnapshotsTable.projectId, String(req.params.id)))
    .orderBy(desc(projectSnapshotsTable.createdAt))
    .limit(50);
  res.json(rows);
});

router.post("/projects/:id/snapshots", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const projectId = String(req.params.id);
  const { label, componentTree, themeTokens } = req.body;

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.user.id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [snapshot] = await db
    .insert(projectSnapshotsTable)
    .values({
      projectId,
      userId: req.user.id,
      label: label || "Save",
      componentTree: componentTree ?? project.componentTree,
      themeTokens: themeTokens ?? project.themeTokens,
    })
    .returning();

  res.status(201).json(snapshot);
});

router.post("/projects/:id/snapshots/:snapshotId/restore", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const projectId = String(req.params.id);
  const snapshotId = String(req.params.snapshotId);

  const [snapshot] = await db
    .select()
    .from(projectSnapshotsTable)
    .where(and(eq(projectSnapshotsTable.id, snapshotId), eq(projectSnapshotsTable.projectId, projectId)));

  if (!snapshot) {
    res.status(404).json({ error: "Snapshot not found" });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set({
      componentTree: snapshot.componentTree,
      themeTokens: snapshot.themeTokens,
    })
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.user.id)))
    .returning();

  if (!updated) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json({ success: true, project: updated });
});

export default router;
