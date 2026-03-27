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
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /\.replit\.dev$/,
  /\.replit\.app$/,
  /\.repl\.co$/,
];

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin))) return cb(null, true);
      return cb(new Error("CORS not allowed"));
    },
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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

/** Report limiter — 10 submissions per hour per IP (abuse prevention) */
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many reports submitted. Please contact safety@theprivatestory.com directly." },
});

/** Auth limiter — 5 attempts per 15 min per IP (login brute-force protection) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait 15 minutes and try again." },
});

const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as unknown as { user?: { id?: string } }).user?.id;
    return userId ? `user:${userId}` : `ip:${ipKeyGenerator(req)}`;
  },
  message: { error: "Generation limit reached. Please wait before creating another story." },
});

// Rate-limit sign-in attempts before better-auth handles them
app.use("/api/auth/sign-in", authLimiter);

// better-auth handles all /api/auth/* routes (before authMiddleware so it can set session cookie)
app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(authMiddleware);

app.use(globalLimiter);

const publicDir = path.resolve(__dirname, "../public");
app.use("/api/images", express.static(path.join(publicDir, "images")));
app.use("/api/audio", express.static(path.join(publicDir, "audio")));

app.use("/api/reports", reportLimiter);

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
 * Content-block retention job: soft-deletes auto-blocked safety-event records
 * older than 90 days. Runs once on startup then every 24 hours.
 *
 * Records are NEVER deleted if:
 *  - deletedAt is already set (idempotent)
 *  - blockSource is 'user-report' — user-submitted reports must be explicitly
 *    dispositioned by an admin before they can be removed
 *  - The record is referenced by a csam_reports entry (legal hold)
 *
 * This ensures unresolved safety incidents remain in the admin moderation queue
 * regardless of age, and are only removed after review/disposition.
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
          // Never delete user-submitted reports — must be explicitly dispositioned
          sql`${contentBlocks.blockSource} != 'user-report'`,
          // Never delete records with a CSAM legal hold
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
