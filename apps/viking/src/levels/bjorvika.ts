import { column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef, Lift, Travel } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Hazard } from "@larshansen/pixelkit/hazard";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, PAINT, STAND, WHITE } from "@larshansen/pixelkit/palette";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import * as S from "@larshansen/pixelkit/swatches/site";
import { pulseAge, pulsePhase, type Pulse } from "@larshansen/pixelkit/timed";
import type { Zone } from "@larshansen/pixelkit/zone";
import { keepBoxes, windingUp, type Enemy, type EnemyDef, type Shot } from "../game/enemies";
import { tbaneDoor } from "../render/furniture";
import { parts } from "../alive/parts";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 15, rune N: Bjørvika, in the evening, high up. Its one idea: crane hooks that carry him, and
// he chooses when to let go. A hook travels on a beat between two landings, slow at each end; standing
// on its block he rides, and stepping or jumping off is his to choose, so the skill is the moment, and
// every landing over the drop is four tiles wide or more. Ekeberg's gusts come back on the open floors.
//
//   #  the quay's granite   U  concrete: the towers, their floors and slabs   I  a steel girder
//   N  the safety net   =  scaffold boards, a beam, the crane's rungs   ~  the dock far below
//   t  T-banen   b  bench   $  skilling   &  brown cheese
//
// Sections: the quay at street level, the Opera's white slope far off and a sign; the site gate and the
// hoist up the first tower's face; its open floors, rebar and a welder whose sparks fall on a beat; the
// first hook, over a bay in the floor with a net under it, where a miss costs nothing; two hooks between
// three towers over the drop; a floor with shafts, loose sheets of steel sliding over them, and gusts;
// the riveters' girder (the shield); the site hut on the roof with its bench; the jib's girder out from the
// roof, with two more riveters over its far end (the shield twice); the long traverse of three hooks under
// the top crane's jib, on beats of their own and in a gust, a flag before it; and up the crane to the rune
// at its cab, the fjord and the town below at dusk.

const COLS = 272;
const ROWS = 32;
/** The quay; the first tower's open floor; the upper slab, the towers' tops and the girder; the roof. */
export const G = 26;
export const F1 = 18;
export const F2 = 14;
export const ROOF = 10;
/** The dock's water, far below the drops. */
const DOCK = 29;
const b = mapBuilder(COLS, ROWS);
const dock = (c0: number, c1: number) => b.fill(c0, c1, DOCK, ROWS - 1, "~");

// --- The quay ----------------------------------------------------------------------------------------
b.ground(0, 35, G);
// --- The first tower: finished floors to F1, its open floor, the bay with the net, the upper slab --------
b.ground(36, 97, F1, "U");
/** The bay in the first tower's floor that the first hook crosses: open down to the net. */
export const BAY = [75, 83] as const;
b.fill(BAY[0], BAY[1], F1, F1 + 2, ".").run(BAY[0], BAY[1], F1 + 3, "N");
b.run(BAY[0], BAY[0] + 1, F1 + 1, "=");
// The welder's beam over the floor; the step up and the upper slab.
b.run(52, 57, F2, "=");
b.run(87, 88, F2 + 2, "=").run(90, 97, F2, "U");
// --- Two towers across the drop ------------------------------------------------------------------------
dock(98, 107);
b.ground(108, 117, F2, "U");
dock(118, 127);
// --- The third tower: a floor with three shafts, sheets over them, the gusts ---------------------------
b.ground(128, 171, F2, "U");
/** The shafts in the third tower's floor, by their first column; each five tiles across. */
export const SHAFTS = [140, 151, 162];
for (const c of SHAFTS) b.fill(c, c + 4, F2, ROWS - 1, ".");
// --- The girder, the riveters' platform, the roof -------------------------------------------------------
b.run(172, 191, F2, "I");
dock(172, 191);
b.ground(192, 199, F2, "U").ground(200, 215, ROOF, "U");
b.run(197, 199, ROOF + 2, "=");
// --- The jib's girder out from the roof, the riveters' catwalk over its far end ----------------------------------
/** The second girder: out from the roof's end to the traverse, at the roof's height. */
export const GIRDER_2 = [216, 231] as const;
b.run(GIRDER_2[0], GIRDER_2[1], ROOF, "I");
dock(GIRDER_2[0], GIRDER_2[1]);
// --- The traverse, and the top crane ----------------------------------------------------------------------
dock(232, 255);
b.ground(256, COLS - 1, ROOF, "U");
b.run(261, 264, ROOF - 2, "=").run(261, 264, ROOF - 4, "=").run(258, 268, ROOF - 6, "=");

/** The bracteate's column: high over the second hook of the traverse. */
export const BRACTEATE = 244;
// Marks: the start, the door, signs, flags, the bench, the rune, the bracteate, the cheese.
b.put(2, G - 1, "t").put(4, G - 1, "S");
b.put(7, G - 1, "i").put(31, G - 1, "i").put(91, F2 - 1, "i");
b.put(20, G - 1, "f").put(40, F1 - 1, "f").put(70, F1 - 1, "f").put(93, F2 - 1, "f").put(138, F2 - 1, "f").put(170, F2 - 1, "f");
b.put(213, ROOF - 1, "f").put(GIRDER_2[1], ROOF - 1, "f").put(259, ROOF - 1, "f");
b.put(207, ROOF - 1, "b");
b.put(265, ROOF - 7, "r").put(BRACTEATE, 3, "o").put(82, F1 + 2, "&");

