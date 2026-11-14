import { TILE } from "@larshansen/pixelkit/config";

// The maps of the mound, as text. `#` wall, `.` floor, `S` start pad (2 x 2), `F` finish (2 x 2), `o` standing
// stone, `k` rune key, `g` iron gate (wall until the key is taken), `c` crumbling floor, and the teleport
// stones, two letters per pair: `t` and its twin `u`, `v` and its twin `w`.
// The edge of the map counts as wall: columns and rows outside it are solid.

export const COLS = 32;
export const ROWS = 20;
export { TILE };

/** Teleport stones come in pairs, each pair with its own two letters. Stepping onto one moves him to its twin. */
export const PORTAL_PAIRS: readonly (readonly [string, string])[] = [
  ["t", "u"],
  ["v", "w"]
];

/** A snake patrols the line between two tile centres, there and back once per `period` steps. */
export interface SnakeDef {
  from: [number, number];
  to: [number, number];
  period: number;
}

/**
 * A block of wall that comes and goes. With t = (steps + offset) % period it is wall while
 * t < period / 2 and floor otherwise. `at` is its top left tile, `w` and `h` its size in tiles.
 */
export interface SliderDef {
  at: [number, number];
  w: number;
  h: number;
  period: number;
  offset: number;
}

export interface LevelDef {
  name: string;
  /**
   * Par in seconds: the scripted player's clear at key speed, times 1.6, rounded to 5 s
   * (`play.test.ts` checks that it still is). Clearing under it is the third mark.
   */
  par: number;
  map: readonly string[];
  snakes: readonly SnakeDef[];
  sliders: readonly SliderDef[];
  /** Dark levels show only a circle round him (and round lit stones and the finish). */
  dark?: boolean;
}

