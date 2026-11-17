import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Boss } from "../levels/types";

// Loki at the encore (order 29, ADR 0052): the Neon Invaders' front man, met once, on a small stage, after every rune of
// both lines is held. A small pure rule over the step count, in the shape of the plough and the serpent, through the
// level's boss slot; it comes with the encore's file, so no other page carries it.
//
// He is a trickster, so his attacks are other people's. Each round he puts on the glamour of one of the three bosses' moves,
// drawn in his own neon, with that boss's own tell and its own answer:
//   the club (the troll's): he struts up to him and raises a club for a full second, then slams it down; the stage floor
//     sends a wave out both ways. Jump as it comes down.
//   the charge (the plough's): he struts off to a run-up, revs for a full second (his shoulders' beacons flashing, the
//     guitar held out like a blade), then slides across the floor on his knees to past where he stood. Be up on a speaker.
//   the bite (the serpent's): he struts near, spreads his arms, and a ring of neon foam runs under him and stops (a second
//     and a half in all); then jaws come up out of the ring. Be out of it.
// Between his attacks he poses, and that is the opening: a stomp on him while he poses is a hit. The first round after
// each hit is the move that hit brings in (the club, then the charge, then the bite); a round with no hit goes on to the
// next of the moves he has shown, so a player who misses the opening must read which is coming.
//
// Each hit knocks a piece of the glamour off him: the hair (a wig), the shades, the jacket. After the third he is a thin man
// in a grey wool sweater with a thermos; he shrugs, says his line and walks off stage by the nearer wing. When he is gone
// the level is over (`ends`): it gives no rune and counts nothing (ADR 0052).
//
// What hurts: his body while he struts and while he raises the club (as the troll's does); the club as it comes down; the
// wave (from below: the shield does not stop it); his body while he slides (the shield stops it: he skids and poses); the
// jaws (from below). Revving, conjuring, posing, reeling and plain, he is harmless. A lost life, or going back off the
// stage, sends him back to his mark at the back of the stage, his hits kept.

export interface LokiDef {
  /** The stage's floor (world y), and its two ends (world x): his fight is on it. */
  floor: number;
  x0: number;
  x1: number;
  /** Where he waits (his centre x), and how far onto the stage he comes before the show starts. */
  home: number;
  wakeAt: number;
}

export type LokiAttack = "club" | "charge" | "bite";
export type LokiPhase = "asleep" | "waking" | "strut" | "club" | "slam" | "rev" | "charge" | "ring" | "bite" | "pose" | "reel" | "plain" | "leave" | "gone";

export interface Loki {
  def: LokiDef;
  /** His centre; he stands on the floor. */
  x: number;
  dir: 1 | -1;
  phase: LokiPhase;
  since: number;
  hits: number;
  /** Rounds since the last hit (or since the show began): which attack comes. */
  round: number;
  attack: LokiAttack;
  /** Where he struts to before this round's tell; and, sliding, where the slide ends. */
  target: number;
  /** The club's wave: where it started and when; its two fronts run out from there along the floor. */
  wave: { x: number; at: number } | null;
  /** The bite's ring: where it is (its middle, on what he stood on) and whether it has stopped following him. */
  ring: { x: number; y: number; fixed: boolean } | null;
  /** His feet the last time he stood (the floor or a speaker's top): where the ring runs. */
  aim: number;
  /** What hurt him last, for the round's hint (said once a round); and whether it was said. */
  hurtBy: LokiAttack | null;
  said: boolean;
  /** He moved under his own power this step (strutting or sliding). */
  moved: boolean;
  /** Steps he has strutted without getting where he meant to: after four seconds he tells all the same. */
  stale: number;
  /** Walking off: the wing he leaves by, and the step he went out of sight (or null). */
  wing: number;
  out: number | null;
}

/** His size: as tall as two and a half of him; lower while he slides on his knees. */
export const LOKI = { w: 14, h: 34, low: 26 };
/**
 * Steps: waking; each tell (the club raised, revving, the ring: as long as the troll's, the plough's and the serpent's
 * ring of foam), the ring following him and then holding; the slam, the jaws rising, biting and sinking; the pose (the
 * opening), reeling from a hit; plain and shrugging; out of sight before the level ends; four seconds of strutting at most.
 */
