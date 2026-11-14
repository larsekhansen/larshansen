import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import { carrierShown, orbitAngle, type CarrierDef, type Orbit, type Path } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { FIRE, GLASS, INK, LAND, LAMP, METAL, PAINT, PALETTE, PLANTS, RIVER, ROOF, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { STOVE_SMOKE, smoke } from "@larshansen/pixelkit/props";
import { rampHeight, type Ramp, type TileMap } from "@larshansen/pixelkit/tilemap";
import type { Zone } from "@larshansen/pixelkit/zone";
import type { EnemyDef } from "../game/enemies";
import { tbaneDoor } from "../render/furniture";
import { drawSalmon } from "../render/pickups";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 6, rune A: Akerselva. A summer's day, down the river from Nydalen to Vaterland, the only
// level that goes downhill all the way: three terraces, each a stretch of river with a fall at its
// end. Logs drift downstream and come round again; the falls push down into the water; the water
// wheel at Hjula takes him on at the bottom and off at the top; the ski pole's dash goes straight
// through a curtain of falling water. Runesmia, the smithy by the falls, is the door to the QR
// maker. Aamodt bru carries its sign about marching in step. Rune A on the far bank at Vaterland.
// New: zones (the falls), carriers on an orbit (the wheel), and the salmon, the first jumper.
//
//   #  earth and grass   K  rock   =  stone and plank ledges   -  the bridge decks   _  a grate
//   ~  the river   b  a bench   $  skilling   &  brown cheese   t  T-banen   q  Runesmia
//
// Sections: Nydalen (teach: the salmon, a fall over dry ground, the dash over a dry mill race, the
// first logs), Bjølsen (practise: logs between rocks, the first fall over its pool), Hjula (the
// wheel, the picture, the middle flag) and the curtain (twist: the dash through the falls, a cave
// behind them), and Vaterland (set piece: Aamodt bru, the last fall onto the logs, the last pool,
// the rune).

const COLS = 250;
const ROWS = 34;
/** The three terraces' ground, and the last pool's water line. */
export const T1 = 12;
export const T2 = 19;
export const T3 = 26;
export const POOL = 30;
const b = mapBuilder(COLS, ROWS);

// --- Nydalen ------------------------------------------------------------------------------------------
b.ground(0, 88, T1);
// The salmon's pool under the footbridge.
b.fill(13, 16, T1, T1 + 1, "~");
/** The footbridge over it, an arch on stilts. */
export const FOOTBRIDGE: Ramp = { points: [[12 * TILE, T1 * TILE], [14 * TILE, T1 * TILE - 24], [16 * TILE, T1 * TILE - 24], [18 * TILE, T1 * TILE]] };
// The dam's ledge, beside its spout, with a bench a little off the path.
b.run(22, 26, 10, "=");
// The dry mill race: five tiles across, two deep, a step out at the far end.
b.fill(35, 39, T1, T1 + 1, ".");
b.fill(40, 40, T1, T1, ".");

// --- Bjølsen: the river between rocks, logs on it ------------------------------------------------------
b.fill(61, 79, T1, T1 + 2, "~");
b.fill(66, 67, T1 - 1, T1 + 2, "K");
b.fill(74, 74, T1 - 1, T1 + 2, "K");
// The first fall, over the end of the terrace, into its pool; a rock to land on past it.
b.fill(89, 91, T1, ROWS - 1, ".");
b.fill(89, 91, T2, T2 + 2, "~");
b.ground(89, 91, T2 + 3);
b.ground(92, 93, 16, "K");

// --- Hjula: the wheel, the bridge over the tailrace, Runesmia ------------------------------------------
b.ground(94, 114, T2);
b.fill(115, 121, T2, T2 + 3, "~");
b.ground(115, 121, T2 + 4);
b.run(115, 121, 12, "-");
b.ground(122, 128, 12, "K");
b.ground(129, 141, T2);
// The mill's roof, reached by jumping off the wheel as a bucket starts down: a nook of skilling.
b.run(100, 106, 13, "^");

// --- The curtain: a gap with a fall through it, a cave behind ------------------------------------------
b.ground(142, 145, T3 + 3);
b.fill(142, 145, T3, T3 + 2, "~");
// The cave behind the falls: in through a grate in the path, out by a step; its floor runs under the curtain.
b.fill(137, 141, T2 + 1, T2 + 3, ".");
b.run(137, 138, T2, "_");
b.run(137, 138, T2 + 2, "=");
b.fill(142, 143, T2 + 4, ROWS - 1, "K");
b.ground(146, 152, T2);
b.ground(153, 154, T2 + 2, "K");
b.ground(155, 156, T2 + 4, "K");

// --- Vaterland: Aamodt bru, the last fall, the last pool ---------------------------------------------
b.ground(157, 171, T3);
b.fill(172, 186, T3 + 1, T3 + 3, "~");
b.ground(172, 186, T3 + 4);
b.run(172, 186, T3, "-");
b.ground(187, 193, T3);
b.fill(194, 238, POOL, POOL + 2, "~");
b.ground(194, 238, POOL + 3);
b.fill(204, 204, POOL - 1, POOL + 2, "K");
b.fill(214, 215, POOL - 2, POOL + 2, "K");
b.fill(226, 226, POOL - 1, POOL + 2, "K");
b.fill(232, 232, POOL - 1, POOL + 2, "K");
b.ground(239, COLS - 1, POOL - 1);
// The far bank rises to the stone with the rune.
b.ground(242, 243, POOL - 2, "K");
b.ground(244, 246, POOL - 4, "K");
b.ground(247, COLS - 1, POOL - 3);

// Marks: the start, the doors, signs, flags, benches, the rune, the bracteate, the cheese.
b.put(2, T1 - 1, "t").put(4, T1 - 1, "S").put(7, T1 - 1, "i");
b.put(24, 9, "b").put(32, T1 - 1, "i").put(58, T1 - 1, "f").put(86, T1 - 1, "f");
b.put(104, T2 - 1, "b").put(127, 11, "q").put(133, T2 - 1, "f").put(160, T3 - 1, "f");
b.put(108, T2 - 1, "i").put(169, T3 - 1, "i").put(189, T3 - 1, "f");
b.put(215, POOL - 3, "f").put(245, POOL - 6, "r").put(140, T2 + 3, "&").put(103, 7, "o");

// Skilling: the line over the footbridge, the dam's ledge and its spout, the dash over the race,
// up by the wasp, along the logs and rocks, over the first fall, the mill roof's nook, up the wheel,
// the bridge, the cave behind the curtain and the dash through it, Aamodt bru, the last pool.
const COINS: [number, number][] = [
  [9, 11], [10, 11],
  [14, 9], [15, 9],
  [22, 9], [26, 9], [27, 10], [28, 10],
  [36, 9], [37, 9], [38, 9],
  [46, 8], [47, 8], [48, 8], [49, 8],
  [62, 11], [64, 11], [66, 10], [67, 10],
  [70, 11], [72, 11], [74, 10], [77, 11],
  [83, 11], [84, 11],
  [90, 9], [92, 13],
  [101, 12], [102, 12], [104, 12], [105, 12],
  [114, 15], [115, 13],
  [117, 11], [119, 11],
  [139, 22], [141, 22],
  [144, 16], [145, 16],
  [153, 20], [155, 22],
  [174, 25], [176, 25], [182, 25], [184, 25],
  [198, 29], [208, 29], [210, 29],
  [221, 28], [222, 27], [223, 27], [224, 28],
  [229, 29], [235, 29],
  [240, 28], [244, 25], [246, 25]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- Things that move ----------------------------------------------------------------------------------

/** Logs float with this much of them over the water. */
const FLOAT = 3;
const LOG_W = 2 * TILE;
const LOG_SPEED = 0.45;
/** Steps a log lies against the rock at the end of its stretch before it goes under: room for a late jump. */
const LOG_HOLD = 60;
/**
 * Logs on a stretch of river from column c0 to c1 (the log's left end, first to last), on water whose
 * top is at row `r`: each comes up out of the water, drifts downstream, lies a moment against the rock
 * at the end, sinks, and comes round again.
 */
function logs(c0: number, c1: number, r: number, n: number, wait: number, phase = 0): Path[] {
  const y = r * TILE - FLOAT;
  const one: Path = {
    kind: "path",
    points: [
      { x: c0 * TILE, y: y + 8 },
      { x: c0 * TILE, y },
      { x: c1 * TILE, y },
      { x: c1 * TILE, y: y + 10 }
    ],
    w: LOG_W,
    speed: LOG_SPEED,
    wait,
    stops: [{ at: 2, steps: LOG_HOLD }]
  };
  const period = logPeriod(c0, c1, wait);
  return Array.from({ length: n }, (_, i) => ({ ...one, offset: Math.round(((i + phase) * period) / n) }));
}

/** Steps in one round of a stretch's logs, for the salmon that leap on the same beat. */
const logPeriod = (c0: number, c1: number, wait: number) => Math.ceil((8 + (c1 - c0) * TILE + 10) / LOG_SPEED) + LOG_HOLD + wait;
export const LOG_PERIOD = { bjolsen: [logPeriod(61, 64, 40), logPeriod(68, 72, 40), logPeriod(75, 78, 40)], pool: [logPeriod(196, 202, 30), logPeriod(205, 212, 30), logPeriod(216, 220, 30), logPeriod(227, 230, 30), logPeriod(233, 237, 30)] };

/** The three stretches at Bjølsen. */
export const LOGS_BJOLSEN = [...logs(61, 64, T1, 2, 40), ...logs(68, 72, T1, 2, 40, 0.5), ...logs(75, 78, T1, 2, 40, 0.25)];
/** The last pool: under the third fall, then between the rocks. The third stretch ends short: the dash takes him on. */
export const LOGS_POOL = [...logs(196, 202, POOL, 2, 30), ...logs(205, 212, POOL, 2, 30, 0.5), ...logs(216, 220, POOL, 2, 30, 0.25), ...logs(227, 230, POOL, 2, 30), ...logs(233, 237, POOL, 2, 30, 0.5)];

/** The water wheel at Hjula: six buckets on a ring, turning against the clock (the river drives its bottom downstream). */
export const WHEEL = { cx: 112 * TILE, cy: T2 * TILE + 4 - 58, r: 58, period: -480, n: 6 };
export const BUCKETS: Orbit[] = Array.from({ length: WHEEL.n }, (_, i) => ({ kind: "orbit", cx: WHEEL.cx, cy: WHEEL.cy, r: WHEEL.r, w: 2 * TILE, period: WHEEL.period, turn: i / WHEEL.n }));

const CARRIERS: CarrierDef[] = [...LOGS_BJOLSEN, ...BUCKETS, ...LOGS_POOL];
export const FIRST_BUCKET = LOGS_BJOLSEN.length;
export const FIRST_POOL_LOG = FIRST_BUCKET + BUCKETS.length;

// --- The falls: zones that push down -------------------------------------------------------------------
const FALL = 0.7;
/** The dam's spout at Nydalen, over dry ground; the three falls; the mill race that falls past the wheel. */
export const SPOUT: Zone = { x: 27 * TILE, y: 7 * TILE, w: 2 * TILE, h: (T1 - 7) * TILE, push: { x: 0, y: FALL } };
export const FALL1: Zone = { x: 89 * TILE, y: T1 * TILE, w: 2 * TILE, h: (T2 - T1) * TILE, push: { x: 0, y: FALL } };
export const CURTAIN: Zone = { x: 143 * TILE, y: 13 * TILE, w: TILE, h: (T3 - 13) * TILE, push: { x: 0, y: FALL } };
export const FALL3: Zone = { x: 194 * TILE, y: T3 * TILE, w: 2 * TILE, h: (POOL - T3) * TILE, push: { x: 0, y: FALL } };
const ZONES = [SPOUT, FALL1, CURTAIN, FALL3];

/**
 * The salmon (the first jumper) leaps alone under the footbridge first, where it cannot reach him;
 * then among the logs, on the logs' own beat, so one log of each pair passes it while it is under.
 * Ducks and rats on the banks, wasps over them, a disposable grill left on the grass, a gull that
 * throws chips, a hedgehog by the path, a gull over the last pool.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "jumper", look: "salmon", c: 14, r: T1 + 1, rise: 40, period: 200 },
  { kind: "walker", look: "duck", c: 19, r: T1 - 1, range: 1 },
  { kind: "walker", look: "rat", c: 45, r: T1 - 1, range: 2 },
  { kind: "flyer", look: "wasp", c: 48, r: 6, range: 3, rise: 6, period: 150 },
  { kind: "spiky", look: "grill", c: 52, r: T1 - 1, speed: 0, w: 12, h: 12 },
  { kind: "jumper", look: "salmon", c: 70, r: T1 + 2, rise: 56, period: LOG_PERIOD.bjolsen[1], offset: 60 },
  { kind: "walker", look: "rat", c: 98, r: T2 - 1, range: 2 },
  { kind: "flyer", look: "wasp", c: 104, r: 14, range: 2, rise: 8, period: 140 },
  { kind: "spiky", look: "hedgehog", c: 151, r: T2 - 1, range: 1 },
  { kind: "walker", look: "rat", c: 183, r: T3 - 1, range: 2 },
  { kind: "jumper", look: "salmon", c: 209, r: POOL + 1, rise: 50, period: LOG_PERIOD.pool[1], offset: 40 },
  { kind: "flyer", look: "gull", c: 222, r: 25, range: 3, rise: 8, period: 160 },
  { kind: "jumper", look: "salmon", c: 229, r: POOL + 1, rise: 46, period: LOG_PERIOD.pool[3], offset: 90 }
];

export const AKERSELVA_RULES = { COLS, ROWS, CARRIERS, ZONES };

// --- Art ------------------------------------------------------------------------------------------------
const P = PALETTE;
const at = (c: number, r: number) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? MAP[r][c] : ".");
/** The first row of ground (or rock) from the top in a column. */
function surfaceRow(c: number) {
  for (let r = 0; r < ROWS; r++) if (at(c, r) === "#" || at(c, r) === "K") return r;
  return ROWS;
}
/** The terrace a column belongs to, for what stands behind it. */
const terrace = (c: number) => (c < 92 ? T1 : c < 155 ? T2 : T3);

/**
 * Where a far layer puts something drawn at screen y `s` when the view is on the middle terrace: the
 * layers move up and down less than the river does, so the hills stay behind it all the way down.
 */
const REF = T2 * TILE - 120;
const sink = (s: number, k: number) => s + view.camY - k * (view.camY - REF);

/** Grefsenkollen and the hills north of the city, in summer green; a tower on the top. */
function farHills() {
  const base = sink(116, 0.16);
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 34 + 12 * Math.sin(wx * 0.0035 + 0.8) + 6 * Math.sin(wx * 0.011 + 2) + 2 * Math.sin(wx * 0.04);
    column(x, base - h, base + 400, LAND.farHills);
    const f = h - 10 + 3 * Math.sin(wx * 0.05);
    column(x, base - f, base + 400, mix(LAND.forest, LAND.farHills, 0.45));
    if ((Math.floor(wx / 2) * 7) % 9 === 0) column(x, base - f - 1, base - f + 1, mix(LAND.forestDark, LAND.farHills, 0.4));
    // The tower on Grefsenkollen.
    const tw = Math.floor(wx) % 900;
    if (tw >= 300 && tw < 302) column(x, base - h - 10, base - h, mix(PAINT.trim, LAND.farHills, 0.3));
  }
}

/** The old mills and the new blocks along the river, between: brick, sawtooth roofs, chimneys, trees. */
function midTown(t: number) {
  const ground = sink(170, 0.26);
  for (let i = 0; i < 48; i++) {
    // Sparser than a street: groups of two with sky and trees between.
    if (i % 3 === 2) continue;
    const wx = i * 104 + ((i * 41) % 48);
    const x = layerX(wx, 0.2);
    if (x < -50 || x > view.w + 10) continue;
    const w = 26 + ((i * 29) % 22);
    const h = 18 + ((i * 53) % 24);
    const kind = i % 4;
    const wall = kind === 0 ? mix(RIVER.brick, LAND.farHills, 0.35) : kind === 1 ? mix(PAINT.ochre, LAND.farHills, 0.4) : kind === 2 ? mix(RIVER.brickDark, LAND.farHills, 0.35) : mix(PAINT.trim, LAND.farHills, 0.35);
    box(x, ground - h, w, h + 60, wall);
    // Sawtooth roofs on the brick ones, flat tops with a cornice on the rest.
    if (kind === 0 || kind === 2) for (let k = 0; k < w - 4; k += 8) for (let j = 0; j < 5; j++) box(x + k + j, ground - h - 5 + j, 1, 5 - j, mix(ROOF.sawTooth, LAND.farHills, 0.3));
    else box(x - 1, ground - h, w + 2, 2, mix(wall, WHITE, 0.25));
    for (let y = ground - h + 5; y < ground - 3; y += 6) for (let k = x + 3; k < x + w - 3; k += 5) {
      box(k, y, 2, 3, mix(RIVER.millWindow, LAND.farHills, 0.3));
      lit(k, y, 2, 3);
    }
    if (i % 3 === 0) {
      box(x + w - 8, ground - h - 22, 4, 22, mix(RIVER.brickDark, LAND.farHills, 0.3));
      if (!view.reduced) for (let k = 0; k < 3; k++) box(x + w - 8 + ((t / 20 + k) % 3), ground - h - 26 - k * 4 - ((t / 6) % 4), 3, 2, `rgba(${FIRE.smoke}, ${0.5 - k * 0.12})`);
    }
    // Leafy trees in front of every other one.
    if (i % 2 === 1) for (let yy = -7; yy <= 7; yy++) {
      const half = Math.floor(Math.sqrt(49 - yy * yy));
      box(x - 6 - half, ground - 8 + yy, half * 2, 1, mix(yy < -2 ? PLANTS.leavesShine : PLANTS.leaves, LAND.farHills, 0.25));
    }
  }
}

/** Trees along the banks just behind the path, in clumps: birch and alder in summer leaf, their feet on the terrace behind. */
function nearTrees() {
  for (let i = 0; i < 90; i++) {
    // Clumps of two or three, with clear gaps between them.
    if (i % 5 === 3 || i % 7 === 5) continue;
    const wx = i * 46 + ((i * 23) % 30) + (Math.floor(i / 5) % 2) * 20;
    const x = layerX(wx, 0.4);
    if (x < -24 || x > view.w + 24) continue;
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(wx / TILE)));
    const foot = terrace(c) * TILE - 2;
    const h = 22 + ((i * 37) % 34);
    const birch = i % 3 === 0;
    box(x, foot - h, 2, h, birch ? mix(PLANTS.birchBark, LAND.farHills, 0.2) : mix(PLANTS.bark, LAND.farHills, 0.2));
    if (birch) for (let y = foot - h + 3; y < foot; y += 6) box(x, y, 1, 1, mix(PLANTS.birchMark, LAND.farHills, 0.3));
    const r = (birch ? 7 : 10) + ((i * 13) % 4);
    const rx = r + ((i * 7) % 3);
    for (let yy = -r; yy <= r; yy++) {
      const half = Math.floor(rx * Math.sqrt(1 - (yy * yy) / (r * r)));
      const leaf = birch ? (yy < -r / 3 ? PLANTS.birchShine : PLANTS.birchLeaves) : yy < -r / 3 ? PLANTS.leavesShine : PLANTS.leaves;
      box(x + 1 - half, foot - h - r + 4 + yy, half * 2, 1, mix(leaf, LAND.farHills, 0.18));
      if (yy > r / 2 && (yy + i) % 2 === 0) box(x + 1 - half, foot - h - r + 4 + yy, 2, 1, mix(PLANTS.hedgeDark, LAND.farHills, 0.2));
    }
  }
}

