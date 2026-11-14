import { box } from "@larshansen/pixelkit/backdrop";
import { carrierAt, carrierShown, pathPeriod, stopAt, untilStop, type CarrierDef, type Path } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Hazard } from "@larshansen/pixelkit/hazard";
import { R, layerOrigin, layerX, light, mix, view, wdisc } from "@larshansen/pixelkit/paint";
import { INK, LAMP, METAL, PAINT, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import { panelDoor } from "@larshansen/pixelkit/props";
import * as METRO from "@larshansen/pixelkit/swatches/metro";
import { rampHeight, type TileMap } from "@larshansen/pixelkit/tilemap";
import { leap, type Enemy, type EnemyDef } from "../game/enemies";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 8, rune S: Stortinget. The T-bane station under the centre, where every line in the city
// passes through. No sky: tiled walls, the T roundel, lamps, the dark of the tunnels. Down the
// escalators (belts: one with him, one against him), along the platforms, where the third rail lies
// live in the open track, and onto the trains' roofs, which run on a timetable shown on the boards
// and are the only way through the tunnels. The kiosk on the platform is Quintle's door, locked with
// the front page's padlock until it is out. At the end, in the cavern where the lines cross, two
// trains pass: the lower one goes to the depot, so he changes roofs on the way. Rune S at the far
// end, past where passengers may go.
// New: belts (the escalators, a moving walkway), trains on a timetable that stop at the platforms,
// the departure boards, and the third rail, the first hazard.
//
//   #  floors   W  concrete and rock   E  the dark under an escalator   G  a ticket gate
//   Z  the signal cabinet   =  steel shelves
//   -  a grating over the track   v  the track bed (the tunnels: a fall)   b  a bench   $  skilling
//   &  brown cheese   t  T-banen   k  the kiosk (Quintle)
//
// Sections: the ticket hall and the escalators (teach: belts where nothing can go wrong); platform 1
// (the board, the first crossing of the track, the first train through the tunnel); platform 2 (the
// middle flag; twist: the walkway against him with umbrellas on it, and the track too wide for a
// jump, crossed with the dash); and the cavern (set piece: two trains passing, the roof change, the
// rune past the gate).

const COLS = 274;
const ROWS = 24;
/** The ticket hall's floor, the mezzanine's, the platforms', and platform 3's (higher). */
export const H = 7;
export const M = 12;
export const P = 18;
export const U = 16;
const b = mapBuilder(COLS, ROWS);

// --- The ticket hall and the escalators -----------------------------------------------------------------
b.ground(0, 33, H);
b.put(17, H - 1, "G").put(20, H - 1, "G");
// The sign over the gates, and a vent above it: a nook up under the vault.
b.run(22, 25, 4, "=");
b.run(28, 30, 2, "=");
/** Down to the mezzanine, with him; down to the platform, against him. */
export const ESC1 = b.slope(34, H, 44, M, "E");
b.ground(44, 49, M);
export const ESC2 = b.slope(50, M, 60, P, "E");

// --- Platform 1 -----------------------------------------------------------------------------------------
b.ground(60, 100, P);
b.fill(60, 100, 0, 9, "W");
b.run(63, 64, P, "-");
// The kiosk's roof, and the top of the departure board: the high way while he waits.
b.run(67, 71, 16, "=");
b.run(74, 77, 14, "=");
// An open crossing of the track, three tiles: the third rail at the bottom.
b.fill(79, 81, P, P, ".");

// --- The first tunnel -------------------------------------------------------------------------------------
b.fill(101, 127, P, P + 1, "v");
b.fill(101, 127, P + 2, ROWS - 1, "W");
b.fill(101, 127, 0, 14, "W");

// --- Platform 2 -----------------------------------------------------------------------------------------
b.ground(128, 175, P);
b.fill(128, 175, 0, 9, "W");
// The low beam where the tunnel opens: it sweeps him off a train's roof onto the platform.
b.fill(129, 130, 10, 15, "W");
// The track again, five tiles: a jump and the dash.
b.fill(153, 157, P, P, ".");
// A plinth with a bench on it, a little off the path, and a cable tray over it under the board: from
// there, down onto the roof of the train that stands at the end of the platform.
b.run(160, 162, 16, "=");
b.run(164, 167, 14, "=");

// --- The cavern, and platform 3 --------------------------------------------------------------------------
b.fill(176, 227, P, P + 1, "v");
b.fill(176, 227, P + 2, ROWS - 1, "W");
b.fill(176, 227, 0, 7, "W");
b.ground(228, COLS - 1, U);
b.fill(228, COLS - 1, 0, 9, "W");
b.put(237, U - 1, "G");
// Past the gate: a raised service walkway over the cable drums; steps down to the depot's siding,
// its third rail in the open, and up again; a step, and the signal cabinet.
b.run(247, 251, U - 2, "=");
b.fill(254, 263, U, U + 1, ".");
b.put(254, U + 1, "#").put(263, U + 1, "#");
b.fill(258, 260, P, P, ".");
b.put(267, U - 1, "W");
b.fill(269, 271, U - 3, U - 1, "Z");

// Marks: the start, doors, signs, flags, benches, the rune, the bracteate, the cheese.
b.put(2, H - 1, "t").put(4, H - 1, "S").put(7, H - 1, "i");
b.put(61, P - 1, "i").put(66, P - 1, "b").put(70, P - 1, "k").put(84, P - 1, "f");
b.put(133, P - 1, "f").put(136, P - 1, "i").put(161, 15, "b").put(159, P - 1, "f").put(239, U - 1, "f");
b.put(270, U - 4, "r").put(200, 9, "o").put(29, 1, "&");

/** Steps down an escalator, just over its steps: for skilling along it. */
const along = (ramp: { points: [number, number][] }, c: number) => Math.floor(((rampHeight([ramp], c * TILE + 8) ?? 0) - 9) / TILE);
// Skilling: over the gates, on the sign and up the vent, down both escalators, over the trolley, the
// grating, the kiosk and the board, the crossing, the tunnel, over the scooter and the umbrellas, across
// the wide crossing, round the bench, along both trains' roofs, and over the gate at the end.
const COINS: [number, number][] = [
  [9, 6], [10, 6],
  [17, 4], [20, 4],
  [22, 3], [23, 3], [24, 3], [25, 3],
  [28, 1], [30, 1],
  ...[36, 38, 40, 42].map((c): [number, number] => [c, along(ESC1, c)]),
  [46, 10], [47, 9], [48, 10],
  ...[52, 54, 56, 58].map((c): [number, number] => [c, along(ESC2, c)]),
  [63, 17], [64, 17],
  [67, 15], [68, 15],
  [74, 13], [75, 13], [76, 13], [77, 13],
  [79, 16], [80, 15], [81, 16],
  [89, 17], [91, 17],
  [106, 15], [111, 15], [116, 15], [121, 15],
  [138, 16], [139, 15], [140, 16],
  [144, 15], [148, 15],
  [153, 16], [154, 16], [155, 16], [156, 16], [157, 16],
  [160, 15], [162, 15],
  [164, 13], [166, 13],
  [182, 15], [187, 15],
  [194, 13], [198, 13], [206, 13], [212, 13], [218, 13], [224, 13],
  [237, 13], [242, 15], [243, 15],
  [247, 13], [249, 13], [251, 13],
  [256, 16], [258, 16], [259, 15], [260, 16], [262, 16],
  [265, 14], [268, 12]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The escalators and the walkway: belts ---------------------------------------------------------------
/** How fast a belt runs: an escalator, the walkway. + is to the right. */
const BELT = { down: 0.6, up: -0.6, walkway: -0.5 };
const WALKWAY = { x0: 141 * TILE, x1: 151 * TILE, y: P * TILE };
const ESCALATORS = [
  { ramp: ESC1, belt: BELT.down },
  { ramp: ESC2, belt: BELT.up }
];
function surfaceAt(x: number, y: number) {
  for (const e of ESCALATORS) {
    const [, [x0], [x1]] = e.ramp.points;
    if (x < x0 || x > x1) continue;
    const h = rampHeight([e.ramp], x);
    if (h !== null && Math.abs(h - y) < 2) return { grip: 1, belt: e.belt };
  }
  if (x >= WALKWAY.x0 && x < WALKWAY.x1 && Math.abs(y - WALKWAY.y) < 0.5) return { grip: 1, belt: BELT.walkway };
  return null;
}

// --- The trains ---------------------------------------------------------------------------------------------
/** A train's roof over a platform: a jump up from it. Over platform 3 (the express's), the same. */
export const ROOF = P * TILE - 24;
export const HIGH = U * TILE - 24;
const CAR = 8 * TILE;
/** The tunnel mouths: where the local comes out (under the escalator), where the cavern begins, its far wall. */
const MOUTH = { local: 60 * TILE, cavern: 176 * TILE, far: COLS * TILE };
/** Where the local dips down to the depot, under the cavern's floor. */
const DIP = 202 * TILE;
/** Steps a train stands at a platform. */
const STAND = 150;
/** The local: out from under the escalators, standing at platform 1, through the tunnel, standing at the end of platform 2, into the cavern and down to the depot. */
const LOCAL_LINE: Path = {
  kind: "path",
  points: [
    { x: 44 * TILE, y: ROOF },
    { x: 87 * TILE, y: ROOF },
    { x: 166 * TILE, y: ROOF },
    { x: DIP, y: ROOF },
    { x: 214 * TILE, y: ROOF + 64 }
  ],
  w: CAR,
  speed: 1.8,
  wait: 23,
  stops: [
    { at: 1, steps: STAND },
    { at: 2, steps: STAND }
  ]
};
/** Five locals on the line, evenly spaced: never much more than five seconds to wait, even for one he can still get onto. */
export const LOCALS: Path[] = [0, 1, 2, 3, 4].map((i) => ({ ...LOCAL_LINE, offset: Math.round((i * pathPeriod(LOCAL_LINE)) / 5) }));
/** The express: down out of its own tunnel high in the cavern's wall, past the local, standing at platform 3, and on past the end. */
const EXPRESS_LINE: Path = {
  kind: "path",
  points: [
    { x: 168 * TILE, y: 136 },
    { x: 180 * TILE, y: HIGH },
    { x: 228 * TILE, y: HIGH },
    { x: (COLS + 2) * TILE, y: HIGH }
  ],
  w: CAR,
  speed: 2.6,
  wait: 0,
  stops: [{ at: 2, steps: STAND }]
};
EXPRESS_LINE.wait = pathPeriod(LOCAL_LINE) - pathPeriod(EXPRESS_LINE);
/**
 * Each express is timed to its local: it comes down behind the local that leaves platform 2, is level
 * by the time it catches up, and passes over it well before the local dips to the depot.
 */
const LEAVES_P2 = stopAt(LOCAL_LINE, 1).from + STAND;
const CATCH = { tau: 180, k: 96 };
export const EXPRESSES: Path[] = LOCALS.map((l) => ({ ...EXPRESS_LINE, offset: (l.offset ?? 0) + CATCH.k - (LEAVES_P2 + CATCH.tau) }));
const CARRIERS: CarrierDef[] = [...LOCALS, ...EXPRESSES];

/** Steps until the next local stands at platform 1 (stop 0) or at the end of platform 2 (stop 1); 0 while one does. */
export const nextLocal = (stop: number, t: number) => Math.min(...LOCALS.map((d) => untilStop(d, stop, t)));

// --- The third rail ----------------------------------------------------------------------------------------
/** Along the bottom of each open crossing of the track. */
export const HAZARDS: Hazard[] = [
  { x: 79 * TILE, y: (P + 1) * TILE - 4, w: 3 * TILE, h: 4 },
  { x: 153 * TILE, y: (P + 1) * TILE - 4, w: 5 * TILE, h: 4 },
  { x: 258 * TILE, y: (P + 1) * TILE - 4, w: 3 * TILE, h: 4 }
];

/**
 * Pigeons in the ticket hall, one flying under the vault; a shopping trolley on the mezzanine, alone; a
 * rat on platform 1 while he waits; rats that leap out of the track; a scooter, umbrellas tumbling on
 * the walkway, a pigeon over it; a rat on platform 3.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "pigeon", c: 12, r: H - 1, range: 2 },
  { kind: "flyer", look: "pigeonfly", c: 26, r: 3, range: 3, rise: 6, period: 170 },
  { kind: "walker", look: "pigeon", c: 30, r: H - 1, range: 1 },
  { kind: "walker", look: "trolley", c: 47, r: M - 1, range: 2, w: 12, h: 10, speed: 0.3 },
  { kind: "jumper", look: "trackrat", c: 80, r: P, rise: 30, period: 200 },
  { kind: "walker", look: "rat", c: 92, r: P - 1, range: 2 },
  { kind: "walker", look: "scooter", c: 139, r: P - 1, range: 2, w: 14, h: 12 },
  { kind: "spiky", look: "umbrella", c: 145, r: P - 1, range: 1, w: 12, h: 9 },
  { kind: "jumper", look: "trackrat", c: 155, r: P, rise: 36, period: 180, offset: 90 },
  { kind: "walker", look: "rat", c: 244, r: U - 1, range: 1 },
  { kind: "jumper", look: "trackrat", c: 259, r: P, rise: 28, period: 190, offset: 40 }
];

export const STORTINGET_RULES = { COLS, ROWS, CARRIERS, LOCAL_LINE, EXPRESS_LINE };

// --- Art --------------------------------------------------------------------------------------------------
const at = (c: number, r: number) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? MAP[r][c] : ".");
/** The floor in a column: the first floor tile from the top, or the track bed. */
function floorRow(c: number) {
  for (let r = 0; r < ROWS; r++) if ("#-v".includes(at(c, r)) && !"W".includes(at(c, r - 1))) return r;
  return ROWS;
}
/** The ceiling's underside in a column (world y), where there is one. */
function ceilingAt(c: number) {
  for (let r = 0; r < ROWS; r++) if (at(c, r) !== "W") return r * TILE;
  return 0;
}

/** A small repeatable number for a block of rock, so the rock looks the same on every visit. */
const hash = (a: number, b: number) => {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

/** Blasted rock in rough courses: blocks of a few shades with dark cracks between, drawn by `put` (world or layer pixels). */
function rockCourses(put: (x: number, y: number, w: number, h: number, c: string) => void, lx0: number, lx1: number, y0: number, y1: number, shades: string[], crack: string, seed = 0) {
  for (let y = Math.floor(y0 / 10) * 10; y < y1; y += 10) {
    const course = y / 10 + seed;
    const w = 18 + Math.floor(hash(course, 3) * 10);
    const shift = Math.floor(hash(course, 7) * w);
    for (let x = Math.floor((lx0 - shift) / w) * w + shift; x < lx1; x += w) {
      const k = hash(Math.floor(x / w), course);
      put(x, y, w, 10, shades[Math.floor(k * shades.length)]);
      put(x, y + 9, w, 1, crack);
      put(x, y, 1, 10, crack);
      if (k > 0.82) put(x + 4, y + 3, Math.floor(w / 3), 1, crack);
    }
  }
}

/** The far dark: the rock the station is cut into, in courses, and the lamps of other tunnels deep in it. */
function farDark() {
  const o = Math.floor(layerOrigin(0.12));
  box(0, view.camY, view.w, view.h, METRO.vault);
  rockCourses((x, y, w, h, c) => box(x - o, y, w, h, c), o, o + view.w, view.camY, view.camY + view.h, [METRO.vault, FAR_ROCK, METRO.vaultLight], FAR_CRACK, 3);
  for (let i = 0; i < 30; i++) {
    const x = layerX(i * 240 + ((i * 71) % 90), 0.12);
    if (x < -4 || x > view.w + 4) continue;
    const y = 120 + ((i * 37) % 140);
    box(x, y, 2, 2, mix(LAMP, METRO.vault, 0.4));
    box(x - 1, y + 2, 4, 1, mix(LAMP, METRO.vault, 0.75));
  }
}
const FAR_ROCK = mix(METRO.vault, METRO.vaultLight, 0.5);
const FAR_CRACK = mix(METRO.vault, INK, 0.5);

/** Other platforms, far off across the rock: a lit band of tiles with a train in it, every line in the city. */
function farPlatforms() {
  for (let i = 0; i < 40; i++) {
    const wx = i * 150 + ((i * 37) % 60);
    const x = layerX(wx, 0.2);
    if (x < -90 || x > view.w + 10) continue;
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(wx / TILE)));
    const y = floorRow(c) * TILE - 44 - ((i * 13) % 3) * 6;
    const fade = (col: string) => mix(col, METRO.vault, 0.55);
    box(x - 4, y - 8, 84, 36, fade(METRO.concreteDark));
    box(x, y - 4, 76, 26, fade(METRO.tile));
    box(x, y + 6, 76, 2, fade(METRO.band));
    box(x, y - 4, 76, 1, fade(LAMP));
    if (i % 2 === 0) {
      box(x + 6, y + 4, 52, 14, fade(METRO.train));
      box(x + 6, y + 7, 52, 4, fade(METRO.trainBand));
      for (let k = 8; k < 56; k += 6) box(x + k, y + 8, 3, 2, fade(LAMP));
    }
    box(x - 4, y + 22, 84, 3, fade(METRO.floor));
  }
}

/** Columns nearer, holding up the vault, from the rock above to the dark below: concrete, the roundel on those in the cavern. Not in the tunnels. */
function nearColumns() {
  for (let i = 0; i < 40; i++) {
    const wx = i * 190 + ((i * 53) % 40);
    const x = layerX(wx, 0.4);
    if (x < -16 || x > view.w + 16) continue;
    const c = Math.floor((view.camX + x) / TILE);
    if ((c > 100 && c < 128) || c > 250) continue;
    const col = mix(METRO.concrete, METRO.vault, 0.35);
    box(x, view.camY, 10, view.h, col);
    box(x, view.camY, 2, view.h, mix(METRO.concrete, METRO.vault, 0.15));
    box(x + 8, view.camY, 2, view.h, mix(METRO.concreteDark, METRO.vault, 0.4));
    for (let y = Math.floor(view.camY / 24) * 24; y < view.camY + view.h; y += 24) box(x, y, 10, 1, mix(METRO.concreteDark, METRO.vault, 0.4));
    if (c >= 176 && c < 228) {
      const y = P * TILE - 112;
      box(x - 2, y, 14, 14, mix(PAINT.tbane, METRO.vault, 0.3));
      box(x, y + 2, 10, 10, mix(WHITE, METRO.vault, 0.3));
      box(x + 2, y + 4, 6, 2, mix(PAINT.tbane, METRO.vault, 0.3));
      box(x + 4, y + 6, 2, 5, mix(PAINT.tbane, METRO.vault, 0.3));
    }
  }
}

/** Cream tiles on a wall from y0 to y1, the blue band at `band`, a concrete cornice over them and a shadow at their foot. */
function tiles(x0: number, x1: number, y0: number, y1: number, band: number | null) {
  R(x0, y0, x1 - x0, y1 - y0, METRO.tile);
  for (let y = y0 + 7; y < y1; y += 8) R(x0, y, x1 - x0, 1, METRO.tileLine);
  for (let y = y0; y < y1; y += 16) for (let x = x0 + 7; x < x1; x += 8) R(x, y, 1, 8, METRO.tileLine);
  for (let y = y0 + 8; y < y1; y += 16) for (let x = x0 + 3; x < x1; x += 8) R(x, y, 1, 8, METRO.tileLine);
  if (band !== null) {
    R(x0, band, x1 - x0, 6, METRO.band);
    R(x0, band, x1 - x0, 1, mix(METRO.band, WHITE, 0.3));
  }
  R(x0, y0 - 4, x1 - x0, 4, METRO.concrete);
  R(x0, y0 - 1, x1 - x0, 1, METRO.concreteDark);
  R(x0, y1 - 3, x1 - x0, 3, METRO.tileShade);
}

/** The T roundel: a blue ring round a white disc with the blue T. */
function roundel(cx: number, cy: number, r = 7) {
  wdisc(cx, cy, r, PAINT.tbane);
  wdisc(cx, cy, r - 2, WHITE);
  R(cx - 2, cy - 2, 5, 1, PAINT.tbane);
  R(cx, cy - 1, 1, 4, PAINT.tbane);
}

/** A tube lamp on a ceiling or a wall, and the light it throws. */
function tube(x: number, y: number, w = 14) {
  R(x, y, w, 2, mix(LAMP, WHITE, 0.6));
  R(x - 1, y - 1, w + 2, 1, METRO.concreteDark);
  light(x, y, w, 2, "soft");
}

/** The ticket hall: a tiled wall under the rock vault, lamps on wires, ticket machines, the sign over the gates with the roundel, the way out. */
function hall(v: View) {
  const g = H * TILE;
  tiles(0, 34 * TILE, g - 84, g, g - 36);
  for (const x of [40, 136, 232, 328, 424]) {
    R(x + 9, -40, 1, 52, METAL.wire);
    tube(x, 12, 18);
  }
  // Ticket machines: red boxes with a screen.
  for (const x of [9 * TILE, 10 * TILE + 6]) {
    R(x, g - 26, 12, 26, METRO.kiosk);
    R(x, g - 26, 12, 1, METRO.kioskLight);
    R(x + 2, g - 22, 8, 6, METRO.board);
    R(x + 3, g - 21, 6, 1, METRO.led);
    R(x + 4, g - 12, 4, 2, INK);
  }
  // The sign over the gates, under its shelf: blue, with the roundel and an arrow down.
  const sx = 22 * TILE;
  for (const x of [sx + 8, sx + 54]) R(x, -40, 1, 4 * TILE + 40, METAL.wire);
  R(sx + 2, 4 * TILE + 5, 4 * TILE - 4, 18, PAINT.tbane);
  roundel(sx + 14, 4 * TILE + 14, 6);
  R(sx + 30, 4 * TILE + 10, 22, 2, WHITE);
  R(sx + 30, 4 * TILE + 15, 16, 2, WHITE);
  for (let k = 0; k < 4; k++) R(sx + 56 - k, 4 * TILE + 10 + k, 2 + k * 2, 1, WHITE);
  // The vent up in the vault, a grille.
  R(28 * TILE - 4, 2 * TILE - 22, 3 * TILE + 8, 22, METRO.concreteDark);
  for (let x = 28 * TILE; x < 31 * TILE; x += 4) R(x, 2 * TILE - 20, 2, 18, METRO.vault);
  tbaneDoor(v.doors.get("tbane"));
}

/** The escalator shafts: a sloping ceiling of lamps over each, steel sides, steps that move at the belt's speed. */
function escalator(ramp: { points: [number, number][] }, belt: number, t: number) {
  const [, [x0, y0], [x1, y1]] = ramp.points;
  const tt = view.reduced ? 0 : t;
  for (let x = x0; x <= x1; x++) {
    const y = Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
    // The truss under the steps, and the glass balustrade with the black handrail over them.
    R(x, y + 1, 1, 9, METRO.steel);
    R(x, y + 9, 1, 2, METRO.steelDark);
    R(x, y - 13, 1, 12, mix(METRO.tile, WHITE, 0.4));
    R(x, y - 14, 1, 2, METRO.handrail);
    // The steps: dark, their ridges moving the way the belt runs.
    R(x, y, 1, 2, METRO.steps);
    if ((((x - Math.floor(tt * belt)) % 5) + 5) % 5 === 0) R(x, y - 1, 1, 1, METRO.steelDark);
  }
  // The lamps along the shaft's sloping ceiling.
  for (let x = x0 + 12; x < x1; x += 40) {
    const y = Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)) - 64;
    tube(x, y, 10);
  }
  // A comb plate at each end.
  for (const [x, y] of [[x0, y0], [x1, y1]] as const) R(x - 3, y, 6, 2, METRO.steelDark);
}

