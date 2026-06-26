// ── Design Extraction Prompts ─────────────────────────────────────────────
// Prompts for extracting design tokens from screenshots using vision LLMs.

import type { ReferenceIntent, ParsedIntent } from "./intentParser";

/** Structured design tokens extracted from a website */
export interface ExtractedTokens {
  colors: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight?: Record<string, string>;
    letterSpacing?: Record<string, string>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  animation?: {
    duration?: Record<string, string>;
    easing?: Record<string, string>;
  };
  breakpoints?: Record<string, string>;
  components?: Record<string, unknown>;
}

/**
 * System prompt for JSON design token extraction.
 * Instructs the LLM to return a structured JSON object with design tokens.
 */
export function buildExtractionSystemPrompt(): string {
  return `You are a world-class design systems expert. You analyze website screenshots and extract a comprehensive design token system.

Return ONLY a valid JSON object (no markdown fences, no commentary) with this exact structure:

{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "colors": {
    "background": "#...",
    "foreground": "#...",
    "primary": "#...",
    "secondary": "#...",
    "muted": "#...",
    "accent": "#...",
    "border": "#...",
    "surface": "#...",
    "ring": "#...",
    "destructive": "#..."
  },
  "typography": {
    "fontFamily": { "body": "...", "heading": "...", "mono": "..." },
    "fontSize": { "xs": "...", "sm": "...", "base": "...", "lg": "...", "xl": "...", "2xl": "...", "3xl": "...", "4xl": "..." },
    "fontWeight": { "normal": 400, "medium": 500, "semibold": 600, "bold": 700 },
    "lineHeight": { "tight": "1.25", "normal": "1.5", "relaxed": "1.75" },
    "letterSpacing": { "tighter": "-0.05em", "tight": "-0.025em", "normal": "0em", "wide": "0.025em" }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px",
    "4xl": "96px"
  },
  "radius": {
    "none": "0px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "24px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)",
    "xl": "0 20px 25px rgba(0,0,0,0.1)",
    "2xl": "0 25px 50px rgba(0,0,0,0.25)"
  },
  "animation": {
    "duration": { "fast": "150ms", "normal": "300ms", "slow": "500ms" },
    "easing": { "linear": "linear", "ease": "ease", "easeIn": "ease-in", "easeOut": "ease-out", "easeInOut": "ease-in-out" }
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  },
  "components": {
    "button": {
      "primary": { "bg": "primary", "fg": "white", "radius": "md", "fontSize": "sm", "fontWeight": "medium", "px": "16px", "py": "10px" },
      "secondary": { "bg": "transparent", "fg": "primary", "border": "primary", "radius": "md", "fontSize": "sm", "fontWeight": "medium", "px": "16px", "py": "10px" }
    },
    "card": { "bg": "surface", "radius": "lg", "shadow": "md", "border": "border", "padding": "24px" },
    "input": { "bg": "background", "fg": "foreground", "border": "border", "radius": "md", "fontSize": "sm", "px": "12px", "py": "10px", "ring": "ring" }
  }
}

Extract ALL visible design tokens from the screenshot. Pay special attention to:
- Exact color values (use the most prominent colors visible)
- Font families, sizes, and weights used
- Border radius patterns
- Shadow depths
- Spacing and padding patterns
- Animation/motion indicators (if any visible)
- Component patterns (buttons, cards, inputs)

If the screenshot shows multiple viewports (desktop, mobile, tablet), extract tokens that represent the responsive design system as a whole.`;
}

/**
 * Build the user prompt with vision content for extraction.
 */
