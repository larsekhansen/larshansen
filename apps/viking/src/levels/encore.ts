import { box, layerWorldX } from "@larshansen/pixelkit/backdrop";
import { TILE } from "@larshansen/pixelkit/config";
import { R, ctx, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, LAND, METAL, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import { DECK, tile as textured, type Grain } from "../alive/ground";
import { mirrorBall } from "../alive/invasion";
import { STEEL, lamp, pool, prop, dot, box as pbox, tone, type Stuff } from "../alive/props";
import { ENCORE as WORDS } from "../game/story";
import { LOKI_STEPS, lokiBoss, type Loki, type LokiDef } from "../game/loki";
import { encoreMusic } from "../game/tune";
import { drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import { drawLoki, drawRing, drawWave } from "../render/loki";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// The encore (order 29, ADR 0052): a small festival stage on the water in Middelalderparken, past the last station of line 2,
// where Loki, the Neon Invaders' front man, plays one more song. It is extra: it opens only once every rune of both lines is
// held, gives no rune, opens nothing and counts in no total; it keeps a best time (`best.encore`) and nothing else.
//
// Why here: Middelalderparken, the medieval park in Gamlebyen, held Oslo's big summer festival for years before it moved to
// Tøyen, so a stage there is true of the place; and the park's water mirror lies where the shore was in the Middle Ages, so
// the stage stands on the water, on a pontoon, at the end of the old shore.
//
// One screen and a half of stage: from the T-bane up the park's path past a flag and a bench (the bench before the fight, ADR
// 0017, 0033), over a gangway onto the stage. A flat floor, no pits; three speaker stacks to stand on, the two PA stacks at
// the wings and the backline in the middle, yellow on their tops (ADR 0044). Loki waits at his mark at the back; the show
// starts as he comes onto the stage (`game/loki.ts`). Built from the textured set, the props kit and scenery.
//
//   #  the park's path   G  the gangway's planks   D  the stage's deck   =  a speaker stack's top   ~  the water mirror
//   t  T-banen   S  start   f  flag   b  bench

const COLS = 48;
const ROWS = 16;
/** The floor's row (the park's path, the gangway, the stage), and the speaker stacks' tops. */
export const FLOOR = 12;
const TOPS = 10;
/** The stage, by column: from the gangway's end to the right wing. */
export const STAGE = { c0: 14, c1: 46 };
/** The speaker stacks (their left column): the left PA, the backline in the middle, the right PA; two tiles wide each. */
export const STACKS = [17, 29, 41];

const b = mapBuilder(COLS, ROWS);
b.ground(0, 10, FLOOR);
b.run(11, 13, FLOOR, "G");
b.run(STAGE.c0, COLS - 1, FLOOR, "D");
b.fill(11, COLS - 1, FLOOR + 1, ROWS - 1, "~");
for (const c of STACKS) b.run(c, c + 1, TOPS, "=");
b.put(2, FLOOR - 1, "t").put(4, FLOOR - 1, "S").put(7, FLOOR - 1, "f").put(9, FLOOR - 1, "b");

/** Loki's stage: its floor, its ends, where he waits (in front of the backline), how far on the show starts. */
export const LOKI_DEF: LokiDef = { floor: FLOOR * TILE, x0: STAGE.c0 * TILE, x1: STAGE.c1 * TILE, home: 30 * TILE, wakeAt: 16 * TILE };

// --- The materials -------------------------------------------------------------------------------------------------------

/** The stage's deck: black-stained plywood sheets, their joints, the gaffer's marks lighter. */
const STAGE_DECK: Grain = { name: "stage deck", kind: "planks", ramp: ["#141216", "#1e1b20", "#29252b", "#36313a"], h: 8 };
/** The gangway's planks: the park's own wood. */
const GANGWAY = DECK;
/** A speaker's black cabinet, its grille, the steel of its corners. */
const CAB: Stuff = { name: "speaker cabinet", ramp: ["#0e0d10", "#19171c", "#24212a", "#34303a"] };
const GRILLE = "#2c2a30";
/** The stage's truss: galvanised steel, as the harbour's. */
const TRUSS = STEEL;

// --- Is the show on? --------------------------------------------------------------------------------------------------

/** The state the art reads: Loki (null before the first frame), and the step. */
const show = { loki: null as Loki | null, t: 0 };
/** The glamour is on the stage: the neon, the sweeping lights, the turning ball. Off once he stands there plain. */
const glammed = () => plainness() < 0.5;
/** How far the stage has gone plain (0 to 1): over the second after he stands there plain. */
function plainness(): number {
  const s = show.loki;
  if (!s || s.hits < 3 || s.phase === "reel") return 0;
  if (s.phase === "plain") return Math.min(1, (show.t - s.since) / 60);
  return 1;
}
/** Loki has not woken yet: one cold light on him at his mark. */
const waiting = () => !show.loki || show.loki.phase === "asleep";

// --- The far layers: Ekeberg's ridge, Bjørvika's towers, the park's trees ------------------------------------------------

const ground = FLOOR * TILE;
function far(v: View) {
  drawOsloHills(v.sky, ground - 6);
}

/** Bjørvika's tall slim towers to the west, seen over the park, a window lit here and there. */
function mid() {
  for (let k = 0; k < 9; k++) {
    const wx = 120 + k * 46;
    const x = Math.round(wx - view.camX * 0.2);
    const w = 18 + ((k * 7) % 10);
    const h = 58 + ((k * 37) % 46);
    const top = ground - 24 - h;
    const c = mix(LAND.farHills, k % 2 ? "#7a8494" : "#8e96a2", 0.55);
    box(x, top, w, h + 24, c);
    box(x, top, 2, h + 24, mix(c, WHITE, 0.12));
    for (let y = top + 6; y < ground - 28; y += 7) if ((k + y) % 3 === 0) box(x + 4 + ((y >> 3) % 3) * 4, y, 2, 2, mix(c, INK, 0.25));
  }
  void layerWorldX;
}

/** The park's trees behind the stage, round crowns of lime and maple, and the ruin's low wall of grey stone. */
function near() {
  for (let k = 0; k < 7; k++) {
    const x = Math.round(30 + k * 110 - view.camX * 0.4);
    const r = 16 + ((k * 5) % 7);
    const cy = ground - 26 - r;
    for (let dy = -r; dy <= r; dy += 2) {
      const half = Math.round(Math.sqrt(r * r - dy * dy));
      box(x - half, cy + dy, half * 2, 2, dy < -r / 3 ? mix(PALETTE.grassDark, PALETTE.grass, 0.45) : PALETTE.grassDark);
    }
    box(x - 1, cy + r - 2, 3, 30, PALETTE.woodDark);
  }
  const wall = Math.round(-view.camX * 0.4);
  for (let x = wall; x < view.w; x += 6) box(x, ground - 14, 5, 12, x % 12 ? "#8e8a84" : "#7c7872");
}

// --- The stage -----------------------------------------------------------------------------------------------------------

const X0 = STAGE.c0 * TILE;
const X1 = STAGE.c1 * TILE;
/** The roof's truss, high over the deck; and the backdrop's top. */
const ROOF = ground - 7 * TILE;
const CURTAIN = "#16131a";

/** A tower of truss: two chords and the zigzag between them, lit on the left. */
function tower(x: number, top: number, bottom: number) {
  prop("truss tower", [TRUSS], `${bottom - top}`, 8, bottom - top, x, top, (g) => {
    for (let y = 0; y < bottom - top; y++) {
      dot(g, 0, y, tone(TRUSS, 3));
      dot(g, 7, y, tone(TRUSS, 1));
      const z = y % 8;
      dot(g, z < 4 ? 1 + z : 8 - z, y, tone(TRUSS, 2));
    }
  });
}
/** The truss across the top: two chords, the zigzag. */
function roofTruss(x0: number, x1: number, y: number) {
  prop("roof truss", [TRUSS], `${x1 - x0}`, x1 - x0, 7, x0, y, (g) => {
    for (let x = 0; x < x1 - x0; x++) {
      dot(g, x, 0, tone(TRUSS, 3));
      dot(g, x, 6, tone(TRUSS, 1));
      const z = x % 8;
      dot(g, x, z < 4 ? 1 + z : 8 - z, tone(TRUSS, 2));
    }
  });
}
/** The roof: black canvas over the truss, its edge lit. */
function roof() {
  R(X0 - 8, ROOF - 10, X1 - X0 + 16, 10, CURTAIN);
  R(X0 - 8, ROOF - 10, X1 - X0 + 16, 1, mix(CURTAIN, WHITE, 0.15));
}

/** A speaker stack: two cabinets, their grilles, a horn, the steel corners; its top is the "=" letter's (the paint's). */
function stack(c: number) {
  const x = c * TILE;
  const top = TOPS * TILE + 4;
  const h = ground - top;
  prop("speaker stack", [CAB], `${h}`, 2 * TILE, h, x, top, (g) => {
    pbox(g, 0, 0, 2 * TILE, h, tone(CAB, 1));
    for (const y0 of [0, Math.floor(h / 2)]) {
      pbox(g, 0, y0, 2 * TILE, 1, tone(CAB, 0));
      pbox(g, 0, y0 + 1, 1, Math.floor(h / 2) - 1, tone(CAB, 3));
      // The grille: a mesh of dots over the cone.
      for (let yy = y0 + 3; yy < y0 + Math.floor(h / 2) - 2; yy++) for (let xx = 3; xx < 2 * TILE - 3; xx++) if ((xx + yy) % 2 === 0) dot(g, xx, yy, GRILLE);
      // Its steel corners.
      for (const [cx, cy] of [[0, y0], [2 * TILE - 2, y0]]) pbox(g, cx, cy, 2, 2, mix(METAL.rail, INK, 0.2));
    }
    // A horn in the top cabinet.
    pbox(g, 10, 4, 12, 3, tone(CAB, 0));
    pbox(g, 11, 5, 10, 1, tone(CAB, 2));
  });
}
/** The top of a speaker stack, for the "=" letter: the cabinet's lid, the paint goes on it. */
function stackTop(x: number, y: number) {
  R(x, y, TILE, 4, tone(CAB, 2));
  R(x, y + 4, TILE, 1, tone(CAB, 0));
}

/** A light on the roof truss: its black can, its lens in its colour; and its beam down onto the deck, sweeping slowly. */
const LENSES = [ENEMY.hotPink, ENEMY.white, ENEMY.magenta, ENEMY.magenta, ENEMY.white, ENEMY.hotPink];
const CANS = [18, 22, 26, 34, 38, 42];
function lights(v: View) {
  const p = plainness();
  const g = ctx();
  CANS.forEach((c, k) => {
    const x = c * TILE + 4;
    const y = ROOF + 7;
    R(x - 2, y, 5, 5, "#0e0d10");
    const colour = mix(LENSES[k], "#fff4dc", p);
    R(x - 1, y + 4, 3, 2, colour);
    // The beam: a slow sweep (none with reduced motion, nor once the stage is plain or before the show), down to the deck.
    if (waiting()) return;
    // After dark the lens is lit, its own colour over the dark (order 32, ADR 0054).
    light(x - 1, y + 4, 3, 2, "window", colour);
    const swing = p > 0 || view.reduced ? 0 : Math.sin(v.t * 0.012 + k * 1.3) * 34;
    // Light adds to what it falls on: the beam brightens the curtain and the deck under it. (Its light after dark is the lens's: the
    // beam as lights, a rectangle a slice, cost over a hundred rectangles a frame for a haze.)
    g.globalAlpha = 0.16 + 0.04 * p;
    g.globalCompositeOperation = "lighter";
    for (let s = 0; s < 10; s++) {
      const yy = y + 6 + s * ((ground - y - 6) / 10);
      const w = 4 + s * 2.6;
      const cx = x + 0.5 + (swing * s) / 10;
      const [bx, by, bw] = [Math.round(cx - w / 2), Math.round(yy), Math.round(w)];
      R(bx, by, bw, Math.ceil((ground - y - 6) / 10), colour);
    }
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
  });
  // A cold spot on him at his mark while he waits.
  if (waiting() && show.loki) {
    g.globalAlpha = 0.12;
    R(Math.round(show.loki.x) - 12, ROOF + 7, 24, ground - ROOF - 7, "#dfe8ff");
    g.globalAlpha = 1;
    beamLight(Math.round(show.loki.x) - 12, ROOF + 7, 24, ground - ROOF - 7, "rgba(223, 232, 255, 0.12)");
  }
}

/** A slice of a beam as a light, but where a speaker stack stands in front of it. */
function beamLight(x: number, y: number, w: number, h: number, colour: string) {
  const top = TOPS * TILE + 4;
  if (y + h <= top) return void light(x, y, w, h, "soft", colour);
  // Below the stacks' tops: the slice in the gaps between them.
  if (y < top) light(x, y, w, top - y, "soft", colour);
  let from = x;
  for (const c of STACKS) {
    const [s0, s1] = [c * TILE, c * TILE + 2 * TILE];
    if (s1 <= from || s0 >= x + w) continue;
    if (s0 > from) light(from, Math.max(y, top), s0 - from, y + h - Math.max(y, top), "soft", colour);
    from = Math.max(from, s1);
  }
  if (x + w > from) light(from, Math.max(y, top), x + w - from, y + h - Math.max(y, top), "soft", colour);
}

/** The neon round the stage's mouth (the glamour's: off once he is plain, dark glass then). */
function neon(v: View) {
  const on = glammed();
  const a = on ? ENEMY.hotPink : "#3a3440";
  const b2 = on ? ENEMY.lime : "#34383a";
  // A tube, and while the glamour is on, its light: after dark the neon is its own colour over the dark (order 32, ADR 0054),
  // as the encore's stop on the map is (order 30). Neon is the glamour's, and this stage is the glamour's.
  const tube = (x: number, y: number, w: number, h: number, c: string) => {
    R(x, y, w, h, c);
    if (on) light(x, y, w, h, "window", c);
  };
  // The tubes along the stage's mouth; their light only where nothing hangs in front of them (the lights' cans, the ball's wire).
  const front = [...CANS.map((c) => [c * TILE + 2, c * TILE + 7] as const), [BALL_X, BALL_X + 1] as const].sort((p, q) => p[0] - q[0]);
  for (const [y, c] of [[ROOF + 10, a], [ROOF + 12, b2]] as const) {
    R(X0 + 2, y, X1 - X0 - 4, 1, c);
    if (!on) continue;
    let x = X0 + 2;
    for (const [h0, h1] of front) {
      if (h0 > x) light(x, y, h0 - x, 1, "window", c);
      x = Math.max(x, h1);
    }
    if (X1 - 2 > x) light(x, y, X1 - 2 - x, 1, "window", c);
  }
  // Two lightning bolts on the backdrop, in tubes, either side of the ball: a zigzag of three strokes each.
  for (const bx of [24 * TILE, 36 * TILE]) {
    const by = ROOF + 26;
    for (let k = 0; k < 8; k++) tube(bx + k, by + k, 2, 1, a);
    for (let k = 0; k < 6; k++) tube(bx + 8 - k, by + 8, 1, 1, a);
    for (let k = 0; k < 9; k++) tube(bx + 3 + k, by + 8 + k, 2, 1, a);
  }
  void v;
}

/** The mirror ball over the middle of the stage, turning until the stage is plain, then still. */
/** Where the mirror ball hangs: its wire comes down through the neon along the stage's mouth. */
const BALL_X = 30 * TILE;
function ball(v: View) {
  const x = BALL_X;
  R(x, ROOF + 7, 1, 10, METAL.castIron);
  mirrorBall(x, ROOF + 21, glammed() && !waiting() ? v.t : 0);
}

/** The back of the stage: the backdrop curtain in folds, the roof, the towers, the truss, the lights, the ball. */
function stageBack(v: View) {
  // The backdrop: dark curtain in folds from the truss to the deck.
  for (let x = X0; x < X1; x += 4) R(x, ROOF + 7, 4, ground - ROOF - 7, (x >> 2) % 2 ? CURTAIN : mix(CURTAIN, WHITE, 0.05));
  neon(v);
  roof();
  roofTruss(X0 - 8, X1 + 8, ROOF);
  for (const x of [X0 - 8, X1]) tower(x, ROOF, ground);
  lights(v);
  ball(v);
  for (const c of STACKS) stack(c);
}

/** In front: the stage's front edge (its skirt over the pontoon) and the right wing's curtain, which he goes out behind. */
function stageFront() {
  R(X1 + 8, ROOF + 7, 2 * TILE - 8, ground - ROOF - 7, CURTAIN);
  for (let y = ROOF + 7; y < ground; y += 6) R(X1 + 9, y, 1, 4, mix(CURTAIN, WHITE, 0.08));
}

// --- The park --------------------------------------------------------------------------------------------------------------

function park() {
  // The old town's cast-iron lamp by the path (ADR 0051: of its place).
  lamp("old", 6 * TILE + 2, ground, 26);
  // The gangway's rope rails, on posts.
  for (const x of [11 * TILE + 2, 12 * TILE + 8, 13 * TILE + 14]) R(x, ground - 9, 2, 9, PALETTE.woodDark);
  R(11 * TILE + 2, ground - 8, 3 * TILE + 14, 1, mix(PALETTE.wood, WHITE, 0.15));
}

// --- The tiles -------------------------------------------------------------------------------------------------------------

function tileArt(t: string, c: number, r: number, x: number, y: number, map: TileMap): boolean {
  if (t === "D") textured(STAGE_DECK, c, r, x, y, map, null);
  else if (t === "G") textured(GANGWAY, c, r, x, y, map, null);
  else if (t === "=") stackTop(x, y);
  else return false;
  return true;
}

export const ENCORE: LevelDef = {
  id: "encore",
  rune: -1,
  name: "Middelalderparken",
  landmark: { nb: "Ekstranummer", en: "The encore" },
  place: { nb: "Gamlebyen", en: "Gamlebyen" },
  sky: "evening",
  map: b.rows_(),
  legend: { solid: "#GD", oneWay: "=", water: "~" },
  ramps: [],
  carriers: [],
  timed: [],
  cannons: [],
  signs: [],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  boss: lokiBoss(LOKI_DEF),
  bossWords: {
    wake: { nb: WORDS.nb.wake, en: WORDS.en.wake },
    piece1: { nb: WORDS.nb.piece1, en: WORDS.en.piece1 },
    piece2: { nb: WORDS.nb.piece2, en: WORDS.en.piece2 },
    piece3: { nb: WORDS.nb.piece3, en: WORDS.en.piece3 },
    beaten: { nb: WORDS.nb.leaving, en: WORDS.en.leaving },
    miss: { nb: WORDS.nb.miss, en: WORDS.en.miss },
    missClub: { nb: WORDS.nb.missClub, en: WORDS.en.missClub },
    missCharge: { nb: WORDS.nb.missCharge, en: WORDS.en.missCharge },
    missBite: { nb: WORDS.nb.missBite, en: WORDS.en.missBite },
    // Shouted while he struts, in time with the music (order 34): the page shows the one `music` says is up.
    shout1: { nb: WORDS.nb.shout1, en: WORDS.en.shout1 },
    shout2: { nb: WORDS.nb.shout2, en: WORDS.en.shout2 },
    shout3: { nb: WORDS.nb.shout3, en: WORDS.en.shout3 },
    shout4: { nb: WORDS.nb.shout4, en: WORDS.en.shout4 }
  },
  // His tune (order 34, ADR 0055): `game/tune.ts`.
  music: encoreMusic(),
  // The ending card's line (order 29): no runes to count here.
  cardLine: { nb: () => WORDS.nb.ending, en: () => WORDS.en.ending },
  art: {
    far: (v) => far(v),
    mid: () => mid(),
    near: () => near(),
    back(v) {
      show.loki = v.boss as Loki | null;
      show.t = v.t;
      tbaneDoor(v.doors.get("tbane"));
      park();
      stageBack(v);
    },
    front() {
      // After dark the park's lamp lights the path under it (order 32, ADR 0054).
      pool(6 * TILE + 3, ground);
      stageFront();
    },
    ground: () => ({ top: mix(PALETTE.grass, "#b8a888", 0.6), dot: PALETTE.grassDark, fill: PALETTE.earth, kind: "gravel" }),
    tile: tileArt,
    ledges: { "=": { body: "#19171c", top: "#34303a", edge: "#0e0d10", joint: "#0e0d10" } },
    boss(state, v) {
      const s = state as Loki;
      drawRing(s, v.t);
      drawLoki(s, v.t);
      drawWave(s, v.t);
    }
  }
};

/** For the tests: how long the stage takes to go plain after his third hit, and the lenses' colours. */
export const ENCORE_LOOK = { lenses: LENSES, plainAfter: LOKI_STEPS.reel };
