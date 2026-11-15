"""Flat places (order 20): which pictures of a walk (walk.ts, shot with tools/shots.ts at 1280 x 800 and
390 x 844) have more than about a third of the view in one plain area (one colour, or one tile repeated, with
nothing else in it), or where the far backdrop is empty (more than half the view is plain sky).

The picture is read in art pixels (four device pixels to one at 1280 x 800, one at 390 x 844), the page's
header cut off. It is cut into 8 x 8 blocks; a block is plain when its colours span little (a gradient's step),
when it is one colour but for a speck, or when it is the same as the block a tile (16 px) to its side and the
one a tile above or below it (a repeated tile). (A rule for quiet textures, a few colours near each other, was
tried: under the night's tint it took whole towns for one plain area.) The tool's marks are candidates: look. Plain blocks next to each other and alike in colour make an
area (a lamp or a speck in it leaves a hole, it does not split it). The area that reaches the top of the view
is the sky; the largest of the others is the plain area. Marked: the plain area over about a third of the
view (0.3), or
the far backdrop empty: on a wide view more than half of it sky (the far layers lie low, round the street);
on a tall one, where they are moved down round him, the band just over his head more than three fifths sky.

usage: python3 flat.py <walk.tsv> <shots-dir> <out-dir> [plain=0.3] [sky=0.6]
  <shots-dir> has 1280/ and 390/ as walkshots made them. Writes <out-dir>/flat.tsv (one line per picture:
  name, size, the plain area's share, the sky's share of the band over his head, the plain area's colour, why) and a contact sheet per
  level, <out-dir>/<level>.png, each place at both sizes with the plain area (red when marked) and the sky
  (blue when marked) shown over it. The sheets stay out of the repository."""
import os, re, sys
from PIL import Image, ImageDraw

walk, shots, out = sys.argv[1:4]
MARK = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3
SKY = float(sys.argv[5]) if len(sys.argv) > 5 else 0.6
os.makedirs(out, exist_ok=True)
CREAM = (255, 252, 246)


def name_for(path, size=None):
    m = re.match(r'^(/[^?#]*)(\?[^#]*)?(#.*)?$', path)
    p, q, h = m.group(1), (m.group(2) or '')[1:], (m.group(3) or '')[1:]
    p = p.strip('/') or 'index'
    s = '_'.join(x for x in (p, q, h) if x).replace('=', '-')
    s = re.sub(r'[^A-Za-z0-9.-]+', '_', s)
    return s + (f'_{size}' if size else '') + '.png'


def art(im, k):
    """The picture in art pixels, the header and help line cut off: (pixels, w, h, top in device pixels)."""
    W, H = im.size
    px = im.load()
    top = 0
    while top < H and px[2, top] == CREAM:
        top += 1
    top += 2  # the header's border line
    bottom = H
    while bottom > top and px[2, bottom - 1] == CREAM:
        bottom -= 1
    w, h = W // k, (bottom - top) // k
    small = im.crop((0, top, w * k, top + h * k)).resize((w, h), Image.NEAREST)
    return small, w, h, top


