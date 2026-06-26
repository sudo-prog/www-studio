// ── designPrompts.test.ts — Unit tests for design output generation ──────────
import { describe, it, expect } from "vitest";
import {
  buildDesignMdFromTokens,
  buildTailwindConfigFromTokens,
  buildTokensCssFromTokens,
  buildDesignTokensJsonFromTokens,
} from "../lib/designPrompts";

/** Shared sample tokens for all output tests */
const sampleTokens = {
  colors: {
    background: "#FFFFFF",
    foreground: "#0F172A",
    primary: "#6366F1",
    secondary: "#A5B4FC",
    muted: "#94A3B8",
    accent: "#0EA5E9",
    border: "#E2E8F0",
    surface: "#F8FAFC",
    ring: "#6366F1",
    destructive: "#EF4444",
  },
  typography: {
    fontFamily: {
      body: "Inter, sans-serif",
      heading: "Inter, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
    "4xl": "96px",
  },
  radius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.1)",
    "2xl": "0 25px 50px rgba(0,0,0,0.25)",
  },
  animation: {
    duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
    easing: { linear: "linear", ease: "ease" },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
  },
  components: {
    button: {
      primary: { bg: "primary", fg: "white", radius: "md" },
      secondary: { bg: "transparent", fg: "primary", border: "primary" },
    },
    card: { bg: "surface", radius: "lg", shadow: "md", border: "border", padding: "24px" },
  },
};

describe("buildDesignMdFromTokens", () => {
  it("produces an 8-section markdown document", () => {
    const md = buildDesignMdFromTokens(sampleTokens);

    // Section headers
    expect(md).toContain("## 1. Brand Identity");
    expect(md).toContain("## 2. Color Palette");
    expect(md).toContain("## 3. Typography");
    expect(md).toContain("## 4. Spacing System");
    expect(md).toContain("## 5. Border Radius");
    expect(md).toContain("## 6. Shadows");
    expect(md).toContain("## 7. Animation");
    expect(md).toContain("## 8. Component Patterns");
  });

  it("includes primary URL if provided", () => {
    const md = buildDesignMdFromTokens(sampleTokens, "https://example.com");
    expect(md).toContain("https://example.com");
  });

  it("includes extracted color values", () => {
    const md = buildDesignMdFromTokens(sampleTokens);
    expect(md).toContain("#6366F1"); // primary
    expect(md).toContain("#FFFFFF"); // background
    expect(md).toContain("#0F172A"); // foreground
  });

  it("produces valid markdown for JSON tokens block", () => {
    const md = buildDesignMdFromTokens(sampleTokens);
    expect(md).toContain("```json");
    // Should have closing fence
    const lastBacktick = md.lastIndexOf("```");
    expect(lastBacktick).toBeGreaterThan(0);
  });
});

describe("buildTailwindConfigFromTokens", () => {
  it("returns a valid TypeScript string", () => {
    const config = buildTailwindConfigFromTokens(sampleTokens);
    expect(config).toContain("tailwind.config.ts");
    expect(config).toContain("import type { Config }");
    expect(config).toContain("export default config");
  });

  it("includes color values", () => {
    const config = buildTailwindConfigFromTokens(sampleTokens);
    expect(config).toContain('"primary": "#6366F1"');
    expect(config).toContain('"background": "#FFFFFF"');
  });

  it("includes font family mappings", () => {
    const config = buildTailwindConfigFromTokens(sampleTokens);
    expect(config).toContain('"body": "Inter"');
    expect(config).toContain("fontFamily");
  });

  it("includes breakpoint/screen sizes", () => {
    const config = buildTailwindConfigFromTokens(sampleTokens);
    expect(config).toContain('"sm": "640px"');
    expect(config).toContain("screens");
  });
});

describe("buildTokensCssFromTokens", () => {
  it("produces valid CSS custom properties", () => {
    const css = buildTokensCssFromTokens(sampleTokens);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary: #6366F1;");
    expect(css).toContain("--color-background: #FFFFFF;");
    expect(css).toContain("--color-foreground: #0F172A;");
  });

  it("includes font size variables", () => {
    const css = buildTokensCssFromTokens(sampleTokens);
    expect(css).toContain("--font-size-base: 1rem;");
    expect(css).toContain("--font-weight-bold: 700;");
  });

  it("includes spacing, radius, and shadow vars", () => {
    const css = buildTokensCssFromTokens(sampleTokens);
    expect(css).toContain("--spacing-md: 16px;");
    expect(css).toContain("--radius-md: 8px;");
    expect(css).toContain("--shadow-md:");
  });

  it("includes dark mode block", () => {
    const css = buildTokensCssFromTokens(sampleTokens);
    expect(css).toContain(".dark {");
  });

  it("ends with closing brace and newline", () => {
    const css = buildTokensCssFromTokens(sampleTokens);
    // Normalize line endings for comparison
    expect(css.trim()).toMatch(/\n\}$/);
  });
});

describe("buildDesignTokensJsonFromTokens", () => {
  it("returns valid DTCG-format JSON", () => {
    const json = buildDesignTokensJsonFromTokens(sampleTokens);
    const parsed = JSON.parse(json);
    expect(parsed.$schema).toBe(
      "https://design-tokens.github.io/community-group/format/"
    );
  });

  it("preserves all original color keys", () => {
    const json = buildDesignTokensJsonFromTokens(sampleTokens);
    const parsed = JSON.parse(json);
    expect(parsed.colors.primary).toBe("#6366F1");
    expect(parsed.colors.background).toBe("#FFFFFF");
  });

  it("includes typography data", () => {
    const json = buildDesignTokensJsonFromTokens(sampleTokens);
    const parsed = JSON.parse(json);
    expect(parsed.typography.fontSize.base).toBe("1rem");
    expect(parsed.typography.fontWeight.bold).toBe(700);
  });

  it("produces pretty-printed (indented) JSON", () => {
    const json = buildDesignTokensJsonFromTokens(sampleTokens);
    expect(json).toContain("\n  ");
  });
});
