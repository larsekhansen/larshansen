import { TILE } from "@larshansen/pixelkit/config";
import { TORCH, drawDark as drawNight, type Light } from "@larshansen/pixelkit/dark";
import { R, ctx, light, mix, stoneColumn, target, view, wdisc } from "@larshansen/pixelkit/paint";
import { LAMP, PALETTE, STONE } from "@larshansen/pixelkit/palette";
import { playerPixels, TOP_SIZE } from "@larshansen/pixelkit/person";
import { snap, sx, sy, unit, textCtx } from "@larshansen/pixelkit/text";
import { COLS, LEVELS, ROWS, findTiles, finishOf, isWall, mapInfo, ravenTile, startCentre, startOf, type Cell, type LevelDef, type Portal } from "./levels";
import { drawFeather } from "./feather";
import { FALL_STEPS, levelDef, sliderRise, sliderSolid, sliderWarning, type Stone } from "./rules";

// Drawing the mound, top down, in the front page's pixels. Everything is whole art pixels, made of
// the kit's rectangle helpers and anchored to the tile map. The still parts (floor, stone walls,
// the start pad) are drawn once per level onto a canvas the size of the map, and the parts that
// move or glow (the curse line, torches, stones, snakes, the raven) are drawn over it every frame.

const P = PALETTE;
/** The colour of the void outside the map and behind the glow. */
export const VOID = "#14110f";
/** The front face of a wall that has floor below it, and how tall it is. */
const FACE = 5;
const FACE_DARK = mix(STONE.dark, "#000000", 0.34);
const PAD_STONE = { base: mix(STONE.base, "#ffffff", 0.3), light: mix(STONE.light, "#ffffff", 0.3), dark: mix(STONE.dark, "#ffffff", 0.3) };

