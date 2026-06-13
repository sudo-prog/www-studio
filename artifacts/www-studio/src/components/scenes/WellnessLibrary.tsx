import { useState } from "react";
import { makeElement, type SceneElement } from "@/lib/scene-types";
import { cn } from "@/lib/utils";

interface LibraryShape {
  id:          string;
  name:        string;
  category:    string;
  type:        SceneElement["type"];
  fill:        string;
  defaultW:    number;
  defaultH:    number;
  blur:        number;
  opacity:     number;
  svgPath?:    string;
  animation?:  Partial<SceneElement["animation"]>;
}

const SHAPES: LibraryShape[] = [
  // Orbs
  { id: "orb-sage",     name: "Sage Orb",      category: "orbs",    type: "circle", fill: "#7FB5A0", defaultW: 200, defaultH: 200, blur: 40, opacity: 0.7,  animation: { preset: "gentle-float" } },
  { id: "orb-lavender", name: "Lavender Orb",  category: "orbs",    type: "circle", fill: "#B39DC2", defaultW: 160, defaultH: 160, blur: 35, opacity: 0.65, animation: { preset: "gradient-breathe" } },
  { id: "orb-coral",    name: "Coral Orb",     category: "orbs",    type: "circle", fill: "#E8957A", defaultW: 220, defaultH: 220, blur: 45, opacity: 0.6,  animation: { preset: "shadow-pulse" } },
  { id: "orb-sky",      name: "Sky Orb",       category: "orbs",    type: "circle", fill: "#87BBDB", defaultW: 180, defaultH: 180, blur: 38, opacity: 0.7,  animation: { preset: "gentle-float" } },
  { id: "orb-peach",    name: "Peach Orb",     category: "orbs",    type: "circle", fill: "#F4C5A1", defaultW: 150, defaultH: 150, blur: 30, opacity: 0.75, animation: { preset: "gradient-breathe" } },
  { id: "orb-forest",   name: "Forest Orb",    category: "orbs",    type: "circle", fill: "#4A7C6B", defaultW: 190, defaultH: 190, blur: 35, opacity: 0.6,  animation: { preset: "gentle-float" } },

  // Blobs
  { id: "blob-sage",     name: "Sage Blob",    category: "blobs",   type: "blob",   fill: "#7FB5A0", defaultW: 240, defaultH: 220, blur: 8,  opacity: 0.75, svgPath: "M120,0 C186,0 240,54 240,120 C240,170 210,210 160,225 C110,240 60,220 25,175 C-10,130 0,60 40,25 C75,0 100,0 120,0Z", animation: { preset: "morph" } },
  { id: "blob-lavender", name: "Lavender Blob",category: "blobs",   type: "blob",   fill: "#B39DC2", defaultW: 200, defaultH: 210, blur: 5,  opacity: 0.7,  svgPath: "M100,0 C150,0 200,40 200,100 C200,160 155,210 100,210 C45,210 0,160 0,100 C0,40 50,0 100,0Z",              animation: { preset: "morph" } },
  { id: "blob-coral",    name: "Coral Blob",   category: "blobs",   type: "blob",   fill: "#E8957A", defaultW: 220, defaultH: 200, blur: 6,  opacity: 0.65, svgPath: "M110,0 C170,10 220,60 215,120 C210,180 155,220 95,215 C35,210 -5,160 2,100 C9,40 55,0 110,0Z",            animation: { preset: "morph" } },

  // Geometric
  { id: "circle-solid",  name: "Circle",       category: "shapes",  type: "circle", fill: "#B39DC2", defaultW: 100, defaultH: 100, blur: 0,  opacity: 0.9  },
  { id: "rect-rounded",  name: "Rounded Rect", category: "shapes",  type: "rect",   fill: "#87BBDB", defaultW: 160, defaultH: 100, blur: 0,  opacity: 0.85 },
  { id: "triangle",      name: "Triangle",     category: "shapes",  type: "triangle",fill: "#E8957A", defaultW: 100, defaultH: 100, blur: 0,  opacity: 0.85, svgPath: "M50,0 L100,100 L0,100 Z" },
  { id: "hexagon",       name: "Hexagon",      category: "shapes",  type: "hexagon", fill: "#7FB5A0", defaultW: 100, defaultH: 100, blur: 0,  opacity: 0.85, svgPath: "M50,0 L93,25 L93,75 L50,100 L7,75 L7,25 Z" },
  { id: "diamond",       name: "Diamond",      category: "shapes",  type: "diamond", fill: "#F4C5A1", defaultW: 100, defaultH: 120, blur: 0,  opacity: 0.85, svgPath: "M50,0 L100,60 L50,120 L0,60 Z" },
  { id: "star",          name: "Star",         category: "shapes",  type: "star",    fill: "#B39DC2", defaultW: 100, defaultH: 100, blur: 0,  opacity: 0.85, svgPath: "M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z" },

  // Lines
  { id: "line-h",        name: "Divider",      category: "lines",   type: "line",   fill: "#7FB5A0", defaultW: 300, defaultH: 2,   blur: 0,  opacity: 0.5  },
  { id: "line-wavy",     name: "Wave Line",    category: "lines",   type: "wave",   fill: "#87BBDB", defaultW: 300, defaultH: 60,  blur: 0,  opacity: 0.7,  svgPath: "M0,30 C50,0 100,60 150,30 C200,0 250,60 300,30" },

  // Text
  { id: "text-heading",  name: "Heading",      category: "text",    type: "text",   fill: "#1a1a1a", defaultW: 300, defaultH: 60,  blur: 0,  opacity: 1.0  },
  { id: "text-caption",  name: "Caption",      category: "text",    type: "text",   fill: "#6b7280", defaultW: 250, defaultH: 40,  blur: 0,  opacity: 1.0  },

  // Effects
  { id: "glow-ring-sage",    name: "Glow Ring",       category: "effects", type: "circle", fill: "#7FB5A0", defaultW: 250, defaultH: 250, blur: 60, opacity: 0.35, animation: { preset: "gradient-breathe" } },
  { id: "glow-ring-lavender",name: "Pulse Ring",      category: "effects", type: "circle", fill: "#B39DC2", defaultW: 300, defaultH: 300, blur: 70, opacity: 0.3,  animation: { preset: "shadow-pulse" } },
  { id: "aurora-1",          name: "Aurora Sweep",    category: "effects", type: "rect",   fill: "#7FB5A0", defaultW: 600, defaultH: 200, blur: 90, opacity: 0.25, animation: { preset: "aurora-sweep", duration: 8 } },
  { id: "aurora-2",          name: "Aurora Coral",    category: "effects", type: "rect",   fill: "#E8957A", defaultW: 500, defaultH: 180, blur: 80, opacity: 0.2,  animation: { preset: "gentle-float", duration: 10 } },
  { id: "aurora-3",          name: "Aurora Sky",      category: "effects", type: "rect",   fill: "#87BBDB", defaultW: 550, defaultH: 190, blur: 85, opacity: 0.22, animation: { preset: "aurora-sweep",  duration: 9 } },
  { id: "haze-forest",       name: "Forest Haze",     category: "effects", type: "circle", fill: "#4A7C6B", defaultW: 350, defaultH: 350, blur: 100,opacity: 0.2,  animation: { preset: "drift",          duration: 12 } },
  { id: "starburst",         name: "Starburst",       category: "effects", type: "star",   fill: "#FFD580", defaultW: 120, defaultH: 120, blur: 0,  opacity: 0.9,  svgPath: "M60,5 L72,40 L108,40 L79,62 L91,97 L60,75 L29,97 L41,62 L12,40 L48,40 Z", animation: { preset: "spin-slow", duration: 20 } },
  { id: "sacred-flower",     name: "Sacred Flower",   category: "effects", type: "blob",   fill: "#B39DC2", defaultW: 150, defaultH: 150, blur: 0,  opacity: 0.75, svgPath: "M75,0 C85,35 110,50 75,75 C40,100 15,85 25,50 C10,25 40,0 75,0Z", animation: { preset: "morph", duration: 7 } },
  { id: "moon-crescent",     name: "Moon Crescent",   category: "effects", type: "blob",   fill: "#F4C5A1", defaultW: 100, defaultH: 100, blur: 0,  opacity: 0.85, svgPath: "M50,5 C72,5 90,22 90,50 C90,78 72,95 50,95 C62,75 62,25 50,5Z", animation: { preset: "gentle-float", duration: 6 } },
  { id: "cosmic-ring",       name: "Cosmic Ring",     category: "effects", type: "circle", fill: "#B39DC2", defaultW: 200, defaultH: 200, blur: 2,  opacity: 0.5,  animation: { preset: "cosmic-pulse", duration: 8 } },
  { id: "drift-orb-gold",    name: "Gold Drift",      category: "effects", type: "circle", fill: "#FFD580", defaultW: 160, defaultH: 160, blur: 20, opacity: 0.45, animation: { preset: "drift", duration: 9 } },

  // Gradients (blurred rect layers)
  { id: "grad-sunset",   name: "Sunset Wash",     category: "gradients", type: "rect",   fill: "#E8957A", defaultW: 800, defaultH: 300, blur: 120, opacity: 0.3, animation: { preset: "aurora-sweep", duration: 10 } },
  { id: "grad-ocean",    name: "Ocean Depth",     category: "gradients", type: "rect",   fill: "#87BBDB", defaultW: 700, defaultH: 280, blur: 100, opacity: 0.28, animation: { preset: "aurora-sweep", duration: 12 } },
  { id: "grad-forest",   name: "Forest Mist",     category: "gradients", type: "circle", fill: "#4A7C6B", defaultW: 500, defaultH: 500, blur: 130, opacity: 0.22, animation: { preset: "drift",        duration: 14 } },
  { id: "grad-lavender", name: "Lavender Field",  category: "gradients", type: "circle", fill: "#B39DC2", defaultW: 600, defaultH: 400, blur: 110, opacity: 0.25, animation: { preset: "gentle-float", duration: 11 } },
  { id: "grad-golden",   name: "Golden Hour",     category: "gradients", type: "rect",   fill: "#FFD580", defaultW: 900, defaultH: 250, blur: 140, opacity: 0.2,  animation: { preset: "aurora-sweep", duration: 15 } },
  { id: "grad-cosmic",   name: "Cosmic Dark",     category: "gradients", type: "circle", fill: "#1a1a4e", defaultW: 700, defaultH: 700, blur: 150, opacity: 0.6,  animation: { preset: "drift",        duration: 20 } },
  { id: "grad-rose",     name: "Rose Bloom",      category: "gradients", type: "circle", fill: "#E8957A", defaultW: 450, defaultH: 450, blur: 100, opacity: 0.3,  animation: { preset: "gradient-breathe", duration: 8 } },

  // Icons (SVG paths)
  { id: "icon-leaf",     name: "Leaf",            category: "icons",    type: "blob",   fill: "#7FB5A0", defaultW: 80,  defaultH: 80,  blur: 0, opacity: 0.9, svgPath: "M40,0 C70,10 80,40 60,70 C50,85 30,80 20,65 C5,45 10,10 40,0Z" },
  { id: "icon-drop",     name: "Water Drop",      category: "icons",    type: "blob",   fill: "#87BBDB", defaultW: 70,  defaultH: 90,  blur: 0, opacity: 0.9, svgPath: "M35,0 C55,25 70,50 70,65 C70,83 54,95 35,95 C16,95 0,83 0,65 C0,50 15,25 35,0Z" },
  { id: "icon-lotus",    name: "Lotus",           category: "icons",    type: "blob",   fill: "#B39DC2", defaultW: 100, defaultH: 80,  blur: 0, opacity: 0.85, svgPath: "M50,70 C30,70 5,50 10,30 C15,10 35,5 50,20 C65,5 85,10 90,30 C95,50 70,70 50,70Z" },
  { id: "icon-mountain", name: "Mountain",        category: "icons",    type: "triangle", fill: "#4A7C6B", defaultW: 120, defaultH: 100, blur: 0, opacity: 0.85, svgPath: "M60,0 L120,100 L0,100Z" },
  { id: "icon-sun",      name: "Sun Ring",        category: "icons",    type: "circle", fill: "#FFD580", defaultW: 90,  defaultH: 90,  blur: 0, opacity: 0.9, animation: { preset: "spin-slow", duration: 30 } },
  { id: "icon-infinity", name: "Infinity",        category: "icons",    type: "wave",   fill: "#B39DC2", defaultW: 160, defaultH: 60,  blur: 0, opacity: 0.9, svgPath: "M20,30 C20,10 50,10 80,30 C110,50 140,50 140,30 C140,10 110,10 80,30 C50,50 20,50 20,30Z" },
  { id: "icon-spiral",   name: "Spiral",          category: "icons",    type: "wave",   fill: "#87BBDB", defaultW: 120, defaultH: 120, blur: 0, opacity: 0.85, svgPath: "M60,60 C60,45 75,40 80,50 C85,65 70,75 55,68 C40,60 40,40 55,35 C75,28 90,45 85,65 C78,85 55,88 40,75" },
];

