# 3D Studio Roadmap

**Note:** `THREE_D_STUDIO_ROADMAP.md` does not exist as a standalone file in the project root. This roadmap is extracted from `dev_roadmap.md` which contains the authoritative 3D Studio section.

## Branch: `feature/3d-studio-core`

Branches from `feature/design-intelligence`.

## Phase 0: Dependency Setup & Type Foundation 🔄

- [x] Install three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, postprocessing, leva, gsap, ccapture.js, three-mesh-bvh
- [x] Create `src/types/three.ts` with ThreeDSceneConfig + DEFAULT_SCENE_CONFIG
- [ ] Register '3d-scene' in sectionRegistry.ts

## Phase 1: Core Canvas + SceneContent ✅

- [x] ThreeDSection.tsx (Canvas wrapper with editing chrome)
- [x] SceneContent.tsx (R3F scene with Leva controls, Environment, Grid, OrbitControls, EffectComposer)

## Phase 2: Four Core Tools ✅

- [x] TypeTool.tsx (3D text with extrusion + bevel)
- [x] CoverTool.tsx (image/video plane + FX stack)
- [x] ObjectTool.tsx (GLB loader + procedural shapes)
- [x] ShapeTool.tsx (SVG → 3D extrusion)

## Phase 3: Template Gallery ✅

- [x] sceneTemplates.ts (heatwave, liquid-metal, earth-moon, retro-futuristic, etc.)
- [x] ThreeDTemplateGallery.tsx (grid with live mini-previews)

## Phase 4: Asset Library + Supabase Storage ✅

- [x] three_assets table + RLS
- [x] supabaseAssets.ts utility
- [x] ThreeDAssetLibrary.tsx (drag-drop upload + picker)

## Phase 5: Timeline & Camera Animation ✅

- [x] ThreeDTimelineEditor.tsx (keyframe editor)
- [x] GSAP integration in SceneContent

## Phase 6: Shader Playground ✅

- [x] shaderPresets.ts (8 named presets)
- [ ] ThreeDShaderPlayground.tsx (GLSL editor + live preview)

## Phase 7: Export Suite ✅

- [x] threeExports.ts (PNG 8K, GLB, WebM video, embed code)
- [ ] ThreeDEmbedExporter.tsx

## Phase 8: AI Scene Mapper ✅

- [x] aiSceneMapper.ts (prompt → ThreeDSceneConfig via LLM)
- [ ] AIScenePromptModal.tsx

## Phase 9: Properties Panel ✅

- [x] ThreeDPropertiesPanel.tsx (12 tabs: AI, Text, Material, Lighting, Effects, Objects, Cover, Camera, Timeline, Shader, Export, Performance)

## Phase 10: Multi-Object Composer ✅

- [x] ThreeDMultiObjectComposer.tsx (add/edit/reorder extraObjects)

## Phase 11: Performance System ✅

- [x] Performance modes (high/balanced/low)
- [x] ThreeDPerformanceMonitor.tsx (FPS + draw calls overlay)

## Phase 12: RAG Ingestion 🔄

- [x] knowledge_base/three-d-studio.md
- [ ] pnpm kb:ingest integration

## Phase 13: Advanced Additions (Stretch) 📋

- [ ] USDZ export (AR)
- [ ] Image-to-3D (AI)
- [ ] Particle system
- [ ] Physics simulation
- [ ] AI texture applicator
- [ ] Noun Project integration
- [ ] Version history per section
- [ ] Collaborative live editing
- [ ] Interactive web embeds
