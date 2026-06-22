import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global scroll debug toggle.
 *
 * When enabled, every ScrollTrigger is forced to show built-in
 * GSAP debug markers (start/end labels on the page).
 */
export function useScrollDebug(enabled: boolean = false) {
  const prevRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      // Remove all markers by killing manual triggers
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.markers) {
          // Re-create without markers
          const vars = { ...st.vars, markers: false };
          const newST = ScrollTrigger.create(vars);
          st.kill();
        }
      });
      prevRef.current = false;
      return;
    }

    if (prevRef.current) return;
    prevRef.current = true;

    // Warn user: enable markers via ScrollTriggerConfig UI
    console.log(
      "[useScrollDebug] Debug mode on. Enable markers in the ScrollTrigger panel to see trigger zones."
    );
  }, [enabled]);
}
