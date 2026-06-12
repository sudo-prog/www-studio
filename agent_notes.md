# WWW Studio — Agent Audit Notes

**Date:** 2026-06-28
**Auditor:** OWL (Hermes Agent)
**Scope:** Full code audit of `artifacts/www-studio` (web) + `artifacts/mobile` (mobile) + `artifacts/api-server` (backend) + `artifacts/mockup-sandbox` (sandbox) + shared `lib/` packages

---

## 📊 Project Scale

- **30,498 lines** of TypeScript/TSX across the monorepo
- Monorepo structure: web studio + mobile app + API server + mockup sandbox + shared libraries (api-zod, api-client-react, auth-web, db)
- Built on Replit (uses Replit Auth OIDC, `REPL_ID` env var)

---

## 🟢 What WWW Studio Is

A **visual AI-powered website builder / IDE**. Think Webflow meets Cursor meets v0.dev.

**Core value prop:** Clone any website from a URL, generate from a text prompt, convert a screenshot, or import from Figma → get an editable visual codebase → publish live.

---

## 🟢 Main Web App — `artifacts/www-studio`

### Stack
React 19 + Vite 7 + Tailwind CSS + shadcn/ui (50+ components) + TanStack Query + Zustand + Wouter + Framer Motion + lucide-react

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| **Home** | `/` | Landing page. Hero with AI chat CTA. Community template gallery with search/filter. AiChatWidget floating widget. |
| **Dashboard** | `/projects` | User's project grid. Auth-gated. Delete via dropdown. Status badges (draft/published). |
| **NewProject** | `/editor/new` | 4-mode tab: Clone URL, Generate from Prompt, Screenshot→Code, Figma Import. Example URLs and prompts provided. |
| **Editor** | `/editor/:projectId` | Full visual IDE. See below. |
| **Components** | `/ui-library` | Browsable component library with categorization. |
| **Profile** | `/profile` | User profile with avatar, published projects count. |

### Editor (the core product) — `editor.tsx` (1,522 lines)

The editor is the centerpiece. It's a full visual IDE:

**Layout:**
- Top toolbar: Back, project name, device mode toggle (desktop/tablet/mobile), view mode (preview/split/code), undo/redo, save, publish, export, AI chat button
- Left panel: SortableLayers (tree of elements), PageManager (multi-page support)
- Center: Live preview iframe with device width simulation
- Right panel: Tabbed inspector — Properties, Design, Theme, Images, Animations, SEO, Content, History

**Right Panel Tabs:**

| Tab | File | Features |
|-----|------|----------|
| **Properties** | `ElementInspector.tsx` (638 lines) | Edit element tag, content, className, styles. Tailwind class autocomplete. Visual spacing controls. |
| **Design** | `DesignPanel.tsx` (487 lines) | AI-powered design changes. Send prompt → get Tailwind class suggestions. Style transfer. |
| **Theme** | `ThemeCustomizer.tsx` | 12 preset themes (Midnight, Cyberpunk, Glassmorphism, Brutalist, Apple Vision, etc.). CSS variable tokens. |
| **Images** | (inline in editor.tsx) | 3 sub-tabs: AI Generate (DALL-E 3), Stock (Picsum by category), Assets (upload/manage). Drag-drop upload. Copy URL. |
| **Animations** | (inline) | 7 animation presets (fade-in, slide-up, bounce, etc.) via Framer Motion. |
| **History** | (inline) | Snapshot list with restore. Time-ago display. |

**Key Features:**
- Component tree (SortableLayers) with drag-and-drop reordering
- Multi-page support (PageManager)
- Element inspector with visual property editing
- Offline sync hook (`use-offline-sync`)
- Project assets management (`use-project-assets`)
- Snapshot/version history
- Export to standalone HTML file (with Tailwind CDN)
- Publish to live URL (`/s/:slug`)
- AI chat assistant (AiChatWidget) — floating, context-aware
- Responsive preview (desktop/tablet/mobile)

### Shared Components

