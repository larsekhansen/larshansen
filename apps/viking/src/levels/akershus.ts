import { TILE } from "@larshansen/pixelkit/config";
import { R, mix } from "@larshansen/pixelkit/paint";
import { INK, METAL, PALETTE, PLANTS, WHITE } from "@larshansen/pixelkit/palette";
import { STONE_LEDGE, type LedgeLook } from "@larshansen/pixelkit/props";
import { drawFjord, drawOsloHills } from "../render/backdrop";
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
  "..............................................................................................__.........",
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
  ".............==...WWWWWWWWWWWWWWWW__....WWWWW__.......................W...........WWWWWWWWWWWWWWWW.......",
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

/** Ivy on the wall: leaves you can climb, as a ledge you jump up through. */
const IVY: LedgeLook = { body: PLANTS.hedge, top: PLANTS.hedgeTop, edge: PLANTS.hedgeDark, joint: PLANTS.hedgeLight };

/** The hoist over the moat: up into the second cannon's line of fire and down into the water, solid underneath. */
export const HOIST = { kind: "lift" as const, x: 72 * TILE, top: 72, bottom: WATER + 10, w: 3 * TILE, speed: 2, wait: 60, under: 6 };

function hoist(at: { x: number; y: number }) {
  // The chains up to the beam at the top of its travel.
  for (const cx of [at.x + 4, at.x + HOIST.w - 6]) for (let y = HOIST.top - 24; y < at.y; y += 3) R(cx, y, 2, 2, METAL.chain);
  R(at.x - 4, HOIST.top - 26, HOIST.w + 8, 4, P.woodDark);
  // The platform: heavy timbers bound with iron.
  R(at.x, at.y, HOIST.w, 6, P.wood);
  R(at.x, at.y, HOIST.w, 1, mix(P.wood, WHITE, 0.25));
  R(at.x, at.y + 5, HOIST.w, 1, P.woodDark);
  for (let i = 0; i < HOIST.w; i += 12) R(at.x + i, at.y + 1, 1, 4, P.woodDark);
  R(at.x + 2, at.y + 2, HOIST.w - 4, 1, METAL.chain);
}

export const AKERSHUS: LevelDef = {
  id: "akershus",
  rune: 1,
  name: "Akershus festning",
  landmark: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  place: { nb: "Festningen over havna", en: "The fortress above the harbour" },
  sky: "day",
  map: MAP,
  legend: { solid: "QW#", oneWay: "_=", water: "~" },
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
    back(v: View) {
      tbaneDoor(v.doors.get("tbane"));
    },
    ground: () => ({ top: P.grass, dot: P.grassDark, fill: P.earth }),
    ledges: { _: STONE_LEDGE, "=": IVY },
    carrier: (_i, at) => hoist(at)
  }
};

void INK;
