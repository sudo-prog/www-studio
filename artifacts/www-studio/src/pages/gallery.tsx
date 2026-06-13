import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetScenes, useCreateScene } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Search,
  Layers,
  Copy,
  ExternalLink,
  Eye,
  Code2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function EmbedModal({ scene, onClose }: { scene: any; onClose: () => void }) {
  const previewUrl = `${window.location.origin}/scenes/${scene.id}/preview`;
  const embedCode  = `<iframe\n  src="${previewUrl}"\n  width="800"\n  height="500"\n  frameborder="0"\n  style="border-radius:12px;overflow:hidden;"\n  title="${scene.name}"\n></iframe>`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-base mb-1">Embed Scene</h2>
        <p className="text-xs text-muted-foreground mb-4">Paste this snippet into any HTML page</p>
        <pre className="text-[11px] font-mono bg-muted/50 border border-border rounded-xl p-4 whitespace-pre-wrap break-words leading-relaxed">
          {embedCode}
        </pre>
        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={copy} className="flex-1 gap-1.5">
            {copied ? "✓ Copied!" : <><Copy className="h-3.5 w-3.5" />Copy Embed Code</>}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(`/scenes/${scene.id}/preview`, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" />Preview
          </Button>
        </div>
      </div>
    </div>
  );
}

function GallerySceneCard({ scene, onFork, onEmbed, onPreview }: {
  scene: any;
  onFork:    () => void;
  onEmbed:   () => void;
  onPreview: () => void;
}) {
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  let tags: string[] = [];
  try { tags = JSON.parse(scene.tags ?? "[]"); } catch { /* */ }

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
      {/* Thumbnail */}
      <div
        className="h-44 relative overflow-hidden cursor-pointer"
        style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" }}
        onClick={onPreview}
      >
        <svg
          viewBox={`0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}`}
          className="absolute inset-0 w-full h-full"
        >
          {elements.slice(0, 8).map((el: any) => {
            if (el.type === "circle") return <circle key={el.id} cx={el.x + el.width / 2} cy={el.y + el.height / 2} r={el.width / 2} fill={el.fill} opacity={el.opacity ?? 0.7} />;
            if (el.type === "rect")   return <rect   key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} rx={12} fill={el.fill} opacity={el.opacity ?? 0.7} />;
            if (el.svgPath)           return <path   key={el.id} d={el.svgPath} fill={el.fill} transform={`translate(${el.x},${el.y})`} opacity={el.opacity ?? 0.7} />;
            return null;
          })}
        </svg>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" className="gap-1.5 text-xs h-8" onClick={(e) => { e.stopPropagation(); onPreview(); }}>
            <Eye className="h-3.5 w-3.5" />Preview
          </Button>
          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={(e) => { e.stopPropagation(); onFork(); }}>
            <Sparkles className="h-3.5 w-3.5" />Fork
          </Button>
        </div>

        <div className="absolute top-2 left-2 bg-green-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <Globe className="h-2.5 w-2.5" />Public
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-medium text-sm mb-1 truncate">{scene.name}</h3>
        {scene.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{scene.description}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{elements.length} elements</span>
          <button
            onClick={onEmbed}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Code2 className="h-3 w-3" />Embed
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [, navigate] = useLocation();
  const { toast }    = useToast();
  const [search, setSearch]       = useState("");
  const [embedScene, setEmbedScene] = useState<any | null>(null);

  const { data: allScenes = [], refetch } = useGetScenes();
  const createScene = useCreateScene();

  const published = (allScenes as any[]).filter(
    (s: any) => s.status === "published" && (!search || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleFork(scene: any) {
    try {
      const forked = await createScene.mutateAsync({
        data: {
          name:        `${scene.name} (fork)`,
          elements:    scene.elements,
          themeTokens: scene.themeTokens,
          description: scene.description,
        },
      });
      toast({ title: "Forked!" });
      navigate(`/scenes/${(forked as any).id}`);
    } catch {
      toast({ title: "Fork failed", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {embedScene && <EmbedModal scene={embedScene} onClose={() => setEmbedScene(null)} />}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Public Gallery</h1>
            </div>
            <p className="text-muted-foreground">Published wellness scenes — fork and remix freely</p>
          </div>
          <Button onClick={() => navigate("/scenes")} variant="outline" className="gap-2">
            <Layers className="h-4 w-4" />My Scenes
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search public scenes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">{published.length} public scenes</span>
        </div>

        {published.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">No public scenes yet</p>
            <p className="text-sm mb-6">Publish a scene from your Scenes workspace to see it here</p>
            <Button onClick={() => navigate("/scenes")} className="gap-2">
              <Layers className="h-4 w-4" />Go to My Scenes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {published.map((scene: any) => (
              <GallerySceneCard
                key={scene.id}
                scene={scene}
                onFork={() => handleFork(scene)}
                onEmbed={() => setEmbedScene(scene)}
                onPreview={() => navigate(`/scenes/${scene.id}/preview`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
