// ─── PreviewRenderer.tsx ────────────────────────────────────────────────────
// Universal live component renderer — dispatches to the correct per-kind
// renderer based on the ComponentItem's `kind` field.
//
// Supports: React components (via dynamic registry), Three.js scenes,
// WebGL shaders, raw HTML, and iframe fallback.
import * as React from 'react';
import type { ComponentItem } from '@/data/component-library';

const ReactPreview = React.lazy(() => import('./preview/ReactPreview').then(m => ({ default: m.ReactPreview })));
const ThreePreview = React.lazy(() => import('./preview/ThreePreview').then(m => ({ default: m.ThreePreview })));
const ShaderPreview = React.lazy(() => import('./preview/ShaderPreview').then(m => ({ default: m.ShaderPreview })));
const HtmlPreview = React.lazy(() => import('./preview/HtmlPreview').then(m => ({ default: m.HtmlPreview })));
const IframeFallback = React.lazy(() => import('./preview/IframeFallback').then(m => ({ default: m.IframeFallback })));

export type { ComponentItem };

export interface PreviewRendererProps {
  item: ComponentItem;
  height?: number;
}

export function PreviewRenderer({ item, height = 400 }: PreviewRendererProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleError = React.useCallback((msg: string) => {
    console.error(`[PreviewRenderer] ${item.kind ?? 'iframe'}/${item.id}:`, msg);
    setError(msg);
  }, [item.id, item.kind]);

  const fallback = (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
      {error ?? 'Loading preview…'}
    </div>
  );

  let inner: React.ReactNode;

  switch (item.kind) {
    case 'react':
      inner = <ReactPreview item={item} height={height} onError={handleError} />;
      break;
    case 'three':
      inner = <ThreePreview item={item} height={height} onError={handleError} />;
      break;
    case 'shader':
      inner = <ShaderPreview item={item} height={height} onError={handleError} />;
      break;
    case 'html':
      inner = <HtmlPreview item={item} height={height} />;
      break;
    case 'iframe':
    default:
      inner = <IframeFallback item={item} height={height} />;
      break;
  }

  return (
    <React.Suspense fallback={fallback}>
      {inner}
    </React.Suspense>
  );
}
