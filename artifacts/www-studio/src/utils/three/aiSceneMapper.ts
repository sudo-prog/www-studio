import { type ThreeDSceneConfig } from '@/types/three';

const SYSTEM_PROMPT = `You are an expert 3D scene designer for React Three Fiber / Three.js inside a tool called WWW Studio.
Convert the user's description into a JSON config conforming exactly to the ThreeDSceneConfig TypeScript interface.

Rules:
- Return ONLY valid JSON. No markdown. No preamble.
- If the description is vague, make bold, visually striking choices.
- Favour bloom + chromatic for futuristic looks, DOF for cinematic, vignette for moody.
- Set performanceMode to 'balanced' unless user asks for maximum quality.
- Set modelUrl to null — do not invent URLs.
- shader.enabled=true only if the description strongly implies custom visual effects.
- Make the text property match the brand/vibe described.
- envPreset choices: city (urban), sunset (warm dramatic), dawn (cool morning), night (dark), warehouse (industrial), forest (organic), apartment (warm interior), studio (neutral).

ThreeDSceneConfig interface (abbreviated, return all keys):
{ showText, text, fontSize, fontUrl, letterSpacing, textDepth, bevelEnabled, bevelThickness,
  color, metalness, roughness, emissive, emissiveIntensity, wireframe,
  envPreset, envIntensity, bgColor, showGrid,
  autoRotate, rotationSpeed, rotationAxis, scrollParallaxStrength,
  cameraPosition, cameraFov,
  bloom, bloomIntensity, bloomThreshold, dof, dofFocalLength, dofBokehScale,
  chromatic, chromaticOffset, vignette, vignetteIntensity, noise, noiseOpacity,
  modelUrl, modelScale, modelPosition,
  coverMediaUrl, coverMediaType, coverEffects,
  extraObjects, keyframes, timeline, shader,
  performanceMode, shadowsEnabled }

Return ONLY the JSON object — no fences, no commentary.`;

export async function promptToSceneConfig(
  prompt: string
): Promise<Partial<ThreeDSceneConfig>> {
  try {
    const response = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as Partial<ThreeDSceneConfig>;
  } catch (e) {
    console.error('AI scene parse error:', e);
    return {
      text: prompt.toUpperCase().slice(0, 12),
      bloom: true,
      chromatic: true,
      envPreset: 'city',
    };
  }
}
