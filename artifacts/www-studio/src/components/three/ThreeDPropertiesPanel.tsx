import React, { useState } from 'react';
import { type ThreeDSceneConfig } from '@/types/three';

interface ThreeDPropertiesPanelProps {
  isOpen: boolean;
  config: ThreeDSceneConfig;
  sectionId: string;
  onUpdate: (newConfig: ThreeDSceneConfig) => void;
  onClose: () => void;
}

type TabId = 'ai' | 'text' | 'material' | 'lighting' | 'effects' | 'objects' | 'cover' | 'camera' | 'timeline' | 'shader' | 'export' | 'performance';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'text', label: 'Text' },
  { id: 'material', label: 'Material' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'effects', label: 'Effects' },
  { id: 'objects', label: 'Objects' },
  { id: 'cover', label: 'Cover' },
  { id: 'camera', label: 'Camera' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'shader', label: 'Shader' },
  { id: 'export', label: 'Export' },
  { id: 'performance', label: 'Perf' },
];

export default function ThreeDPropertiesPanel({ isOpen, config, onUpdate, onClose }: ThreeDPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('ai');

  if (!isOpen) return null;

  const update = (partial: Partial<ThreeDSceneConfig>) => {
    onUpdate({ ...config, ...partial });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">3D Properties</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-lg leading-none">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-1 text-[10px] rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'ai' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">AI Scene Generator</h3>
            <p className="text-[10px] text-zinc-500">Describe your scene and let AI generate a 3D config.</p>
            <textarea
              placeholder="e.g. A futuristic neon city with floating text..."
              className="w-full px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-600 resize-none h-20"
            />
            <button className="w-full px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors">
              ✨ Generate Scene
            </button>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Text & Typography</h3>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Text</label>
              <input
                type="text"
                value={config.showText ? config.text : ''}
                onChange={(e) => update({ text: e.target.value })}
                className="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Font Size</label>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.1"
                defaultValue={2.8}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Extrusion Depth</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                defaultValue={0.3}
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTab === 'material' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Material</h3>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Color</label>
              <input type="color" defaultValue="#a855f7" className="w-full h-8 rounded cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Metalness</label>
              <input type="range" min="0" max="1" step="0.01" defaultValue={0.7} className="w-full" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Roughness</label>
              <input type="range" min="0" max="1" step="0.01" defaultValue={0.15} className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="wireframe" className="rounded" />
              <label htmlFor="wireframe" className="text-[10px] text-zinc-400">Wireframe</label>
            </div>
          </div>
        )}

        {activeTab === 'lighting' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Lighting & Environment</h3>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Environment</label>
              <select className="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200">
                <option value="city">City</option>
                <option value="sunset">Sunset</option>
                <option value="dawn">Dawn</option>
                <option value="night">Night</option>
                <option value="warehouse">Warehouse</option>
                <option value="forest">Forest</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">BG Color</label>
              <input type="color" defaultValue="#050505" className="w-full h-8 rounded cursor-pointer" />
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-zinc-300">Post-Processing</h3>
            {['Bloom', 'DOF', 'Chromatic', 'Vignette', 'Noise'].map((fx) => (
              <div key={fx} className="flex items-center gap-2">
                <input type="checkbox" id={fx.toLowerCase()} className="rounded" />
                <label htmlFor={fx.toLowerCase()} className="text-[10px] text-zinc-400">{fx}</label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'objects' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Objects & Models</h3>
            <p className="text-[10px] text-zinc-500">Upload GLB models or add procedural shapes.</p>
            <button className="w-full px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
              + Add Object
            </button>
          </div>
        )}

        {activeTab === 'cover' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Cover Tool</h3>
            <p className="text-[10px] text-zinc-500">Add image or video with effects.</p>
            <div className="flex gap-2">
              {['Halftone', 'Glitch', 'Kaleidoscope', 'Displacement'].map((fx) => (
                <label key={fx} className="flex items-center gap-1">
                  <input type="checkbox" className="rounded w-3 h-3" />
                  <span className="text-[9px] text-zinc-500">{fx}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Camera</h3>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">FOV</label>
              <input type="range" min="20" max="120" defaultValue={50} className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="orbit" defaultChecked className="rounded" />
              <label htmlFor="orbit" className="text-[10px] text-zinc-400">Orbit Controls</label>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Timeline</h3>
            <p className="text-[10px] text-zinc-500">Keyframe animation coming in Phase 5.</p>
          </div>
        )}

        {activeTab === 'shader' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Shader Playground</h3>
            <p className="text-[10px] text-zinc-500">Custom GLSL editor coming in Phase 6.</p>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Export</h3>
            <div className="grid grid-cols-2 gap-2">
              {['PNG', 'GLB', 'Video', 'Embed'].map((fmt) => (
                <button key={fmt} className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
                  ⬇ {fmt}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Performance</h3>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Mode</label>
              <select className="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200">
                <option value="high">High</option>
                <option value="balanced">Balanced</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="shadows" defaultChecked className="rounded" />
              <label htmlFor="shadows" className="text-[10px] text-zinc-400">Shadows</label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
