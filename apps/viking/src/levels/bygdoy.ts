import { box, column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef, Path } from "@larshansen/pixelkit/carrier";
import { carrierAt } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { deckEverywhere, deckGround, deckTops, type Deck } from "@larshansen/pixelkit/deck";
import { drawOar, oarBank, type Oar } from "@larshansen/pixelkit/oars";
import { R, gable, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, GLASS, INK, LAND, METAL, PAINT, PALETTE, PLANTS, ROOF, STONE, WHITE } from "@larshansen/pixelkit/palette";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import { padState, padY, padsEverywhere, padsGround, stepPads, type PadState, type SinkPad } from "@larshansen/pixelkit/sink";
import * as M from "@larshansen/pixelkit/swatches/museum";
import { windingUp, type Enemy, type EnemyDef, type Shot } from "../game/enemies";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import { parts } from "../render/pickups";
import { mapBuilder } from "./build";
import type { Grounds, LevelDef, View } from "./types";

// Level 11, rune V: Bygdøy, the museum peninsula, by day. The first level of line 2, and a warm-up for
// a returning player. Its one idea is ground that rocks and drifts and goes under: the polar ship's
// deck tilts, the balsa raft drifts and the bundles of balsa between the rafts sink, and the longship's
// oars are a stair on a beat. At the longship's prow he is given the shield, and the way out is past
// three slingers on the roofs of the old storehouses: walk, stop and raise it, walk.
//
//   Q  Rådhusbrygga's granite   P  the pier's planks   #  sand, the halls' floors, the yard
//   H  the hulls (Fram's foredeck, the longship)   K  a rock   ^  the storehouses' ridges   =  the halls' galleries
//   -  the museum's stepped gable   _  roofs and the yard on the mast   B  a beached rowing boat   ~  the fjord
//   t  T-banen   b  bench   $  skilling   &  brown cheese   y  the shield
//
// Sections: the ferry from Rådhusbrygga (a short ride, skilling over the wake), the beach and its
// boathouses (gulls, crabs, the first sign), Fram in her hall (the rocking deck twice, a bench), the
// balsa raft outside (drifting rafts, sinking bundles between them), the longship's hall (the oars,
// the shield at the prow, the slingers in the yard), and the rune V on the museum's roof.

const COLS = 256;
const ROWS = 24;
/** The water line and the floor: the top of row 19. */
export const W = 19;
/** The loft over the passage out of the ship hall: its first and last column. */
export const LOFT = [203, 210] as const;
const FLOOR = W * TILE;
const b = mapBuilder(COLS, ROWS);
const water = (c0: number, c1: number) => b.fill(c0, c1, W, W + 1, "~").ground(c0, c1, W + 2);

// --- Rådhusbrygga and the crossing ----------------------------------------------------------------
b.ground(0, 11, W, "Q");
water(12, 27);
// --- The pier ---------------------------------------------------------------------------------------
water(28, 34);
b.run(28, 34, W, "P");
// --- The beach: sand, two boathouses (their roofs ledges, a beached boat the step up), the slipway ---
b.ground(35, 68, W);
water(48, 50);
b.put(39, W - 1, "B").run(40, 44, 16, "_");
b.put(55, W - 1, "B").run(56, 61, 16, "_");
// --- Fram's hall: the floor, the stairs to the gallery, the foredeck, the crow's nest, the hold ------
b.ground(69, 255, W);
b.run(70, 71, 17, "=").run(72, 76, 15, "=");
b.fill(89, 97, 11, W - 1, "H");
b.run(93, 94, 9, "=").run(92, 95, 7, "_");
// The hold under Gjøa's deck: open down to the bottom.
b.fill(98, 108, W, ROWS - 1, ".");
// The gallery past Gjøa, where she lands him.
b.run(110, 118, 10, "=");
// --- Outside: the fjord between the halls, the balsa raft and the reed boat -------------------------
water(122, 151);
// A rock between the bundles and the reed boat: somewhere firm to wait.
b.fill(138, 139, W, ROWS - 1, "K");
// --- The longship's hall: its hull on the cradle, the yard on its mast ------------------------------
b.fill(172, 199, 14, W - 1, "H");
b.run(182, 190, 10, "_");
// --- The yard: out of the hall through the low passage under the loft (too low to jump in), then two
// storehouses on stilts behind him, the ridges of their turf roofs the slingers' perches -
b.fill(LOFT[0], LOFT[1], 11, W - 2, "L");
for (const c of [222, 231]) b.run(c, c + 1, 13, "^");
// The slip in the yard where a boat lies moored, its deck rocking at the yard's height: the second deck
// crossing, under the first storehouse's slinger. The water in the slip lies a tile lower than the fjord's.
b.fill(215, 224, W, W, ".").fill(215, 224, W + 1, W + 2, "~").ground(215, 224, W + 3);
// --- The museum's stepped gable, up to the roof's ridge ---------------------------------------------
b.run(238, 240, 17, "-").run(241, 243, 15, "-").run(244, 246, 13, "-").run(247, 249, 11, "-").run(250, 255, 9, "-");

// Marks: the start, the door, signs, flags, the bench, the rune, the bracteate, the cheese, the shield.
b.put(2, W - 1, "t").put(4, W - 1, "S");
b.put(37, W - 1, "i").put(72, 14, "i").put(119, W - 1, "i").put(162, W - 1, "i");
b.put(31, W - 1, "f").put(69, W - 1, "f").put(90, 10, "f").put(121, W - 1, "f").put(158, W - 1, "f").put(196, 13, "f").put(239, 16, "f");
b.put(95, 10, "b");
b.put(252, 8, "r").put(186, 5, "o").put(93, 6, "&").put(198, 13, "y");

