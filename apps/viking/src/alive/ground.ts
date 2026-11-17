import { TILE } from "@larshansen/pixelkit/config";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { R, ctx, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, DOORWAY, FACADE, INK, MASONRY, PAINT, PALETTE, SNOW, STAND, STONE, WHITE } from "@larshansen/pixelkit/palette";
import type { Door } from "@larshansen/pixelkit/doors";
import type { Board } from "@larshansen/pixelkit/text";
import { wdisc } from "@larshansen/pixelkit/paint";
import { shakeX } from "@larshansen/pixelkit/doors";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { Art, Surface } from "../levels/types";
import { TEXTURED } from "../render/tiles";

// The ground under him (order 26, ADR 0049): every surface of the lane drawn pixel by pixel as a small set of pieces,
// each drawn once and copied. A material (`Grain`) is three to five tones of one hue (its ramp, darkest first: the
// joint, the shade, the face, the light, a highlight) and a way of laying them (`kind`: blocks, planks, earth with its
// top, rock, snow, ice, steel, concrete, a crate). A tile's piece is picked by a hash of its column and row (one of
// four variants, so repeats do not show, and the same every visit) and by its edges: where the sky reaches its top it
// is lit a pixel lighter; an open end is closed by a dark line; where it meets something else below, a shadowed foot;
// an overhang's underside dark; in the corner under a step, the step's shadow; under a winter sky, snow on its top.
// Small things in another colour (moss in a wall's shadowed joints, salt at a quay's waterline, grass tufts over the
// edge of earth, rivets, a sparkle in snow) are accents on a few pixels.
//
// The first script carries only the hook (`TEXTURED` in `render/tiles.ts`); this file comes with `render/feel.ts`. Until
// it has come the tiles are drawn as before.

/** How the tones are laid. */
export type Kind = "blocks" | "planks" | "earth" | "rock" | "snow" | "ice" | "steel" | "concrete" | "crate" | "girder";

export interface Grain {
  /** Its name: the pieces are kept under it, and the test reads it. */
  name: string;
  kind: Kind;
  /** Three to five tones of one hue, darkest first: the joint, the shade, the face, the light (and a highlight). */
  ramp: readonly string[];
  /** The top band of earth (grass, sand, paving, gravel, moss, setts, snow): its own ramp, darkest first, laid as `top`. */
  band?: readonly string[];
  top?: "grass" | "sand" | "paving" | "gravel" | "moss" | "setts" | "snow" | "reed";
  /** Small things in another colour, each on a few pixels. */
  accent?: { moss?: string; salt?: string; tuft?: string; flower?: string; rivet?: string; sparkle?: string; snow?: string; snowShade?: string; weed?: string; pebble?: string };
  /** Blocks: a course's height and a block's width with its joint, how far every other course is moved, a block split in two now and then, its corners rounded (setts), fine joints (marble). */
  h?: number;
  w?: number;
  off?: number;
  split?: number;
  round?: boolean;
  fine?: boolean;
  /** No lit row at the top of each block (bricks: too small for it). */
  flat?: boolean;
  /** Its edge where the sky reaches it: rows of the top in these tones (a quay's kerb), else the top row lit. */
  kerb?: readonly string[];
  /** Rows tall, when not a whole tile (a jetty's deck, 5). */
  rows?: number;
  /** Open ends closed by this colour, not the ramp's darkest (a fortress's outline). */
  end?: string;
  /** Earth: what lies under its band, when not earth (setts under a winter street's snow, a lawn under a park's path). */
  under?: "setts" | "lawn";
  /** Only these columns of the tile are painted (a ticket gate's post). */
  cols?: readonly [number, number];
  /** No speckle, crack or vein (glass). */
  smooth?: boolean;
}

// Edges, as bits of a piece's key.
const TOP = 1;
const LEFT = 2;
const RIGHT = 4;
const FOOT = 8;
const UNDER = 16;
const CL = 32;
const CR = 64;
const SNOWY = 128;
/** A wall's end beside the water's surface: wet and dark at the waterline, weed in it. */
const WATERLINE = 256;
/** The row above that: salt stains. */
const SALT = 512;

/** A small repeatable number in [0, 1) from four integers. */
export function hash(a: number, b: number, c: number, d = 0): number {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177) ^ Math.imul(d | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** The pieces' rows above the tile (tufts over the edge) and how wide one is. */
const LIFT = 3;
const W = TILE;

/** A piece as it is worked out: a tone (an index into the ramp, -1 nothing) or a colour of its own, per pixel. */
interface Work {
  g: Grain;
  v: number;
  m: number;
  depth: number;
  rows: number;
  n: number;
  tone: Int8Array;
  acc: (string | null)[];
}
const idx = (_k: Work, x: number, y: number) => (y + LIFT) * W + x;
const inside = (k: Work, x: number, y: number) => x >= 0 && x < W && y >= -LIFT && y < k.rows;
function set(k: Work, x: number, y: number, t: number) {
  if (!inside(k, x, y)) return;
  const i = idx(k, x, y);
  k.tone[i] = Math.max(0, Math.min(k.n - 1, t));
  k.acc[i] = null;
}
function put(k: Work, x: number, y: number, c: string | null) {
  if (!inside(k, x, y)) return;
  const i = idx(k, x, y);
  k.acc[i] = c;
  if (!c) k.tone[i] = -1;
}
const toneAt = (k: Work, x: number, y: number) => (inside(k, x, y) && !k.acc[idx(k, x, y)] ? k.tone[idx(k, x, y)] : -1);
/** A tone moved by d where the pixel has one of the ramp's (not an accent, not empty). */
function shift(k: Work, x: number, y: number, d: number, least = 0) {
  const t = toneAt(k, x, y);
  if (t >= 0) set(k, x, y, Math.max(least, t + d));
}
/** A pixel a step darker: an accent of the band down its band, a tone down its ramp. */
function darken(k: Work, x: number, y: number) {
  if (!inside(k, x, y)) return;
  const a = k.acc[idx(k, x, y)];
  const band = k.g.band;
  if (a && band?.includes(a)) put(k, x, y, band[Math.max(0, band.indexOf(a) - 1)]);
  else shift(k, x, y, -1);
}
const F = (k: Work) => Math.min(2, k.n - 1);
const L = (k: Work) => Math.min(3, k.n - 1);

// --- How each kind lays its tones ------------------------------------------------------------------------------

/** Stone in courses (a quay's granite, a fortress, marble, bricks, setts, slabs): joints, each block's own shade, a lit top on each, chips, a crack, moss in the shadowed joints. */
function blocks(k: Work, c: number) {
  const { g, v } = k;
  const h = g.h ?? 8;
  const w = g.w ?? 16;
  const off = g.off ?? w / 2;
  const phase = w > W ? (c * W) % w : 0;
  const joint = g.fine ? 1 : 0;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      const course = Math.floor(y / h);
      const wy = y % h;
      const xx = x + phase + (course % 2 ? off : 0);
      const bx = Math.floor(xx / w);
      let wx = xx % w;
      const half = Math.floor(w / 2) + (hash(v, course, bx, 9) < 0.5 ? -1 : 1);
      if (g.split && hash(v, course, bx, 8) < g.split && wx >= half) wx -= half;
      if (wy === h - 1 || wx === 0) {
        set(k, x, y, joint);
        if (g.accent?.moss && wy === h - 1 && y >= k.rows / 2 && hash(v, x, y, 1) < 0.14) put(k, x, y, g.accent.moss);
        continue;
      }
      // Each block its own shade now and then (marble's slabs barely: a big wall of them would read as a board).
      const hb = hash(v, course, bx, 2);
      let t = hb < (g.fine ? 0 : 0.15) ? 1 : hb > (g.fine ? 0.93 : 0.88) ? L(k) : F(k);
      if (!g.flat && h >= 6) {
        if (wy === 0) t++;
        else if (wy === h - 2) t--;
      }
      if (g.round && (wy === 0 || wy === h - 2) && (wx === 1 || wx === w - 1)) t = 1;
      const hp = hash(v, x, y, 3);
      const speck = g.smooth ? 0 : g.fine ? 0.015 : 0.05;
      if (hp < speck) t--;
      else if (hp > 1 - speck * 0.6) t++;
      if (wy === 0 && wx === 1 && hash(v, course, bx, 4) < 0.3) t = 0;
      set(k, x, y, Math.max(1, t));
    }
  // A vein across the marble's slabs.
  if (g.fine && !g.smooth && v % 2) {
    let cy = 2 + Math.floor(hash(v, 0, 0, 5) * 10);
    for (let x = 0; x < W && cy < k.rows - 1; x++) {
      if (toneAt(k, x, cy) > 1) set(k, x, cy, 1);
      if (hash(v, x, cy, 6) < 0.35) cy++;
    }
  }
  // A crack across one variant's face.
  if (v === 3 && !g.fine && !g.smooth) {
    let cx = 3 + Math.floor(hash(v, 0, 0, 5) * 9);
    let cy = 1 + Math.floor(hash(v, 0, 0, 6) * Math.max(1, k.rows - 6));
    for (let i = 0; i < 3; i++) {
      if (toneAt(k, cx, cy) > 1) set(k, cx, cy, 1);
      cx += hash(v, i, 1, 7) < 0.5 ? 1 : 0;
      cy++;
    }
  }
}

