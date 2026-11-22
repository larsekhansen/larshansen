import { column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import { carrierAt, type CarrierDef, type Travel } from "@larshansen/pixelkit/carrier";
import { HOIST_STEPS, POLE } from "@larshansen/pixelkit/checkpoint";
import { TILE } from "@larshansen/pixelkit/config";
import type { Light } from "@larshansen/pixelkit/dark";
import { kept, seen, stamp } from "@larshansen/pixelkit/kept";
import { R, ctx, light, mix, view } from "@larshansen/pixelkit/paint";
import { CREATURE, DOORWAY, ENEMY, ROLES, FOREST, GLASS, INK, LAND, LAMP, PAINT, PALETTE, PLANTS, ROOF, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { STOVE_SMOKE, smoke } from "@larshansen/pixelkit/props";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { EnemyDef } from "../game/enemies";
import { TROLL, TROLL_RULES, TROLL_STEPS, clubBox, dawnNow, waveFronts, type Troll, type TrollDef } from "../game/troll";
import { drawLook, drawLookShot } from "../render/looks";
import { FOE_INK, drawFoe, foeFrame, mark, type Looks } from "../alive/foes";
import { frame, paint } from "../alive/frames";
import { flame, lampFlicker } from "../alive/things";
import { eyes, outlined, plain } from "../render/sprite";
import { tbaneDoor } from "../render/furniture";
import { drawNight } from "../render/night";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";
import { spedX } from "../alive/depth";
import { plankDoor as plankDoor2, tile as textured, type Grain } from "../alive/ground";
import { STORY } from "../game/story";
import { overTheDark } from "../alive/glamour";
import { signBoards } from "../alive/invasion";

// Level 7, rune N: Nordmarka. A summer night in the forest north of the city, from the end of line
// 5 at Sognsvann. Under the spruces the dark shows only what his headlamp lights; lit windows, the
// blue paint on the trunks that marks the trail (this level's flags) and the rune show through it.
// A moose crosses the marsh and does not care that he rides its back. Ullevålseter has one lit
// window and a sign about waffles. Jernhaugen's mound stands here with its door into the maze, and
// out of the maze he comes back here. At the end, in a clearing, a boulder that is a troll; the dawn
// comes through the trees, and a troll cannot stand light.
// New: the dark (and the headlamp), a carrier that walks (the moose), and the troll.
//
//   #  the forest floor   K  rock   _  roots and branches   -  the hut's porch   w  the bog
//   b  a bench   $  skilling   &  brown cheese   t  T-banen   j  Jernhaugen
//
// Sections: Sognsvann and into the trees (teach: the dark where nothing can go wrong, the first blue
// mark, a fox's eyes), the bogs and the marsh (practise: bog pits in the dark, stones over a bog,
// the moose), Ullevålseter, Jernhaugen and the gorge (the middle flag; twist: the ski pole's dash over
// a gorge in the darkest part), and the clearing (set piece: the troll at dawn, rune N on it).

const COLS = 236;
const ROWS = 24;
/** The forest floor. */
export const G = 18;
const b = mapBuilder(COLS, ROWS);

// --- Sognsvann, and into the trees -----------------------------------------------------------------------
b.ground(0, COLS - 1, G);
// A fallen trunk across the path, then a rise of rock.
b.run(37, 40, G - 2, "_");
b.ground(46, 47, G - 1);
b.ground(48, 55, G - 2);
b.ground(56, 57, G - 1);
b.put(49, G - 2, "K").put(53, G - 2, "K");

// --- The bogs, and the marsh --------------------------------------------------------------------------------
b.fill(61, 63, G, G + 1, "w");
// Three pits two tiles wide, with a stone three tiles wide between each: room to land, and to stop.
b.fill(71, 82, G, G + 1, "w");
for (const c of [73, 74, 75, 78, 79, 80]) b.put(c, G, "K").put(c, G + 1, "K");
b.fill(89, 102, G, G + 1, "w");
// A branch for the squirrel, in the trees past the marsh.
b.run(110, 113, G - 3, "_");

// --- Ullevålseter: the hut, its porch, the big spruce and its branches up out of the trees -----------
// The porch, two tiles up, with a bench on it: a little off the path.
b.run(125, 128, G - 2, "-");
b.run(135, 136, G - 2, "_");
b.run(137, 138, G - 4, "_");
b.run(134, 135, G - 6, "_");
b.run(136, 139, G - 8, "_");

// --- Jernhaugen, and the gorge ---------------------------------------------------------------------------
b.fill(158, 162, G, ROWS - 1, ".");

// --- The clearing --------------------------------------------------------------------------------------------
// A low rock where it begins, rocks and branches above the floor to get over the troll, a wall at the end.
b.fill(196, 196, G - 2, G - 1, "K");
b.fill(199, 199, G - 2, G - 1, "K");
b.run(199, 205, G - 4, "_");
b.fill(225, 225, G - 2, G - 1, "K");
b.run(220, 225, G - 4, "_");
b.ground(229, COLS - 1, 6, "K");

// Marks: the start, the doors, signs, flags (blue trunks), benches, the rune, the bracteate, the cheese.
b.put(2, G - 1, "t").put(4, G - 1, "S").put(20, G - 1, "i").put(32, G - 1, "f");
b.put(58, G - 1, "f").put(86, G - 1, "f").put(121, G - 1, "f").put(127, G - 3, "b").put(131, G - 1, "i");
b.put(148, G - 1, "j").put(153, G - 1, "f").put(190, G - 1, "i").put(192, G - 1, "f").put(194, G - 1, "b");
b.put(218, G - 4, "r").put(95, 11, "o").put(139, G - 9, "&");

// Skilling: by the lake, over the fallen trunk and the rise, over the bog pits and stones, along the
// moose's back, up the big spruce at Ullevålseter, over the mound, the dash over the gorge, through
// the darkest part, and on the branches over the clearing.
const COINS: [number, number][] = [
  [8, 17], [9, 17], [10, 17],
  [37, 15], [38, 15], [39, 15], [40, 15],
  [50, 15], [52, 15], [54, 15],
  [61, 16], [62, 15], [63, 16],
  [72, 16], [76, 16], [77, 16], [81, 16],
  [91, 16], [94, 16], [97, 16], [100, 16],
  [105, 17], [106, 17],
  [122, 17], [123, 17],
  [135, 15], [138, 13], [134, 11], [137, 9], [138, 9],
  [145, 16], [146, 15], [150, 15], [151, 16],
  [159, 15], [160, 15], [161, 15],
  [166, 17], [167, 17], [175, 16], [176, 16], [182, 15], [184, 15],
  [188, 17], [189, 17],
  [200, 13], [202, 13], [204, 13], [221, 13], [223, 13],
  [209, 17], [216, 17]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The moose -------------------------------------------------------------------------------------------------
/** Its back, the ledge he rides: three tiles wide, a little over his head above the bog. */
export const MOOSE_BACK = G * TILE - 20;
export const MOOSE: Travel = { kind: "travel", from: { x: 87 * TILE, y: MOOSE_BACK }, to: { x: 101 * TILE, y: MOOSE_BACK }, w: 3 * TILE, period: 320 };
const CARRIERS: CarrierDef[] = [MOOSE];

// --- The troll ---------------------------------------------------------------------------------------------------
/** The clearing, where it sleeps, and where the dawn comes through for each hit. */
export const TROLL_DEF: TrollDef = {
  floor: G * TILE,
  x0: 200 * TILE,
  x1: 225 * TILE,
  x: 222 * TILE,
  wakeAt: 198 * TILE,
  dawn: [
    [203 * TILE, 208 * TILE],
    [210 * TILE, 215 * TILE],
    [217 * TILE, 222 * TILE]
  ]
};

/**
 * The forest at night: a hedgehog in the open by the lake first, where it can be seen; then foxes,
 * owls and bats in the dark, whose eyes catch the headlamp; squirrels that throw cones; an anthill.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "spiky", look: "hedgehog", c: 25, r: G - 1, range: 2 },
  { kind: "walker", look: "fox", c: 42, r: G - 1, range: 3, w: 12 },
  { kind: "flyer", look: "owl", c: 56, r: 13, range: 2, rise: 6, period: 170 },
  { kind: "walker", look: "fox", c: 108, r: G - 1, range: 1, w: 12 },
  { kind: "thrower", look: "squirrel", c: 111, r: G - 4, period: 200 },
  { kind: "flyer", look: "owl", c: 141, r: 13, range: 3, rise: 6, period: 180, offset: 50 },
  { kind: "walker", look: "fox", c: 172, r: G - 1, range: 2, w: 12 },
  { kind: "flyer", look: "bat", c: 178, r: 14, range: 3, rise: 10, period: 120 },
  { kind: "spiky", look: "anthill", c: 183, r: G - 1, speed: 0, w: 14, h: 8 },
  { kind: "thrower", look: "squirrel", c: 176, r: G - 1, period: 210, offset: 70 }
];



// --- The forest's own creatures: the bat and the anthill (drawn here, as no other level has them) -----------

// The bat and the anthill, drawn as frames (order 24; way 3, ADR 0045).
// A bat, 17 x 10, seen from the front: a plum body lit at the shoulders, pointed ears, two eyes, wings of dark membrane
// on lit finger bones, scalloped at their trailing edge; four wing frames on its own clock.
const BAT_BODY = [".M.M.", ".mmm.", ".eme.", "dmMmd", ".mmm.", ".dmd.", "..d.."];
const BAT_WING: Record<string, readonly string[]> = {
  up: ["M.......", "mM......", "dmM.....", ".ddmM...", "..dddmm.", "....d.d."],
  high: ["........", "MM......", "dmMM....", ".ddmmM..", "..d.dddm", "........"],
  level: ["........", "........", "MMMMMMm.", "dmddmddm", ".d..d.d.", "........"],
  down: ["........", "........", "......mM", "....mMdd", "..mMdd.d", "mMd.d..."]
};
const flip = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(""));
/** Its glam (order 27): its ears' tips in neon, shades across its face (a glint on each lens). */
const batFrame = (name: string, wing: string, dy = 0) =>
  frame(name, FOE_INK, [BAT_WING[wing], 0, 1 + dy], [flip(BAT_WING[wing]), 9, 1 + dy], [BAT_BODY, 6, dy], mark(["N.N"], 7, dy), mark(["lelel"], 6, 2 + dy));
const BAT: Looks = {
  w: 17,
  h: 10,
  idle: [batFrame("bat, gliding", "level"), batFrame("bat, gliding, lower", "level", 1)],
  move: [batFrame("bat, wings up", "up"), batFrame("bat, wings half up", "high"), batFrame("bat, wings out", "level"), batFrame("bat, wings down", "down")]
};

/** A heap of spruce needles, 18 x 10, lit at its top left and darker down its right, ants running over it in four frames. */
const HEAP = Array.from({ length: 10 }, (_, r) =>
  Array.from({ length: 18 }, (_, c) => {
    const half = Math.round(9 * Math.sqrt(Math.max(0, 1 - ((9.6 - r) / 10.2) ** 2)));
    if (Math.abs(c + 0.5 - 9) > half) return ".";
    const lit = (c - 9) * 0.6 + (r - 5) * 0.8;
    const grain = (c * 7 + r * 5) % 5 === 0;
    // Lit needles at the top left (a few catch the light), the shaded side plain; the near-black is the ants' alone.
    return lit < -3 ? (grain ? "a" : "O") : lit < 0.5 ? (grain ? "o" : "O") : lit < 3 ? (grain ? "O" : "o") : "o";
  }).join("")
);
const ANTS = [[[3, 7], [6, 3], [12, 4], [15, 8], [9, 1]], [[4, 5], [7, 2], [13, 5], [16, 9], [10, 1]], [[4, 4], [8, 1], [14, 6], [15, 7], [11, 2]], [[5, 3], [9, 1], [14, 7], [14, 6], [12, 3]]];
/** Its glam (order 27): a lightning bolt down its side in the level's neons. */
const ANTHILL_BOLT = ["...N", "..Nn", ".NNN", "..N.", ".n.."];
const anthillFrame = (k: number) => frame(`anthill, ants ${k + 1}`, FOE_INK, [HEAP], mark(ANTHILL_BOLT, 7, 3), ...ANTS[k].map(([c, r]) => [["l"], c, r] as [string[], number, number]));
const ANTHILL: Looks = { w: 18, h: 10, idle: [0, 1, 2, 3].map(anthillFrame), move: [0, 1, 2, 3].map(anthillFrame), rate: 6 };

// --- The dark ----------------------------------------------------------------------------------------------------
/** How dark it is along the level before any light: open by the lake, the marsh and at Ullevålseter, darkest before the clearing. */
const NIGHT: [number, number][] = [
  [0, 0],
  [14, 0],
  [28, 0.8],
  [86, 0.8],
  [89, 0.35],
  [103, 0.35],
  [106, 0.8],
  [117, 0.8],
  [120, 0.4],
  [139, 0.4],
  [142, 0.6],
  [154, 0.6],
  [157, 0.88],
  [196, 0.88],
  [199, 0.8],
  [COLS, 0.8]
];
function nightAt(x: number) {
  const c = x / TILE;
  for (let i = 1; i < NIGHT.length; i++) if (c <= NIGHT[i][0]) {
    const [c0, n0] = NIGHT[i - 1];
    const [c1, n1] = NIGHT[i];
    return n0 + ((Math.max(c0, c) - c0) / (c1 - c0)) * (n1 - n0);
  }
  return NIGHT[NIGHT.length - 1][1];
}
const FLOURISH = 160;
/** The dark at x: lifting in the clearing once the troll is stone, and everywhere as the sun comes up after the rune. */
function dark(x: number, v: View) {
  let n = nightAt(x);
  const t = v.troll;
  if (t?.phase === "stone" && x > 190 * TILE) n *= Math.max(0.3, 1 - (v.t - t.since) / 150);
  if (v.flourish !== null) n *= Math.max(0, 1 - v.flourish / FLOURISH);
  return n;
}

/** The trunk of a flag: where its blue mark is. */
const blazeY = (f: { bottom: number }) => f.bottom - 22;

/** What shows through the dark: the blue marks (brighter once raised), the hut's window, the mound's door, fireflies, the dawn, the rune. */
const SIGN_BOARDS = signBoards("nordmarka");
function lights(v: View): Light[] {
  const out: Light[] = [];
  for (const f of v.flags) out.push({ x: f.x, y: blazeY(f), rings: f.raisedAt === null ? [[7, 0.45], [4, 0]] : [[18, 0.55], [13, 0.3], [8, 0]] });
  // The trail's other blue marks, and the water of the bogs catching what light there is.
  for (const m of MARKS_ON_TRUNKS) out.push({ x: m.x + 1, y: m.y + 2, rings: [[5, 0.5], [3, 0.1]] });
  for (const c of BOG_TOPS) out.push({ rect: { x: c * TILE, y: G * TILE - 1, w: TILE, h: 3 }, dark: 0.45 });
  out.push({ rect: { x: HUT.x + 50, y: HUT.g - 57, w: 10, h: 9 }, dark: 0 });
  out.push({ x: HUT.x + 55, y: HUT.g - 52, rings: [[28, 0.55], [20, 0.3]] });
  const door = v.doors.get("maze");
  if (door) out.push({ x: door.x + door.w / 2, y: door.bottom - 10, rings: [[16, 0.5], [10, 0.2]] });
  // The invaders' neon sign: its tubes are lit after dark (order 32), so its board shows through, with a little light round it.
  for (const b of SIGN_BOARDS) out.push({ rect: b, dark: 0 }, { x: b.x + b.w / 2, y: b.y + b.h / 2, rings: [[9, 0.55], [6, 0.35]] });
  for (const f of fireflies(v.t)) out.push({ x: f.x, y: f.y, rings: [[3, 0.3]] });
  const t = v.troll;
  if (t) {
    const d = dawnNow(t);
    if (d) {
      out.push({ rect: { x: d[0] - 10, y: 0, w: d[1] - d[0] + 20, h: G * TILE + 4 }, dark: 0.4 });
      out.push({ rect: { x: d[0], y: 0, w: d[1] - d[0], h: G * TILE + 4 }, dark: 0 });
    }
    // The troll's eyes are what you see of it in the dark; once stone, the rune on it shines.
    if (t.phase === "stone") out.push({ x: t.x, y: TROLL_DEF.floor - TROLL.h - 12, rings: [[16, 0.3], [10, 0]] });
  }
  return out;
}

/** Fireflies over the marsh and the clearing at Ullevålseter, drifting. */
function fireflies(t: number) {
  const tt = view.reduced ? 0 : t;
  const out: { x: number; y: number; on: boolean }[] = [];
  for (let i = 0; i < 14; i++) {
    const cx = (i < 8 ? 90 + i * 1.7 : 120 + (i - 8) * 3) * TILE;
    out.push({ x: Math.round(cx + Math.sin(tt * 0.013 + i * 2.1) * 18), y: Math.round(G * TILE - 26 - i * 3 - Math.sin(tt * 0.021 + i) * 10), on: Math.floor(tt / 23 + i * 5) % 4 !== 0 });
  }
  return out;
}

// --- Art -----------------------------------------------------------------------------------------------------------
const P = PALETTE;
/** The clock for drawing the bog's ripples, which the tile drawing is not given: kept up by `back`. */
const VIEW_T = { t: 0 };
const at = (c: number, r: number) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? MAP[r][c] : ".");
function surfaceRow(c: number) {
  for (let r = 0; r < ROWS; r++) if (at(c, r) === "#" || at(c, r) === "K") return r;
  return ROWS;
}
/** The spruces along the path, and the blue trail marks painted on every third one in the trees. */
const TREES = Array.from({ length: 70 }, (_, i) => {
  const c = 15 + i * 3 + ((i * 7) % 3);
  return { i, c, x: c * TILE + ((i * 5) % 9), foot: surfaceRow(c) * TILE, h: 70 + ((i * 37) % 60) };
}).filter((tr) => !((tr.c > 86 && tr.c < 104) || (tr.c > 118 && tr.c < 141) || (tr.c > 156 && tr.c < 164) || tr.c > 195));
/** The trail's marks: on every third tree, and on the trunk just past the gorge, to show where the far side is. */
const GORGE_MARK = { x: 163 * TILE + 10, y: G * TILE - 26 };
const MARKS_ON_TRUNKS = [...TREES.filter((tr) => tr.i % 3 === 1 && tr.c > 24).map((tr) => ({ x: tr.x - 1, y: tr.foot - 26 })), GORGE_MARK];
/** The bog's surface tiles, which catch the light. */
const BOG_TOPS = Array.from({ length: COLS }, (_, c) => c).filter((c) => at(c, G) === "w");
/** Ullevålseter's hut: its left end and the ground it stands on. */
const HUT = { x: 124 * TILE, g: G * TILE, w: 8 * TILE };

/** The far ridges of Nordmarka, forest to the horizon, and a glow of dawn over them once the troll is stone. */
function farRidges(v: View) {
  const base = 150 + view.camY * 0.9;
  const dawn = v.flourish !== null ? Math.min(1, v.flourish / 80) : v.troll?.phase === "stone" ? 0.35 : 0;
  if (dawn > 0) for (let k = 0; k < 5; k++) for (let x = 0; x < view.w; x++) column(x, base - 70 + k * 8, base - 62 + k * 8, mix(FOREST.dawnPale, FOREST.dawn, k / 5));
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 30 + 10 * Math.sin(wx * 0.004 + 1) + 5 * Math.sin(wx * 0.013);
    column(x, base - h, base + 400, LAND.farHills);
    // Spruce tops along the ridge, in the layer's own pixels.
    const lx = Math.floor(wx * 0.12);
    const k = ((lx % 5) + 5) % 5;
    column(x, base - h - [0, 2, 4, 2, 0][k], base - h + 3, mix(LAND.headland, LAND.farHills, 0.4));
  }
}

// The trees are the same pixels wherever they stand, and a spruce is a hundred rows: each shape is drawn
// once and copied after (ADR 0036), and what is off the screen is not drawn at all. The pictures are
// the same to the byte.

/** Nearer forest: rows of spruce, darker the nearer. */
function midSpruces() {
  const base = 220 + view.camY * 0.75;
  for (const far of [true, false]) for (let i = 0; i < 160; i++) {
    // Every other one a little farther, slower, and drawn first (order 23: more speeds, split from what the layer has).
    if ((i % 2 === 1) !== far) continue;
    const wx = i * 31 + ((i * 17) % 23);
    const x = spedX(far ? (wx * 0.2) / 0.16 : wx, far ? 0.16 : 0.2, 0.2);
    if (x < -12 || x > view.w + 12) continue;
    const h = 26 + ((i * 29) % 26);
    const colour = mix(LAND.headland, LAND.farHills, 0.15 + (i % 3) * 0.05);
    const halfOf = (k: number) => Math.floor(1 + (k % 6) * 0.7 + k * 0.2);
    let most = 0;
    for (let k = 0; k < h; k++) most = Math.max(most, halfOf(k));
    // Its spire over the top tier (order 26, section 3c): two pixels, one wide; the piece two rows taller for it.
    stamp(`nm-mid ${h} ${i % 3}`, x - most, Math.round(base) - h - 2 - view.camY, most * 2 + 1, h + 2, () => {
      R(most, 0, 1, 2, colour);
      for (let k = 0; k < h; k++) R(most - halfOf(k), k + 2, halfOf(k) * 2 + 1, 1, colour);
    });
  }
}

/** Big spruce trunks just behind the path, between the clearings. */
function nearTrunks() {
  for (const far of [true, false]) for (let i = 0; i < 70; i++) {
    // Every other one a little farther, slower, and drawn first (order 23: more speeds, split from what the layer has).
    if ((i % 2 === 1) !== far) continue;
    const wx = i * 58 + ((i * 37) % 30);
    const c = Math.floor(wx / TILE);
    if ((c > 0 && c < 16) || (c > 87 && c < 104) || (c > 119 && c < 140)) continue;
    const x = spedX(far ? (wx * 0.4) / 0.3 : wx, far ? 0.3 : 0.4, 0.4);
    if (x < -20 || x > view.w + 20) continue;
    const foot = G * TILE;
    const h = 90 + ((i * 23) % 40);
    const halfOf = (k: number) => Math.floor(3 + (k % 14) * 0.9 + k * 0.08);
    let most = 2;
    for (let k = 0; k < h - 20; k += 2) if (k % 14 >= 2) most = Math.max(most, halfOf(k));
    stamp(`nm-near ${h}`, x + 2 - most, foot - h - view.camY, most * 2, h, () => {
      R(most - 2, 0, 4, h, mix(FOREST.trunk, LAND.headland, 0.4));
      for (let k = 0; k < h - 20; k += 2) {
        if (k % 14 < 2) continue;
        R(most - halfOf(k), k, halfOf(k) * 2, 2, mix(FOREST.needlesDark, LAND.headland, 0.35));
      }
    });
  }
}

/** A spruce in the street layer: a trunk, tiers of needles, lighter at each tier's top edge, a spire over the top tier (order 26, section 3c). */
function spruce(x: number, foot: number, h: number, seed: number) {
  const tiers = 5 + (seed % 3);
  const step = Math.floor((h - 12) / tiers);
  const halfOf = (k: number) => Math.floor(2 + (k % step) * 1.3 + Math.floor(k / step) * 1.6);
  let most = 2;
  for (let k = 0; k < h - 12; k++) most = Math.max(most, halfOf(k));
  // Its left edge, one more than its widest row for the dark tip at each tier's foot.
  const left = x - most - 1;
  if (!seen(left, x + most)) return;
  // The spire: a pixel, a pixel, two, over the top tier's four; the piece three rows taller for it.
  const S = 3;
  stamp(`nm-spruce ${h} ${tiers}`, left - view.camX, foot - h - S - view.camY, most * 2 + 1, h + S, () => {
    const cx = most + 1;
    R(cx - 1, 0, 1, 2, FOREST.needlesLight);
    R(cx - 1, 2, 2, 1, FOREST.needles);
    R(cx - 2, S + 10, 4, h - 10, FOREST.trunk);
    R(cx - 2, S + 10, 1, h - 10, FOREST.trunkDark);
    for (let k = 0; k < h - 12; k++) {
      const inTier = k % step;
      const half = halfOf(k);
      const col = inTier === 0 ? FOREST.needlesLight : inTier > step - 3 ? FOREST.needlesDark : FOREST.needles;
      R(cx - half, S + k, half * 2, 1, col);
      if (inTier === step - 1) R(cx - half - 1, S + k, 2, 1, FOREST.needlesDark);
    }
  });
}

/** Ferns and blueberry heather at the foot of the trees. */
function undergrowth(x: number, foot: number, seed: number) {
  for (let k = 0; k < 4; k++) {
    const h = 4 + ((seed + k * 3) % 4);
    R(x + k * 3, foot - h, 1, h, PLANTS.leaves);
    R(x + k * 3 - 1, foot - h + 1, 3, 1, PLANTS.leavesShine);
  }
  if (seed % 3 === 0) for (let k = 0; k < 3; k++) R(x + 12 + k * 2, foot - 3, 1, 1, mix(PAINT.tbane, INK, 0.3));
}

/** Sognsvann: the lake at the end of the line, its far shore of spruce, and the station's shelter. */
function sognsvann(v: View) {
  const g = G * TILE;
  R(0, g - 22, 18 * TILE, 18, P.water);
  for (let k = 0; k < 18 * TILE; k += 9) R(k + ((k * 7) % 5), g - 20 + (k % 4) * 4, 4, 1, mix(P.water, P.foam, 0.4));
  R(0, g - 28, 18 * TILE, 6, LAND.headland);
  for (let x = 4; x < 18 * TILE; x += 11) for (let k = 0; k < 14; k++) R(x - Math.floor(k / 3), g - 42 + k, Math.floor(k / 3) * 2 + 1, 1, LAND.headlandDark);
  // The shelter at the end of the line.
  R(0, g - 40, 7 * TILE, 3, ROOF.slate);
  for (const x of [4, 7 * TILE - 6]) R(x, g - 37, 2, 37, P.ironDark);
  R(20, g - 32, 44, 9, PAINT.tbane);
  R(22, g - 30, 40, 5, WHITE);
  for (let i = 0; i < 5; i++) R(25 + i * 7, g - 29, 4, 3, PAINT.tbane);
  tbaneDoor(v.doors.get("tbane"));
}

/** The marsh: open sky over it, bog cotton, a dead spruce standing in it. */
function marsh() {
  const g = G * TILE;
  for (let x = 88 * TILE; x < 104 * TILE; x += 5) {
    R(x, g - 3 - ((x * 7) % 4), 1, 3 + ((x * 7) % 4), FOREST.sedge);
    if ((x * 13) % 7 < 2) R(x - 1, g - 6 - ((x * 7) % 4), 2, 2, FOREST.cotton);
  }
  const x = 96 * TILE;
  R(x, g - 80, 3, 80, mix(FOREST.trunk, STONE.base, 0.4));
  for (const [dx, y, w] of [[-8, 20, 8], [3, 30, 10], [-6, 44, 6], [3, 52, 7]] as const) R(x + dx, g - 80 + y, w, 1, mix(FOREST.trunk, STONE.base, 0.4));
}

/** Ullevålseter: a two-storey timber house, its corners' log ends, a gallery along the upper floor (the map's ledge) with the bench, a turf roof, a chimney, one window lit. */
function ullevalseter(v: View) {
  const { x, g, w } = HUT;
  const top = g - 64;
  R(x, top, w, 64, FOREST.hut);
  for (let y = top + 4; y < g; y += 5) R(x, y, w, 1, FOREST.hutLine);
  for (let y = top + 1; y < g; y += 5) {
    R(x - 3, y, 4, 3, mix(FOREST.hut, WHITE, 0.25));
    R(x + w - 1, y, 4, 3, mix(FOREST.hut, WHITE, 0.25));
  }
  // The turf roof, grass growing on it.
  for (let i = 0; i < 16; i++) R(x - 6 + i * 2, top - 16 + i, w + 12 - i * 4, 1, i < 2 ? P.grass : i % 3 === 0 ? P.grassDark : FOREST.moss);
  R(x - 6, top, w + 12, 2, FOREST.hutLine);
  R(x + w - 30, top - 30, 8, 20, STONE.base);
  if (!view.reduced) smoke(x + w - 28, top - 32, v.t, STOVE_SMOKE);
  // Upstairs: the one window that is lit, over the gallery.
  R(x + 49, g - 58, 12, 11, PAINT.trim);
  R(x + 50, g - 57, 10, 9, LAMP);
  // An oil lamp inside: it gutters now and then and flares (order 24), steady with reduced motion.
  const burn = lampFlicker(v.t, 3);
  if (burn !== 1) R(x + 50, g - 51, 10, 3, burn ? mix(LAMP, WHITE, 0.35) : mix(LAMP, INK, 0.25));
  R(x + 54, g - 57, 1, 9, PAINT.trim);
  R(x + 50, g - 53, 10, 1, PAINT.trim);
  light(x + 50, g - 57, 4, 4);
  light(x + 55, g - 57, 5, 4);
  // The gallery: posts down from its planks, a rail along it.
  for (const px of [x + 16, x + 40, x + 63]) R(px, g - 32, 2, 32, P.woodDark);
  R(x + 16, g - 44, 49, 2, P.woodDark);
  for (let px = x + 20; px < x + 64; px += 5) R(px, g - 43, 1, 11, P.woodDark);
  // Downstairs: a dark window and the door.
  R(x + 92, g - 27, 12, 11, PAINT.trim);
  R(x + 93, g - 26, 10, 9, GLASS.farWindow);
  R(x + 72, g - 28, 14, 28, PAINT.homeDoor);
  R(x + 74, g - 26, 10, 10, PAINT.homeDoorPanel);
  R(x + 82, g - 15, 2, 2, LAMP);
}

/** Jernhaugen from outside: a grassy mound with standing stones on it, and its stone door, a torch glowing inside. */
function mound(v: View) {
  const d = v.doors.get("maze");
  if (!d) return;
  const cx = d.x + d.w / 2;
  const g = d.bottom;
  for (let dx = -70; dx <= 70; dx++) {
    const h = Math.round(54 * Math.exp(-((dx / 42) ** 2)));
    if (h < 2) continue;
    R(cx + dx, g - h, 1, h, P.grass);
    R(cx + dx, g - h, 1, 2, mix(P.grass, WHITE, 0.15));
    if ((cx + dx) % 9 < 2) R(cx + dx, g - h + 4 + (dx & 7), 1, 2, P.grassDark);
  }
  for (const [dx, h] of [[-12, 11], [0, 14], [13, 10]] as const) {
    R(cx + dx, g - 54 - h + 2, 4, h, P.rock);
    R(cx + dx, g - 54 - h + 2, 1, h, mix(P.rock, WHITE, 0.25));
  }
  const top = d.bottom - d.h;
  const edge = mix(P.rockDark, INK, 0.4);
  R(d.x - 7, top - 3, 5, d.h + 3, edge);
  R(d.x - 6, top - 3, 3, d.h + 3, P.rock);
  R(d.x + d.w + 2, top - 3, 5, d.h + 3, edge);
  R(d.x + d.w + 3, top - 3, 3, d.h + 3, P.rock);
  R(d.x - 9, top - 6, d.w + 18, 6, edge);
  R(d.x - 8, top - 5, d.w + 16, 4, P.rock);
  plankDoor2(d, DOORWAY.wood);
  // The torch inside, through the door's crack, flickering in three frames (order 24; still with reduced motion).
  if (!d.open) flame(d.x + 7, d.bottom - 11, v.t);
}

/** The gorge: its rock walls going down into the dark. */
function gorge() {
  kept("nm-gorge", 158 * TILE, G * TILE, 5 * TILE, (ROWS - G) * TILE, () => {
    for (let x = 158 * TILE; x < 163 * TILE; x++) {
      for (let y = G * TILE; y < ROWS * TILE; y += 4) R(x, y, 1, 4, mix(STONE.dark, INK, Math.min(0.85, (y - G * TILE) / 90)));
      if ((x * 7) % 13 === 0) R(x, G * TILE + 2 + (x % 9), 1, 6, STONE.moss);
    }
  });
}

/** The clearing: the canopy over it with the gap the dawn comes through, and the dawn falling on the floor. */
function clearing(v: View) {
  const t = v.troll;
  const d = t ? dawnNow(t) : null;
  // The light on the floor where the dawn falls.
  if (d) R(d[0], G * TILE - 1, d[1] - d[0], 2, FOREST.dawnPale);
  // Old spruce round the clearing.
  for (const [c, h] of [[197, 150], [207.5, 170], [215.5, 160], [227, 180]] as const) spruce(c * TILE, G * TILE, h, Math.floor(c));
}

/**
 * The dawn falling through the gap, drawn over the dark: a shaft of warm light added to what is there,
 * brightest on the floor where it makes a pool, and its motes. It cannot be missed: it is the way to
 * beat the troll. While the troll's club is stuck the shaft and its pool pulse (with reduced motion
 * they burn steadily brighter instead).
 */
function dawnShaft(v: View) {
  const t = v.troll;
  const d = t ? dawnNow(t) : null;
  if (!d || !t) return;
  const g = ctx();
  g.globalCompositeOperation = "lighter";
  // It comes down through the canopy, not out of the top of the screen, however tall the screen is.
  const top = Math.max(view.camY, 0);
  const stuck = t.phase === "stuck";
  const pulse = stuck ? (view.reduced ? 1 : 0.5 + 0.5 * Math.sin(v.t * 0.18)) : 0;
  for (let x = d[0]; x < d[1]; x++) {
    const edge = Math.min(x - d[0], d[1] - 1 - x);
    const a = (edge < 3 ? 0.08 : 0.16) + pulse * 0.1;
    R(x, top, 1, G * TILE - top, `rgba(255, 190, 110, ${a.toFixed(3)})`);
    // A slant of rays across it, as light through branches falls (still, with reduced motion: order 30).
    if ((x + (view.reduced ? 0 : Math.floor(v.t / 30))) % 9 < 2) R(x, top, 1, G * TILE - top, "rgba(255, 210, 150, 0.07)");
  }
  // The pool of light on the floor, and its edges, where it has to stand.
  R(d[0] - 6, G * TILE - 3, d[1] - d[0] + 12, 3, `rgba(255, 200, 120, ${(0.35 + pulse * 0.35).toFixed(3)})`);
  R(d[0], G * TILE - 1, d[1] - d[0], 3, `rgba(255, 225, 160, ${(0.45 + pulse * 0.4).toFixed(3)})`);
  for (const ex of [d[0], d[1] - 1]) R(ex, G * TILE - 10, 1, 10, `rgba(255, 220, 150, ${(0.2 + pulse * 0.3).toFixed(3)})`);
  g.globalCompositeOperation = "source-over";
  // While its club is stuck, where it has to stand is marked in the bosses' "now" colour (order 18).
  if (stuck && (view.reduced || pulse > 0.3)) {
    R(d[0], G * TILE - 1, d[1] - d[0], 1, ROLES.now);
    for (const ex of [d[0], d[1] - 1]) R(ex, G * TILE - 8, 1, 7, ROLES.now);
  }
  if (!view.reduced)
    for (let i = 0; i < 12; i++) {
      const k = ((v.t * 0.25 + i * 37) % 160) / 160;
      R(d[0] + ((i * 23) % (d[1] - d[0])), G * TILE - 150 + k * 140, 1, 1, FOREST.dawnPale);
    }
}

/** Once the troll is stone the sun comes up: slanting rays through the trees of the clearing, stronger after the rune. */
function sunrise(v: View) {
  const t = v.troll;
  if (!t || t.phase !== "stone") return;
  const k = Math.min(1, (v.t - t.since) / 150) * 0.5 + (v.flourish !== null ? Math.min(1, v.flourish / 100) * 0.5 : 0);
  if (k <= 0) return;
  const g = ctx();
  g.globalCompositeOperation = "lighter";
  const top = Math.max(view.camY, 0);
  for (let s = 0; s < 5; s++) {
    const x0 = (198 + s * 6.5) * TILE;
    for (let y = top; y < G * TILE; y += 2) {
      const x = Math.round(x0 + (y - top) * 0.35);
      R(x, y, 10 + (s % 2) * 6, 2, `rgba(255, 196, 120, ${(0.07 * k).toFixed(3)})`);
    }
  }
  R(196 * TILE, G * TILE - 3, 33 * TILE, 3, `rgba(255, 200, 120, ${(0.25 * k).toFixed(3)})`);
  g.globalCompositeOperation = "source-over";
}

/** The trail's mark: a spruce trunk with a blue band painted on it; once raised, the band shines and a little blue flag hangs on it. */
function blueTrunk(f: { x: number; bottom: number }, raisedAt: number | null, t: number) {
  const x = f.x - 2;
  R(x, f.bottom - 60, 5, 60, FOREST.trunk);
  R(x, f.bottom - 60, 1, 60, FOREST.trunkDark);
  R(x + 4, f.bottom - 60, 1, 60, mix(FOREST.trunk, WHITE, 0.15));
  for (let y = f.bottom - 58; y < f.bottom; y += 7) R(x + 1, y, 3, 1, FOREST.trunkDark);
  const y = blazeY(f) - 3;
  R(x, y, 5, 6, FOREST.blaze);
  R(x, y, 5, 1, FOREST.blazeLight);
  if (raisedAt === null) return;
  const k = view.reduced ? 1 : Math.min(1, (t - raisedAt) / HOIST_STEPS);
  R(x + 1, y + 1, 3, 4, FOREST.blazeLight);
  // A strip of blue ribbon tied round the trunk, fluttering out once it is up.
  const len = Math.round(8 * k);
  const flap = view.reduced ? 0 : Math.floor(t / 10) % 2;
  R(x + 5, y + 1, len, 2, FOREST.blaze);
  R(x + 5 + len - 2, y + 3 + flap, 2, 1, FOREST.blaze);
  void POLE;
}

// The moose, drawn as a frame (order 24; way 3, ADR 0045): its body lit along the back he rides and shaded to its belly,
// rough hair in it, the hump over its shoulders, the long head hanging forward with an eye, a nostril and the bell
// under its throat, the antlers' palms lit on their top edge; its legs walk in four frames by the distance it goes.
const MOOSE_INK: Record<string, string> = { L: mix(FOREST.mooseLight, WHITE, 0.15), l: FOREST.mooseLight, m: FOREST.moose, d: FOREST.mooseDark, D: mix(FOREST.mooseDark, INK, 0.35), e: INK, A: mix(FOREST.antler, WHITE, 0.3), a: FOREST.antler, b: mix(FOREST.antler, INK, 0.3) };
const MOOSE_BODY = Array.from({ length: 11 }, (_, r) =>
  Array.from({ length: 44 }, (_, c) => {
    if ((r === 0 && (c < 2 || c > 41)) || (r === 1 && c < 1) || (r === 10 && (c < 3 || c > 40))) return ".";
    const fleck = (c * 7 + r * 11) % 9 === 0;
    if (r === 0) return c < 30 ? "L" : "l";
    if (r < 3) return fleck ? "L" : c < 20 ? "l" : "m";
    if (r < 7) return fleck ? "d" : "m";
    if (r < 10) return fleck ? "D" : "d";
    return "D";
  }).join("")
);
const MOOSE_HUMP = ["..llllll", ".lLLllmm", "lLlmmmmm"];
const MOOSE_HEAD = ["..lllll.....", ".lLmmmmmll..", "lmmemmmmmmml", "mmmmmmmmmmdD", ".mmdmmmmddDD", "..ddd..dDDe.", "...dd.......", "...dd.......", "....d......."];
const MOOSE_ANTLERS = ["A.A.A.......A.A", "aAaAa.....AaAa.", ".aaab.....baa..", "..bb.......bb..", "...b.......b...", "....b.....b...."];
export const MOOSE_TOP = frame("moose", MOOSE_INK, [MOOSE_ANTLERS, 44, -8], [MOOSE_HUMP, 38, -3], [MOOSE_BODY, 2, 0], [MOOSE_HEAD, 46, 1]);

/** The moose: a long brown body under its back (what he stands on), a hump, long legs walking, a heavy head and antlers the way it walks. */
function moose(at: { x: number; y: number }, t: number) {
  const now = carrierAt(MOOSE, t);
  const before = carrierAt(MOOSE, t - 2);
  const dir = now.x > before.x ? 1 : now.x < before.x ? -1 : t % MOOSE.period < MOOSE.period / 2 ? 1 : -1;
  const { x, y } = at;
  const w = MOOSE.w;
  // Legs: two pairs, by the distance it has walked (four frames, three pixels each: apart, passing, apart, passing).
  const k = ((Math.floor(x / 3) % 4) + 4) % 4;
  const swing = [1, 0, -1, 0][k];
  const ground = G * TILE;
  for (const [lx, s] of [[6, swing], [11, -swing], [w - 13, -swing], [w - 8, swing]] as const) {
    const at = dir > 0 ? x + lx + s : x + w - lx - 2 - s;
    R(at, y + 10, 1, ground - y - 13, FOREST.mooseDark);
    R(at + 1, y + 10, 1, ground - y - 13, MOOSE_INK.D);
    R(at, y + 10, 1, 4, FOREST.moose);
    R(at - 1, ground - 3, 3, 2, INK);
  }
  paint(MOOSE_TOP, x, y, dir, w);
  void t;
}

/**
 * The troll: three times his height, a hunched back, a round belly, a great nose, long arms, a club,
 * a tail with a tuft. Asleep it is a boulder (with a bump that might be a nose); it unfolds as it
 * wakes; the club goes up for a second before every slam and sticks in the ground after; each hit of
 * the dawn turns a third of it to stone from the feet up, and at the end it is all stone.
 */
// Its tones (order 24; way 3, ADR 0045): five of hide from its hair's dark to a lit shoulder, five of stone for what the
// dawn has turned, the nose's, the hair's and the club's, each shaded pixel by pixel from the top left of the screen
// whichever way it faces: a lit shoulder and head, a shaded belly and underside, legs and arms lit down their left.
const HIDE = [FOREST.trollHair, FOREST.trollDark, FOREST.troll, FOREST.trollLight, mix(FOREST.trollLight, WHITE, 0.22)];
const STONE_TONES = [mix(FOREST.stoneDark, INK, 0.25), FOREST.stoneDark, FOREST.stone, FOREST.stoneLight, mix(FOREST.stoneLight, WHITE, 0.25)];
/**
 * After dusk (order 25: its shading was barely there in the dark) the lit side of its hide and its stone catches a little
 * moonlight over the forest's dark: its two lightest tones are noted as it is drawn (`TROLL_LIT`) and drawn again, faint,
 * over the dark with what else shines there (`overDark`). Drawing only.
 */
const rimOf = (c: string, a: number) => {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
const TROLL_RIM = new Map<string, string>([HIDE[3], HIDE[4], STONE_TONES[3], STONE_TONES[4]].map((c, i) => [c, rimOf(c, i % 2 ? 0.35 : 0.2)]));
/** The runs of its lit side as this frame drew them (x, y, width, colour): what `overDark` lights. */
const TROLL_LIT: { x: number; y: number; w: number; c: string }[] = [];
let trollLitN = 0;
const NOSE = [mix(FOREST.trollNose, INK, 0.3), FOREST.trollNose, mix(FOREST.trollNose, WHITE, 0.2)];
const HAIR = [mix(FOREST.trollHair, INK, 0.3), FOREST.trollHair, FOREST.trollDark];
const MOSS = [mix(FOREST.moss, INK, 0.25), FOREST.moss, FOREST.mossLight];
const CLUB = [mix(FOREST.club, INK, 0.3), FOREST.club, mix(FOREST.club, WHITE, 0.18)];
/**
 * Its glam (order 27, ADR 0050), as big as it is: its moss gone magenta and grown into a mullet down its back, and a spiked
 * wristband on its club arm. It is gone as the dawn turns it (stone takes the hair as moss again) and at the end.
 */
const GLAM_HAIR = [ENEMY.plumDark, ENEMY.magenta, ENEMY.plumLight];
const BAND = [ENEMY.line, mix(ENEMY.line, WHITE, 0.2), mix(ENEMY.line, WHITE, 0.35)];
/** Where its head is, in its own frame (forward, up from the floor), as its body is drawn: what its eyes in the dark follow. */
function trollHead(t: Troll, step: number) {
  const bend = t.phase === "stuck" ? 4 + (Math.floor(step / 30) % 2) : 0;
  const walking = t.phase === "walk" || t.phase === "retreat";
  const lift = walking && [1, 0, -1, 0][((Math.floor((t.dir > 0 ? t.x : -t.x) / 4) % 4) + 4) % 4] === 0 ? 1 : 0;
  return { bend, walking, lift, hx: 7 + bend, hy: 31 - bend * 2 + lift };
}

function trollBody(t: Troll, v: View) {
  const step = v.t;
  const fl = TROLL_DEF.floor;
  const x = Math.round(t.x);
  const age = step - t.since;
  const f = t.dir;
  /** A row of pixels from screen x0 to x1 (exclusive), each its tone from `tone(x)` in `ramp`, joined into runs. */
  const dusk = v.sky.phase !== "day";
  trollLitN = 0;
  const row = (x0: number, x1: number, y: number, ramp: readonly string[], tone: (sx: number) => number) => {
    let start = x0;
    let k = tone(x0);
    for (let sx = x0 + 1; sx <= x1; sx++) {
      const n = sx < x1 ? tone(sx) : -1;
      if (n === k) continue;
      const c = ramp[Math.max(0, Math.min(ramp.length - 1, k))];
      R(start, y, sx - start, 1, c);
      const rim = dusk ? TROLL_RIM.get(c) : undefined;
      if (rim) {
        const l = TROLL_LIT[trollLitN] ?? (TROLL_LIT[trollLitN] = { x: 0, y: 0, w: 0, c: "" });
        Object.assign(l, { x: start, y, w: sx - start, c: rim });
        trollLitN++;
      }
      start = sx;
      k = n;
    }
  };
  /** Light from the top left of the screen on a point of a shape (its offset over its half-width and half-height). */
  const lightOn = (nx: number, ny: number) => -(0.55 * nx + 0.85 * ny);
  const step2 = (l: number) => (l > 0.55 ? 1 : l < -0.75 ? -2 : l < -0.3 ? -1 : 0);
  if (t.phase === "asleep" || (t.phase === "waking" && age < TROLL_STEPS.waking / 2)) {
    // A mossy boulder, its nose a bump on one side, lit at its top left; asleep it breathes (its back up a pixel every
    // other second, order 23); waking, it shakes.
    const shake = t.phase === "waking" && !view.reduced ? (age % 4 < 2 ? 1 : -1) : 0;
    const breath = t.phase === "asleep" ? Math.floor(step / 60) % 2 : 0;
    const top = 23 + breath;
    for (let k = 0; k < 24 + breath; k++) {
      const half = Math.round(17 * Math.sqrt(Math.max(0, 1 - ((k - 2) / top) ** 2)));
      const y = fl - k - 1;
      const moss = k > 18 + breath;
      row(x - half + shake, x + half + shake, y, moss ? MOSS : STONE_TONES, (sx) => {
        const l = lightOn((sx - x - shake) / 17, -(k - 11) / 12);
        const crack = !moss && (k % 5 === 0 || (sx * 7 + k * 3) % 23 === 0);
        return (moss ? 1 : 2) + step2(l) - (crack ? 1 : 0);
      });
    }
    R(x - 13 + shake, fl - 12, 5, 5, FOREST.stone);
    R(x - 13 + shake, fl - 12, 5, 1, FOREST.stoneLight);
    R(x - 14 + shake, fl - 11, 2, 3, FOREST.stoneDark);
    R(x - 6 + shake, fl - 15, 4, 3, FOREST.lichen);
    R(x + 6 + shake, fl - 9, 3, 2, FOREST.lichen);
    return;
  }
  const stoneBelow = t.phase === "stone" ? -Infinity : t.hits === 0 ? Infinity : fl - Math.round((TROLL.h * t.hits) / 3);
  const flash = t.phase === "hit" && !view.reduced && Math.floor(age / 4) % 2 === 0;
  /** The ramp a part is drawn in at a row: its own, or stone where the dawn has turned it. */
  const rampAt = (y: number, ramp: readonly string[]) => (y < stoneBelow ? ramp : ramp === HIDE ? STONE_TONES : ramp === HAIR || ramp === GLAM_HAIR ? MOSS : ramp === NOSE || ramp === BAND ? STONE_TONES : ramp);
  const baseAt = (y: number, ramp: readonly string[], base: number) => (y < stoneBelow || ramp === HIDE ? base : ramp === NOSE ? 3 : base);
  /** A filled ellipse round (cx, cy), in the troll's own frame (cx forward, cy up from the floor), lit from the top left. */
  const blob = (cx: number, cy: number, rx: number, ry: number, ramp: readonly string[], base: number) => {
    const mx = f > 0 ? x + cx : x - cx;
    for (let dy = -ry; dy <= ry; dy++) {
      const half = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)) + 0.3);
      const y = fl - cy + dy;
      row(mx - half, mx + half + 1, y, rampAt(y, ramp), (sx) => baseAt(y, ramp, base) + step2(lightOn((sx - mx) / (rx + 0.5), dy / (ry + 0.5))));
    }
  };
  /** A box (a leg, an arm, a foot), lit down its left side and shaded down its right, in the troll's own frame. */
  const box = (cx: number, cy: number, w: number, h: number, ramp: readonly string[], base: number) => {
    const x0 = f > 0 ? x + cx : x - cx - w;
    for (let k = 0; k < h; k++) {
      const y = fl - cy - k - 1;
      row(x0, x0 + w, y, rampAt(y, ramp), (sx) => baseAt(y, ramp, base) + (w > 2 && sx === x0 ? 1 : w > 2 && sx === x0 + w - 1 ? -1 : 0) + (k === 0 && h > 2 ? -1 : 0));
    }
  };
  // Its club stuck, it heaves (a pixel, every other second); walking, a cycle of four by the distance it covers (order 23).
  const { bend, walking, lift, hx, hy } = trollHead(t, step);
  const stride = walking ? [1, 0, -1, 0][((Math.floor((f > 0 ? t.x : -t.x) / 4) % 4) + 4) % 4] : 0;
  // The tail, behind, with its tuft.
  for (let k = 0; k < 8; k++) box(-14 - k, 12 - Math.floor(k * 0.8), 1, 1, HIDE, 1);
  blob(-22, 4, 2, 2, HAIR, 1);
  // Legs and feet.
  box(-9 + stride, 0, 8, 3, HIDE, 1);
  box(2 - stride, 0, 8, 3, HIDE, 1);
  box(-8 + stride, 3, 6, 7, HIDE, 2);
  box(3 - stride, 3, 6, 7, HIDE, 2);
  // The body: a hunched back, a round belly (shaded under), the lit shoulder.
  blob(-5, 25 - bend + lift, 9, 7, HIDE, 1);
  blob(0, 18 - bend / 2 + lift, 13, 11, HIDE, 2);
  blob(4, 16 - bend / 2 + lift, 7, 7, HIDE, 3);
  blob(-6, 26 - bend + lift, 7, 5, HIDE, 2);
  // The head, forward and low; its ear, nose, mouth and hair; an eye under the brow.
  blob(hx, hy, 7, 6, HIDE, 2);
  blob(hx - 6, hy + 1, 2, 3, HIDE, 1);
  blob(hx + 7, hy - 1, 4, 4, NOSE, 1);
  box(hx + 9, hy - 3, 2, 1, NOSE, 0);
  box(hx + 1, hy - 5, 6, 1, [INK], 0);
  box(hx + 4, hy - 5, 1, 2, [FOREST.dawnPale], 0);
  if (t.phase !== "stone" && fl - hy - 5 < stoneBelow) {
    R(f > 0 ? x + hx - 1 : x - hx - 1, fl - hy - 5, 2, 1, INK);
    R(f > 0 ? x + hx + 2 : x - hx - 3, fl - hy - 5, 1, 1, INK);
  }
  // Its hair: under the glamour magenta, and long down its back in a mullet (order 27); stone at the end.
  const hair = t.phase === "stone" ? HAIR : GLAM_HAIR;
  for (const [dx, dy, w] of [[-5, 6, 4], [-2, 7, 5], [3, 6, 3], [-8, 3, 3]] as const) box(hx + dx, hy + dy, w, 2, hair, 1);
  if (hair === GLAM_HAIR) {
    box(hx - 10, hy - 4, 3, 8, hair, 1);
    box(hx - 12, hy - 6, 2, 6, hair, 0);
    box(hx - 9, hy - 6, 2, 2, hair, 2);
  }
  /** Its spiked wristband at (cx, cy) on its arm, in its own frame: a black band, its spikes out either side. */
  const wristband = (cx: number, cy: number) => {
    if (t.phase === "stone") return;
    box(cx, cy, 4, 2, BAND, 1);
    for (const [sx, sy] of [[-1, 0], [4, 0], [-1, 1], [4, 1]] as const) if (fl - cy - sy - 1 < stoneBelow) R(f > 0 ? x + cx + sx : x - cx - sx - 1, fl - cy - sy - 1, 1, 1, ENEMY.pale);
  };
  // The arm and the club: hanging, raised (the telegraph), or stuck in the ground.
  if (t.phase === "windup") {
    const raise = Math.min(1, age / 14);
    box(6, 22, 4, 6 + Math.round(12 * raise), HIDE, 2);
    wristband(6, 22 + 4 + Math.round(12 * raise) - 2);
    // The club raised, its tell, in the bosses' "now" colour (order 18).
    for (let k = 0; k < 16; k++) R(f > 0 ? x + 6 + Math.round(k * (1 - raise)) : x - 10 - Math.round(k * (1 - raise)), fl - 34 - Math.round(raise * 10) - Math.round(k * raise), 4, 2, ROLES.now);
    R(f > 0 ? x + 5 : x - 11, fl - 54 - Math.round(raise * 2), 6, 6, ROLES.now);
  } else if (t.phase === "stuck") {
    box(9, 10, 4, 12, HIDE, 2);
    wristband(9, 11);
    for (let k = 0; k < 14; k++) {
      R(f > 0 ? x + 13 + k : x - 17 - k, fl - 14 + k, 4, 2, FOREST.club);
      R(f > 0 ? x + 13 + k : x - 17 - k, fl - 14 + k, 4, 1, CLUB[2]);
    }
    R(f > 0 ? x + 25 : x - 31, fl - 5, 7, 5, mix(FOREST.club, INK, 0.2));
    R(f > 0 ? x + 25 : x - 31, fl - 5, 7, 1, FOREST.club);
  } else {
    box(9, 8, 4, 16 - stride, HIDE, 2);
    blob(11, 7 + stride, 2, 2, HIDE, 1);
    wristband(9, 10);
    if (t.phase !== "stone") {
      for (let k = 0; k < 16; k++) {
        const y = fl - 12 + k - stride;
        R(f > 0 ? x + 11 : x - 15, y, 4, 1, FOREST.club);
        R(f > 0 ? x + 11 : x - 15, y, 1, 1, CLUB[2]);
        R(f > 0 ? x + 14 : x - 12, y, 1, 1, CLUB[0]);
      }
      R(f > 0 ? x + 10 : x - 16, fl - 2 - stride, 6, 4, mix(FOREST.club, INK, 0.2));
      R(f > 0 ? x + 10 : x - 16, fl - 2 - stride, 6, 1, FOREST.club);
    }
  }
  if (t.phase === "stone") {
    // All stone: moss on its back and head, a crack down it.
    blob(-6, 30, 5, 2, MOSS, 1);
    blob(hx - 1, hy + 6, 4, 1, MOSS, 1);
    for (let k = 0; k < 14; k++) R(x - 2 + (k % 3), fl - 30 + k, 1, 1, FOREST.stoneDark);
  }
  // In the light of the dawn, a white flash where it hits.
  if (flash) plain(() => [0, 1, 2, 3, 4, 5].forEach((k) => R(x - 14 + k * 5, fl - 20 - ((k * 7) % 16), 2, 2, WHITE)));
}

