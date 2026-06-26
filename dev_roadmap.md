# Development Roadmap

## Current Status: v0.6.0-3d-studio

WWW Studio is in active development. The Design Intelligence Module (Phases A-F) is fully complete with 7 test files. Now building the 3D Studio Module — a god-tier 3D section builder with React Three Fiber, templates, AI, timeline, shaders, and export suite.

---

## Phase 0: Foundation ✅

**Goal:** Establish project infrastructure and basic editing capabilities.

- [x] Monorepo setup with pnpm workspaces
- [x] TypeScript strict mode configuration
- [x] Vite + React 19 + Tailwind CSS 4
- [x] shadcn/ui component library integration
- [x] Zustand state management
- [x] Wouter hash-based routing (GitHub Pages compatible)
- [x] GitHub API integration for storage
- [x] Supabase authentication
- [x] Express API server with OpenAI-compatible endpoints
- [x] Gemini Web2API proxy for free AI access
- [x] Drizzle ORM with PostgreSQL
- [x] Expo mobile app scaffold

**Checkpoint:** ✅ Project builds and runs locally. Basic structured editor functional.

---

## Phase 1: Core Editor ✅

**Goal:** Build the structured editor and scene system.

- [x] Structured editor with semantic HTML output
- [x] Multi-scene project management
- [x] Scene-specific chat and AI assistance
- [x] Scene export and sharing
- [x] Performance auditing tools
- [x] Scroll debug overlay
- [x] Wellness library (design inspiration)
- [x] Command palette for quick actions
- [x] Design tokens system
- [x] Animation presets (GSAP, Framer Motion)

**Checkpoint:** ✅ Users can create multi-scene projects with AI assistance.

---

## Phase 2: Freeform Editor ✅

**Goal:** Introduce canvas-based freeform editing.

- [x] Infinite canvas with pan and zoom
- [x] Drag, drop, rotate, and resize elements
- [x] Elements toolbar (text, images, shapes, buttons, forms)
- [x] Properties panel for styling and layout
- [x] Freehand drawing tool
- [x] Background picker (colors, gradients, images)
- [x] Screenshot-to-freeform conversion
- [x] Custom code panel for HTML/CSS/JS injection
- [x] Freeform AI chat integration
- [x] GitHub save/load for freeform projects
- [x] Code generators (HTML, React, Tailwind)
- [x] Hash routing fix for GitHub Pages

**Checkpoint:** ✅ Freeform editor is fully functional with AI integration.

---

## Phase 3: AI Enhancement ✅

**Goal:** Deepen AI capabilities with tool-calling, critique, and RAG.

- [x] AI tool-calling system (direct canvas manipulation)
- [x] Design critique mode
- [x] Self-editing AI (autonomous iteration)
- [x] RAG with Libroom ingestion
- [x] Multi-step AI workflows
- [x] MCP (Model Context Protocol) integration
- [x] Natural language freeform commands
- [x] Chaos Monkey V2 (automated stress testing)

**Checkpoint:** ✅ AI can autonomously create, critique, and improve designs.

---

## Phase 4: Polish & Publishing ✅

**Goal:** Production-ready features for deployment and user experience.

- [x] PWA support (installable, offline-capable)
- [x] Dark mode with system preference detection
- [x] Forms builder with validation
- [x] Version history with restore
- [x] Code inspector (live code preview)
- [x] One-click publish to GitHub Pages
- [x] Share links for projects
- [x] Improved responsive design

**Checkpoint:** ✅ Users can build, polish, and publish projects entirely within the app.

---

## Phase 5: Design Intelligence Module 🚧

**Goal:** Multi-source design synthesis engine for extracting and applying design systems from URLs and images.

**Branch:** `feature/design-intelligence`

**Status:** Phase A (API Foundation) in progress via subagent

- [ ] Phase A: Database schema, screenshot service, intent parser, prompts, API routes
- [ ] Phase B: Frontend — Design Extract page, token editor, export panel
- [ ] Phase C: UI polish, mobile, error states, annotation UX, Google Fonts
- [ ] Phase D: RAG integration, design context in AI chat, version history, public gallery
- [ ] Phase E: Batch extraction, comparison, Figma import, CSS paste, critique, harmony generator, linter, Claude export
- [ ] Phase F: Testing & QA

**Full spec:** See `DESIGN_INTELLIGENCE_ROADMAP.pdf` in project root

**Checkpoint:** 🚧 Phase A implementation dispatched to VS Code subagent

---

## Phase 6: Collaboration & Advanced Features 📋

**Goal:** Multi-user collaboration and professional features.

- [ ] Real-time collaborative editing (WebSockets/CRDT)
- [ ] Comments and annotations on canvas
- [ ] Team workspaces and permissions
- [ ] Component library (save and reuse custom components)
- [ ] Advanced animations timeline editor
- [ ] Responsive design controls (breakpoint editing)
- [ ] SEO metadata editor
- [ ] Custom domain support for published sites
- [ ] Analytics integration for published sites
- [ ] Plugin system for third-party extensions

