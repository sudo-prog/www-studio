import { Router, type IRouter, type Request, type Response } from "express";
import { db, scenesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { chatComplete } from "../lib/llm";

const router: IRouter = Router();

const WELLNESS = {
  sage:     "#7FB5A0",
  lavender: "#B39DC2",
  coral:    "#E8957A",
  sky:      "#87BBDB",
  peach:    "#F4C5A1",
  forest:   "#4A7C6B",
  mist:     "#C8D8E0",
  sand:     "#E8DDD0",
};

const ANIM_PRESETS = ["none","gentle-float","gradient-breathe","shadow-pulse","hover-lift","scroll-reveal","morph","spin-slow","fade-in-out","scale-pulse","elastic-bounce"] as const;

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

function getOrGuestUserId(req: Request): string {
  return req.isAuthenticated() ? req.user.id : GUEST_USER_ID;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
}

const CreateSceneBody = z.object({
  name:         z.string().min(1).max(200),
  description:  z.string().max(1000).optional(),
  canvasWidth:  z.number().int().positive().default(1440),
  canvasHeight: z.number().int().positive().default(900),
  elements:     z.string().optional(),
  animations:   z.string().optional(),
  themeTokens:  z.string().optional(),
  tags:         z.union([z.array(z.string()), z.string()]).optional(),
});

const UpdateSceneBody = z.object({
  name:         z.string().min(1).max(200).optional(),
  description:  z.string().max(1000).optional(),
  status:       z.enum(["draft","published"]).optional(),
  thumbnailUrl: z.string().optional().nullable(),
  elements:     z.string().optional(),
  animations:   z.string().optional(),
  themeTokens:  z.string().optional(),
  tags:         z.union([z.array(z.string()), z.string()]).optional(),
  canvasWidth:  z.number().int().positive().optional(),
  canvasHeight: z.number().int().positive().optional(),
});

// ── Tags cloud ────────────────────────────────────────────────────────────────
router.get("/scenes/tags", async (_req: Request, res: Response) => {
  const rows = await db.select({ tags: scenesTable.tags }).from(scenesTable)
    .where(eq(scenesTable.status, "published"));
  const counts: Record<string, number> = {};
  for (const row of rows) {
    let tags: string[] = [];
    try { tags = JSON.parse(row.tags ?? "[]"); } catch { /* */ }
    for (const tag of tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
  res.json(sorted);
});

// ── Trending ──────────────────────────────────────────────────────────────────
router.get("/scenes/trending", async (_req: Request, res: Response) => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await db.select().from(scenesTable)
    .where(eq(scenesTable.status, "published"))
    .orderBy(desc(scenesTable.likes), desc(scenesTable.viewCount), desc(scenesTable.updatedAt))
    .limit(12);
  // prefer scenes updated in last 7 days but fall back to all-time top
  const recent = rows.filter((s) => new Date(s.updatedAt) > cutoff);
  res.json((recent.length >= 3 ? recent : rows).slice(0, 6));
});

// ── Scene remix (AI-inspired variation of an existing scene) ──────────────────
router.post("/scenes/:id/remix", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);
  const source = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!source) { res.status(404).json({ error: "Not found" }); return; }

  let elements: any[] = [];
  try { elements = JSON.parse(source.elements ?? "[]"); } catch { /* */ }

  let remixElements: any[] = [];
  try {
    const raw = await chatComplete([
      { role: "system", content: `You are a wellness scene designer. Create a REMIX of the given scene — a new composition INSPIRED by it but distinctly different. Change: colors (pick from wellness palette), layout, element sizes, animation presets, blur. Keep similar element count. Return ONLY a valid JSON array. Each element: id (new UUID), type (circle/rect), name, x, y, width, height, fill, fillOpacity:1, strokeWidth:0, opacity, rotation:0, blur, visible:true, locked:false, zIndex, animation:{preset, duration, delay:0, easing:"ease-in-out", loop:true}.` },
      { role: "user", content: `Source scene "${source.name}": ${JSON.stringify(elements.slice(0, 8))}` },
    ], { maxTokens: 1500, temperature: 1.0 });
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    remixElements = JSON.parse(cleaned);
    if (!Array.isArray(remixElements)) throw new Error("bad");
    remixElements = remixElements.map((el: any, i: number) => ({
      fillOpacity:1, strokeWidth:0, visible:true, locked:false, zIndex:i,
      animation:{preset:"none",duration:4,delay:0,easing:"ease-in-out",loop:true},
      ...el, id: crypto.randomUUID(),
    }));
  } catch {
    const palette = Object.values(WELLNESS) as string[];
    remixElements = elements.map((el: any, i: number) => ({
      ...el,
      id: crypto.randomUUID(),
      fill: palette[(i + 3) % palette.length],
      x: Math.max(40, 1440 - el.x - el.width + (Math.random() - 0.5) * 100),
      y: Math.max(40, 900  - el.y - el.height + (Math.random() - 0.5) * 80),
    }));
  }

  const [created] = await db.insert(scenesTable).values({
    userId,
    name:        `${source.name} Remix`,
    slug:        slugify(`${source.name} remix`),
    description: `Remix of: ${source.description ?? source.name}`,
    canvasWidth: source.canvasWidth, canvasHeight: source.canvasHeight,
    elements: JSON.stringify(remixElements),
    animations: JSON.stringify([]),
    themeTokens: source.themeTokens ?? JSON.stringify(WELLNESS),
    tags: source.tags,
    status: "draft",
  }).returning();

  res.status(201).json(created);
});

