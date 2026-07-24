import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('/home/thinkpad/orca/workspaces/www-studio/team-b-audit/artifacts/www-studio/dist/public');
const PORT = 4175;
const BASE = `http://localhost:${PORT}`;

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
        filePath = path.join(DIST, 'index.html');
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

const server = await startServer();
const browser = await chromium.launch();

// Debug scenes page overflow
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true, deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(BASE + '/#/scenes', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(3000);

const scenesDebug = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const overflowEls = [];
  const allEls = document.querySelectorAll('*');
  for (const el of allEls) {
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'absolute') continue;
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const overflowX = cs.overflowX;
    if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') continue;
    if (rect.right > vw + 2 && rect.width > 0) {
      overflowEls.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 100),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        text: (el.textContent || '').trim().slice(0, 60),
        parent: el.parentElement ? {
          tag: el.parentElement.tagName.toLowerCase(),
          cls: (el.parentElement.className || '').toString().slice(0, 100),
        } : null,
      });
    }
  }
  return overflowEls;
});

console.log('=== SCENES OVERFLOW ELEMENTS ===');
for (const el of scenesDebug) {
  console.log(JSON.stringify(el, null, 2));
}

// Debug home hover-hidden
const page2 = await ctx.newPage();
await page2.goto(BASE + '/#/', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page2.waitForTimeout(3000);

const homeDebug = await page2.evaluate(() => {
  const els = [...document.querySelectorAll('[class*="group-hover"]')];
  const hidden = [];
  for (const e of els) {
    const cs = getComputedStyle(e);
    const opacity = parseFloat(cs.opacity);
    if (opacity < 0.01) {
      const rect = e.getBoundingClientRect();
      hidden.push({
        cls: (e.className || '').toString().slice(0, 120),
        pointerEvents: cs.pointerEvents,
        opacity,
        rect: { w: Math.round(rect.width), h: Math.round(rect.height), top: Math.round(rect.top), left: Math.round(rect.left) },
        text: (e.textContent || '').trim().slice(0, 60),
        tag: e.tagName.toLowerCase(),
        parent: e.parentElement ? {
          tag: e.parentElement.tagName.toLowerCase(),
          cls: (e.parentElement.className || '').toString().slice(0, 120),
        } : null,
      });
    }
  }
  return hidden;
});

console.log('\n=== HOME HOVER-HIDDEN ELEMENTS ===');
for (const el of homeDebug) {
  console.log(JSON.stringify(el, null, 2));
}

await browser.close();
server.close();
