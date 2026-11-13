import { TILE } from "@larshansen/pixelkit/config";
import { barcode, munch } from "@larshansen/pixelkit/landmarks";
import { R, layerX, light, mix, stoneColumn } from "@larshansen/pixelkit/paint";
import { GLASS, INK, METAL, PAINT, PALETTE, PLANTS, ROOF, SNOW, STONE, STONE_BACK, WHITE, type Stone } from "@larshansen/pixelkit/palette";
import { STONE_LEDGE, type LedgeLook } from "@larshansen/pixelkit/props";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import type { LevelDef, View } from "./types";

// Level 2, rune A: Akershus festning, the fortress above the harbour. Up the outer wall on stone
// ledges and ivy, fired by a cannon onto the next wall, the first flag, a wall-walk with gaps over a
// courtyard, a second cannon over the moat while a hoist goes up and down through its line of fire,
// the second flag, and a climb inside the tower to the rune beside the copper spire.
// Teaches: the flag, and cannons.
//
//   Q  quay   W  fortress stone   #  grass and earth   _  stone ledge   =  ivy   ~  water
//   c  a cannon facing right   f  a flag   e  a sheep   t T-banen

export const MAP = [
  ".........................................................................................................",
  "..............................................................................................o..........",
  "..............................................................................................--.........",
  ".........................................................................................................",
  "................................................................................................r........",
  ".........................................................................................................",
  "............................................................................................WWWWWW.......",
  "......................................................................................W..........W.......",
  "......................................................................................W___.......W.......",
  "......................................................................................W..........W.......",
  "......................................................................................W.....___..W.......",
  "......................................................................................W..........W.......",
  ".......................................................................................___.......W.......",
  "..........................................f....................i...c................f............W.......",
  "........................................WWWWW__WWW..WWWWW...WWWWWWWWWWW...........WWWWWWWWWWWWWWWW.......",
  "........................................WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
  "........................................WWWWW.........................W...........WWWWWWWWWWWWWWWW.......",
  "........................................WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
  "........................................WWWWW.........................W...........WWWWWWWWWWWWWWWW.......",
  "..............................c.........WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
  "..................WWWWWWWWWWWWWWWW......WWWWW.........................W...........WWWWWWWWWWWWWWWW.......",
  "................__WWWWWWWWWWWWWWWW__....WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
  "..................WWWWWWWWWWWWWWWW......WWWWW.........................W...........WWWWWWWWWWWWWWWW.......",
  "................==WWWWWWWWWWWWWWWW__....WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
  "..................WWWWWWWWWWWWWWWW......WWWWW.........................W...........WWWWWWWWWWWWWWWW.......",
  "................__WWWWWWWWWWWWWWWW__....WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
  ".....t.S...i......WWWWWWWWWWWWWWWW......WWWWW..................e......W...........WWWWWWWWWWWWWWWW.......",
  "~~~~QQQQQQQQQQQQQQWWWWWWWWWWWWWWWW######WWWWW#########################W~~~~~~~~~~~WWWWWWWWWWWWWWWW~~~~~~~",
  "~~~~QQQQQQQQQQQQQQWWWWWWWWWWWWWWWW######WWWWW#########################W~~~~~~~~~~~WWWWWWWWWWWWWWWW~~~~~~~",
  "####QQQQQQQQQQQQQQWWWWWWWWWWWWWWWW######WWWWW#########################W###########WWWWWWWWWWWWWWWW#######",
  "####QQQQQQQQQQQQQQWWWWWWWWWWWWWWWW######WWWWW#########################W###########WWWWWWWWWWWWWWWW#######",
  "####QQQQQQQQQQQQQQWWWWWWWWWWWWWWWW######WWWWW#########################W###########WWWWWWWWWWWWWWWW#######"
];

const P = PALETTE;
const WATER = 27 * TILE;
/** The tops of the first rampart and of the wall-walk. */
const RAMPART = 20 * TILE;
const WALK = 14 * TILE;

/** Ivy on the wall: leaves you can climb, as a ledge you jump up through. */
const IVY: LedgeLook = { body: PLANTS.hedge, top: PLANTS.hedgeTop, edge: PLANTS.hedgeDark, joint: PLANTS.hedgeLight };
/** The tip of the copper spire: a little walk round its finial. */
const COPPER: LedgeLook = { body: METAL.copper, top: METAL.copperLight, edge: METAL.copperDark, joint: METAL.copperDark };

/** The hoist over the moat: up into the second cannon's line of fire and down into the water, solid underneath. */
export const HOIST = { kind: "lift" as const, x: 72 * TILE, top: 72, bottom: WATER + 10, w: 3 * TILE, speed: 2, wait: 60, under: 6 };

