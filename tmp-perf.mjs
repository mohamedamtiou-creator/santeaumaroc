import { chromium, devices } from "playwright";

const BASE = "http://localhost:3100";
const PAGES = [
  ["home", "/"],
  ["listing-praticiens", "/praticiens"],
  ["specialite", "/specialites/medecine-generale"],
  ["specialite-ville", "/specialites/medecine-generale/casablanca"],
  ["fiche-praticien", "/praticiens/mohammed-chiyami"],
  ["ville", "/villes/casablanca"],
  ["blog", "/blog"],
];

const INIT = `
window.__lcp = 0; window.__lcpEl = null; window.__cls = 0;
try {
  new PerformanceObserver((l) => {
    const es = l.getEntries();
    const last = es[es.length - 1];
    if (last) { window.__lcp = last.startTime; window.__lcpEl = ((last.element && last.element.tagName) || '') + (last.url ? ' ' + last.url.split('/').pop() : ''); }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) { if (!e.hadRecentInput) window.__cls += e.value; }
  }).observe({ type: 'layout-shift', buffered: true });
} catch (e) {}
`;

const measure = async (page) => {
  return await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await wait(2500);
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((p) => p.name === "first-contentful-paint");
    const lcp = window.__lcp || null;
    const lcpEl = window.__lcpEl || null;
    const cls = Math.round((window.__cls || 0) * 1000) / 1000;
    const res = performance.getEntriesByType("resource");
    const sum = (f) => res.filter(f).reduce((a, r) => a + (r.transferSize || 0), 0);
    const isJS = (r) => r.initiatorType === "script" || /\.js(\?|$)/.test(r.name);
    const isCSS = (r) => /\.css(\?|$)/.test(r.name);
    const isImg = (r) => r.initiatorType === "img" || /\.(png|jpg|jpeg|webp|avif|svg|gif)(\?|$)/.test(r.name);
    const isFont = (r) => /\.(woff2?|ttf|otf)(\?|$)/.test(r.name);
    return {
      ttfb: Math.round(nav.responseStart || 0),
      fcp: fcp ? Math.round(fcp.startTime) : null,
      lcp: lcp ? Math.round(lcp) : null,
      lcpEl,
      cls,
      reqCount: res.length,
      totalKB: Math.round(res.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
      jsKB: Math.round(sum(isJS) / 1024),
      cssKB: Math.round(sum(isCSS) / 1024),
      imgKB: Math.round(sum(isImg) / 1024),
      fontKB: Math.round(sum(isFont) / 1024),
    };
  });
};

const run = async (label, emulate) => {
  const browser = await chromium.launch();
  const ctxOpts = emulate ? { ...devices["Pixel 5"] } : { viewport: { width: 1366, height: 900 } };
  const results = [];
  for (const [name, path] of PAGES) {
    const ctx = await browser.newContext(ctxOpts);
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
      const m = await measure(page);
      results.push({ page: name, ...m });
    } catch (e) {
      results.push({ page: name, error: String(e).slice(0, 80) });
    }
    await ctx.close();
  }
  await browser.close();
  console.log("\n===== " + label + " =====");
  console.table(results);
  return results;
};

await run("DESKTOP (1366x900)", false);
await run("MOBILE (Pixel 5 emulation)", true);
