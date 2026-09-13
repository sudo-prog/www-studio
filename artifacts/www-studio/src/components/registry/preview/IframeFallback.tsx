// ─── IframeFallback.tsx ─────────────────────────────────────────────────────
// Default iframe-based preview. Used when no `kind` is set or for the
// 'iframe' kind explicitly. Sandboxed with same-origin + scripts.
import * as React from 'react';
import { DEFAULT_PREVIEW_HTML } from '@/components/ui/preview-code-card';
import type { ComponentItem } from '@/data/component-library';

export interface IframeFallbackProps {
  item: ComponentItem;
  height: number;
}

// Simple iframe wrapper for raw HTML/SVG content that doesn't need Babel/React
function simpleIframeHtml(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>* { box-sizing: border-box; margin: 0; padding: 0; } body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #09090b; }</style>
</head><body>${bodyContent}</body></html>`;
}

export function IframeFallback({ item, height }: IframeFallbackProps) {
  // If the item has previewHtml, use it directly (it's a full HTML doc)
  // If the code looks like raw HTML/SVG (starts with <), wrap it in a simple
  // iframe without Babel/React — this handles plain HTML CSS demos
  // Otherwise, fall back to DEFAULT_PREVIEW_HTML (Babel/JSX for TSX code)
  let html: string;
  if (item.previewHtml) {
    html = item.previewHtml;
  } else {
    const trimmed = item.code.trim();
    if (trimmed.startsWith('<') && !trimmed.startsWith('<!DOCTYPE') && !trimmed.startsWith('<html')) {
      // Plain HTML/SVG fragment — render directly without Babel
      html = simpleIframeHtml(trimmed);
    } else {
      // TSX/React code — use Babel
      html = DEFAULT_PREVIEW_HTML(item.code);
    }
  }

  const src = React.useMemo(
    () => `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    [html],
  );

  return (
    <iframe
      src={src}
      className="w-full border-0 block"
      style={{ height, minHeight: 200 }}
      title={item.name}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}