/** Planks: boards with a lit top, grain, a knot, nail heads by each board's end, the gaps dark. */
function planks(k: Work) {
  const { v } = k;
  const h = k.g.h ?? 4;
  for (let y = 0; y < k.rows; y++) {
    const board = Math.floor(y / h);
    const wy = y % h;
    const end = board % 2 ? 7 : 15;
    for (let x = 0; x < W; x++) {
      if (wy === h - 1 || x === end) {
        set(k, x, y, 0);
        continue;
      }
      let t = F(k);
      if (wy === 0) t = L(k);
      if (hash(v, board, x >> 2, wy + 8) < 0.22 && wy > 0) t = 1;
      if (board === 1 && v === 1 && wy > 0) t = Math.min(t + 1, L(k));
      if (wy === 1 && (x === (end + 2) % W || x === (end + W - 2) % W)) t = 0;
      set(k, x, y, t);
    }
  }
  if (v === 2) {
    const kx = 4 + Math.floor(hash(v, 0, 0, 11) * 6);
    set(k, kx, 1, 0);
    set(k, kx + 1, 1, 1);
    set(k, kx, 2, 1);
  }
}

/** A crate: a frame of darker boards round boards with their grain, a brace across, nails at the frame's corners. */
function crate(k: Work) {
  const { v } = k;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      const frame = x <= 1 || x >= W - 2 || y <= 1 || y >= W - 2;
      let t = frame ? 2 : 3;
      if (!frame && (y - 2) % 4 === 3) t = 1;
      if (!frame && hash(v, (y - 2) >> 2, x >> 2, 12) < 0.18) t = 2;
      // The brace, corner to corner, lit on its top.
      const d = x - y;
      if (!frame && (v % 2 ? x + y - (W - 1) : d) >= -1 && (v % 2 ? x + y - (W - 1) : d) <= 0) t = (v % 2 ? x + y - (W - 1) : d) === -1 ? 4 : 2;
      if (frame && (x === 0 || x === W - 1 || y === 0 || y === W - 1)) t = 1;
      set(k, x, y, t);
    }
  for (const [x, y] of [[1, 1], [W - 2, 1], [1, W - 2], [W - 2, W - 2]]) set(k, x, y, 0);
}

