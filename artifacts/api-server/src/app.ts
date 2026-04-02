import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { auth } from "./lib/auth.js";
import router from "./routes/index.js";
import ssrRouter from "./routes/ssr.js";
import { logger } from "./lib/logger.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { db, contentBlocks, csamReports } from "@workspace/db";
import { lt, isNull, and, notExists, sql } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

// Trust the first hop of Replit's reverse proxy so rate limiters key on the
// real client IP (from X-Forwarded-For) rather than the proxy's IP. Without
// this, all users share one rate-limit bucket and one heavy user can exhaust
// the quota for everyone.
app.set("trust proxy", 1);

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

// ---------------------------------------------------------------------------
// HTTP security headers — Helmet sets all of these before any application
// middleware runs so every response (including error responses) gets headers.
// Configured explicitly so the intent of each directive is clear.
// ---------------------------------------------------------------------------
app.use(
  helmet({
    // Prevents MIME-type sniffing attacks where a browser misinterprets
    // a response as a different content type.
    xContentTypeOptions: true,
    // Prevents clickjacking by forbidding the page from being embedded in an
    // iframe on any other origin.
    frameguard: { action: "deny" },
    // Enforces HTTPS for 1 year on future visits (includeSubDomains avoids
    // mixed-content leakage via subdomains).
    hsts: { maxAge: 31536000, includeSubDomains: true },
    // Controls how much of the URL is sent in the Referer header when following
    // external links.  "strict-origin-when-cross-origin" sends the origin only,
    // not the full path (which might contain user IDs or tokens).
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Mitigates Spectre-class side-channel attacks by isolating the browsing
    // context.  Both are "same-origin" so the app can still use its own workers
    // and shared memory.
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    // Removes the X-Powered-By: Express header that fingerprints the stack.
    // (Helmet does this automatically via hidePoweredBy: true)
    hidePoweredBy: true,
    // Disable CSP — the API server serves no HTML, so CSP provides no benefit
    // and would break any image/audio static-file responses.
    contentSecurityPolicy: false,
    // Disable COEP — too strict for static media served from /api/audio and
    // /api/images without cross-origin isolation headers on the frontend.
    crossOriginEmbedderPolicy: false,
  }),
);

// Helmet v8 does not include a Permissions-Policy middleware, so we set it
// manually.  Each directive is set to () which means "denied for all origins
// including the page itself" — the API server never uses these browser features
// and disabling them reduces the attack surface if an XSS vulnerability is
// ever introduced.
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  next();
});

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
// Raw body required for Stripe webhook signature verification — must come before express.json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const { stripeWebhookHandler } = await import("./routes/stripe.js");
  return stripeWebhookHandler(req, res);
});
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

/**
 * Admin limiter — 20 admin actions per hour per IP.
 * Limits blast radius if admin credentials are compromised: an attacker cannot
 * mass-approve or mass-modify hundreds of records in seconds.
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many admin actions. Please try again later." },
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

// Media files (/api/audio, /api/images) are served by authenticated route
// handlers in routes/media.ts — not as unrestricted static directories.
// See GAP 5 in Task #58: audio files contain personalised listener names;
// serving them without ownership verification is a privacy violation.

app.use("/api/reports", reportLimiter);
app.use("/api/admin", adminLimiter);

app.use("/api/plan-story", generationLimiter);
app.use("/api/generate-full-story", generationLimiter);
app.use("/api/generate-variation", generationLimiter);
app.use("/api/continue-story", generationLimiter);
app.use("/api/rewrite-story", generationLimiter);

// ---------------------------------------------------------------------------
// Static brand assets — logo, OG image, cover images, voice samples.
// Served from public/ (built from public-static/ by build.mjs).
// These are public-safe files with no user data — no auth required.
// ---------------------------------------------------------------------------
app.use(
  express.static(path.resolve(__dirname, "..", "public"), {
    maxAge: "7d",
    immutable: false,
  }),
);

// ---------------------------------------------------------------------------
// SSR HTML routes — serve pre-rendered HTML for SEO landing pages.
// These sit OUTSIDE the /api prefix so crawlers can access them at their
// real slugs (e.g. GET /romantic-audio-stories).  The router calls next()
// for unknown slugs so it never interferes with /api/* routes.
// Cache-Control is set inside the router handler (public, 24 h).
// ---------------------------------------------------------------------------
app.use(ssrRouter);

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

// ---------------------------------------------------------------------------
// Global error handler — must be registered last, after all routes.
// Returns a structured JSON response with a request trace ID so users can
// quote it when reporting a bug.  Never leaks a stack trace to the client.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as { status?: number; statusCode?: number })?.status
    ?? (err as { status?: number; statusCode?: number })?.statusCode
    ?? 500;
  const message =
    status < 500 && (err as { message?: string })?.message
      ? (err as { message: string }).message
      : "An unexpected error occurred.";
  // req.id is assigned by pino-http and appears in the server logs, so the
  // user can quote it and the team can look it up without exposing stack traces.
  const requestId = (req as unknown as { id?: string }).id;
  logger.error({ err, requestId }, "Unhandled request error");
  res.status(status).json({ error: message, requestId });
});

export default app;
