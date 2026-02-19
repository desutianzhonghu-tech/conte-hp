#!/usr/bin/env python3
"""
conte.jpeg — Instagram ハイライト用テンプレート生成
1080x1920px（ストーリーサイズ）
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.expanduser('~/Desktop/conte-highlight')
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1080, 1920

# Colors
DARK_BROWN = (61, 47, 40)
CREAM = (250, 249, 247)
TAUPE = (107, 93, 84)

# Fonts
MINCHO = '/System/Library/Fonts/ヒラギノ明朝 ProN.ttc'
SERIF = '/System/Library/Fonts/Supplemental/PTSerif.ttc'


def get_font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except:
        return ImageFont.load_default()


def draw_centered_text(draw, text, y, font, fill):
    """テキストを中央揃えで描画"""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)
    return bbox[3] - bbox[1]


def draw_multiline_centered(draw, lines, start_y, font, fill, line_spacing=1.8):
    """複数行テキストを中央揃え"""
    y = start_y
    for line in lines:
        h = draw_centered_text(draw, line, y, font, fill)
        y += int(h * line_spacing)
    return y


# ========================================
# ハイライトカバー（4枚）
# ========================================
def make_cover(name, filename):
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)

    # English title
    font_en = get_font(SERIF, 52)
    draw_centered_text(draw, name, H // 2 - 30, font_en, CREAM)

    # Subtle line
    lw = 120
    ly = H // 2 + 50
    draw.line([(W // 2 - lw // 2, ly), (W // 2 + lw // 2, ly)], fill=TAUPE, width=1)

    img.save(os.path.join(OUT_DIR, filename))
    print(f'  {filename}')


# ========================================
# About テンプレート（5枚）
# ========================================
def make_about():
    # 1. 表紙（写真用プレースホルダー）
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_ja = get_font(MINCHO, 36)
    font_sm = get_font(MINCHO, 24)
    draw_centered_text(draw, '[ 指輪の写真をここに配置 ]', H // 2 - 20, font_ja, TAUPE)
    draw_centered_text(draw, '表紙：いちばんインパクトのある1枚', H // 2 + 40, font_sm, TAUPE)
    img.save(os.path.join(OUT_DIR, 'about-1-cover.png'))

    # 2. ブランドステートメント
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 44)
    lines = ['自然界の有機的な造形を、', '指先に宿す。']
    draw_multiline_centered(draw, lines, H // 2 - 80, font_main, CREAM, 2.0)
    # conte.jpeg logo text
    font_logo = get_font(SERIF, 28)
    draw_centered_text(draw, 'conte.jpeg', H // 2 + 120, font_logo, TAUPE)
    img.save(os.path.join(OUT_DIR, 'about-2-statement.png'))

    # 3. 何をしてるか
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 38)
    lines = ['3Dモデリングと手仕事で', '一点ものの指輪を', '制作しています']
    draw_multiline_centered(draw, lines, H // 2 - 100, font_main, CREAM, 2.0)
    img.save(os.path.join(OUT_DIR, 'about-3-what.png'))

    # 4. 特徴
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 36)
    lines = ['珊瑚、溶岩、蔦、骨——', '', '自然のかたちから生まれるデザイン', '同じものは二つとありません']
    draw_multiline_centered(draw, lines, H // 2 - 120, font_main, CREAM, 1.8)
    img.save(os.path.join(OUT_DIR, 'about-4-feature.png'))

    # 5. 誘導
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_en = get_font(SERIF, 48)
    font_sm = get_font(MINCHO, 28)
    draw_centered_text(draw, 'Online Store', H // 2 - 60, font_en, CREAM)
    # Arrow
    draw_centered_text(draw, '↓', H // 2 + 20, font_en, TAUPE)
    draw_centered_text(draw, 'リンクスタンプをここに配置', H // 2 + 120, font_sm, TAUPE)
    img.save(os.path.join(OUT_DIR, 'about-5-link.png'))


# ========================================
# Process テンプレート（5枚）
# ========================================
def make_process():
    steps = [
        ('01', 'modeling', '3Dモデリング画面の写真を配置'),
        ('02', 'printing', 'レジン / 3Dプリントの写真を配置'),
        ('03', 'polishing', '研磨中の手元写真を配置'),
        ('04', 'finishing', 'コーティング / 仕上げ写真を配置'),
        ('05', 'complete', '完成品の写真を配置'),
    ]
    for num, label, placeholder in steps:
        img = Image.new('RGB', (W, H), DARK_BROWN)
        draw = ImageDraw.Draw(img)

        # Placeholder
        font_ph = get_font(MINCHO, 28)
        draw_centered_text(draw, f'[ {placeholder} ]', H // 2 - 20, font_ph, TAUPE)

        # Step label at bottom
        font_num = get_font(SERIF, 32)
        font_label = get_font(SERIF, 28)
        label_text = f'{num} — {label}'
        draw_centered_text(draw, label_text, H - 200, font_num, CREAM)

        # Subtle line above label
        draw.line([(W // 2 - 60, H - 240), (W // 2 + 60, H - 240)], fill=TAUPE, width=1)

        img.save(os.path.join(OUT_DIR, f'process-{num}-{label}.png'))


# ========================================
# Order テンプレート（3枚）
# ========================================
def make_order():
    # 1. 案内
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 38)
    lines = ['指輪はBASEオンラインストアで', 'ご購入いただけます']
    draw_multiline_centered(draw, lines, H // 2 - 60, font_main, CREAM, 2.0)
    img.save(os.path.join(OUT_DIR, 'order-1-info.png'))

    # 2. 価格帯
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 36)
    font_sm = get_font(MINCHO, 28)
    lines = ['各リング ¥○○○○〜', '', '素材：レジン / コーティング仕上げ']
    draw_multiline_centered(draw, lines, H // 2 - 80, font_main, CREAM, 1.8)
    draw_centered_text(draw, '※ 価格を編集してください', H // 2 + 120, font_sm, TAUPE)
    img.save(os.path.join(OUT_DIR, 'order-2-price.png'))

    # 3. リンク誘導
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 38)
    font_en = get_font(SERIF, 36)
    draw_centered_text(draw, 'プロフィールのリンクから', H // 2 - 60, font_main, CREAM)
    draw_centered_text(draw, 'ストアへどうぞ', H // 2 + 10, font_main, CREAM)
    draw_centered_text(draw, '↓', H // 2 + 100, font_en, TAUPE)
    img.save(os.path.join(OUT_DIR, 'order-3-link.png'))


# ========================================
# Works テンプレート（1枚：ガイド）
# ========================================
def make_works():
    img = Image.new('RGB', (W, H), DARK_BROWN)
    draw = ImageDraw.Draw(img)
    font_main = get_font(MINCHO, 32)
    font_sm = get_font(MINCHO, 24)

    lines = [
        'Works ハイライトの作り方',
        '',
        '反応がいい指輪写真を6枚選ぶ',
        '',
        '各写真の左下にテーマ名を',
        '小さく入れる',
        '',
        '例：coral / lava / ivy',
        '',
        '写真が主役。テキストは最小限で',
    ]
    draw_multiline_centered(draw, lines, 400, font_sm, CREAM, 1.6)
    img.save(os.path.join(OUT_DIR, 'works-guide.png'))


# ========================================
# 実行
# ========================================
if __name__ == '__main__':
    print('Generating highlight templates...\n')

    print('Covers:')
    make_cover('About', 'cover-about.png')
    make_cover('Works', 'cover-works.png')
    make_cover('Process', 'cover-process.png')
    make_cover('Order', 'cover-order.png')

    print('\nAbout:')
    make_about()

    print('\nProcess:')
    make_process()

    print('\nOrder:')
    make_order()

    print('\nWorks:')
    make_works()

    print(f'\nDone! Files saved to: {OUT_DIR}')
