/* build-models-public-data.cjs — 把预览目录里已验收的两份数据机械导出为根目录公开运行资源。
   只做逐字节复制与校验，不改一个字符：源文件不搬动、不删除、不修改。
   用法：node tools/build-models-public-data.cjs
   任一份导出与源不同字节（或源哈希偏离预期）即退出码 1，绝不产出半成品。 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/* 期望前缀取自交接记录里的已验收哈希，用于确认"导的就是这一份" */
const MAP = [
  {
    src: path.join("docs", "mockups", "2026-10-31-AI模型选型参考-真实资料预览-data.js"),
    out: "models-candidates-data.js",
    expect: "bf25c46a8aa0",
    global: "window.REAL_DATA",
  },
  {
    src: path.join("docs", "mockups", "2026-10-31-AI模型选型参考-评分样例-data.js"),
    out: "models-scores-data.js",
    expect: "d94aba1128b5",
    global: "window.REAL_SCORES",
  },
];
const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
let bad = 0;

for (const job of MAP) {
  const buf = fs.readFileSync(job.src);
  const hex = sha(buf);
  if (!hex.startsWith(job.expect)) {
    console.error("FAIL 源哈希偏离预期：" + job.src + "\n     实际 " + hex + "，期望前缀 " + job.expect);
    bad++;
    continue;
  }
  if (!buf.includes(job.global)) {
    console.error("FAIL 源文件缺少全局量 " + job.global + "：" + job.src);
    bad++;
    continue;
  }
  fs.writeFileSync(job.out, buf);
  const back = fs.readFileSync(job.out);
  const same = back.equals(buf) && sha(back) === hex;
  console.log((same ? "PASS " : "FAIL ") + job.out + "　" + buf.length + "B　sha256 " + hex);
  if (!same) bad++;
}
console.log(bad ? "导出未通过（" + bad + " 项异常），根目录文件请勿使用。" : "两份公开数据与源逐字节一致。");
process.exit(bad ? 1 : 0);
