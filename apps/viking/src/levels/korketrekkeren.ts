import { box, column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { Hazard } from "@larshansen/pixelkit/hazard";
import { seen, stamp } from "@larshansen/pixelkit/kept";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, LAND, METAL, PALETTE, PLANTS, STONE, WHITE } from "@larshansen/pixelkit/palette";
import type { Carrier } from "@larshansen/pixelkit/physics";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import * as K from "@larshansen/pixelkit/swatches/sledge";
import { pulseAge, pulsePhase } from "@larshansen/pixelkit/timed";
import type { Enemy, EnemyDef } from "../game/enemies";
import type { Play } from "../game/play";
import { tbaneDoor } from "../render/furniture";
import { drawLook, drawLookShot } from "../render/looks";
import { clock, forced, moving, step4 } from "../alive/parts";
import { FOE_INK, drawFoe } from "../alive/foes";
import { frame, paint, type Piece } from "../alive/frames";
import { HIM_INK } from "../alive/him";
import { plane } from "../alive/depth";
import { tile as textured, type Grain } from "../alive/ground";
import { mapBuilder } from "./build";
import type { Grounds, LevelDef, LevelRules, View } from "./types";

// Level 13, rune K: Korketrekkeren, the sledge run from Frognerseteren down to Midtstuen, on a winter
// afternoon. The breather of line 2, and its one idea: a sledge he cannot stop. At the top he walks
// (the hut, a sign, a bench, and boys throwing snowballs from the porch: the shield). Then he sits on
// the sledge, and from there to Midtstuen it carries him to the right at the speed of each stretch of
// the run: he can jump (the same jump) and duck (down, where the shield would be: it stays packed),
// and nothing else. A hit costs a heart and he rides on, blinking; off the run, he is put back at the
// last flag, on the sledge. At Midtstuen the sledge stops and he walks to the rune.
//
// The run is drawn steep, but the body never stands on a slope (ADR 0003, 0026): it is a stair of
// narrow ledges four pixels wide, each a pixel or two lower than the one before, as Bygdøy's decks
// are, and the sledge's speed is the level's, set by stretch, not gained on the way down.
//
//   #  snow at the top and at Midtstuen   =  the roof of the shed where the sledges are hired   t  T-banen
//   b  bench   $  skilling   &  brown cheese
//
// Stretches: the first bends with snow bumps only; two sledgers, slower, to jump; low branches to duck;
// the crossing of the line, its barriers coming down on a beat; the steep bit and the jump over the
// gap, with a long clear landing; the trees at dusk with lanterns (branches, a last sledger); the
// run-out to Midtstuen.

const COLS = 270;
const ROWS = 40;
/** The ground at the top, and at Midtstuen: the tops of rows 12 and 35. */
export const TOP_ROW = 12;
export const END_ROW = 35;

/** Where he sits on the sledge (his middle past this), and where it stops at Midtstuen. */
export const RIDE = { from: 33 * TILE + 2, to: 250 * TILE };
/** The gap in the run, where the old bridge over the stream is gone: he must jump it. */
export const GAP = { from: 178 * TILE, to: 182 * TILE };
/** How wide each of the run's ledges is. */
export const SEG = 4;

/** The run's line, through these points (column, height of its surface in pixels): steep where it is fast. */
const POINTS: [number, number][] = [
  [33, 192], [38, 196], [70, 228], [110, 290], [140, 334], [146, 340], [162, 340], [166, 346], [178, 426], [182, 432], [196, 446], [235, 520], [250, 560]
];
/** The snow bumps in the first bends: each rises six pixels over three ledges and drops away at once. */
export const BUMPS = [44, 52, 60];

function lineY(x: number): number {
  for (let i = 1; i < POINTS.length; i++) {
    const [c1, y1] = POINTS[i];
    if (x <= c1 * TILE) {
      const [c0, y0] = POINTS[i - 1];
      return y0 + ((x - c0 * TILE) / ((c1 - c0) * TILE)) * (y1 - y0);
    }
  }
  return POINTS[POINTS.length - 1][1];
}
const hump = (x: number) => {
  for (const c of BUMPS) {
    const dx = x - c * TILE;
    if (dx >= -12 && dx < 0) return 2 * (Math.floor((dx + 12) / SEG) + 1);
  }
  return 0;
};

/** The top of each of the run's ledges, left to right from where the sledge starts; null over the gap. */
export const TOPS: (number | null)[] = Array.from({ length: (RIDE.to - (RIDE.from - 2)) / SEG }, (_, i) => {
  const x = RIDE.from - 2 + i * SEG;
  return x >= GAP.from && x < GAP.to ? null : Math.round(lineY(x + SEG / 2) - hump(x));
});
const X0 = RIDE.from - 2;

/** The run's surface at x, or null over the gap or off the run. */
export function trackY(x: number): number | null {
  const i = Math.floor((x - X0) / SEG);
  return i < 0 || i >= TOPS.length ? null : TOPS[i];
}

