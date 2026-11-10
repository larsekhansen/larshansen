// Single source of truth for the level: dimensions, tuning, geometry, doors
// and collectibles. Pure data — no Pixi, no DOM — so tests and the HTML nav
// can import it freely. See docs/DESIGN.md.

export const VIEW_H = 600; // logical units; the canvas scales to fit
export const MIN_VIEW_W = 420; // narrow screens zoom out to keep this much
export const WORLD_W = 3600;
export const GROUND_Y = 500;
export const WATER_Y = 540;
export const KILL_Y = 660; // below this the player has fallen in the fjord

export const PLAYER_W = 26;
export const PLAYER_H = 50;
export const SPAWN = { x: 200, y: GROUND_Y - PLAYER_H };

export const PHYS = {
  runSpeed: 270,
  groundAccel: 2400,
  airAccel: 1700,
  friction: 2800,
  gravity: 2000,
  fallGravityMul: 1.3,
  jumpSpeed: 700,
  doubleJumpSpeed: 600,
  jumpCut: 0.45,
  coyote: 0.1,
  buffer: 0.12,
  maxFall: 900,
  step: 1 / 120
} as const;

export type BlockKind = "ground" | "ledge" | "island";

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BlockKind;
}

const ground = (x: number, w: number): Block => ({ x, y: GROUND_Y, w, h: 240, kind: "ground" });
const island = (x: number, y: number, w: number): Block => ({ x, y, w, h: 14, kind: "island" });

export const BLOCKS: Block[] = [
  ground(-400, 1400), // spawn meadow, up to the fjord at x=1000
  ground(1420, 580), // middle shore, 1420–2000
  ground(2140, 1900), // far shore to the end of the world
  { x: 1600, y: 420, w: 220, h: 80, kind: "ledge" }, // Runesmia sits on this

  island(420, 400, 110),
  island(560, 310, 110),
  island(1090, 400, 90), // stepping stones over the fjord
  island(1250, 360, 90),
  island(1900, 400, 110), // the climb
  island(2040, 320, 110),
  island(2200, 240, 120),
  island(2380, 170, 140),
  island(2520, 290, 100),
  island(3000, 390, 100),
  island(3130, 300, 100)
];

export const SHIP = { minX: 1020, maxX: 1250, y: 492, w: 150, speed: 70 };

export interface DoorDef {
  id: string;
  /** In-world sign text (Norwegian flavour). */
  name: string;
  /** Plain label for the HTML nav. */
  label: string;
  blurb: string;
  href: string;
  rune: RuneChar;
  x: number;
  y: number; // y of the doorstep
  color: number;
}

export const DOORS: DoorDef[] = [
  {
    id: "home",
    name: "Hjem",
    label: "Gamle Oslo",
    blurb: "Back to the front page",
    href: "/",
    rune: "S",
    x: 760,
    y: GROUND_Y,
    color: 0x4cc9f0
  },
  {
    id: "qr",
    name: "Runesmia",
    label: "QR-verkstedet",
    blurb: "QR code generator",
    href: "/qr/",
    rune: "R",
    x: 1710,
    y: 420,
    color: 0xffd166
  },
  {
    id: "maze",
    name: "Labyrinten",
    label: "Iron Maze",
    blurb: "A maze game",
    href: "https://maze.larshansen.dev",
    rune: "L",
    x: 2680,
    y: GROUND_Y,
    color: 0x80ed99
  },
  {
    id: "github",
    name: "Verkstedet",
    label: "GitHub",
    blurb: "Source code",
    href: "https://github.com/larsekhansen",
    rune: "H",
    x: 3250,
    y: GROUND_Y,
    color: 0xc77dff
  }
];

// Elder Futhark, as strokes in a 1×1 box so no runic font is needed.
export type RuneChar = "L" | "A" | "R" | "S" | "H" | "N" | "E";
type Stroke = [number, number][];

export const RUNE_STROKES: Record<RuneChar, Stroke[]> = {
  L: [
    [[0.35, 0], [0.35, 1]],
    [[0.35, 0], [0.78, 0.36]]
  ],
  A: [
    [[0.3, 0], [0.3, 1]],
    [[0.3, 0], [0.76, 0.3]],
    [[0.3, 0.3], [0.76, 0.6]]
  ],
  R: [
    [[0.27, 0], [0.27, 1]],
    [[0.27, 0], [0.72, 0.25], [0.27, 0.5], [0.76, 1]]
  ],
  S: [[[0.7, 0], [0.3, 0.34], [0.7, 0.62], [0.3, 1]]],
  H: [
    [[0.25, 0], [0.25, 1]],
    [[0.75, 0], [0.75, 1]],
    [[0.25, 0.36], [0.75, 0.64]]
  ],
  N: [
    [[0.5, 0], [0.5, 1]],
    [[0.24, 0.34], [0.76, 0.66]]
  ],
  E: [[[0.2, 1], [0.2, 0], [0.5, 0.36], [0.8, 0], [0.8, 1]]]
};

/** The ten collectibles spell the name. */
export const RUNES: { char: RuneChar; x: number; y: number }[] = [
  { char: "L", x: 330, y: 440 },
  { char: "A", x: 615, y: 255 },
  { char: "R", x: 900, y: 375 },
  { char: "S", x: 1295, y: 305 },
  { char: "H", x: 1170, y: 462 },
  { char: "A", x: 1710, y: 295 },
  { char: "N", x: 2070, y: 440 },
  { char: "S", x: 2450, y: 110 },
  { char: "E", x: 3180, y: 240 },
  { char: "N", x: 3500, y: 440 }
];
export const ALL_RUNES_MASK = (1 << RUNES.length) - 1;

export const SHEEP = [
  { minX: 430, maxX: 660 },
  { minX: 2820, maxX: 3120 }
];

export const SIGNS = [
  { x: 95, y: GROUND_Y, lines: ["Velkommen!", "← → move · Space jump", "↑ enter a door"] },
  { x: 965, y: GROUND_Y, lines: ["Fjorden", "wait for the ship"] }
];
