---
name: Express 5 req.params typing
description: req.params values are string | string[] in Express 5, not plain string — causes TS2769 with drizzle eq().
---

In Express 5, `req.params.id` (and any other param) is typed as `string | string[]`, not just `string`. This causes `TS2769: No overload matches this call` when passing directly to drizzle's `eq()` since drizzle expects `string | SQLWrapper`.

**Fix:** Always cast with `String(req.params.id)` before using in drizzle queries.

**Why:** Express 5 broadened the type to allow array values from some edge cases, but drizzle's eq() only accepts scalar string.

**How to apply:** Any time you write a route handler using `req.params.*` in a drizzle `.where(eq(...))` call, wrap the value in `String()`.
