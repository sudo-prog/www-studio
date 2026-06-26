# Agent Notes

Architecture decisions, file structure, API patterns, and known issues for WWW Studio.

---

## Architecture Decisions

### Monorepo Structure
The project uses a pnpm workspace monorepo with two main directories:
- `artifacts/` — Deployable applications (www-studio, mobile, api-server, mockup-sandbox)
- `lib/` — Shared libraries (api-spec, api-client-react, api-zod, auth-web, db, integrations)

**Rationale:** Separates deployable apps from shared code while maintaining a single version history and dependency tree.

### Hash-Based Routing
Uses Wouter with hash-based routing (`/#/path`) instead of browser history routing.

**Rationale:** GitHub Pages doesn't support SPA fallback routing. Hash routing ensures deep links work without server configuration.

### Zustand for State Management
Global state managed via Zustand stores (`freeformStore`, `sceneStore`).

**Rationale:** Lightweight, no boilerplate, works well with React 19's concurrent features. Avoids Redux complexity for this use case.

### Canvas Rendering
Freeform canvas uses absolute positioning with transforms for element placement.

**Rationale:** Simpler than SVG for mixed content types (text, images, custom code). Enables direct CSS styling and Tailwind integration.

### AI Integration Pattern
AI features follow a tool-calling pattern where the LLM can invoke predefined tools to manipulate the canvas.

**Rationale:** More reliable than free-form code generation. Tools have typed inputs/outputs and can be validated before execution.

### RAG with Libroom
Document ingestion and retrieval uses a custom RAG implementation (`lib/rag/`).

**Rationale:** Provides context-aware AI responses without external dependencies. Ingested documents are stored locally for offline access.

---

## File Structure

```
05_WWW.Studio/
├── artifacts/
│   ├── www-studio/              # Main web app (Vite + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── freeform/    # Freeform editor components
│   │   │   │   ├── scenes/      # Scene editor components
│   │   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   │   └── layout/      # Navbar, shell components
│   │   │   ├── lib/
│   │   │   │   ├── ai/          # AI tools, critique, self-edit, workflows
│   │   │   │   ├── rag/         # RAG ingestion and retrieval
│   │   │   │   └── *.ts         # Feature utilities
│   │   │   ├── pages/           # Route pages (home, editors, share)
│   │   │   ├── App.tsx          # Root component with routing
│   │   │   └── main.tsx         # Entry point
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── api-server/              # Express API server
│   ├── mobile/                  # Expo mobile app
│   └── mockup-sandbox/          # UI component sandbox
├── lib/
│   ├── api-spec/                # OpenAPI specification
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   ├── auth-web/                # Authentication hooks
│   ├── db/                      # Drizzle ORM schema
│   └── integrations/
│       └── gemini-web2api/      # Gemini Web2API Python proxy
├── scripts/                     # Build and utility scripts
├── package.json                 # Root workspace config
└── pnpm-workspace.yaml
```

---

## API Patterns

### GitHub Storage API
Projects are stored as JSON files in GitHub repositories.

```
GET    /repos/{owner}/{repo}/contents/{path}    # Load project
PUT    /repos/{owner}/{repo}/contents/{path}    # Save project
DELETE /repos/{owner}/{repo}/contents/{path}    # Delete project
```

Authentication via GitHub OAuth or personal access tokens.

### AI Chat API
OpenAI-compatible chat completions endpoint.

```
POST /chat/completions
{
  "model": "gemini-2.0-flash",
  "messages": [...],
  "tools": [...],           // Tool definitions for function calling
  "stream": true            // Server-sent events for streaming
}
```

### Internal API (Generated)
React Query hooks auto-generated from OpenAPI spec via Orval.

```typescript
// Usage example
const { data } = useGetProject(owner, repo, path);
const mutation = useSaveProject();
```

---

## Key Components

### FreeformCanvas
The main canvas component. Manages:
- Pan/zoom viewport
- Element selection and multi-select
- Drag/resize/rotate transforms
- Keyboard shortcuts (arrow keys, delete, duplicate)

### FreeformStore
Zustand store for freeform editor state:
- Elements array (id, type, position, size, rotation, styles)
- Selection state
- History stack (undo/redo)
- Viewport state (zoom, pan offset)

### AI Tools
Tool definitions in `src/lib/ai/tools.ts`:
- `addElement` — Add new element to canvas
- `updateElement` — Modify element properties
- `deleteElement` — Remove element from canvas
- `getCanvasState` — Read current canvas state
- `generateCode` — Generate code from canvas

### Code Generators
Export pipeline in `src/lib/code-generators.ts`:
- HTML generator (semantic markup)
- React generator (component-based)
- Tailwind generator (utility classes)

---

## Known Issues

### Performance
- **Large canvases** (>100 elements) may experience lag during pan/zoom
  - *Mitigation:* Virtual rendering planned for Phase 5
- **Initial bundle size** is ~650KB (above 500KB target)
  - *Mitigation:* Code splitting and lazy loading planned

