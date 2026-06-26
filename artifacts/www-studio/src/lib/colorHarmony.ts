// ─── colorHarmony.ts ──────────────────────────────────────────────────────
// Pure HSL math — generates harmonious color palettes from a primary color.

export interface HarmonicPalette {
  complementary: string;
  analogousWarm: string;
  analogousCool: string;
  neutral: string;
  surface: string;
  triadic1: string;
  triadic2: string;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate a full harmonic palette from a primary color.
 * Uses pure HSL math — no LLM needed.
 */
export function generateHarmony(primary: string): HarmonicPalette {
  const { h, s, l } = hexToHsl(primary);

  // Keep saturation lively but not neon
  const baseS = Math.min(85, Math.max(40, s));
  const baseL = Math.min(60, Math.max(45, l));

  return {
    complementary: hslToHex(h + 180, baseS, baseL),
    analogousWarm: hslToHex(h + 30, baseS, baseL),
    analogousCool: hslToHex(h - 30, baseS, baseL),
    neutral: hslToHex(h, 8, 95),    // near-white with slight hue
    surface: hslToHex(h, 12, 8),    // near-black with slight hue
    triadic1: hslToHex(h + 120, baseS, baseL),
    triadic2: hslToHex(h + 240, baseS, baseL),
  };
}
