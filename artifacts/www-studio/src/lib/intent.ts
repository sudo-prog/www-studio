// ─── intent.ts ───────────────────────────────────────────────────────────────
// Shared annotation-to-intent classifier extracted from the bookmarks
// (design-extract / references) feature.
//
// Two duplicate `parseIntent` implementations existed in:
//   • src/components/design-extract/ReferenceItem.tsx
//   • src/components/design-extract/DesignExtractInput.tsx
// This is the merged version (DesignExtractInput's variant had the extra
// "mix"/"blend"/"combine" branch that the other one lacked).

export interface IntentMatch {
  /** Stable machine-readable id for the matched intent. */
  id:
    | "color"
    | "typography"
    | "layout"
    | "vibe"
    | "mobile"
    | "mix"
    | "reference";
  /** Emoji glyph prefixed to the label. */
  emoji: string;
  /** Human-readable label. */
  label: string;
}

const RULES: ReadonlyArray<{
  id: IntentMatch["id"];
  emoji: string;
  label: string;
  keywords: ReadonlyArray<string>;
}> = [
  {
    id: "color",
    emoji: "🎨",
    label: "Color influence",
    keywords: ["color", "colour", "palette"],
  },
  {
    id: "typography",
    emoji: "✏️",
    label: "Typography influence",
    keywords: ["font", "type", "typograph"],
  },
  {
    id: "layout",
    emoji: "📐",
    label: "Layout influence",
    keywords: ["layout", "spacing", "grid"],
  },
  {
    id: "vibe",
    emoji: "🌟",
    label: "Vibe influence",
    keywords: ["vibe", "feel", "mood"],
  },
  {
    id: "mobile",
    emoji: "📱",
    label: "Mobile reference",
    keywords: ["mobile", "responsive"],
  },
  {
    id: "mix",
    emoji: "🔀",
    label: "Mix influence",
    keywords: ["mix", "blend", "combine"],
  },
];

const DEFAULT_MATCH: IntentMatch = {
  id: "reference",
  emoji: "📌",
  label: "Reference",
};

/**
 * Map a free-form annotation string to a stable intent descriptor. The
 * matcher is case-insensitive and picks the first rule whose keywords are
 * found in the annotation; if none match, returns the generic
 * "Reference" fallback.
 *
 * @param annotation  Free-form annotation text (e.g. "use this for color
 *                    palette inspiration").
 */
export function parseIntent(annotation: string): IntentMatch {
  const lower = (annotation || "").toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { id: rule.id, emoji: rule.emoji, label: rule.label };
    }
  }
  return DEFAULT_MATCH;
}

/**
 * Convenience helper that returns the formatted string
 * `"<emoji> <label>"` — the legacy shape callers relied on.
 */
export function parseIntentLabel(annotation: string): string {
  const m = parseIntent(annotation);
  return `${m.emoji} ${m.label}`;
}