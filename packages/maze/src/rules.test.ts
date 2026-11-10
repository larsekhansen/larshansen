import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { LEVELS, centreOf, startCentre } from "./levels";
import { BODY, CURSE_STEPS, FALL_STEPS, GATE_STEPS, RISE_STEPS, WARN_STEPS, crumbleAge, formatTime, gateOpen, gateProgress, isPit, limit, levelDef, newState, onStartPad, sliderRise, sliderSolid, sliderT, sliderWarning, snakeAt, snakeBox, solidCause, stepMaze, touchesWall, type MazeState } from "./rules";

const none = { dx: 0, dy: 0 };

/** Steps with no movement `n` times. */
function wait(s: MazeState, n: number) {
  for (let i = 0; i < n; i++) stepMaze(s, none);
}

/** Puts him at a tile's centre. */
function at(s: MazeState, c: number, r: number) {
  Object.assign(s, centreOf(c, r));
}

describe("walls", () => {
  test("touching a wall curses him, and he does not move while cursed", () => {
    const s = newState(1);
    let ev = {};
    for (let i = 0; i < 60 && s.phase === "play"; i++) ev = stepMaze(s, { dx: -1, dy: 0 });
    expect(s.phase).toBe("cursed");
    expect(ev).toEqual({ cursed: "wall" });
    const x = s.x;
    stepMaze(s, { dx: -1, dy: 0 });
    expect(s.x).toBe(x);
  });

  test("a 6 x 6 body fits through a one-tile corridor without touching", () => {
    const map = levelDef(1).map;
    // Level 1, column 13 rows 11 to 13 is a corridor one tile wide.
    expect(map[12][12]).toBe("#");
    expect(map[12][14]).toBe("#");
    for (let x = 13 * TILE + BODY / 2; x <= 14 * TILE - BODY / 2; x += 0.5) expect(touchesWall(map, x, 12 * TILE + 8)).toBe(false);
    // Half a pixel past either side touches.
    expect(touchesWall(map, 13 * TILE + BODY / 2 - 0.5, 12 * TILE + 8)).toBe(true);
    expect(touchesWall(map, 14 * TILE - BODY / 2 + 0.5, 12 * TILE + 8)).toBe(true);
  });

  test("the edge of the map is wall", () => {
    const map = levelDef(1).map;
    expect(touchesWall(map, -5, 100)).toBe(true);
    expect(touchesWall(map, 100, 400)).toBe(true);
  });

  test("walking straight up the first corridor of level 1 does not curse", () => {
    const s = newState(1);
    s.x = 6 * TILE; // between columns 5 and 6, a two-tile corridor
    s.y = 14 * TILE;
    for (let i = 0; i < 140; i++) stepMaze(s, { dx: 0, dy: -1 });
    expect(s.phase).toBe("play");
    expect(s.y).toBeLessThan(6 * TILE);
  });
});

describe("standing stones", () => {
  test("stepping onto a stone lights it once, and it becomes the last lit one", () => {
    const s = newState(1);
    expect(s.stones.length).toBe(1);
    s.x = 14 * TILE + 0.5; // just right of the stone's tile, on floor
    s.y = 9 * TILE + 8;
    expect(stepMaze(s, none).lit).toBeUndefined();
    const ev = stepMaze(s, { dx: -1, dy: 0 });
    expect(ev.lit).toBe(0);
    expect(s.lit).toBe(0);
    expect(s.stones[0].lit).toBe(true);
    // Standing on it again says nothing new.
    expect(stepMaze(s, { dx: 0.1, dy: 0 }).lit).toBeUndefined();
  });

  test("after a curse he wakes at the last lit stone, and the death count goes up", () => {
    const s = newState(1);
    at(s, 13, 9);
    stepMaze(s, { dx: 0.1, dy: 0 });
    expect(s.lit).toBe(0);
    // Walk into the wall east of the corridor in column 13, row 11.
    s.x = 14 * TILE - 4;
    s.y = 11 * TILE + 8;
    for (let i = 0; i < 6 && s.phase === "play"; i++) stepMaze(s, { dx: 1, dy: 0 });
    expect(s.phase).toBe("cursed");
    expect(s.deaths).toBe(0);
    let respawned = false;
    for (let i = 0; i < CURSE_STEPS; i++) respawned = !!stepMaze(s, none).respawned || respawned;
    expect(respawned).toBe(true);
    expect(s.phase).toBe("play");
    expect(s.deaths).toBe(1);
    expect(s.x).toBe(13 * TILE + 8);
    expect(s.y).toBe(9 * TILE + 8);
  });

  test("with no stone lit he wakes on the start pad", () => {
    const s = newState(1);
    const pad = startCentre(levelDef(1).map);
    for (let i = 0; i < 60 && s.phase === "play"; i++) stepMaze(s, { dx: -1, dy: 0 });
    wait(s, CURSE_STEPS);
    expect(s.x).toBe(pad.x);
    expect(s.y).toBe(pad.y);
    expect(onStartPad(s)).toBe(true);
  });
});

