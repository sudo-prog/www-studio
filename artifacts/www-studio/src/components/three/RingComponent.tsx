/**
 * RingComponent — A 3D ring/torus component.
 *
 * Can be used as a loading indicator, decorative element, or portal frame.
 * Supports animated rotation.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RingComponentProps {
  /** Inner radius of the ring */
  innerRadius?: number;
  /** Outer radius of the ring */
  outerRadius?: number;
  /** Ring color (hex or CSS color) */
  color?: string;
  /** Number of segments for smoothness */
  segments?: number;
  /** World position */
  position?: [number, number, number];
  /** World rotation */
  rotation?: [number, number, number];
  /** Enable animated rotation */
  animated?: boolean;
  /** Rotation speed (radians per second) */
  rotationSpeed?: number;
  /** Rotation axis: 'x' | 'y' | 'z' */
  rotationAxis?: 'x' | 'y' | 'z';
  /** Metalness for PBR material */
  metalness?: number;
  /** Roughness for PBR material */
  roughness?: number;
  /** Emissive color */
  emissive?: string;
  /** Emissive intensity */
  emissiveIntensity?: number;
  /** Tube thickness (alternative to inner/outer) */
  tubeThickness?: number;
}

export default function RingComponent({
  innerRadius = 0.8,
  outerRadius = 1.0,
  color = '#6366f1',
  segments = 64,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  animated = false,
  rotationSpeed = 1.0,
  rotationAxis = 'z',
  metalness = 0.5,
  roughness = 0.3,
  emissive,
  emissiveIntensity = 0,
  tubeThickness,
}: RingComponentProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate torus params from inner/outer radius
  const computedOuter = outerRadius;
  const computedTube = tubeThickness ?? (outerRadius - innerRadius) / 2;
  const computedInner = innerRadius;

  useFrame((_, delta) => {
    if (!meshRef.current || !animated) return;
    const speed = rotationSpeed * delta;
    switch (rotationAxis) {
      case 'x':
        meshRef.current.rotation.x += speed;
        break;
      case 'y':
        meshRef.current.rotation.y += speed;
        break;
      case 'z':
        meshRef.current.rotation.z += speed;
        break;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <torusGeometry args={[computedInner, computedTube, 16, segments]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}
