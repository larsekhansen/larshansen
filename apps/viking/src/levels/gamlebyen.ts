import { column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { stamp } from "@larshansen/pixelkit/kept";
import { R, layerOrigin, light, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, PALETTE, ROLES, WHITE } from "@larshansen/pixelkit/palette";
import type { Body, Carrier } from "@larshansen/pixelkit/physics";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import * as G from "@larshansen/pixelkit/swatches/ruins";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import { keepBoxes, windingUp, type Enemy, type EnemyDef, type Shot } from "../game/enemies";
import { RUNE_CHARS } from "../game/runes";
import { SERPENT, SERPENT_STEPS, endingAge, headBox, mouth, neckX, neckUp, ringRadius, serpentBoss, tailBox, type Serpent, type SerpentDef } from "../game/serpent";
import { drawRune } from "../render/actors";
import { tbaneDoor } from "../render/furniture";
import { drawLook } from "../render/looks";
import { parts } from "../render/pickups";
import { outlined, plain } from "../render/sprite";
import { shiver } from "../render/stand";
import { mapBuilder } from "./build";
import type { Grounds, LevelDef, LevelRules, View } from "./types";

// Level 16, rune G: Gamlebyen, at night, the finale of line 2. Its one idea: the ruins rebuild as he
// passes. A ruin's missing stones rise out of the ground, as ledges and walls, when he comes within a
// few tiles, and stay; so the way forward shows itself as he goes forward. Twice a wall rises behind him
// and closes the way back (from the side he came it can still be climbed, so a fall that puts him back
// before it never leaves him stuck). By the end the town is a thousand years younger: torches for street
// lamps, a stave-built hall, longships at the quay, and the sea serpent in the harbour.
//
//   #  the street, the park, the banks   R  old stone (the ruins, the walls)   Z  a wall stone that rises
//   z  a ledge stone that rises   =  timber ledges (a stall, the hall's eaves, the prow)   J  the quay's planks
//   ~  water   t  T-banen   b  bench   $  skilling   &  brown cheese
//
// Sections: the street and the medieval park's low walls under street lamps, a dig; St. Clement's ruin,
// its stones rising as he climbs to its gable, a crypt under it; the bishop's wall, its guards stone
// until he comes near; a wall rising behind him; the water mirror where the shore was, its stepping
// stones rising; the tower that builds itself under his feet up the town wall; the archers over the wall
// walk (the shield); a wall rising behind him at the town gate; the market street by torchlight, the
// stave-built hall, a bench; the harbour and two longships to cross on; the serpent's bench, the serpent,
// and the rune G on the prow of the last longship.

const COLS = 272;
const ROWS = 24;
/** The street; the bishop's wall's top; the banks of the water mirror; the town wall's walk; the market; the quay. */
export const STREET = 19;
export const WALL = 15;
export const BANK = 17;
export const TOWN = 10;
export const MARKET = 12;
export const QUAY = 13;
const b = mapBuilder(COLS, ROWS);

// --- The street and the park: low ruined walls, a dig ------------------------------------------------------
b.ground(0, 23, STREET).ground(26, 61, STREET);
b.run(12, 13, STREET - 1, "R");
b.fill(19, 20, STREET - 2, STREET - 1, "R");
// --- St. Clement's ruin: the west wall's stub, the stones that rise inside, the east gable; the crypt -------
b.fill(34, 34, STREET - 2, STREET - 1, "R");
b.run(36, 38, STREET - 4, "z").run(40, 42, STREET - 6, "z").run(44, 46, STREET - 8, "z");
b.fill(48, 49, STREET - 10, STREET - 1, "R");
/** The crypt under the street east of the gable: a hole down, a low room, the cheese. */
export const CRYPT = 55;
b.fill(CRYPT, CRYPT, STREET, STREET + 1, ".").fill(CRYPT + 1, CRYPT + 3, STREET + 1, STREET + 1, ".");
// --- The bishop's wall, and the wall that rises behind him at its end --------------------------------------
b.fill(60, 61, STREET - 2, STREET - 1, "R");
b.ground(62, 92, WALL, "R");
/** The two walls that rise behind him, by column: from the side he came they can still be climbed. */
export const CLOSERS = [93, 176];
b.fill(93, 93, BANK - 4, BANK - 1, "Z");
// --- The water mirror where the shore was: the banks, the pool, its stepping stones ---------------------------
b.ground(93, 98, BANK).fill(99, 126, BANK, BANK + 1, "~").ground(99, 126, BANK + 2).ground(127, 137, BANK);
/**
 * The stepping stones, a row over the water: they rise as he comes. Not all alike: short hops (no gap is a
 * full jump's width), wide stones, one that rises late (only once he is at the edge of the one before, so he
 * goes on from a standstill), and a pair whose first sinks back under him a second after he lands on it.
 */
export const STEPS = [[101, 102], [105, 107], [110, 112], [115, 116], [119, 120], [123, 125]];
for (const [c0, c1] of STEPS) b.run(c0, c1, BANK - 1, "z");
/** The stone that rises late, and the one that sinks under him, by their first column. */
export const LATE = 110;
export const SINKS = 115;
// --- The town wall and its walk, the arches the archers stand on ---------------------------------------------
b.ground(138, 175, TOWN, "R");
b.run(150, 152, TOWN - 3, "R").run(162, 164, TOWN - 3, "R");
b.fill(176, 176, TOWN - 2, MARKET - 1, "Z");
// --- The market street: a stall's roof, the hall's eaves ---------------------------------------------------
b.ground(176, 212, MARKET);
b.run(188, 190, MARKET - 2, "=").run(191, 199, MARKET - 4, "=");
// --- The harbour: the quay, the basin the longships lie in, the serpent's quay, the last longship's prow -----
b.fill(213, COLS - 1, QUAY + 1, ROWS - 1, "~");
b.run(213, 221, QUAY, "J").run(236, COLS - 1, QUAY, "J");
b.run(268, 271, QUAY - 2, "=");

// Marks: the start, the door, signs, flags, benches, the rune, the bracteate, the cheese.
b.put(2, STREET - 1, "t").put(4, STREET - 1, "S");
b.put(7, STREET - 1, "i").put(30, STREET - 1, "i").put(95, BANK - 1, "i").put(239, QUAY - 1, "i");
b.put(16, STREET - 1, "f").put(52, STREET - 1, "f").put(96, BANK - 1, "f").put(139, TOWN - 1, "f").put(182, MARKET - 1, "f").put(216, QUAY - 1, "f").put(244, QUAY - 1, "f");
b.put(205, MARKET - 1, "b").put(243, QUAY - 1, "b");
b.put(270, QUAY - 3, "r").put(195, 3, "o").put(CRYPT + 3, STREET + 1, "&");

// Skilling: over the park's walls and the dig, up the church's rising stones, in the crypt, along the bishop's
// wall, over the stepping stones, up the tower, along the wall walk under the arches, over the market's roofs,
// over the longships, along the quay.
const COINS: [number, number][] = [
  [10, 18], [12, 16], [13, 16], [20, 15], [24, 16], [25, 16],
  [36, 14], [38, 14], [41, 12], [44, 10], [48, 7], [49, 7], [56, 20], [57, 20],
  [64, 13], [68, 13], [72, 13], [76, 13], [80, 13], [84, 13], [88, 13],
  [100, 15], [104, 14], [109, 14], [114, 14], [119, 14], [123, 14],
  [136, 14], [136, 12], [137, 10],
  [143, 9], [147, 9], [151, 9], [155, 9], [159, 9], [163, 9], [167, 9], [171, 9],
  [180, 11], [184, 11], [189, 8], [192, 6], [196, 6], [201, 11],
  [218, 12], [223, 11], [226, 11], [230, 11], [233, 11], [238, 12],
  [249, 12], [255, 12], [261, 12], [266, 12]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The stones that rise ----------------------------------------------------------------------------------

/** The stepping stone a column belongs to (its first column), or null. */
const stepOf = (c: number) => STEPS.find(([c0, c1]) => c >= c0 && c <= c1)?.[0] ?? null;
/**
 * Every stone of the map that rises: where it is, whether it is a wall (solid) or a ledge, whether it waits for
 * him to pass, how near he must come (tiles across), and whether it sinks under him.
 */
export const STONES = MAP.flatMap((row, r) =>
  [...row].flatMap((ch, c) => (ch === "Z" || ch === "z" ? [{ c, r, wall: ch === "Z", behind: CLOSERS.includes(c), near: stepOf(c) === LATE ? 3.5 : 6, sinks: stepOf(c) === SINKS }] : []))
);
const STONE_AT = new Map(STONES.map((s, i) => [s.r * COLS + s.c, i]));
/** Steps a stone takes to rise; how near he must come up or down (tiles); how far past a wall behind him. */
export const RISE = { steps: 20, up: 7, behind: 3 };
/** The stone that sinks: steps he can stand on it, steps it takes to go under, steps after he has left it before it rises again. */
export const SINK = { firm: 60, down: 20, back: 120 };

/** The tower that builds itself under his feet: where it stands, how low and how high it goes, how fast, how long it waits for him before it sinks back. */
export const TOWER = { x: 136 * TILE, w: 2 * TILE, low: BANK * TILE, high: TOWN * TILE, up: 1, down: 1, wait: 180 };

export interface Ruins {
  /** The step each stone began to rise, or null; whether it has risen (and is ground). */
  at: (number | null)[];
  up: boolean[];
  /** A stone that sinks: the step he stood on it from, and the step it went under, or null. */
  on: (number | null)[];
  down: (number | null)[];
  /** The tower's top now and a step ago, and the last step he stood on it. */
  y: number;
  prevY: number;
  stood: number;
}

const onTower = (s: Ruins, him: Body) => him.onGround && Math.abs(him.y + PLAYER.h - s.y) < 0.01 && him.x + PLAYER.w > TOWER.x && him.x < TOWER.x + TOWER.w;

/** Does a stone's tile hold his body (so it waits before it sets)? */
const inStone = (st: (typeof STONES)[number], him: Body) => him.x < (st.c + 1) * TILE && him.x + PLAYER.w > st.c * TILE && him.y < (st.r + 1) * TILE && him.y + PLAYER.h > st.r * TILE;

export const GROUNDS: Grounds<Ruins> = {
  create: () => ({ at: STONES.map(() => null), up: STONES.map(() => false), on: STONES.map(() => null), down: STONES.map(() => null), y: TOWER.low, prevY: TOWER.low, stood: -999 }),
  carriers: (s) => [{ x: TOWER.x, y: s.y, w: TOWER.w, dx: 0, dy: s.y - s.prevY }],
  after(s, t, him) {
    const hx = him.x + PLAYER.w / 2;
    const feet = him.y + PLAYER.h;
    // The stone that sinks, as a pair: standing on either of its tiles counts for both.
    const onSinking = him.onGround && Math.abs(feet - (BANK - 1) * TILE) < 0.01 && stepOf(Math.floor(hx / TILE)) === SINKS;
    STONES.forEach((st, i) => {
      if (st.sinks && s.up[i]) {
        s.on[i] = onSinking ? s.on[i] ?? t : null;
        if (s.on[i] !== null && t - (s.on[i] as number) >= SINK.firm) {
          s.up[i] = false;
          s.at[i] = null;
          s.on[i] = null;
          s.down[i] = t;
        }
        return;
      }
      if (s.at[i] === null) {
        // Gone under, it comes up again once he has been off it a while.
        if (s.down[i] !== null && (t - (s.down[i] as number) < SINK.back || onSinking)) return;
        const near = st.behind ? hx > (st.c + RISE.behind) * TILE : Math.abs(hx - (st.c * TILE + TILE / 2)) < st.near * TILE && Math.abs(feet - st.r * TILE) < RISE.up * TILE;
        if (near) s.at[i] = t;
      } else if (!s.up[i] && t - (s.at[i] as number) >= RISE.steps && !inStone(st, him)) s.up[i] = true;
    });
    // The tower: up under him while he stands on it, back down once he has been off it a while.
    s.prevY = s.y;
    if (onTower(s, him)) {
      s.stood = t;
      s.y = Math.max(TOWER.high, s.y - TOWER.up);
    } else if (t - s.stood > TOWER.wait) s.y = Math.min(TOWER.low, s.y + TOWER.down);
  },
  everywhere: (): Carrier[] => Array.from({ length: TOWER.low - TOWER.high + 1 }, (_, k) => ({ x: TOWER.x, y: TOWER.high + k, w: TOWER.w, dx: 0, dy: 0 })),
  map(s, base): TileMap {
    const risen = (c: number, r: number, wall: boolean) => {
      const i = STONE_AT.get(r * COLS + c);
      return i !== undefined && STONES[i].wall === wall && s.up[i];
    };
    const isSolid = (c: number, r: number) => base.isSolid(c, r) || (c >= 0 && c < COLS && risen(c, r, true));
    const isOneWay = (c: number, r: number) => base.isOneWay(c, r) || (c >= 0 && c < COLS && risen(c, r, false));
    return {
      ...base,
      isSolid,
      isOneWay,
      supports(b) {
        const feet = b.y + PLAYER.h;
        const c = Math.floor((b.x + PLAYER.w / 2) / TILE);
        const r = Math.round(feet / TILE);
        return Math.abs(feet - r * TILE) < 0.01 && (isSolid(c, r) || isOneWay(c, r));
      }
    };
  },
  // The tower moves; the stone that sinks gives way while it is up.
  stands: (s, t) => [{ x: TOWER.x, y: s.y, w: TOWER.w, how: "moves" as const }, ...STONES.flatMap((st, i) => (st.sinks && s.up[i] ? [{ x: st.c * TILE, y: st.r * TILE, w: TILE, how: "gives" as const, soon: s.on[i] !== null && t - (s.on[i] as number) > SINK.firm / 2 }] : []))]
};

/** The stone a guard was until he came near: within this many tiles it wakes and walks. */
export const WAKE = 5;

export const RULES: LevelRules = {
  // The bishop's guards stand as statues, stone and harmless, until he comes near; then they walk.
  enemy(e, p) {
    if (e.def.look !== "guard" || e.n) return false;
    if (Math.abs(p.body.x + PLAYER.w / 2 - e.x) < WAKE * TILE && Math.abs(p.body.y - e.y) < 3 * TILE) {
      e.n = p.t;
      e.calm = false;
      return false;
    }
    e.calm = true;
    return true;
  }
};

/**
 * The serpent's quay (the whole of it, from the planks' first board at the basin to the prow), its three
 * places, where he wakes it (past its bench and its flag).
 */
export const SERPENT_DEF: SerpentDef = {
  floor: QUAY * TILE,
  x0: 236 * TILE,
  x1: COLS * TILE,
  points: [251 * TILE + 8, 258 * TILE + 8, 265 * TILE + 8],
  wakeAt: 246 * TILE
};

/** The two longships he crosses the basin on: their decks, rocking a little on the water. */
export const LONGSHIPS: CarrierDef[] = [
  { kind: "bob", x: 224 * TILE, y: QUAY * TILE + 4, w: 4 * TILE, rise: 2, period: 150 },
  { kind: "bob", x: 230 * TILE, y: QUAY * TILE + 4, w: 4 * TILE, rise: 2, period: 170, offset: 60 }
];

/**
 * A rat by the park's walls, an owl over the street past the dig; three guards on the bishop's wall, stone until he comes
 * near; a rat in the crypt by the cheese; the two archers on the wall walk's arches, who shoot straight down
 * the walk at where a man coming will be (and not at one within four tiles of them, or past them); two
 * geese and a dog in the market.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "rat", c: 9, r: STREET - 1, range: 2 },
  // The owl over the street past the dig (order 17: it hung over the dig's landing).
  { kind: "flyer", look: "owl", c: 31, r: STREET - 4, range: 1, rise: 6, period: 180 },
  { kind: "walker", look: "guard", c: 70, r: WALL - 1, range: 2, speed: 0.5 },
  { kind: "walker", look: "guard", c: 78, r: WALL - 1, range: 2, speed: 0.5, dir: -1 },
  { kind: "walker", look: "guard", c: 86, r: WALL - 1, range: 2, speed: 0.5 },
  { kind: "walker", look: "rat", c: 57, r: STREET + 1, range: 1 },
  { kind: "thrower", look: "archer", c: 150, r: TOWN - 4, period: 100, straight: true, lead: true, faces: -1, reach: 10, blind: 4 },
  { kind: "thrower", look: "archer", c: 162, r: TOWN - 4, period: 100, offset: 50, straight: true, lead: true, faces: -1, reach: 10, blind: 4 },
  { kind: "walker", look: "goose", c: 195, r: MARKET - 1, range: 2, speed: 0.45 },
  { kind: "walker", look: "goose", c: 200, r: MARKET - 1, range: 1, speed: 0.45, dir: -1 },
  { kind: "walker", look: "dog", c: 210, r: MARKET - 1, range: 1, speed: 0.5 }
];

export const GAMLEBYEN_RULES = { COLS, ROWS };

// --- Art ----------------------------------------------------------------------------------------------------

/** The stones' state as this frame draws it (set in `back`, read by `tile`, which has no view of its own). */
let shown: Ruins | null = null;
let shownT = 0;
/** How far the dawn has come this frame (set in `back`, read by `tile`): the harbour's water stills with it. */
let calm = 0;
/** Where the rune stands on the last longship's prow. */
const RUNE_AT = { x: 270 * TILE, y: (QUAY - 3) * TILE };

/** The harbour's water once the dawn is coming: its surface still, no foam moving on it, a sheen of the sky. */
function calmWater(c: number, r: number, x: number, y: number, map: TileMap): boolean {
  if (calm < 0.3 || c < 213 || map.tileAt(c, r - 1) === "~") return false;
  R(x, y, TILE, 8, PALETTE.water);
  R(x, y + 8, TILE, 8, mix(PALETTE.water, PALETTE.waterDeep, 0.5));
  R(x + ((c * 5) % 9), y, 5, 1, mix(PALETTE.water, PALETTE.foam, 0.45));
  return true;
}

/** How far up a stone has come (0: not at all, 1: risen); one that sinks under him trembles, then goes down. */
function risenBy(c: number, r: number): number {
  const i = STONE_AT.get(r * COLS + c);
  if (i === undefined || !shown) return 0;
  const on = shown.on[i];
  if (shown.up[i]) return on !== null && shownT - on > SINK.firm / 2 && !view.reduced ? 1 - ((shownT >> 2) % 2) * 0.12 : 1;
  const down = shown.down[i];
  const at = shown.at[i];
  if (at === null) return down !== null && shownT - down < SINK.down ? 1 - (shownT - down) / SINK.down : 0;
  return Math.min(0.95, (shownT - at) / RISE.steps);
}

/** Steps since the serpent went under for good (the dawn coming, the rune rising), or null. */
const endOf = (v: View) => (v.boss ? endingAge(v.boss as Serpent, v.t) : null);
/** How far the dawn has come, 0 to 1. */
const dawnOf = (v: View) => {
  const a = endOf(v);
  return a === null ? 0 : Math.min(1, a / SERPENT_STEPS.dawn);
};
/** The dawn sky's colour at a height over the horizon. */
function dawnColor(h: number): string {
  const stops = G.dawnSky;
  let i = 0;
  while (i < stops.length - 2 && h > stops[i + 1][0]) i++;
  const [h0, c0] = stops[i];
  const [h1, c1] = stops[i + 1];
  const k = Math.max(0, Math.min(1, (h - h0) / (h1 - h0)));
  const a = c0.split(",").map(Number);
  const b = c1.split(",").map(Number);
  return a.map((x, j) => Math.round(x + (b[j] - x) * k)).join(", ");
}

/**
 * The far shore, the fjord in the dark, and (once the serpent is beaten) a real dawn over it: the whole sky
 * turns over five seconds from the night to a dawn's colours (the stars, the moon and the aurora go under
 * it), the sun comes up behind the hills, and the hills stand dark against it with a lit rim. It is drawn
 * after the night's tint, as its own light. With reduced motion the sun is where it ends, and only the
 * colours come.
 */
function far(v: View) {
  const horizon = (QUAY + 1) * TILE - 6;
  const dawn = dawnOf(v);
  const top = (x: number) => {
    const wx = layerWorldX(x, 0.12);
    return horizon - (14 + Math.round(6 * Math.sin(wx * 0.006 + 2) + 4 * Math.sin(wx * 0.021)));
  };
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    column(x, top(x), horizon + 200, mix(G.stoneDark, INK, 0.45));
    if (Math.floor(wx) % 29 === 0 && dawn < 0.6) light(x + view.camX, top(x) + 5, 1, 1);
  }
  ekeberg(horizon, dawn);
  if (dawn <= 0) return;
  const a = dawn.toFixed(3);
  for (let y = Math.min(view.camY, horizon - 240); y < horizon; y += 3) light(view.camX, y, view.w, 3, "soft", `rgba(${dawnColor(horizon - y)}, ${a})`);
  // The sun, rising behind the hills: its glow, then its disc.
  const sx = Math.round(view.w * 0.72);
  const rise = view.reduced ? 1 : dawn * dawn * (3 - 2 * dawn);
  const sy = Math.round(horizon - 2 - 30 * rise);
  for (const [r, al] of [[30, 0.16], [20, 0.3], [9, 1]] as const)
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(r * r - dy * dy));
      light(sx - w + view.camX, sy + dy, 2 * w + 1, 1, "soft", r === 9 ? G.sun : `rgba(${G.sunGlow}, ${(al * dawn).toFixed(3)})`);
    }
  // The hills against it, and their lit rim.
  for (let x = 0; x < view.w; x++) {
    light(x + view.camX, top(x), 1, horizon + 40 - top(x), "soft", `rgba(58, 53, 82, ${a})`);
    const near = Math.max(0, 1 - Math.abs(x - sx) / 160);
    light(x + view.camX, top(x), 1, 1, "soft", `rgba(${G.dawnRim}, ${(dawn * (0.3 + 0.7 * near)).toFixed(3)})`);
  }
}

