// ─── ExtractionHistory.tsx ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExtractionSummary {
  id: string;
  url: string;
  status: "pending" | "processing" | "complete" | "error";
  createdAt: string;
  primaryColor?: string;
  error?: string;
}

interface ExtractionHistoryProps {
  extractions: ExtractionSummary[];
  currentId?: string;
  onSelect: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function StatusBadge({ status }: { status: ExtractionSummary["status"] }) {
  switch (status) {
    case "complete":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Done
        </span>
      );
    case "processing":
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          {status === "pending" ? "Queued" : "Processing"}
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-2.5 w-2.5" />
          Error
        </span>
      );
  }
}

export default function ExtractionHistory({
  extractions,
  currentId,
}: ExtractionHistoryProps) {
  const [, navigate] = useLocation();

  if (extractions.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No extractions yet</p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Extract your first design →
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {extractions.map((ex) => (
        <button
          key={ex.id}
          onClick={() => navigate(`/design-extract/${ex.id}`)}
          className={cn(
            "w-full text-left p-2.5 rounded-lg transition-colors group",
            currentId === ex.id
              ? "bg-[#3b82f6]/10 border border-[#3b82f6]/30"
              : "hover:bg-[#27272a] border border-transparent"
          )}
        >
          <div className="flex items-center gap-2.5">
            {/* Color swatch */}
            <div
              className="shrink-0 w-8 h-8 rounded-md border border-[#27272a]"
              style={{ backgroundColor: ex.primaryColor || "#27272a" }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate font-mono">
                {ex.url.length > 36 ? ex.url.slice(0, 36) + "…" : ex.url}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={ex.status} />
                <span className="text-[10px] text-muted-foreground/50">
                  {timeAgo(ex.createdAt)}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
          </div>
        </button>
      ))}
    </div>
  );
}
