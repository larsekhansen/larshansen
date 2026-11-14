import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import { carrierShown, pathPeriod, type CarrierDef, type Path } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { R, gable, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { GLASS, INK, LAMP, METAL, PAINT, PALETTE, PLANTS, ROOF, STONE, TRAM, WHITE } from "@larshansen/pixelkit/palette";
import * as HILL from "@larshansen/pixelkit/swatches/hill";
import { pulseAge, pulsePhase } from "@larshansen/pixelkit/timed";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { Zone } from "@larshansen/pixelkit/zone";
import type { EnemyDef } from "../game/enemies";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 9, rune E: Ekeberg. Always evening, under the banded sky of The Scream, which Munch set on
// this hillside. Up from Gamlebyen on the tram's roof as it climbs its trestle to the top of the
// cliff; through the sculpture park, where the sculptures are the ledges and the wind comes in gusts
// (leaves stream through first, for a second, then it pushes); across the old quarry on the backs of
// three sheep, the only way over; up the bank to the viewpoint. From the railing the city lies below,
// and every place he has cleared shows a light in it. Rune E at the end of the railing.
// New: gusts on a beat (zones that warn and then push), and sheep that stand on their knolls.
//
//   #  grass and soil   K  rock   A  the stone gate   D  the viewpoint's deck   u  a sculpture's top
//   =  a stone plinth   v  the tram's cutting (a fall)   ~  water   e  a sheep   b  a bench
//   $  skilling   &  brown cheese   t  T-banen
//
// Sections: Gamlebyen and the tram (teach: the tram's roof up the trestle, and a gust over flat
// ground, where nothing can go wrong); the sculpture park (practise: sculptures as ledges, gusts over
// small drops and a pond); the quarry (twist: the sheep, bounce to bounce, steering through a gust);
// the bank and the viewpoint (set piece: the city lit below, the rune at the end of the railing).

const COLS = 256;
const ROWS = 24;
/** The street in Gamlebyen, the cliff top and the park, the quarry's far rim, the viewpoint's terrace. */
export const G0 = 20;
export const G1 = 12;
export const QR = 13;
export const T = 8;
const b = mapBuilder(COLS, ROWS);

// --- Gamlebyen, the trestle, the cliff top --------------------------------------------------------------
b.ground(0, 44, G0);
// The cliff, and at its top the slot where the tram goes down into the hill after its stop.
b.ground(45, 48, G1 + 2, "K");
b.fill(45, 48, G1, G1 + 1, "v");
// A stone gate, the first sculpture, over the path at the top: he walks under its lintel.
b.fill(51, 52, 9, 10, "A");

// --- The sculpture park -----------------------------------------------------------------------------------
b.ground(49, 141, G1);
b.fill(75, 79, G1, G1 + 1, ".");
b.fill(89, 90, G1, G1 + 1, "~");
b.fill(98, 103, G1, G1 + 1, ".");
b.fill(115, 118, G1, G1 + 1, ".");
// The sculptures' tops: a head, a ring, a block, a reclining figure, a tall one, two heads.
b.run(81, 82, 10, "u");
b.run(85, 87, 8, "u");
b.run(92, 94, 10, "u");
b.run(105, 109, 10, "u");
b.run(112, 112, 8, "u");
b.run(121, 122, 10, "u");

// --- The quarry -------------------------------------------------------------------------------------------
b.fill(142, 157, 18, 19, "~");
b.ground(142, 157, 20, "K");
/**
 * The knolls the three sheep stand on, in the quarry's pond: each a rock three tiles wide, so a
 * bounce that misses a sheep's back lands on the rock beside it, to try again from, not in the water.
 */
export const KNOLLS = [145, 150, 155];
for (const c of KNOLLS) b.fill(c - 1, c + 1, 18, ROWS - 1, "K");

// --- The bank, and the viewpoint ---------------------------------------------------------------------------
b.ground(158, 164, QR);
b.ground(165, 170, 12);
b.ground(171, 176, 11);
b.ground(177, 179, 13);
b.ground(180, 191, 11);
// Two sculptures up the bank's face, three tiles of it.
b.run(186, 187, 9, "u");
b.run(190, 191, 7, "u");
b.ground(192, 215, T);
b.fill(192, 215, T + 1, ROWS - 1, "K");
// The deck out over the cliff: one slab thick, the city below it.
b.run(216, COLS - 1, T, "D");
// A plinth with a bench on it, up from the deck; the stone post at the end of the railing.
b.run(219, 221, T - 2, "=");
b.fill(251, 251, T - 2, T - 1, "K");

// Marks: the start, the doors, signs, flags, benches, sheep, the rune, the bracteate, the cheese.
b.put(2, G0 - 1, "t").put(4, G0 - 1, "S").put(7, G0 - 1, "i");
b.put(54, G1 - 1, "f").put(57, G1 - 1, "i").put(71, G1 - 1, "f").put(123, G1 - 1, "f").put(84, G1 - 1, "i").put(127, G1 - 1, "b").put(133, G1 - 1, "f");
for (const c of KNOLLS) b.put(c, 17, "e");
b.put(161, QR - 1, "f").put(202, T - 1, "f").put(220, T - 3, "b").put(212, T - 1, "i");
b.put(251, T - 3, "r").put(86, 3, "o").put(112, 5, "&");

// Skilling: along the street, the tram's roof up the trestle, over the cutting, in the gusts, over the
// hollows and the pond and up the sculptures, round the bench, over the quarry with the sheep, up the
// bank, along the deck.
const COINS: [number, number][] = [
  [9, 19], [10, 19], [11, 19],
  [20, 17], [24, 16], [28, 15], [32, 14], [36, 13], [40, 12],
  [26, 19], [30, 19], [34, 19], [38, 19],
  [50, 11], [53, 11], [55, 11],
  [60, 11], [62, 11], [64, 11], [66, 11],
  [76, 13], [77, 13], [78, 13],
  [81, 9], [82, 9], [85, 7], [87, 7],
  [89, 10], [90, 10],
  [92, 9], [99, 13], [101, 13], [103, 13],
  [106, 9], [108, 9], [112, 7],
  [116, 13], [117, 13], [121, 9], [122, 9],
  [140, 9], [145, 12], [147, 11], [150, 12], [152, 11], [155, 12], [157, 11],
  [168, 11], [174, 10], [178, 12], [186, 8], [190, 6],
  [196, 7], [199, 7], [208, 7], [226, 7], [230, 7], [238, 7], [242, 7], [246, 7]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The tram ---------------------------------------------------------------------------------------------
/** The tram's roof in the street and at the top of the cliff: a jump up from either. */
export const ROOF0 = G0 * TILE - 26;
export const ROOF1 = G1 * TILE - 26;
const TRAM_W = 4 * TILE;
/** Along the street to its stop, up the trestle, standing at the top over its slot, and down into the hill. */
const TRAM_LINE: Path = {
  kind: "path",
  points: [
    { x: -5 * TILE, y: ROOF0 },
    { x: 13 * TILE, y: ROOF0 },
    { x: 18 * TILE, y: ROOF0 },
    { x: 44 * TILE, y: ROOF1 },
    { x: 45 * TILE, y: ROOF1 },
    { x: 45 * TILE, y: ROOF1 + 96 }
  ],
  w: TRAM_W,
  speed: 1.5,
  wait: 0,
  stops: [
    { at: 1, steps: 150 },
    { at: 4, steps: 90 }
  ]
};
/** Three trams on the line, evenly spaced: never much more than three seconds to wait. */
const TRAMS_N = 3;
TRAM_LINE.wait = TRAMS_N - (pathPeriod(TRAM_LINE) % TRAMS_N);
export const TRAMS: Path[] = Array.from({ length: TRAMS_N }, (_, i) => ({ ...TRAM_LINE, offset: (i * pathPeriod(TRAM_LINE)) / TRAMS_N }));
const CARRIERS: CarrierDef[] = TRAMS;

// --- The gusts -------------------------------------------------------------------------------------------
/** A gust's beat: three seconds still, a second of leaves, a second and a half of wind. */
const BEAT = { rest: 180, warn: 60, live: 90 };
/** Over flat ground first, then the pond, a hollow, the quarry, the top of the bank, the end of the deck. All blow back towards the city's side, against him. */
export const GUSTS: Zone[] = [
  { x: 58 * TILE, y: 4 * TILE, w: 10 * TILE, h: (G1 - 4) * TILE, push: { x: -0.45, y: 0 }, beat: BEAT },
  { x: 88 * TILE, y: 3 * TILE, w: 4 * TILE, h: (G1 + 2 - 3) * TILE, push: { x: -0.35, y: 0 }, beat: { ...BEAT, offset: 70 } },
  { x: 97 * TILE, y: 3 * TILE, w: 8 * TILE, h: (G1 + 2 - 3) * TILE, push: { x: -0.35, y: 0 }, beat: { ...BEAT, offset: 150 } },
  { x: 142 * TILE, y: 4 * TILE, w: 16 * TILE, h: 14 * TILE, push: { x: -0.3, y: 0 }, beat: { rest: 260, warn: 60, live: 90 } },
  { x: 192 * TILE, y: 0, w: 9 * TILE, h: T * TILE, push: { x: -0.4, y: 0 }, beat: { ...BEAT, offset: 40 } },
  { x: 234 * TILE, y: 0, w: 12 * TILE, h: T * TILE, push: { x: -0.4, y: 0 }, beat: { ...BEAT, offset: 120 } }
];

/**
 * A magpie alone in the street first; wasps under the trestle; nothing in the first gust, where the
 * wind is the lesson; squirrels on the sculptures throwing cones, crows over the pond and the deck, a
 * magpie in the last hollow, hedgehogs before the quarry and on the bank, magpies on the bank and the deck.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "magpie", c: 10, r: G0 - 1, range: 2 },
  { kind: "flyer", look: "wasp", c: 28, r: G0 - 3, range: 3, rise: 6, period: 150 },
  { kind: "flyer", look: "wasp", c: 38, r: G0 - 4, range: 2, rise: 8, period: 140, offset: 40 },
  { kind: "spiky", look: "hedgehog", c: 137, r: G1 - 1, range: 0, speed: 0 },
  { kind: "thrower", look: "squirrel", c: 97, r: G1 - 1, period: 200 },
  { kind: "flyer", look: "crow", c: 100, r: 9, range: 3, rise: 8, period: 170 },
  { kind: "walker", look: "magpie", c: 116, r: G1 + 1, range: 1 },
  { kind: "thrower", look: "squirrel", c: 107, r: 9, period: 210, offset: 80 },
  { kind: "walker", look: "magpie", c: 168, r: 11, range: 2 },
  { kind: "spiky", look: "hedgehog", c: 178, r: 12, range: 0, speed: 0 },
  { kind: "flyer", look: "crow", c: 196, r: 4, range: 2, rise: 6, period: 160 },
  { kind: "walker", look: "magpie", c: 230, r: T - 1, range: 3 },
  { kind: "flyer", look: "crow", c: 243, r: 5, range: 2, rise: 6, period: 180, offset: 60 }
];

export const EKEBERG_RULES = { COLS, ROWS, CARRIERS };

// --- Art -----------------------------------------------------------------------------------------------------
const P = PALETTE;
const at = (c: number, r: number) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? MAP[r][c] : ".");
function surfaceRow(c: number) {
  for (let r = 0; r < ROWS; r++) if ("#KDA".includes(at(c, r))) return r;
  return ROWS;
}
/** Where the panorama is centred: the middle of the deck, so the city is laid out under him at the railing. */
const VIEW_X = 234 * TILE;
/** The camera's top while he stands on the deck, about: the far layers are placed for it, and move a little less than the world up and down. */
const CAM_DECK = T * TILE - 112;
const fy = (screenY: number) => screenY + view.camY - (view.camY - CAM_DECK) * 0.12;
/** A layer's x for something `dx` from the panorama's centre, rigid in that layer. */
const pan = (dx: number, f: number) => layerX(VIEW_X, f) + dx;

/** The Scream's sky: five bands of colour waving over the hill, darker blue above them. */
function screamSky(t: number) {
  const tt = view.reduced ? 0 : t;
  for (let k = 0; k < 5; k++)
    for (let x = 0; x < view.w; x += 2) {
      const wx = layerWorldX(x, 0.12);
      const y = fy(28 + k * 12) + Math.round(Math.sin(wx * 0.006 + k * 1.3 + tt * 0.004) * 6 + Math.sin(wx * 0.017 + k) * 2);
      column(x, y, y + 4, HILL.bands[k]);
      column(x + 1, y, y + 4, HILL.bands[k]);
    }
}

/** The places of the line, as seen from the viewpoint: where each lies in the panorama (screen x from its centre, and y with him on the deck). */
const PLACES: { id: string; dx: number; y: number }[] = [
  { id: "nordmarka", dx: -150, y: 86 },
  { id: "holmenkollen", dx: -112, y: 80 },
  { id: "slottet", dx: -78, y: 118 },
  { id: "radhuset", dx: -50, y: 116 },
  { id: "akershus", dx: -24, y: 146 },
  { id: "stortinget", dx: -2, y: 126 },
  { id: "langkaia", dx: 28, y: 154 },
  { id: "akerselva", dx: 62, y: 112 },
  { id: "nabolaget", dx: 112, y: 120 }
];

/**
 * The city below, from Ekeberg, the level's picture: the far ridge with the ski jump on it, the roofs
 * going down to the fjord in rows, a landmark for each place on the line, and in every place he has
 * cleared a light: a bright lamp with a glow round it, brighter than any window.
 */
function city(v: View) {
  const f = 0.12;
  const L = (dx: number) => pan(dx, f);
  // The far ridge: Holmenkollen and Nordmarka, their forest dark, spruce tips along it.
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, f);
    const h = 16 + 8 * Math.sin(wx * 0.0021 + 1.2) + 3 * Math.sin(wx * 0.009);
    column(x, fy(98) - h, fy(150), HILL.ridge);
    if (((Math.floor(wx / 2) * 7) % 5) === 0) column(x, fy(98) - h - 2, fy(98) - h, HILL.ridge);
  }
  // The ski jump on the ridge, a white line down its side.
  for (let k = 0; k < 14; k++) box(L(-112) - 7 + k, fy(77) + Math.round(k * 0.6), 1, 2, mix(WHITE, HILL.ridge, 0.35));
  // The roofs, in three rows going down to the water, the furthest palest; gables, a red or green roof now and then, windows lit.
  for (let row = 0; row < 4; row++) {
    const base = fy(112 + row * 11);
    const wall = row === 0 ? HILL.cityFar : row === 1 ? mix(HILL.cityFar, HILL.cityLight, 0.5) : row === 2 ? HILL.cityLight : HILL.city;
    for (let x = -((row * 5) % 9); x < view.w; ) {
      const wx = layerWorldX(x, f);
      const n = Math.floor(wx / 9 + row * 3);
      const w = 6 + (n % 4);
      const h = 4 + ((n * 7) % 6) + (n % 11 === 0 ? 8 : 0);
      const roof = n % 5 === 0 ? HILL.roofRed : n % 7 === 0 ? HILL.roofTeal : mix(wall, INK, 0.25);
      box(x, base - h, w, h + 14, wall);
      for (let k = 0; k < 3; k++) box(x + k, base - h - 3 + k, w - k * 2, 1, roof);
      if (n % 3 !== 1) lit(x + 2, base - h + 2 + (n % 3), 1, 1);
      if (n % 4 === 0 && w > 7) lit(x + w - 3, base - h + 3, 1, 1);
      if (h > 9) lit(x + 2, base - h + 6, 1, 1);
      x += w + 1;
    }
  }
  // The fjord down to the bottom, deeper blue further out, its glints, and Hovedøya.
  box(0, fy(156), view.w, view.h + 200, HILL.fjord);
  const deep = mix(HILL.fjord, INK, 0.2);
  for (let x = 0; x < view.w; x++) box(x, fy(178) + Math.round(2 * Math.sin(layerWorldX(x, f) * 0.05)), 1, view.h + 200, deep);
  for (let i = 0; i < 28; i++) box(((i * 53 + Math.floor(v.t / 30)) % (view.w + 20)) - 10, fy(160 + (i % 7) * 5), 4 + (i % 3), 1, HILL.fjordLight);
  for (let k = -16; k <= 16; k++) box(L(150) + k, fy(170) - Math.round(4 * (1 - (k / 16) ** 2)), 1, 5, mix(HILL.oak, HILL.fjord, 0.4));
  // The boat out to Nesodden with its wake, a sailing boat, and the red buoy off the quay.
  const ferry = L(-70) + (view.reduced ? 0 : Math.floor(v.t / 40) % 60);
  box(ferry, fy(184) - 3, 9, 3, WHITE);
  box(ferry + 2, fy(184) - 5, 4, 2, mix(WHITE, HILL.city, 0.3));
  lit(ferry + 3, fy(184) - 2, 4, 1);
  for (let k = 1; k < 10; k++) box(ferry - k * 2, fy(184) - 1 + (k % 2), 2, 1, mix(HILL.fjordLight, HILL.fjord, k / 10));
  box(L(96), fy(192) - 1, 6, 2, mix(WHITE, HILL.fjord, 0.2));
  for (let k = 0; k < 6; k++) box(L(98), fy(192) - 2 - k, Math.max(1, 3 - Math.floor(k / 2)), 1, mix(WHITE, HILL.fjord, 0.1));
  box(L(46), fy(166) - 2, 2, 2, PALETTE.sail);
  box(L(46), fy(166) - 3, 2, 1, mix(PALETTE.sail, WHITE, 0.4));
  // The places: the palace on its rise, Rådhuset's two towers, the fortress on the water, Stortinget, the Opera's white wedge, the river's valley, Vålerenga's church.
  box(L(-84), fy(112), 13, 6, mix(PALETTE.sand, HILL.city, 0.55));
  box(L(-53), fy(100), 4, 18, mix(PALETTE.sailStripe, HILL.city, 0.55));
  box(L(-46), fy(98), 4, 20, mix(PALETTE.sailStripe, HILL.city, 0.55));
  box(L(-30), fy(146), 14, 8, mix(STONE.base, HILL.city, 0.5));
  box(L(-26), fy(140), 2, 6, mix(METAL.copper, HILL.city, 0.4));
  box(L(-7), fy(118), 11, 8, mix(PALETTE.sand, HILL.city, 0.55));
  for (let k = 0; k < 14; k++) box(L(22) + k, fy(156) - Math.floor(k / 2), 1, Math.floor(k / 2) + 1, mix(WHITE, HILL.fjord, 0.25));
  for (let y = 0; y < 44; y++) box(L(62) + Math.round(Math.sin(y * 0.3) * 2), fy(112) + y, 2, 1, mix(HILL.fjordLight, HILL.city, 0.3));
  box(L(110), fy(108), 3, 12, HILL.cityLight);
  box(L(106), fy(114), 11, 6, HILL.cityLight);
  // The lights of the places he has cleared.
  for (const p of PLACES) {
    if (!v.cleared.includes(p.id)) continue;
    const x = L(p.dx);
    const y = fy(p.y);
    box(x - 4, y - 1, 9, 3, "rgba(255, 211, 107, 0.3)");
    box(x - 1, y - 4, 3, 9, "rgba(255, 211, 107, 0.3)");
    box(x - 2, y - 2, 5, 5, "rgba(255, 211, 107, 0.45)");
    lit(x - 1, y - 1, 3, 3);
    box(x - 1, y - 1, 3, 3, LAMP);
  }
}

