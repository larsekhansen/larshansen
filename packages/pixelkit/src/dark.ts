import { S, view } from "./paint";

// The dark: a night drawn over the scene, with lights punched through it. First the maze's torch
// overlay (its sixth level, where only a circle round him shows); now also the forest at night in
// the viking game, where his headlamp, lit windows and painted trunks show through. Drawn after the
// scene's own pass, in screen pixels, a row at a time: each row is cut where a light's edge crosses
// it or the night itself gets lighter, and each piece is filled once.

/** A ring of a round light: inside `radius`, the dark is at most `dark` (0: none, 1: all). */
export type Ring = readonly [radius: number, dark: number];

/** A light in screen pixels: a disc with rings, from the outermost (faint) to the innermost (clear); or a rectangle. */
export type Light = { x: number; y: number; rings: readonly Ring[] } | { rect: { x: number; y: number; w: number; h: number }; dark: number };

/** The maze's torch: three rings round him, the outer two half lit. */
export const TORCH: readonly Ring[] = [
  [46, 0.6],
  [40, 0.3],
  [34, 0]
];

/** How dark a point on the screen is: the night there, lightened by every light it is in. The least dark wins. */
export function darknessAt(x: number, y: number, night: number, lights: readonly Light[]): number {
  let dark = night;
  for (const l of lights) {
    if ("rect" in l) {
      const r = l.rect;
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) dark = Math.min(dark, l.dark);
      continue;
    }
    for (const [radius, d] of l.rings) if (Math.hypot(x - l.x, y - l.y) <= radius) dark = Math.min(dark, d);
  }
  return dark;
}

/** A piece of a row of the dark: from x, w wide, this dark. */
export interface Run {
  x: number;
  w: number;
  dark: number;
}

/**
 * One row of the dark, `w` pixels wide, as pieces of even darkness. `night` gives the dark of each
 * column of the screen before any light (all one value, or one per column); `nightCuts` are the
 * columns where it changes, so they are worked out once a frame, not once a row.
 */
export function darkRow(row: number, w: number, lights: readonly Light[], night: number | readonly number[], nightCuts: readonly number[] = []): Run[] {
  const cuts = new Set<number>([0, w, ...nightCuts]);
  const y = row + 0.5;
  for (const l of lights) {
    if ("rect" in l) {
      const r = l.rect;
      if (y < r.y || y >= r.y + r.h) continue;
      cuts.add(Math.max(0, Math.min(w, Math.round(r.x))));
      cuts.add(Math.max(0, Math.min(w, Math.round(r.x + r.w))));
      continue;
    }
    const dy = y - l.y;
    for (const [radius] of l.rings) {
      if (Math.abs(dy) > radius) continue;
      const half = Math.sqrt(radius * radius - dy * dy);
      cuts.add(Math.max(0, Math.min(w, Math.round(l.x - half))));
      cuts.add(Math.max(0, Math.min(w, Math.round(l.x + half))));
    }
  }
  const xs = [...cuts].sort((p, q) => p - q);
  const out: Run[] = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const span = xs[i + 1] - xs[i];
    if (span <= 0) continue;
    const base = typeof night === "number" ? night : night[Math.min(night.length - 1, xs[i])] ?? 0;
    out.push({ x: xs[i], w: span, dark: darknessAt((xs[i] + xs[i + 1]) / 2, y, base, lights) });
  }
  return out;
}

/** The columns where the night changes from one column to the next. */
export function nightCutsOf(night: readonly number[]): number[] {
  const out: number[] = [];
  for (let x = 1; x < night.length; x++) if (night[x] !== night[x - 1]) out.push(x);
  return out;
}

/**
 * Draws the dark over the whole screen on the current canvas, in `rgb` ("r, g, b"): fully dark is
 * the colour itself, anything less is the colour at that alpha. `night` is the dark before any
 * light: one value for all of it, or one per screen column.
 */
export function drawDark(lights: readonly Light[], night: number | readonly number[] = 1, rgb = "5, 5, 12") {
  const cuts = typeof night === "number" ? [] : nightCutsOf(night);
  for (let row = 0; row < view.h; row++)
    for (const r of darkRow(row, view.w, lights, night, cuts)) if (r.dark > 0) S(r.x, row, r.w, 1, r.dark >= 1 ? `rgb(${rgb})` : `rgba(${rgb}, ${r.dark})`);
}
