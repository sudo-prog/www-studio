import React, { useState } from 'react';
import { type ThreeDSceneConfig, type ExtraObject } from '@/types/three';

interface ThreeDMultiObjectComposerProps {
  config: ThreeDSceneConfig;
  onUpdate: (config: ThreeDSceneConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PRIMITIVE_TYPES: ExtraObject['type'][] = ['sphere', 'box', 'torus', 'cone', 'cylinder', 'custom-glb'];

export default function ThreeDMultiObjectComposer({ config, onUpdate, isOpen, onClose }: ThreeDMultiObjectComposerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addObject = (type: ExtraObject['type']) => {
    const newObj: ExtraObject = {
      id: `obj-${Date.now()}`,
      type,
      position: [Math.random() * 4 - 2, Math.random() * 2, Math.random() * 4 - 2],
      rotation: [0, 0, 0],
      scale: 0.5,
      color: '#8b5cf6',
      metalness: 0.5,
      roughness: 0.5,
    };
    onUpdate({ ...config, extraObjects: [...config.extraObjects, newObj] });
    setSelectedId(newObj.id);
  };

  const removeObject = (id: string) => {
    onUpdate({ ...config, extraObjects: config.extraObjects.filter((o) => o.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const updateObject = (id: string, partial: Partial<ExtraObject>) => {
    onUpdate({
      ...config,
      extraObjects: config.extraObjects.map((o) => (o.id === id ? { ...o, ...partial } : o)),
    });
  };

  const duplicateObject = (obj: ExtraObject) => {
    const copy: ExtraObject = {
      ...obj,
      id: `obj-${Date.now()}`,
      position: [obj.position[0] + 0.5, obj.position[1], obj.position[2] + 0.5],
    };
    onUpdate({ ...config, extraObjects: [...config.extraObjects, copy] });
  };

  if (!isOpen) return null;

  const selected = config.extraObjects.find((o) => o.id === selectedId);

  return (
    <div className="fixed inset-y-0 right-0 w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col z-50">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-200">Objects ({config.extraObjects.length})</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">✕</button>
      </div>

      {/* Add buttons */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-800">
        {PRIMITIVE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => addObject(type)}
            className="px-2 py-0.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors"
          >
            + {type}
          </button>
        ))}
      </div>

      {/* Object list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {config.extraObjects.length === 0 && (
          <p className="text-[10px] text-zinc-600 text-center py-4">No objects. Add shapes above.</p>
        )}
        {config.extraObjects.map((obj) => (
          <div
            key={obj.id}
            onClick={() => setSelectedId(obj.id)}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
              selectedId === obj.id ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-zinc-800 hover:bg-zinc-750'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: obj.color }}
            />
            <span className="text-[10px] text-zinc-300 flex-1">{obj.type}</span>
            <button
              onClick={(e) => { e.stopPropagation(); duplicateObject(obj); }}
              className="text-[9px] text-zinc-500 hover:text-zinc-300"
            >
              ⧉
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeObject(obj.id); }}
              className="text-[9px] text-red-500 hover:text-red-400"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Selected object editor */}
      {selected && (
        <div className="border-t border-zinc-800 p-3 space-y-2">
          <h4 className="text-[10px] font-medium text-zinc-400">Edit: {selected.type}</h4>
          <div>
            <label className="text-[9px] text-zinc-500">Color</label>
            <input
              type="color"
              value={selected.color}
              onChange={(e) => updateObject(selected.id, { color: e.target.value })}
              className="w-full h-6 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[9px] text-zinc-500">Scale</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={selected.scale}
              onChange={(e) => updateObject(selected.id, { scale: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[9px] text-zinc-500">Metalness</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selected.metalness}
              onChange={(e) => updateObject(selected.id, { metalness: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