/**
 * The hillside's oaks behind the path, in the evening: a wooded slope that follows the ground a little
 * above it, smoothly, and dark crowns on it. Not past the bank: there the view opens over the city.
 */
function midOaks() {
  const top: number[] = [];
  for (let x = 0; x < view.w; x++) {
    const c = Math.floor((view.camX + x) / TILE);
    let sum = 0;
    for (let k = -8; k <= 8; k++) sum += Math.min(G0, surfaceRow(Math.max(0, Math.min(COLS - 1, c + k))));
    top.push(c >= 200 ? Infinity : (sum / 17) * TILE - 34 + Math.round(4 * Math.sin(layerWorldX(x, 0.2) * 0.02)));
  }
  for (let x = 0; x < view.w; x++) if (top[x] < Infinity) column(x, top[x], view.camY + view.h, mix(HILL.oakDark, HILL.ridge, 0.35));
  for (let i = 0; i < 90; i++) {
    const wx = i * 61 + ((i * 41) % 40);
    const x = layerX(wx, 0.2);
    if (x < -16 || x > view.w + 16) continue;
    const foot = top[Math.max(0, Math.min(view.w - 1, x))];
    if (foot === Infinity) continue;
    const r = 7 + ((i * 7) % 5);
    for (let yy = -r; yy <= r; yy++) {
      const half = Math.floor(r * 1.25 * Math.sqrt(1 - (yy * yy) / (r * r)));
      box(x + 1 - half, foot - r + 4 + yy, half * 2, 1, mix(yy < -r / 3 ? HILL.oakLight : HILL.oak, HILL.ridge, 0.3));
    }
  }
}

