# Project Master

## Overview

**WWW Studio** is a web-based visual editor for building websites with AI assistance. It combines a freeform canvas editor, structured editor, and multi-scene management with an AI assistant that can create, critique, and autonomously improve designs. Projects can be stored on GitHub and published with one click.

**Live Demo:** https://sudo-prog.github.io/www-studio/

**Repository:** https://github.com/sudo-prog/www-studio

**Current Version:** v0.6.0-3d-studio

**License:** MIT

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.1 | UI framework |
| TypeScript | 5.9 | Type safety (strict mode) |
| Vite | 7.3 | Build tool & dev server |
| Tailwind CSS | 4.3 | Utility-first styling |
| shadcn/ui (Radix) | latest | Accessible UI primitives |
| Zustand | 5.0 | State management |
| Wouter | 3.3 | Hash-based routing |
| GSAP | 3.15 | Animations |
| Framer Motion | 12.23 | Declarative animations |
| Lenis | 1.3 | Smooth scrolling |
| @dnd-kit | 6.3/10.0 | Drag and drop |
| react-hook-form | 7.55 | Form handling |
| Zod | 3.25 | Schema validation |
| next-themes | 0.4 | Dark mode |
| TanStack Query | 5.90 | Server state management |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | — | API server |
| Drizzle ORM | — | Database access |
| PostgreSQL | — | Primary database |
| Supabase | — | Auth & storage |

### AI/ML
| Technology | Purpose |
|-----------|---------|
| OpenAI-compatible API | LLM integration |
| Gemini Web2API | Free AI access proxy |
| Libroom | RAG document store |
| MCP | Model Context Protocol |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| GitHub Pages | Static hosting |
| GitHub API | Project storage |
| pnpm workspaces | Monorepo management |
| Expo | Mobile app |

---

## Current Features

### ✅ Freeform Editor
- Infinite canvas with pan/zoom
- Drag, drop, rotate, resize elements
- Elements toolbar (text, images, shapes, buttons, forms)
- Properties panel for styling
- Freehand drawing
- Background picker (colors, gradients, images)
- Screenshot-to-code conversion
- Custom code panel (HTML/CSS/JS)

### ✅ Structured Editor
- Semantic HTML output
- Component-based sections

### ✅ Scenes
- Multi-scene projects
- Scene-specific AI chat
- Export and sharing
- Performance auditing
- Scroll debugging

### ✅ AI Assistant
- Conversational chat
- Tool-calling (direct canvas manipulation)
- Design critique
- Self-editing (autonomous iteration)
- RAG (document ingestion)
- Workflows (multi-step automation)
- MCP integration

### ✅ Storage & Publishing
- GitHub storage (save/load projects)
- Supabase authentication
- One-click publish to GitHub Pages
- Share links

### ✅ Design Intelligence Module (Phase A-F complete)
- Multi-source design synthesis: extract design systems from URLs + images
- Produces: design.md, tailwind.config.ts, tokens.css, design-tokens.json
- Live-editable token editor with real-time preview
- Screenshot service with ScreenshotOne/Playwright fallback
- Intent parser for natural language annotation interpretation
- Browser mode (GitHub Pages) with Gemini API direct fallback
- 12 dedicated components in `src/components/design-extract/`
- API endpoints: POST/GET/PATCH /api/design-extract/*
- RAG auto-ingest into knowledge_chunks table
- Undo history (20 snapshots)
- Public extraction gallery
- Batch extraction, comparison, Figma import, CSS paste
- AI critique, color harmony, token linter, Claude Artifacts export
- 5 test files (988 lines) + QA checklist

---

## Roadmap Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Foundation (monorepo, tooling, auth) | ✅ Complete |
| Phase 1 | Core Editor (structured editor, scenes) | ✅ Complete |
| Phase 2 | Freeform Editor (canvas, drag/drop, AI chat) | ✅ Complete |
| Phase 3 | AI Enhancement (tools, critique, RAG) | ✅ Complete |
| Phase 4 | Polish & Publishing (PWA, dark mode, forms) | ✅ Complete |
| Phase 5 | Design Intelligence Module (design synthesis) | ✅ Complete (Phases A-F) |
| Phase 6 | 3D Studio Module (R3F scene builder) | 🔄 Phase 0 in progress |
| Phase 7 | Collaboration (real-time, comments, teams) | 📋 Planned |
| Phase 8 | Platform (marketplace, plugins, enterprise) | 📋 Planned |

See [dev_roadmap.md](./dev_roadmap.md) for detailed roadmap.

---

## Quick Start

```bash
# Clone
git clone https://github.com/sudo-prog/www-studio.git
cd www-studio

# Install
pnpm install

# Run dev server
pnpm --filter @workspace/www-studio run dev

# Build for production
pnpm run build
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (API) | PostgreSQL connection string |
| `OPENAI_API_KEY` | No | OpenAI API key |
| `LLM_BASE_URL` | No | LLM base URL (default: localhost:11434/v1) |
| `LLM_MODEL` | No | LLM model name |
| `GEMINI_WEB2API_BASE_URL` | No | Gemini proxy URL |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |

---

## Project Structure

```
05_WWW.Studio/
├── artifacts/
│   ├── www-studio/      # Main web application
│   ├── mobile/          # Expo mobile app
│   ├── api-server/      # Express API server
│   └── mockup-sandbox/  # UI component sandbox
├── lib/
│   ├── api-spec/          # OpenAPI spec
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   ├── auth-web/          # Auth hooks
│   ├── db/                # Drizzle ORM schema
│   └── integrations/      # External integrations
├── scripts/               # Build scripts
├── package.json           # Root workspace
└── pnpm-workspace.yaml
```

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview, features, setup |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [dev_roadmap.md](./dev_roadmap.md) | Development roadmap |
| [agent_notes.md](./agent_notes.md) | Architecture notes for AI agents |

---

## Metrics

| Metric | Value |
|--------|-------|
| Total Components | ~50+ |
| Lines of Code | ~15,000+ |
| Dependencies | ~60 |
| Bundle Size | ~650KB |
| Supported Browsers | Chrome, Firefox, Safari, Edge |
| License | MIT |

---

## Contact & Support

- **Issues:** https://github.com/sudo-prog/www-studio/issues
- **Discussions:** https://github.com/sudo-prog/www-studio/discussions
- **Live Demo:** https://sudo-prog.github.io/www-studio/

---

*Last updated: 2026-06-26 (v0.6.0-3d-studio · Design Intelligence ✅ complete · 3D Studio 🔄 Phase 0)*