// Skilling: along the quay, up the hoist, along the open floor and over the rebar, in the bay and over
// the first hook, along each hook's ride over the drop, over the sheets, along the girder, on the roof,
// along the traverse, up the crane.
const COINS: [number, number][] = [
  [9, 25], [12, 24], [16, 25], [24, 25], [27, 24],
  [34, 22], [35, 20],
  [38, 17], [44, 17], [46, 15], [47, 15], [53, 17], [58, 17], [62, 17], [67, 17],
  [76, 15], [79, 15], [82, 15], [78, 20], [80, 20],
  [89, 15], [95, 13],
  [100, 12], [103, 12], [106, 12], [112, 13],
  [120, 12], [123, 12], [126, 12],
  [131, 13], [142, 12], [144, 12], [148, 13], [153, 12], [155, 12], [159, 13], [164, 12], [166, 12],
  [175, 13], [180, 13], [185, 13], [189, 13],
  [196, 13], [198, 11], [203, 9], [209, 9],
  [219, 9], [223, 9], [227, 9],
  [233, 8], [236, 8], [242, 8], [245, 8], [252, 8], [254, 8],
  [262, 7], [263, 5], [260, 3]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- What moves -----------------------------------------------------------------------------------------

/** The hoist up the first tower's face, from the quay to its open floor: never much over four seconds away. */
export const HOIST: Lift = { kind: "lift", x: 34 * TILE, w: 2 * TILE, bottom: G * TILE, top: F1 * TILE, speed: 1.2, wait: 50 };

/**
 * A crane hook: its block two tiles wide, level with the landings, there and back on its beat over the
 * gap between them, slow at each end. At the near end it comes to a tile from the landing's edge, so on is
 * a hop at the moment he picks; at the far end it comes right up to the next landing (or to a tile from the
 * next hook), and off is a step. `c0` and `c1` are the gap's first column and the landing's beyond it.
 */
const hook = (c0: number, c1: number, row: number, period: number, offset: number): Travel => ({
  kind: "travel",
  from: { x: (c0 + 1) * TILE, y: row * TILE },
  to: { x: (c1 - 2) * TILE, y: row * TILE },
  w: 2 * TILE,
  period,
  offset
});
/** The first hook, over the bay and its net: from the floor's end to the floor beyond it. */
export const HOOK_1 = hook(75, 84, F1, 300, 257);
/** Across the drop: from the upper slab to the second tower, and from it to the third. */
export const HOOK_2 = hook(98, 108, F2, 300, 230);
export const HOOK_3 = hook(118, 128, F2, 300, 229);
/**
 * The traverse under the top crane's jib: three hooks in a row, a tile apart where they meet, not on one
 * beat: the middle one swings twice as quick as the other two, so it waits at an end for half as long, and
 * he must be on his way to it as it comes in; it meets each of the others on every other swing. (Each
 * meets the next every four seconds; the offsets are set so the scripted route meets each hook as it comes.)
 */
const TRAVERSE = 240;
export const HOOK_5 = hook(232, 240, ROOF, TRAVERSE, 49);
export const HOOK_6 = hook(240, 248, ROOF, TRAVERSE / 2, 49);
export const HOOK_7 = hook(248, 256, ROOF, TRAVERSE, 109);
export const HOOKS = [HOOK_1, HOOK_2, HOOK_3, HOOK_5, HOOK_6, HOOK_7];

/** Loose sheets of steel over the shafts, sliding across in the wind: flush with the floor, a tile and a quarter wide, from one side of the shaft to the other. */
const SHEET_PERIOD = 120;
export const SHEETS: Travel[] = SHAFTS.map((c, i) => ({ kind: "travel", from: { x: c * TILE, y: F2 * TILE }, to: { x: (c + 5) * TILE - 20, y: F2 * TILE }, w: 20, period: SHEET_PERIOD, offset: [25, 1, 98][i] }));

export const CARRIERS: CarrierDef[] = [HOIST, HOOK_1, HOOK_2, HOOK_3, ...SHEETS, HOOK_5, HOOK_6, HOOK_7];

/** The gusts over the shafts' floor, against him: four seconds still, a second of dust, a second of wind; three of the sheets' rounds to each. */
export const GUST_BEAT: Pulse = { rest: 240, warn: 60, live: 60, offset: 271 };
/**
 * And over the traverse, against him on the hooks: five seconds still, a second of dust, a second of wind,
 * on a beat that is not the hooks', so a meeting of two hooks sometimes falls in it and must be let go by.
 */
export const TRAVERSE_GUST: Pulse = { rest: 300, warn: 60, live: 60, offset: 260 };
export const GUSTS: Zone[] = [
  { x: 139 * TILE, y: 9 * TILE, w: 33 * TILE, h: (F2 - 9) * TILE, push: { x: -0.65, y: 0 }, beat: GUST_BEAT },
  { x: 232 * TILE, y: (ROOF - 5) * TILE, w: 24 * TILE, h: 5 * TILE, push: { x: -0.5, y: 0 }, beat: TRAVERSE_GUST }
];

/** The rebar sticking up out of the open floor; the welder's sparks falling past the beam onto it, on a beat. */
export const REBAR: Hazard = { x: 46 * TILE + 4, y: F1 * TILE - 6, w: 10, h: 6 };
export const REBAR_2: Hazard = { x: 68 * TILE + 4, y: F1 * TILE - 6, w: 10, h: 6 };
/** On the third tower, two tiles in from the edge: where he comes down if he jumps off the hook instead of stepping off at its end. */
export const REBAR_3: Hazard = { x: 130 * TILE + 5, y: F2 * TILE - 6, w: 16, h: 6 };
export const SPARKS: Hazard = { x: 55 * TILE + 2, y: (F2 + 1) * TILE, w: 12, h: (F1 - F2 - 1) * TILE, beat: { rest: 150, warn: 60, live: 60, offset: 126 } };
export const HAZARDS: Hazard[] = [REBAR, REBAR_2, REBAR_3, SPARKS];

/**
 * A crow over the quay, a pigeon and a rat by the gate; a pigeon and a rat on the open floor; a pigeon on
 * the second tower, each away from where the hooks come and go (the third tower's landing has rebar
 * instead, where a man who jumps off the hook comes down); a pigeon on
 * the girder; the two riveters on the next floor's beam over its far end
 * (further back, out of his reach from the girder), who throw their bolts straight down along it at where a
 * man coming will be, and not at one nearly under them (four tiles: from nearer, a bolt would come down too
 * steeply for the shield) or past them; two more on the jib's catwalk over the second girder's far end; a
 * pigeon by the top crane.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "flyer", look: "crow", c: 10, r: G - 4, range: 3, rise: 8, period: 160 },
  { kind: "walker", look: "pigeon", c: 14, r: G - 1, range: 2 },
  { kind: "walker", look: "rat", c: 27, r: G - 1, range: 2 },
  { kind: "walker", look: "pigeon", c: 59, r: F1 - 1, range: 1 },
  { kind: "walker", look: "rat", c: 64, r: F1 - 1, range: 2 },
  { kind: "walker", look: "pigeon", c: 112.5, r: F2 - 1, range: 1 },
  { kind: "walker", look: "pigeon", c: 178, r: F2 - 1, range: 2 },
  { kind: "walker", look: "pigeon", c: 184, r: F2 - 1, range: 2, dir: -1 },
  { kind: "thrower", look: "riveter", c: 193, r: ROOF, period: 120, straight: true, lead: true, faces: -1, reach: 10, blind: 4 },
  { kind: "thrower", look: "riveter", c: 196, r: ROOF, period: 120, offset: 60, straight: true, lead: true, faces: -1, reach: 10, blind: 4 },
  // The jib's girder: two more on its catwalk, far apart on their beats, so a man raises the shield, walks
  // on, and raises it again.
  { kind: "thrower", look: "riveter", c: 226, r: ROOF - 4, period: 120, straight: true, lead: true, faces: -1, reach: 12, blind: 4 },
  { kind: "thrower", look: "riveter", c: 229, r: ROOF - 4, period: 120, offset: 60, straight: true, lead: true, faces: -1, reach: 12, blind: 4 },
  { kind: "walker", look: "pigeon", c: 268, r: ROOF - 1, range: 1 }
];

export const BJORVIKA_RULES = { COLS, ROWS };

// --- Art ----------------------------------------------------------------------------------------------------

/** The camera's top while he stands on the quay, about: the far layers are placed for it, and sink a little as he climbs. */
const CAM_Q = G * TILE - 112;
/** World y for something at screen y `s` with the camera on the quay: as he climbs, the view below opens. */
const fy = (s: number) => s + view.camY + (CAM_Q - view.camY) * 0.16;

/** The far shore across the fjord, low hills, lights coming on; the fjord below to the bottom, deeper further down, its glints and the town's lights on it. */
function far(v: View) {
  const horizon = fy(96);
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 10 + Math.round(6 * Math.sin(wx * 0.004 + 1) + 3 * Math.sin(wx * 0.017));
    column(x, horizon - h, horizon, S.shoreDark);
    column(x, horizon - h, horizon - h + 1, mix(S.shore, WHITE, 0.08));
    if (Math.floor(wx) % 23 === 0) light(x + view.camX, Math.round(horizon - h + 4 + (Math.floor(wx) % 5)), 1, 1);
  }
  const tt = view.reduced ? 0 : v.t;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    column(x, horizon, horizon + 400, S.fjord);
    // Swell in bands, darker the nearer (the further down), and the light of the far shore's windows on it.
    for (let k = 0; k < 9; k++) {
      const y = horizon + 6 + k * (6 + k * 2) + Math.round(1.5 * Math.sin(wx * 0.05 + k));
      column(x, y, y + 1 + (k >> 2), mix(S.fjord, S.fjordDeep, 0.35 + k * 0.07));
    }
    column(x, horizon + 120, horizon + 400, S.fjordDeep);
    if (Math.floor(wx) % 23 === 0) for (let k = 0; k < 4; k++) light(x + view.camX, Math.round(horizon + 2 + k * 3), 1, 1, "soft");
  }
  for (let i = 0; i < 40; i++) column(((i * 61 + Math.floor(tt / 35)) % (view.w + 20)) - 10, horizon + 3 + ((i * 7) % 11) * 9, horizon + 4 + ((i * 7) % 11) * 9, S.fjordLight);
  // An island, a ferry going out with its lights on, a sailing boat.
  const isle = layerX(900, 0.12);
  for (let k = -20; k <= 20; k++) column(isle + k, horizon + 8 - Math.round(4 * (1 - (k / 20) ** 2)), horizon + 9, S.shore);
  const ferry = layerX(300, 0.12) + (view.reduced ? 0 : Math.floor(v.t / 30) % 90);
  for (let k = 0; k < 9; k++) column(ferry + k, horizon + 30, horizon + 34, k === 8 ? S.fjordLight : WHITE);
  light(ferry + view.camX + 1, Math.round(horizon + 31), 6, 1);
  for (let k = 1; k < 12; k++) column(ferry - k * 2, horizon + 33 + (k % 2), horizon + 34 + (k % 2), S.fjordLight);
  const sail = layerX(1700, 0.12);
  column(sail, horizon + 52, horizon + 54, WHITE);
  for (let k = 0; k < 6; k++) column(sail + 1, horizon + 46 + k, horizon + 47 + k, mix(WHITE, S.fjord, k * 0.1));
}