export const LOKI_STEPS = { waking: 90, club: 60, rev: 60, ring: 90, follow: 45, slam: 24, rise: 24, bite: 18, sink: 12, pose: 150, reel: 80, plain: 150, gone: 50, strut: 240 };
/** How fast he struts (a little faster after each hit), slides, and walks off. */
export const LOKI_SPEED = { strut: [1.2, 1.3, 1.4], charge: 2.8, ring: 1.2, leave: 1.0 };
/** The club in front of him as it comes down, and how long the blow hurts (the troll's). */
export const LOKI_CLUB = { reach: 20, h: 16, hurts: 8 };
/** The wave in the floor (the troll's): how fast each front runs, how many steps, how high and wide it is. */
export const LOKI_WAVE = { speed: 1.4, steps: 70, h: 6, w: 6 };
/** How near he comes before he raises the club (centre to centre); how far off he revs; how far past where he stood the slide goes; how near he comes to conjure. */
export const LOKI_REACH = { club: LOKI.w / 2 + 23, charge: 7 * TILE, past: 5 * TILE, bite: 5 * TILE };
/** The ring: its half-width, and how high the jaws come up out of it. */
export const LOKI_RING = { r: 12, jaws: 28 };
/** The attacks of each phase, in the order he puts them on: the one the last hit brought in first. */
export const LOKI_SETS: readonly (readonly LokiAttack[])[] = [["club"], ["charge", "club"], ["bite", "charge", "club"]];
/** Each attack's tell, its phase and its length: for the test that none is shorter than the shortest of the three bosses'. */
export const LOKI_TELLS: Record<LokiAttack, { phase: LokiPhase; steps: number }> = { club: { phase: "club", steps: LOKI_STEPS.club }, charge: { phase: "rev", steps: LOKI_STEPS.rev }, bite: { phase: "ring", steps: LOKI_STEPS.ring } };

export function createLoki(def: LokiDef): Loki {
  return { def, x: def.home, dir: -1, phase: "asleep", since: 0, hits: 0, round: 0, attack: "club", target: def.home, wave: null, ring: null, aim: def.floor, hurtBy: null, said: false, moved: false, stale: 0, wing: def.x1, out: null };
}

const to = (s: Loki, phase: LokiPhase, step: number) => {
  s.phase = phase;
  s.since = step;
};
const clampX = (s: Loki, x: number) => Math.max(s.def.x0 + LOKI.w / 2 + 2, Math.min(s.def.x1 - LOKI.w / 2 - 2, x));
/** True while he is in his fight: the show has started and he is not yet plain. */
export const lokiAwake = (s: Loki) => s.phase !== "asleep" && s.hits < 3;
/** While he slides or revs he is down on one knee: lower. */
export const lokiLow = (s: Loki) => s.phase === "charge" || s.phase === "rev";
/** His body: what hurts while he struts, raises the club or slides, and what he is stomped on by while he poses. */
export function lokiBox(s: Loki) {
  const h = lokiLow(s) ? LOKI.low : LOKI.h;
  return { x: s.x - LOKI.w / 2, y: s.def.floor - h, w: LOKI.w, h };
}
/** The club's box while the blow hurts, or null. */
export function lokiClub(s: Loki, step: number) {
  if (s.phase !== "slam" || step - s.since > LOKI_CLUB.hurts) return null;
  const x = s.dir > 0 ? s.x + LOKI.w / 2 : s.x - LOKI.w / 2 - LOKI_CLUB.reach;
  return { x, y: s.def.floor - LOKI_CLUB.h, w: LOKI_CLUB.reach, h: LOKI_CLUB.h };
}
/** The wave's two fronts at a step, as boxes on the floor; stopped by the stage's ends. */
export function lokiWave(s: Loki, step: number): { x: number; y: number; w: number; h: number }[] {
  if (!s.wave) return [];
  const age = step - s.wave.at;
  if (age < 0 || age > LOKI_WAVE.steps) return [];
  const out = [];
  for (const way of [-1, 1]) {
    const x = s.wave.x + way * age * LOKI_WAVE.speed;
    if (x < s.def.x0 || x > s.def.x1) continue;
    out.push({ x: x - LOKI_WAVE.w / 2, y: s.def.floor - LOKI_WAVE.h, w: LOKI_WAVE.w, h: LOKI_WAVE.h });
  }
  return out;
}
/** How high the jaws stand out of the ring at a step of the bite (0 before and after). */
export function jawsUp(s: Loki, step: number): number {
  if (s.phase !== "bite") return 0;
  const age = step - s.since;
  const { rise, bite, sink } = LOKI_STEPS;
  const k = age < rise ? age / rise : age < rise + bite ? 1 : Math.max(0, 1 - (age - rise - bite) / sink);
  return Math.round(LOKI_RING.jaws * k);
}
/** The jaws' box while they hurt (up four pixels or more, rising or biting), or null. */
export function lokiJaws(s: Loki, step: number) {
  const h = jawsUp(s, step);
  if (!s.ring || h < 4 || step - s.since >= LOKI_STEPS.rise + LOKI_STEPS.bite) return null;
  return { x: s.ring.x - LOKI_RING.r + 2, y: s.ring.y - h, w: 2 * LOKI_RING.r - 4, h };
}

