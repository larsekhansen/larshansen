# Lays out `groundsheet.ts`'s rasters (order 26): for every level a sheet, a row a surface, before and after side by side
# (and the level's own sky beside the day's when given), at a scale.
#
#   python3 tools/glance/groundsheet.py <out dir> <scale> <before day dir> <after day dir> [<before own dir> <after own dir>]
import os, sys
from PIL import Image, ImageDraw

out, scale, dirs = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
os.makedirs(out, exist_ok=True)
W, H = 112, 80
def load(d, name):
    p = f"{d}/{name}.rgb"
    if not os.path.exists(p): return None
    return Image.frombytes("RGB", (W, H), open(p, "rb").read()).resize((W * scale, H * scale), Image.NEAREST)
rows = [l.split("\t") for l in open(f"{dirs[1]}/index.tsv").read().split("\n") if l.strip()]
levels = []
for r in rows:
    if r[1] not in levels: levels.append(r[1])
gap = 6
for lv in levels:
    mine = [r for r in rows if r[1] == lv]
    sheet = Image.new("RGB", (len(dirs) * (W * scale + gap), len(mine) * (H * scale + gap + 14)), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for i, r in enumerate(mine):
        y = i * (H * scale + gap + 14)
        d.text((4, y + 1), f'{lv} "{r[2]}" (column {r[3]}, row {r[4]}): ' + "  |  ".join(["before, day", "after, day", "before, its sky", "after, its sky"][: len(dirs)]), fill=(230, 230, 230))
        for j, dd in enumerate(dirs):
            im = load(dd, r[0])
            if im: sheet.paste(im, (j * (W * scale + gap), y + 14))
    sheet.save(f"{out}/{lv}.png")
print(len(levels), "sheets")
