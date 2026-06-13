import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Save, Globe, EyeOff, Copy, Check, Code2, ExternalLink } from "lucide-react";
import { type SceneData } from "@/lib/scene-types";
import { cn } from "@/lib/utils";

interface Props {
  scene: SceneData;
  onUpdate: (patch: Partial<SceneData>) => void;
  onSave:   (patch: Record<string, unknown>) => void;
}

export function InfoTab({ scene, onUpdate, onSave }: Props) {
  const [desc,      setDesc]      = useState((scene as any).description ?? "");
  const [tagInput,  setTagInput]  = useState("");
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink,  setCopiedLink]  = useState(false);

  const sceneId = (scene as any).id ?? "";
  const shareUrl = `${window.location.origin}/scenes/${sceneId}/share`;
  const embedSnippet = `<iframe src="${shareUrl}?embed=1" width="100%" height="600" frameborder="0" allow="autoplay" loading="lazy" style="border-radius:16px;"></iframe>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedSnippet).then(() => {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    });
  }
  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }
  const tags: string[] = (() => {
    try {
      const raw = (scene as any).tags;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") return JSON.parse(raw);
    } catch {}
    return [];
  })();

  function addTag(t: string) {
    const trimmed = t.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed || tags.includes(trimmed)) return;
    const next = [...tags, trimmed];
    onUpdate({ ...(scene as any), tags: next });
    onSave({ tags: next });
  }

  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    onUpdate({ ...(scene as any), tags: next });
    onSave({ tags: next });
  }

  const viewCount  = (scene as any).viewCount  ?? 0;
  const likeCount  = (scene as any).likes      ?? 0;
  let   elemCount  = 0;
  try { elemCount = JSON.parse((scene as any).elements ?? "[]").length; } catch { /* */ }

  return (
    <div className="p-3 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scene Info</p>

      {/* Stats mini-strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Views",    value: viewCount.toLocaleString(),  color: "text-sky-400"    },
          { label: "Likes",    value: likeCount.toLocaleString(),  color: "text-rose-400"   },
          { label: "Elements", value: elemCount.toString(),        color: "text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-muted rounded-lg p-2 text-center">
            <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-[9px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="Describe this scene…"
          className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs gap-1.5"
          onClick={() => onSave({ description: desc })}
        >
          <Save className="h-3 w-3" />Save description
        </Button>
      </div>

      {/* Canvas size */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Canvas</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Width</Label>
            <Input
              type="number"
              value={(scene as any).canvasWidth ?? 1440}
              onChange={(e) => onUpdate({ ...(scene as any), canvasWidth: Number(e.target.value) })}
              onBlur={(e) => onSave({ canvasWidth: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Height</Label>
            <Input
              type="number"
              value={(scene as any).canvasHeight ?? 900}
              onChange={(e) => onUpdate({ ...(scene as any), canvasHeight: Number(e.target.value) })}
              onBlur={(e) => onSave({ canvasHeight: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">Tags</Label>
        <div className="flex flex-wrap gap-1 min-h-6">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20"
            >
              #{t}
              <button
                onClick={() => removeTag(t)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <Input
            placeholder="add tag…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { addTag(tagInput); setTagInput(""); } }}
            className="h-7 text-xs flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2"
            onClick={() => { addTag(tagInput); setTagInput(""); }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {["relaxation","sleep","energy","focus","nature","breathe","meditation"].map((t) => (
            !tags.includes(t) && (
              <button
                key={t}
                onClick={() => addTag(t)}
                className="text-[9px] px-1.5 py-0.5 border border-dashed border-border rounded-full text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                +{t}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Visibility</Label>
        <div className="flex gap-1.5">
          <button
            onClick={() => { onUpdate({ ...(scene as any), status: "published" }); onSave({ status: "published" }); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs border transition-colors",
              (scene as any).status === "published"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            <Globe className="h-3 w-3" />Published
          </button>
          <button
            onClick={() => { onUpdate({ ...(scene as any), status: "draft" }); onSave({ status: "draft" }); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs border transition-colors",
              (scene as any).status !== "published"
                ? "bg-muted border-border text-foreground"
                : "border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            <EyeOff className="h-3 w-3" />Draft
          </button>
        </div>
      </div>

      {/* Share & Embed */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1"><Code2 className="h-3 w-3" />Share & Embed</Label>

        {/* Share link */}
        <div className="flex gap-1">
          <div className="flex-1 text-[10px] bg-muted rounded-md px-2 py-1.5 font-mono text-muted-foreground truncate select-all">
            {shareUrl}
          </div>
          <Button size="sm" variant="outline" className="h-7 px-2 shrink-0" onClick={copyLink} title="Copy share link">
            {copiedLink ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 shrink-0" onClick={() => window.open(shareUrl, "_blank")} title="Open share page">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Embed snippet */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Embed iframe</p>
          <div className="relative bg-muted rounded-md p-2 pr-8 font-mono text-[9px] text-muted-foreground leading-relaxed break-all">
            {embedSnippet}
            <button
              onClick={copyEmbed}
              className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy embed code"
            >
              {copiedEmbed ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
