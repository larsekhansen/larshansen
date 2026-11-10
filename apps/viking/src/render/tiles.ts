import { TILE } from "@larshansen/pixelkit/config";
import { COLS, MAP, ROWS, WATER_Y, isSolid, tileAt } from "../game/level";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { PALETTE } from "@larshansen/pixelkit/palette";
import { R, mix, view } from "@larshansen/pixelkit/paint";

// Everything he can stand on, and the water, drawn from the map one tile at a time, so each thing
// is exactly where the map puts it. Platforms share one look: a bright top edge and a dark outline.

const P = PALETTE;
const SNOW = P.snow;
const PLANK_LIGHT = mix(P.wood, "#ffffff", 0.25);
const ROCK_EDGE = mix(P.rockDark, "#1f1a17", 0.5);
const ROCK_LIGHT = mix(P.rock, "#ffffff", 0.22);
const LANDING_TOP = mix(P.rock, "#ffffff", 0.15);

function visible() {
  return {
    c0: Math.max(0, Math.floor(view.camX / TILE)),
    c1: Math.min(COLS - 1, Math.floor((view.camX + view.w) / TILE)),
    r0: Math.max(0, Math.floor(view.camY / TILE)),
    r1: Math.min(ROWS - 1, Math.floor((view.camY + view.h) / TILE))
  };
}

/** What the ground looks like along the way: landing stone, grass, sand, grass, rock. */
function surface(c: number) {
  if (c <= 14) return { top: LANDING_TOP, dot: P.rockDark, fill: P.earth, slabs: true };
  if (c <= 18) return { top: P.grass, dot: P.grassDark, fill: P.earth, slabs: false };
  if (c <= 22) return { top: P.sand, dot: P.sandDark, fill: P.earth, slabs: false };
  if (c >= 111) return { top: P.grass, dot: P.grassDark, fill: mix(P.earth, P.rockDark, 0.4), slabs: false };
  return { top: P.grass, dot: P.grassDark, fill: P.earth, slabs: false };
}

/** The water you see: two tiles deep, a foam line on top, and glints that drift slowly. */
export function drawWater(steps: number) {
  const { c0, c1 } = visible();
  const t = view.reduced ? 0 : steps;
  for (let c = c0; c <= c1; c++) {
    if (tileAt(c, 17) !== "~") continue; // water runs under the jetty and the skerry too
    const x = c * TILE;
    R(x, WATER_Y, TILE, 8, P.water);
    R(x, WATER_Y + 8, TILE, 8, mix(P.water, P.waterDeep, 0.5));
    R(x, WATER_Y + 16, TILE, 16, P.waterDeep);
    // Foam along the top, and one glint per tile drifting along it.
    R(x + ((c * 5 + Math.floor(t / 40)) % 9), WATER_Y, 4, 1, P.foam);
    const g = (c * 7 + Math.floor(t / 14)) % TILE;
    R(x + g, WATER_Y + 3 + (c % 3) * 3, 2, 1, mix(P.water, P.foam, 0.6));
  }
}

function outline(c: number, r: number, x: number, y: number, t: string, edge: string) {
  const same = (cc: number, rr: number) => MAP[rr]?.[cc] === t;
  if (!same(c - 1, r)) R(x, y, 1, TILE, edge);
  if (!same(c + 1, r)) R(x + TILE - 1, y, 1, TILE, edge);
  if (!same(c, r - 1)) R(x, y, TILE, 1, edge);
}