/** The speed of the sledge at x, by stretch, easing from one to the next over three tiles; never over twice his run. */
export const STRETCHES: [number, number][] = [[33, 1.2], [70, 1.5], [140, 1.4], [162, 2.2], [196, 1.4], [235, 1.4], [250, 0.8]];
export function speedAt(x: number): number {
  const c = x / TILE;
  const n = STRETCHES.length;
  const [ca, va] = STRETCHES[n - 2];
  const [cb, vb] = STRETCHES[n - 1];
  // The run-out slows all along it.
  if (c >= cb) return vb;
  if (c >= ca) return va + ((c - ca) / (cb - ca)) * (vb - va);
  // Elsewhere the speed changes over a stretch's first three tiles.
  let v = STRETCHES[0][1];
  for (let i = 1; i < n - 1; i++) {
    const [c1, v1] = STRETCHES[i];
    if (c < c1) break;
    const v0 = STRETCHES[i - 1][1];
    v = c < c1 + 3 ? v0 + ((c - c1) / 3) * (v1 - v0) : v1;
  }
  return v;
}

const b = mapBuilder(COLS, ROWS);
// --- Frognerseteren: the end of the line, the hut, its porch and its roof ------------------------------
b.ground(0, 32, TOP_ROW);
b.run(29, 31, TOP_ROW - 2, "=");
// --- Midtstuen: the platform and the path ------------------------------------------------------------
b.ground(250, COLS - 1, END_ROW);

/** A flag on the run: on the row just above its surface there, so he is put back onto it. */
const onRun = (c: number) => Math.floor(trackY(c * TILE + TILE / 2)! / TILE) - 1;
b.put(2, TOP_ROW - 1, "t").put(4, TOP_ROW - 1, "S");
b.put(5, TOP_ROW - 1, "i").put(32, TOP_ROW - 1, "i").put(255, END_ROW - 1, "i");
b.put(7, TOP_ROW - 1, "b");
b.put(31, TOP_ROW - 1, "f");
for (const c of [70, 112, 146, 166, 205, 244]) b.put(c, onRun(c), "f");
b.put(262, END_ROW - 1, "r").put(182, 20, "o").put(30, TOP_ROW - 3, "&");

// Skilling: on the porch, along the run at his height (the sledge takes them), over the bumps and the
// sledgers (a jump takes them), under the branches (ducking takes them), over the gap.
const coinOn = (c: number, up = 0) => b.put(c, Math.floor((trackY(c * TILE + TILE / 2)! - 10) / TILE) - up, "$");
for (const c of [12, 17, 21, 26]) b.put(c, TOP_ROW - 2, "$");
for (const c of [36, 39, 42, 48, 50, 56, 58, 64, 66, 72, 75, 78, 103, 106, 113, 120, 128, 136, 143, 150, 156, 160, 170, 174, 186, 189, 192, 199, 202, 210, 217, 224, 230, 238, 242, 246]) coinOn(c);
for (const c of [44, 52, 60, 88, 100, 226]) coinOn(c, 1);
for (const c of [179, 181]) b.put(c, 24, "$");
for (const c of [254, 257, 260]) b.put(c, END_ROW - 1, "$");

export const MAP = b.rows_();

// --- The run, the sledge and what is on the run ----------------------------------------------------

/** What the run keeps of its own: whether he lies back on the sledge (for drawing him so). */
interface Ride {
  duck: boolean;
}

/** The run: the ledge under his middle, as the physics takes it, carrying him onto it as he goes down. */
function runGround(him: { x: number; y: number; onGround: boolean }): Carrier[] {
  const now = trackY(him.x + PLAYER.w / 2);
  if (now === null) return [];
  const feet = him.y + PLAYER.h;
  const standing = him.onGround && Math.abs(feet - now) <= 4;
  return [{ x: X0, y: now, w: RIDE.to - X0, dx: 0, dy: standing ? now - feet : 0 }];
}

export const GROUNDS: Grounds<Ride> = {
  create: () => ({ duck: false }),
  carriers: (_s, _t, him) => runGround(him),
  everywhere: () => TOPS.flatMap((y, i) => (y === null ? [] : [{ x: X0 + i * SEG, y, w: SEG, dx: 0, dy: 0 }]))
};

/** A low branch over the run at column c: its needles hang to his head's height, not to a ducked one's. */
const branch = (c: number): Hazard => {
  const x = c * TILE;
  const top = Math.min(...[x, x + 7, x + 13].map((xx) => trackY(xx)!));
  return { x, y: top - 16, w: 14, h: 7 };
};
/** The crossing's barrier: up, it is no harm; for a second its lights blink and it comes down; down, duck. */
export const BARRIER: Hazard = { x: 154 * TILE, y: 340 - 16, w: 2 * TILE, h: 7, beat: { rest: 150, warn: 60, live: 120 } };
export const BRANCHES = [116, 124, 132, 206, 214].map(branch);
export const HAZARDS: Hazard[] = [...BRANCHES.slice(0, 3), BARRIER, ...BRANCHES.slice(3)];

/**
 * A sledger: waits at the top of its stretch until he comes within ten tiles, then rides down it at its
 * own speed, slower than his, and pulls off at the bottom. Put back behind it (a fall), it waits again.
 */
function sledger(e: Enemy, p: Play) {
  const range = (e.def.range ?? 0) * TILE;
  const start = e.home - range;
  const hx = p.body.x + PLAYER.w / 2;
  if (e.n !== undefined && hx < start - 12 * TILE) e.n = undefined;
  if (e.n === undefined) {
    e.x = start;
    if (hx >= start - 10 * TILE) e.n = p.t;
  } else e.x = Math.min(e.home + range, start + (p.t - e.n) * (e.def.speed ?? 0.5));
  e.calm = e.x >= e.home + range;
  e.y = trackY(e.x) ?? e.y;
  e.dir = 1;
}

