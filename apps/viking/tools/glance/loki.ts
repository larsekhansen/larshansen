// Loki's frames (order 29) as JSON for `framesheet.py`: every pose at each stage of losing his glamour (glammed, the hair
// gone, the shades gone, plain) and his plain poses, unsquashed, on one grid.
//
//   bun tools/glance/loki.ts > loki.json; python3 tools/glance/framesheet.py loki.json <dir> --scale=6

import { pixels } from "../../src/alive/frames";
import { LOKI_FRAME, lokiFrames } from "../../src/render/loki";

const fs = lokiFrames();
const w = LOKI_FRAME.w;
const h = LOKI_FRAME.h;
const grid = (f: (typeof fs)[number]) => {
  const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
  pixels(f, 1, w, (c, r, colour) => {
    if (r >= 0 && r < h && c >= 0 && c < w) px[r][c] = colour;
  });
  return px;
};
const stage = (n: string) => (n.endsWith("plain") || n.includes(", plain") || n.startsWith("Loki, plain") ? "plain" : n.split(", ").at(-1)!);
const out: Record<string, { name: string; w: number; h: number; x0: number; y0: number; px: string[][] }[]> = {};
for (const f of fs) (out[`Loki, ${stage(f.name)}`] ??= []).push({ name: f.name.replace(/^Loki, /, ""), w, h, x0: 0, y0: 0, px: grid(f) });
console.log(JSON.stringify(out));