function ground(c: number, r: number, x: number, y: number, sky: Sky) {
  const above = tileAt(c, r - 1);
  if (above === "~") {
    // The bed of the fjord, seen through the water.
    R(x, y, TILE, TILE, mix(P.sandDark, P.waterDeep, 0.55));
    R(x, y, TILE, 2, mix(P.sand, P.water, 0.4));
    return;
  }
  const s = surface(c);
  R(x, y, TILE, TILE, s.fill);
  R(x + ((c * 7 + r * 3) % 12) + 1, y + ((c * 5 + r * 11) % 9) + 5, 2, 1, "rgba(0, 0, 0, 0.25)");
  if (r >= 18) R(x + ((c * 3 + r) % 11) + 2, y + ((c * 7 + r * 5) % 8) + 4, 3, 2, P.rockDark);
  // Shores: the side facing the water is darker.
  if (tileAt(c + 1, r) === "~") R(x + TILE - 2, y, 2, TILE, mix(s.fill, "#1f1a17", 0.35));
  if (tileAt(c - 1, r) === "~") R(x, y, 2, TILE, mix(s.fill, "#1f1a17", 0.35));
  if (isSolid(c, r - 1)) return;
  const snow = sky.snow;
  R(x, y, TILE, 4, snow ? SNOW : s.top);
  R(x, y + 4, TILE, 1, snow ? "#cfd8e6" : s.dot);
  if (!snow) for (let i = 1; i < TILE; i += 4) R(x + i + (c % 2), y + 1 + (i % 3), 1, 1, s.dot);
  if (s.slabs && !snow) R(x + TILE - 1, y, 1, 4, s.dot);
}

/** The landing stone under the start: three slabs, a little brighter and edged. */
function landingStone(c: number, x: number, y: number, sky: Sky) {
  if (c < 3 || c > 5) return;
  if (sky.snow) return;
  R(x, y, TILE, 1, mix(P.rock, "#ffffff", 0.4));
  R(x, y + 1, TILE, 3, mix(P.rock, "#ffffff", 0.22));
  if (c === 3) R(x, y, 1, 5, P.rockDark);
  if (c === 5) R(x + TILE - 1, y, 1, 5, P.rockDark);
}

function plank(c: number, r: number, x: number, y: number, sky: Sky) {
  R(x, y, TILE, 4, P.wood);
  R(x, y, TILE, 1, sky.snow ? SNOW : PLANK_LIGHT);
  R(x, y + 4, TILE, 1, P.woodDark);
  R(x + 7, y + 1, 1, 3, P.woodDark);
  if (tileAt(c - 1, r) !== "P") R(x, y, 1, 5, P.woodDark);
  if (tileAt(c + 1, r) !== "P") R(x + TILE - 1, y, 1, 5, P.woodDark);
}

/** The posts under the jetty, standing in the water. */
function jettyPosts(c: number, x: number, y: number) {
  const first = tileAt(c - 1, 16) !== "P";
  const last = tileAt(c + 1, 16) !== "P";
  if (!(first || last || c % 2 === 0)) return;
  const px = x + 6;
  // The planks are level with the water, so the posts are seen only below them, dimmed by the water.
  R(px, y + 5, 3, 288 - (y + 5), mix(P.woodDark, P.water, 0.5));
  R(px - 2, y + 5, 7, 1, P.foam);
}

/** A small repeatable number from a tile's place, so the rock looks the same on every visit. */
const hash = (c: number, r: number, k: number) => {
  const n = Math.sin(c * 12.9898 + r * 78.233 + k * 37.719) * 43758.5453;
  return n - Math.floor(n);
};
const ROCK_B = mix(P.rock, P.rockDark, 0.35);
const ROCK_C = mix(P.rock, "#ffffff", 0.12);

