# WWW Studio — Agent Notes

**Last Updated:** 2026-06-22
**Status:** AI assistant rewritten for GitHub Pages static hosting — no backend required

---

## Architecture
- **pnpm monorepo** with 4 artifacts + 3 shared packages
- `artifacts/api-server` — Express on `$PORT` (default 8080) — optional, only needed for DB-backed scenes
- `artifacts/www-studio` — React + Vite on `$PORT` (default 3000) — **deployed to GitHub Pages**
- `artifacts/mobile` — Expo on `$PORT` (default 18115)
- `artifacts/mockup-sandbox` — Vite preview server on port 8081
- `packages/db` — Drizzle ORM + PostgreSQL schema
- `packages/api-spec` — OpenAPI YAML spec
- `packages/api-client-react` — Auto-generated React Query hooks (run codegen after spec changes)

## What's New — Scene Workspace (Phase 3-8)
The update adds a complete **Wellness Scenes** workspace — an SVG canvas editor for creating animated wellness/meditation compositions.

### Database
- **`scenes` table** — id, userId, name, slug, description, tags (JSON), status (draft/published), thumbnailUrl, canvasWidth, canvasHeight, elements (JSON), animations (JSON), themeTokens (JSON), linkedProjectId, likes, viewCount, createdAt, updatedAt

### API Routes (`/api/scenes/*`)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/scenes` | List user scenes |
| GET | `/scenes/public` | Public gallery (published, with tag/search filter) |
| POST | `/scenes` | Create scene |
| POST | `/scenes/ai-generate` | AI generate scene from prompt |
| POST | `/scenes/seed` | Seed example scenes |
| GET | `/scenes/tags` | Tag cloud from published scenes |
| GET | `/scenes/trending` | Trending published scenes |
| GET | `/scenes/random` | Random published scene |
| GET | `/scenes/stats` | Aggregate scene statistics |
| GET | `/scenes/:id` | Get scene by ID |
| PATCH | `/scenes/:id` | Update scene |
| DELETE | `/scenes/:id` | Delete scene |
| POST | `/scenes/:id/like` | Like scene |
| POST | `/scenes/:id/view` | Increment view count |
| POST | `/scenes/:id/fork` | Fork scene to user workspace |
| POST | `/scenes/:id/export` | Export as code (react-framer, nextjs, svg, gsap, css-keyframes, lottie, tailwind-framer, cursor-prompt) |
| POST | `/scenes/:id/enhance` | AI enhance scene (modes: deeper-calm, therapy-mode, morning-energy, sleep-wind-down, etc.) |
| POST | `/scenes/:id/chat` | Scene-context-aware AI chat |
| POST | `/scenes/:id/remix` | AI remix of existing scene |
| POST | `/scenes/:id/variant` | AI variant of existing scene |
| POST | `/scenes/:id/similar` | Find similar scenes by tag overlap |
| POST | `/scenes/batch` | Batch publish/unpublish/delete |
| GET | `/scenes/:id/export-html` | Standalone HTML export |
| GET | `/scenes/:id/preview` | Standalone preview page |

