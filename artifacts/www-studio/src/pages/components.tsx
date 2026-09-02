import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COMPONENT_LIBRARY, CATEGORIES, makePreviewHtml, type Category } from "@/data/component-library";
import { Search, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AiChatWidget } from "@/components/AiChatWidget";
import { useLocation } from "wouter";
import {
  PreviewCodeCard,
  TagChip,
  CategoryNav,
  type CategoryItem,
} from "@/components/shared";

function ComponentCard({ item }: { item: typeof COMPONENT_LIBRARY[number] }) {
  const { toast } = useToast();

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition-colors">
      <PreviewCodeCard
        code={item.code}
        title={item.name}
        previewHtml={makePreviewHtml(item.code)}
        onCodeCopy={() => toast({ title: "Code copied!" })}
        className="border-0 rounded-none bg-transparent"
      />
      {/* Info strip — title + tags + free-floating copy icon. Lives
          beside the shared preview viewport so the same PreviewCodeCard
          primitive can be reused without a built-in info footer. */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag}>{tag}</TagChip>
            ))}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 min-h-[48px] min-w-[44px] shrink-0"
          onClick={() => {
            navigator.clipboard.writeText(item.code);
            toast({ title: "Code copied!" });
          }}
          aria-label={`Copy ${item.name} code`}
        >
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
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

  const categoryItems: ReadonlyArray<CategoryItem<Category>> = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        id: c,
        label: c,
        count:
          c === "All"
            ? COMPONENT_LIBRARY.length
            : COMPONENT_LIBRARY.filter((i) => i.category === c).length,
      })),
    [],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
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
              className="pl-9 min-h-[48px]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile category pills */}
          <div className="md:hidden">
            <CategoryNav
              items={categoryItems}
              active={activeCategory}
              onSelect={setActiveCategory}
              layout="pills"
              className="mb-2 w-full"
            />
          </div>

          {/* Left category sidebar */}
          <CategoryNav
            items={categoryItems}
            active={activeCategory}
            onSelect={setActiveCategory}
            layout="sidebar"
            className="hidden md:flex"
          />

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