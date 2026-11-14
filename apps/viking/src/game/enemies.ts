import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";
import type { TileMap } from "@larshansen/pixelkit/tilemap";

// The things that are out to get him, as small pure rules over the step count and the map. Each
// kind does one thing; a level says which kind, where, and how far it goes, and how it looks.
// play.ts runs them each step and decides what a touch does (a stomp, or a heart lost).
//
//   walker   patrols a ledge and turns at its edges and at walls. Land on it and it is beaten.
//   spiky    the same, but landing on it hurts. Go round, or over.
//   flyer    flies back and forth on a wave. It can be landed on.
//   thrower  stands still and lobs something at him on a beat, with a wind-up he can see first.
//   jumper   waits under the water or in a pit and leaps out on a beat, after a ripple.

export type EnemyKind = "walker" | "spiky" | "flyer" | "thrower" | "jumper";

export interface EnemyDef {
  kind: EnemyKind;
  /** Which drawing the level gives it: "pigeon", "scooter", "gull", "kid", "hedgehog", "grill"... */
  look: string;
  /** The tile it starts in; it stands on the floor of that tile (a flyer: the middle of its wave). */
  c: number;
  r: number;
  /** How far either side of its start it goes, in tiles. 0 (the default for throwers and jumpers): it stays. */
  range?: number;
  /** Pixels a step along its patrol. */
  speed?: number;
  /** A flyer's rise and fall either side of its line; a jumper's leap; in pixels. */
  rise?: number;
  /** Steps in one round: a flyer's wave, a thrower's throw, a jumper's leap. */
  period?: number;
  /** Steps added to its clock, so neighbours are out of step. */
  offset?: number;
  /** The way it first goes. */
  dir?: 1 | -1;
  /** Its size, when not the kind's own. */
  w?: number;
  h?: number;
}

/** Sizes, speeds and beats by kind, when the level does not say. */
export const KIND: Record<EnemyKind, { w: number; h: number; speed: number; period: number; stomp: boolean }> = {
  walker: { w: 10, h: 8, speed: 0.35, period: 0, stomp: true },
  spiky: { w: 12, h: 8, speed: 0.25, period: 0, stomp: false },
  flyer: { w: 12, h: 7, speed: 0.5, period: 160, stomp: true },
  thrower: { w: 9, h: 13, speed: 0, period: 170, stomp: true },
  jumper: { w: 10, h: 12, speed: 0, period: 200, stomp: true }
};

/** A thrower raises its arm this many steps before it throws: a full second, so he always sees it coming. */
export const WINDUP = 60;
/** A jumper's water ripples this long before it leaps. */
export const RIPPLE = 60;
/** What a thrower lobs falls this much faster each step, and leaves at this speed upwards. */
export const SHOT = { gravity: 0.16, up: 3.2, maxAcross: 2.2, w: 5, h: 5, life: 300 };
/** A thrower only throws while he is this close: well inside the screen, so he always sees who throws. */
export const THROW_REACH = { x: 7 * TILE, y: 6 * TILE };

export interface Enemy {
  def: EnemyDef;
  /** The middle of its patrol, its start. */
  home: number;
  /** Its centre x and the y of its feet (a flyer's: the bottom of its body). */
  x: number;
  y: number;
  /** The y of its feet before this step, for telling a landing from a touch. */
  prevY: number;
  dir: 1 | -1;
  w: number;
  h: number;
  alive: boolean;
  /** The step it was beaten, for the squash and the puff. */
  beatenAt: number | null;
  /** A thrower facing him, and when it last threw. */
  thrownAt: number;
}

/** Something lobbed by a thrower, flying until it hits the ground. */
export interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  /** Which thrower, for the drawing. */
  by: number;
}

export function createEnemies(defs: readonly EnemyDef[], map: TileMap): Enemy[] {
  return defs.map((def) => {
    const k = KIND[def.kind];
    const x = def.c * TILE + TILE / 2;
    const floor = (def.r + 1) * TILE;
    const ramp = map.rampAt(x);
    const y = def.kind !== "flyer" && ramp !== null && Math.abs(ramp - floor) < TILE ? ramp : floor;
    return { def, home: x, x, y, prevY: y, dir: def.dir ?? 1, w: def.w ?? k.w, h: def.h ?? k.h, alive: true, beatenAt: null, thrownAt: -999 };
  });
}

const clock = (e: Enemy, t: number) => t + (e.def.offset ?? 0);
const periodOf = (e: Enemy) => e.def.period ?? KIND[e.def.kind].period;

/** True when there is something to walk on at x, at the height of feet y: a slope near it, or the top of a tile. */
function groundAt(map: TileMap, x: number, y: number): boolean {
  const ramp = map.rampAt(x);
  if (ramp !== null && Math.abs(ramp - y) <= 8) return true;
  const r = Math.round(y / TILE);
  if (Math.abs(y - r * TILE) > 0.5) return false;
  const c = Math.floor(x / TILE);
  return (map.isSolid(c, r) || map.isOneWay(c, r)) && !map.isSolid(c, r - 1);
}

