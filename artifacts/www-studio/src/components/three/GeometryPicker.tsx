/**
 * GeometryPicker — Geometry selection UI for the 3D scene.
 *
 * Grid of clickable geometry types. On click, adds that geometry
 * to the scene at a default position. Shows icon representation.
 */

import React, { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type GeometryType =
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'torusKnot'
  | 'plane'
  | 'icosahedron'
  | 'octahedron'
  | 'dodecahedron'
  | 'ring';

export interface GeometryOption {
  type: GeometryType;
  label: string;
  icon: string;
  description: string;
}

export interface GeometryPickerProps {
  /** Callback when a geometry is selected */
  onGeometrySelect: (type: GeometryType) => void;
  /** Currently selected geometry (highlighted) */
  selected?: GeometryType | null;
  /** Number of columns in the grid */
  columns?: number;
  /** Additional className */
  className?: string;
}

// ── Geometry Options ─────────────────────────────────────────────────────────

const GEOMETRY_OPTIONS: GeometryOption[] = [
  { type: 'box', label: 'Box', icon: '⬜', description: 'Cube geometry' },
  { type: 'sphere', label: 'Sphere', icon: '⚪', description: 'Sphere geometry' },
  { type: 'cylinder', label: 'Cylinder', icon: '🔷', description: 'Cylinder geometry' },
  { type: 'cone', label: 'Cone', icon: '🔺', description: 'Cone geometry' },
  { type: 'torus', label: 'Torus', icon: '⭕', description: 'Torus ring' },
  { type: 'torusKnot', label: 'Knot', icon: '🔗', description: 'Torus knot' },
  { type: 'plane', label: 'Plane', icon: '▬', description: 'Flat plane' },
  { type: 'icosahedron', label: 'Icosa', icon: '⬡', description: '20-sided shape' },
  { type: 'octahedron', label: 'Octa', icon: '◆', description: '8-sided shape' },
  { type: 'dodecahedron', label: 'Dodeca', icon: '⬢', description: '12-sided shape' },
  { type: 'ring', label: 'Ring', icon: '◎', description: 'Ring disc' },
];

// ── SVG Icon Components ─────────────────────────────────────────────────────

const GEOMETRY_SVGS: Record<GeometryType, React.ReactNode> = {
  box: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4" />
      <path d="M12 11v10" />
    </svg>
  ),
  sphere: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <path d="M12 3v18" />
    </svg>
  ),
  cylinder: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="7" ry="2.5" />
      <ellipse cx="12" cy="19" rx="7" ry="2.5" />
      <path d="M5 5v14M19 5v14" />
    </svg>
  ),
  cone: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="19" rx="7" ry="2.5" />
      <path d="M5 19L12 4l7 15" />
    </svg>
  ),
  torus: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="9" ry="5" />
      <ellipse cx="12" cy="12" rx="4" ry="2" />
    </svg>
  ),
  torusKnot: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8c4-3 10 0 8 4s-10 0-8 4 4 6 8 4 6-8 2-12-12 0-10 4z" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 17l9-4 9 4-9 4z" />
    </svg>
  ),
  icosahedron: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l9 5v10l-9 5-9-5V7z" />
      <path d="M12 2v20M3 7l9 5 9-5M3 17l9-5 9 5" />
    </svg>
  ),
  octahedron: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L3 12l9 10 9-10z" />
      <path d="M3 12h18" />
    </svg>
  ),
  dodecahedron: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l7 4v8l-7 4-7-4V6z" />
      <path d="M5 6l7 4 7-4M12 12v10" />
    </svg>
  ),
  ring: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  ),
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function GeometryPicker({
  onGeometrySelect,
  selected = null,
  columns = 4,
  className = '',
}: GeometryPickerProps) {
  const [hoveredType, setHoveredType] = useState<GeometryType | null>(null);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">📐</span>
        <h3 className="text-sm font-semibold text-white">Add Geometry</h3>
      </div>

      {/* Grid */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {GEOMETRY_OPTIONS.map((option) => {
          const isSelected = selected === option.type;
          const isHovered = hoveredType === option.type;

          return (
            <button
              key={option.type}
              onClick={() => onGeometrySelect(option.type)}
              onMouseEnter={() => setHoveredType(option.type)}
              onMouseLeave={() => setHoveredType(null)}
              title={option.description}
              className={`
                relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg
                border transition-all duration-150
                ${
                  isSelected
                    ? 'bg-indigo-500/25 border-indigo-500/60 text-indigo-200'
                    : isHovered
                    ? 'bg-zinc-700/60 border-zinc-600 text-zinc-200'
                    : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:text-zinc-200'
                }
              `}
            >
              {/* SVG Icon */}
              <span className={isSelected ? 'text-indigo-300' : ''}>
                {GEOMETRY_SVGS[option.type]}
              </span>

              {/* Label */}
              <span className="text-[10px] font-medium leading-none">
                {option.label}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-zinc-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Description tooltip area */}
      {hoveredType && (
        <div className="mt-2 px-2 py-1.5 bg-zinc-800/80 rounded-md">
          <p className="text-[10px] text-zinc-400">
            {GEOMETRY_OPTIONS.find((o) => o.type === hoveredType)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
