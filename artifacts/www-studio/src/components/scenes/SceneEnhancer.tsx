import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { type SceneElement } from "@/lib/scene-types";
import { cn } from "@/lib/utils";

const ENHANCE_MODES = [
  {
    id:    "deeper-calm",
    label: "Deeper Calm",
    emoji: "🌊",
    description: "Softer blues & greens, slower animations, more blur — pure serenity",
    palette: ["#87BBDB", "#7FB5A0", "#B39DC2"],
  },
  {
    id:    "therapy-mode",
    label: "Therapy Mode",
    emoji: "🧘",
    description: "Muted earthy tones, breathing animations, minimal shapes",
    palette: ["#B39DC2", "#C8D8E0", "#E8DDD0"],
  },
  {
    id:    "morning-energy",
    label: "Morning Energy",
    emoji: "🌅",
    description: "Warm corals & peach, faster animations, bright and uplifting",
    palette: ["#E8957A", "#F4C5A1", "#87BBDB"],
  },
  {
    id:    "sleep-wind-down",
    label: "Sleep Wind-Down",
    emoji: "🌙",
    description: "Deep indigo & navy, ultra-slow pulse animations, very low opacity",
    palette: ["#6B7DB3", "#4A7C6B", "#C8D8E0"],
  },
  {
    id:    "focus-flow",
    label: "Focus Flow",
    emoji: "🎯",
    description: "Minimal geometric shapes, cool tones, steady rhythmic animations",
    palette: ["#87BBDB", "#7FB5A0", "#E8DDD0"],
  },
  {
    id:    "cosmic-dreams",
    label: "Cosmic Dreams",
    emoji: "🌌",
    description: "Deep purples and midnight blues, slow spin animations, galactic feel",
    palette: ["#6B3FA0", "#B39DC2", "#4A7C6B"],
  },
  {
    id:    "nature-immersion",
    label: "Nature Immersion",
    emoji: "🌿",
    description: "Forest greens and earth tones, organic drift animations",
    palette: ["#4A7C6B", "#7FB5A0", "#E8DDD0"],
  },
  {
    id:    "golden-hour",
    label: "Golden Hour",
    emoji: "🌇",
    description: "Warm ambers and rose gold, gentle float and breathe",
    palette: ["#F4C5A1", "#E8957A", "#FFD580"],
  },
] as const;

type EnhanceMode = typeof ENHANCE_MODES[number]["id"];

interface Props {
  open:    boolean;
  onClose: () => void;
  sceneId: string;
  onApply: (elements: SceneElement[]) => void;
}

export function SceneEnhancer({ open, onClose, sceneId, onApply }: Props) {
  const { toast }   = useToast();
  const [loading, setLoading] = useState<EnhanceMode | null>(null);

  async function enhance(mode: EnhanceMode) {
    setLoading(mode);
    try {
      const res = await fetch(`/api/scenes/${sceneId}/enhance`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error("Enhance failed");
      const data = await res.json();
      if (Array.isArray(data.elements) && data.elements.length > 0) {
        onApply(data.elements);
        toast({ title: `✨ ${ENHANCE_MODES.find(m => m.id === mode)?.label} applied!` });
        onClose();
      } else {
        toast({ title: "No changes returned", variant: "destructive" });
      }
    } catch {
      toast({ title: "Enhance failed — check LLM connection", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Scene Enhancer
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transform your scene's mood in one click
          </p>
        </DialogHeader>

        <div className="space-y-2.5 pt-1">
          {ENHANCE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => enhance(mode.id)}
              disabled={loading !== null}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                "hover:border-primary/40 hover:bg-primary/5",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                loading === mode.id ? "border-primary bg-primary/10" : "border-border bg-card"
              )}
            >
              <span className="text-2xl shrink-0">{mode.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium">{mode.label}</p>
                  <div className="flex gap-1">
                    {mode.palette.map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{mode.description}</p>
              </div>
              {loading === mode.id && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            </button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-1">
          AI will replace or recolor elements — save first if you want to keep the current state
        </p>
      </DialogContent>
    </Dialog>
  );
}
