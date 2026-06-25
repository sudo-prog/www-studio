# Contributing to WWW Studio

Thank you for your interest in contributing to WWW Studio! This document will help you get started.

## How to Set Up Development

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** (package manager)
- **Git**

### Installation

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/www-studio.git
   cd www-studio
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start the development server:
   ```bash
   pnpm --filter @workspace/www-studio run dev
   ```
5. Open your browser to the URL shown in the terminal (default: http://localhost:5173)

### Optional: AI Features

To enable AI features, you'll need to set up an LLM provider:

**Option A: Local LLM (Ollama)**
```bash
# Install Ollama and pull a model, then:
LLM_BASE_URL=http://localhost:11434/v1 LLM_MODEL=llama3.2 pnpm --filter @workspace/api-server run dev
```

**Option B: Gemini Web2API (Free)**
```bash
bash scripts/start-gemini-proxy.sh
LLM_BASE_URL=http://localhost:8081/v1 LLM_MODEL=gemini-2.0-flash pnpm --filter @workspace/api-server run dev
```

**Option C: OpenAI**
```bash
OPENAI_API_KEY=sk-your-key pnpm --filter @workspace/api-server run dev
```

## How to Run Tests

```bash
# Typecheck all packages (primary validation)
pnpm run typecheck

# Build all packages
pnpm run build

# Typecheck specific package
pnpm --filter @workspace/www-studio run typecheck
```

> Note: The project currently relies on TypeScript type checking as the primary validation. Unit and integration tests are planned for future releases.

## How to Submit PRs

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the code style guidelines below
3. **Typecheck your changes**:
   ```bash
   pnpm run typecheck
   ```
4. **Commit** with a clear, descriptive message:
   ```bash
   git commit -m "feat: add new canvas element type"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** on GitHub with:
   - A clear description of what you changed and why
   - Screenshots/videos for UI changes
   - Reference to any related issues

### PR Checklist

- [ ] Code passes `pnpm run typecheck`
- [ ] No console errors or warnings introduced
- [ ] Changes work in both light and dark mode
- [ ] Mobile/responsive behavior is maintained
- [ ] New features include appropriate documentation

## Code Style

### TypeScript

- **Strict mode is enabled** — all code must be fully typed
- Avoid `any` — use proper types or `unknown` with type guards
- Use interfaces for object shapes, type aliases for unions/primitives
- Prefer `const` over `let`; never use `var`

```typescript
// Good
interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

// Avoid
const element: any = getElement();
```

### React & Components

- Use functional components with hooks
- Co-locate component styles with the component (Tailwind classes)
- Use shadcn/ui components from `src/components/ui/` when available
- Keep components small and focused — extract sub-components when a file exceeds ~200 lines

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow the existing design token system (`src/lib/design-tokens.ts`)
- Use `cn()` (clsx + tailwind-merge) for conditional class composition
- Avoid arbitrary values when a design token exists

```typescript
// Good
<div className={cn("flex items-center gap-2", isActive && "bg-primary")} />

// Avoid
<div className={cn("flex items-center gap-2", isActive && "bg-[#3b82f6]")} />
```

### shadcn/ui

- All UI primitives come from `@radix-ui/*` packages
- Components are customized via CVA (class-variance-authority)
- Follow the existing pattern in `src/components/ui/` for new components

### File Organization

```
src/
├── components/        # Reusable UI components
│   ├── freeform/      # Freeform editor components
│   ├── scenes/        # Scene editor components
│   ├── ui/            # Base UI primitives (shadcn)
│   └── layout/        # Layout components (Navbar, etc.)
├── lib/               # Utilities and business logic
│   ├── ai/            # AI tools, critique, self-edit
│   ├── rag/           # RAG ingestion and retrieval
│   └── *.ts           # Feature-specific utilities
├── pages/             # Route pages
└── stores/            # Zustand stores
```

### Naming Conventions

- **Files:** kebab-case for files (`freeform-canvas.tsx`), PascalCase for component files
- **Components:** PascalCase (`FreeformCanvas`)
- **Functions/variables:** camelCase (`getElementById`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_CANVAS_SIZE`)
- **Types/Interfaces:** PascalCase (`CanvasElement`)
- **Hooks:** camelCase starting with `use` (`useFreeformStore`)

### Git Commit Messages

Follow conventional commits:
- `feat:` — New feature
- `fix:`  Bug fix
- `docs:`  Documentation changes
- `refactor:` Code refactoring
- `style:` Formatting changes
- `chore:` Maintenance tasks

## Questions?

Open an issue on GitHub or reach out through the project's discussion board.
