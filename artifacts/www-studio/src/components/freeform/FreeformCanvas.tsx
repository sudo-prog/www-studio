// ── Enhanced Freeform Canvas ─────────────────────────────────────────────────
import { useRef, useCallback, useState, useEffect } from "react";
import { FreeformElement, AlignmentGuide, computeAlignmentGuides, LayoutMode, Artboard } from "@/lib/freeform-types";
import { cn } from "@/lib/utils";
import FormElementRenderer from "@/components/freeform/FormElementRenderer";
import FreehandDraw from "@/components/freeform/FreehandDraw";

interface Props {
  elements:      FreeformElement[];
  selectedId:    string | null;
  canvasWidth:   number;
  canvasHeight:  number;
  background:    { type: string; value: string };
  zoom:          number;
  snapGrid:      boolean;
  showGuides:    boolean;
  showRulers:    boolean;
  layoutMode?:   LayoutMode;
  artboards?:    Artboard[];
  activeArtboardId?: string | null;
  isInfiniteCanvas?: boolean;
  drawingId?: string | null;
  onDrawComplete?: (id: string, drawData: string) => void;
  onSelect:      (id: string | null) => void;
  onMove:        (id: string, x: number, y: number) => void;
  onResize:      (id: string, w: number, h: number) => void;
}

function snapVal(n: number, grid: number, enabled: boolean) {
  return enabled ? Math.round(n / grid) * grid : n;
}

