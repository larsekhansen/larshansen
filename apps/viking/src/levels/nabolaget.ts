import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import { carrierShown, pathPeriod, type CarrierDef, type Path } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Light } from "@larshansen/pixelkit/dark";
import { kept, keptStrips, seen } from "@larshansen/pixelkit/kept";
import type { Launcher } from "@larshansen/pixelkit/launcher";
import { R, ctx, gable, layerX, light, mix, view, wdisc, type LightKind } from "@larshansen/pixelkit/paint";
import { BRICK, ENEMY, FACADE, ROLES, GLASS, GROUND, INK, LAMP, LAND, MASONRY, METAL, PAINT, PALETTE, PLANTS, ROOF, SNOW, TRAM, WHITE } from "@larshansen/pixelkit/palette";
import { STOVE_SMOKE, smoke } from "@larshansen/pixelkit/props";
import { CAST, lamp, panelDoor, plankWall, post, railing, tramSide } from "../alive/props";
/** A chimney's smoke on a winter night: pale, thin. */
const NIGHT_SMOKE = { ...STOVE_SMOKE, rgb: "225, 230, 240", alpha: 0.4 };
import { ICE } from "@larshansen/pixelkit/surface";
import * as WINTER from "@larshansen/pixelkit/swatches/winter";
import { rampHeight, type Ramp, type TileMap } from "@larshansen/pixelkit/tilemap";
import type { Zone } from "@larshansen/pixelkit/zone";
import type { EnemyDef } from "../game/enemies";
import { PLOUGH, lineHolds, ploughBoss, type Plough, type PloughDef } from "../game/plough";
import { drawLook, drawLookShot } from "../render/looks";
import { FOE_INK, drawFoe, foeFrame, mark, type Looks } from "../alive/foes";
import { overTheDark } from "../alive/glamour";
import { frame } from "../alive/frames";
import { eyes, outlined, plain } from "../render/sprite";
import { tbaneDoor } from "../render/furniture";
import { drawNightKept } from "../render/night";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";
import { spedX } from "../alive/depth";
import { darker, drawFar, farPiece, lighter } from "../alive/far";
import { EDGE, edgesAt, tile as textured, CRATE, type Grain } from "../alive/ground";
import { STORY } from "../game/story";

// Level 10, rune N: Gamle Oslo (its id and file are still `nabolaget`: ADR 0038, 0055). A winter night
// over Vålerenga and Kampen, the northern lights up, snow falling. Nothing new: everything from the nine levels before, once each. Up onto the roofs of
// the front page's wooden houses, icy, from above the eaves; roof to roof over the back yards on
// washing lines that throw him (launchers) and the warm air over a chimney that lifts him (a zone);
// down into the lane behind Vålerenga kirke, dark but for the church's windows and his headlamp; up
// the tower by its ledges, the spire the last climb; down the snow on its far side into Kværnerdalen,
// past Kruttverket, the old gunpowder works, into the street. There, past a flag and a bench, the snow
// plough: the last thing in his way. A bounce on the washing line, a jump and the dash from
// a roof, and a ride on the tram's roof: three times on its cab, and it parks for good. Then the
// yellow house on Kværnertoppen, with a Raspberry Pi in the window serving the game; its light turns
// green when the rune is taken. The door Hjem leads to the site's front page.
//
//   #  the street   R  a house (drawn behind)   H  a chimney   B  a snow bank   W  a woodshed
//   T  the church tower   K  a gravestone   =  a stone ledge   d  a washing line   v  the tram's slot
//   b  a bench   $  skilling   &  brown cheese   t  T-banen   h  Hjem
//
// Sections: the street and the first roofs (teach, nothing to fall into yet); roof to roof over the
// yards (practise: the lines, the chimney's warm air, ice); behind the church and up the spire (twist:
// the dark, and the climb); past Kruttverket, the street to the yellow house (set piece: the plough,
// the rune).

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
// The last slot is two tiles: the last jump of the game is not its hardest.
b.fill(207, 208, S, S + 1, "v");
b.ground(207, 208, S + 2);
b.ground(209, COLS - 1, S);
// A crate up to the house's terrace, the terrace he waits on, a bank of snow by the washing line.
b.put(167, S - 1, "W").put(174, S - 1, "W");
b.fill(168, 173, S - 3, S - 1, "R");
b.fill(177, 178, S - 1, S - 1, "B");

// Marks: the start, the doors, signs, flags, benches, the rune, the bracteate, the cheese.
b.put(2, S - 1, "t").put(4, S - 1, "S").put(7, S - 1, "i");
b.put(10, S - 3, "f").put(44, 7, "f").put(83, S - 3, "b").put(98, S - 1, "f").put(108, S - 1, "i");
// A flag on the church tower's top, and one past the tram's slot by the yellow house.
b.put(128, 1, "f").put(211, S - 1, "f");
// A stone plinth by the lane's wall, a bench on it: a little off the path.
b.run(82, 84, S - 2, "=");
// Kruttverket's sign at the foot of the snow; then the flag, the bench and the plough's sign.
b.put(154, S - 1, "i");
b.put(161, S - 1, "f").put(163, S - 1, "b").put(165, S - 1, "i");
b.put(214, S - 1, "h").put(218, S - 2, "r").put(42, 0, "o").put(130, 0, "&");

/** Skilling a little over a roof: the tile row just above its ramp at column c. */
const over = (c: number) => Math.floor(((rampHeight(ROOFS, c * TILE + 8) ?? S * TILE) - 10) / TILE);
// Skilling: up the shed, over the roofs and their gaps, up the washing lines, in the chimney's air,
// along the block's roof, over the lane's stones, up the tower, down the snow (one by Kruttverket's
// first window upstairs, a hop off the slope), through the plough's street, and round the yellow house.
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
  [136, 6], [140, 9], [144, 12], [148, 14], [150, 13],
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
  speed: 2,
  wait: 0,
  stops: [{ at: 2, steps: 120 }]
};
// Two on the line, a short turn at the depot: one is never long in coming.
TRAM_LINE.wait = 2 - (pathPeriod(TRAM_LINE) % 2) + 30;
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
  line: { x0: 178 * TILE, x1: 181 * TILE, y: 15 * TILE + 4, speed: 7 },
  backOff: 6 * TILE
};
/** The terrace he waits on: its edge, toward the street. */
export const TERRACE = { right: 174 * TILE, top: (S - 3) * TILE };

/**
 * Cats on the roofs, the first alone on its ridge; crows over the yards; a snowball kid on the block's
 * roof; a fox and an owl in the lane behind the church.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "flyer", look: "crow", c: 35, r: 5, range: 2, rise: 8, period: 160 },
  { kind: "thrower", look: "kid", c: 52, r: 7, period: 210 },
  { kind: "flyer", look: "crow", c: 72, r: 6, range: 3, rise: 6, period: 170, offset: 60 },
  { kind: "walker", look: "cat", c: 153, r: S - 1, range: 1, w: 12 },
  // A tile on from the crate he drops off (order 24): a jump for it pressed as he drops comes after he lands.
  { kind: "walker", look: "fox", c: 91, r: S - 1, range: 2, w: 12 },
  { kind: "flyer", look: "owl", c: 96, r: 13, range: 2, rise: 6, period: 170 },
  { kind: "flyer", look: "crow", c: 141, r: 8, range: 2, rise: 8, period: 150 },
  { kind: "walker", look: "cat", c: 104, r: S - 1, range: 1, w: 12 }
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
const YELLOW = { x: 211 * TILE, w: 8 * TILE, top: S * TILE - 64, window: { x: 216 * TILE + 4, y: S * TILE - 30, w: 22, h: 20 } };

/**
 * The church's stained glass (order 34; ADR 0044 amended): a deep ruby where it was the kit's stained red, 6.3 from the warning red;
 * 17.3 off it now. The paper cranes keep their tint of the old glass, as drawn.
 */
const STAINED = "#9a2433";

/** How dark it is at x: the lane behind the church and the churchyard; the rest of the night is the sky's. */
function dark(x: number, v: View) {
  const c = x / TILE;
  const n = c < 80 ? 0 : c < 84 ? ((c - 80) / 4) * 0.72 : c < 110 ? 0.72 : c < 116 ? 0.72 - ((c - 110) / 6) * 0.72 : 0;
  return v.flourish !== null ? n * Math.max(0, 1 - v.flourish / 60) : n;
}

/** What shows through the dark: the church's windows, the lamps in the lane, the flag and the bench. */
function lights(v: View): Light[] {
  const out: Light[] = [];
  // Each window's pane clear to its foot (order 33: the hole stopped a row short, so its last row was dimmed; ADR 0054), and its ring.
  for (const w of CHURCH_WINDOWS) out.push({ rect: { x: w.x - 1, y: w.y - 1, w: 8, h: 19 }, dark: 0 }, { x: w.x + 3, y: w.y + 12, rings: [[22, 0.5], [14, 0.25]] });
  for (const x of LANE_LAMPS) out.push({ x, y: S * TILE - 40, rings: [[34, 0.45], [24, 0.2], [10, 0]] });
  for (const f of v.flags) if (f.x > 80 * TILE && f.x < 112 * TILE) out.push({ x: f.x, y: f.bottom - 20, rings: [[14, 0.4]] });
  return out;
}
const CHURCH_WINDOWS = [114, 117, 120, 123].map((c) => ({ x: c * TILE + 4, y: 12 * TILE + 6 }));
const LANE_LAMPS = [82 * TILE, 98 * TILE];

