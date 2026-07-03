import { useState } from "react";
import {
  Type, Image, Square, MousePointer, Sticker, Code2, Pencil, Shuffle,
  Upload, Search, X, Link2, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FreeformElementType, makeFreeformElement, detectEmbedUrl } from "@/lib/freeform-types";
import { useDropzone } from "react-dropzone";

interface Props {
  onAddElement: (el: ReturnType<typeof makeFreeformElement>) => void;
  onStartDraw?: (id: string) => void;
}

type ToolItem = {
  type: FreeformElementType;
  icon:  React.ElementType;
  label: string;
};

const TOOLS: ToolItem[] = [
  { type: "text",      icon: Type,        label: "Text" },
  { type: "image",     icon: Image,       label: "Image" },
  { type: "shape",     icon: Square,      label: "Shape" },
  { type: "button",    icon: MousePointer, label: "Button" },
  { type: "sticker",   icon: Sticker,     label: "Sticker" },
  { type: "embed",     icon: Code2,       label: "Embed" },
  { type: "draw",      icon: Pencil,      label: "Draw" },
  { type: "link-card", icon: Link2,       label: "Link Card" },
  { type: "form",      icon: FileText,    label: "Form" },
];

export default function FreeformToolbar({ onAddElement, onStartDraw }: Props) {
  const [giphyQuery, setGiphyQuery] = useState("");
  const [giphyResults, setGiphyResults] = useState<{ url: string; alt: string }[]>([]);
  const [showGiphy, setShowGiphy] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [freeText, setFreeText] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = () => {
        onAddElement(makeFreeformElement("image", { src: reader.result as string, name: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] },
    noClick: true,
  });

  const handleSearchGiphy = async () => {
    if (!giphyQuery.trim()) return;
    // Without Giphy API key, show placeholder stickers
    const stickers = [
      { url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", alt: "paste" },
      { url: "https://media.giphy.com/media/l0HlOvJ7yaacpuSas/giphy.gif", alt: "sparkle" },
      { url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", alt: "fire" },
    ];
    setGiphyResults(stickers.slice(0, 6));
  };

  const handleAddText = () => {
    const text = freeText || "Hello!";
    onAddElement(makeFreeformElement("text", { text, name: text.slice(0, 20) }));
    setFreeText("");
  };

  const handleEmbedPaste = () => {
    const detected = detectEmbedUrl(embedUrl);
    if (detected) {
      onAddElement(makeFreeformElement("embed", {
        embedUrl: detected.embedUrl,
        embedType: detected.embedType,
        name: "Embed",
      }));
      setEmbedUrl("");
      setShowEmbedInput(false);
    }
  };

  const handleChaosMonkey = () => {
    const types: FreeformElementType[] = ["text", "shape", "sticker", "image"];
    const colors = ["#7FB5A0", "#B39DC2", "#E8957A", "#87BBDB", "#F4C5A1", "#4A7C6B", "#C8D8E0", "#E8DDD0"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const x = 100 + Math.random() * 600;
    const y = 100 + Math.random() * 400;

    onAddElement(makeFreeformElement(randomType, {
      x, y,
      fill: randomColor,
      text: randomType === "text" ? "Chaos!" : undefined,
      shapeKind: randomType === "shape" ? (["rectangle", "circle", "star"][Math.floor(Math.random() * 3)] as any) : undefined,
      rotation: Math.random() * 30 - 15,
      name: "Chaos element",
    }));
  };

  return (
    <div
      className="w-16 shrink-0 border-r border-border bg-background flex flex-col items-center py-3 gap-1 overflow-y-auto"
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {TOOLS.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          className="w-11 h-11 flex flex-col items-center justify-center rounded-xl hover:bg-primary/10 transition-colors group relative"
          title={label}
          onClick={() => {
            if (type === "text") {
              onAddElement(makeFreeformElement("text", { name: "Text" }));
            } else if (type === "image") {
              // file input triggered by click on image tool
            } else if (type === "shape") {
              onAddElement(makeFreeformElement("shape", { shapeKind: "rectangle" }));
            } else if (type === "button") {
              onAddElement(makeFreeformElement("button"));
            } else if (type === "draw") {
              const drawEl = makeFreeformElement("draw");
              onAddElement(drawEl);
              if (onStartDraw) onStartDraw(drawEl.id);
            } else if (type === "link-card") {
              onAddElement(makeFreeformElement("link-card"));
            } else if (type === "form") {
              onAddElement(makeFreeformElement("form"));
            }
          }}
        >
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          <span className="text-[8px] text-muted-foreground group-hover:text-primary mt-0.5">{label}</span>
        </button>
      ))}

      <div className="w-8 border-t border-border my-1" />

      {/* Giphy sticker search */}
      <button
        className="w-11 h-11 flex flex-col items-center justify-center rounded-xl hover:bg-primary/10 transition-colors group relative"
        title="Stickers"
        onClick={() => { setShowGiphy(!showGiphy); setShowEmbedInput(false); }}
      >
        <Sticker className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-[8px] text-muted-foreground group-hover:text-primary mt-0.5">Giphy</span>
      </button>

      {/* Smart embed paste */}
      <button
        className="w-11 h-11 flex flex-col items-center justify-center rounded-xl hover:bg-primary/10 transition-colors group relative"
        title="Embed URL"
        onClick={() => { setShowEmbedInput(!showEmbedInput); setShowGiphy(false); }}
      >
        <Code2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-[8px] text-muted-foreground group-hover:text-primary mt-0.5">Paste</span>
      </button>

      {/* Chaos Monkey */}
      <button
        className="w-11 h-11 flex flex-col items-center justify-center rounded-xl hover:bg-primary/10 transition-colors group relative"
        title="Chaos Monkey"
        onClick={handleChaosMonkey}
      >
        <Shuffle className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-[8px] text-muted-foreground group-hover:text-primary mt-0.5">Chaos</span>
      </button>

      {/* Image upload */}
      <label className="w-11 h-11 flex flex-col items-center justify-center rounded-xl hover:bg-primary/10 transition-colors group cursor-pointer" title="Upload image">
        <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        <span className="text-[8px] text-muted-foreground group-hover:text-primary mt-0.5">Upload</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              onAddElement(makeFreeformElement("image", { src: reader.result as string, name: file.name }));
            };
            reader.readAsDataURL(file);
          }}
        />
      </label>

      {/* Drag-over indicator */}
      {isDragActive && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-xl z-50 flex items-center justify-center">
          <span className="text-xs text-primary font-medium">Drop image</span>
        </div>
      )}

      {/* Giphy Search Panel */}
      {showGiphy && (
        <div className="absolute left-16 top-0 w-56 border border-border bg-background rounded-xl shadow-xl z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Stickers</span>
            <button onClick={() => setShowGiphy(false)}><X className="w-3 h-3" /></button>
          </div>
          <div className="flex gap-1 mb-2">
            <input
              className="flex-1 text-xs px-2 py-1.5 bg-muted rounded-lg border-0 text-foreground outline-none"
              placeholder="Search Giphy..."
              value={giphyQuery}
              onChange={(e) => setGiphyQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchGiphy()}
            />
            <button onClick={handleSearchGiphy} className="px-2 py-1 bg-primary/20 rounded-lg text-xs">
              <Search className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {giphyResults.map((s, i) => (
              <button
                key={i}
                className="w-full aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary"
                onClick={() => onAddElement(makeFreeformElement("sticker", { stickerUrl: s.url, name: "Sticker" }))}
              >
                <img src={s.url} alt={s.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">
            Click sticker to add • Giphy API for live search
          </p>
        </div>
      )}

      {/* Embed Paste Panel */}
      {showEmbedInput && (
        <div className="absolute left-16 top-0 w-64 border border-border bg-background rounded-xl shadow-xl z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Smart Embed</span>
            <button onClick={() => setShowEmbedInput(false)}><X className="w-3 h-3" /></button>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            Paste a YouTube, Spotify, or any URL
          </p>
          <div className="flex gap-1">
            <input
              className="flex-1 text-xs px-2 py-1.5 bg-muted rounded-lg border-0 text-foreground outline-none"
              placeholder="https://..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmbedPaste()}
            />
            <button onClick={handleEmbedPaste} className="px-2 py-1 bg-primary text-white rounded-lg text-xs">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
