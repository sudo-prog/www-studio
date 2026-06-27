# WWW Studio — Project Overview

## What is WWW Studio?

WWW Studio is a **visual web design tool** — a browser-based design studio that combines structured editing, freeform canvas editing, 3D scene building, and AI-powered code generation. It enables users to design, prototype, and publish web pages visually, with AI assistance at every step.

The name "WWW" stands for the World Wide Web — the tool's purpose is to make web design accessible, powerful, and delightful.

## Core Capabilities

1. **Structured Editor** — Semantic HTML page builder with multi-scene projects, design tokens, and component libraries
2. **Freeform Editor** — Infinite canvas with drag-and-drop, freehand drawing, and visual layout tools
3. **3D Studio** — React Three Fiber-powered 3D scene builder with templates, shaders, timeline animation, and export (PNG/GLB/Video)
4. **Design Intelligence** — Extract design systems from URLs and screenshots (colors, typography, spacing, tokens)
5. **AI Chat** — Context-aware AI assistant for generating and modifying designs, component suggestions, and code
6. **Screenshot-to-Code** — Convert screenshots into structured component trees using vision LLMs
7. **Template Gallery** — Browse and apply pre-built design templates
8. **Export & Publish** — One-click publish to GitHub Pages, export to HTML/React/Tailwind, or share via link

## Architecture at a Glance

```
artifacts/www-studio/     ← Frontend (React + Vite + Tailwind + R3F)
artifacts/api-server/     ← Backend (Express + Drizzle ORM + LLM proxy)
lib/db/                   ← Shared database schema (Drizzle + pgvector)
lib/api-zod/              ← Shared Zod schemas between frontend & backend
lib/api-client-react/     ← React hooks for API calls
lib/auth-web/            ← Shared auth types for frontend
```

## Key Pages (Routes)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Landing page |
| `/projects` | Dashboard | User's projects list |
| `/editor/new` | NewProject | Create new project |
| `/editor/:projectId` | Editor | Structured scene editor |
| `/freeform/:projectId?` | FreeformEditor | Infinite canvas editor |
| `/scenes` | Scenes | Scene list |
| `/scenes/:id` | SceneEditor | 3D scene editor |
| `/scenes/:id/preview` | ScenePreview | 3D scene preview |
| `/scenes/:id/share` | SceneShare | Share 3D scene |
| `/design-extract` | DesignExtractPage | Design intelligence extraction |
| `/design-extract/gallery` | DesignExtractGallery | Browse extractions |
| `/gallery` | Gallery | Template gallery |
| `/ui-library` | Components | UI component library |
| `/profile` | Profile | User profile |

## Technology Highlights

- **React 19** with **TypeScript** strict mode
- **Vite 7** for dev server and build
- **Tailwind CSS 4** with Vite plugin
- **React Three Fiber** + **Drei** + **Postprocessing** for 3D
- **GSAP** + **Framer Motion** for animations
- **Zustand** for state management
- **Wouter** for hash-based routing (GitHub Pages compatible)
- **Express 5** API server with **Drizzle ORM** + PostgreSQL
- **OpenAI-compatible** LLM proxy (supports Gemini, custom providers)
- **Supabase** (optional) for auth and storage

## Deployment Targets

- **GitHub Pages** (base path `/www-studio/`)
- **Vercel** (base path `/`, API server via rewrites)
