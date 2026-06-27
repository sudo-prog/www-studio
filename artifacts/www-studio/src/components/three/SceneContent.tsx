import React, { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Environment,
  Grid,
  OrbitControls,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { ThreeDSceneConfig, ExtraObject } from '@/types/three';

// ── Props ────────────────────────────────────────────────────────────────────

interface SceneContentProps {
  config: ThreeDSceneConfig;
}

// ── Single Object Renderer ───────────────────────────────────────────────────

function ObjectMesh({ obj }: { obj: ExtraObject }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && obj.visible !== false) {
      meshRef.current.rotation.y += 0.1 * delta;
    }
  });

  if (obj.visible === false) return null;

  const position = obj.position ?? [0, 0, 0];
  const rotation = obj.rotation ?? [0, 0, 0];
  const scale = obj.scale ?? [1, 1, 1];

  switch (obj.type) {
    case 'shapeTool':
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={obj.color}
            metalness={obj.metalness}
            roughness={obj.roughness}
          />
        </mesh>
      );
    case 'objectTool':
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow
          receiveShadow
        >
          <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
          <meshStandardMaterial
            color={obj.color}
            metalness={obj.metalness}
            roughness={obj.roughness}
          />
        </mesh>
      );
    case 'typeTool':
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial
            color={obj.color}
            metalness={obj.metalness}
            roughness={obj.roughness}
          />
        </mesh>
      );
    case 'coverTool':
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation}
          scale={scale}
          receiveShadow
        >
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial
            color={obj.color}
            metalness={obj.metalness}
            roughness={obj.roughness}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    default:
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={obj.color}
            metalness={obj.metalness}
            roughness={obj.roughness}
          />
        </mesh>
      );
  }
}

// ── Scene Objects ────────────────────────────────────────────────────────────

function SceneObjects({ config }: SceneContentProps) {
  return (
    <>
      {config.extraObjects.map((obj) => (
        <ObjectMesh key={obj.id} obj={obj} />
      ))}
    </>
  );
}

// ── Scene Lights ─────────────────────────────────────────────────────────────

function SceneLights({ config }: SceneContentProps) {
  return (
    <>
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      {config.lights.map((light) => {
        switch (light.type) {
          case 'directional':
            return (
              <directionalLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={light.position}
                castShadow={light.castShadow}
                target-position={light.target}
              />
            );
          case 'point':
            return (
              <pointLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={light.position}
                castShadow={light.castShadow}
                distance={light.distance}
                decay={light.decay}
              />
            );
          case 'spot':
            return (
              <spotLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={light.position}
                target-position={light.target}
                castShadow={light.castShadow}
                angle={light.angle}
                penumbra={light.penumbra}
                distance={light.distance}
                decay={light.decay}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

// ── Post-Processing ──────────────────────────────────────────────────────────

function PostProcessing({ config }: SceneContentProps) {
  const { postProcessing: pp } = config;

  const effects = [];

  if (pp.bloom) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={pp.bloomIntensity}
        luminanceThreshold={pp.bloomThreshold}
        luminanceSmoothing={pp.bloomSmoothing}
      />
    );
  }

  if (pp.chromaticAberration) {
    effects.push(
      <ChromaticAberration
        key="chromatic"
        offset={new THREE.Vector2(
          pp.chromaticAberrationOffset[0],
          pp.chromaticAberrationOffset[1]
        )}
      />
    );
  }

  if (effects.length === 0) {
    return null;
  }

  return <EffectComposer>{effects}</EffectComposer>;
}

// ── Scene Content (inside Canvas) ────────────────────────────────────────────

export default function SceneContent({ config }: SceneContentProps) {
  const bgColor = useMemo(
    () => new THREE.Color(config.settings.backgroundColor),
    [config.settings.backgroundColor]
  );

  return (
    <>
      {/* Background */}
      <color attach="background" args={[bgColor]} />

      {/* Fog */}
      {config.settings.fogEnabled && (
        <fog
          attach="fog"
          args={[config.settings.fogColor, config.settings.fogNear, config.settings.fogFar]}
        />
      )}

      {/* Lighting */}
      <SceneLights config={config} />

      {/* Environment */}
      <Suspense fallback={null}>
        <Environment preset={config.envPreset} />
      </Suspense>

      {/* Scene Objects */}
      <SceneObjects config={config} />

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
        autoRotate={config.camera.autoRotate}
        autoRotateSpeed={config.camera.autoRotateSpeed}
        target={config.camera.target}
      />

      {/* Post-Processing */}
      <PostProcessing config={config} />
    </>
  );
}
