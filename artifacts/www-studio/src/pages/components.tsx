import { useState, useMemo, useEffect } from "react";
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
  const hasCode = item.code && item.code.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition-colors">
      {hasCode ? (
        <PreviewCodeCard
          code={item.code}
          title={item.name}
          previewHtml={makePreviewHtml(item.code, item.previewHtml)}
          onCodeCopy={() => toast({ title: "Code copied!" })}
          className="border-0 rounded-none bg-transparent"
        />
      ) : (
        /* Catalog-only entry: no runnable code, link to source instead. */
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-[4/3] w-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center gap-2 hover:from-zinc-800 hover:to-zinc-900 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </div>
          <p className="text-sm font-medium text-white">Open source</p>
          <p className="text-xs text-zinc-400 line-clamp-2 max-w-[20ch]">
            {item.description ?? item.name}
          </p>
        </a>
      )}
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
        {hasCode ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 p-0"
            onClick={() => {
              navigator.clipboard.writeText(item.code);
              toast({ title: "Code copied!" });
            }}
            aria-label={`Copy ${item.name} code`}
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </Button>
        ) : (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center text-muted-foreground hover:text-primary"
            aria-label={`Open ${item.name} source`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        )}
      </div>
    </div>
  );
}

// Mobile uses paginated chunks; desktop shows everything in one scrollable grid.
const MOBILE_PAGE_SIZE = 12;

// True when viewport is <768px (Tailwind `md` breakpoint). Used to switch the
// component grid between "show everything, scroll forever" (desktop) and
// "12 per page, tap Next" (mobile) — 277 items is unscrollable on a phone.
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

type SvgProps = React.SVGProps<SVGSVGElement>;

function ChevronLeft(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function Components() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

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

  // Reset to page 1 when filters change so the user doesn't end up stranded
  // on a page that no longer exists after a category/search change.
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / MOBILE_PAGE_SIZE));
  // Clamp page to valid range in case filtered shrinks after a search.
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(
    () => filtered.slice((safePage - 1) * MOBILE_PAGE_SIZE, safePage * MOBILE_PAGE_SIZE),
    [filtered, safePage],
  );
  const visibleItems = isMobile ? pagedItems : filtered;

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
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Component Library</h1>
          <p className="text-muted-foreground">
            Curated references from across the web.
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
                <p>No components found for &ldquo;{search}&rdquo;</p>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  data-testid="component-grid"
                >
                  {visibleItems.map((item) => (
                    <ComponentCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Mobile-only pagination controls. Desktop shows the full
                    grid, so a pager would be redundant. 48px-tall buttons to
                    meet the mobile tap-target standard. */}
                {isMobile && totalPages > 1 && (
                  <nav
                    aria-label="Component library pages"
                    className="mt-8 flex flex-wrap items-center justify-between gap-2"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="min-h-[44px] px-4"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>

                    <span
                      className="text-sm text-muted-foreground tabular-nums order-3 w-full text-center sm:order-2 sm:w-auto"
                      aria-live="polite"
                    >
                      Page {safePage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="min-h-[44px] px-4"
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <AiChatWidget context="component library page" onNavigate={setLocation} />
    </div>
  );
}