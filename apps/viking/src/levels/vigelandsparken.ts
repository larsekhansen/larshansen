import { box, column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef, Lift } from "@larshansen/pixelkit/carrier";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, LAND, PALETTE, PLANTS, STONE, WHITE } from "@larshansen/pixelkit/palette";
import type { Carrier } from "@larshansen/pixelkit/physics";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import * as V from "@larshansen/pixelkit/swatches/park";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { leap, windingUp, type Enemy, type EnemyDef, type Shot } from "../game/enemies";
import type { Play } from "../game/play";
import { drawOsloHills } from "../render/backdrop";
import { tbaneDoor } from "../render/furniture";
import { drawLook } from "../render/looks";
import { clock, parts } from "../alive/parts";
import { plain } from "../render/sprite";
import { mapBuilder } from "./build";
import type { BellLedge, LevelDef, LevelRules, View } from "./types";
import { spedX } from "../alive/depth";

// Level 12, rune I: Vigelandsparken, by day, eerie and funny. Its one idea: the statues move only while
// his back is turned. A statue walks toward him while he faces away from it, and is stone (harmless,
// and solid to stand on) while he faces it. Looking is his facing, nothing more; there is no timing.
//
//   #  gravel and lawn   G  granite: the bridge, the pergola, the walls, the plateau and its steps
//   =  the Monolith's figures, a stair of limbs   -  the fountain's bowl   ~  the pond, the basin
//   t  T-banen   b  bench   $  skilling   &  brown cheese
//
// Sections: the gate from Kirkeveien and the first statue alone on the lawn (the park is quiet); the
// bridge with its bronze figures, the Angry Boy stamping on his post until the loose slab over the
// broken span drops; the fountain, whose jets lift him to the giants' bowl; the rose garden with a
// statue at each end (watch the one ahead, and climb it); the courtyard where a statue has to be led
// to the wall by turning his back on it; the Monolith, climbed by its figures; the plateau, where the
// granite groups throw rings (the shield); and the rune in the Wheel of Life.

const COLS = 250;
const ROWS = 24;
/** The ground and the bridge's deck: the top of row 20. */
export const W = 20;
const FLOOR = W * TILE;
const b = mapBuilder(COLS, ROWS);
const water = (c0: number, c1: number) => b.fill(c0, c1, W, W + 1, "~").ground(c0, c1, W + 2);

// --- Kirkeveien, the gate, the lawn -----------------------------------------------------------------
b.ground(0, 34, W);
// --- The bridge over the pond: granite, broken in the middle where the slabs have shaken loose -------
b.ground(35, 82, W, "G");
water(56, 60);
// --- The fountain: its rim, the basin, the giants' bowl, the upper basin ------------------------------
b.ground(83, 88, W);
water(89, 103);
b.run(90, 101, W - 5, "-");
b.run(95, 97, W - 7, "-");
b.ground(104, 249, W);
// --- The rose garden's pergola, and the courtyard's far wall -----------------------------------------
b.fill(134, 137, W - 3, W - 1, "G");
b.fill(154, 158, W - 3, W - 1, "G");
// --- The Monolith: a stair of figures up its side, onto the plateau ------------------------------------
b.run(171, 174, W - 2, "=").run(176, 179, W - 4, "=").run(171, 174, W - 6, "=").run(176, 180, W - 8, "=");
b.fill(182, 212, W - 8, W - 1, "G");
// --- The plateau's steps down to the Wheel of Life, and its high plinth (a ledge on a beat the step up) ---
b.fill(213, 215, W - 6, W - 1, "G").fill(216, 218, W - 4, W - 1, "G").fill(219, 221, W - 2, W - 1, "G");
b.fill(235, COLS - 1, W - 3, W - 1, "G");

// Marks: the start, the door, signs, flags, benches, the rune, the bracteate, the cheese.
b.put(2, W - 1, "t").put(4, W - 1, "S");
b.put(9, W - 1, "i").put(51, W - 1, "i").put(168, W - 1, "i");
b.put(33, W - 1, "f").put(53, W - 1, "f").put(82, W - 1, "f").put(109, W - 1, "f").put(135, W - 4, "f").put(157, W - 4, "f").put(169, W - 1, "f").put(188, W - 9, "f").put(216, W - 5, "f");
b.put(112, W - 1, "b");
b.put(240, W - 4, "r").put(178, W - 13, "o").put(96, W - 8, "&");

