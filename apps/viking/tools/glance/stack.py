"""One picture per event from its frame strips (order 19): by day and at night, at 1280 and 390, before and
after, stacked with a label on each row. Strips are named <event>_<sky>_<width>.png (tools/glance/strips.ts).

usage: python3 stack.py <out-dir> <before-dir> [<after-dir>]"""
import os, sys
from PIL import Image, ImageDraw

out, before = sys.argv[1], sys.argv[2]
after = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
events = sorted({f.rsplit('_', 2)[0] for f in os.listdir(before) if f.endswith('.png')})
for ev in events:
    rows = []
    for which, d in (('before', before), ('after', after)):
        if not d:
            continue
        for w in ('1280', '390'):
            for sky in ('day', 'night'):
                f = os.path.join(d, f'{ev}_{sky}_{w}.png')
                if os.path.exists(f):
                    rows.append((f'{which} {w} {sky}', Image.open(f).convert('RGB')))
    if not rows:
        continue
    W = max(im.width for _, im in rows) + 110
    H = sum(im.height for _, im in rows) + 4 * len(rows) + 22
    sheet = Image.new('RGB', (W, H), (24, 24, 24))
    d = ImageDraw.Draw(sheet)
    d.text((6, 4), ev, fill=(255, 255, 255))
    y = 22
    for label, im in rows:
        d.text((6, y + im.height // 2 - 6), label, fill=(230, 230, 230))
        sheet.paste(im, (110, y))
        y += im.height + 4
    sheet.save(os.path.join(out, f'{ev}.png'))
print(len(events), 'events')