/**
 * The troll, outlined as everything that moves is (order 22): in the warning red while it can hurt (walking at
 * him, the club raised), and in the calm pale while it cannot (asleep as a boulder, its club stuck, flinching,
 * backing off, all stone at the end). The change of outline as it sets off is the tell.
 */
function troll(t: Troll, v: View) {
  outlined(() => trollBody(t, v), undefined, t.phase === "walk" || t.phase === "windup" ? ENEMY.warning : ROLES.calm);
}

/** Over the dark: the invaders' glow and red outline, eyes that shine, the troll's eyes, the fireflies, the wave of the troll's slam in the dust. */
function overDark(v: View) {
  dawnShaft(v);
  sunrise(v);
  // The invaders' neon glows through the dark (order 27): neon is the one thing that looks better at night. What hurts keeps
  // its red outline over the dark (order 31), as clear as by day: the ring alone, on its own pixels, so the dark round it is as
  // dark as before (`render/palette.test.ts` measures it against the forest under the dark).
  overTheDark(ctx());
  for (const e of v.enemies) if (e.alive) for (const [x, y] of eyes(e)) R(x, y, 1, 1, CREATURE.eye);
  for (const f of fireflies(v.t)) if (f.on) R(f.x, f.y, 1, 1, LAMP);
  const t = v.troll;
  // Its lit side, faint over the dark (order 25), as it was drawn this frame.
  if (t) for (let i = 0; i < trollLitN; i++) R(TROLL_LIT[i].x, TROLL_LIT[i].y, TROLL_LIT[i].w, 1, TROLL_LIT[i].c);
  if (t && t.phase !== "asleep" && t.phase !== "stone") {
    // Where its head is as its body is drawn (order 24): its eyes go with its walking bob and its heave.
    const head = trollHead(t, v.t);
    const ey = TROLL_DEF.floor - head.hy - 5;
    const ex = t.dir > 0 ? Math.round(t.x) + head.hx - 1 : Math.round(t.x) - head.hx - 1;
    R(ex, ey, 2, 1, FOREST.trollEye);
    R(t.dir > 0 ? ex + 3 : ex - 2, ey, 1, 1, FOREST.trollEye);
    // The club's glint as it is raised: the telegraph shows even where the dark is.
    if (t.phase === "windup" && (view.reduced || Math.floor(v.t / 6) % 2 === 0)) R(Math.round(t.x) + (t.dir > 0 ? 6 : -12), TROLL_DEF.floor - 56, 6, 1, FOREST.dawnPale);
    // The wave in the ground: a hump of earth running out, clods and dust thrown up over it.
    for (const f of waveFronts(t, v.t)) {
      const mx = f.x + f.w / 2;
      for (let k = 0; k < 5; k++) R(mx - 5 + k, f.y + f.h - 1 - k, 11 - k * 2, 1, k === 4 ? FOREST.mossLight : FOREST.path);
      if (!view.reduced) for (let k = 0; k < 4; k++) R(mx - 4 + k * 3, f.y - 3 - ((v.t + k * 3) % 5), 1 + (k % 2), 1, FOREST.lichen);
    }
    const club = clubBox(t, v.t);
    if (club && !view.reduced) for (let i = 0; i < 6; i++) R(club.x + i * 4, club.y + club.h - 3 - ((v.t + i) % 3), 2, 2, FOREST.lichen);
  }
}

