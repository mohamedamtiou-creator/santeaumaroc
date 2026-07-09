import { chromium } from 'playwright';

const URL = 'http://localhost:3000/praticiens/youssef-benali-3';
const OUT_DIR = 'C:/Next/Santeaumaroc/audit-screenshots';

async function dismissOverlay(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await dismissOverlay(page);
  try {
    await page.waitForLoadState('networkidle', { timeout: 6000 });
  } catch {
    await page.waitForTimeout(3000);
  }
  await dismissOverlay(page);

  // Find the sidebar: the div that contains #rdv (the RDV card)
  // The sidebar is the direct child of the grid that is NOT md:col-span-2
  // We'll locate it via the #rdv element's ancestor

  const rdvCard = page.locator('#rdv').first();
  const rdvBox = await rdvCard.boundingBox();
  console.log('RDV card box:', JSON.stringify(rdvBox));

  // The sidebar div is the parent of #rdv
  const sidebarEl = page.locator('#rdv').locator('..');
  const sidebarBox = await sidebarEl.boundingBox();
  console.log('Sidebar (parent of #rdv) box:', JSON.stringify(sidebarBox));

  if (sidebarBox && sidebarBox.width > 100) {
    await sidebarEl.screenshot({ path: `${OUT_DIR}/profile-sidebar-after.png` });
    console.log('✓ Sidebar screenshot saved (via #rdv parent).');
  } else {
    // fallback: clip the right third of the page
    // Find where the grid starts
    const gridEl = page.locator('.grid.md\\:grid-cols-3').first();
    const gridBox = await gridEl.boundingBox();
    console.log('Grid box:', JSON.stringify(gridBox));

    // Right column starts at 2/3 of grid width
    const clipX = gridBox ? Math.round(gridBox.x + (gridBox.width * 2/3)) : 855;
    const clipW = gridBox ? Math.round(gridBox.width / 3) + 20 : 425;

    await page.screenshot({
      path: `${OUT_DIR}/profile-sidebar-after.png`,
      clip: { x: clipX, y: gridBox ? gridBox.y : 0, width: clipW, height: 700 },
    });
    console.log(`✓ Sidebar screenshot saved (clip at x=${clipX}).'`);
  }

  await browser.close();
  console.log('Done.');
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
