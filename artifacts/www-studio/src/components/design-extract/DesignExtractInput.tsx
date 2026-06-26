// ─── DesignExtractInput.tsx ─────────────────────────────────────────────────
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clipboard, ChevronDown, ChevronUp, Link, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReferenceUploadPanel from "./ReferenceUploadPanel";
import ReferenceItem from "./ReferenceItem";

export interface Reference {
  id: string;
  type: "url" | "image";
  value: string;
  annotation: string;
  thumbnail?: string;
}

interface DesignExtractInputProps {
  onSubmit: (url: string, references: Reference[]) => void;
  isProcessing: boolean;
}

export default function DesignExtractInput({ onSubmit, isProcessing }: DesignExtractInputProps) {
  const [url, setUrl] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [showRefs, setShowRefs] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidUrl = /^https?:\/\/.+/.test(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // fallback: focus input for manual paste
      inputRef.current?.focus();
    }
  };

  const handleSubmit = () => {
    if (!isValidUrl || isProcessing) return;
    onSubmit(url, references);
  };

  const handleAddReference = (ref: Omit<Reference, "id">) => {
    setReferences((prev) => [...prev, { ...ref, id: crypto.randomUUID() }]);
  };

  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateReference = (id: string, annotation: string) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, annotation } : r))
    );
  };

  return (
    <div className="space-y-4">
      {/* Primary URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Design URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 bg-[#18181b] border-[#27272a] text-foreground placeholder:text-muted-foreground/50"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePaste}
            className="shrink-0 border-[#27272a] bg-[#18181b] hover:bg-[#27272a]"
            title="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button
            disabled={!isValidUrl || isProcessing}
            onClick={handleSubmit}
            className="shrink-0 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Extract Design"
            )}
          </Button>
        </div>
        {url && !isValidUrl && (
          <p className="text-xs text-red-400">Must be a valid http(s) URL</p>
        )}
      </div>

      {/* References Section */}
      <div className="border border-[#27272a] rounded-lg bg-[#18181b]">
        <button
          type="button"
          onClick={() => setShowRefs(!showRefs)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            References
            {references.length > 0 && (
              <span className="bg-[#3b82f6] text-white text-xs px-2 py-0.5 rounded-full">
                {references.length}
              </span>
            )}
          </span>
          {showRefs ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showRefs && (
          <div className="px-4 pb-4 space-y-3 border-t border-[#27272a]">
            {/* Existing references */}
            {references.length > 0 && (
              <div className="space-y-2 pt-3">
                {references.map((ref) => (
                  <ReferenceItem
                    key={ref.id}
                    reference={ref}
                    onRemove={() => handleRemoveReference(ref.id)}
                    onUpdateAnnotation={(ann) =>
                      handleUpdateReference(ref.id, ann)
                    }
                  />
                ))}
              </div>
            )}

            {/* Add new reference */}
            <ReferenceUploadPanel onAdd={handleAddReference} />
          </div>
        )}
      </div>
    </div>
  );
}
