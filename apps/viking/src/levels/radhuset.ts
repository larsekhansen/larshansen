import { osloClock } from "@larshansen/pixelkit/oslo";
import { TILE } from "@larshansen/pixelkit/config";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, GLASS, GROUND, INK, LAMP, MASONRY, METAL, PAINT, PALETTE, SHIMMER, SNOW, WHITE } from "@larshansen/pixelkit/palette";
import { lampPool, lampPost, type LedgeLook } from "@larshansen/pixelkit/props";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
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
const SQUARE = WATER;

/** A ledge of brick on the tower's face. */
const BRICK_LEDGE: LedgeLook = { body: BRICK.red, top: mix(BRICK.red, WHITE, 0.35), edge: mix(BRICK.red, INK, 0.45), joint: BRICK.course };

/** The island ferry: its roof is the way over, and it crosses and comes back, easing in at each quay. */
export const FERRY = { kind: "travel" as const, from: { x: 11 * TILE, y: WATER - 28 }, to: { x: 25 * TILE, y: WATER - 28 }, w: 4 * TILE, period: 720, offset: 570 };
/** The window-cleaner's lift up the west tower's face. */
export const LIFT = { kind: "lift" as const, x: 50 * TILE, top: 18 * TILE, bottom: WATER, w: 3 * TILE, speed: 2, wait: 45 };

/** The carillon: five bells in a rising row between the towers, each on for two seconds, warning for one, gone for two; each a step behind the one before. */
export const BELLS: BellLedge[] = [0, 1, 2, 3, 4].map((i) => ({ x: 70 * TILE + i * 3 * TILE, y: 16 * TILE - i * 24, w: 2 * TILE, on: 120, warn: 60, off: 120, offset: -100 * i, note: i }));

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
  // The cabin under the roof, with its windows.
  R(x + 2, y + 3, TILE * 4 - 4, 9, PAINT.ferryWhite);
  for (let wx = x + 6; wx < x + 58; wx += 8) {
    R(wx, y + 5, 5, 4, GLASS.pane);
    light(wx, y + 5, 5, 4);
  }
  // The roof: a grey deck with a railing he stands inside.
  R(x, y, TILE * 4, 3, PAINT.ferryShade);
  R(x, y, TILE * 4, 1, WHITE);
  for (let rx = x + 2; rx < x + 62; rx += 6) R(rx, y - 4, 1, 4, PAINT.ferryShade);
  R(x, y - 5, TILE * 4, 1, PAINT.ferryShade);
  // The funnel at the stern.
  R(x + 52, y - 12, 6, 8, PAINT.ferryRed);
  R(x + 52, y - 12, 6, 2, INK);
}

/** The window-cleaner's gondola: a steel cradle on two ropes from a davit on the tower top. */
function gondola(at: { x: number; y: number }) {
  const { x, y } = at;
  const top = 13 * TILE - 6;
  // The davit arm out from the tower top, and the ropes down to the cradle.
  R(x + 6, top - 4, 3 * TILE + 2, 3, METAL.pipe);
  R(x + 3 * TILE + 6, top - 10, 3, 10, METAL.pipe);
  for (const rx of [x + 6, x + 3 * TILE - 7]) R(rx, top, 1, y - top - 8, METAL.chain);
  // The cradle: a floor he stands on, a rail at waist height, a bucket.
  R(x, y, 3 * TILE, 4, METAL.pipe);
  R(x, y, 3 * TILE, 1, mix(METAL.pipe, WHITE, 0.35));
  R(x, y - 9, 3 * TILE, 1, METAL.rail);
  for (const px of [x, x + 3 * TILE - 1, x + 24]) R(px, y - 9, 1, 9, METAL.rail);
  R(x + 34, y - 5, 6, 5, PAINT.tbane);
  R(x + 34, y - 5, 6, 1, mix(PAINT.tbane, WHITE, 0.4));
}

