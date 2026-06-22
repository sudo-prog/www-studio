import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, CheckCircle2, Code2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const CODE_FORMATS = [
  { id: "react-framer",     label: "React + Framer",       description: "Motion-animated component",          ext: ".tsx", group: "React" },
  { id: "nextjs",           label: "Next.js Page",         description: "Ready-to-use page component",        ext: ".tsx", group: "React" },
  { id: "tailwind-framer",  label: "Tailwind + Framer",    description: "Tailwind classes + Framer Motion",   ext: ".tsx", group: "React" },
  { id: "react-gsap-lenis", label: "React + GSAP + Lenis", description: "Production bundle with ScrollTrigger", ext: ".tsx", group: "React" },
  { id: "lottie",           label: "Lottie JSON",          description: "Lottie-compatible animation JSON",    ext: ".json", group: "Animation" },
  { id: "gsap",             label: "GSAP Bundle",          description: "Vanilla JS + GSAP timeline",         ext: ".js",   group: "Animation" },
  { id: "css-keyframes",    label: "CSS Keyframes",        description: "Pure CSS animation file",            ext: ".css", group: "CSS" },
  { id: "svg",              label: "Optimized SVG",        description: "Clean SVG with animations",          ext: ".svg", group: "SVG" },
  { id: "cursor-prompt",    label: "Cursor Prompt",        description: "Rich AI coding prompt + JSON",       ext: ".md",  group: "AI" },
] as const;

type CodeFormat = (typeof CODE_FORMATS)[number]["id"];
const GROUPS = ["React", "Animation", "CSS", "SVG", "AI"] as const;

interface Props { sceneId: string }

export function SceneExport({ sceneId }: Props) {
  const [tab, setTab]           = useState<"code" | "embed">("code");
  const [format, setFormat]     = useState<CodeFormat>("react-framer");
  const [code, setCode]         = useState<string | null>(null);
  const [filename, setFilename] = useState("Scene.tsx");
  const [copied, setCopied]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { toast }               = useToast();

  const previewUrl = `${window.location.origin}/scenes/${sceneId}/preview`;
  const embedCode  = `<iframe\n  src="${previewUrl}"\n  width="800"\n  height="500"\n  frameborder="0"\n  style="border-radius:12px;overflow:hidden;"\n  title="Wellness Scene"\n></iframe>`;

  async function handleExport() {
    setLoading(true);
    setCode(null);
    try {
      const res = await fetch(`/api/scenes/${sceneId}/export`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ format }),
      });
      if (!res.ok) throw new Error("Export failed");
      const result = await res.json();
      setCode(result.code ?? result.json ?? "");
      setFilename(result.filename ?? "Scene.tsx");
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  }

  function download(text: string, fname: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      {/* Tab row */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {(["code", "embed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-1.5 text-xs rounded-md font-medium transition-colors capitalize",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "embed" ? "Embed / Share" : "Export Code"}
          </button>
        ))}
      </div>

      {tab === "code" && (
        <>
          <div className="space-y-3">
            {GROUPS.map(group => {
              const items = CODE_FORMATS.filter(f => f.group === group);
              return (
                <div key={group}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{group}</p>
                  <div className="space-y-1">
                    {items.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => { setFormat(f.id); setCode(null); }}
                        className={cn(
                          "w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all",
                          format === f.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                        )}
                      >
                        <span className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded mt-0.5 shrink-0">{f.ext}</span>
                        <div>
                          <p className="text-xs font-medium">{f.label}</p>
                          <p className="text-[9px] text-muted-foreground">{f.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full" size="sm">
            {loading ? "Generating…" : "Generate Export"}
          </Button>

          {code && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">{filename}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(code)}>
                    {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => download(code, filename)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <pre className="text-[9px] bg-muted/50 border border-border rounded-lg p-2.5 overflow-auto max-h-56 font-mono leading-relaxed whitespace-pre-wrap break-words">
                {code}
              </pre>
            </div>
          )}
        </>
      )}

      {tab === "embed" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Embed this scene with live animations in any webpage.
          </p>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1.5"><Code2 className="h-3 w-3" />iframe Snippet</span>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => copy(embedCode)}>
                {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="text-[9px] bg-muted/50 border border-border rounded-lg p-2.5 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {embedCode}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Preview URL</p>
            <div className="flex items-center gap-2">
              <input readOnly value={previewUrl} className="flex-1 text-[9px] font-mono bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground truncate" />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copy(previewUrl)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => window.open(previewUrl, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" />Open Live Preview
          </Button>
        </div>
      )}
    </div>
  );
}
