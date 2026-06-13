import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(authMiddleware);

// ── Rate limiting ───────────────────────────────────────────────────────────
// General: 300 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            300,
  standardHeaders: true,
  legacyHeaders:   false,
  message:        { error: "Too many requests, please try again later." },
  skip:           (req) => req.path === "/health",
});

// AI endpoints: 30 requests per minute
const aiLimiter = rateLimit({
  windowMs:       60 * 1000,
  max:            30,
  standardHeaders: true,
  legacyHeaders:   false,
  message:        { error: "AI rate limit exceeded — please wait a moment." },
});

app.use("/api", generalLimiter);
app.use("/api/chat",                   aiLimiter);
app.use("/api/generate",               aiLimiter);
app.use("/api/clone",                  aiLimiter);
app.use("/api/screenshot-to-code",     aiLimiter);
app.use("/api/design",                 aiLimiter);
// Scene-specific AI routes matched by prefix
app.use("/api/scenes", (req, _res, next) => {
  if (req.path.endsWith("/chat") || req.path === "/ai-generate") {
    return aiLimiter(req, _res, next);
  }
  next();
});

app.use("/api", router);

export default app;
