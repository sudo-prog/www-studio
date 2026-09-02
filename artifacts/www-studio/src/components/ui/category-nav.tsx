// ─── category-nav.tsx ────────────────────────────────────────────────────────
// Vertical "category sidebar" + horizontal "category pill row" extracted
// from the bookmarks component library page
// (`pages/components.tsx`). Both share the same `Category` array and the
// same active-state styling — they were previously two separate
// hand-rolled JSX blocks. Now they share a single implementation.

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CategoryItem<T extends string> {
  /** Stable id used as the active-state key. */
  id: T;
  /** Display label rendered to the user. */
  label: T;
  /** Optional count rendered in the trailing slot. */
  count?: number;
}

export interface CategoryNavProps<T extends string>
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Items to render. */
  items: ReadonlyArray<CategoryItem<T>>;
  /** Currently active id. */
  active: T;
  /**
   * Called when the user picks a category. Accepts either a plain
   * `(id: T) => void` callback or a React state setter, so callers can
   * pass `setActive` directly without a wrapper.
   */
  onSelect:
    | ((id: T) => void)
    | React.Dispatch<React.SetStateAction<T>>;
  /** Layout — `sidebar` for vertical desktop, `pills` for mobile. */
  layout?: "sidebar" | "pills";
}

/**
 * Generic category filter UI. Renders either a vertical sidebar (desktop)
 * or a horizontal row of pill-shaped buttons (mobile). Generic over the
 * category id type so it works for any string-keyed enum/string union.
 */
export function CategoryNav<T extends string>({
  items,
  active,
  onSelect,
  layout = "sidebar",
  className,
  ...rest
}: CategoryNavProps<T>) {
  const handlePick = React.useCallback(
    (id: T) => {
      // `onSelect` may be either a plain `(id: T) => void` or a React
      // state setter — both accept a single value argument here.
      (onSelect as (id: T) => void)(id);
    },
    [onSelect],
  );

  if (layout === "pills") {
    return (
      <div
        className={cn("flex flex-wrap gap-2", className)}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePick(item.id)}
              className={cn(
                "px-3 py-1.5 min-h-[48px] rounded-full text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav
      className={cn("flex flex-col gap-1 w-44 shrink-0", className)}
      {...rest}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handlePick(item.id)}
            className={cn(
              "flex items-center justify-between px-3 py-2 min-h-[48px] rounded-lg text-sm text-left transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
            aria-pressed={isActive}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/50",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}