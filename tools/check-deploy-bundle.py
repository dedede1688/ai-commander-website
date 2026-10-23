# -*- coding: utf-8 -*-
"""在部署包内做一次闭环引用检查

前面的校验都在项目根目录跑，但 CI 打包的是 _site/。
若某个资源引用在根目录能找到、在打包后被漏掉（或路径写法有差异），
只有在这里才暴露得出来。相当于上线前的最后一道闸。
"""
import io
import os
import re

import sys
SITE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/_site_test"

problems = []

# 站内资源扩展名白名单：只校验这些是真的文件引用
ASSET_EXT = (
    ".css",
    ".js",
    ".html",
    ".png",
    ".webp",
    ".jpg",
    ".jpeg",
    ".svg",
    ".ico",
    ".xml",
    ".txt",
)


def strip_query(ref):
    """剥掉 ?v=N 缓存参数 —— 线上文件名不带这个，但浏览器照样能取到。
    忘记剥会把所有带版本号的资源误判成缺失。"""
    return ref.split("?")[0]


print("部署包闭环引用检查")
print("=" * 62)
print("包位置:", SITE)
print()

# 1. 个人主页 → 站内资源
pages = [f for f in os.listdir(SITE) if f.startswith("member-") and f.endswith(".html")]
print("个人主页 %d 个，检查其引用的资源是否都在包内" % len(pages))

for f in sorted(pages):
    t = io.open(os.path.join(SITE, f), encoding="utf-8").read()
    refs = set(re.findall(r'(?:src|href)="([^"#:]+?)"', t))
    for r in refs:
        if r.startswith("http") or r.startswith("#"):
            continue
        path = strip_query(r)
        # 只校验静态资源，锚点/查询类链接跳过
        if not path.lower().endswith(ASSET_EXT):
            continue
        if not os.path.exists(os.path.join(SITE, path)):
            problems.append("%s 引用缺失: %s" % (f, r))

print("  ✓ 检查完毕" if not problems else "  ✗ 见下方问题")

# 2. 现有三页 → 站内资源
print()
for f in ("index.html", "book.html", "builders.html", "outcomes.html", "enterprise.html", "learning.html", "cooperate.html", "explore.html", "models.html", "xianfeng.html"):
    p = os.path.join(SITE, f)
    if not os.path.exists(p):
        problems.append("包内缺少 %s" % f)
        continue
    t = io.open(p, encoding="utf-8").read()
    refs = set(re.findall(r'(?:src|href)="([^"#:]+?)"', t))
    for r in refs:
        if r.startswith("http") or r.startswith("#"):
            continue
        path = strip_query(r)
        if not path.lower().endswith(ASSET_EXT):
            continue
        if not os.path.exists(os.path.join(SITE, path)):
            problems.append("%s 引用缺失: %s" % (f, r))

print("主要栏目引用检查完毕")

# 3. 二维码：每张图在包内，且页面引用的是本人那张
print()
qrdir = os.path.join(SITE, "素材/二维码/成员")
qr_files = [f for f in os.listdir(qrdir) if f.endswith(".png")] if os.path.isdir(qrdir) else []
print("二维码 PNG %d 张" % len(qr_files))
for f in sorted(pages):
    t = io.open(os.path.join(SITE, f), encoding="utf-8").read()
    expected = "素材/二维码/成员/qr-%s.png" % f[len("member-"):-len(".html")]
    image_refs = [strip_query(src) for src in re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', t)]
    if expected not in image_refs:
        problems.append("%s 未引用本人主页二维码: %s" % (f, expected))
        continue
    if not os.path.exists(os.path.join(SITE, expected)):
        problems.append("%s 引用的二维码不在包内: %s" % (f, expected))

# 4. sitemap 里的 URL 在包内都有对应文件
print()
sm = io.open(os.path.join(SITE, "sitemap.xml"), encoding="utf-8").read()
locs = re.findall(r"<loc>([^<]+)</loc>", sm)
print("sitemap %d 条，核验对应文件是否在包内" % len(locs))
for u in locs:
    path = u.replace("https://www.ai-mmc.cn/", "")
    if path in ("", "/"):
        path = "index.html"
    if not os.path.exists(os.path.join(SITE, path)):
        problems.append("sitemap 条目无对应文件: %s" % u)

# 5. 敏感/不该上线的文件
print()
print("包内容禁项检查")
banned = [
    "上线操作手册.md",
    "胡子老师介绍.md",
    "NO022_胡子老师.webp",
    # 归档文件与内部文档不得进入发布包（2026-10-22 旧资料页精简）
    "docs",
    "2026-10-22-explore-legacy.html",
]
for b in banned:
    if os.path.exists(os.path.join(SITE, b)):
        problems.append("包内含不应上线文件: %s" % b)
print("  ✓ 手册/介绍/作者照片均未进入包" if not any("不应上线" in x for x in problems) else "  ✗ 见问题")

# 6. 体积分布
print()
print("包体积分布")
for d in sorted(os.listdir(SITE)):
    p = os.path.join(SITE, d)
    if os.path.isdir(p):
        size = sum(
            os.path.getsize(os.path.join(r, f))
            for r, _, fs in os.walk(p)
            for f in fs
        )
        cnt = sum(len(fs) for _, _, fs in os.walk(p))
        print("  %-22s %6.1f KB  %3d 个文件" % (d, size / 1024, cnt))

print()
print("=" * 62)
if problems:
    print("发现 %d 个问题（阻断部署）：" % len(problems))
    for x in problems:
        print("  -", x)
else:
    print("部署包闭环检查全部通过。")
print("=" * 62)
sys.exit(1 if problems else 0)
