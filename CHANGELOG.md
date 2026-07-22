# Changelog

All notable changes to WWW Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-07-22

### Fixed
- **3D asset (GLB/GLTF) upload** — `.glb`/`.gltf` files were rejected by the asset
  library picker because the `<input accept>` only listed browser-recognized MIME
  types (browsers ignore the `model/gltf-binary` MIME for `.glb`). Added explicit
  file extensions to the accept list plus `.png/.jpg/.webp/.hdr/.exr/.ttf/.otf/
  .woff/.woff2`. Added size validation: 200MB GLB/GLTF, 50MB textures, 100MB HDR,
  10MB fonts — shown inline in the asset library UI.

## [0.4.0] - 2025-01-XX

### Added
- **PWA Support** — Installable as a Progressive Web App with offline capability
- **Dark Mode** — Full dark theme with system preference detection and manual toggle
- **Forms Builder** — Drag-and-drop form creation with validation via react-hook-form and Zod
- **Version History** — Track, browse, and restore previous versions of projects
- **Code Inspector** — Live preview of generated HTML, React, and Tailwind code
- **Publish Button** — One-click deployment to GitHub Pages
- **Custom Code Panel** — Inject custom HTML/CSS/JS into canvas elements
- **Background Picker** — Solid colors, gradients, and image backgrounds
- **Freehand Drawing** — Sketch directly on the canvas
- **Screenshot-to-Freeform** — Convert screenshots to editable canvas elements

### Changed
- Improved canvas performance with optimized rendering
- Enhanced properties panel with more styling options
- Updated Tailwind CSS to v4

## [0.3.0] - 2024-12-XX

### Added
- **AI Tools** — Tool-calling system allowing AI to directly manipulate canvas elements
- **Critique Mode** — AI-powered design feedback and suggestions
- **Self-Editing** — AI can autonomously iterate on and improve designs
- **RAG (Retrieval-Augmented Generation)** — Context-aware AI with document ingestion via Libroom
- **Workflows** — Multi-step AI automation pipelines
- **MCP (Model Context Protocol)** — Extensible tool integration for AI agents
- **AI Freeform Commands** — Natural language commands for canvas manipulation
- **Chaos Monkey V2** — Automated stress testing for canvas elements

### Changed
- Refactored AI chat to support streaming responses
- Improved error handling in AI workflows
- Enhanced prompt engineering for design critique

## [0.2.0] - 2024-11-XX

### Added
- **Freeform Editor** — Canvas-based visual editor with drag, drop, rotate, and resize
- **Elements Toolbar** — Pre-built components (text, images, shapes, buttons, forms)
- **Properties Panel** — Fine-tune styling, layout, and behavior
- **Freeform AI Chat** — Conversational AI integrated into the freeform editor
- **GitHub Save Button** — Save projects directly to GitHub repositories
- **Code Generators** — Export to HTML, React, and Tailwind CSS

### Fixed
- **Hash Routing Fix** — Fixed routing issues for GitHub Pages deployment (wouter hash routing)
- Canvas element selection and focus issues
- Z-index layering bugs in freeform canvas

### Changed
- Migrated routing to wouter for hash-based routing compatibility
- Improved state management with Zustand stores

## [0.1.0] - 2024-10-XX

### Added
- **Initial Release** — Core structured editor functionality
- **Scenes** — Multi-scene project management with scene-specific editing
- **Scene Chat** — AI assistance within scene context
- **Scene Export** — Export scenes as shareable links
- **Performance Auditor** — Analyze scene performance metrics
- **Scroll Debug Overlay** — Debug scroll-triggered animations
- **Wellness Library** — Design inspiration and component library
- **Command Palette** — Quick access to all editor commands
- **GitHub Storage** — Load and save projects via GitHub API
- **Supabase Integration** — Authentication and database storage
- **Gemini Web2API** — Free AI access via Gemini proxy
- **API Server** — Express server with OpenAI-compatible endpoints
- **Mobile App** — Expo-based mobile companion app
- **Design Tokens** — Centralized design system tokens
- **Animation Presets** — GSAP and Framer Motion animation library
