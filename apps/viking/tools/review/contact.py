# Line 2 review (15 November 2026): a contact sheet of screenshots, two across at half size. Run: python3 contact.py out.png shot1.png shot2.png ...
import sys, re
from PIL import Image
out = sys.argv[1]; files = sys.argv[2:]
cols = 2; w, h = 640, 400
rows = (len(files) + cols - 1) // cols
g = Image.new("RGB", (cols * w, rows * h), "black")
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB")
    im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    g.paste(im.crop((0, 0, w, h)), ((i % cols) * w, (i // cols) * h))
g.save(out)
