import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import { carrierShown, pathPeriod, type CarrierDef, type Path } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Light } from "@larshansen/pixelkit/dark";
import type { Launcher } from "@larshansen/pixelkit/launcher";
import { R, gable, layerX, light, mix, view, wdisc } from "@larshansen/pixelkit/paint";
import { BRICK, GLASS, GROUND, INK, LAMP, LAND, MASONRY, METAL, PAINT, PALETTE, PLANTS, ROOF, SNOW, TRAM, WHITE } from "@larshansen/pixelkit/palette";
import { panelDoor } from "@larshansen/pixelkit/props";
import { ICE } from "@larshansen/pixelkit/surface";
import * as WINTER from "@larshansen/pixelkit/swatches/winter";
import { rampHeight, type Ramp, type TileMap } from "@larshansen/pixelkit/tilemap";
import type { Zone } from "@larshansen/pixelkit/zone";
import type { EnemyDef } from "../game/enemies";
import { PLOUGH, lineHolds, ploughBoss, type Plough, type PloughDef } from "../game/plough";
import { enemyEyes } from "../render/pickups";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 10, rune N: Nabolaget. A winter night over Vålerenga and Kampen, the northern lights up,
// snow falling. Nothing new: everything from the nine levels before, once each. Up onto the roofs of
// the front page's wooden houses, icy, from above the eaves; roof to roof over the back yards on
// washing lines that throw him (launchers) and the warm air over a chimney that lifts him (a zone);
// down into the lane behind Vålerenga kirke, dark but for the church's windows and his headlamp; up
// the tower by its ledges, the spire the last climb; down the snow on its far side into the street.
// There, past a flag and a bench, the snow plough: the last thing between him and home. A bounce on
// the washing line, a jump and the dash from a roof, and a ride on the tram's roof: three times on its
// cab, and it parks for good. Then the yellow house, with a Raspberry Pi in the window serving the
// game; its light turns green when the rune is taken. The door Hjem leads to the front page.
//
//   #  the street   R  a house (drawn behind)   H  a chimney   B  a snow bank   W  a woodshed
//   T  the church tower   K  a gravestone   =  a stone ledge   d  a washing line   v  the tram's slot
//   b  a bench   $  skilling   &  brown cheese   t  T-banen   h  Hjem
//
// Sections: the street and the first roofs (teach, nothing to fall into yet); roof to roof over the
// yards (practise: the lines, the chimney's warm air, ice); behind the church and up the spire (twist:
// the dark, and the climb); the street to the yellow house (set piece: the plough, the rune).

const COLS = 224;
const STONE_JOINT = MASONRY.gatePostLine;
/** The grey-blue of a few of the houses, as on Galgeberg. */
const BLUE_GREY = { wall: "#7d8a9c", line: "#6f7c8f" };
const ROWS = 24;
/** The street. */
export const S = 17;
const b = mapBuilder(COLS, ROWS);
const ROOFS: Ramp[] = [];
/** The houses along the roofs: columns, eaves row, how many rows the ridge stands over the eaves, and their paint. */
export const HOUSES: { c0: number; c1: number; eave: number; rise: number; wall: string; line: string }[] = [];

/** A house from column c0 to c1 with a gable roof: the roof is a ramp he walks (icy), the house under it is solid. */
function house(c0: number, c1: number, eave: number, rise: number, wall: string, line: string) {
  const x0 = c0 * TILE;
  const x1 = (c1 + 1) * TILE;
  const ey = eave * TILE;
  const ramp: Ramp = { points: [[x0, ey], [(x0 + x1) / 2, ey - rise * TILE], [x1, ey]] };
  ROOFS.push(ramp);
  HOUSES.push({ c0, c1, eave, rise, wall, line });
  const y = (x: number) => rampHeight([ramp], Math.max(x0, Math.min(x1, x))) ?? ey;
  for (let c = c0; c <= c1; c++) {
    const low = Math.max(y(c * TILE - 8), y((c + 1) * TILE + 8), y(c * TILE + 8));
    for (let r = Math.ceil(low / TILE); r < ROWS; r++) b.put(c, r, "R");
  }
}

// --- The street, and the first roofs --------------------------------------------------------------------
b.ground(0, 11, S);
b.fill(10, 11, S - 2, S - 1, "W");
house(12, 17, 14, 2, PAINT.mint, PAINT.mintLine);
house(20, 24, 14, 2, PAINT.red, PAINT.redLine);
b.run(25, 27, 15, "d");
house(28, 33, 12, 2, BLUE_GREY.wall, BLUE_GREY.line);
house(37, 42, 13, 3, PAINT.ochre, PAINT.ochreLine);
// A chimney on the fourth house: the warm air over it lifts him to the block's roof.
b.fill(41, 41, 9, 10, "H");
// The block: a flat roof, icy.
b.ground(44, 52, 8, "R");

// --- Roof to roof ------------------------------------------------------------------------------------------
house(56, 61, 11, 2, PAINT.red, PAINT.redLine);
b.run(62, 64, 12, "d");
house(65, 70, 10, 2, PAINT.mint, PAINT.mintLine);
house(73, 78, 11, 2, BLUE_GREY.wall, BLUE_GREY.line);

// --- Behind the church, and up the tower --------------------------------------------------------------------
b.ground(79, 111, S);
b.put(87, S - 1, "K").put(93, S - 1, "K");
house(112, 127, 11, 4, MASONRY.church, MASONRY.churchTower);
b.fill(128, 131, 2, ROWS - 1, "T");
// Steps up the church's west end (its buttresses), and stone ledges up the tower's side.
b.run(109, 111, 15, "=");
b.run(110, 111, 13, "=");
b.run(122, 124, 6, "=");
b.run(125, 127, 4, "=");
// The snow down the far side, from the tower's foot to the street.
export const DRIFT = b.slope(132, 4, 152, S, "#");
b.ground(152, 155, S);

// --- The street to the yellow house ----------------------------------------------------------------------------
// The slot the tram comes up out of, and the one it goes down into past the plough's stretch.
b.fill(156, 158, S, S + 1, "v");
b.ground(156, 158, S + 2);
b.ground(159, 206, S);
b.fill(207, 209, S, S + 1, "v");
b.ground(207, 209, S + 2);
b.ground(210, COLS - 1, S);
// A crate up to the house's terrace, the terrace he waits on, a bank of snow by the washing line.
b.put(167, S - 1, "W").put(174, S - 1, "W");
b.fill(168, 173, S - 3, S - 1, "R");
b.fill(177, 178, S - 1, S - 1, "B");

