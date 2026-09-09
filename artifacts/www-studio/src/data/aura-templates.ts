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
  /** Thumbnail image URL (aspect-4/3) */
  imageUrl?: string;
  /** Author information with avatar */
  author?: { avatarUrl: string; name: string };
  /** PRO badge indicator */
  isPro?: boolean;
  /** View count */
  viewCount?: number;
  /** Remix count */
  remixCount?: number;
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
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
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/29.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38704,
    /** Remix count */
    remixCount: 180,
  },

  // ─────────── FABLE 5.1 VISUAL STUDIES (100 HTML studies) ───────────
  {
    id: "fable-aurora-glass",
    name: "Aurora Glass",
    slug: "fable-aurora-glass",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-aurora-glass/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/001-aurora-glass.html",
    description: "Fable 5.1 visual study — Aurora Glass",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/25.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 12397,
    /** Remix count */
    remixCount: 229,
  },
  {
    id: "fable-brutalist-manifesto",
    name: "Brutalist Manifesto",
    slug: "fable-brutalist-manifesto",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-brutalist-manifesto/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/002-brutalist-manifesto.html",
    description: "Fable 5.1 visual study — Brutalist Manifesto",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 31281,
    /** Remix count */
    remixCount: 47,
  },
  {
    id: "fable-neumorphic-audio-console",
    name: "Neumorphic Audio Console",
    slug: "fable-neumorphic-audio-console",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "audio"],
    previewUrl: "/aura-templates/fable-neumorphic-audio-console/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/003-neumorphic-audio-console.html",
    description: "Fable 5.1 visual study — Neumorphic Audio Console",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 15152,
    /** Remix count */
    remixCount: 149,
  },
  {
    id: "fable-neon-cyberpunk-terminal",
    name: "Neon Cyberpunk Terminal",
    slug: "fable-neon-cyberpunk-terminal",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "neon"],
    previewUrl: "/aura-templates/fable-neon-cyberpunk-terminal/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/004-neon-cyberpunk-terminal.html",
    description: "Fable 5.1 visual study — Neon Cyberpunk Terminal",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/95.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 13059,
    /** Remix count */
    remixCount: 21,
  },
  {
    id: "fable-liquid-metal-blob",
    name: "Liquid Metal Blob",
    slug: "fable-liquid-metal-blob",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-liquid-metal-blob/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/005-liquid-metal-blob.html",
    description: "Fable 5.1 visual study — Liquid Metal Blob",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/82.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 24082,
    /** Remix count */
    remixCount: 184,
  },
  {
    id: "fable-particle-constellation",
    name: "Particle Constellation",
    slug: "fable-particle-constellation",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "particles"],
    previewUrl: "/aura-templates/fable-particle-constellation/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/006-particle-constellation.html",
    description: "Fable 5.1 visual study — Particle Constellation",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/10.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 26476,
    /** Remix count */
    remixCount: 91,
  },
  {
    id: "fable-editorial-magazine-spread",
    name: "Editorial Magazine Spread",
    slug: "fable-editorial-magazine-spread",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-editorial-magazine-spread/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/007-editorial-magazine-spread.html",
    description: "Fable 5.1 visual study — Editorial Magazine Spread",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/60.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 12452,
    /** Remix count */
    remixCount: 251,
  },
  {
    id: "fable-minimal-luxury-watch",
    name: "Minimal Luxury Watch",
    slug: "fable-minimal-luxury-watch",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-minimal-luxury-watch/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/008-minimal-luxury-watch.html",
    description: "Fable 5.1 visual study — Minimal Luxury Watch",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/63.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 50894,
    /** Remix count */
    remixCount: 18,
  },
  {
    id: "fable-morphing-gradient-mesh",
    name: "Morphing Gradient Mesh",
    slug: "fable-morphing-gradient-mesh",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "gradient"],
    previewUrl: "/aura-templates/fable-morphing-gradient-mesh/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/009-morphing-gradient-mesh.html",
    description: "Fable 5.1 visual study — Morphing Gradient Mesh",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/71.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 45208,
    /** Remix count */
    remixCount: 153,
  },
  {
    id: "fable-paper-cut-layers",
    name: "Paper Cut Layers",
    slug: "fable-paper-cut-layers",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-paper-cut-layers/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/010-paper-cut-layers.html",
    description: "Fable 5.1 visual study — Paper Cut Layers",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/24.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 30713,
    /** Remix count */
    remixCount: 238,
  },
  {
    id: "fable-retro-crt-arcade",
    name: "Retro Crt Arcade",
    slug: "fable-retro-crt-arcade",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "neon"],
    previewUrl: "/aura-templates/fable-retro-crt-arcade/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/011-retro-crt-arcade.html",
    description: "Fable 5.1 visual study — Retro Crt Arcade",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 1090,
    /** Remix count */
    remixCount: 118,
  },
  {
    id: "fable-orbital-solar-system",
    name: "Orbital Solar System",
    slug: "fable-orbital-solar-system",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "3d"],
    previewUrl: "/aura-templates/fable-orbital-solar-system/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/012-orbital-solar-system.html",
    description: "Fable 5.1 visual study — Orbital Solar System",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/63.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 40801,
    /** Remix count */
    remixCount: 98,
  },
  {
    id: "fable-flow-field-ink",
    name: "Flow Field Ink",
    slug: "fable-flow-field-ink",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-flow-field-ink/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/013-flow-field-ink.html",
    description: "Fable 5.1 visual study — Flow Field Ink",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 28728,
    /** Remix count */
    remixCount: 170,
  },
  {
    id: "fable-kinetic-typography-poem",
    name: "Kinetic Typography Poem",
    slug: "fable-kinetic-typography-poem",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-kinetic-typography-poem/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/014-kinetic-typography-poem.html",
    description: "Fable 5.1 visual study — Kinetic Typography Poem",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 10441,
    /** Remix count */
    remixCount: 41,
  },
  {
    id: "fable-isometric-city",
    name: "Isometric City",
    slug: "fable-isometric-city",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "3d"],
    previewUrl: "/aura-templates/fable-isometric-city/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/015-isometric-city.html",
    description: "Fable 5.1 visual study — Isometric City",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/91.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 11669,
    /** Remix count */
    remixCount: 19,
  },
  {
    id: "fable-fluid-smoke-touch",
    name: "Fluid Smoke Touch",
    slug: "fable-fluid-smoke-touch",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-fluid-smoke-touch/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/016-fluid-smoke-touch.html",
    description: "Fable 5.1 visual study — Fluid Smoke Touch",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/89.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 9280,
    /** Remix count */
    remixCount: 32,
  },
  {
    id: "fable-data-art-heartbeat",
    name: "Data Art Heartbeat",
    slug: "fable-data-art-heartbeat",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-data-art-heartbeat/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/017-data-art-heartbeat.html",
    description: "Fable 5.1 visual study — Data Art Heartbeat",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/61.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 10925,
    /** Remix count */
    remixCount: 166,
  },
  {
    id: "fable-bauhaus-composer",
    name: "Bauhaus Composer",
    slug: "fable-bauhaus-composer",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-bauhaus-composer/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/018-bauhaus-composer.html",
    description: "Fable 5.1 visual study — Bauhaus Composer",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 38995,
    /** Remix count */
    remixCount: 222,
  },
  {
    id: "fable-zen-garden-sand",
    name: "Zen Garden Sand",
    slug: "fable-zen-garden-sand",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-zen-garden-sand/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/019-zen-garden-sand.html",
    description: "Fable 5.1 visual study — Zen Garden Sand",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/98.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 16635,
    /** Remix count */
    remixCount: 237,
  },
  {
    id: "fable-glitch-art-portrait",
    name: "Glitch Art Portrait",
    slug: "fable-glitch-art-portrait",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "glitch"],
    previewUrl: "/aura-templates/fable-glitch-art-portrait/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/020-glitch-art-portrait.html",
    description: "Fable 5.1 visual study — Glitch Art Portrait",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/0.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 1161,
    /** Remix count */
    remixCount: 218,
  },
  {
    id: "fable-holographic-card-gallery",
    name: "Holographic Card Gallery",
    slug: "fable-holographic-card-gallery",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-holographic-card-gallery/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/021-holographic-card-gallery.html",
    description: "Fable 5.1 visual study — Holographic Card Gallery",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/91.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 31964,
    /** Remix count */
    remixCount: 256,
  },
  {
    id: "fable-scroll-storytelling-ocean",
    name: "Scroll Storytelling Ocean",
    slug: "fable-scroll-storytelling-ocean",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-scroll-storytelling-ocean/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/022-scroll-storytelling-ocean.html",
    description: "Fable 5.1 visual study — Scroll Storytelling Ocean",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/58.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 12771,
    /** Remix count */
    remixCount: 10,
  },
  {
    id: "fable-weather-dashboard-elegant",
    name: "Weather Dashboard Elegant",
    slug: "fable-weather-dashboard-elegant",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-weather-dashboard-elegant/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/023-weather-dashboard-elegant.html",
    description: "Fable 5.1 visual study — Weather Dashboard Elegant",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/23.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 6129,
    /** Remix count */
    remixCount: 173,
  },
  {
    id: "fable-voronoi-stained-glass",
    name: "Voronoi Stained Glass",
    slug: "fable-voronoi-stained-glass",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-voronoi-stained-glass/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/024-voronoi-stained-glass.html",
    description: "Fable 5.1 visual study — Voronoi Stained Glass",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 17442,
    /** Remix count */
    remixCount: 257,
  },
  {
    id: "fable-typewriter-noir",
    name: "Typewriter Noir",
    slug: "fable-typewriter-noir",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-typewriter-noir/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/025-typewriter-noir.html",
    description: "Fable 5.1 visual study — Typewriter Noir",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/44.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 4146,
    /** Remix count */
    remixCount: 142,
  },
  {
    id: "fable-swiss-grid-poster",
    name: "Swiss Grid Poster",
    slug: "fable-swiss-grid-poster",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-swiss-grid-poster/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/026-swiss-grid-poster.html",
    description: "Fable 5.1 visual study — Swiss Grid Poster",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/35.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 16484,
    /** Remix count */
    remixCount: 248,
  },
  {
    id: "fable-lava-lamp-css",
    name: "Lava Lamp Css",
    slug: "fable-lava-lamp-css",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-lava-lamp-css/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/027-lava-lamp-css.html",
    description: "Fable 5.1 visual study — Lava Lamp Css",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 14369,
    /** Remix count */
    remixCount: 218,
  },
  {
    id: "fable-generative-mandala",
    name: "Generative Mandala",
    slug: "fable-generative-mandala",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-generative-mandala/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/028-generative-mandala.html",
    description: "Fable 5.1 visual study — Generative Mandala",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 25881,
    /** Remix count */
    remixCount: 221,
  },
  {
    id: "fable-space-warp-tunnel",
    name: "Space Warp Tunnel",
    slug: "fable-space-warp-tunnel",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-space-warp-tunnel/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/029-space-warp-tunnel.html",
    description: "Fable 5.1 visual study — Space Warp Tunnel",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/47.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 34972,
    /** Remix count */
    remixCount: 158,
  },
  {
    id: "fable-ukiyo-e-great-wave",
    name: "Ukiyo E Great Wave",
    slug: "fable-ukiyo-e-great-wave",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-ukiyo-e-great-wave/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/030-ukiyo-e-great-wave.html",
    description: "Fable 5.1 visual study — Ukiyo E Great Wave",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/24.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 10894,
    /** Remix count */
    remixCount: 238,
  },
  {
    id: "fable-monochrome-portfolio",
    name: "Monochrome Portfolio",
    slug: "fable-monochrome-portfolio",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-monochrome-portfolio/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/031-monochrome-portfolio.html",
    description: "Fable 5.1 visual study — Monochrome Portfolio",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 30300,
    /** Remix count */
    remixCount: 68,
  },
  {
    id: "fable-synth-wave-visualizer",
    name: "Synth Wave Visualizer",
    slug: "fable-synth-wave-visualizer",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "neon"],
    previewUrl: "/aura-templates/fable-synth-wave-visualizer/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/032-synth-wave-visualizer.html",
    description: "Fable 5.1 visual study — Synth Wave Visualizer",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/87.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 10610,
    /** Remix count */
    remixCount: 137,
  },
  {
    id: "fable-double-pendulum-lab",
    name: "Double Pendulum Lab",
    slug: "fable-double-pendulum-lab",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-double-pendulum-lab/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/033-double-pendulum-lab.html",
    description: "Fable 5.1 visual study — Double Pendulum Lab",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/99.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 10017,
    /** Remix count */
    remixCount: 68,
  },
  {
    id: "fable-vaporwave-sunset",
    name: "Vaporwave Sunset",
    slug: "fable-vaporwave-sunset",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-vaporwave-sunset/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/034-vaporwave-sunset.html",
    description: "Fable 5.1 visual study — Vaporwave Sunset",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/6.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 43753,
    /** Remix count */
    remixCount: 111,
  },
  {
    id: "fable-art-deco-invitation",
    name: "Art Deco Invitation",
    slug: "fable-art-deco-invitation",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-art-deco-invitation/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/035-art-deco-invitation.html",
    description: "Fable 5.1 visual study — Art Deco Invitation",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/10.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 3662,
    /** Remix count */
    remixCount: 219,
  },
  {
    id: "fable-terrazzo-pattern-lab",
    name: "Terrazzo Pattern Lab",
    slug: "fable-terrazzo-pattern-lab",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-terrazzo-pattern-lab/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/036-terrazzo-pattern-lab.html",
    description: "Fable 5.1 visual study — Terrazzo Pattern Lab",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/81.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 41610,
    /** Remix count */
    remixCount: 204,
  },
  {
    id: "fable-northern-lights-canvas",
    name: "Northern Lights Canvas",
    slug: "fable-northern-lights-canvas",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-northern-lights-canvas/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/037-northern-lights-canvas.html",
    description: "Fable 5.1 visual study — Northern Lights Canvas",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/95.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 47808,
    /** Remix count */
    remixCount: 30,
  },
  {
    id: "fable-origami-fold-menu",
    name: "Origami Fold Menu",
    slug: "fable-origami-fold-menu",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-origami-fold-menu/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/038-origami-fold-menu.html",
    description: "Fable 5.1 visual study — Origami Fold Menu",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 24969,
    /** Remix count */
    remixCount: 134,
  },
  {
    id: "fable-pixel-art-studio",
    name: "Pixel Art Studio",
    slug: "fable-pixel-art-studio",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-pixel-art-studio/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/039-pixel-art-studio.html",
    description: "Fable 5.1 visual study — Pixel Art Studio",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/95.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 46017,
    /** Remix count */
    remixCount: 223,
  },
  {
    id: "fable-topographic-contours",
    name: "Topographic Contours",
    slug: "fable-topographic-contours",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-topographic-contours/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/040-topographic-contours.html",
    description: "Fable 5.1 visual study — Topographic Contours",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/64.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 9178,
    /** Remix count */
    remixCount: 170,
  },
  {
    id: "fable-spiral-galaxy-particles",
    name: "Spiral Galaxy Particles",
    slug: "fable-spiral-galaxy-particles",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "particles"],
    previewUrl: "/aura-templates/fable-spiral-galaxy-particles/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/041-spiral-galaxy-particles.html",
    description: "Fable 5.1 visual study — Spiral Galaxy Particles",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/63.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 10060,
    /** Remix count */
    remixCount: 171,
  },
  {
    id: "fable-vintage-radio-tuner",
    name: "Vintage Radio Tuner",
    slug: "fable-vintage-radio-tuner",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-vintage-radio-tuner/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/042-vintage-radio-tuner.html",
    description: "Fable 5.1 visual study — Vintage Radio Tuner",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/91.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 38212,
    /** Remix count */
    remixCount: 75,
  },
  {
    id: "fable-life-garden-automaton",
    name: "Life Garden Automaton",
    slug: "fable-life-garden-automaton",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-life-garden-automaton/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/043-life-garden-automaton.html",
    description: "Fable 5.1 visual study — Life Garden Automaton",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 38721,
    /** Remix count */
    remixCount: 76,
  },
  {
    id: "fable-honeycomb-hex-nav",
    name: "Honeycomb Hex Nav",
    slug: "fable-honeycomb-hex-nav",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-honeycomb-hex-nav/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/044-honeycomb-hex-nav.html",
    description: "Fable 5.1 visual study — Honeycomb Hex Nav",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/39.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 5348,
    /** Remix count */
    remixCount: 142,
  },
  {
    id: "fable-cinematic-title-sequence",
    name: "Cinematic Title Sequence",
    slug: "fable-cinematic-title-sequence",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-cinematic-title-sequence/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/045-cinematic-title-sequence.html",
    description: "Fable 5.1 visual study — Cinematic Title Sequence",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 26709,
    /** Remix count */
    remixCount: 80,
  },
  {
    id: "fable-spectrum-palette-studio",
    name: "Spectrum Palette Studio",
    slug: "fable-spectrum-palette-studio",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-spectrum-palette-studio/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/046-spectrum-palette-studio.html",
    description: "Fable 5.1 visual study — Spectrum Palette Studio",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/50.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 36704,
    /** Remix count */
    remixCount: 59,
  },
  {
    id: "fable-glass-music-player",
    name: "Glass Music Player",
    slug: "fable-glass-music-player",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-glass-music-player/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/047-glass-music-player.html",
    description: "Fable 5.1 visual study — Glass Music Player",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 19621,
    /** Remix count */
    remixCount: 159,
  },
  {
    id: "fable-brutalist-archive-index",
    name: "Brutalist Archive Index",
    slug: "fable-brutalist-archive-index",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-brutalist-archive-index/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/048-brutalist-archive-index.html",
    description: "Fable 5.1 visual study — Brutalist Archive Index",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/88.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 5177,
    /** Remix count */
    remixCount: 69,
  },
  {
    id: "fable-fireflies-night-meadow",
    name: "Fireflies Night Meadow",
    slug: "fable-fireflies-night-meadow",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-fireflies-night-meadow/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/049-fireflies-night-meadow.html",
    description: "Fable 5.1 visual study — Fireflies Night Meadow",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 45470,
    /** Remix count */
    remixCount: 119,
  },
  {
    id: "fable-clock-collection",
    name: "Clock Collection",
    slug: "fable-clock-collection",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-clock-collection/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/050-clock-collection.html",
    description: "Fable 5.1 visual study — Clock Collection",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/30.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 31588,
    /** Remix count */
    remixCount: 137,
  },
  {
    id: "fable-mondrian-composer",
    name: "Mondrian Composer",
    slug: "fable-mondrian-composer",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-mondrian-composer/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/051-mondrian-composer.html",
    description: "Fable 5.1 visual study — Mondrian Composer",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/9.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 39588,
    /** Remix count */
    remixCount: 251,
  },
  {
    id: "fable-rain-on-window",
    name: "Rain On Window",
    slug: "fable-rain-on-window",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-rain-on-window/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/052-rain-on-window.html",
    description: "Fable 5.1 visual study — Rain On Window",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/81.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 8041,
    /** Remix count */
    remixCount: 14,
  },
  {
    id: "fable-mandelbrot-explorer",
    name: "Mandelbrot Explorer",
    slug: "fable-mandelbrot-explorer",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-mandelbrot-explorer/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/053-mandelbrot-explorer.html",
    description: "Fable 5.1 visual study — Mandelbrot Explorer",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/64.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 45520,
    /** Remix count */
    remixCount: 42,
  },
  {
    id: "fable-magnetic-microinteractions",
    name: "Magnetic Microinteractions",
    slug: "fable-magnetic-microinteractions",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-magnetic-microinteractions/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/054-magnetic-microinteractions.html",
    description: "Fable 5.1 visual study — Magnetic Microinteractions",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 27535,
    /** Remix count */
    remixCount: 118,
  },
  {
    id: "fable-newspaper-front-page",
    name: "Newspaper Front Page",
    slug: "fable-newspaper-front-page",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-newspaper-front-page/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/055-newspaper-front-page.html",
    description: "Fable 5.1 visual study — Newspaper Front Page",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/38.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 29557,
    /** Remix count */
    remixCount: 112,
  },
  {
    id: "fable-cube-carousel-3d",
    name: "Cube Carousel 3d",
    slug: "fable-cube-carousel-3d",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-cube-carousel-3d/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/056-cube-carousel-3d.html",
    description: "Fable 5.1 visual study — Cube Carousel 3d",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/97.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 4757,
    /** Remix count */
    remixCount: 64,
  },
  {
    id: "fable-lsystem-tree-growth",
    name: "Lsystem Tree Growth",
    slug: "fable-lsystem-tree-growth",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-lsystem-tree-growth/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/057-lsystem-tree-growth.html",
    description: "Fable 5.1 visual study — Lsystem Tree Growth",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/39.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 18642,
    /** Remix count */
    remixCount: 104,
  },
  {
    id: "fable-led-matrix-marquee",
    name: "Led Matrix Marquee",
    slug: "fable-led-matrix-marquee",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-led-matrix-marquee/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/058-led-matrix-marquee.html",
    description: "Fable 5.1 visual study — Led Matrix Marquee",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/50.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 11119,
    /** Remix count */
    remixCount: 240,
  },
  {
    id: "fable-coastal-luxury-hotel",
    name: "Coastal Luxury Hotel",
    slug: "fable-coastal-luxury-hotel",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-coastal-luxury-hotel/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/059-coastal-luxury-hotel.html",
    description: "Fable 5.1 visual study — Coastal Luxury Hotel",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/92.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 30584,
    /** Remix count */
    remixCount: 263,
  },
  {
    id: "fable-digital-rain-typeface",
    name: "Digital Rain Typeface",
    slug: "fable-digital-rain-typeface",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-digital-rain-typeface/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/060-digital-rain-typeface.html",
    description: "Fable 5.1 visual study — Digital Rain Typeface",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/24.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 14746,
    /** Remix count */
    remixCount: 226,
  },
  {
    id: "fable-leather-field-notebook",
    name: "Leather Field Notebook",
    slug: "fable-leather-field-notebook",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-leather-field-notebook/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/061-leather-field-notebook.html",
    description: "Fable 5.1 visual study — Leather Field Notebook",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/88.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 5111,
    /** Remix count */
    remixCount: 129,
  },
  {
    id: "fable-harmonograph-drawing",
    name: "Harmonograph Drawing",
    slug: "fable-harmonograph-drawing",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-harmonograph-drawing/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/062-harmonograph-drawing.html",
    description: "Fable 5.1 visual study — Harmonograph Drawing",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/6.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 11351,
    /** Remix count */
    remixCount: 143,
  },
  {
    id: "fable-holographic-concert-ticket",
    name: "Holographic Concert Ticket",
    slug: "fable-holographic-concert-ticket",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-holographic-concert-ticket/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/063-holographic-concert-ticket.html",
    description: "Fable 5.1 visual study — Holographic Concert Ticket",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 14244,
    /** Remix count */
    remixCount: 111,
  },
  {
    id: "fable-desert-dunes-parallax",
    name: "Desert Dunes Parallax",
    slug: "fable-desert-dunes-parallax",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-desert-dunes-parallax/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/064-desert-dunes-parallax.html",
    description: "Fable 5.1 visual study — Desert Dunes Parallax",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 27891,
    /** Remix count */
    remixCount: 126,
  },
  {
    id: "fable-neural-network-visualizer",
    name: "Neural Network Visualizer",
    slug: "fable-neural-network-visualizer",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-neural-network-visualizer/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/065-neural-network-visualizer.html",
    description: "Fable 5.1 visual study — Neural Network Visualizer",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/92.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 46896,
    /** Remix count */
    remixCount: 112,
  },
  {
    id: "fable-typographic-word-clock",
    name: "Typographic Word Clock",
    slug: "fable-typographic-word-clock",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-typographic-word-clock/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/066-typographic-word-clock.html",
    description: "Fable 5.1 visual study — Typographic Word Clock",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 12877,
    /** Remix count */
    remixCount: 99,
  },
  {
    id: "fable-cosmic-cursor-trail",
    name: "Cosmic Cursor Trail",
    slug: "fable-cosmic-cursor-trail",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-cosmic-cursor-trail/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/067-cosmic-cursor-trail.html",
    description: "Fable 5.1 visual study — Cosmic Cursor Trail",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/40.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 37105,
    /** Remix count */
    remixCount: 215,
  },
  {
    id: "fable-kaleidoscope-mirror",
    name: "Kaleidoscope Mirror",
    slug: "fable-kaleidoscope-mirror",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-kaleidoscope-mirror/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/068-kaleidoscope-mirror.html",
    description: "Fable 5.1 visual study — Kaleidoscope Mirror",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/71.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 23605,
    /** Remix count */
    remixCount: 165,
  },
  {
    id: "fable-periodic-table-elegant",
    name: "Periodic Table Elegant",
    slug: "fable-periodic-table-elegant",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-periodic-table-elegant/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/069-periodic-table-elegant.html",
    description: "Fable 5.1 visual study — Periodic Table Elegant",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/37.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 24290,
    /** Remix count */
    remixCount: 223,
  },
  {
    id: "fable-ink-drop-diffusion",
    name: "Ink Drop Diffusion",
    slug: "fable-ink-drop-diffusion",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-ink-drop-diffusion/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/070-ink-drop-diffusion.html",
    description: "Fable 5.1 visual study — Ink Drop Diffusion",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/93.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 18092,
    /** Remix count */
    remixCount: 64,
  },
  {
    id: "fable-atomic-age-retro-futurism",
    name: "Atomic Age Retro Futurism",
    slug: "fable-atomic-age-retro-futurism",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-atomic-age-retro-futurism/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/071-atomic-age-retro-futurism.html",
    description: "Fable 5.1 visual study — Atomic Age Retro Futurism",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/88.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 6351,
    /** Remix count */
    remixCount: 76,
  },
  {
    id: "fable-wireframe-terrain-flight",
    name: "Wireframe Terrain Flight",
    slug: "fable-wireframe-terrain-flight",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-wireframe-terrain-flight/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/072-wireframe-terrain-flight.html",
    description: "Fable 5.1 visual study — Wireframe Terrain Flight",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/91.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 13470,
    /** Remix count */
    remixCount: 119,
  },
  {
    id: "fable-candle-meditation",
    name: "Candle Meditation",
    slug: "fable-candle-meditation",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-candle-meditation/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/073-candle-meditation.html",
    description: "Fable 5.1 visual study — Candle Meditation",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/70.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 12009,
    /** Remix count */
    remixCount: 100,
  },
  {
    id: "fable-transit-map-live",
    name: "Transit Map Live",
    slug: "fable-transit-map-live",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-transit-map-live/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/074-transit-map-live.html",
    description: "Fable 5.1 visual study — Transit Map Live",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/82.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 8590,
    /** Remix count */
    remixCount: 117,
  },
  {
    id: "fable-market-data-art",
    name: "Market Data Art",
    slug: "fable-market-data-art",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-market-data-art/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/075-market-data-art.html",
    description: "Fable 5.1 visual study — Market Data Art",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/14.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 29500,
    /** Remix count */
    remixCount: 76,
  },
  {
    id: "fable-chladni-resonance",
    name: "Chladni Resonance",
    slug: "fable-chladni-resonance",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-chladni-resonance/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/076-chladni-resonance.html",
    description: "Fable 5.1 visual study — Chladni Resonance",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/68.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 3402,
    /** Remix count */
    remixCount: 179,
  },
  {
    id: "fable-wooden-toy-blocks",
    name: "Wooden Toy Blocks",
    slug: "fable-wooden-toy-blocks",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-wooden-toy-blocks/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/077-wooden-toy-blocks.html",
    description: "Fable 5.1 visual study — Wooden Toy Blocks",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/30.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 18519,
    /** Remix count */
    remixCount: 224,
  },
  {
    id: "fable-lighthouse-storm-night",
    name: "Lighthouse Storm Night",
    slug: "fable-lighthouse-storm-night",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-lighthouse-storm-night/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/078-lighthouse-storm-night.html",
    description: "Fable 5.1 visual study — Lighthouse Storm Night",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/19.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 12804,
    /** Remix count */
    remixCount: 182,
  },
  {
    id: "fable-recipe-editorial-card",
    name: "Recipe Editorial Card",
    slug: "fable-recipe-editorial-card",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-recipe-editorial-card/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/079-recipe-editorial-card.html",
    description: "Fable 5.1 visual study — Recipe Editorial Card",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/94.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 23464,
    /** Remix count */
    remixCount: 32,
  },
  {
    id: "fable-boids-murmuration",
    name: "Boids Murmuration",
    slug: "fable-boids-murmuration",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-boids-murmuration/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/080-boids-murmuration.html",
    description: "Fable 5.1 visual study — Boids Murmuration",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 3313,
    /** Remix count */
    remixCount: 173,
  },
  {
    id: "fable-gothic-rose-window",
    name: "Gothic Rose Window",
    slug: "fable-gothic-rose-window",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-gothic-rose-window/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/081-gothic-rose-window.html",
    description: "Fable 5.1 visual study — Gothic Rose Window",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 9715,
    /** Remix count */
    remixCount: 97,
  },
  {
    id: "fable-prism-light-dispersion",
    name: "Prism Light Dispersion",
    slug: "fable-prism-light-dispersion",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-prism-light-dispersion/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/082-prism-light-dispersion.html",
    description: "Fable 5.1 visual study — Prism Light Dispersion",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/54.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 47574,
    /** Remix count */
    remixCount: 102,
  },
  {
    id: "fable-terminal-portfolio",
    name: "Terminal Portfolio",
    slug: "fable-terminal-portfolio",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-terminal-portfolio/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/083-terminal-portfolio.html",
    description: "Fable 5.1 visual study — Terminal Portfolio",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 32151,
    /** Remix count */
    remixCount: 177,
  },
  {
    id: "fable-cherry-blossom-drift",
    name: "Cherry Blossom Drift",
    slug: "fable-cherry-blossom-drift",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-cherry-blossom-drift/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/084-cherry-blossom-drift.html",
    description: "Fable 5.1 visual study — Cherry Blossom Drift",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 37245,
    /** Remix count */
    remixCount: 171,
  },
  {
    id: "fable-tarot-arcana-flip",
    name: "Tarot Arcana Flip",
    slug: "fable-tarot-arcana-flip",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-tarot-arcana-flip/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/085-tarot-arcana-flip.html",
    description: "Fable 5.1 visual study — Tarot Arcana Flip",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/97.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 46610,
    /** Remix count */
    remixCount: 253,
  },
  {
    id: "fable-reaction-diffusion-skin",
    name: "Reaction Diffusion Skin",
    slug: "fable-reaction-diffusion-skin",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-reaction-diffusion-skin/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/086-reaction-diffusion-skin.html",
    description: "Fable 5.1 visual study — Reaction Diffusion Skin",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 41992,
    /** Remix count */
    remixCount: 21,
  },
  {
    id: "fable-mid-century-modern-poster",
    name: "Mid Century Modern Poster",
    slug: "fable-mid-century-modern-poster",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-mid-century-modern-poster/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/087-mid-century-modern-poster.html",
    description: "Fable 5.1 visual study — Mid Century Modern Poster",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 23098,
    /** Remix count */
    remixCount: 50,
  },
  {
    id: "fable-snow-globe-shake",
    name: "Snow Globe Shake",
    slug: "fable-snow-globe-shake",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-snow-globe-shake/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/088-snow-globe-shake.html",
    description: "Fable 5.1 visual study — Snow Globe Shake",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/57.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 33205,
    /** Remix count */
    remixCount: 92,
  },
  {
    id: "fable-mini-synth-keyboard",
    name: "Mini Synth Keyboard",
    slug: "fable-mini-synth-keyboard",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-mini-synth-keyboard/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/089-mini-synth-keyboard.html",
    description: "Fable 5.1 visual study — Mini Synth Keyboard",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/40.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 4082,
    /** Remix count */
    remixCount: 203,
  },
  {
    id: "fable-bioluminescent-deep-sea",
    name: "Bioluminescent Deep Sea",
    slug: "fable-bioluminescent-deep-sea",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-bioluminescent-deep-sea/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/090-bioluminescent-deep-sea.html",
    description: "Fable 5.1 visual study — Bioluminescent Deep Sea",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/64.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 29145,
    /** Remix count */
    remixCount: 189,
  },
  {
    id: "fable-blueprint-schematic-draw",
    name: "Blueprint Schematic Draw",
    slug: "fable-blueprint-schematic-draw",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-blueprint-schematic-draw/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/091-blueprint-schematic-draw.html",
    description: "Fable 5.1 visual study — Blueprint Schematic Draw",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 49441,
    /** Remix count */
    remixCount: 110,
  },
  {
    id: "fable-gradient-type-hero",
    name: "Gradient Type Hero",
    slug: "fable-gradient-type-hero",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl", "gradient"],
    previewUrl: "/aura-templates/fable-gradient-type-hero/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/092-gradient-type-hero.html",
    description: "Fable 5.1 visual study — Gradient Type Hero",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/77.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 6672,
    /** Remix count */
    remixCount: 143,
  },
  {
    id: "fable-pomodoro-zen-timer",
    name: "Pomodoro Zen Timer",
    slug: "fable-pomodoro-zen-timer",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-pomodoro-zen-timer/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/093-pomodoro-zen-timer.html",
    description: "Fable 5.1 visual study — Pomodoro Zen Timer",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/31.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 36497,
    /** Remix count */
    remixCount: 17,
  },
  {
    id: "fable-pop-art-halftone",
    name: "Pop Art Halftone",
    slug: "fable-pop-art-halftone",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-pop-art-halftone/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/094-pop-art-halftone.html",
    description: "Fable 5.1 visual study — Pop Art Halftone",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/13.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 28455,
    /** Remix count */
    remixCount: 207,
  },
  {
    id: "fable-string-art-loom",
    name: "String Art Loom",
    slug: "fable-string-art-loom",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-string-art-loom/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/095-string-art-loom.html",
    description: "Fable 5.1 visual study — String Art Loom",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/70.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 9812,
    /** Remix count */
    remixCount: 243,
  },
  {
    id: "fable-thermal-vision-heatmap",
    name: "Thermal Vision Heatmap",
    slug: "fable-thermal-vision-heatmap",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-thermal-vision-heatmap/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/096-thermal-vision-heatmap.html",
    description: "Fable 5.1 visual study — Thermal Vision Heatmap",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/20.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 6037,
    /** Remix count */
    remixCount: 58,
  },
  {
    id: "fable-planetarium-star-chart",
    name: "Planetarium Star Chart",
    slug: "fable-planetarium-star-chart",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-planetarium-star-chart/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/097-planetarium-star-chart.html",
    description: "Fable 5.1 visual study — Planetarium Star Chart",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/18.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 40404,
    /** Remix count */
    remixCount: 209,
  },
  {
    id: "fable-memphis-design-party",
    name: "Memphis Design Party",
    slug: "fable-memphis-design-party",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-memphis-design-party/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/098-memphis-design-party.html",
    description: "Fable 5.1 visual study — Memphis Design Party",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/58.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: true,
    /** View count */
    viewCount: 1320,
    /** Remix count */
    remixCount: 150,
  },
  {
    id: "fable-water-ripple-reflection",
    name: "Water Ripple Reflection",
    slug: "fable-water-ripple-reflection",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-water-ripple-reflection/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/099-water-ripple-reflection.html",
    description: "Fable 5.1 visual study — Water Ripple Reflection",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 13384,
    /** Remix count */
    remixCount: 48,
  },
  {
    id: "fable-organic-wave-lab",
    name: "Organic Wave Lab",
    slug: "fable-organic-wave-lab",
    category: "Visual Studies",
    tags: ["fable", "visual-study", "html", "canvas", "webgl"],
    previewUrl: "/aura-templates/fable-organic-wave-lab/",
    sourceUrl: "https://github.com/MiaAI-Lab/Fable-5.1-100-HTML-Files/blob/main/100-organic-wave-lab.html",
    description: "Fable 5.1 visual study — Organic Wave Lab",
    /** Thumbnail image URL (aspect-4/3) */
    imageUrl: "https://images.unsplash.com/photo-1519710164121-da0d43922477?w=1200&h=800&fit=crop&auto=format&q=80",
    /** Author information with avatar */
    author: { avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg", name: "Meng To" },
    /** PRO badge indicator */
    isPro: false,
    /** View count */
    viewCount: 24464,
    /** Remix count */
    remixCount: 123,
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Building",
  "Tech",
  "E-commerce",
  "Design",
  "Travel",
  "Visual Studies",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

// Category → display label + icon
export const TEMPLATE_CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  "Building": { label: "Building & Construction", emoji: "🏗️" },
  "Tech": { label: "Tech & SaaS", emoji: "💻" },
  "E-commerce": { label: "E-commerce", emoji: "🛒" },
  "Design": { label: "Design Studio", emoji: "🎨" },
  "Travel": { label: "Travel & Hospitality", emoji: "✈️" },
  "Visual Studies": { label: "Visual Studies", emoji: "🎨" },
};
