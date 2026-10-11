# -*- coding: utf-8 -*-
"""生成《AI指挥官》社交分享图（og:image）1200×630
 *
 * 为什么需要单独生成：
 *   原来的 og:image 指向竖版立体书（426×640）。微信、微博、飞书分享时
 *   横版图会被裁成小方块或留大片空白，书名与作者完全看不清。
 *   1200×630 是三大平台通用摘要图尺寸，也是百度分享卡片的最小要求。
 *
 * 设计与站内 base.css 的色板保持一致：
 *   --navy #141f60 / --navy-d #0d1440 / --teal #00edbd
 *
 * 用法：python tools/make-og-image.py
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W, H = 1200, 630
NAVY_D = (13, 20, 64)
NAVY = (20, 31, 96)
TEAL = (0, 237, 189)
GREY = (169, 182, 216)
WHITE = (255, 255, 255)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "素材", "书籍", "AI指挥官-立体书.webp")
OUT_DIR = os.path.join(ROOT, "素材", "og")
OUT = os.path.join(OUT_DIR, "ai-commander-og-1200x630.webp")

FONT_R = "C:/Windows/Fonts/msyh.ttc"
FONT_B = "C:/Windows/Fonts/msyhbd.ttc"


def font(path, size):
    return ImageFont.truetype(path, size)


def main():
    # ---------- 背景：深蓝竖向渐变 + 右侧光晕 ----------
    img = Image.new("RGB", (W, H), NAVY_D)
    px = img.load()
    for y in range(H):
        t = y / H
        # 上深下浅，让视线自然落到书名
        r = int(NAVY_D[0] + (NAVY[0] - NAVY_D[0]) * (1 - t) * 0.55)
        g = int(NAVY_D[1] + (NAVY[1] - NAVY_D[1]) * (1 - t) * 0.55)
        b = int(NAVY_D[2] + (NAVY[2] - NAVY_D[2]) * (1 - t) * 0.55)
        for x in range(W):
            px[x, y] = (r, g, b)

    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    # 右下方一团青色辉光，与 logo 的青色呼应
    gd.ellipse([W - 620, H - 560, W + 260, H + 320], fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    img = Image.composite(Image.new("RGB", (W, H), (0, 120, 110)), img, glow)
    d = ImageDraw.Draw(img)

    # ---------- 顶部细线 + 品牌标识 ----------
    d.rectangle([0, 0, W, 5], fill=TEAL)
    d.text((72, 52), "AI COMMANDER", font=font(FONT_B, 22), fill=TEAL)

    # ---------- 主标题 ----------
    d.text((72, 168), "《AI指挥官》", font=font(FONT_B, 96), fill=WHITE)
    # 作者行：青色书名号 + 白色人名，视觉上让「胡子老师 著」退半步
    d.text((76, 292), "胡子老师", font=font(FONT_B, 40), fill=TEAL)
    w = d.textlength("胡子老师", font=font(FONT_B, 40))
    d.text((76 + w + 16, 296), "著", font=font(FONT_R, 30), fill=GREY)

    # ---------- 副标题 ----------
    d.text((72, 368), "从新兵到将军的 30 堂本地 AI 实战课", font=font(FONT_R, 38), fill=WHITE)

    # ---------- 卖点三连（底部一行，用圆点分隔） ----------
    # 文字安全区：右侧 540px 留给书影，超出部分拆成两行，绝不压到书
    meta = "8 篇 31 章 + 9 附录 · 九级军衔进阶"
    d.text((72, 452), meta, font=font(FONT_R, 25), fill=GREY)
    d.text((72, 490), "在自己的电脑上跑通大模型", font=font(FONT_R, 25), fill=GREY)

    # ---------- 标语 ----------
    d.text((72, 546), "AI 是参谋，你是司令", font=font(FONT_B, 28), fill=TEAL)

    # ---------- 右侧书影（带投影，模拟立体书立起来） ----------
    if os.path.exists(BOOK):
        bk = Image.open(BOOK).convert("RGBA")
        # 按高度缩放到画布 74%，宽度必须给左侧文字留出安全区（≥520px）
        target_h = int(H * 0.74)
        ratio = target_h / bk.height
        bk = bk.resize((max(1, int(bk.width * ratio)), target_h), Image.LANCZOS)
        bx = W - bk.width - 78
        by = (H - bk.height) // 2

        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rectangle([bx + 14, by + 20, bx + bk.width + 14, by + bk.height + 20], fill=(0, 0, 0, 110))
        shadow = shadow.filter(ImageFilter.GaussianBlur(26))
        img.paste(shadow, (0, 0), shadow)
        img.paste(bk, (bx, by), bk)
    else:
        print("[warn] 未找到立体书，输出纯文字版：", BOOK)

    os.makedirs(OUT_DIR, exist_ok=True)
    img.save(OUT, "WEBP", quality=88, method=6)
    print("[ok] 生成", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()