/** Earth under its top band: the band (grass with tufts over its edge, sand, paving, gravel, moss, setts, snow), its dark line, then earth with pebbles, roots and strata. */
function earth(k: Work) {
  const { g, v, m } = k;
  const band = g.band ?? g.ramp;
  const top = (m & TOP) !== 0;
  const b0 = top ? 5 : 0;
  // The earth.
  for (let y = b0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      let t = F(k);
      if (g.under === "setts") {
        const wy = (y - b0) % 4;
        const wx = (x + (Math.floor((y - b0) / 4) % 2 ? 4 : 0)) % 8;
        t = wy === 3 || wx === 0 ? 0 : wy === 0 && wx === 1 ? L(k) : wx === 7 ? 1 : F(k);
        set(k, x, y, t);
        continue;
      }
      if (g.under === "lawn") {
        const hp = hash(v, x, y, 27);
        t = hp < 0.16 ? L(k) : hp < 0.32 ? 1 : F(k);
        if (y >= k.rows - 2) t = 1;
        set(k, x, y, t);
        continue;
      }
      const hp = hash(v, x, y, 21);
      if ((y + k.depth * 5 + v * 4) % 11 === 0 && hash(v, x >> 2, y, 22) < 0.5) t = 1;
      if (hp < 0.015) t = 0;
      else if (hp > 0.98) t = L(k);
      set(k, x, y, t);
    }
  for (let i = 0; i < (g.under ? 0 : 2); i++) {
    const px = 1 + Math.floor(hash(v, i, k.depth, 23) * 12);
    const py = Math.max(b0 + 1, 3 + Math.floor(hash(v, i, k.depth, 24) * 11));
    if (py + 1 >= k.rows) continue;
    if (g.accent?.pebble) {
      put(k, px, py, g.accent.pebble);
      put(k, px + 1, py, g.accent.pebble);
    } else {
      set(k, px, py, L(k));
      set(k, px + 1, py, L(k));
    }
    set(k, px, py + 1, 1);
    set(k, px + 1, py + 1, 0);
  }
  if (top && k.depth === 0 && !g.under && g.top !== "paving" && g.top !== "setts") {
    // A root hanging from the band now and then.
    if (v % 2) {
      let rx = 2 + Math.floor(hash(v, 0, 3, 25) * 12);
      for (let y = 5; y < 8 && y < k.rows; y++) {
        set(k, rx, y, 1);
        if (hash(v, 0, y, 26) < 0.5) rx++;
      }
    }
  }
  if (!top) return;
  // The band.
  const T = (i: number) => band[Math.max(0, Math.min(band.length - 1, i))];
  const n = band.length;
  const face = Math.min(2, n - 1);
  const light = n - 1;
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < W; x++) {
      const hp = hash(v, x, y, 31);
      let t = face;
      switch (g.top) {
        case "sand":
          if (y === 0) t = light;
          else if (hp < 0.16) t = 1;
          else if (hp > 0.9) t = light;
          if (y === 2 && (x + v * 3) % 7 === 0) t = 1;
          break;
        case "paving":
          if (y === 0) t = light;
          if (x === 7 || x === 15) t = 1;
          if (y === 3 && hp < 0.5) t = 1;
          break;
        case "setts": {
          const wx = (x + (y > 1 ? 4 : 0)) % 8;
          if (y === 0 || y === 2) t = wx === 0 ? 0 : wx === 1 ? light : face;
          else t = wx === 0 ? 0 : wx === 7 ? 1 : face;
          break;
        }
        case "gravel":
          t = hp < 0.22 ? 1 : hp > 0.78 ? light : face;
          if (y === 0 && hp > 0.4) t = light;
          if (hp > 0.985) t = 0;
          break;
        case "moss":
          t = hp < 0.18 ? light : hp < 0.3 ? 1 : face;
          if (y === 3) t = hp < 0.5 ? 1 : face;
          break;
        case "snow":
          t = y < 3 ? light : 1;
          if (y > 0 && y < 3 && hp < 0.12) t = face;
          break;
        default:
          // Grass (and reed stubble): blades lit at their tips, darker at their roots.
          if (y === 0) t = hp < 0.55 ? light : face;
          else if (hp < 0.2) t = 1;
          else if (hp > 0.9) t = light;
          if (y === 3) t = hp < 0.45 ? 1 : face;
      }
      set(k, x, y, t);
      k.acc[idx(k, x, y)] = T(t);
    }
  for (let x = 0; x < W; x++) {
    k.acc[idx(k, x, 4)] = T(0);
    k.tone[idx(k, x, 4)] = 0;
  }
  // A drain cover in the paving now and then: a grate of the band's dark in its own frame.
  if (g.top === "paving" && v === 2)
    for (let y = 1; y < 3; y++)
      for (let x = 3; x < 7; x++) {
        const t = y === 1 || x === 3 || x === 6 ? 1 : x % 2 ? 0 : 1;
        k.acc[idx(k, x, y)] = T(t);
      }
  if (g.top === "snow") {
    if (g.accent?.sparkle) for (let x = 0; x < W; x++) if (hash(v, x, 0, 33) < 0.07) put(k, x, 1, g.accent.sparkle);
    return;
  }
  // Grass tufts over the edge, and a flower now and then.
  if (g.top === "grass" || g.top === "reed" || g.top === undefined) {
    for (let i = 0; i < 3; i++) {
      if (hash(v, i, 0, 34) < 0.35) continue;
      const tx = 1 + Math.floor(hash(v, i, 1, 35) * 14);
      const hgt = 1 + Math.floor(hash(v, i, 2, 36) * (g.top === "reed" ? 3 : 2));
      for (let y = 1; y <= hgt; y++) put(k, tx + (y === hgt && hash(v, i, 3, 37) < 0.5 ? 1 : 0), -y, y === hgt ? T(light) : T(1));
    }
    if (g.accent?.flower && v === 1) {
      const fx = 3 + Math.floor(hash(v, 9, 1, 38) * 10);
      put(k, fx, -1, T(1));
      put(k, fx, -2, g.accent.flower);
    }
  }
}

/** Rock: facets each in its own tone, the cracks between them dark, each facet's upper edge lit; moss or grass on its top. */
function rock(k: Work) {
  const { g, v, m } = k;
  const seeds = Array.from({ length: 5 }, (_, i) => ({ x: hash(v, i, 0, 41) * W, y: hash(v, i, 1, 42) * k.rows, t: [1, 2, 2, 3, 2][i] }));
  const near = (x: number, y: number) => {
    let best = 0;
    let bd = Infinity;
    seeds.forEach((s, i) => {
      const d = (x - s.x) ** 2 * 0.55 + (y - s.y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      const s = near(x, y);
      let t = Math.min(seeds[s].t, k.n - 1);
      if ((x < W - 1 && near(x + 1, y) !== s) || (y < k.rows - 1 && near(x, y + 1) !== s)) t = hash(v, x, y, 43) < 0.75 ? 0 : 1;
      else if (y > 0 && near(x, y - 1) !== s) t = Math.min(t + 1, k.n - 1);
      if (hash(v, x, y, 44) < 0.05) t = Math.max(1, t - 1);
      set(k, x, y, t);
      if (g.accent?.moss && t > 1 && hash(v, x >> 1, y >> 1, 47) < 0.06) put(k, x, y, g.accent.moss);
    }
  if (m & TOP && g.band) {
    const T = g.band;
    for (let x = 0; x < W; x++) {
      const hp = hash(v, x, 0, 45);
      put(k, x, 0, T[hp < 0.5 ? T.length - 1 : Math.min(1, T.length - 1)]);
      put(k, x, 1, T[hp < 0.3 ? 0 : Math.min(1, T.length - 1)]);
      if (hash(v, x, 2, 46) < 0.3) put(k, x, 2, T[0]);
    }
  }
}

/** Snow: wind-packed layers, a bright crust with sparkles where the sky reaches it, its blue shadow side at an open right end. */
function snow(k: Work) {
  const { g, v, m } = k;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      let t = F(k);
      const layer = (y + k.depth * 3 + (v & 1)) % 6;
      if (layer === 0 && hash(v, x >> 2, y, 51) < 0.8) t = L(k);
      else if (layer === 1 && hash(v, x >> 2, y, 52) < 0.8) t = 1;
      if (hash(v, x, y, 53) < 0.03) t = 1;
      set(k, x, y, t);
    }
  if (m & TOP) {
    for (let x = 0; x < W; x++) {
      set(k, x, 0, k.n - 1);
      set(k, x, 1, k.n - 1);
      set(k, x, 2, hash(v, x, 2, 54) < 0.7 ? k.n - 1 : L(k));
      set(k, x, 3, hash(v, x, 3, 55) < 0.6 ? 1 : F(k));
      if (g.accent?.sparkle && hash(v, x, 1, 56) < 0.07) put(k, x, 1, g.accent.sparkle);
    }
  }
  if (m & RIGHT) for (let y = (m & TOP) ? 1 : 0; y < k.rows; y++) for (let x = W - 3; x < W; x++) shift(k, x, y, -1);
}

/** Ice: a glassy sheet with streaks of light and a crack, its dark foot, over the snow it lies on. */
function ice(k: Work) {
  const { g, v } = k;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      if (y > 8) {
        put(k, x, y, hash(v, x, y, 61) < 0.08 ? g.accent?.snowShade ?? g.ramp[1] : g.accent?.snow ?? g.ramp[L(k)]);
        continue;
      }
      let t = y === 8 ? 0 : F(k);
      if (y < 8 && (x - y * 2 + v * 5 + 33) % 11 === 0) t = L(k);
      if (y < 8 && (x - y * 2 + v * 5 + 34) % 11 === 0 && hash(v, x, y, 62) < 0.6) t = L(k);
      if (y === 0) t = k.n - 1;
      if (y > 0 && y < 8 && hash(v, x, y, 63) < 0.025) t = k.n - 1;
      set(k, x, y, t);
    }
  if (v === 1) {
    let cx = 4 + Math.floor(hash(v, 0, 0, 64) * 8);
    for (let y = 1; y < 7; y++) {
      set(k, cx, y, 1);
      cx += hash(v, y, 0, 65) < 0.5 ? -1 : 1;
    }
  }
}

/** Steel: a plate with its seams, a rivet at each corner (lit, its shadow under it), brushed streaks. */
function steel(k: Work) {
  const { g, v } = k;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      let t = F(k);
      if (x === W - 1 || y === k.rows - 1) t = 0;
      else if (x === 0 || y === 0) t = L(k);
      if (hash(v, x >> 1, y, 71) < 0.1 && y > 0) t = 1;
      set(k, x, y, t);
    }
  for (const [x, y] of [[2, 2], [W - 4, 2], [2, k.rows - 4], [W - 4, k.rows - 4]]) {
    if (y < 1 || y >= k.rows - 2) continue;
    if (g.accent?.rivet) put(k, x, y, g.accent.rivet);
    else set(k, x, y, k.n - 1);
    set(k, x + 1, y + 1, 0);
  }
}