/** The river behind the path where the path runs along its bank: a band of water, the far bank's grass and stones above it. */
function riverBehind(c0: number, c1: number, row: number, t: number) {
  const y = row * TILE;
  const x0 = c0 * TILE;
  const w = (c1 - c0 + 1) * TILE;
  R(x0, y - 18, w, 6, P.grass);
  R(x0, y - 18, w, 1, mix(P.grass, WHITE, 0.2));
  R(x0, y - 12, w, 2, RIVER.wetStone);
  R(x0, y - 10, w, 10, P.water);
  for (let x = x0; x < x0 + w; x += 2) if ((x * 7 + row) % 11 < 3) R(x, y - 13, 2, 1, RIVER.wetStoneLight);
  const tt = view.reduced ? 0 : t;
  for (let k = 0; k < w; k += 19) R(x0 + ((k + Math.floor(tt * 0.45)) % w), y - 8 + ((k * 3) % 5), 4, 1, mix(P.water, P.foam, 0.6));
  // Now and then a log goes by on it, the same way he goes.
  for (let k = 0; k < w; k += 230) {
    const lx = x0 + ((k + Math.floor(tt * 0.45) + row * 37) % w);
    if (lx + 20 > x0 + w) continue;
    R(lx, y - 9, 20, 3, RIVER.log);
    R(lx, y - 9, 20, 1, RIVER.logLight);
    R(lx + 18, y - 9, 2, 3, RIVER.logEnd);
  }
}


