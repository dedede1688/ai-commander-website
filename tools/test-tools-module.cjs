const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const viewports = [
    { w: 1280, h: 800, label: 'desktop 1280' },
    { w: 768, h: 1024, label: 'tablet 768' },
    { w: 375, h: 812, label: 'phone 375' },
    { w: 320, h: 568, label: 'phone 320' },
  ];
  let allPass = true;

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    // 滚动到 #tools 区块
    await page.evaluate(() => {
      const t = document.getElementById('tools');
      if (t) t.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    // 1. #tools区块可见性
    const toolsVisible = await page.$eval('#tools', el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    });

    // 2. 卡列数：通过子元素位置推断
    const colsByPosition = await page.$$eval('.tool-card', els => {
      if (els.length === 0) return 0;
      const firstTop = els[0].getBoundingClientRect().top;
      let count = 0;
      for (const el of els) {
        if (Math.abs(el.getBoundingClientRect().top - firstTop) < 2) count++;
        else break;
      }
      return count;
    });

    // 3. 4张卡
    const cardCount = await page.$$eval('.tool-card', els => els.length);

    // 4. 4个标题
    const titles = await page.$$eval('.tool-card h3', els => els.map(e => e.textContent.trim()));

    // 5. 标签文本：3个"规划" + 1个"已上线"
    const tagPlan = await page.$$eval('#tools .tag-plan', els => els.map(e => e.textContent.trim()));
    const tagOnline = await page.$$eval('#tools .tag-online', els => els.map(e => e.textContent.trim()));

    // 6. 横向无溢出
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const noHOverflow = overflow <= 1;

    // 7. 导航锚点含 #tools
    const navHasTools = await page.$$eval('.nav-link', els => els.find(e => e.getAttribute('href') === '#tools') !== undefined);

    // 8. 规划卡无价格
    const planCards = await page.$$eval('#tools .tool-plan', els => {
      return els.every(el => {
        const txt = el.textContent;
        return !txt.includes('¥') && !txt.includes('元') && !txt.includes('注册') && !txt.includes('订阅');
      });
    });

    // 9. 已上线卡链接models.html
    const modelsLink = await page.$$eval('#tools .tool-online a', els => {
      return els.length === 1 && els[0].getAttribute('href') === 'models.html';
    });

    // 10. #sec-ai 仍在
    const secAiExists = await page.$('#sec-ai') ? true : false;

    // 11. #club 仍在
    const clubExists = await page.$('#club') ? true : false;

    // 12. 成员数
    const memberCount = await page.$$eval('.rc', els => els.length);

    // 13. 弹窗数
    const modalCount = await page.$$eval('.modal', els => els.length);

    // 14. #tools-note
    const toolsNote = await page.$$eval('.tools-note-text', els => els.length > 0);

    // 期望列数
    let expectedCols;
    if (vp.w > 768) expectedCols = 4;
    else if (vp.w > 479) expectedCols = 2;
    else expectedCols = 1;
    const colsOK = colsByPosition === expectedCols;

    console.log(`\n[${vp.label}]`);
    console.log(`  tools visible: ${toolsVisible ? 'PASS' : 'FAIL'}`);
    console.log(`  grid cols: ${colsByPosition} expected=${expectedCols} ${colsOK ? 'PASS' : 'FAIL'}`);
    console.log(`  card count: ${cardCount} ${cardCount === 4 ? 'PASS' : 'FAIL'}`);
    console.log(`  titles: ${JSON.stringify(titles)}`);
    console.log(`  tag-plan count: ${tagPlan.length} ${tagPlan.length === 3 ? 'PASS' : 'FAIL'}`);
    console.log(`  tag-online count: ${tagOnline.length} ${tagOnline.length === 1 ? 'PASS' : 'FAIL'}`);
    console.log(`  no h overflow: ${noHOverflow ? 'PASS' : 'FAIL'} (over: ${overflow}px)`);
    console.log(`  nav has tools: ${navHasTools ? 'PASS' : 'FAIL'}`);
    console.log(`  plan cards no price: ${planCards ? 'PASS' : 'FAIL'}`);
    console.log(`  models link correct: ${modelsLink ? 'PASS' : 'FAIL'}`);
    console.log(`  #sec-ai still exists: ${secAiExists ? 'PASS' : 'FAIL'}`);
    console.log(`  #club still exists: ${clubExists ? 'PASS' : 'FAIL'}`);
    console.log(`  member count: ${memberCount} ${memberCount >= 22 ? 'PASS' : 'FAIL'}`);
    console.log(`  modal count: ${modalCount} ${modalCount === 3 ? 'PASS' : 'FAIL'}`);
    console.log(`  tools-note present: ${toolsNote ? 'PASS' : 'FAIL'}`);

    const vpAllPass = toolsVisible
      && colsOK
      && cardCount === 4
      && tagPlan.length === 3
      && tagOnline.length === 1
      && noHOverflow
      && navHasTools
      && planCards
      && modelsLink
      && secAiExists
      && clubExists
      && memberCount >= 22
      && modalCount === 3
      && toolsNote;
    if (!vpAllPass) allPass = false;

    console.log(`  OVERALL: ${vpAllPass ? 'PASS' : 'FAIL'}`);
    await page.close();
  }

  // verify mobile drawer contains tools link
  console.log('\nverify mobile drawer contains AI工具 link');
  const drawerPage = await browser.newPage();
  await drawerPage.setViewportSize({ width: 375, height: 812 });
  await drawerPage.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
  await drawerPage.waitForTimeout(500);
  await drawerPage.click('#navToggle');
  await drawerPage.waitForTimeout(300);
  const drawerHasTools = await drawerPage.$$eval('.nav-drawer a', els => els.find(e => e.textContent.includes('AI 工具')) !== undefined);
  console.log(`  drawer has 'AI 工具': ${drawerHasTools ? 'PASS' : 'FAIL'}`);
  await drawerPage.close();

  // verify models.html is accessible
  console.log('\nverify models.html link works');
  const linkPage = await browser.newPage();
  await linkPage.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
  await linkPage.waitForTimeout(500);
  await linkPage.evaluate(() => {
    const t = document.getElementById('tools');
    if (t) t.scrollIntoView({ behavior: 'instant' });
  });
  await linkPage.waitForTimeout(300);
  const href = await linkPage.$eval('#tools .tool-online a', el => el.getAttribute('href'));
  await linkPage.click('#tools .tool-online a');
  await linkPage.waitForTimeout(500);
  const modelsLoaded = await linkPage.evaluate(() => document.title.length > 0);
  console.log(`  href value: ${href}`);
  console.log(`  models.html loaded: ${modelsLoaded ? 'PASS' : 'FAIL'}`);
  await linkPage.close();

  const finalPass = allPass && drawerHasTools && modelsLoaded;
  console.log(`\n==== OVERALL TEST: ${finalPass ? 'PASS' : 'FAIL'} ====`);
  if (!finalPass) process.exit(1);

  await browser.close();
  process.exit(0);
})();
