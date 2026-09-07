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

export function IframeFallback({ item, height }: IframeFallbackProps) {
  const html = item.previewHtml ?? DEFAULT_PREVIEW_HTML(item.code);
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