// ─── tokenTypes.ts ─────────────────────────────────────────────────────────
// Shared type definitions for design token import/export.

export interface ExtractedTokens {
  colors?: Record<string, string>;
  typography?: {
    fontFamily?: Record<string, string>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, number>;
    lineHeight?: Record<string, string>;
    letterSpacing?: Record<string, string>;
  };
  spacing?: Record<string, string>;
  radius?: Record<string, string>;
  shadow?: Record<string, string>;
  animation?: {
    duration?: Record<string, string>;
    easing?: Record<string, string>;
  };
  breakpoints?: Record<string, string>;
  components?: Record<string, unknown>;
}