// ── Seed example scenes ────────────────────────────────────────────────────────
router.post("/scenes/seed", async (_req: Request, res: Response) => {
  const existing = await db.select().from(scenesTable)
    .where(eq(scenesTable.userId, GUEST_USER_ID)).limit(1);
  if (existing.length > 0) { res.json({ seeded: false, message: "Already seeded" }); return; }

  const seeds = [
    {
      name: "Ocean Dawn", slug: "ocean-dawn",
      description: "A serene ocean scene at dawn — floating orbs over deep water",
      tags: JSON.stringify(["ocean","calm","morning"]),
      themeTokens: JSON.stringify({ "--background": "#0a1628" }),
      elements: JSON.stringify([
        { id: crypto.randomUUID(), name: "Deep Orb", type: "circle", x: 120, y: 180, width: 380, height: 380, fill: "#87BBDB", fillOpacity: 1, opacity: 0.35, rotation: 0, visible: true, locked: false, zIndex: 0, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 80, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "gentle-float", duration: 8, delay: 0, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Sage Orb", type: "circle", x: 900, y: 300, width: 260, height: 260, fill: "#7FB5A0", fillOpacity: 1, opacity: 0.45, rotation: 0, visible: true, locked: false, zIndex: 1, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 60, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "gradient-breathe", duration: 6, delay: 1, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Lavender Mist", type: "rect", x: 600, y: 500, width: 500, height: 200, fill: "#B39DC2", fillOpacity: 1, opacity: 0.2, rotation: -8, visible: true, locked: false, zIndex: 2, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 50, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "drift", duration: 10, delay: 2, easing: "ease-in-out", loop: true }, tags: [] },
      ]),
    },
    {
      name: "Forest Meditation", slug: "forest-meditation",
      description: "Peaceful forest scene for deep meditation and focus",
      tags: JSON.stringify(["forest","meditation","nature"]),
      themeTokens: JSON.stringify({ "--background": "#0a1a0f" }),
      elements: JSON.stringify([
        { id: crypto.randomUUID(), name: "Forest Core", type: "circle", x: 500, y: 200, width: 440, height: 440, fill: "#4A7C6B", fillOpacity: 1, opacity: 0.4, rotation: 0, visible: true, locked: false, zIndex: 0, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 90, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "scale-pulse", duration: 7, delay: 0, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Mist Veil", type: "circle", x: 900, y: 450, width: 300, height: 300, fill: "#C8D8E0", fillOpacity: 1, opacity: 0.25, rotation: 0, visible: true, locked: false, zIndex: 1, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 70, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "fade-in-out", duration: 5, delay: 1.5, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Sand Floor", type: "rect", x: 0, y: 700, width: 1440, height: 200, fill: "#E8DDD0", fillOpacity: 1, opacity: 0.12, rotation: 0, visible: true, locked: false, zIndex: 2, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 40, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "none", duration: 4, delay: 0, easing: "ease-in-out", loop: true }, tags: [] },
      ]),
    },
    {
      name: "Cosmic Clarity", slug: "cosmic-clarity",
      description: "Maximatherapy-style scroll hero — cosmic meditation galaxy with deep space depth",
      tags: JSON.stringify(["cosmic","meditation","focus","scroll-hero"]),
      themeTokens: JSON.stringify({ "--background": "#050510" }),
      elements: JSON.stringify([
        { id: crypto.randomUUID(), name: "Galaxy Core", type: "circle", x: 580, y: 150, width: 600, height: 600, fill: "#B39DC2", fillOpacity: 1, opacity: 0.3, rotation: 0, visible: true, locked: false, zIndex: 0, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 120, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "spin-slow", duration: 20, delay: 0, easing: "linear", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Coral Nebula", type: "circle", x: 200, y: 300, width: 350, height: 350, fill: "#E8957A", fillOpacity: 1, opacity: 0.35, rotation: 0, visible: true, locked: false, zIndex: 1, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 80, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "gradient-breathe", duration: 5, delay: 0.5, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Sky Ring", type: "circle", x: 1050, y: 200, width: 280, height: 280, fill: "#87BBDB", fillOpacity: 1, opacity: 0.4, rotation: 0, visible: true, locked: false, zIndex: 2, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 50, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "gentle-float", duration: 8, delay: 1, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Deep Horizon", type: "rect", x: 0, y: 650, width: 1440, height: 250, fill: "#B39DC2", fillOpacity: 1, opacity: 0.08, rotation: 0, visible: true, locked: false, zIndex: 3, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 30, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "fade-in-out", duration: 9, delay: 2, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Star Dust", type: "circle", x: 1200, y: 600, width: 160, height: 160, fill: "#F4C5A1", fillOpacity: 1, opacity: 0.5, rotation: 0, visible: true, locked: false, zIndex: 4, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 35, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "scale-pulse", duration: 4, delay: 0.8, easing: "ease-in-out", loop: true }, tags: [] },
      ]),
    },
    {
      name: "Golden Hour", slug: "golden-hour",
      description: "Warm evening wind-down with amber and peach energy layers",
      tags: JSON.stringify(["golden","evening","energy","warmth"]),
      themeTokens: JSON.stringify({ "--background": "#1a0e05" }),
      elements: JSON.stringify([
        { id: crypto.randomUUID(), name: "Amber Sun", type: "circle", x: 650, y: 100, width: 500, height: 500, fill: "#F4C5A1", fillOpacity: 1, opacity: 0.3, rotation: 0, visible: true, locked: false, zIndex: 0, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 100, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "gradient-breathe", duration: 9, delay: 0, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Coral Glow", type: "circle", x: 150, y: 350, width: 320, height: 320, fill: "#E8957A", fillOpacity: 1, opacity: 0.4, rotation: 0, visible: true, locked: false, zIndex: 1, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 70, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "gentle-float", duration: 7, delay: 1, easing: "ease-in-out", loop: true }, tags: [] },
        { id: crypto.randomUUID(), name: "Sand Wave", type: "rect", x: 200, y: 680, width: 1000, height: 120, fill: "#E8DDD0", fillOpacity: 1, opacity: 0.15, rotation: 3, visible: true, locked: false, zIndex: 2, stroke: "transparent", strokeWidth: 0, strokeOpacity: 1, blur: 45, mixBlendMode: "normal", backdropBlur: 0, animation: { preset: "drift", duration: 11, delay: 0.5, easing: "ease-in-out", loop: true }, tags: [] },
      ]),
    },
  ];

  const rows = await Promise.all(seeds.map((s) =>
    db.insert(scenesTable).values({
      ...s, userId: GUEST_USER_ID,
      animations: JSON.stringify([]),
      canvasWidth: 1440, canvasHeight: 900,
      status: "published",
    }).returning().then(([r]) => r)
  ));

  res.status(201).json({ seeded: true, count: rows.length, ids: rows.map((r) => r.id) });
});

// ── Random public scene ───────────────────────────────────────────────────────
router.get("/scenes/random", async (_req: Request, res: Response) => {
  const rows = await db.select().from(scenesTable)
    .where(eq(scenesTable.status, "published"))
    .orderBy(desc(scenesTable.likes))
    .limit(50);
  if (rows.length === 0) { res.status(404).json({ error: "No scenes" }); return; }
  const scene = rows[Math.floor(Math.random() * rows.length)];
  res.json(scene);
});

// ── Aggregate stats ───────────────────────────────────────────────────────────
router.get("/scenes/stats", async (_req: Request, res: Response) => {
  const all       = await db.select().from(scenesTable).limit(1000);
  const published = all.filter((s) => s.status === "published");
  const totalViews = all.reduce((n, s) => n + (s.viewCount ?? 0), 0);
  const totalLikes = all.reduce((n, s) => n + (s.likes      ?? 0), 0);
  res.json({ total: all.length, published: published.length, totalViews, totalLikes });
});

// ── List ─────────────────────────────────────────────────────────────────────
router.get("/scenes", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);
  const scenes = await db.select().from(scenesTable).where(eq(scenesTable.userId, userId)).orderBy(desc(scenesTable.updatedAt)).limit(100);
  res.json(scenes);
});

// ── Public Gallery ────────────────────────────────────────────────────────────
router.get("/scenes/public", async (req: Request, res: Response) => {
  const { tag, q } = req.query as { tag?: string; q?: string };
  let rows = await db.select().from(scenesTable)
    .where(eq(scenesTable.status, "published"))
    .orderBy(desc(scenesTable.likes), desc(scenesTable.updatedAt))
    .limit(200);

  if (tag) rows = rows.filter(s => {
    try { return (JSON.parse(s.tags ?? "[]") as string[]).some((t) => t.toLowerCase().includes(tag.toLowerCase())); } catch { return false; }
  });
  if (q) rows = rows.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    (s.description ?? "").toLowerCase().includes(q.toLowerCase())
  );
  res.json(rows);
});

// ── Create ───────────────────────────────────────────────────────────────────
router.post("/scenes", async (req: Request, res: Response) => {
  const parsed = CreateSceneBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { name, description, canvasWidth, canvasHeight, elements, animations, themeTokens, tags } = parsed.data;
  const userId = getOrGuestUserId(req);

  const [scene] = await db.insert(scenesTable).values({
    userId,
    name,
    slug:         slugify(name),
    description:  description ?? null,
    canvasWidth:  canvasWidth  ?? 1440,
    canvasHeight: canvasHeight ?? 900,
    elements:     elements     ?? JSON.stringify([]),
    animations:   animations   ?? JSON.stringify([]),
    themeTokens:  themeTokens  ?? JSON.stringify(WELLNESS),
    tags:         Array.isArray(tags) ? JSON.stringify(tags) : tags ?? null,
    status:       "draft",
  }).returning();

  res.status(201).json(scene);
});

// ── Seed premium scenes ───────────────────────────────────────────────────────
router.post("/scenes/seed", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);
  const uid = () => crypto.randomUUID();

  const PREMIUM_SCENES = [
    {
      name: "Ocean Serenity",
      description: "Deep blue wellness waves with floating orbs",
      elements: JSON.stringify([
        { id: uid(), type:"circle", name:"Deep Orb",    x:120,  y:80,  width:320, height:320, fill:"#87BBDB", fillOpacity:1, strokeWidth:0, opacity:0.45, rotation:0, blur:60, visible:true, locked:false, zIndex:0, animation:{preset:"gradient-breathe",duration:6,delay:0,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Sage Moon",   x:900,  y:150, width:240, height:240, fill:"#7FB5A0", fillOpacity:1, strokeWidth:0, opacity:0.35, rotation:0, blur:50, visible:true, locked:false, zIndex:1, animation:{preset:"gentle-float",   duration:8,delay:1,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Mist Pearl",  x:600,  y:450, width:160, height:160, fill:"#C8D8E0", fillOpacity:1, strokeWidth:0, opacity:0.55, rotation:0, blur:30, visible:true, locked:false, zIndex:2, animation:{preset:"gentle-float",   duration:5,delay:0.5,easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Sky Accent",  x:1100, y:500, width:200, height:200, fill:"#87BBDB", fillOpacity:1, strokeWidth:0, opacity:0.3,  rotation:0, blur:40, visible:true, locked:false, zIndex:3, animation:{preset:"gradient-breathe",duration:7,delay:2,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"rect",   name:"Horizon Bar", x:0,    y:720, width:1440,height:180, fill:"#4A7C6B", fillOpacity:1, strokeWidth:0, opacity:0.15, rotation:0, blur:20, visible:true, locked:false, zIndex:4, animation:{preset:"none",           duration:3,delay:0,  easing:"ease-in-out",loop:true} },
      ]),
      tags: ["ocean","calm","blue","breathing"],
    },
    {
      name: "Forest Dawn",
      description: "Earthy greens and warm morning light",
      elements: JSON.stringify([
        { id: uid(), type:"circle", name:"Canopy",       x:200, y:100, width:400, height:400, fill:"#4A7C6B", fillOpacity:1, strokeWidth:0, opacity:0.4, rotation:0, blur:80, visible:true, locked:false, zIndex:0, animation:{preset:"morph",          duration:10,delay:0,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Morning Light", x:800, y:200, width:280, height:280, fill:"#F4C5A1", fillOpacity:1, strokeWidth:0, opacity:0.5, rotation:0, blur:50, visible:true, locked:false, zIndex:1, animation:{preset:"shadow-pulse",   duration:4, delay:1,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Sage Ground",  x:500, y:600, width:350, height:350, fill:"#7FB5A0", fillOpacity:1, strokeWidth:0, opacity:0.35,rotation:0, blur:60, visible:true, locked:false, zIndex:2, animation:{preset:"gradient-breathe",duration:6, delay:0.5,easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Dew Drop",     x:1100,y:450, width:120, height:120, fill:"#C8D8E0", fillOpacity:1, strokeWidth:0, opacity:0.6, rotation:0, blur:15, visible:true, locked:false, zIndex:3, animation:{preset:"gentle-float",   duration:3, delay:1.5,easing:"ease-in-out",loop:true} },
      ]),
      tags: ["forest","nature","earth","grounding"],
    },
    {
      name: "Lavender Dreams",
      description: "Soft purple hues for deep relaxation and sleep",
      elements: JSON.stringify([
        { id: uid(), type:"circle", name:"Dream Cloud",    x:300, y:100, width:500, height:500, fill:"#B39DC2", fillOpacity:1, strokeWidth:0, opacity:0.35,rotation:0, blur:90, visible:true, locked:false, zIndex:0, animation:{preset:"morph",          duration:12,delay:0,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Sleep Orb",      x:900, y:300, width:300, height:300, fill:"#7FB5A0", fillOpacity:1, strokeWidth:0, opacity:0.3, rotation:0, blur:60, visible:true, locked:false, zIndex:1, animation:{preset:"gradient-breathe",duration:8, delay:2,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Mist Veil",      x:100, y:500, width:250, height:250, fill:"#C8D8E0", fillOpacity:1, strokeWidth:0, opacity:0.4, rotation:0, blur:50, visible:true, locked:false, zIndex:2, animation:{preset:"fade-in-out",    duration:6, delay:1,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Night Glow",     x:650, y:600, width:180, height:180, fill:"#B39DC2", fillOpacity:1, strokeWidth:0, opacity:0.5, rotation:0, blur:30, visible:true, locked:false, zIndex:3, animation:{preset:"shadow-pulse",   duration:5, delay:0.5,easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Star Whisper",   x:1200,y:150, width:100, height:100, fill:"#E8DDD0", fillOpacity:1, strokeWidth:0, opacity:0.6, rotation:0, blur:10, visible:true, locked:false, zIndex:4, animation:{preset:"gentle-float",   duration:4, delay:3,  easing:"ease-in-out",loop:true} },
      ]),
      tags: ["lavender","sleep","dreams","purple"],
    },
    {
      name: "Sunrise Energy",
      description: "Warm coral and peach for morning vitality",
      elements: JSON.stringify([
        { id: uid(), type:"circle", name:"Sun Core",    x:600,  y:200, width:360, height:360, fill:"#E8957A", fillOpacity:1, strokeWidth:0, opacity:0.5, rotation:0, blur:70, visible:true, locked:false, zIndex:0, animation:{preset:"scale-pulse",    duration:4, delay:0,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Dawn Ring",   x:400,  y:300, width:500, height:500, fill:"#F4C5A1", fillOpacity:1, strokeWidth:0, opacity:0.25,rotation:0, blur:80, visible:true, locked:false, zIndex:1, animation:{preset:"gradient-breathe",duration:5, delay:1,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Coral Pop",   x:1000, y:450, width:200, height:200, fill:"#E8957A", fillOpacity:1, strokeWidth:0, opacity:0.45,rotation:0, blur:30, visible:true, locked:false, zIndex:2, animation:{preset:"elastic-bounce",  duration:2, delay:0.5,easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Sky Touch",   x:150,  y:600, width:280, height:280, fill:"#87BBDB", fillOpacity:1, strokeWidth:0, opacity:0.35,rotation:0, blur:50, visible:true, locked:false, zIndex:3, animation:{preset:"gentle-float",   duration:6, delay:2,  easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Gold Mist",   x:900,  y:100, width:150, height:150, fill:"#F4C5A1", fillOpacity:1, strokeWidth:0, opacity:0.6, rotation:0, blur:20, visible:true, locked:false, zIndex:4, animation:{preset:"spin-slow",      duration:10,delay:0,  easing:"linear",     loop:true} },
      ]),
      tags: ["sunrise","energy","warm","morning","coral"],
    },
    {
      name: "Mindful Stillness",
      description: "Minimal geometric composition for deep focus",
      elements: JSON.stringify([
        { id: uid(), type:"circle", name:"Center Void",  x:520, y:250, width:400, height:400, fill:"#7FB5A0", fillOpacity:1, strokeWidth:0, opacity:0.2, rotation:0, blur:100,visible:true, locked:false, zIndex:0, animation:{preset:"gradient-breathe",duration:8, delay:0, easing:"ease-in-out",loop:true} },
        { id: uid(), type:"rect",   name:"Horizon Line", x:200, y:440, width:1040,height:4,   fill:"#C8D8E0", fillOpacity:1, strokeWidth:0, opacity:0.3, rotation:0, blur:2,  visible:true, locked:false, zIndex:1, animation:{preset:"fade-in-out",    duration:10,delay:2, easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Focus Point",  x:660, y:390, width:60,  height:60,  fill:"#7FB5A0", fillOpacity:1, strokeWidth:0, opacity:0.8, rotation:0, blur:0,  visible:true, locked:false, zIndex:2, animation:{preset:"scale-pulse",    duration:3, delay:1, easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Peripheral L", x:100, y:300, width:180, height:180, fill:"#B39DC2", fillOpacity:1, strokeWidth:0, opacity:0.2, rotation:0, blur:40, visible:true, locked:false, zIndex:3, animation:{preset:"gentle-float",   duration:7, delay:0.5,easing:"ease-in-out",loop:true} },
        { id: uid(), type:"circle", name:"Peripheral R", x:1160,y:300, width:180, height:180, fill:"#87BBDB", fillOpacity:1, strokeWidth:0, opacity:0.2, rotation:0, blur:40, visible:true, locked:false, zIndex:4, animation:{preset:"gentle-float",   duration:7, delay:1.5,easing:"ease-in-out",loop:true} },
      ]),
      tags: ["minimal","focus","stillness","meditation"],
    },
  ];

  const created = [];
  for (const s of PREMIUM_SCENES) {
    const [scene] = await db.insert(scenesTable).values({
      userId,
      name:        s.name,
      slug:        slugify(s.name),
      description: s.description,
      canvasWidth: 1440,
      canvasHeight:900,
      elements:    s.elements,
      animations:  JSON.stringify([]),
      themeTokens: JSON.stringify(WELLNESS),
      tags:        JSON.stringify(s.tags),
      status:      "published",
    }).returning();
    created.push(scene);
  }

  res.status(201).json({ seeded: created.length, scenes: created });
});

// ── Get one ───────────────────────────────────────────────────────────────────
router.get("/scenes/:id", async (req: Request, res: Response) => {
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }
  res.json(scene);
});

// ── Update ────────────────────────────────────────────────────────────────────
router.patch("/scenes/:id", async (req: Request, res: Response) => {
  const parsed = UpdateSceneBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { name, description, status, thumbnailUrl, elements, animations, themeTokens, tags, canvasWidth, canvasHeight } = parsed.data;
  const updates: Partial<typeof scenesTable.$inferInsert> = { updatedAt: new Date() };

  if (name         !== undefined) updates.name         = name;
  if (description  !== undefined) updates.description  = description;
  if (status       !== undefined) updates.status       = status;
  if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
  if (elements     !== undefined) updates.elements     = elements;
  if (animations   !== undefined) updates.animations   = animations;
  if (themeTokens  !== undefined) updates.themeTokens  = themeTokens;
  if (canvasWidth  !== undefined) updates.canvasWidth  = canvasWidth;
  if (canvasHeight !== undefined) updates.canvasHeight = canvasHeight;
  if (tags !== undefined) updates.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;

  const [scene] = await db.update(scenesTable).set(updates).where(eq(scenesTable.id, String(req.params.id))).returning();
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }
  res.json(scene);
});

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete("/scenes/:id", async (req: Request, res: Response) => {
  await db.delete(scenesTable).where(eq(scenesTable.id, String(req.params.id)));
  res.status(204).end();
});

// ── Like ──────────────────────────────────────────────────────────────────────
router.post("/scenes/:id/like", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, id) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }
  const [updated] = await db.update(scenesTable)
    .set({ likes: (scene.likes ?? 0) + 1 })
    .where(eq(scenesTable.id, id))
    .returning();
  res.json({ likes: updated.likes });
});

// ── View ──────────────────────────────────────────────────────────────────────
router.post("/scenes/:id/view", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, id) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }
  await db.update(scenesTable).set({ viewCount: (scene.viewCount ?? 0) + 1 }).where(eq(scenesTable.id, id));
  res.json({ ok: true });
});

// ── Fork (duplicate to your own workspace) ────────────────────────────────────
router.post("/scenes/:id/fork", async (req: Request, res: Response) => {
  const userId  = getOrGuestUserId(req);
  const source  = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!source) { res.status(404).json({ error: "Scene not found" }); return; }
  const [forked] = await db.insert(scenesTable).values({
    userId,
    name:        `${source.name} (fork)`,
    slug:        slugify(`${source.name} fork`),
    description: source.description,
    canvasWidth: source.canvasWidth,
    canvasHeight:source.canvasHeight,
    elements:    source.elements,
    animations:  source.animations,
    themeTokens: source.themeTokens,
    tags:        source.tags,
    status:      "draft",
  }).returning();
  res.status(201).json(forked);
});

