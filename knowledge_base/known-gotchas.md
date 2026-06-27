# WWW Studio — Known Gotchas

Critical facts that burn agents. Read this before making any changes.

---

## 1. Frontend Code Path

**All frontend app code is at `artifacts/www-studio/src/` NOT at `src/`.**

The monorepo root has no `src/` directory. The frontend lives inside `artifacts/www-studio/`. Any import path resolution, file creation, or build command must account for this.

```
✅ Correct: artifacts/www-studio/src/components/
❌ Wrong:  src/components/
```

## 2. LLM Module Location

**`llm.ts` is in `artifacts/api-server/src/lib/`, NOT in the frontend.**

The frontend NEVER imports from `api-server`. All AI calls go through HTTP `fetch` to the api-server endpoints. The api-server URL is configured via `VITE_API_SERVER_URL` environment variable.

```typescript
// ✅ Correct: HTTP call to api-server
const res = await fetch(`${import.meta.env.VITE_API_SERVER_URL}/chat`, {...});

// ❌ Wrong: Direct import
import { chatComplete } from '@/lib/llm'; // This path doesn't exist in frontend
```

## 3. Supabase is Optional

**Supabase is optional in the frontend. Always use `isSupabaseEnabled()` guard.**

`artifacts/www-studio/src/lib/supabase.ts` returns `null` when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` env vars are missing. Calling supabase methods without checking will crash.

```typescript
import { supabase, isSupabaseEnabled } from '@/lib/supabase';

// ✅ Correct
if (isSupabaseEnabled()) {
  const { data } = await supabase.from('table').select();
}

// ❌ Wrong — crashes if env vars not set
const { data } = await supabase.from('table').select();
```

## 4. Vite Config — Conditional Base Path

**`vite.config.ts` has a conditional base path controlled by `GITHUB_PAGES` env var.**

```typescript
base: process.env.GITHUB_PAGES === "true" ? "/www-studio/" : "/",
```

- GitHub Pages deployment: `GITHUB_PAGES=true` → base path `/www-studio/`
- Vercel deployment: `GITHUB_PAGES=false` → base path `/`
- Build output goes to `artifacts/www-studio/dist/public` (NOT `dist/`)

## 5. Vercel.json Uses `rewrites` Not `routes`

**`vercel.json` uses `rewrites` for SPA routing, not `routes`.**

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

The rewrite excludes `/api/` paths from being rewritten to index.html.

## 6. pnpm Workspace Filter Name

**The pnpm workspace filter name must match the package.json name exactly.**

```bash
# ✅ Correct — matches package.json name
pnpm --filter @workspace/www-studio run build

# ❌ Wrong — directory name ≠ package name
pnpm --filter www-studio run build
```

## 7. Build Output Path

Frontend builds to `artifacts/www-studio/dist/public` (not `artifacts/www-studio/dist`).

Vercel config expects: `outputDirectory: "artifacts/www-studio/dist/public"`

## 8. TypeScript Project References

Root `tsconfig.json` references these packages:
- `lib/db`
- `lib/api-client-react`
- `lib/api-zod`
- `lib/auth-web`

The frontend (`artifacts/www-studio`) and api-server have their own tsconfigs.

## 9. Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous key |
| `VITE_API_SERVER_URL` | Frontend | API server base URL |
| `GITHUB_PAGES` | Build | Toggles base path |
| `LLM_BASE_URL` | API server | OpenAI-compatible endpoint |
| `LLM_API_KEY` | API server | API key for LLM |
| `LLM_MODEL` | API server | Model name |
| `DATABASE_URL` | API server | PostgreSQL connection |
| `SUPABASE_SERVICE_ROLE_KEY` | API server | Supabase admin key |

## 10. Routing Uses Hash-Based Navigation

The frontend uses `wouter` with `useHashLocation` — all routes are `/#/path`. This is required for GitHub Pages compatibility (no server-side routing).

## 11. API Server Build

The api-server uses `esbuild` via `build.mjs` for bundling, NOT Vite or tsc. The build output goes to `artifacts/api-server/dist/`.

## 12. Database Uses Drizzle ORM

All database access goes through Drizzle ORM. Schema is defined in `lib/db/src/schema/`. The database requires the `pgvector` extension for RAG embedding search.
