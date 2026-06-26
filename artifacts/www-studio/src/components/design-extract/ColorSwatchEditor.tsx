// ─── ColorSwatchEditor.tsx ──────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorSwatchEditorProps {
  color: string;
  label: string;
  onChange: (color: string) => void;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function lighten(hex: string, amount: number = 15): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.min(255, rgb.r + amount),
    Math.min(255, rgb.g + amount),
    Math.min(255, rgb.b + amount)
  );
}

function darken(hex: string, amount: number = 15): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.max(0, rgb.r - amount),
    Math.max(0, rgb.g - amount),
    Math.max(0, rgb.b - amount)
  );
}

export default function ColorSwatchEditor({
  color,
  label,
  onChange,
}: ColorSwatchEditorProps) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(color);

  useEffect(() => {
    setHexInput(color);
  }, [color]);

  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(hexInput);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val);
    }
  }

  const contrastWhite = contrastRatio(hexInput || color, "#ffffff");
  const contrastBlack = contrastRatio(hexInput || color, "#000000");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#27272a] transition-colors"
          title={`${label}: ${color}`}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-[#27272a] group-hover:border-[#3b82f6] transition-colors shadow-md"
            style={{ backgroundColor: color }}
          />
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
          <span className="text-[10px] font-mono text-muted-foreground/60">
            {color.toUpperCase()}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-[#18181b] border-[#27272a]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <span className="text-xs text-muted-foreground font-mono">
              {color.toUpperCase()}
            </span>
          </div>

          {/* Full color preview + picker */}
          <div
            className="h-24 rounded-lg border border-[#27272a] relative overflow-hidden"
            style={{ backgroundColor: hexInput || color }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{
                  color: getLuminance(hexInput || color) > 0.5 ? "#000" : "#fff",
                }}
              >
                {label}
              </span>
            </div>
          </div>

          {/* Hex input */}
          <div className="flex gap-2">
            <Input
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              className={cn(
                "flex-1 bg-[#0a0a0b] border-[#27272a] text-foreground font-mono h-8 text-sm",
                !isValidHex && "border-red-500"
              )}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
              onClick={() => {
                const lighter = lighten(color);
                onChange(lighter);
                setHexInput(lighter);
              }}
            >
              Lighten
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs border-[#27272a] bg-[#0a0a0b] hover:bg-[#27272a]"
              onClick={() => {
                const darker = darken(color);
                onChange(darker);
                setHexInput(darker);
              }}
            >
              Darken
            </Button>
          </div>

          {/* Contrast display */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] text-muted-foreground">WCAG Contrast</p>
            <div className="flex gap-2">
              <div className="flex-1 px-2 py-1 rounded bg-white text-black text-[11px] flex items-center justify-between">
                <span>White text</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    contrastWhite >= 4.5 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {contrastWhite.toFixed(1)}:1
                </span>
              </div>
              <div className="flex-1 px-2 py-1 rounded bg-black border border-[#27272a] text-white text-[11px] flex items-center justify-between">
                <span>Black text</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    contrastBlack >= 4.5 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {contrastBlack.toFixed(1)}:1
                </span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