// Marks: the start, the doors, signs, flags, benches, the rune, the bracteate, the cheese.
b.put(2, S - 1, "t").put(4, S - 1, "S").put(7, S - 1, "i");
b.put(10, S - 3, "f").put(83, S - 3, "b").put(100, S - 1, "f").put(108, S - 1, "i");
// A stone plinth by the lane's wall, a bench on it: a little off the path.
b.run(82, 84, S - 2, "=");
b.put(161, S - 1, "f").put(163, S - 1, "b").put(165, S - 1, "i");
b.put(214, S - 1, "h").put(218, S - 2, "r").put(42, 0, "o").put(130, 0, "&");

/** Skilling a little over a roof: the tile row just above its ramp at column c. */
const over = (c: number) => Math.floor(((rampHeight(ROOFS, c * TILE + 8) ?? S * TILE) - 10) / TILE);
// Skilling: up the shed, over the roofs and their gaps, up the washing lines, in the chimney's air,
// along the block's roof, over the lane's stones, up the tower, down the snow, through the plough's
// street, and round the yellow house.
const COINS: [number, number][] = [
  [8, 16], [9, 16],
  ...[13, 15, 16].map((c): [number, number] => [c, over(c)]),
  [18, 12], [19, 12],
  ...[21, 23].map((c): [number, number] => [c, over(c)]),
  [26, 11], [27, 9],
  ...[29, 31, 33].map((c): [number, number] => [c, over(c)]),
  [35, 10], [36, 10],
  ...[38, 40].map((c): [number, number] => [c, over(c)]),
  [42, 7], [42, 5], [43, 3],
  [45, 7], [47, 7], [49, 7], [51, 7],
  [54, 8], [55, 9],
  ...[57, 59, 61].map((c): [number, number] => [c, over(c)]),
  [63, 9], [64, 7],
  ...[66, 68, 70].map((c): [number, number] => [c, over(c)]),
  [71, 8], [72, 8],
  ...[74, 76, 78].map((c): [number, number] => [c, over(c)]),
  [87, 14], [93, 14], [97, 16], [104, 16],
  [110, 12], [116, 9], [123, 5], [126, 3], [129, 1], [131, 1],
  [136, 6], [140, 9], [144, 12], [148, 14],
  [157, 14], [158, 14],
  [170, 12], [172, 12],
  [190, 15], [196, 15], [202, 15],
  [208, 14], [209, 14],
  [213, 16], [216, 16]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The chimney's warm air: it lifts him ----------------------------------------------------------------
/** Over the fourth house's chimney, up past the block's roof. */
export const SMOKE: Zone = { x: 41 * TILE - 8, y: 6 * TILE, w: 2 * TILE + 8, h: 13 * TILE - 6 * TILE, push: { x: 0, y: -0.55 } };

// --- The tram ------------------------------------------------------------------------------------------------
/** Its roof: a little over the plough's cab, and a hop up from the house's terrace. */
export const TRAM_ROOF = S * TILE - 64;
const TRAM_W = 4 * TILE;
/** Up out of its slot, standing in front of the house with the terrace, across the plough's street, and down into its other slot. */
const TRAM_LINE: Path = {
  kind: "path",
  points: [
    { x: 155 * TILE, y: S * TILE + 40 },
    { x: 157 * TILE, y: TRAM_ROOF },
    { x: 169 * TILE, y: TRAM_ROOF },
    { x: 204 * TILE, y: TRAM_ROOF },
    { x: 207 * TILE, y: S * TILE + 50 }
  ],
  w: TRAM_W,
  speed: 1.5,
  wait: 0,
  stops: [{ at: 2, steps: 120 }]
};
TRAM_LINE.wait = 2 - (pathPeriod(TRAM_LINE) % 2) + 90;
export const TRAMS: Path[] = [0, 1].map((i) => ({ ...TRAM_LINE, offset: (i * pathPeriod(TRAM_LINE)) / 2 }));
const CARRIERS: CarrierDef[] = TRAMS;

// --- The plough ------------------------------------------------------------------------------------------------
const CAB = PLOUGH.w / 2;
export const PLOUGH_DEF: PloughDef = {
  floor: S * TILE,
  x: 203 * TILE + CAB,
  wakeAt: 166 * TILE,
  rounds: [
    { x0: 182 * TILE + CAB, x1: 203 * TILE + CAB, sticks: true },
    { x0: 179 * TILE + CAB, x1: 203 * TILE + CAB, sticks: true },
    { x0: 187 * TILE + CAB, x1: 203 * TILE + CAB, sticks: false }
  ],
  line: { x0: 178 * TILE, x1: 181 * TILE, y: 15 * TILE + 4, speed: 7 }
};
/** The terrace he waits on: its edge, toward the street. */
export const TERRACE = { right: 174 * TILE, top: (S - 3) * TILE };

/**
 * Cats on the roofs, the first alone on its ridge; crows over the yards; a snowball kid on the block's
 * roof; a fox, an owl and another kid in the lane behind the church.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "cat", c: 30, r: 10, range: 1, w: 12 },
  { kind: "flyer", look: "crow", c: 35, r: 7, range: 2, rise: 8, period: 160 },
  { kind: "thrower", look: "kid", c: 50, r: 7, period: 210 },
  { kind: "walker", look: "cat", c: 58, r: 9, range: 1, w: 12 },
  { kind: "flyer", look: "crow", c: 72, r: 6, range: 3, rise: 6, period: 170, offset: 60 },
  { kind: "walker", look: "cat", c: 153, r: S - 1, range: 1, w: 12 },
  { kind: "walker", look: "fox", c: 90, r: S - 1, range: 2, w: 12 },
  { kind: "flyer", look: "owl", c: 96, r: 13, range: 2, rise: 6, period: 170 },
  { kind: "thrower", look: "kid", c: 106, r: S - 1, period: 220, offset: 90 },
  { kind: "flyer", look: "crow", c: 141, r: 8, range: 2, rise: 8, period: 150 }
];

export const NABOLAGET_RULES = { COLS, ROWS, CARRIERS };

// --- Art -----------------------------------------------------------------------------------------------------------
const P = PALETTE;
const at = (c: number, r: number) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? MAP[r][c] : ".");
function surfaceRow(c: number) {
  for (let r = 0; r < ROWS; r++) if ("#RTBW".includes(at(c, r))) return r;
  return ROWS;
}
/** The yellow house: its left end, its width, its walls' top, the door, and the Pi's window. */
const HOME = { x: 211 * TILE, w: 8 * TILE, top: S * TILE - 64, window: { x: 216 * TILE + 4, y: S * TILE - 30, w: 22, h: 20 } };

/** How dark it is at x: the lane behind the church and the churchyard; the rest of the night is the sky's. */
function dark(x: number, v: View) {
  const c = x / TILE;
  const n = c < 80 ? 0 : c < 84 ? ((c - 80) / 4) * 0.72 : c < 110 ? 0.72 : c < 116 ? 0.72 - ((c - 110) / 6) * 0.72 : 0;
  return v.flourish !== null ? n * Math.max(0, 1 - v.flourish / 60) : n;
}

/** What shows through the dark: the church's windows, the lamps in the lane, the flag and the bench. */
function lights(v: View): Light[] {
  const out: Light[] = [];
  for (const w of CHURCH_WINDOWS) out.push({ rect: { x: w.x - 1, y: w.y - 1, w: 8, h: 18 }, dark: 0 }, { x: w.x + 3, y: w.y + 12, rings: [[22, 0.5], [14, 0.25]] });
  for (const x of LANE_LAMPS) out.push({ x, y: S * TILE - 40, rings: [[34, 0.45], [24, 0.2], [10, 0]] });
  for (const f of v.flags) if (f.x > 80 * TILE && f.x < 112 * TILE) out.push({ x: f.x, y: f.bottom - 20, rings: [[14, 0.4]] });
  return out;
}
const CHURCH_WINDOWS = [114, 117, 120, 123].map((c) => ({ x: c * TILE + 4, y: 12 * TILE + 6 }));
const LANE_LAMPS = [82 * TILE, 98 * TILE];

/** The far hills under the northern lights: Ekeberg to the south, its lights, snow on the ridge. */
function farHills() {
  const base = 190 + view.camY * 0.85;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 26 + 9 * Math.sin(wx * 0.003 + 2) + 4 * Math.sin(wx * 0.011);
    column(x, base - h, base + 300, LAND.farHills);
    column(x, base - h, base - h + 3, SNOW.far);
    if ((Math.floor(wx) * 13) % 37 === 0) lit(x, base - h + 6 + ((Math.floor(wx) * 7) % 12), 1, 1);
  }
}
const LAND_NIGHT = "#2a3458";