interface Seg {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Art {
  def: LevelDef;
  still: HTMLCanvasElement;
  /** One-pixel lines on the floor side of every wall. */
  curse: Seg[];
  torches: Cell[];
  raven: Cell;
  /** The raven looks toward the start pad: 1 to the right, -1 to the left. */
  ravenFacing: 1 | -1;
  /** True where the way on shows daylight: the entrance of the first level and the last finish. */
  daylightFinish: boolean;
  /** The rune key's tile, the iron gate's tiles and the crumbling floor's tiles. */
  key: Cell | null;
  gates: Cell[];
  crumbles: Cell[];
}

/** A small, fixed hash of a tile and a number, 0 to 1: the same earth on every visit. */
function hash(c: number, r: number, k: number) {
  let n = Math.imul(c + 101, 374761393) + Math.imul(r + 211, 668265263) + Math.imul(k + 7, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function drawFloor(c: number, r: number) {
  const x = c * TILE;
  const y = r * TILE;
  R(x, y, TILE, TILE, P.moundEarth);
  for (let i = 0; i < 12; i++) {
    const px = Math.floor(hash(c, r, i) * (TILE - 1));
    const py = Math.floor(hash(c, r, i + 40) * (TILE - 1));
    R(x + px, y + py, i % 3 === 0 ? 2 : 1, 1, i % 2 ? P.moundEarthDark : P.moundEarthLight);
  }
  // Sparse, subtle flagstones: about one tile in seven has one.
  if (hash(c, r, 99) < 0.15) {
    const w = 5 + Math.floor(hash(c, r, 100) * 3);
    const h = 3 + Math.floor(hash(c, r, 101) * 2);
    const fx = x + 2 + Math.floor(hash(c, r, 102) * (TILE - w - 4));
    const fy = y + 2 + Math.floor(hash(c, r, 103) * (TILE - h - 4));
    R(fx, fy + h, w, 1, mix(P.moundEarth, "#000000", 0.3));
    R(fx, fy, w, h, mix(P.moundEarth, "#9a9488", 0.45));
    R(fx, fy, w, 1, mix(P.moundEarth, "#ffffff", 0.3));
  }
}

/** A wall tile with floor anywhere around it (eight ways) is the stone lining of a tunnel. */
function lined(map: readonly string[], c: number, r: number) {
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!isWall(map, c + dc, r + dr)) return true;
  return false;
}

/** The rest of the mound is solid dark earth: one flat colour with a pebble now and then. */
function drawEarth(c: number, r: number) {
  const x = c * TILE;
  const y = r * TILE;
  R(x, y, TILE, TILE, P.moundDeep);
  if (hash(c, r, 7) < 0.33) R(x + Math.floor(hash(c, r, 8) * 15), y + Math.floor(hash(c, r, 9) * 15), 1, 1, P.moundDeepSpeck);
}

function drawWall(map: readonly string[], c: number, r: number) {
  if (!lined(map, c, r)) return drawEarth(c, r);
  const x = c * TILE;
  const y = r * TILE;
  for (let i = 0; i < TILE; i++) stoneColumn(x + i, y, y + TILE);
  if (isWall(map, c, r + 1)) return;
  // Floor below: the wall shows its front, darker, with two iron studs.
  const top = y + TILE - FACE;
  R(x, top, TILE, 1, STONE.light);
  R(x, top + 1, TILE, FACE - 1, FACE_DARK);
  for (let i = 3; i < TILE; i += 8) R(x + i, top + 1, 1, FACE - 1, STONE.mortar);
  R(x + 4, top + 2, 1, 1, P.iron);
  R(x + 11, top + 2, 1, 1, P.iron);
}

/** The carved start pad: flagstones with a ring cut into them. */
function drawPad(map: readonly string[]) {
  const s = startOf(map);
  const x = s.c * TILE;
  const y = s.r * TILE;
  R(x, y, TILE * 2, TILE * 2, STONE.mortar);
  for (let by = 0; by < 4; by++)
    for (let bx = 0; bx < 4; bx++) {
      const v = hash(s.c * 4 + bx, s.r * 4 + by, 5);
      R(x + bx * 8 + 1, y + by * 8 + 1, 7, 7, v < 0.4 ? PAD_STONE.dark : v < 0.8 ? PAD_STONE.base : PAD_STONE.light);
    }
  const ring = mix(STONE.dark, "#000000", 0.45);
  for (let dy = -TILE; dy < TILE; dy++)
    for (let dx = -TILE; dx < TILE; dx++) {
      const d = Math.hypot(dx + 0.5, dy + 0.5);
      if ((d >= 11 && d < 12.2) || (d >= 5 && d < 6)) R(x + TILE + dx, y + TILE + dy, 1, 1, ring);
    }
}

/** Stonework laid as a block, in the kit's stone. */
function stoneBlock(x: number, y: number, w: number, h: number) {
  for (let i = 0; i < w; i++) stoneColumn(x + i, y, y + h);
}

/**
 * The entrance on the first level: a doorway in the left wall of the start room, two jambs and a
 * lintel of stone round an opening of 9 x 24 art pixels. Returns the opening's top left corner.
 */
const ENTRANCE = { x: 3, y: 16 * TILE + 5, w: 9, h: 23 };
function drawEntrance() {
  stoneBlock(1, 16 * TILE + 1, 13, 4); // lintel
  stoneBlock(1, 16 * TILE + 1, 2, 30); // left jamb
  stoneBlock(12, 16 * TILE + 1, 2, 30); // right jamb
  stoneBlock(1, 17 * TILE + 12, 13, 3); // sill
  R(ENTRANCE.x, ENTRANCE.y, ENTRANCE.w, ENTRANCE.h, VOID);
}

/** A square stone frame round the 2 x 2 finish; the opening is 26 x 26. */
const FRAME = 3;
function drawFinish(f: Cell, daylight: boolean) {
  const x = f.c * TILE;
  const y = f.r * TILE;
  stoneBlock(x, y, TILE * 2, FRAME);
  stoneBlock(x, y + TILE * 2 - FRAME, TILE * 2, FRAME);
  stoneBlock(x, y + FRAME, FRAME, TILE * 2 - 2 * FRAME);
  stoneBlock(x + TILE * 2 - FRAME, y + FRAME, FRAME, TILE * 2 - 2 * FRAME);
  R(x + FRAME, y + FRAME, TILE * 2 - 2 * FRAME, TILE * 2 - 2 * FRAME, daylight ? VOID : "#0b0910");
  if (!daylight) {
    // Darkness inside, with a torch on the lintel's inner edge: it leads deeper.
    R(x + 15, y + 7, 2, 1, P.iron);
    R(x + 15, y + 8, 1, 2, P.woodDark);
  }
}

function build(def: LevelDef): Art {
  const { map } = def;
  const still = document.createElement("canvas");
  still.width = COLS * TILE;
  still.height = ROWS * TILE;
  // Draw onto the canvas of the whole map, at its own origin, then put the kit's target back.
  const outer = ctx();
  const camX = view.camX;
  const camY = view.camY;
  target(still.getContext("2d")!);
  view.camX = 0;
  view.camY = 0;

  const daylightFinish = def === LEVELS[LEVELS.length - 1];
  const curse: Seg[] = [];
  const torches: Cell[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (!isWall(map, c, r)) {
        drawFloor(c, r);
        continue;
      }
      drawWall(map, c, r);
      const x = c * TILE;
      const y = r * TILE;
      if (!isWall(map, c, r + 1)) curse.push({ x, y: y + TILE - 1, w: TILE, h: 1 });
      if (r > 0 && !isWall(map, c, r - 1)) curse.push({ x, y, w: TILE, h: 1 });
      if (c > 0 && !isWall(map, c - 1, r)) curse.push({ x, y, w: 1, h: TILE });
      if (c < COLS - 1 && !isWall(map, c + 1, r)) curse.push({ x: x + TILE - 1, y, w: 1, h: TILE });
      // A torch on every sixth lining wall with floor below it. (The order asked for column and row both
      // multiples of 6, but no wall in the three maps matches that, so the rule is column plus row a multiple of 6.)
      if ((c + r) % 6 === 0 && !isWall(map, c, r + 1)) {
        torches.push({ c, r });
        R(x + 7, y + 6, 1, 3, P.woodDark);
        R(x + 6, y + 8, 3, 1, P.iron);
      }
    }
  drawPad(map);
  if (def === LEVELS[0]) drawEntrance();
  drawFinish(finishOf(map), daylightFinish);

  target(outer);
  view.camX = camX;
  view.camY = camY;

  const raven = ravenTile(map);
  const key = findTiles(map, "k")[0] ?? null;
  return { def, still, curse, torches, raven, key, gates: findTiles(map, "g"), crumbles: findTiles(map, "c"), ravenFacing: startCentre(map).x < raven.c * TILE + TILE / 2 ? -1 : 1, daylightFinish };
}

const arts = new Map<LevelDef, Art>();
function artFor(def: LevelDef) {
  let a = arts.get(def);
  if (!a) arts.set(def, (a = build(def)));
  return a;
}

/** What the drawing needs to know about one moment of the game. */
export interface Frame {
  level: number;
  /** Steps since the scene began, blended with the next one: the clock of flames and snakes. */
  t: number;
  /** His centre. */
  x: number;
  y: number;
  stones: readonly Stone[];
  snakes: readonly { x: number; y: number; flat: boolean; dir: 1 | -1 }[];
  cursed: boolean;
  /** The level clock in steps, which the sliders run on. */
  clock: number;
  keyTaken: boolean;
  /** How far the gate has slid open, 0 to 1. */
  gate: number;
  /** Steps each crumbling tile has shaken ("col,row" to steps); FALL_STEPS or more is a pit. */
  crumble: ReadonlyMap<string, number>;
  /** Steps before the teleport stones work again: they burn low until then. */
  portalCool: number;
  /** The pair of teleport stones that just sent him, and how many steps ago (for their shimmer). */
  portalFlash: { pair: number; age: number } | null;
  /** Stones lit a moment ago, by index, and how many steps ago. */
  stoneFlash: ReadonlyMap<number, number>;
  /** Steps since he took the key, while it is still flying up out of sight; null otherwise. */
  keyFly: number | null;
  /** Steps since he stepped into the finish, while it flares; null otherwise. */
  finishFlash: number | null;
}

/** Steps a flash lasts: a teleport's shimmer, a stone lighting, the key flying up, the finish flaring. */
export const FLASH = { portal: 26, stone: 30, key: 24, finish: 30 } as const;

// The curse line pulses slowly between two reds, and flashes when it has just caught him.
function curseColor(f: Frame) {
  if (f.cursed && !view.reduced) return Math.floor(f.t / 4) % 2 ? P.curseFlash : P.curseBright;
  if (f.cursed || view.reduced) return P.curseBright;
  return mix(P.curse, P.curseBright, 0.5 + 0.5 * Math.sin(f.t * 0.045));
}

/** A standing stone is 8 x 12 in its tile; the rune is one stroke on it. */
const STONE_W = 8;
const STONE_H = 12;
const STONE_RUNE: [number, number][] = [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [4, 4], [5, 3], [4, 7], [5, 6]];
const stoneOrigin = (s: Stone) => ({ x: s.c * TILE + 4, y: s.r * TILE + 2 });

const RAVEN = ["..kkk..", ".kkkebb", "kkkkkb.", "kkkkkk.", ".kkkk..", "..f.f.."];

/** The raven's head is its first three rows: it turns toward him, while the body keeps facing the start pad. */
const RAVEN_HEAD = 3;

function drawRaven(a: Art, f: Frame) {
  const x = a.raven.c * TILE + 4;
  const y = a.raven.r * TILE + 2;
  const blink = f.t % 200 < 7;
  // It looks at him once he is more than a few pixels to one side; straight below, it keeps its pose.
  const dx = f.x - (x + 3.5);
  const head = dx > 6 ? 1 : dx < -6 ? -1 : a.ravenFacing;
  RAVEN.forEach((row, ry) => {
    const facing = ry < RAVEN_HEAD ? head : a.ravenFacing;
    for (let cx = 0; cx < 7; cx++) {
      const ch = row[facing > 0 ? cx : 6 - cx];
      if (ch === ".") continue;
      R(x + cx, y + ry, 1, 1, ch === "e" ? (blink ? P.raven : P.ravenEye) : ch === "b" ? P.ravenBeak : ch === "f" ? P.ravenBeak : P.raven);
    }
  });
}

/** Where the raven's bubble hangs from, in world art pixels: above its head. */
export function ravenAnchor(level: number) {
  const a = artFor(levelDef(level));
  return { x: a.raven.c * TILE + TILE / 2, y: a.raven.r * TILE + 1 };
}

const SNAKE_OUTLINE = "#14260f";

function drawSnake(s: Frame["snakes"][number], t: number) {
  const L = 12;
  const grid: string[][] = Array.from({ length: 6 }, () => Array<string>(L).fill("."));
  for (let i = 0; i < L; i++) {
    // Counted from the tail, so the head is at the end the snake is going toward.
    const k = s.dir > 0 ? i : L - 1 - i;
    const w = Math.sin(t * 0.22 - k * 0.85);
    const off = w > 0.45 ? 1 : w < -0.45 ? -1 : 0;
    const rows = k >= L - 2 ? [1, 2, 3, 4] : [1, 2, 3, 4].slice(k < 2 ? 1 : 0, k < 2 ? 3 : 4); // thinner tail, fuller head
    const band = k % 4 < 2 ? "g" : "p";
    for (const row of rows) grid[row + off][i] = band;
  }
  const headI = s.dir > 0 ? L - 1 : 0;
  grid[2][headI] = "e";
  const tongue = Math.floor(t / 7) % 3 !== 0;
  const colors: Record<string, string> = { g: P.snakeGreen, p: P.snakePurple, e: "#f3e6a0", t: P.tongue };
  const left = Math.round(s.x - (s.flat ? 6 : 3));
  const top = Math.round(s.y - (s.flat ? 3 : 6));
  // A snake that runs up and down is the same snake turned on its side.
  const put = (c: number, r: number, w: number, color: string, grow = 0) => (s.flat ? R(left + c - grow, top + r - grow, w + 2 * grow, 1 + 2 * grow, color) : R(left + r - grow, top + c - grow, 1 + 2 * grow, w + 2 * grow, color));
  for (let r = 0; r < 6; r++) for (let c = 0; c < L; c++) if (grid[r][c] !== ".") put(c, r, 1, SNAKE_OUTLINE, 1);
  if (tongue) put(headI + s.dir, 3, 1, SNAKE_OUTLINE, 1);
  for (let r = 0; r < 6; r++) for (let c = 0; c < L; c++) if (grid[r][c] !== ".") put(c, r, 1, colors[grid[r][c]]);
  if (tongue) put(headI + s.dir, 3, 1, colors.t);
}

/** The mound, in one pass of the kit at night, so its lights glow. */
export function drawWorld(f: Frame) {
  const def = levelDef(f.level);
  const a = artFor(def);
  const g = ctx();
  g.drawImage(a.still, -view.camX, -view.camY);

  // The curse along the walls.
  const color = curseColor(f);
  const x0 = view.camX - TILE;
  const y0 = view.camY - TILE;
  const x1 = view.camX + view.w + TILE;
  const y1 = view.camY + view.h + TILE;
  for (const s of a.curse) if (s.x < x1 && s.x + s.w > x0 && s.y < y1 && s.y + s.h > y0) R(s.x, s.y, s.w, s.h, color);

  // Torches: two flame pixels flickering between two yellows, and a pool of light on the floor.
  for (const { c, r } of a.torches) {
    const x = c * TILE + 7;
    const y = r * TILE + 4;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const hot = view.reduced || Math.floor((f.t + c * 5) / 5) % 3 !== 0;
    // The tip of the flame leans a pixel now and then.
    const lean = view.reduced ? 0 : [0, 0, 1, 0, -1, 0, 0][Math.floor((f.t + c * 7 + r * 3) / 6) % 7];
    light(x + lean, y, 1, 1, hot ? "lamp" : "soft");
    light(x, y + 1, 1, 1, "lamp");
    light(c * TILE - 8, (r + 1) * TILE + 1, 32, 3, "pool");
  }

  // The finish: daylight, or on the way deeper, a torch in the dark.
  const fin = finishOf(def.map);
  if (!a.daylightFinish) {
    const hot = view.reduced || Math.floor(f.t / 5) % 3 !== 0;
    light(fin.c * TILE + 15, fin.r * TILE + 5, 1, 1, hot ? "lamp" : "soft");
    light(fin.c * TILE + 15, fin.r * TILE + 6, 1, 1, "lamp");
    light(fin.c * TILE - 6, fin.r * TILE + 34, TILE * 2 + 12, 3, "pool");
  }

  // Standing stones: a faint steady light round each, stronger once lit.
  for (const s of f.stones) {
    const o = stoneOrigin(s);
    if (s.lit) {
      light(o.x - 2, o.y + 1, STONE_W + 4, STONE_H, "soft");
      light(o.x - 10, o.y + STONE_H, STONE_W + 20, 5, "pool");
    } else light(o.x - 4, o.y + STONE_H, STONE_W + 8, 3, "pool");
  }
}

/**
 * What is brighter than the night, drawn untinted after the pass, so it stands out from the dark
 * mound: his pool of light, the daylight in the doorways, the standing stones, the raven, the snakes.
 */
export function drawBright(f: Frame) {
  const g = ctx();
  const def = levelDef(f.level);
  const a = artFor(def);

  // His light: three rings of warm light, added together, breathing by a pixel with the torch.
  const breath = view.reduced ? 0 : [0, 0, 1, 0, 0, -1, 0, 1][Math.floor(f.t / 5) % 8];
  g.globalCompositeOperation = "lighter";
  wdisc(f.x, f.y, 26 + breath, "rgba(255, 196, 120, 0.10)");
  wdisc(f.x, f.y, 18, "rgba(255, 196, 120, 0.14)");
  wdisc(f.x, f.y, 10 + breath, "rgba(255, 196, 120, 0.18)");
  g.globalCompositeOperation = "source-over";

  const day = (x: number, y: number, w: number, h: number) => {
    const split = Math.floor(h * 0.5);
    R(x, y, w, split, P.skyBlue);
    R(x, y + split, w, h - split, P.foam);
  };
  // The wedge of light a doorway throws on the floor: three lines, narrowing.
  const wedge = (x: number, y: number, along: "x" | "y", span: number, centre: number) => {
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const len = span - i * 8;
      if (along === "x") R(x + i, centre - len / 2, 1, len, "rgba(214, 238, 249, 0.2)");
      else R(centre - len / 2, y + i, len, 1, "rgba(214, 238, 249, 0.2)");
    }
    g.globalCompositeOperation = "source-over";
  };
  if (f.level === 1) {
    day(ENTRANCE.x, ENTRANCE.y, ENTRANCE.w, ENTRANCE.h);
    wedge(TILE, 0, "x", 26, 17 * TILE);
  }
  const fin = finishOf(def.map);
  if (a.daylightFinish) {
    day(fin.c * TILE + FRAME, fin.r * TILE + FRAME, TILE * 2 - 2 * FRAME, TILE * 2 - 2 * FRAME);
    wedge(0, (fin.r + 2) * TILE, "y", 26, (fin.c + 1) * TILE);
  }
  drawDoorGlow(a, f);

  drawFeatures(a, f);

  f.stones.forEach((s, i) => {
    const o = stoneOrigin(s);
    const age = f.stoneFlash.get(i);
    // A stone just lit flares white for a few steps before its rune settles to blue.
    const flare = age !== undefined && age < 6 && !view.reduced;
    R(o.x + 1, o.y + STONE_H, STONE_W - 1, 1, mix(P.moundEarth, "#000000", 0.4)); // its shadow
    R(o.x, o.y + 1, STONE_W, STONE_H - 1, flare ? "#f4f1ea" : "#b7b2a8");
    R(o.x + 1, o.y, STONE_W - 2, 1, flare ? "#ffffff" : "#d0cbc0");
    R(o.x, o.y + 1, 1, STONE_H - 1, flare ? "#ffffff" : "#d0cbc0");
    R(o.x + STONE_W - 1, o.y + 1, 1, STONE_H - 1, "#8d887f");
    R(o.x, o.y + STONE_H - 1, STONE_W, 1, "#8d887f");
    for (const [dx, dy] of STONE_RUNE) R(o.x + dx, o.y + dy, 1, 1, s.lit ? P.runeGlow : STONE.mortar);
    if (age !== undefined && !view.reduced) ring(o.x + STONE_W / 2, o.y + STONE_H / 2, 5 + age * 0.7, age / FLASH.stone, "159, 227, 255");
  });

  drawRaven(a, f);
  for (const s of f.snakes) drawSnake(s, f.t);
  if (f.level === LEVELS.length) drawChamber(f);
}


// --- the new things: key, gate, crumbling floor, sliding walls, the mound-dweller ----------------

const OUTLINE = "#0c0a10";

/** A small picture from a text grid, with a one-pixel dark outline so it stands out from the floor. */
function sprite(x: number, y: number, rows: readonly string[], colors: Record<string, string>, outline = OUTLINE) {
  const at = (cx: number, cy: number) => rows[cy]?.[cx] ?? ".";
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) {
      if (row[cx] === ".") continue;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (at(cx + dx, ry + dy) === ".") R(x + cx + dx, y + ry + dy, 1, 1, outline);
    }
  });
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) if (row[cx] !== ".") R(x + cx, y + ry, 1, 1, colors[row[cx]]);
  });
}

