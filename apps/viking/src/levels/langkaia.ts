import { box, lit } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Door } from "@larshansen/pixelkit/doors";
import { barcode, munch } from "@larshansen/pixelkit/landmarks";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { DOORWAY, FACADE, GLASS, INK, LAMP, LAND, METAL, PAINT, PALETTE, ROOF as ROOFS, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { STOVE_SMOKE, WOOD_LEDGE, ledge, pane, plankDoor, smoke, type LedgeLook } from "@larshansen/pixelkit/props";
import { rampHeight } from "@larshansen/pixelkit/tilemap";
import type { EnemyDef } from "../game/enemies";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { drawLongship } from "../render/ship";
import { tbaneDoor, walls } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 1, rune L: Langkaia, the quay on the water side of the Opera, and the first level anyone
// plays. He comes out of the stage tower's door, walks down the marble roof to the quay, past the
// two harbour sheds, and out over the harbour: the sauna rafts, the sauna club's pier, two rafts
// that drift towards each other, Sørenga's floating promenade with its diving tower, a stone quay,
// and up the moored longship's mast to the rune over the yard.
//
// It teaches from nothing, gently: walking (down the roof), the jump (a crate in the way), ledges
// you jump up through (the sheds' roofs, with skilling on them), the first skilling, a pigeon on its
// own, the first bench and the first flag; then the first water, right after the flag, two tiles
// wide. Nothing here needs the dash or the feather; only the bracteate over the Opera does.
//
//   M  Opera marble   -  the stage tower's roof   Q  quay   P  jetty and pontoons   B  crate
//   _  wooden ledges (roofs, the deck, the mast)   =  the diving tower's platforms   ~  harbour water
//   #  the harbour bed   t T-banen  h Hjem  q Runesmia  v Verkstedet   b  bench   $  skilling   &  cheese
//
// Sections: the quay (teach: everything above, where nothing can be lost), the sauna rafts
// (practise: over the water on moving ground, the middle flag on the club's pier), the drifting
// rafts and Sørenga (twist: moving ground onto moving ground, a high road over the cabin roofs, gulls,
// the diving tower), and the longship (set piece: aboard, up the mast, the yard, the rune).

const COLS = 250;
const ROWS = 20;
/** The water line, the quay's top, as a row. */
const W = 16;
const b = mapBuilder(COLS, ROWS);

// --- The Opera and the quay ------------------------------------------------------------------------
b.fill(0, 6, 9, ROWS - 1, "M");
b.run(0, 4, 5, "-");
b.ground(7, 61, W, "Q");
// The harbour from the quay's end on: water two tiles deep over its bed.
b.fill(62, COLS - 1, W, W + 1, "~");
b.ground(62, COLS - 1, W + 2);
// The sheds' flat roofs, the crates between them (the first jump), the sauna club's deck with a bench.
b.run(24, 29, 14, "_").run(33, 38, 14, "_");
b.put(30, 15, "B").put(31, 15, "B").put(31, 14, "B");
b.run(54, 57, 15, "_");

// --- The sauna rafts: the jetty, two rafts, a pontoon, a raft that drifts, the club's pier --------------
b.run(62, 66, W, "P");
b.run(81, 88, W, "P");
b.run(101, 121, W, "P");
b.run(110, 113, 14, "_");

// --- Two rafts that drift together, the sailboat's crosstree, Sørenga's promenade and diving tower ----
b.run(137, 139, 12, "_");
b.run(142, 165, W, "P");
b.run(158, 159, 14, "=").run(155, 156, 12, "=").run(158, 159, 10, "=").run(155, 159, 8, "=");

// --- The stone quay, a rowing boat, and the longship: its deck, a chest and barrels, the ledges up its
// mast, the yard, the lookout at the masthead ----------------------------------------------------------
b.ground(168, 187, W, "Q");
b.run(193, 229, 15, "_");
// The longship's stern: solid, so the rowing boat lies right against it and a step too far bumps into
// the hull instead of going into the harbour.
b.put(193, 15, "H");
b.put(197, 14, "B").put(201, 14, "B").put(201, 13, "B");
b.run(211, 212, 13, "_").run(214, 215, 11, "_").run(211, 212, 9, "_");
b.run(207, 219, 7, "_");
b.run(212, 214, 5, "_");

// Marks: the start, the doors, signs, benches, flags, the rune, the bracteate, the cheese.
b.put(1, 8, "t").put(4, 8, "h").put(5, 8, "S").put(2, 4, "o");
b.put(21, 15, "i").put(26, 15, "q").put(35, 15, "v").put(41, 15, "i");
b.put(55, 14, "b").put(59, 15, "i").put(61, 15, "f");
b.put(86, 15, "f").put(119, 15, "f").put(144, 15, "f").put(157, 7, "&");
b.put(172, 15, "b").put(175, 15, "i").put(178, 15, "f");
b.put(213, 2, "r");

// Skilling: down the roof, the first two on the quay, the sheds' roofs (up through them), over the
// crates and the pigeon, over every gap and on the rafts' roofs, the hut on the pier, the high road
// over the drifting rafts, the crosstree, over the rat, the diving tower's top, the deck, up the mast,
// the far end of the yard; and four by the bracteate over the Opera.
const COINS: [number, number][] = [
  [0, 4], [1, 4], [3, 4], [4, 4],
  [13, 11], [15, 12], [17, 13],
  [22, 15], [23, 15],
  [25, 13], [26, 13], [27, 13], [28, 13],
  [31, 13],
  [34, 13], [35, 13], [36, 13], [37, 13],
  [47, 13], [48, 12], [49, 13],
  [67, 14], [68, 14], [70, 13], [71, 13], [73, 14], [74, 14], [76, 13], [77, 13], [79, 14], [80, 14],
  [82, 15], [83, 15],
  [94, 13], [95, 13], [99, 14], [100, 14],
  [110, 13], [111, 13], [112, 13], [113, 13],
  [125, 13], [127, 13], [129, 13], [131, 13], [133, 13], [135, 13],
  [137, 11], [138, 11], [139, 11],
  [140, 14], [141, 14],
  [149, 13], [150, 12], [151, 13],
  [155, 7], [156, 7], [158, 7], [159, 7],
  [166, 14], [167, 14],
  [170, 15], [171, 15],
  [188, 14], [189, 14], [192, 13],
  [197, 12], [201, 11], [204, 12], [205, 11], [206, 12],
  [211, 12], [215, 10], [211, 8], [212, 4], [214, 4],
  [218, 6], [219, 6], [220, 6]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

const P = PALETTE;
/** The water line, the quay's top. */
const WATER = W * TILE;
const RAMP = { points: [[7 * TILE, 9 * TILE], [21 * TILE, WATER]] as [number, number][] };

// --- Things that move ----------------------------------------------------------------------------------

// Sauna rafts bob three pixels on a slow beat, out of step. Each has a cabin whose roof is a ledge
// riding with it. Some drift: across a gap and back, easing at each end.
const DECK = WATER - 4;
const ROOF = DECK - 20;
const BOB = { rise: 3, period: 200 };
/** A raft's deck: five tiles, so no gap from one to the next is more than two (it is level 1). */
const RAFT_W = 5 * TILE;
const raft = (x: number, offset: number): CarrierDef[] => [
  { kind: "bob", x, y: DECK, w: RAFT_W, rise: BOB.rise, period: BOB.period, offset },
  { kind: "bob", x: x + TILE, y: ROOF, w: 2 * TILE, rise: BOB.rise, period: BOB.period, offset }
];
/** A raft that drifts across a gap and back at a walk, and waits a second and a half at each end. */
const drift = (from: number, to: number, offset: number): CarrierDef[] =>
  [0, 1].map((k) => ({
    kind: "path",
    points: [
      { x: from + k * TILE, y: k ? ROOF : DECK },
      { x: to + k * TILE, y: k ? ROOF : DECK },
      { x: from + k * TILE, y: k ? ROOF : DECK }
    ],
    w: k ? 2 * TILE : RAFT_W,
    speed: 0.4,
    wait: 0,
    offset,
    stops: [
      { at: 0, steps: 90 },
      { at: 1, steps: 90 }
    ],
    bob: BOB
  }));
/**
 * The two rafts that drift towards each other: each waits at its own end, comes over at a steady
 * pace, and the two stand side by side in the middle for a second and a half before they part.
 */
export const TOGETHER = { speed: 0.6, atEnd: 60, together: 90 };
const meeting = (from: number, to: number): CarrierDef[] =>
  [0, 1].map((k) => ({
    kind: "path",
    points: [
      { x: from + k * TILE, y: k ? ROOF : DECK },
      { x: to + k * TILE, y: k ? ROOF : DECK },
      { x: from + k * TILE, y: k ? ROOF : DECK }
    ],
    w: k ? 2 * TILE : RAFT_W,
    speed: TOGETHER.speed,
    wait: 0,
    stops: [
      { at: 0, steps: TOGETHER.atEnd },
      { at: 1, steps: TOGETHER.together }
    ],
    bob: BOB
  }));
export const RAFTS: CarrierDef[] = [
  ...raft(69 * TILE, 0),
  ...raft(75 * TILE, 70),
  ...drift(91 * TILE, 94 * TILE, 140),
  ...meeting(123 * TILE, 127 * TILE),
  ...meeting(136 * TILE, 132 * TILE)
];
/** The rowing boat between the quay and the longship, moored against its stern: a small raft with no cabin. */
export const BOAT: CarrierDef = { kind: "bob", x: 189 * TILE, y: DECK, w: 4 * TILE, rise: 2, period: 160, offset: 30 };
const CARRIERS: CarrierDef[] = [...RAFTS, BOAT];
const BOAT_INDEX = CARRIERS.length - 1;
/** The rafts by name, as the scripted player looks for them: their decks. */
export const RAFT = { first: RAFTS[0], second: RAFTS[2], drift: RAFTS[4], meetA: RAFTS[6], meetB: RAFTS[8] };

// --- Enemies: a pigeon on its own on the quay, then gulls over the water, pigeons and a rat --------------
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "pigeon", c: 48, r: 15, range: 2 },
  { kind: "walker", look: "pigeon", c: 107, r: 15, range: 2 },
  { kind: "flyer", look: "gull", c: 131, r: 12, range: 2, rise: 6, period: 150 },
  { kind: "walker", look: "rat", c: 150, r: 15, range: 2 },
  { kind: "flyer", look: "gull", c: 153, r: 11, range: 1, rise: 8, period: 170, offset: 40 },
  { kind: "walker", look: "pigeon", c: 224, r: 14, range: 2 },
  { kind: "walker", look: "pigeon", c: 205, r: 14, range: 2 },
  { kind: "flyer", look: "gull", c: 182, r: 12, range: 1, rise: 4, period: 140 }
];

