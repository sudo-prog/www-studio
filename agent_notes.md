# Agent Notes

Architecture decisions, file structure, API patterns, and known issues for WWW Studio.

**Last updated:** 2026-07-14

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
- Supabase frontend wiring (currently inert per prior audit)

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