// Skilling: along the path from the gate, over the first statue, along the bridge and over the broken
// span, up the jets and across the bowl, through the rose garden and over the pergola, the courtyard,
// up the Monolith's figures, across the plateau and down its steps to the wheel.
const COINS: [number, number][] = [
  [7, 19], [12, 19], [15, 19],
  [21, 17], [23, 16], [25, 17],
  [30, 19], [38, 19], [41, 19], [47, 19],
  [56, 17], [57, 16], [59, 16], [60, 17],
  [66, 19], [75, 19], [78, 19],
  [87, 14], [88, 13],
  [92, 14], [94, 14], [98, 14], [100, 14],
  [102, 17], [110, 19],
  [116, 19], [120, 19], [127, 19],
  [135, 15], [136, 15],
  [143, 19], [146, 19], [150, 19],
  [155, 15], [156, 15],
  [162, 19], [173, 17], [177, 15], [173, 13], [178, 11],
  [184, 11], [186, 11], [192, 11], [200, 11], [208, 11], [211, 11],
  [214, 13], [217, 15], [220, 17],
  [225, 19], [228, 19], [231, 19], [234, 19], [244, 16], [247, 16]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- Things that move -------------------------------------------------------------------------------

/** A jet of the fountain: it rises to a stand at the top, and sinks back to the rim's height. */
const jet = (c: number, w: number, offset: number): Lift => ({ kind: "lift", x: c * TILE, w: w * TILE, bottom: FLOOR, top: FLOOR - 64, speed: 1, wait: 60, offset });
/**
 * The jet that springs from the near rim's edge and lifts whoever stands there up to the giants' bowl;
 * the wide jet under the bowl's far end, that catches him and sets him down by the far rim.
 */
export const JET_IN = jet(87, 2, 0);
export const JET_OUT = jet(101, 3, 124);
const CARRIERS: CarrierDef[] = [JET_IN, JET_OUT];

/** The Angry Boy's beat: he stamps for a second, then jumps and lands, and the loose slab drops for a while. */
export const BOY = { c: 63, period: 170 };
/**
 * The loose slab over the broken span: there from shortly after the boy lands until he jumps again
 * (his stamping included), shaking while he is in the air, and gone a while after he comes down.
 */
export const SLAB: BellLedge = { x: 57 * TILE, y: FLOOR, w: 3 * TILE, on: 90, warn: 30, off: 50, offset: 90, note: -1 };
/**
 * The step up to the Wheel of Life's plinth, a slab that comes and goes on its own beat (two seconds there,
 * a second shaking, two and a half gone): he waits at its foot between the statue behind him on the path and
 * the statue ahead of him on the plinth, and can face only one of them at a time.
 */
export const STEP: BellLedge = { x: 233 * TILE, y: FLOOR - 2 * TILE, w: 2 * TILE, on: 120, warn: 60, off: 150, offset: 40, note: -1 };

// --- The statues ------------------------------------------------------------------------------------

/** Statues are granite (`statue`) or, on the bridge, bronze (`bronze`): the same rule for both. */
export const isStatue = (e: { def: EnemyDef }) => e.def.look === "statue" || e.def.look === "bronze";

/** He looks at it: it is in front of him, or under him (his body over its body). */
export const watched = (e: Enemy, p: Play) => (e.x - (p.body.x + PLAYER.w / 2)) * p.body.facing > -(e.w / 2 + PLAYER.w / 2);

/**
 * One step of a statue. While he looks at it, it is stone: still, harmless, ground to stand on.
 * While his back is turned, it walks toward him, as far as its patrol, its ground and the walls allow.
 */
function statue(e: Enemy, p: Play) {
  e.calm = watched(e, p);
  if (e.calm) return;
  const map = p.map;
  const hx = p.body.x + PLAYER.w / 2;
  const dir = hx < e.x ? -1 : 1;
  e.dir = dir;
  const speed = e.def.speed ?? 0.5;
  const ahead = e.x + dir * (e.w / 2 + speed);
  const c = Math.floor(ahead / TILE);
  const r = Math.round(e.y / TILE);
  const ground = (map.isSolid(c, r) || map.isOneWay(c, r)) && !map.isSolid(c, r - 1);
  if (Math.abs(ahead - e.home) > (e.def.range ?? 0) * TILE || !ground || Math.abs(hx - e.x) < speed) return;
  e.x += dir * speed;
}

/** The statues as the reach search takes them: a step anywhere along their walk. */
const statueSpans = (defs: readonly EnemyDef[]): Carrier[] =>
  defs.filter((d) => d.look === "statue" || d.look === "bronze").map((d) => {
    const w = d.w ?? 10;
    const range = (d.range ?? 0) * TILE;
    return { x: d.c * TILE + TILE / 2 - range - w / 2, y: (d.r + 1) * TILE - (d.h ?? 16), w: 2 * range + w, dx: 0, dy: 0 };
  });

/**
 * The first statue alone on the lawn; two in bronze on the bridge; the Angry Boy on his post; one at
 * each end of the rose garden; one in the courtyard to be led; pigeons, crows; on the plateau two
 * granite groups that throw rings, and they face the way he comes; and two by the Wheel of Life, one on the
 * path and one on its plinth, either side of the step up that comes and goes.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "flyer", look: "crow", c: 16, r: W - 8, range: 3, rise: 5, period: 180 },
  { kind: "spiky", look: "statue", c: 23, r: W - 1, range: 6, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "spiky", look: "bronze", c: 44, r: W - 1, range: 4, speed: 0.8, w: 10, h: 16, small: true },
  // The Angry Boy, high on his post at the far side of the broken span: he stamps, jumps and lands.
  { kind: "jumper", look: "boy", c: BOY.c, r: W - 4, rise: 18, period: BOY.period, w: 8, h: 12 },
  { kind: "spiky", look: "bronze", c: 71, r: W - 1, range: 4, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "spiky", look: "statue", c: 124, r: W - 1, range: 3, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "spiky", look: "statue", c: 133, r: W - 1, range: 1, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "spiky", look: "statue", c: 146, r: W - 1, range: 7, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "walker", look: "pigeon", c: 161, r: W - 1, range: 2 },
  { kind: "flyer", look: "crow", c: 165, r: W - 6, range: 2, rise: 6, period: 170 },
  { kind: "flyer", look: "crow", c: 187, r: W - 13, range: 3, rise: 5, period: 190 },
  // High on their pedestals over the plateau's path, facing the way he comes; their beats chosen (by a
  // search over every pair) so that a man who walks on across the plateau is hit about four times in five.
  { kind: "thrower", look: "ringer", c: 196, r: W - 12, period: 130, lead: true, faces: -1 },
  { kind: "thrower", look: "ringer", c: 205, r: W - 12, period: 130, offset: 100, lead: true, faces: -1 },
  // The way to the Wheel of Life: one on the path behind him as he waits for the step, one on the plinth ahead.
  { kind: "spiky", look: "statue", c: 227, r: W - 1, range: 5, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "spiky", look: "statue", c: 239, r: W - 4, range: 3, speed: 0.8, w: 10, h: 16, small: true },
  { kind: "flyer", look: "crow", c: 229, r: W - 7, range: 3, rise: 6, period: 150 }
];

export const RULES: LevelRules = {
  enemy(e, p) {
    if (!isStatue(e)) return false;
    statue(e, p);
    return true;
  },
  // A statue he looks at is stone: in his way, as a wall is, and its top is ground.
  after(p) {
    const b = p.body;
    for (const e of p.enemies) {
      if (!e.alive || !e.calm || !isStatue(e)) continue;
      const x = e.x - e.w / 2;
      if (b.x + PLAYER.w > x && b.x < x + e.w && b.y + PLAYER.h > e.y - e.h + 2 && b.y < e.y) {
        b.x = b.x + PLAYER.w / 2 < e.x ? x - PLAYER.w : x + e.w;
        b.vx = 0;
      }
    }
  },
  ground: (p) => p.enemies.filter((e) => e.alive && e.calm && isStatue(e)).map((e) => ({ x: e.x - e.w / 2, y: e.y - e.h, w: e.w, dx: 0, dy: 0 })),
  everywhere: (def) => statueSpans(def.enemies ?? [])
};

export const VIGELAND_RULES = { COLS, ROWS, CARRIERS, SLAB, STEP };

// --- Art ----------------------------------------------------------------------------------------------
const P = PALETTE;

/** Frogner behind the trees, far: apartment blocks in pale rows, a church spire, the hills over them. */
function farTown() {
  const base = FLOOR - 30;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    const h = 10 + Math.round(4 * Math.sin(wx * 0.07) + 3 * Math.sin(wx * 0.19));
    column(x, base - h, base, mix(LAND.farHills, STONE.light, 0.45));
    if (Math.floor(wx) % 9 < 2 && Math.floor(wx / 37) % 2) column(x, base - h + 3, base - h + 4, mix(LAND.farHills, WHITE, 0.35));
    const k = ((Math.floor(wx) % 640) + 640) % 640;
    if (k >= 400 && k < 404) column(x, base - h - 22 + Math.abs(k - 402) * 4, base - h, mix(STONE.dark, LAND.farHills, 0.4));
  }
}