/**
 * Ekeberg's slope over the old town, under the far ridge's line (order 20: it was one dark band): woods, a road
 * going up, houses with a window lit here and there. In strips of the far layer drawn once and copied (ADR
 * 0036, 0041), a band from just under the ridge's lowest line down: at dawn the hills' dark goes over it and it
 * goes with them.
 */
const SLOPE = { w: 128, h: 36, strips: 4 };
const slopeHash = (a: number, b: number) => {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return n - Math.floor(n);
};
/** The houses on the slope, by strip: where, in the strip's own pixels, and whether a window is lit. */
const SLOPE_HOUSES = Array.from({ length: SLOPE.strips }, (_, j) =>
  Array.from({ length: 7 }, (_, k) => ({ u: 6 + k * 17 + Math.floor(slopeHash(j, k) * 9), y: 4 + Math.floor(slopeHash(k, j + 5) * 24), lit: slopeHash(j + 9, k) < 0.6 }))
);
function drawSlope(j: number) {
  const hill = mix(G.stoneDark, INK, 0.45);
  const wood = mix(G.grassDark, INK, 0.62);
  const house = mix(G.stoneDark, INK, 0.2);
  const roof = mix(G.timberDark, INK, 0.35);
  // Woods in clumps, the road between them in a few long bends.
  for (let u = 0; u < SLOPE.w; u += 3) {
    const U = j * SLOPE.w + u;
    const crown = 3 + Math.floor(slopeHash(U, 1) * 4);
    const y = Math.floor(slopeHash(U, 2) * (SLOPE.h - 6));
    if (slopeHash(U, 3) < 0.55) R(u, y, 3, crown, wood);
    if (slopeHash(U, 4) < 0.25) R(u + 1, y - 1, 1, 1, wood);
  }
  for (let u = 0; u < SLOPE.w; u++) {
    const U = j * SLOPE.w + u;
    R(u, 10 + Math.round(((U % 96) / 96) * 14), 1, 1, mix(hill, house, 0.5));
  }
  for (const h of SLOPE_HOUSES[j]) {
    R(h.u, h.y + 1, 4, 3, house);
    R(h.u - 1, h.y, 6, 1, roof);
    R(h.u + 1, h.y + 2, 1, 1, mix(house, INK, 0.4));
  }
}
function ekeberg(horizon: number, dawn: number) {
  const o = Math.floor(layerOrigin(0.12));
  for (let i = Math.floor(o / SLOPE.w); i * SLOPE.w - o < view.w; i++) {
    const j = ((i % SLOPE.strips) + SLOPE.strips) % SLOPE.strips;
    const sx = i * SLOPE.w - o;
    stamp(`gb-slope ${j}`, sx, horizon + 2 - view.camY, SLOPE.w, SLOPE.h, () => drawSlope(j));
    if (dawn < 0.6) for (const h of SLOPE_HOUSES[j]) if (h.lit) lit(sx + h.u + 1, horizon + 2 + h.y + 2, 1, 1);
  }
}