// Skilling: over the pigeon, over the wake, along the pier and the beach, the boathouses' roofs and
// the slipway, up the gallery and over the rocking decks, the crow's nest, over the rafts and the
// bundles, up the oars, along the longship's deck, under the storehouses, up the gable.
const COINS: [number, number][] = [
  [6, 17], [7, 16], [8, 17],
  [15, 16], [16, 15], [17, 15], [18, 15], [19, 16],
  [30, 18], [33, 18],
  [41, 15], [42, 15], [43, 15],
  [48, 16], [49, 15], [50, 16],
  [57, 15], [58, 15], [59, 15], [60, 15],
  [64, 17], [65, 17],
  [70, 16], [73, 14], [74, 14], [75, 14],
  [80, 12], [83, 12], [86, 12],
  [92, 6], [94, 6],
  [101, 10], [104, 10], [107, 10],
  [111, 9], [112, 9], [113, 9],
  [124, 17], [126, 17], [128, 17],
  [132, 16], [133, 15], [135, 16], [136, 15], [137, 16],
  [142, 17], [144, 17], [146, 17],
  [149, 16], [150, 15],
  [165, 16], [167, 15], [169, 14],
  [176, 13], [178, 13], [180, 13], [190, 13], [192, 13], [194, 13],
  [205, 18], [218, 18], [227, 18],
  [238, 15], [242, 14], [245, 12], [248, 10], [253, 8]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- Things that move -------------------------------------------------------------------------------

/** The Bygdøy ferry: from Rådhusbrygga to the pier and back, standing a second and a half at each. Its deck is level with both. */
export const FERRY: Path = {
  kind: "path",
  points: [
    { x: 12 * TILE, y: FLOOR },
    { x: 24 * TILE, y: FLOOR },
    { x: 12 * TILE, y: FLOOR }
  ],
  w: 4 * TILE,
  speed: 1.8,
  wait: 0,
  stops: [
    { at: 0, steps: 90 },
    { at: 1, steps: 90 }
  ]
};

/** A raft that drifts from `c0` to `c1` and back, standing a second and a half at its near end and a second at its far one. */
const drift = (c0: number, c1: number): Path => ({
  kind: "path",
  points: [
    { x: c0 * TILE, y: FLOOR },
    { x: c1 * TILE, y: FLOOR },
    { x: c0 * TILE, y: FLOOR }
  ],
  w: 4 * TILE,
  speed: 0.8,
  wait: 0,
  stops: [
    { at: 0, steps: 90 },
    { at: 1, steps: 60 }
  ]
});
/** The balsa raft, from the shore out to the first bundle; the reed boat, from the rock out to the last. Each stands against them at its ends. */
export const RAFT = drift(122, 127);
export const REED = drift(140, 144);

const CARRIERS: CarrierDef[] = [FERRY, RAFT, REED];

/** Fram's main deck, and Gjøa's: each rocks between its two angles, holding each for a second and a half. */
export const FRAM_DECK: Deck = { x: 77 * TILE, y: 228, w: 12 * TILE, seg: 4, tilt: [12, -12], hold: 100, move: 60 };
export const GJOA_DECK: Deck = { x: 98 * TILE, y: 200, w: 11 * TILE, seg: 4, tilt: [12, -12], hold: 100, move: 60, offset: 80 };
/**
 * The boat moored in the yard's slip, level with the yard: its deck rocks, its middle stays (the firm place
 * to stop and raise the shield), and the slinger on the storehouse over its far half throws at him on it.
 */
export const YARD_DECK: Deck = { x: 215 * TILE, y: FLOOR, w: 10 * TILE, seg: 4, tilt: [8, -8], hold: 90, move: 50, offset: 20 };
const DECKS = [FRAM_DECK, GJOA_DECK, YARD_DECK];

/** Bundles of balsa logs between the rafts: they hold him a moment, then go under. */
export const PADS: SinkPad[] = [131 * TILE, 134.5 * TILE, 148 * TILE].map((x) => ({ x, y: FLOOR, w: 2 * TILE }));

interface Ground {
  pads: PadState[];
}

/** The decks and the bundles: moving ground that is not on the clock alone (the bundles notice him). */
export const GROUNDS: Grounds<Ground> = {
  create: () => ({ pads: PADS.map(padState) }),
  carriers: (s, t, him) => [...DECKS.flatMap((d) => deckGround(d, t, him)), ...padsGround(PADS, s.pads, t)],
  after: (s, t, him) => stepPads(PADS, s.pads, t, him),
  everywhere: () => [...DECKS.flatMap(deckEverywhere), ...padsEverywhere(PADS)],
  // The decks rock (they move); the bundles of balsa give way.
  stands: (s, t) => [...DECKS.flatMap((d) => deckTops(d, t).map((y, i) => ({ x: d.x + i * d.seg, y, w: d.seg, how: "moves" as const }))), ...PADS.map((p, i) => ({ x: p.x, y: padY(p, s.pads[i], t), w: p.w, how: "gives" as const }))]
};

/** The longship's oars, a stair from the hall's floor to its deck, each a stroke behind the one below. */
export const OARS: Oar[] = oarBank({ x: 164 * TILE, y: FLOOR - 20, n: 4, dx: 24, dy: -20, beat: { on: 120, warn: 60, off: 90 }, turn: 45, port: { x: 172 * TILE + 6, y: 15 * TILE + 2 }, portDx: 7 }).map((o) => ({ ...o, note: -1 }));

/**
 * The beach's crabs and gulls, a pigeon on Rådhusbrygga, museum rats (under Fram's deck, by the oars,
 * on the longship's deck), two penguins far from home past Gjøa, a gull over the roof; and in the
 * yard, on the storehouses' ridges, three slingers who aim where he is going.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "pigeon", c: 6, r: W - 1, range: 1 },
  { kind: "walker", look: "crab", c: 42, r: W - 1, range: 1, speed: 0.3 },
  // High over the first boathouse: a man walking its roof has his head well clear of it.
  { kind: "flyer", look: "gull", c: 42, r: 12, range: 2, rise: 3, period: 150 },
  { kind: "flyer", look: "gull", c: 58, r: 13, range: 3, rise: 6, period: 170 },
  { kind: "walker", look: "crab", c: 65, r: W - 1, range: 0.5, speed: 0.3 },
  { kind: "walker", look: "rat", c: 82, r: W - 1, range: 3 },
  { kind: "walker", look: "penguin", c: 115, r: 9, range: 1, speed: 0.3 },
  { kind: "walker", look: "penguin", c: 114, r: W - 1, range: 1, speed: 0.3 },
  { kind: "walker", look: "rat", c: 164, r: W - 1, range: 1 },
  { kind: "walker", look: "rat", c: 184, r: 13, range: 3 },
  // The lesson: the first slinger alone, on the floor past the low passage under the loft, throwing
  // straight along it on a short steady beat. In the passage a man cannot jump, so walking on without
  // the shield is always hit, and stopping to raise it as a stone comes never is.
  // (Its reach is twelve tiles, the least that still catches a careless walker at every moment of its beat;
  // on the narrowest view its wind-up can begin some 50 px off the screen's edge, its stone seen 1.5 s.)
  { kind: "thrower", look: "slinger", c: 214, r: W - 1, period: 100, faces: -1, straight: true, reach: 12 },
  // Then the other two on the storehouses' ridges, nine tiles apart, the second a little behind: their
  // beats chosen (by a search over every pair) so that a man who walks on through the yard meets a
  // throw coming at him as often as can be, a little under every other time.
  { kind: "thrower", look: "slinger", c: 222, r: 12, period: 110, lead: true, faces: -1 },
  { kind: "thrower", look: "slinger", c: 231, r: 12, period: 110, offset: 45, lead: true, faces: -1 },
  { kind: "flyer", look: "gull", c: 246, r: 4, range: 2, rise: 6, period: 150 }
];

export const BYGDOY_RULES = { COLS, ROWS, CARRIERS, DECKS, PADS };

// --- Art ----------------------------------------------------------------------------------------------
const P = PALETTE;

/** Oslo across the fjord, far: the city's low line, Rådhuset's two towers, Akershus on its rock. */
function farCity() {
  const base = FLOOR - 26;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 6 + Math.round(3 * Math.sin(wx * 0.05) + 2 * Math.sin(wx * 0.17));
    column(x, base - h, base, mix(LAND.farHills, STONE.light, 0.4));
    if (Math.floor(wx) % 23 < 2) column(x, base - h + 2, base - h + 3, mix(GLASS.farWindow, WHITE, 0.3));
    // Rådhuset's two towers, once along the far shore.
    const k = ((Math.floor(wx) % 700) + 700) % 700;
    if ((k >= 300 && k < 306) || (k >= 314 && k < 320)) column(x, base - h - 14, base - h, mix(P.sailStripe, LAND.farHills, 0.45));
  }
}

