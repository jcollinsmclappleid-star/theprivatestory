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

export default app;