// --- Art ------------------------------------------------------------------------------------------------

/** The stage tower's roof: white like the rest of the Opera. */
const MARBLE_LEDGE: LedgeLook = { body: FACADE.stageTower, top: FACADE.marble, edge: FACADE.stageTowerDot, joint: FACADE.stageTowerTop };
/** The diving tower's concrete platforms, painted white. */
const CONCRETE: LedgeLook = { body: FACADE.marbleWall, top: WHITE, edge: FACADE.marbleSeam, joint: FACADE.marbleSeam };

/** A sauna raft: pontoons, a plank deck, and a tarred cabin with a warm window and a smoking stove pipe. */
function saunaRaft(x: number, y: number, t: number) {
  const n = RAFT_W / TILE;
  R(x + 3, y + 4, RAFT_W - 6, 1, PAINT.tar);
  R(x + 2, y + 5, RAFT_W - 4, 2, mix(PAINT.tar, P.water, 0.5));
  for (let i = 0; i < n; i++) ledge(x + i * TILE, y, WOOD_LEDGE, i === 0, i === n - 1, false);
  // The cabin, between the deck and its roof.
  const cx = x + TILE;
  R(cx, y - 18, 2 * TILE, 18, PAINT.tar);
  for (let i = 2; i < 2 * TILE; i += 4) R(cx + i, y - 18, 1, 18, mix(PAINT.tar, INK, 0.35));
  R(cx, y - 18, 1, 18, mix(PAINT.tar, WHITE, 0.15));
  R(cx + 2 * TILE - 1, y - 18, 1, 18, INK);
  // A small door, and the window with the stove's light behind it.
  R(cx + 4, y - 13, 7, 13, mix(PAINT.tar, INK, 0.5));
  R(cx + 9, y - 8, 1, 1, METAL.brass);
  R(cx + 17, y - 14, 10, 7, P.woodDark);
  R(cx + 18, y - 13, 8, 5, LAMP);
  R(cx + 22, y - 13, 1, 5, P.woodDark);
  light(cx + 18, y - 13, 4, 5, "soft");
  light(cx + 23, y - 13, 3, 5, "soft");
  // The stove pipe through the roof, and its smoke.
  R(cx + 24, y - 27, 3, 7, METAL.pipe);
  R(cx + 23, y - 28, 5, 1, METAL.pipeCap);
  if (!view.reduced) smoke(cx + 24, y - 30, t, { ...STOVE_SMOKE, rise: 18 });
}