// ── Export ────────────────────────────────────────────────────────────────────
router.post("/scenes/:id/export", async (req: Request, res: Response) => {
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }

  const { format = "react-framer" } = req.body as { format?: string };
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  const safeName    = scene.name.replace(/\s+/g, "");
  const fileSlug    = scene.name.toLowerCase().replace(/\s+/g, "-");
  let code          = "";
  let filename      = "Scene.tsx";

  if (format === "svg" || format === "svg-optimized") {
    const svgEl = elements.map((el: any) => {
      const op = el.opacity ?? 1;
      if (el.type === "circle") return `  <circle cx="${el.x + el.width/2}" cy="${el.y + el.height/2}" r="${el.width/2}" fill="${el.fill}" opacity="${op}" />`;
      if (el.type === "rect")   return `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="12" opacity="${op}" />`;
      if (el.type === "text")   return `  <text x="${el.x}" y="${el.y + (el.height??0)/2}" font-size="${el.fontSize ?? 16}" fill="${el.fill}">${el.text ?? ""}</text>`;
      if (el.svgPath)           return `  <path d="${el.svgPath}" fill="${el.fill}" transform="translate(${el.x},${el.y})" opacity="${op}" />`;
      return                          `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" opacity="${op}" />`;
    }).join("\n");
    code     = `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.canvasWidth}" height="${scene.canvasHeight}" viewBox="0 0 ${scene.canvasWidth} ${scene.canvasHeight}">\n${svgEl}\n</svg>`;
    filename = `${fileSlug}.svg`;

  } else if (format === "cursor-prompt") {
    code = `# Scene: ${scene.name}\n\n${scene.description ?? ""}\n\nCreate a React component with ${elements.length} visual elements using Framer Motion animations.\n\nCanvas: ${scene.canvasWidth}×${scene.canvasHeight}px\n\nElements:\n${elements.map((el: any, i: number) => `${i+1}. ${el.name ?? el.type} at (${el.x},${el.y}) — ${el.width}×${el.height}px, fill: ${el.fill}, opacity: ${el.opacity}, blur: ${el.blur}px, animation: ${el.animation?.preset ?? "none"} (${el.animation?.duration ?? 3}s)`).join("\n")}\n\nTheme: ${scene.themeTokens}\n\nWellness animations: gentle-float (translateY 0↔−12px) · gradient-breathe (opacity 1↔0.45) · shadow-pulse (drop-shadow grow) · morph (border-radius morph) · spin-slow (rotate 360) · scale-pulse (scale 1↔1.15) · elastic-bounce (spring bounce)\n\n## Full JSON\n\`\`\`json\n${JSON.stringify({ elements, themeTokens: scene.themeTokens }, null, 2)}\n\`\`\``;
    filename = `${fileSlug}-cursor-prompt.md`;

  } else if (format === "lottie") {
    // Simplified Lottie 5.x JSON
    const layers = elements.map((el: any, i: number) => {
      const preset  = el.animation?.preset ?? "none";
      const dur     = (el.animation?.duration ?? 3) * 30; // frames at 30fps
      const ks: any = {
        p:  { a: 0, k: [el.x + el.width/2, el.y + el.height/2, 0] },
        a:  { a: 0, k: [0, 0, 0] },
        s:  preset === "scale-pulse"
              ? { a: 1, k: [{ t:0, s:[100,100,100] }, { t:dur/2, s:[115,115,100] }, { t:dur, s:[100,100,100] }] }
              : { a: 0, k: [100, 100, 100] },
        r:  preset === "spin-slow"
              ? { a: 1, k: [{ t:0, s:[0] }, { t:dur, s:[360] }] }
              : { a: 0, k: 0 },
        o:  preset === "gradient-breathe" || preset === "fade-in-out"
              ? { a: 1, k: [{ t:0, s:[100*el.opacity] }, { t:dur/2, s:[preset==="fade-in-out"?10:45*el.opacity] }, { t:dur, s:[100*el.opacity] }] }
              : { a: 0, k: 100 * (el.opacity ?? 1) },
      };
      return {
        ddd: 0, ind: i, ty: 4, nm: el.name ?? el.type,
        sr: 1, ks, ao: 0, ip: 0, op: dur, st: 0, bm: 0,
        shapes: [{
          ty: el.type === "circle" ? "el" : "rc",
          s:  { a: 0, k: [el.width, el.height] },
          p:  { a: 0, k: [0, 0] },
          r:  { a: 0, k: el.type === "circle" ? el.width/2 : 12 },
          nm: "Shape", mn: "ADBE Vector Shape", hd: false,
        }, {
          ty: "fl",
          c: { a: 0, k: [...hexToRgb(el.fill), 1] },
          o: { a: 0, k: 100 },
          r: 1, bm: 0, nm: "Fill",
        }],
      };
    });
    const lottie = {
      v: "5.12.1", fr: 30, ip: 0,
      op: Math.max(...elements.map((el: any) => (el.animation?.duration ?? 3) * 30), 90),
      w: scene.canvasWidth, h: scene.canvasHeight,
      nm: scene.name, ddd: 0,
      assets: [],
      layers,
    };
    code     = JSON.stringify(lottie, null, 2);
    filename = `${fileSlug}.lottie.json`;

  } else if (format === "react-gsap-lenis") {
    // Production-ready React + GSAP + ScrollTrigger + Lenis bundle
    const safeName = scene.name.replace(/\s+/g, "");
    const lines: string[] = [];
    lines.push(`"use client";`);
    lines.push(`import { useRef, useEffect } from "react";`);
    lines.push(`import gsap from "gsap";`);
    lines.push(`import { ScrollTrigger } from "gsap/ScrollTrigger";`);
    lines.push(`import Lenis from "lenis";`);
    lines.push(``);
    lines.push(`gsap.registerPlugin(ScrollTrigger);`);
    lines.push(``);
    lines.push(`// ${scene.name}`);
    lines.push(`// Auto-generated — React + GSAP + ScrollTrigger + Lenis`);
    lines.push(`// Canvas: ${scene.canvasWidth}×${scene.canvasHeight}px`);
    lines.push(``);
    lines.push(`const ELEMENTS = ${JSON.stringify(elements.map((el: any) => ({ ...el, animation: el.animation ?? { preset: "none" } })), null, 2)} as const;`);
    lines.push(``);
    lines.push(`export function ${safeName}Scene() {`);
    lines.push(`  const rootRef = useRef<HTMLDivElement>(null);`);
    lines.push(``);
    lines.push(`  useEffect(() => {`);
    lines.push(`    const ctx = gsap.context(() => {`);
    lines.push(`      // Lenis smooth scroll`);
    lines.push(`      const lenis = new Lenis({ lerp: 0.08, duration: 1.2, smoothWheel: true });`);
    lines.push(`      lenis.on("scroll", ScrollTrigger.update);`);
    lines.push(`      gsap.ticker.add((t) => lenis.raf(t * 1000));`);
    lines.push(`      gsap.ticker.lagSmoothing(0);`);
    lines.push(``);
    lines.push(`      // Element animations`);
    lines.push(`      const presetMap: Record<string, gsap.TweenVars> = {`);
    lines.push(`        "gentle-float":    { y: -18, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "gradient-breathe":{ opacity: 0.45, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "shadow-pulse":    { filter: "drop-shadow(0 0 18px currentColor)", duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "hover-lift":      { y: -10, scale: 1.04, duration: 2, yoyo: true, repeat: -1 },`);
    lines.push(`        "morph":           { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%", duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "spin-slow":       { rotation: 360, duration: 10, repeat: -1, ease: "none" },`);
    lines.push(`        "scale-pulse":     { scale: 1.15, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "fade-in-out":     { opacity: 0.08, duration: 3, yoyo: true, repeat: -1 },`);
    lines.push(`        "drift":           { x: 15, duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "scroll-reveal":   { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: "", start: "top 80%", toggleActions: "play none none reverse" } },`);
    lines.push(`        "elastic-bounce":  { y: -20, duration: 1.5, repeat: -1, ease: "elastic.out(1, 0.4)" },`);
    lines.push(`        "aurora-sweep":    { x: "-5%", duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "cosmic-pulse":    { scale: 1.1, rotation: 180, duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut" },`);
    lines.push(`        "lenis-parallax":  { y: -120, scrollTrigger: { trigger: "", start: "top bottom", end: "bottom top", scrub: true } },`);
    lines.push(`      };`);
    lines.push(``);
    lines.push(`      (ELEMENTS as any[]).forEach((el: any) => {`);
    lines.push(`        const node = document.getElementById(el.id);`);
    lines.push(`        if (!node) return;`);
    lines.push(`        const preset = el.animation?.preset ?? "none";`);
    lines.push(`        if (preset === "none") return;`);
    lines.push(``);
    lines.push(`        const base: gsap.TweenVars = {`);
    lines.push(`          duration: el.animation?.duration ?? 3,`);
    lines.push(`          delay: el.animation?.delay ?? 0,`);
    lines.push(`          ease: "sine.inOut",`);
    lines.push(`          yoyo: true,`);
    lines.push(`          repeat: el.animation?.loop ? -1 : 0,`);
    lines.push(`        };`);
    lines.push(``);
    lines.push(`        const vars = { ...base, ...(presetMap[preset] ?? {}) };`);
    lines.push(`        const st = (vars as any).scrollTrigger;`);
    lines.push(`        if (st && !st.trigger) (vars as any).scrollTrigger = { ...st, trigger: node };`);
    lines.push(``);
    lines.push(`        gsap.fromTo(node, {}, vars);`);
    lines.push(`      });`);
    lines.push(``);
    lines.push(`      ScrollTrigger.refresh();`);
    lines.push(`    }, rootRef);`);
    lines.push(``);
    lines.push(`    return () => { ctx.revert(); };`);
    lines.push(`  }, []);`);
    lines.push(``);
    lines.push(`  const render = (el: any, i: number) => {`);
    lines.push(`    const s: Record<string, string | number> = {`);
    lines.push(`      position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height,`);
    lines.push(`      background: el.fill, opacity: el.opacity ?? 1, zIndex: i,`);
    lines.push(`    };`);
    lines.push(`    if (el.rotation) s.transform = \`rotate(\${el.rotation}deg)\`;`);
    lines.push(`    if ((el.blur ?? 0) > 0) (s as any).filter = \`blur(\${el.blur}px)\`;`);
    lines.push(`    const tag = el.type === "circle" ? "div" : el.type === "text" ? "div" : "div";`);
    lines.push(`    const inner = el.type === "text"`);
    lines.push(`      ? <span style={{ color: el.fill, fontSize: el.fontSize ?? 24, fontWeight: el.fontWeight ?? 400 }}>{el.text}</span>`);
    lines.push(`      : null;`);
    lines.push(`    return <\${tag} key={el.id} id={el.id} style={{ ...s, borderRadius: el.type === "circle" ? "50%" : 12 }}>\${inner}</\${tag}>;`);
    lines.push(`  };`);
    lines.push(``);
    lines.push(`  return (`);
    lines.push(`    <div ref={rootRef} style={{ position: "relative", width: ${scene.canvasWidth}, height: ${scene.canvasHeight}, overflow: "hidden", background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" }}>`);
    lines.push(`      {(ELEMENTS as any[]).map((el: any, i: number) => render(el, i))}`);
    lines.push(`    </div>`);
    lines.push(`  );`);
    lines.push(`}`);
    lines.push(``);
    lines.push(`export default ${safeName}Scene;`);
    lines.push(``);

    code = lines.join("\n");
    filename = `${safeName}Scene-gsap-lenis.tsx`;

  } else if (format === "gsap") {
    const els = elements.map((el: any, i: number) => {
      const id     = `el_${i}`;
      const preset = el.animation?.preset ?? "none";
      const dur    = el.animation?.duration ?? 3;
      const delay  = el.animation?.delay ?? 0;
      let tween    = "";
      if (preset === "gentle-float")     tween = `gsap.to("#${id}", { y: -12, duration: ${dur/2}, delay: ${delay}, ease: "sine.inOut", yoyo: true, repeat: -1 });`;
      else if (preset === "gradient-breathe") tween = `gsap.to("#${id}", { opacity: 0.45, duration: ${dur/2}, delay: ${delay}, ease: "sine.inOut", yoyo: true, repeat: -1 });`;
      else if (preset === "shadow-pulse") tween = `gsap.to("#${id}", { filter: "drop-shadow(0 0 20px ${el.fill})", duration: ${dur/2}, delay: ${delay}, ease: "sine.inOut", yoyo: true, repeat: -1 });`;
      else if (preset === "spin-slow")   tween = `gsap.to("#${id}", { rotation: 360, duration: ${dur}, delay: ${delay}, ease: "linear", repeat: -1 });`;
      else if (preset === "scale-pulse") tween = `gsap.to("#${id}", { scale: 1.15, duration: ${dur/2}, delay: ${delay}, ease: "sine.inOut", yoyo: true, repeat: -1 });`;
      else if (preset === "morph")       tween = `gsap.to("#${id}", { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%", duration: ${dur}, delay: ${delay}, ease: "sine.inOut", yoyo: true, repeat: -1 });`;
      return { id, style: `#${id} { position:absolute; left:${el.x}px; top:${el.y}px; width:${el.width}px; height:${el.height}px; background:${el.fill}; opacity:${el.opacity}; border-radius:${el.type==="circle"?"50%":"12px"}; filter:blur(${el.blur ?? 0}px); }`, tween };
    });
    code = `<!DOCTYPE html>\n<html><head><meta charset="utf-8">\n<style>\nbody{margin:0;background:#0d1117;}\n#scene{position:relative;width:${scene.canvasWidth}px;height:${scene.canvasHeight}px;overflow:hidden;}\n${els.map(e => e.style).join("\n")}\n</style>\n</head><body>\n<div id="scene">\n${els.map((e, i) => `  <div id="${e.id}"></div>`).join("\n")}\n</div>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n<script>\n// ${scene.name} — GSAP Animation Bundle\n${els.filter(e => e.tween).map(e => e.tween).join("\n")}\n</script>\n</body></html>`;
    filename = `${fileSlug}-gsap.html`;

  } else if (format === "css-keyframes") {
    const styles = elements.map((el: any, i: number) => {
      const preset = el.animation?.preset ?? "none";
      const dur    = el.animation?.duration ?? 3;
      const delay  = el.animation?.delay ?? 0;
      const animVal = preset !== "none" ? `animation: ${preset} ${dur}s ease-in-out ${delay}s infinite;` : "";
      return `.scene-el-${i} {\n  position: absolute;\n  left: ${el.x}px; top: ${el.y}px;\n  width: ${el.width}px; height: ${el.height}px;\n  background: ${el.fill};\n  opacity: ${el.opacity};\n  border-radius: ${el.type === "circle" ? "50%" : "12px"};\n  filter: blur(${el.blur ?? 0}px);\n  ${animVal}\n}`;
    }).join("\n\n");
    code = `/* ${scene.name} — CSS Animation Bundle */\n/* Canvas: ${scene.canvasWidth}×${scene.canvasHeight}px */\n\n@keyframes gentle-float     { 0%,100%{transform:translateY(0)}      50%{transform:translateY(-12px)} }\n@keyframes gradient-breathe { 0%,100%{opacity:1}                    50%{opacity:0.45} }\n@keyframes shadow-pulse     { 0%,100%{filter:drop-shadow(0 0 0 transparent)} 50%{filter:drop-shadow(0 0 16px currentColor)} }\n@keyframes morph            { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }\n@keyframes spin-slow        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }\n@keyframes fade-in-out      { 0%,100%{opacity:0.1} 50%{opacity:0.9} }\n@keyframes scale-pulse      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }\n@keyframes elastic-bounce   { 0%{transform:translateY(0) scaleY(1)} 20%{transform:translateY(-20px) scaleY(0.9)} 40%{transform:translateY(0) scaleY(1.1)} 100%{transform:translateY(0)} }\n\n.scene-container {\n  position: relative;\n  width: ${scene.canvasWidth}px;\n  height: ${scene.canvasHeight}px;\n  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);\n  overflow: hidden;\n}\n\n${styles}`;
    filename = `${fileSlug}.css`;

  } else if (format === "tailwind-framer") {
    const animMap: Record<string, string> = {
      "gentle-float":     `animate={{ y: [0, -12, 0] }} transition={{ duration: ${3}, repeat: Infinity, ease: "easeInOut" }}`,
      "gradient-breathe": `animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: ${4}, repeat: Infinity }}`,
      "shadow-pulse":     `animate={{ filter: ["drop-shadow(0 0 0 transparent)", "drop-shadow(0 0 16px currentColor)", "drop-shadow(0 0 0 transparent)"] }} transition={{ duration: ${2}, repeat: Infinity }}`,
      "spin-slow":        `animate={{ rotate: 360 }} transition={{ duration: ${8}, repeat: Infinity, ease: "linear" }}`,
      "scale-pulse":      `animate={{ scale: [1, 1.15, 1] }} transition={{ duration: ${2}, repeat: Infinity }}`,
      "elastic-bounce":   `animate={{ y: [0, -20, 0, -10, 0] }} transition={{ duration: ${1.5}, repeat: Infinity, type: "spring" }}`,
      "fade-in-out":      `animate={{ opacity: [0.1, 0.9, 0.1] }} transition={{ duration: ${3}, repeat: Infinity }}`,
      "morph":            `animate={{}} transition={{}}`,
    };
    const compEls = elements.map((el: any, i: number) => {
      const preset  = el.animation?.preset ?? "none";
      const animStr = animMap[preset] ?? "";
      const isCirc  = el.type === "circle";
      const blur    = (el.blur ?? 0) > 0 ? ` blur-[${el.blur}px]` : "";
      return `      {/* ${el.name} */}\n      <motion.div\n        className="absolute${blur}"\n        style={{ left:${el.x}, top:${el.y}, width:${el.width}, height:${el.height}, background:"${el.fill}", opacity:${el.opacity}, borderRadius:${isCirc?'"50%"':'"12px"'} }}\n        ${animStr}\n      />`;
    }).join("\n");
    code = `"use client";\nimport { motion } from "framer-motion";\n\nexport function ${safeName}Scene() {\n  return (\n    <div\n      className="relative overflow-hidden"\n      style={{ width: ${scene.canvasWidth}, height: ${scene.canvasHeight}, background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" }}\n    >\n${compEls}\n    </div>\n  );\n}\n`;
    filename = `${safeName}Scene.tsx`;

  } else {
    // react-framer (default) or nextjs
    const animMap: Record<string, string> = {
      "gentle-float":     "{ animate: { y: [0, -12, 0] }, transition: { duration: DUR, repeat: Infinity, ease: 'easeInOut' } }",
      "gradient-breathe": "{ animate: { opacity: [1, 0.45, 1] }, transition: { duration: DUR, repeat: Infinity } }",
      "shadow-pulse":     "{ animate: { filter: ['drop-shadow(0 0 0 transparent)', 'drop-shadow(0 0 16px FILL)', 'drop-shadow(0 0 0 transparent)'] }, transition: { duration: DUR, repeat: Infinity } }",
      "spin-slow":        "{ animate: { rotate: 360 }, transition: { duration: DUR, repeat: Infinity, ease: 'linear' } }",
      "scale-pulse":      "{ animate: { scale: [1, 1.15, 1] }, transition: { duration: DUR, repeat: Infinity } }",
      "elastic-bounce":   "{ animate: { y: [0, -20, 0, -10, 0] }, transition: { duration: 1.5, repeat: Infinity, type: 'spring' } }",
      "fade-in-out":      "{ animate: { opacity: [0.1, 0.9, 0.1] }, transition: { duration: DUR, repeat: Infinity } }",
    };
    const animProps = elements.map((el: any) => {
      const p = el.animation?.preset ?? "none";
      const d = el.animation?.duration ?? 3;
      let s = animMap[p] ?? "{}";
      s = s.replace(/DUR/g, String(d)).replace(/FILL/g, el.fill);
      return s;
    });
    const componentEls = elements.map((el: any, i: number) => (
      `      <motion.div key="${el.id}" style={{ position:"absolute",left:${el.x},top:${el.y},width:${el.width},height:${el.height},background:"${el.fill}",opacity:${el.opacity ?? 1},borderRadius:${el.type==="circle"?'"50%"':'"12px"'},filter:${el.blur?`"blur(${el.blur}px)"`:"'none'"},transform:"rotate(${el.rotation??0}deg)" }} ${animProps[i] !== "{}" ? `{...${animProps[i]}}` : ""} />`
    )).join("\n");
    code = `"use client";\nimport { motion } from "framer-motion";\n\nexport function ${safeName}Scene() {\n  return (\n    <div style={{ position:"relative",width:${scene.canvasWidth},height:${scene.canvasHeight},overflow:"hidden",background:"linear-gradient(135deg,#0d1117 0%,#161b22 100%)" }}>\n${componentEls}\n    </div>\n  );\n}\n`;
    filename = `${safeName}Scene.tsx`;
    if (format === "nextjs") {
      filename = "page.tsx";
      code = `import { ${safeName}Scene } from "./${safeName}Scene";\n\nexport default function Page() {\n  return <${safeName}Scene />;\n}\n\n` + code;
    }
  }

  res.json({ code, format, filename });
});

