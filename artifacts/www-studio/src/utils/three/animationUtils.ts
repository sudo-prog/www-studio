/**
 * Animation Utilities — Reusable animation helpers for React Three Fiber.
 *
 * Exports hook-based helpers that use useFrame internally:
 * - useFadeIn: Animate opacity from 0 to 1
 * - useBounce: Animate Y position with sine wave
 * - useRotate: Continuous rotation at configurable speed
 * - useScaleIn: Animate scale from 0 to 1 with easing
 * - useFloat: Gentle floating motion
 *
 * All helpers accept a THREE.Object3D ref and configuration.
 */

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── useFadeIn ────────────────────────────────────────────────────────────────

export interface FadeInOptions {
  /** Duration in seconds */
  duration?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Target opacity (0-1) */
  targetOpacity?: number;
}

export function useFadeIn(
  ref: React.RefObject<THREE.Object3D>,
  { duration = 1.0, delay = 0, targetOpacity = 1.0 }: FadeInOptions = {}
) {
  const elapsed = useRef(0);
  const started = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;

    elapsed.current += delta;

    if (elapsed.current < delay) return;

    if (!started.current) {
      started.current = true;
    }

    const animTime = elapsed.current - delay;
    const progress = Math.min(animTime / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    // Apply to all materials in the object hierarchy
    ref.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if ('opacity' in mat) {
            (mat as THREE.MeshStandardMaterial).opacity = eased * targetOpacity;
            mat.transparent = true;
          }
        });
      }
    });
  });
}

// ── useBounce ────────────────────────────────────────────────────────────────

export interface BounceOptions {
  /** Amplitude of the bounce (world units) */
  amplitude?: number;
  /** Frequency of the bounce (cycles per second) */
  frequency?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Axis to bounce along */
  axis?: 'x' | 'y' | 'z';
}

export function useBounce(
  ref: React.RefObject<THREE.Object3D>,
  { amplitude = 0.5, frequency = 2.0, delay = 0, axis = 'y' }: BounceOptions = {}
) {
  const elapsed = useRef(0);
  const initialPos = useRef<[number, number, number] | null>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Capture initial position on first frame
    if (!initialPos.current) {
      initialPos.current = [ref.current.position.x, ref.current.position.y, ref.current.position.z];
    }

    elapsed.current += delta;

    if (elapsed.current < delay) return;

    const t = (elapsed.current - delay) * frequency * Math.PI * 2;
    const offset = Math.sin(t) * amplitude;

    if (initialPos.current) {
      ref.current.position[axis] = initialPos.current[{ x: 0, y: 1, z: 2 }[axis]] + offset;
    }
  });
}

// ── useRotate ────────────────────────────────────────────────────────────────

export interface RotateOptions {
  /** Rotation speed (radians per second) */
  speed?: number;
  /** Axis to rotate around */
  axis?: 'x' | 'y' | 'z';
  /** Delay before animation starts (seconds) */
  delay?: number;
}

export function useRotate(
  ref: React.RefObject<THREE.Object3D>,
  { speed = 1.0, axis = 'y', delay = 0 }: RotateOptions = {}
) {
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;

    elapsed.current += delta;

    if (elapsed.current < delay) return;

    const rotationAmount = speed * delta;
    ref.current.rotation[axis] += rotationAmount;
  });
}

// ── useScaleIn ───────────────────────────────────────────────────────────────

export interface ScaleInOptions {
  /** Duration in seconds */
  duration?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Initial scale (usually 0) */
  fromScale?: number;
  /** Target scale (usually 1) */
  toScale?: number;
}

export function useScaleIn(
  ref: React.RefObject<THREE.Object3D>,
  { duration = 0.8, delay = 0, fromScale = 0, toScale = 1 }: ScaleInOptions = {}
) {
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;

    elapsed.current += delta;

    if (elapsed.current < delay) {
      ref.current.scale.setScalar(fromScale);
      return;
    }

    const animTime = elapsed.current - delay;
    const progress = Math.min(animTime / duration, 1);
    // Elastic ease-out
    const eased = progress === 1
      ? 1
      : 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * ((2 * Math.PI) / 3));

    const scale = fromScale + (toScale - fromScale) * Math.max(0, eased);
    ref.current.scale.setScalar(scale);
  });
}

// ── useFloat ─────────────────────────────────────────────────────────────────

export interface FloatOptions {
  /** Vertical amplitude */
  amplitude?: number;
  /** Float speed (cycles per second) */
  speed?: number;
  /** Horizontal sway amplitude */
  swayAmplitude?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
}

export function useFloat(
  ref: React.RefObject<THREE.Object3D>,
  { amplitude = 0.2, speed = 1.0, swayAmplitude = 0.05, delay = 0 }: FloatOptions = {}
) {
  const elapsed = useRef(0);
  const initialPos = useRef<[number, number, number] | null>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    if (!initialPos.current) {
      initialPos.current = [ref.current.position.x, ref.current.position.y, ref.current.position.z];
    }

    elapsed.current += delta;

    if (elapsed.current < delay) return;

    const t = (elapsed.current - delay) * speed * Math.PI * 2;

    if (initialPos.current) {
      ref.current.position.y = initialPos.current[1] + Math.sin(t) * amplitude;
      ref.current.position.x = initialPos.current[0] + Math.cos(t * 0.7) * swayAmplitude;
    }
  });
}

// ── usePulse ─────────────────────────────────────────────────────────────────

export interface PulseOptions {
  /** Minimum scale */
  minScale?: number;
  /** Maximum scale */
  maxScale?: number;
  /** Pulse speed (cycles per second) */
  speed?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
}

export function usePulse(
  ref: React.RefObject<THREE.Object3D>,
  { minScale = 0.95, maxScale = 1.05, speed = 2.0, delay = 0 }: PulseOptions = {}
) {
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;

    elapsed.current += delta;

    if (elapsed.current < delay) return;

    const t = (elapsed.current - delay) * speed * Math.PI * 2;
    const scale = minScale + (maxScale - minScale) * (0.5 + 0.5 * Math.sin(t));
    ref.current.scale.setScalar(scale);
  });
}

// ── Utility: Reset animation state ───────────────────────────────────────────

/** Reset a ref's animation state (useful for re-triggering animations) */
export function resetAnimationState(...refs: React.RefObject<THREE.Object3D | null>[]) {
  refs.forEach((r) => {
    if (r.current) {
      r.current.scale.setScalar(1);
      r.current.position.set(0, 0, 0);
      r.current.rotation.set(0, 0, 0);
    }
  });
}