function hoist(at: { x: number; y: number }) {
  // The beam at the top of its travel, on two posts from the moat's walls, and the chains.
  R(at.x - 6, HOIST.top - 28, HOIST.w + 12, 4, P.woodDark);
  R(at.x - 6, HOIST.top - 28, HOIST.w + 12, 1, mix(P.wood, WHITE, 0.2));
  R(at.x + HOIST.w / 2 - 3, HOIST.top - 34, 6, 6, P.wood);
  R(at.x + HOIST.w / 2 - 1, HOIST.top - 32, 2, 2, METAL.chain);
  for (const cx of [at.x + 4, at.x + HOIST.w - 6]) for (let y = HOIST.top - 24; y < at.y; y += 3) R(cx, y, 2, 2, METAL.chain);
  // The platform: heavy timbers bound with iron.
  R(at.x, at.y, HOIST.w, 6, P.wood);
  R(at.x, at.y, HOIST.w, 1, mix(P.wood, WHITE, 0.25));
  R(at.x, at.y + 5, HOIST.w, 1, P.woodDark);
  for (let i = 0; i < HOIST.w; i += 12) R(at.x + i, at.y + 1, 1, 4, P.woodDark);
  R(at.x + 2, at.y + 2, HOIST.w - 4, 1, METAL.chain);
}

/** Akershus slott behind the walls: white walls, steep dark roofs, small windows, a stair tower with a copper cap. */
function castle(v: View) {
  const base = WATER;
  // Plastered walls on a base of old stone, two floors of small windows, steep slate roofs with dormers.
  const block = (x: number, w: number, top: number, roof: number) => {
    const plaster = WALK + 20;
    R(x, top, w, plaster - top, PAINT.trim);
    R(x, top, 2, plaster - top, mix(PAINT.trim, INK, 0.12));
    for (let xx = x; xx < x + w; xx++) stoneColumn(xx, plaster, base, 0, 0, STONE_BACK);
    for (let i = 0; i < roof; i++) R(x - 2 + Math.floor(i / 2), top - roof + i, w + 4 - Math.floor(i / 2) * 2, 1, i < 2 && v.sky.snow ? SNOW.lying : ROOF.slate);
    for (let dx = 12; dx < w - 12; dx += 28) {
      R(x + dx, top - roof + 6, 7, 6, PAINT.trim);
      R(x + dx + 2, top - roof + 8, 3, 4, GLASS.farWindow);
      light(x + dx + 2, top - roof + 8, 3, 4);
    }
    for (const y of [top + 8, top + 26])
      for (let wx = x + 7; wx < x + w - 8; wx += 14) {
        R(wx, y, 4, 7, GLASS.farWindow);
        R(wx - 1, y - 1, 6, 1, mix(PAINT.trim, INK, 0.25));
        light(wx, y, 4, 7);
      }
  };
  block(48 * TILE, 7 * TILE, WALK - 46, 18);
  block(57 * TILE, 9 * TILE, WALK - 60, 20);
  // A round stair tower with a copper cap between them.
  const tx = 55 * TILE + 6;
  const top = WALK - 112;
  R(tx, top, 24, base - top, mix(PAINT.trim, INK, 0.06));
  for (let i = 0; i < 18; i++) R(tx + 12 - Math.floor(i * 0.7), top - 18 + i, Math.max(1, Math.floor(i * 1.4)), 1, i % 4 === 0 ? METAL.copperLight : METAL.copper);
  R(tx + 11, top - 24, 2, 6, METAL.copperDark);
  R(tx + 9, top + 12, 5, 8, GLASS.farWindow);
  light(tx + 9, top + 12, 5, 8);
  // The wall-walk stands on stone pillars over the courtyard; where it has fallen in, so have they.
  for (const [c0, c1] of [
    [47, 49],
    [52, 56],
    [60, 69]
  ] as const)
    for (let x = c0 * TILE + 2; x < (c1 + 1) * TILE - 4; x += 3 * TILE)
      for (let k = 0; k < 6; k++) stoneColumn(x + k, WALK + TILE, base, 0, 0, STONE_BACK);
}

/** The copper spire on the tower, from the platform up to its tip. */
function spire(v: View) {
  const cx = 95 * TILE;
  const base = 6 * TILE;
  const tip = 2 * TILE + 5;
  for (let y = tip; y < base; y++) {
    const half = Math.round(2 + ((y - tip) / (base - tip)) * 26);
    R(cx - half, y, half * 2, 1, (y - tip) % 9 === 0 ? METAL.copperLight : METAL.copper);
    R(cx - half, y, 2, 1, METAL.copperLight);
    R(cx + half - 2, y, 2, 1, METAL.copperDark);
    if (v.sky.snow && (y - tip) % 9 === 0) R(cx - half, y, half, 1, SNOW.lying);
  }
  // A small dormer window, and the finial above the tip.
  R(cx - 3, base - 20, 6, 8, GLASS.farWindow);
  R(cx - 4, base - 21, 8, 1, METAL.copperDark);
  light(cx - 3, base - 20, 6, 8);
  R(cx - 1, 2, 2, 2 * TILE + 3 - 2, METAL.copperDark);
  R(cx - 2, TILE, 4, 3, METAL.copperLight);
}

