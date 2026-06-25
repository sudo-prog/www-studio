import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { FreeformPage } from "@/lib/freeform-types";
import { exportFreeformToHTML } from "@/lib/freeformStore";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Heart,
  Eye,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Code,
  Download,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: FreeformPage;
}

function FreeformPageRenderer({ page }: Props) {
  const html = exportFreeformToHTML(page);
  return (
    <div
      className="w-full h-full overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function FreeformSharePage() {
  const params = useParams<{ pageId: string }>();
  const pageId = params?.pageId ?? "";
  const [page, setPage] = useState<FreeformPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [copied, setCopied] = useState<"iframe" | "link" | null>(null);
  const [embedMode, setEmbedMode] = useState<"link" | "iframe" | "react">("link");

  useEffect(() => {
    // Try to load from localStorage first (for recently edited pages)
    const stored = localStorage.getItem(`freeform_page_${pageId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FreeformPage;
        setPage(parsed);
        setLikes(parsed.likes || 0);
        setViews(parsed.viewCount || 0);
        setIsLoading(false);
      } catch {
        // fall through
      }
    }

    // Also try GitHub backup
    fetch(`https://api.github.com/repos/sudo-prog/www-studio-backup/contents/projects/freeform/${pageId}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.content) {
          const parsed = JSON.parse(atob(data.content));
          const freeformPage: FreeformPage = {
            id: parsed.id,
            userId: parsed.userId || "guest",
            name: parsed.name || "Untitled",
            slug: parsed.slug || parsed.id,
            canvasWidth: parsed.canvasWidth || 1440,
            canvasHeight: parsed.canvasHeight || 900,
            elements: JSON.parse(parsed.elements || "[]"),
            background: JSON.parse(parsed.background || "{}"),
            status: parsed.status || "published",
            isPrivate: false,
            likes: 0,
            viewCount: 0,
            tags: [],
            createdAt: parsed.savedAt || new Date().toISOString(),
            updatedAt: parsed.savedAt || new Date().toISOString(),
          };
          setPage(freeformPage);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [pageId]);

  useEffect(() => {
    if (page) {
      document.title = `${page.name} — WWW Studio`;
    }
  }, [page]);

  const shareUrl = `${window.location.origin}/freeform/${pageId}/share`;
  const iframeCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
  const reactCode = `export function ${page?.name?.replace(/[^a-zA-Z0-9]/g, "") || "Page"}Embed() {\n  return (\n    <iframe\n      src="${shareUrl}"\n      style={{ width: "100%", height: 600, border: "none", borderRadius: 16 }}\n    />\n  );\n}`;

  function handleLike() {
    if (liked || !page) return;
    setLiked(true);
    setLikes((n) => n + 1);
  }

  function handleCopy(type: "iframe" | "link") {
    const text = type === "iframe" ? iframeCode : shareUrl;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Globe className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Page not found</p>
        <Button variant="outline" asChild>
          <Link href="/projects">← Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm truncate max-w-[200px]">{page.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
              <Globe className="h-2.5 w-2.5" />Public
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all",
              liked
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-400")} />
            {likes}
          </button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(shareUrl, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" />Open
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href={`/freeform/${pageId}`}>
              Edit Page
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Page preview */}
        <div className="flex-1 bg-[#0d0d1a] relative overflow-hidden">
          <FreeformPageRenderer page={page} />
          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/60 text-xs bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-full">
              <Eye className="h-3 w-3" />{views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-full">
              <Heart className="h-3 w-3" />{likes.toLocaleString()} likes
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[320px] border-l border-border bg-card/50 flex flex-col overflow-y-auto shrink-0">
          {/* Info */}
          <div className="p-5 border-b border-border">
            <h2 className="font-bold text-lg mb-1">{page.name}</h2>
            {page.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{page.description}</p>
            )}
          </div>

          {/* Embed */}
          <div className="p-5 flex-1">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />Embed this page
            </p>

            <div className="flex gap-1 mb-3">
              {(["link", "iframe", "react"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEmbedMode(mode)}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded-md border transition-colors",
                    embedMode === mode
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "link" ? "URL" : mode === "iframe" ? "iFrame" : "React"}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="text-[11px] leading-relaxed bg-muted rounded-lg p-3 overflow-x-auto text-muted-foreground font-mono whitespace-pre-wrap break-all">
                {embedMode === "link" ? shareUrl : embedMode === "iframe" ? iframeCode : reactCode}
              </pre>
              <button
                onClick={() => handleCopy(embedMode === "iframe" ? "iframe" : "link")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background border border-border hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Paste this snippet into any HTML page or React app to embed this page.
            </p>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-border flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                const html = exportFreeformToHTML(page);
                const blob = new Blob([html], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${page.slug || page.name.toLowerCase().replace(/\s+/g, "-")}.html`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4" />Download HTML
            </Button>
            <Button className="w-full gap-2" asChild>
              <Link href={`/freeform/${pageId}`}>
                <Sparkles className="h-4 w-4" />Open Editor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
