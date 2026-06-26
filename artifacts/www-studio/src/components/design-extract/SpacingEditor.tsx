// ─── SpacingEditor.tsx ────────────────────────────────────────────────────────
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SpacingValue {
  name: string;
  value: number;
}

interface RadiusValue {
  name: string;
  value: number;
}

interface ShadowValue {
  name: string;
  value: string;
}

interface SpacingEditorProps {
  spacing: SpacingValue[];
  radius: RadiusValue[];
  shadows: ShadowValue[];
  onSpacingChange: (index: number, value: number) => void;
  onRadiusChange: (index: number, value: number) => void;
  onShadowChange: (index: number, value: string) => void;
}

const SPACING_PREVIEW_COLORS = [
  "bg-[#3b82f6]",
  "bg-[#3b82f6]/80",
  "bg-[#3b82f6]/60",
  "bg-[#3b82f6]/40",
  "bg-[#3b82f6]/20",
  "bg-[#22c55e]",
  "bg-[#22c55e]/80",
  "bg-[#22c55e]/60",
];

export default function SpacingEditor({
  spacing,
  radius,
  shadows,
  onSpacingChange,
  onRadiusChange,
  onShadowChange,
}: SpacingEditorProps) {
  return (
    <div className="space-y-6">
      {/* Spacing Scale */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Spacing Scale
        </span>
        <div className="space-y-3">
          {spacing.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 font-mono">
                {s.name}
              </span>
              <Slider
                value={[s.value]}
                min={0}
                max={96}
                step={1}
                onValueChange={(v) => onSpacingChange(i, v[0])}
                className="flex-1"
              />
              <span className="text-xs font-mono text-foreground w-10 text-right">
                {s.value}px
              </span>
              <div
                className={cn(
                  "h-3 rounded-sm",
                  SPACING_PREVIEW_COLORS[i % SPACING_PREVIEW_COLORS.length]
                )}
                style={{ width: `${Math.min(s.value, 200)}px` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Border Radius
        </span>
        <div className="space-y-3">
          {radius.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">
                {r.name}
              </span>
              <Slider
                value={[r.name === "full" ? 9999 : r.value]}
                min={0}
                max={9999}
                step={r.name === "full" ? 9999 : 1}
                onValueChange={(v) => onRadiusChange(i, v[0])}
                className="flex-1"
              />
              <span className="text-xs font-mono text-foreground w-12 text-right">
                {r.value >= 9999 ? "full" : `${r.value}px`}
              </span>
              <div
                className="w-12 h-8 bg-[#3b82f6]/20 border border-[#3b82f6]/40"
                style={{
                  borderRadius: r.value >= 9999 ? "9999px" : `${r.value}px`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Box Shadows
        </span>
        <div className="space-y-2">
          {shadows.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">
                {s.name}
              </span>
              <Input
                value={s.value}
                onChange={(e) => onShadowChange(i, e.target.value)}
                placeholder="0 4px 12px rgba(0,0,0,0.1)"
                className="flex-1 bg-[#18181b] border-[#27272a] text-foreground font-mono text-xs h-8"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
