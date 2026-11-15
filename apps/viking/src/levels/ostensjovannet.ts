import { column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { stamp } from "@larshansen/pixelkit/kept";
import { R, ctx, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, LAND, PALETTE, STONE, WHITE } from "@larshansen/pixelkit/palette";
import type { Body, Carrier } from "@larshansen/pixelkit/physics";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import { SINK, padState, padY, padsEverywhere, padsGround, stepPads, type PadState, type SinkPad } from "@larshansen/pixelkit/sink";
import * as L from "@larshansen/pixelkit/swatches/lake";
import { windingUp, type Enemy, type EnemyDef, type Shot } from "../game/enemies";
import type { Play } from "../game/play";
import { tbaneDoor } from "../render/furniture";
import { parts } from "../render/pickups";
import { plain } from "../render/sprite";
import { shiver } from "../render/stand";
import { mapBuilder } from "./build";
import type { Grounds, LevelDef, LevelRules, View } from "./types";

// Level 14, rune I: Østensjøvannet, in the early morning, quiet. Its one idea: lily pads that sink
// under him, and swans that mind their water. A swan glides along its stretch of the lake and lets him
// be, but once he has been in its stretch four seconds it comes for him: for the last second before
// that it lowers its neck and hisses (drawn still, with reduced motion). Leaving its stretch calms it,
// and so does catching him. A lily pad holds him a second and two thirds before it goes under.
// So the level asks him to keep moving over pads that will not hold him long, without rushing blind.
//
//   #  the paths and the island   P  the boardwalk over the shallows   K  a stone in the water
//   =  the bird hides' decks and roofs   ~  the lake   t  T-banen   b  bench   $  skilling   &  brown cheese
//
// Sections: the path from the metro and the first bird hide (the sign about the lake); reeds and the
// boardwalk, ducks on it; the first pads over shallow water, firm stones between them; the first swan's
// stretch, its pads wide apart; the mist, and the heron that stands as a tall step up to the second
// hide's deck and flies off a second after he lands on it; the island, with coots and a row of nesting
// gulls that dive at him (the shield), and the bench; the long crossing, two swans whose stretches overlap,
// and more pads past them to the stone; the far shore, and the rune at the far hide with the sun coming up.

const COLS = 263;
const ROWS = 24;
/** The water line and the ground: the top of row 19. */
export const W = 19;
const FLOOR = W * TILE;
const b = mapBuilder(COLS, ROWS);
const water = (c0: number, c1: number) => b.fill(c0, c1, W, W + 1, "~").ground(c0, c1, W + 2);

// --- The path from the metro, the first hide ---------------------------------------------------------
b.ground(0, 17, W);
b.run(10, 13, W - 2, "=").run(9, 14, W - 4, "=");
// --- The boardwalk over the shallows ---------------------------------------------------------------------
water(18, 41);
b.run(18, 41, W, "P");
// --- The first pads, stones between them --------------------------------------------------------------
water(42, 55);
for (const c of [42, 46, 50, 54]) b.fill(c, c, W, W + 1, "K");
b.ground(56, 62, W);
// --- The first swan's stretch ----------------------------------------------------------------------------
water(63, 80);
b.ground(81, 85, W);
// --- The mist, the heron, the second hide's deck ------------------------------------------------------
water(86, 100);
b.run(91, 101, W - 4, "=");
// --- The island -------------------------------------------------------------------------------------------
b.ground(101, 140, W);
// --- The long crossing: two swans whose waters overlap, more pads past them, a stone near the end -------------
water(141, 196);
b.fill(186, 188, W, W + 1, "K");
// --- The far shore and the far hide ------------------------------------------------------------------
b.ground(197, COLS - 1, W);
b.run(241, 243, W - 2, "=").run(245, 254, W - 4, "=");

// Marks: the start, the door, signs, flags, the bench, the rune, the bracteate, the cheese.
b.put(2, W - 1, "t").put(4, W - 1, "S");
b.put(7, W - 1, "i").put(60, W - 1, "i").put(84, W - 1, "i");
for (const c of [29, 57, 83, 103, 138, 205, 235]) b.put(c, W - 1, "f");
b.put(188, W - 1, "f");
b.put(137, W - 1, "b");
b.put(251, W - 5, "r").put(187, W - 6, "o").put(11, W - 5, "&");

// Skilling: over the path and the hide, along the boardwalk, over the pads and stones, up to the deck,
// round the island, across the long crossing, along the far shore and up the far hide.
const COINS: [number, number][] = [
  [6, 18], [11, 16], [12, 16], [13, 16],
  [20, 18], [23, 18], [26, 18], [32, 18], [36, 18], [40, 17],
  [44, 17], [48, 17], [52, 17],
  [65, 17], [68, 16], [72, 17], [75, 16], [79, 17],
  [87, 17], [90, 15], [94, 14], [97, 14], [100, 14],
  [106, 18], [114, 18], [120, 18], [126, 18], [132, 18],
  [144, 17], [148, 16], [151, 17], [158, 16], [162, 17], [165, 16], [172, 17], [176, 16], [180, 17], [183, 16],
  [191, 17], [194, 16],
  [203, 18], [208, 18], [216, 18], [224, 18], [233, 18],
  [242, 16], [247, 14], [249, 14], [253, 14]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The pads, the heron, the swans -------------------------------------------------------------------

/**
 * How long a lily pad holds him before it starts to go under: a second and two thirds, longer than a
 * bundle of balsa (two thirds of a second), so a man who stops to look on one has time to see it go.
 */
export const LILY_FIRM = 100;
/** A lily pad: its left end and its width (two tiles, or two and a half on a swan's water), its top on the water. */
const pad = (x: number, w = 40): SinkPad => ({ x, y: FLOOR, w, firm: LILY_FIRM });
/** Pads in a row from x, each `w` wide, every `step` pixels. */
const row = (x: number, n: number, w = 40, step = 60) => Array.from({ length: n }, (_, i) => pad(x + i * step, w));
/**
 * The first three pads, between the stones; the first swan's, from the shore's edge; the one in the mist
 * at the shore's edge, before the heron; the long crossing's, smaller, from the island's edge to the
 * stone, and on to the far shore.
 */
export const PADS: SinkPad[] = [
  ...[44, 48, 52].map((c) => pad(c * TILE - 8, 32)),
  ...row(63 * TILE, 5, 32, 56),
  pad(86 * TILE),
  ...row(141 * TILE, 14, 24, 52),
  ...row(190 * TILE, 2, 24, 56)
];

/**
 * The heron: it stands in the shallows, a tall step from the pad before it up to the second hide's deck,
 * and flies off a second after he lands on it; it is back three seconds later.
 */
export const HERON = { x: 89 * TILE + 8, y: FLOOR - 28, w: 12, stay: 60, away: 180 };

interface Lake {
  pads: PadState[];
  /** The step he landed on the heron, or null; the step it flew off, or null. */
  landed: number | null;
  gone: number | null;
}

const onHeron = (s: Lake, him: Body) => s.gone === null && him.onGround && Math.abs(him.y + PLAYER.h - HERON.y) < 0.01 && him.x + PLAYER.w > HERON.x && him.x < HERON.x + HERON.w;

export const GROUNDS: Grounds<Lake> = {
  create: () => ({ pads: PADS.map(padState), landed: null, gone: null }),
  carriers: (s, t) => [...padsGround(PADS, s.pads, t), ...(s.gone === null ? [{ x: HERON.x, y: HERON.y, w: HERON.w, dx: 0, dy: 0 }] : [])],
  after(s, t, him) {
    stepPads(PADS, s.pads, t, him);
    if (s.gone !== null) {
      if (t - s.gone >= HERON.away) s.gone = null;
      return;
    }
    if (s.landed === null && onHeron(s, him)) s.landed = t;
    if (s.landed !== null && t - s.landed >= HERON.stay) {
      s.gone = t;
      s.landed = null;
    }
  },
  everywhere: (): Carrier[] => [...padsEverywhere(PADS), { x: HERON.x, y: HERON.y, w: HERON.w, dx: 0, dy: 0 }],
  // The lily pads give way; so does the heron, which flies off.
  // About to go (order 19): a pad he has stood on long enough that it will soon sink, the heron about to fly off.
  stands: (s, t) => [...PADS.map((p, i) => ({ x: p.x, y: padY(p, s.pads[i], t), w: p.w, how: "gives" as const, soon: padSoon(p, s.pads[i]) })), ...(s.gone === null ? [{ x: HERON.x, y: HERON.y, w: HERON.w, how: "gives" as const, soon: heronSoon(s, t) }] : [])]
};

/** Half a second before a pad starts to sink under him, it trembles (order 19). */
const padSoon = (p: SinkPad, s: PadState) => s.sinkAt === null && s.on > 0 && s.on >= (p.firm ?? SINK.firm) - 30;
/** Half a second before the heron flies off, it shifts its feet. */
const heronSoon = (s: Lake, t: number) => s.landed !== null && t - s.landed >= HERON.stay - 30;

/** The swans' clock: four seconds in a swan's stretch and it comes; for the last second it tells him so. */
export const SWAN = { tell: 180, come: 240, glide: 0.3, near: 1, speed: 1.3 };

/** The water line a swan swims on: the floor of its tile. */
const waterOf = (e: Enemy) => (e.def.r + 1) * TILE;

/** He is in this swan's stretch of water: over it, on it or jumping over it (not up on a hide). */
export const inStretch = (e: Enemy, him: Body) => {
  const x = him.x + PLAYER.w / 2;
  const range = (e.def.range ?? 0) * TILE;
  return x > e.home - range && x < e.home + range && him.y + PLAYER.h > waterOf(e) - 4 * TILE;
};

/**
 * One step of a swan. Calm, it glides along its stretch, harmless; after three seconds of him there it
 * turns to him, lowers its neck and hisses, drawing nearer; after four it comes at him along the water
 * (its touch hurts, and it cannot be landed on), as far as its stretch goes. Out of its stretch, he is
 * forgotten and it calms.
 */
function swan(e: Enemy, p: Play) {
  const range = (e.def.range ?? 0) * TILE;
  const lo = e.home - range + e.w / 2;
  const hi = e.home + range - e.w / 2;
  e.n = inStretch(e, p.body) ? (e.n ?? 0) + 1 : 0;
  e.y = waterOf(e) + 2;
  if (e.n >= SWAN.come) {
    e.calm = false;
    const hx = p.body.x + PLAYER.w / 2;
    e.dir = hx < e.x ? -1 : 1;
    if (Math.abs(hx - e.x) > SWAN.speed) e.x = Math.max(lo, Math.min(hi, e.x + e.dir * SWAN.speed));
    return;
  }
  e.calm = true;
  // Telling him: its neck down, facing him, drawing nearer.
  if (e.n >= SWAN.tell) {
    const hx = p.body.x + PLAYER.w / 2;
    e.dir = hx < e.x ? -1 : 1;
    if (Math.abs(hx - e.x) > SWAN.near) e.x = Math.max(lo, Math.min(hi, e.x + e.dir * SWAN.near));
    return;
  }
  e.x += e.dir * SWAN.glide;
  if (e.x < lo || e.x > hi) {
    e.x = Math.max(lo, Math.min(hi, e.x));
    e.dir = (e.dir * -1) as 1 | -1;
  }
}

/** The swan is telling him it is about to come: neck down, hissing. */
export const telling = (e: Enemy) => (e.n ?? 0) >= SWAN.tell && (e.n ?? 0) < SWAN.come;

export const RULES: LevelRules = {
  enemy(e, p) {
    if (e.def.look !== "swan") return false;
    swan(e, p);
    return true;
  },
  // A swan that has caught him has made its point: while he blinks it lets him be, and starts counting again.
  after(p) {
    if (p.t >= p.safeUntil) return;
    for (const e of p.enemies) if (e.def.look === "swan" && (e.n ?? 0) >= SWAN.come) e.n = 0;
  }
};

/**
 * Ducks on the boardwalk; the first swan; a coot on the island and gulls on their nests along its shore,
 * that dive at him straight (the shield); the two swans of the long crossing; a coot and a duck on the far shore.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "duck", c: 22, r: W - 1, range: 2, speed: 0.3 },
  { kind: "walker", look: "duck", c: 229, r: W - 1, range: 2, speed: 0.3 },
  { kind: "spiky", look: "swan", c: 70.5, r: W - 1, range: 8, w: 16, h: 12 },
  { kind: "walker", look: "coot", c: 110, r: W - 1, range: 2, speed: 0.4, small: true },
  // The gulls' beats chosen (by a search) so that a man who walks on along the shore is dived at nearly every time.
  { kind: "thrower", look: "nester", c: 117, r: W - 3, period: 110, straight: true, lead: true, faces: -1 },
  { kind: "thrower", look: "nester", c: 123, r: W - 3, period: 110, offset: 10, straight: true, lead: true, faces: -1 },
  { kind: "thrower", look: "nester", c: 129, r: W - 3, period: 110, offset: 40, straight: true, lead: true, faces: -1 },
  // The long crossing's two swans: their waters overlap by four tiles and a half, where both mind him.
  { kind: "spiky", look: "swan", c: 149.5, r: W - 1, range: 8.25, w: 16, h: 12 },
  { kind: "spiky", look: "swan", c: 161.5, r: W - 1, range: 8.25, w: 16, h: 12, dir: -1 },
  { kind: "walker", look: "coot", c: 213, r: W - 1, range: 2, speed: 0.4 },
  { kind: "walker", look: "duck", c: 222, r: W - 1, range: 2, speed: 0.3 }
];

export const OSTENSJO_RULES = { COLS, ROWS };

// --- Art ----------------------------------------------------------------------------------------------
const P = PALETTE;

/** How far the sun is up, by how near he is to the far hide (and more once the rune is taken). */
const sunUp = (v: View) => Math.max(0, Math.min(1, (v.him.x - 203 * TILE) / (44 * TILE))) + (v.flourish !== null ? Math.min(0.5, v.flourish / 120) : 0);

/** The low sun's own colours, after the twilight's tint: its glow over the hills, gold high up to red low down, and its disc. */
const GLOW = ["255, 214, 150", "255, 204, 140", "255, 192, 128", "255, 180, 118", "255, 166, 108", "255, 152, 100", "255, 138, 94", "255, 126, 90"];
const DISC = ["#fff0c0", "#ffe2a0", "#ffd28a", "#ffbe72", "#ffa860", "#ff9452"];

/** The far shore's low hills and the town's lights going out; at the far end, the sun coming up behind them. */
function farShore(v: View) {
  const base = FLOOR - 22;
  const k = sunUp(v);
  const hillTop = (x: number) => {
    const wx = layerWorldX(x, 0.12);
    return base - (14 + Math.round(5 * Math.sin(wx * 0.021) + 3 * Math.sin(wx * 0.07)));
  };
  if (k > 0) {
    // The sun's disc rising over the far hills, a warm band along the sky above them.
    // Off to the right of the far hide as he stands at the rune, so the hide does not hide it.
    const sx = layerX(297 * TILE, 0.12);
    const sy = base - 8 - Math.round(k * 34);
    const r = 11;
    for (let x = -r; x <= r; x++) {
      const h = Math.round(Math.sqrt(r * r - x * x));
      column(sx + x, sy - h, sy + h, x * x + 4 < r * r ? L.sun : mix(L.sun, WHITE, 0.4));
    }
    for (let x = 0; x < view.w; x++) column(x, base - 40, base - 30, `rgba(${L.sunGlow}, ${(0.18 * k * Math.max(0, 1 - Math.abs(x - sx) / 260)).toFixed(3)})`);
    // The twilight's tint goes over the layer, and would leave the sun a grey disc: its own light comes
    // on after it, as a window's does. A glow over the hills, red low down and gold higher, and the
    // disc, gold, redder at its foot; none of it over the hills that stand in front of it.
    for (let x = 0; x < view.w; x++) {
      const near = k * Math.max(0, 1 - Math.abs(x - sx) / 240);
      if (near <= 0.01) continue;
      const top = hillTop(x);
      // Eight bands, warmer and stronger down to the hills.
      for (let i = 0; i < 8; i++) {
        const y0 = base - 80 + i * 10;
        const bottom = Math.min(y0 + 10, top);
        if (bottom > y0) light(x + view.camX, y0, 1, bottom - y0, "soft", `rgba(${GLOW[i]}, ${(0.05 * (i + 1) * near).toFixed(3)})`);
      }
    }
    // The disc: pale gold at the top, orange at its foot, none of it over the hills.
    for (let x = -r; x <= r; x++) {
      const h = Math.round(Math.sqrt(r * r - x * x));
      const foot = Math.min(sy + h, hillTop(sx + x));
      for (let y = sy - h; y < foot; y += 3) light(sx + x + view.camX, y, 1, Math.min(3, foot - y), "soft", DISC[Math.min(DISC.length - 1, Math.floor(((y - sy + r) / (2 * r + 1)) * DISC.length))]);
    }
  }
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const top = hillTop(x);
    column(x, top, base, mix(LAND.farHills, STONE.dark, 0.3));
    if (Math.floor(wx) % 17 === 0) column(x, top + 3, top + 4, L.sun);
  }
}

/** Birches and willows along the far bank, low, in rows. */
function bankTrees(factor: number, foot: number, n: number, fade: number) {
  for (let i = 0; i < n; i++) {
    const wx = i * 36 + ((i * 23) % 17);
    const x = layerX(wx, factor);
    if (x < -24 || x > view.w + 24) continue;
    const h = 14 + ((i * 11) % 12);
    const r = 7 + ((i * 5) % 4);
    for (let yy = -r; yy <= r; yy++) {
      const half = Math.floor(r * Math.sqrt(1 - (yy * yy) / (r * r)));
      R(x + view.camX - half, foot - h - r + yy, half * 2 + 1, 1, mix(yy < 0 ? L.padLight : L.padDark, LAND.farHills, fade));
    }
    R(x + view.camX, foot - h, 1, h, mix(P.wool, LAND.farHills, fade));
  }
}

/** Reeds along the water's edge, swaying a little; heads of brown. */
function reeds(c0: number, c1: number, t: number) {
  for (let x = c0 * TILE; x < c1 * TILE; x += 3) {
    const h = 10 + ((x * 7) % 9);
    const sway = view.reduced ? 0 : Math.round(Math.sin(t * 0.03 + x * 0.2));
    for (let k = 0; k < h; k++) R(x + (k > h - 4 ? sway : 0), FLOOR - k, 1, 1, k > h - 3 ? L.reedHead : (x * 3) % 5 ? L.reed : L.reedDark);
  }
}

/** A bird hide: a hut of weathered boards on legs, a slot to look out of, steps up; its deck and roof the map's ledges. */
function hide(c0: number, c1: number, deckRow: number, roofRow: number | null) {
  const x0 = c0 * TILE;
  const x1 = (c1 + 1) * TILE;
  const deck = deckRow * TILE;
  for (const lx of [x0 + 4, x1 - 8]) R(lx, deck, 4, FLOOR + 8 - deck, L.boardDark);
  if (roofRow !== null) {
    const roof = roofRow * TILE;
    R(x0 + 2, roof + 4, x1 - x0 - 4, deck - roof - 4, L.board);
    for (let x = x0 + 2; x < x1 - 2; x += 5) R(x, roof + 4, 1, deck - roof - 4, L.boardDark);
    R(x0 + 8, roof + 10, x1 - x0 - 16, 3, INK);
  } else {
    // A rail round the deck.
    R(x0, deck - 10, x1 - x0, 2, L.boardDark);
    for (let x = x0; x < x1; x += 8) R(x, deck - 10, 2, 10, L.boardDark);
  }
}

/** The boardwalk's planks over the shallows, on posts. */
function boardwalk(c: number, r: number, x: number, y: number) {
  R(x, y, TILE, 5, (c % 2 ? L.board : L.boardLight));
  R(x, y, TILE, 1, mix(L.boardLight, WHITE, 0.2));
  R(x + 15, y, 1, 5, L.boardDark);
  if (c % 3 === 0) R(x + 6, y + 5, 3, 22, L.boardDark);
  void r;
}

/** The banks and the island: grass and reed stubble on top, then mud with roots and pebbles, darker deeper down. */
function bank(c: number, r: number, x: number, y: number, map: { isSolid(c: number, r: number): boolean }) {
  const depth = r - W;
  if (!map.isSolid(c, r - 1)) {
    R(x, y, TILE, TILE, mix(L.mud, L.reed, 0.35));
    R(x, y, TILE, 3, mix(L.padLight, L.reed, 0.4));
    R(x, y + 3, TILE, 1, L.reedDark);
    for (let k = 0; k < 4; k++) R(x + ((c * 5 + k * 4) % 15), y - 1 - (k % 2), 1, 2 + (k % 2), k % 2 ? L.reed : L.padDark);
    R(x + ((c * 3) % 11) + 2, y + 7, 3, 2, mix(STONE.base, L.mud, 0.3));
    for (let k = 0; k < 3; k++) R(x + ((c * 7 + k * 5) % 14), y + 4 + k * 3, 1, 3, mix(L.reedDark, L.mud, 0.4));
    return;
  }
  // Under the grass: the lake's old bed in layers (order 20), each tile drawn once and copied (ADR 0036, 0041).
  // Reed roots near the top, then mud with a band of peat running on from tile to tile, pebbles, a lens of
  // pale clay, an old root, a freshwater mussel's shell; darker deeper down.
  const d = Math.min(4, depth);
  const n = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
  const kind = Math.floor((n - Math.floor(n)) * 9);
  const band = (r * 5) % 7;
  stamp(`ov-bed ${d} ${band} ${kind}`, x - view.camX, y - view.camY, TILE, TILE, () => {
    const soil = mix(mix(L.mud, L.reed, 0.25), INK, Math.min(0.3, depth * 0.07));
    R(0, 0, TILE, TILE, soil);
    R(0, 3 + band, TILE, 2, mix(soil, INK, 0.25));
    R(0, 5 + band, TILE, 1, mix(soil, L.reed, 0.2));
    if (d <= 1) for (let k = 0; k < 3; k++) R(2 + k * 5, 0, 1, 3 + ((k + kind) % 3), mix(L.reedDark, soil, 0.4));
    if (kind === 0) {
      R(3, 10, 4, 3, mix(STONE.base, soil, 0.35));
      R(9, 12, 2, 2, mix(STONE.base, soil, 0.5));
    } else if (kind === 1) {
      R(2, 11, 9, 2, mix(soil, STONE.light, 0.3));
      R(4, 13, 5, 1, mix(soil, STONE.light, 0.2));
    } else if (kind === 2) for (let k = 0; k < 6; k++) R(1 + k * 2, 9 + (k % 3), 2, 1, mix(L.reedHead, soil, 0.5));
    else if (kind === 3) {
      R(6, 11, 4, 2, mix(STONE.light, soil, 0.45));
      R(7, 10, 2, 1, mix(STONE.light, soil, 0.6));
    } else if (kind === 4) R(11, 9, 2, 2, mix(STONE.base, soil, 0.4));
  });
}

/** A stone in the water: wet and dark, a light edge where the dawn catches it. */
function stone(c: number, r: number, x: number, y: number) {
  const base = r === W ? STONE.base : mix(STONE.base, L.stillDeep, 0.5);
  R(x, y, TILE, TILE, base);
  if (r === W) {
    R(x, y, TILE, 2, mix(STONE.light, WHITE, 0.25));
    R(x + 3, y + 5, 6, 2, mix(STONE.base, WHITE, 0.15));
    R(x, y + 12, TILE, 2, STONE.moss);
  }
  void c;
}

/** A lily pad: a green disc with its notch, the flower on some; going under, it darkens and bubbles. */
function lilyPad(p: SinkPad, s: PadState, t: number, i: number) {
  const y = padY(p, s, t);
  const under = y - p.y;
  if (under >= 10) return;
  const x = p.x + (padSoon(p, s) ? shiver(t) : 0);
  const c = under > 0 ? mix(L.pad, L.stillDeep, under / 12) : L.pad;
  R(x + 2, y, p.w - 4, 1, mix(c, L.padLight, 0.5));
  R(x, y + 1, p.w, 2, c);
  R(x + 2, y + 3, p.w - 4, 1, L.padDark);
  R(x + Math.floor(p.w / 2), y, 2, 3, L.still);
  if (i % 3 === 1 && under === 0) {
    R(x + 5, y - 3, 4, 3, L.lily);
    R(x + 6, y - 2, 2, 1, L.sun);
  }
  if (s.sinkAt !== null && !view.reduced) for (let k = 0; k < 3; k++) R(x + 4 + k * 7, FLOOR - 2 - ((t + k * 5) % 6), 1, 1, L.glint);
}

/** The heron: grey, long legs in the water, its neck folded; gone, a feather turning on the water. */
function heronArt(s: Lake | null, t: number) {
  const x = HERON.x;
  const y = HERON.y;
  if (s?.gone !== null && s?.gone !== undefined) {
    // Flying off, up and away to the left, for a second; then gone.
    const k = t - s.gone;
    if (k < 60) {
      const fx = x - k * 2;
      const fy = y - 6 - k;
      const flap = view.reduced ? 0 : Math.floor(k / 5) % 2;
      R(fx, fy, 12, 3, L.heron);
      R(fx - 3, fy - 2 + flap * 4, 18, 1, L.heronDark);
    }
    return;
  }
  const ready = s?.landed !== null && s?.landed !== undefined;
  // Legs down into the water.
  R(x + 3, y + 8, 1, FLOOR - y - 8, L.heronDark);
  R(x + 8, y + 8, 1, FLOOR - y - 8, L.heronDark);
  // The body he stands on: a broad grey back, darker wings.
  R(x, y, HERON.w, 8, L.heron);
  R(x, y, HERON.w, 1, mix(L.heron, WHITE, 0.4));
  R(x + 1, y + 5, HERON.w - 2, 3, L.heronDark);
  // The neck folded up in front, the head with its black crest, the long bill; shifting as it makes ready.
  const lift = ready && !view.reduced ? Math.min(3, Math.floor((t - (s!.landed as number)) / 15)) : 0;
  R(x + HERON.w, y - 6 - lift, 3, 8, mix(L.heron, WHITE, 0.3));
  R(x + HERON.w, y - 9 - lift, 4, 3, WHITE);
  R(x + HERON.w + 1, y - 10 - lift, 3, 1, INK);
  R(x + HERON.w + 4, y - 8 - lift, 5, 1, L.swanBeak);
}

function swanArt(e: Enemy, t: number) {
  const r = parts({ ...e, y: waterOf(e) }, 20);
  const tell = telling(e);
  const coming = !e.calm;
  // The body on the water: a pink-plum swan, as nothing else on the lake is.
  r(0, -7, 18, 7, ENEMY.plumLight);
  r(0, -2, 18, 2, ENEMY.plum);
  r(-2, -6, 2, 3, ENEMY.plum);
  if (tell || coming) {
    // Wings half raised.
    r(2, -11, 12, 4, ENEMY.plum);
    r(3, -12, 10, 1, ENEMY.plumLight);
  }
  if (coming) {
    // Neck stretched low and forward, the beak open.
    for (let k = 0; k < 7; k++) r(16 + k, -7 - Math.floor(k / 3), 2, 2, ENEMY.plumLight);
    r(22, -11, 4, 4, ENEMY.plumLight);
    r(24, -10, 1, 1, ENEMY.eye);
    r(26, -10, 3, 1, ENEMY.red);
    r(26, -8, 3, 1, ENEMY.red);
  } else if (tell) {
    // Neck down, head low over the water, hissing: the tell (still with reduced motion).
    const shake = view.reduced ? 0 : Math.floor(t / 3) % 2;
    for (let k = 0; k < 5; k++) r(16 + k, -8 + k, 2, 2, ENEMY.plumLight);
    r(20 + shake, -5, 4, 3, ENEMY.plumLight);
    r(24 + shake, -4, 3, 1, ENEMY.red);
    r(21 + shake, -5, 1, 1, ENEMY.eye);
  } else {
    // At peace: the neck up, the head high.
    r(15, -17, 2, 11, ENEMY.plumLight);
    r(15, -19, 4, 3, ENEMY.plumLight);
    r(19, -18, 2, 1, ENEMY.red);
    r(17, -18, 1, 1, ENEMY.eye);
  }
}

function duckArt(e: Enemy) {
  const r = parts(e, 13);
  const bob = view.reduced ? 0 : Math.floor(e.x / 3) % 2;
  r(1, -7, 10, 5, ENEMY.orange);
  r(0, -6, 2, 3, ENEMY.orange);
  r(3, -6, 5, 1, ENEMY.orangeLight);
  r(9, -10 + bob, 4, 4, ENEMY.poison);
  r(13, -9 + bob, 2, 1, ENEMY.red);
  r(11, -9 + bob, 1, 1, ENEMY.eye);
  r(4 + bob, -2, 2, 2, ENEMY.red);
  r(8 - bob, -2, 2, 2, ENEMY.red);
}

/** A coot: plum, a pale shield on its brow, poison-green feet. 13 x 10. */
function cootArt(e: Enemy) {
  const r = parts(e, 13);
  const peck = view.reduced ? 0 : Math.floor(e.x / 4) % 2;
  r(1, -8, 10, 6, ENEMY.plum);
  r(3, -7, 5, 1, ENEMY.plumLight);
  r(9, -10 + peck, 4, 4, ENEMY.plum);
  r(12, -9 + peck, 2, 2, ENEMY.pale);
  r(11, -9 + peck, 1, 1, ENEMY.eye);
  r(4, -2, 2, 2, ENEMY.poison);
  r(8, -2, 2, 2, ENEMY.poison);
}

/** A gull on its nest in the reeds (the nest is not outlined: it does not bite), rising to dive. 11 x 16. */
function nesterArt(e: Enemy, t: number) {
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  plain(() => R(x - 3, y - 2, 16, 3, L.reedHead));
  const r = parts(e, 11);
  if (windingUp(e, t)) {
    const flap = view.reduced ? 0 : Math.floor(t / 4) % 2;
    r(1, -12, 9, 7, ENEMY.orangeLight);
    r(-4, -13 - flap * 2, 6, 2, ENEMY.orange);
    r(9, -13 - flap * 2, 6, 2, ENEMY.orange);
    r(8, -16, 4, 4, ENEMY.orangeLight);
    r(12, -15, 2, 1, ENEMY.red);
    r(10, -15, 1, 1, ENEMY.eye);
  } else {
    r(1, -9, 9, 6, ENEMY.orangeLight);
    r(1, -9, 9, 1, ENEMY.orange);
    r(8, -13, 2, 4, ENEMY.orangeLight);
    r(7, -16, 4, 4, ENEMY.orangeLight);
    r(11, -15, 2, 1, ENEMY.red);
    r(9, -15, 1, 1, ENEMY.eye);
  }
}

/** The rocks the gulls nest on, behind the island's path: broad at the foot, lumpy, lit on top. */
function nestRocks() {
  const rock = mix(STONE.base, L.stillDeep, 0.2);
  for (const c of [117, 123, 129]) {
    const x = c * TILE + 3;
    const y = (W - 2) * TILE;
    for (let k = 0; k < FLOOR - y; k++) {
      const half = 8 + Math.floor((k / (FLOOR - y)) * 8) + ((k * 7 + c) % 3 === 0 ? 1 : 0);
      R(x + 5 - half, y + k, half * 2, 1, k % 9 === 4 ? mix(rock, INK, 0.2) : rock);
    }
    R(x - 3, y, 16, 2, mix(STONE.light, WHITE, 0.2));
  }
}

function diveArt(s: Shot, t: number) {
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  const d = s.vx < 0 ? -1 : 1;
  if (s.spent !== undefined) {
    const flap = view.reduced ? 0 : Math.floor(t / 3) % 2;
    R(x - 5, y - 2, 10, 4, ENEMY.orangeLight);
    R(x - 9, y - 3 - flap * 2, 18, 2, ENEMY.orange);
    return;
  }
  R(x - 4, y - 1, 9, 4, ENEMY.orangeLight);
  R(x - d * 8 - (d < 0 ? 7 : 0), y - 3, 8, 2, ENEMY.orange);
  R(x - d * 8 - (d < 0 ? 7 : 0), y + 3, 8, 2, ENEMY.orange);
  R(x + d * 5 - (d < 0 ? 2 : 0), y, 3, 1, ENEMY.red);
  R(x + d * 3, y - 1, 1, 1, ENEMY.eye);
}

/** The mist over the water past the first swan: it hides the far bank, but never what is close to him. */
function mist(v: View) {
  const x0 = 80 * TILE;
  const x1 = 104 * TILE;
  for (let x = Math.max(x0, view.camX - 4); x < Math.min(x1, view.camX + view.w + 4); x += 4) {
    const edge = Math.min(1, (x - x0) / 48, (x1 - x) / 48);
    const a = Math.max(0, Math.min(0.78, (Math.abs(x - v.him.x) - 56) / 110)) * edge;
    if (a <= 0) continue;
    const drift = view.reduced ? 0 : Math.round(Math.sin(v.t * 0.01 + x * 0.05) * 3);
    R(x, view.camY, 4, view.h, `rgba(${L.mist}, ${(a * 0.85).toFixed(3)})`);
    R(x, FLOOR - 26 + drift, 4, 30, `rgba(${L.mist}, ${(a * 0.25).toFixed(3)})`);
  }
}

/** The sun coming up over the lake at the far end: its light along the water and warm on the near side of things. */
function sunrise(v: View) {
  const k = sunUp(v);
  if (k <= 0) return;
  const g = ctx();
  g.globalCompositeOperation = "lighter";
  const cx = 255 * TILE;
  for (let x = Math.max(203 * TILE, view.camX); x < Math.min(COLS * TILE, view.camX + view.w); x += 4) {
    const near = Math.max(0, 1 - Math.abs(x - cx) / 700);
    R(x, view.camY, 4, FLOOR - view.camY, `rgba(${L.sunGlow}, ${(0.08 * k * near).toFixed(3)})`);
    if (x % 8 === 0) {
      R(x, FLOOR + 3 + ((x * 3) % 5), 6, 1, `rgba(${L.sunGlow}, ${(0.35 * k * near).toFixed(3)})`);
      // The sun's path on the water, its own light after the twilight's tint.
      if (near > 0.3) light(x, FLOOR + 3 + ((x * 3) % 5), 6, 1, "soft", `rgba(255, 200, 130, ${(0.5 * k * near).toFixed(3)})`);
    }
  }
  g.globalCompositeOperation = "source-over";
}

const DECK: LedgeLook = { body: L.board, top: L.boardLight, edge: L.boardDark, joint: L.boardDark };

export const OSTENSJOVANNET: LevelDef = {
  id: "ostensjovannet",
  rune: 13,
  name: "Østensjøvannet",
  short: "Østensjø",
  landmark: { nb: "Fuglevannet", en: "The bird lake" },
  place: { nb: "Østensjø", en: "Østensjø" },
  sky: "twilight",
  map: MAP,
  legend: { solid: "#PK", oneWay: "=", water: "~" },
  ramps: [],
  carriers: [],
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  grounds: GROUNDS,
  rules: RULES,
  floor: () => (W + 4) * TILE,
  signs: [
    {
      label: { nb: "Østensjøvannet", en: "Østensjøvannet" },
      lines: { nb: ["Et naturreservat midt i byen.", "Fuglene var her først."], en: ["A nature reserve in the middle of the city.", "The birds were here first."] }
    },
    {
      label: { nb: "Svanene", en: "The swans" },
      lines: { nb: ["Svanene eier ikke vannet.", "De har bare ikke hørt det."], en: ["The swans do not own the water.", "They have just not heard."] }
    },
    {
      label: { nb: "Hegren", en: "The heron" },
      lines: { nb: ["Hegren står stille lenge.", "Ikke så lenge som du tror."], en: ["The heron stands still for a long time.", "Not as long as you think."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => farShore(v),
    mid: () => bankTrees(0.2, FLOOR - 16, 110, 0.35),
    near: () => bankTrees(0.4, FLOOR - 6, 90, 0.12),
    back(v) {
      tbaneDoor(v.doors.get("tbane"));
      hide(10, 13, W - 2, W - 4);
      hide(92, 101, W - 4, null);
      hide(245, 254, W - 4, W - 7);
      reeds(15, 18, v.t);
      reeds(56, 62, v.t);
      reeds(81, 85, v.t);
      reeds(197, 239, v.t);
      nestRocks();
    },
    front(v) {
      const s = v.grounds as Lake | null;
      if (s) PADS.forEach((p, i) => lilyPad(p, s.pads[i], v.t, i));
      heronArt(s, v.t);
      mist(v);
      sunrise(v);
    },
    ground: () => ({ top: mix(L.reed, L.padLight, 0.5), dot: L.reedDark, fill: mix(mix(L.mud, L.reed, 0.25), INK, 0.3) }),
    tile(t, c, r, x, y, map) {
      if (t === "P") boardwalk(c, r, x, y);
      else if (t === "K") stone(c, r, x, y);
      else if (t === "#" && !map.isWater(c, r - 1) && !map.isWater(c, r - 2)) bank(c, r, x, y, map);
      else return false;
      return true;
    },
    ledges: { "=": DECK },
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "swan") swanArt(e, v.t);
      else if (e.def.look === "duck") duckArt(e);
      else if (e.def.look === "coot") cootArt(e);
      else if (e.def.look === "nester") nesterArt(e, v.t);
      else return false;
      return true;
    },
    shot: (s, v) => {
      diveArt(s, v.t);
      return true;
    }
  }
};