/** The forest's soil, darker than the city's earth: humus under the needles. */
const SOIL = mix(P.earth, INK, 0.45);
/** The forest floor (order 26, from the textured set): moss and needles on its top, roots under it, earth with stones below. */
const FLOOR: Grain = { name: "nm-floor", kind: "earth", ramp: [FOREST.trunkDark, FOREST.pathDark, SOIL, mix(SOIL, FOREST.path, 0.5)], band: [FOREST.pathDark, FOREST.path, FOREST.moss, FOREST.mossLight], top: "moss" };
function floorTile(c: number, r: number, x: number, y: number, m: TileMap) {
  textured(FLOOR, c, r, x, y, m, null);
}

/** Granite (order 26): grey facets with lichen, moss on its top, a boulder's top corners rounded. */
const GRANITE: Grain = { name: "nm-granite", kind: "rock", ramp: [STONE.mortar, STONE.dark, STONE.base, STONE.light], band: [FOREST.pathDark, FOREST.moss, FOREST.mossLight], accent: { moss: FOREST.lichen } };
function graniteTile(c: number, r: number, x: number, y: number, m: TileMap) {
  textured(GRANITE, c, r, x, y, m, null);
}

/** The bog: dark water under sedge, a tuft of bog cotton now and then. */
function bogTile(c: number, r: number, x: number, y: number, m: TileMap, t: number) {
  if (m.tileAt(c, r - 1) === "w") {
    R(x, y, TILE, TILE, mix(FOREST.bogWater, INK, 0.3));
    return;
  }
  R(x, y, TILE, TILE, FOREST.bogWater);
  R(x, y, TILE, 2, FOREST.bog);
  const tt = view.reduced ? 0 : t;
  R(x + ((c * 5 + Math.floor(tt / 40)) % 10), y + 4, 4, 1, mix(FOREST.bogWater, P.foam, 0.3));
  for (let k = 1; k < TILE; k += 4) R(x + k, y - 2 - ((c + k) % 3), 1, 2 + ((c + k) % 3), FOREST.sedge);
  if ((c * 7) % 3 === 0) R(x + 6, y - 5, 2, 2, FOREST.cotton);
}

