import { TILE } from "@larshansen/pixelkit/config";
import { R, view } from "@larshansen/pixelkit/paint";
import { STAND } from "@larshansen/pixelkit/palette";
import type { LedgeLook } from "@larshansen/pixelkit/props";

// What he stands on reads at a glance (order 18, section 5, ADR 0039; order 22, ADR 0043): its top edge is painted
// yellow, two pixels thick and a little worn at the ends, the same on every ledge, raft, lift, deck and stone: the
// paint players know means "you can go here". What moves has black diagonal marks in the paint (a chevron wants
// three rows; in two they are the stripes of moving machinery); what gives way (sinks, falls, goes on a beat) has
// its paint broken in dashes. The level's main ground and walls keep their own surfaces.

/** Every one-way ledge: a teal body, the paint two pixels thick and worn at its ends, a dark line under it. */
export const STAND_LEDGE: LedgeLook = { body: STAND.body, top: STAND.top, edge: STAND.under, joint: STAND.bodyDark, topH: 2, worn: STAND.worn };

export type Footing = "holds" | "moves" | "gives";
/** A standing place's top, for the page to mark: w wide, its top at (x, y). */
export interface Standing {
  x: number;
  y: number;
  w: number;
  how: Footing;
  /** About to give way (order 19): it trembles first. */
  soon?: boolean;
}

/** What is about to give way trembles: a pixel to and fro every other step; with reduced motion it keeps still. */
export const shiver = (t: number) => (view.reduced ? 0 : (t >> 1) % 2 ? 1 : -1);

/** The paint's two rows, w wide from (x, y), worn at an end that is one: its outer top pixel the worn shade. */
function paint(x: number, y: number, w: number, first = true, last = true) {
  R(x, y, w, 2, STAND.top);
  if (w < 4) return;
  if (first) R(x, y, 1, 1, STAND.worn);
  if (last) R(x + w - 1, y, 1, 1, STAND.worn);
}

/**
 * The top edge of something he can stand on, w wide from (x, y), as it holds, moves or gives way. About to give
 * way (`soon`), the caller moves it by `shiver`; with reduced motion its dashes join instead, a still sign. About
 * to set off (`soon` on what moves, order 19), its marks march along it (with reduced motion they are doubled).
 * `t`: the step, for the marks' march.
 */
export function standTop(x: number, y: number, w: number, how: Footing, soon = false, t = 0) {
  if (x + w < view.camX - 2 || x > view.camX + view.w + 2) return;
  if (how === "gives") {
    for (let k = 0; k < w; k += 6) R(x + k, y, Math.min(soon && view.reduced ? 6 : 4, w - k), 2, STAND.top);
    return;
  }
  paint(x, y, w);
  if (how !== "moves") return;
  // Black marks in the paint, a pixel each row, leaning: every six pixels; about to set off, they march.
  const step = soon && view.reduced ? 3 : 6;
  const shift = soon && !view.reduced ? (t >> 2) % 6 : 0;
  for (let k = 2 + shift; k < w - 2; k += step) {
    R(x + k + 1, y, 1, 1, STAND.mark);
    R(x + k, y + 1, 1, 1, STAND.mark);
  }
}

/** A tile he stands on that a level draws its own way (a risen stone, a crate): its paint, worn where its row of them ends. */
export const tileTop = (x: number, y: number, first = true, last = true) => paint(x, y, TILE, first, last);
