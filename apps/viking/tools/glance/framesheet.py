"""A sheet of frames (order 23): every frame of a figure at four times its size (or `--scale`), in rows, named, on a
light and a dark ground. The frames come as JSON from `frames.ts`: {figure: [{name, w, h, x0, y0, px: [[colour or ""]]}]}.

usage: bun tools/glance/frames.ts > frames.json; python3 framesheet.py frames.json <out-dir> [--scale=4]
One PNG per figure, `<figure>.png`, in <out-dir>."""
import json, os, sys
from PIL import Image, ImageDraw

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=") for a in sys.argv[1:] if a.startswith("--"))
scale = int(opts.get("scale", 4))
data = json.load(open(args[0]))
out = args[1]
os.makedirs(out, exist_ok=True)


def rgb(c):
    c = c.lstrip("#")
    if c.startswith("rgba"):
        return (0, 0, 0)
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


for figure, frames in data.items():
    pad = 6
    cell_w = max(f["w"] for f in frames) * scale + 2 * pad
    cell_h = max(f["h"] for f in frames) * scale + 2 * pad + 14
    cols = min(len(frames), max(1, 1200 // cell_w))
    rows = (len(frames) + cols - 1) // cols
    img = Image.new("RGB", (cols * cell_w, rows * cell_h * 2 + 18), (40, 40, 44))
    d = ImageDraw.Draw(img)
    d.text((4, 3), figure, fill=(235, 235, 235))
    for i, f in enumerate(frames):
        for half, ground in enumerate([(214, 220, 206), (34, 38, 58)]):
            cx = (i % cols) * cell_w
            cy = 18 + (i // cols) * cell_h * 2 + half * cell_h
            d.rectangle([cx + 2, cy + 2, cx + cell_w - 3, cy + cell_h - 3], fill=ground)
            # The box the frame belongs to, faint, and the ground line under it.
            bx = cx + pad + (-f["x0"]) * scale
            by = cy + pad + (-f["y0"]) * scale
            if f.get("box"):
                bw, bh = f["box"]
                d.rectangle([bx, by, bx + bw * scale - 1, by + bh * scale - 1], outline=(150, 150, 150) if half == 0 else (90, 90, 110))
            for y, row in enumerate(f["px"]):
                for x, c in enumerate(row):
                    if not c:
                        continue
                    px = cx + pad + x * scale
                    py = cy + pad + y * scale
                    d.rectangle([px, py, px + scale - 1, py + scale - 1], fill=rgb(c))
            if half == 0:
                d.text((cx + 4, cy + cell_h - 14), f["name"][:28], fill=(30, 30, 30))
    img.save(os.path.join(out, f"{figure}.png"))
    print(os.path.join(out, f"{figure}.png"))
