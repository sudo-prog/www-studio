# WWW Studio — Technology Stack

## Root Package

| Field | Value |
|-------|-------|
| Name | `workspace` |
| Version | `0.0.0` |
| License | MIT |
| Node | `>=20.19` |
| Package Manager | pnpm (monorepo with workspaces) |

## Frontend (`artifacts/www-studio`)

**Package name:** `@workspace/www-studio`
**Type:** ESM (`"type": "module"`)

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.0 | UI framework |
| react-dom | ^19.1.0 | DOM rendering |
| vite | ^7.3.2 | Build tool & dev server |
| typescript | (via root) ~5.9.3 | Type safety |

### Styling
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4.3.1 | Utility-first CSS |
| @tailwindcss/vite | ^4.3.1 | Tailwind Vite plugin |
| @tailwindcss/typography | ^0.5.15 | Prose styles |
| tw-animate-css | ^1.4.0 | Tailwind animations |
| class-variance-authority | ^0.7.1 | Component variants |
| clsx | ^2.1.1 | Conditional classes |
| tailwind-merge | ^3.3.1 | Tailwind class merging |

### UI Components (shadcn/ui)
All `@radix-ui/react-*` packages (v1.x) — accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip

Additional UI: cmdk, vaul, lucide-react, react-icons, react-day-picker, react-hook-form, @hookform/resolvers, input-otp, react-resizable-panels, recharts, embla-carousel-react, framer-motion, sonner

### 3D / Graphics
| Package | Version | Purpose |
|---------|---------|---------|
| three | ^0.185.0 | Three.js core |
| @react-three/fiber | ^9.6.1 | React renderer for Three.js |
| @react-three/drei | ^10.7.7 | Useful helpers for R3F |
| @react-three/postprocessing | ^3.0.4 | Post-processing effects |
| postprocessing | ^6.39.1 | Post-processing library |
| leva | ^0.10.1 | GUI controls |
| gsap | ^3.15.0 | Animation library |
| ccapture.js | ^1.1.0 | Canvas capture for video |
| three-mesh-bvh | ^0.9.10 | Fast raycasting |
| three-stdlib | ^2.36.1 | Three.js utilities |

### State & Data
| Package | Version | Purpose |
|---------|---------|---------|
| zustand | ^5.0.14 | State management |
| @tanstack/react-query | ^5.90.21 | Server state / caching |
| wouter | ^3.3.5 | Client-side routing |

### Forms & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| zod | ^3.25.76 | Schema validation |
| react-hook-form | ^7.55.0 | Form management |
| @hookform/resolvers | ^3.10.0 | Form validation resolver |

### Optional Services
| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | ^2.108.2 | Supabase client (optional) |

### Dev Dependencies
- @testing-library/react, @testing-library/jest-dom, vitest — testing
- @types/react, @types/three, @types/node, @types/ccapture.js — type definitions
- @vitejs/plugin-react — Vite React plugin
- date-fns, googleFonts — utilities

---

## API Server (`artifacts/api-server`)

**Package name:** `@workspace/api-server`
**Type:** ESM (`"type": "module"`)

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | HTTP framework |
| cors | ^2.8.6 | CORS middleware |
| cookie-parser | ^1.4.7 | Cookie parsing |
| pino | ^9.14.0 | Logging |
| pino-http | ^10.5.0 | HTTP logging |

### AI / LLM
| Package | Version | Purpose |
|---------|---------|---------|
| openai | ^6.42.0 | OpenAI-compatible client |

### Database
| Package | Version | Purpose |
|---------|---------|---------|
| drizzle-orm | ^0.45.2 | ORM |
| @workspace/db | workspace:* | Shared DB schema |

### Security
| Package | Version | Purpose |
|---------|---------|---------|
| bcryptjs | ^3.0.3 | Password hashing |
| express-rate-limit | ^8.5.2 | Rate limiting |
| zod | ^3.25.76 | Input validation |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| archiver | ^8.0.0 | File archiving |
| svgo | ^4.0.1 | SVG optimization |

### Dev Dependencies
- esbuild (0.27.3) + esbuild-plugin-pino — bundling
- pino-pretty — pretty logging
- vitest — testing
- @types/express, @types/cors, @types/bcryptjs, @types/node — type definitions

---

## Shared Libraries

### `@workspace/db` (lib/db)
- Drizzle ORM with PostgreSQL
- pgvector extension for RAG embedding search
- Schema includes: projects, scenes, components, templates, gallery_templates, design_extractions, knowledge_chunks, project_snapshots, chat_messages, users

### `@workspace/api-zod` (lib/api-zod)
- Shared Zod schemas used by both frontend and backend
- Ensures type safety across the API boundary

### `@workspace/api-client-react` (lib/api-client-react)
- React hooks for making API calls to the backend
- Typed against shared Zod schemas

### `@workspace/auth-web` (lib/auth-web)
- Shared authentication types for frontend consumption

---

## Infrastructure

| Tool | Purpose |
|------|---------|
| pnpm workspaces | Monorepo management |
| TypeScript project references | Type checking across packages |
| Vite | Frontend build (outputs to `dist/public`) |
| esbuild | API server build (`build.mjs`) |
| Vercel | Deployment (frontend + API server) |
| GitHub Pages | Static frontend hosting |
| Supabase | Optional auth + PostgreSQL + Storage |
| PostgreSQL | Primary database |
