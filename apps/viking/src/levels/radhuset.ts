import { TILE } from "@larshansen/pixelkit/config";
import { mix } from "@larshansen/pixelkit/paint";
import { BRICK, GROUND, INK, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import { type LedgeLook } from "@larshansen/pixelkit/props";
import { drawFjord, drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import type { BellLedge, LevelDef, View } from "./types";

// Level 3, rune R: Rådhuset, the City Hall's two brick towers. Across the water on the island
// ferry's roof, over the square, up the west tower in a window-cleaner's lift, through it, bell to
// bell between the towers, and up the east tower past its clock to the rune on top.
// Teaches: ledges on a beat, and lifts. It is tall: the camera follows him up.
//
//   Q  quay   X  brick   #  the square   =  a ledge on the brick   ~  water   t T-banen

export const MAP = [
  "....................................................................................................",
  "....................................................................................................",
  "...........................................................................................r........",
  "....................................................................................................",
  "......................................................................................XXXXXXXXXXXX..",
  "......................................................................................XXXXXXXXXXXX..",
  "....................................................................................==XXXXXXXXXXXX..",
  "......................................................................................XXXXXXXXXXXX..",
  "....................................................................................==XXXXXXXXXXXX..",
  "......................................................................................XXXXXXXXXXXX..",
  "......................................................................................XXXXXXXXXXXX..",
  "......................................................................................XXXXXXXXXXXX..",
  "............................................................o.........................XXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXX....................XXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXX....................XXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXX....................XXXXXXXXXXXX..",
  "......................................................................................XXXXXXXXXXXX..",
  ".....................................................................f......i.........XXXXXXXXXXXX..",
  ".....................................................=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  ".....................................................=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  ".....................................................=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "......................................................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  ".t.S....i..........................i..................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..",
  "QQQQQQQQQQQ~~~~~~~~~~~~~~~~~~#######################################################################",
  "QQQQQQQQQQQ~~~~~~~~~~~~~~~~~~#######################################################################",
  "QQQQQQQQQQQ#########################################################################################",
  "QQQQQQQQQQQ#########################################################################################"
];

const P = PALETTE;
const WATER = 36 * TILE;

/** A ledge of brick on the tower's face. */
const BRICK_LEDGE: LedgeLook = { body: BRICK.red, top: mix(BRICK.red, WHITE, 0.35), edge: mix(BRICK.red, INK, 0.45), joint: BRICK.course };

export const FERRY = { kind: "travel" as const, from: { x: 11 * TILE, y: WATER - 28 }, to: { x: 25 * TILE, y: WATER - 28 }, w: 4 * TILE, period: 720, offset: 570 };
export const LIFT = { kind: "lift" as const, x: 50 * TILE, top: 18 * TILE, bottom: WATER, w: 3 * TILE, speed: 2, wait: 45 };

/** The carillon: five bells in a rising row between the towers, each on for two seconds, warning for one, gone for two; each a step behind the one before. */
export const BELLS: BellLedge[] = [0, 1, 2, 3, 4].map((i) => ({ x: 70 * TILE + i * 3 * TILE, y: 16 * TILE - i * 24, w: 2 * TILE, on: 120, warn: 60, off: 120, offset: -100 * i, note: i }));

export const RADHUSET: LevelDef = {
  id: "radhuset",
  rune: 2,
  name: "Rådhuset",
  landmark: { nb: "Klokkene mellom tårnene", en: "The bells between the towers" },
  place: { nb: "De to tårnene på Rådhusplassen", en: "The two towers on Rådhusplassen" },
  sky: "day",
  map: MAP,
  legend: { solid: "QX#", oneWay: "=", water: "~" },
  ramps: [],
  carriers: [FERRY, LIFT],
  timed: BELLS,
  cannons: [],
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
      label: { nb: "Taket", en: "The roof" },
      lines: { nb: ["Klokkene kommer og går.", "Vent på den neste."], en: ["The bells come and go.", "Wait for the next one."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => drawOsloHills(v.sky, WATER),
    mid: (v) => drawFjord(v.t, WATER),
    back(v: View) {
      tbaneDoor(v.doors.get("tbane"));
    },
    ground: (c) => (c < 11 ? { top: GROUND.paving, dot: GROUND.pavingDot, fill: GROUND.pavingFill } : { top: GROUND.paving, dot: GROUND.pavingDot, fill: GROUND.pavingFill }),
    ledges: { "=": BRICK_LEDGE }
  }
};

void P;