/** Nearer: birches and lamp posts along the park's paths. */
function nearPark() {
  for (let i = 0; i < 50; i++) {
    const wx = i * 131 + ((i * 29) % 60);
    const x = layerX(wx, 0.4);
    if (x < -16 || x > view.w + 16) continue;
    const c = Math.max(0, Math.min(COLS - 1, Math.floor((view.camX + x) / TILE)));
    if (c >= 200 || at(c, surfaceRow(c)) === "K") continue;
    const foot = surfaceRow(c) * TILE + 2;
    if (i % 3 === 0) {
      box(x, foot - 40, 1, 40, mix(METAL.lampPost, HILL.ridge, 0.2));
      box(x - 2, foot - 42, 5, 2, mix(METAL.lampPost, HILL.ridge, 0.2));
      lit(x - 1, foot - 40, 3, 2);
      continue;
    }
    box(x, foot - 34, 2, 34, mix(P.wool, HILL.ridge, 0.25));
    for (let y = foot - 30; y < foot; y += 6) box(x, y, 1, 1, mix(INK, HILL.ridge, 0.3));
    for (let yy = -8; yy <= 8; yy++) box(x + 1 - Math.floor(7 * Math.sqrt(1 - (yy * yy) / 64)), foot - 44 + yy, Math.floor(7 * Math.sqrt(1 - (yy * yy) / 64)) * 2, 1, mix(yy < -3 ? HILL.oakLight : HILL.grass, HILL.ridge, 0.25));
  }
}

