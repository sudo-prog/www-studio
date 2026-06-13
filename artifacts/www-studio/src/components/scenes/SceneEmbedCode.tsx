import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code2, Globe, Lock, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sceneId: string;
  sceneName: string;
  isPublished: boolean;
}

type EmbedFormat = "iframe" | "react" | "link";

export function SceneEmbedCode({ sceneId, sceneName, isPublished }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [format, setFormat] = useState<EmbedFormat>("iframe");

  const baseUrl    = window.location.origin;
  const previewUrl = `${baseUrl}/scenes/${sceneId}/preview`;
  const shareUrl   = `${baseUrl}/scenes/${sceneId}/share`;

  const codes: Record<EmbedFormat, { label: string; lang: string; code: string }> = {
    iframe: {
      label: "iFrame",
      lang: "html",
      code: `<iframe\n  src="${shareUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  allow="autoplay"\n  title="${sceneName}"\n  style="border-radius:16px;border:none;"\n></iframe>`,
    },
    react: {
      label: "React",
      lang: "tsx",
      code: `function ${sceneName.replace(/[^a-zA-Z]/g, "")}Scene() {\n  return (\n    <iframe\n      src="${shareUrl}"\n      className="w-full h-[600px] rounded-2xl border-0"\n      title="${sceneName}"\n      allow="autoplay"\n    />\n  );\n}`,
    },
    link: {
      label: "Link",
      lang: "text",
      code: shareUrl,
    },
  };

  function copyCode(key: string) {
    navigator.clipboard.writeText(codes[format as EmbedFormat].code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadHtml() {
    const a = document.createElement("a");
    a.href = `/api/scenes/${sceneId}/export-html`;
    a.download = `${sceneName.toLowerCase().replace(/\s+/g, "-")}-scene.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const current = codes[format];

  return (
    <div className="space-y-3">
      {!isPublished && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          Publish this scene for the embed to be publicly accessible.
        </div>
      )}

      {/* Format selector */}
      <div className="flex gap-1.5 p-1 bg-muted rounded-lg">
        {(["iframe", "react", "link"] as EmbedFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={cn(
              "flex-1 text-xs px-2 py-1.5 rounded-md transition-colors font-medium",
              format === f ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {codes[f].label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="bg-[#0d0d0d] border border-border rounded-xl p-4 text-[11px] leading-relaxed overflow-x-auto text-green-300 font-mono whitespace-pre-wrap break-all">
          {current.code}
        </pre>
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 h-7 text-xs gap-1"
          onClick={() => copyCode(format)}
        >
          {copied === format ? <><Check className="h-3 w-3 text-green-400" />Copied!</> : <><Copy className="h-3 w-3" />Copy</>}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        {isPublished && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Open share page
          </a>
        )}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          Full-screen preview
        </a>
        <button
          onClick={downloadHtml}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download standalone HTML
        </button>
      </div>
    </div>
  );
}
