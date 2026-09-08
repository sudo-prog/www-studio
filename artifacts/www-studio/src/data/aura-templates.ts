// ─────────────────────────────────────────────────────────────────────────────
// AURA Website Templates
// Full-site website templates (not individual components) for the community
// templates page. Each template is a complete HTML site with its own page,
// assets, and responsive breakpoints. Preview renders in a sandboxed iframe
// pointing to the static file in /public/aura-templates/.
// ─────────────────────────────────────────────────────────────────────────────

export interface WebsiteTemplateItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  /** URL of the preview iframe (static file in /public/aura-templates/) */
  previewUrl: string;
  /** External source URL */
  sourceUrl: string;
  /** Short description */
  description: string;
}

export const WEBSITE_TEMPLATES: WebsiteTemplateItem[] = [
  {
    id: "aura-building-01-building",
    name: "AETHEREAL | Future Living",
    slug: "building-01-building",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-01-building/",
    sourceUrl: "https://www.aura.build/building-01-building/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-02-vectorqx",
    name: "VectorQX - Precision Engineering",
    slug: "building-02-vectorqx",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-02-vectorqx/",
    sourceUrl: "https://www.aura.build/building-02-vectorqx/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-03-luxe",
    name: "LuxeEstate - Premium Real Estate Ecosystem",
    slug: "building-03-luxe",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-03-luxe/",
    sourceUrl: "https://www.aura.build/building-03-luxe/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-04",
    name: "RenovAlgarve — Premium Property Transformation",
    slug: "building-04",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-04/",
    sourceUrl: "https://www.aura.build/building-04/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-05",
    name: "T&T Pergola | Sydney's Outdoor Living Experts",
    slug: "building-05",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-05/",
    sourceUrl: "https://www.aura.build/building-05/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-06",
    name: "Silva Bau",
    slug: "building-06",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-06/",
    sourceUrl: "https://www.aura.build/building-06/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-07-elyse",
    name: "Elyse Residence",
    slug: "building-07-elyse",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-07-elyse/",
    sourceUrl: "https://www.aura.build/building-07-elyse/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-08-alta",
    name: "Alta Fencing | Architectural Boundaries",
    slug: "building-08-alta",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-08-alta/",
    sourceUrl: "https://www.aura.build/building-08-alta/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-09-aaaaa",
    name: "KRYPTOS | High-Yield Real Estate Intelligence",
    slug: "building-09-aaaaa",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-09-aaaaa/",
    sourceUrl: "https://www.aura.build/building-09-aaaaa/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-10-sleek",
    name: "MAISON BRUT | Structural Luxury",
    slug: "building-10-sleek",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-10-sleek/",
    sourceUrl: "https://www.aura.build/building-10-sleek/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-11-uslu-immobilien",
    name: "USLU IMMOBILIEN | Projektentwicklung & Management",
    slug: "building-11-uslu-immobilien",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-11-uslu-immobilien/",
    sourceUrl: "https://www.aura.build/building-11-uslu-immobilien/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-building-12-svrn",
    name: "SVRN | Global Estate Platform",
    slug: "building-12-svrn",
    category: "Building",
    tags: ["aura", "template", "building", "construction", "real-estate"],
    previewUrl: "/aura-templates/building-12-svrn/",
    sourceUrl: "https://www.aura.build/building-12-svrn/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-design-01-designstudio",
    name: "DesignStudio — Web Design Services",
    slug: "design-01-designstudio",
    category: "Design",
    tags: ["aura", "template", "design", "studio", "creative"],
    previewUrl: "/aura-templates/design-01-designstudio/",
    sourceUrl: "https://www.aura.build/design-01-designstudio/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-e-commerce-01-pricingcards",
    name: "Modern Pricing Cards",
    slug: "e-commerce-01-pricingcards",
    category: "E-commerce",
    tags: ["aura", "template", "e-commerce", "shop", "pricing"],
    previewUrl: "/aura-templates/e-commerce-01-pricingcards/",
    sourceUrl: "https://www.aura.build/e-commerce-01-pricingcards/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-e-commerce-02-lusine",
    name: "Lusine | Solde d'après Noël",
    slug: "e-commerce-02-lusine",
    category: "E-commerce",
    tags: ["aura", "template", "e-commerce", "shop", "pricing"],
    previewUrl: "/aura-templates/e-commerce-02-lusine/",
    sourceUrl: "https://www.aura.build/e-commerce-02-lusine/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-tech-01-nexus",
    name: "NEXUS // OS | Enterprise AI Infrastructure",
    slug: "tech-01-nexus",
    category: "Tech",
    tags: ["aura", "template", "tech", "dashboard", "ai"],
    previewUrl: "/aura-templates/tech-01-nexus/",
    sourceUrl: "https://www.aura.build/tech-01-nexus/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-tech-02-aether",
    name: "AETHER | Kinetic Library",
    slug: "tech-02-aether",
    category: "Tech",
    tags: ["aura", "template", "tech", "dashboard", "ai"],
    previewUrl: "/aura-templates/tech-02-aether/",
    sourceUrl: "https://www.aura.build/tech-02-aether/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-tech-03-dashboard",
    name: "SoundForge Pro Dashboard",
    slug: "tech-03-dashboard",
    category: "Tech",
    tags: ["aura", "template", "tech", "dashboard", "ai"],
    previewUrl: "/aura-templates/tech-03-dashboard/",
    sourceUrl: "https://www.aura.build/tech-03-dashboard/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-tech-04-spatialintelligencetech",
    name: "Aura | Spatial Intelligence",
    slug: "tech-04-spatialintelligencetech",
    category: "Tech",
    tags: ["aura", "template", "tech", "dashboard", "ai"],
    previewUrl: "/aura-templates/tech-04-spatialintelligencetech/",
    sourceUrl: "https://www.aura.build/tech-04-spatialintelligencetech/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-tech-05-webglanimatedneuronoise",
    name: "Neural Noise",
    slug: "tech-05-webglanimatedneuronoise",
    category: "Tech",
    tags: ["aura", "template", "tech", "dashboard", "ai"],
    previewUrl: "/aura-templates/tech-05-webglanimatedneuronoise/",
    sourceUrl: "https://www.aura.build/tech-05-webglanimatedneuronoise/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-travel-01-sirocco",
    name: "01 SIROCCO",
    slug: "travel-01-sirocco",
    category: "Travel",
    tags: ["aura", "template", "travel", "hotel", "parallax"],
    previewUrl: "/aura-templates/travel-01-sirocco/",
    sourceUrl: "https://www.aura.build/travel-01-sirocco/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },

  {
    id: "aura-travel-02",
    name: "EVM Grand Cinemas | Luxury Hotel & Resort",
    slug: "travel-02",
    category: "Travel",
    tags: ["aura", "template", "travel", "hotel", "parallax"],
    previewUrl: "/aura-templates/travel-02/",
    sourceUrl: "https://www.aura.build/travel-02/",
    description: "AURA Website Template - full site from the AURA reference collection. This is a complete responsive website template.",
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Building",
  "Tech",
  "E-commerce",
  "Design",
  "Travel",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

// Category → display label + icon
export const TEMPLATE_CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  "Building": { label: "Building & Construction", emoji: "🏗️" },
  "Tech": { label: "Tech & SaaS", emoji: "💻" },
  "E-commerce": { label: "E-commerce", emoji: "🛒" },
  "Design": { label: "Design Studio", emoji: "🎨" },
  "Travel": { label: "Travel & Hospitality", emoji: "✈️" },
};
