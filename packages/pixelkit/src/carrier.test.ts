import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { carrierAt, carrierDrawn, carrierPeriod, carrierShown, carrierState, carriersNear, liftPeriod, pathPeriod, pathSteps, rideShown, type CarrierDef, type Lift, type Orbit, type Path } from "./carrier";
import { createBody, stepBody, type Body, type Intent, type World } from "./physics";

// Open air over a floor far below (row 30), so only the carrier holds him up.
const FLOOR = 30 * TILE;
const world: World = { width: 60 * TILE, isSolid: (_c, r) => r >= 30, isOneWay: () => false, rampAt: () => null };
const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const feet = (b: Body) => b.y + PLAYER.h;

/** Steps the body with one carrier from step `from` for `n` steps; returns the feet and the carrier top after each step. */
function ride(b: Body, d: CarrierDef, from: number, n: number, intent: (i: number) => Intent = () => idle) {
  const out: { feet: number; top: number; onGround: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    const step = from + i;
    stepBody(b, intent(i), world, undefined, { carriers: carriersNear([d], step, b) });
    out.push({ feet: feet(b), top: carrierAt(d, step).y, onGround: b.onGround });
  }
  return out;
}

/** A body standing on the carrier at step `step`, `dx` pixels in from its left end. */
function standOn(d: CarrierDef, step: number, dx = 20) {
  const at = carrierAt(d, step);
  return createBody(at.x + dx, at.y);
}

const lift: Lift = { kind: "lift", x: 10 * TILE, top: 8 * TILE, bottom: 20 * TILE, w: 3 * TILE, speed: 2, wait: 30 };

describe("paths", () => {
  test("a lift waits, rises at its speed, waits, comes down, and starts over", () => {
    expect(carrierAt(lift, 0).y).toBe(lift.bottom);
    expect(carrierAt(lift, 29).y).toBe(lift.bottom);
    expect(carrierAt(lift, 31).y).toBe(lift.bottom - 2);
    expect(carrierAt(lift, 30 + 96).y).toBe(lift.top);
    expect(carrierAt(lift, 30 + 96 + 30 + 10).y).toBe(lift.top + 20);
    expect(carrierAt(lift, liftPeriod(lift)).y).toBe(lift.bottom);
  });

  test("a bob goes up and down by its rise, a travel goes there and back", () => {
    const bob: CarrierDef = { kind: "bob", x: 0, y: 100, w: TILE, rise: 4, period: 120 };
    const ys = Array.from({ length: 120 }, (_, i) => carrierAt(bob, i).y);
    expect(Math.min(...ys)).toBe(96);
    expect(Math.max(...ys)).toBe(104);
    const travel: CarrierDef = { kind: "travel", from: { x: 0, y: 50 }, to: { x: 64, y: 50 }, w: TILE, period: 200 };
    expect(carrierAt(travel, 0)).toEqual({ x: 0, y: 50 });
    expect(carrierAt(travel, 100)).toEqual({ x: 64, y: 50 });
    expect(carrierAt(travel, 200)).toEqual({ x: 0, y: 50 });
  });

  test("positions are whole pixels, and the state says how far it moved this step", () => {
    const travel: CarrierDef = { kind: "travel", from: { x: 3, y: 7 }, to: { x: 101, y: 47 }, w: TILE, period: 157, offset: 9 };
    for (let s = 0; s < 400; s++) {
      const c = carrierState(travel, s);
      expect(Number.isInteger(c.x) && Number.isInteger(c.y)).toBe(true);
      const prev = carrierAt(travel, s - 1);
      expect([c.dx, c.dy]).toEqual([c.x - prev.x, c.y - prev.y]);
    }
  });
});