/** Myrens verksted: a workshop hall in brick behind the path, its sawtooth roof, paired windows, a great arched gate, a chimney. */
function verksted(t: number) {
  const x = 41 * TILE;
  const w = 13 * TILE;
  const base = T1 * TILE - 18;
  const h = 54;
  const top = base - h;
  R(x, top, w, h, RIVER.brick);
  for (let y = top + 3; y < base; y += 4) R(x, y, w, 1, RIVER.brickLine);
  // The sawtooth roof: north lights, each a slope and a strip of glass.
  for (let k = 0; k < w; k += 26)
    for (let j = 0; j < 12; j++) {
      R(x + k + j * 2, top - 12 + j, 26 - j * 2, 1, j === 0 ? mix(ROOF.sawTooth, WHITE, 0.2) : ROOF.sawTooth);
      R(x + k, top - 12 + j, 2, 1, GLASS.pane);
    }
  R(x - 2, top - 1, w + 4, 2, RIVER.sandstone);
  // Windows in pairs, and the gate in the middle.
  for (let k = x + 8; k + 16 < x + w - 4; k += 34) {
    if (Math.abs(k - (x + w / 2 - 10)) < 20) continue;
    for (const dx of [0, 9]) {
      R(k + dx - 1, top + 12, 8, 18, RIVER.sandstone);
      R(k + dx, top + 13, 6, 16, RIVER.millWindow);
      R(k + dx, top + 20, 6, 1, RIVER.sandstone);
      light(k + dx, top + 13, 6, 7);
    }
  }
  const gx = x + w / 2 - 12;
  R(gx - 2, top + 18, 28, h - 18, RIVER.sandstone);
  R(gx, top + 22, 24, h - 22, P.woodDark);
  for (let k = 3; k < 24; k += 4) R(gx + k, top + 22, 1, h - 22, mix(P.woodDark, WHITE, 0.12));
  for (let j = 0; j < 4; j++) R(gx - 2 + j, top + 17 - j, 28 - j * 2, 1, RIVER.sandstone);
  R(x + 22, top + 4, 90, 6, INK);
  for (let i = 0; i < 12; i++) R(x + 25 + i * 7, top + 6, 4, 2, RIVER.sandstone);
  chimney(x + w - 18, top - 64, top - 6, t);
}

