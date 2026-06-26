import React from 'react';
import { type ThreeDSceneConfig } from '@/types/three';

interface ThreeDPropertiesPanelProps {
  isOpen: boolean;
  config: ThreeDSceneConfig;
  sectionId: string;
  onUpdate: (newConfig: ThreeDSceneConfig) => void;
  onClose: () => void;
}

export default function ThreeDPropertiesPanel({ onClose }: ThreeDPropertiesPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 border-l border-zinc-800 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-200">3D Scene Properties</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">✕</button>
      </div>
      <p className="text-zinc-500 text-sm">Full properties panel — Phase 9</p>
    </div>
  );
}
