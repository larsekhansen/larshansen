// Every frame of every figure (order 23) as JSON, for `framesheet.py`: him from his table of frames, and every enemy
// look as the game draws it, through a recorder, in each state it has (still, moving, winding up, beaten).
//
//   bun tools/glance/frames.ts [figure ...] > frames.json; python3 tools/glance/framesheet.py frames.json <dir>

import { PLAYER } from "@larshansen/pixelkit/config";
import { target, view } from "@larshansen/pixelkit/paint";
import { ALL_FRAMES, MARGIN } from "../../src/alive/him";
import { pixels, type Frame } from "../../src/alive/frames";
import { lookFrames } from "../../src/alive/census";
import { ALL_FOES } from "../../src/alive/foes";
import { SKILLING, CHEESE } from "../../src/alive/things";

type Out = { name: string; w: number; h: number; x0: number; y0: number; box?: [number, number]; px: string[][] };
const only = process.argv.slice(2);
const out: Record<string, Out[]> = {};

const grid = (f: Frame, x0: number, y0: number, w: number, h: number) => {
  const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
  pixels(f, 1, PLAYER.w, (c, r, colour) => {
    if (r - y0 >= 0 && r - y0 < h && c - x0 >= 0 && c - x0 < w) px[r - y0][c - x0] = colour;
  });
  return px;
};

if (!only.length || only.includes("him")) {
  const w = PLAYER.w + 2 * MARGIN;
  const h = PLAYER.h + 2 * MARGIN;
  out.him = ALL_FRAMES.map((f) => ({ name: f.name, w, h, x0: -MARGIN, y0: -MARGIN, box: [PLAYER.w, PLAYER.h], px: grid(f, -MARGIN, -MARGIN, w, h) }));
}

// The looks drawn as frames, from their tables (unsquashed), and the small things.
const table = (fs: Frame[], label: string) => {
  const x0 = Math.min(...fs.map((f) => f.x0));
  const y0 = Math.min(...fs.map((f) => f.y0));
  const w = Math.max(...fs.map((f) => f.x1)) - x0;
  const h = Math.max(...fs.map((f) => f.y1)) - y0;
  if (!only.length || only.includes(label)) out[label] = fs.map((f) => ({ name: f.name, w, h, x0: 0, y0: 0, px: grid(f, x0, y0, w, h) }));
};
for (const [name, l] of Object.entries(ALL_FOES())) table([...l.idle, ...l.move, ...(l.windup ? [l.windup] : [])], `${name} (frames)`);
table([...SKILLING, CHEESE], "things");

// The enemies: each look's frames as the page draws them (through `outlined`'s recorder), still, moving, winding up, beaten.
Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
for (const [look, frames] of Object.entries(await lookFrames())) {
  if (only.length && !only.includes(look)) continue;
  const all = frames.flatMap((f) => f.rects.map((r) => r));
  if (!all.length) continue;
  const x0 = Math.min(...all.map((r) => r.x));
  const y0 = Math.min(...all.map((r) => r.y));
  const x1 = Math.max(...all.map((r) => r.x + r.w));
  const y1 = Math.max(...all.map((r) => r.y + r.h));
  out[look] = frames.map((f) => {
    const px = Array.from({ length: y1 - y0 }, () => Array<string>(x1 - x0).fill(""));
    for (const r of f.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) px[y - y0][x - x0] = r.c;
    return { name: f.name, w: x1 - x0, h: y1 - y0, x0: 0, y0: 0, px };
  });
}
target(undefined as unknown as CanvasRenderingContext2D);
console.log(JSON.stringify(out));