/** Kampen and Vålerenga further off: rows of small houses, snow on their roofs, Kampen kirke's spire. */
function midRoofs(t: number) {
  const base = 230 + view.camY * 0.75;
  for (let i = 0; i < 60; i++) {
    const wx = i * 46 + ((i * 31) % 20);
    const x = layerX(wx, 0.2);
    if (x < -30 || x > view.w + 10) continue;
    const w = 20 + ((i * 7) % 10);
    const h = 14 + ((i * 11) % 10);
    const wall = [PAINT.farOchre, PAINT.farRed, PAINT.farWhite, PAINT.farGreen][i % 4];
    box(x, base - h, w, h + 60, mix(wall, LAND_NIGHT, 0.35));
    gableBox(x - 2, base - h, w + 4, 7, SNOW.far);
    lit(x + 4, base - h + 4, 3, 3);
    if (i % 3) lit(x + w - 7, base - h + 4, 3, 3);
    if (i % 5 === 0 && !view.reduced) for (let k = 0; k < 3; k++) box(x + w - 6 + ((t / 20 + k) % 3), base - h - 12 - k * 4 - ((t / 6) % 4), 3, 2, `rgba(220, 225, 235, ${0.4 - k * 0.1})`);
    if (i % 17 === 8) {
      box(x + w / 2 - 3, base - h - 26, 6, 26, mix(BRICK.red, LAND_NIGHT, 0.35));
      for (let k = 0; k < 16; k++) box(x + w / 2 - Math.floor(k / 5), base - h - 42 + k, 1 + Math.floor(k / 5) * 2, 1, mix(BRICK.red, LAND_NIGHT, 0.35));
    }
  }
}
/** A gable in a layer's own pixels. */
function gableBox(x: number, baseY: number, w: number, h: number, c: string) {
  for (let i = 0; i < h; i++) {
    const half = Math.round((w / 2) * ((i + 1) / h));
    box(x + w / 2 - half, baseY - h + i, half * 2, 1, c);
  }
}

/** Nearer: bare trees with snow on their branches, and lamp posts. */
function nearTrees() {
  for (let i = 0; i < 40; i++) {
    const wx = i * 157 + ((i * 53) % 70);
    const x = layerX(wx, 0.4);
    if (x < -20 || x > view.w + 20) continue;
    const c = Math.max(0, Math.min(COLS - 1, Math.floor((view.camX + x) / TILE)));
    const foot = Math.min(S, surfaceRow(c) + 2) * TILE;
    const col = mix(PLANTS.bark, LAND_NIGHT, 0.4);
    box(x, foot - 46, 2, 46, col);
    for (const [dy, dx, len] of [[-40, -1, -8], [-34, 2, 9], [-28, -1, -7], [-22, 2, 6]] as const) {
      const w = Math.abs(len);
      box(len < 0 ? x + dx - w : x + dx, foot + dy, w, 1, col);
      box(len < 0 ? x + dx - w : x + dx, foot + dy - 1, w, 1, mix(SNOW.lying, LAND_NIGHT, 0.2));
    }
  }
}