/**
 * Where the far view's landmarks are seen from, in world x (order 44). The walk runs from Vålerenga west to Kværnerdalen, the other
 * way from the line map, which has the city and Ekeberg (the stop before) to Gamle Oslo's left: so, as the map has them, the city
 * toward the fjord at the start (the Barcode's slim towers, and the tall plain slab by the central station), Ekeberg's wooded
 * hillside rising close to its right, and Kampen kirke on its hill to the north-east, the other way, toward the end.
 */
const CITY = 380;
const EKEBERG = 1000;
const KAMPEN = 2950;

/** The far hills under the northern lights, snow on the ridge, a window lit here and there; the city toward the fjord, Ekeberg's hillside close, Kampen kirke. */
function farHills() {
  const base = 190 + view.camY * 0.85;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 26 + 9 * Math.sin(wx * 0.003 + 2) + 4 * Math.sin(wx * 0.011);
    column(x, base - h, base + 300, LAND.farHills);
    column(x, base - h, base - h + 3, SNOW.far);
    if ((Math.floor(wx) * 13) % 37 === 0) lit(x, base - h + 6 + ((Math.floor(wx) * 7) % 12), 1, 1);
  }
  drawFar(city(), layerX(CITY, 0.12) - 40, base + 2);
  // Kampen kirke on its hill, nearer than the hills behind and over the roofs between, once (order 44: it stood in the houses' layer
  // over every 17th house, two to a screen, where the roofs in front hid all but its spire).
  drawFar(kampen(), layerX(KAMPEN, 0.12) - 22, base + 2);
  drawFar(ekeberg(), layerX(EKEBERG, 0.12), base + 6);
}

/** The city toward the fjord: the Barcode's row of slim tall blocks with gaps between, light and dark; the tall plain slab by the station to their right; rows of windows, about half lit at night. */
const city = () =>
  farPiece("nabolaget city", 80, 54, (b) => {
    [[2, 5, 26], [9, 4, 33], [15, 5, 29], [22, 4, 36], [28, 5, 28], [35, 4, 34], [41, 5, 30], [48, 4, 25]].forEach(([x, w, h], k) => {
      const c = mix(k % 3 === 1 ? FACADE.stageDoor : k % 2 ? FACADE.aluminium : FACADE.libraryTop, LAND.farHills, 0.2);
      b.block(x, w, 1, h, c);
      for (let u = 4; u < h - 1; u += 3) (u % 6 === 4 ? b.pane : b.fill)(x + 1, w - 2, u, u, k % 3 === 1 ? lighter(c, 0.2) : darker(c, 0.3));
    });
    // The slab: tall, plain, dark glass, its long side toward him, a plain top.
    const slab = mix(GLASS.farWindow, FACADE.aluminiumLine, 0.35);
    b.block(60, 12, 1, 52, slab);
    b.fill(60, 12, 52, 52, lighter(slab, 0.35));
    for (let u = 4; u < 51; u += 3) for (const x of [62, 66, 69]) (u % 9 === 4 && x !== 66 ? b.pane : b.fill)(x, 2, u, u, darker(slab, 0.25));
  });

/** Ekeberg's hillside rising close over Kværnerdalen: wooded, snow among the trees and on its ledges, its brow against the sky, falling away again to the south; a lit window or two at its foot. */
const ekeberg = () =>
  farPiece("nabolaget ekeberg", 230, 70, (b) => {
    const wood = mix(LAND.forestDark, LAND.farHills, 0.25);
    const at = (x: number) => {
      const up = Math.min(1, x / 120);
      const down = x > 180 ? (x - 180) / 50 : 0;
      return 10 + 54 * (up < 0.5 ? 2 * up * up : 1 - 2 * (1 - up) * (1 - up)) - 34 * down * down + (x > 100 && x < 190 ? 3 * Math.sin(x * 0.09) : 0);
    };
    for (let x = 0; x < 230; x++) {
      const h = Math.round(at(x) + ((x * 7) % 5 === 0 ? 2 : (x * 3) % 4 === 0 ? 1 : 0));
      // The steep face, turned from the light, a shade darker; the brow and the foot lit.
      const slope = at(x + 3) - at(x - 3);
      b.fill(x, 1, 1, h, slope > 2.4 && (x * 7) % 3 !== 0 ? darker(wood, 0.1) : slope < -1 ? darker(wood, 0.05) : wood);
      // Snow on the trees' tops and in clearings among them.
      b.dot(x, h, SNOW.far);
      for (let u = h - 3 - (x % 4); u > 4; u -= 6 + ((x * 5) % 5)) if ((x * 13 + u * 7) % 9 < 3) b.fill(x, 1, u, u, mix(SNOW.far, wood, 0.35));
    }
    for (const [x, u] of [[14, 6], [31, 9], [57, 13], [122, 7], [168, 5], [205, 4]] as const) b.pane(x, 2, u, u, GLASS.farWindow);
  });
const LAND_NIGHT = "#2a3458";

/** Kampen and Vålerenga further off: rows of small houses, snow on their roofs. */
function midRoofs(t: number) {
  const base = 230 + view.camY * 0.75;
  for (const far of [true, false]) for (let i = 0; i < 60; i++) {
    // Every other one a little farther, slower, and drawn first (order 23: more speeds, split from what the layer has).
    if ((i % 2 === 1) !== far) continue;
    const wx = i * 46 + ((i * 31) % 20);
    const x = spedX(far ? (wx * 0.2) / 0.16 : wx, far ? 0.16 : 0.2, 0.2);
    if (x < -30 || x > view.w + 10) continue;
    const w = 20 + ((i * 7) % 10);
    const h = 14 + ((i * 11) % 10);
    const wall = [PAINT.farOchre, PAINT.farRed, PAINT.farWhite, PAINT.farGreen][i % 4];
    box(x, base - h, w, h + 60, mix(wall, LAND_NIGHT, 0.35));
    gableBox(x - 2, base - h, w + 4, 7, SNOW.far);
    lit(x + 4, base - h + 4, 3, 3);
    if (i % 3) lit(x + w - 7, base - h + 4, 3, 3);
    if (i % 5 === 0 && !view.reduced) for (let k = 0; k < 3; k++) box(x + w - 6 + ((t / 20 + k) % 3), base - h - 12 - k * 4 - ((t / 6) % 4), 3, 2, `rgba(220, 225, 235, ${0.4 - k * 0.1})`);
  }
}

/** Kampen kirke on its low hill: red brick, the nave's steep roof with snow on it and its tall windows, the tall tower and its pointed spire, a cross. */
const kampen = () =>
  farPiece("nabolaget kampen", 46, 76, (b) => {
    const brick = mix(BRICK.red, LAND_NIGHT, 0.3);
    const hill = mix(SNOW.far, LAND_NIGHT, 0.45);
    for (let x = 0; x < 46; x++) {
      const k = (x - 23) / 23;
      b.fill(x, 1, 1, Math.round(12 * Math.sqrt(Math.max(0, 1 - k * k))) + 1, x < 16 ? lighter(hill, 0.08) : hill);
    }
    b.block(6, 22, 12, 26, brick);
    for (let k = 0; k < 9; k++) b.fill(6 + k, 22 - k * 2, 27 + k, 27 + k, k < 2 ? mix(ROOF.churchSlate, LAND_NIGHT, 0.3) : mix(SNOW.far, LAND_NIGHT, 0.25));
    // Its tall windows lit from inside on a winter evening, as Vålerenga kirke's are.
    for (const x of [9, 13, 17, 21]) b.pane(x, 1, 16, 22, darker(brick, 0.4));
    b.block(28, 9, 10, 50, brick);
    for (let u = 14; u < 50; u += 6) b.fill(29, 7, u, u, darker(brick, 0.1));
    b.fill(30, 2, 40, 45, darker(brick, 0.45));
    b.fill(34, 2, 40, 45, darker(brick, 0.45));
    b.fill(27, 11, 50, 50, lighter(brick, 0.15));
    for (let u = 51; u <= 72; u++) {
      const w = Math.max(1, Math.round(9 - ((u - 51) * 8) / 21));
      b.fill(28 + Math.floor((9 - w) / 2), w, u, u, mix(ROOF.churchSlate, LAND_NIGHT, 0.2));
    }
    b.fill(32, 1, 73, 76, mix(PAINT.trim, LAND_NIGHT, 0.4));
    b.fill(31, 3, 75, 75, mix(PAINT.trim, LAND_NIGHT, 0.4));
  });
/** A gable in a layer's own pixels. */
function gableBox(x: number, baseY: number, w: number, h: number, c: string) {
  for (let i = 0; i < h; i++) {
    const half = Math.round((w / 2) * ((i + 1) / h));
    box(x + w / 2 - half, baseY - h + i, half * 2, 1, c);
  }
}