export const LEVELS: readonly LevelDef[] = [
  {
    name: "Inngangen",
    par: 25,
    snakes: [],
    sliders: [],
    map: [
      "################################",
      "################################",
      "################################",
      "################################",
      "#####..................#########",
      "#####..................#########",
      "#####..##############..#########",
      "#####..##############..#########",
      "#####..##############..#########",
      "#####..######o.........#########",
      "#####..######..........#########",
      "#####..######.##################",
      "#####..######.########......####",
      "#####..######.########......####",
      "#......######..........####.....",
      "#......######..........####.....",
      "#.SS.######################..FF.",
      "#.SS.######################..FF.",
      "#....######################.....",
      "################################"
    ]
  },
  {
    name: "Ormegropa",
    // Par needs the teleport: the long way round is 23 s even for the scripted player.
    par: 25,
    snakes: [
      { from: [8, 7], to: [16, 7], period: 300 },
      { from: [27, 7], to: [18, 7], period: 300 },
      { from: [14, 15], to: [14, 16], period: 110 },
      { from: [22, 16], to: [22, 15], period: 110 }
    ],
    sliders: [],
    map: [
      "################################",
      "################################",
      "#............................###",
      "#.##..........................##",
      "#.##########################..##",
      "#..#########################o.##",
      "#..###........................##",
      "#..###........................##",
      "#..###.......................###",
      "#..###.######.########.#########",
      "#..###.######t########.#########",
      "#..###.#########################",
      "#..###o#########################",
      "#..###.#########################",
      "#....#.####################.....",
      "#....#..........................",
      "#.SS.#.......................FF.",
      "#.SS.#############u########..FF.",
      "#....######################.....",
      "################################"
    ]
  },
  {
    name: "Jernporten",
    par: 30,
    snakes: [],
    sliders: [],
    map: [
      "################################",
      "################################",
      "#...........######........##....",
      "##..###......####....###..###..#",
      "##..###..##..###......##...##..#",
      "##..###..##..###..##..##...##..#",
      "##..###..##..###.####.##....#..#",
      "##..###..##..##..####..#....#..#",
      "##..###..o..###..####..#..#....#",
      "##..###....####..####..#..#....#",
      "##..###....####k.####..#..##...#",
      "##..###....####..####..#..##...#",
      "##..###....####..####..#..##...#",
      "##..###..#..####.####.##..###gg#",
      "##..###..#..####..##..##..###...",
      "#....##..##..###......##..###...",
      "#.SS.#...##...###....###..##.FF.",
      "#.SS.#...###........###....#.FF.",
      "##..#########################..#",
      "################################"
    ]
  },
  {
    name: "Råttent gulv",
    par: 15,
    snakes: [],
    sliders: [],
    map: [
      "################################",
      "################################",
      "###########################....#",
      "########..ccccc############.FF.#",
      "########..###############...FF.#",
      "########..ccccccc.....ccc......#",
      "########..#######.....ccc..#####",
      "###################c############",
      "###################c############",
      "###################c############",
      "###################c############",
      "###################c############",
      "###################c############",
      "###################c############",
      "#....############....###########",
      "#.SS.############....###########",
      "#.SS......ccccccc.o..###########",
      "#.........ccccccc....###########",
      "#################....###########",
      "################################"
    ]
  },
  {
    name: "Skyveveggene",
    // Par needs the teleport, reached from beside the groove of the slider (the twin stands a tile
    // clear of the slider, so arriving and pressing down never meets it; that makes it a little quicker).
    par: 20,
    snakes: [],
    sliders: [
      { at: [9, 2], w: 1, h: 2, period: 180, offset: 0 },
      { at: [20, 2], w: 1, h: 2, period: 180, offset: 90 },
      { at: [27, 5], w: 2, h: 1, period: 160, offset: 40 },
      { at: [18, 7], w: 1, h: 2, period: 140, offset: 0 },
      { at: [12, 7], w: 1, h: 2, period: 140, offset: 70 },
      { at: [11, 12], w: 1, h: 2, period: 120, offset: 0 },
      { at: [18, 12], w: 1, h: 2, period: 120, offset: 60 }
    ],
    map: [
      "################################",
      "################################",
      "##.............o.............###",
      "##...........................###",
      "##..#######################..###",
      "##..#######################..###",
      "##..#########t#############..###",
      "##..###......................###",
      "##..###......................###",
      "##..###..#######################",
      "##..###..#######################",
      "##..###..#######################",
      "##..###........o.......#########",
      "##..###................#########",
      "#....################..####....#",
      "#.SS.################.......FF.#",
      "#.SS.################.......FF.#",
      "#....######################....#",
      "##############################u#",
      "################################"
    ]
  },
  {
    name: "Mørket",
    par: 15,
    dark: true,
    snakes: [],
    sliders: [],
    map: [
      "################################",
      "################################",
      "##..###########........#####..##",
      "##..###########........#####..##",
      "##..........o....####..#####..##",
      "##...............####..#####..##",
      "########..#####..##...........##",
      "########..#####..##...........##",
      "########..##.....##..###..######",
      "########..##.....##..###..######",
      "##........##..#####..###..######",
      "##........##..#####..###......##",
      "##..########..#####..###......##",
      "##..########....o....#######..##",
      "#....#######.........######....#",
      "#.SS.#######..#############.FF.#",
      "#.SS.##.......#############.FF.#",
      "#....##.......#############....#",
      "################################",
      "################################"
    ]
  },
  {
    name: "Haugbonden",
    par: 35,
    snakes: [
      // They cross the hall, so there is no lane to slip past them in: he has to time each one.
      { from: [10, 7], to: [10, 8], period: 110 },
      { from: [12, 8], to: [12, 7], period: 110 },
      { from: [19, 7], to: [19, 8], period: 120 },
      { from: [21, 8], to: [21, 7], period: 120 }
    ],
    sliders: [{ at: [26, 12], w: 1, h: 2, period: 150, offset: 0 }],
    map: [
      "################################",
      "################################",
      "###########################....#",
      "###k....###################.FF.#",
      "###.....###################.FF.#",
      "######..###################....#",
      "######..####################gg##",
      "######...................###..##",
      "######...................###..##",
      "###############.#######..###..##",
      "###############.#######..###..##",
      "###############.#######..###..##",
      "###############.####o.........##",
      "###############.####..........##",
      "#....#########...###############",
      "#.SS.#########...###############",
      "#.SS.....ccccc.o.###############",
      "#........ccccc...###############",
      "##############...###############",
      "################################"
    ]
  }
];

