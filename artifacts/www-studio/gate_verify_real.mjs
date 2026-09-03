import { chromium } from 'playwright';

const BASE = 'https://www-studio-superpowerstudio.vercel.app';
const REAL_ID = 'e9b4ddf5-1130-4b00-8a30-ea7abb635677';
const ROUTES = [
  '/', '/projects', '/ui-library', '/editor/new', '/editor/' + REAL_ID, '/profile', '/gallery', '/scenes',
  '/scenes/gallery', '/scenes/' + REAL_ID, '/scenes/' + REAL_ID + '/preview', '/scenes/' + REAL_ID + '/share',
  '/design-extract', '/design-extract/gallery'
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const results = [];
for (const route of ROUTES) {
  const consoleErrs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => consoleErrs.push('PAGEERROR: ' + e.message));
  try {
    await page.goto(BASE + '/#' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const m = await page.evaluate(() => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const docOverflow = document.documentElement.scrollWidth > vw + 1 ? document.documentElement.scrollWidth - vw : 0;
      const isScrollExcluded = (el) => {
        let n = el;
        while (n && n !== document.body) {
          const s = getComputedStyle(n);
          if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflowX === 'hidden') return true;
          n = n.parentElement;
        }
        return false;
      };
      let realOff = 0;
      const offenders = [];
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && !isScrollExcluded(el)) {
          realOff++;
          if (offenders.length < 5) offenders.push({ tag: el.tagName, right: Math.round(r.right), cls: (el.className||'').toString().slice(0,40) });
        }
      }
      const SEL = 'button, a, [role="button"], [role="menuitem"], input, select, textarea';
      let smallTaps = 0;
      const small = [];
      for (const el of document.querySelectorAll(SEL)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) continue;
        if (r.width < 44 || r.height < 44) { smallTaps++; if (small.length < 5) small.push({ tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), cls: (el.className||'').toString().slice(0,40) }); }
      }
      return { vw, vh, coarse, docOverflow, realOff, offenders, smallTaps, small };
    });
    results.push({ route, status: 'ok', ...m, consoleErrs: consoleErrs.length });
  } catch (e) {
    results.push({ route, status: 'ERROR', err: String(e).slice(0,120) });
  }
  page.removeAllListeners('console'); page.removeAllListeners('pageerror');
}
await browser.close();

let totalRealOff = 0, totalSmall = 0, totalConsole = 0, totalDoc = 0, pass = true;
for (const r of results) {
  if (r.status !== 'ok') { pass = false; continue; }
  totalRealOff += r.realOff; totalSmall += r.smallTaps; totalConsole += r.consoleErrs;
  totalDoc = Math.max(totalDoc, r.docOverflow);
  const routePass = r.realOff === 0 && r.smallTaps === 0 && r.consoleErrs === 0 && r.docOverflow <= 2;
  if (!routePass) pass = false;
  console.log(`${routePass ? 'PASS' : 'FAIL'} ${r.route} off=${r.realOff} small=${r.smallTaps} console=${r.consoleErrs} docO=${r.docOverflow}` +
    (r.offenders.length ? ' off:'+JSON.stringify(r.offenders) : '') + (r.small.length ? ' sm:'+JSON.stringify(r.small) : ''));
}
console.log('---');
console.log(`AGG realOff=${totalRealOff} smallTaps=${totalSmall} consoleErrs=${totalConsole} maxDocOverflow=${totalDoc} ALL_PASS=${pass}`);
console.log('JSON:' + JSON.stringify({ realOff: totalRealOff, smallTaps: totalSmall, consoleErrs: totalConsole, docOverflow: totalDoc, allPass: pass }));
process.exit(pass ? 0 : 1);
