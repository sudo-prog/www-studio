// ─── ThreePreview.tsx ───────────────────────────────────────────────────────
// Initializes a Three.js scene from a JSON descriptor and renders to a
// <canvas>. Scene descriptors are encoded in item.code as a JSON blob
// with shape: { camera: {x,y,z}, lights: [...], meshes: [{ geometry, material, transform }] }.
// Falls back to a rotating cube when no descriptor is provided.
import * as React from 'react';
import * as THREE from 'three';
import type { ComponentItem } from '@/data/component-library';

export interface ThreePreviewProps {
  item: ComponentItem;
  height: number;
  onError?: (msg: string) => void;
}

interface SceneDescriptor {
  camera?: { x?: number; y?: number; z?: number };
  background?: string;
  meshes?: Array<{
    geometry?: 'cube' | 'sphere' | 'torus' | 'cone';
    color?: string;
    position?: { x?: number; y?: number; z?: number };
    wireframe?: boolean;
  }>;
}

export function ThreePreview({ item, height, onError }: ThreePreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let descriptor: SceneDescriptor = {};
    if (item.code.trim()) {
      try {
        descriptor = JSON.parse(item.code) as SceneDescriptor;
      } catch {
        // not JSON — render default
        descriptor = {};
      }
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      const msg = `WebGL unavailable: ${e instanceof Error ? e.message : String(e)}`;
      setError(msg);
      onError?.(msg);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const w = container.clientWidth || 400;
    const h = height;
    renderer.setSize(w, h, false);
    renderer.setClearColor(descriptor.background ?? '#0a0a0a', 1);

    const scene = new THREE.Scene();
    const cam = descriptor.camera ?? { x: 0, y: 0, z: 4 };
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(cam.x ?? 0, cam.y ?? 0, cam.z ?? 4);

    // Basic lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(2, 2, 2);
    scene.add(dirLight);

    // Mesh group
    const group = new THREE.Group();
    scene.add(group);

    const makeGeom = (kind: string) => {
      switch (kind) {
        case 'sphere': return new THREE.SphereGeometry(0.8, 32, 32);
        case 'torus': return new THREE.TorusGeometry(0.7, 0.25, 16, 64);
        case 'cone': return new THREE.ConeGeometry(0.7, 1.2, 32);
        case 'cube':
        default: return new THREE.BoxGeometry(1, 1, 1);
      }
    };

    const meshes = (descriptor.meshes && descriptor.meshes.length > 0)
      ? descriptor.meshes
      : [{ geometry: 'cube' as const, color: '#3b82f6' }, { geometry: 'sphere' as const, color: '#a855f7', position: { x: 1.5 } }];

    meshes.forEach((m, i) => {
      const geom = makeGeom(m.geometry ?? 'cube');
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(m.color ?? '#3b82f6'),
        wireframe: m.wireframe ?? false,
        metalness: 0.3,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(geom, mat);
      const p = m.position ?? {};
      mesh.position.set(p.x ?? (i * 1.5 - 0.75), p.y ?? 0, p.z ?? 0);
      group.add(mesh);
    });

    // Mouse drag for orbit
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    const onDown = (e: PointerEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onUp = () => { isDragging = false; };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    let rafId = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) * 0.001;
      if (!isDragging) {
        group.rotation.y = t * 0.5;
        group.rotation.x = Math.sin(t * 0.3) * 0.2;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onResize = () => {
      const nw = container.clientWidth || 400;
      renderer.setSize(nw, h, false);
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
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
    <div ref={containerRef} className="w-full bg-zinc-950" style={{ height, minHeight: 200 }}>
      <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: 'none' }} />
    </div>
  );
}