import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { usersTable, scenesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// ── Process-level crash guards ──────────────────────────────────────────────
// Catch the two process-wide failure modes that Express error handlers can't
// reach. We log with full context and exit non-zero so the process manager
// (systemd / Vercel / Docker) restarts us — a silent hang is worse than a
// clean crash with a logged cause.
process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException — crashing process");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandledRejection — crashing process");
  process.exit(1);
});

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

async function ensureGuestUser() {
  try {
    const existing = await db.query.usersTable.findFirst({ where: eq(usersTable.id, GUEST_USER_ID) });
    if (!existing) {
      await db.insert(usersTable).values({ id: GUEST_USER_ID, email: "guest@localhost", firstName: "Guest" });
      logger.info("Guest user created");
    }
  } catch (err) {
    logger.warn({ err }, "Could not ensure guest user");
  }
}

async function seedExampleScenes() {
  try {
    const existing = await db.select().from(scenesTable)
      .where(eq(scenesTable.userId, GUEST_USER_ID)).limit(1);
    if (existing.length > 0) return;

    const id1 = crypto.randomUUID(), id2 = crypto.randomUUID(),
          id3 = crypto.randomUUID(), id4 = crypto.randomUUID();

    const seeds = [
      {
        id: id1, name: "Ocean Dawn", slug: "ocean-dawn",
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
        id: id2, name: "Forest Meditation", slug: "forest-meditation",
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
        id: id3, name: "Cosmic Clarity", slug: "cosmic-clarity",
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
        id: id4, name: "Golden Hour", slug: "golden-hour",
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

    await Promise.all(seeds.map((s) =>
      db.insert(scenesTable).values({
        ...s, userId: GUEST_USER_ID,
        animations: JSON.stringify([]),
        canvasWidth: 1440, canvasHeight: 900,
        status: "published",
      })
    ));
    logger.info({ count: seeds.length }, "Example scenes seeded");
  } catch (err) {
    logger.warn({ err }, "Could not seed example scenes");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

ensureGuestUser()
  .then(() => seedExampleScenes())
  .then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