/** Behind the street: the town's roofs in the modern part, then the medieval town, the hall, the masts. */
function mid() {
  const base = STREET * TILE - 10;
  for (let x = -((view.camX >> 2) % 11); x < view.w; ) {
    const wx = layerWorldX(x, 0.2);
    const n = Math.floor(wx / 19);
    const w = 12 + (n % 4) * 3;
    const h = 22 + ((n * 7) % 16);
    const old = wx > 150 * TILE * 0.2;
    const wall = old ? mix(G.timberDark, INK, 0.2) : mix(G.stoneDark, INK, 0.3);
    for (let k = 0; k < w; k++) column(x + k, base - h + (old ? Math.abs(k - w / 2) * 0.8 : 0), base + 200, wall);
    if (n % 3 !== 1) light(x + 3 + view.camX, base - h + 8, 2, 2, old ? "soft" : "window");
    x += w + 2;
  }
}

/** A street lamp of the modern town, its light on the cobbles. */
function streetLamp(x: number, ground: number) {
  R(x, ground - 34, 2, 34, G.lampPost);
  R(x - 3, ground - 36, 8, 3, G.lampPost);
  light(x - 2, ground - 33, 6, 2, "lamp");
  light(x - 14, ground - 1, 30, 4, "pool");
}

/** The torches by the harbour, in the order they go out at dawn, and the step of the dawn each goes out at. */
const QUAY_TORCHES = [264, 256, 246, 238, 214];
const torchOut = (c: number) => 40 + Math.max(0, QUAY_TORCHES.indexOf(c)) * 45;
/** True once the torch at column c has gone out (the dawn has come to it). */
let endAge: number | null = null;
const isOut = (c: number) => endAge !== null && endAge >= (QUAY_TORCHES.includes(c) ? torchOut(c) : 60 + (c % 7) * 30);

/** A torch on a post, its flame flickering (still, with reduced motion), its light on the ground; at dawn, out, a thread of smoke. */
function torch(x: number, ground: number, t: number, out = false) {
  R(x, ground - 22, 2, 22, G.torch);
  R(x - 1, ground - 24, 4, 3, G.timberDark);
  if (out) {
    R(x, ground - 25, 2, 1, INK);
    for (let k = 0; k < 4; k++) R(x + (view.reduced ? 0 : Math.round(Math.sin(t * 0.06 + k) * 1.2)) + (k % 2), ground - 27 - k * 3, 1, 2, G.smoke);
    return;
  }
  const flick = view.reduced ? 0 : Math.floor((t + x) / 5) % 3;
  light(x - 1, ground - 30 + flick, 4, 6 - flick, "lamp", G.flame);
  light(x, ground - 28 + flick, 2, 3, "lamp", G.flameHot);
  light(x - 16, ground - 1, 34, 4, "pool");
}

/**
 * St. Clement's ruin behind its stones: what is left of its walls, broken off at different heights, in
 * older, darker stone, blocks of several shades, two arched windows with the night through them.
 */