/** The park's tall trees behind the paths, round-crowned limes and maples in rows, now and then a lamp. */
function parkTrees(factor: number, foot: number, n: number, fade: number) {
  for (const far of [true, false]) for (let i = 0; i < n; i++) {
    // Every other one a little farther, slower, and drawn first (order 23: more speeds, split from what the layer has).
    if ((i % 2 === 1) !== far) continue;
    const wx = i * 44 + ((i * 29) % 21);
    const x = spedX(far ? (wx * factor) / (factor * 0.75) : wx, far ? (factor * 0.75) : factor, factor);
    if (x < -30 || x > view.w + 30) continue;
    const h = 22 + ((i * 13) % 14);
    const r = 11 + ((i * 7) % 5);
    box(x, foot - h, 3, h, mix(PLANTS.bark, LAND.farHills, fade));
    for (let yy = -r; yy <= r; yy++) {
      const half = Math.floor(r * Math.sqrt(1 - (yy * yy) / (r * r)) * 1.15);
      box(x + 1 - half, foot - h - r + 5 + yy, half * 2, 1, mix(yy < -r / 3 ? V.limeShine : yy > r / 2 ? V.limeDark : V.lime, LAND.farHills, fade));
    }
  }
}

/** A figure in granite or bronze, 10 wide and 16 high, feet at (x, y): a pose for each, its arms and legs drawn plainly. */
function figure(x: number, y: number, pose: number, face: 1 | -1, stone: { base: string; light: string; shade: string }, walk = 0) {
  const f = face > 0;
  // Legs: apart and still, or a stride while it walks.
  const stride = walk ? [1, 2, -1, -2][Math.floor(walk / 6) % 4] : 0;
  R(x + 2 + stride, y - 6, 2, 6, stone.shade);
  R(x + 6 - stride, y - 6, 2, 6, stone.base);
  // The body, a little turned, lit from the left.
  R(x + 2, y - 12, 6, 6, stone.base);
  R(x + 2, y - 12, 1, 6, stone.light);
  R(x + 7, y - 12, 1, 6, stone.shade);
  // The head.
  R(x + 3, y - 16, 4, 4, stone.base);
  R(x + 3, y - 16, 1, 3, stone.light);
  R(f ? x + 6 : x + 3, y - 14, 1, 1, stone.shade);
  // Arms, by pose: raised, crossed, one reaching, hands on knees.
  switch (pose % 4) {
    case 0:
      R(x, y - 18, 2, 7, stone.base);
      R(x + 8, y - 18, 2, 7, stone.shade);
      break;
    case 1:
      R(x + 1, y - 10, 8, 2, stone.light);
      break;
    case 2:
      R(f ? x + 8 : x - 2, y - 13, 4, 2, stone.base);
      R(f ? x : x + 8, y - 11, 2, 5, stone.shade);
      break;
    default:
      R(x + 1, y - 11, 2, 5, stone.base);
      R(x + 7, y - 11, 2, 5, stone.shade);
  }
}

