import { useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneElement, ScrollConfig } from "@/lib/scene-types";

gsap.registerPlugin(ScrollTrigger);

export interface GSAPAnimationHandle {
  play: () => void;
  pause: () => void;
  reverse: () => void;
  restart: () => void;
  kill: () => void;
  timeline: gsap.core.Timeline;
}

/** Apply a CSS-like preset name to an element via GSAP */
export function applyPresetGSAP(
  el: HTMLElement | SVGElement,
  preset: SceneElement["animation"]["preset"],
  anim: SceneElement["animation"],
  scrollCfg?: ScrollConfig
): GSAPAnimationHandle | null {
  if (preset === "none" || !el) return null;

  const dur = anim?.duration ?? 3;
  const delay = anim?.delay ?? 0;
  const ease = anim?.easing ?? "ease-in-out";
  const loop = anim?.loop !== false;

  const vars: gsap.TweenVars = { duration: dur, delay, ease, repeat: loop ? -1 : 0, yoyo: true };
  let tween: gsap.core.Tween | null = null;

  switch (preset) {
    case "gentle-float":
      vars.y = -18;
      break;
    case "gradient-breathe": {
      const op = (el as HTMLElement).style.opacity ? parseFloat((el as HTMLElement).style.opacity) : 0.7;
      tween = gsap.fromTo(el, { opacity: op }, { ...vars, opacity: op * 0.45, clearProps: "opacity" });
      break;
    }
    case "shadow-pulse": {
      const color = (el as HTMLElement).style.color || "#ffffff";
      tween = gsap.fromTo(el, { filter: `drop-shadow(0 0 0px ${color})` }, { ...vars, filter: `drop-shadow(0 0 18px ${color})` });
      break;
    }
    case "hover-lift":
      vars.y = -10;
      vars.scale = 1.04;
      break;
    case "morph":
      vars.borderRadius = "30% 60% 70% 40%/50% 60% 30% 60%";
      break;
    case "spin-slow":
      vars.rotation = 360;
      vars.repeat = -1;
      vars.ease = "none";
      vars.yoyo = false;
      break;
    case "scale-pulse":
      vars.scale = 1.15;
      break;
    case "elastic-bounce":
      vars.y = -20;
      (vars as any).type = "spring";
      (vars as any).bounce = 0.4;
      break;
    case "fade-in-out":
      vars.opacity = 0.08;
      break;
    case "drift":
      vars.x = 15;
      break;
    case "aurora-sweep":
      vars.x = "-5%";
      break;
    case "cosmic-pulse":
      vars.scale = 1.1;
      vars.rotation = 180;
      break;
    case "scroll-reveal":
      vars.opacity = 1;
      vars.y = 0;
      (vars as any).scrollTrigger = {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none reverse",
      };
      break;
    case "lenis-parallax":
      (vars as any).scrollTrigger = {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self: ScrollTrigger) => {
          gsap.set(el, { y: self.progress * -150 });
        },
      };
      break;
    default:
      break;
  }

  // Build the timeline (empty if using fromTo)
  const timeline = gsap.timeline({ paused: false });

  if (scrollCfg?.enabled) {
    (vars as any).scrollTrigger = {
      trigger: el instanceof Element ? el : undefined,
      start: scrollCfg.trigger,
      end: scrollCfg.end,
      scrub: scrollCfg.scrub === true ? 1 : scrollCfg.scrub === false ? false : scrollCfg.scrub,
      pin: scrollCfg.pin,
      markers: scrollCfg.markers,
      onEnter: () => gsap.to(el, vars as any),
      onLeaveBack: () => gsap.to(el, { clearProps: "all" }),
    };
  }

  if (!tween) {
    tween = gsap.to(el, vars);
  }

  timeline.add(tween, 0);

  return {
    play: () => timeline.play(),
    pause: () => timeline.pause(),
    reverse: () => timeline.reverse(),
    restart: () => timeline.restart(),
    kill: () => timeline.kill(),
    timeline,
  };
}

/**
 * useGSAPCanvas
 *
 * Attaches GSAP animations to a list of SceneElements on a canvas ref.
 * Returns a controls object to play/pause/restart all animations.
 */
export function useGSAPCanvas(
  elements: SceneElement[],
  canvasRef: { current: SVGSVGElement | null },
  options: { enabled?: boolean; debug?: boolean } = {}
) {
  const { enabled = true, debug = false } = options;
  const handlesRef = useRef<Map<string, GSAPAnimationHandle | null>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Boot Lenis (editor scroll smoothing)
  useEffect(() => {
    if (!enabled) return;
    let lenis: { destroy: () => void } | null = null;
    import("lenis")
      .then(({ default: Lenis }) => {
        lenis = new Lenis({ autoRaf: true, lerp: 0.08, duration: 1.2 });
      })
      .catch(() => {});

    return () => {
      lenis?.destroy();
    };
  }, [enabled]);

  // Sync ScrollTrigger on resize
  useEffect(() => {
    if (!enabled) return;
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled]);

  // Attach / detach pref: apply animations via refs
  const playAll = useCallback(() => handlesRef.current.forEach((h) => h?.play()), []);
  const pauseAll = useCallback(() => handlesRef.current.forEach((h) => h?.pause()), []);
  const restartAll = useCallback(() => handlesRef.current.forEach((h) => h?.restart()), []);

  return {
    playAll,
    pauseAll,
    restartAll,
    handles: handlesRef.current,
  };
}