/** Nearer: bare trees with snow on their branches, and lamp posts. */
function nearTrees() {
  for (const far of [true, false]) for (let i = 0; i < 40; i++) {
    // Every other one a little farther, slower, and drawn first (order 23: more speeds, split from what the layer has).
    if ((i % 2 === 1) !== far) continue;
    const wx = i * 157 + ((i * 53) % 70);
    const x = spedX(far ? (wx * 0.4) / 0.3 : wx, far ? 0.3 : 0.4, 0.4);
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

/** A roof over a house, along its ramp: slate in courses under snow lying on it, a sparkle in the snow (order 26: drawn once and copied, in strips). */
const SLATE = [mix(ROOF.slate, INK, 0.4), mix(ROOF.slate, INK, 0.2), ROOF.slate, mix(ROOF.slate, WHITE, 0.1)];
function roofOf(c0: number, c1: number, eave: number, rise: number) {
  const x0 = c0 * TILE - 3;
  const x1 = (c1 + 1) * TILE + 3;
  const ey = eave * TILE;
  const mid = (c0 * TILE + (c1 + 1) * TILE) / 2;
  const half = mid - c0 * TILE;
  const top = ey - rise * TILE;
  keptStrips(`roof ${c0}`, x0, top, x1 - x0, ey - top + 1, () => {
    for (let x = x0; x < x1; x++) {
      const y = Math.round(ey - rise * TILE * Math.max(0, 1 - Math.abs(x - mid) / half));
      R(x, y, 1, 3, (x * 7 + y * 3) % 23 === 0 ? WHITE : SNOW.lying);
      R(x, y + 3, 1, 1, SNOW.shade);
      for (let yy = y + 4; yy <= ey; yy++) {
        // Courses of slates three rows high from the eave up, each slate six wide, every other course moved by three:
        // the lower edge of a course in shade, a joint between slates, a slate a shade lighter or darker here and there.
        const up = ey - yy;
        const course = Math.floor(up / 3);
        const within = up % 3;
        const sx = (x + (course % 2) * 3 + 600) % 6;
        const n = Math.sin(Math.floor((x + (course % 2) * 3) / 6) * 12.9898 + course * 78.233) * 43758.5453;
        const shade = n - Math.floor(n);
        const tone = within === 0 ? 1 : sx === 0 ? 0 : shade < 0.2 ? 1 : shade > 0.85 ? 3 : within === 2 ? 3 : 2;
        R(x, yy, 1, 1, SLATE[tone]);
      }
      // Snow caught on a course's edge now and then.
      if ((x * 13 + eave) % 41 === 0) R(x, y + 4 + ((x * 5) % 3) * 3, 2, 1, SNOW.shade);
    }
  });
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
  // Two more chimneys smoke a little, pale against the night (order 24; still, with reduced motion: none).
  if (!view.reduced) for (const c of [16, 69]) smoke(c * TILE + 6, (c === 16 ? 11 : 8) * TILE - 4, t + c * 7, NIGHT_SMOKE);
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
    R(win.x, win.y, 6, 18, STAINED);
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

/**
 * The snow down the far side of the tower: a drift, its top packed and glittering; in it (order 20: it was one
 * plain slope) the tracks of the sledges that came down it today, the wind's ripples, the steps of someone who
 * walked down beside them, and the tops of a fence buried to its rails. Kept as strips, drawn once (ADR 0036).
 */
function drift() {
  const [, [x0, y0], [x1, y1]] = DRIFT.points;
  keptStrips("nb-drift", x0, y0, x1 - x0, S * TILE + 40 - y0, () => {
    const at = (x: number) => Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
    const ripple = mix(SNOW.lying, SNOW.shade, 0.25);
    const track = mix(SNOW.shade, INK, 0.12);
    for (let x = x0; x < x1; x++) {
      const y = at(x);
      R(x, y, 1, S * TILE + 40 - y, mix(SNOW.lying, SNOW.shade, 0.5));
      R(x, y, 1, 2, SNOW.lying);
      if ((x * 7) % 13 === 0) R(x, y + 4 + (x % 9), 1, 1, WHITE);
      // Two sledges' runners, down the face a little under the top, and the wind's ripples deeper in.
      R(x, y + 5, 1, 1, track);
      R(x, y + 8, 1, 1, track);
      if ((x + 3) % 23 < 9) R(x, y + 16 + ((x * 3) % 4 === 0 ? 1 : 0), 1, 1, ripple);
      if ((x + 11) % 31 < 12) R(x, y + 27, 1, 1, ripple);
      if ((x + 5) % 19 < 7) R(x, y + 40 + Math.floor((x % 19) / 3), 1, 1, ripple);
      // Older snow deeper in, in packed layers, the day's falls one over another.
      for (const [d, run] of [[52, 41], [70, 29], [92, 37], [116, 23], [142, 31]] as const) if ((x * 3 + d) % run < run - 6) R(x, y + d + ((x >> 4) % 2), 1, 1, mix(SNOW.shade, INK, 0.18));
    }
    // Someone's steps down beside the tracks.
    for (let x = x0 + 6; x < x1 - 4; x += 7) {
      const y = at(x);
      R(x, y + 12, 2, 1, track);
      R(x + 3, y + 13, 2, 1, track);
    }
    // A fence buried to its rails high on the slope, by the tower: post tops and the top rail just showing.
    for (let x = x0 + 40; x < x0 + 130; x += 12) {
      const y = at(x) + 22;
      R(x, y, 2, 4, mix(PALETTE.woodDark, SNOW.shade, 0.35));
      R(x, y - 1, 2, 1, SNOW.lying);
    }
    for (let x = x0 + 40; x < x0 + 130; x++) if (x % 5 < 3) R(x, at(x) + 24, 1, 1, mix(PALETTE.woodDark, SNOW.shade, 0.6));
  });
}

// --- Kruttverket ---------------------------------------------------------------------------------------------
/**
 * Kruttverket, the old gunpowder works in Kværnerdalen, at the foot of the snow: two floors of brick
 * under a roof of snow, its left end behind the drift, its right by the house with the terrace.
 * Only art: nothing of it is in the map. Its walls, the band between its floors, and its six bays.
 */
const KRUTT = { x0: 147 * TILE + 8, x1: 167 * TILE, eave: S * TILE - 98, belt: S * TILE - 48, plinth: S * TILE - 6, bay: 52 };
/** The hall upstairs: a tall arched window in each bay. The first, over the drift, has the paper cranes on threads. */
const HALL = { y: S * TILE - 88, w: 25, h: 36 };
const hallX = (i: number) => KRUTT.x0 + 14 + i * KRUTT.bay;
/** The café's windows on the ground floor, wide and low; the door is in the third bay. */
const CAFE = { y: S * TILE - 37, w: 32, h: 27, door: KRUTT.x0 + 2 * KRUTT.bay + 26 };
const BRICK_JOINT = mix(BRICK.kruttverket, INK, 0.22);
const BRICK_PALE = mix(BRICK.kruttverket, WHITE, 0.1);
const BRICK_DEEP = mix(BRICK.kruttverket, INK, 0.12);
const ARCH_BRICK = BRICK.kruttverketChimney;
const IRON = METAL.castIron;
const FIGURE = mix(INK, BRICK.kruttverketWindow, 0.4);

/** Brick in courses three pixels high, the joints offset course by course, a brick here and there a shade off. */
function brick(x: number, y: number, w: number, h: number) {
  R(x, y, w, h, BRICK.kruttverket);
  for (let yy = y, k = 0; yy < y + h; yy += 3, k++) {
    R(x, yy + 2, w, 1, BRICK_JOINT);
    for (let xx = x + (k % 2) * 4; xx < x + w; xx += 8) {
      R(xx, yy, 1, 2, BRICK_JOINT);
      const n = (xx * 7 + yy * 13) % 11;
      if (n === 0 || n === 6) R(xx + 1, yy, Math.min(7, x + w - xx - 1), 2, n === 0 ? BRICK_PALE : BRICK_DEEP);
    }
  }
}

/** How far row dy of a segmental arch `a` rows high is drawn in from each side of a window w wide. */
const archIn = (w: number, a: number, dy: number) => (dy >= a ? 0 : Math.round(w / 2 - (w / 2) * Math.sqrt(1 - ((a - dy) / (a + 1)) ** 2)));
/** An arched shape, filled. */
function arched(x: number, y: number, w: number, h: number, a: number, color: string) {
  for (let dy = 0; dy < Math.min(a, h); dy++) {
    const i = archIn(w, a, dy);
    R(x + i, y + dy, w - 2 * i, 1, color);
  }
  if (h > a) R(x, y + a, w, h - a, color);
}

/** True where the drift's snow lies in front of world (x, y): a window's light must not shine through it. */
function underDrift(x: number, y: number) {
  const [, [x0, y0], [x1, y1]] = DRIFT.points;
  return x >= x0 && x < x1 && y >= y0 + ((x - x0) / (x1 - x0)) * (y1 - y0) - 1;
}

/**
 * An arched iron window in the brick: a band of bricks on end over it, the frame and its bars in
 * iron, a stone sill with snow lying on it. After dark its panes light up (as `kind`, `glow` times
 * over) around the bars and around whatever stands in the room (`inside`, rectangles drawn dark
 * against the light), and not where the drift is in front of them.
 */
function archWindow(x: number, y: number, w: number, h: number, a: number, bar: (dx: number, dy: number) => boolean, kind: LightKind, glow: number, inside: [number, number, number, number][] = []) {
  arched(x - 2, y - 3, w + 4, a + 5, a + 1, ARCH_BRICK);
  for (let dx = 1; dx < w + 3; dx += 3) {
    let r = 0;
    while (r < a + 1 && (dx < archIn(w + 4, a + 1, r) || dx >= w + 4 - archIn(w + 4, a + 1, r))) r++;
    R(x - 2 + dx, y - 3 + r, 1, 2, BRICK_JOINT);
  }
  arched(x, y, w, h, a, IRON);
  arched(x + 1, y + 1, w - 2, h - 2, a, GLASS.farWindow);
  const solid = (dx: number, dy: number) => bar(dx, dy) || underDrift(x + dx, y + dy) || inside.some(([fx, fy, fw, fh]) => dx >= fx && dx < fx + fw && dy >= fy && dy < fy + fh);
  for (let dy = 1; dy < h - 1; dy++) {
    const i = Math.max(1, archIn(w - 2, a, dy - 1) + 1);
    let from = -1;
    for (let dx = i; dx <= w - i; dx++) {
      const open = dx < w - i && !solid(dx, dy);
      if (dx < w - i && bar(dx, dy)) R(x + dx, y + dy, 1, 1, IRON);
      if (open && from < 0) from = dx;
      else if (!open && from >= 0) {
        for (let k = 0; k < glow; k++) light(x + from, y + dy, dx - from, 1, kind);
        from = -1;
      }
    }
  }
  for (const [fx, fy, fw, fh] of inside) R(x + fx, y + fy, fw, fh, FIGURE);
  // The sill, and the snow lying on it, banked a little at the frame's ends.
  R(x - 2, y + h, w + 4, 2, MASONRY.lintel);
  R(x - 2, y + h + 1, w + 4, 1, mix(MASONRY.lintel, INK, 0.3));
  R(x - 2, y + h - 1, w + 4, 1, SNOW.lying);
  R(x - 2, y + h - 2, 2, 1, SNOW.lying);
  R(x + w, y + h - 2, 2, 1, SNOW.lying);
}

/** The hall's windows: a fanlight in the arch, a transom, a mullion down the middle, a bar low down. */
const hallBar = (dx: number, dy: number) => dy === 7 || dy === 29 || dx === 12 || (dy < 7 && (dx === 6 || dx === 18));
/** The café's: a transom, two mullions. */
const cafeBar = (dx: number, dy: number) => dy === 8 || dx === 10 || dx === 21;
/** What stands in the hall's windows against its light: a lamp hanging, a curtain, someone looking out. The first window's are the paper cranes, drawn over the night (see `cranes`). */
const HALL_INSIDE: [number, number, number, number][][] = [
  [],
  [[6, 8, 1, 5], [4, 13, 5, 2], [5, 15, 3, 1]],
  [[1, 8, 3, 21], [1, 30, 2, 5]],
  [],
  [[16, 20, 3, 3], [15, 23, 5, 6], [14, 30, 7, 5]],
  [[21, 8, 3, 21], [22, 30, 2, 5], [5, 8, 1, 4], [3, 12, 5, 2]]
];
/** People at the café's tables, and a plant, as they stand against the light in each window. */
const CAFE_INSIDE: [number, number, number, number][][] = [
  [[3, 15, 3, 3], [2, 18, 5, 7], [9, 20, 8, 1], [12, 21, 1, 4], [14, 18, 2, 2]],
  [[4, 14, 3, 3], [3, 17, 5, 8], [10, 21, 9, 1], [14, 22, 1, 3], [20, 15, 3, 3], [19, 18, 5, 7]],
  [[24, 19, 4, 6], [23, 15, 2, 4], [26, 14, 2, 5], [25, 17, 1, 2], [5, 16, 3, 3], [4, 19, 5, 6]],
  [[12, 15, 3, 3], [11, 18, 5, 7], [17, 20, 8, 1], [21, 21, 1, 4]],
  [[3, 15, 3, 3], [2, 18, 5, 7], [26, 16, 3, 3], [25, 19, 5, 6], [9, 21, 14, 1]]
];

function kruttverket(t: number) {
  const { x0, x1, eave, belt, plinth, bay } = KRUTT;
  if (x1 + 8 < view.camX || x0 - 8 > view.camX + view.w) return;
  const g = S * TILE;
  // The roof, hipped, under snow; bare around the chimney's foot, where its warmth has taken the snow.
  for (let i = 0; i < 18; i++) R(x0 - 4 + i, eave - 1 - i, x1 - x0 + 8 - 2 * i, 1, i < 2 ? ROOF.factory : i % 6 === 4 ? SNOW.shade : SNOW.lying);
  const cx = x1 - 70;
  R(cx - 2, eave - 10, 16, 2, ROOF.factory);
  R(cx - 4, eave - 8, 20, 3, ROOF.factory);
  R(cx - 6, eave - 5, 24, 2, mix(ROOF.factory, SNOW.lying, 0.4));
  // The chimney, standing up out of the roof: brick, a corbelled cap with snow on it, smoke.
  brick(cx, eave - 36, 12, 30);
  R(cx - 2, eave - 40, 16, 4, ARCH_BRICK);
  R(cx - 1, eave - 36, 14, 1, BRICK_JOINT);
  R(cx - 2, eave - 42, 16, 2, SNOW.lying);
  R(cx + 11, eave - 36, 1, 30, BRICK_DEEP);
  const tt = view.reduced ? 0 : t;
  for (let i = 0; i < 5; i++) {
    const k = ((tt * 0.5 + i * 19) % 60) / 60;
    R(cx + 3 + Math.round(Math.sin(tt * 0.03 + i * 1.3) * 3 + k * 8), eave - 45 - k * 36, 4 + Math.round(k * 3), 3, `rgba(220, 224, 232, ${(0.4 * (1 - k)).toFixed(2)})`);
  }
  // The walls: brick in courses; a stone plinth; the cornice under the eaves on a row of corbels.
  brick(x0, eave, x1 - x0, plinth - eave);
  R(x0 - 2, eave, x1 - x0 + 4, 2, ARCH_BRICK);
  for (let x = x0 + 2; x < x1 - 4; x += 6) R(x, eave + 2, 4, 2, BRICK_DEEP);
  R(x0, plinth, x1 - x0, g - plinth, MASONRY.lintel);
  for (let x = x0 + 5; x < x1; x += 11) R(x, plinth + 1, 1, g - plinth - 1, MASONRY.gatePostLine);
  R(x0, plinth, x1 - x0, 1, MASONRY.worn);
  // The band between the floors, snow along its top.
  R(x0 - 1, belt, x1 - x0 + 2, 3, MASONRY.lintel);
  R(x0 - 1, belt + 2, x1 - x0 + 2, 1, mix(MASONRY.lintel, INK, 0.3));
  R(x0 - 1, belt - 1, x1 - x0 + 2, 1, SNOW.lying);
  // Pilasters between the bays: a strip of the brick standing forward, its shadow on the right.
  for (let i = 0; i <= 6; i++) {
    const px = Math.min(x1 - 4, x0 + i * bay);
    R(px, eave + 4, 4, plinth - eave - 4, mix(BRICK.kruttverket, WHITE, 0.06));
    for (let y = eave + 6; y < plinth; y += 3) R(px, y, 4, 1, BRICK_JOINT);
    R(px + 4, eave + 4, 1, plinth - eave - 4, BRICK_DEEP);
  }
  // The hall upstairs: a window in each bay, lit warm and low.
  for (let i = 0; i < 6; i++) archWindow(hallX(i), HALL.y, HALL.w, HALL.h, 4, hallBar, "soft", 2, HALL_INSIDE[i]);
  // The café: lit, people at the tables; the door, its lamp, and the cup hung out over the street.
  for (let i = 0; i < 6; i++) {
    if (i === 2) continue;
    archWindow(x0 + i * bay + 12, CAFE.y, CAFE.w, CAFE.h, 3, cafeBar, "window", 1, CAFE_INSIDE[i < 2 ? i : i - 1]);
  }
  const d = CAFE.door;
  arched(d - 3, g - 33, 20, 33, 3, ARCH_BRICK);
  arched(d - 1, g - 31, 16, 31, 3, IRON);
  arched(d, g - 30, 14, 5, 3, GLASS.farWindow);
  for (let dy = 0; dy < 5; dy++) light(d + archIn(14, 3, dy), g - 30 + dy, 14 - 2 * archIn(14, 3, dy), 1);
  R(d, g - 25, 14, 25, P.woodDark);
  R(d + 1, g - 24, 5, 22, mix(P.woodDark, P.wood, 0.5));
  R(d + 8, g - 24, 5, 22, mix(P.woodDark, P.wood, 0.5));
  R(d + 1, g - 14, 5, 1, P.woodDark);
  R(d + 8, g - 14, 5, 1, P.woodDark);
  R(d + 6, g - 16, 1, 2, METAL.brass);
  R(d + 7, g - 16, 1, 2, METAL.brass);
  R(d - 3, g - 2, 20, 2, MASONRY.worn);
  R(d + 5, g - 40, 4, 2, METAL.lampPost);
  R(d + 4, g - 38, 6, 2, METAL.lampHat);
  R(d + 5, g - 36, 4, 2, LAMP);
  light(d + 5, g - 36, 4, 2, "lamp");
  // The cup: a little board on an iron arm, a white cup steaming on it.
  const bx = d + 21;
  R(d + 17, g - 42, 13, 1, IRON);
  R(bx, g - 41, 1, 2, IRON);
  R(bx + 6, g - 41, 1, 2, IRON);
  R(bx - 1, g - 39, 9, 9, P.boardEdge);
  R(bx, g - 38, 7, 7, P.board);
  R(bx + 1, g - 35, 4, 3, PAINT.trim);
  R(bx + 5, g - 34, 1, 1, PAINT.trim);
  R(bx + 1, g - 32, 5, 1, PAINT.trim);
  R(bx + 2, g - 37, 1, 1, mix(PAINT.trim, P.board, 0.4));
  R(bx + 3, g - 38, 1, 1, mix(PAINT.trim, P.board, 0.4));
  light(bx, g - 38, 7, 7, "soft");
  // The corners.
  R(x0, eave + 2, 1, plinth - eave - 2, BRICK_DEEP);
  R(x1 - 1, eave + 2, 1, plinth - eave - 2, BRICK_DEEP);
}

/** The paper cranes on threads in the upstairs window: four threads, seven cranes, in three pale colours. Each thread is where it hangs (across the window), whether its cranes face left, and how far down each one hangs. */
const CRANE_THREADS: { dx: number; flip: boolean; at: number[] }[] = [
  { dx: 5, flip: false, at: [9, 19] },
  { dx: 7, flip: true, at: [14, 24] },
  { dx: 17, flip: false, at: [10, 21] },
  { dx: 19, flip: true, at: [15] }
];
/** A paper crane, as it hangs: the neck and its bent head, the wing up (its far side in shade), the tail. W wing, F the wing's far side, B the body. */
const CRANE = ["....W...", "BB..WF..", ".B.WWF.B", "..BWWFB.", "...BBB.."];
const CRANE_PAPER = [mix(WINTER.sheet, LAMP, 0.25), mix(WINTER.sheet, WINTER.stained, 0.22), mix(WINTER.sheet, WINTER.sock, 0.26)];
const CRANE_THREAD = mix(LAMP, INK, 0.36);

/** The paper cranes on threads in the upstairs window, drawn over the night as the Pi is, so they keep their paper's colours in the lit window; each thread sways a pixel on the level's clock. */
function cranes(t: number) {
  const sways = CRANE_THREADS.map((_th, k) => (view.reduced ? 0 : Math.round(Math.sin(t * 0.045 + k * 2.3))));
  // Kept, one piece for each way the threads hang (order 32: drawn a pixel at a time they were about 180 rectangles a frame), and
  // copied only while the window is on the screen.
  kept(`cranes ${sways.join()}`, hallX(0), HALL.y, HALL.w, 30, () => cranesAt(sways));
}
function cranesAt(sways: number[]) {
  const x = hallX(0);
  const y = HALL.y;
  const inGlass = (dx: number, dy: number) => dx > 0 && dx < HALL.w - 1 && dy > 7 && dy < 29 && !hallBar(dx, dy);
  let n = 0;
  CRANE_THREADS.forEach((th, k) => {
    const s = sways[k];
    const last = th.at[th.at.length - 1];
    for (let dy = 8; dy < last; dy++) {
      const dx = th.dx + (dy < 10 ? 0 : s);
      if (inGlass(dx, dy)) R(x + dx, y + dy, 1, 1, CRANE_THREAD);
    }
    for (const top of th.at) {
      const paper = CRANE_PAPER[n++ % CRANE_PAPER.length];
      const colors: Record<string, string> = { W: paper, F: mix(paper, INK, 0.2), B: mix(paper, INK, 0.07) };
      const left = th.dx + s - (th.flip ? 3 : 4);
      CRANE.forEach((row, ry) => {
        for (let rx = 0; rx < row.length; rx++) {
          const ch = row[th.flip ? row.length - 1 - rx : rx];
          if (ch === ".") continue;
          if (inGlass(left + rx, top + ry)) R(x + left + rx, y + top + ry, 1, 1, colors[ch]);
        }
      });
    }
  });
}

// --- Kværnertoppen: the place's name, on a blue plate on two posts past the yellow house ---------------------
/** Capitals three pixels wide (Æ five, N four), five high: only the ones the plate needs. */
const GLYPHS: Record<string, string[]> = {
  K: ["101", "101", "110", "101", "101"],
  V: ["101", "101", "101", "101", "010"],
  Æ: ["01111", "10100", "11110", "10100", "10111"],
  R: ["110", "101", "110", "101", "101"],
  N: ["1001", "1101", "1011", "1001", "1001"],
  E: ["111", "100", "110", "100", "111"],
  T: ["111", "010", "010", "010", "010"],
  O: ["010", "101", "101", "101", "010"],
  P: ["110", "101", "110", "100", "100"]
};
const PLATE_TEXT = "KVÆRNERTOPPEN";
const textWidth = (s: string) => [...s].reduce((w, ch) => w + GLYPHS[ch][0].length + 1, -1);

/** Letters from GLYPHS, their top left at (x, y); after dark they shine back the street's light, as a sign's white paint does. */
function letters(s: string, x: number, y: number, color: string) {
  for (const ch of s) {
    const g = GLYPHS[ch];
    g.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] !== "1") continue;
        let len = 1;
        while (row[rx + len] === "1") len++;
        R(x + rx, y + ry, len, 1, color);
        light(x + rx, y + ry, len, 1, "soft");
        rx += len - 1;
      }
    });
    x += g[0].length + 1;
  }
}