/** Merlons along every wall top, so the walls read as a fortress; drawn behind him. */
function crenellations(tops: [number, number, number][]) {
  for (const [c0, c1, y] of tops)
    for (let x = c0 * TILE + 2; x < (c1 + 1) * TILE - 4; x += 10) {
      R(x, y - 6, 6, 6, STONE.base);
      R(x, y - 6, 6, 1, STONE.light);
      R(x + 5, y - 5, 1, 5, STONE.dark);
    }
}

/** Arrow slits, the old gate's arch in the outer wall, and ivy trailing down from its ledge. */
function wallDetails() {
  for (const [x, y] of [
    [21, 23],
    [26, 24],
    [31, 23],
    [42, 17],
    [42, 22],
    [84, 18],
    [90, 22],
    [94, 17]
  ] as const) {
    R(x * TILE + 7, y * TILE, 2, 9, INK);
    R(x * TILE + 6, y * TILE + 3, 4, 2, INK);
  }
  // The old gate, walled up: an arch of dressed stone.
  const gx = 24 * TILE;
  for (let dx = -14; dx <= 14; dx++) {
    const h = Math.round(Math.sqrt(196 - dx * dx));
    R(gx + dx, WATER - 30 - h, 1, 30 + h, mix(STONE.dark, INK, 0.3));
  }
  for (let dx = -16; dx <= 16; dx += 4) {
    const h = Math.round(Math.sqrt(Math.max(0, 256 - dx * dx)));
    R(gx + dx - 1, WATER - 32 - h, 3, 2, STONE.light);
  }
  // Ivy hangs from its ledge down the wall.
  for (let i = 0; i < 9; i++) {
    const x = 16 * TILE + 2 + i * 3;
    const len = 6 + ((i * 7) % 11);
    for (let k = 0; k < len; k += 2) R(x + (k % 4 === 0 ? 0 : 1), 23 * TILE + 5 + k, 2, 2, k % 4 ? PLANTS.hedge : PLANTS.hedgeLight);
  }
}

/** A well in the courtyard, a stone ring with a little roof. */
function well() {
  const x = 52 * TILE;
  const g = WATER;
  R(x, g - 9, 18, 9, STONE.base);
  R(x, g - 9, 18, 2, STONE.light);
  R(x + 2, g - 26, 2, 17, P.woodDark);
  R(x + 14, g - 26, 2, 17, P.woodDark);
  for (let i = 0; i < 6; i++) R(x - 2 + i, g - 32 + i, 22 - i * 2, 1, ROOF.slate);
  R(x + 8, g - 22, 2, 8, METAL.chain);
}

/** The inside of the tower: its stone in shadow, seen past its open front. */
const INSIDE: Stone = { base: mix(STONE_BACK.base, INK, 0.35), light: mix(STONE_BACK.light, INK, 0.35), dark: mix(STONE_BACK.dark, INK, 0.35), mortar: mix(STONE_BACK.mortar, INK, 0.35), moss: STONE_BACK.moss };
function towerInside() {
  for (let x = 87 * TILE; x < 97 * TILE; x++) stoneColumn(x, 7 * TILE, WALK, 0, 0, INSIDE);
}

export const AKERSHUS: LevelDef = {
  id: "akershus",
  rune: 1,
  name: "Akershus festning",
  short: "Akershus",
  landmark: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  place: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  sky: "day",
  map: MAP,
  legend: { solid: "QW#", oneWay: "_=-", water: "~" },
  ramps: [],
  carriers: [HOIST],
  timed: [],
  cannons: [
    { vx: 3.5, vy: 8 },
    { vx: 3.6, vy: 9 }
  ],
  signs: [
    {
      label: { nb: "Porten", en: "The gate" },
      lines: { nb: ["Påbegynt i 1299. Aldri tatt ved beleiring.", "Du må gjerne prøve."], en: ["Begun in 1299. Never taken by siege.", "You are welcome to try."] }
    },
    {
      label: { nb: "Vollgrava", en: "The moat" },
      lines: { nb: ["Heisen går opp og ned.", "Kanonen tar ikke hensyn til det."], en: ["The hoist goes up and down.", "The cannon does not take that into account."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => drawOsloHills(v.sky, WATER),
    mid: (v) => drawFjord(v.t, WATER),
    near(v) {
      // Bjørvika across the harbour, small: MUNCH, the Barcode.
      munch(layerX(1500, 0.4), WATER - 6);
      barcode(layerX(1560, 0.4), WATER - 6);
      drawGulls(v.t, WALK - 120);
    },
    back(v: View) {
      castle(v);
      towerInside();
      spire(v);
      well();
      crenellations([
        [18, 33, RAMPART],
        [40, 44, WALK],
        [47, 49, WALK],
        [52, 56, WALK],
        [60, 70, WALK],
        [82, 86, WALK]
      ]);
      tbaneDoor(v.doors.get("tbane"));
    },
    front: () => wallDetails(),
    ground: () => ({ top: P.grass, dot: P.grassDark, fill: P.earth }),
    ledges: { _: STONE_LEDGE, "=": IVY, "-": COPPER },
    carrier: (_i, at) => hoist(at)
  }
};