function church() {
  const g = STREET * TILE;
  const x0 = 34 * TILE;
  const x1 = 48 * TILE;
  const back = mix(G.stoneDark, INK, 0.3);
  for (let x = x0; x < x1; x += 2) {
    const k = (x - x0) / (x1 - x0);
    const top = Math.round(9 * TILE + 70 * (1 - k) * (1 - k) + 10 * Math.abs(Math.sin(x * 0.11)) + (Math.floor(x / 6) % 3) * 3);
    R(x, top, 2, g - top, back);
    R(x, top, 2, 1, mix(G.stone, INK, 0.2));
  }
  for (let y = 9 * TILE; y < g; y += 6)
    for (let x = x0 + ((y / 6) % 2) * 5; x < x1; x += 10) {
      const n = (x * 7 + y * 3) % 5;
      R(x, y, 1, 6, mix(back, INK, 0.35));
      if (n === 0) R(x + 1, y + 1, 8, 4, mix(back, G.stone, 0.18));
    }
  // Two arched windows, the night through them.
  for (const wx of [38 * TILE + 4, 43 * TILE + 4]) {
    R(wx, 13 * TILE, 10, 22, mix(INK, back, 0.25));
    for (let k = 0; k < 5; k++) R(wx + k, 13 * TILE - k, 10 - k * 2, 1, mix(INK, back, 0.25));
    R(wx - 1, 13 * TILE + 22, 12, 2, mix(G.stone, INK, 0.25));
  }
  // The gable's window, high up.
  R(48 * TILE + 8, 12 * TILE, 10, 20, mix(INK, G.stoneDark, 0.2));
  for (let k = 0; k < 5; k++) R(48 * TILE + 8 + k, 12 * TILE - k, 10 - k * 2, 1, mix(INK, G.stoneDark, 0.2));
}

/** The bishop's wall's crenellations behind its walk, and the water mirror's old shore line. */
function bishop() {
  for (let x = 62 * TILE; x < 93 * TILE; x += 12) R(x, WALL * TILE - 8, 6, 8, mix(G.stone, INK, 0.3));
}

/** The town wall's arches: the posts under each slab, the walk's parapet. */
function townWall() {
  for (const c of [150, 162]) {
    R(c * TILE, (TOWN - 2) * TILE, 3, 2 * TILE, G.stoneDark);
    R((c + 3) * TILE - 3, (TOWN - 2) * TILE, 3, 2 * TILE, G.stoneDark);
  }
  for (let x = 138 * TILE; x < 176 * TILE; x += 10) R(x, TOWN * TILE - 6, 5, 6, mix(G.stone, INK, 0.3));
}

/** The market: stalls with cloth awnings, the stave-built hall with its dragon heads and shingles. */
function market(t: number) {
  const g = MARKET * TILE;
  // A stall: posts, an awning (its roof the ledge), goods.
  R(188 * TILE, g - 2 * TILE, 2, 2 * TILE, G.timber);
  R(191 * TILE - 2, g - 2 * TILE, 2, 2 * TILE, G.timber);
  for (let x = 188 * TILE; x < 191 * TILE; x += 6) R(x, g - 2 * TILE + 4, 3, 6, G.cloth);
  R(188 * TILE + 3, g - 8, 40, 8, G.timberLight);
  // The hall: walls of upright planks, a steep shingle roof in tiers, dragon heads at the gable ends.
  const x0 = 191 * TILE;
  const x1 = 201 * TILE;
  R(x0, g - 4 * TILE, x1 - x0, 4 * TILE, G.timber);
  for (let x = x0; x < x1; x += 4) R(x, g - 4 * TILE, 1, 4 * TILE, G.timberDark);
  R(x0 + 64, g - 30, 18, 30, mix(G.timberDark, INK, 0.4));
  light(x0 + 66, g - 28, 14, 26, "soft", "rgba(255, 170, 90, 0.35)");
  // Firelight from inside: slits in the plank wall, and the light from the door on the street.
  for (const wx of [x0 + 18, x0 + 40, x0 + 110, x0 + 140]) light(wx, g - 44, 3, 10, "window");
  light(x0 + 50, g - 1, 50, 4, "pool");
  // The shingles catch the torches' light along their lower edge.
  for (let x = x0 + 8; x < x1 - 8; x += 6) light(x, g - 4 * TILE - 1, 3, 1, "soft", "rgba(255, 190, 120, 0.4)");
  for (let k = 0; k < 4 * TILE; k++) R(x0 + 8 + Math.floor(k / 2), g - 4 * TILE - k, x1 - x0 - 16 - k, 1, k % 6 === 0 ? G.timberDark : G.shingle);
  for (const [x, d] of [[x0 + 2, -1], [x1 - 2, 1]] as const) {
    for (let k = 0; k < 12; k++) R(x + d * k, g - 4 * TILE - 22 - Math.round(k * 0.8), 2, 2, G.dragon);
    R(x + d * 12, g - 4 * TILE - 34, 3, 3, G.dragon);
  }
  void t;
}

/**
 * The lights on the water, after the night's tint: each torch by the harbour and the moon laid on the
 * water in broken streaks, moving a little (still, with reduced motion); the pool takes the street lamps'.
 */
function reflections(v: View) {
  const dawn = dawnOf(v);
  // The water stills as the dawn comes.
  const tt = view.reduced ? 0 : v.t;
  const still = 1 - dawn;
  const streak = (x: number, y0: number, n: number, rgb: string, a = 0.5) => {
    for (let k = 0; k < n; k++) {
      const w = 6 - Math.min(4, k);
      light(Math.round(x - w / 2 + Math.sin(tt * 0.05 + k) * 2 * still), y0 + 3 + k * 4, w, 1, "soft", `rgba(${rgb}, ${((a - k * 0.07) * (a / 0.5)).toFixed(2)})`);
    }
  };
  const water = (QUAY + 1) * TILE;
  for (const c of QUAY_TORCHES) if (!isOut(c)) streak(c * TILE + 7, water, 6, "255, 190, 110");
  streak(117 * TILE, BANK * TILE, 4, "200, 220, 255");
  if (dawn < 1) for (let x = Math.max(213 * TILE, view.camX); x < view.camX + view.w; x += 37) light(x, water + 6 + ((x * 7) % 9), 3, 1, "soft", `rgba(170, 200, 255, ${(0.25 * still).toFixed(3)})`);
  if (dawn <= 0) return;
  // The dawn on the still water: the sky's colour along it, and the sun's path under the sun.
  const sun = view.camX + Math.round(view.w * 0.72);
  light(Math.max(213 * TILE, view.camX), water, view.w, 2, "soft", `rgba(${G.sunGlow}, ${(0.35 * dawn).toFixed(3)})`);
  for (let k = 0; k < 9; k++) {
    const w = 18 - k * 2;
    light(sun - w / 2, water + 3 + k * 3, w, 1, "soft", `rgba(${G.sunGlow}, ${((0.7 - k * 0.06) * dawn).toFixed(3)})`);
  }
  // And a little of its warmth on the street, over the night.
  light(view.camX, view.camY, view.w, water - view.camY, "soft", `rgba(255, 176, 128, ${(0.1 * dawn).toFixed(3)})`);
}

/**
 * The last longship, moored at the quay's end: its hull rising out of the water along the quay to the
 * raised deck at its prow, strakes of tarred planking following its sheer, round shields along its side,
 * and the stem rising from the prow and curling over into a carved dragon's head.
 */
function lastLongship(t: number) {
  const g = QUAY * TILE;
  const deck = (QUAY - 2) * TILE;
  const x0 = 261 * TILE;
  const x1 = COLS * TILE;
  const bob = view.reduced ? 0 : Math.round(Math.sin(t * 0.03));
  const keel = g + TILE + 8;
  /** The top of its side at x: level with the quay amidships, sweeping up to the prow's deck. */
  const sheer = (x: number) => {
    const k = Math.max(0, Math.min(1, (x - 264 * TILE) / (4 * TILE)));
    return Math.round(g + 2 - (g + 2 - deck) * k * k * (3 - 2 * k));
  };
  for (let x = x0; x < x1; x++) {
    const top = sheer(x) + bob;
    // The hull's run in from the stern end, rounded under the water.
    const bottom = keel - Math.round(Math.max(0, 1 - (x - x0) / 24) * 10);
    R(x, top, 1, bottom - top, G.hull);
    R(x, top, 1, 1, mix(G.hull, WHITE, 0.25));
    for (let k = 1; k < 6; k++) {
      const y = top + Math.round(((bottom - top) * k) / 6);
      R(x, y, 1, 1, mix(G.hull, INK, 0.4));
    }
  }
  // Its shields along the side, overlapping, red and cream, under the sheer.
  for (let x = x0 + 4; x < 268 * TILE; x += 9) {
    const y = sheer(x + 4) + bob + 2;
    const c = x % 18 < 9 ? G.sailStripe : G.sail;
    for (const [dy, w] of [[0, 4], [1, 6], [2, 8], [3, 8], [4, 8], [5, 8], [6, 6], [7, 4]]) R(x + (8 - w) / 2, y + dy, w, 1, dy < 2 ? mix(c, WHITE, 0.3) : c);
    R(x + 3, y + 3, 2, 2, PALETTE.ironDark);
  }
  // The prow's raised deck: its planks, the rail.
  R(268 * TILE, deck, 4 * TILE, 3, G.plank);
  R(268 * TILE, deck, 4 * TILE, 1, G.plankLight);
  dragonHead(COLS * TILE - 6, deck);
}

/**
 * The carved dragon on the last longship's stem: the stem rising from the prow and curling over, a long
 * head on it looking back along the quay with its jaws open, carved scales picked out in red and gold, an
 * eye, horns, a mane of curls down its neck.
 */
