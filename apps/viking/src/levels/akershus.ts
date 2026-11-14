import { TILE } from "@larshansen/pixelkit/config";
import { barcode, munch } from "@larshansen/pixelkit/landmarks";
import { R, layerX, light, mix, stoneColumn, view } from "@larshansen/pixelkit/paint";
import { FIRE, GLASS, INK, METAL, PAINT, PALETTE, PARADE, PLANTS, ROOF, SKIN, SNOW, STONE, STONE_BACK, WHITE, type Stone } from "@larshansen/pixelkit/palette";
import { STONE_LEDGE, flagCloth, type LedgeLook } from "@larshansen/pixelkit/props";
import type { Enemy, EnemyDef } from "../game/enemies";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 2, rune A: Akershus festning, the fortress above the harbour. Its idea is the cannon.
//
// Teach: up the outer wall on stone ledges and ivy, past a brazier on the rampart (the first thing
// that hurts to land on, on its own), into the first cannon, which cannot miss, onto the gate tower
// and the first flag. Practise: the wall-walk over the inner ward with a guard on it, a cannon over
// the ward to a higher wall, another over the dry ditch; a fall only lands him in the ward or the
// ditch, with ledges back up, a bench by the well, and the well itself goes down to a cellar with the
// brown cheese. Twist: the moat, where a hoist goes up and down through the cannon's line of fire,
// and the saluting battery, three cannons in a row on piers in the harbour, each firing him into the
// next. Set piece: the keep, a climb inside past its guard, out on its top floor beside the copper
// spire, rune A. The bracteate is on the spire's tip.
//
//   Q  quay   W  fortress stone   #  grass and earth   _  stone ledge   =  ivy   -  copper   ~  water
//   c  a cannon facing right   f  a flag   b  a bench   e  a sheep   $  skilling   &  cheese   t T-banen

const COLS = 280;
const ROWS = 40;
/** The water line and the ward's ground; the rampart; the gate tower and the first wall-walk; the walls after; the keep's top floor and the battlements. */
const G = 35;
const RAMP = 26;
const GATE = 22;
const WALL = 20;
const TOP = 6;
/** The top of the turret over the moat. */
const TURRET = 14;
/** The keep's left and right walls, and the copper spire's column. */
const KEEP = [216, 231] as const;
/** The keep's floor inside: two steps down from the wall he comes in from. */
const KEEP_FLOOR = 22;
const SPIRE = 262;
const b = mapBuilder(COLS, ROWS);

// --- The quay and the outer wall --------------------------------------------------------------------------
b.fill(0, 3, G, G + 1, "~").ground(0, 3, G + 2);
b.ground(4, 29, G, "Q");
// A stack of cannonballs' crates on the quay: the first jump.
b.put(16, G - 1, "B").put(17, G - 1, "B").put(17, G - 2, "B").put(20, G - 1, "B");
b.ground(30, 45, RAMP, "W");
b.run(28, 29, RAMP + 1, "_").run(28, 29, RAMP + 3, "_").run(28, 29, RAMP + 5, "=").run(28, 29, RAMP + 7, "_");
b.run(46, 47, RAMP + 1, "_").run(46, 47, RAMP + 3, "_").run(46, 47, RAMP + 5, "_").run(46, 47, RAMP + 7, "_");
b.ground(46, 51, G);
b.ground(52, 56, GATE, "W");

