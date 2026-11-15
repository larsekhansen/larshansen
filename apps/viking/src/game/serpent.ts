import { PLAYER } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Boss } from "../levels/types";

// The sea serpent at Gamlebyen's quay: the third boss, the last of line 2, as a small pure rule over the
// step count, in the plough's shape. It comes with its level (play.ts runs it through the level's boss
// slot), so the page does not carry it until Gamlebyen is fetched. Three bosses, three answers: light
// for the troll, timing for the plough, the shield for the serpent.
//
// It sleeps under the water until he comes onto the quay. A round: a ring of foam marks where it will
// come up (a second and a half), it rises, rears for its tell (a second and a half, then a quarter less
// after each hit, never under a second), and spits a ball of brine straight along the quay at him. With
// the shield up and facing it the ball goes back and dazes it: its head sinks onto the quay's edge for
// four seconds, and a stomp on the head is a hit. Without the shield, or with his back to it, the ball
// costs a heart. Then it dives, and as it goes under its tail sweeps once along the quay, low and slow,
// seen coming a second before (jump it); and it rises again somewhere else. Three hits, and it sinks for
// good. A ball that hits him ends the round with no tail (it has made its point) and a longer rest. It never
// rises within four tiles of him, and while it is up its neck stands in his way, as the plough does at rest
// (ADR 0022): what hurts is its ball and its tail, never its touch.
//
// Hints, by event: "wake" as it first rises; "miss" after a round with no dazing (the shield sends the
// ball back); "missHead" after a dazing with no stomp (jump on its head); and ten seconds with nothing
// done, the round's hint again. A lost life sends it back under, its hits kept.

export interface SerpentDef {
  /** The quay's top (world y), and its two ends (world x). */
  floor: number;
  x0: number;
  x1: number;
  /** The three places it rises, left, middle and right (world x of its neck). */
  points: [number, number, number];
  /** How far along he comes before it wakes. */
  wakeAt: number;
}

export type SerpentPhase = "asleep" | "ring" | "rise" | "rear" | "spit" | "dazed" | "reel" | "dive" | "tail" | "rest" | "beaten";

export interface Ball {
  x: number;
  y: number;
  /** Pixels a step across: towards him, or back towards the head after the shield. */
  vx: number;
  back: boolean;
}

export interface Serpent {
  def: SerpentDef;
  phase: SerpentPhase;
  since: number;
  /** Which of its three places it is at. */
  at: number;
  /** The way its head faces (towards him, at the spit). */
  dir: 1 | -1;
  hits: number;
  ball: Ball | null;
  /** The ball burst on him this step (it is gone next step). */
  burst: boolean;
  /** The tail's tip along the quay (world x) and the way it sweeps, while it sweeps. */
  tail: { x: number; dir: 1 | -1 } | null;
  /** The round's hint, to say again after ten seconds of nothing. */
  hint: string | null;
  /** Steps since anything happened (a daze, a hit, a hint said). */
  stale: number;
  /** What touched him last in `hurts`: the ball, or nothing it can send back. */
  touched: "ball" | null;
  /** How long it rests under before the next round. */
  rest: number;
}

/** Its size: the head (as it lies dazed on the quay, and as it rears), the neck, the tail's tip. */
export const SERPENT = { head: { w: 22, h: 12 }, neck: 10, rear: 34, tail: { w: 18, h: 7 } };
/**
 * Steps: the ring of foam before it rises, rising, its tell by hits taken, dazed, reeling from a hit,
 * diving, the tail's warning, resting under (longer after its ball has hit him), and ten idle seconds.
 */
export const SERPENT_STEPS = { ring: 90, rise: 30, tell: [90, 75, 60], daze: 240, reel: 50, dive: 30, tailWarn: 60, rest: 150, restHit: 420, stale: 600 };
/** How fast the ball flies, and the tail sweeps. */
export const SERPENT_SPEED = { ball: 2, tail: 1.6 };

export function createSerpent(def: SerpentDef): Serpent {
  return { def, phase: "asleep", since: 0, at: 1, dir: -1, hits: 0, ball: null, burst: false, tail: null, hint: null, stale: 0, touched: null, rest: SERPENT_STEPS.rest };
}

const to = (s: Serpent, phase: SerpentPhase, step: number) => {
  s.phase = phase;
  s.since = step;
};
/** Where its neck is, this round. */
export const neckX = (s: Serpent) => s.def.points[s.at];
/** Its tell this round: a second and a half, a quarter less after each hit, never under a second. */
export const tellSteps = (s: Serpent) => SERPENT_STEPS.tell[Math.min(s.hits, SERPENT_STEPS.tell.length - 1)];
/** True while it is in its fight: woken, not under for good. */
export const serpentAwake = (s: Serpent) => s.phase !== "asleep" && s.phase !== "beaten";
/** Up out of the water and not dazed: its neck stands in his way. */
const up = (s: Serpent) => s.phase === "rise" || s.phase === "rear" || s.phase === "spit";