// ── AI Enhance ───────────────────────────────────────────────────────────────
router.post("/scenes/:id/enhance", async (req: Request, res: Response) => {
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }

  const { mode = "deeper-calm" } = req.body as { mode?: string };
  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  const MODES: Record<string, { palette: string[]; animPresets: string[]; description: string; blurRange: [number,number]; opacityRange: [number,number] }> = {
    "deeper-calm":    { palette:["#87BBDB","#7FB5A0","#B39DC2","#C8D8E0"], animPresets:["gentle-float","gradient-breathe","morph"],          description:"Deeper blues/greens, slower animations, more blur — pure serenity",                  blurRange:[40,90], opacityRange:[0.25,0.55] },
    "therapy-mode":   { palette:["#B39DC2","#C8D8E0","#E8DDD0","#7FB5A0"], animPresets:["gradient-breathe","morph","fade-in-out"],            description:"Muted earthy tones, ultra-slow breathing animations, very organic shapes",             blurRange:[30,80], opacityRange:[0.2, 0.45] },
    "morning-energy": { palette:["#E8957A","#F4C5A1","#87BBDB","#4A7C6B"], animPresets:["elastic-bounce","scale-pulse","shadow-pulse"],       description:"Warm corals and peach, energetic animations, brighter and more vivid",                 blurRange:[10,40], opacityRange:[0.5, 0.8]  },
    "sleep-wind-down":{ palette:["#6B7DB3","#4A7C6B","#B39DC2","#C8D8E0"], animPresets:["gradient-breathe","gentle-float","fade-in-out"],     description:"Deep indigo and navy, ultra-slow pulse, very low opacity for sleep environment",        blurRange:[50,100],opacityRange:[0.15,0.35] },
    "focus-flow":      { palette:["#87BBDB","#7FB5A0","#E8DDD0","#C8D8E0"], animPresets:["scale-pulse","gentle-float","gradient-breathe"],     description:"Minimal cool tones, steady rhythmic animations, sharp edges for clarity",              blurRange:[5, 30], opacityRange:[0.3, 0.65] },
    "cosmic-dreams":   { palette:["#6B3FA0","#B39DC2","#4A7C6B","#87BBDB"], animPresets:["spin-slow","gradient-breathe","gentle-float"],          description:"Deep purples and midnight blues, slow cosmic spin animations, galactic atmosphere",     blurRange:[40,90], opacityRange:[0.2, 0.5]  },
    "nature-immersion":{ palette:["#4A7C6B","#7FB5A0","#E8DDD0","#C8D8E0"], animPresets:["drift","gentle-float","morph"],                         description:"Forest greens and earth tones, organic slow drift animations, nature feel",             blurRange:[20,60], opacityRange:[0.4, 0.7]  },
    "golden-hour":     { palette:["#F4C5A1","#E8957A","#FFD580","#87BBDB"], animPresets:["gradient-breathe","hover-lift","shadow-pulse"],          description:"Warm ambers and rose gold, gentle float and breathe, uplifting warmth",                blurRange:[15,50], opacityRange:[0.45,0.75] },
  };

  const modeConfig = MODES[mode] ?? MODES["deeper-calm"];

  try {
    const raw = await chatComplete([
      { role: "system", content: `You are a wellness scene enhancer. Given a list of SVG elements, return a modified version that embodies: "${modeConfig.description}".
Rules:
- Keep all element IDs, types, positions, sizes, and names IDENTICAL
- Only change: fill (choose from palette), opacity (range ${modeConfig.opacityRange[0]}-${modeConfig.opacityRange[1]}), blur (range ${modeConfig.blurRange[0]}-${modeConfig.blurRange[1]}), animation preset (use one of: ${modeConfig.animPresets.join(", ")})
- Palette: ${modeConfig.palette.join(", ")}
- Return ONLY valid JSON array of all elements, no markdown, same length as input.` },
      { role: "user", content: JSON.stringify(elements.slice(0, 12)) },
    ], { maxTokens: 2000, temperature: 0.6 });

    const cleaned  = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const enhanced = JSON.parse(cleaned) as any[];
    if (!Array.isArray(enhanced) || enhanced.length === 0) throw new Error("bad response");

    const merged = enhanced.map((enhanced: any, i: number) => ({
      ...elements[i],
      fill:      enhanced.fill      ?? elements[i]?.fill,
      opacity:   enhanced.opacity   ?? elements[i]?.opacity,
      blur:      enhanced.blur      ?? elements[i]?.blur,
      animation: enhanced.animation ?? elements[i]?.animation,
    }));

    res.json({ elements: merged, mode });
  } catch {
    // Fallback: apply palette and animation changes heuristically
    const fallback = elements.map((el: any, i: number) => ({
      ...el,
      fill:      modeConfig.palette[i % modeConfig.palette.length],
      opacity:   modeConfig.opacityRange[0] + (i % 3) * ((modeConfig.opacityRange[1] - modeConfig.opacityRange[0]) / 3),
      blur:      modeConfig.blurRange[0]    + (i % 3) * ((modeConfig.blurRange[1] - modeConfig.blurRange[0]) / 3),
      animation: { ...el.animation, preset: modeConfig.animPresets[i % modeConfig.animPresets.length] },
    }));
    res.json({ elements: fallback, mode });
  }
});