/** The hint that says how to answer what hurt him. */
const HINT: Record<LokiAttack, string> = { club: "missClub", charge: "missCharge", bite: "missBite" };

/** A new round: the next attack of this phase's set; a strut to where it starts. */
function nextRound(s: Loki, step: number, hx: number): string | null {
  const set = LOKI_SETS[Math.min(s.hits, LOKI_SETS.length - 1)];
  s.attack = set[s.round % set.length];
  s.round++;
  s.said = false;
  s.stale = 0;
  s.wave = null;
  s.ring = null;
  aimFor(s, hx);
  to(s, "strut", step);
  return null;
}

/** Where he struts to for this round's attack: up to him for the club; to a run-up on the side with more room for the charge; near for the bite. */
function aimFor(s: Loki, hx: number) {
  const side = hx < s.x ? 1 : -1;
  if (s.attack === "club") s.target = clampX(s, hx + side * LOKI_REACH.club);
  else if (s.attack === "bite") s.target = Math.abs(hx - s.x) <= LOKI_REACH.bite ? s.x : clampX(s, hx + side * LOKI_REACH.bite);
  else {
    const room = hx - s.def.x0 > s.def.x1 - hx ? -1 : 1;
    s.target = clampX(s, hx + room * LOKI_REACH.charge);
  }
}

/** The tell for this round's attack, once he is where he means to be. */
function tell(s: Loki, step: number, hx: number): string {
  s.dir = hx < s.x ? -1 : 1;
  if (s.attack === "club") {
    to(s, "club", step);
    return "club";
  }
  if (s.attack === "charge") {
    to(s, "rev", step);
    // The slide: towards him and on past where he stands now, to the end of the stage at most.
    s.target = clampX(s, hx + s.dir * LOKI_REACH.past);
    return "rev";
  }
  s.ring = { x: hx, y: s.aim, fixed: false };
  to(s, "ring", step);
  return "ring";
}

/** One step. `him` is where he is. What he did, for the sound and the words, or null. */
export function stepLoki(s: Loki, step: number, him: Body): string | null {
  const hurt = s.hurtBy;
  s.hurtBy = null;
  if (him.onGround) s.aim = him.y + PLAYER.h;
  if (s.wave && step - s.wave.at > LOKI_WAVE.steps) s.wave = null;
  if (s.phase === "gone") return null;
  // Back off the stage (down the gangway to the park): the show stops and waits for him, its hits kept.
  if (s.hits < 3 && s.phase !== "asleep" && him.x + PLAYER.w / 2 < s.def.x0 - TILE) {
    resetLoki(s, step);
    return null;
  }
  const ev = phase(s, step, him);
  // What hurt him, said once a round (the hint that is true): this step, or the next if he did something now.
  if (hurt && !s.said && s.hits < 3) {
    if (ev) s.hurtBy = hurt;
    else {
      s.said = true;
      return HINT[hurt];
    }
  }
  return ev;
}

