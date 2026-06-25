# WWW Studio — Dev Roadmap

> **Last Updated:** 2026-06-26
> **Current Status:** Phases 0-14 shipped. Enhanced Phases 15-17 (God-Tier AI + PWA + Polish) in progress.

---

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
- [x] `scenes` DB table + Drizzle schema
- [x] Full REST CRUD for scenes
- [x] AI scene generation from prompt
- [x] Scene export to 4+ formats
- [x] 3-panel SVG canvas editor
- [x] WellnessLibrary — 20 shapes
- [x] AnimationPresets — 11 presets
- [x] Layers panel, Properties panel, Undo/redo

## Phase 4: AI Chat in Scene Editor ✅
- [x] Scene-context-aware LLM endpoint
- [x] SceneChat sidebar with message history
- [x] AI responds with text + structured canvas actions
- [x] One-click "Apply N changes" button
- [x] 8 suggestion chips for common prompts

## Phase 5: Mobile Sidekick ✅
- [x] Scenes tab in mobile bottom nav
- [x] Scene gallery with colored orb thumbnails
- [x] Full-screen WebView scene preview with CSS animations
- [x] Scene detail: share, element count, status

## Phase 6: Scene AI Polish ✅
- [x] Scene export: Embed/Share tab with iframe snippet
- [x] Live preview mode (standalone, embeddable)
- [x] Scene cards show description + tags
- [x] Fork/Duplicate from card dropdown
- [x] Publish/Unpublish toggle per scene

## Phase 7: Gallery & Sharing ✅
- [x] Public gallery page (published scenes only)
- [x] Gallery card: SVG preview, Fork, Embed modal, Preview link
- [x] Navbar: "Public" nav link + Globe icon
- [x] Home page Scenes Showcase section

## Phase 8: Production Hardening ✅
- [x] `express-rate-limit` — General: 300/15min, AI: 30/min
- [x] React `ErrorBoundary` component
- [x] Standalone embeddable preview page
- [x] All 4 workflows healthy

## Phase 9: Gemini Web2API Integration ✅
- [x] Python proxy (gemini-web2api) for OpenAI-compatible Gemini access
- [x] LLM client updated with Gemini Web2API support
- [x] Real LLM calls in chat, generate, screenshot-to-code routes
- [x] Streaming endpoint (`POST /chat/stream`)
- [x] Health check with provider status
- [x] Startup script `scripts/start-gemini-proxy.sh`

---

## Phase 10: Freeform Play Mode ✅
- [x] Freeform canvas with pan/zoom
- [x] Elements toolbar: Text, Image upload, Shapes, Buttons (with links)
- [x] Background color/gradient/image picker (BackgroundPicker)
- [x] Direct on-canvas editing (double-click text, drag handles for resize/rotate)
- [x] Freehand drawing (FreehandDraw — Canvas API)
- [x] Remix button (rule-based randomization)
- [x] Chaos Monkey V2 (AI-powered mayhem)
- [x] Screenshot-to-freeform (capture → convert to canvas elements)
- [x] Code Inspector (real-time CSS/SVG/HTML/Tailwind snippets)
- [x] Publish button with shareable URL (freeform-share page)
- [x] Zen/minimal mode (hide all panels)
- [x] Smart alignment guides (toggleable snapping)
- [x] Freeform AI Chat (context-aware: "Make this more chaotic", "Apply design tokens")
- [x] Auto-responsiveness: smart scaling + media-query generation on export

## Phase 11: Penpot Professional Enhancements ✅
- [x] Per-container layout mode selector (flex | grid | free)
- [x] Visual controls: direction, justify, align, gap, wrap, columns
- [x] Infinite canvas with pan/zoom + rulers
- [x] Artboards (multiple frames for multi-page sites)
- [x] Design tokens: colors, typography, shadows, radii, spacing
- [x] Master Components + Variants + Instances
- [x] Vector tools: basic boolean ops, masks

## Phase 12: Publishing & Code Fidelity ✅
- [x] One-click publish → shareable URL
- [x] Public gallery (freeform + pro pages)
- [x] Embed support (iframe snippets)
- [x] Code Inspector with format switching
- [x] Enhanced exports:
  - Self-contained HTML
  - Tailwind + Flex/Grid version
  - React/Next.js with components/tokens
  - Framer Motion animations
  - Design token JSON
- [x] Custom domain support (CNAME configuration)

## Phase 13: AI Superpowers ✅
- [x] Screenshot-to-code (capture screenshot → generate site)
- [x] Text-to-site (describe → generate layout)
- [x] In-editor AI chat panel (enhanced with tool-calling)
- [x] "Convert to Flex layout" AI command
- [x] "Generate component variants" AI command
- [x] "Add interactions for this button" AI command
- [x] Mobile editing support (touch gestures in browser emulation)
- [x] Accessibility checks (alt text, contrast)
- [x] Custom CSS/JS injection (sandboxed)

