// ─── ReactPreview.tsx ───────────────────────────────────────────────────────
// Renders a real React component from the dynamic registry. Looks up the
// named export (item.component) in @/components/registry/rare-ui and mounts
// it inside the current React tree, so Tailwind, motion, vaul etc. all
// work natively.
import * as React from 'react';
import type { ComponentItem } from '@/data/component-library';
import { getRegistryComponent, type RegistryMap } from '../registryMap';

export interface ReactPreviewProps {
  item: ComponentItem;
  height: number;
  onError?: (msg: string) => void;
}

export function ReactPreview({ item, height, onError }: ReactPreviewProps) {
  const [Cmp, setCmp] = React.useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setErr(null);
    setCmp(null);
    if (!item.component) {
      const msg = `Missing 'component' field for item ${item.id}`;
      setErr(msg);
      onError?.(msg);
      return;
    }
    try {
      const resolved = getRegistryComponent(item.component as keyof RegistryMap);
      if (!resolved) {
        const msg = `Component '${item.component}' not found in registry`;
        setErr(msg);
        onError?.(msg);
        return;
      }
      setCmp(() => resolved as React.ComponentType<Record<string, unknown>>);
    } catch (e) {
      const msg = `Failed to resolve component: ${e instanceof Error ? e.message : String(e)}`;
      setErr(msg);
      onError?.(msg);
    }
  }, [item.component, item.id, onError]);

  if (err) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-red-400 text-xs p-3 text-center">
        {err}
      </div>
    );
  }

  if (!Cmp) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        Loading {item.name}…
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-auto bg-zinc-950 flex items-center justify-center"
      style={{ height, minHeight: 200 }}
      data-component-id={item.id}
    >
      <ErrorBoundary componentName={item.name} onError={onError}>
        <Cmp />
      </ErrorBoundary>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string; onError?: (msg: string) => void },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(`${this.props.componentName} crashed: ${error.message}`);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-red-400 text-xs p-3 text-center max-w-md">
          {this.props.componentName} crashed:<br />
          <span className="opacity-70">{this.state.error}</span>
        </div>
      );
    }
    return this.props.children;
  }
}