/** Concrete: the formwork's boards in its face, tie holes, a stain running from one, pits. */
function concrete(k: Work) {
  const { v } = k;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      let t = F(k);
      // The formwork's joint every eight rows, a board's mark faint now and then, pits.
      if (y % 8 === 7) t = 1;
      else if (y % 8 === 0 && hash(v, x >> 2, y, 81) < 0.3) t = Math.max(1, F(k) - 1);
      if (hash(v, x, y, 82) < 0.03) t = 1;
      if (hash(v, x, y, 83) > 0.985) t = L(k);
      set(k, x, y, t);
    }
  const tx = 2 + Math.floor(hash(v, 0, 0, 84) * 10);
  const ty = 2 + Math.floor(hash(v, 0, 1, 85) * 4);
  if (ty + 1 < k.rows) {
    set(k, tx, ty, 0);
    set(k, tx + 1, ty, 0);
    if (v === 2) for (let y = ty + 1; y < ty + 5 && y < k.rows; y++) set(k, tx + (y > ty + 2 ? 1 : 0), y, 1);
  }
}

/** A steel girder: its flanges lit on top, its web in shade, a pair of bolts at every other tile, rust in a speck or two. */
function girder(k: Work, c: number) {
  const { v } = k;
  for (let y = 0; y < k.rows; y++)
    for (let x = 0; x < W; x++) {
      let t = y < 3 || y > 12 ? F(k) : 1;
      if (y === 0) t = k.n - 1;
      else if (y === 1 || y === 13) t = L(k);
      else if (y === 2 || y === 15 || y === 3) t = 0;
      if (y > 3 && y < 12 && (x === 1 || x === W - 2)) t = 0;
      if (y > 3 && y < 12 && x > 1 && x < W - 2 && hash(v, x, y, 75) < 0.05) t = F(k);
      set(k, x, y, t);
    }
  if (c % 2 === 0)
    for (const by of [5, 9]) {
      set(k, 4, by, L(k));
      set(k, 5, by + 1, 0);
      set(k, W - 5, by, L(k));
      set(k, W - 4, by + 1, 0);
    }
}

const KINDS: Record<Kind, (k: Work, c: number) => void> = { blocks, planks, earth, rock, snow, ice, steel, concrete, crate, girder };

/** The edges every kind gets: the lit top (or its kerb, or its snow), the dark ends, the shadowed foot, the underside, the shadow in a step's corner. */
function edges(k: Work) {
  const { g, m, v } = k;
  const last = k.rows - 1;
  const top = (m & TOP) !== 0;
  const banded = g.kind === "earth" || g.kind === "snow" || (g.kind === "rock" && g.band);
  if (top && !banded) {
    if (g.kerb) {
      g.kerb.forEach((c, y) => {
        for (let x = 0; x < W; x++) put(k, x, y, c);
      });
      // Chips in the kerb's face now and then.
      for (let x = 1; x < W - 1; x++) if (hash(v, x, 1, 91) < 0.08 && g.accent?.salt) put(k, x, 1, g.kerb[g.kerb.length - 1]);
    } else for (let x = 0; x < W; x++) shift(k, x, 0, 1, 1);
  }
  if (m & FOOT) for (let x = 0; x < W; x++) shift(k, x, last, -1);
  if (m & UNDER) {
    for (let x = 0; x < W; x++) {
      set(k, x, last, 0);
      shift(k, x, last - 1, -1);
    }
  }
  const below = top && g.kerb ? g.kerb.length : 0;
  if (m & CL) for (let y = 0; y < 2; y++) for (let x = 0; x < 3 - y; x++) darken(k, x, y + below);
  if (m & CR) for (let y = 0; y < 2; y++) for (let x = W - 3 + y; x < W; x++) darken(k, x, y + below);
  // An open end: a dark line (earth's band its own dark, its earth and snow a shade, not the darkest).
  const endTone = (x: number, y: number) => {
    if (g.end) put(k, x, y, g.end);
    else if (g.kind === "earth" && top && y < 5) put(k, x, y, (g.band ?? g.ramp)[0]);
    else set(k, x, y, g.kind === "earth" || g.kind === "snow" ? 1 : 0);
  };
  if (m & LEFT) for (let y = 0; y < k.rows; y++) if (toneAt(k, 0, y) >= 0 || k.acc[idx(k, 0, y)]) endTone(0, y);
  if (m & RIGHT) for (let y = 0; y < k.rows; y++) if (toneAt(k, W - 1, y) >= 0 || k.acc[idx(k, W - 1, y)]) endTone(W - 1, y);
  // Rounded where an end meets the sky: rock, earth and snow lose their outer corner.
  if (top && (g.kind === "rock" || g.kind === "earth" || g.kind === "snow")) {
    if (m & LEFT) {
      put(k, 0, 0, null);
      put(k, 1, 0, null);
      put(k, 0, 1, null);
    }
    if (m & RIGHT) {
      put(k, W - 1, 0, null);
      put(k, W - 2, 0, null);
      put(k, W - 1, 1, null);
    }
  }
  if (m & WATERLINE) {
    for (let y = 0; y < Math.min(4, k.rows); y++) for (let x = 0; x < W; x++) shift(k, x, y, -1, 1);
    if (g.accent?.weed) for (let x = 0; x < W; x++) if (hash(v, x, 0, 92) < 0.3) put(k, x, 2 + (x & 1), g.accent.weed);
  }
  if (m & SALT && g.accent?.salt)
    for (let y = Math.max(0, k.rows - 6); y < k.rows; y++)
      for (let x = 0; x < W; x++) if (toneAt(k, x, y) > 0 && hash(v, x, y, 93) < 0.08 + (y - (k.rows - 6)) * 0.05) put(k, x, y, g.accent.salt);
  // Tufts over a wall's worn top (the fortress's moss).
  if (top && g.accent?.tuft && !(m & SNOWY)) for (let x = 1; x < W - 1; x += 1) if (hash(v, x, -1, 97) < 0.22) put(k, x, -1, g.accent.tuft);
  if (m & SNOWY && !(g.kind === "snow" || g.top === "snow")) {
    for (let x = 0; x < W; x++) {
      put(k, x, 0, SNOW.lying);
      put(k, x, 1, hash(v, x, 1, 94) < 0.8 ? SNOW.lying : SNOW.shade);
      if (hash(v, x, 2, 95) < 0.25) put(k, x, 2, SNOW.shade);
      if (hash(v, x, 0, 96) < 0.06) put(k, x, 0, WHITE);
    }
    for (let y = -LIFT; y < 0; y++) for (let x = 0; x < W; x++) put(k, x, y, null);
  }
}

