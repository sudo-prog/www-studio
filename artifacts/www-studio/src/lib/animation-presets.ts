import { type AnimationPreset } from "@/lib/scene-types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

// Preset types
export type GSAPAnimationPreset = {
  id: string;
  name: string;
  category: "svg" | "scroll" | "ui" | "morph" | "stagger";
  apply: (target: gsap.TweenTarget, options?: any) => gsap.core.Animation | void;
  motionVariant?: any;
};

// SVG & Path Animations
export const gsapPresets: GSAPAnimationPreset[] = [
  {
    id: "stroke-draw",
    name: "Stroke Draw",
    category: "svg",
    apply: (target, opts = {}) => {
      return gsap.fromTo(
        target,
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 2, ease: "power2.out", ...opts }
      );
    },
  },
  {
    id: "morph",
    name: "Path Morph",
    category: "morph",
    apply: (target, opts = {}) => {
      return gsap.to(target, {
        attr: { d: opts.toPath || "" },
        duration: 1.5,
        ease: "power2.inOut",
        ...opts,
      });
    },
  },
  {
    id: "gradient-flow",
    name: "Gradient Flow",
    category: "svg",
    apply: (target) =>
      gsap.to(target, { rotation: 360, duration: 20, repeat: -1, ease: "none" }),
  },
];

// ScrollTrigger Presets (maximatherapy.com style)
export const scrollPresets: GSAPAnimationPreset[] = [
  {
    id: "parallax",
    name: "Parallax Layer",
    category: "scroll",
    apply: (target, opts = {}) => {
      const instance = ScrollTrigger.create({
        trigger: target as Element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(target, { y: self.progress * -150 });
        },
        ...opts,
      });
      return instance as unknown as gsap.core.Animation;
    },
  },
  {
    id: "pin-scrub",
    name: "Pin + Scrub Timeline",
    category: "scroll",
    apply: (target, opts = {}) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: target as Element,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=200%",
          ...opts,
        },
      });
      return tl;
    },
  },
  {
    id: "reveal-stagger",
    name: "Scroll Reveal Stagger",
    category: "stagger",
    apply: (targets) => {
      const els = targets as Element[];
      return gsap.from(targets, {
        opacity: 0,
        y: 100,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: { trigger: els[0], start: "top 80%" },
      });
    },
  },
];

// Framer Motion Variants (complementary)
export const motionVariants = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  gentleFloat: {
    animate: {
      y: [-20, 20, -20],
      transition: { duration: 6, repeat: Infinity },
    },
  },
  scrollTriggered: (delay = 0) => ({
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { delay, duration: 0.7 },
  }),
};

// Helper hook
export const usePresetAnimation = (
  presetId: string,
  targetRef: RefObject<HTMLElement | SVGElement | null>,
  options: Record<string, any> = {}
) => {
  useGSAP(() => {
    const preset = [...gsapPresets, ...scrollPresets].find((p) => p.id === presetId);
    if (preset && targetRef.current) preset.apply(targetRef.current, options);
  }, [presetId]);
};

// CSS keyframe strings used in SVG exports
export const CSS_KEYFRAMES: Record<string, string> = {
  none:             "",
  "gentle-float":   "@keyframes gentle-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}",
  "gradient-breathe":"@keyframes gradient-breathe{0%,100%{opacity:var(--op,0.7);transform:scale(1)}50%{opacity:calc(var(--op,0.7)+0.2);transform:scale(1.06)}}",
  "shadow-pulse":   "@keyframes shadow-pulse{0%,100%{opacity:var(--op,0.7)}50%{opacity:calc(var(--op,0.7)+0.25)}}",
  "scale-pulse":    "@keyframes scale-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}",
  "fade-in-out":    "@keyframes fade-in-out{0%,100%{opacity:var(--op,0.7)}50%{opacity:calc(var(--op,0.7)*0.4)}}",
  "morph":           "@keyframes morph{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.05) rotate(3deg)}}",
  "spin-slow":       "@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
  "elastic-bounce":  "@keyframes elastic-bounce{0%,100%{transform:scale(1)}30%{transform:scale(1.15)}60%{transform:scale(0.92)}80%{transform:scale(1.06)}}",
  "hover-lift":      "@keyframes hover-lift{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.04)}}",
  "scroll-reveal":   "@keyframes scroll-reveal{0%{opacity:0;transform:translateY(20px)}100%{opacity:var(--op,0.7);transform:translateY(0)}}",
  "drift":            "@keyframes drift{0%,100%{transform:translateX(0)}50%{transform:translateX(15px)}}",
};

export function allCssKeyframes(): string {
  return Object.values(CSS_KEYFRAMES).filter((v): v is string => typeof v === "string").join("\n");
}

export { gsap, ScrollTrigger, useGSAP };
export default { gsapPresets, scrollPresets, motionVariants, usePresetAnimation };
