# WWW Studio

A web-based visual editor for building websites with AI assistance.

🚀 **[Live Demo](https://sudo-prog.github.io/www-studio/)** — Visit the live GitHub Pages deployment

## Features

### 🎨 Freeform Editor
- **Canvas-based design** — Drag, drop, rotate, and resize elements freely on an infinite canvas
- **Elements toolbar** — Pre-built components (text, images, shapes, buttons, forms, etc.)
- **Properties panel** — Fine-tune styling, layout, and behavior of any selected element
- **Freehand drawing** — Sketch directly on the canvas
- **Background picker** — Solid colors, gradients, and image backgrounds
- **Screenshot-to-code** — Upload a screenshot and convert it to editable canvas elements
- **Custom code panel** — Inject custom HTML/CSS/JS into any element

### 📐 Structured Editor
- Traditional structured page layout with semantic HTML output
- Component-based architecture for reusable sections

### 🎬 Scenes
- Multi-scene project management
- Scene-specific chat and AI assistance
- Scene export and sharing
- Performance auditing and scroll debugging tools
- Wellness library for design inspiration

### 🤖 AI Assistant
- **Chat interface** — Conversational AI for design and code help
- **Tool-calling** — AI can directly manipulate canvas elements, generate code, and modify styles
- **Critique mode** — Get AI-powered design feedback and suggestions
- **Self-editing** — AI can autonomously iterate on and improve designs
- **RAG (Retrieval-Augmented Generation)** — Context-aware AI with document ingestion
- **Workflows** — Multi-step AI automation pipelines
- **MCP (Model Context Protocol)** — Extensible tool integration for AI agents

### 💾 GitHub Storage
- Save and load projects directly from GitHub repositories
- Version-controlled design files
- Collaborative editing through Git workflows

### 📱 PWA Support
- Installable as a Progressive Web App
- Offline capability for continued editing without internet
- Native-like experience on desktop and mobile

### 🌙 Dark Mode
- Full dark theme support
- System preference detection
- Manual toggle

### 📝 Forms Builder
- Drag-and-drop form creation
- Form element renderer with validation
- Integration with react-hook-form and Zod schemas

### 🕐 Version History
- Track changes across editing sessions
- Restore previous versions
- Visual diff between versions

### 📤 Code Exports
- **HTML** — Clean, semantic HTML output
- **React** — Component-based React code generation
- **Tailwind CSS** — Utility-first CSS framework output
- **Code inspector** — Live preview of generated code

### 🚀 One-Click Publish
- Deploy directly to GitHub Pages
- Instant public URL generation
- Share projects with a single link

## Project Structure

```
├── artifacts/
│   ├── www-studio/      # Main web application
│   ├── mobile/          # Expo mobile app
│   ├── api-server/      # Express API server with OpenAI integration
│   └── mockup-sandbox/  # UI component sandbox
└── lib/
    ├── api-spec/          # OpenAPI spec + Orval config
    ├── api-client-react/   # Generated React Query hooks
    ├── api-zod/           # Generated Zod schemas
    ├── auth-web/          # Authentication hooks
    ├── db/                # Drizzle ORM schema
    └── integrations/
        └── gemini-web2api/ # Gemini Web2API Python proxy (OpenAI-compatible)
```

## Development

```bash
# Install dependencies
pnpm install

# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run main app
pnpm --filter @workspace/www-studio run dev
```

## Environment Variables

Required for API server:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `OPENAI_API_KEY` - OpenAI API key for AI features (generation, screenshot-to-code, image generation)
- `LLM_BASE_URL` - Unified LLM base URL (default: http://localhost:11434/v1)
- `LLM_MODEL` - LLM model name
- `GEMINI_WEB2API_BASE_URL` - Gemini Web2API proxy URL (default: http://localhost:8081/v1)
- `GEMINI_WEB2API_MODEL` - Gemini model (default: gemini-2.0-flash)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID for GitHub login
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret for GitHub login
- `EXPO_PUBLIC_DOMAIN` - Domain for mobile app API connection
- `EXPO_PUBLIC_GITHUB_CLIENT_ID` - GitHub OAuth client ID for mobile app

## Gemini Web2API Integration

WWW Studio includes a Python proxy that converts Google Gemini's web interface into an OpenAI-compatible API. This provides **free AI access** with no API keys required.

```bash
# Start the proxy (starts on localhost:8081)
bash scripts/start-gemini-proxy.sh
```

Then set the API server to use it:
```bash
LLM_BASE_URL=http://localhost:8081/v1 LLM_MODEL=gemini-2.0-flash bash artifacts/api-server/build.mjs && bash artifacts/api-server/src/index.mjs
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix)
- **State:** Zustand
- **Routing:** Wouter (hash-based for GitHub Pages compatibility)
- **AI:** OpenAI-compatible APIs, Gemini Web2API proxy, RAG with Libroom
- **Storage:** GitHub API, Supabase
- **Animations:** GSAP, Framer Motion, Lenis (smooth scroll)
- **Drag & Drop:** @dnd-kit
- **Forms:** react-hook-form, Zod
- **API:** Express, tRPC-style with generated React Query hooks
- **Database:** PostgreSQL with Drizzle ORM
- **Mobile:** Expo (React Native)

## License

MIT
