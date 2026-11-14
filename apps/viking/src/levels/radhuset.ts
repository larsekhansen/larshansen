import { box, lit } from "@larshansen/pixelkit/backdrop";
import { carrierShown, orbitAngle, type CarrierDef, type Orbit, type Travel } from "@larshansen/pixelkit/carrier";
import { osloClock } from "@larshansen/pixelkit/oslo";
import { TILE } from "@larshansen/pixelkit/config";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, FACADE, GLASS, GROUND, INK, LAMP, MASONRY, METAL, PAINT, PALETTE, ROOF, SHIMMER, SNOW, WHITE } from "@larshansen/pixelkit/palette";
import { WOOD_LEDGE, lampPool, lampPost, pane, type LedgeLook } from "@larshansen/pixelkit/props";
import { timedPhase } from "@larshansen/pixelkit/timed";
import type { EnemyDef } from "../game/enemies";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { BellLedge, LevelDef, View } from "./types";

// Level 3, rune R: Rådhuset, the City Hall's two brick towers. Its idea is the bell on a beat, and
// it climbs: the camera follows him up.
//
// Teach: along the harbour front at Rådhusbrygga, three low bells over the promenade (a fall only
// lands him on it) up onto the ferry terminal's roof, where the brown cheese is; pigeons; a gull that
// throws chips, on its own. Practise: across the water on the island ferry's roof, over the square
// past the e-scooter, and three bells over the fountain's pool. Twist: the window-cleaner's lift up
// the west tower's face (moving ground, as at Langkaia) while a second gull throws, through the
// tower onto the middle roof, then the carillon: bells rising between the towers, a bell that swings
// back across on its rod, more bells, a gull among them. Set piece: the clock tower, ridden up on the
// tip of the clock's own gilded hand, which goes round fast up here, to the balcony, the parapet and
// rune R. The bracteate is on the lantern's roof.
//
//   Q  quay   X  brick   #  the square   =  stone ledges, the parapet   _  wooden ledges   ~  water
//   t T-banen   b  a bench   f  a flag   $  skilling   &  cheese

const COLS = 228;
const ROWS = 52;
/** The square's paving and the water line. */
const G = 48;
/** The middle building's roof, the passage through the west tower above it. */
const ROOF_ROW = 32;
/** The east tower's solid lower block ends here; above it the tower is drawn behind him. */
const BLOCK = 16;
/** Where the harbour comes in again, east of the clock tower's block. */
const EAST_BASIN = 209;
const b = mapBuilder(COLS, ROWS);

// --- The harbour front, the ferry's water, the square with its fountain --------------------------------
b.ground(0, 75, G, "Q");
b.fill(76, 95, G, G + 1, "~").ground(76, 95, G + 2);
b.ground(96, COLS - 1, G);
b.fill(121, 130, G, G + 1, "~").ground(121, 130, G + 2);
// East of the clock tower the square ends at the harbour: a fall from the tower is not free, it is a
// splash, a heart, and back at the flag by the clock.
b.fill(EAST_BASIN, COLS - 1, G, G + 1, "~").ground(EAST_BASIN, COLS - 1, G + 2);
// The ferry terminal's roof, up the three low bells; a deck with a bench a step up.
b.run(28, 34, G - 7, "_");
b.run(59, 61, G - 1, "_");

// --- The City Hall: the west tower with its passage, the middle building, the east tower's block --------
b.ground(161, 172, 14, "X");
b.fill(161, 172, ROOF_ROW - 2, ROOF_ROW - 1, ".");
b.ground(173, 196, ROOF_ROW, "X");
b.ground(197, 208, BLOCK, "X");
// The first ledge on the clock tower, by the last bell.
b.run(193, 196, BLOCK - 1, "=");
// Up the clock tower: the balcony over the clock, the parapet, the lantern's roof.
b.run(199, 206, 8, "=");
b.run(197, 208, 6, "=");
// The lantern on the parapet's corner: too tall to jump onto, so it stops him walking off the tower.
b.fill(206, 208, 3, 5, "N");

// Marks.
b.put(2, G - 1, "t").put(4, G - 1, "S");
b.put(60, G - 2, "b").put(70, G - 1, "i").put(73, G - 1, "f");
b.put(114, G - 1, "i").put(116, G - 1, "f").put(133, G - 1, "f").put(155, G - 1, "i");
b.put(175, ROOF_ROW - 1, "f").put(177, ROOF_ROW - 1, "i").put(180, ROOF_ROW - 1, "b");
b.put(195, BLOCK - 2, "f");
b.put(203, 4, "r").put(207, 1, "o").put(31, G - 8, "&");

