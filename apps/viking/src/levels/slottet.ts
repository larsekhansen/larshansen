import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef, Path, Travel } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, FACADE, FLAG, GLASS, GROUND, INK, LAND, MASONRY, METAL, PAINT, PALETTE, PARADE, PLANTS, ROOF, SKIN, STONE, SWEATER, WHITE } from "@larshansen/pixelkit/palette";
import { flagCloth, ledge, type LedgeLook } from "@larshansen/pixelkit/props";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { rampHeight, type TileMap } from "@larshansen/pixelkit/tilemap";
import { timedPhase, type TimedLedge } from "@larshansen/pixelkit/timed";
import type { Enemy, EnemyDef } from "../game/enemies";
import { drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 4, rune S: Slottet. 17 May, Karl Johan, uphill all the way from Egertorget to the palace.
// The children's parade walks up the street with its banners; stand on a banner's crossbar and it
// carries him along over the crowd, over Spikersuppa's pond and over the roadworks. The band's bass
// drum throws him up to the high banner. At the top the King's Guard march back and forth across
// the square, and their hats lift him to the palace's terrace; up the front to the balcony, and rune
// S above it. Pigeons on the ground, gulls in the air, one e-scooter. The breather after the towers.
//
//   #  the street and the ground   U  ground under a slope   P  the palace's stone terrace
//   =  stone cornices and balconies   _  an iron grate, a park lawn's edge   -  the palace's eaves
//   ~  Spikersuppa   d  the bass drum   b  a bench   $  skilling   &  brown cheese   t  T-banen
//
// Sections: Egertorget (teach: the first banners, over plain street), Spikersuppa (practise: over
// the pond), Nationaltheatret and the University (twist: the drum and the high banner over the
// roadworks), Slottsparken and the palace (set piece: the Guard, the front, the balcony).

const COLS = 252;
const ROWS = 30;
const b = mapBuilder(COLS, ROWS);

// The street, as flat stretches; slopes join them.
b.ground(0, 32, 26);
b.ground(41, 74, 25);
b.ground(87, 139, 23);
b.ground(150, 179, 22);
b.ground(196, COLS - 1, 19);
const SLOPES = [b.slope(33, 26, 41, 25, "U"), b.slope(75, 25, 87, 23, "U"), b.slope(140, 23, 150, 22, "U"), b.slope(180, 22, 196, 19, "U")];

// Spikersuppa, two tiles deep.
b.fill(52, 58, 25, 26, "~");
// The roadworks: two digs with no bottom.
const DIG1 = [95, 101] as const;
const DIG2 = [116, 121] as const;
b.fill(DIG1[0], DIG1[1], 23, ROWS - 1, ".");
b.fill(DIG2[0], DIG2[1], 23, ROWS - 1, ".");
// A manhole with its lid off, down to a chamber under the street, out by a grate.
b.fill(131, 138, 24, 26, ".");
b.put(133, 23, ".");
b.run(136, 137, 23, "_");
b.run(134, 135, 25, "_");
// The Grand Hotel: its balcony, two window cornices and the roof.
b.run(41, 45, 20, "=");
b.run(38, 40, 18, "=");
b.run(42, 44, 16, "=");
b.run(34, 47, 14, "-");
// A lawn a little above the path in Slottsparken, with a bench on it.
b.run(164, 168, 20, ":");
// The palace: its terrace (carried on to the edge of the map, so the street beside it is no slot to
// fall into), two cornices, the balcony, the eaves.
b.fill(212, COLS - 1, 16, 18, "P");
b.run(222, 225, 14, "=");
b.run(234, 237, 14, "=");
b.run(227, 232, 12, "=");
b.run(213, 247, 7, "-");

// Marks: start, doors, signs, flags, benches, drums, the rune and the bracteate.
b.put(2, 25, "t").put(4, 25, "S").put(7, 25, "i");
b.put(47, 24, "f").put(43, 24, "d").put(63, 24, "i").put(70, 24, "b");
b.put(89, 22, "f").put(102, 22, "i").put(104, 22, "f").put(109, 22, "d");
b.put(153, 21, "f").put(166, 19, "b").put(176, 21, "i").put(198, 18, "f");
b.put(229, 10, "r").put(229, 5, "o");
b.put(46, 13, "&");

// Skilling: the line over the first banners, the hotel roof, over the pond, along the slopes, over the
// digs, the chamber under the street, the park, the hill, the palace front and its roof.
const COINS: [number, number][] = [
  [9, 25], [10, 25], [11, 25],
  [19, 21], [21, 21], [23, 21], [25, 21], [27, 21], [29, 21],
  [35, 13], [36, 13], [37, 13], [38, 13], [40, 13], [41, 13], [42, 13], [43, 13],
  [52, 21], [54, 21], [56, 21], [58, 21],
  [65, 24], [66, 24], [67, 24],
  [78, 22], [81, 21], [84, 20],
  [96, 19], [98, 19], [100, 19],
  [114, 16], [117, 16], [120, 16], [123, 16],
  [131, 26], [132, 26], [133, 26], [134, 26], [135, 26],
  [155, 21], [156, 21], [157, 21],
  [164, 19], [168, 19],
  [184, 19], [188, 18], [192, 17],
  [205, 15], [207, 15],
  [223, 13], [224, 13], [235, 13], [236, 13], [228, 11], [231, 11],
  [216, 6], [220, 6], [224, 6], [234, 6], [238, 6], [242, 6]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

/** The street's top at world x: the flat stretches and the slopes between them. */
const PROFILE: [number, number][] = [
  [0, 26],
  [33, 26],
  [41, 25],
  [75, 25],
  [87, 23],
  [140, 23],
  [150, 22],
  [180, 22],
  [196, 19],
  [COLS, 19]
];
export function streetY(x: number): number {
  const c = x / TILE;
  for (let i = 1; i < PROFILE.length; i++) {
    const [c0, r0] = PROFILE[i - 1];
    const [c1, r1] = PROFILE[i];
    if (c <= c1) return (r0 + ((Math.max(c0, c) - c0) / (c1 - c0)) * (r1 - r0)) * TILE;
  }
  return PROFILE[PROFILE.length - 1][1] * TILE;
}
const inPond = (x: number) => x >= 52 * TILE && x < 59 * TILE;
const inDig = (x: number) => (x >= DIG1[0] * TILE && x < (DIG1[1] + 1) * TILE) || (x >= DIG2[0] * TILE && x < (DIG2[1] + 1) * TILE);

// ---------------------------------------------------------------------------------------------
// The parade's banners: each rises out of the crowd, goes up the street at a walk with its bearers,
// and sinks again where they turn off. Riding height is 40 px over the street, inside a jump.

const RIDE = 40;
const BANNER_SPEED = 0.6;
const banner = (c0: number, c1: number, street: number, ride: number, offset: number, wait: number, speed = BANNER_SPEED): Path => ({
  kind: "path",
  points: [
    { x: c0 * TILE, y: street + 4 },
    { x: c0 * TILE, y: street - ride },
    { x: c1 * TILE, y: street - ride },
    { x: c1 * TILE, y: street + 4 }
  ],
  w: 2 * TILE,
  speed,
  wait,
  offset
});
/** Banners on one stretch, spaced evenly round their path. */
function bannerRow(c0: number, c1: number, row: number, ride: number, n: number, wait: number, speed = BANNER_SPEED): Path[] {
  const one = banner(c0, c1, row * TILE, ride, 0, wait, speed);
  const len = ride + 4 + (c1 - c0) * TILE + ride + 4;
  const period = Math.ceil(len / speed) + wait;
  return Array.from({ length: n }, (_, i) => ({ ...one, offset: Math.round((i * period) / n) }));
}

/** Over plain street at Egertorget: the first ride, where nothing can go wrong. */
const BANNERS_A = bannerRow(17, 31, 26, RIDE, 2, 60);
/** Over Spikersuppa. */
const BANNERS_B = bannerRow(46, 61, 25, RIDE, 3, 40);
/**
 * Over the first dig, the balloon sellers: two bunches, a crate under each, let up into the sky and
 * hauled down again, out of step. Ledges on a beat: there two seconds and a bit, a second of tugging
 * at their strings, gone almost two.
 */
export const BALLOONS: TimedLedge[] = [
  { x: 96 * TILE + 2, y: 23 * TILE - 16, w: 22, on: 120, warn: 50, off: 120, offset: 0 },
  { x: 98 * TILE + 8, y: 23 * TILE - 28, w: 22, on: 120, warn: 50, off: 120, offset: -50 },
  { x: 100 * TILE + 14, y: 23 * TILE - 16, w: 22, on: 120, warn: 50, off: 120, offset: -100 }
];
/** The big banners, on tall poles, over the second dig: only the drum reaches them. The first is Høyenhall skole's. */
const BANNERS_D = bannerRow(106, 123, 23, 86, 2, 30, 0.8);
/** The King's Guard: three in step, back and forth across the square; their hats are the ledge. */
export const GUARD: Travel = { kind: "travel", from: { x: 199 * TILE, y: 19 * TILE - 22 }, to: { x: 209 * TILE, y: 19 * TILE - 22 }, w: 3 * TILE, period: 300 };
export const BANNERS = { A: BANNERS_A, B: BANNERS_B, D: BANNERS_D };
const CARRIERS: CarrierDef[] = [...BANNERS_A, ...BANNERS_B, ...BANNERS_D, GUARD];
const GUARD_INDEX = CARRIERS.length - 1;
const SCHOOL = BANNERS_A.length + BANNERS_B.length;

// ---------------------------------------------------------------------------------------------
// Pigeons on the ground, gulls in the air, and one e-scooter that rides itself.

export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "pigeon", c: 13, r: 25, range: 3 },
  { kind: "walker", look: "pigeon", c: 27, r: 25, range: 2, dir: -1 },
  { kind: "flyer", look: "gull", c: 64, r: 22, range: 2, rise: 8, period: 150 },
  { kind: "walker", look: "pigeon", c: 80, r: 23, range: 2 },
  { kind: "flyer", look: "gull", c: 98, r: 15, range: 2, rise: 6, period: 170, offset: 40 },
  { kind: "walker", look: "pigeon", c: 112, r: 22, range: 2 },
  { kind: "flyer", look: "gull", c: 119, r: 14, range: 3, rise: 8, period: 160 },
  { kind: "walker", look: "hotdog", c: 128, r: 22, range: 2, speed: 0.4, w: 18, h: 14 },
  { kind: "walker", look: "pigeon", c: 160, r: 21, range: 2 },
  { kind: "walker", look: "pigeon", c: 172, r: 21, range: 2, dir: -1 },
  { kind: "flyer", look: "gull", c: 175, r: 18, range: 3, rise: 8, period: 150, offset: 70 },
  { kind: "walker", look: "pigeon", c: 188, r: 19, range: 2 },
  { kind: "flyer", look: "gull", c: 217, r: 13, range: 2, rise: 6, period: 160 }
];