// ── Batch publish / unpublish ─────────────────────────────────────────────────
router.post("/scenes/batch", async (req: Request, res: Response) => {
  const { ids, action } = req.body as { ids: string[]; action: "publish" | "unpublish" | "delete" };
  if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: "ids required" }); return; }

  if (action === "delete") {
    for (const id of ids) {
      await db.delete(scenesTable).where(eq(scenesTable.id, id));
    }
    res.json({ ok: true, affected: ids.length });
    return;
  }

  const status = action === "publish" ? "published" : "draft";
  for (const id of ids) {
    await db.update(scenesTable).set({ status, updatedAt: new Date() }).where(eq(scenesTable.id, id));
  }
  res.json({ ok: true, affected: ids.length, status });
});

// ── Similar scenes ────────────────────────────────────────────────────────────
router.get("/scenes/:id/similar", async (req: Request, res: Response) => {
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!scene) { res.status(404).json({ error: "Not found" }); return; }

  let tags: string[] = [];
  try { tags = JSON.parse(scene.tags ?? "[]"); } catch { /* */ }

  const all = await db.select().from(scenesTable)
    .where(eq(scenesTable.status, "published"))
    .orderBy(desc(scenesTable.likes))
    .limit(100);

  const scored = all
    .filter((s) => s.id !== scene.id)
    .map((s) => {
      let sTags: string[] = [];
      try { sTags = JSON.parse(s.tags ?? "[]"); } catch { /* */ }
      const overlap = tags.filter((t) => sTags.includes(t)).length;
      return { scene: s, score: overlap };
    })
    .sort((a, b) => b.score - a.score || (b.scene.likes ?? 0) - (a.scene.likes ?? 0));

  res.json(scored.slice(0, 4).map((s) => s.scene));
});