/** Gamlebyen at the foot of the hill: old wooden houses and a brick one, the tram stop's shelter, the way down to the T-bane. */
function gamlebyen(v: View) {
  const g = G0 * TILE;
  const houses: [number, number, number, string, string][] = [
    [0, 5, 46, PAINT.ochre, PAINT.ochreLine],
    [5.5, 4, 40, PAINT.red, PAINT.redLine],
    [9.8, 4.5, 50, PAINT.mint, PAINT.mintLine]
  ];
  for (const [c, w, h, wall, line] of houses) {
    const x = c * TILE;
    const ww = w * TILE;
    R(x, g - h, ww, h, wall);
    for (let k = x + 3; k < x + ww - 2; k += 4) R(k, g - h, 1, h, line);
    R(x, g - h, 2, h, PAINT.trim);
    R(x + ww - 2, g - h, 2, h, PAINT.trim);
    gable(x - 3, g - h, ww + 6, 16, ROOF.red);
    for (const wx of [x + 8, x + ww - 18]) {
      R(wx - 1, g - h + 9, 12, 12, PAINT.trim);
      R(wx, g - h + 10, 10, 10, GLASS.farWindow);
      light(wx, g - h + 10, 4, 4);
      light(wx + 5, g - h + 10, 5, 4);
    }
  }
  tbaneDoor(v.doors.get("tbane"));
  // The tram stop: a glass shelter and its sign.
  const sx = 14 * TILE;
  R(sx, g - 30, 28, 2, METAL.lampPost);
  R(sx + 1, g - 28, 1, 28, METAL.lampPost);
  R(sx + 26, g - 28, 1, 28, METAL.lampPost);
  R(sx + 2, g - 26, 24, 18, mix(GLASS.pane, WHITE, 0.3));
  R(sx + 36, g - 40, 1, 40, METAL.lampPost);
  R(sx + 31, g - 44, 11, 6, TRAM.body);
  R(sx + 33, g - 42, 7, 2, WHITE);
}

