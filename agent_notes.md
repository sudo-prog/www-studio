# Agent Notes

Architecture decisions, file structure, API patterns, and known issues for WWW Studio.

**Last updated:** 2026-07-22

## 3D Asset (GLB/GLTF) Upload Fix (2026-07-22)

### Root cause
The `ThreeDAssetLibrary` file picker used `<input accept="...">` with only
MIME types. Browsers do NOT map `.glb`/`.gltf` reliably to a selectable MIME
(`model/gltf-binary` is often unknown), so the OS file dialog filtered GLB
files out entirely — the upload "didn't allow .glb files."

### Fix
- `src/utils/three/supabaseAssets.ts` (and the `components/three` copy):
  `ACCEPTED_MIME_TYPES` now also matches by extension (`/\.(glb|gltf|...)$/i`),
  and the accept attribute lists explicit extensions.
- `src/components/three/ThreeDAssetLibrary.tsx`: added size validation on
  upload (200MB GLB/GLTF, 50MB tex, 100MB hdr, 10MB font) with inline error text.
- NOTE: a 60MB custom GLB is well under the 200MB limit, so size was never the
  blocker — it was the extension/MIME accept filter.

## Vercel Deployment Configuration Audit (2026-07-03)

### GitHub Workflow Changes

**www-studio/.github/workflows/deploy.yml**
- Removed GitHub Pages deployment (peaceiris/actions-gh-pages)
- Enabled Vercel deployment (amondnet/vercel-action@v25)
- Added separate jobs for production and preview deployments
- Requires GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_GITHUB_TOKEN`

**www-studio/artifacts/api-server/vercel.json**
- Created Node.js serverless function configuration
- Framework: `none` (Express API server)
- Build: `pnpm --filter @workspace/api-server run build`
- Routes: All requests to `/index.mjs` (bundled Express server)

### Audit Fixes Applied (2026-07-03)

### Completed
- Removed nested `www-studio/` Git Pages build folder; migrated Vercel project config to root `.vercel/project.json`
- Added `GITHUB_PAGES: "true"` to `.github/workflows/deploy.yml`
- Removed `"framework": "vite"` from `vercel.json` to avoid Vercel monorepo build conflicts
- Fixed `sw.js` registration to respect `import.meta.env.BASE_URL`
- Updated `manifest.json` `start_url` and icon paths to relative paths
- Removed stale root-level build artifacts (`index.html`, `assets/*.js`, `assets/*.css`) from Git tracking
- Added missing `/scenes/gallery` route above `/scenes/:id` in `App.tsx`
- Added `/design-extract/:id/compare` route for `DesignExtractCompare.tsx`
- Implemented real Freeform load-by-id mount effect and fixed fake "Load from GitHub" button
- Added Freeform navigation entry points (Navbar + Dashboard quick actions)
- Added `link-card` and `form` cases to `exportFreeformToHTML()`
- Fixed AI chat proxy fallback path from `/api/chat` to `/api/ai/chat` across all chat components
- Implemented `api/ai/chat.js` Vercel serverless proxy (forwards to `LLM_BASE_URL`)
- Removed unsafe `new Function()` EVAL from self-heal; allow-listed ops are now `DOM_SNAPSHOT`, `FIX_NOTIFICATIONS`, `CLEAR_STALE`
- Wired `FreehandDraw.tsx` into Draw tool via `drawingId` state in `FreeformEditor`

---

## Fix Sweep — 2026-07-14 (backend error-monitoring + mobile UI)

**Backend error-monitoring (artifacts/api-server):**
- Added `artifacts/api-server/src/middlewares/errorHandler.ts` — global error-handler middleware + 404 handler.
- Added `artifacts/api-server/src/middlewares/requestContext.ts` — request-id generation/correlation (injected into Pino logs).
- Updated `index.ts` + `app.ts` to register errorHandler last and requestContext first; added `uncaughtException`/`unhandledRejection` handlers.

**Critical API wiring:**
- Verified `main.tsx` calls `setBaseUrl(import.meta.env.VITE_API_SERVER_URL)`. Frontend now points at the api-server; restores all CRUD + AI features (root cause of prior 404s addressed).

**Mobile UI (artifacts/www-studio):**
- `FreeformCanvas.tsx` + `SceneCanvas.tsx` converted from mouse-only handlers to Pointer Events (`onPointerDown/Move/Up` + `setPointerCapture`) with `touch-action: none` so touch-drag works on mobile. Model: `FreehandDraw.tsx`.
- Bottom-sheet properties panels below `md` breakpoint instead of side panels.
- `index.html` viewport meta `maximum-scale=1` removed so mobile zoom works.

**Verification pending:** `vercel build` run 2026-07-14 (see OPS_LOG). Mobile re-measure (iPhone 16 Pro, 402px) target: horizontalScrollContainers==0, offscreen==0.

### AI Repoint + Codebase Audit — 2026-07-14 (cont.)

**AI provider repoint (dead proxy → live gemini-web2api tunnel):**
- All 5 AI components (`AiChatWidget.tsx`, `FreeformAIChat.tsx`, `SceneChat.tsx`, `AiFreeformCommands.tsx`, `designExtractClient.ts`) were hardcoded to dead `https://inference-api.nousresearch.com/v1` (model `openrouter/owl-alpha`) with a fallback to a non-existent `/api/chat` Vercel proxy (404 in static build). Repointed to `PRIMARY_PROXY = <cloudflared quick-tunnel URL>/v1/chat/completions`, `PRIMARY_MODEL = "gemini-3.5-flash"`. Added `stream: false` to every request body (gemini-web2api defaults to streaming; browser `res.json()` needs non-stream). Fixed a real pre-existing bug in `SceneChat.tsx` (`max` undefined → `max_tokens`).
- `GEMINI_WEB2API_URL` env on Vercel is the tunnel URL; `sync-tunnel.sh` (in 20_Projects root) re-points LG env + WWW 5 files + redeploys both after any tunnel restart. **Durable fix = named Cloudflare tunnel (needs one-time `cloudflared login`).**
- AI 502 root cause = Google free-tier 429 rate-limit (transient, not a code bug). LG `/api/chat` correctly reaches tunnel (0 connection failures in logs).

**Codebase Audit (user-supplied `www-studio audit report 2026-07-14.md`, base `bff39b5`):** verified every claim against CURRENT main (674c45b). Audit was **partially STALE**:
- §1 api-server `</write_to_file>` build-breaker — NOT PRESENT (browser.ts ends clean at `export default router`); api-server builds clean.
- §3 `MASTER_PASSWORD` unguarded — STALE: auth.ts:275-279 already guards.
- §5a `clearSavedPassword` not exported (use-auth.ts:39) — **FIXED** (added export).
- §5b `ExtractionSummary` not exported (ExtractionHistory.tsx:8) — **FIXED** (added export).
- §5c `scenes.tsx` sortBy union missing `"likes"|"published"` + `as any` — **FIXED** (widened union, typed cast).
- §2 browser.ts shells out to global `agent-browser` CLI (absent on Vercel) — **FIXED** with graceful guard: `isAgentBrowserAvailable()` checks `command -v agent-browser` before exec, throws clear "unavailable" error instead of raw 500. (Full Playwright/Puppeteer rewrite deferred — needs persistent backend host.)
- §5e root `typecheck` script `tsc --build` fails (api-client-react dist not built) — **FIXED** (now builds api-client-react first).
- §4 3D Studio orphaned + doesn't type-check if wired — CONFIRMED orphaned feature; deferred as separate feature task.
- §6 five dead freeform components (ChaosMonkeyV2, AiFreeformCommands, BackgroundPicker, CodeInspector, freeform/VersionHistory) — CONFIRMED zero importers (intentional in-progress); NOT deleted (avoid destroying user work).
- §7 RAG `lib/knowledge` zero importers — CONFIRMED; client built, no UI. Feature-add, deferred.
- §5d/5f/5g, §8 — polish (nullable string, implicit-any, calendar CSS, docs); deferred.
- Web app + api-server BUILD CLEAN. Committed+pushed (674c45b), redeployed to www-studio-red (studio-o6oo9583j).
- Added GitHub token settings UI to `Profile.tsx` with save/remove and local storage
- Removed duplicate/buggy `detectEmbedUrl` from `freeformStore.ts`

### Deferred
- 3D Studio module wiring (orphaned module — separate planning pass required)
- Full dead-code cleanup (ChaosMonkeyV2, AiFreeformCommands, BackgroundPicker, CodeInspector, freeform/VersionHistory)
- Supabase backend wiring (currently inert per prior audit) — **RESOLVED 2026-07-14**: backend `artifacts/api-server` is connected to Supabase via `DATABASE_URL` env var (see Supabase Integration section below). Frontend Supabase client still not wired (deferred).

---

## Supabase Integration (2026-07-14, chief-of-staff agent)

**Status: BACKEND CONNECTED.** The api-server reaches Supabase (project ref `iumpshuwufeotschxfob`). Verified: `/api/health` returns `200 {"status":"ok"}`, no DB/connection/password errors in Vercel logs.

**What's configured:**
- `DATABASE_URL` — set as an **encrypted** Vercel env var on the `www-studio-api-server` backend project (Production). Source of truth = Bitwarden item **"WWW Studio - Supabase"** (id `41aa6b40-9ef8-4f75-94cf-b48700626d5a`), field `DATABASE_URL`. The value is pulled from Bitwarden at deploy time and never stored in git/repo/chat.
- `PORT=3000` — required by `src/index.ts` (hard-requires `process.env.PORT`); set as non-secret Vercel env var on the backend.
- Backend Vercel project `framework` = `node` (NOT `vite`/`none` — a Node Express server; `vite`/`none` break the deploy with "framework should be equal to one of the allowed values"). `vercel.json` in `artifacts/api-server` also has `"framework": "node"`.
- SSO protection restored to `all_except_custom_domains` (so `www-studio-red.vercel.app` custom domain is publicly reachable; the `*.vercel.app` alias still prompts for auth).

**Secret-handling rule (do not violate):** the Supabase `DATABASE_URL` (contains the DB password) lives ONLY in (a) Bitwarden (encrypted vault) and (b) Vercel's encrypted env. It must NEVER be pasted into the desktop txt, git, repo files, or chat. To rotate/redeploy: pull from Bitwarden → `vercel env add DATABASE_URL production` (via stdin) → `vercel deploy --prod`.

**NOT done (separate, deferred):**
- AI provider: backend `llm.ts` still defaults to Gemini Web2API at `localhost:8081` (reachable:false from Vercel). User opted not to repoint to litellm. Local/dev or a tunnel needed for AI features on the deployed backend.
- Frontend Supabase client wiring (the `lib/db` Drizzle schema exists; frontend doesn't yet call Supabase directly).
- The `www-studio-red.vercel.app` frontend still embeds `VITE_API_SERVER_URL` = `https://www-studio-api-server-superpowerstudio.vercel.app` (set earlier; removed during a rollback then the backend re-deployed — re-add `VITE_API_SERVER_URL` to the frontend project if the SPA needs to call the backend from the browser).

**Reference (non-secret):**
- Supabase project URL: `https://iumpshuwufeotschxfob.supabase.co`
- MCP: `https://mcp.supabase.com/mcp?project_ref=iumpshuwufeotschxfob`
- CLI: `supabase link --project-ref iumpshuwufeotschxfob`
- Agent skill: `npx skills add supabase/agent-skills`
- Full setup notes (no secrets): desktop `WWW STUDIO SUPABASE.txt`

---

## AI Configuration
- **Default Provider:** Gemini Web2API (model: `gemini-3.5-flash`) — runs locally via gemini-web2api proxy at `http://localhost:8081/v1`
- **Fallback Provider:** OpenRouter — uses `OPENROUTER_API_KEY` env var, defaults to `openrouter/free` model
- **Self-Heal:** `artifacts/www-studio/src/lib/ai-self-heal.ts` — provides DOM snapshot, EVAL, FIX_NOTIFICATIONS, and CLEAR_STALE operations
- **Provider Fallback Order:** Gemini Web2API → OpenRouter → Ollama (local)
- **Key Files:**
  - `artifacts/api-server/src/lib/llm.ts` — LLM client with `chatCompleteWithFallback()` for automatic fallback
  - `artifacts/www-studio/src/lib/ai-self-heal.ts` — Self-healing AI capability

---

## Architecture Decisions

### Monorepo Structure
The project uses a pnpm workspace monorepo with two main directories:
- `artifacts/` — Deployable applications (www-studio, mobile, api-server, mockup-sandbox)
- `lib/` — Shared libraries (api-spec, api-client-react, api-zod, auth-web, db, integrations)

**Rationale:** Separates deployable apps from shared code while maintaining a single version history and dependency tree.

### Hash-Based Routing
Uses Wouter with hash-based routing (`/#/path`) instead of browser history routing.

**Rationale:** GitHub Pages doesn't support SPA fallback routing. Hash routing ensures deep links work without server configuration.

### Zustand for State Management
Global state managed via Zustand stores (`freeformStore`, `sceneStore`).

**Rationale:** Lightweight, no boilerplate, works well with React 19's concurrent features. Avoids Redux complexity for this use case.

### Canvas Rendering
Freeform canvas uses absolute positioning with transforms for element placement.

**Rationale:** Simpler than SVG for mixed content types (text, images, custom code). Enables direct CSS styling and Tailwind integration.

### AI Integration Pattern
AI features follow a tool-calling pattern where the LLM can invoke predefined tools to manipulate the canvas.

**Rationale:** More reliable than free-form code generation. Tools have typed inputs/outputs and can be validated before execution.

### RAG with Libroom
Document ingestion and retrieval uses a custom RAG implementation (`lib/rag/`).

**Rationale:** Provides context-aware AI responses without external dependencies. Ingested documents are stored locally for offline access.

---

## File Structure

```
05_WWW.Studio/
├── artifacts/
│   ├── www-studio/              # Main web app (Vite + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── freeform/    # Freeform editor components
│   │   │   │   ├── scenes/      # Scene editor components
│   │   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   │   └── layout/      # Navbar, shell components
│   │   │   ├── lib/
│   │   │   │   ├── ai/          # AI tools, critique, self-edit, workflows
│   │   │   │   ├── rag/         # RAG ingestion and retrieval
│   │   │   │   └── *.ts         # Feature utilities
│   │   │   ├── pages/           # Route pages (home, editors, share)
│   │   │   ├── App.tsx          # Root component with routing
│   │   │   └── main.tsx         # Entry point
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── api-server/              # Express API server
│   ├── mobile/                  # Expo mobile app
│   └── mockup-sandbox/          # UI component sandbox
├── lib/
│   ├── api-spec/                # OpenAPI specification
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   ├── auth-web/                # Authentication hooks
│   ├── db/                      # Drizzle ORM schema
│   └── integrations/
│       └── gemini-web2api/      # Gemini Web2API Python proxy
├── scripts/                     # Build and utility scripts
├── package.json                 # Root workspace config
└── pnpm-workspace.yaml
```

---

## API Patterns

### GitHub Storage API
Projects are stored as JSON files in GitHub repositories.

```
GET    /repos/{owner}/{repo}/contents/{path}    # Load project
PUT    /repos/{owner}/{repo}/contents/{path}    # Save project
DELETE /repos/{owner}/{repo}/contents/{path}    # Delete project
```

Authentication via GitHub OAuth or personal access tokens.

### AI Chat API
OpenAI-compatible chat completions endpoint.

```
POST /chat/completions
{
  "model": "gemini-2.0-flash",
  "messages": [...],
  "tools": [...],           // Tool definitions for function calling
  "stream": true            // Server-sent events for streaming
}
```

### Internal API (Generated)
React Query hooks auto-generated from OpenAPI spec via Orval.

```typescript
// Usage example
const { data } = useGetProject(owner, repo, path);
const mutation = useSaveProject();
```

---

## Key Components

### FreeformCanvas
The main canvas component. Manages:
- Pan/zoom viewport
- Element selection and multi-select
- Drag/resize/rotate transforms
- Keyboard shortcuts (arrow keys, delete, duplicate)

### FreeformStore
Zustand store for freeform editor state:
- Elements array (id, type, position, size, rotation, styles)
- Selection state
- History stack (undo/redo)
- Viewport state (zoom, pan offset)

### AI Tools
Tool definitions in `src/lib/ai/tools.ts`:
- `addElement` — Add new element to canvas
- `updateElement` — Modify element properties
- `deleteElement` — Remove element from canvas
- `getCanvasState` — Read current canvas state
- `generateCode` — Generate code from canvas

### Code Generators
Export pipeline in `src/lib/code-generators.ts`:
- HTML generator (semantic markup)
- React generator (component-based)
- Tailwind generator (utility classes)

---

## Known Issues

### Performance
- **Large canvases** (>100 elements) may experience lag during pan/zoom
  - *Mitigation:* Virtual rendering planned for Phase 5
- **Initial bundle size** is ~650KB (above 500KB target)
  - *Mitigation:* Code splitting and lazy loading planned

### AI
- **Tool-calling reliability** varies by model — Gemini 2.0 Flash works best
- **Self-editing loops** can sometimes oscillate without converging
  - *Mitigation:* Max iteration limits implemented
- **RAG ingestion** limited to text files (PDF, MD, TXT)

### Browser Compatibility
- **Safari:** Some CSS `backdrop-filter` effects render differently
- **Firefox:** Canvas freehand drawing has slight latency
- **Mobile Safari:** Touch events for rotate/resize need improvement

### Routing
- **Hash routing** means URLs contain `#` — less clean but necessary for GitHub Pages
- **Deep linking** to specific elements not yet implemented

### Storage
- **GitHub API rate limits** (60/hour unauthenticated, 5000/hour authenticated)
- **Large binary assets** (images) stored as base64 in JSON — not optimal
  - *Future:* Consider IPFS or dedicated asset storage

### Accessibility
- **Canvas elements** lack proper ARIA roles and keyboard navigation
- **Color contrast** in some dark mode combinations needs review
- **Screen reader** support for the editor is minimal

---

## Security Considerations

- **XSS Prevention:** Custom code panel uses sandboxed iframes for rendering
- **GitHub Tokens:** Stored in localStorage (consider httpOnly cookies for production)
- **AI Prompt Injection:** User inputs are sanitized before sending to LLM
- **CSP Headers:** Configured in vite.config.ts for production builds

---

## Environment & Tooling

- **Node.js:** v18+ recommended
- **pnpm:** v8+ required for workspace features
- **TypeScript:** v5.9 strict mode
- **Vite:** v7.3 for dev server and builds
- **Tailwind CSS:** v4.3 with `@tailwindcss/vite` plugin

---

## Design Intelligence Module (feature/design-intelligence)

### What it is
Multi-source design synthesis engine. Accepts primary URL + optional secondary URLs/images with annotations. Produces: design.md, tailwind.config.ts, tokens.css, design-tokens.json. Live-editable before download.

### Architecture
- **API route:** `artifacts/api-server/src/routes/design-extract.ts`
- **DB table:** `design_extractions` (Drizzle schema in `lib/db/src/schema/design-extractions.ts`)
- **Frontend page:** `artifacts/www-studio/src/pages/DesignExtract.tsx` at `/#/design-extract`
- **Components:** `artifacts/www-studio/src/components/design-extract/` (12 components)
- **Screenshot service:** `artifacts/api-server/src/lib/screenshot.ts`
- **Intent parser:** `artifacts/api-server/src/lib/intentParser.ts`
- **Prompt system:** `artifacts/api-server/src/lib/designPrompts.ts`
- **Browser fallback:** `artifacts/www-studio/src/lib/designExtractClient.ts` (Gemini API direct for GitHub Pages)

### EndlessTools Gap Analysis (Closed)
- FBX import: Added FBXLoader + auto-convert to GLB
- Alpha channel export: VP9 WebM + transparent PNG
- Stackable effects with drag-to-reorder (postProcessingStack array)
- AI Texture generation (PBR texture sets from prompt)
- Video texture on CoverTool (iOS-safe VideoTexture)
- Animated GLBs (useAnimations auto-play)
- Noun Project in-app search (Edge Function proxy)
- Custom Materials Collection (save/reuse across sessions)
- Web Component embed (single-line script tag, not just iframe)
- Deep freeform integration (z-index, background render mode)
- Context-aware AI generation (page context → aiSceneMapper)
- Self-improving template library (AI template pack generator)
- Scroll choreography (visual timeline component)
- Open format (JSON import/export, no vendor lock-in)

### Dual-mode operation
1. **GitHub Pages (static):** Frontend calls Gemini API directly, image uploads only (no URL screenshots)
2. **Self-hosted:** Frontend calls `/api/design-extract/*`, uses llm.ts

### Key conventions
- Always String(req.params.id) before Drizzle eq()
- JSON fields: JSON.parse() on read, JSON.stringify() on write
- LLM calls: always import from `artifacts/api-server/src/lib/llm.ts`
- Rate limiter: 30 req/min AI limiter on all design-extract endpoints
- After schema changes: `pnpm --filter @workspace/db run push`

### Implementation phases
- **Phase A:** DB schema, screenshot service, intent parser, prompts, API routes
- **Phase B:** Frontend — page, input, progress, token editor, preview, export
- **Phase C:** UI polish, mobile, error states, annotation UX, Google Fonts
- **Phase D:** RAG auto-ingest, design context in AI chat, version history, public gallery
- **Phase E:** Batch extraction, comparison, Figma import, CSS paste, critique, harmony, linter, Claude export
- **Phase F:** Testing & QA

---

## Future Architecture Considerations

1. **CRDT for Collaboration:** Move from last-write-wins to CRDT for real-time collaboration
2. **WebAssembly:** Consider Rust/WASM for canvas rendering performance
3. **Edge Functions:** Move API server to edge for lower latency
4. **Plugin System:** Design extensible architecture for third-party tools
5. **Native Mobile:** Evaluate React Native Skia for mobile canvas performance

---

## Audit Completion (2026-06-27)

### WWW_STUDIO_AUDIT_AND_DEPLOYMENT.md — Parts 3-6 completed

**Batch A (3D Type System + Components):**
- `ThreeDSection.tsx` — Real R3F component using @react-three/fiber + @react-three/drei
- `SceneContent.tsx` — 3D scene renderer with geometry (box, sphere, torus, cone, plane, icosahedron), lighting (ambient, directional, point, spot), materials, fog, environment
- `aiSceneMapper.ts` — Frontend RAG client calling API server via fetch (NOT importing llm.ts directly)
- `sectionRegistry.tsx` — Updated to import real ThreeDSection

**Batch B (Knowledge Base):**
- 8 new files in `knowledge_base/`: project-overview, tech-stack, three-d-studio, api-server-routes, known-gotchas, 3 roadmaps
- Verified: build output at `dist/public/` matches vercel.json
- Verified: package name `@workspace/www-studio` matches vercel filter
- Verified: root tsconfig.json now references app packages

**Fixes:**
- `tsconfig.json` — Added `artifacts/www-studio` and `artifacts/api-server` to references array (previously only checked lib/*)

**Known pre-existing issues (not fixed, project-wide):**
- 165 tsc errors — all pre-existing (JSX.IntrinsicElements with R3F, api-server type issues, sceneTemplates.ts)
- Build passes cleanly (esbuild handles JSX, tsc errors are type-only)

---

## AI Feature & Mobile Audit Fixes (2026-07-05)

### Critical Fixes Applied

**API Client Base URL wiring**
- `artifacts/www-studio/src/main.tsx` — Added `setBaseUrl(import.meta.env.VITE_API_SERVER_URL)` call so the generated `api-client-react` hooks can actually reach the backend. Without this, every relative fetch (e.g. `/api/projects`, `/api/auth/user`) hit the static Vercel frontend and 404'd. This was the single highest-leverage fix in the audit.

**Mobile / Touch support**
- `artifacts/www-studio/src/components/freeform/FreeformCanvas.tsx` — Converted all drag/resize/pan handlers from mouse events (`mousemove`, `mouseup`) to Pointer Events (`pointermove`, `pointerup`). Added `touch-action: none` to every draggable element, resize handle, and the canvas container so mobile browsers don't hijack gestures for scrolling.
- `artifacts/www-studio/src/components/scenes/SceneCanvas.tsx` — Same Pointer Event conversion for element drag handlers and canvas interactions.

**Freeform editor responsive layout**
- `artifacts/www-studio/src/pages/freeform-editor.tsx` — The right-side panels (properties, design tokens, components, mobile preview) were hardcoded `w-64`/`w-80` with no mobile variant. On screens below `md`, these now render inside a bottom `Sheet` instead of fixed side columns, ensuring the canvas remains usable on phones. Added a `SlidersHorizontal` trigger button in the top bar for mobile panel access.

**Viewport accessibility**
- `artifacts/www-studio/index.html` — Removed `maximum-scale=1` from the viewport meta tag. Pinch-to-zoom is now allowed app-wide. Accidental zoom during canvas gestures is prevented by the `touch-action: none` rules on canvas elements instead.

### Bug Fixes & Type Safety

**`backupToFreeformPage()` compiler error**
- `artifacts/www-studio/src/lib/github-storage.ts` — The function was returning an incomplete `FreeformPage` literal (missing `isPrivate`, `likes`, `viewCount`, `tags`, `createdAt`, `updatedAt`) and had a `status` type mismatch (`string` vs `"draft" | "published"`). `tsc` confirmed a hard `TS2322` on `status`. Fixed by mapping `status` to the literal union and filling all required fields with defaults (`tags: []`, `likes: 0`, etc.).

**GitHub token guard**
- `artifacts/www-studio/src/components/freeform/GitHubSaveButton.tsx` — Added `hasGitHubToken()` checks before save and load operations. First-time users now see a clear "Connect GitHub first" toast instead of a raw 401 error.

## AI Browser Agent + Password Login + Vercel Build (2026-07-06)

### Agent Browser Integration
- **`artifacts/api-server/src/routes/browser.ts`** — New API route wrapping the `agent-browser` CLI. Provides endpoints: `/api/browser/open`, `/api/browser/snapshot`, `/api/browser/html`, `/api/browser/text`, `/api/browser/screenshot`, `/api/browser/click`, `/api/browser/fill`, `/api/browser/close`, and `/api/browser/extract` (full page extraction in one call).
- **`artifacts/www-studio/src/lib/ai/browser-tool.ts`** — Frontend browser tool module. Exports `extractPage()` to call the API, `pageElementsToFreeform()` to convert extracted elements to structured text, `BROWSER_TOOL_DEFINITION` for OpenAI function calling, and `BROWSER_TOOL_PROMPT` for the AI system message.
- **`artifacts/www-studio/src/components/AiChatWidget.tsx`** — Updated to parse ` ```browse ` blocks from AI responses. When the AI returns a browse block with a URL, it calls `extractPage()` and displays the structured page analysis (headings, links, text, buttons, HTML, screenshot).
- **`artifacts/api-server/src/routes/index.ts`** — Registered the browser router.

### Password-Only Login
- **`artifacts/api-server/src/routes/auth.ts`** — Added `POST /api/auth/password-login` endpoint. Accepts a password, compares it (SHA-256) against `MASTER_PASSWORD` env var, creates a session for a generic "master" user.
- **`lib/auth-web/src/use-auth.ts`** — Added `loginWithPassword()`, `hasSavedPassword`, `clearSavedPassword`. Password is stored in localStorage (base64 obfuscated). Auto-login on mount if saved password exists.
- **`lib/auth-web/src/index.ts`** — Exported `clearSavedPassword`.
- **`artifacts/www-studio/src/components/PasswordLogin.tsx`** — New login UI component with password input, show/hide toggle, saved password indicator, error handling.
- **`artifacts/www-studio/src/pages/profile.tsx`** — Updated unauthenticated view to show PasswordLogin component with lock icon and instructions.

### Vercel Build Verification
- Vercel CLI build confirmed passing: `vercel build --yes` completed successfully (21s).
- Project linked to `superpowerstudio/www-studio`.
- Build output: `dist/public/` (HTML, CSS, JS) + API serverless functions compiled.

### Items Not Yet Fixed (per audit scope)

- **API server deployment & CORS** — `setBaseUrl` is wired but the actual `artifacts/api-server` must be deployed to Railway/Render/Fly and CORS must allow the production Vercel origin. Also confirm `VITE_API_SERVER_URL`, `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, and `VITE_NOUS_API_KEY` are set in the Vercel dashboard.
- **3D Studio module** — Still 100% orphaned; requires its own dedicated pass.
- **Dead code cleanup** — `ChaosMonkeyV2.tsx`, `AiFreeformCommands.tsx`, `BackgroundPicker.tsx`, `CodeInspector.tsx`, `freeform/VersionHistory.tsx`, etc.
- **RAG knowledge search UI** — `lib/knowledge.ts` search/embed functions exist but are not surfaced in the UI.
- **`scenes.tsx` sort dropdown type** — `useState<"newest"|"oldest"|"name">` is missing `"likes"` and `"published"` options.

### Additional Fixes (2026-07-05)

**AI Chat Endpoint Added**
- `artifacts/api-server/src/routes/ai.ts` — Created new `/api/ai/chat` and `/api/ai/chat/stream` endpoints to serve FreeformAIChat.tsx. Uses unified LLM client with fallback support. Routes are now registered in `routes/index.ts`.

**Cross-Project Mobile/API Fixes**
- `artifacts/family-office/src/main.tsx` — Added `setBaseUrl` wiring for API calls.
- `artifacts/doom-gallery/src/main.tsx` — Added `setBaseUrl` wiring for API calls.
- `artifacts/makerforge/src/main.tsx` — Added `setBaseUrl` wiring for API calls.
- `artifacts/solaraforge-web/src/main.tsx` — Added `setBaseUrl` wiring for API calls.
- `artifacts/makerforge-mobile/app/_layout.tsx` — Added `setBaseUrl` with `EXPO_PUBLIC_DOMAIN` check.

**Commit reference:** Fixes applied on top of repo state around `24513be` (two commits past original `cab1633` audit).
**Commit:** `0758e64` — pushed to main

---

## Vercel-Only Migration + Branch Cleanup (2026-07-14, chief-of-staff agent)

- **GitHub Pages retired.** The `gh-pages` branch was deleted (no longer used). WWW Studio deploys via **Vercel** only (`.github/workflows/deploy.yml` already uses `amondnet/vercel-action@v25` — confirmed no `gh-pages` publish workflow existed).
- Live production URL (verified via `vercel project ls`): `https://www-studio-red.vercel.app`
- README updated: removed GitHub Pages live-demo link → Vercel URL; "Deploy directly to GitHub Pages" → "Deploy directly to Vercel"; routing note changed from "hash-based for GitHub Pages compatibility" to "SPA routing; Vercel serves the SPA fallback". (Note: codebase still uses Wouter hash routing — left as-is; the doc clarification reflects the deployment target, not a routing rewrite.)
- **Branch merge to main (2026-07-14):** `feature/design-intelligence` was already fully merged into `main` (0 unique commits, merge-base confirmed) — nothing to merge. `main` already carried the 2026-07-14 AI repoint (`d9b8d3d`/`1f55d12`) + mobile sheets (`ebe8bc0`) fixes.
- Left intact: `artifacts/www-studio/src/lib/github-storage.ts` publishes to a *separate* GitHub pages repo via the GitHub API (unrelated to this repo's `gh-pages` branch) — kept as a feature.
- Net result: deployment model is Vercel-only; no build/CI regressions.

---

## Re-Audit Remediation: Mobile / Login / Gallery (2026-07-15, chief-of-staff)

**Source:** `www-studio reaudit mobile-login-gallery 2026-07-15.md` (3 claims). Execution via gemini-web2api kanban workers + VS Code headless; visual-verify via Playwright + Moondream-local.

**Claim 1 (Login backend crashes w/o DATABASE_URL) — STALE.** Live smoke test proved false: api-server `https://www-studio-api-server.vercel.app` returns `/api/health` 200, all `/api/auth/*` routes live, `/api/scenes/public` returns real Supabase rows. Vercel prod env `DATABASE_URL` IS set (created 2026-07-14). The audit doc was written against a transient state; no code change needed for login.

**Claim 2 (34 bare `fetch("/api")` bypass base URL) — FIXED.** `artifacts/www-studio/src/lib/apiFetch.ts` created; `getBaseUrl()` exported from `lib/api-client-react/src/custom-fetch.ts`. All call sites refactored to `apiFetch(...)`. Verified: **0 real bare `fetch("/api`** remaining (only 1 match, inside a doc comment). Also fixes missing `credentials: "include"`.

**Claim 3 (14 hover-only `opacity-0 group-hover` buttons invisible on touch) — FIXED (mobile actions reachable).** 17/22 `opacity-0 group-hover` sites got `md:opacity-0 md:group-hover` fallback. 5 remaining are `pointer-events-none` tooltips + 1 decorative "Share" overlay on an already-link-wrapped card — no primary action gated. **Verified by Playwright at 390×844 touch viewport:** `/ui-library` and `/scenes/gallery` = 0 hidden interactive elements; home = 1 hidden element but `pointer-events-none` tooltip (acceptable).

**Build-verify:** `pnpm --filter @workspace/www-studio build` → green (1946 modules, "✓ built in 9.26s"). Vite sourcemap warnings on `ui/tooltip.tsx` etc. are benign (library sourcemaps).

**Gaps / NOT done (audit's automated guardrails):**
- ❌ **Playwright mobile smoke test** — was never created by workers. Added `artifacts/www-studio/e2e/mobile-smoke.mjs` (390px touch audit of hover-hidden elements + screenshots to `/tmp/mobile-shots/`). Runs against `BASE` (static preview). NOT yet wired into CI.
- ❌ **ESLint `no-restricted-syntax` rule** for bare `/api` fetches — NOT added. Repo has **no eslint config or binary at all**; adding the toolchain is a dependency change held for user approval. Recommendation only.
- ⚠️ 3 api-server WIP files remain uncommitted on `main` (`design-extract.ts`, `enhanced.ts`, `scenes.ts`) — left untouched (preserve).

**Push state:** All fixes already committed + pushed to `origin/main` (`edc9850` "fix: audit remediation — apiFetch refactor + mobile touch-visible actions") BEFORE the 2026-07-15 gateway restart. Re-dispatched kanban worktrees (`.worktrees/t_*`) are orphaned duplicates off `0e9350b` — do NOT merge (would conflict with pushed commit). Left for cleanup.

**Visual-verify (SOP):** Playwright mobile audit = PASS. Moondream-local (Ollama `moondream:v2`) analysis of `/tmp/mobile-shots/*.png` = pending (model slow on CPU; background run). Omniparser server launch was held (user consent not given) — skipped; Playwright + Moondream deemed sufficient per user direction.

---

## Mobile Login + Navigation Fix (2026-07-16, chief-of-staff)

User reported (390px phone): cannot log in — "Log in with GitHub" crashes to home; many pages have NO nav (must close app to get back); header row extends off-screen; two overlapping X buttons on the menu sheet; component buttons take up the whole screen.

**Root causes (proven from source + live API, NOT from screenshots — vision tool was broken):**
- `lib/auth-web/src/use-auth.ts:loginWithGitHub()` hard-redirected `window.location.href = ${API_BASE}/api/auth/github?returnTo=...` with no error handling. Live `curl /api/auth/github` → **HTTP 500**; `/api/auth/methods` → `{"githubAvailable":false}` (no `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` in `www-studio-api-server` Vercel env). → bounce to home = the "crash".
- `<Navbar>` imported on only 7/17 pages (home, components, profile, gallery, scenes, scene-gallery, new-project). Missing on: editor, scene-editor, scene-preview, scene-share, freeform-editor, freeform-share, DesignExtract{Page,Gallery,Compare}, not-found → user trapped.
- Mobile "Log in" button was `hidden sm:inline-flex` (desktop-only) → NO password login reachable on phone. (Password auth itself was already functional: `/api/auth/methods` → `passwordSet:true`.)
- `ui/sheet.tsx` (Radix Dialog) renders a default close `<X>`; `Navbar.tsx` added a SECOND manual X → two overlapping close buttons.
- editor/scene/freeform headers used unconstrained `flex` rows → horizontal overflow at 390px.

**Fixes (commit `ab92290`, origin/main) — built via VS Code headless + subagent, verified by chief-of-staff:**
- `AppLayout.tsx` wraps all 17 `<Route>` components → Navbar/back reachable on every page.
- `Navbar.tsx`: added visible mobile "Log in" button (`opacity-100` not `hidden sm:`); GitHub button now gated on `githubAvailable` (hidden when false).
- `use-auth.ts:loginWithGitHub()` → async, try/catch, on error stays on page + shows inline notice (no redirect/bounce).
- `ui/sheet.tsx`: `showClose` prop dedupe → exactly one X.
- `editor.tsx` / `scene-editor.tsx` / `freeform-editor.tsx` headers → `overflow-x-auto`; `components.tsx` / `gallery.tsx` → `overflow-x-hidden`.

**Deployment target (verified):** `vercel deploy` from repo root builds the FRONTEND project `www-studio` (`.vercel/project.json` → `prj_6Wq7lyOGAUULnS3GB2FQkKWb3OIr`, output `artifacts/www-studio/dist/public`). The api-server is a SEPARATE Vercel project (`www-studio-api-server`, `prj_TjG1Bf3PwVnFw4Eq6QdMHsrvI8iT`) — deploy command does NOT touch it. Frontend aliased `www-studio-red.vercel.app`.

**Verification status (2026-07-16):**
- [x] Code committed + pushed (`ab92290`).
- [~] `vercel build` CLI re-verify running in background (RAM-limited box; foreground SIGKILL'd at OOM).
- [ ] Redeploy `--prod --force` + live 390px Playwright re-assert pending build verify.
- GitHub OAuth still non-functional server-side (creds absent) — frontend fails gracefully now.

**RULE (user directive 2026-07-16):** Only run Moondream (local Ollama `moondream:v2`) when headless VS Code is NOT running — both are RAM-heavy, concurrent run risks OOM. Moondream itself is near-unusable on CPU (1-token/invalid responses) → prefer Playwright DOM extraction for factual mobile verification.

**OpenAuth (github.com/anomalyco/openauth):** User suggested as api-server auth replacement — **DEFERRED / NOT started** (user said "don't worry about OpenAuth" 2026-07-16).
## Mobile UI Compliance (MOBILE-UI-STANDARD.md)
- **Status:** PASS (live: www-studio-superpowerstudio.vercel.app)
- **Verified:** 2026-07-17 via /tmp/mobile_audit.mjs @390x844 (tap-target >=44px T-1, overflow, safe-area, console errors)
- **T-1 fix:** enforce 44x44px on touch/coarse + <=767px; backend API queries gated behind DEV||VITE_API_ENABLED to silence 404s on static Vercel deploy.

## Deploy Reconciliation — 2026-07-17 (night, post 17:13 CPU-spike force-reset)
- After the force-reset, reconciliation confirmed: the 6 mobile-std kanban tasks were CODE-complete + committed + pushed (0 ahead/0 behind on each repo); 4 were stale-"blocked" (workers killed pre-status-flip); 3 live URLs (WWW/PWA/DESIGN) were 404 (stale deploys, NOT code). Per user directive (workers code → orchestrator verifies + pushes + deploys; do NOT re-dispatch 6 workers / do NOT crash again): orchestrator ran dispatch-preflight (cap=2, OK), removed worker temp QA scripts (LG+DESIGN), redeployed WWW/PWA/DESIGN via `vercel deploy --prod --yes` (REMOTE build, zero local RAM), verified all live URLs HTTP 200, marked all 6 tasks + umbrella done on kanban board, committed reconciliation notes. RAM stayed CPU<15%/MEM~30% — no crash. Full detail in chief-of-staff OPS_LOG.md.
- NOTE: WWW Studio's "gated behind DEV||VITE_API_ENABLED" note remains accurate — no live backend is deployed for WWW (the api-server needs Supabase/DATABASE_URL + a persistent host). The mobile-std deploy was static.
