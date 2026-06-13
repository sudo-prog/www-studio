import { useState, useRef } from "react";
import { type SceneElement } from "@/lib/scene-types";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESET_COLORS: Record<string, string> = {
  "none":              "#3f3f46",
  "gentle-float":      "#7FB5A0",
  "gradient-breathe":  "#B39DC2",
  "shadow-pulse":      "#87BBDB",
  "scale-pulse":       "#E8957A",
  "fade-in-out":       "#F4C5A1",
  "morph":             "#4A7C6B",
  "spin-slow":         "#C8D8E0",
  "elastic-bounce":    "#E8DDD0",
  "hover-lift":        "#7FB5A0",
  "scroll-reveal":     "#B39DC2",
  "drift":             "#E8957A",
  "aurora-sweep":      "#87BBDB",
  "cosmic-pulse":      "#B39DC2",
  "lenis-parallax":    "#4A7C6B",
};

const MAX_DURATION = 20;

interface Props {
  elements: SceneElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<SceneElement>) => void;
}

export function AnimationTimeline({ elements, selectedId, onSelect, onUpdateElement }: Props) {
  const [playing, setPlaying]     = useState(false);
  const [playhead, setPlayhead]   = useState(0);
  const [zoom, setZoom]           = useState(1);
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const timelineRef               = useRef<HTMLDivElement>(null);

  function togglePlay() {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        setPlayhead((p) => {
          const next = p + 0.05;
          if (next >= MAX_DURATION) {
            clearInterval(intervalRef.current!);
            setPlaying(false);
            return 0;
          }
          return next;
        });
      }, 50);
    }
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
    setPlayhead(0);
  }

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setPlayhead(ratio * MAX_DURATION * zoom);
  }

  const pxPerSec = 30 * zoom;
  const totalWidth = MAX_DURATION * pxPerSec;

  const animatedEls = elements.filter((el) => el.animation?.preset && el.animation.preset !== "none");
  const staticEls   = elements.filter((el) => !el.animation?.preset || el.animation.preset === "none");

  const rows = [...animatedEls, ...staticEls];

  return (
    <div className="flex flex-col h-full select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset}>
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePlay}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <span className="text-[10px] font-mono text-muted-foreground w-10">
          {playhead.toFixed(1)}s
        </span>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">Zoom</span>
        <input
          type="range" min={0.5} max={3} step={0.25} value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-16 h-1 accent-primary"
        />
        <span className="text-[10px] font-mono text-muted-foreground">{zoom}×</span>
      </div>

      {/* Main scroll area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Element names */}
        <div className="w-28 shrink-0 border-r border-border bg-muted/10 overflow-y-auto">
          <div className="h-5 border-b border-border px-2 flex items-center">
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Layer</span>
          </div>
          {rows.map((el) => (
            <div
              key={el.id}
              onClick={() => onSelect(el.id)}
              className={cn(
                "h-8 flex items-center gap-1.5 px-2 text-[10px] truncate cursor-pointer border-b border-border/30 transition-colors",
                selectedId === el.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/30"
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/10"
                style={{ background: el.fill }}
              />
              <span className="truncate">{el.name}</span>
            </div>
          ))}
        </div>

        {/* Timeline tracks */}
        <div className="flex-1 overflow-x-auto overflow-y-auto" ref={timelineRef}>
          {/* Ruler */}
          <div
            className="h-5 bg-muted/20 border-b border-border sticky top-0 z-10 relative cursor-crosshair"
            style={{ width: totalWidth + 40 }}
            onClick={handleTimelineClick}
          >
            {Array.from({ length: Math.ceil(MAX_DURATION * zoom) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: i * pxPerSec }}
              >
                <div className="w-px h-2 bg-border" />
                {i % 2 === 0 && (
                  <span className="text-[8px] text-muted-foreground mt-0.5">{i}s</span>
                )}
              </div>
            ))}
            {/* Playhead */}
            <div
              className="absolute top-0 w-0.5 h-full bg-primary z-20 pointer-events-none"
              style={{ left: (playhead / MAX_DURATION / zoom) * totalWidth }}
            />
          </div>

          {/* Tracks */}
          <div style={{ width: totalWidth + 40 }}>
            {rows.map((el) => {
              const anim    = el.animation;
              const preset  = anim?.preset ?? "none";
              const dur     = anim?.duration ?? 4;
              const delay   = anim?.delay ?? 0;
              const color   = PRESET_COLORS[preset] ?? "#7FB5A0";
              const startPx = delay * pxPerSec;
              const widthPx = Math.max(dur * pxPerSec, 8);
              const isActive = playing && playhead >= delay && playhead <= delay + dur;

              return (
                <div
                  key={el.id}
                  className={cn(
                    "h-8 border-b border-border/30 relative",
                    selectedId === el.id ? "bg-primary/5" : ""
                  )}
                >
                  {preset !== "none" && (
                    <div
                      className={cn(
                        "absolute top-1.5 h-5 rounded flex items-center px-1.5 text-[9px] font-medium cursor-pointer transition-opacity",
                        isActive ? "opacity-100 ring-1 ring-white/30" : "opacity-70 hover:opacity-100"
                      )}
                      style={{
                        left: startPx + 4,
                        width: widthPx,
                        background: color + "55",
                        borderLeft: `2px solid ${color}`,
                        color: color,
                      }}
                      onClick={() => onSelect(el.id)}
                      title={`${preset} • ${delay}s delay • ${dur}s duration${anim?.loop ? " • loop" : ""}`}
                    >
                      <span className="truncate">{preset}</span>
                      {anim?.loop && (
                        <span className="ml-1 text-[7px] opacity-60">↺</span>
                      )}
                    </div>
                  )}
                  {preset === "none" && (
                    <div className="absolute inset-0 flex items-center px-3">
                      <div className="h-px w-full bg-border/30 dashed" />
                      <span className="text-[8px] text-muted-foreground/30 ml-1 shrink-0">static</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected element quick controls */}
      {selectedId && (() => {
        const el = elements.find((e) => e.id === selectedId);
        if (!el) return null;
        const anim = el.animation ?? { preset: "none", duration: 4, delay: 0, easing: "ease-in-out", loop: true };
        return (
          <div className="border-t border-border px-3 py-2 bg-muted/10 space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              Quick edit — <span className="text-foreground">{el.name}</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-muted-foreground">Delay</span>
                <input
                  type="number" min={0} max={20} step={0.5}
                  value={anim.delay ?? 0}
                  onChange={(e) => onUpdateElement(el.id, { animation: { ...anim, delay: Number(e.target.value) } })}
                  className="w-full h-6 text-xs bg-background border border-border rounded px-1.5 font-mono"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-muted-foreground">Duration</span>
                <input
                  type="number" min={0.5} max={60} step={0.5}
                  value={anim.duration ?? 4}
                  onChange={(e) => onUpdateElement(el.id, { animation: { ...anim, duration: Number(e.target.value) } })}
                  className="w-full h-6 text-xs bg-background border border-border rounded px-1.5 font-mono"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-muted-foreground">Loop</span>
                <button
                  onClick={() => onUpdateElement(el.id, { animation: { ...anim, loop: !anim.loop } })}
                  className={cn(
                    "w-full h-6 text-xs rounded border transition-colors",
                    anim.loop ? "bg-primary/20 border-primary/40 text-primary" : "bg-muted border-border text-muted-foreground"
                  )}
                >{anim.loop ? "↺ Loop" : "→ Once"}</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
