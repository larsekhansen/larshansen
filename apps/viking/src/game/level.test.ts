import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { COLS, DOORS, MAP, RAMPS, ROWS, findDoorSpots, findRunes, findSheep, findSigns, findSpawn, isOneWay, isSolid, rampAt, tileAt } from "./level";

const count = (ch: string) => MAP.join("").split(ch).length - 1;

describe("the map", () => {
  test("is rectangular", () => {
    expect(ROWS).toBe(20);
    expect(COLS).toBe(144);
    for (const row of MAP) expect(row.length).toBe(COLS);
  });

  test("has exactly one start", () => {
    expect(count("S")).toBe(1);
    expect(findSpawn().x).toBe(4 * TILE + TILE / 2);
  });

  test("has each of the ten runes once", () => {
    for (const d of "0123456789") expect(count(d)).toBe(1);
    expect(findRunes().map((r) => r.char).join("")).toBe("LARSHANSEN");
  });

  test("has each door letter once, and the table has a door for each", () => {
    for (const d of DOORS) expect(count(d.tile)).toBe(1);
    expect(findDoorSpots().length).toBe(DOORS.length);
    expect(new Set(DOORS.map((d) => d.id)).size).toBe(DOORS.length);
  });

  test("has four sign posts and two sheep", () => {
    expect(findSigns().length).toBe(4);
    expect(findSheep().length).toBe(2);
  });

  test("every door, sign post, sheep and the start stand on something solid", () => {
    const standing = [...findDoorSpots().map((d) => ({ x: d.x + TILE / 2, bottom: d.bottom })), ...findSigns(), ...findSheep(), findSpawn()];
    for (const s of standing) {
      const c = Math.floor(s.x / TILE);
      const below = s.bottom / TILE;
      expect(isSolid(c, below) || isOneWay(c, below)).toBe(true);
      expect(isSolid(c, below - 1)).toBe(false);
    }
  });

  test("no rune is inside solid ground", () => {
    for (const r of findRunes()) expect(isSolid(r.x / TILE, r.y / TILE)).toBe(false);
  });

  test("the sheep have ground along their whole stretch", () => {
    for (const s of findSheep())
      for (let dx = -64; dx <= 64; dx += 8) expect(isSolid(Math.floor((s.x + dx) / TILE), s.bottom / TILE)).toBe(true);
  });

  test("the ramps start and end at open ground and cover the surface in between", () => {
    for (const ramp of RAMPS) {
      const [first] = ramp.points;
      const last = ramp.points[ramp.points.length - 1];
      expect(rampAt(first[0])).toBe(first[1]);
      expect(rampAt(last[0])).toBe(last[1]);
      expect(rampAt(first[0] - 1)).toBeNull();
      expect(tileAt(first[0] / TILE, first[1] / TILE - 1)).toBe(".");
    }
  });
});
