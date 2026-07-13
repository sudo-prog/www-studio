import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173';
// iPhone 16 Pro-ish viewport
const VIEWPORT = { width: 390, height: 844 };

const ROUTES = ['/', '/freeform', '/scenes', '/editor/new', '/gallery'];

const measure = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const de = document.documentElement;
  const be = document.body;

  let horizontalScrollContainers = 0;
  const scrollEls = [];
  for (const el of document.querySelectorAll('*')) {
    if (el === be || el === de) continue;
    if (el.scrollWidth - el.clientWidth > 2 && el.clientWidth > 0 && el.clientHeight > 0) {
      horizontalScrollContainers++;
      if (scrollEls.length < 8) scrollEls.push((el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ').slice(0,2).join('.') : '')).slice(0,60));
    }
  }

  let offscreenRight = 0, offscreenLeft = 0;
  const offRight = [], offLeft = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (r.right > vw + 1) { offscreenRight++; if (offRight.length < 8) offRight.push((el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ').slice(0,2).join('.') : '')).slice(0,60) + ` r=${Math.round(r.right)}`); }
    if (r.left < -1) { offscreenLeft++; if (offLeft.length < 8) offLeft.push((el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ').slice(0,2).join('.') : '')).slice(0,60) + ` l=${Math.round(r.left)}`); }
  }

  const pageOverflowX = Math.max(de.scrollWidth - de.clientWidth, be.scrollWidth - be.clientWidth);
  const interactiveCount = document.querySelectorAll('button, [role="button"], a, input, select, textarea').length;
  const canvasTouchActionEls = Array.from(document.querySelectorAll('div, svg')).filter(el => {
    const ta = getComputedStyle(el).touchAction;
    return ta === 'none' && (el.tagName === 'SVG' || el.getBoundingClientRect().width > vw * 0.5);
  }).length;

  return {
    vw, vh,
    horizontalScrollContainers,
    horizontalScrollContainersSample: scrollEls,
    offscreenRight, offscreenLeft,
    offscreenRightSample: offRight, offscreenLeftSample: offLeft,
    pageOverflowX,
    interactiveCount,
    canvasTouchActionEls,
  };
};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  const summary = [];
  for (const route of ROUTES) {
    const url = `${BASE}/#${route}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    } catch (e) {
      summary.push({ route, error: e.message.split('\n')[0] });
      continue;
    }
    await page.waitForTimeout(700);
    const m = await page.evaluate(measure);
    m.route = route;
    m.consoleErrors = consoleErrors.slice(0, 4);
    summary.push(m);
    console.log(`\n=== ${route} ===`);
    console.log(JSON.stringify({ hscroll: m.horizontalScrollContainers, offR: m.offscreenRight, offL: m.offscreenLeft, pageOverflowX: m.pageOverflowX, interactive: m.interactiveCount, touchCanvas: m.canvasTouchActionEls, errs: m.consoleErrors }, null, 0));
  }

  await browser.close();
  console.log('\n===== TOTALS =====');
  const totalH = summary.reduce((s,r)=>s+(r.horizontalScrollContainers||0),0);
  const totalR = summary.reduce((s,r)=>s+(r.offscreenRight||0),0);
  const totalL = summary.reduce((s,r)=>s+(r.offscreenLeft||0),0);
  console.log('routes:', summary.length, 'sum horizontalScrollContainers:', totalH, 'sum offscreenRight:', totalR, 'sum offscreenLeft:', totalL);
})();