/** A chimney of the same brick, with a band near the top and smoke. */
function chimney(x: number, top: number, base: number, t: number) {
  R(x, top, 8, base - top, RIVER.brick);
  for (let y = top + 3; y < base; y += 4) R(x, y, 8, 1, RIVER.brickLine);
  R(x - 1, top, 10, 3, RIVER.brickDark);
  R(x - 1, top + 8, 10, 1, RIVER.sandstone);
  if (!view.reduced) smoke(x + 2, top - 2, t, STOVE_SMOKE);
}

/** Nydalen: the T-bane's glass entrance, the new blocks behind it. */
function nydalen(v: View) {
  const g = T1 * TILE;
  R(0, g - 70, 7 * TILE, 70, mix(GLASS.foyer, WHITE, 0.25));
  for (let y = g - 66; y < g - 8; y += 8) R(0, y, 7 * TILE, 1, GLASS.foyerMullion);
  for (let x = 4; x < 7 * TILE; x += 12) R(x, g - 70, 1, 62, GLASS.foyerMullion);
  R(0, g - 72, 7 * TILE + 4, 3, PAINT.trim);
  R(6, g - 64, 40, 9, PAINT.tbane);
  R(8, g - 62, 36, 5, WHITE);
  for (let i = 0; i < 5; i++) R(11 + i * 7, g - 61, 4, 3, PAINT.tbane);
  tbaneDoor(v.doors.get("tbane"));
}

/** Nydalsdammen: a dam of big cut stones, moss where the water seeps, a sluice gate, the spout pouring over dry stones onto the path. */
function dam(t: number) {
  const x0 = 22 * TILE;
  const x1 = 31 * TILE;
  const top = 7 * TILE;
  const g = T1 * TILE;
  const shade = (k: number) => [STONE.base, STONE.light, STONE.dark, mix(STONE.base, STONE.light, 0.5)][k % 4];
  for (let y = top; y < g; y += 8) {
    const course = (y - top) / 8;
    for (let x = x0 + (course % 2 ? -6 : 0); x < x1; x += 14) {
      const bx = Math.max(x0, x);
      const bw = Math.min(x1, x + 14) - bx;
      R(bx, y, bw, 8, shade((Math.floor(x / 14) * 7 + course * 3) & 7));
      R(bx, y + 7, bw, 1, STONE.mortar);
      R(bx, y, 1, 8, STONE.mortar);
      R(bx + 1, y, bw - 1, 1, mix(shade((Math.floor(x / 14) * 7 + course * 3) & 7), WHITE, 0.15));
    }
  }
  // Where the water seeps through: dark stains and moss under the spout.
  for (let x = SPOUT.x - 14; x < SPOUT.x + SPOUT.w + 12; x++) {
    const h = 10 + ((x * 13) % 23);
    R(x, top + 4, 1, h, (x * 7) % 3 === 0 ? STONE.moss : mix(RIVER.wetStoneDark, STONE.base, 0.4));
  }
  // The crest: dressed stone, the dam's pond just over it, a railing.
  R(x0 - 3, top - 4, x1 - x0 + 6, 4, MASONRY_CAP);
  R(x0 - 3, top - 4, x1 - x0 + 6, 1, WHITE);
  R(x0 - 3, top - 7, x1 - x0 + 6, 3, P.water);
  for (let x = x0; x < x1; x += 10) R(x, top - 14, 1, 10, METAL.castIron);
  R(x0, top - 14, x1 - x0, 1, METAL.castIron);
  // The sluice gate: a wooden hatch on two iron posts, a wheel to wind it.
  R(x0 + 6, top + 6, 22, 30, P.wood);
  for (let k = 0; k < 22; k += 5) R(x0 + 6 + k, top + 6, 1, 30, P.woodDark);
  R(x0 + 4, top - 2, 3, 40, METAL.castIron);
  R(x0 + 27, top - 2, 3, 40, METAL.castIron);
  R(x0 + 11, top - 6, 12, 2, METAL.castIron);
  R(x0 + 16, top - 10, 2, 6, METAL.castIron);
  // The spout's lip, and the water.
  R(SPOUT.x - 3, SPOUT.y - 2, SPOUT.w + 6, 4, STONE.light);
  fallWater(SPOUT, t, g);
  // Dry stones where it lands.
  for (const dx of [-8, -3, 30, 36]) R(SPOUT.x + dx, g - 4, 6, 4, RIVER.wetStone);
}
const MASONRY_CAP = mix(STONE.light, WHITE, 0.3);

/** The dry mill race at Nydalen: its stone-lined back wall, a trickle along the bottom, an old board across. */
function dryRace() {
  const x0 = 35 * TILE;
  const x1 = 41 * TILE;
  const y0 = T1 * TILE;
  for (let y = y0; y < (T1 + 2) * TILE; y += 6)
    for (let x = x0 + (((y - y0) / 6) % 2) * 5; x < x1; x += 10) {
      R(Math.max(x0, x), y, Math.min(10, x1 - Math.max(x0, x)), 6, ((x + y) / 2) % 3 === 0 ? STONE.dark : mix(STONE.dark, INK, 0.2));
      R(Math.max(x0, x), y + 5, Math.min(10, x1 - Math.max(x0, x)), 1, STONE.mortar);
    }
  R(x0, (T1 + 2) * TILE - 3, 5 * TILE, 3, mix(P.water, STONE.dark, 0.3));
  for (let x = x0 + 4; x < x1; x += 13) R(x, (T1 + 2) * TILE - 3, 4, 1, P.foam);
  R(x0 + 30, y0 + 4, 3, 28, P.woodDark);
  for (let x = x0; x < x0 + 6 * TILE; x += 7) R(x, y0 + 2, 1, 3, STONE.moss);
}

/** The y of the water's surface in a column, for a salmon to come up through. */
function waterTop(x: number): number {
  const c = Math.floor(x / TILE);
  for (let r = 0; r < ROWS; r++) if (at(c, r) === "~") return r * TILE;
  return ROWS * TILE;
}

/** A waterfall in its zone: white water in streaks that run down, darker at the edges, a glint of sky. */
function fallWater(z: Zone, t: number, bottom = z.y + z.h) {
  const tt = view.reduced ? 0 : t;
  for (let x = z.x; x < z.x + z.w; x++) {
    const edge = x === z.x || x === z.x + z.w - 1;
    R(x, z.y, 1, bottom - z.y, edge ? RIVER.fallShade : RIVER.fall);
    // Streaks, running down at the speed of falling water.
    const k = (x * 7) % 5;
    for (let y = z.y + ((Math.floor(tt * 2.2) + k * 9) % 22); y < bottom; y += 22) R(x, y, 1, 6, k < 2 ? RIVER.fallDark : RIVER.fallShade);
  }
}

