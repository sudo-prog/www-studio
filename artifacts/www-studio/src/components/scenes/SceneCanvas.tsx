import { useRef, useCallback } from "react";
import { type SceneElement } from "@/lib/scene-types";

interface Props {
  elements:        SceneElement[];
  selectedId:      string | null;
  canvasWidth:     number;
  canvasHeight:    number;
  background:      string;
  onSelect:        (id: string | null) => void;
  onMove:          (id: string, x: number, y: number) => void;
}

function getPolygonPoints(type: SceneElement["type"], w: number, h: number): string {
  if (type === "triangle") return `${w/2},0 ${w},${h} 0,${h}`;
  if (type === "hexagon")  return `${w/2},0 ${w},${h*0.25} ${w},${h*0.75} ${w/2},${h} 0,${h*0.75} 0,${h*0.25}`;
  if (type === "diamond")  return `${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}`;
  if (type === "star") {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r     = i % 2 === 0 ? Math.min(w, h) / 2 : Math.min(w, h) / 4;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${w/2 + r * Math.cos(angle)},${h/2 + r * Math.sin(angle)}`);
    }
    return pts.join(" ");
  }
  return "";
}

function SceneElementShape({ el, selected, onMouseDown }: {
  el: SceneElement;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
}) {
  if (!el.visible) return null;

  const filter = el.blur > 0 ? `blur(${el.blur}px)` : undefined;
  const transform = el.rotation ? `rotate(${el.rotation} ${el.x + el.width/2} ${el.y + el.height/2})` : undefined;

  const preset = el.animation?.preset ?? "none";
  const animStyle = preset !== "none" ? {
    animation: `${preset} ${el.animation?.duration ?? 4}s ${el.animation?.easing ?? "ease-in-out"} ${el.animation?.delay ?? 0}s ${el.animation?.loop !== false ? "infinite" : "1"} both`,
  } : {};

  const baseProps = {
    opacity: el.opacity,
    style:   { cursor: el.locked ? "not-allowed" : "move", filter, ...animStyle },
    transform,
    onMouseDown: (e: React.MouseEvent) => { if (!el.locked) onMouseDown(e, el.id); },
  };

  let shape: React.ReactNode = null;

  if (el.type === "circle") {
    shape = (
      <circle
        cx={el.x + el.width / 2}
        cy={el.y + el.height / 2}
        r={Math.min(el.width, el.height) / 2}
        fill={el.fill}
        fillOpacity={el.fillOpacity}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        {...baseProps}
      />
    );
  } else if (el.type === "rect") {
    shape = (
      <rect
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        fill={el.fill}
        fillOpacity={el.fillOpacity}
        rx={12}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        {...baseProps}
      />
    );
  } else if (el.type === "text") {
    shape = (
      <text
        x={el.x}
        y={el.y + (el.fontSize ?? 24)}
        fontSize={el.fontSize ?? 24}
        fontFamily={el.fontFamily ?? "Inter, sans-serif"}
        fontWeight={el.fontWeight ?? 400}
        fill={el.fill}
        {...baseProps}
      >
        {el.text ?? "Text"}
      </text>
    );
  } else if (el.type === "wave" && el.svgPath) {
    shape = (
      <path
        d={el.svgPath}
        stroke={el.fill}
        strokeWidth={3}
        fill="none"
        transform={`translate(${el.x},${el.y}) scale(${el.width/300},${el.height/60})`}
        {...baseProps}
      />
    );
  } else if (el.type === "line") {
    shape = (
      <line
        x1={el.x}
        y1={el.y}
        x2={el.x + el.width}
        y2={el.y}
        stroke={el.fill}
        strokeWidth={Math.max(1, el.height)}
        {...baseProps}
      />
    );
  } else if (["blob", "triangle", "hexagon", "diamond", "star"].includes(el.type)) {
    const poly = getPolygonPoints(el.type, el.width, el.height);
    if (el.svgPath) {
      shape = (
        <path
          d={el.svgPath}
          fill={el.fill}
          fillOpacity={el.fillOpacity}
          transform={`translate(${el.x},${el.y}) scale(${el.width/240},${el.height/220})`}
          {...baseProps}
        />
      );
    } else if (poly) {
      shape = (
        <polygon
          points={poly.split(" ").map((pt) => {
            const [px, py] = pt.split(",");
            return `${el.x + parseFloat(px)},${el.y + parseFloat(py)}`;
          }).join(" ")}
          fill={el.fill}
          fillOpacity={el.fillOpacity}
          {...baseProps}
        />
      );
    }
  }

  return (
    <g>
      {shape}
      {selected && (
        <>
          <rect
            x={el.x - 2}
            y={el.y - 2}
            width={el.width + 4}
            height={el.height + 4}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="5,3"
            rx={4}
            style={{ pointerEvents: "none" }}
          />
          {/* Corner handles */}
          {[
            [el.x - 5,             el.y - 5],
            [el.x + el.width - 4,  el.y - 5],
            [el.x - 5,             el.y + el.height - 4],
            [el.x + el.width - 4,  el.y + el.height - 4],
          ].map(([hx, hy], i) => (
            <rect key={i} x={hx} y={hy} width={9} height={9} fill="#6366f1" rx={2} style={{ pointerEvents: "none" }} />
          ))}
        </>
      )}
    </g>
  );
}

export function SceneCanvas({ elements, selectedId, canvasWidth, canvasHeight, background, onSelect, onMove }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; startSvgX: number; startSvgY: number; origX: number; origY: number } | null>(null);

  function getSVGCoords(e: React.MouseEvent): { x: number; y: number } {
    const svg  = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect   = svg.getBoundingClientRect();
    const scaleX = canvasWidth  / rect.width;
    const scaleY = canvasHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  }

  const handleElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelect(id);
    const el = elements.find((el) => el.id === id);
    if (!el) return;
    const { x: svgX, y: svgY } = getSVGCoords(e);
    dragRef.current = { id, startSvgX: svgX, startSvgY: svgY, origX: el.x, origY: el.y };
    e.preventDefault();
  }, [elements, onSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { id, startSvgX, startSvgY, origX, origY } = dragRef.current;
    const { x, y } = getSVGCoords(e);
    const newX = Math.round(origX + (x - startSvgX));
    const newY = Math.round(origY + (y - startSvgY));
    onMove(id, newX, newY);
  }, [onMove]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          background,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
        }}
        onMouseDown={() => onSelect(null)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Canvas background gradient */}
        <defs>
          <radialGradient id="canvas-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <style>{`
@keyframes gentle-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes gradient-breathe{ 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:.85;transform:scale(1.10)} }
@keyframes shadow-pulse    { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.4)} }
@keyframes hover-lift      { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.04)} }
@keyframes morph           { 0%,100%{rx:60px;ry:40px} 50%{rx:30px;ry:70px} }
@keyframes spin-slow       { from{transform-origin:center;transform:rotate(0deg)} to{transform-origin:center;transform:rotate(360deg)} }
@keyframes scale-pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
@keyframes elastic-bounce  { 0%,100%{transform:scale(1)} 30%{transform:scale(1.2)} 60%{transform:scale(0.9)} 80%{transform:scale(1.05)} }
@keyframes fade-in-out     { 0%,100%{opacity:.7} 50%{opacity:.08} }
@keyframes drift           { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,-12px)} 66%{transform:translate(-10px,18px)} }
@keyframes aurora-sweep    { 0%,100%{transform:translateX(-4%)} 50%{transform:translateX(4%)} }
@keyframes cosmic-pulse    { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.1) rotate(180deg)} }
          `}</style>
        </defs>
        <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#canvas-bg)" />

        {sorted.map((el) => (
          <SceneElementShape
            key={el.id}
            el={el}
            selected={el.id === selectedId}
            onMouseDown={handleElementMouseDown}
          />
        ))}
      </svg>

      {elements.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-white/20 text-sm">Click elements in the left panel to add them</p>
        </div>
      )}
    </div>
  );
}