/** The roof of a sauna's cabin: tarred boards, a ledge he can stand on. */
const SAUNA_ROOF: LedgeLook = { body: mix(PAINT.tar, P.woodDark, 0.5), top: P.wood, edge: INK, joint: PAINT.tar };

/** The Opera from behind: the stage tower with the door Hjem, the white roof sloping down to the quay over a glass foyer. */
function opera(v: View) {
  // The stage tower, aluminium-white with its dotted cladding.
  R(0, 5 * TILE, 5 * TILE + 8, 4 * TILE, FACADE.stageTower);
  R(0, 5 * TILE + 5, 5 * TILE + 8, 2, FACADE.stageTowerTop);
  for (let y = 5 * TILE + 10; y < 9 * TILE - 2; y += 4) for (let x = 2; x < 5 * TILE + 6; x += 4) R(x + ((y / 4) % 2) * 2, y, 1, 1, FACADE.stageTowerDot);
  const home = v.doors.get("home");
  if (home) {
    R(home.x - 1, home.bottom - home.h - 1, home.w + 2, home.h + 1, FACADE.stageTowerDot);
    R(home.x, home.bottom - home.h, home.w, home.h, home.open ? DOORWAY.stage : FACADE.stageDoor);
    R(home.x + home.w - 4, home.bottom - 16, 2, 2, METAL.brass);
  }
  // The roof slope over the foyer: marble on top, glass below, mullions and lamps behind it.
  for (let x = 7 * TILE; x < 21 * TILE; x++) {
    const s = Math.round(rampHeight([RAMP], x) ?? WATER);
    R(x, s, 1, 3, FACADE.marble);
    R(x, s + 3, 1, 1, FACADE.marbleEdge);
    const mullion = x % 6 === 0;
    if (s + 4 < WATER) R(x, s + 4, 1, WATER - s - 4, mullion ? GLASS.foyerMullion : GLASS.foyer);
    if (!mullion) for (let y = 9 * TILE + 8; y < WATER; y += 10) if (y > s + 4) R(x, y, 1, 1, GLASS.foyerMullion);
    if (x % 6 === 3 && WATER - s > 12) light(x, s + 6, 1, WATER - s - 8, "soft");
  }
}

