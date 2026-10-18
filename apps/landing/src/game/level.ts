import { TILE } from "./config";

// The world as text, one character per 16 px tile. A walk through Gamle Oslo, from the
// wooden houses at Vålerenga and Kampen, past Botanisk hage and the ruins in Gamlebyen,
// down to the Opera in Bjørvika.
//
//   #  ground      B  crates      H  hedge      R  ruin wall
//   _  stone ledge (can be jumped up through)
//   S  start       C Q M T  doors, see DOOR_TILES
export const MAP = [
  "..........................................................................................",
  "..........................................................................................",
  "..........................................................................................",
  "..........................................................................................",
  "..........................................................................................",
  "..........................................................................................",
  "..........................................................................................",
  ".....................................................___..................................",
  ".....................B...................HH.......RR......................................",
  "....S......C........BB..Q.....HH....M....HH.....R.RR......R........T......................",
  "##########################################################################################",
  "##########################################################################################"
];

export const COLS = MAP[0].length;
export const ROWS = MAP.length;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;
export const GROUND_Y = 10 * TILE;

const SOLID = new Set(["#", "B", "H", "R"]);
const ONE_WAY = new Set(["_"]);

export type DoorKind = "home" | "workshop" | "garden" | "library" | "opera";

export const DOOR_TILES: Record<string, { id: string; kind: DoorKind }> = {
  C: { id: "cv", kind: "home" },
  Q: { id: "qr", kind: "workshop" },
  M: { id: "maze", kind: "garden" },
  T: { id: "quintle", kind: "library" }
};

// The Opera roof is a slope you can walk up, so it is a line rather than tiles.
export interface Ramp {
  points: [number, number][];
}
export const RAMPS: Ramp[] = [
  {
    points: [
      [74 * TILE, GROUND_Y],
      [85 * TILE, 6 * TILE],
      [WORLD_W, 6 * TILE]
    ]
  }
];

export interface DoorSpot {
  id: string;
  kind: DoorKind;
  x: number;
  bottom: number;
}

// The door at the top of the Opera's stage tower is the secret.
export const EXTRA_DOORS: DoorSpot[] = [{ id: "opera", kind: "opera", x: 87 * TILE, bottom: 6 * TILE }];

export interface District {
  name: string;
  landmark: { nb: string; en: string } | null;
  from: number;
}
export const DISTRICTS: District[] = [
  { name: "Vålerenga & Kampen", landmark: null, from: 0 },
  { name: "Tøyen", landmark: { nb: "Botanisk hage", en: "The Botanical Garden" }, from: 28 * TILE },
  { name: "Gamlebyen", landmark: { nb: "Middelalderparken", en: "The Medieval Park" }, from: 46 * TILE },
  { name: "Bjørvika", landmark: { nb: "Deichman og Operaen", en: "Deichman and the Opera" }, from: 62 * TILE }
];

/** Where a district starts, so buildings are placed relative to their own part of town. */
export function districtFrom(name: string): number {
  const d = DISTRICTS.find((x) => x.name === name);
  if (!d) throw new Error(`No district called ${name}`);
  return d.from;
}

export function districtAt(x: number): District {
  let found = DISTRICTS[0];
  for (const d of DISTRICTS) if (x >= d.from) found = d;
  return found;
}

export function tileAt(c: number, r: number): string {
  if (c < 0 || c >= COLS || r >= ROWS) return "#";
  if (r < 0) return ".";
  return MAP[r][c];
}

export const isSolid = (c: number, r: number) => SOLID.has(tileAt(c, r));
export const isOneWay = (c: number, r: number) => ONE_WAY.has(tileAt(c, r));

/** Height of the ramp surface at x, or null where there is no ramp. */
export function rampAt(x: number): number | null {
  let best: number | null = null;
  for (const ramp of RAMPS) {
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

export function findSpawn(): { x: number; bottom: number } {
  for (let r = 0; r < ROWS; r++) {
    const c = MAP[r].indexOf("S");
    if (c >= 0) return { x: c * TILE + TILE / 2, bottom: (r + 1) * TILE };
  }
  throw new Error("The map has no start tile");
}

export function findDoorSpots(): DoorSpot[] {
  const spots: DoorSpot[] = [];
  MAP.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const d = DOOR_TILES[ch];
      if (d) spots.push({ id: d.id, kind: d.kind, x: c * TILE, bottom: (r + 1) * TILE });
    })
  );
  return spots.concat(EXTRA_DOORS);
}