def flat(small, w, h):
    px = small.load()
    B = 8
    bw, bh = w // B, h // B
    blocks = {}
    for by in range(bh):
        for bx in range(bw):
            cs = [px[bx * B + i, by * B + j] for j in range(B) for i in range(B)]
            blocks[bx, by] = cs
    def plain(bx, by):
        cs = blocks[bx, by]
        lo = [min(c[i] for c in cs) for i in range(3)]
        hi = [max(c[i] for c in cs) for i in range(3)]
        if max(hi[i] - lo[i] for i in range(3)) <= 8:
            return True
        # One colour but for a speck or two.
        common = max(set(cs), key=cs.count)
        if cs.count(common) >= len(cs) - 4:
            return True
        # A repeated tile: the same as the block a tile to the side and a tile up or down.
        side = blocks.get((bx + 2, by)) == cs or blocks.get((bx - 2, by)) == cs
        updown = blocks.get((bx, by + 2)) == cs or blocks.get((bx, by - 2)) == cs
        return side and updown
    def mean(b):
        cs = blocks[b]
        return tuple(sum(c[i] for c in cs) / len(cs) for i in range(3))
    flats = {b for b in blocks if plain(*b)}
    means = {b: mean(b) for b in flats}
    seen, best = set(), (0, None, None)
    areas = []
    for b in flats:
        if b in seen:
            continue
        area, stack, box = [], [b], [b[0], b[1], b[0], b[1]]
        seen.add(b)
        while stack:
            c = stack.pop()
            area.append(c)
            box = [min(box[0], c[0]), min(box[1], c[1]), max(box[2], c[0]), max(box[3], c[1])]
            for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (c[0] + d[0], c[1] + d[1])
                if n in flats and n not in seen and max(abs(means[n][i] - means[c][i]) for i in range(3)) <= 10:
                    seen.add(n)
                    stack.append(n)
        areas.append(area)
    # The sky is the plain area that reaches the top of the view; anything else (a wall, the ground under the
    # street, water) is the rest. Small things in an area (a speck, a lamp) leave holes in it but do not split it.
    n = max(1, bw * bh)
    sky = max((a for a in areas if any(b[1] == 0 for b in a)), key=len, default=[])
    rest = max((a for a in areas if not any(b[1] == 0 for b in a)), key=len, default=[])
    # Nothing behind him: in the band just over his head (he stands in the middle of a wide view, two thirds of
    # the way down a tall one), how much is that sky.
    hy = (h * 2 // 3 if h > w else h // 2) // B
    band = [(bx, by) for by in range(max(0, hy - 5), max(1, hy - 1)) for bx in range(bw)]
    cells = set(sky)
    behind = sum(1 for b in band if b in cells) / max(1, len(band))
    # On a wide view the far layers lie low, round the street: there the backdrop is empty when over half the
    # view is sky. On a tall one they are moved down round him, so it is the band over his head that says.
    empty = behind if h > w else len(sky) / n / 0.5 * SKY
    return len(rest) / n, (means[rest[0]] if rest else (0, 0, 0)), rest, empty, sky, B


rows = [l.rstrip('\n').split('\t') for l in open(walk) if l.strip() and not l.startswith('#')]
table = []
sheets = {}
for name, path in rows:
    level = name.rsplit('-c', 1)[0]
    cells = []
    for size, k, sub in ((None, 4, '1280'), ('390x844', 1, '390')):
        f = os.path.join(shots, sub, name_for(path, size))
        if not os.path.exists(f):
            cells.append(None)
            continue
        im = Image.open(f).convert('RGB')
        small, w, h, top = art(im, k)
        share, colour, area, skyShare, skyArea, B = flat(small, w, h)
        # (skyShare: how much of the band over his head is sky)
        marked = share > MARK or skyShare > SKY
        why = ' '.join(x for x in ('plain' if share > MARK else '', 'sky' if skyShare > SKY else '') if x)
        table.append((name, sub, f'{share:.2f}', f'{skyShare:.2f}', '#%02x%02x%02x' % tuple(int(c) for c in colour), why))
        shown = small.copy()
        d = ImageDraw.Draw(shown, 'RGBA')
        for (bx, by) in area:
            d.rectangle((bx * B, by * B, bx * B + B - 1, by * B + B - 1), fill=(255, 0, 0, 70) if share > MARK else (255, 255, 0, 40))
        for (bx, by) in skyArea:
            d.rectangle((bx * B, by * B, bx * B + B - 1, by * B + B - 1), fill=(0, 80, 255, 70) if skyShare > SKY else (0, 255, 255, 25))
        share = max(share, skyShare)
        if k == 1:
            shown = shown.resize((shown.width // 2, shown.height // 2), Image.BOX)
        cells.append((shown, share, marked))
    sheets.setdefault(level, []).append((name, cells))

with open(os.path.join(out, 'flat.tsv'), 'w') as fh:
    for r in table:
        fh.write('\t'.join(r) + '\n')

for level, places in sheets.items():
    W = 90 + 330 + 210
    rowh = 380
    sheet = Image.new('RGB', (W, 20 + rowh * len(places)), (24, 24, 24))
    d = ImageDraw.Draw(sheet)
    y = 20
    d.text((6, 4), level, fill=(255, 255, 255))
    for name, cells in places:
        d.text((6, y + 4), name.rsplit('-', 1)[1], fill=(230, 230, 230))
        x = 90
        for cell in cells:
            if cell:
                im, share, marked = cell
                sheet.paste(im, (x, y))
                d.text((x, y + im.height + 2), f'{share:.2f}{" MARK" if marked else ""}', fill=(255, 80, 80) if marked else (200, 200, 200))
                x += im.width + 10
        y += rowh
    sheet.save(os.path.join(out, f'{level}.png'))
marks = [r for r in table if r[5]]
print(f'{len(table)} pictures, {len(marks)} marked')
for r in marks:
    print('\t'.join(r))