// --- Pieces, kept on sheets -----------------------------------------------------------------------------------

export interface Piece {
  /** Four numbers a run: x, y from the piece's top left (LIFT rows over the tile), its length, its colour's index. */
  runs: Int16Array;
  ink: string[];
  h: number;
  /** Where it is on its sheet. */
  sheet?: HTMLCanvasElement;
  sx?: number;
  sy?: number;
}

function work(g: Grain, v: number, m: number, depth: number, c: number): Piece {
  const rows = g.rows ?? TILE;
  const k: Work = { g, v, m, depth, rows, n: g.ramp.length, tone: new Int8Array(W * (rows + LIFT)).fill(-1), acc: Array<string | null>(W * (rows + LIFT)).fill(null) };
  KINDS[g.kind](k, c);
  edges(k);
  if (g.cols) for (let y = -LIFT; y < rows; y++) for (let x = 0; x < W; x++) if (x < g.cols[0] || x > g.cols[1]) put(k, x, y, null);
  const ink: string[] = [];
  const at = new Map<string, number>();
  const runs: number[] = [];
  for (let y = 0; y < rows + LIFT; y++)
    for (let x = 0; x < W; ) {
      const i = y * W + x;
      const col = k.acc[i] ?? (k.tone[i] >= 0 ? g.ramp[k.tone[i]] : null);
      if (!col) {
        x++;
        continue;
      }
      let n = 1;
      while (x + n < W && (k.acc[i + n] ?? (k.tone[i + n] >= 0 ? g.ramp[k.tone[i + n]] : null)) === col) n++;
      if (!at.has(col)) {
        at.set(col, ink.length);
        ink.push(col);
      }
      runs.push(x, y, n, at.get(col)!);
      x += n;
    }
  return { runs: Int16Array.from(runs), ink, h: rows + LIFT };
}

const SHEET = 512;
const CELL_H = TILE + LIFT;
const pieces = new Map<string, Piece>();
let sheet: HTMLCanvasElement | null = null;
let slot = 0;
const PER_SHEET = (SHEET / W) * Math.floor(SHEET / CELL_H);

/** A piece's place on a sheet, painted there the first time. */
function onSheet(p: Piece) {
  if (p.sheet) return;
  if (!sheet || slot >= PER_SHEET) {
    sheet = document.createElement("canvas");
    sheet.width = sheet.height = SHEET;
    slot = 0;
  }
  p.sheet = sheet;
  p.sx = (slot % (SHEET / W)) * W;
  p.sy = Math.floor(slot / (SHEET / W)) * CELL_H;
  slot++;
  const g = sheet.getContext("2d")!;
  const r = p.runs;
  for (let i = 0; i < r.length; i += 4) {
    g.fillStyle = p.ink[r[i + 3]];
    g.fillRect(p.sx + r[i], p.sy + r[i + 1], r[i + 2], 1);
  }
}

/** Draws a piece with its tile's top left at world (x, y): one copy (as runs where there is no page, for the tests). */
function draw(p: Piece, x: number, y: number) {
  const r = p.runs;
  if (typeof document === "undefined") {
    for (let i = 0; i < r.length; i += 4) R(x + r[i], y - LIFT + r[i + 1], r[i + 2], 1, p.ink[r[i + 3]]);
    return;
  }
  onSheet(p);
  ctx().drawImage(p.sheet!, p.sx!, p.sy!, W, p.h, Math.round(x) - view.camX, Math.round(y) - LIFT - view.camY, W, p.h);
}

/** The piece of `g` for a tile with edges `m` (bits), a variant from its place, at a depth (0 to 3) under its top. */
export function piece(g: Grain, c: number, r: number, m: number, depth = 0): Piece {
  const v = Math.floor(hash(c, r, 7) * 4);
  const phase = (g.w ?? 0) > W ? ((c * W) % g.w!) / W : g.kind === "girder" ? c % 2 : 0;
  const key = `${g.name}|${v}|${m}|${depth}|${phase}`;
  let p = pieces.get(key);
  if (!p) pieces.set(key, (p = work(g, v, m, depth, c)));
  return p;
}

/** The edges of tile (c, r) as the map has them. `open` says what counts as nothing above (water, for a level whose banks are under it). */
export function edgesAt(map: TileMap, c: number, r: number, sky: Sky | null, open = (cc: number, rr: number) => !map.isSolid(cc, rr) && !map.isWater(cc, rr)) {
  const t = map.tileAt(c, r);
  let m = 0;
  if (open(c, r - 1)) m |= TOP;
  if (!map.isSolid(c - 1, r)) m |= LEFT;
  if (!map.isSolid(c + 1, r)) m |= RIGHT;
  if (r + 1 < map.rows && map.isSolid(c, r + 1) && map.tileAt(c, r + 1) !== t) m |= FOOT;
  if (r + 1 < map.rows && !map.isSolid(c, r + 1) && !map.isWater(c, r + 1)) m |= UNDER;
  if (m & TOP && map.isSolid(c - 1, r - 1)) m |= CL;
  if (m & TOP && map.isSolid(c + 1, r - 1)) m |= CR;
  if (m & TOP && sky?.snow) m |= SNOWY;
  for (const s of [-1, 1]) {
    if (map.isWater(c + s, r) && !map.isWater(c + s, r - 1)) m |= WATERLINE;
    if (map.isWater(c + s, r + 1) && !map.isWater(c + s, r) && !map.isSolid(c + s, r)) m |= SALT;
  }
  return m;
}

