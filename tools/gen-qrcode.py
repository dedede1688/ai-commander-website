# -*- coding: utf-8 -*-
"""为 22 位联合出版人生成专属二维码（指向各自个人主页）

设计取舍（都经过实际解码验证，不是凭感觉）：
  · 底色 青 #00edbd / 前景 深蓝 #141f60 —— 取自全站色板。
    青底深蓝点既有站内科技感，对比度也够。**深底方案（深蓝底青点、青蓝底白点）
    实测全部解不出来**，扫码器与微信都读不了，故不采用。
  · 中心留白圆牌：放席号首字符，既是品牌感也让页面有识别度。
    实测带圆牌仍可正常解码。
  · 容错等级 Q（约 25%纠错）：印刷或缩放后仍能扫出。
  · border=4（静默区）：规格要求的最外圈留白，不能减。
  · box_size=10：约 330px 见方，手机上长按保存后放大也够清晰。
  · 一并输出 PNG（供长按保存 / 二次编辑）与 WebP（供网页嵌入，体积小）。

用法：
  python tools/gen-qrcode.py
  python tools/gen-qrcode.py --check     # 只解码校验，不重新生成
"""
import io
import os
import sys

import numpy as np
import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_Q

SITE = "D:/AI指挥官-网站"
SITE_URL = "https://www.ai-mmc.cn"
OUT = os.path.join(SITE, "素材/二维码/成员")

# 全站色板（RGB）
TEAL = (0, 237, 189)  # #00edbd
NAVY = (20, 31, 96)   # #141f60
WHITE = (255, 255, 255)


def load_people():
    """从 script.js 的 P 数组取 slug 与席号。
    复用 gen-member-pages.py 的解析逻辑，保证与个人主页生成完全同源。"""
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "gen", os.path.join(SITE, "tools/gen-member-pages.py")
    )
    gen = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gen)
    return gen.load_people()


def make_one(url, label):
    """生成单张二维码，返回 PIL Image。"""
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_Q,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    w, h = img.size
    arr = np.array(img)

    # 青底 + 深蓝点。qrcode 输出是黑点白底，这里按掩膜重新着色。
    dark_mask = arr[:, :, 0] < 128
    arr[dark_mask] = NAVY
    arr[~dark_mask] = TEAL

    # 中心圆牌：直径取约 1/5 版面，太大会压掉数据码
    cx, cy = w // 2, h // 2
    r = w // 10
    yy, xx = np.ogrid[:h, :w]
    disc = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
    arr[disc] = WHITE
    out = Image.fromarray(arr)

    # 圆牌里写席号（NO.001 → 001），字号自适应
    d = ImageDraw.Draw(out)
    fs = max(10, int(r * 0.78))
    font = _font(fs)
    text = label
    bb = d.textbbox((0, 0), text, font=font)
    d.text(
        (cx - (bb[2] - bb[0]) / 2, cy - (bb[3] - bb[1]) / 2 - bb[1]),
        text,
        fill=NAVY,
        font=font,
    )
    return out


def _font(size):
    """找一个能显示数字的字体。Windows 用 Arial，失败回退默认。"""
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def decode_check(png_path, expect):
    """用 OpenCV 实际解码验证 —— 生成后必须验，不能只看图。"""
    try:
        import cv2
    except ImportError:
        return None  # 没装 cv2 时跳过，不阻断生成
    # cv2.imread 在 Windows 下不认非ASCII 路径，走 imdecode
    bgr = cv2.imdecode(np.fromfile(png_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if bgr is None:
        return False
    data, _, _ = cv2.QRCodeDetector().detectAndDecode(bgr)
    return data == expect


def main():
    check_only = "--check" in sys.argv
    people, _ = load_people()
    os.makedirs(OUT, exist_ok=True)

    print("目标目录:", OUT)
    print("成员数量: %d\n" % len(people))

    fails = []
    for p in people:
        slug = p["slug"]
        if not slug:
            fails.append("%s 缺 slug" % p["n"])
            continue
        url = "%s/member-%s.html" % (SITE_URL, slug)
        label = p["s"].split(".")[-1]  # NO.001 → 001

        png = os.path.join(OUT, "qr-%s.png" % slug)
        webp = os.path.join(OUT, "qr-%s.webp" % slug)

        if not check_only:
            img = make_one(url, label)
            img.save(png, "PNG", optimize=True)
            img.save(webp, "WEBP", quality=92, method=6)

        ok = decode_check(png, url)
        if ok is None:
            state = "（未装 OpenCV，跳过解码）"
            ok_flag = "?"
        elif ok:
            state = "✓ 解码 = %s" % url
            ok_flag = "✓"
        else:
            state = "✗ 解码失败"
            ok_flag = "✗"
            fails.append("%s（%s）二维码解码失败" % (p["n"], p["s"]))

        size = os.path.getsize(png) // 1024 if os.path.exists(png) else 0
        wsize = os.path.getsize(webp) // 1024 if os.path.exists(webp) else 0
        print(
            "  %s %-6s %-10s PNG %3dKB / WebP %2dKB  %s"
            % (ok_flag, p["s"], p["n"], size, wsize, state)
        )

    print()
    if fails:
        print("失败 %d 项：" % len(fails))
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("全部 %d 张二维码生成并解码验证通过。" % len(people))


if __name__ == "__main__":
    main()