/** The houses along the roofs: painted planks, white corners, windows lit; their roofs slate under snow. */
function houses() {
  for (const h of HOUSES) {
    const x = h.c0 * TILE;
    const w = (h.c1 - h.c0 + 1) * TILE;
    const ey = h.eave * TILE;
    const church = h.wall === MASONRY.church;
    if (church) continue;
    R(x, ey, w, S * TILE + 64 - ey, h.wall);
    for (let k = x + 3; k < x + w - 2; k += 4) R(k, ey, 1, S * TILE + 64 - ey, h.line);
    R(x, ey, 2, S * TILE + 64 - ey, PAINT.trim);
    R(x + w - 2, ey, 2, S * TILE + 64 - ey, PAINT.trim);
    for (let wy = ey + 10; wy < S * TILE - 8; wy += 34)
      for (const wx of [x + 10, x + w - 22]) {
        R(wx - 1, wy - 1, 14, 14, PAINT.trim);
        R(wx, wy, 12, 12, GLASS.farWindow);
        R(wx + 6, wy, 1, 12, PAINT.trim);
        R(wx, wy + 6, 12, 1, PAINT.trim);
        light(wx, wy, 6, 6);
        light(wx + 7, wy + 7, 5, 5);
      }
    roofOf(h.c0, h.c1, h.eave, h.rise);
  }
  // The block: grey render, rows of windows, its flat roof under snow.
  const bx = 44 * TILE;
  const by = 8 * TILE;
  R(bx, by, 9 * TILE, S * TILE + 64 - by, BLOCK);
  for (let y = by + 10; y < S * TILE; y += 18) for (let x = bx + 8; x < bx + 9 * TILE - 10; x += 18) {
    R(x, y, 10, 11, GLASS.farWindow);
    if ((x + y) % 3) light(x, y, 10, 11);
  }
  R(bx - 2, by, 9 * TILE + 4, 3, SNOW.lying);
  R(bx - 2, by + 3, 9 * TILE + 4, 1, SNOW.shade);
}
const BLOCK = "#9a9488";

/** A roof over a house, along its ramp: slate, its edge, and snow lying on it. */
function roofOf(c0: number, c1: number, eave: number, rise: number) {
  const x0 = c0 * TILE - 3;
  const x1 = (c1 + 1) * TILE + 3;
  const ey = eave * TILE;
  const mid = (c0 * TILE + (c1 + 1) * TILE) / 2;
  const half = mid - c0 * TILE;
  for (let x = x0; x < x1; x++) {
    const y = Math.round(ey - rise * TILE * Math.max(0, 1 - Math.abs(x - mid) / half));
    R(x, y + 3, 1, ey - y + 1, ROOF.slate);
    R(x, y, 1, 3, SNOW.lying);
    R(x, y + 3, 1, 1, SNOW.shade);
  }
}

/** A chimney: brick with a cap, snow on it; its smoke rises, and over the fourth house's it rises fast and thick (the warm air). */
function chimneys(t: number) {
  const tt = view.reduced ? 0 : t;
  for (const [c, top, bottom] of [[41, 9, 11], [16, 11, 13], [59, 9, 10], [69, 8, 10]] as const) {
    const x = c * TILE + 4;
    R(x, top * TILE, 8, (bottom - top) * TILE, BRICK.red);
    for (let y = top * TILE + 3; y < bottom * TILE; y += 4) R(x, y, 8, 1, BRICK.course);
    R(x - 1, top * TILE - 2, 10, 2, MASONRY.chimney);
    R(x - 1, top * TILE - 3, 10, 1, SNOW.lying);
  }
  // The warm air over the fourth house: puffs rising the height of the zone, fast.
  const z = SMOKE;
  for (let i = 0; i < 14; i++) {
    const k = ((tt * 1.6 + i * 23) % z.h) / z.h;
    const y = z.y + z.h - k * z.h;
    const x = z.x + 4 + Math.round(Math.sin(tt * 0.05 + i) * 4) + (i % 3) * 7;
    const s = 3 + Math.round(k * 4);
    R(x, y, s, s - 1, `rgba(225, 230, 240, ${(0.55 * (1 - k * 0.7)).toFixed(2)})`);
  }
}

/** Vålerenga kirke: grey stone, tall arched windows lit from inside, the tower and its green spire; gravestones in the yard. */
function church() {
  const x = 112 * TILE;
  const w = 16 * TILE;
  const ey = 11 * TILE;
  R(x, ey, w, S * TILE + 40 - ey, MASONRY.church);
  for (let y = ey + 6; y < S * TILE; y += 8) {
    R(x, y, w, 1, MASONRY.churchWindow);
    for (let k = x + ((y / 8) % 2) * 6; k < x + w; k += 12) R(k, y - 7, 1, 7, MASONRY.churchWindow);
  }
  for (const win of CHURCH_WINDOWS) {
    R(win.x - 1, win.y - 3, 8, 22, MASONRY.lintel);
    for (let k = 0; k < 3; k++) R(win.x + k, win.y - 3 + k, 6 - k * 2, 1, MASONRY.lintel);
    R(win.x, win.y, 6, 18, WINTER.stained);
    R(win.x, win.y + 6, 6, 4, WINTER.stainedBlue);
    R(win.x + 2, win.y, 2, 18, WINTER.stainedGold);
    light(win.x, win.y, 6, 18, "soft");
  }
  roofOf(112, 127, 11, 4);
  // The tower: dressed stone, a clock, louvres, and the spire in copper gone green, a cross on top.
  const tx = 128 * TILE;
  const ty = 2 * TILE;
  R(tx, ty, 4 * TILE, S * TILE + 40 - ty, MASONRY.churchTower);
  for (let y = ty + 5; y < S * TILE; y += 7) R(tx, y, 4 * TILE, 1, MASONRY.churchWindow);
  wdisc(tx + 32, ty + 34, 9, PAINT.trim);
  wdisc(tx + 32, ty + 34, 7, MASONRY.churchWindow);
  R(tx + 32, ty + 28, 1, 6, PAINT.trim);
  R(tx + 32, ty + 34, 5, 1, PAINT.trim);
  for (const lx of [tx + 14, tx + 40]) {
    R(lx, ty + 58, 10, 22, INK);
    for (let k = 0; k < 22; k += 4) R(lx, ty + 58 + k, 10, 1, MASONRY.churchTower);
  }
  for (let i = 0; i < 52; i++) {
    const half = Math.max(1, Math.round((i / 52) * 30));
    R(tx + 32 - half, ty - 52 + i, half * 2, 1, i % 6 === 0 ? METAL.copperLight : METAL.copper);
  }
  R(tx + 31, ty - 66, 2, 14, METAL.gold);
  R(tx + 28, ty - 62, 8, 2, METAL.gold);
  R(tx - 2, ty - 2, 4 * TILE + 4, 3, SNOW.lying);
}

