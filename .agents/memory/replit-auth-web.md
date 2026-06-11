---
name: replit-auth-web lib pattern
description: The @workspace/replit-auth-web package exports from source directly — no build step, no tsconfig project reference needed.
---

The `lib/replit-auth-web` package has `"exports": { ".": "./src/index.ts" }` — it's designed to be resolved directly from source by Vite, not from a compiled dist folder.

**Fix:** Do NOT add it as a TypeScript project reference in consumer tsconfigs (`artifacts/www-studio/tsconfig.json`). Adding it causes `TS6305: Output file has not been built from source file` errors since there's no build step.

**Why:** The package relies on Vite's TypeScript resolution at dev time. Setting `composite: true` and a dist output is unnecessary for source-exported workspace libs.

**How to apply:** Only add tsconfig project references for libs that have a build step and output to `dist/`. Source-exported libs (package.json exports pointing to .ts files) should be omitted from references.