/** The new town along the water: rows of lit blocks at the waterline, the Barcode's slim towers, the museum's leaning top, the Opera's white slope far off. */
function mid() {
  const base = fy(108);
  const f = 0.2;
  // Blocks along the water, below the towers: flat roofs, lit windows, their lights on the water.
  for (let x = -((view.camX >> 3) % 9); x < view.w; ) {
    const wx = layerWorldX(x, f);
    const n = Math.floor(wx / 11);
    const w = 7 + (n % 5);
    const h = 8 + ((n * 7) % 9);
    const wall = n % 3 === 0 ? S.townLight : mix(S.town, S.townLight, 0.4);
    for (let k = 0; k < w; k++) column(x + k, base + 14 - h, base + 16, wall);
    column(x, base + 14 - h, base + 15 - h, mix(wall, WHITE, 0.2));
    for (let y = base + 16 - h; y < base + 12; y += 4) if ((n + y) % 3) light(x + 2 + view.camX, y, w - 4, 1, "soft");
    x += w + 1;
  }
  // The Opera, far off at the start, as on the front page: its white marble roof rising out of the water in
  // a long slope to the flat top, the marble walls under it with their seams, the glass foyer under the high
  // part, lit, and the stage tower over it in its dotted cladding.
  const ox = layerX(4 * TILE, f);
  const roof = (k: number) => (k < 64 ? Math.round(k * 0.42) : 27);
  for (let k = 0; k < 96; k++) {
    const top = base + 2 - roof(k);
    column(ox + k, top, top + 2, S.opera);
    column(ox + k, top + 2, top + 3, S.operaShade);
    if (k < 48) column(ox + k, top + 3, base + 6, k % 8 === 0 ? mix(S.operaShade, S.town, 0.35) : mix(S.opera, S.operaShade, 0.55));
    else {
      // The foyer's glass, its mullions, and the light inside.
      column(ox + k, top + 3, base + 6, k % 4 === 0 ? mix(S.operaShade, S.town, 0.5) : mix(S.glass, S.glassLight, (k % 4) * 0.2));
      if (k % 4 === 2) light(ox + k + view.camX, top + 5, 1, base + 4 - top - 5, "soft");
    }
  }
  for (let k = 0; k < 22; k++) {
    const x = ox + 58 + k;
    column(x, base - 25 - 18, base - 25, k % 2 ? mix(S.opera, S.operaShade, 0.6) : S.operaShade);
    column(x, base - 25 - 18, base - 25 - 17, S.opera);
    for (let y = base - 41; y < base - 26; y += 3) if ((k + y) % 2) column(x, y, y + 1, mix(S.operaShade, S.town, 0.4));
  }
  // The Barcode: a row of slim towers of different heights, stripes of window, lit.
  for (let i = 0; i < 12; i++) {
    const x = layerX(60 * TILE + i * 70, f);
    if (x < -30 || x > view.w + 30) continue;
    const w = 14 + ((i * 7) % 9);
    const h = 40 + ((i * 13) % 26);
    for (let k = 0; k < w; k++) column(x + k, base - h, base, k % 4 === 0 ? S.town : mix(S.town, S.townLight, ((i + k) % 3) * 0.25));
    for (let y = base - h + 4; y < base - 2; y += 5) if ((i + y) % 3) light(x + 2 + view.camX, y, w - 4, 1, "soft");
  }
  // The museum by the water: tall, its top leaning out over the fjord.
  const mx = layerX(200 * TILE, f);
  for (let k = 0; k < 22; k++) column(mx + k, base - 70 + (k > 14 ? 0 : Math.max(0, 6 - k)), base, mix(S.town, INK, 0.12));
  for (let k = 0; k < 10; k++) column(mx + 22 + k, base - 70 + k, base - 56 + k, mix(S.town, INK, 0.12));
  for (let y = base - 60; y < base - 4; y += 9) light(mx + 4 + view.camX, y, 14, 1, "soft");
  // Other cranes over the town, small with distance, a red light at each jib's tip.
  for (let i = 0; i < 7; i++) {
    const x = layerX(i * 740 + 400, f);
    if (x < -40 || x > view.w + 40) continue;
    const h = 46 + ((i * 17) % 20);
    const c = mix(S.craneDark, S.town, 0.45);
    for (let y = base - h; y < base; y += 2) column(x + ((y >> 1) % 2), y, y + 1, c);
    column(x - 24, base - h - 2, base - h, c);
    for (let k = -24; k < 12; k++) column(x + k, base - h - 2, base - h - 1, c);
    light(x - 24 + view.camX, Math.round(base - h - 3), 1, 1, "lamp", "#ff5a44");
  }
}

