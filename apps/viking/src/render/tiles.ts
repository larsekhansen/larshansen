import { TILE } from "@larshansen/pixelkit/config";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { R, mix, stoneColumn, view } from "@larshansen/pixelkit/paint";
import { BRICK, FACADE, HAT_RED, INK, MASONRY, PALETTE, SNOW, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { WOOD_LEDGE, crate, edgesOf, forVisibleTiles, groundFill, groundTop, ledge, outlineTile, visibleTiles } from "@larshansen/pixelkit/props";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { Art } from "../levels/types";

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

/** The water: a surface band with foam and drifting glints where it meets the air, deep blue below. */
export function drawWater(map: TileMap, t: number) {
  const { c0, c1, r0, r1 } = visibleTiles(map);
  const tt = view.reduced ? 0 : t;
  for (let c = c0; c <= c1; c++)
    for (let r = r0; r <= r1; r++) {
      if (map.tileAt(c, r) !== "~") continue;
      const x = c * TILE;
      const y = r * TILE;
      if (map.tileAt(c, r - 1) === "~") {
        R(x, y, TILE, TILE, P.waterDeep);
        continue;
      }
      R(x, y, TILE, 8, P.water);
      R(x, y + 8, TILE, 8, mix(P.water, P.waterDeep, 0.5));
      R(x + ((c * 5 + Math.floor(tt / 40)) % 9), y, 4, 1, P.foam);
      R(x + ((c * 7 + Math.floor(tt / 14)) % TILE), y + 3 + (c % 3) * 3, 2, 1, mix(P.water, P.foam, 0.6));
    }
}

function quay(c: number, r: number, x: number, y: number, map: TileMap, sky: Sky) {
  for (let i = 0; i < TILE; i++) stoneColumn(x + i, y, y + TILE);
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
  for (let i = 0; i < TILE; i++) stoneColumn(x + i, y, y + TILE);
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
  const deep = mix(P.waterDeep, INK, 0.25);
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

export function drawTiles(map: TileMap, art: Art, sky: Sky) {
  forVisibleTiles(map, (t, c, r, x, y) => {
    if (t === "." || art.tile?.(t, c, r, x, y, map, sky)) return;
    if (t === "#") {
      // Under water the ground is the bed, seen dimly; elsewhere the level's own surface.
      if (underWater(map, c, r)) return bed(c, r, x, y, map);
      const s = art.ground(c);
      groundFill(x, y, c, r, s.fill);
      if (!map.isSolid(c, r - 1)) groundTop(x, y, c, s.top, s.dot, sky.snow);
    } else if (t === "Q") quay(c, r, x, y, map, sky);
    else if (t === "M") marble(c, r, x, y, map, sky);
    else if (t === "W") fortress(c, r, x, y, map, sky);
    else if (t === "X") brick(c, r, x, y, map, sky);
    else if (t === "P") plank(c, r, x, y, map, sky);
    else if (t === "K") rock(c, r, x, y, map, sky);
    else if (t === "B") crate(x, y, edgesOf(map.tileAt, c, r), !map.isSolid(c, r - 1), sky.snow);
    else if (t === "L") line(x, y);
    else if (art.ledges[t]) ledge(x, y, art.ledges[t], map.tileAt(c - 1, r) !== t, map.tileAt(c + 1, r) !== t, sky.snow);
  });
}
