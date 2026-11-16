// A stomp as a strip of frames (order 27): each look's glamour breaking, step by step, as the page draws it (its glammed
// self flashed, its marks flying off, its natural self in the calm outline, leaving its way), as JSON for `framesheet.py`.
//
//   bun tools/glance/stomp.ts [look ...] > stomp.json; python3 tools/glance/framesheet.py stomp.json <dir>

import { target, view } from "@larshansen/pixelkit/paint";
import { census, type Drawn } from "../../src/alive/census";
import { drawBreak, type Shape } from "../../src/alive/death";
import { NATURAL } from "../../src/alive/natural";

const only = process.argv.slice(2);
const AGES = [0, 1, 2, 3, 4, 5, 6, 8, 11, 14, 18, 22, 27, 32, 38, 44];
Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
const looks = await census();
const shapeOf = (d: Drawn): Shape => ({ r: d.rects.flatMap((r) => [r.x, r.y, r.w, r.h]), c: d.rects.map((r) => r.c) });
const out: Record<string, { name: string; w: number; h: number; x0: number; y0: number; px: string[][] }[]> = {};
for (const [name, l] of Object.entries(looks)) {
  if (only.length && !only.includes(name)) continue;
  const leave = NATURAL[name]?.leave ?? "run";
  const b = { glammed: shapeOf(l.glammed), natural: (leave === "stay" ? [shapeOf(l.natural[0]), shapeOf(l.natural[0])] : [shapeOf(l.natural[1]), shapeOf(l.natural[2])]) as [Shape, Shape], marks: l.marks ? shapeOf(l.marks) : null, leave, away: 1 };
  const frames = AGES.map((age) => {
    const rects: Drawn["rects"] = [];
    let alpha = 1;
    const rec = {
      fillStyle: "",
      get globalAlpha() {
        return alpha;
      },
      set globalAlpha(a: number) {
        alpha = a;
      },
      fillRect(x: number, y: number, w: number, h: number) {
        // Faded pixels mixed toward the sheet's ground, so the fade shows.
        rects.push({ x, y, w, h, c: alpha < 0.98 ? fade(rec.fillStyle, alpha) : rec.fillStyle });
      }
    };
    target(rec as unknown as CanvasRenderingContext2D);
    drawBreak(b, age, false);
    return { name: `step ${age}`, rects };
  });
  const all = frames.flatMap((f) => f.rects);
  if (!all.length) continue;
  const x0 = Math.min(...all.map((r) => r.x));
  const y0 = Math.min(...all.map((r) => r.y));
  const w = Math.max(...all.map((r) => r.x + r.w)) - x0;
  const h = Math.max(...all.map((r) => r.y + r.h)) - y0;
  out[`${name}, stomped`] = frames.map((f) => {
    const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
    for (const r of f.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) px[y - y0][x - x0] = r.c;
    return { name: f.name, w, h, x0: 0, y0: 0, px };
  });
}
target(undefined as unknown as CanvasRenderingContext2D);
console.log(JSON.stringify(out));

function fade(c: string, a: number): string {
  const n = parseInt(c.slice(1), 16);
  const mixc = (v: number, g: number) => Math.round(v * a + g * (1 - a));
  const r = mixc((n >> 16) & 255, 176);
  const g = mixc((n >> 8) & 255, 196);
  const b = mixc(n & 255, 214);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