// Skilling: up the low bells and along the terminal's roof, over the pigeons and past the thrower, the
// ferry's crossing, the fountain's bells, by the lift, up the carillon, round the clock, the parapet.
const COINS: [number, number][] = [
  [8, 46], [9, 45], [10, 45], [11, 46],
  [17, 44], [21, 43], [25, 41],
  [29, 40], [30, 40], [32, 40], [33, 40], [34, 40],
  [39, 45], [40, 44], [41, 45],
  [51, 46], [52, 45], [53, 46],
  [64, 47], [65, 47],
  [80, 44], [84, 44], [88, 44],
  [100, 46], [101, 45], [102, 44], [103, 45], [104, 46],
  [109, 46], [110, 45], [111, 46],
  [122, 45], [123, 44], [125, 44], [126, 44], [128, 45], [129, 46],
  [135, 46], [136, 45], [137, 46],
  [148, 47], [149, 47],
  [166, 31], [168, 31], [170, 31],
  [182, 29], [185, 28], [188, 26], [191, 25],
  [184, 23], [186, 23], [188, 23],
  [176, 21], [179, 20], [182, 19], [185, 17], [188, 16], [191, 14],
  [200, 9], [203, 7], [206, 9],
  // Over the bottom of the hand's round, a hop above the tower roof: the way back up after a miss.
  [202, 14], [203, 14],
  [199, 5], [201, 5], [205, 5],
  [206, 2]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

const P = PALETTE;
const WATER = G * TILE;
const SQUARE = WATER;

// --- Things that move ----------------------------------------------------------------------------------

/** The island ferry: its roof is the way over, and it crosses and comes back, easing in at each quay. */
export const FERRY: Travel = { kind: "travel", from: { x: 76 * TILE, y: WATER - 28 }, to: { x: 92 * TILE, y: WATER - 28 }, w: 4 * TILE, period: 720, offset: 570 };
/** The window-cleaner's lift up the west tower's face, from the square to the passage through the tower. */
export const LIFT = { kind: "lift" as const, x: 158 * TILE, top: ROOF_ROW * TILE, bottom: WATER, w: 3 * TILE, speed: 2, wait: 45 };
/** The bell that swings back across between the towers on its long rod: from the right, over the bells, to the left. */
export const SWING: Travel = { kind: "travel", from: { x: 194 * TILE, y: 24 * TILE }, to: { x: 179 * TILE, y: 24 * TILE }, w: 2 * TILE, period: 600, offset: -60 };
/** The clock's gilded hand, two tips going round fast: ridden up its left side and over the top. */
export const CLOCK = { cx: 202 * TILE + 8, cy: 12 * TILE + 8, r: 46, period: 480 };
export const HANDS: Orbit[] = [0, 0.5].map((turn) => ({ kind: "orbit", cx: CLOCK.cx, cy: CLOCK.cy, r: CLOCK.r, w: 2 * TILE, period: CLOCK.period, turn }));
const CARRIERS: CarrierDef[] = [FERRY, LIFT, SWING, ...HANDS];
const SWING_INDEX = 2;

/** A bell's beat: on for two seconds, a second's warning, gone for two; `k` steps it after the one before. */
const bellAt = (c: number, row: number, k: number, note: number): BellLedge => ({ x: c * TILE, y: Math.round(row * TILE), w: 2 * TILE, on: 120, warn: 60, off: 120, offset: -100 * k, note: note % 5 });
/** Three low bells over the promenade, up to the terminal's roof: nothing lost by a fall. */
export const LOW_BELLS = [bellAt(16, G - 2, 0, 0), bellAt(20, G - 3.5, 1, 1), bellAt(24, G - 5, 2, 2)];
/** Three over the fountain's pool. */
export const POOL_BELLS = [bellAt(121, G - 2, 0, 1), bellAt(124, G - 2.5, 1, 2), bellAt(127, G - 2, 2, 3)];
/** The carillon between the towers: four up from the middle roof, the swinging bell, five more up to the clock tower. */
export const CARILLON = [
  bellAt(182, ROOF_ROW - 2, 0, 0),
  bellAt(185, ROOF_ROW - 3.5, 1, 1),
  bellAt(188, ROOF_ROW - 5, 2, 2),
  bellAt(191, ROOF_ROW - 6.5, 3, 3),
  bellAt(176, 22.5, 0, 4),
  bellAt(179, 21, 1, 0),
  bellAt(182, 19.5, 2, 1),
  bellAt(185, 18, 3, 2),
  bellAt(188, 16.5, 4, 3),
  bellAt(191, 15, 5, 4)
];
export const BELLS: BellLedge[] = [...LOW_BELLS, ...POOL_BELLS, ...CARILLON];

// --- Enemies: pigeons, a gull that throws chips, the e-scooter, a second thrower by the lift, gulls -------
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "pigeon", c: 10, r: G - 1, range: 2 },
  { kind: "thrower", look: "gull", c: 40, r: G - 1, period: 180 },
  { kind: "walker", look: "pigeon", c: 52, r: G - 1, range: 2, dir: -1 },
  { kind: "flyer", look: "gull", c: 85, r: G - 5, range: 3, rise: 6, period: 170 },
  { kind: "walker", look: "scooter", c: 102, r: G - 1, range: 3, speed: 1, w: 14, h: 12 },
  { kind: "walker", look: "pigeon", c: 110, r: G - 1, range: 1 },
  { kind: "walker", look: "pigeon", c: 140, r: G - 1, range: 1 },
  { kind: "thrower", look: "gull", c: 146, r: G - 1, period: 200, offset: 60 },
  { kind: "flyer", look: "gull", c: 180, r: 27, range: 1, rise: 6, period: 160 }
];