/** A bell of the carillon: its oak yoke (the ledge), the gold bell under it, and the warning shimmer. Gone, a faint outline waits. */
function bell(i: number, v: View) {
  const b = BELLS[i];
  const phase = timedPhase(v.t, b);
  const cx = b.x + b.w / 2;
  // The iron rod it hangs from, always there.
  R(cx, b.y - 60, 1, 60, METAL.chain);
  if (phase === "off") {
    for (let x = b.x; x < b.x + b.w; x += 3) R(x, b.y, 1, 1, mix(METAL.gold, P.water, 0.5));
    return;
  }
  // He is standing on it: it sways a pixel.
  const on = Math.abs(v.him.x - cx) < b.w / 2 + 5 && Math.abs(v.him.y + 7 - b.y) < 2;
  const sway = on && !view.reduced ? (Math.floor(v.t / 6) % 2 ? 1 : -1) : 0;
  R(b.x, b.y, b.w, 4, P.woodDark);
  R(b.x, b.y, b.w, 1, P.wood);
  R(b.x + 2, b.y + 4, 2, 2, METAL.chain);
  R(b.x + b.w - 4, b.y + 4, 2, 2, METAL.chain);
  // The bell: shoulder, waist, a flared lip, the clapper below.
  const rows = [8, 10, 12, 12, 12, 14, 14, 16, 18, 20];
  rows.forEach((w, k) => {
    const x = cx - w / 2 + sway;
    R(x, b.y + 5 + k, w, 1, k === 0 ? METAL.goldLight : METAL.gold);
    R(x, b.y + 5 + k, 1, 1, METAL.goldLight);
    R(x + w - 2, b.y + 5 + k, 2, 1, METAL.goldDark);
  });
  R(cx - 10 + sway, b.y + 15, 20, 1, METAL.goldDark);
  R(cx - 1 + sway * 2, b.y + 16, 2, 3, METAL.keyhole);
  if (phase === "warn" && Math.floor(v.t / 8) % 2 === 0) {
    // The maze's warning: a two-pixel outline round it, blinking every eight steps.
    const x = b.x - 2;
    const y = b.y - 2;
    const w = b.w + 4;
    const h = 22;
    R(x, y, w, 2, SHIMMER);
    R(x, y + h - 2, w, 2, SHIMMER);
    R(x, y, 2, h, SHIMMER);
    R(x + w - 2, y, 2, h, SHIMMER);
  }
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

/** The clock on the east tower, cream with dark hands, at Oslo's time (the frozen one when stepped). */
function clock(v: View) {
  const cx = 91 * TILE + 8;
  const cy = 10 * TILE;
  const r = 16;
  for (let dy = -r - 2; dy <= r + 2; dy++) {
    const w = Math.floor(Math.sqrt((r + 2) * (r + 2) - dy * dy));
    R(cx - w, cy + dy, w * 2 + 1, 1, METAL.goldDark);
  }
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy));
    R(cx - w, cy + dy, w * 2 + 1, 1, PAINT.trim);
  }
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    R(Math.round(cx + Math.sin(a) * (r - 2)), Math.round(cy - Math.cos(a) * (r - 2)), h % 3 === 0 ? 2 : 1, h % 3 === 0 ? 2 : 1, INK);
  }
  const c = osloClock(v.now);
  const hand = (turn: number, len: number) => {
    const a = turn * Math.PI * 2;
    for (let k = 0; k <= len; k++) R(Math.round(cx + Math.sin(a) * k), Math.round(cy - Math.cos(a) * k), 1, 1, INK);
  };
  hand(((c.hour % 12) + 0) / 12, 9);
  hand((c.hour % 1), 13);
  R(cx, cy, 1, 1, METAL.gold);
}

/** The east tower's top: a parapet, and a small lantern at its corner. */
function towerTop(v: View) {
  const y = 4 * TILE;
  for (let x = 86 * TILE; x < 98 * TILE - 4; x += 8) {
    R(x, y - 4, 5, 4, BRICK.red);
    R(x, y - 4, 5, 1, mix(BRICK.red, WHITE, 0.3));
  }
  const lx = 96 * TILE;
  R(lx, y - 22, 12, 18, PAINT.trim);
  R(lx + 3, y - 18, 6, 8, LAMP);
  light(lx + 3, y - 18, 6, 8, "soft");
  for (let i = 0; i < 6; i++) R(lx - 1 + i, y - 28 + i, 14 - i * 2, 1, v.sky.snow && i < 2 ? SNOW.lying : METAL.copper);
}

/** The passage through the west tower: dark, with a lamp on its wall. */
function passage() {
  R(54 * TILE, 16 * TILE, 12 * TILE, 2 * TILE, mix(BRICK.red, INK, 0.65));
  for (let x = 56 * TILE; x < 66 * TILE; x += 48) {
    R(x, 16 * TILE + 6, 3, 4, LAMP);
    light(x, 16 * TILE + 6, 3, 4, "soft");
  }
}

const LAMPS = [32, 38, 44].map((c) => c * TILE + 6);

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
    near: (v) => drawGulls(v.t, 8 * TILE),
    back(v: View) {
      passage();
      for (const x of LAMPS) lampPost(x, SQUARE, 36);
      tbaneDoor(v.doors.get("tbane"));
    },
    front(v: View) {
      windows(55, 64, 20, 33, 3);
      windows(67, 84, 20, 33, 3);
      windows(87, 96, 14, 33, 3);
      clock(v);
      towerTop(v);
      for (const x of LAMPS) lampPool(x, SQUARE);
    },
    ground: () => ({ top: GROUND.paving, dot: GROUND.pavingDot, fill: MASONRY.gatePost }),
    ledges: { "=": BRICK_LEDGE },
    carrier: (i, at) => (i === 0 ? ferry(at) : gondola(at)),
    timed: (i, v) => bell(i, v)
  }
};
