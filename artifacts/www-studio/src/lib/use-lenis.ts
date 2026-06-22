import { useEffect, useRef, useCallback } from "react";

/**
 * Lenis smooth scroll hook for the scene editor preview mode.
 * Integrates Lenis with the editor's scroll container.
 */
export function useLenis(options: {
  enabled?: boolean;
  lerp?: number;
  duration?: number;
  wrapper?: HTMLElement | Element | Window | null;
  content?: HTMLElement | Element | null;
  onScroll?: (e: { scroll: number; limit: number; velocity: number }) => void;
} = {}) {
  const {
    enabled = true,
    lerp = 0.08,
    duration = 1.2,
    wrapper,
    content,
    onScroll,
  } = options;

  const lenisRef = useRef<{
    destroy: () => void;
    raf: (time: number) => void;
  } | null>(null);

  const start = useCallback(() => {
    if (!enabled) return;
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        lerp,
        duration,
        wrapper: wrapper ?? undefined,
        content: content ?? undefined,
        autoRaf: true,
      });

      lenis.on("scroll", ({ scroll, limit, velocity }) => {
        onScroll?.({ scroll, limit, velocity });
      });

      lenisRef.current = {
        destroy: () => lenis.destroy(),
        raf: (time: number) => lenis.raf(time),
      };
    }).catch(() => {
      // Lenis optional — fail silently
    });
  }, [enabled, lerp, duration, wrapper, content, onScroll]);

  const stop = useCallback(() => {
    lenisRef.current?.destroy();
    lenisRef.current = null;
  }, []);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  return { start, stop, lenis: lenisRef.current };
}