export function buildExtractionUserPrompt(params: {
  screenshots: { base64: string; mimeType: string; label: string }[];
  intent: ReferenceIntent;
  weight: number;
  sections: string[];
  directive: string;
  url?: string;
}): { role: "user"; content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> } {
  const content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [];

  // Add all screenshots as images
  for (const shot of params.screenshots) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${shot.mimeType};base64,${shot.base64}`,
        detail: "high",
      },
    });
  }

  // Build the text prompt
  const textPrompt = `Analyze the ${params.screenshots.length > 1 ? "screenshots" : "screenshot"} above and extract the complete design token system.

${params.directive}

Focus areas: ${params.sections.join(", ")}
Extraction weight: ${params.weight}
${params.url ? `Source URL: ${params.url}` : ""}

Return ONLY the JSON object — no markdown fences, no commentary, no explanation.`;

  content.push({ type: "text", text: textPrompt });

  return { role: "user", content };
}

/**
 * Build a full 8-section design markdown document from extracted tokens.
 */
export function buildDesignMdFromTokens(
  tokens: Record<string, unknown>,
  primaryUrl?: string,
): string {
  const colors = (tokens.colors as Record<string, string>) ?? {};
  const typography = (tokens.typography as Record<string, unknown>) ?? {};
  const spacing = (tokens.spacing as Record<string, string>) ?? {};
  const radius = (tokens.radius as Record<string, string>) ?? {};
  const shadow = (tokens.shadow as Record<string, string>) ?? {};
  const animation = (tokens.animation as Record<string, unknown>) ?? {};
  const components = (tokens.components as Record<string, unknown>) ?? {};

  const fontFamily = (typography.fontFamily as Record<string, string>) ?? {};
  const fontSize = (typography.fontSize as Record<string, string>) ?? {};
  const fontWeight = (typography.fontWeight as Record<string, number>) ?? {};
  const animDuration = (animation.duration as Record<string, string>) ?? {};
  const animEasing = (animation.easing as Record<string, string>) ?? {};

  return `# Design System — Extracted Reference

> Generated by WWW Studio Design Intelligence · ${primaryUrl ? `Source: ${primaryUrl}` : "Source: Uploaded reference"}

---

## 1. Brand Identity

- **Style**: ${colors.primary ? "Vibrant, modern" : "Clean, professional"}
- **Primary Color**: \`${colors.primary ?? "#6366F1"}\`
- **Background**: \`${colors.background ?? "#FFFFFF"}\`
- **Foreground**: \`${colors.foreground ?? "#0F172A"}\`

---

## 2. Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | \`${colors.background ?? "#FFFFFF"}\` | Page background |
| Foreground | \`${colors.foreground ?? "#0F172A"}\` | Primary text |
| Primary | \`${colors.primary ?? "#6366F1"}\` | CTAs, links, highlights |
| Secondary | \`${colors.secondary ?? "#A5B4FC"}\` | Hover states, gradients |
| Muted | \`${colors.muted ?? "#94A3B8"}\` | Secondary text, placeholders |
| Accent | \`${colors.accent ?? "#0EA5E9"}\` | Badges, special highlights |
| Border | \`${colors.border ?? "#E2E8F0"}\` | Dividers, card outlines |
| Surface | \`${colors.surface ?? "#F8FAFC"}\` | Card backgrounds |
| Ring | \`${colors.ring ?? "#6366F1"}\` | Focus rings |
| Destructive | \`${colors.destructive ?? "#EF4444"}\` | Error states |

---

## 3. Typography

- **Body Font**: ${fontFamily.body ?? "Inter, sans-serif"}
- **Heading Font**: ${fontFamily.heading ?? fontFamily.body ?? "Inter, sans-serif"}
- **Mono Font**: ${fontFamily.mono ?? "JetBrains Mono, monospace"}

### Type Scale

| Style | Size | Weight |
|-------|------|--------|
| xs | ${fontSize.xs ?? "0.75rem"} | ${fontWeight.normal ?? 400} |
| sm | ${fontSize.sm ?? "0.875rem"} | ${fontWeight.normal ?? 400} |
| base | ${fontSize.base ?? "1rem"} | ${fontWeight.normal ?? 400} |
| lg | ${fontSize.lg ?? "1.125rem"} | ${fontWeight.medium ?? 500} |
| xl | ${fontSize.xl ?? "1.25rem"} | ${fontWeight.medium ?? 500} |
| 2xl | ${fontSize["2xl"] ?? "1.5rem"} | ${fontWeight.semibold ?? 600} |
| 3xl | ${fontSize["3xl"] ?? "1.875rem"} | ${fontWeight.bold ?? 700} |
| 4xl | ${fontSize["4xl"] ?? "2.25rem"} | ${fontWeight.bold ?? 700} |

---

## 4. Spacing System

Base unit: **4px**

| Token | Value |
|-------|-------|
| xs | ${spacing.xs ?? "4px"} |
| sm | ${spacing.sm ?? "8px"} |
| md | ${spacing.md ?? "16px"} |
| lg | ${spacing.lg ?? "24px"} |
| xl | ${spacing.xl ?? "32px"} |
| 2xl | ${spacing["2xl"] ?? "48px"} |
| 3xl | ${spacing["3xl"] ?? "64px"} |
| 4xl | ${spacing["4xl"] ?? "96px"} |

---

## 5. Border Radius

| Token | Value |
|-------|-------|
| none | ${radius.none ?? "0px"} |
| sm | ${radius.sm ?? "4px"} |
| md | ${radius.md ?? "8px"} |
| lg | ${radius.lg ?? "12px"} |
| xl | ${radius.xl ?? "16px"} |
| 2xl | ${radius["2xl"] ?? "24px"} |
| full | ${radius.full ?? "9999px"} |

---

## 6. Shadows

| Token | Value |
|-------|-------|
| sm | ${shadow.sm ?? "0 1px 2px rgba(0,0,0,0.05)"} |
| md | ${shadow.md ?? "0 4px 6px rgba(0,0,0,0.1)"} |
| lg | ${shadow.lg ?? "0 10px 15px rgba(0,0,0,0.1)"} |
| xl | ${shadow.xl ?? "0 20px 25px rgba(0,0,0,0.1)"} |
| 2xl | ${shadow["2xl"] ?? "0 25px 50px rgba(0,0,0,0.25)"} |

---

## 7. Animation

### Duration
| Token | Value |
|-------|-------|
| fast | ${animDuration.fast ?? "150ms"} |
| normal | ${animDuration.normal ?? "300ms"} |
| slow | ${animDuration.slow ?? "500ms"} |

### Easing
| Token | Value |
|-------|-------|
| linear | ${animEasing.linear ?? "linear"} |
| ease | ${animEasing.ease ?? "ease"} |
| ease-in | ${animEasing.easeIn ?? "ease-in"} |
| ease-out | ${animEasing.easeOut ?? "ease-out"} |
| ease-in-out | ${animEasing.easeInOut ?? "ease-in-out"} |

---

## 8. Component Patterns

${buildComponentSection(components)}

---

## Design Tokens (JSON)

\`\`\`json
${JSON.stringify(tokens, null, 2)}
\`\`\`
`;
}