// --- Art ------------------------------------------------------------------------------------------------

/** A ledge of brick or stone on the towers. */
const BRICK_LEDGE: LedgeLook = { body: MASONRY.lintel, top: MASONRY.worn, edge: mix(MASONRY.lintel, INK, 0.4), joint: BRICK.course };

/** The ferry: a white hull with a red band, a row of lit windows, the wheelhouse, its funnel; the roof he rides. */
function ferry(at: { x: number; y: number }) {
  const { x, y } = at;
  R(x - 16, y + 12, 96, 14, PAINT.ferryWhite);
  R(x - 14, y + 26, 92, 2, PAINT.ferryShade);
  R(x - 16, y + 18, 96, 2, PAINT.ferryRed);
  for (let i = 0; i < 6; i++) {
    R(x - 18 + i, y + 12 + i, 1, 14 - i, P.water);
    R(x + 79 - i, y + 12 + i, 1, 14 - i, P.water);
  }
  R(x + 2, y + 3, TILE * 4 - 4, 9, PAINT.ferryWhite);
  for (let wx = x + 6; wx < x + 58; wx += 8) {
    R(wx, y + 5, 5, 4, GLASS.pane);
    light(wx, y + 5, 5, 4);
  }
  R(x, y, TILE * 4, 3, PAINT.ferryShade);
  R(x, y, TILE * 4, 1, WHITE);
  for (let rx = x + 2; rx < x + 62; rx += 6) R(rx, y - 4, 1, 4, PAINT.ferryShade);
  R(x, y - 5, TILE * 4, 1, PAINT.ferryShade);
  R(x + 52, y - 12, 6, 8, PAINT.ferryRed);
  R(x + 52, y - 12, 6, 2, INK);
}

/** The window-cleaner's gondola: a steel cradle on two ropes from a davit on the tower top. */
function gondola(at: { x: number; y: number }) {
  const { x, y } = at;
  const top = 14 * TILE - 6;
  R(x + 6, top - 4, 3 * TILE + 2, 3, METAL.pipe);
  R(x + 3 * TILE + 6, top - 10, 3, 10, METAL.pipe);
  for (const rx of [x + 6, x + 3 * TILE - 7]) R(rx, top, 1, y - top - 8, METAL.chain);
  R(x, y, 3 * TILE, 4, METAL.pipe);
  R(x, y, 3 * TILE, 1, mix(METAL.pipe, WHITE, 0.35));
  R(x, y - 9, 3 * TILE, 1, METAL.rail);
  for (const px of [x, x + 3 * TILE - 1, x + 24]) R(px, y - 9, 1, 9, METAL.rail);
  R(x + 34, y - 5, 6, 5, PAINT.tbane);
  R(x + 34, y - 5, 6, 1, mix(PAINT.tbane, WHITE, 0.4));
}

