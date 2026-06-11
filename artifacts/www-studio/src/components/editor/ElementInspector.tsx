import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  ArrowRight, ArrowDown, ArrowLeft, ArrowUp,
  Link2, Link2Off, ExternalLink, ChevronDown,
  Maximize2, Square, Type, Palette, Move,
  ChevronsUpDown,
} from "lucide-react";

export interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  text: string;
  styles: Record<string, string>;
}

interface Props {
  element: ElementInfo;
  pages: { id: string; name: string }[];
  onStyleChange: (property: string, value: string) => void;
  onLinkChange: (href: string, target: string) => void;
  onRemoveLink: () => void;
}

type InspectorTab = "layout" | "style" | "text" | "link";

// ── Helpers ──────────────────────────────────────────────────────────
function parseNum(v: string) {
  return parseFloat(v) || 0;
}
function px(v: string) {
  return v.endsWith("px") ? v : v ? `${v}px` : "";
}

function SpacingInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const num = parseNum(value);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <input
        type="number"
        value={Math.round(num)}
        onChange={(e) => onChange(px(e.target.value))}
        className="w-full h-7 text-center text-xs font-mono bg-muted/50 border border-border/40 rounded px-1 focus:outline-none focus:border-primary"
      />
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function ColorSwatch({
  label, value, onChange, transparent,
}: { label: string; value: string; onChange: (v: string) => void; transparent?: boolean }) {
  const displayColor = (!value || value === "transparent" || value === "rgba(0,0,0,0)") ? "#00000000" : value;
  const isTransparent = !value || value === "transparent" || value === "rgba(0,0,0,0)";
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-7 h-7 shrink-0 rounded-md border border-border/60 overflow-hidden cursor-pointer"
        style={{ background: isTransparent ? "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px" : displayColor }}>
        <input
          type="color"
          value={isTransparent ? "#ffffff" : displayColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-mono truncate">{isTransparent ? "transparent" : value}</p>
      </div>
      {transparent && !isTransparent && (
        <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => onChange("transparent")}>
          clear
        </button>
      )}
    </div>
  );
}