/** The plate: Oslo's blue, a white rule round it, the name in white, snow on its top; on two posts, between the yellow house and the end of the street. */
function streetSign() {
  const g = S * TILE;
  const w = textWidth(PLATE_TEXT) + 10;
  const px = YELLOW.x + YELLOW.w + 8;
  const py = g - 34;
  for (const x of [px + 6, px + w - 8]) {
    R(x, py + 13, 2, g - py - 13, METAL.lampPost);
    R(x - 1, g - 2, 4, 2, METAL.lampPost);
  }
  R(px, py, w, 13, TRAM.skirt);
  R(px + 1, py + 1, w - 2, 11, TRAM.body);
  R(px + 2, py + 2, w - 4, 9, PAINT.trim);
  R(px + 3, py + 3, w - 6, 7, TRAM.body);
  light(px + 2, py + 2, w - 4, 1, "soft");
  light(px + 2, py + 10, w - 4, 1, "soft");
  light(px + 2, py + 3, 1, 7, "soft");
  light(px + w - 3, py + 3, 1, 7, "soft");
  letters(PLATE_TEXT, px + 5, py + 4, PAINT.trim);
  R(px, py - 1, w, 1, SNOW.lying);
}

/** The lane behind the church: a stone wall along it, two lamps, the gravestones' snow. */
function lane() {
  const g = S * TILE;
  for (let x = 79 * TILE; x < 112 * TILE; x++) {
    R(x, g - 24, 1, 24, (Math.floor(x / 9) + Math.floor((x * 7) / 13)) % 4 ? MASONRY.lintel : MASONRY.gatePostLine);
    if (x % 9 === 0) R(x, g - 24, 1, 24, MASONRY.edge);
  }
  R(79 * TILE, g - 26, 33 * TILE, 2, SNOW.lying);
  // The old town's cast-iron lanterns, lit (order 28).
  for (const x of LANE_LAMPS) lamp("old", x, g, 36, true);
}

