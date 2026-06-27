# WWW Studio — Deployment Guide

Step-by-step deployment instructions for all targets.

---

## 1. GitHub Pages (Current Live Method)

This is the active deployment target. The app is built with a base path of `/www-studio/`.

### Build

```bash
GITHUB_PAGES=true pnpm --filter @workspace/www-studio run build
```

Output: `artifacts/www-studio/dist/public/`

### Deploy Options

#### Option A: GitHub Actions (recommended)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --no-frozen-lockfile
      - run: GITHUB_PAGES=true pnpm --filter @workspace/www-studio run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: artifacts/www-studio/dist/public
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in repo Settings → Pages → Source: GitHub Actions.

#### Option B: Manual deploy to `gh-pages` branch

```bash
GITHUB_PAGES=true pnpm --filter @workspace/www-studio run build
cd artifacts/www-studio/dist/public
git init
git checkout -b gh-pages
git add .
git commit -m "deploy"
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git push -f origin gh-pages
```

Set Pages source to `gh-pages` branch, root folder.

### Post-Deploy Checklist

- [ ] Base path is `/www-studio/` (controlled by `GITHUB_PAGES=true`)
- [ ] All asset paths are relative (Vite handles this with base path)
- [ ] Hash-based routing works (`/#/path` format)
- [ ] No 404s on page refresh (hash routing avoids this)
- [ ] `VITE_API_SERVER_URL` points to live API server
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (if using Supabase)

---

## 2. Vercel Deploy

Vercel config exists at `vercel.json` but requires dashboard setup.

### Configuration (`vercel.json`)

```json
{
  "buildCommand": "pnpm --filter @workspace/www-studio run build",
  "outputDirectory": "artifacts/www-studio/dist/public",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "env": { "GITHUB_PAGES": "false" },
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Setup Steps

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import the GitHub repository
3. Vercel should auto-detect `vercel.json`
4. Set environment variables in Vercel dashboard:
   - `GITHUB_PAGES` = `false`
   - `VITE_API_SERVER_URL` = your API server URL
   - `VITE_SUPABASE_URL` = your Supabase URL (optional)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key (optional)
5. Deploy

### Notes

- Base path is `/` (not `/www-studio/`)
- SPA rewrite excludes `/api/` paths
- `sw.js` has special cache headers

---

## 3. Environment Variables

### Frontend (`artifacts/www-studio/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_PAGES` | Yes | `"true"` for GitHub Pages, `"false"` for Vercel |
| `VITE_API_SERVER_URL` | Yes | Base URL of the API server (e.g., `https://api.example.com`) |
| `VITE_SUPABASE_URL` | No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key |

### API Server (`artifacts/api-server/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_BASE_URL` | Yes | OpenAI-compatible API endpoint |
| `LLM_API_KEY` | Yes | API key for LLM provider |
| `LLM_MODEL` | Yes | Model name (e.g., `gpt-4`, `claude-3`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key for admin operations |
| `SESSION_TTL` | No | Session lifetime (default: 7 days) |
| `PORT` | No | Server port (default: 8787) |

---

## 4. API Server Deployment

The API server is an Express app built with esbuild.

### Build

```bash
pnpm --filter @workspace/api-server run build
```

Output: `artifacts/api-server/dist/index.mjs`

### Run

```bash
LLM_BASE_URL=https://api.openai.com/v1 \
LLM_API_KEY=sk-... \
LLM_MODEL=gpt-4 \
DATABASE_URL=postgres://... \
pnpm --filter @workspace/api-server start
```

### Deploy to Railway/Render/Fly.io

1. Set the build command: `pnpm --filter @workspace/api-server run build`
2. Set the start command: `pnpm --filter @workspace/api-server start`
3. Set all required environment variables
4. Ensure PostgreSQL is provisioned with `pgvector` extension

### Docker (example)

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/api-server run build
EXPOSE 8787
CMD ["node", "artifacts/api-server/dist/index.mjs"]
```

---

## 5. Supabase Setup Checklist

If using Supabase for auth, storage, and database:

### Project Creation

- [ ] Create a new Supabase project at [supabase.com](https://supabase.com)
- [ ] Note the project URL and anon key
- [ ] Note the service role key (for API server)

### Database Schema

- [ ] Run migrations from `lib/db/src/schema/` (Drizzle ORM)
- [ ] Enable `pgvector` extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- [ ] Create `knowledge_chunks` table with embedding column (for RAG)
- [ ] Set up Row Level Security (RLS) policies as needed

### Authentication

- [ ] Enable Email auth provider
- [ ] Configure OAuth providers if needed (Google, GitHub)
- [ ] Set site URL in Auth settings to match deployment URL

### Storage

- [ ] Create a bucket for 3D assets (if using 3D asset library)
- [ ] Create a bucket for project assets (images, fonts, videos)
- [ ] Set appropriate bucket policies

### Environment Variables

- [ ] Set `VITE_SUPABASE_URL` in frontend build
- [ ] Set `VITE_SUPABASE_ANON_KEY` in frontend build
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in API server

---

## 6. GitHub Backup System (Client-Side)

The app includes a client-side GitHub backup system (`lib/github-storage.ts`):

- Stores project backups as JSON in `sudo-prog/www-studio-backup` repo
- Requires a GitHub Personal Access Token with `repo` scope
- Token stored in browser `localStorage` under `github_token`
- Used by `GitHubSaveButton` and `PublishButton` components

### Setup

1. Create a GitHub PAT with `repo` scope
2. In the app, enter the token when prompted
3. Backups are saved to `projects/` folder in the backup repo

---

## Quick Reference: Build Commands

| Target | Command | Output |
|--------|---------|--------|
| Frontend (GitHub Pages) | `GITHUB_PAGES=true pnpm --filter @workspace/www-studio run build` | `artifacts/www-studio/dist/public/` |
| Frontend (Vercel) | `pnpm --filter @workspace/www-studio run build` | `artifacts/www-studio/dist/public/` |
| API Server | `pnpm --filter @workspace/api-server run build` | `artifacts/api-server/dist/` |
| Typecheck all | `pnpm run typecheck` | (no output, exit code only) |
| Dev server | `pnpm --filter @workspace/www-studio run dev` | http://localhost:3000 |
| API dev | `pnpm --filter @workspace/api-server run dev` | http://localhost:8787 |
