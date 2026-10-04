// per-element-mobile-gate.mjs — canonical §2 per-element mobile gate (MOBILE-UI-STANDARD)
// Reusable across ANY SPA sweep. Copy into the repo, set env, run: node per-element-mobile-gate.mjs
//
// Env:
//   TARGET_URL   base prod url, e.g. https://family-office-superpowerstudio.vercel.app
//   PIN          PIN digits if the app gates auth on a PIN (default 123456; set PIN=none to skip)
//   ROUTES_FILE  path to a JSON file containing a string[] of routes (e.g. ["/","/assets", ...])
//                If unset, the EDIT-HERE array below is used (replace with the app's real routes).
//
// SAVE AS .mjs — the harness uses ESM `import`; a .cjs extension makes Node treat it as
// CommonJS and throw "SyntaxError: Cannot use import statement outside a module".
//
// Gate assertions (all must pass): docOverflow<=2 AND realOff===0 AND consoleErrs===0 AND smallTaps===0
// Exit code 1 if any route fails.

import { chromium } from 'playwright';
import fs from 'fs';

const BASE = (process.env.TARGET_URL || 'https://CHANGE-ME.vercel.app').replace(/\/$/, '');
const VW = 390;
const PIN = (process.env.PIN && process.env.PIN !== 'none') ? process.env.PIN : null;

let ROUTES;
if (process.env.ROUTES_FILE && fs.existsSync(process.env.ROUTES_FILE)) {
  ROUTES = JSON.parse(fs.readFileSync(process.env.ROUTES_FILE, 'utf8'));
} else {
  // EDIT-HERE: replace with the target app's real router paths
  ROUTES = ['/', '/assets', '/transactions', '/vault', '/entities'];
}
// normalize :id placeholders to a real id for detail routes
ROUTES = ROUTES.map(r => r.replace(':id', '1'));

const browser = await chromium.launch({ headless: true });

// Unlock PIN once (if any), persist storageState
if (PIN) {
  const u = await browser.newContext({ viewport: { width: VW, height: 844 }, hasTouch: true, isMobile: true });
  const up = await u.newPage();
  await up.goto(BASE, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await up.waitForTimeout(1500);
  for (let r = 0; r < 2; r++) {
    for (const d of PIN) {
      await up.evaluate((x) => {
        const b = [...document.querySelectorAll('button')].find(b => b.textContent && b.textContent.trim() === x);
        if (b) b.click();
      }, d);
      await up.waitForTimeout(200);
    }
    await up.waitForTimeout(800);
  }
  await up.waitForTimeout(800);
  await u.storageState({ path: 'state.json' });
  await u.close();
}

const gates = {};
for (const route of ROUTES) {
  const ctx = await browser.newContext({
    viewport: { width: VW, height: 844 }, hasTouch: true, isMobile: true,
    ...(PIN ? { storageState: 'state.json' } : {}),
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PE:' + e.message));
  try { await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 25000 }); } catch (e) {}
  await page.waitForTimeout(2500); // SSE/AI: NO networkidle

  const res = await page.evaluate((vw) => {
    const docOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const inScroll = (el) => {
      let p = el.parentElement;
      while (p) {
        const cs = getComputedStyle(p);
        if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.overflowX === 'hidden') && p.getBoundingClientRect().width <= vw + 1) return true;
        p = p.parentElement;
      }
      return false;
    };
    const off = [];
    const walk = (el) => {
      const cs = getComputedStyle(el);
      const pos = cs.position;
      if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') { for (const c of el.children) walk(c); return; }
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && el.offsetParent !== null && r.right > vw + 1 && !inScroll(el)) {
        off.push({ tag: el.tagName.toLowerCase(), right: Math.round(r.right) });
      }
      for (const c of el.children) walk(c);
    };
    walk(document.body);
    const taps = [...document.querySelectorAll('button,a,[role=button]')]
      .map(e => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter(t => t.h > 0);
    const smallTaps = taps.filter(t => t.w < 44 || t.h < 44).length;
    return { docOverflow, realOff: off.length, offList: off.slice(0, 10), totalTaps: taps.length, smallTaps };
  }, VW);
  gates[route] = { ...res, consoleErrs: errs.length };
  await ctx.close();
}

const bad = Object.entries(gates).filter(([_, g]) => g.realOff > 0 || g.docOverflow > 2 || g.consoleErrs > 0 || g.smallTaps > 0);
fs.writeFileSync('verify-report.json', JSON.stringify(gates, null, 2));
console.log(`ROUTES=${ROUTES.length} FAILING=${bad.length}`);
for (const [k, v] of bad) {
  console.log(`  FAIL ${k}: realOff=${v.realOff} docOverflow=${v.docOverflow} smallTaps=${v.smallTaps} consoleErrs=${v.consoleErrs}`);
}
const allPass = bad.length === 0;
console.log(`ALL_PASS=${allPass}`);
await browser.close();
process.exit(allPass ? 0 : 1);