function buildComponentSection(components: Record<string, unknown>): string {
  const lines: string[] = [];

  if (components.button) {
    const btn = components.button as Record<string, unknown>;
    const primary = (btn.primary as Record<string, unknown>) ?? {};
    const secondary = (btn.secondary as Record<string, unknown>) ?? {};
    lines.push("### Buttons");
    lines.push("```");
    lines.push(`Primary: bg-[${primary.bg ?? "primary"}] text-[${primary.fg ?? "white"}] rounded-[${primary.radius ?? "8px"}] text-[${primary.fontSize ?? "sm"}] font-[${primary.fontWeight ?? "medium"}] px-[${primary.px ?? "16px"}] py-[${primary.py ?? "10px"}]`);
    lines.push(`Secondary: bg-[${secondary.bg ?? "transparent"}] text-[${secondary.fg ?? "primary"}] border border-[${secondary.border ?? "primary"}] rounded-[${secondary.radius ?? "8px"}]`);
    lines.push("```");
    lines.push("");
  }

  if (components.card) {
    const card = components.card as Record<string, unknown>;
    lines.push("### Cards");
    lines.push("```");
    lines.push(`Base: bg-[${card.bg ?? "surface"}] rounded-[${card.radius ?? "12px"}] shadow-[${card.shadow ?? "md"}] border border-[${card.border ?? "border"}] p-[${card.padding ?? "24px"}]`);
    lines.push("```");
    lines.push("");
  }

  if (components.input) {
    const input = components.input as Record<string, unknown>;
    lines.push("### Inputs");
    lines.push("```");
    lines.push(`bg-[${input.bg ?? "background"}] text-[${input.fg ?? "foreground"}] border border-[${input.border ?? "border"}] rounded-[${input.radius ?? "8px"}] text-[${input.fontSize ?? "sm"}] px-[${input.px ?? "12px"}] py-[${input.py ?? "10px"}] focus:ring-2 focus:ring-[${input.ring ?? "ring"}]`);
    lines.push("```");
  }

  return lines.join("\n");
}

/**
 * Generate a tailwind.config.ts string from extracted tokens.
 */