function phase(s: Loki, step: number, him: Body): string | null {
  const hx = him.x + PLAYER.w / 2;
  const age = step - s.since;
  const was = s.x;
  s.moved = false;
  switch (s.phase) {
    case "asleep":
      if (hx >= s.def.wakeAt && hx <= s.def.x1) {
        to(s, "waking", step);
        s.dir = hx < s.x ? -1 : 1;
        return "wake";
      }
      return null;
    case "waking":
      if (age >= LOKI_STEPS.waking) return nextRound(s, step, hx);
      return null;
    case "strut": {
      // For the club he keeps coming at him as he moves; for the others he goes to the mark he chose.
      if (s.attack === "club") aimFor(s, hx);
      const v = LOKI_SPEED.strut[Math.min(s.hits, 2)];
      const d = s.target - s.x;
      if (Math.abs(d) <= v || ++s.stale >= LOKI_STEPS.strut) {
        s.x = s.target;
        return tell(s, step, hx);
      }
      s.dir = d < 0 ? -1 : 1;
      s.x += s.dir * v;
      s.moved = true;
      return null;
    }
    case "club":
      if (age >= LOKI_STEPS.club) {
        to(s, "slam", step);
        s.wave = { x: s.x + s.dir * (LOKI.w / 2 + LOKI_CLUB.reach - 4), at: step };
        return "slam";
      }
      return null;
    case "slam":
      if (age >= LOKI_STEPS.slam) return pose(s, step, hx);
      return null;
    case "rev":
      // He backs up a little as he revs (the plough's way), then goes.
      if (age < 20) s.x = clampX(s, s.x - s.dir * 0.4);
      if (age >= LOKI_STEPS.rev) {
        to(s, "charge", step);
        return "charge";
      }
      return null;
    case "charge": {
      s.x = s.dir > 0 ? Math.min(s.target, s.x + LOKI_SPEED.charge) : Math.max(s.target, s.x - LOKI_SPEED.charge);
      s.moved = s.x !== was;
      if (s.x === s.target) return pose(s, step, hx);
      return null;
    }
    case "ring": {
      const r = s.ring!;
      if (age < LOKI_STEPS.follow) {
        // The ring runs after him (a step behind), then holds where it is.
        const d = hx - r.x;
        r.x += Math.abs(d) <= LOKI_SPEED.ring ? d : Math.sign(d) * LOKI_SPEED.ring;
        r.y = s.aim;
      } else r.fixed = true;
      s.dir = hx < s.x ? -1 : 1;
      if (age >= LOKI_STEPS.ring) {
        to(s, "bite", step);
        return "bite";
      }
      return null;
    }
    case "bite":
      if (age >= LOKI_STEPS.rise + LOKI_STEPS.bite + LOKI_STEPS.sink) {
        s.ring = null;
        return pose(s, step, hx);
      }
      return null;
    case "pose":
      if (age >= LOKI_STEPS.pose) {
        // The opening went by: the next round, and the hint (unless what hurt him this round was said already).
        const said = s.said;
        nextRound(s, step, hx);
        return said ? null : "miss";
      }
      return null;
    case "reel":
      // The piece of his glamour that came off, and his line for it, as it lands.
      if (age === 20) return `piece${s.hits}`;
      if (age >= LOKI_STEPS.reel) {
        if (s.hits >= 3) {
          to(s, "plain", step);
          s.dir = hx < s.x ? -1 : 1;
          return "beaten";
        }
        s.round = 0;
        return nextRound(s, step, hx);
      }
      return null;
    case "plain":
      if (age >= LOKI_STEPS.plain) {
        // Off by the nearer wing.
        s.wing = s.x - s.def.x0 < s.def.x1 - s.x ? s.def.x0 - 2 * TILE : s.def.x1 + 2 * TILE;
        s.dir = s.wing < s.x ? -1 : 1;
        to(s, "leave", step);
      }
      return null;
    case "leave":
      if (s.out === null) {
        const d = s.wing - s.x;
        s.x += Math.abs(d) <= LOKI_SPEED.leave ? d : Math.sign(d) * LOKI_SPEED.leave;
        if (s.x === s.wing) s.out = step;
        return null;
      }
      if (step - s.out >= LOKI_STEPS.gone) {
        to(s, "gone", step);
        return "gone";
      }
      return null;
  }
  return null;
}

