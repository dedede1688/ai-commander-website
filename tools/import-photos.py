# -*- coding: utf-8 -*-
"""联合出版人照片批量转换为WebP
 *
 * 源文件：D:/《AI指挥官》设计/05_营销方案/联合出版人资料/照片/ 下的 jpg 与 png
 * 输出：  素材/照片/NO0XX_姓名.webp
 *
 * 规格说明：
 *   - 站内展示为 76×76 圆形头像（.rc-photo）与 96×96（.m-photo），
 *     object-position: center top —— 所以按 3:4 竖版裁切、保留头顶，
 *     放大到 170×240 后浏览器自行裁成圆形，不会切到下巴。
 *   - 与站内已有照片（如 NO019_牛顿老师.webp）保持同规格，便于统一控制体积。
 *
 * 用法：python tools/import-photos.py
"""
from PIL import Image
import os
import glob
import sys

SRC = "D:/《AI指挥官》设计/05_营销方案/联合出版人资料/照片"
DST = "D:/AI指挥官-网站/素材/照片"
OUT_W, OUT_H = 170, 240
QUALITY = 82


def crop_to_ratio(img, ratio=3 / 4, anchor="top"):
    """按目标比例居中/顶部裁切，保证人脸与头顶都在画面内"""
    w, h = img.size
    if w / h > ratio:
        # 太宽 → 裁两侧
        new_w = int(h * ratio)
        left = (w - new_w) // 2
        box = (left, 0, left + new_w, h)
    else:
        # 太高 → 裁下方（保留头顶）
        new_h = int(w / ratio)
        top = 0 if anchor == "top" else (h - new_h) // 2
        box = (0, top, w, top + new_h)
    return img.crop(box)


def main():
    if not os.path.isdir(SRC):
        print("[错误] 源目录不存在：", SRC)
        sys.exit(1)
    os.makedirs(DST, exist_ok=True)

    files = [
        f
        for f in glob.glob(os.path.join(SRC, "*"))
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    files.sort()

    ok = 0
    for f in files:
        base = os.path.splitext(os.path.basename(f))[0]
        # NO005_郭瑞元 → NO005_郭瑞元.webp
        out = os.path.join(DST, base + ".webp")
        try:
            img = Image.open(f)
            # 统一转RGB（PNG 可能带透明通道，透明会变黑块）
            if img.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", img.size, (255, 255, 255))
                img = img.convert("RGBA")
                bg.paste(img, mask=img.split()[-1])
                img = bg
            else:
                img = img.convert("RGB")

            img = crop_to_ratio(img, anchor="top")
            img = img.resize((OUT_W, OUT_H), Image.LANCZOS)
            img.save(out, "WEBP", quality=QUALITY, method=6)
            print(
                f"  ✓ {base}.webp  {os.path.getsize(out)//1024:>3d} KB"
            )
            ok += 1
        except Exception as e:
            print(f"  ✗ {base}：{e}")

    print(f"\n共转换 {ok}/{len(files)} 张 → {DST}")


if __name__ == "__main__":
    main()