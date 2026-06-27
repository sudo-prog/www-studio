/**
 * TreeComponent — Procedural 3D tree generator.
 *
 * Creates a tree with a cylinder trunk and cone/sphere foliage cluster.
 * Animated growth on mount via useFrame scale animation.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TreeComponentProps {
  /** Total height of the tree */
  height?: number;
  /** Radius of the trunk cylinder */
  trunkRadius?: number;
  /** Foliage color (hex) */
  foliageColor?: string;
  /** Number of foliage clusters (density) */
  foliageDensity?: number;
  /** World position */
  position?: [number, number, number];
  /** World rotation */
  rotation?: [number, number, number];
  /** Animation duration in seconds */
  growthDuration?: number;
  /** Trunk color */
  trunkColor?: string;
}

// ── Single Foliage Cluster ───────────────────────────────────────────────────

function FoliageCluster({
  position,
  radius,
  color,
}: {
  position: [number, number, number];
  radius: number;
  color: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <coneGeometry args={[radius, radius * 1.5, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[radius * 0.3, -radius * 0.2, 0]} castShadow>
        <sphereGeometry args={[radius * 0.6, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function TreeComponent({
  height = 3,
  trunkRadius = 0.15,
  foliageColor = '#22c55e',
  foliageDensity = 5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  growthDuration = 1.5,
  trunkColor = '#8B4513',
}: TreeComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const grownRef = useRef(false);

  // Generate foliage positions around the top of the trunk
  const foliagePositions = useMemo(() => {
    const positions: { pos: [number, number, number]; radius: number }[] = [];
    const trunkTop = height * 0.5;
    const clusterCount = Math.max(1, Math.min(foliageDensity, 12));

    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2;
      const dist = (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.6;
      const yOffset = (Math.cos(i * 2.3) * 0.3);
      positions.push({
        pos: [
          Math.cos(angle) * dist,
          trunkTop + yOffset,
          Math.sin(angle) * dist,
        ],
        radius: 0.3 + Math.random() * 0.25,
      });
    }

    // Add a top cluster
    positions.push({
      pos: [0, trunkTop + 0.4, 0],
      radius: 0.4,
    });

    return positions;
  }, [height, foliageDensity]);

  // Growth animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta / growthDuration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progressRef.current, 3);
      groupRef.current.scale.setScalar(eased);
    } else if (!grownRef.current) {
      grownRef.current = true;
      groupRef.current.scale.setScalar(1);
    }

    // Gentle sway
    if (grownRef.current) {
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={0}>
      {/* Trunk */}
      <mesh castShadow receiveShadow position={[0, height * 0.25, 0]}>
        <cylinderGeometry args={[trunkRadius * 0.7, trunkRadius, height * 0.5, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Foliage clusters */}
      {foliagePositions.map((fp, i) => (
        <FoliageCluster
          key={i}
          position={fp.pos}
          radius={fp.radius}
          color={foliageColor}
        />
      ))}
    </group>
  );
}