// --- The inner ward: the wall-walk with gaps, the ward below, the well and its cellar ----------------------
b.ground(57, 133, G);
b.run(57, 58, GATE, "_").run(59, 61, GATE, "W").run(64, 68, GATE, "W").run(72, 84, GATE, "W");
for (let r = GATE + 1; r < G; r += 2) b.run(57, 58, r, "_");
// The well: a shaft down from the ward to a cellar, a ledge under the shaft to climb out by.
b.fill(67, 68, G, G, ".").fill(62, 70, G + 1, G + 2, ".");
b.run(67, 68, G + 2, "_");
// The wall-walk ends: down into the ward, and the second cannon on the ward's ground fires him up onto
// the higher wall, which has ledges up its face from the ward; its wall-walk on pillars over the ward,
// with two gaps; ledges up from the ward at its far end too.
b.run(98, 104, WALL, "W").run(107, 112, WALL, "W").run(116, 122, WALL, "W");
b.ground(98, 99, WALL, "W");
for (let r = WALL + 1; r < G; r += 2) b.run(96, 97, r, "_").run(123, 124, r, "_");
// The dry ditch, and the wall on its far side with ledges up its face; a turret on it, two ledges up its
// side, and the moat's cannon on its top.
b.ground(134, 144, WALL, "W");
for (let r = WALL + 1; r < G; r += 2) b.run(132, 133, r, "_");
b.ground(140, 144, TURRET, "W");
b.run(138, 139, WALL - 2, "_").run(138, 139, WALL - 4, "_");

// --- The moat with its hoist, the bastion, the harbour with two piers, the last wall ----------------------
b.fill(145, 156, G, G + 1, "~").ground(145, 156, G + 2);
b.ground(157, 164, WALL, "W");
b.fill(165, KEEP[0] - 1, G, G + 1, "~").ground(165, KEEP[0] - 1, G + 2);
b.ground(172, 173, WALL, "W").ground(181, 182, WALL, "W");
b.ground(190, 202, WALL, "W").ground(205, KEEP[0] - 1, WALL, "W");

// --- The keep: its base, the wall over its door, six ledges up inside, the top floor ---------------------
b.ground(KEEP[0], KEEP[1], KEEP_FLOOR, "W");
b.ground(KEEP[0], KEEP[0], WALL, "W");
b.fill(KEEP[0], KEEP[0], TOP + 1, WALL - 3, "W").fill(KEEP[1], KEEP[1], TOP + 1, KEEP_FLOOR - 1, "W");
for (let r = KEEP_FLOOR - 2, k = 0; r > TOP; r -= 2, k++) b.run(k % 2 ? 219 : 224, k % 2 ? 222 : 227, r, "_");
b.run(KEEP[0], KEEP[1], TOP, "_");
// --- The battlements east of the keep, over the castle's slate roofs, to the spire's turret ---------------
// Two of its towers stand too tall to jump: down through the gap before each onto the roof, under the
// walk, and up through the gap after it.
b.run(232, 234, TOP, "W").run(237, 240, TOP, "W").run(243, 246, TOP, "W").run(249, 252, TOP, "W").run(255, 266, TOP, "W");
b.fill(238, 239, TOP - 3, TOP - 1, "W").fill(250, 251, TOP - 3, TOP - 1, "W");
b.run(232, 266, TOP + 2, "^");
b.ground(232, 266, TOP + 3, "W");
b.run(SPIRE - 1, SPIRE, 2, "-");
// Beyond the turret, the hill.
b.ground(267, COLS - 1, WALL + 4);

// Marks: the start, doors, signs, flags, benches, cannons, the sheep, the rune, the bracteate, the cheese.
b.put(5, G - 1, "t").put(7, G - 1, "S").put(11, G - 1, "i");
b.put(42, RAMP - 1, "c").put(54, GATE - 1, "f");
b.put(88, G - 1, "b").put(75, G - 1, "e").put(91, G - 1, "c");
b.put(122, WALL - 1, "c").put(136, WALL - 1, "f").put(141, TURRET - 1, "i").put(143, TURRET - 1, "c");
b.put(159, WALL - 1, "f").put(161, WALL - 1, "i").put(163, WALL - 1, "c").put(172, WALL - 1, "c").put(181, WALL - 1, "c");
b.put(194, WALL - 1, "f").put(209, WALL - 2, "b").put(211, WALL - 1, "i");
b.run(208, 210, WALL - 1, "_");
b.put(SPIRE + 3, TOP - 2, "r").put(SPIRE - 1, 1, "o").put(63, G + 2, "&");

