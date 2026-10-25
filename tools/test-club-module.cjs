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

    // 滚动到 #club 区块
    await page.evaluate(() => {
      const c = document.getElementById('club');
      if (c) c.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    // 1. #club区块可见性
    const clubVisible = await page.$eval('#club', el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    });

    // 2. 卡列数：通过子元素位置推断（第一行卡片top相同=同一行=列数）
    const colsByPosition = await page.$$eval('.club-card', els => {
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
    const cardCount = await page.$$eval('.club-card', els => els.length);

    // 4. 4个标题
    const titles = await page.$$eval('.club-card h3', els => els.map(e => e.textContent.trim()));

    // 5. 标签备中 · 尚费文本 必须存在
    const tagPlan = await page.$$eval('.card .tag-plan', els => els.map(e => e.textContent.trim()));

    // 6. 横向无溢出
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const noHOverflow = overflow <= 1;

    // 7. 导航锚点含 #club
    const navHasClub = await page.$$eval('.nav-link', els => els.find(e => e.getAttribute('href') === '#club') !== undefined);

    // 8. 价格不出现
    const priceText = await page.evaluate(() => {
      return document.querySelector('#club').textContent.includes('¥') || document.querySelector('#club').textContent.includes('元');
    });
    const noPrice = !priceText;

    // 9. 价格中不出现
    const register = await page.evaluate(() => {
      return document.querySelector('#club').textContent.includes('注册') || document.querySelector('#club').textContent.includes('订阅');
    });
    const noRegister = !register;

    // 内部区块ID
    const idSecBook = await page.$('#sec-book') ? true : false;
    const idSecRoster = await page.$('#sec-roster') ? true : false;
    const idCourses = await page.$('#courses') ? true : false;
    const idSecAi = await page.$('#sec-ai') ? true : false;

    // Member count
    const memberCount = await page.$$eval('.rc', els => els.length);

    // 期望列数
    let expectedCols;
    if (vp.w > 768) expectedCols = 4;
    else if (vp.w > 479) expectedCols = 2;
    else expectedCols = 1;
    const colsOK = colsByPosition === expectedCols;

    // club-note
    const note = await page.$$eval('.club-note-text', els => els.length > 0);

    console.log(`\n[${vp.label}]`);
    console.log(`  club visible: ${clubVisible ? 'PASS' : 'FAIL'}`);
    console.log(`  grid cols (by position): ${colsByPosition} expected=${expectedCols} ${colsOK ? 'PASS' : 'FAIL'}`);
    console.log(`  card count: ${cardCount} ${cardCount === 4 ? 'PASS' : 'FAIL'}`);
    console.log(`  titles: ${JSON.stringify(titles)}`);
    console.log(`  tag-plan: ${JSON.stringify(tagPlan)}`);
    console.log(`  no h overflow: ${noHOverflow ? 'PASS' : 'FAIL'} (over: ${overflow}px)`);
    console.log(`  nav has club: ${navHasClub ? 'PASS' : 'FAIL'}`);
    console.log(`  no price: ${noPrice ? 'PASS' : 'FAIL'}`);
    console.log(`  no register: ${noRegister ? 'PASS' : 'FAIL'}`);
    console.log(`  existing blocks: book=${!!idSecBook} roster=${!!idSecRoster} courses=${!!idCourses} ai=${!!idSecAi}`);
    console.log(`  member count: ${memberCount} ${memberCount >= 22 ? 'PASS' : 'FAIL'}`);
    console.log(`  club-note present: ${note ? 'PASS' : 'FAIL'}`);

    const vpAllPass = clubVisible
      && colsOK
      && cardCount === 4
      && tagPlan.some(t => t.includes('方案筹备中') && t.includes('尚未收费'))
      && noHOverflow
      && navHasClub
      && noPrice
      && noRegister
      && memberCount >= 22
      && idSecBook && idSecRoster && idCourses && idSecAi
      && note;
    if (!vpAllPass) allPass = false;

    console.log(`  OVERALL: ${vpAllPass ? 'PASS' : 'FAIL'}`);
    await page.close();
  }

  // verify mobile drawer contains club link
  console.log('\nverify mobile drawer contains club link');
  const drawerPage = await browser.newPage();
  await drawerPage.setViewportSize({ width: 375, height: 812 });
  await drawerPage.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
  await drawerPage.waitForTimeout(500);
  await drawerPage.click('#navToggle');
  await drawerPage.waitForTimeout(300);
  const drawerHasClub = await drawerPage.$$eval('.nav-drawer a', els => els.find(e => e.textContent.includes('会员俱乐部')) !== undefined);
  console.log(`  drawer has '会员俱乐部': ${drawerHasClub ? 'PASS' : 'FAIL'}`);
  await drawerPage.close();

  // verify 8-min carousel still works
  console.log('\nverify carousel still works');
  const carouselPage = await browser.newPage();
  await carouselPage.setViewportSize({ width: 1280, height: 800 });
  await carouselPage.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
  await carouselPage.waitForTimeout(500);
  const carouselExists = await carouselPage.$('.carousel') ? true : false;
  const slideCount = await carouselPage.$$eval('.carousel .slide', els => els.length).catch(() => 0);
  console.log(`  carousel exists: ${carouselExists ? 'PASS' : 'FAIL'}`);
  console.log(`  slide count: ${slideCount}`);
  await carouselPage.close();

  // verify 3 modals still exist
  console.log('\nverify 3 modals still exist');
  const modalPage = await browser.newPage();
  await modalPage.setViewportSize({ width: 1280, height: 800 });
  await modalPage.goto('file:///d:/AI%E6%8C%87%E6%8C%A5%E5%AE%98-%E7%BD%91%E7%AB%99/index.html', { waitUntil: 'load' });
  await modalPage.waitForTimeout(500);
  const modalCount = await modalPage.$$eval('.modal', els => els.length);
  console.log(`  modal count: ${modalCount} ${modalCount === 3 ? 'PASS' : 'FAIL'}`);
  await modalPage.close();

  const finalPass = allPass && drawerHasClub && modalCount === 3;
  console.log(`\n==== OVERALL TEST: ${finalPass ? 'PASS' : 'FAIL'} ====`);
  if (!finalPass) process.exit(1);

  await browser.close();
  process.exit(0);
})();
