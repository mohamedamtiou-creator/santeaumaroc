import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const DIR = "C:/Users/mamtiou/AppData/Local/Temp/claude/C--Next-Santeaumaroc/b0c8213b-f139-403e-ae09-aa84ac7db550/scratchpad";
const OUT = process.argv[2] || "before";
const browser = await chromium.launch();
for (const slug of ["mohammed-chiyami", "catherine-guillemeteau"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/praticiens/${slug}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${DIR}/${OUT}-${slug}-hero.png` });
  await ctx.close();
}
await browser.close();
console.log("done");