/** The head as it lies dazed on the quay's edge: the box he comes down on. */
export function headBox(s: Serpent) {
  const x = neckX(s) + s.dir * 6;
  return { x: x - SERPENT.head.w / 2, y: s.def.floor - SERPENT.head.h, w: SERPENT.head.w, h: SERPENT.head.h };
}

/** Its neck and head while it is up: from the quay's edge to its head, reared or lowered to spit. */
export function bodyBox(s: Serpent, step: number) {
  const age = step - s.since;
  const top = s.phase === "rise" ? s.def.floor - Math.round((SERPENT.rear * Math.min(age, SERPENT_STEPS.rise)) / SERPENT_STEPS.rise) : s.def.floor - SERPENT.rear;
  return { x: neckX(s) - SERPENT.neck / 2, y: top, w: SERPENT.neck, h: s.def.floor - top };
}

/** Where the mouth is as it spits: low, at his middle's height, a little out from the neck. */
const mouth = (s: Serpent) => ({ x: neckX(s) + s.dir * 12, y: s.def.floor - Math.round(PLAYER.h / 2) });

/** The tail's box while it sweeps along the quay (after its warning). */
export function tailBox(s: Serpent, step: number) {
  if (s.phase !== "tail" || !s.tail || step - s.since < SERPENT_STEPS.tailWarn) return null;
  return { x: s.tail.x - SERPENT.tail.w / 2, y: s.def.floor - SERPENT.tail.h, w: SERPENT.tail.w, h: SERPENT.tail.h };
}

/**
 * The next place it rises: never where it was, nor within four tiles of him, and where he can see it come
 * (within eleven tiles of him) when one of the other two is; middle, right, left, round again.
 */
function next(s: Serpent, hx: number): number {
  const others = [1, 2].map((k) => (s.at + k) % 3);
  const d = (i: number) => Math.abs(s.def.points[i] - hx);
  return others.find((i) => d(i) >= 4 * 16 && d(i) <= 11 * 16) ?? others.find((i) => d(i) >= 4 * 16) ?? others[0];
}

/** Says a hint and remembers it as the round's. */
function say(s: Serpent, hint: string): string {
  s.hint = hint;
  s.stale = 0;
  return hint;
}

/** Under, then its tail along the quay from its own end (the end nearer its neck) to the other. */
function dive(s: Serpent, step: number, tail: boolean) {
  s.ball = null;
  s.rest = tail ? SERPENT_STEPS.rest : SERPENT_STEPS.restHit;
  to(s, "dive", step);
  s.tail = tail ? { x: neckX(s) < (s.def.x0 + s.def.x1) / 2 ? s.def.x0 : s.def.x1, dir: neckX(s) < (s.def.x0 + s.def.x1) / 2 ? 1 : -1 } : null;
}

/** One step. `him` is where he is. What it did, for the sound and the words, or null. */
export function stepSerpent(s: Serpent, step: number, him: Body): string | null {
  const hx = him.x + PLAYER.w / 2;
  const age = step - s.since;
  if (s.phase === "asleep") {
    if (hx >= s.def.wakeAt && hx <= s.def.x1) {
      // First where he can see it come: the middle, or (from the quay's end) the nearer side.
      const d = (i: number) => Math.abs(s.def.points[i] - hx);
      s.at = [1, 0, 2].find((i) => d(i) >= 4 * 16 && d(i) <= 11 * 16) ?? 1;
      to(s, "ring", step);
      return "wake";
    }
    return null;
  }
  if (s.phase === "beaten") return null;
  // Ten seconds of nothing: the round's hint again.
  if (++s.stale >= SERPENT_STEPS.stale && s.hint) return say(s, s.hint);
  switch (s.phase) {
    case "ring":
      if (age >= SERPENT_STEPS.ring) to(s, "rise", step);
      return null;
    case "rise":
      if (age >= SERPENT_STEPS.rise) {
        to(s, "rear", step);
        s.dir = hx < neckX(s) ? -1 : 1;
        return "windup";
      }
      return null;
    case "rear":
      s.dir = hx < neckX(s) ? -1 : 1;
      if (age >= tellSteps(s)) {
        const m = mouth(s);
        s.ball = { x: m.x, y: m.y, vx: s.dir * SERPENT_SPEED.ball, back: false };
        to(s, "spit", step);
        return "spit";
      }
      return null;
    case "spit": {
      const b = s.ball;
      // Burst on him (the page has taken the heart): the round ends, no tail, a rest and the hint.
      if (s.burst || !b) {
        s.burst = false;
        dive(s, step, false);
        return say(s, "miss");
      }
      b.x += b.vx;
      if (b.back && Math.abs(b.x - neckX(s)) <= Math.abs(b.vx)) {
        s.ball = null;
        to(s, "dazed", step);
        s.stale = 0;
        return "dazed";
      }
      // Past the quay's end into the water: missed, and the tail comes.
      if (b.x < s.def.x0 - 8 || b.x > s.def.x1 + 8) {
        dive(s, step, true);
        return say(s, "miss");
      }
      return null;
    }
    case "dazed":
      if (age >= SERPENT_STEPS.daze) {
        dive(s, step, true);
        return say(s, "missHead");
      }
      return null;
    case "reel":
      if (age >= SERPENT_STEPS.reel) {
        if (s.hits >= 3) {
          to(s, "beaten", step);
          s.hint = null;
          return "beaten";
        }
        dive(s, step, true);
      }
      return null;
    case "dive":
      if (age < SERPENT_STEPS.dive) return null;
      to(s, s.tail ? "tail" : "rest", step);
      return s.tail ? "tail" : null;
    case "tail": {
      if (age < SERPENT_STEPS.tailWarn || !s.tail) return null;
      s.tail.x += s.tail.dir * SERPENT_SPEED.tail;
      if (s.tail.x < s.def.x0 - 20 || s.tail.x > s.def.x1 + 20) {
        s.tail = null;
        to(s, "rest", step);
      }
      return null;
    }
    case "rest":
      if (age >= s.rest) {
        s.at = next(s, hx);
        to(s, "ring", step);
      }
      return null;
  }
  return null;
}

