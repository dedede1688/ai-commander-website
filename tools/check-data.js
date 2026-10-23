/* 《AI指挥官》官网 · 数据与素材引用校验脚本（零依赖，Node 运行）
 *
 * 用法：node tools/check-data.js
 *
 * 设计原则：本脚本只报告、不修改任何文件。
 *   - 「错误」级别 = 引用完整性问题（照片/素材文件找不到、路径写错），必须修到零，否则退出码为 1。
 *   - 「待确认」级别 = 业务事实问题（席号、照片与席位对应关系、同名模型），
 *     这些属于需要人工判断的事实，脚本无权替你决定，因此不影响退出码。
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

/* ---------- 已知可缺失的素材 ----------
   22 席照片已全部入库（由 tools/import-photos.py 从
   D:/《AI指挥官》设计/05_营销方案/联合出版人资料/照片/ 批量转换而来，
   含作者本人的NO022），因此当前集合为空 —— 校验是全严的。

   这个机制存在的意义：将来新增席位但照片还没拿到时，
   必须同时登记到下方集合与 .gitignore，否则 CI 会因「素材引用失效」阻断部署。
   补齐照片后再从这里移除，校验会自动重新变严，
   防止「照片补了但忘了提交」这种问题溜上线。

   页面侧始终有降级：照片取不到时渲染「姓氏首字 + 深蓝底」占位卡
   （script.js 的 initialsOf + .rc-photo-fallback），不会出现浏览器破图标。*/
const OPTIONAL_ASSETS = new Set();

/** 文件不在仓库里时，是否属于「已知可缺失素材」 */
function isOptionalAsset(rel) {
  return OPTIONAL_ASSETS.has(rel.replace(/\\/g, "/"));
}

/* ---------- 工具：截取某个顶层数组的源码片段 ---------- */
function sliceArray(src, decl) {
  const start = src.indexOf(decl);
  if (start < 0) return "";
  const end = src.indexOf("\n];", start);
  return end < 0 ? src.slice(start) : src.slice(start, end);
}

/* ---------- 1. 读取数据源 ---------- */
const modelsSrc = read("models.js");

/* P 数组：每位出版人的 n（姓名）/ s（席号）/ f（照片路径） */
const memberData = require("../member-data.js");
const people = memberData.members.map(p => ({slug:p.slug,n:p.name,s:p.seat,r:p.role,f:p.photo}));
if (!people.length) err("member-data.js 中没有成员资料");

/* IND 数组：行业名 + 成员名单 */
const inds = memberData.groups.map(g => ({name:g.name,members:g.members}));

/* MODELS 数组：模型名 */
const modRegion = sliceArray(modelsSrc, "var MODELS = [");
const modelNames = (modRegion.match(/name:\s*"([^"]+)"/g) || []).map((s) =>
  s.replace(/^name:\s*"/, "").replace(/"$/, ""),
);

/* ---------- 2. 检查 1：席号唯一性 ---------- */
const seatSeen = new Map();
people.forEach((p) => {
  if (seatSeen.has(p.s)) {
    warn(`席号重复：${p.s} 同时被「${seatSeen.get(p.s)}」与「${p.n}」占用`);
  } else {
    seatSeen.set(p.s, p.n);
  }
});

/* ---------- 3. 检查 2：席号连续性（NO.001 起，无断号） ---------- */
const seatNums = people
  .map((p) => {
    const g = /^NO\.(\d{3})$/.exec(p.s);
    return g ? parseInt(g[1], 10) : null;
  })
  .filter((x) => x !== null);
if (seatNums.length) {
  const max = Math.max(...seatNums);
  const missing = [];
  for (let i = 1; i <= max; i++) if (!seatNums.includes(i)) missing.push(i);
  if (missing.length) {
    warn(
      `席号断号：1..${max} 之间缺少 ${missing
        .map((n) => "NO." + String(n).padStart(3, "0"))
        .join("、")}`,
    );
  }
}

/* ---------- 3.5 检查 2b：slug 完整性、唯一性与格式 ----------
   slug 会进分享链接，一经上线不可更改，所以这三条按「错误」处理会阻断部署：
     缺失    新增席位时忘了填，或字段位置被改坏
     重复    两人同名会撞 URL，其中一人的分享链接会指向错误的人
     格式    必须是小写字母/数字/连字符，且不含中文、空格、下划线、大写
   格式约定见 script.js 里P 数组上方的 SLUG_RULE。 */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSeen = new Map();
people.forEach((p) => {
  if (!p.slug) {
    err(
      `缺少 slug：「${p.n}」（${p.s}）没有 slug 字段 —— 个人主页需要它作为地址，` +
        `请在 P 数组里补上 slug: "xxx"`,
    );
    return;
  }
  if (slugSeen.has(p.slug)) {
    err(
      `slug 重复：「${slugSeen.get(p.slug)}」与「${p.n}」都用了 ${p.slug} —— ` +
        `会导致分享链接串页，请给其中一位加数字后缀`,
    );
  } else {
    slugSeen.set(p.slug, p.n);
  }
  if (!SLUG_RE.test(p.slug)) {
    err(
      `slug 格式不合法：${p.slug}（「${p.n}」）—— 只允许小写字母、数字与连字符，` +
        `如 zhang-cheng`,
    );
  }
});

