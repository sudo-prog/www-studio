// ── tokenLinter.test.ts — Unit tests for design token linting ───────────────
import { describe, it, expect } from "vitest";
import { lintDesignTokens, type LintWarning } from "../lib/tokenLinter";

describe("lintDesignTokens — WCAG contrast", () => {
  it("detects WCAG AA contrast failure for low-contrast text", () => {
    const warnings = lintDesignTokens({
      colors: {
        background: "#FFFFFF",
        foreground: "#CCCCCC", // Very low contrast on white
      },
    });
    const contrastWarnings = warnings.filter((w) => w.category === "contrast");
    expect(contrastWarnings.length).toBeGreaterThan(0);
    expect(contrastWarnings[0].message).toContain("WCAG AA");
    expect(contrastWarnings[0].message).toContain("4.5");
  });

  it("flags severe contrast failure as error", () => {
    const warnings = lintDesignTokens({
      colors: {
        background: "#888888",
        foreground: "#999999", // Near-identical on grey bg
      },
    });
    const severeWarnings = warnings.filter(
      (w) => w.category === "contrast" && w.severity === "error"
    );
    expect(severeWarnings.length).toBeGreaterThan(0);
  });

  it("does not flag good contrast", () => {
    const warnings = lintDesignTokens({
      colors: {
        background: "#FFFFFF",
        foreground: "#0F172A", // Very high contrast
      },
    });
    const contrastWarnings = warnings.filter((w) => w.category === "contrast");
    expect(contrastWarnings.length).toBe(0);
  });

  it("checks both background and surface against text colors", () => {
    const warnings = lintDesignTokens({
      colors: {
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#AAAAAA",
        textMuted: "#BBBBBB",
      },
    });
    const contrastWarnings = warnings.filter((w) => w.category === "contrast");
    // Should flag both (bg, surface) × (text, textMuted) = potentially 4
    expect(contrastWarnings.length).toBeGreaterThan(0);
  });
});

describe("lintDesignTokens — font count", () => {
  it("flags more than 2 distinct font families", () => {
    const warnings = lintDesignTokens({
      colors: { primary: "#6366F1", background: "#FFFFFF", foreground: "#0F172A" },
      typography: {
        fontFamily: {
          body: "Inter, sans-serif",
          heading: "Playfair Display, serif",
          mono: "JetBrains Mono, monospace",
        },
      },
    });
    const countWarnings = warnings.filter((w) => w.category === "count");
    expect(countWarnings.length).toBe(1);
    expect(countWarnings[0].message).toContain("3 font families");
    expect(countWarnings[0].severity).toBe("warning");
  });

  it("does not flag ≤2 font families", () => {
    const warnings = lintDesignTokens({
      colors: { primary: "#6366F1" },
      typography: {
        fontFamily: {
          body: "Inter, sans-serif",
          heading: "Inter, sans-serif",
        },
      },
    });
    const countWarnings = warnings.filter((w) => w.category === "count");
    expect(countWarnings.length).toBe(0);
  });

  it("deduplicates font names case-insensitively", () => {
    const warnings = lintDesignTokens({
      colors: { primary: "#6366F1" },
      typography: {
        fontFamily: {
          body: "Inter, sans-serif",
          heading: "inter, sans-serif", // same as body, different case
          mono: "JetBrains Mono, monospace",
        },
      },
    });
    const countWarnings = warnings.filter((w) => w.category === "count");
    // Only 2 unique fonts (Inter, JetBrains Mono), so should NOT warn
    expect(countWarnings.length).toBe(0);
  });
});

describe("lintDesignTokens — near-duplicate colors", () => {
  it("detects near-duplicate colors in HSL space", () => {
    const warnings = lintDesignTokens({
      colors: {
        primary: "#6366F1",
        secondary: "#6467F2", // Nearly identical to primary
        background: "#FFFFFF",
        foreground: "#0F172A",
      },
    });
    const dupWarnings = warnings.filter((w) => w.category === "duplication");
    expect(dupWarnings.length).toBeGreaterThan(0);
    expect(dupWarnings[0].message).toContain("similar");
    expect(dupWarnings[0].severity).toBe("info");
  });

  it("does not flag clearly different colors", () => {
    const warnings = lintDesignTokens({
      colors: {
        primary: "#6366F1",
        secondary: "#EF4444",
        background: "#FFFFFF",
        foreground: "#0F172A",
      },
    });
    const dupWarnings = warnings.filter((w) => w.category === "duplication");
    expect(dupWarnings.length).toBe(0);
  });
});

describe("lintDesignTokens — missing semantic colors", () => {
  it("flags missing required semantic colors", () => {
    const warnings = lintDesignTokens({
      colors: {
        accent: "#0EA5E9",
        // Missing primary, background, foreground
      },
    });
    const missingWarnings = warnings.filter((w) => w.category === "missing");
    expect(missingWarnings.length).toBeGreaterThanOrEqual(3);
    const messages = missingWarnings.map((w) => w.message);
    expect(messages.some((m) => m.includes("primary"))).toBe(true);
    expect(messages.some((m) => m.includes("background"))).toBe(true);
    expect(messages.some((m) => m.includes("foreground"))).toBe(true);
  });

  it("reports recommended but missing colors as info", () => {
    const warnings = lintDesignTokens({
      colors: {
        primary: "#6366F1",
        background: "#FFFFFF",
        foreground: "#0F172A",
        // Missing muted, border, surface
      },
    });
    const infoMissing = warnings.filter(
      (w) => w.category === "missing" && w.severity === "info"
    );
    expect(infoMissing.length).toBe(3);
    const messages = infoMissing.map((w) => w.message);
    expect(messages.some((m) => m.includes("muted"))).toBe(true);
    expect(messages.some((m) => m.includes("border"))).toBe(true);
    expect(messages.some((m) => m.includes("surface"))).toBe(true);
  });

  it("returns no warnings for a complete design system", () => {
    const warnings = lintDesignTokens({
      colors: {
        primary: "#6366F1",
        secondary: "#EF4444",
        background: "#FFFFFF",
        foreground: "#0F172A",
        muted: "#94A3B8",
        accent: "#0EA5E9",
        border: "#E2E8F0",
        surface: "#F8FAFC",
      },
      typography: {
        fontFamily: {
          body: "Inter, sans-serif",
          heading: "Inter, sans-serif",
        },
      },
    });
    // Should have zero contrast, count, duplication, and missing warnings
    const errors = warnings.filter((w) => w.severity === "error" || w.severity === "warning");
    expect(errors.length).toBe(0);
  });
});