function IconToggleGroup<T extends string>({
  options, value, onChange,
}: {
  options: { val: T; label: string; icon?: React.ReactNode; text?: string }[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 border border-border/50 rounded-md p-0.5 bg-muted/20">
      {options.map((o) => (
        <button
          key={o.val}
          title={o.label}
          onClick={() => onChange(o.val)}
          className={cn(
            "flex-1 flex items-center justify-center h-7 rounded text-xs transition-colors",
            value === o.val ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {o.icon ?? <span className="font-mono text-[10px]">{o.text}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Layout Tab ───────────────────────────────────────────────────────
function LayoutTab({ styles, onStyleChange }: { styles: Record<string, string>; onStyleChange: (p: string, v: string) => void }) {
  const display = styles.display || "block";

  const DISPLAY_OPTS = [
    { val: "block", label: "Block", text: "Block" },
    { val: "flex", label: "Flex", text: "Flex" },
    { val: "grid", label: "Grid", text: "Grid" },
    { val: "inline-flex", label: "Inline Flex", text: "I-Flex" },
    { val: "inline", label: "Inline", text: "Inline" },
    { val: "none", label: "Hidden", text: "None" },
  ];

  const FLEX_DIR = [
    { val: "row", label: "Row →", icon: <ArrowRight className="w-3 h-3" /> },
    { val: "column", label: "Column ↓", icon: <ArrowDown className="w-3 h-3" /> },
    { val: "row-reverse", label: "Row Reverse ←", icon: <ArrowLeft className="w-3 h-3" /> },
    { val: "column-reverse", label: "Column Reverse ↑", icon: <ArrowUp className="w-3 h-3" /> },
  ];

  const JUSTIFY = [
    { val: "flex-start", label: "Start", text: "|←" },
    { val: "center", label: "Center", text: "⊙" },
    { val: "flex-end", label: "End", text: "→|" },
    { val: "space-between", label: "Space Between", text: "|·|" },
    { val: "space-around", label: "Space Around", text: "·|·" },
  ];

  const ALIGN = [
    { val: "flex-start", label: "Start", text: "↑" },
    { val: "center", label: "Center", text: "⊕" },
    { val: "flex-end", label: "End", text: "↓" },
    { val: "stretch", label: "Stretch", text: "↕" },
  ];

  const isFlex = display === "flex" || display === "inline-flex";
  const isGrid = display === "grid" || display === "inline-grid";

  return (
    <div className="space-y-4 p-3">
      {/* Display */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Display</label>
        <div className="grid grid-cols-3 gap-1">
          {DISPLAY_OPTS.map((o) => (
            <button
              key={o.val}
              onClick={() => onStyleChange("display", o.val)}
              className={cn(
                "h-7 text-xs rounded border transition-colors",
                display === o.val ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {o.text}
            </button>
          ))}
        </div>
      </div>

      {/* Flex controls */}
      {isFlex && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Direction</label>
            <IconToggleGroup options={FLEX_DIR} value={styles.flexDirection || "row"} onChange={(v) => onStyleChange("flexDirection", v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Justify (main axis)</label>
            <IconToggleGroup options={JUSTIFY} value={styles.justifyContent || "flex-start"} onChange={(v) => onStyleChange("justifyContent", v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Align (cross axis)</label>
            <IconToggleGroup options={ALIGN} value={styles.alignItems || "stretch"} onChange={(v) => onStyleChange("alignItems", v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Gap</label>
              <Input value={styles.gap || ""} onChange={(e) => onStyleChange("gap", e.target.value)} placeholder="0px" className="h-7 text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Wrap</label>
              <select value={styles.flexWrap || "nowrap"} onChange={(e) => onStyleChange("flexWrap", e.target.value)}
                className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background text-foreground">
                <option value="nowrap">No Wrap</option>
                <option value="wrap">Wrap</option>
                <option value="wrap-reverse">Wrap Rev.</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid controls */}
      {isGrid && (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Columns</label>
            <Input value={styles.gridTemplateColumns || ""} onChange={(e) => onStyleChange("gridTemplateColumns", e.target.value)}
              placeholder="repeat(3, 1fr)" className="h-7 text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Gap</label>
            <Input value={styles.gap || ""} onChange={(e) => onStyleChange("gap", e.target.value)} placeholder="0px" className="h-7 text-xs font-mono" />
          </div>
        </div>
      )}

      {/* Size */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Size</label>
        <div className="grid grid-cols-2 gap-2">
          {[["Width", "width"], ["Height", "height"], ["Min W", "minWidth"], ["Max W", "maxWidth"]].map(([label, prop]) => (
            <div key={prop} className="space-y-1">
              <label className="text-[10px] text-muted-foreground">{label}</label>
              <Input value={styles[prop] || ""} onChange={(e) => onStyleChange(prop, e.target.value)} placeholder="auto" className="h-7 text-xs font-mono" />
            </div>
          ))}
        </div>
      </div>

      {/* Spacing — Padding */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Padding</label>
        <div className="grid grid-cols-4 gap-1.5">
          <SpacingInput label="Top" value={styles.paddingTop || "0px"} onChange={(v) => onStyleChange("paddingTop", v)} />
          <SpacingInput label="Right" value={styles.paddingRight || "0px"} onChange={(v) => onStyleChange("paddingRight", v)} />
          <SpacingInput label="Bottom" value={styles.paddingBottom || "0px"} onChange={(v) => onStyleChange("paddingBottom", v)} />
          <SpacingInput label="Left" value={styles.paddingLeft || "0px"} onChange={(v) => onStyleChange("paddingLeft", v)} />
        </div>
      </div>

      {/* Spacing — Margin */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Margin</label>
        <div className="grid grid-cols-4 gap-1.5">
          <SpacingInput label="Top" value={styles.marginTop || "0px"} onChange={(v) => onStyleChange("marginTop", v)} />
          <SpacingInput label="Right" value={styles.marginRight || "0px"} onChange={(v) => onStyleChange("marginRight", v)} />
          <SpacingInput label="Bottom" value={styles.marginBottom || "0px"} onChange={(v) => onStyleChange("marginBottom", v)} />
          <SpacingInput label="Left" value={styles.marginLeft || "0px"} onChange={(v) => onStyleChange("marginLeft", v)} />
        </div>
      </div>

      {/* Position */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Position</label>
        <select value={styles.position || "static"} onChange={(e) => onStyleChange("position", e.target.value)}
          className="w-full h-7 px-2 text-xs rounded border border-input bg-background text-foreground">
          <option value="static">Static</option>
          <option value="relative">Relative</option>
          <option value="absolute">Absolute</option>
          <option value="fixed">Fixed</option>
          <option value="sticky">Sticky</option>
        </select>
      </div>
    </div>
  );
}

// ── Style Tab ────────────────────────────────────────────────────────
function StyleTab({ styles, onStyleChange }: { styles: Record<string, string>; onStyleChange: (p: string, v: string) => void }) {
  const SHADOW_PRESETS = [
    { label: "None", val: "none" },
    { label: "Sm", val: "0 1px 2px rgba(0,0,0,0.1)" },
    { label: "Md", val: "0 4px 12px rgba(0,0,0,0.15)" },
    { label: "Lg", val: "0 8px 24px rgba(0,0,0,0.2)" },
    { label: "Glow", val: "0 0 20px rgba(99,102,241,0.5)" },
    { label: "Inner", val: "inset 0 2px 6px rgba(0,0,0,0.15)" },
  ];

  const RADIUS_PRESETS = ["0px", "4px", "8px", "12px", "16px", "24px", "50%"];

  return (
    <div className="space-y-4 p-3">
      {/* Background */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Background</label>
        <ColorSwatch label="Fill color" value={styles.backgroundColor || ""} onChange={(v) => onStyleChange("backgroundColor", v)} transparent />
      </div>

      {/* Opacity */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider flex justify-between">
          <span>Opacity</span>
          <span>{Math.round(parseFloat(styles.opacity || "1") * 100)}%</span>
        </label>
        <input type="range" min="0" max="1" step="0.01"
          value={parseFloat(styles.opacity || "1")}
          onChange={(e) => onStyleChange("opacity", e.target.value)}
          className="w-full accent-primary h-1.5"
        />
      </div>

      {/* Border */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Border</label>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Width</label>
            <Input value={styles.borderWidth || "0px"} onChange={(e) => onStyleChange("borderWidth", e.target.value)} placeholder="0px" className="h-7 text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Style</label>
            <select value={styles.borderStyle || "solid"} onChange={(e) => onStyleChange("borderStyle", e.target.value)}
              className="w-full h-7 px-1 text-xs rounded border border-input bg-background text-foreground">
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Color</label>
            <div className="relative w-full h-7 rounded border border-border/60 overflow-hidden cursor-pointer"
              style={{ background: styles.borderColor || "#000000" }}>
              <input type="color" value={styles.borderColor || "#000000"}
                onChange={(e) => onStyleChange("borderColor", e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Radius</label>
        <div className="flex flex-wrap gap-1">
          {RADIUS_PRESETS.map((r) => (
            <button key={r} onClick={() => onStyleChange("borderRadius", r)}
              className={cn("px-2 h-6 text-[10px] font-mono rounded border transition-colors",
                styles.borderRadius === r ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              )}>
              {r}
            </button>
          ))}
        </div>
        <Input value={styles.borderRadius || ""} onChange={(e) => onStyleChange("borderRadius", e.target.value)}
          placeholder="custom…" className="h-7 text-xs font-mono" />
      </div>

      {/* Box Shadow */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Shadow</label>
        <div className="flex flex-wrap gap-1">
          {SHADOW_PRESETS.map((s) => (
            <button key={s.label} onClick={() => onStyleChange("boxShadow", s.val)}
              className={cn("px-2 h-6 text-[10px] rounded border transition-colors",
                styles.boxShadow === s.val ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              )}>
              {s.label}
            </button>
          ))}
        </div>
        <Input value={styles.boxShadow === "none" ? "" : (styles.boxShadow || "")}
          onChange={(e) => onStyleChange("boxShadow", e.target.value || "none")}
          placeholder="custom…" className="h-7 text-xs font-mono" />
      </div>

      {/* Overflow */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Overflow</label>
        <IconToggleGroup
          options={[{ val: "visible", label: "Visible", text: "Vis" }, { val: "hidden", label: "Hidden", text: "Hide" }, { val: "auto", label: "Scroll", text: "Auto" }, { val: "clip", label: "Clip", text: "Clip" }]}
          value={styles.overflow || "visible"}
          onChange={(v) => onStyleChange("overflow", v)}
        />
      </div>
    </div>
  );
}

// ── Text Tab ─────────────────────────────────────────────────────────
function TextTab({ styles, onStyleChange }: { styles: Record<string, string>; onStyleChange: (p: string, v: string) => void }) {
  const FONTS = ["Inter, sans-serif", "DM Sans, sans-serif", "Geist, sans-serif", "Manrope, sans-serif", "JetBrains Mono, monospace", "Georgia, serif", "Times New Roman, serif"];

  return (
    <div className="space-y-4 p-3">
      {/* Color */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Text Color</label>
        <ColorSwatch label="Color" value={styles.color || "#000000"} onChange={(v) => onStyleChange("color", v)} />
      </div>

      {/* Font */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Font Family</label>
        <select value={styles.fontFamily || "Inter, sans-serif"} onChange={(e) => onStyleChange("fontFamily", e.target.value)}
          className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background text-foreground">
          {FONTS.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
        </select>
      </div>

      {/* Size + Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">Size</label>
          <Input value={styles.fontSize || ""} onChange={(e) => onStyleChange("fontSize", e.target.value)} placeholder="16px" className="h-7 text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">Weight</label>
          <select value={styles.fontWeight || "400"} onChange={(e) => onStyleChange("fontWeight", e.target.value)}
            className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background text-foreground">
            <option value="300">Light 300</option>
            <option value="400">Regular 400</option>
            <option value="500">Medium 500</option>
            <option value="600">Semibold 600</option>
            <option value="700">Bold 700</option>
            <option value="800">Extra Bold 800</option>
            <option value="900">Black 900</option>
          </select>
        </div>
      </div>

      {/* Line height + Letter spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">Line Height</label>
          <Input value={styles.lineHeight || ""} onChange={(e) => onStyleChange("lineHeight", e.target.value)} placeholder="1.5" className="h-7 text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">Letter Spacing</label>
          <Input value={styles.letterSpacing || ""} onChange={(e) => onStyleChange("letterSpacing", e.target.value)} placeholder="0em" className="h-7 text-xs font-mono" />
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Alignment</label>
        <IconToggleGroup
          options={[
            { val: "left", label: "Left", icon: <AlignLeft className="w-3.5 h-3.5" /> },
            { val: "center", label: "Center", icon: <AlignCenter className="w-3.5 h-3.5" /> },
            { val: "right", label: "Right", icon: <AlignRight className="w-3.5 h-3.5" /> },
            { val: "justify", label: "Justify", icon: <AlignJustify className="w-3.5 h-3.5" /> },
          ]}
          value={styles.textAlign || "left"}
          onChange={(v) => onStyleChange("textAlign", v)}
        />
      </div>

      {/* Decoration */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Style</label>
        <div className="flex gap-1">
          {[
            { val: "italic", prop: "fontStyle", label: "Italic", icon: <Italic className="w-3 h-3" /> },
            { val: "underline", prop: "textDecoration", label: "Underline", icon: <Underline className="w-3 h-3" /> },
            { val: "line-through", prop: "textDecoration", label: "Strikethrough", icon: <Strikethrough className="w-3 h-3" /> },
          ].map((btn) => (
            <button key={btn.val} title={btn.label}
              onClick={() => onStyleChange(btn.prop, styles[btn.prop] === btn.val ? "none" : btn.val)}
              className={cn("w-8 h-7 flex items-center justify-center rounded border transition-colors",
                styles[btn.prop] === btn.val ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              )}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Text Transform */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Transform</label>
        <div className="flex gap-1">
          {[{ val: "none", text: "Ag" }, { val: "uppercase", text: "AG" }, { val: "lowercase", text: "ag" }, { val: "capitalize", text: "Ag+" }].map((o) => (
            <button key={o.val} onClick={() => onStyleChange("textTransform", o.val)}
              className={cn("flex-1 h-7 text-xs rounded border transition-colors font-mono",
                styles.textTransform === o.val ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              )}>
              {o.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Link Tab ─────────────────────────────────────────────────────────
function LinkTab({
  styles, pages, onLinkChange, onRemoveLink,
}: {
  styles: Record<string, string>;
  pages: { id: string; name: string }[];
  onLinkChange: (href: string, target: string) => void;
  onRemoveLink: () => void;
}) {
  const [linkType, setLinkType] = useState<"none" | "url" | "page" | "email" | "phone">(() => {
    if (!styles.href) return "none";
    if (styles.href.startsWith("mailto:")) return "email";
    if (styles.href.startsWith("tel:")) return "phone";
    if (styles.href.startsWith("#") || pages.some((p) => p.id === styles.href)) return "page";
    return "url";
  });
  const [urlVal, setUrlVal] = useState(styles.href || "");
  const [openNew, setOpenNew] = useState(styles.target === "_blank");

  const apply = (href: string, newTab?: boolean) => {
    onLinkChange(href, (newTab ?? openNew) ? "_blank" : "");
  };

  return (
    <div className="space-y-4 p-3">
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Link Type</label>
        <div className="grid grid-cols-3 gap-1">
          {(["none", "url", "page", "email", "phone"] as const).map((t) => (
            <button key={t} onClick={() => setLinkType(t)}
              className={cn("h-7 text-xs rounded border capitalize transition-colors",
                linkType === t ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {linkType === "url" && (
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">URL</label>
          <div className="flex gap-1.5">
            <Input value={urlVal} onChange={(e) => setUrlVal(e.target.value)} placeholder="https://..." className="h-8 text-xs" />
            <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => apply(urlVal)}>Set</Button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={openNew} onChange={(e) => { setOpenNew(e.target.checked); apply(urlVal, e.target.checked); }}
              className="w-3.5 h-3.5 accent-primary" />
            <span className="text-xs text-muted-foreground">Open in new tab</span>
          </label>
        </div>
      )}

      {linkType === "page" && (
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Target Page</label>
          <select onChange={(e) => apply(e.target.value)}
            className="w-full h-8 px-2 text-xs rounded border border-input bg-background text-foreground">
            <option value="">Select a page…</option>
            {pages.map((p) => <option key={p.id} value={`#${p.id}`}>{p.name}</option>)}
          </select>
        </div>
      )}

      {linkType === "email" && (
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Email Address</label>
          <div className="flex gap-1.5">
            <Input value={urlVal.replace("mailto:", "")} onChange={(e) => setUrlVal("mailto:" + e.target.value)} placeholder="name@example.com" className="h-8 text-xs" />
            <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => apply(urlVal)}>Set</Button>
          </div>
        </div>
      )}

      {linkType === "phone" && (
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone Number</label>
          <div className="flex gap-1.5">
            <Input value={urlVal.replace("tel:", "")} onChange={(e) => setUrlVal("tel:" + e.target.value)} placeholder="+1 555 000 0000" className="h-8 text-xs" />
            <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => apply(urlVal)}>Set</Button>
          </div>
        </div>
      )}

      {styles.href && (
        <Button variant="ghost" size="sm" className="w-full gap-1.5 text-red-400 hover:text-red-400 hover:bg-red-400/10" onClick={onRemoveLink}>
          <Link2Off className="w-3.5 h-3.5" />Remove Link
        </Button>
      )}

      {styles.href && (
        <div className="rounded-lg border border-border/40 p-2 bg-muted/20">
          <p className="text-[10px] text-muted-foreground mb-1">Current link</p>
          <p className="text-xs font-mono truncate text-foreground">{styles.href}</p>
          {styles.target === "_blank" && <span className="text-[10px] text-muted-foreground">Opens in new tab</span>}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export function ElementInspector({ element, pages, onStyleChange, onLinkChange, onRemoveLink }: Props) {
  const [tab, setTab] = useState<InspectorTab>("layout");

  const TABS: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
    { id: "layout", label: "Layout", icon: <Maximize2 className="w-3 h-3" /> },
    { id: "style", label: "Style", icon: <Palette className="w-3 h-3" /> },
    { id: "text", label: "Text", icon: <Type className="w-3 h-3" /> },
    { id: "link", label: "Link", icon: <Link2 className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Element header */}
      <div className="px-3 py-2 border-b border-border/50 bg-muted/20 shrink-0">
        <div className="flex items-center gap-1.5">
          <code className="text-xs font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded">{`<${element.tagName}>`}</code>
          {element.id && <span className="text-xs text-muted-foreground font-mono truncate">#{element.id}</span>}
          {!element.id && element.text && (
            <span className="text-xs text-muted-foreground truncate">"{element.text.slice(0, 24)}"</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 shrink-0">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 h-9 text-[9px] font-medium transition-colors border-b-2",
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        {tab === "layout" && <LayoutTab styles={element.styles} onStyleChange={onStyleChange} />}
        {tab === "style" && <StyleTab styles={element.styles} onStyleChange={onStyleChange} />}
        {tab === "text" && <TextTab styles={element.styles} onStyleChange={onStyleChange} />}
        {tab === "link" && <LinkTab styles={element.styles} pages={pages} onLinkChange={onLinkChange} onRemoveLink={onRemoveLink} />}
      </ScrollArea>
    </div>
  );
}
