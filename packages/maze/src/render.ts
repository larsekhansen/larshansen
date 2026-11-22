import { TILE } from "@larshansen/pixelkit/config";
import { TORCH, drawDark as drawNight, type Light } from "@larshansen/pixelkit/dark";
import { R, ctx, light, mix, view, wdisc } from "@larshansen/pixelkit/paint";
import { LAMP, PALETTE, ROLES } from "@larshansen/pixelkit/palette";
import { inked, pixels as pixelsOf, type Frame as HimFrame } from "@larshansen/pixelkit/frames";
import { HIM, HIM_INK, STRIDE } from "@larshansen/pixelkit/him";
import { snap, sx, sy, unit, textCtx } from "@larshansen/pixelkit/text";
import { COLS, LEVELS, ROWS, findTiles, finishOf, isWall, mapInfo, ravenTile, startCentre, type Cell, type LevelDef, type Portal } from "./levels";
import { ENTRANCE, FACE, FRAME, VOID, faceAt, hasTorch, hash, liningAt, stillPixels } from "./look";
import { drawFeather } from "./feather";
import { DWELLER, KEY, RAVEN, STONES, STONE_H, STONE_RUNE, STONE_W, drawAdder, put } from "./figures";
import { BODY, FALL_STEPS, levelDef, sliderRise, sliderSolid, sliderWarning, type Stone } from "./rules";

// Drawing the mound, top down, in the front page's pixels. Everything is whole art pixels, made of
// the kit's rectangle helpers and anchored to the tile map. The still parts (floor, stone walls,
// the start pad) are drawn once per level onto a canvas the size of the map, and the parts that
// move or glow (the curse line, torches, stones, snakes, the raven) are drawn over it every frame.

const P = PALETTE;
const shade = (c: string, k: number) => mix(c, "#141018", k);
const lit = (c: string, k: number) => mix(c, "#ffffff", k);
export { VOID };

