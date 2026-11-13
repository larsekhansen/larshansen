import { PLAYER, TILE } from "./config";
import { R, view } from "./paint";
import { FLAG, METAL, STONE } from "./palette";
import type { Body } from "./physics";
import { flagCloth } from "./props";

// Flags along a level. Touching one raises it, and from then on a fall into water or off the bottom
// of the map puts him back at it instead of at the start. Flags count only forwards: going back to
// an earlier one does not move the return point back.

/** A flag pole: its x and the ground y it stands on. Listed in the order the level is played. */
export interface Flag {
  x: number;
  bottom: number;
}

export interface Checkpoints {
  /** The furthest flag touched, by index, or null before the first. */
  reached: number | null;
}

/** How tall a pole is, and how near it counts as touching. */
export const POLE = { h: 32, reach: 6 };

export function touches(f: Flag, b: Body): boolean {
  const cx = b.x + PLAYER.w / 2;
  return Math.abs(cx - f.x) <= POLE.reach && b.y < f.bottom && b.y + PLAYER.h > f.bottom - POLE.h;
}

/** The checkpoints after this step: a newly touched flag further along becomes the return point. */
export function touchFlags(state: Checkpoints, flags: readonly Flag[], b: Body): Checkpoints {
  let reached = state.reached;
  flags.forEach((f, i) => {
    if ((reached === null || i > reached) && touches(f, b)) reached = i;
  });
  return reached === state.reached ? state : { reached };
}

/** Where he comes back after a fall: the flag he reached, or the start. */
export function respawnAt(state: Checkpoints, flags: readonly Flag[], start: { x: number; bottom: number }): { x: number; bottom: number } {
  const f = state.reached === null ? null : flags[state.reached];
  return f ? { x: f.x, bottom: f.bottom } : start;
}

/** True when he has fallen: feet a few pixels into water, or below the bottom of the map. */
export function fellOut(b: Body, map: { height: number; isWater(c: number, r: number): boolean }): boolean {
  const feet = b.y + PLAYER.h;
  if (feet >= map.height) return true;
  return map.isWater(Math.floor((b.x + PLAYER.w / 2) / TILE), Math.floor((feet - 3) / TILE));
}

/** Steps the flag takes to go up the pole. */
export const HOIST_STEPS = 36;

/**
 * A white flagpole on a stone foot. Until it is reached the flag lies folded at the foot; when he
 * touches it (`raisedAt`, a step) the front page's Norwegian flag goes up the pole, and flies.
 */
export function drawCheckpoint(f: Flag, raisedAt: number | null, steps: number) {
  const top = f.bottom - POLE.h;
  R(f.x - 2, f.bottom - 2, 5, 2, STONE.dark);
  R(f.x - 2, f.bottom - 2, 5, 1, STONE.light);
  R(f.x, top, 1, POLE.h - 2, METAL.flagpole);
  R(f.x - 1, top - 2, 3, 2, METAL.brass);
  if (raisedAt === null) {
    // Folded at the foot of the pole: a red bundle with a white and blue fold.
    R(f.x + 1, f.bottom - 7, 4, 5, FLAG.red);
    R(f.x + 1, f.bottom - 5, 4, 1, FLAG.white);
    R(f.x + 2, f.bottom - 7, 1, 5, FLAG.blue);
    return;
  }
  const p = view.reduced ? 1 : Math.max(0, Math.min(1, (steps - raisedAt) / HOIST_STEPS));
  const eased = p * p * (3 - 2 * p);
  const y = Math.round(f.bottom - 12 - (f.bottom - 12 - top) * eased);
  flagCloth(f.x + 1, y);
  // Up and flying: the free end lifts and drops a pixel in the wind.
  if (p >= 1 && !view.reduced) R(f.x + 14, y + (Math.floor(steps / 12) % 2), 1, 8, FLAG.red);
}
