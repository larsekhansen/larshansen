import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { createBody, stepBody } from "./physics";
import { footOf, tileMap } from "./tilemap";

// A small world: a start, a crate, a ledge, a pond, and a slope up to a plateau at the right.
const MAP = [
  "..........",
  "......____",
  "..S.B.....",
  "###~~#####",
  "##########"
];
const DISTRICTS = [
  { name: "West", landmark: null, from: 0 },
  { name: "East", landmark: { nb: "Øst", en: "East" }, from: 5 * TILE }
];
const level = tileMap({
  map: MAP,
  legend: { solid: "#B", oneWay: "_", water: "~" },
  ramps: [{ points: [[6 * TILE, 3 * TILE], [8 * TILE, 2 * TILE], [10 * TILE, 2 * TILE]] }],
  districts: DISTRICTS
});

describe("reading a map", () => {
  test("size", () => {
    expect([level.cols, level.rows, level.width, level.height]).toEqual([10, 5, 10 * TILE, 5 * TILE]);
  });

  test("outside the map is ground at the sides and below, and sky above", () => {
    expect(level.tileAt(-1, 2)).toBe("#");
    expect(level.tileAt(10, 2)).toBe("#");
    expect(level.tileAt(3, 5)).toBe("#");
    expect(level.tileAt(3, -1)).toBe(".");
    expect(level.isSolid(-1, 0)).toBe(true);
    expect(level.isSolid(3, -4)).toBe(false);
  });

  test("the legend", () => {
    expect(level.isSolid(4, 2)).toBe(true); // the crate
    expect(level.isOneWay(7, 1)).toBe(true);
    expect(level.isSolid(7, 1)).toBe(false);
    expect(level.isWater(3, 3)).toBe(true);
    expect(level.isSolid(3, 3)).toBe(false);
  });

  test("find, row by row, by letter or by test", () => {
    expect(level.find("_").map((t) => t.c)).toEqual([6, 7, 8, 9]);
    expect(level.find((ch) => ch === "B" || ch === "S").map((t) => t.ch)).toEqual(["S", "B"]);
    expect(level.find("Z")).toEqual([]);
  });

  test("the start stands on the tile below it", () => {
    expect(level.spawn()).toEqual({ x: 2 * TILE + TILE / 2, bottom: 3 * TILE });
    expect(footOf({ c: 4, r: 1 })).toEqual({ x: 4 * TILE + 8, bottom: 2 * TILE });
    expect(() => tileMap({ map: [".."], legend: { solid: "#" } }).spawn()).toThrow();
  });

  test("ramps: a line between corners, null off them", () => {
    expect(level.rampAt(6 * TILE)).toBe(3 * TILE);
    expect(level.rampAt(7 * TILE)).toBe(2.5 * TILE);
    expect(level.rampAt(9 * TILE)).toBe(2 * TILE);
    expect(level.rampAt(5 * TILE)).toBeNull();
  });

  test("districts", () => {
    expect(level.districtAt(0).name).toBe("West");
    expect(level.districtAt(5 * TILE - 1).name).toBe("West");
    expect(level.districtAt(5 * TILE).name).toBe("East");
    expect(level.districtFrom("East")).toBe(5 * TILE);
    expect(() => level.districtFrom("North")).toThrow();
  });
});

describe("finding ground", () => {
  test("the first thing to stand on below a point", () => {
    expect(level.surfaceBelow(4 * TILE + 3, 0)).toBe(2 * TILE); // the top of the crate
    expect(level.surfaceBelow(4 * TILE + 3, 2.5 * TILE)).toBe(2 * TILE); // inside it: still its top
    expect(level.surfaceBelow(1 * TILE, 0)).toBe(3 * TILE);
    expect(level.surfaceBelow(7 * TILE, 0)).toBe(2.5 * TILE); // a slope comes first
  });

  test("water first is nothing to stand on", () => {
    expect(level.surfaceBelow(3 * TILE + 8, 0)).toBeNull();
  });

  test("supports: ground, ledge and slope hold him; air and water do not", () => {
    const on = (cx: number, feet: number) => level.supports({ ...createBody(cx, feet) });
    expect(on(1 * TILE, 3 * TILE)).toBe(true);
    expect(on(7 * TILE + 8, 1 * TILE)).toBe(true); // the ledge over the slope
    expect(on(6.5 * TILE, level.rampAt(6.5 * TILE)!)).toBe(true);
    expect(on(1 * TILE, 3 * TILE - 4)).toBe(false);
    expect(on(3 * TILE + 8, 3 * TILE)).toBe(false);
  });
});

describe("the map is a world the physics can walk", () => {
  test("he walks up the slope onto the plateau", () => {
    const b = createBody(5 * TILE + 8, 3 * TILE);
    for (let i = 0; i < 160; i++) stepBody(b, { left: false, right: true, jumpHeld: false, jumpPressed: false }, level);
    expect(b.onGround).toBe(true);
    expect(b.y + PLAYER.h).toBe(2 * TILE);
  });
});