## Phase 14: Community, Monetization & God-Tier Scale ✅ (partial)
- [x] Showcase, likes, remixes/forks
- [x] Template hub scaffold (Penpot Hub style)
- [x] Plugin system hooks (basic)
- [x] Docker Compose for full stack
- [x] Improved README with feature list
- [x] GitHub workflows for CI

---

## Enhanced Phases (Current Work)

### Phase 15: God-Tier AI Design Assistant & Self-Editing 🔄
**Goal:** AI acts as a senior designer + engineer partner that can directly manipulate the canvas, critique designs, and propose self-improvements.

- [ ] Full tool-calling: canvas edits, component insertion, audits
- [ ] Agent-skills for senior-engineer quality gates
- [ ] Self-editing: AI proposes diffs for www-studio itself
- [ ] Agentic multi-step flows ("Create premium wellness site")
- [ ] Critique mode + "make it stunning" per taste KB
- [ ] Visual edits mode (click-to-modify elements directly)
- [ ] MCP-like external agent interface (read/modify canvas via API)

**Checkpoints:**
- AI produces high-taste outputs consistently
- Basic self-modification works safely
- Tool-calling can add/style/remove elements without errors

### Phase 16: PWA Perfection & Legendary Features 🔄
**Goal:** Daily-driver ready on all devices. Exceptional UX and AI intelligence.

- [x] PWA manifest (`public/manifest.json`) with icons, theme color, standalone
- [x] Service Worker (`public/sw.js`) with caching
- [ ] Full offline: IndexedDB/Supabase local fallbacks
- [ ] Mobile-first optimizations, touch gestures, iPad parity
- [ ] Accessibility audit + fixes (WCAG compliance)
- [ ] Performance: 90+ Lighthouse scores
- [ ] Dark mode toggle with persistence
- [ ] SEO toolkit (auto meta, sitemap, OG, robots.txt)
- [ ] One-click publish + custom domain (Vercel integration)
- [ ] Collaboration (realtime via Supabase)
- [ ] Built-in forms + basic e-commerce placeholders
- [ ] Analytics integration points (Plausible/Umami)
- [ ] Public template marketplace / sharing
- [ ] Multi-modal (image/video → components)
- [ ] Performance & accessibility auditor (AI + Lighthouse)

**Checkpoints:**
- Lighthouse score 90+ on all pages
- Offline mode works for saved projects
- Mobile editing is smooth and responsive

### Phase 17: Polish, Security, Testing & Ecosystem 🔄
**Goal:** Stable, delightful daily driver with room to grow.

- [ ] Comprehensive testing (cross-device, offline, AI edge cases)
- [ ] Security: Sanitize LLM code, RLS, input validation
- [ ] Monitoring: Vercel + Supabase logs/analytics
- [ ] Documentation & knowledge base sync
- [ ] Backup strategy: GitHub + Supabase exports + Syncthing
- [ ] Community/contribution guidelines
- [ ] Open-sourcing strategy + MIT LICENSE
- [ ] Version History + Diffs (extend beyond scenes to freeform)
- [ ] Testing setup: Vitest + Playwright

**Checkpoints:**
- All critical user flows have test coverage
- No known security vulnerabilities
- Documentation is up-to-date with features

---

## Gap Additions (Cross-Cutting)

### CMS / Dynamic Content
- [ ] Bind data (Supabase tables, JSON, APIs) to components
- [ ] `{{variable}}` template substitution
- [ ] Dynamic lists and conditional rendering

### Asset/Media Library
- [ ] Supabase Storage integration
- [ ] Image optimization pipeline (compress, resize, WebP)
- [ ] AI image generation placeholder (calls vision API)

### Advanced Interactions
- [ ] Scroll-triggered animations (beyond current GSAP presets)
- [ ] Hover states and micro-interactions
- [ ] Animation timeline editor

### Import/Export
- [ ] Better support for importing from Figma/Sketch
- [ ] Import from existing sites (URL → canvas)
- [ ] Export as ZIP with assets
- [ ] Export to multiple formats (HTML, React, Vue SFC)

### Version History + Diffs
- [ ] Extend versioning to freeform projects (beyond scenes)
- [ ] Visual diff viewer between versions
- [ ] Branch/merge for version history

---

## Implementation Rules

1. **Node 22** — `export PATH="/home/thinkpad/.nvm/versions/node/v22.23.0/bin:$PATH"`
2. **Use pnpm** (not npm)
3. **Read existing files BEFORE modifying**
4. **Match existing code style** (Tailwind + shadcn, TypeScript strict)
5. **Do NOT delete or remove any existing functionality**
6. **Build MUST succeed:** `cd artifacts/www-studio && pnpm run build`
7. **After ALL:** `git add -A && git commit && timeout 20 git push origin main`
8. **Verify with vision** — screenshot and analyze after UI changes
