import { useState } from "react";
import { type SceneElement } from "@/lib/scene-types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

type TriggerStart = "top bottom" | "top 80%" | "top 60%" | "top top" | "center center" | "bottom top";
type TriggerEnd   = "bottom top" | "bottom bottom" | "+=100%" | "+=200%" | "+=300%";

export interface ScrollConfig {
  enabled:      boolean;
  trigger:      TriggerStart;
  end:          TriggerEnd;
  scrub:        boolean | number;
  pin:          boolean;
  parallaxY:    number;
  parallaxX:    number;
  fadeIn:       boolean;
  scaleFrom:    number;
  markers:      boolean;
}

export const DEFAULT_SCROLL_CONFIG: ScrollConfig = {
  enabled:   false,
  trigger:   "top 80%",
  end:       "bottom top",
  scrub:     false,
  pin:       false,
  parallaxY: 0,
  parallaxX: 0,
  fadeIn:    false,
  scaleFrom: 1,
  markers:   false,
};

interface Props {
  element: SceneElement;
  onChange: (cfg: ScrollConfig) => void;
}

const TRIGGER_STARTS: TriggerStart[] = ["top bottom", "top 80%", "top 60%", "top top", "center center", "bottom top"];
const TRIGGER_ENDS:   TriggerEnd[]   = ["bottom top", "bottom bottom", "+=100%", "+=200%", "+=300%"];

const PRESET_CONFIGS: { label: string; icon: string; cfg: Partial<ScrollConfig> }[] = [
  { label: "Parallax Layer", icon: "🌊", cfg: { enabled: true, trigger: "top bottom", end: "bottom top", scrub: true, parallaxY: -120 } },
  { label: "Fade In",        icon: "👁", cfg: { enabled: true, trigger: "top 80%",    end: "bottom top", scrub: false, fadeIn: true } },
  { label: "Pin Hero",       icon: "📌", cfg: { enabled: true, trigger: "top top",    end: "+=200%", scrub: 1, pin: true } },
  { label: "Scale Reveal",   icon: "🔍", cfg: { enabled: true, trigger: "top 80%",    end: "bottom top", scrub: false, scaleFrom: 0.7, fadeIn: true } },
  { label: "Drift X",        icon: "↔",  cfg: { enabled: true, trigger: "top bottom", end: "bottom top", scrub: true, parallaxX: 80 } },
];

export function ScrollTriggerConfig({ element, onChange }: Props) {
  const rawCfg = (element as any).scrollConfig;
  const cfg: ScrollConfig = {
    ...DEFAULT_SCROLL_CONFIG,
    ...(typeof rawCfg === "object" ? rawCfg : {}),
  };

  function update(patch: Partial<ScrollConfig>) {
    onChange({ ...cfg, ...patch });
  }

  function applyPreset(preset: Partial<ScrollConfig>) {
    onChange({ ...DEFAULT_SCROLL_CONFIG, ...preset });
  }

  return (
    <div className="space-y-4 p-3">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-medium">ScrollTrigger</Label>
          <p className="text-[9px] text-muted-foreground mt-0.5">GSAP scroll-driven animation</p>
        </div>
        <Switch checked={cfg.enabled} onCheckedChange={(v) => update({ enabled: v })} />
      </div>

      {/* Quick presets */}
      <div className="space-y-1.5">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">Quick presets</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESET_CONFIGS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.cfg)}
              className="text-left text-[10px] px-2 py-1.5 rounded border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <span className="mr-1">{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
      </div>

      {cfg.enabled && (
        <>
          {/* Trigger positions */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start trigger</Label>
            <div className="grid grid-cols-2 gap-1">
              {TRIGGER_STARTS.map((t) => (
                <button
                  key={t}
                  onClick={() => update({ trigger: t })}
                  className={cn(
                    "text-[9px] py-1 px-1.5 rounded border transition-colors text-center",
                    cfg.trigger === t ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">End trigger</Label>
            <div className="grid grid-cols-2 gap-1">
              {TRIGGER_ENDS.map((t) => (
                <button
                  key={t}
                  onClick={() => update({ end: t })}
                  className={cn(
                    "text-[9px] py-1 px-1.5 rounded border transition-colors text-center",
                    cfg.end === t ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Scrub */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Scrub</Label>
              <p className="text-[8px] text-muted-foreground/60">Links animation to scroll position</p>
            </div>
            <Switch checked={!!cfg.scrub} onCheckedChange={(v) => update({ scrub: v ? 1 : false })} />
          </div>
          {cfg.scrub && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Scrub smoothing</Label>
                <span className="text-xs font-mono text-muted-foreground">{cfg.scrub}</span>
              </div>
              <Slider min={0.1} max={5} step={0.1} value={[typeof cfg.scrub === "number" ? cfg.scrub : 1]}
                onValueChange={([v]) => update({ scrub: v })} />
            </div>
          )}

          {/* Pin */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Pin</Label>
              <p className="text-[8px] text-muted-foreground/60">Pins element while scrolling</p>
            </div>
            <Switch checked={cfg.pin} onCheckedChange={(v) => update({ pin: v })} />
          </div>

          {/* Parallax */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Parallax Y offset</Label>
            <div className="flex items-center gap-2">
              <Slider min={-300} max={300} step={10} value={[cfg.parallaxY]}
                onValueChange={([v]) => update({ parallaxY: v })} className="flex-1" />
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">{cfg.parallaxY}px</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Parallax X offset</Label>
            <div className="flex items-center gap-2">
              <Slider min={-200} max={200} step={10} value={[cfg.parallaxX]}
                onValueChange={([v]) => update({ parallaxX: v })} className="flex-1" />
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">{cfg.parallaxX}px</span>
            </div>
          </div>

          {/* Fade in */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Fade in on trigger</Label>
            <Switch checked={cfg.fadeIn} onCheckedChange={(v) => update({ fadeIn: v })} />
          </div>

          {/* Scale from */}
          {cfg.fadeIn && (
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">Scale from</Label>
                <span className="text-xs font-mono text-muted-foreground">{cfg.scaleFrom.toFixed(2)}×</span>
              </div>
              <Slider min={0.3} max={1.5} step={0.05} value={[cfg.scaleFrom]}
                onValueChange={([v]) => update({ scaleFrom: v })} />
            </div>
          )}

          {/* Debug markers */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Debug markers</Label>
              <p className="text-[8px] text-muted-foreground/60">Show start/end markers in preview</p>
            </div>
            <Switch checked={cfg.markers} onCheckedChange={(v) => update({ markers: v })} />
          </div>

          {/* Generated code hint */}
          <div className="bg-muted/30 rounded border border-border/50 p-2 space-y-1">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Info className="h-2.5 w-2.5" />GSAP output preview
            </div>
            <pre className="text-[8px] text-primary/70 font-mono overflow-x-auto whitespace-pre-wrap break-all">
{`ScrollTrigger.create({
  trigger: "#${element.id.slice(0, 8)}",
  start: "${cfg.trigger}",
  end: "${cfg.end}",${cfg.scrub ? `\n  scrub: ${cfg.scrub},` : ""}${cfg.pin ? "\n  pin: true," : ""}
});${cfg.parallaxY !== 0 ? `\ngsap.to(el, { y: ${cfg.parallaxY}, ease: "none", scrollTrigger: {...} });` : ""}${cfg.fadeIn ? `\ngsap.from(el, { opacity: 0, scale: ${cfg.scaleFrom}, duration: 1 });` : ""}`}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