export const RULES: LevelRules = {
  enemy(e, p) {
    if (e.def.look !== "sledger") return false;
    sledger(e, p);
    return true;
  },
  /**
   * On the run he sits on the sledge, and it carries him at the stretch's speed whatever he presses: he
   * cannot walk, stop or dash. Down is a duck there (the shield stays packed), and ducking he cannot jump.
   */
  intent(p, k) {
    const b = p.body;
    const x = b.x + PLAYER.w / 2;
    p.riding = x >= RIDE.from && x < RIDE.to;
    p.ducking = p.riding && !!k.shield;
    const s = p.grounds?.state as Ride | undefined;
    if (s) s.duck = p.ducking;
    if (!p.riding) return k;
    b.vx = speedAt(x);
    b.launched = true;
    b.facing = 1;
    return { left: false, right: false, jumpHeld: k.jumpHeld && !p.ducking, jumpPressed: k.jumpPressed && !p.ducking };
  },
  carry: (x) => (x >= RIDE.from && x < RIDE.to ? speedAt(x) : 0),
  lead: (w) => Math.round(w * 0.28)
};

/**
 * Boys throwing snowballs from the hut's balcony, facing the way he comes (the shield); a crow over the
 * hut; three sledgers on the run, slower than he is; an owl in the trees at dusk; a fox at Midtstuen.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "flyer", look: "crow", c: 10, r: TOP_ROW - 8, range: 3, rise: 5, period: 170 },
  // Their beats chosen (by a search) so that a man who walks on under the balcony is nearly always hit.
  { kind: "thrower", look: "kid", c: 15, r: TOP_ROW - 3, period: 150, lead: true, faces: -1 },
  { kind: "thrower", look: "kid", c: 19, r: TOP_ROW - 3, period: 150, offset: 75, lead: true, faces: -1 },
  { kind: "thrower", look: "kid", c: 23, r: TOP_ROW - 3, period: 150, offset: 125, lead: true, faces: -1 },
  { kind: "walker", look: "sledger", c: 84, r: 15, range: 8, speed: 0.5, w: 14, h: 10 },
  { kind: "walker", look: "sledger", c: 100, r: 17, range: 8, speed: 0.5, w: 14, h: 10 },
  { kind: "flyer", look: "owl", c: 210, r: 21, range: 2, rise: 4, period: 200 },
  { kind: "walker", look: "sledger", c: 225, r: 29, range: 7, speed: 0.5, w: 14, h: 10 },
  { kind: "walker", look: "fox", c: 266, r: END_ROW - 1, range: 1 }
];

export const KORKETREKKEREN_RULES = { COLS, ROWS };

// --- Art ----------------------------------------------------------------------------------------------
const P = PALETTE;
/** The snow's top (order 26). */
const CRUST: Grain = { name: "kt-crust", kind: "snow", ramp: [mix(K.runGroove, INK, 0.15), mix(K.slopeShade, K.slope, 0.5), K.slope, mix(K.slope, K.bank, 0.5), K.bank], accent: { sparkle: WHITE } };

/** The view's floor follows the run down, a few rows under it. */
const floorAt = (x: number) => Math.min(ROWS * TILE, (trackY(Math.max(X0, Math.min(RIDE.to - 1, x))) ?? (x < X0 ? TOP_ROW * TILE : END_ROW * TILE)) + 5 * TILE);

/** The ground behind the run at a street x: the run's height there, or the flat at either end. */
const behind = (sx: number) => trackY(Math.max(X0, Math.min(RIDE.to - 1, sx))) ?? (sx < X0 ? TOP_ROW * TILE : END_ROW * TILE);

/** The far hills: the fjord and the town far below, white hills over them, the low sun along their tops. Kept at his height. */
function farHills(v: View) {
  const base = v.him.y + 20;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 50 + Math.round(16 * Math.sin(wx * 0.011) + 8 * Math.sin(wx * 0.037));
    column(x, base - h, base + 400, mix(LAND.farHills, WHITE, 0.4));
    column(x, base - h, base - h + 2, mix(K.lantern, WHITE, 0.55));
    if (Math.floor(wx) % 13 < 2) column(x, base - 12 - (Math.floor(wx) % 5), base - 12, mix(STONE.light, WHITE, 0.3));
  }
  // The fjord far down under the hills, and the snow on the slopes before it, as planes running away from him (order
  // 23): strips each a little faster than the one above; the water drifts, the snow lies still.
  plane({ layer: 0.12, top: base - 12, bottom: base + 40, from: 0.12, to: 0.3, tones: [mix(P.water, WHITE, 0.45), mix(P.water, WHITE, 0.38), mix(P.water, WHITE, 0.3)], glint: WHITE, drift: 0.06, strip: 2, near: 5 }, v.t);
  box(0, base + 40, view.w, 360, mix(P.water, WHITE, 0.35));
}

