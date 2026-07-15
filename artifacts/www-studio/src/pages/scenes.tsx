import { apiFetch } from "@/lib/apiFetch";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  useGetScenes, useCreateScene, useDeleteScene, useAiGenerateScene, useUpdateScene,
} from "@workspace/api-client-react";
import {
  Plus, Wand2, MoreHorizontal, Pencil, Trash2, Layers, Sparkles,
  Search, Clock, Globe, EyeOff, Copy, ExternalLink, Download,
  CheckSquare, Square, X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WELLNESS_PRESETS = [
  { name: "Calm Gradient",   colors: ["#7FB5A0","#87BBDB","#B39DC2"], description: "Sage to sky to lavender" },
  { name: "Sunset Bloom",    colors: ["#E8957A","#F4C5A1","#B39DC2"], description: "Coral to peach to lavender" },
  { name: "Forest Mist",     colors: ["#4A7C6B","#7FB5A0","#C8D8E0"], description: "Deep forest to mist" },
  { name: "Ocean Breath",    colors: ["#87BBDB","#7FB5A0","#B39DC2"], description: "Sky to sage to lavender" },
];

function SceneCard({ scene, onEdit, onDelete, onFork, onTogglePublish, selected, onSelect }: {
  scene: any;
  onEdit:          () => void;
  onDelete:        () => void;
  onFork:          () => void;
  onTogglePublish: () => void;
  selected?:       boolean;
  onSelect?:       () => void;
}) {
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  let tokens: Record<string, string> = {};
  try { tokens = JSON.parse(scene.themeTokens ?? "{}"); } catch { /* */ }

  let tags: string[] = [];
  try { tags = JSON.parse(scene.tags ?? "[]"); } catch { /* */ }

  const colors = Object.values(tokens).slice(0, 5) as string[];
  const isPublished = scene.status === "published";

  return (
    <div className={cn(
      "group relative bg-card border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5",
      selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/30"
    )}>
      {/* Selection checkbox */}
      {onSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="absolute top-2 right-2 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          style={selected ? { opacity: 1 } : {}}
        >
          {selected
            ? <CheckSquare className="h-5 w-5 text-primary drop-shadow" />
            : <Square className="h-5 w-5 text-white/70 drop-shadow" />}
        </button>
      )}
      {/* Preview */}
      <div
        className="h-40 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)" }}
      >
        <svg
          viewBox={`0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}`}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.9 }}
        >
          {elements.slice(0, 8).map((el: any) => {
            if (el.type === "circle") return <circle key={el.id} cx={el.x + el.width/2} cy={el.y + el.height/2} r={el.width/2} fill={el.fill} opacity={el.opacity ?? 0.7} />;
            if (el.type === "rect")   return <rect   key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} fill={el.fill} rx={12} opacity={el.opacity ?? 0.7} />;
            if (el.svgPath)           return <path   key={el.id} d={el.svgPath} fill={el.fill} transform={`translate(${el.x},${el.y})`} opacity={el.opacity ?? 0.7} />;
            return null;
          })}
        </svg>

        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Layers className="h-12 w-12 text-white/20" />
          </div>
        )}

        {/* Status badge */}
        {isPublished && (
          <div className="absolute top-2 left-2 bg-green-500/90 text-white text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Globe className="h-2.5 w-2.5" />Public
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/60 hover:bg-black/80 border-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/scenes/${scene.id}/share`, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />Share Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/scenes/${scene.id}/preview`, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const a = document.createElement("a");
                a.href = `/api/scenes/${scene.id}/export-html`;
                a.download = `${(scene.name ?? "scene").toLowerCase().replace(/\s+/g, "-")}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}>
                <Download className="h-4 w-4 mr-2" />Download HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFork}>
                <Copy className="h-4 w-4 mr-2" />Fork / Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onTogglePublish}>
                {isPublished
                  ? <><EyeOff className="h-4 w-4 mr-2" />Unpublish</>
                  : <><Globe   className="h-4 w-4 mr-2" />Publish</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm truncate">{scene.name}</h3>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full shrink-0",
            isPublished ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
          )}>
            {scene.status}
          </span>
        </div>

        {scene.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{scene.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((t) => (
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
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(scene.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {(scene.viewCount ?? 0) > 0 && <span>👁 {scene.viewCount}</span>}
            {(scene.likes ?? 0) > 0 && <span>♥ {scene.likes}</span>}
            <span>{elements.length} els</span>
          </div>
        </div>
      </div>

      <button onClick={onEdit} className="absolute inset-0 w-full h-full opacity-0" aria-label={`Open ${scene.name}`} />
    </div>
  );
}

export default function Scenes() {
  const [, navigate] = useLocation();
  const { toast }    = useToast();
  const [search, setSearch]   = useState("");
  const [showNew,  setShowNew]  = useState(false);
  const [showAI,   setShowAI]   = useState(false);
  const [newName,  setNewName]  = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [tagCloud, setTagCloud] = useState<Array<{tag: string; count: number}>>([]);

  useEffect(() => {
    apiFetch("/api/scenes/tags")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setTagCloud(d.slice(0, 12)))
      .catch(() => {});
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function batchAction(action: "publish" | "unpublish" | "delete") {
    const ids = Array.from(selected);
    if (action === "delete" && !confirm(`Delete ${ids.length} scenes?`)) return;
    try {
      await apiFetch("/api/scenes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      toast({ title: `${ids.length} scenes ${action === "delete" ? "deleted" : action === "publish" ? "published" : "unpublished"}` });
      setSelected(new Set());
      refetch();
    } catch {
      toast({ title: "Batch action failed", variant: "destructive" });
    }
  }

  const { data: scenes = [], refetch } = useGetScenes();
  const createScene = useCreateScene();
  const deleteScene = useDeleteScene();
  const updateScene = useUpdateScene();
  const aiGenerate  = useAiGenerateScene();

  const [sortBy, setSortBy] = useState<"newest"|"oldest"|"name"|"likes"|"published">("newest");
  const [stats, setStats]   = useState<{ total: number; published: number; totalViews: number; totalLikes: number } | null>(null);

  useEffect(() => {
    apiFetch("/api/scenes/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  const filtered = (scenes as any[])
    .filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s: any) => {
      if (!tagFilter) return true;
      let tags: string[] = [];
      try { tags = JSON.parse(s.tags ?? "[]"); } catch { /* */ }
      return tags.includes(tagFilter);
    })
    .sort((a, b) => {
      if (sortBy === "newest")    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "oldest")    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === "likes")     return (b.likes ?? 0) - (a.likes ?? 0);
      if (sortBy === "published") {
        if (a.status === "published" && b.status !== "published") return -1;
        if (b.status === "published" && a.status !== "published") return 1;
        return 0;
      }
      return a.name.localeCompare(b.name);
    });

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      const scene = await createScene.mutateAsync({ data: { name: newName.trim() } });
      toast({ title: "Scene created!" });
      setShowNew(false);
      setNewName("");
      navigate(`/scenes/${(scene as any).id}`);
    } catch {
      toast({ title: "Failed to create scene", variant: "destructive" });
    }
  }

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) return;
    try {
      const scene = await aiGenerate.mutateAsync({ data: { prompt: aiPrompt.trim() } });
      toast({ title: "Scene generated by AI!" });
      setShowAI(false);
      setAiPrompt("");
      navigate(`/scenes/${(scene as any).id}`);
    } catch {
      toast({ title: "Failed to generate scene", variant: "destructive" });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteScene.mutateAsync({ id });
      toast({ title: "Scene deleted" });
      refetch();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  async function handleFork(scene: any) {
    try {
      const forked = await createScene.mutateAsync({
        data: {
          name:        `${scene.name} (copy)`,
          elements:    scene.elements,
          themeTokens: scene.themeTokens,
          description: scene.description,
        },
      });
      toast({ title: "Scene duplicated!" });
      refetch();
      navigate(`/scenes/${(forked as any).id}`);
    } catch {
      toast({ title: "Failed to duplicate", variant: "destructive" });
    }
  }

  async function handleTogglePublish(scene: any) {
    const newStatus = scene.status === "published" ? "draft" : "published";
    try {
      await updateScene.mutateAsync({ id: scene.id, data: { status: newStatus } });
      toast({ title: newStatus === "published" ? "Scene published!" : "Scene unpublished" });
      refetch();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Scenes</h1>
            <p className="text-muted-foreground">Visual SVG compositions with wellness animations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAI(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />AI Generate
            </Button>
            <Button onClick={() => setShowNew(true)} className="gap-2">
              <Plus className="h-4 w-4" />New Scene
            </Button>
          </div>
        </div>

        {/* Wellness palette strips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {WELLNESS_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => { setNewName(preset.name); setShowNew(true); }}
              className="group flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/30 text-left transition-all"
            >
              <div className="flex gap-1">
                {preset.colors.map((c, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{preset.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{stats.total} total</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-green-400" />{stats.published} published</span>
            <span>👁 {stats.totalViews.toLocaleString()} views</span>
            <span>♥ {stats.totalLikes.toLocaleString()} likes</span>
          </div>
        )}

        {/* Tag filter chips */}
        {tagCloud.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setTagFilter(null)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                tagFilter === null ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >All</button>
            {tagCloud.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  tagFilter === tag ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                #{tag} <span className="opacity-50 ml-0.5">{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
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
            onChange={(e) => setSortBy(e.target.value as "newest"|"oldest"|"name"|"likes"|"published")}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A→Z</option>
            <option value="likes">Most Liked</option>
            <option value="published">Published</option>
          </select>
          <span className="text-sm text-muted-foreground">{filtered.length} scenes</span>
          <Button variant="ghost" size="sm" asChild>
            <a href="/scenes/gallery" className="gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5" />Public Gallery
            </a>
          </Button>
        </div>

        {/* Batch action bar */}
        {selected.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card border border-border rounded-2xl shadow-xl px-4 py-2.5">
            <span className="text-sm font-medium text-muted-foreground mr-1">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => batchAction("publish")} className="gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5" />Publish all
            </Button>
            <Button size="sm" variant="outline" onClick={() => batchAction("unpublish")} className="gap-1.5 text-xs">
              <EyeOff className="h-3.5 w-3.5" />Unpublish all
            </Button>
            <Button size="sm" variant="destructive" onClick={() => batchAction("delete")} className="gap-1.5 text-xs">
              <Trash2 className="h-3.5 w-3.5" />Delete all
            </Button>
            <button onClick={() => setSelected(new Set())} className="ml-2 text-muted-foreground hover:text-foreground">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Layers className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">No scenes yet</p>
            <p className="text-sm mb-6">Create your first visual scene with wellness animations</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowAI(true)} className="gap-2">
                <Sparkles className="h-4 w-4" />AI Generate
              </Button>
              <Button onClick={() => setShowNew(true)} className="gap-2">
                <Plus className="h-4 w-4" />New Scene
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((scene: any) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onEdit={() => navigate(`/scenes/${scene.id}`)}
                onDelete={() => handleDelete(scene.id, scene.name)}
                onFork={() => handleFork(scene)}
                onTogglePublish={() => handleTogglePublish(scene)}
                selected={selected.has(scene.id)}
                onSelect={() => toggleSelect(scene.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New scene dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Scene</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Scene name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createScene.isPending}>
              {createScene.isPending ? "Creating…" : "Create Scene"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI generate dialog */}
      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />AI Scene Generator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Describe a wellness scene — the AI will compose it with calming orbs, waves, and animations.
            </p>
            <Input
              placeholder="e.g. serene ocean at dawn with gentle floating orbs…"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
              autoFocus
            />
            {/* Quick prompt suggestions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Quick prompts</p>
                <button
                  onClick={() => {
                    const prompts = ["serene ocean at dawn","lavender dreamscape for sleep","forest mist at sunrise","cosmic meditation galaxy","golden hour warmth","deep breathing mindfulness","energy boost morning","chakra alignment flow","evening wind-down with amber","mountain peak clarity"];
                    setAiPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
                  }}
                  className="text-[10px] text-primary hover:opacity-70 transition-opacity"
                >🎲 Surprise me</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "serene ocean at dawn",
                  "lavender dreamscape for sleep",
                  "forest mist at sunrise",
                  "cosmic meditation galaxy",
                  "golden hour warmth",
                  "deep breathing mindfulness",
                  "energy boost morning",
                  "chakra alignment flow",
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => setAiPrompt(p)}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-colors text-left",
                      aiPrompt === p ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAI(false)}>Cancel</Button>
            <Button onClick={handleAIGenerate} disabled={!aiPrompt.trim() || aiGenerate.isPending}>
              {aiGenerate.isPending ? "Generating…" : "Generate Scene"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
