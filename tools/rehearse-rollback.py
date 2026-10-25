#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""回退演练：只在本地临时目录里模拟「覆盖恢复」和「完整回退」，不接触线上。

用法：
  python tools/rehearse-rollback.py \
    --site _release/2026-10-23/site \
    --live _release/2026-10-23/rollback/live-20261023 \
    --work _final_verify/release-guard-20261023/rollback-rehearsal

覆盖恢复：用线上旧文件覆盖新包，不删除新文件。结果：旧内容恢复，但新页面/新素材仍在。
完整回退：先删除本次新增文件，再用线上旧文件覆盖。结果：文件集合与哈希完全回到上线前。
"""
import argparse
import hashlib
import json
import os
import shutil
import sys

KEEP = {"CNAME"}  # 域名文件不随版本变化，回退时保留


def walk(root):
    out = []
    for dirpath, _, files in os.walk(root):
        for name in files:
            out.append(os.path.relpath(os.path.join(dirpath, name), root).replace(os.sep, "/"))
    return sorted(out)


def sha(path, chunk=1 << 20):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(chunk), b""):
            h.update(block)
    return h.hexdigest()


def live_map(live_dir):
    mapping = {}
    pages = os.path.join(live_dir, "pages")
    assets = os.path.join(live_dir, "assets")
    for name in os.listdir(pages):
        path = os.path.join(pages, name)
        if os.path.isfile(path):
            mapping[name] = path
    for dirpath, _, files in os.walk(assets):
        for name in files:
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, assets).replace(os.sep, "/")
            mapping[rel] = path
    return mapping


def copy_over(src_map, dest_root):
    for rel, src in src_map.items():
        dest = os.path.join(dest_root, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True) if os.path.dirname(dest) else None
        shutil.copy2(src, dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default="_release/2026-10-23/site")
    ap.add_argument("--live", default="_release/2026-10-23/rollback/live-20261023")
    ap.add_argument("--work", default="_final_verify/release-guard-20261023/rollback-rehearsal")
    ap.add_argument("--report", default="_release/2026-10-23/rollback/rehearsal-report.json")
    args = ap.parse_args()

    site = os.path.abspath(args.site)
    live = os.path.abspath(args.live)
    work = os.path.abspath(args.work)
    for path, label in ((site, "发布包"), (live, "线上备份")):
        if not os.path.isdir(path):
            print(f"{label}目录不存在：{path}")
            return 1

    live_files = live_map(live)
    site_files = {rel: os.path.join(site, rel) for rel in walk(site)}
    release_only = set(site_files) - set(live_files)
    keep_files = sorted(release_only & KEEP)
    new_files = sorted(release_only - KEEP)
    removed_files = sorted(set(live_files) - set(site_files))
    common = sorted(set(site_files) & set(live_files))
    modified = [rel for rel in common if sha(site_files[rel]) != sha(live_files[rel])]

    if os.path.isdir(work):
        shutil.rmtree(work)
    os.makedirs(work)

    # ---------- 覆盖恢复 ----------
    overlay = os.path.join(work, "overlay")
    shutil.copytree(site, overlay)
    copy_over(live_files, overlay)
    overlay_hashes_ok = all(sha(os.path.join(overlay, rel)) == sha(src) for rel, src in live_files.items())
    overlay_left = sorted(set(walk(overlay)) - set(live_files))
    overlay_left_new = [p for p in overlay_left if p not in KEEP]
    overlay_keep = [p for p in overlay_left if p in KEEP]

    # ---------- 完整回退 ----------
    full = os.path.join(work, "full")
    shutil.copytree(site, full)
    for rel in new_files:
        os.remove(os.path.join(full, rel))
    copy_over(live_files, full)
    full_files = set(walk(full))
    expected = set(live_files) | KEEP
    full_set_ok = full_files == expected
    full_hashes_ok = all(sha(os.path.join(full, rel)) == sha(src) for rel, src in live_files.items())

    report = {
        "site": os.path.relpath(site).replace(os.sep, "/"),
        "live": os.path.relpath(live).replace(os.sep, "/"),
        "work": os.path.relpath(work).replace(os.sep, "/"),
        "counts": {
            "releaseFiles": len(site_files),
            "liveFiles": len(live_files),
            "newFiles": len(new_files),
            "keepFiles": len(keep_files),
            "removedFiles": len(removed_files),
            "modifiedFiles": len(modified),
        },
        "newFiles": new_files,
        "keepFiles": keep_files,
        "removedFiles": removed_files,
        "modifiedFiles": modified,
        "overlay": {
            "description": "覆盖恢复：旧文件覆盖新包，不删除新增文件",
            "liveHashesRestored": overlay_hashes_ok,
            "leftoverNewFiles": overlay_left_new,
            "keptFiles": overlay_keep,
        },
        "full": {
            "description": "完整回退：删除新增文件后覆盖旧文件",
            "fileSetMatchesLivePlusKeep": full_set_ok,
            "liveHashesRestored": full_hashes_ok,
            "unexpectedFiles": sorted(full_files - expected),
            "missingFiles": sorted(expected - full_files),
        },
    }

    report_path = os.path.abspath(args.report)
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    rollback_dir = os.path.dirname(report_path)
    with open(os.path.join(rollback_dir, "NEW-FILES.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(new_files) + ("\n" if new_files else ""))
    with open(os.path.join(rollback_dir, "REMOVED-FILES.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(removed_files) + ("\n" if removed_files else ""))

    print("回退演练（仅本地临时目录）")
    print("=" * 56)
    print(f"发布包 {len(site_files)} 个文件；线上备份 {len(live_files)} 个文件")
    print(f"新增 {len(new_files)}（另保留平台文件 {len(keep_files)} 个）；线上有而新包没有 {len(removed_files)}；内容不同 {len(modified)}")
    print(f"覆盖恢复：旧文件哈希全部还原 = {overlay_hashes_ok}；仍留在站上的新增文件 = {len(overlay_left_new)}")
    print(f"完整回退：文件集合与线上+保留文件一致 = {full_set_ok}；旧文件哈希全部还原 = {full_hashes_ok}")
    print(f"报告：{os.path.relpath(report_path)}")
    ok = overlay_hashes_ok and full_set_ok and full_hashes_ok
    if not ok:
        print("演练未通过，请检查报告。")
        return 1
    print("演练通过：两种回退路径都可在本地还原线上版本。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