/** Nearer and lower: the roofs of the blocks round the site, seen from above as he climbs, lit. */
function near() {
  const top = fy(146);
  for (let x = -((view.camX >> 2) % 13); x < view.w; ) {
    const wx = layerWorldX(x, 0.4);
    const n = Math.floor(wx / 23);
    const w = 18 + (n % 4) * 5;
    const h = (n * 13) % 22;
    const wall = mix(S.glass, S.shore, 0.35 + (n % 3) * 0.1);
    for (let k = 0; k < w; k++) column(x + k, top + h, top + 400, wall);
    column(x, top + h, top + h + 2, mix(S.concrete, S.shore, 0.5));
    for (let y = top + h + 6; y < top + h + 80; y += 7) for (let k = 3; k < w - 3; k += 5) if ((n + k + y) % 4 === 0) light(x + k + view.camX, y, 2, 3);
    x += w + 3;
  }
}

/** A tower's face below its open floors: floors of glass at dusk, a slab every three rows, some windows lit. */
function facade(c: number, r: number, x: number, y: number, top: number) {
  const depth = r - top;
  R(x, y, TILE, TILE, depth < 2 ? S.concrete : S.glass);
  if (depth < 2) {
    // The slab under the open floor and the floor below it, not glazed yet: board-marked concrete, tie holes, formwork left on.
    R(x, y + 10, TILE, 1, S.concreteDark);
    R(x + (c % 2) * 8, y + 4, 1, 6, S.concreteDark);
    for (let k = 3; k < TILE; k += 4) R(x + k, y + 13 + (k % 2), 1, 1, S.concreteDark);
    if (depth === 1) R(x, y, TILE, 1, mix(S.concrete, S.concreteDark, 0.5));
    if ((c + depth) % 3 === 0) {
      R(x + 4, y + 2, 8, 6, S.formwork);
      R(x + 4, y + 2, 8, 1, mix(S.formwork, WHITE, 0.3));
      R(x + 4, y + 7, 8, 1, S.formworkDark);
    }
    return;
  }
  if (depth % 3 === 2) {
    R(x, y, TILE, 3, S.concreteDark);
    return;
  }
  R(x + 7, y, 1, TILE, S.glassDark);
  R(x, y + 1, TILE, 1, mix(S.glass, S.glassLight, 0.4));
  if ((c * 7 + r * 3) % 5 === 0) light(x + 1, y + 3, 5, 9, "soft");
  if ((c * 3 + r * 5) % 7 === 0) light(x + 9, y + 3, 6, 9, "window");
}