export default function FreeformCanvas({
  elements, selectedId, canvasWidth, canvasHeight, background, zoom, snapGrid, showGuides, showRulers,
  layoutMode = "absolute", artboards, activeArtboardId, isInfiniteCanvas, drawingId, onDrawComplete,
  onSelect, onMove, onResize,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number; corner: string } | null>(null);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const bgStyle: React.CSSProperties = {};
  if (background.type === "color") bgStyle.background = background.value;
  else if (background.type === "gradient") bgStyle.background = background.value;
  else if (background.type === "image") {
    bgStyle.backgroundImage = `url(${background.value})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  const handleMouseDown = useCallback((e: React.MouseEvent, el: FreeformElement) => {
    if (el.locked || isPanning) return;
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
  }, [elements, onSelect, showGuides, isPanning]);

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

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y });
    }
  };

  useEffect(() => {
    if (!dragging && !resizing && !isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setPan({ x: panStart.panX + dx, y: panStart.panY + dy });
      }
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
        if (resizing.corner.includes("l")) newW = Math.max(30, resizing.startW - dx);
        if (resizing.corner.includes("t")) newH = Math.max(30, resizing.startH - dy);
        onResize(resizing.id, snapVal(newW, 10, snapGrid), snapVal(newH, 10, snapGrid));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
      setGuides([]);
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, isPanning, zoom, snapGrid, onMove, onResize, panStart]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas) {
      if (!isPanning) onSelect(null);
    }
  };

  function getContainerStyle(el: FreeformElement): React.CSSProperties {
    const base: React.CSSProperties = {
      left: el.x * zoom,
      top: el.y * zoom,
      width: el.width * zoom,
      height: el.height * zoom,
      zIndex: el.zIndex,
      opacity: el.opacity,
      transform: `rotate(${el.rotation}deg) scale(${el.scale})`,
      transformOrigin: "center center",
    };
    if (el.layoutMode && el.layoutMode !== "absolute") {
      const gap = (el.gap || 8) * zoom;
      const padding = (el.padding || 0) * zoom;
      if (el.layoutMode === "flex-row") {
        return { ...base, display: "flex", flexDirection: "row", gap, padding, alignItems: "center" };
      }
      if (el.layoutMode === "flex-col") {
        return { ...base, display: "flex", flexDirection: "column", gap, padding, alignItems: "stretch" };
      }
      if (el.layoutMode === "grid") {
        const cols = el.gridColumns || 2;
        return { ...base, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, padding };
      }
    }
    return base;
  }

  function getChildElements(el: FreeformElement): FreeformElement[] {
    if (!el.children || el.children.length === 0) return [];
    return el.children
      .map((cid) => sorted.find((e) => e.id === cid))
      .filter(Boolean) as FreeformElement[];
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative flex-1 overflow-auto bg-[#0a0a0f]", isInfiniteCanvas && "cursor-grab")}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      data-canvas="true"
    >
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

      {showRulers && (
        <>
          <div className="sticky top-0 left-5 right-0 h-5 bg-muted/30 border-b border-border z-10 pointer-events-none">
            {Array.from({ length: Math.ceil(canvasWidth / 50) + 1 }).map((_, i) => (
              <span key={i} className="absolute text-[7px] text-muted-foreground" style={{ left: i * 50 * zoom }}>
                {i * 50}
              </span>
            ))}
          </div>
          <div className="sticky top-0 left-0 w-5 h-full bg-muted/30 border-r border-border z-10 pointer-events-none">
            {Array.from({ length: Math.ceil(canvasHeight / 50) + 1 }).map((_, i) => (
              <span key={i} className="absolute text-[7px] text-muted-foreground" style={{ top: i * 50 * zoom }}>
                {i * 50}
              </span>
            ))}
          </div>
          <div className="sticky top-0 left-0 w-5 h-5 bg-muted/40 border-b border-r border-border z-20" />
        </>
      )}

      {artboards && artboards.length > 1 && (
        <div className="sticky top-6 left-1/2 -translate-x-1/2 z-30 flex gap-1 bg-background/80 backdrop-blur rounded-lg p-1 border border-border">
          {artboards.map((ab) => (
            <button
              key={ab.id}
              onClick={() => onSelect(null)}
              className={cn(
                "px-3 py-1 text-[10px] rounded-md transition-colors",
                ab.id === activeArtboardId ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {ab.name}
            </button>
          ))}
        </div>
      )}

      <div
        className="relative shadow-2xl shadow-black/50 my-8 mx-8 border border-white/5 rounded-sm transition-transform"
        style={{
          width: canvasWidth * zoom,
          height: canvasHeight * zoom,
          transform: isInfiniteCanvas ? `translate(${pan.x}px, ${pan.y}px)` : undefined,
          ...bgStyle,
        }}
        data-canvas="true"
      >
        {sorted.map((el) => {
          if (!el.visible) return null;
          const isSelected = el.id === selectedId;
          const isContainer = el.layoutMode && el.layoutMode !== "absolute" && (el.children?.length || 0) > 0;

          return (
            <div
              key={el.id}
              className={cn(
                "absolute group",
                el.locked ? "cursor-not-allowed" : "cursor-move",
                isSelected && "ring-2 ring-blue-500 ring-offset-1 ring-offset-transparent"
              )}
              style={getContainerStyle(el)}
              onMouseDown={(e) => handleMouseDown(e, el)}
            >
              {isContainer && getChildElements(el).map((child) => (
                <div
                  key={child.id}
                  className="relative"
                  style={{ flex: layoutMode === "flex-col" ? "1 1 auto" : undefined }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <FreeformElementRenderer el={child} zoom={zoom} />
                </div>
              ))}

              {!isContainer && <FreeformElementRenderer el={el} zoom={zoom} />}

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

      {drawingId && onDrawComplete && (() => {
        const drawEl = elements.find((e) => e.id === drawingId);
        if (!drawEl || drawEl.type !== "draw") return null;
        return (
          <FreehandDraw
            width={canvasWidth}
            height={canvasHeight}
            color={drawEl.color || "#ffffff"}
            brushSize={3}
            drawData={drawEl.drawData}
            onComplete={(svgPath) => onDrawComplete(drawingId, svgPath)}
          />
        );
      })()}
    </div>
  );
}

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
            clipPath: el.shapeKind === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" :
                     el.shapeKind === "star" ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" :
                     el.shapeKind === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" :
                     undefined,
          }}
          onClick={el.href ? () => window.open(el.href, "_blank") : undefined}
          className={cn(el.href && "cursor-pointer hover:brightness-110 transition")}
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
            boxShadow: el.boxShadow || "none",
          }}
        >
          {el.label || "Button"}
        </div>
      );

    case "sticker":
      return (
        <img
          src={el.stickerUrl || "https://placehold.co/80x80/1a1a2e/666?text=sticker"}
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
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${el.width} ${el.height}`}
          className="absolute inset-0"
        >
          <path
            d={el.drawData || ""}
            fill="none"
            stroke={el.color || "#ffffff"}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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

    case "form":
      return <FormElementRenderer el={el} zoom={zoom} />;

    default:
      return <div style={baseStyle} />;
  }
}