const CATEGORIES = [
  { id: "orbs",      label: "Orbs"      },
  { id: "blobs",     label: "Blobs"     },
  { id: "shapes",    label: "Shapes"    },
  { id: "effects",   label: "Effects"   },
  { id: "gradients", label: "Gradients" },
  { id: "icons",     label: "Icons"     },
  { id: "lines",     label: "Lines"     },
  { id: "text",      label: "Text"      },
];

interface Props {
  onAdd: (el: SceneElement) => void;
}

export function WellnessLibrary({ onAdd }: Props) {
  const [activeCategory, setActiveCategory] = useState("orbs");

  const filtered = SHAPES.filter((s) => s.category === activeCategory);

  function handleAdd(shape: LibraryShape) {
    const el = makeElement({
      type:      shape.type,
      name:      shape.name,
      width:     shape.defaultW,
      height:    shape.defaultH,
      fill:      shape.fill,
      blur:      shape.blur,
      opacity:   shape.opacity,
      svgPath:   shape.svgPath,
      animation: { preset: "none", duration: 3, delay: 0, easing: "ease-in-out", loop: true, ...shape.animation },
      x:         Math.round(200 + Math.random() * 600),
      y:         Math.round(100 + Math.random() * 400),
      ...(shape.type === "text" ? { text: "Your text here", fontSize: 32, fontWeight: 600 } : {}),
    });
    onAdd(el);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Elements</p>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "text-xs px-2 py-1 rounded-md transition-colors",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
        {filtered.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleAdd(shape)}
            className="group flex flex-col items-center gap-2 p-2 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
          >
            <div className="w-full h-12 flex items-center justify-center">
              <svg viewBox="0 0 60 60" width="48" height="48">
                {shape.type === "circle" && (
                  <circle cx="30" cy="30" r={20} fill={shape.fill} opacity={shape.opacity} />
                )}
                {shape.type === "rect" && (
                  <rect x="5" y="15" width="50" height="30" rx="6" fill={shape.fill} opacity={shape.opacity} />
                )}
                {(shape.type === "blob" || shape.svgPath) && shape.type !== "rect" && shape.type !== "circle" && shape.type !== "wave" && shape.type !== "line" && shape.type !== "text" && (
                  <g transform="scale(0.22) translate(30,30)">
                    <path d={shape.svgPath!} fill={shape.fill} opacity={shape.opacity} />
                  </g>
                )}
                {shape.type === "wave" && (
                  <path d="M0,30 C10,15 20,45 30,30 C40,15 50,45 60,30" stroke={shape.fill} strokeWidth="2.5" fill="none" opacity={shape.opacity} />
                )}
                {shape.type === "line" && (
                  <line x1="5" y1="30" x2="55" y2="30" stroke={shape.fill} strokeWidth="2" opacity={shape.opacity} />
                )}
                {shape.type === "text" && (
                  <text x="30" y="36" textAnchor="middle" fontSize="11" fill={shape.fill} fontWeight="600">Aa</text>
                )}
                {shape.type === "triangle" && (
                  <polygon points="30,10 55,50 5,50" fill={shape.fill} opacity={shape.opacity} />
                )}
                {shape.type === "hexagon" && (
                  <polygon points="30,8 50,19 50,41 30,52 10,41 10,19" fill={shape.fill} opacity={shape.opacity} />
                )}
                {shape.type === "diamond" && (
                  <polygon points="30,8 52,30 30,52 8,30" fill={shape.fill} opacity={shape.opacity} />
                )}
                {shape.type === "star" && (
                  shape.svgPath
                    ? <g transform="translate(30,30) scale(0.35) translate(-60,-60)"><path d={shape.svgPath} fill={shape.fill} opacity={shape.opacity} /></g>
                    : <polygon points="30,8 34,22 49,22 37,31 41,45 30,36 19,45 23,31 11,22 26,22" fill={shape.fill} opacity={shape.opacity} />
                )}
              </svg>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight group-hover:text-foreground transition-colors">{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