// Skilling: up the outer wall, over the brazier, along each cannon's arc, over the gaps and the guards,
// the ward and the ladder, the cellar, over the braziers, up the keep, the battlements, the spire's tip.
// Rows below are counted from the old map, four rows higher; `D` puts them where they are now.
const D = 4;
const LOW: [number, number][] = [
  [16, 28], [23, 27],
  [28, 28], [29, 26], [28, 24],

  [63, 16], [65, 15], [67, 15], [69, 16], [70, 15], [71, 16],
  [58, 22], [58, 26],
  [64, 33], [65, 33], [69, 33],
  [76, 15], [77, 14], [78, 15], [81, 15], [82, 14],
  [105, 14], [106, 14], [109, 13], [110, 12], [111, 13], [113, 14], [115, 14],
  [118, 14], [119, 13], [120, 14],
  [127, 8], [129, 7], [131, 7],
  [167, 10], [169, 10], [176, 10], [178, 10], [185, 9], [187, 9],
  [196, 15], [197, 15], [203, 14], [204, 14],
  [212, 14], [213, 13], [214, 14]
];
const COINS: [number, number][] = [
  ...LOW.map(([c, r]): [number, number] => [c, r + D]),
  [29, 26], [34, 24], [35, 23], [36, 24],
  [46, 18], [48, 17], [50, 17],
  [94, 23], [95, 20], [96, 18], [98, 17],
  [147, 5], [150, 3], [152, 5],
  [225, 19], [220, 17], [225, 15], [220, 13], [225, 11], [220, 9], [225, 7],
  [236, 7], [238, 7], [239, 7], [241, 5], [242, 5],
  [248, 7], [250, 7], [251, 7], [253, 5], [254, 5],
  [SPIRE, 1]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

const P = PALETTE;
const WATER = G * TILE;

/** Ivy on the wall: leaves you can climb, as a ledge you jump up through. */
const IVY: LedgeLook = { body: PLANTS.hedge, top: PLANTS.hedgeTop, edge: PLANTS.hedgeDark, joint: PLANTS.hedgeLight };
/** The castle's slate roof under the battlements: he can land on it, and walk under the merlons. */
const SLATE: LedgeLook = { body: ROOF.slate, top: mix(ROOF.slate, WHITE, 0.2), edge: INK, joint: ROOF.slate };
/** The tip of the copper spire: a little walk round its finial. */
const COPPER: LedgeLook = { body: METAL.copper, top: METAL.copperLight, edge: METAL.copperDark, joint: METAL.copperDark };

/** The hoist over the moat: up into the fourth cannon's line of fire and down into the water, solid underneath. */
export const HOIST = { kind: "lift" as const, x: 148 * TILE, top: 64, bottom: WATER + 10, w: 3 * TILE, speed: 2, wait: 60, under: 6 };

/**
 * The cannons, left to right: onto the gate tower; over the ward to the higher wall; over the ditch;
 * over the moat; and the saluting battery, three on piers, each firing him into the next.
 */
export const CANNONS = [
  { vx: 3.5, vy: 8 },
  { vx: 2.3, vy: 12 },
  { vx: 3.4, vy: 8 },
  { vx: 2.85, vy: 9 },
  { vx: 3.05, vy: 6 },
  { vx: 3.05, vy: 6 },
  { vx: 3.5, vy: 7 }
];
/** The saluting battery: which cannons, by their place in the list. */
export const BATTERY = [4, 5, 6];

// --- Enemies: a brazier on its own, guards on the walls, crows over the gaps, rats in the ward ------------
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "guard", c: 23, r: G - 1, range: 2, speed: 0.3, w: 10, h: 14 },
  { kind: "spiky", look: "brazier", c: 35, r: RAMP - 1, speed: 0, w: 10, h: 12 },
  { kind: "flyer", look: "crow", c: 66, r: GATE - 3, range: 1, rise: 6, period: 150 },
  { kind: "walker", look: "guard", c: 77, r: GATE - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "walker", look: "guard", c: 82, r: GATE - 1, range: 1, speed: 0.3, w: 10, h: 14, dir: -1 },
  { kind: "walker", look: "rat", c: 103, r: G - 1, range: 3 },
  { kind: "walker", look: "guard", c: 110, r: WALL - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "spiky", look: "brazier", c: 119, r: WALL - 1, speed: 0, w: 10, h: 12 },
  { kind: "walker", look: "rat", c: 128, r: G - 1, range: 2 },
  { kind: "walker", look: "guard", c: 200, r: WALL - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "spiky", look: "brazier", c: 213, r: WALL - 1, speed: 0, w: 10, h: 12 },
  { kind: "walker", look: "guard", c: 223, r: KEEP_FLOOR - 1, range: 2, speed: 0.3, w: 10, h: 14 },
  { kind: "walker", look: "guard", c: 229, r: TOP - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "walker", look: "guard", c: 244, r: TOP - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "flyer", look: "crow", c: 233, r: TOP - 2, range: 1, rise: 5, period: 140 },
  { kind: "spiky", look: "brazier", c: 259, r: TOP - 1, speed: 0, w: 10, h: 12 }
];