describe("snakes", () => {
  test("a snake is back at its start after one period, and at the other end half way", () => {
    for (const def of LEVELS[1].snakes) {
      const a = centreOf(def.from[0], def.from[1]);
      const b = centreOf(def.to[0], def.to[1]);
      expect(snakeAt(def, 0).x).toBeCloseTo(a.x, 6);
      expect(snakeAt(def, def.period).x).toBeCloseTo(a.x, 6);
      expect(snakeAt(def, def.period).y).toBeCloseTo(a.y, 6);
      expect(snakeAt(def, def.period / 2).x).toBeCloseTo(b.x, 6);
      expect(snakeAt(def, def.period / 2).y).toBeCloseTo(b.y, 6);
      // Eased: slower near the ends than in the middle.
      const run = (t: number) => Math.abs(snakeAt(def, t + 5).x - snakeAt(def, t).x) + Math.abs(snakeAt(def, t + 5).y - snakeAt(def, t).y);
      expect(run(def.period / 4)).toBeGreaterThan(run(0));
    }
  });

  test("the box is 12 x 6 along its line, 6 x 12 across", () => {
    const s = newState(2);
    const flat = snakeBox(s.snakes[0]);
    expect([flat.w, flat.h]).toEqual([12, 6]);
    const tall = snakeBox(s.snakes[2]);
    expect([tall.w, tall.h]).toEqual([6, 12]);
  });

  test("touching a snake curses him, and the snakes start over when he wakes", () => {
    const s = newState(2);
    const c = snakeAt(s.snakes[0].def, 0);
    // Beside the snake's box, then one and a half pixels into it.
    s.x = c.x + 6 + BODY / 2 + 0.5;
    s.y = c.y;
    s.snakes.forEach((sn) => (sn.t = -1)); // the step itself advances them to 0
    expect(stepMaze(s, none).cursed).toBeUndefined();
    s.x = c.x + 6 + BODY / 2 - 1.5;
    s.snakes.forEach((sn) => (sn.t = -1));
    const ev = stepMaze(s, none);
    expect(ev.cursed).toBe("snake");
    expect(s.cause).toBe("snake");
    wait(s, CURSE_STEPS);
    expect(s.phase).toBe("play");
    expect(s.snakes.every((sn) => sn.t === 0)).toBe(true);
  });

  test("snakes only exist on level 2", () => {
    expect(newState(1).snakes.length).toBe(0);
    expect(newState(2).snakes.length).toBe(4);
    expect(newState(3).snakes.length).toBe(0);
  });
});

describe("the finish and the clock", () => {
  test("his centre inside the finish clears the level", () => {
    const s = newState(1);
    s.x = 28 * TILE + 4;
    s.y = 16 * TILE + 8;
    expect(stepMaze(s, { dx: 1, dy: 0 })).toEqual({});
    s.x = 29 * TILE + 1;
    const ev = stepMaze(s, { dx: 1, dy: 0 });
    expect(ev.cleared).toBe(true);
    expect(s.phase).toBe("cleared");
  });

  test("the level clock starts at his first move, not before", () => {
    const s = newState(1);
    wait(s, 100);
    expect(s.steps).toBe(0);
    expect(s.started).toBe(false);
    stepMaze(s, { dx: 0, dy: -0.5 });
    expect(s.started).toBe(true);
    wait(s, 10);
    expect(s.steps).toBe(10);
  });

  test("formatTime", () => {
    expect(formatTime(0)).toBe("0:00.0");
    expect(formatTime(65432)).toBe("1:05.4");
  });
});

