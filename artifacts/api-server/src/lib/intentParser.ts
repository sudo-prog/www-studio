// ── Intent Parser ─────────────────────────────────────────────────────────
// Parses user annotations on references to determine extraction intent.

export type ReferenceIntent =
  | 'typography' | 'color' | 'layout' | 'mobile-layout'
  | 'animation' | 'blend' | 'base' | 'inspiration' | 'component';

export interface ParsedIntent {
  intent: ReferenceIntent;
  weight: number;    // 0.0–1.0
  sections: string[];
  directive: string;
}

export interface ReferenceInput {
  type: 'url' | 'image';
  annotation?: string;
  screenshots?: string;       // base64 PNG (desktop screenshot)
  imageBase64?: string;       // base64 for image-type references
  parsedIntent?: ParsedIntent;
}

/**
 * Parse an annotation string to determine the user's extraction intent.
 * Pattern matching is case-insensitive.
 */
export function parseAnnotationIntent(annotation: string): ParsedIntent {
  const text = (annotation || "").toLowerCase();

  // Mobile layout — check before generic "layout"
  if (/mobile\s+layout|mobile\s+nav|mobile\s+menu/.test(text)) {
    return {
      intent: 'mobile-layout',
      weight: 0.8,
      sections: ['layout'],
      directive: 'Focus on mobile layout patterns — identify navigation, spacing, and responsive behaviors.',
    };
  }

  // Typography
  if (/font|typeface|typography/.test(text)) {
    return {
      intent: 'typography',
      weight: 0.9,
      sections: ['typography'],
      directive: 'Focus on typography extraction — identify all font families, weights, and sizes.',
    };
  }

  // Color
  if (/colour|color|palette|vibe|aesthetic/.test(text)) {
    return {
      intent: 'color',
      weight: 0.9,
      sections: ['colors'],
      directive: 'Focus on color extraction — identify the full palette including primary, secondary, accent, and neutral colors.',
    };
  }

  // Animation
  if (/animation|motion|movement|transition/.test(text)) {
    return {
      intent: 'animation',
      weight: 0.8,
      sections: ['animations'],
      directive: 'Focus on animation and motion patterns — identify transitions, durations, and easing functions.',
    };
  }

  // Blend
  if (/mix|combine|blend|both/.test(text)) {
    return {
      intent: 'blend',
      weight: 0.5,
      sections: ['colors', 'typography', 'layout'],
      directive: 'Extract a balanced design system covering colors, typography, and layout equally.',
    };
  }

  // Base
  if (/base|primary|foundation/.test(text)) {
    return {
      intent: 'base',
      weight: 1.0,
      sections: ['colors', 'typography', 'layout'],
      directive: 'Focus on foundational design tokens — extract the core color palette, typography, and spacing system.',
    };
  }

  // Component
  if (/component|button|card|nav/.test(text)) {
    return {
      intent: 'component',
      weight: 0.8,
      sections: ['components'],
      directive: 'Focus on component patterns — identify buttons, cards, navigation, and reusable UI elements.',
    };
  }

  // Default — inspiration
  return {
    intent: 'inspiration',
    weight: 0.7,
    sections: ['colors', 'typography', 'layout'],
    directive: 'Extract an inspirational design system — capture the overall look and feel including colors, typography, and layout patterns.',
  };
}
