import { apiFetch } from "@/lib/apiFetch";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Globe, Heart, Eye, Layers, Sparkles, ExternalLink,
  Copy, Check, Filter, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const WELLNESS_TAGS = ["calm","ocean","forest","lavender","sleep","energy","morning","focus","meditation","mindful","nature","breathing"];

async function fetchPublicScenes(tag?: string, q?: string) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q)   params.set("q", q);
  const r = await apiFetch(`/api/scenes/public?${params}`);
  if (!r.ok) throw new Error("Failed to load");
  return r.json();
}

async function likeScene(id: string) {
  const r = await apiFetch(`/api/scenes/${id}/like`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to like");
  return r.json();
}

async function forkScene(id: string) {
  const r = await apiFetch(`/api/scenes/${id}/fork`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to fork");
  return r.json();
}

function ScenePreviewSvg({ scene }: { scene: any }) {
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  return (
    <svg
      viewBox={`0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}`}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.92 }}
    >
      {elements.slice(0, 10).map((el: any) => {
        const op = el.opacity ?? 0.7;
        if (el.type === "circle") {
          return <circle key={el.id} cx={el.x + el.width / 2} cy={el.y + el.height / 2} r={el.width / 2} fill={el.fill} opacity={op} />;
        }
        if (el.type === "rect") {
          return <rect key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} rx={12} fill={el.fill} opacity={op} />;
        }
        if (el.svgPath) {
          return <path key={el.id} d={el.svgPath} fill={el.fill} transform={`translate(${el.x},${el.y})`} opacity={op} />;
        }
        return null;
      })}
    </svg>
  );
}

function GalleryCard({ scene, onLike, liked }: { scene: any; onLike: () => void; liked: boolean }) {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  let tags: string[] = [];
  try { tags = JSON.parse(scene.tags ?? "[]"); } catch { /* */ }

  let tokens: Record<string, string> = {};
  try { tokens = JSON.parse(scene.themeTokens ?? "{}"); } catch { /* */ }
  const colors = Object.values(tokens).slice(0, 5) as string[];

  const forkMut = useMutation({
    mutationFn: () => forkScene(scene.id),
    onSuccess: (forked: any) => {
      toast({ title: "Scene forked to your workspace!" });
      qc.invalidateQueries({ queryKey: ["publicScenes"] });
      navigate(`/scenes/${forked.id}`);
    },
    onError: () => toast({ title: "Failed to fork", variant: "destructive" }),
  });

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/scenes/${scene.id}/share`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-200 hover:shadow-xl hover:shadow-black/20">
      {/* Preview */}
      <div
        className="h-48 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)" }}
      >
        <ScenePreviewSvg scene={scene} />

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <Button size="sm" variant="secondary" className="h-8 bg-white/90 text-black hover:bg-white border-0 shadow-lg gap-1.5 text-xs"
            onClick={() => window.open(`/scenes/${scene.id}/share`, "_blank")}>
            <Eye className="h-3.5 w-3.5" />Share
          </Button>
          <Button size="sm" variant="secondary" className="h-8 bg-white/90 text-black hover:bg-white border-0 shadow-lg gap-1.5 text-xs"
            onClick={() => forkMut.mutate()} disabled={forkMut.isPending}>
            <Sparkles className="h-3.5 w-3.5" />Fork
          </Button>
        </div>

        {/* Stats badge */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <div className="bg-black/60 backdrop-blur text-white text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Eye className="h-2.5 w-2.5" />{scene.viewCount ?? 0}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm truncate">{scene.name}</h3>
          <button
            onClick={onLike}
            className={cn("shrink-0 flex items-center gap-1 text-xs transition-colors",
              liked ? "text-red-400" : "text-muted-foreground hover:text-red-400")}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            {(scene.likes ?? 0) + (liked ? 1 : 0)}
          </button>
        </div>

        {scene.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{scene.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{t}</span>
            ))}
          </div>
        )}

        {colors.length > 0 && (
          <div className="flex gap-1 mb-3">
            {colors.map((c, i) => (
              <span key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {new Date(scene.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={copyLink}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy share link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SceneGallery() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"likes"|"views"|"newest">("likes");
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("likedScenes") ?? "[]")); } catch { return new Set(); }
  });
  const [trending, setTrending] = useState<any[]>([]);

  // fetch trending
  useEffect(() => {
    apiFetch("/api/scenes/trending")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setTrending(d))
      .catch(() => {});
  }, []);

  const { data: scenes = [], isLoading, refetch } = useQuery({
    queryKey: ["publicScenes", activeTag, search],
    queryFn: () => fetchPublicScenes(activeTag ?? undefined, search || undefined),
    staleTime: 30_000,
  });

  const likeMut = useMutation({
    mutationFn: likeScene,
    onSuccess: () => refetch(),
  });

  function handleLike(id: string) {
    if (likedIds.has(id)) return;
    const next = new Set(likedIds);
    next.add(id);
    setLikedIds(next);
    localStorage.setItem("likedScenes", JSON.stringify([...next]));
    likeMut.mutate(id);
  }

  const filtered = (scenes as any[])
    .filter((s: any) =>
      !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "likes")  return (b.likes ?? 0)      - (a.likes ?? 0);
      if (sortBy === "views")  return (b.viewCount ?? 0)  - (a.viewCount ?? 0);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/scenes">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-7 w-7 text-primary" />
              Public Scene Gallery
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Browse and fork community-published wellness scenes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                apiFetch("/api/scenes/random")
                  .then((r) => r.ok ? r.json() : null)
                  .then((s) => s && window.open(`/scenes/${s.id}/share`, "_blank"))
                  .catch(() => {});
              }}
            >
              🎲 Random Scene
            </Button>
            <div className="text-right">
              <p className="text-2xl font-bold">{filtered.length}</p>
              <p className="text-xs text-muted-foreground">scenes</p>
            </div>
          </div>
        </div>

        {/* Trending strip */}
        {trending.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-rose-400" />Trending This Week
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {trending.map((scene: any) => {
                let els: any[] = [];
                try { els = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }
                return (
                  <button
                    key={scene.id}
                    onClick={() => window.open(`/scenes/${scene.id}/share`, "_blank")}
                    className="group relative h-24 rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all"
                    style={{ background: "linear-gradient(135deg,#0d1117,#1a1a2e)" }}
                  >
                    <svg viewBox={`0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}`} className="absolute inset-0 w-full h-full opacity-90">
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
                      <p className="text-white/80 text-[9px] font-medium truncate">{scene.name}</p>
                    </div>
                    {(scene.likes ?? 0) > 0 && (
                      <div className="absolute top-1.5 right-1.5 text-[8px] bg-black/50 text-rose-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        ♥ {scene.likes}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + sort + tag filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scenes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground"
          >
            <option value="likes">Most Liked</option>
            <option value="views">Most Viewed</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                !activeTag ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              All
            </button>
            {WELLNESS_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  activeTag === tag ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">No public scenes yet</p>
            <p className="text-sm mb-6">Publish your scenes to share them with the community</p>
            <Link href="/scenes">
              <Button>Go to My Scenes</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((scene: any) => (
              <GalleryCard
                key={scene.id}
                scene={scene}
                onLike={() => handleLike(scene.id)}
                liked={likedIds.has(scene.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
