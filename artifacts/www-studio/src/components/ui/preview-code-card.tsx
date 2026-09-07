// ─── preview-code-card.tsx ──────────────────────────────────────────────────
// Generic live-preview / iframe-preview / code toggle card extracted from the
// bookmarks component library page (`pages/components.tsx`, `ComponentCard`).
//
// Domain-agnostic: callers pass the `code` string and an optional
// `previewHtml` override. If `previewHtml` is omitted, the component
// wraps `code` in a minimal HTML document so it can be sandbox-loaded
// in an <iframe>.
//
// Three render modes:
//   "live"  — renders the component natively via PreviewRenderer (React, Three.js,
//              WebGL, HTML). Falls back to iframe if kind is not 'react' or no
//              component is registered.
//   "preview" — sandboxed iframe (the classic approach).
//   "code"    — formatted source code view.

import * as React from "react";
import { createPortal } from "react-dom";
import { Code2, Copy, Check, Eye, Zap, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentItem } from "@/data/component-library";

// ─── Inline preview HTML template ──────────────────────────────────────────

export const DEFAULT_PREVIEW_HTML = (code: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
      }
    };
  </script>
  <style>
    body { margin: 0; background: #09090b; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body class="dark">
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
${code}
  </script>
  <script type="text/babel">
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;

// ─── Types ────────────────────────────────────────────────────────────────

export type PreviewCodeView = "live" | "preview" | "code";

export interface PreviewCodeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Source code to show in the code view and wrap in the default preview iframe. */
  code: string;
  /** Optional human-readable title (used as iframe title / aria-label). */
  title?: string;
  /** Optional override for the rendered preview document. */
  previewHtml?: string;
  /** Initial view. Defaults to `"live"` so users see real components by default. */
  defaultView?: PreviewCodeView;
  /**
   * Called when the user copies the code. Use this to surface a toast or
   * fire analytics. The component itself handles the clipboard write
   * and "Copied!" feedback unless `disableCopy` is set.
   */
  onCodeCopy?: (code: string) => void;
  /** Skip the clipboard write (callers handle it themselves). */
  disableCopy?: boolean;
  /** Custom class for the dark preview/code viewport. */
  viewportClassName?: string;
  /** Custom iframe sandbox attribute. */
  sandbox?: string;
  /**
   * Called when the previewed iframe posts a `message` event to its
   * parent (window). Useful for hooking interaction telemetry from
   * inside the sandboxed preview document.
   */
  onIframeMessage?: (msg: unknown) => void;
  /** Optional ComponentItem for live-preview mode (uses PreviewRenderer). */
  componentItem?: ComponentItem;
}

const VIEW_LABEL: Record<PreviewCodeView, { swap: PreviewCodeView; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  live:    { swap: "code",    text: "Code",    icon: Code2 },
  preview: { swap: "live",    text: "Live",    icon: Zap },
  code:    { swap: "preview", text: "Preview", icon: Eye },
};

// ─── Component ────────────────────────────────────────────────────────────

/**
 * Card with a 3-way toggle (live / preview / code) and copy-to-clipboard.
 * The "Live" view uses PreviewRenderer to mount the actual React/Three.js/
 * WebGL component. "Preview" falls back to a sandboxed iframe for
 * compatibility. "Code" shows the formatted source.
 */
