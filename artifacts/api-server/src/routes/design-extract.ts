// ── Design Extract Route ─────────────────────────────────────────────────
// API endpoints for design intelligence extraction pipeline.
// POST / — start extraction
// GET /:id — poll status + result
// PATCH /:id/tokens — save edits, regenerate outputs
// POST /:id/apply-to-project — apply tokens to project
// GET /:id/download/:format — download file
// GET / — list user's extractions

import { Router, type IRouter, type Request, type Response } from "express";
import { db, designExtractions, projectsTable, knowledgeChunksTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { visionComplete, LLM_VISION_MODEL } from "../lib/llm";
import { screenshotUrl, screenshotUrlWithViewports } from "../lib/screenshot";
import {
  parseAnnotationIntent,
  type ReferenceIntent,
} from "../lib/intentParser";
import {
  buildExtractionSystemPrompt,
  buildExtractionUserPrompt,
  buildDesignMdFromTokens,
  buildTailwindConfigFromTokens,
  buildTokensCssFromTokens,
  buildDesignTokensJsonFromTokens,
} from "../lib/designPrompts";

const router: IRouter = Router();

// ── Constants ──────────────────────────────────────────────────────────────
const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

function getOrGuestUserId(req: Request): string {
  return req.isAuthenticated() ? req.user.id : GUEST_USER_ID;
}

// ── Validation schemas ─────────────────────────────────────────────────────
const CreateExtractionBody = z.object({
  url: z.string().url().optional(),
  references: z
    .array(
      z.object({
        url: z.string().url().optional(),
        image: z.string().optional(), // base64
        annotation: z.string().optional(),
        mimeType: z.string().optional(),
      }),
    )
    .optional(),
  intent: z.string().optional(),
  projectId: z.string().optional(),
});

const UpdateTokensBody = z.object({
  tokens: z.record(z.unknown()),
});

// ── Background pipeline ───────────────────────────────────────────────────
interface ExtractionJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  tokens?: Record<string, unknown>;
  error?: string;
  startTime: number;
}

const jobs = new Map<string, ExtractionJob>();

