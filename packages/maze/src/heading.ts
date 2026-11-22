import { ghostAt, type GhostPoints } from "./ghost";

// Which of his drawings the maze shows (order 37): his side, going away (his back) or coming toward (his face), and which way
// he faces. Drawing only: the rules never read it. It follows the way he moves, with a little stickiness, so a drag along a
// diagonal does not flicker between two drawings:
//
// - the way he moves is smoothed over a few steps (`EASE` of each step's move goes into it), so a finger's jitter does not
//   count, and nothing is decided until the smoothed way is most of a step long (`SURE`: about eight steps after he sets off);
// - he turns to a corridor's way (his back or his face) only once the smoothed way is steeper than 60 degrees, and back to his
//   side only once it is flatter than 30: between the two he keeps what he shows (a steady diagonal never changes it more than
//   once, `heading.test.ts`). Showing his back while he comes down (or his face while he goes up) along a diagonal between
//   the two, he waits for a steadier way (`TURNING`) and then takes the nearer of his side and the way he goes;
// - he faces the way he goes sideways whenever his move is no steeper than about 63 degrees (a corridor's jitter, nearly
//   straight up or down, does not turn him round), so his side view turns at once as it did before;
// - standing, he keeps the drawing he stopped in.
//
// His ghost's drawings are found the same way from its points, once a ghost (`ghostWalk`), with how far it has walked at each
// step, so its run goes by distance as his does (order 36 left it on the step count).

export type View = "side" | "away" | "toward";

export interface Heading {
  view: View;
  facing: 1 | -1;
  /** The way he moves, smoothed (art pixels a step). */
  hx: number;
  hy: number;
}

/** How much of each step's move goes into the smoothed way. */
export const EASE = 0.12;
/** Steeper than this (|y| over |x|), his back or his face; flatter than `FLAT`, his side; between, as he was. */
export const STEEP = Math.tan((60 * Math.PI) / 180);
export const FLAT = Math.tan((30 * Math.PI) / 180);
/** Nothing is decided while the smoothed way is shorter than this part of the step's move (he has only just set off or turned). */
const SURE = 0.6;
/** Turning round between the two angles waits for a smoothed way this much of the step's move. */
const TURNING = 0.9;
/** A move counts as going sideways while its across is at least this part of its up and down. */
const SIDEWAYS = 0.5;
/** A move shorter than this is standing. */
const STILL = 0.05;

export function newHeading(facing: 1 | -1 = 1): Heading {
  return { view: "side", facing, hx: 0, hy: 0 };
}

/** One step's move (art pixels): the heading after it. Standing (no move) keeps it as it is. */
export function turn(h: Heading, dx: number, dy: number): Heading {
  const move = Math.hypot(dx, dy);
  if (move <= STILL) return h;
  h.hx += (dx - h.hx) * EASE;
  h.hy += (dy - h.hy) * EASE;
  if (Math.abs(dx) > STILL && Math.abs(dx) >= Math.abs(dy) * SIDEWAYS) h.facing = dx > 0 ? 1 : -1;
  const ax = Math.abs(h.hx);
  const ay = Math.abs(h.hy);
  const sure = Math.hypot(ax, ay);
  if (sure < Math.max(0.2, SURE * move)) return h;
  if (ay > ax * STEEP) h.view = h.hy < 0 ? "away" : "toward";
  else if (ay < ax * FLAT) h.view = "side";
  else if (((h.view === "away" && h.hy > 0) || (h.view === "toward" && h.hy < 0)) && sure >= TURNING * move) h.view = ay > ax ? (h.hy < 0 ? "away" : "toward") : "side";
  return h;
}

/** A ghost's walk: how far it has come by each step of its points (art pixels), and its drawing and facing there. */
export interface GhostWalk {
  dist: Float32Array;
  view: View[];
  facing: Int8Array;
}

/** Works out a ghost's walk once, from its points: a jump (a teleport stone, waking at a stone) adds no distance and no way. */
export function ghostWalk(points: GhostPoints): GhostWalk {
  const n = points.length / 2;
  const dist = new Float32Array(n);
  const view: View[] = new Array(n);
  const facing = new Int8Array(n);
  const h = newHeading();
  let prev = ghostAt(points, 0);
  for (let i = 0; i < n; i++) {
    const p = ghostAt(points, i)!;
    const dx = prev ? p.x - prev.x : 0;
    const dy = prev ? p.y - prev.y : 0;
    const d = Math.hypot(dx, dy);
    // A step is at most 1.6 art pixels: more is a jump, which is not walked.
    const walked = d <= 2 ? d : 0;
    dist[i] = (i ? dist[i - 1] : 0) + walked;
    if (walked) turn(h, dx, dy);
    view[i] = h.view;
    facing[i] = h.facing;
    prev = p;
  }
  return { dist, view, facing };
}
