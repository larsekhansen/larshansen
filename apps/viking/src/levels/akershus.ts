import { TILE } from "@larshansen/pixelkit/config";
import { drawCannon } from "@larshansen/pixelkit/launcherart";
import { R, layerX, light, mix, stoneWall, view } from "@larshansen/pixelkit/paint";
import { BRICK, FACADE, FIRE, GLASS, INK, LAND, METAL, PAINT, PALETTE, PLANTS, ROOF, SNOW, STONE, STONE_BACK, WHITE, type Stone } from "@larshansen/pixelkit/palette";
import { STONE_LEDGE, type LedgeLook } from "@larshansen/pixelkit/props";
import { keepBoxes, type Enemy, type EnemyDef } from "../game/enemies";
import { climbed, drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { darker, drawFar, farPiece, lighter } from "../alive/far";
import { FOE_INK, SHADES, drawFoe, foeFrame, glamFire, mark, type Looks } from "../alive/foes";
import { frame } from "../alive/frames";
import { flagFlying, flame } from "../alive/things";
import { CAST, dot, prop, tone } from "../alive/props";
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
//   Q  quay   W  fortress stone   #  grass and earth   K  the rock the fortress stands on   B  crate
//   _  stone ledge   =  ivy   -  copper   ^  the castle's slate roof   ~  water
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
// Beyond the turret, the hill, a step down from the battlements, so he can always walk back.
b.ground(267, COLS - 1, TOP + 1, "K");

// Marks: the start, doors, signs, flags, benches, cannons, the sheep, the rune, the bracteate, the cheese.
b.put(5, G - 1, "t").put(7, G - 1, "S").put(11, G - 1, "i");
b.put(42, RAMP - 1, "c").put(54, GATE - 1, "f");
b.put(88, G - 1, "b").put(75, G - 1, "e").put(91, G - 1, "c");
b.put(122, WALL - 1, "c").put(136, WALL - 1, "f").put(141, TURRET - 1, "i").put(143, TURRET - 1, "c");
b.put(159, WALL - 1, "f").put(161, WALL - 1, "i").put(163, WALL - 1, "c").put(172, WALL - 1, "c").put(181, WALL - 1, "c");
b.put(194, WALL - 1, "f").put(209, WALL - 2, "b").put(211, WALL - 1, "i");
// A flag in the first gap of the battlements, so a slip up here costs a short walk, not the keep again.
b.put(235, TOP + 1, "f");
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
  [213, 14], [214, 13], [215, 14]
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
export const HOIST = { kind: "lift" as const, x: 148 * TILE, top: 64, bottom: WATER + 10, w: 3 * TILE, speed: 3, wait: 45, under: 6 };

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
  { kind: "spiky", look: "brazier", c: 14, r: G - 1, speed: 0, w: 10, h: 12 },
  { kind: "walker", look: "guard", c: 23, r: G - 1, range: 2, speed: 0.3, w: 10, h: 14 },
  { kind: "flyer", look: "crow", c: 66, r: GATE - 3, range: 1, rise: 6, period: 150 },
  { kind: "walker", look: "guard", c: 77, r: GATE - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "walker", look: "guard", c: 82, r: GATE - 1, range: 1, speed: 0.3, w: 10, h: 14, dir: -1 },
  { kind: "walker", look: "rat", c: 103, r: G - 1, range: 3 },
  { kind: "walker", look: "guard", c: 110, r: WALL - 1, range: 1, speed: 0.3, w: 10, h: 14 },
  { kind: "spiky", look: "brazier", c: 58, r: GATE - 1, speed: 0, w: 10, h: 12 },
  { kind: "walker", look: "rat", c: 128, r: G - 1, range: 2 },
  // He stands his post between the flag and the end of the wall, clear of both: the leap over the water is its own problem.
  { kind: "walker", look: "guard", c: 198, r: WALL - 1, range: 0, speed: 0, w: 10, h: 14 },
  // A tile on from the ledge he drops off (order 24): a jump for it pressed as he drops now comes after he lands.
  { kind: "spiky", look: "brazier", c: 214, r: WALL - 1, speed: 0, w: 10, h: 12 },
  { kind: "walker", look: "guard", c: 223, r: KEEP_FLOOR - 1, range: 2, speed: 0.3, w: 10, h: 14 },
  { kind: "walker", look: "guard", c: 229, r: TOP - 1, range: 1, speed: 0.3, w: 10, h: 14 },
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
  stoneWall(x, plaster, w, WATER, STONE_BACK);
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
      stoneWall(x, (row + 1) * TILE, 6, WATER, STONE_BACK);
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
  outerWall();
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

/**
 * The outer wall's face (columns 30 to 45), so it is a wall seven hundred years old and not a pattern:
 * a course of darker stone where it was raised later, damp and moss running down from the wall-walk,
 * iron ties holding it together, and a drainpipe from the wall-walk down to the quay.
 */
function outerWall() {
  const x0 = 30 * TILE;
  const x1 = 46 * TILE;
  const top = RAMP * TILE;
  // The later courses: a band of darker, squarer stone, with a weathered top edge.
  const band = top + 3 * TILE + 6;
  for (let x = x0; x < x1; x++) {
    const ragged = ((x * 7) % 5 === 0 ? 1 : 0) + ((x * 13) % 11 === 0 ? 1 : 0);
    R(x, band - ragged, 1, 9 + ragged, (Math.floor((x + 3) / 9) % 2 ? STONE.dark : mix(STONE.dark, INK, 0.12)));
  }
  for (let x = x0 + 4; x < x1; x += 9) R(x, band, 1, 9, STONE.mortar);
  R(x0, band + 4, x1 - x0, 1, STONE.mortar);
  R(x0, band - 1, x1 - x0, 1, mix(STONE.light, STONE.dark, 0.4));
  // Damp running down from the top, where water stands on the wall-walk, and green where it stays.
  for (const [c, len] of [[31, 34], [34.5, 22], [36, 46], [40.5, 28], [44, 38]] as const) {
    const x = Math.round(c * TILE);
    for (let k = 0; k < len; k++) {
      const w = k < len * 0.6 ? 2 : 1;
      R(x + (k % 7 === 3 ? 1 : 0), top + 2 + k, w, 1, k < 6 ? STONE.moss : mix(STONE.dark, STONE.moss, 0.25));
    }
  }
  // Iron ties: the plates that hold the wall to its core, in a row under the band.
  for (const c of [32, 35, 39, 42]) {
    const x = c * TILE + 6;
    const y = band + 14;
    R(x - 3, y, 7, 1, P.ironDark);
    R(x, y - 3, 1, 7, P.ironDark);
    R(x - 1, y - 1, 3, 3, P.iron);
    R(x, y + 4, 1, 4, mix(STONE.dark, P.ironDark, 0.4));
  }
  // The drainpipe: down from a hopper under the wall-walk to a spout over the quay, on its brackets.
  const px = 41 * TILE + 9;
  R(px - 2, top + 3, 6, 4, P.ironDark);
  R(px - 1, top + 3, 4, 1, P.iron);
  R(px, top + 7, 2, WATER - top - 13, P.ironDark);
  R(px, top + 7, 1, WATER - top - 13, P.iron);
  for (let y = top + 16; y < WATER - 10; y += 22) R(px - 1, y, 4, 2, P.ironDark);
  R(px, WATER - 6, 5, 2, P.ironDark);
  R(px + 3, WATER - 4, 2, 1, P.ironDark);
  R(px - 1, WATER - 4, 4, 4, mix(STONE.dark, STONE.moss, 0.35));
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
  stoneWall(x0, y0, x1 - x0, y0 + 2 * TILE, INSIDE);
  R(67 * TILE, y0, 2 * TILE, 2 * TILE, mix(INSIDE.light, WHITE, 0.08));
  R(70 * TILE - 2, y0 + 2 * TILE - 12, 9, 12, P.woodDark);
  R(70 * TILE - 2, y0 + 2 * TILE - 9, 9, 1, METAL.chain);
  R(70 * TILE - 2, y0 + 2 * TILE - 4, 9, 1, METAL.chain);
}

/** A fire basket, 6 x 6, by tones of cast iron (3 lit, 0 the dark between its bars): rim, cage, bowl, stem, foot. */
const BASKET = ["333332", "302010", "201010", ".2110.", "..21..", ".3210."];

/** The inside of the keep: its stone in shadow, seen past its open front. */
const INSIDE: Stone = { base: mix(STONE_BACK.base, INK, 0.35), light: mix(STONE_BACK.light, INK, 0.35), dark: mix(STONE_BACK.dark, INK, 0.35), mortar: mix(STONE_BACK.mortar, INK, 0.35), moss: STONE_BACK.moss };
function keepInside(t: number) {
  stoneWall((KEEP[0] + 1) * TILE, (TOP + 1) * TILE, (KEEP[1] - KEEP[0] - 1) * TILE, KEEP_FLOOR * TILE, INSIDE);
  // Two fire baskets on the walls inside, lit: only to see by.
  for (const [x, y] of [
    [218 * TILE + 4, 16 * TILE + 6],
    [229 * TILE + 2, 11 * TILE + 6]
  ] as const) {
    // The basket's iron (order 28; order 40: it was a rim over a bowl): a rim lit on its left, a cage of bars with the dark of
    // the coals between them, its bowl, and the stem and the foot it stands on.
    prop("fire basket", [CAST], "", 6, 6, x, y + 4, (g) =>
      BASKET.forEach((row, k) => [...row].forEach((ch, i) => dot(g, i, k, ch === "." ? null : tone(CAST, Number(ch)))))
    );
    // Their flames flicker (order 24), still with reduced motion.
    flame(x + 3, y + 5, t, x);
    light(x, y, 6, 6, "soft");
  }
}

/** A stone pier in the harbour under one of the battery's cannons: courses of granite, weed at the water. */
function pier(c: number) {
  const x = c * TILE;
  R(x - 2, WALL * TILE, 2 * TILE + 4, 3, STONE.light);
  for (let k = 0; k < 2 * TILE; k += 7) R(x + k, WATER - 2, 3, 2, PLANTS.hedgeDark);
}

// The fortress's guard and brazier, drawn as frames (order 23; `src/alive/foes.ts`): a ramp to each material, an idle
// of two frames, a cycle of four; the brazier's flames are its cycle.
const GUARD_TOP = [
  ".a...........",
  ".m.....GGGG..",
  ".m.MMMMMMG...",
  ".m.mmmmmmm...",
  ".m.ddmmmmd...",
  ".m.OOOOOOO...",
  ".m.OOOOOeO...",
  ".m.oOOOOOO...",
  ".m..oOOOO....",
  ".mMMmmmmmmM..",
  ".mMmmmmmmmmm.",
  ".mdmmmMmmmmd.",
  ".mdmmmMmmmmd.",
  ".mdlllllllld.",
  ".mdmmmmmmmmd.",
  "...dmmmmmmd.."
];
const GUARD_LEGS = {
  stand: ["...ll..ll....", "...ll..ll....", "..mmm.mmm....", "..ddd.ddd...."],
  a: ["..ll....ll...", ".ll......ll..", ".mmm.....mmm.", ".ddd.....ddd."],
  b: ["....llll.....", "....llll.....", "...mmmmm.....", "...ddddd....."],
  c: ["...ll...ll...", "..ll.....ll..", "..mmm....mmm.", "..ddd....ddd."]
};
/** Its glam (order 27): shoulder pads squared out past its coat in neon, and shades under its cap. */
const guardFrame = (name: string, legs: string[], nod = 0) =>
  frame(name, FOE_INK, [GUARD_TOP.slice(0, 9), 0, nod], [GUARD_TOP.slice(9), 0, 9], [legs, 0, 16], mark(["NN......NN", "nN......Nn"], 2, 9), mark(SHADES, 5, 6 + nod));
const GUARD: Looks = {
  w: 13,
  h: 20,
  idle: [guardFrame("guard, at ease", GUARD_LEGS.stand), guardFrame("guard, breathing", GUARD_LEGS.stand, 1)],
  move: [guardFrame("guard, marching 1", GUARD_LEGS.a), guardFrame("guard, marching 2", GUARD_LEGS.b, -1), guardFrame("guard, marching 3", GUARD_LEGS.c), guardFrame("guard, marching 4", GUARD_LEGS.b, -1)]
};

const BRAZIER_BASE = [
  "ooooooooooooo",
  "lmllllmlllmll",
  "lmlllMmlllmll",
  "lmllllmlllmll",
  "lmllllmlllmll",
  ".lmlllmlllml.",
  "..lllllllll..",
  "...MMMMMMM...",
  "...mmmmmmm...",
  "...mmmmmmm...",
  "...ddddddd...",
  "..ddddddddd.."
];
const FLAMES = [
  ["......a......", "....O.Oa.....", "...OaOOOO.a..", "..OOOoOOoOO.."],
  ["....a........", "...aO..O.a...", "..OOOOaOOO...", "..oOoOOOoOO.."],
  ["........a....", "..a..O.aO....", "..OOOOaOOOO..", ".OOoOOOoOOo.."],
  ["......a......", "....aO.O.....", "..O.OOOOaO...", "..OOoOOoOOO.."]
];
/** Its fire under the glamour (order 27): magenta with lime tongues and tips, flickering in its frames, its coals' rim magenta. */
const brazierFrame = (k: number) => frame(`brazier, flames ${k + 1}`, FOE_INK, [glamFire(FLAMES[k]), 0, 0], [BRAZIER_BASE, 0, 4], [["XXXXXXXXXXXXX"], 0, 4]);
const BRAZIER: Looks = { w: 13, h: 16, idle: [0, 1, 2, 3].map(brazierFrame), move: [0, 1, 2, 3].map(brazierFrame), rate: 5 };

/**
 * A brazier on its stone foot: an iron basket, coals, flames that flicker on its own clock. It hurts from above. 13 x 16. After
 * dark its fire is the glamour's and glows in its own neon, as every invader's does (`glows`); it gives no lamp's warm light
 * over it (order 32, ADR 0054: that light turned its magenta and lime to a muddy yellow).
 */
function brazier(e: Enemy, t: number) {
  drawFoe(e, foeFrame(e, t, BRAZIER), BRAZIER.w, BRAZIER.h);
}

/** The flourish: the flag runs up the keep's pole, and the saluting battery fires three times, puffs of square smoke over the walls. */
function flourish(age: number) {
  const px = (SPIRE + 4) * TILE + 6;
  R(px, TOP * TILE - 54, 1, 54, METAL.flagpole);
  R(px - 1, TOP * TILE - 56, 3, 2, METAL.brass);
  const k = Math.min(1, age / 60);
  flagFlying(px + 1, Math.round(TOP * TILE - 12 - 40 * k) - 1, age, 8);
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

// --- The far view (order 43) ----------------------------------------------------------------------------
// From the walls, over the harbour: Bjørvika to the east, the way he came along the line (the Opera's white roof rising out of
// the water, the Barcode's slim towers behind it, MUNCH's bent top), Hovedøya low and wooded just off the fortress, and to the
// west, where the line goes on, Rådhuset's two brick towers by the water. Each once. The near layer rises with the far ones as
// the view climbs the walls (`climbed`), so they stay on the horizon.

/** How far the far layers rise as the view climbs the walls. */
const up = () => climbed(ROWS * TILE, ROWS * TILE);

/** Bjørvika from the fortress: the Opera's marble roof out of the water to its stage tower, the Barcode behind, MUNCH tall at its end. */
const bjorvika = () =>
  farPiece("akershus bjorvika", 112, 50, (b) => {
    // The Barcode's towers behind, light and dark, each with its own stripes.
    [[30, 5, 30], [36, 4, 36], [41, 5, 33], [47, 4, 40], [52, 5, 31], [58, 4, 37], [63, 5, 34], [69, 4, 29]].forEach(([x, w, h], k) => {
      const c = k % 3 === 1 ? mix(FACADE.stageDoor, STONE.light, 0.25) : k % 2 ? FACADE.aluminium : FACADE.libraryTop;
      b.block(x, w, 3, h, c);
      for (let u = 6; u < h - 1; u += 4) b.pane(x + 1, w - 2, u, u, k % 3 === 1 ? lighter(c, 0.25) : darker(c, 0.25));
    });
    // The Opera: the marble roof rising out of the water to its flat top, the walls under it, the foyer's glass, the stage tower.
    for (let x = 0; x < 78; x++) {
      const top = x < 34 ? 2 + Math.round(x * 0.36) : x < 72 ? 14 : 14 - (x - 71) * 2;
      b.fill(x, 1, 1, top, x < 40 ? FACADE.marbleWall : mix(FACADE.marbleWall, STONE.base, 0.15));
      b.dot(x, top, x < 34 ? FACADE.marble : lighter(FACADE.marble, 0.3));
      b.dot(x, top - 1, FACADE.marbleEdge);
    }
    for (let x = 36; x < 66; x++) b.fill(x, 1, 2, 10, x % 4 === 0 ? mix(GLASS.foyerMullion, STONE.base, 0.3) : GLASS.foyer);
    b.pane(37, 28, 4, 8, GLASS.foyer);
    b.block(46, 16, 15, 25, FACADE.stageTower);
    for (let u = 17; u < 25; u += 2) for (let x = 48 + (u % 4 === 1 ? 1 : 0); x < 60; x += 2) b.dot(x, u, FACADE.stageTowerDot);
    // MUNCH: the tall tower clad in aluminium, its top bent toward the fjord, a band of window near its top.
    for (let u = 1; u <= 46; u++) {
      const lean = u > 36 ? Math.round((u - 36) * 0.4) : 0;
      for (let k = 0; k < 11; k++) b.dot(86 + k + lean, u, k === 0 ? lighter(FACADE.aluminium, 0.25) : k === 10 ? FACADE.aluminiumLine : u % 3 === 0 ? FACADE.aluminiumLine : FACADE.aluminium);
    }
    b.pane(90, 7, 42, 43, FACADE.munchWindow);
  });

/** Rådhuset from the fortress: its two brick towers, the east one with its clock, the hall between, on the quay. */
const radhuset = () =>
  farPiece("akershus radhuset", 60, 44, (b) => {
    b.fill(0, 60, 1, 2, mix(STONE.base, INK, 0.2));
    b.block(14, 32, 3, 16, BRICK.red);
    for (let x = 17; x < 44; x += 3) b.pane(x, 1, 6, 12, darker(BRICK.red, 0.45));
    for (const [x0, w, top] of [[4, 12, 36], [44, 13, 41]] as const) {
      b.block(x0, w, 3, top, BRICK.red);
      for (let u = 6; u < top - 3; u += 3) b.dot(x0 + 1, u, BRICK.course);
      for (let x = x0 + 3; x < x0 + w - 2; x += 3) b.pane(x, 1, 8, top - 6, darker(BRICK.red, 0.45));
      b.fill(x0 - 1, w + 2, top + 1, top + 1, lighter(BRICK.red, 0.3));
    }
    // The clock on the east tower's face, toward the harbour.
    b.fill(48, 5, 31, 35, PAINT.trim);
    b.fill(49, 3, 30, 36, PAINT.trim);
    b.dot(50, 33, INK);
    b.dot(50, 34, INK);
    b.dot(51, 33, INK);
  });

/** Hovedøya just off the fortress: low and wooded, a pale rim of rock at the water. */
const hovedoya = () =>
  farPiece("akershus hovedoya", 96, 10, (b) => {
    for (let x = 0; x < 96; x++) {
      const t = (x - 47) / 48;
      const h = Math.max(1, Math.round(9 * Math.pow(Math.max(0, 1 - t * t), 0.7)) + (x > 6 && x < 90 && (x * 7) % 5 === 0 ? 1 : 0));
      b.fill(x, 1, 1, 1, x < 40 ? STONE.light : STONE.base);
      if (h > 1) b.fill(x, 1, 2, h, x < 38 ? LAND.island : darker(LAND.island, 0.15));
      if (h > 2 && x % 5 === 2) b.dot(x, h, lighter(LAND.island, x < 38 ? 0.2 : 0.08));
      if (h > 3 && x % 7 === 3) b.dot(x, h - 2, darker(LAND.island, 0.3));
    }
  });

export const AKERSHUS: LevelDef = {
  id: "akershus",
  rune: 1,
  name: "Akershus festning",
  short: "Akershus",
  landmark: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  place: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  sky: "day",
  map: MAP,
  legend: { solid: "QWBK#", oneWay: "_=-^", water: "~" },
  ramps: [],
  carriers: [HOIST],
  timed: [],
  cannons: CANNONS,
  // Every enemy here keeps the box it had before order 18: growing them cost the sloppy player more than 0.3 hearts a run.
  enemies: keepBoxes(ENEMIES),
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
      lines: { nb: ["Tre kanoner på rad, hver skyter deg inn i den neste.", "Ikke len deg bakover."], en: ["Three cannons in a row, each firing you into the next.", "Do not lean back."] }
    },
    {
      label: { nb: "Tårnet", en: "The keep" },
      lines: { nb: ["Vaktskifte hver time.", "Han der inne har ikke fått beskjed."], en: ["The guard changes every hour.", "The one inside was not told."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    // The saluting battery's iron cannons, the kit's (order 42: the first script steps them and leaves their drawing here).
    cannon: (_i, l, loadedAt, firedAt, v) => drawCannon(l, v.t, loadedAt, firedAt),
    // On the walls and the battery the hills stay on the horizon and the fjord spreads under them (order 20).
    far: (v) => drawOsloHills(v.sky, WATER, up()),
    mid(v) {
      drawFjord(v.t, WATER, up());
      drawFar(hovedoya(), layerX(1300, 0.2), WATER - 15 - up());
    },
    near(v) {
      // Bjørvika to the east (the start of the walls), Rådhuset to the west (their end), each once.
      drawFar(bjorvika(), layerX(500, 0.4), WATER - 3 - up());
      drawFar(radhuset(), layerX(3900, 0.4), WATER - 3 - up());
      drawGulls(v.t, GATE * TILE - 140);
    },
    back(v: View) {
      castle(v);
      pillars();
      keepInside(v.t);
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
      if (e.def.look === "guard") drawFoe(e, foeFrame(e, v.t, GUARD), GUARD.w, GUARD.h);
      else if (e.def.look === "brazier") brazier(e, v.t);
      else return false;
      return true;
    },
    flourish: (age) => flourish(age)
  }
};
