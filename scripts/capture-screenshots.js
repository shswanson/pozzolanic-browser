// Capture Chrome Web Store screenshots for Pozzolanic Browser.
// Produces 1280x800 PNGs in ../screenshots/.
//
// 1. popup-1280x800.png   — the actual extension popup, rendered on a neutral
//                           backdrop. Shows what the user controls.
// 2. amazon-before-after-1280x800.png — Amazon search with and without rules
//                           applied, side by side. Shows what it actually does.
//
// Run: node scripts/capture-screenshots.js
// Uses the playwright binary from ~/fldn-theme/node_modules.

const { chromium } = require('/Users/scott/fldn-theme/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const AMAZON_RULES = [
  '[data-component-type="sp-sponsored-result"]',
  '.s-result-item[data-component-type="s-search-result"][data-sponsored="true"]',
  '.s-result-item:has(.puis-sponsored-label-text)',
  'div.AdHolder',
  '[data-cel-widget^="MAIN-SPONSORED_PRODUCTS"]',
];

function ruleCss(selectors) {
  return selectors.map((s) => `${s} { display: none !important; }`).join('\n');
}

async function makeContext(browser) {
  return browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
}

async function dismissBanners(page) {
  await page
    .locator('button:has-text("Accept all"), button:has-text("Accept"), button:has-text("I agree"), input[name="accept"]')
    .first()
    .click({ timeout: 1500 })
    .catch(() => {});
}

async function captureAmazonHalves(browser) {
  const context = await makeContext(browser);
  const page = await context.newPage();
  await page.goto('https://www.amazon.com/s?k=usb+c+cable', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);
  await dismissBanners(page);
  await page.waitForTimeout(800);

  // Snap "before" at 640x800
  await page.setViewportSize({ width: 640, height: 800 });
  await page.waitForTimeout(500);
  const beforePath = path.join(OUT_DIR, '_amazon-before.png');
  await page.screenshot({ path: beforePath });

  // Apply rules and snap "after"
  await page.addStyleTag({ content: ruleCss(AMAZON_RULES) });
  await page.waitForTimeout(500);
  const afterPath = path.join(OUT_DIR, '_amazon-after.png');
  await page.screenshot({ path: afterPath });

  await context.close();
  return { beforePath, afterPath };
}

async function capturePopup(browser) {
  const context = await makeContext(browser);
  const page = await context.newPage();

  // Build a standalone HTML that loads the real popup body and rules,
  // then renders it on a neutral backdrop sized 1280x800.
  const popupHtml = fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8');
  const rulesJs = fs.readFileSync(path.join(ROOT, 'rules.js'), 'utf8');
  const popupJs = fs.readFileSync(path.join(ROOT, 'popup.js'), 'utf8');

  // Strip the chrome.* calls from popup.js — render with a mocked default state.
  const mockedPopupJs = popupJs.replace(
    "chrome.storage.local.get([STORAGE_KEY], (data) => {\n    render(data[STORAGE_KEY] || []);\n  });",
    "render([]);",
  ).replace(
    "input.addEventListener('change', () => {\n        chrome.storage.local.get([STORAGE_KEY], (data) => {",
    "input.addEventListener('change', () => {\n        (function fakestorage(){ const data = {}; (function(){",
  ).replace(
    "chrome.storage.local.set({ [STORAGE_KEY]: d });\n        });",
    "})(); });",
  );

  const innerBody = popupHtml.match(/<body>([\s\S]*?)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const popupStyles = popupHtml.match(/<style>([\s\S]*?)<\/style>/)[1];

  const composedHtml = `<!doctype html><html><head><meta charset="utf-8"><title>preview</title>
<style>
  html, body { margin: 0; padding: 0; }
  body {
    width: 1280px; height: 800px;
    background: linear-gradient(135deg, #1f2630 0%, #2c2f38 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #fff;
  }
  .frame {
    display: flex; align-items: stretch; gap: 56px;
  }
  .caption {
    max-width: 460px; display: flex; flex-direction: column; justify-content: center;
  }
  .caption h2 { font-size: 32px; line-height: 1.2; margin: 0 0 12px; letter-spacing: -0.01em; font-weight: 600; }
  .caption p  { font-size: 16px; line-height: 1.5; margin: 0 0 10px; color: #c8cdd6; }
  .popup-card {
    width: 320px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.2);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    color: #222;
  }
  .popup-card .inner { padding: 14px; }
  ${popupStyles}
  /* override body padding from popup styles within the card */
  .popup-card body { padding: 0; }
</style>
</head>
<body>
  <div class="frame">
    <div class="caption">
      <h2>Tailor your browsing.</h2>
      <p>Hide sponsored results, Shorts shelves, and promoted posts on the sites you actually visit.</p>
      <p>Bundled CSS selectors. No tracking. No remote code.</p>
    </div>
    <div class="popup-card"><div class="inner">${innerBody}</div></div>
  </div>
<script>${rulesJs}</script>
<script>${mockedPopupJs}</script>
</body></html>`;

  await page.setContent(composedHtml, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const out = path.join(OUT_DIR, 'popup-1280x800.png');
  await page.screenshot({ path: out, fullPage: false });
  console.log(`[popup] saved ${out}`);
  await context.close();
}

async function composeAmazonBeforeAfter(beforePath, afterPath) {
  // Use a headless page to composite the two halves with labels.
  // Avoids a PIL dependency; everything runs in playwright.
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const beforeB64 = fs.readFileSync(beforePath).toString('base64');
  const afterB64 = fs.readFileSync(afterPath).toString('base64');

  const html = `<!doctype html><html><head><style>
  html, body { margin:0; padding:0; width:1280px; height:800px; background:#1f2630; font-family:-apple-system, BlinkMacSystemFont, sans-serif; color:#fff; }
  .row { display:flex; width:1280px; height:800px; }
  .col { width:640px; height:800px; position:relative; overflow:hidden; }
  .col img { width:640px; height:800px; object-fit:cover; object-position:top center; display:block; }
  .label {
    position:absolute; top:16px; left:16px;
    background: rgba(0,0,0,0.72); color:#fff;
    padding:6px 12px; border-radius:6px;
    font-size:13px; font-weight:600; letter-spacing:0.04em;
    text-transform:uppercase;
  }
  .after .label { background: rgba(31,138,60,0.92); }
  .divider { position:absolute; top:0; left:640px; width:2px; height:800px; background:#fff; opacity:0.6; }
</style></head><body>
<div class="row">
  <div class="col before"><img src="data:image/png;base64,${beforeB64}"><div class="label">Before</div></div>
  <div class="col after"><img src="data:image/png;base64,${afterB64}"><div class="label">After: sponsored hidden</div></div>
  <div class="divider"></div>
</div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const out = path.join(OUT_DIR, 'amazon-before-after-1280x800.png');
  await page.screenshot({ path: out, fullPage: false });
  console.log(`[amazon] saved ${out}`);

  // Clean up half-images
  fs.unlinkSync(beforePath);
  fs.unlinkSync(afterPath);
  await ctx.close();
  await browser.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const { beforePath, afterPath } = await captureAmazonHalves(browser);
  await capturePopup(browser);
  await browser.close();

  await composeAmazonBeforeAfter(beforePath, afterPath);
})();
