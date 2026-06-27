# WWW Studio — 3D Studio Module

## Overview

The 3D Studio is a **React Three Fiber-powered 3D scene builder** integrated into WWW Studio. It allows users to create, edit, and export 3D scenes with professional features: templates, timeline animation, shaders, asset management, AI scene generation, and multi-format export.

## Type System (`src/types/three.ts`)

The 3D Studio is built around a comprehensive `ThreeDSceneConfig` interface:

- **EnvPreset**: `"city" | "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio"`
- **ExtraObject**: Scene objects with type, position, rotation, scale, material properties, optional GLB model URL
- **Keyframe / AnimationClip**: Timeline-based animation system
- **ThreeDSceneConfig**: Master config covering camera, lights, environment, post-processing, timeline, export settings, performance mode, tags

## Components (`src/components/three/`)

### Core Scene

| File | Purpose |
|------|---------|
| `ThreeDSection.tsx` | Canvas wrapper — renders the R3F `<Canvas>` with editing chrome, export buttons (PNG/GLB) |
| `SceneContent.tsx` | Main scene renderer — Environment, Grid, Lights, RotatingGroup, OrbitControls, PostProcessing (Bloom, ChromaticAberration), Leva controls |

### Primitives (`src/components/three/primitives/`)

| File | Purpose |
|------|---------|
| `TypeTool.tsx` | 3D text with extrusion + bevel using `@react-three/drei` Text3D |
| `ShapeTool.tsx` | SVG → 3D extrusion (currently placeholder with basic shape) |
| `ObjectTool.tsx` | Procedural shapes (sphere, box, torus, cone, cylinder) + GLB loader |
| `CoverTool.tsx` | Image/video plane with media texture |

### Composers & Editors

| File | Purpose |
|------|---------|
| `ThreeDMultiObjectComposer.tsx` | Add/edit/reorder/remove extra objects in scene (sphere, box, torus, cone, cylinder, custom-glb) |
| `ThreeDTemplateGallery.tsx` | Modal gallery with search + category filters for scene templates |
| `ThreeDPropertiesPanel.tsx` | 12-tab properties panel: AI, Text, Material, Lighting, Effects, Objects, Cover, Camera, Timeline, Shader, Export, Performance |
| `ThreeDTimelineEditor.tsx` | Keyframe editor for camera position, rotation speed, env preset with GSAP easing |
| `ThreeDPerformanceMonitor.tsx` | FPS counter + average FPS + performance recommendations (high/balanced/low modes) |

### Asset Management

| File | Purpose |
|------|---------|
| `ThreeDAssetLibrary.tsx` | Modal for browsing 3D assets (GLB, textures, HDR, fonts) with upload support |
| `supabaseAssets.ts` | Supabase Storage integration for 3D assets (three_assets table) |

## Utilities (`src/utils/three/`)

| File | Purpose |
|------|---------|
| `sceneTemplates.ts` | 15+ scene presets (heatwave, liquid-metal, earth-moon, retro-futuristic, etc.) with category, icon, and partial config |
| `shaderPresets.ts` | 8 named GLSL shader presets (wave, hologram, etc.) with vertex/fragment shaders and uniforms |
| `threeExports.ts` | Export functions: PNG (8K via offscreen canvas), GLB (GLTFExporter), WebM video (MediaRecorder + ccapture.js) |
| `aiSceneMapper.ts` | System prompt for converting natural language → ThreeDSceneConfig JSON via LLM |
| `supabaseAssets.ts` | Supabase Storage helpers for 3D asset CRUD |

## Key Features

1. **Scene Templates** — 15+ presets across categories (Typography FX, Abstract, Interactive Space, etc.)
2. **Post-Processing** — Bloom, Chromatic Aberration, Vignette, Noise, Tone Mapping
3. **Animation** — GSAP-powered keyframe timeline for camera, rotation, environment
4. **Shaders** — 8 built-in GLSL presets with live editing capability
5. **Export** — PNG (8K), GLB binary, WebM video (configurable duration/fps)
6. **AI Scene Generation** — Natural language prompt → full 3D scene config via LLM
7. **Performance Monitoring** — Real-time FPS with auto-recommendations
8. **Asset Library** — GLB model loading, texture uploads, Supabase Storage integration
9. **Multi-Object Support** — Add, remove, duplicate, transform multiple objects in scene

## Integration Points

- 3D scenes are registered as section type `'3d-scene'` in `sectionRegistry.tsx`
- Scene editor accessible at `/scenes/:id`
- Preview at `/scenes/:id/preview`
- Share at `/scenes/:id/share`
- AI scene generation calls api-server via HTTP (never imports directly)
