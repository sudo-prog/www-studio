// wws-mobile-gate.mjs — WWW-Studio mobile-UI gate harness (390x844), run against LIVE url.
// Per-element horizontal overflow (excludes ONLY overflow-x:auto/scroll ancestors — hidden does NOT exempt),
// 44px tap targets, console errors, doc overflow. Hash-router aware (wouter useHashLocation).
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = (process.env.WWS_URL || 'https://www-studio-superpowerstudio.vercel.app').replace(/\/$/, '');
const ROUTES = [
  '/#/', '/#/projects', '/#/ui-library', '/#/editor/new', '/#/profile',
  '/#/gallery', '/#/scenes', '/#/scenes/gallery', '/#/design-extract',
  '/#/design-extract/gallery', '/#/freeform', '/#/editor/123', '/#/scenes/123', '/#/nonexistent-route',
];

const AUDIT_FN = () => {
  const VW = window.innerWidth;
  const out = { overflow: [], tapTargets: [], swallowed: [], docOverflow: 0, gateVisible: false };
  // Only overflow-x:auto / scroll ancestors are CORRECT scroll containers. hidden does NOT exempt.
  const inScrollable = (el) => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
      p = p.parentElement;
    }
    return false;
  };
  out.gateVisible = /Enter password|Create a password|passwordSet|is locked|Choose a 6-digit PIN/i.test(document.body.innerText);
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > VW + 1 && !inScrollable(el)) {
      out.overflow.push({ tag: el.tagName.toLowerCase(), right: Math.round(r.right),
        cls: (el.className?.toString?.() || '').slice(0, 80), text: (el.textContent || '').trim().slice(0, 32) });
    }
    const inter = el.matches('button,a[href],[role="button"],input:not([type=hidden]),select,textarea,[contenteditable="true"]');
    if (inter && r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) {
      out.tapTargets.push({ tag: el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height),
        cls: (el.className?.toString?.() || '').slice(0, 80),
        label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30) });
    }
  }
  const dd = (a, k) => { const s = new Set(); const o = []; for (const x of a) { const j = k(x); if (!s.has(j)) { s.add(j); o.push(x); } } return o; };
  out.overflow = dd(out.overflow, o => o.tag + o.cls).slice(0, 8);
  out.tapTargets = dd(out.tapTargets, o => o.tag + o.cls + o.w + o.h).slice(0, 8);
  out.docOverflow = document.documentElement.scrollWidth - VW;
  return out;
};

const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2,
});
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push(String(e).slice(0, 110)));
p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 110)); });

await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForTimeout(3000);
console.log('LOADED:', await p.title(), '| gateVisible:', await p.evaluate(() => /Enter password|Create a password|is locked/i.test(document.body.innerText)));

const report = {};
for (const route of ROUTES) {
  const before = errors.length;
  await p.evaluate((r) => { window.location.hash = r.replace(/^\/#/, ''); }, route);
  await p.waitForTimeout(2600);
  const r = await p.evaluate(AUDIT_FN);
  r.errors = [...new Set(errors.slice(before))].slice(0, 3);
  report[route] = r;
  const bad = r.overflow.length + r.tapTargets.length;
  console.log(`${bad === 0 && !r.gateVisible ? 'PASS' : 'FAIL'} ${route.padEnd(24)} gate=${r.gateVisible ? 'Y' : 'n'} docOv=${r.docOverflow} realOff=${r.overflow.length} smallTaps=${r.tapTargets.length} err=${r.errors.length}`);
}
fs.writeFileSync('wws-gate-report.json', JSON.stringify(report, null, 2));
const fails = Object.entries(report).filter(([, v]) => v.gateVisible || v.overflow.length > 0 || v.tapTargets.length > 0 || v.docOverflow > 2);
console.log(`\n=== ${ROUTES.length - fails.length}/${ROUTES.length} routes PASS (gate: realOff===0, smallTaps===0, docOv<=2, err===0) ===`);
for (const [k, v] of fails) {
  console.log('  FAIL', k, JSON.stringify({ docOv: v.docOverflow, realOff: v.overflow, taps: v.tapTargets, err: v.errors }).slice(0, 400));
}
await browser.close();
