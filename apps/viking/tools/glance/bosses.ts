// Line 1's bosses in every state (order 24), as JSON for `framesheet.py`: the troll (asleep, waking, walking in four
// frames, its club raised, stuck, hit, backing off, a third and two thirds stone, all stone) and the plough (parked,
// waking, driving, revving, charging, stuck, turning, hit, backing off, resting, beaten), each drawn by its level's own
// art through a recorder, by day.
//
//   bun tools/glance/bosses.ts > bosses.json; python3 tools/glance/framesheet.py bosses.json <dir> --scale=4

import { target, view } from "@larshansen/pixelkit/paint";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { NORDMARKA, TROLL_DEF } from "../../src/levels/nordmarka";
import { NABOLAGET, PLOUGH_DEF } from "../../src/levels/nabolaget";
import type { View } from "../../src/levels/types";

type Rect = { x: number; y: number; w: number; h: number; c: string };
const record = (draw: () => void): Rect[] => {
  const rects: Rect[] = [];
  const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h, c: rec.fillStyle }); }, drawImage() {} };
  target(rec as unknown as CanvasRenderingContext2D);
  draw();
  return rects.filter((r) => !String(r.c).startsWith("rgba"));
};
const viewAt = (t: number, troll: unknown, boss: unknown): View => ({ sky: skyFor(new Date(2026, 5, 15, 12), "day"), t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: -999, y: -999 }, flourish: null, facing: 1, troll, flags: [], enemies: [], boss, cleared: [], runeAt: null, grounds: null }) as unknown as View;

/** The troll's and the plough's frames, as the sheets have them. */
export function bossSheets(): Record<string, { name: string; w: number; h: number; x0: number; y0: number; px: string[][] }[]> {
  Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
  const out: Record<string, { name: string; w: number; h: number; x0: number; y0: number; px: string[][] }[]> = {};
  const figure = (label: string, frames: { name: string; rects: Rect[] }[]) => {
    const all = frames.flatMap((f) => f.rects);
    const x0 = Math.min(...all.map((r) => r.x));
    const y0 = Math.min(...all.map((r) => r.y));
    const w = Math.max(...all.map((r) => r.x + r.w)) - x0;
    const h = Math.max(...all.map((r) => r.y + r.h)) - y0;
    out[label] = frames.map((f) => {
      const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
      for (const r of f.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) px[y - y0][x - x0] = r.c;
      return { name: f.name, w, h, x0: 0, y0: 0, px };
    });
  };

  const trollAt = (phase: string, x: number, hits = 0, since = 0) => ({ def: TROLL_DEF, x, dir: 1, phase, since, hits, wave: null, waited: 0, fleeing: false });
  const T = 1000;
  const troll = (name: string, phase: string, opts: { x?: number; hits?: number; age?: number; t?: number } = {}) => {
    const s = trollAt(phase, opts.x ?? 400, opts.hits ?? 0, (opts.t ?? T) - (opts.age ?? 40));
    return { name, rects: record(() => NORDMARKA.art.troll!(s as never, viewAt(opts.t ?? T, s, null))) };
  };
  figure("troll", [
    troll("asleep", "asleep"),
    troll("asleep, breathing", "asleep", { t: T + 60 }),
    troll("waking", "waking", { age: 30 }),
    ...[0, 4, 8, 12].map((d, k) => troll(`walking ${k + 1}`, "walk", { x: 400 + d })),
    troll("club raised", "windup", { age: 20 }),
    troll("stuck", "stuck"),
    troll("stuck, heaving", "stuck", { t: T + 30 }),
    troll("hit", "hit", { age: 4, hits: 1 }),
    troll("backing off, a third stone", "retreat", { hits: 1 }),
    troll("walking, two thirds stone", "walk", { hits: 2 }),
    troll("all stone", "stone", { hits: 3 })
  ]);

  const ploughAt = (phase: string, x: number, hits = 0, since = 0) => ({ def: PLOUGH_DEF, x, dir: 1, phase, since, hits, lineAt: -999, stale: 0, backTo: x, struck: false });
  const plough = (name: string, phase: string, opts: { x?: number; hits?: number; age?: number; t?: number } = {}) => {
    const s = ploughAt(phase, opts.x ?? 600, opts.hits ?? 0, (opts.t ?? T) - (opts.age ?? 40));
    return { name, rects: record(() => NABOLAGET.art.boss!(s as never, viewAt(opts.t ?? T, null, s))) };
  };
  figure("plough", [
    plough("parked", "parked"),
    plough("parked, ticking over", "parked", { t: T + 60 }),
    plough("waking", "waking", { age: 10 }),
    ...[0, 3, 6, 9].map((d, k) => plough(`driving ${k + 1}`, "drive", { x: 600 + d, hits: 1 })),
    plough("revving", "windup", { hits: 1 }),
    plough("charging", "charge", { hits: 1 }),
    plough("stuck", "stuck", { hits: 1 }),
    plough("turning", "turn", { hits: 2 }),
    plough("hit", "hit", { age: 4, hits: 1 }),
    plough("backing off", "retreat", { hits: 1 }),
    plough("resting", "rest", { hits: 1 }),
    plough("beaten", "beaten", { hits: 3 })
  ]);
  target(undefined as unknown as CanvasRenderingContext2D);
  return out;
}

if (import.meta.main) console.log(JSON.stringify(bossSheets()));