/** The snow down the far side of the tower: a drift, its top packed and glittering. */
function drift() {
  const [, [x0, y0], [x1, y1]] = DRIFT.points;
  for (let x = x0; x < x1; x++) {
    const y = Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
    R(x, y, 1, S * TILE + 40 - y, mix(SNOW.lying, SNOW.shade, 0.5));
    R(x, y, 1, 2, SNOW.lying);
    if ((x * 7) % 13 === 0) R(x, y + 4 + (x % 9), 1, 1, WHITE);
  }
}

/** The lane behind the church: a stone wall along it, two lamps, the gravestones' snow. */
function lane() {
  const g = S * TILE;
  for (let x = 79 * TILE; x < 112 * TILE; x++) {
    R(x, g - 24, 1, 24, (Math.floor(x / 9) + Math.floor((x * 7) / 13)) % 4 ? MASONRY.lintel : MASONRY.gatePostLine);
    if (x % 9 === 0) R(x, g - 24, 1, 24, MASONRY.edge);
  }
  R(79 * TILE, g - 26, 33 * TILE, 2, SNOW.lying);
  for (const x of LANE_LAMPS) {
    R(x, g - 40, 2, 40, METAL.lampPost);
    R(x - 3, g - 44, 8, 4, METAL.lampHat);
    R(x - 2, g - 41, 6, 2, LAMP);
  }
}

/** The plough's street: the house with the terrace, the washing line by the bank, the tram's slots, and the yellow house. */
function street(v: View, p: Plough | null) {
  const g = S * TILE;
  // The house he waits on: red, its terrace railing, a lit window.
  const hx = 168 * TILE;
  R(hx, TERRACE.top, 6 * TILE, g - TERRACE.top, PAINT.red);
  for (let k = hx + 3; k < hx + 6 * TILE - 2; k += 4) R(k, TERRACE.top, 1, g - TERRACE.top, PAINT.redLine);
  R(hx, TERRACE.top, 2, g - TERRACE.top, PAINT.trim);
  R(hx + 6 * TILE - 2, TERRACE.top, 2, g - TERRACE.top, PAINT.trim);
  R(hx + 20, g - 30, 14, 14, PAINT.trim);
  R(hx + 21, g - 29, 12, 12, GLASS.farWindow);
  light(hx + 21, g - 29, 12, 12);
  for (let x = hx; x < TERRACE.right; x += 6) R(x, TERRACE.top - 10, 1, 10, METAL.lampPost);
  R(hx, TERRACE.top - 10, 6 * TILE, 1, METAL.lampPost);
  // Its upper floor, set back, and the roof.
  R(hx + 8, TERRACE.top - 40, 6 * TILE - 16, 40, PAINT.red);
  gable(hx + 2, TERRACE.top - 40, 6 * TILE - 4, 18, SNOW.lying);
  light(hx + 30, TERRACE.top - 30, 10, 10);
  // The washing line: two poles, the line, the washing; down in the snow once the plough has had its pole.
  const l = PLOUGH_DEF.line;
  if (!p || lineHolds(p)) {
    for (const x of [l.x0, l.x1 - 2]) R(x, l.y - 6, 2, g - l.y + 6, METAL.lampPost);
    const sag = p && v.t - p.lineAt < 10 && !view.reduced ? 4 : 1;
    for (let x = l.x0; x < l.x1; x++) R(x, l.y - 5 + Math.round(sag * Math.sin(((x - l.x0) / (l.x1 - l.x0)) * Math.PI)), 1, 1, METAL.wire);
    washing(l.x0 + 6, l.y - 4, v.t);
  } else {
    R(l.x0, g - 4, 2, 4, METAL.lampPost);
    for (let k = 0; k < 20; k++) R(l.x0 + 2 + k, g - 4 - Math.floor(k / 3), 1, 1, METAL.lampPost);
    R(l.x0 + 10, g - 3, 6, 3, WINTER.shirt);
    R(l.x0 + 20, g - 3, 8, 3, WINTER.sheet);
  }
  // The tram's slots in the street: dark, with rails going down.
  for (const c of [156, 207]) {
    R(c * TILE, g, 3 * TILE, 2 * TILE, mix(INK, GROUND.cobbleFill, 0.3));
    for (let k = 0; k < 3 * TILE; k += 5) R(c * TILE + k, g + 6 + (k % 3), 3, 1, METAL.rail);
    R(c * TILE - 2, g, 2, 2 * TILE, GROUND.cobbleDot);
    R((c + 3) * TILE, g, 2, 2 * TILE, GROUND.cobbleDot);
  }
  home(v);
}

/** Washing on the line: a shirt, a sheet, two socks, swinging a little. */
function washing(x: number, y: number, t: number) {
  const s = view.reduced ? 0 : Math.round(Math.sin(t * 0.05));
  R(x + s, y, 9, 8, WINTER.shirt);
  R(x - 2 + s, y, 3, 4, WINTER.shirt);
  R(x + 8 + s, y, 3, 4, WINTER.shirt);
  R(x + 15 + s, y, 12, 12, WINTER.sheet);
  R(x + 15 + s, y + 11, 12, 1, SNOW.shade);
  R(x + 31 + s, y, 3, 6, WINTER.sock);
  R(x + 36 + s, y, 3, 6, WINTER.sock);
}

/**
 * The yellow house, as the front page draws it: ochre planks, white corners, a slate roof under
 * snow, windows lit, the door Hjem. In the window right of the door, on the sill, a Raspberry Pi:
 * a small green board, its light red until the rune is taken, then green.
 */
