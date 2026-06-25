// ── Freeform Page Types ──────────────────────────────────────────────────────

export type FreeformElementType =
  | "text"
  | "image"
  | "shape"
  | "button"
  | "sticker"
  | "embed"
  | "draw"
  | "link-card";

export type ShapeKind = "rectangle" | "circle" | "triangle" | "star" | "diamond" | "line";

export interface FreeformElement {
  id:        string;
  type:      FreeformElementType;
  /** Position in px relative to canvas top-left */
  x:         number;
  y:         number;
  /** Size in px */
  width:     number;
  height:    number;
  /** Rotation in degrees */
  rotation:  number;
  /** Scale factor (1 = default) */
  scale:     number;
  /** Z-index for stacking */
  zIndex:    number;
  /** Opacity (0–1) */
  opacity:  number;
  // ── Content ───────────────────────
  /** Text content (type=text) */
  text?:       string;
  fontSize?:   number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?:  "left" | "center" | "right";
  color?:      string;
  /** Image URL (type=image) */
  src?:        string;
  /** Shape kind (type=shape) */
  shapeKind?:  ShapeKind;
  fill?:       string;
  stroke?:     string;
  strokeWidth?: number;
  /** Button label + link (type=button) */
  label?:      string;
  href?:       string;
  /** Sticker URL (type=sticker) */
  stickerUrl?: string;
  /** Embed data (type=embed) */
  embedUrl?:   string;
  embedType?:  "youtube" | "spotify" | "twitter" | "generic";
  /** Drawing data (type=draw) */
  drawData?:   string; // JSON-encoded path data
  // ── Style ─────────────────────────
  borderRadius?: number;
  boxShadow?:    string;
  background?:   string;
  // ── Meta ──────────────────────────
  locked?:   boolean;
  visible?:  boolean;
  name?:     string;
}

export interface FreeformBackground {
  type:      "color" | "gradient" | "image";
  value:     string;   // hex color, full CSS gradient, or image URL
  opacity?:  number;   // for image overlay
}

export interface FreeformPage {
  id:          string;
  userId:      string;
  name:        string;
  slug:        string;
  description?: string;
  canvasWidth:  number;
  canvasHeight: number;
  elements:    FreeformElement[];
  background: FreeformBackground;
  status:      "draft" | "published";
  isPrivate:   boolean;
  likes:       number;
  viewCount:   number;
  tags:        string[];
  createdAt:   string;
  updatedAt:   string;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_BACKGROUND: FreeformBackground = {
  type:  "gradient",
  value: "linear-gradient(135deg, #0d1117 0%, #16151c 50%, #1a1a2e 100%)",
};

export function makeFreeformElement(
  type: FreeformElementType,
  overrides: Partial<FreeformElement> = {}
): FreeformElement {
  const id = crypto.randomUUID();
  const defaults: Record<FreeformElementType, Partial<FreeformElement>> = {
    text:      { width: 200, height: 60, fontSize: 32, fontWeight: 600, color: "#ffffff", text: "Click to edit text", textAlign: "left" },
    image:     { width: 200, height: 160, borderRadius: 8 },
    shape:     { width: 120, height: 120, shapeKind: "rectangle", fill: "#7FB5A0", borderRadius: 12 },
    button:    { width: 160, height: 48, borderRadius: 24, fill: "#3b82f6", label: "Click me", href: "#" },
    sticker:   { width: 80, height: 80 },
    embed:     { width: 400, height: 300, embedType: "generic" },
    draw:      { width: 300, height: 200 },
    "link-card": { width: 300, height: 100, borderRadius: 12 },
  };

  return {
    id,
    type,
    x:        100,
    y:        100,
    width:    120,
    height:   120,
    rotation: 0,
    scale:    1,
    zIndex:   0,
    opacity:  1,
    visible:  true,
    locked:   false,
    name:     type,
    ...defaults[type],
    ...overrides,
  } as FreeformElement;
}

// ── Alignment helpers ────────────────────────────────────────────────────────

export interface AlignmentGuide {
  type:   "horizontal" | "vertical";
  position: number;
  source: string;  // element id
  target: string;  // element id
}

export function computeAlignmentGuides(
  movingEl: FreeformElement,
  allEls: FreeformElement[],
  threshold: number = 5
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const cx1 = movingEl.x + movingEl.width / 2;
  const cy1 = movingEl.y + movingEl.height / 2;
  const top1 = movingEl.y;
  const bot1 = movingEl.y + movingEl.height;
  const left1 = movingEl.x;
  const right1 = movingEl.x + movingEl.width;

  for (const el of allEls) {
    if (el.id === movingEl.id) continue;
    const cx2 = el.x + el.width / 2;
    const cy2 = el.y + el.height / 2;

    // Center alignment
    if (Math.abs(cx1 - cx2) < threshold) guides.push({ type: "vertical", position: cx2, source: movingEl.id, target: el.id });
    if (Math.abs(cy1 - cy2) < threshold) guides.push({ type: "horizontal", position: cy2, source: movingEl.id, target: el.id });

    // Edge alignment
    if (Math.abs(top1 - el.y) < threshold) guides.push({ type: "horizontal", position: el.y, source: movingEl.id, target: el.id });
    if (Math.abs(bot1 - (el.y + el.height)) < threshold) guides.push({ type: "horizontal", position: el.y + el.height, source: movingEl.id, target: el.id });
    if (Math.abs(left1 - el.x) < threshold) guides.push({ type: "vertical", position: el.x, source: movingEl.id, target: el.id });
    if (Math.abs(right1 - (el.x + el.width)) < threshold) guides.push({ type: "vertical", position: el.x + el.width, source: movingEl.id, target: el.id });
  }
  return guides;
}

// ── Snap to grid ─────────────────────────────────────────────────────────────

export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

// ── Smart paste detector for embeds ──────────────────────────────────────────

export function detectEmbedUrl(url: string): { embedUrl: string; embedType: "youtube" | "spotify" | "twitter" | "generic" } | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`, embedType: "youtube" };

  // Spotify
  const spMatch = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (spMatch) return { embedUrl: `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}`, embedType: "spotify" };

  // Twitter/X
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return { embedUrl: url, embedType: "twitter" };
  }

  // Generic iframe
  if (url.startsWith("http")) {
    return { embedUrl: url, embedType: "generic" };
  }

  return null;
}