describe("limit", () => {
  test("keeps a short movement as it is", () => {
    expect(limit(0.5, 0.5, 1.2)).toEqual({ dx: 0.5, dy: 0.5 });
  });

  test("caps a diagonal so it is no faster than straight on", () => {
    const d = limit(1.2, 1.2, 1.2);
    expect(Math.hypot(d.dx, d.dy)).toBeCloseTo(1.2, 9);
    expect(d.dx).toBeCloseTo(d.dy, 9);
  });

  test("a long pull keeps its direction", () => {
    const d = limit(30, 40, 1.6);
    expect(d.dx).toBeCloseTo(0.96, 9);
    expect(d.dy).toBeCloseTo(1.28, 9);
  });

  test("zero stays zero", () => {
    expect(limit(0, 0, 1.6)).toEqual({ dx: 0, dy: 0 });
  });
});

describe("the rune key and the iron gate", () => {
  test("the gate is wall until the key is taken, then slides open over 30 steps", () => {
    const s = newState(3);
    at(s, 29, 13);
    expect(solidCause(s, s.x, s.y)).toBe("wall");
    expect(stepMaze(s, none).cursed).toBe("wall");
    const t = newState(3);
    at(t, 15, 10);
    const ev = stepMaze(t, { dx: 0.1, dy: 0 });
    expect(ev.key).toBe(true);
    expect(t.keyTaken).toBe(true);
    at(t, 29, 13);
    expect(gateOpen(t)).toBe(false);
    expect(solidCause(t, t.x, t.y)).toBe("wall");
    wait(t, GATE_STEPS);
    expect(gateOpen(t)).toBe(true);
    expect(gateProgress(t)).toBe(1);
    expect(solidCause(t, t.x, t.y)).toBeNull();
  });

  test("the key is picked up once, only with his centre in its tile", () => {
    const s = newState(3);
    s.x = 16 * TILE + 2; // body overlaps the tile, centre does not
    s.y = 10 * TILE + 8;
    expect(stepMaze(s, none).key).toBeUndefined();
    s.x = 15 * TILE + 14;
    expect(stepMaze(s, none).key).toBe(true);
    expect(stepMaze(s, none).key).toBeUndefined();
  });

  test("a curse does not take the key back, and the gate keeps opening during it", () => {
    const s = newState(3);
    at(s, 15, 10);
    stepMaze(s, none);
    expect(s.keyTaken).toBe(true);
    s.x = 4 * TILE; // inside a wall
    s.y = 5 * TILE + 8;
    s.x = 5 * TILE + 8;
    expect(stepMaze(s, none).cursed).toBe("wall");
    wait(s, CURSE_STEPS);
    expect(s.phase).toBe("play");
    expect(s.keyTaken).toBe(true);
    expect(gateOpen(s)).toBe(true);
  });

  test("levels without a key have no gate to open", () => {
    expect(newState(1).keyTaken).toBe(false);
    expect(newState(1).gate).toBe(-1);
  });
});

describe("crumbling floor", () => {
  test("a tile shakes from the first step he overlaps it and falls 120 steps later", () => {
    const s = newState(4);
    at(s, 10, 16);
    expect(crumbleAge(s, 10, 16)).toBe(-1);
    stepMaze(s, none);
    expect(crumbleAge(s, 10, 16)).toBe(0);
    s.x = 4 * TILE + 8; // off it, onto floor
    s.y = 16 * TILE + 8;
    for (let i = 0; i < FALL_STEPS - 1; i++) stepMaze(s, none);
    expect(crumbleAge(s, 10, 16)).toBe(FALL_STEPS - 1);
    expect(isPit(s, 10, 16)).toBe(false);
    const ev = stepMaze(s, none);
    expect(ev.fell).toBe(true);
    expect(isPit(s, 10, 16)).toBe(true);
  });

  test("a body that touches two tiles starts both", () => {
    const s = newState(4);
    s.x = 11 * TILE; // the edge between tiles 10 and 11
    s.y = 16 * TILE + 8;
    stepMaze(s, none);
    expect(crumbleAge(s, 10, 16)).toBe(0);
    expect(crumbleAge(s, 11, 16)).toBe(0);
  });

  test("standing still on it when it falls curses him as a pit; a pit is a wall to touch", () => {
    const s = newState(4);
    at(s, 12, 16);
    let ev = {};
    let n = 0;
    while (s.phase === "play" && n++ < 200) ev = stepMaze(s, none);
    expect(n).toBe(FALL_STEPS + 1);
    expect(ev).toEqual({ cursed: "pit", fell: true });
    expect(s.cause).toBe("pit");
  });

  test("a curse restores every crumbling tile", () => {
    const s = newState(4);
    at(s, 12, 16);
    wait(s, 10);
    expect(crumbleAge(s, 12, 16)).toBeGreaterThan(0);
    s.x = 5 * TILE + 8;
    s.y = 3 * TILE; // wall
    stepMaze(s, none);
    expect(s.phase).toBe("cursed");
    wait(s, CURSE_STEPS);
    expect(s.crumble.size).toBe(0);
    expect(isPit(s, 12, 16)).toBe(false);
  });

  test("walking across at the slowest allowed speed keeps ahead of the fall", () => {
    const s = newState(4);
    at(s, 9, 16);
    s.x = 9 * TILE + 8;
    for (let i = 0; i < 230 && s.phase === "play"; i++) stepMaze(s, { dx: 0.6, dy: 0 });
    expect(s.phase).toBe("play");
    expect(s.x).toBeGreaterThan(17 * TILE);
  });
});

