import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { auth } from "./lib/auth.js";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { db, contentBlocks, csamReports } from "@workspace/db";
import { lt, isNull, and, notExists, sql } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." },
  skip: (req) => req.path.startsWith("/api/auth"),
});

const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as unknown as { user?: { id?: string } }).user?.id;
    return userId ? `user:${userId}` : `ip:${ipKeyGenerator(req)}`;
  },
  message: { error: "Generation limit reached. Please wait before creating another story." },
});

// better-auth handles all /api/auth/* routes (before authMiddleware so it can set session cookie)
app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(authMiddleware);

app.use(globalLimiter);

const publicDir = path.resolve(__dirname, "../public");
app.use("/api/images", express.static(path.join(publicDir, "images")));
app.use("/api/audio", express.static(path.join(publicDir, "audio")));

app.use("/api/plan-story", generationLimiter);
app.use("/api/generate-story", generationLimiter);
app.use("/api/generate-full-story", generationLimiter);
app.use("/api/generate-variation", generationLimiter);
app.use("/api/continue-story", generationLimiter);
app.use("/api/rewrite-story", generationLimiter);

app.use("/api", router);

// ---------------------------------------------------------------------------
// Scheduled jobs
// ---------------------------------------------------------------------------

/**
 * Content-block retention job: soft-deletes records older than 90 days.
 * Runs once on startup (to catch any backlog) then every 24 hours.
 * Records with deletedAt already set are skipped (idempotent).
 * CSAM-reported events are NOT deleted regardless of age (they may carry a
 * legal hold — the CSAM reports table references them by contentBlockId).
 */
async function runRetentionCleanup(): Promise<void> {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  try {
    const result = await db
      .update(contentBlocks)
      .set({ deletedAt: new Date() })
      .where(
        and(
          lt(contentBlocks.createdAt, cutoff),
          isNull(contentBlocks.deletedAt),
          // Exclude records referenced by a CSAM report (legal hold — must not be deleted)
          notExists(
            db
              .select({ one: csamReports.id })
              .from(csamReports)
              .where(sql`${csamReports.contentBlockId} = ${contentBlocks.id}::text`),
          ),
        ),
      )
      .returning({ id: contentBlocks.id });
    if (result.length > 0) {
      logger.info({ count: result.length, cutoff }, "[retention] Soft-deleted old content_blocks records");
    }
  } catch (err) {
    logger.error({ err }, "[retention] Content-block retention job failed");
  }
}

// Run on startup (catches backlog) then every 24 hours
runRetentionCleanup();
setInterval(runRetentionCleanup, 24 * 60 * 60 * 1000);

export default app;