/** Where a fall hits the water: foam that boils, and spray thrown up. Drawn in front. */
function foam(z: Zone, y: number, t: number) {
  const tt = view.reduced ? 0 : t;
  R(z.x - 6, y - 2, z.w + 12, 4, RIVER.spray);
  R(z.x - 10, y + 1, z.w + 20, 2, P.foam);
  for (let i = 0; i < 8; i++) {
    const k = ((tt * 0.7 + i * 13) % 30) / 30;
    const dx = (i % 2 ? 1 : -1) * (4 + k * 16) + z.w / 2;
    R(z.x + dx, y - 4 - Math.sin(k * Math.PI) * 10, 2, 2, RIVER.spray);
  }
}

/** Bjølsen valsemølle on the far bank: the grain silo's round bins, the mill house beside them. */
function bjolsen() {
  const x = 70 * TILE;
  const g = T1 * TILE - 18;
  const wall = mix(PAINT.trim, STONE.base, 0.3);
  for (let k = 0; k < 3; k++) {
    const bx = x + k * 14;
    R(bx, g - 96, 14, 96, wall);
    R(bx, g - 96, 3, 96, mix(wall, WHITE, 0.3));
    R(bx + 11, g - 96, 3, 96, mix(wall, INK, 0.12));
    for (let y = g - 90; y < g; y += 12) R(bx, y, 14, 1, mix(wall, INK, 0.08));
  }
  R(x - 2, g - 104, 46, 8, mix(wall, INK, 0.1));
  for (let k = 0; k < 4; k++) R(x + 2 + k * 11, g - 102, 5, 4, RIVER.millWindow);
  R(x + 44, g - 52, 36, 52, RIVER.brick);
  for (let y = g - 49; y < g; y += 4) R(x + 44, y, 36, 1, RIVER.brickLine);
  for (let i = 0; i < 9; i++) R(x + 42 + i * 2, g - 52 - 9 + i, 40 - i * 4, 1, ROOF.red);
  for (const wx of [x + 50, x + 62, x + 72]) {
    R(wx, g - 42, 5, 9, RIVER.millWindow);
    R(wx, g - 22, 5, 9, RIVER.millWindow);
    light(wx, g - 42, 5, 9);
  }
  R(x + 6, g - 70, 30, 7, INK);
  for (let k = 0; k < 5; k++) R(x + 9 + k * 5, g - 68, 3, 3, PAINT.trim);
}

/** The first fall: over the end of the terrace, between wet rocks, into its pool. */
function fall1(t: number) {
  const c = 89;
  R(c * TILE - 2, T1 * TILE - 2, 3 * TILE + 4, 3, RIVER.wetStone);
  fallWater(FALL1, t);
  // The cliff it falls down, behind: wet rock streaked dark.
  for (let x = 89 * TILE + FALL1.w; x < 92 * TILE; x++) R(x, T1 * TILE, 1, (T2 - T1) * TILE, (x * 5) % 7 < 2 ? RIVER.wetStoneDark : RIVER.wetStone);
}

/** The water wheel at Hjula, the level's picture: an oak rim on eight spokes round an iron hub, turning; the buckets are the carriers, drawn by `bucket`. */
function wheel(t: number) {
  const { cx, cy, r } = WHEEL;
  const a0 = orbitAngle(BUCKETS[0], t);
  // The rim: two rings of planks, with the boards' joints turning with it.
  for (let k = 0; k < 360; k++) {
    const a = (k / 360) * Math.PI * 2;
    for (const [rr, col] of [
      [r + 8, RIVER.wheelDark],
      [r + 7, RIVER.wheel],
      [r + 6, RIVER.wheelLight],
      [r - 6, RIVER.wheelDark],
      [r - 7, RIVER.wheel]
    ] as const)
      R(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 1, 1, col);
  }
  // Paddles between the rings, at every sixteenth of a turn, going round.
  for (let k = 0; k < 16; k++) {
    const a = a0 + (k / 16) * Math.PI * 2;
    for (let rr = r - 6; rr <= r + 7; rr++) R(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 2, 2, RIVER.wheelDark);
  }
  // Eight spokes to the hub.
  for (let k = 0; k < 8; k++) {
    const a = a0 + (k / 8) * Math.PI * 2 + Math.PI / 16;
    for (let rr = 6; rr < r - 6; rr += 1) {
      const x = Math.round(cx + Math.cos(a) * rr);
      const y = Math.round(cy + Math.sin(a) * rr);
      R(x, y, 2, 2, rr % 9 === 0 ? RIVER.wheelDark : RIVER.wheel);
    }
  }
  // The hub and its axle on a stone pier.
  R(cx - 6, cy - 6, 12, 12, RIVER.hub);
  R(cx - 4, cy - 4, 8, 8, mix(RIVER.hub, WHITE, 0.25));
  R(cx - 1, cy - 1, 2, 2, INK);
  // Water running off the paddles on the way up the far side.
  if (!view.reduced)
    for (let k = 0; k < 6; k++) {
      const a = a0 + (k / 6) * Math.PI * 2;
      if (Math.cos(a) < 0.2 || Math.sin(a) > 0.6) continue;
      const x = Math.round(cx + Math.cos(a) * (r + 7));
      const y = Math.round(cy + Math.sin(a) * (r + 7));
      for (let d = 0; d < 3; d++) R(x + 1, y + 4 + ((t / 3 + d * 5 + k * 3) % 14), 1, 2, RIVER.fallShade);
    }
}

/** A bucket on the wheel: a wooden trough on a pin, level as it goes round; its top is what he stands on. */
function bucket(at: { x: number; y: number }) {
  const { x, y } = at;
  R(x, y, 2 * TILE, 3, RIVER.wheelLight);
  R(x, y, 2 * TILE, 1, mix(RIVER.wheelLight, WHITE, 0.3));
  R(x + 1, y + 3, 2 * TILE - 2, 4, RIVER.wheel);
  R(x + 3, y + 7, 2 * TILE - 6, 2, RIVER.wheelDark);
  for (let k = 5; k < 2 * TILE - 2; k += 7) R(x + k, y + 3, 1, 4, RIVER.wheelDark);
  R(x + TILE - 1, y - 3, 2, 3, RIVER.hub);
  R(x + 2, y + 4, 2 * TILE - 4, 1, mix(P.water, P.foam, 0.4));
}

/**
 * Hjula veveri behind the wheel: red brick, two floors of arched windows (one bricked up, one with
 * the lamp on), a loading door with its hoist, ivy up the corner, a flat roof with a slate edge (the
 * map's ledge), and its chimney, the bracteate's perch.
 */
