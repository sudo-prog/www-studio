# 3D Studio Knowledge Base

## Overview

The 3D Studio Module is a React Three Fiber-powered scene builder integrated into WWW Studio's freeform editor. It allows users to create, configure, and embed interactive 3D scenes without leaving the editor.

## Architecture

- **Engine**: React Three Fiber (R3F) + Drei helpers + postprocessing
- **State**: Configuration via `ThreeDSceneConfig` — a fully typed JSON object
- **Persistence**: Scenes stored as config JSON in Supabase (projects table)
- **Rendering**: Client-side via WebGL in browser
- **Export**: PNG (8K), GLB, WebM video, embeddable web component

## ThreeDSceneConfig Fields

| Field | Type | Purpose |
|-------|------|---------|
| showText | boolean | Toggle text visibility |
| text | string | 3D text content |
| fontSize | number | Text size in 3D units |
| fontUrl | string | Path to Three.js JSON font |
| letterSpacing | number | Space between characters |
| textDepth | number | Extrusion depth |
| bevelEnabled | boolean | Enable bevel on 3D text |
| bevelThickness | number | Bevel thickness |
| color | string | Primary color (hex) |
| metalness | number | PBR metalness (0–1) |
| roughness | number | PBR roughness (0–1) |
| emissive | string | Emissive color |
| emissiveIntensity | number | Emissive strength |
| wireframe | boolean | Render as wireframe |
| envPreset | EnvPreset | HDR environment preset |
| envIntensity | number | Environment light intensity |
| bgColor | string | Background color (fallback) |
| showGrid | boolean | Show reference grid |
| autoRotate | boolean | Auto-rotate scene |
| rotationSpeed | number | Rotation speed (rad/s) |
| rotationAxis | 'x' \| 'y' \| 'z' | Rotation axis |
| scrollParallaxStrength | number | Scroll parallax multiplier |
| cameraPosition | [x,y,z] | Camera position |
| cameraFov | number | Camera field of view |
| enableOrbitControls | boolean | Enable user orbit |
| bloom | boolean | Bloom post-processing |
| bloomIntensity | number | Bloom strength |
| bloomThreshold | number | Bloom luminance threshold |
| dof | boolean | Depth of field |
| dofFocalLength | number | DOF focal length |
| dofBokehScale | number | DOF bokeh scale |
| chromatic | boolean | Chromatic aberration |
| chromaticOffset | number | Chromatic offset |
| vignette | boolean | Vignette effect |
| vignetteIntensity | number | Vignette strength |
| noise | boolean | Film grain noise |
| noiseOpacity | number | Noise opacity |
| modelUrl | string \| null | GLB model URL |
| modelScale | number | Model scale |
| modelPosition | [x,y,z] | Model position |
| coverMediaUrl | string \| null | Image/video URL |
| coverMediaType | 'image' \| 'video' \| null | Cover media type |
| coverEffects | object | Cover FX toggles |
| extraObjects | ExtraObject[] | Additional 3D objects |
| keyframes | Keyframe[] | Animation keyframes |
| timeline | TimelineConfig | Timeline config |
| shader | ShaderConfig | Custom shader |
| performanceMode | 'high' \| 'balanced' \| 'low' | Quality mode |
| shadowsEnabled | boolean | Enable shadows |

## Templates

15 built-in templates organized by category:
- **Typography • FX**: Heatwave, Retro Futuristic, Cyber Neon
- **Abstract**: Liquid Metal, Pixel World, Color Flow, Aurora, Void Sphere, Lava Lamp
- **Interactive Space**: Earth & Moon
- **Loop Animation**: Smileys Trail
- **Glitch**: System Error
- **Sci-Fi**: Hologram
- **Hero**: Studio Promo
- **Experimental**: Typographic Chaos

## Shader Presets

8 built-in GLSL shaders:
1. Sine Wave — vertex displacement + colour sweep
2. Hologram — scan lines + transparency flicker
3. Lava — animated noise colour
4. Aurora — layered sine waves
5. Glitch — block noise UV distortion
6. Neon Pulse — emissive pulse
7. Matrix Rain — falling character-like strips
8. Iridescent — view-angle dependent colour shift

## Export Options

- **PNG**: Up to 8K resolution via offscreen canvas
- **GLB**: Binary glTF via GLTFExporter
- **WebM**: VP9 video via MediaRecorder
- **Embed**: iframe or web component snippet

## Known Gotchas

1. **Leva + StrictMode**: Double-renders can fire onChange twice. Gate with isFirstRender ref.
2. **GLTF CORS**: Supabase Storage needs proper CORS headers for model loading.
3. **VideoTexture on iOS**: Must be muted, playsinline, autoplay.
4. **Font loading**: Text3D requires Three.js JSON font format, not WOFF. Convert via facetype.js.
5. **useThree outside Canvas**: Use forwarded ref or React context to pass gl/scene out.
6. **postprocessing version**: Import KernelSize from postprocessing, not @react-three/postprocessing.
7. **Lenis + R3F**: useLenis must be called inside a component descendant of ReactLenis provider.
8. **GLB export**: Post-processing effects are NOT exportable.
9. **Performance**: Never render more than 2 EffectComposer stacks simultaneously.
10. **TypeScript + shaderMaterial**: Needs manual module augmentation for JSX intrinsic elements.

## How to Add a New Template

1. Open `src/utils/three/sceneTemplates.ts`
2. Add new entry to `sceneTemplates` array with id, name, category, description, icon, and config (Partial<ThreeDSceneConfig>)
3. Run typecheck to verify

## How to Add a New Shader Preset

1. Open `src/utils/three/shaderPresets.ts`
2. Add entry with id, name, description, vertexGLSL, fragmentGLSL, uniforms array
3. The shader playground in Phase 6 will auto-discover it

## How to Add a New Post-Processing Effect

1. Install the effect from @react-three/postprocessing if needed
2. Add toggle + params to ThreeDSceneConfig
3. Add conditional rendering in SceneContent's PostProcessing component