// ---------------------------------------------------------------------------------------------
// The art. Daylight colours from the palette; the 17 May sky is pinned.

const P = PALETTE;
const BASE = 26 * TILE;

/** A Norwegian flag hanging from a short pole out from a wall, its top left at (x, y). */
function wallFlag(x: number, y: number, t: number) {
  R(x - 3, y, 4, 1, METAL.flagpole);
  flagCloth(x, y + 1);
  if (!view.reduced && Math.floor(t / 14 + x) % 2) R(x + 12, y + 2, 1, 7, FLAG.red);
}

/** A bunch of balloons over a crate (the ledge): tugging at their strings as they are about to go, then up and away out of sight; let down again. */
function balloons(i: number, t: number) {
  const l = BALLOONS[i];
  const phase = timedPhase(t, l);
  // Where its rope is made fast, so the eye knows where it comes back.
  R(l.x + l.w / 2, 23 * TILE - 2, 1, 2, PARADE.pole);
  if (phase === "off") return;
  const tug = phase === "warn" && !view.reduced ? (Math.floor(t / 5) % 2 ? -1 : 0) : 0;
  const y = l.y + tug;
  // The crate he stands on.
  R(l.x, y, l.w, 6, P.wood);
  R(l.x, y, l.w, 1, mix(P.wood, WHITE, 0.3));
  R(l.x, y + 5, l.w, 1, P.woodDark);
  for (let x = l.x + 6; x < l.x + l.w - 2; x += 7) R(x, y + 1, 1, 4, P.woodDark);
  // The strings, and the balloons in the flag's colours.
  const colors = [PARADE.balloonRed, PARADE.balloonWhite, PARADE.balloonBlue];
  colors.forEach((c, k) => {
    const bx = l.x + 3 + k * 7;
    const top = y - 30 + (k % 2) * 5;
    R(bx + 2, top + 7, 1, y - top - 7, mix(WHITE, INK, 0.3));
    R(bx, top + 1, 6, 5, c);
    R(bx + 1, top, 4, 7, c);
    R(bx + 1, top + 1, 1, 2, WHITE);
  });
  // About to go: the warning blink every ledge on a beat has.
  if (phase === "warn" && Math.floor(t / 8) % 2 === 0) {
    R(l.x - 2, y - 2, l.w + 4, 1, WHITE);
    R(l.x - 2, y + 7, l.w + 4, 1, WHITE);
  }
}

