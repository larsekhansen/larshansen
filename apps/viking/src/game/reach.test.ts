import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { COLS, ROWS, findDoorSpots, findRunes, findSheep, findSpawn, isOneWay, isSolid, isWater, rampAt } from "./level";

// A guard against map edits, not a physics proof. It works on tiles: which spots can he stand on,
// and from which spot can a jump of a given reach get to which other spot. The numbers are rounded
// down from what the physics does (one jump lifts him about 46 px, a bit under three tiles).

interface Reach {
  /** Tiles up a jump gets him, and empty columns it carries him across. */
  up: number;
  across: number;
  /** Tiles above a spot at which a rune can still be touched. */
  runeUp: number;
}
const SINGLE: Reach = { up: 2, across: 3, runeUp: 3 };
const DOUBLE: Reach = { up: 5, across: 6, runeUp: 4 };
const SHEEP_UP = 5; // a bounce reaches this many tiles up, straight above the sheep's stretch

interface Spot {
  c: number;
  r: number;
}
const key = (s: Spot) => s.c + "," + s.r;

/** A spot is a free tile with something to stand on right below it. Water is never one. */
function standable(c: number, r: number) {
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  if (isSolid(c, r) || isWater(c, r)) return false;
  return isSolid(c, r + 1) || isOneWay(c, r + 1);
}

/** Every spot, plus one per column along a ramp (its surface is a line, not a tile edge). */
function allSpots(): Spot[] {
  const out: Spot[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) if (standable(c, r)) out.push({ c, r });
    const y = rampAt(c * TILE + TILE / 2);
    if (y !== null) {
      const r = Math.floor((y - 0.01) / TILE);
      if (!isSolid(c, r) && !out.some((s) => s.c === c && s.r === r)) out.push({ c, r });
    }
  }
  return out;
}

/** From a spot you can walk, drop any distance, or jump: to any spot at most `up` higher and
 * `across` empty columns away, as long as no solid tile stands in the columns between at the
 * height of the higher spot. */
function canGo(a: Spot, b: Spot, reach: Reach) {
  if (a.c === b.c) return a.r - b.r <= reach.up; // straight up or down
  if (b.r < a.r - reach.up) return false;
  if (Math.abs(b.c - a.c) - 1 > reach.across) return false;
  const top = Math.min(a.r, b.r);
  const step = b.c > a.c ? 1 : -1;
  for (let c = a.c + step; c !== b.c; c += step) if (isSolid(c, top)) return false;
  return true;
}

function flood(reach: Reach): Spot[] {
  const spots = allSpots();
  const start = findSpawn();
  const from = spots.find((s) => s.c === Math.floor(start.x / TILE) && s.r === start.bottom / TILE - 1);
  if (!from) throw new Error("The start has nothing to stand on");
  const seen = new Set([key(from)]);
  const queue = [from];
  while (queue.length) {
    const a = queue.pop()!;
    for (const b of spots) if (!seen.has(key(b)) && canGo(a, b, reach)) (seen.add(key(b)), queue.push(b));
  }
  return spots.filter((s) => seen.has(key(s)));
}

/**
 * A rune is reachable if it is within `runeUp` rows above (or one row below) and three columns
 * of a reachable spot, or straight above a sheep's stretch within a bounce's reach. Three
 * columns, because a jump from the edge of a crate carries him that far while he rises.
 */
function reachableRunes(reach: Reach): number[] {
  const spots = flood(reach);
  const sheep = findSheep().map((s) => ({ c: Math.floor(s.x / TILE), r: s.bottom / TILE - 1 }));
  return findRunes()
    .filter((rune) => {
      const c = rune.x / TILE;
      const r = rune.y / TILE;
      const byFoot = spots.some((s) => Math.abs(s.c - c) <= 3 && s.r - r <= reach.runeUp && s.r - r >= -1);
      const bySheep = sheep.some((s) => Math.abs(s.c - c) <= 4 && s.r - r <= SHEEP_UP && s.r - r >= 0);
      return byFoot || bySheep;
    })
    .map((r) => r.index);
}

function reachableDoors(reach: Reach): string[] {
  const spots = flood(reach);
  return findDoorSpots()
    .filter((d) => spots.some((s) => s.c === d.x / TILE && s.r === d.bottom / TILE - 1))
    .map((d) => d.id)
    .sort();
}

describe("with one jump", () => {
  test("runes 0, 1, 2, 4, 5, 6 and 9 can be reached, and no others", () => {
    expect(reachableRunes(SINGLE)).toEqual([0, 1, 2, 4, 5, 6, 9]);
  });

  test("all four doors can be reached", () => {
    expect(reachableDoors(SINGLE)).toEqual(["github", "home", "maze", "qr"]);
  });

  test("the yard, the tower's top and the beacon rock cannot", () => {
    const spots = flood(SINGLE);
    const has = (c: number, r: number) => spots.some((s) => s.c === c && s.r === r);
    expect(has(38, 8)).toBe(false); // the yard of the ship
    expect(has(126, 4)).toBe(false); // the top of the church tower
    expect(has(139, 9)).toBe(false); // the beacon rock
    expect(has(36, 13)).toBe(true); // but the crate on the deck can
  });
});

describe("with a double jump", () => {
  test("all ten runes can be reached", () => {
    expect(reachableRunes(DOUBLE)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("the yard, the tower's top and the beacon rock can", () => {
    const spots = flood(DOUBLE);
    const has = (c: number, r: number) => spots.some((s) => s.c === c && s.r === r);
    expect(has(38, 8)).toBe(true);
    expect(has(126, 4)).toBe(true);
    expect(has(139, 9)).toBe(true);
  });
});
