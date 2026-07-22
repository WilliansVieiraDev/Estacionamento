#!/usr/bin/env python3
import qrcode
import openpyxl
from PIL import Image, ImageDraw, ImageFont
import os
import re

TEMPLATE_PATH = '/home/wvieira/projetos/GOSP/ACESSOGOSPEXEMPLO.jpg'
CONVITES_DIR = '/home/wvieira/projetos/GOSP/convites'
PAGANTES_DIR = '/home/wvieira/projetos/GOSP/pagantes'
EXCEL_PATH = '/home/wvieira/projetos/GOSP/produtos-vendidos-final.xlsx'
FONT_PATH      = '/usr/share/fonts/noto/NotoSerif-Bold.ttf'
FONT_SANS_PATH = '/usr/share/fonts/noto/NotoSans-Regular.ttf'

# Fixed instruction text (template had typo "SIGA" → corrected to "SEGUE")
INSTRUCTION_TEXT   = "MEU IR • , SEGUE SEU VOUCHER PARA ACESSO AO CONGRESSO:"
INSTRUCTION_FONT   = None  # initialised in main() after first load
INSTRUCTION_Y1     = 554   # cover band top (pixel-measured)
INSTRUCTION_Y2     = 582   # cover band bottom
INSTRUCTION_CENY   = 568   # vertical centre of text band
INSTRUCTION_COLOR  = (10, 8, 14)   # near-black as in original template

# White box interior boundaries (detected via pixel analysis)
BOX_X1, BOX_Y1 = 315, 622
BOX_X2, BOX_Y2 = 537, 820
BOX_INTERIOR_COLOR = (244, 236, 226)  # cream color inside the rounded box

# QR code placed centered inside the box (square, with small padding)
_QR_SIZE = min(BOX_X2 - BOX_X1, BOX_Y2 - BOX_Y1) - 10  # 197px square
QR_W = QR_H = _QR_SIZE
QR_X1 = BOX_X1 + (BOX_X2 - BOX_X1 - QR_W) // 2
QR_Y1 = BOX_Y1 + (BOX_Y2 - BOX_Y1 - QR_H) // 2

# Name text region in template
NAME_Y_START = 848
NAME_Y_END   = 900
# Background color of the voucher's cream area (sampled at y=870, x=200)
BG_COLOR = (232, 220, 206)

# Name text color (dark navy from template)
NAME_COLOR = (10, 20, 50)


def sanitize_cim(cim: str) -> str:
    return re.sub(r'\D', '', cim)


def generate_qr(order_number: str, size: tuple) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(order_number)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
    img = img.resize(size, Image.LANCZOS)
    return img


def get_font_for_name(name: str, max_width: int, initial_size: int = 28) -> tuple:
    """Return (font, size) that fits name within max_width."""
    size = initial_size
    while size > 10:
        try:
            font = ImageFont.truetype(FONT_PATH, size)
        except Exception:
            font = ImageFont.load_default()
        dummy = Image.new('RGB', (1, 1))
        draw = ImageDraw.Draw(dummy)
        bbox = draw.textbbox((0, 0), name, font=font)
        text_w = bbox[2] - bbox[0]
        if text_w <= max_width:
            return font, size
        size -= 1
    return font, size


def make_voucher(template: Image.Image, cim: str, name: str) -> Image.Image:
    img = template.copy()
    draw = ImageDraw.Draw(img)

    # 1. Fill white box interior to erase old QR code completely
    draw.rectangle([(BOX_X1, BOX_Y1), (BOX_X2, BOX_Y2)], fill=BOX_INTERIOR_COLOR)

    # 2. Generate and paste new QR code centered in the box
    qr_img = generate_qr(cim, (QR_W, QR_H))
    img.paste(qr_img, (QR_X1, QR_Y1))

    # 3. Erase old name with background color fill
    draw.rectangle(
        [(0, NAME_Y_START), (img.width, NAME_Y_END)],
        fill=BG_COLOR
    )

    # 4. Fix instruction text: cover "SIGA" and redraw as "SEGUE"
    draw.rectangle([(0, INSTRUCTION_Y1), (img.width, INSTRUCTION_Y2)], fill=BG_COLOR)
    ifont = INSTRUCTION_FONT
    ibb   = draw.textbbox((0, 0), INSTRUCTION_TEXT, font=ifont)
    ix    = (img.width - (ibb[2] - ibb[0])) // 2
    iy    = INSTRUCTION_CENY - (ibb[3] - ibb[1]) // 2 - ibb[1]
    draw.text((ix, iy), INSTRUCTION_TEXT, font=ifont, fill=INSTRUCTION_COLOR)

    # 5. Draw new name centered
    upper_name = name.upper()
    max_name_width = img.width - 80  # 40px margin each side
    font, font_size = get_font_for_name(upper_name, max_name_width, initial_size=28)

    bbox = draw.textbbox((0, 0), upper_name, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x = (img.width - text_w) // 2
    name_center_y = (NAME_Y_START + NAME_Y_END) // 2
    y = name_center_y - text_h // 2 - bbox[1]

    draw.text((x, y), upper_name, font=font, fill=NAME_COLOR)

    return img


def main(limit: int = None):
    global INSTRUCTION_FONT
    INSTRUCTION_FONT = ImageFont.truetype(FONT_SANS_PATH, 16)

    template = Image.open(TEMPLATE_PATH).convert('RGB')

    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb.active

    headers = [cell.value for cell in ws[1]]
    col = {h: i for i, h in enumerate(headers)}

    os.makedirs(CONVITES_DIR, exist_ok=True)
    os.makedirs(PAGANTES_DIR, exist_ok=True)

    count = 0
    for row in ws.iter_rows(min_row=2, values_only=True):
        if limit and count >= limit:
            break

        cim      = str(row[col['CIM']])
        name     = str(row[col['Nome']])
        filename = sanitize_cim(cim) + '.jpg'
        out_path = os.path.join(PAGANTES_DIR, filename)

        voucher = make_voucher(template, cim, name)
        voucher.save(out_path, 'JPEG', quality=95)
        print(f'[{count+1}] CIM={cim} | {name} → {filename}')
        count += 1

    print(f'\n{count} vouchers gerados em {PAGANTES_DIR}')


if __name__ == '__main__':
    import sys
    lim = int(sys.argv[1]) if len(sys.argv) > 1 else None
    main(lim)
