import { type SceneElement, type AnimationPreset } from "@/lib/scene-types";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const PRESETS: { id: AnimationPreset; label: string; description: string; icon: string; category: string }[] = [
  { id: "none",             label: "None",            description: "No animation — static element",      icon: "—",  category: "Basic" },
  { id: "gentle-float",    label: "Gentle Float",    description: "Slow vertical drift up and down",    icon: "↕",  category: "Motion" },
  { id: "gradient-breathe",label: "Breathe",         description: "Opacity pulses like breathing",      icon: "◎",  category: "Opacity" },
  { id: "shadow-pulse",    label: "Shadow Pulse",    description: "Glowing drop shadow pulses",         icon: "✦",  category: "Glow" },
  { id: "hover-lift",      label: "Hover Lift",      description: "Lifts and scales on hover",          icon: "⬆",  category: "Interaction" },
  { id: "scroll-reveal",   label: "Scroll Reveal",   description: "Fades in on scroll entry",           icon: "👁",  category: "Scroll" },
  { id: "morph",           label: "Morph",           description: "Organic border-radius morphing",     icon: "⬡",  category: "Shape" },
  { id: "spin-slow",       label: "Spin Slow",       description: "Continuous gentle rotation",         icon: "↺",  category: "Motion" },
  { id: "fade-in-out",     label: "Fade Pulse",      description: "Smoothly fades in and out",          icon: "◌",  category: "Opacity" },
  { id: "scale-pulse",     label: "Scale Pulse",     description: "Grows and shrinks rhythmically",     icon: "◉",  category: "Scale" },
  { id: "elastic-bounce",  label: "Elastic Bounce",  description: "Springy bouncing with squash",       icon: "⇕",  category: "Motion" },
  { id: "drift",           label: "Drift",           description: "Horizontal slow drift side to side",  icon: "↔",  category: "Motion" },
  { id: "hover-lift",      label: "Hover Lift",      description: "Lifts and scales on hover",           icon: "⬆",  category: "Interaction" },
  { id: "scroll-reveal",   label: "Scroll Reveal",   description: "Fades in on scroll entry",            icon: "👁",  category: "Scroll" },
];

const CATEGORIES = ["Basic", "Motion", "Opacity", "Scale", "Glow", "Shape", "Interaction", "Scroll"];

interface Props {
  element: SceneElement;
  onChange: (updates: Partial<SceneElement>) => void;
}

export function AnimationPresets({ element, onChange }: Props) {
  const anim = element.animation;

  function setPreset(preset: AnimationPreset) {
    onChange({ animation: { ...anim, preset } });
  }

  function setDuration(val: number[]) {
    onChange({ animation: { ...anim, duration: val[0] } });
  }

  function setDelay(val: number[]) {
    onChange({ animation: { ...anim, delay: val[0] } });
  }

  function setLoop(loop: boolean) {
    onChange({ animation: { ...anim, loop } });
  }

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    items: PRESETS.filter(p => p.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {byCategory.map(({ cat, items }) => (
          <div key={cat}>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-0.5">{cat}</p>
            <div className="space-y-1">
              {items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all text-sm",
                    anim.preset === p.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-base w-5 text-center shrink-0 leading-none">{p.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs leading-none mb-0.5">{p.label}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{p.description}</p>
                  </div>
                  {anim.preset === p.id && p.id !== "none" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {anim.preset !== "none" && (
        <>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <span className="text-xs font-mono text-muted-foreground">{anim.duration}s</span>
              </div>
              <Slider min={0.5} max={15} step={0.5} value={[anim.duration]} onValueChange={setDuration} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Delay</Label>
                <span className="text-xs font-mono text-muted-foreground">{anim.delay}s</span>
              </div>
              <Slider min={0} max={8} step={0.25} value={[anim.delay]} onValueChange={setDelay} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Loop</Label>
              <Switch checked={anim.loop} onCheckedChange={setLoop} />
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <p className="text-[9px] text-muted-foreground font-mono leading-relaxed break-all">
                animation: {anim.preset} {anim.duration}s ease-in-out {anim.delay}s {anim.loop ? "infinite" : "1"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
