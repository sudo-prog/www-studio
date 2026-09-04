// ─── preview-code-card.tsx ──────────────────────────────────────────────────
// Generic preview/code toggle card extracted from the bookmarks
// component library page (`pages/components.tsx`, `ComponentCard`).
//
// Domain-agnostic: callers pass the `code` string and an optional
// `previewHtml` override. If `previewHtml` is omitted, the component
// wraps `code` in a minimal HTML document so it can be sandbox-loaded
// in an <iframe>.

import * as React from "react";
import { Code2, Copy, Check, Eye } from "lucide-react";
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
</script>
</body>
</html>`;
};

export type PreviewCodeView = "preview" | "code";

export interface PreviewCodeCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onCopy"> {
  /** Raw code snippet (HTML or JSX) shown in the "code" view. */
  code: string;
  /** Optional title rendered in the iframe's `title` attribute. */
  title?: string;
  /** Optional override for the rendered preview document. */
  previewHtml?: string;
  /** Initial view. Defaults to `"preview"`. */
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
}

const VIEW_LABEL: Record<PreviewCodeView, { swap: PreviewCodeView; text: string }> = {
  preview: { swap: "code", text: "Code" },
  code: { swap: "preview", text: "Preview" },
};

/**
 * Card with a code/preview toggle and a copy-to-clipboard action. The
 * "Code" view shows a formatted `<pre>`; the "Preview" view runs the
 * snippet in a sandboxed iframe so untrusted HTML can be rendered
 * safely.
 */
export function PreviewCodeCard({
  code,
  title,
  previewHtml,
  defaultView = "preview",
  onCodeCopy,
  disableCopy,
  className,
  viewportClassName,
  sandbox = "allow-scripts",
  ...rest
}: PreviewCodeCardProps) {
  const [view, setView] = React.useState<PreviewCodeView>(defaultView);
  const [copied, setCopied] = React.useState(false);

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
        {view === "preview" ? (
          <iframe
            src={docSrc}
            className="w-full h-full border-0 pointer-events-none"
            title={title}
            sandbox={sandbox}
          />
        ) : (
          <pre className="p-4 text-[11px] font-mono text-zinc-300 overflow-auto h-full leading-relaxed whitespace-pre-wrap break-words">
            {code}
          </pre>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 min-h-[48px] text-xs gap-1"
            onClick={() => setView(next.swap)}
            aria-label={`Switch to ${next.swap} view`}
          >
            {view === "preview" ? (
              <Code2 className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {next.text}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 min-h-[48px] text-xs gap-1"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}