import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const PRESET_THEMES = [
  { id: "default-dark", name: "Midnight", description: "Deep black with electric blue accents", preview: "#0f0f0f" },
  { id: "cyberpunk", name: "Cyberpunk", description: "Neon pink and cyan on black", preview: "#0d0d1a" },
  { id: "apple-vision", name: "Apple Vision", description: "Frosted glass and spatial depth", preview: "#1c1c1e" },
  { id: "brutalist", name: "Brutalist", description: "Raw black and white with bold typography", preview: "#000000" },
  { id: "glassmorphism", name: "Glassmorphism", description: "Frosted panels with gradient backgrounds", preview: "#6366f1" },
  { id: "aurora", name: "Aurora", description: "Gradient purples and greens, ethereal glow", preview: "#1a0a2e" },
  { id: "minimal-light", name: "Minimal Light", description: "Clean white with gray neutrals", preview: "#ffffff" },
  { id: "warm-sand", name: "Warm Sand", description: "Earthy tones with warm amber accents", preview: "#faf5eb" },
  { id: "ocean-deep", name: "Ocean Deep", description: "Teal and navy depth with wave-like motion", preview: "#0a2a4a" },
  { id: "forest", name: "Forest", description: "Deep greens and earthy browns", preview: "#1a2e1a" },
  { id: "linear", name: "Linear", description: "Precise indigo on near-black, like the tool", preview: "#090909" },
  { id: "vercel", name: "Vercel", description: "Sharp contrast black and white", preview: "#000000" },
];

const THEME_TOKENS: Record<string, Record<string, string>> = {
  cyberpunk: {
    "--background": "240 10% 4%",
    "--foreground": "0 0% 98%",
    "--primary": "300 90% 60%",
    "--accent": "180 100% 50%",
    "--border": "240 10% 15%",
    "--card": "240 10% 7%",
  },
  glassmorphism: {
    "--background": "240 30% 15%",
    "--foreground": "0 0% 98%",
    "--primary": "245 85% 65%",
    "--accent": "200 90% 65%",
    "--border": "240 30% 25%",
    "--card": "240 30% 18%",
  },
  "minimal-light": {
    "--background": "0 0% 100%",
    "--foreground": "0 0% 9%",
    "--primary": "220 90% 50%",
    "--accent": "220 90% 45%",
    "--border": "0 0% 90%",
    "--card": "0 0% 98%",
  },
  brutalist: {
    "--background": "0 0% 0%",
    "--foreground": "0 0% 100%",
    "--primary": "0 100% 50%",
    "--accent": "60 100% 50%",
    "--border": "0 0% 100%",
    "--card": "0 0% 5%",
  },
};

router.get("/themes", (req: Request, res: Response) => {
  res.json(PRESET_THEMES);
});

router.post("/variants", async (req: Request, res: Response) => {
  const { componentCode, count = 5, style } = req.body;

  if (!componentCode) {
    res.status(400).json({ error: "componentCode is required" });
    return;
  }

  const variantStyles = [
    { label: "Glassmorphism", desc: "Frosted glass effect with backdrop blur" },
    { label: "Brutalist", desc: "Bold borders, high contrast, raw typography" },
    { label: "Minimal", desc: "Clean whitespace, no decorations, pure content" },
    { label: "Gradient", desc: "Vibrant color gradients and mesh backgrounds" },
    { label: "Dark Premium", desc: "Deep dark background with glowing accents" },
    { label: "Neumorphic", desc: "Soft shadows creating raised/sunken feel" },
    { label: "Outlined", desc: "Stroke-based design without fills" },
  ];

  const variants = variantStyles.slice(0, Math.min(count, variantStyles.length)).map((v, i) => ({
    id: `variant-${i + 1}`,
    label: v.label,
    description: v.desc,
    code: componentCode
      .replace(/className="([^"]*)"/g, `className="$1 /* ${v.label} variant */"`)
      .replace(/\/\* WWW Studio variant \*\//g, "")
  }));

  res.json({ variants });
});

router.post("/theme", async (req: Request, res: Response) => {
  const { projectId, themePreset, themePrompt } = req.body;

  if (!projectId) {
    res.status(400).json({ error: "projectId is required" });
    return;
  }

  let presetName = themePreset || "default-dark";

  if (themePrompt) {
    const prompt = themePrompt.toLowerCase();
    if (prompt.includes("cyber") || prompt.includes("neon")) presetName = "cyberpunk";
    else if (prompt.includes("glass") || prompt.includes("frosted")) presetName = "glassmorphism";
    else if (prompt.includes("brutal") || prompt.includes("raw")) presetName = "brutalist";
    else if (prompt.includes("light") || prompt.includes("white") || prompt.includes("clean")) presetName = "minimal-light";
    else if (prompt.includes("apple") || prompt.includes("vision")) presetName = "apple-vision";
  }

  const tokens = THEME_TOKENS[presetName] || THEME_TOKENS["minimal-light"];
  const cssVariables = tokens;
  const themeTokens = JSON.stringify(tokens);

  res.json({ themeTokens, presetName, cssVariables });
});

export default router;
