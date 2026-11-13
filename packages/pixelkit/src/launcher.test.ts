import { describe, expect, test } from "bun:test";
import { JUMP, MOVE, PLAYER, TILE } from "./config";
import { cannon, drum, launcherHit, tryLaunch } from "./launcher";
import { bounce, createBody, launch, stepBody, type Body, type Intent, type World } from "./physics";

const FLOOR = 10 * TILE;
const flat: World = { width: 80 * TILE, isSolid: (_c, r) => r >= 10, isOneWay: () => false, rampAt: () => null };
const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** Steps until he is on the ground again (at most 300); returns the steps and the fastest he went across. */
function flight(b: Body, intent: (i: number) => Intent = () => idle) {
  let fastest = 0;
  for (let i = 0; i < 300; i++) {
    stepBody(b, intent(i), flat);
    fastest = Math.max(fastest, Math.abs(b.vx));
    if (b.onGround) return { steps: i + 1, fastest };
  }
  return { steps: -1, fastest };
}

describe("the constants stay", () => {
  test("run and jump are the front page's", () => {
    expect(MOVE.run).toBe(1.6);
    expect(JUMP.speed).toBe(5);
  });

  test("a body never launched has no launch state at all", () => {
    expect(createBody(0, FLOOR).launched).toBeUndefined();
  });
});

describe("a cannon", () => {
  test("throws him much further than a running jump, faster than a run", () => {
    const fired = createBody(5 * TILE, FLOOR);
    launch(fired, 4, -6);
    const f = flight(fired);
    const jumped = createBody(5 * TILE, FLOOR);
    for (let i = 0; i < 30; i++) stepBody(jumped, { ...idle, right: true }, flat); // up to speed
    const x0 = jumped.x;
    const j = flight(jumped, (i) => ({ ...idle, right: true, jumpHeld: true, jumpPressed: i === 0 }));
    expect(f.fastest).toBeGreaterThan(MOVE.run);
    expect(fired.x - 5 * TILE).toBeGreaterThan(2 * (jumped.x - x0));
    expect(j.steps).toBeGreaterThan(0);
  });

  test("in flight he keeps his speed with no key held", () => {
    const b = createBody(5 * TILE, FLOOR);
    launch(b, 4, -6);
    for (let i = 0; i < 20; i++) stepBody(b, idle, flat);
    expect(b.vx).toBe(4);
  });

  test("the keys only lean on it: against slows it gently, along never speeds it up", () => {
    const back = createBody(5 * TILE, FLOOR);
    launch(back, 4, -6);
    for (let i = 0; i < 10; i++) stepBody(back, { ...idle, left: true }, flat);
    expect(back.vx).toBeCloseTo(3.5, 10);
    const on = createBody(5 * TILE, FLOOR);
    launch(on, 4, -6);
    for (let i = 0; i < 10; i++) stepBody(on, { ...idle, right: true }, flat);
    expect(on.vx).toBe(4);
  });

  test("landing ends it: back to walking as ever", () => {
    const b = createBody(5 * TILE, FLOOR);
    launch(b, 4, -6);
    flight(b);
    expect(b.launched).toBe(false);
    for (let i = 0; i < 40; i++) stepBody(b, idle, flat);
    expect(b.vx).toBe(0);
  });

  test("a wall stops the throw", () => {
    const walled: World = { ...flat, isSolid: (c, r) => r >= 10 || c === 12 };
    const b = createBody(9 * TILE, FLOOR);
    launch(b, 4, -3);
    for (let i = 0; i < 60; i++) stepBody(b, idle, walled);
    expect(b.x + PLAYER.w).toBeLessThanOrEqual(12 * TILE);
  });
});

describe("launchers in the world", () => {
  test("stepping into a cannon's mouth fires it, once: not again while he rises", () => {
    const c = cannon(8 * TILE, FLOOR, 1);
    const b = createBody(8 * TILE + 8, FLOOR);
    expect(launcherHit(c, b)).toBe(true);
    expect(tryLaunch(c, b)).toBe(true);
    expect(b.vx).toBe(4);
    expect(b.vy).toBe(-6);
    expect(tryLaunch(c, b)).toBe(false);
  });

  test("a cannon facing left throws left", () => {
    const b = createBody(8 * TILE + 8, FLOOR);
    tryLaunch(cannon(8 * TILE, FLOOR, -1), b);
    expect(b.vx).toBeLessThan(0);
  });

  test("a drum throws him straight up, like a sheep, higher than a jump", () => {
    const d = drum(8 * TILE, FLOOR);
    const b = createBody(8 * TILE + 8, FLOOR);
    b.y -= 4;
    b.vy = 1;
    expect(tryLaunch(d, b)).toBe(true);
    expect(b.vx).toBe(0);
    expect(b.launched).toBe(false);
    const sheep = createBody(8 * TILE + 8, FLOOR);
    bounce(sheep, 7);
    expect(b.vy).toBe(sheep.vy);
    let top = FLOOR;
    for (let i = 0; i < 80; i++) {
      stepBody(b, idle, flat);
      top = Math.min(top, b.y + PLAYER.h);
    }
    expect(FLOOR - top).toBeGreaterThan(60);
  });

  test("not touching, not fired", () => {
    expect(launcherHit(cannon(8 * TILE, FLOOR, 1), createBody(12 * TILE, FLOOR))).toBe(false);
  });
});

describe("a cannon's mouth", () => {
  test("he leaves from the muzzle, his feet at its height, whichever way it faces", () => {
    for (const dir of [1, -1] as const) {
      const l = cannon(10 * TILE, FLOOR, dir);
      const b = createBody(10 * TILE + 8, FLOOR);
      expect(tryLaunch(l, b)).toBe(true);
      expect(b.x + PLAYER.w / 2).toBe(l.from!.x);
      expect(b.y + PLAYER.h).toBe(l.from!.bottom);
      expect(Math.sign(b.vx)).toBe(dir);
    }
  });
});
