import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { TILE } from "./config";
import { COLS, DISTRICTS, DOOR_TILES, EXTRA_DOORS, MAP, findDoorSpots, findSpawn, isSolid, rampAt } from "./level";

describe("the map", () => {
  test("every row is the same width", () => {
    for (const row of MAP) expect(row.length).toBe(COLS);
  });

  test("there is one start", () => {
    expect(MAP.join("").split("S").length - 1).toBe(1);
    expect(findSpawn().bottom).toBe(10 * TILE);
  });

  test("every door stands on something", () => {
    for (const d of findDoorSpots()) {
      const onTiles = isSolid(Math.floor(d.x / TILE), d.bottom / TILE);
      const onRamp = rampAt(d.x + TILE / 2) === d.bottom;
      expect(onTiles || onRamp).toBe(true);
    }
  });

  test("nothing solid stands in a doorway", () => {
    for (const d of findDoorSpots()) {
      const c = Math.floor(d.x / TILE);
      for (let r = d.bottom / TILE - 2; r < d.bottom / TILE; r++) expect(isSolid(c, r)).toBe(false);
    }
  });

  test("districts run from west to east", () => {
    const starts = DISTRICTS.map((d) => d.from);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });
});

describe("the page and the map agree", () => {
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  const linked = [...html.matchAll(/data-door="([^"]+)"/g)].map((m) => m[1]).sort();
  const houses = Object.values(DOOR_TILES)
    .map((d) => d.id)
    .sort();

  test("every house has a link in the header, and every link has a house", () => {
    expect(linked).toEqual(houses);
  });

  test("the secret is not in the header", () => {
    for (const d of EXTRA_DOORS) expect(linked).not.toContain(d.id);
  });
});
