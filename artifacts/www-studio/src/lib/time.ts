// ─── time.ts ────────────────────────────────────────────────────────────────
// Shared time helpers extracted from the bookmarks/design-extract features.
//
// Two duplicate `timeAgo` implementations existed in:
//   • src/components/design-extract/ExtractionHistory.tsx
//   • src/pages/editor.tsx
// This is the consolidated version (the ExtractionHistory variant is more
// complete — it falls back to a localized date for events older than 7 days).

/**
 * Human-readable relative-time string ("just now", "5m ago", "3h ago",
 * "2d ago", or a localized date for anything older than a week).
 *
 * @param dateStr  ISO-8601 string, Date, or epoch milliseconds.
 * @param now      Optional reference "now" (defaults to `Date.now()`) —
 *                 makes the function deterministic in tests.
 */
export function timeAgo(dateStr: string | number | Date, now: number = Date.now()): string {
  const then =
    typeof dateStr === "string" || typeof dateStr === "number"
      ? new Date(dateStr).getTime()
      : dateStr.getTime();
  if (Number.isNaN(then)) return "";

  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(then).toLocaleDateString();
}

/**
 * Format a duration in seconds as `Mm Ss` (e.g. `2m 14s`, `42s`).
 */
export function formatElapsedSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}