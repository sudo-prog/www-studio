import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetScene } from "@workspace/api-client-react";
import { type SceneElement } from "@/lib/scene-types";
import { Button } from "@/components/ui/button";
import {
  Heart, Eye, Copy, Check, ExternalLink, ArrowLeft, Layers,
  Code, Globe, Sparkles, Download,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function AnimatedScene({ scene }: { scene: any }) {
  let elements: SceneElement[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  let tokens: Record<string, string> = {};
  try { tokens = JSON.parse(scene.themeTokens ?? "{}"); } catch { /* */ }

  const bg = tokens["--background"] ?? "#0d0d1a";

  return (
    <svg
      viewBox={`0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}`}
      className="w-full h-full"
      style={{ background: bg }}
    >
      <defs>
        {elements.map((el) =>
          (el.blur ?? 0) > 0 ? (
            <filter key={`f${el.id}`} id={`f${el.id}`}>
              <feGaussianBlur stdDeviation={el.blur} />
            </filter>
          ) : null
        )}
        <style>{`
          @keyframes float   { 0%,100% { transform: translateY(0); }        50% { transform: translateY(-24px); } }
          @keyframes pulse   { 0%,100% { opacity: var(--op,0.7); }          50% { opacity: calc(var(--op,0.7)*0.5); } }
          @keyframes drift   { 0%,100% { transform: translateX(0); }        50% { transform: translateX(18px); } }
          @keyframes breathe { 0%,100% { transform: scale(1); }             50% { transform: scale(1.08); } }
          @keyframes spin    { from    { transform: rotate(0deg); }         to  { transform: rotate(360deg); } }
          @keyframes bounce  { 0%,100%{ transform: scale(1); }30%{ transform: scale(1.15); }60%{ transform: scale(0.93); } }
        `}</style>
      </defs>
      {elements.filter((el) => el.visible).map((el) => {
        const op    = el.opacity ?? 0.7;
        const filt  = (el.blur ?? 0) > 0 ? `url(#f${el.id})` : undefined;
        const preset = el.animation?.preset ?? "none";
        const delay  = el.animation?.delay  ?? 0;
        const dur    = el.animation?.duration ?? 8;
        const animValue = preset !== "none" ? ANIM_MAP[preset] : undefined;
        const animStyle = animValue
          ? { animation: animValue.replace(/\d+(\.\d+)?s/, `${dur}s`), animationDelay: `${delay}s`, transformOrigin: "center" } as React.CSSProperties
          : {};

        if (el.type === "circle") {
          return (
            <circle
              key={el.id}
              cx={el.x + el.width / 2} cy={el.y + el.height / 2}
              r={el.width / 2}
              fill={el.fill} opacity={op}
              filter={filt}
              style={animStyle}
            />
          );
        }
        if (el.type === "rect") {
          return (
            <rect
              key={el.id}
              x={el.x} y={el.y} width={el.width} height={el.height} rx={(el as any).rx ?? 12}
              fill={el.fill} opacity={op}
              filter={filt}
              style={animStyle}
            />
          );
        }
        return null;
      })}
    </svg>
  );
}

const ANIM_MAP: Record<string, string> = {
  "gentle-float":     "float 8s ease-in-out infinite",
  "gradient-breathe": "breathe 5s ease-in-out infinite",
  "shadow-pulse":     "pulse 4s ease-in-out infinite",
  "scale-pulse":      "breathe 4s ease-in-out infinite",
  "fade-in-out":      "pulse 6s ease-in-out infinite",
  "morph":            "breathe 7s ease-in-out infinite",
  "drift":            "drift 6s ease-in-out infinite",
  "spin-slow":        "spin 12s linear infinite",
  "elastic-bounce":   "bounce 3s ease-in-out infinite",
  "hover-lift":       "float 5s ease-in-out infinite",
  "float":            "float 8s ease-in-out infinite",
  "pulse":            "pulse 4s ease-in-out infinite",
};

export default function SceneShare() {
  const params = useParams<{ sceneId: string }>();
  const [, navigate] = useLocation();
  const sceneId = params?.sceneId ?? "";
  const isEmbed = new URLSearchParams(window.location.search).get("embed") === "1";

  const { data: raw, isLoading, isError } = useGetScene(sceneId);
  const [liked, setLiked]     = useState(false);
  const [likes, setLikes]     = useState(0);
  const [views, setViews]     = useState(0);
  const [copied, setCopied]   = useState<"iframe"|"link"|null>(null);
  const [embedMode, setEmbedMode] = useState<"link"|"iframe"|"react">("link");
  const [similar, setSimilar]  = useState<any[]>([]);

  useEffect(() => {
    if (!sceneId) return;
    fetch(`/api/scenes/${sceneId}/similar`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setSimilar(d))
      .catch(() => {});
  }, [sceneId]);

  useEffect(() => {
    if (raw) {
      setLikes((raw as any).likes ?? 0);
      setViews((raw as any).viewCount ?? 0);
      document.title = `${(raw as any).name ?? "Scene"} — WWW Studio`;
    }
  }, [raw]);

  useEffect(() => {
    if (sceneId) {
      fetch(`/api/scenes/${sceneId}/view`, { method: "POST" }).catch(() => {});
    }
  }, [sceneId]);

  function handleLike() {
    if (liked) return;
    fetch(`/api/scenes/${sceneId}/like`, { method: "POST" }).catch(() => {});
    setLiked(true);
    setLikes((n) => n + 1);
  }

  function handleCopy(type: "iframe"|"link") {
    const shareUrl = `${window.location.origin}/scenes/${sceneId}/share`;
    const iframeCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
    const text = type === "iframe" ? iframeCode : shareUrl;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (isError || !raw) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Layers className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Scene not found</p>
        <Button variant="outline" asChild><Link href="/scenes">← Back to Scenes</Link></Button>
      </div>
    );
  }

  const scene = raw as any;
  let tags: string[] = [];
  try { tags = JSON.parse(scene.tags ?? "[]"); } catch { /* */ }

  const shareUrl = `${window.location.origin}/scenes/${sceneId}/share`;
  const iframeCode = `<iframe\n  src="${shareUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  allowfullscreen\n></iframe>`;
  const reactCode  = `import { useEffect, useRef } from "react";\n\nexport function ${scene.name.replace(/[^a-zA-Z]/g,"")}Scene() {\n  return (\n    <iframe\n      src="${shareUrl}"\n      style={{ width: "100%", height: 600, border: "none", borderRadius: 16 }}\n    />\n  );\n}`;

  // Embed-only mode — show full-screen scene with no chrome
  if (isEmbed) {
    return (
      <div className="w-full h-screen overflow-hidden bg-[#0d0d1a] relative">
        <AnimatedScene scene={scene} />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-white/40 text-[10px] font-medium px-2 py-0.5 bg-black/40 backdrop-blur rounded-full">
            ✦ WWW Studio
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/scenes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm truncate max-w-[200px]">{scene.name}</span>
            {scene.status === "published" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                <Globe className="h-2.5 w-2.5" />Public
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all",
              liked
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-400")} />
            {likes}
          </button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`/scenes/${sceneId}/preview`, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" />Preview
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href={`/scenes/${sceneId}`}>
              Edit Scene
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Scene preview - left/main */}
        <div className="flex-1 bg-[#0d0d1a] relative overflow-hidden">
          <AnimatedScene scene={scene} />
          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/60 text-xs bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-full">
              <Eye className="h-3 w-3" />{views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-full">
              <Heart className="h-3 w-3" />{likes.toLocaleString()} likes
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[320px] border-l border-border bg-card/50 flex flex-col overflow-y-auto shrink-0">
          {/* Info */}
          <div className="p-5 border-b border-border">
            <h2 className="font-bold text-lg mb-1">{scene.name}</h2>
            {scene.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{scene.description}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Embed */}
          <div className="p-5 flex-1">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />Embed this scene
            </p>

            <div className="flex gap-1 mb-3">
              {(["link","iframe","react"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEmbedMode(mode)}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded-md border transition-colors",
                    embedMode === mode
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "link" ? "URL" : mode === "iframe" ? "iFrame" : "React"}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="text-[11px] leading-relaxed bg-muted rounded-lg p-3 overflow-x-auto text-muted-foreground font-mono whitespace-pre-wrap break-all">
                {embedMode === "link"   ? shareUrl  :
                 embedMode === "iframe" ? iframeCode : reactCode}
              </pre>
              <button
                onClick={() => handleCopy(embedMode === "iframe" ? "iframe" : "link")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background border border-border hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Paste this snippet into any HTML page or React app to embed this animated wellness scene.
            </p>
          </div>

          {/* Similar scenes */}
          {similar.length > 0 && (
            <div className="px-5 pb-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">You might also like</p>
              <div className="grid grid-cols-2 gap-2">
                {similar.map((s: any) => {
                  let els: any[] = [];
                  try { els = JSON.parse(s.elements ?? "[]"); } catch { /* */ }
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/scenes/${s.id}/share`)}
                      className="group relative h-20 rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all text-left"
                      style={{ background: "linear-gradient(135deg,#0d1117,#1a1a2e)" }}
                    >
                      <svg viewBox={`0 0 ${s.canvasWidth ?? 1440} ${s.canvasHeight ?? 900}`} className="absolute inset-0 w-full h-full opacity-90">
                        {els.slice(0, 5).map((el: any) =>
                          el.type === "circle"
                            ? <circle key={el.id} cx={el.x + el.width/2} cy={el.y + el.height/2} r={el.width/2} fill={el.fill} opacity={el.opacity ?? 0.7} />
                            : el.type === "rect"
                            ? <rect   key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} rx={12} fill={el.fill} opacity={el.opacity ?? 0.7} />
                            : null
                        )}
                      </svg>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                      <div className="absolute bottom-1.5 left-2 right-2">
                        <p className="text-white/80 text-[9px] font-medium truncate">{s.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="p-4 border-t border-border flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                fetch(`/api/scenes/${sceneId}/fork`, { method: "POST" })
                  .then((r) => r.ok ? r.json() : null)
                  .then((forked) => forked && navigate(`/scenes/${forked.id}`))
                  .catch(() => {});
              }}
            >
              <Layers className="h-4 w-4" />Fork & Edit
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                const a = document.createElement("a");
                a.href = `/api/scenes/${sceneId}/export-html`;
                a.download = `${scene.name.toLowerCase().replace(/\s+/g,"-")}-scene.html`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
              }}
            >
              <Download className="h-4 w-4" />Download HTML
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                fetch(`/api/scenes/${sceneId}/remix`, { method: "POST" })
                  .then((r) => r.ok ? r.json() : null)
                  .then((remixed) => remixed && navigate(`/scenes/${remixed.id}`))
                  .catch(() => {});
              }}
            >
              🎛 Remix
            </Button>
            <Button className="w-full gap-2" asChild>
              <Link href={`/scenes/${sceneId}`}>
                <Sparkles className="h-4 w-4" />Open Editor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