/** The hot-dog cart, pushed along the street on 17 May: a striped awning, the steamer, two wheels. */
function hotdogCart(e: Enemy, t: number) {
  if (!e.alive) return;
  const x = Math.round(e.x - e.w / 2);
  const y = Math.round(e.y);
  R(x, y - 10, e.w, 7, PARADE.blouse);
  R(x, y - 10, e.w, 1, mix(PARADE.blouse, INK, 0.2));
  R(x + 2, y - 8, 7, 3, METAL.pipe);
  R(x + 11, y - 8, 5, 2, PARADE.drumShell);
  for (let k = 0; k < e.w; k += 4) R(x + k, y - 14, 2, 3, PARADE.balloonRed);
  for (let k = 2; k < e.w; k += 4) R(x + k, y - 14, 2, 3, WHITE);
  R(x + 1, y - 11, 1, 1, P.woodDark);
  R(x + e.w - 2, y - 11, 1, 1, P.woodDark);
  const roll = view.reduced ? 0 : Math.floor(e.x / 3) % 2;
  for (const wx of [x + 3, x + e.w - 6]) {
    R(wx, y - 3, 4, 3, INK);
    R(wx + 1 + roll, y - 2, 1, 1, METAL.pipe);
  }
  void t;
}

/** A row of windows in a facade, lit after dark, with a sill under each. */
function windowRow(x0: number, x1: number, y: number, h: number, every: number, frame: string) {
  for (let x = x0; x + 5 <= x1; x += every) {
    R(x - 1, y - 1, 7, h + 2, frame);
    R(x, y, 5, h, GLASS.farWindow);
    R(x + 2, y, 1, h, frame);
    light(x, y, 2, h);
    light(x + 3, y, 2, h);
    R(x - 1, y + h + 1, 7, 1, mix(frame, INK, 0.3));
  }
}

/** A town house on Karl Johan: plaster in courses, windows, a cornice, a flag. */
function townHouse(x: number, w: number, base: number, h: number, wall: string, t: number) {
  const top = base - h;
  R(x, top, w, h, wall);
  for (let y = top + 6; y < base; y += 7) R(x, y, w, 1, mix(wall, INK, 0.08));
  R(x, top, w, 3, mix(wall, WHITE, 0.25));
  R(x - 1, top + 3, w + 2, 1, mix(wall, INK, 0.25));
  for (let y = top + 9; y < base - 18; y += 16) windowRow(x + 5, x + w - 3, y, 8, 12, mix(wall, WHITE, 0.4));
  // The shop floor: a dark band of glass with an awning.
  R(x + 2, base - 13, w - 4, 11, GLASS.foyer);
  light(x + 3, base - 12, w - 6, 9, "soft");
  R(x, base - 15, w, 2, mix(wall, INK, 0.3));
  wallFlag(x + w - 18, top + 10, t);
}

/** The Grand Hotel: cream, a stone balcony, its corner tower with a green dome. The ledges are the map's. */
function grand(t: number) {
  const x = 33 * TILE + 8;
  const w = 15 * TILE;
  const base = 25 * TILE;
  const top = 14 * TILE;
  R(x, top, w, base - top, FACADE.palace);
  for (let y = top + 5; y < base; y += 6) R(x, y, w, 1, mix(FACADE.palace, INK, 0.07));
  for (const y of [15 * TILE + 4, 17 * TILE + 4, 19 * TILE + 4, 21 * TILE + 4]) windowRow(x + 6, x + w - 4, y, 9, 11, PAINT.trim);
  R(x + 4, base - 14, w - 8, 12, GLASS.foyer);
  light(x + 6, base - 12, w - 12, 9, "soft");
  // The corner tower and its green dome, rising above the roof.
  const tx = x - 2;
  R(tx, top - 26, 22, 26, mix(FACADE.palace, INK, 0.05));
  for (let i = 0; i < 12; i++) R(tx + 11 - Math.floor(i * 0.95), top - 38 + i, Math.max(2, Math.floor(i * 1.9)), 1, i % 4 ? METAL.copper : METAL.copperLight);
  R(tx + 10, top - 44, 2, 6, METAL.copperDark);
  R(tx + 6, top - 20, 10, 10, PAINT.trim);
  R(tx + 10, top - 18, 1, 5, INK);
  R(tx + 10, top - 14, 3, 1, INK);
  // Chimneys on the roof, and its sign along the front.
  for (const cx of [x + 30, x + 120, x + 180]) {
    R(cx, top - 10, 7, 10, BRICK.red);
    R(cx - 1, top - 11, 9, 2, MASONRY.chimney);
  }
  R(x + 60, 23 * TILE + 2, 90, 6, INK);
  for (let i = 0; i < 9; i++) R(x + 66 + i * 9, 23 * TILE + 4, 5, 2, FACADE.palace);
  light(x + 62, 23 * TILE + 3, 86, 4, "soft");
  wallFlag(x + 20, 17 * TILE + 2, t);
  wallFlag(x + 200, 19 * TILE + 2, t);
}

/** Stortinget behind the pond: yellow brick, the round hall in the middle. */
function storting() {
  const cx = 56 * TILE;
  const base = 25 * TILE;
  R(cx - 110, base - 70, 220, 70, FACADE.storting);
  for (let y = base - 66; y < base; y += 4) R(cx - 110, y, 220, 1, FACADE.stortingDark);
  for (let r = 0; r < 34; r++) {
    const half = Math.round(Math.sqrt(34 * 34 - (34 - r) * (34 - r)));
    R(cx - half, base - 104 + r, half * 2, 1, r < 3 ? MASONRY.lintel : FACADE.stortingDark);
  }
  for (let x = cx - 100; x < cx + 100; x += 14) windowRow(x, x + 8, base - 56, 12, 14, FACADE.storting);
  // The lion on its plinth, small, and the flag over the hall.
  R(cx - 2, base - 128, 1, 24, METAL.flagpole);
  flagCloth(cx - 1, base - 128);
}