// --- Art --------------------------------------------------------------------------------------------------

function hoist(at: { x: number; y: number }) {
  // The beam at the top of its travel, on two posts from the moat's walls, and the chains.
  R(at.x - 6, HOIST.top - 28, HOIST.w + 12, 4, P.woodDark);
  R(at.x - 6, HOIST.top - 28, HOIST.w + 12, 1, mix(P.wood, WHITE, 0.2));
  R(at.x + HOIST.w / 2 - 3, HOIST.top - 34, 6, 6, P.wood);
  R(at.x + HOIST.w / 2 - 1, HOIST.top - 32, 2, 2, METAL.chain);
  for (const cx of [at.x + 4, at.x + HOIST.w - 6]) for (let y = HOIST.top - 24; y < at.y; y += 3) R(cx, y, 2, 2, METAL.chain);
  // The platform: heavy timbers bound with iron.
  R(at.x, at.y, HOIST.w, 6, P.wood);
  R(at.x, at.y, HOIST.w, 1, mix(P.wood, WHITE, 0.25));
  R(at.x, at.y + 5, HOIST.w, 1, P.woodDark);
  for (let i = 0; i < HOIST.w; i += 12) R(at.x + i, at.y + 1, 1, 4, P.woodDark);
  R(at.x + 2, at.y + 2, HOIST.w - 4, 1, METAL.chain);
}

/** A building of the castle behind the walls: plaster over old stone, small windows, a steep slate roof with dormers. */
function block(x: number, w: number, top: number, roof: number, plaster: number, snow: boolean) {
  R(x, top, w, plaster - top, PAINT.trim);
  R(x, top, 2, plaster - top, mix(PAINT.trim, INK, 0.12));
  for (let y = top + 6; y < plaster; y += 6) R(x + 2, y, w - 2, 1, mix(PAINT.trim, INK, 0.05));
  for (let xx = x; xx < x + w; xx++) stoneColumn(xx, plaster, WATER, 0, 0, STONE_BACK);
  for (let i = 0; i < roof; i++) R(x - 2 + Math.floor(i / 2), top - roof + i, w + 4 - Math.floor(i / 2) * 2, 1, i < 2 && snow ? SNOW.lying : i % 5 === 4 ? mix(ROOF.slate, WHITE, 0.12) : ROOF.slate);
  for (let dx = 12; dx < w - 12; dx += 28) {
    R(x + dx, top - roof + 6, 7, 6, PAINT.trim);
    R(x + dx + 2, top - roof + 8, 3, 4, GLASS.farWindow);
    light(x + dx + 2, top - roof + 8, 3, 4);
  }
  for (let y = top + 8; y < plaster - 10; y += 18)
    for (let wx = x + 7; wx < x + w - 8; wx += 14) {
      R(wx, y, 4, 7, GLASS.farWindow);
      R(wx - 1, y - 1, 6, 1, mix(PAINT.trim, INK, 0.25));
      light(wx, y, 4, 7);
    }
}

