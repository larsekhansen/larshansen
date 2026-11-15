import { TILE } from "@larshansen/pixelkit/config";
import { R, view } from "@larshansen/pixelkit/paint";
import { STAND } from "@larshansen/pixelkit/palette";
import type { LedgeLook } from "@larshansen/pixelkit/props";

// What he can stand on reads at a glance (order 18, section 5, ADR 0039): a top edge two pixels thick in
// the platform palette's standing colour, the same on every ledge, raft, lift, deck and stone; what moves
// has a stripe of the moving colour under it; what gives way (sinks, falls, goes on a beat) has its top in
// the warning colour, broken in dashes. The level's main ground and walls keep their own surfaces.

/** Every one-way ledge: a teal body, the standing top two pixels thick, a dark line under it. */
export const STAND_LEDGE: LedgeLook = { body: STAND.body, top: STAND.top, edge: STAND.under, joint: STAND.bodyDark, topH: 2 };

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

/**
 * The top edge of something he can stand on, w wide from (x, y), as it holds, moves or gives way. About to
 * give way (`soon`), the caller moves it by `shiver`; with reduced motion its dashes join instead, a still sign.
 */
export function standTop(x: number, y: number, w: number, how: Footing, soon = false) {
  if (x + w < view.camX - 2 || x > view.camX + view.w + 2) return;
  if (how === "gives") {
    for (let k = 0; k < w; k += 6) R(x + k, y, Math.min(soon && view.reduced ? 6 : 4, w - k), 2, STAND.warn);
    return;
  }
  R(x, y, w, how === "moves" ? 1 : 2, STAND.top);
  if (how === "moves") R(x, y + 1, w, 1, STAND.moving);
}

/** A tile he stands on that a level draws its own way (a risen stone, a crate): its standing top. */
export const tileTop = (x: number, y: number) => R(x, y, TILE, 2, STAND.top);