interface Seg {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Art {
  def: LevelDef;
  /** The still layer on a canvas of its own; null where there is no page (the tests read `stillPixels` itself). */
  still: HTMLCanvasElement | null;
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

/** "#rrggbb" as its three numbers, worked out once a colour. */
const rgbOf = new Map<string, [number, number, number]>();
function rgb(c: string): [number, number, number] {
  let v = rgbOf.get(c);
  if (!v) rgbOf.set(c, (v = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]));
  return v;
}

/**
 * A level's still layer (`look.ts`: the floor, the lining, the hill, the pad, the doorways) painted once onto a canvas the
 * size of the map, pixel by pixel in one go; and what the frames draw over it, found once: the curse's lines and the torches.
 */
function build(def: LevelDef): Art {
  const { map } = def;
  let still: HTMLCanvasElement | null = null;
  if (typeof document !== "undefined") {
    const pixels = stillPixels(def);
    still = document.createElement("canvas");
    still.width = pixels.w;
    still.height = pixels.h;
    const g = still.getContext("2d")!;
    const data = g.createImageData(pixels.w, pixels.h);
    pixels.px.forEach((c, i) => {
      if (!c) return;
      const [r, gg, b] = rgb(c);
      data.data[i * 4] = r;
      data.data[i * 4 + 1] = gg;
      data.data[i * 4 + 2] = b;
      data.data[i * 4 + 3] = 255;
    });
    g.putImageData(data, 0, 0);
  }

  const curse: Seg[] = [];
  const torches: Cell[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (!isWall(map, c, r)) continue;
      const x = c * TILE;
      const y = r * TILE;
      if (!isWall(map, c, r + 1)) curse.push({ x, y: y + TILE - 1, w: TILE, h: 1 });
      if (r > 0 && !isWall(map, c, r - 1)) curse.push({ x, y, w: TILE, h: 1 });
      if (c > 0 && !isWall(map, c - 1, r)) curse.push({ x, y, w: 1, h: TILE });
      if (c < COLS - 1 && !isWall(map, c + 1, r)) curse.push({ x: x + TILE - 1, y, w: 1, h: TILE });
      if (hasTorch(map, c, r)) torches.push({ c, r });
    }
  const raven = ravenTile(map);
  const key = findTiles(map, "k")[0] ?? null;
  return { def, still, curse, torches, raven, key, gates: findTiles(map, "g"), crumbles: findTiles(map, "c"), ravenFacing: startCentre(map).x < raven.c * TILE + TILE / 2 ? -1 : 1, daylightFinish: def === LEVELS[LEVELS.length - 1] };
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
  /** Each snake's centre, whether it lies along x, which way it goes, and its own clock (its wave and its tongue). */
  snakes: readonly { x: number; y: number; flat: boolean; dir: 1 | -1; t: number }[];
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

const stoneOrigin = (s: Stone) => ({ x: s.c * TILE + 4, y: s.r * TILE + 2 });

function drawRaven(a: Art, f: Frame) {
  const x = a.raven.c * TILE + 4;
  const y = a.raven.r * TILE + 2;
  const blink = f.t % 200 < 7 && !view.reduced;
  // It looks at him once he is more than a few pixels to one side; straight below, it keeps its pose.
  const dx = f.x - (x + 3.5);
  const head = dx > 6 ? 1 : dx < -6 ? -1 : a.ravenFacing;
  put(blink ? RAVEN.blink : RAVEN.head, x, y, head);
  put(RAVEN.body, x, y + 3, a.ravenFacing);
}

/** Where the raven's bubble hangs from, in world art pixels: above its head. */
export function ravenAnchor(level: number) {
  const a = artFor(levelDef(level));
  return { x: a.raven.c * TILE + TILE / 2, y: a.raven.r * TILE + 1 };
}

/** The mound, in one pass of the kit at night, so its lights glow. */
export function drawWorld(f: Frame) {
  const def = levelDef(f.level);
  const a = artFor(def);
  const g = ctx();
  if (a.still) g.drawImage(a.still, -view.camX, -view.camY);

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
  // The way on is a door: its corners marked in the "use" cyan, as every door in the viking game is (ADR 0039, order 19).
  corners(fin.c * TILE - 1, fin.r * TILE - 1, TILE * 2 + 2, TILE * 2 + 2);

  drawFeatures(a, f);

  f.stones.forEach((s, i) => {
    const o = stoneOrigin(s);
    const age = f.stoneFlash.get(i);
    // A stone just lit flares white for a few steps before its rune settles to blue.
    const flare = age !== undefined && age < 6 && !view.reduced;
    R(o.x + 1, o.y + STONE_H, STONE_W, 1, shade(P.moundEarth, 0.45)); // its shadow, down and to the right of it
    R(o.x + STONE_W, o.y + 3, 1, STONE_H - 3, shade(P.moundEarth, 0.3));
    put(flare ? STONES.flare : s.lit ? STONES.lit : STONES.unlit, o.x, o.y);
    if (age !== undefined && !view.reduced) ring(o.x + STONE_W / 2, o.y + STONE_H / 2, 5 + age * 0.7, age / FLASH.stone, "159, 227, 255");
  });

  drawRaven(a, f);
  for (const s of f.snakes) drawAdder(s.x, s.y, s.flat, s.dir, s.t);
  if (f.level === LEVELS.length) drawChamber(f);
}


// --- the new things: key, gate, crumbling floor, sliding walls, the mound-dweller ----------------

const OUTLINE = "#0c0a10";

/** The corners of a thing to use, three pixels each way, in the "use" cyan (the viking game's `corners`). */
function corners(x: number, y: number, w: number, h: number) {
  const c = ROLES.use;
  R(x, y, 3, 1, c);
  R(x, y, 1, 3, c);
  R(x + w - 3, y, 3, 1, c);
  R(x + w - 1, y, 1, 3, c);
  R(x, y + h - 1, 3, 1, c);
  R(x, y + h - 3, 1, 3, c);
  R(x + w - 3, y + h - 1, 3, 1, c);
  R(x + w - 1, y + h - 3, 1, 3, c);
}

/** A figure's frame with a one-pixel dark line round it, so it stands out from the floor (a thing to take, the dweller). */
function outlinedFrame(f: HimFrame, x: number, y: number) {
  const cells = new Set<string>();
  pixelsOf(f, 1, f.x1, (c, r) => cells.add(`${c},${r}`));
  for (const k of cells) {
    const [c, r] = k.split(",").map(Number);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!cells.has(`${c + dx},${r + dy}`)) R(x + c + dx, y + r + dy, 1, 1, OUTLINE);
  }
  put(f, x, y);
}

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
  // The stone itself, round and flat in the floor, lit on its top left and shaded to its foot, its shadow down and to the right.
  piece("portal", cx - 7, cy - 7, 15, 15, (px, py) => {
    const dx = px - 7;
    const dy = py - 7;
    const d = Math.hypot(dx, dy);
    const ds = Math.hypot(dx - 1, dy - 1);
    if (d > 6.3) return ds <= 6.3 ? shade(P.moundEarth, 0.45) : "";
    if (d > 5.2) return dx + dy < -4 ? mix(P.portalRim, P.portalStone, 0.5) : dx + dy > 3 ? shade(P.portalRim, 0.3) : P.portalRim;
    if (dx + dy < -5) return lit(P.portalStone, 0.35);
    if (dx + dy > 5) return shade(P.portalStone, 0.18);
    return P.portalStone;
  });
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

/** A piece painted once onto a canvas of its own and copied (no page, as in the tests: painted where it stands). */
const pieces = new Map<string, HTMLCanvasElement>();
function piece(key: string, x: number, y: number, w: number, h: number, colour: (px: number, py: number) => string, clip?: { x: number; y: number; w: number; h: number }) {
  const c = clip ?? { x: 0, y: 0, w, h };
  if (typeof document === "undefined") {
    for (let py = c.y; py < c.y + c.h; py++)
      for (let px = c.x; px < c.x + c.w; px++) {
        const col = colour(px, py);
        if (col) R(x + px, y + py, 1, 1, col);
      }
    return;
  }
  let can = pieces.get(key);
  if (!can) {
    can = document.createElement("canvas");
    can.width = w;
    can.height = h;
    const g = can.getContext("2d")!;
    for (let py = 0; py < h; py++)
      for (let px = 0; px < w; px++) {
        const col = colour(px, py);
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(px, py, 1, 1);
      }
    pieces.set(key, can);
  }
  if (c.w > 0 && c.h > 0) ctx().drawImage(can, c.x, c.y, c.w, c.h, x + c.x - view.camX, y + c.y - view.camY, c.w, c.h);
}

/**
 * A sliding wall: a groove in the floor while it sleeps, an outline that shimmers before it wakes (steady with reduced
 * motion: it says the same, and nothing blinks), and while it is wall the lining's stone with its iron-banded face,
 * the curse along its edge. Its stone is a piece painted once and copied, rising out of the groove from its middle.
 */
function drawSlider(d: LevelDef["sliders"][number], f: Frame) {
  const x = d.at[0] * TILE;
  const y = d.at[1] * TILE;
  const w = d.w * TILE;
  const h = d.h * TILE;
  const rise = sliderRise(d, f.clock);
  const solid = sliderSolid(d, f.clock);
  if (rise < 1) {
    // The groove it slides out of: a dark rim, an earthen bed lit on its far edge, the joints of its stones.
    R(x, y, w, h, "#2b2017");
    R(x + 1, y + 1, w - 2, h - 2, "#58422f");
    R(x + 1, y + 1, w - 2, 1, "#7a5f43");
    R(x + 3, y + 3, w - 6, h - 6, "#4d3928");
    for (let i = 8; i < w - 3; i += 8) R(x + i, y + 3, 1, h - 6, "#2b2017");
    for (let i = 8; i < h - 3; i += 8) R(x + 3, y + i, w - 6, 1, "#2b2017");
  }
  if (!solid && sliderWarning(d, f.clock) && (view.reduced || Math.floor(f.clock / 8) % 2 === 0)) {
    const c = "#e7f3ff";
    R(x, y, w, 2, c);
    R(x, y + h - 2, w, 2, c);
    R(x, y, 2, h, c);
    R(x + w - 2, y, 2, h, c);
  }
  if (rise > 0) {
    const inset = Math.round((1 - rise) * 6);
    R(x + inset + 1, y + h - inset, w - 2 * inset, 2, "rgba(0, 0, 0, 0.45)");
    // The stone: the lining's courses over its face (FACE rows at its foot), drawn where it stands in the world.
    piece(`slider${x},${y},${w},${h}`, x, y, w, h, (px, py) => (py >= h - FACE ? faceAt(x + px, py - (h - FACE)) : liningAt(x + px, y + py)), { x: inset, y: inset, w: w - 2 * inset, h: h - 2 * inset });
    if (rise >= 1) {
      const color = curseColor(f);
      R(x, y, w, 1, color);
      R(x, y + h - 1, w, 1, color);
      R(x, y, 1, h, color);
      R(x + w - 1, y, 1, h, color);
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
    outlinedFrame(KEY, kx, ky);
  } else if (a.key && f.keyFly !== null && f.keyFly < FLASH.key && !view.reduced && f.keyFly % 6 < 4) {
    // Taken: the key flies up out of its tile, blinking, and is gone.
    outlinedFrame(KEY, a.key.c * TILE + 5, a.key.r * TILE + 3 - Math.round(f.keyFly * 0.7));
  }
}

/** The mound-dweller on his stone seat above the last finish, and the raven's feather floating over it. */
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
  outlinedFrame(DWELLER, fx, fy);
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
  drawFeather(ax, ay, true); // the prize of all seven: the gold one
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

// --- him, from the viking game's own sheet (order 36) ------------------------------------------------------------------

/** His figure's box (the viking game's 10 x 14); in the mound his feet stand at the foot of his body, his head over it. */
const HIM_W = 10;
const HIM_H = 14;
/** How he stands just now: moving (and how far he has come, for the run's frames), which way he faces, and the clock. */
export interface Pose {
  moving: boolean;
  /** Art pixels walked so far in the level: the run's frame changes every `STRIDE` of them, so his feet hold. */
  dist: number;
  facing: 1 | -1;
  t: number;
}

/** The torch in his front hand: its stick, and where the flame stands over it (from his box's top left, facing right). */
const TORCH_STICK = { x: 9, y: 5, h: 4 };
const HAND = { x: 9, y: 8 };
const recoloured = new Map<string, Map<HimFrame, HimFrame>>();
/** A frame with every colour moved toward `to` by `k` (the curse's rust, the ghost's pale), made once a frame and look. */
function toward(f: HimFrame, to: string, k: number): HimFrame {
  const key = `${to}${k}`;
  let m = recoloured.get(key);
  if (!m) recoloured.set(key, (m = new Map()));
  let d = m.get(f);
  if (!d) m.set(f, (d = inked(f, (c) => mix(c, to, k))));
  return d;
}

/** His frame for a pose: the run by the distance he has come, or standing with his breath and a blink now and then. */
export function himPose(p: Pose): HimFrame {
  if (p.moving) return HIM.run[Math.floor(p.dist / STRIDE) % 4];
  const breath = Math.floor(p.t / 30) % 2 === 1;
  const k = p.t % 360;
  const blink = (k >= 205 && k < 211) || k >= 354;
  return breath ? (blink ? HIM.breathBlink : HIM.breath) : blink ? HIM.blink : HIM.stand;
}

/** Paints a frame's runs on the sharp canvas at screen (ox, oy), mirrored about his box when he faces left. */
function runs(u: CanvasRenderingContext2D, f: HimFrame, ox: number, oy: number, n: number, facing: number) {
  const r = f.runs;
  for (let i = 0; i < r.length; i += 4) {
    const x = facing > 0 ? r[i] : HIM_W - r[i] - r[i + 2];
    u.fillStyle = f.ink[r[i + 3]];
    u.fillRect(ox + x * n, oy + r[i + 1] * n, r[i + 2] * n, n);
  }
}

/**
 * Him, standing on the mound's floor as the walls stand, the same man as in the fjord: the viking game's own frames
 * (`@larshansen/pixelkit/him`), on the sharp canvas, brighter than anything else; `x` and `y` are his body's centre in
 * world pixels. He carries a torch in his front hand; `tick` makes its flame flicker (held still with reduced motion).
 */
export function drawHim(x: number, y: number, pose: Pose, cursed: boolean, alpha = 1, tick = 0) {
  const u = textCtx();
  const n = unit();
  const ox = snap(sx(x - HIM_W / 2));
  const oy = snap(sy(y + BODY / 2 - HIM_H));
  const base = himPose(pose);
  const f = cursed ? toward(base, P.curseBright, 0.8) : base;
  u.globalAlpha = alpha;
  runs(u, f, ox, oy, n, pose.facing);
  // The torch: a stick of dark wood in his front hand, and its flame (none while the curse has him).
  const lift = base === HIM.run[1] || base === HIM.run[3] ? -1 : 0;
  const col = (c: number) => ox + (pose.facing > 0 ? c : HIM_W - 1 - c) * n;
  const wood = cursed ? mix(P.woodDark, P.curseBright, 0.8) : P.woodDark;
  u.fillStyle = wood;
  u.fillRect(col(TORCH_STICK.x), oy + (TORCH_STICK.y + lift) * n, n, TORCH_STICK.h * n);
  u.fillStyle = cursed ? mix(HIM_INK.S, P.curseBright, 0.8) : HIM_INK.S;
  u.fillRect(col(HAND.x), oy + (HAND.y + lift) * n, n, n);
  if (!cursed) {
    const k = view.reduced ? 3 : Math.floor(tick / 4) % 6;
    u.fillStyle = LAMP;
    u.fillRect(col(TORCH_STICK.x), oy + (TORCH_STICK.y - 1 + lift) * n, n, n);
    if (k < 3) {
      u.fillStyle = k === 0 ? "#fff2c4" : LAMP;
      u.fillRect(col(TORCH_STICK.x + [0, -1, 1][k] * pose.facing), oy + (TORCH_STICK.y - 2 + lift) * n, n, n);
    }
  }
  u.globalAlpha = 1;
}

/**
 * The ghost of his best run: the same man, pale and half see-through, under him. No glow, no torch, no trail: it only
 * shows where he was at this moment of the clock.
 */
export function drawGhost(x: number, y: number, pose: Pose) {
  const u = textCtx();
  const n = unit();
  const ox = snap(sx(x - HIM_W / 2));
  const oy = snap(sy(y + BODY / 2 - HIM_H));
  u.globalAlpha = 0.45;
  runs(u, toward(himPose(pose), P.ghost, 0.62), ox, oy, n, pose.facing);
  u.globalAlpha = 1;
}