/** The trestle the tram climbs: a steel girder from the street to the top of the cliff, on legs, cross-braced. */
function trestle() {
  const x0 = 18 * TILE + TRAM_W / 2;
  const x1 = 44 * TILE + TRAM_W / 2;
  const y0 = G0 * TILE + 2;
  const y1 = G1 * TILE + 2;
  const y = (x: number) => Math.round(y0 + ((x - x0) / (x1 - x0)) * (y1 - y0));
  for (let x = x0; x <= x1; x++) {
    R(x, y(x) - 2, 1, 5, HILL.trestle);
    R(x, y(x) - 2, 1, 1, METAL.rail);
  }
  for (let x = x0 + 24; x < x1; x += 32) {
    R(x, y(x) + 3, 3, G0 * TILE - y(x) - 3, HILL.trestle);
    if (x + 32 < x1) for (let k = 0; k < 32; k += 2) R(x + k, y(x) + 3 + Math.round(((G0 * TILE - y(x) - 3) * k) / 32), 2, 1, mix(HILL.trestle, INK, 0.2));
  }

}

/** The stone gate at the top: two legs and a lintel. And the slot the tram goes down into, framed in granite, a sign by it. */
function stoneGate() {
  const x = 51 * TILE;
  for (const lx of [x - 4, x + 2 * TILE - 4]) {
    R(lx, 11 * TILE, 8, (G1 - 11) * TILE, HILL.granite);
    R(lx, 11 * TILE, 2, (G1 - 11) * TILE, HILL.graniteLight);
    R(lx, G1 * TILE - 3, 8, 3, HILL.graniteDark);
  }
  R(45 * TILE - 2, G1 * TILE - 2, 4 * TILE + 4, 2, HILL.graniteDark);
  R(48 * TILE + TILE + 2, G1 * TILE - 22, 1, 20, METAL.lampPost);
  R(48 * TILE + TILE - 3, G1 * TILE - 30, 11, 8, TRAM.body);
  R(48 * TILE + TILE - 1, G1 * TILE - 28, 7, 1, WHITE);
  R(48 * TILE + TILE - 1, G1 * TILE - 25, 5, 1, WHITE);
}

/** A sculpture under its walkable top: a bronze head, a steel ring, a granite block, a reclining figure, a tall figure, two heads. */
function sculptures() {
  const g = G1 * TILE;
  // A bronze head, eyes closed.
  {
    const x = 81 * TILE;
    const top = 10 * TILE;
    for (let k = 0; k < g - top; k++) {
      const half = Math.round(15 * Math.sqrt(1 - ((k - 12) / 26) ** 2)) || 4;
      R(x + 16 - half, top + k, half * 2, 1, k % 7 === 0 ? HILL.bronzeLight : HILL.bronze);
    }
    R(x + 8, top + 14, 6, 1, HILL.bronzeDark);
    R(x + 20, top + 14, 6, 1, HILL.bronzeDark);
    R(x + 14, top + 22, 4, 6, HILL.bronzeDark);
  }
  // A steel ring on a plinth.
  {
    const cx = 86 * TILE + 8;
    const cy = 8 * TILE + 24;
    for (let a = 0; a < 360; a += 2) {
      const r = (a * Math.PI) / 180;
      R(Math.round(cx + Math.cos(r) * 22), Math.round(cy + Math.sin(r) * 22), 4, 4, a < 180 ? HILL.steelDark : HILL.steel);
    }
    R(cx - 14, g - 10, 28, 10, HILL.granite);
  }
  // A granite block, rough-cut.
  R(92 * TILE, 10 * TILE, 3 * TILE, 2 * TILE, HILL.granite);
  for (let y = 10 * TILE + 4; y < g; y += 7) R(92 * TILE, y, 3 * TILE, 1, HILL.graniteDark);
  R(92 * TILE, 10 * TILE, 3 * TILE, 2, HILL.graniteLight);
  // A reclining bronze figure: a long body, a raised knee, a head on an elbow.
  {
    const x = 105 * TILE;
    R(x, 10 * TILE + 4, 5 * TILE, 10, HILL.bronze);
    R(x, 10 * TILE + 4, 5 * TILE, 2, HILL.bronzeLight);
    R(x + 52, 10 * TILE - 8, 14, 14, HILL.bronze);
    R(x + 4, 10 * TILE - 6, 10, 10, HILL.bronze);
    R(x + 8, 10 * TILE + 14, 64, g - 10 * TILE - 14, HILL.granite);
  }
  // A tall figure, thin, arms up.
  {
    const x = 112 * TILE + 6;
    R(x, 8 * TILE + 6, 4, g - 8 * TILE - 6, HILL.bronzeDark);
    R(x - 1, 8 * TILE + 2, 6, 6, HILL.bronze);
    R(x - 5, 8 * TILE + 10, 4, 2, HILL.bronzeDark);
    R(x + 5, 8 * TILE + 10, 4, 2, HILL.bronzeDark);
    R(x - 4, g - 6, 12, 6, HILL.granite);
  }
  // Two heads, side by side, on one plinth.
  for (const dx of [0, 16]) {
    const x = 121 * TILE + dx;
    for (let k = 0; k < 18; k++) R(x + 2 + Math.round(Math.abs(k - 8) / 3), 10 * TILE + 4 + k, 12 - Math.round(Math.abs(k - 8) / 1.5), 1, HILL.bronze);
  }
  R(121 * TILE - 2, 10 * TILE + 22, 36, g - 10 * TILE - 22, HILL.granite);
  // Up the bank: a stone column, and a figure with a raised arm.
  R(186 * TILE + 2, 9 * TILE + 4, 2 * TILE - 4, 2 * TILE - 4, HILL.granite);
  for (let y = 9 * TILE + 8; y < 11 * TILE; y += 6) R(186 * TILE + 2, y, 2 * TILE - 4, 1, HILL.graniteDark);
  R(190 * TILE + 8, 7 * TILE + 4, 12, 4 * TILE - 4, HILL.bronze);
  R(190 * TILE + 8, 7 * TILE + 4, 2, 4 * TILE - 4, HILL.bronzeLight);
  R(190 * TILE + 4, 7 * TILE + 10, 20, 3, HILL.bronzeDark);
}

