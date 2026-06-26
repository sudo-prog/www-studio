import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { type ThreeDSceneConfig, type Keyframe } from '@/types/three';

interface TimelineEditorProps {
  config: ThreeDSceneConfig;
  onUpdate: (config: ThreeDSceneConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ThreeDTimelineEditor({ config, onUpdate, isOpen, onClose }: TimelineEditorProps) {
  const hasKeyframes = config.timeline.clips.some((c) => c.keyframes.length >= 2);

  const addKeyframe = () => {
    const newKf: Keyframe = {
      id: `kf-${Date.now()}`,
      time: 0,
      cameraPosition: [...config.cameraPosition],
      cameraTarget: [0, 0, 0],
      rotationSpeed: config.rotationSpeed,
      envPreset: config.envPreset,
      easing: 'easeInOut',
    };
    const updatedClips = [...config.timeline.clips];
    if (updatedClips.length === 0) {
      updatedClips.push({
        id: `clip-${Date.now()}`,
        targetId: 'main',
        type: 'timeline',
        duration: 10,
        delay: 0,
        loop: true,
        keyframes: [newKf],
      });
    } else {
      updatedClips[0] = { ...updatedClips[0], keyframes: [...updatedClips[0].keyframes, newKf] };
    }
    onUpdate({ ...config, timeline: { ...config.timeline, clips: updatedClips } });
  };

  const removeKeyframe = (clipId: string, kfId: string) => {
    const updatedClips = config.timeline.clips.map((c) =>
      c.id === clipId ? { ...c, keyframes: c.keyframes.filter((k) => k.id !== kfId) } : c
    );
    onUpdate({ ...config, timeline: { ...config.timeline, clips: updatedClips } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 bg-zinc-900 border-t border-zinc-700 p-4 z-40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-200">Timeline</h3>
        <div className="flex gap-2">
          <button
            onClick={addKeyframe}
            className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
          >
            + Keyframe
          </button>
          <button onClick={onClose} className="text-xs px-2 py-1 text-zinc-400 hover:text-zinc-200">✕</button>
        </div>
      </div>

      <div className="relative h-16 bg-zinc-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center px-4">
          {Array.from({ length: Math.max(Math.ceil(config.timeline.duration), 10) }, (_, i) => (
            <div key={i} className="flex-1 border-l border-zinc-700 h-full flex items-end justify-center">
              <span className="text-[9px] text-zinc-600 mb-1">{i}s</span>
            </div>
          ))}
        </div>

        {config.timeline.clips.flatMap((clip) =>
          clip.keyframes.map((kf) => (
            <div
              key={kf.id}
              className="absolute top-2 w-3 h-3 bg-purple-500 rounded-full cursor-grab hover:bg-purple-400 transition-colors"
              style={{ left: `${(kf.time / config.timeline.duration) * 100}%` }}
              title={`${kf.time}s`}
            >
              <button
                onClick={() => removeKeyframe(clip.id, kf.id)}
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full text-[6px] leading-none flex items-center justify-center text-white"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 text-xs text-zinc-500">
        {config.timeline.clips.reduce((sum, c) => sum + c.keyframes.length, 0)} keyframe
        {config.timeline.clips.reduce((sum, c) => sum + c.keyframes.length, 0) !== 1 ? 's' : ''} • Duration: {config.timeline.duration}s
        {config.timeline.autoPlay && hasKeyframes && <span className="ml-2 text-purple-400">● Playing</span>}
      </div>
    </div>
  );
}

export function useTimelineAnimation(config: ThreeDSceneConfig) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!config.timeline.autoPlay) return;
    const allKeyframes = config.timeline.clips.flatMap((c) => c.keyframes);
    if (allKeyframes.length < 2) return;

    const tl = gsap.timeline({ repeat: config.timeline.loop ? -1 : 0 });
    allKeyframes.forEach((kf, i) => {
      if (i === 0) return;
      const prev = allKeyframes[i - 1];
      const duration = kf.time - prev.time;
      if (duration <= 0) return;
      tl.to({}, { duration, ease: kf.easing });
    });

    return () => { tl.kill(); };
  }, [config.timeline, config.keyframes]);

  return groupRef;
}