**Checkpoint:** 🚧 Real-time collaboration is in progress.

---

## Phase 7: Platform & Ecosystem 📋

**Goal:** Expand into a full development platform.

- [ ] Marketplace for templates and components
- [ ] API for third-party integrations
- [ ] Headless CMS integration
- [ ] E-commerce features (Stripe integration)
- [ ] Multi-framework export (Vue, Svelte, Astro)
- [ ] Desktop app (Tauri/Electron)
- [ ] Mobile app feature parity with web
- [ ] Enterprise features (SSO, audit logs, SLA)
- [ ] AI training on user's design patterns
- [ ] Accessibility audit and remediation tools

**Checkpoint:** 📋 Planned for future development.

---

## 3D Studio Module 🚧

**Goal:** God-tier 3D section builder inspired by endlesstools.io, surpassing it in customizability, AI-power, and deep freeform editor integration.

**Branch:** `feature/3d-studio-core` (branch from `feature/design-intelligence`)

**Phase 0:** Dependency Setup & Type Foundation 🔄 In progress
- [ ] Install three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, postprocessing, leva, gsap, ccapture.js, three-mesh-bvh
- [ ] Create `src/types/three.ts` with ThreeDSceneConfig + DEFAULT_SCENE_CONFIG
- [ ] Register '3d-scene' in sectionRegistry.ts

**Phase 1:** Core Canvas + SceneContent
- [ ] ThreeDSection.tsx (Canvas wrapper with editing chrome)
- [ ] SceneContent.tsx (R3F scene with Leva controls, Environment, Grid, OrbitControls, EffectComposer)

**Phase 2:** Four Core Tools
- [ ] TypeTool.tsx (3D text with extrusion + bevel)
- [ ] CoverTool.tsx (image/video plane + FX stack)
- [ ] ObjectTool.tsx (GLB loader + procedural shapes)
- [ ] ShapeTool.tsx (SVG → 3D extrusion)

**Phase 3:** Template Gallery (15+ Presets)
- [ ] sceneTemplates.ts (heatwave, liquid-metal, earth-moon, retro-futuristic, etc.)
- [ ] ThreeDTemplateGallery.tsx (grid with live mini-previews)

**Phase 4:** Asset Library + Supabase Storage
- [ ] three_assets table + RLS
- [ ] supabaseAssets.ts utility
- [ ] ThreeDAssetLibrary.tsx (drag-drop upload + picker)

**Phase 5:** Timeline & Camera Animation
- [ ] ThreeDTimelineEditor.tsx (keyframe editor)
- [ ] GSAP integration in SceneContent

**Phase 6:** Shader Playground
- [ ] shaderPresets.ts (8 named presets)
- [ ] ThreeDShaderPlayground.tsx (GLSL editor + live preview)

**Phase 7:** Export Suite
- [ ] threeExports.ts (PNG 8K, GLB, WebM video, embed code)
- [ ] ThreeDEmbedExporter.tsx

**Phase 8:** AI Scene Mapper
- [ ] aiSceneMapper.ts (prompt → ThreeDSceneConfig via LLM)
- [ ] AIScenePromptModal.tsx

**Phase 9:** Properties Panel (12 tabs)
- [ ] ThreeDPropertiesPanel.tsx (AI & Templates, Text, Materials, Lighting, Post-Processing, Objects, Cover, Camera, Timeline, Shader, Export, Performance)

**Phase 10:** Multi-Object Composer
- [ ] ThreeDMultiObjectComposer.tsx (add/edit/reorder extraObjects)

**Phase 11:** Performance System
- [ ] Performance modes (high/balanced/low)
- [ ] ThreeDPerformanceMonitor.tsx (FPS + draw calls overlay)

**Phase 12:** RAG Ingestion
- [ ] knowledge_base/three-d-studio.md
- [ ] pnpm kb:ingest

**Phase 13:** Advanced Additions (Stretch)
- [ ] USDZ export (AR)
- [ ] Image-to-3D (AI)
- [ ] Particle system
- [ ] Physics simulation
- [ ] AI texture applicator
- [ ] Noun Project integration
- [ ] Version history per section
- [ ] Collaborative live editing
- [ ] Interactive web embeds

**Full spec:** See `THREE_D_STUDIO_ROADMAP.md` in project root

**Checkpoint:** 🔄 Phase 0 in progress via VS Code subagent

---

## Key Metrics & Success Criteria

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | 90+ | ~85 |
| Accessibility (WCAG) | AA | Partial |
| Test Coverage | 80% | ~15% (typecheck + new tests) |
| Bundle Size | <500KB initial | ~650KB |
| AI Response Time | <3s | ~2-5s |
| Supported Browsers | Last 2 versions | Chrome, Firefox, Safari, Edge |

## Regular Checkpoints

- **Weekly:** Review open issues and PRs
- **Bi-weekly:** Update roadmap progress
- **Monthly:** Release planning and milestone review
- **Quarterly:** Architecture review and tech debt assessment
