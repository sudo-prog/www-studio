import { useState, useCallback, useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { type SceneElement } from "@/lib/scene-types";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  category?: string;
}

const DEFAULT_COMMANDS: Command[] = [
  { id: "save", label: "Save scene", icon: "💾", shortcut: "Ctrl+S", action: () => {}, category: "File" },
  { id: "undo", label: "Undo", icon: "↶", shortcut: "Ctrl+Z", action: () => {}, category: "Edit" },
  { id: "redo", label: "Redo", icon: "↷", shortcut: "Ctrl+Y", action: () => {}, category: "Edit" },
  { id: "duplicate", label: "Duplicate selected", icon: "⎘", shortcut: "Ctrl+D", action: () => {}, category: "Edit" },
  { id: "delete", label: "Delete selected", icon: "🗑", shortcut: "Del", action: () => {}, category: "Edit" },
  { id: "preview", label: "Open preview", icon: "👁", shortcut: "Ctrl+P", action: () => {}, category: "View" },
  { id: "chat", label: "Toggle AI chat", icon: "💬", shortcut: "Space", action: () => {}, category: "View" },
  { id: "enhance", label: "AI Enhance", icon: "✨", shortcut: "Ctrl+Enter", action: () => {}, category: "AI" },
];

export function CommandPalette({ open, onClose, onCommand }: {
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: Command) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  const filtered = DEFAULT_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-[25vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="text-muted-foreground">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No commands found</p>
          )}
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => { onCommand(cmd); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors"
            >
              <span className="text-base">{cmd.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cmd.label}</p>
                {cmd.category && (
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{cmd.category}</p>
                )}
              </div>
              {cmd.shortcut && (
                <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{cmd.shortcut}</kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
