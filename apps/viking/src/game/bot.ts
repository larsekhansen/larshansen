import { carrierAt, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { PLAYER, STEP_MS, TILE } from "@larshansen/pixelkit/config";
import type { Intent } from "@larshansen/pixelkit/physics";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { enemyBox } from "./enemies";
import { stepPlay, type Events, type Play, type PlayIntent } from "./play";

// A scripted player for the tests: a list of moves, each one deciding the keys for a step by
// looking at the level as it is (where he is, where the rafts and bells are), until it is done.
// It plays the real rules with the real jump, so what it clears, a person can clear.

export type Move = { name: string; keys(p: Play, s: Mem): PlayIntent | "done" };
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

/**
 * What is in his way going `dir`: something on the ground close ahead to jump over, or something
 * in the air at his height to wait for. Enemies only; the rest is the route's business.
 */
function threat(p: Play, dir: number): "jump" | "wait" | null {
  const x = cx(p);
  const f = feet(p);
  for (const e of p.enemies) {
    const b = enemyBox(e, p.t);
    if (!b) continue;
    const ahead = (dir > 0 ? b.x - (x + PLAYER.w / 2) : x - PLAYER.w / 2 - (b.x + b.w)) ;
    if (e.def.kind === "flyer") {
      // A bird at his height, close ahead or coming: wait for it to go.
      const coming = Math.sign(e.x - x) !== e.dir;
      if (ahead > -b.w && ahead < (coming ? 44 : 22) && b.y + b.h > f - PLAYER.h - 22 && b.y < f) return "wait";
      continue;
    }
    if (e.def.kind === "jumper") continue;
    if (Math.abs(b.y + b.h - f) < 12 && ahead > 0 && ahead < 24 + (e.def.speed ?? 0.3) * 20) return "jump";
  }
  return null;
}

/** Walks to x and stops there, hopping over anything that stops him and over enemies on the ground, and waiting for birds. */
export const walk = (x: number, opts: { careless?: boolean } = {}): Move => ({
  name: `walk to ${x}`,
  keys(p, s) {
    const dx = x - cx(p);
    if (Math.abs(dx) <= 2 && p.body.onGround && Math.abs(p.body.vx) < 0.05) return "done";
    if (Math.abs(dx) <= 2) return NONE;
    const dir = dirTo(cx(p), x);
    const t = opts.careless ? null : threat(p, dir);
    if (t === "wait" && p.body.onGround) return NONE;
    const stuck = p.body.onGround && Math.abs(p.body.vx) < 0.05 && s.i > 3;
    s.stuck = stuck ? ((s.stuck as number) ?? 0) + 1 : 0;
    const near = Math.abs(dx) < Math.abs(p.body.vx) * 4;
    return keys(near ? 0 : dir, true, (s.stuck as number) === 5 || (t === "jump" && p.body.onGround));
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

/** Walks up to enemy `i` and comes down on it from above, keeping over it while he falls. */
export const stomp = (i: number): Move => ({
  name: `stomp enemy ${i}`,
  keys(p, s) {
    const e = p.enemies[i];
    if (!e.alive) return p.body.onGround ? "done" : NONE;
    const dx = e.x - cx(p);
    const dir = dirTo(0, dx);
    if (s.took === undefined) {
      if (!p.body.onGround || Math.abs(dx) > 46) return keys(dir);
      s.took = s.i;
    }
    const k = s.i - (s.took as number);
    // Landed and it is still there: go again.
    if (k > 2 && p.body.onGround) s.took = undefined;
    // In the air: steer to come down on it, braking ahead of it since the air is slow to turn.
    const aim = e.x - p.body.vx * 7 - cx(p);
    const steer = Math.abs(aim) > 2 ? Math.sign(aim) : 0;
    return keys(steer, k < 30, k === 0);
  }
});

/** A short hop the way `dir` points, for a gap of a tile. */
export const hop = (dir: -1 | 1): Move => jump(dir, { hold: 10, release: 18 });

/** Stands still until the test holds. */
export const wait = (name: string, until: (p: Play) => boolean): Move => ({ name, keys: (p) => (until(p) ? "done" : NONE) });

/** Up at a bench: he sits, and the hearts fill. Done once he sits. */
export const sit = (): Move => ({ name: "sit", keys: (p) => (p.sitting ? "done" : { ...NONE, sit: true }) });

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
  /** Hearts lost on the way, and where (the move it was on, and his x). */
  hurt: { move: string; x: number; t: number }[];
}

/** Plays the moves in order, at most `max` steps. Stops when the rune is taken, or `until` holds. */
export function playMoves(p: Play, moves: Move[], opts: { max?: number; until?: (p: Play) => boolean } = {}): Result {
  const max = opts.max ?? 60 * 240;
  const events: Events[] = [];
  const hurt: Result["hurt"] = [];
  let m = 0;
  let mem: Mem = { i: 0, air: false };
  for (let n = 0; n < max; n++) {
    if (p.run.state === "done" || opts.until?.(p)) return { steps: n, seconds: (p.run.steps * STEP_MS) / 1000, events, done: true, stuck: null, hurt };
    if (p.run.state === "over") break;
    let intent: PlayIntent = NONE;
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
    const ev = stepPlay(p, intent);
    if (ev.hurt) hurt.push({ move: moves[m]?.name ?? "the end", x: Math.round(cx(p)), t: p.t });
    events.push(ev);
  }
  return { steps: max, seconds: (p.run.steps * STEP_MS) / 1000, events, done: false, stuck: moves[m]?.name ?? "the end of the script", hurt };
}

export const tile = (c: number) => c * TILE;
export const mid = (c: number) => c * TILE + TILE / 2;
export { feet, cx };

/** Plays a route a step at a time: the keys for this step, or null once it has run out (for `?debug&auto`). */
export function autopilot(moves: Move[]) {
  let m = 0;
  let mem: Mem = { i: 0, air: false };
  return (p: Play) => {
    while (m < moves.length) {
      const k = moves[m].keys(p, mem);
      if (k !== "done") {
        mem.i++;
        return k;
      }
      m++;
      mem = { i: 0, air: false };
    }
    return null;
  };
}
