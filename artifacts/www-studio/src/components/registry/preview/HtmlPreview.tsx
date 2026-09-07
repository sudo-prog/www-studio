// ─── HtmlPreview.tsx ────────────────────────────────────────────────────────
// Renders raw HTML/SVG inside the current Tailwind context via
// dangerouslySetInnerHTML. Useful for SVG demos and lightweight markup
// that doesn't need full React mounting.
//
// SECURITY: This is only safe when the ComponentItem.code/previewHtml
// is curated catalog content (not user-supplied). The component library
// is editor-curated, so the XSS surface is limited to authored demos.
// User-typed code goes through the IframeFallback (sandboxed iframe)
// path instead.
import * as React from 'react';
import type { ComponentItem } from '@/data/component-library';

export interface HtmlPreviewProps {
  item: ComponentItem;
  height: number;
}

export function HtmlPreview({ item, height }: HtmlPreviewProps) {
  // Use previewHtml if present, otherwise the raw code (which is presumed HTML)
  const html = item.previewHtml ?? item.code;

  return (
    <div
      className="w-full bg-zinc-950 flex items-center justify-center overflow-auto p-4"
      style={{ height, minHeight: 200 }}
      data-component-id={item.id}
    >
      <div
        className="w-full h-full flex items-center justify-center text-zinc-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}