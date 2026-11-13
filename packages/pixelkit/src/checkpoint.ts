import { PLAYER, TILE } from "./config";
import { R, view } from "./paint";
import { FLAG, METAL } from "./palette";
import type { Body } from "./physics";

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
export const POLE = { h: 28, reach: 6 };

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

/** A white pole with a pennant: low and grey until it is reached, then up at the top in red, flapping. */
export function drawCheckpoint(f: Flag, reached: boolean, steps: number) {
  const top = f.bottom - POLE.h;
  R(f.x, top, 1, POLE.h, METAL.flagpole);
  R(f.x - 1, top - 2, 3, 2, METAL.brass);
  if (!reached) {
    for (let i = 0; i < 5; i++) R(f.x + 1, f.bottom - 12 + i, 5 - i, 1, METAL.shackle);
    return;
  }
  const flap = view.reduced ? 0 : Math.floor(steps / 10) % 2;
  for (let i = 0; i < 7; i++) R(f.x + 1, top + i, 9 - Math.abs(3 - i) - (i % 3 === flap ? 1 : 0), 1, FLAG.red);
}
