import { TILE } from "@larshansen/pixelkit/config";
import type { DoorSpot } from "@larshansen/pixelkit/doors";
import { footOf, tileMap, type District, type Ramp } from "@larshansen/pixelkit/tilemap";

// The world as text, one character per 16 px tile: Vikingfjorden, from the landing stone at the left
// to the beacon rock at the right. Built the same way as the front page's map.
//
//  #  ground     ~  water (not solid; falling in puts him back on the last ground he stood on)
//  P  jetty planks (solid)   K  rock (solid)   B  crate (solid)   _  one-way ledge
//  S  start   i  sign post   e  sheep   0-9  the ten runes, in the order L A R S H A N S E N
//  h  door Hjem   q  door Runesmia   j  door Jernhaugen   v  door Verkstedet
export const MAP = [
  "................................................................................................................................................",
  "................................................................................................................................................",
  "................................................................................................................................................",
  "..............................................................................................................................7.................",
  "................................................................................................................................................",
  "............................................................................................................................_____...............",
  "................................................................................................................................................",
  "......................................3.........................................................................................................",
  "...........................................................................................................................................8....",
  "..................................._______...............................................................................v...................i..",
  "..................1................................................5..................................................KKKKKKKKKKKKK.....KKKKKKKK",
  "........................................................................................6.............................KKKKKKKKKKKKK.....KKKKKKKK",
  "...........................................2.......................................................................KKKKKKKKKKKKKKKK.....KKKKKKKK",
  ".............0..................................4.............................................................9....KKKKKKKKKKKKKKKK.....KKKKKKKK",
  "....................................B................................................B..........................KKKKKKKKKKKKKKKKKKK.....KKKKKKKK",
  "....S.i...h.......e.......i....._____________............e..................i..q....BB........j.................KKKKKKKKKKKKKKKKKKK.....KKKKKKKK",
  "#######################PPPPPP~~~~~~~~~~~~~~~~~~~KK~~~##############################################################################~~~~~########",
  "#######################~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##############################################################################~~~~~########",
  "################################################################################################################################################",
  "################################################################################################################################################"
];

export const COLS = MAP[0].length;
export const ROWS = MAP.length;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;
/** The top of the ground, where he stands on the flat parts. */
export const GROUND_Y = 16 * TILE;
/** Where the water begins: level with the top of the ground, and down to the bed two tiles below. */
export const WATER_Y = GROUND_Y;

// Slopes he can walk, as in the front page's Opera roof: corner points in tile units [column, row]
// of the surface. The longhouse's turf roof, and the burial mound.
const ramp = (...pts: [number, number][]): Ramp => ({ points: pts.map(([c, r]): [number, number] => [c * TILE, r * TILE]) });
export const RAMPS: Ramp[] = [ramp([61, 16], [66, 12], [68, 12], [73, 16]), ramp([96, 16], [102, 13], [104, 13], [110, 16])];

export interface DoorDef {
  id: string;
  /** The letter on the map. */
  tile: string;
  /** The name on the sign above the door, in both languages. */
  sign: string;
  href: string;
}

/** The doors. One table drives the doors in the world and, through the page's links, the header. */
export const DOORS: DoorDef[] = [
  { id: "home", tile: "h", sign: "Hjem", href: "/?from=viking" },
  { id: "qr", tile: "q", sign: "Runesmia", href: "/qr/" },
  // For now the maze's own address; later it becomes a scene in here.
  { id: "maze", tile: "j", sign: "Jernhaugen", href: "https://maze.larshansen.dev/" },
  { id: "github", tile: "v", sign: "Verkstedet", href: "https://github.com/larsekhansen" }
];

export const RUNE_CHARS = "LARSHANSEN";
export const RUNE_COUNT = RUNE_CHARS.length;

/** Where each sign post stands, in map order from left to right. */
export const SIGN_KEYS = ["start", "jetty", "smithy", "beacon"] as const;
export type SignKey = (typeof SIGN_KEYS)[number];

// The place names show in the banner when he walks into each stretch. Names stay Norwegian in both languages.
export const DISTRICTS: District[] = [
  { name: "Landingsplassen", landmark: { nb: "Naustet", en: "The boathouse" }, from: 0 },
  { name: "Fjorden", landmark: { nb: "Langskipet ligger fortøyd", en: "The longship lies moored" }, from: 23 * TILE },
  { name: "Garden", landmark: { nb: "Langhuset", en: "The longhouse" }, from: 53 * TILE },
  { name: "Runesmia", landmark: null, from: 76 * TILE },
  { name: "Jernhaugen", landmark: { nb: "Gravhaugen", en: "The burial mound" }, from: 93 * TILE },
  { name: "Klippen", landmark: { nb: "Stavkirketårnet", en: "The stave church tower" }, from: 111 * TILE },
  { name: "Varden", landmark: null, from: 131 * TILE }
];

/** The map, read by the kit: the world the physics walks, and where everything is. */
export const LEVEL = tileMap({ map: MAP, legend: { solid: "#PKB", oneWay: "_", water: "~" }, ramps: RAMPS, districts: DISTRICTS });
export const WORLD = LEVEL;
export const { tileAt, isSolid, isOneWay, isWater, rampAt, districtAt, spawn: findSpawn } = LEVEL;

export function findDoorSpots(): DoorSpot[] {
  return DOORS.map((d) => {
    const t = LEVEL.find(d.tile)[0];
    if (!t) throw new Error(`The map has no door ${d.id}`);
    return { id: d.id, kind: d.id, sign: d.sign, href: d.href, x: t.c * TILE, bottom: (t.r + 1) * TILE };
  });
}

export interface RuneSpot {
  /** Which of the ten, 0 to 9, and so which letter of the name. */
  index: number;
  char: string;
  /** Top left of its 16 x 16 tile. */
  x: number;
  y: number;
}
export function findRunes(): RuneSpot[] {
  return LEVEL.find((ch) => ch >= "0" && ch <= "9")
    .map((t) => ({ index: +t.ch, char: RUNE_CHARS[+t.ch], x: t.c * TILE, y: t.r * TILE }))
    .sort((a, b) => a.index - b.index);
}

export interface SignSpot {
  key: SignKey;
  /** Centre x and the ground y it stands on. */
  x: number;
  bottom: number;
}
export function findSigns(): SignSpot[] {
  return LEVEL.find("i")
    .sort((a, b) => a.c - b.c)
    .map((t, i) => ({ key: SIGN_KEYS[i], ...footOf(t) }));
}

export interface SheepSpot {
  /** Centre x of the stretch it grazes along, and the ground y it stands on. */
  x: number;
  bottom: number;
}
export function findSheep(): SheepSpot[] {
  return LEVEL.find("e").map(footOf);
}