/** A harbour shed: painted plank walls under its flat roof (the ledge), and its door. */
function shed(x0: number, color: string, line: string, door: Door | undefined) {
  walls(x0, 14 * TILE + 5, 6 * TILE, color, line, WATER);
  R(x0 - 2, 14 * TILE + 5, 6 * TILE + 4, 1, INK);
  pane(x0 + 10, 14 * TILE + 10, 8, 6);
  if (door) plankDoor(door, PAINT.trim);
}

/** Verkstedet's window: the 3D printer at work on a small longship, a spool of the same orange on the shelf. */
function printer(x: number, y: number, t: number) {
  const orange = mix(PAINT.red, LAMP, 0.5);
  R(x - 1, y - 1, 26, 17, PAINT.trim);
  R(x, y, 24, 15, mix(P.woodDark, INK, 0.5));
  // The printer: a dark box, its glass front, the bed.
  R(x + 2, y + 1, 14, 13, METAL.pipe);
  R(x + 3, y + 3, 12, 9, mix(GLASS.pane, INK, 0.6));
  R(x + 3, y + 10, 12, 1, METAL.pipeCap);
  // The longship on the bed: hull, the two stems, the mast.
  R(x + 6, y + 9, 6, 1, orange);
  R(x + 5, y + 8, 1, 1, orange);
  R(x + 12, y + 8, 1, 1, orange);
  R(x + 9, y + 7, 1, 2, orange);
  // The head goes back and forth on its rail.
  const head = view.reduced ? 5 : Math.abs((Math.floor(t / 5) % 18) - 9);
  R(x + 3, y + 4, 12, 1, METAL.pipeCap);
  R(x + 4 + head, y + 4, 2, 2, INK);
  R(x + 4 + head, y + 6, 1, 1, LAMP);
  // The spool on its shelf.
  R(x + 18, y + 4, 4, 4, orange);
  R(x + 19, y + 5, 2, 2, INK);
  R(x + 17, y + 8, 6, 1, P.wood);
  // At night only its own lamp strip and the hot end glow, so the print still shows.
  R(x + 3, y + 2, 12, 1, LAMP);
  light(x + 3, y + 2, 12, 1);
  light(x + 4 + head, y + 6, 1, 1);
}