/** Akershus slott behind the inner ward: white walls, steep dark roofs, a round stair tower with a copper cap. */
function castle(v: View) {
  const walk = GATE * TILE;
  block(60 * TILE, 7 * TILE, walk - 46, 18, walk + 20, v.sky.snow);
  block(69 * TILE + 8, 9 * TILE, walk - 60, 20, walk + 20, v.sky.snow);
  block(97 * TILE, 12 * TILE, WALL * TILE - 70, 22, WALL * TILE + 16, v.sky.snow);
  block(112 * TILE, 9 * TILE, WALL * TILE - 54, 18, WALL * TILE + 16, v.sky.snow);
  const tx = 79 * TILE + 6;
  const top = walk - 112;
  R(tx, top, 24, WATER - top, mix(PAINT.trim, INK, 0.06));
  for (let y = top + 6; y < WATER; y += 6) R(tx + 2, y, 20, 1, mix(PAINT.trim, INK, 0.1));
  for (let i = 0; i < 18; i++) R(tx + 12 - Math.floor(i * 0.7), top - 18 + i, Math.max(1, Math.floor(i * 1.4)), 1, i % 4 === 0 ? METAL.copperLight : METAL.copper);
  R(tx + 11, top - 24, 2, 6, METAL.copperDark);
  R(tx + 9, top + 12, 5, 8, GLASS.farWindow);
  light(tx + 9, top + 12, 5, 8);
}

/** The wall-walk stands on stone pillars over the ward; where it has fallen in, so have they. */
function pillars() {
  for (const [c0, c1, row] of [
    [59, 61, GATE],
    [64, 68, GATE],
    [72, 84, GATE],
    [100, 104, WALL],
    [107, 112, WALL],
    [116, 122, WALL]
  ] as const)
    for (let x = c0 * TILE + 2; x < (c1 + 1) * TILE - 4; x += 3 * TILE)
      for (let k = 0; k < 6; k++) stoneColumn(x + k, (row + 1) * TILE, WATER, 0, 0, STONE_BACK);
}

/** The copper spire on the keep's corner, from its top floor up to the tip, where it carries a little walk (the map's ledge). */
function spire(v: View) {
  const cx = SPIRE * TILE;
  const base = TOP * TILE;
  const tip = 2 * TILE + 5;
  for (let y = tip; y < base; y++) {
    const half = Math.round(2 + ((y - tip) / (base - tip)) * 22);
    R(cx - half, y, half * 2, 1, (y - tip) % 9 === 0 ? METAL.copperLight : METAL.copper);
    R(cx - half, y, 2, 1, METAL.copperLight);
    R(cx + half - 2, y, 2, 1, METAL.copperDark);
    if (v.sky.snow && (y - tip) % 9 === 0) R(cx - half, y, half, 1, SNOW.lying);
  }
  R(cx - 3, base - 20, 6, 8, GLASS.farWindow);
  R(cx - 4, base - 21, 8, 1, METAL.copperDark);
  light(cx - 3, base - 20, 6, 8);
  R(cx - 1, 4, 2, 2 * TILE + 1, METAL.copperDark);
  R(cx - 2, 2, 4, 3, METAL.copperLight);
}

/** Merlons along every wall top, so the walls read as a fortress; drawn behind him. */
function crenellations(tops: [number, number, number][]) {
  for (const [c0, c1, row] of tops)
    for (let x = c0 * TILE + 2; x < (c1 + 1) * TILE - 4; x += 10) {
      const y = row * TILE;
      R(x, y - 6, 6, 6, STONE.base);
      R(x, y - 6, 6, 1, STONE.light);
      R(x + 5, y - 5, 1, 5, STONE.dark);
    }
}