/** The plough's street: the house with the terrace, the washing line by the bank, the tram's slots, and the yellow house. */
function street(v: View, p: Plough | null) {
  const g = S * TILE;
  // The house he waits on: red, its terrace railing, a lit window.
  const hx = 168 * TILE;
  plankWall(hx, TERRACE.top, 6 * TILE, PAINT.red, PAINT.redLine, g);
  R(hx + 20, g - 30, 14, 14, PAINT.trim);
  R(hx + 21, g - 29, 12, 12, GLASS.farWindow);
  light(hx + 21, g - 29, 12, 12);
  railing("bars", hx, TERRACE.right, TERRACE.top - 10, 10, 24);
  // Its upper floor, set back, and the roof.
  plankWall(hx + 8, TERRACE.top - 40, 6 * TILE - 16, PAINT.red, PAINT.redLine, TERRACE.top);
  gable(hx + 2, TERRACE.top - 40, 6 * TILE - 4, 18, SNOW.lying);
  light(hx + 30, TERRACE.top - 30, 10, 10);
  // The washing line: two poles, the line, the washing; down in the snow once the plough has had its pole.
  const l = PLOUGH_DEF.line;
  if (!p || lineHolds(p)) {
    for (const x of [l.x0, l.x1 - 2]) post(CAST, x, l.y - 6, g, 2);
    const sag = p && v.t - p.lineAt < 10 && !view.reduced ? 4 : 1;
    for (let x = l.x0; x < l.x1; x++) R(x, l.y - 5 + Math.round(sag * Math.sin(((x - l.x0) / (l.x1 - l.x0)) * Math.PI)), 1, 1, METAL.wire);
    washing(l.x0 + 6, l.y - 4, v.t);
  } else {
    R(l.x0, g - 4, 2, 4, METAL.lampPost);
    for (let k = 0; k < 20; k++) R(l.x0 + 2 + k, g - 4 - Math.floor(k / 3), 1, 1, METAL.lampPost);
    R(l.x0 + 10, g - 3, 6, 3, SHIRT);
    R(l.x0 + 20, g - 3, 8, 3, WINTER.sheet);
  }
  // The tram's slots in the street: dark, with rails going down.
  for (const [c, n] of [[156, 3], [207, 2]]) {
    R(c * TILE, g, n * TILE, 2 * TILE, mix(INK, GROUND.cobbleFill, 0.3));
    for (let k = 0; k < n * TILE; k += 5) R(c * TILE + k, g + 6 + (k % 3), 3, 1, METAL.rail);
    R(c * TILE - 2, g, 2, 2 * TILE, GROUND.cobbleDot);
    R((c + n) * TILE, g, 2, 2 * TILE, GROUND.cobbleDot);
  }
  yellowHouse(v);
}

