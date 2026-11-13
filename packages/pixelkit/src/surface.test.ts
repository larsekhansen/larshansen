import { describe, expect, test } from "bun:test";
import { DASH, MOVE, PLAYER, TILE } from "./config";
import { createBody, dashStep, stepBody, type Body, type Intent, type World } from "./physics";
import { ICE, SLIDE, surfaceSpeed, type Surface } from "./surface";

// A flat floor at row 10, a wall (a rail) at column 30, and a stretch of surface where the scene says.
const FLOOR = 10 * TILE;
const world: World = { width: 60 * TILE, isSolid: (c, r) => r >= 10 || (c === 30 && r === 9), isOneWay: () => false, rampAt: () => null };
const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const right: Intent = { ...idle, right: true };
const left: Intent = { ...idle, left: true };
const feet = (b: Body) => b.y + PLAYER.h;
const on = (s: Surface | null) => ({ surfaceAt: () => s });

/** Steps `n` times and returns how far he went. */
function go(b: Body, n: number, intent: (i: number) => Intent, s: Surface | null) {
  const x0 = b.x;
  for (let i = 0; i < n; i++) stepBody(b, intent(i), world, undefined, on(s));
  return b.x - x0;
}

describe("plain ground", () => {
  test("a surface of null, or none given, changes nothing", () => {
    const a = createBody(5 * TILE, FLOOR);
    const b = createBody(5 * TILE, FLOOR);
    for (let i = 0; i < 80; i++) {
      const intent = i < 50 ? right : idle;
      stepBody(a, intent, world);
      stepBody(b, intent, world, undefined, on(null));
    }
    expect(b).toEqual(a);
  });

  test("firm ground as a surface (grip 1) is the same as plain ground", () => {
    for (const [vx, dir] of [[0, 1], [1.6, 0], [1.6, -1], [-0.5, 1]] as const) {
      const plain = vx < dir * MOVE.run ? Math.min(dir * MOVE.run, vx + (dir ? MOVE.accel : MOVE.decel)) : Math.max(dir * MOVE.run, vx - (dir ? MOVE.accel : MOVE.decel));
      expect(surfaceSpeed(vx, dir, { grip: 1 })).toBeCloseTo(plain, 9);
    }
  });
});

describe("ice", () => {
  test("he is slow to get going", () => {
    const b = createBody(5 * TILE, FLOOR);
    go(b, 20, () => right, ICE);
    expect(b.vx).toBeLessThan(MOVE.run / 2);
    go(b, 60, () => right, ICE);
    expect(b.vx).toBeCloseTo(MOVE.run, 5);
  });

  test("let go at a run, he slides on for more than a tile; on plain ground he stops at once", () => {
    const ice = createBody(5 * TILE, FLOOR);
    const plain = createBody(5 * TILE, FLOOR);
    ice.vx = plain.vx = MOVE.run;
    expect(go(ice, 120, () => idle, ICE)).toBeGreaterThan(TILE * 1.5);
    expect(go(plain, 120, () => idle, null)).toBeLessThan(6);
    expect(ice.vx).toBe(0);
  });

  test("a rail (a solid post) stops a slide", () => {
    const b = createBody(28 * TILE, FLOOR);
    b.vx = MOVE.run;
    go(b, 200, () => idle, ICE);
    expect(b.x + PLAYER.w).toBe(30 * TILE);
    expect(b.vx).toBe(0);
  });

  test("turning round on ice takes a while", () => {
    const b = createBody(10 * TILE, FLOOR);
    b.vx = MOVE.run;
    go(b, 30, () => left, ICE);
    expect(b.vx).toBeGreaterThan(0);
  });

  test("in the air ice does nothing: the jump is the jump", () => {
    const a = createBody(5 * TILE, FLOOR);
    const b = createBody(5 * TILE, FLOOR);
    a.vx = b.vx = MOVE.run;
    let topA = FLOOR;
    let topB = FLOOR;
    for (let i = 0; i < 40; i++) {
      const intent = { ...right, jumpHeld: true, jumpPressed: i === 0 };
      stepBody(a, intent, world);
      stepBody(b, intent, world, undefined, on(ICE));
      topA = Math.min(topA, feet(a));
      topB = Math.min(topB, feet(b));
    }
    expect(topB).toBe(topA);
  });
});