describe("riding", () => {
  test("a rising lift carries him up with his feet on it every step, without sinking in", () => {
    const b = standOn(lift, 30);
    const steps = ride(b, lift, 31, 96);
    for (const s of steps) {
      expect(s.feet).toBe(s.top);
      expect(s.onGround).toBe(true);
    }
    expect(feet(b)).toBe(lift.top);
  });

  test("a falling lift takes him down with it, never leaving him in the air", () => {
    const from = 30 + 96 + 30; // the top of the shaft, about to come down
    const b = standOn(lift, from - 1);
    const steps = ride(b, lift, from, 97);
    for (const s of steps) {
      expect(s.feet).toBe(s.top);
      expect(s.onGround).toBe(true);
    }
    expect(feet(b)).toBe(lift.bottom);
  });

  test("it carries him sideways, and he can walk on it as it goes", () => {
    const travel: CarrierDef = { kind: "travel", from: { x: 5 * TILE, y: 12 * TILE }, to: { x: 25 * TILE, y: 12 * TILE }, w: 3 * TILE, period: 600 };
    const b = standOn(travel, 0);
    const start = b.x;
    ride(b, travel, 1, 150);
    expect(b.x - start).toBe(carrierAt(travel, 150).x - carrierAt(travel, 0).x);
    expect(feet(b)).toBe(12 * TILE);
  });

  test("walking off the end, he falls", () => {
    const bob: CarrierDef = { kind: "bob", x: 10 * TILE, y: 12 * TILE, w: 2 * TILE, rise: 3, period: 90 };
    const b = standOn(bob, 0, 4);
    const steps = ride(b, bob, 1, 90, () => ({ ...idle, left: true }));
    expect(steps.some((s) => !s.onGround)).toBe(true);
    for (let i = 0; i < 200; i++) stepBody(b, idle, world);
    expect(feet(b)).toBe(FLOOR);
  });

  test("he lands on it from above, and jumps up through it from below", () => {
    const still: CarrierDef = { kind: "bob", x: 10 * TILE, y: 20 * TILE, w: 3 * TILE, rise: 0, period: 60 };
    const above = createBody(10 * TILE + 20, 16 * TILE);
    above.onGround = false;
    const landed = ride(above, still, 0, 60);
    expect(landed[landed.length - 1].feet).toBe(20 * TILE);
    // From the floor right under it, a jump goes up through and comes down on top.
    const below = createBody(10 * TILE + 20, 22 * TILE);
    const world2: World = { ...world, isSolid: (_c, r) => r >= 22 };
    for (let i = 0; i < 70; i++) stepBody(below, { ...idle, jumpHeld: true, jumpPressed: i === 0 }, world2, undefined, { carriers: [{ ...carrierState(still, i) }] });
    expect(feet(below)).toBe(20 * TILE);
  });

  test("a lift rising into him from below catches him; it does not let him fall through", () => {
    // He falls just as the lift rises past his feet in the same step.
    const fast: Lift = { kind: "lift", x: 10 * TILE, top: 8 * TILE, bottom: 20 * TILE, w: 3 * TILE, speed: 6, wait: 0 };
    const b = createBody(10 * TILE + 20, 15 * TILE);
    b.onGround = false;
    const steps = ride(b, fast, 1, 40);
    expect(steps.some((s) => s.onGround && s.feet === s.top)).toBe(true);
    expect(feet(b)).toBeLessThan(16 * TILE);
  });

  test("without carriers, a step is exactly as before", () => {
    const a = createBody(5 * TILE, FLOOR);
    const c = createBody(5 * TILE, FLOOR);
    for (let i = 0; i < 80; i++) {
      const intent = { left: false, right: i < 40, jumpHeld: i < 20, jumpPressed: i === 3 };
      stepBody(a, intent, world);
      stepBody(c, intent, world, undefined, { carriers: [] });
    }
    expect(c).toEqual(a);
  });
});

describe("more paths", () => {
  test("a travel can bob as it goes, in step with its own clock", () => {
    const d: CarrierDef = { kind: "travel", from: { x: 0, y: 100 }, to: { x: 64, y: 100 }, w: TILE, period: 400, bob: { rise: 3, period: 100 } };
    const ys = Array.from({ length: 400 }, (_, t) => carrierAt(d, t).y);
    expect(Math.min(...ys)).toBe(97);
    expect(Math.max(...ys)).toBe(103);
    expect(carrierAt(d, 200).x).toBe(64);
  });
});

describe("drawn with him", () => {
  test("between steps the carrier is drawn on whole pixels, and a rider on its drawn top", () => {
    const d: CarrierDef = { kind: "travel", from: { x: 100, y: 200 }, to: { x: 300, y: 120 }, w: 3 * TILE, period: 300 };
    const b = createBody(carrierAt(d, 0).x + 20, carrierAt(d, 0).y);
    for (let t = 1; t < 120; t++) {
      const before = { x: b.x, y: b.y };
      stepBody(b, idle, world, undefined, { carriers: [carrierState(d, t)] });
      for (const a of [0.25, 0.5, 0.75]) {
        const shown = { x: before.x + (b.x - before.x) * a, y: before.y + (b.y - before.y) * a };
        expect(rideShown([d], t, a, b, shown)).toBe(true);
        const at = carrierDrawn(d, t, a);
        expect(Number.isInteger(at.x) && Number.isInteger(at.y)).toBe(true);
        // His feet are on its drawn top, and he keeps his place on it to the pixel.
        expect(shown.y + PLAYER.h).toBe(at.y);
        expect(shown.x - at.x).toBeCloseTo(b.x - carrierAt(d, t).x, 6);
      }
    }
  });

  test("not riding, he is drawn where he is", () => {
    const d: CarrierDef = { kind: "bob", x: 0, y: 100, w: TILE, rise: 2, period: 60 };
    const b = createBody(500, FLOOR);
    const shown = { x: 1.5, y: 2.5 };
    expect(rideShown([d], 10, 0.5, b, shown)).toBe(false);
    expect(shown).toEqual({ x: 1.5, y: 2.5 });
  });
});

