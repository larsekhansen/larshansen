import { PLAYER } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Boss } from "../levels/types";

// The snow plough in Nabolaget: the last boss, the last thing between him and home, as a small pure
// rule over the step count, in the troll's shape. It comes with its level (play.ts runs it through
// the level's boss slot), so the page does not carry it until Nabolaget is fetched.
//
// It stands parked in the street until he comes along, then its beacon comes on and it wakes. It
// drives at him; when it has him in front of it, or it has come to the end of its stretch with him
// beyond, its beacon flashes and it revs for a full second (the telegraph), then charges to the end
// of its stretch and slams into the bank there. Its cab is too high to jump onto from the street.
//   Round one: it sticks in the bank by the clothesline. A bounce on the line, and down on its roof.
//   Round two: the line is down, and it sticks further along. A jump and the dash from the roof of
//   the house beside the street.
//   Round three: it has learnt; it turns at once, and keeps to the middle of the street, out of reach
//   of both. The tram's roof passes over it: ride it, and step off onto the cab.
// Each landing on its roof is a hit; it reels, then backs off to the far end and comes again. Three
// hits and it parks for good, its beacon out. Touching it hurts, as any enemy does; a lost life sends
// it back to where it was parked, the hits it has taken kept.

export interface PloughDef {
  /** The street (world y), and where it waits parked (its centre x). */
  floor: number;
  x: number;
  /** How far along he comes before it wakes. */
  wakeAt: number;
  /** For each round: the stretch its centre keeps to, and whether a charge ends stuck in the bank (or with a turn). */
  rounds: { x0: number; x1: number; sticks: boolean }[];
  /** The clothesline by the bank: across from x0 to x1, its top at y; it throws him up at `speed` while it holds (the first round). */
  line: { x0: number; x1: number; y: number; speed: number };
}

export type PloughPhase = "parked" | "waking" | "drive" | "windup" | "charge" | "stuck" | "turn" | "hit" | "retreat" | "beaten";

export interface Plough {
  def: PloughDef;
  /** Its centre; it stands on the street. */
  x: number;
  dir: 1 | -1;
  phase: PloughPhase;
  since: number;
  hits: number;
  /** The step the clothesline last threw him, for the drawing. */
  lineAt: number;
}

/** Its size: four tiles long, its cab's roof well over a jump from the street. */
export const PLOUGH = { w: 64, h: 52 };
/** Steps to wake, to telegraph a charge (a full second), stuck in the bank, to turn, to reel from a hit. */
export const PLOUGH_STEPS = { waking: 90, windup: 60, stuck: 170, turn: 36, hit: 70 };
/** How fast it drives (faster each round), charges, and backs off. */
export const PLOUGH_SPEED = { drive: [1.2, 1.35, 1.5], charge: 2.8, retreat: 2.2 };
/** It telegraphs a charge when he is this close in front of it. */
export const PLOUGH_REACH = PLOUGH.w / 2 + 28;

export function createPlough(def: PloughDef): Plough {
  return { def, x: def.x, dir: -1, phase: "parked", since: 0, hits: 0, lineAt: -999 };
}

const to = (p: Plough, phase: PloughPhase, step: number) => {
  p.phase = phase;
  p.since = step;
};
const round = (p: Plough) => p.def.rounds[Math.min(p.hits, p.def.rounds.length - 1)];
/** The clothesline holds until the first hit: its pole goes down under the blade. */
export const lineHolds = (p: Plough) => p.hits === 0;
/** Its body (and its roof, the top of the box). */
export const ploughBox = (p: Plough) => ({ x: p.x - PLOUGH.w / 2, y: p.def.floor - PLOUGH.h, w: PLOUGH.w, h: PLOUGH.h });
/** True while it is a danger: awake and not beaten. */
const awake = (p: Plough) => p.phase !== "parked" && p.phase !== "beaten";

