import { chromium } from 'playwright';
const BASE = 'https://www-studio-superpowerstudio.vercel.app';
const PIN = 'none';
const ROUTES = ['/', '/projects', '/ui-library', '/editor/new', '/editor/1', '/profile', '/gallery', '/scenes', '/scenes/1', '/scenes/1/preview', '/scenes/1/share', '/freeform/1', '/freeform/1/share', '/design-extract', '/design-extract/gallery', '/design-extract/1/compare', '/design-extract/1'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const consoleErrors = [];
  
  // Collect all errors first
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        url: window.location.href,
        status: window.location.pathname
      });
    });
  });
  
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // Print all errors with context
  console.log('=== ALL CONSOLE ERRORS ===');
  for (const err of messages) {
    console.log(`${err.url} | ${err.status} | ${err.text.slice(0, 100)}`);
  }
  
  // Count by type
  const apiErrors = consoleErrors.filter(e => e.url.includes('www-studio-api-server.vercel.app'));
  const otherErrors = consoleErrors.filter(e => !e.url.includes('www-studio-api-server.vercel.app'));
  
  console.log(`\\n=== SUMMARY ==`);
  console.log(`Total errors: ${consoleErrors.length}`);
  console.log(`API errors (www-studio-api-server.vercel.app): ${apiErrors.length}`);
  console.log(`Other errors: ${otherErrors.length}`);
  console.log(`Total: ${consoleErrors.length}`);
  
  // Check if any errors are actual UI layout issues
  const uiErrors = consoleErrors.filter(e => 
    e.text.includes('overflow') || 
    e.text.includes('width') || 
    e.text.includes('height') || 
    e.text.includes('container') || 
    e.text.includes('margin') || 
    e.text.includes('padding') || 
    e.text.includes('margin')
  });
  
  console.log(`\\nUI-related errors: ${uiErrors.length}`);
  console.log('API/data errors:', apiErrors.length);
  console.log('Other errors:', otherErrors.length);
  
  // Check if any errors are actual UI layout issues
  const layoutErrors = consoleErrors.filter(e => 
    e.text.includes('overflow') || 
    e.text.includes('width') || 
    e.text.includes('height') || 
    e.text.includes('container') || 
    e.text.includes('margin') || 
    e.text.includes('position') || 
    e.text.includes('layout') || 
    e.text.includes('overflow') || 
    e.text.includes('scroll') || 
    e.text.includes('z-index') || 
    e.text.includes('stacking')
  });
  
  console.log(`\\nUI layout errors: ${uiErrors.length}`);
  console.log(`API/data errors: ${apiErrors.length}`);
  console.log(`Other errors: ${otherErrors.length}`);
  console.log(`Total: ${consoleErrors.length}`);
  
  // Check if any errors are actual UI layout issues
  const layoutErrors = consoleErrors.filter(e => 
    e.text.includes('overflow') || 
    e.text.includes('width') || 
    e.text.includes('height') || 
    e.text.includes('container') || 
    e.text.includes('margin') || 
    e.text.includes('position') || 
    e.text.includes('layout') || 
    e.text.includes('overflow') || 
    e.text.includes('scroll') || 
    e.text.includes('z-index') || 
    e.text.includes('stacking')
  );
  
  console.log(`\\nUI layout errors: ${uiErrors.length}`);
  console.log(`API/data errors: ${apiErrors.length}`);
  console.log(`Other errors: ${otherErrors.length}`);
  console.log(`Total: ${consoleErrors.length}`);
  
  // Show actual console errors for debugging
  console.log('\\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach((err, i) => {
    console.log(`${i+1}. ${err.text}`);
  });
  
  await browser.close();
})();
