import { describe, expect, test } from "bun:test";
import { EASE_MS, LOOK_AHEAD, follow } from "./camera";

const size = { w: 320, h: 200 };
const bounds = { width: 2000, bottom: 400 };
const at = (x: number, y: number, facing = 1) => ({ x, y, facing });

describe("the camera", () => {
  test("looks ahead of him in the way he faces", () => {
    const right = follow({ x: 0, y: 0 }, at(1000, 300, 1), bounds, size, 0, true);
    const left = follow({ x: 0, y: 0 }, at(1000, 300, -1), bounds, size, 0, true);
    expect(right.x).toBe(1000 + LOOK_AHEAD - size.w / 2);
    expect(left.x).toBe(1000 - LOOK_AHEAD - size.w / 2);
    expect(right.x - left.x).toBe(2 * LOOK_AHEAD);
  });

  test("keeps him in the middle of the screen up and down", () => {
    expect(follow({ x: 0, y: 0 }, at(1000, 150), bounds, size, 0, true).y).toBe(150 - size.h / 2);
  });

  test("stops at the edges of the world", () => {
    expect(follow({ x: 0, y: 0 }, at(20, 300), bounds, size, 0, true).x).toBe(0);
    expect(follow({ x: 0, y: 0 }, at(1990, 300), bounds, size, 0, true).x).toBe(bounds.width - size.w);
    expect(follow({ x: 0, y: 0 }, at(1000, 390), bounds, size, 0, true).y).toBe(bounds.bottom - size.h);
    expect(follow({ x: 0, y: 0 }, at(1000, 10), bounds, size, 0, true).y).toBe(0);
  });

  test("may rise above the top of the world when the scene lets it", () => {
    expect(follow({ x: 0, y: 0 }, at(1000, 10), { ...bounds, top: 16 }, size, 0, true).y).toBe(-16);
  });

  test("looking up raises the view", () => {
    const plain = follow({ x: 0, y: 0 }, at(1000, 250), bounds, size, 0, true).y;
    const raised = follow({ x: 0, y: 0 }, { ...at(1000, 250), lookUp: 24 }, bounds, size, 0, true).y;
    expect(plain - raised).toBe(24);
  });

  test("a world narrower than the screen is centred, one shorter is kept at the bottom", () => {
    const c = follow({ x: 0, y: 0 }, at(100, 100), { width: 200, bottom: 150 }, size, 0, true);
    expect(c.x).toBe(-60);
    expect(c.y).toBe(-50);
  });

  test("eases: about two thirds of the way after one time constant, the same at any frame rate", () => {
    const one = follow({ x: 0, y: 0 }, at(1000, 100), bounds, size, EASE_MS);
    const want = 1000 + LOOK_AHEAD - size.w / 2;
    expect(one.x / want).toBeCloseTo(1 - Math.exp(-1), 10);
    // Ten frames of 13 ms land where one frame of 130 ms does.
    let c = { x: 0, y: 0 };
    for (let i = 0; i < 10; i++) c = follow(c, at(1000, 100), bounds, size, EASE_MS / 10);
    expect(c.x).toBeCloseTo(one.x, 6);
  });

  test("does not move in no time, and snaps when told", () => {
    expect(follow({ x: 5, y: 7 }, at(1000, 100), bounds, size, 0)).toEqual({ x: 5, y: 7 });
    expect(follow({ x: 5, y: 7 }, at(1000, 150), bounds, size, 0, true)).toEqual({ x: 1000 + LOOK_AHEAD - size.w / 2, y: 50 });
  });
});
