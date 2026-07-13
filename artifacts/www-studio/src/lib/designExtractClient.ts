// ─── designExtractClient.ts ──────────────────────────────────────────────────
// Static frontend fallback client for GitHub Pages mode (no API server)
// Calls Gemini via Web2API proxy (no API key needed).

const RESULTS_KEY = "www-studio-design-extract-results";

// Primary AI endpoint: local gemini-web2api tunnel (OpenAI-compatible, free)
const PRIMARY_PROXY = "https://dressed-integer-strain-powerpoint.trycloudflare.com/v1/chat/completions";
const PRIMARY_MODEL = "gemini-3.5-flash";

// ─── Provider fallback chain ────────────────────────────────────────────────
async function callAiProvider(
  url: string,
  model: string,
  messages: { role: string; content: any }[],
  options: { max_tokens?: number; temperature?: number; authToken?: string } = {},
): Promise<string> {
  const { max_tokens = 4096, temperature = 0.7, authToken } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers,
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ model, messages, max_tokens, temperature, stream: false }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export interface Reference {
  id: string;
  type: "url" | "image";
  value: string;
  annotation: string;
  thumbnail?: string;
}

export interface TokenData {
  colors: Record<string, string>;
  typography: {
    display: { family: string; weights: number[] };
    body: { family: string; weights: number[] };
    mono: { family: string; weights: number[] };
  };
  spacing: Record<string, number>;
  radius: Record<string, number>;
  shadows: Record<string, string>;
}

export interface ExtractionResult {
  id: string;
  url: string;
  status: "complete" | "error";
  tokens: TokenData;
  markdown: string;
  createdAt: string;
  error?: string;
}

export function saveResult(result: ExtractionResult): void {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    const results: ExtractionResult[] = raw ? JSON.parse(raw) : [];
    const idx = results.findIndex((r) => r.id === result.id);
    if (idx >= 0) {
      results[idx] = result;
    } else {
      results.unshift(result);
    }
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 50)));
  } catch {
    // storage full or unavailable
  }
}

export function getResult(id: string): ExtractionResult | null {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    const results: ExtractionResult[] = JSON.parse(raw);
    return results.find((r) => r.id === id) ?? null;
  } catch {
    return null;
  }
}

export function listResults(): ExtractionResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callGeminiVision(
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<string> {
  const content: any[] = [{ type: "text", text: prompt }];

  if (imageBase64 && mimeType) {
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    content.push({
      type: "image_url",
      image_url: { url: dataUrl },
    });
  }

  // Primary AI endpoint (OpenAI-compatible, free)
  try {
    return await callAiProvider(
      PRIMARY_PROXY,
      PRIMARY_MODEL,
      [{ role: "user", content }],
      { max_tokens: 4096, temperature: 0.7 }
    );
  } catch {
    // Endpoint failed (e.g. rate limit 429) — return empty result
    return "";
  }
}

const DESIGN_ANALYSIS_PROMPT = `You are a design intelligence system. Analyze the provided image(s) and extract a comprehensive design system.

Return a JSON object with this exact structure:
{
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex", "textMuted": "#hex", "border": "#hex", "success": "#hex" },
  "typography": {
    "display": { "family": "Font Name", "weights": [400, 600, 700] },
    "body": { "family": "Font Name", "weights": [400, 500] },
    "mono": { "family": "monospace", "weights": [400] }
  },
  "spacing": { "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32, "2xl": 48, "3xl": 64, "4xl": 96 },
  "radius": { "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999 },
  "shadows": { "sm": "0 1px 2px rgba(0,0,0,0.05)", "md": "0 4px 6px rgba(0,0,0,0.1)", "lg": "0 10px 15px rgba(0,0,0,0.1)", "xl": "0 20px 25px rgba(0,0,0,0.15)", "2xl": "0 25px 50px rgba(0,0,0,0.25)" }
}

If annotations are provided, adjust the extracted values based on the user's intent:
- "Love this font" → add font to typography
- "Use this colour" → emphasize that color
- "This vibe" → adjust overall color mood
- "Mobile layout" → focus on responsive-friendly spacing

Return ONLY valid JSON, no markdown fences or extra text.`;

function buildPrompt(references: Reference[]): string {
  const annotations = references
    .filter((r) => r.annotation)
    .map((r) => `- Reference: ${r.annotation}`)
    .join("\n");

  let prompt = DESIGN_ANALYSIS_PROMPT;
  if (annotations) {
    prompt += "\n\nUser annotations on references:\n" + annotations;
  }
  return prompt;
}

function safeParseTokens(json: string): TokenData {
  try {
    const parsed = JSON.parse(json);
    // Ensure all required keys exist with defaults
    return {
      colors: parsed.colors || {},
      typography: {
        display: parsed.typography?.display || { family: "", weights: [400] },
        body: parsed.typography?.body || { family: "", weights: [400] },
        mono: parsed.typography?.mono || { family: "monospace", weights: [400] },
      },
      spacing: parsed.spacing || { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48, "3xl": 64, "4xl": 96 },
      radius: parsed.radius || { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
      shadows: parsed.shadows || { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.15)", "2xl": "0 25px 50px rgba(0,0,0,0.25)" },
    };
  } catch {
    return {
      colors: {},
      typography: { display: { family: "", weights: [400] }, body: { family: "", weights: [400] }, mono: { family: "monospace", weights: [400] } },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48, "3xl": 64, "4xl": 96 },
      radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
      shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.15)", "2xl": "0 25px 50px rgba(0,0,0,0.25)" },
    };
  }
}

export async function extractDesignFromReferences(
  references: Reference[]
): Promise<ExtractionResult> {
  const id = crypto.randomUUID();
  const prompt = buildPrompt(references);

  // Use first image reference as the primary image
  const imageRef = references.find((r) => r.thumbnail);

  let response: string;
  if (imageRef?.thumbnail) {
    // Convert data URL to base64 and call vision API
    const base64 = imageRef.thumbnail.split(",")[1];
    response = await callGeminiVision(prompt, base64, "image/png");
  } else {
    response = await callGeminiVision(prompt);
  }

  // Try to extract JSON from response (handle markdown fences)
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;

  const tokens = safeParseTokens(jsonStr);

  const result: ExtractionResult = {
    id,
    url: references.length > 0 ? references[0].value : "image-upload",
    status: "complete",
    tokens,
    markdown: `# Design System\n\nExtracted from image references.`,
    createdAt: new Date().toISOString(),
  };

  saveResult(result);
  return result;
}

export function isStaticMode(): boolean {
  // In static mode we don't have an api-server
  // Use VITE_API_SERVER_URL to determine if a backend is available
  return !import.meta.env.VITE_API_SERVER_URL;
}
