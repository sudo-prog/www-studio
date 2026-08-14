# WWW Studio

WWW Studio is a professional, web-based visual editor designed for building modern websites with integrated AI assistance. It bridges the gap between freeform design and structured web development, allowing users to prototype rapidly on an infinite canvas and export clean, production-ready code.

🚀 **[Live Demo](https://www-studio-red.vercel.app/)** — Visit the live Vercel deployment

## Key Features

### 🎨 Freeform Editor
- **Canvas-based design** — Drag, drop, rotate, and resize elements freely on an infinite canvas.
- **Elements toolbar** — Pre-built components including text, images, shapes, buttons, and forms.
- **Properties panel** — Fine-tune styling, layout, and behavior of any selected element.
- **Freehand drawing** — Sketch directly on the canvas for rapid ideation.
- **Screenshot-to-code** — Upload a screenshot and convert it into editable canvas elements.
- **Custom code panel** — Inject custom HTML/CSS/JS directly into any element.

### 📐 Structured Editor
- Traditional structured page layout with semantic HTML output.
- Component-based architecture for reusable sections.

### 🎬 Scene Management
- Multi-scene project management for complex site architectures.
- Scene-specific chat and AI assistance.
- Performance auditing and scroll debugging tools.

### 🤖 AI Assistant
- **Conversational Interface** — Direct chat for design guidance and code generation.
- **Tool-calling** — AI can autonomously manipulate canvas elements and modify styles.
- **Critique Mode** — Receive professional AI-powered design feedback and suggestions.
- **RAG Integration** — Context-aware AI utilizing document ingestion for project-specific knowledge.
- **MCP Support** — Extensible tool integration via the Model Context Protocol.

### 💾 Ecosystem & Deployment
- **GitHub Integration** — Save and load projects directly from GitHub repositories with version control.
- **PWA Support** — Fully installable Progressive Web App with offline editing capabilities.
- **One-Click Publish** — Instant deployment to Vercel with public URL generation.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix)
- **State Management:** Zustand
- **Routing:** Wouter
- **AI Engine:** OpenAI-compatible APIs, Gemini Web2API proxy, RAG with Libroom
- **Storage:** GitHub API, Supabase
- **Animations:** GSAP, Framer Motion, Lenis
- **Drag & Drop:** @dnd-kit
- **Forms:** react-hook-form, Zod
- **Backend:** Express, tRPC-style generated React Query hooks
- **Database:** PostgreSQL with Drizzle ORM
- **Mobile:** Expo (React Native)

## Getting Started

### Prerequisites
- Node.js (Latest LTS)
- pnpm (`npm install -g pnpm`)

### Installation
```bash
# Clone the repository
git clone https://github.com/sudo-prog/www-studio.git
cd www-studio

# Install dependencies
pnpm install
```

### Development
```bash
# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run the main application
pnpm --filter @workspace/www-studio run dev
```

## Usage

1. **Design:** Start by adding elements from the toolbar to the canvas or using the "Screenshot-to-code" feature to import existing designs.
2. **Refine:** Use the Properties panel to adjust styles or the AI Assistant to iterate on the layout.
3. **Structure:** Transition to the Structured Editor to organize your elements into a semantic web page.
4. **Deploy:** Once satisfied, use the "One-Click Publish" feature to deploy your site to Vercel.

## Environment Variables

Required for the API server:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `LLM_BASE_URL` - Primary AI backend (OmniRoute gateway). Default: `http://127.0.0.1:20128/v1`
- `LLM_MODEL` - Virtual model (default `auto/best-coding-fast`)
- `LLM_API_KEY` - OmniRoute key (literal `omniroute`)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - For GitHub OAuth authentication

## License

This project is licensed under the MIT License.
