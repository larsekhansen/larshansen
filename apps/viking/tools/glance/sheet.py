"""A contact sheet of before and after (orders 18 and 19): one row per kind, day and night, at 1280 x 800
and 390 x 844, cropped round the point the after picture marks in its two bottom-left pixels (?debug&where).

The addresses come from enemyshots.ts or platformshots.ts, which since order 19 also put the camera on the
subject (?debug&look), so it is in the picture whatever the level's shape. The crop is kept inside the
picture, and a row whose marked point is off it (or is the corner, which is where an off-screen point is
written) is named on the console: so no row quietly shows something else.

usage: python3 sheet.py <tsv> <before-dir> <after-dir> <out.png> [crop-w crop-h]
The tsv has: kind, level, sky, path. Shots are named as tools/shots.ts names them."""
import os, re, sys
from PIL import Image, ImageDraw

tsv, before, after, out = sys.argv[1:5]
cw, ch = (int(a) for a in (sys.argv[5:7] if len(sys.argv) > 6 else (100, 64)))


def name_for(path, size=None):
    # The same as tools/shots.ts's nameFor.
    m = re.match(r'^(/[^?#]*)(\?[^#]*)?(#.*)?$', path)
    p, q, h = m.group(1), (m.group(2) or '')[1:], (m.group(3) or '')[1:]
    p = p.strip('/') or 'index'
    s = '_'.join(x for x in (p, q, h) if x).replace('=', '-')
    s = re.sub(r'[^A-Za-z0-9.-]+', '_', s)
    return s + (f'_{size}' if size else '') + '.png'


def marked(im):
    px = im.load()
    a, b = px[0, im.height - 1], px[1, im.height - 1]
    return a[0] * 256 + a[1], b[0] * 256 + b[1]


rows = [l.rstrip('\n').split('\t') for l in open(tsv) if l.strip()]
kinds = []
for kind, level, sky, path in rows:
    if (kind, level) not in kinds:
        kinds.append((kind, level))
cells = {}
missing = []
for kind, level, sky, path in rows:
    for size in (None, '390x844'):
        fa = os.path.join(after, name_for(path, size))
        fb = os.path.join(before, name_for(path, size))
        if not os.path.exists(fa):
            continue
        ia = Image.open(fa).convert('RGB')
        x, y = marked(ia)
        k = 4 if size is None else 1  # device pixels per art pixel at 1280 x 800 and 390 x 844
        w, h = cw * k, ch * k
        if not (2 <= x < ia.width - 2 and 2 <= y < ia.height - 2):
            missing.append(f'{kind} ({level}, {sky}, {size or "1280x800"}): marked at {x},{y}, off the picture')
        # Kept inside the picture: the subject may then sit off the crop's middle, never off the crop.
        x0 = max(0, min(ia.width - w, x - w // 2))
        y0 = max(0, min(ia.height - h, y - h * 2 // 3))
        for which, f in (('before', fb), ('after', fa)):
            if os.path.exists(f):
                cells[(kind, level, sky, size, which)] = Image.open(f).convert('RGB').crop((x0, y0, x0 + w, y0 + h)).resize((cw * 2, ch * 2), Image.NEAREST)
CW, CH = cw * 2, ch * 2
cols = [(sky, size, which) for size in (None, '390x844') for sky in ('day', 'night') for which in ('before', 'after')]
LW = 130
sheet = Image.new('RGB', (LW + len(cols) * (CW + 4), 18 + len(kinds) * (CH + 4)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for j, (sky, size, which) in enumerate(cols):
    d.text((LW + j * (CW + 4) + 2, 3), f"{'1280' if size is None else '390'} {sky} {which}", fill=(255, 255, 255))
for i, (kind, level) in enumerate(kinds):
    y = 18 + i * (CH + 4)
    d.text((4, y + 4), kind, fill=(255, 255, 255))
    d.text((4, y + 18), level, fill=(180, 180, 180))
    for j, key in enumerate(cols):
        im = cells.get((kind, level) + key)
        if im:
            sheet.paste(im, (LW + j * (CW + 4), y))
sheet.save(out)
print(out, sheet.size)
for m in missing:
    print('NOT IN THE PICTURE:', m)