/** Posts under a wooden ledge down to the ground or the water, so a deck or a roof stands on something. */
function posts(c0: number, c1: number, r: number, ground: number) {
  const y = r * TILE + 5;
  for (const x of [c0 * TILE + 2, (c1 + 1) * TILE - 5]) {
    R(x, y, 3, ground - y, P.woodDark);
    R(x, y, 1, ground - y, mix(P.woodDark, WHITE, 0.15));
  }
}

/** The sauna club's hut on its pier: black-tarred planks, a lit window, a stove pipe smoking. Its roof is the map's ledge. */
function clubHut(t: number) {
  const x = 110 * TILE;
  const top = 14 * TILE + 5;
  walls(x, top, 4 * TILE, PAINT.tar, mix(PAINT.tar, INK, 0.35), WATER);
  R(x - 2, top, 4 * TILE + 4, 1, INK);
  R(x + 8, top + 4, 12, 7, P.woodDark);
  R(x + 9, top + 5, 10, 5, LAMP);
  light(x + 9, top + 5, 10, 5, "soft");
  R(x + 40, top + 3, 9, 16, mix(PAINT.tar, INK, 0.5));
  R(x + 52, top - 14, 3, 13, METAL.pipe);
  R(x + 51, top - 15, 5, 1, METAL.pipeCap);
  if (!view.reduced) smoke(x + 52, top - 18, t + 30, STOVE_SMOKE);
}

/** A small sailboat at its buoy behind the drifting rafts: a white hull, the mast, the furled sail; its crosstree is a ledge. */
function sailboat() {
  const x = 134 * TILE;
  const deck = WATER - 6;
  for (let i = 0; i < 6; i++) R(x + i * 2, deck + i, 7 * TILE - i * 4, 1, i < 2 ? PAINT.ferryWhite : PAINT.ferryShade);
  R(x, deck, 7 * TILE, 1, WHITE);
  R(x + 6, deck + 2, 7 * TILE - 12, 1, PAINT.tbane);
  const mx = 138 * TILE + 8;
  R(mx, 8 * TILE, 2, deck - 8 * TILE, METAL.pipeShine);
  R(mx - 1, 8 * TILE - 2, 4, 2, METAL.pipe);
  // The boom with the sail furled on it, and the stays.
  R(mx - 40, deck - 14, 42, 2, METAL.pipe);
  R(mx - 38, deck - 18, 38, 4, P.sail);
  R(mx - 38, deck - 18, 38, 1, mix(P.sail, WHITE, 0.5));
  for (let i = 0; i < 40; i += 2) R(mx + 2 + Math.round(i * 0.9), 8 * TILE + Math.round(i * 2.1), 1, 1, METAL.wire);
}

