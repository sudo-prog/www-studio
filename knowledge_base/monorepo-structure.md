# www-studio Monorepo Structure

## Critical: File Paths

All frontend app code lives at `artifacts/www-studio/src/` NOT at `src/`.
All API server code lives at `artifacts/api-server/src/`.
Shared libraries live at `lib/`.

## Package Names
- Frontend: `@workspace/www-studio` (see `artifacts/www-studio/package.json`)
- API server: `@workspace/api-server` (see `artifacts/api-server/package.json`)
- Database: `@workspace/db` (see `lib/db/package.json`)

## Frontend cannot import from api-server
The frontend (Vite/React) does NOT have access to `artifacts/api-server/src/lib/llm.ts`.
All AI calls go through HTTP fetch to the api-server endpoints.
The api-server URL is configured via `VITE_API_SERVER_URL` env var.

## Supabase is optional in frontend
`artifacts/www-studio/src/lib/supabase.ts` returns null when env vars are missing.
Always use `isSupabaseEnabled()` before calling supabase in frontend code.

## Key env vars
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_SERVER_URL`, `GITHUB_PAGES`
- API server: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Deploy targets
- GitHub Pages: active, base path `/www-studio/`, controlled by `GITHUB_PAGES=true`
- Vercel: configured via `vercel.json`, base path `/`, `GITHUB_PAGES=false`

## Build output
- Frontend builds to `artifacts/www-studio/dist/public`
- Build command: `pnpm --filter @workspace/www-studio run build`
- Typecheck: `pnpm run typecheck` (from repo root, uses project references)

## Database
- Uses Drizzle ORM via `@workspace/db` package
- Schema at `lib/db/src/schema/`
- Requires pgvector extension for RAG embedding search
- Connection via `DATABASE_URL` env var
