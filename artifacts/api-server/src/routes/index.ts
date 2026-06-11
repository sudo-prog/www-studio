import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import galleryRouter from "./gallery";
import projectsRouter from "./projects";
import cloneRouter from "./clone";
import editorRouter from "./editor";
import chatRouter from "./chat";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(galleryRouter);
router.use(projectsRouter);
router.use(cloneRouter);
router.use(editorRouter);
router.use(chatRouter);
router.use(userRouter);

export default router;
