import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGetScenes } from "@workspace/api-client-react";
import {
  Search,
  Eye,
  Blocks,
  WandSparkles,
  Code2,
  Layers,
  ArrowRight,
  Sparkles,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AiChatWidget } from "@/components/AiChatWidget";
import { WEBSITE_TEMPLATES, TEMPLATE_CATEGORIES } from "@/data/aura-templates";
import type { WebsiteTemplateItem } from "@/data/aura-templates";
import { FloatingPreviewWindow } from "@/components/FloatingPreviewWindow";
import { useState, useEffect, useMemo } from "react";

const WELLNESS_COLORS = [
  "#7FB5A0",
  "#B39DC2",
  "#E8957A",
  "#87BBDB",
  "#F4C5A1",
  "#4A7C6B",
  "#C8D8E0",
];

function SceneShowcaseCard({ scene, href }: { scene: any; href?: string }) {
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  const dest = href ?? `/scenes/${scene.id}/share`;

  return (
    <Link href={dest} className="min-h-[44px] block">
      <div className="group relative h-36 rounded-2xl overflow-hidden cursor-pointer border border-border hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
        style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" }}>
        <svg viewBox={`0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}`} className="absolute inset-0 w-full h-full opacity-90">
          {elements.slice(0, 6).map((el: any) => {
            if (el.type === "circle") return <circle key={el.id} cx={el.x + el.width/2} cy={el.y + el.height/2} r={el.width/2} fill={el.fill} opacity={el.opacity ?? 0.7} />;
            if (el.type === "rect")   return <rect   key={el.id} x={el.x} y={el.y} width={el.width} height={el.height} rx={12} fill={el.fill} opacity={el.opacity ?? 0.7} />;
            return null;
          })}
        </svg>
        <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1.5">
            <Eye className="h-3 w-3" />Share
          </span>
        </div>
        <div className="absolute bottom-2 left-3">
          <p className="text-white/80 text-xs font-medium truncate max-w-[120px]">{scene.name}</p>
        </div>
      </div>
    </Link>
  );
}

function WebsiteTemplateCard({ item }: { item: WebsiteTemplateItem }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      {/* Main card container */}
      <div
        className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-border bg-muted hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
        onClick={() => setPreviewOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail placeholder — aura.build style */}
        <div className="w-full h-full bg-muted/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Click to Preview</p>
            <p className="text-xs text-muted-foreground max-w-[180px]">Load interactive template preview</p>
          </div>
        </div>

        {/* Remix button — shown on hover */}
        {isHovered && (
          <>
            <div className="absolute top-3 right-3 z-10">
              <Button variant="ghost" size="icon" asChild>
                <Link href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Copy className="h-4 w-4 text-white/70 hover:text-white" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Content below image */}
      <div className="mt-3">
        <h3 className="font-medium text-sm mb-1 line-clamp-1">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Floating preview window — kept intact */}
      <FloatingPreviewWindow
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        previewUrl={item.previewUrl}
        templateName={item.name}
      />
    </div>
  );
}

