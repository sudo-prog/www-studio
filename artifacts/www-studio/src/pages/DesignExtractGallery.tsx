import { apiFetch } from "@/lib/apiFetch";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface GalleryItem {
  id: string;
  primaryUrl: string;
  colors: Record<string, string>;
  createdAt: string | null;
}

export default function DesignExtractGallery() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      setLoading(true);
      const res = await apiFetch("/api/design-extract/public/gallery?limit=20");
      if (!res.ok) throw new Error("Failed to load gallery");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }

  function truncateUrl(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname.length > 1 ? u.pathname : "");
    } catch {
      return url.length > 40 ? url.slice(0, 40) + "…" : url;
    }
  }

  function formatDate(date: string | null): string {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading gallery…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Design Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Design extractions shared by the community
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No extractions shared yet. Apply an extraction to its project to share it here!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Color swatch header */}
                <div className="h-24 flex">
                  {Object.entries(item.colors)
                    .slice(0, 6)
                    .map(([name, value]) => (
                      <div
                        key={name}
                        className="flex-1 h-full"
                        style={{ backgroundColor: value }}
                        title={name}
                      />
                    ))}
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-sm text-muted-foreground truncate">
                    {truncateUrl(item.primaryUrl)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </div>
                  <button
                    onClick={() => navigate(`/design-extract/${item.id}`)}
                    className="w-full mt-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
