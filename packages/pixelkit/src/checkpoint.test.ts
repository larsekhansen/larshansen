import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { fellOut, respawnAt, touchFlags, type Checkpoints, type Flag } from "./checkpoint";
import { createBody } from "./physics";
import { tileMap } from "./tilemap";

const flags: Flag[] = [
  { x: 10 * TILE, bottom: 10 * TILE },
  { x: 30 * TILE, bottom: 8 * TILE }
];
const start = { x: 2 * TILE, bottom: 10 * TILE };
const none: Checkpoints = { reached: null };

describe("flags", () => {
  test("passing a flag raises it; nearby is not touching", () => {
    expect(touchFlags(none, flags, createBody(10 * TILE + 3, 10 * TILE)).reached).toBe(0);
    expect(touchFlags(none, flags, createBody(10 * TILE + 20, 10 * TILE)).reached).toBeNull();
    // High above the pole does not count either.
    expect(touchFlags(none, flags, createBody(10 * TILE, 10 * TILE - 60)).reached).toBeNull();
  });

  test("only forwards: an earlier flag does not move the return point back", () => {
    const far = touchFlags(none, flags, createBody(30 * TILE, 8 * TILE));
    expect(far.reached).toBe(1);
    expect(touchFlags(far, flags, createBody(10 * TILE, 10 * TILE)).reached).toBe(1);
  });

  test("nothing new, the same state back", () => {
    const s = touchFlags(none, flags, createBody(10 * TILE, 10 * TILE));
    expect(touchFlags(s, flags, createBody(10 * TILE, 10 * TILE))).toBe(s);
  });

  test("he comes back at the start, then at the flag he reached", () => {
    expect(respawnAt(none, flags, start)).toEqual(start);
    expect(respawnAt({ reached: 1 }, flags, start)).toEqual({ x: 30 * TILE, bottom: 8 * TILE });
  });
});

describe("falling out", () => {
  const map = tileMap({ map: ["......", "......", "##~~##"], legend: { solid: "#", water: "~" } });

  test("off the bottom of the map", () => {
    const b = createBody(TILE, 3 * TILE + 1);
    expect(fellOut(b, map)).toBe(true);
    expect(fellOut(createBody(TILE, 2 * TILE), map)).toBe(false);
  });

  test("a few pixels into water, not on its surface", () => {
    const over = (feet: number) => {
      const b = createBody(2 * TILE + 8, feet);
      return fellOut(b, map);
    };
    expect(over(2 * TILE)).toBe(false);
    expect(over(2 * TILE + 2)).toBe(false);
    expect(over(2 * TILE + 3)).toBe(true);
    expect(PLAYER.h).toBe(14);
  });
});