### AI
- **Tool-calling reliability** varies by model — Gemini 2.0 Flash works best
- **Self-editing loops** can sometimes oscillate without converging
  - *Mitigation:* Max iteration limits implemented
- **RAG ingestion** limited to text files (PDF, MD, TXT)

### Browser Compatibility
- **Safari:** Some CSS `backdrop-filter` effects render differently
- **Firefox:** Canvas freehand drawing has slight latency
- **Mobile Safari:** Touch events for rotate/resize need improvement

### Routing
- **Hash routing** means URLs contain `#` — less clean but necessary for GitHub Pages
- **Deep linking** to specific elements not yet implemented

### Storage
- **GitHub API rate limits** (60/hour unauthenticated, 5000/hour authenticated)
- **Large binary assets** (images) stored as base64 in JSON — not optimal
  - *Future:* Consider IPFS or dedicated asset storage

### Accessibility
- **Canvas elements** lack proper ARIA roles and keyboard navigation
- **Color contrast** in some dark mode combinations needs review
- **Screen reader** support for the editor is minimal

---

## Security Considerations

- **XSS Prevention:** Custom code panel uses sandboxed iframes for rendering
- **GitHub Tokens:** Stored in localStorage (consider httpOnly cookies for production)
- **AI Prompt Injection:** User inputs are sanitized before sending to LLM
- **CSP Headers:** Configured in vite.config.ts for production builds

---

## Environment & Tooling

- **Node.js:** v18+ recommended
- **pnpm:** v8+ required for workspace features
- **TypeScript:** v5.9 strict mode
- **Vite:** v7.3 for dev server and builds
- **Tailwind CSS:** v4.3 with `@tailwindcss/vite` plugin

---

## Design Intelligence Module (feature/design-intelligence)

### What it is
Multi-source design synthesis engine. Accepts primary URL + optional secondary URLs/images with annotations. Produces: design.md, tailwind.config.ts, tokens.css, design-tokens.json. Live-editable before download.

### Architecture
- **API route:** `artifacts/api-server/src/routes/design-extract.ts`
- **DB table:** `design_extractions` (Drizzle schema in `lib/db/src/schema/design-extractions.ts`)
- **Frontend page:** `artifacts/www-studio/src/pages/DesignExtract.tsx` at `/#/design-extract`
- **Components:** `artifacts/www-studio/src/components/design-extract/` (12 components)
- **Screenshot service:** `artifacts/api-server/src/lib/screenshot.ts`
- **Intent parser:** `artifacts/api-server/src/lib/intentParser.ts`
- **Prompt system:** `artifacts/api-server/src/lib/designPrompts.ts`
- **Browser fallback:** `artifacts/www-studio/src/lib/designExtractClient.ts` (Gemini API direct for GitHub Pages)

### EndlessTools Gap Analysis (Closed)
- FBX import: Added FBXLoader + auto-convert to GLB
- Alpha channel export: VP9 WebM + transparent PNG
- Stackable effects with drag-to-reorder (postProcessingStack array)
- AI Texture generation (PBR texture sets from prompt)
- Video texture on CoverTool (iOS-safe VideoTexture)
- Animated GLBs (useAnimations auto-play)
- Noun Project in-app search (Edge Function proxy)
- Custom Materials Collection (save/reuse across sessions)
- Web Component embed (single-line script tag, not just iframe)
- Deep freeform integration (z-index, background render mode)
- Context-aware AI generation (page context → aiSceneMapper)
- Self-improving template library (AI template pack generator)
- Scroll choreography (visual timeline component)
- Open format (JSON import/export, no vendor lock-in)

### Dual-mode operation
1. **GitHub Pages (static):** Frontend calls Gemini API directly, image uploads only (no URL screenshots)
2. **Self-hosted:** Frontend calls `/api/design-extract/*`, uses llm.ts

### Key conventions
- Always String(req.params.id) before Drizzle eq()
- JSON fields: JSON.parse() on read, JSON.stringify() on write
- LLM calls: always import from `artifacts/api-server/src/lib/llm.ts`
- Rate limiter: 30 req/min AI limiter on all design-extract endpoints
- After schema changes: `pnpm --filter @workspace/db run push`

### Implementation phases
- **Phase A:** DB schema, screenshot service, intent parser, prompts, API routes
- **Phase B:** Frontend — page, input, progress, token editor, preview, export
- **Phase C:** UI polish, mobile, error states, annotation UX, Google Fonts
- **Phase D:** RAG auto-ingest, design context in AI chat, version history, public gallery
- **Phase E:** Batch extraction, comparison, Figma import, CSS paste, critique, harmony, linter, Claude export
- **Phase F:** Testing & QA

---

## Future Architecture Considerations

1. **CRDT for Collaboration:** Move from last-write-wins to CRDT for real-time collaboration
2. **WebAssembly:** Consider Rust/WASM for canvas rendering performance
3. **Edge Functions:** Move API server to edge for lower latency
4. **Plugin System:** Design extensible architecture for third-party tools
5. **Native Mobile:** Evaluate React Native Skia for mobile canvas performance
