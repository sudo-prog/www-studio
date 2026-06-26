import React from 'react';
import { DEFAULT_SCENE_CONFIG, type ThreeDSceneConfig } from '@/types/three';

interface ThreeDSectionProps {
  config?: ThreeDSceneConfig;
  isEditing?: boolean;
  onUpdate?: (config: ThreeDSceneConfig) => void;
}

export default function ThreeDSection({ config = DEFAULT_SCENE_CONFIG }: ThreeDSectionProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#050505] rounded-lg border border-zinc-800">
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🎲</div>
        <h3 className="text-xl font-semibold text-zinc-200 mb-2">3D Scene Studio</h3>
        <p className="text-zinc-500 text-sm">
          {config.showText ? config.text : 'Configure your 3D scene'}
        </p>
        <span className="inline-block mt-3 text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
          Phase 1 — Coming Soon
        </span>
      </div>
    </div>
  );
}
