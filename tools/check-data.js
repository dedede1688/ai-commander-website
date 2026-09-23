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

/* ---------- 工具：截取某个顶层数组的源码片段 ---------- */
function sliceArray(src, decl) {
  const start = src.indexOf(decl);
  if (start < 0) return "";
  const end = src.indexOf("\n];", start);
  return end < 0 ? src.slice(start) : src.slice(start, end);
}

/* ---------- 1. 读取数据源 ---------- */
const scriptSrc = read("script.js");
const modelsSrc = read("models.js");

/* P 数组：每位出版人的 n（姓名）/ s（席号）/ f（照片路径） */
const pRegion = sliceArray(scriptSrc, "var P = [");
const people = [];
const pRe =
  /n:\s*"([^"]+)",\s*\n\s*s:\s*"([^"]+)",\s*\n\s*r:\s*"([^"]+)",\s*\n\s*f:\s*"([^"]+)"/g;
let m;
while ((m = pRe.exec(pRegion))) {
  people.push({ n: m[1], s: m[2], r: m[3], f: m[4] });
}
if (!people.length) err("无法从 script.js 的 P 数组中解析出任何条目（格式可能已变）");

/* IND 数组：行业名 + 成员名单 */
const indRegion = sliceArray(scriptSrc, "var IND = [");
const inds = [];
const indRe = /name:\s*"([^"]+)"[\s\S]*?m:\s*\[([^\]]*)\]/g;
while ((m = indRe.exec(indRegion))) {
  const members = (m[2].match(/"([^"]+)"/g) || []).map((s) => s.replace(/"/g, ""));
  inds.push({ name: m[1], members });
}

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
  if (!fs.existsSync(abs)) err(`照片文件不存在：${p.n} → ${p.f}`);
});

/* ---------- 6. 检查 5：全站「素材/」引用存在性 ---------- */
const scanFiles = [
  "index.html",
  "models.html",
  "shared.js",
  "script.js",
  "models.js",
  "base.css",
  "style.css",
  "models.css",
];
const refSeen = new Set();
scanFiles.forEach((f) => {
  if (!fs.existsSync(path.join(ROOT, f))) return;
  const src = read(f);
  /* 只认「以文件扩展名结尾」的才是真实引用；正文里的「素材/照片/（20张）」属说明文字，不算引用 */
  const re = /素材\/[^"'\s)\\]*\.(?:webp|png|jpe?g|svg|gif|ico)/gi;
  let r;
  while ((r = re.exec(src))) {
    const ref = r[0].replace(/[),;]+$/, "");
    const key = ref + "@" + f;
    if (refSeen.has(key)) continue;
    refSeen.add(key);
    if (!fs.existsSync(path.join(ROOT, ref))) err(`素材引用失效：${f} → ${ref}`);
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