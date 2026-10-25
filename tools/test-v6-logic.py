#!/usr/bin/env python3
"""v6 解析逻辑的本地单元测试。

覆盖 7 个场景：
1. 正常匹配（DNS CNAME == MATCHED 环境的 StaticDomain && EnvId == ACTIVE_ENV）
2. EnvId 错误（DNS CNAME 匹配，但 EnvId ≠ ACTIVE_ENV）
3. 域名错误（DNS CNAME ≠ MATCHED 环境的 StaticDomain）
4. 多重匹配（多个环境 CDN 域名都等于 DNS CNAME）
5. 数据缺失（API 响应缺 StaticStorages 字段）
6. 顶层是 list（兼容）
7. ACTIVE_ENV 为空（vars/secrets 都没设）

核心逻辑直接从 diagnose-env.yml 提取（保持一致）。
"""
import json
import os
import sys
import tempfile
# stdout 用 UTF-8（默认 GBK 撞 unicode 报错）
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# ===== 提取自 diagnose-env.yml 的解析逻辑 =====
def parse_env_list(json_path, dns_cname, active_env):
    """模拟 v6 步骤 4 的 python 解析逻辑"""
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
    except Exception as ex:
        return {'STATUS': 'PARSE_ERROR', 'ERROR': f'{type(ex).__name__}: {ex}'}

    if isinstance(data, list):
        envs = data
    elif isinstance(data, dict):
        envs = (data.get('data') or data.get('Data') or
                data.get('Envs') or data.get('envs') or [])
    else:
        envs = []

    if not envs:
        return {
            'STATUS': 'EMPTY', 'COUNT': 0, 'MATCH_COUNT': 0,
            'DIRECT_MATCH': 'no', 'MULTI_MATCH': 'no', 'HAS_STATIC_DOMAINS': 'no',
            'MATCHED_ALIASES': '',
        }

    matched_aliases = []
    matched_env_ids_for_compare = []
    has_static_domains = False
    aliases = []
    static_domains = []

    for e in envs:
        alias = e.get('Alias') or e.get('alias') or '?'
        env_id = e.get('EnvId') or e.get('envId') or ''
        aliases.append(alias)
        static_storages = (e.get('StaticStorages') or e.get('staticStorages') or [])
        if not static_storages:
            continue
        has_static_domains = True
        for ss in static_storages:
            if isinstance(ss, dict):
                sd = (ss.get('StaticDomain') or ss.get('staticDomain') or '').strip()
                if sd:
                    static_domains.append(sd)
                    if dns_cname and sd == dns_cname:
                        matched_aliases.append(alias)
                        if env_id:
                            matched_env_ids_for_compare.append(env_id)
                        break

    match_count = len(matched_aliases)
    multi_match = 'yes' if match_count > 1 else 'no'
    has_static = 'yes' if has_static_domains else 'no'

    if match_count == 1 and matched_env_ids_for_compare:
        direct_match = 'yes' if (active_env and matched_env_ids_for_compare[0] == active_env) else 'no'
    else:
        direct_match = 'no'

    return {
        'STATUS': 'OK',
        'COUNT': len(envs),
        'ALIASES': ','.join(aliases),
        'MATCHED_ALIASES': ','.join(matched_aliases),
        'MATCH_COUNT': match_count,
        'DIRECT_MATCH': direct_match,
        'MULTI_MATCH': multi_match,
        'HAS_STATIC_DOMAINS': has_static,
    }


