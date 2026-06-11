import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import galleryRouter from "./gallery";
import projectsRouter from "./projects";
import cloneRouter from "./clone";
import editorRouter from "./editor";
import chatRouter from "./chat";
import userRouter from "./user";
import generateRouter from "./generate";
import screenshotToCodeRouter from "./screenshot-to-code";
import exportRouter from "./export";
import publishRouter from "./publish";
import snapshotsRouter from "./snapshots";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(galleryRouter);
router.use(projectsRouter);
router.use(cloneRouter);
router.use(editorRouter);
router.use(chatRouter);
router.use(userRouter);
router.use(generateRouter);
router.use(screenshotToCodeRouter);
router.use(exportRouter);
router.use(publishRouter);
router.use(snapshotsRouter);

export default router;
