import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Home, FileText, ChevronRight, Check, Pencil } from "lucide-react";

export interface Page {
  id: string;
  name: string;
  slug: string;
  isHome?: boolean;
}

interface Props {
  pages: Page[];
  currentPageId: string;
  onSelect: (pageId: string) => void;
  onAdd: () => void;
  onDelete: (pageId: string) => void;
  onRename: (pageId: string, name: string) => void;
}

export function PageManager({ pages, currentPageId, onSelect, onAdd, onDelete, onRename }: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = (page: Page) => {
    if (page.isHome) return;
    setRenamingId(page.id);
    setRenameVal(page.name);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const commitRename = () => {
    if (renamingId && renameVal.trim()) {
      onRename(renamingId, renameVal.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="border-b border-border/50 shrink-0">
      <div className="flex items-center justify-between px-3 h-8">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pages</span>
        <Button variant="ghost" size="icon" className="h-5 w-5" title="Add page" onClick={onAdd}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="px-1 pb-1 space-y-0.5">
        {pages.map((page) => (
          <div key={page.id}
            className={cn(
              "group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs",
              currentPageId === page.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            onClick={() => onSelect(page.id)}
            onDoubleClick={() => startRename(page)}
          >
            {page.isHome
              ? <Home className="w-3 h-3 shrink-0" />
              : <FileText className="w-3 h-3 shrink-0" />
            }

            {renamingId === page.id ? (
              <input
                ref={inputRef}
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-background border border-primary rounded px-1 h-5 text-xs focus:outline-none text-foreground"
              />
            ) : (
              <span className="flex-1 truncate">{page.name}</span>
            )}

            {currentPageId === page.id && !renamingId && (
              <ChevronRight className="w-3 h-3 shrink-0" />
            )}

            {!page.isHome && renamingId !== page.id && (
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button title="Rename" className="p-0.5 rounded hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); startRename(page); }}>
                  <Pencil className="w-2.5 h-2.5" />
                </button>
                <button title="Delete" className="p-0.5 rounded hover:text-red-400"
                  onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}>
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