/** Bygdøy behind the street: oak and lime woods, and now and then a roof of the old farms. */
function woods(t: number) {
  const foot = FLOOR - 6;
  for (let i = 0; i < 70; i++) {
    const wx = i * 58 + ((i * 37) % 30);
    const x = layerX(wx, 0.4);
    if (x < -30 || x > view.w + 30) continue;
    const h = 20 + ((i * 29) % 18);
    const r = 9 + ((i * 7) % 5);
    box(x, foot - h, 2, h, mix(P.woodDark, LAND.forest, 0.3));
    for (let yy = -r; yy <= r; yy++) {
      const half = Math.floor(r * Math.sqrt(1 - (yy * yy) / (r * r)) * 1.2);
      box(x + 1 - half, foot - h - r + 4 + yy, half * 2, 1, mix(yy < -r / 3 ? PLANTS.leavesShine : yy > r / 2 ? PLANTS.hedgeDark : PLANTS.leaves, LAND.farHills, 0.18));
    }
    // The stave church of the folk museum, once, above the trees: its dark roofs in tiers and dragon heads.
    if (i === 28) stave(x + 20, foot - 30);
  }
  void t;
}

/** A stave church far off: roofs in tiers of dark shingle, a spire, dragon heads at the gables. */
function stave(x: number, foot: number) {
  const tar = mix(M.tar, LAND.farHills, 0.25);
  for (let k = 0; k < 4; k++) {
    const w = 30 - k * 7;
    const y = foot - 8 - k * 9;
    box(x - w / 2, y, w, 3, tar);
    for (let j = 0; j < 4; j++) box(x - w / 2 + j, y - j - 1, w - j * 2, 1, tar);
    box(x - w / 2 + 3, y + 3, w - 6, 6, mix(M.tarLight, LAND.farHills, 0.25));
    box(x - w / 2 - 2, y - 2, 2, 2, tar);
    box(x + w / 2, y - 2, 2, 2, tar);
  }
  box(x - 1, foot - 54, 2, 12, tar);
}

/** Rådhusbrygga: the ferry's ticket kiosk, bollards along the quay's edge, a sign for Bygdøy. */
function radhusbrygga(v: View) {
  tbaneDoor(v.doors.get("tbane"));
  // The ticket kiosk: green boards, a white band, a window with its light.
  const x = 7 * TILE;
  const top = FLOOR - 34;
  R(x, top, 34, 34, mix(P.grassDark, INK, 0.2));
  for (let xx = x + 3; xx < x + 34; xx += 4) R(xx, top, 1, 34, mix(P.grassDark, INK, 0.35));
  R(x - 2, top - 4, 38, 4, PAINT.trim);
  R(x + 6, top + 8, 20, 10, GLASS.pane);
  R(x + 15, top + 8, 1, 10, PAINT.trim);
  light(x + 6, top + 8, 20, 10);
  R(x + 4, top - 14, 26, 9, PAINT.ferryWhite);
  R(x + 6, top - 12, 22, 2, PAINT.ferryRed);
  R(x + 6, top - 9, 14, 2, INK);
  for (const bx of [5 * TILE + 6, 11 * TILE + 8]) {
    R(bx, FLOOR - 7, 6, 7, METAL.lampPost);
    R(bx - 1, FLOOR - 8, 8, 2, METAL.lampHat);
  }
}

/** The ferry: a white hull with a red band, the wheelhouse aft, its wake. Its deck (the carrier) is level with the quay. */
function ferry(at: { x: number; y: number }, t: number) {
  const { x, y } = at;
  const w = 4 * TILE;
  // The wake, foam trailing behind whichever way it goes.
  const moving = carrierAt(FERRY, t).x !== carrierAt(FERRY, t - 1).x;
  if (moving && !view.reduced) {
    const back = carrierAt(FERRY, t).x > carrierAt(FERRY, t - 1).x ? -1 : 1;
    for (let k = 0; k < 6; k++) R(back < 0 ? x - 6 - k * 5 : x + w + 2 + k * 5, y + 4 + (k % 2), 4, 1, P.foam);
  }
  for (let i = 0; i < 9; i++) R(x + Math.round(i * 0.6), y + i, w - Math.round(i * 1.2), 1, i < 2 ? PAINT.ferryWhite : i < 4 ? PAINT.ferryRed : i < 7 ? PAINT.ferryShade : mix(PAINT.ferryShade, P.waterDeep, 0.4));
  R(x, y, w, 1, mix(PAINT.ferryWhite, WHITE, 0.6));
  // The wheelhouse, at the end that faces the pier: windows, a little funnel.
  const wh = x + w - 26;
  R(wh, y - 18, 22, 18, PAINT.ferryWhite);
  R(wh, y - 18, 22, 1, PAINT.ferryShade);
  for (let k = 0; k < 3; k++) R(wh + 2 + k * 7, y - 15, 5, 5, GLASS.pane);
  R(wh + 6, y - 24, 6, 6, PAINT.ferryRed);
  R(wh + 6, y - 24, 6, 1, INK);
  R(x + 2, y - 6, 1, 6, METAL.rail);
  R(x + 2, y - 6, 30, 1, METAL.rail);
}

/** The pier: piles under its planks, a lamp. */
function pier() {
  for (let c = 28; c <= 34; c += 2) R(c * TILE + 6, FLOOR + 6, 4, 26, mix(P.woodDark, P.water, 0.25));
  R(34 * TILE + 10, FLOOR - 30, 2, 30, METAL.lampPost);
  R(34 * TILE + 7, FLOOR - 32, 8, 3, METAL.lampHat);
  light(34 * TILE + 8, FLOOR - 29, 4, 3, "lamp");
}

/** A boathouse: red boards with white trim, a wide door to the water, its roof the map's ledge. */
function boathouse(c0: number, c1: number) {
  const x = c0 * TILE;
  const w = (c1 - c0 + 1) * TILE;
  const top = 16 * TILE + 5;
  R(x, top, w, FLOOR - top, PAINT.red);
  for (let xx = x + 3; xx < x + w; xx += 4) R(xx, top, 1, FLOOR - top, PAINT.redLine);
  R(x, top, 2, FLOOR - top, PAINT.trim);
  R(x + w - 2, top, 2, FLOOR - top, PAINT.trim);
  // The door to the water, open a crack: dark inside, a boat's bow.
  const dx = x + Math.floor(w / 2) - 14;
  R(dx - 2, top + 9, 32, FLOOR - top - 9, PAINT.trim);
  R(dx, top + 11, 28, FLOOR - top - 11, mix(P.woodDark, INK, 0.3));
  R(dx + 13, top + 11, 2, FLOOR - top - 11, PAINT.trim);
  R(dx + 4, FLOOR - 9, 18, 6, mix(P.wood, INK, 0.2));
  // A window in the gable end, and the gable over the roof's ledge.
  gable(x - 2, top + 1, w + 4, 20, ROOF.red);
  R(x + w / 2 - 4, top - 12, 8, 7, GLASS.pane);
  R(x + w / 2 - 1, top - 12, 1, 7, PAINT.trim);
}

