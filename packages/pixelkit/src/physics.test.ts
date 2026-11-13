import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { bounce, createBody, stepBody, type Body, type Intent, type World } from "./physics";

// A flat floor at row 10 and nothing else.
const FLOOR = 10 * TILE;
const flat: World = {
  width: 40 * TILE,
  isSolid: (_c, r) => r >= 10,
  isOneWay: () => false,
  rampAt: () => null
};
const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const press: Intent = { ...idle, jumpHeld: true, jumpPressed: true };
const hold: Intent = { ...idle, jumpHeld: true };

const feet = (b: Body) => b.y + PLAYER.h;

/** Steps `n` times with the intent and returns the highest point the feet reached (smallest y). */
function run(b: Body, n: number, intent: (i: number) => Intent, abilities?: { doubleJump?: boolean }) {
  let top = feet(b);
  for (let i = 0; i < n; i++) {
    stepBody(b, intent(i), flat, abilities);
    top = Math.min(top, feet(b));
  }
  return top;
}

describe("double jump", () => {
  test("without the ability a second press in the air does nothing", () => {
    const single = createBody(5 * TILE, FLOOR);
    const twice = createBody(5 * TILE, FLOOR);
    const a = run(single, 70, (i) => (i === 0 ? press : hold));
    const c = run(twice, 70, (i) => (i === 0 || i === 20 ? press : hold));
    expect(c).toBe(a);
  });

  test("with the ability a second press in the air lifts him again", () => {
    const b = createBody(5 * TILE, FLOOR);
    const top = run(b, 80, (i) => (i === 0 || i === 20 ? press : hold), { doubleJump: true });
    expect(FLOOR - top).toBeGreaterThan(60);
  });

  test("only one extra jump per airtime", () => {
    const b = createBody(5 * TILE, FLOOR);
    let jumps = 0;
    for (let i = 0; i < 30; i++) {
      const r = stepBody(b, i % 10 === 0 ? press : hold, flat, { doubleJump: true });
      if (r.jumped) jumps++;
    }
    expect(jumps).toBe(2);
  });

  test("landing refills it", () => {
    const b = createBody(5 * TILE, FLOOR);
    for (let i = 0; i < 120; i++) stepBody(b, i === 0 || i === 15 ? press : idle, flat, { doubleJump: true });
    expect(b.onGround).toBe(true);
    let jumps = 0;
    for (let i = 0; i < 40; i++) if (stepBody(b, i === 0 || i === 15 ? press : hold, flat, { doubleJump: true }).jumped) jumps++;
    expect(jumps).toBe(2);
  });

  test("walking off an edge: the coyote jump is the first, the air jump the second", () => {
    const b = createBody(5 * TILE, FLOOR);
    b.onGround = false;
    b.coyote = 3;
    b.airJumps = 1; // refilled while he was still on the ground
    b.y -= 4;
    expect(stepBody(b, press, flat, { doubleJump: true }).jumped).toBe(true);
    expect(stepBody(b, { ...hold, jumpPressed: true }, flat, { doubleJump: true }).jumped).toBe(true);
  });
});

describe("bounce", () => {
  test("throws him up, clears the ground and refills the air jump", () => {
    const b = createBody(5 * TILE, FLOOR);
    bounce(b, 7);
    expect(b.vy).toBe(-7);
    expect(b.onGround).toBe(false);
    expect(b.airJumps).toBe(1);
  });

  test("a bounce rises higher than a jump", () => {
    const a = createBody(5 * TILE, FLOOR);
    const j = createBody(5 * TILE, FLOOR);
    bounce(a, 7);
    const bounced = run(a, 60, () => idle);
    const jumped = run(j, 60, (i) => (i === 0 ? press : hold));
    expect(bounced).toBeLessThan(jumped);
  });
});
