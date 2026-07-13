import { chromium } from 'playwright';

const OUT_DIR = 'C:\\Next\\Santeaumaroc\\audit-screenshots';
const URL = 'http://localhost:3000/praticiens/youssef-benali-3';

async function capture(page, label) {
  // Dismiss error overlay with Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2000);

  // --- langues section (desktop only) ---
  if (label === 'desktop') {
    // Try several selectors to find the Langues row
    const languesEl = await page.evaluateHandle(() => {
      // Look for any element whose text content contains "Langue"
      const all = [...document.querySelectorAll('*')];
      return all.find(el =>
        el.children.length === 0 &&          // leaf text node
        /Langue/i.test(el.textContent) &&
        el.offsetWidth > 0
      ) || all.find(el => /Langue/i.test(el.textContent) && el.offsetWidth > 0);
    });

    if (languesEl) {
      const box = await languesEl.evaluate(el => {
        // Walk up to find the containing row (has reasonable width)
        let node = el;
        while (node && node.offsetWidth < 200) node = node.parentElement;
        if (!node) return null;
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });

      if (box && box.width > 0) {
        const pad = 40;
        const clip = {
          x: Math.max(0, box.x - pad),
          y: Math.max(0, box.y - pad),
          width: box.width + pad * 2,
          height: box.height + pad * 2,
        };
        await page.screenshot({
          path: `${OUT_DIR}\\langues-desktop.png`,
          clip,
        });
        console.log(`langues box: x=${box.x} y=${box.y} w=${box.width} h=${box.height}`);
      } else {
        console.warn('Could not get bounding box for Langues row');
        // Full-page fallback
        await page.screenshot({ path: `${OUT_DIR}\\langues-desktop.png`, fullPage: true });
      }
    } else {
      console.warn('Langues element not found');
      await page.screenshot({ path: `${OUT_DIR}\\langues-desktop.png`, fullPage: true });
    }
  }

  // --- hero card ---
  const cardEl = await page.$('.card');
  if (cardEl) {
    await cardEl.screenshot({ path: `${OUT_DIR}\\hero-card-${label}.png` });
    const box = await cardEl.boundingBox();
    console.log(`hero-card-${label}: x=${box.x} y=${box.y} w=${box.width} h=${box.height}`);
  } else {
    // Fallback: screenshot first 700px of viewport
    await page.screenshot({
      path: `${OUT_DIR}\\hero-card-${label}.png`,
      clip: { x: 0, y: 0, width: page.viewportSize().width, height: 700 },
    });
    console.warn(`No .card element found for ${label}, used viewport crop`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Desktop 1280×900 ──────────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await capture(page, 'desktop');
    await ctx.close();
  }

  // ── Mobile 375×812 ───────────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await capture(page, 'mobile');
    await ctx.close();
  }

  await browser.close();
  console.log('Done. Screenshots saved to', OUT_DIR);
})();