/** Concrete: a slab's top at an open edge, rebar sticking out where the next floor will join. */
function concrete(c: number, r: number, x: number, y: number, map: { isSolid(c: number, r: number): boolean; tileAt(c: number, r: number): string }) {
  const top = !map.isSolid(c, r - 1);
  if (!top) {
    // Its body: which tower, and how far down.
    let t = r;
    while (t > 0 && map.tileAt(c, t - 1) === "U") t--;
    return facade(c, r, x, y, t);
  }
  R(x, y, TILE, TILE, S.concrete);
  R(x, y, TILE, 2, S.concreteLight);
  R(x, y + 2, TILE, 1, mix(S.concrete, WHITE, 0.15));
  R(x, y + 12, TILE, 1, S.concreteDark);
  for (let k = 3; k < TILE; k += 7) R(x + ((c * 5 + k) % 14), y + 6, 2, 1, S.concreteDark);
  if (!map.isSolid(c - 1, r)) {
    R(x, y, 1, TILE, S.concreteDark);
    R(x - 3, y + 6, 3, 1, S.rebar);
    R(x - 3, y + 10, 3, 1, S.rebar);
  }
  if (!map.isSolid(c + 1, r)) {
    R(x + TILE - 1, y, 1, TILE, S.concreteDark);
    R(x + TILE, y + 6, 3, 1, S.rebar);
    R(x + TILE, y + 10, 3, 1, S.rebar);
  }
}

/** Inside the tower where its floor is open: the bay over the net, the shafts going down. Dark concrete, a column, rebar. */
function interiors() {
  const room = (x0: number, x1: number, y0: number, y1: number) => {
    R(x0, y0, x1 - x0, y1 - y0, S.concreteDeep);
    for (let x = x0 + 6; x < x1; x += 22) R(x, y0, 3, y1 - y0, mix(S.concreteDeep, S.concrete, 0.25));
    for (let y = y0 + 14; y < y1; y += 48) R(x0, y, x1 - x0, 2, mix(S.concreteDeep, INK, 0.3));
    R(x0, y0, x1 - x0, 2, mix(S.concreteDeep, INK, 0.4));
  };
  room(BAY[0] * TILE, (BAY[1] + 1) * TILE, F1 * TILE, (F1 + 4) * TILE);
  for (const c of SHAFTS) room(c * TILE, (c + 5) * TILE, F2 * TILE, ROWS * TILE + 400);
}

/** The quay's granite: big slabs, a joint between each, worn lighter on top. */
function granite(c: number, r: number, x: number, y: number, map: { isSolid(c: number, r: number): boolean }) {
  R(x, y, TILE, TILE, S.granite);
  if (!map.isSolid(c, r - 1)) {
    R(x, y, TILE, 2, S.graniteLight);
    R(x, y + 2, TILE, 1, mix(S.granite, WHITE, 0.12));
  }
  if (c % 2 === 0) R(x, y, 1, TILE, S.graniteDark);
  R(x, y + 15, TILE, 1, S.graniteDark);
  R(x + ((c * 7 + r * 3) % 11) + 2, y + 6 + (r % 3) * 2, 3, 1, S.graniteDark);
}

/** A steel girder in red primer: its flanges, its web, the bolts along it. */
function girder(c: number, x: number, y: number) {
  R(x, y, TILE, 3, S.steelLight);
  R(x, y, TILE, 1, mix(S.steelLight, WHITE, 0.3));
  R(x, y + 3, TILE, 10, S.steelDark);
  R(x + 2, y + 3, TILE - 4, 10, S.steel);
  R(x, y + 13, TILE, 3, S.steelLight);
  R(x, y + 15, TILE, 1, S.steelDark);
  if (c % 2 === 0) for (const k of [5, 9]) R(x + 1, y + k, 1, 1, S.steelDark);
}

