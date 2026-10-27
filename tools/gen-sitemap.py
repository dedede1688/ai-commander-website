# -*- coding: utf-8 -*-
"""从统一成员数据生成 sitemap.xml。
 *
 * 为什么要脚本生成而不是手写：
 * 名单会变（计划扩到 30 席联合出版人 + 10 位特约编委），
 * 手写 sitemap 必然与 P 数组脱节 —— 页面上线了、sitemap 里没有，
 * 搜索引擎就发现不了，等于白做。
 *
 * 用法：python tools/gen-sitemap.py
"""
import io
import os
import importlib.util

SITE = "D:/AI指挥官-网站"
SITE_URL = "https://www.ai-mmc.cn"
LASTMOD = "2026-10-22"

spec = importlib.util.spec_from_file_location(
    "gen", os.path.join(SITE, "tools/gen-member-pages.py")
)
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)
people, _ = gen.load_people()

# 固定页在前。优先级：首页最高；个人主页是长尾内容，给中低值，
# 避免 22 条个人页把真正的转化页（先锋营）挤下去。
STATIC = [
    ("/", "weekly", "1.0"),
    ("xianfeng.html", "daily", "0.9"),
    ("models.html", "weekly", "0.8"),
    ("book.html", "weekly", "0.9"),
    ("builders.html", "weekly", "0.9"),
    ("outcomes.html", "weekly", "0.8"),
    ("enterprise.html", "weekly", "0.8"),
    ("learning.html", "weekly", "0.8"),
    ("cooperate.html", "weekly", "0.8"),
]

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]

for path, freq, pri in STATIC:
    lines += [
        "  <url>",
        "    <loc>%s/%s</loc>" % (SITE_URL, path) if path != "/" else "    <loc>%s/</loc>" % SITE_URL,
        "    <lastmod>%s</lastmod>" % LASTMOD,
        "    <changefreq>%s</changefreq>" % freq,
        "    <priority>%s</priority>" % pri,
        "  </url>",
    ]

for p in people:
    slug = p["slug"]
    if not slug:
        continue
    lines += [
        "  <url>",
        "    <loc>%s/member-%s.html</loc>" % (SITE_URL, slug),
        "    <lastmod>%s</lastmod>" % LASTMOD,
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.5</priority>",
        "  </url>",
    ]

lines.append("</urlset>")
out = "\n".join(lines) + "\n"

io.open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8", newline="").write(out)

print("sitemap.xml 已生成：")
print("  固定页%d 个 + 个人主页 %d 个 = %d 条" % (len(STATIC), len(people), len(STATIC) + len(people)))
