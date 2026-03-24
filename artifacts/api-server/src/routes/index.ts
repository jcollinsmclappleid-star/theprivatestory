import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import storiesRouter from "./stories.js";
import generateRouter from "./generate.js";
import libraryRouter from "./library.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storiesRouter);
router.use(generateRouter);
router.use(libraryRouter);

export default router;