/** The safety net under the bay: orange mesh, sagging a little in the middle. */
function net(c: number, x: number, y: number) {
  const sag = c === BAY[0] || c === BAY[1] ? 0 : 1;
  for (let k = 0; k < TILE; k += 4) {
    R(x + k, y + sag, 1, 6, S.net);
    R(x + k + 2, y + sag, 1, 6, S.netDark);
  }
  R(x, y + sag, TILE, 1, S.net);
  R(x, y + 3 + sag, TILE, 1, S.netDark);
  R(x, y + 6 + sag, TILE, 1, S.net);
}

/** A crane's lattice: two chords and the zigzag between them, upright (a mast) or across (a jib). */
function lattice(x: number, y: number, len: number, across: boolean, color: string) {
  const dark = mix(color, INK, 0.35);
  if (across) {
    R(x, y, len, 1, color);
    R(x, y + 5, len, 1, color);
    for (let k = 0; k < len; k += 6) {
      for (let i = 0; i < 5; i++) R(x + k + i, y + 1 + i, 1, 1, dark);
      R(x + k, y + 1, 1, 4, color);
    }
    return;
  }
  R(x, y, 1, len, color);
  R(x + 7, y, 1, len, color);
  for (let k = 0; k < len; k += 6) {
    for (let i = 0; i < 6; i++) R(x + 1 + i, y + k + i, 1, 1, dark);
    R(x + 1, y + k, 6, 1, color);
  }
}

/** The cranes over the site, by their masts: where each stands, how high its jib is, how far it reaches either way. */
const CRANES = [
  { mast: 66, foot: F1, jib: 3, from: 60, to: 112 },
  { mast: 134, foot: F2, jib: 3, from: 113, to: 172 },
  { mast: 262, foot: ROOF, jib: 1, from: 205, to: 271 }
];

function crane(k: (typeof CRANES)[number], t: number) {
  const x = k.mast * TILE;
  const top = k.jib * TILE;
  lattice(x, top + 6, k.foot * TILE - top - 6, false, S.crane);
  lattice(k.from * TILE, top, (k.to - k.from) * TILE, true, S.crane);
  // The tower top over the jib, its stays, the counterweight on the short side.
  R(x + 1, top - 10, 6, 10, S.crane);
  for (let i = 0; i < 40; i++) R(x + 4 - i, top - 10 + Math.round(i * 0.25), 1, 1, S.cable);
  for (let i = 0; i < 40; i++) R(x + 4 + i, top - 10 + Math.round(i * 0.25), 1, 1, S.cable);
  const cw = k.to * TILE - 18;
  R(cw, top + 6, 14, 10, S.concreteDark);
  R(cw, top + 6, 14, 1, S.concrete);
  // A red light at the jib's tip, blinking.
  const on = view.reduced || Math.floor(t / 40) % 2 === 0;
  if (on) light(k.from * TILE + 1, top - 2, 2, 2, "lamp", "#ff5a44");
}

/** A hook's block, its sheave, the hook under it, and its cable up to the trolley on the jib. */
function hookArt(x: number, y: number, jib: number) {
  R(x + 15, jib + 6, 2, y - jib - 6, S.cable);
  R(x + 11, jib + 5, 10, 3, S.craneDark);
  // The block he rides: painted as a crane's block is, yellow with black stripes (order 22: where the way is a
  // thing that is not a platform, the yellow says he can go there); its standing top drawn by the page.
  R(x, y, 2 * TILE, 8, STAND.top);
  for (let k = 0; k < 2 * TILE + 4; k += 6) for (let i = 0; i < 5; i++) if (k - i >= 0 && k - i < 2 * TILE) R(x + k - i, y + 2 + i, Math.min(2, 2 * TILE - k + i), 1, STAND.mark);
  R(x, y + 7, 2 * TILE, 1, STAND.under);
  R(x + 12, y - 4, 8, 4, S.craneDark);
  R(x + 14, y - 3, 4, 2, S.cable);
  // The hook below the block.
  R(x + 15, y + 8, 3, 5, INK);
  R(x + 13, y + 13, 7, 2, INK);
  R(x + 12, y + 10, 2, 4, INK);
}

/** The hoist's cage: a yellow frame and mesh, its rack up the tower's face. */
function hoistArt(x: number, y: number) {
  R(x, y, 2 * TILE, 3, S.crane);
  R(x, y, 2 * TILE, 1, S.craneLight);
  R(x, y - 26, 2, 26, S.craneDark);
  R(x + 2 * TILE - 2, y - 26, 2, 26, S.craneDark);
  R(x, y - 26, 2 * TILE, 2, S.crane);
  for (let k = 4; k < 2 * TILE - 2; k += 4) R(x + k, y - 24, 1, 24, mix(S.fence, S.shore, 0.45));
  R(x + 6, y - 20, 18, 6, mix(S.glass, S.glassLight, 0.3));
}

/** A loose sheet of steel over a shaft: corrugated, its edge lifting a little in the wind. */
function sheetArt(x: number, y: number, w: number) {
  R(x, y, w, 4, S.sheet);
  R(x, y, w, 1, S.sheetLight);
  for (let k = 2; k < w; k += 4) R(x + k, y + 1, 1, 3, S.sheetDark);
  R(x, y + 4, w, 1, S.sheetDark);
}