/**
 * The shirt on the line (order 33): the kit's washing red, lighter, 14.5 off the warning red (it was 7.7: ADR 0044,
 * `render/warning.test.ts`) and further off the red house's planks behind it (19.8; a darker red vanished against them).
 */
const SHIRT = mix(WINTER.shirt, WHITE, 0.2);
/** Washing on the line: a shirt, a sheet, two socks, swinging a little. */
function washing(x: number, y: number, t: number) {
  const s = view.reduced ? 0 : Math.round(Math.sin(t * 0.05));
  R(x + s, y, 9, 8, SHIRT);
  R(x - 2 + s, y, 3, 4, SHIRT);
  R(x + 8 + s, y, 3, 4, SHIRT);
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
function yellowHouse(v: View) {
  const { x, w, top } = YELLOW;
  const g = S * TILE;
  plankWall(x, top, w, PAINT.ochre, PAINT.ochreLine, g);
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
    // The lamp over the door, always on in winter: its light on the yellow planks round the door and
    // under the windows, so the house reads yellow at night, not brown.
    const lx = d.x + d.w / 2;
    const ly = d.bottom - d.h - 9;
    R(lx - 3, ly - 1, 6, 2, METAL.lampPost);
    R(lx - 2, ly + 1, 4, 3, LAMP);
    light(lx - 2, ly + 1, 4, 3, "lamp");
    light(x + 2, ly - 6, w - 4, g - ly + 6, "pool");
    light(lx - 30, ly + 2, 60, g - ly - 2, "pool");
    for (const [wx, wy] of [[x + 10, top + 8], [x + w - 26, top + 8], [x + 10, top + 34]] as const) light(wx - 4, wy + 15, 24, 5, "pool");
  }
  // The Pi's window: warm inside, the board on the sill, its light.
  const pw = YELLOW.window;
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
  const pw = YELLOW.window;
  if (pw.x + pw.w + 8 < view.camX || pw.x - 8 > view.camX + view.w) return;
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

/** A snow bank (order 26): packed snow in layers, rounded at its ends, its shadow side blue. */
const BANK: Grain = { name: "nb-bank", kind: "snow", ramp: [mix(WINTER.bankShade, INK, 0.12), WINTER.bankShade, mix(WINTER.bank, WINTER.bankShade, 0.4), WINTER.bank, SNOW.lying], accent: { sparkle: WHITE } };
function bankTile(c: number, x: number, y: number, m: TileMap) {
  const r = Math.floor(y / TILE);
  textured(BANK, c, r, x, y, m, null, edgesAt(m, c, r, null) & ~(EDGE.UNDER | EDGE.FOOT));
}

/** The street (order 26, from the textured set): packed snow with sparkles on its top, the cobbles under it in courses. */
const GRAVESTONE: Grain = { name: "nb-grave", kind: "blocks", ramp: [MASONRY.churchWindow, MASONRY.churchTower, MASONRY.church, mix(MASONRY.church, SNOW.lying, 0.2)], h: 16, w: 16, kerb: [SNOW.lying, SNOW.lying, SNOW.shade], cols: [3, 12] };
const STREET: Grain = { name: "nb-street", kind: "earth", ramp: [mix(GROUND.cobbleFill, INK, 0.35), mix(GROUND.cobbleFill, INK, 0.15), GROUND.cobbleFill, GROUND.cobble], band: [SNOW.shade, mix(SNOW.shade, SNOW.lying, 0.5), SNOW.lying], top: "snow", under: "setts", accent: { sparkle: WHITE } };
function streetTile(c: number, r: number, x: number, y: number, m: TileMap) {
  textured(STREET, c, r, x, y, m, null);
  if (!m.isSolid(c, r - 1) && (c * 5) % 7 === 0) R(x + 3, y + 1, 7, 1, SNOW.shade);
}

// The plough's tones (order 24; way 3, ADR 0045): its orange from a deep shade under the chassis to a lit top edge, the
// same darkened where it stands parked under its snow, the cab's glass with a reflection across it, the tyres' tread,
// the blade's yellow lit along its upper edge where it catches the light. Every tell (the blade raised in violet, the
// beacons, the exhaust, the snow thrown up) is where it was.
const ORANGE = [mix(WINTER.ploughDark, INK, 0.25), WINTER.ploughDark, WINTER.plough, WINTER.ploughLight, mix(WINTER.ploughLight, WHITE, 0.3)];
const PARKED = ORANGE.map((c) => mix(c, INK, 0.45));
const GLASS_TONES = [WINTER.cab, mix(WINTER.cab, WHITE, 0.12), mix(WINTER.cab, WHITE, 0.3)];
const SNOW_TONES = [SNOW.shade, SNOW.lying, mix(SNOW.lying, WHITE, 0.4)];
/** Its stage lights under the glamour (order 27): the glamour's neons, never the "now" violet its tell is in. */
const STAGE = [ENEMY.hotPink, ENEMY.lime, ENEMY.magenta, ENEMY.white];

/** The plough: orange, its cab high and dark-windowed, beacons on the roof, the blade in front; snow thrown up as it charges; reeling when hit; its beacon out when beaten. */
function ploughBody(p: Plough, v: View) {
  const x = Math.round(p.x);
  const g = p.def.floor;
  const f = p.dir;
  const age = v.t - p.since;
  const at = (dx: number) => (f > 0 ? x + dx : x - dx);
  const span = (dx0: number, dx1: number, y: number, h: number, c: string) => R(Math.min(at(dx0), at(dx1)), y, Math.abs(dx1 - dx0), h, c);
  /**
   * A panel from dx0 to dx1 (its own frame), `h` rows from y, in a ramp: its top row lit, its bottom rows shaded, its
   * left edge on the screen lit and its right edge shaded (the light comes from the top left whichever way it faces).
   */
  const panel = (dx0: number, dx1: number, y: number, h: number, ramp: readonly string[], base = 2) => {
    const x0 = Math.min(at(dx0), at(dx1));
    const w = Math.abs(dx1 - dx0);
    for (let k = 0; k < h; k++) {
      const tone = Math.max(0, Math.min(ramp.length - 1, base + (k === 0 ? 1 : k >= h - 2 && h > 4 ? -1 : 0)));
      R(x0, y + k, w, 1, ramp[tone]);
      if (w > 3 && k > 0) {
        R(x0, y + k, 1, 1, ramp[Math.min(ramp.length - 1, tone + 1)]);
        R(x0 + w - 1, y + k, 1, 1, ramp[Math.max(0, tone - 1)]);
      }
    }
  };
  /** A wheel: the tyre with its tread round the rim, the hub lit at its top left, a nut. */
  const wheel = (cx: number, cy: number, r: number, hub: boolean) => {
    wdisc(cx, cy, r, WINTER.tyre);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + (hub ? (((Math.floor((f > 0 ? p.x : -p.x) / 3) % 4) + 4) % 4) * 0.4 : 0);
      R(Math.round(cx + Math.cos(a) * (r - 0.5)), Math.round(cy + Math.sin(a) * (r - 0.5)), 1, 1, mix(WINTER.tyre, WHITE, 0.18));
    }
    if (!hub) return;
    wdisc(cx, cy, 3, P.iron);
    R(cx - 2, cy - 2, 2, 1, mix(P.iron, WHITE, 0.35));
    R(cx - 2, cy - 1, 1, 1, mix(P.iron, WHITE, 0.35));
  };
  const shake = (p.phase === "windup" || p.phase === "stuck") && !view.reduced ? (v.t % 4 < 2 ? 1 : 0) : 0;
  const y0 = g - PLOUGH.h + shake;
  if (p.phase === "parked" && p.hits === 0) {
    // Parked, dark, snow on it, its glass dull.
    panel(-32, 32, y0 + 22, 22, PARKED);
    panel(-32, 0, y0 + 2, 22, PARKED);
    span(-28, -4, y0 + 5, 12, mix(WINTER.cab, INK, 0.3));
    panel(-32, 0, y0, 3, SNOW_TONES, 1);
    panel(0, 32, y0 + 20, 3, SNOW_TONES, 1);
    panel(32, 40, g - 18, 18, [WINTER.bladeDark, mix(WINTER.blade, INK, 0.5), mix(WINTER.blade, INK, 0.35)], 1);
    for (const wx of [-22, 18]) wheel(at(wx), g - 6, 6, false);
    // Parked, its engine ticks over: a wisp from the stack every other second (order 23; none with reduced motion, order 30).
    if (!view.reduced && Math.floor(v.t / 60) % 2) plain(() => R(at(-34) - 1, y0 - 4, 3, 2, "rgba(70, 66, 62, 0.35)"));
    return;
  }
  const beaten = p.phase === "beaten";
  // The body: the cab at the back, high; the bonnet in front, lower; the chassis under both.
  panel(-32, 0, y0, 30, ORANGE);
  panel(-32, 0, y0, 2, ORANGE, 3);
  // The cab's glass, a reflection across it from its top left; the door's seam and handle under it.
  span(-28, -4, y0 + 5, 12, WINTER.cab);
  span(-28, -4, y0 + 5, 1, GLASS_TONES[1]);
  for (let k = 0; k < 6; k++) span(-26 + k * 2, -24 + k * 2, y0 + 6 + k, 1, GLASS_TONES[k < 2 ? 2 : 1]);
  span(-26, -20, y0 + 6, 2, GLASS_TONES[2]);
  span(-29, -28, y0 + 18, 1, ORANGE[1]);
  span(-20, -19, y0 + 18, 10, ORANGE[1]);
  span(-17, -14, y0 + 21, 1, ORANGE[0]);
  panel(-32, 32, y0 + 30, 14, ORANGE);
  panel(0, 32, y0 + 22, 8, ORANGE, 2);
  span(0, 32, y0 + 22, 1, ORANGE[3]);
  span(0, 32, y0 + 22, 1, WINTER.ploughLight);
  // The grille at the bonnet's front.
  for (let k = 0; k < 3; k++) span(26, 31, y0 + 24 + k * 2, 1, ORANGE[0]);
  span(-32, 32, y0 + 42, 2, WINTER.ploughDark);
  for (let k = -28; k < 30; k += 10) {
    span(k, k + 5, y0 + 33, 2, WINTER.ploughDark);
    span(k, k + 5, y0 + 33, 1, ORANGE[0]);
  }
  // The wheels, big, with chains; they turn as it goes, a nut on each going round in four frames by the distance it
  // covers (order 23).
  const roll = ((Math.floor((f > 0 ? p.x : -p.x) / 3) % 4) + 4) % 4;
  const [nx, ny] = [[0, -5], [4, -1], [0, 3], [-4, -1]][roll];
  for (const wx of [-22, 18]) {
    wheel(at(wx), g - 7, 7, true);
    R(at(wx) - 1 + f * nx, g - 8 + ny, 2, 2, P.iron);
  }
  // The blade: yellow, black stripes, angled out in front, its upper edge catching the light; raised off the snow
  // while it revs, a sign that holds still (for reduced motion too).
  const bx = at(32);
  const raised = p.phase === "windup" ? 5 : 0;
  for (let k = 0; k < 20; k++) {
    const yy = g - 20 + k - raised;
    const out = Math.round(k * 0.4) + 2;
    const stripe = ((k + Math.floor((bx + k) / 4)) >> 2) % 2;
    // Raised while it revs, its tell: then in the bosses' "now" colour (order 18).
    const face = stripe ? (raised ? ROLES.now : WINTER.blade) : INK;
    R(f > 0 ? bx : bx - out - 4, yy, out + 4, 1, face);
    if (!raised && stripe) {
      // The lit edge along its front, the shade where it curls back under.
      R(f > 0 ? bx + out + 3 : bx - out - 4, yy, 1, 1, k < 10 ? mix(WINTER.blade, WHITE, 0.35) : WINTER.blade);
      R(f > 0 ? bx : bx - 1, yy, 1, 1, WINTER.bladeDark);
    }
  }
  if (!raised) R(f > 0 ? bx : bx - 6, g - 21, 6, 1, mix(WINTER.blade, WHITE, 0.35));
  // The beacons on the cab's roof: slow while it drives, fast while it revs before a charge, out when
  // beaten. With reduced motion they do not flash: one is lit while it drives, both (with their glow)
  // while it revs.
  const fast = p.phase === "windup";
  const beat = view.reduced ? 1 : Math.floor(v.t / (fast ? 4 : 12)) % 2;
  for (const [k, dx] of [[0, -28], [1, -10]] as const) {
    const hot = !beaten && ((fast && view.reduced) || (beat + k) % 2 === 0);
    span(dx, dx + 6, y0 - 4, 4, hot ? (fast ? ROLES.now : WINTER.beacon) : mix(WINTER.beacon, INK, 0.55));
    span(dx, dx + 6, y0 - 1, 1, mix(WINTER.beacon, INK, 0.7));
    if (hot) {
      if (!fast) span(dx + 1, dx + 3, y0 - 4, 1, WINTER.beaconHot);
      light(Math.min(at(dx), at(dx + 6)), y0 - 4, 6, 4, "lamp");
      if (fast) plain(() => span(dx - 4, dx + 10, y0 - 7, 2, "rgba(255, 154, 26, 0.45)"));
    }
  }
  // Its glam (order 27, ADR 0050): done up as a tour bus, a two-neon stripe along its side and a row of stage lights along
  // its bonnet, chasing (all on with reduced motion); gone when it is beaten, and it is its orange again.
  if (!beaten) {
    span(-32, 25, y0 + 25, 1, ENEMY.hotPink);
    span(-32, 25, y0 + 26, 1, ENEMY.lime);
    const chase = view.reduced ? -1 : Math.floor(v.t / 6) % 4;
    for (let k = 0; k < 6; k++) {
      const c = STAGE[k % STAGE.length];
      span(3 + k * 5, 6 + k * 5, y0 + 19, 1, INK);
      span(4 + k * 5, 6 + k * 5, y0 + 20, 2, chase < 0 || (k + chase) % 4 !== 0 ? c : mix(c, INK, 0.5));
    }
  }
  // Headlights: lit, and a pool of light on the snow ahead of the blade.
  if (!beaten) {
    span(30, 33, y0 + 24, 3, LAMP);
    light(Math.min(at(30), at(33)), y0 + 24, 3, 3, "lamp");
    light(Math.min(at(36), at(76)), g - 4, 40, 4, "pool");
  }
  // Revving: exhaust from the stack behind the cab.
  if (fast && !view.reduced) plain(() => [0, 1, 2].forEach((k) => R(at(-34) - 2 + k * 2, y0 - 6 - k * 4 - (age % 6), 3, 3, `rgba(70, 66, 62, ${0.6 - k * 0.15})`)));
  // Charging, snow thrown up off the blade; stuck, snow heaped on it.
  if (p.phase === "charge" && !view.reduced) plain(() => [0, 1, 2, 3, 4, 5, 6, 7].forEach((k) => R(at(40 + ((k * 5 + v.t) % 12)), g - 22 - ((k * 7 + v.t * 2) % 18), 2, 2, SNOW.lying)));
  if (p.phase === "stuck") plain(() => span(34, 46, g - 16, 16, WINTER.bank));
  // Hit: it reels, white flashes on the cab.
  if (p.phase === "hit" && !view.reduced && Math.floor(age / 4) % 2 === 0) span(-30, -2, y0 + 1, 3, WHITE);
}