/** The beach: pebbles and weed at the water's edge, a beached rowing boat (the step up to a roof). */
function beach() {
  for (let x = 35 * TILE; x < 69 * TILE; x += 3) if ((x * 7) % 11 < 3) R(x, FLOOR + 2 + ((x * 3) % 5), 2, 1, mix(P.sandDark, STONE.base, 0.4));
  for (const c of [47, 51, 68]) for (let k = 0; k < 6; k++) R(c * TILE + k * 2 + (c === 47 ? 4 : 0), FLOOR - 2 - (k % 3), 1, 2 + (k % 3), mix(P.grassDark, P.sandDark, 0.3));
}

/** A beached rowing boat, upside down: the map's step up to a boathouse roof. */
function rowboat(x: number, y: number) {
  for (let i = 0; i < 9; i++) R(x - 4 + Math.round(Math.pow(i / 8, 2) * 4), y + 7 + i, TILE + 8 - Math.round(Math.pow(i / 8, 2) * 8), 1, i < 2 ? mix(PAINT.mint, WHITE, 0.2) : PAINT.mint);
  R(x - 4, y + 7, TILE + 8, 1, mix(PAINT.mint, INK, 0.3));
  for (let k = 0; k < TILE + 8; k += 5) R(x - 4 + k, y + 8, 1, 7, mix(PAINT.mint, INK, 0.25));
}

/** Fram's hall, inside: an A of pale boards rising over everything, its great beams, a glass gable end. */
function framHall() {
  const x0 = 68 * TILE;
  const x1 = 121 * TILE;
  const peak = 0;
  for (let x = x0; x < x1; x++) {
    const k = (x - x0) / (x1 - x0);
    const roof = Math.round(peak + Math.abs(k - 0.5) * 2 * (FLOOR - 20 * 8));
    R(x, roof, 1, FLOOR - roof, (x >> 3) % 2 ? M.hallBoard : M.hallBoardLine);
    R(x, roof, 1, 3, M.hallBeam);
  }
  // The A's beams, from the floor up to the ridge.
  for (const x of [72, 82, 92, 102, 112].map((c) => c * TILE)) {
    const k = (x - x0) / (x1 - x0);
    const roof = Math.round(peak + Math.abs(k - 0.5) * 2 * (FLOOR - 20 * 8));
    R(x, roof, 4, FLOOR - roof, mix(M.hallBeam, WHITE, 0.15));
    R(x + 3, roof, 1, FLOOR - roof, mix(M.hallBeam, INK, 0.2));
  }
  // The glass at the far end, over the doors out to the fjord.
  for (let y = 9 * TILE; y < FLOOR - 24; y += 10) R(116 * TILE, y, 4 * TILE, 8, M.hallGlass);
  for (let xx = 116 * TILE; xx < 120 * TILE; xx += 16) R(xx, 9 * TILE, 1, FLOOR - 24 - 9 * TILE, M.hallBeam);
  // The doors, open.
  R(118 * TILE, FLOOR - 24, 2 * TILE, 24, mix(P.water, WHITE, 0.4));
  R(118 * TILE, FLOOR - 26, 2 * TILE, 2, M.hallBeam);
}

/** Fram: her black hull on the cradle under the main deck and the foredeck, the yellow rail, three masts and their rigging. */
function fram() {
  const x0 = 77 * TILE - 8;
  const x1 = 98 * TILE + 4;
  // The hull below the decks: black, a yellow band, sitting on its cradle of timbers.
  for (let x = x0; x < x1; x++) {
    const k = (x - x0) / (x1 - x0);
    const keel = FLOOR - 26 + Math.round(Math.pow(Math.abs(k - 0.55) * 1.6, 3) * 18);
    const top = x < 89 * TILE ? 244 : 11 * TILE + 8;
    // Her strakes, black and a little less black in turn, a cream band under the rail, the bottom tarred brown.
    for (let y = top; y < keel; y += 5) R(x, y, 1, Math.min(5, keel - y), ((y - top) / 5) % 2 ? M.framHull : M.framHullLight);
    R(x, top, 1, 2, M.framTrim);
    R(x, top + 5, 1, 2, mix(M.framTrim, WHITE, 0.5));
    R(x, keel - 6, 1, 6, mix(P.woodDark, M.framHull, 0.4));
    if (k < 0.02 || k > 0.98) R(x, top, 1, keel - top, M.framHullLight);
  }
  // Portholes along her side, lit from inside.
  for (let x = x0 + 30; x < x1 - 30; x += 34) {
    const y = (x < 89 * TILE ? 244 : 11 * TILE + 8) + 14;
    R(x, y, 5, 5, M.framTrim);
    R(x + 1, y + 1, 3, 3, mix(GLASS.pane, P.sail, 0.4));
    light(x + 1, y + 1, 3, 3);
  }
  for (const c of [79, 85, 92]) {
    R(c * TILE, FLOOR - 26, 10, 26, P.woodDark);
    R(c * TILE - 3, FLOOR - 4, 16, 4, STONE.base);
  }
  // FRAM in yellow on her bow.
  for (let i = 0; i < 4; i++) R(94 * TILE + i * 6, 13 * TILE, 4, 6, M.framTrim);
  // Three masts, the shrouds down to the rail.
  for (const [c, top] of [[82, 2 * TILE], [94, 2 * TILE + 8], [87, 4 * TILE]] as const) {
    const x = c * TILE + 6;
    R(x, top, 3, 11 * TILE - top, P.woodDark);
    R(x + 1, top, 1, 11 * TILE - top, P.wood);
    for (let k = 1; k < 4; k++) R(x - 10, top + k * 22, 23, 2, P.woodDark);
    for (let i = 0; i < 40; i++) {
      R(x - 2 - Math.round(i * 0.5), top + 10 + i * 4, 1, 4, mix(P.woodDark, INK, 0.3));
      R(x + 4 + Math.round(i * 0.5), top + 10 + i * 4, 1, 4, mix(P.woodDark, INK, 0.3));
    }
  }
  // The foredeck's planks, where he stands, and its rail.
  for (let x = 89 * TILE; x < 98 * TILE; x++) {
    R(x, 11 * TILE, 1, 1, mix(M.deck, WHITE, 0.3));
    R(x, 11 * TILE + 1, 1, 5, x % 16 ? M.deck : mix(M.deck, INK, 0.25));
    R(x, 11 * TILE + 6, 1, 2, mix(M.deck, INK, 0.35));
    if (x % 12 === 0) R(x, 11 * TILE - 8, 1, 8, M.framTrim);
  }
  R(89 * TILE, 11 * TILE - 8, 9 * TILE, 1, M.framTrim);
  // The bowsprit, out over the foredeck's end.
  for (let i = 0; i < 30; i++) R(97 * TILE + 8 + i, 11 * TILE + 2 - Math.round(i * 0.4), 2, 2, P.woodDark);
}

