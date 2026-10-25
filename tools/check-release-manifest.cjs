/* 校验待上传目录是否与审核过的发布清单完全一致。
   任何新增、删除、内容变化都会失败并列出差异，防止发布内容在审核后悄然变化。
   用法：node tools/check-release-manifest.cjs [待上传目录] [清单文件] */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const dir = path.resolve(process.argv[2] || '_site');
const manifestFile = path.resolve(process.argv[3] || 'release-manifest.json');
const TEXT = new Set(['.html', '.css', '.js', '.xml', '.txt', '.json', '.svg']);

const isText = (file) => TEXT.has(path.extname(file).toLowerCase()) || path.basename(file) === 'CNAME';
function hashFile(file) {
  let buf = fs.readFileSync(file);
  if (isText(file)) buf = Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}
function walk(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, base, acc);
    else if (entry.isFile()) acc.push(abs);
  }
  return acc;
}

if (!fs.existsSync(manifestFile)) {
  console.error('缺少发布清单：' + manifestFile);
  process.exit(1);
}
if (!fs.existsSync(dir)) {
  console.error('待上传目录不存在：' + dir);
  process.exit(1);
}

const approved = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const approvedMap = new Map(approved.files.map((f) => [f.path, f]));
const actual = walk(dir).map((abs) => path.relative(dir, abs).split(path.sep).join('/'));
const actualSet = new Set(actual);

const missing = [...approvedMap.keys()].filter((p) => !actualSet.has(p));
const added = actual.filter((p) => !approvedMap.has(p));
const changed = [];
for (const rel of actual) {
  const item = approvedMap.get(rel);
  if (!item) continue;
  const now = hashFile(path.join(dir, rel));
  if (now !== item.sha256) changed.push(rel);
}

console.log('发布清单核对');
console.log('='.repeat(56));
console.log('清单：' + path.relative(process.cwd(), manifestFile) + '（' + approved.fileCount + ' 个文件）');
console.log('待上传目录：' + path.relative(process.cwd(), dir) + '（' + actual.length + ' 个文件）');
console.log('新增 ' + added.length + '，缺失 ' + missing.length + '，内容变化 ' + changed.length);

const show = (label, list) => {
  if (!list.length) return;
  console.log('\n' + label + '：');
  for (const p of list.slice(0, 30)) console.log('  - ' + p);
  if (list.length > 30) console.log('  ... 其余 ' + (list.length - 30) + ' 个');
};

show('清单内但待上传目录缺失', missing);
show('待上传目录多出、清单未批准', added);
show('内容与清单不一致', changed);

if (missing.length || added.length || changed.length) {
  console.log('\n核对失败：待上传内容与审核过的发布清单不一致。');
  console.log('如确属本次批准的内容变化，请重新生成清单并复审后再发布。');
  process.exit(1);
}

console.log('\n核对通过：待上传内容与审核过的发布清单逐文件一致。');