/** The rune key: an iron key, five pixels across, with a glowing rune in its bow. */
const KEY = [".hhh.", "hh.hh", "hrrrh", "hh.hh", ".hhh.", "..s..", "..s..", "..sss", "..s..", "..ssg"];
const KEY_COLORS = { h: "#c3ccd6", s: "#9aa5b2", g: "#e8d27a", r: P.runeGlow };

/**
 * A square ring of light round (cx, cy), its corners left out, fading as `done` goes from 0 to 1:
 * how a stone lighting or a teleport stone sending him flares. Added light, so it glows on the dark.
 */
function ring(cx: number, cy: number, radius: number, done: number, rgb: string) {
  if (done >= 1) return;
  const g = ctx();
  const r = Math.round(radius);
  const x = Math.round(cx) - r;
  const y = Math.round(cy) - r;
  const s = r * 2 + 1;
  const color = `rgba(${rgb}, ${(0.8 * (1 - done)).toFixed(3)})`;
  g.globalCompositeOperation = "lighter";
  R(x + 1, y, s - 2, 1, color);
  R(x + 1, y + s - 1, s - 2, 1, color);
  R(x, y + 1, 1, s - 2, color);
  R(x + s - 1, y + 1, 1, s - 2, color);
  g.globalCompositeOperation = "source-over";
}

