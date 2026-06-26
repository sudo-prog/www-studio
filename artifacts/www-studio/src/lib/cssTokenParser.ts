// ─── cssTokenParser.ts ─────────────────────────────────────────────────────
// Parses CSS variables or Tailwind config snippets into ExtractedTokens format.

import type { ExtractedTokens } from "./tokenTypes";

/**
 * Parse CSS custom properties (CSS variables) into design tokens.
 * Handles: :root { --color-primary: #3b82f6; --font-display: 'Inter'; }
 */
export function parseCssVariables(css: string): Partial<ExtractedTokens> {
  const tokens: Record<string, unknown> = {};

  // Extract CSS custom properties
  const varRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  const colors: Record<string, string> = {};
  const fontFamily: Record<string, string> = {};
  const spacing: Record<string, string> = {};
  const radius: Record<string, string> = {};

  while ((match = varRegex.exec(css)) !== null) {
    const [, name, value] = match;
    const trimmedValue = value.trim().replace(/['"]/g, '');

    if (name.startsWith('color-') || name.startsWith('colour-')) {
      const colorName = name.replace(/^(color|colour)-/, '');
      if (/^#[0-9a-fA-F]{3,8}$/.test(trimmedValue)) {
        colors[colorName] = trimmedValue;
      }
    } else if (name.startsWith('font-')) {
      const fontName = name.replace(/^font-/, '');
      fontFamily[fontName] = trimmedValue;
    } else if (name.startsWith('spacing-') || name.startsWith('space-')) {
      const spaceName = name.replace(/^(spacing|space)-/, '');
      spacing[spaceName] = trimmedValue;
    } else if (name.startsWith('radius-') || name.startsWith('rounded-')) {
      const radiusName = name.replace(/^(radius|rounded)-/, '');
      radius[radiusName] = trimmedValue;
    }
  }

  if (Object.keys(colors).length > 0) {
    tokens.colors = colors;
  }
  if (Object.keys(fontFamily).length > 0) {
    tokens.typography = { fontFamily };
  }
  if (Object.keys(spacing).length > 0) {
    tokens.spacing = spacing;
  }
  if (Object.keys(radius).length > 0) {
    tokens.radius = radius;
  }

  return tokens as Partial<ExtractedTokens>;
}

/**
 * Parse Tailwind config snippet (JavaScript/TypeScript object literal).
 * This is a simplified parser for common patterns.
 */
export function parseTailwindConfig(code: string): Partial<ExtractedTokens> {
  const tokens: Record<string, unknown> = {};

  // Try to find colors object
  const colorsMatch = code.match(/colors\s*:\s*\{([^}]+)\}/s);
  if (colorsMatch) {
    const colors = parseKeyValueObject(colorsMatch[1]);
    if (Object.keys(colors).length > 0) {
      tokens.colors = colors;
    }
  }

  // Try to find fontFamily
  const fontMatch = code.match(/fontFamily\s*:\s*\{([^}]+)\}/s);
  if (fontMatch) {
    const fonts = parseKeyValueObject(fontMatch[1]);
    if (Object.keys(fonts).length > 0) {
      tokens.typography = { fontFamily: fonts };
    }
  }

  // Try to find spacing
  const spacingMatch = code.match(/(?:spacing|padding|margin)\s*:\s*\{([^}]+)\}/s);
  if (spacingMatch) {
    const spacing = parseKeyValueObject(spacingMatch[1]);
    if (Object.keys(spacing).length > 0) {
      tokens.spacing = spacing;
    }
  }

  // Try to find borderRadius
  const radiusMatch = code.match(/borderRadius\s*:\s*\{([^}]+)\}/s);
  if (radiusMatch) {
    const radius = parseKeyValueObject(radiusMatch[1]);
    if (Object.keys(radius).length > 0) {
      tokens.radius = radius;
    }
  }

  return tokens as Partial<ExtractedTokens>;
}

/**
 * Parse a simple key: value object (JS object literal subset).
 */
function parseKeyValueObject(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lineRegex = /['"]?([a-zA-Z0-9-_]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = lineRegex.exec(text)) !== null) {
    result[match[1]] = match[2];
  }

  return result;
}

/**
 * Auto-detect input format and parse accordingly.
 */
export function parseCssOrTailwind(input: string): Partial<ExtractedTokens> {
  const trimmed = input.trim();

  // Detect CSS variables format
  if (trimmed.includes(':root') || trimmed.includes('--')) {
    return parseCssVariables(trimmed);
  }

  // Detect Tailwind config format
  if (trimmed.includes('module.exports') || trimmed.includes('export default') || trimmed.includes('tailwindcss')) {
    return parseTailwindConfig(trimmed);
  }

  // Fallback: try CSS variables parser (most forgiving)
  return parseCssVariables(trimmed);
}
