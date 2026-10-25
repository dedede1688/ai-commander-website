import { chromium } from 'playwright';
import { setTimeout as sleep } from 'timers/promises';

const PORT = 8767;
const BASE = `http://127.0.0.1:${PORT}`;
// server is started externally before running this script
await sleep(1500);

const browser = await chromium.launch({ headless: true });
const log = [];
const ok = (n, c, extra = '') => log.push(`${c ? 'PASS' : 'FAIL'} · ${n}${extra ? ' — ' + extra : ''}`);

// ===================== TEST 1: 320x700 drawer =====================
const ctx320 = await browser.newContext({ viewport: { width: 320, height: 700 } });
const p320 = await ctx320.newPage();
await p320.goto(BASE + '/index.html', { waitUntil: 'networkidle' });

const hamb_vis = await p320.evaluate(() => {
  const t = document.querySelector('.menu-toggle');
  return t && getComputedStyle(t).display !== 'none';
});
ok('320px: hamburger visible', hamb_vis);

const drawer_hidden_0 = await p320.evaluate(() => document.querySelector('#navDrawer').hidden);
ok('320px: drawer initially hidden', drawer_hidden_0 === true);

await p320.click('#navToggle');
await sleep(400);
const drawer_hidden_1 = await p320.evaluate(() => document.querySelector('#navDrawer').hidden);
ok('320px: drawer opens on click', drawer_hidden_1 === false);

const link_count = await p320.evaluate(() => document.querySelectorAll('.nav-drawer-inner a').length);
ok('320px: drawer has 7 links', link_count === 7, `got ${link_count}`);

const link_texts = await p320.evaluate(() =>
  [...document.querySelectorAll('.nav-drawer-inner a')].map(a => a.textContent.trim())
);
const expected = ['关于本书', '指挥官军团', '共建指数', '四级荣誉', 'AI 模型', '先锋营', 'AI 大礼包'];
ok('320px: link texts match', JSON.stringify(link_texts) === JSON.stringify(expected), link_texts.join(','));

const overflow_x = await p320.evaluate(() => {
  const drawer = document.querySelector('.nav-drawer');
  return { scrollW: drawer.scrollWidth, clientW: drawer.clientWidth };
});
ok('320px: drawer no horizontal overflow', overflow_x.scrollW <= overflow_x.clientW + 1,
   `scrollW=${overflow_x.scrollW} clientW=${overflow_x.clientW}`);

const body_overflow = await p320.evaluate(() => document.body.style.overflow);
ok('320px: body scroll locked', body_overflow === 'hidden');

await p320.click('#navBackdrop');
await sleep(400);
const drawer_hidden_2 = await p320.evaluate(() => document.querySelector('#navDrawer').hidden);
ok('320px: backdrop closes drawer', drawer_hidden_2 === true);

await p320.screenshot({ path: 'tools/shot-320-drawer.png' });
await ctx320.close();

// ===================== TEST 2: 375 focus trap =====================
const ctx375 = await browser.newContext({ viewport: { width: 375, height: 812 } });
const p375 = await ctx375.newPage();
await p375.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
await p375.click('#navToggle');
await sleep(400);

const focusSeq = [];
for (let i = 0; i < 9; i++) {
  await p375.keyboard.press('Tab');
  await sleep(150);
  const f = await p375.evaluate(() => {
    const el = document.activeElement;
    if (!el) return '<null>';
    if (el.id === 'navToggle') return '<navToggle>';
    if (el.matches('.nav-drawer-inner a')) return 'a:' + el.textContent.trim();
    return '<outside:' + el.tagName + '.' + (el.className || '').slice(0, 20) + '>';
  });
  focusSeq.push(f);
}
const trapped = focusSeq.every(s => s.startsWith('a:') || s === '<navToggle>');
ok('375px: Tab focus trapped in drawer toggle+links', trapped, focusSeq.join(' << '));

const backSeq = [];
for (let i = 0; i < 9; i++) {
  await p375.keyboard.press('Shift+Tab');
  await sleep(150);
  const f = await p375.evaluate(() => {
    const el = document.activeElement;
    if (!el) return '<null>';
    if (el.id === 'navToggle') return '<navToggle>';
    if (el.matches('.nav-drawer-inner a')) return 'a:' + el.textContent.trim();
    return '<outside:' + el.tagName + '.' + (el.className || '').slice(0, 20) + '>';
  });
  backSeq.push(f);
}
const backTrapped = backSeq.every(s => s.startsWith('a:') || s === '<navToggle>');
ok('375px: Shift+Tab focus trapped in drawer', backTrapped, backSeq.join(' >> '));

const scrollLocked = await p375.evaluate(() => document.body.style.overflow === 'hidden');
ok('375px: body still locked during Tab navigation', scrollLocked);

await ctx375.close();

// ===================== TEST 3: 375 → 1280 reset =====================
const ctxReset = await browser.newContext({ viewport: { width: 375, height: 812 } });
const pR = await ctxReset.newPage();
await pR.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
await pR.click('#navToggle');
await sleep(400);
const openBefore = await pR.evaluate(() => document.querySelector('#navDrawer').hidden);
ok('pre-resize: drawer open at 375', openBefore === false);

await pR.setViewportSize({ width: 1280, height: 900 });
await sleep(400);

const stateAfterResize = await pR.evaluate(() => {
  const drawer = document.querySelector('#navDrawer');
  const backdrop = document.querySelector('#navBackdrop');
  const navLinks = document.querySelector('.nav-links');
  const toggle = document.querySelector('.menu-toggle');
  return {
    drawerHidden: drawer.hidden,
    backdropHidden: backdrop.hidden,
    toggleDisplay: getComputedStyle(toggle).display,
    navLinksDisplay: getComputedStyle(navLinks).display,
    bodyOverflow: document.body.style.overflow,
  };
});
ok('post-resize(1280): toggle hidden', stateAfterResize.toggleDisplay === 'none', JSON.stringify(stateAfterResize));
ok('post-resize(1280): nav-links visible', stateAfterResize.navLinksDisplay === 'flex', `got ${stateAfterResize.navLinksDisplay}`);

await ctxReset.close();

await browser.close();

console.log('\n============ Phase 1B-1 补充测试 ==========');
for (const l of log) console.log(l);
const failed = log.filter(l => l.startsWith('FAIL'));
console.log('---------------------------------------------');
console.log(`TOTAL: ${log.length}  PASS: ${log.length - failed.length}  FAIL: ${failed.length}`);
if (failed.length) { console.log('FAILURES:'); failed.forEach(f => console.log('  - ' + f)); process.exit(1); }