/** A gold bell under its oak yoke (the yoke is what he stands on), swaying a pixel when he is on it. */
function bellShape(x: number, y: number, w: number, swayOn: boolean, t: number) {
  const cx = x + w / 2;
  const sway = swayOn && !view.reduced ? (Math.floor(t / 6) % 2 ? 1 : -1) : 0;
  R(x, y, w, 4, P.woodDark);
  R(x, y, w, 1, P.wood);
  R(x + 2, y + 4, 2, 2, METAL.chain);
  R(x + w - 4, y + 4, 2, 2, METAL.chain);
  const rows = [8, 10, 12, 12, 12, 14, 14, 16, 18, 20];
  rows.forEach((bw, k) => {
    const bx = cx - bw / 2 + sway;
    R(bx, y + 5 + k, bw, 1, k === 0 ? METAL.goldLight : METAL.gold);
    R(bx, y + 5 + k, 1, 1, METAL.goldLight);
    R(bx + bw - 2, y + 5 + k, 2, 1, METAL.goldDark);
  });
  R(cx - 10 + sway, y + 15, 20, 1, METAL.goldDark);
  R(cx - 1 + sway * 2, y + 16, 2, 3, METAL.keyhole);
}

/** A bell of the carillon on its beat: the rod it hangs from, the bell, the warning shimmer; gone, a faint outline waits. */
function bell(i: number, v: View) {
  const bl = BELLS[i];
  const phase = timedPhase(v.t, bl);
  const cx = bl.x + bl.w / 2;
  // The iron rod it hangs from, always there; over the promenade and the pool a gallows of iron.
  R(cx, bl.y - 40, 1, 40, METAL.chain);
  R(cx - 6, bl.y - 41, 13, 1, METAL.chain);
  if (phase === "off") {
    for (let x = bl.x; x < bl.x + bl.w; x += 3) R(x, bl.y, 1, 1, mix(METAL.gold, P.water, 0.5));
    return;
  }
  const on = Math.abs(v.him.x - cx) < bl.w / 2 + 5 && Math.abs(v.him.y + 7 - bl.y) < 2;
  bellShape(bl.x, bl.y, bl.w, on || v.flourish !== null, v.t);
  if (phase === "warn" && Math.floor(v.t / 8) % 2 === 0) {
    const x = bl.x - 2;
    const y = bl.y - 2;
    const w = bl.w + 4;
    const h = 22;
    R(x, y, w, 2, SHIMMER);
    R(x, y + h - 2, w, 2, SHIMMER);
    R(x, y, 2, h, SHIMMER);
    R(x + w - 2, y, 2, h, SHIMMER);
  }
}

/** The swinging bell: the same bell, its rod long, from a beam high over the middle roof. */
function swingingBell(at: { x: number; y: number }, v: View) {
  const pivot = { x: 186 * TILE + 8, y: 9 * TILE };
  const cx = at.x + TILE;
  // The rod from the beam to the bell, drawn as a line of chain links.
  const n = Math.max(Math.abs(cx - pivot.x), Math.abs(at.y - pivot.y));
  for (let k = 0; k < n; k += 3) R(Math.round(pivot.x + ((cx - pivot.x) * k) / n), Math.round(pivot.y + ((at.y - pivot.y) * k) / n), 1, 2, METAL.chain);
  R(pivot.x - 3, pivot.y - 2, 7, 3, P.woodDark);
  const on = Math.abs(v.him.x - cx) < TILE + 5 && Math.abs(v.him.y + 7 - at.y) < 2;
  bellShape(at.x, at.y, 2 * TILE, on, v.t);
}

/** The tip of the clock's hand: a small gilded step, and the hand back to the clock's middle. */
function handTip(i: number, at: { x: number; y: number }) {
  const tx = at.x + TILE;
  const n = Math.max(Math.abs(tx - CLOCK.cx), Math.abs(at.y + 2 - CLOCK.cy));
  for (let k = 0; k < n; k++) R(Math.round(CLOCK.cx + ((tx - CLOCK.cx) * k) / n), Math.round(CLOCK.cy + ((at.y + 2 - CLOCK.cy) * k) / n), 2, 2, i ? METAL.goldDark : METAL.gold);
  R(at.x, at.y, 2 * TILE, 4, METAL.gold);
  R(at.x, at.y, 2 * TILE, 1, METAL.goldLight);
  R(at.x, at.y + 3, 2 * TILE, 1, METAL.goldDark);
  R(at.x + 2, at.y + 4, 2 * TILE - 4, 1, METAL.goldDark);
}