| Component | Purpose |
|-----------|---------|
| **AiChatWidget** | Floating AI assistant. Context-aware (knows what page you're on). Welcome message with suggestions. Sends to `/api/chat`. Displays code changes and follow-up suggestions. |
| **Navbar** | Top navigation with theme toggle |
| **SortableLayers** | Draggable element tree. Layer visibility toggle. |
| **ElementInspector** | Deep element editing. Tag, content, className, styles. |

### Code Quality: HIGH ✅

**Strengths:**
- Excellent separation of concerns — editor panel components are individually sized (300-600 lines each)
- Good TypeScript typing with interfaces for DeviceMode, ViewMode, RightPanel, Layer, ElementInfo
- Proper use of React patterns: useCallback, useMemo, useRef, useTransition
- Offline sync capability built-in
- The editor is genuinely feature-rich — comparable to commercial tools
- Clean API integration via generated TanStack Query hooks
- Component library (`data/component-library.ts` — 26KB) for the UI library page

**Issues:**
- `editor.tsx` at 1,522 lines is very large — should be split into sub-components (but the panels are already extracted, so it's manageable)
- One incorrect regex: `s.replace(/\s+/g, "")` — missing second argument in `replace()` call (found in Figma import handler)
- No test files anywhere in the codebase

---

## 🟢 API Server — `artifacts/api-server`

### Stack
Express + Drizzle ORM (v0.45.2) + PostgreSQL + openid-client (OIDC) + OpenAI SDK + pino logging + express-session via cookie

### Auth System (IMPORTANT — Replit-specific)

| File | Purpose |
|------|---------|
| `lib/auth.ts` | OIDC session management. Cookie-based sessions in DB. Token refresh via `openid-client`. |
| `routes/auth.ts` | `/login` → OIDC redirect, `/callback` → code exchange + session creation, `/logout` → session clear + OIDC end-session, `/mobile-auth/token-exchange` → mobile auth code exchange, `/auth/user` → current user, `/mobile-auth/logout` |
| `middlewares/authMiddleware.ts` | Session validation on every request. Auto token refresh if expired. Attaches `req.user`. |

**Auth is Replit OIDC-specific.** Requires `ISSUER_URL`, `CLIENT_ID`, `REPL_ID` env vars. Sessions stored in PostgreSQL `sessions` table.

### API Routes

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/gallery` | List gallery templates with style/search filter | Public |
| GET | `/api/gallery/stats` | Template count by style, featured count | Public |
| GET | `/api/gallery/:id` | Single template | Public |
| GET | `/api/projects` | List user's projects | Required |
| POST | `/api/projects` | Create project | Required |
| GET | `/api/projects/:id` | Get project (public — for editor) | Public |
| PATCH | `/api/projects/:id` | Update project (ownership check) | Required |
| DELETE | `/api/projects/:id` | Delete project (ownership check) | Required |
| POST | `/api/clone` | Clone from URL → generate component tree | Optional (preview mode if anonymous) |
| POST | `/api/generate` | Generate from OpenAI prompt | Optional (preview mode if anonymous) |
| POST | `/api/generate-image` | DALL-E 3 image generation | Public (falls back to Unsplash) |
| POST | `/api/screenshot-to-code` | GPT-4o vision: screenshot → component tree | Optional |
| POST | `/api/chat` | AI design assistant chat | Public |
| GET | `/api/chat/:projectId/history` | Chat history | Public |
| GET | `/api/editor/themes` | List preset themes (12 themes) | Public |
| POST | `/api/editor/variants` | Generate style variants | Public |
| POST | `/api/editor/theme` | Apply theme to project | Public |
| GET | `/api/projects/:id/export` | Export as downloadable HTML | Public |
| GET | `/api/projects/:id/preview-html` | Preview HTML inline | Public |
| POST | `/api/projects/:id/publish` | Mark as published + return live URL | Required |
| GET | `/s/:slug` | Serve published project as HTML | Public |
| GET | `/api/projects/:id/snapshots` | List snapshots | Public |
| POST | `/api/projects/:id/snapshots` | Create snapshot | Required |
| POST | `/api/projects/:id/snapshots/:id/restore` | Restore snapshot | Required |
| GET | `/api/auth/user` | Current authenticated user | Public |
| GET | `/api/health` | Health check | Public |

### AI Integration

| Feature | Details |
|---------|---------|
| **Generate from Prompt** | Uses `gpt-4o-mini` (3000 tokens) to generate JSON component tree. Falls back to template-based generation if no API key. Style detection from keywords (dark, glassmorphism, brutalist, etc.). |
| **Screenshot to Code** | Uses `gpt-4o-mini` with vision (4096 tokens). Sends base64 image → gets JSON component tree. Falls back to basic template. |
| **Clone from URL** | NO actual web scraping. Generates a template component tree based on domain name + style detection. Uses Microlink API for thumbnail. |
| **Image Generation** | DALL-E 3 via OpenAI. Falls back to Unsplash Source (deprecated API!). |
| **Chat Assistant** | Rule-based AI (no LLM call). Keyword matching for glassmorphism, parallax, dark mode, responsive, animations. Returns template replies + suggestions. |

### Database Schema (Drizzle ORM)

| Table | Columns | Purpose |
|-------|---------|---------|
| **users** | id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt | OIDC user profiles |
| **sessions** | sid (PK), sess (JSONB), expire | Server-side sessions |
| **projects** | id, userId, name, slug, status, thumbnailUrl, sourceUrl, componentTree, themeTokens, createdAt, updatedAt | User projects |
| **gallery_templates** | id, title, thumbnailUrl, style, creator, likes, tags, sourceUrl, description, isFeatured, createdAt | Community templates |
| **chat_messages** | id, projectId, userId, role, content, createdAt | Chat history |
| **project_snapshots** | id, projectId, userId, label, componentTree, themeTokens, createdAt | Version history |

### Code Quality: HIGH ✅

**Strengths:**
- Clean route separation (14 route files)
- Proper auth middleware with token refresh
- Zod validation via `@workspace/api-zod`
- Sessions stored server-side in PostgreSQL (secure)
- Ownership checks on all mutating operations
- Good fallback patterns when OpenAI key is missing
- SSG-like publish system serves HTML directly from API

**Issues:**
- **Clone from URL doesn't actually clone** — it generates a generic template based on domain name. No web scraping or real content extraction.
- **Chat assistant is rule-based, not AI** — the `/api/chat` endpoint uses keyword matching, no actual LLM call despite the AI branding
- **Unsplash Source is deprecated** — the fallback for image generation uses `source.unsplash.com` which was shut down
- **No rate limiting** on any endpoint
- **OpenAI key optional** — all AI features have fallbacks, which is good for development but means the "AI-powered" features are mostly templates

---

## 🟢 Mobile App — `artifacts/mobile`

### Stack
React Native 0.81 + Expo 54 + expo-router + TanStack Query + expo-auth-session (OIDC) + expo-secure-store

### Screens

| Screen | Purpose |
|--------|---------|
| **Onboarding** | Welcome flow. Sign in with Replit (OIDC native flow). |
| **Login** | Replit OIDC login via WebBrowser |
| **Projects (tab)** | List user's projects. Auth-gated. Thumbnails, status, delete. |
| **Components (tab)** | Template gallery with category filters. |
| **Profile** | User avatar, stats. |
| **Project Detail** | `[id].tsx` — project detail view. |

### Auth
- Uses `expo-auth-session` with Replit OIDC
- Token exchange via `/api/mobile-auth/token-exchange`
- Session token stored in `expo-secure-store`
- Bearer token sent via Authorization header

### Code Quality: GOOD ✅

**Strengths:**
- Clean tab-based navigation
- Proper OIDC mobile auth flow
- Loading skeletons and error states
- Uses `expo-image` for optimized image loading
- Inter font family support

**Issues:**
- Mobile app is a companion viewer, not a full editor (this is correct for v1)
- Some screens are incomplete (project detail is basic)

---

## 🟢 Mockup Sandbox — `artifacts/mockup-sandbox`

### Stack
React + Vite + Tailwind + shadcn/ui

### Purpose
A standalone UI component sandbox for testing/rendering mockups. Contains:
- Full shadcn/ui component library (50+ components)
- Mockup preview plugin (`mockupPreviewPlugin.ts`)
- Generated mockup components (empty — placeholder)

### Code Quality: GOOD
- Standard shadcn/ui setup
- Minimal custom code — mostly component library

---

## 🟢 Shared Libraries

### `lib/db`
- Drizzle ORM schema for all 6 tables
- PostgreSQL with `gen_random_uuid()` for IDs
- Zod insert schemas via `drizzle-zod`
- Session table with JSONB `sess` column (Replit Auth requirement)

### `lib/api-zod`
- Zod schemas for all API request/response types
- Generated types for: Project, GalleryTemplate, ChatMessage, Snapshot, AuthUser, Order, etc.

### `lib/api-client-react`
- Generated TanStack Query hooks for all API endpoints
- Proper query key management
- Mutation hooks with cache invalidation

### `lib/auth-web`
- React auth context for web app
- OIDC session checking
- `useAuth()` hook

---

## 🔴 Can It Run?

**Blockers:**
1. **PostgreSQL required** — `DATABASE_URL` env var. All data lives in Postgres (projects, sessions, users, templates, chat, snapshots).
2. **Replit OIDC required** — `ISSUER_URL`, `CLIENT_ID`, `REPL_ID` for auth
3. **OpenAI optional** — works without it (falls back to templates)
4. **`node_modules`** — root pnpm workspace needs `pnpm install`
5. **Built for Replit** — the auth system is Replit-specific

**What works out of the box:** Nothing without PostgreSQL + OIDC configuration.

---

## 🏆 Competitive Assessment

### What This Is
An AI-powered visual website builder. Clone → Edit → Publish.

### Competitive Comparison

| Feature | WWW Studio | Webflow | Framer | v0.dev | Cursor |
|---------|-----------|---------|--------|--------|--------|
| Clone from URL | ⚠️ Template only | ❌ | ❌ | ❌ | ❌ |
| Generate from Prompt | ⚠️ OpenAI + fallback | ❌ | ❌ | ✅ | ❌ |
| Screenshot→Code | ⚠️ GPT-4V + fallback | ❌ | ❌ | ✅ | ❌ |
| Figma Import | ⚠️ JSON→prompt hack | ❌ | ❌ | ❌ | ❌ |
| Visual Editor | ✅ Full IDE | ✅ | ✅ | ❌ | ❌ |
| Publish Live | ✅ `/s/:slug` | ✅ | ✅ | ⚠️ Vercel | ❌ |
| Export HTML | ✅ Standalone | ⚠️ Paid | ❌ | ❌ | ✅ |
| Mobile App | ✅ Companion | ❌ | ❌ | ❌ | ❌ |
| AI Chat Assistant | ⚠️ Rule-based | ❌ | ❌ | ✅ | ✅ |
| Auth System | ✅ OIDC (Replit) | ✅ | ✅ | ✅ | ❌ |
| Open Source | ✅ Code visible | ❌ | ❌ | ❌ | ❌ |

### Key Differentiators
1. **Mobile companion app** — unique among visual builders
2. **Full IDE in browser** — multi-panel editor comparable to Webflow
3. **Export to standalone HTML** — no vendor lock-in
4. **Snapshot/version history** — built-in versioning
5. **Open codebase** — self-hostable (with Postgres)

### Honest Assessment of AI Features

The "AI-powered" label is partially accurate:

1. **Generate from Prompt** ✅ Real AI when OpenAI key present, but falls back to template generation
2. **Screenshot→Code** ✅ Real GPT-4V when OpenAI key present, but falls back to template
3. **Clone from URL** ❌ Not AI. Template based on domain name + hardcoded style detection. No actual web scraping.
4. **Chat Assistant** ❌ Not AI. Rule-based keyword matching. No LLM call.
5. **Design Panel** ❌ Not AI. Same rule-based pattern matching.
6. **Image Generation** ✅ Real DALL-E 3, but Unsplash Source fallback is broken (API deprecated)

**Without OpenAI API key, the "AI" features are all template-based.**

---

### Gap to Production

1. **Real URL cloning** — needs web scraping (Puppeteer/Playwright + readability) or a service like Firecrawl
2. **Real AI chat** — needs actual LLM integration (streaming SSE, proper prompts)
3. **Fix Unsplash fallback** — Source API is dead; use `unsplash.com/api` with a key or remove
4. **Hosted deployment** — needs Docker + Postgres + OIDC provider (not just Replit)
5. **SEO/OG tags** — editor has SEO panel but it's basic
6. **Collaboration** — no multi-user editing
7. **Custom domains** — only slug-based URLs
8. **Asset storage** — uploads go to filesystem; needs S3/Cloudflare R2 for production
9. **Tests** — zero test coverage
10. **Error tracking** — no Sentry/similar

---

## 📋 Roadmap — Required Features for Production

### 1. Automated GitHub Integration
- [ ] Auto-create a new GitHub repo for every project/website created
- [ ] Auto-backup everything saved (component trees, themes, assets) to the repo
- [ ] Commit on every save/snapshot with meaningful commit messages
- [ ] Support for GitHub PAT or OAuth app authentication
- [ ] Option to connect existing repos vs. auto-create new ones
- [ ] Branch management (main = production, feature branches for drafts)
- [ ] Webhook support for CI/CD triggers on push

### 2. Remove All Replit Dependencies
- [ ] Replace Replit OIDC auth with generic OAuth2/OIDC (Auth0, Supabase Auth, Clerk, or self-hosted)
- [ ] Remove `REPL_ID` env var dependency
- [ ] Replace Replit-specific session handling with generic session store (Redis or DB-backed)
- [ ] Remove `ISSUER_URL` / `CLIENT_ID` Replit-specific config — make auth provider configurable
- [ ] Update mobile app auth flow to use new generic OIDC/OAuth
- [ ] Replace `sessions` table Replit-specific comments/constraints
- [ ] Dockerize the entire stack (API + web + Postgres) for self-hosting

### 3. Local LLM + Cloud Model Integration with API Key
- [ ] Replace hardcoded OpenAI-only integration with a model provider system:
  - **Cloud:** OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude), Google (Gemini), Groq, Together, OpenRouter, etc.
  - **Local:** Ollama (Llama, Mistral, CodeLlama), LM Studio, vLLM, TGI
- [ ] Admin-provided API key system (env vars or DB-stored per-user keys)
- [ ] Model selection UI in settings — users choose which provider/model to use
- [ ] All AI features must work with ANY provider, not just OpenAI:
  - Generate from Prompt
  - Screenshot→Code
  - Clone from URL (real scraping + LLM extraction)
  - Chat Assistant (currently just rule-based — needs real LLM)
  - Design Panel suggestions (currently rule-based — needs real LLM)
  - Image generation (currently only DALL-E — add SD, Flux, etc.)
- [ ] Streaming SSE responses for chat (not just request/response)
- [ ] Token usage tracking per user

### 4. Website Editor Feature Audit

#### ✅ Current Editor Features (Confirmed in Code)

**Layout & Structure:**
- Multi-panel IDE layout (left tree, center preview, right inspector)
- Device mode toggle: desktop / tablet / mobile (with width simulation)
- View mode: preview / split / code
- Sortable element tree (drag-and-drop layers)
- Multi-page support (PageManager)
- Undo/Redo
- Auto-save with offline sync hook

**Element Inspector (Properties panel):**
- Edit element tag (h1-h4, p, div, section, button, img, nav, header, footer, card, ul, li, a, span)
- Edit text content
- Edit className (Tailwind classes)
- Visual style editing (inline styles)
- Spacing controls

**Design Panel:**
- Text prompt input for design changes
- Displays AI suggestions
- Code change preview
- ⚠️ Currently rule-based, NOT connected to LLM

**Theme Panel:**
- 12 preset themes: Midnight, Cyberpunk, Apple Vision, Brutalist, Glassmorphism, Aurora, Minimal Light, Warm Sand, Ocean Deep, Forest, Linear, Vercel
- CSS variable token system
- Apply theme to project
- Theme variants (7 styles: Glassmorphism, Brutalist, Minimal, Gradient, Dark Premium, Neumorphic, Outlined)
- ⚠️ Variant generation just adds comments, doesn't actually modify code

**Images Panel:**
- AI image generation (DALL-E 3)
- Stock images (Picsum by category: Abstract, Architecture, Nature, People, Technology, Food, Travel, Dark)
- Asset upload (drag-and-drop, images/video/fonts)
- Copy URL to clipboard
- ⚠️ Unsplash Source fallback is broken (API deprecated)

**Animations Panel:**
- 7 animation presets (fade-in, slide-up, etc.)
- Framer Motion based
- Apply to selected elements

**SEO Panel:**
- Referenced in editor but basic implementation

**Content Panel:**
- Referenced in editor

**History Panel:**
- Snapshot list with restore
- Time-ago display
- Create named snapshots
- Restore any snapshot

**AI Chat (AiChatWidget):**
- Floating chat widget on all pages
- Context-aware (knows current page/context)
- Welcome message with suggestions
- Displays code changes and follow-up suggestions
- ⚠️ Rule-based keyword matching, NOT real LLM. Handles: glassmorphism, parallax, dark mode, responsive, animations

**Export & Publish:**
- Export as standalone HTML file (with Tailwind CDN)
- Publish to live URL (`/s/:slug`)
- Published pages include OG tags
- Download or preview exported HTML

**Project Management:**
- Create projects (blank, from URL, from prompt, from screenshot, from Figma)
- Project dashboard with grid/list view
- Delete projects
- Project status: draft / published
- Slug-based URLs

#### ❌ Missing Editor Features (Not in Code)

**Editing:**
- No visual drag-and-drop element placement (must edit via tree/inspector)
- No CSS grid/flex visual editor
- No visual spacing/padding/margin drag handles
- No responsive per-breakpoint editing (device mode changes viewport but not per-breakpoint classes)
- No component grouping/nesting beyond basic tree
- No custom CSS support (only Tailwind classes)
- No JavaScript/interactivity editing
- No form builder
- No animation timeline editor

**Collaboration:**
- No multi-user real-time editing
- No comments/annotations
- No role-based permissions

**Assets:**
- No cloud storage integration (S3/R2) — uploads go to filesystem
- No image optimization/compression
- No SVG editing
- No font management beyond Google Fonts

**AI (real integration):**
- No streaming chat responses
- No real LLM for chat assistant
- No real LLM for design suggestions
- No real URL cloning (web scraping)
- No actual screenshot vision processing without OpenAI key
- No AI-powered SEO suggestions
- No AI content generation
- No AI image editing

**Publishing:**
- No custom domain support
- No SSL certificate management
- No CDN integration
- No deployment targets (Vercel, Netlify, etc.)
- No deployment history/rollback

**Import/Export:**
- No real HTML import (paste HTML → component tree)
- No Figma plugin (only JSON file upload)
- No Sketch/Adobe XD import
- No Webflow/Framer import
- No CMS integration (WordPress, Contentful, etc.)

**User Management:**
- No team/organization support
- No project sharing
- No public/private project toggle
- No fork/template system for gallery templates

**Performance:**
- No lazy loading for images
- No performance budget warnings
- No accessibility audit
- No Lighthouse integration

---

### Estimated Effort to Production (Updated)

**Current state:** Functional prototype with impressive UI, template-based AI fallbacks, Replit-specific auth

**Phase 1 — Foundation (1-2 weeks):**
- Replace Replit auth with generic OAuth
- Dockerize stack
- Fix Unsplash fallback / add proper image service

**Phase 2 — Real AI (2-3 weeks):**
- Multi-provider LLM integration (cloud + local)
- Real streaming chat assistant
- Real generate from prompt
- Real screenshot→code with vision
- Real URL cloning with web scraping
- Real design suggestions

**Phase 3 — GitHub Integration (1 week):**
- Auto-create repos
- Auto-backup on save
- Commit history

**Phase 4 — Editor Hardening (2-3 weeks):**
- Visual drag-and-drop
- Per-breakpoint responsive editing
- Cloud asset storage
- Custom domains
- Performance/accessibility tools

**Total: 6-9 weeks to a genuinely competitive product**
