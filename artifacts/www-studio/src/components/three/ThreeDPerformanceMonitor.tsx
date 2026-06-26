import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceMonitorProps {
  show: boolean;
}

export default function ThreeDPerformanceMonitor({ show }: PerformanceMonitorProps) {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(60);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;
    if (elapsed >= 1000) {
      const currentFps = Math.round((frameCount.current * 1000) / elapsed);
      setFps(currentFps);
      setAvgFps((prev) => Math.round(prev * 0.9 + currentFps * 0.1));
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  if (!show) return null;

  const lowFps = avgFps < 30;
  const warning = lowFps && '⚠ Low performance — switch to balanced';

  return (
    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-zinc-300 pointer-events-none">
      <span className={lowFps ? 'text-red-400' : 'text-green-400'}>{fps}</span>
      <span className="text-zinc-500"> fps</span>
      <span className="text-zinc-600 ml-1">avg:{avgFps}</span>
      {warning && <div className="text-orange-400 text-[9px]">{warning}</div>}
    </div>
  );
}

export function getPerformanceRecommendations(fps: number): { mode: 'high' | 'balanced' | 'low'; suggestion: string } {
  if (fps >= 55) return { mode: 'high', suggestion: 'Running smoothly at high quality.' };
  if (fps >= 30) return { mode: 'balanced', suggestion: 'Consider switching to balanced for smoother performance.' };
  return { mode: 'low', suggestion: 'Low FPS detected. Switch to low mode for best experience.' };
}