/** He came down on its dazed head: a hit. On it while it reels: a bounce. */
export function serpentStomped(s: Serpent, step: number, him: Body, prevBottom: number): { top: number; hit: boolean } | null {
  if (him.vy < 0 || (s.phase !== "dazed" && s.phase !== "reel")) return null;
  const h = headBox(s);
  const feet = him.y + PLAYER.h;
  if (him.x + PLAYER.w <= h.x || him.x >= h.x + h.w || prevBottom > h.y + 2 || feet < h.y) return null;
  if (s.phase === "reel") return { top: h.y, hit: false };
  s.hits++;
  s.stale = 0;
  s.hint = null;
  to(s, "reel", step);
  return { top: h.y, hit: true };
}

const touches = (him: Body, r: { x: number; y: number; w: number; h: number }) => him.x < r.x + r.w && him.x + PLAYER.w > r.x && him.y < r.y + r.h && him.y + PLAYER.h > r.y;

/** What hurts him this step: the ball flying at him (from the side it comes), the tail along the quay (from below: jump it). */
export function serpentHurts(s: Serpent, step: number, him: Body): { fromX: number; from?: "above" | "below" } | null {
  s.touched = null;
  const b = s.ball;
  if (b && !b.back && touches(him, { x: b.x - 4, y: b.y - 4, w: 8, h: 8 })) {
    s.touched = "ball";
    s.burst = true;
    return { fromX: b.x - b.vx * 4 };
  }
  const t = tailBox(s, step);
  if (t && touches(him, t)) return { fromX: t.x + t.w / 2, from: "below" };
  return null;
}

/** The shield held it off: the ball goes back the way it came, at the head. */
function shoveSerpent(s: Serpent) {
  if (s.touched === "ball" && s.ball) {
    s.burst = false;
    s.ball.back = true;
    s.ball.vx = -s.ball.vx;
  }
}

/** He lost a life: back under the water, asleep, the hits it has taken kept. */
export function resetSerpent(s: Serpent, step: number) {
  if (s.phase === "beaten") return;
  Object.assign(s, { phase: "asleep", since: step, ball: null, burst: false, tail: null, stale: 0, touched: null });
}

/** The serpent's rules for the level's boss slot. */
export function serpentBoss(def: SerpentDef): Boss<Serpent> {
  return {
    create: () => createSerpent(def),
    step: stepSerpent,
    stomped: serpentStomped,
    hurts: serpentHurts,
    shoved: (s) => shoveSerpent(s),
    // Up out of the water, its neck is in his way: he cannot walk through it.
    blocks: (s) => (up(s) ? bodyBox(s, s.since + SERPENT_STEPS.rise) : null),
    reset: resetSerpent,
    awake: serpentAwake,
    top: (s) => ({ x: neckX(s), y: s.def.floor - SERPENT.rear - 6, w: 30 }),
    beaten: (s) => s.phase === "beaten"
  };
}

/** The ring of foam where it will rise: its radius at a step of the ring (still, with reduced motion). */
export function ringRadius(age: number, reduced: boolean): number {
  return reduced ? 10 : 6 + Math.round(4 * Math.sin((age / SERPENT_STEPS.ring) * Math.PI * 3) ** 2);
}