/** The tile at column `c`, row `r`; anything outside the map is wall. */
export function tileAt(map: readonly string[], c: number, r: number): string {
  if (c < 0 || r < 0 || r >= map.length) return "#";
  return map[r][c] ?? "#";
}

export const isWall = (map: readonly string[], c: number, r: number) => tileAt(map, c, r) === "#";

export interface Cell {
  c: number;
  r: number;
}

/** Every tile with the letter `ch`, row by row. */
export function findTiles(map: readonly string[], ch: string): Cell[] {
  const out: Cell[] = [];
  map.forEach((row, r) => [...row].forEach((x, c) => x === ch && out.push({ c, r })));
  return out;
}

/** The top left tile of a 2 x 2 area of `ch`. */
function corner(map: readonly string[], ch: string): Cell {
  const first = findTiles(map, ch)[0];
  if (!first) throw new Error(`The map has no ${ch}`);
  return first;
}

export const startOf = (map: readonly string[]) => corner(map, "S");
export const finishOf = (map: readonly string[]) => corner(map, "F");

/** The centre of the start pad in art pixels, where he stands when the level begins. */
export function startCentre(map: readonly string[]) {
  const s = startOf(map);
  return { x: (s.c + 1) * TILE, y: (s.r + 1) * TILE };
}

/** The centre of a tile in art pixels. */
export const centreOf = (c: number, r: number) => ({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 });

/** A teleport stone: where it is, where its twin is, and which pair it belongs to. */
export interface Portal extends Cell {
  twin: Cell;
  pair: number;
}

/** What the rules look up on every step, found once per map. */
export interface MapInfo {
  start: Cell;
  finish: Cell;
  key: Cell | null;
  portals: Portal[];
}

const infos = new WeakMap<readonly string[], MapInfo>();

/** The start, finish, key and teleport stones of a map, looked up once and kept. */
export function mapInfo(map: readonly string[]): MapInfo {
  let info = infos.get(map);
  if (info) return info;
  const portals: Portal[] = [];
  PORTAL_PAIRS.forEach(([a, b], pair) => {
    const one = findTiles(map, a);
    const two = findTiles(map, b);
    if (one.length !== 1 || two.length !== 1) return; // a pair needs both ends (levels.test.ts checks every map)
    portals.push({ ...one[0], twin: two[0], pair }, { ...two[0], twin: one[0], pair });
  });
  info = { start: startOf(map), finish: finishOf(map), key: findTiles(map, "k")[0] ?? null, portals };
  infos.set(map, info);
  return info;
}

/** The teleport stone at tile (c, r), if there is one. */
export const portalAt = (map: readonly string[], c: number, r: number) => mapInfo(map).portals.find((p) => p.c === c && p.r === r);

/**
 * The wall the raven sits on: the wall tile with floor right below it that is nearest the start
 * pad. Ties go to the left one, so the choice is the same every visit.
 */
export function ravenTile(map: readonly string[]): Cell {
  const pad = startCentre(map);
  let best: Cell | null = null;
  let bestD = Infinity;
  for (let r = 0; r < map.length; r++)
    for (let c = 0; c < COLS; c++) {
      if (!isWall(map, c, r) || isWall(map, c, r + 1)) continue;
      const d = Math.hypot(c * TILE + TILE / 2 - pad.x, r * TILE + TILE / 2 - pad.y);
      if (d < bestD - 1e-9) {
        bestD = d;
        best = { c, r };
      }
    }
  return best ?? { c: 0, r: 0 };
}