function home(v: View) {
  const { x, w, top } = HOME;
  const g = S * TILE;
  R(x, top, w, g - top, PAINT.ochre);
  for (let k = x + 3; k < x + w - 2; k += 4) R(k, top, 1, g - top, PAINT.ochreLine);
  R(x, top, 2, g - top, PAINT.trim);
  R(x + w - 2, top, 2, g - top, PAINT.trim);
  // Its roof under snow, as the front page draws it in winter, the slate showing at the eaves.
  gable(x - 6, top, w + 12, 30, SNOW.lying);
  R(x - 6, top - 2, w + 12, 2, ROOF.slate);
  R(x + w - 30, top - 34, 8, 16, MASONRY.chimney);
  R(x + w - 31, top - 35, 10, 2, SNOW.lying);
  for (const [wx, wy] of [[x + 10, top + 8], [x + w - 26, top + 8], [x + 10, top + 34]] as const) {
    R(wx - 1, wy - 1, 18, 16, PAINT.trim);
    R(wx, wy, 16, 14, GLASS.farWindow);
    R(wx + 8, wy, 1, 14, PAINT.trim);
    R(wx, wy + 7, 16, 1, PAINT.trim);
    light(wx, wy, 8, 7);
    light(wx + 9, wy, 7, 7);
    light(wx, wy + 8, 8, 6);
    light(wx + 9, wy + 8, 7, 6);
  }
  const d = v.doors.get("home");
  if (d) {
    R(d.x - 2, d.bottom - d.h - 2, d.w + 4, d.h + 2, PAINT.trim);
    panelDoor(d, PAINT.homeDoor, PAINT.homeDoorPanel);
  }
  // The Pi's window: warm inside, the board on the sill, its light.
  const pw = HOME.window;
  R(pw.x - 1, pw.y - 1, pw.w + 2, pw.h + 2, PAINT.trim);
  R(pw.x, pw.y, pw.w, pw.h, GLASS.farWindow);
  light(pw.x, pw.y, pw.w, pw.h - 6);
  R(pw.x, pw.y + pw.h - 6, pw.w, 1, PAINT.trim);
  // The board itself is drawn over the night (see `pi`), in front of the lamplight in the room.
}

/**
 * The Raspberry Pi on the sill, drawn after the night's tint so it reads in front of the lit window:
 * a green board, its row of pins, a chip, two USB ports, and its light, red and blinking until the
 * rune is taken, then green, and the window takes on its glow.
 */
function pi(v: View) {
  const pw = HOME.window;
  const bx = pw.x + 3;
  const by = pw.y + pw.h - 13;
  R(bx, by, 15, 7, PI_BOARD);
  R(bx, by + 6, 15, 1, PI_EDGE);
  for (let k = 1; k < 14; k += 2) R(bx + k, by, 1, 1, PI_PIN);
  R(bx + 2, by + 2, 4, 3, PI_CHIP);
  R(bx + 8, by + 2, 3, 2, PI_PORT);
  R(bx + 12, by + 2, 3, 1, PI_PORT);
  const green = v.runeAt !== null || v.cleared.includes("nabolaget");
  const on = green || view.reduced || Math.floor(v.t / 20) % 4 !== 0;
  if (on) R(bx + 13, by + 4, 2, 2, green ? WINTER.ledGreen : WINTER.ledRed);
  if (green) {
    R(bx + 11, by + 2, 6, 6, "rgba(125, 255, 138, 0.4)");
    R(pw.x, pw.y, pw.w, pw.h - 6, "rgba(125, 255, 138, 0.16)");
    R(pw.x - 4, pw.y + pw.h - 4, pw.w + 8, 6, "rgba(125, 255, 138, 0.12)");
  }
}
const PI_BOARD = mix(WINTER.pi, INK, 0.25);
const PI_EDGE = mix(WINTER.piDark, INK, 0.3);
const PI_PIN = mix(METAL.brass, INK, 0.2);
const PI_CHIP = mix(METAL.lampPost, INK, 0.1);
const PI_PORT = mix(PAINT.trim, INK, 0.3);

/** A snow bank: packed snow, rounded at its ends. */
function bankTile(c: number, x: number, y: number, m: TileMap) {
  const l = m.tileAt(c - 1, Math.floor(y / TILE)) !== "B" ? 3 : 0;
  const r = m.tileAt(c + 1, Math.floor(y / TILE)) !== "B" ? 3 : 0;
  R(x + l, y, TILE - l - r, 2, WINTER.bank);
  R(x, y + 2, TILE, TILE - 2, WINTER.bank);
  R(x, y + 10, TILE, 6, WINTER.bankShade);
}

/** The street: cobbles under packed snow, a rut or two. */
function streetTile(c: number, r: number, x: number, y: number, m: TileMap) {
  R(x, y, TILE, TILE, GROUND.cobbleFill);
  R(x + ((c * 7 + r * 3) % 12) + 1, y + ((c * 5 + r * 11) % 9) + 5, 3, 2, GROUND.cobble);
  if (m.isSolid(c, r - 1)) return;
  R(x, y, TILE, 4, SNOW.lying);
  R(x, y + 4, TILE, 1, SNOW.shade);
  if ((c * 5) % 7 === 0) R(x + 3, y + 1, 7, 1, SNOW.shade);
}