/** For the tests: every tile drawn from the textured set (its row times 4096 and its column), and every material that drew one. */
export const DRAWN: { tiles?: Set<number>; grains?: Set<Grain> } = {};

/** A tile of `g` at (c, r), its top left at (x, y): its edges from the map, unless the level says them. */
export function tile(g: Grain, c: number, r: number, x: number, y: number, map: TileMap, sky: Sky | null, m = edgesAt(map, c, r, sky), depth = 0) {
  draw(piece(g, c, r, m, depth), x, y);
  DRAWN.tiles?.add(r * 4096 + c);
  DRAWN.grains?.add(g);
  return true;
}

/** The edge bits, for a level that works its own out. */
export const EDGE = { TOP, LEFT, RIGHT, FOOT, UNDER, CL, CR, SNOWY, WATERLINE, SALT, WET: WATERLINE | SALT } as const;

// --- The shared tiles (`render/tiles.ts`'s letters) -----------------------------------------------------------

const P = PALETTE;
/** The quay's granite: dressed blocks in courses, a kerb of worn granite where the sky reaches it, salt at the waterline. */
export const QUAY: Grain = {
  name: "quay",
  kind: "blocks",
  ramp: [STONE.mortar, STONE.dark, STONE.base, STONE.light],
  h: 8,
  w: 16,
  off: 8,
  kerb: [mix(MASONRY.worn, WHITE, 0.25), MASONRY.worn, mix(MASONRY.worn, STONE.light, 0.5), STONE.mortar],
  accent: { salt: mix(STONE.light, WHITE, 0.35), weed: mix(P.grassDark, P.waterDeep, 0.45), moss: STONE.moss }
};
/** The Opera's marble: big slabs, fine seams, a sheen. */
export const MARBLE: Grain = { name: "marble", kind: "blocks", ramp: [FACADE.marbleEdge, FACADE.marbleSeam, FACADE.marbleWall, FACADE.marble], h: 16, w: 48, off: 24, fine: true, flat: true, kerb: [FACADE.marble, FACADE.marble, FACADE.marble, FACADE.marbleEdge] };
/** The fortress: rough stone in small courses, moss in its shadowed joints, worn on top. */
// Order 28: its joints quietened to halfway between the mortar and the dark stone (the busiest material of order 26, 8.3 of
// lightness between neighbours against a band of 6.4: `render/palette.test.ts`, "the lane's ground keeps a band of its own").
export const FORTRESS: Grain = { name: "fortress", kind: "blocks", ramp: [mix(STONE.mortar, STONE.dark, 0.5), STONE.dark, STONE.base, STONE.light], h: 4, w: 8, off: 4, split: 0.3, flat: true, kerb: [MASONRY.edge, MASONRY.worn], end: MASONRY.edge, accent: { moss: STONE.moss, tuft: STONE.moss } };
/** Brick: courses of bricks, a few darker, chipped corners. */
export const BRICKS: Grain = { name: "brick", kind: "blocks", ramp: [mix(BRICK.red, INK, 0.45), BRICK.course, BRICK.red, BRICK.red], h: 4, w: 8, off: 4, flat: true, kerb: [mix(BRICK.red, INK, 0.45), mix(BRICK.red, WHITE, 0.3)] };
/** Planks: a jetty's deck, five rows. */
/** The longship's stern under its deck, and a jetty: planks five rows deep. */
export const JETTY: Grain = { name: "jetty", kind: "planks", ramp: [P.woodDark, mix(P.wood, P.woodDark, 0.45), P.wood, mix(P.wood, WHITE, 0.25)], h: 5, rows: 5 };
/** A deck as deep as a tile (the longship's stern). */
export const DECK: Grain = { name: "deck", kind: "planks", ramp: [P.woodDark, mix(P.wood, P.woodDark, 0.45), P.wood, mix(P.wood, WHITE, 0.25)], h: 4 };
/** Rock: grey facets, grass on top. */
export const ROCK: Grain = { name: "rock", kind: "rock", ramp: [mix(P.rockDark, INK, 0.5), P.rockDark, mix(P.rock, P.rockDark, 0.35), P.rock, mix(P.rock, WHITE, 0.15)], band: [P.grassDark, P.grass] };
/** A crate: the front page's colours, laid as boards in a frame. */
export const CRATE: Grain = { name: "crate", kind: "crate", ramp: [P.crateEdge, P.crate, P.crateShade, P.wood] };

/** Earth under a level's surface (`LevelDef.art.ground`), one material for each surface. */
const earths = new Map<string, Grain>();
export function earthOf(s: Surface): Grain {
  const key = `${s.top} ${s.dot} ${s.fill} ${s.kind ?? ""}`;
  let g = earths.get(key);
  if (!g) {
    // The pebble the kit draws in earth (a quarter black over it) is the earth's shade here.
    // No lighter earth (a lighter brown comes near the copper of a coin and the enemies' orange): its pebbles are lit
    // in its top's own dark (the grass's, the sand's, the paving's), a colour the level already paints.
    const body = [mix(s.fill, INK, 0.38), mix(s.fill, "#000000", 0.25), s.fill];
    const band = s.kind === "snow" ? [SNOW.shade, mix(SNOW.shade, SNOW.lying, 0.5), SNOW.lying] : [s.dot, mix(s.top, s.dot, 0.5), s.top, mix(s.top, WHITE, 0.18)];
    earths.set(key, (g = { name: `earth ${key}`, kind: "earth", ramp: body, band, top: s.kind ?? "grass", accent: { pebble: s.dot } }));
  }
  return g;
}

/** The bed under the water: dark, sand on its top where the water is over it, stones in it. */
const DEEP_BED = "#195672";
export const BED: Grain = {
  name: "bed",
  kind: "earth",
  ramp: [mix(DEEP_BED, INK, 0.25), DEEP_BED, DEEP_BED, mix(P.rockDark, DEEP_BED, 0.6)],
  band: [mix(P.sandDark, DEEP_BED, 0.7), mix(P.sandDark, P.waterDeep, 0.45)],
  top: "sand"
};
/** True when there is water somewhere above this ground tile in its column: it is the bed of a harbour or a moat. */
function underWater(map: TileMap, c: number, r: number) {
  for (let k = r - 1; k >= 0 && k >= r - 6; k--) {
    const t = map.tileAt(c, k);
    if (t === "~") return true;
    if (t !== "#") return false;
  }
  return false;
}

