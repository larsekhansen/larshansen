import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { GROUND_Y } from "./level";
import { createStepper } from "./loop";
import { createBody, stepBody, type Body, type Intent } from "./physics";

const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** Runs steps with an intent per step and returns the highest point the feet reached. */
function run(b: Body, steps: number, intent: (i: number) => Intent) {
  let top = b.y + PLAYER.h;
  for (let i = 0; i < steps; i++) {
    stepBody(b, intent(i));
    top = Math.min(top, b.y + PLAYER.h);
  }
  return top;
}

const feet = (b: Body) => b.y + PLAYER.h;

describe("jumping", () => {
  test("a held jump from the street lifts the feet about 46 px", () => {
    const b = createBody(5 * TILE, GROUND_Y);
    const top = run(b, 60, (i) => ({ ...idle, jumpHeld: true, jumpPressed: i === 0 }));
    expect(GROUND_Y - top).toBeGreaterThan(44);
    expect(GROUND_Y - top).toBeLessThan(49);
  });

  test("letting go early gives a lower hop", () => {
    const b = createBody(5 * TILE, GROUND_Y);
    const top = run(b, 60, (i) => ({ ...idle, jumpHeld: i < 4, jumpPressed: i === 0 }));
    expect(GROUND_Y - top).toBeLessThan(25);
  });

  test("the jump is the same height at 60, 90, 120 and 144 Hz", () => {
    const heights = [60, 90, 120, 144].map((hz) => {
      const b = createBody(5 * TILE, GROUND_Y);
      let i = 0;
      let top = feet(b);
      const stepper = createStepper(() => {
        stepBody(b, { ...idle, jumpHeld: true, jumpPressed: i === 0 });
        top = Math.min(top, feet(b));
        i++;
      });
      for (let frame = 0; frame < hz; frame++) stepper.advance(1000 / hz);
      return GROUND_Y - top;
    });
    expect(new Set(heights).size).toBe(1);
  });

  test("a jump pressed just before landing still happens", () => {
    const b = createBody(5 * TILE, GROUND_Y - 20);
    b.onGround = false;
    run(b, 6, () => idle);
    const top = run(b, 40, (i) => ({ ...idle, jumpHeld: true, jumpPressed: i === 0 }));
    expect(top).toBeLessThan(GROUND_Y - 30);
  });
});

describe("getting up onto things", () => {
  const hopRight = (b: Body, steps = 70) => run(b, steps, (i) => ({ left: false, right: true, jumpHeld: i < 30, jumpPressed: i === 0 }));

  test("the crates by the workshop", () => {
    const b = createBody(21 * TILE - 28, GROUND_Y);
    run(b, 60, (i) => ({ left: false, right: i < 22, jumpHeld: i < 30, jumpPressed: i === 0 }));
    expect(feet(b)).toBe(8 * TILE);
  });

  test("the tall hedge at Tøyen", () => {
    const b = createBody(41 * TILE - 28, GROUND_Y);
    hopRight(b, 40);
    expect(feet(b)).toBe(8 * TILE);
  });

  test("from the ruin wall to the stone ledge in Gamlebyen", () => {
    const b = createBody(51 * TILE + 8, 8 * TILE);
    run(b, 45, (i) => ({ left: false, right: i < 28, jumpHeld: i < 30, jumpPressed: i === 0 }));
    expect(feet(b)).toBe(7 * TILE);
  });

  test("up the Opera roof to the stage tower", () => {
    const b = createBody(72 * TILE, GROUND_Y);
    run(b, 420, () => ({ ...idle, right: true }));
    expect(b.onGround).toBe(true);
    expect(feet(b)).toBe(6 * TILE);
    expect(b.x).toBeGreaterThan(86 * TILE);
  });

  test("and back down to the square", () => {
    const b = createBody(87 * TILE, 6 * TILE);
    run(b, 420, () => ({ ...idle, left: true }));
    expect(feet(b)).toBe(GROUND_Y);
    expect(b.x).toBeLessThan(72 * TILE);
  });

  test("the stone ledge can be jumped up through from below", () => {
    const b = createBody(54 * TILE + 8, 8 * TILE);
    b.y = 8 * TILE - 14;
    const top = run(b, 40, (i) => ({ ...idle, jumpHeld: true, jumpPressed: i === 0 }));
    expect(top).toBeLessThan(7 * TILE);
  });
});
