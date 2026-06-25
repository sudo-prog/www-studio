// ── Custom CSS/JS Panel ──────────────────────────────────────────────────────
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Code2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  customCss: string;
  customJs: string;
  onCssChange: (css: string) => void;
  onJsChange: (js: string) => void;
  onClose: () => void;
}

type Tab = "css" | "js";

export default function CustomCodePanel({ customCss, customJs, onCssChange, onJsChange, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("css");
  const [copied, setCopied] = useState(false);

  const code = tab === "css" ? customCss : customJs;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col z-40">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Custom Code</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy">
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} title="Close">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 shrink-0 border-b border-border">
        <button
          className={cn(
            "flex-1 py-1.5 text-[10px] rounded font-medium transition-colors",
            tab === "css" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("css")}
        >
          CSS
        </button>
        <button
          className={cn(
            "flex-1 py-1.5 text-[10px] rounded font-medium transition-colors",
            tab === "js" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("js")}
        >
          JavaScript
        </button>
      </div>

      {copied && (
        <div className="px-3 py-1 text-[10px] text-green-400 bg-green-400/10 border-b border-border">
          Copied to clipboard!
        </div>
      )}

      {/* Editor */}
      <ScrollArea className="flex-1">
        <textarea
          value={tab === "css" ? customCss : customJs}
          onChange={(e) => tab === "css" ? onCssChange(e.target.value) : onJsChange(e.target.value)}
          className="w-full h-full min-h-[400px] p-3 text-[11px] font-mono text-muted-foreground leading-relaxed bg-transparent border-0 resize-none focus:outline-none"
          placeholder={
            tab === "css"
              ? "/* Add custom CSS here */\n.freeform-page {\n  /* custom styles */\n}"
              : "// Add custom JS here\n// Runs in the exported HTML\ndocument.addEventListener('DOMContentLoaded', () => {\n  \n});"
          }
          spellCheck={false}
        />
      </ScrollArea>

      {/* Info */}
      <div className="p-2 border-t border-border text-[9px] text-muted-foreground">
        Injected into exported HTML • Does not affect editor preview
      </div>
    </div>
  );
}