async function runExtraction(extractionId: string, req: Request): Promise<void> {
  const job = jobs.get(extractionId);
  if (!job) return;

  job.status = "processing";
  const startTime = Date.now();

  try {
    // 1. Load extraction record
    const [extraction] = await db
      .select()
      .from(designExtractions)
      .where(eq(designExtractions.id, extractionId));

    if (!extraction) {
      throw new Error("Extraction not found");
    }

    // 2. Determine references
    const refs = (extraction.references as Array<Record<string, unknown>>) ?? [];
    const screenshots: { base64: string; mimeType: string; label: string }[] = [];
    let primaryUrl = extraction.primaryUrl;

    // Process references
    for (const ref of refs) {
      if (typeof ref.image === "string" && ref.image.length > 100) {
        // Direct base64 image
        screenshots.push({
          base64: ref.image,
          mimeType: (ref.mimeType as string) || "image/png",
          label: (ref.annotation as string) || "Reference screenshot",
        });
      } else if (typeof ref.url === "string") {
        // Screenshot the URL
        const base64 = await screenshotUrl(ref.url);
        screenshots.push({
          base64,
          mimeType: "image/png",
          label: (ref.annotation as string) || ref.url,
        });
        if (!primaryUrl) primaryUrl = ref.url;
      }
    }

    // If no references, try the primary URL directly
    if (screenshots.length === 0 && primaryUrl) {
      const viewportShots = await screenshotUrlWithViewports(primaryUrl);
      screenshots.push(
        { base64: viewportShots.desktop, mimeType: "image/png", label: "Desktop" },
        { base64: viewportShots.mobile, mimeType: "image/png", label: "Mobile" },
        { base64: viewportShots.tablet, mimeType: "image/png", label: "Tablet" },
      );
    }

    // 3. Parse annotations for intent
    const parsedIntent = parseAnnotationIntent(
      refs.length > 0
        ? (refs.find((r) => r.annotation)?.annotation as string) || ""
        : "",
    );

    // 4. Build prompts
    const systemPrompt = buildExtractionSystemPrompt();
    const userPrompt = buildExtractionUserPrompt({
      screenshots,
      intent: parsedIntent.intent as ReferenceIntent,
      weight: parsedIntent.weight,
      sections: parsedIntent.sections,
      directive: parsedIntent.directive,
      url: primaryUrl,
    });

    // 5. Call vision LLM
    // Use the desktop or first screenshot for extraction
    const primaryShot = screenshots[0];
    if (!primaryShot) {
      throw new Error("No screenshots available for extraction");
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      userPrompt,
    ];

    const raw = await visionComplete(
      primaryShot.base64,
      primaryShot.mimeType,
      messages.map((m) =>
        m.role === "system"
          ? m.content
          : Array.isArray(m.content)
            ? `${(m.content as Array<{ type: string; text?: string }>).filter((c) => c.type === "text").map((c) => c.text).join("\n\n")}`
            : (m.content as string),
      ),
      { model: LLM_VISION_MODEL },
    );

    // 6. Parse JSON from response
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("LLM response did not contain valid JSON");
    }

    let tokens: Record<string, unknown>;
    try {
      tokens = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse LLM response as JSON tokens");
    }

    // 7. Generate outputs
    const designMd = buildDesignMdFromTokens(tokens, primaryUrl || undefined);
    const tailwindConfig = buildTailwindConfigFromTokens(tokens);
    const tokensCss = buildTokensCssFromTokens(tokens);
    const designTokensJson = buildDesignTokensJsonFromTokens(tokens);

    // 8. Save to database
    const processingTime = Date.now() - startTime;

    await db
      .update(designExtractions)
      .set({
        status: "completed",
        processingTimeMs: processingTime,
        extractedTokens: tokens,
        outputDesignMd: designMd,
        outputTailwindConfig: tailwindConfig,
        outputTokensCss: tokensCss,
        outputDesignTokensJson: designTokensJson,
        updatedAt: new Date(),
      })
      .where(eq(designExtractions.id, extractionId));

    // Auto-ingest into RAG knowledge base
    try {
      const mdContent = designMd;
      const sections = mdContent.split(/^## /m).filter(Boolean);
      for (const section of sections) {
        const title = section.split('\n')[0].trim();
        await db.insert(knowledgeChunksTable).values({
          projectId: extraction.projectId,
          source: 'design_extraction',
          sourceId: extractionId,
          section: title,
          content: section.trim(),
          metadata: {
            primaryUrl: extraction.primaryUrl,
            extractionId,
          },
        });
      }
      await db.update(designExtractions).set({ savedToKb: true }).where(eq(designExtractions.id, extractionId));
    } catch (ingestErr) {
      console.error('[design-extract] RAG ingestion failed:', ingestErr);
      // Non-fatal — extraction still succeeded
    }

    job.status = "completed";
    job.tokens = tokens;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    job.status = "failed";
    job.error = errorMsg;

    await db
      .update(designExtractions)
      .set({
        status: "failed",
        error: errorMsg,
        processingTimeMs: Date.now() - startTime,
        updatedAt: new Date(),
      })
      .where(eq(designExtractions.id, extractionId));
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

// POST / — start extraction
router.post("/", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);
  const body = CreateExtractionBody.safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { url, references, intent, projectId } = body.data;

  // If URL is provided, use it as primary URL. Otherwise, check references.
  const primaryUrl =
    url ||
    (references && references.length > 0 ? (references[0].url as string) : "");

  if (!primaryUrl && (!references || references.length === 0)) {
    res.status(400).json({ error: "url or references are required" });
    return;
  }

  const extractionId = crypto.randomUUID();

  // Create record in database
  await db.insert(designExtractions).values({
    id: extractionId,
    userId,
    projectId: projectId ? projectId : null,
    primaryUrl: primaryUrl || "unknown",
    references: references || [],
    status: "processing",
  });

  // Create job entry for status tracking
  jobs.set(extractionId, {
    id: extractionId,
    status: "pending",
    startTime: Date.now(),
  });

  // Fire-and-forget pipeline (run async)
  runExtraction(extractionId, req).catch((err) => {
    console.error(`[design-extract] Pipeline error for ${extractionId}:`, err);
  });

  res.status(202).json({ id: extractionId, status: "processing" });
});

// GET / — list user's extractions
router.get("/", async (req: Request, res: Response) => {
  const userId = getOrGuestUserId(req);

  const rows = await db
    .select({
      id: designExtractions.id,
      userId: designExtractions.userId,
      primaryUrl: designExtractions.primaryUrl,
      status: designExtractions.status,
      processingTimeMs: designExtractions.processingTimeMs,
      createdAt: designExtractions.createdAt,
      updatedAt: designExtractions.updatedAt,
    })
    .from(designExtractions)
    .where(eq(designExtractions.userId, userId))
    .orderBy(desc(designExtractions.createdAt))
    .limit(50);

  res.json(rows);
});