// ── AI Variant ────────────────────────────────────────────────────────────────
router.post("/scenes/:id/variant", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);
  const scene  = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }

  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  let variantElements: any[] = [];
  try {
    const raw = await chatComplete([
      { role: "system", content: `You are a wellness scene designer. Create a VARIANT of the given scene. Keep similar structure and element count but vary: colors, sizes, positions, animation presets, blur amounts. Return ONLY a valid JSON array of elements. Canvas: 1440×900px. Wellness palette: sage #7FB5A0, lavender #B39DC2, coral #E8957A, sky #87BBDB, peach #F4C5A1, forest #4A7C6B, mist #C8D8E0, sand #E8DDD0. Each element needs all fields: id (new UUID), type, name, x, y, width, height, fill, fillOpacity, strokeWidth, opacity, rotation, blur, visible, locked, zIndex, animation:{preset, duration, delay, easing, loop}.` },
      { role: "user", content: `Original scene "${scene.name}": ${JSON.stringify(elements.slice(0,8))}` },
    ], { maxTokens: 1500, temperature: 0.9 });
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    variantElements = JSON.parse(cleaned);
    if (!Array.isArray(variantElements)) throw new Error("bad");
    variantElements = variantElements.map((el: any) => ({
      fillOpacity: 1, strokeWidth: 0, visible: true, locked: false,
      animation: { preset: "none", duration: 3, delay: 0, easing: "ease-in-out", loop: true },
      ...el, id: crypto.randomUUID(),
    }));
  } catch {
    variantElements = elements.map((el: any) => ({
      ...el,
      id:         crypto.randomUUID(),
      fill:       Object.values(WELLNESS)[Math.floor(Math.random() * 8)] as string,
      x:          Math.max(50, el.x  + (Math.random() - 0.5) * 200),
      y:          Math.max(50, el.y  + (Math.random() - 0.5) * 150),
      width:      Math.max(60, el.width  * (0.7 + Math.random() * 0.6)),
      height:     Math.max(60, el.height * (0.7 + Math.random() * 0.6)),
      opacity:    Math.max(0.2, Math.min(0.85, (el.opacity ?? 0.5) + (Math.random() - 0.5) * 0.3)),
      blur:       Math.max(0, (el.blur ?? 20) + (Math.random() - 0.5) * 30),
    }));
  }

  const [created] = await db.insert(scenesTable).values({
    userId,
    name:        `${scene.name} (variant)`,
    slug:        slugify(`${scene.name} variant`),
    description: scene.description,
    canvasWidth: scene.canvasWidth,
    canvasHeight:scene.canvasHeight,
    elements:    JSON.stringify(variantElements),
    animations:  JSON.stringify([]),
    themeTokens: scene.themeTokens ?? JSON.stringify(WELLNESS),
    tags:        scene.tags,
    status:      "draft",
  }).returning();

  res.status(201).json(created);
});

