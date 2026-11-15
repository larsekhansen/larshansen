import { column, layerWorldX } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { INK, WHITE } from "@larshansen/pixelkit/palette";
import type { Body, Carrier } from "@larshansen/pixelkit/physics";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import * as G from "@larshansen/pixelkit/swatches/ruins";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import { windingUp, type Enemy, type EnemyDef, type Shot } from "../game/enemies";
import { SERPENT_STEPS, bodyBox, headBox, neckX, ringRadius, serpentBoss, tailBox, type Serpent, type SerpentDef } from "../game/serpent";
import { tbaneDoor } from "../render/furniture";
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
/** The stepping stones, a row over the water: they rise as he comes. */
export const STEPS = [[101, 102], [105, 106], [109, 110], [113, 114], [117, 118], [121, 122], [125, 125]];
for (const [c0, c1] of STEPS) b.run(c0, c1, BANK - 1, "z");
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
b.put(16, STREET - 1, "f").put(52, STREET - 1, "f").put(96, BANK - 1, "f").put(139, TOWN - 1, "f").put(182, MARKET - 1, "f").put(216, QUAY - 1, "f");
b.put(205, MARKET - 1, "b").put(243, QUAY - 1, "b");
b.put(270, QUAY - 3, "r").put(195, 3, "o").put(CRYPT + 3, STREET + 1, "&");