/**
 * The finish doorway brightens as he nears it (in quarter steps, so it reads as pixel light and not a
 * gradient), and flares when he steps in. Warm torchlight on the way deeper, daylight on the last.
 */
function drawDoorGlow(a: Art, f: Frame) {
  const fin = finishOf(a.def.map);
  const d = Math.hypot(f.x - (fin.c + 1) * TILE, f.y - (fin.r + 1) * TILE);
  const near = Math.max(0, Math.min(1, 1 - (d - 24) / 110));
  const flare = f.finishFlash === null ? 0 : Math.max(0, 1 - f.finishFlash / FLASH.finish);
  const k = Math.ceil(Math.max(near * 0.7, flare) * 4) / 4;
  if (k <= 0) return;
  const rgb = a.daylightFinish ? "214, 238, 249" : "255, 196, 110";
  const ix = fin.c * TILE + FRAME;
  const iy = fin.r * TILE + FRAME;
  const iw = TILE * 2 - 2 * FRAME;
  const g = ctx();
  g.globalCompositeOperation = "lighter";
  if (a.daylightFinish) {
    // Daylight is bright already: it is the floor in front of it that lights up, in three widening steps.
    for (let i = 0; i < 3; i++) R(ix - 2 - i * 3, iy + iw + FRAME + i * 3, iw + 4 + i * 6, 3, `rgba(${rgb}, ${(0.2 * k * (1 - i * 0.3)).toFixed(3)})`);
  } else {
    R(ix, iy, iw, iw, `rgba(${rgb}, ${(0.34 * k).toFixed(3)})`);
    R(ix + 3, iy + 3, iw - 6, iw - 6, `rgba(${rgb}, ${(0.22 * k).toFixed(3)})`);
  }
  g.globalCompositeOperation = "source-over";
  if (flare > 0 && !view.reduced) ring((fin.c + 1) * TILE, (fin.r + 1) * TILE, 15 + (1 - flare) * 10, 1 - flare, rgb);
}