export function PreviewCodeCard({
  code,
  title,
  previewHtml,
  defaultView = "live",
  onCodeCopy,
  disableCopy,
  className,
  viewportClassName,
  sandbox = "allow-scripts allow-same-origin",
  onIframeMessage,
  componentItem,
  ...rest
}: PreviewCodeCardProps) {
  const [view, setView] = React.useState<PreviewCodeView>(defaultView);
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Forward postMessage events from the sandboxed preview document up
  // to the parent so callers can hook interaction telemetry, analytics,
  // or any other cross-frame signalling. The handler is only bound
  // while the iframe is mounted; we verify the message originated from
  // our iframe (vs. another extension/tab) by checking e.source.
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (iframeRef.current && e.source === iframeRef.current.contentWindow) {
        onIframeMessage?.(e.data);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onIframeMessage]);

  const handleCopy = React.useCallback(() => {
    if (disableCopy) {
      onCodeCopy?.(code);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(
        () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
          onCodeCopy?.(code);
        },
        () => {
          // Clipboard rejected (insecure context, denied permission, …).
          // Still notify the caller so they can surface the error.
          onCodeCopy?.(code);
        },
      );
    } else {
      onCodeCopy?.(code);
    }
  }, [code, disableCopy, onCodeCopy]);

  const docSrc = React.useMemo(() => {
    const html = previewHtml ?? DEFAULT_PREVIEW_HTML(code);
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  }, [code, previewHtml]);

  const next = VIEW_LABEL[view];

  // ── Render a preview pane (used for both inline and fullscreen) ──────────
  const PreviewPane = React.useCallback(
    ({ heightClass = "h-44" }: { heightClass?: string }) => (
      <>
        {view === "live" ? (
          componentItem ? (
            <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Loading live preview…</div>}>
              <PreviewRendererLazy item={componentItem} height={heightClass === "h-44" ? 176 : undefined} />
            </React.Suspense>
          ) : (
            <iframe ref={iframeRef} src={docSrc} className="w-full h-full border-0" title={title} sandbox={sandbox} />
          )
        ) : view === "preview" ? (
          <iframe ref={iframeRef} src={docSrc} className="w-full h-full border-0" title={title} sandbox={sandbox} />
        ) : (
          <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto h-full leading-relaxed whitespace-pre-wrap break-words">
            {code}
          </pre>
        )}
      </>
    ),
    [view, componentItem, docSrc, title, sandbox, code, iframeRef],
  );

  // ── Portal-based fullscreen modal ────────────────────────────────────────
  const modal = React.useMemo(
    () =>
      expanded && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
              onClick={() => setExpanded(false)}
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <span className="text-sm text-zinc-400 font-medium">{title ?? "Live Preview"}</span>
                <div className="flex items-center gap-2">
                  {/* View toggle in modal */}
                  <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 gap-0.5">
                    {(["live", "preview", "code"] as PreviewCodeView[]).map((v) => (
                      <button
                        key={v}
                        onClick={(e) => { e.stopPropagation(); setView(v); }}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                          view === v ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white",
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Full-size preview */}
              <div
                className="flex-1 overflow-hidden bg-zinc-950 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {view === "live" ? (
                  componentItem ? (
                    <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Loading…</div>}>
                      <PreviewRendererLazy item={componentItem} />
                    </React.Suspense>
                  ) : (
                    <iframe ref={iframeRef} src={docSrc} className="w-full h-full border-0" title={title} sandbox={sandbox} />
                  )
                ) : view === "preview" ? (
                  <iframe ref={iframeRef} src={docSrc} className="w-full h-full border-0" title={title} sandbox={sandbox} />
                ) : (
                  <pre className="p-6 text-sm font-mono text-zinc-300 overflow-auto h-full leading-relaxed whitespace-pre-wrap">
                    {code}
                  </pre>
                )}
              </div>
            </div>,
            document.body,
          )
        : null,
    [expanded, view, componentItem, docSrc, title, sandbox, code, iframeRef],
  );

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition-colors",
          className,
        )}
        {...rest}
      >
        {/* Preview area — clickable to open fullscreen modal */}
        <div
          className={cn(
            "relative bg-zinc-950 overflow-hidden cursor-pointer group/preview",
            viewportClassName,
          )}
          onClick={() => setExpanded(true)}
        >
          <div className="h-44">
            <PreviewPane heightClass="h-44" />
          </div>

          {/* Fullscreen hint icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-white text-xs backdrop-blur-sm">
              <Maximize2 className="w-3 h-3" />
              Tap to expand
            </div>
          </div>

          {/* Top-right controls — stop click propagation so buttons don't open modal */}
          <div
            className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/preview:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {view !== "live" && componentItem && (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 min-h-[48px] text-xs gap-1"
                onClick={() => setView("live")}
                aria-label="Switch to live view"
              >
                <Zap className="w-3 h-3" />
                Live
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="h-7 min-h-[48px] text-xs gap-1"
              onClick={() => setView(next.swap)}
              aria-label={`Switch to ${next.swap} view`}
            >
              {(() => {
                const Icon = next.icon;
                return <Icon className="w-3 h-3" />;
              })()}
              {next.text}
            </Button>
          </div>

          {/* Bottom bar: small icon-only copy button */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-end px-3 py-1.5 border-t border-white/5 bg-gradient-to-t from-zinc-950/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-zinc-400 hover:text-white"
              onClick={handleCopy}
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen modal portal */}
      {modal}
    </>
  );
}

// Lazy-imported PreviewRenderer to avoid forcing every consumer of
// PreviewCodeCard to bundle the entire registry (Three.js, motion, etc.)
// when they only use the code view.
const PreviewRendererLazy = React.lazy(() =>
  import("@/components/registry/PreviewRenderer").then(m => ({
    default: ({ item, height }: { item: ComponentItem; height?: number }) => (
      <m.PreviewRenderer item={item} height={height ?? 176} />
    ),
  }))
);
