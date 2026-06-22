export type AnimationPreset =
  | "none"
  | "gentle-float"
  | "gradient-breathe"
  | "shadow-pulse"
  | "hover-lift"
  | "scroll-reveal"
  | "morph"
  | "spin-slow"
  | "fade-in-out"
  | "scale-pulse"
  | "elastic-bounce"
  | "drift"
  | "aurora-sweep"
  | "cosmic-pulse"
  | "lenis-parallax";

export type ElementType =
  | "circle"
  | "rect"
  | "blob"
  | "wave"
  | "leaf"
  | "triangle"
  | "hexagon"
  | "star"
  | "diamond"
  | "text"
  | "line";

export interface ScrollConfig {
  enabled:     boolean;
  trigger?:    string;
  end?:        string;
  scrub?:      boolean | number;
  pin?:        boolean;
  markers?:    boolean;
  scaleFrom?:  number;
}

export interface ElementAnimation {
  preset:       AnimationPreset;
  duration:     number;
  delay:        number;
  easing:       string;
  loop:         boolean;
  scrollConfig?: ScrollConfig;
}

export interface SceneElement {
  id:          string;
  type:        ElementType;
  name:        string;
  x:           number;
  y:           number;
  width:       number;
  height:      number;
  fill:        string;
  fillOpacity: number;
  stroke?:     string;
  strokeWidth: number;
  opacity:     number;
  rotation:    number;
  blur:        number;
  visible:     boolean;
  locked:      boolean;
  zIndex:      number;
  svgPath?:    string;
  text?:       string;
  fontSize?:   number;
  fontFamily?: string;
  fontWeight?: number;
  animation:   ElementAnimation;
}

export interface WellnessTokens {
  sage:     string;
  lavender: string;
  coral:    string;
  sky:      string;
  peach:    string;
  forest:   string;
  mist:     string;
  sand:     string;
}

export interface SceneData {
  id:          string;
  name:        string;
  canvasWidth: number;
  canvasHeight:number;
  elements:    SceneElement[];
  background:  string;
  themeTokens: WellnessTokens;
  status:      "draft" | "published";
  updatedAt:   string;
}

export const DEFAULT_WELLNESS_TOKENS: WellnessTokens = {
  sage:     "#7FB5A0",
  lavender: "#B39DC2",
  coral:    "#E8957A",
  sky:      "#87BBDB",
  peach:    "#F4C5A1",
  forest:   "#4A7C6B",
  mist:     "#C8D8E0",
  sand:     "#E8DDD0",
};

export const DEFAULT_ANIMATION: ElementAnimation = {
  preset:   "none",
  duration: 3,
  delay:    0,
  easing:   "ease-in-out",
  loop:     true,
};

export function makeElement(overrides: Partial<SceneElement> & Pick<SceneElement, "type">): SceneElement {
  return {
    id:          crypto.randomUUID(),
    name:        overrides.type,
    x:           100,
    y:           100,
    width:       120,
    height:      120,
    fill:        "#7FB5A0",
    fillOpacity: 1,
    strokeWidth: 0,
    opacity:     0.85,
    rotation:    0,
    blur:        0,
    visible:     true,
    locked:      false,
    zIndex:      0,
    animation:   DEFAULT_ANIMATION,
    ...overrides,
  };
}