/** Into his pose, facing him: the opening. */
function pose(s: Loki, step: number, hx: number): string {
  s.dir = hx < s.x ? -1 : 1;
  to(s, "pose", step);
  return "pose";
}

/**
 * He came down on him: a hit while he poses; while touching him hurts (strutting, the club raised, sliding), nothing (the
 * touch hurts, as an enemy's spikes do); any other time in the show, a bounce off him.
 */
export function lokiStomped(s: Loki, step: number, him: Body, prevBottom: number): { top: number; hit: boolean } | null {
  if (him.vy < 0 || s.phase === "asleep" || s.hits >= 3 || s.phase === "gone" || bodyHurts(s)) return null;
  const b = lokiBox(s);
  const feet = him.y + PLAYER.h;
  if (him.x + PLAYER.w <= b.x || him.x >= b.x + b.w || prevBottom > b.y + 2 || feet < b.y) return null;
  if (s.phase !== "pose") return { top: b.y, hit: false };
  s.hits++;
  s.wave = null;
  to(s, "reel", step);
  return { top: b.y, hit: true };
}

/** His body hurts to touch: strutting at him, the club raised, sliding (moving, both). */
const bodyHurts = (s: Loki) => (s.phase === "strut" && s.moved) || s.phase === "club" || (s.phase === "charge" && s.moved);
const touches = (him: Body, r: { x: number; y: number; w: number; h: number }) => him.x < r.x + r.w && him.x + PLAYER.w > r.x && him.y < r.y + r.h && him.y + PLAYER.h > r.y;

/** What hurts him this step, and from where; it notes which attack it was, for the hint. */
export function lokiHurts(s: Loki, step: number, him: Body): { fromX: number; from?: "above" | "below" } | null {
  if (bodyHurts(s) && touches(him, lokiBox(s))) {
    s.hurtBy = s.phase === "charge" ? "charge" : "club";
    return { fromX: s.x };
  }
  const club = lokiClub(s, step);
  if (club && touches(him, club)) {
    s.hurtBy = "club";
    return { fromX: s.x, from: "above" };
  }
  for (const f of lokiWave(s, step))
    if (touches(him, f)) {
      s.hurtBy = "club";
      return { fromX: f.x + f.w / 2, from: "below" };
    }
  const jaws = lokiJaws(s, step);
  if (jaws && s.ring && touches(him, jaws)) {
    s.hurtBy = "bite";
    return { fromX: s.ring.x, from: "below" };
  }
  return null;
}

/** Run into his raised shield: back a tile. Strutting at him, he tells there and then; sliding, he skids to a stop and poses. */
function shoveLoki(s: Loki, step: number, dir: 1 | -1) {
  s.x = clampX(s, s.x + dir * TILE);
  s.hurtBy = null;
  if (s.phase === "strut") {
    s.target = s.x;
    s.stale = LOKI_STEPS.strut;
  } else if (s.phase === "charge") {
    s.target = s.x;
    to(s, "pose", step);
  }
}

/** He lost a life (or left the stage): back to his mark at the back of the stage, the hits taken kept. */
export function resetLoki(s: Loki, step: number) {
  if (s.hits >= 3) return;
  Object.assign(s, { x: s.def.home, dir: -1, phase: "asleep", since: step, round: 0, wave: null, ring: null, hurtBy: null, said: false, moved: false, stale: 0 });
}

/** Loki's rules for the encore's boss slot. */
export function lokiBoss(def: LokiDef): Boss<Loki> {
  return {
    create: () => createLoki(def),
    step: stepLoki,
    stomped: lokiStomped,
    hurts: lokiHurts,
    shoved: shoveLoki,
    reset: resetLoki,
    awake: lokiAwake,
    top: (s) => ({ x: s.x, y: s.def.floor - LOKI.h - 8, w: 26 }),
    beaten: (s) => s.hits >= 3,
    ends: (s) => s.phase === "gone"
  };
}
