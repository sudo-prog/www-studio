import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type SceneElement } from "@/lib/scene-types";
import { Activity, Zap, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function PerformanceAuditor({ elements, onOptimize }: {
  elements: SceneElement[];
  onOptimize: (suggestions: string[]) => void;
}) {
  const issues = useMemo(() => {
    const suggestions: string[] = [];
    const animated = elements.filter((el) => el.animation?.preset && el.animation.preset !== "none");
    const heavyBlur = elements.filter((el) => (el.blur ?? 0) > 60);
    const large = elements.filter((el) => el.width * el.height > 400000);

    if (animated.length > 8) suggestions.push(`Reduce animated elements (${animated.length}/8+) for smoother 60fps`);
    if (heavyBlur.length > 3) suggestions.push(`High blur on ${heavyBlur.length} elements is expensive — consider lowering blur radius`);
    if (large.length > 2) suggestions.push(`${large.length} oversized elements — resize to improve paint performance`);
    if (elements.length > 20) suggestions.push(`Total elements (${elements.length}) is high — consider grouping or simplifying`);

    const scrollEnabled = elements.filter((el) => (el as any).scrollConfig?.enabled);
    if (scrollEnabled.length > 3) suggestions.push(`Multiple ScrollTriggers (${scrollEnabled.length}) may compete — consolidate where possible`);

    if (suggestions.length === 0) suggestions.push("Scene looks healthy — no obvious performance issues detected");

    return suggestions;
  }, [elements]);

  const score = Math.max(0, 100 - (issues.length - (issues[0]?.includes("healthy") ? 0 : 1)) * 15);

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium">Scene Performance</p>
        </div>
        <span
          className={cn(
            "text-xs font-mono font-medium px-2 py-0.5 rounded-full",
            score >= 80 ? "bg-green-500/10 text-green-400" :
            score >= 50 ? "bg-yellow-500/10 text-yellow-400" :
            "bg-red-500/10 text-red-400"
          )}
        >
          {score}/100
        </span>
      </div>

      <div className="space-y-2">
        {issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            {issue.includes("healthy") ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
            )}
            <span className={issue.includes("healthy") ? "text-green-400" : "text-muted-foreground"}>{issue}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-muted/30 rounded-lg p-2 space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground"><Zap className="h-3 w-3" /> Elements</div>
          <p className="text-sm font-mono font-medium">{elements.length}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground"><Activity className="h-3 w-3" /> Animated</div>
          <p className="text-sm font-mono font-medium">{elements.filter((el) => el.animation?.preset && el.animation.preset !== "none").length}</p>
        </div>
      </div>

      {issues.some((s) => !s.includes("healthy")) && (
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5 text-xs"
          onClick={() => {
            const fixes = issues.filter((s) => !s.includes("healthy"));
            onOptimize(fixes);
          }}
        >
          <Copy className="h-3 w-3" />
          Apply Fixes
        </Button>
      )}
    </div>
  );
}