// ── AI Generate ───────────────────────────────────────────────────────────────
router.post("/scenes/ai-generate", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);
  const { prompt, style = "wellness" } = req.body as { prompt?: string; style?: string };
  if (!prompt) { res.status(400).json({ error: "prompt is required" }); return; }

  let elements: object[] = [];
  let name = prompt.split(" ").slice(0, 4).join(" ");

  try {
    const raw = await chatComplete([
      { role: "system", content: `You are a wellness visual scene designer. Return a JSON array of scene elements. Each element: { "id":"uuid","type":"circle"|"rect"|"blob"|"text"|"wave","name":"string","x":number,"y":number,"width":number,"height":number,"fill":"#hex","fillOpacity":1,"strokeWidth":0,"opacity":0-1,"rotation":0-360,"blur":0-80,"visible":true,"locked":false,"zIndex":number,"animation":{"preset":"${ANIM_PRESETS.filter(p=>p!=="none").join("|")}|none","duration":number,"delay":number,"easing":"ease-in-out","loop":true} }. Canvas 1440×900px. Wellness palette: sage #7FB5A0, lavender #B39DC2, coral #E8957A, sky #87BBDB. Return ONLY valid JSON array of 4-8 elements.` },
      { role: "user", content: `Design a ${style} wellness scene: "${prompt}"` },
    ], { maxTokens: 1500, temperature: 0.8 });
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    elements = JSON.parse(cleaned);
    if (!Array.isArray(elements)) throw new Error("not array");
  } catch {
    const uid = () => crypto.randomUUID();
    elements = [
      { id:uid(), type:"circle", name:"Sage Orb",     x:200, y:150, width:200, height:200, fill:"#7FB5A0", fillOpacity:1, strokeWidth:0, opacity:0.6, rotation:0, blur:30, visible:true, locked:false, zIndex:0, animation:{preset:"gentle-float",    duration:4, delay:0,   easing:"ease-in-out", loop:true} },
      { id:uid(), type:"circle", name:"Lavender Orb", x:900, y:300, width:280, height:280, fill:"#B39DC2", fillOpacity:1, strokeWidth:0, opacity:0.5, rotation:0, blur:40, visible:true, locked:false, zIndex:1, animation:{preset:"gradient-breathe",duration:5, delay:1,   easing:"ease-in-out", loop:true} },
      { id:uid(), type:"circle", name:"Coral Orb",    x:550, y:500, width:150, height:150, fill:"#E8957A", fillOpacity:1, strokeWidth:0, opacity:0.4, rotation:0, blur:25, visible:true, locked:false, zIndex:2, animation:{preset:"shadow-pulse",    duration:3, delay:0.5, easing:"ease-in-out", loop:true} },
      { id:uid(), type:"rect",   name:"Sky Card",     x:700, y:100, width:320, height:200, fill:"#87BBDB", fillOpacity:1, strokeWidth:0, opacity:0.3, rotation:-5,blur:0,  visible:true, locked:false, zIndex:3, animation:{preset:"none",            duration:0, delay:0,   easing:"ease-in-out", loop:true} },
    ];
  }

  const [scene] = await db.insert(scenesTable).values({
    userId, name, slug: slugify(name),
    elements: JSON.stringify(elements), animations: JSON.stringify([]),
    themeTokens: JSON.stringify(WELLNESS), status: "draft",
    canvasWidth: 1440, canvasHeight: 900,
  }).returning();

  res.json(scene);
});

