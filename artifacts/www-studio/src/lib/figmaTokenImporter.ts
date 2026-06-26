// ─── figmaTokenImporter.ts ─────────────────────────────────────────────────
// Converts Figma Token Studio JSON export to ExtractedTokens format.

import type { ExtractedTokens } from "./tokenTypes";

/**
 * Figma Token Studio JSON format (simplified subset).
 * The actual format can vary, but this handles the common structure.
 */
interface FigmaTokenSet {
  [key: string]: FigmaTokenValue | FigmaTokenSet;
}

interface FigmaTokenValue {
  value: string;
  type: string;
  description?: string;
  $value?: string;
  $type?: string;
  $description?: string;
}

/**
 * Convert Figma Token Studio JSON export to our ExtractedTokens format.
 */
export function importFigmaTokens(figmaJson: string | Record<string, unknown>): Partial<ExtractedTokens> {
  const data = typeof figmaJson === "string" ? JSON.parse(figmaJson) : figmaJson;

  const tokens: Partial<ExtractedTokens> = {};
  const colors: Record<string, string> = {};
  const fontFamily: Record<string, string> = {};
  const fontSize: Record<string, string> = {};
  const fontWeight: Record<string, number> = {};
  const spacing: Record<string, string> = {};
  const radius: Record<string, string> = {};
  const shadow: Record<string, string> = {};

  // Token Studio can export as nested sets or flat object
  const tokenSets = data.$metadata?.tokenSetOrder
    ? data
    : data;

  function processTokens(obj: FigmaTokenSet, prefix = ""): void {
    for (const [key, val] of Object.entries(obj)) {
      if (!val || typeof val !== "object") continue;

      // Check if it's a token value
      const tokenVal = val as FigmaTokenValue;
      const value = tokenVal.$value ?? tokenVal.value;
      const type = tokenVal.$type ?? tokenVal.type;

      if (value && type) {
        const fullName = prefix ? `${prefix}.${key}` : key;

        switch (type) {
          case "color":
            colors[normalizeName(fullName)] = String(value);
            break;
          case "fontFamilies":
          case "fontFamily":
            fontFamily[normalizeName(fullName)] = String(value).replace(/['"]/g, "");
            break;
          case "fontSizes":
          case "fontSize":
            fontSize[normalizeName(fullName)] = String(value);
            break;
          case "fontWeights":
          case "fontWeight":
            fontWeight[normalizeName(fullName)] = parseInt(String(value), 10) || 400;
            break;
          case "dimension":
          case "spacing":
            spacing[normalizeName(fullName)] = String(value);
            break;
          case "borderRadius":
            radius[normalizeName(fullName)] = String(value);
            break;
          case "boxShadow":
            shadow[normalizeName(fullName)] = String(value);
            break;
          default:
            break;
        }
      } else {
        // Nested set — recurse
        processTokens(val as FigmaTokenSet, prefix ? `${prefix}.${key}` : key);
      }
    }
  }

  processTokens(tokenSets);

  if (Object.keys(colors).length > 0) tokens.colors = colors;
  if (Object.keys(fontFamily).length > 0 || Object.keys(fontSize).length > 0 || Object.keys(fontWeight).length > 0) {
    tokens.typography = { fontFamily, fontSize, fontWeight };
  }
  if (Object.keys(spacing).length > 0) tokens.spacing = spacing;
  if (Object.keys(radius).length > 0) tokens.radius = radius;
  if (Object.keys(shadow).length > 0) tokens.shadow = shadow;

  return tokens;
}

function normalizeName(name: string): string {
  return name
    .replace(/\./g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
