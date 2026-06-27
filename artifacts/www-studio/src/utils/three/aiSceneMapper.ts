/**
 * AI Scene Mapper — converts natural language prompts into ThreeDSceneConfig.
 *
 * CRITICAL: The frontend NEVER imports from api-server. All AI calls go through
 * HTTP fetch to the api-server URL configured via VITE_API_SERVER_URL.
 */

import type { ThreeDSceneConfig } from '@/types/three';

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert 3D scene designer for React Three Fiber / Three.js inside a tool called WWW Studio.
Convert the user's description into a JSON config conforming exactly to the ThreeDSceneConfig TypeScript interface.

Rules:
- Return ONLY valid JSON. No markdown. No preamble.
- If the description is vague, make bold, visually striking choices.
- Favour bloom + chromatic for futuristic looks, vignette for moody scenes.
- Set performanceMode to 'balanced' unless user asks for maximum quality.
- envPreset choices: city (urban), sunset (warm dramatic), dawn (cool morning), night (dark), warehouse (industrial), forest (organic), apartment (warm interior), studio (neutral).

ThreeDSceneConfig interface (return all keys):
{
  id: string,
  name: string,
  description: string,
  showText: boolean,
  text: string,
  envPreset: "city" | "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio",
  envMapIntensity: number,
  envRotation: [number, number, number],
  camera: { fov, near, far, position, target, autoRotate, autoRotateSpeed, enableDamping, dampingFactor, minDistance, maxDistance, maxPolarAngle },
  lights: [{ id, type, color, intensity, position, target?, castShadow?, shadowMapSize?, angle?, penumbra?, decay?, distance? }],
  ambientIntensity: number,
  ambientColor: string,
  settings: { backgroundColor, fogEnabled, fogColor, fogNear, fogFar, gridEnabled, gridColor, gridOpacity, shadowsEnabled, shadowType, antialias, pixelRatio, performanceMode },
  extraObjects: [{ id, type, position, rotation, scale, color, metalness, roughness, modelUrl?, name?, visible?, locked? }],
  timeline: { duration, loop, autoPlay, speed, clips },
  postProcessing: { bloom, bloomIntensity, bloomThreshold, bloomSmoothing, chromaticAberration, chromaticAberrationOffset, vignette, vignetteIntensity, noise, noiseIntensity, toneMapping, toneMappingExposure, colorGrading },
  exportConfig: { format, quality, width, height, fps, duration, transparent, includeAudio },
  createdAt: string,
  updatedAt: string,
  status: "draft" | "published",
  tags: string[]
}

Return ONLY the JSON object — no fences, no commentary.`;

// ── Types for API response ────────────────────────────────────────────────────

interface ChatApiResponse {
  reply: string;
  messageId: string;
  codeChanges: string | null;
  suggestions: string[];
}

// ── Main Function ─────────────────────────────────────────────────────────────

export interface SceneMapperOptions {
  /** Optional page context to help the AI make better design decisions */
  pageContext?: {
    brandColors?: string[];
    projectDescription?: string;
  };
  /** Optional project ID for knowledge-base context */
  projectId?: string;
}

export async function promptToSceneConfig(
  prompt: string,
  options?: SceneMapperOptions
): Promise<Partial<ThreeDSceneConfig>> {
  const API_BASE = import.meta.env.VITE_API_SERVER_URL || '';

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        projectId: options?.projectId || null,
        context: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          pageContext: options?.pageContext,
          task: 'scene_config_generation',
        }),
      }),
    });

    if (!res.ok) {
      throw new Error(`AI request failed: ${res.status}`);
    }

    const data: ChatApiResponse = await res.json();
    const raw = data.reply ?? '';

    // Try to extract JSON from the reply (handle markdown fences if present)
    const cleaned = raw.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleaned) as Partial<ThreeDSceneConfig>;
    } catch {
      // If the AI returned non-JSON text, return a sensible fallback
      console.warn('[aiSceneMapper] Could not parse AI response as JSON, using fallback');
      return createFallbackConfig(prompt);
    }
  } catch (err) {
    console.error('[aiSceneMapper] Error calling API:', err);
    return createFallbackConfig(prompt);
  }
}

// ── Fallback ──────────────────────────────────────────────────────────────────

function createFallbackConfig(prompt: string): Partial<ThreeDSceneConfig> {
  const upper = prompt.toUpperCase().slice(0, 12);
  return {
    name: upper || 'AI Scene',
    text: upper || 'AI SCENE',
    showText: true,
    envPreset: 'city',
    postProcessing: {
      bloom: true,
      bloomIntensity: 1.5,
      bloomThreshold: 0.8,
      bloomSmoothing: 0.9,
      chromaticAberration: false,
      chromaticAberrationOffset: [0.0005, 0.0005],
      vignette: false,
      vignetteIntensity: 0.4,
      noise: false,
      noiseIntensity: 0.1,
      toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.0,
      colorGrading: {
        hue: 0,
        saturation: 1,
        brightness: 1,
        contrast: 1,
      },
    },
  };
}