/** Gjøa beside her: a small white-hulled sloop with a dark rail; its deck rocks too. The hold under it is dark. */
function gjoa() {
  R(98 * TILE, FLOOR, 11 * TILE, ROWS * TILE - FLOOR + 400, M.hold);
  for (let x = 98 * TILE; x < 109 * TILE; x += 6) R(x, FLOOR + 4 + ((x * 3) % 7), 2, 1, mix(M.hold, P.woodDark, 0.5));
  // Her hull: white strakes over a black band, narrowing to the keel, on two posts down into the hold.
  const x0 = 99 * TILE - 4;
  const x1 = 109 * TILE + 4;
  const white = mix(PAINT.ferryWhite, STONE.base, 0.15);
  for (let x = x0; x < x1; x++) {
    const k = (x - x0) / (x1 - x0);
    const keel = 262 - Math.round(Math.pow(Math.abs(k - 0.5) * 2, 2.4) * 30);
    for (let y = 214; y < keel; y += 4) R(x, y, 1, Math.min(4, keel - y), ((y - 214) / 4) % 2 ? white : mix(white, STONE.base, 0.3));
    R(x, 214, 1, 3, M.framHull);
    R(x, keel - 3, 1, 3, M.framHull);
  }
  for (const c of [101, 106]) R(c * TILE, 258, 6, FLOOR - 258, mix(P.woodDark, M.hold, 0.3));
  R(103 * TILE, 4 * TILE, 3, 214 - 4 * TILE, P.woodDark);
  for (let i = 0; i < 30; i++) R(103 * TILE - 2 - i, 4 * TILE + 8 + i * 5, 1, 5, mix(P.woodDark, INK, 0.3));
}

/** The rock in the fjord between the bundles and the reed boat: wet grey stone, weed at the water line. */
function rock(c: number, r: number, x: number, y: number) {
  const base = r === W ? STONE.light : mix(STONE.base, P.waterDeep, 0.4);
  R(x, y, TILE, TILE, base);
  R(x + ((c * 5) % 9), y + 4 + ((r * 3) % 7), 5, 2, mix(base, WHITE, 0.2));
  R(x + ((c * 7) % 11), y + 9, 4, 1, mix(base, INK, 0.25));
  if (r === W) {
    R(x, y, TILE, 2, mix(STONE.light, WHITE, 0.3));
    R(x, y + 2, TILE, 1, STONE.moss);
    R(c === 138 ? x : x + TILE - 1, y, 1, TILE, mix(base, INK, 0.3));
  }
}

/** A slab of a hall's floor: polished on top, joints, a little darker below. */
function hallFloor(c: number, r: number, x: number, y: number) {
  const base = r === W ? mix(M.deck, WHITE, 0.15) : mix(STONE.base, M.deck, 0.3);
  R(x, y, TILE, TILE, (c + r) % 2 ? base : mix(base, INK, 0.06));
  R(x, y, TILE, 1, mix(base, INK, 0.25));
  R(x, y, 1, TILE, mix(base, INK, 0.2));
  if (r === W) {
    R(x, y, TILE, 1, mix(base, WHITE, 0.45));
    R(x + 3 + ((c * 5) % 7), y + 3, 4, 1, mix(base, WHITE, 0.3));
  }
}

/** A rocking deck: its planks as they stand, and the rail. */
function deckArt(d: Deck, t: number) {
  const tops = deckTops(d, t);
  tops.forEach((y, i) => {
    const x = d.x + i * d.seg;
    R(x, y, d.seg, 1, mix(M.deck, WHITE, 0.3));
    R(x, y + 1, d.seg, 3, M.deck);
    R(x, y + 4, d.seg, 2, mix(M.deck, INK, 0.35));
    R(x, y + 6, d.seg, 8, M.framHull);
    if (i % 4 === 0) R(x, y + 1, 1, 3, mix(M.deck, INK, 0.25));
    // The rail along its far side, on posts.
    if (i % 3 === 0) R(x, y - 8, 1, 8, M.framTrim);
    R(x, y - 8, d.seg, 1, M.framTrim);
  });
}

/** The balsa raft outside the hall: logs lashed side by side, a bamboo cabin, a square sail with a sun on it. */
function balsaRaft(at: { x: number; y: number }) {
  const { x, y } = at;
  const w = 4 * TILE;
  for (let k = 0; k < w; k += 8) {
    R(x + k, y, 8, 5, k % 16 ? M.balsa : mix(M.balsa, WHITE, 0.15));
    R(x + k + 7, y + 1, 1, 4, M.balsaDark);
    R(x + k, y + 5, 8, 2, mix(M.balsaDark, P.water, 0.4));
  }
  R(x, y, w, 1, mix(M.balsa, WHITE, 0.4));
  R(x + 12, y - 18, 22, 18, M.bamboo);
  for (let k = 0; k < 22; k += 3) R(x + 12 + k, y - 18, 1, 18, mix(M.bamboo, INK, 0.2));
  gable(x + 10, y - 17, 26, 8, mix(M.reed, M.bamboo, 0.5));
  R(x + 44, y - 50, 2, 50, P.woodDark);
  R(x + 36, y - 48, 20, 22, mix(PAINT.trim, M.balsa, 0.4));
  R(x + 43, y - 41, 6, 6, P.sailStripe);
  R(x + 36, y - 48, 20, 1, P.woodDark);
}

/** The reed boat: bundles of reed, its ends curving up, a hut of reed, a striped sail. */
function reedBoat(at: { x: number; y: number }) {
  const { x, y } = at;
  const w = 4 * TILE;
  for (let k = -6; k < w + 6; k++) {
    const end = k < 0 ? -k : k >= w ? k - w + 1 : 0;
    R(x + k, y - end * 2, 1, 6, (k >> 2) % 2 ? M.reed : M.reedDark);
  }
  R(x, y, w, 1, mix(M.reed, WHITE, 0.3));
  for (let k = 6; k < w - 6; k += 9) R(x + k, y, 1, 6, M.rope);
  R(x + 16, y - 14, 18, 14, M.reed);
  gable(x + 14, y - 13, 22, 6, M.reedDark);
  R(x + 44, y - 46, 2, 46, P.woodDark);
  for (let k = 0; k < 20; k++) R(x + 36 + k, y - 44, 1, 18, (k >> 2) % 2 ? P.sailStripe : PAINT.trim);
}

/** A bundle of balsa logs between the rafts: it bobs a little, then goes under as it sinks. */
function bundle(p: SinkPad, s: PadState, t: number) {
  const y = padY(p, s, t);
  const shown = Math.min(7, FLOOR + 7 - y);
  if (shown <= 0) return;
  for (let k = 0; k < p.w; k += 8) R(p.x + k, y, 8, shown, k % 16 ? M.balsa : M.balsaDark);
  R(p.x, y, p.w, 1, mix(M.balsa, WHITE, 0.4));
  R(p.x + 6, y, 1, shown, M.rope);
  R(p.x + p.w - 7, y, 1, shown, M.rope);
  // Going under: bubbles round it.
  if (s.sinkAt !== null && !view.reduced) for (let k = 0; k < 3; k++) R(p.x + 4 + k * 10, FLOOR - 2 - ((t + k * 5) % 6), 2, 2, P.foam);
  R(p.x - 2, FLOOR + 1, p.w + 4, 1, P.foam);
}

