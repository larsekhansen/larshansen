import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { createBody, stepBody, type Intent, type World } from "./physics";
import { pulseAge, pulsePhase, timedCarriers, timedPhase, type TimedLedge } from "./timed";

const beat = { on: 120, warn: 60, off: 90 };

describe("the beat", () => {
  test("on, then a one-second warning, then off, and round again", () => {
    expect(timedPhase(0, beat)).toBe("on");
    expect(timedPhase(119, beat)).toBe("on");
    expect(timedPhase(120, beat)).toBe("warn");
    expect(timedPhase(179, beat)).toBe("warn");
    expect(timedPhase(180, beat)).toBe("off");
    expect(timedPhase(269, beat)).toBe("off");
    expect(timedPhase(270, beat)).toBe("on");
  });

  test("an offset shifts it; steps before zero work too", () => {
    expect(timedPhase(0, { ...beat, offset: 120 })).toBe("warn");
    expect(timedPhase(-1, beat)).toBe("off");
    expect(timedPhase(-91, beat)).toBe("warn");
  });
});

describe("standing on it", () => {
  const ledge: TimedLedge = { ...beat, x: 10 * TILE, y: 8 * TILE, w: 3 * TILE };
  const world: World = { width: 40 * TILE, isSolid: (_c, r) => r >= 20, isOneWay: () => false, rampAt: () => null };
  const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };

  test("it is there while on and warning, gone while off", () => {
    expect(timedCarriers([ledge], 10).length).toBe(1);
    expect(timedCarriers([ledge], 150).length).toBe(1);
    expect(timedCarriers([ledge], 200)).toEqual([]);
  });

  test("it holds him through the warning and drops him when it goes", () => {
    const b = createBody(11 * TILE, 8 * TILE);
    let fellAt = -1;
    for (let step = 1; step < 260; step++) {
      stepBody(b, idle, world, undefined, { carriers: timedCarriers([ledge], step) });
      if (fellAt < 0 && !b.onGround) fellAt = step;
    }
    expect(fellAt).toBe(180);
    expect(b.y + PLAYER.h).toBe(20 * TILE);
  });

  test("it is a one-way ledge: he jumps up through it from below", () => {
    const low: World = { ...world, isSolid: (_c, r) => r >= 10 };
    const b = createBody(11 * TILE, 10 * TILE);
    for (let i = 0; i < 70; i++) stepBody(b, { ...idle, jumpHeld: true, jumpPressed: i === 0 }, low, undefined, { carriers: timedCarriers([ledge], i) });
    expect(b.y + PLAYER.h).toBe(8 * TILE);
  });
});

describe("a pulse: at rest, a warning, then live", () => {
  const gust = { rest: 120, warn: 60, live: 90 };

  test("it rests, warns for a second, is live, and rests again", () => {
    expect(pulsePhase(0, gust)).toBe("rest");
    expect(pulsePhase(119, gust)).toBe("rest");
    expect(pulsePhase(120, gust)).toBe("warn");
    expect(pulsePhase(179, gust)).toBe("warn");
    expect(pulsePhase(180, gust)).toBe("live");
    expect(pulsePhase(269, gust)).toBe("live");
    expect(pulsePhase(270, gust)).toBe("rest");
    expect(pulsePhase(0, { ...gust, offset: 150 })).toBe("warn");
  });

  test("the age in its phase, for a warning drawn growing", () => {
    expect(pulseAge(130, gust)).toEqual({ age: 10, of: 60 });
    expect(pulseAge(200, gust)).toEqual({ age: 20, of: 90 });
    expect(pulseAge(5, gust)).toEqual({ age: 5, of: 120 });
  });
});
