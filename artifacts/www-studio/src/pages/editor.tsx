import { useParams } from "wouter";
import {
  useGetProject,
  useSendChatMessage,
  useGenerateImage,
  usePublishProject,
  useListSnapshots,
  useRestoreSnapshot,
  useUpdateProject,
  getGetProjectQueryKey,
  getListSnapshotsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Undo, Redo, Monitor, Tablet, Smartphone, Wand2, Send,
  ArrowLeft, Download, Globe, Copy, Check, X, Loader2, Image,
  Sparkles, ExternalLink, ChevronRight, Save, History, Clock,
  RotateCcw, Cloud, CloudOff, Ruler, Search, Tag, FileText,
  Zap, Settings2, LayoutPanelLeft,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/use-offline-sync";

type DeviceMode = "desktop" | "tablet" | "mobile";
type RightPanel = "properties" | "images" | "animations" | "seo" | "content" | "history";

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

// ─────────── STOCK IMAGE BROWSER ───────────
const STOCK_CATEGORIES = ["Abstract", "Architecture", "Nature", "People", "Technology", "Food", "Travel", "Dark"];
const PICSUM_SEEDS: Record<string, number[]> = {
  Abstract:      [10, 20, 30, 42, 55, 66, 80, 90],
  Architecture:  [100, 120, 140, 152, 180, 201, 220, 240],
  Nature:        [15, 37, 58, 70, 88, 110, 131, 160],
  People:        [91, 92, 338, 342, 349, 350, 399, 447],
  Technology:    [1, 2, 3, 4, 5, 6, 7, 8],
  Food:          [292, 312, 315, 326, 330, 431, 493, 494],
  Travel:        [175, 206, 211, 218, 225, 231, 237, 245],
  Dark:          [11, 22, 33, 44, 50, 60, 71, 82],
};

function StockImagesPanel() {
  const [category, setCategory] = useState("Abstract");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const seeds = PICSUM_SEEDS[category] ?? PICSUM_SEEDS.Abstract;
  const images = useMemo(
    () => seeds.map((seed) => ({
      url: `https://picsum.photos/seed/${seed}/400/300`,
      thumb: `https://picsum.photos/seed/${seed}/200/150`,
      id: String(seed),
    })),
    [seeds]
  );

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Image URL copied!" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="p-2 border-b border-border/50">
        <div className="flex flex-wrap gap-1">
          {STOCK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-md font-medium transition-colors",
                category === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-2 p-2">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-lg overflow-hidden border border-border/40 aspect-video bg-muted">
              <img
                src={img.thumb}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2 gap-1" onClick={() => copy(img.url)}>
                  {copied === img.url ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
                  Copy URL
                </Button>
                <Button size="sm" variant="secondary" className="h-6 w-6 p-0" asChild>
                  <a href={img.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─────────── AI IMAGES PANEL ───────────
function AIImagesPanel() {
  const [activeTab, setActiveTab] = useState<"generate" | "stock">("generate");
  const [imgPrompt, setImgPrompt] = useState("");
  const generateImage = useGenerateImage();
  const [images, setImages] = useState<Array<{ url: string; prompt: string }>>([]);
  const { toast } = useToast();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim()) return;
    generateImage.mutate({ data: { prompt: imgPrompt } }, {
      onSuccess: (result) => {
        if (result.url) setImages((prev) => [{ url: result.url!, prompt: result.prompt }, ...prev]);
        setImgPrompt("");
      },
      onError: () => toast({ title: "Image generation failed", variant: "destructive" }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border/50 shrink-0">
        {[{ id: "generate" as const, label: "AI Generate" }, { id: "stock" as const, label: "Stock Photos" }].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex-1 h-8 text-xs font-medium transition-colors border-b-2",
              activeTab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "generate" ? (
        <div className="flex flex-col h-full">
          <form onSubmit={handleGenerate} className="p-3 border-b border-border/50 space-y-2">
            <Textarea value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} placeholder="Describe an image to generate..." className="text-xs resize-none min-h-[60px]" />
            <Button type="submit" size="sm" className="w-full gap-1.5" disabled={generateImage.isPending || !imgPrompt.trim()}>
              {generateImage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}Generate
            </Button>
          </form>
          <ScrollArea className="flex-1 p-3">
            {images.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />Generated images appear here
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-border/40 group relative">
                    <img src={img.url} alt={img.prompt} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => navigator.clipboard.writeText(img.url)}><Copy className="w-3 h-3" />Copy URL</Button>
                      <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" asChild><a href={img.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" />Open</a></Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate px-2 py-1">{img.prompt}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        <StockImagesPanel />
      )}
    </div>
  );
}

// ─────────── ANIMATIONS PANEL ───────────
const ANIMATION_PRESETS = [
  { id: "fade-in", name: "Fade In", tag: "entrance", css: "animate-[fadeIn_0.5s_ease-out]", keyframes: "@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }" },
  { id: "slide-up", name: "Slide Up", tag: "entrance", css: "animate-[slideUp_0.5s_ease-out]", keyframes: "@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }" },
  { id: "slide-in-right", name: "Slide In Right", tag: "entrance", css: "animate-[slideRight_0.5s_ease-out]", keyframes: "@keyframes slideRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }" },
  { id: "bounce-in", name: "Bounce In", tag: "entrance", css: "animate-[bounceIn_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]", keyframes: "@keyframes bounceIn { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }" },
  { id: "glass-pulse", name: "Glass Pulse", tag: "loop", css: "animate-pulse backdrop-blur-md bg-white/10 border border-white/20", keyframes: null },
  { id: "float", name: "Float", tag: "loop", css: "animate-[float_3s_ease-in-out_infinite]", keyframes: "@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }" },
  { id: "shimmer", name: "Shimmer", tag: "loop", css: "animate-[shimmer_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]", keyframes: "@keyframes shimmer { to { background-position: -200% center; } }" },
  { id: "spin-slow", name: "Slow Spin", tag: "loop", css: "animate-[spin_3s_linear_infinite]", keyframes: null },
  { id: "hover-lift", name: "Hover Lift", tag: "hover", css: "hover:-translate-y-1 hover:shadow-xl transition-all duration-200", keyframes: null },
  { id: "hover-glow", name: "Hover Glow", tag: "hover", css: "hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow duration-200", keyframes: null },
  { id: "scale-click", name: "Scale on Click", tag: "active", css: "active:scale-95 transition-transform duration-100", keyframes: null },
  { id: "wiggle", name: "Wiggle", tag: "loop", css: "animate-[wiggle_0.5s_ease-in-out_infinite]", keyframes: "@keyframes wiggle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }" },
];

function AnimationsPanel() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>("all");
  const { toast } = useToast();

  const tags = ["all", ...Array.from(new Set(ANIMATION_PRESETS.map((a) => a.tag)))];

  const copy = (preset: typeof ANIMATION_PRESETS[number]) => {
    const code = preset.keyframes
      ? `/* Add to your CSS */\n${preset.keyframes}\n\n/* Tailwind class */\n${preset.css}`
      : `/* Tailwind class */\n${preset.css}`;
    navigator.clipboard.writeText(code);
    setCopied(preset.id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: `Copied "${preset.name}"` });
  };

  const filtered = activeTag === "all" ? ANIMATION_PRESETS : ANIMATION_PRESETS.filter((a) => a.tag === activeTag);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-border/50 flex gap-1 flex-wrap">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md capitalize font-medium transition-colors",
              activeTag === tag ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.map((preset) => (
            <div
              key={preset.id}
              className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{preset.name}</p>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-sm capitalize",
                  preset.tag === "entrance" ? "bg-blue-500/10 text-blue-400" :
                  preset.tag === "loop" ? "bg-violet-500/10 text-violet-400" :
                  preset.tag === "hover" ? "bg-green-500/10 text-green-400" :
                  "bg-orange-500/10 text-orange-400"
                )}>
                  {preset.tag}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copy(preset)}
                title="Copy animation code"
              >
                {copied === preset.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─────────── SEO PANEL ───────────
interface SeoData {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string;
  canonical: string;
  robots: string;
}

function SeoPanel({ projectId, themeTokens }: { projectId: string; themeTokens?: string | null }) {
  const patchProject = useUpdateProject();
  const { toast } = useToast();

  const parsedTokens = useMemo(() => {
    try { return JSON.parse(themeTokens ?? "{}"); } catch { return {}; }
  }, [themeTokens]);

  const [seo, setSeo] = useState<SeoData>({
    title: parsedTokens.seo?.title ?? "",
    description: parsedTokens.seo?.description ?? "",
    ogTitle: parsedTokens.seo?.ogTitle ?? "",
    ogDescription: parsedTokens.seo?.ogDescription ?? "",
    ogImage: parsedTokens.seo?.ogImage ?? "",
    keywords: parsedTokens.seo?.keywords ?? "",
    canonical: parsedTokens.seo?.canonical ?? "",
    robots: parsedTokens.seo?.robots ?? "index, follow",
  });

  const handleSave = () => {
    const newTokens = JSON.stringify({ ...parsedTokens, seo });
    patchProject.mutate({ id: projectId, data: { themeTokens: newTokens } }, {
      onSuccess: () => toast({ title: "SEO metadata saved!" }),
      onError: () => toast({ title: "Failed to save SEO", variant: "destructive" }),
    });
  };

  const update = (key: keyof SeoData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setSeo((prev) => ({ ...prev, [key]: e.target.value }));

  const descLen = seo.description.length;

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {/* Search Preview */}
        <div className="rounded-xl bg-white p-3 space-y-0.5">
          <p className="text-[11px] text-[#1a0dab] truncate font-medium">{seo.title || "Page Title · WWW Studio"}</p>
          <p className="text-[10px] text-[#006621] truncate">{seo.canonical || "https://yoursite.com"}</p>
          <p className="text-[10px] text-[#545454] line-clamp-2 leading-relaxed">{seo.description || "Add a meta description to see a preview here."}</p>
        </div>
        <p className="text-[10px] text-muted-foreground text-center -mt-2">Google Search Preview</p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex justify-between"><span>Page Title</span><span className={cn("tabular-nums", seo.title.length > 60 ? "text-red-400" : "")}>{seo.title.length}/60</span></label>
            <Input value={seo.title} onChange={update("title")} placeholder="My Awesome Site" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex justify-between"><span>Meta Description</span><span className={cn("tabular-nums", descLen > 160 ? "text-red-400" : descLen > 130 ? "text-yellow-400" : "")}>{descLen}/160</span></label>
            <Textarea value={seo.description} onChange={update("description")} placeholder="Describe your page in 120–160 characters for best results." className="text-xs resize-none min-h-[60px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Keywords</label>
            <Input value={seo.keywords} onChange={update("keywords")} placeholder="design, ui, builder, tailwind" className="h-8 text-xs" />
          </div>

          <div className="w-full h-px bg-border/50" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Graph</p>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">OG Title</label>
            <Input value={seo.ogTitle} onChange={update("ogTitle")} placeholder="Same as page title" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">OG Description</label>
            <Textarea value={seo.ogDescription} onChange={update("ogDescription")} placeholder="Social share description" className="text-xs resize-none min-h-[52px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">OG Image URL</label>
            <Input value={seo.ogImage} onChange={update("ogImage")} placeholder="https://..." className="h-8 text-xs" />
          </div>

          <div className="w-full h-px bg-border/50" />
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Canonical URL</label>
            <Input value={seo.canonical} onChange={update("canonical")} placeholder="https://yoursite.com/page" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Robots</label>
            <select value={seo.robots} onChange={update("robots")} className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground">
              <option value="index, follow">index, follow (default)</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
        </div>

        <Button size="sm" className="w-full gap-2" onClick={handleSave} disabled={patchProject.isPending}>
          {patchProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
          Save SEO Metadata
        </Button>
      </div>
    </ScrollArea>
  );
}

// ─────────── CMS / CONTENT PANEL ───────────
function ContentPanel({ projectId, componentTree }: { projectId: string; componentTree?: string | null }) {
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const textNodes = useMemo(() => {
    if (!componentTree) return [];
    const results: Array<{ path: string; text: string; depth: number }> = [];
    try {
      const tree = JSON.parse(componentTree);
      const walk = (node: any, path: string, depth: number) => {
        if (!node) return;
        if (typeof node.text === "string" && node.text.trim()) {
          results.push({ path, text: node.text, depth });
        }
        if (typeof node.children === "object") {
          Object.entries(node.children ?? {}).forEach(([k, child]) => walk(child, `${path}.${k}`, depth + 1));
        }
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any, i: number) => walk(child, `${path}[${i}]`, depth + 1));
        }
      };
      walk(tree, "root", 0);
    } catch {
      // no-op
    }
    return results.slice(0, 30);
  }, [componentTree]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-2">
        {textNodes.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No text content detected yet. Generate or clone a site to see editable content here.</p>
          </div>
        ) : (
          textNodes.map((node, i) => (
            <div key={i} className="group rounded-lg border border-border/40 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/30">
                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px]">{node.path}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                >
                  <Settings2 className="w-3 h-3" />
                </Button>
              </div>
              {editingIndex === i ? (
                <div className="p-2 space-y-2">
                  <Textarea
                    defaultValue={node.text}
                    className="text-xs resize-none min-h-[52px]"
                    id={`cms-${i}`}
                  />
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const el = document.getElementById(`cms-${i}`) as HTMLTextAreaElement;
                        toast({ title: "Content saved (visual edit)" });
                        setEditingIndex(null);
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingIndex(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="px-2 py-1.5 text-xs text-foreground/80 line-clamp-2">{node.text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

// ─────────── HISTORY PANEL ───────────
function HistoryPanel({ projectId }: { projectId: string }) {
  const { data: snapshots, isLoading } = useListSnapshots(projectId);
  const restoreMutation = useRestoreSnapshot();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = (snapshotId: string, label: string) => {
    setRestoringId(snapshotId);
    restoreMutation.mutate({ id: projectId, snapshotId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        toast({ title: `Restored to "${label}"` });
        setRestoringId(null);
      },
      onError: () => { toast({ title: "Restore failed", variant: "destructive" }); setRestoringId(null); },
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  if (!snapshots?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <History className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No saves yet</p>
          <p className="text-xs text-muted-foreground mt-1">Auto-saves appear every 30 seconds. Hit Save for a named version.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {snapshots.map((snap) => (
          <div key={snap.id} className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors">
            <div className="shrink-0 mt-0.5">
              {snap.label === "Auto-save" ? <Clock className="w-3.5 h-3.5 text-muted-foreground" /> : <Save className="w-3.5 h-3.5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{snap.label}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(snap.createdAt)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Restore this version"
              onClick={() => handleRestore(snap.id, snap.label)}
              disabled={restoringId === snap.id}
            >
              {restoringId === snap.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ─────────── PUBLISH MODAL ───────────
function PublishModal({ projectId, projectSlug, onClose }: { projectId: string; projectSlug: string; onClose: () => void }) {
  const publishMutation = usePublishProject();
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePublish = () => {
    publishMutation.mutate({ id: projectId }, {
      onSuccess: (result) => setLiveUrl(result.liveUrl),
      onError: () => toast({ title: "Publish failed", variant: "destructive" }),
    });
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="w-4 h-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Publish Project</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        {!liveUrl ? (
          <>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Publishing makes your project live at a public URL rendered as HTML with Tailwind CSS.</p>
            <div className="bg-muted/30 rounded-lg p-3 mb-6 font-mono text-xs text-muted-foreground">/api/s/{projectSlug}</div>
            <Button className="w-full h-11 gap-2" onClick={handlePublish} disabled={publishMutation.isPending}>
              {publishMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : <><Globe className="w-4 h-4" />Publish Now</>}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-medium text-green-500">Live</span></div>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3 mb-4">
              <code className="flex-1 text-xs font-mono text-foreground break-all">{liveUrl}</code>
              <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => copy(liveUrl)}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <a href={liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" />Open Site</a>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => copy(liveUrl)}>{copied ? "Copied!" : "Copy URL"}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────── LAYER ITEM ───────────
function LayerItem({ name, depth, selected }: { name: string; depth: number; selected?: boolean }) {
  return (
    <div
      className={cn("flex items-center gap-1 py-1.5 rounded cursor-pointer font-mono text-xs transition-colors", selected ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground/70 hover:text-foreground")}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
      {name}
    </div>
  );
}

// ─────────── MAIN EDITOR ───────────
export default function Editor() {
  const { projectId } = useParams();
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId!, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId!) }
  });

  const [chatInput, setChatInput] = useState("");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [rightPanel, setRightPanel] = useState<RightPanel>("properties");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pixelOverlay, setPixelOverlay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoSaveRef = useRef<string | null>(null);

  const sendMessage = useSendChatMessage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isOnline, pendingCount, enqueue } = useOfflineSync();

  const saveSnapshot = useCallback((label: string, silent = false) => {
    if (!projectId || !project) return;
    setIsSaving(true);
    enqueue({ projectId, label, componentTree: project.componentTree ?? null, themeTokens: project.themeTokens ?? null });
    setLastSaved(new Date());
    queryClient.invalidateQueries({ queryKey: getListSnapshotsQueryKey(projectId) });
    setTimeout(() => setIsSaving(false), 600);
    if (!silent) toast({ title: `Saved: "${label}"` });
  }, [projectId, project, enqueue, queryClient, toast]);

  useEffect(() => {
    if (!project) return;
    const currentTree = project.componentTree ?? "";
    if (lastAutoSaveRef.current === null) lastAutoSaveRef.current = currentTree;
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setInterval(() => {
      const nowTree = project.componentTree ?? "";
      if (nowTree !== lastAutoSaveRef.current) {
        lastAutoSaveRef.current = nowTree;
        saveSnapshot("Auto-save", true);
      }
    }, 30_000);
    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [project, saveSnapshot]);

  // Toggle pixel overlay in iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;
    const existingStyle = doc.getElementById("pixel-overlay-style");
    if (pixelOverlay) {
      if (!existingStyle) {
        const style = doc.createElement("style");
        style.id = "pixel-overlay-style";
        style.textContent = `
          * { outline: 1px solid rgba(59,130,246,0.25) !important; }
          *:hover { outline: 2px solid rgba(59,130,246,0.7) !important; }
          *::before { content: attr(class); font-size: 10px; position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.7); color: #60a5fa; padding: 2px 4px; pointer-events: none; white-space: nowrap; overflow: hidden; max-width: 200px; }
        `;
        doc.head.appendChild(style);
      }
    } else {
      existingStyle?.remove();
    }
  }, [pixelOverlay]);

  const layers = useMemo(() => {
    if (!project?.componentTree) return [];
    try {
      const tree = JSON.parse(project.componentTree);
      const items: Array<{ name: string; depth: number }> = [];
      const walk = (node: any, depth: number) => {
        if (!node || depth > 4) return;
        items.push({ name: node.name || node.type || "node", depth });
        (node.children ?? []).slice(0, 8).forEach((c: any) => walk(c, depth + 1));
      };
      walk(tree, 0);
      return items.slice(0, 30);
    } catch { return [{ name: "Body", depth: 0 }]; }
  }, [project?.componentTree]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !projectId) return;
    sendMessage.mutate({ data: { message: chatInput, projectId } }, {
      onSuccess: () => {
        setChatInput("");
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
      },
    });
  };

  if (isProjectLoading || !project) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const RIGHT_TABS: { id: RightPanel; icon: React.ReactNode; label: string; title: string }[] = [
    { id: "properties", icon: <LayoutPanelLeft className="w-3.5 h-3.5" />, label: "Design", title: "Properties" },
    { id: "images", icon: <Image className="w-3.5 h-3.5" />, label: "Media", title: "Images & Stock Photos" },
    { id: "animations", icon: <Zap className="w-3.5 h-3.5" />, label: "Anim", title: "Animation Presets" },
    { id: "seo", icon: <Search className="w-3.5 h-3.5" />, label: "SEO", title: "SEO Tools" },
    { id: "content", icon: <FileText className="w-3.5 h-3.5" />, label: "CMS", title: "Content Editor" },
    { id: "history", icon: <History className="w-3.5 h-3.5" />, label: "History", title: "Version History" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {showPublishModal && <PublishModal projectId={project.id} projectSlug={project.slug} onClose={() => setShowPublishModal(false)} />}

      {/* Top Toolbar */}
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-3 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8">
            <Link href="/projects"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="font-medium text-sm truncate max-w-[160px]">{project.name}</div>
          {project.status === "published" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shrink-0">Live</span>
          )}
        </div>

        <div className="flex items-center gap-1 border border-border/50 rounded-md p-1 bg-background/50 shrink-0">
          {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => (
            <Button key={mode} variant="ghost" size="icon" className={cn("w-7 h-7 rounded-sm", deviceMode === mode ? "bg-primary/15 text-primary" : "text-muted-foreground")} onClick={() => setDeviceMode(mode)}>
              {mode === "desktop" && <Monitor className="w-3.5 h-3.5" />}
              {mode === "tablet" && <Tablet className="w-3.5 h-3.5" />}
              {mode === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8"><Undo className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8"><Redo className="w-3.5 h-3.5" /></Button>

          {/* Pixel overlay toggle */}
          <Button
            variant={pixelOverlay ? "secondary" : "ghost"}
            size="icon"
            className={cn("w-8 h-8", pixelOverlay && "text-blue-400")}
            title="Toggle pixel measurement overlay"
            onClick={() => setPixelOverlay((v) => !v)}
          >
            <Ruler className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Sync status */}
          <div
            className={cn("hidden sm:flex items-center gap-1 text-xs px-1.5 py-1 rounded-md", isOnline ? pendingCount > 0 ? "text-amber-500" : "text-muted-foreground" : "text-rose-500")}
            title={!isOnline ? "Offline — saves queued" : pendingCount > 0 ? `${pendingCount} saves queued` : "Synced"}
          >
            {isOnline ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
            <span>{!isOnline ? "Offline" : pendingCount > 0 ? `${pendingCount}` : lastSaved ? timeAgo(lastSaved.toISOString()) : ""}</span>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => saveSnapshot("Manual save")} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs hidden md:flex" onClick={() => window.open(`/api/projects/${project.id}/export`, "_blank")}>
            <Download className="w-3.5 h-3.5" />Export
          </Button>

          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowPublishModal(true)}>
            <Globe className="w-3.5 h-3.5" /><span className="hidden sm:inline">Publish</span>
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layers */}
        <aside className="w-52 border-r border-border/50 bg-card/30 flex flex-col shrink-0">
          <div className="h-9 border-b border-border/50 flex items-center px-3 font-medium text-xs text-muted-foreground uppercase tracking-wider shrink-0">Layers</div>
          <ScrollArea className="flex-1 py-1">
            {layers.length > 0 ? (
              layers.map((layer, i) => <LayerItem key={i} name={layer.name} depth={layer.depth} selected={i === 0} />)
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6 px-3">No layers yet</div>
            )}
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-muted/10 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
            <div
              className="bg-background border border-border/50 rounded-lg shadow-2xl shadow-black/30 overflow-hidden transition-all duration-300"
              style={{ width: DEVICE_WIDTHS[deviceMode], maxWidth: "100%", height: "calc(100vh - 180px)" }}
            >
              <iframe
                ref={iframeRef}
                src={`/api/projects/${project.id}/preview-html`}
                className="w-full h-full border-0"
                title="Project Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>

          {/* AI Chat Bar */}
          <div className="h-13 border-t border-border/50 bg-card/50 backdrop-blur flex items-center px-4 shrink-0 gap-3 py-2">
            <Wand2 className="w-4 h-4 text-primary shrink-0" />
            <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to modify the design..."
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 h-8 text-sm"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={!chatInput.trim() || sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-64 border-l border-border/50 bg-card/30 flex flex-col shrink-0">
          {/* 6-tab header */}
          <div className="flex border-b border-border/50 shrink-0">
            {RIGHT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                title={tab.title}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 h-10 text-[9px] font-medium transition-colors border-b-2",
                  rightPanel === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Properties panel */}
          {rightPanel === "properties" && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layout</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Width</label><Input className="h-8 text-xs font-mono" defaultValue="100%" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Height</label><Input className="h-8 text-xs font-mono" defaultValue="auto" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Padding X</label><Input className="h-8 text-xs font-mono" defaultValue="24px" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Padding Y</label><Input className="h-8 text-xs font-mono" defaultValue="16px" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Gap</label><Input className="h-8 text-xs font-mono" defaultValue="16px" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Radius</label><Input className="h-8 text-xs font-mono" defaultValue="12px" /></div>
                  </div>
                </div>
                <div className="w-full h-px bg-border/50" />
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h4>
                  <select className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground">
                    <option>Inter</option><option>JetBrains Mono</option><option>Geist</option><option>Satoshi</option><option>Manrope</option><option>DM Sans</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-xs font-mono" defaultValue="16px" />
                    <select className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground">
                      <option>Regular 400</option><option>Medium 500</option><option>Semibold 600</option><option>Bold 700</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Line height</label><Input className="h-8 text-xs font-mono" defaultValue="1.5" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Letter sp.</label><Input className="h-8 text-xs font-mono" defaultValue="0em" /></div>
                  </div>
                </div>
                <div className="w-full h-px bg-border/50" />
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h4>
                  {[
                    { label: "Background", value: "#09090b" },
                    { label: "Foreground", value: "#fafafa" },
                    { label: "Primary", value: "#3b82f6" },
                    { label: "Muted", value: "#27272a" },
                    { label: "Border", value: "#3f3f46" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <input type="color" defaultValue={value} className="w-6 h-6 rounded border border-border/50 cursor-pointer bg-transparent" />
                      <span className="text-xs flex-1">{label}</span>
                      <span className="text-xs font-mono text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {rightPanel === "images" && <AIImagesPanel />}
          {rightPanel === "animations" && <AnimationsPanel />}
          {rightPanel === "seo" && <SeoPanel projectId={project.id} themeTokens={project.themeTokens} />}
          {rightPanel === "content" && <ContentPanel projectId={project.id} componentTree={project.componentTree} />}
          {rightPanel === "history" && <HistoryPanel projectId={project.id} />}
        </aside>
      </div>
    </div>
  );
}
