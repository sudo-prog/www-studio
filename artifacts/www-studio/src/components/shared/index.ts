// ─── shared/index.ts ────────────────────────────────────────────────────────
// Barrel for components extracted from feature folders (bookmarks /
// design-extract). Importing from `@/components/shared` is the
// canonical way to reach these primitives — feature code should not
// reach into `@/components/ui/...` for them.

export { StatusBadge, STATUS_BADGE_TONES } from "@/components/ui/status-badge";
export type {
  StatusBadgeProps,
  StatusTone,
} from "@/components/ui/status-badge";

export { TagChip, TAG_CHIP_TONES } from "@/components/ui/tag-chip";
export type { TagChipProps, TagChipTone } from "@/components/ui/tag-chip";

export { CategoryNav } from "@/components/ui/category-nav";
export type {
  CategoryItem,
  CategoryNavProps,
} from "@/components/ui/category-nav";

export {
  PreviewCodeCard,
  DEFAULT_PREVIEW_HTML,
} from "@/components/ui/preview-code-card";
export type {
  PreviewCodeCardProps,
  PreviewCodeView,
} from "@/components/ui/preview-code-card";

// Re-export the shared library helpers so feature code only needs to
// import from one place.
export { timeAgo, formatElapsedSeconds } from "@/lib/time";
export { parseIntent, parseIntentLabel } from "@/lib/intent";
export type { IntentMatch } from "@/lib/intent";