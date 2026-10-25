const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const shotDir = path.join(root, '_final_verify', 'contact-pages-20261025');
fs.mkdirSync(shotDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const results = [];
  try {
    for (const pageName of ['cooperate', 'enterprise']) {
      for (const mode of [
        { name: 'desktop', viewport: { width: 1365, height: 900 } },
        { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
      ]) {
        const context = await browser.newContext({ viewport: mode.viewport, isMobile: Boolean(mode.isMobile) });
        const page = await context.newPage();
        const response = await page.goto(`http://127.0.0.1:8767/${pageName}.html#contact`, { waitUntil: 'networkidle' });
        if (!response || !response.ok()) throw new Error(`${pageName} ${mode.name} 页面加载失败`);
        const block = page.locator('[data-public-contact]');
        await block.waitFor({ state: 'visible' });
        const phone = await block.locator('a[href^="tel:"]').getAttribute('href');
        const email = await block.locator('a[href^="mailto:"]').getAttribute('href');
        const state = await page.evaluate(() => {
          const block = document.querySelector('[data-public-contact]');
          const image = block.querySelector('img');
          return {
            imageLoaded: image.complete && image.naturalWidth === 684 && image.naturalHeight === 684,
            documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            blockOverflow: block.scrollWidth > block.clientWidth,
            columns: getComputedStyle(block).gridTemplateColumns,
          };
        });
        if (phone !== 'tel:18566793066') throw new Error(`${pageName} ${mode.name} 电话链接错误`);
        if (email !== 'mailto:381901944@qq.com') throw new Error(`${pageName} ${mode.name} 邮箱链接错误`);
        if (!state.imageLoaded) throw new Error(`${pageName} ${mode.name} 二维码未正确加载`);
        if (state.documentOverflow || state.blockOverflow) throw new Error(`${pageName} ${mode.name} 存在横向溢出`);
        const screenshot = path.join(shotDir, `${pageName}-${mode.name}.png`);
        await block.screenshot({ path: screenshot });
        results.push({ pageName, mode: mode.name, phone, email, ...state, screenshot });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
