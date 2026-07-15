// Mobile touch-visibility smoke test (audit Claim 3 backstop).
// Verifies that hover-only (opacity-0 group-hover) action affordances are NOT
// permanently hidden at a phone viewport (390x844, touch). Per the fix, they must
// default to opacity-100 below the `md` breakpoint.
//
// Self-contained: starts a tiny SPA static server on BASE (default :4173) serving
// the built dist/public, runs the audit, then exits. Set SCREENSHOT_DIR to choose
// where PNGs land (CI uses a repo-relative dir so upload-artifact can grab them).
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist', 'public');
const PORT = Number(process.env.PORT || 4173);
const BASE = process.env.BASE || `http://localhost:${PORT}`;
const OUT = process.env.SCREENSHOT_DIR || '/tmp/mobile-shots';
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(DIST, urlPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST, 'index.html'); // SPA fallback
      }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const routes = [
  { name: 'home', path: '/' },
  { name: 'components', path: '/ui-library' },
  { name: 'scene-gallery', path: '/scenes/gallery' },
];

const server = await startServer();
const browser = await chromium.launch();
const results = [];

for (const r of routes) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  try {
    await page.goto(BASE + r.path, { waitUntil: 'networkidle', timeout: 25000 });
  } catch (e) {
    errors.push('GOTO: ' + e.message);
  }
  await page.waitForTimeout(2000);

  const audit = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[class*="group-hover"]')];
    const hidden = [];
    for (const e of els) {
      const cs = getComputedStyle(e);
      const opacity = parseFloat(cs.opacity);
      if (opacity < 0.01) {
        hidden.push({
          cls: (e.className || '').toString().slice(0, 90),
          pointerEventsNone: cs.pointerEvents === 'none',
          opacity,
        });
      }
    }
    return { total: els.length, hiddenAtTouch: hidden };
  });

  await page.screenshot({ path: path.join(OUT, `${r.name}.png`), fullPage: true });
  results.push({ route: r.path, consoleErrors: errors.slice(0, 5), audit });
  await ctx.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(results, null, 2));

// Fail the run if any primary action is hidden at touch (pointer-events not none).
const blockers = results.flatMap((r) => r.audit.hiddenAtTouch.filter((h) => !h.pointerEventsNone));
if (blockers.length > 0) {
  console.error(`\nFAILED: ${blockers.length} touch-invisible primary action(s) found.`);
  process.exit(1);
}
console.log('\nPASS: no touch-invisible primary actions.');
