import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COMPONENT_LIBRARY, CATEGORIES, makePreviewHtml, type Category } from "@/data/component-library";
import { Search, Copy, Check, Code2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AiChatWidget } from "@/components/AiChatWidget";
import { useLocation } from "wouter";

function ComponentCard({ item }: { item: typeof COMPONENT_LIBRARY[number] }) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");
  const { toast } = useToast();

  const copy = () => {
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Code copied!" });
  };

  const previewSrc = useMemo(
    () => `data:text/html;charset=utf-8,${encodeURIComponent(makePreviewHtml(item.code))}`,
    [item.code]
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition-colors">
      {/* Preview / Code area */}
      <div className="relative bg-zinc-950 h-44 overflow-hidden">
        {view === "preview" ? (
          <iframe
            src={previewSrc}
            className="w-full h-full border-0 pointer-events-none"
            title={item.name}
            sandbox="allow-scripts"
          />
        ) : (
          <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto h-full leading-relaxed whitespace-pre-wrap break-words">
            {item.code}
          </pre>
        )}

        {/* Action overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs gap-1"
            onClick={() => setView(view === "preview" ? "code" : "preview")}
          >
            {view === "preview" ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {view === "preview" ? "Code" : "Preview"}
          </Button>
          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={copy}>
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 shrink-0" onClick={copy}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </Button>
      </div>
    </div>
  );
}

export default function Components() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [, setLocation] = useLocation();

  const filtered = useMemo(() => {
    let items = COMPONENT_LIBRARY;
    if (activeCategory !== "All") items = items.filter((c) => c.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) => c.name.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q)) || c.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeCategory]);

  const countByCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, c === "All" ? COMPONENT_LIBRARY.length : COMPONENT_LIBRARY.filter((i) => i.category === c).length])),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Component Library</h1>
          <p className="text-muted-foreground">
            {COMPONENT_LIBRARY.length} curated open-source components — copy code, then drop into any project.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loading, glassmorphism, buttons..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile category pills */}
          <div className="md:hidden flex flex-wrap gap-2 mb-2 w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Left category sidebar */}
          <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  activeCategory === cat
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span>{cat}</span>
                <span className={cn("text-xs tabular-nums", activeCategory === cat ? "text-primary" : "text-muted-foreground/50")}>
                  {countByCategory[cat]}
                </span>
              </button>
            ))}
          </nav>

          {/* Grid */}
          <div className="flex-1 min-w-0 overflow-x-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No components found for "{search}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => (
                  <ComponentCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <AiChatWidget context="component library page" onNavigate={setLocation} />
    </div>
  );
}