/** Spikersuppa's fountain in the middle of the pond. */
function fountain(t: number) {
  const cx = 55 * TILE + 8;
  const top = 25 * TILE;
  R(cx - 6, top - 3, 12, 3, MASONRY.lintel);
  R(cx - 1, top - 10, 2, 7, MASONRY.worn);
  if (view.reduced) return;
  for (let i = 0; i < 6; i++) {
    const k = ((t * 0.6 + i * 8) % 24) / 24;
    R(cx - 1 + Math.round((i - 2.5) * k * 4), top - 12 - Math.round(Math.sin(k * Math.PI) * 10), 1, 2, P.foam);
  }
}

/** Nationaltheatret: a pale classical front with columns, and two statues before it. */
function theatre() {
  const x = 88 * TILE;
  const base = 23 * TILE;
  R(x, base - 92, 160, 92, FACADE.palace);
  for (let y = base - 88; y < base; y += 6) R(x, y, 160, 1, mix(FACADE.palace, INK, 0.07));
  for (let i = 0; i < 18; i++) R(x + 80 - i * 4, base - 110 + i, i * 8, 1, i < 2 ? MASONRY.worn : mix(FACADE.palace, INK, 0.15));
  for (let cx = x + 16; cx < x + 150; cx += 16) {
    R(cx, base - 70, 6, 58, PAINT.trim);
    R(cx + 4, base - 70, 2, 58, mix(PAINT.trim, INK, 0.15));
  }
  R(x + 8, base - 74, 144, 4, PAINT.trim);
  windowRow(x + 20, x + 150, base - 86, 8, 16, PAINT.trim);
  // Ibsen and Bjørnson, in bronze gone green, on their plinths.
  for (const sx of [x + 30, x + 120]) {
    R(sx - 5, base - 14, 10, 14, MASONRY.lintel);
    R(sx - 3, base - 30, 6, 16, METAL.copperDark);
    R(sx - 2, base - 34, 4, 4, METAL.copper);
  }
}

/** The University's long front with its columns. */
function university() {
  const x = 122 * TILE;
  const base = 23 * TILE;
  const w = 17 * TILE;
  R(x, base - 80, w, 80, PAINT.trim);
  for (let y = base - 76; y < base; y += 6) R(x, y, w, 1, mix(PAINT.trim, INK, 0.07));
  for (let i = 0; i < 14; i++) R(x + w / 2 - i * 5, base - 96 + i, i * 10, 1, mix(PAINT.trim, INK, 0.12));
  for (let cx = x + 70; cx < x + w - 60; cx += 12) {
    R(cx, base - 60, 5, 50, WHITE);
    R(cx + 3, base - 60, 2, 50, mix(PAINT.trim, INK, 0.15));
  }
  windowRow(x + 8, x + 64, base - 66, 10, 12, MASONRY.worn);
  windowRow(x + w - 60, x + w - 6, base - 66, 10, 12, MASONRY.worn);
}

/** A big leafy tree in Slottsparken, in May green. */
function parkTree(x: number, ground: number, h: number) {
  R(x - 2, ground - h, 4, h, PLANTS.bark);
  for (const [dx, dy, r] of [
    [0, -h - 6, 14],
    [-12, -h + 4, 11],
    [12, -h + 2, 12],
    [-4, -h - 16, 9]
  ] as const)
    for (let yy = -r; yy <= r; yy++) {
      const half = Math.floor(Math.sqrt(r * r - yy * yy));
      R(x + dx - half, ground + dy + yy, half * 2, 1, yy < -r / 3 ? PLANTS.leavesShine : PLANTS.leaves);
    }
}

/** The palace: pale yellow over a rusticated ground floor, the middle standing forward under a pediment, a hipped slate roof. The ledges are the map's. */
function palace(v: View) {
  const x0 = 211 * TILE;
  const x1 = 248 * TILE;
  const ground = 16 * TILE;
  const top = 7 * TILE + 5;
  const wall = FACADE.palace;
  R(x0, top, x1 - x0, ground - top, wall);
  for (let y = top + 5; y < ground; y += 6) R(x0, y, x1 - x0, 1, mix(wall, INK, 0.06));
  // The ground floor in rustication: deep joints every course.
  for (let y = 13 * TILE + 8; y < ground; y += 5) {
    R(x0, y, x1 - x0, 1, mix(wall, INK, 0.2));
    for (let x = x0 + ((y / 5) % 2) * 6; x < x1; x += 12) R(x, y - 4, 1, 4, mix(wall, INK, 0.14));
  }
  R(x0, 13 * TILE + 6, x1 - x0, 2, mix(wall, WHITE, 0.35));
  R(x0, 10 * TILE + 6, x1 - x0, 2, mix(wall, WHITE, 0.35));
  // The middle stands forward, lighter, with its columns and the pediment over the balcony.
  const mx = 225 * TILE;
  const mw = 10 * TILE;
  R(mx, top - 4, mw, ground - top + 4, mix(wall, WHITE, 0.18));
  R(mx, top - 4, 2, ground - top + 4, mix(wall, INK, 0.1));
  R(mx + mw - 2, top - 4, 2, ground - top + 4, mix(wall, INK, 0.16));
  for (let cx = mx + 10; cx < mx + mw - 8; cx += 18) {
    R(cx, 12 * TILE + 6, 6, 4 * TILE - 6, WHITE);
    R(cx + 4, 12 * TILE + 6, 2, 4 * TILE - 6, mix(PAINT.trim, INK, 0.12));
    R(cx - 1, 12 * TILE + 5, 8, 2, MASONRY.worn);
  }
  for (let i = 0; i < 14; i++) R(mx + mw / 2 - i * 5 - 4, top - 18 + i, i * 10 + 8, 1, i < 2 ? MASONRY.worn : mix(wall, INK, 0.1 + (i % 4 === 0 ? 0.08 : 0)));
  // Tall windows with a small cornice over each; smaller on the top floor.
  const win = (x: number, y: number, h: number) => {
    R(x - 2, y - 3, 9, 2, mix(wall, WHITE, 0.4));
    R(x - 1, y - 1, 7, h + 2, PAINT.trim);
    R(x, y, 5, h, GLASS.farWindow);
    R(x + 2, y, 1, h, PAINT.trim);
    R(x, y + Math.floor(h / 2), 5, 1, PAINT.trim);
    light(x, y, 2, h);
    light(x + 3, y, 2, h);
  };
  for (const [y, h] of [
    [14 * TILE + 1, 11],
    [11 * TILE + 4, 12],
    [8 * TILE + 6, 9]
  ] as const)
    for (let x = x0 + 10; x < x1 - 8; x += 13) if (x < mx - 6 || x > mx + mw) win(x, y, h);
  win(mx + 22, 8 * TILE + 6, 9);
  win(mx + mw - 28, 8 * TILE + 6, 9);
  // The great door under the balcony.
  R(229 * TILE - 2, 13 * TILE + 2, 20, 30, P.woodDark);
  R(229 * TILE, 13 * TILE + 4, 16, 28, P.wood);
  R(229 * TILE + 7, 13 * TILE + 4, 1, 28, P.woodDark);
  R(229 * TILE + 5, 13 * TILE + 18, 1, 2, METAL.brass);
  R(229 * TILE + 10, 13 * TILE + 18, 1, 2, METAL.brass);
  // The roof: slate, hipped, with dormers and chimneys, over the eaves (the map's ledge).
  for (let i = 0; i < 26; i++) R(x0 + 4 + i * 2, 7 * TILE - 1 - i, x1 - x0 - 8 - i * 4, 1, i % 5 === 0 ? mix(ROOF.slate, WHITE, 0.15) : ROOF.slate);
  for (let dx = x0 + 30; dx < x1 - 30; dx += 46) {
    if (Math.abs(dx - 229 * TILE) < 30) continue;
    R(dx, 7 * TILE - 16, 9, 10, wall);
    R(dx - 1, 7 * TILE - 18, 11, 2, ROOF.slate);
    R(dx + 2, 7 * TILE - 13, 5, 6, GLASS.farWindow);
    light(dx + 2, 7 * TILE - 13, 5, 6);
  }
  for (const cx of [x0 + 60, x1 - 66]) {
    R(cx, 7 * TILE - 30, 6, 12, MASONRY.chimney);
    R(cx - 1, 7 * TILE - 31, 8, 2, mix(MASONRY.chimney, INK, 0.2));
  }
  R(229 * TILE + 8, 2 * TILE, 1, 5 * TILE - 26, METAL.flagpole);
  R(229 * TILE + 7, 2 * TILE - 2, 3, 2, METAL.brass);
  if (v.flourish === null) flagCloth(229 * TILE + 9, 2 * TILE);
}

