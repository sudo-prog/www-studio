// ─── status-badge.tsx ────────────────────────────────────────────────────────
// Compact status pill extracted from the bookmarks/design-extract feature
// (formerly inlined as a local helper inside
// `components/design-extract/ExtractionHistory.tsx`).
//
// Domain-agnostic: drives purely off the visual `status` + `label` props.
// Consumers supply the variant colour via `tone`.

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "info" | "danger" | "muted";

const TONE_STYLES: Record<StatusTone, string> = {
  success: "bg-[#22c55e]/10 text-[#22c55e]",
  info: "bg-[#3b82f6]/10 text-[#3b82f6]",
  danger: "bg-red-500/10 text-red-400",
  muted: "bg-[#27272a] text-muted-foreground",
};

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * High-level status. The component renders a preconfigured icon + label
   * pair for the built-in values; consumers may also pass `label` and/or
   * `icon` to override.
   */
  status?: "complete" | "processing" | "pending" | "error" | "idle";
  /** Override the label text (defaults match `status`). */
  label?: React.ReactNode;
  /** Override the leading icon. */
  icon?: React.ReactNode;
  /** Visual colour tone. Defaults are mapped per `status`. */
  tone?: StatusTone;
  /** Show the spinner animation regardless of `status`. */
  spinning?: boolean;
}

const DEFAULT_LABEL: Record<NonNullable<StatusBadgeProps["status"]>, string> = {
  complete: "Done",
  processing: "Processing",
  pending: "Queued",
  error: "Error",
  idle: "Idle",
};

const DEFAULT_TONE: Record<NonNullable<StatusBadgeProps["status"]>, StatusTone> = {
  complete: "success",
  processing: "info",
  pending: "info",
  error: "danger",
  idle: "muted",
};

function defaultIcon(
  status: NonNullable<StatusBadgeProps["status"]>,
  spinning: boolean,
): React.ReactNode {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-2.5 w-2.5" />;
    case "processing":
      return (
        <Loader2 className={cn("h-2.5 w-2.5", spinning ? "animate-spin" : "")} />
      );
    case "pending":
      return (
        <Loader2 className={cn("h-2.5 w-2.5", spinning ? "animate-spin" : "")} />
      );
    case "error":
      return <AlertCircle className="h-2.5 w-2.5" />;
    case "idle":
      return <CircleDashed className="h-2.5 w-2.5" />;
  }
}

/**
 * Small pill-shaped status indicator. Used in any list, history row, or
 * card where you need to surface the current state of an asynchronous
 * operation.
 */
export function StatusBadge({
  status = "idle",
  label,
  icon,
  tone,
  spinning = false,
  className,
  ...rest
}: StatusBadgeProps) {
  const resolvedTone = tone ?? DEFAULT_TONE[status];
  const resolvedIcon = icon ?? defaultIcon(status, spinning);
  const resolvedLabel = label ?? DEFAULT_LABEL[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full",
        TONE_STYLES[resolvedTone],
        className,
      )}
      {...rest}
    >
      {resolvedIcon}
      {resolvedLabel}
    </span>
  );
}

export { TONE_STYLES as STATUS_BADGE_TONES };