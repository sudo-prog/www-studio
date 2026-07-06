// ── AI Browser Tool ──────────────────────────────────────────────────────────
// Allows the AI to browse URLs, extract page elements, and import them into the
// freeform canvas. Uses the api-server's /api/browser/* endpoints which wrap
// the `agent-browser` CLI.

const API_BASE = import.meta.env.VITE_API_SERVER_URL || "";

export interface BrowserElement {
  ref: string | null;
  type: string;
  text: string;
  level: number | null;
  raw: string;
}

export interface BrowserExtractResult {
  success: boolean;
  url: string;
  title: string;
  elements: BrowserElement[];
  html: string;
  screenshot: string | null;
  error?: string;
}

// ── Extract all page elements from a URL ───────────────────────────────────
export async function extractPage(url: string): Promise<BrowserExtractResult> {
  if (!API_BASE) {
    return {
      success: false,
      url,
      title: "",
      elements: [],
      html: "",
      screenshot: null,
      error: "API server not configured. Set VITE_API_SERVER_URL.",
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/browser/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return {
        success: false,
        url,
        title: "",
        elements: [],
        html: "",
        screenshot: null,
        error: err.error || `HTTP ${res.status}`,
      };
    }

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      url,
      title: "",
      elements: [],
      html: "",
      screenshot: null,
      error: err.message || "Failed to extract page",
    };
  }
}

// ── Convert extracted page elements to freeform elements ───────────────────
export function pageElementsToFreeform(
  elements: BrowserElement[],
  html: string,
): string {
  // Build a structured representation that can be imported into the canvas
  const sections: string[] = [];

  // Add headings
  const headings = elements.filter((e) => e.type === "heading" && e.text);
  if (headings.length > 0) {
    sections.push("## Headings");
    headings.forEach((h) => {
      sections.push(`- [${h.ref || "?"}] ${"#".repeat(h.level || 1)} ${h.text}`);
    });
  }

  // Add links
  const links = elements.filter((e) => e.type === "link" && e.text);
  if (links.length > 0) {
    sections.push("## Links");
    links.forEach((l) => {
      sections.push(`- [${l.ref || "?"}] ${l.text}`);
    });
  }

  // Add text content
  const texts = elements.filter((e) => e.type === "paragraph" && e.text);
  if (texts.length > 0) {
    sections.push("## Text Content");
    texts.forEach((t) => {
      sections.push(`- ${t.text.slice(0, 200)}`);
    });
  }

  // Add buttons
  const buttons = elements.filter((e) => e.type === "button" && e.text);
  if (buttons.length > 0) {
    sections.push("## Buttons");
    buttons.forEach((b) => {
      sections.push(`- [${b.ref || "?"}] ${b.text}`);
    });
  }

  // Add raw HTML if available
  if (html) {
    sections.push("## Raw HTML");
    sections.push("```html");
    sections.push(html.slice(0, 3000)); // Limit to 3000 chars
    sections.push("```");
  }

  return sections.join("\n\n");
}

// ── Browser tool definition for AI chat ────────────────────────────────────
export const BROWSER_TOOL_DEFINITION = {
  type: "function" as const,
  function: {
    name: "browse_url",
    description: "Open a URL in a headless browser, extract all page elements (headings, links, text, buttons), take a screenshot, and return structured data. Use this to import website content into the canvas.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to browse and extract",
        },
      },
      required: ["url"],
    },
  },
};

// ── Browser tool prompt for AI system message ──────────────────────────────
export const BROWSER_TOOL_PROMPT = `
## Browser Tool
You have access to a headless browser via the \`browse_url\` tool.
- Use it to visit websites, extract page structure, and import content
- The tool returns: page title, structured elements (headings, links, text, buttons), raw HTML, and a screenshot
- You can use this to help users import website designs, clone pages, or extract content
- When a user asks you to "import a URL" or "clone a website", use this tool
- After extracting, describe what you found and offer to add the elements to the canvas`;
