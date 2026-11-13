import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { createBody, stepBody, type Intent, type World } from "./physics";
import { PATIENCE, walkStep, walkTo, type WalkGoal, type WalkStep } from "./walkto";

// Flat ground at row 10, a crate one tile high at column 12, and a wall too tall to hop at column 30.
const FLOOR = 10 * TILE;
const world: World = {
  width: 40 * TILE,
  isSolid: (c, r) => r >= 10 || (c === 12 && r === 9) || (c === 30 && r >= 4),
  isOneWay: () => false,
  rampAt: () => null
};
const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const door = { id: "shop", x: 20 * TILE, w: TILE };
type D = typeof door;

/** Walks with the goal until it ends, at most `max` steps. Returns the steps taken and the door gone into. */
function walk(b: ReturnType<typeof createBody>, goal: WalkGoal<D>, max = 1200, here: (b: ReturnType<typeof createBody>) => D | null = () => null) {
  let g: WalkGoal<D> | null = goal;
  for (let step = goal.since + 1; step < goal.since + max; step++) {
    const w: WalkStep<D> = walkStep(g!, b, idle, here(b), step);
    if (w.enter) return { step, entered: w.enter, goal: null };
    g = w.goal;
    stepBody(b, w.intent, world);
    if (!g) return { step, entered: null, goal: null };
  }
  return { step: -1, entered: null, goal: g };
}

describe("a goal", () => {
  test("a door's middle, or the spot kept a body's width inside the world", () => {
    expect(walkTo({ x: 5, y: 0 }, door, world.width, 0).x).toBe(door.x + TILE / 2);
    expect(walkTo({ x: 2, y: 50 }, null, world.width, 0)).toEqual({ x: PLAYER.w, y: 50, door: null, best: Infinity, since: 0, stuck: 0 });
    expect(walkTo({ x: 99999, y: 0 }, null, world.width, 0).x).toBe(world.width - PLAYER.w);
  });
});

describe("walking there", () => {
  test("arrives at a spot on the ground and stops wanting", () => {
    const b = createBody(4 * TILE, FLOOR);
    const r = walk(b, walkTo<D>({ x: 8 * TILE, y: FLOOR }, null, world.width, 0));
    expect(r.goal).toBeNull();
    expect(Math.abs(b.x + PLAYER.w / 2 - 8 * TILE)).toBeLessThan(4);
  });

  test("hops over a crate in the way", () => {
    const b = createBody(10 * TILE, FLOOR);
    walk(b, walkTo<D>({ x: 16 * TILE, y: FLOOR }, null, world.width, 0));
    expect(b.x + PLAYER.w / 2).toBeGreaterThan(15 * TILE);
  });

  test("goes in at the door it was sent to", () => {
    const b = createBody(16 * TILE, FLOOR);
    const atDoor = (body: typeof b) => (Math.abs(body.x + PLAYER.w / 2 - (door.x + TILE / 2)) < TILE / 2 + 3 ? door : null);
    expect(walk(b, walkTo({ x: 0, y: 0 }, door, world.width, 0), 1200, atDoor).entered).toBe(door);
  });

  test("gives up after three seconds of getting no closer", () => {
    const b = createBody(26 * TILE, FLOOR);
    const r = walk(b, walkTo<D>({ x: 34 * TILE, y: FLOOR }, null, world.width, 0));
    expect(r.goal).toBeNull();
    expect(r.step).toBeGreaterThan(PATIENCE);
    expect(r.step).toBeLessThan(PATIENCE + 120);
    expect(b.x + PLAYER.w).toBeLessThanOrEqual(30 * TILE);
  });

  test("any key of the visitor's own takes over", () => {
    const b = createBody(4 * TILE, FLOOR);
    const goal = walkTo({ x: 30 * TILE, y: FLOOR }, null, world.width, 0);
    const pressed = { ...idle, left: true };
    const w = walkStep(goal, b, pressed, null, 1);
    expect(w.goal).toBeNull();
    expect(w.intent).toBe(pressed);
  });

  test("the steering is pure: the goal passed in is left as it was", () => {
    const b = createBody(4 * TILE, FLOOR);
    const goal = walkTo({ x: 30 * TILE, y: FLOOR }, null, world.width, 0);
    const copy = { ...goal };
    const w = walkStep(goal, b, idle, null, 1);
    expect(goal).toEqual(copy);
    expect(w.intent.right).toBe(true);
    expect(w.intent.jumpHeld).toBe(true);
  });
});
