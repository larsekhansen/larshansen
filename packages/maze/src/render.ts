import { TILE } from "@larshansen/pixelkit/config";
import { R, ctx, light, mix, stoneColumn, target, view, wdisc } from "@larshansen/pixelkit/paint";
import { PALETTE, STONE } from "@larshansen/pixelkit/palette";
import { playerPixels, TOP_SIZE } from "@larshansen/pixelkit/person";
import { snap, sx, sy, unit, textCtx } from "@larshansen/pixelkit/text";
import { COLS, LEVELS, ROWS, finishOf, isWall, ravenTile, startCentre, startOf, type Cell, type LevelDef } from "./levels";
import { levelDef, type Stone } from "./rules";

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
  return { def, still, curse, torches, raven, ravenFacing: startCentre(map).x < raven.c * TILE + TILE / 2 ? -1 : 1, daylightFinish };
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
}

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

function drawRaven(a: Art, f: Frame) {
  const x = a.raven.c * TILE + 4;
  const y = a.raven.r * TILE + 2;
  const blink = f.t % 200 < 7;
  RAVEN.forEach((row, ry) => {
    for (let cx = 0; cx < 7; cx++) {
      const ch = row[a.ravenFacing > 0 ? cx : 6 - cx];
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
    light(x, y, 1, 1, hot ? "lamp" : "soft");
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

  // His light: three rings of warm light, added together.
  g.globalCompositeOperation = "lighter";
  wdisc(f.x, f.y, 26, "rgba(255, 196, 120, 0.10)");
  wdisc(f.x, f.y, 18, "rgba(255, 196, 120, 0.14)");
  wdisc(f.x, f.y, 10, "rgba(255, 196, 120, 0.18)");
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

  for (const s of f.stones) {
    const o = stoneOrigin(s);
    R(o.x + 1, o.y + STONE_H, STONE_W - 1, 1, mix(P.moundEarth, "#000000", 0.4)); // its shadow
    R(o.x, o.y + 1, STONE_W, STONE_H - 1, "#b7b2a8");
    R(o.x + 1, o.y, STONE_W - 2, 1, "#d0cbc0");
    R(o.x, o.y + 1, 1, STONE_H - 1, "#d0cbc0");
    R(o.x + STONE_W - 1, o.y + 1, 1, STONE_H - 1, "#8d887f");
    R(o.x, o.y + STONE_H - 1, STONE_W, 1, "#8d887f");
    for (const [dx, dy] of STONE_RUNE) R(o.x + dx, o.y + dy, 1, 1, s.lit ? P.runeGlow : STONE.mortar);
  }

  drawRaven(a, f);
  for (const s of f.snakes) drawSnake(s, f.t);
}

/** Him from above, 10 x 10, on the sharp canvas, brighter than anything else; `x` and `y` are his centre in world pixels. */
export function drawHim(x: number, y: number, walk: number, heading: { x: number; y: number }, cursed: boolean, alpha = 1) {
  const u = textCtx();
  const n = unit();
  const ox = snap(sx(x - TOP_SIZE / 2));
  const oy = snap(sy(y - TOP_SIZE / 2));
  u.globalAlpha = alpha;
  playerPixels(
    { x: 0, y: 0, vx: 0, vy: 0, onGround: true, facing: 1, coyote: 0, buffer: 0, cutReady: false, airJumps: 0 },
    walk,
    "day",
    (c, r, color) => {
      u.fillStyle = color;
      u.fillRect(ox + c * n, oy + r * n, n, n);
    },
    { outfit: "viking", view: "top", heading, cursed }
  );
  u.globalAlpha = 1;
}