describe("an inrun: no grip, a pull, and a cap above the run", () => {
  const INRUN: Surface = { grip: 0, belt: 4.5, cap: 3.8 };
  const long: World = { ...world, width: 400 * TILE, isSolid: (_c, r) => r >= 10 };

  test("his keys do nothing on it", () => {
    for (const dir of [-1, 0, 1]) expect(surfaceSpeed(2, dir, INRUN)).toBeCloseTo(2 + SLIDE.pull, 9);
  });

  test("his speed climbs past the run to the cap, and no further", () => {
    const b = createBody(2 * TILE, FLOOR);
    b.vx = MOVE.run;
    for (let i = 0; i < 30; i++) stepBody(b, left, long, undefined, on(INRUN));
    expect(b.vx).toBeGreaterThan(MOVE.run);
    for (let i = 0; i < 200; i++) stepBody(b, left, long, undefined, on(INRUN));
    expect(b.vx).toBeCloseTo(3.8, 9);
  });

  test("off its end faster than a run, the speed is kept in the air, as after a throw", () => {
    // Ground only up to column 12 here: past it, open air down to row 20.
    const edge: World = { ...world, isSolid: (c, r) => r >= 20 || (r >= 10 && c < 12) };
    const b = createBody(10 * TILE, FLOOR);
    b.vx = 3.8;
    // The inrun runs to the edge and as far past it as he can stand: half his width.
    const surf = { surfaceAt: (x: number) => (x < 12 * TILE + PLAYER.w / 2 ? INRUN : null) };
    let air = 0;
    for (let i = 0; i < 40 && air < 20; i++) {
      stepBody(b, idle, edge, undefined, surf);
      if (!b.onGround) air++;
    }
    expect(b.launched).toBe(true);
    expect(b.vx).toBeCloseTo(3.8, 9);
  });

  test("walking off ice at a run is a plain fall, not a throw", () => {
    const edge: World = { ...world, isSolid: (c, r) => r >= 20 || (r >= 10 && c < 12) };
    const b = createBody(11 * TILE, FLOOR);
    b.vx = MOVE.run;
    for (let i = 0; i < 20; i++) stepBody(b, right, edge, undefined, { surfaceAt: () => ICE });
    expect(b.onGround).toBe(false);
    expect(b.launched ?? false).toBe(false);
  });
});

describe("a belt", () => {
  test("standing still he goes with it; walking with it he goes faster; against it, slower", () => {
    const BELT: Surface = { grip: 1, belt: 0.8 };
    const still = createBody(5 * TILE, FLOOR);
    const withIt = createBody(5 * TILE, FLOOR);
    const against = createBody(25 * TILE, FLOOR);
    const a = go(still, 60, () => idle, BELT);
    const b = go(withIt, 60, () => right, BELT);
    const c = go(against, 60, () => left, BELT);
    expect(a).toBeGreaterThan(40);
    expect(b).toBeGreaterThan(a + 80);
    expect(c).toBeLessThan(0);
    expect(-c).toBeLessThan(b - a);
  });
});

describe("the dash", () => {
  test("three tiles in ten steps, level, and gravity after", () => {
    const b = createBody(5 * TILE, FLOOR - 40);
    b.onGround = false;
    const y0 = b.y;
    const x0 = b.x;
    for (let i = 0; i < DASH.steps; i++) dashStep(b, 1, DASH.speed, world);
    expect(b.x - x0).toBeCloseTo(3 * TILE, 5);
    expect(b.y).toBe(y0);
    stepBody(b, idle, world);
    expect(b.y).toBeGreaterThan(y0);
  });

  test("a wall stops it", () => {
    const b = createBody(28 * TILE, FLOOR);
    let stopped = false;
    for (let i = 0; i < DASH.steps; i++) if (!dashStep(b, 1, DASH.speed, world)) stopped = true;
    expect(stopped).toBe(true);
    expect(b.x + PLAYER.w).toBe(30 * TILE);
  });

  test("up a slope it rises onto the slope instead of going into it", () => {
    const slope: World = { ...world, isSolid: (_c, r) => r >= 10, rampAt: (x) => (x > 8 * TILE ? FLOOR - (x - 8 * TILE) * 0.5 : null) };
    const b = createBody(7 * TILE, FLOOR);
    for (let i = 0; i < DASH.steps; i++) dashStep(b, 1, DASH.speed, slope);
    expect(feet(b)).toBeCloseTo(slope.rampAt(b.x + PLAYER.w / 2)!, 5);
  });
});
