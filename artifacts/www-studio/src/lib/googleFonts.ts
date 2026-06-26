// ─── googleFonts.ts ──────────────────────────────────────────────────────────
// Google Fonts integration — search, cache, and dynamic injection

const FONT_CACHE_KEY = "www-studio:google-fonts";
const FONT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface FontEntry {
  family: string;
  category: "display" | "serif" | "sans-serif" | "monospace" | "handwriting";
  variants: number[];
}

// Pre-seeded popular fonts (no API call needed)
const POPULAR_FONTS: FontEntry[] = [
  // Display
  { family: "Inter", category: "sans-serif", variants: [400, 500, 600, 700] },
  { family: "Plus Jakarta Sans", category: "sans-serif", variants: [400, 500, 600, 700, 800] },
  { family: "DM Sans", category: "sans-serif", variants: [400, 500, 700] },
  { family: "Syne", category: "sans-serif", variants: [400, 500, 600, 700, 800] },
  { family: "Cabinet Grotesk", category: "sans-serif", variants: [400, 500, 600, 700, 800] },
  { family: "Satoshi", category: "sans-serif", variants: [400, 500, 700, 900] },
  // Body
  { family: "Nunito", category: "sans-serif", variants: [400, 500, 600, 700] },
  { family: "Lato", category: "sans-serif", variants: [400, 700] },
  { family: "Source Serif 4", category: "serif", variants: [400, 500, 600, 700] },
  // Mono
  { family: "JetBrains Mono", category: "monospace", variants: [400, 500, 600, 700] },
  { family: "Fira Code", category: "monospace", variants: [400, 500, 600, 700] },
  { family: "IBM Plex Mono", category: "monospace", variants: [400, 500, 600, 700] },
];

interface CacheEntry {
  fonts: FontEntry[];
  timestamp: number;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(FONT_CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > FONT_CACHE_TTL) return null;
    return entry;
  } catch {
    return null;
  }
}

function setCache(fonts: FontEntry[]): void {
  try {
    const entry: CacheEntry = { fonts, timestamp: Date.now() };
    localStorage.setItem(FONT_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Font Search ──────────────────────────────────────────────────────────────

export async function searchFonts(query?: string): Promise<FontEntry[]> {
  // Start with popular fonts
  let fonts = [...POPULAR_FONTS];

  // Try to fetch full list from Google Fonts API (via a CORS-friendly approach)
  const cached = getCache();
  if (cached && cached.fonts.length > POPULAR_FONTS.length) {
    fonts = cached.fonts;
  } else if (!cached) {
    // Attempt to fetch from Google Fonts API using the CSS API endpoint
    // This is a best-effort fetch; if it fails, we fall back to popular fonts
    try {
      const response = await fetch(
        "https://fonts.googleapis.com/css2?family=*&display=swap",
        { mode: "cors" }
      );
      if (response.ok) {
        // We can't easily parse the CSS API for a font list, so we use
        // a secondary approach: fetch the Google Fonts developer API
        const devResponse = await fetch(
          "https://www.googleapis.com/webfonts/v1/webfonts?key=none&sort=popularity",
          { mode: "cors" }
        );
        if (devResponse.ok) {
          const data = await devResponse.json();
          if (data.items) {
            fonts = data.items.map((item: any) => ({
              family: item.family,
              category: item.category || "sans-serif",
              variants: item.variants?.filter((v: string) => !v.includes("italic")).map((v: string) => parseInt(v, 10) || 400).slice(0, 4) || [400],
            }));
            setCache(fonts);
          }
        }
      }
    } catch {
      // Silently fall back to popular fonts
    }
  }

  // Filter by query
  if (query) {
    const lower = query.toLowerCase();
    fonts = fonts.filter((f) => f.family.toLowerCase().includes(lower));
  }

  return fonts;
}

// ─── Font CSS URL ─────────────────────────────────────────────────────────────

export function getFontCssUrl(font: FontEntry | string, weights?: number[]): string {
  const family = typeof font === "string" ? font : font.family;
  const w = weights?.length ? weights : (typeof font === "string" ? [400, 700] : font.variants.slice(0, 2));
  const weightStr = w.join(";");
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightStr}&display=swap`;
}

// ─── Dynamic Font Injection ───────────────────────────────────────────────────

const INJECTED_LINKS = new Map<string, HTMLLinkElement>();

export function injectFont(font: FontEntry | string, weights?: number[]): void {
  const family = typeof font === "string" ? font : font.family;
  const url = getFontCssUrl(font, weights);
  const cacheKey = `${family}-${weights?.join(",") || "default"}`;

  if (INJECTED_LINKS.has(cacheKey)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.setAttribute("data-www-studio-font", family);
  document.head.appendChild(link);
  INJECTED_LINKS.set(cacheKey, link);
}

export function removeFont(font: FontEntry | string, weights?: number[]): void {
  const family = typeof font === "string" ? font : font.family;
  const weightStr = weights?.join(",") || "default";
  const cacheKey = `${family}-${weightStr}`;

  const link = INJECTED_LINKS.get(cacheKey);
  if (link) {
    link.remove();
    INJECTED_LINKS.delete(cacheKey);
  }
}

export function removeAllInjectedFonts(): void {
  INJECTED_LINKS.forEach((link) => link.remove());
  INJECTED_LINKS.clear();
}

// ─── Font Preview Text ────────────────────────────────────────────────────────

export function getPreviewText(category: FontEntry["category"]): string {
  switch (category) {
    case "display":
      return "Aa Bb Cc 123";
    case "serif":
      return "The quick brown fox";
    case "monospace":
      return "const x = true;";
    case "handwriting":
      return "Hello World";
    default:
      return "The quick brown fox jumps over the lazy dog";
  }
}
