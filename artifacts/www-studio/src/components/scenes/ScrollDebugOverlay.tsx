import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MousePointer2 } from "lucide-react";
import { useSceneStore } from "@/lib/sceneStore";
import { useScrollDebug } from "@/lib/use-scroll-debug";
import { cn } from "@/lib/utils";

export function ScrollDebugOverlay() {
  const debugOverlay = useSceneStore((s) => s.debugOverlay);
  const toggleDebugOverlay = useSceneStore((s) => s.toggleDebugOverlay);

  useScrollDebug(debugOverlay);

  const toggle = useCallback(() => {
    toggleDebugOverlay();
  }, [toggleDebugOverlay]);

  return (
    <div className="fixed bottom-4 right-4 z-[999998] flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        className={cn(
          "gap-2 text-xs h-8 border-border/60 bg-background/80 backdrop-blur",
          debugOverlay && "border-primary bg-primary/10 text-primary"
        )}
      >
        {debugOverlay ? (
          <>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Markers ON</span>
          </>
        ) : (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Markers OFF</span>
          </>
        )}
      </Button>

      {!debugOverlay && (
        <div className="text-[9px] text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded border border-border/60">
          <MousePointer2 className="h-3 w-3 inline mr-1" />
          Enable to see ScrollTrigger zones
        </div>
      )}
    </div>
  );
}