/**
 * The plough, outlined as everything that moves is (order 22): in the warning red while it can hurt (driving or
 * charging at him), in the calm pale while it cannot (parked, revving in place, stuck, turning, beaten).
 */
function plough(p: Plough, v: View) {
  outlined(() => ploughBody(p, v), undefined, p.phase === "drive" || p.phase === "charge" ? ENEMY.warning : ROLES.calm);
}

/** The flourish: the Pi's light turns green (drawn by the house), the windows of the street warm up, the northern lights flare green over the yellow house. */
function flourish(age: number) {
  if (view.reduced) return;
  const k = Math.min(1, age / 60);
  for (let i = 0; i < 5; i++) {
    const y = 4 * TILE + i * 6 + Math.round(Math.sin(age * 0.05 + i) * 4);
    R(YELLOW.x - 40, y, YELLOW.w + 80, 2, `rgba(125, 255, 170, ${(0.18 * k * (1 - i / 6)).toFixed(3)})`);
  }
  for (let i = 0; i < 8; i++) {
    const t = (age + i * 15) % 90;
    R(YELLOW.window.x + 10 + Math.round(Math.sin(i) * 20), YELLOW.window.y - t * 1.2, 1, 1, `rgba(125, 255, 138, ${(1 - t / 90).toFixed(2)})`);
  }
}