const GRANITE = { base: V.granite, light: V.graniteLight, shade: V.graniteShade };
const BRONZE = { base: V.bronze, light: V.bronzeLight, shade: V.bronzeDark };
/** A statue walking, in the enemy's colours (order 18): granite plum, bronze orange. */
const WOKEN_GRANITE = { base: ENEMY.plum, light: ENEMY.plumLight, shade: ENEMY.plum };
const WOKEN_BRONZE = { base: ENEMY.orange, light: ENEMY.orangeLight, shade: ENEMY.orange };

/** Kirkeveien and the main gate: granite pillars, the wrought-iron gates folded open, lanterns on top. */
function gate(v: View) {
  tbaneDoor(v.doors.get("tbane"));
  const x = 11 * TILE;
  for (const px of [x, x + 52]) {
    R(px, FLOOR - 46, 12, 46, V.granite);
    R(px, FLOOR - 46, 12, 2, V.graniteLight);
    R(px + 11, FLOOR - 44, 1, 44, V.graniteShade);
    R(px - 2, FLOOR - 50, 16, 4, V.graniteShade);
    // The lantern on top, lit.
    R(px + 3, FLOOR - 60, 6, 10, V.iron);
    R(px + 4, FLOOR - 58, 4, 6, mix(P.sail, WHITE, 0.3));
    light(px + 4, FLOOR - 58, 4, 6, "lamp");
  }
  // The gates folded back against the pillars: black bars, scrolls, gilt tips.
  for (const [gx, d] of [[x + 12, 1], [x + 40, -1]] as const) {
    for (let k = 0; k < 4; k++) {
      const bx = gx + d * k * 3 + (d < 0 ? -1 : 0);
      R(bx, FLOOR - 38, 1, 38, V.iron);
      R(bx, FLOOR - 40, 1, 2, V.ironTip);
    }
    R(Math.min(gx, gx + d * 9), FLOOR - 30, 10, 1, V.iron);
    R(Math.min(gx, gx + d * 9), FLOOR - 12, 10, 1, V.iron);
  }
  // The path's gravel border.
  R(0, FLOOR, 35 * TILE, 2, V.gravelDark);
}

/** The bridge: granite parapets with a bronze figure on every post, lamps between, the pond under it. */
function bridge() {
  const x0 = 35 * TILE;
  const x1 = 83 * TILE;
  // The pond, from bank to bank, under the bridge: the same water as in the broken span.
  R(x0 - 16, FLOOR + 6, x1 - x0 + 32, 80, P.water);
  R(x0 - 16, FLOOR + 40, x1 - x0 + 32, 46, "#2b6a8e"); // deep water, not his tunic's blue (order 18)
  for (let x = x0 - 16; x < x1 + 16; x += 7) R(x, FLOOR + 10 + ((x * 3) % 9), 4, 1, mix(P.water, WHITE, 0.25));
  // The far parapet behind the deck: a low granite wall, posts with figures, a lamp every few posts.
  R(x0, FLOOR - 14, x1 - x0, 14, V.graniteShade);
  R(x0, FLOOR - 14, x1 - x0, 2, V.graniteLight);
  for (let px = x0 + 8, i = 0; px < x1 - 8; px += 36, i++) {
    if (px > 55 * TILE && px < 61 * TILE) continue;
    R(px, FLOOR - 20, 8, 20, V.granite);
    R(px, FLOOR - 20, 8, 1, V.graniteLight);
    figure(px - 1, FLOOR - 20, i, i % 2 ? 1 : -1, BRONZE);
    if (i % 3 === 1) {
      R(px + 22, FLOOR - 40, 2, 26, V.iron);
      R(px + 19, FLOOR - 44, 8, 5, V.iron);
      R(px + 20, FLOOR - 43, 6, 3, mix(P.sail, WHITE, 0.3));
      light(px + 20, FLOOR - 43, 6, 3, "lamp");
    }
  }
  // The broken span: the parapet gone, the slabs' sockets showing, a fence of rope on posts either side.
  for (const ex of [56 * TILE - 2, 61 * TILE - 2]) {
    R(ex, FLOOR - 12, 4, 12, V.graniteDark);
    R(ex, FLOOR - 12, 4, 1, V.graniteLight);
  }
  for (let k = 0; k < 5 * TILE; k++) R(56 * TILE + k, FLOOR - 10 + Math.round(Math.sin((k / (5 * TILE)) * Math.PI) * 4), 1, 1, P.sailStripe);
  // The Angry Boy's post: tall granite, at the far side of the broken span.
  const bx = BOY.c * TILE + 2;
  R(bx, FLOOR - 48, 12, 48, V.granite);
  R(bx, FLOOR - 48, 12, 2, V.graniteLight);
  R(bx + 11, FLOOR - 46, 1, 46, V.graniteShade);
  for (let y = FLOOR - 40; y < FLOOR; y += 10) R(bx, y, 12, 1, V.graniteShade);
}