/** Sørenga's diving tower: two white concrete legs out of the water, a ladder, its platforms (the map's ledges). */
function divingTower() {
  const x0 = 155 * TILE;
  const top = 8 * TILE;
  for (const lx of [x0 + 4, x0 + 5 * TILE - 10]) {
    R(lx, top, 6, WATER - top, FACADE.marbleWall);
    R(lx, top, 2, WATER - top, WHITE);
    R(lx + 5, top, 1, WATER - top, FACADE.marbleSeam);
  }
  // The ladder up the middle.
  const lx = x0 + 2 * TILE + 6;
  R(lx, top, 1, WATER - top, METAL.rail);
  R(lx + 6, top, 1, WATER - top, METAL.rail);
  for (let y = top + 3; y < WATER; y += 5) R(lx, y, 7, 1, METAL.rail);
  // A railing round the top platform, and the board out over the water.
  R(x0, top - 9, 5 * TILE, 1, METAL.rail);
  for (let x = x0; x < x0 + 5 * TILE; x += 8) R(x, top - 9, 1, 9, METAL.rail);
  R(x0 + 5 * TILE, top + 2, 24, 3, PAINT.ochre);
  R(x0 + 5 * TILE, top + 2, 24, 1, mix(PAINT.ochre, WHITE, 0.4));
}

/** A low wooden deck on legs: the sauna club's, with its bench. */
function deckLegs() {
  posts(54, 57, 15, WATER);
}

/** A gull standing on the jetty's last post, who takes off when he comes close. */
const PERCH = { x: 66 * TILE + 8, y: WATER - 6 };
let scaredAt: number | null = null;
function perchedGull(v: View, near: boolean) {
  if (scaredAt !== null && v.t < scaredAt) scaredAt = null; // the level began again
  if (near && scaredAt === null) scaredAt = v.t;
  if (!near && scaredAt !== null && v.t - scaredAt > 600) scaredAt = null;
  R(PERCH.x - 1, PERCH.y + 2, 3, 4, mix(P.woodDark, P.water, 0.3));
  if (scaredAt === null) {
    // Sitting: a white body, a grey back, a yellow beak.
    R(PERCH.x - 3, PERCH.y - 3, 6, 3, P.wool);
    R(PERCH.x - 2, PERCH.y - 4, 4, 1, PALETTE.iron);
    R(PERCH.x + 2, PERCH.y - 5, 2, 2, P.wool);
    R(PERCH.x + 4, PERCH.y - 4, 1, 1, METAL.gold);
    R(PERCH.x - 1, PERCH.y, 1, 2, METAL.gold);
    return;
  }
  const a = v.t - scaredAt;
  if (a > 160) return;
  const wing = view.reduced ? 0 : Math.floor(a / 5) % 2 ? 1 : -1;
  const x = PERCH.x + a * 0.9;
  const y = PERCH.y - 4 - a * 0.6 - Math.sin(a * 0.2) * 2;
  R(Math.round(x), Math.round(y), 1, 1, P.wool);
  R(Math.round(x) - 1, Math.round(y) - wing, 1, 1, P.wool);
  R(Math.round(x) + 1, Math.round(y) - wing, 1, 1, P.wool);
  R(Math.round(x) - 2, Math.round(y) - wing * 2, 1, 1, P.wool);
  R(Math.round(x) + 2, Math.round(y) - wing * 2, 1, 1, P.wool);
}

/** Where the rune is taken: over the lookout at the masthead, above the yard. */
const MAST = 213 * TILE + 8;
const YARD = 7 * TILE;
const MAST_TOP = 5 * TILE - 10;
const SHIP = { x0: 192 * TILE + 8, x1: 229 * TILE + 8, deck: 15 * TILE, mast: MAST, yard: YARD, sail0: 207 * TILE, sailW: 13 * TILE, mastTop: MAST_TOP };

/** The rowing boat: a varnished hull, its oars shipped. Its thwart is what he stands on. */
function rowingBoat(at: { x: number; y: number }) {
  const { x, y } = at;
  const w = BOAT.w;
  for (let i = 0; i < 6; i++) R(x - 2 + i, y + i, w + 4 - i * 2, 1, i < 1 ? mix(P.wood, WHITE, 0.3) : i % 2 ? P.woodDark : P.wood);
  R(x + 2, y, w - 4, 2, P.wood);
  R(x + 4, y - 2, 1, 2, P.woodDark);
  R(x + w - 5, y - 2, 1, 2, P.woodDark);
  R(x + 3, y - 3, w - 6, 1, P.woodDark);
}

