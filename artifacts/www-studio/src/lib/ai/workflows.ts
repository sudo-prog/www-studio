// ── Agentic Workflows ──────────────────────────────────────────────────────
// Multi-step workflows that generate complete layouts using RAG knowledge.

import { FreeformElement, makeFreeformElement } from "@/lib/freeform-types";

export interface WorkflowStep {
  name: string;
  description: string;
  status: "pending" | "running" | "done" | "error";
  result?: string;
}

export interface AgenticWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  generateElements: (ctx: WorkflowContext) => FreeformElement[];
}

export interface WorkflowContext {
  canvasWidth: number;
  canvasHeight: number;
  theme?: "minimal" | "bold" | "elegant" | "playful" | "corporate" | "wellness";
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

const DEFAULT_COLORS: WorkflowContext["colors"] = {
  primary: "#7FB5A0",
  secondary: "#B39DC2",
  accent: "#E8957A",
  background: "#0d1117",
  text: "#ffffff",
};

// ── Wellness Site Workflow ─────────────────────────────────────────────────

const wellnessWorkflow: AgenticWorkflow = {
  id: "wellness-site",
  name: "Premium Wellness Site",
  description: "Generates a calming wellness landing page with hero, features, and CTA",
  steps: [
    { name: "Create hero section", description: "Add hero headline and subtext", status: "pending" },
    { name: "Add feature cards", description: "Create 3 feature cards in a row", status: "pending" },
    { name: "Add CTA section", description: "Call-to-action with button", status: "pending" },
    { name: "Apply wellness styling", description: "Calming colors and spacing", status: "pending" },
  ],
  generateElements: (ctx) => {
    const colors = ctx.colors || DEFAULT_COLORS;
    const elements: FreeformElement[] = [];
    const cw = ctx.canvasWidth;

    // Hero section
    elements.push(
      makeFreeformElement("text", {
        x: cw / 2 - 250, y: 80, width: 500, height: 80,
        text: "Find Your Balance", fontSize: 56, fontWeight: 700,
        color: colors.text, textAlign: "center", name: "Hero Headline",
      })
    );
    elements.push(
      makeFreeformElement("text", {
        x: cw / 2 - 200, y: 180, width: 400, height: 60,
        text: "Discover inner peace through mindful practices", fontSize: 20,
        color: "#888888", textAlign: "center", name: "Hero Subtext",
      })
    );
    elements.push(
      makeFreeformElement("button", {
        x: cw / 2 - 80, y: 270, width: 160, height: 52,
        label: "Start Journey", href: "#", fill: colors.primary,
        color: "#ffffff", borderRadius: 26, name: "Hero CTA",
      })
    );

    // Feature cards
    const cardWidth = 220;
    const cardY = 400;
    const gap = 40;
    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (cw - totalWidth) / 2;

    const features = [
      { title: "Meditation", desc: "Guided sessions for clarity" },
      { title: "Yoga", desc: "Flow with intention" },
      { title: "Journal", desc: "Reflect and grow" },
    ];

    features.forEach((f, i) => {
      const x = startX + i * (cardWidth + gap);
      elements.push(
        makeFreeformElement("shape", {
          x, y: cardY, width: cardWidth, height: 200,
          fill: "#1a1a2e", borderRadius: 16, name: `Card ${i + 1} BG`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: x + 20, y: cardY + 30, width: cardWidth - 40, height: 40,
          text: f.title, fontSize: 24, fontWeight: 600,
          color: colors.primary, name: `Card ${i + 1} Title`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: x + 20, y: cardY + 80, width: cardWidth - 40, height: 60,
          text: f.desc, fontSize: 14,
          color: "#aaaaaa", name: `Card ${i + 1} Desc`,
        })
      );
    });

    // CTA section
    elements.push(
      makeFreeformElement("shape", {
        x: cw / 2 - 300, y: 650, width: 600, height: 120,
        fill: colors.primary, borderRadius: 16, opacity: 0.15, name: "CTA BG",
      })
    );
    elements.push(
      makeFreeformElement("text", {
        x: cw / 2 - 200, y: 670, width: 400, height: 40,
        text: "Ready to begin?", fontSize: 28, fontWeight: 600,
        color: colors.text, textAlign: "center", name: "CTA Text",
      })
    );
    elements.push(
      makeFreeformElement("button", {
        x: cw / 2 - 80, y: 720, width: 160, height: 44,
        label: "Get Started Free", href: "#", fill: colors.accent,
        color: "#ffffff", borderRadius: 22, name: "CTA Button",
      })
    );

    return elements;
  },
};

// ── Portfolio Site Workflow ────────────────────────────────────────────────

const portfolioWorkflow: AgenticWorkflow = {
  id: "portfolio-site",
  name: "Developer Portfolio",
  description: "Generates a clean developer portfolio with projects and contact",
  steps: [
    { name: "Create header", description: "Add name and tagline", status: "pending" },
    { name: "Add project showcase", description: "3 project cards", status: "pending" },
    { name: "Add contact section", description: "Email and social links", status: "pending" },
  ],
  generateElements: (ctx) => {
    const colors = ctx.colors || DEFAULT_COLORS;
    const elements: FreeformElement[] = [];
    const cw = ctx.canvasWidth;

    // Header
    elements.push(
      makeFreeformElement("text", {
        x: 60, y: 60, width: 600, height: 60,
        text: "Jane Developer", fontSize: 48, fontWeight: 700,
        color: colors.text, name: "Name",
      })
    );
    elements.push(
      makeFreeformElement("text", {
        x: 60, y: 130, width: 400, height: 40,
        text: "Full-stack engineer building beautiful things", fontSize: 18,
        color: colors.primary, name: "Tagline",
      })
    );

    // Projects
    const projectY = 220;
    const projects = ["Dashboard App", "E-commerce Platform", "AI Chat Tool"];
    projects.forEach((name, i) => {
      elements.push(
        makeFreeformElement("shape", {
          x: 60 + i * 320, y: projectY, width: 280, height: 180,
          fill: "#1a1a2e", borderRadius: 12, name: `Project ${i + 1} Card`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: 80 + i * 320, y: projectY + 20, width: 240, height: 30,
          text: name, fontSize: 20, fontWeight: 600,
          color: colors.text, name: `Project ${i + 1} Title`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: 80 + i * 320, y: projectY + 60, width: 240, height: 60,
          text: "Built with React, TypeScript, and modern tooling.", fontSize: 13,
          color: "#888888", name: `Project ${i + 1} Desc`,
        })
      );
      elements.push(
        makeFreeformElement("button", {
          x: 80 + i * 320, y: projectY + 130, width: 120, height: 36,
          label: "View Project", href: "#", fill: colors.primary,
          color: "#ffffff", borderRadius: 18, name: `Project ${i + 1} Button`,
        })
      );
    });

    // Contact
    elements.push(
      makeFreeformElement("text", {
        x: 60, y: 460, width: 400, height: 40,
        text: "Let's work together", fontSize: 32, fontWeight: 600,
        color: colors.text, name: "Contact Header",
      })
    );
    elements.push(
      makeFreeformElement("text", {
        x: 60, y: 510, width: 400, height: 30,
        text: "jane@example.com", fontSize: 16,
        color: colors.primary, name: "Email",
      })
    );

    return elements;
  },
};

// ── Landing Page Workflow ──────────────────────────────────────────────────

const landingWorkflow: AgenticWorkflow = {
  id: "saas-landing",
  name: "SaaS Landing Page",
  description: "Generates a conversion-focused SaaS landing page",
  steps: [
    { name: "Create hero", description: "Big headline with CTA", status: "pending" },
    { name: "Add social proof", description: "Testimonial cards", status: "pending" },
    { name: "Add pricing", description: "Pricing tiers", status: "pending" },
  ],
  generateElements: (ctx) => {
    const colors = ctx.colors || DEFAULT_COLORS;
    const elements: FreeformElement[] = [];
    const cw = ctx.canvasWidth;

    // Hero
    elements.push(
      makeFreeformElement("text", {
        x: cw / 2 - 300, y: 60, width: 600, height: 80,
        text: "Build Faster. Ship Smarter.", fontSize: 52, fontWeight: 800,
        color: colors.text, textAlign: "center", name: "Hero Headline",
      })
    );
    elements.push(
      makeFreeformElement("text", {
        x: cw / 2 - 250, y: 160, width: 500, height: 50,
        text: "The all-in-one platform for modern teams to collaborate and deliver.", fontSize: 18,
        color: "#999999", textAlign: "center", name: "Hero Sub",
      })
    );
    elements.push(
      makeFreeformElement("button", {
        x: cw / 2 - 160, y: 240, width: 150, height: 52,
        label: "Start Free Trial", href: "#", fill: colors.primary,
        color: "#ffffff", borderRadius: 26, name: "CTA Primary",
      })
    );
    elements.push(
      makeFreeformElement("button", {
        x: cw / 2 + 10, y: 240, width: 140, height: 52,
        label: "Watch Demo", href: "#", fill: "transparent",
        color: colors.text, borderRadius: 26, name: "CTA Secondary",
      })
    );

    // Social proof
    const proofY = 360;
    const logos = ["Acme Corp", "TechCo", "StartupXYZ", "MegaInc"];
    logos.forEach((name, i) => {
      elements.push(
        makeFreeformElement("text", {
          x: 120 + i * 240, y: proofY, width: 200, height: 30,
          text: name, fontSize: 16, fontWeight: 500,
          color: "#666666", textAlign: "center", name: `Logo ${i + 1}`,
        })
      );
    });

    // Pricing
    const pricingY = 460;
    const tiers = [
      { name: "Starter", price: "$9/mo", features: "5 projects, 10GB storage" },
      { name: "Pro", price: "$29/mo", features: "Unlimited projects, 100GB" },
      { name: "Enterprise", price: "$99/mo", features: "Everything + priority support" },
    ];
    tiers.forEach((tier, i) => {
      const x = 140 + i * 300;
      elements.push(
        makeFreeformElement("shape", {
          x, y: pricingY, width: 260, height: 220,
          fill: i === 1 ? colors.primary : "#1a1a2e",
          borderRadius: 16, opacity: i === 1 ? 0.15 : 1, name: `${tier.name} Card`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: x + 20, y: pricingY + 20, width: 220, height: 30,
          text: tier.name, fontSize: 20, fontWeight: 600,
          color: i === 1 ? colors.primary : colors.text, name: `${tier.name} Title`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: x + 20, y: pricingY + 60, width: 220, height: 30,
          text: tier.price, fontSize: 36, fontWeight: 700,
          color: colors.text, name: `${tier.name} Price`,
        })
      );
      elements.push(
        makeFreeformElement("text", {
          x: x + 20, y: pricingY + 110, width: 220, height: 50,
          text: tier.features, fontSize: 13,
          color: "#888888", name: `${tier.name} Features`,
        })
      );
      elements.push(
        makeFreeformElement("button", {
          x: x + 55, y: pricingY + 175, width: 150, height: 38,
          label: "Choose Plan", href: "#", fill: i === 1 ? colors.primary : "#2d2d44",
          color: "#ffffff", borderRadius: 19, name: `${tier.name} Button`,
        })
      );
    });

    return elements;
  },
};

// ── Workflow registry ──────────────────────────────────────────────────────

export const ALL_WORKFLOWS: AgenticWorkflow[] = [
  wellnessWorkflow,
  portfolioWorkflow,
  landingWorkflow,
];

export function getWorkflow(id: string): AgenticWorkflow | undefined {
  return ALL_WORKFLOWS.find((w) => w.id === id);
}

export function executeWorkflow(id: string, ctx: WorkflowContext): FreeformElement[] {
  const workflow = getWorkflow(id);
  if (!workflow) return [];
  return workflow.generateElements(ctx);
}