/** The shafts' back walls: a band of tiles going down with the escalators, the rock above. */
function shaft() {
  for (let x = 34 * TILE; x < 60 * TILE; x++) {
    const ramp = Math.round(rampHeight([ESC1, ESC2], x) ?? M * TILE);
    const top = ramp - 70;
    R(x, top - 4, 1, 4, METRO.concrete);
    R(x, top - 1, 1, 1, METRO.concreteDark);
    R(x, top, 1, ramp - top, x % 8 === 7 ? METRO.tileLine : METRO.tile);
    for (let y = top + ((8 - (top % 8)) % 8); y < ramp; y += 8) R(x, y, 1, 1, METRO.tileLine);
  }
}

/** A platform's back wall: a band of tiles, the blue band with the station's name in white blocks, posters, roundels; the track's dark gap along its foot, where the trains stand. */
function platformWall(c0: number, c1: number, floor: number, seed: number) {
  const x0 = c0 * TILE;
  const x1 = (c1 + 1) * TILE;
  const top = floor - 84;
  tiles(x0, x1, top, floor - 6, floor - 52);
  // The station's name in the band, every so often, in white.
  for (let x = x0 + 40; x + 60 < x1; x += 180) stationName(x, floor - 51);
  // Posters in steel frames.
  for (let x = x0 + 110; x + 30 < x1; x += 160) {
    const k = (Math.floor(x / 160) + seed) % 3;
    R(x - 1, floor - 41, 30, 22, METRO.steelDark);
    R(x, floor - 40, 28, 20, METRO.poster);
    R(x + 3, floor - 37, 10 + k * 4, 8, [METRO.trainStripe, PAINT.tbane, PLANT_GREEN][k]);
    R(x + 3, floor - 26, 20, 2, INK);
    R(x + 3, floor - 23, 14, 1, INK);
  }
  for (let x = x0 + 30; x < x1; x += 120) roundel(x, floor - 70, 6);
  // The track, seen past the platform's edge: a dark gap with a rail in it.
  R(x0, floor - 6, x1 - x0, 6, METRO.bed);
  R(x0, floor - 3, x1 - x0, 1, METRO.rail);
  // The ceiling slab's lamps, where it has one, and the cable tray along under it on its brackets.
  const ceiling = ceilingAt(c0);
  if (ceiling > 0) {
    for (let x = x0 + 8; x < x1 - 14; x += 48) tube(x, ceiling + 2, 14);
    R(x0, ceiling + 9, x1 - x0, 2, METRO.steelDark);
    R(x0, ceiling + 8, x1 - x0, 1, METRO.trainStripe);
    R(x0, ceiling + 7, x1 - x0, 1, mix(METRO.steelDark, INK, 0.3));
    for (let x = x0 + 4; x < x1; x += 32) R(x, ceiling, 1, 11, METRO.steelDark);
  }
}

