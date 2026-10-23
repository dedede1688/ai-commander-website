const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
assert.ok(fs.existsSync(path.join(root, 'builders.html')), '正式共建者中心应存在');
const {members, groups} = require('../member-data.js');
const center = read('builders.html');
assert.equal(members.length, 23);
assert.equal(groups.length, 9);
assert.equal(new Set(members.map(m => m.slug)).size, 23, '个人网址唯一');
assert.equal(new Set(members.map(m => m.seat)).size, 23, '席位唯一');
assert.equal(fs.readdirSync(root).filter(f => /^member-.*\.html$/.test(f)).length, members.length, '成员文件与资料一一对应');
assert.equal((center.match(/data-member-card/g) || []).length, 23);
assert.ok(!/previews\/|noindex|<base /i.test(center), '正式中心不得残留预览配置');
const files = ['builders.html'];
for (const m of members) {
  const file = `member-${m.slug}.html`;
  files.push(file);
  const html = read(file);
  assert.ok(html.includes(esc(m.bio)), `${m.name} 简介必须完整保留`);
  assert.ok(html.includes(`src="${m.photo}"`), `${m.name} 原照片必须保留`);
  assert.ok(html.includes(`素材/二维码/成员/qr-${m.slug}.png`), `${m.name} 主页分享码必须保留`);
  assert.ok(html.includes(`rel="canonical" href="https://www.ai-mmc.cn/${file}"`));
  for (const property of ['og:title','og:description','og:url','og:image']) assert.ok(html.includes(`property="${property}"`), `${m.name} 分享信息齐全`);
  const personSchema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(personSchema.name, m.name);
  assert.equal(personSchema.description, m.bio);
  assert.equal(personSchema.url, `https://www.ai-mmc.cn/${file}`);
  assert.ok(html.includes(`data-copy-url="https://www.ai-mmc.cn/${file}"`));
  assert.ok(html.includes('href="builders.html#members"'));
  assert.ok(html.includes('href="book.html"'));
  assert.ok(!/本地预览|成员页样板|未上市|P_V13|previews\/|<base /i.test(html));
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.ok(!('lv' in m) && !('phone' in m) && !('wechat' in m), '公开成员数据不包含评价或私人联系字段');
  assert.equal(groups.filter(g => g.members.includes(m.name)).length, 1, `${m.name} 分组唯一`);
  assert.ok(groups.find(g => g.name === m.group)?.members.includes(m.name), `${m.name} 分组口径一致`);
}
for (const file of files) {
  const html = read(file);
  assert.ok(!/href="(?:tel:|mailto:)|weixin:\/\/|\b1[3-9]\d{9}\b/.test(html), '不公开私人联系数据');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${file} 标识符不重复`);
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:)/.test(ref)) continue;
    const [filePart, hash] = ref.split('#');
    const target = (filePart || file).split('?')[0];
    assert.ok(fs.existsSync(path.join(root, target)), `${file}: 缺少文件 ${ref}`);
    if (hash && target.endsWith('.html')) assert.ok(read(target).includes(`id="${hash}"`), `${file}: 无效锚点 ${ref}`);
  }
}
assert.ok(read('shared.js').includes('{ file: "builders.html", key: "builders", text: "共建者" }'));
assert.ok(read('index.html').includes('href="builders.html#members"'));
assert.ok(read('sitemap.xml').includes('https://www.ai-mmc.cn/builders.html</loc>'));
/* 历史资料页已不再承载成员名录：按现页面实际功能检查脚本与入口，
   不再沿用旧页的「member-data 先于 script 加载」顺序断言。 */
const entryPage = read('explore.html');
assert.ok(!/src="(?:script|member-data)\.js/.test(entryPage), '历史资料页不再加载成员名录脚本');
assert.ok(entryPage.indexOf('src="shared.js') > entryPage.indexOf('</main>'), '历史资料页共享脚本应在正文之后加载');
assert.ok(entryPage.includes('builders.html#members') && entryPage.includes('builders.html#structure'), '历史资料页应指向成员名录与行业分组');
console.log('PASS: 共建者中心、23个成员页、单一数据源、原资料与分享码、入口/返回、元数据和公开边界');