/** The rune on each pair of teleport stones, 5 x 5, so the twins match and two pairs never look alike. */
const PORTAL_RUNES = [
  ["..x..", ".x.x.", "x...x", ".x.x.", "..x.."],
  ["x...x", ".x.x.", "..x..", ".x.x.", "x...x"]
];

/** A teleport stone: a round flat stone set in the floor, a blue rune, a faint glow while it works, a shimmer when it sends him. */
function drawPortal(p: Portal, f: Frame) {
  const cx = p.c * TILE + TILE / 2;
  const cy = p.r * TILE + TILE / 2;
  const ready = f.portalCool === 0;
  const flash = f.portalFlash && f.portalFlash.pair === p.pair && f.portalFlash.age < FLASH.portal ? f.portalFlash.age : null;
  const g = ctx();
  if (ready) {
    // A steady glow, a step brighter every couple of seconds.
    const pulse = view.reduced || Math.floor(f.t / 60) % 2 === 0 ? 0.1 : 0.16;
    g.globalCompositeOperation = "lighter";
    wdisc(cx, cy, 8, `rgba(111, 195, 255, ${pulse})`);
    g.globalCompositeOperation = "source-over";
  }
  wdisc(cx, cy + 1, 6, mix(P.moundEarth, "#000000", 0.45)); // its shadow on the floor, as the standing stones have
  wdisc(cx, cy, 6, P.portalRim);
  wdisc(cx, cy, 5, P.portalStone);
  R(cx - 3, cy - 4, 4, 1, mix(P.portalStone, "#ffffff", 0.35));
  const rune = flash !== null && flash < 8 ? "#ffffff" : ready ? P.portalGlow : mix(P.portalRim, P.portalGlow, 0.3);
  PORTAL_RUNES[p.pair % PORTAL_RUNES.length].forEach((row, ry) => {
    for (let rx = 0; rx < 5; rx++) if (row[rx] === "x") R(cx - 2 + rx, cy - 2 + ry, 1, 1, rune);
  });
  if (flash !== null) {
    const done = flash / FLASH.portal;
    if (view.reduced) ring(cx, cy, 8, done, "111, 195, 255");
    else {
      ring(cx, cy, 7 + flash * 0.45, done, "159, 227, 255");
      ring(cx, cy, 5 + flash * 0.25, Math.min(1, done * 1.4), "111, 195, 255");
    }
  }
}