/** The letters of the station's name, three or four pixels wide and five high. */
const GLYPHS: Record<string, string[]> = {
  S: ["###", "#..", "###", "..#", "###"],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  O: ["###", "#.#", "#.#", "#.#", "###"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  I: ["#", "#", "#", "#", "#"],
  N: ["#..#", "##.#", "#.##", "#..#", "#..#"],
  G: ["###", "#..", "#.#", "#.#", "###"],
  E: ["###", "#..", "##.", "#..", "###"]
};
/** STORTINGET, in white on the blue band, as on every platform's wall. */
function stationName(x: number, y: number) {
  let at = x;
  for (const ch of "STORTINGET") {
    const g = GLYPHS[ch];
    g.forEach((row, ry) => [...row].forEach((on, rx) => on === "#" && R(at + rx, y + ry, 1, 1, WHITE)));
    at += g[0].length + 1;
  }
}
const PLANT_GREEN = PALETTE.grassDark;

/** The kiosk on platform 1: red, its shutter half down, magazines in the window; its door is Quintle's, padlocked until it is out. */
function kiosk(v: View) {
  const x = 67 * TILE;
  const g = P * TILE;
  const top = 16 * TILE + 4;
  R(x, top, 5 * TILE, g - top, METRO.kiosk);
  R(x, top, 5 * TILE, 2, METRO.kioskLight);
  // The window: magazines in rows, a fridge's glow.
  R(x + 4, top + 6, 30, 16, METRO.board);
  for (let k = 0; k < 7; k++) R(x + 6 + k * 4, top + 8 + (k % 2) * 7, 3, 6, [METRO.poster, PAINT.tbane, LAMP, WHITE, METRO.kioskLight, PLANT_GREEN, METRO.poster][k]);
  light(x + 4, top + 6, 30, 16, "soft");
  // The shutter, half down.
  R(x + 2, top + 3, 34, 4, METRO.steel);
  for (let k = 0; k < 4; k += 2) R(x + 2, top + 3 + k, 34, 1, METRO.steelDark);
  R(x + 38, top + 8, 12, 14, METRO.poster);
  R(x + 40, top + 10, 8, 3, METRO.trainStripe);
  const d = v.doors.get("quintle");
  if (d) {
    R(d.x - 2, d.bottom - d.h - 2, d.w + 4, d.h + 2, METRO.kioskLight);
    panelDoor(d, PAINT.shopDoor, PAINT.shopDoorPanel);
  }
}

/** Seven-segment-ish digits, 3 x 5, for the boards. */
const DIGITS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111"];
function digit(x: number, y: number, n: number, c: string) {
  const bits = DIGITS[n];
  for (let i = 0; i < 15; i++) if (bits[i] === "1") R(x + (i % 3), y + Math.floor(i / 3), 1, 1, c);
}

/** A departure board hanging from the ceiling: the line, its end (as a row of amber dashes), and the seconds to the next train; "the doors are closing" as it stands. */
function board(c: number, y: number, until: number, line: number, t: number) {
  const x = c * TILE;
  const top = ceilingAt(c);
  for (const hx of [x + 8, x + 52]) R(hx, top, 1, y - top, METAL.wire);
  R(x, y, 4 * TILE, 18, METRO.board);
  R(x, y, 4 * TILE, 1, METRO.steelDark);
  // The line's number in its roundel colour.
  R(x + 3, y + 3, 7, 7, PAINT.tbane);
  digit(x + 5, y + 4, line, WHITE);
  for (let k = 0; k < 9; k++) R(x + 13 + k * 3, y + 5, 2, 3, (k * 7 + line) % 5 === 0 ? METRO.ledDim : METRO.led);
  const s = Math.ceil(until / 60);
  if (until > 0) {
    if (s >= 10) digit(x + 48, y + 4, Math.floor(s / 10) % 10, METRO.led);
    digit(x + 52, y + 4, s % 10, METRO.led);
    R(x + 57, y + 7, 2, 2, METRO.led);
  } else if (view.reduced || Math.floor(t / 15) % 2 === 0) for (let k = 0; k < 4; k++) R(x + 44 + k * 4, y + 4, 3, 5, METRO.led);
  // The second row: a dim scroll of what is said on every platform.
  for (let k = 0; k < 18; k++) R(x + 3 + k * 3, y + 12, 2, 2, (k + Math.floor(t / 8)) % 6 === 0 ? METRO.led : METRO.ledDim);
  light(x + 2, y + 2, 4 * TILE - 4, 14, "soft");
}

/** A tunnel's wall: blasted rock in courses, a cable tray, a small lamp every few metres. */
function tunnelWall(c0: number, c1: number) {
  const top = ceilingAt(c0);
  rockCourses(R, c0 * TILE, (c1 + 1) * TILE, top, P * TILE, [METRO.rock, METRO.rockLight, mix(METRO.rock, METRO.vault, 0.4)], METRO.vault, 11);
  for (let x = c0 * TILE; x < (c1 + 1) * TILE; x += 6) R(x, top + 10, 4, 1, METRO.concreteDark);
  for (let x = c0 * TILE + 20; x < (c1 + 1) * TILE; x += 64) {
    R(x, top + 4, 3, 3, LAMP);
    light(x - 1, top + 3, 5, 5, "soft");
  }
}

/**
 * The cavern where the lines cross: open to the vault (the far layers show through it), great lamps
 * on wires, the express's track on a concrete shelf, the slot where the local goes down to the depot.
 */
function cavern() {
  const x0 = 176 * TILE;
  const x1 = 228 * TILE;
  const top = 8 * TILE;
  // The express's tunnel mouth high in the wall, and its track down to the shelf.
  R(x0 - 2, 128, 26, 40, METRO.concreteDark);
  R(x0, 132, 22, 36, METRO.vault);
  for (let x = x0; x < x1; x++) {
    const y = rampHeight([{ points: [[168 * TILE, 136], [180 * TILE, HIGH], [x1 + 400, HIGH]] }], x) ?? HIGH;
    const bed = Math.round(y) + 34;
    R(x, bed, 1, 5, METRO.concrete);
    R(x, bed, 1, 1, METRO.rail);
    R(x, bed + 5, 1, 1, METRO.concreteDark);
  }
  for (let x = 184 * TILE; x < x1; x += 64) {
    R(x, HIGH + 39, 6, P * TILE - HIGH - 39, METRO.concrete);
    R(x, HIGH + 39, 1, P * TILE - HIGH - 39, METRO.concreteDark);
  }
  // Big lamps hung from the vault.
  for (let x = x0 + 40; x < x1; x += 112) {
    R(x, top, 1, 18, METAL.wire);
    R(x - 6, top + 18, 13, 3, METRO.concreteDark);
    R(x - 4, top + 21, 9, 2, mix(LAMP, WHITE, 0.4));
    light(x - 4, top + 21, 9, 2, "lamp");
  }
  // The slot down to the depot, where the local goes.
  for (let x = DIP; x < DIP + 14 * TILE; x++) {
    const k = (x - DIP) / (14 * TILE);
    R(x, P * TILE - 2, 1, 4 + Math.round(k * 10), METRO.vault);
  }
  // A sign on a post over it.
  R(DIP + 60, P * TILE - 44, 1, 44, METAL.wire);
  R(DIP + 40, P * TILE - 56, 44, 12, METRO.board);
  for (let k = 0; k < 9; k++) R(DIP + 44 + k * 4, P * TILE - 52, 3, 4, METRO.led);
}

/** The gate past the end of platform 3, the cable drums under the service walkway, and the signal cabinet with its lamps, under the rune. */
function pastTheEnd(v: View) {
  const g = U * TILE;
  for (const x of [247 * TILE + 6, 249 * TILE + 10]) {
    wdisc(x + 8, g - 9, 9, P_WOOD);
    wdisc(x + 8, g - 9, 6, METRO.board);
    wdisc(x + 8, g - 9, 2, P_WOOD);
  }
  for (const x of [247 * TILE + 2, 251 * TILE + 12]) R(x, (U - 2) * TILE + 4, 2, 2 * TILE - 4, METRO.steelDark);
  // A no-entry sign on the gate's post.
  wdisc(237 * TILE + 8, g - 30, 6, METRO.trainStripe);
  R(237 * TILE + 3, g - 31, 11, 3, WHITE);
  R(237 * TILE + 7, g - 24, 2, 8, METRO.steelDark);
  // The cabinet's lamps blink green and red.
  const on = view.reduced || Math.floor(v.t / 30) % 2 === 0;
  R(269 * TILE + 6, (U - 3) * TILE + 6, 3, 3, on ? PLANT_GREEN : METRO.board);
  R(269 * TILE + 12, (U - 3) * TILE + 6, 3, 3, on ? METRO.board : METRO.trainStripe);
  // The siding's end: a buffer stop, red and white.
  R(263 * TILE - 6, P * TILE - 12, 6, 12, METRO.trainStripe);
  R(263 * TILE - 6, P * TILE - 8, 6, 2, WHITE);
}
const P_WOOD = PALETTE.woodDark;
const UNDER = mix(METRO.steelDark, METRO.concrete, 0.5);

/** Floors: stone with a speckle; where it meets the track, the yellow line and a dark lip; concrete under. */
function floorTile(c: number, r: number, x: number, y: number, m: TileMap) {
  const open = !m.isSolid(c, r - 1) && !m.isOneWay(c, r - 1);
  R(x, y, TILE, TILE, open ? METRO.floor : METRO.concrete);
  if (!open) {
    R(x, y + 7, TILE, 1, METRO.concreteDark);
    R(x, y + 15, TILE, 1, METRO.concreteDark);
    if ((c * 3 + r) % 4 === 0) R(x + ((c * 5) % 10) + 2, y + 10, 2, 2, METRO.concreteDark);
    return;
  }
  R(x, y, TILE, 1, METRO.floorLight);
  for (let i = 0; i < 4; i++) R(x + ((c * 5 + i * 7) % 15), y + 3 + ((c + i * 3) % 10), 1, 1, i % 2 ? METRO.floorDark : METRO.floorLight);
  R(x, y + 12, TILE, 4, METRO.concrete);
  // The edge to the track: a yellow line a little way in, and the lip.
  const track = (cc: number) => at(cc, r) === "." || at(cc, r) === "v" || at(cc, r) === "-";
  if (track(c + 1)) {
    R(x + TILE - 5, y, 3, 1, METRO.edge);
    R(x + TILE - 1, y, 1, TILE, METRO.concreteDark);
  }
  if (track(c - 1)) {
    R(x + 2, y, 3, 1, METRO.edge);
    R(x, y, 1, TILE, METRO.concreteDark);
  }
  // Along the platforms the yellow line runs at the front, where the trains stand behind.
  if (r === P || r === U) R(x, y + 1, TILE, 1, mix(METRO.edge, METRO.floor, 0.35));
}

/** The track bed: ballast, sleepers, two running rails and the third rail beside them under its yellow cover. */
function bedTile(c: number, x: number, y: number, top: boolean, t: number) {
  R(x, y, TILE, TILE, top ? METRO.bed : METRO.vault);
  if (!top) return;
  for (let i = 0; i < TILE; i += 4) R(x + i, y + 9, 3, 2, METRO.sleeper);
  R(x, y + 8, TILE, 1, METRO.rail);
  R(x, y + 12, TILE, 1, METRO.rail);
  R(x, y + 4, TILE, 2, METRO.live);
  R(x, y + 6, TILE, 1, mix(METRO.live, INK, 0.5));
  for (let i = 1; i < TILE; i += 5) R(x + i, y + 13 + (i % 2), 2, 1, METRO.ballast);
  if (!view.reduced && (c * 7 + Math.floor(t / 4)) % 41 === 0) R(x + 6, y + 2, 2, 2, METRO.spark);
}

/** An open crossing's bottom (a floor tile under the trench): the rails and the third rail, live, sparking now and then. */
function trenchFloor(c: number, x: number, y: number, t: number) {
  R(x, y, TILE, TILE, METRO.concrete);
  R(x, y, TILE, 5, METRO.bed);
  for (let i = 0; i < TILE; i += 4) R(x + i, y + 2, 3, 2, METRO.sleeper);
  R(x, y + 1, TILE, 1, METRO.rail);
  R(x, y - 4, TILE, 3, METRO.live);
  R(x, y - 1, TILE, 1, mix(METRO.live, INK, 0.5));
  for (let i = 0; i < TILE; i += 8) R(x + i + 2, y - 4, 2, 1, INK);
  if (!view.reduced && (c * 5 + Math.floor(t / 3)) % 23 < 2) {
    R(x + 5, y - 7, 1, 3, METRO.spark);
    R(x + 7, y - 9, 1, 3, WHITE);
    R(x + 9, y - 6, 1, 2, METRO.spark);
  }
}

/** Concrete: walls, ceilings, the mass under the escalators; a lamp line along a ceiling's underside. */
/** The bedrock over the halls: Oslo's shale in slanting layers of uneven thickness, offset where a fault runs through it. */
const SHALE = [mix(METRO.concrete, METRO.rock, 0.5), mix(METRO.concrete, METRO.rock, 0.42), mix(METRO.concrete, METRO.rock, 0.6), mix(METRO.concrete, METRO.rock, 0.47)];
const SHALE_LINE = mix(METRO.concreteDark, METRO.rock, 0.5);
/** Where a drill hole from the blasting is left in the rock, as a groove: one now and then, by column. */
const drilled = (c: number) => (c * 7) % 23 === 3;

/** A tile of rock: the layers slant across it, a world-wide pattern, never the same tile twice. */
function shaleTile(c: number, x: number, y: number) {
  for (let yy = 0; yy < TILE; yy++)
    for (let xx = 0; xx < TILE; xx += 4) {
      const wx = x + xx;
      const fault = Math.floor(wx / 176);
      const u = y + yy + wx * 0.22 + hash(fault, 3) * 9 + 400;
      const layer = Math.floor(u / 9);
      // Some layers are split by a dark parting, most run into the next.
      const edge = u % 9 < 1 && hash(layer, 5) < 0.45;
      R(wx, y + yy, 4, 1, edge ? SHALE_LINE : SHALE[Math.floor(hash(layer, fault + 1) * SHALE.length)]);
    }
  if (drilled(c)) {
    // The half of a blast hole, a groove down the face.
    R(x + 6, y, 1, TILE, mix(SHALE[2], METRO.vault, 0.3));
    R(x + 7, y, 1, TILE, mix(SHALE[1], WHITE, 0.08));
  }
}

function concreteTile(c: number, r: number, x: number, y: number, m: TileMap) {
  // Over the halls and the tunnels, away from their faces, it is the rock itself.
  const face = !m.isSolid(c, r + 1) || !m.isSolid(c - 1, r) || !m.isSolid(c + 1, r) || !m.isSolid(c, r + 2);
  if (!face && r < P) return shaleTile(c, x, y);
  R(x, y, TILE, TILE, METRO.concrete);
  // Formwork: the boards' lines, and a tie hole now and then.
  R(x, y + 7, TILE, 1, METRO.concreteDark);
  R(x, y + 15, TILE, 1, METRO.concreteDark);
  R(x + ((c * 7 + r * 3) % 11) + 2, y + ((c * 3 + r * 5) % 6) + 1, 2, 1, METRO.concreteDark);
  if ((c * 5 + r * 3) % 7 === 0) R(x + 8, y + 10, 2, 2, METRO.concreteDark);
  if (!m.isSolid(c, r + 1) && at(c, r + 1) !== "v") {
    R(x, y + TILE - 2, TILE, 2, METRO.concreteDark);
    // The low beam where the tunnel opens: the warning stripes on its face.
    if (c === 129 || c === 130) for (let k = 0; k < TILE; k++) if (((k + (c - 129) * TILE) >> 2) % 2 === 0) R(x + k, y + TILE - 6, 1, 4, METRO.live);
  }
  if (!m.isSolid(c - 1, r) && at(c - 1, r) === ".") R(x, y, 1, TILE, METRO.concreteDark);
}

/** A ticket gate: a steel post with a glass flap. */
function gateTile(x: number, y: number) {
  R(x + 4, y, 8, TILE, METRO.steel);
  R(x + 4, y, 8, 1, WHITE);
  R(x + 11, y, 1, TILE, METRO.steelDark);
  R(x + 6, y + 3, 4, 3, METRO.board);
  R(x + 7, y + 4, 2, 1, PLANT_GREEN);
  R(x + 12, y + 4, 4, 7, mix(METRO.spark, WHITE, 0.4));
}

/** The signal cabinet: grey steel, a door, vents. */
function cabinetTile(c: number, r: number, x: number, y: number, m: TileMap) {
  R(x, y, TILE, TILE, METRO.steelDark);
  R(x, y, TILE, 1, m.tileAt(c, r - 1) === "Z" ? METRO.steelDark : METRO.steel);
  if (m.tileAt(c - 1, r) !== "Z") R(x, y, 1, TILE, INK);
  if (m.tileAt(c + 1, r) !== "Z") R(x + TILE - 1, y, 1, TILE, INK);
  for (let k = 3; k < TILE - 2; k += 3) R(x + 3, y + k, 10, 1, mix(METRO.steelDark, INK, 0.3));
}

/**
 * A train: two cars, pale grey with a dark band of windows, doors, a red stripe; the line's number on
 * its front; the roof is what he stands on. Where a platform runs in front of it, only what shows over
 * the platform's edge is drawn; it comes out of its tunnel mouth, and the local goes down into the slot.
 */
function train(at: { x: number; y: number }, line: number, clip: { x0: number; x1: number }, dipping: boolean, lit: boolean) {
  const { x, y } = at;
  for (let dx = 0; dx < CAR; dx++) {
    const wx = x + dx;
    if (wx < clip.x0 || wx >= clip.x1) continue;
    const c = Math.floor(wx / TILE);
    const floor = "#-".includes(MAP[P][c]) ? P * TILE : MAP[U][c] === "#" ? U * TILE : Infinity;
    const bottom = Math.min(y + 36, floor, dipping ? P * TILE : Infinity);
    const seg = dx % 64;
    const gap = seg === 63 || seg === 0;
    const col = (yy: number, h: number, colour: string) => {
      const top = Math.max(y + yy, y);
      const end = Math.min(y + yy + h, bottom);
      if (end > top) R(wx, top, 1, end - top, colour);
    };
    if (gap) {
      col(4, 26, METRO.trainBogie);
      continue;
    }
    col(0, 2, METRO.trainShade);
    col(2, 26, METRO.train);
    // Doors at a quarter and three quarters of each car, windows between.
    const door = (seg >= 14 && seg < 22) || (seg >= 42 && seg < 50);
    if (door) {
      col(5, 22, METRO.trainDoor);
      if (seg === 17 || seg === 45) col(5, 22, METRO.trainShade);
      if ((seg >= 15 && seg < 17) || (seg >= 19 && seg < 21) || (seg >= 43 && seg < 45) || (seg >= 47 && seg < 49)) col(8, 8, lit ? LAMP : METRO.trainBand);
    } else {
      col(7, 9, METRO.trainBand);
      if (lit && (seg % 7) > 1) col(8, 7, LAMP);
    }
    col(23, 2, METRO.trainStripe);
    col(28, 2, METRO.trainShade);
    // Bogies and wheels under each car.
    if (seg < 12 || seg > 52) col(30, 6, (dx % 6 < 4) ? METRO.trainBogie : INK);
  }
  // The front: a dark windscreen, the line number in white on blue.
  const fx = x + CAR - 4;
  if (fx >= clip.x0 && fx < clip.x1) {
    R(fx, y + 4, 4, 12, METRO.trainBand);
    R(fx - 8, y + 2, 7, 7, PAINT.tbane);
    digit(fx - 6, y + 3, line, WHITE);
    R(fx + 2, y + 20, 2, 2, LAMP);
  }
  if (lit) light(Math.max(x, clip.x0), y + 8, Math.max(0, Math.min(x + CAR, clip.x1) - Math.max(x, clip.x0)), 7, "soft");
}

/** A rat leaping out of the track: up from between the rails after the gravel twitches, and down again. */
function trackRat(e: Enemy, t: number) {
  const l = leap(e, t);
  const floor = (P + 1) * TILE;
  if (l.ripple && !view.reduced && Math.floor(t / 5) % 2) for (const dx of [-4, 0, 4]) R(e.x + dx, floor - 2 - ((t + dx) % 2), 2, 1, METRO.ballast);
  if (l.up <= 0) return;
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  const falling = leap(e, t + 1).up < l.up;
  R(x + 2, y - 9, 6, 8, PALETTE.rockDark);
  R(x + 3, y - 10, 4, 1, PALETTE.rockDark);
  R(x + 3, y - (falling ? 1 : 12), 4, 2, PALETTE.rockDark);
  R(x + 4, y - (falling ? 0 : 12), 1, 1, INK);
  R(x + 7, y - 6, 3, 1, mix(PALETTE.rockDark, WHITE, 0.3));
  R(x + 1, y - (falling ? 11 : 2), 1, 4, mix(METRO.kioskLight, WHITE, 0.5));
}

/** A shopping trolley rolling by itself: a wire basket, a red handle, four small wheels. */
function trolley(e: Enemy) {
  const x = Math.round(e.x - 6);
  const y = Math.round(e.y);
  const at = (dx: number) => (e.dir > 0 ? x + dx : x + 11 - dx);
  R(x + 1, y - 9, 10, 1, METRO.trolley);
  R(x + 1, y - 4, 10, 1, METRO.trolley);
  for (let k = 1; k < 11; k += 3) R(x + k, y - 9, 1, 6, METRO.trolley);
  R(at(0), y - 11, 1, 3, METRO.trolley);
  R(at(-1), y - 12, 2, 1, METRO.kiosk);
  const roll = view.reduced ? 0 : Math.floor(e.x / 2) % 2;
  for (const wx of [x + 2, x + 9]) R(wx, y - 2, 2, 2, roll ? INK : METRO.steelDark);
}

/** An umbrella blown inside out, tumbling along in the draught from the tunnels, its ribs out: it hurts to land on. Red, or blue. */
function umbrella(e: Enemy, t: number) {
  const x = Math.round(e.x - 6);
  const y = Math.round(e.y);
  const cloth = e.def.c % 2 ? METRO.kiosk : PAINT.tbane;
  const light = mix(cloth, WHITE, 0.35);
  const spin = view.reduced ? 0 : Math.floor(t / 8 + e.x / 6) % 2;
  if (spin) {
    // Canopy up, ribs sticking out of its edge.
    for (let k = 0; k < 5; k++) R(x + 6 - Math.round(k * 1.2), y - 8 + k, 1 + Math.round(k * 2.4), 1, k === 0 ? light : cloth);
    for (const dx of [-1, 3, 8, 12]) R(x + dx, y - 5, 1, 3, WHITE);
    R(x + 6, y - 3, 1, 3, METRO.steelDark);
    R(x + 5, y - 1, 3, 1, METRO.steelDark);
  } else {
    // Inside out: the cloth a cup, the ribs up like spikes, the handle on the ground.
    R(x + 1, y - 6, 10, 4, cloth);
    R(x + 2, y - 6, 4, 1, light);
    for (const dx of [0, 3, 7, 10]) R(x + dx + 1, y - 10, 1, 4, WHITE);
    R(x + 6, y - 2, 1, 2, METRO.steelDark);
    R(x + 7, y - 1, 3, 1, METRO.steelDark);
  }
}

/** A pigeon on the wing under the vault. */
function pigeonFlying(e: Enemy, t: number) {
  const x = Math.round(e.x);
  const y = Math.round(e.y) - 4;
  const flap = view.reduced ? 0 : Math.floor(t / 6) % 2;
  R(x - 3, y - 1, 7, 3, PALETTE.iron);
  R(x + e.dir * 4 - (e.dir < 0 ? 1 : 0), y - 2, 2, 2, mix(PALETTE.iron, INK, 0.2));
  R(x + e.dir * 6 - (e.dir < 0 ? 0 : 1), y - 1, 1, 1, PALETTE.sailStripe);
  R(x - 6, y + (flap ? -3 : 1), 5, 2, mix(PALETTE.iron, INK, 0.25));
  R(x + 1, y + (flap ? -3 : 1), 5, 2, mix(PALETTE.iron, INK, 0.25));
  R(x - e.dir * 4 - 1, y, 2, 1, mix(PALETTE.iron, INK, 0.3));
}

/** The flourish: the lamps along platform 3 come on bright one after another, the cabinet's lamps all go green, and the board over the end spells the rune. */
function flourish(age: number) {
  const k = Math.min(1, age / 80);
  for (let i = 0; i < 12; i++) {
    if (i / 12 > k) break;
    const x = (229 + i * 3.6) * TILE;
    R(x, 10 * TILE + 2, 16, 3, WHITE);
    light(x - 8, U * TILE - 3, 32, 3, "pool");
  }
  for (let i = 0; i < 3; i++) R(269 * TILE + 4 + i * 6, (U - 3) * TILE + 6, 3, 3, PLANT_GREEN);
  // A board hung over the end: its lamps spell S.
  const bx = 262 * TILE;
  const by = 11 * TILE;
  R(bx + 10, 10 * TILE, 1, 16, METAL.wire);
  R(bx + 30, 10 * TILE, 1, 16, METAL.wire);
  R(bx, by, 40, 24, METRO.board);
  if (age > 20 || view.reduced) for (const [dx, dy] of [[24, 3], [20, 5], [16, 7], [20, 9], [24, 11], [20, 13], [16, 15], [12, 17]]) R(bx + dx - 2, by + dy + 1, 3, 2, METRO.led);
}

export const STORTINGET: LevelDef = {
  id: "stortinget",
  rune: 7,
  name: "Stortinget",
  landmark: { nb: "T-banestasjonen", en: "The T-bane station" },
  place: { nb: "T-banestasjonen under sentrum", en: "The T-bane station under the centre" },
  sky: "day",
  map: MAP,
  legend: { solid: "#WGZE", oneWay: "=-", water: "v" },
  ramps: [ESC1, ESC2],
  carriers: CARRIERS,
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  hazards: HAZARDS,
  surfaceAt,
  haze: [0, 0, 0],
  underground: true,
  flourish: 120,
  floor: (x) => {
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE)));
    return Math.min(ROWS * TILE, (floorRow(c) + 2) * TILE + 8);
  },
  signs: [
    {
      label: { nb: "Stortinget", en: "Stortinget" },
      lines: { nb: ["Alle linjene i byen går gjennom denne stasjonen.", "Rulletrappene går ned. Én av dem går opp."], en: ["Every line in the city runs through this station.", "The escalators go down. One of them goes up."] }
    },
    {
      label: { nb: "Strømførende", en: "Live rail" },
      lines: { nb: ["Ikke gå i sporet. Den gule skinna er strømførende.", "Tavla sier når neste tog står her."], en: ["Keep out of the track. The yellow rail is live.", "The board says when the next train stands here."] }
    },
    {
      label: { nb: "Dørene lukkes", en: "Dørene lukkes" },
      lines: { nb: ["Dørene lukkes. Det sier de alltid.", "Toget i nedre spor går i depot. Bytt tak underveis."], en: ["The doors are closing. They always say so.", "The lower train goes to the depot. Change roofs on the way."] }
    }
  ],
  doors: [
    { id: "tbane", tile: "t", sign: "T-banen", href: "#kart" },
    { id: "quintle", tile: "k", sign: "Quintle", href: "" }
  ],
  art: {
    far: () => farDark(),
    mid: () => farPlatforms(),
    near: () => nearColumns(),
    back(v) {
      hall(v);
      shaft();
      platformWall(60, 100, P * TILE, 0);
      tunnelWall(101, 127);
      platformWall(128, 175, P * TILE, 1);
      cavern();
      platformWall(228, COLS - 1, U * TILE, 2);
      // The depot's siding, sunk below platform 3: its own tiled wall down to its floor, and a dark mouth where it goes in under the end.
      tiles(254 * TILE, 264 * TILE, U * TILE - 6, P * TILE - 6, null);
      R(254 * TILE, P * TILE - 6, 10 * TILE, 6, METRO.bed);
      // The open crossings, and the one under the grating: dark down to the track.
      for (const [c0, c1] of [[63, 64], [79, 81], [153, 157], [258, 260]] as const) R(c0 * TILE, P * TILE, (c1 - c0 + 1) * TILE, TILE, METRO.vault);
      kiosk(v);
      pastTheEnd(v);
      escalator(ESC1, BELT.down, v.t);
      escalator(ESC2, BELT.up, v.t);
    },
    front(v) {
      board(74, 14 * TILE + 5, nextLocal(0, v.t), 1, v.t);
      board(167, 12 * TILE, nextLocal(1, v.t), 1, v.t);
      // The walkway's belt, moving against him.
      const tt = view.reduced ? 0 : v.t;
      for (let x = WALKWAY.x0; x < WALKWAY.x1; x++) {
        R(x, WALKWAY.y, 1, 2, METRO.steps);
        if ((((x - Math.floor(tt * BELT.walkway)) % 6) + 6) % 6 === 0) R(x, WALKWAY.y, 1, 1, METRO.steel);
      }
      R(WALKWAY.x0, WALKWAY.y - 12, WALKWAY.x1 - WALKWAY.x0, 2, METRO.handrail);
      for (const x of [WALKWAY.x0, WALKWAY.x1 - 2]) R(x, WALKWAY.y - 12, 2, 12, METRO.steel);
    },
    ground: () => ({ top: METRO.floor, dot: METRO.floorDark, fill: METRO.concrete }),
    tile(t, c, r, x, y, m) {
      if (t === "#") {
        if (r === P + 1 && (m.tileAt(c, r - 1) === "-" || m.tileAt(c, r - 1) === ".")) trenchFloor(c, x, y, VIEW_T.t);
        else floorTile(c, r, x, y, m);
        return true;
      }
      if (t === "W") {
        concreteTile(c, r, x, y, m);
        return true;
      }
      if (t === "E") {
        // Under an escalator: the machinery's steel casing, panelled, with its rivets.
        R(x, y, TILE, TILE, UNDER);
        R(x, y + 15, TILE, 1, METRO.concreteDark);
        R(x + 15, y, 1, TILE, METRO.concreteDark);
        R(x + 2, y + 2, 1, 1, METRO.steel);
        R(x + 12, y + 12, 1, 1, METRO.steel);
        if ((c + r) % 2 === 0) for (let k = 2; k < 14; k++) R(x + k, y + k, 1, 1, METRO.concreteDark);
        return true;
      }
      if (t === "v") {
        bedTile(c, x, y, m.tileAt(c, r - 1) !== "v", VIEW_T.t);
        return true;
      }
      if (t === "G") {
        gateTile(x, y);
        return true;
      }
      if (t === "Z") {
        cabinetTile(c, r, x, y, m);
        return true;
      }
      if (t === "-") {
        R(x, y, TILE, 3, METRO.steelDark);
        for (let k = 1; k < TILE; k += 3) R(x + k, y + 1, 2, 1, METRO.vault);
        R(x, y, TILE, 1, METRO.steel);
        return true;
      }
      return false;
    },
    ledges: {
      "=": { body: METRO.steelDark, top: METRO.steel, edge: INK, joint: METRO.steps }
    },
    carrier(i, at, v) {
      const d = CARRIERS[i];
      if (!carrierShown(d, v.t)) return;
      const local = i < LOCALS.length;
      const clip = local ? { x0: MOUTH.local, x1: MOUTH.far } : { x0: MOUTH.cavern, x1: MOUTH.far };
      train(at, local ? 1 : 5, clip, local && at.x + CAR > DIP, true);
    },
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "trackrat") trackRat(e, v.t);
      else if (e.def.look === "trolley") trolley(e);
      else if (e.def.look === "umbrella") umbrella(e, v.t);
      else if (e.def.look === "pigeonfly") pigeonFlying(e, v.t);
      else return false;
      return true;
    },
    flourish: (age) => flourish(age)
  }
};

/** The clock for the tiles' sparks, which the tile drawing is not given: kept up by `far`. */
const VIEW_T = { t: 0 };
const farArt = STORTINGET.art.far!;
STORTINGET.art.far = (v) => {
  VIEW_T.t = v.t;
  farArt(v);
};
void carrierAt;
