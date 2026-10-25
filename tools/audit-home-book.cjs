const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const home = read('index.html');
assert.ok(fs.existsSync(path.join(root, 'book.html')), '图书详情页必须存在');
const book = read('book.html');

/* 旧资料页已精简为历史说明页，八篇正文保全改用固定归档对照。
   归档文件只入仓库、不进发布包；哈希固定后，任何人改动归档都会在这里报错。 */
const ARCHIVE = 'docs/archive/2026-10-22-explore-legacy.html';
const ARCHIVE_SHA256 = 'A86EA3DDD5CB67674F250999B4D49AD710CBAE95C914F60A32C95328EFA831F9';
assert.ok(fs.existsSync(path.join(root, ARCHIVE)), '旧资料页归档必须存在：' + ARCHIVE);
const archiveBytes = fs.readFileSync(path.join(root, ARCHIVE));
assert.equal(
  crypto.createHash('sha256').update(archiveBytes).digest('hex').toUpperCase(),
  ARCHIVE_SHA256,
  '归档文件须保持逐字节不变',
);
const original = archiveBytes.toString('utf8');
assert.equal((home.match(/data-home-section=/g) || []).length, 8, '首页应为八屏');
assert.equal((book.match(/data-book-section=/g) || []).length, 10, '图书页应为十屏');
assert.equal((book.match(/<details class="bk2-chap"/g) || []).length, 8);
assert.ok(book.includes('id="army"'), '八篇目录之后应有军团展示入口');
assert.equal((book.match(/data-army-unit="model"/g) || []).length, 2, '按书稿展示两大主力模型家族');
assert.equal((book.match(/data-army-unit="specialist"/g) || []).length, 4, '展示图像、视频、语音和自动化四类特种兵');
for (const id of ['part-04', 'part-06']) assert.ok(book.includes(`id="${id}"`), '卡片能跳至实际所属篇章');
const bodies = text => [...text.matchAll(/<div class="bk2-chap-body">([\s\S]*?)<\/div>/g)].map(m => m[1].trim());
assert.deepEqual(bodies(book), bodies(original), '八篇完整正文不得在迁移时丢失');
for (const [name, html] of [['index.html', home], ['book.html', book], ['outcomes.html', read('outcomes.html')], ['enterprise.html', read('enterprise.html')], ['learning.html', read('learning.html')], ['cooperate.html', read('cooperate.html')], ['xianfeng.html', read('xianfeng.html')]]) {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${name} 仅一个主标题`);
  assert.ok(html.includes('<main'), `${name} 有主体语义`);
  if (name !== 'enterprise.html') assert.ok(html.includes('AI指挥官-立体书.webp'), '使用原书影');
  assert.ok(!/HK\s*316|HK31269|首发资质版|P_V13|剩余\s*7\s*席|12亿元|200\s*位/.test(html), `${name} 不公开未核实口径`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(match[1]);
    const books = (data['@graph'] || [data]).filter(n => n['@type'] === 'Book');
    books.forEach(b => assert.equal(b.numberOfPages, 378));
  }
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:)/.test(raw)) continue;
    const [file, hash] = raw.split('#');
    const target = (file || name).split('?')[0];
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(target))), `${name}: 文件不存在 ${raw}`);
    if (hash && target.endsWith('.html')) {
      assert.ok(read(target).includes(`id="${hash}"`), `${name}: 锚点不存在 ${raw}`);
    }
  }
}
assert.ok(home.includes('研发完成') && home.includes('尚未上线'));
assert.ok(book.includes('20 余年') && book.includes('首席运营官'));
assert.equal((book.match(/class="reading-route"/g) || []).length, 6);
assert.ok(read('sitemap.xml').includes('/book.html</loc>'));
assert.ok(read('sitemap.xml').includes('/outcomes.html</loc>'));
assert.ok(home.includes('href="outcomes.html"'));
assert.ok(read('shared.js').includes('{ file: "outcomes.html", key: "outcomes", text: "成果" }'));
assert.ok(!/previews\/|noindex|本地预览|<base /.test(read('outcomes.html')), '成果页无预览残留');
assert.ok(read('outcomes.html').includes('官网开放时间待定'));
assert.ok(read('sitemap.xml').includes('/enterprise.html</loc>'));
assert.ok(home.includes('href="enterprise.html"'));
assert.ok(read('shared.js').includes('{ file: "enterprise.html", key: "enterprise", text: "企业服务" }'));
assert.ok(!/previews\/|noindex|本地预览|<base /.test(read('enterprise.html')), '企业页无预览残留');
assert.ok(read('enterprise.html').includes('项目规划 · 待样板验证'));
assert.ok(read('sitemap.xml').includes('/learning.html</loc>'));
assert.ok(home.includes('href="learning.html#courses"'));
assert.ok(read('shared.js').includes('{ file: "learning.html", key: "learning", text: "学习与工具" }'));
assert.ok(!/previews\/|noindex|本地预览|<base /.test(read('learning.html')), '学习页无预览残留');
assert.ok(read('learning.html').includes('课程规划 · 尚未上线'));
assert.ok(read('learning.html').includes('原站已有的三个主题示例'));
assert.ok(read('sitemap.xml').includes('/cooperate.html</loc>'));
assert.ok(home.includes('href="cooperate.html"'));
assert.ok(read('shared.js').includes('{ file: "cooperate.html", key: "cooperate", text: "合作共建" }'));
assert.ok(!/previews\/|noindex|本地预览|<base /.test(read('cooperate.html')), '合作页无预览残留');
assert.equal((read('cooperate.html').match(/class="cooperation-path"/g) || []).length, 3);
/* 先锋券页：内容口径、链接与弹窗可访问性（2026-10-22 修正后纳入检查） */
const xianfeng = read('xianfeng.html');
assert.ok(!/30\s*章/.test(xianfeng), '先锋券页不得再写 30 章');
assert.ok(xianfeng.includes('31 章'), '先锋券页按 31 章口径');
assert.ok(
  xianfeng.includes('第 1–3 章') && xianfeng.includes('第 4–6 章') && xianfeng.includes('第 7–8 章'),
  '先锋券页前三篇章号范围应与目录一致',
);
assert.ok(!/V9|V13/.test(xianfeng), '先锋券页不得公开内部版本演进名');
assert.ok(!/十余年/.test(xianfeng), '先锋券页沿用已确认的 20 余年口径');
assert.ok(
  /class="qr-close"/.test(xianfeng) && /role="dialog"[\s\S]{0,80}aria-modal="true"/.test(xianfeng),
  '先锋券页二维码弹窗应有对话框语义与关闭按钮',
);
assert.ok(!/index\.html#sec-book/.test(xianfeng), '先锋券页图书入口应直链 book.html');
assert.ok(!/localStorage\.(?:get|set|remove)Item/.test(read('xianfeng.js')), '领取入口不得在本机记录或伪造领取次数');

/* 先锋券已确认口径：先领券，再凭券 98 元包邮购买 */
for (const required of [
  '凭券 98 元包邮',
  '2026 年 10 月 31 日 24:00',
  '每人限领 1 张',
  '付款后 48 小时内发货',
  '7 天无理由退货',
  '破损免费补寄',
]) {
  assert.ok(xianfeng.includes(required), '先锋券页缺少已确认规则：' + required);
}
for (const stale of ['试读', '收藏卡', '签名', '早读', '首发', '30 位持券人', '永远', '0成本', '锁定席位', '发完']) {
  assert.ok(!xianfeng.includes(stale), '先锋券页不得残留旧口径：' + stale);
}
const xianfengLd = [...xianfeng.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
assert.ok(xianfengLd.some((item) => item['@type'] === 'WebPage'), '先锋券页结构化数据应按活动说明页表达');
const xianfengLdText = JSON.stringify(xianfengLd);
assert.ok(!/"price"|"validFrom"|"CouponCode"|"itemOffered"/.test(xianfengLdText), '先锋券页结构化数据不得含未经确认的价格或券结构');
assert.ok(!/data-xf-trial|trialUrl/.test(xianfeng + read('xianfeng.js')), '试读入口与配置应已删除');
assert.ok(!read('sitemap.xml').includes('/explore.html</loc>'), '原站资料页不参与搜索收录');

/* 历史资料页：只保留说明与入口（2026-10-22 精简为方案 C） */
const explore = read('explore.html');
assert.ok(/<meta name="robots" content="noindex, follow"/.test(explore), '历史资料页应保持 noindex');
assert.ok(explore.includes('id="sec-intro"') && explore.includes('id="sec-ai"'), '旧导语与共建指数入口应有承接说明');
for (const legacy of ['版本：V2', '200 位', '39.1%', '7.5 折', '15%', '版权局', '终身 AI 顾问', '席位告急', '剩余 7 席', '第 5 章', '55 条书签']) {
  assert.ok(!explore.includes(legacy), '历史资料页不得重新公开：' + legacy);
}
assert.ok(!/src="(?:script|member-data)\.js/.test(explore), '历史资料页不再加载成员名录脚本');
for (const target of ['book.html', 'builders.html#members', 'builders.html#structure', 'learning.html#courses', 'enterprise.html#contact']) {
  assert.ok(explore.includes(target), '历史资料页缺少现行入口：' + target);
}
for (const f of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  assert.ok(!read(f).includes('docs/archive'), `${f}: 正式页面不得链接归档文件`);
}
assert.ok(!home.includes('src="script.js'), '精简首页不加载旧名录的整页脚本');
for (const file of fs.readdirSync(root).filter(f => /^member-.*\.html$/.test(f))) {
  assert.ok(/class="action mp-back" href="builders.html#members"/.test(read(file)), `${file}: 返回入口应直达完整名录`);
}
const source = read('script.js');
const restoration = source.slice(source.indexOf('/* ===== 记住滚动位置'), source.indexOf('/* ===== 全站弹窗频控'));
const scrollCalls = [];
require('node:vm').runInNewContext(restoration, {
  window: {addEventListener() {}, scrollTo(...args) { scrollCalls.push(args); }},
  sessionStorage: {getItem() { return '8000'; }}, history: {scrollRestoration: 'auto'},
  location: {hash: '#sec-roster'}, performance: {getEntriesByType() {return [{type: 'navigate'}];}},
});
assert.equal(scrollCalls.length, 0, '明确锚点导航不得被旧滚动位置覆盖');
console.log('PASS: 首页八屏、图书十屏、八篇正文、六条路线、先锋券口径、事实口径、全部静态链接和站点地图');
