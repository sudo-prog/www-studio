// ── Version History Component ──────────────────────────────────────────────────
// Displays saved versions of a freeform page with restore capability.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { FreeformPage } from "@/lib/freeform-types";

export interface VersionEntry {
  id: string;
  timestamp: string;
  page: FreeformPage;
  label?: string;
}

interface Props {
  versions: VersionEntry[];
  currentId: string | null;
  onRestore: (version: VersionEntry) => void;
}

export default function VersionHistory({ versions, currentId, onRestore }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (versions.length === 0) {
    return (
      <div className="p-3 text-center">
        <p className="text-[10px] text-muted-foreground">No versions saved yet</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium">Version History</span>
          <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {versions.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <ScrollArea className="max-h-48">
          <div className="px-2 pb-2 space-y-1">
            {versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors",
                  version.id === currentId
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Clock className="w-3 h-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {version.label || new Date(version.timestamp).toLocaleString()}
                  </span>
                </div>
                {version.id !== currentId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={() => onRestore(version)}
                    title="Restore this version"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
