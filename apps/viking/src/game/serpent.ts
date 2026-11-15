import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Boss } from "../levels/types";

// The sea serpent at Gamlebyen's quay: the third boss, the last of line 2, as a small pure rule over the
// step count, in the plough's shape. It comes with its level (play.ts runs it through the level's boss
// slot), so the page does not carry it until Gamlebyen is fetched. Three bosses, three answers: light
// for the troll, timing for the plough, the shield for the serpent.
//
// It sleeps under the water until he comes onto its quay; the whole quay, from the planks' first board
// to the last longship's prow, is its fight. A round: a ring of foam marks where it will come up (a
// second and a half), it rises, rears for its tell (a second and a half, then a quarter less after each
// hit, never under a second), and spits a ball of brine straight along the quay at him, at the height he
// stands at (the quay, or the prow). With the shield up and facing it the ball goes back and dazes it:
// its head sinks onto the quay's edge for four seconds, and a stomp on the head is a hit. Without the
// shield, or with his back to it, the ball costs a heart. Then it lashes its tail along the quay towards
// him, seen coming a second before (jump it), and dives; and it rises again somewhere else.
//
// After the first hit it rises twice in a round: the first ball sent back it ducks under, and comes up
// at another place with a ring and a tell of its own; the second dazes it. After the second hit its tail
// follows each ball along the quay. Three hits, and it sinks for good; the dawn comes, and the rune rises
// to the last longship's prow. A ball that hits him ends the round with no tail: it watches him a while
// before it goes under. It
// rises at least four tiles from him, within seven where it can (if he walks up to its ring it moves once,
// with a fresh ring), and while it is up its neck stands in his way, as the plough does at rest (ADR 0022):
// what hurts is its ball and its tail, never its touch. If he goes back off its quay it sinks and waits,
// its hits kept.
//
// Hints, by event, each said only when it is true: "wake" as it first rises; "miss" when its ball hit
// him facing it or went past him (the shield was not up: raise it while it rears); "missTurn" when its
// ball hit his back (face it); "missHead" two seconds into a dazing with no stomp, while it still lies
// there; "missTail" as its tail hits him (jump it); and ten seconds with nothing done, the round's hint
// again, unless he has since done it.

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

export type SerpentPhase = "asleep" | "ring" | "rise" | "rear" | "spit" | "watch" | "duck" | "dazed" | "reel" | "lash" | "dive" | "rest" | "beaten";

export interface Ball {
  x: number;
  y: number;
  /** Pixels a step across: towards him, or back towards the head after the shield. */
  vx: number;
  back: boolean;
}

/** Its tail along the quay: where its tip is, the way it sweeps, the step its warning began, whether it caught him (and that was said). */
export interface Tail {
  x: number;
  dir: 1 | -1;
  at: number;
  hit: boolean;
  said: boolean;
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
  tail: Tail | null;
  /** The round's hint, to say again after ten seconds of nothing (cleared once he has done what it said). */
  hint: string | null;
  /** Steps since anything happened (a daze, a hit, a hint said). */
  stale: number;
  /** What touched him last in `hurts`: the ball, or nothing it can send back. */
  touched: "ball" | null;
  /** How long it rests under before the next round. */
  rest: number;
  /** A second rise still to come in this round (from its first hit on). */
  again: boolean;
  /** Its ring has moved once this round, because he came near it; and how long this ring lasts. */
  moved: boolean;
  ring: number;
  /** The height its ball flies at: his feet the last time he stood (the quay, or the prow). */
  aim: number;
  /** Beaten, the dawn has come and the rune has risen to the prow: it can be taken. */
  free: boolean;
}

/** Its size: the head (as it lies dazed on the quay), the neck (as wide as its base, and how high it rears), the tail's tip. */
export const SERPENT = { head: { w: 22, h: 12 }, neck: 14, rear: 60, tail: { w: 18, h: 7 } };
/**
 * Steps: the ring of foam before it rises (the round's first, and the second rise's), rising, its tell by
 * hits taken, ducking its own ball, dazed (and when it says to jump on its head), reeling from a hit,
 * diving, the tail's warning, watching him after its ball has hit him and resting under after that, ten
 * idle seconds; and when
 * it is beaten, the dawn, then the rune rising to the prow.
 */
export const SERPENT_STEPS = { ring: 90, ring2: 60, rise: 30, tell: [90, 75, 60], duck: 30, daze: 240, dazeHint: 90, reel: 50, dive: 30, tailWarn: 60, rest: 150, watch: 150, restHit: 180, stale: 600, dawn: 300, rune: 90 };
/** How fast the ball flies, and the tail sweeps. */
export const SERPENT_SPEED = { ball: 2, tail: 2.2 };
/** Where the tail comes up (this far behind its neck, from him) and how far past him it sweeps. */
export const TAIL = { behind: 4 * TILE, past: 5 * TILE };
/** It rises no nearer him than this. */
export const NEAR = 4 * TILE;