/**
 * A ginger cat on the prowl, drawn as frames (order 24; way 3, ADR 0045): 15 x 12, lit along its back with darker
 * stripes, a pale chest, muzzle and paws, a pink nose, ears pricked, its tail up behind with a curl at the tip; it walks
 * in four frames by the distance it covers, its tail swaying.
 */
const CAT_HEAD = ["O..O", "OOOO", "OOOO", "OOeO", "oaap", ".aa."];
const CAT_BODY = [
  "OOOOOOOOO",
  "oOooOooOo",
  "ooooooooo",
  "aoooooooa",
  ".aaoooaa."
];
const CAT_TAIL = { up: [".O", "Oo", "o.", "o.", "o.", "o."], curl: ["OO", ".o", ".o", "o.", "o.", "o."] };
const CAT_LEGS = [
  ["...o......o....", "..oo.......o...", ".aa.........aa."],
  ["...o.....o.....", "...o.....o.....", "...aa....aa...."],
  ["...o.....o.....", "....o...o......", ".....aaaa......"]
];
const catFrame = (name: string, legs: number, dy: number, tail: readonly string[]) =>
  frame(name, FOE_INK, [tail, 1, dy], [CAT_BODY, 2, 4 + dy], [CAT_HEAD, 11, dy], [CAT_LEGS[legs], 0, 9], mark(["lle"], 11, 3 + dy), mark(["N", "a", "N"], 10, 4 + dy));
const CAT: Looks = {
  w: 15,
  h: 12,
  idle: [catFrame("cat, still", 1, 0, CAT_TAIL.up), catFrame("cat, its tail curling", 1, 0, CAT_TAIL.curl)],
  move: [0, 1, 2, 1].map((k, i) => catFrame(`cat, walking ${i + 1}`, k, k === 1 ? 0 : 1, i % 2 ? CAT_TAIL.curl : CAT_TAIL.up))
};

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
  // Shown as Gamle Oslo since order 34 (ADR 0055; Vålerenga, a neighbourhood in it, from order 18): "rename it Gamle Oslo".
  name: "Gamle Oslo",
  landmark: { nb: "Vinternatt på østkanten", en: "A winter night on the east side" },
  place: { nb: "Fra trehusene på Vålerenga, over bakken", en: "From Vålerenga's wooden houses over the hill" },
  sky: "winter",
  // The air in the snow: after dusk the far layers fade into the night lightened by the snow's grey-white (order 22).
  air: "#e6ebef",
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
    // Its arrival (order 27): the story's line for it (`game/story.ts`).
    wake: { nb: `Brøytebilen våkner.\nDet siste mellom deg og en rolig kveld.\n${STORY.nb.boss.plough}`, en: `The snow plough wakes.\nThe last thing between you and a quiet evening.\n${STORY.en.boss.plough}` },
    hit: { nb: "Rett på taket.", en: "Right on the roof." },
    beaten: { nb: "Brøytebilen parkerer.\nGata er fri, for en gangs skyld.", en: "The plough parks.\nThe street is clear, for once." },
    // Shown over it when a round goes by with no hit, by round: stuck or turned, run into him, or ten seconds of nothing.
    miss1: { nb: "Den setter seg fast i brøytekanten ved klessnora.\nSnora kaster deg høyere enn et hopp.", en: "It sticks in the bank by the washing line.\nThe line throws you higher than a jump." },
    miss2: { nb: "Snora er nede.\nHopp fra terrassen, og rykk.", en: "The line is down.\nJump from the terrace, and dash." },
    miss3: { nb: "Nå holder den seg midt i gata.\nTrikken går over den.", en: "It keeps to the middle now.\nThe tram goes over it." }
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
      label: { nb: "Vålerenga", en: "Vålerenga" },
      lines: { nb: ["Takene er glatte. Klessnorene er ikke til å henge på.", "Varmen fra pipene går rett opp."], en: ["The roofs are slippery. The washing lines are not for hanging on.", "The warm air from the chimneys goes straight up."] }
    },
    {
      label: { nb: "Vålerenga kirke", en: "Vålerenga kirke" },
      lines: { nb: ["Tårnet er det siste du klatrer i kveld.", "Ovenfra ser du det gule huset på Kværnertoppen."], en: ["The tower is the last thing you climb tonight.", "From the top you can see the yellow house on Kværnertoppen."] }
    },
    {
      label: { nb: "Kruttverket", en: "Kruttverket" },
      lines: { nb: ["Her laget de krutt.", "Nå lager de kaffe. Det smeller sjeldnere."], en: ["They made gunpowder here.", "Now they make coffee. Fewer bangs."] }
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
      // The woodshed at the start, the houses, the chimneys, the church, the lane, Kruttverket behind
      // the drift, the drift, the street, and the street's name at the yellow house's corner.
      R(10 * TILE, (S - 2) * TILE, 2 * TILE, 2 * TILE, P.wood);
      for (let k = 10 * TILE + 3; k < 12 * TILE; k += 5) R(k, (S - 2) * TILE, 1, 2 * TILE, P.woodDark);
      R(10 * TILE - 2, (S - 2) * TILE - 3, 2 * TILE + 4, 3, SNOW.lying);
      houses();
      chimneys(v.t);
      lane();
      church();
      kruttverket(v.t);
      drift();
      street(v, v.boss as Plough | null);
      streetSign();
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
        // Two crates in the yard, snow on their lids (order 26: the crate's boards); the rest of the wall is the yard's.
        if (c === 167 || c === 174) textured(CRATE, c, r, x, y, m, { snow: true } as never, edgesAt(m, c, r, { snow: true } as never) & (EDGE.TOP | EDGE.SNOWY));
        return true;
      }
      if (t === "K") {
        // A gravestone behind the church (order 26): dressed stone, lit on its left, snow on its top, its cross cut in.
        textured(GRAVESTONE, c, r, x, y, m, null, EDGE.TOP | EDGE.LEFT | EDGE.RIGHT);
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
      if (e.def.look !== "cat") return drawLook(e, v.t);
      drawFoe(e, foeFrame(e, v.t, CAT), CAT.w, CAT.h);
      return true;
    },
    shot: (s, v) => drawLookShot(s, v.enemies[s.by]?.def.look),
    lights: (v) => lights(v),
    // After dusk the lane's dark behind the church, with the church's window, the lane's lanterns and the flag through it and his
    // headlamp, then what is drawn over it (the invaders' glow and red outline, the eyes, the paper cranes, the Pi and its light).
    // From order 15, when the night left `main.ts` for Nordmarka's file behind `Art.night`, nothing called it here; order 32 drew the
    // Pi and the cranes again, and order 33 the lane's dark, kept (`drawNightKept`: the same pixels as `drawNight`, at a few path
    // fills a frame where `drawNight` took about 1,580 rectangles). By day (the T key's sky) there is no dark, as on the live site.
    night: (v, him, boards, map) => {
      if (v.sky.phase !== "day") return drawNightKept(NABOLAGET, v, him, boards, map);
      cranes(v.t);
      pi(v);
    },
    overDark: (v) => {
      // In the lane's dark the invaders keep their glow and their red outline, as under Nordmarka's trees (orders 31, 32); and the
      // eyes shine. Only what is on the screen (the lane's three are drawn wherever he is).
      overTheDark(ctx(), (x) => dark(x, v) > 0 && seen(x - 32, x + 32));
      for (const e of v.enemies) if (e.alive && dark(e.x, v) > 0 && seen(e.x - 16, e.x + 16)) for (const [x, y] of eyes(e)) R(x, y, 1, 1, WINTER.catEye);
      cranes(v.t);
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
  // Nothing of it below the street: it rises out of its slot and goes down into the other. Its side (order 31) is one piece
  // from the props kit, held to above the street; its windows lit after dark as far as they show.
  const c = ctx();
  c.save();
  c.beginPath();
  c.rect(-9999, -9999, 29999, g - view.camY + 9999);
  c.clip();
  const panes = tramSide(x, y, TRAM_W, 52, 8, 12);
  c.restore();
  for (const p of panes) if (p.y + p.h <= g) light(p.x, p.y, p.w, p.h, "window");
  for (let dx = 0; dx < TRAM_W; dx++) {
    const wx = x + dx;
    const clip = g;
    const col = (yy: number, h: number, colour: string) => {
      const top = y + yy;
      const end = Math.min(top + h, clip);
      if (end > top) R(wx, top, 1, end - top, colour);
    };
    // The bogies, and their wheels on the rail.
    if (dx % 32 > 4 && dx % 32 < 12) {
      col(52, 9, mix(TRAM.skirt, INK, 0.4));
      col(61, 3, dx % 32 === 8 ? METAL.pipe : INK);
    }
  }
  R(x + 20, y - 8, 1, 8, METAL.wire);
  R(x + 16, y - 9, 9, 1, METAL.wire);
}