function dragonHead(x: number, deck: number) {
  const wood = G.dragon;
  const dark = mix(G.dragon, INK, 0.45);
  const lit = mix(G.dragon, WHITE, 0.3);
  const gold = PALETTE.runeGlow;
  // The stem: up from the prow, curving back over the deck.
  for (let k = 0; k < 40; k++) {
    const f = k / 40;
    const cx = x - Math.round(Math.sin(f * Math.PI * 0.6) * 8);
    const w = 6 - Math.round(f * 2);
    R(cx - w, deck - k, w, 1, k % 4 === 0 ? dark : wood);
    R(cx - w, deck - k, 1, 1, lit);
    if (k % 6 === 3) R(cx - w + 2, deck - k, 2, 1, G.sailStripe);
  }
  // The mane: carved curls down the back of its neck.
  for (let k = 0; k < 5; k++) {
    const y = deck - 14 - k * 5;
    const cx = x - Math.round(Math.sin(((14 + k * 5) / 40) * Math.PI * 0.6) * 8);
    R(cx, y, 3, 3, G.sailStripe);
    R(cx + 1, y + 1, 1, 1, gold);
  }
  // The head, looking back along the quay: skull, horns, a long snout with flared nostrils, open jaws, teeth.
  const hx = x - 14;
  const hy = deck - 50;
  R(hx, hy, 12, 9, wood);
  R(hx, hy, 12, 1, lit);
  R(hx + 9, hy - 5, 2, 5, wood);
  R(hx + 6, hy - 7, 2, 7, wood);
  R(hx + 6, hy - 8, 2, 1, gold);
  R(hx - 11, hy + 2, 12, 5, wood);
  R(hx - 11, hy + 2, 12, 1, lit);
  R(hx - 13, hy + 1, 3, 4, wood);
  R(hx - 13, hy + 1, 1, 1, dark);
  // The lower jaw, dropped open, its tongue curling out.
  R(hx - 9, hy + 10, 14, 3, wood);
  R(hx - 9, hy + 7, 14, 3, mix(G.cloth, INK, 0.4));
  for (let k = 0; k < 4; k++) {
    R(hx - 9 + k * 3, hy + 7, 1, 2, G.tooth);
    R(hx - 8 + k * 3, hy + 9, 1, 1, G.tooth);
  }
  R(hx - 14, hy + 11, 5, 1, G.sailStripe);
  R(hx - 15, hy + 10, 1, 1, G.sailStripe);
  // The carved eye, red-rimmed with a gold pupil, and carved scales along its jaw.
  R(hx + 1, hy + 2, 4, 3, G.sailStripe);
  R(hx + 2, hy + 3, 2, 1, gold);
  for (let k = 0; k < 3; k++) R(hx - 6 + k * 4, hy + 4, 2, 1, dark);
}

/** A longship in the basin: hull, shields, a furled sail on its yard; its deck the carrier. */
function longship(x: number, y: number, w: number) {
  R(x - 6, y + 4, w + 12, 6, G.hull);
  R(x - 2, y + 10, w + 4, 4, mix(G.hull, INK, 0.3));
  R(x, y, w, 4, G.plank);
  R(x, y, w, 1, G.plankLight);
  for (let k = 4; k < w - 4; k += 10) R(x + k, y + 4, 6, 5, k % 20 ? G.cloth : G.sail);
  R(x + w / 2, y - 36, 2, 36, G.timberDark);
  R(x + 4, y - 32, w - 8, 3, G.sail);
  for (const [px, d] of [[x - 6, -1], [x + w + 5, 1]] as const) for (let k = 0; k < 10; k++) R(px + d * Math.round(k * 0.4), y + 4 - k, 2, 1, G.dragon);
}

/** A rising stone: from the ground up as it comes (dust at its foot), and set, paler than the old stone. */
function stoneTile(c: number, r: number, x: number, y: number, wall: boolean) {
  const k = risenBy(c, r);
  if (k <= 0) return;
  const h = wall ? TILE : 6;
  const shown = Math.round(h * k);
  const top = y + (wall ? TILE : h) - shown;
  R(x, top, TILE, shown, G.risen);
  R(x, top, TILE, 1, G.risenLight);
  // After dark, the new stone keeps a little light of its own along its top, so it reads as ground.
  light(x, top, TILE, 1, "soft", "rgba(236, 230, 214, 0.55)");
  if (k < 1 && !view.reduced) light(x, top - 1, TILE, 1, "soft", "rgba(236, 230, 214, 0.3)");
  if (wall) for (let yy = top + 5; yy < y + TILE; yy += 6) R(x, yy, TILE, 1, G.mortar);
  else {
    R(x, top + shown - 1, TILE, 1, mix(G.risen, INK, 0.3));
    // A stepping stone stands on its own pillar down into the water.
    if (k >= 1) R(x + 2, y + 6, TILE - 4, TILE - 6, mix(G.risen, G.stone, 0.5));
  }
  R(x + (c % 2) * 8, top, 1, shown, mix(G.risen, INK, 0.25));
  if (k < 1 && !view.reduced) for (let i = 0; i < 3; i++) R(x + 2 + i * 5, top + shown - 1 - ((shownT + i * 3) % 4), 1, 1, G.risenLight);
}

/** Each wall that closes behind him: its column, and the ground at its foot (the bottom of its lowest stone). */
const CLOSING = CLOSERS.map((c) => ({ c, foot: (Math.max(...STONES.filter((st) => st.behind && st.c === c).map((st) => st.r)) + 1) * TILE, stones: STONES.flatMap((st, i) => (st.behind && st.c === c ? [i] : [])) }));

/**
 * A wall about to close behind him: from the moment he is past it until it starts to rise (three tiles on),
 * the ground where it will stand trembles, cracks with its stones' tops showing through, and throws up dust
 * (order 20). Drawing only, in the time that is there; with reduced motion a still crack and the stones' tops.
 */
function closing(v: View) {
  const s = v.grounds as Ruins | null;
  if (!s) return;
  for (const w of CLOSING) {
    if (v.him.x <= w.c * TILE + TILE / 2 || w.stones.some((i) => s.at[i] !== null || s.up[i])) continue;
    const x = w.c * TILE + shiver(v.t);
    R(x + 1, w.foot - 1, TILE - 2, 1, mix(G.stoneDark, INK, 0.4));
    R(x + 3, w.foot - 2, 4, 1, G.risen);
    R(x + 9, w.foot - 2, 3, 1, G.risen);
    if (!view.reduced) for (let k = 0; k < 4; k++) R(x + 2 + k * 4, w.foot - 3 - ((v.t + k * 5) % 7), 1, 1, G.risenLight);
  }
}

/** Old stone: courses, mortar, moss on top where it is open to the sky. */
function oldStone(c: number, r: number, x: number, y: number, map: { isSolid(c: number, r: number): boolean }) {
  R(x, y, TILE, TILE, (c + r) % 3 ? G.stone : mix(G.stone, G.stoneDark, 0.5));
  for (let yy = y + ((r % 2) * 3) + 4; yy < y + TILE; yy += 6) R(x, yy, TILE, 1, G.stoneDark);
  R(x + ((c * 5 + r * 3) % 12) + 1, y + 2, 1, 4, G.stoneDark);
  if (!map.isSolid(c, r - 1)) {
    R(x, y, TILE, 2, G.stoneLight);
    if ((c * 7 + r) % 3 === 0) R(x + 3, y - 1, 5, 1, G.moss);
  }
}

/** The quay's planks on their piles over the dark water. */
function quayPlank(c: number, x: number, y: number) {
  R(x, y, TILE, 5, c % 2 ? G.plank : G.plankLight);
  R(x, y, TILE, 1, mix(G.plankLight, WHITE, 0.2));
  R(x, y + 5, TILE, 1, G.plankDark);
  R(x + 15, y, 1, 5, G.plankDark);
  if (c % 3 === 0) R(x + 6, y + 6, 4, TILE - 6, G.plankDark);
}

/** The water under the quay's deck, below its top: where the ring of foam shows, and the tail's tip breaks it. */
const WATERLINE = TILE + 6;
/** The moonlit rim on the serpent after dark, as an enemy's (ADR 0023), and the torches' warm light on it. */
const RIM = "rgba(214, 228, 255, 0.7)";
const BELLY = "rgba(220, 230, 180, 0.4)";

/** How near the nearest burning torch on the quay is (0: none within five tiles, 1: right beside it), and which side. */
function torchlit(x: number): { k: number; side: 1 | -1 } {
  let best = { k: 0, side: 1 as 1 | -1 };
  for (const c of QUAY_TORCHES) {
    if (isOut(c)) continue;
    const d = c * TILE + 7 - x;
    const k = Math.max(0, 1 - Math.abs(d) / (5 * TILE));
    if (k > best.k) best = { k, side: d < 0 ? -1 : 1 };
  }
  return best;
}

/**
 * One row of its body, `w` wide round cx, its belly on the side `dir`: a dark outline along its back, a
 * moonlit ridge, scales in rows, and the pale plates of its belly. `n` is the row's number along the body.
 */
function bodyRow(cx: number, y: number, w: number, dir: 1 | -1, n: number) {
  const x0 = cx - Math.floor(w / 2);
  R(x0, y, w, 1, G.serpent);
  for (let b = 0; b < w; b++) {
    const x = dir > 0 ? x0 + b : x0 + w - 1 - b;
    let c: string | null = null;
    if (b === 0) c = G.serpentDark;
    else if (b <= 2) c = (n + b) % 3 === 0 ? G.serpent : G.serpentLight;
    else if (b >= w - 4) c = b === w - 1 || n % 3 === 0 ? G.serpentBellyDark : G.serpentBelly;
    else if ((n + (b >> 1)) % 3 === 0) c = G.serpentDark;
    if (c) R(x, y, 1, 1, c);
  }
  // After the night's tint: a little of its own colour back, a moonlit back, its pale belly.
  light(x0 + 1, y, w - 2, 1, "soft", "rgba(96, 160, 128, 0.16)");
  if (n % 2 === 0) light(dir > 0 ? x0 : x0 + w - 1, y, 1, 2, "soft", RIM);
  if (n % 3 === 1) light(dir > 0 ? x0 + w - 4 : x0, y, 3, 1, "soft", BELLY);
}