/**
 * The iron gate across `tiles` (one row of tiles side by side): two leaves of bars that meet in the
 * middle under a rune plate, and slide apart into the walls on either side as `open` goes from 0 to
 * 1. With motion reduced it stands shut until it is open.
 */
function drawGate(tiles: Cell[], open: number, f: Frame) {
  const shown = view.reduced ? (open >= 1 ? 1 : 0) : open;
  if (shown >= 1) return;
  const g = ctx();
  const rows = new Map<number, Cell[]>();
  for (const t of tiles) rows.set(t.r, [...(rows.get(t.r) ?? []), t]);
  for (const [r, row] of rows) {
    const c0 = Math.min(...row.map((t) => t.c));
    const c1 = Math.max(...row.map((t) => t.c));
    const x = c0 * TILE;
    const y = r * TILE;
    const w = (c1 - c0 + 1) * TILE;
    const half = w / 2;
    const off = Math.round(half * shown);
    // Everything outside the gateway is inside the walls: clip to it.
    g.save();
    g.beginPath();
    g.rect(x - view.camX, y - view.camY, w, TILE);
    g.clip();
    const leaf = (lx: number, side: -1 | 1) => {
      R(lx, y, half, TILE, P.moundDeep); // the dark behind the bars
      R(lx, y, half, 1, OUTLINE);
      for (let bx = 1; bx < half; bx += 4) {
        R(lx + bx, y, 2, TILE, "#8f99a6");
        R(lx + bx, y, 1, TILE, "#c3ccd6");
        R(lx + bx + 1, y, 1, TILE, "#5d646e");
      }
      R(lx, y + 2, half, 2, "#6b7480");
      R(lx, y + 2, half, 1, "#aeb8c4");
      R(lx, y + TILE - 4, half, 3, "#5d646e");
      R(lx, y + TILE - 4, half, 1, "#aeb8c4");
      // The edge where the two leaves meet: a heavier post.
      const edge = side < 0 ? lx + half - 2 : lx;
      R(edge, y, 2, TILE, "#5d646e");
      R(side < 0 ? edge : edge + 1, y, 1, TILE, "#aeb8c4");
      // Half of the rune plate on each leaf.
      const px = side < 0 ? lx + half - 5 : lx - 5;
      const plate = (ox: number, oy: number, ww: number, hh: number, color: string) => {
        const a0 = Math.max(px + ox, lx);
        const a1 = Math.min(px + ox + ww, lx + half);
        if (a1 > a0) R(a0, y + 3 + oy, a1 - a0, hh, color);
      };
      plate(-1, -1, 12, 12, OUTLINE);
      plate(0, 0, 10, 10, "#b7b2a8");
      plate(0, 0, 10, 1, "#d6d1c6");
      plate(0, 9, 10, 1, "#8d887f");
      const glow = f.keyTaken ? P.runeGlow : P.curseBright;
      for (const [dx, dy] of STONE_RUNE) plate(1 + dx, 1 + dy, 1, 1, glow);
    };
    leaf(x - off, -1);
    leaf(x + half + off, 1);
    if (f.keyTaken && !view.reduced) {
      g.globalCompositeOperation = "lighter";
      R(x, y, w, TILE, "rgba(159, 227, 255, 0.08)");
      g.globalCompositeOperation = "source-over";
    }
    g.restore();
  }
}

/** Little hairline cracks in a slab: one to three of them, longer and wider as the tile gets closer to falling. */
function drawCracks(x: number, y: number, c: number, r: number, stage: number) {
  const n = stage <= 1 ? 1 : stage;
  const len = [6, 8, 11, 14][stage];
  const dark = "#1a110b";
  for (let k = 0; k < n; k++) {
    let cx = 3 + Math.floor(hash(c, r, k * 5 + 1) * 10);
    let cy = k === 1 ? 8 + Math.floor(hash(c, r, k * 5 + 2) * 3) : Math.floor(hash(c, r, k * 5 + 2) * 3);
    for (let i = 0; i < len && cy < TILE - 1; i++) {
      const wide = stage >= 3 && i % 3 !== 2;
      R(x + cx, y + cy, wide ? 2 : 1, 1, dark);
      if (stage >= 2 && i % 4 === 1) R(x + cx + 1, y + cy, 1, 1, "#0a0604");
      cy++;
      if (hash(c, r, k * 17 + i + 20) < 0.5) cx += hash(c, r, k * 13 + i + 60) < 0.5 ? -1 : 1;
      cx = Math.max(1, Math.min(TILE - 3, cx));
    }
  }
  if (stage >= 3) {
    // Chunks about to drop out of the corners.
    R(x, y, 3, 2, "#0c0a10");
    R(x + TILE - 3, y + TILE - 2, 3, 2, "#0c0a10");
  }
}