/** The lookout round the masthead: a ring of planks on brackets, its rail. The floor is the map's ledge. */
function lookout() {
  const x = 212 * TILE;
  const y = 5 * TILE;
  R(x + 6, y + 5, 3 * TILE - 12, 3, P.woodDark);
  R(x, y - 8, 3 * TILE, 1, P.woodDark);
  for (const px of [x, x + 3 * TILE - 1, x + 12, x + 3 * TILE - 13]) R(px, y - 8, 1, 8, P.woodDark);
}

/**
 * The flourish: the wind gets into the sail, a red and cream pennant runs up the masthead and
 * streams out, and the gulls on the yard's ends take off.
 */
function flourish(age: number) {
  const k = Math.min(1, age / 50);
  const top = MAST_TOP;
  const y = Math.round(top - 2 - 22 * k);
  // The staff over the masthead, and the pennant on it.
  R(MAST, top - 26, 1, 26, P.woodDark);
  const flap = view.reduced ? 0 : Math.floor(age / 6) % 2;
  for (let i = 0; i < 22; i++) {
    const h = Math.max(1, 5 - Math.floor(i / 5));
    R(MAST + 1 + i, y + (i > 8 ? flap : 0), 1, h, Math.floor(i / 4) % 2 ? P.sail : P.sailStripe);
  }
  // Gulls up off the yard's ends.
  if (view.reduced) return;
  for (const [x0, dir] of [
    [207 * TILE + 4, -1],
    [220 * TILE - 4, 1],
    [209 * TILE, -1]
  ] as const) {
    const a = age - (x0 === 209 * TILE ? 12 : 0);
    if (a < 0 || a > 140) continue;
    const gx = Math.round(x0 + dir * a * 0.8);
    const gy = Math.round(YARD - 4 - a * 0.7);
    const wing = Math.floor(a / 5) % 2 ? 1 : -1;
    for (const [dx, dy] of [[0, 0], [-1, -wing], [1, -wing], [-2, -wing * 2], [2, -wing * 2]] as const) R(gx + dx, gy + dy, 1, 1, P.wool);
  }
}

