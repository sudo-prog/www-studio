import { apiFetch } from "@/lib/apiFetch";
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
  Zap, Settings2, LayoutPanelLeft, Code2, Columns2, Eye,
  Pencil, CheckCheck, Upload, Trash2, Paintbrush, FolderOpen,
  MousePointer2, SquareDashedMousePointer,
} from "lucide-react";
import { Link } from "wouter";
import {
  useState, useRef, useEffect, useCallback, useMemo, useTransition,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { SortableLayers, type Layer } from "@/components/editor/SortableLayers";
import { parseHtmlLayers, reorderHtml } from "@/components/editor/layer-utils";
import { ThemeCustomizer } from "@/components/editor/ThemeCustomizer";
import { useProjectAssets } from "@/hooks/use-project-assets";
import { ElementInspector, type ElementInfo } from "@/components/editor/ElementInspector";
import { PageManager, type Page } from "@/components/editor/PageManager";
import { DesignPanel } from "@/components/editor/DesignPanel";

type DeviceMode = "desktop" | "tablet" | "mobile";
type ViewMode = "preview" | "split" | "code";
type RightPanel = "properties" | "design" | "theme" | "images" | "animations" | "seo" | "content" | "history";

const DEFAULT_PAGE_HTML = `<section class="min-h-screen bg-background flex items-center justify-center p-8"><div class="text-center space-y-4"><h1 class="text-4xl font-bold text-foreground">New Page</h1><p class="text-muted-foreground text-lg">Start building this page with AI or select an element to edit.</p></div></section>`;

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

// ─────────── ASSETS PANEL ───────────
function AssetsPanel({ projectId }: { projectId: string }) {
  const { assets, addAsset, removeAsset } = useProjectAssets(projectId);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !file.type.startsWith("font/")) {
          toast({ title: `Skipping "${file.name}" — only images, video, and fonts are supported`, variant: "destructive" });
          continue;
        }
        await addAsset(file);
      }
      toast({ title: `${files.length} asset${files.length > 1 ? "s" : ""} uploaded` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Asset URL copied!" });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Drop zone */}
      <div
        className={cn(
          "m-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-5 cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-xs font-medium">{uploading ? "Uploading…" : "Drop files here"}</p>
          <p className="text-[10px] text-muted-foreground">or click to browse</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.woff,.woff2,.ttf,.otf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Asset grid */}
      <ScrollArea className="flex-1">
        {assets.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No assets yet. Upload images or fonts to use in your design.</p>
          </div>
        ) : (
          <div className="p-2 grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative rounded-lg overflow-hidden border border-border/40 bg-muted/30 aspect-square">
                {asset.type.startsWith("image/") ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground text-center break-all line-clamp-2">{asset.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                  <p className="text-[9px] text-white/70 text-center truncate w-full px-1">{asset.name}</p>
                  <p className="text-[9px] text-white/50">{formatSize(asset.size)}</p>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-6 w-6"
                      onClick={() => copyUrl(asset.url)}
                      title="Copy URL"
                    >
                      {copied === asset.url ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-6 w-6"
                      onClick={() => removeAsset(asset.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
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
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();
  const seeds = PICSUM_SEEDS[category] ?? PICSUM_SEEDS.Abstract;
  const images = useMemo(() => seeds.map((seed) => ({
    url: `https://picsum.photos/seed/${seed}/400/300`,
    thumb: `https://picsum.photos/seed/${seed}/200/150`,
    id: String(seed),
  })), [seeds]);

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Image URL copied!" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-border/50">
        <div className="flex flex-wrap gap-1">
          {STOCK_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={cn("text-[10px] px-2 py-1 rounded-md font-medium transition-colors", category === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-2 p-2">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-lg overflow-hidden border border-border/40 aspect-video bg-muted">
              <img src={img.thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2 gap-1" onClick={() => copy(img.url)}>
                  {copied === img.url ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}Copy URL
                </Button>
                <Button size="sm" variant="secondary" className="h-6 w-6 p-0" asChild>
                  <a href={img.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-2.5 h-2.5" /></a>
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
function AIImagesPanel({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState<"generate" | "stock" | "assets">("generate");
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

  const TABS = [
    { id: "generate" as const, label: "AI Generate" },
    { id: "stock" as const, label: "Stock" },
    { id: "assets" as const, label: "Assets" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border/50 shrink-0">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn("flex-1 h-8 text-xs font-medium transition-colors border-b-2", activeTab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "generate" && (
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
                    <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
      )}
      {activeTab === "stock" && <StockImagesPanel />}
      {activeTab === "assets" && <AssetsPanel projectId={projectId} />}
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
          <button key={tag} onClick={() => setActiveTag(tag)} className={cn("text-[10px] px-2 py-1 rounded-md capitalize font-medium transition-colors", activeTag === tag ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
            {tag}
          </button>
        ))}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.map((preset) => (
            <div key={preset.id} className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{preset.name}</p>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-sm capitalize",
                  preset.tag === "entrance" ? "bg-blue-500/10 text-blue-400" :
                  preset.tag === "loop" ? "bg-violet-500/10 text-violet-400" :
                  preset.tag === "hover" ? "bg-green-500/10 text-green-400" :
                  "bg-orange-500/10 text-orange-400")}>
                  {preset.tag}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={() => copy(preset)} title="Copy animation code">
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
  title: string; description: string; ogTitle: string; ogDescription: string;
  ogImage: string; keywords: string; canonical: string; robots: string;
}

function SeoPanel({ projectId, themeTokens }: { projectId: string; themeTokens?: string | null }) {
  const patchProject = useUpdateProject();
  const { toast } = useToast();
  const parsedTokens = useMemo(() => { try { return JSON.parse(themeTokens ?? "{}"); } catch { return {}; } }, [themeTokens]);
  const [seo, setSeo] = useState<SeoData>({
    title: parsedTokens.seo?.title ?? "", description: parsedTokens.seo?.description ?? "",
    ogTitle: parsedTokens.seo?.ogTitle ?? "", ogDescription: parsedTokens.seo?.ogDescription ?? "",
    ogImage: parsedTokens.seo?.ogImage ?? "", keywords: parsedTokens.seo?.keywords ?? "",
    canonical: parsedTokens.seo?.canonical ?? "", robots: parsedTokens.seo?.robots ?? "index, follow",
  });
  const handleSave = () => {
    patchProject.mutate({ id: projectId, data: { themeTokens: JSON.stringify({ ...parsedTokens, seo }) } }, {
      onSuccess: () => toast({ title: "SEO metadata saved!" }),
      onError: () => toast({ title: "Failed to save SEO", variant: "destructive" }),
    });
  };
  const update = (key: keyof SeoData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setSeo((prev) => ({ ...prev, [key]: e.target.value }));
  const descLen = seo.description.length;

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
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
            <Textarea value={seo.description} onChange={update("description")} placeholder="Describe your page in 120–160 characters." className="text-xs resize-none min-h-[60px]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Keywords</label>
            <Input value={seo.keywords} onChange={update("keywords")} placeholder="design, ui, builder, tailwind" className="h-8 text-xs" />
          </div>
          <div className="w-full h-px bg-border/50" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Graph</p>
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">OG Title</label><Input value={seo.ogTitle} onChange={update("ogTitle")} placeholder="Same as page title" className="h-8 text-xs" /></div>
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">OG Description</label><Textarea value={seo.ogDescription} onChange={update("ogDescription")} placeholder="Social share description" className="text-xs resize-none min-h-[52px]" /></div>
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">OG Image URL</label><Input value={seo.ogImage} onChange={update("ogImage")} placeholder="https://..." className="h-8 text-xs" /></div>
          <div className="w-full h-px bg-border/50" />
          <div className="space-y-1.5"><label className="text-xs text-muted-foreground">Canonical URL</label><Input value={seo.canonical} onChange={update("canonical")} placeholder="https://yoursite.com/page" className="h-8 text-xs" /></div>
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
          {patchProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}Save SEO Metadata
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
    const results: Array<{ path: string; text: string }> = [];
    try {
      const doc = new DOMParser().parseFromString(componentTree, "text/html");
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      let idx = 0;
      while ((node = walker.nextNode()) && idx < 30) {
        const text = node.textContent?.trim() ?? "";
        if (text.length > 2) {
          const parent = (node.parentElement?.tagName ?? "").toLowerCase();
          results.push({ path: parent, text });
          idx++;
        }
      }
    } catch { /* no-op */ }
    return results;
  }, [componentTree]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-2">
        {textNodes.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No text content detected. Generate or clone a site first.</p>
          </div>
        ) : (
          textNodes.map((node, i) => (
            <div key={i} className="group rounded-lg border border-border/40 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/30">
                <span className="text-[10px] font-mono text-muted-foreground">&lt;{node.path}&gt;</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={() => setEditingIndex(editingIndex === i ? null : i)}>
                  <Settings2 className="w-3 h-3" />
                </Button>
              </div>
              {editingIndex === i ? (
                <div className="p-2 space-y-2">
                  <Textarea defaultValue={node.text} className="text-xs resize-none min-h-[52px]" id={`cms-${i}`} />
                  <div className="flex gap-1.5">
                    <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => { toast({ title: "Content updated" }); setEditingIndex(null); }}>Save</Button>
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
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><History className="w-5 h-5 text-muted-foreground" /></div>
        <div><p className="text-sm font-medium">No saves yet</p><p className="text-xs text-muted-foreground mt-1">Auto-saves every 30s. Hit Save for a named version.</p></div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {snapshots.map((snap) => (
          <div key={snap.id} className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors">
            <div className="shrink-0 mt-0.5">{snap.label === "Auto-save" ? <Clock className="w-3.5 h-3.5 text-muted-foreground" /> : <Save className="w-3.5 h-3.5 text-primary" />}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{snap.label}</p><p className="text-xs text-muted-foreground">{timeAgo(snap.createdAt)}</p></div>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" title="Restore" onClick={() => handleRestore(snap.id, snap.label)} disabled={restoringId === snap.id}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 m-4">
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

// ─────────── INLINE EDIT SCRIPT ───────────
const EDIT_MODE_INJECT = `
(function() {
  if (window.__editModeActive) return;
  window.__editModeActive = true;
  var style = document.createElement('style');
  style.id = 'edit-mode-style';
  style.textContent = \`
    [contenteditable="true"] {
      outline: 2px dashed rgba(59,130,246,0.6) !important;
      outline-offset: 2px;
      min-height: 1em;
      cursor: text;
      transition: outline-color 0.15s;
    }
    [contenteditable="true"]:hover { outline-color: rgba(59,130,246,1) !important; }
    [contenteditable="true"]:focus { outline-color: rgba(99,102,241,1) !important; background: rgba(59,130,246,0.04); }
  \`;
  document.head.appendChild(style);
  var TEXT_TAGS = ['P','H1','H2','H3','H4','H5','H6','SPAN','A','LI','BUTTON','LABEL','TD','TH','CAPTION','FIGCAPTION','BLOCKQUOTE'];
  document.querySelectorAll(TEXT_TAGS.join(',')).forEach(function(el) {
    if (!el.querySelector('img,video,iframe')) {
      el.setAttribute('contenteditable', 'true');
    }
  });
})();
`;

const EDIT_MODE_REMOVE = `
(function() {
  document.getElementById('edit-mode-style')?.remove();
  document.querySelectorAll('[contenteditable]').forEach(function(el) {
    el.removeAttribute('contenteditable');
  });
  window.__editModeActive = false;
})();
`;

// ─────────── SELECTION MODE SCRIPT ───────────
const SELECTION_INJECT = `
(function() {
  if (window.__wwwSelectActive) return;
  window.__wwwSelectActive = true;
  var style = document.createElement('style');
  style.id = 'www-select-style';
  style.textContent = '* { cursor: pointer !important; user-select: none !important; } [data-ws] { outline: 2.5px solid #3b82f6 !important; outline-offset: 2px !important; box-shadow: 0 0 0 5px rgba(59,130,246,0.12) !important; } body *:not([data-ws]):hover { outline: 1.5px dashed rgba(59,130,246,0.4) !important; outline-offset: 1px !important; }';
  document.head.appendChild(style);
  var sel = null;
  function rgb2hex(v) {
    if (!v) return '';
    var m = v.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!m) return v;
    return '#'+[m[1],m[2],m[3]].map(function(x){return(+x).toString(16).padStart(2,'0');}).join('');
  }
  document.addEventListener('click', function(e) {
    e.preventDefault(); e.stopPropagation();
    var el = e.target;
    if (el===document.body||el===document.documentElement) return;
    if (sel) sel.removeAttribute('data-ws');
    sel = el;
    el.setAttribute('data-ws','1');
    var c = window.getComputedStyle(el);
    var s = el.style;
    window.parent.postMessage({
      type: 'www-studio:selected',
      info: {
        tagName: el.tagName.toLowerCase(),
        id: el.id||'',
        className: typeof el.className==='string'?el.className:'',
        text: el.childElementCount===0?(el.textContent||'').trim().slice(0,60):'',
        styles: {
          width:s.width||'',height:s.height||'',maxWidth:s.maxWidth||'',minWidth:s.minWidth||'',
          paddingTop:s.paddingTop||c.paddingTop,paddingRight:s.paddingRight||c.paddingRight,
          paddingBottom:s.paddingBottom||c.paddingBottom,paddingLeft:s.paddingLeft||c.paddingLeft,
          marginTop:s.marginTop||c.marginTop,marginRight:s.marginRight||c.marginRight,
          marginBottom:s.marginBottom||c.marginBottom,marginLeft:s.marginLeft||c.marginLeft,
          fontSize:s.fontSize||c.fontSize,fontWeight:s.fontWeight||c.fontWeight,
          fontFamily:s.fontFamily||c.fontFamily,color:rgb2hex(s.color||c.color),
          textAlign:s.textAlign||c.textAlign,lineHeight:s.lineHeight||c.lineHeight,
          letterSpacing:s.letterSpacing||c.letterSpacing,
          textDecoration:s.textDecoration||c.textDecoration,
          textTransform:s.textTransform||c.textTransform,
          fontStyle:s.fontStyle||c.fontStyle,
          backgroundColor:rgb2hex(s.backgroundColor||c.backgroundColor),
          borderRadius:s.borderRadius||c.borderRadius,
          borderWidth:s.borderWidth||c.borderWidth,borderStyle:s.borderStyle||c.borderStyle,
          borderColor:rgb2hex(s.borderColor||c.borderColor),
          display:s.display||c.display,flexDirection:s.flexDirection||c.flexDirection,
          justifyContent:s.justifyContent||c.justifyContent,alignItems:s.alignItems||c.alignItems,
          flexWrap:s.flexWrap||c.flexWrap,gap:s.gap||c.gap,
          gridTemplateColumns:s.gridTemplateColumns||c.gridTemplateColumns,
          opacity:s.opacity||c.opacity,
          boxShadow:s.boxShadow||(c.boxShadow!=='none'?c.boxShadow:''),
          position:s.position||c.position,overflow:s.overflow||c.overflow,
          href:el.tagName==='A'?(el.getAttribute('href')||''):'',
          target:el.tagName==='A'?(el.getAttribute('target')||''):'',
        }
      }
    }, '*');
  }, true);
  window.addEventListener('message', function(e) {
    var d = e.data;
    if (!d||!d.type) return;
    if (d.type==='www-studio:style'&&sel) { sel.style[d.prop]=d.val; }
    if (d.type==='www-studio:link'&&sel) {
      var el=sel;
      if (el.tagName!=='A') {
        var a=document.createElement('a');
        el.parentNode.insertBefore(a,el);a.appendChild(el);
        el.removeAttribute('data-ws');a.setAttribute('data-ws','1');sel=a;
      }
      sel.href=d.href||'#';
      if(d.target)sel.target=d.target;else sel.removeAttribute('target');
    }
    if (d.type==='www-studio:removelink'&&sel&&sel.tagName==='A') {
      var p=sel.parentNode;
      while(sel.firstChild)p.insertBefore(sel.firstChild,sel);
      p.removeChild(sel);sel=null;
    }
    if (d.type==='www-studio:deselect'){if(sel){sel.removeAttribute('data-ws');sel=null;}}
    if (d.type==='www-studio:select-off'){
      document.getElementById('www-select-style')?.remove();
      if(sel){sel.removeAttribute('data-ws');sel=null;}
      window.__wwwSelectActive=false;
    }
  });
})();
`;

// ─────────── MAIN EDITOR ───────────
export default function Editor() {
  const { projectId } = useParams();
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId!, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId!) }
  });

  const [chatInput, setChatInput] = useState("");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [rightPanel, setRightPanel] = useState<RightPanel>("theme");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pixelOverlay, setPixelOverlay] = useState(false);

  // Inline edit mode
  const [editMode, setEditMode] = useState(false);
  const [editModeDirty, setEditModeDirty] = useState(false);

  // Element selection + inspector
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [canvasDirty, setCanvasDirty] = useState(false);

  // Multi-page
  const [currentPageId, setCurrentPageId] = useState("home");

  // Code / split view
  const [localCode, setLocalCode] = useState<string>("");
  const [codeDirty, setCodeDirty] = useState(false);
  const [isFetchingCode, setIsFetchingCode] = useState(false);

  // Layers
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const codeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoSaveRef = useRef<string | null>(null);
  const iframeKey = useRef(0);

  const sendMessage = useSendChatMessage();
  const updateProject = useUpdateProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isOnline, pendingCount, enqueue } = useOfflineSync();

  // Parse layers from componentTree HTML
  useEffect(() => {
    if (project?.componentTree) {
      setLayers(parseHtmlLayers(project.componentTree));
    }
  }, [project?.componentTree]);

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

  // postMessage listener: element selection from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "www-studio:selected") {
        setSelectedElement(e.data.info as ElementInfo);
        setRightPanel("properties");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Pixel overlay injection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;
    const existing = doc.getElementById("pixel-overlay-style");
    if (pixelOverlay) {
      if (!existing) {
        const style = doc.createElement("style");
        style.id = "pixel-overlay-style";
        style.textContent = `* { outline: 1px solid rgba(59,130,246,0.25) !important; } *:hover { outline: 2px solid rgba(59,130,246,0.7) !important; }`;
        doc.head?.appendChild(style);
      }
    } else {
      existing?.remove();
    }
  }, [pixelOverlay]);

  // Enter / exit edit mode
  const toggleEditMode = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) {
      toast({ title: "Preview must be loaded first", variant: "destructive" });
      return;
    }
    if (editMode) {
      // Exit: remove contenteditable
      try {
        const doc = iframe.contentDocument;
        const script = doc.createElement("script");
        script.textContent = EDIT_MODE_REMOVE;
        doc.body?.appendChild(script);
        script.remove();
      } catch { /* cross-origin safety */ }
      setEditMode(false);
      setEditModeDirty(false);
    } else {
      // Enter: inject contenteditable
      try {
        const doc = iframe.contentDocument;
        const script = doc.createElement("script");
        script.textContent = EDIT_MODE_INJECT;
        doc.body?.appendChild(script);
        script.remove();
        setEditMode(true);
        setEditModeDirty(false);
        // Mark dirty on any input inside iframe
        const markDirty = () => setEditModeDirty(true);
        doc.addEventListener("input", markDirty, { once: true });
      } catch {
        toast({ title: "Could not enable edit mode", variant: "destructive" });
      }
    }
  }, [editMode, toast]);

  // Apply inline edits: scrape modified HTML and save
  const applyInlineEdits = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !projectId) return;
    try {
      const body = iframe.contentDocument.body;
      // Remove editor artifacts before saving
      body.querySelector("#edit-mode-style")?.remove();
      body.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
      const newHtml = body.innerHTML;
      updateProject.mutate({ id: projectId, data: { componentTree: newHtml } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
          toast({ title: "Inline edits applied!" });
          setEditMode(false);
          setEditModeDirty(false);
        },
        onError: () => toast({ title: "Failed to apply edits", variant: "destructive" }),
      });
    } catch {
      toast({ title: "Could not read iframe content", variant: "destructive" });
    }
  }, [projectId, updateProject, queryClient, toast]);

  // Enter code / split view
  const enterCodeView = useCallback(async (mode: "split" | "code") => {
    if (localCode && viewMode !== "preview") {
      setViewMode(mode);
      return;
    }
    setIsFetchingCode(true);
    try {
      const res = await apiFetch(`/api/projects/${projectId}/preview-html`);
      const html = await res.text();
      setLocalCode(html);
      setCodeDirty(false);
    } catch {
      setLocalCode(project?.componentTree ?? "<!-- No content yet -->");
    } finally {
      setIsFetchingCode(false);
    }
    setViewMode(mode);
  }, [localCode, viewMode, projectId, project?.componentTree]);

  const handleViewMode = (mode: ViewMode) => {
    if (mode === "preview") {
      setViewMode("preview");
    } else {
      enterCodeView(mode);
    }
  };

  // Debounced code → live preview (update iframe srcdoc)
  const handleCodeChange = (value: string) => {
    setLocalCode(value);
    setCodeDirty(true);
  };

  // Save code edits to project
  const saveCodeEdits = () => {
    if (!projectId || !localCode) return;
    // Extract body content from full HTML
    let bodyContent = localCode;
    try {
      const doc = new DOMParser().parseFromString(localCode, "text/html");
      bodyContent = doc.body.innerHTML || localCode;
    } catch { /* use raw */ }
    updateProject.mutate({ id: projectId, data: { componentTree: bodyContent } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
        toast({ title: "Code changes saved!" });
        setCodeDirty(false);
      },
      onError: () => toast({ title: "Failed to save code", variant: "destructive" }),
    });
  };

  // ── Selection mode ─────────────────────────────────────────────────
  const toggleSelectionMode = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) {
      toast({ title: "Preview must be loaded first", variant: "destructive" });
      return;
    }
    if (selectionMode) {
      iframe.contentWindow?.postMessage({ type: "www-studio:select-off" }, "*");
      setSelectionMode(false);
      setSelectedElement(null);
      setCanvasDirty(false);
    } else {
      // Turn off edit mode if active
      if (editMode) {
        try {
          const doc = iframe.contentDocument;
          const s = doc.createElement("script");
          s.textContent = EDIT_MODE_REMOVE;
          doc.body?.appendChild(s); s.remove();
        } catch { /* cross-origin */ }
        setEditMode(false); setEditModeDirty(false);
      }
      try {
        const doc = iframe.contentDocument;
        const script = doc.createElement("script");
        script.textContent = SELECTION_INJECT;
        doc.body?.appendChild(script); script.remove();
        setSelectionMode(true);
      } catch {
        toast({ title: "Could not enable selection mode", variant: "destructive" });
      }
    }
  }, [selectionMode, editMode, toast]);

  const applyElementStyle = useCallback((property: string, value: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: "www-studio:style", prop: property, val: value }, "*");
    setSelectedElement((prev) => prev ? { ...prev, styles: { ...prev.styles, [property]: value } } : null);
    setCanvasDirty(true);
  }, []);

  const applyElementLink = useCallback((href: string, target: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: "www-studio:link", href, target }, "*");
    setSelectedElement((prev) => prev ? { ...prev, styles: { ...prev.styles, href, target } } : null);
    setCanvasDirty(true);
  }, []);

  const removeElementLink = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "www-studio:removelink" }, "*");
    setSelectedElement((prev) => prev ? { ...prev, styles: { ...prev.styles, href: "", target: "" } } : null);
    setCanvasDirty(true);
  }, []);

  const saveCanvasChanges = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !projectId) return;
    try {
      const body = iframe.contentDocument.body;
      body.querySelector("#www-select-style")?.remove();
      body.querySelectorAll("[data-ws]").forEach((el) => el.removeAttribute("data-ws"));
      const newHtml = body.innerHTML;

      if (currentPageId === "home") {
        updateProject.mutate({ id: projectId, data: { componentTree: newHtml } }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
            toast({ title: "Changes saved!" });
            setCanvasDirty(false);
          },
          onError: () => toast({ title: "Failed to save", variant: "destructive" }),
        });
      } else {
        // Save to themeTokens.pageHtml[currentPageId]
        let tokens: Record<string, unknown> = {};
        try { tokens = JSON.parse(project?.themeTokens ?? "{}"); } catch { /* */ }
        const newTokens = JSON.stringify({ ...tokens, pageHtml: { ...(tokens.pageHtml as Record<string, string> ?? {}), [currentPageId]: newHtml } });
        updateProject.mutate({ id: projectId, data: { themeTokens: newTokens } }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
            toast({ title: "Changes saved!" });
            setCanvasDirty(false);
          },
          onError: () => toast({ title: "Failed to save", variant: "destructive" }),
        });
      }
    } catch {
      toast({ title: "Could not read iframe content", variant: "destructive" });
    }
  }, [projectId, currentPageId, project?.themeTokens, updateProject, queryClient, toast]);

  // ── Page management ───────────────────────────────────────────────
  const handleAddPage = useCallback(() => {
    if (!projectId) return;
    let tokens: Record<string, unknown> = {};
    try { tokens = JSON.parse(project?.themeTokens ?? "{}"); } catch { /* */ }
    const existingPages = (tokens.pages as Page[] ?? []);
    const newId = `page-${Date.now()}`;
    const newPage: Page = { id: newId, name: `Page ${existingPages.length + 2}`, slug: `/page-${existingPages.length + 2}` };
    const newTokens = JSON.stringify({
      ...tokens,
      pages: [...existingPages, newPage],
      pageHtml: { ...(tokens.pageHtml as Record<string, string> ?? {}), [newId]: DEFAULT_PAGE_HTML },
    });
    updateProject.mutate({ id: projectId, data: { themeTokens: newTokens } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
        setCurrentPageId(newId);
        toast({ title: `"${newPage.name}" added` });
      },
    });
  }, [projectId, project?.themeTokens, updateProject, queryClient, toast]);

  const handleDeletePage = useCallback((pageId: string) => {
    if (!projectId || pageId === "home") return;
    let tokens: Record<string, unknown> = {};
    try { tokens = JSON.parse(project?.themeTokens ?? "{}"); } catch { /* */ }
    const existingPages = (tokens.pages as Page[] ?? []).filter((p) => p.id !== pageId);
    const pageHtml = { ...(tokens.pageHtml as Record<string, string> ?? {}) };
    delete pageHtml[pageId];
    const newTokens = JSON.stringify({ ...tokens, pages: existingPages, pageHtml });
    updateProject.mutate({ id: projectId, data: { themeTokens: newTokens } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
        if (currentPageId === pageId) setCurrentPageId("home");
        toast({ title: "Page deleted" });
      },
    });
  }, [projectId, project?.themeTokens, currentPageId, updateProject, queryClient, toast]);

  const handleRenamePage = useCallback((pageId: string, name: string) => {
    if (!projectId || pageId === "home") return;
    let tokens: Record<string, unknown> = {};
    try { tokens = JSON.parse(project?.themeTokens ?? "{}"); } catch { /* */ }
    const pages = (tokens.pages as Page[] ?? []).map((p) => p.id === pageId ? { ...p, name } : p);
    updateProject.mutate({ id: projectId, data: { themeTokens: JSON.stringify({ ...tokens, pages }) } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) }),
    });
  }, [projectId, project?.themeTokens, updateProject, queryClient]);

  // Layers reorder
  const handleLayerReorder = useCallback((newLayers: Layer[]) => {
    if (!projectId || !project?.componentTree) return;
    const newHtml = reorderHtml(project.componentTree, newLayers);
    setLayers(newLayers);
    updateProject.mutate({ id: projectId, data: { componentTree: newHtml } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId!) });
        // Reload iframe
        iframeKey.current += 1;
      },
      onError: () => toast({ title: "Failed to reorder layers", variant: "destructive" }),
    });
  }, [projectId, project?.componentTree, updateProject, queryClient, toast]);

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

  // ── Derived: pages + current page HTML (hooks must be before early return) ──
  const pages: Page[] = useMemo(() => {
    const home: Page[] = [{ id: "home", name: "Home", slug: "/", isHome: true }];
    try {
      const tokens = JSON.parse(project?.themeTokens ?? "{}");
      return [...home, ...(tokens.pages ?? [])];
    } catch { return home; }
  }, [project?.themeTokens]);

  const currentPageHtml = useMemo(() => {
    if (currentPageId === "home") return null;
    try {
      const tokens = JSON.parse(project?.themeTokens ?? "{}");
      return (tokens.pageHtml as Record<string, string>)?.[currentPageId] ?? DEFAULT_PAGE_HTML;
    } catch { return DEFAULT_PAGE_HTML; }
  }, [currentPageId, project?.themeTokens]);

  if (isProjectLoading || !project) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const RIGHT_TABS: { id: RightPanel; icon: React.ReactNode; label: string; title: string }[] = [
    { id: "properties", icon: <MousePointer2 className="w-3.5 h-3.5" />, label: "Select", title: "Element Inspector" },
    { id: "design", icon: <Sparkles className="w-3.5 h-3.5" />, label: "Design", title: "Design.md — AI Style Guide" },
    { id: "theme", icon: <Paintbrush className="w-3.5 h-3.5" />, label: "Theme", title: "Theme Customizer" },
    { id: "images", icon: <Image className="w-3.5 h-3.5" />, label: "Media", title: "Images & Assets" },
    { id: "animations", icon: <Zap className="w-3.5 h-3.5" />, label: "Anim", title: "Animation Presets" },
    { id: "seo", icon: <Search className="w-3.5 h-3.5" />, label: "SEO", title: "SEO Tools" },
    { id: "content", icon: <FileText className="w-3.5 h-3.5" />, label: "CMS", title: "Content Editor" },
    { id: "history", icon: <History className="w-3.5 h-3.5" />, label: "History", title: "Version History" },
  ];

  const VIEW_MODES: { id: ViewMode; icon: React.ReactNode; title: string }[] = [
    { id: "preview", icon: <Eye className="w-3.5 h-3.5" />, title: "Preview" },
    { id: "split", icon: <Columns2 className="w-3.5 h-3.5" />, title: "Split View" },
    { id: "code", icon: <Code2 className="w-3.5 h-3.5" />, title: "Code View" },
  ];

  // The iframe in srcdoc mode (code/split view or non-home page)
  const usesSrcdoc = (viewMode !== "preview" && localCode.length > 0) || currentPageId !== "home";
  const iframeSrcDoc = currentPageId !== "home" ? (currentPageHtml ?? DEFAULT_PAGE_HTML) : localCode;

  return (
    <div className="h-screen w-screen max-w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {showPublishModal && <PublishModal projectId={project.id} projectSlug={project.slug} onClose={() => setShowPublishModal(false)} />}

      {/* Mobile notice */}
      <div className="lg:hidden flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 text-xs shrink-0">
        <Monitor className="w-3.5 h-3.5 shrink-0" />
        <span>Editor is best experienced on desktop</span>
      </div>

      {/* Top Toolbar */}
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-3 shrink-0 gap-2 overflow-x-auto">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8">
            <Link href="/projects"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <Link href="/" className="shrink-0 flex items-center gap-1.5 font-semibold text-sm tracking-tight hover:text-primary transition-colors">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">WWW Studio</span>
          </Link>
          <div className="font-medium text-sm truncate max-w-[140px]">{project.name}</div>
          {project.status === "published" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shrink-0">Live</span>
          )}
        </div>

        {/* Center: device + view modes — secondary on mobile, scroll/hidden there */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {/* Device toggle */}
          <div className="flex items-center gap-0.5 border border-border/50 rounded-md p-0.5 bg-background/50">
            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => (
              <Button key={mode} variant="ghost" size="icon" className={cn("w-7 h-7 rounded-sm", deviceMode === mode ? "bg-primary/15 text-primary" : "text-muted-foreground")} onClick={() => setDeviceMode(mode)}>
                {mode === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                {mode === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                {mode === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
              </Button>
            ))}
          </div>

          <div className="w-px h-5 bg-border" />

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 border border-border/50 rounded-md p-0.5 bg-background/50">
            {VIEW_MODES.map(({ id, icon, title }) => (
              <Button
                key={id}
                variant="ghost"
                size="icon"
                title={title}
                disabled={isFetchingCode}
                className={cn("w-7 h-7 rounded-sm", viewMode === id ? "bg-primary/15 text-primary" : "text-muted-foreground")}
                onClick={() => handleViewMode(id)}
              >
                {isFetchingCode && id !== "preview" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Selection mode toggle */}
          <Button
            variant={selectionMode ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-8 gap-1.5 text-xs", selectionMode ? "text-violet-400 border border-violet-400/30" : "text-muted-foreground")}
            title="Click to select elements and edit properties"
            onClick={toggleSelectionMode}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{selectionMode ? "Selecting" : "Select"}</span>
          </Button>

          {/* Save canvas changes (selection mode) */}
          {selectionMode && canvasDirty && (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-violet-600 hover:bg-violet-700"
              onClick={saveCanvasChanges}
              disabled={updateProject.isPending}
            >
              {updateProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Save
            </Button>
          )}

          {/* Edit mode toggle */}
          <Button
            variant={editMode ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-8 gap-1.5 text-xs", editMode ? "text-blue-400 border border-blue-400/30" : "text-muted-foreground")}
            title="Toggle inline canvas editing"
            onClick={toggleEditMode}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{editMode ? "Editing" : "Edit"}</span>
          </Button>

          {/* Apply inline edits */}
          {editMode && editModeDirty && (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={applyInlineEdits}
              disabled={updateProject.isPending}
            >
              {updateProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Apply
            </Button>
          )}

          {/* Save code edits */}
          {viewMode !== "preview" && codeDirty && (
            <Button size="sm" className="h-8 gap-1.5 text-xs bg-green-600 hover:bg-green-700" onClick={saveCodeEdits} disabled={updateProject.isPending}>
              {updateProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Code
            </Button>
          )}

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Pixel overlay */}
          <Button
            variant={pixelOverlay ? "secondary" : "ghost"}
            size="icon"
            className={cn("w-8 h-8", pixelOverlay && "text-blue-400")}
            title="Toggle pixel overlay"
            onClick={() => setPixelOverlay((v) => !v)}
          >
            <Ruler className="w-3.5 h-3.5" />
          </Button>

          {/* Undo / Redo */}
          <Button variant="ghost" size="icon" className="w-8 h-8"><Undo className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8"><Redo className="w-3.5 h-3.5" /></Button>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Sync */}
          <div className={cn("hidden sm:flex items-center gap-1 text-xs px-1.5 py-1 rounded-md", isOnline ? pendingCount > 0 ? "text-amber-500" : "text-muted-foreground" : "text-rose-500")} title={!isOnline ? "Offline" : pendingCount > 0 ? `${pendingCount} queued` : "Synced"}>
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

        {/* Left Sidebar — Pages + Layers */}
        <aside className="w-52 border-r border-border/50 bg-card/30 flex flex-col shrink-0">
          <PageManager
            pages={pages}
            currentPageId={currentPageId}
            onSelect={(id) => {
              setCurrentPageId(id);
              setSelectedElement(null);
              setCanvasDirty(false);
            }}
            onAdd={handleAddPage}
            onDelete={handleDeletePage}
            onRename={handleRenamePage}
          />
          <div className="h-8 border-b border-border/50 flex items-center justify-between px-3 shrink-0">
            <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Layers</span>
            <span className="text-[10px] text-muted-foreground/50">drag to reorder</span>
          </div>
          <ScrollArea className="flex-1 px-1 py-1">
            <SortableLayers
              layers={layers}
              selectedId={selectedLayerId}
              onSelect={setSelectedLayerId}
              onReorder={handleLayerReorder}
            />
          </ScrollArea>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-muted/10 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex overflow-hidden">

            {/* Code pane (split or code-only) */}
            {viewMode !== "preview" && (
              <div className={cn("flex flex-col border-r border-border/50 bg-[#0d1117] overflow-hidden", viewMode === "code" ? "flex-1" : "w-1/2")}>
                <div className="h-8 flex items-center justify-between px-3 border-b border-border/20 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground">HTML / Tailwind</span>
                  {codeDirty && <span className="text-[10px] text-amber-400 font-mono">● unsaved</span>}
                </div>
                <textarea
                  value={localCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  spellCheck={false}
                  className="flex-1 resize-none bg-transparent text-[12px] font-mono text-slate-300 p-3 focus:outline-none leading-relaxed"
                  placeholder="<!-- HTML + Tailwind code appears here -->"
                  style={{ tabSize: 2 }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const newVal = localCode.substring(0, start) + "  " + localCode.substring(end);
                      setLocalCode(newVal);
                      setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2; }, 0);
                    }
                  }}
                />
              </div>
            )}

            {/* Preview pane */}
            {viewMode !== "code" && (
              <div className={cn("flex flex-col overflow-hidden", viewMode === "split" ? "w-1/2" : "flex-1")}>
                <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
                  <div
                    className={cn(
                      "bg-background border border-border/50 rounded-lg shadow-2xl shadow-black/30 overflow-hidden transition-all duration-300",
                      editMode && "ring-2 ring-blue-500/40"
                    )}
                    style={{ width: DEVICE_WIDTHS[deviceMode], maxWidth: "100%", height: "calc(100vh - 210px)" }}
                  >
                    {usesSrcdoc ? (
                      <iframe
                        key={`srcdoc-${currentPageId}`}
                        ref={iframeRef}
                        srcDoc={iframeSrcDoc}
                        className="w-full h-full border-0"
                        title="Project Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <iframe
                        key={iframeKey.current}
                        ref={iframeRef}
                        src={`/api/projects/${project.id}/preview-html`}
                        className="w-full h-full border-0"
                        title="Project Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    )}
                  </div>
                </div>

                {/* AI Chat Bar */}
                <div className="h-13 border-t border-border/50 bg-card/50 backdrop-blur flex items-center px-4 shrink-0 gap-3 py-2">
                  <Wand2 className="w-4 h-4 text-primary shrink-0" />
                  <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={editMode ? "Exit edit mode to use AI chat…" : "Ask AI to modify the design…"}
                      disabled={editMode}
                      className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 h-8 text-sm disabled:opacity-40"
                    />
                    <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={!chatInput.trim() || sendMessage.isPending || editMode}>
                      {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-64 border-l border-border/50 bg-card/30 flex flex-col shrink-0">
          {/* Tab header */}
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

          {rightPanel === "properties" && (
            selectedElement ? (
              <ElementInspector
                element={selectedElement}
                pages={pages}
                onStyleChange={applyElementStyle}
                onLinkChange={applyElementLink}
                onRemoveLink={removeElementLink}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <MousePointer2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Select an element</p>
                  <p className="text-xs text-muted-foreground">Click <span className="font-mono text-violet-400">Select</span> in the toolbar, then click any element on the canvas to edit its properties.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 mt-2 text-xs" onClick={toggleSelectionMode}>
                  <MousePointer2 className="w-3.5 h-3.5" />
                  {selectionMode ? "Selection active" : "Enable selection"}
                </Button>
              </div>
            )
          )}
          {rightPanel === "design" && (
            <DesignPanel
              projectId={project.id}
              themeTokens={project.themeTokens}
              iframeRef={iframeRef}
            />
          )}
          {rightPanel === "theme" && (
            <ThemeCustomizer
              projectId={project.id}
              themeTokens={project.themeTokens}
              iframeRef={iframeRef}
            />
          )}
          {rightPanel === "images" && <AIImagesPanel projectId={project.id} />}
          {rightPanel === "animations" && <AnimationsPanel />}
          {rightPanel === "seo" && <SeoPanel projectId={project.id} themeTokens={project.themeTokens} />}
          {rightPanel === "content" && <ContentPanel projectId={project.id} componentTree={project.componentTree} />}
          {rightPanel === "history" && <HistoryPanel projectId={project.id} />}
        </aside>
      </div>
    </div>
  );
}
