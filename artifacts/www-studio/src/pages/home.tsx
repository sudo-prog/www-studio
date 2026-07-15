import { apiFetch } from "@/lib/apiFetch";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useGetGalleryTemplates, useGetScenes } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Heart, Search, Eye, Blocks, WandSparkles, Code2, Layers, Globe,
  ArrowRight, Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AiChatWidget } from "@/components/AiChatWidget";
import { useState, useEffect } from "react";

const WELLNESS_COLORS = ["#7FB5A0","#B39DC2","#E8957A","#87BBDB","#F4C5A1","#4A7C6B","#C8D8E0"];

function SceneShowcaseCard({ scene, href }: { scene: any; href?: string }) {
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  const dest = href ?? `/scenes/${scene.id}/share`;

  return (
    <Link href={dest}>
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

export default function Home() {
  const { data: templates = [], isLoading } = useGetGalleryTemplates();
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const { data: allScenes = [] }            = useGetScenes();
  const [search, setSearch]   = useState("");
  const [, setLocation]       = useLocation();
  const [publicScenes, setPublicScenes] = useState<any[]>([]);

  // Fetch public scenes for showcase
  useEffect(() => {
    apiFetch("/api/scenes/public?limit=6")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPublicScenes(d.slice(0, 6)))
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-12 sm:py-16 md:py-28 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 sm:mb-6">
            <WandSparkles className="w-3.5 h-3.5 shrink-0" />
            AI-Powered Visual Builder
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Clone any website.{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Edit like magic.
            </span>{" "}
            Own the code.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-2xl leading-relaxed px-2">
            WWW Studio is the visual UI builder for developers. Paste a URL, describe your idea, or upload a screenshot — get an editable React + Tailwind codebase instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Button size="lg" className="h-12 px-8 text-base gap-2 w-full sm:w-auto justify-center" asChild>
              <Link href="/editor/new">
                <WandSparkles className="w-5 h-5" />Start Building
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2 w-full sm:w-auto justify-center" asChild>
              <Link href="/scenes">
                <Sparkles className="w-5 h-5" />Wellness Scenes
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-10 px-2">
            {[
              { icon: <Code2 className="w-3.5 h-3.5" />,       label: "Screenshot → Code"  },
              { icon: <WandSparkles className="w-3.5 h-3.5" />, label: "Generate from Prompt"},
              { icon: <Layers className="w-3.5 h-3.5" />,       label: "Export HTML + Tailwind"},
              { icon: <Blocks className="w-3.5 h-3.5" />,       label: "UI Library"          },
              { icon: <Sparkles className="w-3.5 h-3.5" />,     label: "AI Wellness Scenes"  },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-muted/50 border border-border/50 text-[10px] sm:text-xs text-muted-foreground">
                {icon}{label}
              </div>
            ))}
          </div>
        </section>

        {/* Scenes Showcase */}
        {showcaseScenes.length > 0 && (
          <section className="px-4 md:px-6 pb-16 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Wellness Scenes</h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">AI-generated SVG compositions with living animations — click to share</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                  <Link href="/scenes/gallery" className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" />Public Gallery
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/scenes" className="gap-1.5">
                    My Scenes<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Wellness colors + stats */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex gap-1.5">
                {WELLNESS_COLORS.map((c) => (
                  <div key={c} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/10 shrink-0" style={{ background: c }} />
                ))}
              </div>
              {publicScenes.length > 0 && (
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-green-400" />
                    {publicScenes.filter((s: any) => s.status === "published").length} published
                  </span>
                  <span>
                    ♥ {publicScenes.reduce((n: number, s: any) => n + (s.likes ?? 0), 0)} total likes
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {showcaseScenes.map((scene: any) => (
                <SceneShowcaseCard key={scene.id} scene={scene} />
              ))}
            </div>
          </section>
        )}

        {/* Templates Gallery */}
        <section className="px-4 md:px-6 pb-24 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Community Templates</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{safeTemplates.length} templates ready to fork</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="pl-9"
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
                      <Button variant="secondary" size="sm" asChild>
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
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
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
      </main>
      <AiChatWidget context="home/gallery page" onNavigate={setLocation} />
    </div>
  );
}
