import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shuffle, Loader2, Sparkles, Zap } from "lucide-react";
import { type FreeformElement, makeFreeformElement } from "@/lib/freeform-types";

const CHAOS_PRESETS = [
  { id: "gentle", label: "Gentle Chaos", emoji: "🌿", description: "A few well-placed elements", count: 3, spread: 0.5 },
  { id: "wild", label: "Wild Chaos", emoji: "🎪", description: "Moderate mayhem", count: 6, spread: 0.8 },
  { id: "total", label: "Total Chaos", emoji: "💥", description: "Full random explosion", count: 12, spread: 1 },
  { id: "minimal", label: "Minimal Touch", emoji: "✨", description: "Just a hint of chaos", count: 2, spread: 0.3 },
];

const CHAOS_COLORS = [
  "#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB", "#F4C5A1",
  "#4A7C6B", "#C8D8E0", "#E8DDD0", "#6B7DB3", "#FFD580",
];

const CHAOS_SHAPES: Array<"rectangle" | "circle" | "star" | "diamond" | "triangle"> = [
  "rectangle", "circle", "star", "diamond", "triangle",
];

interface Props {
  canvasWidth: number;
  canvasHeight: number;
  onApply: (elements: FreeformElement[]) => void;
}

export function ChaosMonkeyV2({ canvasWidth, canvasHeight, onApply }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastPreset, setLastPreset] = useState<string | null>(null);

  const generateChaos = (presetId: string) => {
    const preset = CHAOS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setGenerating(true);
    setTimeout(() => {
      const elements: FreeformElement[] = [];
      for (let i = 0; i < preset.count; i++) {
        const size = 40 + Math.random() * 160 * preset.spread;
        const types: Array<"shape" | "text" | "sticker"> = ["shape", "shape", "text"];
        const type = types[Math.floor(Math.random() * types.length)];
        const color = CHAOS_COLORS[Math.floor(Math.random() * CHAOS_COLORS.length)];
        const x = Math.random() * (canvasWidth - size);
        const y = Math.random() * (canvasHeight - size);

        if (type === "text") {
          elements.push(makeFreeformElement("text", {
            x, y, width: 200, height: 50,
            text: ["Vibes", "Hello", "Wow", "Art", "Flow", "Dream"][Math.floor(Math.random() * 6)],
            fontSize: 24 + Math.floor(Math.random() * 32),
            color,
            rotation: Math.random() * 30 - 15,
            name: "Chaos Text",
          }));
        } else {
          elements.push(makeFreeformElement("shape", {
            x, y, width: size, height: size,
            fill: color,
            shapeKind: CHAOS_SHAPES[Math.floor(Math.random() * CHAOS_SHAPES.length)],
            opacity: 0.4 + Math.random() * 0.6,
            rotation: Math.random() * 360,
            borderRadius: Math.random() > 0.5 ? 999 : 8,
            name: "Chaos Shape",
          }));
        }
      }
      onApply(elements);
      setLastPreset(presetId);
      setGenerating(false);
      setOpen(false);
      toast({ title: `${preset.emoji} ${preset.label}!`, description: `Added ${preset.count} chaotic elements` });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="w-3.5 h-3.5" />
          Chaos Monkey v2
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-primary" />
            AI Chaos Monkey v2
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {CHAOS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => generateChaos(preset.id)}
              disabled={generating}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              <span className="text-2xl">{preset.emoji}</span>
              <span className="text-xs font-medium">{preset.label}</span>
              <span className="text-[10px] text-muted-foreground">{preset.description}</span>
            </button>
          ))}
        </div>
        {generating && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Generating chaos...</span>
          </div>
        )}
        {lastPreset && !generating && (
          <p className="text-[10px] text-muted-foreground text-center pb-2">
            Last run: {CHAOS_PRESETS.find(p => p.id === lastPreset)?.label}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
