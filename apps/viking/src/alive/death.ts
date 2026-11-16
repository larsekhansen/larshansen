import { R, ctx, mix } from "@larshansen/pixelkit/paint";
import { ENEMY, WHITE } from "@larshansen/pixelkit/palette";

// A beaten enemy's death (order 23, section 1): three frames, hit, fold and gone, in place of the squash alone and
// within the eight steps the squash took (order 19). Made from the enemy's own shape as it was drawn the moment
// before, so every look has them, those drawn as frames and those still drawn in rectangles alike:
//
//   hit   steps 0 and 1: its shape flashed pale, a pixel up, as the stomp lands
//   fold  steps 2 to 4: squashed to under half its height, a quarter wider, its outline under it
//   gone  steps 5 to 7: flat, half there, as it puffs into squares of its own two colours
//
// Reduced motion squashes and stretches nothing: the hit holds its first seven steps, then it is gone, half there.

/** A beaten enemy's shape as it was drawn: its rectangles (world pixels, four numbers each) and their colours. */
export interface Shape {
  r: number[];
  c: string[];
}

/** Steps each frame of a death starts at, and its whole length; with reduced motion, the hit's length and the whole. */
export const DEATH = { fold: 2, gone: 5, end: 8, reducedGone: 7, reducedEnd: 14 };

/** The frame of a death at `age` steps: 0 hit, 1 fold, 2 gone; -1 when it is over. */
export function deathFrame(age: number, reduced: boolean): number {
  if (reduced) return age < DEATH.reducedGone ? 0 : age < DEATH.reducedEnd ? 2 : -1;
  return age < DEATH.fold ? 0 : age < DEATH.gone ? 1 : age < DEATH.end ? 2 : -1;
}

/** Draws frame `k` of a death (0 hit, 1 fold, 2 gone) of a shape whose feet are at `feet`. */
export function drawDeath(s: Shape, feet: number, k: number, reduced: boolean) {
  let x0 = 1e9;
  let x1 = -1e9;
  let y0 = 1e9;
  for (let i = 0; i < s.r.length; i += 4) {
    x0 = Math.min(x0, s.r[i]);
    x1 = Math.max(x1, s.r[i] + s.r[i + 2]);
    y0 = Math.min(y0, s.r[i + 1]);
  }
  const cx = (x0 + x1) / 2;
  // How tall (a share of its height) and how wide (a share of its width) each frame is drawn; reduced motion keeps its shape.
  const tall = reduced ? 1 : [1, 0.42, 0.2][k];
  const wide = reduced ? 1 : [1, 1.25, 1.4][k];
  const lift = k === 0 && !reduced ? 1 : 0;
  const g = ctx();
  if (k === 2) g.globalAlpha *= 0.5;
  const h = Math.max(2, Math.round((feet - y0) * tall));
  R(Math.round(cx - ((x1 - x0) * wide) / 2) - 1, feet - h - 1 - lift, Math.round((x1 - x0) * wide) + 2, h + 1, ENEMY.line);
  for (let i = 0; i < s.r.length; i += 4) {
    const ry0 = feet - Math.round((feet - s.r[i + 1]) * tall) - lift;
    const ry1 = feet - Math.round((feet - s.r[i + 1] - s.r[i + 3]) * tall) - lift;
    const c = k === 0 ? mix(s.c[i / 4], WHITE, 0.55) : s.c[i / 4];
    R(Math.round(cx + (s.r[i] - cx) * wide), ry0, Math.max(1, Math.round(s.r[i + 2] * wide)), Math.max(1, ry1 - ry0), c);
  }
  if (k === 2) g.globalAlpha /= 0.5;
}