/** Tall windows in the brick, in rows, lit after dark. */
function windows(c0: number, c1: number, r0: number, r1: number, every = 2) {
  for (let r = r0; r <= r1; r += 3)
    for (let c = c0; c <= c1; c += every) {
      const x = c * TILE + 5;
      const y = r * TILE + 3;
      R(x - 1, y - 1, 8, 13, mix(BRICK.red, WHITE, 0.25));
      R(x, y, 6, 11, GLASS.farWindow);
      R(x + 3, y, 1, 11, mix(BRICK.red, WHITE, 0.25));
      light(x, y, 3, 11);
      light(x + 4, y, 2, 11);
    }
}

/** The clock tower over its block: brick drawn behind him, in courses, up to the parapet. */
function upperTower() {
  const x0 = 197 * TILE;
  const x1 = 209 * TILE;
  for (let y = 6 * TILE; y < BLOCK * TILE; y++) {
    const course = Math.floor(y / 4);
    R(x0, y, x1 - x0, 1, y % 4 === 3 ? BRICK.course : mix(BRICK.red, INK, 0.08));
    for (let x = x0 + (course % 2) * 4; x < x1; x += 8) if (y % 4 !== 3) R(x, y, 1, 1, BRICK.course);
  }
  R(x0, 6 * TILE, 2, (BLOCK - 6) * TILE, mix(BRICK.red, WHITE, 0.2));
  R(x1 - 2, 6 * TILE, 2, (BLOCK - 6) * TILE, mix(BRICK.red, INK, 0.3));
}

/** The clock on the east tower: a big cream face rimmed in gold, hour marks, the hour hand at Oslo's time. */
function clock(v: View) {
  const { cx, cy } = CLOCK;
  const r = 30;
  for (let dy = -r - 3; dy <= r + 3; dy++) {
    const w = Math.floor(Math.sqrt((r + 3) * (r + 3) - dy * dy));
    R(cx - w, cy + dy, w * 2 + 1, 1, METAL.goldDark);
  }
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy));
    R(cx - w, cy + dy, w * 2 + 1, 1, PAINT.trim);
  }
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const big = h % 3 === 0;
    R(Math.round(cx + Math.sin(a) * (r - 4)) - (big ? 1 : 0), Math.round(cy - Math.cos(a) * (r - 4)) - (big ? 1 : 0), big ? 3 : 2, big ? 3 : 2, INK);
  }
  // The hour hand keeps Oslo's time; the long gilded hand is the one he rides, drawn with its tips.
  const c = osloClock(v.now);
  const turn = v.flourish !== null && !view.reduced ? v.flourish / 30 : (c.hour % 12) / 12;
  const a = turn * Math.PI * 2;
  for (let k = 0; k <= 16; k++) R(Math.round(cx + Math.sin(a) * k), Math.round(cy - Math.cos(a) * k), 2, 2, INK);
  R(cx - 2, cy - 2, 4, 4, METAL.gold);
}

/** The east tower's top: the parapet's merlons (the lantern on its corner is the map's), the balcony's railing. */
function towerTop() {
  const y = 6 * TILE;
  for (let x = 197 * TILE; x < 206 * TILE - 4; x += 8) {
    R(x, y - 5, 5, 5, BRICK.red);
    R(x, y - 5, 5, 1, mix(BRICK.red, WHITE, 0.3));
  }
  // The balcony's railing over the clock.
  R(199 * TILE, 8 * TILE - 8, 8 * TILE, 1, METAL.castIron);
  for (let x = 199 * TILE; x < 207 * TILE; x += 4) R(x, 8 * TILE - 8, 1, 8, METAL.castIron);
}

