import { Router, type IRouter, type Request, type Response } from "express";
import { execSync, exec } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

const router: IRouter = Router();

// ── Agent Browser API ──────────────────────────────────────────────────────
// Wraps the `agent-browser` CLI for AI-powered browser automation.
// The CLI must be installed globally: `npm install -g agent-browser`

const AGENT_BROWSER = "agent-browser";
const SCREENSHOT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "agent-browser-"));

// The browser agent shells out to the `agent-browser` CLI. On serverless
// hosts (Vercel) that binary is not present, so detect it up-front and fail
// gracefully instead of throwing a raw 500 on every call.
function isAgentBrowserAvailable(): boolean {
  try {
    execSync("command -v agent-browser", { stdio: "ignore", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function runAgentBrowser(args: string[]): string {
  if (!isAgentBrowserAvailable()) {
    throw new Error("agent-browser unavailable: CLI not installed on this host (browser automation requires a backend with the agent-browser binary)");
  }
  try {
    const output = execSync(`${AGENT_BROWSER} ${args.join(" ")}`, {
      encoding: "utf-8",
      timeout: 30000,
    });
    return output;
  } catch (err: any) {
    throw new Error(`agent-browser error: ${err.stderr || err.message}`);
  }
}

// ── Open a URL in the browser ──────────────────────────────────────────────
router.post("/browser/open", async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) {
      res.status(400).json({ error: "url is required" });
      return;
    }

    const output = runAgentBrowser(["open", url]);
    res.json({ success: true, message: output.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get accessibility snapshot ─────────────────────────────────────────────
router.get("/browser/snapshot", async (req: Request, res: Response) => {
  try {
    const output = runAgentBrowser(["snapshot"]);
    // Parse the snapshot into structured data
    const lines = output.split("\n").filter((l) => l.trim());
    const elements = lines.map((line) => {
      const trimmed = line.trim();
      const refMatch = trimmed.match(/\[ref=([^\]]+)\]/);
      const levelMatch = trimmed.match(/\[level=(\d+)\]/);
      const isLink = trimmed.startsWith("- link");
      const isHeading = trimmed.startsWith("- heading");
      const isParagraph = trimmed.startsWith("- paragraph");
      const isButton = trimmed.startsWith("- button");

      let text = "";
      if (isHeading) text = trimmed.replace(/^- heading "([^"]+)".*/, "$1");
      else if (isLink) text = trimmed.replace(/^- link "([^"]+)".*/, "$1");
      else if (isButton) text = trimmed.replace(/^- button "([^"]+)".*/, "$1");
      else if (isParagraph) {
        const staticTextMatch = trimmed.match(/StaticText "([^"]+)"/);
        text = staticTextMatch ? staticTextMatch[1] : "";
      }

      return {
        ref: refMatch ? refMatch[1] : null,
        type: isHeading ? "heading" : isLink ? "link" : isParagraph ? "paragraph" : isButton ? "button" : "text",
        text,
        level: levelMatch ? parseInt(levelMatch[1]) : null,
        raw: trimmed,
      };
    });

    res.json({ success: true, elements, raw: output });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get HTML content of an element ─────────────────────────────────────────
router.post("/browser/html", async (req: Request, res: Response) => {
  try {
    const { selector } = req.body as { selector?: string };
    if (!selector) {
      res.status(400).json({ error: "selector is required" });
      return;
    }

    const output = runAgentBrowser(["get", "html", selector]);
    res.json({ success: true, html: output.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get text content of an element ─────────────────────────────────────────
router.post("/browser/text", async (req: Request, res: Response) => {
  try {
    const { ref } = req.body as { ref?: string };
    if (!ref) {
      res.status(400).json({ error: "ref is required" });
      return;
    }

    const output = runAgentBrowser(["get", "text", ref]);
    res.json({ success: true, text: output.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Take a screenshot ──────────────────────────────────────────────────────
router.get("/browser/screenshot", async (req: Request, res: Response) => {
  try {
    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    runAgentBrowser(["screenshot", filepath]);

    // Read the screenshot and return as base64
    const imageBuffer = fs.readFileSync(filepath);
    const base64 = imageBuffer.toString("base64");

    // Clean up
    fs.unlinkSync(filepath);

    res.json({
      success: true,
      screenshot: `data:image/png;base64,${base64}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Click an element by ref ────────────────────────────────────────────────
router.post("/browser/click", async (req: Request, res: Response) => {
  try {
    const { ref } = req.body as { ref?: string };
    if (!ref) {
      res.status(400).json({ error: "ref is required" });
      return;
    }

    const output = runAgentBrowser(["click", ref]);
    res.json({ success: true, message: output.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fill an input field ────────────────────────────────────────────────────
router.post("/browser/fill", async (req: Request, res: Response) => {
  try {
    const { ref, value } = req.body as { ref?: string; value?: string };
    if (!ref || value === undefined) {
      res.status(400).json({ error: "ref and value are required" });
      return;
    }

    const output = runAgentBrowser(["fill", ref, value]);
    res.json({ success: true, message: output.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Close the browser ──────────────────────────────────────────────────────
router.post("/browser/close", async (req: Request, res: Response) => {
  try {
    const output = runAgentBrowser(["close"]);
    res.json({ success: true, message: output.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Full page extraction: open + snapshot + html + screenshot + close ──────
router.post("/browser/extract", async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) {
      res.status(400).json({ error: "url is required" });
      return;
    }

    // 1. Open the URL
    runAgentBrowser(["open", url]);

    // 2. Get snapshot
    const snapshotOutput = runAgentBrowser(["snapshot"]);

    // 3. Get full page HTML
    let pageHtml = "";
    try {
      pageHtml = runAgentBrowser(["get", "html", "body"]);
    } catch {
      pageHtml = "";
    }

    // 4. Take screenshot
    const filename = `extract-${Date.now()}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    try {
      runAgentBrowser(["screenshot", filepath]);
    } catch {
      // Screenshot may fail, that's ok
    }

    // 5. Close browser
    try {
      runAgentBrowser(["close"]);
    } catch {
      // Already closed
    }

    // Read screenshot if it exists
    let screenshotBase64 = "";
    try {
      const imageBuffer = fs.readFileSync(filepath);
      screenshotBase64 = imageBuffer.toString("base64");
      fs.unlinkSync(filepath);
    } catch {
      // No screenshot
    }

    // Parse snapshot into structured elements
    const lines = snapshotOutput.split("\n").filter((l) => l.trim());
    const elements = lines.map((line) => {
      const trimmed = line.trim();
      const refMatch = trimmed.match(/\[ref=([^\]]+)\]/);
      const levelMatch = trimmed.match(/\[level=(\d+)\]/);
      const isLink = trimmed.startsWith("- link");
      const isHeading = trimmed.startsWith("- heading");
      const isParagraph = trimmed.startsWith("- paragraph");
      const isButton = trimmed.startsWith("- button");

      let text = "";
      if (isHeading) text = trimmed.replace(/^- heading "([^"]+)".*/, "$1");
      else if (isLink) text = trimmed.replace(/^- link "([^"]+)".*/, "$1");
      else if (isButton) text = trimmed.replace(/^- button "([^"]+)".*/, "$1");
      else if (isParagraph) {
        const staticTextMatch = trimmed.match(/StaticText "([^"]+)"/);
        text = staticTextMatch ? staticTextMatch[1] : "";
      }

      return {
        ref: refMatch ? refMatch[1] : null,
        type: isHeading ? "heading" : isLink ? "link" : isParagraph ? "paragraph" : isButton ? "button" : "text",
        text,
        level: levelMatch ? parseInt(levelMatch[1]) : null,
        raw: trimmed,
      };
    });

    res.json({
      success: true,
      url,
      title: snapshotOutput.split("\n")[0]?.replace(/^[✓\s]+/, "").trim() || "",
      elements,
      html: pageHtml,
      screenshot: screenshotBase64 ? `data:image/png;base64,${screenshotBase64}` : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;