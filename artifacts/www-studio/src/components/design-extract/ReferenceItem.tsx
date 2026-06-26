// ─── ReferenceItem.tsx ───────────────────────────────────────────────────────
import { useState } from "react";
import { Pencil, Trash2, Link, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Reference } from "./DesignExtractInput";

interface ReferenceItemProps {
  reference: Reference;
  index: number;
  onRemove: () => void;
  onUpdateAnnotation: (annotation: string) => void;
}

export function parseIntent(annotation: string): string {
  const lower = annotation.toLowerCase();
  if (lower.includes("color") || lower.includes("colour") || lower.includes("palette")) {
    return "\uD83C\uDFA8 Color influence";
  }
  if (lower.includes("font") || lower.includes("type") || lower.includes("typograph")) {
    return "✏️ Typography influence";
  }
  if (lower.includes("layout") || lower.includes("spacing") || lower.includes("grid")) {
    return "\uD83D\uDCD0 Layout influence";
  }
  if (lower.includes("vibe") || lower.includes("feel") || lower.includes("mood")) {
    return "\uD83C\uDF1F Vibe influence";
  }
  if (lower.includes("mobile") || lower.includes("responsive")) {
    return "\uD83D\uDCF1 Mobile reference";
  }
  return "\uD83D\uDCCC Reference";
}

export default function ReferenceItem({
  reference,
  index,
  onRemove,
  onUpdateAnnotation,
}: ReferenceItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const intent = parseIntent(reference.annotation);

  const handleBlur = () => {
    setIsEditing(false);
    if (reference.annotation.trim()) {
      setShowPill(true);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    setShowPill(false);
  };

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md bg-[#111113] border border-[#27272a] group ref-item-stagger"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail / Icon */}
      <div className="shrink-0 w-9 h-9 rounded bg-[#0a0a0b] border border-[#27272a] flex items-center justify-center overflow-hidden">
        {reference.thumbnail ? (
          <img
            src={reference.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : reference.type === "url" ? (
          <Link className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Image className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded",
              reference.type === "url"
                ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                : "bg-[#22c55e]/10 text-[#22c55e]"
            )}
          >
            {reference.type}
          </span>
          <span className="text-xs text-foreground truncate">
            {reference.value.length > 48
              ? reference.value.slice(0, 48) + "…"
              : reference.value}
          </span>
        </div>
        {reference.annotation && (
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5 italic">
            {reference.annotation.length > 60
              ? reference.annotation.slice(0, 60) + "…"
              : reference.annotation}
          </p>
        )}
        {/* Intent pill shown after blur */}
        {showPill && reference.annotation && (
          <span className="intent-pill-animate inline-flex text-[11px] px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] mt-1">
            {intent}
          </span>
        )}
      </div>

      {/* Intent pill (always visible on larger screens) */}
      <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-[#27272a] text-muted-foreground">
        {intent}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const newAnn = prompt("Edit annotation:", reference.annotation);
            if (newAnn !== null && newAnn !== reference.annotation) {
              onUpdateAnnotation(newAnn);
              setShowPill(true);
            }
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-400 hover:text-red-300"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