/** Spruce on the slope behind the run, layered, snow on their boughs. Darker in the trees at dusk. Each shape is drawn once and copied (ADR 0036). */
function spruces(factor: number, n: number, fade: number) {
  for (let i = 0; i < n; i++) {
    const wx = i * 31 + ((i * 17) % 13);
    const x = layerX(wx, factor);
    if (x < -20 || x > view.w + 20) continue;
    const foot = behind(x + view.camX) - 14 - ((i * 7) % 18) - (factor < 0.3 ? 16 : 0);
    const h = 30 + ((i * 11) % 16);
    const sx = x + view.camX;
    const dusk = sx > 196 * TILE && sx < 236 * TILE ? 0.45 : 0;
    const green = mix(mix(PLANTS.spruce, LAND.farHills, fade), K.dusk, dusk);
    const halfOf = (k: number) => Math.floor((k / h) * 9) + 1 - (k % 6 === 5 ? 1 : 0);
    let most = 1;
    for (let k = 0; k < h; k++) most = Math.max(most, halfOf(k));
    // Its spire over the top tier (order 26, section 3c): a pixel of snow, a pixel of green; the piece two rows taller for it.
    stamp(`kt ${fade} ${h} ${dusk}`, x - most, foot - h - 2 - view.camY, most * 2 + 1, h + 6, () => {
      R(most, 0, 1, 1, mix(K.bank, green, 0.3 + dusk));
      R(most, 1, 1, 1, green);
      for (let k = 0; k < h; k++) R(most - halfOf(k), k + 2, halfOf(k) * 2 + 1, 1, k % 6 === 0 ? mix(K.bank, green, 0.3 + dusk) : green);
      R(most, h + 2, 2, 4, mix(PLANTS.spruceTrunk, LAND.farHills, fade));
    });
  }
}

/** Frognerseteren: the T-bane's last stop, the dark log restaurant with its carved dragon heads, the porch. */
function frognerseteren(v: View) {
  tbaneDoor(v.doors.get("tbane"));
  const g = TOP_ROW * TILE;
  const x0 = 11 * TILE;
  const x1 = 28 * TILE;
  if (!seen(x0 - 12, 32 * TILE)) return;
  // The log walls, up to the roof.
  for (let y = g - 4 * TILE; y < g; y += 4) {
    R(x0, y, x1 - x0, 4, (y >> 2) % 2 ? K.logs : K.logsLight);
    R(x0, y + 3, x1 - x0, 1, mix(K.logs, INK, 0.3));
  }
  // Warm windows.
  for (let x = x0 + 14; x < x1 - 14; x += 34) {
    R(x, g - 54, 12, 12, mix(P.sail, K.lantern, 0.5));
    R(x + 5, g - 54, 1, 12, K.logs);
    light(x, g - 54, 12, 12);
  }
  // The roof: dark shingle over the top ledge, its ridge, a dragon head carved at each gable.
  for (let k = 0; k < 18; k++) R(x0 - 8 + k * 2, g - 4 * TILE - 4 - k, x1 - x0 + 16 - k * 4, 1, k % 4 === 0 ? mix(K.shingle, WHITE, 0.6) : K.shingle);
  for (let k = 0; k < x1 - x0 + 16; k += 3) R(x0 - 8 + k, g - 4 * TILE - 5, 2, 2, K.bank);
  for (const [ex, d] of [[x0 - 10, -1], [x1 + 8, 1]] as const) {
    R(ex, g - 4 * TILE - 14, 3, 12, K.carved);
    R(ex + d * 3, g - 4 * TILE - 18, 4, 4, K.carved);
    R(ex + d * 6, g - 4 * TILE - 16, 2, 2, K.carved);
  }
  // The balcony along the first floor, where the boys stand: its floor and its carved rail.
  R(x0 + 8, g - 2 * TILE - 3, x1 - x0 - 16, 3, K.carved);
  for (let x = x0 + 10; x < x1 - 10; x += 6) R(x, g - 2 * TILE - 12, 2, 9, mix(K.carved, INK, 0.2));
  R(x0 + 8, g - 2 * TILE - 13, x1 - x0 - 16, 2, K.carved);
  for (let x = x0 + 12; x < x1 - 8; x += 40) R(x, g - 2 * TILE, 3, 2 * TILE, K.carved);
  // The shed where the sledges are hired (its roof he can stand on), sledges leaning on it.
  R(29 * TILE, g - 2 * TILE, 3 * TILE, 2 * TILE, K.logsLight);
  for (let y = g - 2 * TILE; y < g; y += 4) R(29 * TILE, y + 3, 3 * TILE, 1, K.logs);
  for (let k = 0; k < 3; k++) R(29 * TILE + 4 + k * 12, g - 18, 4, 18, k % 2 ? K.sledgeRed : K.sledgeWood);
}

/** The run: packed snow along the stair of ledges, a groove from the runners, banks either side, the slope under it. */
function theRun() {
  // The run is two kilometres of rectangles end to end: only what is on the screen is drawn.
  const i1 = Math.min(TOPS.length, Math.ceil((view.camX + view.w - X0) / SEG) + 1);
  for (let i = Math.max(0, Math.floor((view.camX - X0) / SEG) - 1); i < i1; i++) {
    const x = X0 + i * SEG;
    const y = TOPS[i];
    if (y === null) continue;
    R(x, y, SEG, 3, K.run);
    R(x, y + 3, SEG, 2, K.runGroove);
    R(x, y + 5, SEG, 260, K.slope);
    R(x, y + 18, SEG, 2, K.slopeShade);
    if (i % 3 === 0) R(x, y - 2, 2, 2, K.bank);
  }
  // The hillside under the run: shading along it, young spruce, stones and a fence, so it is not one plain sheet.
  for (let x = X0 + Math.max(0, Math.floor((view.camX - 2 - X0) / 2) * 2); x < Math.min(RIDE.to, view.camX + view.w); x += 2) {
    const y = trackY(x);
    if (y === null) continue;
    R(x, y + 34, 2, 2, K.slopeShade);
    R(x, y + 70, 2, 3, mix(K.slopeShade, K.slope, 0.4));
  }
  hillside();
  for (let x = X0 + 10, i = 0; x < RIDE.to; x += 37, i++) {
    if (!seen(x - 4, x + 34)) continue;
    const y = trackY(x);
    if (y === null) continue;
    const top = y + 44 + ((i * 13) % 30);
    const h = 10 + ((i * 5) % 8);
    for (let k = 0; k < h; k++) R(x - Math.floor((k / h) * 4), top + k, Math.floor((k / h) * 8) + 1, 1, k % 4 === 0 ? K.bank : mix(PLANTS.spruce, K.slope, 0.25));
    if (i % 3 === 1) R(x + 14, top + 22, 6, 3, mix(STONE.base, K.slope, 0.4));
    if (i % 4 === 2) for (let k = 0; k < 3; k++) R(x + 20 + k * 6, top - 6, 1, 6, P.woodDark);
  }
}