/** The Kon-Tiki museum across the water: a white hall with a long sloping roof, its name in a band. */
function kontikiHall() {
  const x = 124 * TILE;
  const g = FLOOR - 18;
  R(x, g - 60, 30 * TILE, 60, M.plaster);
  // Its walls in panels, a darker plinth, the long roof rising behind.
  for (let xx = x; xx < x + 30 * TILE; xx += 14) R(xx, g - 58, 1, 56, M.plasterShade);
  R(x, g - 8, 30 * TILE, 8, mix(M.plasterShade, STONE.base, 0.4));
  for (let i = 0; i < 30 * TILE; i++) R(x + i, g - 60 - Math.round(i * 0.06), 1, Math.round(i * 0.06) + 1, M.plasterShade);
  R(x, g - 62, 30 * TILE, 3, ROOF.slate);
  for (let xx = x + 20; xx < x + 30 * TILE - 20; xx += 28) {
    R(xx, g - 44, 14, 20, GLASS.pane);
    light(xx, g - 44, 14, 20);
  }
  R(x + 120, g - 56, 120, 8, INK);
  for (let i = 0; i < 14; i++) R(x + 126 + i * 8, g - 54, 5, 4, M.plaster);
  // A low wall along the water, the far bank's grass.
  R(x - 20, g - 2, 32 * TILE + 40, 4, P.grass);
  R(x - 20, g + 2, 32 * TILE + 40, 16, P.water);
}

/** The viking ship hall: white plaster, vaults overhead, tall arched windows; inside, the longship. */
function shipHall() {
  const x0 = 157 * TILE;
  const x1 = 205 * TILE;
  R(x0, 1 * TILE, x1 - x0, FLOOR - TILE, M.plaster);
  // Vaults: arches across, their ribs shaded.
  for (let x = x0; x < x1; x++) {
    const k = ((x - x0) % 96) / 96;
    const y = 1 * TILE + Math.round(Math.sin(k * Math.PI) * -18) + 26;
    R(x, TILE, 1, y - TILE, M.vault);
    R(x, y, 1, 2, M.plasterShade);
  }
  for (let x = x0; x < x1; x += 96) R(x - 2, TILE, 5, FLOOR - TILE, M.plasterShade);
  // The wall's dressed stone under the plaster, its courses showing faintly.
  for (let y = 4 * TILE; y < FLOOR; y += 12) {
    R(x0, y, x1 - x0, 1, M.plasterShade);
    for (let x = x0 + ((y / 12) % 2) * 20; x < x1; x += 40) R(x, y, 1, 12, M.plasterShade);
  }
  // Rope barriers along the floor on brass posts, as round a museum's ship.
  for (let x = x0 + 40; x < x1 - 10; x += 36) {
    R(x, FLOOR - 14, 2, 14, METAL.brass);
    R(x - 1, FLOOR - 15, 4, 2, METAL.brass);
    for (let k = 1; k < 36; k++) R(x + k, FLOOR - 12 + Math.round(Math.sin((k / 36) * Math.PI) * 4), 1, 1, P.sailStripe);
  }
  // Arched windows high in the walls.
  for (let x = x0 + 30; x < x1 - 20; x += 96) {
    R(x, 5 * TILE, 18, 40, GLASS.pane);
    for (let j = 0; j < 9; j++) R(x + j, 5 * TILE - 9 + j, 18 - j * 2, 1, GLASS.pane);
    R(x + 8, 5 * TILE - 4, 2, 44, M.plasterShade);
    light(x, 5 * TILE, 18, 40, "soft");
  }
  // The doorway in, and the doorway out to the yard.
  R(x0 + 30, FLOOR - 30, 20, 30, mix(M.plasterShade, INK, 0.15));
  R(x1 - 26, FLOOR - 34, 22, 34, mix(P.grass, WHITE, 0.35));
  R(x1 - 28, FLOOR - 36, 26, 3, M.plasterShade);
}

/** The longship on its cradle: dark oak, its strakes, the spiral at stern and prow, the mast and yard, shields along the rail. */
function longship() {
  const x0 = 172 * TILE;
  const x1 = 200 * TILE;
  const top = 14 * TILE;
  for (let i = 0; i < W * TILE - top - 6; i++) {
    const inset = Math.round(Math.pow(i / (W * TILE - top - 6), 1.6) * 40);
    R(x0 + inset, top + i, x1 - x0 - inset * 2, 1, Math.floor(i / 4) % 2 ? M.oak : M.oakLight);
  }
  R(x0, top, x1 - x0, 2, M.oakDark);
  // The cradle it rests on.
  for (const c of [178, 186, 194]) R(c * TILE, FLOOR - 8, 12, 8, P.woodDark);
  // Stem and stern rising in spirals.
  for (const [ex, dir] of [[x0, -1], [x1, 1]] as const) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 1.3;
      R(ex + dir * Math.round(Math.sin(a) * 10 + i * 0.25), top - Math.round((1 - Math.cos(a)) * 18) - i, 3, 3, M.oakDark);
    }
  }
  // The mast and its yard (the map's ledge), the stays.
  const mx = 186 * TILE + 6;
  R(mx, 2 * TILE, 4, top - 2 * TILE, M.oakDark);
  R(mx + 1, 2 * TILE, 1, top - 2 * TILE, M.oakLight);
  for (let i = 0; i <= 200; i++) {
    const k = i / 200;
    R(Math.round(mx + 2 + (x1 - 6 - mx) * k), Math.round(2 * TILE + (top - 6 - 2 * TILE) * k), 1, 1, mix(M.oakDark, INK, 0.3));
    R(Math.round(mx + 2 - (mx - x0 - 6) * k), Math.round(2 * TILE + (top - 6 - 2 * TILE) * k), 1, 1, mix(M.oakDark, INK, 0.3));
  }
  // Shields along the rail, yellow and black, as they hung at the ship's burial.
  for (let i = 0, sx = x0 + 18; sx < x1 - 20; i++, sx += 10) {
    R(sx, top + 3, 8, 8, i % 2 ? P.sail : M.framTrim);
    R(sx + 3, top + 6, 2, 2, M.oakDark);
  }
}

