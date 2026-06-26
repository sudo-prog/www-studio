import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Environment,
  Grid,
  OrbitControls,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { useControls } from 'leva';
import * as THREE from 'three';
import { type ThreeDSceneConfig } from '@/types/three';

// ── Props ────────────────────────────────────────────────────────────────────

interface SceneContentProps {
  config: ThreeDSceneConfig;
}

// ── Rotating Group ───────────────────────────────────────────────────────────

function RotatingGroup({ config }: SceneContentProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.2 * delta;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// ── Scene Lights ─────────────────────────────────────────────────────────────

function SceneLights({ config }: SceneContentProps) {
  return (
    <>
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      {config.lights.map((light) => {
        if (light.type === 'directional') {
          return (
            <directionalLight
              key={light.id}
              color={light.color}
              intensity={light.intensity}
              position={light.position}
              castShadow={light.castShadow}
            />
          );
        }
        if (light.type === 'point') {
          return (
            <pointLight
              key={light.id}
              color={light.color}
              intensity={light.intensity}
              position={light.position}
            />
          );
        }
        return null;
      })}
    </>
  );
}

// ── Post-Processing ──────────────────────────────────────────────────────────

function PostProcessing({ config }: SceneContentProps) {
  const effects = useControls('Effects', {
    bloom: { value: config.postProcessing.bloom, label: 'Bloom' },
    bloomIntensity: {
      value: config.postProcessing.bloomIntensity,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Bloom Intensity',
    },
    chromatic: { value: config.postProcessing.chromaticAberration, label: 'Chromatic Aberration' },
  });

  if (!effects.bloom) return null;

  return (
    <EffectComposer>
      <Bloom
        intensity={effects.bloomIntensity}
        luminanceThreshold={config.postProcessing.bloomThreshold}
        luminanceSmoothing={config.postProcessing.bloomSmoothing}
      />
      {effects.chromatic && (
        <ChromaticAberration
          offset={new THREE.Vector2(
            config.postProcessing.chromaticAberrationOffset[0],
            config.postProcessing.chromaticAberrationOffset[1]
          )}
        />
      )}
    </EffectComposer>
  );
}

// ── Scene Content (inside Canvas) ────────────────────────────────────────────

export default function SceneContent({ config }: SceneContentProps) {
  // Leva controls
  useControls('General', {
    showText: { value: true, label: 'Show Text' },
    text: { value: '3D Studio', label: 'Text' },
  });

  useControls('Material', {
    color: { value: '#8b5cf6', label: 'Color' },
    metalness: { value: 0.8, min: 0, max: 1, step: 0.01, label: 'Metalness' },
    roughness: { value: 0.2, min: 0, max: 1, step: 0.01, label: 'Roughness' },
  });

  const cameraControls = useControls('Camera', {
    fov: { value: config.camera.fov, min: 20, max: 120, step: 1, label: 'FOV' },
    autoRotate: { value: config.camera.autoRotate, label: 'Auto Rotate' },
  });

  return (
    <>
      {/* Lighting */}
      <SceneLights config={config} />

      {/* Environment */}
      <Suspense fallback={null}>
        <Environment preset={config.envPreset} />
      </Suspense>

      {/* Rotating Object */}
      <RotatingGroup config={config} />

      {/* Grid */}
      {config.settings.gridEnabled && (
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor={config.settings.gridColor}
          sectionSize={2}
          sectionThickness={1}
          sectionColor={config.settings.gridColor}
          fadeDistance={25}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {/* Orbit Controls */}
      <OrbitControls
        enableDamping={config.camera.enableDamping}
        dampingFactor={config.camera.dampingFactor}
        minDistance={config.camera.minDistance}
        maxDistance={config.camera.maxDistance}
        maxPolarAngle={config.camera.maxPolarAngle}
        autoRotate={cameraControls.autoRotate}
        autoRotateSpeed={config.camera.autoRotateSpeed}
        target={config.camera.target}
      />

      {/* Post-Processing */}
      <PostProcessing config={config} />
    </>
  );
}