/** The lantern on the clock tower's corner, a tile at a time: white walls, its lit window, a copper roof. */
function lantern(c: number, r: number, x: number, y: number, snow: boolean) {
  R(x, y, TILE, TILE, PAINT.trim);
  // Plaster in courses, a pilaster at each corner, a cornice under the roof.
  for (let yy = y + 5; yy < y + TILE; yy += 6) R(x, yy, TILE, 1, mix(PAINT.trim, INK, 0.08));
  if (c === 206) R(x, y, 3, TILE, mix(PAINT.trim, INK, 0.12));
  if (c === 208) R(x + TILE - 3, y, 3, TILE, mix(PAINT.trim, INK, 0.25));
  if (r === 5) R(x, y + TILE - 3, TILE, 3, MASONRY.lintel);
  if (r === 3) {
    const wide = c === 206 || c === 208 ? 2 : 0;
    const left = c === 206 ? 2 : 0;
    R(x - left, y + 5, TILE + wide, 2, MASONRY.worn);
    R(x - left, y, TILE + wide, 4, snow ? SNOW.lying : METAL.copper);
    R(x - left, y, TILE + wide, 1, METAL.copperLight);
    R(x - left, y + 4, TILE + wide, 1, METAL.copperDark);
  }
  if (r === 4 && c === 207) {
    // Its window, lit: two tall panes under a round head.
    R(x - 6, y + 1, 28, 14, MASONRY.lintel);
    R(x - 4, y + 3, 10, 11, LAMP);
    R(x + 10, y + 3, 10, 11, LAMP);
    light(x - 4, y + 3, 24, 11, "soft");
  }
}

/** The passage through the west tower: dark, with a lamp on its wall. */
function passage() {
  R(161 * TILE, (ROOF_ROW - 2) * TILE, 12 * TILE, 2 * TILE, mix(BRICK.red, INK, 0.65));
  for (let x = 163 * TILE; x < 172 * TILE; x += 48) {
    R(x, (ROOF_ROW - 2) * TILE + 6, 3, 4, LAMP);
    light(x, (ROOF_ROW - 2) * TILE + 6, 3, 4, "soft");
  }
}

/** The ferry terminal at Rådhusbrygga: a low wooden building, its flat roof the map's ledge, a ticket window. */
function terminal() {
  const x = 28 * TILE;
  const top = (G - 7) * TILE + 5;
  R(x, top, 7 * TILE, WATER - top, PAINT.mint);
  for (let i = 3; i < 7 * TILE - 2; i += 4) R(x + i, top, 1, WATER - top, PAINT.mintLine);
  R(x, top, 2, WATER - top, PAINT.trim);
  R(x + 7 * TILE - 2, top, 2, WATER - top, PAINT.trim);
  pane(x + 12, top + 14, 14, 10);
  pane(x + 40, top + 14, 14, 10);
  R(x + 74, top + 24, 18, WATER - top - 24, mix(PAINT.mint, INK, 0.5));
  R(x + 72, top + 6, 26, 8, INK);
  for (let i = 0; i < 4; i++) R(x + 75 + i * 5, top + 9, 3, 2, PAINT.trim);
  light(x + 74, top + 7, 22, 6, "soft");
}

/** The fountain in the square's pool: a stone basin edge and a figure in green bronze on a plinth in the middle. */
function fountain(t: number) {
  const x0 = 121 * TILE;
  const x1 = 131 * TILE;
  R(x0 - 4, WATER - 4, 4, 4, MASONRY.lintel);
  R(x1, WATER - 4, 4, 4, MASONRY.lintel);
  const cx = 126 * TILE;
  R(cx - 6, WATER - 10, 12, 10, MASONRY.lintel);
  R(cx - 3, WATER - 28, 6, 18, METAL.copperDark);
  R(cx - 2, WATER - 33, 4, 5, METAL.copper);
  if (view.reduced) return;
  for (let i = 0; i < 6; i++) {
    const k = ((t * 0.6 + i * 8) % 24) / 24;
    R(cx - 1 + Math.round((i - 2.5) * k * 5), WATER - 34 - Math.round(Math.sin(k * Math.PI) * 10), 1, 2, P.foam);
  }
}

const LAMPS = [12, 46, 66, 100, 118, 140, 152].map((c) => c * TILE + 6);

/** Across the harbour, small: Aker Brygge's glass and brick, and the fortress on its hill the other way. */
function harbourSide(base: number) {
  const at = (wx: number) => layerX(wx, 0.4);
  const x = at(900);
  const blocks = [
    { dx: 0, w: 30, h: 40, c: BRICK.kruttverket },
    { dx: 34, w: 22, h: 52, c: FACADE.blocks[3] },
    { dx: 60, w: 26, h: 36, c: GLASS.palmHouse },
    { dx: 90, w: 30, h: 46, c: FACADE.blocks[1] }
  ];
  for (const k of blocks) {
    box(x + k.dx, base - k.h, k.w, k.h, k.c);
    box(x + k.dx, base - k.h, k.w, 2, mix(k.c, WHITE, 0.3));
    for (let y = base - k.h + 5; y < base - 5; y += 6)
      for (let wx = x + k.dx + 3; wx < x + k.dx + k.w - 3; wx += 5) {
        box(wx, y, 2, 3, mix(k.c, INK, 0.3));
        lit(wx, y, 2, 3);
      }
  }
}