/** One crumbling tile: a pale slab with cracks that widen in three stages, shaking from the first step on it, and a pit after it falls. */
function drawCrumble(c: number, r: number, age: number) {
  const x = c * TILE;
  const y = r * TILE;
  if (age >= FALL_STEPS) {
    R(x, y, TILE, TILE, "#050408");
    R(x, y + 1, TILE, 2, "#0d0b12");
    R(x, y, TILE, 1, "#6d6380"); // the lighter rim on its top edge
    if (hash(c, r, 5) < 0.6) R(x + 3 + Math.floor(hash(c, r, 6) * 9), y + 7 + Math.floor(hash(c, r, 8) * 6), 2, 1, "#141019");
    return;
  }
  const shake = age > 0 && !view.reduced ? (Math.floor(age / 3) % 2 ? 1 : -1) : 0;
  const sx0 = x + shake;
  if (shake) R(x, y, TILE, TILE, "#0c0a10"); // the gap the shaking slab leaves
  R(sx0, y, TILE, TILE, "#8d7455");
  R(sx0, y, TILE, 1, "#a58b69");
  R(sx0, y, 1, TILE, "#9a8060");
  R(sx0, y + TILE - 1, TILE, 1, "#4f3b28");
  R(sx0 + TILE - 1, y, 1, TILE, "#5d4731");
  for (let i = 0; i < 5; i++) R(sx0 + 2 + Math.floor(hash(c, r, i + 30) * 12), y + 2 + Math.floor(hash(c, r, i + 35) * 12), 1, 1, i % 2 ? "#a58b69" : "#7a6249");
  const stage = age < 0 ? 0 : age < 40 ? 1 : age < 80 ? 2 : 3;
  drawCracks(sx0, y, c, r, stage);
}

/** A sliding wall: a groove in the floor while it sleeps, a blinking outline before it wakes, and stone while it is wall. */
function drawSlider(d: LevelDef["sliders"][number], f: Frame) {
  const x = d.at[0] * TILE;
  const y = d.at[1] * TILE;
  const w = d.w * TILE;
  const h = d.h * TILE;
  const rise = sliderRise(d, f.clock);
  const solid = sliderSolid(d, f.clock);
  if (rise < 1) {
    // The groove it slides out of.
    R(x, y, w, h, "#2b2017");
    R(x + 1, y + 1, w - 2, h - 2, "#58422f");
    R(x + 1, y + 1, w - 2, 1, "#7a5f43");
    R(x + 3, y + 3, w - 6, h - 6, "#4d3928");
    for (let i = 8; i < w - 3; i += 8) R(x + i, y + 3, 1, h - 6, "#2b2017");
    for (let i = 8; i < h - 3; i += 8) R(x + 3, y + i, w - 6, 1, "#2b2017");
  }
  if (!solid && sliderWarning(d, f.clock) && Math.floor(f.clock / 8) % 2 === 0) {
    const c = "#e7f3ff";
    R(x, y, w, 2, c);
    R(x, y + h - 2, w, 2, c);
    R(x, y, 2, h, c);
    R(x + w - 2, y, 2, h, c);
  }
  if (rise > 0) {
    const inset = Math.round((1 - rise) * 6);
    const ix = x + inset;
    const iy = y + inset;
    const iw = w - 2 * inset;
    const ih = h - 2 * inset;
    R(ix + 1, iy + ih, iw, 2, "rgba(0, 0, 0, 0.45)");
    for (let i = 0; i < iw; i++) stoneColumn(ix + i, iy, iy + ih);
    // Its front, darker, with iron studs, as on the walls of the tunnel.
    const top = iy + ih - FACE;
    R(ix, top, iw, 1, STONE.light);
    R(ix, top + 1, iw, FACE - 1, FACE_DARK);
    for (let i = 4; i < iw - 2; i += 8) {
      R(ix + i, top + 2, 1, 1, P.iron);
      R(ix + i + 4, top + 1, 1, FACE - 1, STONE.mortar);
    }
    if (rise >= 1) {
      const color = curseColor(f);
      R(ix, iy, iw, 1, color);
      R(ix, iy + ih - 1, iw, 1, color);
      R(ix, iy, 1, ih, color);
      R(ix + iw - 1, iy, 1, ih, color);
    }
  }
}

function drawFeatures(a: Art, f: Frame) {
  const g = ctx();
  const x0 = view.camX - TILE;
  const y0 = view.camY - TILE;
  const x1 = view.camX + view.w + TILE;
  const y1 = view.camY + view.h + TILE;
  const seen = (c: number, r: number) => c * TILE > x0 && c * TILE < x1 && r * TILE > y0 && r * TILE < y1;

  for (const { c, r } of a.crumbles) if (seen(c, r)) drawCrumble(c, r, f.crumble.get(`${c},${r}`) ?? -1);
  if (a.gates.length) drawGate(a.gates, f.gate, f);
  for (const d of a.def.sliders) drawSlider(d, f);
  for (const p of mapInfo(a.def.map).portals) if (seen(p.c, p.r)) drawPortal(p, f);

  if (a.key && !f.keyTaken) {
    const bob = view.reduced ? 0 : Math.round(Math.sin(f.t * 0.08));
    const kx = a.key.c * TILE + 5;
    const ky = a.key.r * TILE + 3 + bob;
    g.globalCompositeOperation = "lighter";
    wdisc(kx + 2, ky + 4, 9, "rgba(159, 227, 255, 0.10)");
    wdisc(kx + 2, ky + 4, 5, "rgba(159, 227, 255, 0.14)");
    g.globalCompositeOperation = "source-over";
    R(kx, a.key.r * TILE + 14, 5, 1, "rgba(0, 0, 0, 0.35)");
    sprite(kx, ky, KEY, KEY_COLORS);
  } else if (a.key && f.keyFly !== null && f.keyFly < FLASH.key && !view.reduced && f.keyFly % 6 < 4) {
    // Taken: the key flies up out of its tile, blinking, and is gone.
    sprite(a.key.c * TILE + 5, a.key.r * TILE + 3 - Math.round(f.keyFly * 0.7), KEY, KEY_COLORS);
  }
}