/** A granite tile: the bridge's deck, the walls, the plateau. Faces in courses, the top lit. */
function granite(c: number, r: number, x: number, y: number, map: { isSolid(c: number, r: number): boolean }) {
  // Under the bridge's deck nothing is drawn but the pond and the arches.
  if (c >= 35 && c <= 82 && r > W) {
    if (r === W + 1) {
      R(x, y, TILE, 4, V.graniteShade);
      if (c % 6 === 2) R(x + 4, y, 8, 16, V.graniteDark);
    }
    return;
  }
  const top = !map.isSolid(c, r - 1);
  // Lower courses of a tall wall are in shade, the soil's damp creeping up the last.
  let down = 0;
  while (down < 8 && map.isSolid(c, r - down - 1)) down++;
  const base = mix((c + r) % 2 ? V.granite : mix(V.granite, V.graniteShade, 0.4), V.graniteDark, Math.min(0.5, down * 0.07));
  R(x, y, TILE, TILE, base);
  R(x, y + 15, TILE, 1, V.graniteShade);
  R(x + ((r % 2) * 8), y, 1, TILE, V.graniteShade);
  if (top) {
    R(x, y, TILE, 2, V.graniteLight);
    R(x, y + 2, TILE, 1, V.graniteShade);
  }
  // The plateau's face: a band of reliefs, figures in a row, a course down from the top.
  if (c >= 182 && c <= 212 && r === W - 6) figure(x + 3, y + 15, c, c % 2 ? 1 : -1, { base: mix(base, V.graniteShade, 0.6), light: base, shade: V.graniteDark });
  if (r === W - 1 && c >= 182) R(x, y + 12, TILE, 4, mix(base, V.limeDark, 0.35));
}

/** The park's ground: a gravel path on top, lawn under its edge, then soil with stones and roots, darker deeper down. */
function lawn(c: number, r: number, x: number, y: number, map: { isSolid(c: number, r: number): boolean }) {
  const depth = r - W;
  // The path's row is the path, under a wall too (the wall stands on it).
  const top = !map.isSolid(c, r - 1) || depth === 0;
  if (top) {
    R(x, y, TILE, 4, V.gravel);
    R(x, y, TILE, 1, mix(V.gravel, WHITE, 0.4));
    R(x + ((c * 7) % 13), y + 1, 2, 1, V.gravelDark);
    R(x + ((c * 3) % 11) + 2, y + 3, 1, 1, V.gravelDark);
    R(x, y + 4, TILE, 12, V.lime);
    for (let k = 0; k < 4; k++) R(x + ((c * 5 + k * 4) % 15), y + 5 + (k % 2), 1, 2, k % 2 ? V.limeShine : V.limeDark);
    if (c % 9 === 4) {
      R(x + 6, y + 7, 2, 2, c % 2 ? V.roseLight : WHITE);
      R(x + 7, y + 9, 1, 2, V.roseLeaf);
    }
    R(x, y + 14, TILE, 2, V.limeDark);
    return;
  }
  const soil = mix(P.earth, INK, Math.min(0.35, depth * 0.08));
  R(x, y, TILE, TILE, soil);
  if (depth === 1) for (let k = 0; k < 3; k++) R(x + ((c * 5 + k * 6) % 14), y + k * 4, 1, 3, mix(V.limeDark, P.earth, 0.5));
  if ((c * 13 + r * 7) % 5 === 0) {
    R(x + ((c * 3) % 9) + 2, y + 5 + (r % 3) * 2, 4, 3, mix(STONE.base, soil, 0.35));
    R(x + ((c * 3) % 9) + 2, y + 5 + (r % 3) * 2, 4, 1, mix(STONE.light, soil, 0.25));
  }
  if ((c + r) % 4 === 1) R(x + ((c * 11) % 13), y + ((r * 5) % 12), 2, 1, mix(soil, WHITE, 0.15));
}

/** The loose slab over the broken span, shaking while the boy is in the air; its iron brackets stay. */
function slab(t: number) {
  const phase = timedPhase(t, SLAB);
  R(SLAB.x + 2, SLAB.y + 6, 3, 2, P.ironDark);
  R(SLAB.x + SLAB.w - 5, SLAB.y + 6, 3, 2, P.ironDark);
  if (phase === "off") return;
  const shake = phase === "warn" && !view.reduced ? (Math.floor(t / 3) % 2 ? 1 : -1) : 0;
  const x = SLAB.x + shake;
  R(x, SLAB.y, SLAB.w, 6, V.granite);
  R(x, SLAB.y, SLAB.w, 1, V.graniteLight);
  R(x, SLAB.y + 5, SLAB.w, 1, V.graniteDark);
  R(x + 15, SLAB.y + 1, 1, 4, V.graniteShade);
  if (phase === "warn") {
    // Cracks open along its edges, and grit falls.
    R(x + 4, SLAB.y + 2, 6, 1, V.graniteDark);
    R(x + 20, SLAB.y + 3, 7, 1, V.graniteDark);
    if (!view.reduced) for (let k = 0; k < 3; k++) R(x + 6 + k * 9, SLAB.y + 7 + ((t + k * 4) % 8), 1, 1, V.graniteShade);
  }
}

