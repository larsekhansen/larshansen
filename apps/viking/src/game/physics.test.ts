import { describe, expect, test } from "bun:test";
import { BLOCKS, PHYS, PLAYER_H, PLAYER_W, RUNES, SHIP, GROUND_Y } from "./level";
import { createPlayer, stepPlayer, type PlayerState, type Solid, type StepInput } from "./physics";

const DT = PHYS.step;
const idle: StepInput = { move: 0, jumpHeld: false, jumpPressed: false };
const floor: Solid = { x: -1000, y: 500, w: 5000, h: 100 };

const run = (p: PlayerState, solids: Solid[], seconds: number, input: StepInput = idle) => {
  for (let t = 0; t < seconds; t += DT) stepPlayer(p, input, solids, DT);
};
const standing = (solids: Solid[] = [floor], x = 0) => {
  const p = createPlayer(x, 500 - PLAYER_H, PLAYER_W, PLAYER_H);
  run(p, solids, 0.1);
  return p;
};
/** Press jump, hold it for `hold` seconds, and return the peak height reached. */
const jumpPeak = (p: PlayerState, solids: Solid[], hold: number) => {
  const startY = p.y;
  let peak = 0;
  stepPlayer(p, { move: 0, jumpHeld: true, jumpPressed: true }, solids, DT);
  for (let t = 0; t < 1.5; t += DT) {
    stepPlayer(p, { move: 0, jumpHeld: t < hold, jumpPressed: false }, solids, DT);
    peak = Math.max(peak, startY - p.y);
  }
  return peak;
};

describe("stepPlayer", () => {
  test("falls and lands on the floor", () => {
    const p = createPlayer(0, 300, PLAYER_W, PLAYER_H);
    let landed = 0;
    for (let i = 0; i < 240; i++) landed ||= stepPlayer(p, idle, [floor], DT).landed;
    expect(p.grounded).toBe(true);
    expect(p.y).toBe(500 - PLAYER_H);
    expect(landed).toBeGreaterThan(0);
  });

  test("a held jump is higher than a tapped one", () => {
    const full = jumpPeak(standing(), [floor], 1);
    const tap = jumpPeak(standing(), [floor], 0);
    expect(full).toBeGreaterThan(110);
    expect(full).toBeLessThan(135);
    expect(tap).toBeLessThan(full * 0.6);
  });

  test("runs up to top speed and stops with friction", () => {
    const p = standing();
    run(p, [floor], 0.5, { ...idle, move: 1 });
    expect(p.vx).toBe(PHYS.runSpeed);
    run(p, [floor], 0.3);
    expect(p.vx).toBe(0);
  });

  test("coyote time allows a jump just after leaving a ledge", () => {
    const ledge: Solid = { x: 0, y: 500, w: 100, h: 100 };
    const p = standing([ledge], 100 - PLAYER_W);
    p.x = 101; // just walked off
    run(p, [ledge], PHYS.coyote * 0.5);
    expect(p.grounded).toBe(false);
    const ev = stepPlayer(p, { move: 0, jumpHeld: true, jumpPressed: true }, [ledge], DT);
    expect(ev.jumped).toBe(true);
  });

  test("a buffered jump fires on landing", () => {
    const p = createPlayer(0, 500 - PLAYER_H - 12, PLAYER_W, PLAYER_H);
    p.airJumps = 0;
    stepPlayer(p, { move: 0, jumpHeld: true, jumpPressed: true }, [floor], DT);
    let jumped = false;
    for (let i = 0; i < 20; i++) jumped ||= stepPlayer(p, { ...idle, jumpHeld: true }, [floor], DT).jumped;
    expect(jumped).toBe(true);
  });

  test("one double jump per airtime", () => {
    const p = standing();
    const press: StepInput = { move: 0, jumpHeld: true, jumpPressed: true };
    expect(stepPlayer(p, press, [floor], DT).jumped).toBe(true);
    run(p, [floor], 0.2, { ...idle, jumpHeld: true });
    expect(stepPlayer(p, press, [floor], DT).doubleJumped).toBe(true);
    run(p, [floor], 0.2, { ...idle, jumpHeld: true });
    const third = stepPlayer(p, press, [floor], DT);
    expect(third.jumped || third.doubleJumped).toBe(false);
  });

  test("walls stop horizontal movement", () => {
    const wall: Solid = { x: 100, y: 300, w: 50, h: 200 };
    const p = standing([floor, wall], 0);
    run(p, [floor, wall], 1, { ...idle, move: 1 });
    expect(p.x).toBe(100 - PLAYER_W);
  });

  test("one-way platforms let you jump up through and land on top", () => {
    const plat: Solid = { x: -50, y: 410, w: 200, h: 14, oneWay: true };
    const p = standing([floor, plat]);
    stepPlayer(p, { move: 0, jumpHeld: true, jumpPressed: true }, [floor, plat], DT);
    run(p, [floor, plat], 1.5, { ...idle, jumpHeld: true });
    expect(p.grounded).toBe(true);
    expect(p.y).toBe(410 - PLAYER_H);
  });

  test("a moving platform carries the player, including when it bobs", () => {
    const ship: Solid = { x: 0, y: 500, w: 150, h: 12, oneWay: true };
    const p = standing([ship], 60);
    for (let i = 0; i < 240; i++) {
      ship.dx = 0.5;
      ship.dy = Math.sin(i / 10) * 0.2;
      ship.x += ship.dx;
      ship.y += ship.dy;
      stepPlayer(p, idle, [ship], DT);
      expect(p.grounded).toBe(true);
    }
    expect(p.x).toBeCloseTo(60 + 120, 5);
    expect(p.y).toBeCloseTo(ship.y - PLAYER_H, 5);
  });
});

describe("level", () => {
  // Rough reachability: every rune must be within a double jump of some
  // standing surface (or the ship's deck), so the reward is always obtainable.
  test("every rune is reachable", () => {
    const single = PHYS.jumpSpeed ** 2 / (2 * PHYS.gravity);
    const double = single + PHYS.doubleJumpSpeed ** 2 / (2 * PHYS.gravity);
    const surfaces = [...BLOCKS, { x: SHIP.minX, y: SHIP.y, w: SHIP.maxX - SHIP.minX + SHIP.w }];
    for (const r of RUNES) {
      const ok = surfaces.some(
        (s) => r.x > s.x - 120 && r.x < s.x + s.w + 120 && s.y >= r.y - 20 && s.y - r.y < double + PLAYER_H
      );
      expect(ok, `rune ${r.char} at ${r.x},${r.y}`).toBe(true);
    }
  });

  test("the ship reaches both shores", () => {
    const left = BLOCKS.find((b) => b.kind === "ground" && b.x + b.w <= SHIP.minX + 40 && b.x + b.w >= SHIP.minX - 40);
    const right = BLOCKS.find((b) => b.kind === "ground" && Math.abs(b.x - (SHIP.maxX + SHIP.w)) <= 40);
    expect(left).toBeDefined();
    expect(right).toBeDefined();
    expect(SHIP.y).toBeLessThan(GROUND_Y);
  });
});
