import { chromium, devices } from "playwright";

const BASE = "http://localhost:3000";
const DIR = "C:/Users/mamtiou/AppData/Local/Temp/claude/C--Next-Santeaumaroc/b0c8213b-f139-403e-ae09-aa84ac7db550/scratchpad";
const OUT = `${DIR}/${process.argv[2] || "before"}`;
const slugs = ["mohammed-chiyami", "catherine-guillemeteau"];

const browser = await chromium.launch();
for (const slug of slugs) {
  // Desktop FR
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/praticiens/${slug}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}-${slug}-desktop-fr.png`, fullPage: true });
    await ctx.close();
  }
  // Desktop AR
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/ar/praticiens/${slug}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}-${slug}-desktop-ar.png`, fullPage: true });
    await ctx.close();
  }
  // Mobile FR
  {
    const ctx = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/praticiens/${slug}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}-${slug}-mobile-fr.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
console.log("done", OUT);
