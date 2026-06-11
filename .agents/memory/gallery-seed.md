---
name: Gallery seeding via executeSql
description: Drizzle $defaultFn UUIDs don't apply when seeding via raw SQL — must include id in INSERT.
---

When using `executeSql` to insert rows into tables where the `id` column uses Drizzle's `$defaultFn(() => crypto.randomUUID())`, the UUID will NOT be generated automatically. The `$defaultFn` only runs through Drizzle's ORM layer, not raw SQL.

**Fix:** Always include `id: crypto.randomUUID()` explicitly in the params array when seeding via `executeSql`.

**Why:** `$defaultFn` is a Drizzle ORM construct that generates values client-side before sending the INSERT. Raw SQL bypasses this entirely, leaving id as null and violating NOT NULL constraints.

**How to apply:** For any table using `$defaultFn` for id, generate the UUID in the seeding code and include it as $1 in the INSERT statement.