/** The flourish: every bell of the carillon swings, the clock's hour hand spins round, pigeons go up off the parapet. */
function flourish(age: number) {
  if (view.reduced) return;
  for (let k = 0; k < 5; k++) {
    const a = age - k * 8;
    if (a < 0 || a > 120) continue;
    const x0 = (198 + k * 2) * TILE;
    const gx = Math.round(x0 + (k % 2 ? 1 : -1) * a * 0.6);
    const gy = Math.round(6 * TILE - 6 - a * 0.8);
    const wing = Math.floor(a / 5) % 2 ? 1 : -1;
    for (const [dx, dy] of [[0, 0], [-1, -wing], [1, -wing], [-2, -wing * 2], [2, -wing * 2]] as const) R(gx + dx, gy + dy, 1, 1, PALETTE.iron);
  }
}

export const RADHUSET: LevelDef = {
  id: "radhuset",
  rune: 2,
  name: "Rådhuset",
  landmark: { nb: "Klokkene mellom tårnene", en: "The bells between the towers" },
  place: { nb: "De to tårnene på Rådhusplassen", en: "The two towers on Rådhusplassen" },
  sky: "day",
  map: MAP,
  legend: { solid: "QX#N", oneWay: "=_", water: "~" },
  ramps: [],
  carriers: CARRIERS,
  timed: BELLS,
  cannons: [],
  enemies: ENEMIES,
  flourish: 150,
  flourishLook: 30,
  chime: [0, 2, 4, 1, 3, 0, 2, 4],
  signs: [
    {
      label: { nb: "Rådhusbrygga", en: "Rådhusbrygga" },
      lines: { nb: ["Øybåten går over og tilbake.", "Taket er gratis."], en: ["The island ferry goes across and back.", "The roof rides free."] }
    },
    {
      label: { nb: "Klokkespillet", en: "The carillon" },
      lines: { nb: ["49 klokker i østtårnet. De spiller hver hele time,", "og nå også når du lander på dem."], en: ["49 bells in the east tower. They play on the hour,", "and now also when you land on them."] }
    },
    {
      label: { nb: "Heisen", en: "The lift" },
      lines: { nb: ["Vinduspussernes heis.", "De er på lunsj."], en: ["The window cleaners' lift.", "They are at lunch."] }
    },
    {
      label: { nb: "Taket", en: "The roof" },
      lines: { nb: ["Klokkene kommer og går.", "Vent på den neste."], en: ["The bells come and go.", "Wait for the next one."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => drawOsloHills(v.sky, WATER),
    mid: (v) => drawFjord(v.t, WATER),
    near(v) {
      harbourSide(WATER - 2);
      drawGulls(v.t, 30 * TILE);
    },
    back(v: View) {
      terminal();
      passage();
      upperTower();
      for (const x of LAMPS) lampPost(x, SQUARE, 36);
      tbaneDoor(v.doors.get("tbane"));
    },
    front(v: View) {
      windows(162, 171, 16, 27, 3);
      windows(162, 171, 34, 45, 3);
      windows(174, 195, 35, 45, 3);
      windows(198, 207, 19, 45, 3);
      clock(v);
      towerTop();
      fountain(v.t);
      for (const x of LAMPS) lampPool(x, SQUARE);
    },
    ground: () => ({ top: GROUND.paving, dot: GROUND.pavingDot, fill: MASONRY.gatePost }),
    tile(t, c, r, x, y, _map, sky) {
      if (t !== "N") return false;
      lantern(c, r, x, y, sky.snow);
      return true;
    },
    ledges: { "=": BRICK_LEDGE, _: WOOD_LEDGE },
    carrier(i, at, v) {
      if (i === 0) ferry(at);
      else if (i === 1) gondola(at);
      else if (i === SWING_INDEX) swingingBell(at, v);
      else handTip(i - SWING_INDEX - 1, at);
    },
    timed: (i, v) => bell(i, v),
    flourish: (age) => flourish(age)
  }
};

void carrierShown;
void orbitAngle;
void ROOF;
