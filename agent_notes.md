# WWW Studio — Agent Notes

**Last Updated:** 2026-06-26
**Status:** Phases 0-14 complete. Enhanced Phases 15-17 in progress.

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

## Frontend Architecture (www-studio)

### Pages & Routes (Wouter hash-based)
| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page with scenes showcase |
| Dashboard | `/dashboard` | Project list + management |
| Editor | `/editor/:id` | Structured website builder |
| Freeform Editor | `/freeform/:id` | Freeform canvas editor |
| Freeform Share | `/freeform/share/:id` | Published freeform share page |
| Scenes | `/scenes` | User's scenes list |
| Scene Editor | `/scenes/:id` | SVG canvas scene editor |
| Scene Preview | `/scenes/:id/preview` | Standalone preview |
| Scene Share | `/scenes/:id/share` | Share page |
| Scene Gallery | `/scenes/gallery` | Public scene gallery |
| Gallery | `/gallery` | Public gallery |
| Components | `/components` | Component library |
| Profile | `/profile` | User profile |
| New Project | `/new-project` | Project creation |
| Not Found | `/404` | 404 page |

### State Management
- **Structured Editor:** Zustand store + useReducer for canvas state
- **Freeform Editor:** `freeformStore.ts` (Zustand) with full action set
- **Scenes:** `sceneStore.ts` (Zustand) with useReducer for canvas + undo/redo

### Key Libraries
- `@dnd-kit/core` + `sortable` + `utilities` — drag and drop
- `gsap` + `@gsap/react` — animations
- `lenis` — smooth scroll
- `zustand` — state management
- `react-dropzone` — file upload
- `@hookform/resolvers` — form validation
- `@radix-ui/*` — accessible UI primitives (via shadcn)
- `framer-motion` — used in code export (not runtime dependency)

### AI Architecture (GitHub Pages — Static Frontend)

#### AiChatWidget.tsx — Global AI Assistant
- Calls Google Gemini REST API directly (`generativelanguage.googleapis.com/v1beta`)
- User's own Gemini API key (stored in `localStorage` under `www-studio-gemini-config`)
- Free tier: 1500 requests/day, no credit card needed
- Models: Auto-fetches available free-tier Gemini models, sorted free-first
- Fallback: Helpful onboarding if no API key

#### FreeformAIChat.tsx — Context-Aware AI
- Tool-calling: AI can directly manipulate freeform canvas (add, remove, style, move elements)
- Commands: "Make this more chaotic", "Apply design tokens", "Optimize for mobile"
- Triple fallback: Gemini API → local heuristic → static suggestions

#### SceneChat.tsx — Scene AI Assistant
- Triple fallback: local backend API → Gemini API → local rule-based AI
- Action format: `{ text: string, actions: SceneAction[] }`

#### ScreenshotToFreeform.tsx — Screenshot-to-Code
- Captures desktop screenshot → vision LLM → converts to freeform canvas elements

### Storage Keys
- `www-studio-gemini-config` → `{ key: string, baseUrl: string }`
- `www-studio-selected-model` → string (model ID)
- `www-studio-projects` → project list in localStorage
- `www-studio-freeform-[:id]` → freeform canvas state
- `www-studio-scenes-[:id]` → scene state

### PWA & Offline
- `public/manifest.json` — PWA manifest with icons, theme color, display: standalone
- `public/sw.js` — Service Worker with Workbox-style caching
- `public/robots.txt` — SEO crawling rules
- `public/opengraph.jpg` — OG image for social sharing

### Design System
- Wellness color palette: sage, lavender, coral, sky, peach, forest, mist, sand
- Design tokens in `lib/design-tokens.ts` — colors, typography, shadows, radii, spacing
- Animation presets in `lib/animation-presets.ts` — 11+ keyframe presets
- Code generators in `lib/code-generators.ts` — export to HTML, React, Tailwind, etc.

---

## Critical Conventions

