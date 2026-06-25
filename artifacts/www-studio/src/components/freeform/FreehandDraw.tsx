// ── Freeform Drawing Canvas (Freehand) ────────────────────────────────────────
import { useRef, useState, useCallback, useEffect } from "react";

interface DrawingPoint {
  x: number;
  y: number;
}

interface FreehandDrawProps {
  width: number;
  height: number;
  color: string;
  brushSize: number;
  onComplete: (svgPath: string) => void;
  drawData?: string;
}

export default function FreehandDraw({ width, height, color, brushSize, onComplete, drawData }: FreehandDrawProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<DrawingPoint[]>([]);

  const getSVGPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pt = getSVGPoint(e);
    setIsDrawing(true);
    setPoints([pt]);
  }, [getSVGPoint]);

  const moveDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const pt = getSVGPoint(e);
    setPoints((prev) => {
      const next = [...prev, pt];
      // Smooth: draw quadratic curve segments
      if (svgRef.current && next.length >= 3) {
        const len = next.length;
        const p0 = next[len - 3];
        const p1 = next[len - 2];
        const p2 = next[len - 1];
        const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const path = svgRef.current.querySelector("path");
        if (path) {
          path.setAttribute("d", buildSmoothPath(next.slice(0, -2)) + ` Q${p1.x},${p1.y} ${mid2.x},${mid2.y}`);
        }
      }
      return next;
    });
  }, [isDrawing, getSVGPoint]);

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const svgPath = buildSmoothPath(points);
    onComplete(svgPath);
    setPoints([]);
  }, [isDrawing, points, onComplete]);

  useEffect(() => {
    if (drawData && svgRef.current) {
      const path = svgRef.current.querySelector("path");
      if (path) path.setAttribute("d", drawData);
    }
  }, [drawData]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="absolute inset-0 touch-none"
      onMouseDown={startDraw}
      onMouseMove={moveDraw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onTouchStart={startDraw}
      onTouchMove={moveDraw}
      onTouchEnd={endDraw}
      style={{ cursor: "crosshair" }}
    >
      <path
        d=""
        fill="none"
        stroke={color}
        strokeWidth={brushSize}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildSmoothPath(points: DrawingPoint[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    d += ` L${points[1].x},${points[1].y}`;
    return d;
  }
  for (let i = 1; i < points.length - 1; i++) {
    const mid = {
      x: (points[i].x + points[i + 1].x) / 2,
      y: (points[i].y + points[i + 1].y) / 2,
    };
    d += ` Q${points[i].x},${points[i].y} ${mid.x},${mid.y}`;
  }
  const last = points[points.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}
