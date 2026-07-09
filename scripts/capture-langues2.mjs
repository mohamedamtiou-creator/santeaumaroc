import { chromium } from 'playwright';

const URL = 'http://localhost:3000/praticiens/youssef-benali-3';
const DESKTOP_OUT = 'C:\\Next\\Santeaumaroc\\audit-screenshots\\langues-after-desktop.png';
const MOBILE_OUT  = 'C:\\Next\\Santeaumaroc\\audit-screenshots\\langues-after-mobile.png';
const PAD = 30;

async function captureLanguesSection(page, outputPath) {
  // The section HTML structure is:
  // <div>
  //   <p class="...">Langues parlées</p>
  //   <div class="flex flex-wrap gap-1.5">
  //     <span>Arabe</span>
  //     <span>Français</span>
  //   </div>
  // </div>
  //
  // We need the parent <div> that contains both the <p> and the badge <div>

  const box = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue && node.nodeValue.trim() === 'Langues parlées') {
        // Go up to the container div that has both label and badges
        let el = node.parentElement; // <p>
        el = el.parentElement;       // <div> with both label + badges
        if (el) {
          const r = el.getBoundingClientRect();
          return { x: r.left, y: r.top, width: r.width, height: r.height, html: el.outerHTML.slice(0, 2000) };
        }
        break;
      }
    }
    return null;
  });

  if (!box) {
    console.error('Could not find Langues section container');
    await page.screenshot({ path: outputPath });
    return null;
  }

  console.log(`Container box: x=${box.x.toFixed(1)}, y=${box.y.toFixed(1)}, w=${box.width.toFixed(1)}, h=${box.height.toFixed(1)}`);
  console.log('HTML:', box.html);

  // Scroll element into view by scrolling to y position
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 100)), box.y);
  await page.waitForTimeout(300);

  // Re-measure after scroll
  const box2 = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue && node.nodeValue.trim() === 'Langues parlées') {
        let el = node.parentElement;
        el = el.parentElement;
        if (el) {
          const r = el.getBoundingClientRect();
          return { x: r.left, y: r.top, width: r.width, height: r.height };
        }
        break;
      }
    }
    return null;
  });

  if (!box2) { return null; }
  console.log(`After scroll box: x=${box2.x.toFixed(1)}, y=${box2.y.toFixed(1)}, w=${box2.width.toFixed(1)}, h=${box2.height.toFixed(1)}`);

  const clip = {
    x: Math.max(0, box2.x - PAD),
    y: Math.max(0, box2.y - PAD),
    width: box2.width + PAD * 2,
    height: box2.height + PAD * 2,
  };

  await page.screenshot({ path: outputPath, clip });
  console.log(`Saved: ${outputPath}`);
  return box2;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // --- Desktop ---
  console.log('\n=== DESKTOP 1280x900 ===');
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await desktopPage.waitForTimeout(3000);
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(2000);
  await captureLanguesSection(desktopPage, DESKTOP_OUT);
  await desktopCtx.close();

  // --- Mobile ---
  console.log('\n=== MOBILE 375x812 ===');
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(3000);
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(2000);
  await captureLanguesSection(mobilePage, MOBILE_OUT);
  await mobileCtx.close();

  await browser.close();
  console.log('\n=== DONE ===');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
