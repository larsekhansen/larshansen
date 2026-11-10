import { describe, expect, test } from "bun:test";
import { createBody } from "@larshansen/pixelkit/physics";
import { begin, collect, countOf, elapsedMs, formatTime, judge, newRun, tick, touched } from "./run";

describe("the clock", () => {
  test("waits for the first step he takes", () => {
    const run = newRun();
    for (let i = 0; i < 100; i++) tick(run);
    expect(run.steps).toBe(0);
    begin(run);
    for (let i = 0; i < 60; i++) tick(run);
    expect(run.state).toBe("running");
    expect(elapsedMs(run)).toBeCloseTo(1000, 5);
  });

  test("stops on the tenth rune", () => {
    const run = newRun();
    begin(run);
    for (let i = 0; i < 9; i++) expect(collect(run, i)).toEqual({ fresh: true, finished: false });
    for (let i = 0; i < 30; i++) tick(run);
    expect(collect(run, 9)).toEqual({ fresh: true, finished: true });
    const at = run.steps;
    for (let i = 0; i < 30; i++) tick(run);
    expect(run.steps).toBe(at);
    expect(run.state).toBe("done");
  });

  test("formats as m:ss.t", () => {
    expect(formatTime(0)).toBe("0:00.0");
    expect(formatTime(9_990)).toBe("0:09.9");
    expect(formatTime(61_250)).toBe("1:01.2");
    expect(formatTime(600_000)).toBe("10:00.0");
  });

  test("the best time is the lowest, and the first finish is a best", () => {
    expect(judge(null, 50_000)).toEqual({ best: 50_000, isNew: true });
    expect(judge(50_000, 40_000)).toEqual({ best: 40_000, isNew: true });
    expect(judge(40_000, 45_000)).toEqual({ best: 40_000, isNew: false });
  });
});

describe("the runes", () => {
  test("a rune counts once", () => {
    const run = newRun();
    expect(collect(run, 3).fresh).toBe(true);
    expect(collect(run, 3).fresh).toBe(false);
    expect(countOf(run)).toBe(1);
  });

  test("picking one up before moving starts the clock", () => {
    const run = newRun();
    collect(run, 0);
    expect(run.state).toBe("running");
  });

  test("touching a rune's tile collects it, and only the ones not yet taken", () => {
    const runes = [
      { index: 0, x: 160, y: 208 },
      { index: 1, x: 400, y: 208 }
    ];
    const b = createBody(168, 224); // 10 x 14 box, feet at 224, over the first rune
    expect(touched(b, runes, 0)).toEqual([0]);
    expect(touched(b, runes, 1)).toEqual([]);
    b.x = 200;
    expect(touched(b, runes, 0)).toEqual([]);
  });

  test("grazing the edge of the tile does not count, overlapping does", () => {
    const runes = [{ index: 2, x: 160, y: 160 }];
    const b = createBody(160 - 5, 174); // right edge exactly on the tile's left edge
    expect(touched(b, runes, 0)).toEqual([]);
    b.x += 1;
    expect(touched(b, runes, 0)).toEqual([2]);
  });
});