// GET /:id — poll status + result
router.get("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = getOrGuestUserId(req);

  const [extraction] = await db
    .select()
    .from(designExtractions)
    .where(and(eq(designExtractions.id, id), eq(designExtractions.userId, userId)));

  if (!extraction) {
    res.status(404).json({ error: "Extraction not found" });
    return;
  }

  const result: Record<string, unknown> = {
    id: extraction.id,
    status: extraction.status,
    primaryUrl: extraction.primaryUrl,
    processingTimeMs: extraction.processingTimeMs,
    createdAt: extraction.createdAt,
    updatedAt: extraction.updatedAt,
  };

  if (extraction.status === "completed") {
    result.tokens = extraction.extractedTokens;
    result.outputDesignMd = extraction.outputDesignMd;
    result.outputTailwindConfig = extraction.outputTailwindConfig;
    result.outputTokensCss = extraction.outputTokensCss;
    result.outputDesignTokensJson = extraction.outputDesignTokensJson;
  } else if (extraction.status === "failed") {
    result.error = extraction.error;
  }

  res.json(result);
});

// PATCH /:id/tokens — save edits, regenerate outputs
router.patch("/:id/tokens", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = getOrGuestUserId(req);

  const body = UpdateTokensBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [extraction] = await db
    .select()
    .from(designExtractions)
    .where(and(eq(designExtractions.id, id), eq(designExtractions.userId, userId)));

  if (!extraction) {
    res.status(404).json({ error: "Extraction not found" });
    return;
  }

  const tokens = body.data.tokens as Record<string, unknown>;

  // Save current tokens to history before updating
  let existingHistory: Array<{ tokens: Record<string, unknown>; timestamp: string }> = [];
  try {
    existingHistory = JSON.parse((extraction.tokenHistory as unknown as string) ?? "[]") || [];
  } catch {
    existingHistory = [];
  }
  existingHistory.push({ tokens: (extraction.extractedTokens as Record<string, unknown>) ?? {}, timestamp: new Date().toISOString() });
  if (existingHistory.length > 20) existingHistory = existingHistory.slice(-20); // Cap at 20

  // Regenerate outputs from updated tokens
  const designMd = buildDesignMdFromTokens(tokens, extraction.primaryUrl || undefined);
  const tailwindConfig = buildTailwindConfigFromTokens(tokens);
  const tokensCss = buildTokensCssFromTokens(tokens);
  const designTokensJson = buildDesignTokensJsonFromTokens(tokens);

  await db
    .update(designExtractions)
    .set({
      extractedTokens: tokens,
      outputDesignMd: designMd,
      outputTailwindConfig: tailwindConfig,
      outputTokensCss: tokensCss,
      outputDesignTokensJson: designTokensJson,
      tokenHistory: existingHistory,
      updatedAt: new Date(),
    })
    .where(eq(designExtractions.id, id));

  res.json({
    id,
    tokens,
    outputDesignMd: designMd,
    outputTailwindConfig: tailwindConfig,
    outputTokensCss: tokensCss,
    outputDesignTokensJson: designTokensJson,
  });
});

// POST /:id/apply-to-project — apply tokens to project
router.post("/:id/apply-to-project", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = getOrGuestUserId(req);
  const { projectId } = req.body as { projectId?: string };

  if (!projectId) {
    res.status(400).json({ error: "projectId is required" });
    return;
  }

  const [extraction] = await db
    .select()
    .from(designExtractions)
    .where(and(eq(designExtractions.id, id), eq(designExtractions.userId, userId)));

  if (!extraction) {
    res.status(404).json({ error: "Extraction not found" });
    return;
  }

  if (extraction.status !== "completed") {
    res.status(400).json({ error: "Extraction is not completed yet" });
    return;
  }

  // Verify project belongs to user
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId),
      ),
    );

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  // Merge extracted tokens into project themeTokens
  const tokens = (extraction.extractedTokens as Record<string, unknown>) ?? {};
  const colors = (tokens.colors as Record<string, string>) ?? {};
  const typography = (tokens.typography as Record<string, unknown>) ?? {};
  const fontFamily = (typography.fontFamily as Record<string, string>) ?? {};
  const radius = (tokens.radius as Record<string, string>) ?? {};

  let existingTokens: Record<string, unknown> = {};
  try {
    existingTokens = project.themeTokens
      ? JSON.parse(project.themeTokens as string)
      : {};
  } catch {
    // ignore parse errors
  }

  const merged = {
    ...existingTokens,
    background: colors.background ?? existingTokens.background,
    foreground: colors.foreground ?? existingTokens.foreground,
    primary: colors.primary ?? existingTokens.primary,
    secondary: colors.secondary ?? existingTokens.secondary,
    muted: colors.muted ?? existingTokens.muted,
    accent: colors.accent ?? existingTokens.accent,
    border: colors.border ?? existingTokens.border,
    fontFamily: fontFamily.body ?? existingTokens.fontFamily,
    baseFontSize: (typography.fontSize as Record<string, string>)?.base ?? existingTokens.baseFontSize,
    borderRadius: radius.md ?? existingTokens.borderRadius,
    designTokens: tokens, // store full tokens for reference
  };

  const newTokens = JSON.stringify(merged);

  await db
    .update(projectsTable)
    .set({
      themeTokens: newTokens,
      activeDesignExtractionId: id,
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.id, projectId));

  // Mark extraction as saved to KB
  await db
    .update(designExtractions)
    .set({ savedToKb: true })
    .where(eq(designExtractions.id, id));

  res.json({ success: true, projectId, themeTokens: merged });
});