/** A spine of its crest from (x, y), `h` long, leaning back from the way it faces. */
function spine(x: number, y: number, h: number, dir: 1 | -1) {
  for (let i = 0; i < h; i++) R(x - dir * Math.round(i * 0.5), y - i, i === h - 1 ? 1 : 2, 1, i === h - 1 ? G.crestLight : G.crest);
}

/**
 * Its head, `dir` the way it faces, (x, y) the top of its skull's middle: a long skull with a fan of
 * spines behind it, a brow, a yellow eye with a slit, a long snout with a nostril, a jaw that drops open to
 * spit with its teeth and the pale inside showing; after the night's tint, eye-shine and a moonlit rim.
 * Shut-eyed and slack-jawed (`dazed`), the same head lies on the quay.
 */
function serpentHead(x: number, y: number, dir: 1 | -1, open: number, dazed = false) {
  // In the head's own pixels, facing right from its back end (-12): mirrored when it faces left.
  const r = (dx: number, dy: number, w: number, h: number, c: string) => R(dir > 0 ? x + dx : x - dx - w, y + dy, w, h, c);
  const lt = (dx: number, dy: number, w: number, h: number, c: string) => light(dir > 0 ? x + dx : x - dx - w, y + dy, w, h, "soft", c);
  // The fan of spines behind the skull (flat back along it when dazed).
  if (dazed) for (let k = 0; k < 4; k++) r(-14 - k * 3, 2 + (k % 2), 4, 1, G.crest);
  else for (const [dx, h] of [[-10, 7], [-7, 10], [-4, 8], [-1, 5]] as const) spine(dir > 0 ? x + dx : x - dx, y + 1, h, dir);
  // Skull and cheek.
  r(-11, 1, 13, 8, G.serpent);
  r(-10, 0, 11, 1, G.serpent);
  r(-11, 1, 13, 1, G.serpentLight);
  r(-12, 2, 1, 6, G.serpentDark);
  r(-8, 5, 6, 3, G.serpentLight);
  // Brow, and the eye under it (shut: a dark curve).
  r(-2, 1, 6, 2, G.serpentDark);
  if (dazed) {
    r(-1, 4, 4, 1, INK);
    r(-2, 3, 1, 1, INK);
  } else {
    r(-1, 3, 4, 3, G.eye);
    r(0, 3, 1, 3, INK);
    lt(-1, 3, 4, 3, G.eye);
  }
  // The snout, tapering to its tip; a nostril.
  r(2, 3, 9, 5, G.serpent);
  r(11, 4, 3, 4, G.serpent);
  r(2, 3, 9, 1, G.serpentLight);
  r(12, 4, 1, 1, INK);
  r(14, 5, 1, 3, G.serpentDark);
  // The jaw: shut under the snout, or dropped open with the teeth and the pale inside showing.
  const jy = 8 + open;
  r(-9, jy, 22, 3, G.serpentBelly);
  r(-9, jy + 2, 22, 1, G.serpentBellyDark);
  r(12, jy, 2, 2, G.serpentBelly);
  if (open > 0) {
    r(-2, 8, 15, open, mix(G.cloth, INK, 0.45));
    for (let k = 0; k < 4; k++) {
      r(1 + k * 3, 8, 1, 2, G.tooth);
      r(2 + k * 3, jy - 1, 1, 1, G.tooth);
    }
  } else for (let k = 0; k < 3; k++) r(4 + k * 3, 8, 1, 1, G.tooth);
  if (dazed) r(13, jy + 1, 3, 1, mix(G.cloth, WHITE, 0.2));
  // Its rim in the dark: along the skull and the snout.
  lt(-10, -1, 11, 1, RIM);
  lt(1, 2, 13, 1, RIM);
}

/**
 * Its neck from the water up to its head at (x + lean, top): broad at the waterline, narrower under the
 * head, in an S as a serpent holds itself, scaled, its pale belly on the side it faces, a crest of spines
 * down its back; lit by the moon along its back and by a torch on the side it stands.
 */
function serpentNeck(x: number, top: number, base: number, dir: 1 | -1, lean: number, sway: number) {
  const lit = torchlit(x);
  const n = base - top;
  for (let y = top; y < base; y++) {
    const f = (y - top) / n;
    const w = Math.round(12 + 8 * f);
    const cx = x + Math.round(lean * (1 - f) ** 1.5 + 6 * Math.sin(f * Math.PI * 1.5 + 0.3) * (1 - 0.5 * f) + sway * (1 - f));
    bodyRow(cx, y, w, dir, y - top);
    if ((y - top) % 6 === 3 && f > 0.06 && f < 0.85) spine(dir > 0 ? cx - Math.floor(w / 2) - 1 : cx + Math.ceil(w / 2), y, 4, dir);
    if (lit.k > 0.05 && y % 2 === 0) light(lit.side > 0 ? cx + Math.ceil(w / 2) - 1 : cx - Math.floor(w / 2), y, 1, 2, "soft", `rgba(255, 190, 120, ${(0.6 * lit.k).toFixed(2)})`);
  }
}

/** Water off its body as it comes up: drops falling from its jaw and down its neck, and the splash at the waterline. */
function streaming(x: number, top: number, base: number, age: number, n: number) {
  if (view.reduced) return;
  for (let k = 0; k < n; k++) {
    const fall = (age * 3 + k * 17) % (base - top + 10);
    R(x - 8 + ((k * 7) % 17), top + 6 + fall, 1, 2, G.foam);
  }
  for (let k = 0; k < 5; k++) R(x - 12 + k * 6, base - 3 - ((age + k * 2) % 4), 2, 2, G.foam);
}

/** Its coils between rises: humps of its back arching out of the water under the quay, moving on to where it will come up. */
function coils(s: Serpent, v: View) {
  const floor = s.def.floor;
  const water = floor + TILE;
  const go = view.reduced ? 0 : v.t * 0.35;
  for (let k = 0; k < 2; k++) {
    const x = Math.round(neckX(s) - (k + 1) * 34 * (s.dir || 1) + Math.sin(go * 0.05 + k) * 6);
    const h = 5 + k;
    for (let i = -11; i <= 11; i++) {
      const y = water - Math.round(h * Math.sqrt(1 - (i / 12) ** 2));
      R(x + i, y, 1, water - y + 2, i % 4 === 0 ? G.serpentDark : G.serpent);
      if (i % 2 === 0) light(x + i, y - 1, 1, 1, "soft", RIM);
    }
    for (let i = -2; i <= 2; i += 2) R(x + i, water - h - 2, 1, 2, G.crest);
    R(x - 14, water, 4, 1, G.foam);
    R(x + 11, water, 4, 1, G.foam);
  }
}

/** Its tail's fin: a fan, ribbed, broad at the top, leaning back from the way it sweeps; `h` tall from (x, y). */
function fin(x: number, y: number, h: number, d: 1 | -1) {
  for (let i = 0; i < h; i++) {
    const w = 2 + Math.round(i * 0.7);
    const x0 = x - d * Math.round(i * 0.45) - (d > 0 ? w : 0);
    R(x0, y - i, w, 1, G.crest);
    for (let k = 1; k < w; k += 2) R(x0 + k, y - i, 1, 1, mix(G.crest, INK, 0.3));
  }
  const tw = 2 + Math.round((h - 1) * 0.7);
  R(x - d * Math.round((h - 1) * 0.45) - (d > 0 ? tw : 0), y - h, tw, 1, G.crestLight);
  light(x - d * Math.round((h - 1) * 0.45) - (d > 0 ? tw : 0), y - h - 1, tw, 1, "soft", RIM);
}

/** Its tail along the quay: a hump of its body out of the water over the planks, the fin leading, spray. */
function tailArt(s: Serpent, v: View) {
  const t = s.tail!;
  const floor = s.def.floor;
  const water = floor + TILE;
  const tb = tailBox(s, v.t);
  const d = t.dir;
  if (!tb) {
    // The warning: its fin breaks the water at the quay, growing for a second, with spray round it.
    const k = Math.min(1, (v.t - t.at) / SERPENT_STEPS.tailWarn);
    const x = Math.round(t.x);
    fin(x, water + 2, Math.round(4 + 12 * k), d);
    R(x - 12, water, 24, 2, G.foam);
    if (!view.reduced) for (let i = 0; i < 8; i++) R(x - 14 + i * 4, water - 2 - ((v.t + i * 5) % 7), 2, 2, G.foam);
    else for (let i = 0; i < 4; i++) R(x - 12 + i * 8, water - 4, 2, 2, G.foam);
    return;
  }
  const x = Math.round(tb.x + tb.w / 2);
  // The body behind the fin: low over the planks, then down into the water behind it.
  for (let i = 0; i < 30; i++) {
    const xx = x - d * (4 + i);
    const top = floor - 7 + Math.round(Math.max(0, i - 10) ** 2 / 14);
    for (let y = top; y < Math.min(water + 4, top + 8); y++) R(xx, y, 1, 1, y === top ? G.serpentLight : y >= top + 6 ? G.serpentBelly : (y + i) % 3 === 0 ? G.serpentDark : G.serpent);
    if (i % 2 === 0) light(xx, top - 1, 1, 1, "soft", RIM);
    if (i % 5 === 2 && top < water - 4) spine(xx, top, 3, d);
  }
  fin(x + d * 3, floor - 4, 14, d);
  R(x - 3, floor - 7, 7, 7, G.serpent);
  if (!view.reduced) for (let k = 0; k < 6; k++) R(x + d * 6 - d * k * 5, floor - 3 - ((v.t + k * 2) % 6), 2, 2, G.foam);
}