function WebsiteTemplatesSection() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return WEBSITE_TEMPLATES.filter(
      (t) =>
        (activeCategory === "All" || t.category === activeCategory) &&
        (!search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
    );
  }, [search, activeCategory]);

  if (WEBSITE_TEMPLATES.length === 0) return null;

  return (
    <section className="px-4 md:px-6 pb-16 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Website Templates</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {WEBSITE_TEMPLATES.length} full-site templates ready to preview — HTML/CSS/JS, Tailwind, GSAP, Three.js
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 min-h-[48px]"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No templates found for "{search}"</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* aura.build-style grid: grid-cols-2 lg:grid-cols-5 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 min-w-[540px] sm:min-w-0">
            {filtered.map((template) => (
              <WebsiteTemplateCard key={template.id} item={template} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { data: allScenes = [] }            = useGetScenes();
  const [publicScenes, setPublicScenes] = useState<any[]>([]);

  // Fetch public scenes for showcase
  useEffect(() => {
    apiFetch("/api/scenes/public?limit=6")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPublicScenes(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  const safeScenes = Array.isArray(allScenes) ? allScenes : [];
  const showcaseScenes = (Array.isArray(publicScenes) && publicScenes.length > 0) ? publicScenes : safeScenes.slice(0, 6);

  return (
    <div className="min-h-[100dvh] pb-safe flex flex-col overflow-x-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <main className="flex-1">
        {/* Hero — aura.build-inspired layout with www-studio identity */}
        <section className="px-4 py-12 sm:py-16 md:py-28 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 sm:mb-6">
            <WandSparkles className="w-3.5 h-3.5 shrink-0" />
            AI-Powered Visual Builder
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 leading-tight">
            Create beautiful designs.&nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              Instantly.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 sm:mb-12">
            Generate stunning website templates, UI components, and visual studies from AI prompts.
            Remix, preview, and export clean HTML/CSS/React code.
          </p>

          {/* Prompt input + AI agent selector (aura.build hero) */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative">
              <textarea
                placeholder="Describe your design — AI will generate HTML/CSS/React instantly..."
                className="w-full min-h-[120px] max-h-40 px-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                rows={3}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <select className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary">                  <option>GPT-5</option>
                  <option>Claude 4</option>
                </select>
                <Button size="sm" className="min-h-[44px]">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12">
            {/* Control bar — aura.build style (personal use version) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card/50 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Blocks className="h-3 w-3" />
                <span>WWW-Studio personal template collection</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <select className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>GPT-5</option>
                  <option>Claude 4</option>
                </select>
                <Button variant="ghost" size="sm" className="min-h-[44px]">
                  <Code2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="min-h-[44px]">
                  <Layers className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="min-h-[44px] hidden sm:inline-flex">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 md:px-6 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <Button variant="outline" className="min-h-[80px] flex-col gap-2">
              <Code2 className="h-6 w-6" />
              <span className="text-sm font-medium">Code</span>
            </Button>
            <Button variant="outline" className="min-h-[80px] flex-col gap-2">
              <Layers className="h-6 w-6" />
              <span className="text-sm font-medium">Components</span>
            </Button>
            <Button variant="outline" className="min-h-[80px] flex-col gap-2">
              <Blocks className="h-6 w-6" />
              <span className="text-sm font-medium">Templates</span>
            </Button>
            <Button variant="outline" className="min-h-[80px] flex-col gap-2">
              <ArrowRight className="h-6 w-6" />
              <span className="text-sm font-medium">Export</span>
            </Button>
          </div>
        </section>

        {/* Wellness Scenes Showcase */}
        {showcaseScenes.length > 0 && (
          <section className="px-4 md:px-6 pb-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Wellness Scenes
              </h2>
              <Button variant="ghost" size="sm" className="min-h-[44px]" asChild>
                <Link href="/scenes">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[640px] sm:min-w-0">
                {showcaseScenes.map((scene: any) => (
                  <SceneShowcaseCard key={scene.id} scene={scene} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AURA Website Templates — personal use */}\n        <WebsiteTemplatesSection />\n\n        {/* Footer — aura.build style, personal-use version */}\n        <footer className="px-4 md:px-6 py-12 border-t border-border bg-card/30 mt-16">\n          <div className="max-w-7xl mx-auto">\n            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">\n              <div>\n                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Product</h3>\n                <ul className="space-y-2 text-sm">\n                  <li><Link href="/editor/new" className="text-foreground hover:text-primary transition-colors">Create</Link></li>\n                  <li><Link href="/gallery" className="text-foreground hover:text-primary transition-colors">Templates</Link></li>\n                  <li><Link href="/ui-library" className="text-foreground hover:text-primary transition-colors">Components</Link></li>\n                  <li><Link href="/assets" className="text-foreground hover:text-primary transition-colors">Assets</Link></li>\n                </ul>\n              </div>\n              <div>\n                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Resources</h3>\n                <ul className="space-y-2 text-sm">\n                  <li><Link href="/skills" className="text-foreground hover:text-primary transition-colors">Skills</Link></li>\n                  <li><Link href="/design" className="text-foreground hover:text-primary transition-colors">Design</Link></li>\n                  <li><Link href="/learn" className="text-foreground hover:text-primary transition-colors">Learn</Link></li>\n                </ul>\n              </div>\n              <div>\n                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Company</h3>\n                <ul className="space-y-2 text-sm">\n                  <li><a href="https://github.com/sudo-prog" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">GitHub</a></li>\n                  <li><a href="https://twitter.com/sudo_prog" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">Twitter</a></li>\n                </ul>\n              </div>\n              <div className="col-span-2 md:col-span-1">\n                <div className="flex items-center gap-2 text-xs text-muted-foreground">\n                  <Blocks className="h-3 w-3" />\n                  <span>WWW-Studio — personal visual builder</span>\n                </div>\n              </div>\n            </div>\n            <div className="border-t border-border pt-4 text-xs text-muted-foreground">\n              Personal use template collection.\n            </div>\n          </div>\n        </footer>\n\n        {/* AI Chat Widget - www-studio unique feature */}\n        <AiChatWidget />\n      </main>\n    </div>
  );
}