/** The Angry Boy on his post, in the enemy's red: stamping, fists up, then the leap. 10 x 15. */
function angryBoy(e: Enemy, t: number) {
  const r = parts(e, 10);
  const { up, ripple } = leap(e, t);
  // Stamping: one foot up, then the other, faster as the jump comes.
  const stamp = ripple && !view.reduced ? Math.floor(t / 5) % 2 : 0;
  r(1, -5 + (stamp ? -2 : 0), 3, 5, ENEMY.orange);
  r(6, -5 + (stamp ? 0 : ripple ? -2 : 0), 3, 5, ENEMY.orange);
  r(1, -11, 8, 6, ENEMY.orange);
  r(1, -11, 1, 6, ENEMY.orangeLight);
  r(2, -15, 6, 4, ENEMY.orange);
  r(2, -15, 6, 1, ENEMY.orangeLight);
  // Fists: down at his sides, up and shaking while he stamps, over his head in the air.
  const fy = up > 0 ? -17 : ripple ? -13 : -9;
  r(-2, fy, 3, 3, ENEMY.orange);
  r(9, fy, 3, 3, ENEMY.orange);
  // His face screwed up.
  r(3, -13, 1, 1, ENEMY.eye);
  r(6, -13, 1, 1, ENEMY.eye);
  // Landed: dust off the post.
  if (!view.reduced && up === 0 && !ripple) {
    const since = ((t % BOY.period) + BOY.period) % BOY.period;
    const air = Math.round(2 * Math.sqrt((2 * 18) / 0.16));
    const x = Math.round(e.x - 5);
    const y = Math.round(e.y);
    if (since >= air && since < air + 12) plain(() => [0, 1, 2].forEach((k) => R(x - 3 + k * 7, y - 1 - (since - air) / 3, 1, 1, V.graniteLight)));
  }
}

/** The fountain: the basin's rim, six giants holding up the bowl, reliefs round the basin, its water. */
function fountain() {
  const x0 = 88 * TILE;
  const x1 = 104 * TILE;
  // The basin's wall, in reliefs, below the water line.
  R(x0, FLOOR + 6, x1 - x0, 60, V.graniteShade);
  for (let x = x0 + 6; x < x1 - 6; x += 22) figure(x, FLOOR + 30, x / 22, 1, { base: V.graniteDark, light: V.graniteShade, shade: mix(V.graniteDark, INK, 0.2) });
  // The giants, three each side of the bowl's stem, holding it up over their heads.
  const bx = 90 * TILE;
  const bw = 12 * TILE;
  for (let k = 0; k < 6; k++) {
    const gx = bx + 14 + k * 26;
    // A giant: legs apart down to the basin, a broad back, arms up under the bowl, head bowed.
    R(gx, FLOOR - 30, 4, 34, V.graniteShade);
    R(gx + 9, FLOOR - 30, 4, 34, V.granite);
    R(gx, FLOOR - 58, 13, 30, V.granite);
    R(gx, FLOOR - 58, 2, 30, V.graniteLight);
    R(gx + 11, FLOOR - 58, 2, 30, V.graniteShade);
    R(gx + 4, FLOOR - 66, 6, 7, V.granite);
    R(gx + 4, FLOOR - 66, 2, 6, V.graniteLight);
    R(gx - 1, FLOOR - 76, 3, 20, V.graniteShade);
    R(gx + 11, FLOOR - 76, 3, 20, V.graniteShade);
  }
  // The stem and the bowl's underside.
  R(bx + bw / 2 - 6, FLOOR - 76, 12, 76, V.graniteShade);
  for (let i = 0; i < 6; i++) R(bx + i * 3, FLOOR - 76 + i, bw - i * 6, 1, mix(V.graniteShade, INK, 0.1 + i * 0.03));
  // The upper basin on its column, water spilling from it.
  R(95 * TILE + 18, FLOOR - 104, 12, 24, V.granite);
  if (!view.reduced) for (let k = 0; k < 4; k++) R(95 * TILE + 2 + k * 14, FLOOR - 108, 2, 30, V.jetShade);
}

/** A jet of the fountain: a column of water from the basin up to its top, foam on the stand. */
function jetArt(at: { x: number; y: number }, t: number) {
  const { x, y } = at;
  const w = 2 * TILE;
  for (let yy = y + 4; yy < FLOOR + 4; yy++) {
    const wob = view.reduced ? 0 : Math.round(Math.sin(yy * 0.4 + t * 0.3));
    R(x + 4 + wob, yy, w - 8, 1, (yy + Math.floor(t / 2)) % 5 ? V.jet : V.jetShade);
  }
  // The stand at the top: foam he can stand on.
  R(x, y, w, 4, V.jet);
  R(x, y, w, 1, WHITE);
  R(x + 2, y + 4, w - 4, 1, V.jetShade);
  if (!view.reduced) for (let k = 0; k < 4; k++) R(x + 3 + k * 8, y - 2 - ((t + k * 3) % 4), 1, 1, WHITE);
}

/** The rose garden: beds of roses in rows, low hedges, the pergola of granite with roses over it. */
function roseGarden() {
  for (let x = 114 * TILE; x < 134 * TILE; x += 14) {
    R(x, FLOOR - 6, 12, 6, V.roseLeaf);
    for (let k = 0; k < 5; k++) R(x + 1 + k * 2, FLOOR - 6 - (k % 2), 2, 2, k % 2 ? V.rose : V.roseLight);
  }
  // The pergola's posts and its beams with roses, behind and over the granite wall he climbs.
  const px = 134 * TILE;
  for (const dx of [0, 52]) {
    R(px + dx, FLOOR - 74, 6, 26, V.granite);
    R(px + dx, FLOOR - 74, 1, 26, V.graniteLight);
  }
  R(px - 6, FLOOR - 78, 70, 5, V.graniteShade);
  for (let k = 0; k < 70; k += 3) R(px - 6 + k, FLOOR - 80 - (k % 2), 2, 2, k % 4 ? V.rose : V.roseLeaf);
  // The courtyard's hedges, clipped, behind.
  R(138 * TILE, FLOOR - 26, 16 * TILE, 26, PLANTS.hedge);
  R(138 * TILE, FLOOR - 26, 16 * TILE, 2, PLANTS.hedgeTop);
  for (let x = 138 * TILE; x < 154 * TILE; x += 9) R(x, FLOOR - 22, 1, 22, PLANTS.hedgeDark);
}

