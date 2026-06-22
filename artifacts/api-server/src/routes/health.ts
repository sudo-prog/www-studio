import { Router, type IRouter, type Request, type Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import {
  getLLMProvider,
  isLLMReachable,
  isGeminiWeb2APIReachable,
  LLM_BASE_URL,
  LLM_MODEL,
  GEMINI_WEB2API_BASE_URL,
  GEMINI_WEB2API_MODEL,
} from "../lib/llm";

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// GET /health — detailed health check including AI provider status
router.get("/health", async (_req: Request, res: Response) => {
  const primaryProvider = getLLMProvider();
  const [primaryReachable, geminiReachable] = await Promise.all([
    isLLMReachable(),
    isGeminiWeb2APIReachable(),
  ]);

  const providers: Record<string, { baseUrl: string; model: string; reachable: boolean }> = {
    primary: {
      baseUrl: LLM_BASE_URL,
      model: LLM_MODEL,
      reachable: primaryReachable,
    },
  };

  // Only include Gemini Web2API if it's different from the primary
  if (GEMINI_WEB2API_BASE_URL !== LLM_BASE_URL) {
    providers["gemini-web2api"] = {
      baseUrl: GEMINI_WEB2API_BASE_URL,
      model: GEMINI_WEB2API_MODEL,
      reachable: geminiReachable,
    };
  }

  res.json({
    status: "ok",
    primaryProvider,
    providers,
    availableProviders: Object.entries(providers)
      .filter(([, info]) => info.reachable)
      .map(([name]) => name),
  });
});

export default router;
