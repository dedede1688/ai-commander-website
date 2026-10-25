/* 生成发布清单锁文件：记录审核通过的最终发布包（路径 + 内容哈希）。
   文本文件按 LF 归一化后计算哈希，避免 Windows 工作区与 Linux CI 的行尾差异造成误报。
   用法：node tools/build-release-manifest.cjs <发布目录> [输出文件] */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const dir = path.resolve(process.argv[2] || '_release/2026-10-23/site');
const out = path.resolve(process.argv[3] || 'release-manifest.json');
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

if (!fs.existsSync(dir)) {
  console.error('发布目录不存在：' + dir);
  process.exit(1);
}

const files = walk(dir).map((abs) => {
  const rel = path.relative(dir, abs).split(path.sep).join('/');
  return { path: rel, bytes: fs.statSync(abs).size, sha256: hashFile(abs), kind: isText(abs) ? 'text' : 'binary' };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  site: 'https://www.ai-mmc.cn',
  fileCount: files.length,
  note: '文本文件哈希按 LF 归一化；本文件是人工审核过的发布清单，内容变化必须重新生成并复审。',
  files,
};
fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('已生成 ' + out);
console.log('文件数 ' + files.length + '，文本 ' + files.filter((f) => f.kind === 'text').length + '，二进制 ' + files.filter((f) => f.kind === 'binary').length);
