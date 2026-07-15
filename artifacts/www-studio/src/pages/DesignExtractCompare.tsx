import { apiFetch } from "@/lib/apiFetch";
import { Navbar } from "@/components/layout/Navbar";

// ─── DesignExtractCompare.tsx ──────────────────────────────────────────────
// Design comparison mode — two-column layout showing token differences.

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GitCompare,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface ExtractionData {
  id: string;
  status: string;
  primaryUrl: string;
  tokens?: Record<string, unknown>;
}

function getColorDiff(
  colorsA: Record<string, string>,
  colorsB: Record<string, string>,
): { onlyInA: string[]; onlyInB: string[]; different: string[]; same: string[] } {
  const keysA = Object.keys(colorsA);
  const keysB = Object.keys(colorsB);
  const onlyInA = keysA.filter((k) => !(k in colorsB));
  const onlyInB = keysB.filter((k) => !(k in colorsA));
  const common = keysA.filter((k) => k in colorsB);
  const different = common.filter((k) => colorsA[k] !== colorsB[k]);
  const same = common.filter((k) => colorsA[k] === colorsB[k]);
  return { onlyInA, onlyInB, different, same };
}

function ColorBlock({ hex }: { hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded border border-[#27272a]"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-mono">{hex}</span>
    </div>
  );
}

export default function DesignExtractCompare() {
  const [location] = useLocation();
  const [extractions, setExtractions] = useState<ExtractionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);

  // Parse IDs from query string: ?ids=uuid1,uuid2
  const ids = new URLSearchParams(location.split("?")[1] || "")
    .get("ids")
    ?.split(",")
    .filter(Boolean) ?? [];

  useEffect(() => {
    if (ids.length < 2) {
      setError("Need at least 2 extraction IDs to compare. Use ?ids=uuid1,uuid2");
      setLoading(false);
      return;
    }

    async function fetchExtractions() {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await apiFetch(`/api/design-extract/${id}`);
            if (!res.ok) throw new Error(`Failed to load extraction ${id}`);
            return res.json();
          }),
        );
        setExtractions(results);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load extractions");
      } finally {
        setLoading(false);
      }
    }

    fetchExtractions();
  }, [ids]);

  const handleMerge = async () => {
    if (extractions.length < 2) return;
    setMerging(true);
    try {
      // Simple merge: take colors from A, typography from B, and let user refine
      const a = extractions[0].tokens ?? {};
      const b = extractions[1].tokens ?? {};
      const merged = {
        ...a,
        colors: { ...(a.colors as Record<string, string>), ...(b.colors as Record<string, string>) },
        typography: {
          ...(a.typography as Record<string, unknown>),
          ...(b.typography as Record<string, unknown>),
        },
        _mergedFrom: [extractions[0].id, extractions[1].id],
      };

      // Create new extraction with merged tokens
      const res = await apiFetch("/api/design-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `merged:${extractions[0].primaryUrl}+${extractions[1].primaryUrl}`,
          references: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to create merged extraction");
      const newExtraction = await res.json();

      // Update with merged tokens
      await apiFetch(`/api/design-extract/${newExtraction.id}/tokens`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: merged }),
      });

      window.location.hash = `/design-extract/${newExtraction.id}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-foreground flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-foreground p-6">
        <Alert className="max-w-lg mx-auto border-red-500/30 bg-red-500/5">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const [a, b] = extractions;
  const colorsA = (a?.tokens?.colors as Record<string, string>) ?? {};
  const colorsB = (b?.tokens?.colors as Record<string, string>) ?? {};
  const colorDiff = getColorDiff(colorsA, colorsB);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-foreground">
      <Navbar />
      {/* Header */}
      <div className="border-b border-[#27272a] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="h-5 w-5 text-[#3b82f6]" />
            <h1 className="text-lg font-semibold font-display">Compare Designs</h1>
          </div>
          <Button
            size="sm"
            onClick={handleMerge}
            disabled={merging}
            className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white"
          >
            {merging ? (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1.5" />
            )}
            Merge best of both
          </Button>
        </div>
      </div>

      {/* Comparison content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Extraction A */}
          <div className="border border-[#27272a] rounded-lg bg-[#18181b] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#0a0a0b]">
              <p className="text-xs text-muted-foreground truncate">{a?.primaryUrl}</p>
              <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{a?.id}</p>
            </div>
            <ScrollArea className="h-[600px] p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Colors</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(colorsA).map(([name, hex]) => {
                      const isDifferent = colorDiff.different.includes(name);
                      const isOnlyHere = colorDiff.onlyInA.includes(name);
                      return (
                        <div
                          key={name}
                          className={`p-2 rounded border ${
                            isDifferent
                              ? "border-amber-500/50 bg-amber-500/5"
                              : isOnlyHere
                                ? "border-green-500/50 bg-green-500/5"
                                : "border-[#27272a]"
                          }`}
                        >
                          <p className="text-[10px] text-muted-foreground mb-1">{name}</p>
                          <ColorBlock hex={hex} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Extraction B */}
          <div className="border border-[#27272a] rounded-lg bg-[#18181b] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#0a0a0b]">
              <p className="text-xs text-muted-foreground truncate">{b?.primaryUrl}</p>
              <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{b?.id}</p>
            </div>
            <ScrollArea className="h-[600px] p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Colors</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(colorsB).map(([name, hex]) => {
                      const isDifferent = colorDiff.different.includes(name);
                      const isOnlyHere = colorDiff.onlyInB.includes(name);
                      return (
                        <div
                          key={name}
                          className={`p-2 rounded border ${
                            isDifferent
                              ? "border-amber-500/50 bg-amber-500/5"
                              : isOnlyHere
                                ? "border-purple-500/50 bg-purple-500/5"
                                : "border-[#27272a]"
                          }`}
                        >
                          <p className="text-[10px] text-muted-foreground mb-1">{name}</p>
                          <ColorBlock hex={hex} />
                          {isDifferent && colorsA[name] && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                              <ArrowRight className="h-3 w-3" />
                              <span>was {colorsA[name]}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Diff summary */}
        <div className="mt-6 border border-[#27272a] rounded-lg bg-[#18181b] p-4">
          <h3 className="text-sm font-medium mb-3">Difference Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-400">{colorDiff.different.length}</p>
              <p className="text-[10px] text-muted-foreground">Different</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{colorDiff.onlyInA.length}</p>
              <p className="text-[10px] text-muted-foreground">Only in A</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{colorDiff.onlyInB.length}</p>
              <p className="text-[10px] text-muted-foreground">Only in B</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#3b82f6]">{colorDiff.same.length}</p>
              <p className="text-[10px] text-muted-foreground">Same</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