/** Natural rock: a flat fill in three close greys, and sparse strata of uneven length. No masonry. */
function rock(c: number, r: number, x: number, y: number, sky: Sky) {
  R(x, y, TILE, TILE, P.rock);
  // Two soft patches, one darker and one lighter.
  R(x + Math.floor(hash(c, r, 1) * 8), y + Math.floor(hash(c, r, 2) * 12), 5 + Math.floor(hash(c, r, 3) * 4), 3, ROCK_B);
  R(x + Math.floor(hash(c, r, 4) * 8) + 2, y + Math.floor(hash(c, r, 5) * 12), 4 + Math.floor(hash(c, r, 6) * 4), 2, ROCK_C);
  // One stratum line, 3 to 9 px long, at a random place in the tile.
  R(x + Math.floor(hash(c, r, 7) * 7), y + 2 + Math.floor(hash(c, r, 8) * 12), 3 + Math.floor(hash(c, r, 9) * 7), 1, P.rockDark);
  outline(c, r, x, y, "K", ROCK_EDGE);
  if (tileAt(c, r + 1) === "~") R(x, y + TILE, TILE, TILE, mix(P.rock, P.waterDeep, 0.5)); // the skerry goes down to the bed
  if (isSolid(c, r - 1)) return;
  if (r >= 16) {
    // A skerry: bare rock, a little foam at its foot.
    R(x + 1, y + 1, TILE - 2, 1, sky.snow ? SNOW : ROCK_LIGHT);
    return;
  }
  // Grass, or snow, on top.
  R(x + 1, y + 1, TILE - 2, 3, sky.snow ? SNOW : P.grass);
  if (!sky.snow) {
    R(x + 1, y + 4, TILE - 2, 1, P.grassDark);
    for (let i = 0; i < TILE - 2; i += 5) R(x + 1 + ((i + c * 3) % (TILE - 3)), y + 5, 1, 2, P.grassDark);
  }
}

function crate(c: number, r: number, x: number, y: number, sky: Sky) {
  R(x, y, TILE, TILE, P.crate);
  R(x + 1, y + 1, TILE - 2, TILE - 2, P.wood);
  for (let i = 0; i < TILE - 2; i++) R(x + 1 + i, y + 1 + i, 1, 1, P.crateShade);
  outline(c, r, x, y, "B", P.crateEdge);
  if (!isSolid(c, r - 1)) R(x + 1, y + 1, TILE - 2, 1, sky.snow ? SNOW : P.crateTop);
}

/** One-way ledges: the ship's deck, its yard, and the gallery of the church tower. */
function ledge(c: number, r: number, x: number, y: number, sky: Sky) {
  const first = tileAt(c - 1, r) !== "_";
  const last = tileAt(c + 1, r) !== "_";
  if (r === 15) {
    // The deck of the longship: planks.
    R(x, y, TILE, 5, P.wood);
    R(x, y, TILE, 1, sky.snow ? SNOW : PLANK_LIGHT);
    R(x, y + 4, TILE, 1, P.woodDark);
    R(x + 5, y + 1, 1, 3, P.woodDark);
    R(x + 12, y + 1, 1, 3, P.woodDark);
  } else if (r === 9) {
    // The yard: a spar across the mast.
    R(x, y, TILE, 3, P.wood);
    R(x, y, TILE, 1, sky.snow ? SNOW : PLANK_LIGHT);
    R(x, y + 3, TILE, 1, P.woodDark);
    if (first || last) R(first ? x : x + TILE - 2, y - 1, 2, 5, P.woodDark);
  } else {
    // The gallery under the bells: planks on corbels, a post at each end.
    R(x, y, TILE, 4, P.wood);
    R(x, y, TILE, 1, sky.snow ? SNOW : PLANK_LIGHT);
    R(x, y + 4, TILE, 1, P.woodDark);
    R(x + 7, y + 1, 1, 3, P.woodDark);
    R(x + 5, y + 5, 6, 2, P.woodDark);
    R(x + 7, y + 7, 2, 2, P.woodDark);
    if (first || last) {
      const px = first ? x : x + TILE - 2;
      R(px, y - 10, 2, 10, P.woodDark);
      R(px - (first ? 0 : 1), y - 12, 3, 2, P.woodDark);
    }
  }
  if (first) R(x, y, 1, 5, P.woodDark);
  if (last) R(x + TILE - 1, y, 1, 5, P.woodDark);
}

export function drawTiles(sky: Sky) {
  const { c0, c1, r0, r1 } = visible();
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const t = MAP[r][c];
      const x = c * TILE;
      const y = r * TILE;
      if (t === "#") {
        ground(c, r, x, y, sky);
        if (r === 16) landingStone(c, x, y, sky);
      } else if (t === "P") {
        jettyPosts(c, x, y);
        plank(c, r, x, y, sky);
      } else if (t === "K") rock(c, r, x, y, sky);
      else if (t === "B") crate(c, r, x, y, sky);
      else if (t === "_") ledge(c, r, x, y, sky);
    }
}