/** The serpent: its ring of foam, rising, rearing, spitting, ducking its own ball, dazed on the quay, its tail, its coils. */
function serpentArt(s: Serpent, v: View) {
  const t = v.t;
  const floor = s.def.floor;
  const age = t - s.since;
  const x = neckX(s);
  const base = floor + WATERLINE - 2;
  const sway = view.reduced ? 0 : Math.round(Math.sin(t * 0.07) * 2);
  if (s.phase === "beaten" || s.phase === "asleep") return;
  // Outlined as every enemy is (order 18); its tail, which hurts, with its rim in the warning colour, since
  // it is dark on the dark water; its fin breaking the water before it is not outlined.
  if (s.tail) {
    if (tailBox(s, v.t)) outlined(() => tailArt(s, v), undefined, ENEMY.warning);
    else tailArt(s, v);
  }
  if (s.phase === "ring" || s.phase === "rest" || s.phase === "dive" || s.phase === "duck") coils(s, v);
  if (s.phase === "ring") {
    // A dark shape under the water, and a ring of foam over it.
    const r = ringRadius(age, view.reduced);
    R(x - r + 3, floor + WATERLINE - 1, 2 * r - 6, 3, mix(PALETTE.waterDeep, INK, 0.4));
    for (let k = -r; k <= r; k++) {
      const dy = Math.round(Math.sqrt(Math.max(0, r * r - k * k)) * 0.35);
      // Where it will rise, its tell: the ring in the bosses' "now" colour (order 18).
      light(x + k, floor + WATERLINE + dy, 1, 1, "soft", ROLES.now);
      light(x + k, floor + WATERLINE - dy, 1, 1, "soft", ROLES.now);
    }
    return;
  }
  if (neckUp(s)) {
    const rising = s.phase === "rise" ? Math.min(1, age / SERPENT_STEPS.rise) : 1;
    const spit = s.phase === "spit";
    // Reared high through its tell; lowered and leaning out at him to spit; leaning his way, watching, after
    // its ball has hit him and while its tail lashes.
    const low = s.phase === "lash" || s.phase === "watch";
    const headY = spit ? mouth(s).y - 8 : low ? floor - SERPENT.rear + 10 : floor - Math.round((SERPENT.rear + 4) * rising);
    const lean = spit ? s.dir * 12 : low ? s.dir * 6 : -s.dir * 3;
    const tellK = s.phase === "rear" ? age / Math.max(1, SERPENT_STEPS.tell[Math.min(s.hits, 2)]) : 0;
    const open = spit ? 4 : s.phase === "rear" && tellK > 0.5 ? (tellK > 0.8 ? 3 : 1) : 0;
    outlined(() => {
      serpentNeck(x, headY + 6, base, s.dir, lean, sway);
      serpentHead(x + lean + sway, headY, s.dir, open);
      // Its tell, plain to see: the throat swells pale as it gathers the brine.
      if (s.phase === "rear" && tellK > 0.3 && !view.reduced) R(x + lean + sway + s.dir * 2 - 3, headY + 11, 7, 3, ROLES.now);
      if (s.phase === "rear" && view.reduced) R(x + lean + s.dir * 2 - 3, headY + 11, 7, 3, ROLES.now);
    });
    if (s.phase === "rise" || (s.phase === "rear" && age < 40)) streaming(x, headY, base, age + (s.phase === "rear" ? SERPENT_STEPS.rise : 0), 10);
    return;
  }
  if (s.phase === "dazed" || s.phase === "reel") {
    // Its head on the quay, its jaw on the planks, the snout towards him, the eye shut, the tongue out, the
    // spines flat; its neck arching up out of the water behind it and over the quay's edge; little stars
    // of brine turning over it while it is dazed.
    const h = headBox(s);
    const d = s.dir;
    const hx = h.x + h.w / 2 - d * 2;
    const bx = hx - d * 18;
    outlined(() => {
      for (let y = floor - 9; y < base; y++) {
        const f = (y - floor + 9) / (base - floor + 9);
        bodyRow(bx + Math.round(d * 6 * (1 - f) ** 2), y, Math.round(12 + 6 * f), d, y);
      }
      for (let i = 0; i < 10; i++) bodyRow(hx - d * (14 - i), floor - 9 + Math.round(i * 0.3), 9, d, i);
      serpentHead(hx, h.y - 1, d, s.phase === "reel" ? 2 : 1, true);
    });
    if (s.phase === "dazed") for (let k = 0; k < 3; k++) {
      const a = view.reduced ? k * 2.1 : t * 0.1 + k * 2.1;
      // Its dazed head is where to hit it: the stars over it in the bosses' "now" colour (order 18).
      R(hx + Math.round(Math.cos(a) * 11), h.y - 8 + Math.round(Math.sin(a) * 2), 2, 2, ROLES.now);
      light(hx + Math.round(Math.cos(a) * 11), h.y - 8 + Math.round(Math.sin(a) * 2), 2, 2, "soft", "rgba(220, 240, 255, 0.6)");
    }
    return;
  }
  if ((s.phase === "dive" || s.phase === "duck") && !view.reduced) for (let k = 0; k < 8; k++) R(x - 14 + k * 4, floor + WATERLINE - ((age + k * 3) % 10), 2, 2, G.foam);
}

/** The rune coming up out of the water at the prow's foot and rising to its place, once the dawn has come (still, with reduced motion). */
function runeRising(s: Serpent, v: View, rune: { x: number; y: number }) {
  const age = endingAge(s, v.t);
  if (age === null || s.free || age < SERPENT_STEPS.dawn) return;
  const k = Math.min(1, (age - SERPENT_STEPS.dawn) / SERPENT_STEPS.rune);
  const e = view.reduced ? 1 : k * k * (3 - 2 * k);
  const from = s.def.floor + WATERLINE;
  const y = Math.round(from + (rune.y - from) * e);
  drawRune(rune.x, y, RUNE_CHARS[15], "lit", v.t, 15);
  light(rune.x - 4, y - 4, 24, 24, "soft", `rgba(255, 224, 140, ${(0.25 * (view.reduced ? 1 : k)).toFixed(2)})`);
  if (!view.reduced) for (let i = 0; i < 4; i++) R(rune.x + 3 + i * 3, y + 16 + ((v.t + i * 4) % 10), 1, 2, G.foam);
}

/** The ball of brine, flying at him (what it throws, in the enemy's colours, outlined); sent back by the shield, going home. */
function ballArt(s: Serpent, t: number) {
  const b = s.ball;
  if (!b) return;
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  if (!view.reduced) for (let k = 1; k < 4; k++) R(x - Math.sign(b.vx) * k * 4, y - 1 + ((t + k) % 2), 2, 1, G.foam);
  outlined(() => {
    R(x - 3, y - 4, 6, 8, ENEMY.poison);
    R(x - 4, y - 3, 8, 6, ENEMY.poison);
    R(x - 2, y - 2, 3, 2, ENEMY.poisonLight);
  });
  light(x - 4, y - 4, 8, 8, "soft", "rgba(190, 240, 120, 0.5)");
}

/**
 * The bishop's guard: while he is a statue, grey stone and not outlined (stone does not bite); woken, a
 * plum coat over red mail, his halberd levelled at him. Squat, his head where his box's top is. 13 x 10.
 */
function guardArt(e: Enemy) {
  const stone = !e.n;
  const draw = () => {
    const r = parts(e, 13);
    const coat = stone ? G.statue : ENEMY.plum;
    const mail = stone ? mix(G.statue, INK, 0.15) : ENEMY.red;
    const step = stone || view.reduced ? 0 : Math.floor(e.x / 3) % 2;
    r(3, -3, 3, 3 - step, mail);
    r(7, -3, 3, 3 - (1 - step), mail);
    r(2, -7, 9, 4, coat);
    r(3, -10, 7, 3, mail);
    r(3, -10, 7, 1, stone ? mix(G.statue, WHITE, 0.2) : ENEMY.redLight);
    r(8, -9, 1, 1, stone ? mix(G.statue, INK, 0.4) : ENEMY.eye);
    // The halberd: upright beside the statue; woken (order 19: a change of outline), levelled at him.
    if (stone) {
      r(12, -13, 1, 12, G.statue);
      r(12, -15, 2, 2, G.statue);
    } else {
      r(9, -6, 8, 1, ENEMY.orange);
      r(17, -7, 2, 3, ENEMY.pale);
    }
  };
  if (stone) plain(draw);
  else draw();
}

/** An archer on the wall walk: a red coat, a hood, a bow drawn as the shot comes. 11 x 16. */
function archerArt(e: Enemy, t: number) {
  const r = parts(e, 11);
  const up = windingUp(e, t);
  r(2, -5, 3, 5, ENEMY.plum);
  r(6, -5, 3, 5, ENEMY.plum);
  r(1, -12, 9, 7, ENEMY.red);
  r(3, -15, 6, 3, ENEMY.orangeLight);
  r(2, -16, 8, 2, ENEMY.red);
  r(7, -14, 1, 1, ENEMY.eye);
  // Drawing (order 19), the bow comes up two and bends further, the arrow on the string and his arm back.
  const lift = up ? 2 : 0;
  for (let k = -6; k <= 6; k++) r(11 + Math.round((1 - (k / 6) ** 2) * (up ? 3 : 2)), -10 - lift + k, 1, 1, ENEMY.orange);
  if (up) {
    r(5, -12, 8, 1, ENEMY.pale);
    r(3, -13, 3, 2, ENEMY.red);
  }
}

