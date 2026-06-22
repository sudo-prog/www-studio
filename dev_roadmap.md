# WWW Studio — Dev Roadmap

## Phase 0: Foundation ✅
- [x] pnpm monorepo (api-server, www-studio, mobile, mockup-sandbox, db, api-spec, auth-web)
- [x] PostgreSQL + Drizzle ORM — schema pushed
- [x] Express API server on $PORT (default 8080)
- [x] React + Vite frontend on $PORT (default 19332)
- [x] DB tables: projects, gallery, chat, snapshots, sessions, users, scenes
- [x] All 4 workflows running and healthy

## Phase 1: Core Website Builder ✅
- [x] Gallery page with template cards + search
- [x] Text-to-site generation (AI + heuristic fallback)
- [x] Screenshot-to-code (vision LLM + fallback)
- [x] Visual editor with component tree inspector
- [x] AI chat widget inside editor
- [x] Project CRUD (save, load, duplicate, delete)
- [x] Export to HTML / React / Next.js
- [x] Snapshot versioning (create + restore)
- [x] Design panel (theme tokens, fonts, color palette)
- [x] Publish flow (status toggle draft → published)
- [x] Clone / fork project

## Phase 2: Unified LLM Client ✅
- [x] `artifacts/api-server/src/lib/llm.ts` — single OpenAI-compatible client
- [x] Supports Ollama · OpenRouter · LM Studio · OpenAI via env vars
- [x] `LLM_BASE_URL` `LLM_API_KEY` `LLM_MODEL` `LLM_VISION_MODEL`
- [x] `chatComplete()` one-shot · `streamChat()` SSE · `visionComplete()` for screenshots
- [x] `isLLMReachable()` health check · `getLLMProvider()` label
- [x] `GET /llm/config` endpoint
- [x] All routes (chat, generate, screenshot-to-code) use unified client

## Phase 3: Scenes Workspace ✅
- [x] `scenes` DB table + Drizzle schema (with description, tags, thumbnailUrl, linkedProjectId)
- [x] Full REST CRUD: `GET/POST /scenes` · `GET/PATCH/DELETE /scenes/:id`
- [x] `POST /scenes/ai-generate` — AI scene from prompt
- [x] `POST /scenes/:id/export` — 4 formats: react-framer, nextjs, cursor-prompt, svg
- [x] OpenAPI spec + codegen for all scenes endpoints
- [x] `/scenes` gallery page — wellness palette strips, search, empty state
- [x] 3-panel SVG canvas editor at `/scenes/:id`
- [x] WellnessLibrary — 20 shapes: orbs, blobs, geometric, waves, lines, text
- [x] AnimationPresets — 7 presets (Gentle Float, Breathe, Shadow Pulse, Morph…)
- [x] SceneExport — 4 code formats with copy + download
- [x] Layers panel — reorder (↑↓), hide, lock, delete per element
- [x] Properties panel — x/y/w/h, fill, opacity, blur, rotation, text props
- [x] Undo / redo (Ctrl+Z / Ctrl+Y, 30-step history)
- [x] Wellness CSS tokens + 5 keyframe animations in index.css

## Phase 4: AI Chat in Scene Editor ✅
- [x] `POST /scenes/:id/chat` — scene-context-aware LLM endpoint
- [x] SceneChat sidebar component with message history + loading states
- [x] AI understands current canvas elements + selected element
- [x] AI responds with text + structured canvas actions (add/update/delete)
- [x] One-click "Apply N changes" button commits AI suggestions to canvas
- [x] 8 suggestion chips for common prompts
- [x] Sliding 300px panel toggled by "AI Chat" button — inspector hides when chat open

## Phase 5: Mobile Sidekick ✅
- [x] Scenes tab added to mobile bottom nav (between Projects and Components)
- [x] `app/(tabs)/scenes.tsx` — FlatList with colored orb thumbnails, search, pull-to-refresh
- [x] `app/scene/[id].tsx` — full-screen WebView scene preview with live CSS animations
- [x] CSS keyframe animations (gentle-float, gradient-breathe, shadow-pulse, etc.) injected into WebView HTML
- [x] Scene detail: share button, element count, status label, back navigation
- [x] Root stack updated with `scene` route (headerShown: false)

