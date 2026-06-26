import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export async function exportPNG(canvas: HTMLCanvasElement, scale = 4): Promise<void> {
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width * scale;
  offscreen.height = canvas.height * scale;
  const ctx = offscreen.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);

  offscreen.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene-3d.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export async function exportToGLB(scene: THREE.Scene): Promise<void> {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'scene-3d.glb';
          a.click();
          URL.revokeObjectURL(url);
        }
        resolve();
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

export async function startVideoExport(
  canvas: HTMLCanvasElement,
  durationMs = 8000,
  fps = 60
): Promise<MediaRecorder | null> {
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene-3d.webm';
    a.click();
    URL.revokeObjectURL(url);
  };

  recorder.start();
  setTimeout(() => recorder.stop(), durationMs);
  return recorder;
}
