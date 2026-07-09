const { chromium } = require('C:\Users\mamtiou\AppData\Local\Temp\claude\node_modules\playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Mobile
  const ctx1 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p1 = await ctx1.newPage();
  await p1.goto('http://localhost:3000/inscription', { waitUntil: 'networkidle' });
  await p1.screenshot({ path: 'C:\Temp\inscription-mobile.png', fullPage: true });
  await ctx1.close();
  console.log('mobile done');

  // Desktop
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto('http://localhost:3000/inscription', { waitUntil: 'networkidle' });
  await p2.screenshot({ path: 'C:\Temp\inscription-desktop.png', fullPage: true });
  console.log('desktop done');

  // Password strength
  await p2.fill('#password', 'test');
  await p2.screenshot({ path: 'C:\Temp\inscription-pw-faible.png' });
  await p2.fill('#password', 'TestPass1!');
  await p2.screenshot({ path: 'C:\Temp\inscription-pw-fort.png' });
  console.log('pw-strength done');

  // Connexion page for regression check
  const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p3 = await ctx3.newPage();
  await p3.goto('http://localhost:3000/connexion', { waitUntil: 'networkidle' });
  await p3.screenshot({ path: 'C:\Temp\connexion-check.png', fullPage: true });
  await ctx3.close();
  console.log('connexion done');

  await browser.close();
  console.log('ALL DONE');
})();
