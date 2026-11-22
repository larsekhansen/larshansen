// The sea serpent in every state (order 25), as JSON for `framesheet.py`: its ring of foam, rising, reared and breathing,
// its tell as the throat swells and the jaw drops, spitting, watching, ducking and diving, dazed (its head rocking on the
// planks), reeling from a hit, its coils between rises, its tail's fin breaking the water and its tail along the quay, and
// its ball of brine; each drawn by Gamlebyen's own art through a recorder, by day.
//
//   bun tools/glance/serpent.ts > serpent.json; python3 tools/glance/framesheet.py serpent.json <dir> --scale=4

import { target, view } from "@larshansen/pixelkit/paint";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { GAMLEBYEN, SERPENT_DEF, ballArt } from "../../src/levels/gamlebyen";
import { SERPENT_STEPS, createSerpent, type Serpent, type SerpentPhase } from "../../src/game/serpent";
import type { View } from "../../src/levels/types";

type Rect = { x: number; y: number; w: number; h: number; c: string };
const record = (draw: () => void): Rect[] => {
  const rects: Rect[] = [];
  const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h, c: rec.fillStyle }); }, drawImage() {} };
  target(rec as unknown as CanvasRenderingContext2D);
  draw();
  return rects.filter((r) => !String(r.c).startsWith("rgba"));
};
const viewAt = (t: number, boss: unknown): View => ({ sky: skyFor(new Date(2026, 5, 15, 12), "day"), t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: -999, y: -999 }, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss, cleared: [], runeAt: null, grounds: null }) as unknown as View;

/** The sea serpent's frames, as the sheets have them. */
export function serpentSheets(): Record<string, { name: string; w: number; h: number; x0: number; y0: number; px: string[][] }[]> {
  Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
  const T = 1000;
  const at = (phase: SerpentPhase, age: number, more: Partial<Serpent> = {}, t = T): { s: Serpent; t: number } => {
    const s = createSerpent(SERPENT_DEF);
    Object.assign(s, { phase, since: t - age, at: 1, dir: -1 }, more);
    return { s, t };
  };
  // Only what is round its neck: the quay's middle place, a few tiles either side.
  const X = SERPENT_DEF.points[1];
  const near = (rs: Rect[]) => rs.filter((r) => r.x > X - 120 && r.x < X + 120 && r.y > SERPENT_DEF.floor - 110 && r.y < SERPENT_DEF.floor + 40);
  const shot = (name: string, o: { s: Serpent; t: number }) => {
    const { boss, front } = GAMLEBYEN.art as { boss: (s: unknown, v: View) => void; front?: (v: View) => void };
    const rects = near(record(() => boss(o.s, viewAt(o.t, o.s))));
    // Its ball is drawn with what is in front.
    const ball = o.s.ball ? near(record(() => ballArt(o.s, o.t))) : [];
    void front;
    return { name, rects: [...rects, ...ball] };
  };

  const tell = SERPENT_STEPS.tell[0];
  const frames = [
    shot("ring of foam", at("ring", 30)),
    shot("ring, wider", at("ring", 80)),
    shot("rising", at("rise", 10)),
    shot("rising, high", at("rise", 25)),
    shot("reared", at("rear", 5)),
    shot("reared, breathing", at("rear", 5, {}, T + 30)),
    shot("its tell: the throat", at("rear", Math.round(tell * 0.4))),
    shot("its tell: the jaw drops", at("rear", Math.round(tell * 0.6))),
    shot("its tell: the jaw open", at("rear", Math.round(tell * 0.9))),
    shot("spitting", at("spit", 2, { ball: { x: X - 30, y: SERPENT_DEF.floor - 8, vx: -2, back: false } })),
    shot("watching", at("watch", 20)),
    shot("its tail's fin", at("lash", 10, { tail: { x: X - 70, dir: -1, at: T - 20, hit: false, said: false } })),
    shot("its tail along the quay", at("lash", 70, { tail: { x: X - 60, dir: -1, at: T - SERPENT_STEPS.tailWarn - 20, hit: false, said: false } })),
    shot("ducking its ball", at("duck", 10)),
    shot("dazed", at("dazed", 0, {}, 12)),
    shot("dazed, its head up", at("dazed", 0, {}, 24)),
    shot("dazed, its head down", at("dazed", 0, {}, 60)),
    shot("reeling from a hit", at("reel", 5)),
    shot("its coils, resting", at("rest", 20)),
    shot("diving", at("dive", 10))
  ];
  const all = frames.flatMap((f) => f.rects);
  const x0 = Math.min(...all.map((r) => r.x));
  const y0 = Math.min(...all.map((r) => r.y));
  const w = Math.max(...all.map((r) => r.x + r.w)) - x0;
  const h = Math.max(...all.map((r) => r.y + r.h)) - y0;
  const out = {
    serpent: frames.map((f) => {
      const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
      for (const r of f.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (y - y0 >= 0 && y - y0 < h && x - x0 >= 0 && x - x0 < w) px[y - y0][x - x0] = r.c;
      return { name: f.name, w, h, x0: 0, y0: 0, px };
    })
  };
  target(undefined as unknown as CanvasRenderingContext2D);
  return out;
}

if (import.meta.main) console.log(JSON.stringify(serpentSheets()));
