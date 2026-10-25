// 一次性自检脚本（运行后即可删）
const yaml = require('fs').readFileSync('.github/workflows/diagnose-env.yml', 'utf8');
const checks = [
  // ---- 基础结构（19 项原有） ----
  ['name 字段', /^name:\s*.+/m, yaml],
  ['on 字段', /^on:\s*$/m, yaml],
  ['workflow_dispatch 触发器', /workflow_dispatch:/, yaml],
  ['无 push 触发器', !/^\s*push:/m.test(yaml)],
  ['permissions 字段', /^permissions:\s*$/m, yaml],
  ['jobs 字段', /^jobs:\s*$/m, yaml],
  ['runs-on ubuntu', /runs-on:\s*ubuntu-latest/, yaml],
  ['诊断步骤 read-env', /id:\s*read-env/, yaml],
  ['诊断步骤 dns', /id:\s*dns/, yaml],
  ['诊断步骤 list-env', /id:\s*list-env/, yaml],
  ['诊断步骤 env-detail', /id:\s*env-detail/, yaml],
  ['无 deploy 命令', !/tcb hosting deploy/.test(yaml)],
  ['无 delete 命令', !/tcb hosting delete/.test(yaml)],
  ['无 create 命令', !/tcb env create/.test(yaml)],
  ['读取 vars.CLOUDBASE_ENV_ID', /vars\.CLOUDBASE_ENV_ID/, yaml],
  ['读取 secrets.CLOUDBASE_ENV_ID', /secrets\.CLOUDBASE_ENV_ID/, yaml],
  ['读取 secrets.TCB_SECRET_ID', /secrets\.TCB_SECRET_ID/, yaml],
  ['读取 secrets.TCB_SECRET_KEY', /secrets\.TCB_SECRET_KEY/, yaml],
  ['关闭调试回显', /set \+x/, yaml],

  // ---- v2 修正（5 项） ----
  ['v2/v3 注释标记', /v[23]/, yaml],
  ['步骤 5 引用 vars 或 secrets', /ACTIVE_ENV:\s*\$\{\{ vars\.CLOUDBASE_ENV_ID \|\| secrets\.CLOUDBASE_ENV_ID \}\}/, yaml],
  ['步骤 5 不再限 vars', !/if:\s*steps\.read-env\.outputs\.source == 'vars'/.test(yaml)],
  ['步骤 5 改为 !="none"', /if:\s*steps\.read-env\.outputs\.source != 'none'/, yaml],
  ['步骤 1 不再输出 active_env', !/active_env=/.test(yaml)],

  // ---- v3 修复（新 11 项） ----
  ['v5 注释标记', /v5/, yaml],
  ['新增步骤 3.5 登录', /步骤 3.5.*?CloudBase 登录/s, yaml],
  ['步骤 3.5 调用 tcb login', /name: 登录 CloudBase[\s\S]*?tcb login --apiKeyId/, yaml],
  ['步骤 3.5 失败 exit 1', /LOGIN_RC[\s\S]*?exit 1/, yaml],
  ['步骤 4 含 set -o pipefail', /name: 列出可见 CloudBase 环境[\s\S]*?set -o pipefail/, yaml],
  ['步骤 5 含 set -o pipefail', /name: 查询目标环境静态托管详情[\s\S]*?set -o pipefail/, yaml],
  ['步骤 4 失败 exit 1', /LIST_RC[\s\S]*?exit 1/, yaml],
  ['步骤 5 失败 exit 1', /DETAIL_RC[\s\S]*?exit 1/, yaml],
  ['步骤 4 含脱敏 grep', /list-env[\s\S]*?grep -v -i -E "secret\|api\[_-\]\?key\|token\|password\|credential"/, yaml],
  ['步骤 5 含脱敏 grep', /detail\.err[\s\S]*?grep -v -i -E "secret\|api\[_-\]\?key\|token\|password\|credential"/, yaml],
  ['步骤 4 不再掩盖失败（无 || echo）', !/tcb env list[^|]*\|\| echo/.test(yaml)],
  ['步骤 5 不再掩盖失败（无 || echo）', !/tcb hosting detail[^|]*\|\| echo/.test(yaml)],
];
let ok = 0, fail = 0;
const failed = [];
for (const [name, pass] of checks) {
  const result = typeof pass === 'boolean' ? pass : pass.test(yaml);
  console.log((result ? '✓' : '✗') + '  ' + name);
  if (!result) failed.push(name);
  result ? ok++ : fail++;
}
console.log('---');
console.log('通过 ' + ok + ' / ' + checks.length);
console.log('字节数：' + yaml.length);
if (failed.length) console.log('失败项：' + failed.join(' / '));
