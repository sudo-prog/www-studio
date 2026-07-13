import { chromium } from 'playwright';

const BASE = 'http://localhost:3002';
const VIEWPORT = { width: 390, height: 844 };

// Routes to audit (hash-based routing: #/route)
const ROUTES = [
  '/',
  '/projects',
  '/ui-library',
  '/editor/new',
  '/profile',
  '/gallery',
  '/scenes',
  '/scenes/gallery',
  '/design-extract',
  '/design-extract/gallery',
  '/freeform',
  '/freeform/dummy/share',
  '/scenes/dummy',
  '/scenes/dummy/preview',
  '/scenes/dummy/share',
  '/design-extract/dummy',
  '/design-extract/dummy/compare',
  '/editor/dummy',
];

async function auditRoute(page, route) {
  const url = `${BASE}/#${route}`;
  const result = {
    route,
    status: 'ok',
    consoleErrors: [],
    overflowX: 0,
    offscreenEls: [],
    tinyTapTargets: [],
    tableOverflow: [],
    hasPinGate: false,
  };

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    result.status = resp ? resp.status() : 'no-response';
  } catch (e) {
    result.status = 'nav-error: ' + e.message.split('\n')[0];
  }

  // Collect console errors
  // Wait a moment for render
  await page.waitForTimeout(800);

  // PIN gate detection: clicks 1-2-3-4-5-6
  result.hasPinGate = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const labels = btns.map(b => (b.textContent || '').trim());
    const digits = ['1','2','3','4','5','6'];
    return digits.every(d => labels.includes(d));
  });

  // Horizontal overflow
  result.overflowX = await page.evaluate(() => {
    const de = document.documentElement;
    const be = document.body;
    return Math.max(de.scrollWidth - de.clientWidth, be.scrollWidth - be.clientWidth);
  });

  // Off-screen elements
  result.offscreenEls = await page.evaluate(() => {
    const vw = window.innerWidth;
    const els = Array.from(document.querySelectorAll('*'));
    const bad = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        // element extends beyond right edge of viewport
        if (r.right > vw + 1 && r.left < vw) {
          bad.push((el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0,2).join('.') : '')).slice(0,60));
        }
      }
    }
    return [...new Set(bad)].slice(0, 12);
  });

  // Tiny tap targets (<36px)
  result.tinyTapTargets = await page.evaluate(() => {
    const vw = window.innerWidth;
    const tags = ['a','button','[role="button"]','input','select','textarea','label'];
    const els = Array.from(document.querySelectorAll('a,button,[role="button"],input,select,textarea'));
    const bad = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // only count if visible and interactive
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (r.height < 36 && r.width < 200) {
        bad.push(`${el.tagName}:${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return [...new Set(bad)].slice(0, 15);
  });

  // Table overflow
  result.tableOverflow = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    const bad = [];
    for (const t of tables) {
      const r = t.getBoundingClientRect();
      if (r.right > window.innerWidth + 1) {
        bad.push(`table w=${Math.round(r.width)}`);
      }
    }
    return bad;
  });

  return result;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push('PAGEERROR: ' + err.message));

  const results = [];
  for (const route of ROUTES) {
    const errsBefore = consoleErrors.length;
    const r = await auditRoute(page, route);
    r.consoleErrors = consoleErrors.slice(errsBefore);
    results.push(r);
    console.log(`\n=== ${route} ===`);
    console.log(JSON.stringify({status:r.status, overflowX:r.overflowX, hasPinGate:r.hasPinGate, offscreen:r.offscreenEls, tiny:r.tinyTapTargets, tbl:r.tableOverflow, errs:r.consoleErrors.slice(0,4)}, null, 0));
  }

  await browser.close();

  // Summary
  const failed = results.filter(r => r.overflowX > 1 || r.tableOverflow.length > 0);
  console.log('\n===== SUMMARY =====');
  console.log('Total routes:', results.length);
  console.log('Routes with horizontal overflow (>1px):', failed.map(r => r.route));
  const totalOverflow = failed.reduce((s,r)=>s+r.overflowX,0);
  console.log('Max overflow per route:', results.map(r=>`${r.route}:${r.overflowX}`).join('  '));
})();
