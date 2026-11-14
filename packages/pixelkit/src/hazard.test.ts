import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { hazardLive, hazardTouched, type Hazard } from "./hazard";

// A third rail along a track bed, and a spark on a beat.
const RAIL: Hazard = { x: 10 * TILE, y: 12 * TILE - 3, w: 6 * TILE, h: 3 };
const SPARK: Hazard = { x: 30 * TILE, y: 5 * TILE, w: TILE, h: TILE, beat: { rest: 100, warn: 60, live: 40 } };

describe("hazards", () => {
  test("touching one is a hit; beside it, over it, or just short of it, nothing", () => {
    const at = (x: number, feet: number) => ({ x: x - PLAYER.w / 2, y: feet - PLAYER.h });
    expect(hazardTouched([RAIL], at(12 * TILE, 12 * TILE), 0)).toBe(RAIL);
    expect(hazardTouched([RAIL], at(12 * TILE, 12 * TILE - 3), 0)).toBeNull();
    expect(hazardTouched([RAIL], at(10 * TILE - PLAYER.w / 2, 12 * TILE), 0)).toBeNull();
    expect(hazardTouched([RAIL], at(10 * TILE - PLAYER.w / 2 + 1, 12 * TILE), 0)).toBe(RAIL);
    expect(hazardTouched(undefined, at(12 * TILE, 12 * TILE), 0)).toBeNull();
  });

  test("one on a beat hurts only while live, after its warning", () => {
    const him = { x: 30 * TILE, y: 5 * TILE };
    expect(hazardLive(RAIL, 12345)).toBe(true);
    expect(hazardTouched([SPARK], him, 50)).toBeNull();
    expect(hazardTouched([SPARK], him, 130)).toBeNull();
    expect(hazardTouched([SPARK], him, 170)).toBe(SPARK);
    expect(hazardTouched([SPARK], him, 200)).toBeNull();
  });
});
