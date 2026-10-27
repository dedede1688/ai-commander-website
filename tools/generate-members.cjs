/* 由已确认模板与单一公开资料生成共建者中心、23 个个人页。 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = require('../member-data.js');
const {members, groups} = data;
const site = 'https://www.ai-mmc.cn';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prettyGroup = name => ({'IT·互联网·数字化':'信息技术·互联网·数字化', 'AI 原生·AI 营销':'人工智能应用·营销'}[name] || name);
const json = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
if (!members.length || new Set(members.map(m => m.slug)).size !== members.length || new Set(members.map(m => m.seat)).size !== members.length) throw Error('成员资料缺失、网址或席位重复');
for (const m of members) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug) || !m.bio || !m.name) throw Error(`成员资料不完整：${m.name}`);
  if (groups.filter(g => g.members.includes(m.name)).length !== 1) throw Error(`成员行业分组不唯一：${m.name}`);
  for (const asset of [m.photo, `素材/二维码/成员/qr-${m.slug}.png`]) {
    if (!fs.existsSync(path.join(root, asset))) throw Error(`成员素材缺失：${asset}`);
  }
}

function baseTemplate(html, page) {
  return html.replace(/<base href="\.\.\/"\s*\/>/, '')
    .replace('content="noindex, nofollow"', 'content="index, follow, max-image-preview:large"')
    .replace(/<div class="preview-note">[\s\S]*?<\/nav><\/div>/, '')
    .replace(/<!-- 设计约定：[\s\S]*?-->/, '<!-- 统一成员模板；资料修改请编辑 member-data.js 后重新生成。 -->')
    .replace('previews/builders.css?v=1', 'builders.css?v=6')
    .replace('previews/builders.js?v=1', 'builders.js?v=1')
    .replace(/shared\.js\?v=\d+/, 'shared.js?v=27')
    .replace(/data-page="(?:builders|member)-preview"/, `data-page="${page}"`)
    .replaceAll('previews/builders.html', 'builders.html');
}
function metadata(html, {title, description, url, image, type, schema}) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(description)}" />`);
  return html.replace('</head>', `<link rel="canonical" href="${url}" />
<meta property="og:type" content="${type}" /><meta property="og:site_name" content="AI指挥官" />
<meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" /><meta property="og:image" content="${site}/${image}" />
<meta property="og:image:alt" content="${esc(title)}" /><meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${json(schema)}</script></head>`);
}

let center = baseTemplate(read('previews/builders.html'), 'builders');
center = center.replace(/<div class="builders-roster" id="memberRoster">[\s\S]*?<\/div><p class="roster-empty"/, '<div class="builders-roster" id="memberRoster">' + members.map(m => {
  const search = [m.name, m.role, m.bio, m.group].join(' ');
  const subsite = (m.links || []).length ? `<span class="builder-subsite" title="${esc(m.links.map(l => l.label).join(' · '))}"><img src="素材/logo.webp" width="26" height="26" alt="独立站点" /></span>` : '';
  return `<a class="builder-person" href="member-${m.slug}.html" data-member-card data-group="${esc(m.group)}" data-search="${esc(search)}">${subsite}<img src="${esc(m.photo)}" width="68" height="96" loading="lazy" decoding="async" alt="${esc(m.name)}" /><div><span class="builder-seat">${esc(m.seat)} · 联合出版人</span><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p><span class="builder-open">查看个人主页 →</span></div></a>`;
}).join('') + '</div><p class="roster-empty"');
center = center.replace(/<select id="memberGroup">[\s\S]*?<\/select>/, '<select id="memberGroup"><option value="">全部行业</option>' + groups.map(g => `<option value="${esc(g.name)}">${esc(prettyGroup(g.name))}（${g.members.length}位）</option>`).join('') + '</select>');
center = metadata(center, {
  title: '共建者中心｜《AI指挥官》联合出版人与专业共建',
  description: `认识《AI指挥官》的${members.length}位联合出版人，浏览${groups.length}个行业分组，了解联合出版人、特约编委和生态伙伴的共建方式。`,
  url: `${site}/builders.html`, image: '素材/og/ai-commander-og-1200x630.webp', type: 'website',
  schema: {'@context':'https://schema.org','@type':'ItemList',name:'《AI指挥官》联合出版人名录',numberOfItems:members.length,itemListElement:members.map((m,i) => ({'@type':'ListItem',position:i+1,item:{'@type':'Person',name:m.name,url:`${site}/member-${m.slug}.html`}}))}
});

const first = members.find(m => m.slug === 'yan-hai-zhen');
const sample = read('previews/member-yan-hai-zhen.html');
const outputs = [['builders.html', center], ['builders.css', read('previews/builders.css')], ['builders.js', read('previews/builders.js')]];
for (const m of members) {
  const file = `member-${m.slug}.html`, url = `${site}/${file}`;
  let html = baseTemplate(sample, 'member');
  /* 成员自定义链接（如温妮的供应链中心）渲染为身份标签区的可点击胶囊。 */
  const linkPills = (m.links || []).map(l => `<a class="member-link-pill" href="${esc(l.href)}"><img src="素材/logo.webp" width="18" height="18" alt="" />${esc(l.label)} →</a>`).join('');
  if (linkPills) html = html.replace('<span>23 位联合出版人之一</span></div>', `<span>23 位联合出版人之一</span>${linkPills}</div>`);
  const expertise = m.expertise && m.expertise.length ? `<section class="card" id="expertise"><p class="section-kicker">产业经验</p><h2 class="section-title">专业方向</h2><p class="section-lead">以下方向根据现有个人简介整理。</p><div class="expertise-grid">${m.expertise.map(e => `<article class="expertise-item"><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p></article>`).join('')}</div></section>` : '';
  html = html.replace(/<section class="card" id="expertise">[\s\S]*?<\/section>/, expertise);
  html = html.replace(esc(first.bio), esc(m.bio))
    .replaceAll(esc(first.role), esc(m.role))
    .replaceAll(first.photo, m.photo)
    .replaceAll(first.seat, m.seat)
    .replaceAll(prettyGroup(first.group), esc(prettyGroup(m.group)))
    .replaceAll('previews/member-yan-hai-zhen.html', file)
    .replaceAll('member-yan-hai-zhen.html', file)
    .replaceAll('qr-yan-hai-zhen.png', `qr-${m.slug}.png`)
    .replaceAll('鄢海珍', esc(m.name))
    .replace('深耕运动面料，连接产业上下游', esc(m.bioHeadline || '个人简介'))
    .replace('此处保留正式主页二维码与链接，扫码打开当前已上线的成员主页。', '扫码或分享链接，可以打开这位成员的个人主页。')
    .replace('class="action" href="builders.html#members">返回完整名录', 'class="action mp-back" href="builders.html#members">返回完整名录');
  html = metadata(html, {
    title: `${m.name} ·《AI指挥官》联合出版人｜${m.role}`,
    description: `${m.name}，${m.role}，《AI指挥官》联合出版人（${m.seat}）。${m.bio}`,
    url, image:m.photo, type:'profile',
    schema:{'@context':'https://schema.org','@type':'Person','@id':url,name:m.name,jobTitle:m.role,description:m.bio,image:`${site}/${m.photo}`,url}
  });
  outputs.push([file, html]);
}
if (process.argv.includes('--dry-run')) {
  outputs.forEach(([file]) => console.log(file));
  console.log(`DRY RUN: ${members.length} member pages and builders center; no files written.`);
} else {
  for (const [file, html] of outputs) fs.writeFileSync(path.join(root,file), html);
  console.log(`Generated builders center and ${members.length} member pages from member-data.js.`);
}