/** A walker's (or a spiky thing's) step: on along the ground, turning at the end of its range, at walls and at edges. */
function walk(e: Enemy, map: TileMap) {
  const speed = e.def.speed ?? KIND[e.def.kind].speed;
  if (speed <= 0) return;
  const range = (e.def.range ?? 0) * TILE;
  const ahead = e.x + e.dir * (e.w / 2 + speed);
  const wall = map.isSolid(Math.floor(ahead / TILE), Math.floor((e.y - 1) / TILE));
  const out = range > 0 && Math.abs(ahead - e.home) > range;
  if (wall || out || !groundAt(map, ahead, e.y)) {
    e.dir = (e.dir * -1) as 1 | -1;
    return;
  }
  e.x += e.dir * speed;
  const ramp = map.rampAt(e.x);
  if (ramp !== null && Math.abs(ramp - e.y) <= 8) e.y = ramp;
}

/** A flyer's step: back and forth across its range, up and down on its wave. */
function fly(e: Enemy, t: number) {
  const speed = e.def.speed ?? KIND.flyer.speed;
  const range = (e.def.range ?? 0) * TILE;
  if (range > 0 && speed > 0) {
    e.x += e.dir * speed;
    if (Math.abs(e.x - e.home) >= range) {
      e.x = e.home + Math.sign(e.x - e.home) * range;
      e.dir = (e.dir * -1) as 1 | -1;
    }
  }
  const base = (e.def.r + 1) * TILE;
  e.y = base + Math.round((e.def.rise ?? 10) * Math.sin((2 * Math.PI * clock(e, t)) / periodOf(e)));
}

/** Where a thrower is in its beat: the steps until it throws (0 on the step it throws). */
export const untilThrow = (e: Enemy, t: number) => {
  const p = periodOf(e);
  return (p - (((clock(e, t) % p) + p) % p)) % p;
};

/** A thrower winds up: true while its arm is raised. */
export const windingUp = (e: Enemy, t: number) => e.alive && untilThrow(e, t) > 0 && untilThrow(e, t) <= WINDUP;

/** How high a jumper is out of its water at a step (0: under), and whether its water ripples. */
export function leap(e: Enemy, t: number): { up: number; ripple: boolean } {
  const p = periodOf(e);
  const rise = e.def.rise ?? 40;
  // The time a body thrown up `rise` pixels by the shot's gravity takes to come back down.
  const air = Math.round(2 * Math.sqrt((2 * rise) / SHOT.gravity));
  const k = ((clock(e, t) % p) + p) % p;
  if (k < air) {
    const s = k / air;
    return { up: Math.round(rise * 4 * s * (1 - s)), ripple: false };
  }
  return { up: 0, ripple: k >= p - RIPPLE };
}

/** The box it hurts or can be landed on in, or null while it cannot be touched (beaten, or a jumper under water). */
export function enemyBox(e: Enemy, t: number): { x: number; y: number; w: number; h: number } | null {
  if (!e.alive) return null;
  if (e.def.kind === "jumper" && leap(e, t).up <= 0) return null;
  return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
}

/** One step of every enemy and every shot in flight. `him` is where he is, for throwers to aim at. Returns the shots thrown this step. */
export function stepEnemies(enemies: Enemy[], shots: Shot[], map: TileMap, t: number, him: Body): number[] {
  const thrown: number[] = [];
  const hx = him.x + PLAYER.w / 2;
  enemies.forEach((e, i) => {
    e.prevY = e.y;
    if (!e.alive) return;
    switch (e.def.kind) {
      case "walker":
      case "spiky":
        walk(e, map);
        break;
      case "flyer":
        fly(e, t);
        break;
      case "thrower": {
        e.dir = hx < e.x ? -1 : 1;
        const near = Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(him.y - e.y) < THROW_REACH.y;
        if (untilThrow(e, t) === 0 && near) {
          // A lob that comes down about where he stands now, never faster across than it can be dodged.
          const air = (2 * SHOT.up) / SHOT.gravity;
          const vx = Math.max(-SHOT.maxAcross, Math.min(SHOT.maxAcross, (hx - e.x) / air));
          shots.push({ x: e.x + e.dir * 3, y: e.y - e.h + 1, vx, vy: -SHOT.up, born: t, by: i });
          e.thrownAt = t;
          thrown.push(i);
        }
        break;
      }
      case "jumper": {
        const base = (e.def.r + 1) * TILE;
        e.y = base - leap(e, t).up;
        break;
      }
    }
  });
  // Shots fly, and stop at the first thing they hit: ground, a ledge from above, or the end of the map.
  for (let k = shots.length - 1; k >= 0; k--) {
    const s = shots[k];
    s.vy += SHOT.gravity;
    s.x += s.vx;
    s.y += s.vy;
    const c = Math.floor(s.x / TILE);
    const r = Math.floor((s.y + SHOT.h / 2) / TILE);
    const ramp = map.rampAt(s.x);
    const hit = map.isSolid(c, r) || (s.vy > 0 && map.isOneWay(c, r) && s.y + SHOT.h / 2 - s.vy <= r * TILE) || (ramp !== null && s.y + SHOT.h / 2 >= ramp) || map.isWater(c, r);
    if (hit || s.y > map.height || s.x < 0 || s.x > map.width || t - s.born > SHOT.life) shots.splice(k, 1);
  }
  return thrown;
}

export const shotBox = (s: Shot) => ({ x: s.x - SHOT.w / 2, y: s.y - SHOT.h / 2, w: SHOT.w, h: SHOT.h });
