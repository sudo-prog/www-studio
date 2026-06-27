import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneContent from './SceneContent';
import type { ThreeDSceneConfig } from '@/types/three';
import { DEFAULT_SCENE_CONFIG } from '@/types/three';

interface ThreeDSectionProps {
  sceneConfig: ThreeDSceneConfig;
  onConfigChange: (config: Partial<ThreeDSceneConfig>) => void;
  isEditing?: boolean;
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#050505]">
      <div className="text-zinc-500 text-sm animate-pulse">Loading 3D Scene...</div>
    </div>
  );
}

export default function ThreeDSection({ sceneConfig, isEditing }: ThreeDSectionProps) {
  const config = sceneConfig ?? DEFAULT_SCENE_CONFIG;

  return (
    <div
      className="w-full h-full relative rounded-lg overflow-hidden bg-[#050505]"
      style={{ aspectRatio: '16/9' }}
    >
      <Canvas
        shadows={config.settings.shadowsEnabled}
        dpr={[1, Math.min(config.settings.pixelRatio, 2)]}
        camera={{
          position: config.camera.position,
          fov: config.camera.fov,
          near: config.camera.near,
          far: config.camera.far,
        }}
        gl={{ preserveDrawingBuffer: true, antialias: config.settings.antialias }}
      >
        <Suspense fallback={null}>
          <SceneContent config={config} />
        </Suspense>
      </Canvas>

      {/* Editing chrome */}
      {isEditing && (
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="text-xs bg-purple-600/80 text-white px-2 py-1 rounded backdrop-blur-sm">
            3D Scene Studio
          </span>
        </div>
      )}

      {/* Text overlay */}
      {config.showText && config.text && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2
            className="text-4xl md:text-6xl font-bold text-white/90 tracking-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {config.text}
          </h2>
        </div>
      )}

      {/* Export buttons placeholder */}
      {isEditing && (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded backdrop-blur-sm transition-colors">
            ⬇ PNG
          </button>
          <button className="text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded backdrop-blur-sm transition-colors">
            ⬇ GLB
          </button>
        </div>
      )}

      <Suspense fallback={<LoadingFallback />}>
        <></>
      </Suspense>
    </div>
  );
}
