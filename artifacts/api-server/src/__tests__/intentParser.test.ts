// ── intentParser.test.ts — Unit tests for annotation intent parsing ─────────
import { describe, it, expect } from "vitest";
import { parseAnnotationIntent, type ParsedIntent } from "../lib/intentParser";

describe("parseAnnotationIntent", () => {
  // ── Typography ────────────────────────────────────────────────────────────
  it('detects typography from "I love this font"', () => {
    const result: ParsedIntent = parseAnnotationIntent("I love this font");
    expect(result.intent).toBe("typography");
    expect(result.weight).toBeCloseTo(0.9);
    expect(result.sections).toContain("typography");
    expect(result.directive).toContain("typography");
  });

  // ── Color ──────────────────────────────────────────────────────────────────
  it('detects color from "Use this colour"', () => {
    const result = parseAnnotationIntent("Use this colour");
    expect(result.intent).toBe("color");
    expect(result.weight).toBeCloseTo(0.9);
    expect(result.sections).toContain("colors");
    expect(result.directive).toContain("color");
  });

  // ── Mobile layout ──────────────────────────────────────────────────────────
  it('detects mobile-layout from "Use mobile layout from this"', () => {
    const result = parseAnnotationIntent("Use mobile layout from this");
    expect(result.intent).toBe("mobile-layout");
    expect(result.weight).toBeCloseTo(0.8);
    expect(result.sections).toContain("layout");
  });

  // ── Blend ──────────────────────────────────────────────────────────────────
  it('detects blend from "Mix with primary"', () => {
    const result = parseAnnotationIntent("Mix with primary");
    expect(result.intent).toBe("blend");
    expect(result.weight).toBeCloseTo(0.5);
    expect(result.sections).toContain("colors");
    expect(result.sections).toContain("typography");
    expect(result.sections).toContain("layout");
  });

  // ── Base ───────────────────────────────────────────────────────────────────
  it('detects base from "Use as base"', () => {
    const result = parseAnnotationIntent("Use as base");
    expect(result.intent).toBe("base");
    expect(result.weight).toBeCloseTo(1.0);
    expect(result.sections).toContain("colors");
  });

  // ── Animation ──────────────────────────────────────────────────────────────
  it('detects animation from "Love these animations"', () => {
    const result = parseAnnotationIntent("Love these animations");
    expect(result.intent).toBe("animation");
    expect(result.weight).toBeCloseTo(0.8);
    expect(result.sections).toContain("animations");
  });

  // ── Component ──────────────────────────────────────────────────────────────
  it('detects component from "Use these cards/buttons"', () => {
    const result = parseAnnotationIntent("Use these cards/buttons");
    expect(result.intent).toBe("component");
    expect(result.weight).toBeCloseTo(0.8);
    expect(result.sections).toContain("components");
  });

  // ── Default / Inspiration ──────────────────────────────────────────────────
  it('returns inspiration with weight 0.7 for empty annotation', () => {
    const result = parseAnnotationIntent("");
    expect(result.intent).toBe("inspiration");
    expect(result.weight).toBeCloseTo(0.7);
    expect(result.sections).toContain("colors");
    expect(result.sections).toContain("typography");
    expect(result.sections).toContain("layout");
  });

  // ── Descriptive pattern ───────────────────────────────────────────────────
  it('detects color from palette-related keywords', () => {
    const result = parseAnnotationIntent("Match the aesthetic and vibe");
    expect(result.intent).toBe("color");
    expect(result.weight).toBeCloseTo(0.9);
  });

  // ── Mobile nav variant ─────────────────────────────────────────────────────
  it('detects mobile-layout from "nav" keyword', () => {
    const result = parseAnnotationIntent("mobile navigation pattern");
    expect(result.intent).toBe("mobile-layout");
  });

  // ── Font variant ───────────────────────────────────────────────────────────
  it('detects typography from "typeface"', () => {
    const result = parseAnnotationIntent("Beautiful typeface hierarchy");
    expect(result.intent).toBe("typography");
    expect(result.weight).toBeCloseTo(0.9);
  });

  // ── Foundation / primary detection ─────────────────────────────────────────
  it('detects base from "foundation"', () => {
    const result = parseAnnotationIntent("Use as the foundation");
    expect(result.intent).toBe("base");
    expect(result.weight).toBeCloseTo(1.0);
  });

  // ── Combine keyword (blend matches if no earlier pattern triggers) ─────────
  it('detects blend from "combine"', () => {
    const result = parseAnnotationIntent("Combine them");
    expect(result.intent).toBe("blend");
    expect(result.weight).toBeCloseTo(0.5);
  });
});