/** Across the water, in the near layer: Sørenga's blocks, and at the far end the fortress on its hill, the next stop. */
function sorenga(x: number, base: number) {
  const blocks = [
    { dx: 0, w: 26, h: 44, c: FACADE.blocks[0] },
    { dx: 30, w: 22, h: 56, c: FACADE.blocks[2] },
    { dx: 56, w: 30, h: 38, c: FACADE.blocks[1] },
    { dx: 90, w: 24, h: 50, c: FACADE.blocks[3] }
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
function fortressHill(x: number, base: number) {
  for (let i = 0; i < 120; i++) {
    const h = Math.round(22 * Math.pow(Math.sin((Math.PI * i) / 120), 0.6));
    box(x + i, base - h, 1, h, i % 9 === 0 ? LAND.forestDark : LAND.forest);
  }
  box(x + 18, base - 34, 80, 14, STONE.base);
  for (let y = base - 31; y < base - 20; y += 4) box(x + 18, y, 80, 1, STONE.dark);
  for (let y = base - 34, k = 0; y < base - 20; y += 4, k++) for (let i = (k % 2) * 4; i < 80; i += 8) box(x + 18 + i, y, 1, 3, STONE.dark);
  for (let i = 0; i < 80; i += 6) box(x + 18 + i, base - 37, 3, 3, STONE.base);
  box(x + 40, base - 56, 36, 22, PAINT.trim);
  box(x + 38, base - 62, 40, 6, ROOFS.slate);
  box(x + 56, base - 74, 4, 12, METAL.copper);
  for (let i = 0; i < 4; i++) box(x + 44 + i * 8, base - 50, 3, 4, GLASS.farWindow);
}

export const LANGKAIA: LevelDef = {
  id: "langkaia",
  rune: 0,
  name: "Langkaia",
  landmark: { nb: "Operaen og badstuene", en: "The Opera and the saunas" },
  place: { nb: "Bjørvika, på vannsida av Operaen", en: "Bjørvika, on the water side of the Opera" },
  sky: null,
  map: MAP,
  legend: { solid: "MQPBH#", oneWay: "_-=", water: "~" },
  ramps: [RAMP],
  carriers: CARRIERS,
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  flourish: 150,
  flourishLook: 30,
  signs: [
    {
      label: { nb: "Operaen", en: "The Opera" },
      lines: { nb: ["Operaen, sett bakfra.", "Samme tak som på forsida. Gå ned."], en: ["The Opera, seen from behind.", "The same roof as on the front page. Walk down."] }
    },
    {
      label: { nb: "Kaia", en: "The quay" },
      lines: { nb: ["Runesmia og Verkstedet har flyttet ned på kaia.", "Husleia var lavere."], en: ["Runesmia and Verkstedet moved down to the quay.", "The rent was lower."] }
    },
    {
      label: { nb: "Badstuene", en: "The saunas" },
      lines: { nb: ["Flytende badstuer. Hopp fra flåte til flåte.", "Vannet er kaldt: det koster et hjerte. Flagget husker hvor du var."], en: ["Floating saunas. Hop from raft to raft.", "The water is cold: it costs a heart. The flag remembers where you were."] }
    },
    {
      label: { nb: "Langskipet", en: "The longship" },
      lines: { nb: ["Skipet fra det gamle spillet, flyttet hit.", "Runen henger over råa."], en: ["The ship from the old game, moved here.", "The rune hangs over the yard."] }
    }
  ],
  doors: [
    { id: "tbane", tile: "t", sign: "T-banen", href: "#kart" },
    { id: "home", tile: "h", sign: "Hjem", href: "/?from=viking" },
    { id: "qr", tile: "q", sign: "Runesmia", href: "/qr/" },
    { id: "github", tile: "v", sign: "Verkstedet", href: "https://github.com/larsekhansen" }
  ],
  art: {
    far: (v) => drawOsloHills(v.sky, WATER),
    mid: (v) => drawFjord(v.t, WATER),
    near(v) {
      // MUNCH and the Barcode across the water, where the front page has them too; Sørenga; the fortress.
      const at = (wx: number) => layerX(wx, 0.4);
      munch(at(300), WATER - 2);
      barcode(at(360), WATER - 2);
      sorenga(at(1500), WATER - 2);
      sorenga(at(2500) + 40, WATER - 2);
      fortressHill(at(3500), WATER - 2);
      drawGulls(v.t, 20);
    },
    back(v) {
      opera(v);
      tbaneDoor(v.doors.get("tbane"));
      shed(24 * TILE, PAINT.red, PAINT.redLine, v.doors.get("qr"));
      shed(33 * TILE, PAINT.ochre, PAINT.ochreLine, v.doors.get("github"));
      printer(33 * TILE + 58, 14 * TILE + 10, v.t);
      deckLegs();
      clubHut(v.t);
      sailboat();
      divingTower();
      const belly = v.flourish === null ? 3 : 3 + Math.min(6, Math.floor(v.flourish / 8));
      drawLongship({ ...SHIP, belly });
      lookout();
      perchedGull(v, Math.abs(v.him.x - PERCH.x) < 56 && Math.abs(v.him.y - PERCH.y) < 40);
    },
    ground: () => ({ top: P.sand, dot: P.sandDark, fill: P.earth }),
    // The stern, solid under its deck: drawn as the deck, the hull behind it.
    tile(t, _c, _r, x, y, _map, sky) {
      if (t !== "H") return false;
      ledge(x, y, WOOD_LEDGE, false, false, sky.snow);
      return true;
    },
    ledges: { _: WOOD_LEDGE, "-": MARBLE_LEDGE, "=": CONCRETE },
    carrier(i, at, v) {
      if (i === BOAT_INDEX) rowingBoat(at);
      else if (i % 2 === 0) saunaRaft(at.x, at.y, v.t + i * 40);
      else for (let k = 0; k < 2; k++) ledge(at.x + k * TILE, at.y, SAUNA_ROOF, k === 0, k === 1, v.sky.snow);
    },
    flourish: (age) => flourish(age)
  }
};