/** The terrace's stone, in courses, under the palace. */
function terraceStone(x: number, y: number) {
  R(x, y, TILE, TILE, STONE.light);
  for (let yy = y + 3; yy < y + TILE; yy += 5) R(x, yy, TILE, 1, STONE.base);
  for (let yy = y; yy < y + TILE; yy += 5) R(x + ((yy / 5) % 2 ? 4 : 11), yy, 1, 3, STONE.base);
}

/** Children in the parade: a bunad or a sweater, a flag in hand; they walk up the street with the banners. */
function paradeKid(x: number, ground: number, i: number, t: number) {
  const dress = [PARADE.bunadRed, PARADE.bunadBlue, PARADE.bunadGreen, SWEATER, PARADE.russ][i % 5];
  const step = view.reduced ? 0 : Math.floor((t + i * 7) / 10) % 2;
  R(x, ground - 11, 4, 3, SKIN);
  R(x, ground - 12, 4, 1, i % 3 ? P.woodDark : PARADE.fringe);
  R(x - (i % 2), ground - 8, 4 + (i % 2), 5, dress);
  R(x + 1, ground - 8, 2, 1, PARADE.blouse);
  R(x + step, ground - 3, 1, 3, INK);
  R(x + 3 - step, ground - 3, 1, 3, INK);
  // A small flag on a stick.
  R(x + 4, ground - 16, 1, 9, PARADE.pole);
  R(x + 5, ground - 16, 5, 4, FLAG.red);
  R(x + 6, ground - 16, 1, 4, FLAG.white);
  R(x + 5, ground - 14, 5, 1, FLAG.blue);
}

/** The parade between the banners: children walking up the street, a step behind his line. */
function parade(t: number) {
  const span = 46;
  const shift = view.reduced ? 0 : (t * BANNER_SPEED) % span;
  for (let x = 8 * TILE + shift; x < 196 * TILE; x += span) {
    const g = streetY(x);
    paradeKid(Math.round(x), g - 1, Math.floor(x / span), t);
    paradeKid(Math.round(x) + 14, g - 1, Math.floor(x / span) + 2, t);
  }
}

/** A banner: its crossbar is the ledge he stands on, the cloth hangs below, two bearers carry it up the street. */
function drawBanner(i: number, at: { x: number; y: number }, t: number) {
  const school = i === SCHOOL;
  const colors: [string, string][] = [
    [PARADE.silkRed, PARADE.fringe],
    [PARADE.silkBlue, PARADE.fringe],
    [PARADE.silkGreen, PARADE.fringe],
    [PARADE.silkCream, PARADE.silkRed]
  ];
  const [cloth, trim] = colors[i % colors.length];
  const { x, y } = at;
  const street = streetY(x + TILE);
  // Rising out of the crowd or sinking into it: only what is above the street shows.
  if (y > street - 4) return;
  // Two poles down to the bearers' hands.
  for (const px of [x + 1, x + 2 * TILE - 3]) R(px, y - 2, 2, Math.max(0, street - 10 - y + 2), PARADE.pole);
  R(x + 1, y - 4, 2, 2, PARADE.fringe);
  R(x + 2 * TILE - 3, y - 4, 2, 2, PARADE.fringe);
  // The crossbar: what he stands on.
  ledge(x, y, BANNER_BAR, true, false, false);
  ledge(x + TILE, y, BANNER_BAR, false, true, false);
  // The cloth under it, swinging a pixel with the march.
  const sway = view.reduced ? 0 : Math.floor((t + i * 13) / 18) % 2;
  const h = Math.min(school ? 26 : 22, street - 8 - y);
  if (school) schoolBanner(x, y, h, sway);
  else {
    R(x + 3 + sway, y + 5, 2 * TILE - 6, h, cloth);
    R(x + 3 + sway, y + 5, 2 * TILE - 6, 1, mix(cloth, WHITE, 0.25));
    for (let k = 0; k < 2 * TILE - 6; k += 2) R(x + 3 + sway + k, y + 5 + h, 1, 2, trim);
    // An emblem: a ring and a star.
    R(x + 12 + sway, y + 11, 8, 8, trim);
    R(x + 14 + sway, y + 13, 4, 4, cloth);
    R(x + 15 + sway, y + 14, 2, 2, trim);
  }
  // The bearers, on the street (behind the pond and the digs they walk along the far kerb).
  paradeKid(x - 1, street - 1, i, t);
  paradeKid(x + 2 * TILE - 4, street - 1, i + 1, t);
}

