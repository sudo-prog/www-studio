// ── Code Inspector Panel ─────────────────────────────────────────────────────
import { useState } from "react";
import { FreeformElement, FreeformPage } from "@/lib/freeform-types";
import { generatePageCSS, generatePageTailwind, generatePageReact, generatePageFramerMotion } from "@/lib/code-generators";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Code2, Braces, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  elements: FreeformElement[];
  page: FreeformPage;
}

type CodeFormat = "css" | "tailwind" | "react" | "framer";

export default function CodeInspector({ elements, page }: Props) {
  const [format, setFormat] = useState<CodeFormat>("css");
  const [copied, setCopied] = useState(false);

  const generateCode = (): string => {
    switch (format) {
      case "css":
        return generatePageCSS(page);
      case "tailwind":
        return generatePageTailwind(page);
      case "react":
        return generatePageReact(page);
      case "framer":
        return generatePageFramerMotion(page);
    }
  };

  const code = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col z-40 overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Code Inspector</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy code">
          <Copy className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex gap-1 p-2 shrink-0">
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", format === "css" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setFormat("css")}
        >
          <Paintbrush className="w-3 h-3" /> CSS
        </button>
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", format === "tailwind" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setFormat("tailwind")}
        >
          <Braces className="w-3 h-3" /> Tailwind
        </button>
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", format === "react" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setFormat("react")}
        >
          <Code2 className="w-3 h-3" /> React
        </button>
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", format === "framer" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setFormat("framer")}
        >
          <span className="text-[10px]">⚡</span> Framer
        </button>
      </div>

      {copied && (
        <div className="px-3 py-1 text-[10px] text-green-400 bg-green-400/10">Copied to clipboard!</div>
      )}

      <ScrollArea className="flex-1">
        <pre className="p-3 text-[11px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
          {code}
        </pre>
      </ScrollArea>
    </div>
  );
}
