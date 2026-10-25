/* 发布前核对：正式域名、分享信息、站点地图、二维码引用。
   只读本地文件，不访问线上；不修改任何页面。 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(root, f));
const SITE = 'https://www.ai-mmc.cn';

const problems = [];
const fail = (message) => problems.push(message);

/* ---------- 1. 域名与站点文件 ---------- */
assert.equal(read('CNAME').trim(), 'www.ai-mmc.cn', 'CNAME 应指向 www.ai-mmc.cn');
const robots = read('robots.txt');
if (!robots.includes('Sitemap: ' + SITE + '/sitemap.xml')) fail('robots.txt 缺少站点地图地址');
if (!/User-agent:\s*\*/i.test(robots)) fail('robots.txt 缺少 User-agent');

/* ---------- 2. 站点地图 ---------- */
const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (new Set(locs).size !== locs.length) fail('站点地图存在重复地址');
if (locs.length !== 32) fail('站点地图条数应为 32，实际 ' + locs.length);
for (const loc of locs) {
  if (!loc.startsWith(SITE + '/')) fail('站点地图地址不是正式域名：' + loc);
  const rel = loc.slice(SITE.length + 1) || 'index.html';
  if (!exists(rel)) fail('站点地图地址无对应文件：' + loc);
}
if (locs.some((l) => l.endsWith('/explore.html'))) fail('历史资料页不应进入站点地图');
for (const page of ['index.html', 'book.html', 'builders.html', 'outcomes.html', 'enterprise.html', 'learning.html', 'cooperate.html', 'models.html', 'xianfeng.html']) {
  const expected = page === 'index.html' ? SITE + '/' : SITE + '/' + page;
  if (!locs.includes(expected)) fail('站点地图缺少正式页面：' + expected);
}

/* ---------- 3. 每页分享信息 ---------- */
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html')).sort();
const shareImage = path.join(root, '素材/og/ai-commander-og-1200x630.webp');
if (!exists('素材/og/ai-commander-og-1200x630.webp')) fail('缺少分享图 素材/og/ai-commander-og-1200x630.webp');
else if (fs.statSync(shareImage).size < 10240) fail('分享图文件过小');

for (const page of pages) {
  const html = read(page);
  const flat = html.replace(/\s+/g, ' '); /* meta 标签可能跨行书写，先压平再匹配 */
  const expected = page === 'index.html' ? SITE + '/' : SITE + '/' + page;
  const canonical = (flat.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const robotsMeta = (flat.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '';
  const isArchive = page === 'explore.html';

  if (!html.includes('<html lang="zh-CN">')) fail(page + ' 缺少中文语言标记');
  if (!/<title>[^<]{4,}<\/title>/.test(flat)) fail(page + ' 标题为空或过短');
  if (!/<meta name="description" content="[^"]{20,}"/.test(flat)) fail(page + ' 描述为空或过短');

  if (isArchive) {
    if (!/noindex/.test(robotsMeta)) fail(page + ' 应保持 noindex');
    if (canonical !== SITE + '/') fail(page + ' 归档页规范网址应指向首页');
    continue;
  }

  if (canonical !== expected) fail(page + ' canonical 与正式地址不一致：' + canonical);
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!new RegExp('property="' + prop + '" content="[^"]+"').test(flat)) fail(page + ' 缺少 ' + prop);
  }
  const ogUrl = (flat.match(/property="og:url" content="([^"]+)"/) || [])[1];
  if (ogUrl !== expected) fail(page + ' og:url 与正式地址不一致：' + ogUrl);
  const ogImage = (flat.match(/property="og:image" content="([^"]+)"/) || [])[1] || '';
  if (!ogImage.startsWith(SITE + '/')) fail(page + ' og:image 不是正式域名绝对地址');
  const imgRel = decodeURIComponent(ogImage.replace(SITE + '/', ''));
  if (!exists(imgRel)) fail(page + ' og:image 文件不存在：' + imgRel);
  if (!/name="twitter:card"/.test(flat)) fail(page + ' 缺少 twitter:card');
  if (/127\.0\.0\.1|localhost|file:\/\//.test(html)) fail(page + ' 含本地地址');
  if (/(?:src|href)="http:\/\//.test(html)) fail(page + ' 含 http:// 绝对引用');
  if (html.includes('docs/archive')) fail(page + ' 链接了归档文件');
}

/* ---------- 4. 二维码与分享图引用 ---------- */
for (const page of pages) {
  const html = read(page);
  for (const m of html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
    const src = m[1].split('?')[0];
    if (src.startsWith('http') || src.startsWith('data:')) continue;
    if (!exists(decodeURIComponent(src))) fail(page + ' 图片不存在：' + src);
  }
}
const memberQr = fs.readdirSync(path.join(root, '素材/二维码/成员')).filter((f) => f.endsWith('.png'));
if (memberQr.length !== 23) fail('成员二维码应为 23 张，实际 ' + memberQr.length);

/* ---------- 输出 ---------- */
console.log('发布前核对');
console.log('='.repeat(56));
console.log('页面 ' + pages.length + ' 个，站点地图 ' + locs.length + ' 条，成员二维码 ' + memberQr.length + ' 张');
console.log('域名 ' + read('CNAME').trim() + '，分享图 1200×630');
if (problems.length) {
  console.log('\n发现 ' + problems.length + ' 个问题：');
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('\n全部通过：域名、规范网址、分享信息、站点地图、二维码引用一致。');