/** One step. `him` is where he is. What it did, for the sound and the words. */
export function stepPlough(p: Plough, step: number, him: Body): string | null {
  const hx = him.x + PLAYER.w / 2;
  const age = step - p.since;
  const r = round(p);
  switch (p.phase) {
    case "beaten":
      return null;
    case "parked":
      if (hx >= p.def.wakeAt && hx < p.x) {
        to(p, "waking", step);
        p.dir = -1;
        return "wake";
      }
      return null;
    case "waking":
      if (age >= PLOUGH_STEPS.waking) to(p, "drive", step);
      return null;
    case "drive": {
      const target = Math.max(r.x0, Math.min(r.x1, hx));
      if (Math.abs(target - p.x) > 2) p.dir = target < p.x ? -1 : 1;
      const atEnd = (p.dir < 0 && p.x <= r.x0 + 0.5) || (p.dir > 0 && p.x >= r.x1 - 0.5);
      const inFront = Math.sign(hx - p.x) === p.dir && Math.abs(hx - p.x) <= PLOUGH_REACH;
      if (inFront || (atEnd && Math.sign(hx - p.x) === p.dir)) {
        to(p, "windup", step);
        return "windup";
      }
      const v = PLOUGH_SPEED.drive[Math.min(p.hits, PLOUGH_SPEED.drive.length - 1)];
      p.x = Math.abs(target - p.x) <= v ? target : p.x + p.dir * v;
      return null;
    }
    case "windup":
      // It backs up a little as it revs, then goes.
      if (age < 20) p.x = Math.max(r.x0, Math.min(r.x1, p.x - p.dir * 0.4));
      if (age >= PLOUGH_STEPS.windup) {
        to(p, "charge", step);
        return "charge";
      }
      return null;
    case "charge": {
      const end = p.dir < 0 ? r.x0 : r.x1;
      p.x = p.dir < 0 ? Math.max(end, p.x - PLOUGH_SPEED.charge) : Math.min(end, p.x + PLOUGH_SPEED.charge);
      if (p.x === end) {
        to(p, r.sticks ? "stuck" : "turn", step);
        return "slam";
      }
      return null;
    }
    case "stuck":
      if (age >= PLOUGH_STEPS.stuck) to(p, "drive", step);
      return null;
    case "turn":
      if (age >= PLOUGH_STEPS.turn) {
        p.dir = (p.dir * -1) as 1 | -1;
        to(p, "drive", step);
      }
      return null;
    case "hit":
      if (age >= PLOUGH_STEPS.hit) {
        if (p.hits >= p.def.rounds.length) {
          to(p, "beaten", step);
          return "beaten";
        }
        p.dir = 1;
        to(p, "retreat", step);
      }
      return null;
    case "retreat": {
      const home = round(p).x1;
      p.x = Math.min(home, p.x + PLOUGH_SPEED.retreat);
      if (p.x >= home) {
        p.dir = -1;
        to(p, "drive", step);
      }
      return null;
    }
  }
}

/** Did he come down on it, or on the clothesline, this step? Where its top is, and whether that was a hit. */
export function ploughStomped(p: Plough, step: number, him: Body, prevBottom: number): { top: number; hit: boolean; speed?: number; event?: string } | null {
  if (him.vy < 0) return null;
  const feet = him.y + PLAYER.h;
  const over = (x0: number, x1: number) => him.x + PLAYER.w > x0 && him.x < x1;
  const l = p.def.line;
  if (lineHolds(p) && over(l.x0, l.x1) && prevBottom <= l.y + 2 && feet >= l.y) {
    p.lineAt = step;
    return { top: l.y, hit: false, speed: l.speed, event: "line" };
  }
  if (!awake(p)) return null;
  const box = ploughBox(p);
  if (!over(box.x, box.x + box.w) || prevBottom > box.y + 2 || feet < box.y) return null;
  if (p.phase === "hit") return { top: box.y, hit: false };
  p.hits++;
  to(p, "hit", step);
  return { top: box.y, hit: true };
}

/** Its body hurts to touch while it is awake. */
export function ploughHurts(p: Plough, him: Body): { fromX: number } | null {
  if (!awake(p)) return null;
  const b = ploughBox(p);
  return him.x < b.x + b.w && him.x + PLAYER.w > b.x && him.y < b.y + b.h && him.y + PLAYER.h > b.y ? { fromX: p.x } : null;
}

/** He lost a life: back to where it was parked, asleep, the hits it has taken kept. */
export function resetPlough(p: Plough, step: number) {
  if (p.phase === "beaten") return;
  Object.assign(p, { x: p.def.x, dir: -1, phase: "parked", since: step });
}

/** The plough's rules for the level's boss slot. */
export function ploughBoss(def: PloughDef): Boss<Plough> {
  return {
    create: () => createPlough(def),
    step: stepPlough,
    stomped: ploughStomped,
    hurts: (p, _t, him) => ploughHurts(p, him),
    reset: resetPlough,
    beaten: (p) => p.phase === "beaten"
  };
}
