import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import storiesRouter from "./stories.js";
import generateRouter from "./generate.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storiesRouter);
router.use(generateRouter);

export default router;
