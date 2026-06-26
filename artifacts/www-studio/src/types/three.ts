/**
 * Phase 0 — 3D Studio Type Foundation
 *
 * Core types for the 3D Studio module (React Three Fiber scene builder).
 */

import type * as THREE from "three";

// ── Environment ────────────────────────────────────────────────────────────────

export type EnvPreset =
  | "city"
  | "sunset"
  | "dawn"
  | "night"
  | "warehouse"
  | "forest"
  | "apartment"
  | "studio";

// ── Extra Objects ─────────────────────────────────────────────────────────────

export interface ExtraObject {
  id: string;
  type: "typeTool" | "coverTool" | "shapeTool" | "objectTool" | "light";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  metalness: number;
  roughness: number;
  modelUrl?: string;
  name?: string;
  visible?: boolean;
  locked?: boolean;
}

// ── Keyframes / Animation ────────────────────────────────────────────────────

export interface Keyframe {
  time: number;
  properties: Record<string, number | boolean | string>;
  easing?: string;
  label?: string;
}

export interface AnimationClip {
  id: string;
  targetId: string;
  type: "tween" | "timeline" | "morph";
  duration: number;
  delay: number;
  loop: boolean;
  keyframes: Keyframe[];
}

// ── Shaders ───────────────────────────────────────────────────────────────────

export interface ShaderConfig {
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: Record<string, THREE.IUniform>;
  wireframe?: boolean;
  transparent?: boolean;
  side?: THREE.Side;
  depthTest?: boolean;
  depthWrite?: boolean;
  blending?: THREE.Blending;
}

// ── Post-Processing ───────────────────────────────────────────────────────────

export interface PostProcessingConfig {
  bloom: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomSmoothing: number;
  chromaticAberration: boolean;
  chromaticAberrationOffset: [number, number];
  vignette: boolean;
  vignetteIntensity: number;
  noise: boolean;
  noiseIntensity: number;
  toneMapping: "ACESFilmic" | "Reinhard" | "Cineon" | "Linear" | "None";
  toneMappingExposure: number;
  colorGrading: {
    hue: number;
    saturation: number;
    brightness: number;
    contrast: number;
  };
}

// ── Lighting ──────────────────────────────────────────────────────────────────

export interface LightConfig {
  id: string;
  type: "ambient" | "directional" | "point" | "spot" | "area";
  color: string;
  intensity: number;
  position: [number, number, number];
  target?: [number, number, number];
  castShadow?: boolean;
  shadowMapSize?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
  distance?: number;
}

// ── Camera ────────────────────────────────────────────────────────────────────

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
  target: [number, number, number];
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  dampingFactor: number;
  minDistance: number;
  maxDistance: number;
  maxPolarAngle: number;
}

// ── Scene Settings ────────────────────────────────────────────────────────────

export interface SceneSettings {
  backgroundColor: string;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  gridEnabled: boolean;
  gridColor: string;
  gridOpacity: number;
  shadowsEnabled: boolean;
  shadowType: "basic" | "pcf" | "pcfsoft" | "vsm";
  antialias: boolean;
  pixelRatio: number;
  performanceMode: "high" | "balanced" | "low";
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export interface TimelineConfig {
  duration: number;
  loop: boolean;
  autoPlay: boolean;
  speed: number;
  clips: AnimationClip[];
}

// ── Export ────────────────────────────────────────────────────────────────────

export interface ExportConfig {
  format: "png" | "glb" | "webm" | "embed";
  quality: "low" | "medium" | "high" | "ultra";
  width: number;
  height: number;
  fps?: number;
  duration?: number;
  transparent: boolean;
  includeAudio: boolean;
}

// ── Full Scene Config ─────────────────────────────────────────────────────────

export interface ThreeDSceneConfig {
  id: string;
  name: string;
  description?: string;

  // Quick text overlay (used by stub component)
  showText?: boolean;
  text?: string;

  // Environment
  envPreset: EnvPreset;
  envMapIntensity: number;
  envRotation: [number, number, number];

  // Camera
  camera: CameraConfig;

  // Lighting
  lights: LightConfig[];
  ambientIntensity: number;
  ambientColor: string;

  // Scene settings
  settings: SceneSettings;

  // Objects
  extraObjects: ExtraObject[];

  // Animation
  timeline: TimelineConfig;

  // Post-processing
  postProcessing: PostProcessingConfig;

  // Shader (global override)
  globalShader?: ShaderConfig;

  // Export
  exportConfig: ExportConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
  thumbnailUrl?: string;
  tags?: string[];
}

// ── Default Config ────────────────────────────────────────────────────────────

export const DEFAULT_CAMERA: CameraConfig = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: [0, 2, 8],
  target: [0, 0, 0],
  autoRotate: false,
  autoRotateSpeed: 0.5,
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 2,
  maxDistance: 50,
  maxPolarAngle: Math.PI / 1.5,
};

export const DEFAULT_LIGHTS: LightConfig[] = [
  {
    id: "ambient-default",
    type: "ambient",
    color: "#ffffff",
    intensity: 0.4,
    position: [0, 0, 0],
  },
  {
    id: "directional-default",
    type: "directional",
    color: "#ffffff",
    intensity: 1.0,
    position: [5, 10, 5],
    castShadow: true,
    shadowMapSize: 2048,
  },
];

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  backgroundColor: "#0a0a0f",
  fogEnabled: false,
  fogColor: "#0a0a0f",
  fogNear: 10,
  fogFar: 50,
  gridEnabled: true,
  gridColor: "#333340",
  gridOpacity: 0.5,
  shadowsEnabled: true,
  shadowType: "pcfsoft",
  antialias: true,
  pixelRatio: 2,
  performanceMode: "high",
};

export const DEFAULT_POST_PROCESSING: PostProcessingConfig = {
  bloom: false,
  bloomIntensity: 1.5,
  bloomThreshold: 0.8,
  bloomSmoothing: 0.9,
  chromaticAberration: false,
  chromaticAberrationOffset: [0.0005, 0.0005],
  vignette: false,
  vignetteIntensity: 0.4,
  noise: false,
  noiseIntensity: 0.1,
  toneMapping: "ACESFilmic",
  toneMappingExposure: 1.0,
  colorGrading: {
    hue: 0,
    saturation: 1,
    brightness: 1,
    contrast: 1,
  },
};

export const DEFAULT_TIMELINE: TimelineConfig = {
  duration: 5,
  loop: false,
  autoPlay: false,
  speed: 1,
  clips: [],
};

export const DEFAULT_EXPORT: ExportConfig = {
  format: "png",
  quality: "high",
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 5,
  transparent: false,
  includeAudio: false,
};

export const DEFAULT_SCENE_CONFIG: ThreeDSceneConfig = {
  id: "",
  name: "Untitled 3D Scene",
  description: "",

  envPreset: "studio",
  envMapIntensity: 1.0,
  envRotation: [0, 0, 0],

  camera: DEFAULT_CAMERA,

  lights: DEFAULT_LIGHTS,
  ambientIntensity: 0.4,
  ambientColor: "#ffffff",

  settings: DEFAULT_SCENE_SETTINGS,

  extraObjects: [],

  timeline: DEFAULT_TIMELINE,

  postProcessing: DEFAULT_POST_PROCESSING,

  exportConfig: DEFAULT_EXPORT,

  createdAt: "",
  updatedAt: "",
  status: "draft",
  tags: [],
};
