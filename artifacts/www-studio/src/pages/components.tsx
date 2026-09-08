import { useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { COMPONENT_LIBRARY, CATEGORIES, makePreviewHtml, type Category, type ComponentItem } from "@/data/component-library";
import { Search, Copy, Github, Loader2, Star } from "lucide-react";
import { useRatings, StarRating, StarRatingDisplay, parseRatingQuery, matchesRating, type ParsedRatingQuery } from "@/lib/ratings";
import { useToast } from "@/hooks/use-toast";
import { AiChatWidget } from "@/components/AiChatWidget";
import { useLocation } from "wouter";
import { extractFromUrl } from "@/lib/ingest";
import {
  PreviewCodeCard,
  TagChip,
  CategoryNav,
  type CategoryItem,
} from "@/components/shared";

function ComponentCard({ item }: { item: typeof COMPONENT_LIBRARY[number] }) {
  const { toast } = useToast();
  const ratingApi = useRatings();
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
          componentItem={item}
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
      {/* Info strip — title + tags + rating + copy icon. */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <TagChip key={tag}>{tag}</TagChip>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <StarRatingDisplay
              average={ratingApi.getAverage(item.id)}
              count={ratingApi.getCount(item.id)}
              size={11}
            />
            <StarRating
              value={ratingApi.get(item.id)}
              size={14}
              onChange={(v) => {
                ratingApi.set(item.id, v);
                toast({ title: v > 0 ? `Rated ${item.name} ${v}★` : `Cleared rating` });
              }}
              ariaLabel={`Rate ${item.name}`}
            />
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
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az" | "za" | "rating-high" | "rating-low">("newest");
  const [minRating, setMinRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const ratingApi = useRatings();
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // GitHub ingest state
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestedComponents, setIngestedComponents] = useState<ComponentItem[]>([]);
  const [ingestErrors, setIngestErrors] = useState<string[]>([]);
  const { toast: mainToast } = useToast();

  const handleGithubIngest = async () => {
    if (!githubUrl.trim()) return;
    setIngesting(true);
    setIngestErrors([]);
    setIngestedComponents([]);
    try {
      const result = await extractFromUrl({ url: githubUrl.trim() });
      setIngestedComponents(result.components);
      setIngestErrors(result.errors);
      if (result.components.length > 0) {
        mainToast({
          title: `Found ${result.components.length} component${result.components.length !== 1 ? "s" : ""}`,
          description: result.errors.length > 0 ? `${result.errors.length} file(s) skipped` : undefined,
        });
      } else {
        mainToast({ title: "No components found", variant: "destructive" });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setIngestErrors([msg]);
      mainToast({ title: "Ingest failed", description: msg, variant: "destructive" });
    } finally {
      setIngesting(false);
    }
  };

  // Parse "4 stars" / "5+ stars" etc. from the search box.
  const parsedRating = React.useMemo<ParsedRatingQuery>(
    () => parseRatingQuery(search),
    [search],
  );
  const searchText = parsedRating.cleanQuery;

  const filtered = useMemo(() => {
    let items = [...COMPONENT_LIBRARY]; // clone to avoid mutation
    if (activeCategory !== "All") items = items.filter((c) => c.category === activeCategory);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      items = items.filter(
        (c) => c.name.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q)) || c.category.toLowerCase().includes(q)
      );
    }
    // Apply min-rating chip filter.
    if (minRating > 0) {
      items = items.filter((c) => ratingApi.getAverage(c.id) >= minRating);
    }
    // Apply parsed rating phrase from search box.
    if (parsedRating.threshold > 0) {
      items = items.filter((c) => matchesRating(parsedRating, ratingApi.getAverage(c.id)));
    }
    switch (sortBy) {
      case "az":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating-high":
        items.sort((a, b) => ratingApi.getAverage(b.id) - ratingApi.getAverage(a.id));
        break;
      case "rating-low":
        items.sort((a, b) => ratingApi.getAverage(a.id) - ratingApi.getAverage(b.id));
        break;
      case "newest":
        items.reverse();
        break;
      case "oldest":
        break;
    }
    return items;
  }, [searchText, activeCategory, sortBy, minRating, ratingApi, parsedRating]);

  // Reset to page 1 when filters change so the user doesn't end up stranded
  // on a page that no longer exists after a category/search change.
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory, sortBy, minRating]);

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
              placeholder="Search loading, glassmorphism... or `4+ stars`"
              className="pl-9 min-h-[48px]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-12 px-3 rounded-xl border border-border bg-card text-sm cursor-pointer min-h-[48px]"
            aria-label="Sort components"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="rating-high">★ Highest Rated</option>
            <option value="rating-low">★ Lowest Rated</option>
          </select>
          {/* Minimum-stars filter chip row. Tapping a chip sets the minimum
              star threshold; tapping "All" clears it. Mirrors the pattern
              of the existing CategoryNav. */}
          <div className="flex items-center gap-1.5 overflow-x-auto" role="group" aria-label="Minimum star rating">
            <button
              type="button"
              onClick={() => setMinRating(0)}
              className={`shrink-0 px-3 h-9 min-h-[36px] rounded-full text-xs font-medium border transition-colors ${
                minRating === 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={minRating === 0}
            >
              All ratings
            </button>
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMinRating(minRating === n ? 0 : n)}
                className={`shrink-0 px-3 h-9 min-h-[36px] rounded-full text-xs font-medium border inline-flex items-center gap-1 transition-colors ${
                  minRating === n
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={minRating === n}
                aria-label={`${n} stars or more`}
              >
                <Star className={`w-3 h-3 ${minRating === n ? "fill-amber-400 text-amber-400" : ""}`} strokeWidth={1.5} />
                {n}+
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile category pills — overflow-x-auto so wide pill rows scroll at 390px */}
          <div className="md:hidden overflow-x-auto">
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto"
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