/** One of the yard's old storehouses, behind the path: tarred logs on stilts, a turf roof whose ridge is a slinger's perch. */
function storehouse(c: number) {
  const x = c * TILE;
  const w = 5 * TILE;
  const top = 13 * TILE;
  // The log walls, tarred: courses with their ends showing at the corners.
  for (let y = top + 6; y < 18 * TILE; y += 5) {
    R(x, y, w, 5, (y >> 2) % 2 ? M.tar : M.tarLight);
    R(x, y + 4, w, 1, mix(M.tar, INK, 0.3));
    R(x - 3, y + 1, 4, 3, M.tarLight);
    R(x + w - 1, y + 1, 4, 3, M.tarLight);
  }
  // The turf roof: grass on top, the boards under it, a low gable.
  R(x - 6, top, w + 12, 6, M.turf);
  R(x - 6, top, w + 12, 1, mix(M.turf, WHITE, 0.25));
  for (let k = 0; k < w + 12; k += 3) R(x - 6 + k, top - 1 - (k % 2), 1, 1, P.grassDark);
  R(x - 6, top + 5, w + 12, 2, M.oakDark);
  // A small carved door, a step.
  R(x + w / 2 - 6, top + 14, 12, 24, P.woodDark);
  R(x + w / 2 - 5, top + 15, 10, 22, P.wood);
  // The stilts on their flat stones.
  for (const sx of [x + 3, x + w / 2 - 2, x + w - 7]) {
    R(sx, 18 * TILE, 4, 10, M.oakDark);
    R(sx - 3, FLOOR - 6, 10, 6, STONE.light);
    R(sx - 3, FLOOR - 6, 10, 1, mix(STONE.light, WHITE, 0.3));
  }
}

/**
 * The loft over the passage out of the hall: a two-storey storehouse of tarred logs on corner posts,
 * a shingle roof, a gallery with carved posts; under it the passage he walks through, a row high,
 * planked at the back and lit at both ends.
 */
function loft() {
  const x = LOFT[0] * TILE;
  const w = (LOFT[1] - LOFT[0] + 1) * TILE;
  const top = 11 * TILE;
  const floor = (W - 1) * TILE;
  // The passage: planks at the back, darker in the middle, light from either end.
  for (let xx = x; xx < x + w; xx++) {
    const k = Math.min(xx - x, x + w - 1 - xx) / (w / 2);
    R(xx, floor, 1, TILE, mix(M.tarLight, P.wood, 0.55 - 0.25 * k));
    if ((xx - x) % 6 === 0) R(xx, floor, 1, TILE, mix(M.tar, P.wood, 0.4));
  }
  R(x, floor + TILE - 2, w, 2, mix(STONE.base, M.tar, 0.3));
  // The log walls over it: courses, the ends of the logs at the corners.
  for (let y = top; y < floor; y += 5) {
    R(x, y, w, Math.min(5, floor - y), (y >> 2) % 2 ? M.tar : M.tarLight);
    R(x, y + 4, w, 1, mix(M.tar, INK, 0.3));
    R(x - 3, y + 1, 4, 3, M.tarLight);
    R(x + w - 1, y + 1, 4, 3, M.tarLight);
  }
  // The gallery round the upper storey: a rail on carved posts, the beam it stands on.
  R(x - 6, top + 34, w + 12, 3, M.oakDark);
  for (let xx = x - 4; xx < x + w + 4; xx += 9) {
    R(xx, top + 18, 3, 16, M.oakLight);
    R(xx + 1, top + 24, 1, 4, M.oakDark);
  }
  R(x - 6, top + 17, w + 12, 2, M.oakLight);
  // Two small windows, lit, in the storey below the gallery.
  for (const wx of [x + 24, x + w - 36]) {
    R(wx, top + 46, 12, 10, GLASS.pane);
    R(wx + 5, top + 46, 1, 10, M.oakDark);
    light(wx, top + 46, 12, 10);
  }
  // The beam over the passage and the corner posts at either end of it.
  R(x, floor - 3, w, 3, M.oakDark);
  for (const px of [x, x + w - 4]) {
    R(px, floor, 4, TILE, M.oakDark);
    R(px + 1, floor, 1, TILE, M.oakLight);
  }
  // The roof: shingle in rows, rising to its ridge, a carved dragon's head at each end.
  for (let k = 0; k < 14; k++) R(x - 10 + k * 2, top - 1 - k, w + 20 - k * 4, 1, k % 3 === 0 ? mix(M.tar, INK, 0.35) : M.tar);
  for (const [ex, d] of [[x - 10, -1], [x + w + 9, 1]] as const) {
    R(ex, top - 6, 2, 6, M.oakDark);
    R(ex + d * 2, top - 9, 3, 3, M.oakDark);
  }
}

/** The yard's ground and its fence; the museum's stepped gable at the far end. */
function gableEnd() {
  const x0 = 237 * TILE;
  const x1 = COLS * TILE;
  for (let x = x0; x < x1; x++) {
    const c = Math.floor(x / TILE);
    const step = c < 238 ? 19 : c < 241 ? 17 : c < 244 ? 15 : c < 247 ? 13 : c < 250 ? 11 : 9;
    R(x, step * TILE, 1, FLOOR - step * TILE, M.plaster);
    if ((x - x0) % 48 < 2) R(x, step * TILE, 1, FLOOR - step * TILE, M.plasterShade);
  }
  // Dressed stone under the plaster, as in the hall.
  for (let y = 9 * TILE; y < FLOOR; y += 12)
    for (let x = x0; x < x1; x++) {
      const c = Math.floor(x / TILE);
      const step = c < 238 ? 19 : c < 241 ? 17 : c < 244 ? 15 : c < 247 ? 13 : c < 250 ? 11 : 9;
      if (y <= step * TILE) continue;
      if (x % 40 === ((y / 12) % 2) * 20) R(x, y, 1, 12, M.plasterShade);
      else if (x % 4 === 0) R(x, y, 4, 1, M.plasterShade);
    }
  for (let x = x0 + 30; x < x1 - 20; x += 40) {
    R(x, 15 * TILE + 4, 10, 18, GLASS.pane);
    for (let j = 0; j < 5; j++) R(x + j, 15 * TILE + 4 - 5 + j, 10 - j * 2, 1, GLASS.pane);
    light(x, 15 * TILE + 4, 10, 18);
  }
}

// --- The creatures: the crab, the penguin, the slingers ------------------------------------------------

/** A shore crab sidling: a red shell, claws up, eyes on stalks. 15 x 12. */
function crab(e: Enemy) {
  const r = parts(e, 15);
  const step = view.reduced ? 0 : Math.floor(e.x / 2) % 2;
  r(2, -8, 11, 5, ENEMY.red);
  r(3, -9, 9, 1, ENEMY.red);
  r(3, -7, 9, 1, ENEMY.redLight);
  for (const dx of [0, 12]) {
    r(dx, -11, 3, 4, ENEMY.red);
    r(dx + (dx ? 1 : -1), -12, 3, 1, ENEMY.redLight);
  }
  for (let k = 0; k < 3; k++) {
    r(2 + k * 2, -3, 1, 3 - ((k + step) % 2), ENEMY.plum);
    r(8 + k * 2, -3, 1, 3 - ((k + step + 1) % 2), ENEMY.plum);
  }
  r(5, -10, 1, 1, ENEMY.eye);
  r(9, -10, 1, 1, ENEMY.eye);
}

