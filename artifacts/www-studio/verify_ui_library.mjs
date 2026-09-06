// Playwright verification: check the live www-studio-red deployment renders
// 1. Total component count via grid
// 2. Bundle hash matches the new build
// 3. New categories present (Animation, Effects, etc.)
// 4. A few specific entries from the new extraction are visible
import { chromium } from "playwright";

const url = "https://www-studio-red.vercel.app/?v=31a12e0#/ui-library";
const expectedBundle = "Cg6yRn4e"; // from build output

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

console.log("→ Loading:", url);
const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
console.log(`  HTTP ${resp.status()}`);

await page.waitForTimeout(2000);

// Bundle check
const scripts = await page.$$eval("script[src]", (els) => els.map((e) => e.getAttribute("src")));
const bundleScripts = scripts.filter((s) => s && s.includes("index-"));
const hasNewBundle = bundleScripts.some((s) => s.includes(expectedBundle));
console.log(`\n→ Bundle check:`);
console.log(`  Scripts: ${scripts.length} total, ${bundleScripts.length} index-*`);
console.log(`  Bundle scripts: ${bundleScripts.slice(0, 3).join(", ")}`);
console.log(`  New bundle (${expectedBundle}) present: ${hasNewBundle ? "✓" : "✗"}`);

// Component count
const cards = await page.$$("[data-testid='component-card'], [data-component-card], .component-card");
const allLinks = await page.$$eval("a[href*='libraries.dev'], a[href*='appica'], a[href*='npmjs']", (els) => els.length);
console.log(`\n→ Component count:`);
console.log(`  Card elements: ${cards.length}`);
console.log(`  Source links (libraries.dev/appica/npmjs): ${allLinks}`);

// Look for the new components by name
const expectedNew = [
  "Border Beam (Libraries.Dev)",
  "Liquid Gooey (Libraries.Dev)",
  "Thinking Orbs (Libraries.Dev)",
  "Metal Fx (Libraries.Dev)",
  "Img Fx (Libraries.Dev)",
  "Button (Appica)",
  "Input (Appica)",
  "Checkbox (Appica)",
  "Dialog (Appica)",
];

const pageText = await page.textContent("body");
console.log(`\n→ New entries visible (substring match):`);
for (const name of expectedNew) {
  const found = pageText.toLowerCase().includes(name.toLowerCase());
  console.log(`  ${found ? "✓" : "✗"} ${name}`);
}

// Try scrolling through pages to count cards
let totalCards = cards.length;
try {
  await page.waitForSelector("[data-testid='component-grid']", { timeout: 5000 });
  totalCards = await page.$$eval("[data-testid='component-grid'] > *", (els) => els.length);
  console.log(`\n→ Grid child count: ${totalCards}`);
} catch (e) {
  console.log(`\n→ Grid selector not found: ${e.message}`);
}

// Click into the Animation filter to check it's populated
const animBtn = await page.$("button:has-text('Animation'), a:has-text('Animation')");
if (animBtn) {
  await animBtn.click();
  await page.waitForTimeout(800);
  const animCount = await page.$$eval("[data-testid='component-grid'] > *", (els) => els.length);
  console.log(`\n→ Animation filter: ${animCount} cards`);
}

// Console errors
console.log(`\n→ Console errors (${consoleErrors.length}):`);
consoleErrors.slice(0, 5).forEach((e) => console.log(`  - ${e.slice(0, 200)}`));

// Take screenshot
await page.screenshot({ path: "/tmp/ui-library-verified.png", fullPage: false });
console.log(`\n→ Screenshot: /tmp/ui-library-verified.png`);

await browser.close();

const pass = hasNewBundle && totalCards > 0;
console.log(`\n=== ${pass ? "PASS" : "FAIL"} ===`);
process.exit(pass ? 0 : 1);