/** The welder on his beam: kneeling, his mask down, his torch at the steel; sparks falling below on the beat. */
function welder(t: number) {
  const x = 54 * TILE + 6;
  const y = F2 * TILE;
  R(x, y - 9, 6, 6, S.overalls);
  R(x + 1, y - 13, 5, 4, S.hardhat);
  R(x + 5, y - 11, 3, 3, INK);
  R(x - 1, y - 3, 8, 3, S.overalls);
  R(x + 6, y - 6, 4, 2, S.overalls);
  const phase = pulsePhase(t, SPARKS.beat!);
  const { age } = pulseAge(t, SPARKS.beat!);
  const flick = view.reduced ? 1 : Math.floor(t / 3) % 2;
  if (phase !== "rest" || flick) light(x + 10, y - 6, 2, 2, "lamp", phase === "rest" ? "#9fd0ff" : S.sparkHot);
  if (phase === "rest") return;
  // The warning: a few sparks dripping off the beam's edge. Live: a curtain of them to the floor below.
  const n = phase === "warn" ? 3 : 12;
  for (let i = 0; i < n; i++) {
    const fall = view.reduced ? (i * 11) % 44 : (age * 3 + i * 17) % 44;
    const sx = SPARKS.x + ((i * 5) % SPARKS.w);
    const sy = SPARKS.y + (phase === "warn" ? fall % 12 : fall);
    light(sx, sy, 1, 2, "lamp", i % 3 ? S.spark : S.sparkHot);
  }
}

/** The rebar: rusty bars sticking up out of the slab, a few with orange caps. */
function rebarArt() {
  for (const { x, y, w, h } of [REBAR, REBAR_2, REBAR_3])
    for (let k = 1; k < w; k += 3) {
      R(x + k, y + (k % 2), 1, h - (k % 2), S.rebar);
      if (k % 6 === 1) R(x + k - 1, y - 1, 3, 2, S.rebarCap);
    }
}

/** The fence round the site at the quay, the gate open in it, its sign. */
function siteFence() {
  const y = G * TILE;
  for (let c = 26; c < 34; c++) {
    if (c === 30 || c === 31) continue;
    R(c * TILE, y - 28, TILE, 26, S.fence);
    R(c * TILE, y - 28, TILE, 1, WHITE);
    for (let k = 0; k < TILE; k += 3) R(c * TILE + k, y - 27, 1, 25, mix(S.fence, S.shore, 0.25));
    R(c * TILE, y - 2, TILE, 2, S.graniteDark);
  }
  // Its sign's stripes orange and black, not yellow: yellow is the paint on what he stands on (order 22).
  R(29 * TILE, y - 18, 2 * TILE, 4, S.net);
  for (let k = 0; k < 2 * TILE; k += 4) R(29 * TILE + k, y - 18, 2, 4, S.stripe);
}

/** The site hut on the roof: a blue container, its door open, a lit window, the bench inside. */
function hut() {
  const x0 = 202 * TILE;
  const x1 = 210 * TILE;
  const y = ROOF * TILE;
  R(x0, y - 44, x1 - x0, 44, S.hut);
  for (let x = x0 + 2; x < x1; x += 4) R(x, y - 44, 1, 44, S.hutDark);
  R(x0, y - 44, x1 - x0, 2, S.hutLight);
  R(x0 + 30, y - 34, x1 - x0 - 60, 34, mix(S.hutDark, INK, 0.45));
  light(x1 - 22, y - 34, 12, 8, "window");
  R(x0 - 2, y - 46, x1 - x0 + 4, 3, S.hutDark);
}

/** The riveters' platform: a box of bolts, a compressor, its hose; over it, the next floor's beam they stand on, further back. */
function crewKit() {
  const y = F2 * TILE;
  const by = (ROOF + 1) * TILE;
  R(191 * TILE, by, 7 * TILE, 4, S.steelDark);
  R(191 * TILE, by, 7 * TILE, 1, S.steel);
  for (const c of [191, 197]) R(c * TILE + 4, by + 4, 4, y - by - 4, mix(S.steelDark, S.concreteDeep, 0.4));
  R(192 * TILE + 4, y - 8, 10, 8, S.formworkDark);
  R(192 * TILE + 5, y - 9, 8, 2, S.bolt);
  R(198 * TILE, y - 10, 14, 10, PAINT.red);
  R(198 * TILE, y - 10, 14, 2, mix(PAINT.red, WHITE, 0.3));
  for (let k = 0; k < 20; k++) R(196 * TILE + k, y - 2 - Math.round(Math.sin(k * 0.4) * 1.5), 1, 1, INK);
  // The jib's catwalk over the second girder's far end, hung from the jib on rods.
  const cy = (ROOF - 3) * TILE;
  R(224 * TILE, cy, 7 * TILE, 4, S.steelDark);
  R(224 * TILE, cy, 7 * TILE, 1, S.steel);
  for (const c of [224, 230]) R(c * TILE + 6, TILE + 4, 2, cy - TILE - 4, S.cable);
  for (let x = 224 * TILE; x < 231 * TILE; x += 6) R(x, cy - 8, 1, 8, S.steel);
  R(224 * TILE, cy - 8, 7 * TILE, 1, S.steel);
}

/** The top crane's cab, its windows lit, the walkway in front of it. */
function cab() {
  const x = 264 * TILE;
  const y = (ROOF - 6) * TILE;
  R(x, y - 34, 3 * TILE, 34, S.hardhat);
  R(x, y - 34, 3 * TILE, 2, WHITE);
  R(x + 3, y - 28, 3 * TILE - 6, 12, S.glass);
  light(x + 4, y - 27, 3 * TILE - 8, 10, "soft");
  R(x - 2, y - 36, 3 * TILE + 4, 3, S.craneDark);
}

/** The wind over the shafts: streaks of dust and a scrap of paper or two, thin as it warns, thick while it pushes. */
function gust(z: Zone, t: number) {
  const phase = pulsePhase(t, z.beat!);
  if (phase === "rest") return;
  const n = phase === "warn" ? 10 : 26;
  const tt = view.reduced ? 0 : t;
  for (let i = 0; i < n; i++) {
    const x = z.x + z.w - ((i * 97 + tt * (phase === "warn" ? 3 : 5)) % z.w);
    const y = z.y + ((i * 37) % z.h);
    R(Math.round(x), y, i % 5 === 0 ? 3 : 6, 1, mix(S.concreteLight, WHITE, 0.3));
    if (i % 7 === 0) R(Math.round(x) - 2, y - 1, 2, 2, S.fence);
  }
}

