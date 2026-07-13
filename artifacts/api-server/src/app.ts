import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";
import { requestIdEcho } from "./middlewares/requestContext";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";

const REQUEST_ID_HEADER = "x-request-id";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    // Reuse a caller-supplied request id (proxy/other service) or mint a new
    // UUID. This id is what requestContext.ts echoes back on `x-request-id`
    // and attaches to every downstream log line via pino-http.
    genReqId: (req, res) => {
      const incoming =
        req.headers[REQUEST_ID_HEADER] ??
        (req.headers["x-request-id"] as string | undefined);
      const id = (incoming as string | undefined) ?? crypto.randomUUID();
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode, requestId: res.getHeader(REQUEST_ID_HEADER) };
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
app.use("/api/design-extract",         aiLimiter);
// Scene-specific AI routes matched by prefix
app.use("/api/scenes", (req, _res, next) => {
  if (req.path.endsWith("/chat") || req.path === "/ai-generate") {
    aiLimiter(req, _res, next);
    return;
  }
  next();
});

app.use("/api", router);

// Echo the correlation id on every response (belt-and-suspenders with the
// genReqId above, and covers the /health routes served outside /api).
app.use(requestIdEcho);

// 404 catch-all — registered AFTER all routers so it only matches when no
// earlier route handled the request.
app.use(notFoundHandler);

// Global error handler — MUST be the last middleware (keep all 4 args).
app.use(errorHandler);

export default app;
