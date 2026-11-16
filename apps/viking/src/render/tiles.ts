import { TILE } from "@larshansen/pixelkit/config";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { R, mix, stoneWall, view } from "@larshansen/pixelkit/paint";
import { BRICK, FACADE, HAT_RED, INK, MASONRY, PALETTE, SNOW, STAND, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { WOOD_LEDGE, crate, edgesOf, forVisibleTiles, groundFill, groundTop, ledge, outlineTile, visibleTiles } from "@larshansen/pixelkit/props";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { Art } from "../levels/types";
import type { Board } from "@larshansen/pixelkit/text";
import type { Door } from "@larshansen/pixelkit/doors";
import { STAND_LEDGE, tileTop } from "./stand";

// Every tile a level is built of, drawn from its map one tile at a time, so each thing is exactly
// where the map puts it. What you can stand on has a bright top edge and a dark outline.
//
//   #  ground (the level says what its top is)    Q  quay granite    M  Opera marble
//   W  fortress stone    X  brick    P  jetty planks    B  crate    K  rock    ~  water
//   one-way letters: the level's ledge looks

const P = PALETTE;
const PLANK_LIGHT = WOOD_LEDGE.top;
const ROCK_EDGE = mix(P.rockDark, INK, 0.5);
const BRICK_EDGE = mix(BRICK.red, INK, 0.45);

/** A small repeatable number from a tile's place, so stone looks the same on every visit. */
const hash = (c: number, r: number, k: number) => {
  const n = Math.sin(c * 12.9898 + r * 78.233 + k * 37.719) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * The textured set (order 26): `alive/ground.ts`, which comes with `render/feel.ts`, draws the shared letters' tiles
 * (and says so) and the one-way ledges' bodies under their paint. A level fetched later draws its own surfaces with it.
 */
export const TEXTURED: {
  tile?(t: string, c: number, r: number, x: number, y: number, map: TileMap, art: Art, sky: Sky): boolean;
  ledge?(x: number, y: number, c: number, first: boolean, last: boolean): void;
  /** The level's earth going on down under the map, on a tall screen. */
  deep?(c: number, r: number, x: number, y: number, map: TileMap, art: Art, sky: Sky): void;
  /** Props at arm's length: the sign boards on their posts, the T-bane's entrance (says whether it drew it). */
  boards?(boards: Board[]): void;
  tbane?(d: Door): boolean;
  door?(d: Door, frame: string): boolean;
} = {};

/** Deep water, a little greener than the front page's, so it is never his tunic's blue (order 18); and deeper over the bed. */
const DEEP = "#2b6a8e";
const DEEPER = "#2a6384";
const WEED = mix(P.grassDark, P.waterDeep, 0.45);
const WEED_LIGHT = mix(P.grass, P.waterDeep, 0.5);

/** The water: a surface band with foam and drifting glints where it meets the air, deep blue below, deeper over the bed, with weed. */
/** Water lapping at a quay's wall (order 24): drawn by `alive/depth.ts`, which comes with `render/feel.ts`. */
export const LAP: { at?(x: number, y: number, side: number, t: number): void } = {};

export function drawWater(map: TileMap, t: number) {
  const { c0, c1, r0, r1 } = visibleTiles(map);
  const tt = view.reduced ? 0 : t;
  for (let c = c0; c <= c1; c++)
    for (let r = r0; r <= r1; r++) {
      if (map.tileAt(c, r) !== "~") continue;
      const x = c * TILE;
      const y = r * TILE;
      if (map.tileAt(c, r - 1) === "~") {
        R(x, y, TILE, TILE, DEEP);
        // Over the bed the water is deeper still, and weed grows up out of it, swaying.
        if (map.tileAt(c, r + 1) !== "~") {
          R(x, y + 9, TILE, 7, DEEPER);
          for (let k = 0; k < 2; k++) {
            if (hash(c, r, 11 + k) > 0.45) continue;
            const wx = x + 2 + Math.floor(hash(c, r, 13 + k) * 11);
            const h = 6 + Math.floor(hash(c, r, 17 + k) * 8);
            for (let i = 0; i < h; i++) {
              const sway = view.reduced ? 0 : Math.round(Math.sin(tt * 0.03 + c + k * 2 + i * 0.4) * (i / h) * 1.5);
              R(wx + sway, y + TILE - 1 - i, 1, 1, i % 3 === 0 ? WEED_LIGHT : WEED);
            }
          }
        }
        continue;
      }
      R(x, y, TILE, 8, P.water);
      R(x, y + 8, TILE, 8, mix(P.water, DEEP, 0.5));
      R(x + ((c * 5 + Math.floor(tt / 40)) % 9), y, 4, 1, P.foam);
      R(x + ((c * 7 + Math.floor(tt / 14)) % TILE), y + 3 + (c % 3) * 3, 2, 1, mix(P.water, P.foam, 0.6));
      if (map.isSolid(c - 1, r)) LAP.at?.(x, y, -1, tt + c * 5);
      if (map.isSolid(c + 1, r)) LAP.at?.(x + TILE, y, 1, tt + c * 5);
    }
}

function quay(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  stoneWall(x, y, TILE, y + TILE);
  if (map.tileAt(c, r - 1) === "~" || map.isSolid(c, r - 1)) return;
  // The edge of the quay: a dressed granite kerb, and an iron bollard now and then.
  R(x, y, TILE, 3, sky.snow ? SNOW.lying : MASONRY.worn);
  R(x, y + 3, TILE, 1, STONE.mortar);
  if (c % 9 === 4) {
    R(x + 6, y - 5, 4, 5, P.ironDark);
    R(x + 5, y - 6, 6, 2, P.iron);
  }
  if (map.tileAt(c + 1, r) === "~") R(x + TILE - 1, y, 1, TILE, STONE.mortar);
}

function marble(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  R(x, y, TILE, TILE, FACADE.marbleWall);
  if ((c * 16) % 48 === 0) R(x, y, 1, TILE, FACADE.marbleSeam);
  R(x, y + 15, TILE, 1, FACADE.marbleSeam);
  if (!map.isSolid(c, r - 1)) {
    R(x, y, TILE, 3, sky.snow ? SNOW.lying : FACADE.marble);
    R(x, y + 3, TILE, 1, FACADE.marbleEdge);
  }
}

function fortress(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  stoneWall(x, y, TILE, y + TILE);
  outlineTile(x, y, edgesOf(map.tileAt, c, r), MASONRY.edge);
  if (map.isSolid(c, r - 1)) return;
  R(x + 1, y + 1, TILE - 2, 1, sky.snow ? SNOW.lying : MASONRY.worn);
  if (!sky.snow) for (let i = 2; i < TILE - 2; i += 5) R(x + i, y - 1, 2, 1, STONE.moss);
}

function brick(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  R(x, y, TILE, TILE, BRICK.red);
  for (let yy = y + 3; yy < y + TILE; yy += 4) {
    R(x, yy, TILE, 1, BRICK.course);
    for (let xx = x + ((yy / 4) % 2) * 4; xx < x + TILE; xx += 8) R(xx, yy - 3, 1, 3, BRICK.course);
  }
  outlineTile(x, y, edgesOf(map.tileAt, c, r), BRICK_EDGE);
  if (!map.isSolid(c, r - 1)) R(x + 1, y + 1, TILE - 2, 1, sky.snow ? SNOW.lying : mix(BRICK.red, WHITE, 0.3));
}

function plank(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  // The jetty stands in the water: the water's surface under its planks.
  if (map.tileAt(c, r + 1) === "~") {
    R(x, y + 5, TILE, TILE - 5, P.water);
    R(x + ((c * 5) % 9), y + 9, 4, 1, mix(P.water, P.foam, 0.5));
  }
  // The posts under the jetty, standing in the water, dimmed by it.
  if (map.tileAt(c - 1, r) !== "P" || map.tileAt(c + 1, r) !== "P" || c % 2 === 0) {
    R(x + 6, y + 5, 3, TILE * 2 - 5, mix(P.woodDark, P.water, 0.5));
    R(x + 4, y + 5, 7, 1, P.foam);
  }
  R(x, y, TILE, 4, P.wood);
  R(x, y, TILE, 1, sky.snow ? SNOW.lying : PLANK_LIGHT);
  R(x, y + 4, TILE, 1, P.woodDark);
  R(x + 7, y + 1, 1, 3, P.woodDark);
  if (map.tileAt(c - 1, r) !== "P") R(x, y, 1, 5, P.woodDark);
  if (map.tileAt(c + 1, r) !== "P") R(x + TILE - 1, y, 1, 5, P.woodDark);
}

function rock(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  R(x, y, TILE, TILE, P.rock);
  R(x + Math.floor(hash(c, r, 1) * 8), y + Math.floor(hash(c, r, 2) * 12), 5 + Math.floor(hash(c, r, 3) * 4), 3, mix(P.rock, P.rockDark, 0.35));
  R(x + Math.floor(hash(c, r, 7) * 7), y + 2 + Math.floor(hash(c, r, 8) * 12), 3 + Math.floor(hash(c, r, 9) * 7), 1, P.rockDark);
  outlineTile(x, y, edgesOf(map.tileAt, c, r), ROCK_EDGE);
  if (!map.isSolid(c, r - 1)) R(x + 1, y + 1, TILE - 2, 2, sky.snow ? SNOW.lying : P.grass);
}

/** True when there is water somewhere above this ground tile in its column: it is the bed of a harbour or a moat. */
function underWater(map: TileMap, c: number, r: number) {
  for (let k = r - 1; k >= 0 && k >= r - 6; k--) {
    const t = map.tileAt(c, k);
    if (t === "~") return true;
    if (t !== "#") return false;
  }
  return false;
}

/** The bed under the water: dark, with sand at the top, stones and weed in it. */
function bed(c: number, r: number, x: number, y: number, map: TileMap) {
  // A little greener than the water's deep blue, so it is not his tunic's blue (order 18).
  const deep = "#195672";
  R(x, y, TILE, TILE, deep);
  if (map.tileAt(c, r - 1) === "~") {
    R(x, y, TILE, 3, mix(P.sandDark, P.waterDeep, 0.45));
    R(x, y + 3, TILE, 1, mix(P.sandDark, deep, 0.7));
  }
  R(x + Math.floor(hash(c, r, 1) * 11), y + 5 + Math.floor(hash(c, r, 2) * 8), 4, 2, mix(P.rockDark, deep, 0.6));
  if (hash(c, r, 3) < 0.35) for (let k = 0; k < 5; k++) R(x + 3 + Math.floor(hash(c, r, 4) * 9) + (k % 2), y + 1 + k, 1, 1, mix(P.grassDark, deep, 0.55));
}

/** The T-bane line on the line map: a thick red band on a concrete deck, for him to walk along. */
function line(x: number, y: number) {
  R(x, y, TILE, 6, HAT_RED);
  R(x, y, TILE, 1, mix(HAT_RED, WHITE, 0.35));
  R(x, y + 5, TILE, 1, mix(HAT_RED, INK, 0.3));
  R(x, y + 6, TILE, 5, FACADE.marbleWall);
  R(x, y + 10, TILE, 1, FACADE.marbleSeam);
}

/** One tile of the map, drawn with its top left at (x, y): the level's own look for it, or the shared one. */
function drawTile(t: string, c: number, r: number, x: number, y: number, map: TileMap, art: Art, sky: Sky) {
  if (t === ".") return;
  if (art.tile?.(t, c, r, x, y, map, sky)) {
    // A one-way tile the level draws its own way is still something he stands on: its standing top (order 18).
    if (map.isOneWay(c, r) && map.tileAt(c, r - 1) !== t) tileTop(x, y, map.tileAt(c - 1, r) !== t, map.tileAt(c + 1, r) !== t);
    return;
  }
  if (TEXTURED.tile?.(t, c, r, x, y, map, art, sky)) {
    if (t === "B" && !map.isSolid(c, r - 1)) tileTop(x, y, map.tileAt(c - 1, r) !== "B" || map.isSolid(c - 1, r - 1), map.tileAt(c + 1, r) !== "B" || map.isSolid(c + 1, r - 1));
    return;
  }
  // Under water the ground is the bed, seen dimly; elsewhere the level's own surface.
  if (t === "#" && underWater(map, c, r)) bed(c, r, x, y, map);
  else if (t === "#") {
    const s = art.ground(c);
    groundFill(x, y, c, r, s.fill);
    if (!map.isSolid(c, r - 1)) groundTop(x, y, c, s.top, s.dot, sky.snow);
  } else if (t === "Q") quay(c, r, x, y, map, sky);
  else if (t === "M") marble(c, r, x, y, map, sky);
  else if (t === "W") fortress(c, r, x, y, map, sky);
  else if (t === "X") brick(c, r, x, y, map, sky);
  else if (t === "P") plank(c, r, x, y, map, sky);
  else if (t === "K") rock(c, r, x, y, map, sky);
  else if (t === "B") {
    crate(x, y, edgesOf(map.tileAt, c, r), !map.isSolid(c, r - 1), sky.snow);
    if (!map.isSolid(c, r - 1)) tileTop(x, y, map.tileAt(c - 1, r) !== "B" || map.isSolid(c - 1, r - 1), map.tileAt(c + 1, r) !== "B" || map.isSolid(c + 1, r - 1));
  }
  else if (t === "L") line(x, y);
  // Every one-way ledge in the platform palette (order 18): the level's own look gives only its letter.
  else if (art.ledges[t]) {
    const first = map.tileAt(c - 1, r) !== t;
    const last = map.tileAt(c + 1, r) !== t;
    ledge(x, y, STAND_LEDGE, first, last, sky.snow);
    TEXTURED.ledge?.(x, y, c, first, last);
  }
}

/** Where he falls (order 18): the lip of a drop into deep water or a pit with no floor, a dark band down the bank's face. */
const LIP = "#0b0d14";

/** Below (c, r): is it a drop he does not come back from (water, or nothing down to the map's foot)? */
function fatal(map: TileMap, c: number, r: number) {
  if (c < 0 || c >= map.cols) return false;
  for (let rr = r; rr < map.rows; rr++) {
    if (map.tileAt(c, rr) === "~") return true;
    if (map.isSolid(c, rr) || map.isOneWay(c, rr)) return false;
  }
  return true;
}

/** The paint at the lip of a ledge he must jump from (order 22): the last pixels of the ground's top before a fatal drop. */
const LIP_PAINT = 6;
function lipPaint(x: number, y: number, side: number) {
  R(side > 0 ? x + TILE - LIP_PAINT : x, y, LIP_PAINT, 2, STAND.top);
  R(side > 0 ? x + TILE - 1 : x, y, 1, 1, STAND.worn);
}
/** The sides of a tile at whose edge a fatal drop begins: -1, 1, both (2) or none (0). */
function lipSides(map: TileMap, c: number, r: number): number {
  if (!map.isSolid(c, r) || map.isSolid(c, r - 1) || map.tileAt(c, r) === "~") return 0;
  const at = (side: number) => !map.isSolid(c + side, r) && !map.isOneWay(c + side, r) && fatal(map, c + side, r);
  const l = at(-1);
  const rr = at(1);
  return l && rr ? 2 : l ? -1 : rr ? 1 : 0;
}

export function drawTiles(map: TileMap, art: Art, sky: Sky, underground = false) {
  forVisibleTiles(map, (t, c, r, x, y) => {
    drawTile(t, c, r, x, y, map, art, sky);
    // The lip of a fatal drop: the same dark band wherever ground stops over water or a pit, and on top, the paint
    // that says "up to here, and jump" (order 22).
    const sides = lipSides(map, c, r);
    for (const side of [-1, 1])
      if (sides === side || sides === 2) {
        R(side > 0 ? x + TILE - 2 : x, y + 2, 2, TILE - 2, LIP);
        lipPaint(x, y, side);
      }
  });
  drawBelow(map, art, sky);
  if (underground) drawAbove(map, art, sky);
}

/** Above the top of the map, under the ground: the top row's rock goes on up, however tall the screen. */
function drawAbove(map: TileMap, art: Art, sky: Sky) {
  if (view.camY >= 0) return;
  const c0 = Math.max(0, Math.floor(view.camX / TILE));
  const c1 = Math.min(map.cols - 1, Math.floor((view.camX + view.w) / TILE));
  for (let c = c0; c <= c1; c++) {
    const t = map.tileAt(c, 0);
    if (!map.isSolid(c, 0)) continue;
    const rr = map.tileAt(c, 1) === t ? 1 : 0;
    for (let y = -TILE; y > view.camY - TILE; y -= TILE) drawTile(t, c, rr, c * TILE, y, map, art, sky);
  }
}

/**
 * Below the bottom of the map, where a tall screen looks: the bottom row goes on down, so he stands on
 * ground (or over water) however tall the view is. Ground and water only; ledges and open air stop.
 */
function drawBelow(map: TileMap, art: Art, sky: Sky) {
  const bottom = view.camY + view.h;
  if (bottom <= map.height) return;
  const r = map.rows - 1;
  const c0 = Math.max(0, Math.floor(view.camX / TILE));
  const c1 = Math.min(map.cols - 1, Math.floor((view.camX + view.w) / TILE));
  for (let c = c0; c <= c1; c++) {
    const t = map.tileAt(c, r);
    if (t === "~") {
      R(c * TILE, map.height, TILE, bottom - map.height, DEEPER);
      continue;
    }
    if (!map.isSolid(c, r)) continue;
    // Drawn as the row above it where that is the same, so no outline runs across the join; plain
    // ground as its earth only, with no grass on top.
    const rr = map.tileAt(c, r - 1) === t ? r - 1 : r;
    for (let y = map.height; y < bottom; y += TILE) {
      if (t === "#" && !underWater(map, c, r)) TEXTURED.deep ? TEXTURED.deep(c, r + 1 + ((y - map.height) >> 4), c * TILE, y, map, art, sky) : groundFill(c * TILE, y, c, rr, art.ground(c).fill);
      else drawTile(t, c, rr, c * TILE, y, map, art, sky);
    }
  }
}

/** After dark: the standing tops of the one-way ledges and crates in view again, so they keep their light (order 18). */
export function standTops(map: TileMap, art: Art) {
  forVisibleTiles(map, (t, c, r, x, y) => {
    if ((map.isOneWay(c, r) || t === "B") && map.tileAt(c, r - 1) !== t && (art.ledges[t] || t === "B" || map.isOneWay(c, r))) tileTop(x, y, map.tileAt(c - 1, r) !== t, map.tileAt(c + 1, r) !== t);
    const sides = lipSides(map, c, r);
    if (sides === -1 || sides === 2) lipPaint(x, y, -1);
    if (sides === 1 || sides === 2) lipPaint(x, y, 1);
  });
}
