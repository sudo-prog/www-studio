# WWW Studio — Project Master

> **Live Demo:** https://sudo-prog.github.io/www-studio/
> **Repo:** https://github.com/sudo-prog/www-studio
> **Status:** Active development — God Tier phases 10-13 shipped, enhanced phases 4-6 in progress

---

## What Is WWW Studio?

WWW Studio is a browser-native AI website builder that combines the playful freeform canvas of mmm.page, the professional CSS power of Penpot/Webstudio, and AI superpowers (text-to-site, screenshot-to-code, critique mode) — all running 100% in the browser with no backend required.

**Unique positioning:** "mmm.page joy + Penpot power + AI superpowers + free LLM + code export + wellness creativity"

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui components |
| **Drag & Drop** | @dnd-kit/core + sortable + utilities |
| **Animations** | GSAP + @gsap/react + Lenis smooth scroll |
| **State** | Zustand + useReducer (canvas) |
| **Routing** | Wouter (hash-based for GitHub Pages SPA) |
| **AI** | Direct Gemini REST API (browser) + unified LLM client (server) |
| **Backend (optional)** | Express + Drizzle ORM + PostgreSQL |
| **Deployment** | GitHub Pages (static) + optional Vercel |
| **Mobile** | Expo (React Native) — separate app |
| **Storage** | localStorage + Supabase (optional) + GitHub backup |

---

## Current Features (Shipped)

### Core Builder
- Structured editor with drag-drop, properties panel, element inspector
- Multi-page projects with page manager
- Theme customizer (design tokens, fonts, color palette)
- Component library (20+ element types)
- Snapshot versioning (create + restore)
- Clone / fork projects

### Freeform Canvas (Phase 10)
- Freehand drawing (Canvas API)
- Elements toolbar: Text, Image upload, Shapes, Buttons with links
- Background color/gradient/image picker
- Direct on-canvas editing (double-click text, drag handles)
- Remix (rule-based + LLM-powered randomization)
- Chaos Monkey v2 (AI-powered mayhem)
- Screenshot-to-freeform (capture → convert to canvas elements)
- Code Inspector (real-time CSS/SVG/HTML/Tailwind snippets)
- Publish button with shareable URL
- Zen/minimal mode (hide all panels)

### Penpot Professional (Phase 11)
- Per-container layout mode selector (flex | grid | free)
- Visual controls: direction, justify, align, gap, wrap, columns
- Infinite canvas with pan/zoom
- Artboards (multiple frames for multi-page sites)
- Design tokens: colors, typography, shadows, radii, spacing
- Master Components + Variants + Instances

### Publishing & Sharing (Phase 12)
- One-click publish → shareable URL (freeform-share)
- Public gallery (scenes + freeform pages)
- Embed support (iframe snippets)
- Code export: HTML, React/Next.js, Tailwind, Framer Motion, Design token JSON
- Custom domain support (CNAME)

### Wellness Scenes (Phases 3-8)
- SVG canvas editor for animated wellness/meditation compositions
- 20 wellness shapes (orbs, blobs, geometric, waves, lines, text)
- 11 animation presets (gentle-float, gradient-breathe, morph, etc.)
- Scene AI chat with canvas manipulation
- Scene export to 8 code formats
- Public scene gallery with fork/embed

### AI Assistant (Phase 9 + enhancements)
- Global AI chat widget (AiChatWidget) — Gemini direct, no backend needed
- Scene-context-aware AI chat (SceneChat) with triple fallback
- Text-to-site generation (AI + heuristic fallback)
- Screenshot-to-code (vision LLM + fallback)
- Streaming responses (SSE)
- Model auto-detection and failover

### Infrastructure
- Express rate limiting (300/15min general, 30/min AI)
- ErrorBoundary with friendly error UI
- GitHub storage (save/load projects to/from GitHub)
- PIN lock for personal projects
- Hash-based routing for GitHub Pages SPA
- Docker Compose for full stack (api-server + db + proxy)

---

## Roadmap

### Phase 0: Foundation ✅
### Phase 1: Core Website Builder ✅
### Phase 2: Unified LLM Client ✅
### Phase 3: Scenes Workspace ✅
### Phase 4: AI Chat in Scene Editor ✅
### Phase 5: Mobile Sidekick ✅
### Phase 6: Scene AI Polish ✅
### Phase 7: Gallery & Sharing ✅
### Phase 8: Production Hardening ✅
### Phase 9: Gemini Web2API Integration ✅
### Phase 10: Freeform Play Mode ✅
### Phase 11: Penpot Professional Enhancements ✅
### Phase 12: Publishing & Code Fidelity ✅
### Phase 13: AI Superpowers ✅
### Phase 14: Community, Monetization & God-Tier Scale ✅ (partial)
### Phase 15: God-Tier AI Design Assistant & Self-Editing 🔄 (in progress)
### Phase 16: PWA Perfection & Legendary Features 🔄 (in progress)
### Phase 17: Polish, Security, Testing & Ecosystem 🔄 (in progress)

---

## Project Structure

```
05_WWW.Studio/
├── artifacts/
│   ├── www-studio/          # Main React app (deployed to GitHub Pages)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── freeform/    # Freeform canvas + AI tools
│   │   │   │   ├── scenes/      # Wellness scene editor
│   │   │   │   ├── editor/      # Structured editor panels
│   │   │   │   ├── ui/          # shadcn components
│   │   │   │   └── layout/      # Navbar, shell
│   │   │   ├── pages/           # Route pages
│   │   │   ├── lib/             # Stores, utilities, generators
│   │   │   └── hooks/           # Custom hooks
│   │   └── public/              # Static assets, manifest, SW
│   ├── api-server/              # Express API (optional, for DB scenes)
│   ├── mobile/                  # Expo mobile app
│   └── mockup-sandbox/          # UI component sandbox
├── lib/
│   ├── api-spec/                # OpenAPI YAML spec
│   ├── api-client-react/         # Auto-generated React Query hooks
│   ├── auth-web/                # Auth hooks
│   ├── db/                      # Drizzle ORM schema
│   └── integrations/
│       └── gemini-web2api/      # Gemini proxy (Python)
├── scripts/                     # Startup scripts
├── dev_roadmap.md               # Full development roadmap
├── agent_notes.md               # Architecture & conventions
└── project_master.md            # This file
```

---

## Key Milestones

| Date | Milestone |
|------|-----------|
| 2026-06 | Phases 0-9 complete — full website builder + scenes + AI |
| 2026-06-25 | Phase 10-13 shipped — Freeform, Pro, Publishing, AI superpowers (3063 lines) |
| 2026-06-26 | Phases 15-17 in progress — God-Tier AI, PWA, Polish |
| TBD | Vercel deployment with Supabase backend |
| TBD | Public template marketplace |
| TBD | Mobile app (Expo) full editing |

---

## Security Notes

- All AI calls run client-side (Gemini API key stored in localStorage)
- No server-side secrets in the static frontend
- Rate limiting on API server (when used)
- Input sanitization for user-generated HTML
- PIN lock for personal projects (stored hashed in localStorage)

---

## License

MIT (to be formalized upon open-sourcing)
