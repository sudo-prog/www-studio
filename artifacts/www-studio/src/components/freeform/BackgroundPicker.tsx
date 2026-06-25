// ── Background Picker ────────────────────────────────────────────────────────
import { useState } from "react";
import { FreeformBackground } from "@/lib/freeform-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Image, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  background: FreeformBackground;
  onChange: (bg: FreeformBackground) => void;
  onClose: () => void;
}

const PRESET_GRADIENTS = [
  "linear-gradient(135deg, #0d1117 0%, #16151c 50%, #1a1a2e 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
];

const PRESET_COLORS = [
  "#0d1117", "#1a1a2e", "#16213e", "#0f3460",
  "#1e1e2f", "#2d2d44", "#1a1a1a", "#0a0a0f",
  "#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB",
  "#F4C5A1", "#4A7C6B", "#C8D8E0", "#E8DDD0",
  "#ffffff", "#f8f8f8", "#e0e0e0", "#333333",
];

export default function BackgroundPicker({ background, onChange, onClose }: Props) {
  const [mode, setMode] = useState<"color" | "gradient" | "image">(background.type);
  const [imgUrl, setImgUrl] = useState(background.type === "image" ? background.value : "");

  const handleApply = () => {
    if (mode === "color") {
      onChange({ type: "color", value: background.value });
    } else if (mode === "gradient") {
      onChange({ type: "gradient", value: background.value });
    } else {
      onChange({ type: "image", value: imgUrl });
    }
    onClose();
  };

  return (
    <div className="absolute left-16 bottom-0 w-72 border border-border bg-background rounded-xl shadow-2xl z-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Canvas Background</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1">
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", mode === "color" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setMode("color")}
        >
          <Palette className="w-3 h-3" /> Color
        </button>
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", mode === "gradient" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setMode("gradient")}
        >
          <Sparkles className="w-3 h-3" /> Gradient
        </button>
        <button
          className={cn("flex-1 py-1 text-[10px] rounded flex items-center justify-center gap-1", mode === "image" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}
          onClick={() => setMode("image")}
        >
          <Image className="w-3 h-3" /> Image
        </button>
      </div>

      {/* Color mode */}
      {mode === "color" && (
        <div>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={cn("w-full aspect-square rounded-md border-2 transition-all", background.value === c ? "border-primary scale-110" : "border-transparent hover:border-white/20")}
                style={{ background: c }}
                onClick={() => onChange({ type: "color", value: c })}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={background.value.startsWith("#") ? background.value : "#0d1117"} onChange={(e) => onChange({ type: "color", value: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
            <Input value={background.value} onChange={(e) => onChange({ type: "color", value: e.target.value })} className="h-7 text-xs flex-1" />
          </div>
        </div>
      )}

      {/* Gradient mode */}
      {mode === "gradient" && (
        <div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {PRESET_GRADIENTS.map((g, i) => (
              <button
                key={i}
                className={cn("w-full aspect-[2/1] rounded-md border-2 transition-all", background.value === g ? "border-primary" : "border-transparent hover:border-white/20")}
                style={{ background: g }}
                onClick={() => onChange({ type: "gradient", value: g })}
              />
            ))}
          </div>
          <Label className="text-[10px] text-muted-foreground">Custom gradient CSS</Label>
          <Input
            value={background.type === "gradient" ? background.value : PRESET_GRADIENTS[0]}
            onChange={(e) => onChange({ type: "gradient", value: e.target.value })}
            className="h-7 text-xs mt-1"
            placeholder="linear-gradient(...)"
          />
        </div>
      )}

      {/* Image mode */}
      {mode === "image" && (
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Image URL</Label>
          <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="h-7 text-xs" placeholder="https://..." />
          {imgUrl && (
            <div className="w-full h-24 rounded-md overflow-hidden border border-border">
              <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleApply}>Apply</Button>
        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
