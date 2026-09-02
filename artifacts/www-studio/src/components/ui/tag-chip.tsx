// ─── tag-chip.tsx ────────────────────────────────────────────────────────────
// Compact tag pill extracted from the bookmarks component library page
// (was inline JSX inside `pages/components.tsx`'s `ComponentCard`).
//
// Domain-agnostic: it does not know what a "bookmark" or "component" is —
// callers pass arbitrary tag strings.

import * as React from "react";
import { cn } from "@/lib/utils";

export type TagChipTone = "muted" | "primary" | "accent";

const TONE_STYLES: Record<TagChipTone, string> = {
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-[#3b82f6]/10 text-[#3b82f6]",
};

export interface TagChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The tag text to display. */
  children: React.ReactNode;
  /** Visual tone. Defaults to `muted`. */
  tone?: TagChipTone;
}

/**
 * Inline pill used for short categorical labels (tags, filters, badges).
 */
export function TagChip({
  children,
  tone = "muted",
  className,
  ...rest
}: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md",
        TONE_STYLES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export { TONE_STYLES as TAG_CHIP_TONES };