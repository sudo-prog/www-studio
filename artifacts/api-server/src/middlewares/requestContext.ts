import { type Request, type Response, type NextFunction } from "express";

// pino-http generates/assigns `req.id` in its middleware (which is mounted
// before this one). We echo that id back on `x-request-id` so the frontend,
// any upstream proxy, and the server logs can all correlate a single request.
// If a client/proxy supplies `x-request-id`, pino-http's `genReqId` reuses it
// (see app.ts), so the same id propagates end-to-end.
export function requestIdEcho(req: Request, res: Response, next: NextFunction) {
  const id = (req as Request & { id?: string }).id;
  if (id) res.setHeader("x-request-id", String(id));
  next();
}