function hjula(t: number) {
  const x0 = 99 * TILE;
  const x1 = 108 * TILE;
  const top = 13 * TILE + 4;
  const g = T2 * TILE;
  R(x0, top, x1 - x0, g - top, RIVER.brick);
  for (let y = top + 3; y < g; y += 4) {
    R(x0, y, x1 - x0, 1, RIVER.brickLine);
    for (let x = x0 + ((y / 4) % 2) * 4; x < x1; x += 8) R(x, y - 3, 1, 3, RIVER.brickLine);
  }
  // A plinth of stone, a sandstone band between the floors.
  R(x0, g - 10, x1 - x0, 10, STONE.base);
  for (let x = x0; x < x1; x += 12) R(x, g - 10, 1, 10, STONE.mortar);
  R(x0 - 2, top + 44, x1 - x0 + 4, 3, RIVER.sandstone);
  // Arched windows, two floors, with their differences.
  let k = 0;
  for (const y of [top + 12, top + 54]) {
    for (let x = x0 + 8; x + 10 < x1 - 4; x += 20) {
      k++;
      R(x - 1, y - 3, 12, 2, RIVER.sandstone);
      R(x, y - 1, 10, 22, RIVER.sandstone);
      if (k === 3) {
        // Bricked up long ago.
        R(x + 1, y, 8, 20, RIVER.brickDark);
        for (let yy = y + 2; yy < y + 20; yy += 4) R(x + 1, yy, 8, 1, RIVER.brickLine);
        continue;
      }
      R(x + 1, y, 8, 20, RIVER.millWindow);
      R(x + 4, y, 2, 20, RIVER.sandstone);
      R(x + 1, y + 9, 8, 1, RIVER.sandstone);
      if (k === 6) {
        R(x + 1, y, 3, 9, LAMP);
        R(x + 6, y, 3, 9, LAMP);
      }
      light(x + 1, y, 3, 20);
      light(x + 6, y, 3, 20);
    }
  }
  // The loading door near the top, its hoist beam and rope.
  const lx = x1 - 30;
  R(lx, top + 4, 14, 20, P.woodDark);
  R(lx + 1, top + 5, 12, 18, P.wood);
  R(lx + 6, top + 5, 1, 18, P.woodDark);
  R(lx - 4, top - 2, 22, 3, P.woodDark);
  R(lx + 15, top + 1, 1, 30, METAL.wire);
  R(lx + 13, top + 31, 5, 3, RIVER.hub);
  // Ivy up the left corner.
  for (let y = top + 8; y < g - 6; y++) {
    const w = 3 + Math.round(2 * Math.sin(y * 0.3)) + ((y * 7) % 5 === 0 ? 2 : 0);
    R(x0 - 1, y, w, 1, (y * 3) % 7 < 2 ? PLANTS.leavesShine : PLANTS.hedge);
  }
  // The flat roof's slate edge (the map's ledge is its walk), a parapet, the chimney.
  R(x0 - 3, top - 2, x1 - x0 + 6, 3, ROOF.slate);
  chimney(103 * TILE + 4, 8 * TILE + 6, 13 * TILE - 2, t);
  // The sign on the front.
  R(x0 + 18, top + 46, 76, 8, INK);
  for (let i = 0; i < 9; i++) R(x0 + 22 + i * 8, top + 48, 5, 3, RIVER.sandstone);
}

/** The tailrace and its foam under the wheel, in front. */
function tailraceFoam(t: number) {
  const tt = view.reduced ? 0 : t;
  for (let k = 0; k < 7 * TILE; k += 5) R(115 * TILE + ((k + Math.floor(tt * 0.8)) % (7 * TILE)), T2 * TILE + 1 + (k % 3), 3, 1, P.foam);
  for (let k = 0; k < 6; k++) R(WHEEL.cx + 4 + k * 7 + ((tt / 5 + k) % 3), T2 * TILE - 2 - ((k * 5 + Math.floor(tt / 4)) % 4), 2, 1, RIVER.spray);
}

/** Runesmia: a smithy of stone on the rock by the wheel, its forge glowing in the door. */
function runesmia(v: View) {
  const d = v.doors.get("qr");
  const x = 124 * TILE + 4;
  const g = 12 * TILE;
  R(x, g - 40, 4 * TILE - 4, 40, STONE.base);
  for (let y = g - 36; y < g; y += 5) {
    R(x, y, 4 * TILE - 4, 1, STONE.mortar);
    for (let xx = x + ((y / 5) % 2) * 4; xx < x + 4 * TILE - 4; xx += 9) R(xx, y - 4, 1, 4, STONE.mortar);
  }
  for (let i = 0; i < 10; i++) R(x - 4 + i * 2, g - 41 - i, 4 * TILE + 4 - i * 4, 1, i < 2 ? ROOF.slate : mix(ROOF.slate, INK, 0.1));
  chimney(x + 6, g - 64, g - 46, v.t);
  if (d) {
    R(d.x - 2, d.bottom - d.h - 2, d.w + 4, d.h + 2, STONE.dark);
    R(d.x, d.bottom - d.h, d.w, d.h, d.open ? INK : mix(INK, RIVER.forge, 0.25));
    const flick = view.reduced ? 0 : Math.floor(v.t / 6) % 3;
    R(d.x + 3, d.bottom - 9 - flick, d.w - 6, 7 + flick, RIVER.forge);
    R(d.x + 5, d.bottom - 6, d.w - 10, 4, FIRE.core);
    light(d.x + 2, d.bottom - 12, d.w - 4, 10, "soft");
  }
  // An anvil on its block outside.
  R(x + 34, g - 8, 10, 8, P.woodDark);
  R(x + 32, g - 12, 14, 4, METAL.lampPost);
  R(x + 30, g - 12, 4, 2, METAL.lampPost);
}

/** The footbridge over the tailrace: planks (the map's ledge), a railing on posts. */
function footbridge() {
  const x0 = 115 * TILE;
  const x1 = 122 * TILE;
  const y = 12 * TILE;
  for (let x = x0; x <= x1; x += 2 * TILE) R(x, y - 12, 2, 12, P.woodDark);
  R(x0, y - 12, x1 - x0 + 2, 2, P.wood);
  for (let x = x0 + TILE; x < x1; x += 2 * TILE) R(x, y + 5, 3, (T2 - 12) * TILE - 5, mix(P.woodDark, P.water, 0.2));
}

/** The arch of the footbridge in Nydalen, over the salmon's pool: planks along the ramp, a rail. */
function archBridge() {
  for (let x = FOOTBRIDGE.points[0][0]; x < FOOTBRIDGE.points[3][0]; x++) {
    const y = Math.round(rampHeight([FOOTBRIDGE], x) ?? 0);
    R(x, y, 1, 3, P.wood);
    R(x, y, 1, 1, mix(P.wood, WHITE, 0.3));
    R(x, y + 3, 1, 1, P.woodDark);
    R(x, y - 10, 1, 1, P.woodDark);
    if (x % 8 === 0) R(x, y - 10, 1, 10, P.woodDark);
  }
}

/** The flume that crosses high over the curtain: a wooden channel on trestles, spilling its water through the gap. */
function flume(t: number) {
  const y = 13 * TILE - 6;
  const x0 = 131 * TILE;
  const x1 = CURTAIN.x + CURTAIN.w;
  R(x0, y, x1 - x0, 7, RIVER.wheel);
  R(x0, y, x1 - x0, 1, RIVER.wheelLight);
  R(x0, y - 2, x1 - x0, 2, P.water);
  // Three trestles, each two legs splayed and a cross-tie.
  for (const x of [x0 + 20, x0 + 92, x1 - 30]) {
    const h = T2 * TILE - y - 7;
    for (let k = 0; k < h; k++) {
      const spread = Math.floor((k / h) * 8);
      R(x - spread, y + 7 + k, 2, 1, RIVER.wheelDark);
      R(x + 10 + spread, y + 7 + k, 2, 1, RIVER.wheelDark);
    }
    R(x - 3, y + 7 + Math.floor(h / 2), 18, 2, RIVER.wheel);
  }
  fallWater(CURTAIN, t);
}

