import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import storiesRouter from "./stories.js";
import generateRouter from "./generate.js";
import libraryRouter from "./library.js";
import authRouter from "./auth.js";
import giftRouter from "./gift.js";
import adminRouter from "./admin.js";
import meRouter from "./me.js";
import safetyRouter from "./safety.js";
import reportsRouter from "./reports.js";
import namesRouter from "./names.js";
import categoriesRouter from "./categories.js";
import presetsRouter from "./presets.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storiesRouter);
router.use(generateRouter);
router.use(libraryRouter);
router.use(authRouter);
router.use("/gift", giftRouter);
router.use("/admin", adminRouter);
router.use("/me", meRouter);
router.use(safetyRouter);
router.use(reportsRouter);
router.use(namesRouter);
router.use(categoriesRouter);
router.use("/presets", presetsRouter);

export default router;
