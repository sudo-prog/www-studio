// ─── ratings.ts ──────────────────────────────────────────────────────────
// Per-component 1-5 star ratings persisted to localStorage.
//
// Key schema: "www-studio:rating:<componentId>" → "1"|"2"|"3"|"4"|"5".
// Average is computed across all keys when listing. No backend; if the user
// clears browser storage the counts reset (acceptable for v1).
//
// Exports:
//   useRatings()         — hook returning { get, set, getAverage, ratings }.
//   StarRating           — interactive 5-star widget (used by ComponentCard).
//   StarRatingDisplay    — read-only stars + numeric average (used by cards).
//   filterByRatingSearch — parses "4 stars", "5+", "3+ stars" from search.

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "www-studio:rating";
const VERSION = 1;

type RatingStore = Record<string, number>;

function readStore(): RatingStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { v?: number; data?: RatingStore };
    if (parsed && parsed.v === VERSION && parsed.data) return parsed.data;
  } catch {
    // Corrupt entry — start fresh.
  }
  return {};
}

function writeStore(data: RatingStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, data }));
  } catch {
    // Quota exceeded / private mode — ignore.
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────

export interface RatingsApi {
  /** Map of componentId → { sum, count }. */
  ratings: Record<string, { sum: number; count: number }>;
  /** Get the user's personal rating (1-5) or 0 if not yet rated. */
  get: (id: string) => number;
  /** Set the user's personal rating (1-5). Pass 0 to clear. */
  set: (id: string, value: number) => void;
  /** Get the average across all users. Currently only local users, but the
   *  shape mirrors a future server-aggregated average. */
  getAverage: (id: string) => number;
  /** Number of ratings recorded for an id. */
  getCount: (id: string) => number;
}

export function useRatings(): RatingsApi {
  const [store, setStore] = React.useState<RatingStore>({});

  // Hydrate on mount + listen to cross-tab updates.
  React.useEffect(() => {
    setStore(readStore());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStore(readStore());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Aggregate per-id stats once per render.
  const ratings = React.useMemo(() => {
    const agg: Record<string, { sum: number; count: number }> = {};
    for (const [id, val] of Object.entries(store)) {
      if (!Number.isFinite(val) || val < 1 || val > 5) continue;
      (agg[id] ??= { sum: 0, count: 0 });
      agg[id].sum += val;
      agg[id].count += 1;
    }
    return agg;
  }, [store]);

  const set = React.useCallback((id: string, value: number) => {
    setStore((prev) => {
      const next = { ...prev };
      if (value <= 0) delete next[id];
      else next[id] = Math.max(1, Math.min(5, Math.round(value)));
      writeStore(next);
      return next;
    });
  }, []);

  const get = React.useCallback(
    (id: string) => store[id] ?? 0,
    [store],
  );

  const getAverage = React.useCallback(
    (id: string) => {
      const r = ratings[id];
      return r && r.count > 0 ? r.sum / r.count : 0;
    },
    [ratings],
  );

  const getCount = React.useCallback(
    (id: string) => ratings[id]?.count ?? 0,
    [ratings],
  );

  return { ratings, get, set, getAverage, getCount };
}

// ─── Interactive 5-star widget ───────────────────────────────────────────

export interface StarRatingProps {
  value: number;
  onChange?: (next: number) => void;
  size?: number;
  className?: string;
  /** Disable hover preview (for read-only contexts). */
  readOnly?: boolean;
  ariaLabel?: string;
}

export function StarRating({
  value,
  onChange,
  size = 18,
  className,
  readOnly = false,
  ariaLabel,
}: StarRatingProps) {
  const [hover, setHover] = React.useState(0);
  const display = hover || value;
  const interactive = !readOnly && Boolean(onChange);

  const divLabel = ariaLabel ?? (interactive ? "Rate this component" : `Rating: ${value} of 5`);
  const divRole = "img";
  return (
    <div
      role={divRole}
      aria-label={divLabel}
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => interactive && setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!interactive) return;
              // Click the same star twice → clear.
              onChange?.(value === n ? 0 : n);
            }}
            onMouseEnter={() => interactive && setHover(n)}
            className={cn(
              "p-0.5 rounded transition-transform",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default",
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-600",
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Read-only compact display (avg + star icons) ────────────────────────

export interface StarRatingDisplayProps {
  average: number;
  count: number;
  size?: number;
  className?: string;
  showCount?: boolean;
}

export function StarRatingDisplay({
  average,
  count,
  size = 12,
  className,
  showCount = true,
}: StarRatingDisplayProps) {
  const rounded = Math.round(average);
  const hasRatings = count > 0;
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}
      aria-label={hasRatings ? `${average.toFixed(1)} of 5 stars, ${count} rating${count !== 1 ? "s" : ""}` : "No ratings yet"}
    >
      <span className="inline-flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            strokeWidth={1.5}
            className={cn(
              hasRatings && n <= rounded
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-600",
            )}
          />
        ))}
      </span>
      {showCount && (
        <span className="tabular-nums">
          {hasRatings ? `${average.toFixed(1)} (${count})` : "—"}
        </span>
      )}
    </span>
  );
}

// ─── Search filter parsing ──────────────────────────────────────────────
//
// Recognises phrases inside the search box:
//   "5 stars"        → only 5-star items
//   "4 stars"        → only 4-star items
//   "3+ stars"       → 3 stars and up
//   "4+ stars"       → 4 stars and up
//   "5+ stars"       → only 5-star items
//
// Returns the parsed threshold (0 if none) and the cleaned query.

const STAR_PATTERN = /\b([1-5])(?:\+)?\s*stars?\b/i;

export interface ParsedRatingQuery {
  threshold: number;
  /** When true, threshold is "minimum" (e.g. "4+ stars"); when false, exact. */
  minimum: boolean;
  /** Search string with the star phrase stripped. */
  cleanQuery: string;
}

export function parseRatingQuery(raw: string): ParsedRatingQuery {
  const match = raw.match(STAR_PATTERN);
  if (!match) {
    return { threshold: 0, minimum: false, cleanQuery: raw };
  }
  const n = Number(match[1]);
  const isMinimum = /\+/.test(match[0]) || /\bor\s+better/i.test(raw);
  const cleanQuery = raw.replace(STAR_PATTERN, "").replace(/\s+/g, " ").trim();
  return { threshold: n, minimum: isMinimum, cleanQuery };
}

/**
 * Predicate: does the item's average rating match the parsed query?
 * Items with no ratings (count=0) fail any rating filter — rating is opt-in.
 */
export function matchesRating(
  parsed: ParsedRatingQuery,
  average: number,
): boolean {
  if (parsed.threshold === 0) return true;
  if (parsed.minimum) return average >= parsed.threshold;
  return Math.round(average) === parsed.threshold;
}