/** Capitals three pixels wide (Ø and N four, L two), five high: only the ones the school's banner needs. */
const GLYPHS: Record<string, string[]> = {
  H: ["101", "101", "111", "101", "101"],
  Ø: ["0111", "1001", "1011", "1101", "1110"],
  Y: ["101", "101", "010", "010", "010"],
  E: ["111", "100", "110", "100", "111"],
  N: ["1001", "1101", "1011", "1001", "1001"],
  A: ["010", "101", "111", "101", "101"],
  L: ["10", "10", "10", "10", "11"],
  S: ["111", "100", "111", "001", "111"],
  K: ["101", "101", "110", "101", "101"],
  O: ["010", "101", "101", "101", "010"]
};
const lettersWide = (s: string) => [...s].reduce((w, ch) => w + GLYPHS[ch][0].length + 1, -1);
/** Letters from GLYPHS, centred on x, their top at y; nothing below `bottom` (the cloth while it rises out of the crowd). */
function letters(s: string, x: number, y: number, bottom: number, color: string) {
  let lx = x - Math.floor(lettersWide(s) / 2);
  for (const ch of s) {
    const g = GLYPHS[ch];
    g.forEach((row, ry) => {
      if (y + ry >= bottom) return;
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === "1") R(lx + rx, y + ry, 1, 1, color);
    });
    lx += g[0].length + 1;
  }
}
/** An open book: the pages, a line or two of writing on each, the spine and the cover's edge in gold. */
const BOOK = [".PPPP.PPPP.", "PPllPGPllPP", "PPPPPGPPPPP", "PllPPGPPllP", "GGGGGGGGGGG"];

/**
 * Høyenhall skole's banner, the school's big one on tall poles: navy silk, wider than the others and
 * hung the whole length of the crossbar, gold knobs on the crossbar's ends, a gold band along the
 * top, HØYENHALL over an open book and SKOLE under it, all in gold, and gold fringe.
 */
function schoolBanner(x: number, y: number, h: number, sway: number) {
  const left = x - 4 + sway;
  const w = 2 * TILE + 8;
  const top = y + 5;
  const bottom = top + h;
  const mid = left + w / 2;
  R(left, top, w, h, SCHOOL_SILK);
  R(left, top, w, 1, mix(SCHOOL_SILK, WHITE, 0.25));
  if (h > 2) R(left + 1, top + 1, w - 2, 1, PARADE.fringe);
  R(left, top + 2, 1, Math.max(0, h - 2), mix(SCHOOL_SILK, INK, 0.25));
  R(left + w - 1, top + 2, 1, Math.max(0, h - 2), mix(SCHOOL_SILK, INK, 0.25));
  letters("HØYENHALL", mid, top + 3, bottom, PARADE.fringe);
  BOOK.forEach((row, ry) => {
    if (top + 10 + ry >= bottom) return;
    for (let rx = 0; rx < row.length; rx++) {
      const ch = row[rx];
      if (ch !== ".") R(mid - 5 + rx, top + 10 + ry, 1, 1, ch === "P" ? PARADE.silkCream : ch === "l" ? mix(PARADE.silkCream, SCHOOL_SILK, 0.45) : PARADE.fringe);
    }
  });
  letters("SKOLE", mid, top + 17, bottom, PARADE.fringe);
  for (let k = 1; k < w - 1; k += 2) R(left + k, bottom, 1, 2 + (k % 4 === 1 ? 1 : 0), PARADE.fringe);
  // Round gold knobs on the crossbar's ends.
  for (const kx of [x - 4, x + 2 * TILE]) {
    R(kx + 1, y, 2, 1, mix(PARADE.fringe, WHITE, 0.45));
    R(kx, y + 1, 4, 2, PARADE.fringe);
    R(kx, y + 1, 1, 1, mix(PARADE.fringe, WHITE, 0.45));
    R(kx + 1, y + 3, 2, 1, mix(PARADE.fringe, INK, 0.3));
  }
}
const SCHOOL_SILK = mix(PARADE.silkBlue, INK, 0.25);
const BANNER_BAR: LedgeLook = { body: PARADE.pole, top: mix(PARADE.pole, WHITE, 0.3), edge: P.woodDark, joint: P.woodDark };

/** The King's Guard: three in step under their hats, rifles on the shoulder. */
function guards(at: { x: number; y: number }, t: number) {
  const step = view.reduced ? 0 : Math.floor(t / 12) % 2;
  for (let k = 0; k < 3; k++) {
    const gx = at.x + 3 + k * TILE;
    const y = at.y;
    // The hat with its plume: the ledge he rides is the line of hats.
    R(gx, y, 10, 5, PARADE.plume);
    R(gx + 1, y, 8, 1, mix(PARADE.plume, WHITE, 0.25));
    R(gx + 7, y - 2, 3, 2, PARADE.plume);
    R(gx + 2, y + 5, 6, 3, SKIN);
    R(gx + 1, y + 8, 8, 8, PARADE.guard);
    R(gx + 1, y + 12, 8, 1, PARADE.guardBelt);
    R(gx + 8, y + 3, 1, 9, METAL.lampPost);
    R(gx + 2 + step, y + 16, 2, 6, PARADE.guard);
    R(gx + 6 - step, y + 16, 2, 6, PARADE.guard);
    R(gx + 1 + step, y + 21, 3, 1, INK);
    R(gx + 5 - step, y + 21, 3, 1, INK);
  }
}

/** The crowd along the near kerb: heads, hats and little flags, in front of the street; not solid. */
function crowd(t: number) {
  const x0 = Math.max(0, view.camX - 8);
  const x1 = view.camX + view.w + 8;
  for (let x = x0 - (x0 % 7); x < x1; x += 7) {
    if (inPond(x) || inDig(x) || inPond(x + 6) || inDig(x + 6) || x > 211 * TILE) continue;
    const g = streetY(x) + 9;
    const k = Math.floor(x / 7);
    const tall = (k * 37) % 5;
    const head = g - 6 - (tall % 3);
    R(x, head + 4, 6, 9, [PARADE.bunadBlue, PAINT.ochre, PARADE.bunadRed, P.ironDark, PARADE.silkGreen][k % 5]);
    R(x + 1, head, 4, 4, SKIN);
    R(x + 1, head - 1, 4, 1, [P.woodDark, INK, PARADE.fringe, P.earth][k % 4]);
    if (k % 3 === 0) {
      const wave = view.reduced ? 0 : Math.floor((t + k * 11) / 9) % 2;
      R(x + 5, head - 9 + wave, 1, 8, PARADE.pole);
      R(x + 6, head - 9 + wave, 5, 4, FLAG.red);
      R(x + 7, head - 9 + wave, 1, 4, FLAG.white);
      R(x + 6, head - 7 + wave, 5, 1, FLAG.blue);
    }
  }
}