/** A goose of the market: an orange-light body, its neck up, an orange beak and feet. 14 x 13. */
function gooseArt(e: Enemy) {
  const r = parts(e, 14);
  r(1, -8, 11, 6, ENEMY.orangeLight);
  r(2, -6, 6, 1, ENEMY.orange);
  r(9, -12, 3, 6, ENEMY.orangeLight);
  r(10, -12, 3, 2, ENEMY.orangeLight);
  r(13, -11, 2, 1, ENEMY.orange);
  r(11, -11, 1, 1, ENEMY.eye);
  r(4, -2, 2, 2, ENEMY.orange);
  r(8, -2, 2, 2, ENEMY.orange);
}
/** A market dog: a plum coat, ears up, a wagging tail. 16 x 12. */
function dogArt(e: Enemy) {
  const r = parts(e, 16);
  const leg = view.reduced ? 0 : Math.floor(e.x / 3) % 2;
  r(1, -9, 13, 5, ENEMY.plum);
  r(11, -11, 5, 5, ENEMY.plum);
  r(15, -9, 2, 2, ENEMY.plumLight);
  r(13, -10, 1, 1, ENEMY.eye);
  r(11, -12, 1, 1, ENEMY.plum);
  r(0, -12, 1, 5, ENEMY.plum);
  r(12, -7, 2, 1, ENEMY.red);
  for (const dx of [2, 5, 9, 12]) r(dx, -4, 2, 4 - ((dx > 7 ? leg : 1 - leg) ? 1 : 0), ENEMY.plum);
}

function arrowArt(s: Shot, t: number) {
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  if (s.spent !== undefined) {
    const k = view.reduced ? 0 : Math.floor(t / 3) % 2;
    R(x - 3 + k, y - k * 2, 6 - k * 4, 1 + k * 3, ENEMY.orange);
    return;
  }
  const d = Math.hypot(s.vx, s.vy) || 1;
  for (let k = 0; k < 9; k++) R(x - Math.round((s.vx / d) * k), y - Math.round((s.vy / d) * k), 1, 1, k < 2 ? ENEMY.red : ENEMY.orange);
  R(x - Math.round((s.vx / d) * 9), y - Math.round((s.vy / d) * 9) - 1, 1, 3, ENEMY.plumLight);
}

const BOARDS: LedgeLook = { body: G.timber, top: G.timberLight, edge: G.timberDark, joint: G.timberDark };

export const GAMLEBYEN: LevelDef = {
  id: "gamlebyen",
  rune: 15,
  name: "Gamlebyen",
  landmark: { nb: "Ruinene", en: "The ruins" },
  place: { nb: "Gamlebyen", en: "Gamlebyen" },
  sky: "night",
  map: MAP,
  legend: { solid: "#RJ", oneWay: "=", water: "~" },
  risen: { solid: "Z", oneWay: "z" },
  ramps: [],
  carriers: LONGSHIPS,
  timed: [],
  cannons: [],
  // The card's last line: line 2's runes, and with all six, what is left to find.
  cardLine: {
    nb: (n, left) => (n === 6 ? `Seks av seks runer: VIKING. Igjen å finne: ${left === 0 ? "bedre tider." : `${left === 1 ? "én brakteat" : `${left} brakteater`} og bedre tider.`}` : `${["Null", "Én", "To", "Tre", "Fire", "Fem"][n] ?? n} av seks runer på linje 2. Resten ligger langs linja.`),
    en: (n, left) => (n === 6 ? `Six of six runes: VIKING. Still to find: ${left === 0 ? "better times." : `${left === 1 ? "one bracteate" : `${left} bracteates`}, and better times.`}` : `${["None", "One", "Two", "Three", "Four", "Five"][n] ?? n} of six runes on line 2. The rest are along the line.`)
  },
  // Every enemy here keeps the box it had before order 18: growing them cost the sloppy player more than 0.3 hearts a run.
  enemies: keepBoxes(ENEMIES),
  grounds: GROUNDS,
  rules: RULES,
  boss: serpentBoss(SERPENT_DEF),
  bossWords: {
    wake: { nb: "Vannet ved kaia rører seg.\nDet er noe stort der nede.", en: "The water by the quay stirs.\nSomething large is down there." },
    hit: { nb: "Rett i hodet.", en: "Right on the head." },
    beaten: { nb: "Ormen synker. Vannet blir stille.", en: "The serpent sinks. The water goes still." },
    // Shown beside it, each only when it is true; again after ten seconds of nothing, unless he has done it since.
    // Its ball hit him facing it, or went past him: the shield was not up.
    miss: { nb: "Løft skjoldet mens den reiser seg.\nDa går kula tilbake dit den kom fra.", en: "Raise the shield while it rears.\nThe ball goes back where it came from." },
    // Its ball hit his back.
    missTurn: { nb: "Snu deg mot den med skjoldet.\nDet tar bare det som kommer forfra.", en: "Face it with the shield.\nIt only stops what comes from in front." },
    missHead: { nb: "Den ligger svimeslått på kaia.\nHopp opp på hodet dens.", en: "It lies stunned on the quay.\nJump on its head." },
    missTail: { nb: "Halen kommer langs kaia.\nHopp over den.", en: "Its tail comes along the quay.\nJump it." }
  },
  floor: (x) => {
    const c = Math.floor(x / TILE);
    return (c < 138 ? STREET + 2 : c < 176 ? TOWN + 6 : c < 213 ? MARKET + 3 : QUAY + 3) * TILE;
  },
  signs: [
    {
      label: { nb: "Gamlebyen", en: "Gamlebyen" },
      lines: { nb: ["Her lå Oslo i seks hundre år.", "Så brant det, og byen flyttet."], en: ["Oslo stood here for six hundred years.", "Then it burned, and the town moved."] }
    },
    {
      label: { nb: "Ruinene", en: "The ruins" },
      lines: { nb: ["Steinene ligger der de falt.", "De fleste."], en: ["The stones lie where they fell.", "Most of them."] }
    },
    {
      label: { nb: "Vannspeilet", en: "The water mirror" },
      lines: { nb: ["Her gikk strandkanten.", "Fjorden har flyttet seg siden."], en: ["The shore was here.", "The fjord has moved since."] }
    },
    {
      label: { nb: "Havna", en: "The harbour" },
      lines: { nb: ["Fiskerne snakker om noe i vannet.", "Ingen har sett det tørt."], en: ["The fishermen speak of something in the water.", "No one has seen it dry."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: (v) => far(v),
    mid: () => mid(),
    back(v) {
      shown = v.grounds as Ruins | null;
      shownT = v.t;
      endAge = endOf(v);
      calm = dawnOf(v);
      tbaneDoor(v.doors.get("tbane"));
      // The modern street's lamps; the medieval town's torches from the town wall on.
      for (const c of [10, 22, 31]) streetLamp(c * TILE + 8, STREET * TILE);
      church();
      bishop();
      townWall();
      for (const c of [140, 158, 170]) torch(c * TILE + 6, TOWN * TILE, v.t, isOut(c));
      for (const c of [179, 185, 203, 210]) torch(c * TILE + 6, MARKET * TILE, v.t, isOut(c));
      for (const c of QUAY_TORCHES) torch(c * TILE + 6, QUAY * TILE, v.t, isOut(c));
      market(v.t);
      // The dig in the park: a rope round it on stakes.
      for (const x of [23 * TILE + 12, 26 * TILE + 2]) R(x, STREET * TILE - 10, 2, 10, G.timber);
      R(23 * TILE + 12, STREET * TILE - 9, 2 * TILE + 6, 1, G.rope);
      // The tower that builds itself: courses of stone under its top, down to the bank.
      const s = v.grounds as Ruins | null;
      if (s) for (let y = s.y + 6; y < TOWER.low; y += 8) R(TOWER.x + 2, y, TOWER.w - 4, 7, (y >> 3) % 2 ? G.risen : mix(G.risen, G.stone, 0.4));
      lastLongship(v.t);
    },
    front(v) {
      reflections(v);
      closing(v);
      const s = v.grounds as Ruins | null;
      if (s) {
        R(TOWER.x, s.y, TOWER.w, 6, G.risen);
        R(TOWER.x, s.y, TOWER.w, 1, G.risenLight);
      }
      const sp = v.boss as Serpent | null;
      if (sp) {
        ballArt(sp, v.t);
        runeRising(sp, v, RUNE_AT);
      }
    },
    carrier(i, at) {
      longship(at.x, at.y, LONGSHIPS[i].w);
    },
    ground: (c) => (c < 99 ? { top: G.grass, dot: G.grassDark, fill: G.earth } : { top: G.cobble, dot: G.cobbleDark, fill: G.earth }),
    tile(t, c, r, x, y, map) {
      if (t === "~") return calmWater(c, r, x, y, map);
      if (t === "Z" || t === "z") stoneTile(c, r, x, y, t === "Z");
      else if (t === "R") oldStone(c, r, x, y, map);
      else if (t === "J") quayPlank(c, x, y);
      else return false;
      return true;
    },
    ledges: { "=": BOARDS },
    enemy(e, v) {
      if (!e.alive) return false;
      if (e.def.look === "guard") guardArt(e);
      else if (e.def.look === "archer") archerArt(e, v.t);
      else if (e.def.look === "goose") gooseArt(e);
      else if (e.def.look === "dog") dogArt(e);
      else return drawLook(e, v.t);
      return true;
    },
    shot(s, v) {
      arrowArt(s, v.t);
      return true;
    },
    boss: (state, v) => serpentArt(state as Serpent, v)
  }
};

