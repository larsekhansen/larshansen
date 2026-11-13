import { PLAYER } from "./config";
import type { Body, Intent } from "./physics";

// Click or tap to walk there. He walks towards the spot (or the door) with the same keys a person
// would press, hops over whatever stops him, and gives up after three seconds of getting no closer.
// Any key of the visitor's own takes over again.

/** Steps without getting closer before he gives up: three seconds. */
export const PATIENCE = 180;
/** Steps of standing still against something before he hops. */
const HOP_AFTER = 4;

export interface WalkGoal<D> {
  /** World x he walks to. */
  x: number;
  /** World y of the click, for scenes that put a marker on the ground below it. */
  y: number;
  /** A door to go in at the end, or null for a spot on the ground. */
  door: D | null;
  /** The closest he has been, and the step he got there. */
  best: number;
  since: number;
  /** Steps he has stood still against something while walking. */
  stuck: number;
}

/** A new goal at a clicked point: a door's middle, or the point kept a body's width inside the world. */
export function walkTo<D extends { x: number; w: number }>(at: { x: number; y: number }, door: D | null, worldWidth: number, steps: number): WalkGoal<D> {
  const x = door ? door.x + door.w / 2 : Math.max(PLAYER.w, Math.min(worldWidth - PLAYER.w, at.x));
  return { x, y: at.y, door, best: Infinity, since: steps, stuck: 0 };
}

export interface WalkStep<D> {
  /** The goal after this step, or null when he has arrived or given up. */
  goal: WalkGoal<D> | null;
  /** The keys to press this step. */
  intent: Intent;
  /** The door to go in now, when he has reached it. */
  enter: D | null;
}

/**
 * One step of walking to the goal. `intent` is what the visitor pressed this step; `here` is the
 * door he stands at, if any. Pure: returns the new goal, and the intent to step the body with.
 */
export function walkStep<D>(goal: WalkGoal<D>, b: Body, intent: Intent, here: D | null, steps: number): WalkStep<D> {
  const dx = goal.x - (b.x + PLAYER.w / 2);
  // Getting closer resets the patience; three seconds without progress means it cannot be reached.
  const closer = Math.abs(dx) < goal.best - 0.5;
  const g = { ...goal, best: closer ? Math.abs(dx) : goal.best, since: closer ? steps : goal.since };
  if (intent.left || intent.right || intent.jumpPressed || steps - g.since > PATIENCE) return { goal: null, intent, enter: null };
  if (g.door && here === g.door) return { goal: null, intent, enter: g.door };
  if (!g.door && Math.abs(dx) <= 1.5) return { goal: null, intent, enter: null };
  // Crates, hedges and walls in the way: hop over when walking gets nowhere. Always the full jump.
  g.stuck = b.onGround && Math.abs(b.vx) < 0.05 ? g.stuck + 1 : 0;
  return { goal: g, intent: { left: dx < -1, right: dx > 1, jumpPressed: g.stuck > HOP_AFTER, jumpHeld: true }, enter: null };
}
