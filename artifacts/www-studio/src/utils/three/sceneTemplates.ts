import { type ThreeDSceneConfig } from '@/types/three';

export interface SceneTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  config: Partial<ThreeDSceneConfig>;
}

export const sceneTemplates: SceneTemplate[] = [
  {
    id: 'heatwave',
    name: 'Heatwave',
    category: 'Typography • FX',
    description: 'Orange text, sunset env, bloom + chromatic, heat distortion',
    icon: '🔥',
    config: {
      text: 'HEATWAVE',
      color: '#ff6b35',
      envPreset: 'sunset',
      bloom: true, bloomIntensity: 2.0,
      chromatic: true, chromaticOffset: 0.004,
      metalness: 0.6, roughness: 0.2,
    },
  },
  {
    id: 'liquid-metal',
    name: 'Liquid Metal',
    category: 'Abstract',
    description: 'Silver, metalness=1, roughness=0.02, warehouse env, strong bloom',
    icon: '🪩',
    config: {
      text: 'LIQUID',
      color: '#c0c0c0',
      envPreset: 'warehouse',
      bloom: true, bloomIntensity: 1.8,
      metalness: 1.0, roughness: 0.02,
      bevelEnabled: false,
    },
  },
  {
    id: 'earth-moon',
    name: 'Earth & Moon',
    category: 'Interactive Space',
    description: 'Two sphere objects, night env, displacement map textures',
    icon: '🌍',
    config: {
      text: 'EARTH',
      color: '#4a90d9',
      envPreset: 'night',
      bloom: false,
      metalness: 0.1, roughness: 0.8,
      extraObjects: [
        { id: 'moon', type: 'sphere', position: [3, 1, -2], rotation: [0, 0, 0], scale: 0.4, color: '#cccccc', metalness: 0.1, roughness: 0.9 },
      ],
    },
  },
  {
    id: 'retro-futuristic',
    name: 'Retro Futuristic',
    category: 'Typography',
    description: 'Chrome text, neon grid, chromatic aberration, city env',
    icon: '💜',
    config: {
      text: 'RETRO',
      color: '#ff00ff',
      envPreset: 'city',
      bloom: true, bloomIntensity: 2.5,
      chromatic: true, chromaticOffset: 0.006,
      metalness: 0.9, roughness: 0.1,
    },
  },
  {
    id: 'smileys-trail',
    name: 'Smileys Trail',
    category: 'Loop Animation',
    description: 'Multiple torus objects, trail via extraObjects, fast rotation',
    icon: '🌈',
    config: {
      text: 'SMILE',
      color: '#fbbf24',
      envPreset: 'dawn',
      rotationSpeed: 1.5,
      extraObjects: [
        { id: 't1', type: 'torus', position: [2, 0, 0], rotation: [0.5, 0, 0], scale: 0.3, color: '#f472b6', metalness: 0.5, roughness: 0.3 },
        { id: 't2', type: 'torus', position: [-2, 0, 0], rotation: [-0.5, 0, 0], scale: 0.3, color: '#34d399', metalness: 0.5, roughness: 0.3 },
        { id: 't3', type: 'torus', position: [0, 2, 0], rotation: [0, 0.5, 0], scale: 0.3, color: '#60a5fa', metalness: 0.5, roughness: 0.3 },
      ],
    },
  },
  {
    id: 'pixel-world',
    name: 'Pixel World',
    category: 'Abstract',
    description: 'Box-based scene, low-poly aesthetics, no post-processing',
    icon: '🟩',
    config: {
      text: 'PIXEL',
      color: '#22c55e',
      envPreset: 'forest',
      bloom: false, chromatic: false,
      metalness: 0.2, roughness: 0.9,
      extraObjects: [
        { id: 'b1', type: 'box', position: [2, -0.5, 0], rotation: [0, 0.5, 0], scale: 1, color: '#16a34a', metalness: 0.2, roughness: 0.9 },
        { id: 'b2', type: 'box', position: [-2, -0.5, 1], rotation: [0, -0.3, 0], scale: 0.8, color: '#15803d', metalness: 0.2, roughness: 0.9 },
        { id: 'b3', type: 'box', position: [0, -0.5, -2], rotation: [0, 0.8, 0], scale: 1.2, color: '#065f46', metalness: 0.2, roughness: 0.9 },
      ],
    },
  },
  {
    id: 'system-error',
    name: 'System Error',
    category: 'Glitch',
    description: 'Glitch effect, green text, noise overlay',
    icon: '⚠️',
    config: {
      text: 'ERROR',
      color: '#00ff00',
      envPreset: 'night',
      noise: true, noiseOpacity: 0.08,
      bloom: true, bloomIntensity: 1.5,
      chromatic: true, chromaticOffset: 0.008,
    },
  },
  {
    id: 'color-flow',
    name: 'Color Flow',
    category: 'Animated',
    description: 'Animated emissive cycling through hues via shader, soft DOF',
    icon: '🌊',
    config: {
      text: 'FLOW',
      color: '#06b6d4',
      envPreset: 'studio',
      dof: true, dofFocalLength: 0.08, dofBokehScale: 8,
      bloom: true, bloomIntensity: 1.2,
    },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    category: 'Typography',
    description: 'Dark bg, violet text, heavy bloom + vignette',
    icon: '💎',
    config: {
      text: 'CYBER',
      color: '#8b5cf6',
      envPreset: 'night',
      bgColor: '#000000',
      bloom: true, bloomIntensity: 3.0,
      vignette: true, vignetteIntensity: 0.5,
      chromatic: true, chromaticOffset: 0.003,
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'Ambient',
    description: 'Shader-based aurora sky, subtle text, fog',
    icon: '🌌',
    config: {
      text: 'AURORA',
      color: '#a78bfa',
      envPreset: 'night',
      bloom: true, bloomIntensity: 1.0,
      vignette: true, vignetteIntensity: 0.4,
    },
  },
  {
    id: 'void-sphere',
    name: 'Void Sphere',
    category: 'Minimalist',
    description: 'Single sphere, wireframe=true, chromatic, no grid',
    icon: '⚫',
    config: {
      text: 'VOID',
      color: '#ffffff',
      envPreset: 'night',
      wireframe: true,
      chromatic: true, chromaticOffset: 0.005,
      showGrid: false, bloom: false,
    },
  },
  {
    id: 'studio-promo',
    name: 'Studio Promo',
    category: 'Hero',
    description: 'Clean text + box object, balanced metalness, bloom=false',
    icon: '✨',
    config: {
      text: 'STUDIO',
      color: '#e2e8f0',
      envPreset: 'studio',
      bloom: false,
      metalness: 0.5, roughness: 0.4,
      extraObjects: [
        { id: 'promo-box', type: 'box', position: [3, 0, 0], rotation: [0, 0.75, 0], scale: 0.8, color: '#94a3b8', metalness: 0.7, roughness: 0.3 },
      ],
    },
  },
  {
    id: 'hologram',
    name: 'Hologram',
    category: 'Sci-Fi',
    description: 'Semi-transparent mesh, scan-line shader, chromatic',
    icon: '👻',
    config: {
      text: 'HOLO',
      color: '#67e8f9',
      envPreset: 'night',
      bloom: true, bloomIntensity: 2.0,
      chromatic: true, chromaticOffset: 0.004,
      metalness: 0.3, roughness: 0.1,
    },
  },
  {
    id: 'lava-lamp',
    name: 'Lava Lamp',
    category: 'Abstract',
    description: 'Animated sphere morph via shader, warm palette',
    icon: '🫧',
    config: {
      text: 'LAVA',
      color: '#f97316',
      envPreset: 'sunset',
      bloom: true, bloomIntensity: 1.5,
      rotationSpeed: 0.2,
    },
  },
  {
    id: 'typographic-chaos',
    name: 'Typographic Chaos',
    category: 'Experimental',
    description: 'Multi-line text, different rotations per char via extraObjects',
    icon: '🌀',
    config: {
      text: 'CHAOS',
      color: '#ec4899',
      envPreset: 'city',
      rotationSpeed: 0.8,
      chromatic: true, chromaticOffset: 0.005,
      extraObjects: [
        { id: 'c1', type: 'torus', position: [2.5, 1, 0.5], rotation: [1, 0, 0.5], scale: 0.25, color: '#f472b6', metalness: 0.6, roughness: 0.3 },
        { id: 'c2', type: 'cone', position: [-2.5, -0.5, 0.5], rotation: [0, 1, 0.8], scale: 0.3, color: '#a78bfa', metalness: 0.6, roughness: 0.3 },
        { id: 'c3', type: 'box', position: [0, 2, 1], rotation: [0.5, 0.5, 0], scale: 0.2, color: '#fbbf24', metalness: 0.6, roughness: 0.3 },
      ],
    },
  },
];

export function getTemplateById(id: string): SceneTemplate | undefined {
  return sceneTemplates.find((t) => t.id === id);
}
