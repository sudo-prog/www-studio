import { useState, useCallback, useEffect, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdateProject } from "@workspace/api-client-react";
import { Loader2, Paintbrush, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ThemeTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  border: string;
  radius: string;
  fontFamily: string;
  fontSize: string;
}

const DEFAULTS: ThemeTokens = {
  background: "#09090b",
  foreground: "#fafafa",
  primary: "#3b82f6",
  primaryForeground: "#ffffff",
  secondary: "#27272a",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  accent: "#7c3aed",
  border: "#3f3f46",
  radius: "0.5rem",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
};

const COLOR_TOKENS: { key: keyof ThemeTokens; label: string; color: boolean }[] = [
  { key: "background", label: "Background", color: true },
  { key: "foreground", label: "Foreground", color: true },
  { key: "primary", label: "Primary", color: true },
  { key: "primaryForeground", label: "Primary Text", color: true },
  { key: "secondary", label: "Secondary", color: true },
  { key: "muted", label: "Muted", color: true },
  { key: "mutedForeground", label: "Muted Text", color: true },
  { key: "accent", label: "Accent", color: true },
  { key: "border", label: "Border", color: true },
];

const FONT_PRESETS = ["Inter, sans-serif", "JetBrains Mono, monospace", "Geist, sans-serif", "DM Sans, sans-serif", "Satoshi, sans-serif", "Manrope, sans-serif"];

function buildCss(tokens: ThemeTokens): string {
  return `
:root {
  --background: ${tokens.background};
  --foreground: ${tokens.foreground};
  --primary: ${tokens.primary};
  --primary-foreground: ${tokens.primaryForeground};
  --secondary: ${tokens.secondary};
  --muted: ${tokens.muted};
  --muted-foreground: ${tokens.mutedForeground};
  --accent: ${tokens.accent};
  --border: ${tokens.border};
  --radius: ${tokens.radius};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize};
  background: ${tokens.background};
  color: ${tokens.foreground};
}
body {
  background: ${tokens.background};
  color: ${tokens.foreground};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize};
}
`.trim();
}

function injectThemeCss(iframeRef: RefObject<HTMLIFrameElement | null>, tokens: ThemeTokens) {
  const doc = iframeRef.current?.contentDocument;
  if (!doc) return;
  let style = doc.getElementById("www-studio-theme") as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = "www-studio-theme";
    doc.head?.appendChild(style);
  }
  style.textContent = buildCss(tokens);
}

function parseStoredTheme(themeTokens: string | null | undefined): Partial<ThemeTokens> {
  try {
    const parsed = JSON.parse(themeTokens ?? "{}");
    return parsed.theme ?? {};
  } catch {
    return {};
  }
}

interface ThemeCustomizerProps {
  projectId: string;
  themeTokens?: string | null;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

export function ThemeCustomizer({ projectId, themeTokens, iframeRef }: ThemeCustomizerProps) {
  const stored = parseStoredTheme(themeTokens);
  const [tokens, setTokens] = useState<ThemeTokens>({ ...DEFAULTS, ...stored });
  const [dirty, setDirty] = useState(false);
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const update = useCallback((key: keyof ThemeTokens, value: string) => {
    setTokens((prev) => {
      const next = { ...prev, [key]: value };
      injectThemeCss(iframeRef, next);
      return next;
    });
    setDirty(true);
  }, [iframeRef]);

  const reset = () => {
    setTokens(DEFAULTS);
    injectThemeCss(iframeRef, DEFAULTS);
    setDirty(true);
  };

  const save = () => {
    try {
      const existing = JSON.parse(themeTokens ?? "{}");
      const newTokens = JSON.stringify({ ...existing, theme: tokens });
      updateProject.mutate({ id: projectId, data: { themeTokens: newTokens } }, {
        onSuccess: () => { toast({ title: "Theme saved!" }); setDirty(false); },
        onError: () => toast({ title: "Failed to save theme", variant: "destructive" }),
      });
    } catch {
      toast({ title: "Failed to save theme", variant: "destructive" });
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Colors</p>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Reset to defaults" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-1.5">
          {COLOR_TOKENS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 shrink-0">
                <input
                  type="color"
                  value={tokens[key] as string}
                  onChange={(e) => update(key, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="w-7 h-7 rounded-md border border-border/70 shadow-sm cursor-pointer"
                  style={{ background: tokens[key] as string }}
                />
              </div>
              <span className="text-xs flex-1">{label}</span>
              <Input
                value={tokens[key] as string}
                onChange={(e) => update(key, e.target.value)}
                className="h-6 w-20 text-[10px] font-mono px-1.5 py-0"
              />
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-border/50" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Typography</p>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Font Family</label>
            <select
              value={tokens.fontFamily}
              onChange={(e) => update("fontFamily", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground"
            >
              {FONT_PRESETS.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Base Font Size</label>
            <Input
              value={tokens.fontSize}
              onChange={(e) => update("fontSize", e.target.value)}
              className="h-8 text-xs font-mono"
              placeholder="16px"
            />
          </div>
        </div>

        <div className="w-full h-px bg-border/50" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Borders</p>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Border Radius</label>
          <div className="flex gap-1.5">
            {["0rem", "0.25rem", "0.5rem", "0.75rem", "1rem"].map((r) => (
              <button
                key={r}
                onClick={() => update("radius", r)}
                className={cn(
                  "flex-1 h-8 text-[10px] font-mono rounded border transition-colors",
                  tokens.radius === r ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {r === "0rem" ? "none" : r.replace("rem", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-border/50" />

        {/* Preview swatches */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: tokens.background, border: `1px solid ${tokens.border}` }}>
          <p className="text-xs font-semibold" style={{ color: tokens.foreground, fontFamily: tokens.fontFamily }}>Preview</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium" style={{ background: tokens.primary, color: tokens.primaryForeground, borderRadius: tokens.radius, fontFamily: tokens.fontFamily }}>
              Primary
            </button>
            <button className="px-3 py-1.5 text-xs font-medium" style={{ background: tokens.secondary, color: tokens.foreground, borderRadius: tokens.radius, fontFamily: tokens.fontFamily }}>
              Secondary
            </button>
            <button className="px-3 py-1.5 text-xs font-medium border" style={{ background: "transparent", color: tokens.primary, borderColor: tokens.primary, borderRadius: tokens.radius, fontFamily: tokens.fontFamily }}>
              Outline
            </button>
          </div>
          <p className="text-xs" style={{ color: tokens.mutedForeground, fontFamily: tokens.fontFamily }}>Muted text example</p>
        </div>

        <Button size="sm" className="w-full gap-2" onClick={save} disabled={updateProject.isPending || !dirty}>
          {updateProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paintbrush className="w-3.5 h-3.5" />}
          {dirty ? "Apply Theme" : "Theme Saved"}
        </Button>
      </div>
    </ScrollArea>
  );
}