/** A penguin from the aquarium, waddling: a plum back, an orange front, a red beak and feet. 11 x 12. */
function penguin(e: Enemy) {
  const r = parts(e, 11);
  const w = view.reduced ? 0 : Math.floor(e.x / 3) % 2;
  r(1, -10 + w, 9, 9, ENEMY.plum);
  r(5, -8 + w, 4, 7, ENEMY.orangeLight);
  r(2, -12 + w, 7, 3, ENEMY.plum);
  r(9, -11 + w, 3, 1, ENEMY.red);
  r(7, -11 + w, 1, 1, ENEMY.eye);
  r(0, -7 + w, 2, 4, ENEMY.plumLight);
  r(2, -1, 3, 1, ENEMY.red);
  r(6, -1, 3, 1, ENEMY.red);
}

/** A slinger on a storehouse ridge: a tunic, a cap, the sling going round over his head as the throw comes. 11 x 16. */
function slinger(e: Enemy, t: number) {
  const r = parts(e, 11);
  const coat = e.def.c % 2 ? ENEMY.red : ENEMY.plum;
  r(3, -5, 2, 5, ENEMY.plum);
  r(6, -5, 2, 5, ENEMY.plum);
  r(1, -12, 9, 7, coat);
  r(1, -7, 9, 1, ENEMY.orange);
  r(3, -15, 6, 3, ENEMY.orangeLight);
  r(2, -16, 8, 2, ENEMY.orange);
  r(7, -14, 1, 1, ENEMY.eye);
  if (windingUp(e, t)) {
    // The sling goes round over his head, faster as the throw comes.
    const a = view.reduced ? 0 : t * 0.4;
    r(9, -20, 1, 5, ENEMY.orangeLight);
    r(9 + Math.round(Math.cos(a) * 6), -22 + Math.round(Math.sin(a) * 2), 3, 3, ENEMY.plum);
  } else r(9, -11, 3, 1, ENEMY.orangeLight);
}

/** A slinger's stone in flight. */
function stone(s: Shot) {
  const x = Math.round(s.x - 3);
  const y = Math.round(s.y - 3);
  R(x + 1, y, 4, 6, ENEMY.plum);
  R(x, y + 1, 6, 4, ENEMY.plum);
  R(x + 1, y + 1, 2, 1, ENEMY.plumLight);
}

const GALLERY: LedgeLook = { body: mix(M.hallBeam, WHITE, 0.35), top: mix(M.hallBeam, WHITE, 0.6), edge: M.hallBeam, joint: M.hallBeam };
const ROOFING: LedgeLook = { body: ROOF.red, top: mix(ROOF.red, WHITE, 0.25), edge: mix(ROOF.red, INK, 0.4), joint: mix(ROOF.red, INK, 0.25) };
const RIDGE: LedgeLook = { body: M.turf, top: mix(M.turf, WHITE, 0.25), edge: M.oakDark, joint: mix(M.turf, INK, 0.2) };
const STEPS: LedgeLook = { body: M.plasterShade, top: M.plaster, edge: mix(M.plasterShade, INK, 0.35), joint: M.plasterShade };

export const BYGDOY: LevelDef = {
  id: "bygdoy",
  rune: 10,
  // The passage under the loft, up to its slinger: the shield's key over him.
  shieldLesson: [LOFT[0] * TILE - 8, (LOFT[1] + 3) * TILE],
  name: "Bygdøy",
  landmark: { nb: "Museumsskipene", en: "The museum ships" },
  place: { nb: "Museene på Bygdøy", en: "The museums on Bygdøy" },
  sky: "day",
  map: MAP,
  legend: { solid: "QPHK#BL", oneWay: "=_-^", water: "~" },
  ramps: [],
  carriers: CARRIERS,
  timed: OARS,
  cannons: [],
  enemies: ENEMIES,
  grounds: GROUNDS,
  // The view goes four rows under the floor.
  floor: () => (W + 4) * TILE,
  signs: [
    {
      label: { nb: "Bygdøy", en: "Bygdøy" },
      lines: { nb: ["Skip som har vært lenger enn de fleste.", "Ingen av dem skal noe sted nå."], en: ["Ships that have been further than most.", "None of them is going anywhere now."] }
    },
    {
      label: { nb: "Fram", en: "Fram" },
      lines: { nb: ["Fram har vært lenger nord og lenger sør enn noe annet treskip.", "Dekket har ikke glemt det."], en: ["Fram has been further north and further south than any other wooden ship.", "The deck has not forgotten."] }
    },
    {
      label: { nb: "Kon-Tiki", en: "Kon-Tiki" },
      lines: { nb: ["Kon-Tiki: balsa og tau, 101 dager over Stillehavet.", "Balsaen her ute er nyere. Den tåler mindre."], en: ["Kon-Tiki: balsa and rope, 101 days across the Pacific.", "The balsa out here is newer. It takes less."] }
    },
    {
      label: { nb: "Osebergskipet", en: "The Oseberg ship" },
      lines: { nb: ["Begravd i 834, gravd opp i 1904.", "Det har ikke vært rodd siden."], en: ["Buried in 834, dug up in 1904.", "It has not been rowed since."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => {
      drawOsloHills(v.sky, FLOOR);
      farCity();
    },
    mid: (v) => drawFjord(v.t, FLOOR),
    near: (v) => {
      woods(v.t);
      drawGulls(v.t, 30);
    },
    back(v) {
      radhusbrygga(v);
      pier();
      beach();
      boathouse(40, 44);
      boathouse(56, 61);
      framHall();
      fram();
      gjoa();
      kontikiHall();
      shipHall();
      longship();
      loft();
      for (const c of [221, 230]) storehouse(c);
      gableEnd();
    },
    front(v) {
      DECKS.forEach((d) => deckArt(d, v.t));
      const s = v.grounds as Ground | null;
      if (s) PADS.forEach((p, i) => bundle(p, s.pads[i], v.t));
    },
    ground: (c) => (c < 69 ? { top: P.sand, dot: P.sandDark, fill: mix(P.sandDark, P.earth, 0.5) } : c < 122 || (c >= 157 && c < 205) ? { top: mix(M.deck, WHITE, 0.2), dot: M.deck, fill: mix(STONE.base, M.deck, 0.3) } : { top: P.grass, dot: P.grassDark, fill: P.earth }),
    tile(t, c, r, x, y) {
      if (t === "B") {
        rowboat(x, y);
        return true;
      }
      if (t === "H" || t === "L") return true;
      if (t === "K") {
        rock(c, r, x, y);
        return true;
      }
      // The halls' floors: polished slabs, their joints.
      if (t === "#" && ((c >= 69 && c < 122) || (c >= 157 && c < 205))) {
        hallFloor(c, r, x, y);
        return true;
      }
      return false;
    },
    ledges: { "=": GALLERY, _: ROOFING, "-": STEPS, "^": RIDGE },
    carrier(i, at, v) {
      if (i === 0) ferry(at, v.t);
      else if (i === 1) balsaRaft(at);
      else reedBoat(at);
    },
    timed: (i, v) => drawOar(OARS[i], v.t, M.oakLight),
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "crab") crab(e);
      else if (e.def.look === "penguin") penguin(e);
      else if (e.def.look === "slinger") slinger(e, v.t);
      else return false;
      return true;
    },
    shot: (s) => {
      stone(s);
      return true;
    }
  }
};
