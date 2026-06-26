// ── Screenshot Service ─────────────────────────────────────────────────────
// Screenshot utility with ScreenshotOne API integration.
// Always returns a base64 PNG string — never throws.

const TRANSPARENT_1X1_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==";

/**
 * Take a screenshot of a URL.
 * Uses ScreenshotOne API if SCREENSHOTONE_KEY is set, otherwise returns a placeholder.
 */
export async function screenshotUrl(url: string): Promise<string> {
  const apiKey = process.env.SCREENSHOTONE_KEY;

  if (apiKey) {
    try {
      const params = new URLSearchParams({
        access_key: apiKey,
        url,
        response_type: "image",
      });
      const resp = await fetch(`https://api.screenshotone.com/take?${params.toString()}`);

      if (resp.ok) {
        const buf = Buffer.from(await resp.arrayBuffer());
        return buf.toString("base64");
      }

      console.warn(`[screenshot] ScreenshotOne returned ${resp.status}, falling back to placeholder`);
    } catch (err) {
      console.warn(`[screenshot] ScreenshotOne error: ${(err as Error).message}, falling back to placeholder`);
    }
  } else {
    console.warn("[screenshot] SCREENSHOTONE_KEY not set — returning 1x1 transparent placeholder");
  }

  return TRANSPARENT_1X1_PNG_B64;
}

/**
 * Take screenshots at desktop (1440px), mobile (390px), and tablet (768px) viewports.
 * Uses ScreenshotOne API if SCREENSHOTONE_KEY is set, otherwise returns placeholders.
 */
export async function screenshotUrlWithViewports(url: string): Promise<{
  desktop: string;
  mobile: string;
  tablet: string;
}> {
  const apiKey = process.env.SCREENSHOTONE_KEY;

  if (!apiKey) {
    console.warn("[screenshot] SCREENSHOTONE_KEY not set — returning 1x1 transparent placeholders for all viewports");
    return {
      desktop: TRANSPARENT_1X1_PNG_B64,
      mobile: TRANSPARENT_1X1_PNG_B64,
      tablet: TRANSPARENT_1X1_PNG_B64,
    };
  }

  const takeScreenshot = async (viewportWidth: number): Promise<string> => {
    try {
      const params = new URLSearchParams({
        access_key: apiKey!,
        url,
        response_type: "image",
        viewport_width: String(viewportWidth),
      });
      const resp = await fetch(`https://api.screenshotone.com/take?${params.toString()}`);

      if (resp.ok) {
        const buf = Buffer.from(await resp.arrayBuffer());
        return buf.toString("base64");
      }

      console.warn(`[screenshot] ScreenshotOne returned ${resp.status} for viewport ${viewportWidth}`);
      return TRANSPARENT_1X1_PNG_B64;
    } catch (err) {
      console.warn(`[screenshot] ScreenshotOne error for viewport ${viewportWidth}: ${(err as Error).message}`);
      return TRANSPARENT_1X1_PNG_B64;
    }
  };

  const [desktop, mobile, tablet] = await Promise.all([
    takeScreenshot(1440),
    takeScreenshot(390),
    takeScreenshot(768),
  ]);

  return { desktop, mobile, tablet };
}
