import { FreeformElement, ShapeKind, LayoutMode } from "@/lib/freeform-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2, Copy, ChevronUp, ChevronDown, Lock, Unlock,
  RotateCw, Palette, Type, Image, Square, MousePointer,
  LayoutGrid, Columns3, Rows3, Box, Combine, Minus, CircleDot, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selectedEl: FreeformElement | null;
  onUpdate: (id: string, updates: Partial<FreeformElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSendForward: () => void;
  onSendBackward: () => void;
  className?: string;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 text-xs bg-muted/50"
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</Label>
      <div className="flex items-center gap-1 flex-1">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs flex-1 bg-muted/50"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-7 text-xs bg-muted/50 rounded-md px-2"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FreeformPropertiesPanel({
  selectedEl,
  onUpdate,
  onDelete,
  onDuplicate,
  onSendForward,
  onSendBackward,
  className,
}: Props) {
  if (!selectedEl) {
    return (
      <div className={cn("shrink-0 border-l border-border bg-background p-4 flex flex-col items-center justify-center text-center", className)}>
        <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mb-3">
          <MousePointer className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <p className="text-xs text-muted-foreground">Select an element to edit its properties</p>
      </div>
    );
  }

  const el = selectedEl;
  const update = (updates: Partial<FreeformElement>) => onUpdate(el.id, updates);

  const typeIcon = {
    text: <Type className="w-3 h-3" />,
    image: <Image className="w-3 h-3" />,
    shape: <Square className="w-3 h-3" />,
    button: <MousePointer className="w-3 h-3" />,
    sticker: <Image className="w-3 h-3" />,
    embed: <Image className="w-3 h-3" />,
    draw: <Palette className="w-3 h-3" />,
    "link-card": <Image className="w-3 h-3" />,
  }[el.type];

  return (
    <div className={cn("shrink-0 border-l border-border bg-background flex flex-col overflow-hidden w-64 md:w-auto", className)}>
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {typeIcon}
          <span className="text-xs font-medium capitalize">{el.type}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => update({ locked: !el.locked })} title={el.locked ? "Unlock" : "Lock"}>
            {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDuplicate} title="Duplicate">
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={onDelete} title="Delete">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Name */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Name</Label>
            <Input
              value={el.name || ""}
              onChange={(e) => update({ name: e.target.value })}
              className="h-7 text-xs"
              placeholder="Element name"
            />
          </div>

          {/* Position & Size */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Transform</Label>
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="X" value={Math.round(el.x)} onChange={(v) => update({ x: v })} />
              <NumberField label="Y" value={Math.round(el.y)} onChange={(v) => update({ y: v })} />
              <NumberField label="W" value={Math.round(el.width)} onChange={(v) => update({ width: Math.max(20, v) })} min={20} />
              <NumberField label="H" value={Math.round(el.height)} onChange={(v) => update({ height: Math.max(20, v) })} min={20} />
            </div>
          </div>

          {/* Rotation & Scale */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Rotation & Scale</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCw className="w-3 h-3 text-muted-foreground" />
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={el.rotation}
                  onChange={(e) => update({ rotation: Number(e.target.value) })}
                  className="flex-1 h-1 accent-primary"
                />
                <span className="text-[10px] tabular-nums w-8 text-right">{Math.round(el.rotation)}°</span>
              </div>
              <NumberField label="Scale" value={el.scale} onChange={(v) => update({ scale: v })} min={0.1} max={5} step={0.1} />
              <NumberField label="Z-Index" value={el.zIndex} onChange={(v) => update({ zIndex: v })} />
              <NumberField label="Opacity" value={el.opacity} onChange={(v) => update({ opacity: v })} min={0} max={1} step={0.05} />
            </div>
          </div>

          {/* Layer ordering */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Layer Order</Label>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={onSendBackward}>
                <ChevronDown className="w-3 h-3" /> Back
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={onSendForward}>
                <ChevronUp className="w-3 h-3" /> Front
              </Button>
            </div>
          </div>

          {/* ── Layout Mode (Flex/Grid) ── */}
          <div className="border-t border-border pt-3">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1">
              <LayoutGrid className="w-3 h-3" /> Layout Mode
            </Label>
            <div className="grid grid-cols-2 gap-1">
              {([
                { mode: "absolute" as LayoutMode, icon: Box, label: "Absolute" },
                { mode: "flex-row" as LayoutMode, icon: Rows3, label: "Row" },
                { mode: "flex-col" as LayoutMode, icon: Columns3, label: "Column" },
                { mode: "grid" as LayoutMode, icon: LayoutGrid, label: "Grid" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => update({ layoutMode: mode })}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 text-[10px] rounded",
                    el.layoutMode === mode ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
            {(el.layoutMode && el.layoutMode !== "absolute") && (
              <div className="mt-2 space-y-2">
                <NumberField label="Gap" value={el.gap || 8} onChange={(v) => update({ gap: v })} min={0} max={100} />
                <NumberField label="Padding" value={el.padding || 0} onChange={(v) => update({ padding: v })} min={0} max={100} />
                {el.layoutMode === "grid" && (
                  <NumberField label="Columns" value={el.gridColumns || 2} onChange={(v) => update({ gridColumns: v })} min={1} max={12} />
                )}
              </div>
            )}
          </div>

          {/* ── Vector Tools (shapes only) ── */}
          {el.type === "shape" && (
            <div className="border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Combine className="w-3 h-3" /> Boolean Operations
              </Label>
              <div className="grid grid-cols-2 gap-1">
                {([
                  { op: "none" as const, label: "None", icon: Box },
                  { op: "union" as const, label: "Union", icon: Combine },
                  { op: "subtract" as const, label: "Subtract", icon: Minus },
                  { op: "intersect" as const, label: "Intersect", icon: CircleDot },
                ]).map(({ op, label, icon: Icon }) => (
                  <button
                    key={op}
                    onClick={() => update({ booleanOp: op })}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 text-[10px] rounded",
                      el.booleanOp === op ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <ColorField label="Fill" value={el.fill || "#7FB5A0"} onChange={(v) => update({ fill: v })} />
                <div className="mt-1">
                  <ColorField label="Stroke" value={el.stroke || "#000000"} onChange={(v) => update({ stroke: v })} />
                </div>
                <div className="mt-1">
                  <NumberField label="Stroke W" value={el.strokeWidth || 0} onChange={(v) => update({ strokeWidth: v })} min={0} />
                </div>
              </div>
            </div>
          )}

          {/* Type-specific properties */}
          {el.type === "text" && (
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Text Content</Label>
              <textarea
                value={el.text || ""}
                onChange={(e) => update({ text: e.target.value })}
                className="w-full text-xs p-2 rounded-md bg-muted/50 border-0 resize-none min-h-[60px] text-foreground"
                placeholder="Enter text..."
              />
              <NumberField label="Size" value={el.fontSize || 24} onChange={(v) => update({ fontSize: v })} min={8} max={200} />
              <NumberField label="Weight" value={el.fontWeight || 400} onChange={(v) => update({ fontWeight: v })} min={100} max={900} step={100} />
              <ColorField label="Color" value={el.color || "#ffffff"} onChange={(v) => update({ color: v })} />
              <div className="flex items-center gap-2">
                <Label className="text-[10px] text-muted-foreground w-14 shrink-0">Align</Label>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => update({ textAlign: align })}
                      className={cn(
                        "px-2 py-1 text-[10px] rounded",
                        el.textAlign === align ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {el.type === "image" && (
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Image Source</Label>
              <Input
                value={el.src || ""}
                onChange={(e) => update({ src: e.target.value })}
                className="h-7 text-xs"
                placeholder="https://..."
              />
              <NumberField label="Radius" value={el.borderRadius || 0} onChange={(v) => update({ borderRadius: v })} min={0} />
            </div>
          )}

          {el.type === "shape" && (
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Shape</Label>
              <div className="grid grid-cols-3 gap-1">
                {(["rectangle", "circle", "triangle", "star", "diamond", "line"] as ShapeKind[]).map((kind) => (
                  <button
                    key={kind}
                    onClick={() => update({ shapeKind: kind })}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded capitalize",
                      el.shapeKind === kind ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {kind}
                  </button>
                ))}
              </div>
              <NumberField label="Radius" value={el.borderRadius || 0} onChange={(v) => update({ borderRadius: v })} min={0} />
            </div>
          )}

          {el.type === "button" && (
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Button</Label>
              <Input
                value={el.label || ""}
                onChange={(e) => update({ label: e.target.value })}
                className="h-7 text-xs"
                placeholder="Button text"
              />
              <Input
                value={el.href || ""}
                onChange={(e) => update({ href: e.target.value })}
                className="h-7 text-xs"
                placeholder="https://..."
              />
              <ColorField label="Fill" value={el.fill || "#3b82f6"} onChange={(v) => update({ fill: v })} />
              <NumberField label="Radius" value={el.borderRadius || 24} onChange={(v) => update({ borderRadius: v })} min={0} />
            </div>
          )}

          {el.type === "embed" && (
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Embed</Label>
              <Input
                value={el.embedUrl || ""}
                onChange={(e) => update({ embedUrl: e.target.value })}
                className="h-7 text-xs"
                placeholder="https://..."
              />
              <SelectField
                label="Type"
                value={el.embedType || "generic"}
                options={[
                  { value: "youtube", label: "YouTube" },
                  { value: "spotify", label: "Spotify" },
                  { value: "twitter", label: "Twitter/X" },
                  { value: "generic", label: "Generic" },
                ]}
                onChange={(v) => update({ embedType: v as any })}
              />
            </div>
          )}

          {el.type === "link-card" && (
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Link Card</Label>
              <Input
                value={el.label || ""}
                onChange={(e) => update({ label: e.target.value })}
                className="h-7 text-xs"
                placeholder="Title"
              />
              <Input
                value={el.href || ""}
                onChange={(e) => update({ href: e.target.value })}
                className="h-7 text-xs"
                placeholder="https://..."
              />
              <ColorField label="BG" value={el.background || "#1a1a2e"} onChange={(v) => update({ background: v })} />
              <NumberField label="Radius" value={el.borderRadius || 12} onChange={(v) => update({ borderRadius: v })} min={0} />
            </div>
          )}

          {/* Visibility */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Visible</Label>
              <button
                onClick={() => update({ visible: !el.visible })}
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative",
                  el.visible ? "bg-primary" : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                    el.visible ? "left-4" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
