// ── Design Tokens ────────────────────────────────────────────────────────────
export interface DesignTokens {
  colors: Record<string, string>;
  typography: {
    fontFamily: string[];
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  shadows: Record<string, string>;
  radii: Record<string, number>;
  spacing: Record<string, number>;
}

export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    "primary": "#7FB5A0",
    "secondary": "#B39DC2",
    "accent": "#E8957A",
    "surface": "#1a1a2e",
    "background": "#0d1117",
    "text": "#ffffff",
    "text-muted": "#888888",
    "border": "#2d2d44",
    "success": "#43e97b",
    "warning": "#fa709a",
    "error": "#ef4444",
    "info": "#4facfe",
    "lavender": "#B39DC2",
    "sage": "#7FB5A0",
    "coral": "#E8957A",
    "sky": "#87BBDB",
    "peach": "#F4C5A1",
    "forest": "#4A7C6B",
    "mist": "#C8D8E0",
    "sand": "#E8DDD0",
  },
  typography: {
    fontFamily: [
      "system-ui, -apple-system, sans-serif",
      "Inter, system-ui, sans-serif",
      "Georgia, serif",
      "JetBrains Mono, monospace",
      "Comic Sans MS, cursive",
    ],
    fontSize: {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.5rem",
      "5xl": "3rem",
      "6xl": "4rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  shadows: {
    "sm": "0 1px 2px 0 rgba(0,0,0,0.3)",
    "md": "0 4px 6px -1px rgba(0,0,0,0.4)",
    "lg": "0 10px 15px -3px rgba(0,0,0,0.5)",
    "xl": "0 20px 25px -5px rgba(0,0,0,0.5)",
    "glow": "0 0 20px rgba(127,181,160,0.3)",
    "glow-lg": "0 0 40px rgba(127,181,160,0.4)",
  },
  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },
  spacing: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96, 32: 128,
  },
};

export function tokensToCSS(tokens: DesignTokens): string {
  const lines: string[] = [":root {"];

  // Colors
  for (const [name, value] of Object.entries(tokens.colors)) {
    const varName = name.replace(/([A-Z])/g, "-$1").toLowerCase();
    lines.push(`  --color-${varName}: ${value};`);
  }

  // Font sizes
  for (const [name, value] of Object.entries(tokens.typography.fontSize)) {
    lines.push(`  --font-size-${name}: ${value};`);
  }

  // Shadows
  for (const [name, value] of Object.entries(tokens.shadows)) {
    lines.push(`  --shadow-${name}: ${value};`);
  }

  // Radii
  for (const [name, value] of Object.entries(tokens.radii)) {
    lines.push(`  --radius-${name}: ${value}px;`);
  }

  // Spacing
  for (const [name, value] of Object.entries(tokens.spacing)) {
    lines.push(`  --spacing-${name}: ${value}px;`);
  }

  lines.push("}");
  return lines.join("\n");
}

export function tokensToJSON(tokens: DesignTokens): string {
  return JSON.stringify(tokens, null, 2);
}
