import { type Request, type Response, type NextFunction } from "express";
import { logger } from "../lib/logger";

type ReqWithExtras = Request & { id?: string; log?: typeof logger };

// 404 catch-all — must be registered AFTER all routers so it only fires when
// no earlier route matched.
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

// Global error handler — must be registered LAST and keep all four arguments
// (err, req, res, next) or Express will not treat it as an error handler.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const e = err as { status?: number; statusCode?: number; message?: string };
  const status = e.status ?? e.statusCode ?? 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";

  const log = (req as ReqWithExtras).log ?? logger;
  log.error(
    {
      err:
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : err,
      requestId: (req as ReqWithExtras).id,
    },
    "Unhandled request error",
  );

  // If headers were already flushed (e.g. streaming response), delegate to
  // the default Express handler instead of trying to send JSON.
  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : message,
    requestId: (req as ReqWithExtras).id,
  });
}
