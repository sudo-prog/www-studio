import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

/**
 * Client + server error telemetry sink.
 *
 * - POST /api/log  : browser ErrorBoundary / window.onerror / unhandledrejection
 *                     payloads land here and are both logged (pino, visible in
 *                     Vercel function logs) and pushed into an in-memory ring
 *                     buffer so an agent can later GET /api/errors to see what
 *                     actually broke on the client without scraping the console.
 * - GET  /api/errors: returns the most recent N buffered errors (newest first).
 *                     This is the "debug viewer" the chief-of-staff agent and
 *                     onboard AI agents poll to confirm the app is error-free.
 *
 * The buffer is per-instance (cold-start clears it) — that is intentional:
 * during an active debug session the buffer reflects the current runtime, and
 * the durable record is the pino log line in the platform's log store.
 */

interface BufferedError {
  id: string;
  receivedAt: string;
  source: "client" | "server" | "manual";
  level: string;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  componentStack?: string;
  meta?: Record<string, unknown>;
}

const MAX_BUFFER = 200;
const buffer: BufferedError[] = [];

function pushError(e: BufferedError) {
  buffer.push(e);
  if (buffer.length > MAX_BUFFER) buffer.splice(0, buffer.length - MAX_BUFFER);
}

const router: IRouter = Router();

router.post("/log", (req: Request, res: Response) => {
  const b = req.body ?? {};
  const entry: BufferedError = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    source: b.source === "server" ? "server" : "client",
    level: b.level ?? "error",
    message: String(b.message ?? b.msg ?? "(no message)"),
    stack: b.stack ? String(b.stack) : undefined,
    url: b.url ?? b.href ?? (req.headers.referer as string | undefined),
    userAgent: b.userAgent ?? (req.headers["user-agent"] as string | undefined),
    componentStack: b.componentStack ? String(b.componentStack) : undefined,
    meta: typeof b.meta === "object" && b.meta ? b.meta : undefined,
  };
  // Durable log line (Vercel function logs / local stdout).
  logger.error(
    { errBuffer: entry.id, source: entry.source, url: entry.url },
    `client-error: ${entry.message}`,
  );
  pushError(entry);
  res.status(202).json({ ok: true, id: entry.id });
});

router.get("/errors", (_req: Request, res: Response) => {
  // Newest first.
  const recent = [...buffer].reverse();
  res.json({
    count: recent.length,
    cap: MAX_BUFFER,
    errors: recent,
  });
});

// Allow clearing the buffer (handy between test runs).
router.delete("/errors", (_req: Request, res: Response) => {
  buffer.length = 0;
  res.json({ ok: true, cleared: true });
});

export default router;