/** Draws the shared letters' tiles, and says whether it did. */
function shared(t: string, c: number, r: number, x: number, y: number, map: TileMap, art: Art, sky: Sky): boolean {
  switch (t) {
    case "#": {
      if (underWater(map, c, r)) return tile(BED, c, r, x, y, map, sky, map.tileAt(c, r - 1) === "~" ? TOP : 0);
      const top = !map.isSolid(c, r - 1);
      const s = art.ground(c);
      return tile(earthOf(sky.snow && top ? { ...s, kind: "snow" } : s), c, r, x, y, map, sky);
    }
    case "Q": {
      tile(QUAY, c, r, x, y, map, sky);
      // An iron bollard now and then on the kerb.
      if (!map.isSolid(c, r - 1) && map.tileAt(c, r - 1) !== "~" && c % 9 === 4) bollard(x + 5, y);
      return true;
    }
    case "M":
      return tile(MARBLE, c, r, x, y, map, sky);
    case "H":
      // Langkaia's stern, solid under its deck: the deck's planks, the hull behind.
      return tile(JETTY, c, r, x, y, map, sky, edgesAt(map, c, r, sky) & (TOP | SNOWY));
    case "W":
      return tile(FORTRESS, c, r, x, y, map, sky);
    case "X":
      return tile(BRICKS, c, r, x, y, map, sky);
    case "K":
      return tile(ROCK, c, r, x, y, map, sky);
    case "B":
      return tile(CRATE, c, r, x, y, map, sky, edgesAt(map, c, r, null) & ~(LEFT | RIGHT));
    case "P": {
      // The jetty stands in the water: the water's surface under its planks, its posts down into it.
      if (map.tileAt(c, r + 1) === "~") {
        R(x, y + 5, TILE, TILE - 5, P.water);
        R(x + ((c * 5) % 9), y + 9, 4, 1, mix(P.water, P.foam, 0.5));
      }
      if (map.tileAt(c - 1, r) !== "P" || map.tileAt(c + 1, r) !== "P" || c % 2 === 0) {
        R(x + 6, y + 5, 3, TILE * 2 - 5, mix(P.woodDark, P.water, 0.5));
        R(x + 4, y + 5, 7, 1, P.foam);
      }
      return tile(JETTY, c, r, x, y, map, sky, edgesAt(map, c, r, sky) & ~(FOOT | UNDER | WATERLINE | SALT) | (map.tileAt(c - 1, r) !== "P" ? LEFT : 0) | (map.tileAt(c + 1, r) !== "P" ? RIGHT : 0));
    }
  }
  return false;
}

// --- Props at arm's length (section 3) ------------------------------------------------------------------------

/** An iron bollard on a quay's kerb, 6 x 6 from its left at x, standing on y: lit on its left, its cap, a rope's groove. */
const BOLLARD_ROWS = [".aaaa.", "abccdd", ".bcdd.", ".bcdd.", ".bcdd.", "abcddd"];
const BOLLARD_INK: Record<string, string> = { a: P.ironDark, b: mix(P.iron, WHITE, 0.25), c: P.iron, d: P.ironDark };
let bollardPiece: Piece | null = null;
function bollard(x: number, y: number) {
  if (!bollardPiece) {
    const ink: string[] = [];
    const runs: number[] = [];
    BOLLARD_ROWS.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; ) {
        const ch = row[rx];
        if (ch === ".") {
          rx++;
          continue;
        }
        let n = 1;
        while (row[rx + n] === ch) n++;
        const col = BOLLARD_INK[ch];
        if (!ink.includes(col)) ink.push(col);
        runs.push(rx, ry + LIFT - 6 + 3, n, ink.indexOf(col));
        rx += n;
      }
    });
    bollardPiece = { runs: Int16Array.from(runs), ink, h: LIFT + 3 };
  }
  // The bollard's six rows stand on the kerb: drawn from y - 6, so its piece's top is three rows over the lift.
  draw(bollardPiece, x, y - 3);
}

/** A piece of any size from a function of its pixels (a colour, or null for nothing), kept by its key. */
export function custom(key: string, w: number, h: number, at: (x: number, y: number) => string | null): Piece {
  let p = props.get(key);
  if (p) return p;
  const ink: string[] = [];
  const runs: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; ) {
      const col = at(x, y);
      if (!col) {
        x++;
        continue;
      }
      let n = 1;
      while (x + n < w && at(x + n, y) === col) n++;
      if (!ink.includes(col)) ink.push(col);
      runs.push(x, y, n, ink.indexOf(col));
      x += n;
    }
  props.set(key, (p = { runs: Int16Array.from(runs), ink, h }));
  return p;
}
const props = new Map<string, Piece>();
const propCanvas = new Map<Piece, HTMLCanvasElement>();
/** A prop's piece at world (x, y), its top left: one copy (runs where there is no page). */
export function drawProp(p: Piece, x: number, y: number, w: number) {
  const r = p.runs;
  if (typeof document === "undefined") {
    for (let i = 0; i < r.length; i += 4) R(x + r[i], y + r[i + 1], r[i + 2], 1, p.ink[r[i + 3]]);
    return;
  }
  let c = propCanvas.get(p);
  if (!c) {
    c = document.createElement("canvas");
    c.width = w;
    c.height = p.h;
    const g = c.getContext("2d")!;
    for (let i = 0; i < r.length; i += 4) {
      g.fillStyle = p.ink[r[i + 3]];
      g.fillRect(r[i], r[i + 1], r[i + 2], 1);
    }
    propCanvas.set(p, c);
  }
  ctx().drawImage(c, Math.round(x) - view.camX, Math.round(y) - view.camY);
}

/** A sign board's wood (the words are the text layer's): two boards lit on their tops, the joint between them, grain, a nail at each end of each, the edge under; its post lit on the left. */
const BOARD = [P.boardEdge, mix(P.board, P.boardEdge, 0.45), P.board, mix(P.board, WHITE, 0.12)];
function boards(list: Board[]) {
  for (const b of list) {
    const x = Math.round(b.cx - b.w / 2);
    if (b.post !== undefined) {
      // Its post (order 28): lit on its left, a grain down it, its foot dark where it stands.
      const top = b.y + 10;
      const h = Math.round(b.post - top);
      if (h > 0)
        drawProp(
          custom(`sign post ${h}`, 2, h, (px, py) => (py >= h - 1 ? mix(P.woodDark, INK, 0.4) : px === 0 ? (hash(h, py >> 2, 0, 19) < 0.2 ? P.woodDark : mix(P.woodDark, P.wood, 0.3)) : hash(h, py >> 2, 1, 19) < 0.25 ? mix(P.woodDark, INK, 0.25) : P.woodDark)),
          b.cx - 1,
          top,
          2
        );
    }
    const w = Math.round(b.w);
    const p = custom(`board ${w}`, w, 11, (px, py) => {
      if (py === 10) return P.boardEdge;
      const plank = py < 5 ? 0 : 1;
      const wy = py % 5;
      if (wy === 4 && plank === 0) return BOARD[1];
      if (px === 0 || px === w - 1) return BOARD[1];
      if (wy === 2 && (px === 2 || px === w - 3)) return BOARD[0];
      if (wy === 0) return BOARD[3];
      if (hash(w, plank, px >> 2, wy) < 0.18) return BOARD[1];
      return BOARD[2];
    });
    drawProp(p, x, b.y, w);
  }
}