/** Behind the curtain: the cave's wet back wall, so it reads as a hollow in the rock. */
function caveBack() {
  for (let x = 137 * TILE; x < 144 * TILE; x++) {
    const top = x < 142 * TILE ? (T2 + 1) * TILE : T2 * TILE;
    R(x, top, 1, (T2 + 4) * TILE - top, (x * 7) % 11 < 2 ? RIVER.wetStoneDark : mix(RIVER.wetStoneDark, INK, 0.3));
  }
}

/** Aamodt bru: a chain bridge of 1852, two stone towers, the chains hanging between, the deck on hangers. */
function aamodt() {
  const left = 171 * TILE + 8;
  const right = 187 * TILE + 8;
  const top = 20 * TILE;
  const deck = T3 * TILE;
  for (const x of [left, right]) {
    R(x - 7, top, 14, deck - top, STONE.light);
    for (let y = top + 4; y < deck; y += 6) R(x - 7, y, 14, 1, STONE.mortar);
    R(x - 9, top - 4, 18, 4, STONE.base);
    R(x - 5, top + 8, 10, 22, mix(STONE.light, INK, 0.5));
  }
  for (let x = left; x <= right; x++) {
    const k = (x - left) / (right - left);
    const y = Math.round(top + 2 + (deck - top - 10) * 4 * k * (1 - k));
    R(x, y, 1, 2, METAL.castIron);
    if ((x - left) % 12 === 6) R(x, y + 2, 1, deck - y - 2, METAL.castIron);
  }
  R(left, deck - 10, right - left, 1, METAL.castIron);
}

/** The last fall's weir, and its water into the pool at Vaterland. */
function fall3(t: number) {
  R(193 * TILE, T3 * TILE - 3, TILE + 4, 4, STONE.light);
  fallWater(FALL3, t);
}

/** Vaterland's old wooden houses on the far bank, behind the stone the rune stands on. */
function vaterland() {
  const houses: [number, number, string, string][] = [
    [239.5, 46, PAINT.ochre, PAINT.ochreLine],
    [243, 40, PAINT.red, PAINT.redLine],
    [247, 52, PAINT.mint, PAINT.mintLine]
  ];
  for (const [c, h, wall, line] of houses) {
    const x = c * TILE;
    const g = surfaceRow(Math.floor(c)) * TILE;
    const w = 3 * TILE - 4;
    R(x, g - h, w, h, wall);
    for (let xx = x + 3; xx < x + w; xx += 4) R(xx, g - h, 1, h, line);
    R(x, g - h, 2, h, PAINT.trim);
    R(x + w - 2, g - h, 2, h, PAINT.trim);
    for (let i = 0; i < 9; i++) R(x - 3 + i * 2, g - h - 9 + i, w + 6 - i * 4, 1, i === 8 ? mix(ROOF.red, INK, 0.2) : ROOF.red);
    for (const wx of [x + 7, x + w - 15]) {
      R(wx - 1, g - h + 9, 9, 11, PAINT.trim);
      R(wx, g - h + 10, 7, 9, GLASS.farWindow);
      R(wx + 3, g - h + 10, 1, 9, PAINT.trim);
      light(wx, g - h + 10, 3, 9);
      light(wx + 4, g - h + 10, 3, 9);
    }
  }
}

/** Grass ground in summer: the front page's grass, a tuft or a flower now and then. */
function grassTop(c: number, x: number, y: number) {
  if ((c * 7) % 5 === 0) R(x + ((c * 3) % 11) + 2, y - 2, 1, 2, P.grassDark);
  if ((c * 11) % 13 === 0) {
    R(x + ((c * 5) % 9) + 3, y - 3, 1, 3, P.grassDark);
    R(x + ((c * 5) % 9) + 2, y - 4, 3, 1, (c % 2 ? PAINT.trim : LAMP));
  }
}

/** Rock: wet stone by the river, rounded where it meets the air, moss on its top, blue-dark where it is under water, in strata where it is a cliff. */
function rockTile(c: number, r: number, x: number, y: number, m: TileMap) {
  const h = (k: number) => {
    const n = Math.sin(c * 12.9898 + r * 78.233 + k * 37.719) * 43758.5453;
    return n - Math.floor(n);
  };
  const water = (cc: number, rr: number) => m.tileAt(cc, rr) === "~";
  const under = (water(c - 1, r) && water(c - 1, r - 1)) || (water(c + 1, r) && water(c + 1, r - 1));
  const base = under ? mix(RIVER.wetStone, P.waterDeep, 0.5) : RIVER.wetStone;
  const open = !m.isSolid(c, r - 1) && !water(c, r - 1);
  const leftOpen = m.tileAt(c - 1, r) !== "K" && !m.isSolid(c - 1, r);
  const rightOpen = m.tileAt(c + 1, r) !== "K" && !m.isSolid(c + 1, r);
  if (open) {
    R(x + (leftOpen ? 2 : 0), y, TILE - (leftOpen ? 2 : 0) - (rightOpen ? 2 : 0), 1, base);
    R(x + (leftOpen ? 1 : 0), y + 1, TILE - (leftOpen ? 1 : 0) - (rightOpen ? 1 : 0), 1, base);
    R(x, y + 2, TILE, TILE - 2, base);
  } else R(x, y, TILE, TILE, base);
  R(x + Math.floor(h(1) * 8), y + 3 + Math.floor(h(2) * 9), 6, 3, under ? mix(RIVER.wetStoneLight, P.waterDeep, 0.5) : RIVER.wetStoneLight);
  R(x + Math.floor(h(3) * 9), y + 4 + Math.floor(h(4) * 10), 5, 1, RIVER.wetStoneDark);
  if (!under && r % 3 === 0 && !open) R(x, y + 9, TILE, 1, mix(RIVER.wetStoneDark, RIVER.wetStone, 0.4));
  if (leftOpen) R(x, y + (open ? 2 : 0), 1, TILE, RIVER.wetStoneDark);
  if (rightOpen) R(x + TILE - 1, y + (open ? 2 : 0), 1, TILE, RIVER.wetStoneDark);
  if (open) {
    R(x + (leftOpen ? 2 : 0), y, TILE - (leftOpen ? 2 : 0) - (rightOpen ? 2 : 0), 1, P.grass);
    R(x + 2, y + 1, TILE - 4, 1, PLANTS.leaves);
    if ((c * 5) % 3 === 0) R(x + 5, y - 2, 1, 2, P.grassDark);
  }
  // Moss and ferns down the side of a cliff, now and then.
  if (!under && (leftOpen || rightOpen) && h(5) < 0.3) R(rightOpen ? x + TILE - 3 : x, y + 4, 3, 5, STONE.moss);
  // The dark line where it meets the water, at the surface.
  if ((water(c - 1, r) && !water(c - 1, r - 1)) || (water(c + 1, r) && !water(c + 1, r - 1))) R(x, y + 1, TILE, 2, RIVER.waterline);
}

/** Reeds and grass at the water's edges, in front. */
function reeds(t: number) {
  const sway = (k: number) => (view.reduced ? 0 : Math.round(Math.sin(t * 0.03 + k) * 1));
  for (const [c, row] of [[60, T1], [80, T1], [94, T2], [114, T2], [171, T3], [187, T3], [239, POOL - 1]] as const) {
    const x = c * TILE + (c % 2 ? 2 : 10);
    for (let k = 0; k < 5; k++) {
      const h = 8 + ((c + k * 3) % 6);
      R(x + k * 2 + sway(k), row * TILE - h, 1, h, RIVER.reed);
      if (k % 2 === 0) R(x + k * 2 + sway(k), row * TILE - h - 3, 1, 3, RIVER.reedTop);
    }
  }
}

