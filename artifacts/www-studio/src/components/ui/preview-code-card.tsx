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
import { Code2, Copy, Check, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Default wrapper that turns a snippet of HTML/JSX into a stand-alone
 * document loadable inside a sandboxed <iframe>. Exposed so callers can
 * either use it directly or supply their own custom preview shim.
 *
 * Detects whether the code is plain HTML or React/JSX. For JSX, it
 * loads React + ReactDOM + Babel from CDN and renders the component
 * inside a `#root` mount node.
 */
export const DEFAULT_PREVIEW_HTML = (code: string): string => {
  const isJsx = /^\s*(import\s|export\s|const\s+\w+\s*=|function\s+\w+|return\s*\(\s*<)/m.test(code) ||
                /className\s*=/.test(code) ||
                /ReactDOM\.createRoot/.test(code);

  if (!isJsx) {
    return `<!DOCTYPE html>
<html class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class'}</script>
<style>body{margin:0;background:#09090b;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;box-sizing:border-box;}</style>
</head>
<body>${code}</body>
</html>`;
  }

  // JSX mode: load React + Babel, transpile and render
  return `<!DOCTYPE html>
<html class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class'}</script>
<style>body{margin:0;background:#09090b;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;box-sizing:border-box;}#root{width:100%;}</style>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-type="module" data-presets="react,typescript">
${code}

// Forward clicks inside the sandboxed preview up to the parent so the
// host page can hook interaction telemetry. Bound passively so it
// never blocks scrolling, and guarded against cross-origin failures
// (the sandbox attribute is the only thing that controls access).
(function() {
  function notify() {
    try {
      window.parent.postMessage({ type: 'interaction', component: document.title }, '*');
    } catch (e) { /* sandbox may forbid parent access */ }
  }
  document.addEventListener('click', notify, { passive: true });
  // Also notify once after the first paint so the parent can observe
  // that the preview finished mounting, not just clicks.
  if (document.readyState === 'complete') {
    setTimeout(notify, 0);
  } else {
    window.addEventListener('load', function() { setTimeout(notify, 0); }, { once: true });
  }
})();
</script>
</body>
</html>`;
};

export type PreviewCodeView = "live" | "preview" | "code";

export interface PreviewCodeCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onCopy"> {
  /** Raw code snippet (HTML or JSX) shown in the "code" view. */
  code: string;
  /** Optional title rendered in the iframe's `title` attribute. */
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
  componentItem?: import("@/data/component-library").ComponentItem;
}

const VIEW_LABEL: Record<PreviewCodeView, { swap: PreviewCodeView; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  live:    { swap: "code",    text: "Code",    icon: Code2 },
  preview: { swap: "live",    text: "Live",    icon: Zap },
  code:    { swap: "preview", text: "Preview", icon: Eye },
};

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

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition-colors",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "relative bg-zinc-950 h-44 overflow-hidden",
          viewportClassName,
        )}
      >
        {view === "live" ? (
          componentItem ? (
            <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Loading live preview…</div>}>
              <PreviewRendererLazy item={componentItem} height={176} />
            </React.Suspense>
          ) : (
            // No componentItem — fall back to iframe
            <iframe
              ref={iframeRef}
              src={docSrc}
              className="w-full h-full border-0"
              title={title}
              sandbox={sandbox}
            />
          )
        ) : view === "preview" ? (
          <iframe
            ref={iframeRef}
            src={docSrc}
            className="w-full h-full border-0"
            title={title}
            sandbox={sandbox}
          />
        ) : (
          <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto h-full leading-relaxed whitespace-pre-wrap break-words">
            {code}
          </pre>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
        <div className="flex items-center justify-end px-3 py-1.5 border-t border-border/30 bg-zinc-950/50">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
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
  );
}

// Lazy-imported PreviewRenderer to avoid forcing every consumer of
// PreviewCodeCard to bundle the entire registry (Three.js, motion, etc.)
// when they only use the code view.
const PreviewRendererLazy = React.lazy(() =>
  import("@/components/registry/PreviewRenderer").then(m => ({
    default: ({ item, height }: { item: import("@/data/component-library").ComponentItem; height?: number }) => (
      <m.PreviewRenderer item={item} height={height ?? 176} />
    ),
  }))
);