/** Arrow slits, the old gate's arch in the outer wall, and ivy trailing down from its ledge. */
function wallDetails() {
  for (const [x, y] of [
    [33, 31],
    [38, 32],
    [43, 31],
    [54, 25],
    [54, 30],
    [98, 24],
    [98, 30],
    [136, 24],
    [142, 29],
    [160, 23],
    [194, 24],
    [200, 28],
    [210, 24],
    [222, 23],
    [228, 28]
  ] as const) {
    R(x * TILE + 7, y * TILE, 2, 9, INK);
    R(x * TILE + 6, y * TILE + 3, 4, 2, INK);
  }
  // The old gate, walled up: an arch of dressed stone.
  const gx = 37 * TILE;
  for (let dx = -14; dx <= 14; dx++) {
    const h = Math.round(Math.sqrt(196 - dx * dx));
    R(gx + dx, WATER - 30 - h, 1, 30 + h, mix(STONE.dark, INK, 0.3));
  }
  for (let dx = -16; dx <= 16; dx += 4) {
    const h = Math.round(Math.sqrt(Math.max(0, 256 - dx * dx)));
    R(gx + dx - 1, WATER - 32 - h, 3, 2, STONE.light);
  }
  // Ivy hangs from its ledge down the wall.
  for (let i = 0; i < 9; i++) {
    const x = 28 * TILE + 2 + i * 3;
    const len = 6 + ((i * 7) % 11);
    for (let k = 0; k < len; k += 2) R(x + (k % 4 === 0 ? 0 : 1), (RAMP + 5) * TILE + 5 + k, 2, 2, k % 4 ? PLANTS.hedge : PLANTS.hedgeLight);
  }
  // The castle's east wing under the battlements: tall windows in its stone, lit after dark.
  for (let c = 233; c < 266; c += 3)
    for (const r of [10, 13]) {
      const x = c * TILE + 4;
      const y = r * TILE + 2;
      R(x - 1, y - 2, 8, 2, STONE.light);
      R(x, y, 6, 10, GLASS.farWindow);
      R(x + 3, y, 1, 10, STONE.base);
      light(x, y, 3, 10);
      light(x + 4, y, 2, 10);
    }
}

/** The well in the ward: a stone ring round the shaft, a little roof on posts, the chain down. */
function well() {
  const x = 67 * TILE - 4;
  const g = WATER;
  for (const wx of [x, x + 2 * TILE + 2]) {
    R(wx, g - 9, 6, 9, STONE.base);
    R(wx, g - 9, 6, 2, STONE.light);
    R(wx + 5, g - 7, 1, 7, STONE.dark);
  }
  R(x + 2, g - 30, 2, 21, P.woodDark);
  R(x + 2 * TILE + 4, g - 30, 2, 21, P.woodDark);
  for (let i = 0; i < 6; i++) R(x - 2 + i, g - 36 + i, 2 * TILE + 12 - i * 2, 1, ROOF.slate);
  R(x + TILE + 3, g - 26, 2, 30, METAL.chain);
}

/** The cellar under the well: dark old stone round it, a barrel, and the shaft's light falling in. */
function cellar() {
  const x0 = 62 * TILE;
  const x1 = 71 * TILE;
  const y0 = (G + 1) * TILE;
  for (let x = x0; x < x1; x++) stoneColumn(x, y0, y0 + 2 * TILE, 0, 0, INSIDE);
  R(67 * TILE, y0, 2 * TILE, 2 * TILE, mix(INSIDE.light, WHITE, 0.08));
  R(70 * TILE - 2, y0 + 2 * TILE - 12, 9, 12, P.woodDark);
  R(70 * TILE - 2, y0 + 2 * TILE - 9, 9, 1, METAL.chain);
  R(70 * TILE - 2, y0 + 2 * TILE - 4, 9, 1, METAL.chain);
}

