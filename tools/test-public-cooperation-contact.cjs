const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const pages = ['cooperate.html', 'enterprise.html'];
const qrRelative = '素材/二维码/智能营销-胡子-微信二维码-仅二维码.png';
const expectedQrSha256 = '6F6EF832250F087E17EDC902C427C1DAC416616AB1F73462F2E6FC3378A8ADA8'.toLowerCase();

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const required = [
    'data-public-contact',
    'href="tel:18566793066"',
    'href="mailto:381901944@qq.com"',
    '18566793066',
    '381901944@qq.com',
    `src="${qrRelative}"`,
    'alt="智能营销-胡子微信二维码"',
  ];
  for (const value of required) {
    if (!html.includes(value)) throw new Error(`${page} 缺少 ${value}`);
  }
  if (html.includes('按钮打开现有官方小程序二维码')) {
    throw new Error(`${page} 仍保留错误的小程序收件说明`);
  }
}

const targetQr = path.join(root, qrRelative);
if (!fs.existsSync(targetQr)) throw new Error('网站微信二维码素材不存在');
if (sha256(targetQr) !== expectedQrSha256) throw new Error('网站微信二维码不是已审核的无损裁切版');

console.log('PASS: 两个合作页面均公开正确联系方式，二维码无损裁切版哈希正确');
