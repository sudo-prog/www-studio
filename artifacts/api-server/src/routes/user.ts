import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/user/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = req.user;
  const [result] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.userId, user.id));

  res.json({
    id: user.id,
    username: user.id,
    displayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    avatarUrl: user.profileImageUrl || null,
    projectCount: result?.count ?? 0,
  });
});

export default router;
