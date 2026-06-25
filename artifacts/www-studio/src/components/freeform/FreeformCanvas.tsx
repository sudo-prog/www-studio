import { useRef, useCallback, useState, useEffect } from "react";
import { FreeformElement, AlignmentGuide, computeAlignmentGuides } from "@/lib/freeform-types";
import { cn } from "@/lib/utils";

interface Props {
  elements:      FreeformElement[];
  selectedId:    string | null;
  canvasWidth:   number;
  canvasHeight:  number;
  background:    { type: string; value: string };
  zoom:          number;
  snapGrid:      boolean;
  showGuides:    boolean;
  onSelect:      (id: string | null) => void;
  onMove:        (id: string, x: number, y: number) => void;
  onResize:      (id: string, w: number, h: number) => void;
}

function snapVal(n: number, grid: number, enabled: boolean) {
  return enabled ? Math.round(n / grid) * grid : n;
}

export default function FreeformCanvas({
  elements, selectedId, canvasWidth, canvasHeight, background, zoom, snapGrid, showGuides, onSelect, onMove, onResize,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number; corner: string } | null>(null);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const bgStyle: React.CSSProperties = {};
  if (background.type === "color") {
    bgStyle.background = background.value;
  } else if (background.type === "gradient") {
    bgStyle.background = background.value;
  } else if (background.type === "image") {
    bgStyle.backgroundImage = `url(${background.value})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  const handleMouseDown = useCallback((e: React.MouseEvent, el: FreeformElement) => {
    if (el.locked) return;
    e.stopPropagation();
    onSelect(el.id);
    setDragging({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      elX: el.x,
      elY: el.y,
    });

    if (showGuides) {
      const guideLines = computeAlignmentGuides(el, elements);
      setGuides(guideLines);
    }
  }, [elements, onSelect, showGuides]);

  const handleResizeStart = useCallback((e: React.MouseEvent, el: FreeformElement, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: el.width,
      startH: el.height,
      corner,
    });
  }, []);

  useEffect(() => {
    if (!dragging && !resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const dx = (e.clientX - dragging.startX) / zoom;
        const dy = (e.clientY - dragging.startY) / zoom;
        const newX = snapVal(dragging.elX + dx, 10, snapGrid);
        const newY = snapVal(dragging.elY + dy, 10, snapGrid);
        onMove(dragging.id, newX, newY);
      }
      if (resizing) {
        const dx = (e.clientX - resizing.startX) / zoom;
        const dy = (e.clientY - resizing.startY) / zoom;
        let newW = resizing.startW;
        let newH = resizing.startH;
        if (resizing.corner.includes("r")) newW = Math.max(30, resizing.startW + dx);
        if (resizing.corner.includes("b")) newH = Math.max(30, resizing.startH + dy);
        onResize(resizing.id, snapVal(newW, 10, snapGrid), snapVal(newH, 10, snapGrid));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
      setGuides([]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, zoom, snapGrid, onMove, onResize]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas) {
      onSelect(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto flex-1 bg-[#0a0a0f]"
      onClick={handleCanvasClick}
      data-canvas="true"
    >
      {/* Grid overlay when snap enabled */}
      {snapGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          data-canvas="true"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
      )}

      {/* Canvas area */}
      <div
        className="relative shadow-2xl shadow-black/50 mx-auto my-8 border border-white/5 rounded-sm"
        style={{
          width: canvasWidth * zoom,
          height: canvasHeight * zoom,
          ...bgStyle,
        }}
        data-canvas="true"
      >
        {sorted.map((el) => {
          if (!el.visible) return null;
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              className={cn(
                "absolute group",
                el.locked ? "cursor-not-allowed" : "cursor-move",
                isSelected && "ring-2 ring-blue-500 ring-offset-1 ring-offset-transparent"
              )}
              style={{
                left: el.x * zoom,
                top: el.y * zoom,
                width: el.width * zoom,
                height: el.height * zoom,
                zIndex: el.zIndex,
                opacity: el.opacity,
                transform: `rotate(${el.rotation}deg) scale(${el.scale})`,
                transformOrigin: "center center",
              }}
              onMouseDown={(e) => handleMouseDown(e, el)}
            >
              {/* Element content */}
              <FreeformElementRenderer el={el} zoom={zoom} />

              {/* Resize handles */}
              {isSelected && !el.locked && (
                <>
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize z-50" onMouseDown={(e) => handleResizeStart(e, el, "tl")} />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize z-50" onMouseDown={(e) => handleResizeStart(e, el, "tr")} />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize z-50" onMouseDown={(e) => handleResizeStart(e, el, "bl")} />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize z-50" onMouseDown={(e) => handleResizeStart(e, el, "br")} />
                </>
              )}
            </div>
          );
        })}

        {/* Alignment guides */}
        {guides.map((g, i) => (
          <div
            key={i}
            className="absolute bg-pink-500 pointer-events-none"
            style={
              g.type === "vertical"
                ? { left: g.position * zoom, top: 0, width: 1, height: "100%", zIndex: 99999 }
                : { top: g.position * zoom, left: 0, height: 1, width: "100%", zIndex: 99999 }
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Element Renderer ─────────────────────────────────────────────────────────

function FreeformElementRenderer({ el, zoom }: { el: FreeformElement; zoom: number }) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
    overflow: "hidden",
    userSelect: "none",
  };

  switch (el.type) {
    case "text":
      return (
        <div
          style={{
            ...baseStyle,
            color: el.color || "#ffffff",
            fontSize: (el.fontSize || 24) * zoom,
            fontWeight: el.fontWeight || 400,
            fontFamily: el.fontFamily || "inherit",
            textAlign: el.textAlign || "left",
            lineHeight: 1.3,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: 4 * zoom,
          }}
        >
          {el.text || "Text"}
        </div>
      );

    case "image":
      return (
        <img
          src={el.src || "https://placehold.co/400x300/1a1a2e/666?text=Image"}
          alt={el.name || ""}
          style={{ ...baseStyle, objectFit: "cover" }}
          draggable={false}
        />
      );

    case "shape":      return (
        <div
          style={{
            ...baseStyle,
            background: el.fill || "#7FB5A0",
            borderRadius: el.shapeKind === "circle" ? "50%" : (el.borderRadius || 8) * zoom,
            border: el.stroke ? `${(el.strokeWidth || 1) * zoom}px solid ${el.stroke}` : "none",
          }}
        />
      );

    case "button":
      return (
        <div
          style={{
            ...baseStyle,
            background: el.fill || "#3b82f6",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 14 * zoom,
            borderRadius: (el.borderRadius || 24) * zoom,
            cursor: "pointer",
            padding: `${8 * zoom}px ${16 * zoom}px`,
          }}
        >
          {el.label || "Button"}
        </div>
      );

    case "sticker":
      return (
        <img
          src={el.stickerUrl || "https://placehold.co/80x80/1a1a2e/666?text=🎨"}
          alt="sticker"
          style={{ ...baseStyle, objectFit: "contain" }}
          draggable={false}
        />
      );

    case "embed":
      return el.embedType === "youtube" || el.embedType === "spotify" || el.embedType === "generic" ? (
        <iframe
          src={el.embedUrl || ""}
          style={{ ...baseStyle, border: "none" }}
          allowFullScreen
          title={el.embedType || "embed"}
        />
      ) : (
        <div style={{ ...baseStyle, background: "rgba(255,255,255,0.05)", fontSize: 12 * zoom, color: "#888" }}>
          Embed: {el.embedUrl}
        </div>
      );

    case "draw":
      return (
        <div
          style={{
            ...baseStyle,
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 8 * zoom,
          }}
        >
          <span style={{ fontSize: 10 * zoom, color: "#555" }}>Drawing</span>
        </div>
      );

    case "link-card":
      return (
        <div
          style={{
            ...baseStyle,
            background: el.background || "rgba(255,255,255,0.05)",
            borderRadius: (el.borderRadius || 12) * zoom,
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 12 * zoom,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 14 * zoom, fontWeight: 600, color: "#fff" }}>{el.label || "Link Card"}</span>
          {el.href && <span style={{ fontSize: 11 * zoom, color: "#888", marginTop: 4 * zoom }}>{el.href}</span>}
        </div>
      );

    default:
      return <div style={baseStyle} />;
  }
}
