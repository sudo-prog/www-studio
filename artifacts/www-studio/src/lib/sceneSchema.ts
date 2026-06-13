import { z } from "zod";

export const ElementSchema = z.object({
  id: z.string(),
  type: z.enum(["svg", "group", "text", "image", "shape"]),
  svgData: z.string().optional(),
  attrs: z.record(z.any()).default({}),
  styles: z.record(z.any()).default({}),
  position: z.object({
    x: z.number(),
    y: z.number(),
    rotation: z.number().default(0),
    scale: z.number().default(1),
  }),
});

export const KeyframeSchema = z.object({
  time: z.number(),
  properties: z.record(z.any()),
  ease: z.string().default("power2.inOut"),
});

export const AnimationClipSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  presetId: z.string().optional(),
  type: z.enum(["tween", "timeline", "scroll"]),
  duration: z.number().optional(),
  keyframes: z.array(KeyframeSchema).optional(),
  scrollTrigger: z
    .object({
      trigger: z.string().optional(),
      start: z.string().default("top bottom"),
      end: z.string().default("bottom top"),
      scrub: z.union([z.boolean(), z.number()]).default(false),
      pin: z.boolean().default(false),
      markers: z.boolean().default(false),
    })
    .optional(),
});

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  elements: z.array(ElementSchema),
  animations: z.array(AnimationClipSchema),
  timeline: z
    .object({
      duration: z.number().default(10),
      loop: z.boolean().default(false),
    })
    .optional(),
  scrollConfig: z
    .object({
      enabled: z.boolean().default(true),
      lenis: z.boolean().default(true),
      globalTriggers: z.boolean().default(true),
    })
    .default({}),
  metadata: z.object({
    style: z.string().default("general"),
    exportedAt: z.string().optional(),
  }),
});

export type Scene = z.infer<typeof SceneSchema>;
export type SceneElement = z.infer<typeof ElementSchema>;
export type AnimationClip = z.infer<typeof AnimationClipSchema>;
export type Keyframe = z.infer<typeof KeyframeSchema>;

// ── Wellness palette (kept for backward compat) ───────────────────────────────
export const WELLNESS_PALETTE = {
  sage:     "#7FB5A0",
  lavender: "#B39DC2",
  coral:    "#E8957A",
  sky:      "#87BBDB",
  peach:    "#F4C5A1",
  forest:   "#4A7C6B",
  mist:     "#C8D8E0",
  sand:     "#E8DDD0",
} as const;
