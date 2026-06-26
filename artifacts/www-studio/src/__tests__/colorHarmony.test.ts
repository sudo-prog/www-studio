// ── colorHarmony.test.ts — Unit tests for HSL color harmony math ────────────
import { describe, it, expect } from "vitest";
import { generateHarmony, type HarmonicPalette } from "../lib/colorHarmony";

/** Helper: extract raw HSL from hex (replicate internal logic for assertions) */
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
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

describe("generateHarmony", () => {
  const primary = "#6366F1"; // Indigo: H≈239°, S≈76%, L≈67%

  it("generates a palette with 7 colors", () => {
    const palette: HarmonicPalette = generateHarmony(primary);
    expect(typeof palette.complementary).toBe("string");
    expect(typeof palette.analogousWarm).toBe("string");
    expect(typeof palette.analogousCool).toBe("string");
    expect(typeof palette.neutral).toBe("string");
    expect(typeof palette.surface).toBe("string");
    expect(typeof palette.triadic1).toBe("string");
    expect(typeof palette.triadic2).toBe("string");
  });

  it("all palette colors are valid hex codes", () => {
    const palette = generateHarmony(primary);
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const [key, value] of Object.entries(palette)) {
      expect(value).toMatch(hexPattern);
    }
  });

  it("complementary color is ~180° apart in HSL", () => {
    const hslPrimary = hexToHsl(primary);
    const hslComp = hexToHsl(generateHarmony(primary).complementary);
    const diff = Math.abs(hslPrimary.h - hslComp.h);
    const normalizedDiff = Math.min(diff, 360 - diff);
    expect(normalizedDiff).toBeGreaterThanOrEqual(150);
    expect(normalizedDiff).toBeLessThanOrEqual(210);
  });

  it("analogous warm is +30° apart", () => {
    const hslPrimary = hexToHsl(primary);
    const hslWarm = hexToHsl(generateHarmony(primary).analogousWarm);
    const diff = Math.abs(hslPrimary.h - hslWarm.h);
    const normalizedDiff = Math.min(diff, 360 - diff);
    // Allow tolerance for saturation/lightness clamping
    expect(normalizedDiff).toBeLessThanOrEqual(45);
  });

  it("analogous cool is -30° apart", () => {
    const hslPrimary = hexToHsl(primary);
    const hslCool = hexToHsl(generateHarmony(primary).analogousCool);
    const diff = Math.abs(hslPrimary.h - hslCool.h);
    const normalizedDiff = Math.min(diff, 360 - diff);
    expect(normalizedDiff).toBeLessThanOrEqual(45);
  });

  it("neutral color has very low saturation (near-white)", () => {
    const hslNeutral = hexToHsl(generateHarmony(primary).neutral);
    expect(hslNeutral.s).toBeLessThanOrEqual(15);
    expect(hslNeutral.l).toBeGreaterThan(85);
  });

  it("surface color has very low lightness (near-dark)", () => {
    const hslSurface = hexToHsl(generateHarmony(primary).surface);
    expect(hslSurface.s).toBeLessThanOrEqual(20);
    expect(hslSurface.l).toBeLessThan(15);
  });

  it("produces consistent output for the same input", () => {
    const a = generateHarmony(primary);
    const b = generateHarmony(primary);
    expect(a).toEqual(b);
  });

  it("handles a red primary (#EF4444) without error", () => {
    const palette = generateHarmony("#EF4444");
    expect(palette.complementary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(palette.analogousWarm).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("handles edge case white (#FFFFFF)", () => {
    const palette = generateHarmony("#FFFFFF");
    // Should still produce valid hex codes even with zero saturation
    expect(palette.surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(palette.triadic1).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("handles edge case black (#000000)", () => {
    const palette = generateHarmony("#000000");
    expect(palette.complementary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    // Triadic should produce valid colors, not NaN
    expect(palette.triadic1).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("HSL round-trip accuracy", () => {
  it("primary color hue is preserved in triadic offsets", () => {
    const hsl = hexToHsl(primary);
    const palette = generateHarmony(primary);
    const hslTri1 = hexToHsl(palette.triadic1);
    const diff = Math.abs(hsl.h - hslTri1.h);
    const normalizedDiff = Math.min(diff, 360 - diff);
    // Should be approximately 120° apart (allow tolerance for clamped s/l)
    expect(normalizedDiff).toBeGreaterThanOrEqual(90);
    expect(normalizedDiff).toBeLessThanOrEqual(150);
  });
});