/** The flourish: the sun comes up through the trees, the dark goes, birds wake. */
function flourish(age: number) {
  if (view.reduced) return;
  for (let i = 0; i < 6; i++) {
    const k = ((age + i * 20) % 120) / 120;
    const x = 205 * TILE + i * 40 + k * 60;
    const y = 8 * TILE - Math.sin(k * Math.PI) * 30 + i * 6;
    R(x, y, 1, 1, INK);
    R(x - 2, y - (Math.floor(age / 6 + i) % 2), 2, 1, INK);
    R(x + 1, y - (Math.floor(age / 6 + i) % 2), 2, 1, INK);
  }
}

export const NORDMARKA: LevelDef = {
  id: "nordmarka",
  rune: 6,
  name: "Nordmarka",
  landmark: { nb: "Skogen om natta", en: "The forest at night" },
  place: { nb: "Skogen nord for byen", en: "The forest north of the city" },
  sky: "twilight",
  map: MAP,
  legend: { solid: "#K", oneWay: "_-", water: "w" },
  ramps: [],
  carriers: CARRIERS,
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  troll: TROLL_DEF,
  // The troll's lines, in a bubble beside it: as it wakes, at each hit, when a round goes by with no hit (or
  // it gives up waiting under him), and at the end.
  bossWords: {
    // Its arrival (order 27): the story's line for it (`game/story.ts`).
    wake: { nb: `Steinen reiser seg. Det er et troll.\n${STORY.nb.boss.troll}`, en: `The boulder stands up. It is a troll.\n${STORY.en.boss.troll}` },
    hit1: { nb: "En tredjedel av trollet er stein.", en: "A third of the troll is stone." },
    hit2: { nb: "To tredjedeler stein.", en: "Two thirds stone." },
    hit3: { nb: "Trollet blir til stein.", en: "The troll turns to stone." },
    miss: { nb: "Det må stå i lyset når kølla sitter fast.\nSe det i øynene da.", en: "It must stand in the light when its club sticks.\nThen look it in the eye." },
    stone: { nb: "Trollet er stein. Sola er oppe.", en: "The troll is stone. The sun is up." }
  },
  trollRules: TROLL_RULES,
  dark,
  flourish: FLOURISH,
  floor: () => (G + 4) * TILE,
  signs: [
    {
      label: { nb: "Hodelykta", en: "The headlamp" },
      lines: { nb: ["Under granene er det mørkt, også om sommeren.", "Lykta lyser dit du ser. Blåmerkene viser veien."], en: ["Under the spruces it is dark, even in summer.", "The lamp lights where you look. The blue marks show the way."] }
    },
    {
      label: { nb: "Ullevålseter", en: "Ullevålseter" },
      lines: { nb: ["Vafler til alle, hver dag.", "Ikke nå. Det er natt."], en: ["Waffles for everyone, every day.", "Not now. It is night."] }
    },
    {
      label: { nb: "Lysningen", en: "The clearing" },
      lines: { nb: ["Troll tåler ikke sollys. Det er snart morgen.", "Lokk det inn i lyset, og se det i øynene."], en: ["A troll cannot stand sunlight. It is nearly morning.", "Lure it into the light, and look it in the eye."] }
    }
  ],
  doors: [
    { id: "tbane", tile: "t", sign: "T-banen", href: "#kart" },
    { id: "maze", tile: "j", sign: "Jernhaugen", href: "#jernhaugen" }
  ],
  art: {
    far: (v) => farRidges(v),
    mid: () => midSpruces(),
    near: () => nearTrunks(),
    back(v) {
      VIEW_T.t = v.t;
      sognsvann(v);
      marsh();
      ullevalseter(v);
      mound(v);
      gorge();
      // The forest along the path, skipping the lake, the marsh, the clearings and the gorge; blue marks on some.
      for (const tr of TREES) {
        spruce(tr.x, tr.foot, tr.h, tr.i);
        if (seen(tr.x - 15, tr.x + 4)) undergrowth(tr.x - 14, tr.foot, tr.i);
      }
      // The trunk past the gorge that carries a mark.
      R(GORGE_MARK.x - 1, G * TILE - 70, 4, 70, FOREST.trunk);
      R(GORGE_MARK.x - 1, G * TILE - 70, 1, 70, FOREST.trunkDark);
      for (const m of MARKS_ON_TRUNKS) {
        R(m.x - 1, m.y, 4, 4, FOREST.blaze);
        R(m.x - 1, m.y, 4, 1, FOREST.blazeLight);
      }
      // The big spruce at Ullevålseter whose branches go up out of the trees.
      spruce(136 * TILE + 8, G * TILE, 170, 4);
      clearing(v);
    },
    front() {},
    ground: () => ({ top: FOREST.moss, dot: FOREST.mossLight, fill: P.earth }),
    tile(t, c, r, x, y, m, sky) {
      void sky;
      if (t === "#") {
        floorTile(c, r, x, y, m);
        return true;
      }
      if (t === "K") {
        graniteTile(c, r, x, y, m);
        return true;
      }
      if (t === "w") {
        bogTile(c, r, x, y, m, VIEW_T.t);
        return true;
      }
      return false;
    },
    ledges: {
      _: { body: FOREST.trunk, top: FOREST.moss, edge: FOREST.trunkDark, joint: FOREST.trunkDark },
      "-": { body: P.wood, top: mix(P.wood, WHITE, 0.25), edge: P.woodDark, joint: P.woodDark }
    },
    carrier: (_i, at, v) => outlined(() => moose(at, v.t), undefined, ROLES.calm),
    flag(_i, f, raisedAt, v) {
      blueTrunk(f, raisedAt, v.t);
      return true;
    },
    lights: (v) => lights(v),
    overDark: (v) => overDark(v),
    night: (v, him, boards, map) => drawNight(NORDMARKA, v, him, boards, map),
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "bat") drawFoe(e, foeFrame(e, v.t, BAT), BAT.w, BAT.h);
      else if (e.def.look === "anthill") drawFoe(e, foeFrame(e, v.t, ANTHILL), ANTHILL.w, ANTHILL.h);
      else return drawLook(e, v.t);
      return true;
    },
    shot: (s, v) => drawLookShot(s, v.enemies[s.by]?.def.look),
    troll: (t, v) => troll(t, v),
    flourish: (age) => flourish(age)
  }
};
