import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useGetGalleryTemplates, useGetScenes } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Heart,
  Search,
  Eye,
  Blocks,
  WandSparkles,
  Code2,
  Layers,
  Globe,
  ArrowRight,
  Sparkles,
  User,
  Copy,
  RefreshCw,
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
        {/* Image thumbnail (aura.build: aspect-4/3) */}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={`${item.name} thumbnail`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Click to Preview</p>
              <p className="text-xs text-muted-foreground max-w-[180px]">Load interactive template preview</p>
            </div>
          </div>
        )}

        {/* PRO badge */}
        {item.isPro && (
          <div className="absolute top-3 left-3 z-10 flex h-6 items-center px-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            PRO
          </div>
        )}

        {/* Author avatar + name */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center space-x-2">
          {item.author ? (
            <>
              <img src={item.author.avatarUrl} alt={`${item.author.name} avatar`} className="h-8 w-8 rounded-full border border-white/20" />
              <span className="text-white/90 text-xs font-medium">{item.author.name}</span>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 rounded-full bg-muted text-muted-foreground" />
              <span className="text-white/90 text-xs font-medium">Aura Team</span>
            </div>
          )}
        </div>

        {/* Remix button + view count — shown on hover */}
        {isHovered && (
          <>
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-4 text-sm text-white/90">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" /> {item.viewCount?.toLocaleString() ?? "0"}
              </span>
              <span className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-1" /> {item.remixCount?.toLocaleString() ?? "0"}
              </span>
            </div>

            {/* Copy prompt button on hover */}
            <div className="absolute bottom-3 right-3 z-10">
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
  const { data: templates = [], isLoading } = useGetGalleryTemplates();
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const { data: allScenes = [] }            = useGetScenes();
  const [search, setSearch]       = useState("");
  const [, setLocation]           = useLocation();
  const [publicScenes, setPublicScenes] = useState<any[]>([]);

  // Fetch public scenes for showcase
  useEffect(() => {
    apiFetch("/api/scenes/public?limit=6")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPublicScenes(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  const filtered = safeTemplates.filter(
    (t) =>
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Describe your design — AI will generate HTML/CSS/React instantly..."
                className="w-full min-h-[120px] max-h-40 px-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                rows={3}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <select className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Gemini 3 Pro</option>
                  <option>GPT-5</option>
                  <option>Claude 4</option>
                </select>
                <Button size="sm" className="min-h-[44px]">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Blocks className="h-3 w-3" />
            <span>Trusted by 189,000+ designers and developers</span>
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

        {/* AURA Website Templates — full site templates */}
        <WebsiteTemplatesSection />

        {/* Community Templates Gallery */}
        <section className="px-4 md:px-6 pb-24 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Community Templates</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{safeTemplates.length} templates ready to fork</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="pl-9 min-h-[48px] min-w-[48px]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-[300px] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No templates found for "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((template) => (
                <Card key={template.id} className="overflow-hidden group border-muted bg-card hover:border-primary/50 transition-colors">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {template.thumbnailUrl ? (
                      <img src={template.thumbnailUrl} alt={template.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No Preview</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="min-h-[48px]" asChild>
                        <Link href={`/editor/new?templateId=${template.id}`}>
                          <Eye className="w-4 h-4 mr-2" />Fork Template
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">by {template.creator}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 min-h-[44px] py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                    <span className="capitalize">{template.style}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /><span>{template.likes}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* AI Chat Widget - www-studio unique feature */}
        <AiChatWidget />
      </main>
    </div>
  );
}
