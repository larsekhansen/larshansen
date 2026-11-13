import { carrierAt, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { PLAYER, STEP_MS, TILE } from "@larshansen/pixelkit/config";
import type { Intent } from "@larshansen/pixelkit/physics";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { stepPlay, type Events, type Play } from "./play";

// A scripted player for the tests: a list of moves, each one deciding the keys for a step by
// looking at the level as it is (where he is, where the rafts and bells are), until it is done.
// It plays the real rules with the real jump, so what it clears, a person can clear.

export type Move = { name: string; keys(p: Play, s: Mem): Intent | "done" };
interface Mem {
  /** Steps this move has run, and whether he has left the ground during it. */
  i: number;
  air: boolean;
  [k: string]: unknown;
}

const NONE: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const cx = (p: Play) => p.body.x + PLAYER.w / 2;
const feet = (p: Play) => p.body.y + PLAYER.h;
const dirTo = (from: number, to: number) => (to > from ? 1 : -1);
const keys = (dir: number, jump = false, press = false): Intent => ({ left: dir < 0, right: dir > 0, jumpHeld: jump, jumpPressed: press });

/** Walks to x and stops there, hopping over anything that stops him. */
export const walk = (x: number): Move => ({
  name: `walk to ${x}`,
  keys(p, s) {
    const dx = x - cx(p);
    if (Math.abs(dx) <= 2 && p.body.onGround && Math.abs(p.body.vx) < 0.05) return "done";
    if (Math.abs(dx) <= 2) return NONE;
    const stuck = p.body.onGround && Math.abs(p.body.vx) < 0.05 && s.i > 3;
    s.stuck = stuck ? ((s.stuck as number) ?? 0) + 1 : 0;
    const near = Math.abs(dx) < Math.abs(p.body.vx) * 4;
    return keys(near ? 0 : dirTo(cx(p), x), true, (s.stuck as number) === 5);
  }
});

/**
 * A jump: the key held `hold` steps, the direction held until `release` steps (then let go), and
 * with the feather a second press `second` steps after the first. Done when he has landed.
 */
export const jump = (dir: -1 | 0 | 1, opts: { hold?: number; release?: number; second?: number } = {}): Move => ({
  name: `jump ${dir}`,
  keys(p, s) {
    if (s.air && p.body.onGround) return "done";
    if (!p.body.onGround) s.air = true;
    if (s.i > 400) return "done";
    const hold = opts.hold ?? 40;
    const second = opts.second !== undefined && s.i === opts.second;
    return keys(s.i < (opts.release ?? 999) ? dir : 0, s.i < hold || (opts.second !== undefined && s.i >= opts.second && s.i < opts.second + 30), s.i === 0 || second);
  }
});

/** Runs towards `edge` (a number, or worked out each step) and jumps there, holding the direction until he lands. */
export const leap = (edge: number | ((p: Play) => number), dir: -1 | 1, opts: { release?: number } = {}): Move => ({
  name: `leap at ${typeof edge === "number" ? edge : "a moving edge"}`,
  keys(p, s) {
    if (s.air && p.body.onGround) return "done";
    if (!p.body.onGround) s.air = true;
    if (s.took === undefined) {
      const front = dir > 0 ? p.body.x + PLAYER.w : p.body.x;
      const e = typeof edge === "number" ? edge : edge(p);
      if ((dir > 0 && front >= e) || (dir < 0 && front <= e)) s.took = s.i;
      else return keys(dir);
    }
    const k = s.i - (s.took as number);
    return keys(k < (opts.release ?? 999) ? dir : 0, k < 40, k === 0);
  }
});

/** Walks into the cannon ahead and lets it fire, touching nothing until he lands. */
export const cannonRide = (dir: -1 | 1): Move => ({
  name: "into the cannon",
  keys(p, s) {
    if (p.loaded) s.loaded = true;
    if (!s.loaded) return keys(dir);
    if (!p.body.onGround) s.air = true;
    return s.air && p.body.onGround && !p.loaded ? "done" : NONE;
  }
});

/** Stands still until the test holds. */
export const wait = (name: string, until: (p: Play) => boolean): Move => ({ name, keys: (p) => (until(p) ? "done" : NONE) });

/** Where a carrier is now, and whether a ledge on a beat is there. */
export const carrier = (p: Play, d: CarrierDef) => carrierAt(d, p.t);
export const on = (p: Play, i: number) => timedPhase(p.t, p.def.timed[i]) === "on";

export interface Result {
  steps: number;
  seconds: number;
  /** Every step's events, for checks (flags raised, splashes, the rune). */
  events: Events[];
  done: boolean;
  /** The move it was on when it ran out of steps, if it did. */
  stuck: string | null;
}

/** Plays the moves in order, at most `max` steps. Stops when the rune is taken, or `until` holds. */
export function playMoves(p: Play, moves: Move[], opts: { max?: number; until?: (p: Play) => boolean } = {}): Result {
  const max = opts.max ?? 60 * 240;
  const events: Events[] = [];
  let m = 0;
  let mem: Mem = { i: 0, air: false };
  for (let n = 0; n < max; n++) {
    if (p.run.state === "done" || opts.until?.(p)) return { steps: n, seconds: (p.run.steps * STEP_MS) / 1000, events, done: true, stuck: null };
    let intent: Intent = NONE;
    while (m < moves.length) {
      const k = moves[m].keys(p, mem);
      if (k === "done") {
        m++;
        mem = { i: 0, air: false };
        continue;
      }
      intent = k;
      break;
    }
    mem.i++;
    events.push(stepPlay(p, intent));
  }
  return { steps: max, seconds: (p.run.steps * STEP_MS) / 1000, events, done: false, stuck: moves[m]?.name ?? "the end of the script" };
}

export const tile = (c: number) => c * TILE;
export const mid = (c: number) => c * TILE + TILE / 2;
export { feet, cx };
