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

interface ExtractionProgressProps {
  url: string;
  startedAt: number;
}

export default function ExtractionProgress({ url, startedAt }: ExtractionProgressProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval>>();

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

      {/* URL */}
      <p className="text-sm text-muted-foreground mb-1 font-mono">{truncatedUrl}</p>

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
