import { chromium } from 'playwright';
import path from 'path';

const URL = 'http://localhost:3000/praticiens/youssef-benali-3';
const OUT_DIR = 'C:/Next/Santeaumaroc/audit-screenshots';

async function run() {
  const browser = await chromium.launch({ headless: true });

  // ── 1. Full-page screenshot ──────────────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    // Dismiss any error overlay (Next.js dev overlay) with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');

    // Wait for network to settle (up to 5 s)
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      await page.waitForTimeout(3000);
    }

    // Dismiss overlay again after load
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: `${OUT_DIR}/profile-after-fixes.png`,
      fullPage: true,
    });
    console.log('✓ Full-page screenshot saved.');
    await page.close();
  }

  // ── 2. Sidebar area screenshot ───────────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      await page.waitForTimeout(3000);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Try to find the sidebar / right column
    // Common selectors for a two-column layout
    const sidebarSelectors = [
      'aside',
      '[class*="sidebar"]',
      '[class*="Sidebar"]',
      '.sticky',
      '[class*="sticky"]',
      // generic right column in a grid
      'main > div > div:last-child',
      'main > section:last-child',
    ];

    let sidebarEl = null;
    for (const sel of sidebarSelectors) {
      try {
        const el = page.locator(sel).first();
        const box = await el.boundingBox();
        if (box && box.width > 50 && box.height > 50) {
          sidebarEl = el;
          console.log(`Sidebar found via selector: ${sel}  box=${JSON.stringify(box)}`);
          break;
        }
      } catch { /* continue */ }
    }

    if (sidebarEl) {
      await sidebarEl.screenshot({ path: `${OUT_DIR}/profile-sidebar-after.png` });
      console.log('✓ Sidebar screenshot saved (element).');
    } else {
      // Fallback: right half of the viewport
      await page.screenshot({
        path: `${OUT_DIR}/profile-sidebar-after.png`,
        clip: { x: 840, y: 0, width: 440, height: 900 },
      });
      console.log('✓ Sidebar screenshot saved (fallback clip).');
    }
    await page.close();
  }

  // ── 3. Mobile – bottom sticky CTA ───────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      await page.waitForTimeout(3000);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Capture last 200 px of viewport (sticky footer area)
    await page.screenshot({
      path: `${OUT_DIR}/profile-mobile-sticky-after.png`,
      clip: { x: 0, y: 612, width: 375, height: 200 },
    });
    console.log('✓ Mobile sticky CTA screenshot saved.');
    await page.close();
  }

  await browser.close();
  console.log('All done.');
}

run().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
