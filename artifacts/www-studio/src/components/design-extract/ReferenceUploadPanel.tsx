// ─── ReferenceUploadPanel.tsx ──────────────────────────────────────────────
import { useState, useRef, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Plus, Smartphone, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCssOrTailwind } from "@/lib/cssTokenParser";
import type { Reference } from "./DesignExtractInput";

const HELPER_CHIPS = [
  "Love this font",
  "Use this colour",
  "This vibe",
  "Mobile layout",
];

const MOST_RELEVANT_SECTIONS = [
  "color palette",
  "typography",
  "layout & spacing",
  "animations",
  "brand voice",
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_REFS = 5;

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isIOS && isSafari;
}

interface ReferenceUploadPanelProps {
  onAdd: (ref: Omit<Reference, "id">) => void;
  existingCount?: number;
  onCssImport?: (tokens: Record<string, unknown>) => void;
}

export default function ReferenceUploadPanel({ onAdd, existingCount = 0, onCssImport }: ReferenceUploadPanelProps) {
  const [activeTab, setActiveTab] = useState<"image" | "url" | "css">("image");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [annotation, setAnnotation] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [cssInput, setCssInput] = useState("");
  const [cssError, setCssError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showIosHint = useMemo(() => isIOSSafari(), []);

  // Smart default annotation suggestions
  const smartSuggestion = useMemo(() => {
    if (existingCount === 1) return "Mix with primary";
    if (existingCount >= 2) {
      const section = MOST_RELEVANT_SECTIONS[existingCount % MOST_RELEVANT_SECTIONS.length];
      return `Use for ${section}`;
    }
    return null;
  }, [existingCount]);

  const handleFiles = useCallback(
    (files: FileList) => {
      setError(null);
      const file = files[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, WEBP, GIF images are accepted.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleCssImport = () => {
    setCssError(null);
    if (!cssInput.trim()) {
      setCssError("Please paste CSS variables or Tailwind config.");
      return;
    }
    try {
      const parsed = parseCssOrTailwind(cssInput);
      if (Object.keys(parsed).length === 0) {
        setCssError("No design tokens found in input. Check format.");
        return;
      }
      if (onCssImport) {
        onCssImport(parsed as Record<string, unknown>);
      }
    } catch (err) {
      setCssError(err instanceof Error ? err.message : "Failed to parse input.");
    }
  };

  const handleReset = () => {
    setPreview(null);
    setAnnotation("");
    setUrlValue("");
    setCssInput("");
    setCssError(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdd = () => {
    if (activeTab === "image" && preview) {
      onAdd({
        type: "image",
        value: "uploaded-image",
        annotation: annotation || "Image reference",
        thumbnail: preview,
      });
    } else if (activeTab === "url" && urlValue) {
      onAdd({
        type: "url",
        value: urlValue,
        annotation: annotation || "URL reference",
      });
    } else if (activeTab === "css" && cssInput.trim()) {
      handleCssImport();
    }
    handleReset();
  };

  const canAdd =
    activeTab === "image" ? !!preview :
    activeTab === "url" ? /^https?:\/\/.+/.test(urlValue) :
    cssInput.trim().length > 0;

  return (
    <div className="space-y-3">
      <Tabs
        value={activeTab}
        onValueChange={(v: string) => {
          handleReset();
          setActiveTab(v as "image" | "url" | "css");
        }}
      >
        <TabsList className="grid w-full grid-cols-3 bg-[#0a0a0b] border border-[#27272a]">
          <TabsTrigger value="image" className="data-[state=active]:bg-[#18181b]">
            Image
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-[#18181b]">
            URL
          </TabsTrigger>
          <TabsTrigger value="css" className="data-[state=active]:bg-[#18181b]">
            CSS / Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="space-y-3 mt-3">
          {/* Drop zone */}
          {!preview ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                dragOver
                  ? "border-[#3b82f6] bg-[#3b82f6]/5"
                  : "border-[#27272a] hover:border-[#3b82f6]/50"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag & drop image here, or{" "}
                <span className="text-[#3b82f6] underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                JPG, PNG, WEBP, GIF — max 5MB, {MAX_REFS} total
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-[#27272a]"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black/90 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          )}
          {/* iOS camera hint */}
          {showIosHint && activeTab === "image" && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
              <Smartphone className="h-3 w-3" />
              <span>Long press to save images on iOS Safari</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <Input
            type="url"
            placeholder="https://example.com/page"
            value={urlValue}
            onChange={(e) => {
              setUrlValue(e.target.value);
              setError(null);
            }}
            className="bg-[#0a0a0b] border-[#27272a] text-foreground placeholder:text-muted-foreground/50"
          />
        </TabsContent>

        <TabsContent value="css" className="mt-3 space-y-2">
          <Textarea
            placeholder={":root { --color-primary: #3b82f6; --font-display: 'Inter'; }"}
            value={cssInput}
            onChange={(e) => {
              setCssInput(e.target.value);
              setCssError(null);
            }}
            rows={5}
            className="bg-[#0a0a0b] border-[#27272a] text-foreground placeholder:text-muted-foreground/50 resize-none font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Code className="h-3 w-3" />
            Paste CSS variables or Tailwind config snippet
          </p>
        </TabsContent>
      </Tabs>

      {/* CSS error message */}
      {cssError && activeTab === "css" && <p className="text-xs text-red-400">{cssError}</p>}

      {/* Error message */}
      {error && activeTab !== "css" && <p className="text-xs text-red-400">{error}</p>}

      {/* Annotation */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add annotation for this reference..."
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          rows={2}
          className="bg-[#0a0a0b] border-[#27272a] text-foreground placeholder:text-muted-foreground/50 resize-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {HELPER_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() =>
                setAnnotation((prev) => (prev ? `${prev}, ${chip}` : chip))
              }
              className="text-[11px] min-h-[44px] px-3 py-1 rounded-full bg-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#3b82f6]/20 transition-colors flex items-center"
            >
              + {chip}
            </button>
          ))}
        </div>
        {/* Smart suggestion */}
        {smartSuggestion && !annotation && (
          <button
            type="button"
            onClick={() => setAnnotation(smartSuggestion)}
            className="text-[11px] text-[#3b82f6] hover:text-[#3b82f6]/80 transition-colors"
          >
            💡 Suggested: {smartSuggestion}
          </button>
        )}
      </div>

      {/* Add button */}
      <Button
        size="sm"
        disabled={!canAdd}
        onClick={handleAdd}
        className="w-full bg-[#3b82f6] hover:bg-[#3b82f6]/90 disabled:bg-[#27272a] text-white"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {activeTab === "css" ? "Parse & Import Tokens" : "Add Reference"}
      </Button>
    </div>
  );
}
