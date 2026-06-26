// ─── DesignTokenEditor.tsx ─────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorSwatchEditor from "./ColorSwatchEditor";
import TypographyEditor from "./TypographyEditor";
import SpacingEditor from "./SpacingEditor";
import DesignMdPreview from "./DesignMdPreview";
import { cn } from "@/lib/utils";

export interface TokenData {
  colors: Record<string, string>;
  typography: {
    display: { family: string; weights: number[] };
    body: { family: string; weights: number[] };
    mono: { family: string; weights: number[] };
  };
  spacing: Record<string, number>;
  radius: Record<string, number>;
  shadows: Record<string, string>;
}

interface DesignTokenEditorProps {
  tokens: TokenData;
  onChange: (tokens: TokenData) => void;
}

export default function DesignTokenEditor({ tokens, onChange }: DesignTokenEditorProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing" | "preview">("colors");
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Animated underline indicator
  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    const containerEl = tabsListRef.current;
    if (activeEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setUnderlineStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      });
    }
  }, [activeTab]);

  const handleColorChange = (name: string, hex: string) => {
    onChange({
      ...tokens,
      colors: { ...tokens.colors, [name]: hex },
    });
  };

  const handleFontChange = (
    role: "display" | "body" | "mono",
    field: "family" | "weights",
    value: string | number[]
  ) => {
    onChange({
      ...tokens,
      typography: {
        ...tokens.typography,
        [role]: { ...tokens.typography[role], [field]: value },
      },
    });
  };

  const handleSpacingChange = (index: number, value: number) => {
    const keys = Object.keys(tokens.spacing);
    const key = keys[index];
    if (!key) return;
    onChange({
      ...tokens,
      spacing: { ...tokens.spacing, [key]: value },
    });
  };

  const handleRadiusChange = (index: number, value: number) => {
    const entries = Object.entries(tokens.radius);
    const [key] = entries[index];
    if (!key) return;
    onChange({
      ...tokens,
      radius: { ...tokens.radius, [key]: value },
    });
  };

  const handleShadowChange = (index: number, value: string) => {
    const entries = Object.entries(tokens.shadows);
    const [key] = entries[index];
    if (!key) return;
    onChange({
      ...tokens,
      shadows: { ...tokens.shadows, [key]: value },
    });
  };

  const tabItems = [
    { key: "colors" as const, label: "Colors" },
    { key: "typography" as const, label: "Typography" },
    { key: "spacing" as const, label: "Spacing & Shape" },
    { key: "preview" as const, label: "Preview" },
  ];

  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(typeof v === "string" ? (v as typeof activeTab) : "colors")}>
        <div className="relative overflow-x-auto scrollbar-hide" ref={tabsListRef}>
          <TabsList className="inline-flex w-auto min-w-full bg-[#0a0a0b] border border-[#27272a] relative">
            {tabItems.map(({ key, label }) => (
              <TabsTrigger
                key={key}
                value={key}
                ref={(el) => { if (el) tabRefs.current.set(key, el); }}
                className="data-[state=active]:bg-[#18181b] text-xs px-3 sm:px-4 relative z-10"
              >
                {label}
              </TabsTrigger>
            ))}
            {/* Animated underline */}
            <div
              className="absolute bottom-0 h-0.5 bg-[#3b82f6] transition-all duration-300 ease-out rounded-full"
              style={{
                left: `${underlineStyle.left}px`,
                width: `${underlineStyle.width}px`,
              }}
            />
          </TabsList>
        </div>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-4 animate-[fadeSlideIn_0.3s_ease-out]">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Object.entries(tokens.colors).map(([name, hex], index) => (
              <div
                key={name}
                className="animate-[scaleIn_0.2s_ease-out_both]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ColorSwatchEditor
                  color={hex}
                  label={name}
                  onChange={(newHex) => handleColorChange(name, newHex)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="mt-4 space-y-3 animate-[fadeSlideIn_0.3s_ease-out]">
          <TypographyEditor
            role="Display"
            fontFamily={tokens.typography.display.family}
            previewText="The quick brown fox jumps"
            selectedWeights={tokens.typography.display.weights}
            onFontFamilyChange={(v) => handleFontChange("display", "family", v)}
            onPreviewTextChange={() => {}}
            onWeightsChange={(w) => handleFontChange("display", "weights", w)}
          />
          <TypographyEditor
            role="Body"
            fontFamily={tokens.typography.body.family}
            previewText="Body text paragraph sample"
            selectedWeights={tokens.typography.body.weights}
            onFontFamilyChange={(v) => handleFontChange("body", "family", v)}
            onPreviewTextChange={() => {}}
            onWeightsChange={(w) => handleFontChange("body", "weights", w)}
          />
          <TypographyEditor
            role="Mono"
            fontFamily={tokens.typography.mono.family}
            previewText="const x = true;"
            selectedWeights={tokens.typography.mono.weights}
            onFontFamilyChange={(v) => handleFontChange("mono", "family", v)}
            onPreviewTextChange={() => {}}
            onWeightsChange={(w) => handleFontChange("mono", "weights", w)}
          />
        </TabsContent>

        {/* Spacing & Shape Tab */}
        <TabsContent value="spacing" className="mt-4 animate-[fadeSlideIn_0.3s_ease-out]">
          <SpacingEditor
            spacing={Object.entries(tokens.spacing).map(([name, value]) => ({
              name,
              value,
            }))}
            radius={Object.entries(tokens.radius).map(([name, value]) => ({
              name,
              value: value >= 9999 ? 9999 : value,
            }))}
            shadows={Object.entries(tokens.shadows).map(([name, value]) => ({
              name,
              value,
            }))}
            onSpacingChange={handleSpacingChange}
            onRadiusChange={handleRadiusChange}
            onShadowChange={handleShadowChange}
          />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-4 animate-[fadeSlideIn_0.3s_ease-out]">
          <DesignMdPreview tokens={tokens} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
