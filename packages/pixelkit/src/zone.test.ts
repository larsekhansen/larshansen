import { describe, expect, test } from "bun:test";
import { JUMP, MOVE, PLAYER, TILE } from "./config";
import { createBody, stepBody, type Body, type Intent, type World } from "./physics";
import { inZone, zoneLive, zonePush, type Zone } from "./zone";

// A flat floor at row 10, and zones where each test puts them.
const FLOOR = 10 * TILE;
const world: World = { width: 60 * TILE, isSolid: (_c, r) => r >= 10, isOneWay: () => false, rampAt: () => null };
const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const right: Intent = { ...idle, right: true };
const left: Intent = { ...idle, left: true };
const feet = (b: Body) => b.y + PLAYER.h;

/** Steps `n` times in the zones, and returns the highest the feet got. */
function run(b: Body, n: number, intent: (i: number) => Intent, zones: Zone[]) {
  let top = feet(b);
  for (let i = 0; i < n; i++) {
    stepBody(b, intent(i), world, undefined, { push: zonePush(zones, b) });
    top = Math.min(top, feet(b));
  }
  return top;
}

/** A waterfall over the floor at columns 10 and 11, pushing down. */
const FALL: Zone = { x: 10 * TILE, y: 0, w: 2 * TILE, h: FLOOR, push: { x: 0, y: 0.6 } };
/** A current over columns 20 to 29, pushing right. */
const CURRENT: Zone = { x: 20 * TILE, y: FLOOR - 2 * TILE, w: 10 * TILE, h: 2 * TILE, push: { x: 0.6, y: 0 } };

describe("zones", () => {
  test("a body is in a zone when any of it is inside; the pushes of zones it is in add up", () => {
    expect(inZone(FALL, { x: 10 * TILE - PLAYER.w + 1, y: 100 })).toBe(true);
    expect(inZone(FALL, { x: 10 * TILE - PLAYER.w, y: 100 })).toBe(false);
    expect(zonePush([FALL, CURRENT], { x: 0, y: 100 })).toBeNull();
    expect(zonePush(undefined, { x: 0, y: 100 })).toBeNull();
    const both = { ...CURRENT, x: 10 * TILE, push: { x: -0.25, y: 0.1 } };
    const p = zonePush([FALL, both], { x: 10 * TILE + 3, y: FLOOR - PLAYER.h })!;
    expect(p.x).toBeCloseTo(-0.25, 9);
    expect(p.y).toBeCloseTo(0.7, 9);
  });

  test("out of every zone nothing changes", () => {
    const a = createBody(3 * TILE, FLOOR);
    const b = createBody(3 * TILE, FLOOR);
    for (let i = 0; i < 60; i++) {
      const intent = { ...idle, right: i < 30, jumpPressed: i === 2, jumpHeld: i < 40 };
      stepBody(a, intent, world);
      stepBody(b, intent, world, undefined, { push: zonePush([FALL, CURRENT], b) });
    }
    expect(b).toEqual(a);
  });

  test("under a waterfall a jump barely leaves the ground; beside it, it is a full jump", () => {
    const jump = (i: number) => ({ ...idle, jumpPressed: i === 0, jumpHeld: i < 40 });
    const free = createBody(5 * TILE, FLOOR);
    expect(FLOOR - run(free, 80, jump, [FALL])).toBeGreaterThan(44);
    const under = createBody(11 * TILE, FLOOR);
    expect(FLOOR - run(under, 80, jump, [FALL])).toBeLessThan(20);
    expect(feet(under)).toBe(FLOOR);
  });

  test("a waterfall makes him fall faster, but never faster than the body falls", () => {
    const b = createBody(11 * TILE, 2 * TILE);
    b.onGround = false;
    let fastest = 0;
    let steps = 0;
    for (; steps < 200 && !b.onGround; steps++) {
      stepBody(b, idle, world, undefined, { push: zonePush([FALL], b) });
      fastest = Math.max(fastest, b.vy);
    }
    const plain = createBody(5 * TILE, 2 * TILE);
    plain.onGround = false;
    let plainSteps = 0;
    for (; plainSteps < 200 && !plain.onGround; plainSteps++) stepBody(plain, idle, world);
    expect(steps).toBeLessThan(plainSteps);
    expect(fastest).toBeLessThanOrEqual(JUMP.maxFall);
  });

  test("a current carries him along: faster with it, slower against it, and along when he stands still", () => {
    const start = () => createBody(22 * TILE, FLOOR);
    const still = start();
    run(still, 30, () => idle, [CURRENT]);
    expect(still.x - (22 * TILE - PLAYER.w / 2)).toBeCloseTo(30 * 0.6, 5);
    const withIt = start();
    run(withIt, 30, () => right, [CURRENT]);
    const against = start();
    run(against, 30, () => left, [CURRENT]);
    const plainRight = createBody(22 * TILE, FLOOR);
    for (let i = 0; i < 30; i++) stepBody(plainRight, right, world);
    expect(withIt.x).toBeGreaterThan(plainRight.x);
    expect(22 * TILE - against.x).toBeLessThan(30 * MOVE.run);
    // His own speed is his: the current does not add to it.
    expect(withIt.vx).toBeCloseTo(MOVE.run, 9);
  });

  test("a current pushes him against a wall, not through it", () => {
    const walled: World = { ...world, isSolid: (c, r) => r >= 10 || (c === 25 && r === 9) };
    const b = createBody(23 * TILE, FLOOR);
    for (let i = 0; i < 200; i++) stepBody(b, idle, walled, undefined, { push: zonePush([CURRENT], b) });
    expect(b.x + PLAYER.w).toBeLessThanOrEqual(25 * TILE);
    expect(b.x + PLAYER.w).toBeGreaterThan(25 * TILE - 1);
  });
});

describe("zones on a beat: a gust of wind", () => {
  /** Wind over columns 30 to 39, pushing right, live for a second and a half after a one-second warning. */
  const GUST: Zone = { x: 30 * TILE, y: 0, w: 10 * TILE, h: FLOOR, push: { x: 0.5, y: 0 }, beat: { rest: 120, warn: 60, live: 90 } };

  test("it only pushes while live; at rest and while it warns it does nothing", () => {
    const b = { x: 32 * TILE, y: FLOOR - PLAYER.h };
    expect(zonePush([GUST], b, 10)).toBeNull();
    expect(zonePush([GUST], b, 150)).toBeNull();
    expect(zonePush([GUST], b, 200)).toEqual({ x: 0.5, y: 0 });
    expect(zoneLive(GUST, 269)).toBe(true);
    expect(zoneLive(GUST, 270)).toBe(false);
    // Without a step (a search over every moment at once) it counts as live; a zone with no beat always is.
    expect(zoneLive(GUST)).toBe(true);
    expect(zoneLive(CURRENT, 5)).toBe(true);
  });

  test("a jump through it at rest goes as far as anywhere; live, the gust carries him on", () => {
    const jumpAt = (from: number) => {
      const b = createBody(31 * TILE, FLOOR);
      for (let i = 0; i < 60; i++) stepBody(b, { ...right, jumpPressed: i === 0, jumpHeld: i < 40 }, world, undefined, { push: zonePush([GUST], b, from + i) });
      return b.x;
    };
    const calm = jumpAt(0);
    const plain = createBody(31 * TILE, FLOOR);
    for (let i = 0; i < 60; i++) stepBody(plain, { ...right, jumpPressed: i === 0, jumpHeld: i < 40 }, world);
    expect(calm).toBe(plain.x);
    expect(jumpAt(180) - calm).toBeGreaterThan(20);
  });
});
