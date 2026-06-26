// ─── ExtractionProgress.tsx ─────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  "\uD83D\uDDF8 Capturing screenshots...",
  "\uD83C\uDFA8 Analysing colour palette...",
  "✏️ Identifying typography...",
  "\uD83D\uDCD0 Reading layout patterns...",
  "\uD83D\uDD04 Synthesising references...",
  "\uD83D\uDCDD Writing design documentation...",
];

const DNA_DIMENSIONS = [
  { key: "color", label: "Color", color: "#3b82f6" },
  { key: "type", label: "Typography", color: "#8b5cf6" },
  { key: "layout", label: "Layout", color: "#22c55e" },
  { key: "spacing", label: "Spacing", color: "#f59e0b" },
  { key: "animation", label: "Animation", color: "#ec4899" },
  { key: "voice", label: "Brand Voice", color: "#06b6d4" },
];

interface ExtractionProgressProps {
  url: string;
  startedAt: number;
}

export default function ExtractionProgress({ url, startedAt }: ExtractionProgressProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 3000);

    const timerInterval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(timerInterval);
    };
  }, [startedAt]);

  const truncatedUrl =
    url.length > 56 ? url.slice(0, 56) + "…" : url;
  const progressValue = Math.min(15 + elapsed * 2, 90);

  // Calculate how many DNA dimensions should be filled based on elapsed time
  const dimensionsToShow = Math.min(
    DNA_DIMENSIONS.length,
    Math.max(1, Math.floor((elapsed / 10) * DNA_DIMENSIONS.length))
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Spinning indicator */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-[#27272a] border-t-[#3b82f6] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">
            {STAGES[stageIndex].split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Stage text */}
      <p className="text-lg font-medium text-foreground mb-2 transition-all duration-500">
        {STAGES[stageIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-4">
        <Progress value={progressValue} className="h-1.5 bg-[#27272a]" />
      </div>

      {/* DNA Visualization */}
      <div className="w-full max-w-sm mt-6 space-y-2.5">
        <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider mb-3">
          Design DNA
        </p>
        {DNA_DIMENSIONS.map((dim, i) => {
          const isVisible = i < dimensionsToShow;
          const isPulsing = i === dimensionsToShow - 1;
          return (
            <div
              key={dim.key}
              className="dna-bar-container flex items-center gap-3"
              style={{
                opacity: isVisible ? 1 : 0.3,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <span
                className={`text-[11px] w-16 text-right shrink-0 ${isVisible ? "dna-label-animate text-muted-foreground" : "text-muted-foreground/30"}`}
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                {dim.label}
              </span>
              <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPulsing ? "dna-bar-pulse" : ""}`}
                  style={{
                    backgroundColor: dim.color,
                    width: isVisible ? `${Math.min(100, (elapsed / 8) * 100)}%` : "0%",
                    transition: "width 0.8s ease-out",
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground/40 w-8 text-right font-mono">
                {isVisible ? `${Math.min(100, Math.round((elapsed / 8) * 100))}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* URL */}
      <p className="text-sm text-muted-foreground mb-1 font-mono mt-6">{truncatedUrl}</p>

      {/* Elapsed time */}
      <p className="text-xs text-muted-foreground/60">
        {elapsed}s elapsed
      </p>

      {/* Hint */}
      <p className="text-xs text-muted-foreground/40 mt-4">
        Usually takes 15-40 seconds
      </p>
    </div>
  );
}