/* ---------- 4. 检查 3：照片文件名前缀与席号一致 ---------- */
people.forEach((p) => {
  const file = p.f.split("/").pop();
  const g = /^NO(\d{3})_/.exec(file);
  const seatNum = /^NO\.(\d{3})$/.exec(p.s);
  if (g && seatNum && g[1] !== seatNum[1]) {
    warn(
      `照片与席号不一致：「${p.n}」席号 ${p.s}，照片却是 NO${g[1]}（${p.f}）—— 请人工确认`,
    );
  }
});

/* ---------- 5. 检查 4：P 数组引用的照片真实存在 ---------- */
people.forEach((p) => {
  const abs = path.join(ROOT, p.f);
  if (!fs.existsSync(abs)) {
    if (isOptionalAsset(p.f)) {
      warn(`照片为已知可缺失素材（作者隐私/ 待提供），本机缺失属正常：${p.n} → ${p.f}`);
    } else {
      err(`照片文件不存在：${p.n} → ${p.f}`);
    }
  }
});

/* ---------- 6. 检查 5：全站「素材/」引用存在性 ---------- */
const scanFiles = [
  "index.html",
  "models.html",
  "xianfeng.html",
  "shared.js",
  "script.js",
  "models.js",
  "xianfeng.js",
  "base.css",
  "style.css",
  "models.css",
  "xianfeng.css",
];

/* 个人主页是批量生成的，引用的是同一批照片。
   若全部展开进来，校验输出会被同一条规则刷屏 22 遍；
   但一张都不能漏扫 —— 所以按 glob 全量纳入，去重后逐个检查。 */
try {
  const fsDir = require("fs");
  const memberPages = fsDir
    .readdirSync(ROOT)
    .filter((f) => /^member-.+\.html$/.test(f));
  scanFiles.push(...memberPages);
} catch (e) {
  /* 读不到目录就跳过，个人页自检由 tools/check-member-pages.py 负责 */
}
const refSeen = new Set();
scanFiles.forEach((f) => {
  if (!fs.existsSync(path.join(ROOT, f))) return;
  const src = read(f);
  /* 只认「以文件扩展名结尾」的才是真实引用；正文里的「素材/照片/（20张）」属说明文字，不算引用。
     左侧刻意允许 / 或 https://…/ 前缀 —— 个人主页的 og:image 用绝对网址，
     那里写作 https://www.ai-mmc.cn/素材/照片/xxx.webp，同样要校验文件是否真在。 */
  const re = /(?:素材\/)[^"'\s)\\]*\.(?:webp|png|jpe?g|svg|gif|ico)/gi;
  let r;
  while ((r = re.exec(src))) {
    /* 取素材路径部分（SITE_URL 之后的那段），ROOT 下按相对路径判定 */
    const ref = r[0].slice(r[0].indexOf("素材/"));
    const key = ref + "@" + f;
    if (refSeen.has(key)) continue;
    refSeen.add(key);
    if (!fs.existsSync(path.join(ROOT, ref))) {
      if (isOptionalAsset(ref)) {
        warn(`素材为已知可缺失素材（作者隐私 / 待提供），本机缺失属正常：${f} → ${ref}`);
      } else {
        err(`素材引用失效：${f} → ${ref}`);
      }
    }
  }
});

/* ---------- 7. 检查 6：模型同名 ---------- */
const nameSeen = new Map();
modelNames.forEach((n) => {
  nameSeen.set(n, (nameSeen.get(n) || 0) + 1);
});
nameSeen.forEach((count, n) => {
  if (count > 1) warn(`模型同名：MODELS 中「${n}」出现 ${count} 次 —— 请人工确认是否应为两条记录`);
});

/* ---------- 8. 检查 7：行业分组成员必须存在于 P ---------- */
const peopleNames = new Set(people.map((p) => p.n));
inds.forEach((ind) => {
  ind.members.forEach((nm) => {
    if (!peopleNames.has(nm)) {
      warn(`行业「${ind.name}」的成员「${nm}」在出版人名录（P 数组）中不存在`);
    }
  });
});

/* ---------- 9. 检查 8：个人主页与 sitemap 的一致性 ----------
   页面侧不再做运行时探测（不合适的方案是fetch 22 次HEAD，代价高且脆弱），
   改为在构建阶段把关：
     · 名单里每人必须有对应的 member-<slug>.html，且姓名/席号与名录一致
     · sitemap.xml 必须收录全部个人页，且域名统一为正式域名
   任何一条不满足即报错，退出码 1，阻断部署。 */
const membersDir = fs
  .readdirSync(ROOT)
  .filter((f) => /^member-.+\.html$/.test(f));
const memberSet = new Set(membersDir);

people.forEach((p) => {
  if (!p.slug) return; // 缺 slug 已在检查 2b 报错，这里不重复
  const fn = `member-${p.slug}.html`;
  if (!memberSet.has(fn)) {
    err(
      `个人主页缺失：${p.n}（${p.s}）应有 ${fn} —— ` +
        `运行 python tools/gen-member-pages.py 重新生成`,
    );
    return;
  }
  const html = read(fn);
  // 姓名与席号必须出现在页面里，防止生成器用错数据
  if (!html.includes(p.n)) {
    err(`个人主页 ${fn} 中找不到姓名「${p.n}」—— 内容与名录不符，请重新生成`);
  }
  if (!html.includes(p.s)) {
    err(`个人主页 ${fn} 中找不到席号 ${p.s} —— 内容与名录不符，请重新生成`);
  }
  // canonical 必须指向正式域名的自身
  const canon = /<link rel="canonical" href="([^"]*)"/.exec(html);
  if (!canon) {
    err(`个人主页 ${fn} 缺少 canonical`);
  } else if (canon[1] !== `https://www.ai-mmc.cn/${fn}`) {
    err(
      `个人主页 ${fn} 的 canonical 不正确：${canon[1]}` +
        `（应为 https://www.ai-mmc.cn/${fn}）`,
    );
  }
});