export function createSerpent(def: SerpentDef): Serpent {
  return { def, phase: "asleep", since: 0, at: 1, dir: -1, hits: 0, ball: null, burst: false, tail: null, hint: null, stale: 0, touched: null, rest: SERPENT_STEPS.rest, again: false, moved: false, ring: SERPENT_STEPS.ring, aim: def.floor, free: false };
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
export const neckUp = (s: Serpent) => s.phase === "rise" || s.phase === "rear" || s.phase === "spit" || s.phase === "watch" || s.phase === "lash";
/** Steps since it was beaten, while the dawn comes and the rune rises; null before. */
export const endingAge = (s: Serpent, step: number) => (s.phase === "beaten" ? step - s.since : null);

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

/** Where the mouth is as it spits: at his middle's height where he last stood, a little out from the neck. */
export const mouth = (s: Serpent) => ({ x: neckX(s) + s.dir * 12, y: s.aim - Math.round(PLAYER.h / 2) });

/** The tail's box while it sweeps along the quay (after its warning). */
export function tailBox(s: Serpent, step: number) {
  const t = s.tail;
  if (!t || step - t.at < SERPENT_STEPS.tailWarn) return null;
  return { x: t.x - SERPENT.tail.w / 2, y: s.def.floor - SERPENT.tail.h, w: SERPENT.tail.w, h: SERPENT.tail.h };
}

/** The first of `order` it can rise at, never within four tiles of him: in the middle of his view (within seven tiles) if it can, else within eleven. */
function nearest(s: Serpent, hx: number, order: number[]): number {
  const d = (i: number) => Math.abs(s.def.points[i] - hx);
  return order.find((i) => d(i) >= NEAR && d(i) <= 7 * TILE) ?? order.find((i) => d(i) >= NEAR && d(i) <= 11 * TILE) ?? order.find((i) => d(i) >= NEAR) ?? order[0];
}

/** Where it rises next: not where it was. */
const next = (s: Serpent, hx: number) => nearest(s, hx, [1, 2].map((k) => (s.at + k) % 3));

/** Says a hint and remembers it as the round's. */
function say(s: Serpent, hint: string): string {
  s.hint = hint;
  s.stale = 0;
  return hint;
}

/** He has done what a hint said: it is not said again. */
function done(s: Serpent, ...hints: string[]) {
  if (s.hint && hints.includes(s.hint)) s.hint = null;
}

/** Its tail comes up behind its neck (from him) and sweeps towards him, a second after its tip breaks the water. */
function lash(s: Serpent, step: number, hx: number) {
  if (s.tail) return;
  const dir: 1 | -1 = hx < neckX(s) ? -1 : 1;
  const x = Math.max(s.def.x0 + 8, Math.min(s.def.x1 - 8, neckX(s) - dir * TAIL.behind));
  s.tail = { x, dir, at: step, hit: false, said: false };
}

/** Under, then a rest before the next round. */
function dive(s: Serpent, step: number, rest: number) {
  s.ball = null;
  s.rest = rest;
  to(s, "dive", step);
}

/** A ring of foam at place `at`, `steps` long. */
function ring(s: Serpent, step: number, at: number, steps: number) {
  s.at = at;
  s.ring = steps;
  to(s, "ring", step);
}

/** A new round: a ring of foam where it will come up; from its first hit on, it will rise twice. */
function round(s: Serpent, step: number, at: number) {
  s.again = s.hits >= 1;
  s.moved = false;
  ring(s, step, at, SERPENT_STEPS.ring);
}

/** One step. `him` is where he is. What it did, for the sound and the words, or null. */
export function stepSerpent(s: Serpent, step: number, him: Body): string | null {
  const hx = him.x + PLAYER.w / 2;
  const age = step - s.since;
  if (s.phase === "beaten") {
    if (!s.free && age >= SERPENT_STEPS.dawn + SERPENT_STEPS.rune) s.free = true;
    return null;
  }
  if (s.phase === "asleep") {
    if (hx >= s.def.wakeAt && hx <= s.def.x1) {
      // First where he can see it come: the middle, or (from the quay's end) the nearer side.
      round(s, step, nearest(s, hx, [1, 0, 2]));
      return "wake";
    }
    return null;
  }
  // Back off its quay (over the basin): it sinks and waits for him, its hits kept.
  if (hx < s.def.x0 - TILE) {
    resetSerpent(s, step);
    return null;
  }
  if (him.onGround) s.aim = him.y + PLAYER.h;
  // Its tail, wherever the rest of it is: a second's warning, then along the quay to past him. Once it has
  // caught him it says so; one he has jumped, it does not say again.
  const t = s.tail;
  if (t && step - t.at >= SERPENT_STEPS.tailWarn) {
    t.x += t.dir * SERPENT_SPEED.tail;
    if ((t.x - hx) * t.dir > TAIL.past || t.x < s.def.x0 - 20 || t.x > s.def.x1 + 20) {
      s.tail = null;
      if (!t.hit) done(s, "missTail");
    }
  }
  if (t && t.hit && !t.said) {
    t.said = true;
    return say(s, "missTail");
  }
  // Ten seconds of nothing: the round's hint again ("jump on its head" only while it lies there).
  if (++s.stale >= SERPENT_STEPS.stale && s.hint && (s.hint !== "missHead" || s.phase === "dazed")) return say(s, s.hint);
  switch (s.phase) {
    case "ring":
      if (age < s.ring) return null;
      // He has come within four tiles of its ring: once a round it comes up somewhere else instead, with a fresh ring.
      if (!s.moved && Math.abs(neckX(s) - hx) < NEAR) {
        s.moved = true;
        ring(s, step, next(s, hx), SERPENT_STEPS.ring2);
        return null;
      }
      to(s, "rise", step);
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
        // From its second hit on, its tail follows the ball along the quay.
        if (s.hits >= 2) lash(s, step, hx);
        return "spit";
      }
      return null;
    case "spit": {
      const b = s.ball;
      // Burst on him (the page has taken the heart): the round ends with no tail; it stays up watching him a
      // while, then rests under; and the hint that is true.
      if (s.burst || !b) {
        s.burst = false;
        const facing = b ? Math.sign(b.x - b.vx * 4 - hx) === him.facing : true;
        s.ball = null;
        to(s, "watch", step);
        return say(s, facing ? "miss" : "missTurn");
      }
      b.x += b.vx;
      if (b.back && Math.abs(b.x - neckX(s)) <= Math.abs(b.vx)) {
        s.ball = null;
        done(s, "miss", "missTurn");
        s.stale = 0;
        // The round's first ball: it ducks under it, and comes up at another place.
        if (s.again) {
          s.again = false;
          to(s, "duck", step);
          return "duck";
        }
        to(s, "dazed", step);
        return "dazed";
      }
      // Past the quay's end into the water: it went past him (he jumped it, or never raised the shield).
      if (b.x < s.def.x0 - 8 || b.x > s.def.x1 + 8) {
        s.ball = null;
        if (s.again) {
          s.again = false;
          to(s, "duck", step);
          return say(s, "miss");
        }
        to(s, "lash", step);
        lash(s, step, hx);
        return say(s, "miss");
      }
      return null;
    }
    case "watch":
      s.dir = hx < neckX(s) ? -1 : 1;
      if (age >= SERPENT_STEPS.watch) dive(s, step, SERPENT_STEPS.restHit);
      return null;
    case "duck":
      // Under its own ball, and up again at another place: a shorter ring, and the round's own tell.
      if (age >= SERPENT_STEPS.duck) {
        s.moved = false;
        ring(s, step, next(s, hx), SERPENT_STEPS.ring2);
      }
      return null;
    case "dazed":
      // Two seconds on its head with no stomp: it says so while it still lies there.
      if (age === SERPENT_STEPS.dazeHint) return say(s, "missHead");
      if (age >= SERPENT_STEPS.daze) {
        to(s, "lash", step);
        lash(s, step, hx);
      }
      return null;
    case "reel":
      if (age >= SERPENT_STEPS.reel) {
        if (s.hits >= 3) {
          to(s, "beaten", step);
          s.hint = null;
          s.tail = null;
          return "beaten";
        }
        to(s, "lash", step);
        lash(s, step, hx);
      }
      return null;
    case "lash":
      // Its neck up, watching, until its tail has gone past him; then under.
      if (!s.tail && age > 0) dive(s, step, SERPENT_STEPS.rest);
      return null;
    case "dive":
      if (age >= SERPENT_STEPS.dive) to(s, "rest", step);
      return null;
    case "rest":
      if (age >= s.rest && !s.tail) round(s, step, next(s, hx));
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
  if (t && touches(him, t)) {
    if (s.tail) s.tail.hit = true;
    return { fromX: t.x + t.w / 2, from: "below" };
  }
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

/** He lost a life (or left its quay): back under the water, asleep, the hits it has taken kept. */
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
    blocks: (s) => (neckUp(s) ? bodyBox(s, s.since + SERPENT_STEPS.rise) : null),
    reset: resetSerpent,
    awake: serpentAwake,
    top: (s) => ({ x: neckX(s), y: s.def.floor - SERPENT.rear - 6, w: 30 }),
    // The rune can be taken once the dawn has come and the rune has risen to the prow.
    beaten: (s) => s.free
  };
}

/** The ring of foam where it will rise: its radius at a step of the ring (still, with reduced motion). */
export function ringRadius(age: number, reduced: boolean): number {
  return reduced ? 12 : 8 + Math.round(4 * Math.sin((age / SERPENT_STEPS.ring) * Math.PI * 3) ** 2);
}