## Phase 6: Scene AI Polish ✅
- [x] SceneExport — "Embed / Share" tab with iframe snippet + preview URL copy
- [x] Live preview mode at `/scenes/:id/preview` — standalone full-screen page, embeddable as iframe
- [x] Scene cards show description (if set) + tags chips
- [x] Fork / Duplicate scene from dropdown on every card
- [x] Publish / Unpublish toggle per scene (status draft ↔ published)
- [x] Scenes page shows "Public" badge on published cards

## Phase 7: Gallery & Sharing ✅
- [x] `/gallery` public gallery page — shows published scenes only
- [x] Gallery card: SVG preview, Fork button, Embed modal, Preview link
- [x] `EmbedModal` — copy iframe code + open live preview
- [x] Navbar updated: "Public" nav link + Globe icon button → /gallery
- [x] Home page Scenes Showcase section (grid of 6 scenes + wellness palette strip)
- [x] Home page "Wellness Scenes" CTA button added to hero

## Phase 8: Production Hardening ✅
- [x] `express-rate-limit` installed and applied
  - General: 300 req / 15 min (all /api routes, skips /health)
  - AI: 30 req / min (chat, generate, clone, screenshot-to-code, design, scenes/ai-generate, scenes/*/chat)
- [x] React `ErrorBoundary` component wraps entire App
  - Shows friendly error UI with "Try Again" + "Go Home" buttons
  - Displays stack trace in dev mode only
- [x] `/scenes/:id/preview` is a standalone embeddable page (no Navbar, no auth)
- [x] Rate limit responses return `{ error: "..." }` JSON
- [x] All 4 workflows healthy, API rebuilt with rate limiter included

## Phase 9: Gemini Web2API Integration ✅
- [x] Copied gemini-web2api Python proxy into `lib/integrations/gemini-web2api/`
  - Core Python files: `__init__.py`, `__main__.py`, `server.py`, `gemini.py`, `models.py`, `config.py`, `tools.py`, `multimodal.py`
  - Project files: `requirements.txt`, `pyproject.toml`, `Dockerfile`, `docker-compose.local.yml`, `config.example.json`
  - Standalone script: `gemini_web2api.py`
- [x] Updated `artifacts/api-server/src/lib/llm.ts` with Gemini Web2API support
  - Added `GEMINI_WEB2API_BASE_URL` env var (default: `http://localhost:8081/v1`)
  - Added `GEMINI_WEB2API_MODEL` env var (default: `gemini-2.0-flash`)
  - Added `getGeminiWeb2APIClient()` function returning an OpenAI-compatible client
  - Added `isGeminiWeb2APIReachable()` health check
  - `getLLMProvider()` detects "Gemini Web2API" from base URL containing `localhost:8081` or `gemini`
- [x] Updated `artifacts/api-server/src/routes/chat.ts` with real LLM calls
  - Replaced mock `generateAIReply()` with actual LLM calls via `chatComplete()` / `streamChat()`
  - Added `POST /chat/stream` SSE endpoint for streaming responses
  - Falls back to heuristic replies if LLM is unreachable
  - Supports all providers: OpenAI, Ollama, OpenRouter, LM Studio, Gemini Web2API
- [x] Updated `artifacts/api-server/src/routes/generate.ts` to use unified LLM client
  - Replaced direct `getOpenAI()` with `chatComplete()` from `llm.ts`
  - Removed duplicate `getOpenAI()` function
  - Falls back to heuristic tree generation if LLM is unreachable
- [x] Updated `artifacts/api-server/src/routes/screenshot-to-code.ts` to use unified LLM client
  - Replaced direct `getOpenAI()` with `visionComplete()` from `llm.ts`
  - Removed duplicate `getOpenAI()` function
  - Falls back to heuristic tree if LLM is unreachable
- [x] Created `scripts/start-gemini-proxy.sh` startup script
  - Checks for Python 3 and httpx dependency
  - Creates default `config.json` from `config.example.json` if missing
  - Starts the gemini-web2api proxy on configurable port (default 8081)
- [x] Updated `artifacts/api-server/src/routes/health.ts` with provider health checks
  - Added `GET /health` endpoint with detailed AI provider status
  - Reports primary provider and Gemini Web2API proxy reachability
  - Lists all available (reachable) providers
