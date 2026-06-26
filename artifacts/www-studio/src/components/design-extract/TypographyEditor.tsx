// ─── TypographyEditor.tsx ─────────────────────────────────────────────────────
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const WEIGHTS = [
  { value: 400, label: "400" },
  { value: 500, label: "500" },
  { value: 600, label: "600" },
  { value: 700, label: "700" },
];

interface TypographyEditorProps {
  role: string;
  fontFamily: string;
  previewText: string;
  selectedWeights: number[];
  onFontFamilyChange: (value: string) => void;
  onPreviewTextChange: (value: string) => void;
  onWeightsChange: (weights: number[]) => void;
}

export default function TypographyEditor({
  role,
  fontFamily,
  previewText,
  selectedWeights,
  onFontFamilyChange,
  onPreviewTextChange,
  onWeightsChange,
}: TypographyEditorProps) {
  const toggleWeight = (weight: number) => {
    if (selectedWeights.includes(weight)) {
      onWeightsChange(selectedWeights.filter((w) => w !== weight));
    } else {
      onWeightsChange([...selectedWeights, weight].sort());
    }
  };

  return (
    <div className="space-y-3 p-3 bg-[#0a0a0b] rounded-lg border border-[#27272a]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {role}
        </span>
      </div>

      <Input
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value)}
        placeholder="e.g. Inter"
        className="bg-[#18181b] border-[#27272a] text-foreground h-8 text-sm"
      />

      <div className="flex gap-2">
        {WEIGHTS.map(({ value, label }) => (
          <label
            key={value}
            className="flex items-center gap-1 cursor-pointer"
          >
            <Checkbox
              checked={selectedWeights.includes(value)}
              onCheckedChange={() => toggleWeight(value)}
              className="border-[#27272a] data-[state=checked]:bg-[#3b82f6] data-[state=checked]:border-[#3b82f6]"
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </label>
        ))}
      </div>

      <div
        className="p-3 rounded bg-[#111113] border border-[#27272a] min-h-[60px]"
        style={{
          fontFamily: fontFamily || "inherit",
          fontWeight: selectedWeights[0] || 400,
        }}
      >
        <input
          type="text"
          value={previewText}
          onChange={(e) => onPreviewTextChange(e.target.value)}
          className={cn(
            "w-full bg-transparent text-foreground text-lg outline-none",
            !fontFamily && "text-muted-foreground/50 italic"
          )}
          placeholder={fontFamily ? "Type preview text..." : "Set font family first"}
          readOnly={!fontFamily}
        />
      </div>
    </div>
  );
}