/** The barriers round a dig: red and white boards on feet, in front. */
function barriers(c0: number, c1: number) {
  for (const x of [c0 * TILE - 6, (c1 + 1) * TILE + 1]) {
    const g = streetY(x);
    R(x, g - 9, 5, 9, P.iron);
    for (let y = g - 9; y < g - 1; y += 4) R(x, y, 5, 2, PARADE.russ);
    R(x - 1, g - 1, 7, 1, INK);
  }
}

/** Behind the pond and the digs the street goes on: a strip of its far side, where the parade walks; the digs are dark holes in front of it. */
function farKerbs() {
  for (const [c0, c1] of [[52, 58], DIG1, DIG2] as const) {
    const x = c0 * TILE;
    const w = (c1 - c0 + 1) * TILE;
    const y = streetY(x);
    if (c0 !== 52) {
      // The hole: earth in bands, a pipe across, darker the deeper it goes.
      for (let k = 0; k < 9; k++) R(x, y + 4 + k * 8, w, 8, mix(P.earth, INK, 0.25 + k * 0.08));
      for (let k = 0; k < w; k += 5) R(x + k, y + 6 + ((k * 7) % 11), 2, 1, mix(P.earth, WHITE, 0.15));
      R(x, y + 26, w, 4, P.ironDark);
      R(x, y + 26, w, 1, P.iron);
      R(x + 3, y + 4, 2, 8, METAL.lampPost);
      R(x + w - 5, y + 4, 2, 8, METAL.lampPost);
    }
    R(x, y - 3, w, 3, GROUND.paving);
    R(x, y - 3, w, 1, mix(GROUND.paving, WHITE, 0.4));
    R(x, y, w, 4, GROUND.pavingDot);
  }
}

/** Balconies and cornices: stone balusters on the ledges of the map, so they read as balconies. */
function balusters(c0: number, c1: number, r: number) {
  const y = r * TILE;
  R(c0 * TILE, y - 9, (c1 - c0 + 1) * TILE, 2, MASONRY.worn);
  for (let x = c0 * TILE + 2; x < (c1 + 1) * TILE - 2; x += 4) R(x, y - 7, 2, 7, mix(MASONRY.worn, INK, 0.1));
}

/** The railing in front of the pond. */
function pondRail() {
  for (let x = 52 * TILE; x < 59 * TILE; x += 8) R(x, 25 * TILE + 3, 1, 7, METAL.castIron);
  R(52 * TILE, 25 * TILE + 3, 7 * TILE, 1, METAL.castIron);
}

/** The street's surface where it slopes: the same setts as the flat, laid along the slope. */
function slopes() {
  for (const ramp of SLOPES) {
    const xs = ramp.points.map((p) => p[0]);
    for (let x = Math.min(...xs); x < Math.max(...xs); x++) {
      const y = Math.round(rampHeight([ramp], x) ?? 0);
      R(x, y, 1, 4, GROUND.paving);
      R(x, y + 4, 1, 1, GROUND.pavingDot);
      if ((x + y) % 4 === 0) R(x, y + 1 + (x % 3), 1, 1, GROUND.pavingDot);
      R(x, y + 5, 1, Math.ceil((y + 5) / TILE) * TILE - y - 5 + TILE, UNDER);
    }
  }
}
const UNDER = mix(GROUND.pavingFill, INK, 0.1);

/** Ground under the street, and under slopes: setts in courses, darker the deeper. */
function under(c: number, r: number, x: number, y: number) {
  const depth = Math.max(0, r * TILE - streetY(x + 8));
  const base = mix(UNDER, INK, Math.min(0.5, depth / 120));
  R(x, y, TILE, TILE, base);
  for (let yy = 0; yy < TILE; yy += 4) {
    R(x, y + yy + 3, TILE, 1, mix(base, INK, 0.25));
    for (let xx = ((yy / 4 + r) % 2) * 3; xx < TILE; xx += 6) R(x + xx, y + yy, 1, 3, mix(base, INK, 0.2));
  }
  R(x + ((c * 7 + r * 5) % 11), y + ((c * 3 + r * 7) % 3) * 4 + 1, 4, 2, mix(base, WHITE, 0.1));
}

/** The flourish after the rune: the royal family steps out on the balcony and waves, and the flag runs up the palace's pole. */
function flourish(age: number) {
  const bx = 228 * TILE;
  const y = 12 * TILE;
  // Three small figures step out and wave.
  const out = Math.min(3, Math.floor(age / 12));
  const people = [
    { dx: 8, coat: PARADE.guard, hat: INK },
    { dx: 24, coat: PARADE.bunadRed, hat: PARADE.silkCream },
    { dx: 40, coat: SWEATER, hat: P.woodDark }
  ];
  people.slice(0, out).forEach((p, k) => {
    const wave = view.reduced ? 0 : Math.floor((age + k * 5) / 8) % 2;
    R(bx + p.dx, y - 12, 4, 3, SKIN);
    R(bx + p.dx, y - 13, 4, 1, p.hat);
    R(bx + p.dx - 1, y - 9, 6, 9, p.coat);
    R(bx + p.dx + 5, y - 13 - wave, 1, 4, SKIN);
  });
  // The flag runs up the pole on the roof.
  const k = Math.min(1, age / 60);
  flagCloth(229 * TILE + 9, Math.round(7 * TILE - 12 - (7 * TILE - 12 - 2 * TILE) * k));
}

/** The far hills, with the ski jump on the ridge, small: the next stop. */
function farHills(sky: Sky) {
  drawOsloHills(sky, BASE + 2 * TILE);
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const d = wx - 3100;
    if (d < 0 || d > 24) continue;
    // The jump: a thin white line down from the ridge.
    column(x, BASE - 74 + d * 1.2, BASE - 70 + d * 1.2, mix(PAINT.trim, LAND.farHills, 0.2));
  }
}