# ===== 测试场景 =====
def run_scenario(name, mock_json, dns_cname, active_env, expected):
    """运行一个测试场景，返回通过/失败"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(mock_json, f)
        path = f.name
    try:
        result = parse_env_list(path, dns_cname, active_env)
    finally:
        os.unlink(path)

    print(f'\n=== 场景 {name} ===')
    print(f'DNS CNAME: {dns_cname!r}')
    print(f'ACTIVE_ENV: {active_env!r}')
    print(f'期望: {expected}')
    print(f'实际: MATCH_COUNT={result.get("MATCH_COUNT")}, '
          f'DIRECT_MATCH={result.get("DIRECT_MATCH")}, '
          f'MULTI_MATCH={result.get("MULTI_MATCH")}, '
          f'HAS_STATIC_DOMAINS={result.get("HAS_STATIC_DOMAINS")}, '
          f'MATCHED_ALIASES={result.get("MATCHED_ALIASES")!r}')

    pass_count = 0
    fail_count = 0
    for key, want in expected.items():
        got = result.get(key)
        if got == want:
            pass_count += 1
        else:
            fail_count += 1
            print(f'  ✗ {key}: 期望 {want!r}, 实际 {got!r}')

    if fail_count == 0:
        print(f'✅ 通过（{pass_count} 项断言全过）')
        return True
    else:
        print(f'❌ 失败（{fail_count} 项断言失败）')
        return False


# Mock 数据模板
DNS_TARGET = 'www.ai-mmc.cn.tcbaccess.tencentcloudbase.com.'
ACTIVE_ENV = 'ai-mmc-2g4gxl0t5b5731c8'
WRONG_ENV = 'ai-commander-d9g2lggrtb79054a6'
DIFFERENT_DOMAIN = 'www.different-env.cn.tcbaccess.tencentcloudbase.com.'


def make_env(alias, env_id, static_domains=None):
    """构造一个环境对象"""
    env = {'EnvId': env_id, 'Alias': alias, 'Region': 'ap-shanghai', 'Status': 'NORMAL'}
    if static_domains is not None:
        env['StaticStorages'] = [{'StaticDomain': d} for d in static_domains]
    return env


# 场景 1：正常匹配（DNS == StaticDomain && EnvId == ACTIVE_ENV）
scenario1 = run_scenario(
    '1. 正常匹配',
    {'data': [make_env('ai-mmc', ACTIVE_ENV, [DNS_TARGET])]},
    DNS_TARGET, ACTIVE_ENV,
    {
        'STATUS': 'OK',
        'COUNT': 1,
        'MATCH_COUNT': 1,
        'DIRECT_MATCH': 'yes',  # EnvId == ACTIVE_ENV
        'MULTI_MATCH': 'no',
        'HAS_STATIC_DOMAINS': 'yes',
        'MATCHED_ALIASES': 'ai-mmc',
    }
)

# 场景 2：EnvId 错误（DNS 匹配，但 EnvId ≠ ACTIVE_ENV）
scenario2 = run_scenario(
    '2. EnvId 错误',
    {'data': [make_env('ai-mmc', WRONG_ENV, [DNS_TARGET])]},  # 名字像 ai-mmc 但 EnvId 不同
    DNS_TARGET, ACTIVE_ENV,
    {
        'STATUS': 'OK',
        'COUNT': 1,
        'MATCH_COUNT': 1,
        'DIRECT_MATCH': 'no',  # EnvId != ACTIVE_ENV → DIRECT_MATCH=no
        'MULTI_MATCH': 'no',
        'HAS_STATIC_DOMAINS': 'yes',
        'MATCHED_ALIASES': 'ai-mmc',
    }
)

# 场景 3：域名错误（DNS CNAME ≠ 任何环境的 StaticDomain）
scenario3 = run_scenario(
    '3. 域名错误',
    {'data': [make_env('ai-mmc', ACTIVE_ENV, [DIFFERENT_DOMAIN])]},  # 域名不对
    DNS_TARGET, ACTIVE_ENV,
    {
        'STATUS': 'OK',
        'COUNT': 1,
        'MATCH_COUNT': 0,  # 无匹配
        'DIRECT_MATCH': 'no',
        'MULTI_MATCH': 'no',
        'HAS_STATIC_DOMAINS': 'yes',
        'MATCHED_ALIASES': '',
    }
)

# 场景 4：多重匹配（两个环境的 StaticDomain 都 == DNS CNAME）
scenario4 = run_scenario(
    '4. 多重匹配',
    {'data': [
        make_env('ai-mmc', ACTIVE_ENV, [DNS_TARGET]),
        make_env('ai-mmc-other', 'other-env-xxx', [DNS_TARGET]),  # 名字不同但 CDN 域名相同
    ]},
    DNS_TARGET, ACTIVE_ENV,
    {
        'STATUS': 'OK',
        'COUNT': 2,
        'MATCH_COUNT': 2,
        'DIRECT_MATCH': 'no',  # 多重匹配时 DIRECT_MATCH=no（不唯一）
        'MULTI_MATCH': 'yes',  # ⚠️ EnvId 唯一性无法保证
        'HAS_STATIC_DOMAINS': 'yes',
        'MATCHED_ALIASES': 'ai-mmc,ai-mmc-other',
    }
)

# 场景 5：数据缺失（API 响应缺 StaticStorages 字段）
scenario5 = run_scenario(
    '5. 数据缺失',
    {'data': [make_env('ai-mmc', ACTIVE_ENV, None)]},  # StaticStorages=None
    DNS_TARGET, ACTIVE_ENV,
    {
        'STATUS': 'OK',
        'COUNT': 1,
        'MATCH_COUNT': 0,  # 无静态域名可对比
        'DIRECT_MATCH': 'no',
        'MULTI_MATCH': 'no',
        'HAS_STATIC_DOMAINS': 'no',  # ⚠️ 字段缺失
        'MATCHED_ALIASES': '',
    }
)

# 场景 6（额外）：顶层是 list 而非 {data:[..]}
scenario6 = run_scenario(
    '6. 顶层是 list（兼容）',
    [make_env('ai-mmc', ACTIVE_ENV, [DNS_TARGET])],
    DNS_TARGET, ACTIVE_ENV,
    {
        'STATUS': 'OK',
        'COUNT': 1,
        'MATCH_COUNT': 1,
        'DIRECT_MATCH': 'yes',
        'MULTI_MATCH': 'no',
        'HAS_STATIC_DOMAINS': 'yes',
        'MATCHED_ALIASES': 'ai-mmc',
    }
)

# 场景 7（额外）：ACTIVE_ENV 为空（vars/secrets 都没设）
scenario7 = run_scenario(
    '7. ACTIVE_ENV 为空',
    {'data': [make_env('ai-mmc', ACTIVE_ENV, [DNS_TARGET])]},
    DNS_TARGET, '',  # ACTIVE_ENV 空
    {
        'STATUS': 'OK',
        'COUNT': 1,
        'MATCH_COUNT': 1,
        'DIRECT_MATCH': 'no',  # ACTIVE_ENV 空无法比对 → no（保守）
        'MULTI_MATCH': 'no',
        'HAS_STATIC_DOMAINS': 'yes',
        'MATCHED_ALIASES': 'ai-mmc',
    }
)

# ===== 汇总 =====
print('\n' + '=' * 50)
all_scenarios = [scenario1, scenario2, scenario3, scenario4, scenario5, scenario6, scenario7]
passed = sum(all_scenarios)
total = len(all_scenarios)
print(f'总计: {passed}/{total} 场景通过')
if passed == total:
    print('✅ 所有场景验证通过')
    sys.exit(0)
else:
    print(f'❌ {total - passed} 个场景失败')
    sys.exit(1)