// ── Scene Chat ────────────────────────────────────────────────────────────────
router.post("/scenes/:id/chat", async (req: Request, res: Response) => {
  const { message, elements = [], selectedId } = req.body as { message?: string; elements?: any[]; selectedId?: string | null };
  if (!message) { res.status(400).json({ error: "message is required" }); return; }

  const selectedEl  = selectedId ? elements.find((el: any) => el.id === selectedId) : null;
  const elemSummary = elements.slice(0, 12).map((el: any) =>
    `• ${el.name ?? el.type} (${el.type}) pos:(${el.x},${el.y}) size:${el.width}×${el.height} fill:${el.fill} opacity:${el.opacity} blur:${el.blur ?? 0} anim:${el.animation?.preset ?? "none"}`
  ).join("\n");

  const systemPrompt = `You are an AI scene designer for a wellness SVG canvas editor (1440×900px).

CURRENT CANVAS — ${elements.length} element(s):
${elemSummary || "(empty canvas)"}
${selectedEl ? `\nSELECTED: ${selectedEl.name} (${selectedEl.type}) id:${selectedEl.id}` : ""}

Respond ONLY with valid JSON (no markdown):
{ "text": "Friendly one-line description", "actions": [ { "type": "add", "element": {...full SceneElement...} }, { "type": "update", "id": "existing-id", "updates": {...partial fields...} }, { "type": "delete", "id": "existing-id" } ] }

SceneElement shape (all fields required for "add"):
  id (new UUID), type (circle|rect|blob|wave|leaf|triangle|hexagon|star|diamond|text|line),
  name, x, y, width, height (numbers), fill (#hex), fillOpacity (1), strokeWidth (0),
  opacity (0-1), rotation (0-360), blur (0-80), visible (true), locked (false), zIndex (${elements.length}),
  animation: { preset (${ANIM_PRESETS.join("|")}), duration (3), delay (0), easing ("ease-in-out"), loop (true) }

Wellness palette: sage #7FB5A0 · lavender #B39DC2 · coral #E8957A · sky #87BBDB · peach #F4C5A1 · forest #4A7C6B · mist #C8D8E0 · sand #E8DDD0
Pure questions → return { "text": "...", "actions": [] }
Never invent IDs for "update"/"delete" — only use IDs from the canvas list above.`;

  try {
    const raw     = await chatComplete([{ role:"system", content:systemPrompt }, { role:"user", content:message }], { maxTokens:1200, temperature:0.6 });
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed  = JSON.parse(cleaned);

    if (Array.isArray(parsed.actions)) {
      parsed.actions = parsed.actions.map((action: any) => {
        if (action.type === "add" && action.element) {
          return { ...action, element: { fillOpacity:1, strokeWidth:0, visible:true, locked:false, zIndex:elements.length, animation:{preset:"none",duration:3,delay:0,easing:"ease-in-out",loop:true}, ...action.element, id: crypto.randomUUID() } };
        }
        return action;
      });
    }
    res.json({ text: parsed.text ?? "", actions: parsed.actions ?? [] });
  } catch {
    res.json({ text: `Got it — "${message.slice(0,60)}". Try: "add a floating sage orb top-right" or "make all elements 50% transparent".`, actions: [] });
  }
});

// ── Standalone HTML export ────────────────────────────────────────────────────
router.get("/scenes/:id/export-html", async (req: Request, res: Response) => {
  const scene = await db.query.scenesTable.findFirst({ where: eq(scenesTable.id, String(req.params.id)) });
  if (!scene) { res.status(404).json({ error: "Scene not found" }); return; }

  let elements: any[] = [];
  try { elements = JSON.parse(scene.elements ?? "[]"); } catch { /* */ }

  let tokens: Record<string, string> = {};
  try { tokens = JSON.parse(scene.themeTokens ?? "{}"); } catch { /* */ }
  const bg = tokens["--background"] ?? "#0d0d1a";

  const defs = elements
    .filter((el) => (el.blur ?? 0) > 0)
    .map((el) => `<filter id="f${el.id.replace(/-/g,"")}"><feGaussianBlur stdDeviation="${el.blur}"/></filter>`)
    .join("");

  const shapes = elements.filter((el) => el.visible !== false).map((el) => {
    const op     = el.opacity ?? 0.7;
    const preset = el.animation?.preset ?? "none";
    const dur    = el.animation?.duration ?? 8;
    const delay  = el.animation?.delay ?? 0;
    const animSt = preset !== "none" ? `animation:${preset} ${dur}s ease-in-out ${delay}s infinite;` : "";
    const filt   = (el.blur ?? 0) > 0 ? ` filter="url(#f${el.id.replace(/-/g,"")}")"` : "";
    const rot    = el.rotation ? ` transform="rotate(${el.rotation},${el.x + el.width/2},${el.y + el.height/2})"` : "";

    if (el.type === "circle") return `<circle cx="${el.x + el.width/2}" cy="${el.y + el.height/2}" r="${el.width/2}" fill="${el.fill}" opacity="${op}"${filt}${rot} style="--op:${op};${animSt}"/>`;
    if (el.type === "rect")   return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="12" fill="${el.fill}" opacity="${op}"${filt}${rot} style="--op:${op};${animSt}"/>`;
    return "";
  }).filter(Boolean).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${scene.name} — Wellness Scene</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100vh;overflow:hidden;background:${bg};display:flex;align-items:center;justify-content:center}
svg{width:100%;height:100%;display:block;position:absolute;inset:0}
@keyframes gentle-float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes gradient-breathe{0%,100%{opacity:var(--op,0.7);transform:scale(1)}50%{opacity:calc(var(--op,0.7) + 0.2);transform:scale(1.06)}}
@keyframes shadow-pulse    {0%,100%{opacity:var(--op,0.7)}50%{opacity:calc(var(--op,0.7) + 0.25)}}
@keyframes scale-pulse     {0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes fade-in-out     {0%,100%{opacity:var(--op,0.7)}50%{opacity:calc(var(--op,0.7) * 0.4)}}
@keyframes morph           {0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.05) rotate(3deg)}}
@keyframes drift           {0%,100%{transform:translateX(0)}50%{transform:translateX(15px)}}
@keyframes spin-slow       {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes elastic-bounce  {0%,100%{transform:scale(1)}30%{transform:scale(1.15)}60%{transform:scale(0.92)}80%{transform:scale(1.06)}}
@keyframes hover-lift      {0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.04)}}
@keyframes scroll-reveal   {0%{opacity:0;transform:translateY(20px)}100%{opacity:var(--op,0.7);transform:translateY(0)}}
</style>
</head>
<body>
<svg viewBox="0 0 ${scene.canvasWidth ?? 1440} ${scene.canvasHeight ?? 900}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs>
${shapes}
</svg>
</body>
</html>`;

  const filename = `${(scene.slug ?? scene.name).toLowerCase().replace(/[^a-z0-9-]/g,"-")}-scene.html`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(html);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number,number,number] {
  const clean = hex.replace("#","");
  const n     = parseInt(clean.length === 3 ? clean.split("").map(c=>c+c).join("") : clean, 16);
  return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255];
}

export default router;