### LLM Client (NEW)
- `artifacts/api-server/src/lib/llm.ts` — unified OpenAI-compatible client
- Supports Ollama, OpenRouter, LM Studio, OpenAI via env vars
- `chatComplete()` · `streamChat()` · `visionComplete()` · `isLLMReachable()`
- Config: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_VISION_MODEL`

### Frontend Pages
| Page | Route | Purpose |
|------|-------|---------|
| **Gallery** | `/gallery` | Public scene gallery with embed/fork |
| **Scenes** | `/scenes` | User's scenes list with AI generate, search, CRUD |
| **Scene Editor** | `/scenes/:id` | Full 3-panel SVG canvas editor |
| **Scene Preview** | `/scenes/:id/preview` | Standalone preview (no navbar, embeddable) |
| **Scene Share** | `/scenes/:id/share` | Share page with embed/fork/preview |

### Scene Editor Features
- 3-panel layout: Layers (left) + Canvas (center) + Properties (right)
- WellnessLibrary — 20 shapes: orbs, blobs, geometric, waves, lines, text
- AnimationPresets — 11 presets (gentle-float, gradient-breathe, shadow-pulse, morph, etc.)
- Properties panel — x/y/w/h, fill, opacity, blur, rotation, text props
- Layers panel — reorder, hide, lock, delete per element
- SceneChat — AI chat sidebar with message history + apply changes
- Undo/redo (Ctrl+Z/Ctrl+Y, 30-step history)
- Export to 8 code formats
- Keyboard shortcuts legend

### Rate Limits (production)
- General: 300 req / 15 min (all `/api/*`)
- AI endpoints: 30 req / min (`/api/chat`, `/api/generate`, `/api/clone`, `/api/screenshot-to-code`, `/api/design`, `/api/scenes/*/chat`, `/api/scenes/ai-generate`, `/api/scenes/*/enhance`, `/api/scenes/*/variant`)

### Mobile App Updates
- Scenes tab added to bottom nav (between Projects and Components)
- `app/(tabs)/scenes.tsx` — FlatList with colored orb thumbnails
- `app/scene/[id].tsx` — full-screen WebView scene preview with CSS animations
- `app/gallery.tsx` — public gallery view
- `app/generate-scene.tsx` — AI scene generation from mobile

## Critical Conventions
1. **www-studio uses relative `/api/...` fetch paths** — `@workspace/auth-web` only exports `useAuth`/`AuthUser`, NOT `getApiUrl`.
2. **Always `String(req.params.id)` before Drizzle `eq()`** — params typed as `string | string[]`.
3. **Scene JSON fields stored as strings in DB** — `elements`, `animations`, `themeTokens` are all JSON strings; always `JSON.parse()` on frontend.
4. **LLM client at `artifacts/api-server/src/lib/llm.ts`** — import `chatComplete`, `streamChat`, `visionComplete` — never create OpenAI client instances inline.
5. **`getOrGuestUserId(req)`** — single-user app; returns `req.user.id` if authenticated, else guest UUID.
6. **Canvas is 1440×900px** — elements positioned in px, z-index determines stacking.

## AI Assistant Architecture (GitHub Pages — Static Frontend)

### Key Design Decision
The AI assistant runs **entirely in the browser**. No proxy, no localhost, no backend server required. This is necessary because GitHub Pages is static hosting with no server-side execution.

### `AiChatWidget.tsx` — Global AI Assistant
- **API:** Calls Google Gemini REST API directly (`generativelanguage.googleapis.com/v1beta`)
- **Auth:** User's own Gemini API key (stored in `localStorage` under `www-studio-gemini-config`)
- **Free tier:** 1500 requests/day, no credit card needed — get key at `aistudio.google.com/apikey`
- **Models:** Auto-fetches available free-tier Gemini models, sorted free-first
- **Fallback:** If no API key, shows helpful onboarding with link to get one
- **No dependencies on:** OpenRouter, localhost:8081 proxy, gemini-web2api

### `SceneChat.tsx` — Scene AI Assistant
- **Triple fallback strategy:**
  1. Try local backend API `/api/scenes/:id/chat` (5s timeout)
  2. Try Gemini API with user's key (from localStorage)
  3. Local rule-based AI (`generateLocalSceneResponse()`)
- **Local fallback handles:** add orb, lavender, coral, muted/soften, ocean wave, depth/blur, clear all
- **Action format:** `{ text: string, actions: SceneAction[] }` — actions can be add/update/delete
- **actionLabel helper:** formats action chips ("+ Add Orb", "✎ Update element", "− Remove element")

### Storage Keys
- `www-studio-gemini-config` → `{ key: string, baseUrl: string }`
- `www-studio-selected-model` → string (model ID like "gemini-2.0-flash")

### Removed Dependencies (June 2024)
- `http://localhost:8081/v1` (gemini-web2api proxy) — no longer needed
- OpenRouter (all models now require API key)
- `scripts/start-gemini-proxy.sh` — no longer needed in browser context

## Wellness Color Palette
```
sage:     #7FB5A0   lavender: #B39DC2   coral: #E8957A   sky:  #87BBDB
peach:    #F4C5A1   forest:   #4A7C6B   mist:  #C8D8E0   sand: #E8DDD0
```

## LLM Configuration (env vars)
```
LLM_BASE_URL    — e.g. http://localhost:11434/v1 (Ollama) or https://api.openai.com/v1
LLM_API_KEY     — "ollama" for local, or real key
LLM_MODEL       — e.g. llama3.2 or gpt-4o
LLM_VISION_MODEL — e.g. llava or gpt-4o
```

## Animation Presets (CSS keyframes in `www-studio/src/index.css`)
`none` · `gentle-float` · `gradient-breathe` · `shadow-pulse` · `hover-lift` · `scroll-reveal` · `morph` · `spin-slow` · `fade-in-out` · `scale-pulse` · `elastic-bounce` · `drift`

## Scene Editor State
- `useReducer` with undo/redo (30-step history)
- Actions: `LOAD_SCENE` · `SET_NAME` · `ADD_ELEMENT` · `ADD_ELEMENTS` · `UPDATE_ELEMENT` · `DELETE_ELEMENT` · `MOVE_ELEMENT` · `REORDER_UP` · `REORDER_DOWN` · `SELECT` · `UNDO` · `REDO`
- Auto-save fires every 30s when `isDirty === true`
- Keyboard shortcuts: `Ctrl+Z` undo, `Ctrl+Y` redo, `Delete` delete element, `Ctrl+S` save, `?` shortcut legend

## Adding New API Routes
1. Add route handler to `artifacts/api-server/src/routes/`
2. Add path to OpenAPI spec `artifacts/api-spec/openapi.yaml`
3. Run `pnpm --filter @workspace/api-client-react run codegen` to regenerate hooks
4. OR use raw `fetch("/api/...")` in components for quick one-off endpoints

## Common Pitfalls
- Scene canvas element `transform` must be a string in inline CSS ("rotate(Xdeg)"), not a CSS transform function
- Mobile `app/scene/[id].tsx` uses WebView with injected HTML — CSS animations work here but not via React Native Animated
- Rate limiter middleware must be applied BEFORE `app.use("/api", router)` for AI routes
- Drizzle `insert().values()` returns an array even for single inserts — always destructure: `const [row] = await db.insert(...).returning()`
- Replit-specific files (.replit, .replitignore, replit.md) have been removed — this project is self-hosted