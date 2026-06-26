import React, { useRef, useMemo } from 'react';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { type ThreeDSceneConfig } from '@/types/three';

interface TypeToolProps {
  config: ThreeDSceneConfig;
}

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

export default function TypeTool({ config }: TypeToolProps) {
  const meshRef = React.useRef<THREE.Group>(null!);

  if (!config.showText) return null;

  return (
    <group ref={meshRef}>
      <Center>
        <Text3D
          font={config.fontUrl || FONT_URL}
          size={config.fontSize}
          height={config.textDepth}
          letterSpacing={config.letterSpacing}
          bevelEnabled={config.bevelEnabled}
          bevelThickness={config.bevelThickness}
          bevelSize={0.02}
        >
          {config.text}
          <meshStandardMaterial
            color={config.color}
            metalness={config.metalness}
            roughness={config.roughness}
            emissive={config.emissive}
            emissiveIntensity={config.emissiveIntensity}
            wireframe={config.wireframe}
          />
        </Text3D>
      </Center>
    </group>
  );
}