/** The Monolith: one column of granite, a hundred and twenty-one figures climbing it, on its steps. */
function monolith() {
  const cx = 175 * TILE + 8;
  const top = FLOOR - 9 * TILE;
  const w = 26;
  // Its steps.
  for (let k = 0; k < 3; k++) R(cx - 36 + k * 6, FLOOR - 4 - k * 4, 72 - k * 12, 4, k % 2 ? V.graniteShade : V.granite);
  // The column, narrowing a little, its tip rounded.
  for (let y = top; y < FLOOR - 12; y++) {
    const half = Math.round(w / 2 - (FLOOR - y) / 60);
    R(cx - half, y, half * 2, 1, V.granite);
    R(cx - half, y, 2, 1, V.graniteLight);
    R(cx + half - 2, y, 2, 1, V.graniteShade);
  }
  for (let k = 0; k < 6; k++) R(cx - 8 + k, top - 6 + Math.abs(k - 3), 16 - k * 2, 1, V.graniteLight);
  // Under each of the figures he climbs, the body it belongs to: lying out from the column, head out.
  for (const [c0, c1, r] of [[171, 174, W - 2], [176, 179, W - 4], [171, 174, W - 6], [176, 180, W - 8]] as const) {
    const y = r * TILE + 4;
    const left = c0 < 175;
    const x0 = c0 * TILE;
    const x1 = (c1 + 1) * TILE;
    R(x0 + 2, y, x1 - x0 - 4, 4, V.graniteShade);
    R(left ? x0 + 1 : x1 - 6, y - 1, 5, 5, V.granite);
    R(left ? x0 + 2 : x1 - 5, y, 2, 2, V.graniteDark);
    for (let k = 6; k < x1 - x0 - 8; k += 7) R(x0 + k, y + 4, 2, 4, V.graniteShade);
  }
  // The figures in it: bodies over bodies, heads and limbs in shade.
  for (let y = top + 4, i = 0; y < FLOOR - 16; y += 9, i++)
    for (let k = 0; k < 4; k++) {
      const fx = cx - 11 + k * 6 + (i % 2) * 3;
      R(fx, y, 3, 3, V.graniteShade);
      R(fx + 1, y + 3, 2, 5, mix(V.granite, V.graniteShade, 0.5));
    }
}

/** The plateau: its granite groups on plinths along the back, and the steps' shading. */
function plateau() {
  for (let x = 183 * TILE; x < 212 * TILE; x += 40) {
    R(x, FLOOR - 8 * TILE - 10, 22, 10, V.graniteShade);
    figure(x + 1, FLOOR - 8 * TILE - 10, x / 40, 1, GRANITE);
    figure(x + 11, FLOOR - 8 * TILE - 10, x / 40 + 1, -1, GRANITE);
  }
}

/** The step up to the plinth: a granite slab on iron brackets, shaking before it goes, gone a while. */
function step(t: number) {
  const phase = timedPhase(t, STEP);
  R(STEP.x + 2, STEP.y + 6, 3, 2, P.ironDark);
  R(STEP.x + STEP.w - 5, STEP.y + 6, 3, 2, P.ironDark);
  if (phase === "off") return;
  const shake = phase === "warn" && !view.reduced ? (Math.floor(t / 3) % 2 ? 1 : -1) : 0;
  R(STEP.x + shake, STEP.y, STEP.w, 6, V.granite);
  R(STEP.x + shake, STEP.y, STEP.w, 1, V.graniteLight);
  R(STEP.x + shake, STEP.y + 5, STEP.w, 1, V.graniteDark);
  if (phase === "warn" && view.reduced) R(STEP.x, STEP.y + 2, STEP.w, 1, V.graniteShade);
}

/** The Wheel of Life: a ring of figures holding one another, on its plinth, the rune inside it. */
function wheel(t: number) {
  const cx = 240 * TILE + 8;
  const cy = FLOOR - 4 * TILE - 2;
  const r = 30;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + (view.reduced ? 0 : 0);
    const x = Math.round(cx + Math.cos(a) * r);
    const y = Math.round(cy + Math.sin(a) * r);
    R(x - 2, y - 2, 5, 5, i % 2 ? V.granite : V.graniteShade);
    R(x - 1, y - 2, 2, 1, V.graniteLight);
  }
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    R(Math.round(cx + Math.cos(a) * (r - 4)), Math.round(cy + Math.sin(a) * (r - 4)), 1, 1, V.graniteShade);
  }
  void t;
}

/**
 * A statue on the path. Watched, it is stone: harmless for now, outlined in the calm pale (order 22; the page
 * outlines it so while it is calm). Walking, it is in the enemy's colours (granite plum, bronze orange) with its
 * eyes open and dust at its feet, outlined in the warning red: the change of outline is its tell. Its box is the
 * one it had (its head is a step he stands on), and so is its size.
 */