describe("sliding walls", () => {
  const d = LEVELS[4].sliders[0]; // [9, 2], period 180, offset 0

  test("wall for the first half of the round, floor for the second", () => {
    expect(sliderSolid(d, 0)).toBe(true);
    expect(sliderSolid(d, 89)).toBe(true);
    expect(sliderSolid(d, 90)).toBe(false);
    expect(sliderSolid(d, 179)).toBe(false);
    expect(sliderSolid(d, 180)).toBe(true);
  });

  test("the offset shifts the round", () => {
    const e = LEVELS[4].sliders[1]; // offset 90
    expect(sliderSolid(e, 0)).toBe(false);
    expect(sliderSolid(e, 90)).toBe(true);
    expect(sliderT(e, 100)).toBe(10);
  });

  test("it shimmers for the last 60 steps before it turns to wall, and not otherwise", () => {
    expect(sliderWarning(d, 90)).toBe(false);
    expect(sliderWarning(d, 119)).toBe(false);
    expect(sliderWarning(d, 120)).toBe(true);
    expect(sliderWarning(d, 179)).toBe(true);
    expect(sliderWarning(d, 180)).toBe(false); // it is wall now
    expect(sliderWarning(d, 60)).toBe(false);
    expect(WARN_STEPS).toBe(60);
  });

  test("the stone rises over 6 steps and sinks over 6", () => {
    expect(sliderRise(d, 0)).toBeGreaterThan(0);
    expect(sliderRise(d, 0)).toBeLessThan(1);
    expect(sliderRise(d, RISE_STEPS)).toBe(1);
    expect(sliderRise(d, 89)).toBe(1);
    expect(sliderRise(d, 90)).toBeLessThan(1);
    expect(sliderRise(d, 90 + RISE_STEPS)).toBe(0);
    expect(sliderRise(d, 150)).toBe(0);
  });

  test("touching it while it is wall curses him; while it is floor he walks through", () => {
    const s = newState(5);
    s.started = true;
    s.x = 9 * TILE + 8;
    s.y = 2 * TILE + 16;
    s.steps = 100; // floor
    expect(stepMaze(s, none).cursed).toBeUndefined();
    const t = newState(5);
    t.started = true;
    t.x = 9 * TILE + 8;
    t.y = 2 * TILE + 16;
    t.steps = 0;
    expect(stepMaze(t, none).cursed).toBe("slider");
    expect(t.cause).toBe("slider");
  });

  test("if it turns to wall while he stands in it, he is cursed", () => {
    const s = newState(5);
    s.started = true;
    s.x = 9 * TILE + 8;
    s.y = 2 * TILE + 16;
    s.steps = 170;
    let ev = {};
    for (let i = 0; i < 20 && s.phase === "play"; i++) ev = stepMaze(s, none);
    expect(ev).toEqual({ cursed: "slider" });
    expect(s.steps).toBeGreaterThanOrEqual(180);
  });

  test("sliders keep running through a curse and are not reset by it", () => {
    const s = newState(5);
    s.started = true;
    s.steps = 50;
    s.x = 8;
    s.y = 3 * TILE + 8; // wall
    stepMaze(s, none);
    expect(s.phase).toBe("cursed");
    wait(s, CURSE_STEPS);
    expect(s.phase).toBe("play");
    expect(s.steps).toBe(50 + 1 + CURSE_STEPS);
  });
});
