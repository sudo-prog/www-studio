// ─── ShaderPreview.tsx ─────────────────────────────────────────────────────
// Compiles a vertex + fragment shader from item.code (which should be JSON
// with shape { vertex, fragment, uniforms? }) and renders a fullscreen
// quad. Hot-reloads when item.code changes.
import * as React from 'react';
import * as THREE from 'three';
import type { ComponentItem } from '@/data/component-library';

export interface ShaderPreviewProps {
  item: ComponentItem;
  height: number;
  onError?: (msg: string) => void;
}

interface ShaderDescriptor {
  vertex?: string;
  fragment: string;
  uniforms?: Record<string, { value: number | [number, number] | [number, number, number] }>;
}

const DEFAULT_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export function ShaderPreview({ item, height, onError }: ShaderPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let descriptor: ShaderDescriptor;
    try {
      descriptor = JSON.parse(item.code) as ShaderDescriptor;
      if (!descriptor.fragment) throw new Error('Missing fragment shader');
    } catch (e) {
      const msg = `Invalid shader JSON: ${e instanceof Error ? e.message : String(e)}`;
      setError(msg);
      onError?.(msg);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch (e) {
      const msg = `WebGL unavailable: ${e instanceof Error ? e.message : String(e)}`;
      setError(msg);
      onError?.(msg);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Build uniforms
    const uniforms: Record<string, THREE.IUniform> = {};
    if (descriptor.uniforms) {
      for (const [k, v] of Object.entries(descriptor.uniforms)) {
        uniforms[k] = { value: v.value };
      }
    }
    uniforms.u_time = { value: 0 };
    uniforms.u_resolution = { value: new THREE.Vector2(1, 1) };

    let material: THREE.ShaderMaterial;
    try {
      material = new THREE.ShaderMaterial({
        vertexShader: descriptor.vertex ?? DEFAULT_VERTEX,
        fragmentShader: descriptor.fragment,
        uniforms,
      });
    } catch (e) {
      const msg = `Shader compile failed: ${e instanceof Error ? e.message : String(e)}`;
      setError(msg);
      onError?.(msg);
      renderer.dispose();
      return;
    }

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const onResize = () => {
      const w = container.clientWidth || 400;
      const h = height;
      renderer.setSize(w, h, false);
      uniforms.u_resolution.value = new THREE.Vector2(w, h);
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    let rafId = 0;
    const start = performance.now();
    const animate = (now: number) => {
      uniforms.u_time.value = (now - start) * 0.001;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // Capture WebGL compile errors
    const gl = renderer.getContext();
    const compileLog = gl.getShaderInfoLog(material.fragmentShader as unknown as WebGLShader);
    if (compileLog && compileLog.trim().length > 0) {
      console.warn(`[ShaderPreview] Fragment compile log: ${compileLog}`);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, [item.code, height, onError]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-red-400 text-xs p-3 text-center" style={{ height }}>
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-zinc-950" style={{ height, minHeight: 200 }} />
  );
}