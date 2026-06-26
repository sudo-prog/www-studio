import React, { useMemo } from 'react';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';
import { type ThreeDSceneConfig } from '@/types/three';

interface ShapeToolProps {
  config: ThreeDSceneConfig;
}

export default function ShapeTool({ config }: ShapeToolProps) {
  // SVG extrusion placeholder — full implementation needs SVG path data
  // For now, render a simple extruded shape as placeholder
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1, -1);
    shape.lineTo(1, -1);
    shape.lineTo(1, 1);
    shape.lineTo(-1, 1);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.03,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={config.color}
        metalness={config.metalness}
        roughness={config.roughness}
      />
    </mesh>
  );
}