/** The mound-dweller on his stone seat above the last finish, and the raven's feather floating over it. */
const SEATED = ["..ggggg..", ".ggggggg.", "ggdddddgg", "ggdddddgg", ".gdddddg.", ".ggggggg.", "ggggggggg", "ggGgggGgg", "ggGgggGgg", "ggGgggGgg", "gGGgggGGg", "GGG...GGG"];
const SEATED_COLORS = { g: "#a3a9a6", G: "#7f8582", d: "#1b1c22" };
function drawChamber(f: Frame) {
  const fin = finishOf(levelDef(f.level).map);
  const cx = (fin.c + 1) * TILE;
  const top = fin.r * TILE - TILE; // the row of floor above the pad
  // The stone seat: a back slab and a seat, in the kit's stone but lighter than the walls so it reads.
  const seat = (x: number, y: number, w: number, h: number, color: string) => R(x, y, w, h, color);
  seat(cx - 8, top, 16, 16, OUTLINE);
  seat(cx - 7, top + 1, 14, 14, "#8d887f");
  seat(cx - 7, top + 1, 14, 1, "#b7b2a8");
  seat(cx - 7, top + 1, 1, 14, "#a39e94");
  seat(cx + 6, top + 1, 1, 14, "#6c665e");
  seat(cx - 8, top + 13, 16, 3, OUTLINE);
  seat(cx - 7, top + 13, 14, 2, "#a39e94");
  seat(cx - 7, top + 15, 14, 1, "#5b564f");
  // The figure, seated, 9 x 12, with eyes that follow him.
  const fx = cx - 4;
  const fy = top + 2;
  sprite(fx, fy, SEATED, SEATED_COLORS);
  const look = f.x < cx - 6 ? -1 : f.x > cx + 6 ? 1 : 0;
  const eye = "#b39a4a";
  R(fx + 3 + look, fy + 3, 1, 1, eye);
  R(fx + 5 + look, fy + 3, 1, 1, eye);
  // The feather over the finish tiles, bobbing.
  const bob = view.reduced ? 0 : Math.round(Math.sin(f.t * 0.06) * 2);
  const ax = cx - 2;
  const ay = fin.r * TILE + 11 + bob;
  const g = ctx();
  g.globalCompositeOperation = "lighter";
  wdisc(cx, ay + 4, 9, "rgba(159, 227, 255, 0.10)");
  g.globalCompositeOperation = "source-over";
  drawFeather(ax, ay, undefined, undefined, undefined, true); // the prize of all seven: the gold one
}

/**
 * The dark levels: everything farther than 46 art pixels from him is near-black, stepping to full
 * sight through two rings (46 to 40 is 60% dark, 40 to 34 is 30% dark): the kit's torch. Lit
 * standing stones and the finish doorway each keep a clear circle of radius 20. The kit draws it in
 * rectangles per row, so it stays pixel art.
 */
const DARK_CLEAR = 20;
export function drawDark(f: Frame) {
  const def = levelDef(f.level);
  if (!def.dark) return;
  const fin = finishOf(def.map);
  // Light sources in screen pixels: his rings, then clear circles.
  const lights: Light[] = [{ x: f.x - view.camX, y: f.y - view.camY, rings: TORCH }];
  for (const s of f.stones) if (s.lit) lights.push({ x: s.c * TILE + TILE / 2 - view.camX, y: s.r * TILE + TILE / 2 - view.camY, rings: [[DARK_CLEAR, 0]] });
  lights.push({ x: (fin.c + 1) * TILE - view.camX, y: (fin.r + 1) * TILE - view.camY, rings: [[DARK_CLEAR, 0]] });
  drawNight(lights);
}

const STILL_BODY: Parameters<typeof playerPixels>[0] = { x: 0, y: 0, vx: 0, vy: 0, onGround: true, facing: 1, coyote: 0, buffer: 0, cutReady: false, airJumps: 0 };

/**
 * Him from above, 10 x 10, on the sharp canvas, brighter than anything else; `x` and `y` are his
 * centre in world pixels. `tick` makes his torch flicker: a second flame pixel above the first, now
 * and then, leaning one way or the other.
 */
export function drawHim(x: number, y: number, walk: number, heading: { x: number; y: number }, cursed: boolean, alpha = 1, tick = 0) {
  const u = textCtx();
  const n = unit();
  const ox = snap(sx(x - TOP_SIZE / 2));
  const oy = snap(sy(y - TOP_SIZE / 2));
  const flame = { c: -99, r: -99 };
  u.globalAlpha = alpha;
  playerPixels(
    STILL_BODY,
    walk,
    "day",
    (c, r, color) => {
      if (color === LAMP) Object.assign(flame, { c, r });
      u.fillStyle = color;
      u.fillRect(ox + c * n, oy + r * n, n, n);
    },
    { outfit: "viking", view: "top", heading, cursed }
  );
  const k = Math.floor(tick / 4) % 6;
  if (flame.c > -99 && !cursed && !view.reduced && k < 3) {
    u.fillStyle = k === 0 ? "#fff2c4" : LAMP;
    u.fillRect(ox + (flame.c + [0, -1, 1][k]) * n, oy + (flame.r - 1) * n, n, n);
  }
  u.globalAlpha = 1;
}

/**
 * The ghost of his best run: the same person from above, pale and half see-through, under him. No
 * glow, no trail: it only shows where he was at this moment of the clock.
 */
export function drawGhost(x: number, y: number, walk: number, heading: { x: number; y: number }) {
  const u = textCtx();
  const n = unit();
  const ox = snap(sx(x - TOP_SIZE / 2));
  const oy = snap(sy(y - TOP_SIZE / 2));
  u.globalAlpha = 0.45;
  playerPixels(
    STILL_BODY,
    walk,
    "day",
    (c, r, color) => {
      u.fillStyle = mix(color, P.ghost, 0.62);
      u.fillRect(ox + c * n, oy + r * n, n, n);
    },
    { outfit: "viking", view: "top", heading }
  );
  u.globalAlpha = 1;
}