/** The inside of the keep: its stone in shadow, seen past its open front. */
const INSIDE: Stone = { base: mix(STONE_BACK.base, INK, 0.35), light: mix(STONE_BACK.light, INK, 0.35), dark: mix(STONE_BACK.dark, INK, 0.35), mortar: mix(STONE_BACK.mortar, INK, 0.35), moss: STONE_BACK.moss };
function keepInside() {
  for (let x = (KEEP[0] + 1) * TILE; x < KEEP[1] * TILE; x++) stoneColumn(x, (TOP + 1) * TILE, KEEP_FLOOR * TILE, 0, 0, INSIDE);
  // Two fire baskets on the walls inside, lit: only to see by.
  for (const [x, y] of [
    [218 * TILE + 4, 16 * TILE + 6],
    [229 * TILE + 2, 11 * TILE + 6]
  ] as const) {
    R(x, y + 4, 6, 3, METAL.lampPost);
    R(x + 1, y + 1, 4, 3, FIRE.flame);
    R(x + 2, y, 2, 2, FIRE.core);
    light(x, y, 6, 6, "soft");
  }
}

/** A stone pier in the harbour under one of the battery's cannons: courses of granite, weed at the water. */
function pier(c: number) {
  const x = c * TILE;
  R(x - 2, WALL * TILE, 2 * TILE + 4, 3, STONE.light);
  for (let k = 0; k < 2 * TILE; k += 7) R(x + k, WATER - 2, 3, 2, PLANTS.hedgeDark);
}

/** A guard of the fortress on his round: a dark greatcoat, a cap, a rifle on the shoulder; two steps of a march. */
function guard(e: Enemy) {
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  const f = e.dir;
  const at = (dx: number) => (f > 0 ? x + dx : x + 9 - dx);
  const step = view.reduced ? 0 : Math.floor(e.x / 4) % 2;
  R(x + 2, y - 14, 6, 2, INK);
  R(at(6), y - 14, 3, 1, PARADE.plume);
  R(x + 2, y - 12, 6, 3, SKIN);
  R(at(6), y - 11, 1, 1, INK);
  R(x + 1, y - 9, 8, 6, PARADE.guard);
  R(x + 1, y - 6, 8, 1, PARADE.guardBelt);
  R(at(1), y - 15, 1, 9, METAL.lampPost);
  R(x + 2 + step, y - 3, 2, 3, PARADE.guard);
  R(x + 6 - step, y - 3, 2, 3, PARADE.guard);
  R(x + 1 + step, y - 1, 3, 1, INK);
  R(x + 5 - step, y - 1, 3, 1, INK);
}

/** A brazier on the wall: an iron basket on a stone foot, coals and flames. Landing on it hurts. */
function brazier(e: Enemy, t: number) {
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  R(x + 2, y - 4, 6, 4, STONE.base);
  R(x + 2, y - 4, 6, 1, STONE.light);
  R(x, y - 9, 10, 5, METAL.lampPost);
  for (let k = 1; k < 10; k += 3) R(x + k, y - 9, 1, 5, P.ironDark);
  const flick = view.reduced ? 0 : Math.floor(t / 5) % 3;
  R(x + 1, y - 10, 8, 1, FIRE.glow);
  R(x + 2 + flick, y - 12, 2, 2, FIRE.flame);
  R(x + 6 - flick, y - 13, 2, 3, FIRE.flame);
  R(x + 4, y - 11, 2, 1, FIRE.core);
  light(x + 1, y - 13, 8, 4, "soft");
}

/** The flourish: the flag runs up the keep's pole, and the saluting battery fires three times, puffs of square smoke over the walls. */
function flourish(age: number) {
  const px = (SPIRE + 4) * TILE + 6;
  R(px, TOP * TILE - 54, 1, 54, METAL.flagpole);
  R(px - 1, TOP * TILE - 56, 3, 2, METAL.brass);
  const k = Math.min(1, age / 60);
  flagCloth(px + 1, Math.round(TOP * TILE - 12 - 40 * k));
  if (view.reduced) return;
  // The salute: three bangs, a ball of square smoke each over the battlements, swelling and thinning.
  for (let shot = 0; shot < 3; shot++) {
    const a = age - 4 - shot * 28;
    if (a < 0 || a > 70) continue;
    const cx = (258 + shot * 3) * TILE;
    const cy = TOP * TILE - 34 - shot * 10 - a * 0.25;
    const r = 4 + a * 0.35;
    const size = Math.max(2, Math.round(7 - a / 12));
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + shot;
      const rr = r * (i % 2 ? 0.6 : 1);
      R(Math.round(cx + Math.cos(ang) * rr - size / 2), Math.round(cy + Math.sin(ang) * rr * 0.7 - size / 2), size, size, i % 3 ? WHITE : mix(WHITE, STONE.light, 0.4));
    }
    if (a < 6) R(cx - 3, cy - 3, 6, 6, FIRE.glow);
  }
}