// GET /:id/download/:format — download file
router.get("/:id/download/:format", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const format = String(req.params.format) as
    | "md"
    | "tailwind"
    | "css"
    | "json";
  const userId = getOrGuestUserId(req);

  const [extraction] = await db
    .select()
    .from(designExtractions)
    .where(and(eq(designExtractions.id, id), eq(designExtractions.userId, userId)));

  if (!extraction) {
    res.status(404).json({ error: "Extraction not found" });
    return;
  }

  if (extraction.status !== "completed") {
    res.status(400).json({ error: "Extraction is not completed yet" });
    return;
  }

  let content: string;
  let filename: string;
  let contentType: string;

  switch (format) {
    case "md":
      content = extraction.outputDesignMd ?? "";
      filename = `design-system-${id}.md`;
      contentType = "text/markdown; charset=utf-8";
      break;
    case "tailwind":
      content = extraction.outputTailwindConfig ?? "";
      filename = `tailwind.config-${id}.ts`;
      contentType = "text/typescript; charset=utf-8";
      break;
    case "css":
      content = extraction.outputTokensCss ?? "";
      filename = `tokens-${id}.css`;
      contentType = "text/css; charset=utf-8";
      break;
    case "json":
      content = extraction.outputDesignTokensJson ?? "";
      filename = `design-tokens-${id}.json`;
      contentType = "application/json; charset=utf-8";
      break;
    default:
      res.status(400).json({
        error: "Invalid format. Use: md, tailwind, css, json",
      });
      return;
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );
  res.send(content);
});

// POST /:id/undo — pop last token snapshot from history and restore
router.post("/:id/undo", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = getOrGuestUserId(req);

  const [extraction] = await db
    .select()
    .from(designExtractions)
    .where(and(eq(designExtractions.id, id), eq(designExtractions.userId, userId)));

  if (!extraction) {
    res.status(404).json({ error: "Extraction not found" });
    return;
  }

  if (extraction.status !== "completed") {
    res.status(400).json({ error: "Extraction is not completed yet" });
    return;
  }

  // Parse history array
  let history: Array<{ tokens: Record<string, unknown>; timestamp: string }> = [];
  try {
    history = JSON.parse((extraction.tokenHistory as unknown as string) ?? "[]") || [];
  } catch {
    history = [];
  }

  if (history.length === 0) {
    res.status(400).json({ error: "No history available to undo" });
    return;
  }

  // Pop last snapshot
  const lastSnapshot = history.pop()!;
  const restoredTokens = lastSnapshot.tokens;

  // Regenerate outputs from restored tokens
  const designMd = buildDesignMdFromTokens(restoredTokens, extraction.primaryUrl || undefined);
  const tailwindConfig = buildTailwindConfigFromTokens(restoredTokens);
  const tokensCss = buildTokensCssFromTokens(restoredTokens);
  const designTokensJson = buildDesignTokensJsonFromTokens(restoredTokens);

  await db
    .update(designExtractions)
    .set({
      extractedTokens: restoredTokens,
      outputDesignMd: designMd,
      outputTailwindConfig: tailwindConfig,
      outputTokensCss: tokensCss,
      outputDesignTokensJson: designTokensJson,
      tokenHistory: history,
      updatedAt: new Date(),
    })
    .where(eq(designExtractions.id, id));

  res.json({
    id,
    tokens: restoredTokens,
    outputDesignMd: designMd,
    outputTailwindConfig: tailwindConfig,
    outputTokensCss: tokensCss,
    outputDesignTokensJson: designTokensJson,
    historyLength: history.length,
  });
});

// GET /public/gallery — public gallery of saved extractions
router.get("/public/gallery", async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 50);
  const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);

  const rows = await db
    .select({
      id: designExtractions.id,
      primaryUrl: designExtractions.primaryUrl,
      extractedTokens: designExtractions.extractedTokens,
      createdAt: designExtractions.createdAt,
    })
    .from(designExtractions)
    .where(eq(designExtractions.savedToKb, true))
    .limit(limit)
    .offset(offset);

  const result = rows.map((row) => ({
    id: row.id,
    primaryUrl: row.primaryUrl,
    colors: (() => {
      try {
        const t = JSON.parse(row.extractedTokens as unknown as string);
        return (t?.colors as Record<string, string>) ?? {};
      } catch {
        return {};
      }
    })(),
    createdAt: row.createdAt,
  }));

  res.json(result);
});

export default router;
