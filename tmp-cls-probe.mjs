import { chromium } from "playwright";

const BASE = "http://localhost:3100";
const PATH = process.argv[2] || "/specialites/medecine-generale";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();

const snap = () => page.evaluate(() => {
  const box = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height), bottom: Math.round(r.bottom) }; };
  return {
    header: box("header"),
    main: box("main"),
    footer: box("footer"),
    nav: box("header nav"),
    docHeight: Math.round(document.documentElement.scrollHeight),
  };
});

await page.goto(BASE + PATH, { waitUntil: "domcontentloaded", timeout: 30000 });
const t0 = await snap();
await page.waitForTimeout(300);  const t300 = await snap();
await page.waitForTimeout(300);  const t600 = await snap();
await page.waitForLoadState("networkidle").catch(()=>{});
await page.waitForTimeout(1500); const tEnd = await snap();

console.log("PATH:", PATH);
console.log("t~0   :", JSON.stringify(t0));
console.log("t~300 :", JSON.stringify(t300));
console.log("t~600 :", JSON.stringify(t600));
console.log("tEnd  :", JSON.stringify(tEnd));

await browser.close();