export function buildTailwindConfigFromTokens(tokens: Record<string, unknown>): string {
  const colors = (tokens.colors as Record<string, string>) ?? {};
  const typography = (tokens.typography as Record<string, unknown>) ?? {};
  const spacing = (tokens.spacing as Record<string, string>) ?? {};
  const radius = (tokens.radius as Record<string, string>) ?? {};
  const shadow = (tokens.shadow as Record<string, string>) ?? {};
  const breakpoints = (tokens.breakpoints as Record<string, string>) ?? {};
  const animation = (tokens.animation as Record<string, unknown>) ?? {};
  const animDuration = (animation.duration as Record<string, string>) ?? {};
  const animEasing = (animation.easing as Record<string, string>) ?? {};

  const fontFamily = (typography.fontFamily as Record<string, string>) ?? {};
  const fontSize = (typography.fontSize as Record<string, string>) ?? {};
  const fontWeight = (typography.fontWeight as Record<string, number>) ?? {};

  return `// tailwind.config.ts — Generated by WWW Studio Design Intelligence
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
${Object.entries(colors).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      fontFamily: {
${Object.entries(fontFamily).map(([k, v]) => `        "${k}": "${v.split(",")[0].trim().replace(/['"]/g, "")}",`).join("\n")}
      },
      fontSize: {
${Object.entries(fontSize).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      fontWeight: {
${Object.entries(fontWeight).map(([k, v]) => `        "${k}": ${v},`).join("\n")}
      },
      spacing: {
${Object.entries(spacing).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      borderRadius: {
${Object.entries(radius).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      boxShadow: {
${Object.entries(shadow).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      screens: {
${Object.entries(breakpoints).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      transitionDuration: {
${Object.entries(animDuration).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
      transitionTimingFunction: {
${Object.entries(animEasing).map(([k, v]) => `        "${k}": "${v}",`).join("\n")}
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

/**
 * Generate tokens.css with CSS custom properties in :root.
 */
export function buildTokensCssFromTokens(tokens: Record<string, unknown>): string {
  const colors = (tokens.colors as Record<string, string>) ?? {};
  const typography = (tokens.typography as Record<string, unknown>) ?? {};
  const spacing = (tokens.spacing as Record<string, string>) ?? {};
  const radius = (tokens.radius as Record<string, string>) ?? {};
  const shadow = (tokens.shadow as Record<string, string>) ?? {};
  const animation = (tokens.animation as Record<string, unknown>) ?? {};
  const animDuration = (animation.duration as Record<string, string>) ?? {};
  const animEasing = (animation.easing as Record<string, string>) ?? {};

  const fontFamily = (typography.fontFamily as Record<string, string>) ?? {};
  const fontSize = (typography.fontSize as Record<string, string>) ?? {};
  const fontWeight = (typography.fontWeight as Record<string, number>) ?? {};

  const lines: string[] = [
    "/* tokens.css — Generated by WWW Studio Design Intelligence */",
    "",
    ":root {",
  ];

  // Colors
  for (const [k, v] of Object.entries(colors)) {
    lines.push(`  --color-${k}: ${v};`);
  }
  lines.push("");

  // Font families
  for (const [k, v] of Object.entries(fontFamily)) {
    lines.push(`  --font-${k}: ${v};`);
  }
  lines.push("");

  // Font sizes
  for (const [k, v] of Object.entries(fontSize)) {
    lines.push(`  --font-size-${k}: ${v};`);
  }
  lines.push("");

  // Font weights
  for (const [k, v] of Object.entries(fontWeight)) {
    lines.push(`  --font-weight-${k}: ${v};`);
  }
  lines.push("");

  // Spacing
  for (const [k, v] of Object.entries(spacing)) {
    lines.push(`  --spacing-${k}: ${v};`);
  }
  lines.push("");

  // Radius
  for (const [k, v] of Object.entries(radius)) {
    lines.push(`  --radius-${k}: ${v};`);
  }
  lines.push("");

  // Shadows
  for (const [k, v] of Object.entries(shadow)) {
    lines.push(`  --shadow-${k}: ${v};`);
  }
  lines.push("");

  // Animation durations
  for (const [k, v] of Object.entries(animDuration)) {
    lines.push(`  --duration-${k}: ${v};`);
  }
  lines.push("");

  // Animation easings
  for (const [k, v] of Object.entries(animEasing)) {
    lines.push(`  --easing-${k}: ${v};`);
  }

  lines.push("}");
  lines.push("");

  // Dark mode variant
  lines.push(".dark {");
  lines.push("  /* Override colors for dark mode */");
  if (colors.background) lines.push(`  --color-background: ${colors.background};`);
  if (colors.foreground) lines.push(`  --color-foreground: ${colors.foreground};`);
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate DTCG-format design tokens JSON.
 */
export function buildDesignTokensJsonFromTokens(tokens: Record<string, unknown>): string {
  const dtcg = {
    $schema: "https://design-tokens.github.io/community-group/format/",
    ...tokens,
  };
  return JSON.stringify(dtcg, null, 2);
}