/** A riveter on the girder: an orange vest with a hi-vis stripe, a white hard hat, a bolt raised to throw. 11 x 18. */
function riveter(e: Enemy, t: number) {
  const r = parts(e, 11);
  const up = windingUp(e, t);
  r(2, -5, 3, 5, ENEMY.plum);
  r(6, -5, 3, 5, ENEMY.plum);
  r(1, -11, 9, 6, ENEMY.orange);
  r(1, -8, 9, 1, ENEMY.poisonLight);
  r(3, -15, 6, 4, ENEMY.orangeLight);
  r(2, -17, 8, 2, ENEMY.white);
  r(3, -18, 6, 1, ENEMY.white);
  r(7, -14, 1, 1, ENEMY.eye);
  if (up) {
    r(-1, -19, 2, 8, ENEMY.orange);
    r(-2, -21, 4, 2, ENEMY.white);
  } else r(10, -10, 2, 5, ENEMY.orange);
}
function boltArt(s: Shot, t: number) {
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  const turn = view.reduced ? 0 : Math.floor(t / 4) % 2;
  R(x - 3, y - 1 + turn, 6, 2, ENEMY.plumLight);
  R(x - 1, y - 2, 3, 4, ENEMY.plum);
}

const BOARDS: LedgeLook = { body: S.formwork, top: mix(S.formwork, WHITE, 0.3), edge: S.formworkDark, joint: S.formworkDark };

export const BJORVIKA: LevelDef = {
  id: "bjorvika",
  rune: 14,
  name: "Bjørvika",
  landmark: { nb: "Kranene", en: "The cranes" },
  place: { nb: "Bjørvika", en: "Bjørvika" },
  sky: "evening",
  map: MAP,
  legend: { solid: "#UI", oneWay: "=N", water: "~" },
  ramps: [],
  carriers: CARRIERS,
  // The hooks come in to a landing at each end of their swing, and sound so (order 20).
  landings: HOOKS.map((h) => CARRIERS.indexOf(h)),
  timed: [],
  cannons: [],
  // Every enemy here keeps the box it had before order 18: growing them cost the sloppy player more than 0.3 hearts a run.
  enemies: keepBoxes(ENEMIES),
  zones: GUSTS,
  hazards: HAZARDS,
  floor: (x) => (x < 36 * TILE ? (G + 3) * TILE : (DOCK + 2) * TILE),
  signs: [
    {
      label: { nb: "Bjørvika", en: "Bjørvika" },
      lines: { nb: ["Operaen, biblioteket, Munch.", "Og kraner. Mest kraner."], en: ["The Opera, the library, Munch.", "And cranes. Mostly cranes."] }
    },
    {
      label: { nb: "Byggeplass", en: "Building site" },
      lines: { nb: ["Adgang forbudt for uvedkommende.", "Hjelm påbudt. Den har du."], en: ["No admittance.", "Helmet required. You have one."] }
    },
    {
      label: { nb: "Kroken", en: "The hook" },
      lines: { nb: ["Kroken går fram og tilbake.", "Når du går av, bestemmer du."], en: ["The hook goes there and back.", "When you get off is up to you."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => far(v),
    mid: () => mid(),
    near: () => near(),
    back(v) {
      tbaneDoor(v.doors.get("tbane"));
      interiors();
      siteFence();
      // The hoist's rack up the first tower's face.
      R(36 * TILE - 3, F1 * TILE, 3, (G - F1) * TILE, S.craneDark);
      for (let y = F1 * TILE; y < G * TILE; y += 4) R(36 * TILE - 3, y, 3, 1, S.cable);
      // The open floor's columns, to the height of the next floor, formwork on top.
      for (const c of [44, 62, 72, 86]) {
        R(c * TILE + 4, F2 * TILE + 4, 8, (F1 - F2) * TILE - 4, S.concrete);
        R(c * TILE + 4, F2 * TILE + 4, 2, (F1 - F2) * TILE - 4, S.concreteLight);
        R(c * TILE + 3, F2 * TILE, 10, 4, S.formwork);
      }
      for (const k of CRANES) crane(k, v.t);
      welder(v.t);
      hut();
      crewKit();
      cab();
    },
    front(v) {
      rebarArt();
      for (const z of GUSTS) gust(z, v.t);
    },
    ground: () => ({ top: S.graniteLight, dot: S.graniteDark, fill: S.granite }),
    tile(t, c, r, x, y, map) {
      if (t === "#") granite(c, r, x, y, map);
      else if (t === "U") concrete(c, r, x, y, map);
      else if (t === "I") girder(c, x, y);
      else if (t === "N") net(c, x, y);
      else return false;
      return true;
    },
    ledges: { "=": BOARDS },
    carrier(i, at, v) {
      const d = CARRIERS[i];
      if (d === HOIST) return hoistArt(at.x, at.y);
      if (SHEETS.includes(d as Travel)) return sheetArt(at.x, at.y, d.w);
      const c = CRANES.find((k) => at.x >= k.from * TILE - 32 && at.x <= k.to * TILE) ?? CRANES[0];
      hookArt(at.x, at.y, c.jib * TILE);
      void v;
    },
    enemy(e, v) {
      if (!e.alive || e.def.look !== "riveter") return false;
      riveter(e, v.t);
      return true;
    },
    shot(s, v) {
      boltArt(s, v.t);
      return true;
    }
  }
};
