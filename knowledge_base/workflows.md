# WWW Studio — User Workflows

Step-by-step flows for the primary user journeys through the app.

---

## 1. Creating a New Project

**Entry point:** `/editor/new` → `pages/new-project.tsx`

The New Project page offers 4 input methods via tabs:

| Tab | API Call | Description |
|-----|----------|-------------|
| **Clone** | `POST /clone` | Enter a URL → server fetches the site, detects style, generates component tree |
| **Generate** | `POST /generate` | Enter a natural language prompt → LLM generates HTML/React/Tailwind code |
| **Screenshot** | `POST /screenshot-to-code` | Upload an image → vision LLM converts to component tree |
| **Figma** | `POST /generate` | Upload a Figma JSON export → parsed and sent as a prompt |

**Flow:**
1. User selects a tab and provides input (URL, prompt, image, or JSON)
2. The corresponding mutation (`useCloneFromUrl`, `useGenerateFromPrompt`, `useScreenshotToCode`) fires
3. On success: navigates to `/editor/{projectId}`
4. On failure: shows a toast error

**Key detail:** All 4 methods ultimately create a project on the server and redirect to the structured editor.

---

## 2. Adding Elements to Canvas (Structured Editor)

**Entry point:** `/editor/:projectId` → `pages/editor.tsx`

The structured editor is an AI-first page builder:

1. **AI Chat** — User describes what they want → `POST /chat` returns `{ reply, codeChanges, suggestions }`
2. **Direct editing** — Click elements in the preview iframe to select them
3. **Element Inspector** — Modify properties (text, style, layout) of selected element
4. **Sortable Layers** — Drag to reorder DOM layers
5. **Page Manager** — Add/remove/rename pages within the project
6. **Theme Customizer** — Modify design tokens (colors, fonts, spacing)
7. **Assets Panel** — Upload images/video/fonts

**Preview modes:** Desktop / Tablet / Mobile (responsive preview)
**View modes:** Preview / Split / Code

---

## 3. Using AI Assistant

There are **3 distinct AI chat interfaces** depending on context:

### 3a. Structured Editor AI (`AiChatWidget.tsx`)
- Global floating widget available on all pages
- Powered by **Google Gemini** (user provides their own API key)
- Stores config in `localStorage` under `www-studio-gemini-config`
- Supports free-tier Gemini models (2.0 Flash, 2.5 Flash, 1.5 Pro, etc.)
- Suggestions: "Generate a dark SaaS landing page", "Add animated scroll effects"

### 3b. Freeform AI (`FreeformAIChat.tsx`)
- Context-aware chat inside the freeform editor
- Can perform canvas actions: add, update, delete, style, layout
- Supports **local fallback** (no API key needed) for common commands:
  - "Make this more chaotic" → adds random shapes
  - "Apply design tokens" → recolors elements with wellness palette
- With API key: sends to Gemini for intelligent responses
- Also supports: `critiqueDesign()`, `analyzeCodebase()`, tool-calling workflows

### 3c. Scene AI (`SceneChat.tsx`)
- Context-aware chat inside the scene editor
- Actions: add, update, delete scene elements
- **Local fallback** for common scene commands:
  - "Add a floating sage orb" → creates a circle element
  - "Add a lavender blob background" → creates a blurred shape
  - "Make a serene ocean scene" → creates multiple elements
- Uses wellness palette: sage, lavender, coral, sky, peach, forest, mist, sand

**Common pattern across all AI chats:**
- Messages have `role`, `text`, `actions[]`, `applied` state
- Actions are applied to the canvas/editor state
- Suggestion chips guide the user

---

## 4. 3D Scene Creation

**Entry point:** `/scenes` → `pages/scenes.tsx` (gallery) → `/scenes/:id` → `pages/scene-editor.tsx`

### Scene Gallery
- Lists all scenes with SVG previews
- Create new scenes with wellness preset gradients
- AI-powered scene generation via `POST /scenes/:id/ai`
- Fork, delete, publish/unpublish scenes

### Scene Editor
- **SceneCanvas** — SVG-based canvas with drag-to-move elements
- **Element types:** circle, rect, triangle, hexagon, diamond, star, text, svgPath
- **Properties per element:** x, y, width, height, fill, opacity, blur, rotation, animation, locked, visible
- **Animation presets:** gentle-float, gradient-breathe, scale-pulse, fade-in-out, spin-slow, drift
- **ScrollTrigger config** — GSAP ScrollTrigger integration for scroll-based animations
- **Animation Timeline** — Visual timeline editor for sequencing
- **Command Palette** — Keyboard-driven commands
- **Version History** — Snapshot/restore previous states
- **Performance Auditor** — Checks scene complexity
- **Export** — Generate standalone HTML or embed code

