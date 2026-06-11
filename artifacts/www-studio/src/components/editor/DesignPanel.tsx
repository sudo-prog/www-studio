import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProjectQueryKey } from "@workspace/api-client-react";
import {
  Sparkles, Globe, Upload, Image, Copy, Check, ChevronDown, ChevronUp,
  Loader2, Wand2, Palette, Type, Square, Download, RefreshCw, Paintbrush,
  Link2, FileText,
} from "lucide-react";

interface Props {
  projectId: string;
  themeTokens: string | null | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

type Mode = "prompt" | "url" | "images";

interface DesignTokens {
  colors?: Record<string, string>;
  fonts?: { body?: string; heading?: string; fontSize?: string };
  radius?: string;
  style?: string;
}

// ── Parse design tokens from Design.md markdown ───────────────────────
function parseTokensFromMd(md: string): DesignTokens | null {
  try {
    const match = md.match(/```json\s*([\s\S]*?)```/);
    if (!match) return null;
    return JSON.parse(match[1]) as DesignTokens;
  } catch { return null; }
}

// ── Color swatch component ─────────────────────────────────────────────
function ColorSwatch({ color, label }: { color: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      title={`${label}: ${color}`}
      onClick={copy}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className="w-8 h-8 rounded-md border border-border/30 shadow-sm group-hover:scale-110 transition-transform"
        style={{ background: color }}
      />
      {copied ? (
        <Check className="w-2.5 h-2.5 text-green-400" />
      ) : (
        <span className="text-[8px] font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[36px]">{color}</span>
      )}
    </button>
  );
}

// ── Rendered Design Preview ────────────────────────────────────────────
function DesignPreview({ tokens, style }: { tokens: DesignTokens; style?: string }) {
  const colors = tokens.colors ?? {};
  const fonts = tokens.fonts ?? {};

  const colorOrder = ["background", "foreground", "primary", "secondary", "accent", "muted", "border"];
  const colorEntries = colorOrder.map((k) => [k, colors[k]]).filter(([, v]) => v) as [string, string][];

  return (
    <div className="space-y-3">
      {/* Color palette */}
      {colorEntries.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Palette className="w-3 h-3" /> Colors
          </p>
          <div className="flex gap-2 flex-wrap">
            {colorEntries.map(([label, val]) => (
              <ColorSwatch key={label} color={val} label={label} />
            ))}
          </div>
        </div>
      )}

      {/* Typography */}
      {fonts.body && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Type className="w-3 h-3" /> Typography
          </p>
          <div className="bg-muted/20 rounded-lg p-3 space-y-1">
            <p className="text-sm font-bold text-foreground" style={{ fontFamily: fonts.body }}>Heading Style</p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: fonts.body }}>Body text example — {fonts.body.split(",")[0]}</p>
          </div>
        </div>
      )}

      {/* Radius + style */}
      <div className="flex items-center gap-3">
        {tokens.radius && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary/20 border border-primary/30" style={{ borderRadius: tokens.radius }} />
            <span className="text-[10px] text-muted-foreground">{tokens.radius} radius</span>
          </div>
        )}
        {style && (
          <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/30 border border-border/30">{style}</span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export function DesignPanel({ projectId, themeTokens, iframeRef }: Props) {
  const [mode, setMode] = useState<Mode>("prompt");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<{ name: string; preview: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [designMd, setDesignMd] = useState<string | null>(() => {
    try {
      const tokens = JSON.parse(themeTokens ?? "{}");
      return tokens.designMd ?? null;
    } catch { return null; }
  });
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parsedTokens = designMd ? parseTokensFromMd(designMd) : null;

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const previews: { name: string; preview: string }[] = [];
    Array.from(files).slice(0, 5).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({ name: file.name, preview: e.target?.result as string });
        if (previews.length === Math.min(files.length, 5)) {
          setImageFiles((prev) => [...prev, ...previews].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const generate = useCallback(async () => {
    const hasInput =
      (mode === "prompt" && prompt.trim()) ||
      (mode === "url" && url.trim()) ||
      (mode === "images" && imageFiles.length > 0);

    if (!hasInput) {
      toast({ title: mode === "prompt" ? "Enter a design description" : mode === "url" ? "Enter a website URL" : "Upload at least one image", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const body: Record<string, unknown> = { mode };
      if (mode === "prompt") body.prompt = prompt;
      if (mode === "url") { body.url = url; body.prompt = prompt; }
      if (mode === "images") { body.prompt = prompt || "Extract a design system from these images"; }

      const res = await fetch(`/api/projects/${projectId}/design-md`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setDesignMd(data.designMd);
      toast({ title: "Design.md generated!" });
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [mode, prompt, url, imageFiles, projectId, toast]);

  const applyToProject = useCallback(async () => {
    if (!parsedTokens) return;
    setIsApplying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/design-md/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: parsedTokens }),
      });
      if (!res.ok) throw new Error("Apply failed");
      const data = await res.json();

      // Inject CSS vars into iframe immediately
      const iframe = iframeRef.current;
      if (iframe?.contentDocument && parsedTokens.colors) {
        const style = iframe.contentDocument.getElementById("www-theme-vars") ?? (() => {
          const s = iframe.contentDocument!.createElement("style");
          s.id = "www-theme-vars";
          iframe.contentDocument!.head.appendChild(s);
          return s;
        })();
        const c = parsedTokens.colors;
        const hexToHsl = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;
          const max = Math.max(r, g, b); const min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
            h /= 6;
          }
          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
        };
        const toVar = (hex: string) => hex?.startsWith("#") ? hexToHsl(hex) : "0 0% 50%";
        style.textContent = `:root {
          --background: ${toVar(c.background ?? "#fff")};
          --foreground: ${toVar(c.foreground ?? "#000")};
          --primary: ${toVar(c.primary ?? "#6366f1")};
          --secondary: ${toVar(c.secondary ?? "#8b5cf6")};
          --muted: ${toVar(c.muted ?? "#94a3b8")};
          --accent: ${toVar(c.accent ?? "#06b6d4")};
          --border: ${toVar(c.border ?? "#e2e8f0")};
          ${parsedTokens.fonts?.body ? `--font-sans: ${parsedTokens.fonts.body};` : ""}
          ${parsedTokens.radius ? `--radius: ${parsedTokens.radius};` : ""}
        }`;
      }

      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      toast({ title: "Design system applied to project!", description: "Colors, fonts, and spacing updated." });
    } catch {
      toast({ title: "Failed to apply design", variant: "destructive" });
    } finally {
      setIsApplying(false);
    }
  }, [parsedTokens, projectId, iframeRef, queryClient, toast]);

  const copyMd = () => {
    if (!designMd) return;
    navigator.clipboard.writeText(designMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const MODES = [
    { id: "prompt" as Mode, icon: <Wand2 className="w-3 h-3" />, label: "Prompt" },
    { id: "url" as Mode, icon: <Globe className="w-3 h-3" />, label: "Website" },
    { id: "images" as Mode, icon: <Image className="w-3 h-3" />, label: "Images" },
  ];

  const PROMPT_HINTS = [
    "Dark, minimal SaaS dashboard",
    "Playful e-commerce with warm colors",
    "Elegant luxury fashion brand",
    "Tech startup, blue, corporate",
    "Organic, earthy green wellness brand",
    "Bold, high-contrast portfolio",
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Design.md</p>
            <p className="text-[10px] text-muted-foreground">AI mood board & style guide</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1 border border-border/50 rounded-lg p-0.5 bg-muted/10">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 h-7 text-xs rounded transition-colors",
                mode === m.id ? "bg-background border border-border/50 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="space-y-2">
          {mode === "prompt" && (
            <>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your design vision…&#10;e.g. Dark minimal SaaS with purple accents, professional and technical"
                rows={4}
                className="text-xs resize-none bg-muted/20 border-border/50 placeholder:text-muted-foreground/60"
              />
              <div className="flex flex-wrap gap-1">
                {PROMPT_HINTS.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setPrompt(hint)}
                    className="text-[9px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode === "url" && (
            <>
              <div className="relative">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://stripe.com"
                  className="pl-8 text-xs h-8 bg-muted/20 border-border/50"
                />
              </div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Optional: Any specific notes about the style you like…"
                rows={2}
                className="text-xs resize-none bg-muted/20 border-border/50 placeholder:text-muted-foreground/60"
              />
            </>
          )}

          {mode === "images" && (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                  imageFiles.length > 0 ? "border-primary/30 bg-primary/5" : "border-border/40 hover:border-primary/30 hover:bg-muted/20"
                )}
              >
                {imageFiles.length === 0 ? (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Drop images or click to upload</p>
                    <p className="text-[10px] text-muted-foreground/60">Screenshots, brand photos, UI references (max 5)</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {imageFiles.map((f, i) => (
                      <div key={i} className="relative">
                        <img src={f.preview} alt={f.name} className="w-12 h-12 object-cover rounded border border-border/30" />
                      </div>
                    ))}
                    <button
                      className="w-12 h-12 flex items-center justify-center rounded border border-dashed border-border/40 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                    >
                      <Upload className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
              </div>
              {imageFiles.length > 0 && (
                <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => setImageFiles([])}>
                  Clear images
                </button>
              )}
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Optional: Describe what you like about these images…"
                rows={2}
                className="text-xs resize-none bg-muted/20 border-border/50 placeholder:text-muted-foreground/60"
              />
            </>
          )}
        </div>

        {/* Generate button */}
        <Button
          className="w-full gap-2 h-9"
          onClick={generate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating Design.md…</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" />{designMd ? "Regenerate" : "Generate Design.md"}</>
          )}
        </Button>

        {/* Generated result */}
        {designMd && parsedTokens && (
          <div className="space-y-3 pt-1">
            <div className="h-px bg-border/50" />

            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-primary" />
                Generated Design System
              </p>
              <button onClick={copyMd} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy .md"}
              </button>
            </div>

            {/* Visual preview */}
            <div className="rounded-xl border border-border/40 bg-muted/10 p-3">
              <DesignPreview tokens={parsedTokens} style={parsedTokens.style} />
            </div>

            {/* Apply button */}
            <Button
              className="w-full gap-2 h-9 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={applyToProject}
              disabled={isApplying}
            >
              {isApplying ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Applying…</>
              ) : (
                <><Paintbrush className="w-3.5 h-3.5" />Apply to Project</>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">
              Updates colors, fonts &amp; spacing across your entire project
            </p>

            {/* Collapsible raw markdown */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="w-full flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <span className="font-mono">View Design.md source</span>
              {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showRaw && (
              <div className="rounded-lg bg-[#0d1117] border border-border/30 overflow-hidden">
                <pre className="p-3 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {designMd}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Empty state if no design yet */}
        {!designMd && (
          <div className="rounded-xl border border-dashed border-border/40 p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <Palette className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Describe your brand, paste a website URL, or upload mood board images — AI will generate a complete design system.
            </p>
          </div>
        )}

      </div>
    </ScrollArea>
  );
}