describe("solid from below", () => {
  test("a heavy platform stops a jump under it; a plain one lets him through", () => {
    const low = 12 * TILE;
    const lowWorld: World = { ...world, isSolid: (_c, r) => r >= 12 };
    const run = (under?: number) => {
      const b = createBody(5 * TILE, low);
      const c = { x: 4 * TILE, y: low - 40, w: 3 * TILE, dx: 0, dy: 0, under };
      let top = low;
      for (let i = 0; i < 60; i++) {
        stepBody(b, { ...idle, jumpHeld: true, jumpPressed: i === 0 }, lowWorld, undefined, { carriers: [c] });
        top = Math.min(top, b.y);
      }
      return { top, feet: b.y + PLAYER.h };
    };
    const solid = run(6);
    expect(solid.top).toBe(low - 40 + 6);
    expect(solid.feet).toBe(low);
    const plain = run();
    expect(plain.feet).toBe(low - 40);
  });
});

describe("a path, one way and round again", () => {
  // A banner that rises out of the crowd, goes six tiles along, sinks, and is away for a while.
  const banner: Path = { kind: "path", points: [{ x: 64, y: 200 }, { x: 64, y: 180 }, { x: 160, y: 180 }, { x: 160, y: 220 }], w: 2 * TILE, speed: 1, wait: 40 };

  test("it goes along its points at its speed, then is away, then starts again", () => {
    expect(pathSteps(banner)).toBe(156);
    expect(carrierAt(banner, 0)).toEqual({ x: 64, y: 200 });
    expect(carrierAt(banner, 20)).toEqual({ x: 64, y: 180 });
    expect(carrierAt(banner, 70)).toEqual({ x: 114, y: 180 });
    expect(carrierShown(banner, 155)).toBe(true);
    expect(carrierShown(banner, 170)).toBe(false);
    expect(carrierShown(banner, pathPeriod(banner))).toBe(true);
    expect(carrierAt(banner, pathPeriod(banner))).toEqual({ x: 64, y: 200 });
  });

  test("away, it holds nobody up and is not near anybody", () => {
    const b = createBody(170, 200);
    expect(carriersNear([banner], 170, b, 200)).toEqual([]);
    expect(carriersNear([banner], 100, b, 200).length).toBe(1);
  });

  test("back from being away it starts still, and drags nobody from where it left", () => {
    const s = carrierState(banner, pathPeriod(banner));
    expect(s.dx).toBe(0);
    expect(s.dy).toBe(0);
  });

  test("he rides it along, and is let down when it sinks onto the floor below", () => {
    const low: World = { ...world, isSolid: (_c, r) => r >= 13 };
    const b = createBody(90, 180);
    for (let step = 40; step < 170; step++) stepBody(b, idle, low, undefined, { carriers: carriersNear([banner], step, b) });
    expect(b.x + PLAYER.w / 2).toBeGreaterThan(150);
    expect(b.y + PLAYER.h).toBe(13 * TILE);
    expect(b.onGround).toBe(true);
  });
});

describe("an orbit, a bucket on a water wheel", () => {
  const bucket: Orbit = { kind: "orbit", cx: 20 * TILE, cy: 15 * TILE, r: 4 * TILE, w: 2 * TILE, period: 400 };
  const top = (d: CarrierDef, t: number) => carrierAt(d, t);

  test("it starts at the top, goes round clockwise at an even pace, and stays level", () => {
    expect(top(bucket, 0)).toEqual({ x: 20 * TILE - TILE, y: 11 * TILE });
    expect(top(bucket, 100)).toEqual({ x: 24 * TILE - TILE, y: 15 * TILE });
    expect(top(bucket, 200)).toEqual({ x: 20 * TILE - TILE, y: 19 * TILE });
    expect(top(bucket, 300)).toEqual({ x: 16 * TILE - TILE, y: 15 * TILE });
    expect(top(bucket, 400)).toEqual(top(bucket, 0));
    expect(carrierPeriod(bucket)).toBe(400);
    // A share of a turn moves it round, and a negative period turns it the other way.
    expect(top({ ...bucket, turn: 0.25 }, 0)).toEqual(top(bucket, 100));
    expect(top({ ...bucket, period: -400 }, 100)).toEqual(top(bucket, 300));
    for (let t = 1; t < 400; t++) {
      const s = carrierState(bucket, t);
      expect(Math.abs(s.dx) + Math.abs(s.dy)).toBeLessThanOrEqual(2);
    }
  });

  test("on at the bottom, he is carried up the side and over the top", () => {
    const b = standOn(bucket, 200, 16);
    let highest = feet(b);
    for (let t = 200; t < 400; t++) {
      stepBody(b, idle, world, undefined, { carriers: carriersNear([bucket], t, b) });
      highest = Math.min(highest, feet(b));
      expect(b.onGround).toBe(true);
    }
    expect(highest).toBe(11 * TILE);
    expect(feet(b)).toBe(top(bucket, 399).y);
  });
});
