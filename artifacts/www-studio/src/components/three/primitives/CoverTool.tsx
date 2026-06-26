import React, { useRef, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { type ThreeDSceneConfig } from '@/types/three';

interface CoverToolProps {
  config: ThreeDSceneConfig;
}

export default function CoverTool({ config }: CoverToolProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  if (!config.coverMediaUrl) return null;

  if (config.coverMediaType === 'video') {
    useEffect(() => {
      const video = document.createElement('video');
      video.src = config.coverMediaUrl!;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play().catch(() => {});
      return () => { video.pause(); video.src = ''; };
    }, [config.coverMediaUrl]);

    return (
      <mesh ref={meshRef}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
    );
  }

  const texture = useTexture(config.coverMediaUrl);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