/** The old quarry: its faces cut back in benches behind, lighter on each bench's top, drill marks down them; the pond in it, the sheep's knolls. */
function quarry() {
  const x0 = 142 * TILE;
  const x1 = 158 * TILE;
  const benches = [
    { y: G1 * TILE, h: 22, inset: 0 },
    { y: G1 * TILE + 22, h: 26, inset: 10 },
    { y: G1 * TILE + 48, h: 48, inset: 22 }
  ];
  // A small number from a place, so the face is cut the same way on every visit.
  const n = (a: number, b: number) => {
    const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  benches.forEach((bn, b) => {
    R(x0, bn.y, x1 - x0, bn.h, HILL.quarry);
    // Where a slab came away, the face is fresher, and paler.
    for (const [dx, w] of [[30 + b * 47, 34], [150 - b * 23, 22]] as const) R(x0 + dx, bn.y + 3, w, bn.h - 6, mix(HILL.quarry, HILL.quarryLight, 0.45));
    R(x0 + bn.inset, bn.y, x1 - x0 - bn.inset * 2, 2, HILL.quarryLight);
    // The drill holes the blasters left: in twos and threes, not evenly, some only half down.
    for (let x = x0 + 4 + bn.inset, k = 0; x < x1 - bn.inset - 2; k++) {
      const len = n(b, k) < 0.3 ? Math.floor((bn.h - 5) / 2) : bn.h - 5;
      R(x, bn.y + 3, 1, len, HILL.quarryDark);
      R(x + 1, bn.y + 3, 1, len, mix(HILL.quarry, HILL.quarryLight, 0.6));
      x += n(k, b) < 0.5 ? 5 : 13 + Math.floor(n(b + 3, k) * 18);
    }
    // A crack running down across it, and the rust stain from water that comes down it.
    let cx = x0 + 60 + b * 70;
    for (let y = bn.y + 2; y < bn.y + bn.h - 1; y++) {
      cx += n(y, b) < 0.5 ? 1 : 0;
      R(cx, y, 1, 1, mix(HILL.quarryDark, INK, 0.2));
      if (y > bn.y + 4) R(cx + 1, y, 2, 1, mix(HILL.quarry, HILL.bronze, 0.35));
    }
    R(x0, bn.y + bn.h - 1, x1 - x0, 1, HILL.quarryDark);
  });
  // A birch that has taken root on the second bench, and grass along the benches' tops.
  const bx = x0 + 196;
  const by = benches[1].y;
  R(bx, by - 26, 2, 26, PLANTS.birchBark);
  for (let y = by - 24; y < by; y += 5) R(bx, y, 1, 1, PLANTS.birchMark);
  for (let yy = -7; yy <= 7; yy++) {
    const half = Math.floor(7 * Math.sqrt(1 - (yy * yy) / 49));
    R(bx + 1 - half, by - 30 + yy, half * 2, 1, yy < -2 ? PLANTS.birchShine : PLANTS.birchLeaves);
  }
  for (const bn of benches.slice(1)) for (let x = x0 + bn.inset; x < x1 - bn.inset; x += 3) if (n(x, bn.y) < 0.35) R(x, bn.y - 1, 1, 2, HILL.grass);
  // Blocks that fell, at the foot of the lowest face.
  for (const [dx, w, h] of [[18, 9, 6], [27, 6, 4], [212, 11, 7], [224, 5, 3]] as const) {
    const fy = benches[2].y + benches[2].h;
    R(x0 + dx, fy - h, w, h, HILL.graniteDark);
    R(x0 + dx, fy - h, w, 1, HILL.granite);
  }
}

/** The viewpoint: Ekebergrestauranten behind the terrace, white and square; the railing along the deck; the old lamp at the end. */
function viewpoint(v: View) {
  const g = T * TILE;
  // The restaurant, set back from the terrace: white, flat-roofed, long windows lit.
  const x = 203 * TILE;
  R(x, g - 56, 12 * TILE, 56, HILL.restaurant);
  R(x, g - 56, 12 * TILE, 3, HILL.restaurantShade);
  R(x - 4, g - 30, 12 * TILE + 8, 3, HILL.restaurantShade);
  for (let k = x + 6; k < x + 12 * TILE - 10; k += 14) {
    R(k, g - 48, 10, 14, GLASS.farWindow);
    light(k, g - 48, 10, 14);
    R(k, g - 22, 10, 18, GLASS.farWindow);
    light(k, g - 22, 10, 18);
  }
  // The deck's slab, out over the cliff, on brackets.
  for (let sx = 217 * TILE; sx < COLS * TILE; sx += 3 * TILE) for (let k = 0; k < 8; k++) R(sx - k, g + 6 + k, 2 + k, 1, HILL.graniteDark);
  // The viewpoint's lamp at the end of the railing: lit once this level is cleared.
  const lx = 249 * TILE + 8;
  R(lx, g - 34, 2, 34, METAL.lampPost);
  R(lx - 3, g - 38, 8, 4, METAL.lampHat);
  if (v.cleared.includes("ekeberg") || v.runeAt !== null) {
    R(lx - 2, g - 34, 6, 3, LAMP);
    light(lx - 2, g - 34, 6, 3, "lamp");
  } else R(lx - 2, g - 34, 6, 3, METAL.lampGlass);
}

/** The railing along the deck, in front of him: posts and two rails. */
function railing() {
  const g = T * TILE;
  for (let x = 216 * TILE; x < 251 * TILE; x++) {
    R(x, g - 14, 1, 1, HILL.rail);
    R(x, g - 8, 1, 1, HILL.rail);
    if (x % 24 === 0) R(x, g - 14, 2, 14, HILL.rail);
  }
}

/** The leaves a gust carries: a few streaming through while it warns, many while it blows, the grass bending. */
function gustLeaves(z: Zone, t: number) {
  if (!z.beat) return;
  const phase = pulsePhase(t, z.beat);
  if (phase === "rest") return;
  const { age, of } = pulseAge(t, z.beat);
  const n = phase === "warn" ? 4 + Math.floor((age / of) * 8) : 22;
  const dir = Math.sign(z.push.x) || -1;
  const tt = view.reduced ? 0 : t;
  for (let i = 0; i < n; i++) {
    const speed = phase === "warn" ? 2.2 : 3.4;
    const run = (tt * speed + i * 53) % (z.w + 40);
    const x = dir < 0 ? z.x + z.w - run + 20 : z.x + run - 20;
    if (x < z.x - 4 || x > z.x + z.w + 4) continue;
    const y = z.y + ((i * 37) % Math.max(8, z.h - 8)) + Math.round(Math.sin(tt * 0.1 + i) * 3);
    R(x, y, 3, 2, i % 3 ? HILL.leaf : HILL.leafRed);
    R(x + (dir < 0 ? 3 : -1), y + 1, 1, 1, i % 3 ? HILL.leaf : HILL.leafRed);
    if (phase === "live" && i % 3 === 0) R(x - dir * 4 + (dir < 0 ? 0 : -8), y + 3, 10, 1, "rgba(255, 255, 255, 0.5)");
  }
}

/** A magpie: black and white, a long tail with a blue sheen, hopping. */
function magpie(x0: number, y0: number, dir: number, t: number) {
  const hop = view.reduced ? 0 : Math.floor(t / 9 + x0 / 7) % 2;
  const x = Math.round(x0 - 5);
  const y = Math.round(y0) - hop;
  const at = (dx: number) => (dir > 0 ? x + dx : x + 10 - dx);
  R(x + 2, y - 7, 6, 4, HILL.magpie);
  R(x + 3, y - 5, 4, 2, HILL.magpieWhite);
  R(at(7), y - 9, 3, 3, HILL.magpie);
  R(at(10), y - 8, 1, 1, INK);
  R(at(-3), y - 6, 5, 1, HILL.magpieBlue);
  R(at(-4), y - 7, 3, 1, HILL.magpie);
  R(at(4), y - 3, 1, 3, INK);
  R(at(6), y - 3, 1, 3, INK);
}

/** Grass on the hill: a top of evening grass with tufts, soil under. Rock: grey with lichen, in courses. */
function grassTile(c: number, r: number, x: number, y: number, m: TileMap) {
  R(x, y, TILE, TILE, HILL.soil);
  // Strata in the soil, and stones in it.
  R(x, y + 9, TILE, 2, SOIL_BAND);
  R(x + ((c * 7 + r * 3) % 12) + 1, y + ((c * 5 + r * 11) % 7) + 2, 3, 2, SOIL_STONE);
  R(x + ((c * 3 + r * 5) % 10) + 2, y + 13, 2, 1, mix(HILL.soil, INK, 0.3));
  if (m.isSolid(c, r - 1)) return;
  R(x, y, TILE, 3, HILL.grass);
  R(x, y + 3, TILE, 1, HILL.grassDark);
  if ((c * 7) % 5 === 0) R(x + ((c * 3) % 11) + 2, y - 2, 1, 2, HILL.grassDark);
  if ((c * 11) % 13 === 0) {
    R(x + ((c * 5) % 9) + 3, y - 3, 1, 3, HILL.grassDark);
    R(x + ((c * 5) % 9) + 2, y - 4, 3, 1, c % 2 ? PAINT.trim : HILL.leaf);
  }
}
function rockTile(c: number, r: number, x: number, y: number, m: TileMap) {
  R(x, y, TILE, TILE, HILL.quarry);
  R(x, y + 7, TILE, 1, HILL.quarryDark);
  R(x + ((c * 5 + r) % 8), y + 2, 6, 3, HILL.quarryLight);
  R(x + ((c * 3 + r * 7) % 10), y + 10, 4, 2, HILL.quarryLight);
  if (m.tileAt(c - 1, r) !== "K" && !m.isSolid(c - 1, r)) R(x, y, 1, TILE, HILL.quarryDark);
  if (m.tileAt(c + 1, r) !== "K" && !m.isSolid(c + 1, r)) R(x + TILE - 1, y, 1, TILE, HILL.quarryDark);
  if (!m.isSolid(c, r - 1) && m.tileAt(c, r - 1) !== "~") {
    R(x, y, TILE, 2, HILL.grass);
    R(x + 3, y + 2, 4, 1, STONE.moss);
  }
}

const SOIL_BAND = mix(HILL.soil, INK, 0.18);
const SOIL_STONE = mix(HILL.soil, STONE.base, 0.45);

/** The flourish: his own light comes on at the end of the railing, and the lights of the places he has been flare one after another, out across the city. */
function flourish(age: number, v: View) {
  const f = 0.12;
  const list = PLACES.filter((p) => v.cleared.includes(p.id));
  list.forEach((p, i) => {
    const k = age - i * 10;
    if (k < 0 || k > 40) return;
    const r = Math.round(2 + (k / 40) * 8);
    const x = pan(p.dx, f);
    const y = fy(p.y);
    const a = (1 - k / 40) * 0.6;
    // Drawn in the street layer, so placed by where the panorama shows it on the screen.
    R(view.camX + x - r, y - 1, r * 2 + 1, 3, `rgba(255, 220, 140, ${a.toFixed(2)})`);
    R(view.camX + x - 1, y - r, 3, r * 2 + 1, `rgba(255, 220, 140, ${a.toFixed(2)})`);
  });
}

export const EKEBERG: LevelDef = {
  id: "ekeberg",
  rune: 8,
  name: "Ekeberg",
  landmark: { nb: "Lia over Gamle Oslo", en: "The hillside above Gamle Oslo" },
  place: { nb: "Lia over Gamle Oslo", en: "The hillside above Gamle Oslo" },
  sky: "evening",
  map: MAP,
  legend: { solid: "#KAD", oneWay: "u=", water: "~v" },
  ramps: [],
  carriers: CARRIERS,
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  zones: GUSTS,
  sheepRange: 0,
  haze: [0.12, 0.2, 0.15],
  flourish: 130,
  floor: (x) => {
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE)));
    if (c >= 216) return ROWS * TILE;
    return Math.min(ROWS * TILE, (surfaceRow(c) + 3) * TILE);
  },
  signs: [
    {
      label: { nb: "Ekebergtrikken", en: "Ekebergtrikken" },
      lines: { nb: ["Trikken går opp lia. Taket er ikke for passasjerer.", "Men det er ingen som ser."], en: ["The tram goes up the hill. The roof is not for passengers.", "But nobody is looking."] }
    },
    {
      label: { nb: "Vinden", en: "The wind" },
      lines: { nb: ["Når bladene kommer, kommer vinden.", "Vent til den har gått, eller len deg inn i den."], en: ["When the leaves come, so does the wind.", "Wait until it has gone, or lean into it."] }
    },
    {
      label: { nb: "Skulpturparken", en: "Skulpturparken" },
      lines: { nb: ["Ikke klatre på kunsten.", "Det står ingenting om å hoppe."], en: ["Do not climb on the art.", "It says nothing about jumping."] }
    },
    {
      label: { nb: "Utsikten", en: "The view" },
      lines: { nb: ["Munch sto her. Himmelen var den samme.", "Lysene der nede er stedene du har vært."], en: ["Munch stood here. The sky was the same.", "The lights down there are the places you have been."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => {
      screamSky(v.t);
      city(v);
    },
    mid: () => midOaks(),
    near: () => nearPark(),
    back(v) {
      VIEW_T.t = v.t;
      gamlebyen(v);
      trestle();
      stoneGate();
      quarry();
      sculptures();
      viewpoint(v);
      for (const z of GUSTS) gustLeaves(z, v.t);
    },
    front() {
      railing();
    },
    ground: () => ({ top: HILL.grass, dot: HILL.grassDark, fill: HILL.soil }),
    tile(t, c, r, x, y, m) {
      if (t === "#") {
        grassTile(c, r, x, y, m);
        return true;
      }
      if (t === "K") {
        rockTile(c, r, x, y, m);
        return true;
      }
      if (t === "A") {
        R(x, y, TILE, TILE, HILL.granite);
        R(x, y + 7, TILE, 1, HILL.graniteDark);
        if (m.tileAt(c, r - 1) !== "A") R(x, y, TILE, 2, HILL.graniteLight);
        if (m.tileAt(c, r + 1) !== "A") R(x, y + TILE - 2, TILE, 2, HILL.graniteDark);
        return true;
      }
      if (t === "D") {
        R(x, y, TILE, 6, HILL.granite);
        R(x, y, TILE, 1, HILL.graniteLight);
        R(x, y + 6, TILE, 2, HILL.graniteDark);
        if (c % 2) R(x + 15, y, 1, 6, HILL.graniteDark);
        return true;
      }
      if (t === "v") {
        R(x, y, TILE, TILE, mix(INK, HILL.soil, 0.3));
        if (m.tileAt(c, r - 1) !== "v") for (let k = 0; k < TILE; k += 5) R(x + k, y + 10, 3, 2, HILL.trestle);
        return true;
      }
      return false;
    },
    ledges: {
      u: { body: HILL.bronze, top: HILL.bronzeLight, edge: HILL.bronzeDark, joint: HILL.bronze },
      "=": { body: HILL.granite, top: HILL.graniteLight, edge: HILL.graniteDark, joint: HILL.graniteDark }
    },
    carrier(i, at, v) {
      const d = CARRIERS[i];
      if (!carrierShown(d, v.t)) return;
      tram(at, v.t);
    },
    enemy(e, v) {
      if (e.def.look !== "magpie" || !e.alive) return false;
      magpie(e.x, e.y, e.dir, v.t);
      return true;
    },
    flourish: (age, v) => flourish(age, v)
  }
};

/** The clock for drawing, kept up by `back`. */
const VIEW_T = { t: 0 };

/**
 * The tram: Oslo's blue, two sections with their windows lit, a pantograph up to the wire. On the
 * trestle it stays level, its bogies reaching down to the track; it goes down into the cutting, and
 * only what is above the ground there is drawn.
 */
function tram(at: { x: number; y: number }, t: number) {
  const { x, y } = at;
  // The top of the rail under a column of it: the street, the trestle's slope, the stop at the top.
  const ground = (wx: number) => {
    const c = Math.floor(wx / TILE);
    if (c >= 45 && c <= 48) return G1 * TILE;
    if (c >= 18 && c < 45) return Math.max(G1 * TILE, Math.min(G0 * TILE, Math.round(G0 * TILE + ((wx - (18 * TILE + TRAM_W / 2)) / (26 * TILE)) * (G1 - G0) * TILE)));
    return surfaceRow(Math.max(0, c)) * TILE;
  };
  for (let dx = 0; dx < TRAM_W; dx++) {
    const wx = x + dx;
    const clip = Math.floor(wx / TILE) >= 45 && Math.floor(wx / TILE) <= 48 && y > ROOF1 ? G1 * TILE : Infinity;
    const col = (yy: number, h: number, c: string) => {
      const top = y + yy;
      const end = Math.min(top + h, clip);
      if (end > top) R(wx, top, 1, end - top, c);
    };
    const gap = dx === 31 || dx === 32;
    col(0, 2, mix(TRAM.body, WHITE, 0.3));
    col(2, 22, gap ? TRAM.skirt : TRAM.body);
    if (!gap && dx > 2 && dx < TRAM_W - 3) col(6, 8, dx % 8 < 6 ? LAMP : TRAM.body);
    col(20, 4, TRAM.skirt);
    // The bogies, reaching down to the rail wherever it is under them, and their wheels on it.
    if (dx % 32 > 4 && dx % 32 < 12) {
      const g = Math.min(ground(wx), clip);
      if (g > y + 24) col(24, g - y - 24, mix(TRAM.skirt, INK, 0.4));
      if (g >= y + 27) col(g - y - 3, 3, dx % 32 === 8 ? METAL.pipe : INK);
    }
  }
  light(x + 3, y + 6, TRAM_W - 6, 8, "soft");
  // The pantograph, up to where the wire would be.
  R(x + 20, y - 8, 1, 8, METAL.wire);
  R(x + 16, y - 9, 9, 1, METAL.wire);
  void t;
}
void P;
