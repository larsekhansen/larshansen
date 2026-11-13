import { PLAYER, TILE } from "./config";
import type { Body, World } from "./physics";

// One reader for the text maps every side-view scene is drawn from: one character per 16 px tile,
// a legend saying which letters are solid and which can be jumped up through, and slopes as lines.
// Outside the map is ground at the sides and below, and open sky above, so nobody walks off the
// world or bumps his head on the top of the screen.

/** A slope he can walk, such as the Opera roof: corner points of its surface in world pixels. */
export interface Ramp {
  points: [number, number][];
}

/** A stretch of the world with a name, shown in the banner when he walks into it. */
export interface District {
  name: string;
  /** The line under the name, in both languages. */
  landmark: { nb: string; en: string } | null;
  /** World x where it starts. */
  from: number;
}

export interface Legend {
  /** Letters he cannot pass through. */
  solid: string;
  /** Letters that hold him only when he comes down onto them from above. */
  oneWay?: string;
  /** Letters that are water: not solid, and a surface search stops at them. */
  water?: string;
}

export interface TileHit {
  ch: string;
  c: number;
  r: number;
}

export interface TileMap<D extends District = District> extends World {
  /** The map as text, one row per string. */
  map: readonly string[];
  cols: number;
  rows: number;
  /** In world pixels. */
  width: number;
  height: number;
  ramps: readonly Ramp[];
  districts: readonly D[];
  tileAt(c: number, r: number): string;
  isWater(c: number, r: number): boolean;
  /** Every tile with this letter (or for which the test holds), row by row from the top left. */
  find(letter: string | ((ch: string) => boolean)): TileHit[];
  /** The start: the centre x and ground y of the tile marked S. */
  spawn(): { x: number; bottom: number };
  districtAt(x: number): D;
  /** Where a named district starts, so things can be placed relative to their own part of the map. */
  districtFrom(name: string): number;
  /** The y of the first thing to stand on at or below `fromY`, under world x; null when water comes first. */
  surfaceBelow(x: number, fromY: number): number | null;
  /** True when there is ground, a ledge or a slope right under the body's feet. */
  supports(b: Body): boolean;
}

/** Height of the surface of the ramps at x, the highest where they overlap, or null where there is none. */
export function rampHeight(ramps: readonly Ramp[], x: number): number | null {
  let best: number | null = null;
  for (const ramp of ramps) {
    const pts = ramp.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      if (x >= x0 && x <= x1) {
        const y = y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
        if (best === null || y < best) best = y;
      }
    }
  }
  return best;
}

/** The district x falls in: the last one that starts at or before it, or the first. */
export function districtIn<D extends { from: number }>(districts: readonly D[], x: number): D {
  let found = districts[0];
  for (const d of districts) if (x >= d.from) found = d;
  return found;
}

/** The centre x and ground y of a tile, for things that stand on the tile below it. */
export const footOf = (t: { c: number; r: number }) => ({ x: t.c * TILE + TILE / 2, bottom: (t.r + 1) * TILE });

export function tileMap<D extends District = District>(def: { map: readonly string[]; legend: Legend; ramps?: readonly Ramp[]; districts?: readonly D[] }): TileMap<D> {
  const { map, legend } = def;
  const ramps = def.ramps ?? [];
  const districts = def.districts ?? [];
  const cols = map[0].length;
  const rows = map.length;
  const solid = new Set(legend.solid);
  const oneWay = new Set(legend.oneWay ?? "");
  const water = new Set(legend.water ?? "");

  function tileAt(c: number, r: number): string {
    if (c < 0 || c >= cols || r >= rows) return "#";
    if (r < 0) return ".";
    return map[r][c];
  }
  const isSolid = (c: number, r: number) => solid.has(tileAt(c, r));
  const isOneWay = (c: number, r: number) => oneWay.has(tileAt(c, r));
  const isWater = (c: number, r: number) => water.has(tileAt(c, r));
  const rampAt = (x: number) => rampHeight(ramps, x);

  function find(letter: string | ((ch: string) => boolean)): TileHit[] {
    const match = typeof letter === "string" ? (ch: string) => ch === letter : letter;
    const out: TileHit[] = [];
    map.forEach((row, r) => [...row].forEach((ch, c) => match(ch) && out.push({ ch, c, r })));
    return out;
  }

  return {
    map,
    cols,
    rows,
    width: cols * TILE,
    height: rows * TILE,
    ramps,
    districts,
    tileAt,
    isSolid,
    isOneWay,
    isWater,
    rampAt,
    find,
    spawn() {
      const s = find("S")[0];
      if (!s) throw new Error("The map has no start tile");
      return footOf(s);
    },
    districtAt: (x) => districtIn(districts, x),
    districtFrom(name) {
      const d = districts.find((x) => x.name === name);
      if (!d) throw new Error(`No district called ${name}`);
      return d.from;
    },
    surfaceBelow(x, fromY) {
      const ramp = rampAt(x);
      if (ramp !== null && ramp >= fromY - 1) return ramp;
      const c = Math.floor(x / TILE);
      for (let r = Math.max(0, Math.floor(fromY / TILE)); r < rows; r++) {
        if (isWater(c, r)) return null;
        if (isSolid(c, r) || isOneWay(c, r)) return r * TILE;
      }
      return null;
    },
    supports(b) {
      const cx = b.x + PLAYER.w / 2;
      const feet = b.y + PLAYER.h;
      const ramp = rampAt(cx);
      if (ramp !== null && Math.abs(ramp - feet) < 1.5) return true;
      const c = Math.floor(cx / TILE);
      const r = Math.round(feet / TILE);
      return Math.abs(feet - r * TILE) < 0.01 && (isSolid(c, r) || isOneWay(c, r));
    }
  };
}