/** The plough: orange, its cab high and dark-windowed, beacons on the roof, the blade in front; snow thrown up as it charges; reeling when hit; its beacon out when beaten. */
function plough(p: Plough, v: View) {
  const x = Math.round(p.x);
  const g = p.def.floor;
  const f = p.dir;
  const age = v.t - p.since;
  const at = (dx: number) => (f > 0 ? x + dx : x - dx);
  const span = (dx0: number, dx1: number, y: number, h: number, c: string) => R(Math.min(at(dx0), at(dx1)), y, Math.abs(dx1 - dx0), h, c);
  const shake = (p.phase === "windup" || p.phase === "stuck") && !view.reduced ? (v.t % 4 < 2 ? 1 : 0) : 0;
  const y0 = g - PLOUGH.h + shake;
  if (p.phase === "parked" && p.hits === 0) {
    // Parked, dark, snow on it.
    span(-32, 32, y0 + 22, 22, mix(WINTER.plough, INK, 0.45));
    span(-32, 0, y0 + 2, 22, mix(WINTER.plough, INK, 0.45));
    span(-32, 0, y0, 3, SNOW.lying);
    span(0, 32, y0 + 20, 3, SNOW.lying);
    span(32, 40, g - 18, 18, mix(WINTER.blade, INK, 0.5));
    for (const wx of [-22, 18]) wdisc(at(wx), g - 6, 6, WINTER.tyre);
    return;
  }
  const beaten = p.phase === "beaten";
  // The body: the cab at the back, high; the bonnet in front, lower.
  span(-32, 0, y0, 30, WINTER.plough);
  span(-32, 0, y0, 2, WINTER.ploughLight);
  span(-28, -4, y0 + 5, 12, WINTER.cab);
  span(-26, -20, y0 + 6, 3, mix(WINTER.cab, WHITE, 0.25));
  span(-32, 32, y0 + 30, 14, WINTER.plough);
  span(0, 32, y0 + 22, 8, WINTER.plough);
  span(0, 32, y0 + 22, 1, WINTER.ploughLight);
  span(-32, 32, y0 + 42, 2, WINTER.ploughDark);
  for (let k = -28; k < 30; k += 10) span(k, k + 5, y0 + 33, 2, WINTER.ploughDark);
  // The wheels, big, with chains.
  const roll = view.reduced ? 0 : Math.floor(p.x / 3) % 2;
  for (const wx of [-22, 18]) {
    wdisc(at(wx), g - 7, 7, WINTER.tyre);
    wdisc(at(wx), g - 7, 3, P.iron);
    R(at(wx) - 1 + roll, g - 13, 2, 2, P.iron);
  }
  // The blade: yellow, black stripes, angled out in front.
  const bx = at(32);
  for (let k = 0; k < 20; k++) {
    const yy = g - 20 + k;
    const out = Math.round(k * 0.4) + 2;
    R(f > 0 ? bx : bx - out - 4, yy, out + 4, 1, ((k + Math.floor((bx + k) / 4)) >> 2) % 2 ? WINTER.blade : INK);
  }
  // The beacons on the cab's roof: slow while it drives, fast while it revs before a charge, out when beaten.
  const fast = p.phase === "windup";
  const beat = view.reduced ? 1 : Math.floor(v.t / (fast ? 4 : 12)) % 2;
  for (const [k, dx] of [[0, -28], [1, -10]] as const) {
    const hot = !beaten && (beat + k) % 2 === 0;
    span(dx, dx + 6, y0 - 4, 4, hot ? WINTER.beacon : mix(WINTER.beacon, INK, 0.55));
    if (hot) {
      light(Math.min(at(dx), at(dx + 6)), y0 - 4, 6, 4, "lamp");
      if (fast && !view.reduced) span(dx - 4, dx + 10, y0 - 7, 2, "rgba(255, 154, 26, 0.45)");
    }
  }
  // Headlights: lit, and a pool of light on the snow ahead of the blade.
  if (!beaten) {
    span(30, 33, y0 + 24, 3, LAMP);
    light(Math.min(at(30), at(33)), y0 + 24, 3, 3, "lamp");
    light(Math.min(at(36), at(76)), g - 4, 40, 4, "pool");
  }
  // Revving: exhaust from the stack behind the cab.
  if (fast && !view.reduced) for (let k = 0; k < 3; k++) R(at(-34) - 2 + k * 2, y0 - 6 - k * 4 - (age % 6), 3, 3, `rgba(70, 66, 62, ${0.6 - k * 0.15})`);
  // Charging, snow thrown up off the blade; stuck, snow heaped on it.
  if (p.phase === "charge" && !view.reduced) for (let k = 0; k < 8; k++) R(at(40 + ((k * 5 + v.t) % 12)), g - 22 - ((k * 7 + v.t * 2) % 18), 2, 2, SNOW.lying);
  if (p.phase === "stuck") span(34, 46, g - 16, 16, WINTER.bank);
  // Hit: it reels, white flashes on the cab.
  if (p.phase === "hit" && !view.reduced && Math.floor(age / 4) % 2 === 0) span(-30, -2, y0 + 1, 3, WHITE);
  // Its stretch for this round, marked by the bank of snow it has pushed up at the end.
}

/** The flourish: the Pi's light turns green (drawn by the house), the windows of the street warm up, the northern lights flare green over the yellow house. */
function flourish(age: number) {
  if (view.reduced) return;
  const k = Math.min(1, age / 60);
  for (let i = 0; i < 5; i++) {
    const y = 4 * TILE + i * 6 + Math.round(Math.sin(age * 0.05 + i) * 4);
    R(HOME.x - 40, y, HOME.w + 80, 2, `rgba(125, 255, 170, ${(0.18 * k * (1 - i / 6)).toFixed(3)})`);
  }
  for (let i = 0; i < 8; i++) {
    const t = (age + i * 15) % 90;
    R(HOME.window.x + 10 + Math.round(Math.sin(i) * 20), HOME.window.y - t * 1.2, 1, 1, `rgba(125, 255, 138, ${(1 - t / 90).toFixed(2)})`);
  }
}

/** A black cat, tail up, walking the ridge. */
function cat(x0: number, y0: number, dir: number) {
  const x = Math.round(x0 - 6);
  const y = Math.round(y0);
  const at = (dx: number) => (dir > 0 ? x + dx : x + 11 - dx);
  const step = view.reduced ? 0 : Math.floor(x0 / 3) % 2;
  R(x + 2, y - 7, 8, 4, WINTER.cat);
  R(at(9), y - 9, 3, 4, WINTER.cat);
  R(at(9), y - 10, 1, 1, WINTER.cat);
  R(at(11), y - 10, 1, 1, WINTER.cat);
  R(at(10), y - 8, 1, 1, WINTER.catEye);
  R(at(0), y - 11, 1, 5, WINTER.cat);
  R(at(-1), y - 12, 1, 2, WINTER.cat);
  R(at(3) + step, y - 3, 1, 3, WINTER.cat);
  R(at(8) - step, y - 3, 1, 3, WINTER.cat);
}

/** A washing line between two yards: two poles, the line, the washing; it gives as he lands, and throws him. */
function line(l: Launcher, firedAt: number, v: View) {
  const sag = v.t - firedAt >= 0 && v.t - firedAt < 8 && !view.reduced ? 5 : 1;
  const y = l.y + 1;
  for (let x = l.x; x < l.x + l.w; x++) R(x, y + Math.round(sag * Math.sin(((x - l.x) / l.w) * Math.PI)), 1, 1, METAL.wire);
  if (Math.floor(l.x / TILE) % 3 === 1) washing(l.x - 6, y + 1, v.t);
}

