import { TILE } from "./config";

// The world as text, one character per 16 px tile. A walk through Gamle Oslo,
// from the wooden houses at Kampen down to the Opera in Bjørvika.
//
//   #  ground           H  hedge             R  ruin wall
//   ~  market awning    _  stone ledge       (both can be jumped up through)
//   S  start            C M Q T  doors, see DOOR_TILES
export const MAP = [
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "................................................................___.................................",
  ".................................HH.....~~~.......~~~........RR.....................................",
  "....S......C..........HH....M....HH...........Q...........R..RR......R.......T......................",
  "####################################################################################################",
  "####################################################################################################"
];

export const COLS = MAP[0].length;
export const ROWS = MAP.length;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;
export const GROUND_Y = 10 * TILE;

const SOLID = new Set(["#", "H", "R"]);
const ONE_WAY = new Set(["~", "_"]);

export type DoorKind = "home" | "garden" | "basar" | "library" | "opera";

export const DOOR_TILES: Record<string, { id: string; kind: DoorKind }> = {
  C: { id: "cv", kind: "home" },
  M: { id: "maze", kind: "garden" },
  Q: { id: "qr", kind: "basar" },
  T: { id: "quintle", kind: "library" }
};

// The Opera roof is a slope you can walk up, so it is a line rather than tiles.
export interface Ramp {
  points: [number, number][];
}
export const RAMPS: Ramp[] = [
  {
    points: [
      [84 * TILE, GROUND_Y],
      [95 * TILE, 6 * TILE],
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
export const EXTRA_DOORS: DoorSpot[] = [{ id: "opera", kind: "opera", x: 97 * TILE, bottom: 6 * TILE }];

export interface District {
  name: string;
  landmark: { nb: string; en: string } | null;
  from: number;
}
export const DISTRICTS: District[] = [
  { name: "Kampen", landmark: null, from: 0 },
  { name: "Tøyen", landmark: { nb: "Botanisk hage", en: "The Botanical Garden" }, from: 20 * TILE },
  { name: "Grønland", landmark: { nb: "Grønland Basar", en: "Grønland Basar" }, from: 38 * TILE },
  { name: "Gamlebyen", landmark: { nb: "Middelalderparken", en: "The Medieval Park" }, from: 56 * TILE },
  { name: "Bjørvika", landmark: { nb: "Deichman og Operaen", en: "Deichman and the Opera" }, from: 72 * TILE }
];

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