// Skilling: over the park's walls and the dig, up the church's rising stones, in the crypt, along the bishop's
// wall, over the stepping stones, up the tower, along the wall walk under the arches, over the market's roofs,
// over the longships, along the quay.
const COINS: [number, number][] = [
  [10, 18], [12, 16], [13, 16], [20, 15], [24, 16], [25, 16],
  [36, 14], [38, 14], [41, 12], [44, 10], [48, 7], [49, 7], [56, 20], [57, 20],
  [64, 13], [68, 13], [72, 13], [76, 13], [80, 13], [84, 13], [88, 13],
  [100, 15], [103, 14], [107, 14], [111, 14], [115, 14], [119, 14], [123, 14],
  [136, 14], [136, 12], [137, 10],
  [143, 9], [147, 9], [151, 9], [155, 9], [159, 9], [163, 9], [167, 9], [171, 9],
  [180, 11], [184, 11], [189, 8], [192, 6], [196, 6], [201, 11],
  [218, 12], [223, 11], [226, 11], [230, 11], [233, 11], [238, 12],
  [249, 12], [255, 12], [261, 12], [266, 12]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();

// --- The stones that rise ----------------------------------------------------------------------------------

/** Every stone of the map that rises: where it is, whether it is a wall (solid) or a ledge, and whether it waits for him to pass. */
export const STONES = MAP.flatMap((row, r) => [...row].flatMap((ch, c) => (ch === "Z" || ch === "z" ? [{ c, r, wall: ch === "Z", behind: CLOSERS.includes(c) }] : [])));
const STONE_AT = new Map(STONES.map((s, i) => [s.r * COLS + s.c, i]));
/** Steps a stone takes to rise; how near he must come (tiles across, and up or down). */
export const RISE = { steps: 20, near: 5, up: 7, behind: 3 };

/** The tower that builds itself under his feet: where it stands, how low and how high it goes, how fast, how long it waits for him before it sinks back. */
export const TOWER = { x: 136 * TILE, w: 2 * TILE, low: BANK * TILE, high: TOWN * TILE, up: 1, down: 1, wait: 180 };

export interface Ruins {
  /** The step each stone began to rise, or null; whether it has risen (and is ground). */
  at: (number | null)[];
  up: boolean[];
  /** The tower's top now and a step ago, and the last step he stood on it. */
  y: number;
  prevY: number;
  stood: number;
}

const onTower = (s: Ruins, him: Body) => him.onGround && Math.abs(him.y + PLAYER.h - s.y) < 0.01 && him.x + PLAYER.w > TOWER.x && him.x < TOWER.x + TOWER.w;

/** Does a stone's tile hold his body (so it waits before it sets)? */
const inStone = (st: (typeof STONES)[number], him: Body) => him.x < (st.c + 1) * TILE && him.x + PLAYER.w > st.c * TILE && him.y < (st.r + 1) * TILE && him.y + PLAYER.h > st.r * TILE;

export const GROUNDS: Grounds<Ruins> = {
  create: () => ({ at: STONES.map(() => null), up: STONES.map(() => false), y: TOWER.low, prevY: TOWER.low, stood: -999 }),
  carriers: (s) => [{ x: TOWER.x, y: s.y, w: TOWER.w, dx: 0, dy: s.y - s.prevY }],
  after(s, t, him) {
    const hx = him.x + PLAYER.w / 2;
    const feet = him.y + PLAYER.h;
    STONES.forEach((st, i) => {
      if (s.at[i] === null) {
        const near = st.behind ? hx > (st.c + RISE.behind) * TILE : Math.abs(hx - (st.c * TILE + TILE / 2)) < RISE.near * TILE && Math.abs(feet - st.r * TILE) < RISE.up * TILE;
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
  }
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

/** The serpent's quay, its three places, where he wakes it. */
export const SERPENT_DEF: SerpentDef = {
  floor: QUAY * TILE,
  x0: 246 * TILE,
  x1: COLS * TILE,
  points: [252 * TILE + 8, 259 * TILE + 8, 266 * TILE + 8],
  wakeAt: 247 * TILE
};

/** The two longships he crosses the basin on: their decks, rocking a little on the water. */
export const LONGSHIPS: CarrierDef[] = [
  { kind: "bob", x: 224 * TILE, y: QUAY * TILE + 4, w: 4 * TILE, rise: 2, period: 150 },
  { kind: "bob", x: 230 * TILE, y: QUAY * TILE + 4, w: 4 * TILE, rise: 2, period: 170, offset: 60 }
];

/**
 * A rat by the park's walls, an owl over the dig; three guards on the bishop's wall, stone until he comes
 * near; a rat in the crypt by the cheese; the two archers on the wall walk's arches, who shoot straight down
 * the walk at where a man coming will be (and not at one within four tiles of them, or past them); two
 * geese and a dog in the market.
 */
export const ENEMIES: EnemyDef[] = [
  { kind: "walker", look: "rat", c: 9, r: STREET - 1, range: 2 },
  { kind: "flyer", look: "owl", c: 27, r: STREET - 4, range: 2, rise: 6, period: 180 },
  { kind: "walker", look: "guard", c: 70, r: WALL - 1, range: 2, speed: 0.4 },
  { kind: "walker", look: "guard", c: 78, r: WALL - 1, range: 2, speed: 0.4, dir: -1 },
  { kind: "walker", look: "guard", c: 86, r: WALL - 1, range: 2, speed: 0.4 },
  { kind: "walker", look: "rat", c: 57, r: STREET + 1, range: 1 },
  { kind: "thrower", look: "archer", c: 150, r: TOWN - 4, period: 120, straight: true, lead: true, faces: -1, reach: 10, blind: 4 },
  { kind: "thrower", look: "archer", c: 162, r: TOWN - 4, period: 120, offset: 60, straight: true, lead: true, faces: -1, reach: 10, blind: 4 },
  { kind: "walker", look: "goose", c: 195, r: MARKET - 1, range: 2, speed: 0.45 },
  { kind: "walker", look: "goose", c: 200, r: MARKET - 1, range: 1, speed: 0.45, dir: -1 },
  { kind: "walker", look: "dog", c: 210, r: MARKET - 1, range: 1, speed: 0.5 }
];

export const GAMLEBYEN_RULES = { COLS, ROWS };

// --- Art ----------------------------------------------------------------------------------------------------

/** The stones' state as this frame draws it (set in `back`, read by `tile`, which has no view of its own). */
let shown: Ruins | null = null;
let shownT = 0;

/** How far up a stone has come (0: not at all, 1: risen). */
function risenBy(c: number, r: number): number {
  const i = STONE_AT.get(r * COLS + c);
  if (i === undefined || !shown) return 0;
  if (shown.up[i]) return 1;
  const at = shown.at[i];
  return at === null ? 0 : Math.min(0.95, (shownT - at) / RISE.steps);
}

/** The serpent has gone under for good: the water goes still and the dawn comes. */
const dawnOf = (v: View) => {
  const s = v.boss as Serpent | null;
  return s && s.phase === "beaten" ? Math.min(1, (v.t - s.since) / 240) : 0;
};

/** The far shore, the fjord in the dark, and (once the serpent is beaten) the dawn coming up over it. */
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
    if (Math.floor(wx) % 29 === 0) light(x + view.camX, top(x) + 5, 1, 1);
  }
  if (dawn <= 0) return;
  // The dawn, after the night's tint (its own light): a warm band over the far shore, strongest where the
  // sun is coming up, and the sun's rim over the hills.
  const sx = Math.round(view.w * 0.7);
  for (let x = 0; x < view.w; x++) {
    const near = dawn * (0.35 + 0.65 * Math.max(0, 1 - Math.abs(x - sx) / 240));
    for (let i = 0; i < 6; i++) {
      const y0 = horizon - 90 + i * 12;
      const y1 = Math.min(y0 + 12, top(x));
      if (y1 > y0) light(x + view.camX, y0, 1, y1 - y0, "soft", `rgba(${G.dawn}, ${(0.05 * (i + 1) * near).toFixed(3)})`);
    }
  }
  for (let k = -9; k <= 9; k++) {
    const h = Math.round(Math.sqrt(81 - k * k) * dawn);
    const y0 = horizon - 22 - h;
    const y1 = Math.min(horizon - 22 + h, top(sx + k));
    if (y1 > y0) light(sx + k + view.camX, y0, 1, y1 - y0, "soft", G.dawnSky);
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

/** A torch on a post, its flame flickering (still, with reduced motion), its light on the ground. */
function torch(x: number, ground: number, t: number) {
  R(x, ground - 22, 2, 22, G.torch);
  R(x - 1, ground - 24, 4, 3, G.timberDark);
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
  const tt = view.reduced ? 0 : v.t;
  const streak = (x: number, y0: number, n: number, rgb: string) => {
    for (let k = 0; k < n; k++) {
      const w = 6 - Math.min(4, k);
      light(Math.round(x - w / 2 + Math.sin(tt * 0.05 + k) * 2), y0 + 3 + k * 4, w, 1, "soft", `rgba(${rgb}, ${(0.5 - k * 0.07).toFixed(2)})`);
    }
  };
  for (const c of [214, 238, 246, 256, 264]) streak(c * TILE + 7, (QUAY + 1) * TILE, 6, "255, 190, 110");
  streak(117 * TILE, BANK * TILE, 4, "200, 220, 255");
  for (let x = Math.max(213 * TILE, view.camX); x < view.camX + view.w; x += 37) light(x, (QUAY + 1) * TILE + 6 + ((x * 7) % 9), 3, 1, "soft", "rgba(170, 200, 255, 0.25)");
}

/** A longship moored at the quay's end: its hull, the shields along its side, the prow with its dragon. */
function lastLongship(t: number) {
  const g = QUAY * TILE;
  const x0 = 262 * TILE;
  const x1 = COLS * TILE;
  const bob = view.reduced ? 0 : Math.round(Math.sin(t * 0.03));
  for (let x = x0; x < x1; x++) R(x, g + 4 + bob, 1, 8 + Math.round(((x - x0) / (x1 - x0)) * 4), G.hull);
  for (let x = x0 + 6; x < x1 - 8; x += 10) {
    R(x, g + 2 + bob, 7, 7, x % 20 ? G.cloth : G.sail);
    R(x + 3, g + 5 + bob, 1, 1, INK);
  }
  // The prow rising to the raised deck at the end, the dragon's neck over it.
  R(268 * TILE, (QUAY - 2) * TILE + 4, 4 * TILE, 2 * TILE - 4, G.hull);
  for (let k = 0; k < 18; k++) R(COLS * TILE - 6 + Math.round(Math.sin(k * 0.25) * 2), (QUAY - 2) * TILE - k, 3, 1, G.dragon);
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
  if (wall) for (let yy = top + 5; yy < y + TILE; yy += 6) R(x, yy, TILE, 1, G.mortar);
  else {
    R(x, top + shown - 1, TILE, 1, mix(G.risen, INK, 0.3));
    // A stepping stone stands on its own pillar down into the water.
    if (k >= 1) R(x + 2, y + 6, TILE - 4, TILE - 6, mix(G.risen, G.stone, 0.5));
  }
  R(x + (c % 2) * 8, top, 1, shown, mix(G.risen, INK, 0.25));
  if (k < 1 && !view.reduced) for (let i = 0; i < 3; i++) R(x + 2 + i * 5, top + shown - 1 - ((shownT + i * 3) % 4), 1, 1, G.risenLight);
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

/** The moonlit rim on the serpent after dark, as an enemy's (ADR 0023). */
const RIM = "rgba(201, 216, 255, 0.55)";

/** The serpent: its ring of foam, rising, rearing, spitting, dazed on the quay, diving, its tail along the quay. */
function serpentArt(s: Serpent, v: View) {
  const t = v.t;
  const floor = s.def.floor;
  const age = t - s.since;
  const x = neckX(s);
  if (s.phase === "ring") {
    const r = ringRadius(age, view.reduced);
    for (let k = -r; k <= r; k++) {
      const dy = Math.round(Math.sqrt(Math.max(0, r * r - k * k)) * 0.35);
      light(x + k, floor + 6 + dy, 1, 1, "soft", G.foam);
      light(x + k, floor + 6 - dy, 1, 1, "soft", G.foam);
    }
    return;
  }
  if (s.phase === "rise" || s.phase === "rear" || s.phase === "spit") {
    const box = bodyBox(s, t);
    const sway = view.reduced ? 0 : Math.round(Math.sin(t * 0.08) * 1.5);
    for (let y = box.y + 8; y < floor + 10; y++) {
      const curve = Math.round(Math.sin((y - box.y) * 0.12) * 2) + sway;
      R(x - 5 + curve, y, 10, 1, y % 4 ? G.serpent : G.serpentDark);
      R(x - 5 + curve + (s.dir > 0 ? 7 : 0), y, 3, 1, G.serpentBelly);
    }
    // The head: reared high with its mouth shut through the tell; lowered with its mouth open to spit.
    const low = s.phase === "spit";
    const hy = low ? floor - 16 : box.y;
    const hx = x + s.dir * 4 + sway;
    R(hx - 8, hy, 16, 9, G.serpent);
    R(hx - 8, hy, 16, 1, G.serpentLight);
    R(hx + s.dir * 7, hy + 2, 6, 5, G.serpent);
    R(hx + s.dir * 3, hy + 2, 2, 2, "#ffe066");
    // After the night's tint: eye-shine, and a pale rim along its neck and head, so it reads in the dark.
    light(hx + s.dir * 3, hy + 2, 2, 2, "lamp", "#ffe066");
    light(hx - 8, hy - 1, 16, 1, "soft", RIM);
    for (let y = box.y + 9; y < floor; y += 3) light(x - 6 + Math.round(Math.sin((y - box.y) * 0.12) * 2) + sway, y, 1, 2, "soft", RIM);
    for (let k = 0; k < 4; k++) R(hx - s.dir * (4 + k * 3), hy - 3 + (k % 2), 2, 3, G.serpentDark);
    if (low || (s.phase === "rear" && age > SERPENT_STEPS.tell[2] / 2)) {
      R(hx + s.dir * 9, hy + 6, 6, 3, mix(G.cloth, INK, 0.3));
      R(hx + s.dir * 9, hy + 6, 6, 1, G.brine);
    }
    return;
  }
  if (s.phase === "dazed" || s.phase === "reel") {
    // Its head on the quay's edge, eyes shut; little stars of brine turning over it while it is dazed.
    const h = headBox(s);
    for (let y = h.y + h.h; y < floor + 10; y++) R(x - 4, y, 8, 1, G.serpentDark);
    R(h.x, h.y + 2, h.w, h.h - 2, G.serpent);
    R(h.x, h.y + 2, h.w, 1, G.serpentLight);
    R(h.x + (s.dir > 0 ? h.w - 7 : 3), h.y + 5, 4, 1, INK);
    light(h.x, h.y + 1, h.w, 1, "soft", RIM);
    if (s.phase === "dazed" && !view.reduced) for (let k = 0; k < 3; k++) R(h.x + h.w / 2 + Math.round(Math.cos(t * 0.1 + k * 2.1) * 9), h.y - 4 + Math.round(Math.sin(t * 0.1 + k * 2.1) * 2), 2, 2, G.brine);
    return;
  }
  if (s.phase === "dive" && !view.reduced) for (let k = 0; k < 6; k++) R(x - 10 + k * 4, floor + 4 - ((age + k * 3) % 8), 2, 2, G.foam);
  if (s.phase === "tail") {
    const tb = tailBox(s, t);
    if (!tb && s.tail) {
      // The tip breaking the water at the quay's end: the warning.
      const wx = s.tail.x - s.tail.dir * 6;
      R(wx - 3, floor + 2, 6, 6, G.serpentDark);
      R(wx - 6, floor + 6, 12, 2, G.foam);
      return;
    }
    if (tb) {
      light(tb.x, tb.y + 1, tb.w, 1, "soft", RIM);
      R(tb.x, tb.y + 2, tb.w, tb.h - 2, G.serpent);
      R(tb.x, tb.y + 2, tb.w, 1, G.serpentLight);
      for (let k = 0; k < 3; k++) R(tb.x + 3 + k * 5, tb.y - 1, 2, 3, G.serpentDark);
      if (!view.reduced) for (let k = 0; k < 4; k++) R(tb.x - (s.tail?.dir ?? 1) * (4 + k * 4), floor - 2 - (k % 2), 2, 2, G.foam);
    }
  }
}

/** The ball of brine, flying at him; sent back by the shield, going home. */
function ballArt(s: Serpent, t: number) {
  const b = s.ball;
  if (!b) return;
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  R(x - 3, y - 3, 6, 6, G.brine);
  R(x - 2, y - 2, 2, 2, WHITE);
  light(x - 3, y - 3, 6, 6, "soft", "rgba(207, 232, 240, 0.7)");
  if (!view.reduced) for (let k = 1; k < 4; k++) R(x - Math.sign(b.vx) * k * 4, y - 1 + ((t + k) % 2), 2, 1, G.foam);
}

/** A guard of the bishop's: a statue of grey stone until he comes near; then mail and a red coat, a spear. */
function guardArt(e: Enemy) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const stone = !e.n;
  const coat = stone ? G.statue : G.guardCoat;
  const mail = stone ? mix(G.statue, INK, 0.15) : G.guardMail;
  const f = e.dir;
  const step = stone || view.reduced ? 0 : Math.floor(e.x / 3) % 2;
  R(x - 3, y - 4, 2, 4 - step, mail);
  R(x + 1, y - 4, 2, 4 - (1 - step), mail);
  R(x - 4, y - 10, 8, 6, coat);
  R(x - 3, y - 13, 6, 3, mail);
  R(x - 3, y - 14, 6, 1, mix(mail, WHITE, 0.2));
  R(f > 0 ? x + 1 : x - 2, y - 11, 1, 1, stone ? mix(G.statue, INK, 0.4) : INK);
  R(f > 0 ? x + 5 : x - 6, y - 16, 1, 14, stone ? G.statue : G.timberLight);
  R(f > 0 ? x + 4 : x - 7, y - 18, 3, 2, stone ? G.statue : G.guardMail);
}

/** An archer on the arch: a green coat, a bow drawn as he makes ready. */
function archerArt(e: Enemy, t: number) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const up = windingUp(e, t);
  R(x - 3, y - 4, 2, 4, G.timberDark);
  R(x + 1, y - 4, 2, 4, G.timberDark);
  R(x - 4, y - 10, 8, 6, G.archerCoat);
  R(x - 2, y - 13, 5, 3, "#e0b48a");
  R(x - 3, y - 14, 6, 2, G.archerCoat);
  R(e.dir > 0 ? x + 1 : x - 2, y - 12, 1, 1, INK);
  const bx = e.dir > 0 ? x + 5 : x - 6;
  for (let k = -5; k <= 5; k++) R(bx + Math.round((1 - (k / 5) ** 2) * (up ? 3 : 2)) * e.dir, y - 9 + k, 1, 1, G.timberLight);
  if (up) R(Math.min(bx, x) , y - 9, Math.abs(bx - x), 1, G.sail);
}

/** A goose, white, its neck out as it comes; a dog, brown, its tail up. */
function gooseArt(e: Enemy) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const at = (dx: number) => (e.dir > 0 ? x + dx : x - dx);
  R(x - 5, y - 6, 10, 5, G.goose);
  R(at(4), y - 11, 2, 6, G.goose);
  R(at(5), y - 11, 3, 2, G.goose);
  R(e.dir > 0 ? at(8) : at(9), y - 10, 2, 1, G.gooseBeak);
  R(at(6), y - 11, 1, 1, INK);
  R(x - 2, y - 1, 1, 1, G.gooseBeak);
  R(x + 1, y - 1, 1, 1, G.gooseBeak);
}
function dogArt(e: Enemy) {
  const x = Math.round(e.x);
  const y = Math.round(e.y);
  const at = (dx: number) => (e.dir > 0 ? x + dx : x - dx);
  const leg = view.reduced ? 0 : Math.floor(e.x / 3) % 2;
  R(x - 6, y - 7, 12, 4, G.dog);
  R(at(5), y - 10, 4, 4, G.dog);
  R(e.dir > 0 ? at(8) : at(9), y - 8, 2, 2, mix(G.dog, INK, 0.3));
  R(at(6), y - 9, 1, 1, INK);
  R(at(-7), y - 10, 1, 4, G.dog);
  for (const dx of [-5, -2, 2, 5]) R(x + dx, y - 3, 1, 3 - ((dx > 0 ? leg : 1 - leg) ? 1 : 0), mix(G.dog, INK, 0.2));
}

/** An arrow: a thin shaft with its head; stopped by the shield, it drops, spinning. */
function arrowArt(s: Shot, t: number) {
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  if (s.spent !== undefined) {
    const k = view.reduced ? 0 : Math.floor(t / 3) % 2;
    R(x - 3 + k, y - k * 2, 6 - k * 4, 1 + k * 3, G.timberLight);
    return;
  }
  const d = Math.hypot(s.vx, s.vy) || 1;
  for (let k = 0; k < 8; k++) R(x - Math.round((s.vx / d) * k), y - Math.round((s.vy / d) * k), 1, 1, k < 2 ? G.guardMail : G.timberLight);
  R(x - Math.round((s.vx / d) * 8), y - Math.round((s.vy / d) * 8) - 1, 1, 3, G.sail);
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
  enemies: ENEMIES,
  grounds: GROUNDS,
  rules: RULES,
  boss: serpentBoss(SERPENT_DEF),
  bossWords: {
    wake: { nb: "Vannet ved kaia rører seg.\nNoe stort er under.", en: "The water by the quay stirs.\nSomething large is under it." },
    hit: { nb: "Rett i hodet.", en: "Right on the head." },
    beaten: { nb: "Ormen synker. Vannet blir stille.", en: "The serpent sinks. The water goes still." },
    // Shown beside it: a round with no dazing, a dazing with no stomp; again after ten seconds of nothing.
    miss: { nb: "Hold skjoldet opp når den spytter.\nKula går tilbake dit den kom fra.", en: "Hold the shield up as it spits.\nThe ball goes back where it came from." },
    missHead: { nb: "Den ligger svimeslått på kaia.\nHopp på hodet.", en: "It lies stunned on the quay.\nJump on its head." }
  },
  floor: (x) => {
    const c = Math.floor(x / TILE);
    return (c < 138 ? STREET + 2 : c < 176 ? TOWN + 6 : c < 213 ? MARKET + 3 : QUAY + 3) * TILE;
  },
  signs: [
    {
      label: { nb: "Gamlebyen", en: "Gamlebyen" },
      lines: { nb: ["Her lå Oslo i fem hundre år.", "Så brant det, og byen flyttet."], en: ["Oslo stood here for five hundred years.", "Then it burned, and the town moved."] }
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
      tbaneDoor(v.doors.get("tbane"));
      // The modern street's lamps; the medieval town's torches from the town wall on.
      for (const c of [10, 22, 31]) streetLamp(c * TILE + 8, STREET * TILE);
      church();
      bishop();
      townWall();
      for (const c of [140, 158, 170]) torch(c * TILE + 6, TOWN * TILE, v.t);
      for (const c of [179, 185, 203, 210]) torch(c * TILE + 6, MARKET * TILE, v.t);
      for (const c of [214, 238, 246, 256, 264]) torch(c * TILE + 6, QUAY * TILE, v.t);
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
      const s = v.grounds as Ruins | null;
      if (s) {
        R(TOWER.x, s.y, TOWER.w, 6, G.risen);
        R(TOWER.x, s.y, TOWER.w, 1, G.risenLight);
      }
      const sp = v.boss as Serpent | null;
      if (sp) ballArt(sp, v.t);
    },
    carrier(i, at) {
      longship(at.x, at.y, LONGSHIPS[i].w);
    },
    ground: (c) => (c < 99 ? { top: G.grass, dot: G.grassDark, fill: G.earth } : { top: G.cobble, dot: G.cobbleDark, fill: G.earth }),
    tile(t, c, r, x, y, map) {
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
      else return false;
      return true;
    },
    shot(s, v) {
      arrowArt(s, v.t);
      return true;
    },
    boss: (state, v) => serpentArt(state as Serpent, v)
  }
};

