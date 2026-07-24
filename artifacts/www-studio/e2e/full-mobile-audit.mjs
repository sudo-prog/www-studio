import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve('/home/thinkpad/orca/workspaces/www-studio/team-b-audit/artifacts/www-studio/dist/public');
const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const OUT = '/tmp/mobile-audit-shots';
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

const routes = [
  { name: 'home', path: '/#/' },
  { name: 'components', path: '/#/ui-library' },
  { name: 'gallery', path: '/#/gallery' },
  { name: 'scenes', path: '/#/scenes' },
  { name: 'scene-gallery', path: '/#/scenes/gallery' },
  { name: 'profile', path: '/#/profile' },
  { name: 'dashboard', path: '/#/projects' },
  { name: 'design-extract', path: '/#/design-extract' },
];

const server = await startServer();
const browser = await chromium.launch();
const allResults = [];

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
    await page.goto(BASE + r.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (e) {
    errors.push('GOTO: ' + e.message);
  }
  await page.waitForTimeout(3000);

  const audit = await page.evaluate(() => {
    const results = {
      tapTargets: [],
      textOverflow: [],
      horizontalScroll: [],
      hoverOnlyActions: [],
      fixedWidths: [],
      issues: [],
    };

    // T-1: tap targets < 44px
    const interactives = document.querySelectorAll('button, a, input, [role="button"], [role="tab"], [role="menuitem"], select, textarea, [onclick], [data-state]');
    for (const el of interactives) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || '').trim().slice(0, 40);
        const role = el.getAttribute('role') || '';
        const hidden = rect.width === 0 || rect.height === 0 || getComputedStyle(el).display === 'none';
        if (!hidden) {
          results.tapTargets.push({
            tag, text, role,
            w: Math.round(rect.width), h: Math.round(rect.height),
            cls: (el.className || '').toString().slice(0, 80),
          });
        }
      }
    }

    // L-1: horizontal overflow — elements wider than viewport
    const vw = document.documentElement.clientWidth;
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // skip scrollable containers, hidden, fixed, absolute positioned off-viewport
      const overflowX = cs.overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') continue;
      if (cs.position === 'fixed' || cs.position === 'absolute') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (rect.right > vw + 2 && rect.width > 0) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className || '').toString().slice(0, 60);
        // exclude body/html
        if (tag !== 'body' && tag !== 'html' && tag !== 'head' && tag !== 'main' && tag !== 'div' || cls.includes('flex') || cls.includes('grid')) {
          results.horizontalScroll.push({
            tag, right: Math.round(rect.right), width: Math.round(rect.width), vw,
            cls: cls.slice(0, 60),
          });
        }
      }
    }

    // Hover-only actions
    const hoverEls = document.querySelectorAll('[class*="group-hover"]');
    for (const el of hoverEls) {
      const cs = getComputedStyle(el);
      const opacity = parseFloat(cs.opacity);
      if (opacity < 0.01) {
        results.hoverOnlyActions.push({
          cls: (el.className || '').toString().slice(0, 80),
          pointerEvents: cs.pointerEvents,
          opacity,
        });
      }
    }

    // Text overflow: check for elements with text-overflow: ellipsis that might be clipping
    const textEls = document.querySelectorAll('h1, h2, h3, h4, p, span, a, label, td, th');
    for (const el of textEls) {
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.overflow === 'hidden' && cs.textOverflow === 'ellipsis' && rect.right > vw + 2) {
        results.textOverflow.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 50),
          right: Math.round(rect.right), vw,
        });
      }
    }

    // Fixed widths wider than viewport
    const fixedEls = document.querySelectorAll('*');
    for (const el of fixedEls) {
      const cs = getComputedStyle(el);
      const width = parseInt(cs.width);
      if (cs.position === 'fixed' || cs.position === 'absolute') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (width > vw && cs.boxSizing !== 'border-box' || width > vw + 40) {
        const tag = el.tagName.toLowerCase();
        if (['table', 'pre', 'code', 'iframe', 'video', 'canvas'].includes(tag)) continue;
        results.fixedWidths.push({
          tag, width: Math.round(width), vw,
          cls: (el.className || '').toString().slice(0, 60),
        });
      }
    }

    return results;
  });

  await page.screenshot({ path: path.join(OUT, `${r.name}.png`), fullPage: true });
  allResults.push({ route: r.name, path: r.path, consoleErrors: errors, audit });
  await ctx.close();
}

await browser.close();
server.close();

// Summary
console.log('\n=== MOBILE AUDIT RESULTS (390x844) ===\n');
let totalTap = 0, totalOverflow = 0, totalHover = 0, totalFixedW = 0;
for (const r of allResults) {
  const a = r.audit;
  const tap = a.tapTargets.length;
  const ovf = a.horizontalScroll.length;
  const hover = a.hoverOnlyActions.length;
  const fixed = a.fixedWidths.length;
  totalTap += tap; totalOverflow += ovf; totalHover += hover; totalFixedW += fixed;
  const status = (tap + ovf + hover + fixed) === 0 ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${r.route} (${r.path}): tap=${tap} overflow=${ovf} hover-hidden=${hover} fixedWidth=${fixed}`);
  if (r.consoleErrors.length) console.log(`  console: ${r.consoleErrors.slice(0,3).join(' | ')}`);
  if (a.tapTargets.length) {
    for (const t of a.tapTargets.slice(0,5)) {
      console.log(`  TAP: <${t.tag}> "${t.text}" ${t.w}x${t.h} cls=${t.cls}`);
    }
    if (a.tapTargets.length > 5) console.log(`  ... +${a.tapTargets.length - 5} more`);
  }
  if (a.horizontalScroll.length) {
    for (const h of a.horizontalScroll.slice(0,5)) {
      console.log(`  OVERFLOW: <${h.tag}> right=${h.right} w=${h.width} vw=${h.vw}`);
    }
  }
}
console.log(`\nTOTALS: tap_targets=${totalTap} horizontal_overflow=${totalOverflow} hover_hidden=${totalHover} fixed_width=${totalFixedW}`);
console.log(`OVERALL: ${(totalTap + totalOverflow + totalHover + totalFixedW) === 0 ? 'PASS' : 'FAIL'}`);

// Write JSON for further analysis
fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(allResults, null, 2));
console.log(`\nFull results: ${OUT}/audit.json`);