function statueArt(e: Enemy, v: View) {
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  const bronze = e.def.look === "bronze";
  if (e.calm) return figure(x, y, e.def.c, e.dir, bronze ? BRONZE : GRANITE);
  figure(x, y, e.def.c, e.dir, bronze ? WOKEN_BRONZE : WOKEN_GRANITE, view.reduced ? 0 : Math.round(e.x * 2));
  R(e.dir > 0 ? x + 6 : x + 3, y - 14, 1, 1, ENEMY.eye);
  if (!view.reduced) plain(() => R(x + (Math.floor(v.t / 4) % 2 ? 1 : 7), y - 1, 2, 1, V.gravelDark));
}

/** A ring-thrower: a woken figure on its pedestal (the pedestal is stone, not outlined), a ring raised. */
function ringer(e: Enemy, t: number) {
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  // The pedestal, down to the plateau behind the path.
  plain(() => {
    R(x - 1, y, 12, FLOOR - 8 * TILE - y, V.graniteShade);
    R(x - 1, y, 1, FLOOR - 8 * TILE - y, V.graniteLight);
    for (let yy = y + 8; yy < FLOOR - 8 * TILE; yy += 12) R(x - 1, yy, 12, 1, V.graniteDark);
    R(x - 2, y - 2, 14, 2, V.graniteShade);
  });
  // Its breath between throws (order 23): down a pixel every other second, on its own clock.
  const b = windingUp(e, t) ? 0 : Math.floor((clock.t + (e.def.offset ?? 0)) / 60) % 2;
  figure(x, y - 2 + b, 3, e.dir, WOKEN_GRANITE);
  R(e.dir > 0 ? x + 6 : x + 3, y - 16 + b, 1, 1, ENEMY.eye);
  // Winding up, its arm goes up with the ring over its head (order 19: a change of outline).
  if (windingUp(e, t)) {
    R(e.dir > 0 ? x + 7 : x + 2, y - 22, 1, 6, WOKEN_GRANITE.base);
    ring(x + 2, y - 24);
  }
}

function ring(x: number, y: number) {
  R(x + 1, y, 4, 1, ENEMY.poisonLight);
  R(x, y + 1, 1, 4, ENEMY.poison);
  R(x + 5, y + 1, 1, 4, ENEMY.poison);
  R(x + 1, y + 5, 4, 1, ENEMY.poison);
}

const LIMBS: LedgeLook = { body: V.granite, top: V.graniteLight, edge: V.graniteShade, joint: V.graniteShade };
const BOWL: LedgeLook = { body: V.granite, top: V.graniteLight, edge: V.graniteDark, joint: V.graniteShade };

export const VIGELANDSPARKEN: LevelDef = {
  id: "vigelandsparken",
  rune: 11,
  name: "Vigelandsparken",
  short: "Vigeland",
  landmark: { nb: "Skulpturene", en: "The sculptures" },
  place: { nb: "Frognerparken", en: "Frogner Park" },
  sky: "day",
  map: MAP,
  legend: { solid: "#G", oneWay: "=-", water: "~" },
  ramps: [],
  carriers: CARRIERS,
  timed: [SLAB, STEP],
  cannons: [],
  enemies: ENEMIES,
  rules: RULES,
  floor: () => (W + 4) * TILE,
  signs: [
    {
      label: { nb: "Vigelandsparken", en: "Vigelandsparken" },
      lines: { nb: ["Parken er stille i dag.", "Det er den alltid."], en: ["The park is quiet today.", "It always is."] }
    },
    {
      label: { nb: "Sinnataggen", en: "The Angry Boy" },
      lines: { nb: ["Sinnataggen har stampet her siden 1940.", "Broen holder. Stort sett."], en: ["The Angry Boy has stamped here since 1940.", "The bridge holds. Mostly."] }
    },
    {
      label: { nb: "Monolitten", en: "The Monolith" },
      lines: { nb: ["Hundre og tjueen figurer i én stein.", "De klatrer fortsatt."], en: ["A hundred and twenty-one figures in one stone.", "They are still climbing."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => {
      drawOsloHills(v.sky, FLOOR);
      farTown();
    },
    mid: () => parkTrees(0.2, FLOOR - 14, 90, 0.35),
    near: () => parkTrees(0.4, FLOOR - 4, 70, 0.12),
    back(v) {
      gate(v);
      bridge();
      fountain();
      roseGarden();
      monolith();
      plateau();
      wheel(v.t);
      step(v.t);
    },
    front(v) {
      slab(v.t);
    },
    ground: (c) => (c < 35 || (c > 82 && c < 89) || c > 103 ? { top: V.gravel, dot: V.gravelDark, fill: mix(P.earth, INK, 0.35) } : { top: V.graniteLight, dot: V.graniteShade, fill: V.graniteShade }),
    tile(t, c, r, x, y, map) {
      if (t === "#" && !map.isWater(c, r - 1) && !map.isWater(c, r - 2)) lawn(c, r, x, y, map);
      else if (t === "G") granite(c, r, x, y, map);
      else return false;
      return true;
    },
    ledges: { "=": LIMBS, "-": BOWL },
    carrier: (_i, at, v) => jetArt(at, v.t),
    timed: () => undefined,
    enemy(e, v) {
      if (!e.alive) return false;
      if (isStatue(e)) statueArt(e, v);
      else if (e.def.look === "boy") angryBoy(e, v.t);
      else if (e.def.look === "ringer") ringer(e, v.t);
      else return drawLook(e, v.t);
      return true;
    },
    shot: (s: Shot) => {
      ring(Math.round(s.x - 3), Math.round(s.y - 3));
      return true;
    }
  }
};