1. **www-studio uses relative `/api/...` fetch paths** — `@workspace/auth-web` only exports `useAuth`/`AuthUser`, NOT `getApiUrl`.
2. **Always `String(req.params.id)` before Drizzle `eq()`** — params typed as `string | string[]`.
3. **Scene JSON fields stored as strings in DB** — `elements`, `animations`, `themeTokens` are all JSON strings; always `JSON.parse()` on frontend.
4. **LLM client at `artifacts/api-server/src/lib/llm.ts`** — import `chatComplete`, `streamChat`, `visionComplete` — never create OpenAI client instances inline.
5. **`getOrGuestUserId(req)`** — single-user app; returns `req.user.id` if authenticated, else guest UUID.
6. **Canvas is 1440×900px** — elements positioned in px, z-index determines stacking.
7. **Freeform canvas uses absolute positioning** — elements have x, y, width, height, zIndex, rotation.
8. **Hash-based routing** — all routes use `#/route` format for GitHub Pages SPA.
9. **Build output** — `artifacts/www-studio/dist/` is what gets deployed.
10. **BASE_PATH** — set to `/www-studio/` for GitHub Pages, `/` for Vercel/local.

## Code Style
- TypeScript strict mode
- Tailwind CSS for styling (dark mode via `dark:` variant)
- shadcn/ui components in `components/ui/`
- Functional components with hooks (no class components)
- Named exports (not default exports for components)

## Rate Limits (production API)
- General: 300 req / 15 min (all `/api/*`)
- AI endpoints: 30 req / min (chat, generate, clone, screenshot-to-code, design, scenes/ai-generate, scenes/*/chat, scenes/*/enhance)

## LLM Configuration (env vars)
```
LLM_BASE_URL    — e.g. http://localhost:11434/v1 (Ollama) or https://api.openai.com/v1
LLM_API_KEY     — "ollama" for local, or real key
LLM_MODEL       — e.g. llama3.2 or gpt-4o
LLM_VISION_MODEL — e.g. llava or gpt-4o
```

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
- Freeform canvas state is stored as JSON string in localStorage — can be large for complex scenes
- Gemini API key is stored in localStorage — never log or transmit it
- Build must succeed with `pnpm run build` before committing — check for TypeScript errors

## Freeform Editor State
- `freeformStore.ts` — Zustand store with actions:
  - `ADD_ELEMENT`, `UPDATE_ELEMENT`, `DELETE_ELEMENT`, `MOVE_ELEMENT`
  - `REORDER_UP`, `REORDER_DOWN`, `DUPLICATE_ELEMENT`
  - `SET_BACKGROUND`, `SET_CANVAS_SIZE`
  - `UNDO`, `REDO` (30-step history)
  - `LOAD_STATE`, `CLEAR`
- Auto-save: 30-second debounce when dirty
- Keyboard shortcuts: Ctrl+Z undo, Ctrl+Y redo, Delete remove, Ctrl+S save, ? legend

## Scene Editor State
- `useReducer` with undo/redo (30-step history)
- Actions: `LOAD_SCENE`, `SET_NAME`, `ADD_ELEMENT`, `ADD_ELEMENTS`, `UPDATE_ELEMENT`, `DELETE_ELEMENT`, `MOVE_ELEMENT`, `REORDER_UP`, `REORDER_DOWN`, `SELECT`, `UNDO`, `REDO`
- Auto-save fires every 30s when `isDirty === true`
- Keyboard shortcuts: `Ctrl+Z` undo, `Ctrl+Y` redo, `Delete` delete element, `Ctrl+S` save, `?` shortcut legend

## Code Export Formats
- **HTML:** Self-contained with inline CSS
- **React/Next.js:** Component-based with CSS modules
- **Tailwind:** Utility-class version
- **Framer Motion:** Animation-enabled React components
- **Design Token JSON:** Extracted design system tokens
- **SVG:** Raw SVG for scenes
- **CSS Keyframes:** Animation definitions only
- **Cursor Prompt:** AI prompt for code generation

## Wellness Color Palette
```
sage:     #7FB5A0   lavender: #B39DC2   coral: #E8957A   sky:  #87BBDB
peach:    #F4C5A1   forest:   #4A7C6B   mist:  #C8D8E0   sand: #E8DDD0
```

## Animation Presets (CSS keyframes in `www-studio/src/index.css`)
`none` · `gentle-float` · `gradient-breathe` · `shadow-pulse` · `hover-lift` · `scroll-reveal` · `morph` · `spin-slow` · `fade-in-out` · `scale-pulse` · `elastic-bounce` · `drift`