// sitemap 收录检查
const sitemapPath = path.join(ROOT, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sm = read("sitemap.xml");
  const locs = (sm.match(/<loc>([^<]+)<\/loc>/g) || []).map((s) =>
    s.replace(/<\/?loc>/g, "").trim(),
  );
  const offDomain = locs.filter(
    (u) => !u.startsWith("https://www.ai-mmc.cn/"),
  );
  if (offDomain.length) {
    err(
      `sitemap.xml 含非正式域名：${offDomain.join("、")} —— ` +
        `全部条目应以 https://www.ai-mmc.cn/ 开头`,
    );
  }
  people.forEach((p) => {
    if (!p.slug) return;
    const url = `https://www.ai-mmc.cn/member-${p.slug}.html`;
    if (!locs.includes(url)) {
      err(
        `sitemap.xml 未收录 ${p.n}（${p.s}）：缺 ${url} —— ` +
          `运行 python tools/gen-sitemap.py 重新生成`,
      );
    }
  });
} else {
  err("缺少 sitemap.xml");
}

/* ---------- 9.5 检查 8b：专属二维码存在性与对应关系 ----------
   二维码由 tools/gen-qrcode.py 生成（离线、纯静态）。
   这里只校验「文件在不在、有没有张冠李戴」—— 真正的可扫码性
   由该脚本生成时用 OpenCV 实际解码验证，生成阶段就把关。 */
const qrDir = path.join(ROOT, "素材/二维码/成员");
people.forEach((p) => {
  if (!p.slug) return;
  const fn = `qr-${p.slug}.png`;
  const fp = path.join(qrDir, fn);
  if (!fs.existsSync(fp)) {
    err(
      `专属二维码缺失：${p.n}（${p.s}）应有 素材/二维码/成员/${fn} —— ` +
        `运行 python tools/gen-qrcode.py 生成`,
    );
    return;
  }
  /* 页面里引用的必须是本人那一张，防止复制粘贴时张冠李戴 */
  const page = read(`member-${p.slug}.html`);
  const qrImages = [...page.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
  const m = qrImages.find(src => src.includes('素材/二维码/成员/'));
  if (!m) {
    err(`个人主页 member-${p.slug}.html 未引用专属二维码`);
  } else if (!m.includes(fn)) {
    err(
      `个人主页 member-${p.slug}.html 引用的二维码不是本人那张：${m}`,
    );
  }
  /* 复制链接必须指向本人主页 */
  const cp = /data-copy-url="([^"]*)"/.exec(page);
  const expect = `https://www.ai-mmc.cn/member-${p.slug}.html`;
  if (!cp) {
    err(`个人主页 member-${p.slug}.html 缺复制链接按钮`);
  } else if (cp[1] !== expect) {
    err(
      `个人主页 member-${p.slug}.html 的复制链接指向错误：${cp[1]}（应为 ${expect}）`,
    );
  }
});

/* ---------- 输出 ---------- */
console.log("《AI指挥官》官网 · 数据与素材引用校验");
console.log(`出版人 ${people.length} 位 ｜ 行业分组 ${inds.length} 组 ｜ 模型 ${modelNames.length} 个`);
console.log("");

if (errors.length) {
  console.log(`【错误】${errors.length} 项（引用完整性，必须修复）`);
  errors.forEach((e) => console.log("  ✗ " + e));
  console.log("");
}
if (warns.length) {
  console.log(`【待确认】${warns.length} 项（业务事实，需人工判断）`);
  warns.forEach((w) => console.log("  ? " + w));
  console.log("");
}
if (!errors.length && !warns.length) console.log("全部检查通过，未发现问题。\n");

console.log(
  `校验完成：错误 ${errors.length} 项，待确认 ${warns.length} 项。`,
);
process.exit(errors.length ? 1 : 0);
