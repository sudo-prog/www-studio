# DESIGN_RULES.md — Interaction & UI Guardrails Contract

Agent-readable interaction contract for the WWW-Studio monorepo.
These rules are **mandatory** for any UI work touching `artifacts/www-studio`,
`artifacts/mobile`, and the `api-client-react` library. Enforced after the
2026-07-15 mobile-UI audit (§4.2).

**Source / traceability:** Kanban board `mobile-ui-backend-fix`, task
`t_2e9eb9de`. Audit: 2026-07-15, section 4.2.

---

## 1. Hover must never be the only way to reach a primary action

A primary action (open menu, reveal controls, submit, expand) must be usable
without hover. Hover-only reveals silently break touch and keyboard.

- To show something on hover, gate it with `@media (hover: hover)` so
  touch/keyboard users get a non-hover fallback.
- Or fall back to a breakpoint that is always-on at small sizes, e.g.
  `md:block` / `md:opacity-100` with the hover variant applied only on
  larger pointers.

```tsx
// WRONG — invisible until hover, unreachable on touch
<div className="opacity-0 group-hover:opacity-100">Action</div>

// RIGHT — only hidden on true-hover-capable pointers
<div className="opacity-100 md:opacity-0 md:group-hover:opacity-100">Action</div>
```

## 2. Minimum touch target size: 44×44px

Every interactive control (button, link, icon, toggle, list row tappable area)
must be at least 44×44px. In Tailwind this is `min-h-11 min-w-11`
(`h-11 w-11` = 44px).

- Do not ship icon-only buttons smaller than `min-h-11 min-w-11`.
- Justify dense UIs with padding, not by shrinking targets below 44px.

## 3. All network calls go through the centralized client — never bare `fetch("/api/...")`

Use the shared client, not raw `fetch`:

- Typed hooks from `lib/api-client-react` — the generated hooks in
  `lib/api-client-react/src/generated/api.ts` (e.g. `useGetScenes`,
  `useCreateProject`, `useSendChatMessage`, ...). They wrap `customFetch`
  with `@tanstack/react-query`.
- Or the underlying primitive `customFetch` exported from
  `lib/api-client-react/src/custom-fetch.ts` (adds base-URL resolution, auth
  token injection, and `ApiError` typing).

```ts
// WRONG — raw fetch bypasses auth/base-url/error typing
const res = await fetch("/api/scenes/tags");

// RIGHT — generated hook (preferred) or customFetch
const { data } = useGetScenes();
// or
import { customFetch } from "@/lib/api-client-react/custom-fetch";
const tags = await customFetch<string[]>("/api/scenes/tags");
```

> If a project-local helper named `apiFetch` is introduced, it MUST be a thin
> re-export of `customFetch` — it is not a separate transport.

## 4. Every data-fetching surface needs explicit states

Any UI that reads from the network must render all three of:

- **Loading** — visible spinner/skeleton, not a blank box.
- **Error** — visible, human-readable message from the error (use `ApiError`).
  Never swallow with an empty `.catch(() => {})`.
- **Empty** — a clear "nothing here yet" state when the result set is empty.

```tsx
const { data, isLoading, error } = useGetScenes();
if (isLoading) return <Spinner />;
if (error) return <ErrorBox message={error.message} />;   // not .catch(()=>{})
if (!data.length) return <EmptyState />;
```

## 5. Verify at 390×844 before declaring done

The baseline mobile viewport is **iPhone 12/13/14 logical: 390×844**.
Before a task is complete:

- Render the changed screens at 390×844 (DevTools device toolbar, or the
  running mobile app).
- Confirm rules 1–4 hold: no hover-only actions, targets ≥44px, no bare
  `fetch`, and loading/error/empty states all show.

---

### Non-negotiable summary

1. No hover-only primary actions (`@media (hover:hover)` / `md:` fallback).
2. Touch targets ≥ `min-h-11 min-w-11` (44px).
3. Network via generated hooks / `customFetch` — no bare `fetch("/api/...")`.
4. Loading + error (visible, not swallowed) + empty states, always.
5. Test at 390×844 before done.
