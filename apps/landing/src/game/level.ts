import { TILE } from "@larshansen/pixelkit/config";
import type { DoorSpot } from "@larshansen/pixelkit/doors";
import { tileMap, type District, type Ramp } from "@larshansen/pixelkit/tilemap";

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

export type DoorKind = "home" | "workshop" | "garden" | "library" | "opera";

export const DOOR_TILES: Record<string, { id: string; kind: DoorKind }> = {
  C: { id: "cv", kind: "home" },
  Q: { id: "qr", kind: "workshop" },
  M: { id: "maze", kind: "garden" },
  T: { id: "quintle", kind: "library" }
};

// The Opera roof is a slope you can walk up, so it is a line rather than tiles.
export const RAMPS: Ramp[] = [
  {
    points: [
      [74 * TILE, GROUND_Y],
      [85 * TILE, 6 * TILE],
      [WORLD_W, 6 * TILE]
    ]
  }
];

// The door at the top of the Opera's stage tower is the secret. It leads to the viking game
// (apps/viking), which is deliberately not listed in the header.
export const EXTRA_DOORS: DoorSpot<DoorKind>[] = [
  { id: "opera", kind: "opera", x: 87 * TILE, bottom: 6 * TILE, href: "/viking/?from=oslo", name: "Vikingfjorden", secret: true }
];

export const DISTRICTS: District[] = [
  { name: "Vålerenga & Kampen", landmark: null, from: 0 },
  { name: "Tøyen", landmark: { nb: "Botanisk hage", en: "The Botanical Garden" }, from: 28 * TILE },
  { name: "Gamlebyen", landmark: { nb: "Middelalderparken", en: "The Medieval Park" }, from: 46 * TILE },
  { name: "Bjørvika", landmark: { nb: "Deichman og Operaen", en: "Deichman and the Opera" }, from: 62 * TILE }
];

/** The map, read by the kit: the world the physics walks, and where everything is. */
export const LEVEL = tileMap({ map: MAP, legend: { solid: "#BHR", oneWay: "_" }, ramps: RAMPS, districts: DISTRICTS });
export const WORLD = LEVEL;
export const { tileAt, isSolid, isOneWay, rampAt, districtAt, districtFrom, spawn: findSpawn } = LEVEL;

export function findDoorSpots(): DoorSpot<DoorKind>[] {
  return LEVEL.find((ch) => ch in DOOR_TILES)
    .map((t) => ({ ...DOOR_TILES[t.ch], x: t.c * TILE, bottom: (t.r + 1) * TILE }))
    .concat(EXTRA_DOORS);
}
