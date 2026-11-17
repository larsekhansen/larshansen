"""Before and after of what changed in a picture (order 28): two pictures of the same address from two builds, the box
round every pixel that differs found, padded, and both crops laid side by side with a label, so a redrawn prop is
found by what changed rather than by guessing where the camera put it. Take the pictures at a size whose art pixels
are four screen pixels (`--size=1280x850` on a desktop) and the crops are at four times.

usage: python3 diffcrop.py <out-dir> <before-dir> <after-dir> [pad=24] [scale=1]

Every PNG in <before-dir> with a namesake in <after-dir> gives <out-dir>/<name>.png; pictures that do not differ are
listed and skipped."""
import os, sys
from PIL import Image, ImageChops, ImageDraw

out, before, after = sys.argv[1], sys.argv[2], sys.argv[3]
pad = int(sys.argv[4]) if len(sys.argv) > 4 else 24
scale = int(sys.argv[5]) if len(sys.argv) > 5 else 1
os.makedirs(out, exist_ok=True)
same = []
for name in sorted(os.listdir(before)):
    if not name.endswith('.png') or not os.path.exists(os.path.join(after, name)):
        continue
    a = Image.open(os.path.join(before, name)).convert('RGB')
    b = Image.open(os.path.join(after, name)).convert('RGB')
    if a.size != b.size:
        continue
    box = ImageChops.difference(a, b).getbbox()
    if not box:
        same.append(name)
        continue
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(a.width, x1 + pad), min(a.height, y1 + pad)
    ca, cb = a.crop((x0, y0, x1, y1)), b.crop((x0, y0, x1, y1))
    if scale > 1:
        ca = ca.resize((ca.width * scale, ca.height * scale), Image.NEAREST)
        cb = cb.resize((cb.width * scale, cb.height * scale), Image.NEAREST)
    side = ca.width < ca.height * 1.6
    W = ca.width * 2 + 12 if side else ca.width
    H = ca.height + 18 if side else ca.height * 2 + 30
    sheet = Image.new('RGB', (W, H), (24, 24, 24))
    d = ImageDraw.Draw(sheet)
    d.text((4, 3), 'before', fill=(255, 255, 255))
    if side:
        sheet.paste(ca, (0, 18))
        sheet.paste(cb, (ca.width + 12, 18))
        d.text((ca.width + 16, 3), 'after', fill=(255, 255, 255))
    else:
        sheet.paste(ca, (0, 14))
        d.text((4, ca.height + 16), 'after', fill=(255, 255, 255))
        sheet.paste(cb, (0, ca.height + 30))
    sheet.save(os.path.join(out, name))
if same:
    print('no difference:', *same, sep='\n  ')
