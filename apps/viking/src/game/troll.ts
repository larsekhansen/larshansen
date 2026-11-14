import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";

// The troll of Nordmarka: the boss at the end of level 7, as a small pure rule over the step count.
//
// It sleeps in its clearing, looking like a boulder, until he comes in. Then it wakes (a long, loud
// second and a half), walks at him, and when it is close it raises its club for a full second before
// it slams it down: the ground shakes in a wave both ways, which he jumps. The club sticks in the
// ground for a while. A troll cannot stand light: if it is stuck where the dawn comes through the
// trees, and he looks at it with his headlamp, it is hit, a third of it turns to stone, and it backs
// off to the far end of the clearing. The sun climbs, the dawn moves on through the trees, and it
// comes again. Three hits, and it is a boulder for good; the rune shows on it.
//
// Touching it hurts, as any enemy does. Losing a life sends it back to sleep where it started; the
// stone it has already turned to stays.

export interface TrollDef {
  /** The floor of the clearing (world y), and the ends it walks between (world x). */
  floor: number;
  x0: number;
  x1: number;
  /** Where it sleeps (its centre x), and how far into the clearing he comes before it wakes. */
  x: number;
  wakeAt: number;
  /** Where the dawn falls on the floor for each of the three hits, from x to x. */
  dawn: [number, number][];
}

export type TrollPhase = "asleep" | "waking" | "walk" | "windup" | "stuck" | "hit" | "retreat" | "stone";

export interface Troll {
  def: TrollDef;
  /** Its centre x; it stands on the floor. */
  x: number;
  dir: 1 | -1;
  phase: TrollPhase;
  /** The step the phase began. */
  since: number;
  /** How many times the dawn has hit it: 3 and it is stone. */
  hits: number;
  /** The wave from the last slam: where it started and when; its two fronts run out from there. */
  wave: { x: number; at: number } | null;
}

/** Its size: two tiles wide, two and a half tall, three times his height. */
export const TROLL = { w: 30, h: 40 };
/** Steps it takes to wake, to raise its club (the telegraph before every slam: a full second), to pull the club out, to flinch in the light. */
export const TROLL_STEPS = { waking: 90, windup: 60, stuck: 120, hit: 80 };
/** How fast it walks, faster each time it is hit; how fast it backs off from the light. */
export const TROLL_SPEED = { walk: [0.8, 0.95, 1.1], retreat: 1.5 };
/** It raises the club when he is this close (centre to centre) and on the floor. */
export const TROLL_REACH = TROLL.w / 2 + 22;
/** The club, in front of it when it comes down, and how long the blow hurts. */
export const CLUB = { reach: 24, h: 16, hurts: 10 };
/** The wave in the ground: how fast each front runs, how far, how high it is. */
export const WAVE = { speed: 1.4, steps: 70, h: 7, w: 6 };
/** How far his headlamp reaches along the floor. */
export const LAMP_REACH = 6 * TILE;

export function createTroll(def: TrollDef): Troll {
  return { def, x: def.x, dir: -1, phase: "asleep", since: 0, hits: 0, wave: null };
}

/** Back to sleep where it started (he lost a life), keeping the stone it has turned to. */
export function resetTroll(t: Troll, step: number) {
  if (t.phase === "stone") return;
  Object.assign(t, { x: t.def.x, dir: -1, phase: "asleep", since: step, wave: null });
}

const to = (t: Troll, phase: TrollPhase, step: number) => {
  t.phase = phase;
  t.since = step;
};

/** Its body, the box that hurts (and, once it is stone, what he stands on). */
export const trollBox = (t: Troll) => ({ x: t.x - TROLL.w / 2, y: t.def.floor - TROLL.h, w: TROLL.w, h: TROLL.h });

/** The club's box while the blow hurts, or null. */
export function clubBox(t: Troll, step: number) {
  if (t.phase !== "stuck" || step - t.since > CLUB.hurts) return null;
  const x = t.dir > 0 ? t.x + TROLL.w / 2 : t.x - TROLL.w / 2 - CLUB.reach;
  return { x, y: t.def.floor - CLUB.h, w: CLUB.reach, h: CLUB.h };
}

/** The two fronts of the wave at a step, as boxes on the floor; stopped by the ends of the clearing. */
export function waveFronts(t: Troll, step: number): { x: number; y: number; w: number; h: number }[] {
  if (!t.wave) return [];
  const age = step - t.wave.at;
  if (age < 0 || age > WAVE.steps) return [];
  const out = [];
  for (const way of [-1, 1]) {
    const x = t.wave.x + way * age * WAVE.speed;
    if (x < t.def.x0 || x > t.def.x1) continue;
    out.push({ x: x - WAVE.w / 2, y: t.def.floor - WAVE.h, w: WAVE.w, h: WAVE.h });
  }
  return out;
}

