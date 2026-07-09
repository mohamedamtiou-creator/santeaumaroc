import { chromium } from 'playwright';

const URL = 'http://localhost:3000/praticiens/youssef-benali-3';
const DESKTOP_OUT = 'C:\\Next\\Santeaumaroc\\audit-screenshots\\langues-after-desktop.png';
const MOBILE_OUT  = 'C:\\Next\\Santeaumaroc\\audit-screenshots\\langues-after-mobile.png';
const PAD = 30;

async function captureLanguesSection(page, outputPath) {
  // Try to find the section by "Langues parlées" text
  let sectionEl = null;

  // Try multiple selectors
  const candidates = [
    'text=Langues parlées',
    ':has-text("Langues parlées")',
  ];

  for (const sel of candidates) {
    try {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        sectionEl = el;
        console.log(`Found element with selector: ${sel}`);
        break;
      }
    } catch (e) {
      // continue
    }
  }

  if (!sectionEl) {
    // Fallback: get the parent container that has this text
    sectionEl = page.getByText('Langues parlées').first();
  }

  // Walk up to a reasonable container
  const parent = sectionEl.locator('xpath=ancestor::section[1] | xpath=ancestor::div[contains(@class,"card") or contains(@class,"section") or contains(@class,"info")][1]').first();

  let box = null;
  try {
    box = await parent.boundingBox();
  } catch (e) {
    // fallback to direct element
  }

  if (!box) {
    box = await sectionEl.boundingBox();
  }

  if (!box) {
    console.error('Could not find bounding box for Langues section');
    // Take full page screenshot as fallback
    await page.screenshot({ path: outputPath, fullPage: false });
    return null;
  }

  console.log(`Bounding box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);

  const clip = {
    x: Math.max(0, box.x - PAD),
    y: Math.max(0, box.y - PAD),
    width: box.width + PAD * 2,
    height: box.height + PAD * 2,
  };

  await page.screenshot({ path: outputPath, clip });
  console.log(`Saved: ${outputPath}`);
  return box;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // --- Desktop ---
  console.log('\n=== DESKTOP 1280x900 ===');
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  // Dismiss error overlay
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(2000);

  // Check page title / content
  const title = await desktopPage.title();
  console.log('Page title:', title);

  // Log all text containing "Langues"
  const langTexts = await desktopPage.$$eval('*', els =>
    els.filter(e => e.textContent && e.textContent.includes('Langues parlées') && e.children.length < 10)
       .map(e => ({ tag: e.tagName, cls: e.className, text: e.textContent.slice(0, 100) }))
       .slice(0, 5)
  );
  console.log('Elements with "Langues parlées":', JSON.stringify(langTexts, null, 2));

  const desktopBox = await captureLanguesSection(desktopPage, DESKTOP_OUT);

  // Also get the HTML of the langues section for analysis
  let languesHTML = '';
  try {
    languesHTML = await desktopPage.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes('Langues parlées')) {
          // Walk up to find a good container
          let el = node.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!el) break;
            if (el.children.length > 1 || el.tagName === 'SECTION' || el.tagName === 'ARTICLE') {
              return el.outerHTML.slice(0, 3000);
            }
            el = el.parentElement;
          }
          return node.parentElement ? node.parentElement.outerHTML.slice(0, 3000) : '';
        }
      }
      return '';
    });
  } catch (e) {
    console.log('Could not get HTML:', e.message);
  }
  console.log('\nLangues section HTML (desktop):\n', languesHTML);

  await desktopCtx.close();

  // --- Mobile ---
  console.log('\n=== MOBILE 375x812 ===');
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(2000);

  const mobileBox = await captureLanguesSection(mobilePage, MOBILE_OUT);

  // Get mobile HTML
  let languesMobileHTML = '';
  try {
    languesMobileHTML = await mobilePage.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes('Langues parlées')) {
          let el = node.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!el) break;
            if (el.children.length > 1 || el.tagName === 'SECTION' || el.tagName === 'ARTICLE') {
              return el.outerHTML.slice(0, 3000);
            }
            el = el.parentElement;
          }
          return node.parentElement ? node.parentElement.outerHTML.slice(0, 3000) : '';
        }
      }
      return '';
    });
  } catch (e) {
    console.log('Could not get mobile HTML:', e.message);
  }
  console.log('\nLangues section HTML (mobile):\n', languesMobileHTML);

  await mobileCtx.close();
  await browser.close();

  console.log('\n=== DONE ===');
  console.log('Desktop box:', desktopBox);
  console.log('Mobile box:', mobileBox);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
