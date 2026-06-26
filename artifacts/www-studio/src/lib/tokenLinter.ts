// ─── tokenLinter.ts ────────────────────────────────────────────────────────
// Design token linter — checks for WCAG contrast, font count, duplicates, missing semantics.

export interface LintWarning {
  severity: "error" | "warning" | "info";
  category: "contrast" | "count" | "duplication" | "missing";
  message: string;
}

interface TokenColors {
  background?: string;
  foreground?: string;
  text?: string;
  textMuted?: string;
  primary?: string;
  secondary?: string;
  muted?: string;
  accent?: string;
  border?: string;
  surface?: string;
  [key: string]: string | undefined;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

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

function areColorsNearDuplicate(hex1: string, hex2: string, threshold = 5): boolean {
  const hsl1 = hexToHsl(hex1);
  const hsl2 = hexToHsl(hex2);
  if (!hsl1 || !hsl2) return false;

  const hDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));
  const sDiff = Math.abs(hsl1.s - hsl2.s);
  const lDiff = Math.abs(hsl1.l - hsl2.l);

  return hDiff < threshold && sDiff < threshold && lDiff < threshold;
}

/**
 * Lint design tokens for common issues.
 */
export function lintDesignTokens(tokens: {
  colors?: TokenColors;
  typography?: {
    fontFamily?: Record<string, string>;
    [key: string]: unknown;
  };
}): LintWarning[] {
  const warnings: LintWarning[] = [];
  const colors = tokens.colors ?? {};

  // 1. WCAG AA contrast checks
  const bgColors = [colors.background, colors.surface].filter(Boolean) as string[];
  const textColors = [colors.foreground, colors.text, colors.textMuted].filter(Boolean) as string[];

  for (const bg of bgColors) {
    for (const fg of textColors) {
      const ratio = contrastRatio(bg, fg);
      if (ratio < 4.5) {
        warnings.push({
          severity: ratio < 3 ? "error" : "warning",
          category: "contrast",
          message: `Contrast ratio ${ratio.toFixed(1)}:1 between ${bg} and ${fg} fails WCAG AA (needs 4.5:1)`,
        });
      }
    }
  }

  // 2. Too many fonts (>2 is a smell)
  const fontFamilies = tokens.typography?.fontFamily ?? {};
  const fontNames = Object.values(fontFamilies).map((f) =>
    f.split(",")[0].trim().replace(/['"]/g, "").toLowerCase()
  );
  const uniqueFonts = [...new Set(fontNames)];
  if (uniqueFonts.length > 2) {
    warnings.push({
      severity: "warning",
      category: "count",
      message: `${uniqueFonts.length} font families detected (${uniqueFonts.join(", ")}). Limit to 2 for consistency.`,
    });
  }

  // 3. Near-duplicate colors
  const colorEntries = Object.entries(colors).filter(([, v]) => v);
  for (let i = 0; i < colorEntries.length; i++) {
    for (let j = i + 1; j < colorEntries.length; j++) {
      const [name1, hex1] = colorEntries[i];
      const [name2, hex2] = colorEntries[j];
      if (areColorsNearDuplicate(hex1 as string, hex2 as string)) {
        warnings.push({
          severity: "info",
          category: "duplication",
          message: `"${name1}" (${hex1}) and "${name2}" (${hex2}) are very similar — consider consolidating.`,
        });
      }
    }
  }

  // 4. Missing semantic color checks
  const requiredSemantics = ["primary", "background", "foreground"] as const;
  for (const required of requiredSemantics) {
    if (!colors[required]) {
      warnings.push({
        severity: "warning",
        category: "missing",
        message: `Missing required semantic color: "${required}".`,
      });
    }
  }

  const recommendedSemantics = ["muted", "border", "surface"] as const;
  for (const recommended of recommendedSemantics) {
    if (!colors[recommended]) {
      warnings.push({
        severity: "info",
        category: "missing",
        message: `Consider adding "${recommended}" color for a more complete design system.`,
      });
    }
  }

  return warnings;
}
