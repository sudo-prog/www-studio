import { getBaseUrl } from "@workspace/api-client-react";

/**
 * Thin wrapper around the global `fetch` for same-origin `/api/...` calls.
 *
 * - Prepends the configured API base URL (see `setBaseUrl` in
 *   `@workspace/api-client-react`), so relative `/api/...` paths keep working
 *   when the SPA is served from a different origin than the API server.
 * - Always sends `credentials: "include"` so session cookies ride along with
 *   the request — required for the authenticated `/api/scenes`, `/api/projects`,
 *   etc. endpoints that rely on cookie-based sessions rather than bearer tokens.
 *
 * Use this instead of a bare `fetch("/api/...")` everywhere in the app.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${getBaseUrl()}${path}`, {
    credentials: "include",
    ...init,
  });
}