/** The T-bane's entrance: steps going down between two cheeks of granite in courses, their tops lit, the steps' nosings lit; the round blue sign with its white T beside it. */
const CHEEK = [mix(FACADE.libraryFrame, INK, 0.3), mix(FACADE.libraryFrame, INK, 0.12), FACADE.libraryFrame, mix(FACADE.libraryFrame, WHITE, 0.4)];
function tbane(d: Door): boolean {
  const top = d.bottom - d.h;
  const w = d.w + 6;
  const h = d.h - 8;
  const hole = d.open ? DOORWAY.stage : mix(DOORWAY.stage, PAINT.tbane, 0.25);
  const p = custom(`tbane ${w} ${h} ${d.open ? 1 : 0}`, w, h, (px, py) => {
    const inner = px >= 3 && px < w - 3 && py >= 2;
    if (inner) {
      // The steps down: each a lit nosing over its dark riser.
      const k = h - 1 - py;
      if (k % 4 === 2 && k < 16 && px > 3 && px < w - 4) return mix(FACADE.libraryFrame, INK, 0.3);
      return hole;
    }
    if (py === 0) return CHEEK[3];
    if (py % 6 === 5) return CHEEK[0];
    const block = Math.floor(py / 6);
    if ((px + (block % 2) * 2) % 5 === 0 && px !== 0 && px !== w - 1) return CHEEK[1];
    if (px === 0 || px === w - 1) return CHEEK[1];
    return hash(w, block, px, 3) < 0.1 ? CHEEK[1] : CHEEK[2];
  });
  drawProp(p, d.x - 3, top + 8, w);
  const px = d.x - 8;
  const py = top + 16;
  wdisc(px, py, 5, PAINT.tbane);
  R(px - 3, py - 3, 7, 2, WHITE);
  R(px, py - 1, 1, 5, WHITE);
  return true;
}

/**
 * A plank door in its frame (the shed's on Langkaia, the mound's in Nordmarka): the frame lit on its top and left,
 * planks with their grain and a gap between them, two iron bands with their rivets, a ring for a handle. Open, a dark hole.
 */
export function plankDoor(d: Door, frame: string): boolean {
  const ox = shakeX(d.shake);
  const top = d.bottom - d.h;
  const w = d.w + 4;
  const h = d.h + 2;
  const wood = [P.woodDark, mix(P.wood, P.woodDark, 0.45), P.wood, mix(P.wood, WHITE, 0.18)];
  const p = custom(`door ${d.w} ${d.h} ${d.open ? 1 : 0} ${frame}`, w, h, (px, py) => {
    if (px < 2 || px >= w - 2 || py < 2) return px === 0 || py === 0 ? mix(frame, WHITE, 0.25) : px >= w - 1 ? mix(frame, INK, 0.3) : frame;
    if (d.open) return DOORWAY.wood;
    const x = px - 2;
    const y = py - 2;
    if (y === 6 || y === 7 || y === 22 || y === 23) return (x % 4 === 1 && y % 2 === 0) ? mix(P.iron, WHITE, 0.3) : y % 2 ? P.ironDark : P.iron;
    if (x > 0 && x % 4 === 0) return wood[0];
    if (x === d.w - 4 && (y === 15 || y === 17)) return P.iron;
    if (x === d.w - 5 && y === 16) return P.iron;
    if (y === 0) return wood[3];
    return hash(d.w, x, y >> 2, 17) < 0.2 ? wood[1] : wood[2];
  });
  drawProp(p, d.x - 2 + ox, top - 2, w);
  return true;
}

// --- One-way ledges: the platform's teal body under its paint ---------------------------------------------------

/** Under the paint (its two rows, as the kit draws them), the body's two rows and the line under: lit under the paint, a rivet each side of every joint, a scuff now and then. */
function ledgeBody(x: number, y: number, c: number, first: boolean, last: boolean) {
  const key = `ledge|${Math.floor(hash(c, 0, 13) * 4)}|${first ? 1 : 0}${last ? 1 : 0}`;
  let p = pieces.get(key);
  if (!p) {
    const runs: number[] = [];
    const ink = [STAND.body, STAND.bodyLight, STAND.bodyDark, STAND.under];
    const v = Math.floor(hash(c, 0, 13) * 4);
    for (let ry = 0; ry < 3; ry++)
      for (let rx = 0; rx < W; rx++) {
        let i = ry === 2 ? 3 : 0;
        if (ry === 0 && rx % 6 !== 3) i = hash(v, rx, 0, 14) < 0.3 ? 1 : 0;
        if (ry < 2 && rx % 6 === 3) i = 2;
        if (ry === 0 && (rx % 6 === 1 || rx % 6 === 5)) i = 1;
        if (ry === 1 && (rx % 6 === 1 || rx % 6 === 5)) i = 2;
        if (ry === 1 && hash(v, rx, 1, 15) < 0.08) i = 2;
        if ((first && rx === 0) || (last && rx === W - 1)) i = 3;
        runs.push(rx, LIFT + 2 + ry, 1, i);
      }
    pieces.set(key, (p = { runs: Int16Array.from(runs), ink, h: LIFT + 5 }));
  }
  draw(p, x, y);
}

TEXTURED.tile = shared;
TEXTURED.ledge = ledgeBody;
TEXTURED.boards = boards;
TEXTURED.tbane = tbane;
TEXTURED.door = plankDoor;
/**
 * The ground going on down under the map on a tall screen, row r past its foot: the level's own ground as it is drawn
 * under its surface, on a map whose bottom row goes on down (so each row is deeper, its own variant, nothing open over it).
 */
const buriedOf = new WeakMap<TileMap, TileMap>();
TEXTURED.deep = (c, r, x, y, map, art, sky) => {
  let buried = buriedOf.get(map);
  if (!buried) {
    const foot = map.rows - 1;
    buried = Object.create(map) as TileMap;
    buried.tileAt = (cc, rr) => map.tileAt(cc, Math.min(rr, foot));
    buried.isSolid = (cc, rr) => map.isSolid(cc, Math.min(rr, foot));
    buried.isWater = (cc, rr) => map.isWater(cc, Math.min(rr, foot));
    buried.isOneWay = (cc, rr) => map.isOneWay(cc, Math.min(rr, foot));
    buriedOf.set(map, buried);
  }
  if (!art.tile?.("#", c, r, x, y, buried, sky)) shared("#", c, r, x, y, buried, art, sky);
};