/** A log: bark with a lighter top, the cut ends with their rings; only what is above the water shows as it comes up and goes under. */
function drawLog(at: { x: number; y: number }, water: number) {
  const { x, y } = at;
  const shown = Math.max(0, Math.min(6, water + FLOAT - y));
  if (shown <= 0) return;
  if (shown < 6) {
    R(x + 1, y, 2 * TILE - 2, shown, RIVER.log);
    R(x + 1, y, 2 * TILE - 2, 1, RIVER.logLight);
    R(x - 2, y + shown, 2 * TILE + 4, 1, P.foam);
    return;
  }
  R(x + 1, y, 2 * TILE - 2, 6, RIVER.log);
  R(x + 1, y, 2 * TILE - 2, 1, RIVER.logLight);
  for (let k = 4; k < 2 * TILE - 4; k += 6) R(x + k, y + 2, 3, 1, mix(RIVER.log, INK, 0.25));
  R(x, y + 1, 2, 4, RIVER.logEnd);
  R(x + 2 * TILE - 2, y + 1, 2, 4, RIVER.logEnd);
  R(x + 2 * TILE - 2, y + 2, 1, 2, RIVER.logRing);
  // The water round it.
  R(x - 2, y + 5, 2 * TILE + 4, 1, P.foam);
}

/** The flourish: the salmon run, leaping up the pool one after another, and a rainbow in the last fall's spray. */
function flourish(age: number) {
  const y = POOL * TILE;
  for (let i = 0; i < 10; i++) {
    const k = (age - i * 9) / 40;
    if (k < 0 || k > 1) continue;
    const x = (227 + (i % 5) * 2.2) * TILE + k * 24;
    const h = Math.sin(k * Math.PI) * 30;
    R(x, y - h - 6, 8, 4, CREATURE_SALMON);
    R(x + 6, y - h - 5, 3, 2, CREATURE_SALMON);
    R(x - 2, y - h - 7, 3, 2, mix(CREATURE_SALMON, INK, 0.2));
  }
  if (view.reduced || age < 20) return;
  const bands = ["#d9573a", "#f2a43a", "#f2d24a", "#6fb85a", "#4a7fd6"];
  const cx = 234 * TILE;
  bands.forEach((col, k) => {
    for (let a = 0; a < 40; a++) {
      const t = Math.PI * (0.15 + 0.7 * (a / 40));
      const rr = 30 - k * 2;
      R(Math.round(cx - Math.cos(t) * rr), Math.round(y - 4 - Math.sin(t) * rr), 2, 1, col);
    }
  });
}
const CREATURE_SALMON = "#d98b7a";

export const AKERSELVA: LevelDef = {
  id: "akerselva",
  rune: 5,
  name: "Akerselva",
  landmark: { nb: "Nedover elva til Vaterland", en: "Down the river to Vaterland" },
  place: { nb: "Nedover elva fra Nydalen til Vaterland", en: "Down the river from Nydalen to Vaterland" },
  sky: "day",
  map: MAP,
  legend: { solid: "#K", oneWay: "=-_^", water: "~" },
  ramps: [FOOTBRIDGE],
  carriers: CARRIERS,
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  zones: ZONES,
  flourish: 120,
  // The view goes four rows under the ground, and six by the cave behind the curtain.
  floor: (x) => {
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE)));
    return Math.min(ROWS * TILE, (surfaceRow(c) + (c >= 134 && c <= 146 ? 7 : 4)) * TILE);
  },
  signs: [
    {
      label: { nb: "Akerselva", en: "Akerselva" },
      lines: { nb: ["Elva renner fra Maridalsvannet ned til fjorden.", "Tømmeret flyter samme vei. Det kan du også."], en: ["The river runs from Maridalsvannet down to the fjord.", "The timber floats the same way. So can you."] }
    },
    {
      label: { nb: "Skistaven", en: "The ski pole" },
      lines: { nb: ["Hopp, og trykk Shift eller X: et rykk rett fram.", "Det går gjennom en foss også."], en: ["Jump, then Shift or X: a dash straight on.", "It goes through a waterfall, too."] },
      touch: { nb: ["Hopp, og trykk Rykk: et rykk rett fram.", "Det går gjennom en foss også."], en: ["Jump, then press Dash: a dash straight on.", "It goes through a waterfall, too."] }
    },
    {
      label: { nb: "Hjula", en: "Hjula" },
      lines: { nb: ["Hjula veveri. Hjulet går rundt, som det alltid har gjort.", "Stå på nederst. Gå av øverst."], en: ["Hjula weaving mill. The wheel goes round, as it always has.", "On at the bottom. Off at the top."] }
    },
    {
      label: { nb: "Aamodt bru", en: "Aamodt bru" },
      lines: { nb: ["Denne bro bærer hundre mann.", "Men ikke i takt."], en: ["This bridge carries a hundred men.", "But not in step."] }
    }
  ],
  doors: [
    { id: "tbane", tile: "t", sign: "T-banen", href: "#kart" },
    { id: "qr", tile: "q", sign: "Runesmia", href: "/qr/" }
  ],
  art: {
    far: () => farHills(),
    mid: (v) => midTown(v.t),
    near: () => nearTrees(),
    back(v) {
      riverBehind(8, 60, T1, v.t);
      riverBehind(80, 88, T1, v.t);
      riverBehind(94, 99, T2, v.t);
      riverBehind(129, 136, T2, v.t);
      riverBehind(146, 152, T2, v.t);
      riverBehind(157, 170, T3, v.t);
      riverBehind(188, 193, T3, v.t);
      nydalen(v);
      verksted(v.t);
      dam(v.t);
      dryRace();
      bjolsen();
      fall1(v.t);
      hjula(v.t);
      wheel(v.t);
      runesmia(v);
      footbridge();
      caveBack();
      flume(v.t);
      aamodt();
      fall3(v.t);
      vaterland();
      archBridge();
    },
    front(v) {
      foam(SPOUT, T1 * TILE, v.t);
      foam(FALL1, T2 * TILE, v.t);
      foam(CURTAIN, T3 * TILE, v.t);
      foam(FALL3, POOL * TILE, v.t);
      tailraceFoam(v.t);
      reeds(v.t);
    },
    ground: () => ({ top: P.grass, dot: P.grassDark, fill: P.earth }),
    tile(t, c, r, x, y, m) {
      if (t === "K") {
        rockTile(c, r, x, y, m);
        return true;
      }
      if (t === "#" && !m.isSolid(c, r - 1) && m.tileAt(c, r - 1) !== "~") grassTop(c, x, y);
      return false;
    },
    ledges: {
      "=": { body: STONE.base, top: STONE.light, edge: STONE.mortar, joint: STONE.mortar },
      "-": { body: P.wood, top: mix(P.wood, WHITE, 0.25), edge: P.woodDark, joint: P.woodDark },
      _: { body: METAL.castIron, top: P.iron, edge: INK, joint: P.ironDark },
      "^": { body: ROOF.slate, top: mix(ROOF.slate, WHITE, 0.2), edge: INK, joint: ROOF.slate }
    },
    carrier(i, at, v) {
      const d = CARRIERS[i];
      if (d.kind === "orbit") bucket(at);
      else if (carrierShown(d, v.t)) drawLog(at, (i < FIRST_BUCKET ? T1 : POOL) * TILE);
    },
    enemy(e, v) {
      if (e.def.look !== "salmon" || !e.alive) return false;
      drawSalmon(e, v.t, waterTop(e.x));
      return true;
    },
    flourish: (age) => flourish(age)
  }
};
