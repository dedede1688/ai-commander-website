// fetch-official-sources.cjs — 用本机 Chrome（Playwright，已安装，不新增依赖）渲染并抓取官方原始页面文本，
// 落盘到 国内外模型资料库/_scoring/raw/，作为逐格核验的原文证据（只读公开页面，不登录、不调用付费接口）。
// 用法：node tools/fetch-official-sources.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'docs', 'content', '2026-10-30-全站升级交接', '国内外模型资料库', '_scoring', 'raw');
const TARGETS = [
  { slug: 'qwen-blog-qwen3.8', url: 'https://qwen.ai/blog?id=qwen3.8', keys: ['GPQA', 'SWE-bench Pro', 'BabyVision', 'VideoMME', 'OSWorld', 'CharXiv', 'CountQA', 'MobileWorld', 'MLVU', 'VideoMMMU', 'IFBench'] },
  { slug: 'openai-gpt56-sol', url: 'https://openai.com/index/previewing-gpt-5-6-sol/', keys: ['GPQA', 'SWE-bench', 'MMMU', 'VideoMME', 'OSWorld'] },
  { slug: 'meta-llama4-models', url: 'https://dev.meta.ai/llama/models/llama-4/', keys: ['Maverick', 'Scout', 'GPQA Diamond', 'LiveCodeBench', 'MMMU', 'MMLU Pro'], find: 'llama-4' },
  { slug: 'meta-llama-root', url: 'https://dev.meta.ai/llama/', keys: ['Maverick', 'Scout', 'GPQA Diamond', 'LiveCodeBench', 'MMMU'], find: 'llama' },
  { slug: 'meta-docs-root', url: 'https://dev.meta.ai/docs/', keys: ['Llama 4', 'GPQA'], find: 'llama' },
  { slug: 'meta-models-root', url: 'https://dev.meta.ai/models', keys: ['Llama 4'], find: 'llama' },
  { slug: 'meta-llama4-herd-card', url: 'https://dev.meta.ai/docs/model-cards-and-prompt-formats/llama4_herd/', keys: ['GPQA Diamond', 'LiveCodeBench', 'MMMU', 'MMLU Pro'] },
];

(async () => {
  const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 2000 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' });
  for (const t of TARGETS) {
    if (only.length && !only.includes(t.slug)) continue;
    const p = await ctx.newPage();
    const errs = [];
    p.on('requestfailed', r => errs.push(r.url() + ' :: ' + (r.failure() && r.failure().errorText)));
    let status = 'n/a';
    try {
      const resp = await p.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      status = resp ? String(resp.status()) : 'no-response';
      await p.waitForTimeout(6000);
      try { await p.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}
      await p.waitForTimeout(2000);
    } catch (e) {
      errs.push('goto: ' + e.message.split('\n')[0]);
    }
    let text = '';
    try { text = await p.evaluate(() => document.body ? document.body.innerText : ''); } catch (e) { errs.push('innerText: ' + e.message.split('\n')[0]); }
    let finalUrl = 'n/a';
    try { finalUrl = p.url(); } catch (e) {}
    let links = [];
    if (t.find) {
      try {
        links = await p.evaluate(rx => Array.from(new Set(Array.from(document.querySelectorAll('a[href]')).map(a => a.href).filter(h => h.includes(rx)).slice(0, 60))), t.find);
      } catch (e) {}
      console.log(`  [${t.slug}] 含 "${t.find}" 的链接：\n   ` + (links.join('\n   ') || '（无）'));
    }
    const hit = t.keys.filter(k => text.includes(k));
    const file = path.join(OUT, t.slug + '.txt');
    fs.writeFileSync(file, `URL: ${t.url}\nFINAL: ${finalUrl}\nHTTP: ${status}\n抓取时间: ${new Date().toISOString()}\n关键词命中: ${hit.join(', ') || '（无）'}\n请求失败: ${errs.slice(0, 8).join(' | ') || '（无）'}\n\n===== innerText =====\n${text}\n`, 'utf-8');
    console.log(`${t.slug}: HTTP=${status} len=${text.length} keys=[${hit.join(',')}]${errs.length ? ' errs=' + errs[0] : ''}`);
    if (text.length > 200) fs.writeFileSync(path.join(OUT, t.slug + '.png'), await p.screenshot({ fullPage: text.length < 20000 }));
    await p.close();
  }
  await browser.close();
})();
