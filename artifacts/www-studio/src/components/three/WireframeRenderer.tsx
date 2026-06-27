/**
 * WireframeRenderer — Wireframe mode toggle for 3D scenes.
 *
 * Takes a ThreeDSceneConfig and renders all objects as wireframes.
 * Supports toggling between solid and wireframe modes.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeDSceneConfig, ExtraObject } from '@/types/three';

// ── Types ────────────────────────────────────────────────────────────────────

export interface WireframeRendererProps {
  /** The scene config containing objects to render */
  config: ThreeDSceneConfig;
  /** Wireframe line color */
  wireframeColor?: string;
  /** Background color override */
  backgroundColor?: string;
  /** Whether wireframe mode is active */
  wireframeEnabled?: boolean;
  /** Opacity of the wireframe lines */
  wireframeOpacity?: number;
}

// ── Geometry Helper ──────────────────────────────────────────────────────────

function getGeometryForType(type: ExtraObject['type']): THREE.BufferGeometry {
  switch (type) {
    case 'shapeTool':
      return new THREE.BoxGeometry(1, 1, 1);
    case 'objectTool':
      return new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32);
    case 'typeTool':
      return new THREE.SphereGeometry(0.7, 32, 32);
    case 'coverTool':
      return new THREE.PlaneGeometry(3, 2);
    default:
      return new THREE.IcosahedronGeometry(0.6, 0);
  }
}

// ── Single Wireframe Object ──────────────────────────────────────────────────

function WireframeObject({
  obj,
  wireframeColor,
  wireframeOpacity,
}: {
  obj: ExtraObject;
  wireframeColor: string;
  wireframeOpacity: number;
}) {
  const geometry = useMemo(() => getGeometryForType(obj.type), [obj.type]);

  if (obj.visible === false) return null;

  const position = obj.position ?? [0, 0, 0];
  const rotation = obj.rotation ?? [0, 0, 0];
  const scale = obj.scale ?? [1, 1, 1];

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={geometry}
    >
      <meshBasicMaterial
        color={wireframeColor}
        wireframe
        transparent
        opacity={wireframeOpacity}
      />
    </mesh>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function WireframeRenderer({
  config,
  wireframeColor = '#00ff88',
  backgroundColor,
  wireframeEnabled = true,
  wireframeOpacity = 0.8,
}: WireframeRendererProps) {
  const bg = backgroundColor ?? config.settings.backgroundColor;

  return (
    <group>
      {/* Background plane for wireframe mode */}
      {wireframeEnabled && (
        <color attach="background" args={[bg]} />
      )}

      {/* Wireframe objects */}
      {config.extraObjects.map((obj) => (
        <WireframeObject
          key={obj.id}
          obj={obj}
          wireframeColor={wireframeColor}
          wireframeOpacity={wireframeOpacity}
        />
      ))}

      {/* Grid lines in wireframe mode */}
      {wireframeEnabled && config.settings.gridEnabled && (
        <gridHelper
          args={[20, 20, wireframeColor, wireframeColor]}
        />
      )}
    </group>
  );
}