/** A small number from a place, the same every visit. */
const hash = (a: number, b: number) => {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * What the hillside under the run has, so it is not one sheet of snow (order 20): drifts the wind has
 * packed, a boulder under its cap, a sapling buried to its top, a hare's tracks, the old fence's last
 * posts, the shadow of a hollow. Placed along the run at depths below it, each drawn once and copied
 * (ADR 0036, 0041); quieter than anything he meets, and nothing with a top to stand on.
 */
const HILLSIDE = Array.from({ length: 140 }, (_, i) => {
  const x = X0 + 24 + i * 26 + Math.floor(hash(i, 1) * 14);
  // Half near the run, where a wide view sees them; half deeper, for a tall one.
  return { x, depth: i % 2 ? 28 + Math.floor(hash(i, 2) * 44) : 72 + Math.floor(hash(i, 2) * 130), kind: Math.floor(hash(i, 3) * 6) };
}).filter((f) => f.x < RIDE.to - 24 && trackY(f.x) !== null);
const DRIFT = mix(K.bank, K.slope, 0.35);
const HOLLOW = mix(K.slope, K.slopeShade, 0.55);
const SAPLING = mix(PLANTS.spruce, K.slope, 0.55);
const BOULDER = mix(STONE.base, K.slope, 0.5);
const TRACK = mix(K.slopeShade, K.runGroove, 0.5);
function hillside() {
  for (const f of HILLSIDE) {
    if (!seen(f.x - 2, f.x + 26)) continue;
    const y = (trackY(f.x) as number) + f.depth;
    stamp(`kt-hill ${f.kind}`, f.x - view.camX, y - view.camY, 26, 12, () => {
      if (f.kind === 0) {
        // A drift: a lit crest, its lee in shade.
        R(2, 6, 20, 1, DRIFT);
        R(5, 5, 12, 1, DRIFT);
        R(4, 7, 18, 1, HOLLOW);
      } else if (f.kind === 1) {
        // A boulder under a cap of snow, only its side showing.
        R(6, 6, 9, 4, BOULDER);
        R(7, 10, 7, 1, HOLLOW);
        R(5, 5, 11, 2, DRIFT);
      } else if (f.kind === 2) {
        // A sapling buried to its top tier.
        R(10, 3, 1, 7, SAPLING);
        R(8, 6, 5, 1, SAPLING);
        R(7, 8, 7, 1, SAPLING);
        R(9, 4, 3, 1, DRIFT);
        R(6, 9, 9, 1, HOLLOW);
      } else if (f.kind === 3) {
        // A hare's tracks across the slope.
        for (let k = 0; k < 5; k++) {
          R(2 + k * 5, 6 + (k % 2), 1, 2, TRACK);
          R(4 + k * 5, 6 + (k % 2), 1, 1, TRACK);
        }
      } else if (f.kind === 4) {
        // The old fence's last posts, leaning, nearly buried.
        for (let k = 0; k < 3; k++) R(4 + k * 7 + (k % 2), 4 + k, 1, 6 - k, mix(P.woodDark, K.slope, 0.45));
        R(3, 9, 20, 1, HOLLOW);
      } else {
        // A hollow in the snow, its far edge lit.
        R(3, 7, 18, 2, HOLLOW);
        R(6, 6, 12, 1, DRIFT);
      }
    });
  }
}

/** Under the flats (the top and Midtstuen): the snow in packed layers, a stone, a root, a lens of ice. Each tile is drawn once and copied. */
function snowBody(c: number, r: number, x: number, y: number) {
  const depth = r - (c < 100 ? TOP_ROW : END_ROW);
  const fill = mix(K.slope, K.slopeShade, Math.min(0.8, depth * 0.18));
  const layer = (r * 7) % 6;
  const kind = Math.floor(hash(c, r) * 9);
  stamp(`kt-snow ${Math.min(5, depth)} ${layer} ${kind}`, x - view.camX, y - view.camY, TILE, TILE, () => {
    R(0, 0, TILE, TILE, fill);
    // The wind's layers, a crust lighter over a shade, running on from tile to tile in every other row.
    if (layer % 2 === 0) {
      R(0, 4 + layer, TILE, 1, mix(fill, K.bank, 0.4));
      R(0, 5 + layer, TILE, 1, mix(fill, K.slopeShade, 0.3));
    }
    if (kind === 0) {
      R(4, 9, 6, 3, mix(STONE.base, fill, 0.5));
      R(4, 8, 6, 1, mix(fill, K.bank, 0.6));
    } else if (kind === 1) {
      for (let k = 0; k < 3; k++) R(5 + k * 2, 11 - k, 2, 1, mix(P.woodDark, fill, 0.6));
    } else if (kind === 2) R(8, 12, 5, 2, mix(fill, K.runGroove, 0.6));
    else if (kind === 3) R(2, 13, 3, 1, mix(fill, K.slopeShade, 0.7));
  });
}

/** The gap in the run: a gully, its snowy sides going down in shade to the stream, the stumps of the old bridge. */
function gap() {
  if (!seen(GAP.from - 3, GAP.to + 3)) return;
  const y0 = trackY(GAP.from - 2)!;
  const w = GAP.to - GAP.from;
  for (let k = 0; k < w; k++) {
    const d = Math.min(k, w - 1 - k);
    const side = Math.min(60, d * 3);
    R(GAP.from + k, y0 + 4, 1, side, mix(K.slopeShade, K.dusk, 0.15 + (d / w) * 0.3));
    R(GAP.from + k, y0 + 4 + side, 1, ROWS * TILE, mix(K.slopeShade, K.dusk, 0.5));
  }
  R(GAP.from + 12, y0 + 70, w - 24, 5, P.water);
  R(GAP.from + 12, y0 + 70, w - 24, 1, P.foam);
  for (let k = 0; k < 4; k++) R(GAP.from + 10 + k * 12, y0 + 64 - (k % 2) * 3, 6, 4, mix(STONE.base, K.dusk, 0.3));
  for (const x of [GAP.from - 3, GAP.to - 2]) {
    R(x, y0 - 2, 5, 40, P.woodDark);
    R(x, y0 - 3, 5, 2, K.bank);
  }
}

/** The crossing of the line: rails across the run, a post with lights each side, the barrier's arm. */
function crossing(t: number) {
  const y = trackY(BARRIER.x)!;
  R(BARRIER.x - 10, y + 1, BARRIER.w + 20, 2, METAL.rail);
  R(BARRIER.x - 10, y + 4, BARRIER.w + 20, 1, METAL.rail);
  const phase = pulsePhase(t, BARRIER.beat!);
  const { age, of } = pulseAge(t, BARRIER.beat!);
  // The lights blink while it comes down and while it is down: seen from far off.
  const lit = phase !== "rest" && (view.reduced || Math.floor(t / 15) % 2 === 0);
  for (const px of [BARRIER.x - 8, BARRIER.x + BARRIER.w + 4]) {
    R(px, y - 34, 3, 34, METAL.lampPost);
    R(px - 3, y - 36, 9, 6, INK);
    R(px - 2, y - 35, 3, 3, lit ? K.signalOn : K.signalOff);
    R(px + 2, y - 35, 3, 3, lit && !view.reduced ? K.signalOff : lit ? K.signalOn : K.signalOff);
    if (lit) light(px - 2, y - 35, 7, 3, "lamp");
  }
  // The arm: up along its post at rest, coming down over the warning, across at his head's height when down.
  const down = phase === "live" ? 1 : phase === "warn" ? (view.reduced ? 0 : age / of) : 0;
  const ax = BARRIER.x - 6;
  const ay = BARRIER.y + 2;
  const len = BARRIER.w + 8;
  for (let k = 0; k < len; k++) {
    const a = (1 - down) * (Math.PI / 2);
    const xx = Math.round(ax + Math.cos(a) * k);
    const yy = Math.round(ay - Math.sin(a) * k);
    R(xx, yy, 2, 2, Math.floor(k / 5) % 2 ? K.barrierRed : K.barrier);
  }
}

/** A low spruce branch over the run, its needles hanging to head height, snow on it. */
function branchArt(h: Hazard, dusk: boolean) {
  if (!seen(h.x - 30, Math.max(h.x + 20, h.x + h.w + 3))) return;
  const green = dusk ? mix(PLANTS.spruce, K.dusk, 0.3) : PLANTS.spruce;
  R(h.x - 30, h.y - 4, 50, 3, PLANTS.spruceTrunk);
  for (let k = 0; k < h.w + 6; k++) R(h.x - 3 + k, h.y - 2, 1, 4 + ((k * 3) % 5), green);
  for (let k = 0; k < h.w; k += 3) R(h.x + k, h.y - 4, 2, 1, K.bank);
}

/** The trees at dusk: lanterns on posts along the run, their light on the snow. */
function lanterns(t: number) {
  for (let c = 198; c < 236; c += 6) {
    const x = c * TILE + 4;
    const y = trackY(x)!;
    R(x, y - 30, 2, 30, METAL.lampPost);
    R(x - 2, y - 36, 6, 6, INK);
    R(x - 1, y - 35, 4, 4, K.lantern);
    light(x - 1, y - 35, 4, 4, "lamp");
    const glow = view.reduced ? 0 : Math.round(Math.sin(t * 0.05 + c));
    R(x - 8, y - 1, 18 + glow, 1, mix(K.lantern, K.run, 0.4));
  }
}

/** Midtstuen: the station's platform shelter, the sign. */
function midtstuen(v: View) {
  const g = END_ROW * TILE;
  const x = 256 * TILE;
  R(x, g - 40, 6 * TILE, 4, K.shingle);
  R(x + 4, g - 36, 3, 36, METAL.lampPost);
  R(x + 6 * TILE - 7, g - 36, 3, 36, METAL.lampPost);
  R(x + 10, g - 30, 6 * TILE - 20, 14, mix(P.sail, K.lantern, 0.3));
  light(x + 10, g - 30, 6 * TILE - 20, 14, "soft");
  void v;
}

/**
 * The sledge, drawn as a frame (order 25; way 3, ADR 0045), 18 x 5 from its runner's back end: a wooden seat lit along
 * its top with the gaps between its slats, its struts, dark runners with a glint, curling up at the front.
 */
const SLEDGE_INK: Record<string, string> = { H: mix(K.sledgeWood, WHITE, 0.3), w: K.sledgeWood, g: mix(K.sledgeWood, INK, 0.35), s: mix(K.sledgeWood, INK, 0.2), r: K.sledgeRunner, R: mix(K.sledgeRunner, WHITE, 0.35) };
const SLEDGE_FRAME = frame("the sledge", SLEDGE_INK, [[".................R", ".HHHHHHHHHHHHHH.Rr", ".wwgwwwwgwwwwgw.r.", "..s..s....s..s.r..", "rrRrrrrrRrrrrrrr.."]]);
function sledgeAt(x: number, y: number) {
  paint(SLEDGE_FRAME, x - 8, y - 5, 1, 18);
}

/**
 * Lying back on the sledge to duck, drawn as a frame in his own colours (order 25; until then this was the one picture
 * of him still in rectangles): his helmet and pompom at the back, his face turned up, the cape under him, the tunic and
 * belt, his legs out along the sledge to his boots at its front. 18 x 5.
 */
const LYING = frame("lying back on the sledge", HIM_INK, [["..Ww..............", ".jiIIR............", "rrrRRrS...........", ".zsSeScCbBbynDDDKL", "..zssScxbbbyydddkk"]]);
function lyingBack(x: number, y: number) {
  paint(LYING, x - 9, y - 10, 1, 18);
}

/**
 * Whether a sledger is about to set off, or just has: from four tiles before he comes near enough to set it
 * going (ten tiles) until a fifth of a second after it has. Drawing only: when it goes is the rules' (order 20).
 */
export function sledgerReady(e: Enemy, him: number, t: number) {
  const start = e.home - (e.def.range ?? 0) * TILE;
  return e.n === undefined ? him >= start - 14 * TILE : t - e.n < 12;
}

/**
 * A sledger, drawn as frames (order 25; way 3, ADR 0045), 20 x 15 from its runners: a kid in a bobble hat (poison green,
 * lit at the top left), a face with an eye, a puffy jacket (pink, or plum every other one) lit across the shoulders and
 * shaded to its back, legs out along an orange sledge lit along its top, plum runners curling up at its nose. Sitting it
 * breathes; riding, its scarf streams back and the bumps jolt it (four frames by the distance it goes). About
 * to set off it leans forward over the nose and digs its mittens into the snow either side to push (order 20). Pulled off
 * at the end of its stretch, up on the bank, it is out of the way and harmless, outlined in the calm pale (order 22: the
 * page outlines it so while it is calm).
 */
const SLEDGE = [
  "OOOOOOOOOOOOOOOOOd..",
  "ooooooooooooooooodd.",
  ".l...l......l...l.d.",
  "dMddddddMdddddddMdd."
];
const SLEDGER_KID = [
  ".....GgG............",
  "....GGGgg...........",
  "....gggggg..........",
  "....OOOOeOa.........",
  "....OOOOOO..........",
  "...JJJJJJJ..........",
  "...JjjjjjjjJa.......",
  "...jjjjjjjk.........",
  "...jjjjjjjkkkk......",
  "...kkkkkkkkkkklll..."
];
const SLEDGER_LEAN = [
  "........GgG.........",
  ".......GGGgg........",
  ".......gggggg.......",
  ".......OOOOOeOa.....",
  "......JJOOOOOO......",
  ".....JJjjjjjjjJJ....",
  "....JjjjjjjjjjjjJ...",
  "....jjjjjjjjjkkkJ...",
  "...jjjjjjjjkkk..ja..",
  "...kkkkkkkkkklll.aa."
];
const SCARF = [["Gg..", ".gg."], ["....", "Ggg."], ["G...", ".gg."], ["....", ".Ggg"]];
const SLEDGER_INK = [{ J: ENEMY.pink, j: ENEMY.pink, k: ENEMY.plum }, { J: ENEMY.plumLight, j: ENEMY.plum, k: ENEMY.plumDark }];
const sledgerLooks = (coat: Record<string, string>) => {
  const ink = { ...FOE_INK, ...coat };
  const f = (label: string, kid: readonly string[], dy: number, scarf?: number) =>
    frame(`sledger, ${label}`, ink, [SLEDGE, 0, 10], [kid, 0, dy], ...(scarf === undefined ? [] : [[SCARF[scarf], 0, 5 + dy] as Piece]));
  return {
    sit: [f("sitting", SLEDGER_KID, 0), f("sitting, breathing", SLEDGER_KID, 1)],
    // Riding: the kid jolted down a pixel on every other bump of the snow, the scarf streaming.
    ride: [0, 1, 2, 3].map((k) => f(`riding ${k + 1}`, SLEDGER_KID, k % 2 ? 0 : 1, k)),
    lean: f("leaning in to push off", SLEDGER_LEAN, 0)
  };
};
const SLEDGERS = SLEDGER_INK.map(sledgerLooks);
function sledgerArt(e: Enemy, v: View) {
  const l = SLEDGERS[e.def.c % 2];
  const at = e.calm ? { ...e, x: e.x + 18, y: e.y - 7 } : e;
  const ready = !e.calm && sledgerReady(e, v.him.x, v.t);
  const own = clock.t + (e.def.offset ?? 0);
  // Riding once it has set off (for the census, whenever it is drawn moving).
  const riding = !e.calm && (forced.state ? moving(e) : e.n !== undefined);
  const f = ready ? l.lean : riding ? l.ride[view.reduced ? 0 : step4(e)] : l.sit[Math.floor(own / 60) % 2];
  drawFoe(at, f, 18, 15);
}

const PORCH: LedgeLook = { body: K.logs, top: mix(K.carved, WHITE, 0.2), edge: mix(K.logs, INK, 0.3), joint: K.logs };

export const KORKETREKKEREN: LevelDef = {
  id: "korketrekkeren",
  rune: 12,
  name: "Korketrekkeren",
  landmark: { nb: "Akebakken", en: "The sledge run" },
  place: { nb: "Frognerseteren", en: "Frognerseteren" },
  sky: "evening",
  // The air in the snow: the far layers fade into a grey-white (order 22).
  air: "#e6ebef",
  map: MAP,
  legend: { solid: "#", oneWay: "=", water: "" },
  ramps: [],
  carriers: [],
  timed: [],
  cannons: [],
  enemies: ENEMIES,
  hazards: HAZARDS,
  grounds: GROUNDS,
  rules: RULES,
  floor: floorAt,
  signs: [
    {
      label: { nb: "Korketrekkeren", en: "Korketrekkeren" },
      lines: { nb: ["To kilometer ned til Midtstuen.", "Kjelken stopper der. Ikke før."], en: ["Two kilometres down to Midtstuen.", "The sledge stops there. Not before."] }
    },
    {
      label: { nb: "Kjelken", en: "The sledge" },
      lines: { nb: ["På kjelken dukker du med pil ned.", "Skjoldet ligger i sekken til Midtstuen."], en: ["On the sledge, down ducks.", "The shield stays packed until Midtstuen."] },
      touch: { nb: ["På kjelken blir Skjold-knappen til Dukk.", "Skjoldet ligger i sekken til Midtstuen."], en: ["On the sledge, the Shield button turns into Duck.", "The shield stays packed until Midtstuen."] }
    },
    {
      label: { nb: "Midtstuen", en: "Midtstuen" },
      lines: { nb: ["Herfra går T-banen opp igjen.", "Kjelken må du dra selv."], en: ["The T-bane goes back up from here.", "The sledge you pull yourself."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => farHills(v),
    mid: () => spruces(0.2, 160, 0.4),
    near: () => spruces(0.4, 140, 0.15),
    back(v) {
      frognerseteren(v);
      theRun();
      gap();
      lanterns(v.t);
      midtstuen(v);
    },
    front(v) {
      // The trees at dusk: the light goes there, under the spruce, but for the lanterns.
      for (let x = 192 * TILE; x < 240 * TILE; x += 4) {
        if (!seen(x, x + 4)) continue;
        const k = Math.min(1, (x - 192 * TILE) / 64, (240 * TILE - x) / 64);
        R(x, view.camY, 4, view.h, `rgba(20, 28, 60, ${(0.32 * k).toFixed(3)})`);
      }
      crossing(v.t);
      for (const h of BRANCHES) branchArt(h, h.x > 196 * TILE);
      // The sledge: waiting at the top, under him on the run, left at Midtstuen.
      const hx = v.him.x;
      const s = v.grounds as Ride | null;
      if (hx < RIDE.from) sledgeAt(RIDE.from + 8, trackY(RIDE.from + 8)!);
      else if (hx >= RIDE.to) sledgeAt(RIDE.to - 10, END_ROW * TILE);
      else {
        const feet = Math.round(v.him.y + PLAYER.h / 2);
        sledgeAt(Math.round(hx), feet + 1);
        if (s?.duck) lyingBack(Math.round(hx), feet + 1);
        // The speed lines behind him, off with reduced motion.
        if (!view.reduced && speedAt(hx) >= 1.5) for (let k = 0; k < 3; k++) R(Math.round(hx) - 16 - k * 7 - ((v.t * 3) % 7), feet - 4 - k * 4, 6, 1, mix(K.bank, WHITE, 0.5));
      }
    },
    ground: () => ({ top: K.bank, dot: K.runGroove, fill: K.slope, kind: "snow" }),
    tile(t, c, r, x, y, map) {
      if (t !== "#") return false;
      // Snow: a bright crust, drifts and footprints at the top, shading and a buried stone below.
      const top = !map.isSolid(c, r - 1);
      if (!top) {
        snowBody(c, r, x, y);
        return true;
      }
      // Its top from the textured set (order 26): a bright crust with sparkles, wind-packed layers, a blue shadow side.
      textured(CRUST, c, r, x, y, map, null);
      if (c % 5 === 2) R(x + 2, y - 3, 10, 3, K.bank);
      return true;
    },
    ledges: { "=": PORCH },
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look !== "sledger") return drawLook(e, v.t);
      sledgerArt(e, v);
      return true;
    },
    shot: (s, v) => drawLookShot(s, v.enemies[s.by]?.def.look)
  }
};

