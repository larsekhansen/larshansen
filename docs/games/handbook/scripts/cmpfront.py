"""Compare front page shots with the references: byte-identical, and if not, whether they differ below the header (the header is the top HEADER rows)."""
import sys, os, filecmp
from PIL import Image, ImageChops
ref, new = sys.argv[1], sys.argv[2]
HEADER = int(sys.argv[3]) if len(sys.argv) > 3 else 48
names = sorted(f for f in os.listdir(new) if f.endswith('.png'))
same = 0
for n in names:
    a, b = os.path.join(ref, n), os.path.join(new, n)
    if not os.path.exists(a):
        print("NO REFERENCE", n); continue
    if filecmp.cmp(a, b, shallow=False):
        same += 1; print("identical      ", n); continue
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    box = ImageChops.difference(ia, ib).getbbox()
    below = ImageChops.difference(ia.crop((0, HEADER, ia.width, ia.height)), ib.crop((0, HEADER, ib.width, ib.height))).getbbox()
    print("differs        " if below is None else "DIFFERS BELOW  ", n, "difference box", box, "below the header:", "none" if below is None else below)
print(f"{same} of {len(names)} byte-identical")
