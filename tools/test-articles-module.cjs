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

    // 滚动到 #articles 区块
    await page.evaluate(() => {
      const a = document.getElementById('articles');
      if (a) a.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    // 1. #articles区块可见性
    const articlesVisible = await page.$eval('#articles', el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    });

    // 2. 卡列数：通过子元素位置推断
    const colsByPosition = await page.$$eval('.article-card', els => {
      if (els.length === 0) return 0;
      const firstTop = els[0].getBoundingClientRect().top;
      let count = 0;
      for (const el of els) {
        if (Math.abs(el.getBoundingClientRect().top - firstTop) < 2) count++;
        else break;
      }
      return count;
    });

    // 3. 3张卡
    const cardCount = await page.$$eval('.article-card', els => els.length);

    // 4. 3个标题
    const titles = await page.$$eval('.article-card h3', els => els.map(e => e.textContent.trim()));

    // 5. tag-plan 文案
    const tagPlan = await page.$$eval('#articles .tag-plan', els => els.map(e => e.textContent.trim()));

    // 6. article-tag 全部是"栏目规划"
    const articleTags = await page.$$eval('#articles .article-tag', els => els.map(e => e.textContent.trim()));
    const allPlanTags = articleTags.every(t => t === '栏目规划');

    // 7. 横向无溢出
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const noHOverflow = overflow <= 1;

    // 8. 导航锚点含 #articles
    const navHasArticles = await page.$$eval('.nav-link', els => els.find(e => e.getAttribute('href') === '#articles') !== undefined);

    // 9. 无虚构数据
    const noFakeData = await page.evaluate(() => {
      const el = document.getElementById('articles');
      const txt = el.textContent;
      // 不允许阅读量数字（如 1.2万、1000+）、发布日期格式
      const hasReadCount = /\d+[万\+]/.test(txt);
      const hasDate = /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/.test(txt);
      const hasViewBtn = txt.includes('查看文章') || txt.includes('阅读全文');
      return !hasReadCount && !hasDate && !hasViewBtn;
    });

    // 10. 既有锚点
    const allAnchors = await page.evaluate(() => {
      return {
        secBook: !!document.getElementById('sec-book'),
        secRoster: !!document.getElementById('sec-roster'),
        courses: !!document.getElementById('courses'),
        club: !!document.getElementById('club'),
        tools: !!document.getElementById('tools'),
        secAi: !!document.getElementById('sec-ai'),
        secHonor: !!document.getElementById('sec-honor'),
      };
    });

    // 11. 成员数
    const memberCount = await page.$$eval('.rc', els => els.length);

    // 12. 弹窗数
    const modalCount = await page.$$eval('.modal', els => els.length);

    // 13. article-note
    const articleNote = await page.$$eval('.article-note-text', els => els.length > 0);

    // 期望列数
    let expectedCols;
    if (vp.w > 768) expectedCols = 3;
    else if (vp.w > 479) expectedCols = 2;
    else expectedCols = 1;
    const colsOK = colsByPosition === expectedCols;

    console.log(`\n[${vp.label}]`);
    console.log(`  articles visible: ${articlesVisible ? 'PASS' : 'FAIL'}`);
    console.log(`  grid cols: ${colsByPosition} expected=${expectedCols} ${colsOK ? 'PASS' : 'FAIL'}`);
    console.log(`  card count: ${cardCount} ${cardCount === 3 ? 'PASS' : 'FAIL'}`);
    console.log(`  titles: ${JSON.stringify(titles)}`);
    console.log(`  tag-plan: ${JSON.stringify(tagPlan)}`);
    console.log(`  all article-tag='栏目规划': ${allPlanTags ? 'PASS' : 'FAIL'} (${JSON.stringify(articleTags)})`);
    console.log(`  no h overflow: ${noHOverflow ? 'PASS' : 'FAIL'} (over: ${overflow}px)`);
    console.log(`  nav has articles: ${navHasArticles ? 'PASS' : 'FAIL'}`);
    console.log(`  no fake data: ${noFakeData ? 'PASS' : 'FAIL'}`);
    console.log(`  existing anchors: ${Object.entries(allAnchors).map(([k,v]) => `${k}=${v?'T':'F'}`).join(' ')}`);
    console.log(`  member count: ${memberCount} ${memberCount >= 22 ? 'PASS' : 'FAIL'}`);
    console.log(`  modal count: ${modalCount} ${modalCount === 3 ? 'PASS' : 'FAIL'}`);
    console.log(`  article-note present: ${articleNote ? 'PASS' : 'FAIL'}`);

    const vpAllPass = articlesVisible
      && colsOK
      && cardCount === 3
      && tagPlan.some(t => t.includes('栏目规划') && t.includes('内容筹备中'))
      && allPlanTags
      && noHOverflow
      && navHasArticles
      && noFakeData
      && allAnchors.secBook && allAnchors.secRoster && allAnchors.courses && allAnchors.club && allAnchors.tools && allAnchors.secAi && allAnchors.secHonor
      && memberCount >= 22
      && modalCount === 3
      && articleNote;
    if (!vpAllPass) allPass = false;

    console.log(`  OVERALL: ${vpAllPass ? 'PASS' : 'FAIL'}`);
    await page.close();
  }

  // verify mobile drawer contains articles link
  console.log('\nverify mobile drawer contains 知识中心 link');
  const drawerPage = await browser.newPage();
  await drawerPage.setViewportSize({ width: 375, height: 812 });
  await drawerPage.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
  await drawerPage.waitForTimeout(500);
  await drawerPage.click('#navToggle');
  await drawerPage.waitForTimeout(300);
  const drawerHasArticles = await drawerPage.$$eval('.nav-drawer a', els => els.find(e => e.textContent.includes('知识中心')) !== undefined);
  console.log(`  drawer has '知识中心': ${drawerHasArticles ? 'PASS' : 'FAIL'}`);
  await drawerPage.close();

  const finalPass = allPass && drawerHasArticles;
  console.log(`\n==== OVERALL TEST: ${finalPass ? 'PASS' : 'FAIL'} ====`);
  if (!finalPass) process.exit(1);

  await browser.close();
  process.exit(0);
})();
