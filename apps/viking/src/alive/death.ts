import { R, ctx, mix } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES, WHITE } from "@larshansen/pixelkit/palette";
import { outlined } from "../render/sprite";
import type { Leave } from "./natural";

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
  // Folded and gone, a dark line round it as its outline was (the hit is its own shape, flashed).
  if (k > 0 && !reduced) R(Math.round(cx - ((x1 - x0) * wide) / 2) - 1, feet - h - 1 - lift, Math.round((x1 - x0) * wide) + 2, h + 1, ENEMY.line);
  for (let i = 0; i < s.r.length; i += 4) {
    const ry0 = feet - Math.round((feet - s.r[i + 1]) * tall) - lift;
    const ry1 = feet - Math.round((feet - s.r[i + 1] - s.r[i + 3]) * tall) - lift;
    const c = k === 0 ? mix(s.c[i / 4], WHITE, 0.55) : s.c[i / 4];
    R(Math.round(cx + (s.r[i] - cx) * wide), ry0, Math.max(1, Math.round(s.r[i + 2] * wide)), Math.max(1, ry1 - ry0), c);
  }
  if (k === 2) g.globalAlpha /= 0.5;
}

// --- The glamour breaks (order 27, section 2; ADR 0050) ------------------------------------------------------------
//
// Nobody dies in this game any more. When he stomps an invader the glam goes and it is itself again, in the frames and
// steps the death took (three frames, eight steps), and then it leaves, drawing only, gone within a second or so:
//
//   hit      steps 0 and 1: its glammed shape flashed pale, a pixel up; its marks (the shades, the crest) fly off up
//            and back, turning nothing, falling, fading; a burst of glitter in its neons (the page's particles)
//   turned   steps 2 to 4: its natural self (the same map without its marks, in its natural ramp), outlined in the calm
//            pale, a hop as it shakes the spell off
//   leaving  from step 5: its natural self going its own way, away from him (a rat runs off, a bird flies up, a guard
//            walks away shaking his head, a swan swims off, a fish dives, a cart rolls away; a statue or a fire stays
//            where it is), fading from step 30 and gone at 48
//
// Reduced motion: no flying marks, no glitter, nothing leaving: its glammed self held, then its natural self, still,
// then gone.

/** A broken glamour: the shapes it was drawn in a step before (glammed; natural, still and in a step of its cycle; its marks alone), how it leaves, and which way. */
export interface Broken {
  glammed: Shape;
  natural: [Shape, Shape];
  marks: Shape | null;
  leave: Leave;
  /** Away from him: right (1) or left (-1). */
  away: number;
}

/** How long a broken glamour is drawn, in steps: its natural self fades from `fade` and is gone at `end`. */
export const BREAK = { fade: 30, end: 48, reducedNatural: 7 };

/** Where its natural self is, `age` steps after the stomp, as it leaves its way (pixels from where it was). */
export function leaving(leave: Leave, away: number, age: number): { dx: number; dy: number; frame: number } {
  const a = Math.max(0, age - DEATH.gone);
  const step = Math.floor(age / 3) % 2;
  switch (leave) {
    case "run":
      return { dx: Math.round(away * (a * 1.4 + a * a * 0.04)), dy: 0, frame: step };
    case "fly":
      return { dx: Math.round(away * a * 1.1), dy: -Math.round(a * 1.1 + a * a * 0.03), frame: Math.floor(age / 2) % 2 };
    case "walk":
      // Shaking its head as it goes: a pixel back and forth every few steps.
      return { dx: Math.round(away * a * 0.55) + (Math.floor(age / 4) % 2), dy: 0, frame: step };
    case "swim":
      return { dx: Math.round(away * a * 0.8), dy: 0, frame: step };
    case "dive":
      return { dx: Math.round(away * a * 0.3), dy: Math.round(a * 0.9), frame: 0 };
    case "roll":
      return { dx: Math.round(away * (a * 1.1 + a * a * 0.03)), dy: 0, frame: step };
    default:
      return { dx: 0, dy: 0, frame: 0 };
  }
}

/** Draws a recorded shape moved by (dx, dy), each rectangle's colour through `ink`. */
function shapeAt(s: Shape, dx: number, dy: number, ink?: (c: string) => string) {
  for (let i = 0; i < s.r.length; i += 4) R(s.r[i] + dx, s.r[i + 1] + dy, s.r[i + 2], s.r[i + 3], ink ? ink(s.c[i / 4]) : s.c[i / 4]);
}

/** Draws a broken glamour `age` steps after the stomp; false once it is gone. */
export function drawBreak(b: Broken, age: number, reduced: boolean): boolean {
  if (age < 0 || age >= BREAK.end) return false;
  const g = ctx();
  const fade = age >= BREAK.fade ? 1 - (age - BREAK.fade) / (BREAK.end - BREAK.fade) : 1;
  if (reduced) {
    // A plain change of colour: its glammed self, then its natural self in the calm outline, where it was.
    if (age < BREAK.reducedNatural) return shapeAt(b.glammed, 0, 0), true;
    g.globalAlpha *= fade;
    outlined(() => shapeAt(b.natural[0], 0, 0), undefined, ROLES.calm);
    g.globalAlpha /= fade;
    return true;
  }
  if (age < DEATH.fold) shapeAt(b.glammed, 0, -1, (c) => mix(c, WHITE, 0.55));
  else {
    const at = age < DEATH.gone ? { dx: 0, dy: age < 4 ? -1 : 0, frame: 0 } : leaving(b.leave, b.away, age);
    g.globalAlpha *= fade;
    outlined(() => shapeAt(b.natural[at.frame], at.dx, at.dy), undefined, ROLES.calm);
    g.globalAlpha /= fade;
  }
  // Its marks fly off up and back, and fall, fading.
  if (b.marks && age < 26) {
    const m = 1 - age / 26;
    g.globalAlpha *= m;
    shapeAt(b.marks, -b.away * Math.round(age * 0.9), Math.round(-age * 1.5 + age * age * 0.07));
    g.globalAlpha /= m;
  }
  return true;
}