/** The city between: roofs in pale colours, and flags on every pole. */
function cityRoofs(t: number) {
  const ground = BASE - 8;
  for (let i = 0; i < 40; i++) {
    const wx = i * 110 + ((i * 37) % 50);
    const x = layerX(wx, 0.2);
    if (x < -40 || x > view.w + 10) continue;
    const h = 24 + ((i * 53) % 26);
    const w = 22 + ((i * 29) % 18);
    const color = FACADE.blocks[i % FACADE.blocks.length];
    box(x, ground - h, w, h, color);
    box(x, ground - h, w, 2, mix(color, WHITE, 0.3));
    for (let y = ground - h + 5; y < ground - 4; y += 6) for (let wx2 = x + 3; wx2 < x + w - 3; wx2 += 5) {
      box(wx2, y, 2, 3, mix(color, INK, 0.25));
      lit(wx2, y, 2, 3);
    }
    if (i % 2 === 0) {
      box(x + w / 2, ground - h - 12, 1, 12, METAL.flagpole);
      const wave = view.reduced ? 0 : Math.floor(t / 15 + i) % 2;
      box(x + w / 2 + 1, ground - h - 12 + wave, 6, 4, FLAG.red);
      box(x + w / 2 + 3, ground - h - 12 + wave, 1, 4, FLAG.white);
      box(x + w / 2 + 1, ground - h - 10 + wave, 6, 1, FLAG.blue);
    }
  }
}

/** Karl Johan's trees, just behind the street, in their first green. */
function nearTrees() {
  for (let i = 0; i < 60; i++) {
    const wx = i * 70 + 20;
    const x = layerX(wx, 0.4);
    if (x < -20 || x > view.w + 20) continue;
    const g = streetY(wx) - 6;
    box(x, g - 30, 2, 30, PLANTS.bark);
    for (let yy = -9; yy <= 9; yy++) {
      const half = Math.floor(Math.sqrt(81 - yy * yy));
      box(x + 1 - half, g - 38 + yy, half * 2, 1, yy < -3 ? PLANTS.birchShine : PLANTS.birchLeaves);
    }
  }
}

export const SLOTTET: LevelDef = {
  id: "slottet",
  rune: 3,
  name: "Slottet",
  landmark: { nb: "17. mai på Karl Johan", en: "17 May on Karl Johan" },
  place: { nb: "Karl Johan, opp til Slottet", en: "Karl Johan, uphill to the palace" },
  sky: "17mai",
  map: MAP,
  legend: { solid: "#UP", oneWay: "=_:-", water: "~" },
  ramps: SLOPES,
  carriers: CARRIERS,
  timed: BALLOONS,
  cannons: [],
  enemies: ENEMIES,
  drum: 7,
  flourish: 150,
  flourishLook: 80,
  floor: (x) => Math.min(ROWS * TILE, streetY(x) + 2 * TILE + 8),
  fireworks: [
    [221 * TILE, 4 * TILE],
    [237 * TILE, 3 * TILE],
    [229 * TILE, 1 * TILE]
  ],
  signs: [
    {
      label: { nb: "17. mai", en: "17 May" },
      lines: { nb: ["Barnetoget går opp Karl Johan til Slottet.", "Gå med, eller ri på en fane."], en: ["The children's parade walks up Karl Johan to the palace.", "Walk with it, or ride a banner."] }
    },
    {
      label: { nb: "Spikersuppa", en: "Spikersuppa" },
      lines: { nb: ["Skøytebane om vinteren.", "I dag: en dam."], en: ["An ice rink in winter.", "Today: a pond."] }
    },
    {
      label: { nb: "Graving pågår", en: "Roadworks" },
      lines: { nb: ["Graving pågår. Siden 2019.", "Skolens fane går over. Stortromma hjelper."], en: ["Digging in progress. Since 2019.", "The school's banner goes over. The bass drum helps."] }
    },
    {
      label: { nb: "Slottet", en: "The palace" },
      lines: { nb: ["Garden marsjerer i takt.", "De bærer deg gjerne et stykke."], en: ["The Guard march in step.", "They will carry you a little way."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => farHills(v.sky),
    mid: (v) => cityRoofs(v.t),
    near: () => nearTrees(),
    back(v) {
      townHouse(0, 8 * TILE, 26 * TILE, 78, PAINT.ochre, v.t);
      townHouse(8 * TILE + 4, 9 * TILE, 26 * TILE, 92, FACADE.blocks[4], v.t);
      townHouse(17 * TILE + 8, 8 * TILE, 26 * TILE, 70, BRICK.kruttverket, v.t);
      townHouse(25 * TILE + 12, 8 * TILE, 26 * TILE, 86, FACADE.blocks[1], v.t);
      grand(v.t);
      storting();
      townHouse(62 * TILE, 7 * TILE, 25 * TILE, 84, FACADE.blocks[3], v.t);
      townHouse(69 * TILE + 4, 6 * TILE, 25 * TILE, 72, PAINT.mint, v.t);
      theatre();
      townHouse(99 * TILE, 8 * TILE, 23 * TILE, 76, FACADE.blocks[0], v.t);
      townHouse(107 * TILE + 4, 7 * TILE, 23 * TILE, 88, PAINT.ochre, v.t);
      university();
      for (const [c, h] of [[143, 40], [152, 46], [160, 38], [170, 50], [178, 42], [186, 36], [204, 44]] as const) parkTree(c * TILE, streetY(c * TILE), h);
      palace(v);
      balusters(41, 45, 20);
      balusters(227, 232, 12);
      tbaneDoor(v.doors.get("tbane"));
      slopes();
      farKerbs();
      parade(v.t);
    },
    front(v) {
      fountain(v.t);
      pondRail();
      barriers(DIG1[0], DIG1[1]);
      barriers(DIG2[0], DIG2[1]);
      crowd(v.t);
    },
    ground: () => ({ top: GROUND.paving, dot: GROUND.pavingDot, fill: UNDER }),
    tile(t, c, r, x, y, map: TileMap) {
      if (t === "U") {
        under(c, r, x, y);
        return true;
      }
      if (t === "#" && map.tileAt(c, r - 1) !== "." && map.tileAt(c, r - 1) !== "~") {
        under(c, r, x, y);
        return true;
      }
      if (t === "P") {
        terraceStone(x, y);
        return true;
      }
      return false;
    },
    ledges: {
      "=": { body: MASONRY.lintel, top: MASONRY.worn, edge: mix(MASONRY.lintel, INK, 0.4), joint: STONE.mortar },
      _: { body: METAL.castIron, top: P.iron, edge: INK, joint: P.ironDark },
      ":": { body: P.earth, top: P.grass, edge: P.grassDark, joint: P.grassDark },
      "-": { body: ROOF.slate, top: MASONRY.worn, edge: INK, joint: ROOF.slate }
    },
    carrier(i, at, v) {
      if (i === GUARD_INDEX) guards(at, v.t);
      else drawBanner(i, at, v.t);
    },
    timed: (i, v) => balloons(i, v.t),
    enemy(e, v) {
      if (e.def.look !== "hotdog") return false;
      hotdogCart(e, v.t);
      return true;
    },
    flourish: (age) => flourish(age)
  }
};