/** Where the dawn comes through for the next hit, or null once it is stone. */
export const dawnNow = (t: Troll): [number, number] | null => (t.hits < t.def.dawn.length ? t.def.dawn[t.hits] : null);

/** True when the troll stands in the dawn: its middle in the light. */
export function inDawn(t: Troll): boolean {
  const d = dawnNow(t);
  return !!d && t.x >= d[0] && t.x <= d[1];
}

/** True when his headlamp is on it: he is down on the clearing's floor, close, and looking its way. */
export function lampOn(t: Troll, him: Body): boolean {
  const hx = him.x + PLAYER.w / 2;
  const feet = him.y + PLAYER.h;
  return Math.abs(feet - t.def.floor) < 1.5 * TILE && Math.abs(t.x - hx) <= LAMP_REACH && Math.sign(t.x - hx) === him.facing;
}

export type TrollEvent = "wake" | "windup" | "slam" | "hit" | "stone" | null;

/** One step of the troll. `him` is where he is. Returns what happened, for the sound and the shake. */
export function stepTroll(t: Troll, step: number, him: Body): TrollEvent {
  const d = t.def;
  const hx = him.x + PLAYER.w / 2;
  const onFloor = Math.abs(him.y + PLAYER.h - d.floor) < TILE;
  const age = step - t.since;
  const clamp = (x: number) => Math.max(d.x0 + TROLL.w / 2, Math.min(d.x1 - TROLL.w / 2, x));
  if (t.wave && step - t.wave.at > WAVE.steps) t.wave = null;
  switch (t.phase) {
    case "stone":
      return null;
    case "asleep":
      if (hx >= d.wakeAt && hx <= d.x1) {
        to(t, "waking", step);
        t.dir = hx < t.x ? -1 : 1;
        return "wake";
      }
      return null;
    case "waking":
      if (age >= TROLL_STEPS.waking) to(t, "walk", step);
      return null;
    case "walk": {
      const dx = hx - t.x;
      if (Math.abs(dx) > 2) t.dir = dx < 0 ? -1 : 1;
      if (onFloor && Math.abs(dx) <= TROLL_REACH) {
        to(t, "windup", step);
        return "windup";
      }
      // He is up out of reach: it waits under him.
      if (Math.abs(dx) > 4) t.x = clamp(t.x + t.dir * TROLL_SPEED.walk[Math.min(t.hits, TROLL_SPEED.walk.length - 1)]);
      return null;
    }
    case "windup":
      if (age >= TROLL_STEPS.windup) {
        to(t, "stuck", step);
        t.wave = { x: t.x + t.dir * (TROLL.w / 2 + CLUB.reach - 4), at: step };
        return "slam";
      }
      return null;
    case "stuck":
      if (inDawn(t) && lampOn(t, him)) {
        t.hits++;
        to(t, "hit", step);
        return "hit";
      }
      if (age >= TROLL_STEPS.stuck) to(t, "walk", step);
      return null;
    case "hit":
      if (age >= TROLL_STEPS.hit) {
        if (t.hits >= d.dawn.length) {
          to(t, "stone", step);
          t.wave = null;
          return "stone";
        }
        // Away from the light, to whichever end of the clearing is further from him.
        t.dir = hx < (d.x0 + d.x1) / 2 ? 1 : -1;
        to(t, "retreat", step);
      }
      return null;
    case "retreat": {
      const end = t.dir > 0 ? d.x1 - TROLL.w / 2 : d.x0 + TROLL.w / 2;
      t.x = t.dir > 0 ? Math.min(end, t.x + TROLL_SPEED.retreat) : Math.max(end, t.x - TROLL_SPEED.retreat);
      if (t.x === end) to(t, "walk", step);
      return null;
    }
  }
}

/** What hurts him this step: its body, the club as it comes down, the wave. Null when nothing does. Stone hurts nobody. */
export function trollHurts(t: Troll, step: number, him: Body): { fromX: number } | null {
  if (t.phase === "stone") return null;
  const over = (r: { x: number; y: number; w: number; h: number }) => him.x < r.x + r.w && him.x + PLAYER.w > r.x && him.y < r.y + r.h && him.y + PLAYER.h > r.y;
  if (t.phase !== "asleep" && over(trollBox(t))) return { fromX: t.x };
  const club = clubBox(t, step);
  if (club && over(club)) return { fromX: t.x };
  for (const f of waveFronts(t, step)) if (over(f)) return { fromX: f.x + f.w / 2 };
  return null;
}