export const NABOLAGET: LevelDef = {
  id: "nabolaget",
  rune: 9,
  name: "Nabolaget",
  landmark: { nb: "Vålerenga og Kampen", en: "Vålerenga and Kampen" },
  place: { nb: "Takene på Vålerenga og Kampen", en: "The roofs of Vålerenga and Kampen" },
  sky: "winter",
  map: MAP,
  legend: { solid: "#RHBWTK", oneWay: "=", water: "v" },
  ramps: [...ROOFS, DRIFT],
  carriers: CARRIERS,
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  zones: [SMOKE],
  drum: 7,
  boss: ploughBoss(PLOUGH_DEF),
  bossWords: {
    wake: { nb: "Brøytebilen våkner. Den er det siste før du er hjemme.", en: "The snow plough wakes. It is the last thing between you and home." },
    hit: { nb: "Rett på taket.", en: "Right on the roof." },
    beaten: { nb: "Brøytebilen parkerer. Veien hjem er fri.", en: "The plough parks. The way home is clear." }
  },
  surfaceAt: (x, y) => {
    const h = rampHeight(ROOFS, x);
    if (h !== null && Math.abs(h - y) < 2) return ICE;
    if (y === 8 * TILE && x >= 44 * TILE && x < 53 * TILE) return ICE;
    return null;
  },
  dark,
  flourish: 150,
  floor: (x) => {
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE)));
    return Math.min(ROWS * TILE, Math.max(surfaceRow(c) + 3, S + 2) * TILE);
  },
  signs: [
    {
      label: { nb: "Nabolaget", en: "Nabolaget" },
      lines: { nb: ["Takene er glatte. Klessnorene er ikke til å henge på.", "Varmen fra pipene går rett opp."], en: ["The roofs are slippery. The washing lines are not for hanging on.", "The warm air from the chimneys goes straight up."] }
    },
    {
      label: { nb: "Vålerenga kirke", en: "Vålerenga kirke" },
      lines: { nb: ["Tårnet er det siste du klatrer i kveld.", "Ovenfra ser du det gule huset."], en: ["The tower is the last thing you climb tonight.", "From the top you can see the yellow house."] }
    },
    {
      label: { nb: "Brøyting", en: "Snow clearing" },
      lines: { nb: ["Brøytebilen kommer når den kommer.", "Hold deg over den, ikke foran den."], en: ["The plough comes when it comes.", "Stay above it, not in front of it."] }
    }
  ],
  doors: [
    { id: "tbane", tile: "t", sign: "T-banen", href: "#kart" },
    { id: "home", tile: "h", sign: "Hjem", href: "/" }
  ],
  art: {
    far: () => farHills(),
    mid: (v) => midRoofs(v.t),
    near: () => nearTrees(),
    back(v) {
      VIEW_T.t = v.t;
      tbaneDoor(v.doors.get("tbane"));
      // The woodshed at the start, the houses, the chimneys, the church, the lane, the drift, the street.
      R(10 * TILE, (S - 2) * TILE, 2 * TILE, 2 * TILE, P.wood);
      for (let k = 10 * TILE + 3; k < 12 * TILE; k += 5) R(k, (S - 2) * TILE, 1, 2 * TILE, P.woodDark);
      R(10 * TILE - 2, (S - 2) * TILE - 3, 2 * TILE + 4, 3, SNOW.lying);
      houses();
      chimneys(v.t);
      lane();
      church();
      drift();
      street(v, v.boss as Plough | null);
    },
    front() {},
    ground: () => ({ top: SNOW.lying, dot: SNOW.shade, fill: GROUND.cobbleFill }),
    tile(t, c, r, x, y, m) {
      if (t === "R" || t === "T" || t === "H") return true;
      if (t === "#") {
        // Under the drift its own snow shows; elsewhere the street.
        if (c >= 131 && c < 152 && r < S) return true;
        streetTile(c, r, x, y, m);
        return true;
      }
      if (t === "B") {
        bankTile(c, x, y, m);
        return true;
      }
      if (t === "W") {
        if (c === 167 || c === 174) {
          R(x + 1, y + 2, TILE - 2, TILE - 2, P.crate);
          R(x + 1, y + 2, TILE - 2, 1, P.crateTop);
          R(x, y, TILE, 2, SNOW.lying);
        }
        return true;
      }
      if (t === "K") {
        R(x + 3, y + 3, TILE - 6, TILE - 3, MASONRY.church);
        R(x + 3, y + 1, TILE - 6, 3, SNOW.lying);
        R(x + 6, y + 7, 4, 1, MASONRY.churchWindow);
        R(x + 7, y + 5, 1, 5, MASONRY.churchWindow);
        return true;
      }
      if (t === "v") return true;
      return false;
    },
    ledges: {
      "=": { body: MASONRY.lintel, top: SNOW.lying, edge: MASONRY.edge, joint: STONE_JOINT }
    },
    drum: (_i, l, firedAt, v) => line(l, firedAt, v),
    carrier(i, at, v) {
      const d = CARRIERS[i];
      if (!carrierShown(d, v.t)) return;
      tram(at);
    },
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "cat") {
        cat(e.x, e.y, e.dir);
        return true;
      }
      void v;
      return false;
    },
    lights: (v) => lights(v),
    overDark: (v) => {
      for (const e of v.enemies) for (const [x, y] of enemyEyes(e, v.t)) R(x, y, 1, 1, WINTER.catEye);
      pi(v);
    },
    boss: (s, v) => plough(s as Plough, v),
    flourish: (age) => flourish(age)
  }
};
const VIEW_T = { t: 0 };

/** The tram: Oslo's blue, its windows lit; it comes up out of its slot and goes down into the other, and only what is above the street there is drawn. */
function tram(at: { x: number; y: number }) {
  const { x, y } = at;
  const g = S * TILE;
  for (let dx = 0; dx < TRAM_W; dx++) {
    const wx = x + dx;
    const c = Math.floor(wx / TILE);
    const clip = (c >= 156 && c <= 158) || (c >= 207 && c <= 209) ? g : g + 2;
    const col = (yy: number, h: number, colour: string) => {
      const top = y + yy;
      const end = Math.min(top + h, clip);
      if (end > top) R(wx, top, 1, end - top, colour);
    };
    const gap = dx === 31 || dx === 32;
    col(0, 2, mix(TRAM.body, WHITE, 0.3));
    col(2, 50, gap ? TRAM.skirt : TRAM.body);
    if (!gap && dx > 2 && dx < TRAM_W - 3) col(8, 12, dx % 8 < 6 ? LAMP : TRAM.body);
    col(46, 6, TRAM.skirt);
    if (dx % 32 > 4 && dx % 32 < 12) col(52, 12, mix(TRAM.skirt, INK, 0.4));
  }
  light(x + 3, y + 8, TRAM_W - 6, 12, "soft");
  R(x + 20, y - 8, 1, 8, METAL.wire);
  R(x + 16, y - 9, 9, 1, METAL.wire);
}