### 3D Section (Three.js)
- `ThreeDSection.tsx` — React Three Fiber canvas wrapper
- `SceneContent.tsx` — Renders 3D objects from `ThreeDSceneConfig`
- `ThreeDTemplateGallery.tsx` — Pre-built 3D scene templates
- `ThreeDAssetLibrary.tsx` — Upload and manage 3D assets (stored in Supabase)
- `ThreeDPropertiesPanel.tsx` — Edit 3D object properties
- `ThreeDTimelineEditor.tsx` — Animation timeline for 3D scenes
- `ThreeDMultiObjectComposer.tsx` — Compose multiple 3D objects
- **Primitives:** TypeTool (3D text), ShapeTool (3D shapes), ObjectTool (3D objects), CoverTool (video covers)

---

## 5. Design Extraction Flow

**Entry point:** `/design-extract` → `pages/DesignExtractPage.tsx`

State machine: `input → processing → complete | error`

### Input Phase
- Enter a URL or upload reference images
- Supports multiple references with annotations
- Each reference has an **intent** (detected by `parseAnnotationIntent`):
  - `typography`, `color`, `mobile-layout`, `blend`, `base`, `animation`, `component`, `inspiration`
  - Each intent has a `weight` (0-1) and target `sections`

### Processing Phase
- Calls `POST /design-extract` → server:
  1. Takes screenshot of URL (or uses uploaded image)
  2. Sends to vision LLM for token extraction
  3. Returns extracted design tokens (colors, typography, spacing, radius, shadow, animation, components)
- Client polls `GET /design-extract/:id` for status

### Complete Phase
- **DesignTokenEditor** — Edit extracted tokens (colors, fonts, spacing, etc.)
- **ColorSwatchEditor** — Visual color picker for palette
- **TypographyEditor** — Font family, size, weight editor
- **SpacingEditor** — Spacing scale editor
- **DesignMdPreview** — Preview the generated design.md
- **ExportPanel** — Download in 4 formats:
  - Markdown (design.md)
  - Tailwind Config (tailwind.config.ts)
  - CSS Variables (:root { --color-primary: ... })
  - DTCG JSON (design tokens community group format)
- **ExtractionHistory** — Browse past extractions

### Apply to Project
- `POST /design-extract/:id/apply-to-project` — applies extracted tokens to an existing project

---

## 6. Publishing / Exporting

### Structured Editor Export
- `POST /export` — Renders component tree to downloadable HTML
- `POST /publish` — Generates static HTML/CSS/JS for deployment

### Freeform Publishing
- **PublishButton** — Publishes to GitHub Pages via `publishToGitHubPages()`
  - Exports freeform page to standalone HTML
  - Uses GitHub REST API to commit to `sudo-prog/www-studio-backup` repo
  - Returns live URL
- **GitHubSaveButton** — Saves project backup as JSON to GitHub repo
  - Stores in `projects/` folder
  - Requires GitHub personal access token (stored in localStorage)

### Scene Publishing
- Toggle publish/unpublish from scene gallery
- Published scenes get a "Public" badge
- `SceneShare` page — Publicly accessible scene viewer
- `SceneEmbedCode` — Copy embed code for external sites

### Freeform Sharing
- `FreeformShare` page — View-only shared freeform pages
- Shareable via hash-based URL

---

## Quick Reference: Route → Page → Primary Components

| Route | Page | Key Components |
|-------|------|----------------|
| `/editor/new` | `new-project.tsx` | Clone/Generate/Screenshot/Figma tabs |
| `/editor/:projectId` | `editor.tsx` | SortableLayers, ElementInspector, ThemeCustomizer, PageManager, DesignPanel |
| `/freeform/:projectId?` | `freeform-editor.tsx` | FreeformCanvas, FreeformToolbar, FreeformPropertiesPanel, FreeformAIChat, PublishButton |
| `/scenes` | `scenes.tsx` | SceneCard, WellnessPresets |
| `/scenes/:id` | `scene-editor.tsx` | SceneCanvas, SceneChat, AnimationTimeline, ScrollTriggerConfig, CommandPalette |
| `/design-extract` | `DesignExtractPage.tsx` | DesignExtractInput, DesignTokenEditor, ExportPanel, ExtractionHistory |
| `/design-extract/gallery` | `DesignExtractGallery.tsx` | Extraction list with thumbnails |