export const AKERSHUS: LevelDef = {
  id: "akershus",
  rune: 1,
  name: "Akershus festning",
  short: "Akershus",
  landmark: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  place: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  sky: "day",
  map: MAP,
  legend: { solid: "QWB#", oneWay: "_=-^", water: "~" },
  ramps: [],
  carriers: [HOIST],
  timed: [],
  cannons: CANNONS,
  enemies: ENEMIES,
  flourish: 140,
  flourishLook: 30,
  signs: [
    {
      label: { nb: "Porten", en: "The gate" },
      lines: { nb: ["Påbegynt i 1299. Aldri tatt ved beleiring.", "Du må gjerne prøve."], en: ["Begun in 1299. Never taken by siege.", "You are welcome to try."] }
    },
    {
      label: { nb: "Vollgrava", en: "The moat" },
      lines: { nb: ["Heisen går opp og ned.", "Kanonen tar ikke hensyn til det."], en: ["The hoist goes up and down.", "The cannon does not take that into account."] }
    },
    {
      label: { nb: "Saluttbatteriet", en: "The saluting battery" },
      lines: { nb: ["Tre kanoner på rad, og den ene skyter deg i den neste.", "Ikke len deg bakover."], en: ["Three cannons in a row, each firing you into the next.", "Do not lean back."] }
    },
    {
      label: { nb: "Tårnet", en: "The keep" },
      lines: { nb: ["Vaktskifte hver time.", "Han der inne har ikke fått beskjed."], en: ["The guard changes every hour.", "The one inside was not told."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => drawOsloHills(v.sky, WATER),
    mid: (v) => drawFjord(v.t, WATER),
    near(v) {
      // Bjørvika across the harbour, small: MUNCH, the Barcode.
      munch(layerX(1500, 0.4), WATER - 6);
      barcode(layerX(1560, 0.4), WATER - 6);
      munch(layerX(3300, 0.4), WATER - 6);
      barcode(layerX(3360, 0.4), WATER - 6);
      drawGulls(v.t, GATE * TILE - 140);
    },
    back(v: View) {
      castle(v);
      pillars();
      keepInside();
      spire(v);
      well();
      cellar();
      for (const c of [172, 181]) pier(c);
      crenellations([
        [30, 45, RAMP],
        [52, 56, GATE],
        [59, 61, GATE],
        [64, 68, GATE],
        [72, 84, GATE],
        [98, 104, WALL],
        [107, 112, WALL],
        [116, 122, WALL],
        [134, 139, WALL],
        [140, 144, TURRET],
        [157, 164, WALL],
        [190, 202, WALL],
        [205, 215, WALL],
        [KEEP[0], KEEP[1], TOP],
        [232, 234, TOP],
        [237, 240, TOP],
        [243, 246, TOP],
        [249, 252, TOP],
        [255, 266, TOP],
        [238, 239, TOP - 3],
        [250, 251, TOP - 3]
      ]);
      tbaneDoor(v.doors.get("tbane"));
    },
    front: () => wallDetails(),
    ground: () => ({ top: P.grass, dot: P.grassDark, fill: P.earth }),
    ledges: { _: STONE_LEDGE, "=": IVY, "-": COPPER, "^": SLATE },
    carrier: (_i, at) => hoist(at),
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "guard") guard(e);
      else if (e.def.look === "brazier") brazier(e, v.t);
      else return false;
      return true;
    },
    flourish: (age) => flourish(age)
  }
};
