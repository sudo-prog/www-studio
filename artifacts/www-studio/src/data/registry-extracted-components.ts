// AUTO-GENERATED from /home/thinkpad/.hermes/profiles/chief-of-staff/cache/registry-extract/merged-catalog.json
// Source: libraries.dev (Jakubantalik/Libraries) + @appica/ui-react (npm)
// 77 entries — regenerate via merge_components.py + this script

export const REGISTRY_EXTRACTED_COMPONENTS = [
  {
    id: `ldev-border-beam`,
    name: `Border Beam (libraries.dev)`,
    category: `Animation`,
    tags: [`animation`, `border`, `beam`, `gradient`, `react`],
    code: `// ─── src/BorderBeam.tsx ───
import {
  forwardRef,
  useId,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type AnimationEvent,
  type MutableRefObject,
} from 'react';
import type { BorderBeamProps, BorderBeamTheme } from './types';
import { sizePresets, sizeThemePresets, generateBeamCSS, getPulseDriverConfig } from './styles';
import { registerPulseInstance } from './pulseDriver';

function useSystemTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return theme;
}

function resolveTheme(theme: BorderBeamTheme, systemTheme: 'dark' | 'light'): 'dark' | 'light' {
  return theme === 'auto' ? systemTheme : theme;
}

/**
 * BorderBeam component - Animated border beam effect for React
 *
 * @example
 * \`\`\`tsx
 * <BorderBeam>
 *   <Card>Content</Card>
 * </BorderBeam>
 * \`\`\`
 */
export const BorderBeam = forwardRef<HTMLDivElement, BorderBeamProps>(
  function BorderBeam(
    {
      children,
      size = 'md',
      colorVariant = 'colorful',
      theme = 'dark',
      staticColors = false,
      duration,
      active = true,
      borderRadius: customBorderRadius,
      brightness: brightnessProp,
      saturation,
      hueRange = 30,
      glowSize = 1,
      strength = 1,
      className,
      style,
      css: extraCss,
      onActivate,
      onDeactivate,
      onAnimationEnd: consumerOnAnimationEnd,
      ...props
    }: BorderBeamProps,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    const baseId = useId();
    const id = baseId.replace(/:/g, '-');
    const systemTheme = useSystemTheme();
    const internalRef = useRef<HTMLDivElement>(null);

    const [isActive, setIsActive] = useState(active);
    const [isFading, setIsFading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [detectedRadius, setDetectedRadius] = useState<number | null>(null);
    const [pulseGlowScale, setPulseGlowScale] = useState<{ x: number; y: number }>({ x: 1, y: 1 });

    // Auto-detect child border radius when no explicit value is provided
    useEffect(() => {
      if (customBorderRadius != null) return;
      const el = internalRef.current;
      if (!el) return;

      const detect = () => {
        const child = el.firstElementChild as HTMLElement | null;
        if (!child) return;
        const computed = getComputedStyle(child);
        const raw = parseFloat(computed.borderTopLeftRadius);
        if (!isNaN(raw) && raw > 0) {
          setDetectedRadius(raw);
        }
      };

      detect();

      // Re-detect if child layout changes (e.g. CSS loaded late)
      const observer = new MutationObserver(detect);
      observer.observe(el, { childList: true, subtree: false });
      return () => observer.disconnect();
    }, [customBorderRadius, children]);

    useEffect(() => {
      if (active && !isActive && !isFading) {
        setIsActive(true);
      } else if (!active && isActive && !isFading) {
        setIsFading(true);
      }
    }, [active, isActive, isFading]);

    // Pause the (paint-heavy) animations while the element is scrolled offscreen.
    // This stops per-frame painting entirely for hidden instances without changing
    // their logical active/fading state, so it never fires onActivate/onDeactivate.
    useEffect(() => {
      const el = internalRef.current;
      if (!el || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) setIsVisible(entry.isIntersecting);
        },
        // Start animating slightly before the element scrolls into view.
        { rootMargin: '256px' }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // Pulse Outside glow geometry is authored in fixed pixels for a reference
    // element (~350x140). Measure the actual wrapped element and scale the glow
    // per-axis so the halo grows/shrinks to fit any component it's applied to.
    useEffect(() => {
      if (size !== 'pulse-outside') {
        setPulseGlowScale({ x: 1, y: 1 });
        return;
      }

      const el = internalRef.current;
      if (!el) return;

      const REF_WIDTH = 350;
      const REF_HEIGHT = 140;
      // Allow the glow to both shrink (small buttons) and grow (large cards),
      // with generous bounds to avoid degenerate geometry at the extremes.
      const MIN_SCALE = 0.35;
      const MAX_SCALE = 4;
      const clamp = (value: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));

      const measure = () => {
        const child = el.firstElementChild as HTMLElement | null;
        if (!child) return;
        const rect = child.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = +clamp(rect.width / REF_WIDTH).toFixed(3);
        const y = +clamp(rect.height / REF_HEIGHT).toFixed(3);
        setPulseGlowScale(prev => (prev.x === x && prev.y === y ? prev : { x, y }));
      };

      measure();
      if (typeof ResizeObserver === 'undefined') return;

      const child = el.firstElementChild as HTMLElement | null;
      if (!child) return;

      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(child);
      return () => resizeObserver.disconnect();
    }, [size, children]);

    const handleAnimationEnd = useCallback(
      (e: AnimationEvent<HTMLDivElement>) => {
        const animationName = e.animationName;

        if (animationName.includes('fade-out')) {
          setIsActive(false);
          setIsFading(false);
          onDeactivate?.();
        } else if (animationName.includes('fade-in')) {
          onActivate?.();
        }

        consumerOnAnimationEnd?.(e);
      },
      [onActivate, onDeactivate, consumerOnAnimationEnd]
    );

    const resolvedTheme = resolveTheme(theme, systemTheme);
    const themeConfig = sizeThemePresets[size][resolvedTheme];
    const sizeConfig = sizePresets[size];

    const isPulse = size === 'pulse-inner' || size === 'pulse-outside';

    const finalBorderRadius = customBorderRadius ?? detectedRadius ?? sizeConfig.borderRadius;
    const finalDuration = duration ?? (size === 'line' ? 3.1 : isPulse ? 2.3 : 1.96);
    const finalSaturation = saturation ?? themeConfig.saturation;
    const finalBrightness = brightnessProp ?? themeConfig.brightness ?? 1.3;
    const finalHueRange = size === 'line' ? Math.min(hueRange, 13) : hueRange;
    const finalStaticColors = colorVariant === 'mono' ? true : staticColors;

    const cssStyles = useMemo(
      () =>
        generateBeamCSS({
          id,
          borderRadius: finalBorderRadius,
          borderWidth: sizeConfig.borderWidth,
          duration: finalDuration,
          strokeOpacity: themeConfig.strokeOpacity,
          innerOpacity: themeConfig.innerOpacity,
          bloomOpacity: themeConfig.bloomOpacity,
          innerShadow: themeConfig.innerShadow,
          size,
          colorVariant,
          staticColors: finalStaticColors,
          brightness: finalBrightness,
          saturation: finalSaturation,
          hueRange: finalHueRange,
          theme: resolvedTheme,
          hairlineOpacity: themeConfig.hairlineOpacity,
          glowSize,
        }),
      [
        id,
        finalBorderRadius,
        sizeConfig.borderWidth,
        finalDuration,
        themeConfig.strokeOpacity,
        themeConfig.innerOpacity,
        themeConfig.bloomOpacity,
        themeConfig.innerShadow,
        themeConfig.hairlineOpacity,
        size,
        colorVariant,
        finalStaticColors,
        finalBrightness,
        finalSaturation,
        finalHueRange,
        glowSize,
        resolvedTheme,
      ]
    );

    // Runtime config for the JS breathing driver (null for non-pulse sizes).
    const driverConfig = useMemo(
      () =>
        isPulse
          ? getPulseDriverConfig(size, resolvedTheme, finalDuration, finalHueRange, finalStaticColors, id)
          : null,
      [isPulse, size, resolvedTheme, finalDuration, finalHueRange, finalStaticColors, id]
    );

    // Drive the Pulse breathing from the shared, fps-capped rAF loop while the
    // instance is on, onscreen, and the user hasn't requested reduced motion.
    useEffect(() => {
      if (!driverConfig) return;
      if (!(isActive || isFading) || !isVisible) return;

      const el = internalRef.current;
      if (!el) return;

      if (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      return registerPulseInstance(el, driverConfig);
    }, [driverConfig, isActive, isFading, isVisible]);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (internalRef as MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    const mergedStyle = {
      ...(style ?? {}),
      '--beam-strength': Math.max(0, Math.min(1, strength)),
      ...(size === 'pulse-outside'
        ? { '--pulse-glow-sx': pulseGlowScale.x, '--pulse-glow-sy': pulseGlowScale.y }
        : {}),
    } as CSSProperties;

    return (
      <>
        <style>{extraCss ? \`\${cssStyles}\\n\${extraCss.split('{id}').join(id)}\` : cssStyles}</style>
        <div
          {...props}
          ref={setRefs}
          data-beam={id}
          data-active={isActive && !isFading ? '' : undefined}
          data-fading={isFading ? '' : undefined}
          data-paused={isActive && !isFading && !isVisible ? '' : undefined}
          className={className}
          style={mergedStyle}
          onAnimationEnd={handleAnimationEnd}
        >
          {children}
          <div data-beam-bloom />
        </div>
      </>
    );
  }
);

export default BorderBeam;


// ─── src/index.ts ───
export { BorderBeam } from './BorderBeam';
export { default } from './BorderBeam';

export type {
  BorderBeamProps,
  BorderBeamSize,
  BorderBeamTheme,
  BorderBeamColorVariant,
  SizeConfig,
  ThemeColors,
} from './types';

export { sizePresets, sizeThemePresets, themeColors } from './styles';


// ─── src/pulseDriver.ts ───
import type { PulseDriverConfig } from './styles';

/**
 * Shared breathing driver for the Pulse effects.
 *
 * The pulse breathing (size / drift / per-quadrant opacity / height) and the
 * slow hue drift used to run as ~15 per-instance CSS \`@property\` keyframe
 * animations at the display refresh rate (60–120 Hz). Because each value feeds
 * the painted gradients/filters, that repainted the breathing layers 60–120×/s.
 *
 * The motion is very slow (1.6–6.4 s periods), so instead every registered
 * instance is driven from a SINGLE shared requestAnimationFrame loop throttled
 * to ~30 fps. This halves the paint frequency on 60 Hz displays and quarters it
 * on 120 Hz, with no perceptible change to the breathing.
 *
 * Each oscillator ping-pongs a CSS custom property between \`a\` and \`b\` with an
 * ease-in-out (cosine) curve over \`period\` seconds, offset by \`delay\` seconds so
 * otherwise-identical oscillators desync (matching the former CSS keyframes +
 * animation-delay).
 */

interface PulseInstance {
  el: HTMLElement;
  config: PulseDriverConfig;
}

const instances = new Set<PulseInstance>();
let rafId: number | null = null;
let lastFrame = 0;

// ~30 fps. Subtract a small slack so a frame that lands a hair early still runs.
const FRAME_INTERVAL = 1000 / 30 - 2;

const TWO_PI = Math.PI * 2;

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Cosine ease-in-out factor in [0, 1]: 0 at phase 0/1, 1 at phase 0.5. */
function pingPong(phase: number): number {
  return (1 - Math.cos(TWO_PI * phase)) / 2;
}

function frame(ts: number): void {
  rafId = requestAnimationFrame(frame);

  if (ts - lastFrame < FRAME_INTERVAL) return;
  lastFrame = ts;

  const tSec = ts / 1000;

  instances.forEach(({ el, config }) => {
    for (const osc of config.oscillators) {
      // Match CSS animation-delay semantics: a positive delay starts later.
      const phase = (tSec - osc.delay) / osc.period;
      const value = osc.a + (osc.b - osc.a) * pingPong(phase);
      el.style.setProperty(
        osc.prop,
        osc.unit === 'px' ? \`\${value.toFixed(2)}px\` : value.toFixed(4)
      );
    }

    if (config.hue) {
      const { prop, range, period, continuous } = config.hue;
      // \`continuous\` rotates a full circle (0→range, looping) so every color
      // sweeps through every edge; otherwise drift between -range and +range.
      const value = continuous
        ? ((tSec / period) % 1) * range
        : -range + 2 * range * pingPong(tSec / period);
      el.style.setProperty(prop, \`\${value.toFixed(2)}deg\`);
    }
  });
}

function startLoop(): void {
  if (rafId == null) {
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }
}

function stopLoopIfIdle(): void {
  if (instances.size === 0 && rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Register an element to be driven by the shared pulse loop.
 *
 * @returns a cleanup function that unregisters the instance (and stops the
 *          shared loop once no instances remain).
 */
export function registerPulseInstance(
  el: HTMLElement,
  config: PulseDriverConfig
): () => void {
  const instance: PulseInstance = { el, config };
  instances.add(instance);
  startLoop();

  return () => {
    instances.delete(instance);
    stopLoopIfIdle();
  };
}


// ─── src/styles.ts ───
import type { SizeConfig, ThemeColors, BorderBeamColorVariant, BorderBeamSize } from './types';

/**
 * Size presets for border radius and dimensions
 */
export const sizePresets: Record<BorderBeamSize, SizeConfig> = {
  sm: {
    borderRadius: 32,
    borderWidth: 1,
    width: 70,
    height: 36,
  },
  md: {
    borderRadius: 16,
    borderWidth: 1,
  },
  line: {
    borderRadius: 16,
    borderWidth: 1,
  },
  'pulse-outside': {
    borderRadius: 16,
    borderWidth: 1,
  },
  'pulse-inner': {
    borderRadius: 16,
    borderWidth: 1,
  },
};

/**
 * Per-size theme presets matching the tuned v5 control panel defaults
 */
export const sizeThemePresets: Record<BorderBeamSize, Record<'dark' | 'light', ThemeColors>> = {
  sm: {
    dark: {
      strokeOpacity: 0.46,
      innerOpacity: 0.24,
      bloomOpacity: 0.38,
      innerShadow: 'rgba(255, 255, 255, 0.3)',
      saturation: 1.2,
    },
    light: {
      strokeOpacity: 0.12,
      innerOpacity: 0.3,
      bloomOpacity: 0.16,
      innerShadow: 'rgba(0, 0, 0, 0.14)',
      saturation: 1.8,
    },
  },
  md: {
    dark: {
      strokeOpacity: 0.26,
      innerOpacity: 0.42,
      bloomOpacity: 0.24,
      innerShadow: 'rgba(255, 255, 255, 0.27)',
      saturation: 1.2,
    },
    light: {
      strokeOpacity: 0.12,
      innerOpacity: 0.26,
      bloomOpacity: 0.34,
      innerShadow: 'rgba(0, 0, 0, 0.14)',
      saturation: 1.5,
    },
  },
  line: {
    dark: {
      strokeOpacity: 1.14,
      innerOpacity: 0.7,
      bloomOpacity: 0.8,
      innerShadow: 'rgba(255, 255, 255, 0.1)',
      saturation: 1.2,
    },
    light: {
      strokeOpacity: 0.16,
      innerOpacity: 0.32,
      bloomOpacity: 0.3,
      innerShadow: 'rgba(0, 0, 0, 0.14)',
      saturation: 1.95,
    },
  },
  // Pulse Outside — outward-blooming breathe (ported from v5 "Breathe Outside Uncropped" / c6)
  'pulse-outside': {
    dark: {
      strokeOpacity: 0.94,
      innerOpacity: 0.34,
      bloomOpacity: 0.3,
      innerShadow: 'transparent',
      saturation: 1.2,
      brightness: 1.9,
      // v5 Card 5 frames the card with a single 1px hairline (its box-shadow at
      // 0.3). Wrapped components here already supply their own ~equivalent 1px
      // border, so the beam must NOT add a second hairline on top or the edge
      // reads brighter than v5. Kept at 0 to match v5's single-hairline look.
      hairlineOpacity: 0,
    },
    light: {
      strokeOpacity: 1.96,
      innerOpacity: 1.04,
      bloomOpacity: 0.42,
      innerShadow: 'transparent',
      saturation: 0.6,
      brightness: 1.7,
      hairlineOpacity: 0,
    },
  },
  // Pulse Inner — contained breathe (ported from v5 "Breathe" / c4)
  'pulse-inner': {
    dark: {
      strokeOpacity: 1.54,
      innerOpacity: 0.44,
      bloomOpacity: 0.66,
      innerShadow: 'transparent',
      saturation: 1.2,
      brightness: 0.75,
    },
    light: {
      strokeOpacity: 0.32,
      innerOpacity: 0.4,
      bloomOpacity: 0.8,
      innerShadow: 'transparent',
      saturation: 0.75,
      brightness: 1.3,
    },
  },
};

/**
 * @deprecated Use \`sizeThemePresets\` for per-size theme values.
 * Retained for backward compatibility — maps to \`md\` size presets.
 */
export const themeColors: Record<'dark' | 'light', ThemeColors> = {
  dark: { ...sizeThemePresets.md.dark },
  light: { ...sizeThemePresets.md.light },
};

/**
 * Color palettes for each color variant
 */
export const colorPalettes = {
  colorful: {
    border: [
      { color: 'rgb(255, 50, 100)', pos: '33% -7.4%', size: '70px 40px' },
      { color: 'rgb(40, 140, 255)', pos: '12% -5%', size: '60px 35px' },
      { color: 'rgb(50, 200, 80)', pos: '2.1% 68.3%', size: '40px 70px' },
      { color: 'rgb(30, 185, 170)', pos: '2.1% 68.3%', size: '20px 35px' },
      { color: 'rgb(100, 70, 255)', pos: '74.4% 100%', size: '180px 32px' },
      { color: 'rgb(40, 140, 255)', pos: '55% 100%', size: '85px 26px' },
      { color: 'rgb(255, 120, 40)', pos: '93.9% 0%', size: '74px 32px' },
      { color: 'rgb(240, 50, 180)', pos: '100% 27.1%', size: '26px 42px' },
      { color: 'rgb(180, 40, 240)', pos: '100% 27.1%', size: '52px 48px' },
    ],
    spike: { primary: 'rgb(255, 60, 80)', secondary: 'rgba(40, 190, 180, 0.98)' },
    spikeLt: { primary: 'rgb(200, 30, 60)', secondary: 'rgb(20, 150, 140)' },
  },
  mono: {
    border: [
      { color: 'rgb(180, 180, 180)', pos: '33% -7.4%', size: '70px 40px' },
      { color: 'rgb(140, 140, 140)', pos: '12% -5%', size: '60px 35px' },
      { color: 'rgb(160, 160, 160)', pos: '2.1% 68.3%', size: '40px 70px' },
      { color: 'rgb(130, 130, 130)', pos: '2.1% 68.3%', size: '20px 35px' },
      { color: 'rgb(170, 170, 170)', pos: '74.4% 100%', size: '180px 32px' },
      { color: 'rgb(150, 150, 150)', pos: '55% 100%', size: '85px 26px' },
      { color: 'rgb(190, 190, 190)', pos: '93.9% 0%', size: '74px 32px' },
      { color: 'rgb(145, 145, 145)', pos: '100% 27.1%', size: '26px 42px' },
      { color: 'rgb(165, 165, 165)', pos: '100% 27.1%', size: '52px 48px' },
    ],
    spike: { primary: 'rgb(200, 200, 200)', secondary: 'rgb(170, 170, 170)' },
    spikeLt: { primary: 'rgb(80, 80, 80)', secondary: 'rgb(120, 120, 120)' },
  },
  ocean: {
    border: [
      { color: 'rgb(100, 80, 220)', pos: '33% -7.4%', size: '70px 40px' },
      { color: 'rgb(60, 120, 255)', pos: '12% -5%', size: '60px 35px' },
      { color: 'rgb(80, 100, 200)', pos: '2.1% 68.3%', size: '40px 70px' },
      { color: 'rgb(50, 140, 220)', pos: '2.1% 68.3%', size: '20px 35px' },
      { color: 'rgb(120, 80, 255)', pos: '74.4% 100%', size: '180px 32px' },
      { color: 'rgb(70, 130, 255)', pos: '55% 100%', size: '85px 26px' },
      { color: 'rgb(140, 100, 240)', pos: '93.9% 0%', size: '74px 32px' },
 

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="relative w-80 h-40 rounded-xl border border-zinc-800 bg-zinc-950 p-6 overflow-hidden">
  <div class="relative z-10">
    <h3 class="text-white text-lg font-semibold">Border Beam</h3>
    <p class="text-zinc-400 text-sm mt-1">Animated traveling glow</p>
  </div>
  <div class="absolute inset-0 rounded-xl pointer-events-none"
    style="background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, #f59e0b 300deg, #ef4444 330deg, transparent 360deg);
           mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
           mask-composite: exclude;
           -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
           -webkit-mask-composite: xor;
           padding: 1px;
           animation: spin 4s linear infinite;">
  </div>
</div>
<style>@keyframes spin { to { transform: rotate(360deg); } }</style>
`,
    sourceUrl: `https://www.npmjs.com/package/border-beam`,
    description: `From libraries.dev · npm install border-beam`,
  },
  {
    id: `ldev-img-fx`,
    name: `Img Fx (libraries.dev)`,
    category: `Loading UI`,
    tags: [`loader`, `webgl`, `image`, `threejs`, `react`],
    code: `// ─── src/ImageGeneration.tsx ───
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react';
import {
  createCycle,
  createInstance,
  createReveal,
  destroyInstance,
  renderInstanceOnce,
  samplePaletteFromCanvas,
  setInstanceCardBg,
  setInstanceColors,
  setInstancePaused,
  setInstancePixelScale,
  setInstancePreset,
  setInstanceSpeed,
  setInstanceStrength,
  setInstanceVisible,
  setSharedFragmentShader,
  updateInstanceSize,
  type Cycle,
  type Instance,
  type RevealState,
  type SampledPalette
} from './engine';
import { PRESETS } from './presets';
import { ensureStylesInjected } from './styles';
import type {
  ImageGenerationHandle,
  ImageGenerationPreset,
  ImageGenerationProps,
  ImageGenerationTheme
} from './types';

ensureStylesInjected();

/**
 * Resolve \`'auto'\` to a concrete \`'dark' | 'light'\` value, checking sources in
 * priority order so the library plays nicely with the most common app-side
 * theme conventions (not just the OS-level media query):
 *
 *   1. \`<html data-theme="dark|light">\`          — shadcn / many SSR apps
 *   2. \`<html class="dark">\` / \`class="light">\`  — Tailwind v3 darkMode: class
 *   3. \`<html style="color-scheme: dark">\`       — CSS-only theme toggles
 *   4. \`matchMedia('(prefers-color-scheme: dark)')\` — OS / browser preference
 *   5. Default \`'dark'\`                          — SSR-safe fallback
 *
 * Live updates: subscribed to both the matchMedia change event AND a
 * MutationObserver on \`<html>\` for \`class\` / \`style\` / \`data-theme\` changes,
 * so toggling a theme-class via JS reflects in the shader without remount.
 */
function detectTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark';
  const html = document.documentElement;

  const dataTheme = html.getAttribute('data-theme');
  if (dataTheme === 'dark' || dataTheme === 'light') return dataTheme;

  if (html.classList.contains('dark')) return 'dark';
  if (html.classList.contains('light')) return 'light';

  const colorScheme = html.style.colorScheme || getComputedStyle(html).colorScheme;
  if (colorScheme === 'dark') return 'dark';
  if (colorScheme === 'light') return 'light';

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

function useResolvedTheme(theme: ImageGenerationTheme): 'dark' | 'light' {
  const [resolved, setResolved] = useState<'dark' | 'light'>(() => {
    if (theme !== 'auto') return theme;
    return detectTheme();
  });

  useEffect(() => {
    if (theme !== 'auto') {
      setResolved(theme);
      return;
    }
    if (typeof window === 'undefined') return;

    const update = (): void => setResolved(detectTheme());
    update();

    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    mql?.addEventListener('change', update);

    let mo: MutationObserver | null = null;
    if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(update);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme']
      });
    }

    return () => {
      mql?.removeEventListener('change', update);
      mo?.disconnect();
    };
  }, [theme]);

  return resolved;
}

function normaliseImages(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (typeof input === 'string') return [input];
  return input.slice();
}

/** The regenerate churn always runs on one of these pixel-mosaic presets. */
const PIXEL_CHURN_PRESETS = ['pixels-mechanic', 'pixels-organic'] as const;

type PixelChurnPreset = (typeof PIXEL_CHURN_PRESETS)[number];

function isPixelChurnPreset(name: ImageGenerationPreset): name is PixelChurnPreset {
  return (PIXEL_CHURN_PRESETS as readonly string[]).includes(name);
}

export const ImageGeneration = forwardRef<ImageGenerationHandle, ImageGenerationProps>(function ImageGeneration(
  {
    children,
    preset = 'pixels-organic',
    theme = 'auto',
    strength = 1,
    speed = 1,
    pixelScale = 1,
    cardBg: cardBgProp,
    colors,
    images,
    autoReveal = false,
    revealDelayRange = [2, 4],
    revealInitialDelay,
    revealHoldMs = 2000,
    revealFadeOutMs = 300,
    borderRadius,
    paused = false,
    fragmentShader,
    onCycle,
    excludeSrcs,
    className,
    style,
    ...rest
  },
  forwardedRef
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shaderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Instance | null>(null);
  const revealRef = useRef<RevealState | null>(null);
  const cycleRef = useRef<Cycle | null>(null);
  const onCycleRef = useRef(onCycle);
  const excludeSrcsRef = useRef(excludeSrcs);

  // Transient image-derived recolor for the regenerate churn. While set, it
  // overrides the palette + card surface (shader uniforms AND the wrapper's
  // CSS background) so the effect wears the outgoing image's colors; cleared
  // automatically when the next image reaches \`visible\`.
  const [regenTint, setRegenTint] = useState<SampledPalette | null>(null);

  // Transient preset override for the regenerate churn. The churn must always
  // run on a pixel-mosaic preset (\`pixels-mechanic\` / \`pixels-organic\`): when
  // the active preset is not one of those (e.g. \`sweep-gradient\`), a random
  // pixel preset is swapped onto the instance for the churn's duration and
  // the authored preset is restored once the next image is fully visible.
  const [regenPresetName, setRegenPresetName] = useState<ImageGenerationPreset | null>(null);

  useImperativeHandle(
    forwardedRef,
    () => ({
      get element() {
        return rootRef.current;
      },
      triggerReveal(opts) {
        cycleRef.current?.triggerOnce(opts);
      },
      triggerHide() {
        cycleRef.current?.triggerHide();
      },
      triggerRegenerate(opts) {
        const cycle = cycleRef.current;
        if (!cycle || pausedRef.current) return;
        const phase = cycle.getPhase();
        if (phase !== 'reveal' && phase !== 'visible') return;
        // The churn always runs on a pixel-mosaic preset: keep the active
        // preset when it's already one, otherwise (e.g. sweep-gradient)
        // temporarily switch the instance to a random pixel preset. The
        // authored preset is restored when the next image reaches \`visible\`.
        const activePreset = presetRef.current;
        const churnName = isPixelChurnPreset(activePreset)
          ? null
          : PIXEL_CHURN_PRESETS[Math.floor(Math.random() * PIXEL_CHURN_PRESETS.length)];
        // Recolor the effect from the visible image (overlay canvas) so the
        // churn showing through the dropped cells reads as pixelation born
        // from that image rather than the preset's stock palette. The sample
        // maps onto the CHURN preset's palette slots (the preset actually
        // rendering during the churn), not the outgoing preset's.
        if (opts?.tintFromImage ?? true) {
          const overlay = overlayCanvasRef.current;
          if (overlay) {
            const churnColors = churnName
              ? PRESETS[churnName].modes[resolvedThemeRef.current].colors
              : presetModeRef.current.colors;
            const sampled = samplePaletteFromCanvas(overlay, churnColors);
            if (sampled) setRegenTint(sampled);
          }
        }
        if (churnName) setRegenPresetName(churnName);
        const autoReveal = opts?.autoReveal ?? true;
        cycle.triggerBoil(
          autoReveal ? { autoRevealAfterMs: opts?.durationMs ?? 4000 } : undefined
        );
      },
      isImageActive() {
        const phase = cycleRef.current?.getPhase() ?? 'idle';
        return phase === 'reveal' || phase === 'visible' || phase === 'hide';
      }
    }),
    []
  );
  useLayoutEffect(() => {
    ensureStylesInjected();
  }, []);

  // Keep the latest callbacks live without re-subscribing the cycle.
  useEffect(() => {
    onCycleRef.current = onCycle;
  }, [onCycle]);
  useEffect(() => {
    excludeSrcsRef.current = excludeSrcs;
  }, [excludeSrcs]);

  const resolvedTheme = useResolvedTheme(theme);
  const presetMode = useMemo(() => PRESETS[preset].modes[resolvedTheme], [preset, resolvedTheme]);
  // Effective background colour (override > preset). Drives both the wrapper's
  // CSS background and the shader's \`u_cardBg\` uniform so contrast logic in
  // the shader stays in sync with the actual host card surface.
  const cardBg = cardBgProp ?? presetMode.cardBg;

  // Live refs for the imperative \`triggerRegenerate\` (its handle is created
  // once with empty deps, so it must read current values through refs).
  const presetModeRef = useRef(presetMode);
  presetModeRef.current = presetMode;
  const presetRef = useRef(preset);
  presetRef.current = preset;
  const resolvedThemeRef = useRef(resolvedTheme);
  resolvedThemeRef.current = resolvedTheme;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Normalised image pool + refs holding the latest cycle inputs so the
  // mount-only lifecycle effect can read them when constructing the cycle.
  // (The cycle itself is created in the lifecycle effect so manual
  // \`triggerReveal()\` works regardless of the \`autoReveal\` flag.)
  const imagesArr = useMemo(() => normaliseImages(images), [images]);
  const imagesArrRef = useRef(imagesArr);
  const revealDelayRangeRef = useRef(revealDelayRange);
  const revealHoldMsRef = useRef(revealHoldMs);
  const revealFadeOutMsRef = useRef(revealFadeOutMs);
  imagesArrRef.current = imagesArr;
  revealDelayRangeRef.current = revealDelayRange;
  revealHoldMsRef.current = revealHoldMs;
  revealFadeOutMsRef.current = revealFadeOutMs;

  // Resolve \`revealInitialDelay\` into a stable ms value at mount time.
  // Range tuples randomise ONCE here so re-renders never reseed the value.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-shot resolution at mount
  const initialDelayMsRef = useRef<number | undefined>(
    useMemo(() => {
      if (revealInitialDelay == null) return undefined;
      if (typeof revealInitialDelay === 'number') {
        return Math.max(0, revealInitialDelay) * 1000;
      }
      const [min, max] = revealInitialDelay;
      const lo = Math.max(0, Math.min(min, max));
      const hi = Math.max(0, Math.max(min, max));
      return (lo + Math.random() * (hi - lo)) * 1000;
    }, [])
  );

  // Lifecycle: create instance + reveal on mount, destroy on unmount.
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable lifecycle effect; preset / theme syncs handled separately
  useLayoutEffect(() => {
    const root = rootRef.current;
    const shader = shaderCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!root || !shader || !overlay) return;

    // Dynamic measure: size from the root's bounding box and corner radius
    // from the wrapped child's computed style (falls back to the root if the
    // child has none). The shader can only render a single uniform corner
    // radius, so we sample \`borderTopLeftRadius\` and apply it on all four
    // corners — matches how the canvases inherit border-radius from the root.
    const measure = (): { w: number; h: number; r: number } => {
      const rect = root.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      let r = 0;
      if (typeof borderRadius === 'number') {
        r = borderRadius;
      } else {
        const childEl = contentRef.current?.firstElementChild as HTMLElement | null;
        if (childEl) {
          const parsed = parseFloat(getComputedStyle(childEl).borderTopLeftRadius);
          if (Number.isFinite(parsed) && parsed > 0) r = parsed;
        }
        if (r === 0) {
          const parsed = parseFloat(getComputedStyle(root).borderTopLeftRadius);
          if (Number.isFinite(parsed) && parsed > 0) r = parsed;
        }
      }
      return { w, h, r };
    };

    const initial = measure();
    const inst = createInstance({
      canvas: shader,
      cssWidth: initial.w,
      cssHeight: initial.h,
      preset: presetMode,
      strength,
      speed,
      cardBg: cardBgProp ?? null,
      pixelScale
    });
    instanceRef.current = inst;
    inst.canvas.style.opacity = String(Math.max(0, Math.min(1, strength)));

    const reveal = createReveal({
      canvas: overlay,
      cssWidth: initial.w,
      cssHeight: initial.h,
      shaderCanvas: shader
    });
    inst.reveal = reveal;
    revealRef.current = reveal;

    // Cycle is created up-front (independent of \`autoReveal\`) so that the
    // imperative \`triggerReveal()\` works for manual user-driven reveals too.
    // \`start()\` is only called when \`autoReveal\` is true (separate effect).
    const cycle = createCycle({
      reveal,
      images: imagesArrRef.current,
      delayRange: revealDelayRangeRef.current,
      holdMs: revealHoldMsRef.current,
      fadeOutMs: revealFadeOutMsRef.current,
      initialDelayMs: initialDelayMsRef.current,
      onPhase: (e) => {
        // A fully-visible image ends any regenerate churn — restore the
        // preset palette / consumer-provided colors and the authored preset.
        // (No-op re-set when nothing is active; React bails on identical
        // state.)
        if (e.phase === 'visible') {
          setRegenTint(null);
          setRegenPresetName(null);
        }
        onCycleRef.current?.(e);
      },
      excludeSrcs: () => excludeSrcsRef.current?.() ?? null
    });
    cycleRef.current = cycle;
    if (paused) cycle.setPaused(true);

    root.style.setProperty('--image-gen-radius', \`\${initial.r}px\`);
    root.style.borderRadius = \`\${initial.r}px\`;

    // Sync the wrapper's dimensions + corner radius to the host card.
    //
    // The radius must follow the wrapped child dynamically so the effect
    // always matches whatever the consumer's card looks like — even if they
    // toggle a class, adjust an inline style, or swap the child entirely.
    //
    // Three observers handle the three change vectors:
    //   1. ResizeObserver on root  -> wrapper resized (window resize, parent
    //      flex/grid change, container query, etc.)
    //   2. ResizeObserver on child -> child intrinsic size changed (text
    //      reflow, image load), which can also imply a CSS recalc that
    //      affects radius.
    //   3. MutationObserver on child -> class / style / data-* attribute
    //      changes that may swap border-radius without touching size (theme
    //      toggle, hover/active class flip from parent, etc.).
    //
    // All three coalesce through a single rAF so the canvas isn't resized
    // more than once per frame.
    let resizeRaf = 0;
    let lastW = -1;
    let lastH = -1;
    let lastR = -1;
    const applyMeasure = (): void => {
      resizeRaf = 0;
      const i = instanceRef.current;
      if (!i) return;
      const next = measure();
      // Skip GL resize if dimensions didn't actually change; still re-apply
      // border-radius because that's the cheap part and may have moved.
      if (next.w !== lastW || next.h !== lastH) {
        updateInstanceSize(i, next.w, next.h);
        lastW = next.w;
        lastH = next.h;
      }
      if (next.r !== lastR) {
        root.style.setProperty('--image-gen-radius', \`\${next.r}px\`);
        root.style.borderRadius = \`\${next.r}px\`;
        lastR = next.r;
      }
    };
    const scheduleMeasure = (): void => {
      if (resizeRaf !== 0) return;
      resizeRaf = requestAnimationFrame(applyMeasure);
    };

    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(root);
    const childEl = contentRef.current?.firstElementChild as HTMLElement | null;
    if (childEl) ro.observe(childEl);

    // Watch for CSS-affecting attribute changes on the child so radius
    // updates that don't trigger a resize (e.g. swapping a \`rounded-lg\`
    // class with \`rounded-xl\`) are still reflected immediately.
    let mo: MutationObserver | null = null;
    if (childEl && typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(scheduleMeasure);
      mo.observe(childEl, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    // Initialise cached dimensions from the first measure so the guard
    // above doesn't spuriously re-apply identical values on the next tick.
    lastW = initial.w;
    lastH = initial.h;
    lastR = initial.r;

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const i = instanceRef.current;
          if (!i) return;
          for (const e of entries) setInstanceVisible(i, e.isIntersecting);
        },
        { rootMargin: '64px' }
      );
      io.observe(root);
    }

    return () => {
      ro.disconnect();
      mo?.disconnect();
      io?.disconnect();
      if (resizeRaf !== 0) cancelAnimationFrame(resizeRaf);
      cycleRef.current?.dispose();
      cycleRef.current = null;
      reveal.dispose();
      revealRef.current = null;
      const i = instanceRef.current;
      if (i) destroyInstance(i);
      instanceRef.current = null;
    };
  }, []);

  // Sync preset/theme to the instance + force a one-shot repaint so paused
  // instances reflect the prop change live (rAF tick is gated on \`!paused\`).
  // An active regenerate churn preset override takes precedence over the prop.
  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    const effectiveMode = regenPresetName
      ? PRESETS[regenPresetName].modes[resolvedTheme]
      : presetMode;
    setInstancePreset(i, effectiveMode);
    renderInstanceOnce(i);
  }, [presetMode, regenPresetName, resolvedTheme]);

  // Sync cardBg override to the instance (shader uniform + reveal helper),
  // then repaint once so the change shows immediately even while paused.
  // An active regenerate tint takes precedence over the prop.
  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    setInstanceCardBg(i, regenTint?.cardBg ?? cardBgProp ?? null);
    renderInstanceOnce(i);
  }, [cardBgProp, regenTint]);

  // Sync the palette override (per-slot colors, e.g. sampled from an image).
  // An active regenerate tint takes precedence over the prop.
  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    setInstanceColors(i, regenTint?.colors ?? colors ?? null);
    renderInstanceOnce(i);
  }, [colors, regenTint]);

  // Sync strength via the visible canvas opacity (no shader recompile).
  // The \`opacity\` style change is purely DOM and applies even while paused;
  // no GL repaint needed.
  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    setInstanceStrength(i, strength);
    if (i.canvas) {
      i.canvas.style.opacity = String(Math.max(0, Math.min(1, strength)));
    }
  }, [strength]);

  // Sync speed — scales the instance's animation clock, no repaint needed.
  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    setInstanceSpeed(i, speed);
  }, [speed]);

  // Sync pixelScale (recomputes the mosaic grid density) and repaint once so
  // the change is visible immediately even while paused.
  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    setInstancePixelScale(i, pixelScale);
    renderInstanceOnce(i);
  }, [pixelScale]);

  // Sync paused.
  // Custom fragment stage: page-wide while set, back to the bundled one when
  // this instance drops it or unmounts.
  useEffect(() => {
    if (!fragmentShader

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="relative w-80 h-40 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
  <div class="absolute inset-0 grid grid-cols-8 gap-px" id="imgfx-grid"></div>
  <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
    <p class="text-white text-xs font-mono">img-fx · rendering...</p>
  </div>
</div>
<script>
(function() {
  const grid = document.getElementById('imgfx-grid');
  if (!grid) return;
  let p = 0;
  for (let i = 0; i < 64; i++) {
    const d = document.createElement('div');
    d.style.background = 'linear-gradient(135deg, #8b5cf6, #ec4899)';
    grid.appendChild(d);
  }
  function tick() {
    p = (p + 1) % 100;
    [...grid.children].forEach((d, i) => {
      d.style.opacity = 0.3 + 0.7 * Math.abs(Math.sin((i + p) * 0.1));
    });
    requestAnimationFrame(tick);
  }
  tick();
})();
</script>
`,
    sourceUrl: `https://www.npmjs.com/package/img-fx`,
    description: `From libraries.dev · npm install img-fx`,
  },
  {
    id: `ldev-liquid-gooey`,
    name: `Liquid Gooey (libraries.dev)`,
    category: `Effects`,
    tags: [`gooey`, `filter`, `merge`, `svg`, `react`],
    code: `// ─── src/Gooey.tsx ───
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type Ref,
} from 'react'
import { GooeyContext, type GooeyContextValue } from './context'
import { GooFilterPrimitives } from './filter'
import { ImageMeltLayer, createImageMeltRegistry } from './imageMelt'
import { useIsoLayoutEffect } from './hooks'
import { ObserveEngine } from './observer'
import { parseShadow } from './shadow'

export interface GooeyProps extends HTMLAttributes<HTMLDivElement> {
  /** Goo blur sigma in px — how far apart pieces start bridging. Default 6. */
  blur?: number
  /** Alpha-contrast slope — how sharp the liquid edge is. Default 18. */
  contrast?: number
  /** Fill of the liquid surface. Any CSS color, \`var()\` welcome. Default '#fff'. */
  fill?: string
  /** \`box-shadow\` syntax; rendered on the MERGED silhouette. \`inset\` layers
   *  paint inside the liquid edge (inner rings / top highlights). */
  shadow?: string
  /** Extra filter-region slack in px for blobs travelling outside the group box. Default 24. */
  filterPadding?: number
  /** Max px the liquid boundary undulates — the silhouette (and its shadows)
   *  run through a gentle noise displacement, so edges read as fluid instead
   *  of geometric. 0 (default) keeps the calm edge. */
  waviness?: number
  /** Noise frequency of the undulation; lower = longer, lazier waves. */
  wavinessFreq?: number
  /** Escape hatch: raw SVG filter primitives that REPLACE the goo chain
   *  (\`blur\`, \`contrast\`, \`waviness\` and the SVG half of \`shadow\` are then
   *  yours to reproduce). The input is \`SourceGraphic\`; the last primitive's
   *  output is what paints. Inset and spread shadows normally read a
   *  binarised \`shape\` result — keep that name if you keep them. */
  filter?: string
}

/** Gooey group: renders the silhouette SVG layer (goo filter + shadow chain)
 *  behind its children. Children stay crisp; <Gooey.Item> mirrors each piece's
 *  geometry into the liquid layer.
 *
 *  Filters run on SVG content — not CSS url() filters on HTML — because that
 *  is the one variant WebKit renders correctly and promotes properly. */
export const GooeyRoot = forwardRef<HTMLDivElement, GooeyProps>(function Gooey(
  {
    blur = 6,
    contrast = 18,
    fill = '#fff',
    shadow,
    filterPadding = 24,
    waviness = 0,
    wavinessFreq = 0.018,
    filter: customFilter,
    className,
    style,
    children,
    ...rest
  },
  fwd: Ref<HTMLDivElement>,
) {
  const groupRef = useRef<HTMLDivElement | null>(null)
  const [portal, setPortal] = useState<SVGGElement | null>(null)
  const [meltPortal, setMeltPortal] = useState<SVGGElement | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      groupRef.current = node
      if (typeof fwd === 'function') fwd(node)
      else if (fwd) (fwd as { current: HTMLDivElement | null }).current = node
    },
    [fwd],
  )

  const filterId = \`gooey-\${useId().replace(/[^a-zA-Z0-9_-]/g, '')}\`
  const shadows = useMemo(() => parseShadow(shadow), [shadow])

  useIsoLayoutEffect(() => {
    const el = groupRef.current
    if (!el) return
    const measure = () =>
      setSize(prev =>
        prev.w === el.offsetWidth && prev.h === el.offsetHeight
          ? prev
          : { w: el.offsetWidth, h: el.offsetHeight },
      )
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const engine = useMemo(() => new ObserveEngine(() => groupRef.current), [])
  const imageMelt = useMemo(() => createImageMeltRegistry(), [])
  useEffect(() => () => engine.dispose(), [engine])
  useEffect(() => {
    engine.gooBlur = blur
  }, [engine, blur])

  const ctx = useMemo<GooeyContextValue>(
    () => ({ portal, meltPortal, fill, getGroup: () => groupRef.current, engine, imageMelt }),
    [portal, meltPortal, fill, engine, imageMelt],
  )

  // The filter raster is the whole performance story on WebKit, which runs
  // SVG filters on the CPU at full device scale — measured at 9fps for a
  // drag on an iPhone-class 3x screen. The heavy layers are the BLURRED
  // outer shadows: a 42px-blur pass re-rasterises the entire padded region
  // every animated frame. CSS drop-shadow() is mathematically the same
  // operation (blur-radius = 2σ, exactly box-shadow's convention, exactly
  // the stdDeviation = blur/2 the SVG pass used) — but a CSS filter list on
  // the element runs on the COMPOSITOR, GPU-accelerated in both WebKit and
  // Chromium. So the stack is split:
  //   - blurred/offset outer shadows  -> drop-shadow() on the svg element
  //   - spread rings and inset layers -> SVG passes (not expressible in
  //     CSS, but they are morphology/offset ops with no big blurs — cheap)
  //   - the goo chain itself          -> SVG, as before
  // One spec'd difference: chained drop-shadows each see the previous
  // result, so a later shadow also shadows an earlier one's pixels — at the
  // 5-25% alphas shadows use, that cross-term is under 1% alpha, invisible.
  // The filter pad also shrinks to what the REMAINING svg layers reach,
  // which cuts the rasterised area again.
  const svgShadows = shadows.filter(s => s.inset || s.spread !== 0)
  const cssShadowFilter = shadows
    .filter(s => !s.inset && s.spread === 0)
    // box-shadow lists paint the FIRST layer on top; drop-shadow chains
    // paint later filters behind earlier output, so document order already
    // matches.
    .map(s => \`drop-shadow(\${s.x}px \${s.y}px \${s.blur}px \${s.color})\`)
    .join(' ')
  const shadowExtent = svgShadows.reduce(
    (m, s) => Math.max(m, Math.max(Math.abs(s.x), Math.abs(s.y)) + s.blur * 1.5 + Math.max(0, s.spread)),
    0,
  )
  const pad = Math.ceil(blur * 3 + shadowExtent + filterPadding)

  return (
    <div
      {...rest}
      ref={setRefs}
      className={className}
      style={{ position: 'relative', isolation: 'isolate', ...style }}
    >
      {/* zIndex -1 inside the isolated group: the liquid paints above the
          group's own background but below every child, positioned or not. */}
      <svg
        aria-hidden="true"
        focusable="false"
        data-gooey-svg=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: -1,
          // The GPU half of the shadow stack (see above).
          filter: cssShadowFilter || undefined,
          // Promote the filtered layer: WebKit otherwise repaints the goo a
          // frame or two behind the plain-DOM content.
          willChange: 'filter, transform',
        }}
      >
        <defs>
          {customFilter ? (
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              x={-pad}
              y={-pad}
              width={size.w + pad * 2}
              height={size.h + pad * 2}
              colorInterpolationFilters="sRGB"
              dangerouslySetInnerHTML={{ __html: customFilter }}
            />
          ) : (
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              x={-pad}
              y={-pad}
              width={size.w + pad * 2}
              height={size.h + pad * 2}
              colorInterpolationFilters="sRGB"
            >
              <GooFilterPrimitives
                blur={blur}
                contrast={contrast}
                shadows={svgShadows}
                waviness={waviness}
                wavinessFreq={wavinessFreq}
              />
            </filter>
          )}
        </defs>
        <g id={\`\${filterId}-sil\`} ref={setPortal} filter={\`url(#\${filterId})\`} style={{ fill }} />
      </svg>
      {/* Melt overlay: warped-image copies render here, ABOVE the content
          layer. SVG content so displacement/blur filters work in WebKit. */}
      <svg
        aria-hidden="true"
        focusable="false"
        data-gooey-overlay=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          // Above the content layer by design, and high enough that an app's
          // own stacking (e.g. a dragged item raised over its neighbours)
          // can't slip in front and hide the melt. Scoped: the group is an
          // isolated stacking context, so this can't escape it.
          zIndex: 9999,
        }}
      >
        <defs>
          {/* The melt may only paint where LIQUID exists: the mask re-renders
              the goo-filtered silhouette (same document, <use> across the two
              svgs), so the warped copies are clipped to the merged surface —
              without this the smear bled past the liquid edge onto the page
              background. Luminance mask: the white silhouette passes, the
              faint shadow layers (≤6% alpha) are negligible. */}
          <mask
            id={\`\${filterId}-meltmask\`}
            maskUnits="userSpaceOnUse"
            x={-pad}
            y={-pad}
            width={size.w + pad * 2}
            height={size.h + pad * 2}
          >
            <use href={\`#\${filterId}-sil\`} />
          </mask>
        </defs>
        <g mask={\`url(#\${filterId}-meltmask)\`}>
          <g ref={setMeltPortal} />
        </g>
      </svg>
      <GooeyContext.Provider value={ctx}>
        {children}
        <ImageMeltLayer registry={imageMelt} />
      </GooeyContext.Provider>
    </div>
  )
})


// ─── src/GooeyItem.tsx ───
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useGooeyContext, type GooeyContextValue } from './context'
import {
  measureRadius,
  normalizeRadius,
  offsetTo,
  roundedRectPath,
  type BlobBox,
  type CornerRadii,
} from './geometry'
import { useIsoLayoutEffect, useReducedMotion } from './hooks'
import { EVOLVE_DEFAULTS, MOVE_DEFAULTS, type EvolveOptions, type MoveOptions } from './observer'
import { easingFunction, resolveTransition, type Transition } from './spring'

export type GooeyEffect = 'morph' | 'evolve' | 'move'

/** Full tuning surface of the contact melt ("dissolve"). All values optional —
 *  the defaults are the library's tuned look. */
export interface DissolveOptions {
  /** Melt blur in px. Default 8. */
  blur?: number
  /** Displacement strength of the liquid warp. Default 26. */
  warp?: number
  /** Magnetic drift toward the contact, px. Default 4. */
  pull?: number
  /** Distance where melting starts (defaults from the group's goo blur). */
  range?: number
  /** Size of the melt zone around the contact, px. */
  zone?: number
  /** 0..1 — two-liquid mixing: erodes the melted copy into tendrils so the
   *  liquid behind shows through the gaps. Default 0.7 when dissolving. */
  mix?: number
  /** Px the melt is drawn toward the neighbour's centre (flow gravity). */
  gravity?: number
  /** 0..1 — how pointy that flow tapers toward the neighbour. */
  taper?: number
  /** Noise frequency multiplier: <1 broad swirls, >1 fine veins. */
  warpFreq?: number
  /** Px/s the noise field drifts so the liquid churns. 0 = static. */
  flowSpeed?: number
  /** 'fractalNoise' (soft billows) or 'turbulence' (veinier). */
  warpStyle?: 'fractalNoise' | 'turbulence'
  /** Noise octaves; higher = finer swirls. */
  detail?: number
  /** While false the melt fades out over \`releaseMs\`, regardless of
   *  proximity. */
  active?: boolean
  /** Structural release time when \`active\` goes false, ms. */
  releaseMs?: number
  /** Ms the melt takes to evaporate (opacity -> 0), independent of
   *  \`releaseMs\`. Defaults to \`releaseMs\`. */
  fadeMs?: number
  /** 0..1 — overall dissolve intensity, independent of proximity: caps how
   *  far the melt can develop even at full contact (scales warp/blur/
   *  gravity/mix and the hole depth together). Default 1. */
  strength?: number
  /** How deep this piece may sink into its neighbour before the melt is fully
   *  gone, as a fraction of the smaller body (1 = completely engulfed).
   *  Melting is a surface event — once a piece is well inside the other there
   *  is no seam left to mix at, so the melt recedes and the content resolves
   *  back to crisp. Default 0.8; raise toward (or past) 1 to keep melting
   *  while deeply overlapped. */
  sink?: number
  /** What the liquid is made of. 'liquid' (default): the group fill — white
   *  surface goo with imagery melted over it. 'image': the liquid body IS the
   *  image, so the neck between two items blends both images' colours. */
  surface?: 'liquid' | 'image'
  /** Blur (px) of the seam-blend layer — the imagery painted once more
   *  through a plain heavy blur at the contact, half opacity per side, so
   *  the seam shows the two pictures' colours literally averaged. Defaults
   *  to 1.6x \`blur\`; 0 disables. */
  seamBlur?: number
}

export interface GooeyItemProps {
  /** Liquid behavior of this piece:
   *  - 'morph' (default): merges gooily with touching neighbours.
   *  - 'evolve': the surface springs behind size/shape changes and settles
   *    like jelly.
   *  - 'move': the surface lags a moving element and stretches with velocity —
   *    liquid rubber (great for dragged things).
   *  Combine with an array. Anything beyond 'morph' runs on the measurement
   *  engine, so it implies observe mode. */
  effect?: GooeyEffect | GooeyEffect[]
  /** Tuning for effect="evolve": springs for mass / size / corner radius,
   *  content cross-blur, and droplet roundness. See EvolveOptions. */
  evolve?: EvolveOptions
  /** Tuning for effect="move": trail spring, velocity stretch, tail size. */
  move?: MoveOptions
  /** Mirrored mode: translation applied to both the wrapper and its blob. */
  x?: number
  y?: number
  scale?: number
  /** Mirrored mode: spring preset/config or \`{ duration, ease }\`. Default 'smooth'. */
  transition?: Transition
  /** Mirrored mode: transition delay in ms (stagger). Default 0. */
  delay?: number
  /** Observe mode: you animate the child however you like (Framer Motion, GSAP,
   *  CSS); the blob follows its rendered rect. \`x/y/scale\` are ignored. */
  observe?: boolean
  /** Observe mode: liquid-melt the item's imagery at the point where it
   *  touches a neighbour — a turbulence-displacement warp bends the image and
   *  its edge like two materials merging, ramping in as the goo bridge forms.
   *  \`blur\` is the melt blur in px (default 8), \`warp\` the displacement
   *  strength (default 26), \`pull\` the magnetic drift toward the contact in px
   *  (default 4), \`range\` the distance where melting starts (defaults from the
   *  group's goo blur). Text is never melted. */
  contactBlur?: boolean | DissolveOptions
  /** Override the measured border-radius for the blob (px). */
  radius?: number | CornerRadii
  /** Observe mode: shrink the blob by this many px on every side, so an opaque
   *  element (e.g. a round photo) fully covers its own liquid — white then
   *  only appears as the merge bridge. */
  blobInset?: number
  /** Observe mode: px the blob swells back out (beyond blobInset) as the item
   *  nears a neighbour — the element visibly grows a liquid coat that necks
   *  into the other surface. */
  bridgeGrow?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

function toEffects(effect: GooeyEffect | GooeyEffect[] | undefined): GooeyEffect[] {
  return Array.isArray(effect) ? effect : effect ? [effect] : []
}

export function GooeyItem(props: GooeyItemProps) {
  const ctx = useGooeyContext()
  const needsEngine = props.observe || toEffects(props.effect).some(e => e !== 'morph')
  return needsEngine ? (
    <ObservedItem {...props} ctx={ctx} />
  ) : (
    <MirroredItem {...props} ctx={ctx} />
  )
}

type Internal = GooeyItemProps & { ctx: GooeyContextValue }

function transitionKey(t: Transition | undefined): string {
  return typeof t === 'string' ? t : JSON.stringify(t ?? null)
}

function sameBox(a: BlobBox | null, b: BlobBox): boolean {
  return (
    !!a &&
    a.x === b.x &&
    a.y === b.y &&
    a.w === b.w &&
    a.h === b.h &&
    a.r.every((v, i) => v === b.r[i])
  )
}

function MirroredItem({
  x = 0,
  y = 0,
  scale = 1,
  transition = 'smooth',
  delay = 0,
  radius,
  className,
  style,
  children,
  ctx,
}: Internal) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const blobRef = useRef<SVGGraphicsElement | null>(null)
  const [box, setBox] = useState<BlobBox | null>(null)
  const reduced = useReducedMotion()

  const tKey = transitionKey(transition)
  const { duration, easing } = useMemo(
    () => resolveTransition(transition, reduced),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tKey, reduced],
  )

  const radiusKey = radius == null ? '' : JSON.stringify(radius)
  useIsoLayoutEffect(() => {
    const el = wrapRef.current
    const group = ctx.getGroup()
    if (!el || !group) return
    const measure = () => {
      const base = offsetTo(el, group)
      const w = el.offsetWidth
      const h = el.offsetHeight
      const target = (el.firstElementChild as HTMLElement | null) ?? el
      const r: CornerRadii =
        radius != null ? normalizeRadius(radius) : measureRadius(target, w, h)
      const next: BlobBox = { x: base.x, y: base.y, w, h, r }
      setBox(prev => (sameBox(prev, next) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(group)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, radiusKey])

  // Content and blob are animated by ONE JS clock — no CSS transition on the
  // wrapper. A compositor transition keeps playing through a main-thread
  // stall while the blob (always written from JS) freezes; under Safari's
  // SVG-filter load that read as icons and photos sailing away from their own
  // liquid. With both written in the same rAF tick from the same easing
  // curve, they can only ever move together: a stall holds the whole
  // ensemble, which reads as a hitch, never a tear. The curve is identical to
  // the CSS one (same duration/easing via easingFunction), so browsers that
  // never stall render exactly what they did before.
  const cur = useRef<{ x: number; y: number; s: number } | null>(null)
  const writeTransform = (px: number, py: number, ps: number) => {
    const t = \`translate(\${px}px, \${py}px)\` + (ps !== 1 ? \` scale(\${ps})\` : '')
    if (wrapRef.current) wrapRef.current.style.transform = t
    if (blobRef.current) blobRef.current.style.transform = t
  }
  useIsoLayoutEffect(() => {
    const from = cur.current
    if (
      !from ||
      duration <= 0 ||
      (from.x === x && from.y === y && from.s === scale)
    ) {
      cur.current = { x, y, s: scale }
      writeTransform(x, y, scale)
      return
    }
    // Retarget like a CSS transition: from the currently rendered value, full
    // duration. \`delay\` holds at the start value first (stagger).
    const f = { ...from }
    const ease = easingFunction(easing)
    const start = performance.now() + delay
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration))
      const e = ease(p)
      const cx = f.x + (x - f.x) * e
      const cy = f.y + (y - f.y) * e
      const cs = f.s + (scale - f.s) * e
      cur.current = { x: cx, y: cy, s: cs }
      writeTransform(cx, cy, cs)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y, scale, duration, easing, delay])

  return (
    <>
      <div
        ref={wrapRef}
        className={cl

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="flex items-center justify-center p-12" style="filter: url(#gooey);">
  <svg width="0" height="0"><defs><filter id="gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" /><feComposite in="SourceGraphic" in2="gooey" operator="atop" /></filter></defs></svg>
  <div class="flex gap-2">
    <div class="w-16 h-16 rounded-full bg-pink-500" style="animation: bouncy 2.4s ease-in-out 0s infinite"></div>
    <div class="w-16 h-16 rounded-full bg-violet-500" style="animation: bouncy 2.4s ease-in-out 0.3s infinite"></div>
    <div class="w-16 h-16 rounded-full bg-blue-500" style="animation: bouncy 2.4s ease-in-out 0.6s infinite"></div>
    <div class="w-16 h-16 rounded-full bg-emerald-500" style="animation: bouncy 2.4s ease-in-out 0.9s infinite"></div>
  </div>
</div>
<style>@keyframes bouncy { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }</style>
`,
    sourceUrl: `https://www.npmjs.com/package/liquid-gooey`,
    description: `From libraries.dev · npm install liquid-gooey`,
  },
  {
    id: `ldev-metal-fx`,
    name: `Metal Fx (libraries.dev)`,
    category: `Effects`,
    tags: [`metal`, `chrome`, `ring`, `shimmer`, `react`],
    code: `// ─── src/MetalFx.tsx ───
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { MetalFxInstance } from './engine/renderer/core';
import {
  createInstance,
  destroyInstance,
  registerGlowInstance,
  setGlowCallback,
  setInstanceVisible,
  setSharedPreset,
  unregisterGlowInstance,
  updateInstance,
} from './engine/renderer/loop';
import { injectGlow, updateGlow } from './engine/glow/glow';
import { addReflectionTarget, removeReflectionTarget } from './engine/reflection/paint';
import { scheduleReflectionPaint } from './engine/reflection/reflectionScheduler';
import { ensureStylesInjected } from './styles';
import type { MetalFxProps, MetalFxTheme } from './types';

// Runs at module scope so styles exist before the first component render,
// even in SSR-hydration scenarios where effects haven't fired yet.
ensureStylesInjected();

// Hoisted to avoid allocating new objects on every render.
const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };
const INNER_STYLE: CSSProperties = { position: 'absolute', inset: 3 };
const GLOW_HOST_STYLE: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, borderRadius: 'inherit' };

// Maps each live instance to its SVG glow handles and a theme ref.
// Keyed by instance (not component) because the same component can be
// remounted with a new instance after shape/glowEnabled changes.
const glowHandlesMap = new Map<
  MetalFxInstance,
  {
    handles: ReturnType<typeof injectGlow>;
    themeRef: { current: 'dark' | 'light' };
    glowRef: { current: number };
  }
>();

// Bridge between the shared animation loop and per-instance glow SVGs.
// The loop module doesn't import glow directly — it invokes this callback
// for one queued instance per frame (round-robin), keeping render work
// proportional to frame budget regardless of instance count.
setGlowCallback((inst, nowMs) => {
  const entry = glowHandlesMap.get(inst);
  if (!entry) return;
  updateGlow(entry.handles, inst, nowMs, inst.opacityMul * entry.glowRef.current, entry.themeRef.current);
});

/**
 * Resolves 'auto' theme to 'dark' | 'light' and keeps it in sync with
 * the OS preference via matchMedia.
 *
 * The useState initialiser runs synchronously so the resolved value is
 * available on the first render (no flash). The useEffect then attaches
 * the MQL listener and calls update() immediately to handle the case
 * where the OS preference changed between SSR and hydration.
 */
function useResolvedTheme(theme: MetalFxTheme): 'dark' | 'light' {
  const [resolved, setResolved] = useState<'dark' | 'light'>(() => {
    if (theme !== 'auto') return theme;
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme !== 'auto') { setResolved(theme); return; }
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setResolved(mql.matches ? 'dark' : 'light');
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [theme]);

  return resolved;
}

/**
 * Wraps any element with an animated metallic ring effect driven by a
 * single shared WebGL renderer. All visible MetalFx instances on the page
 * share one offscreen GL canvas; each instance composites a cropped/scaled
 * copy of it onto its own 2D canvas with a rounded hole punched through the
 * centre.
 */
export const MetalFx = forwardRef<HTMLDivElement, MetalFxProps>(function MetalFx(
  {
    children,
    variant = 'button',
    preset = 'chromatic',
    theme = 'auto',
    strength = 1,
    paused = false,
    borderRadius,
    normalizeHostStyles = true,
    reflectionTargets,
    disableGlow = false,
    glowStrength = 1,
    shaderScale,
    ringCssPx,
    scale = 1,
    className,
    style,
    ...rest
  },
  forwardedRef
) {
  // DOM refs — rootRef/canvasRef/glowHostRef/contentRef are for direct DOM access.
  // instanceRef/glowHandlesRef hold engine objects that survive React re-renders.
  // themeRef lets the glow callback read the current theme without a closure
  // over a stale value — mutated during render, never triggers a re-render.
  // initialWrapperRadiusRef caches the CSS border-radius read at mount time so
  // measure() can fall back to it when no explicit borderRadius prop is given.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowHostRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<MetalFxInstance | null>(null);
  const glowHandlesRef = useRef<ReturnType<typeof injectGlow> | null>(null);
  const themeRef = useRef<'dark' | 'light'>('dark');
  // glowRef lets the glow callback read the live glow strength without a
  // closure over render state (same pattern as themeRef).
  const glowRef = useRef(1);
  const initialWrapperRadiusRef = useRef<number>(0);

  const [ready, setReady] = useState(false);
  const resolvedTheme = useResolvedTheme(theme);
  // Write during render (not in an effect) so the glow callback always sees
  // the up-to-date theme on the very next tick.
  themeRef.current = resolvedTheme;
  glowRef.current = Math.max(0, Math.min(1, glowStrength));
  const shape: 'pill' | 'circle' = variant === 'circle' ? 'circle' : 'pill';
  const glowEnabled = !disableGlow;

  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement, []);

  const resolveRadius = (w: number, h: number) => {
    // variant='circle' is the user's explicit promise that the wrapped
    // element should render as a circle. Always pick min(w,h)/2 so the
    // engine produces a true circle even when the child's CSS border-radius
    // is read in a different coordinate space than the bounding rect (the
    // exact failure mode under CSS \`zoom: 2\`, where getComputedStyle
    // returns source pixels but getBoundingClientRect returns zoomed ones).
    if (shape === 'circle') return Math.min(w, h) / 2;

    const raw = typeof borderRadius === 'number'
      ? borderRadius
      : (() => {
          const childEl = contentRef.current?.firstElementChild as HTMLElement | null;
          if (childEl) {
            const parsed = parseFloat(getComputedStyle(childEl).borderTopLeftRadius);
            if (Number.isFinite(parsed) && parsed > 0) return parsed;
          }
          return initialWrapperRadiusRef.current;
        })();
    return Math.min(raw, Math.min(w, h) / 2);
  };

  useEffect(() => { setSharedPreset(preset, resolvedTheme); }, [preset, resolvedTheme]);
  // \`paused\` is per-instance: it freezes only this instance's 2D canvas while
  // the shared GL loop keeps running for any other unpaused instance.
  useEffect(() => {
    const inst = instanceRef.current;
    if (!inst) return;
    updateInstance(inst, { paused });
  }, [paused]);

  // Re-sync optional shader/ring/scale overrides if they change at runtime.
  useEffect(() => {
    const inst = instanceRef.current;
    if (!inst) return;
    const patch: Partial<Parameters<typeof updateInstance>[1]> = {};
    if (shaderScale !== undefined) patch.shaderScale = shaderScale;
    if (ringCssPx !== undefined) patch.ringCssPx = ringCssPx;
    if (scale !== undefined) patch.scale = scale;
    if (Object.keys(patch).length > 0) updateInstance(inst, patch);
  }, [shaderScale, ringCssPx, scale]);

  // useLayoutEffect (not useEffect) so the instance is created and the canvas
  // is sized synchronously before the browser paints — avoids a one-frame
  // flash of the unsized canvas.
  // biome-ignore lint/correctness/useExhaustiveDependencies: borderRadius changes handled by separate effect
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const glowHost = glowHostRef.current;
    if (!canvas || !root) return;

    {
      const computed = getComputedStyle(root);
      const parsed = parseFloat(computed.borderTopLeftRadius);
      initialWrapperRadiusRef.current = Number.isFinite(parsed) ? parsed : 0;
    }

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.round(rect.width));
      const cssHeight = Math.max(1, Math.round(rect.height));
      return { cssWidth, cssHeight, cornerRadius: resolveRadius(cssWidth, cssHeight) };
    };

    const initial = measure();
    instanceRef.current = createInstance({
      hostCanvas: canvas,
      cssWidth: initial.cssWidth,
      cssHeight: initial.cssHeight,
      cornerRadius: initial.cornerRadius,
      kind: shape,
      paused,
      shaderScale,
      ringCssPx,
      scale,
      onFirstCopy: () => setReady(true),
    });
    root.style.setProperty('--mfx-radius', \`\${initial.cornerRadius}px\`);
    root.style.borderRadius = \`\${initial.cornerRadius}px\`;

    if (glowHost) {
      glowHandlesRef.current = injectGlow(glowHost, {
        width: initial.cssWidth,
        height: initial.cssHeight,
        cornerRadius: initial.cornerRadius,
        kind: shape,
        scale,
      });
    }

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      if (resizeRaf !== 0) return;
      // RAF-debounce: coalesce multiple resize events within the same frame and
      // skip any that fire while a frame is already queued.
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        const next = measure();
        const inst = instanceRef.current;
        if (!inst) return;
        updateInstance(inst, { cssWidth: next.cssWidth, cssHeight: next.cssHeight, cornerRadius: next.cornerRadius });
        root.style.setProperty('--mfx-radius', \`\${next.cornerRadius}px\`);
        root.style.borderRadius = \`\${next.cornerRadius}px\`;
        if (glowHost) {
          glowHost.innerHTML = '';
          glowHandlesRef.current = injectGlow(glowHost, {
            width: next.cssWidth, height: next.cssHeight, cornerRadius: next.cornerRadius, kind: shape, scale,
          });
          if (inst && glowHandlesRef.current) {
            glowHandlesMap.set(inst, { handles: glowHandlesRef.current, themeRef, glowRef });
          }
        }
      });
    });
    ro.observe(root);

    // Skip GL compositing for off-screen instances — the loop checks inst.visible
    // before copyShaderToInstance, so hidden instances cost nothing per frame.
    // rootMargin: 64px starts rendering slightly before the element scrolls into view.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => { const inst = instanceRef.current; if (!inst) return; for (const e of entries) setInstanceVisible(inst, e.isIntersecting); },
        { rootMargin: '64px' }
      );
      io.observe(root);
    }

    if (instanceRef.current && glowHandlesRef.current) {
      glowHandlesMap.set(instanceRef.current, { handles: glowHandlesRef.current, themeRef, glowRef });
      registerGlowInstance(instanceRef.current);
    }

    return () => {
      ro.disconnect();
      io?.disconnect();
      if (resizeRaf !== 0) cancelAnimationFrame(resizeRaf);
      const inst = instanceRef.current;
      if (inst) {
        glowHandlesMap.delete(inst);
        unregisterGlowInstance(inst);
        destroyInstance(inst);
      }
      instanceRef.current = null;
      glowHandlesRef.current = null;
      if (glowHost) glowHost.innerHTML = '';
    };
  }, [shape]);

  // strength=1 maps directly to a full-opacity composite (opacityMul=1) for
  // every variant. Per-preset toning lives in \`shaderOpacity\` inside each
  // PresetMode, not here, so buttons and circles share the same headroom.
  useEffect(() => {
    const inst = instanceRef.current;
    if (!inst) return;
    updateInstance(inst, { opacityMul: Math.max(0, Math.min(1, strength)) });
  }, [strength, variant]);

  // onAfterFrame is wired here rather than at createInstance time so instances
  // without reflectionTargets never schedule the reflection RAF.
  // Reflections are dark-mode only — no DOM work in light mode.
  useEffect(() => {
    const inst = instanceRef.current;
    const root = rootRef.current;
    if (!inst || !root || !reflectionTargets || resolvedTheme !== 'dark') return;
    inst.onAfterFrame = scheduleReflectionPaint;
    const live = reflectionTargets.flatMap((r) => (r.current ? [r.current] : []));
    for (const el of live) addReflectionTarget(el, inst, root);
    return () => {
      inst.onAfterFrame = undefined;
      for (const el of live) removeReflectionTarget(el);
    };
  }, [reflectionTargets, resolvedTheme]);

  // Separate from the main lifecycle effect so borderRadius / variant / theme
  // changes re-sync the radius without destroying and recreating the instance.
  // biome-ignore covers shape, which is derived from variant and identical to
  // inst.kind — adding it would be correct but redundant.
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger deps for radius re-sync
  useEffect(() => {
    const root = rootRef.current;
    const inst = instanceRef.current;
    if (!root || !inst) return;
    const cornerRadius = resolveRadius(inst.cssWidth, inst.cssHeight);
    updateInstance(inst, { cornerRadius });
    root.style.setProperty('--mfx-radius', \`\${cornerRadius}px\`);
    root.style.borderRadius = \`\${cornerRadius}px\`;
  }, [borderRadius, resolvedTheme, variant, shape]);

  // --mfx-strength is consumed by downstream CSS (e.g. content opacity rules).
  // Spread style last so consumer inline styles can still override other props.
  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      ...style,
      ['--mfx-strength' as string]: String(Math.min(1, Math.max(0, strength))),
      opacity: ready ? 1 : 0,
      visibility: ready ? 'visible' : 'hidden',
      transition: ready ? 'opacity 0.15s ease-out' : 'none',
    }),
    [style, strength, ready]
  );

  return (
    <div
      {...rest}
      ref={rootRef}
      className={className ? \`metal-fx-root \${className}\` : 'metal-fx-root'}
      data-variant={variant}
      data-shape={shape}
      data-theme={resolvedTheme}
      data-paused={paused ? 'true' : undefined}
      data-normalize={normalizeHostStyles ? 'true' : 'false'}
      style={wrapperStyle}
    >
      <canvas ref={canvasRef} className="metal-fx-canvas" style={CANVAS_STYLE} />
      <div className="metal-fx-inner" aria-hidden="true" style={INNER_STYLE} />
      <div ref={glowHostRef} aria-hidden="true" style={{ ...GLOW_HOST_STYLE, display: glowEnabled ? undefined : 'none' }} />
      <div ref={contentRef} className="metal-fx-content">{children}</div>
    </div>
  );
});

MetalFx.displayName = 'MetalFx';


// ─── src/engine/color.ts ───
/** Converts \`#rrggbb\` (or \`#rgb\`) to a normalized \`[r, g, b]\` triple (0–1). */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

/**
 * Converts \`#rgb\` / \`#rgba\` / \`#rrggbb\` / \`#rrggbbaa\` to a normalized
 * \`[r, g, b, a]\` quad (0–1). Alpha defaults to 1 when the hex omits it.
 *
 * Paper's shader takes colors as \`vec4\`, and for \`u_colorTint\` the alpha is a
 * blend *amount* (how much colour-burn to apply), not an opacity — so the
 * 8-digit form is the normal way to write a tint here, not an edge case.
 */
export function hexToRgba(hex: string): [number, number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    a,
  ];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, max];
}

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


// ─── src/engine/glow/geometry.ts ───
/**
 * Pure geometry + SVG markup for the glow overlay.
 *
 * Perimeter math (rounded-rect / circle arc-length sampling), blob path
 * generation, SVG filter/mask construction, and HSV colour helpers.
 * No state — every function is a pure transform.
 */
import { PERIM_SAMPLES } from '../perfConfig';

const INSET = 1.5;
const EXTRA_SCALE = 1 / 3;
const EXTRA_STROKE_OUTER = 4.0 * EXTRA_SCALE;
const EXTRA_STROKE_CORE = 2.0 * EXTRA_SCALE;
const EXTRA_BLUR_OUTER = 2.0 * EXTRA_SCALE;
const EXTRA_BLUR_CORE = 1.35 * EXTRA_SCALE;
const EXTRA_FADE_R = 13.0 * EXTRA_SCALE;

export { PERIM_SAMPLES };

export interface GlowOptions {
  width: number;
  height: number;
  cornerRadius: number;
  kind: 'pill' | 'circle';
  /** Master multiplier for absolute SVG units (stroke widths, blur,
   *  fade-circle radius). 1 is the canonical 1× rendering. Set to 2 when
   *  the host element is rendered at a 2× layout (e.g. CSS zoom: 2) so
   *  the glow grows proportionally. */
  scale?: number;
}
export interface Pt { x: number; y: number }
export interface PerimSample extends Pt { arc: number }

export function rrPerim(w: number, h: number, r: number): number {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  return 2 * Math.max(0, w - 2 * rr) + 2 * Math.max(0, h - 2 * rr) + 2 * Math.PI * rr;
}

export function shapePerim(w: number, h: number, r: number, kind: 'pill' | 'circle'): number {
  if (kind === 'circle') return 2 * Math.PI * Math.max(0, Math.min(r, Math.min(w, h) / 2));
  return rrPerim(w, h, r);
}

export function sampleAtArc(s: number, w: number, h: number, r: number, inset: number, outward: number, kind: 'pill' | 'circle', out?: Pt): Pt {
  const o = out || { x: 0, y: 0 };
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  if (kind === 'circle') {
    const perim = 2 * Math.PI * rr;
    if (perim <= 0.0001) { o.x = w * 0.5; o.y = h * 0.5; return o; }
    s = ((s % perim) + perim) % perim;
    const theta = -Math.PI / 2 + (s / perim) * Math.PI * 2;
    const rad = Math.max(0, rr - inset + outward);
    o.x = w * 0.5 + rad * Math.cos(theta);
    o.y = h * 0.5 + rad * Math.sin(theta);
    return o;
  }
  const topLen = Math.max(0, w - 2 * rr), sideLen = Math.max(0, h - 2 * rr);
  const arcLen = (Math.PI * rr) / 2;
  const perim = 2 * (topLen + sideLen) + 4 * arcLen;
  s = ((s % perim) + perim) % perim;
  const rad = Math.max(0, rr - inset + outward);
  let d = s;
  if (d < topLen) { o.x = rr + d; o.y = inset - outward; return o; }
  d -= topLen;
  if (d < arcLen) {
    const theta = -Math.PI / 2 + (arcLen > 0 ? d / arcLen : 0) * (Math.PI / 2);
    o.x = (w - rr) + rad * Math.cos(theta); o.y = rr + rad * Math.sin(theta); return o;
  }
  d -= arcLen;
  if (d < sideLen) { o.x = w - inset + outward; o.y = rr + d; return o; }
  d -= sideLen;
 

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="relative w-80 h-40 rounded-2xl p-6 overflow-hidden"
  style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
         border: 1px solid rgba(255,255,255,0.1);
         box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4);">
  <div class="relative z-10">
    <h3 class="text-white text-lg font-semibold">Metal FX</h3>
    <p class="text-zinc-300 text-sm mt-1">Polished chrome surface</p>
  </div>
  <div class="absolute inset-0 opacity-50" style="background: radial-gradient(ellipse at top left, rgba(255,255,255,0.2), transparent 50%);"></div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/metal-fx`,
    description: `From libraries.dev · npm install metal-fx`,
  },
  {
    id: `ldev-thinking-orbs`,
    name: `Thinking Orbs (libraries.dev)`,
    category: `Loading UI`,
    tags: [`loader`, `orb`, `thinking`, `ai`, `react`],
    code: `// ─── src/ThinkingOrb.tsx ───
// The ThinkingOrb component. One shared clock (performance.now) keeps
// every mounted orb in phase; each instance runs its own rAF loop but
// pauses automatically while offscreen (IntersectionObserver) or when
// the tab is hidden (visibilitychange). Reduced-motion users get a
// static representative frame that still follows the live theme.

import { useEffect, useRef } from 'react';
import { paintFrame, type OrbTint } from './engine/core';
import { scaleCounts, scaleRadii } from './engine/profiles';
import { MODE_FRAMES } from './engine/registry';
import { resolvePreset } from './presets';
import { useReducedMotion, useResolvedDark } from './theme';
import type { ThinkingOrbProps } from './types';

/** Parse a CSS color into an RGB triple for the tinted ink painter.
 *  Supports #rgb, #rrggbb and rgb()/rgba(); anything else -> no tint. */
function parseTint(color: string | undefined): OrbTint | undefined {
  if (!color) return undefined;
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const fn = color.trim().match(/^rgba?\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)/i);
  if (fn) return { r: Number(fn[1]), g: Number(fn[2]), b: Number(fn[3]) };
  return undefined;
}

const LABELS: Record<string, string> = {
  working: 'Working…',
  searching: 'Searching…',
  solving: 'Solving…',
  listening: 'Listening…',
  connecting: 'Connecting…',
  weaving: 'Weaving…',
  composing: 'Composing…',
  breathing: 'Thinking…',
  shaping: 'Shaping…'
};

export function ThinkingOrb({
  state = 'working',
  size = 64,
  theme = 'auto',
  speed = 1,
  paused = false,
  color,
  dots = 1,
  dotSize = 1,
  opts: optsOverride,
  frame: customFrame,
  style,
  'aria-label': ariaLabel,
  ...rest
}: ThinkingOrbProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const optsKey = optsOverride ? JSON.stringify(optsOverride) : '';
  const dark = useResolvedDark(theme, ref);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { mode, speed: baseSpeed, opts: presetOpts } = resolvePreset(state, size);
    // \`dots\` rescales every count knob of the resolved preset with the same
    // sqrt-paired scaler the presets themselves use, so density changes keep
    // the mode's balance. resolvePreset caches — never mutate its result.
    let opts = dots !== 1 ? scaleCounts(presetOpts, Math.max(0.1, dots)) : presetOpts;
    if (dotSize !== 1) opts = scaleRadii(opts, Math.max(0.1, dotSize));
    // raw overrides land last, over everything the preset and multipliers set
    if (optsOverride) opts = { ...opts, ...optsOverride };
    const frameFn = customFrame ?? MODE_FRAMES[mode];
    const tint = parseTint(color);
    const effSpeed = baseSpeed * speed;

    const frame = (tSec: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      paintFrame(ctx, frameFn(size, tSec, opts), dark, tint);
    };

    // reduced motion → one static, deterministic frame
    if (reduced) {
      frame(0.6);
      return;
    }

    let raf = 0;
    let running = false;
    const loop = () => {
      frame((performance.now() / 1000) * effSpeed);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || paused) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // draw at least one frame even when paused/offscreen
    frame((performance.now() / 1000) * effSpeed);

    // pause offscreen + on hidden tabs — free when not visible
    let visible = true;
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && document.visibilityState !== 'hidden') start();
            else stop();
          })
        : null;
    io?.observe(canvas);
    const onVis = () => {
      if (document.visibilityState === 'hidden') stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', onVis);
    if (!io) start();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
    // the override object is compared by content, so an inline literal
    // does not restart the loop every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, size, dark, speed, paused, reduced, color, dots, dotSize, optsKey, customFrame]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={ariaLabel ?? LABELS[state]}
      style={{ width: size, height: size, display: 'block', ...style }}
      {...rest}
    />
  );
}


// ─── src/engine/braid.ts ───
// Braid: three strands plait around the sphere — the "weaving" state.
// Each strand runs pole to pole on a helix, and a radial breathing term
// makes them trade places, reading as the over/under of a plait.

import type { Dot, ModeFrame } from './types';
import { fibDir, finalizeFrame, frac, makeProj, radiusScale } from './core';

export const frameBraid: ModeFrame = (size, t, o) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = (size / 2) * 0.76;
  const pt = makeProj(t * 0.4, 0.3, cx, cy, 1);
  const rs = radiusScale(size, o.rsPow ?? 0.6);

  const dots: Dot[] = [];
  const ghostN = o.ghostN ?? 150;
  for (let i = 0; i < ghostN; i++) {
    const d = fibDir(i, ghostN);
    const [px, py, z] = pt(d[0] * R, d[1] * R, d[2] * R);
    const depth = (z / R + 1) / 2;
    dots.push({ x: px, y: py, z, r: 0.8 * rs, white: 0.78, a: 0.1 + 0.22 * depth });
  }

  const strandN = o.strandN ?? 52;
  const turns = o.turns ?? 3;
  for (let s = 0; s < 3; s++) {
    const phase = (s / 3) * 2 * Math.PI;
    for (let i = 0; i < strandN; i++) {
      // u walks pole to pole; the frac() drift slides the whole strand along
      const u = (frac(i / strandN + t * 0.045) * 2 - 1) * 0.96;
      const surf = Math.sqrt(Math.max(0, 1 - u * u));
      const endFade = Math.min(1, (1 - Math.abs(u)) / 0.1);
      const a = u * Math.PI * turns + phase;
      // radial breathing: strands trade places — the over/under of a plait
      const weave = 1 + 0.075 * Math.sin(u * Math.PI * turns * 2 + phase * 2 + t * 0.8);
      const rr = surf * R * weave;
      const [px, py, zr] = pt(Math.cos(a) * rr, u * R * weave, Math.sin(a) * rr);
      const depth = (zr / R + 1) / 2;
      dots.push({
        x: px,
        y: py,
        z: zr,
        r: ((o.rBase ?? 1.2) + (o.rDepth ?? 1.8) * depth) * rs,
        white: 0.55 - 0.45 * depth,
        a: endFade * (0.45 + 0.55 * depth)
      });
    }
  }
  return finalizeFrame(dots, [], o.rMin);
};


// ─── src/engine/core.ts ───
// Shared primitives for the dotted 3D thought-orbs. Ported from inkform
// (PlotterLab's HalftoneSphere lineage): honestly 3D — rotated,
// depth-shaded, z-sorted. Depth is carried by dot size and ink weight
// alone. Plain 2D canvas fills only: no ctx.filter, no SVG filters, so
// every mode renders identically in Chrome, Safari and Firefox.

export interface Dot {
  x: number;
  y: number;
  z: number;
  r: number;
  /** Ink value: 0 = darkest ink on paper. Mirrored on dark themes. */
  white: number;
  a?: number;
}

/** A stroked edge between two projected points (the \`connecting\` web). */
export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Ink value, same convention as \`Dot.white\`. */
  white: number;
  a?: number;
  w: number;
}

/**
 * One rendered instant: a complete, final set of draw instructions.
 * \`dots\` is already z-sorted into draw order and radius-clamped; \`lines\`
 * are drawn first. Nothing here needs further interpretation, which is what
 * makes a frame portable to any 2D renderer.
 */
export interface OrbFrame {
  dots: Dot[];
  lines: Line[];
}

export type Projector = (x: number, y: number, z: number) => [number, number, number];

export function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

export function frac(x: number): number {
  return x - Math.floor(x);
}

/** Value noise on a 2D lattice — smooth, deterministic, cheap. */
export function vnoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let fx = x - xi;
  let fy = y - yi;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hashD(xi, yi);
  const b = hashD(xi + 1, yi);
  const c = hashD(xi, yi + 1);
  const d = hashD(xi + 1, yi + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** Deterministic hash in [0, 1). */
export function hashD(a: number, b: number): number {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

/** Stable directions on a unit sphere (Fibonacci lattice). */
export function fibDir(i: number, n: number): [number, number, number] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (2 * (i + 0.5)) / n;
  const rad = Math.sqrt(1 - y * y);
  const a = i * golden;
  return [rad * Math.cos(a), y, rad * Math.sin(a)];
}

/** Shortest signed angular distance, wrapped to (-π, π]. */
export function angleDelta(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/** Shared spin + tilt + orthographic projection. */
export function makeProj(yaw: number, tilt: number, cx: number, cy: number, scale: number): Projector {
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  const sy = Math.sin(yaw);
  const cyw = Math.cos(yaw);
  return (x, y, z) => {
    const x1 = x * cyw + z * sy;
    const z1 = -x * sy + z * cyw;
    const y1 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    return [cx + x1 * scale, cy - y1 * scale, z2];
  };
}

/** Optional ink tint, resolved to an RGB triple (0–255 each). */
export interface OrbTint {
  r: number;
  g: number;
  b: number;
}

/**
 * Map one ink value to a CSS color. Grayscale by default; with a tint the
 * ink ramp is preserved as a ramp on the tint itself — on dark substrates
 * the tint fades toward black with depth (as the grays do), on light ones
 * it fades toward white — so depth reads identically in color.
 */
function inkColor(w: number, alpha: number, dark: boolean, tint?: OrbTint): string {
  if (!tint) {
    const g = Math.round((dark ? 1 - w : w) * 255);
    return \`rgba(\${g},\${g},\${g},\${alpha})\`;
  }
  const ramp = (c: number) => Math.round(dark ? c * (1 - w) : c + (255 - c) * w);
  return \`rgba(\${ramp(tint.r)},\${ramp(tint.g)},\${ramp(tint.b)},\${alpha})\`;
}

/**
 * Painter: z-sort far→near, matte grayscale dots. On dark substrates the
 * ink value is mirrored (1 - white) so near dots read bright — the same
 * depth language on an inverted substrate.
 */
export function paint(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  dark: boolean,
  rMin = 0.3,
  tint?: OrbTint
): void {
  for (const d of dots) {
    const alpha = d.a ?? 1;
    const w = Math.min(1, Math.max(0, d.white));
    ctx.fillStyle = inkColor(w, alpha, dark, tint);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Stroke pass for edge-based modes. Runs before \`paint\` so nodes sit on top. */
export function paintLines(
  ctx: CanvasRenderingContext2D,
  lines: Line[],
  dark: boolean,
  tint?: OrbTint
): void {
  for (const l of lines) {
    const alpha = l.a ?? 1;
    const w = Math.min(1, Math.max(0, l.white));
    ctx.strokeStyle = inkColor(w, alpha, dark, tint);
    ctx.lineWidth = l.w;
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.stroke();
  }
}

/**
 * Turn raw mode output into a finished frame: drop invisible marks, clamp
 * radii to the mode's floor, and z-sort far→near into draw order.
 *
 * This runs in the GEOMETRY step, not the painter, so a frame is a complete
 * set of draw instructions: every value is final and the array order is the
 * order to draw in. That is what lets the RN and SwiftUI ports share this
 * output verbatim — a port draws the list, it never re-derives anything —
 * and what lets the golden-vector tests compare numbers instead of pixels.
 */
export function finalizeFrame(dots: Dot[], lines: Line[], rMin = 0.3): OrbFrame {
  const visible: Dot[] = [];
  for (const d of dots) {
    if ((d.a ?? 1) < 0.02) continue;
    d.r = Math.max(rMin, d.r);
    visible.push(d);
  }
  visible.sort((a, b) => a.z - b.z);
  return { dots: visible, lines: lines.filter((l) => (l.a ?? 1) >= 0.02) };
}

/** Paint a finished frame. Lines first, so nodes sit on top of their edges. */
export function paintFrame(
  ctx: CanvasRenderingContext2D,
  frame: OrbFrame,
  dark: boolean,
  tint?: OrbTint
): void {
  if (frame.lines.length) paintLines(ctx, frame.lines, dark, tint);
  paint(ctx, frame.dots, dark, 0.3, tint);
}

/**
 * Dot radii were tuned for a 300pt frame; sub-linear scaling keeps small
 * spinners legible. Lower pow = radii shrink less with size.
 */
export function radiusScale(size: number, pow: number): number {
  return (size / 300) ** pow;
}


// ─── src/engine/index.ts ───
// The \`thinking-orbs/engine\` entry point: pure geometry, zero React, zero
// DOM. Import this to drive your own renderer — a Skia canvas in React
// Native, an offscreen canvas in a worker, a server-side rasteriser.
//
// The contract is deliberately small: resolve a (state, size) pair to its
// draw options once, then call the mode's frame function per instant. What
// comes back is a finished, z-sorted list of circles (and, for \`connecting\`,
// line segments) with every value final — draw them in order and you have
// the same picture the React component paints.
//
//   import { resolvePreset } from 'thinking-orbs/engine';
//   import { MODE_FRAMES } from 'thinking-orbs/engine';
//
//   const { mode, speed, opts } = resolvePreset('searching', 64);
//   const { dots, lines } = MODE_FRAMES[mode](64, elapsedSeconds * speed, opts);
//
// Ink convention: \`white\` is the paper-theme ink value in [0,1]; on a dark
// substrate a renderer mirrors it (\`1 - white\`) so near dots read bright.

export { MODE_FRAMES, MODE_DRAWS } from './registry';
export { resolvePreset, STATE_TO_MODE, type ModeKey, type Resolved } from '../presets';
export type { Dot, Line, OrbFrame, ModeFrame, ModeDraw } from './types';
export type { ModeOpts } from './profiles';
export type { OrbState, OrbSize } from '../types';

// Escape hatches for renderers that want the primitives themselves.
export { finalizeFrame, paintFrame, paint, paintLines, radiusScale, makeProj } from './core';


// ─── src/engine/lattice.ts ───
// The sphere-lattice modes: globe (searching), rubik (solving) and
// wave (listening). All draw a lat/long dot field with mode-specific
// motion, then hand off to the shared z-sorted painter.

import type { Dot, ModeFrame } from './types';
import { angleDelta, finalizeFrame, hashD, makeProj, radiusScale } from './core';

// --- the shared solver heartbeat (rubik) ------------------------------
// Rapid eased moves scramble, then replay in reverse (palindrome) so
// everything clicks back to solved, rests, repeats.

interface Move {
  axis: 0 | 1 | 2;
  lo: number;
  hi: number;
  ang: number;
}

function solveCycle(time: number, count: number, slotDur: number, rest: number) {
  const cyc = 2 * count * slotDur + rest;
  const tc = time % cyc;
  const amount = new Array<number>(count).fill(0);
  let active = -1;
  if (tc < 2 * count * slotDur) {
    const slot = Math.floor(tc / slotDur);
    const p = (tc - slot * slotDur) / slotDur;
    const cl = Math.min(1, p / 0.7);
    const ep = 1 - (1 - cl) ** 3; // machine ease-out
    if (slot < count) {
      for (let i = 0; i < slot; i++) amount[i] = 1;
      amount[slot] = ep;
      active = slot;
    } else {
      const u = 2 * count - 1 - slot;
      for (let i = 0; i < u; i++) amount[i] = 1;
      amount[u] = 1 - ep;
      active = u;
    }
  }
  return { amount, active };
}

function applyMoves(
  pt3: [number, number, number],
  moves: Move[],
  sc: { amount: number[]; active: number }
): [number, number, number, boolean] {
  let [x, y, z] = pt3;
  let inActive = false;
  for (let i = 0; i < moves.length; i++) {
    if (sc.amount[i] <= 0) continue;
    const mv = moves[i];
    const coord = mv.axis === 0 ? x : mv.axis === 1 ? y : z;
    if (coord < mv.lo || coord >= mv.hi) continue;
    if (i === sc.active) inActive = true;
    const a = mv.ang * sc.amount[i];
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    if (mv.axis === 0) {
      const y2 = y * ca - z * sa;
      z = y * sa + z * ca;
      y = y2;
    } else if (mv.axis === 1) {
      const x2 = x * ca + z * sa;
      z = -x * sa + z * ca;
      x = x2;
    } else {
      const x2 = x * ca - y * sa;
      y = x * sa + y * ca;
      x = x2;
    }
  }
  return [x, y, z, inActive];
}

function makeMoves(count: number): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < count; i++) {
    const axis = Math.min(2, Math.floor(hashD(i, 2.3) * 3)) as 0 | 1 | 2;
    const lo = -1.0 + 0.5 * Math.min(3, Math.floor(hashD(i, 5.9) * 4));
    const dir = hashD(i, 7.7) < 0.5 ? 1 : -1;
    moves.push({ axis, lo, hi: lo + 0.5, ang: (dir * Math.PI) / 2 });
  }
  return moves;
}

// --- Globe: lat/long field, a scan meridian sweeps — searching --------

export const frameGlobe: ModeFrame = (size, t, o) => {
  const spin = 0.5;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.82;
  const tilt = 0.4 + 0.06 * Math.sin(t * 0.35);
  const pt = makeProj(t * spin, tilt, cx, cy, radius);
  // scan sweeps relative to the spin; scanMul scales that relative rate
  const scan = t * (spin + (1.7 - spin) * (o.scanMul ?? 1));
  const rs = radiusScale(size, o.rsPow ?? 0.6);
  const dimBase = o.dimBase ?? 1;

  const dots: Dot[] = [];
  const latRings = o.latRings ?? 17;
  const lonDensity = o.lonDensity ?? 44;
  for (let li = 0; li <= latRings; li++) {
    const lat = -Math.PI / 2 + (li / latRings) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity));
    for (let lj = 0; lj < lonCount; lj++) {
      const lon = (lj / lonCount) * 2 * Math.PI;
      const [px, py, z] = pt(cosLat * Math.cos(lon), sinLat, cosLat * Math.sin(lon));
      const depth = (z + 1) / 2;
      // the scan: a moving meridian read as a size ripple, not a shine
      const d = angleDelta(lon + t * spin, scan);
      const boost = Math.exp(-(d * d) / 0.18) * Math.max(0, z);
      dots.push({
        x: px,
        y: py,
        z,
        r: ((o.rBase ?? 0.6) + (o.rDepth ?? 1.7) * depth + (o.rBoost ?? 1) * boost) * rs,
        white: (o.inkFar ?? 0.62) - (o.inkSpan ?? 0.54) * depth,
        // dimBase < 1 fades un-scanned dots so the meridian reads clearly
        a: dimBase + (1 - dimBase) * Math.min(1, boost)
      });
    }
  }
  return finalizeFrame(dots, [], o.rMin);
};

// --- Rubik: bands twist in quarter turns, scramble → solve — solving --

export const frameRubik: ModeFrame = (size, t, o) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = (size / 2) * 0.82;
  const pt = makeProj(t * 0.55, 0.35 + 0.1 * Math.sin(t * 0.9), cx, cy, R);
  const rs = radiusScale(size, o.rsPow ?? 0.6);
  const moveCount = o.moveCount ?? 14;
  const moves = makeMoves(moveCount);
  const sc = solveCycle(t, moveCount, 0.42, 1.2);

  const dots: Dot[] = [];
  const latRings = o.latRings ?

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="flex items-center justify-center gap-3 p-12">
  <div class="w-3 h-3 rounded-full bg-violet-500" style="animation: bounce 1.2s ease-in-out 0s infinite"></div>
  <div class="w-3 h-3 rounded-full bg-violet-500" style="animation: bounce 1.2s ease-in-out 0.15s infinite"></div>
  <div class="w-3 h-3 rounded-full bg-violet-500" style="animation: bounce 1.2s ease-in-out 0.3s infinite"></div>
  <div class="w-3 h-3 rounded-full bg-violet-500" style="animation: bounce 1.2s ease-in-out 0.45s infinite"></div>
  <div class="w-3 h-3 rounded-full bg-violet-500" style="animation: bounce 1.2s ease-in-out 0.6s infinite"></div>
  <span class="ml-4 text-zinc-400 text-sm">Thinking...</span>
</div>
<style>@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-12px); opacity: 1; } }</style>
`,
    sourceUrl: `https://www.npmjs.com/package/thinking-orbs`,
    description: `From libraries.dev · npm install thinking-orbs`,
  },
  {
    id: `appica-accordion`,
    name: `Accordion (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── accordion/accordion.tsx ───
'use client'

import * as React from 'react'
import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { cva } from 'class-variance-authority'
import { cn } from '../../internal/utils'

type AccordionVariant = 'default' | 'alt' | 'flush'
type AccordionIcon = 'chevron' | 'plus' | false
type AccordionIconVariant = 'icon' | 'icon-box'
type AccordionIconPosition = 'end' | 'start'

interface AccordionContextValue {
  variant: AccordionVariant
  icon: AccordionIcon
  iconVariant: AccordionIconVariant
  iconPosition: AccordionIconPosition
}

const AccordionContext = React.createContext<AccordionContextValue>({
  variant: 'default',
  icon: 'chevron',
  iconVariant: 'icon',
  iconPosition: 'end',
})

const AccordionItemContext = React.createContext<{ variant: AccordionVariant } | null>(null)

const itemVariants = cva(
  cn(
    'group/accordion-item',
    'has-focus-visible:ring-ring has-focus-visible:ring-3',
    'data-disabled:opacity-disabled data-disabled:pointer-events-none',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-background-subtle border-border-muted',
          'px-5 pb-5 rounded-xl border backdrop-blur-lg',
          'hover:bg-background-muted data-open:bg-background-muted',
          'transition-colors duration-300',
          'hover:border-transparent data-open:border-transparent',
          'motion-reduce:transition-none',
        ),
        alt: cn(
          'bg-background',
          'px-5 pb-5 rounded-xl border border-transparent',
          'hover:border-border data-open:border-border',
          'transition-colors duration-300',
          'motion-reduce:transition-none',
        ),
        flush: 'pb-3.5',
      },
    },
  },
)

const triggerVariants = cva(
  cn(
    'text-foreground-intense flex flex-1 cursor-pointer items-start justify-between gap-3.5',
    'text-lg font-medium outline-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    "[&_svg:not([class*='size-'])]:size-5.5",
    "[&_svg:not([class*='stroke-'])]:stroke-[1.85]",
  ),
  {
    variants: {
      variant: {
        default: '-mx-5 -mb-5 p-5',
        alt: '-mx-5 -mb-5 p-5',
        flush: '-mb-3.5 py-3.5',
      },
    },
  },
)

const iconBoxVariants = cva(
  cn(
    'inline-flex items-center justify-center',
    'size-[1.778em]',
    'rounded-[calc(tan(atan2(var(--radius-sm),2rem))*100%)]',
  ),
  {
    variants: {
      variant: {
        default: 'bg-background border-border border',
        alt: 'bg-background-muted',
        flush: 'bg-background border-border border',
      },
    },
  },
)

interface AccordionProps extends React.ComponentProps<typeof BaseAccordion.Root> {
  /**
   * Surface style applied to every item.
   * @default 'default'
   */
  variant?: AccordionVariant
  /**
   * The open/close indicator, or \`false\` to hide it.
   * @default 'chevron'
   */
  icon?: AccordionIcon
  /**
   * Plain glyph, or wrapped in a tinted tile.
   * @default 'icon'
   */
  iconVariant?: AccordionIconVariant
  /**
   * Place the icon after or before the trigger label.
   * @default 'end'
   */
  iconPosition?: AccordionIconPosition
}

function Accordion({
  variant = 'default',
  icon = 'chevron',
  iconVariant = 'icon',
  iconPosition = 'end',
  className,
  ...props
}: AccordionProps) {
  const ctx = React.useMemo(
    () => ({ variant, icon, iconVariant, iconPosition }),
    [variant, icon, iconVariant, iconPosition],
  )

  return (
    <AccordionContext.Provider value={ctx}>
      <BaseAccordion.Root
        data-slot="accordion"
        className={cn('flex w-full flex-col', variant !== 'flush' && 'gap-1', className)}
        {...props}
      />
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps extends Omit<React.ComponentProps<typeof BaseAccordion.Item>, 'disabled'> {
  /** Override the root's \`variant\` for this item. */
  variant?: AccordionVariant
  /**
   * Lock this item shut and skip it during keyboard navigation.
   * @default false
   */
  disabled?: boolean | undefined
}

function AccordionItem({ className, variant, ...props }: AccordionItemProps) {
  const root = React.useContext(AccordionContext)
  const resolvedVariant = variant ?? root.variant
  const itemCtx = React.useMemo(() => ({ variant: resolvedVariant }), [resolvedVariant])

  return (
    <AccordionItemContext.Provider value={itemCtx}>
      <BaseAccordion.Item
        data-slot="accordion-item"
        className={cn(itemVariants({ variant: resolvedVariant }), className)}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
}

interface AccordionTriggerProps extends React.ComponentProps<typeof BaseAccordion.Trigger> {
  /** Override the root's icon for this trigger. */
  icon?: AccordionIcon
  /** Override the root's icon style. */
  iconVariant?: AccordionIconVariant
  /** Override the root's icon position. */
  iconPosition?: AccordionIconPosition
}

function AccordionTrigger({ className, children, icon, iconVariant, iconPosition, ...props }: AccordionTriggerProps) {
  const root = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)
  const variant = item?.variant ?? root.variant
  const resolvedIcon = icon ?? root.icon
  const resolvedIconVariant = iconVariant ?? root.iconVariant
  const resolvedIconPosition = iconPosition ?? root.iconPosition

  const svgSize =
    resolvedIconVariant === 'icon-box'
      ? resolvedIcon === 'chevron'
        ? 'size-[56%]'
        : 'size-[50%]'
      : resolvedIcon === 'plus'
        ? 'size-[1em]'
        : 'size-[1.12em]'
  let iconNode: React.ReactNode = null
  if (resolvedIcon !== false) {
    const svg = resolvedIcon === 'plus' ? <PlusIcon className={svgSize} /> : <ChevronIcon className={svgSize} />
    const inner =
      resolvedIconVariant === 'icon-box' ? (
        <span data-slot="accordion-trigger-icon-box" className={iconBoxVariants({ variant })}>
          {svg}
        </span>
      ) : (
        svg
      )
    iconNode = <span className="inline-flex h-lh items-center">{inner}</span>
  }

  return (
    <BaseAccordion.Header data-slot="accordion-header" className="flex">
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        className={cn(triggerVariants({ variant }), className)}
        {...props}
      >
        {resolvedIconPosition === 'start' && iconNode}
        <span className="flex flex-1 items-start gap-3.5 text-start">{children}</span>
        {resolvedIconPosition === 'end' && iconNode}
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

type AccordionContentProps = React.ComponentProps<typeof BaseAccordion.Panel>

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const root = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)
  const variant = item?.variant ?? root.variant

  return (
    <BaseAccordion.Panel
      data-slot="accordion-content"
      className={cn(
        'overflow-hidden',
        'h-(--accordion-panel-height)',
        'data-ending-style:h-0 data-starting-style:h-0',
        'transition-[height] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <div className="pt-3">{children}</div>
    </BaseAccordion.Panel>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      data-slot="accordion-icon"
      className={cn(
        'transition-transform duration-300 ease-out motion-reduce:transition-none',
        'group-data-open/accordion-item:rotate-180',
        className,
      )}
    >
      <path d="M14.47 6.97A.75.75 0 0 1 15.53 8.03l-5 5a.75.75 0 0 1-1.061 0l-5-5A.75.75 0 0 1 5.53 6.97l4.47 4.47 4.47-4.47z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      aria-hidden="true"
      data-slot="accordion-icon"
      className={cn(
        'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
        'group-data-open/accordion-item:rotate-180',
        className,
      )}
    >
      <path d="M4.167 10 L15.833 10" />
      <path
        d="M10 4.167 L10 15.833"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-data-open/accordion-item:rotate-90 motion-reduce:transition-none"
      />
    </svg>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
export type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">accordion</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-alert-dialog`,
    name: `Alert Dialog (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── alert-dialog/alert-dialog.tsx ───
import * as React from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { cn } from '../../internal/utils'
import { type ModalContentProps, splitModalProps } from '../../internal/modal'

type AlertDialogProps = React.ComponentProps<typeof BaseAlertDialog.Root>

const AlertDialog = Object.assign(
  function AlertDialog(props: AlertDialogProps) {
    return <BaseAlertDialog.Root {...props} />
  },
  { createHandle: BaseAlertDialog.createHandle },
)

type AlertDialogTriggerProps = React.ComponentProps<typeof BaseAlertDialog.Trigger>

function AlertDialogTrigger({ className, ...props }: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger data-slot="alert-dialog-trigger" className={cn(className)} {...props} />
}

type AlertDialogContentProps = ModalContentProps<
  React.ComponentProps<typeof BaseAlertDialog.Popup>,
  React.ComponentProps<typeof BaseAlertDialog.Portal>,
  React.ComponentProps<typeof BaseAlertDialog.Backdrop>,
  React.ComponentProps<typeof BaseAlertDialog.Viewport>
> & {
  /**
   * Render the dimmed, blurred backdrop behind the popup.
   * @default true
   */
  backdrop?: boolean
  /**
   * Wrap the popup in a translucent glass frame. Needs \`backdrop\`: without one the popup
   * is always a plain solid card.
   * @default true
   */
  frame?: boolean
}

function AlertDialogContent({
  className,
  children,
  backdrop = true,
  frame = true,
  backdropProps,
  viewportProps,
  ...props
}: AlertDialogContentProps) {
  const { portal, popup } = splitModalProps(props)
  const forceBackdrop = backdropProps?.forceRender === true
  // The frame is a rim of blurred page around the popup, so it only reads against the
  // backdrop. Without one it collapses to a plain solid card.
  const showFrame = frame && backdrop
  return (
    <BaseAlertDialog.Portal {...portal}>
      {backdrop && (
        <BaseAlertDialog.Backdrop
          data-slot="alert-dialog-backdrop"
          {...backdropProps}
          className={cn(
            'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
            'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
            backdropProps?.className as string | undefined,
          )}
        />
      )}
      <BaseAlertDialog.Viewport
        data-slot="alert-dialog-viewport"
        {...viewportProps}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4',
          viewportProps?.className as string | undefined,
        )}
      >
        <BaseAlertDialog.Popup
          data-slot="alert-dialog-popup"
          {...(showFrame ? { 'data-frame': '' } : {})}
          className={cn(
            'group/alert-dialog-popup relative flex max-h-full min-h-0 w-100 max-w-full flex-col',
            'rounded-2xl border',
            showFrame
              ? cn(
                  'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm',
                  !forceBackdrop &&
                    'data-nested:border-border-overlay data-nested:bg-background data-nested:p-0 data-nested:shadow-2xl data-nested:backdrop-blur-none',
                )
              : 'bg-background border-border-overlay',
            !showFrame && 'shadow-2xl',
            'isolate transform-gpu outline-none',
            'motion-safe:transition-[opacity,scale] motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          <div
            data-slot="alert-dialog-content"
            className={cn(
              'flex min-h-0 flex-col overflow-hidden not-has-[>[data-slot=alert-dialog-footer]]:pb-6 not-has-[>[data-slot=alert-dialog-header]]:pt-6 [&>[data-slot=alert-dialog-header]+[data-slot=alert-dialog-footer]]:pt-0',
              showFrame &&
                cn(
                  'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
                  !forceBackdrop &&
                    'group-data-nested/alert-dialog-popup:rounded-none group-data-nested/alert-dialog-popup:bg-transparent',
                ),
            )}
          >
            {children}
          </div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  )
}

type AlertDialogHeaderProps = React.ComponentPropsWithoutRef<'div'>

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div data-slot="alert-dialog-header" className={cn('flex shrink-0 flex-col gap-2 p-6', className)} {...props} />
  )
}

type AlertDialogTitleProps = React.ComponentProps<typeof BaseAlertDialog.Title>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <BaseAlertDialog.Title
      data-slot="alert-dialog-title"
      className={cn('text-foreground-intense text-xl font-semibold', className)}
      {...props}
    />
  )
}

type AlertDialogDescriptionProps = React.ComponentProps<typeof BaseAlertDialog.Description>

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <BaseAlertDialog.Description
      data-slot="alert-dialog-description"
      className={cn('text-foreground-muted text-sm', className)}
      {...props}
    />
  )
}

type AlertDialogBodyProps = React.ComponentPropsWithoutRef<'div'>

function AlertDialogBody({ className, ...props }: AlertDialogBodyProps) {
  return <div data-slot="alert-dialog-body" className={cn('min-h-0 flex-1 px-6', className)} {...props} />
}

type AlertDialogFooterProps = React.ComponentPropsWithoutRef<'div'>

function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

type AlertDialogCloseProps = React.ComponentProps<typeof BaseAlertDialog.Close>

function AlertDialogClose({ className, ...props }: AlertDialogCloseProps) {
  return <BaseAlertDialog.Close data-slot="alert-dialog-close" className={cn(className)} {...props} />
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogClose,
}
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogBodyProps,
  AlertDialogFooterProps,
  AlertDialogCloseProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">alert dialog</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-alert`,
    name: `Alert (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── alert/alert.tsx ───
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import { cn } from '../../internal/utils'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { useDismissible } from '../../hooks/use-dismissible'

const alertVariants = cva(
  cn(
    'group/alert relative rounded-xl border p-5 text-foreground backdrop-blur-xl',
    'grid w-full items-start',
    "[grid-template-columns:auto_1fr_auto] [grid-template-areas:'icon_title_close'_'._description_.'_'._actions_actions']",
    '@min-[460px]:data-[layout=inline]:items-center',
    '@min-[460px]:data-[layout=inline]:[grid-template-columns:auto_auto_1fr_auto_auto]',
    "@min-[460px]:data-[layout=inline]:[grid-template-areas:'icon_title_description_actions_close']",
  ),
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        primary: 'bg-primary-subtle border-primary-soft',
        secondary: 'bg-secondary-subtle border-secondary-soft',
        error: 'bg-error-subtle border-error-soft',
        success: 'bg-success-subtle border-success-soft',
        warning: 'bg-warning-subtle border-warning-soft',
        info: 'bg-info-subtle border-info-soft',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>

const alertIconColor: Record<AlertVariant, string> = {
  default: 'text-foreground-intense',
  primary: 'text-primary',
  secondary: 'text-secondary-emphasis',
  error: 'text-error-emphasis',
  success: 'text-success-emphasis',
  warning: 'text-warning-emphasis',
  info: 'text-info-emphasis',
}

const AlertVariantContext = React.createContext<AlertVariant>('default')

const exitDefault = {
  opacity: 0,
  scale: 0.88,
  filter: 'blur(12px)',
  height: 0,
} as const

const exitReduced = { opacity: 0 } as const

const transition = {
  default: { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const },
  height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const, delay: 0.18 },
} as const

type AlertLayout = 'block' | 'inline'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof alertVariants>, 'variant'> {
  /**
   * Color scheme; also drives the \`AlertIcon\` accent.
   * @default 'default'
   */
  variant?: VariantProps<typeof alertVariants>['variant']
  /**
   * Stack the parts (\`block\`) or flow them on one row when wide enough (\`inline\`).
   * @default 'block'
   */
  layout?: AlertLayout
  /**
   * Render a close button that hides the alert (with an exit animation).
   * @default false
   */
  dismissible?: boolean
  /** Controlled visibility. Pair with \`onOpenChange\`. */
  open?: boolean
  /** Called when the alert is dismissed (with \`false\`). */
  onOpenChange?: (open: boolean) => void
  /** Remember the dismissal under this key so the alert stays hidden on return (uncontrolled). */
  persistKey?: string
  /**
   * Which Web Storage backs \`persistKey\`.
   * @default 'local'
   */
  persistStorage?: 'local' | 'session'
  /**
   * Accessible label for the close button.
   * @default 'Dismiss'
   */
  closeLabel?: string
}

function Alert({
  variant,
  layout = 'block',
  dismissible = false,
  open,
  onOpenChange,
  persistKey,
  persistStorage = 'local',
  closeLabel = 'Dismiss',
  role = 'alert',
  className,
  children,
  style,
  ...props
}: AlertProps) {
  const reduced = useReducedMotion()

  const [internalOpen, setInternalOpen] = React.useState(true)
  const persisted = useDismissible(persistKey ?? '', { storage: persistStorage })

  const isControlled = open !== undefined
  const usingPersisted = !isControlled && persistKey != null

  const actualOpen = isControlled ? open : usingPersisted ? persisted.open : internalOpen
  const shouldRender = actualOpen

  const handleDismiss = React.useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false)
      return
    }
    if (usingPersisted) {
      persisted.dismiss()
    } else {
      setInternalOpen(false)
    }
    onOpenChange?.(false)
  }, [isControlled, usingPersisted, persisted, onOpenChange])

  return (
    <AlertVariantContext.Provider value={variant ?? 'default'}>
      <LazyMotion features={domAnimation} strict>
        <AnimatePresence initial={false}>
          {shouldRender && (
            <m.div
              key="alert"
              initial={false}
              exit={reduced ? exitReduced : exitDefault}
              transition={reduced ? { duration: 0 } : transition}
              className="@container overflow-hidden"
            >
              <div
                role={role}
                data-slot="alert"
                data-layout={layout}
                style={style}
                className={cn(alertVariants({ variant }), className)}
                {...props}
              >
                {children}
                {dismissible && (
                  <button
                    type="button"
                    aria-label={closeLabel}
                    data-slot="alert-close"
                    onClick={handleDismiss}
                    className={cn(
                      'text-foreground-muted cursor-pointer rounded-md p-1 transition-colors outline-none [grid-area:close]',
                      'hover:text-foreground-intense',
                      'focus-visible:ring-ring focus-visible:ring-2',
                      'self-start @min-[460px]:group-data-[layout=inline]/alert:self-center',
                      'ms-3 -me-1 -mt-1 @min-[460px]:group-data-[layout=inline]/alert:my-0',
                    )}
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </AlertVariantContext.Provider>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M11.523 3.522c.264-.264.691-.264.955 0s.264.691 0 .955L8.955 8l3.522 3.522c.264.264.264.691 0 .955s-.691.264-.955 0L8 8.955l-3.522 3.522c-.264.264-.691.264-.955 0s-.264-.691 0-.955L7.045 8 3.522 4.478c-.264-.264-.264-.691 0-.955s.691-.264.955 0L8 7.045l3.523-3.522z" />
    </svg>
  )
}

interface AlertIconProps extends React.HTMLAttributes<HTMLSpanElement> {}

function AlertIcon({ className, ...props }: AlertIconProps) {
  const variant = React.useContext(AlertVariantContext)
  return (
    <span
      data-slot="alert-icon"
      className={cn(
        "me-3 flex h-lh shrink-0 items-center [grid-area:icon] [&_svg:not([class*='size-'])]:size-5",
        alertIconColor[variant],
        className,
      )}
      {...props}
    />
  )
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level, so the alert fits the page's heading outline.
   * @default 'h5'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}

function AlertTitle({ className, as: As = 'h5', ...props }: AlertTitleProps) {
  return (
    <As
      data-slot="alert-title"
      className={cn(
        'text-foreground-intense self-center font-semibold [grid-area:title]',
        'text-base @min-[460px]:group-data-[layout=inline]/alert:me-3 @min-[460px]:group-data-[layout=inline]/alert:text-sm',
        className,
      )}
      {...props}
    />
  )
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <p
      data-slot="alert-description"
      className={cn(
        'text-foreground text-sm [grid-area:description]',
        'mt-2 @min-[460px]:group-data-[layout=inline]/alert:mt-0',
        className,
      )}
      {...props}
    />
  )
}

interface AlertActionProps extends React.HTMLAttributes<HTMLDivElement> {}

function AlertAction({ className, ...props }: AlertActionProps) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        'flex justify-end gap-2 [grid-area:actions]',
        'pt-2 @min-[460px]:group-data-[layout=inline]/alert:ms-3 @min-[460px]:group-data-[layout=inline]/alert:pt-0',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertIcon, AlertTitle, AlertDescription, AlertAction }
export type { AlertProps, AlertIconProps, AlertTitleProps, AlertDescriptionProps, AlertActionProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">alert</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-autocomplete`,
    name: `Autocomplete (Appica)`,
    category: `Components`,
    tags: [`autocomplete`, `appica`],
    code: `// ─── autocomplete/autocomplete.tsx ───
'use client'

import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { inputVariants } from '../input/input-variants'

type AutocompleteSize = 'sm' | 'md' | 'lg'
type AutocompleteVariant = 'outline' | 'soft'

interface AutocompleteContextValue {
  size: AutocompleteSize
  variant: AutocompleteVariant
  clearable: boolean
  icon: boolean
  grid: boolean
}

const AutocompleteContext = React.createContext<AutocompleteContextValue | null>(null)

function useAutocompleteContext() {
  const ctx = React.useContext(AutocompleteContext)
  if (!ctx) {
    throw new Error('Autocomplete sub-components must be rendered inside <Autocomplete>')
  }
  return ctx
}

type BaseAutocompleteRootProps = React.ComponentProps<typeof BaseAutocomplete.Root>

interface AutocompleteProps extends BaseAutocompleteRootProps {
  /**
   * Input height, popup radius, and item sizing.
   * @default 'md'
   */
  size?: AutocompleteSize
  /**
   * Input appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: AutocompleteVariant
  /**
   * Render a clear button inside the input when a value is present.
   * @default false
   */
  clearable?: boolean
  /**
   * Render a chevron button that toggles the popup.
   * @default false
   */
  icon?: boolean
}

function Autocomplete({
  size = 'md',
  variant = 'outline',
  clearable = false,
  icon = false,
  grid = false,
  children,
  ...rest
}: AutocompleteProps) {
  const ctx = React.useMemo<AutocompleteContextValue>(
    () => ({ size, variant, clearable, icon, grid }),
    [size, variant, clearable, icon, grid],
  )
  return (
    <AutocompleteContext.Provider value={ctx}>
      <BaseAutocomplete.Root grid={grid} {...rest}>
        {children}
      </BaseAutocomplete.Root>
    </AutocompleteContext.Provider>
  )
}

const ICON_SIZE: Record<AutocompleteSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

interface AutocompleteInputProps extends Omit<React.ComponentProps<typeof BaseAutocomplete.Input>, 'size'> {
  /** Adornment rendered before the field, inside the input frame. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, inside the input frame. */
  endSlot?: React.ReactNode
}

function AutocompleteInput({ className, startSlot, endSlot, placeholder, disabled, ...props }: AutocompleteInputProps) {
  const { size, variant, clearable, icon } = useAutocompleteContext()

  return (
    <BaseAutocomplete.InputGroup
      data-slot="autocomplete-input"
      className={cn(inputVariants({ variant, size, state: 'within' }), className)}
    >
      {startSlot && (
        <div data-slot="autocomplete-input-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      )}
      <BaseAutocomplete.Input
        data-slot="autocomplete-input-field"
        placeholder={placeholder ?? ' '}
        disabled={disabled}
        className="peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        {...props}
      />
      {clearable && <AutocompleteClearButton disabled={disabled} />}
      {endSlot && (
        <div data-slot="autocomplete-input-end" className="shrink-0">
          {endSlot}
        </div>
      )}
      {icon && <AutocompleteIconButton disabled={disabled} />}
    </BaseAutocomplete.InputGroup>
  )
}

function AutocompleteClearButton({ disabled }: { disabled?: boolean }) {
  return (
    <BaseAutocomplete.Clear
      data-slot="autocomplete-clear"
      aria-label="Clear selection"
      disabled={disabled}
      className="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed motion-reduce:transition-none"
    >
      <ClearIcon className="size-[1em]" />
    </BaseAutocomplete.Clear>
  )
}

function AutocompleteIconButton({ disabled }: { disabled?: boolean }) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Trigger
      data-slot="autocomplete-icon"
      tabIndex={-1}
      aria-label="Toggle popup"
      disabled={disabled}
      className="group/autocomplete-icon text-foreground -me-1 shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
    >
      <ChevronDownIcon
        className={cn(
          ICON_SIZE[size],
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/autocomplete-icon:rotate-180',
        )}
      />
    </BaseAutocomplete.Trigger>
  )
}

type AutocompleteTriggerProps = React.ComponentProps<typeof BaseAutocomplete.Trigger>

function AutocompleteTrigger({ className, ...props }: AutocompleteTriggerProps) {
  return (
    <BaseAutocomplete.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        'cursor-pointer outline-none',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

type AutocompleteValueProps = React.ComponentProps<typeof BaseAutocomplete.Value>

function AutocompleteValue(props: AutocompleteValueProps) {
  return <BaseAutocomplete.Value {...props} />
}

const POPUP_RADIUS: Record<AutocompleteSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type AutocompleteContentProps = React.ComponentProps<typeof BaseAutocomplete.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseAutocomplete.Positioner>,
    React.ComponentProps<typeof BaseAutocomplete.Portal>
  >

function AutocompleteContent({ className, children, ...props }: AutocompleteContentProps) {
  const { size } = useAutocompleteContext()
  const { positioner, portal, popup } = splitFloatingProps(props)

  return (
    <BaseAutocomplete.Portal {...portal}>
      <BaseAutocomplete.Positioner
        sideOffset={6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseAutocomplete.Popup
          data-slot="autocomplete-content"
          className={cn(
            'group/autocomplete-content bg-background border-border-overlay flex flex-col border py-2 shadow-2xl outline-none has-data-empty:py-0',
            POPUP_RADIUS[size],
            'w-(--anchor-width) min-w-36',
            'max-h-(--available-height) overflow-hidden',
            'origin-(--transform-origin)',
            'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          {children}
        </BaseAutocomplete.Popup>
      </BaseAutocomplete.Positioner>
    </BaseAutocomplete.Portal>
  )
}

interface AutocompleteListProps<T = any> extends Omit<React.ComponentProps<typeof BaseAutocomplete.List>, 'children'> {
  /** Items per row in grid mode (defaults to 2 when \`grid\` is set). */
  cols?: number
  /** A render function over the filtered items, or static \`AutocompleteItem\`s. */
  children?: React.ReactNode | ((item: T, index: number) => React.ReactNode)
}

const LIST_CLASSNAME = 'flex flex-col gap-0.5 px-2 min-h-0 flex-1 overflow-y-auto overscroll-contain'

function cellKey(item: unknown, fallback: number): React.Key {
  if (item == null) return fallback
  if (typeof item === 'object') {
    const rec = item as Record<string, unknown>
    const candidate = rec.value ?? rec.id ?? rec.key
    if (typeof candidate === 'string' || typeof candidate === 'number') return candidate
    return fallback
  }
  return item as React.Key
}

function AutocompleteList<T = any>({ className, cols, children, ...props }: AutocompleteListProps<T>) {
  const { grid } = useAutocompleteContext()
  const effectiveCols = cols ?? (grid ? 2 : undefined)
  if (effectiveCols && effectiveCols > 1 && typeof children === 'function') {
    return (
      <BaseAutocomplete.List data-slot="autocomplete-list" className={cn(LIST_CLASSNAME, className)} {...props}>
        <AutocompleteGridRows cols={effectiveCols} render={children} />
      </BaseAutocomplete.List>
    )
  }
  return (
    <BaseAutocomplete.List data-slot="autocomplete-list" className={cn(LIST_CLASSNAME, className)} {...props}>
      {children as React.ComponentProps<typeof BaseAutocomplete.List>['children']}
    </BaseAutocomplete.List>
  )
}

function AutocompleteGridRows({
  cols,
  render,
}: {
  cols: number
  render: (item: any, index: number) => React.ReactNode
}) {
  const filtered = BaseAutocomplete.useFilteredItems<unknown>()
  const rows = React.useMemo(() => {
    const out: unknown[][] = []
    for (let i = 0; i < filtered.length; i += cols) out.push(filtered.slice(i, i + cols))
    return out
  }, [filtered, cols])
  return (
    <>
      {rows.map((row, rowIndex) => (
        <AutocompleteRow key={\`row-\${cellKey(row[0], rowIndex)}\`}>
          {row.map((item, colIndex) => {
            const globalIndex = rowIndex * cols + colIndex
            return <React.Fragment key={cellKey(item, globalIndex)}>{render(item, globalIndex)}</React.Fragment>
          })}
        </AutocompleteRow>
      ))}
    </>
  )
}

interface AutocompleteRowProps extends React.ComponentProps<typeof BaseAutocomplete.Row> {}

function AutocompleteRow({ className, ...props }: AutocompleteRowProps) {
  return (
    <BaseAutocomplete.Row
      data-slot="autocomplete-row"
      className={cn('flex w-full items-stretch gap-0.5', className)}
      {...props}
    />
  )
}

const ITEM_SIZE: Record<AutocompleteSize, string> = {
  sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
  md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
}

const ITEM_TEXT_SIZE: Record<AutocompleteSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

interface AutocompleteItemProps extends React.ComponentProps<typeof BaseAutocomplete.Item> {}

function AutocompleteItem({ className, children, ...props }: AutocompleteItemProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Item
      data-slot="autocomplete-item"
      className={cn(
        'text-foreground relative isolate flex w-full cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
        'active:translate-y-px active:scale-[0.98]',
        'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
        'motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
        'motion-safe:active:duration-100 motion-safe:active:ease-in-out',
        'motion-safe:before:transition-opacity motion-safe:before:duration-200 motion-safe:before:ease-out',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none',
        ITEM_SIZE[size],
        className,
      )}
      {...props}
    >
      <span className={cn('flex items-center text-start', ITEM_TEXT_SIZE[size])}>{children}</span>
    </BaseAutocomplete.Item>
  )
}

const EMPTY_SIZE: Record<AutocompleteSize, string> = {
  sm: 'px-2.5 py-2 text-xs',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-3.5 py-3 text-base',
}

interface AutocompleteEmptyProps extends React.ComponentProps<typeof BaseAutocomplete.Empty> {}

function AutocompleteEmpty({ className, ...props }: AutocompleteEmptyProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Empty
      data-slot="autocomplete-empty"
      className={cn(
        'text-foreground-muted hidden text-center group-data-empty/autocomplete-content:block',
        EMPTY_SIZE[size],
        className,
      )}
      {...props}
    />
  )
}

type AutocompleteStatusProps = React.ComponentProps<typeof BaseAutocomplete.Status>

function AutocompleteStatus({ className, ...props }: AutocompleteStatusProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Status
      data-slot="autocomplete-status"
      className={cn('text-foreground-muted text-center', EMPTY_SIZE[size], className)}
      {...props}
    />
  )
}

type AutocompleteGroupProps = React.ComponentProps<typeof BaseAutocomplete.Group>

function AutocompleteGroup(props: AutocompleteGroupProps) {
  return <BaseAutocomplete.Group data-slot="autocomplete-group" {...props} />
}

const GROUP_LABEL_SIZE: Record<AutocompleteSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

type AutocompleteLabelProps = React.ComponentProps<typeof BaseAutocomplete.GroupLabel>

function AutocompleteLabel({ className, ...props }: AutocompleteLabelProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.GroupLabel
      data-slot="autocomplete-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type AutocompleteCollectionProps = React.ComponentProps<typeof BaseAutocomplete.Collection>

function AutocompleteCollection(props: AutocompleteCollectionProps) {
  return <BaseAutocomplete.Collection {...props} />
}

type AutocompleteSeparatorProps = React.ComponentProps<typeof BaseAutocomplete.Separator>

function AutocompleteSeparator({ className, ...props }: AutocompleteSeparatorProps) {
  return (
    <BaseAutocomplete.Separator
      data-slot="autocomplete-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z" />
    </svg>
  )
}

function ClearIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

export {
  Autocomplete,
  AutocompleteInput,
  AutocompleteTrigger,
  AutocompleteValue,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteEmpty,
  AutocompleteStatus,
  AutocompleteGroup,
  AutocompleteLabel,
  AutocompleteCollection,
  AutocompleteSeparator,
}
export type {
  AutocompleteProps,
  AutocompleteInputProps,
  AutocompleteTriggerProps,
  AutocompleteValueProps,
  AutocompleteContentProps,
  AutocompleteListProps,
  AutocompleteItemProps,
  AutocompleteEmptyProps,
  AutocompleteStatusProps,
  AutocompleteGroupProps,
  AutocompleteLabelProps,
  AutocompleteCollectionProps,
  AutocompleteSeparatorProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">autocomplete</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-avatar`,
    name: `Avatar (Appica)`,
    category: `Badges`,
    tags: [`badge`, `appica`],
    code: `// ─── avatar/avatar.tsx ───
import * as React from 'react'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const avatarVariants = cva(
  "relative flex size-[1em] shrink-0 items-center justify-center bg-background-strong text-center font-medium text-foreground-emphasis [&_svg:not([class*='size-'])]:size-[0.5em]",
  {
    variants: {
      size: {
        '2xs': 'text-[1.25rem]',
        xs: 'text-[1.5rem]',
        sm: 'text-[2rem]',
        md: 'text-[2.5rem]',
        lg: 'text-[3rem]',
        xl: 'text-[4rem]',
        '2xl': 'text-[5rem]',
      },
      shape: {
        rounded: 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]',
        circle: 'rounded-full',
      },
    },
  },
)

type AvatarPresetSize = NonNullable<VariantProps<typeof avatarVariants>['size']>
type AvatarShape = NonNullable<VariantProps<typeof avatarVariants>['shape']>

interface AvatarProps extends Omit<React.ComponentProps<typeof BaseAvatar.Root>, 'size'> {
  /**
   * Full circle or rounded square.
   * @default 'circle'
   */
  shape?: AvatarShape
  /**
   * A preset scale, or a pixel number for an exact size.
   * @default 'md'
   */
  size?: AvatarPresetSize | number
}

function Avatar({ className, style, size = 'md', shape = 'circle', ...props }: AvatarProps) {
  const isNumeric = typeof size === 'number'

  const variantClass = avatarVariants({
    shape,
    size: isNumeric ? undefined : size,
  })

  const numericStyle = isNumeric ? { fontSize: \`\${size}px\` } : undefined

  return (
    <BaseAvatar.Root
      data-slot="avatar"
      className={cn(variantClass, className)}
      style={{ ...numericStyle, ...style }}
      {...props}
    />
  )
}

type AvatarImageProps = React.ComponentProps<typeof BaseAvatar.Image>

function AvatarImage({ className, render, src, alt, ...props }: AvatarImageProps) {
  const lifted = React.isValidElement<{ src?: string; alt?: string }>(render) && render.props ? render.props : undefined

  return (
    <BaseAvatar.Image
      data-slot="avatar-image"
      className={cn('size-full rounded-[inherit] object-cover', className)}
      src={src ?? lifted?.src}
      alt={alt ?? lifted?.alt}
      render={render}
      {...props}
    />
  )
}

type AvatarFallbackProps = React.ComponentProps<typeof BaseAvatar.Fallback>

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <BaseAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-[inherit] text-[0.4em] leading-none uppercase has-[svg]:text-[1em]',
        className,
      )}
      {...props}
    />
  )
}

interface AvatarBadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  /**
   * Add a pulsing ping behind the dot (skipped under reduced motion).
   * @default false
   */
  animate?: boolean
}

function AvatarBadge({ animate = false, className, ...props }: AvatarBadgeProps) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'bg-background text-success-emphasis absolute inset-e-0 bottom-0 z-1 flex size-[30%] items-center justify-center rounded-full',
        className,
      )}
      {...props}
    >
      <span className="size-[66%] rounded-full bg-current" />
      {animate && (
        <span className="animate-ping-paced absolute h-full w-full rounded-full bg-current opacity-50 motion-reduce:hidden" />
      )}
    </span>
  )
}

interface AvatarGroupProps extends React.ComponentPropsWithoutRef<'div'>, Pick<AvatarProps, 'size' | 'shape'> {
  /**
   * Stack the avatars in a row or a column.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
}

function AvatarGroup({ className, size, shape, orientation = 'horizontal', children, ...props }: AvatarGroupProps) {
  const horizontal = orientation === 'horizontal'

  const decorated = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== Avatar) return child
    const childProps = child.props as AvatarProps
    return React.cloneElement(child, {
      size: childProps.size ?? size,
      shape: childProps.shape ?? shape,
    } as Partial<AvatarProps>)
  })

  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'isolate flex',
        horizontal ? 'space-x-[-0.2em]' : 'flex-col space-y-[-0.2em]',
        '*:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-[calc(1em/12)]',
        className,
      )}
      {...props}
    >
      {decorated}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup }
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps, AvatarBadgeProps, AvatarGroupProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">avatar</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-background-pattern`,
    name: `Background Pattern (Appica)`,
    category: `Backgrounds`,
    tags: [`background`, `appica`],
    code: `// ─── background-pattern/background-pattern-interactive.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { PatternLayer, patternSpotlight, type BackgroundPatternVariant } from './background-pattern-shared'

interface BackgroundPatternInteractiveProps {
  variant: BackgroundPatternVariant
  persistent?: boolean
  track?: 'self' | 'window'
}

const SPOTLIGHT =
  'radial-gradient(circle var(--pattern-highlight) at var(--pattern-x, 50%) var(--pattern-y, 50%), #000 0%, #000 5%, 35%, transparent 100%)'

const FADE_DURATION = 1200

function BackgroundPatternInteractive({
  variant,
  persistent: persistentProp = false,
  track = 'self',
}: BackgroundPatternInteractiveProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const reducedMotion = useReducedMotion()
  const persistent = persistentProp || reducedMotion

  React.useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return

    const target: EventTarget = track === 'window' ? window : host

    let frame = 0
    let clientX = 0
    let clientY = 0

    const flush = () => {
      frame = 0
      const rect = host.getBoundingClientRect()
      el.style.setProperty('--pattern-x', \`\${clientX - rect.left}px\`)
      el.style.setProperty('--pattern-y', \`\${clientY - rect.top}px\`)
    }

    const fade =
      !persistent && typeof el.animate === 'function'
        ? el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: FADE_DURATION,
            easing: 'ease-out',
            fill: 'forwards',
          })
        : null
    fade?.finish()

    const handleMove = (event: PointerEvent) => {
      clientX = event.clientX
      clientY = event.clientY
      if (!frame) frame = requestAnimationFrame(flush)
      if (fade) {
        fade.currentTime = 0
        fade.play()
      }
    }

    target.addEventListener('pointermove', handleMove as EventListener, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      fade?.cancel()
      target.removeEventListener('pointermove', handleMove as EventListener)
    }
  }, [persistent, track])

  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="background-pattern-highlight"
      data-persistent={persistent ? '' : undefined}
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 text-(--pattern-color)',
        persistent ? 'opacity-100' : 'opacity-0',
      )}
      style={{ WebkitMaskImage: SPOTLIGHT, maskImage: SPOTLIGHT }}
    >
      <PatternLayer variant={variant} className={patternSpotlight(variant)} />
    </div>
  )
}

export { BackgroundPatternInteractive }


// ─── background-pattern/background-pattern-shared.tsx ───
import { cn } from '../../internal/utils'

type BackgroundPatternVariant = 'dots' | 'grid' | 'dashed-grid' | 'hexagons'

interface MaskSpec {
  maskImage: string
  maskSize?: string
  maskRepeat?: string
  cell: number
  tint: string
  spotlight: string
  className?: string
}

const CELL = 'var(--pattern-cell) var(--pattern-cell)'

function svgMask(body: string, width = 12, height = width) {
  const svg = \`<svg xmlns='http://www.w3.org/2000/svg' width='\${width}' height='\${height}' viewBox='0 0 \${width} \${height}'>\${body}</svg>\`
  return \`url("data:image/svg+xml,\${encodeURIComponent(svg)}")\`
}

const PATTERN_MASKS: Record<BackgroundPatternVariant, MaskSpec> = {
  dots: {
    maskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1.5px)',
    cell: 14,
    tint: 'bg-current/12',
    spotlight: 'bg-current/58 dark:bg-current/64',
  },
  grid: {
    maskImage:
      'linear-gradient(to right, #000 0 1px, transparent 1px), linear-gradient(to bottom, #000 0 1px, transparent 1px)',
    cell: 28,
    tint: 'bg-current/7',
    spotlight: 'bg-current/28 dark:bg-current/34',
  },
  'dashed-grid': {
    maskImage: svgMask(\`<path d='M0 0H12 M0 0V12' stroke='#000' stroke-width='1' stroke-dasharray='2 2'/>\`),
    cell: 28,
    tint: 'bg-current/11',
    spotlight: 'bg-current/40 dark:bg-current/44',
  },
  hexagons: {
    maskImage: svgMask(
      \`<path d='M0 10L8.660254 5 17.320508 10 17.320508 20 8.660254 25 0 20Z M8.660254 0V5 M8.660254 25V30' fill='none' stroke='#000' stroke-width='0.5'/>\`,
      17.320508,
      30,
    ),
    maskSize: 'var(--pattern-cell) calc(var(--pattern-cell) * 1.7320508)',
    cell: 40,
    tint: 'bg-current/7',
    spotlight: 'bg-current/28 dark:bg-current/34',
  },
}

function patternCell(variant: BackgroundPatternVariant) {
  return PATTERN_MASKS[variant].cell
}

function patternTint(variant: BackgroundPatternVariant) {
  return PATTERN_MASKS[variant].tint
}

function patternSpotlight(variant: BackgroundPatternVariant) {
  return PATTERN_MASKS[variant].spotlight
}

interface PatternLayerProps {
  variant: BackgroundPatternVariant
  className?: string
}

function PatternLayer({ variant, className }: PatternLayerProps) {
  const spec = PATTERN_MASKS[variant]
  const maskImage = spec.maskImage
  const maskSize = spec.maskSize ?? CELL
  const maskRepeat = spec.maskRepeat ?? 'repeat'

  return (
    <div
      aria-hidden
      data-slot="background-pattern-layer"
      className={cn('pointer-events-none absolute inset-0', spec.className, className)}
      style={{
        WebkitMaskImage: maskImage,
        maskImage,
        WebkitMaskSize: maskSize,
        maskSize,
        WebkitMaskRepeat: maskRepeat,
        maskRepeat,
      }}
    />
  )
}

export { PatternLayer, patternCell, patternTint, patternSpotlight }
export type { BackgroundPatternVariant }


// ─── background-pattern/background-pattern.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'
import { PatternLayer, patternCell, patternTint, type BackgroundPatternVariant } from './background-pattern-shared'
import { BackgroundPatternInteractive } from './background-pattern-interactive'

type SpotlightConfig = { size?: number | string; persistent?: boolean }

interface BackgroundPatternProps extends React.ComponentProps<'div'> {
  /**
   * Pattern texture painted behind the content.
   * @default 'dots'
   */
  variant?: BackgroundPatternVariant
  /**
   * Cursor-following highlight. \`true\` for a 200px fading highlight; a number/length sizes it; an object with
   * \`persistent: true\` keeps it always on.
   * @default false
   */
  spotlight?: boolean | number | string | SpotlightConfig
  /** Cell size in px; overrides the per-variant default (dots 14, grid/dashed-grid 28, hexagons 40). */
  cellSize?: number
  /**
   * Where the spotlight reads pointer movement. \`'self'\` tracks over this element; \`'window'\` tracks anywhere - for a
   * pattern positioned behind unrelated content.
   * @default 'self'
   */
  track?: 'self' | 'window'
}

function resolveSpotlight(
  spotlight: BackgroundPatternProps['spotlight'],
): { size?: number | string; persistent: boolean } | null {
  if (!spotlight) return null
  if (spotlight === true) return { persistent: false }
  if (typeof spotlight === 'object') return { size: spotlight.size, persistent: spotlight.persistent ?? false }
  return { size: spotlight, persistent: false }
}

function BackgroundPattern({
  variant = 'dots',
  spotlight = false,
  cellSize,
  track = 'self',
  className,
  style,
  children,
  ...props
}: BackgroundPatternProps) {
  const spot = resolveSpotlight(spotlight)
  const cssVars = {
    '--pattern-cell': \`\${cellSize ?? patternCell(variant)}px\`,
    ...(spot?.size != null && {
      '--spotlight-size': typeof spot.size === 'number' ? \`\${spot.size}px\` : spot.size,
    }),
  } as React.CSSProperties

  return (
    <div
      data-slot="background-pattern"
      className={cn(
        'relative isolate [--pattern-color:var(--color-border-intense)] [--pattern-highlight:var(--spotlight-size)] [--spotlight-size:200px]',
        className,
      )}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      <PatternLayer variant={variant} className={cn('-z-10 text-(--pattern-color)', patternTint(variant))} />
      {spot ? <BackgroundPatternInteractive variant={variant} persistent={spot.persistent} track={track} /> : null}
      {children}
    </div>
  )
}

export { BackgroundPattern }
export type { BackgroundPatternProps }


// ─── background-pattern/index.ts ───
export * from './background-pattern'
export { patternCell } from './background-pattern-shared'
export type { BackgroundPatternVariant } from './background-pattern-shared'
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">background pattern</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-badge`,
    name: `Badge (Appica)`,
    category: `Badges`,
    tags: [`badge`, `appica`],
    code: `// ─── badge/badge.tsx ───
'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, focusableProps } from '../../internal/utils'

const backgroundLayer = [
  'before:pointer-events-none',
  'before:absolute',
  'before:inset-0',
  'before:-z-1',
  'before:rounded-[inherit]',
  '[a,button]:before:transition-[opacity,background-color,border-color]',
  '[a,button]:before:duration-250',
  'motion-reduce:[a,button]:before:transition-none',
]

const badgeVariants = cva(
  'relative isolate inline-flex shrink-0 items-center justify-center rounded-full whitespace-nowrap outline-offset-1 select-none [&_svg]:shrink-0 [a,button]:transform-gpu [a,button]:cursor-pointer [a,button]:transition [a,button]:duration-250 [a,button]:ease-[cubic-bezier(0.175,0.885,0.32,1.5)] [a,button]:not-data-popup-open:active:translate-y-px [a,button]:not-data-popup-open:active:scale-[0.97] [a,button]:not-data-popup-open:active:duration-100 [a,button]:not-data-popup-open:active:ease-in-out motion-reduce:[a,button]:transition-none',
  {
    variants: {
      variant: {
        primary: cn(
          backgroundLayer,
          'bg-primary text-primary-foreground outline-ring-primary [a,button]:before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--primary)_0%,var(--primary-muted)_75%)] [a,button]:before:opacity-0',
          '[a,button]:hover:before:opacity-100',
          '[a,button]:data-pressed:before:opacity-100',
          '[a,button]:data-popup-open:before:opacity-100',
        ),
        'primary-outline': cn(
          backgroundLayer,
          'text-primary before:border before:border-primary outline-ring-primary',
          '[a,button]:hover:before:bg-primary [a,button]:hover:text-primary-foreground',
          '[a,button]:data-pressed:before:bg-primary [a,button]:data-pressed:text-primary-foreground',
          '[a,button]:data-popup-open:before:bg-primary [a,button]:data-popup-open:text-primary-foreground',
        ),
        secondary: cn(
          backgroundLayer,
          'bg-secondary-muted text-secondary-foreground outline-ring-secondary [a,button]:before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--secondary)_0%,var(--secondary-muted)_95%)] [a,button]:before:opacity-0',
          '[a,button]:hover:before:opacity-100',
          '[a,button]:data-pressed:before:opacity-100',
          '[a,button]:data-popup-open:before:opacity-100',
        ),
        soft: cn(
          backgroundLayer,
          'text-foreground-intense before:bg-background-muted before:backdrop-blur-md [a,button]:before:border [a,button]:before:border-transparent outline-ring',
          'data-[slot=breadcrumb-link]:not-data-active:text-foreground-muted data-[slot=breadcrumb-link]:hover:text-foreground-intense',
          '[a,button]:hover:before:bg-background-subtle [a,button]:hover:before:border-border',
          '[a,button]:data-pressed:before:bg-background-subtle [a,button]:data-pressed:before:border-border',
          '[a,button]:data-popup-open:before:bg-background-subtle [a,button]:data-popup-open:before:border-border',
          'data-active:before:bg-background-subtle data-active:border data-active:before:border-border',
        ),
        outline: cn(
          backgroundLayer,
          'bg-background text-foreground-intense before:bg-background before:border-border before:border outline-ring',
          'data-[slot=breadcrumb-link]:not-data-active:text-foreground-muted data-[slot=breadcrumb-link]:hover:text-foreground-intense',
          '[a,button]:hover:before:bg-background-subtle [a,button]:hover:before:border-border-strong',
          '[a,button]:data-pressed:before:bg-background-subtle [a,button]:data-pressed:before:border-border-strong',
          '[a,button]:data-popup-open:before:bg-background-subtle [a,button]:data-popup-open:before:border-border-strong',
          'data-active:before:bg-background-subtle data-active:before:border-border-strong',
        ),
        error: cn(
          backgroundLayer,
          'bg-error-muted text-error-foreground outline-ring-error [a,button]:before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--error-muted)_0%,rgba(255,255,255,.5)_95%)] [a,button]:before:opacity-0',
          '[a,button]:hover:before:opacity-100',
          '[a,button]:data-pressed:before:opacity-100',
          '[a,button]:data-popup-open:before:opacity-100',
        ),
        success: cn(
          backgroundLayer,
          'bg-success-muted text-success-foreground outline-ring-success [a,button]:before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--success-muted)_0%,rgba(255,255,255,.5)_95%)] [a,button]:before:opacity-0',
          '[a,button]:hover:before:opacity-100',
          '[a,button]:data-pressed:before:opacity-100',
          '[a,button]:data-popup-open:before:opacity-100',
        ),
        warning: cn(
          backgroundLayer,
          'bg-warning-muted text-warning-foreground outline-ring-warning [a,button]:before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--warning-muted)_0%,rgba(255,255,255,.5)_95%)] [a,button]:before:opacity-0',
          '[a,button]:hover:before:opacity-100',
          '[a,button]:data-pressed:before:opacity-100',
          '[a,button]:data-popup-open:before:opacity-100',
        ),
        info: cn(
          backgroundLayer,
          'bg-info-muted text-info-foreground outline-ring-info [a,button]:before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--info-muted)_0%,rgba(255,255,255,.5)_95%)] [a,button]:before:opacity-0',
          '[a,button]:hover:before:opacity-100',
          '[a,button]:data-pressed:before:opacity-100',
          '[a,button]:data-popup-open:before:opacity-100',
        ),
        light: cn(
          backgroundLayer,
          'text-white before:bg-white/10 before:border-white/10 before:border before:backdrop-blur-md outline-ring-light',
          '[a,button]:hover:before:bg-white/15 [a,button]:hover:before:border-white/15',
          '[a,button]:data-pressed:before:bg-white/15 [a,button]:data-pressed:before:border-white/15',
          '[a,button]:data-popup-open:before:bg-white/15 [a,button]:data-popup-open:before:border-white/15',
          'data-active:before:bg-white/15 data-active:before:border-white/15',
        ),
      },
      size: {
        xs: "h-4 w-fit gap-0.5 px-1.5 text-[.625rem] has-data-[icon=end]:pe-1.25 has-data-[icon=start]:ps-1.25 [&_svg:not([class*='size-'])]:size-2.5 [&_svg:not([class*='stroke-'])]:stroke-2",
        sm: "h-5 w-fit gap-0.5 px-2 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
        md: "h-6 w-fit gap-0.75 px-2.5 text-xs has-data-[icon=end]:pe-1.75 has-data-[icon=start]:ps-1.75 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        lg: "h-7 w-fit gap-1 px-3 text-sm has-data-[icon=end]:pe-2.25 has-data-[icon=start]:ps-2.25 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        'icon-sm': "h-5 w-5 [&_svg:not([class*='size-'])]:size-3 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
        'icon-md': "h-6 w-6 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        'icon-lg': "h-7 w-7 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type BadgeState = {
  variant: VariantProps<typeof badgeVariants>['variant']
  size: VariantProps<typeof badgeVariants>['size']
}

interface BadgeProps
  extends useRender.ComponentProps<'span', BadgeState>, Omit<VariantProps<typeof badgeVariants>, 'variant' | 'size'> {
  /**
   * Color scheme.
   * @default 'primary'
   */
  variant?: VariantProps<typeof badgeVariants>['variant']
  /**
   * Scale. The \`icon-*\` sizes render a square badge for a lone icon.
   * @default 'md'
   */
  size?: VariantProps<typeof badgeVariants>['size']
}

function Badge({ className, variant, size, render, ...props }: BadgeProps) {
  const renderedProps = React.isValidElement<Record<string, unknown>>(render) ? render.props : undefined
  const interactive =
    (React.isValidElement(render) && (render.type === 'a' || render.type === 'button')) ||
    props.onClick != null ||
    renderedProps?.href != null ||
    renderedProps?.onClick != null ||
    renderedProps?.tabIndex != null
  return useRender({
    defaultTagName: 'span',
    render,
    state: { variant, size } satisfies BadgeState,
    props: mergeProps<'span'>(
      {
        'data-slot': 'badge',
        ...(interactive ? focusableProps() : {}),
        className: cn(badgeVariants({ variant, size }), className),
      } as unknown as React.HTMLAttributes<HTMLSpanElement>,
      props,
    ),
  })
}

export { Badge }
export type { BadgeProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">badge</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-border-beam`,
    name: `Border Beam (Appica)`,
    category: `Animation`,
    tags: [`border`, `beam`, `appica`],
    code: `// ─── border-beam/border-beam.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'

type BorderBeamTrigger = 'hover' | 'press'

interface BorderBeamProps extends React.ComponentProps<'div'> {
  /**
   * Beam color. It lights the head of the comet and fades to transparent along the tail, so pass a solid color
   * rather than a gradient.
   * @default 'var(--primary)'
   */
  color?: string
  /**
   * How much of the border the comet spans, in percent of one lap.
   * @default 10
   */
  length?: number
  /**
   * Beam thickness in px.
   * @default 1
   */
  thickness?: number
  /**
   * Seconds for one full lap around the border.
   * @default 5
   */
  speed?: number
  /**
   * Seconds before the first lap starts. Negative values start the beam mid-lap, which is how you desynchronize a
   * group of cards.
   * @default 0
   */
  delay?: number
  /**
   * Reveal only on interaction. \`'hover'\` is pointer-only; \`'press'\` works on touch. Combine via an array. Omit for
   * always-on.
   */
  revealOn?: BorderBeamTrigger | BorderBeamTrigger[]
  /** Controlled visibility for programmatic states (loading, etc.); OR-ed with \`revealOn\`. */
  reveal?: boolean
  /**
   * With \`revealOn="hover"\`, keep the beam visible on touch devices (which have no hover) instead of hidden.
   * @default false
   */
  showOnTouch?: boolean
  /**
   * Scale the beam down while pressed, to track a child \`Button\`'s own active-press scale.
   * @default false
   */
  pressScale?: boolean
}

/* A conic sweep clipped to the border ring by an XOR mask (same trick as GradientGlow's border), so the comet follows
   the wrapper's radius at any corner. The RTL mirror uses \`transform\`, not \`scale\`, so it composes with \`pressScale\`
   instead of losing to it. */
const RING_MASK = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'

function BorderBeam({
  color = 'var(--primary)',
  length = 10,
  thickness = 1,
  speed = 5,
  delay = 0,
  revealOn,
  reveal,
  showOnTouch = false,
  pressScale = false,
  className,
  style,
  children,
  ...props
}: BorderBeamProps) {
  const triggers = revealOn == null ? [] : Array.isArray(revealOn) ? revealOn : [revealOn]
  const managed = triggers.length > 0 || reveal !== undefined
  const grouped = managed || pressScale

  return (
    <div
      data-slot="border-beam"
      data-reveal={managed ? triggers.join(' ') : undefined}
      data-revealed={reveal ? '' : undefined}
      data-show-on-touch={showOnTouch ? '' : undefined}
      className={cn('relative rounded-xl', grouped && 'group/beam', className)}
      style={
        { '--border-beam-duration': \`\${speed}s\`, '--border-beam-delay': \`\${delay}s\`, ...style } as React.CSSProperties
      }
      {...props}
    >
      {children}
      <span
        aria-hidden
        data-slot="border-beam-ring"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] rtl:transform-[scaleX(-1)]',
          'motion-safe:animate-border-beam motion-reduce:hidden',
          managed && 'opacity-0 [animation-play-state:paused]',
          managed &&
            triggers.includes('hover') &&
            'group-hover/beam:opacity-100 group-hover/beam:[animation-play-state:running]',
          managed &&
            triggers.includes('hover') &&
            showOnTouch &&
            'hover-none:opacity-100 hover-none:[animation-play-state:running]',
          managed &&
            triggers.includes('press') &&
            'group-active/beam:opacity-100 group-active/beam:[animation-play-state:running]',
          managed && reveal && 'opacity-100 [animation-play-state:running]',
          pressScale && 'group-active/beam:translate-y-px group-active/beam:scale-[0.97]',
          managed && pressScale
            ? '[transition:opacity_500ms_ease-out,scale_150ms_ease-out,translate_150ms_ease-out]'
            : managed
              ? 'transition-opacity duration-500 ease-out'
              : pressScale
                ? '[transition:scale_150ms_ease-out,translate_150ms_ease-out]'
                : undefined,
        )}
        style={{
          background: \`conic-gradient(from var(--border-beam-angle), transparent, \${color} \${length}%, transparent calc(\${length}% * 1.2))\`,
          padding: thickness,
          WebkitMask: RING_MASK,
          WebkitMaskComposite: 'xor',
          mask: RING_MASK,
          maskComposite: 'exclude',
        }}
      />
    </div>
  )
}

export { BorderBeam }
export type { BorderBeamProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">border beam</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-breadcrumb`,
    name: `Breadcrumb (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── breadcrumb/breadcrumb.tsx ───
'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn, focusableProps } from '../../internal/utils'

type BreadcrumbProps = React.ComponentPropsWithoutRef<'nav'>

function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label="breadcrumb"
      className={cn('text-foreground-muted w-fit text-sm font-medium', className)}
      {...props}
    />
  )
}

type BreadcrumbListProps = React.ComponentPropsWithoutRef<'ol'>

function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 wrap-break-word',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
        className,
      )}
      {...props}
    />
  )
}

type BreadcrumbItemProps = React.ComponentPropsWithoutRef<'li'>

function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

type BreadcrumbLinkState = {
  active: boolean
  disabled: boolean
}

interface BreadcrumbLinkProps extends useRender.ComponentProps<'a', BreadcrumbLinkState> {
  /**
   * Mark the current page. Renders a non-interactive \`<span>\` with \`aria-current="page"\`.
   * @default false
   */
  active?: boolean
  /**
   * Make the link non-interactive and dimmed.
   * @default false
   */
  disabled?: boolean
}

function BreadcrumbLink({ className, active = false, disabled = false, render, ...props }: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: active ? 'span' : 'a',
    render,
    state: { active, disabled } satisfies BreadcrumbLinkState,
    props: mergeProps<'a'>(
      {
        'data-slot': 'breadcrumb-link',
        'data-active': active || undefined,
        'aria-current': active ? 'page' : undefined,
        ...focusableProps(active || disabled),
        className: cn(
          'inline-flex items-center gap-1.5 outline-ring',
          'transition duration-250 motion-reduce:transition-none',
          active
            ? 'text-foreground-intense pointer-events-none'
            : 'hover:text-foreground-intense ease-[cubic-bezier(0.175,0.885,0.32,1.5)] active:scale-[0.97] active:duration-100 active:ease-in-out active:translate-y-px',
          disabled && 'opacity-disabled pointer-events-none',
          className,
        ),
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'li'>

function BreadcrumbSeparator({ className, children, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li
      role="presentation"
      aria-hidden
      data-slot="breadcrumb-separator"
      className={cn(
        "flex min-w-3.5 items-center justify-center text-center [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children ?? <SeparatorIcon />}
    </li>
  )
}

function SeparatorIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" className="rtl:rotate-180">
      <path d="M4.808 3.058c.244-.244.641-.244.885 0l3.5 3.5c.244.244.244.641 0 .885l-3.5 3.5c-.244.244-.641.244-.885 0s-.244-.641 0-.885L7.865 7 4.808 3.942c-.244-.244-.244-.641 0-.885z" />
    </svg>
  )
}

type BreadcrumbEllipsisProps = React.ComponentPropsWithoutRef<'span'>

function BreadcrumbEllipsis({ className, children, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden
      className={cn('inline-flex items-center justify-center [&_svg]:size-4.5!', className)}
      {...props}
    >
      {children ?? <EllipsisMark />}
    </span>
  )
}

function EllipsisMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  )
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis }
export type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">breadcrumb</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-button-group`,
    name: `Button Group (Appica)`,
    category: `Buttons`,
    tags: [`button`, `appica`],
    code: `// ─── button-group/button-group-context.ts ───
'use client'

import * as React from 'react'
import type { ButtonProps } from '../button/button'

type ButtonGroupVariant = NonNullable<ButtonProps['variant']>
type ButtonGroupSize = NonNullable<ButtonProps['size']>

interface ButtonGroupContextValue {
  variant?: ButtonGroupVariant
  size?: ButtonGroupSize
  disabled?: boolean
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(null)

export { ButtonGroupContext }
export type { ButtonGroupContextValue, ButtonGroupVariant, ButtonGroupSize }


// ─── button-group/button-group.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { ButtonGroupContext, type ButtonGroupVariant, type ButtonGroupSize } from './button-group-context'

const OUTLINED_VARIANTS = new Set<ButtonGroupVariant>(['primary-outline', 'outline', 'light'])

interface ButtonGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Visual style applied to every child \`Button\`. Inherited unless a button sets its own \`variant\`. */
  variant?: ButtonGroupVariant
  /** Height/padding applied to every child \`Button\`. Inherited unless a button sets its own \`size\`. */
  size?: ButtonGroupSize
  /**
   * Disables every child \`Button\`. A child can't re-enable itself; the group's \`disabled\` wins.
   * @default false
   */
  disabled?: boolean
  /**
   * Lay the buttons out in a row or a column; controls which corners are rounded.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
}

function ButtonGroup({
  className,
  variant,
  size,
  disabled,
  orientation = 'horizontal',
  children,
  ...props
}: ButtonGroupProps) {
  const horizontal = orientation === 'horizontal'
  const isOutlined = variant != null && OUTLINED_VARIANTS.has(variant)

  const value = React.useMemo(() => ({ variant, size, disabled }), [variant, size, disabled])

  return (
    <ButtonGroupContext.Provider value={value}>
      <div
        data-slot="button-group"
        role="group"
        className={cn(
          'isolate flex w-fit items-stretch',
          '*:relative *:hover:z-2 *:focus-visible:z-2 *:active:z-2',
          horizontal
            ? [
                '[&>*:not(:first-of-type)]:rounded-s-none [&>*:not(:last-of-type)]:rounded-e-none',
                isOutlined ? '-space-x-(--border-width)' : 'space-x-(--border-width)',
              ]
            : [
                'flex-col',
                '[&>*:not(:first-of-type)]:rounded-t-none [&>*:not(:last-of-type)]:rounded-b-none',
                isOutlined ? '-space-y-(--border-width)' : 'space-y-(--border-width)',
              ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  )
}

export { ButtonGroup }
export type { ButtonGroupProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">button group</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-button`,
    name: `Button (Appica)`,
    category: `Buttons`,
    tags: [`button`, `appica`],
    code: `// ─── button/button-variants.ts ───
import { cva } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const backgroundLayer = [
  'before:pointer-events-none',
  'before:absolute',
  'before:inset-0',
  'before:-z-1',
  'before:rounded-[inherit]',
  'before:transition-[opacity,background-color,border-color]',
  'before:duration-300',
  'motion-reduce:before:transition-none',
]

const buttonVariants = cva(
  "relative isolate inline-flex shrink-0 transform-gpu cursor-pointer items-center justify-center font-medium whitespace-nowrap outline-offset-1 transition duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)] select-none not-data-popup-open:active:scale-[0.97] not-data-popup-open:active:duration-100 not-data-popup-open:active:ease-in-out not-data-popup-open:active:translate-y-px data-disabled:opacity-disabled data-disabled:pointer-events-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
  {
    variants: {
      variant: {
        primary: cn(
          backgroundLayer,
          'text-primary-foreground bg-primary before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--primary)_0%,var(--primary-muted)_80%)] before:opacity-0 hover:before:opacity-100 outline-ring-primary data-popup-open:before:opacity-100 data-pressed:before:opacity-100',
        ),
        'primary-outline': cn(
          backgroundLayer,
          'text-primary before:border before:border-primary hover:text-primary-foreground hover:before:bg-primary outline-ring-primary data-popup-open:before:bg-primary data-pressed:before:bg-primary data-popup-open:text-primary-foreground data-pressed:text-primary-foreground',
        ),
        secondary: cn(
          backgroundLayer,
          'text-secondary-foreground bg-secondary outline-ring-secondary before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--secondary)_0%,var(--secondary-muted)_95%)] before:opacity-0 hover:before:opacity-100 data-popup-open:before:opacity-100 data-pressed:before:opacity-100',
        ),
        soft: cn(
          backgroundLayer,
          'text-foreground-emphasis hover:text-foreground-intense before:bg-background-muted hover:before:bg-background-subtle hover:before:border-border data-popup-open:text-foreground-intense data-pressed:text-foreground-intense data-popup-open:before:bg-background-subtle data-pressed:before:bg-background-subtle data-popup-open:before:border-border data-pressed:before:border-border outline-ring before:border before:border-transparent before:backdrop-blur-md',
        ),
        outline: cn(
          backgroundLayer,
          'bg-background text-foreground-emphasis hover:text-foreground-intense before:bg-background before:border-border hover:before:bg-background-subtle hover:before:border-border-strong data-popup-open:text-foreground-intense data-pressed:text-foreground-intense data-popup-open:before:bg-background-subtle data-pressed:before:bg-background-subtle data-popup-open:before:border-border-strong data-pressed:before:border-border-strong outline-ring before:border',
        ),
        ghost: cn(
          backgroundLayer,
          'text-foreground-emphasis hover:text-foreground-intense hover:before:bg-background-muted data-popup-open:text-foreground-intense data-pressed:text-foreground-intense data-popup-open:before:bg-background-muted data-pressed:before:bg-background-muted outline-ring',
        ),
        destructive: cn(
          backgroundLayer,
          'text-error-foreground bg-error outline-ring-error before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--error)_0%,var(--error-muted)_95%)] before:opacity-0 hover:before:opacity-100 data-popup-open:before:opacity-100 data-pressed:before:opacity-100',
        ),
        light: cn(
          backgroundLayer,
          'text-white before:bg-white/10 before:border-white/10 before:border before:backdrop-blur-md hover:before:bg-white/15 hover:before:border-white/15 outline-ring-light data-popup-open:before:bg-white/15 data-pressed:before:bg-white/15 data-popup-open:before:border-white/15 data-pressed:before:border-white/15',
        ),
      },
      size: {
        sm: "h-8 gap-1 rounded-sm px-4 text-xs has-data-[icon=end]:pe-3 has-data-[icon=start]:ps-3 [&_svg:not([class*='size-'])]:size-4",
        md: "h-10 gap-1.5 rounded-md px-5 text-sm has-data-[icon=end]:pe-3.5 has-data-[icon=start]:ps-3.5 [&_svg:not([class*='size-'])]:size-4.5",
        lg: "h-12 gap-2 rounded-lg px-6 text-base has-data-[icon=end]:pe-4.5 has-data-[icon=start]:ps-4.5 [&_svg:not([class*='size-'])]:size-5",
        'icon-sm': "size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4",
        'icon-md': "size-10 rounded-md [&_svg:not([class*='size-'])]:size-4.5",
        'icon-lg': "size-12 rounded-lg [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export { buttonVariants }


// ─── button/button.tsx ───
'use client'

import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import { ButtonGroupContext } from '../button-group/button-group-context'
import { buttonVariants } from './button-variants'

interface ButtonProps extends BaseButton.Props, Omit<VariantProps<typeof buttonVariants>, 'variant' | 'size'> {
  /**
   * Visual style.
   * @default 'primary'
   */
  variant?: VariantProps<typeof buttonVariants>['variant']
  /**
   * Height and padding. The \`icon-*\` sizes are square, for icon-only buttons.
   * @default 'md'
   */
  size?: VariantProps<typeof buttonVariants>['size']
}

function Button({ className, variant, size, disabled, ...props }: ButtonProps) {
  const group = React.useContext(ButtonGroupContext)
  const resolvedVariant = variant ?? group?.variant
  const resolvedSize = size ?? group?.size
  const resolvedDisabled = disabled || group?.disabled
  return (
    <BaseButton
      data-slot="button"
      disabled={resolvedDisabled}
      className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    />
  )
}

export { Button }
export type { ButtonProps }


// ─── button/index.ts ───
export * from './button'
export * from './button-variants'
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">button</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-calendar`,
    name: `Calendar (Appica)`,
    category: `Forms`,
    tags: [`calendar`, `date`, `appica`],
    code: `// ─── calendar/calendar.tsx ───
'use client'

import * as React from 'react'
import {
  DayPicker,
  type ChevronProps,
  type DateRange,
  type DayButtonProps,
  type DropdownProps,
  type Matcher,
} from 'react-day-picker'
import { buttonVariants } from '../button/button-variants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select/select'
import { cn } from '../../internal/utils'

type CalendarSize = 'sm' | 'md' | 'lg'

type DayPickerProps = React.ComponentProps<typeof DayPicker>

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

interface CalendarExtensions {
  /**
   * Cell size and text scale (Appica extension).
   * @default 'md'
   */
  size?: CalendarSize
  /** Extra classes on the root, merged via \`tailwind-merge\`. */
  className?: string
}

type CalendarProps = DistributiveOmit<DayPickerProps, 'classNames' | 'components'> & CalendarExtensions

const ROOT_CONFIG: Record<CalendarSize, { text: string; cellVar: string; cellOuter: string }> = {
  sm: { text: 'text-xs', cellVar: '[--cell-size:--spacing(6)]', cellOuter: 'min-w-6.5' },
  md: { text: 'text-sm', cellVar: '[--cell-size:--spacing(8)]', cellOuter: 'min-w-8.5' },
  lg: { text: 'text-base', cellVar: '[--cell-size:--spacing(10)]', cellOuter: 'min-w-10.5' },
}

const MONTH_GAP: Record<CalendarSize, string> = {
  sm: 'gap-4',
  md: 'gap-4.5',
  lg: 'gap-4.5',
}

const HEADER_GAP: Record<CalendarSize, string> = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-2.5',
}

const WEEKDAY_PADDING: Record<CalendarSize, string> = {
  sm: 'pb-1.5',
  md: 'pb-2',
  lg: 'pb-2',
}

const ROW_GAP: Record<CalendarSize, string> = {
  sm: 'mt-1',
  md: 'mt-1',
  lg: 'mt-1',
}

const ROUNDED: Record<CalendarSize, { full: string; start: string; end: string }> = {
  sm: { full: 'rounded-xs', start: 'rounded-s-xs', end: 'rounded-e-xs' },
  md: { full: 'rounded-sm', start: 'rounded-s-sm', end: 'rounded-e-sm' },
  lg: { full: 'rounded-md', start: 'rounded-s-md', end: 'rounded-e-md' },
}

const NAV_BUTTON_CLASS: Record<CalendarSize, string> = {
  sm: cn(
    buttonVariants({ variant: 'outline', size: 'icon-sm' }),
    "size-(--cell-size) rounded-xs [&_svg:not([class*='size-'])]:size-3.5",
  ),
  md: cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'size-(--cell-size)'),
  lg: cn(buttonVariants({ variant: 'outline', size: 'icon-md' }), 'size-(--cell-size)'),
}

const PREV_CHEVRON_FLIP = '[&_svg]:rtl:rotate-180'
const NEXT_CHEVRON_FLIP = '[&_svg]:rotate-180 [&_svg]:rtl:rotate-0'

const SELECT_CONFIG: Record<CalendarSize, { size: 'sm' | 'md'; extra: string }> = {
  sm: { size: 'sm', extra: 'w-auto h-6 px-2 rounded-xs gap-1 [&>svg]:size-3.5' },
  md: { size: 'md', extra: 'w-auto h-8 px-2.5 rounded-sm text-sm [&>svg]:size-4' },
  lg: { size: 'md', extra: 'w-auto text-base' },
}

const DEFAULT_START_MONTH = new Date(1925, 0)
const DEFAULT_END_MONTH = new Date(2050, 11)

interface CalendarContextValue {
  size: CalendarSize
  rounded: string
}

const CalendarContext = React.createContext<CalendarContextValue>({ size: 'md', rounded: ROUNDED.md.full })

function CalendarDropdownSlot(props: DropdownProps) {
  const { size } = React.useContext(CalendarContext)
  return <CalendarDropdown {...props} calendarSize={size} />
}

function CalendarDayButtonSlot(props: DayButtonProps) {
  const { size, rounded } = React.useContext(CalendarContext)
  return <CalendarDayButton {...props} calendarSize={size} rounded={rounded} />
}

const CALENDAR_COMPONENTS = {
  Chevron: CalendarChevron,
  Dropdown: CalendarDropdownSlot,
  DayButton: CalendarDayButtonSlot,
}

function Calendar({
  size = 'md',
  showOutsideDays = true,
  captionLayout = 'dropdown',
  startMonth = DEFAULT_START_MONTH,
  endMonth = DEFAULT_END_MONTH,
  weekStartsOn = 1,
  formatters,
  className,
  ...props
}: CalendarProps) {
  const cfg = ROOT_CONFIG[size]
  const r = ROUNDED[size]
  const isLabel = captionLayout === 'label'

  const calendarContext = React.useMemo<CalendarContextValue>(() => ({ size, rounded: r.full }), [size, r.full])

  return (
    <CalendarContext.Provider value={calendarContext}>
      <div data-slot="calendar" className={cn('inline-flex w-fit flex-col', cfg.text, cfg.cellVar, className)}>
        <DayPicker
          showOutsideDays={showOutsideDays}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          weekStartsOn={weekStartsOn}
          formatters={{
            formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
            ...formatters,
          }}
          classNames={{
            months: cn('relative flex flex-col', MONTH_GAP[size]),
            month: cn('flex w-full flex-col', MONTH_GAP[size]),
            month_caption: 'flex h-(--cell-size) items-center justify-center px-[calc(var(--cell-size)+0.5rem)]',
            caption_label: isLabel ? 'text-foreground-intense font-medium' : 'sr-only',
            nav: 'pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between',
            button_previous: cn(NAV_BUTTON_CLASS[size], 'pointer-events-auto', PREV_CHEVRON_FLIP),
            button_next: cn(NAV_BUTTON_CLASS[size], 'pointer-events-auto', NEXT_CHEVRON_FLIP),
            dropdowns: cn('flex items-center', HEADER_GAP[size]),
            dropdown_root: 'relative',
            dropdown: 'sr-only',
            month_grid: 'border-collapse',
            weekdays: 'flex',
            weekday: cn(
              'text-foreground-muted flex flex-1 items-end justify-center font-normal',
              cfg.cellOuter,
              WEEKDAY_PADDING[size],
            ),
            weeks: '',
            week: cn('flex w-full', ROW_GAP[size]),
            day: cn('relative flex aspect-square flex-1 items-center justify-center', cfg.cellOuter),
            range_start: cn('bg-background-muted', r.start),
            range_middle: 'bg-background-muted',
            range_end: cn('bg-background-muted', r.end),
          }}
          components={CALENDAR_COMPONENTS}
          {...(props as DayPickerProps)}
        />
      </div>
    </CalendarContext.Provider>
  )
}

interface CalendarDayButtonProps extends DayButtonProps {
  calendarSize: CalendarSize
  rounded: string
}

const DAY_BUTTON_BASE = cn(
  'relative isolate flex size-(--cell-size) cursor-pointer items-center justify-center',
  'font-normal whitespace-nowrap outline-offset-1 outline-ring',
  'transform-gpu transition duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
  'active:scale-[0.97] active:translate-y-px active:duration-100 active:ease-in-out',
  'motion-reduce:transition-none',
  'before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit]',
  'before:bg-background-muted before:opacity-0',
  'before:transition-all before:duration-300 motion-reduce:before:transition-none',
)

function CalendarDayButton({
  calendarSize: _calendarSize,
  rounded,
  modifiers,
  day: _day,
  className,
  ...props
}: CalendarDayButtonProps) {
  const isSelected = Boolean(modifiers.selected)
  const isToday = Boolean(modifiers.today)
  const isOutside = Boolean(modifiers.outside)
  const isDisabled = Boolean(modifiers.disabled)
  const isRangeStart = Boolean(modifiers.range_start)
  const isRangeMiddle = Boolean(modifiers.range_middle)
  const isRangeEnd = Boolean(modifiers.range_end)
  const isRangeEndpoint = isRangeStart || isRangeEnd
  const isFilled = (isSelected && !isRangeMiddle) || isRangeEndpoint

  return (
    <button
      type="button"
      data-slot="calendar-day"
      {...props}
      className={cn(
        DAY_BUTTON_BASE,
        rounded,
        !isFilled && !isRangeMiddle && (isOutside ? 'text-foreground-muted' : 'text-foreground-strong'),
        !isFilled &&
          !isRangeMiddle &&
          !isDisabled &&
          'hover:text-foreground-intense hover:font-medium hover:before:opacity-100',
        isToday && !isFilled && !isRangeMiddle && 'text-foreground-intense font-medium before:opacity-100',
        isRangeMiddle && 'text-foreground-intense rounded-none font-medium before:opacity-100',
        isFilled &&
          'before:bg-primary text-primary-foreground outline-ring-primary hover:before:bg-primary before:opacity-100',
        isDisabled && 'text-foreground-subtle pointer-events-none cursor-not-allowed line-through before:opacity-0!',
        className,
      )}
    />
  )
}

function CalendarChevron({ orientation, className, ...props }: ChevronProps) {
  const rotate = orientation === 'up' ? 'rotate-90' : orientation === 'down' ? '-rotate-90' : ''
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn(rotate, className)}
      {...props}
    >
      <path d="M9.594 3.594c.225-.225.588-.225.812 0s.225.588 0 .812L6.812 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812l4-4z" />
    </svg>
  )
}

interface CalendarDropdownProps extends DropdownProps {
  calendarSize: CalendarSize
}

function CalendarDropdown({
  calendarSize,
  options,
  value,
  onChange,
  className,
  disabled,
  'aria-label': ariaLabel,
}: CalendarDropdownProps) {
  const cfg = SELECT_CONFIG[calendarSize]
  const items = React.useMemo(
    () => options?.map((opt) => ({ value: String(opt.value), label: opt.label })) ?? [],
    [options],
  )
  return (
    <Select
      size={cfg.size}
      variant="soft"
      items={items}
      value={String(value ?? '')}
      onValueChange={(next) => {
        if (!onChange) return
        const fakeEvent = {
          target: { value: String(next) },
          currentTarget: { value: String(next) },
        } as unknown as React.ChangeEvent<HTMLSelectElement>
        onChange(fakeEvent)
      }}
      disabled={disabled}
    >
      <SelectTrigger aria-label={ariaLabel} className={cn(cfg.extra, className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { Calendar }
export type { CalendarProps, DateRange, Matcher }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">calendar</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-card`,
    name: `Card (Appica)`,
    category: `Cards`,
    tags: [`card`, `appica`],
    code: `// ─── card/card.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'

// Server-safe stand-in for Base UI's \`useRender\`, which is a hook and would
// make Card a client component. Element form only, so it crosses the RSC boundary.
type RenderProp = React.ReactElement<{ className?: string }>

function renderElement(
  fallback: React.ElementType,
  render: RenderProp | undefined,
  base: string,
  className: string | undefined,
  props: Record<string, unknown>,
) {
  if (React.isValidElement<{ className?: string }>(render)) {
    return React.cloneElement(render, {
      ...props,
      ...render.props,
      className: cn(base, render.props.className, className),
    })
  }
  return React.createElement(fallback, { ...props, className: cn(base, className) })
}

const CARD_RADIUS = '[--card-radius:var(--radius-xl)]'
const FRAME_RADIUS = 'rounded-[calc(var(--card-radius)*4/3)]'

type CardFrame = 'none' | 'solid' | 'glass'

const frameVariants: Record<CardFrame, string> = {
  none: 'rounded-(--card-radius)',
  solid: cn(FRAME_RADIUS, 'bg-background-subtle p-2 backdrop-blur-md'),
  glass: cn(FRAME_RADIUS, 'border border-white/15 bg-white/10 p-2 backdrop-blur-sm'),
}

const contentFrameVariants: Record<CardFrame, string> = {
  none: 'border',
  solid: 'border-border-muted border',
  glass: '',
}

interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Wrap the content in a padded frame. \`true\` is an alias for \`'solid'\`; \`'glass'\` is translucent and blurred.
   * @default false
   */
  frame?: boolean | 'solid' | 'glass'
  /**
   * Float the slots inside the content, so media rounds all four corners. \`false\` gives edge-to-edge media.
   * @default true
   */
  inset?: boolean
  /** Escape hatch for the inner content wrapper - e.g. \`{ className: 'sm:flex-row' }\` for a horizontal card. */
  contentProps?: React.ComponentPropsWithoutRef<'div'>
  /** Render as a different element, e.g. \`render={<article />}\` or \`render={<li />}\`. */
  render?: RenderProp
}

function Card({ frame = false, inset = true, className, contentProps, render, children, ...props }: CardProps) {
  const variant: CardFrame = frame === true ? 'solid' : frame === false ? 'none' : frame

  return renderElement('div', render, cn('group/card flex flex-col', CARD_RADIUS, frameVariants[variant]), className, {
    'data-slot': 'card',
    'data-frame': variant,
    ...(inset ? { 'data-inset': '' } : {}),
    ...props,
    children: (
      <div
        data-slot="card-content"
        {...contentProps}
        className={cn(
          'bg-background flex min-h-0 flex-1 flex-col overflow-hidden rounded-(--card-radius)',
          inset && 'p-2',
          contentFrameVariants[variant],
          contentProps?.className,
        )}
      >
        {children}
      </div>
    ),
  })
}

interface CardMediaProps extends React.ComponentPropsWithoutRef<'div'> {}

function CardMedia({ className, ...props }: CardMediaProps) {
  return (
    <div
      data-slot="card-media"
      className={cn(
        'relative shrink-0 overflow-hidden',
        'group-data-inset/card:rounded-[calc(var(--card-radius)*3/4)]',
        '[&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover',
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.ComponentPropsWithoutRef<'div'> {}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-1 flex-col gap-1.5 p-6 group-data-inset/card:px-4', className)}
      {...props}
    />
  )
}

interface CardTitleProps extends React.ComponentPropsWithoutRef<'h3'> {
  /** Render as another element, e.g. \`render={<h2 />}\`, to fit the page outline. */
  render?: RenderProp
}

function CardTitle({ className, render, ...props }: CardTitleProps) {
  return renderElement('h3', render, 'text-foreground-intense text-lg font-semibold', className, {
    'data-slot': 'card-title',
    ...props,
  })
}

interface CardDescriptionProps extends React.ComponentPropsWithoutRef<'p'> {
  /** Render as another element. */
  render?: RenderProp
}

function CardDescription({ className, render, ...props }: CardDescriptionProps) {
  return renderElement('p', render, 'text-foreground-muted text-sm', className, {
    'data-slot': 'card-description',
    ...props,
  })
}

interface CardFooterProps extends React.ComponentPropsWithoutRef<'div'> {}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:items-center',
        'group-data-inset/card:px-4 group-data-inset/card:pb-4',
        className,
      )}
      {...props}
    />
  )
}

export { Card, CardMedia, CardHeader, CardTitle, CardDescription, CardFooter }
export type { CardProps, CardMediaProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardFooterProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">card</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-carousel`,
    name: `Carousel (Appica)`,
    category: `Components`,
    tags: [`carousel`, `appica`],
    code: `// ─── carousel/carousel.tsx ───
'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import Accessibility, { type AccessibilityOptionsType } from 'embla-carousel-accessibility'
import Autoplay, { type AutoplayOptionsType } from 'embla-carousel-autoplay'
import AutoScroll, { type AutoScrollOptionsType } from 'embla-carousel-auto-scroll'
import AutoHeight, { type AutoHeightOptionsType } from 'embla-carousel-auto-height'
import ClassNames, { type ClassNamesOptionsType } from 'embla-carousel-class-names'
import Fade, { type FadeOptionsType } from 'embla-carousel-fade'
import { WheelGesturesPlugin, type WheelGesturesPluginOptions } from 'embla-carousel-wheel-gestures'
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { useReducedMotion } from '../../hooks/use-reduced-motion'

type CarouselOrientation = 'horizontal' | 'vertical'

type CarouselApi = EmblaCarouselType
type CarouselOptions = EmblaOptionsType
type CarouselPlugin = EmblaPluginType

type CarouselAutoplayOptions = AutoplayOptionsType & { resumeAfter?: number }
type CarouselAutoScrollOptions = AutoScrollOptionsType & { resumeAfter?: number }
type CarouselAutoHeightOptions = AutoHeightOptionsType
type CarouselFadeOptions = FadeOptionsType
type CarouselClassNamesOptions = ClassNamesOptionsType
type CarouselAccessibilityOptions = AccessibilityOptionsType
type CarouselWheelGesturesOptions = WheelGesturesPluginOptions

interface CarouselAutoplayState {
  delay: number
  cycleId: number
  isPlaying: boolean
}

interface CarouselContextValue {
  api: CarouselApi | undefined
  viewportRef: (node: HTMLDivElement | null) => void
  orientation: CarouselOrientation
  direction: 'ltr' | 'rtl'
  light: boolean
  autoHeight: boolean
  loop: boolean
  reducedMotion: boolean
  selectedIndex: number
  scrollSnaps: number[]
  canScrollPrev: boolean
  canScrollNext: boolean
  subscribeScrollProgress: (onChange: () => void) => () => void
  getScrollProgress: () => number
  autoplay: CarouselAutoplayState | null
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error('Carousel sub-components must be rendered inside <Carousel>')
  }
  return ctx
}

interface CarouselProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect' | 'onScroll' | 'children'> {
  /**
   * Scroll axis. Maps to Embla's \`axis\`; exposed as \`data-orientation\`.
   * @default 'horizontal'
   */
  orientation?: CarouselOrientation
  /**
   * Wrap around from the last slide to the first.
   * @default false
   */
  loop?: boolean
  /**
   * Where slides settle within the viewport.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end'
  /**
   * How many slides advance per step. \`'auto'\` groups by how many fit the viewport.
   * @default 1
   */
  slidesToScroll?: number | 'auto'
  /**
   * Clamp scrolling so there's no empty space at the edges. \`false\` disables containment.
   * @default 'trimSnaps'
   */
  containScroll?: false | 'trimSnaps' | 'keepSnaps'
  /** Release snap points; glide to a momentum stop. */
  dragFree?: boolean
  /** Index of the slide to start on. */
  startSnap?: number
  /**
   * When \`false\`, the engine is inert (no drag/snap) - e.g. to disable at a breakpoint.
   * @default true
   */
  active?: boolean
  /**
   * Whether pointer dragging is enabled (Embla's \`watchDrag\`).
   * @default true
   */
  draggable?: boolean
  /** Scroll animation duration (Embla's ease). Forced to \`0\` under reduced motion. */
  duration?: number
  /** Escape hatch: a raw Embla options object, merged last so it wins over the flat props. */
  options?: CarouselOptions
  /** Enable the Autoplay plugin. \`resumeAfter\` (ms) restarts the timer after user interaction. */
  autoplay?: boolean | CarouselAutoplayOptions
  /** Enable continuous Auto Scroll. Mutually exclusive with \`autoplay\`; paused under reduced motion. */
  autoScroll?: boolean | CarouselAutoScrollOptions
  /** Enable the Auto Height plugin; animates the viewport to each slide's height. */
  autoHeight?: boolean | CarouselAutoHeightOptions
  /** Enable the Fade plugin (cross-fade instead of slide). Best with one slide per view. */
  fade?: boolean | CarouselFadeOptions
  /** Enable the Class Names plugin, which toggles \`snapped\` / \`inView\` classes on slides. */
  classNames?: boolean | CarouselClassNamesOptions
  /**
   * Keyboard/ARIA plugin for the viewport. Set \`false\` to opt out.
   * @default true
   */
  accessibility?: boolean | CarouselAccessibilityOptions
  /**
   * Enable trackpad / mouse-wheel scrolling.
   * @default false
   */
  wheelGestures?: boolean | CarouselWheelGesturesOptions
  /** Additional Embla plugins to append. */
  plugins?: CarouselPlugin[]
  /** Receives the Embla instance once initialized - for imperative control. */
  setApi?: (api: CarouselApi) => void
  /** Fires on init and whenever the engine re-initializes. */
  onReInit?: (api: CarouselApi) => void
  /** Fires when the selected snap changes. */
  onSelect?: (api: CarouselApi) => void
  /** Fires continuously while scrolling. */
  onScroll?: (api: CarouselApi) => void
  /**
   * Hint stored in context for light-on-dark surfaces; read via \`useCarousel()\`.
   * @default false
   */
  light?: boolean
  /** The content. */
  children: React.ReactNode
}

function Carousel({
  orientation = 'horizontal',
  loop = false,
  align = 'start',
  slidesToScroll = 1,
  containScroll = 'trimSnaps',
  dragFree,
  startSnap,
  active = true,
  draggable,
  duration,
  options,
  autoplay,
  autoScroll,
  autoHeight,
  fade,
  classNames,
  accessibility = true,
  wheelGestures = false,
  plugins: userPlugins,
  setApi,
  onReInit,
  onSelect,
  onScroll,
  light = false,
  className,
  children,
  ...rest
}: CarouselProps) {
  const direction = useDirection()

  const reducedMotion = useReducedMotion()

  const autoplayEnabled = !!autoplay
  const autoScrollEnabled = !!autoScroll

  const warnedMutualExclusive = React.useRef(false)
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      autoplayEnabled &&
      autoScrollEnabled &&
      !warnedMutualExclusive.current
    ) {
      warnedMutualExclusive.current = true
      // eslint-disable-next-line no-console
      console.warn('[Carousel] \`autoplay\` and \`autoScroll\` are mutually exclusive - preferring \`autoplay\`.')
    }
  }, [autoplayEnabled, autoScrollEnabled])

  const resumeAfterMs =
    (typeof autoplay === 'object' && typeof autoplay.resumeAfter === 'number' && autoplay.resumeAfter) ||
    (typeof autoScroll === 'object' && typeof autoScroll.resumeAfter === 'number' && autoScroll.resumeAfter) ||
    0

  const plugins = React.useMemo<CarouselPlugin[]>(() => {
    const list: CarouselPlugin[] = []
    if (accessibility !== false) {
      list.push(Accessibility(typeof accessibility === 'object' ? accessibility : undefined))
    }
    if (wheelGestures !== false) {
      list.push(WheelGesturesPlugin(typeof wheelGestures === 'object' ? wheelGestures : undefined))
    }
    if (autoplay) {
      const opts = typeof autoplay === 'object' ? autoplay : undefined
      const { resumeAfter, ...emblaOpts } = opts ?? {}
      const autoResume = typeof resumeAfter === 'number' && resumeAfter > 0
      list.push(Autoplay(autoResume ? { ...emblaOpts, defaultInteraction: false } : emblaOpts))
    } else if (autoScroll && !reducedMotion) {
      const opts = typeof autoScroll === 'object' ? autoScroll : undefined
      const { resumeAfter, ...emblaOpts } = opts ?? {}
      const autoResume = typeof resumeAfter === 'number' && resumeAfter > 0
      list.push(AutoScroll(autoResume ? { ...emblaOpts, defaultInteraction: false } : emblaOpts))
    }
    if (autoHeight) {
      list.push(AutoHeight(typeof autoHeight === 'object' ? autoHeight : undefined))
    }
    if (fade) {
      list.push(Fade(typeof fade === 'object' ? fade : undefined))
    }
    if (classNames) {
      list.push(ClassNames(typeof classNames === 'object' ? classNames : undefined))
    }
    if (userPlugins) list.push(...userPlugins)
    return list
  }, [accessibility, wheelGestures, autoplay, autoScroll, autoHeight, fade, classNames, userPlugins, reducedMotion])

  const emblaOptions = React.useMemo<CarouselOptions>(() => {
    const merged: CarouselOptions = {
      axis: orientation === 'vertical' ? 'y' : 'x',
      loop,
      align,
      slidesToScroll,
      containScroll,
      active,
    }
    if (dragFree !== undefined) merged.dragFree = dragFree
    if (startSnap !== undefined) merged.startSnap = startSnap
    if (duration !== undefined) merged.duration = duration
    if (draggable !== undefined) merged.draggable = draggable
    if (orientation === 'horizontal') merged.direction = direction
    if (reducedMotion) merged.duration = 0
    return { ...merged, ...options }
  }, [
    orientation,
    direction,
    loop,
    align,
    slidesToScroll,
    containScroll,
    dragFree,
    startSnap,
    active,
    draggable,
    duration,
    options,
    reducedMotion,
  ])

  const [viewportRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins)

  const setApiRef = React.useRef(setApi)
  const onReInitRef = React.useRef(onReInit)
  const onSelectRef = React.useRef(onSelect)
  const onScrollRef = React.useRef(onScroll)
  React.useEffect(() => {
    setApiRef.current = setApi
  })
  React.useEffect(() => {
    onReInitRef.current = onReInit
  })
  React.useEffect(() => {
    onSelectRef.current = onSelect
  })
  React.useEffect(() => {
    onScrollRef.current = onScroll
  })

  React.useEffect(() => {
    if (!emblaApi || !reducedMotion) return
    const snapToTargetInstantly = () => {
      emblaApi.internalEngine().scrollBody.useDuration(0)
    }
    emblaApi.on('pointerup', snapToTargetInstantly)
    return () => {
      emblaApi.off('pointerup', snapToTargetInstantly)
    }
  }, [emblaApi, reducedMotion])

  const [state, setState] = React.useState({
    selectedIndex: 0,
    scrollSnaps: [] as number[],
    canScrollPrev: false,
    canScrollNext: false,
  })
  const [autoplayState, setAutoplayState] = React.useState<CarouselAutoplayState | null>(null)

  const scrollProgressRef = React.useRef(0)
  const scrollListenersRef = React.useRef<Set<() => void>>(new Set())
  const subscribeScrollProgress = React.useCallback((onChange: () => void) => {
    scrollListenersRef.current.add(onChange)
    return () => {
      scrollListenersRef.current.delete(onChange)
    }
  }, [])
  const getScrollProgress = React.useCallback(() => scrollProgressRef.current, [])

  React.useEffect(() => {
    if (!emblaApi) return

    const notifyScroll = () => {
      scrollProgressRef.current = emblaApi.scrollProgress()
      scrollListenersRef.current.forEach((cb) => cb())
    }
    const syncFull = () => {
      notifyScroll()
      setState({
        selectedIndex: emblaApi.selectedSnap(),
        scrollSnaps: emblaApi.snapList(),
        canScrollPrev: emblaApi.canGoToPrev(),
        canScrollNext: emblaApi.canGoToNext(),
      })
    }
    const syncSelection = () => {
      setState((s) => ({
        ...s,
        selectedIndex: emblaApi.selectedSnap(),
        canScrollPrev: emblaApi.canGoToPrev(),
        canScrollNext: emblaApi.canGoToNext(),
      }))
    }
    const syncScroll = () => {
      notifyScroll()
    }
    const syncInView = () => {}

    syncFull()
    setApiRef.current?.(emblaApi)
    onReInitRef.current?.(emblaApi)

    const handleReInit = () => {
      const autoplayWasPlaying = emblaApi.plugins().autoplay?.isPlaying()
      const autoScrollWasPlaying = emblaApi.plugins().autoScroll?.isPlaying()
      syncFull()
      onReInitRef.current?.(emblaApi)
      if (autoplayEnabled && autoplayWasPlaying) emblaApi.plugins().autoplay?.play()
      else if (autoScrollEnabled && autoScrollWasPlaying) emblaApi.plugins().autoScroll?.play()
    }
    const handleSelect = () => {
      syncSelection()
      onSelectRef.current?.(emblaApi)
    }
    const handleScroll = () => {
      syncScroll()
      onScrollRef.current?.(emblaApi)
    }

    emblaApi.on('reinit', handleReInit)
    emblaApi.on('select', handleSelect)
    emblaApi.on('scroll', handleScroll)
    emblaApi.on('slidesinview', syncInView)
    emblaApi.on('slideschanged', syncFull)

    const autoplayPlugin = emblaApi.plugins().autoplay
    const autoScrollPlugin = emblaApi.plugins().autoScroll

    const resumeAfter = resumeAfterMs

    let resumeTimer: ReturnType<typeof setTimeout> | undefined
    const clearResumeTimer = () => {
      if (resumeTimer !== undefined) {
        clearTimeout(resumeTimer)
        resumeTimer = undefined
      }
    }
    const scheduleResume = (play: () => void) => {
      if (resumeAfter <= 0) return
      clearResumeTimer()
      resumeTimer = setTimeout(() => {
        resumeTimer = undefined
        play()
      }, resumeAfter)
    }

    let cleanupAutoplay: (() => void) | undefined
    if (autoplayPlugin) {
      const rawDelay = autoplayPlugin.options.delay
      const initialDelay = typeof rawDelay === 'number' ? rawDelay : 4000
      setAutoplayState({
        delay: initialDelay,
        cycleId: 0,
        isPlaying: autoplayPlugin.isPlaying(),
      })
      const onPlay = () => {
        clearResumeTimer()
        setAutoplayState((s) => (s ? { ...s, isPlaying: true } : s))
      }
      const onStop = () => setAutoplayState((s) => (s ? { ...s, isPlaying: false } : s))
      const onTimerSet = () => setAutoplayState((s) => (s ? { ...s, cycleId: s.cycleId + 1, isPlaying: true } : s))
      const onTimerStopped = () => setAutoplayState((s) => (s ? { ...s, isPlaying: false } : s))
      const resetOnSelect = () => autoplayPlugin.reset()
      const onInteraction = (_api: CarouselApi, event: { detail: { interaction: string } }) => {
        if (event.detail.interaction === 'pointerdown' || event.detail.interaction === 'slidefocus') {
          autoplayPlugin.stop()
          scheduleResume(() => emblaApi.plugins().autoplay?.play())
        }
      }
      emblaApi.on('autoplay:play', onPlay)
      emblaApi.on('autoplay:stop', onStop)
      emblaApi.on('autoplay:timerset', onTimerSet)
      emblaApi.on('autoplay:timerstopped', onTimerStopped)
      emblaApi.on('select', resetOnSelect)
      if (resumeAfter > 0) emblaApi.on('autoplay:interaction', onInteraction)
      if (autoplayEnabled) autoplayPlugin.play()
      cleanupAutoplay = () => {
        emblaApi.off('autoplay:play', onPlay)
        emblaApi.off('autoplay:stop', onStop)
        emblaApi.off('autoplay:timerset', onTimerSet)
        emblaApi.off('autoplay:timerstopped', onTimerStopped)
        emblaApi.off('select', resetOnSelect)
        if (resumeAfter > 0) emblaApi.off('autoplay:interaction', onInteraction)
      }
    } else {
      setAutoplayState(null)
    }

    let cleanupAutoScroll: (() => void) | undefined
    if (autoScrollPlugin && autoScrollEnabled && !autoplayEnabled) {
      autoScrollPlugin.play()
      const onInteraction = (_api: CarouselApi, event: { detail: { interaction: string } }) => {
        if (event.detail.interaction === 'pointerdown' || event.detail.interaction === 'slidefocus') {
          autoScrollPlugin.stop()
          scheduleResume(() => emblaApi.plugins().autoScroll?.play())
        }
      }
      if (resumeAfter > 0) {
        emblaApi.on('autoscroll:interaction', onInteraction)
        cleanupAutoScroll = () => emblaApi.off('autoscroll:interaction', onInteraction)
      }
    }

    return () => {
      emblaApi.off('reinit', handleReInit)
      emblaApi.off('select', handleSelect)
      emblaApi.off('scroll', handleScroll)
      emblaApi.off('slidesinview', syncInView)
      emblaApi.off('slideschanged', syncFull)
      cleanupAutoplay?.()
      cleanupAutoScroll?.()
      clearResumeTimer()
    }
  }, [emblaApi, autoplayEnabled, autoScrollEnabled, resumeAfterMs])

  const scrollPrev = React.useCallback(() => emblaApi?.goToPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.goToNext(), [emblaApi])
  const scrollTo = React.useCallback((i: number) => emblaApi?.goTo(i), [emblaApi])

  const isAutoHeight = !!autoHeight
  const contextValue = React.useMemo<CarouselContextValue>(
    () => ({
      api: emblaApi,
      viewportRef,
      orientation,
      direction,
      light,
      autoHeight: isAutoHeight,
      loop,
      reducedMotion,
      selectedIndex: state.selectedIndex,
      scrollSnaps: state.scrollSnaps,
      canScrollPrev: state.canScrollPrev,
      canScrollNext: state.canScrollNext,
      subscribeScrollProgress,
      getScrollProgress,
      autoplay: autoplayState,
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [
      emblaApi,
      viewportRef,
      orientation,
      direction,
      light,
      isAutoHeight,
      loop,
      reducedMotion,
      state,
      subscribeScrollProgress,
      getScrollProgress,
      autoplayState,
      scrollPrev,
      scrollNext,
      scrollTo,
    ],
  )

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        data-slot="carousel"
        data-orientation={orientation}
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel"
        className={cn('relative', className)}
        {...rest}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

interface CarouselContentProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Props for the scroll viewport, the element that clips the track. */
  viewportProps?: React.ComponentPropsWithoutRef<'div'>
}

function CarouselContent({ className, children, viewportProps, ...rest }: CarouselContentProps) {
  const { viewportRef, orientation, autoHeight } = useCarousel()
  return (
    <div
      {...viewportProps}
      ref={viewportRef}
      data-slot="carousel-viewport"
      data-orientation={orientation}
      data-auto-height={autoHeight || undefined}
      className={cn(
        'overflow-hidden',
        autoHeight && 'motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-out',
        viewportProps?.className,
      )}
    >
      <div
        data-slot="carousel-content"
        data-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'horizontal'
            ? '-ms-4 touch-pan-y touch-pinch-zoom items-start'
            : '-mt-4 h-full touch-pan-x touch-pinch-zoom flex-col',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </div>
  )
}

type CarouselSlideProps = React.ComponentPropsWithoutRef<'div'>

function CarouselSlide({ className, ...rest }: CarouselSlideProps) {
  const { orientation } = useCarousel()
  return (
    <div
      data-slot="carousel-slide"
      data-orientation={orientation}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-h-0 min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'ps-4' : 'pt-4',
        className,
      )}
      {...rest}
    />
  )
}

interface CarouselThumbBox {
  x: number
  y: number
  width: number
  height: number
}

function sameThumbBox(a: CarouselThumbBox | null, b: CarouselThumbBox) {
  return a !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

interface CarouselThumbsContextValue {
  selectedIndex: number
  select: (index: number) => void
  light: boolean
}

const CarouselThumbsContext = React.createContext<CarouselThumbsContextValue | null>(null)
const CarouselThumbIndexContext = React.createContext(0

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">carousel</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-checkbox-group`,
    name: `Checkbox Group (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── checkbox-group/checkbox-group.tsx ───
import * as React from 'react'
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import { cn } from '../../internal/utils'

interface CheckboxGroupProps extends React.ComponentProps<typeof BaseCheckboxGroup> {
  /**
   * Stack the boxes in a column, or wrap them into a row.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical'
}

function CheckboxGroup({ className, orientation = 'vertical', ...props }: CheckboxGroupProps) {
  const horizontal = orientation === 'horizontal'
  return (
    <BaseCheckboxGroup
      data-slot="checkbox-group"
      className={cn('flex', horizontal ? 'flex-wrap gap-4' : 'flex-col gap-2', className)}
      {...props}
    />
  )
}

export { CheckboxGroup }
export type { CheckboxGroupProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">checkbox group</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-checkbox`,
    name: `Checkbox (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── checkbox/checkbox.tsx ───
'use client'

import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn, useComposedRefs } from '../../internal/utils'

const SQUISH_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number],
}

const ZERO_TRANSITION = { duration: 0 } as const

function CheckboxIndicator({
  checked,
  indeterminate,
  reduced,
}: {
  checked: boolean
  indeterminate: boolean
  reduced: boolean
}) {
  const showCheck = checked && !indeterminate
  const showDash = indeterminate

  return (
    <BaseCheckbox.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center" keepMounted>
      <svg
        className="text-primary-foreground size-[1em] min-h-4 min-w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <m.path
          d="M4 8.5l2.5 2.5 5.5-5.5"
          style={{ strokeDasharray: 20 }}
          initial={false}
          animate={{
            strokeDashoffset: showCheck ? 0 : 20,
            opacity: showDash ? 0 : 1,
          }}
          transition={
            reduced
              ? ZERO_TRANSITION
              : {
                  strokeDashoffset: {
                    duration: showCheck ? 0.3 : 0,
                    ease: 'easeOut',
                    delay: showCheck ? 0.15 : 0,
                  },
                  opacity: { duration: 0.1 },
                }
          }
        />
        <m.line
          x1="4"
          y1="8"
          x2="12"
          y2="8"
          initial={false}
          animate={{
            scaleX: showDash ? 1 : 0,
            opacity: showDash ? 1 : 0,
          }}
          transition={
            reduced
              ? ZERO_TRANSITION
              : {
                  scaleX: {
                    duration: showDash ? 0.2 : 0,
                    ease: 'easeOut',
                    delay: showDash ? 0.15 : 0,
                  },
                  opacity: {
                    duration: showDash ? 0.15 : 0,
                    delay: showDash ? 0.2 : 0,
                  },
                }
          }
        />
      </svg>
    </BaseCheckbox.Indicator>
  )
}

function CheckboxRoot({
  renderProps,
  state,
  reduced,
}: {
  renderProps: React.ComponentPropsWithRef<'span'>
  state: { checked: boolean; indeterminate: boolean }
  reduced: boolean
}) {
  const { checked, indeterminate } = state
  const { ref, ...htmlProps } = renderProps
  const [scope, animate] = useAnimate()
  const composedRef = useComposedRefs(ref, scope)

  const prevState = React.useRef({ checked, indeterminate })
  React.useEffect(() => {
    const toggled = prevState.current.checked !== checked || prevState.current.indeterminate !== indeterminate
    prevState.current = { checked, indeterminate }
    if (toggled && !reduced) {
      animate(scope.current, { scale: [1, 0.8, 1.1, 1] }, SQUISH_TRANSITION)
    }
  }, [checked, indeterminate, animate, scope, reduced])

  return (
    <span data-slot="checkbox" {...htmlProps} ref={composedRef}>
      <CheckboxIndicator checked={checked} indeterminate={indeterminate} reduced={reduced} />
    </span>
  )
}

type CheckboxProps = React.ComponentProps<typeof BaseCheckbox.Root>

function Checkbox({ className, ...props }: CheckboxProps) {
  const reduced = useReducedMotion()

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseCheckbox.Root
        {...props}
        {...(invalid ? { 'data-invalid': '' } : {})}
        className={cn(
          'flex size-[1em] min-h-4 min-w-4 shrink-0 cursor-default items-center justify-center',
          'bg-background border-border-strong outline-ring-input rounded-[calc(tan(atan2(var(--radius-3xs),1rem))*100%)] border',
          'transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
          'hover:not-data-checked:not-data-indeterminate:not-data-disabled:not-data-invalid:border-border-emphasis',
          'focus-visible:border-transparent!',
          'data-checked:bg-primary data-checked:outline-ring-primary data-checked:border-transparent',
          'data-indeterminate:bg-primary data-indeterminate:outline-ring-primary data-indeterminate:border-transparent',
          'data-disabled:not-data-checked:not-data-indeterminate:bg-background-subtle data-disabled:data-checked:opacity-disabled data-disabled:data-indeterminate:opacity-disabled data-disabled:cursor-not-allowed data-disabled:not-data-checked:not-data-indeterminate:border-dashed',
          'data-invalid:border-error data-invalid:not-data-checked:not-data-indeterminate:bg-error-subtle data-invalid:outline-ring-error',
          className,
        )}
        render={(renderProps, state) => <CheckboxRoot renderProps={renderProps} state={state} reduced={reduced} />}
      />
    </LazyMotion>
  )
}

export { Checkbox }
export type { CheckboxProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">checkbox</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-chip`,
    name: `Chip (Appica)`,
    category: `Badges`,
    tags: [`badge`, `appica`],
    code: `// ─── chip/chip.tsx ───
'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import { cn, focusableProps } from '../../internal/utils'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { buttonVariants } from '../button/button-variants'

const chipSizeVariants = cva('', {
  variants: {
    size: {
      sm: "h-6 gap-0.75 rounded-xs px-2 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      md: "h-8 gap-1 rounded-sm px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4",
      lg: "h-10 gap-1.25 rounded-md px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-4.5",
    },
  },
  defaultVariants: { size: 'md' },
})

type ChipVariant = 'soft' | 'outline' | 'primary' | 'secondary' | 'destructive'
type ChipSize = NonNullable<VariantProps<typeof chipSizeVariants>['size']>

type ChipState = {
  variant: ChipVariant
  size: ChipSize
  dismissible: boolean
}

interface ChipGroupContextValue {
  register: (dismiss: () => void) => () => void
  variant?: ChipVariant
  size?: ChipSize
}

const ChipGroupContext = React.createContext<ChipGroupContextValue | null>(null)

interface ChipProps extends Omit<useRender.ComponentProps<'button', ChipState>, 'render'> {
  /**
   * Visual style, from the shared [\`Button\`](/ui/components/react/button) palette. Inherited from \`ChipGroup\`.
   * @default 'soft'
   */
  variant?: ChipVariant
  /**
   * Height, padding, text, and icon size. Inherited from \`ChipGroup\`.
   * @default 'md'
   */
  size?: ChipSize
  /** Replace the underlying element (e.g. an \`<a>\`), or compose it with another component. */
  render?: useRender.ComponentProps<'button', ChipState>['render']
  /**
   * Render a close button; clicking the chip dismisses it with an exit animation.
   * @default false
   */
  dismissible?: boolean
  /**
   * Controlled visibility for a **dismissible** chip - pair with \`onOpenChange\` to own dismissal in your own state.
   * (For a non-dismissible chip, render it conditionally instead.)
   */
  open?: boolean
  /**
   * The **intent** signal - fires with \`false\` the moment a dismiss is requested. Use it with \`open\` for controlled
   * mode: update your state here.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * The **completion** signal - fires once the exit animation finishes. Use it in uncontrolled mode to drop the chip
   * from state after it's animated out.
   */
  onDismiss?: () => void
  /**
   * Accessible label for the dismiss action (rendered as \`sr-only\` text).
   * @default 'Dismiss'
   */
  closeLabel?: string
}

const exitDefault = {
  opacity: 0,
  scale: 0.85,
  filter: 'blur(8px)',
} as const

const exitReduced = { opacity: 0 } as const

const transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const } as const
const reducedTransition = { duration: 0 } as const

const closeIconSize: Record<ChipSize, string> = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4',
}

function Chip({
  className,
  variant,
  size,
  render,
  dismissible = false,
  open,
  onOpenChange,
  onDismiss,
  closeLabel = 'Dismiss',
  children,
  onClick,
  ...props
}: ChipProps) {
  const group = React.useContext(ChipGroupContext)
  const resolvedVariant: ChipVariant = variant ?? group?.variant ?? 'soft'
  const resolvedSize: ChipSize = size ?? group?.size ?? 'md'

  const reduced = useReducedMotion()
  const [internalOpen, setInternalOpen] = React.useState(true)
  const isControlled = open !== undefined
  const actualOpen = isControlled ? open : internalOpen

  const triggerDismiss = React.useCallback(() => {
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  React.useEffect(() => {
    if (!group || !dismissible) return
    return group.register(triggerDismiss)
  }, [group, dismissible, triggerDismiss])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>)
    if (event.defaultPrevented) return
    if (dismissible) triggerDismiss()
  }

  const composedChildren = dismissible ? (
    <>
      {children}
      <ChipCloseIcon size={resolvedSize} />
      <span className="sr-only">{closeLabel}</span>
    </>
  ) : (
    children
  )

  const chipElement = useRender({
    defaultTagName: 'button',
    render,
    state: { variant: resolvedVariant, size: resolvedSize, dismissible } satisfies ChipState,
    props: mergeProps<'button'>(
      {
        'data-slot': 'chip',
        'data-dismissible': dismissible || undefined,
        type: render ? undefined : 'button',
        ...focusableProps(props.disabled),
        className: cn(
          buttonVariants({ variant: resolvedVariant }),
          chipSizeVariants({ size: resolvedSize }),
          dismissible && 'group/chip',
          className,
        ),
        onClick: handleClick,
        children: composedChildren,
      } as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>,
      props,
    ),
  })

  if (!dismissible) return chipElement

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence initial={false} onExitComplete={() => onDismiss?.()}>
        {actualOpen && (
          <m.span
            key="chip"
            initial={false}
            exit={reduced ? exitReduced : exitDefault}
            transition={reduced ? reducedTransition : transition}
            className="inline-flex align-middle"
          >
            {chipElement}
          </m.span>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}

interface ChipCloseIconProps {
  size: ChipSize
}

function ChipCloseIcon({ size }: ChipCloseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      data-slot="chip-close-icon"
      data-icon="end"
      className={cn(
        closeIconSize[size],
        'opacity-60 transition-opacity duration-200 group-hover/chip:opacity-100 motion-reduce:transition-none',
      )}
    >
      <path d="M11.523 3.522c.264-.264.691-.264.955 0s.264.691 0 .955L8.955 8l3.522 3.522c.264.264.264.691 0 .955s-.691.264-.955 0L8 8.955l-3.522 3.522c-.264.264-.691.264-.955 0s-.264-.691 0-.955L7.045 8 3.522 4.478c-.264-.264-.264-.691 0-.955s.691-.264.955 0L8 7.045l3.523-3.522z" />
    </svg>
  )
}

interface ChipGroupHandle {
  clearAll: () => void
}

interface ChipGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Exposes \`clearAll()\`, which dismisses every \`dismissible\` child. */
  ref?: React.Ref<ChipGroupHandle>
  /** Default \`variant\` for every child chip; a chip may override it. */
  variant?: ChipVariant
  /** Default \`size\` for every child chip; a chip may override it. */
  size?: ChipSize
}

function ChipGroup({ ref, className, variant, size, children, ...props }: ChipGroupProps) {
  const dismissersRef = React.useRef<Set<() => void>>(null as unknown as Set<() => void>)
  if (dismissersRef.current === null) {
    dismissersRef.current = new Set<() => void>()
  }

  React.useImperativeHandle(
    ref,
    () => ({
      clearAll: () => {
        dismissersRef.current.forEach((dismiss) => dismiss())
      },
    }),
    [],
  )

  const contextValue = React.useMemo<ChipGroupContextValue>(
    () => ({
      register: (dismiss) => {
        dismissersRef.current.add(dismiss)
        return () => {
          dismissersRef.current.delete(dismiss)
        }
      },
      variant,
      size,
    }),
    [variant, size],
  )

  return (
    <ChipGroupContext.Provider value={contextValue}>
      <div data-slot="chip-group" className={cn('flex flex-wrap items-center gap-2', className)} {...props}>
        {children}
      </div>
    </ChipGroupContext.Provider>
  )
}

export { Chip, ChipGroup }
export type { ChipProps, ChipGroupProps, ChipGroupHandle }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">chip</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-collapsible`,
    name: `Collapsible (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── collapsible/collapsible.tsx ───
import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { cn } from '../../internal/utils'

type CollapsibleProps = React.ComponentProps<typeof BaseCollapsible.Root>

function Collapsible({ className, ...props }: CollapsibleProps) {
  return <BaseCollapsible.Root data-slot="collapsible" className={cn(className)} {...props} />
}

type CollapsibleTriggerProps = React.ComponentProps<typeof BaseCollapsible.Trigger>

function CollapsibleTrigger({ className, ...props }: CollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'outline-ring cursor-pointer select-none',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}

type CollapsibleContentProps = React.ComponentProps<typeof BaseCollapsible.Panel>

function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <BaseCollapsible.Panel
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden',
        'h-(--collapsible-panel-height)',
        'data-ending-style:h-0 data-starting-style:h-0',
        'transition-[height] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
export type { CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">collapsible</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-color-area`,
    name: `Color Area (Appica)`,
    category: `Forms`,
    tags: [`color`, `picker`, `appica`],
    code: `// ─── color-area/color-area.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import {
  COLOR_CONTROL_GROUP,
  type ColorControlSpace,
  colorControlRootClasses,
  colorControlSurfaceClasses,
  colorControlThumbClasses,
  resolveControlSpace,
  snapToStep,
} from '../../internal/color-control'
import { useColorControl } from '../../internal/color-picker-context'
import {
  type Color,
  type ColorChannel,
  convertColor,
  formatChannelValue,
  formatColor,
  getChannelName,
  getChannelRange,
  getChannelValue,
  getColorChannels,
  getColorSpaceAxes,
  parseColor,
  withChannelValue,
} from '../../lib/color'

const DEFAULT_VALUE = '#ffffff'

interface PlaneProps {
  space: ColorControlSpace
  xChannel: ColorChannel
  yChannel: ColorChannel
  zChannel: ColorChannel
  zValue: number
  mirrored: boolean
}

function gradientBackground({
  space,
  xChannel,
  yChannel,
  zChannel,
  zValue,
  mirrored,
}: PlaneProps): React.CSSProperties {
  const end = mirrored ? 'left' : 'right'

  if (space === 'rgb') {
    const black = parseColor('rgb(0, 0, 0)')
    const only = (channel: ColorChannel, value: number) => formatColor(withChannelValue(black, channel, value))
    return {
      // \`screen\` multiplies the inverses, so one channel per layer recombines them.
      backgroundImage: [
        \`linear-gradient(to \${end}, \${only(xChannel, 0)}, \${only(xChannel, 255)})\`,
        \`linear-gradient(to top, \${only(yChannel, 0)}, \${only(yChannel, 255)})\`,
        \`linear-gradient(\${only(zChannel, zValue)}, \${only(zChannel, zValue)})\`,
      ].join(', '),
      backgroundBlendMode: 'screen',
    }
  }

  const base = withChannelValue(
    parseColor(space === 'hsl' ? 'hsl(0, 100%, 50%)' : 'hsb(0, 100%, 100%)'),
    zChannel,
    zValue,
  )

  const stops = (channel: ColorChannel): string => {
    switch (channel) {
      case 'hue':
        return [0, 60, 120, 180, 240, 300, 360].map((hue) => formatColor(withChannelValue(base, 'hue', hue))).join(', ')
      case 'saturation':
        return \`\${formatColor(withChannelValue(base, 'saturation', 0))}, transparent\`
      case 'lightness':
        return 'black, transparent, white'
      default:
        return 'black, transparent'
    }
  }

  // Later layers paint underneath: the vertical one goes first so the horizontal
  // one shows through where it fades to transparent.
  const layers = [\`linear-gradient(to top, \${stops(yChannel)})\`, \`linear-gradient(to \${end}, \${stops(xChannel)})\`]
  if (zChannel === 'hue') layers.push(\`linear-gradient(\${formatColor(base)}, \${formatColor(base)})\`)

  return { backgroundImage: layers.join(', ') }
}

const rootClasses = \`\${COLOR_CONTROL_GROUP} \${colorControlRootClasses} size-56 rounded-lg\`

interface ColorAreaProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  /**
   * Selected color. Pass a \`Color\` or any CSS color string to control the component.
   * Inside a \`ColorPicker\` it can be left off: the control then reads and writes the
   * picker's color.
   */
  value?: Color | string
  /**
   * Color selected before any interaction, when the component is uncontrolled.
   * @default '#ffffff'
   */
  defaultValue?: Color | string
  /** Fires on every change, including each frame of a drag. */
  onValueChange?: (value: Color) => void
  /** Fires once a drag ends or a key press settles, with the color that was landed on. */
  onValueCommitted?: (value: Color) => void
  /**
   * Color space the axes operate in. Defaults to the space of the value, so a color
   * parsed from \`hsl(...)\` gives an HSL area and a hex one gives an RGB area. The
   * space is independent of the format you store: convert on the way out.
   */
  colorSpace?: ColorControlSpace
  /**
   * Channel mapped to the horizontal axis. Defaults to the first channel of the color
   * space that \`yChannel\` has not taken.
   */
  xChannel?: ColorChannel
  /**
   * Channel mapped to the vertical axis, increasing upwards. Defaults to the first
   * channel of the color space left free by \`xChannel\`.
   */
  yChannel?: ColorChannel
  /**
   * Prevent interaction and dim the area.
   * @default false
   */
  disabled?: boolean
  /** Name of the hidden horizontal input, used when submitting an HTML form. */
  xName?: string
  /** Name of the hidden vertical input, used when submitting an HTML form. */
  yName?: string
  /** \`id\` of the \`<form>\` the hidden inputs belong to, when they sit outside it. */
  form?: string
  /** Props for the thumb element, for styling or a test id. */
  thumbProps?: React.ComponentPropsWithoutRef<'span'>
}

function ColorArea({
  value,
  defaultValue = DEFAULT_VALUE,
  onValueChange,
  onValueCommitted,
  colorSpace,
  xChannel: xChannelProp,
  yChannel: yChannelProp,
  disabled: disabledProp,
  xName,
  yName,
  form,
  thumbProps,
  className,
  children,
  'aria-label': ariaLabel = 'Color picker',
  ...props
}: ColorAreaProps) {
  const mirrored = useDirection() === 'rtl'

  const containerRef = React.useRef<HTMLDivElement>(null)
  const xInputRef = React.useRef<HTMLInputElement>(null)
  const yInputRef = React.useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = React.useState(false)
  const [focusedAxis, setFocusedAxis] = React.useState<'x' | 'y'>('x')

  const control = useColorControl({ value, defaultValue, onValueChange, onValueCommitted, disabled: disabledProp })
  const disabled = control.disabled
  const space = resolveControlSpace(control.color.space, undefined, colorSpace)
  const color = convertColor(control.color, space)

  const { xChannel, yChannel, zChannel } = getColorSpaceAxes(space, {
    xChannel: xChannelProp,
    yChannel: yChannelProp,
  })
  const xRange = getChannelRange(space, xChannel)
  const yRange = getChannelRange(space, yChannel)
  const xValue = getChannelValue(color, xChannel)
  const yValue = getChannelValue(color, yChannel)
  const zValue = getChannelValue(color, zChannel)

  const latestRef = React.useRef<Color>(color)
  latestRef.current = color

  const setColor = (next: Color) => {
    latestRef.current = next
    control.setColor(next)
  }

  const setChannel = (channel: ColorChannel, next: number) => {
    const range = getChannelRange(space, channel)
    const snapped = snapToStep(next, range.minValue, range.maxValue, range.step)
    if (snapped === getChannelValue(latestRef.current, channel)) return
    setColor(withChannelValue(latestRef.current, channel, snapped))
  }

  const setFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return

    const ratioX = (clientX - rect.left) / rect.width
    const x = Math.min(Math.max(mirrored ? 1 - ratioX : ratioX, 0), 1)
    const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1)

    const nextX = snapToStep(
      xRange.minValue + x * (xRange.maxValue - xRange.minValue),
      xRange.minValue,
      xRange.maxValue,
      xRange.step,
    )
    const nextY = snapToStep(
      yRange.minValue + (1 - y) * (yRange.maxValue - yRange.minValue),
      yRange.minValue,
      yRange.maxValue,
      yRange.step,
    )

    const current = latestRef.current
    if (nextX === getChannelValue(current, xChannel) && nextY === getChannelValue(current, yChannel)) return
    setColor(withChannelValue(withChannelValue(current, xChannel, nextX), yChannel, nextY))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    setDragging(true)
    setFromPoint(event.clientX, event.clientY)
    xInputRef.current?.focus({ preventScroll: true })
    try {
      // Capture last: it throws when the pointer is already gone, by which point the
      // press has been applied and a failure only costs tracking outside the element.
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromPoint(event.clientX, event.clientY)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
    control.commitColor(latestRef.current)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const xStep = event.shiftKey ? xRange.pageSize : xRange.step
    const yStep = event.shiftKey ? yRange.pageSize : yRange.step
    const sign = mirrored ? -1 : 1

    const moves: Record<string, [ColorChannel, number, 'x' | 'y'] | undefined> = {
      ArrowLeft: [xChannel, -sign * xStep, 'x'],
      ArrowRight: [xChannel, sign * xStep, 'x'],
      ArrowUp: [yChannel, yStep, 'y'],
      ArrowDown: [yChannel, -yStep, 'y'],
      PageUp: [yChannel, yRange.pageSize, 'y'],
      PageDown: [yChannel, -yRange.pageSize, 'y'],
      Home: [xChannel, -sign * xRange.pageSize, 'x'],
      End: [xChannel, sign * xRange.pageSize, 'x'],
    }

    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const [channel, delta, axis] = move
    setChannel(channel, getChannelValue(latestRef.current, channel) + delta)
    setFocusedAxis(axis)
    ;(axis === 'x' ? xInputRef : yInputRef).current?.focus({ preventScroll: true })
    control.commitColor(latestRef.current)
  }

  const background = React.useMemo(
    () => gradientBackground({ space, xChannel, yChannel, zChannel, zValue, mirrored }),
    [space, xChannel, yChannel, zChannel, zValue, mirrored],
  )

  const valueText = getColorChannels(space)
    .map((channel) => \`\${getChannelName(channel)} \${formatChannelValue(color, channel)}\`)
    .join(', ')

  const state = {
    'data-disabled': disabled ? '' : undefined,
    'data-dragging': dragging ? '' : undefined,
  }

  const axisInputProps = (axis: 'x' | 'y') => {
    const channel = axis === 'x' ? xChannel : yChannel
    const range = axis === 'x' ? xRange : yRange
    return {
      type: 'range' as const,
      className: 'sr-only',
      form,
      disabled,
      name: axis === 'x' ? xName : yName,
      min: range.minValue,
      max: range.maxValue,
      step: range.step,
      value: axis === 'x' ? xValue : yValue,
      tabIndex: focusedAxis === axis ? 0 : -1,
      'aria-label': \`\${ariaLabel}, \${getChannelName(channel)}\`,
      'aria-valuetext': valueText,
      'aria-orientation': axis === 'x' ? ('horizontal' as const) : ('vertical' as const),
      'aria-roledescription': 'two-dimensional slider',
      onFocus: () => setFocusedAxis(axis),
      onKeyDown: handleKeyDown,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setChannel(channel, Number.parseFloat(event.target.value)),
    }
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      {...props}
      data-slot="color-area"
      data-space={space}
      {...state}
      className={cn(rootClasses, className)}
      style={{ ...(disabled ? undefined : background), ...props.style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span data-slot="color-area-surface" aria-hidden="true" className={colorControlSurfaceClasses} />

      <input ref={xInputRef} {...axisInputProps('x')} />
      <input ref={yInputRef} {...axisInputProps('y')} />

      <span
        data-slot="color-area-thumb"
        {...state}
        {...thumbProps}
        className={cn(colorControlThumbClasses, thumbProps?.className)}
        style={{
          insetInlineStart: \`\${((xValue - xRange.minValue) / (xRange.maxValue - xRange.minValue)) * 100}%\`,
          top: \`\${(1 - (yValue - yRange.minValue) / (yRange.maxValue - yRange.minValue)) * 100}%\`,
          backgroundColor: disabled ? undefined : formatColor(withChannelValue(color, 'alpha', 1)),
          ...thumbProps?.style,
        }}
      />

      {children}
    </div>
  )
}

export { ColorArea }
export type { ColorAreaProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">color area</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-color-picker`,
    name: `Color Picker (Appica)`,
    category: `Forms`,
    tags: [`color`, `picker`, `appica`],
    code: `// ─── color-picker/color-picker.tsx ───
'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import { describeColor, normalizeColor } from '../../internal/color-control'
import {
  ColorPickerContext,
  type ColorPickerContextValue,
  useRequiredColorPickerContext,
} from '../../internal/color-picker-context'
import { ColorArea } from '../color-area/color-area'
import { ColorSlider } from '../color-slider/color-slider'
import { ColorSwatch, type ColorSwatchProps } from '../color-swatch/color-swatch'
import { buttonVariants } from '../button/button-variants'
import { Input, type InputProps } from '../input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
} from '../popover/popover'
import { type Color, type ColorFormat, formatColor, safeParseColor, withChannelValue } from '../../lib/color'

const DEFAULT_VALUE = '#ffffff'

type ColorPickerSize = 'sm' | 'md' | 'lg'
type ColorPickerVariant = 'ghost' | 'outline' | 'soft' | 'flush'
type ColorPickerSwatchPosition = 'start' | 'end'
type ColorPickerSwatchShape = NonNullable<ColorSwatchProps['shape']>

const TRIGGER_SIZES: Record<ColorPickerSize, { button: ColorPickerSize; swatch: number; iconSwatch: number }> = {
  // A swatch-only trigger is square, so its swatch takes the next size up.
  sm: { button: 'sm', swatch: 20, iconSwatch: 24 },
  md: { button: 'md', swatch: 24, iconSwatch: 28 },
  lg: { button: 'lg', swatch: 28, iconSwatch: 32 },
}

const ICON_BUTTON_SIZES: Record<ColorPickerSize, 'icon-sm' | 'icon-md' | 'icon-lg'> = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
}

/**
 * \`flush\` is \`ghost\` with the button shell taken off: no box, no padding, no corner and
 * no hover fill, so the swatch lines up with whatever sits above or below it.
 */
const FLUSH_CLASSES =
  'size-auto rounded-none p-0 hover:before:bg-transparent data-popup-open:before:bg-transparent data-pressed:before:bg-transparent'

/**
 * Pulls the swatch back out of the button's \`px-*\` so the gap beside it matches the one
 * the button's height leaves above and below it: half the difference between the two,
 * at every size. A swatch-only trigger is already square, so it needs none of this.
 */
const SWATCH_OFFSETS: Record<ColorPickerSize, Record<ColorPickerSwatchPosition, string>> = {
  sm: { start: '-ms-2.5', end: '-me-2.5' },
  md: { start: '-ms-3', end: '-me-3' },
  lg: { start: '-ms-3.5', end: '-me-3.5' },
}

const FORMAT_LABELS: Record<ColorFormat, string> = {
  hex: 'Hex',
  hexa: 'Hex',
  rgb: 'RGB',
  rgba: 'RGB',
  hsl: 'HSL',
  hsla: 'HSL',
  hsb: 'HSB',
  hsba: 'HSB',
  oklch: 'OKLCH',
  oklcha: 'OKLCH',
}

const OPAQUE_FORMATS: Partial<Record<ColorFormat, ColorFormat>> = {
  hexa: 'hex',
  rgba: 'rgb',
  hsla: 'hsl',
  hsba: 'hsb',
  oklcha: 'oklch',
}

/**
 * An alpha-carrying format drops back to its opaque twin at full opacity, so a solid
 * color is written \`#a855f7\` rather than \`#a855f7ff\` and only grows the alpha when
 * there is one to show.
 */
function displayFormat(format: ColorFormat, color: Color): ColorFormat {
  return color.alpha < 1 ? format : (OPAQUE_FORMATS[format] ?? format)
}

const panelClasses = 'flex w-fit min-w-50 flex-col gap-3'

interface ColorPickerProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'color' | 'defaultValue' | 'onChange' | 'children'
> {
  /** Selected color. Pass a \`Color\` or any CSS color string to control the component. */
  value?: Color | string
  /**
   * Color selected before any interaction, when the component is uncontrolled.
   * @default '#ffffff'
   */
  defaultValue?: Color | string
  /** Fires on every change, including each frame of a drag inside the panel. */
  onValueChange?: (value: Color) => void
  /** Fires once a gesture ends, with the color that was landed on. */
  onValueCommitted?: (value: Color) => void
  /**
   * Panel contents. Any \`ColorArea\`, \`ColorSlider\`, \`ColorSwatch\` or \`ColorSwatchPicker\`
   * in here reads and writes the picker's color, so no value wiring is needed. Leave it
   * off for the default panel: an HSB area, a hue slider and a text input, plus a preview
   * swatch when \`inline\` leaves no trigger to show one.
   */
  children?: React.ReactNode
  /**
   * Format the trigger and the text input write the color in. Defaults to \`'hexa'\` when
   * \`alpha\` is set. An alpha format collapses to its opaque twin whenever the color is
   * fully opaque, so a solid color never picks up a trailing \`ff\`.
   * @default 'hex'
   */
  format?: ColorFormat
  /**
   * Add an alpha slider to the default panel, and back the preview with a checkerboard.
   * @default false
   */
  alpha?: boolean
  /**
   * Add a screen color-sampling button to the default panel. It renders only where the
   * browser supports the EyeDropper API, so there is no dead control on Firefox or Safari.
   * @default false
   */
  eyedropper?: boolean
  /**
   * Render the panel in place instead of behind a trigger and a popover. The trigger
   * props (\`label\`, \`trigger\`, \`size\`, the popover ones) do nothing in this mode.
   * @default false
   */
  inline?: boolean
  /**
   * Prevent interaction and dim the trigger and every control in the panel.
   * @default false
   */
  disabled?: boolean
  /**
   * Height and text scale of the default trigger.
   * @default 'md'
   */
  size?: ColorPickerSize
  /**
   * Visual style of the default trigger, from \`Button\`'s set. \`flush\` takes the button
   * shell off entirely, leaving the swatch and the label on their own.
   * @default 'ghost'
   */
  variant?: ColorPickerVariant
  /**
   * Text beside the swatch in the default trigger. Defaults to the color, formatted with
   * \`format\`. Pass \`null\` for a swatch-only square button, and pair a non-string node
   * with \`aria-label\`.
   */
  label?: React.ReactNode
  /**
   * Rounded square or full circle, for the swatch on the default trigger.
   * @default 'rounded'
   */
  swatchShape?: ColorPickerSwatchShape
  /**
   * Which side of the label the default trigger's swatch sits on. It is inset from that
   * edge by the same gap the button's height leaves above and below it.
   * @default 'start'
   */
  swatchPosition?: ColorPickerSwatchPosition
  /**
   * Element to open the panel from, in place of the default swatch button. \`null\` renders
   * no trigger at all, for a panel driven by \`open\` and pointed at something you own with
   * \`popoverProps.anchor\`. \`className\` and the forwarded attributes land on the trigger,
   * so they have nowhere to go in that mode.
   */
  trigger?: React.ReactElement | null
  /** Controlled open state of the popover. Pair with \`onOpenChange\`. */
  open?: boolean
  /**
   * Uncontrolled initial open state of the popover.
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Fires when the popover opens or closes. The second argument carries the \`reason\` and
   * a \`cancel()\` that stops Base UI acting on the event.
   */
  onOpenChange?: PopoverProps['onOpenChange']
  /**
   * Preferred popover side.
   * @default 'bottom'
   */
  side?: PopoverContentProps['side']
  /**
   * Popover alignment.
   * @default 'start'
   */
  align?: PopoverContentProps['align']
  /**
   * Gap between the trigger and the popover.
   * @default 6
   */
  sideOffset?: number
  /** Escape hatch forwarded to the inner \`PopoverContent\` (collision props, \`className\`, …). */
  popoverProps?: Partial<PopoverContentProps>
  /** Name of the hidden input, used when submitting an HTML form. */
  name?: string
  /** \`id\` of the \`<form>\` the hidden input belongs to, when it sits outside it. */
  form?: string
}

function ColorPicker({
  value,
  defaultValue = DEFAULT_VALUE,
  onValueChange,
  onValueCommitted,
  children,
  format: formatProp,
  alpha = false,
  eyedropper = false,
  inline = false,
  disabled = false,
  size = 'md',
  variant = 'ghost',
  label,
  swatchShape = 'rounded',
  swatchPosition = 'start',
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  popoverProps,
  name,
  form,
  className,
  'aria-label': ariaLabel,
  ...props
}: ColorPickerProps) {
  const [uncontrolled, setUncontrolled] = React.useState<Color>(() => normalizeColor(defaultValue))
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

  const controlled = value !== undefined
  const color = controlled ? normalizeColor(value) : uncontrolled
  const format = formatProp ?? (alpha ? 'hexa' : 'hex')

  // Kept in a ref so the context object only changes with the color, not with a caller
  // that re-creates its handlers on every render.
  const latestRef = React.useRef({ controlled, onValueChange, onValueCommitted })
  latestRef.current = { controlled, onValueChange, onValueCommitted }

  const context = React.useMemo<ColorPickerContextValue>(
    () => ({
      value: color,
      format,
      disabled,
      setValue: (next) => {
        if (!latestRef.current.controlled) setUncontrolled(next)
        latestRef.current.onValueChange?.(next)
      },
      commitValue: (next) => latestRef.current.onValueCommitted?.(next),
    }),
    [color, format, disabled],
  )

  const panel = children ?? (
    <>
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" aria-label="Saturation and brightness" />
      <div className="flex items-center gap-3">
        {eyedropper && <ColorPickerEyeDropper />}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ColorSlider channel="hue" />
          {alpha && <ColorSlider channel="alpha" />}
        </div>
        {/* The trigger already previews the color; only an inline panel has to. */}
        {inline && <ColorSwatch size="sm" shape="circle" className="shrink-0" />}
      </div>
      <ColorPickerInput />
    </>
  )

  const valueText = formatColor(color, displayFormat(format, color))
  const hiddenInput = name ? <input type="hidden" name={name} form={form} value={valueText} /> : null

  if (inline) {
    return (
      <ColorPickerContext.Provider value={context}>
        <div
          role="group"
          aria-label={ariaLabel}
          {...props}
          data-slot="color-picker"
          {...(disabled ? { 'data-disabled': '' } : {})}
          className={cn(panelClasses, className)}
        >
          {panel}
          {hiddenInput}
        </div>
      </ColorPickerContext.Provider>
    )
  }

  const description = describeColor(color)
  const iconOnly = label === null
  const sizes = TRIGGER_SIZES[size]
  const swatch = (
    <ColorSwatch
      aria-hidden="true"
      size={iconOnly ? sizes.iconSwatch : sizes.swatch}
      shape={swatchShape}
      className={iconOnly || variant === 'flush' ? undefined : SWATCH_OFFSETS[size][swatchPosition]}
    />
  )

  const defaultTrigger = (
    <button type="button">
      {swatchPosition === 'start' && swatch}
      {!iconOnly && <span>{label ?? valueText}</span>}
      {swatchPosition === 'end' && swatch}
      {!ariaLabel && <span className="sr-only">{description}</span>}
    </button>
  )

  return (
    <ColorPickerContext.Provider value={context}>
      <Popover
        open={open ?? internalOpen}
        onOpenChange={(next, details) => {
          onOpenChange?.(next, details)
          if (open === undefined && !details.isCanceled) setInternalOpen(next)
        }}
      >
        {trigger !== null && (
          <PopoverTrigger
            aria-label={ariaLabel && \`\${ariaLabel}, \${description}\`}
            {...props}
            data-slot="color-picker-trigger"
            disabled={disabled}
            // The variant classes ride on the wrapper so \`cn\` resolves them against a
            // consumer \`className\`; the rendered element carries none of its own.
            className={cn(
              !trigger && [
                buttonVariants({
                  variant: variant === 'flush' ? 'ghost' : variant,
                  size: iconOnly ? ICON_BUTTON_SIZES[size] : sizes.button,
                }),
                variant === 'flush' && FLUSH_CLASSES,
              ],
              className,
            )}
            render={trigger ?? defaultTrigger}
          />
        )}
        <PopoverContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          arrow={false}
          // The popup is a dialog, and a dialog with no title still needs a name.
          aria-label={ariaLabel ?? 'Color picker'}
          {...popoverProps}
          data-slot="color-picker-panel"
          className={cn(panelClasses, 'max-w-none p-3', popoverProps?.className)}
        >
          {panel}
        </PopoverContent>
      </Popover>
      {hiddenInput}
    </ColorPickerContext.Provider>
  )
}

interface ColorPickerInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'color' | 'clearable' | 'onClear'
> {
  /** Format the color is written in. Defaults to the enclosing picker's \`format\`. */
  format?: ColorFormat
}

/**
 * Reads any CSS color string the library can parse, not just the format it prints, so
 * pasting \`rgb(…)\` into a hex field works. A bare \`ff0080\` is accepted as hex too.
 */
function parseInputColor(text: string): Color | undefined {
  const trimmed = text.trim()
  return safeParseColor(/^[0-9a-f]{3,8}$/i.test(trimmed) ? \`#\${trimmed}\` : trimmed)
}

function ColorPickerInput({ format: formatProp, className, ...props }: ColorPickerInputProps) {
  const picker = useRequiredColorPickerContext('ColorPickerInput')
  const format = formatProp ?? picker.format
  const [draft, setDraft] = React.useState<string | null>(null)

  const commit = () => {
    const parsed = draft === null ? undefined : parseInputColor(draft)
    if (parsed) picker.commitValue(parsed)
    setDraft(null)
  }

  return (
    <Input
      inputSize="sm"
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      aria-label={FORMAT_LABELS[format]}
      {...props}
      data-slot="color-picker-input"
      // An <input> is intrinsically 20 characters wide, and \`w-full\` cannot resolve
      // during intrinsic sizing - so in the panel's \`w-fit\` column those 20 characters,
      // not the color area, would decide how wide the panel is. Worse on a coarse
      // pointer, where the field steps up to 16px type.
      inputProps={{ size: 1, ...props.inputProps }}
      disabled={props.disabled ?? picker.disabled}
      value={draft ?? formatColor(picker.value, displayFormat(format, picker.value))}
      className={cn('font-mono', className)}
      onChange={(event) => {
        const next = event.target.value
        setDraft(next)
        const parsed = parseInputColor(next)
        if (parsed) picker.setValue(parsed)
      }}
      onBlur={(event) => {
        props.onBlur?.(event)
        commit()
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
        } else if (event.key === 'Escape') {
          setDraft(null)
        }
      }}
    />
  )
}

interface EyeDropperApi {
  new (): { open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }> }
}

interface ColorPickerEyeDropperProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'children'> {
  /**
   * Visual style, from the same set \`Button\` offers.
   * @default 'ghost'
   */
  variant?: VariantProps<typeof buttonVariants>['variant']
  /**
   * Height and padding, from the same set \`Button\` offers.
   * @default 'icon-sm'
   */
  size?: VariantProps<typeof buttonVariants>['size']
  /** Icon rendered inside the button. */
  children?: React.ReactNode
}

function ColorPickerEyeDropper({
  variant = 'ghost',
  size = 'icon-sm',
  className,
  disabled,
  children = <PipetteIcon />,
  'aria-label': ariaLabel = 'Pick a color from the screen',
  ...props
}: ColorPickerEyeDropperProps) {
  const picker = useRequiredColorPickerContext('ColorPickerEyeDropper')
  // Resolved after mount rather than during render: the server has no \`window\`, and a
  // guess either way would mismatch the client on hydration.
  const [supported, setSupported] = React.useState(false)
  React.useEffect(() => setSupported('EyeDropper' in window), [])

  if (!supported) return null

  const off = disabled ?? picker.disabled

  const sample = async () => {
    const EyeDropper = (window as unknown as { EyeDropper: EyeDropperApi }).EyeDropper
    let result: { sRGBHex: string }
    try {
      result = await new EyeDropper().open()
    } catch {
      return
    }
    const sampled = safeParseColor(result.sRGBHex)
    if (!sampled) return
    // The API only reports opaque colors, so carry the picker's own alpha across.
    const next = withChannelValue(sampled, 'alpha', picker.value.alpha)
    picker.setValue(next)
    picker.commitValue(next)
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      {...props}
      data-slot="color-picker-eyedropper"
      disabled={off}
      {...(off ? { 'data-disabled': '' } : {})}
      className={cn(
        buttonVariants({ variant, size }),
        'text-foreground-muted hover:text-foreground shrink-0',
        className,
      )}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) void sample()
      }}
    >
      {children}
    </button>
  )
}

function PipetteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4Z" />
    </svg>
  )
}

export { ColorPicker, ColorPickerInput, ColorPickerEyeDropper }
export type { ColorPickerProps, ColorPickerInputProps, ColorPickerEyeDropperProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">color picker</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-color-slider`,
    name: `Color Slider (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── color-slider/color-slider.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import {
  COLOR_CONTROL_GROUP,
  type ColorControlSpace,
  colorControlCheckerboard,
  colorControlCheckerboardSize,
  colorControlRootClasses,
  colorControlSurfaceClasses,
  colorControlThumbClasses,
  resolveControlSpace,
  snapToStep,
} from '../../internal/color-control'
import { useColorControl } from '../../internal/color-picker-context'
import {
  type Color,
  type ColorChannel,
  convertColor,
  formatChannelValue,
  formatColor,
  getChannelName,
  getChannelRange,
  getChannelValue,
  parseColor,
  withChannelValue,
} from '../../lib/color'

const DEFAULT_VALUE = '#ffffff'

type ColorSliderOrientation = 'horizontal' | 'vertical'

/**
 * The color the track ramps through, which is not always the value. Hue reads best
 * at full saturation rather than as a ramp through whatever the current color is,
 * and alpha is the one channel that keeps its own transparency.
 */
function trackColor(color: Color, channel: ColorChannel): Color {
  if (channel === 'hue') return parseColor(\`hsl(\${getChannelValue(color, 'hue')}, 100%, 50%)\`)
  return channel === 'alpha' ? color : withChannelValue(color, 'alpha', 1)
}

/** A point along the track, \`inset\` in from each end - the range the thumb reaches. */
function offsetAt(fraction: number, inset: number): string {
  if (inset === 0) return \`\${fraction * 100}%\`
  if (fraction === 0) return \`\${inset}px\`
  if (fraction === 1) return \`calc(100% - \${inset}px)\`
  return \`calc(\${inset}px + (100% - \${inset * 2}px) * \${fraction})\`
}

/**
 * Lays the stops across the thumb's travel rather than the track's full width, so the
 * color under the thumb is the color the slider reports. CSS extends the first and
 * last stop to the ends on its own, which caps the pill in the channel's min and max -
 * the same result HeroUI draws with a pseudo-element at each end.
 */
function ramp(colors: string[], to: string, inset: number): string {
  const last = colors.length - 1
  const stops = colors.map((color, index) => (inset === 0 ? color : \`\${color} \${offsetAt(index / last, inset)}\`))
  return \`linear-gradient(to \${to}, \${stops.join(', ')})\`
}

function trackBackground(color: Color, channel: ColorChannel, to: string, inset: number): string {
  const base = trackColor(color, channel)
  const at = (value: number) => formatColor(withChannelValue(base, channel, value))

  if (channel === 'hue') {
    const hues = [0, 60, 120, 180, 240, 300, 360].map((hue) => formatColor(withChannelValue(base, 'hue', hue)))
    return ramp(hues, to, inset)
  }

  const { minValue, maxValue } = getChannelRange(base.space, channel)
  // Lightness needs the midpoint stop, or the hue drops out and the ramp is just
  // black to white.
  const colors =
    channel === 'lightness' ? [at(minValue), at((minValue + maxValue) / 2), at(maxValue)] : [at(minValue), at(maxValue)]
  return ramp(colors, to, inset)
}

const rootClasses = \`\${COLOR_CONTROL_GROUP} \${colorControlRootClasses} rounded-full data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-5\`

interface ColorSliderProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  /** Channel the track ramps through, and the one the slider changes. */
  channel: ColorChannel
  /**
   * Selected color. Pass a \`Color\` or any CSS color string to control the component.
   * Inside a \`ColorPicker\` it can be left off: the control then reads and writes the
   * picker's color.
   */
  value?: Color | string
  /**
   * Color selected before any interaction, when the component is uncontrolled.
   * @default '#ffffff'
   */
  defaultValue?: Color | string
  /** Fires on every change, including each frame of a drag. */
  onValueChange?: (value: Color) => void
  /** Fires once a drag ends or a key press settles, with the color that was landed on. */
  onValueCommitted?: (value: Color) => void
  /**
   * Color space the channel is read from. Defaults to the space of the value when it
   * carries \`channel\`, so a slider shares a color with an area without converting it.
   */
  colorSpace?: ColorControlSpace
  /**
   * Axis the track runs along. A vertical track fills from the bottom.
   * @default 'horizontal'
   */
  orientation?: ColorSliderOrientation
  /**
   * Prevent interaction and dim the track.
   * @default false
   */
  disabled?: boolean
  /** Name of the hidden input, used when submitting an HTML form. */
  name?: string
  /** \`id\` of the \`<form>\` the hidden input belongs to, when it sits outside it. */
  form?: string
  /** Props for the thumb element, for styling or a test id. */
  thumbProps?: React.ComponentPropsWithoutRef<'span'>
}

function ColorSlider({
  channel,
  value,
  defaultValue = DEFAULT_VALUE,
  onValueChange,
  onValueCommitted,
  colorSpace,
  orientation = 'horizontal',
  disabled: disabledProp,
  name,
  form,
  thumbProps,
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: ColorSliderProps) {
  const mirrored = useDirection() === 'rtl'
  const vertical = orientation === 'vertical'
  const alpha = channel === 'alpha'

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const thumbRef = React.useRef<HTMLSpanElement>(null)

  const [dragging, setDragging] = React.useState(false)
  const [inset, setInset] = React.useState(0)

  const control = useColorControl({ value, defaultValue, onValueChange, onValueCommitted, disabled: disabledProp })
  const disabled = control.disabled
  const space = resolveControlSpace(control.color.space, channel, colorSpace)
  const color = convertColor(control.color, space)

  const range = getChannelRange(space, channel)
  const channelValue = getChannelValue(color, channel)
  const ratio = (channelValue - range.minValue) / (range.maxValue - range.minValue)

  const latestRef = React.useRef<Color>(color)
  latestRef.current = color

  // How far the thumb's center stays off each end: half a thumb, plus the clearance
  // it already has across the track, so it sits inside by the same margin all round.
  // Measured rather than assumed, since \`thumbProps\` can resize it.
  React.useEffect(() => {
    const track = containerRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return

    const measure = () => {
      // Layout sizes, not a bounding rect: the thumb scales while pressed, and a
      // rect would feed that transform back into the geometry.
      const along = vertical ? thumb.offsetHeight : thumb.offsetWidth
      const across = vertical ? thumb.offsetWidth : thumb.offsetHeight
      const thickness = vertical ? track.offsetWidth : track.offsetHeight
      setInset((along + thickness - across) / 2)
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    observer.observe(thumb)
    return () => observer.disconnect()
  }, [vertical])

  const setChannel = (next: number) => {
    const snapped = snapToStep(next, range.minValue, range.maxValue, range.step)
    if (snapped === getChannelValue(latestRef.current, channel)) return
    const updated = withChannelValue(latestRef.current, channel, snapped)
    latestRef.current = updated
    control.setColor(updated)
  }

  const setFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return
    const extent = (vertical ? rect.height : rect.width) - inset * 2
    if (extent <= 0) return
    const along = vertical ? 1 - (clientY - rect.top - inset) / extent : (clientX - rect.left - inset) / extent
    const fraction = Math.min(Math.max(mirrored && !vertical ? 1 - along : along, 0), 1)
    setChannel(range.minValue + fraction * (range.maxValue - range.minValue))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    setDragging(true)
    setFromPoint(event.clientX, event.clientY)
    inputRef.current?.focus({ preventScroll: true })
    try {
      // Capture last: it throws when the pointer is already gone, by which point the
      // press has been applied and a failure only costs tracking outside the element.
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromPoint(event.clientX, event.clientY)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
    control.commitColor(latestRef.current)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const step = event.shiftKey ? range.pageSize : range.step
    const sign = mirrored && !vertical ? -1 : 1

    const deltas: Record<string, number | undefined> = {
      ArrowLeft: -sign * step,
      ArrowRight: sign * step,
      ArrowDown: -step,
      ArrowUp: step,
      PageDown: -range.pageSize,
      PageUp: range.pageSize,
    }

    const current = getChannelValue(latestRef.current, channel)
    const next =
      event.key === 'Home'
        ? range.minValue
        : event.key === 'End'
          ? range.maxValue
          : current + (deltas[event.key] ?? NaN)
    if (Number.isNaN(next)) return

    event.preventDefault()
    setChannel(next)
    control.commitColor(latestRef.current)
  }

  const to = vertical ? 'top' : mirrored ? 'left' : 'right'
  const background = React.useMemo(() => trackBackground(color, channel, to, inset), [color, channel, to, inset])

  const offset = (fraction: number) => offsetAt(fraction, inset)

  const state = {
    'data-disabled': disabled ? '' : undefined,
    'data-dragging': dragging ? '' : undefined,
  }

  return (
    <div
      ref={containerRef}
      {...props}
      data-slot="color-slider"
      data-orientation={orientation}
      data-channel={channel}
      {...state}
      className={cn(rootClasses, className)}
      style={{
        backgroundImage: disabled ? undefined : alpha ? \`\${background}, \${colorControlCheckerboard}\` : background,
        backgroundSize: !disabled && alpha ? \`auto, \${colorControlCheckerboardSize}\` : undefined,
        ...props.style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span data-slot="color-slider-surface" aria-hidden="true" className={colorControlSurfaceClasses} />

      <input
        ref={inputRef}
        type="range"
        className="sr-only"
        form={form}
        name={name}
        disabled={disabled}
        min={range.minValue}
        max={range.maxValue}
        step={range.step}
        value={channelValue}
        aria-label={ariaLabel ?? getChannelName(channel)}
        aria-orientation={orientation}
        aria-valuetext={\`\${formatChannelValue(color, channel)}, \${formatColor(withChannelValue(color, 'alpha', 1), 'hex')}\`}
        onKeyDown={handleKeyDown}
        onChange={(event) => setChannel(Number.parseFloat(event.target.value))}
      />

      <span
        ref={thumbRef}
        data-slot="color-slider-thumb"
        {...state}
        {...thumbProps}
        className={cn(colorControlThumbClasses, thumbProps?.className)}
        style={{
          insetInlineStart: vertical ? '50%' : offset(ratio),
          top: vertical ? offset(1 - ratio) : '50%',
          backgroundColor: disabled ? undefined : formatColor(trackColor(color, channel)),
          ...thumbProps?.style,
        }}
      />

      {children}
    </div>
  )
}

export { ColorSlider }
export type { ColorSliderProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">color slider</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-color-swatch-picker`,
    name: `Color Swatch Picker (Appica)`,
    category: `Forms`,
    tags: [`color`, `picker`, `appica`],
    code: `// ─── color-swatch-picker/color-swatch-picker.tsx ───
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { COLOR_SWATCH_SHAPES, COLOR_SWATCH_SIZES, describeColor, normalizeColor } from '../../internal/color-control'
import { useColorPickerContext } from '../../internal/color-picker-context'
import { ColorSwatch } from '../color-swatch/color-swatch'
import { type Color, formatColor } from '../../lib/color'

const ITEM = '[data-slot=color-swatch-picker-item]'

type ColorSwatchPickerLayout = 'grid' | 'stack'

const pickerVariants = cva('relative isolate flex gap-1', {
  variants: {
    size: COLOR_SWATCH_SIZES,
    layout: {
      grid: 'flex-row flex-wrap',
      stack: 'flex-col',
    },
  },
})

// The button is the outer ring's box, so the swatch has to sit inside it. At 0.8em
// the gap either side is 0.1em, which holds at every size because both are ems.
const itemVariants = cva(
  'outline-ring relative flex size-[1em] shrink-0 transform-gpu cursor-pointer items-center justify-center focus-visible:outline-3 motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)] motion-safe:active:translate-y-px motion-safe:active:scale-90 motion-safe:active:duration-100 motion-safe:active:ease-in-out data-disabled:pointer-events-none data-disabled:cursor-default',
  { variants: { shape: COLOR_SWATCH_SHAPES } },
)

type ColorSwatchPickerSize = NonNullable<VariantProps<typeof pickerVariants>['size']>
type ColorSwatchPickerShape = NonNullable<VariantProps<typeof itemVariants>['shape']>

interface ColorSwatchPickerContextValue {
  colors: Map<string, Color>
  selectedKey: string | null
  select: (color: Color) => void
  shape: ColorSwatchPickerShape
  disabled: boolean
}

const ColorSwatchPickerContext = React.createContext<ColorSwatchPickerContextValue | null>(null)

function usePickerContext() {
  const context = React.useContext(ColorSwatchPickerContext)
  if (!context) throw new Error('Appica UI: <ColorSwatchPickerItem> must be used within <ColorSwatchPicker>.')
  return context
}

/** Where the indicator sits, in the picker's own coordinates. */
interface Indicator {
  x: number
  y: number
  width: number
  height: number
}

function sameBox(a: Indicator | null, b: Indicator) {
  return a != null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

/**
 * The item one row up or down in a wrapped grid, nearest the column the focus is
 * already in. Rows are whatever shares an \`offsetTop\`, since the wrapping is the
 * browser's to decide.
 */
function rowNeighbor(items: HTMLElement[], from: number, step: 1 | -1) {
  const origin = items[from]!
  const beyond = items.filter((item) =>
    step > 0 ? item.offsetTop > origin.offsetTop : item.offsetTop < origin.offsetTop,
  )
  if (beyond.length === 0) return from + step

  const tops = beyond.map((item) => item.offsetTop)
  const row = step > 0 ? Math.min(...tops) : Math.max(...tops)
  const nearest = beyond
    .filter((item) => item.offsetTop === row)
    .reduce((best, item) =>
      Math.abs(item.offsetLeft - origin.offsetLeft) < Math.abs(best.offsetLeft - origin.offsetLeft) ? item : best,
    )
  return items.indexOf(nearest)
}

interface ColorSwatchPickerProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /**
   * Selected color. Pass a \`Color\` or any CSS color string to control the component.
   * Inside a \`ColorPicker\` it can be left off: the control then reads and writes the
   * picker's color.
   */
  value?: Color | string
  /** Color selected before any interaction, when the component is uncontrolled. */
  defaultValue?: Color | string
  /** Fires with the color that was picked. */
  onValueChange?: (value: Color) => void
  /**
   * Wrapping rows of swatches, or a single column.
   * @default 'grid'
   */
  layout?: ColorSwatchPickerLayout
  /**
   * A preset scale, or a pixel number for an exact size. Sizes the button; the swatch
   * inside is smaller, so the selected ring has somewhere to sit.
   * @default 'md'
   */
  size?: ColorSwatchPickerSize | number
  /**
   * Rounded square or full circle, applied to every swatch and to the ring.
   * @default 'rounded'
   */
  shape?: ColorSwatchPickerShape
  /**
   * Prevent interaction and swap every color for a flat muted fill.
   * @default false
   */
  disabled?: boolean
}

function ColorSwatchPicker({
  value,
  defaultValue,
  onValueChange,
  layout = 'grid',
  size = 'md',
  shape = 'rounded',
  disabled: disabledProp,
  className,
  style,
  children,
  ...props
}: ColorSwatchPickerProps) {
  const mirrored = useDirection() === 'rtl'
  const rootRef = React.useRef<HTMLDivElement>(null)
  const colors = React.useMemo(() => new Map<string, Color>(), [])
  const picker = useColorPickerContext()

  const [uncontrolled, setUncontrolled] = React.useState<Color | null>(() =>
    defaultValue === undefined ? null : normalizeColor(defaultValue),
  )
  const [indicator, setIndicator] = React.useState<Indicator | null>(null)

  const disabled = disabledProp || (picker?.disabled ?? false)
  const resolved = value !== undefined ? normalizeColor(value) : (picker?.value ?? uncontrolled)
  // Keyed on hexa like React Aria, so the same color written two ways is one entry.
  const selectedKey = resolved === null ? null : formatColor(resolved, 'hexa')

  const select = (color: Color) => {
    if (value === undefined && !picker) setUncontrolled(color)
    picker?.setValue(color)
    picker?.commitValue(color)
    onValueChange?.(color)
  }

  // No dependency list: this mirrors the rendered DOM back into the roving tab stop
  // and the indicator's box, both of which any render can invalidate.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const sync = () => {
      const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM))
      const selected = items.find((item) => item.getAttribute('aria-selected') === 'true')
      const reachable = selected ?? items.find((item) => !item.hasAttribute('data-disabled'))
      for (const item of items) item.tabIndex = item === reachable ? 0 : -1

      if (!selected) return setIndicator(null)
      const box = {
        x: selected.offsetLeft,
        y: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      }
      setIndicator((previous) => (sameBox(previous, box) ? previous : box))
    }

    sync()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(sync)
    observer.observe(root)
    return () => observer.disconnect()
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>(\`\${ITEM}:not([data-disabled])\`))
    const current = items.indexOf(document.activeElement as HTMLElement)
    if (current < 0) return

    const stack = layout === 'stack'
    const forward = mirrored ? 'ArrowLeft' : 'ArrowRight'
    const backward = mirrored ? 'ArrowRight' : 'ArrowLeft'

    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === forward
            ? current + 1
            : event.key === backward
              ? current - 1
              : event.key === 'ArrowDown'
                ? stack
                  ? current + 1
                  : rowNeighbor(items, current, 1)
                : event.key === 'ArrowUp'
                  ? stack
                    ? current - 1
                    : rowNeighbor(items, current, -1)
                  : NaN
    if (Number.isNaN(next)) return

    event.preventDefault()
    const target = items[(next + items.length) % items.length]
    if (!target) return
    target.focus()
    // Selection follows focus, which is what a single-select listbox is expected to
    // do and what makes arrowing through a palette worth doing at all.
    const color = colors.get(target.dataset.value ?? '')
    if (color) select(color)
  }

  const isNumeric = typeof size === 'number'
  const context: ColorSwatchPickerContextValue = { colors, selectedKey, select, shape, disabled }

  return (
    <ColorSwatchPickerContext.Provider value={context}>
      <div
        ref={rootRef}
        role="listbox"
        aria-orientation={layout === 'stack' ? 'vertical' : 'horizontal'}
        {...props}
        data-slot="color-swatch-picker"
        data-layout={layout}
        {...(disabled ? { 'data-disabled': '' } : {})}
        className={cn(pickerVariants({ layout, size: isNumeric ? undefined : size }), className)}
        style={{ ...(isNumeric ? { fontSize: \`\${size}px\` } : undefined), ...style }}
        onKeyDown={handleKeyDown}
      >
        {children}

        {indicator && (
          <span
            aria-hidden="true"
            data-slot="color-swatch-picker-indicator"
            className={cn(
              'border-border-inverse pointer-events-none absolute top-0 left-0 z-10 border',
              COLOR_SWATCH_SHAPES[shape],
              'motion-safe:transition-[translate,width,height] motion-safe:duration-250',
            )}
            style={{
              translate: \`\${indicator.x}px \${indicator.y}px\`,
              width: indicator.width,
              height: indicator.height,
            }}
          />
        )}
      </div>
    </ColorSwatchPickerContext.Provider>
  )
}

interface ColorSwatchPickerItemProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'value'> {
  /** Color this swatch offers. Pass a \`Color\` or any CSS color string. */
  color: Color | string
  /** Name announced for the color, in place of the description built from the color itself. */
  colorName?: string
  /**
   * Prevent this swatch from being picked, and swap its color for a flat muted fill.
   * @default false
   */
  disabled?: boolean
}

function ColorSwatchPickerItem({
  color,
  colorName,
  disabled = false,
  className,
  children,
  ...props
}: ColorSwatchPickerItemProps) {
  const { colors, selectedKey, select, shape, disabled: pickerDisabled } = usePickerContext()

  const resolved = React.useMemo(() => normalizeColor(color), [color])
  const key = formatColor(resolved, 'hexa')
  const selected = selectedKey === key
  const off = disabled || pickerDisabled

  React.useEffect(() => {
    colors.set(key, resolved)
    return () => {
      colors.delete(key)
    }
  }, [colors, key, resolved])

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={colorName ?? describeColor(resolved)}
      {...props}
      data-slot="color-swatch-picker-item"
      data-value={key}
      {...(off ? { 'data-disabled': '', disabled: true } : {})}
      tabIndex={-1}
      className={cn(itemVariants({ shape }), className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) select(resolved)
      }}
    >
      {/* The button carries the name, so a second one on the swatch would double it. */}
      <ColorSwatch aria-hidden="true" color={resolved} shape={shape} disabled={off} className="text-[0.8em]" />
      {children}
    </button>
  )
}

export { ColorSwatchPicker, ColorSwatchPickerItem }
export type { ColorSwatchPickerProps, ColorSwatchPickerItemProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">color swatch picker</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-color-swatch`,
    name: `Color Swatch (Appica)`,
    category: `Forms`,
    tags: [`color`, `picker`, `appica`],
    code: `// ─── color-swatch/color-swatch.tsx ───
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import {
  COLOR_CONTROL_GROUP,
  COLOR_SWATCH_SHAPES,
  COLOR_SWATCH_SIZES,
  colorControlCheckerboard,
  colorControlDisabledClasses,
  colorControlSurfaceClasses,
  describeColor,
  normalizeColor,
} from '../../internal/color-control'
import { useColorPickerContext } from '../../internal/color-picker-context'
import { type Color, formatColor } from '../../lib/color'

const CHECKERBOARD_SIZE = '0.3em 0.3em'

const colorSwatchVariants = cva(
  \`\${COLOR_CONTROL_GROUP} \${colorControlDisabledClasses} relative isolate inline-flex size-[1em] shrink-0 items-center justify-center forced-color-adjust-none [&_svg:not([class*='size-'])]:size-[0.5em]\`,
  {
    variants: {
      size: COLOR_SWATCH_SIZES,
      shape: COLOR_SWATCH_SHAPES,
    },
  },
)

type ColorSwatchPresetSize = NonNullable<VariantProps<typeof colorSwatchVariants>['size']>
type ColorSwatchShape = NonNullable<VariantProps<typeof colorSwatchVariants>['shape']>

interface ColorSwatchProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  /**
   * Color to show. Pass a \`Color\` or any CSS color string. Inside a \`ColorPicker\` it
   * can be left off, and the swatch previews whatever the picker currently holds.
   */
  color?: Color | string
  /**
   * Name announced for the color, in place of the description built from the color
   * itself. Use it for the name your palette gives the color, e.g. \`'Fire truck red'\`.
   */
  colorName?: string
  /**
   * Rounded square or full circle.
   * @default 'rounded'
   */
  shape?: ColorSwatchShape
  /**
   * A preset scale, or a pixel number for an exact size.
   * @default 'md'
   */
  size?: ColorSwatchPresetSize | number
  /**
   * Back a translucent color with a checkerboard, so it reads as translucent rather
   * than as the flat color it composites to. Turn it off to let the swatch blend into
   * whatever sits behind it. An opaque color covers it either way.
   * @default true
   */
  checkerboard?: boolean
  /**
   * Dim the swatch and swap the color for a flat muted fill.
   * @default false
   */
  disabled?: boolean
}

function ColorSwatch({
  color,
  colorName,
  shape = 'rounded',
  size = 'md',
  checkerboard = true,
  disabled: disabledProp,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  ...props
}: ColorSwatchProps) {
  const picker = useColorPickerContext()
  const resolved = color === undefined ? picker?.value : normalizeColor(color)
  if (!resolved) throw new Error('Appica UI: <ColorSwatch> needs a \`color\`, or a <ColorPicker> to take one from.')

  const disabled = disabledProp || (picker?.disabled ?? false)
  const isNumeric = typeof size === 'number'
  const checkered = checkerboard && resolved.alpha < 1
  const css = formatColor(resolved)

  const fill = checkered
    ? {
        backgroundImage: \`linear-gradient(\${css}, \${css}), \${colorControlCheckerboard}\`,
        backgroundSize: \`auto, \${CHECKERBOARD_SIZE}\`,
      }
    : { backgroundColor: css }

  return (
    <span
      role="img"
      aria-label={[colorName ?? describeColor(resolved), ariaLabel].filter(Boolean).join(', ')}
      {...props}
      data-slot="color-swatch"
      {...(disabled ? { 'data-disabled': '' } : {})}
      className={cn(colorSwatchVariants({ shape, size: isNumeric ? undefined : size }), className)}
      style={{
        ...(isNumeric ? { fontSize: \`\${size}px\` } : undefined),
        ...(disabled ? undefined : fill),
        ...style,
      }}
    >
      <span data-slot="color-swatch-surface" aria-hidden="true" className={colorControlSurfaceClasses} />
      {children}
    </span>
  )
}

export { ColorSwatch }
export type { ColorSwatchProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">color swatch</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-combobox`,
    name: `Combobox (Appica)`,
    category: `Components`,
    tags: [`combobox`, `appica`],
    code: `// ─── combobox/combobox.tsx ───
'use client'

import * as React from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { inputVariants } from '../input/input-variants'
import { buttonVariants } from '../button/button-variants'

type ComboboxSize = 'sm' | 'md' | 'lg'
type ComboboxVariant = 'outline' | 'soft'

interface ComboboxContextValue {
  size: ComboboxSize
  variant: ComboboxVariant
  clearable: boolean
  icon: boolean
  grid: boolean
  reducedMotion: boolean
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext() {
  const ctx = React.useContext(ComboboxContext)
  if (!ctx) {
    throw new Error('Combobox sub-components must be rendered inside <Combobox>')
  }
  return ctx
}

type BaseComboboxRootProps = React.ComponentProps<typeof BaseCombobox.Root>

interface ComboboxProps extends BaseComboboxRootProps {
  /**
   * Input height, popup radius, and item sizing.
   * @default 'md'
   */
  size?: ComboboxSize
  /**
   * Input appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: ComboboxVariant
  /**
   * Render a clear button inside the input when a value is present.
   * @default false
   */
  clearable?: boolean
  /**
   * Render a chevron button that toggles the popup.
   * @default true
   */
  icon?: boolean
}

function Combobox({
  size = 'md',
  variant = 'outline',
  clearable = false,
  icon = true,
  grid = false,
  children,
  ...rest
}: ComboboxProps) {
  const reducedMotion = useReducedMotion()
  const ctx = React.useMemo<ComboboxContextValue>(
    () => ({ size, variant, clearable, icon, grid, reducedMotion }),
    [size, variant, clearable, icon, grid, reducedMotion],
  )
  return (
    <ComboboxContext value={ctx}>
      <BaseCombobox.Root grid={grid} {...rest}>
        {children}
      </BaseCombobox.Root>
    </ComboboxContext>
  )
}

const ICON_SIZE: Record<ComboboxSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

interface ComboboxInputProps extends Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'size'> {
  /** Adornment rendered before the field, inside the input frame. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, before the controls. */
  endSlot?: React.ReactNode
}

function ComboboxInput({ className, startSlot, endSlot, placeholder, ...props }: ComboboxInputProps) {
  const { size, variant, clearable, icon } = useComboboxContext()
  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-input"
      className={cn(inputVariants({ variant, size, state: 'within' }), className)}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      {startSlot && (
        <div data-slot="combobox-input-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      )}
      <BaseCombobox.Input
        data-slot="combobox-input-field"
        placeholder={placeholder ?? ' '}
        className="peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        {...props}
      />
      {clearable && <ComboboxClearButton />}
      {endSlot && (
        <div data-slot="combobox-input-end" className="shrink-0">
          {endSlot}
        </div>
      )}
      {icon && <ComboboxToggleButton />}
    </BaseCombobox.InputGroup>
  )
}

interface ComboboxChipsProps extends React.ComponentProps<typeof BaseCombobox.InputGroup> {
  /** Placeholder for the inline text field. */
  placeholder?: string
  /** Props forwarded to the inner text \`input\`. */
  inputProps?: Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'placeholder'>
}

function ComboboxChips({ className, children, placeholder, inputProps, ...props }: ComboboxChipsProps) {
  const { size, variant, clearable, icon } = useComboboxContext()
  const hasControls = clearable || icon

  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-chips"
      className={cn(
        'group/combobox-chips',
        inputVariants({ variant, size, state: 'within' }),
        'has-data-[slot=combobox-chip]:h-auto has-data-[slot=combobox-chip]:flex-wrap has-data-[slot=combobox-chip]:items-start has-data-[slot=combobox-chip]:p-1',
        CHIPS_FILLED_MIN_H[size],
        className,
      )}
      {...props}
    >
      <BaseCombobox.Chips
        data-slot="combobox-chips-list"
        className="flex h-full min-w-0 flex-1 flex-wrap items-center gap-1 **:data-[slot=combobox-input-field]:px-1"
      >
        {children}
        <BaseCombobox.Input
          data-slot="combobox-input-field"
          placeholder={placeholder ?? ' '}
          className="peer text-foreground placeholder:text-foreground-subtle min-w-15 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
          {...inputProps}
        />
      </BaseCombobox.Chips>
      {hasControls && (
        <div
          data-slot="combobox-controls"
          className={cn('flex shrink-0 items-center gap-1', CONTROLS_FILLED_PAD[size])}
        >
          {clearable && <ComboboxClearButton />}
          {icon && <ComboboxToggleButton />}
        </div>
      )}
    </BaseCombobox.InputGroup>
  )
}

function ComboboxClearButton() {
  return (
    <BaseCombobox.Clear
      data-slot="combobox-clear"
      aria-label="Clear selection"
      className="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 outline-none motion-reduce:transition-none"
    >
      <ClearIcon className="size-[1em]" />
    </BaseCombobox.Clear>
  )
}

function ComboboxToggleButton() {
  const { size } = useComboboxContext()
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-toggle"
      tabIndex={-1}
      aria-label="Toggle popup"
      className="group/combobox-toggle text-foreground -me-1 shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed"
    >
      <ChevronDownIcon
        className={cn(
          ICON_SIZE[size],
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/combobox-toggle:rotate-180',
        )}
      />
    </BaseCombobox.Trigger>
  )
}

interface ComboboxTriggerProps extends React.ComponentProps<typeof BaseCombobox.Trigger> {
  /** Adornment before the value, inside the trigger frame. */
  startSlot?: React.ReactNode
  /** Adornment after the value, before the chevron. */
  endSlot?: React.ReactNode
}

function ComboboxTrigger({ className, startSlot, endSlot, children, ...props }: ComboboxTriggerProps) {
  const { size, variant } = useComboboxContext()

  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      className={cn(
        'group/combobox-trigger',
        inputVariants({ variant, size, state: 'self' }),
        'data-placeholder:text-foreground-subtle flex items-center justify-between',
        className,
      )}
      {...props}
    >
      {startSlot && (
        <span data-slot="combobox-trigger-start" className="-ms-1 shrink-0">
          {startSlot}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center truncate text-start">{children}</span>
      {endSlot && (
        <span data-slot="combobox-trigger-end" className="shrink-0">
          {endSlot}
        </span>
      )}
      <BaseCombobox.Icon
        data-slot="combobox-icon"
        className={cn(
          ICON_SIZE[size],
          'text-foreground -me-1 shrink-0',
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/combobox-trigger:rotate-180',
        )}
        render={<ChevronDownIcon />}
      />
    </BaseCombobox.Trigger>
  )
}

type ComboboxValueProps = React.ComponentProps<typeof BaseCombobox.Value>

function ComboboxValue(props: ComboboxValueProps) {
  return <BaseCombobox.Value {...props} />
}

const CHIP_SIZE: Record<ComboboxSize, string> = {
  sm: 'h-6 px-2 text-xs rounded-xs gap-1',
  md: 'h-8 px-3 text-sm rounded-sm gap-1.5',
  lg: 'h-10 px-3.5 text-base rounded-md gap-1.5',
}

const CHIPS_FILLED_MIN_H: Record<ComboboxSize, string> = {
  sm: 'has-data-[slot=combobox-chip]:min-h-8',
  md: 'has-data-[slot=combobox-chip]:min-h-10',
  lg: 'has-data-[slot=combobox-chip]:min-h-12',
}

const CONTROLS_FILLED_PAD: Record<ComboboxSize, string> = {
  sm: cn(
    'group-has-data-[slot=combobox-chip]/combobox-chips:pt-1',
    'group-has-data-[slot=combobox-chip]/combobox-chips:pe-2',
  ),
  md: cn(
    'group-has-data-[slot=combobox-chip]/combobox-chips:pt-1.5',
    'group-has-data-[slot=combobox-chip]/combobox-chips:pe-2.5',
  ),
  lg: cn(
    'group-has-data-[slot=combobox-chip]/combobox-chips:pt-2.5',
    'group-has-data-[slot=combobox-chip]/combobox-chips:pe-3',
  ),
}

const CHIP_BUTTON_VARIANT: Record<ComboboxVariant, 'soft' | 'outline'> = {
  outline: 'soft',
  soft: 'outline',
}

interface ComboboxChipProps extends React.ComponentProps<typeof BaseCombobox.Chip> {}

function ComboboxChip({ className, children, ...props }: ComboboxChipProps) {
  const { size, variant } = useComboboxContext()
  return (
    <BaseCombobox.Chip
      data-slot="combobox-chip"
      className={cn(
        buttonVariants({ variant: CHIP_BUTTON_VARIANT[variant], size }),
        CHIP_SIZE[size],
        'text-foreground-strong cursor-default font-normal',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      <BaseCombobox.ChipRemove
        data-slot="combobox-chip-remove"
        aria-label="Remove"
        className="text-foreground-subtle hover:text-foreground -me-0.5 shrink-0 cursor-pointer transition-colors duration-200 outline-none motion-reduce:transition-none"
      >
        <ClearIcon className="size-[1em]" />
      </BaseCombobox.ChipRemove>
    </BaseCombobox.Chip>
  )
}

const POPUP_RADIUS: Record<ComboboxSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type ComboboxContentProps = React.ComponentProps<typeof BaseCombobox.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseCombobox.Positioner>,
    React.ComponentProps<typeof BaseCombobox.Portal>
  >

function ComboboxContent({ className, children, ...props }: ComboboxContentProps) {
  const { size } = useComboboxContext()
  const { positioner, portal, popup } = splitFloatingProps(props)

  return (
    <BaseCombobox.Portal {...portal}>
      <BaseCombobox.Positioner
        sideOffset={6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseCombobox.Popup
          data-slot="combobox-content"
          className={cn(
            'group/combobox-content bg-background border-border-overlay flex flex-col border py-2 shadow-2xl outline-none has-data-empty:py-0',
            POPUP_RADIUS[size],
            'w-(--anchor-width) min-w-36',
            'max-h-(--available-height) overflow-hidden',
            'origin-(--transform-origin)',
            'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  )
}

interface ComboboxListProps<T = any> extends Omit<React.ComponentProps<typeof BaseCombobox.List>, 'children'> {
  /** Items per row in grid mode (defaults to 2 when \`grid\` is set). */
  cols?: number
  /** A render function over the filtered items, or static \`ComboboxItem\`s. */
  children?: React.ReactNode | ((item: T, index: number) => React.ReactNode)
}

const COMBOBOX_LIST_CLASSNAME = 'flex flex-col gap-0.5 px-2 min-h-0 flex-1 overflow-y-auto overscroll-contain'

function ComboboxList<T = any>({ className, cols, children, ...props }: ComboboxListProps<T>) {
  const { grid } = useComboboxContext()
  const effectiveCols = cols ?? (grid ? 2 : undefined)
  if (effectiveCols && effectiveCols > 1 && typeof children === 'function') {
    return (
      <BaseCombobox.List data-slot="combobox-list" className={cn(COMBOBOX_LIST_CLASSNAME, className)} {...props}>
        <ComboboxGridRows cols={effectiveCols} render={children} />
      </BaseCombobox.List>
    )
  }
  return (
    <BaseCombobox.List data-slot="combobox-list" className={cn(COMBOBOX_LIST_CLASSNAME, className)} {...props}>
      {children as React.ComponentProps<typeof BaseCombobox.List>['children']}
    </BaseCombobox.List>
  )
}

function cellKey(item: unknown, fallback: number): React.Key {
  if (item == null) return fallback
  if (typeof item === 'object') {
    const rec = item as Record<string, unknown>
    const candidate = rec.value ?? rec.id ?? rec.key
    if (typeof candidate === 'string' || typeof candidate === 'number') return candidate
    return fallback
  }
  return item as React.Key
}

function ComboboxGridRows({ cols, render }: { cols: number; render: (item: any, index: number) => React.ReactNode }) {
  const filtered = BaseCombobox.useFilteredItems<unknown>()
  const rows = React.useMemo(() => {
    const out: unknown[][] = []
    for (let i = 0; i < filtered.length; i += cols) out.push(filtered.slice(i, i + cols))
    return out
  }, [filtered, cols])
  return (
    <>
      {rows.map((row, rowIndex) => (
        <ComboboxRow key={\`row-\${cellKey(row[0], rowIndex)}\`}>
          {row.map((item, colIndex) => {
            const globalIndex = rowIndex * cols + colIndex
            return <React.Fragment key={cellKey(item, globalIndex)}>{render(item, globalIndex)}</React.Fragment>
          })}
        </ComboboxRow>
      ))}
    </>
  )
}

interface ComboboxRowProps extends React.ComponentProps<typeof BaseCombobox.Row> {}

function ComboboxRow({ className, ...props }: ComboboxRowProps) {
  return (
    <BaseCombobox.Row
      data-slot="combobox-row"
      className={cn('flex w-full items-stretch gap-0.5', className)}
      {...props}
    />
  )
}

const ITEM_SIZE: Record<ComboboxSize, string> = {
  sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
  md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
}

const ITEM_TEXT_SIZE: Record<ComboboxSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

interface ComboboxItemProps extends React.ComponentProps<typeof BaseCombobox.Item> {}

function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  const { size, reducedMotion } = useComboboxContext()
  return (
    <BaseCombobox.Item
      data-slot="combobox-item"
      className={cn(
        'text-foreground relative isolate flex w-full cursor-default items-center justify-between outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
        'active:translate-y-px active:scale-[0.98]',
        'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
        'motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
        'motion-safe:active:duration-100 motion-safe:active:ease-in-out',
        'motion-safe:before:transition-opacity motion-safe:before:duration-200 motion-safe:before:ease-out',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none',
        ITEM_SIZE[size],
        className,
      )}
      {...props}
    >
      <span className={cn('flex items-center text-start', ITEM_TEXT_SIZE[size])}>{children}</span>
      <BaseCombobox.ItemIndicator
        data-slot="combobox-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  )
}

interface ComboboxEmptyProps extends React.ComponentProps<typeof BaseCombobox.Empty> {}

const EMPTY_SIZE: Record<ComboboxSize, string> = {
  sm: 'px-2.5 py-2 text-xs',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-3.5 py-3 text-base',
}

function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  const { size } = useComboboxContext()
  return (
    <BaseCombobox.Empty
      data-slot="combobox-empty"
      className={cn(
        'text-foreground-muted hidden text-center group-data-empty/combobox-content:block',
        EMPTY_SIZE[size],
        className,
      )}
      {...props}
    />
  )
}

type ComboboxGroupProps = React.ComponentProps<typeof BaseCombobox.Group>

function ComboboxGroup(props: ComboboxGroupProps) {
  return <BaseCombobox.Group data-slot="combobox-group" {...props} />
}

const GROUP_LABEL_SIZE: Record<ComboboxSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

type ComboboxLabelProps = React.ComponentProps<typeof BaseCombobox.GroupLabel>

function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  const { size } = useComboboxContext()
  return (
    <BaseCombobox.GroupLabel
      data-slot="combobox-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type ComboboxCollectionProps = React.ComponentProps<typeof BaseCombobox.Collection>

function ComboboxCollection(props: ComboboxCollectionProps) {
  return <BaseCombobox.Collection {...props} />
}

type ComboboxSeparatorProps = React.ComponentProps<typeof BaseCombobox.Separator>

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <BaseCombobox.Separator
      data-slot="combobox-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z" />
    </svg>
  )
}

function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('stroke-2', className)}
      {...props}
    >
      <path
        d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
        pathLength={1}
        strokeDasharray="1 2"
        className={cn(
          'opacity-0 [stroke-dashoffset:1.02]',
          'group-data-selected/check:opacity-100 group-data-selected/check:[stroke-dashoffset:0]',
          'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          'motion-safe:delay-[0ms,150ms] motion-safe:duration-[150ms,0ms]',
          'moti

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">combobox</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-context-menu`,
    name: `Context Menu (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── context-menu/context-menu.tsx ───
'use client'

import * as React from 'react'
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'

type ContextMenuSize = 'sm' | 'md' | 'lg'

interface ContextMenuContextValue {
  size: ContextMenuSize
  reducedMotion: boolean
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

function useContextMenuContext() {
  const ctx = React.useContext(ContextMenuContext)
  if (!ctx) {
    throw new Error('ContextMenu sub-components must be rendered inside <ContextMenu>')
  }
  return ctx
}

type BaseRootProps = React.ComponentProps<typeof BaseContextMenu.Root>

interface ContextMenuProps extends BaseRootProps {
  /**
   * Scales the popup radius, item padding, and icon size.
   * @default 'md'
   */
  size?: ContextMenuSize
}

function ContextMenu({ size = 'md', children, ...rest }: ContextMenuProps) {
  const reducedMotion = useReducedMotion()
  const ctx = React.useMemo<ContextMenuContextValue>(() => ({ size, reducedMotion }), [size, reducedMotion])
  return (
    <ContextMenuContext value={ctx}>
      <BaseContextMenu.Root {...rest}>{children}</BaseContextMenu.Root>
    </ContextMenuContext>
  )
}

type ContextMenuTriggerProps = React.ComponentProps<typeof BaseContextMenu.Trigger>

function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return <BaseContextMenu.Trigger data-slot="context-menu-trigger" className={cn(className)} {...props} />
}

const POPUP_SIZE: Record<ContextMenuSize, string> = {
  sm: 'min-w-40 rounded-md',
  md: 'min-w-48 rounded-lg',
  lg: 'min-w-56 rounded-xl',
}

const ICON_SIZE: Record<ContextMenuSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

function popupClassName(size: ContextMenuSize, className?: string) {
  return cn(
    'max-h-(--available-height) bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
    POPUP_SIZE[size],
    'origin-(--transform-origin)',
    'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
    'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
    'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
    className,
  )
}

type ContextMenuFloatingProps = FloatingContentProps<
  React.ComponentProps<typeof BaseContextMenu.Positioner>,
  React.ComponentProps<typeof BaseContextMenu.Portal>
>

type ContextMenuContentProps = Omit<React.ComponentProps<typeof BaseContextMenu.Popup>, 'className'> &
  ContextMenuFloatingProps & {
    /** Extra classes on the popup. */
    className?: string
  }

function ContextMenuContent({ className, children, ...props }: ContextMenuContentProps) {
  const { size } = useContextMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseContextMenu.Portal {...portal}>
      <BaseContextMenu.Positioner
        align="start"
        sideOffset={2}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseContextMenu.Popup data-slot="context-menu-content" className={popupClassName(size, className)} {...popup}>
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}

const ITEM_BASE = 'w-full outline-hidden'

const ITEM_TEXT: Record<ContextMenuSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

type ContextMenuItemProps = React.ComponentProps<typeof BaseContextMenu.Item>

function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.Item
      data-slot="context-menu-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type ContextMenuLinkItemProps = React.ComponentProps<typeof BaseContextMenu.LinkItem>

function ContextMenuLinkItem({ className, ...props }: ContextMenuLinkItemProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.LinkItem
      data-slot="context-menu-link-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type ContextMenuGroupProps = React.ComponentProps<typeof BaseContextMenu.Group>

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <BaseContextMenu.Group data-slot="context-menu-group" {...props} />
}

type ContextMenuGroupLabelProps = React.ComponentProps<typeof BaseContextMenu.GroupLabel>

const GROUP_LABEL_SIZE: Record<ContextMenuSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

function ContextMenuGroupLabel({ className, ...props }: ContextMenuGroupLabelProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.GroupLabel
      data-slot="context-menu-group-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type ContextMenuSeparatorProps = React.ComponentProps<typeof BaseContextMenu.Separator>

function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <BaseContextMenu.Separator
      data-slot="context-menu-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

type ContextMenuRadioGroupProps = React.ComponentProps<typeof BaseContextMenu.RadioGroup>

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <BaseContextMenu.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

type ContextMenuRadioItemProps = React.ComponentProps<typeof BaseContextMenu.RadioItem>

function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  const { size, reducedMotion } = useContextMenuContext()
  return (
    <BaseContextMenu.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseContextMenu.RadioItemIndicator
        data-slot="context-menu-radio-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseContextMenu.RadioItemIndicator>
    </BaseContextMenu.RadioItem>
  )
}

type ContextMenuCheckboxItemProps = React.ComponentProps<typeof BaseContextMenu.CheckboxItem>

function ContextMenuCheckboxItem({ className, children, ...props }: ContextMenuCheckboxItemProps) {
  const { size, reducedMotion } = useContextMenuContext()
  return (
    <BaseContextMenu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseContextMenu.CheckboxItemIndicator
        data-slot="context-menu-checkbox-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseContextMenu.CheckboxItemIndicator>
    </BaseContextMenu.CheckboxItem>
  )
}

type ContextMenuSubProps = React.ComponentProps<typeof BaseContextMenu.SubmenuRoot>

function ContextMenuSub(props: ContextMenuSubProps) {
  return <BaseContextMenu.SubmenuRoot {...props} />
}

type ContextMenuSubTriggerProps = React.ComponentProps<typeof BaseContextMenu.SubmenuTrigger>

function ContextMenuSubTrigger({ className, children, ...props }: ContextMenuSubTriggerProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.SubmenuTrigger className="group/submenu-trigger outline-hidden" {...props}>
      <span
        data-slot="context-menu-sub-trigger"
        className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      >
        <span className={cn('flex flex-1 items-center', ITEM_TEXT[size])}>{children}</span>
        <ChevronEndIcon data-icon="end" className={cn(ICON_SIZE[size], 'shrink-0 rtl:rotate-180')} />
      </span>
    </BaseContextMenu.SubmenuTrigger>
  )
}

type ContextMenuSubContentProps = Omit<React.ComponentProps<typeof BaseContextMenu.Popup>, 'className'> &
  ContextMenuFloatingProps & {
    /** Extra classes on the submenu popup. */
    className?: string
  }

function ContextMenuSubContent({ className, children, ...props }: ContextMenuSubContentProps) {
  const { size } = useContextMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseContextMenu.Portal {...portal}>
      <BaseContextMenu.Positioner
        side="inline-end"
        align="start"
        sideOffset={12}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseContextMenu.Popup
          data-slot="context-menu-sub-content"
          className={popupClassName(size, cn('w-(--anchor-width)', className))}
          {...popup}
        >
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('stroke-2', className)}
      {...props}
    >
      <path
        d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
        pathLength={1}
        strokeDasharray="1 2"
        className={cn(
          'opacity-0 [stroke-dashoffset:1.02]',
          'group-data-checked/check:opacity-100 group-data-checked/check:[stroke-dashoffset:0]',
          'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          'motion-safe:delay-[0ms,150ms] motion-safe:duration-[150ms,0ms]',
          'motion-safe:group-data-checked/check:delay-[0ms] motion-safe:group-data-checked/check:duration-[0ms,300ms]',
        )}
      />
    </svg>
  )
}

function ChevronEndIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.558 3.558c.244-.244.641-.244.885 0l4 4c.244.244.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0s-.244-.641 0-.885L9.115 8 5.558 4.442c-.244-.244-.244-.641 0-.885z" />
    </svg>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuCheckboxItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
}
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuGroupLabelProps,
  ContextMenuItemProps,
  ContextMenuLinkItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuSeparatorProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">context menu</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-copy-button`,
    name: `Copy Button (Appica)`,
    category: `Buttons`,
    tags: [`button`, `appica`],
    code: `// ─── copy-button/copy-button.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { Button, type ButtonProps } from '../button/button'

const CHECK_PATH = 'M4.3 12.55 L9.25 17.5 L19.7 6.5'

const ICON_SVG_PROPS = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} satisfies React.SVGProps<SVGSVGElement>

type CopyButtonValue = string | React.RefObject<HTMLElement | null> | (() => string | Promise<string>)

async function resolveValue(value: CopyButtonValue): Promise<string> {
  if (typeof value === 'string') return value
  if (typeof value === 'function') return await value()
  const element = value.current
  if (!element) throw new Error('CopyButton: the \`value\` ref is not attached to an element')
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return element.value
  return element.textContent ?? ''
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    if (!document.execCommand('copy')) throw new Error('Copying to clipboard is not supported')
  } finally {
    textarea.remove()
  }
}

interface CopyButtonProps extends Omit<ButtonProps, 'value' | 'onCopy'> {
  /** **Required.** What to copy: a string, an element ref (its value/textContent), or a (possibly async) getter. */
  value: CopyButtonValue
  /**
   * How long (ms) the copied state lasts before reverting.
   * @default 2000
   */
  timeout?: number
  /**
   * Accessible name (and tooltip via \`title\`) in the idle state.
   * @default 'Copy'
   */
  label?: string
  /**
   * Accessible name after a successful copy; a string child also swaps to this.
   * @default 'Copied'
   */
  copiedLabel?: string
  /** Called with the copied text on success. */
  onCopy?: (value: string) => void
  /** Called if reading the value or writing to the clipboard fails. */
  onCopyError?: (error: unknown) => void
}

function CopyButton({
  value,
  timeout = 2000,
  label = 'Copy',
  copiedLabel = 'Copied',
  onCopy,
  onCopyError,
  onClick,
  variant = 'ghost',
  size = 'icon-sm',
  className,
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const resetRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(resetRef.current), [])

  const handleClick: ButtonProps['onClick'] = async (event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    let text: string
    try {
      text = await resolveValue(value)
      await copyTextToClipboard(text)
    } catch (error) {
      onCopyError?.(error)
      return
    }
    onCopy?.(text)
    setCopied(true)
    clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setCopied(false), timeout)
  }

  return (
    <Button
      data-slot="copy-button"
      data-copied={copied || undefined}
      type="button"
      variant={variant}
      size={size}
      aria-label={copied ? copiedLabel : label}
      onClick={handleClick}
      className={cn('group/copy', className)}
      {...props}
    >
      <span data-icon={children != null ? 'start' : undefined} className="grid place-items-center *:[grid-area:1/1]">
        <svg
          {...ICON_SVG_PROPS}
          className={cn(
            'transition-[opacity,scale] delay-150 duration-150 ease-out group-data-copied/copy:delay-0',
            'group-data-copied/copy:scale-50 group-data-copied/copy:opacity-0',
            'motion-reduce:transition-none',
          )}
        >
          <path d="M4.012 16.737c-.307-.175-.562-.427-.739-.732S3.001 15.353 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1M7 9.667c0-.707.281-1.386.781-1.886S8.96 7 9.667 7h8.666c.35 0 .697.069 1.021.203s.618.33.865.578.444.542.578.865A2.67 2.67 0 0 1 21 9.667v8.666a2.67 2.67 0 0 1-.781 1.886 2.67 2.67 0 0 1-1.886.781H9.667a2.67 2.67 0 0 1-1.021-.203c-.324-.134-.618-.331-.865-.578s-.444-.542-.578-.865S7 18.683 7 18.333V9.667z" />
        </svg>
        <svg {...ICON_SVG_PROPS}>
          <path
            d={CHECK_PATH}
            pathLength={1}
            strokeDasharray="1 2"
            className={cn(
              '[stroke-dashoffset:1.02] group-data-copied/copy:[stroke-dashoffset:0]',
              'transition-[stroke-dashoffset] duration-200 ease-in',
              'group-data-copied/copy:delay-100 group-data-copied/copy:duration-350 group-data-copied/copy:ease-out',
              'motion-reduce:transition-none',
            )}
          />
        </svg>
      </span>
      {typeof children === 'string' && copied ? copiedLabel : children}
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </Button>
  )
}

export { CopyButton }
export type { CopyButtonProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">copy button</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-countdown`,
    name: `Countdown (Appica)`,
    category: `Components`,
    tags: [`countdown`, `appica`],
    code: `// ─── countdown/countdown.tsx ───
'use client'

import * as React from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'

interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isComplete: boolean
}

const CountdownContext = React.createContext<CountdownParts | null>(null)

const MS = { day: 86_400_000, hour: 3_600_000, minute: 60_000, second: 1_000 } as const

function toTimestamp(value: Date | number | string): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return new Date(value).getTime()
}

function getParts(total: number): CountdownParts {
  const remaining = Math.max(0, total)
  return {
    days: Math.floor(remaining / MS.day),
    hours: Math.floor(remaining / MS.hour) % 24,
    minutes: Math.floor(remaining / MS.minute) % 60,
    seconds: Math.floor(remaining / MS.second) % 60,
    total: remaining,
    isComplete: remaining <= 0,
  }
}

interface CountdownProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Absolute instant to count down to (a \`Date\`, epoch-ms, or date string). */
  targetDate?: Date | number | string
  /** Relative length in **seconds** from mount. Ignored when \`targetDate\` is set. */
  duration?: number
  /**
   * Tick interval in milliseconds.
   * @default 1000
   */
  interval?: number
  /** Fired once when the countdown reaches zero. */
  onComplete?: () => void
  /** Segments and labels, or a render-prop receiving \`{ days, hours, minutes, seconds, total, isComplete }\`. */
  children?: React.ReactNode | ((parts: CountdownParts) => React.ReactNode)
}

function Countdown({
  targetDate,
  duration,
  interval = 1000,
  onComplete,
  className,
  children,
  ...props
}: CountdownProps) {
  const mountRef = React.useRef<number>(Date.now())

  const target = React.useMemo(() => {
    if (targetDate != null) {
      const ts = toTimestamp(targetDate)
      return Number.isNaN(ts) ? mountRef.current : ts
    }
    if (duration != null) return mountRef.current + duration * 1000
    return mountRef.current
  }, [targetDate, duration])

  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (Date.now() >= target) {
      setNow(Date.now())
      return
    }
    let id: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      const current = Date.now()
      const delay = interval - (current % interval)
      id = setTimeout(() => {
        const t = Date.now()
        setNow(t)
        if (t < target) schedule()
      }, delay)
    }
    schedule()
    return () => {
      if (id !== undefined) clearTimeout(id)
    }
  }, [target, interval])

  const parts = React.useMemo(() => getParts(target - now), [target, now])

  const completedRef = React.useRef(false)
  React.useEffect(() => {
    if (parts.isComplete && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    } else if (!parts.isComplete) {
      completedRef.current = false
    }
  }, [parts.isComplete, onComplete])

  return (
    <CountdownContext value={parts}>
      <div data-slot="countdown" role="timer" className={cn('inline-flex items-center', className)} {...props}>
        {typeof children === 'function' ? children(parts) : children}
      </div>
    </CountdownContext>
  )
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

const ROLL_TRANSITION = {
  type: 'tween',
  duration: 0.5,
  ease: [0.65, 0, 0.35, 1] satisfies [number, number, number, number],
} as const

function DigitRoller({ digit, reduced }: { digit: number; reduced: boolean }) {
  return (
    <span className="relative inline-block overflow-hidden leading-none">
      <span className="invisible">0</span>
      <m.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: \`\${-digit * 10}%\` }}
        transition={reduced ? { duration: 0 } : ROLL_TRANSITION}
        suppressHydrationWarning
      >
        {DIGITS.map((d) => (
          <span key={d} className="flex h-[1em] items-center justify-center leading-none">
            {d}
          </span>
        ))}
      </m.span>
    </span>
  )
}

interface CountdownSegmentProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Which unit to read from the parent \`Countdown\`. */
  unit?: 'days' | 'hours' | 'minutes' | 'seconds'
  /** Render this number directly instead of reading context (standalone display). */
  value?: number
  /**
   * Minimum digit count; the value is zero-padded to this width.
   * @default 2
   */
  minDigits?: number
}

function CountdownSegment({ unit, value, minDigits = 2, className, ...props }: CountdownSegmentProps) {
  const parts = React.useContext(CountdownContext)
  const reduced = useReducedMotion()

  const resolved = value ?? (unit && parts ? parts[unit] : 0)
  const text = String(Math.max(0, Math.trunc(resolved))).padStart(minDigits, '0')

  return (
    <LazyMotion features={domAnimation} strict>
      <span data-slot="countdown-segment" className={cn('inline-flex', className)} {...props}>
        <span className="sr-only" suppressHydrationWarning>
          {text}
        </span>
        <span aria-hidden="true" dir="ltr" className="inline-flex">
          {text.split('').map((char, i) => (
            <DigitRoller key={i} digit={Number(char)} reduced={reduced} />
          ))}
        </span>
      </span>
    </LazyMotion>
  )
}

export { Countdown, CountdownSegment }
export type { CountdownProps, CountdownSegmentProps, CountdownParts }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">countdown</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-date-field`,
    name: `Date Field (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── date-field/date-field.tsx ───
'use client'

import * as React from 'react'
import { format as formatDate, formatISO, getDaysInMonth, isValid } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { inputVariants } from '../input/input-variants'

type DateFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type DateFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>

type SegmentType = 'day' | 'month' | 'year'
type SegmentToken = 'd' | 'dd' | 'M' | 'MM' | 'MMM' | 'MMMM' | 'y' | 'yy' | 'yyyy'

interface SegmentNode {
  kind: 'segment'
  type: SegmentType
  token: SegmentToken
  index: number
}
interface LiteralNode {
  kind: 'literal'
  text: string
}
type FormatNode = SegmentNode | LiteralNode

interface DateFieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> {
  /** Controlled value. Pair with \`onValueChange\`. */
  value?: Date | null
  /** Uncontrolled initial value. */
  defaultValue?: Date | null
  /** Fires with a \`Date\` when complete, or \`null\` when cleared. */
  onValueChange?: (date: Date | null) => void
  /**
   * date-fns token string defining the segments and separators.
   * @default 'MM/dd/yyyy'
   */
  format?: string
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: DateFieldVariant
  /**
   * Height, padding, and text scale.
   * @default 'md'
   */
  size?: DateFieldSize
  /** Content pinned to the start edge. */
  startSlot?: React.ReactNode
  /** Content pinned to the end edge. */
  endSlot?: React.ReactNode
  /**
   * Blocks interaction and removes the segments from the tab order.
   * @default false
   */
  disabled?: boolean
  /**
   * Segments stay focusable and readable but can't be edited.
   * @default false
   */
  readOnly?: boolean
  /**
   * Marks the hidden form input as required (needs \`name\`).
   * @default false
   */
  required?: boolean
  /** Renders a hidden \`<input>\` with the ISO date for form submission. */
  name?: string
  /**
   * Drop the input appearance - for composing inside another field (used by \`DatePicker\`).
   * @default false
   */
  unstyled?: boolean
  /** Ref to the underlying element. */
  ref?: React.Ref<HTMLDivElement>
}

interface Parts {
  year: number | null
  month: number | null
  day: number | null
}

const EMPTY_PARTS: Parts = { year: null, month: null, day: null }

const TOKEN_PATTERN = 'MMMM|MMM|MM|M|dd|d|yyyy|yy|y'

const PLACEHOLDERS: Record<SegmentToken, string> = {
  d: 'D',
  dd: 'DD',
  M: 'M',
  MM: 'MM',
  MMM: 'Mon',
  MMMM: 'Month',
  y: 'YYYY',
  yy: 'YY',
  yyyy: 'YYYY',
}

const MONTH_SHORT = Array.from({ length: 12 }, (_, i) => formatDate(new Date(2020, i, 1), 'MMM'))
const MONTH_LONG = Array.from({ length: 12 }, (_, i) => formatDate(new Date(2020, i, 1), 'MMMM'))

function parseFormat(formatStr: string): FormatNode[] {
  const nodes: FormatNode[] = []
  const re = new RegExp(TOKEN_PATTERN, 'g')
  let lastIndex = 0
  let segmentIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(formatStr)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex, match.index) })
    }
    const token = match[0] as SegmentToken
    const type: SegmentType = token[0] === 'M' ? 'month' : token[0] === 'y' ? 'year' : 'day'
    nodes.push({ kind: 'segment', type, token, index: segmentIndex++ })
    lastIndex = match.index + token.length
  }
  if (lastIndex < formatStr.length) {
    nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex) })
  }
  return nodes
}

function partsFromDate(d: Date | null | undefined): Parts {
  if (!d || !isValid(d)) return EMPTY_PARTS
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

function safeIso(d: Date | null | undefined): string {
  return d instanceof Date && isValid(d) ? d.toISOString() : ''
}

function partsToDate(p: Parts): Date | null {
  if (p.year == null || p.month == null || p.day == null) return null
  const d = new Date(p.year, p.month - 1, p.day)
  if (!isValid(d)) return null
  if (d.getFullYear() !== p.year || d.getMonth() !== p.month - 1 || d.getDate() !== p.day) return null
  return d
}

function clampDay(p: Parts): Parts {
  if (p.day == null || p.month == null) return p
  const year = p.year ?? 2000
  const maxDay = getDaysInMonth(new Date(year, p.month - 1, 1))
  return p.day > maxDay ? { ...p, day: maxDay } : p
}

function expandTwoDigitYear(yy: number): number {
  return yy < 70 ? 2000 + yy : 1900 + yy
}

function getPartFor(type: SegmentType, p: Parts): number | null {
  return type === 'day' ? p.day : type === 'month' ? p.month : p.year
}

function setPartFor(type: SegmentType, p: Parts, value: number | null): Parts {
  if (type === 'day') return { ...p, day: value }
  if (type === 'month') return { ...p, month: value }
  return { ...p, year: value }
}

function getSegmentRange(token: SegmentToken, p: Parts): { min: number; max: number; maxDigits: number } {
  if (token === 'yy') return { min: 0, max: 99, maxDigits: 2 }
  if (token === 'yyyy' || token === 'y') return { min: 1, max: 9999, maxDigits: 4 }
  if (token === 'MMMM' || token === 'MMM' || token === 'MM' || token === 'M') {
    return { min: 1, max: 12, maxDigits: 2 }
  }
  const year = p.year ?? 2000
  const monthIdx = (p.month ?? 1) - 1
  return { min: 1, max: getDaysInMonth(new Date(year, monthIdx, 1)), maxDigits: 2 }
}

function displayPart(part: number | null, token: SegmentToken): string {
  if (part == null) return PLACEHOLDERS[token]
  if (token === 'MMM') return MONTH_SHORT[part - 1] ?? PLACEHOLDERS[token]
  if (token === 'MMMM') return MONTH_LONG[part - 1] ?? PLACEHOLDERS[token]
  if (token === 'dd' || token === 'MM') return String(part).padStart(2, '0')
  if (token === 'yy') return String(part % 100).padStart(2, '0')
  return String(part)
}

function ariaText(part: number | null, token: SegmentToken): string {
  if (part == null) return 'Empty'
  if (token === 'MMM' || token === 'MMMM') return MONTH_LONG[part - 1] ?? String(part)
  return String(part)
}

function findMonthByLetter(letter: string, current: number | null): number {
  const lower = letter.toLowerCase()
  const start = current ?? 0
  for (let i = 1; i <= 12; i++) {
    const idx = (start + i - 1) % 12
    if (MONTH_LONG[idx]!.toLowerCase().startsWith(lower)) return idx + 1
  }
  return current ?? 1
}

function DateField({
  className,
  value,
  defaultValue,
  onValueChange,
  format = 'MM/dd/yyyy',
  variant = 'outline',
  size = 'md',
  startSlot,
  endSlot,
  disabled: disabledProp,
  readOnly,
  required,
  name: nameProp,
  unstyled,
  ref,
  ...rest
}: DateFieldProps) {
  const direction = useDirection()
  const isRtl = direction === 'rtl'
  const field = useFieldRootContext(true)
  const disabled = disabledProp || field.disabled
  const name = nameProp ?? field.name
  const ariaInvalid = rest['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true' || field.invalid === true

  const nodes = React.useMemo(() => parseFormat(format), [format])
  const segmentCount = React.useMemo(() => nodes.reduce((n, x) => n + (x.kind === 'segment' ? 1 : 0), 0), [nodes])

  const isControlled = value !== undefined
  const [internalParts, setInternalParts] = React.useState<Parts>(() => partsFromDate(value ?? defaultValue))

  const lastValueIsoRef = React.useRef<string>(safeIso(value))
  const lastCommittedRef = React.useRef<string>(partsToDate(partsFromDate(value ?? defaultValue))?.toISOString() ?? '')

  React.useEffect(() => {
    if (!isControlled) return
    const iso = safeIso(value)
    if (iso !== lastValueIsoRef.current) {
      lastValueIsoRef.current = iso
      lastCommittedRef.current = iso
      setInternalParts(partsFromDate(value))
    }
  }, [isControlled, value])

  // Always render from internalParts so partial input (e.g. just a day, no month/year yet)
  // stays visible even when controlled. External value changes resync internalParts via the effect above.
  const parts = internalParts

  const partsRef = React.useRef(parts)
  const onValueChangeRef = React.useRef(onValueChange)
  React.useEffect(() => {
    partsRef.current = parts
    onValueChangeRef.current = onValueChange
  })

  const commit = React.useCallback((updater: (prev: Parts) => Parts) => {
    const next = clampDay(updater(partsRef.current))
    partsRef.current = next
    setInternalParts(next)
    const date = partsToDate(next)
    if (date) {
      const iso = date.toISOString()
      if (iso !== lastCommittedRef.current) {
        lastCommittedRef.current = iso
        onValueChangeRef.current?.(date)
      }
      return
    }
    // No valid date yet. Only notify parent when the user truly cleared every
    // segment; intermediate partial input (e.g. just a year, or day=0 mid-typing)
    // stays internal so the parent doesn't reset its committed value.
    const allEmpty = next.day == null && next.month == null && next.year == null
    if (allEmpty && lastCommittedRef.current !== '') {
      lastCommittedRef.current = ''
      onValueChangeRef.current?.(null)
    }
  }, [])

  const segmentRefs = React.useRef<Array<HTMLSpanElement | null>>([])
  const typingCountRef = React.useRef<Map<number, number>>(new Map())

  const setSegmentRef = React.useMemo(() => {
    const cache = new Map<number, (el: HTMLSpanElement | null) => void>()
    return (index: number) => {
      let cb = cache.get(index)
      if (!cb) {
        cb = (el) => {
          segmentRefs.current[index] = el
        }
        cache.set(index, cb)
      }
      return cb
    }
  }, [])

  const focusSegment = React.useCallback((idx: number) => {
    segmentRefs.current[idx]?.focus()
  }, [])

  const onRootMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      const target = e.target as HTMLElement
      if (target.closest('[data-slot="date-field-segment"]')) return
      if (target.closest('button, a, input, select, textarea, label, [role="button"]')) return
      e.preventDefault()
      const firstEmpty = nodes.find(
        (n): n is SegmentNode => n.kind === 'segment' && getPartFor(n.type, partsRef.current) == null,
      )
      focusSegment(firstEmpty ? firstEmpty.index : 0)
    },
    [disabled, focusSegment, nodes],
  )

  const processCharInput = React.useCallback(
    (seg: SegmentNode, ch: string) => {
      if (disabled || readOnly) return
      const p = partsRef.current
      const partVal = getPartFor(seg.type, p)
      const range = getSegmentRange(seg.token, p)

      if (ch === '/' || ch === '-' || ch === '.' || ch === ',' || ch === ' ') {
        typingCountRef.current.delete(seg.index)
        if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        return
      }

      if (ch >= '0' && ch <= '9') {
        const digit = Number(ch)
        const count = typingCountRef.current.get(seg.index) ?? 0
        const base = seg.token === 'yy' && partVal != null ? partVal % 100 : partVal
        let displayVal: number
        if (count === 0 || base == null) {
          displayVal = digit
        } else {
          const tentative = base * 10 + digit
          displayVal = tentative > range.max ? digit : tentative
        }
        typingCountRef.current.set(seg.index, count + 1)

        const valueToSet = seg.token === 'yy' ? expandTwoDigitYear(displayVal) : displayVal
        commit((prev) => setPartFor(seg.type, prev, valueToSet))

        const reachedMaxDigits = (typingCountRef.current.get(seg.index) ?? 0) >= range.maxDigits
        const cantFitAnother = displayVal * 10 > range.max
        if (reachedMaxDigits || cantFitAnother) {
          typingCountRef.current.delete(seg.index)
          if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        }
        return
      }

      if ((seg.token === 'MMM' || seg.token === 'MMMM') && /[a-zA-Z]/.test(ch)) {
        typingCountRef.current.delete(seg.index)
        const next = findMonthByLetter(ch, partVal)
        commit((prev) => setPartFor('month', prev, next))
      }
    },
    [commit, disabled, focusSegment, readOnly, segmentCount],
  )

  const onSegmentKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>, seg: SegmentNode) => {
      if (disabled) return
      const p = partsRef.current
      const partVal = getPartFor(seg.type, p)
      const range = getSegmentRange(seg.token, p)

      if (e.key === 'Tab') return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const goNext = (e.key === 'ArrowRight') !== isRtl
        typingCountRef.current.delete(seg.index)
        const target = goNext ? seg.index + 1 : seg.index - 1
        if (target >= 0 && target < segmentCount) focusSegment(target)
        return
      }

      if (e.key === 'Home') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        focusSegment(0)
        return
      }

      if (e.key === 'End') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        focusSegment(segmentCount - 1)
        return
      }

      if (readOnly) return

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        const stepUp = e.key === 'ArrowUp'
        let next: number
        if (partVal == null) {
          next = stepUp ? range.min : range.max
        } else {
          const base = seg.token === 'yy' ? partVal % 100 : partVal
          let nb = stepUp ? base + 1 : base - 1
          if (nb > range.max) nb = range.min
          if (nb < range.min) nb = range.max
          next = seg.token === 'yy' ? expandTwoDigitYear(nb) : nb
        }
        commit((prev) => setPartFor(seg.type, prev, next))
        return
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        if (partVal == null && e.key === 'Backspace' && seg.index > 0) {
          focusSegment(seg.index - 1)
        } else {
          commit((prev) => setPartFor(seg.type, prev, null))
        }
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key.length === 1) {
        e.preventDefault()
        processCharInput(seg, e.key)
      }
    },
    [commit, disabled, focusSegment, isRtl, processCharInput, readOnly, segmentCount],
  )

  const onSegmentBeforeInput = React.useCallback(
    (e: React.FormEvent<HTMLSpanElement>, seg: SegmentNode) => {
      e.preventDefault()
      const nativeEvent = e.nativeEvent as InputEvent
      const data = nativeEvent.data ?? nativeEvent.dataTransfer?.getData('text/plain') ?? ''
      if (!data) return
      for (const ch of data) processCharInput(seg, ch)
    },
    [processCharInput],
  )

  const onSegmentFocus = React.useCallback((seg: SegmentNode) => {
    typingCountRef.current.delete(seg.index)
  }, [])

  const onSegmentBlur = React.useCallback((seg: SegmentNode) => {
    typingCountRef.current.delete(seg.index)
  }, [])

  const fullDate = partsToDate(parts)
  const hiddenValue = fullDate ? formatISO(fullDate, { representation: 'date' }) : ''

  return (
    <div
      data-slot="date-field"
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      role="group"
      ref={ref}
      className={cn(
        unstyled
          ? 'inline-flex min-w-0 items-center select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed'
          : cn(
              inputVariants({ variant, size, state: 'within' }),
              'select-none',
              'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
            ),
        className,
      )}
      {...rest}
      onMouseDown={(e) => {
        rest.onMouseDown?.(e)
        if (!e.defaultPrevented) onRootMouseDown(e)
      }}
    >
      {startSlot ? (
        <div data-slot="date-field-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      ) : null}
      <div data-slot="date-field-segments" className="text-foreground flex min-w-0 flex-1 items-center">
        {nodes.map((node, i) => {
          if (node.kind === 'literal') {
            return (
              <span key={\`l-\${i}\`} aria-hidden="true" className="text-foreground-subtle whitespace-pre">
                {node.text}
              </span>
            )
          }
          const partVal = getPartFor(node.type, parts)
          const range = getSegmentRange(node.token, parts)
          const isAlphaMonth = node.token === 'MMM' || node.token === 'MMMM'
          const editable = !disabled && !readOnly
          return (
            <span
              key={\`s-\${node.index}\`}
              ref={setSegmentRef(node.index)}
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
              contentEditable={editable}
              suppressContentEditableWarning
              inputMode={isAlphaMonth ? 'text' : 'numeric'}
              enterKeyHint="next"
              autoCorrect="off"
              spellCheck={false}
              aria-label={node.type}
              aria-readonly={readOnly || undefined}
              aria-valuemin={range.min}
              aria-valuemax={range.max}
              aria-valuenow={partVal ?? undefined}
              aria-valuetext={ariaText(partVal, node.token)}
              data-slot="date-field-segment"
              data-placeholder={partVal == null || undefined}
              onBeforeInput={(e) => onSegmentBeforeInput(e, node)}
              onKeyDown={(e) => onSegmentKeyDown(e, node)}
              onFocus={() => onSegmentFocus(node)}
              onBlur={() => onSegmentBlur(node)}
              className={cn(
                'rounded-3xs inline-block px-0.5 caret-transparent transition-colors duration-200 outline-none motion-reduce:transition-none',
                'focus:bg-(--selection-color)',
                'data-placeholder:text-foreground-subtle',
              )}
            >
              {displayPart(partVal, node.token)}
            </span>
          )
        })}
      </div>
      {endSlot ? (
        <div data-slot="date-field-end" className="-me-1 shrink-0">
          {endSlot}
        </div>
      ) : null}
      {name ? <input type="hidden" name={name} value={hiddenValue} required={required} disabled={disabled} /> : null}
    </div>
  )
}

export { DateField }
export type { DateFieldProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">date field</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-date-picker`,
    name: `Date Picker (Appica)`,
    category: `Forms`,
    tags: [`calendar`, `date`, `appica`],
    code: `// ─── date-picker/date-picker.tsx ───
'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar, type CalendarProps, type DateRange, type Matcher } from '../calendar/calendar'
import { DateField } from '../date-field/date-field'
import { TimeField } from '../time-field/time-field'
import { Input, inputVariants } from '../input'
import { Popover, PopoverContent, PopoverTrigger, type PopoverContentProps } from '../popover/popover'
import { buttonVariants } from '../button/button-variants'
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context'
import { cn } from '../../internal/utils'

type DatePickerSize = 'sm' | 'md' | 'lg'
type DatePickerVariant = 'outline' | 'soft'
type DatePickerMode = 'single' | 'range' | 'multiple'

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

type CalendarPassthrough = DistributiveOmit<
  CalendarProps,
  | 'mode'
  | 'selected'
  | 'onSelect'
  | 'month'
  | 'onMonthChange'
  | 'size'
  | 'classNames'
  | 'components'
  | 'className'
  | 'disabled'
>

type DatePickerBase = CalendarPassthrough & {
  /**
   * Height, padding, and calendar cell scale.
   * @default 'md'
   */
  size?: DatePickerSize
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: DatePickerVariant
  /**
   * date-fns format for the date field(s).
   * @default 'MM/dd/yyyy'
   */
  dateFormat?: string
  /**
   * date-fns format for the time field(s).
   * @default 'HH:mm:ss'
   */
  timeFormat?: string
  /**
   * Show a clear button (multiple mode).
   * @default false
   */
  clearable?: boolean
  /** Content pinned to the start edge. */
  startSlot?: React.ReactNode
  /** Content pinned to the end edge. */
  endSlot?: React.ReactNode
  /**
   * Disable the whole control.
   * @default false
   */
  disabled?: boolean
  /** Dates that can't be selected in the calendar. */
  disabledDates?: Matcher | Matcher[]
  /**
   * Make the typeable fields read-only.
   * @default false
   */
  readOnly?: boolean
  /**
   * Mark the form field as required.
   * @default false
   */
  required?: boolean
  /**
   * Hidden input name for form submission. \`range\` mode emits \`name[from]\` / \`name[to]\`; with \`showTime\` the value is a
   * full datetime.
   */
  name?: string
  /** Flag the field invalid - sets \`data-invalid\` for styling + conveys it to assistive tech. */
  'aria-invalid'?: boolean
  /** Classes on the root wrapper - use for footprint/layout (e.g. \`max-w-60\`). Merged via \`tailwind-merge\`. */
  className?: string
  /**
   * Classes on the inner field box - use to override field styling (border, radius, background). Merged via
   * \`tailwind-merge\`.
   */
  inputClassName?: string
  /**
   * Separator between the range's two fields.
   * @default '–'
   */
  rangeSeparator?: React.ReactNode
  /** Controlled open state. Pair with \`onOpenChange\`. */
  open?: boolean
  /**
   * Uncontrolled initial open state.
   * @default false
   */
  defaultOpen?: boolean
  /** Fires when the popover opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Preferred popover side.
   * @default 'bottom'
   */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Popover alignment.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end'
  /**
   * Gap between the field and the popover.
   * @default 6
   */
  sideOffset?: number
  /** Escape hatch forwarded to the inner \`PopoverContent\` (collision props, \`className\`, …). */
  popoverProps?: Partial<PopoverContentProps>
  /**
   * Override auto-close. By default only single mode closes on pick; range and multiple stay open (dismiss on
   * outside-click/Escape).
   * @default auto
   */
  closeOnSelect?: boolean
  /**
   * Add a \`TimeField\` (single/range modes).
   * @default false
   */
  showTime?: boolean
  /**
   * Icon for the popover trigger button.
   * @default calendar icon
   */
  triggerIcon?: React.ReactNode
  /**
   * Accessible label for the trigger button.
   * @default 'Open calendar'
   */
  triggerAriaLabel?: string
}

type DatePickerProps =
  | (DatePickerBase & {
      mode?: 'single'
      value?: Date | undefined
      defaultValue?: Date | undefined
      onValueChange?: (v: Date | undefined) => void
    })
  | (DatePickerBase & {
      mode: 'range'
      value?: DateRange | undefined
      defaultValue?: DateRange | undefined
      onValueChange?: (v: DateRange | undefined) => void
    })
  | (DatePickerBase & {
      /**
       * Selection behavior; determines the \`value\` shape.
       * @default 'single'
       */
      mode: 'multiple'
      /** Controlled value; shape matches \`mode\`. Pair with \`onValueChange\`. */
      value?: Date[] | undefined
      /** Uncontrolled initial value. */
      defaultValue?: Date[] | undefined
      /** Fires when the selection changes; the argument shape matches \`mode\`. */
      onValueChange?: (v: Date[] | undefined) => void
      /** Placeholder for the multiple-mode summary field. */
      placeholder?: string
      /** Customize the multiple-mode summary text. */
      formatValue?: (value: Date[] | undefined) => string
    })

const DEFAULT_TRIGGER_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    <path d="M14.425 8.825H3.575v5.425c0 .245.097.481.27.654s.409.271.654.271h9c.245 0 .481-.097.654-.271s.271-.409.271-.654V8.825zm-9.163 3.35c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.25 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.253 0c.318 0 .575.258.575.575s-.258.575-.575.575h-.003c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.003zM5.26 9.925c.318 0 .575.258.575.575s-.258.575-.575.575h-.01c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.01zm2.252 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.25 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.253 0c.318 0 .575.258.575.575s-.258.575-.575.575h-.003c-.317 0-.575-.258-.575-.575s.258-.575.575-.575h.003zm-.59-4.675v-.925h-4.85v.925c0 .318-.258.575-.575.575s-.575-.258-.575-.575v-.925H4.5c-.245 0-.481.097-.654.271s-.27.409-.27.654v2.425h10.85V5.25c0-.245-.097-.481-.271-.654s-.409-.271-.654-.271h-.925v.925c0 .318-.258.575-.575.575s-.575-.258-.575-.575zm4.15 9c0 .55-.219 1.078-.608 1.467s-.916.608-1.467.608h-9c-.55 0-1.078-.219-1.467-.608s-.608-.916-.608-1.467v-9c0-.55.219-1.078.608-1.467s.916-.608 1.467-.608h.925V2.25c0-.318.258-.575.575-.575s.575.258.575.575v.925h4.85V2.25c0-.318.258-.575.575-.575s.575.258.575.575v.925h.925c.55 0 1.078.219 1.467.608s.608.916.608 1.467v9z" />
  </svg>
)

const TRIGGER_BUTTON_OVERRIDES: Record<DatePickerSize, string> = {
  sm: 'size-6 rounded-xs -me-1.25',
  md: 'size-8 rounded-sm -me-1.75',
  lg: 'size-10 rounded-md -me-2.25',
}

const TRIGGER_BUTTON_SIZES: Record<DatePickerSize, 'icon-sm' | 'icon-md' | 'icon-lg'> = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
}

function DatePicker(props: DatePickerProps) {
  const {
    size = 'md',
    mode = 'single',
    variant = 'outline',
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    showTime = false,
    dateFormat = 'MM/dd/yyyy',
    timeFormat = 'HH:mm:ss',
    placeholder,
    clearable,
    startSlot,
    endSlot,
    disabled: disabledProp,
    disabledDates,
    readOnly,
    required,
    name: nameProp,
    side = 'bottom',
    align = 'end',
    sideOffset = 6,
    popoverProps,
    closeOnSelect,
    rangeSeparator = '–',
    triggerIcon = DEFAULT_TRIGGER_ICON,
    triggerAriaLabel = 'Open calendar',
    formatValue,
    'aria-invalid': _ariaInvalid,
    className,
    inputClassName,
    ...calendarProps
  } = props as DatePickerBase & {
    mode?: DatePickerMode
    value?: Date | Date[] | DateRange
    defaultValue?: Date | Date[] | DateRange
    onValueChange?: (v: unknown) => void
    placeholder?: string
    formatValue?: (value: Date[] | undefined) => string
  }

  const field = useFieldRootContext(true)
  const disabled = disabledProp || field.disabled
  const name = nameProp ?? field.name
  const invalid = props['aria-invalid'] === true || field.invalid === true

  const wasControlledRef = React.useRef(value !== undefined)
  if (value !== undefined) wasControlledRef.current = true
  const isValueControlled = wasControlledRef.current
  const [internalValue, setInternalValue] = React.useState<Date | Date[] | DateRange | undefined>(defaultValue)
  const currentValue = isValueControlled ? value : internalValue

  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const currentOpen = isOpenControlled ? open : internalOpen

  const [calendarMonth, setCalendarMonth] = React.useState<Date | undefined>(() => {
    const fromValue = deriveCalendarMonth(mode, defaultValue ?? value)
    if (fromValue) return fromValue
    return (calendarProps as { defaultMonth?: Date }).defaultMonth
  })

  const derivedMonth = deriveCalendarMonth(mode, currentValue)
  const lastDerivedKeyRef = React.useRef<string>(monthKey(derivedMonth))
  React.useEffect(() => {
    const key = monthKey(derivedMonth)
    if (key !== lastDerivedKeyRef.current) {
      lastDerivedKeyRef.current = key
      if (derivedMonth) setCalendarMonth(derivedMonth)
    }
  }, [derivedMonth])

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange],
  )

  const setValue = React.useCallback(
    (next: Date | Date[] | DateRange | undefined) => {
      if (!isValueControlled) setInternalValue(next)
      onValueChange?.(next)
      if (shouldAutoClose(mode, next, closeOnSelect)) setOpen(false)
    },
    [isValueControlled, mode, closeOnSelect, onValueChange, setOpen],
  )

  const handleDateFieldChange = (nextDate: Date | null) => {
    if (mode !== 'single') return
    if (!nextDate) {
      setValue(undefined)
      return
    }
    setValue(mergeDateAndTime(nextDate, currentValue as Date | undefined))
  }

  const handleTimeFieldChange = (nextTime: string | null) => {
    if (mode !== 'single' || !showTime) return
    const cur = currentValue as Date | undefined
    if (!cur) return
    setValue(applyTimeString(cur, nextTime))
  }

  const handleRangeFromDateChange = (nextDate: Date | null) => {
    if (mode !== 'range') return
    const cur = currentValue as DateRange | undefined
    const merged = nextDate ? mergeDateAndTime(nextDate, cur?.from) : undefined
    setValue({ from: merged, to: cur?.to })
  }

  const handleRangeToDateChange = (nextDate: Date | null) => {
    if (mode !== 'range') return
    const cur = currentValue as DateRange | undefined
    const merged = nextDate ? mergeDateAndTime(nextDate, cur?.to) : undefined
    setValue({ from: cur?.from, to: merged })
  }

  const handleRangeFromTimeChange = (nextTime: string | null) => {
    if (mode !== 'range' || !showTime) return
    const cur = currentValue as DateRange | undefined
    if (!cur?.from) return
    setValue({ from: applyTimeString(cur.from, nextTime), to: cur.to })
  }

  const handleRangeToTimeChange = (nextTime: string | null) => {
    if (mode !== 'range' || !showTime) return
    const cur = currentValue as DateRange | undefined
    if (!cur?.to) return
    setValue({ from: cur.from, to: applyTimeString(cur.to, nextTime) })
  }

  const handleCalendarSelect = (nextRaw: Date | Date[] | DateRange | undefined) => {
    if (mode === 'single' && nextRaw instanceof Date) {
      setValue(mergeDateAndTime(nextRaw, currentValue as Date | undefined))
    } else if (mode === 'range' && nextRaw && !(nextRaw instanceof Date) && !Array.isArray(nextRaw)) {
      const cur = currentValue as DateRange | undefined
      const r = nextRaw as DateRange
      setValue({
        from: r.from ? mergeDateAndTime(r.from, cur?.from) : undefined,
        to: r.to ? mergeDateAndTime(r.to, cur?.to) : undefined,
      })
    } else {
      setValue(nextRaw)
    }
  }

  const clearAll = React.useCallback(() => setValue(undefined), [setValue])

  const anchorRef = React.useRef<HTMLDivElement>(null)

  const triggerButton = (
    <PopoverTrigger
      disabled={disabled}
      render={(triggerProps) => (
        <button
          {...(triggerProps as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          type="button"
          aria-label={triggerAriaLabel}
          className={cn(
            buttonVariants({ variant: 'ghost', size: TRIGGER_BUTTON_SIZES[size] }),
            TRIGGER_BUTTON_OVERRIDES[size],
            'text-foreground',
          )}
        >
          {triggerIcon}
        </button>
      )}
    />
  )

  const sharedFieldProps = {
    variant,
    size,
    disabled,
    readOnly,
    required,
    'aria-invalid': invalid || undefined,
  } as const

  let fields: React.ReactNode

  if (mode === 'single') {
    const date = currentValue as Date | undefined
    if (showTime) {
      fields = (
        <UnifiedWrapper
          variant={variant}
          size={size}
          disabled={disabled}
          ariaInvalid={invalid || undefined}
          className={inputClassName}
          startSlot={startSlot}
          endSlot={endSlot}
          trigger={triggerButton}
        >
          <DateField
            unstyled
            value={date ?? null}
            onValueChange={handleDateFieldChange}
            format={dateFormat}
            {...sharedFieldProps}
          />
          <TimeField
            unstyled
            value={date ? format(date, 'HH:mm:ss') : null}
            onValueChange={handleTimeFieldChange}
            format={timeFormat}
            {...sharedFieldProps}
          />
        </UnifiedWrapper>
      )
    } else {
      fields = (
        <DateField
          value={date ?? null}
          onValueChange={handleDateFieldChange}
          format={dateFormat}
          startSlot={startSlot}
          endSlot={
            <>
              {endSlot}
              {triggerButton}
            </>
          }
          className={inputClassName}
          {...sharedFieldProps}
        />
      )
    }
  } else if (mode === 'range') {
    const range = currentValue as DateRange | undefined
    fields = (
      <UnifiedWrapper
        variant={variant}
        size={size}
        disabled={disabled}
        ariaInvalid={invalid || undefined}
        className={inputClassName}
        startSlot={startSlot}
        endSlot={endSlot}
        trigger={triggerButton}
      >
        <DateField
          unstyled
          value={range?.from ?? null}
          onValueChange={handleRangeFromDateChange}
          format={dateFormat}
          {...sharedFieldProps}
        />
        {showTime && (
          <TimeField
            unstyled
            value={range?.from ? format(range.from, 'HH:mm:ss') : null}
            onValueChange={handleRangeFromTimeChange}
            format={timeFormat}
            {...sharedFieldProps}
          />
        )}
        <span className="text-foreground-muted shrink-0" aria-hidden="true">
          {rangeSeparator}
        </span>
        <DateField
          unstyled
          value={range?.to ?? null}
          onValueChange={handleRangeToDateChange}
          format={dateFormat}
          {...sharedFieldProps}
        />
        {showTime && (
          <TimeField
            unstyled
            value={range?.to ? format(range.to, 'HH:mm:ss') : null}
            onValueChange={handleRangeToTimeChange}
            format={timeFormat}
            {...sharedFieldProps}
          />
        )}
      </UnifiedWrapper>
    )
  } else {
    const days = currentValue as Date[] | undefined
    const display = formatValue ? formatValue(days) : defaultMultipleFormat(days, dateFormat)
    fields = (
      <Input
        inputSize={size}
        variant={variant}
        value={display}
        readOnly
        placeholder={placeholder}
        clearable={clearable && (days?.length ?? 0) > 0}
        onClear={clearAll}
        startSlot={startSlot}
        endSlot={
          <>
            {endSlot}
            {triggerButton}
          </>
        }
        disabled={disabled}
        required={required}
        name={name}
        aria-invalid={invalid || undefined}
        className={inputClassName}
      />
    )
  }

  let hiddenInputs: React.ReactNode = null
  if (name && mode === 'single') {
    hiddenInputs = <input type="hidden" name={name} value={toFormValue(currentValue as Date | undefined, showTime)} />
  } else if (name && mode === 'range') {
    const r = currentValue as DateRange | undefined
    hiddenInputs = (
      <>
        <input type="hidden" name={\`\${name}[from]\`} value={toFormValue(r?.from ?? undefined, showTime)} />
        <input type="hidden" name={\`\${name}[to]\`} value={toFormValue(r?.to ?? undefined, showTime)} />
      </>
    )
  }

  return (
    <Popover open={currentOpen} onOpenChange={setOpen}>
      <div ref={anchorRef} data-slot="date-picker-anchor" className={cn('flex w-full', className)}>
        {fields}
        {hiddenInputs}
      </div>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        arrow={false}
        {...popoverProps}
        anchor={anchorRef}
        className={cn('w-fit max-w-none min-w-0 p-3', popoverProps?.className)}
      >
        <Calendar
          size={size}
          mode={mode as never}
          selected={currentValue as never}
          onSelect={handleCalendarSelect as never}
          {...(calendarProps as Record<string, unknown>)}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  )
}

interface UnifiedWrapperProps {
  variant: DatePickerVariant
  size: DatePickerSize
  disabled?: boolean
  ariaInvalid?: boolean
  className?: string
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
  trigger: React.ReactNode
  children: React.ReactNode
}

function UnifiedWrapper({
  variant,
  size,
  disabled,
  ariaInvalid,
  className,
  startSlot,
  endSlot,
  trigger,
  children,
}: UnifiedWrapperProps) {
  return (
    <div
      data-slot="date-picker"
      data-disabled={disabled || undefined}
      data-invalid={ariaInvalid || undefined}
      className={cn(
        inputVariants({ variant, size, state: 'within' }),
        'flex w-full',
        'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
        className,
      )}
    >
      {startSlot ? (
        <div data-slot="date-picker-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      ) : null}
      {children}
      {endSlot ? (
        <div data-slot="date-picker-end" className="shrink-0">
          {endSlot}
        </div>
      ) : null}
      <div data-slot="date-picker-trigger" className="ms-auto -me-1 shrink-0">
        {trigger}
      </div>
    </div>
  )
}

function shouldAutoClose(
  mode: DatePickerMode,
  next: Date | Date[] | DateRange | undefined,
  override?: boolean,
): boolean {
  if (override !== undefined) return override
  if (mode === 'single') return next instanceof Date
  return false
}

function mergeDateAndTime(nextDate: Date, withTime: Date | undefined): Date {
  if (!withTime) return nextDate
  const out = new Date(nextDate)
  out.setHours(withTime.getHours(), withTime.getMinutes(), withTime.getSeconds(), withTime.getMilliseconds())
  return out
}

function toFormValue(date: Date | undefined, showTime: boolean): string {
  if (!date) return ''
  return format(date, showTime ? "yyyy-MM-dd'T'HH:mm:ss" : 'yyyy-MM-dd'

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">date picker</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-dialog`,
    name: `Dialog (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── dialog/dialog.tsx ───
import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn } from '../../internal/utils'
import { type ModalContentProps, splitModalProps } from '../../internal/modal'
import { buttonVariants } from '../button/button-variants'

type DialogProps = React.ComponentProps<typeof BaseDialog.Root>

const Dialog = Object.assign(
  function Dialog(props: DialogProps) {
    return <BaseDialog.Root {...props} />
  },
  { createHandle: BaseDialog.createHandle },
)

type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>

function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" className={cn(className)} {...props} />
}

type DialogContentProps = ModalContentProps<
  React.ComponentProps<typeof BaseDialog.Popup>,
  React.ComponentProps<typeof BaseDialog.Portal>,
  React.ComponentProps<typeof BaseDialog.Backdrop>,
  React.ComponentProps<typeof BaseDialog.Viewport>
> & {
  /**
   * Render the × button in the corner.
   * @default true
   */
  closeButton?: boolean
  /**
   * Accessible label for the close button.
   * @default 'Close'
   */
  closeLabel?: string
  /**
   * Render the dimmed, blurred backdrop behind the popup.
   * @default true
   */
  backdrop?: boolean
  /**
   * Wrap the popup in a translucent glass frame. Needs \`backdrop\`: without one the popup
   * is always a plain solid card.
   * @default true
   */
  frame?: boolean
}

function DialogContent({
  className,
  children,
  closeButton = true,
  closeLabel = 'Close',
  backdrop = true,
  frame = true,
  backdropProps,
  viewportProps,
  ...props
}: DialogContentProps) {
  // The frame is a rim of blurred page around the popup, so it only reads against the
  // backdrop. Without one it collapses to a plain solid card.
  const showFrame = frame && backdrop
  const { portal, popup } = splitModalProps(props)
  return (
    <BaseDialog.Portal {...portal}>
      {backdrop && (
        <BaseDialog.Backdrop
          data-slot="dialog-backdrop"
          {...backdropProps}
          className={cn(
            'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
            'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
            backdropProps?.className as string | undefined,
          )}
        />
      )}
      <BaseDialog.Viewport
        data-slot="dialog-viewport"
        {...viewportProps}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4',
          viewportProps?.className as string | undefined,
        )}
      >
        <BaseDialog.Popup
          data-slot="dialog-popup"
          {...(showFrame ? { 'data-frame': '' } : {})}
          className={cn(
            'group/dialog-popup relative flex max-h-full min-h-0 w-150 max-w-full flex-col',
            'rounded-2xl border',
            showFrame ? 'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm' : 'bg-background border-border-overlay',
            !showFrame && 'shadow-2xl',
            'isolate transform-gpu outline-none',
            'motion-safe:transition-[opacity,scale] motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            'data-nested-dialog-open:pointer-events-none data-nested-dialog-open:scale-95 data-nested-dialog-open:opacity-0',
            className,
          )}
          {...popup}
        >
          <div
            data-slot="dialog-content"
            className={cn(
              'relative flex min-h-0 flex-col overflow-hidden not-has-[>[data-slot=dialog-footer]]:pb-6 not-has-[>[data-slot=dialog-header]]:pt-6 [&>[data-slot=dialog-header]+[data-slot=dialog-footer]]:pt-0',
              showFrame && 'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
            )}
          >
            {children}
            {closeButton && (
              <BaseDialog.Close
                aria-label={closeLabel}
                data-slot="dialog-close-button"
                className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'absolute inset-e-3 top-3 z-10')}
              >
                <CloseIcon />
              </BaseDialog.Close>
            )}
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  )
}

type DialogHeaderProps = React.ComponentPropsWithoutRef<'div'>

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div data-slot="dialog-header" className={cn('flex shrink-0 flex-col gap-2 p-6', className)} {...props} />
}

type DialogTitleProps = React.ComponentProps<typeof BaseDialog.Title>

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title
      data-slot="dialog-title"
      className={cn('text-foreground-intense text-2xl font-semibold', className)}
      {...props}
    />
  )
}

type DialogDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={cn('text-foreground-muted text-sm', className)}
      {...props}
    />
  )
}

type DialogBodyProps = React.ComponentPropsWithoutRef<'div'>

function DialogBody({ className, ...props }: DialogBodyProps) {
  return <div data-slot="dialog-body" className={cn('min-h-0 flex-1 px-6', className)} {...props} />
}

type DialogFooterProps = React.ComponentPropsWithoutRef<'div'>

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>

function DialogClose({ className, ...props }: DialogCloseProps) {
  return <BaseDialog.Close data-slot="dialog-close" className={cn(className)} {...props} />
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 3.594c.225-.225.588-.225.813 0s.225.588 0 .812L8.813 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0L8 8.812l-3.594 3.594c-.225.225-.588.225-.812 0s-.225-.588 0-.812L7.188 8 3.594 4.406c-.225-.225-.225-.588 0-.812s.588-.225.813 0L8 7.187l3.594-3.594z" />
    </svg>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
}
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogBodyProps,
  DialogFooterProps,
  DialogCloseProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">dialog</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-drawer`,
    name: `Drawer (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── drawer/drawer.tsx ───
'use client'

import * as React from 'react'
import { Drawer as BaseDrawer } from '@base-ui/react/drawer'
import { cn } from '../../internal/utils'
import { type ModalContentProps, splitModalProps } from '../../internal/modal'
import { buttonVariants } from '../button/button-variants'

type DrawerSide = 'top' | 'bottom' | 'left' | 'right'

const SIDE_TO_SWIPE = {
  top: 'up',
  bottom: 'down',
  left: 'left',
  right: 'right',
} as const satisfies Record<DrawerSide, 'up' | 'down' | 'left' | 'right'>

const DrawerSideContext = React.createContext<DrawerSide>('bottom')
const DrawerDepthContext = React.createContext(0)
const DrawerSnapContext = React.createContext(false)

interface DrawerProps extends Omit<React.ComponentProps<typeof BaseDrawer.Root>, 'swipeDirection'> {
  /**
   * The edge the drawer slides in from.
   * @default 'bottom'
   */
  side?: DrawerSide
}

const Drawer = Object.assign(
  function Drawer({ side = 'bottom', ...props }: DrawerProps) {
    const depth = React.useContext(DrawerDepthContext) + 1
    return (
      <DrawerDepthContext value={depth}>
        <DrawerSnapContext value={props.snapPoints != null}>
          <DrawerSideContext value={side}>
            <BaseDrawer.Root swipeDirection={SIDE_TO_SWIPE[side]} {...props} />
          </DrawerSideContext>
        </DrawerSnapContext>
      </DrawerDepthContext>
    )
  },
  { createHandle: BaseDrawer.createHandle },
)

type DrawerProviderProps = React.ComponentProps<typeof BaseDrawer.Provider>

function DrawerProvider(props: DrawerProviderProps) {
  return <BaseDrawer.Provider {...props} />
}

type DrawerIndentBackgroundProps = React.ComponentProps<typeof BaseDrawer.IndentBackground>

function DrawerIndentBackground({ className, ...props }: DrawerIndentBackgroundProps) {
  return (
    <BaseDrawer.IndentBackground
      data-slot="drawer-indent-background"
      className={cn('bg-background fixed inset-0 -z-10', className)}
      {...props}
    />
  )
}

type DrawerIndentProps = React.ComponentProps<typeof BaseDrawer.Indent>

function DrawerIndent({ className, ...props }: DrawerIndentProps) {
  return (
    <BaseDrawer.Indent
      data-slot="drawer-indent"
      className={cn(
        '[--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))]',
        'origin-top overflow-hidden transition-[transform,border-radius] ease-[cubic-bezier(0.32,0.72,0,1)]',
        'motion-safe:duration-[calc(var(--indent-transition)*400ms)] motion-reduce:transition-none',
        'data-active:transform-[scale(calc(0.95+0.03*var(--drawer-swipe-progress)))] data-active:rounded-2xl',
        className,
      )}
      {...props}
    />
  )
}

type DrawerTriggerProps = React.ComponentProps<typeof BaseDrawer.Trigger>

function DrawerTrigger({ className, ...props }: DrawerTriggerProps) {
  return <BaseDrawer.Trigger data-slot="drawer-trigger" className={cn(className)} {...props} />
}

const VIEWPORT_SIDE = {
  bottom: 'items-end justify-center',
  top: 'items-start justify-center',
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
} satisfies Record<DrawerSide, string>

const POPUP_SIDE = {
  bottom: cn(
    'w-full origin-bottom [height:var(--drawer-height,auto)] max-h-full [--stack-extent:var(--drawer-frontmost-height,var(--drawer-height,0px))]',
    'data-nested-drawer-open:[height:var(--drawer-frontmost-height,auto)] data-nested-drawer-open:overflow-hidden',
    '[transform:translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-offset)))_scale(var(--stack-scale))]',
    'data-starting-style:[transform:translateY(calc(100%+0.5rem))] data-ending-style:[transform:translateY(calc(100%+0.5rem))]',
  ),
  top: cn(
    'w-full origin-top [height:var(--drawer-height,auto)] max-h-full [--stack-extent:var(--drawer-frontmost-height,var(--drawer-height,0px))]',
    'data-nested-drawer-open:[height:var(--drawer-frontmost-height,auto)] data-nested-drawer-open:overflow-hidden',
    '[transform:translateY(calc(var(--drawer-swipe-movement-y)+var(--stack-offset)))_scale(var(--stack-scale))]',
    'data-starting-style:[transform:translateY(calc(-100%-0.5rem))] data-ending-style:[transform:translateY(calc(-100%-0.5rem))]',
  ),
  left: cn(
    'h-full w-96 max-w-full origin-left [--stack-extent:25rem]',
    '[transform:translateX(calc(var(--drawer-swipe-movement-x)+var(--stack-offset)))_scale(var(--stack-scale))]',
    'data-starting-style:[transform:translateX(calc(-100%-0.5rem))] data-ending-style:[transform:translateX(calc(-100%-0.5rem))]',
  ),
  right: cn(
    'h-full w-96 max-w-full origin-right [--stack-extent:25rem]',
    '[transform:translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-offset)))_scale(var(--stack-scale))]',
    'data-starting-style:[transform:translateX(calc(100%+0.5rem))] data-ending-style:[transform:translateX(calc(100%+0.5rem))]',
  ),
} satisfies Record<DrawerSide, string>

const POPUP_SNAP_SIDE = {
  bottom: cn(
    'h-[calc(100dvh-1rem)] w-full min-h-0 origin-bottom shadow-[0_-24px_32px_-12px_var(--shadow-color)]',
    '[--snap-offset:var(--drawer-snap-point-offset,0px)]',
    '[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)))]',
    'data-starting-style:[transform:translateY(calc(100%+0.5rem))] data-ending-style:[transform:translateY(calc(100%+0.5rem))]',
  ),
  top: cn(
    'h-[calc(100dvh-1rem)] w-full min-h-0 origin-top',
    '[--snap-offset:var(--drawer-snap-point-offset,0px)]',
    '[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)))]',
    'data-starting-style:[transform:translateY(calc(-100%-0.5rem))] data-ending-style:[transform:translateY(calc(-100%-0.5rem))]',
  ),
} satisfies Record<'top' | 'bottom', string>

const SHADOW_SIDE = {
  bottom: 'shadow-[0_-24px_32px_-12px_var(--shadow-color)]',
  top: 'shadow-2xl',
  left: 'shadow-[24px_0_32px_-12px_var(--shadow-color)]',
  right: 'shadow-[-24px_0_32px_-12px_var(--shadow-color)]',
} satisfies Record<DrawerSide, string>

const HANDLE_SIDE = {
  bottom:
    'before:absolute before:top-1.5 before:left-1/2 before:h-1 before:w-11.5 before:-translate-x-1/2 before:rounded-full',
  top: 'before:absolute before:bottom-1.5 before:left-1/2 before:h-1 before:w-11.5 before:-translate-x-1/2 before:rounded-full',
  left: 'before:absolute before:inset-e-1.5 before:top-1/2 before:h-11.5 before:w-1 before:-translate-y-1/2 before:rounded-full',
  right:
    'before:absolute before:inset-s-1.5 before:top-1/2 before:h-11.5 before:w-1 before:-translate-y-1/2 before:rounded-full',
} satisfies Record<DrawerSide, string>

const FRAME_PAD_SIDE = {
  bottom: 'pt-4!',
  top: 'pb-4!',
  left: 'pe-4!',
  right: 'ps-4!',
} satisfies Record<DrawerSide, string>

const CONTENT_RECLAIM_SIDE = {
  bottom: 'overflow-hidden [&>[data-slot=drawer-header]]:-mt-4 [&>[data-slot=drawer-close-button]]:top-0',
  top: 'overflow-hidden [&>[data-slot=drawer-footer]]:-mb-4',
  left: 'overflow-hidden [&>:not([data-slot=drawer-close-button])]:-me-4 [&>[data-slot=drawer-close-button]]:inset-e-0',
  right: 'overflow-hidden [&>:not([data-slot=drawer-close-button])]:-ms-4',
} satisfies Record<DrawerSide, string>

type DrawerContentProps = ModalContentProps<
  React.ComponentProps<typeof BaseDrawer.Popup>,
  React.ComponentProps<typeof BaseDrawer.Portal>,
  React.ComponentProps<typeof BaseDrawer.Backdrop>,
  React.ComponentProps<typeof BaseDrawer.Viewport>
> & {
  /**
   * Render the × button in the corner.
   * @default true
   */
  closeButton?: boolean
  /**
   * Accessible label for the close button.
   * @default 'Close'
   */
  closeLabel?: string
  /** Render the dimmed backdrop. Defaults to \`true\` at the top level, off when nested. */
  backdrop?: boolean
  /**
   * Wrap the panel in a translucent glass frame. Turned off, the drawer is a plain solid
   * card and the handle sits inside it, the way a nested drawer looks. Needs \`backdrop\`:
   * without one the panel is always solid.
   * @default true
   */
  frame?: boolean
}

function DrawerContent({
  className,
  children,
  closeButton = true,
  closeLabel = 'Close',
  backdrop,
  frame = true,
  backdropProps,
  viewportProps,
  ...props
}: DrawerContentProps) {
  const side = React.useContext(DrawerSideContext)
  const depth = React.useContext(DrawerDepthContext)
  const hasSnap = React.useContext(DrawerSnapContext)
  const forceBackdrop = backdropProps?.forceRender === true
  const showBackdrop = forceBackdrop || (backdrop ?? depth <= 1)
  // The frame is a rim of blurred page around the panel, so it only reads against the
  // backdrop. Without one - a nested drawer, or \`backdrop={false}\` - it collapses to a
  // plain solid card with the handle inside.
  const showFrame = frame && showBackdrop
  const snapSide = hasSnap && (side === 'bottom' || side === 'top') ? side : null
  const { portal, popup } = splitModalProps(props)

  return (
    <BaseDrawer.Portal {...portal}>
      {showBackdrop && (
        <BaseDrawer.Backdrop
          data-slot="drawer-backdrop"
          {...backdropProps}
          className={cn(
            'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'opacity-[calc(1-var(--drawer-swipe-progress))]',
            'motion-safe:transition-opacity motion-safe:duration-400 motion-safe:ease-out',
            'data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0',
            backdropProps?.className as string | undefined,
          )}
        />
      )}
      <BaseDrawer.Viewport
        data-slot="drawer-viewport"
        {...viewportProps}
        className={cn(
          'fixed inset-0 z-50 flex overflow-hidden p-2',
          VIEWPORT_SIDE[side],
          snapSide && 'touch-none',
          viewportProps?.className as string | undefined,
        )}
      >
        <BaseDrawer.Popup
          data-slot="drawer-popup"
          {...(showFrame ? { 'data-frame': '' } : {})}
          className={cn(
            'relative flex min-h-0 flex-col rounded-2xl border',
            snapSide
              ? cn(
                  'bg-background border-border-overlay before:bg-background-strong',
                  showFrame &&
                    cn(
                      'data-expanded:before:bg-background data-expanded:border-white/15 data-expanded:p-1.5',
                      'data-expanded:bg-white/10 data-expanded:shadow-none data-expanded:backdrop-blur-sm',
                    ),
                )
              : showFrame
                ? 'before:bg-background border-white/15 bg-white/10 p-1.5 backdrop-blur-sm'
                : 'bg-background border-border-overlay before:bg-background-strong',
            'isolate outline-none',
            (hasSnap || !showFrame) && SHADOW_SIDE[side],
            FRAME_PAD_SIDE[side],
            HANDLE_SIDE[side],
            'motion-safe:transition-[transform,height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.32,1.2,0.4,1)]',
            'data-ending-style:motion-safe:duration-300 data-ending-style:motion-safe:ease-out',
            'data-nested-drawer-swiping:duration-0 data-swiping:duration-0 data-swiping:select-none',
            snapSide
              ? cn('touch-none', POPUP_SNAP_SIDE[snapSide])
              : cn(
                  '[--stack-progress:clamp(0,var(--drawer-swipe-progress,0),1)] [--stack-step:0.05]',
                  '[--stack-count:max(0,calc(var(--nested-drawers,0)-var(--stack-progress)))]',
                  '[--stack-scale:clamp(0,calc(1-var(--stack-step)*var(--stack-count)),1)]',
                  '[--stack-shrink:calc(1-var(--stack-scale))]',
                  '[--stack-peek:calc(var(--stack-count)*1.5rem)]',
                  '[--stack-offset:calc(var(--stack-peek)+var(--stack-shrink)*var(--stack-extent))]',
                  POPUP_SIDE[side],
                ),
            className,
          )}
          {...popup}
        >
          <div
            data-slot="drawer-content"
            className={cn(
              'relative flex min-h-0 flex-col not-has-[>[data-slot=drawer-footer]]:pb-6 not-has-[>[data-slot=drawer-header]]:pt-6 [&>[data-slot=drawer-header]+[data-slot=drawer-footer]]:pt-0',
              showFrame || snapSide
                ? 'bg-background rounded-[calc(var(--radius-2xl)*5/6)]'
                : CONTENT_RECLAIM_SIDE[side],
              snapSide ? 'h-[calc(100dvh-1.5rem-var(--snap-offset,0))]' : 'flex-1',
            )}
          >
            {children}
            {closeButton && (
              <BaseDrawer.Close
                aria-label={closeLabel}
                data-slot="drawer-close-button"
                className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'absolute inset-e-3 top-3 z-10')}
              >
                <CloseIcon />
              </BaseDrawer.Close>
            )}
          </div>
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  )
}

type DrawerHeaderProps = React.ComponentPropsWithoutRef<'div'>

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return <div data-slot="drawer-header" className={cn('flex shrink-0 flex-col gap-2 p-6', className)} {...props} />
}

type DrawerTitleProps = React.ComponentProps<typeof BaseDrawer.Title>

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <BaseDrawer.Title
      data-slot="drawer-title"
      className={cn('text-foreground-intense text-2xl font-semibold', className)}
      {...props}
    />
  )
}

type DrawerDescriptionProps = React.ComponentProps<typeof BaseDrawer.Description>

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <BaseDrawer.Description
      data-slot="drawer-description"
      className={cn('text-foreground-muted text-sm', className)}
      {...props}
    />
  )
}

type DrawerBodyProps = React.ComponentProps<typeof BaseDrawer.Content>

function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return (
    <BaseDrawer.Content
      data-slot="drawer-body"
      className={cn('min-h-0 flex-1 overflow-y-auto px-6', className)}
      {...props}
    />
  )
}

type DrawerFooterProps = React.ComponentPropsWithoutRef<'div'>

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return <div data-slot="drawer-footer" className={cn('flex flex-col gap-2 p-6', className)} {...props} />
}

type DrawerCloseProps = React.ComponentProps<typeof BaseDrawer.Close>

function DrawerClose({ className, ...props }: DrawerCloseProps) {
  return <BaseDrawer.Close data-slot="drawer-close" className={cn(className)} {...props} />
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 3.594c.225-.225.588-.225.813 0s.225.588 0 .812L8.813 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0L8 8.812l-3.594 3.594c-.225.225-.588.225-.812 0s-.225-.588 0-.812L7.188 8 3.594 4.406c-.225-.225-.225-.588 0-.812s.588-.225.813 0L8 7.187l3.594-3.594z" />
    </svg>
  )
}

export {
  Drawer,
  DrawerProvider,
  DrawerIndent,
  DrawerIndentBackground,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
}
export type {
  DrawerProps,
  DrawerProviderProps,
  DrawerIndentProps,
  DrawerIndentBackgroundProps,
  DrawerTriggerProps,
  DrawerContentProps,
  DrawerHeaderProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
  DrawerBodyProps,
  DrawerFooterProps,
  DrawerCloseProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">drawer</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-dropdown-menu`,
    name: `Dropdown Menu (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── dropdown-menu/dropdown-menu.tsx ───
'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'

type DropdownMenuSize = 'sm' | 'md' | 'lg'

interface DropdownMenuContextValue {
  size: DropdownMenuSize
  reducedMotion: boolean
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) {
    throw new Error('DropdownMenu sub-components must be rendered inside <DropdownMenu>')
  }
  return ctx
}

type BaseRootProps = React.ComponentProps<typeof BaseMenu.Root>

interface DropdownMenuProps extends BaseRootProps {
  /**
   * Scales the popup radius, item padding, and icon size.
   * @default 'md'
   */
  size?: DropdownMenuSize
}

function DropdownMenu({ size = 'md', children, ...rest }: DropdownMenuProps) {
  const reducedMotion = useReducedMotion()
  const ctx = React.useMemo<DropdownMenuContextValue>(() => ({ size, reducedMotion }), [size, reducedMotion])
  return (
    <DropdownMenuContext value={ctx}>
      <BaseMenu.Root {...rest}>{children}</BaseMenu.Root>
    </DropdownMenuContext>
  )
}

type DropdownMenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>

function DropdownMenuTrigger({ className, ...props }: DropdownMenuTriggerProps) {
  return <BaseMenu.Trigger data-slot="dropdown-menu-trigger" className={cn(className)} {...props} />
}

const POPUP_SIZE: Record<DropdownMenuSize, string> = {
  sm: 'min-w-40 rounded-md',
  md: 'min-w-48 rounded-lg',
  lg: 'min-w-56 rounded-xl',
}

const ICON_SIZE: Record<DropdownMenuSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

function popupClassName(size: DropdownMenuSize, className?: string) {
  return cn(
    'max-h-(--available-height) w-(--anchor-width) bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
    POPUP_SIZE[size],
    'origin-(--transform-origin)',
    'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
    'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
    'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
    className,
  )
}

type DropdownMenuFloatingProps = FloatingContentProps<
  React.ComponentProps<typeof BaseMenu.Positioner>,
  React.ComponentProps<typeof BaseMenu.Portal>
>

type DropdownMenuContentProps = Omit<React.ComponentProps<typeof BaseMenu.Popup>, 'className'> &
  DropdownMenuFloatingProps & {
    /** Extra classes on the popup. */
    className?: string
  }

function DropdownMenuContent({ className, children, ...props }: DropdownMenuContentProps) {
  const { size } = useDropdownMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseMenu.Portal {...portal}>
      <BaseMenu.Positioner
        align="start"
        sideOffset={6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseMenu.Popup data-slot="dropdown-menu-content" className={popupClassName(size, className)} {...popup}>
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

const ITEM_BASE = 'w-full outline-hidden'

const ITEM_TEXT: Record<DropdownMenuSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

type DropdownMenuItemProps = React.ComponentProps<typeof BaseMenu.Item>

function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.Item
      data-slot="dropdown-menu-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type DropdownMenuLinkItemProps = React.ComponentProps<typeof BaseMenu.LinkItem>

function DropdownMenuLinkItem({ className, ...props }: DropdownMenuLinkItemProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.LinkItem
      data-slot="dropdown-menu-link-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type DropdownMenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <BaseMenu.Group data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuGroupLabelProps = React.ComponentProps<typeof BaseMenu.GroupLabel>

const GROUP_LABEL_SIZE: Record<DropdownMenuSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

function DropdownMenuGroupLabel({ className, ...props }: DropdownMenuGroupLabelProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.GroupLabel
      data-slot="dropdown-menu-group-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type DropdownMenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

type DropdownMenuRadioGroupProps = React.ComponentProps<typeof BaseMenu.RadioGroup>

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <BaseMenu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

type DropdownMenuRadioItemProps = React.ComponentProps<typeof BaseMenu.RadioItem>

function DropdownMenuRadioItem({ className, children, ...props }: DropdownMenuRadioItemProps) {
  const { size, reducedMotion } = useDropdownMenuContext()
  return (
    <BaseMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseMenu.RadioItemIndicator
        data-slot="dropdown-menu-radio-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  )
}

type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof BaseMenu.CheckboxItem>

function DropdownMenuCheckboxItem({ className, children, ...props }: DropdownMenuCheckboxItemProps) {
  const { size, reducedMotion } = useDropdownMenuContext()
  return (
    <BaseMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseMenu.CheckboxItemIndicator
        data-slot="dropdown-menu-checkbox-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseMenu.CheckboxItemIndicator>
    </BaseMenu.CheckboxItem>
  )
}

type DropdownMenuSubProps = React.ComponentProps<typeof BaseMenu.SubmenuRoot>

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <BaseMenu.SubmenuRoot {...props} />
}

type DropdownMenuSubTriggerProps = React.ComponentProps<typeof BaseMenu.SubmenuTrigger>

function DropdownMenuSubTrigger({ className, children, ...props }: DropdownMenuSubTriggerProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.SubmenuTrigger className="group/submenu-trigger outline-hidden" {...props}>
      <span
        data-slot="dropdown-menu-sub-trigger"
        className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      >
        <span className={cn('flex flex-1 items-center', ITEM_TEXT[size])}>{children}</span>
        <ChevronEndIcon data-icon="end" className={cn(ICON_SIZE[size], 'shrink-0 rtl:rotate-180')} />
      </span>
    </BaseMenu.SubmenuTrigger>
  )
}

type DropdownMenuSubContentProps = Omit<React.ComponentProps<typeof BaseMenu.Popup>, 'className'> &
  DropdownMenuFloatingProps & {
    /** Extra classes on the submenu popup. */
    className?: string
  }

function DropdownMenuSubContent({ className, children, ...props }: DropdownMenuSubContentProps) {
  const { size } = useDropdownMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseMenu.Portal {...portal}>
      <BaseMenu.Positioner
        side="inline-end"
        align="start"
        sideOffset={12}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseMenu.Popup data-slot="dropdown-menu-sub-content" className={popupClassName(size, className)} {...popup}>
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('stroke-2', className)}
      {...props}
    >
      <path
        d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
        pathLength={1}
        strokeDasharray="1 2"
        className={cn(
          'opacity-0 [stroke-dashoffset:1.02]',
          'group-data-checked/check:opacity-100 group-data-checked/check:[stroke-dashoffset:0]',
          'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          'motion-safe:delay-[0ms,150ms] motion-safe:duration-[150ms,0ms]',
          'motion-safe:group-data-checked/check:delay-[0ms] motion-safe:group-data-checked/check:duration-[0ms,300ms]',
        )}
      />
    </svg>
  )
}

function ChevronEndIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.558 3.558c.244-.244.641-.244.885 0l4 4c.244.244.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0s-.244-.641 0-.885L9.115 8 5.558 4.442c-.244-.244-.244-.641 0-.885z" />
    </svg>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuGroupLabelProps,
  DropdownMenuItemProps,
  DropdownMenuLinkItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">dropdown menu</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-field`,
    name: `Field (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── field/field.tsx ───
import * as React from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cn } from '../../internal/utils'

type FieldProps = React.ComponentProps<typeof BaseField.Root>

function Field({ className, ...props }: FieldProps) {
  return <BaseField.Root data-slot="field" className={cn(className)} {...props} />
}

type FieldLabelProps = React.ComponentProps<typeof BaseField.Label>

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn(
        'text-foreground-intense mb-1.5 flex w-fit items-center text-sm font-medium select-none',
        'data-disabled:opacity-disabled',
        className,
      )}
      {...props}
    />
  )
}

type FieldDescriptionProps = React.ComponentProps<typeof BaseField.Description>

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn('text-foreground-muted data-disabled:opacity-disabled mt-1.5 text-sm', className)}
      {...props}
    />
  )
}

type FieldErrorProps = React.ComponentProps<typeof BaseField.Error>

function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <div
      className={cn(
        'grid grid-rows-[0fr]',
        'has-[[data-slot=field-error]:not([data-starting-style]):not([data-ending-style])]:grid-rows-[1fr]',
        'motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out',
      )}
    >
      <BaseField.Error
        data-slot="field-error"
        className={cn(
          'min-h-0 overflow-hidden',
          'text-error-emphasis flex gap-1 pt-1 text-xs',
          "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
          'motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out',
          'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
          className,
        )}
        {...props}
      />
    </div>
  )
}

type FieldValidityProps = React.ComponentProps<typeof BaseField.Validity>

const FieldValidity: React.FC<FieldValidityProps> = BaseField.Validity

export { Field, FieldLabel, FieldDescription, FieldError, FieldValidity }
export type { FieldProps, FieldLabelProps, FieldDescriptionProps, FieldErrorProps, FieldValidityProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">field</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-fieldset`,
    name: `Fieldset (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── fieldset/fieldset.tsx ───
import * as React from 'react'
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'
import { cn } from '../../internal/utils'

type FieldsetProps = React.ComponentProps<typeof BaseFieldset.Root>

function Fieldset({ className, ...props }: FieldsetProps) {
  return <BaseFieldset.Root data-slot="fieldset" className={cn('flex w-full flex-col gap-4', className)} {...props} />
}

type FieldsetLegendProps = React.ComponentProps<typeof BaseFieldset.Legend>

function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return (
    <BaseFieldset.Legend
      data-slot="fieldset-legend"
      className={cn('text-foreground-intense text-lg font-medium', className)}
      {...props}
    />
  )
}

export { Fieldset, FieldsetLegend }
export type { FieldsetProps, FieldsetLegendProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">fieldset</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-form`,
    name: `Form (Appica)`,
    category: `Components`,
    tags: [`form`, `appica`],
    code: `// ─── form/form.tsx ───
import * as React from 'react'
import { Form as BaseForm } from '@base-ui/react/form'

type FormProps = React.ComponentProps<typeof BaseForm>

function Form(props: FormProps) {
  return <BaseForm data-slot="form" {...props} />
}

export { Form }
export type { FormProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">form</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-gradient-glow`,
    name: `Gradient Glow (Appica)`,
    category: `Components`,
    tags: [`gradient-glow`, `appica`],
    code: `// ─── gradient-glow/gradient-glow.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'

type GradientGlowBlur = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type GradientGlowTrigger = 'hover' | 'press'

interface GradientGlowProps extends React.ComponentProps<'div'> {
  /**
   * First gradient stop.
   * @default '#8EC5FF'
   */
  from?: string
  /**
   * Middle gradient stop.
   * @default '#EFADF7'
   */
  via?: string
  /**
   * Last gradient stop.
   * @default '#FFD69B'
   */
  to?: string
  /**
   * Resting gradient direction in degrees; the animation rotates a full turn around it.
   * @default 95
   */
  angle?: number
  /**
   * Softness of the glow, mapped to a Tailwind \`blur-*\` utility.
   * @default 'lg'
   */
  blur?: GradientGlowBlur
  /**
   * Add a 1px stroke that follows the same animated gradient.
   * @default false
   */
  border?: boolean
  /**
   * Stroke thickness in px when \`border\` is on.
   * @default 1
   */
  borderWidth?: number
  /**
   * Seconds for one full rotation (and one breath) of the gradient.
   * @default 4
   */
  speed?: number
  /**
   * Reveal only on interaction. \`'hover'\` is pointer-only; \`'press'\` works on touch. Combine via an array. Omit for
   * always-on.
   */
  revealOn?: GradientGlowTrigger | GradientGlowTrigger[]
  /** Controlled visibility for programmatic states (loading, etc.); OR-ed with \`revealOn\`. */
  reveal?: boolean
  /**
   * With \`revealOn="hover"\`, keep the glow visible on touch devices (which have no hover) instead of hidden.
   * @default false
   */
  showOnTouch?: boolean
  /**
   * Scale the glow down while pressed, to track a child \`Button\`'s own active-press scale.
   * @default false
   */
  pressScale?: boolean
}

const BLUR_CLASS: Record<GradientGlowBlur, string> = {
  sm: 'blur-sm',
  md: 'blur-md',
  lg: 'blur-lg',
  xl: 'blur-xl',
  '2xl': 'blur-2xl',
  '3xl': 'blur-3xl',
}

const BORDER_MASK = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'

function GradientGlow({
  from = '#8EC5FF',
  via = '#EFADF7',
  to = '#FFD69B',
  angle = 95,
  blur = 'lg',
  border = false,
  borderWidth = 1,
  speed = 4,
  revealOn,
  reveal,
  showOnTouch = false,
  pressScale = false,
  className,
  style,
  children,
  ...props
}: GradientGlowProps) {
  const gradient = \`linear-gradient(calc(\${angle}deg + var(--gradient-glow-rotation, 0deg)), \${from} 3.64%, \${via} 53.35%, \${to} 95.37%)\`

  const triggers = revealOn == null ? [] : Array.isArray(revealOn) ? revealOn : [revealOn]
  const managed = triggers.length > 0 || reveal !== undefined
  const grouped = managed || pressScale
  const transition =
    managed && pressScale
      ? '[transition:opacity_500ms_ease-out,scale_150ms_ease-out,translate_150ms_ease-out]'
      : managed
        ? 'transition-opacity duration-500 ease-out'
        : pressScale
          ? '[transition:scale_150ms_ease-out,translate_150ms_ease-out]'
          : undefined

  const layerClasses = grouped
    ? cn(
        transition,
        managed && 'opacity-0 [animation-play-state:paused]',
        managed &&
          triggers.includes('hover') &&
          'group-hover/glow:opacity-(--gradient-glow-opacity) group-hover/glow:[animation-play-state:running]',
        managed &&
          triggers.includes('hover') &&
          showOnTouch &&
          'hover-none:opacity-(--gradient-glow-opacity) hover-none:[animation-play-state:running]',
        managed &&
          triggers.includes('press') &&
          'group-active/glow:opacity-(--gradient-glow-opacity) group-active/glow:[animation-play-state:running]',
        managed && reveal && 'opacity-(--gradient-glow-opacity) [animation-play-state:running]',
        pressScale && 'group-active/glow:scale-[0.97] group-active/glow:translate-y-px',
      )
    : undefined

  return (
    <div
      data-slot="gradient-glow"
      data-reveal={managed ? triggers.join(' ') : undefined}
      data-revealed={reveal ? '' : undefined}
      data-show-on-touch={showOnTouch ? '' : undefined}
      className={cn(
        'relative isolate rounded-2xl [--gradient-glow-opacity:1] dark:[--gradient-glow-opacity:0.6]',
        grouped && 'group/glow',
        className,
      )}
      style={{ '--gradient-glow-duration': \`\${speed}s\`, ...style } as React.CSSProperties}
      {...props}
    >
      <span
        aria-hidden
        data-slot="gradient-glow-aura"
        className={cn(
          'motion-safe:animate-gradient-glow-aura pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-(--gradient-glow-opacity)',
          BLUR_CLASS[blur],
          layerClasses,
        )}
        style={{ background: gradient }}
      />
      {children}
      {border ? (
        <span
          aria-hidden
          data-slot="gradient-glow-border"
          className={cn(
            'motion-safe:animate-gradient-glow pointer-events-none absolute inset-0 rounded-[inherit] opacity-(--gradient-glow-opacity)',
            layerClasses,
          )}
          style={{
            background: gradient,
            padding: borderWidth,
            WebkitMask: BORDER_MASK,
            WebkitMaskComposite: 'xor',
            mask: BORDER_MASK,
            maskComposite: 'exclude',
          }}
        />
      ) : null}
    </div>
  )
}

export { GradientGlow }
export type { GradientGlowProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">gradient glow</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-input`,
    name: `Input (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── input/index.ts ───
export * from './input'
export * from './input-variants'


// ─── input/input-variants.ts ───
import { cva } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const inputVariants = cva(
  'w-full border text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        outline:
          'bg-background border-border-strong hover:not-focus:not-focus-visible:not-has-focus:not-has-focus-visible:not-data-popup-open:not-has-data-popup-open:not-data-pressed:not-has-data-pressed:not-data-invalid:not-has-data-invalid:border-border-emphasis',
        soft: 'bg-background-muted border-transparent hover:not-focus:not-focus-visible:not-has-focus:not-has-focus-visible:not-data-popup-open:not-has-data-popup-open:not-data-pressed:not-has-data-pressed:not-data-invalid:not-has-data-invalid:border-border-strong',
      },
      size: {
        sm: "h-8 px-3 text-xs pointer-coarse:text-base rounded-sm gap-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        md: "h-10 px-3.5 text-sm pointer-coarse:text-base rounded-md gap-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
        lg: "h-12 px-4 text-base rounded-lg gap-2 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
      },
      state: {
        self: cn(
          'focus-visible:ring-3 focus-visible:ring-ring-input focus-visible:border-transparent focus-visible:bg-background',
          'data-popup-open:ring-3 data-popup-open:ring-ring-input data-popup-open:border-transparent data-popup-open:bg-background',
          'data-pressed:ring-3 data-pressed:ring-ring-input data-pressed:border-transparent data-pressed:bg-background',
          'data-invalid:bg-error-subtle data-invalid:border-error',
          'data-invalid:focus-visible:border-transparent data-invalid:focus-visible:ring-ring-error data-invalid:focus-visible:bg-background',
          'data-invalid:data-popup-open:border-transparent data-invalid:data-popup-open:ring-ring-error data-invalid:data-popup-open:bg-background',
          'data-invalid:data-pressed:border-transparent data-invalid:data-pressed:ring-ring-error data-invalid:data-pressed:bg-background',
          'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:cursor-not-allowed data-disabled:border-dashed data-disabled:opacity-disabled',
        ),
        within: cn(
          'flex items-center',
          'has-focus:ring-[3px] has-focus:ring-ring-input has-focus:border-transparent has-focus:bg-background',
          'has-data-popup-open:ring-3 has-data-popup-open:ring-ring-input has-data-popup-open:border-transparent has-data-popup-open:bg-background',
          'has-data-pressed:ring-3 has-data-pressed:ring-ring-input has-data-pressed:border-transparent has-data-pressed:bg-background',
          'data-invalid:bg-error-subtle data-invalid:border-error data-invalid:has-focus:border-transparent data-invalid:has-focus:ring-ring-error data-invalid:has-focus:bg-background',
          'data-invalid:has-data-popup-open:border-transparent data-invalid:has-data-popup-open:ring-ring-error data-invalid:has-data-popup-open:bg-background',
          'data-invalid:has-data-pressed:border-transparent data-invalid:has-data-pressed:ring-ring-error data-invalid:has-data-pressed:bg-background',
          'has-data-invalid:bg-error-subtle has-data-invalid:border-error has-data-invalid:has-focus:border-transparent has-data-invalid:has-focus:ring-ring-error has-data-invalid:has-focus:bg-background',
          'has-data-invalid:has-data-popup-open:border-transparent has-data-invalid:has-data-popup-open:ring-ring-error has-data-invalid:has-data-popup-open:bg-background',
          'has-data-invalid:has-data-pressed:border-transparent has-data-invalid:has-data-pressed:ring-ring-error has-data-invalid:has-data-pressed:bg-background',
          'has-[input:disabled]:border-border-strong! has-[input:disabled]:bg-background-subtle! has-[input:disabled]:cursor-not-allowed has-[input:disabled]:border-dashed has-[input:disabled]:opacity-disabled',
        ),
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      state: 'self',
    },
  },
)

export { inputVariants }


// ─── input/input.tsx ───
'use client'

import * as React from 'react'
import { Input as BaseInput } from '@base-ui/react/input'
import { type VariantProps } from 'class-variance-authority'
import { cn, useComposedRefs } from '../../internal/utils'
import { inputVariants } from './input-variants'

type InputVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>

interface InputProps extends Omit<React.ComponentProps<typeof BaseInput>, 'size'> {
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: InputVariant
  /**
   * Scales height, padding, and text. Named \`inputSize\` to avoid the native \`size\` attribute.
   * @default 'md'
   */
  inputSize?: InputSize
  /**
   * Show a clear (✕) button once the field has a value.
   * @default false
   */
  clearable?: boolean
  /** Adornment rendered before the field, inside the frame. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, inside the frame. */
  endSlot?: React.ReactNode
  /** Called when the clear button is pressed. */
  onClear?: () => void
  /**
   * Props for the inner \`<input>\` (its own \`className\`, handlers, the native \`size\`
   * attribute, …). \`size\` here is the character count the control is intrinsically wide,
   * not the scale - that is \`inputSize\`.
   */
  inputProps?: React.ComponentProps<typeof BaseInput>
}

function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function Input({
  className,
  variant = 'outline',
  inputSize = 'md',
  clearable,
  startSlot,
  endSlot,
  onClear,
  inputProps,
  ref,
  ...props
}: InputProps) {
  const innerRef = React.useRef<HTMLInputElement>(null)
  const hasWrapper = Boolean(clearable || startSlot || endSlot)

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const composedRef = useComposedRefs(ref, innerRef)

  const handleClear = () => {
    if (innerRef.current && props.value === undefined) {
      setNativeValue(innerRef.current, '')
    }
    innerRef.current?.focus()
    onClear?.()
  }

  if (!hasWrapper) {
    return (
      <BaseInput
        data-slot="input"
        ref={composedRef}
        {...inputProps}
        className={cn(
          inputVariants({ variant, size: inputSize, state: 'self' }),
          'placeholder:text-foreground-subtle',
          inputProps?.className,
          className,
        )}
        {...props}
        {...(invalid ? { 'data-invalid': '' } : {})}
      />
    )
  }

  return (
    <div
      data-slot="input-wrapper"
      className={cn(inputVariants({ variant, size: inputSize, state: 'within' }), className)}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      {startSlot && (
        <div data-slot="input-start" className="-ms-1 flex shrink-0 items-center">
          {startSlot}
        </div>
      )}
      <BaseInput
        data-slot="input"
        ref={composedRef}
        placeholder={props.placeholder ?? ' '}
        {...inputProps}
        className={cn(
          'peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed',
          inputProps?.className,
        )}
        {...props}
      />
      {clearable && (
        <button
          data-slot="input-clear"
          type="button"
          onClick={handleClear}
          className="text-foreground-subtle hover:text-foreground pointer-events-none shrink-0 cursor-pointer opacity-0 transition-[opacity,color] duration-200 peer-not-placeholder-shown:pointer-events-auto peer-not-placeholder-shown:opacity-100"
          tabIndex={-1}
          aria-label="Clear input"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" className="size-[1em]">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
      {endSlot && (
        <div data-slot="input-end" className="-me-1 flex shrink-0 items-center">
          {endSlot}
        </div>
      )}
    </div>
  )
}

export { Input }
export type { InputProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">input</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-kbd`,
    name: `Kbd (Appica)`,
    category: `Components`,
    tags: [`kbd`, `appica`],
    code: `// ─── kbd/kbd.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'

type KbdSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<KbdSize, string> = {
  sm: 'h-5 min-w-5 text-xs px-1.25 rounded-2xs',
  md: 'h-6 min-w-6 text-sm px-1.5 rounded-[calc(var(--radius-xs)-0.0625rem)]',
  lg: 'h-7 min-w-7 text-base px-1.75 rounded-xs',
}

interface KbdProps extends React.ComponentProps<'kbd'> {
  /**
   * Height, padding, and text scale. Inherited from a \`KbdGroup\`.
   * @default 'md'
   */
  size?: KbdSize
}

function Kbd({ className, size = 'md', ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'border-border bg-background text-foreground-muted pointer-events-none inline-flex w-fit shrink-0 items-center justify-center border font-sans font-medium whitespace-nowrap select-none',
        'in-data-[slot=tooltip-content]:bg-background-inverse in-data-[slot=tooltip-content]:text-foreground-inverse/75 dark:in-data-[slot=tooltip-content]:border-border-intense/20 in-data-[slot=tooltip-content]:border-white/25',
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  )
}

interface KbdGroupProps extends React.ComponentProps<'span'> {
  /**
   * Default size applied to each child \`Kbd\` that doesn't set its own.
   * @default 'md'
   */
  size?: KbdSize
}

function KbdGroup({ className, size = 'md', children, ...props }: KbdGroupProps) {
  return (
    <span data-slot="kbd-group" className={cn('inline-flex items-center gap-0.5 align-middle', className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<KbdProps>(child) || child.type !== Kbd) return child
        if (child.props.size !== undefined) return child
        return React.cloneElement(child, { size })
      })}
    </span>
  )
}

export { Kbd, KbdGroup }
export type { KbdProps, KbdGroupProps, KbdSize }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">kbd</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-loader`,
    name: `Loader (Appica)`,
    category: `Loading UI`,
    tags: [`loader`, `appica`],
    code: `// ─── loader/loader.tsx ───
'use client'

import * as React from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'

type LoaderVariant = 'bar' | 'dots'

interface LoaderProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /**
   * The animated shape.
   * @default 'bar'
   */
  variant?: LoaderVariant
  /**
   * Inherit the surrounding text color (\`currentColor\`) instead of the primary accent.
   * @default false
   */
  currentColor?: boolean
}

type VariantColors = { indicator: string; track: string }
type VariantInnerProps = { colors: VariantColors; reduced: boolean }

const LOADER_SIZE = 'text-[2.5rem]'

const PRIMARY_COLORS: VariantColors = { indicator: 'text-primary', track: 'text-primary-soft' }
const CURRENT_COLORS: VariantColors = { indicator: 'text-current', track: 'text-current/20' }

const FLOW_CYCLE = 2.4
const FLOW_CENTER = 14
const FLOW_CX_KEYFRAMES: number[] = [FLOW_CENTER + 14, FLOW_CENTER, FLOW_CENTER - 14]
const FLOW_TIMES: number[] = [0.01, 0.5, 1]
const FLOW_CY = 6
const DOT_R_KEYFRAMES: number[] = [0, 6, 0]

function Dots({ colors, reduced }: VariantInnerProps) {
  return (
    <svg
      width="0.8em"
      height="0.35em"
      viewBox="0 0 28 12"
      fill="currentColor"
      aria-hidden="true"
      className={cn('size-[1em] h-[0.35em]! w-[0.8em]!', colors.indicator)}
    >
      {Array.from({ length: 3 }, (_, i) =>
        reduced ? (
          <circle key={i} cx={4 + i * 10} cy={FLOW_CY} r={4} />
        ) : (
          <m.circle
            key={i}
            cy={FLOW_CY}
            initial={{ cx: FLOW_CX_KEYFRAMES[0], r: 0 }}
            animate={{ cx: FLOW_CX_KEYFRAMES, r: DOT_R_KEYFRAMES }}
            transition={{
              duration: FLOW_CYCLE,
              repeat: Infinity,
              ease: 'linear',
              times: FLOW_TIMES,
              delay: -(0.85 + i) * 1.6,
            }}
          />
        ),
      )}
    </svg>
  )
}

function Bar({ colors, reduced }: VariantInnerProps) {
  const clipId = React.useId()
  return (
    <svg
      width="1.4em"
      height="0.2em"
      viewBox="0 0 44 6"
      fill="currentColor"
      aria-hidden="true"
      className={cn('size-[1em] h-[0.2em]! w-[1.4em]!', colors.indicator)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={44} height={6} rx={3} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={44} height={6} rx={3} className={colors.track} />
      <g clipPath={\`url(#\${clipId})\`}>
        {reduced ? (
          <rect x={12} y={0} width={20} height={6} rx={3} />
        ) : (
          <>
            <m.rect
              y={0}
              height={6}
              rx={3}
              initial={{ x: -15.4, width: 15.4 }}
              animate={{
                x: [-15.4, 44, 44],
                width: [15.4, 39.6, 39.6],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                times: [0, 0.6, 1],
                ease: [0.65, 0.815, 0.735, 0.395],
              }}
            />
            <m.rect
              y={0}
              height={6}
              rx={3}
              initial={{ x: -88, width: 88 }}
              animate={{
                x: [-88, 47.08, 47.08],
                width: [88, 0.44, 0.44],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                times: [0, 0.6, 1],
                ease: [0.165, 0.84, 0.44, 1],
                delay: 1.15,
              }}
            />
          </>
        )}
      </g>
    </svg>
  )
}

const VARIANT_COMPONENTS: Record<LoaderVariant, React.ComponentType<VariantInnerProps>> = {
  bar: Bar,
  dots: Dots,
}

function Loader({
  variant = 'bar',
  currentColor = false,
  'aria-label': ariaLabel = 'Loading',
  className,
  ...props
}: LoaderProps) {
  const reduced = useReducedMotion()
  const colors = currentColor ? CURRENT_COLORS : PRIMARY_COLORS
  const Variant = VARIANT_COMPONENTS[variant]

  const inner = <Variant colors={colors} reduced={reduced} />

  return (
    <span
      data-slot="loader"
      role="status"
      aria-label={ariaLabel}
      className={cn('inline-flex shrink-0 items-center justify-center align-middle', LOADER_SIZE, className)}
      {...props}
    >
      {reduced ? (
        inner
      ) : (
        <LazyMotion features={domAnimation} strict>
          {inner}
        </LazyMotion>
      )}
    </span>
  )
}

export { Loader }
export type { LoaderProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">loader</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-menubar`,
    name: `Menubar (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── menubar/menubar.tsx ───
'use client'

import * as React from 'react'
import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import { cn } from '../../internal/utils'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'

type MenubarVariant = 'pill' | 'line'
type MenubarSize = 'sm' | 'md' | 'lg'
type MenubarOrientation = 'horizontal' | 'vertical'

interface MenubarContextValue {
  variant: MenubarVariant
  size: MenubarSize
  orientation: MenubarOrientation
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null)

function useMenubarContext() {
  const ctx = React.useContext(MenubarContext)
  if (!ctx) {
    throw new Error('Menubar sub-components must be rendered inside <Menubar>')
  }
  return ctx
}

type BaseMenubarRootProps = React.ComponentProps<typeof BaseMenubar>

interface MenubarProps extends BaseMenubarRootProps {
  /**
   * Trigger appearance - hover/active pill, or an animated underline.
   * @default 'pill'
   */
  variant?: MenubarVariant
  /**
   * Scales the triggers, popups, and items together.
   * @default 'md'
   */
  size?: MenubarSize
}

const HORIZONTAL_GAP: Partial<Record<MenubarVariant, string>> = {
  pill: 'gap-0.5',
  line: 'gap-7',
}

const VERTICAL_GAP: Partial<Record<MenubarVariant, string>> = {
  pill: 'gap-0.5',
}

function Menubar({
  className,
  variant = 'pill',
  size = 'md',
  orientation = 'horizontal',
  children,
  ...rest
}: MenubarProps) {
  const ctx = React.useMemo<MenubarContextValue>(() => ({ variant, size, orientation }), [variant, size, orientation])
  const gap = (orientation === 'vertical' ? VERTICAL_GAP : HORIZONTAL_GAP)[variant]
  return (
    <MenubarContext.Provider value={ctx}>
      <BaseMenubar
        data-slot="menubar"
        orientation={orientation}
        className={cn(
          'flex w-fit',
          orientation === 'vertical' ? 'flex-col items-stretch' : 'items-center',
          gap,
          className,
        )}
        {...rest}
      >
        {children}
      </BaseMenubar>
    </MenubarContext.Provider>
  )
}

type DropdownMenuRootProps = React.ComponentProps<typeof DropdownMenu>

interface MenubarMenuProps extends Omit<DropdownMenuRootProps, 'size'> {}

function MenubarMenu(props: MenubarMenuProps) {
  const { size } = useMenubarContext()
  return <DropdownMenu size={size} {...props} />
}

type MenubarTriggerProps = React.ComponentProps<typeof DropdownMenuTrigger>

function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  const { variant, size, orientation } = useMenubarContext()
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      data-orientation={orientation}
      className={cn(navigationLinkVariants({ variant, size }), 'outline-hidden', className)}
      {...props}
    />
  )
}

type MenubarContentProps = React.ComponentProps<typeof DropdownMenuContent>

function MenubarContent({ side, align, ...props }: MenubarContentProps) {
  const ctx = useMenubarContext()
  const vertical = ctx.orientation === 'vertical'
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      side={side ?? (vertical ? 'inline-end' : undefined)}
      align={align ?? (vertical ? 'start' : undefined)}
      {...props}
    />
  )
}

type MenubarItemProps = React.ComponentProps<typeof DropdownMenuItem>

function MenubarItem(props: MenubarItemProps) {
  return <DropdownMenuItem data-slot="menubar-item" {...props} />
}

type MenubarLinkItemProps = React.ComponentProps<typeof DropdownMenuLinkItem>

function MenubarLinkItem(props: MenubarLinkItemProps) {
  return <DropdownMenuLinkItem data-slot="menubar-link-item" {...props} />
}

type MenubarGroupProps = React.ComponentProps<typeof DropdownMenuGroup>

function MenubarGroup(props: MenubarGroupProps) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}

type MenubarGroupLabelProps = React.ComponentProps<typeof DropdownMenuGroupLabel>

function MenubarGroupLabel(props: MenubarGroupLabelProps) {
  return <DropdownMenuGroupLabel data-slot="menubar-group-label" {...props} />
}

type MenubarRadioGroupProps = React.ComponentProps<typeof DropdownMenuRadioGroup>

function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

type MenubarRadioItemProps = React.ComponentProps<typeof DropdownMenuRadioItem>

function MenubarRadioItem(props: MenubarRadioItemProps) {
  return <DropdownMenuRadioItem data-slot="menubar-radio-item" {...props} />
}

type MenubarCheckboxItemProps = React.ComponentProps<typeof DropdownMenuCheckboxItem>

function MenubarCheckboxItem(props: MenubarCheckboxItemProps) {
  return <DropdownMenuCheckboxItem data-slot="menubar-checkbox-item" {...props} />
}

type MenubarSeparatorProps = React.ComponentProps<typeof DropdownMenuSeparator>

function MenubarSeparator(props: MenubarSeparatorProps) {
  return <DropdownMenuSeparator data-slot="menubar-separator" {...props} />
}

type MenubarSubProps = React.ComponentProps<typeof DropdownMenuSub>

function MenubarSub(props: MenubarSubProps) {
  return <DropdownMenuSub {...props} />
}

type MenubarSubTriggerProps = React.ComponentProps<typeof DropdownMenuSubTrigger>

function MenubarSubTrigger(props: MenubarSubTriggerProps) {
  return <DropdownMenuSubTrigger data-slot="menubar-sub-trigger" {...props} />
}

type MenubarSubContentProps = React.ComponentProps<typeof DropdownMenuSubContent>

function MenubarSubContent(props: MenubarSubContentProps) {
  return <DropdownMenuSubContent data-slot="menubar-sub-content" {...props} />
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLinkItem,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarCheckboxItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
export type {
  MenubarProps,
  MenubarMenuProps,
  MenubarTriggerProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarLinkItemProps,
  MenubarGroupProps,
  MenubarGroupLabelProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarCheckboxItemProps,
  MenubarSeparatorProps,
  MenubarSubProps,
  MenubarSubTriggerProps,
  MenubarSubContentProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">menubar</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-meter`,
    name: `Meter (Appica)`,
    category: `Components`,
    tags: [`meter`, `appica`],
    code: `// ─── meter/meter.tsx ───
'use client'

import * as React from 'react'
import { Meter as BaseMeter } from '@base-ui/react/meter'
import { cn } from '../../internal/utils'

type MeterStatus = 'optimum' | 'suboptimum' | 'invalid'

interface MeterStatusClassNames {
  optimum?: string
  suboptimum?: string
  invalid?: string
  default?: string
}

const DEFAULT_STATUS_CLASSES: Required<MeterStatusClassNames> = {
  optimum: 'bg-success-emphasis',
  suboptimum: 'bg-warning-emphasis',
  invalid: 'bg-error-emphasis',
  default: 'bg-primary',
}

const MeterContext = React.createContext<{ indicatorBg: string } | null>(null)

function useMeterContext() {
  const ctx = React.useContext(MeterContext)
  if (!ctx) {
    throw new Error('Meter sub-components must be rendered inside <Meter>')
  }
  return ctx
}

interface MeterProps extends BaseMeter.Root.Props {
  /** Upper edge of the "low" zone. Enables status coloring. */
  low?: number
  /** Lower edge of the "high" zone. Enables status coloring. */
  high?: number
  /** The ideal value; the zone it lands in becomes the green "optimum" zone. Enables status coloring. */
  optimum?: number
  /** Override the indicator background class per status (and the no-threshold \`default\`). */
  statusClassNames?: MeterStatusClassNames
}

function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  statusClassNames,
  className,
  children,
  ...props
}: MeterProps) {
  const hasThresholds = low !== undefined || high !== undefined || optimum !== undefined
  const status = hasThresholds ? computeStatus(value, min, max, low, high, optimum) : null

  const resolvedClasses = { ...DEFAULT_STATUS_CLASSES, ...statusClassNames }
  const indicatorBg = status === null ? resolvedClasses.default : resolvedClasses[status]
  const ctxValue = React.useMemo(() => ({ indicatorBg }), [indicatorBg])

  return (
    <MeterContext.Provider value={ctxValue}>
      <BaseMeter.Root
        data-slot="meter"
        data-status={status ?? undefined}
        value={value}
        min={min}
        max={max}
        className={cn(
          'grid w-full grid-cols-[1fr_auto] gap-x-2 gap-y-1.5',
          '**:data-[slot=meter-label]:col-start-1 **:data-[slot=meter-label]:row-start-1',
          '**:data-[slot=meter-value]:col-start-2 **:data-[slot=meter-value]:row-start-1 **:data-[slot=meter-value]:justify-self-end',
          '**:data-[slot=meter-progress]:col-span-2',
          className,
        )}
        {...props}
      >
        {children}
      </BaseMeter.Root>
    </MeterContext.Provider>
  )
}

type MeterLabelProps = BaseMeter.Label.Props

function MeterLabel({ className, ...props }: MeterLabelProps) {
  return (
    <BaseMeter.Label
      data-slot="meter-label"
      className={cn('text-foreground-intense text-sm font-medium', className)}
      {...props}
    />
  )
}

type MeterValueProps = BaseMeter.Value.Props

function MeterValue({ className, ...props }: MeterValueProps) {
  return <BaseMeter.Value data-slot="meter-value" className={cn('text-foreground text-sm', className)} {...props} />
}

type MeterProgressProps = BaseMeter.Track.Props

function MeterProgress({ className, ...props }: MeterProgressProps) {
  const { indicatorBg } = useMeterContext()
  return (
    <BaseMeter.Track
      data-slot="meter-progress"
      className={cn('bg-background-strong relative h-1.5 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <BaseMeter.Indicator
        data-slot="meter-indicator"
        className={cn(
          'rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none',
          indicatorBg,
        )}
      />
    </BaseMeter.Track>
  )
}

function computeStatus(
  value: number,
  min: number,
  max: number,
  low: number | undefined,
  high: number | undefined,
  optimum: number | undefined,
): MeterStatus {
  const resolvedLow = low ?? min
  const resolvedHigh = high ?? max
  const resolvedOpt = optimum ?? (min + max) / 2

  const zone = (v: number): 0 | 1 | 2 => (v < resolvedLow ? 0 : v > resolvedHigh ? 2 : 1)

  const optZone = zone(resolvedOpt)
  const valZone = zone(value)

  if (valZone === optZone) return 'optimum'
  if (Math.abs(valZone - optZone) === 1) return 'suboptimum'
  return 'invalid'
}

export { Meter, MeterLabel, MeterValue, MeterProgress }
export type { MeterProps, MeterLabelProps, MeterValueProps, MeterProgressProps, MeterStatusClassNames }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">meter</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-navigation-menu`,
    name: `Navigation Menu (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── navigation-menu/navigation-menu.tsx ───
'use client'

import * as React from 'react'
import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { useDirection } from '../../hooks/use-direction'
import { cn } from '../../internal/utils'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'

type NavigationMenuVariant = 'pill' | 'line'
type NavigationMenuSize = 'sm' | 'md' | 'lg'
type NavigationMenuIconKind = 'chevron' | 'caret' | 'plus' | false
type NavigationMenuOrientation = 'horizontal' | 'vertical'

interface NavigationMenuContextValue {
  variant: NavigationMenuVariant
  size: NavigationMenuSize
  icon: NavigationMenuIconKind
  orientation: NavigationMenuOrientation
  backdrop: boolean
  morph: boolean
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | null>(null)

function useNavigationMenuContext() {
  const ctx = React.useContext(NavigationMenuContext)
  if (!ctx) {
    throw new Error('NavigationMenu sub-components must be rendered inside <NavigationMenu>')
  }
  return ctx
}

const NavigationMenuContentContext = React.createContext(false)

type BaseRootProps = React.ComponentProps<typeof BaseNavigationMenu.Root>

interface NavigationMenuProps extends BaseRootProps {
  /**
   * Trigger appearance - hover/active pill, or an animated underline.
   * @default 'pill'
   */
  variant?: NavigationMenuVariant
  /**
   * Scales triggers, popup radius, and link padding.
   * @default 'md'
   */
  size?: NavigationMenuSize
  /**
   * The open/close indicator shown by each \`NavigationMenuIcon\`.
   * @default 'chevron'
   */
  icon?: NavigationMenuIconKind
  /**
   * Render a dimmed, blurred backdrop behind the open panel.
   * @default false
   */
  backdrop?: boolean
  /**
   * Auto-render the portalled positioner + popup. Set \`false\` to render your own.
   * @default true
   */
  viewport?: boolean
  /**
   * Animate the popup's size and position between items.
   * @default true
   */
  morph?: boolean
  /**
   * Gap between the trigger and the auto-rendered popup.
   * @default 6
   */
  sideOffset?: number
}

function NavigationMenu({
  className,
  variant = 'pill',
  size = 'md',
  icon = 'chevron',
  orientation = 'horizontal',
  backdrop = false,
  viewport = true,
  morph = true,
  sideOffset,
  children,
  ...rest
}: NavigationMenuProps) {
  const nested = React.useContext(NavigationMenuContentContext)
  const resolvedSideOffset = sideOffset ?? (nested ? 12 : 6)
  const ctx = React.useMemo<NavigationMenuContextValue>(
    () => ({ variant, size, icon, orientation, backdrop, morph }),
    [variant, size, icon, orientation, backdrop, morph],
  )
  return (
    <NavigationMenuContext.Provider value={ctx}>
      <BaseNavigationMenu.Root
        data-slot="navigation-menu"
        data-orientation={orientation}
        orientation={orientation}
        className={cn(className)}
        {...rest}
      >
        {children}
        {viewport && <NavigationMenuPositioner sideOffset={resolvedSideOffset} />}
      </BaseNavigationMenu.Root>
    </NavigationMenuContext.Provider>
  )
}

type NavigationMenuListProps = React.ComponentProps<typeof BaseNavigationMenu.List>

const HORIZONTAL_GAP: Partial<Record<NavigationMenuVariant, string>> = {
  pill: 'gap-0.5',
  line: 'gap-7',
}

const VERTICAL_GAP: Partial<Record<NavigationMenuVariant, string>> = {
  pill: 'gap-0.5',
}

function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  const { orientation, variant } = useNavigationMenuContext()
  const vertical = orientation === 'vertical'
  const gap = (vertical ? VERTICAL_GAP : HORIZONTAL_GAP)[variant]
  return (
    <BaseNavigationMenu.List
      data-slot="navigation-menu-list"
      className={cn('flex', vertical ? 'w-full flex-col' : 'w-fit items-center', gap, className)}
      {...props}
    />
  )
}

type NavigationMenuItemProps = React.ComponentProps<typeof BaseNavigationMenu.Item>

function NavigationMenuItem(props: NavigationMenuItemProps) {
  return <BaseNavigationMenu.Item data-slot="navigation-menu-item" {...props} />
}

type NavigationMenuTriggerProps = React.ComponentProps<typeof BaseNavigationMenu.Trigger>

function NavigationMenuTrigger({ className, ...props }: NavigationMenuTriggerProps) {
  const { variant, size, orientation, backdrop } = useNavigationMenuContext()
  const inContent = React.useContext(NavigationMenuContentContext)
  const vertical = inContent || orientation === 'vertical'
  return (
    <BaseNavigationMenu.Trigger
      data-slot="navigation-menu-trigger"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn(
        navigationLinkVariants({ variant: inContent ? 'pill' : variant, size }),
        vertical && 'w-full',
        'outline-hidden',
        backdrop && 'z-50',
        className,
      )}
      {...props}
    />
  )
}

const ICON_SIZE: Record<NavigationMenuSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-4.5',
}

type NavigationMenuIconProps = Omit<React.ComponentProps<typeof BaseNavigationMenu.Icon>, 'children'> & {
  /**
   * Override the indicator for this trigger.
   * @default root
   */
  icon?: NavigationMenuIconKind
}

function NavigationMenuIcon({ icon, className, ...props }: NavigationMenuIconProps) {
  const ctx = useNavigationMenuContext()
  const resolved = icon === undefined ? ctx.icon : icon
  if (resolved === false) {
    return null
  }
  const sizeClass = ICON_SIZE[ctx.size]
  const vertical = ctx.orientation === 'vertical'
  return (
    <BaseNavigationMenu.Icon
      data-slot="navigation-menu-icon"
      data-icon="end"
      className={cn(
        'group/navigation-menu-icon -ms-0.5 inline-flex shrink-0',
        (resolved === 'chevron' || resolved === 'caret') &&
          (vertical
            ? '-rotate-90 rtl:rotate-90'
            : 'transition-transform duration-300 ease-out data-popup-open:rotate-180 motion-reduce:transition-none'),
        className,
      )}
      {...props}
    >
      {resolved === 'chevron' && <ChevronIconSvg className={sizeClass} />}
      {resolved === 'caret' && <CaretIconSvg className={sizeClass} />}
      {resolved === 'plus' && <PlusIconSvg className={sizeClass} />}
    </BaseNavigationMenu.Icon>
  )
}

const CONTENT_PADDING: Record<NavigationMenuSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

type NavigationMenuContentProps = React.ComponentProps<typeof BaseNavigationMenu.Content>

function NavigationMenuContent({ className, children, ...props }: NavigationMenuContentProps) {
  const { morph, size } = useNavigationMenuContext()
  return (
    <BaseNavigationMenu.Content
      data-slot="navigation-menu-content"
      className={cn(
        CONTENT_PADDING[size],
        morph && [
          'motion-safe:transition-[opacity,translate] motion-safe:duration-350 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
          'data-starting-style:motion-safe:opacity-0',
          'data-ending-style:motion-safe:opacity-0',
          'data-[activation-direction=left]:data-starting-style:motion-safe:-translate-x-4',
          'data-[activation-direction=right]:data-starting-style:motion-safe:translate-x-4',
          'data-[activation-direction=up]:data-starting-style:motion-safe:-translate-y-4',
          'data-[activation-direction=down]:data-starting-style:motion-safe:translate-y-4',
          'data-[activation-direction=left]:data-ending-style:motion-safe:translate-x-4',
          'data-[activation-direction=right]:data-ending-style:motion-safe:-translate-x-4',
          'data-[activation-direction=up]:data-ending-style:motion-safe:translate-y-4',
          'data-[activation-direction=down]:data-ending-style:motion-safe:-translate-y-4',
        ],
        className,
      )}
      {...props}
    >
      <NavigationMenuContentContext.Provider value={true}>{children}</NavigationMenuContentContext.Provider>
    </BaseNavigationMenu.Content>
  )
}

type NavigationMenuLinkProps = React.ComponentProps<typeof BaseNavigationMenu.Link>

function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  const { size, orientation, variant } = useNavigationMenuContext()
  const inContent = React.useContext(NavigationMenuContentContext)
  const vertical = inContent || orientation === 'vertical'
  return (
    <BaseNavigationMenu.Link
      data-slot="navigation-menu-link"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn(
        navigationLinkVariants({ variant: inContent ? 'pill' : variant, size }),
        vertical && 'w-full',
        'outline-hidden',
        className,
      )}
      {...props}
    />
  )
}

const POPUP_RADIUS: Record<NavigationMenuSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type PositionerPicks = Pick<
  React.ComponentProps<typeof BaseNavigationMenu.Positioner>,
  'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding' | 'collisionAvoidance'
>
type PortalPicks = Pick<React.ComponentProps<typeof BaseNavigationMenu.Portal>, 'container'>

interface NavigationMenuPositionerProps extends PositionerPicks, PortalPicks {
  /** Extra classes, merged via \`tailwind-merge\`. */
  className?: string
}

function NavigationMenuPositioner({
  className,
  side,
  sideOffset = 6,
  align = 'start',
  alignOffset,
  collisionPadding,
  collisionAvoidance = { side: 'none' },
  container,
}: NavigationMenuPositionerProps) {
  const { size, orientation, backdrop, morph } = useNavigationMenuContext()
  const direction = useDirection()
  const vertical = orientation === 'vertical'
  return (
    <BaseNavigationMenu.Portal container={container}>
      {backdrop && (
        <BaseNavigationMenu.Backdrop
          data-slot="navigation-menu-backdrop"
          className={cn(
            'pointer-events-none fixed inset-0 z-40 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
            'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
          )}
        />
      )}
      <BaseNavigationMenu.Positioner
        data-slot="navigation-menu-positioner"
        dir={direction === 'rtl' ? 'rtl' : undefined}
        side={side ?? (vertical ? 'inline-end' : undefined)}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        className={cn(
          'isolate z-50',
          morph && [
            'h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)',
            'motion-safe:transition-[top,left,right,bottom] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
            'data-instant:motion-safe:transition-none',
          ],
        )}
      >
        <BaseNavigationMenu.Popup
          data-slot="navigation-menu-popup"
          className={cn(
            'bg-background border-border-overlay relative border shadow-2xl outline-none',
            POPUP_RADIUS[size],
            morph && 'h-(--popup-height) w-(--popup-width)',
            'origin-(--transform-origin)',
            morph
              ? 'motion-safe:[transition:opacity_300ms_cubic-bezier(0.175,0.885,0.32,1.5),scale_300ms_cubic-bezier(0.175,0.885,0.32,1.5),width_300ms_cubic-bezier(0.22,1,0.36,1),height_300ms_cubic-bezier(0.22,1,0.36,1)]'
              : 'motion-safe:transition-[opacity,scale] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-150 data-ending-style:motion-safe:ease-out',
            className,
          )}
        >
          <BaseNavigationMenu.Viewport
            data-slot="navigation-menu-viewport"
            className="relative h-full w-full overflow-hidden"
          />
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChevronIconSvg({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <path d="M11.558 5.558c.244-.244.641-.244.885 0s.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0l-4-4c-.244-.244-.244-.641 0-.885s.641-.244.885 0L8 9.115l3.558-3.558z" />
    </svg>
  )
}

function CaretIconSvg({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <path d="M17.141 9.5c.73 0 1.112.863.671 1.42l-.065.074-5.143 5.25a.85.85 0 0 1-.552.255c-.208.013-.414-.051-.579-.182l-.081-.073-5.143-5.25-.071-.082-.046-.067-.046-.084-.015-.031-.023-.059-.027-.095-.009-.046-.009-.053-.003-.05v-.103l.004-.051.008-.053.009-.046.027-.095.023-.059.06-.115.056-.079.063-.071.081-.073.066-.047.082-.047.031-.015.057-.024.093-.028.045-.009.051-.009.049-.004L17.141 9.5z" />
    </svg>
  )
}

function PlusIconSvg({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn(
        'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
        'group-data-popup-open/navigation-menu-icon:rotate-180',
        className,
      )}
      {...props}
    >
      <rect x="3.333" y="7.375" width="9.334" height="1.25" rx="0.625" />
      <rect
        x="7.375"
        y="3.333"
        width="1.25"
        height="9.334"
        rx="0.625"
        className={cn(
          'origin-center transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
          'group-data-popup-open/navigation-menu-icon:rotate-90',
        )}
      />
    </svg>
  )
}

type NavigationMenuViewportProps = React.ComponentProps<typeof BaseNavigationMenu.Viewport>

function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
  return (
    <BaseNavigationMenu.Viewport
      data-slot="navigation-menu-viewport"
      className={cn('relative overflow-hidden', className)}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuIcon,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuPositioner,
  NavigationMenuViewport,
}
export type {
  NavigationMenuProps,
  NavigationMenuListProps,
  NavigationMenuItemProps,
  NavigationMenuTriggerProps,
  NavigationMenuIconProps,
  NavigationMenuContentProps,
  NavigationMenuLinkProps,
  NavigationMenuPositionerProps,
  NavigationMenuViewportProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">navigation menu</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-navigation`,
    name: `Navigation (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── navigation/index.ts ───
export * from './navigation'
export * from './navigation-link'
export * from './navigation-link-variants'


// ─── navigation/navigation-context.ts ───
'use client'

import * as React from 'react'

type NavigationOrientation = 'horizontal' | 'vertical'
type NavigationSize = 'sm' | 'md' | 'lg'
type NavigationVariant = 'pill' | 'line' | 'indicator'
type NavigationActiveLink = string | number | null

interface NavigationContextValue {
  orientation: NavigationOrientation
  variant: NavigationVariant
  size: NavigationSize
  activeLink: NavigationActiveLink
}

const NavigationContext = React.createContext<NavigationContextValue | null>(null)

function useNavigationContext() {
  return React.useContext(NavigationContext)
}

export { NavigationContext, useNavigationContext }
export type { NavigationOrientation, NavigationSize, NavigationVariant, NavigationActiveLink, NavigationContextValue }


// ─── navigation/navigation-link-variants.ts ───
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const base = [
  'relative inline-flex items-center gap-1.5 transform-gpu cursor-pointer font-medium outline-none',
  'transition duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
  'select-none not-data-popup-open:active:scale-[0.97] not-data-popup-open:active:duration-100 not-data-popup-open:active:ease-in-out not-data-popup-open:active:translate-y-px',
  'data-disabled:opacity-disabled data-disabled:pointer-events-none',
  'group-data-disabled/submenu-trigger:opacity-disabled group-data-disabled/submenu-trigger:pointer-events-none',
  'motion-reduce:transition-none',
  'data-[orientation=vertical]:text-start',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
]

const sharedColors = [
  'text-foreground-strong hover:text-foreground-intense focus-visible:text-foreground-intense',
  'data-active:text-foreground-intense data-popup-open:text-foreground-intense data-pressed:text-foreground-intense',
]
const pill = [
  ...sharedColors,
  'before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit]',
  'before:transition-colors before:duration-300',
  'motion-reduce:before:transition-none',
  'hover:before:bg-background-muted focus-visible:before:bg-background-muted',
  'data-active:before:bg-background-muted',
  'data-popup-open:before:bg-background-muted data-pressed:before:bg-background-muted',
  'data-highlighted:not-data-disabled:text-foreground-intense',
  'data-highlighted:not-data-disabled:before:bg-background-muted',
  'group-data-highlighted/submenu-trigger:not-data-disabled:text-foreground-intense',
  'group-data-highlighted/submenu-trigger:not-data-disabled:before:bg-background-muted',
  'group-data-popup-open/submenu-trigger:not-data-disabled:text-foreground-intense',
  'group-data-popup-open/submenu-trigger:not-data-disabled:before:bg-background-muted',
]

const line = [
  ...sharedColors,
  'after:absolute after:rounded-full after:bg-no-repeat',
  'after:[background-image:linear-gradient(0deg,currentColor,currentColor)]',
  'after:transition-[background-size] after:duration-300',
  'motion-reduce:after:transition-none',

  'data-[orientation=horizontal]:after:inset-x-0',
  'data-[orientation=horizontal]:after:h-0.5',
  'data-[orientation=horizontal]:after:bg-size-[0_2px]',
  'ltr:data-[orientation=horizontal]:after:bg-right rtl:data-[orientation=horizontal]:after:bg-left',
  'hover:data-[orientation=horizontal]:after:bg-size-[100%_2px] focus-visible:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:hover:data-[orientation=horizontal]:after:bg-left rtl:hover:data-[orientation=horizontal]:after:bg-right',
  'ltr:focus-visible:data-[orientation=horizontal]:after:bg-left rtl:focus-visible:data-[orientation=horizontal]:after:bg-right',
  'data-active:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:data-active:data-[orientation=horizontal]:after:bg-left rtl:data-active:data-[orientation=horizontal]:after:bg-right',
  'data-popup-open:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:data-popup-open:data-[orientation=horizontal]:after:bg-left rtl:data-popup-open:data-[orientation=horizontal]:after:bg-right',
  'data-pressed:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:data-pressed:data-[orientation=horizontal]:after:bg-left rtl:data-pressed:data-[orientation=horizontal]:after:bg-right',

  'data-[orientation=vertical]:after:inset-s-0 data-[orientation=vertical]:after:top-[25%] data-[orientation=vertical]:after:bottom-[25%]',
  'data-[orientation=vertical]:after:w-0.5',
  'data-[orientation=vertical]:after:bg-size-[2px_0]',
  'data-[orientation=vertical]:after:[background-position-y:bottom]',
  'hover:data-[orientation=vertical]:after:bg-size-[2px_100%] hover:data-[orientation=vertical]:after:[background-position-y:top]',
  'focus-visible:data-[orientation=vertical]:after:bg-size-[2px_100%] focus-visible:data-[orientation=vertical]:after:[background-position-y:top]',
  'data-active:data-[orientation=vertical]:after:bg-size-[2px_100%] data-active:data-[orientation=vertical]:after:[background-position-y:top]',
  'data-popup-open:data-[orientation=vertical]:after:bg-size-[2px_100%] data-popup-open:data-[orientation=vertical]:after:[background-position-y:top]',
  'data-pressed:data-[orientation=vertical]:after:bg-size-[2px_100%] data-pressed:data-[orientation=vertical]:after:[background-position-y:top]',
]

const indicator = [
  ...sharedColors,
  'max-w-full',
  '**:data-[slot=navigation-link-indicator]:inline-flex',
  '**:data-[slot=navigation-link-indicator]:items-center',
  '**:data-[slot=navigation-link-indicator]:justify-center',
  '**:data-[slot=navigation-link-indicator]:overflow-hidden',
  '**:data-[slot=navigation-link-indicator]:shrink-0',
  '**:data-[slot=navigation-link-indicator]:w-0',
  '**:data-[slot=navigation-link-indicator]:opacity-0',
  'rtl:**:data-[slot=navigation-link-indicator]:rotate-180',
  '**:data-[slot=navigation-link-indicator]:transition-[width,opacity]',
  '**:data-[slot=navigation-link-indicator]:duration-250',
  '**:data-[slot=navigation-link-indicator]:ease-out',
  'motion-reduce:**:data-[slot=navigation-link-indicator]:transition-none',
  'hover:**:data-[slot=navigation-link-indicator]:opacity-100 focus-visible:**:data-[slot=navigation-link-indicator]:opacity-100',
  'data-active:**:data-[slot=navigation-link-indicator]:opacity-100',
  '**:data-[slot=navigation-link-label]:flex-1',
  '**:data-[slot=navigation-link-label]:min-w-0',
  '**:data-[slot=navigation-link-label]:truncate',
]

const navigationLinkVariants = cva(cn(base), {
  variants: {
    variant: {
      pill: cn(pill),
      line: cn(line),
      indicator: cn(indicator),
    },
    size: {
      sm: "text-xs [&_svg:not([class*='size-'])]:size-4",
      md: "text-sm [&_svg:not([class*='size-'])]:size-4.5",
      lg: "text-base [&_svg:not([class*='size-'])]:size-5",
    },
  },
  compoundVariants: [
    {
      variant: 'pill',
      size: 'sm',
      class: cn(
        'data-[orientation=horizontal]:rounded-sm data-[orientation=horizontal]:py-2 data-[orientation=horizontal]:px-3 data-[orientation=horizontal]:has-data-[icon=end]:pe-2 data-[orientation=horizontal]:has-data-[icon=start]:ps-2',
        'data-[orientation=vertical]:rounded-xs data-[orientation=vertical]:py-1.5 data-[orientation=vertical]:px-2.5 data-[orientation=vertical]:has-data-[icon=end]:pe-1.5 data-[orientation=vertical]:has-data-[icon=start]:ps-1.5',
        'in-aria-[orientation=vertical]:rounded-xs in-aria-[orientation=vertical]:py-1.5 in-aria-[orientation=vertical]:px-2.5 in-aria-[orientation=vertical]:has-data-[icon=end]:pe-1.5 in-aria-[orientation=vertical]:has-data-[icon=start]:ps-1.5',
      ),
    },
    {
      variant: 'pill',
      size: 'md',
      class: cn(
        'data-[orientation=horizontal]:rounded-md data-[orientation=horizontal]:py-2.5 data-[orientation=horizontal]:px-3.5 data-[orientation=horizontal]:has-data-[icon=end]:pe-2.5 data-[orientation=horizontal]:has-data-[icon=start]:ps-2.5',
        'data-[orientation=vertical]:rounded-sm data-[orientation=vertical]:py-2 data-[orientation=vertical]:px-3 data-[orientation=vertical]:has-data-[icon=end]:pe-2 data-[orientation=vertical]:has-data-[icon=start]:ps-2',
        'in-aria-[orientation=vertical]:rounded-sm in-aria-[orientation=vertical]:py-2 in-aria-[orientation=vertical]:px-3 in-aria-[orientation=vertical]:has-data-[icon=end]:pe-2 in-aria-[orientation=vertical]:has-data-[icon=start]:ps-2',
      ),
    },
    {
      variant: 'pill',
      size: 'lg',
      class: cn(
        'data-[orientation=horizontal]:rounded-lg data-[orientation=horizontal]:py-3 data-[orientation=horizontal]:px-4 data-[orientation=horizontal]:has-data-[icon=end]:pe-3 data-[orientation=horizontal]:has-data-[icon=start]:ps-3',
        'data-[orientation=vertical]:rounded-md data-[orientation=vertical]:py-2.5 data-[orientation=vertical]:px-3.5 data-[orientation=vertical]:has-data-[icon=end]:pe-2.5 data-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
        'in-aria-[orientation=vertical]:rounded-md in-aria-[orientation=vertical]:py-2.5 in-aria-[orientation=vertical]:px-3.5 in-aria-[orientation=vertical]:has-data-[icon=end]:pe-2.5 in-aria-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
      ),
    },
    {
      variant: 'line',
      size: 'sm',
      class: cn(
        'data-[orientation=horizontal]:py-2',
        'data-[orientation=vertical]:py-1.5 data-[orientation=vertical]:ps-2.5',
        'data-[orientation=vertical]:has-data-[icon=end]:pe-1.5 data-[orientation=vertical]:has-data-[icon=start]:ps-1.5',
        'data-[orientation=horizontal]:after:bottom-1',
      ),
    },
    {
      variant: 'line',
      size: 'md',
      class: cn(
        'data-[orientation=horizontal]:py-2.5',
        'data-[orientation=vertical]:py-2 data-[orientation=vertical]:ps-3',
        'data-[orientation=vertical]:has-data-[icon=end]:pe-2 data-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
        'data-[orientation=horizontal]:after:bottom-1.5',
      ),
    },
    {
      variant: 'line',
      size: 'lg',
      class: cn(
        'data-[orientation=horizontal]:py-3',
        'data-[orientation=vertical]:py-2.5 data-[orientation=vertical]:ps-3.5',
        'data-[orientation=vertical]:has-data-[icon=end]:pe-2.5 data-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
        'data-[orientation=horizontal]:after:bottom-2',
      ),
    },
    {
      variant: 'indicator',
      size: 'sm',
      class: cn(
        'data-[orientation=horizontal]:py-2',
        'data-[orientation=vertical]:py-1.5',
        'hover:**:data-[slot=navigation-link-indicator]:w-4 focus-visible:**:data-[slot=navigation-link-indicator]:w-4 data-active:**:data-[slot=navigation-link-indicator]:w-4',
      ),
    },
    {
      variant: 'indicator',
      size: 'md',
      class: cn(
        'data-[orientation=horizontal]:py-2.5',
        'data-[orientation=vertical]:py-2',
        'hover:**:data-[slot=navigation-link-indicator]:w-4.5 focus-visible:**:data-[slot=navigation-link-indicator]:w-4.5 data-active:**:data-[slot=navigation-link-indicator]:w-4.5',
      ),
    },
    {
      variant: 'indicator',
      size: 'lg',
      class: cn(
        'data-[orientation=horizontal]:py-3',
        'data-[orientation=vertical]:py-2.5',
        'hover:**:data-[slot=navigation-link-indicator]:w-5 focus-visible:**:data-[slot=navigation-link-indicator]:w-5 data-active:**:data-[slot=navigation-link-indicator]:w-5',
      ),
    },
  ],
  defaultVariants: {
    variant: 'pill',
    size: 'md',
  },
})

type NavigationLinkVariants = VariantProps<typeof navigationLinkVariants>

export { navigationLinkVariants }
export type { NavigationLinkVariants }


// ─── navigation/navigation-link.tsx ───
'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn, focusableProps } from '../../internal/utils'
import { navigationLinkVariants } from './navigation-link-variants'
import {
  useNavigationContext,
  type NavigationOrientation,
  type NavigationSize,
  type NavigationVariant,
  type NavigationActiveLink,
} from './navigation-context'

type NavigationLinkState = {
  active: boolean
  disabled: boolean
}

interface NavigationLinkProps extends useRender.ComponentProps<'a', NavigationLinkState> {
  /**
   * Override the root's variant for this link.
   * @default root
   */
  variant?: NavigationVariant
  /**
   * Override the root's size for this link.
   * @default root
   */
  size?: NavigationSize
  /**
   * Override the root's orientation for this link.
   * @default root
   */
  orientation?: NavigationOrientation
  /** Force the active state, overriding \`activeLink\`. */
  active?: boolean
  /**
   * Dim the link and remove it from the tab order.
   * @default false
   */
  disabled?: boolean
  /** Matched against the root's \`activeLink\` to mark this link current. */
  value?: Exclude<NavigationActiveLink, null>
  /**
   * Custom marker for the \`indicator\` variant.
   * @default chevron
   */
  indicator?: React.ReactNode
}

function NavigationLink({
  className,
  children,
  variant: variantProp,
  size: sizeProp,
  orientation: orientationProp,
  active: activeProp,
  disabled = false,
  value,
  indicator,
  render,
  ...props
}: NavigationLinkProps) {
  const ctx = useNavigationContext()
  const variant: NavigationVariant = variantProp ?? ctx?.variant ?? 'pill'
  const size: NavigationSize = sizeProp ?? ctx?.size ?? 'md'
  const orientation: NavigationOrientation = orientationProp ?? ctx?.orientation ?? 'horizontal'
  const active = activeProp ?? (value !== undefined && ctx?.activeLink === value)

  const content =
    variant === 'indicator' ? (
      <>
        <span data-slot="navigation-link-indicator" aria-hidden>
          {indicator ?? <DefaultIndicator />}
        </span>
        <span data-slot="navigation-link-label">{children}</span>
      </>
    ) : (
      children
    )

  return useRender({
    defaultTagName: 'a',
    render,
    state: { active, disabled } satisfies NavigationLinkState,
    props: mergeProps<'a'>(
      {
        'data-slot': 'navigation-link',
        'data-orientation': orientation,
        'data-active': active || undefined,
        'aria-current': active ? 'page' : undefined,
        ...focusableProps(disabled),
        className: cn(navigationLinkVariants({ variant, size }), className),
        children: content,
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

function DefaultIndicator() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5.558 3.558c.244-.244.641-.244.885 0l4 4c.244.244.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0s-.244-.641 0-.885L9.115 8 5.558 4.442c-.244-.244-.244-.641 0-.885z" />
    </svg>
  )
}

export { NavigationLink }
export type { NavigationLinkProps, NavigationLinkState }


// ─── navigation/navigation.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import {
  NavigationContext,
  useNavigationContext,
  type NavigationSize,
  type NavigationVariant,
  type NavigationActiveLink,
  type NavigationContextValue,
} from './navigation-context'

type NavigationBaseProps = Omit<React.ComponentPropsWithoutRef<'nav'>, 'aria-orientation'> & {
  /**
   * Scales link text, padding, and icons.
   * @default 'md'
   */
  size?: NavigationSize
  /**
   * The \`value\` of the current link. Stamps the match with \`aria-current="page"\`.
   * @default null
   */
  activeLink?: NavigationActiveLink
}

// \`orientation\` discriminates the union, so both branches repeat the same prop
// docs - TypeScript surfaces whichever branch the consumer's usage narrows to.
type NavigationProps = NavigationBaseProps &
  (
    | {
        /** Lay the links out as a row or a column. @default 'horizontal' */
        orientation?: 'horizontal'
        /** Active/hover styling. \`indicator\` is vertical-only. @default 'pill' */
        variant?: Extract<NavigationVariant, 'pill' | 'line'>
      }
    | {
        /** Lay the links out as a row or a column. @default 'horizontal' */
        orientation: 'vertical'
        /** Active/hover styling. \`indicator\` is vertical-only. @default 'pill' */
        variant?: Extract<NavigationVariant, 'pill' | 'line' | 'indicator'>
      }
  )

function Navigation({
  className,
  orientation = 'horizontal',
  variant = 'pill',
  size = 'md',
  activeLink = null,
  ...props
}: NavigationProps) {
  const ctx = React.useMemo<NavigationContextValue>(
    () => ({ orientation, variant: variant as NavigationVariant, size, activeLink }),
    [orientation, variant, size, activeLink],
  )

  return (
    <NavigationContext.Provider value={ctx}>
      <nav data-slot="navigation" data-orientation={orientation} className={className} {...props} />
    </NavigationContext.Provider>
  )
}

type NavigationListProps = React.ComponentPropsWithoutRef<'ul'>

const HORIZONTAL_GAP: Partial<Record<NavigationVariant, string>> = {
  pill: 'gap-0.5',
  line: 'gap-7',
}

const VERTICAL_GAP: Partial<Record<NavigationVariant, string>> = {
  pill: 'gap-0.5',
}

function NavigationList({ className, ...props }: NavigationListProps) {
  const ctx = useNavigationContext()
  const orientation = ctx?.orientation ?? 'horizontal'
  const variant = ctx?.variant ?? 'pill'

  const gap = (orientation === 'vertical' ? VERTICAL_GAP : HORIZONTAL_GAP)[variant]
  const layout = cn('flex', orientation === 'vertical' && 'flex-col', gap)

  return <ul data-slot="navigation-list" role="list" className={cn(layout, className)} {...props} />
}

type NavigationItemProps = React.ComponentPropsWithoutRef<'li'>

function NavigationItem({ className, ...props }: NavigationItemProps) {
  return <li data-slot="navigation-item" className={className} {...props} />
}

export { Navigation, NavigationList, NavigationItem }
export type { NavigationProps, NavigationListProps, NavigationItemProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">navigation</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-number-field`,
    name: `Number Field (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── number-field/number-field.tsx ───
'use client'

import * as React from 'react'
import { NumberField as BaseNumberField, type NumberFieldRoot } from '@base-ui/react/number-field'
import { type VariantProps } from 'class-variance-authority'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import { cn } from '../../internal/utils'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { buttonVariants } from '../button/button-variants'
import { inputVariants } from '../input/input-variants'

type NumberFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type NumberFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>
type AnimDirection = 'up' | 'down'

const numberFieldWidth: Record<NumberFieldSize, string> = {
  sm: 'w-24',
  md: 'w-30',
  lg: 'w-35',
}

const stepperSize: Record<NumberFieldSize, { size: 'icon-sm' | 'icon-md' | 'icon-lg'; override: string }> = {
  sm: { size: 'icon-sm', override: 'size-7 rounded-xs [&_svg]:size-3.5!' },
  md: { size: 'icon-md', override: 'size-9 rounded-sm [&_svg]:size-4!' },
  lg: { size: 'icon-lg', override: 'size-11 rounded-md [&_svg]:size-4.5!' },
}

const stepperButtonVariant: Record<NumberFieldVariant, 'soft' | 'outline'> = {
  outline: 'soft',
  soft: 'outline',
}

const inputSizeClasses: Record<NumberFieldSize, string> = {
  sm: 'text-xs pointer-coarse:text-base',
  md: 'text-sm pointer-coarse:text-base',
  lg: 'text-base',
}

const digitVariants = {
  enter: (dir: AnimDirection) => ({
    y: dir === 'up' ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { y: '0%', opacity: 1 },
  exit: (dir: AnimDirection) => ({
    y: dir === 'up' ? '-100%' : '100%',
    opacity: 0,
  }),
}

const DIGIT_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number] }

function AnimatedDigit({ char, direction }: { char: string; direction: AnimDirection }) {
  return (
    <span className="relative inline-block overflow-hidden">
      <AnimatePresence custom={direction} mode="popLayout" initial={false}>
        <m.span
          key={char}
          custom={direction}
          variants={digitVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={DIGIT_TRANSITION}
          className="inline-block"
        >
          {char}
        </m.span>
      </AnimatePresence>
    </span>
  )
}

function AnimatedNumber({ value, direction }: { value: string; direction: AnimDirection }) {
  const chars = React.useMemo(() => Array.from(value), [value])
  return (
    <span className="inline-flex leading-none">
      {chars.map((ch, i) => {
        const fromRight = chars.length - 1 - i
        return <AnimatedDigit key={\`r\${fromRight}\`} char={ch} direction={direction} />
      })}
    </span>
  )
}

interface NumberFieldProps extends Omit<React.ComponentProps<typeof BaseNumberField.Root>, 'className'> {
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: NumberFieldVariant
  /**
   * Scales field width, steppers, and text.
   * @default 'md'
   */
  size?: NumberFieldSize
  /** Extra classes on the field root, merged via \`tailwind-merge\`. */
  className?: string
  /**
   * Placeholder text shown when empty.
   * @default ' '
   */
  placeholder?: string
  /** Props forwarded to the inner \`<input>\` (\`name\`, \`onChange\`, \`aria-*\`, \`className\`, …). */
  inputProps?: React.ComponentProps<typeof BaseNumberField.Input>
}

function NumberField({
  className,
  variant = 'outline',
  size = 'md',
  onValueChange,
  onValueCommitted,
  format,
  locale,
  value: controlledValue,
  defaultValue,
  min,
  placeholder = ' ',
  inputProps,
  ...rootProps
}: NumberFieldProps) {
  const resolvedVariant: NumberFieldVariant = variant
  const resolvedSize: NumberFieldSize = size
  const stepperVariant = stepperButtonVariant[resolvedVariant]
  const { size: stepperBtnSize, override: stepperOverride } = stepperSize[resolvedSize]
  const stepperClass = cn(buttonVariants({ variant: stepperVariant, size: stepperBtnSize }), stepperOverride)

  const ariaInvalid = rootProps['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const reduced = useReducedMotion()

  const formatter = React.useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, format)
    } catch {
      return new Intl.NumberFormat()
    }
  }, [locale, format])

  const formatValue = React.useCallback(
    (value: number | null | undefined) => (value == null || Number.isNaN(value) ? '' : formatter.format(value)),
    [formatter],
  )

  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = React.useState<number | null>(defaultValue ?? null)
  const currentValue = isControlled ? controlledValue : internalValue

  const [state, setState] = React.useState<{ value: string; direction: AnimDirection }>(() => ({
    value: formatValue(controlledValue ?? defaultValue ?? null),
    direction: 'up',
  }))

  const [prevValue, setPrevValue] = React.useState<number | null | undefined>(currentValue)
  if (prevValue !== currentValue) {
    setPrevValue(currentValue)
    const next = formatValue(currentValue)
    setState((prev) => (prev.value === next ? prev : { ...prev, value: next }))
  }

  const handleValueChange: NonNullable<typeof onValueChange> = (value, details) => {
    if (!isControlled) setInternalValue(value)
    setState((prev) => ({
      value: formatValue(value),
      direction:
        details.reason === 'decrement-press' ? 'down' : details.reason === 'increment-press' ? 'up' : prev.direction,
    }))
    onValueChange?.(value, details)
  }

  const handleValueCommitted: NonNullable<typeof onValueCommitted> = (value, details) => {
    onValueCommitted?.(value, details)
    if (value != null) return
    const fallback = min ?? 0
    if (!isControlled) setInternalValue(fallback)
    setState((prev) => ({ ...prev, value: formatValue(fallback) }))
    const syntheticDetails: NumberFieldRoot.ChangeEventDetails = {
      reason: 'none',
      event: details.event,
      cancel: () => {},
      allowPropagation: () => {},
      isCanceled: false,
      isPropagationAllowed: false,
      trigger: undefined,
    }
    onValueChange?.(fallback, syntheticDetails)
  }

  const [isFocused, setIsFocused] = React.useState(false)
  const suppressFocusRef = React.useRef(false)

  const handleStepperPointerDown = () => {
    suppressFocusRef.current = true
    setIsFocused(false)
    setTimeout(() => {
      suppressFocusRef.current = false
    }, 0)
  }

  const handleInputPointerDown = () => setIsFocused(true)
  const handleInputFocus = () => {
    if (suppressFocusRef.current) return
    setIsFocused(true)
  }
  const handleInputBlur = () => setIsFocused(false)

  return (
    <BaseNumberField.Root
      data-slot="number-field"
      className={cn(
        inputVariants({ variant: resolvedVariant, size: resolvedSize, state: 'within' }),
        'h-auto shrink-0 p-px',
        numberFieldWidth[resolvedSize],
        className,
      )}
      onValueChange={handleValueChange}
      onValueCommitted={handleValueCommitted}
      format={format}
      locale={locale}
      min={min}
      value={currentValue}
      {...rootProps}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      <BaseNumberField.Decrement
        data-slot="number-field-decrement"
        aria-label="Decrease value"
        className={stepperClass}
        onPointerDown={handleStepperPointerDown}
      >
        <MinusIcon />
      </BaseNumberField.Decrement>

      <LazyMotion features={domAnimation} strict>
        <div className="relative flex-1 self-stretch overflow-hidden">
          <BaseNumberField.Input
            data-slot="number-field-input"
            placeholder={placeholder}
            {...inputProps}
            onPointerDown={(e) => {
              inputProps?.onPointerDown?.(e)
              handleInputPointerDown()
            }}
            onFocus={(e) => {
              inputProps?.onFocus?.(e)
              handleInputFocus()
            }}
            onBlur={(e) => {
              inputProps?.onBlur?.(e)
              handleInputBlur()
            }}
            className={cn(
              'peer text-foreground absolute inset-0 h-full w-full bg-transparent text-center outline-none',
              inputSizeClasses[resolvedSize],
              !reduced &&
                !isFocused &&
                'not-placeholder-shown:text-transparent not-placeholder-shown:caret-transparent',
              inputProps?.className,
            )}
          />
          {!reduced && (
            <div
              data-slot="number-field-overlay"
              aria-hidden="true"
              className={cn(
                'text-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center peer-placeholder-shown:invisible',
                isFocused && 'invisible',
                inputSizeClasses[resolvedSize],
              )}
            >
              <AnimatedNumber value={state.value} direction={state.direction} />
            </div>
          )}
        </div>
      </LazyMotion>

      <BaseNumberField.Increment
        data-slot="number-field-increment"
        aria-label="Increase value"
        className={stepperClass}
        onPointerDown={handleStepperPointerDown}
      >
        <PlusIcon />
      </BaseNumberField.Increment>
    </BaseNumberField.Root>
  )
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export { NumberField }
export type { NumberFieldProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">number field</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-otp-field`,
    name: `Otp Field (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── otp-field/otp-field.tsx ───
'use client'

import * as React from 'react'
import { OTPField as BaseOTPField } from '@base-ui/react/otp-field'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import { inputVariants } from '../input/input-variants'

type OTPFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type OTPFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>

interface OTPFieldContextValue {
  variant: OTPFieldVariant
  size: OTPFieldSize
}

const OTPFieldContext = React.createContext<OTPFieldContextValue | null>(null)

function useOTPFieldContext() {
  const ctx = React.useContext(OTPFieldContext)
  if (!ctx) {
    throw new Error('OTPField sub-components must be rendered inside <OTPField>')
  }
  return ctx
}

const INPUT_SQUARE: Record<OTPFieldSize, string> = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
}

const SEPARATOR_SIZE: Record<OTPFieldSize, string> = {
  sm: 'w-3 [&_svg]:size-3',
  md: 'w-4 [&_svg]:size-3.5',
  lg: 'w-5 [&_svg]:size-4.5',
}

interface OTPFieldProps extends Omit<React.ComponentProps<typeof BaseOTPField.Root>, 'className'> {
  /**
   * Slot appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: OTPFieldVariant
  /**
   * Scales every slot.
   * @default 'md'
   */
  size?: OTPFieldSize
  /** Extra classes on the root, merged via \`tailwind-merge\`. */
  className?: string
}

function OTPField({ variant = 'outline', size = 'md', className, children, ...props }: OTPFieldProps) {
  const ctx = React.useMemo<OTPFieldContextValue>(() => ({ variant, size }), [variant, size])

  return (
    <OTPFieldContext.Provider value={ctx}>
      <BaseOTPField.Root data-slot="otp-field" className={cn('flex w-fit items-center gap-1', className)} {...props}>
        {children}
      </BaseOTPField.Root>
    </OTPFieldContext.Provider>
  )
}

type OTPFieldInputProps = React.ComponentProps<typeof BaseOTPField.Input>

function OTPFieldInput({ className, ...props }: OTPFieldInputProps) {
  const { variant, size } = useOTPFieldContext()

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <BaseOTPField.Input
      data-slot="otp-field-input"
      className={cn(
        inputVariants({ variant, size, state: 'self' }),
        'px-0 text-center focus:placeholder:text-transparent',
        INPUT_SQUARE[size],
        className,
      )}
      {...props}
      {...(invalid ? { 'data-invalid': '' } : {})}
    />
  )
}

type OTPFieldSeparatorProps = React.ComponentProps<typeof BaseOTPField.Separator>

function OTPFieldSeparator({ className, children, ...props }: OTPFieldSeparatorProps) {
  const { size } = useOTPFieldContext()

  return (
    <BaseOTPField.Separator
      data-slot="otp-field-separator"
      className={cn('text-border-strong flex items-center justify-center', SEPARATOR_SIZE[size], className)}
      {...props}
    >
      {children ?? <SeparatorMark />}
    </BaseOTPField.Separator>
  )
}

function SeparatorMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 4" fill="none">
      <path d="M2 2H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export { OTPField, OTPFieldInput, OTPFieldSeparator }
export type { OTPFieldProps, OTPFieldInputProps, OTPFieldSeparatorProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">otp field</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-pagination`,
    name: `Pagination (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── pagination/pagination.tsx ───
'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn, focusableProps } from '../../internal/utils'
import { buttonVariants } from '../button/button-variants'

type PaginationVariant = 'outline' | 'soft'
type PaginationSize = 'sm' | 'md' | 'lg'

interface PaginationContextValue {
  variant: PaginationVariant
  size: PaginationSize
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null)

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext)
  if (!ctx) {
    throw new Error('Pagination sub-components must be rendered inside <Pagination>')
  }
  return ctx
}

interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {
  /**
   * Link style, shared with every link via context.
   * @default 'outline'
   */
  variant?: PaginationVariant
  /**
   * Link sizing, shared via context.
   * @default 'md'
   */
  size?: PaginationSize
}

function Pagination({ className, variant = 'outline', size = 'md', ...props }: PaginationProps) {
  const ctx = React.useMemo<PaginationContextValue>(() => ({ variant, size }), [variant, size])

  return (
    <PaginationContext.Provider value={ctx}>
      <nav
        role="navigation"
        aria-label="pagination"
        data-slot="pagination"
        className={cn('data-disabled:opacity-disabled flex w-fit', className)}
        {...props}
      />
    </PaginationContext.Provider>
  )
}

type PaginationListProps = React.ComponentPropsWithoutRef<'ul'>

function PaginationList({ className, ...props }: PaginationListProps) {
  return <ul data-slot="pagination-list" className={cn('flex items-center gap-1', className)} {...props} />
}

type PaginationItemProps = React.ComponentPropsWithoutRef<'li'>

function PaginationItem({ className, ...props }: PaginationItemProps) {
  return <li data-slot="pagination-item" className={className} {...props} />
}

type PaginationLinkState = {
  active: boolean
  disabled: boolean
  variant: PaginationVariant
  size: PaginationSize
}

interface PaginationLinkProps extends useRender.ComponentProps<'a', PaginationLinkState> {
  /**
   * Mark the current page. Renders a non-interactive, filled link with \`aria-current="page"\`.
   * @default false
   */
  active?: boolean
  /**
   * Make the link non-interactive and dimmed (\`aria-disabled\`); used for out-of-range controls.
   * @default false
   */
  disabled?: boolean
}

const LINK_SIZE_OVERRIDES: Record<PaginationSize, string> = {
  sm: 'px-2 gap-0.5 text-xs min-w-8 has-data-[icon=end]:pe-1 has-data-[icon=start]:ps-1',
  md: 'px-2.5 gap-0.5 text-sm min-w-10 has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5',
  lg: 'px-3 gap-0.5 text-base min-w-12 has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2',
}

function PaginationLink({ className, active = false, disabled = false, render, ...props }: PaginationLinkProps) {
  const { variant, size } = usePaginationContext()

  return useRender({
    defaultTagName: 'a',
    render,
    state: { active, disabled, variant, size } satisfies PaginationLinkState,
    props: mergeProps<'a'>(
      {
        'data-slot': 'pagination-link',
        'data-active': active || undefined,
        'aria-current': active ? 'page' : undefined,
        ...focusableProps(disabled),
        className: cn(
          buttonVariants({ variant, size }),
          LINK_SIZE_OVERRIDES[size],
          active &&
            'text-primary-foreground pointer-events-none cursor-default before:bg-primary before:border-transparent',
          disabled && 'opacity-disabled pointer-events-none',
          className,
        ),
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

type PaginationEllipsisProps = React.ComponentPropsWithoutRef<'span'>

const ELLIPSIS_SIZE: Record<PaginationSize, string> = {
  sm: 'h-8 w-6 pb-1 [&_svg]:size-4',
  md: 'h-10 w-7 pb-1.5 [&_svg]:size-4.5',
  lg: 'h-12 w-8 pb-2 [&_svg]:size-5',
}

function PaginationEllipsis({ className, children, ...props }: PaginationEllipsisProps) {
  const { size } = usePaginationContext()

  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn('text-foreground-strong inline-flex items-end justify-center', ELLIPSIS_SIZE[size], className)}
      {...props}
    >
      {children ?? <EllipsisMark />}
    </span>
  )
}

function EllipsisMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  )
}

export { Pagination, PaginationList, PaginationItem, PaginationLink, PaginationEllipsis }
export type { PaginationProps, PaginationListProps, PaginationItemProps, PaginationLinkProps, PaginationEllipsisProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">pagination</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-popover`,
    name: `Popover (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── popover/popover.tsx ───
import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'

type PopoverProps = React.ComponentProps<typeof BasePopover.Root>

const Popover = Object.assign(
  function Popover(props: PopoverProps) {
    return <BasePopover.Root {...props} />
  },
  { createHandle: BasePopover.createHandle },
)

type PopoverTriggerProps = React.ComponentProps<typeof BasePopover.Trigger>

function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = React.ComponentProps<typeof BasePopover.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BasePopover.Positioner>,
    React.ComponentProps<typeof BasePopover.Portal>
  > & {
    /**
     * Render the pointer and the thicker anchored border.
     * @default true
     */
    arrow?: boolean
  }

function PopoverContent({ className, arrow = true, children, ...props }: PopoverContentProps) {
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BasePopover.Portal {...portal}>
      <BasePopover.Positioner
        side="bottom"
        align="center"
        alignOffset={0}
        sideOffset={arrow ? 10 : 6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BasePopover.Popup className="group/popup outline-none" {...popup}>
          <div
            data-slot="popover-content"
            className={cn(
              'bg-background border-border-overlay flex max-w-80 min-w-50 flex-col gap-2 rounded-xl border p-4 shadow-2xl',
              arrow && [
                'group-data-[side=top]/popup:border-b-2',
                'group-data-[side=bottom]/popup:border-t-2',
                'group-data-[side=left]/popup:border-r-2',
                'group-data-[side=right]/popup:border-l-2',
                'group-data-[side=inline-start]/popup:border-e-2',
                'group-data-[side=inline-end]/popup:border-s-2',
              ],
              'motion-safe:origin-(--transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
              'group-data-starting-style/popup:motion-safe:scale-90 group-data-starting-style/popup:motion-safe:opacity-0',
              'group-data-ending-style/popup:motion-safe:scale-95 group-data-ending-style/popup:motion-safe:opacity-0 group-data-ending-style/popup:motion-safe:duration-100 group-data-ending-style/popup:motion-safe:ease-out',
              className,
            )}
          >
            {children}
          </div>
          {arrow && (
            <BasePopover.Arrow
              data-slot="popover-arrow"
              className={cn(
                'flex',
                'data-[side=top]:-bottom-2.25 data-[side=top]:rotate-180',
                'data-[side=bottom]:-top-2.25',
                'data-[side=left]:-right-3.25 data-[side=left]:rotate-90',
                'data-[side=right]:-left-3.25 data-[side=right]:-rotate-90',
                'data-[side=inline-start]:-inset-e-3.25 data-[side=inline-start]:ltr:rotate-90 data-[side=inline-start]:rtl:-rotate-90',
                'data-[side=inline-end]:-inset-s-3.25 data-[side=inline-end]:ltr:-rotate-90 data-[side=inline-end]:rtl:rotate-90',
              )}
            >
              <PopoverArrowSvg />
            </BasePopover.Arrow>
          )}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

function PopoverArrowSvg() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden="true">
      <path
        className="text-border-overlay"
        d="M21 9L15.9819 3.36153C14.3897 1.57244 11.5927 1.57413 10.0026 3.36516L5 9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="text-background"
        d="M9.82943 4.57564C11.4308 2.51078 14.5497 2.51076 16.1511 4.5756L20.9774 10.7986C23.0157 13.4269 21.1426 17.25 17.8166 17.25L8.16409 17.25C4.83808 17.25 2.96496 13.4269 5.00325 10.7987L9.82943 4.57564Z"
        fill="currentColor"
      />
    </svg>
  )
}

type PopoverTitleProps = React.ComponentProps<typeof BasePopover.Title>

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <BasePopover.Title
      data-slot="popover-title"
      className={cn('text-foreground-intense text-base font-semibold', className)}
      {...props}
    />
  )
}

type PopoverDescriptionProps = React.ComponentProps<typeof BasePopover.Description>

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <BasePopover.Description data-slot="popover-description" className={cn('text-sm', className)} {...props} />
}

type PopoverCloseProps = React.ComponentProps<typeof BasePopover.Close>

function PopoverClose(props: PopoverCloseProps) {
  return <BasePopover.Close data-slot="popover-close" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose }
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">popover</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-preview-card`,
    name: `Preview Card (Appica)`,
    category: `Cards`,
    tags: [`card`, `appica`],
    code: `// ─── preview-card/preview-card.tsx ───
import * as React from 'react'
import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'

type PreviewCardProps = React.ComponentProps<typeof BasePreviewCard.Root>

const PreviewCard = Object.assign(
  function PreviewCard(props: PreviewCardProps) {
    return <BasePreviewCard.Root {...props} />
  },
  { createHandle: BasePreviewCard.createHandle },
)

type PreviewCardTriggerProps = React.ComponentProps<typeof BasePreviewCard.Trigger>

function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  return <BasePreviewCard.Trigger data-slot="preview-card-trigger" {...props} />
}

type PreviewCardContentProps = React.ComponentProps<typeof BasePreviewCard.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BasePreviewCard.Positioner>,
    React.ComponentProps<typeof BasePreviewCard.Portal>
  > & {
    /**
     * Render the pointer and the thicker anchored border.
     * @default true
     */
    arrow?: boolean
  }

function PreviewCardContent({ className, arrow = true, children, ...props }: PreviewCardContentProps) {
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BasePreviewCard.Portal {...portal}>
      <BasePreviewCard.Positioner
        side="bottom"
        align="center"
        alignOffset={0}
        sideOffset={arrow ? 10 : 6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BasePreviewCard.Popup className="group/popup outline-none" {...popup}>
          <div
            data-slot="preview-card-content"
            className={cn(
              'bg-background border-border-overlay flex max-w-80 min-w-50 flex-col gap-2 rounded-xl border p-4 shadow-2xl',
              arrow && [
                'group-data-[side=top]/popup:border-b-2',
                'group-data-[side=bottom]/popup:border-t-2',
                'group-data-[side=left]/popup:border-r-2',
                'group-data-[side=right]/popup:border-l-2',
                'group-data-[side=inline-start]/popup:border-e-2',
                'group-data-[side=inline-end]/popup:border-s-2',
              ],
              'motion-safe:origin-(--transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
              'group-data-starting-style/popup:motion-safe:scale-90 group-data-starting-style/popup:motion-safe:opacity-0',
              'group-data-ending-style/popup:motion-safe:scale-95 group-data-ending-style/popup:motion-safe:opacity-0 group-data-ending-style/popup:motion-safe:duration-100 group-data-ending-style/popup:motion-safe:ease-out',
              className,
            )}
          >
            {children}
          </div>
          {arrow && (
            <BasePreviewCard.Arrow
              data-slot="preview-card-arrow"
              className={cn(
                'flex',
                'data-[side=top]:-bottom-2.25 data-[side=top]:rotate-180',
                'data-[side=bottom]:-top-2.25',
                'data-[side=left]:-right-3.25 data-[side=left]:rotate-90',
                'data-[side=right]:-left-3.25 data-[side=right]:-rotate-90',
                'data-[side=inline-start]:-inset-e-3.25 data-[side=inline-start]:ltr:rotate-90 data-[side=inline-start]:rtl:-rotate-90',
                'data-[side=inline-end]:-inset-s-3.25 data-[side=inline-end]:ltr:-rotate-90 data-[side=inline-end]:rtl:rotate-90',
              )}
            >
              <PreviewCardArrowSvg />
            </BasePreviewCard.Arrow>
          )}
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  )
}

function PreviewCardArrowSvg() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden="true">
      <path
        className="text-border-overlay"
        d="M21 9L15.9819 3.36153C14.3897 1.57244 11.5927 1.57413 10.0026 3.36516L5 9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="text-background"
        d="M9.82943 4.57564C11.4308 2.51078 14.5497 2.51076 16.1511 4.5756L20.9774 10.7986C23.0157 13.4269 21.1426 17.25 17.8166 17.25L8.16409 17.25C4.83808 17.25 2.96496 13.4269 5.00325 10.7987L9.82943 4.57564Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { PreviewCard, PreviewCardTrigger, PreviewCardContent }
export type { PreviewCardProps, PreviewCardTriggerProps, PreviewCardContentProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">preview card</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-progress`,
    name: `Progress (Appica)`,
    category: `Loading UI`,
    tags: [`loader`, `appica`],
    code: `// ─── progress/progress.tsx ───
import * as React from 'react'
import { Progress as BaseProgress } from '@base-ui/react/progress'
import { cn } from '../../internal/utils'

type ProgressVariant = 'bar' | 'circular'

type ProgressLabelProps = BaseProgress.Label.Props
type ProgressValueProps = BaseProgress.Value.Props

interface ProgressProps extends Omit<BaseProgress.Root.Props, 'value'> {
  /**
   * Horizontal track or SVG ring.
   * @default 'bar'
   */
  variant?: ProgressVariant
  /**
   * Diameter of the ring in pixels (\`circular\` only).
   * @default 56
   */
  size?: number
  /**
   * Track weight in pixels. Defaults to \`6\` for \`bar\`, \`4\` for \`circular\`.
   * @default 6\` / \`4
   */
  thickness?: number
  /**
   * Any CSS color for the fill (e.g. \`var(--success-emphasis)\`).
   * @default primary token
   */
  indicatorColor?: string
  /** Current value, from \`min\` to \`max\`. Pass \`null\` for an indeterminate state. */
  value?: number | null
}

function Progress({
  variant = 'bar',
  size,
  thickness,
  indicatorColor,
  className,
  style,
  children,
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressProps) {
  const resolvedThickness = thickness ?? (variant === 'circular' ? 4 : 6)
  const resolvedSize = size ?? 56

  const rootStyle = {
    ...style,
    '--progress-color': indicatorColor ?? 'var(--primary)',
  } as unknown as React.CSSProperties

  return (
    <BaseProgress.Root
      data-slot="progress"
      data-variant={variant}
      value={value ?? null}
      min={min}
      max={max}
      style={rootStyle}
      className={cn(
        'grid w-full gap-x-2 gap-y-1.5',
        // bar
        'data-[variant=bar]:grid-cols-[1fr_auto]',
        'data-[variant=bar]:**:data-[slot=progress-label]:col-start-1 data-[variant=bar]:**:data-[slot=progress-label]:row-start-1',
        'data-[variant=bar]:**:data-[slot=progress-value]:col-start-2 data-[variant=bar]:**:data-[slot=progress-value]:row-start-1 data-[variant=bar]:**:data-[slot=progress-value]:justify-self-end',
        'data-[variant=bar]:**:data-[slot=progress-track]:col-span-2',
        // circular
        'data-[variant=circular]:w-fit data-[variant=circular]:justify-items-center',
        'data-[variant=circular]:**:data-[slot=progress-circular]:col-start-1 data-[variant=circular]:**:data-[slot=progress-circular]:row-start-1',
        'data-[variant=circular]:**:data-[slot=progress-value]:col-start-1 data-[variant=circular]:**:data-[slot=progress-value]:row-start-1 data-[variant=circular]:**:data-[slot=progress-value]:place-self-center',
        'data-[variant=circular]:**:data-[slot=progress-label]:row-start-2',
        className,
      )}
      {...props}
    >
      {children}
      {variant === 'bar' ? (
        <BaseProgress.Track
          data-slot="progress-track"
          className="bg-background-strong relative w-full overflow-hidden rounded-full"
          style={{ height: resolvedThickness }}
        >
          <BaseProgress.Indicator
            data-slot="progress-indicator"
            className="rounded-full bg-(--progress-color) transition-[width] duration-300 motion-reduce:transition-none"
          />
        </BaseProgress.Track>
      ) : (
        <ProgressCircular value={value ?? null} min={min} max={max} size={resolvedSize} thickness={resolvedThickness} />
      )}
    </BaseProgress.Root>
  )
}

interface ProgressCircularProps {
  value: number | null
  min: number
  max: number
  size: number
  thickness: number
}

function ProgressCircular({ value, min, max, size, thickness }: ProgressCircularProps) {
  const indeterminate = value == null
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const center = size / 2
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <svg
      data-slot="progress-circular"
      width={size}
      height={size}
      viewBox={\`0 0 \${size} \${size}\`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <circle
        data-slot="progress-track"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        className="stroke-background-strong"
      />
      <circle
        data-slot="progress-indicator"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={\`rotate(-90 \${center} \${center})\`}
        style={{ stroke: 'var(--progress-color)' }}
        className="transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
      />
    </svg>
  )
}

function ProgressLabel({ className, ...props }: BaseProgress.Label.Props) {
  return (
    <BaseProgress.Label
      data-slot="progress-label"
      className={cn('text-foreground-intense text-sm font-medium', className)}
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: BaseProgress.Value.Props) {
  return (
    <BaseProgress.Value data-slot="progress-value" className={cn('text-foreground text-sm', className)} {...props} />
  )
}

export { Progress, ProgressLabel, ProgressValue }
export type { ProgressProps, ProgressLabelProps, ProgressValueProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">progress</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-radio-group`,
    name: `Radio Group (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── radio-group/radio-group.tsx ───
import * as React from 'react'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { cn } from '../../internal/utils'

interface RadioGroupProps extends React.ComponentProps<typeof BaseRadioGroup> {
  /**
   * Lay options out in a row or column; sets which arrow keys move selection.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical'
}

function RadioGroup({ className, orientation = 'vertical', ...props }: RadioGroupProps) {
  const horizontal = orientation === 'horizontal'
  return (
    <BaseRadioGroup
      data-slot="radio-group"
      aria-orientation={orientation}
      className={cn('flex', horizontal ? 'flex-wrap gap-4' : 'flex-col gap-2', className)}
      {...props}
    />
  )
}

export { RadioGroup }
export type { RadioGroupProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">radio group</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-radio`,
    name: `Radio (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── radio/radio.tsx ───
'use client'

import * as React from 'react'
import { Radio as BaseRadio } from '@base-ui/react/radio'
import { LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn, useComposedRefs } from '../../internal/utils'

const SQUISH_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number],
}

const INDICATOR_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number],
}

const ZERO_TRANSITION = { duration: 0 } as const

function RadioIndicator({ checked, reduced }: { checked: boolean; reduced: boolean }) {
  return (
    <BaseRadio.Indicator data-slot="radio-indicator" className="flex items-center justify-center" keepMounted>
      <m.span
        className="bg-primary-foreground size-[0.5em] min-h-2 min-w-2 rounded-full"
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={reduced ? ZERO_TRANSITION : INDICATOR_TRANSITION}
      />
    </BaseRadio.Indicator>
  )
}

function RadioRoot({
  renderProps,
  state,
  reduced,
}: {
  renderProps: React.ComponentPropsWithRef<'span'>
  state: { checked: boolean }
  reduced: boolean
}) {
  const { checked } = state
  const { ref, ...htmlProps } = renderProps
  const [scope, animate] = useAnimate()
  const composedRef = useComposedRefs(ref, scope)

  const prevChecked = React.useRef(checked)
  React.useEffect(() => {
    const toggled = prevChecked.current !== checked
    prevChecked.current = checked
    if (toggled && !reduced) {
      animate(scope.current, { scale: [1, 0.8, 1.1, 1] }, SQUISH_TRANSITION)
    }
  }, [checked, animate, scope, reduced])

  return (
    <span data-slot="radio" {...htmlProps} ref={composedRef}>
      <RadioIndicator checked={checked} reduced={reduced} />
    </span>
  )
}

type RadioProps = React.ComponentProps<typeof BaseRadio.Root>

function Radio({ className, ...props }: RadioProps) {
  const reduced = useReducedMotion()

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseRadio.Root
        {...props}
        {...(invalid ? { 'data-invalid': '' } : {})}
        className={cn(
          'flex size-[1em] min-h-4 min-w-4 shrink-0 cursor-default items-center justify-center',
          'bg-background border-border-strong outline-ring-input rounded-full border outline-offset-1',
          'transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
          'hover:not-data-checked:not-data-disabled:not-data-invalid:border-border-emphasis',
          'data-checked:bg-primary data-checked:outline-ring-primary data-checked:border-transparent',
          'data-disabled:not-data-checked:bg-background-subtle data-disabled:data-checked:opacity-disabled data-disabled:cursor-not-allowed data-disabled:not-data-checked:border-dashed',
          'data-invalid:border-error data-invalid:not-data-checked:bg-error-subtle data-invalid:outline-ring-error',
          className,
        )}
        render={(renderProps, state) => <RadioRoot renderProps={renderProps} state={state} reduced={reduced} />}
      />
    </LazyMotion>
  )
}

export { Radio }
export type { RadioProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">radio</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-rating`,
    name: `Rating (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── rating/rating.tsx ───
'use client'

import * as React from 'react'
import { LazyMotion, animate, domAnimation, m, useMotionValue, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { useReducedMotion } from '../../hooks/use-reduced-motion'

type RatingVariant = 'filled' | 'outline'
type RatingOrientation = 'horizontal' | 'vertical'

interface RatingIconPair {
  /** Drawn under the fill when \`variant="outline"\`. */
  empty: React.ReactNode
  /** Drawn as the fill, and as the muted base when \`variant="filled"\`. */
  filled: React.ReactNode
}

const STAR: RatingIconPair = {
  empty: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.007 17.754 5.827 21l1.18-6.876L2 9.256l6.91-1L12 2l3.09 6.255 6.91 1-5.007 4.87L18.173 21z" />
    </svg>
  ),
  filled: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m8.33 7.439-6.242.903-.11.023a.98.98 0 0 0-.692 1.206 1 1 0 0 0 .26.438l4.524 4.393-1.067 6.206-.013.107a.975.975 0 0 0 .934 1.034 1 1 0 0 0 .499-.112l5.583-2.93 5.57 2.93.099.045a.98.98 0 0 0 1.275-.566 1 1 0 0 0 .048-.508l-1.068-6.206 4.525-4.394.076-.083a.975.975 0 0 0-.62-1.582L15.67 7.44l-2.79-5.644a.978.978 0 0 0-1.756 0z" />
    </svg>
  ),
}

const ZERO_TRANSITION = { duration: 0 } as const
const SETTLE_TRANSITION = { type: 'spring', stiffness: 380, damping: 34, mass: 0.5 } as const
const SCALE_TRANSITION = { type: 'spring', stiffness: 420, damping: 24, mass: 0.6 } as const
// Overdamped going down so the press reads as instant, underdamped coming back
// up so releasing overshoots slightly before settling.
const PRESS_TRANSITION = { type: 'spring', stiffness: 800, damping: 45, mass: 0.5 } as const
const RELEASE_TRANSITION = { type: 'spring', stiffness: 500, damping: 15, mass: 0.7 } as const

const PRESSED_SCALE = 0.9
const LIFTED_SCALE = 1.14

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number) => Math.round(value * 1e4) / 1e4

function quantize(raw: number, step: number, count: number) {
  return clamp(round(Math.ceil(round(raw / step)) * step), step, count)
}

function clipFor(fill: number, rtl: boolean, vertical: boolean) {
  const inset = \`\${round((1 - fill) * 100)}%\`
  if (vertical) return \`inset(0 0 \${inset} 0)\`
  return rtl ? \`inset(0 0 0 \${inset})\` : \`inset(0 \${inset} 0 0)\`
}

const iconLayerClasses = 'block size-(--rating-size) *:size-full'

// stroke-dasharray inherits into the SVG, where it resolves against the 24-unit
// viewBox - so the dash scales with --rating-size instead of staying fixed.
const DASHED = '[stroke-dasharray:2.5_2]'

interface RatingItemVisualProps {
  index: number
  progress: MotionValue<number>
  icons: RatingIconPair
  variant: RatingVariant
  rtl: boolean
  vertical: boolean
  reduced: boolean
  disabled: boolean
  lifted: boolean
  pressed: boolean
}

function RatingItemVisual({
  index,
  progress,
  icons,
  variant,
  rtl,
  vertical,
  reduced,
  disabled,
  lifted,
  pressed,
}: RatingItemVisualProps) {
  const clipPath = useTransform(progress, (value) => clipFor(clamp(value - index, 0, 1), rtl, vertical))

  // Reading the ref during render is what distinguishes a release (bounce back)
  // from an ordinary hover change (no bounce); the effect commits it afterwards.
  const wasPressed = React.useRef(false)
  React.useEffect(() => {
    wasPressed.current = pressed
  }, [pressed])

  return (
    <m.span
      className="relative block"
      initial={false}
      animate={{ scale: reduced ? 1 : pressed ? PRESSED_SCALE : lifted ? LIFTED_SCALE : 1 }}
      transition={
        reduced
          ? ZERO_TRANSITION
          : pressed
            ? PRESS_TRANSITION
            : wasPressed.current
              ? RELEASE_TRANSITION
              : SCALE_TRANSITION
      }
    >
      <span className="relative block">
        <span
          data-slot="rating-item-base"
          className={cn(
            iconLayerClasses,
            'relative',
            variant === 'filled' && (disabled ? 'text-background-muted' : 'text-border-strong'),
            variant === 'outline' && disabled && DASHED,
          )}
        >
          {variant === 'filled' ? icons.filled : icons.empty}
        </span>
        {variant === 'filled' && disabled ? (
          <span aria-hidden="true" className={cn(iconLayerClasses, 'text-border-strong absolute inset-0', DASHED)}>
            {icons.empty}
          </span>
        ) : null}
        <m.span
          data-slot="rating-item-fill"
          aria-hidden="true"
          className={cn(iconLayerClasses, 'absolute inset-0')}
          style={{ clipPath }}
        >
          {icons.filled}
        </m.span>
      </span>
    </m.span>
  )
}

// The button padding is a sixth of the icon size (4px at the 24px default), so
// the hit area and the gap it creates both scale with \`size\`.
const ITEM_PADDING = 'p-[calc(var(--rating-size)/6)]'

const rootClasses = cn(
  'text-primary relative inline-flex w-fit items-center data-disabled:cursor-not-allowed data-disabled:opacity-disabled',
  'data-[orientation=vertical]:flex-col',
  'data-[orientation=horizontal]:mx-[calc(var(--rating-size)/-6)]',
  'data-[orientation=vertical]:my-[calc(var(--rating-size)/-6)]',
)

const itemClasses = cn(
  'outline-ring rounded-sm relative inline-flex cursor-pointer items-center justify-center disabled:pointer-events-none',
  ITEM_PADDING,
)

const defaultItemAriaLabel = (value: number, count: number) => \`\${value} of \${count}\`

interface RatingProps extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'role' | 'aria-readonly'
> {
  /** Controlled rating. Pair with \`onValueChange\`. */
  value?: number
  /**
   * Uncontrolled initial rating. \`0\` means unrated.
   * @default 0
   */
  defaultValue?: number
  /** Fires when the rating is committed by a click or a key press. */
  onValueChange?: (value: number) => void
  /** Fires with the \`step\`-snapped rating under the pointer, and with \`null\` when it leaves. */
  onHoverChange?: (value: number | null) => void
  /**
   * How many items to render.
   * @default 5
   */
  count?: number
  /**
   * Smallest selectable fraction of an item. Use \`0.5\` for half icons.
   * @default 1
   */
  step?: number
  /**
   * Icon pair to render. Defaults to a built-in star; pass any 24x24 \`currentColor\` SVGs, e.g. a matching outline and solid icon from \`@appica/icons-react\`.
   */
  icon?: RatingIconPair
  /**
   * \`'filled'\` draws unrated items as muted solid icons, \`'outline'\` draws them as line icons.
   * @default 'filled'
   */
  variant?: RatingVariant
  /**
   * Lay the items out in a row or a column. A vertical rating fills from the top down.
   * @default 'horizontal'
   */
  orientation?: RatingOrientation
  /**
   * Icon size. A number is read as pixels; a string is used verbatim, so any CSS length works (\`'2rem'\`, \`'1em'\` to follow the surrounding text).
   * @default 24
   */
  size?: number | string
  /**
   * Track the pointer with a continuous fill before the rating is committed. Clicking still selects at \`step\` precision either way.
   * @default true
   */
  hoverable?: boolean
  /**
   * Selecting the current rating again resets it to \`0\`.
   * @default false
   */
  clearable?: boolean
  /**
   * Blocks interaction and dims the control.
   * @default false
   */
  disabled?: boolean
  /**
   * Renders a non-interactive display of \`value\`, exposed as a single labeled image.
   * @default false
   */
  readOnly?: boolean
  /** Field name submitted with a form, via a hidden input. */
  name?: string
  /** Accessible name for each item, describing the rating it selects. */
  itemAriaLabel?: (value: number, count: number) => string
}

function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  onHoverChange,
  count = 5,
  step = 1,
  icon = STAR,
  variant = 'filled',
  orientation = 'horizontal',
  size = 24,
  hoverable = true,
  clearable = false,
  disabled = false,
  readOnly = false,
  name,
  itemAriaLabel = defaultItemAriaLabel,
  className,
  style,
  'aria-label': ariaLabel,
  ...props
}: RatingProps) {
  const rtl = useDirection() === 'rtl'
  const vertical = orientation === 'vertical'
  const reduced = useReducedMotion()

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value ?? uncontrolled

  const [hover, setHover] = React.useState<number | null>(null)
  const hoverRef = React.useRef<number | null>(null)
  const [pressedIndex, setPressedIndex] = React.useState<number | null>(null)
  const itemsRef = React.useRef<Array<HTMLButtonElement | null>>([])

  const progress = useMotionValue(current)
  const settleRef = React.useRef<ReturnType<typeof animate> | null>(null)

  const interactive = !disabled && !readOnly
  const checkedIndex = current > 0 ? Math.ceil(current) - 1 : 0

  const setProgress = React.useCallback(
    (next: number) => {
      settleRef.current?.stop()
      settleRef.current = null
      if (reduced) {
        progress.set(next)
      } else {
        settleRef.current = animate(progress, next, SETTLE_TRANSITION)
      }
    },
    [progress, reduced],
  )

  const previewing = hoverable && hover !== null

  React.useEffect(() => {
    if (!previewing) setProgress(current)
  }, [current, previewing, setProgress])

  const updateHover = (next: number | null) => {
    if (hoverRef.current === next) return
    hoverRef.current = next
    if (hoverable) {
      setHover(next)
      if (next !== null) setProgress(next)
    }
    onHoverChange?.(next)
  }

  const trackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const span = vertical ? rect.height : rect.width
    if (span === 0) return
    const offset = vertical ? event.clientY - rect.top : event.clientX - rect.left
    const ratio = offset / span
    const exact = clamp((!vertical && rtl ? 1 - ratio : ratio) * count, 0, count)
    updateHover(quantize(exact, step, count))
  }

  const commit = (next: number) => {
    const resolved = clamp(round(next), 0, count)
    if (value === undefined) setUncontrolled(resolved)
    if (resolved !== current) onValueChange?.(resolved)
  }

  const handleItemClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const next = (event.detail === 0 ? null : hoverRef.current) ?? index + 1
    commit(clearable && next === current ? 0 : next)
  }

  // Only the item that owns the press may end it: pressing another item blurs
  // this one, and that blur lands after the new item's pointerdown.
  const releasePress = (index: number) => setPressedIndex((cur) => (cur === index ? null : cur))

  const pressProps = (index: number) => ({
    onPointerDown: () => setPressedIndex(index),
    onPointerUp: () => releasePress(index),
    onPointerLeave: () => releasePress(index),
    onPointerCancel: () => releasePress(index),
    onBlur: () => releasePress(index),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') setPressedIndex(index)
    },
    onKeyUp: () => releasePress(index),
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    // Radio-group semantics: Down/Right step to the next item, Up/Left to the
    // previous one. Only the horizontal pair mirrors in RTL.
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = current + (rtl ? -step : step)
        break
      case 'ArrowLeft':
        next = current + (rtl ? step : -step)
        break
      case 'ArrowDown':
        next = current + step
        break
      case 'ArrowUp':
        next = current - step
        break
      case 'Home':
        next = step
        break
      case 'End':
        next = count
        break
      default:
        return
    }
    event.preventDefault()
    updateHover(null)
    const resolved = clamp(round(next), clearable ? 0 : step, count)
    commit(resolved)
    itemsRef.current[Math.max(0, Math.ceil(resolved) - 1)]?.focus()
  }

  const pointerProps = interactive
    ? {
        onPointerMove: trackPointer,
        onPointerDown: trackPointer,
        onPointerLeave: () => updateHover(null),
        onPointerCancel: () => updateHover(null),
      }
    : {}

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        data-slot="rating"
        data-orientation={orientation}
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={ariaLabel ?? (readOnly ? \`\${current} out of \${count}\` : undefined)}
        aria-orientation={readOnly ? undefined : orientation}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(readOnly ? { 'data-readonly': '' } : {})}
        className={cn(rootClasses, className)}
        style={{ '--rating-size': typeof size === 'number' ? \`\${size}px\` : size, ...style } as React.CSSProperties}
        onKeyDown={interactive ? handleKeyDown : undefined}
        {...pointerProps}
        {...props}
      >
        {Array.from({ length: count }, (_, index) => {
          const visual = (
            <RatingItemVisual
              index={index}
              progress={progress}
              icons={icon}
              variant={variant}
              rtl={rtl}
              vertical={vertical}
              reduced={reduced}
              disabled={disabled}
              lifted={hover !== null && Math.ceil(hover) - 1 === index}
              pressed={pressedIndex === index}
            />
          )

          if (readOnly) {
            return (
              <span key={index} data-slot="rating-item" className={cn('inline-flex', ITEM_PADDING)}>
                {visual}
              </span>
            )
          }

          const checked = Math.ceil(current) === index + 1
          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={itemAriaLabel(index + 1, count)}
              tabIndex={index === checkedIndex ? 0 : -1}
              disabled={disabled}
              data-slot="rating-item"
              {...(checked ? { 'data-checked': '' } : {})}
              ref={(node) => {
                itemsRef.current[index] = node
              }}
              className={itemClasses}
              onClick={(event) => handleItemClick(event, index)}
              {...pressProps(index)}
            >
              {visual}
            </button>
          )
        })}
        {name ? <input type="hidden" name={name} value={current} /> : null}
      </div>
    </LazyMotion>
  )
}

export { Rating }
export type { RatingProps, RatingIconPair }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">rating</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-scroll-area`,
    name: `Scroll Area (Appica)`,
    category: `Cards`,
    tags: [`card`, `appica`],
    code: `// ─── scroll-area/scroll-area.tsx ───
import * as React from 'react'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { cn } from '../../internal/utils'

type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'
type ScrollbarVisibility = 'always' | 'auto' | 'never'

const SCROLL_SHADOW_CLASSES = cn(
  'mask-no-repeat mask-intersect',
  'ltr:[mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%),linear-gradient(to_right,transparent_0,black_min(40px,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-x-end,40px))),transparent_100%)]',
  'rtl:[mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%),linear-gradient(to_left,transparent_0,black_min(40px,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-x-end,40px))),transparent_100%)]',
)

const SCROLLBAR_AUTO_CLASSES = cn(
  'pointer-events-none opacity-0',
  'data-[hovering]:pointer-events-auto data-[hovering]:opacity-100',
  'data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0',
)

interface ScrollAreaProps extends React.ComponentProps<typeof BaseScrollArea.Root> {
  /**
   * Which axis (or axes) gets a scrollbar. \`both\` also renders the corner.
   * @default 'vertical'
   */
  orientation?: ScrollAreaOrientation
  /**
   * Fade the content at scrollable edges via a CSS mask.
   * @default false
   */
  scrollShadow?: boolean
  /**
   * \`auto\` reveals the bar on hover/scroll; \`never\` hides it while keeping content scrollable.
   * @default 'always'
   */
  scrollbarVisibility?: ScrollbarVisibility
  /** Props forwarded to the inner scroll viewport - \`ref\`, \`onScroll\`, \`className\`, etc. */
  viewportProps?: Omit<React.ComponentProps<typeof BaseScrollArea.Viewport>, 'children'>
}

function ScrollArea({
  orientation = 'vertical',
  scrollShadow = false,
  scrollbarVisibility = 'always',
  className,
  children,
  viewportProps,
  ...props
}: ScrollAreaProps) {
  const showVertical = scrollbarVisibility !== 'never' && (orientation === 'vertical' || orientation === 'both')
  const showHorizontal = scrollbarVisibility !== 'never' && (orientation === 'horizontal' || orientation === 'both')

  return (
    <BaseScrollArea.Root data-slot="scroll-area" className={cn('relative flex flex-col', className)} {...props}>
      <BaseScrollArea.Viewport
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={cn(
          'focus-visible:ring-ring min-h-0 w-full flex-1 rounded-[inherit] outline-none focus-visible:ring-2',
          scrollShadow && SCROLL_SHADOW_CLASSES,
          viewportProps?.className,
        )}
      >
        <BaseScrollArea.Content
          data-slot="scroll-area-content"
          {...(orientation === 'vertical' ? { style: { minWidth: 0 } } : {})}
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {showVertical && <Scrollbar orientation="vertical" visibility={scrollbarVisibility} />}
      {showHorizontal && <Scrollbar orientation="horizontal" visibility={scrollbarVisibility} />}
      {orientation === 'both' && scrollbarVisibility !== 'never' && (
        <BaseScrollArea.Corner data-slot="scroll-area-corner" />
      )}
    </BaseScrollArea.Root>
  )
}

function Scrollbar({
  orientation,
  visibility,
}: {
  orientation: 'vertical' | 'horizontal'
  visibility: ScrollbarVisibility
}) {
  return (
    <BaseScrollArea.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-visibility={visibility}
      orientation={orientation}
      className={cn(
        'm-0.5 flex touch-none select-none',
        'transition-[width,height,opacity] duration-150 ease-out motion-reduce:transition-none',
        'data-[orientation=vertical]:w-1.25 data-[orientation=vertical]:justify-center',
        'data-[orientation=horizontal]:h-1.25 data-[orientation=horizontal]:items-center',
        'data-[orientation=vertical]:hover:w-2',
        'data-[orientation=horizontal]:hover:h-2',
        visibility === 'auto' && SCROLLBAR_AUTO_CLASSES,
      )}
    >
      <BaseScrollArea.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          'bg-background-strong rounded-full',
          'data-[orientation=vertical]:w-full',
          'data-[orientation=horizontal]:h-full',
        )}
      />
    </BaseScrollArea.Scrollbar>
  )
}

export { ScrollArea }
export type { ScrollAreaProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">scroll area</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-select`,
    name: `Select (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── select/select.tsx ───
'use client'

import * as React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { inputVariants } from '../input/input-variants'

type SelectSize = 'sm' | 'md' | 'lg'
type SelectVariant = 'outline' | 'soft'

interface SelectContextValue {
  size: SelectSize
  variant: SelectVariant
  alignItemWithTrigger: boolean
  hasValue: boolean
  clear: (event?: React.SyntheticEvent) => void
  multiple: boolean
  reducedMotion: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) {
    throw new Error('Select sub-components must be rendered inside <Select>')
  }
  return ctx
}

type BaseSelectRootProps = React.ComponentProps<typeof BaseSelect.Root>

interface SelectProps extends BaseSelectRootProps {
  /**
   * Trigger height, popup radius, and item sizing.
   * @default 'md'
   */
  size?: SelectSize
  /**
   * Trigger appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: SelectVariant
  /**
   * Overlay the selected item over the trigger on open. **Set \`false\` when using a \`startSlot\`.**
   * @default true
   */
  alignItemWithTrigger?: boolean
}

function Select({
  size = 'md',
  variant = 'outline',
  alignItemWithTrigger = true,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  children,
  ...rest
}: SelectProps) {
  const reducedMotion = useReducedMotion()
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<unknown>(defaultValue ?? (multiple ? [] : null))
  const current = isControlled ? value : internal

  const hasValue = multiple
    ? Array.isArray(current) && current.length > 0
    : current !== null && current !== undefined && current !== ''

  const handleChange = React.useCallback<NonNullable<BaseSelectRootProps['onValueChange']>>(
    (next, details) => {
      if (!isControlled) {
        setInternal(next)
      }
      onValueChange?.(next, details)
    },
    [isControlled, onValueChange],
  )

  const clear = React.useCallback(
    (event?: React.SyntheticEvent) => {
      const next = multiple ? [] : null
      const details = {
        reason: 'none',
        event: event?.nativeEvent ?? new Event('clear'),
        trigger: undefined,
        cancel: () => {},
        allowPropagation: () => {},
        isCanceled: false,
        isPropagationAllowed: false,
      }
      handleChange(next as never, details as never)
    },
    [multiple, handleChange],
  )

  const ctx = React.useMemo<SelectContextValue>(
    () => ({ size, variant, alignItemWithTrigger, hasValue, clear, multiple, reducedMotion }),
    [size, variant, alignItemWithTrigger, hasValue, clear, multiple, reducedMotion],
  )

  return (
    <SelectContext.Provider value={ctx}>
      <BaseSelect.Root value={current as never} onValueChange={handleChange} multiple={multiple as never} {...rest}>
        {children}
      </BaseSelect.Root>
    </SelectContext.Provider>
  )
}

const ICON_SIZE: Record<SelectSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

interface SelectTriggerProps extends React.ComponentProps<typeof BaseSelect.Trigger> {
  /**
   * Render a clear button inside the trigger when a value is present.
   * @default false
   */
  clearable?: boolean
  /** Adornment before the value. Pair with \`alignItemWithTrigger={false}\`. */
  startSlot?: React.ReactNode
  /** Adornment after the value, before the chevron. */
  endSlot?: React.ReactNode
}

function SelectTrigger({
  className,
  clearable,
  startSlot,
  endSlot,
  children,
  onKeyDown,
  ...props
}: SelectTriggerProps) {
  const { size, variant, alignItemWithTrigger, hasValue, clear } = useSelectContext()
  const iconSize = ICON_SIZE[size]
  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'
  const canClear = clearable && hasValue

  const handleKeyDown: NonNullable<SelectTriggerProps['onKeyDown']> = (event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault()
      clear(event)
    }
  }

  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(
        inputVariants({ variant, size, state: 'self' }),
        'data-placeholder:text-foreground-subtle flex items-center justify-between',
        className,
      )}
      {...props}
      onKeyDown={handleKeyDown}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      {startSlot && (
        <span data-slot="select-trigger-start" className="-ms-1 shrink-0">
          {startSlot}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center truncate text-start">{children}</span>
      {canClear ? (
        <span
          data-slot="select-clear"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
            event.preventDefault()
            clear(event)
          }}
          onClick={(event) => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
          }}
          className="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
        >
          <ClearIcon className="size-[1em]" />
        </span>
      ) : null}
      {endSlot && (
        <span data-slot="select-trigger-end" className="shrink-0">
          {endSlot}
        </span>
      )}
      <BaseSelect.Icon
        data-slot="select-icon"
        className="text-foreground -me-1 shrink-0"
        render={
          alignItemWithTrigger ? (
            <ChevronsIcon className={iconSize} />
          ) : (
            <ChevronDownIcon
              className={cn(
                iconSize,
                'motion-safe:transition-transform motion-safe:duration-200',
                'data-popup-open:rotate-180',
              )}
            />
          )
        }
      />
    </BaseSelect.Trigger>
  )
}

type SelectValueProps = React.ComponentProps<typeof BaseSelect.Value>

function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <BaseSelect.Value
      data-slot="select-value"
      className={cn('min-w-0 flex-1 truncate text-start', className)}
      {...props}
    />
  )
}

const POPUP_RADIUS: Record<SelectSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type SelectContentProps = React.ComponentProps<typeof BaseSelect.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseSelect.Positioner>,
    React.ComponentProps<typeof BaseSelect.Portal>
  > & {
    /** Per-popup override of the root's alignment setting. */
    alignItemWithTrigger?: boolean
  }

function SelectContent({ className, alignItemWithTrigger: alignOverride, children, ...props }: SelectContentProps) {
  const { size, alignItemWithTrigger: ctxAlign } = useSelectContext()
  const alignWithTrigger = alignOverride ?? ctxAlign
  const { positioner, portal, popup } = splitFloatingProps(props)

  return (
    <BaseSelect.Portal {...portal}>
      <BaseSelect.Positioner
        sideOffset={6}
        {...positioner}
        alignItemWithTrigger={alignWithTrigger}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseSelect.Popup
          data-slot="select-content"
          data-align-trigger={alignWithTrigger || undefined}
          className={cn(
            'bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
            POPUP_RADIUS[size],
            'min-w-36',
            alignWithTrigger ? 'w-[calc(var(--anchor-width)+1rem)]' : 'w-(--anchor-width)',
            alignWithTrigger ? 'origin-center' : 'origin-(--transform-origin)',
            'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          <SelectScrollUpButton />
          <BaseSelect.List className="flex max-h-(--available-height) flex-col gap-0.5 overflow-y-auto p-2">
            {children}
          </BaseSelect.List>
          <SelectScrollDownButton />
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  )
}

const SCROLL_ARROW_CLASSES = cn(
  'bg-background text-foreground z-1 flex h-6 w-[calc(100%-var(--border-width)*2)] cursor-default items-center justify-center',
)

function SelectScrollUpButton() {
  const { size } = useSelectContext()
  return (
    <BaseSelect.ScrollUpArrow
      data-slot="select-scroll-up"
      aria-hidden="true"
      className={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[size], 'top-px rounded-b-none')}
    >
      <ChevronDownIcon className={cn(ICON_SIZE[size], 'rotate-180')} />
    </BaseSelect.ScrollUpArrow>
  )
}

function SelectScrollDownButton() {
  const { size } = useSelectContext()
  return (
    <BaseSelect.ScrollDownArrow
      data-slot="select-scroll-down"
      aria-hidden="true"
      className={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[size], 'bottom-px rounded-t-none')}
    >
      <ChevronDownIcon className={ICON_SIZE[size]} />
    </BaseSelect.ScrollDownArrow>
  )
}

type SelectGroupProps = React.ComponentProps<typeof BaseSelect.Group>

function SelectGroup(props: SelectGroupProps) {
  return <BaseSelect.Group data-slot="select-group" {...props} />
}

type SelectGroupLabelProps = React.ComponentProps<typeof BaseSelect.GroupLabel>

const GROUP_LABEL_SIZE: Record<SelectSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  const { size } = useSelectContext()
  return (
    <BaseSelect.GroupLabel
      data-slot="select-group-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

const ITEM_SIZE: Record<SelectSize, string> = {
  sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
  md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
}

const ITEM_TEXT_SIZE: Record<SelectSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

interface SelectItemProps extends React.ComponentProps<typeof BaseSelect.Item> {}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  const { size, reducedMotion } = useSelectContext()
  return (
    <BaseSelect.Item
      data-slot="select-item"
      className={cn(
        'text-foreground relative isolate flex w-full cursor-default items-center justify-between outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
        'active:translate-y-px active:scale-[0.98]',
        'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
        'motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
        'motion-safe:active:duration-100 motion-safe:active:ease-in-out',
        'motion-safe:before:transition-opacity motion-safe:before:duration-200 motion-safe:before:ease-out',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none',
        ITEM_SIZE[size],
        className,
      )}
      {...props}
    >
      <BaseSelect.ItemText className={cn('flex items-center text-start', ITEM_TEXT_SIZE[size])}>
        {children}
      </BaseSelect.ItemText>
      <BaseSelect.ItemIndicator
        data-slot="select-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  )
}

type SelectSeparatorProps = React.ComponentProps<typeof BaseSelect.Separator>

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <BaseSelect.Separator
      data-slot="select-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z" />
    </svg>
  )
}

function ChevronsIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10.26 9.593c.225-.224.589-.224.814 0s.224.589 0 .813l-2.667 2.667c-.225.224-.589.224-.813 0l-2.666-2.667c-.225-.225-.225-.589 0-.813s.588-.224.813 0l2.26 2.26 2.261-2.26zM7.593 2.927c.225-.225.589-.225.813 0l2.667 2.666c.224.224.224.589 0 .813s-.589.225-.814 0L7.999 4.146 5.74 6.407c-.225.224-.588.224-.812 0s-.225-.589 0-.813l2.666-2.666z" />
    </svg>
  )
}

function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('stroke-2', className)}
      {...props}
    >
      <path
        d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
        pathLength={1}
        strokeDasharray="1 2"
        className={cn(
          'opacity-0 [stroke-dashoffset:1.02]',
          'group-data-selected/check:opacity-100 group-data-selected/check:[stroke-dashoffset:0]',
          'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          'motion-safe:delay-[0ms,150ms] motion-safe:duration-[150ms,0ms]',
          'motion-safe:group-data-selected/check:delay-[0ms] motion-safe:group-data-selected/check:duration-[0ms,300ms]',
        )}
      />
    </svg>
  )
}

function ClearIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectSeparator }
export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectGroupProps,
  SelectGroupLabelProps,
  SelectItemProps,
  SelectSeparatorProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">select</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-separator`,
    name: `Separator (Appica)`,
    category: `Components`,
    tags: [`separator`, `appica`],
    code: `// ─── separator/separator.tsx ───
import * as React from 'react'
import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { cn } from '../../internal/utils'

type SeparatorVariant = 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient' | 'wave' | 'zigzag'

const separatorVariants: Record<SeparatorVariant, string> = {
  solid: 'border-current border-solid data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l',
  dashed:
    'text-border-strong border-current border-dashed data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l',
  dotted: 'text-border-strong',
  double:
    'border-current border-double data-[orientation=horizontal]:border-t-[calc(var(--border-width)*3)] data-[orientation=vertical]:border-l-[calc(var(--border-width)*3)]',
  gradient:
    'data-[orientation=horizontal]:h-(--border-width) data-[orientation=horizontal]:bg-[linear-gradient(to_right,transparent,currentColor_26%,currentColor_74%,transparent)] data-[orientation=vertical]:w-(--border-width) data-[orientation=vertical]:bg-[linear-gradient(to_bottom,transparent,currentColor_26%,currentColor_74%,transparent)]',
  wave: '',
  zigzag: '',
}

type DecorativeDim = { w: number; h: number; d: string }
const decorativeVariants: Partial<
  Record<SeparatorVariant, { strokeScale: number; horizontal: DecorativeDim; vertical: DecorativeDim }>
> = {
  dotted: {
    strokeScale: 1.75,
    horizontal: { w: 6, h: 8, d: 'M3 4 L3 4' },
    vertical: { w: 8, h: 6, d: 'M4 3 L4 3' },
  },
  wave: {
    strokeScale: 1.5,
    horizontal: { w: 16, h: 8, d: 'M0 4 Q4 1 8 4 T16 4' },
    vertical: { w: 8, h: 16, d: 'M4 0 Q1 4 4 8 T4 16' },
  },
  zigzag: {
    strokeScale: 1.5,
    horizontal: { w: 16, h: 8, d: 'M0 6 L4 2 L8 6 L12 2 L16 6' },
    vertical: { w: 8, h: 16, d: 'M6 0 L2 4 L6 8 L2 12 L6 16' },
  },
}

function DecorativePattern({ variant, horizontal }: { variant: SeparatorVariant; horizontal: boolean }) {
  const patternId = React.useId()
  const config = decorativeVariants[variant]
  if (!config) return null

  const { w, h, d } = horizontal ? config.horizontal : config.vertical

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="block"
      width={horizontal ? '100%' : w}
      height={horizontal ? h : '100%'}
    >
      <pattern id={patternId} width={w} height={h} patternUnits="userSpaceOnUse">
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeWidth: \`calc(var(--border-width) * \${config.strokeScale})\` }}
        />
      </pattern>
      <rect width="100%" height="100%" fill={\`url(#\${patternId})\`} />
    </svg>
  )
}

type SeparatorProps = React.ComponentProps<typeof BaseSeparator> & {
  /**
   * Line style. \`gradient\`, \`wave\`, \`zigzag\`, and \`dotted\` are decorative.
   * @default 'solid'
   */
  variant?: SeparatorVariant
}

function Separator({ className, orientation = 'horizontal', variant = 'solid', children, ...props }: SeparatorProps) {
  const isDecorative = variant in decorativeVariants

  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'text-border shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:self-stretch',
        separatorVariants[variant],
        className,
      )}
      {...props}
    >
      {isDecorative ? <DecorativePattern variant={variant} horizontal={orientation === 'horizontal'} /> : children}
    </BaseSeparator>
  )
}

export { Separator }
export type { SeparatorProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">separator</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-skeleton`,
    name: `Skeleton (Appica)`,
    category: `Loading UI`,
    tags: [`loader`, `appica`],
    code: `// ─── skeleton/skeleton.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'

type SkeletonEffect = 'shimmer' | 'pulse' | 'none'

interface SkeletonProps extends React.ComponentProps<'div'> {
  /**
   * Animation played while the placeholder is visible. All effects honor \`prefers-reduced-motion\`.
   * @default 'shimmer'
   */
  effect?: SkeletonEffect
}

const effectClasses: Record<SkeletonEffect, string> = {
  shimmer: 'skeleton-shimmer',
  pulse: 'motion-safe:animate-pulse',
  none: '',
}

function Skeleton({ effect = 'shimmer', className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      data-effect={effect}
      aria-hidden="true"
      className={cn(
        'text-foreground-muted relative block shrink-0 overflow-hidden rounded-md bg-current/10 backdrop-blur-xl',
        effectClasses[effect],
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
export type { SkeletonProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">skeleton</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-slider`,
    name: `Slider (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── slider/slider.tsx ───
'use client'

import * as React from 'react'
import { Slider as BaseSlider } from '@base-ui/react/slider'
import { AnimatePresence, LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { useReducedMotion } from '../../hooks/use-reduced-motion'

type SliderTooltipVisibility = 'always' | 'auto' | 'never'

type AnimDirection = 'up' | 'down'

const TOOLTIP_TILT_DEG = 8
const TOOLTIP_TILT_TRANSITION = {
  duration: 0.4,
  ease: [0.34, 1.56, 0.64, 1] satisfies [number, number, number, number],
}

const TOOLTIP_POPUP_TRANSITION = {
  duration: 0.2,
  ease: [0.175, 0.885, 0.32, 1.5] satisfies [number, number, number, number],
}

const tooltipWrapperClasses =
  'absolute z-10 pointer-events-none transition-transform duration-250 group-hover:scale-110 group-focus-within:scale-110 motion-reduce:transition-none data-[orientation=horizontal]:bottom-full data-[orientation=horizontal]:left-1/2 data-[orientation=horizontal]:-translate-x-1/2 data-[orientation=horizontal]:mb-1 data-[orientation=horizontal]:origin-bottom data-[orientation=vertical]:top-1/2 data-[orientation=vertical]:-translate-y-1/2 data-[orientation=vertical]:inset-s-full data-[orientation=vertical]:ms-1 data-[orientation=vertical]:ltr:origin-left data-[orientation=vertical]:rtl:origin-right'

const tooltipInnerClasses =
  'bg-background-inverse text-foreground-inverse rounded-4xs block px-1 py-0.5 text-xs leading-none whitespace-nowrap data-[orientation=horizontal]:origin-bottom data-[orientation=vertical]:ltr:origin-left data-[orientation=vertical]:rtl:origin-right'

interface SliderTooltipProps {
  index: number
  visibility: 'always' | 'auto'
  orientation: 'horizontal' | 'vertical'
  changeVersion: number
  direction: AnimDirection
  dirSign: 1 | -1
  reduced: boolean
  open: boolean
}

function SliderTooltip({
  index,
  visibility,
  orientation,
  changeVersion,
  direction,
  dirSign,
  reduced,
  open,
}: SliderTooltipProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>()

  React.useEffect(() => {
    if (reduced || changeVersion === 0 || !scope.current) return
    const sign = direction === 'up' ? 1 : -1
    const tilt = -sign * dirSign * TOOLTIP_TILT_DEG
    animate(scope.current, { rotate: [tilt, 0] }, TOOLTIP_TILT_TRANSITION)
  }, [changeVersion, direction, dirSign, reduced, animate, scope])

  const visible = visibility === 'always' || open

  return (
    <span data-slot="slider-tooltip-wrapper" data-orientation={orientation} className={tooltipWrapperClasses}>
      <AnimatePresence>
        {visible && (
          <m.div
            ref={scope}
            data-slot="slider-tooltip"
            data-orientation={orientation}
            aria-hidden="true"
            className={tooltipInnerClasses}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={reduced ? { duration: 0 } : TOOLTIP_POPUP_TRANSITION}
          >
            <BaseSlider.Value>
              {(formattedValues) => <span className="leading-none">{formattedValues?.[index] ?? ''}</span>}
            </BaseSlider.Value>
          </m.div>
        )}
      </AnimatePresence>
    </span>
  )
}

const thumbClasses =
  'group relative block size-3 shrink-0 cursor-default rounded-full select-none disabled:pointer-events-none disabled:opacity-disabled'

const thumbVisualClasses =
  'bg-background border-primary relative block size-full rounded-full border-2 shadow-xs transition-transform duration-250 group-hover:scale-125 group-focus-within:scale-125 motion-reduce:transition-none'

interface SliderThumbProps {
  index: number
  ariaLabel?: string
  tooltipVisibility: SliderTooltipVisibility
  orientation: 'horizontal' | 'vertical'
  changeVersion: number
  direction: AnimDirection
  dirSign: 1 | -1
  reduced: boolean
}

function SliderThumb({
  index,
  ariaLabel,
  tooltipVisibility,
  orientation,
  changeVersion,
  direction,
  dirSign,
  reduced,
}: SliderThumbProps) {
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)

  const autoOpen = tooltipVisibility === 'auto' && (hovered || focused)

  const eventHandlers =
    tooltipVisibility === 'auto'
      ? {
          onPointerEnter: () => setHovered(true),
          onPointerLeave: () => setHovered(false),
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        }
      : {}

  return (
    <BaseSlider.Thumb
      index={index}
      aria-label={ariaLabel}
      data-slot="slider-thumb"
      className={thumbClasses}
      {...eventHandlers}
    >
      <span data-slot="slider-thumb-visual" className={thumbVisualClasses} />
      {tooltipVisibility !== 'never' && (
        <SliderTooltip
          index={index}
          visibility={tooltipVisibility}
          orientation={orientation}
          changeVersion={changeVersion}
          direction={direction}
          dirSign={dirSign}
          reduced={reduced}
          open={autoOpen}
        />
      )}
    </BaseSlider.Thumb>
  )
}

const rootClasses =
  'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-fit'

const controlClasses =
  'relative flex w-full touch-none items-center select-none data-disabled:opacity-disabled data-disabled:pointer-events-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col'

const trackClasses =
  'relative grow overflow-hidden rounded-full bg-background-strong select-none data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'

const indicatorClasses =
  'bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'

interface SliderProps extends Omit<BaseSlider.Root.Props, 'children'> {
  /**
   * When the value tooltip shows - on interaction, always, or never.
   * @default 'auto'
   */
  tooltipVisibility?: SliderTooltipVisibility
  /** Accessible name for each thumb. Use a function to name range ends. */
  thumbAriaLabel?: string | ((index: number) => string)
}

function toArray(value: number | readonly number[] | undefined): number[] {
  if (value == null) return []
  return Array.isArray(value) ? [...value] : [value as number]
}

function Slider({
  tooltipVisibility = 'auto',
  thumbAriaLabel,
  className,
  value,
  defaultValue,
  orientation = 'horizontal',
  onValueChange,
  ...rootProps
}: SliderProps) {
  const direction = useDirection()
  const dirSign: 1 | -1 = direction === 'rtl' ? -1 : 1
  const reduced = useReducedMotion()

  const seed = value ?? defaultValue
  const thumbCount = Array.isArray(seed) ? seed.length : 1

  const trackTooltips = tooltipVisibility !== 'never'

  const prevValuesRef = React.useRef<number[]>(toArray(seed))
  const [tilts, setTilts] = React.useState<Array<{ direction: AnimDirection; version: number }>>(() =>
    Array.from({ length: thumbCount }, () => ({ direction: 'up', version: 0 })),
  )

  const handleValueChange: NonNullable<typeof onValueChange> = (next, details) => {
    if (trackTooltips) {
      const nextArr = toArray(next)
      const prevArr = prevValuesRef.current
      prevValuesRef.current = nextArr
      setTilts((prev) => {
        let changed = false
        const updated = nextArr.map((_, i) => {
          const existing = prev[i] ?? { direction: 'up' as AnimDirection, version: 0 }
          const p = prevArr[i] ?? 0
          const c = nextArr[i] ?? p
          if (c === p) return existing
          changed = true
          return { direction: (c > p ? 'up' : 'down') as AnimDirection, version: existing.version + 1 }
        })
        return changed || updated.length !== prev.length ? updated : prev
      })
    }
    onValueChange?.(next, details)
  }

  const resolveAriaLabel = (index: number): string | undefined => {
    if (typeof thumbAriaLabel === 'function') return thumbAriaLabel(index)
    return thumbAriaLabel
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseSlider.Root
        data-slot="slider"
        orientation={orientation}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(rootClasses, className)}
        {...rootProps}
      >
        <BaseSlider.Control data-slot="slider-control" className={controlClasses}>
          <BaseSlider.Track data-slot="slider-track" className={trackClasses}>
            <BaseSlider.Indicator data-slot="slider-indicator" className={indicatorClasses} />
          </BaseSlider.Track>
          {Array.from({ length: thumbCount }).map((_, i) => (
            <SliderThumb
              key={i}
              index={i}
              ariaLabel={resolveAriaLabel(i)}
              tooltipVisibility={tooltipVisibility}
              orientation={orientation}
              changeVersion={tilts[i]?.version ?? 0}
              direction={tilts[i]?.direction ?? 'up'}
              dirSign={dirSign}
              reduced={reduced}
            />
          ))}
        </BaseSlider.Control>
      </BaseSlider.Root>
    </LazyMotion>
  )
}

export { Slider }
export type { SliderProps, SliderTooltipVisibility }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">slider</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-sparkline`,
    name: `Sparkline (Appica)`,
    category: `Components`,
    tags: [`sparkline`, `appica`],
    code: `// ─── sparkline/sparkline.tsx ───
'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'

type SparklineVariant = 'line' | 'area' | 'column'

interface SparklinePoint {
  index: number
  value: number
  label?: string
}

interface SparklineContextValue {
  data: number[]
  labels?: string[]
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
  format?: Intl.NumberFormatOptions
  locale?: Intl.LocalesArgument
}

const SparklineContext = React.createContext<SparklineContextValue | null>(null)

function useSparkline(): SparklineContextValue {
  const ctx = React.useContext(SparklineContext)
  if (ctx === null) {
    throw new Error('Sparkline parts must be rendered inside <Sparkline>.')
  }
  return ctx
}

interface SparklineProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** **Required.** The series to plot. */
  data: number[]
  /** Per-point labels (e.g. dates), surfaced in the tooltip and to \`SparklineLabel\`. */
  labels?: string[]
  /**
   * Accent for the line, fill, indicator, and tooltip swatch. Any CSS color.
   * @default var(--primary)
   */
  color?: string
  /** Formatting for displayed values (\`SparklineValue\`, tooltip). */
  format?: Intl.NumberFormatOptions
  /** Locale used by \`Intl.NumberFormat\`. */
  locale?: Intl.LocalesArgument
  /** Fires when the hovered point changes; \`null\` on pointer leave. */
  onActiveChange?: (point: SparklinePoint | null) => void
}

function Sparkline({
  data,
  labels,
  color,
  format,
  locale,
  onActiveChange,
  className,
  style,
  children,
  ...props
}: SparklineProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const onActiveChangeRef = React.useRef(onActiveChange)
  const dataRef = React.useRef(data)
  const labelsRef = React.useRef(labels)
  React.useEffect(() => {
    onActiveChangeRef.current = onActiveChange
    dataRef.current = data
    labelsRef.current = labels
  })

  const notifiedMountRef = React.useRef(false)
  React.useEffect(() => {
    if (!notifiedMountRef.current) {
      notifiedMountRef.current = true
      return
    }
    const cb = onActiveChangeRef.current
    if (!cb) return
    if (activeIndex === null) {
      cb(null)
      return
    }
    cb({ index: activeIndex, value: dataRef.current[activeIndex]!, label: labelsRef.current?.[activeIndex] })
  }, [activeIndex])

  const ctx = React.useMemo<SparklineContextValue>(
    () => ({ data, labels, activeIndex, setActiveIndex, format, locale }),
    [data, labels, activeIndex, format, locale],
  )

  const rootStyle = { ...style, '--sparkline-color': color ?? 'var(--primary)' } as React.CSSProperties

  return (
    <SparklineContext.Provider value={ctx}>
      <div data-slot="sparkline" className={cn('flex flex-col gap-1.5', className)} style={rootStyle} {...props}>
        {children}
      </div>
    </SparklineContext.Provider>
  )
}

interface SparklineChartProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * The layout.
   * @default 'line'
   */
  variant?: SparklineVariant
  /**
   * Line smoothing from \`0\` (straight) to \`1\` (fully rounded). Line/area only.
   * @default 0.5
   */
  curve?: number
  /**
   * **\`line\` only.** Add a gradient fill from the line to the bottom edge. Area is always filled.
   * @default false
   */
  fill?: boolean
  /**
   * The pivot the fill/bars grow from; values below it render below. Area and column.
   * @default 0
   */
  baseline?: number
  /**
   * Chart height, in pixels.
   * @default 48
   */
  height?: number
  /**
   * Line thickness, in pixels. Line/area only.
   * @default 2
   */
  strokeWidth?: number
  /**
   * Show the hover indicator (dot + guide, or the active-column highlight).
   * @default true
   */
  indicator?: boolean
  /**
   * Float a tooltip at the hovered point.
   * @default false
   */
  tooltip?: boolean
  /** Render custom tooltip content instead of the default swatch + value. Implies \`tooltip\`. */
  renderTooltip?: (point: SparklinePoint) => React.ReactNode
}

function SparklineChart({
  variant = 'line',
  curve = 0.5,
  fill = false,
  baseline = 0,
  height = 48,
  strokeWidth = 2,
  indicator = true,
  tooltip = false,
  renderTooltip,
  className,
  style,
  role = 'img',
  'aria-label': ariaLabel,
  ...props
}: SparklineChartProps) {
  const { data, labels, activeIndex, setActiveIndex, format, locale } = useSparkline()
  const dir = useDirection()
  const isRtl = dir === 'rtl'
  const gradientId = React.useId()
  const n = data.length

  const showTooltip = tooltip || renderTooltip !== undefined
  const interactive = indicator || showTooltip

  const rectRef = React.useRef<DOMRect | null>(null)
  React.useEffect(() => {
    if (!interactive) return
    const invalidate = () => {
      rectRef.current = null
    }
    window.addEventListener('scroll', invalidate, true)
    window.addEventListener('resize', invalidate)
    return () => {
      window.removeEventListener('scroll', invalidate, true)
      window.removeEventListener('resize', invalidate)
    }
  }, [interactive])

  const geom = React.useMemo(() => {
    if (variant === 'column' || n === 0) return null
    const isArea = variant === 'area'
    const [dataMin, dataMax] = getExtent(data)
    const lo = isArea ? Math.min(baseline, dataMin) : dataMin
    const hi = isArea ? Math.max(baseline, dataMax) : dataMax
    const span = hi - lo || 1
    const inset = strokeWidth + 1
    const plot = height - inset * 2
    const yOf = (value: number) => inset + (1 - (value - lo) / span) * plot
    const points = data.map<PathPoint>((value, i) => {
      const frac = n === 1 ? 0.5 : i / (n - 1)
      const xFrac = isRtl ? 1 - frac : frac
      const y = yOf(value)
      return { x: round(xFrac * 100), y: round(y), leftFrac: xFrac, topFrac: y / height }
    })
    const d = buildLinePath(points, clamp01(curve))
    const foot = isArea ? round(yOf(baseline)) : height
    const fillPath = \`\${d} L \${points[n - 1]!.x} \${foot} L \${points[0]!.x} \${foot} Z\`
    return { d, fillPath, points, baselineY: isArea ? round(yOf(baseline)) : null }
  }, [data, variant, curve, height, strokeWidth, baseline, isRtl, n])

  const columns = React.useMemo(() => {
    if (variant !== 'column' || n === 0) return null
    const [dataMin, dataMax] = getExtent(data)
    const lo = Math.min(baseline, dataMin)
    const hi = Math.max(baseline, dataMax)
    const span = hi - lo || 1
    const baseFrac = (hi - baseline) / span
    const bars = data.map((value, i) => {
      const valueFrac = (hi - value) / span
      const center = (i + 0.5) / n
      return {
        top: round(Math.min(valueFrac, baseFrac) * 100),
        size: round(Math.abs(valueFrac - baseFrac) * 100),
        positive: value >= baseline,
        leftFrac: isRtl ? 1 - center : center,
        topFrac: valueFrac,
      }
    })
    return { bars, baseFrac }
  }, [data, variant, baseline, isRtl, n])

  if (n === 0) return null

  const showFill = geom !== null && (variant === 'area' || fill)
  const gradientFill = variant === 'line'

  const active = interactive && activeIndex !== null && activeIndex >= 0 && activeIndex < n ? activeIndex : null
  const marker = active === null ? null : geom ? geom.points[active] : columns!.bars[active]
  const activePoint: SparklinePoint | null =
    active === null ? null : { index: active, value: data[active]!, label: labels?.[active] }

  function updateActiveFromEvent(event: React.PointerEvent<HTMLDivElement>, fresh: boolean) {
    const rect =
      fresh || rectRef.current === null
        ? (rectRef.current = event.currentTarget.getBoundingClientRect())
        : rectRef.current
    if (rect.width === 0) return
    let t = clamp01((event.clientX - rect.left) / rect.width)
    if (isRtl) t = 1 - t
    const index = variant === 'column' ? Math.min(n - 1, Math.floor(t * n)) : Math.round(t * (n - 1))
    setActiveIndex(index)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    updateActiveFromEvent(event, true)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    updateActiveFromEvent(event, false)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    rectRef.current = null
    if (event.pointerType !== 'mouse') setActiveIndex(null)
  }

  return (
    <div
      role={role}
      aria-label={ariaLabel ?? \`\${variant} chart\`}
      className={cn('relative w-full', className)}
      style={{ height, touchAction: interactive ? 'pan-y' : undefined, ...style }}
      onPointerDown={interactive ? handlePointerDown : undefined}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerLeave={interactive ? () => setActiveIndex(null) : undefined}
      onPointerUp={interactive ? handlePointerUp : undefined}
      onPointerCancel={interactive ? handlePointerUp : undefined}
      {...props}
    >
      {geom ? (
        <svg
          data-slot="sparkline-svg"
          width="100%"
          height={height}
          viewBox={\`0 0 100 \${height}\`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block overflow-visible"
        >
          {showFill && gradientFill ? (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sparkline-color)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--sparkline-color)" stopOpacity={0} />
              </linearGradient>
            </defs>
          ) : null}
          {showFill ? (
            <path
              data-slot="sparkline-fill"
              d={geom.fillPath}
              fill={gradientFill ? \`url(#\${gradientId})\` : 'var(--sparkline-color)'}
              fillOpacity={gradientFill ? 1 : 0.18}
            />
          ) : null}
          {geom.baselineY !== null ? (
            <line
              data-slot="sparkline-baseline"
              x1="0"
              y1={geom.baselineY}
              x2="100"
              y2={geom.baselineY}
              className="stroke-border"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <path
            data-slot="sparkline-line"
            d={geom.d}
            fill="none"
            stroke="var(--sparkline-color)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <>
          <div dir="ltr" className={cn('flex h-full items-stretch gap-[3%]', isRtl && 'flex-row-reverse')}>
            {columns!.bars.map((bar, i) => (
              <div
                key={i}
                data-active={(indicator && active === i) || undefined}
                className="rounded-3xs data-active:bg-background-strong relative h-full flex-1"
              >
                <div
                  data-slot="sparkline-column"
                  className={cn(
                    'absolute inset-x-0 bg-(--sparkline-color) motion-safe:transition-all motion-safe:duration-300',
                    bar.positive ? 'rounded-t-[min(var(--radius-3xs),35%)]' : 'rounded-b-[min(var(--radius-3xs),35%)]',
                  )}
                  style={{ top: \`\${bar.top}%\`, height: \`\${bar.size}%\` }}
                />
              </div>
            ))}
          </div>
          <span
            aria-hidden="true"
            data-slot="sparkline-baseline"
            className="bg-border pointer-events-none absolute inset-x-0 h-px -translate-y-1/2"
            style={{ top: \`\${round(columns!.baseFrac * 100)}%\` }}
          />
        </>
      )}

      {marker && indicator && geom ? (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-(--sparkline-color) opacity-25 motion-safe:transition-[left] motion-safe:duration-150"
            style={{ left: \`\${marker.leftFrac * 100}%\` }}
          />
          <span
            aria-hidden="true"
            className="ring-background pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sparkline-color) ring-2 motion-safe:transition-all motion-safe:duration-150"
            style={{ left: \`\${marker.leftFrac * 100}%\`, top: \`\${marker.topFrac * 100}%\` }}
          />
        </>
      ) : null}

      {marker && showTooltip && activePoint ? (
        <div
          data-slot="sparkline-tooltip"
          aria-hidden="true"
          className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full pb-2 motion-safe:transition-[left,top] motion-safe:duration-150"
          style={{ left: \`\${marker.leftFrac * 100}%\`, top: \`\${marker.topFrac * 100}%\` }}
        >
          {renderTooltip ? (
            renderTooltip(activePoint)
          ) : (
            <div className="border-border-overlay bg-background text-foreground-intense rounded-2xs flex items-center gap-1.5 border px-2 py-1 text-xs whitespace-nowrap shadow-md">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px] bg-(--sparkline-color)" />
              {activePoint.label ? <span className="text-foreground-muted">{activePoint.label}</span> : null}
              <span className="font-medium tabular-nums">{formatNumber(activePoint.value, format, locale)}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

type SparklineValueProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** Render function to fully customize the displayed text. Omit for the number. */
  children?: (formatted: string, value: number) => React.ReactNode
}

function SparklineValue({ className, children, ...props }: SparklineValueProps) {
  const { data, activeIndex, format, locale } = useSparkline()
  const index = activeIndex ?? data.length - 1
  const value = data[index] ?? NaN
  const formatted = formatNumber(value, format, locale)
  return (
    <span
      data-slot="sparkline-value"
      className={cn('text-foreground-intense text-sm font-semibold tabular-nums', className)}
      {...props}
    >
      {children ? children(formatted, value) : formatted}
    </span>
  )
}

type SparklineLabelProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** Render function to customize the displayed text. Omit for the raw label. */
  children?: (label: string, point: SparklinePoint) => React.ReactNode
}

function SparklineLabel({ className, children, ...props }: SparklineLabelProps) {
  const { data, labels, activeIndex } = useSparkline()
  if (!labels) return null
  const index = activeIndex ?? data.length - 1
  const label = labels[index] ?? ''
  return (
    <span data-slot="sparkline-label" className={cn('text-foreground-muted text-xs', className)} {...props}>
      {children ? children(label, { index, value: data[index] ?? NaN, label }) : label}
    </span>
  )
}

interface PathPoint {
  x: number
  y: number
  leftFrac: number
  topFrac: number
}

function getExtent(data: number[]): [number, number] {
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < data.length; i++) {
    const v = data[i]!
    if (v < min) min = v
    if (v > max) max = v
  }
  return [min, max]
}

function buildLinePath(points: PathPoint[], smoothing: number): string {
  if (points.length === 0) return ''
  let d = \`M \${points[0]!.x} \${points[0]!.y}\`
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p0 = points[i - 1] ?? p1
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * smoothing
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * smoothing
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * smoothing
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * smoothing
    d += \` C \${round(cp1x)} \${round(cp1y)}, \${round(cp2x)} \${round(cp2y)}, \${p2.x} \${p2.y}\`
  }
  return d
}

const numberFormatCache = new Map<string, Intl.NumberFormat>()

function getNumberFormat(format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): Intl.NumberFormat {
  const cacheKey = JSON.stringify([locale ?? '', format ?? {}])
  let formatter = numberFormatCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, format)
    numberFormatCache.set(cacheKey, formatter)
  }
  return formatter
}

function formatNumber(value: number, format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): string {
  if (!Number.isFinite(value)) return ''
  return getNumberFormat(format, locale).format(value)
}

const round = (n: number) => Math.round(n * 100) / 100
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export { Sparkline, SparklineChart, SparklineValue, SparklineLabel }
export type { SparklineProps, SparklineChartProps, SparklineValueProps, SparklineLabelProps, SparklinePoint }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">sparkline</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-spinner`,
    name: `Spinner (Appica)`,
    category: `Loading UI`,
    tags: [`loader`, `appica`],
    code: `// ─── spinner/spinner.tsx ───
'use client'

import * as React from 'react'
import { animate, LazyMotion, domAnimation, m, useMotionValue, useTransform } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'

type SpinnerVariant = 'circular' | 'dots' | 'sparkle'

interface SpinnerProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /**
   * The animated shape.
   * @default 'circular'
   */
  variant?: SpinnerVariant
  /**
   * Inherit the surrounding text color (\`currentColor\`) instead of the primary accent.
   * @default false
   */
  currentColor?: boolean
}

type VariantColors = { indicator: string; track: string }
type VariantInnerProps = { colors: VariantColors; reduced: boolean }

const SPINNER_SIZE = 'text-[2.5rem]'

const PRIMARY_COLORS: VariantColors = { indicator: 'text-primary', track: 'text-primary-soft' }
const CURRENT_COLORS: VariantColors = { indicator: 'text-current', track: 'text-current/20' }

function Circular({ colors, reduced }: VariantInnerProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('size-[1em] stroke-4!', colors.indicator)}
    >
      <circle cx="20" cy="20" r="16" className={colors.track} />
      {reduced ? (
        <circle cx="20" cy="20" r="16" pathLength={1} strokeDasharray="0.25 0.75" />
      ) : (
        <m.circle
          cx="20"
          cy="20"
          r="16"
          pathLength={1}
          strokeDasharray="0.25 0.75"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -1 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </svg>
  )
}

const DOT_COUNT = 12
const DOT_CYCLE = 1.2

function Dots({ colors, reduced }: VariantInnerProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="currentColor"
      aria-hidden="true"
      className={cn('size-[1em]', colors.indicator)}
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => {
        const angle = i * (360 / DOT_COUNT)
        const sharedProps = {
          x: 18,
          y: 2,
          width: 4,
          height: 6,
          rx: 2,
          transform: \`rotate(\${angle} 20 20)\`,
        } as const

        return reduced ? (
          <rect key={i} {...sharedProps} opacity={0.25} />
        ) : (
          <m.rect
            key={i}
            {...sharedProps}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 0] }}
            transition={{
              duration: DOT_CYCLE,
              repeat: Infinity,
              ease: 'linear',
              delay: (i / DOT_COUNT) * DOT_CYCLE - DOT_CYCLE,
              times: [0, 0.1, 0.5, 1],
            }}
          />
        )
      })}
    </svg>
  )
}

const SPARKLE_MORPH_PATH =
  'M12.846 3.581C12.711 3.231 12.375 3 12 3C11.625 3 11.278 3.263 11.154 3.581C10.604 5.011 10.054 6.442 9.504 7.872C8.752 8.16 8.159 8.752 7.871 9.504C6.441 10.054 5.011 10.604 3.581 11.154C3.41 11.22 3.263 11.336 3.159 11.487C3.055 11.638 3 11.817 3 12C3 12.183 3.056 12.362 3.159 12.513C3.262 12.664 3.41 12.78 3.581 12.846C5.011 13.396 6.442 13.946 7.872 14.496C8.16 15.248 8.752 15.841 9.504 16.129C10.054 17.559 10.604 18.989 11.154 20.419C11.22 20.59 11.336 20.737 11.487 20.841C11.638 20.945 11.817 21 12 21C12.183 21 12.362 20.945 12.513 20.841C12.664 20.737 12.78 20.59 12.846 20.419C13.396 18.989 13.946 17.559 14.496 16.129C15.248 15.841 15.841 15.248 16.129 14.496C17.559 13.946 18.989 13.396 20.419 12.846C20.59 12.78 20.737 12.664 20.841 12.513C20.945 12.362 21 12.183 21 12C21 11.817 20.945 11.638 20.841 11.487C20.737 11.336 20.59 11.22 20.419 11.154C18.989 10.604 17.559 10.054 16.129 9.504C15.841 8.752 15.248 8.16 14.496 7.871C13.946 6.441 13.396 5.011 12.846 3.581Z'

const SQUARE_MORPH_PATH =
  'M12.704 5C12.469 5 12.235 5 12 5C11.765 5 11.531 5 11.296 5C10.161 5.053 9.025 5.106 7.889 5.159C6.979 6.069 6.069 6.979 5.159 7.889C5.106 9.025 5.053 10.161 5 11.296C5 11.395 5 11.494 5 11.593C5 11.729 5 11.864 5 12C5 12.136 5 12.271 5 12.407C5 12.506 5 12.605 5 12.704C5.053 13.839 5.106 14.975 5.159 16.111C6.069 17.021 6.979 17.931 7.889 18.841C9.025 18.894 10.161 18.947 11.296 19C11.395 19 11.494 19 11.593 19C11.729 19 11.864 19 12 19C12.136 19 12.271 19 12.407 19C12.506 19 12.605 19 12.704 19C13.839 18.947 14.975 18.894 16.111 18.841C17.021 17.931 17.931 17.021 18.841 16.111C18.894 14.975 18.947 13.839 19 12.704C19 12.605 19 12.506 19 12.407C19 12.271 19 12.136 19 12C19 11.864 19 11.729 19 11.593C19 11.494 19 11.395 19 11.296C18.947 10.161 18.894 9.025 18.841 7.889C17.931 6.979 17.021 6.069 16.111 5.159C14.975 5.106 13.839 5.053 12.704 5Z'

function parsePathNumbers(d: string): number[] {
  return d.match(/-?\\d+(?:\\.\\d+)?/g)?.map(Number) ?? []
}

const SPARKLE_NUMBERS = parsePathNumbers(SPARKLE_MORPH_PATH)
const SQUARE_NUMBERS = parsePathNumbers(SQUARE_MORPH_PATH)
const MORPH_CUBIC_COUNT = (SPARKLE_NUMBERS.length - 2) / 6

function buildSparklePath(nums: number[]): string {
  let d = \`M\${nums[0]} \${nums[1]}\`
  for (let i = 0; i < MORPH_CUBIC_COUNT; i++) {
    const o = 2 + i * 6
    d += \`C\${nums[o]} \${nums[o + 1]} \${nums[o + 2]} \${nums[o + 3]} \${nums[o + 4]} \${nums[o + 5]}\`
  }
  return d + 'Z'
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const SPARKLE_CYCLE = 2.5
const SPARKLE_MORPH_END = 0.4

function Sparkle({ colors, reduced }: VariantInnerProps) {
  const progress = useMotionValue(0)

  React.useEffect(() => {
    if (reduced) return
    const controls = animate(progress, 1, {
      duration: SPARKLE_CYCLE,
      repeat: Infinity,
      ease: 'linear',
    })
    return () => controls.stop()
  }, [reduced, progress])

  const d = useTransform(progress, (t) => {
    if (t < SPARKLE_MORPH_END / 2) {
      const sub = easeInOut(t / (SPARKLE_MORPH_END / 2))
      return buildSparklePath(SPARKLE_NUMBERS.map((a, i) => lerp(a, SQUARE_NUMBERS[i]!, sub)))
    }
    if (t < SPARKLE_MORPH_END) {
      const sub = easeInOut((t - SPARKLE_MORPH_END / 2) / (SPARKLE_MORPH_END / 2))
      return buildSparklePath(SQUARE_NUMBERS.map((a, i) => lerp(a, SPARKLE_NUMBERS[i]!, sub)))
    }
    return SPARKLE_MORPH_PATH
  })

  const rotate = useTransform(progress, (t) => (t < SPARKLE_MORPH_END ? easeInOut(t / SPARKLE_MORPH_END) * 360 : 360))

  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('size-[1em]', colors.indicator)}
    >
      {reduced ? <path d={SPARKLE_MORPH_PATH} /> : <m.path d={d} style={{ transformOrigin: '12px 12px', rotate }} />}
    </svg>
  )
}

const VARIANT_COMPONENTS: Record<SpinnerVariant, React.ComponentType<VariantInnerProps>> = {
  circular: Circular,
  dots: Dots,
  sparkle: Sparkle,
}

function Spinner({
  variant = 'circular',
  currentColor = false,
  'aria-label': ariaLabel = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  const reduced = useReducedMotion()
  const colors = currentColor ? CURRENT_COLORS : PRIMARY_COLORS
  const Variant = VARIANT_COMPONENTS[variant]

  const inner = <Variant colors={colors} reduced={reduced} />

  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label={ariaLabel}
      className={cn('inline-flex shrink-0 items-center justify-center align-middle', SPINNER_SIZE, className)}
      {...props}
    >
      {reduced ? (
        inner
      ) : (
        <LazyMotion features={domAnimation} strict>
          {inner}
        </LazyMotion>
      )}
    </span>
  )
}

export { Spinner }
export type { SpinnerProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">spinner</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-switch`,
    name: `Switch (Appica)`,
    category: `Forms`,
    tags: [`form`, `input`, `appica`],
    code: `// ─── switch/switch.tsx ───
'use client'

import * as React from 'react'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { useDirection } from '../../hooks/use-direction'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn, useComposedRefs } from '../../internal/utils'

const switchSizes = {
  sm: {
    root: 'h-4 w-7.5',
    thumb: 'size-3',
    thumbWidthKeyframes: ['0.75rem', '1.25rem', '0.75rem'],
    thumbXKeyframes: [0, '0.3125rem', '0.875rem'],
    check: 'size-2.5',
  },
  md: {
    root: 'h-5 w-9.5',
    thumb: 'size-4',
    thumbWidthKeyframes: ['1rem', '1.6875rem', '1rem'],
    thumbXKeyframes: [0, '0.4375rem', '1.125rem'],
    check: 'size-3',
  },
  lg: {
    root: 'h-6 w-11.5',
    thumb: 'size-5',
    thumbWidthKeyframes: ['1.25rem', '2.125rem', '1.25rem'],
    thumbXKeyframes: [0, '0.5rem', '1.375rem'],
    check: 'size-4',
  },
} as const

type SwitchSize = keyof typeof switchSizes
type SizeConfig = (typeof switchSizes)[SwitchSize]

const THUMB_TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number] }

type Keyframe = number | string

function applyDirection(keyframes: ReadonlyArray<Keyframe>, dirSign: 1 | -1): Keyframe[] {
  if (dirSign === 1) return [...keyframes]
  return keyframes.map((v) => (typeof v === 'number' ? -v : \`-\${v}\`))
}

function SwitchThumb({
  renderProps,
  state,
  dirSign,
  sizeConfig,
  reduced,
}: {
  renderProps: React.ComponentPropsWithRef<'span'>
  state: { checked: boolean }
  dirSign: 1 | -1
  sizeConfig: SizeConfig
  reduced: boolean
}) {
  const { checked } = state
  const { ref, onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, ...htmlProps } = renderProps

  const xKeyframes = React.useMemo(() => {
    const directional = applyDirection(sizeConfig.thumbXKeyframes, dirSign)
    return checked ? directional : directional.reverse()
  }, [checked, dirSign, sizeConfig])

  const xFinal = xKeyframes[xKeyframes.length - 1]

  const [scope, animate] = useAnimate()
  const composedRef = useComposedRefs(ref, scope)
  const prevChecked = React.useRef(checked)
  React.useEffect(() => {
    const toggled = prevChecked.current !== checked
    prevChecked.current = checked
    if (toggled && !reduced) {
      animate(scope.current, { x: xKeyframes, width: sizeConfig.thumbWidthKeyframes }, THUMB_TRANSITION)
    } else {
      animate(scope.current, { x: xFinal }, { duration: 0 })
    }
  }, [checked, sizeConfig, animate, scope, reduced, xKeyframes, xFinal])

  return (
    <m.span {...htmlProps} ref={composedRef} initial={{ x: xFinal }}>
      <m.svg
        className={cn('text-foreground-intense', sizeConfig.check)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 12 }}
        initial={false}
        animate={{ strokeDashoffset: checked ? 0 : 12 }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                strokeDashoffset: {
                  duration: checked ? 0.3 : 0,
                  ease: 'easeOut',
                  delay: checked ? 0.25 : 0,
                },
              }
        }
      >
        <path d="M3 6l2 2 4-4" />
      </m.svg>
    </m.span>
  )
}

interface SwitchProps extends React.ComponentProps<typeof BaseSwitch.Root> {
  /**
   * Scales the track and thumb together.
   * @default 'md'
   */
  size?: SwitchSize
}

function Switch({ className, size = 'md', ...props }: SwitchProps) {
  const direction = useDirection()
  const dirSign: 1 | -1 = direction === 'rtl' ? -1 : 1
  const sizeConfig = switchSizes[size]
  const reduced = useReducedMotion()

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseSwitch.Root
        data-slot="switch"
        className={cn(
          'bg-background-strong outline-ring flex shrink-0 rounded-full border border-transparent p-px outline-offset-1',
          sizeConfig.root,
          'transition-background duration-200 motion-reduce:transition-none',
          'data-checked:bg-primary data-checked:outline-ring-primary',
          'data-disabled:not-data-checked:border-border-strong data-disabled:opacity-disabled data-disabled:cursor-not-allowed data-disabled:not-data-checked:border-dashed',
          'data-invalid:border-error data-invalid:not-data-checked:bg-error-subtle data-invalid:outline-ring-error',
          className,
        )}
        {...props}
        {...(invalid ? { 'data-invalid': '' } : {})}
      >
        <BaseSwitch.Thumb
          data-slot="switch-thumb"
          className={cn(
            'group flex items-center justify-center rounded-full bg-white shadow-2xs',
            sizeConfig.thumb,
            'data-checked:bg-primary-foreground',
          )}
          render={(renderProps, state) => (
            <SwitchThumb
              renderProps={renderProps}
              state={state}
              dirSign={dirSign}
              sizeConfig={sizeConfig}
              reduced={reduced}
            />
          )}
        />
      </BaseSwitch.Root>
    </LazyMotion>
  )
}

export { Switch }
export type { SwitchProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">switch</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-table`,
    name: `Table (Appica)`,
    category: `Cards`,
    tags: [`card`, `appica`],
    code: `// ─── table/table.tsx ───
import * as React from 'react'
import { cn } from '../../internal/utils'

type TableSize = 'sm' | 'md' | 'lg'
type TableBorderStyle = 'solid' | 'dashed' | 'none'

const sizeOuter: Record<TableSize, string> = {
  sm: 'p-1 rounded-md text-xs',
  md: 'p-1.25 rounded-lg text-sm',
  lg: 'p-1.5 rounded-xl text-base',
}

const sizeCellPad: Record<TableSize, string> = {
  sm: '[&_th]:p-3 [&_td]:p-3',
  md: '[&_th]:p-3.5 [&_td]:p-3.5',
  lg: '[&_th]:p-4 [&_td]:p-4',
}

const sizeHeaderCorners: Record<TableSize, string> = {
  sm: '[&>thead>tr:first-child>th:first-child]:rounded-ss-sm [&>thead>tr:first-child>th:last-child]:rounded-se-sm [&>thead>tr:last-child>th:first-child]:rounded-es-sm [&>thead>tr:last-child>th:last-child]:rounded-ee-sm',
  md: '[&>thead>tr:first-child>th:first-child]:rounded-ss-md [&>thead>tr:first-child>th:last-child]:rounded-se-md [&>thead>tr:last-child>th:first-child]:rounded-es-md [&>thead>tr:last-child>th:last-child]:rounded-ee-md',
  lg: '[&>thead>tr:first-child>th:first-child]:rounded-ss-lg [&>thead>tr:first-child>th:last-child]:rounded-se-lg [&>thead>tr:last-child>th:first-child]:rounded-es-lg [&>thead>tr:last-child>th:last-child]:rounded-ee-lg',
}

const sizeBodyBottomCorners: Record<TableSize, string> = {
  sm: '[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-sm [&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-sm',
  md: '[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-md [&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-md',
  lg: '[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-lg [&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-lg',
}

const sizeBodyTopCornersNoHeader: Record<TableSize, string> = {
  sm: '[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-sm [&:not(:has(thead))>tbody:first-of-type>tr:first-child>:last-child]:rounded-se-sm',
  md: '[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-md [&:not(:has(thead))>tbody:first-of-type>tr:first-child>:last-child]:rounded-se-md',
  lg: '[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-lg [&:not(:has(thead))>tbody:first-of-type>tr:first-child>:last-child]:rounded-se-lg',
}

const borderStyleClasses: Record<TableBorderStyle, string> = {
  solid: '[&_td]:border-border [&>tbody_th]:border-border',
  dashed:
    '[&_td]:border-border-strong [&_td]:border-dashed [&>tbody_th]:border-border-strong [&>tbody_th]:border-dashed',
  none: '[&_td]:border-b-0 [&>tbody_th]:border-b-0',
}

const tableBaseClasses = cn(
  'w-full border-separate border-spacing-0 bg-background text-foreground border border-border-muted align-middle',
  '[&>thead>tr>th]:bg-background-muted',
  '[&>thead>tr>th]:text-foreground-intense [&>thead>tr>th]:font-medium',
  '[&>tbody_th]:text-foreground-intense [&>tbody_th]:font-medium [&>tbody_th]:border-b',
  '[&_td]:align-middle [&_td]:border-b',
  '[&>tbody:last-of-type>tr:last-child>td]:border-b-0',
  '[&>tbody:last-of-type>tr:last-child>th]:border-b-0',
  '[&>tbody>tr[data-highlighted]]:bg-background-subtle',
)

const stripedRowsClasses = '[&>tbody>tr:nth-child(2n)]:bg-background-subtle'
const stripedColumnsClasses = '[&>tbody>tr>:nth-child(2n)]:bg-background-subtle'
const rowHoverClasses =
  '[&>tbody>tr]:transition-colors [&>tbody>tr]:duration-200 motion-reduce:[&>tbody>tr]:transition-none [&>tbody>tr:hover]:bg-background-subtle'

interface TableProps extends React.ComponentPropsWithoutRef<'table'> {
  /**
   * Cell padding, corner radius, and text scale.
   * @default 'md'
   */
  size?: TableSize
  /**
   * Style of the cell separators.
   * @default 'solid'
   */
  borderStyle?: TableBorderStyle
  /**
   * Tint alternating rows.
   * @default false
   */
  stripedRows?: boolean
  /**
   * Tint alternating columns.
   * @default false
   */
  stripedColumns?: boolean
  /**
   * Tint a row on pointer hover.
   * @default false
   */
  hoverableRows?: boolean
}

function Table({
  size = 'md',
  borderStyle = 'solid',
  stripedRows = false,
  stripedColumns = false,
  hoverableRows = false,
  className,
  ...props
}: TableProps) {
  return (
    <table
      data-slot="table"
      className={cn(
        tableBaseClasses,
        sizeOuter[size],
        sizeCellPad[size],
        sizeHeaderCorners[size],
        sizeBodyBottomCorners[size],
        sizeBodyTopCornersNoHeader[size],
        borderStyleClasses[borderStyle],
        stripedRows && stripedRowsClasses,
        stripedColumns && stripedColumnsClasses,
        hoverableRows && rowHoverClasses,
        className,
      )}
      {...props}
    />
  )
}

interface TableCaptionProps extends React.ComponentPropsWithoutRef<'caption'> {
  /**
   * Render the caption above or below the table.
   * @default 'bottom'
   */
  position?: 'top' | 'bottom'
}

function TableCaption({ position = 'bottom', className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        'text-foreground-muted',
        position === 'top' ? 'caption-top pb-4' : 'caption-bottom pt-4',
        className,
      )}
      {...props}
    />
  )
}

interface TableHeaderProps extends React.ComponentPropsWithoutRef<'thead'> {}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead data-slot="table-header" className={className} {...props} />
}

interface TableBodyProps extends React.ComponentPropsWithoutRef<'tbody'> {}

function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

interface TableRowProps extends React.ComponentPropsWithoutRef<'tr'> {
  /**
   * Apply the persistent highlight background (\`data-highlighted\`).
   * @default false
   */
  highlighted?: boolean
}

function TableRow({ highlighted, className, ...props }: TableRowProps) {
  return <tr data-slot="table-row" data-highlighted={highlighted ? '' : undefined} className={className} {...props} />
}

interface TableHeadProps extends React.ComponentPropsWithoutRef<'th'> {}

function TableHead({ className, ...props }: TableHeadProps) {
  return <th data-slot="table-head" className={cn('text-start', className)} {...props} />
}

interface TableCellProps extends React.ComponentPropsWithoutRef<'td'> {}

function TableCell({ className, ...props }: TableCellProps) {
  return <td data-slot="table-cell" className={className} {...props} />
}

export { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell }
export type {
  TableProps,
  TableCaptionProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">table</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-tabs`,
    name: `Tabs (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── tabs/tabs.tsx ───
'use client'

import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

type TabsVariant = 'pill' | 'line'
type TabsSize = 'sm' | 'md' | 'lg'
type TabsTriggerSize = TabsSize | 'icon-sm' | 'icon-md' | 'icon-lg'
type TabsOrientation = 'horizontal' | 'vertical'

interface TabsContextValue {
  variant: TabsVariant
  size: TabsSize
  orientation: TabsOrientation
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error('Tabs sub-components must be rendered inside <Tabs>')
  }
  return ctx
}

const tabsListVariants = cva(
  'relative flex w-fit items-center justify-center data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col',
  {
    variants: {
      variant: {
        pill: 'gap-0.5 p-0.5 bg-background-muted',
        line: '',
      },
      size: {
        sm: 'data-[orientation=vertical]:min-w-32',
        md: 'data-[orientation=vertical]:min-w-36',
        lg: 'data-[orientation=vertical]:min-w-40',
      },
    },
    compoundVariants: [
      { variant: 'pill', size: 'sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'md', class: 'rounded-md' },
      { variant: 'pill', size: 'lg', class: 'rounded-lg' },
      { variant: 'line', size: 'sm', class: 'data-[orientation=horizontal]:gap-5' },
      { variant: 'line', size: 'md', class: 'data-[orientation=horizontal]:gap-6' },
      { variant: 'line', size: 'lg', class: 'data-[orientation=horizontal]:gap-7' },
    ],
    defaultVariants: { variant: 'pill', size: 'md' },
  },
)

const tabsIndicatorVariants = cva(
  'absolute z-0 inset-s-0 transition-[translate,width,height] duration-250 motion-reduce:transition-none data-[orientation=horizontal]:ltr:translate-x-(--active-tab-left) data-[orientation=horizontal]:rtl:-translate-x-(--active-tab-right) data-[orientation=vertical]:translate-y-(--active-tab-top)',
  {
    variants: {
      variant: {
        pill: 'w-(--active-tab-width) data-[orientation=horizontal]:top-0.5 data-[orientation=horizontal]:h-[calc(100%-0.25rem)] data-[orientation=vertical]:top-0 data-[orientation=vertical]:bottom-(--active-tab-bottom) data-[orientation=vertical]:inset-s-0.5 data-[orientation=vertical]:h-(--active-tab-height) rounded-[inherit] bg-white shadow-lg',
        line: cn(
          'rounded-full bg-foreground-intense',
          'data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-(--active-tab-width)',
          'data-[orientation=vertical]:top-[calc(var(--active-tab-height)/4)] data-[orientation=vertical]:h-[calc(var(--active-tab-height)/2)] data-[orientation=vertical]:w-0.5',
        ),
      },
    },
    defaultVariants: { variant: 'pill' },
  },
)

const tabsTriggerVariants = cva(
  "group/trigger relative flex shrink-0 cursor-pointer items-stretch data-[orientation=vertical]:w-full text-foreground-strong font-medium select-none outline-ring transition-colors duration-250 motion-reduce:transition-none hover:text-foreground-intense data-active:pointer-events-none data-disabled:opacity-disabled data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
  {
    variants: {
      variant: {
        pill: 'data-active:text-black',
        line: 'data-active:text-foreground-intense',
      },
      size: {
        sm: "text-xs [&_svg:not([class*='size-'])]:size-4",
        md: "text-sm [&_svg:not([class*='size-'])]:size-4.5",
        lg: "text-base [&_svg:not([class*='size-'])]:size-5",
        'icon-sm': "text-xs [&_svg:not([class*='size-'])]:size-4",
        'icon-md': "text-sm [&_svg:not([class*='size-'])]:size-4.5",
        'icon-lg': "text-base [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [
      { variant: 'pill', size: 'sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'md', class: 'rounded-md' },
      { variant: 'pill', size: 'lg', class: 'rounded-lg' },
      { variant: 'pill', size: 'icon-sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'icon-md', class: 'rounded-md' },
      { variant: 'pill', size: 'icon-lg', class: 'rounded-lg' },
    ],
    defaultVariants: { variant: 'pill', size: 'md' },
  },
)

const tabsTriggerInnerVariants = cva(
  'relative isolate flex items-center data-[orientation=horizontal]:justify-center data-[orientation=vertical]:w-full data-[orientation=horizontal]:text-center data-[orientation=vertical]:text-start data-[orientation=horizontal]:whitespace-nowrap transform-gpu transition-transform duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)] motion-reduce:transition-none group-active/trigger:scale-[0.97] group-active/trigger:duration-100 group-active/trigger:ease-in-out group-active/trigger:translate-y-px',
  {
    variants: {
      variant: {
        pill: 'before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:pointer-events-none before:transition-colors before:duration-250 group-hover/trigger:before:bg-background-subtle motion-reduce:before:transition-none supports-[font:-apple-system-body]:before:hidden',
        line: '',
      },
      size: {
        sm: 'gap-1 py-2',
        md: 'gap-1.5 py-2.5',
        lg: 'gap-1.5 py-3',
        'icon-sm': 'size-8',
        'icon-md': 'size-10',
        'icon-lg': 'size-12',
      },
    },
    compoundVariants: [
      {
        variant: 'pill',
        size: 'sm',
        class: 'rounded-sm px-3.5 has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5',
      },
      {
        variant: 'pill',
        size: 'md',
        class: 'rounded-md px-4.5 has-data-[icon=end]:pe-3 has-data-[icon=start]:ps-3',
      },
      {
        variant: 'pill',
        size: 'lg',
        class: 'rounded-lg px-5.5 has-data-[icon=end]:pe-4 has-data-[icon=start]:ps-4',
      },
      { variant: 'pill', size: 'icon-sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'icon-md', class: 'rounded-md' },
      { variant: 'pill', size: 'icon-lg', class: 'rounded-lg' },
      {
        variant: 'line',
        size: 'sm',
        class:
          'data-[orientation=vertical]:ps-3 data-[orientation=vertical]:has-data-[icon=end]:pe-2 data-[orientation=vertical]:has-data-[icon=start]:ps-2',
      },
      {
        variant: 'line',
        size: 'md',
        class:
          'data-[orientation=vertical]:ps-4 data-[orientation=vertical]:has-data-[icon=end]:pe-3 data-[orientation=vertical]:has-data-[icon=start]:ps-3',
      },
      {
        variant: 'line',
        size: 'lg',
        class:
          'data-[orientation=vertical]:ps-5 data-[orientation=vertical]:has-data-[icon=end]:pe-4 data-[orientation=vertical]:has-data-[icon=start]:ps-4',
      },
    ],
    defaultVariants: { variant: 'pill', size: 'md' },
  },
)

const tabsContentClasses =
  'outline-none transition-[opacity,filter] duration-400 ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:hidden'

type BaseTabsRootProps = React.ComponentProps<typeof BaseTabs.Root>

interface TabsProps extends BaseTabsRootProps {
  /**
   * Visual style, shared with the list and triggers via context.
   * @default 'pill'
   */
  variant?: TabsVariant
  /**
   * Trigger sizing, shared via context.
   * @default 'md'
   */
  size?: TabsSize
  /**
   * Layout axis and the direction arrow keys move focus. Exposed as \`data-orientation\`.
   * @default 'horizontal'
   */
  orientation?: TabsOrientation
}

function Tabs({ variant = 'pill', size = 'md', orientation = 'horizontal', className, ...rest }: TabsProps) {
  const ctx = React.useMemo<TabsContextValue>(() => ({ variant, size, orientation }), [variant, size, orientation])

  return (
    <TabsContext value={ctx}>
      <BaseTabs.Root
        data-slot="tabs"
        orientation={orientation}
        className={cn('flex gap-6 data-[orientation=horizontal]:flex-col', className)}
        {...rest}
      />
    </TabsContext>
  )
}

type BaseTabsListProps = React.ComponentProps<typeof BaseTabs.List>

interface TabsListProps extends BaseTabsListProps, Omit<VariantProps<typeof tabsListVariants>, 'variant' | 'size'> {
  /**
   * Override the root's variant for this list.
   * @default context
   */
  variant?: VariantProps<typeof tabsListVariants>['variant']
  /**
   * Override the root's size for this list.
   * @default context
   */
  size?: VariantProps<typeof tabsListVariants>['size']
}

function TabsList({ variant: variantProp, size: sizeProp, className, children, ...rest }: TabsListProps) {
  const ctx = useTabsContext()
  const variant = variantProp ?? ctx.variant
  const size = sizeProp ?? ctx.size

  const listCtx = React.useMemo<TabsContextValue>(
    () => ({ variant, size, orientation: ctx.orientation }),
    [variant, size, ctx.orientation],
  )

  return (
    <BaseTabs.List data-slot="tabs-list" className={cn(tabsListVariants({ variant, size }), className)} {...rest}>
      <BaseTabs.Indicator
        renderBeforeHydration
        data-slot="tabs-indicator"
        className={tabsIndicatorVariants({ variant })}
      />
      <TabsContext value={listCtx}>{children}</TabsContext>
    </BaseTabs.List>
  )
}

type BaseTabsTabProps = React.ComponentProps<typeof BaseTabs.Tab>

interface TabsTriggerProps extends BaseTabsTabProps {
  /**
   * Override the variant for this trigger.
   * @default context
   */
  variant?: TabsVariant
  /**
   * Override the size; \`icon-*\` makes a square, label-less trigger.
   * @default context
   */
  size?: TabsTriggerSize
}

function TabsTrigger({ variant: variantProp, size: sizeProp, className, children, ...rest }: TabsTriggerProps) {
  const ctx = useTabsContext()
  const variant = variantProp ?? ctx.variant
  const size = sizeProp ?? ctx.size

  return (
    <BaseTabs.Tab data-slot="tabs-trigger" className={cn(tabsTriggerVariants({ variant, size }), className)} {...rest}>
      <span
        data-slot="tabs-trigger-inner"
        data-orientation={ctx.orientation}
        className={tabsTriggerInnerVariants({ variant, size })}
      >
        {children}
      </span>
    </BaseTabs.Tab>
  )
}

type BaseTabsPanelProps = React.ComponentProps<typeof BaseTabs.Panel>

interface TabsContentProps extends BaseTabsPanelProps {}

function TabsContent({ className, ...rest }: TabsContentProps) {
  return <BaseTabs.Panel data-slot="tabs-content" className={cn(tabsContentClasses, className)} {...rest} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">tabs</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-text-animate`,
    name: `Text Animate (Appica)`,
    category: `Components`,
    tags: [`text-animate`, `appica`],
    code: `// ─── text-animate/text-animate.tsx ───
'use client'

import * as React from 'react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'

type TextAnimateSegment = 'char' | 'word' | 'line'

type TextAnimateEffectName = 'typewriter' | 'scramble' | 'rise' | 'highlight' | 'wave' | 'flip' | 'shimmer'

interface TextAnimateUnitContext {
  index: number
  total: number
  text: string
  by: TextAnimateSegment
  globalProgress: number
  reduced: boolean
}

type TextAnimateEffect = (
  progress: number,
  ctx: TextAnimateUnitContext,
) => {
  style?: React.CSSProperties
  className?: string
  content?: React.ReactNode
}

type TextAnimateContainerEffect = (
  progress: number,
  ctx: { reduced: boolean },
) => {
  style?: React.CSSProperties
  className?: string
}

interface PresetConfig {
  fn: TextAnimateEffect
  by: TextAnimateSegment
  stagger: number
  continuous: boolean
  /**
   * Styles the wrapper around every unit rather than the units themselves, for effects that span the
   * whole string. Lets \`by\` stay orthogonal: the units can be split any way and the effect is unchanged.
   */
  container?: TextAnimateContainerEffect
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@$?/<>*'
const SCRAMBLE_STEPS = 10

const SHIMMER_SPREAD = 'var(--text-shimmer-spread, calc(3ch + 40px))'
const SHIMMER_BASE = 'var(--text-shimmer-base, color-mix(in oklab, currentColor 38%, transparent))'
const SHIMMER_GLARE = 'var(--text-shimmer-glare, currentColor)'
const SHIMMER_MID = \`color-mix(in oklab, \${SHIMMER_GLARE}, \${SHIMMER_BASE} 50%)\`
const SHIMMER_GRADIENT =
  \`linear-gradient(calc(90deg + var(--text-shimmer-angle, 20deg)),\` +
  \` \${SHIMMER_BASE} calc(50% - \${SHIMMER_SPREAD}),\` +
  \` \${SHIMMER_MID} calc(50% - \${SHIMMER_SPREAD} * 0.5),\` +
  \` \${SHIMMER_GLARE} 50%,\` +
  \` \${SHIMMER_MID} calc(50% + \${SHIMMER_SPREAD} * 0.5),\` +
  \` \${SHIMMER_BASE} calc(50% + \${SHIMMER_SPREAD}))\`

const presets: Record<TextAnimateEffectName, PresetConfig> = {
  typewriter: {
    by: 'char',
    stagger: 1,
    continuous: false,
    fn: (p, ctx) => {
      const typed = p > 0
      const head = Math.min(Math.floor(ctx.globalProgress * ctx.total), ctx.total - 1)
      const onEdge = ctx.index === head && ctx.globalProgress < 1
      const caret = (onEdge || (ctx.globalProgress >= 1 && ctx.index === ctx.total - 1)) && (
        <span
          aria-hidden="true"
          className="motion-safe:animate-text-caret"
          style={{
            display: 'inline-block',
            width: '0.08em',
            height: '1em',
            marginInlineStart: '0.04em',
            backgroundColor: 'currentColor',
            verticalAlign: 'text-bottom',
          }}
        />
      )
      return {
        content: (
          <>
            {typed ? ctx.text : ''}
            {caret}
          </>
        ),
      }
    },
  },

  scramble: {
    by: 'char',
    stagger: 0.6,
    continuous: false,
    fn: (p, ctx) => {
      if (p >= 1 || ctx.text.trim() === '' || ctx.reduced) return {}
      const step = Math.floor(p * SCRAMBLE_STEPS)
      const glyph = SCRAMBLE_CHARS[(ctx.index * 131 + step * 977) % SCRAMBLE_CHARS.length]
      return { content: glyph, style: { opacity: 0.55 + p * 0.45 } }
    },
  },

  rise: {
    by: 'char',
    stagger: 0.7,
    continuous: false,
    fn: (p, ctx) => {
      if (ctx.reduced) return {}
      const eased = 1 - Math.pow(1 - p, 3)
      return {
        style: {
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          paddingBottom: '0.12em',
          marginBottom: '-0.12em',
        },
        content: (
          <span style={{ display: 'inline-block', transform: \`translateY(\${((1 - eased) * 110).toFixed(2)}%)\` }}>
            {ctx.text}
          </span>
        ),
      }
    },
  },

  highlight: {
    by: 'word',
    stagger: 0.85,
    continuous: false,
    fn: (p) => ({ style: { opacity: 0.18 + 0.82 * p } }),
  },

  wave: {
    by: 'char',
    stagger: 0,
    continuous: true,
    fn: (_p, ctx) => {
      if (ctx.reduced) return {}
      const y = Math.sin(ctx.globalProgress * Math.PI * 2 + ctx.index * 0.55)
      return { style: { display: 'inline-block', transform: \`translateY(\${(-y * 0.16).toFixed(3)}em)\` } }
    },
  },

  flip: {
    by: 'char',
    stagger: 0.7,
    continuous: false,
    fn: (p, ctx) => {
      if (ctx.reduced) return {}
      return {
        style: {
          display: 'inline-block',
          transformOrigin: '50% 0%',
          backfaceVisibility: 'hidden',
          transform: \`perspective(600px) rotateX(\${((1 - p) * -90).toFixed(2)}deg)\`,
          opacity: p < 0.5 ? p * 2 : 1,
        },
      }
    },
  },

  shimmer: {
    by: 'line',
    stagger: 0,
    continuous: true,
    fn: () => ({}),
    container: (p, { reduced }) => {
      if (reduced) return {}
      return {
        style: {
          display: 'inline-block',
          backgroundImage: SHIMMER_GRADIENT,
          backgroundRepeat: 'no-repeat',
          // Wider than the box by a full band on each side, so both ends of the sweep park the
          // glare off-screen and wrapping the driver from 1 back to 0 is invisible.
          backgroundSize: \`calc(200% + \${SHIMMER_SPREAD} * 2) 100%\`,
          backgroundPosition: \`\${((1 - p) * 100).toFixed(3)}% 0\`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      }
    },
  },
}

interface BuiltChar {
  ch: string
  index: number
}
interface BuiltWord {
  text: string
  index: number
  chars: BuiltChar[] | null
}
interface BuiltLine {
  text: string
  index: number
  words: BuiltWord[] | null
}

function tokenize(text: string, by: TextAnimateSegment): { lines: BuiltLine[]; total: number } {
  let u = 0
  const lines = text.split('\\n').map<BuiltLine>((lineText) => {
    if (by === 'line') {
      return { text: lineText, index: u++, words: null }
    }
    const words = (lineText.length ? lineText.split(' ') : ['']).map<BuiltWord>((word) => {
      if (by === 'word') {
        return { text: word, index: u++, chars: null }
      }
      const chars = Array.from(word).map<BuiltChar>((ch) => ({ ch, index: u++ }))
      return { text: word, index: -1, chars }
    })
    return { text: lineText, index: -1, words }
  })
  return { lines, total: u }
}

const MIN_UNIT_DURATION = 1e-4

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

interface UnitProps {
  text: string
  index: number
  total: number
  by: TextAnimateSegment
  stagger: number
  globalProgress: number
  reduced: boolean
  effect: TextAnimateEffect
}

function Unit({ text, index, total, by, stagger, globalProgress, reduced, effect }: UnitProps) {
  const start = (index / total) * stagger
  const duration = Math.max(1 - stagger, MIN_UNIT_DURATION)
  const local = clamp01((globalProgress - start) / duration)

  const { style, className, content } = effect(local, { index, total, text, by, globalProgress, reduced })

  return (
    <span data-slot="text-animate-unit" className={className} style={style}>
      {content === undefined ? text : content}
    </span>
  )
}

interface TextAnimateProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** The text to animate. Use \`\\n\` for explicit line breaks. */
  children: string
  /**
   * A preset name (\`typewriter\`, \`scramble\`, \`rise\`, \`highlight\`, \`wave\`, \`flip\`, \`shimmer\`) or a custom \`(progress,
   * ctx) => {…}\`.
   * @default 'typewriter'
   */
  effect?: TextAnimateEffectName | TextAnimateEffect
  /**
   * Segmentation level. Defaults to the preset's natural level (e.g. \`word\` for \`highlight\`).
   * @default preset's level
   */
  by?: TextAnimateSegment
  /** Controlled driver value (\`0 → 1\`). When set, the internal clock is disabled and you own the timeline. */
  progress?: number
  /**
   * Run the built-in clock when \`progress\` is not provided.
   * @default true
   */
  autoPlay?: boolean
  /**
   * Loop the built-in clock. Continuous presets (\`wave\`, \`shimmer\`) default to \`true\`.
   * @default preset's value
   */
  loop?: boolean
  /**
   * Built-in clock length in **seconds**.
   * @default 1.6
   */
  duration?: number
  /**
   * Built-in clock start delay in **seconds**.
   * @default 0
   */
  delay?: number
  /**
   * How offset each unit's window is from its neighbor's, \`0 → 1\`. \`0\` = all together; \`1\` = fully sequential.
   * @default preset's value
   */
  stagger?: number
}

function TextAnimate({
  children,
  effect = 'typewriter',
  by,
  progress,
  autoPlay = true,
  loop,
  duration = 1.6,
  delay = 0,
  stagger,
  className,
  ...props
}: TextAnimateProps) {
  const reduced = useReducedMotion()
  const text = String(children)

  const preset = typeof effect === 'string' ? presets[effect] : null
  const effectFn = preset ? preset.fn : (effect as TextAnimateEffect)
  const segment = by ?? preset?.by ?? 'char'
  const resolvedStagger = clamp01(stagger ?? preset?.stagger ?? 0.5)
  const shouldLoop = loop ?? preset?.continuous ?? false

  const controlled = progress != null

  const [clock, setClock] = React.useState(controlled ? clamp01(progress) : autoPlay ? 0 : 1)

  const containerRef = React.useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = React.useState(true)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => {
      setVisible(entries[0]?.isIntersecting ?? true)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (controlled || !autoPlay || reduced) return
    if (shouldLoop && !visible) return
    let raf = 0
    let startedAt: number | null = null
    const totalMs = Math.max(duration, 0.001) * 1000
    const delayMs = Math.max(delay, 0) * 1000

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now + delayMs
      const elapsed = now - startedAt
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick)
        return
      }
      const raw = elapsed / totalMs
      const value = shouldLoop ? raw % 1 : Math.min(raw, 1)
      setClock(value)
      if (shouldLoop || raw < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [controlled, autoPlay, reduced, duration, delay, shouldLoop, visible])

  const globalProgress = controlled ? clamp01(progress) : reduced ? 1 : clock

  const { lines, total } = React.useMemo(() => tokenize(text, segment), [text, segment])

  const unitProps = { total, by: segment, stagger: resolvedStagger, globalProgress, reduced, effect: effectFn }
  const multiline = lines.length > 1
  const container = preset?.container?.(globalProgress, { reduced })

  return (
    <span ref={containerRef} data-slot="text-animate" className={cn('inline-block', className)} {...props}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" suppressHydrationWarning className={container?.className} style={container?.style}>
        {lines.map((line, li) => {
          const lineStyle = multiline ? ({ display: 'block' } as const) : undefined

          if (line.words === null) {
            return (
              <span key={li} style={lineStyle}>
                <Unit {...unitProps} text={line.text} index={line.index} />
              </span>
            )
          }

          return (
            <span key={li} style={lineStyle}>
              {line.words.map((word, wi) => {
                const sep = wi < line.words!.length - 1 ? ' ' : ''

                if (word.chars === null) {
                  return (
                    <React.Fragment key={wi}>
                      <Unit {...unitProps} text={word.text} index={word.index} />
                      {sep}
                    </React.Fragment>
                  )
                }

                return (
                  <React.Fragment key={wi}>
                    <span style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                      {word.chars.map((c) => (
                        <Unit {...unitProps} key={c.index} text={c.ch} index={c.index} />
                      ))}
                    </span>
                    {sep}
                  </React.Fragment>
                )
              })}
            </span>
          )
        })}
      </span>
    </span>
  )
}

export { TextAnimate }
export type { TextAnimateProps, TextAnimateEffect, TextAnimateEffectName, TextAnimateSegment, TextAnimateUnitContext }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">text animate</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-textarea`,
    name: `Textarea (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── textarea/textarea.tsx ───
'use client'

import * as React from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { type VariantProps } from 'class-variance-authority'
import { cn, useComposedRefs } from '../../internal/utils'
import { inputVariants } from '../input/input-variants'

type BaseControlProps = React.ComponentProps<typeof BaseField.Control>

type TextareaVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type TextareaSize = NonNullable<VariantProps<typeof inputVariants>['size']>

interface TextareaProps extends Omit<React.ComponentProps<'textarea'>, 'size'> {
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: TextareaVariant
  /**
   * Scales padding and text. Named \`inputSize\` to avoid colliding with native attributes.
   * @default 'md'
   */
  inputSize?: TextareaSize
  /**
   * Show a clear (✕) button once the field has a value.
   * @default false
   */
  clearable?: boolean
  /** Adornment rendered before the field, aligned to the first line. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, aligned to the first line. */
  endSlot?: React.ReactNode
  /** Called when the clear button is pressed. */
  onClear?: () => void
}

const sizePaddingY: Record<TextareaSize, string> = {
  sm: 'py-2',
  md: 'py-2.5',
  lg: 'py-3',
}

const sizeMinHeight: Record<TextareaSize, string> = {
  sm: 'min-h-16',
  md: 'min-h-20',
  lg: 'min-h-24',
}

const sizePaddingYRem: Record<TextareaSize, string> = {
  sm: '0.5rem',
  md: '0.625rem',
  lg: '0.75rem',
}

function setNativeValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  setter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

function Textarea({
  className,
  variant = 'outline',
  inputSize = 'md',
  clearable,
  startSlot,
  endSlot,
  onClear,
  ref,
  rows = 3,
  ...props
}: TextareaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null)
  const composedRef = useComposedRefs(ref, innerRef)
  const hasWrapper = Boolean(clearable || startSlot || endSlot)

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const handleClear = () => {
    if (innerRef.current && props.value === undefined) {
      setNativeValue(innerRef.current, '')
    }
    innerRef.current?.focus()
    onClear?.()
  }

  if (!hasWrapper) {
    return (
      <BaseField.Control
        data-slot="textarea"
        ref={composedRef}
        render={<textarea rows={rows} />}
        className={cn(
          inputVariants({ variant, size: inputSize, state: 'self' }),
          'placeholder:text-foreground-subtle h-auto resize-y',
          sizePaddingY[inputSize],
          sizeMinHeight[inputSize],
          className,
        )}
        {...(props as BaseControlProps)}
        {...(invalid ? { 'data-invalid': '' } : {})}
      />
    )
  }

  return (
    <div
      data-slot="textarea-wrapper"
      data-invalid={invalid ? '' : undefined}
      style={{ '--textarea-h': \`calc(\${rows} * 1lh + 2 * \${sizePaddingYRem[inputSize]} + 2px)\` } as React.CSSProperties}
      className={cn(
        inputVariants({ variant, size: inputSize, state: 'within' }),
        'h-(--textarea-h) resize-y items-start overflow-hidden',
        sizeMinHeight[inputSize],
        sizePaddingY[inputSize],
        'has-[textarea:disabled]:border-border-strong! has-[textarea:disabled]:bg-background-subtle! has-[textarea:disabled]:opacity-disabled has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:border-dashed',
        className,
      )}
    >
      {startSlot && (
        <div data-slot="textarea-start" className="-ms-1 inline-flex h-lh shrink-0 items-center">
          {startSlot}
        </div>
      )}
      <BaseField.Control
        data-slot="textarea"
        ref={composedRef}
        render={<textarea rows={rows} />}
        placeholder={props.placeholder ?? ' '}
        className="peer text-foreground placeholder:text-foreground-subtle min-w-0 flex-1 resize-none self-stretch bg-transparent outline-none disabled:cursor-not-allowed"
        {...(props as BaseControlProps)}
      />
      {clearable && (
        <button
          data-slot="textarea-clear"
          type="button"
          onClick={handleClear}
          className="text-foreground-subtle hover:text-foreground pointer-events-none inline-flex h-lh shrink-0 cursor-pointer items-center opacity-0 transition-[opacity,color] duration-200 peer-not-placeholder-shown:pointer-events-auto peer-not-placeholder-shown:opacity-100 motion-reduce:transition-none"
          tabIndex={-1}
          aria-label="Clear input"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" className="size-[1em]">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
      {endSlot && (
        <div data-slot="textarea-end" className="-me-1 inline-flex h-lh shrink-0 items-center">
          {endSlot}
        </div>
      )}
    </div>
  )
}

export { Textarea }
export type { TextareaProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">textarea</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-thumbnail`,
    name: `Thumbnail (Appica)`,
    category: `Components`,
    tags: [`thumbnail`, `appica`],
    code: `// ─── thumbnail/thumbnail.tsx ───
import * as React from 'react'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const thumbnailVariants = cva(
  "relative inline-flex size-[1em] shrink-0 items-center justify-center overflow-hidden [&_svg:not([class*='size-'])]:size-[0.5em]",
  {
    variants: {
      size: {
        '2xs': 'text-[1.25rem]',
        xs: 'text-[1.5rem]',
        sm: 'text-[2rem]',
        md: 'text-[2.5rem]',
        lg: 'text-[3rem]',
        xl: 'text-[4rem]',
        '2xl': 'text-[5rem]',
      },
      shape: {
        rounded: 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]',
        circle: 'rounded-full',
      },
      variant: {
        image: 'bg-background-muted',
        'icon-soft': 'bg-background-muted text-foreground-intense',
        'icon-outline': 'bg-background text-foreground-intense border border-border',
        'icon-primary': 'bg-primary text-primary-foreground',
        'icon-primary-outline': 'text-primary border border-primary',
        'icon-secondary': 'bg-secondary-muted text-secondary-foreground',
        'icon-error': 'bg-error-muted text-error-foreground',
        'icon-success': 'bg-success-muted text-success-foreground',
        'icon-warning': 'bg-warning-muted text-warning-foreground',
        'icon-info': 'bg-info-muted text-info-foreground',
      },
    },
  },
)

type ThumbnailPresetSize = NonNullable<VariantProps<typeof thumbnailVariants>['size']>
type ThumbnailShape = NonNullable<VariantProps<typeof thumbnailVariants>['shape']>
type ThumbnailVariant = NonNullable<VariantProps<typeof thumbnailVariants>['variant']>

type BaseImageProps = React.ComponentProps<typeof BaseAvatar.Image>

interface ThumbnailProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'size' | 'children'> {
  /**
   * Image tile, or a colored icon tile.
   * @default 'image'
   */
  variant?: ThumbnailVariant
  /**
   * Rounded square or full circle.
   * @default 'rounded'
   */
  shape?: ThumbnailShape
  /**
   * A preset scale, or a pixel number for an exact size.
   * @default 'md'
   */
  size?: ThumbnailPresetSize | number
  /** Image URL (image variant). Lifted from \`render\` when omitted. */
  src?: string
  /**
   * Alternative text describing the image. Defaults to \`""\` (decorative) when omitted.
   * @default ''
   */
  alt?: string
  /** Swap the \`<img>\` for another element - e.g. a Next.js \`<Image>\`. */
  render?: BaseImageProps['render']
  /** Fires as the image moves through its loading lifecycle. */
  onLoadingStatusChange?: BaseImageProps['onLoadingStatusChange']
  /** The icon to frame (icon variants). */
  children?: React.ReactNode
}

function Thumbnail({
  className,
  style,
  variant = 'image',
  shape = 'rounded',
  size = 'md',
  src,
  alt,
  render,
  onLoadingStatusChange,
  children,
  ...props
}: ThumbnailProps) {
  const isNumeric = typeof size === 'number'

  const variantClass = thumbnailVariants({
    variant,
    shape,
    size: isNumeric ? undefined : size,
  })

  const numericStyle = isNumeric ? { fontSize: \`\${size}px\` } : undefined
  const mergedStyle = { ...numericStyle, ...style }
  const mergedClassName = cn(variantClass, className)

  if (variant === 'image') {
    const lifted =
      React.isValidElement<{ src?: string; alt?: string }>(render) && render.props ? render.props : undefined

    if (process.env.NODE_ENV !== 'production' && children != null) {
      // eslint-disable-next-line no-console
      console.warn('[Thumbnail] \`children\` is ignored when \`variant="image"\`.')
    }

    return (
      <BaseAvatar.Root
        data-slot="thumbnail"
        className={mergedClassName}
        style={mergedStyle}
        render={<div />}
        {...(props as React.ComponentProps<typeof BaseAvatar.Root>)}
      >
        <BaseAvatar.Image
          data-slot="thumbnail-image"
          className="size-full rounded-[inherit] object-cover"
          src={src ?? lifted?.src}
          alt={alt ?? lifted?.alt ?? ''}
          render={render}
          onLoadingStatusChange={onLoadingStatusChange}
        />
        <BaseAvatar.Fallback
          data-slot="thumbnail-fallback"
          delay={0}
          className="text-foreground-subtle flex size-full items-center justify-center has-[svg]:text-[1em]"
        >
          <ImageFallbackIcon />
        </BaseAvatar.Fallback>
      </BaseAvatar.Root>
    )
  }

  return (
    <div data-slot="thumbnail" className={mergedClassName} style={mergedStyle} {...props}>
      {children}
    </div>
  )
}

function ImageFallbackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      data-slot="thumbnail-fallback-icon"
    >
      <path d="M2.47 2.47a.75.75 0 0 1 1.061 0l.703.703c.078.037.151.086.215.151.057.059.099.126.133.196l15.925 15.925c.057.032.113.069.162.117s.094.111.128.173l.734.734a.75.75 0 0 1-1.061 1.061l-.402-.402c-.194.128-.398.24-.613.33a3.74 3.74 0 0 1-1.454.291v.001H6A3.75 3.75 0 0 1 2.25 18V6c0-.765.23-1.476.622-2.068L2.47 3.53a.75.75 0 0 1 0-1.061zM20.25 17v-.689l-2.77-2.771c-.388-.374-.762-.485-1.079-.455a.75.75 0 0 1-.141-1.494c.727-.068 1.421.175 2.013.651l.248.218 1.73 1.729V6A2.25 2.25 0 0 0 18 3.75H7a.75.75 0 1 1 0-1.5h11A3.75 3.75 0 0 1 21.75 6v11a.75.75 0 1 1-1.5 0zm-5.24-9.75a.75.75 0 1 1 0 1.5H15a.75.75 0 1 1 0-1.5h.01zM3.75 18A2.25 2.25 0 0 0 6 20.25h12.001c.299 0 .596-.059.872-.175.033-.014.063-.032.095-.047L10.48 11.54c-.351-.338-.69-.46-.979-.46s-.628.122-.979.46L3.75 16.311V18zm0-3.81l3.729-3.729c.354-.34.753-.594 1.181-.739L3.971 5.031A2.24 2.24 0 0 0 3.75 6v8.19z" />
    </svg>
  )
}

export { Thumbnail }
export type { ThumbnailProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">thumbnail</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-time-field`,
    name: `Time Field (Appica)`,
    category: `Inputs`,
    tags: [`input`, `form`, `appica`],
    code: `// ─── time-field/time-field.tsx ───
'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context'
import { cn } from '../../internal/utils'
import { inputVariants } from '../input/input-variants'

type TimeFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type TimeFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>

type SegmentType = 'hour24' | 'hour12' | 'minute' | 'second' | 'period'
type SegmentToken = 'H' | 'HH' | 'h' | 'hh' | 'm' | 'mm' | 's' | 'ss' | 'a'

interface SegmentNode {
  kind: 'segment'
  type: SegmentType
  token: SegmentToken
  index: number
}
interface LiteralNode {
  kind: 'literal'
  text: string
}
type FormatNode = SegmentNode | LiteralNode

interface TimeFieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> {
  /** Controlled value, a 24-hour \`"HH:mm[:ss]"\` string. Pair with \`onValueChange\`. */
  value?: string | null
  /** Uncontrolled initial value. */
  defaultValue?: string | null
  /** Fires with the time string when complete, or \`null\` when cleared. */
  onValueChange?: (time: string | null) => void
  /**
   * date-fns token string - \`H\`/\`HH\`, \`h\`/\`hh\`, \`m\`/\`mm\`, \`s\`/\`ss\`, \`a\`.
   * @default 'HH:mm'
   */
  format?: string
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: TimeFieldVariant
  /**
   * Height, padding, and text scale.
   * @default 'md'
   */
  size?: TimeFieldSize
  /** Content pinned to the start edge. */
  startSlot?: React.ReactNode
  /** Content pinned to the end edge. */
  endSlot?: React.ReactNode
  /**
   * Blocks interaction and removes the segments from the tab order.
   * @default false
   */
  disabled?: boolean
  /**
   * Segments stay focusable and readable but can't be edited.
   * @default false
   */
  readOnly?: boolean
  /**
   * Marks the hidden form input as required (needs \`name\`).
   * @default false
   */
  required?: boolean
  /** Renders a hidden \`<input>\` with the time value for form submission. */
  name?: string
  /**
   * Drop the input appearance - for composing inside another field (used by \`DatePicker\`).
   * @default false
   */
  unstyled?: boolean
  /** Ref to the underlying element. */
  ref?: React.Ref<HTMLDivElement>
}

interface Parts {
  hours: number | null
  minutes: number | null
  seconds: number | null
}

const EMPTY_PARTS: Parts = { hours: null, minutes: null, seconds: null }

const TOKEN_PATTERN = 'HH|H|hh|h|mm|m|ss|s|a'

const PLACEHOLDERS: Record<SegmentToken, string> = {
  H: 'HH',
  HH: 'HH',
  h: 'hh',
  hh: 'hh',
  m: 'mm',
  mm: 'mm',
  s: 'ss',
  ss: 'ss',
  a: 'AM',
}

function tokenToType(token: SegmentToken): SegmentType {
  if (token === 'H' || token === 'HH') return 'hour24'
  if (token === 'h' || token === 'hh') return 'hour12'
  if (token === 'm' || token === 'mm') return 'minute'
  if (token === 's' || token === 'ss') return 'second'
  return 'period'
}

function parseFormat(formatStr: string): FormatNode[] {
  const nodes: FormatNode[] = []
  const re = new RegExp(TOKEN_PATTERN, 'g')
  let lastIndex = 0
  let segmentIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(formatStr)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex, match.index) })
    }
    const token = match[0] as SegmentToken
    nodes.push({ kind: 'segment', type: tokenToType(token), token, index: segmentIndex++ })
    lastIndex = match.index + token.length
  }
  if (lastIndex < formatStr.length) {
    nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex) })
  }
  return nodes
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function partsFromString(s: string | null | undefined): Parts {
  if (!s) return EMPTY_PARTS
  const m = /^(\\d{1,2}):(\\d{1,2})(?::(\\d{1,2}))?(?:\\.\\d+)?$/.exec(s)
  if (!m) return EMPTY_PARTS
  const hours = Number(m[1])
  const minutes = Number(m[2])
  const seconds = m[3] != null ? Number(m[3]) : null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return EMPTY_PARTS
  if (seconds != null && (seconds < 0 || seconds > 59)) return EMPTY_PARTS
  return { hours, minutes, seconds }
}

function partsToString(p: Parts, includeSeconds: boolean): string | null {
  if (p.hours == null || p.minutes == null) return null
  if (includeSeconds && p.seconds == null) return null
  if (includeSeconds) return \`\${pad2(p.hours)}:\${pad2(p.minutes)}:\${pad2(p.seconds!)}\`
  return \`\${pad2(p.hours)}:\${pad2(p.minutes)}\`
}

function to12(h24: number): { hour12: number; period: 'AM' | 'PM' } {
  if (h24 === 0) return { hour12: 12, period: 'AM' }
  if (h24 === 12) return { hour12: 12, period: 'PM' }
  if (h24 > 12) return { hour12: h24 - 12, period: 'PM' }
  return { hour12: h24, period: 'AM' }
}

function from12(hour12: number, period: 'AM' | 'PM'): number {
  const h = hour12 % 12
  return period === 'PM' ? h + 12 : h
}

function periodOf(hours: number | null): 'AM' | 'PM' | null {
  if (hours == null) return null
  return hours >= 12 ? 'PM' : 'AM'
}

function getSegmentRange(token: SegmentToken): { min: number; max: number; maxDigits: number } {
  if (token === 'H' || token === 'HH') return { min: 0, max: 23, maxDigits: 2 }
  if (token === 'h' || token === 'hh') return { min: 1, max: 12, maxDigits: 2 }
  if (token === 'a') return { min: 0, max: 1, maxDigits: 1 }
  return { min: 0, max: 59, maxDigits: 2 }
}

function getDisplayHour12(hours: number | null): number | null {
  if (hours == null) return null
  return to12(hours).hour12
}

function displayPart(part: number | null, token: SegmentToken, parts: Parts): string {
  if (token === 'a') {
    const period = periodOf(parts.hours)
    return period ?? PLACEHOLDERS.a
  }
  if (token === 'h' || token === 'hh') {
    const h12 = getDisplayHour12(parts.hours)
    if (h12 == null) return PLACEHOLDERS[token]
    return token === 'hh' ? pad2(h12) : String(h12)
  }
  if (part == null) return PLACEHOLDERS[token]
  if (token === 'HH' || token === 'mm' || token === 'ss') return pad2(part)
  return String(part)
}

function ariaText(token: SegmentToken, parts: Parts): string {
  if (token === 'a') {
    const period = periodOf(parts.hours)
    return period ?? 'Empty'
  }
  if (token === 'h' || token === 'hh') {
    const h12 = getDisplayHour12(parts.hours)
    return h12 == null ? 'Empty' : String(h12)
  }
  const val =
    token === 'H' || token === 'HH' ? parts.hours : token === 'm' || token === 'mm' ? parts.minutes : parts.seconds
  return val == null ? 'Empty' : String(val)
}

function ariaLabel(type: SegmentType): string {
  if (type === 'hour24' || type === 'hour12') return 'hour'
  if (type === 'minute') return 'minute'
  if (type === 'second') return 'second'
  return 'period'
}

function setHourFromInput(prev: Parts, token: SegmentToken, value: number): Parts {
  if (token === 'h' || token === 'hh') {
    const period = periodOf(prev.hours) ?? 'AM'
    return { ...prev, hours: from12(value, period) }
  }
  return { ...prev, hours: value }
}

function togglePeriod(prev: Parts, target?: 'AM' | 'PM'): Parts {
  const current = periodOf(prev.hours)
  if (prev.hours == null) {
    const next: 'AM' | 'PM' = target ?? 'AM'
    return { ...prev, hours: next === 'PM' ? 12 : 0 }
  }
  const next: 'AM' | 'PM' = target ?? (current === 'AM' ? 'PM' : 'AM')
  if (next === current) return prev
  return { ...prev, hours: next === 'PM' ? prev.hours + 12 : prev.hours - 12 }
}

function TimeField({
  className,
  value,
  defaultValue,
  onValueChange,
  format = 'HH:mm',
  variant = 'outline',
  size = 'md',
  startSlot,
  endSlot,
  disabled: disabledProp,
  readOnly,
  required,
  name: nameProp,
  unstyled,
  ref,
  ...rest
}: TimeFieldProps) {
  const field = useFieldRootContext(true)
  const disabled = disabledProp || field.disabled
  const name = nameProp ?? field.name
  const ariaInvalid = rest['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true' || field.invalid === true

  const nodes = React.useMemo(() => parseFormat(format), [format])
  const segmentCount = React.useMemo(() => nodes.reduce((n, x) => n + (x.kind === 'segment' ? 1 : 0), 0), [nodes])
  const includeSeconds = React.useMemo(
    () => nodes.some((n) => n.kind === 'segment' && (n.token === 's' || n.token === 'ss')),
    [nodes],
  )

  const isControlled = value !== undefined
  const [internalParts, setInternalParts] = React.useState<Parts>(() => partsFromString(value ?? defaultValue))
  const [commitTick, setCommitTick] = React.useState(0)

  const lastValueRef = React.useRef<string>(value ?? '')
  const lastCommittedRef = React.useRef<string>(
    partsToString(partsFromString(value ?? defaultValue), includeSeconds) ?? '',
  )

  React.useEffect(() => {
    if (!isControlled) return
    const v = value ?? ''
    if (v !== lastValueRef.current) {
      lastValueRef.current = v
      lastCommittedRef.current = v
      setInternalParts(partsFromString(value))
    }
  }, [isControlled, value])

  const parts = internalParts

  const partsRef = React.useRef(parts)
  partsRef.current = parts

  const onValueChangeRef = React.useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const includeSecondsRef = React.useRef(includeSeconds)
  includeSecondsRef.current = includeSeconds

  const commit = React.useCallback((updater: (prev: Parts) => Parts) => {
    const next = updater(partsRef.current)
    setInternalParts(next)
    const serialized = partsToString(next, includeSecondsRef.current)
    if (serialized) {
      if (serialized !== lastCommittedRef.current) {
        lastCommittedRef.current = serialized
        onValueChangeRef.current?.(serialized)
        setCommitTick((t) => t + 1)
      }
      return
    }
    const allEmpty = next.hours == null && next.minutes == null && next.seconds == null
    if (allEmpty && lastCommittedRef.current !== '') {
      lastCommittedRef.current = ''
      onValueChangeRef.current?.(null)
      setCommitTick((t) => t + 1)
    }
  }, [])

  React.useEffect(() => {
    if (commitTick === 0 || !isControlled) return
    const v = value ?? ''
    const serialized = partsToString(partsRef.current, includeSecondsRef.current) ?? ''
    if (v !== serialized) {
      lastValueRef.current = v
      lastCommittedRef.current = v
      setInternalParts(partsFromString(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitTick])

  const segmentRefs = React.useRef<Array<HTMLSpanElement | null>>([])
  const typingCountRef = React.useRef<Map<number, number>>(new Map())

  const setSegmentRef = React.useMemo(() => {
    const cache = new Map<number, (el: HTMLSpanElement | null) => void>()
    return (index: number) => {
      let cb = cache.get(index)
      if (!cb) {
        cb = (el) => {
          segmentRefs.current[index] = el
        }
        cache.set(index, cb)
      }
      return cb
    }
  }, [])

  const focusSegment = React.useCallback((idx: number) => {
    segmentRefs.current[idx]?.focus()
  }, [])

  const onRootMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      const target = e.target as HTMLElement
      if (target.closest('[data-slot="time-field-segment"]')) return
      if (target.closest('button, a, input, select, textarea, label, [role="button"]')) return
      e.preventDefault()
      const p = partsRef.current
      const isEmpty = (type: SegmentType) =>
        type === 'minute' ? p.minutes == null : type === 'second' ? p.seconds == null : p.hours == null
      const firstEmpty = nodes.find((n): n is SegmentNode => n.kind === 'segment' && isEmpty(n.type))
      focusSegment(firstEmpty ? firstEmpty.index : 0)
    },
    [disabled, focusSegment, nodes],
  )

  const processCharInput = React.useCallback(
    (seg: SegmentNode, ch: string) => {
      if (disabled || readOnly) return
      const p = partsRef.current

      if (seg.token === 'a') {
        if (/[aApP]/.test(ch)) {
          typingCountRef.current.delete(seg.index)
          const target: 'AM' | 'PM' = ch.toLowerCase() === 'a' ? 'AM' : 'PM'
          commit((prev) => togglePeriod(prev, target))
          return
        }
        if (ch === ':' || ch === '/' || ch === '-' || ch === '.' || ch === ',' || ch === ' ') {
          if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        }
        return
      }

      if (ch === ':' || ch === '/' || ch === '-' || ch === '.' || ch === ',' || ch === ' ') {
        typingCountRef.current.delete(seg.index)
        if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        return
      }

      if (ch < '0' || ch > '9') return

      const range = getSegmentRange(seg.token)
      const digit = Number(ch)
      const count = typingCountRef.current.get(seg.index) ?? 0
      const base =
        seg.token === 'h' || seg.token === 'hh'
          ? getDisplayHour12(p.hours)
          : seg.token === 'H' || seg.token === 'HH'
            ? p.hours
            : seg.token === 'm' || seg.token === 'mm'
              ? p.minutes
              : p.seconds
      let displayVal: number
      if (count === 0 || base == null) {
        displayVal = digit
      } else {
        const tentative = base * 10 + digit
        displayVal = tentative > range.max ? digit : tentative
      }
      if (displayVal < range.min) displayVal = range.min
      typingCountRef.current.set(seg.index, count + 1)

      commit((prev) => {
        if (seg.type === 'hour24' || seg.type === 'hour12') return setHourFromInput(prev, seg.token, displayVal)
        if (seg.type === 'minute') return { ...prev, minutes: displayVal }
        return { ...prev, seconds: displayVal }
      })

      const reachedMaxDigits = (typingCountRef.current.get(seg.index) ?? 0) >= range.maxDigits
      const cantFitAnother = displayVal * 10 > range.max
      if (reachedMaxDigits || cantFitAnother) {
        typingCountRef.current.delete(seg.index)
        if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
      }
    },
    [commit, disabled, focusSegment, readOnly, segmentCount],
  )

  const onSegmentKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>, seg: SegmentNode) => {
      if (disabled) return
      const p = partsRef.current

      if (e.key === 'Tab') return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const goNext = e.key === 'ArrowRight'
        typingCountRef.current.delete(seg.index)
        const target = goNext ? seg.index + 1 : seg.index - 1
        if (target >= 0 && target < segmentCount) focusSegment(target)
        return
      }

      if (e.key === 'Home') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        focusSegment(0)
        return
      }

      if (e.key === 'End') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        focusSegment(segmentCount - 1)
        return
      }

      if (readOnly) return

      if (seg.token === 'a') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          typingCountRef.current.delete(seg.index)
          commit((prev) => togglePeriod(prev))
          return
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault()
          typingCountRef.current.delete(seg.index)
          if (p.hours == null && e.key === 'Backspace' && seg.index > 0) {
            focusSegment(seg.index - 1)
          } else {
            commit((prev) => ({ ...prev, hours: null }))
          }
          return
        }
        if (e.key.length === 1) {
          e.preventDefault()
          processCharInput(seg, e.key)
        }
        return
      }

      const partVal =
        seg.token === 'h' || seg.token === 'hh'
          ? getDisplayHour12(p.hours)
          : seg.token === 'H' || seg.token === 'HH'
            ? p.hours
            : seg.token === 'm' || seg.token === 'mm'
              ? p.minutes
              : p.seconds

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        const range = getSegmentRange(seg.token)
        const stepUp = e.key === 'ArrowUp'
        let next: number
        if (partVal == null) {
          next = stepUp ? range.min : range.max
        } else {
          let nb = stepUp ? partVal + 1 : partVal - 1
          if (nb > range.max) nb = range.min
          if (nb < range.min) nb = range.max
          next = nb
        }
        commit((prev) => {
          if (seg.type === 'hour24' || seg.type === 'hour12') return setHourFromInput(prev, seg.token, next)
          if (seg.type === 'minute') return { ...prev, minutes: next }
          return { ...prev, seconds: next }
        })
        return
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        if (partVal == null && e.key === 'Backspace' && seg.index > 0) {
          focusSegment(seg.index - 1)
        } else {
          commit((prev) => {
            if (seg.type === 'hour24' || seg.type === 'hour12') return { ...prev, hours: null }
            if (seg.type === 'minute') return { ...prev, minutes: null }
            return { ...prev, seconds: null }
          })
        }
        return
      }

      if (e.key.length === 1) {
        e.preventDefault()
        processCharInput(seg, e.key)
      }
    },
    [commit, disabled, focusSegment, processCharInput, readOnly, segmentCount],
  )

  const onSegmentBeforeInput = React.useCallback(
    (e: React.FormEvent<HTMLSpanElement>, seg: SegmentNode) => {
      e.preventDefault()
      const data = (e.nativeEvent as InputEvent).data
      if (!data) return
      for (const ch of data) processCharInput(seg, ch)
    },
    [processCharInput],
  )

  const onSegmentFocus = React.useCallback((seg: SegmentNode) => {
    typingCountRef.current.delete(seg.index)
  }, [])

  const onSegmentBlur = React.useCallback((seg: SegmentNode) => {
    typingCountRef.current.delete(seg.index)
  }, [])

  const hiddenValue = partsToString(parts, includeSeconds) ?? ''

  return (
    <div
      data-slot="time-field"
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      role="group"
      ref={ref}
      className={cn(
        unstyled
          ? 'inline-flex min-w-0 items-center select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed'
          : cn(
              inputVariants({ variant, size, state: 'within' }),
              'select-none',
              'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
            ),
        className,
      )}
      {...rest}
      onMouseDown={(e) => {
        rest.onMouseDown?.(e)
        if (!e.defaultPrevented) onRootMouseDown(e)
      }}
    >
      {startSlot ? (
        <div data-slot="time-field-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      ) : null}
      <div data-slot="time-field-segments" dir="ltr" className="text-foreground flex min-w-0 flex-1 items-center">
        {nodes.map((node, i) => {
          if (node.kind === 'literal') {
            return (
              <span key={\`l-\${i}\`} aria-hidden="true" className="text-foreground-subtle whitespace-pre">
                {node.text}
              </span>
            )
          }
          const isPeriod = node.token === 'a'
          const range = getSegmentRange(node.token)
          const partVal =
            node.token === 'a'
            

// ... (truncated, full source available at sourceUrl)`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">time field</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-toast`,
    name: `Toast (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── toast/toast.tsx ───
'use client'

import * as React from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { buttonVariants } from '../button/button-variants'

type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

type ToastSwipeAxis = 'up' | 'down' | 'left' | 'right'

const viewportPositionClasses: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
}

const swipeDirectionByPosition: Record<ToastPosition, ToastSwipeAxis[]> = {
  'top-left': ['up', 'left'],
  'top-center': ['up'],
  'top-right': ['up', 'right'],
  'bottom-left': ['down', 'left'],
  'bottom-center': ['down'],
  'bottom-right': ['down', 'right'],
}

const toastAnimationBase =
  '[--gap:0.75rem] [--peek:0.75rem] ' +
  '[--scale:calc(max(0,1-(var(--toast-index)*0.1)))] ' +
  '[--shrink:calc(1-var(--scale))] ' +
  '[--height:var(--toast-frontmost-height,var(--toast-height))] ' +
  'absolute z-[calc(1000-var(--toast-index))] w-full select-none ' +
  'h-[var(--height)] data-expanded:h-[var(--toast-height)] ' +
  'data-ending-style:opacity-0 data-limited:opacity-0 ' +
  '[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s] ' +
  'motion-reduce:transition-none'

const toastAnimationBottom =
  'right-0 bottom-0 left-0 origin-bottom ' +
  '[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] ' +
  '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] ' +
  'data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] ' +
  'motion-safe:data-starting-style:[transform:translateY(150%)] ' +
  'motion-safe:[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] ' +
  "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']"

const toastAnimationTop =
  'top-0 right-0 left-0 origin-top ' +
  '[--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] ' +
  '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] ' +
  'data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] ' +
  'motion-safe:data-starting-style:[transform:translateY(-150%)] ' +
  'motion-safe:[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] ' +
  'motion-safe:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] ' +
  'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] ' +
  "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']"

const ToastPositionContext = React.createContext<ToastPosition>('bottom-right')

interface ToastProviderProps extends BaseToast.Provider.Props {}

function ToastProvider(props: ToastProviderProps) {
  return <BaseToast.Provider {...props} />
}

interface ToasterProps extends Omit<BaseToast.Viewport.Props, 'children'> {
  /**
   * Where the stack is anchored; also sets the default swipe-to-dismiss directions.
   * @default 'bottom-right'
   */
  position?: ToastPosition
  /**
   * Opt in to a countdown progress bar on auto-dismissing toasts.
   * @default false
   */
  progress?: boolean
  /**
   * Provider default (ms) used to size the progress bar for toasts that don't set their own \`timeout\`. Match your
   * \`ToastProvider\`'s \`timeout\`.
   * @default 5000
   */
  timeout?: number
  /**
   * Portal target - scope the toasts to a specific element.
   * @default document.body
   */
  container?: React.ComponentProps<typeof BaseToast.Portal>['container']
  /** Escape hatch forwarded to the underlying \`Toast.Portal\`. */
  portalProps?: Omit<React.ComponentProps<typeof BaseToast.Portal>, 'children'>
}

function Toaster({
  position = 'bottom-right',
  progress = false,
  timeout = 5000,
  className,
  container,
  portalProps,
  ...viewportProps
}: ToasterProps) {
  const { toasts } = BaseToast.useToastManager<{ icon?: React.ReactNode }>()
  const portal = { ...portalProps, ...(container !== undefined ? { container } : {}) }
  return (
    <ToastPositionContext.Provider value={position}>
      <BaseToast.Portal {...portal}>
        <ToastViewport position={position} className={className} {...viewportProps}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} dismissible progress={progress} providerTimeout={timeout}>
              {toast.data?.icon ? <ToastIcon>{toast.data.icon}</ToastIcon> : null}
              {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
              {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
              {toast.actionProps ? (
                <ToastActions>
                  <ToastAction />
                </ToastActions>
              ) : null}
            </Toast>
          ))}
        </ToastViewport>
      </BaseToast.Portal>
    </ToastPositionContext.Provider>
  )
}

interface ToastViewportProps extends BaseToast.Viewport.Props {
  position?: ToastPosition
}

function ToastViewport({ position: positionProp, className, ...props }: ToastViewportProps) {
  const ctxPosition = React.useContext(ToastPositionContext)
  const position = positionProp ?? ctxPosition
  const direction = useDirection()
  return (
    <BaseToast.Viewport
      data-slot="toast-viewport"
      data-position={position}
      dir={direction}
      className={cn(
        'fixed z-50 w-90 max-w-[calc(100vw-2rem)] outline-none',
        viewportPositionClasses[position],
        className,
      )}
      {...props}
    />
  )
}

interface ToastProps extends Omit<BaseToast.Root.Props, 'swipeDirection'> {
  position?: ToastPosition
  dismissible?: boolean
  progress?: boolean
  providerTimeout?: number
  closeLabel?: string
  swipeDirection?: BaseToast.Root.Props['swipeDirection']
}

function Toast({
  position: positionProp,
  dismissible = true,
  progress = false,
  providerTimeout = 5000,
  closeLabel,
  swipeDirection,
  toast,
  className,
  children,
  ...props
}: ToastProps) {
  const ctxPosition = React.useContext(ToastPositionContext)
  const position = positionProp ?? ctxPosition
  const resolvedTimeout = toast.timeout ?? providerTimeout
  const showProgress = progress && resolvedTimeout > 0
  const isBottom = position.startsWith('bottom')

  return (
    <BaseToast.Root
      toast={toast}
      data-slot="toast"
      data-position={position}
      swipeDirection={swipeDirection ?? swipeDirectionByPosition[position]}
      className={cn(
        'group/toast',
        'border-border-overlay bg-background text-foreground rounded-xl border p-4 text-sm backdrop-blur-xl',
        isBottom ? 'shadow-[0_-8px_16px_-4px_var(--shadow-color)]' : 'shadow-lg',
        'grid items-start gap-x-0 gap-y-2',
        'has-data-[slot=toast-icon]:gap-x-3',
        'grid-cols-[auto_1fr_auto]',
        "[grid-template-areas:'icon_title_close']",
        "has-data-[slot=toast-description]:[grid-template-areas:'icon_title_close'_'icon_description_close']",
        "has-data-[slot=toast-actions]:not-has-data-[slot=toast-description]:[grid-template-areas:'icon_title_close'_'icon_actions_actions']",
        "has-data-[slot=toast-actions]:has-data-[slot=toast-description]:[grid-template-areas:'icon_title_close'_'icon_description_close'_'icon_actions_actions']",
        toastAnimationBase,
        isBottom ? toastAnimationBottom : toastAnimationTop,
        className,
      )}
      {...props}
    >
      <BaseToast.Content className="contents">
        {children}
        {dismissible ? closeLabel !== undefined ? <ToastClose closeLabel={closeLabel} /> : <ToastClose /> : null}
      </BaseToast.Content>
      {showProgress ? <ToastProgress key={toast.updateKey} timeout={resolvedTimeout} /> : null}
    </BaseToast.Root>
  )
}

interface ToastIconProps extends React.HTMLAttributes<HTMLSpanElement> {}

function ToastIcon({ className, ...props }: ToastIconProps) {
  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "flex shrink-0 items-center [grid-area:icon] has-[>svg]:h-lh [&>svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  )
}

interface ToastTitleProps extends BaseToast.Title.Props {}

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <BaseToast.Title
      data-slot="toast-title"
      className={cn(
        'text-foreground-intense flex w-full items-center gap-2 text-sm font-semibold [grid-area:title]',
        className,
      )}
      {...props}
    />
  )
}

interface ToastDescriptionProps extends BaseToast.Description.Props {}

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <BaseToast.Description
      data-slot="toast-description"
      className={cn('text-foreground text-sm [grid-area:description]', className)}
      {...props}
    />
  )
}

interface ToastActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

function ToastActions({ className, ...props }: ToastActionsProps) {
  return (
    <div
      data-slot="toast-actions"
      className={cn('flex justify-end gap-2 pt-2 [grid-area:actions]', className)}
      {...props}
    />
  )
}

interface ToastActionProps extends BaseToast.Action.Props, VariantProps<typeof buttonVariants> {}

function ToastAction({ className, variant = 'primary', size = 'sm', ...props }: ToastActionProps) {
  return (
    <BaseToast.Action
      data-slot="toast-action"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

interface ToastCloseProps extends BaseToast.Close.Props {
  closeLabel?: string
}

function ToastClose({ className, closeLabel = 'Dismiss', children, ...props }: ToastCloseProps) {
  return (
    <BaseToast.Close
      aria-label={closeLabel}
      data-slot="toast-close"
      className={cn(
        'text-foreground-muted -me-1 -mt-1 cursor-pointer self-start rounded-md p-1 outline-none [grid-area:close] motion-safe:transition-colors',
        'hover:text-foreground-intense',
        'focus-visible:ring-ring focus-visible:ring-2',
        className,
      )}
      {...props}
    >
      {children ?? <CloseIcon />}
    </BaseToast.Close>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M11.523 3.522c.264-.264.691-.264.955 0s.264.691 0 .955L8.955 8l3.522 3.522c.264.264.264.691 0 .955s-.691.264-.955 0L8 8.955l-3.522 3.522c-.264.264-.691.264-.955 0s-.264-.691 0-.955L7.045 8 3.522 4.478c-.264-.264-.264-.691 0-.955s.691-.264.955 0L8 7.045l3.523-3.522z" />
    </svg>
  )
}

interface ToastProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  timeout: number
}

function ToastProgress({ timeout, className, ...props }: ToastProgressProps) {
  return (
    <div
      data-slot="toast-progress"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 h-4 overflow-hidden rounded-b-[inherit]',
        'motion-reduce:hidden',
        className,
      )}
      {...props}
    >
      <div
        data-slot="toast-progress-indicator"
        className={cn(
          'bg-primary absolute inset-x-0 bottom-0 h-1 origin-left rtl:origin-right',
          'animate-[toast-progress_linear_forwards]',
          'group-data-expanded/toast:[animation-play-state:paused]',
          'motion-reduce:animate-none',
        )}
        style={{ animationDuration: \`\${timeout}ms\` }}
      />
    </div>
  )
}

type ToastPortalProps = React.ComponentProps<typeof BaseToast.Portal>
function ToastPortal(props: ToastPortalProps) {
  return <BaseToast.Portal {...props} />
}

const useToastManager = BaseToast.useToastManager
const createToastManager = BaseToast.createToastManager

export {
  ToastProvider,
  Toaster,
  ToastViewport,
  ToastPortal,
  Toast,
  ToastIcon,
  ToastTitle,
  ToastDescription,
  ToastActions,
  ToastAction,
  ToastClose,
  ToastProgress,
  useToastManager,
  createToastManager,
}
export type {
  ToastProviderProps,
  ToasterProps,
  ToastViewportProps,
  ToastPortalProps,
  ToastProps,
  ToastIconProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionsProps,
  ToastActionProps,
  ToastCloseProps,
  ToastProgressProps,
  ToastPosition,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">toast</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-toc`,
    name: `Toc (Appica)`,
    category: `Components`,
    tags: [`toc`, `appica`],
    code: `// ─── toc/toc.tsx ───
'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../internal/utils'

type TocContextValue = {
  activeIds: readonly string[]
  currentId: string | null
  register: (id: string, element: HTMLElement) => () => void
  getLinkElement: (id: string) => HTMLElement | undefined
}

const TocContext = React.createContext<TocContextValue | null>(null)

function useTocContext(component: string): TocContextValue {
  const ctx = React.useContext(TocContext)
  if (!ctx) throw new Error(\`Appica UI: <\${component}> must be used within <Toc>.\`)
  return ctx
}

function areSameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function closestHeadingId(ids: readonly string[], rootBounds: DOMRectReadOnly | null) {
  if (!rootBounds) return null
  let closest: string | null = null
  let minDistance = Number.POSITIVE_INFINITY
  for (const id of ids) {
    const heading = document.getElementById(id)
    if (!heading) continue
    const distance = Math.abs(heading.getBoundingClientRect().top - rootBounds.top)
    if (distance < minDistance) {
      minDistance = distance
      closest = id
    }
  }
  return closest
}

interface TocProps extends React.ComponentPropsWithoutRef<'nav'> {
  /**
   * \`IntersectionObserver\` \`rootMargin\` (\`top right bottom left\`) - offset the active boundary, e.g. for a sticky
   * header.
   * @default '0px'
   */
  rootMargin?: string
}

function Toc({ className, rootMargin = '0px', ...props }: TocProps) {
  const [ids, setIds] = React.useState<readonly string[]>([])
  const [activeIds, setActiveIds] = React.useState<readonly string[]>([])
  const linkElementsRef = React.useRef(new Map<string, HTMLElement>())

  const register = React.useCallback((id: string, element: HTMLElement) => {
    linkElementsRef.current.set(id, element)
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    return () => {
      linkElementsRef.current.delete(id)
      setIds((prev) => prev.filter((existing) => existing !== id))
    }
  }, [])

  const getLinkElement = React.useCallback((id: string) => linkElementsRef.current.get(id), [])

  React.useEffect(() => {
    if (ids.length === 0) {
      setActiveIds((prev) => (prev.length === 0 ? prev : []))
      return
    }
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        let next = ids.filter((id) => visible.has(id))
        if (next.length === 0) {
          const fallback = closestHeadingId(ids, entries[0]?.rootBounds ?? null)
          if (fallback) next = [fallback]
        }
        setActiveIds((prev) => (areSameIds(prev, next) ? prev : next))
      },
      { rootMargin },
    )
    for (const id of ids) {
      const heading = document.getElementById(id)
      if (heading) observer.observe(heading)
    }
    return () => observer.disconnect()
  }, [ids, rootMargin])

  const ctx = React.useMemo<TocContextValue>(
    () => ({ activeIds, currentId: activeIds[0] ?? null, register, getLinkElement }),
    [activeIds, register, getLinkElement],
  )

  return (
    <TocContext.Provider value={ctx}>
      <nav data-slot="toc" aria-label="Table of contents" className={className} {...props} />
    </TocContext.Provider>
  )
}

type TocListProps = React.ComponentPropsWithoutRef<'ul'>

function TocList({ className, style, ...props }: TocListProps) {
  const { activeIds, getLinkElement } = useTocContext('TocList')
  const listRef = React.useRef<HTMLUListElement>(null)
  const [indicator, setIndicator] = React.useState({ top: 0, height: 0, visible: false })
  const [animate, setAnimate] = React.useState(false)

  React.useEffect(() => {
    const measure = () => {
      let top = Number.POSITIVE_INFINITY
      let bottom = Number.NEGATIVE_INFINITY
      for (const id of activeIds) {
        const link = getLinkElement(id)
        if (!link) continue
        top = Math.min(top, link.offsetTop)
        bottom = Math.max(bottom, link.offsetTop + link.offsetHeight)
      }
      setIndicator((prev) => {
        if (bottom <= top) return prev.visible ? { ...prev, visible: false } : prev
        const height = bottom - top
        if (prev.visible && prev.top === top && prev.height === height) return prev
        return { top, height, visible: true }
      })
    }
    measure()
    const list = listRef.current
    if (!list || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(list)
    return () => resizeObserver.disconnect()
  }, [activeIds, getLinkElement])

  React.useEffect(() => {
    if (!indicator.visible || animate) return
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [indicator.visible, animate])

  return (
    <ul
      ref={listRef}
      data-slot="toc-list"
      role="list"
      className={cn(
        'border-border relative flex flex-col border-s',
        'before:pointer-events-none before:absolute before:-inset-s-px before:w-0.5',
        'before:top-(--toc-indicator-top) before:h-(--toc-indicator-height)',
        'before:bg-foreground-intense',
        'before:transition-opacity before:duration-300 before:ease-out',
        animate && 'before:transition-[top,height,opacity]',
        'motion-reduce:before:transition-none',
        indicator.visible ? 'before:opacity-100' : 'before:opacity-0',
        className,
      )}
      style={
        {
          ...style,
          '--toc-indicator-top': \`\${indicator.top}px\`,
          '--toc-indicator-height': \`\${indicator.height}px\`,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

type TocItemProps = React.ComponentPropsWithoutRef<'li'>

function TocItem({ className, ...props }: TocItemProps) {
  return <li data-slot="toc-item" className={className} {...props} />
}

type TocLinkState = {
  active: boolean
}

const DEPTH_INDENT: Record<number, string> = {
  2: 'ps-4',
  3: 'ps-7',
  4: 'ps-10',
  5: 'ps-13',
  6: 'ps-16',
}

interface TocLinkProps extends useRender.ComponentProps<'a', TocLinkState> {
  /** **Required.** The target heading, as a hash (\`#id\`). The \`id\` after \`#\` is the heading observed. */
  href: string
  /**
   * Heading level (2-6); controls the indentation. Higher = deeper indent.
   * @default 2
   */
  depth?: number
}

function TocLink({ className, depth = 2, href, render, ref, ...props }: TocLinkProps) {
  const { activeIds, currentId, register } = useTocContext('TocLink')
  const id = href.startsWith('#') ? href.slice(1) : null
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  React.useEffect(() => {
    const element = linkRef.current
    if (!id || !element) return
    return register(id, element)
  }, [id, register])

  const active = id !== null && activeIds.includes(id)

  return useRender({
    defaultTagName: 'a',
    render,
    ref: ref ? [linkRef, ref] : linkRef,
    state: { active } satisfies TocLinkState,
    props: mergeProps<'a'>(
      {
        href,
        'data-slot': 'toc-link',
        'aria-current': id !== null && currentId === id ? 'location' : undefined,
        className: cn(
          'text-foreground-muted block transform-gpu py-1.5 text-sm font-medium outline-none',
          'transition duration-250 motion-reduce:transition-none',
          'hover:text-foreground-intense focus-visible:text-foreground-intense data-active:text-foreground-intense',
          'active:scale-[0.98] active:translate-y-px active:duration-100 active:ease-in-out',
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85] [&_svg:not([class*='size-'])]:size-4.5",
          DEPTH_INDENT[Math.min(Math.max(Math.trunc(depth), 2), 6)],
          className,
        ),
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

export { Toc, TocList, TocItem, TocLink }
export type { TocProps, TocListProps, TocItemProps, TocLinkProps, TocLinkState }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">toc</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-toggle-group`,
    name: `Toggle Group (Appica)`,
    category: `Components`,
    tags: [`toggle-group`, `appica`],
    code: `// ─── toggle-group/toggle-group.tsx ───
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { cn } from '../../internal/utils'

interface ToggleGroupProps extends BaseToggleGroup.Props {}

function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <BaseToggleGroup
      data-slot="toggle-group"
      className={cn(
        'flex w-fit items-center gap-1',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup }
export type { ToggleGroupProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">toggle group</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-toggle`,
    name: `Toggle (Appica)`,
    category: `Components`,
    tags: [`toggle`, `appica`],
    code: `// ─── toggle/toggle.tsx ───
import { Toggle as BaseToggle } from '@base-ui/react/toggle'

interface ToggleProps extends BaseToggle.Props {}

function Toggle(props: ToggleProps) {
  return <BaseToggle data-slot="toggle" {...props} />
}

export { Toggle }
export type { ToggleProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">toggle</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-toolbar`,
    name: `Toolbar (Appica)`,
    category: `Navigation`,
    tags: [`nav`, `appica`],
    code: `// ─── toolbar/toolbar.tsx ───
import * as React from 'react'
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar'
import { cn } from '../../internal/utils'

interface ToolbarProps extends React.ComponentProps<typeof BaseToolbar.Root> {}

function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <BaseToolbar.Root
      data-slot="toolbar"
      className={cn(
        'bg-background flex w-fit items-center gap-1 rounded-lg border p-1',
        'max-h-full max-w-full scrollbar-none overflow-auto *:shrink-0 [&::-webkit-scrollbar]:hidden',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  )
}

interface ToolbarButtonProps extends React.ComponentProps<typeof BaseToolbar.Button> {}

function ToolbarButton(props: ToolbarButtonProps) {
  return <BaseToolbar.Button data-slot="toolbar-button" {...props} />
}

interface ToolbarLinkProps extends React.ComponentProps<typeof BaseToolbar.Link> {}

function ToolbarLink(props: ToolbarLinkProps) {
  return <BaseToolbar.Link data-slot="toolbar-link" {...props} />
}

interface ToolbarInputProps extends React.ComponentProps<typeof BaseToolbar.Input> {}

function ToolbarInput(props: ToolbarInputProps) {
  return <BaseToolbar.Input data-slot="toolbar-input" {...props} />
}

interface ToolbarGroupProps extends React.ComponentProps<typeof BaseToolbar.Group> {}

function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <BaseToolbar.Group
      data-slot="toolbar-group"
      className={cn('flex items-center gap-1 data-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  )
}

interface ToolbarSeparatorProps extends React.ComponentProps<typeof BaseToolbar.Separator> {}

function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <BaseToolbar.Separator
      data-slot="toolbar-separator"
      className={cn(
        'bg-border shrink-0',
        'data-[orientation=vertical]:mx-0.5 data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-(--border-width)',
        'data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-(--border-width) data-[orientation=horizontal]:w-full',
        className,
      )}
      {...props}
    />
  )
}

export { Toolbar, ToolbarButton, ToolbarLink, ToolbarInput, ToolbarGroup, ToolbarSeparator }
export type {
  ToolbarProps,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarInputProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
}
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">toolbar</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
  {
    id: `appica-tooltip`,
    name: `Tooltip (Appica)`,
    category: `Modals`,
    tags: [`overlay`, `appica`],
    code: `// ─── tooltip/tooltip.tsx ───
import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'

type TooltipProviderProps = React.ComponentProps<typeof BaseTooltip.Provider>

function TooltipProvider({ delay = 200, ...props }: TooltipProviderProps) {
  return <BaseTooltip.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

type TooltipProps = React.ComponentProps<typeof BaseTooltip.Root>

function Tooltip(props: TooltipProps) {
  return <BaseTooltip.Root {...props} />
}

type TooltipTriggerProps = React.ComponentProps<typeof BaseTooltip.Trigger>

function TooltipTrigger(props: TooltipTriggerProps) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = React.ComponentProps<typeof BaseTooltip.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseTooltip.Positioner>,
    React.ComponentProps<typeof BaseTooltip.Portal>
  > & {
    /**
     * Render the pointer.
     * @default true
     */
    arrow?: boolean
  }

function TooltipContent({ className, arrow = true, children, ...props }: TooltipContentProps) {
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseTooltip.Portal {...portal}>
      <BaseTooltip.Positioner
        side="top"
        align="center"
        alignOffset={0}
        sideOffset={arrow ? 8 : 4}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            'bg-background-inverse text-foreground-inverse rounded-xs px-3 py-1.5 text-xs shadow-md',
            'motion-safe:origin-(--transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            'data-instant:motion-safe:transition-none',
            className,
          )}
          {...popup}
        >
          {children}
          {arrow && (
            <BaseTooltip.Arrow
              data-slot="tooltip-arrow"
              className={cn(
                'bg-background-inverse fill-background-inverse size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]',
                'data-[side=top]:-bottom-2.5',
                'data-[side=bottom]:top-1',
                'data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2',
                'data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2',
                'data-[side=inline-start]:-inset-e-1 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-translate-y-1/2',
                'data-[side=inline-end]:-inset-s-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-translate-y-1/2',
              )}
            />
          )}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps, TooltipProviderProps }
`,
    previewHtml: `
<div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
  <div class="text-xs text-zinc-500 font-mono mb-2">@appica/ui-react</div>
  <div class="text-2xl font-semibold text-white capitalize mb-2">tooltip</div>
  <div class="text-sm text-zinc-400">From the Appica UI library — install via npm to use in your React project</div>
  <code class="mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-emerald-400 font-mono">npm install @appica/ui-react</code>
  <div class="mt-3 text-xs text-zinc-500">See the Code tab for the actual source from the package</div>
</div>
`,
    sourceUrl: `https://www.npmjs.com/package/@appica/ui-react`,
    description: `From @appica/ui-react · npm install @appica/ui-react`,
  },
];
