import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { type ThreeDSceneConfig, type ExtraObject } from '@/types/three';

interface ObjectToolProps {
  config: ThreeDSceneConfig;
}

function PrimitiveGeometry({ type }: { type: string }) {
  switch (type) {
    case 'sphere': return <sphereGeometry args={[1, 32, 32]} />;
    case 'box': return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    case 'torus': return <torusGeometry args={[0.8, 0.3, 16, 48]} />;
    case 'cone': return <coneGeometry args={[1, 2, 32]} />;
    case 'cylinder': return <cylinderGeometry args={[0.8, 0.8, 2, 32]} />;
    default: return <sphereGeometry args={[1, 32, 32]} />;
  }
}

function ExtraObjectMesh({ obj }: { obj: ExtraObject }) {
  return (
    <group
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
    >
      <PrimitiveGeometry type={obj.type} />
      <meshStandardMaterial
        color={obj.color}
        metalness={obj.metalness}
        roughness={obj.roughness}
      />
    </group>
  );
}

export default function ObjectTool({ config }: ObjectToolProps) {
  const { scene } = useGLTF(config.modelUrl || '');

  if (config.modelUrl) {
    return (
      <group
        scale={config.modelScale}
        position={config.modelPosition}
      >
        <primitive object={scene} />
      </group>
    );
  }

  if (config.extraObjects.length > 0) {
    return (
      <group>
        {config.extraObjects.map((obj) => (
          <ExtraObjectMesh key={obj.id} obj={obj} />
        ))}
      </group>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
    </mesh>
  );
}
