import { TILE } from "@larshansen/pixelkit/config";
import { mix } from "@larshansen/pixelkit/paint";
import { PALETTE, STONE } from "@larshansen/pixelkit/palette";
import { COLS, LEVELS, ROWS, finishOf, isWall, startOf, type LevelDef } from "./levels";

// The mound's still parts as per-pixel pieces (order 36), drawn by the methods of the viking game's orders 23 to 28: every
// material a ramp of three to five tones of one hue, darkest first (a joint or shadow, a shade, the face, the light, a
// highlight); light from the top left, so what faces up and left is lit and what faces down and right is shaded; depth
// from the walls (a lit lip on top of each wall's front face, an iron band across it, its foot in shadow, and the shadow it
// throws on the floor below and to the right of it); four variants a tile by a hash of its place, the same every visit.
// Jernhaugen is its own place, not a tenth viking level: an iron-bound mound, dark earth round tunnels lined with stone.
//
// Everything here is pure: a level's still layer is a grid of colours (`stillPixels`), which the page puts on a canvas
// once a level, and the tests read as it is.

/** A level's still layer: `w` x `h` art pixels, a colour each ("" where nothing is drawn). */
export interface Pixels {
  w: number;
  h: number;
  px: string[];
}

/** A small fixed hash of a place and a number, 0 to 1: the same earth on every visit. */
export function hash(c: number, r: number, k: number) {
  let n = Math.imul(c + 101, 374761393) + Math.imul(r + 211, 668265263) + Math.imul(k + 7, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

const P = PALETTE;
const shade = (c: string, k: number) => mix(c, "#141018", k);
const lit = (c: string, k: number) => mix(c, "#ffffff", k);

/** The colour of the void outside the map and behind the glow. */
export const VOID = "#14110f";

/** The packed earth of the floor, from the tones it was drawn in: a shadow, its darker earth, the earth, its lighter, a highlight. */
export const EARTH = [shade(P.moundEarthDark, 0.32), P.moundEarthDark, P.moundEarth, P.moundEarthLight, lit(P.moundEarthLight, 0.16)] as const;
/** Worn flagstones set in the floor: a grey stone toward the earth's warmth. */
export const SLAB = [shade(mix(P.moundEarth, "#9a9488", 0.45), 0.3), shade(mix(P.moundEarth, "#9a9488", 0.45), 0.12), mix(P.moundEarth, "#9a9488", 0.45), lit(mix(P.moundEarth, "#9a9488", 0.45), 0.18)] as const;
/** The stone lining the tunnels, the kit's stone: its mortar, dark, base and light, and a highlight on a block's lit corner. */
export const LINING = [STONE.mortar, STONE.dark, STONE.base, STONE.light, lit(STONE.light, 0.14)] as const;
/** A wall's front face, in the shade: its foot, its joints, its face, and the lip where the top catches the light. */
export const FACE_TONES = [shade(STONE.dark, 0.55), shade(STONE.dark, 0.42), shade(STONE.dark, 0.3), lit(STONE.light, 0.08)] as const;
/** The iron the mound is named for: bands across the walls' faces, cramps across their joints, studs. Dark, iron, lit. */
export const IRON = [shade(P.iron, 0.45), P.iron, lit(P.iron, 0.32)] as const;
/** The hill itself, round the tunnels: near-black earth, a stone in it now and then, a root. */
export const DEEP = [P.moundDeep, P.moundDeepSpeck, "#221f2a", "#2c2935", "#201a19"] as const;
/** The carved start pad: pale dressed stone. */
export const PAD = [shade(lit(STONE.dark, 0.3), 0.28), lit(STONE.dark, 0.3), lit(STONE.base, 0.3), lit(STONE.light, 0.3), lit(STONE.light, 0.42)] as const;
/** Dressed stone for the doorways' frames. */
export const DRESSED = [STONE.mortar, shade(STONE.base, 0.1), STONE.base, lit(STONE.light, 0.06), lit(STONE.light, 0.22)] as const;

/** A wall's front face is this many pixels tall, at the foot of a wall tile with floor below it. */
export const FACE = 5;

/** A wall tile with floor anywhere around it (eight ways) is the stone lining of a tunnel; any other is the hill. */
export function lined(map: readonly string[], c: number, r: number) {
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!isWall(map, c + dc, r + dr)) return true;
  return false;
}

/** The walls that carry a torch: every lining wall with floor below it whose column and row add up to a multiple of six. */
export const hasTorch = (map: readonly string[], c: number, r: number) => isWall(map, c, r) && !isWall(map, c, r + 1) && (c + r) % 6 === 0;

/** The lining's stone in world pixels, so blocks run on across tiles: courses four high, blocks five to eight wide, lit top left. */
export function liningAt(x: number, y: number): string {
  const course = Math.floor(y / 4);
  const row = y % 4;
  if (row === 3) return LINING[0];
  // Blocks: where each starts along its course, by a hash of the course, so the joints never line up course to course.
  const shift = Math.floor(hash(course, 7, 1) * 8);
  const xx = x + shift;
  // Blocks seven wide on the course's grid, some split in two (four and three), so no row is a wallpaper.
  const span = 7;
  let block = Math.floor(xx / span);
  let at = xx - block * span;
  let width = span;
  if (hash(block, course, 4) < 0.35) {
    if (at < 4) width = 4;
    else {
      at -= 4;
      width = 3;
      block += 1000;
    }
  }
  // Each block's last pixel is the joint to the next.
  if (at === width - 1) return LINING[0];
  width -= 1;
  const v = hash(block, course, 3);
  const body = v < 0.3 ? LINING[1] : v < 0.85 ? LINING[2] : LINING[3];
  if (row === 0) return at === 0 ? LINING[4] : at === width - 1 ? body : lit(body, 0.1);
  if (at === 0 && row === 1) return lit(body, 0.1);
  if (row === 2) return at === width - 1 || v < 0.3 ? LINING[1] : shade(body, 0.08);
  if (at === width - 1) return LINING[1];
  return body;
}

/** The front face in world pixels along its row `fy` (0 the lip, FACE - 1 the foot): shaded blocks bound by an iron band. */
export function faceAt(x: number, fy: number): string {
  if (fy === 0) return hash(x, 3, 9) < 0.18 ? LINING[4] : FACE_TONES[3];
  if (fy === FACE - 1) return FACE_TONES[0];
  if (fy === 2) {
    // The iron band, riveted every eight pixels, each rivet lit on its top left.
    const k = (x + 3) % 8;
    return k === 0 ? IRON[2] : k === 1 ? IRON[0] : IRON[1];
  }
  const joint = (x + (fy === 1 ? 0 : 4)) % 7 === 0;
  return joint ? FACE_TONES[1] : fy === 1 ? FACE_TONES[2] : shade(FACE_TONES[2], 0.06);
}

/** The floor in a tile: packed earth, mottled, pebbles lit on their top left, now and then a worn flagstone. */
function floorTile(out: Pixels, map: readonly string[], c: number, r: number) {
  const x0 = c * TILE;
  const y0 = r * TILE;
  const put = (x: number, y: number, col: string) => {
    if (x >= 0 && y >= 0 && x < TILE && y < TILE) out.px[(y0 + y) * out.w + x0 + x] = col;
  };
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      // Patches of darker and lighter earth, two pixels and more across, and a grain of single pixels in them.
      const patch = hash((x0 + x) >> 2, (y0 + y) >> 2, 11);
      const grain = hash(x0 + x, y0 + y, 12);
      let col: string = EARTH[2];
      if (patch < 0.22) col = grain < 0.7 ? EARTH[1] : EARTH[2];
      else if (patch > 0.8) col = grain < 0.6 ? EARTH[3] : EARTH[2];
      else if (grain < 0.06) col = EARTH[1];
      else if (grain > 0.96) col = EARTH[3];
      put(x, y, col);
    }
  // Pebbles: two or three, each a lit top-left pixel, its body, and its shadow below and to the right.
  const pebbles = 2 + Math.floor(hash(c, r, 20) * 2);
  for (let i = 0; i < pebbles; i++) {
    const px = 1 + Math.floor(hash(c, r, 21 + i) * (TILE - 4));
    const py = 1 + Math.floor(hash(c, r, 31 + i) * (TILE - 4));
    const big = hash(c, r, 41 + i) < 0.4;
    put(px, py, EARTH[4]);
    if (big) {
      put(px + 1, py, EARTH[3]);
      put(px, py + 1, EARTH[3]);
      put(px + 1, py + 1, EARTH[1]);
      put(px + 2, py + 1, EARTH[0]);
      put(px + 1, py + 2, EARTH[0]);
    } else {
      put(px + 1, py, EARTH[1]);
      put(px + 1, py + 1, EARTH[0]);
    }
  }
  // A worn flagstone in about one tile in seven: lit along its top and left, shaded along its foot and right, a crack.
  if (hash(c, r, 99) < 0.15) {
    const w = 5 + Math.floor(hash(c, r, 100) * 4);
    const h = 4 + Math.floor(hash(c, r, 101) * 3);
    const fx = 2 + Math.floor(hash(c, r, 102) * (TILE - w - 4));
    const fy = 2 + Math.floor(hash(c, r, 103) * (TILE - h - 4));
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const edgeTop = y === 0 || x === 0;
        const edgeFoot = y === h - 1 || x === w - 1;
        put(fx + x, fy + y, edgeTop && !edgeFoot ? SLAB[3] : edgeFoot ? SLAB[1] : SLAB[2]);
      }
    for (let x = 1; x < w + 1; x++) put(fx + x, fy + h, EARTH[0]);
    const cx = fx + 1 + Math.floor(hash(c, r, 104) * (w - 2));
    put(cx, fy + 1, SLAB[0]);
    put(cx + (hash(c, r, 105) < 0.5 ? 1 : 0), fy + 2, SLAB[0]);
  }
  // Depth: the wall above throws its foot's shadow two rows onto the floor, the wall to the left one column.
  const north = isWall(map, c, r - 1);
  const west = isWall(map, c - 1, r);
  if (north)
    for (let x = 0; x < TILE; x++) {
      put(x, 0, EARTH[0]);
      put(x, 1, (x + r) % 2 ? EARTH[0] : EARTH[1]);
    }
  if (west)
    for (let y = north ? 2 : 0; y < TILE; y++) {
      put(0, y, EARTH[0]);
      if ((y + c) % 3 === 0) put(1, y, EARTH[1]);
    }
  if (!north && !west && isWall(map, c - 1, r - 1)) {
    put(0, 0, EARTH[0]);
    put(1, 0, EARTH[1]);
    put(0, 1, EARTH[1]);
  }
}

/** A lining wall: its stone top, a cramp of iron across a joint now and then, and its front face where floor is below. */
function wallTile(out: Pixels, map: readonly string[], c: number, r: number) {
  const x0 = c * TILE;
  const y0 = r * TILE;
  const faced = !isWall(map, c, r + 1);
  const top = faced ? TILE - FACE : TILE;
  for (let y = 0; y < top; y++) for (let x = 0; x < TILE; x++) out.px[(y0 + y) * out.w + x0 + x] = liningAt(x0 + x, y0 + y);
  // Iron cramps over a joint: a staple three wide, lit on its top.
  if (hash(c, r, 50) < 0.35) {
    const cy = 3 + 4 * Math.floor(hash(c, r, 51) * Math.max(1, Math.floor((top - 4) / 4)));
    const cx = 2 + Math.floor(hash(c, r, 52) * (TILE - 6));
    if (cy < top - 1)
      for (let i = 0; i < 3; i++) {
        out.px[(y0 + cy) * out.w + x0 + cx + i] = IRON[1];
        out.px[(y0 + cy - 1) * out.w + x0 + cx + i] = i === 0 ? IRON[2] : out.px[(y0 + cy - 1) * out.w + x0 + cx + i];
        out.px[(y0 + cy + 1) * out.w + x0 + cx + i] = i === 2 ? IRON[0] : out.px[(y0 + cy + 1) * out.w + x0 + cx + i];
      }
  }
  if (faced) for (let fy = 0; fy < FACE; fy++) for (let x = 0; x < TILE; x++) out.px[(y0 + top + fy) * out.w + x0 + x] = faceAt(x0 + x, fy);
  // A torch's bracket: an iron ring on the wall, a stick of wood in it (its flame is a light, drawn each frame).
  if (hasTorch(map, c, r)) {
    const set = (x: number, y: number, col: string) => (out.px[(y0 + y) * out.w + x0 + x] = col);
    set(7, 5, P.woodDark);
    set(7, 6, lit(P.woodDark, 0.2));
    set(7, 7, P.woodDark);
    set(6, 8, IRON[2]);
    set(7, 8, IRON[1]);
    set(8, 8, IRON[0]);
    set(7, 9, IRON[0]);
  }
}

/** The hill round the tunnels: near-black earth, a buried stone lit on its top now and then, a thread of root. */
function deepTile(out: Pixels, c: number, r: number) {
  const x0 = c * TILE;
  const y0 = r * TILE;
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      const g = hash(x0 + x, y0 + y, 60);
      out.px[(y0 + y) * out.w + x0 + x] = g < 0.04 ? DEEP[1] : DEEP[0];
    }
  if (hash(c, r, 61) < 0.3) {
    const sx = 2 + Math.floor(hash(c, r, 62) * 11);
    const sy = 2 + Math.floor(hash(c, r, 63) * 11);
    out.px[(y0 + sy) * out.w + x0 + sx] = DEEP[3];
    out.px[(y0 + sy) * out.w + x0 + sx + 1] = DEEP[2];
    out.px[(y0 + sy + 1) * out.w + x0 + sx] = DEEP[2];
    out.px[(y0 + sy + 1) * out.w + x0 + sx + 1] = DEEP[1];
  }
  if (hash(c, r, 64) < 0.2) {
    let x = Math.floor(hash(c, r, 65) * 14);
    for (let y = 0; y < 6; y++) {
      out.px[(y0 + 5 + y) * out.w + x0 + x] = DEEP[4];
      if (hash(c, r, 66 + y) < 0.5) x = Math.min(TILE - 1, x + 1);
    }
  }
}

/** The carved start pad: slabs of pale dressed stone, each lit on its top left, and a ring cut into them (dark, its far lip lit). */
function padPixels(out: Pixels, map: readonly string[]) {
  const s = startOf(map);
  const x0 = s.c * TILE;
  const y0 = s.r * TILE;
  for (let y = 0; y < TILE * 2; y++)
    for (let x = 0; x < TILE * 2; x++) {
      const bx = Math.floor(x / 8);
      const by = Math.floor(y / 8);
      const ix = x % 8;
      const iy = y % 8;
      const v = hash(s.c * 4 + bx, s.r * 4 + by, 5);
      const body = v < 0.4 ? PAD[1] : v < 0.8 ? PAD[2] : PAD[3];
      const col = ix === 0 || iy === 0 ? PAD[0] : iy === 1 || ix === 1 ? (v < 0.4 ? PAD[2] : PAD[4]) : iy === 7 || ix === 7 ? PAD[1] : body;
      out.px[(y0 + y) * out.w + x0 + x] = col;
    }
  const ringAt = (dx: number, dy: number) => {
    const d = Math.hypot(dx + 0.5, dy + 0.5);
    return (d >= 11 && d < 12.2) || (d >= 5 && d < 6);
  };
  for (let dy = -TILE; dy < TILE; dy++)
    for (let dx = -TILE; dx < TILE; dx++) {
      if (ringAt(dx, dy)) out.px[(y0 + TILE + dy) * out.w + x0 + TILE + dx] = shade(STONE.dark, 0.45);
      else if (ringAt(dx - 1, dy - 1) && dx < TILE - 1 && dy < TILE - 1) out.px[(y0 + TILE + dy) * out.w + x0 + TILE + dx] = PAD[4];
    }
}

/** Dressed stone laid as blocks in a rectangle of world pixels: three-high courses, lit on their top left. */
function dressed(out: Pixels, x0: number, y0: number, w: number, h: number) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const course = Math.floor(y / 3);
      const off = (course * 4) % 7;
      const at = (x + off) % 7;
      const row = y % 3;
      const col = row === 2 || at === 6 ? DRESSED[0] : row === 0 ? (at === 0 ? DRESSED[4] : DRESSED[3]) : at === 5 ? DRESSED[1] : DRESSED[2];
      out.px[y * out.w + x] = col;
    }
}

/** The entrance on the first level: a doorway in the left wall of the start room (its opening is the daylight, drawn bright). */
export const ENTRANCE = { x: 3, y: 16 * TILE + 5, w: 9, h: 23 };
function entrancePixels(out: Pixels) {
  dressed(out, 1, 16 * TILE + 1, 13, 4);
  dressed(out, 1, 16 * TILE + 1, 2, 30);
  dressed(out, 12, 16 * TILE + 1, 2, 30);
  dressed(out, 1, 17 * TILE + 12, 13, 3);
  for (let y = ENTRANCE.y; y < ENTRANCE.y + ENTRANCE.h; y++) for (let x = ENTRANCE.x; x < ENTRANCE.x + ENTRANCE.w; x++) out.px[y * out.w + x] = VOID;
}

/** A square frame of dressed stone round the 2 x 2 finish, 3 thick; the way deeper goes down three steps into the dark. */
export const FRAME = 3;
function finishPixels(out: Pixels, map: readonly string[], daylight: boolean) {
  const f = finishOf(map);
  const x = f.c * TILE;
  const y = f.r * TILE;
  dressed(out, x, y, TILE * 2, FRAME);
  dressed(out, x, y + TILE * 2 - FRAME, TILE * 2, FRAME);
  dressed(out, x, y + FRAME, FRAME, TILE * 2 - 2 * FRAME);
  dressed(out, x + TILE * 2 - FRAME, y + FRAME, FRAME, TILE * 2 - 2 * FRAME);
  const iw = TILE * 2 - 2 * FRAME;
  for (let yy = 0; yy < iw; yy++)
    for (let xx = 0; xx < iw; xx++) {
      let col = daylight ? VOID : "#0b0910";
      if (!daylight) {
        // Three steps going down, each a lit nosing and a darker tread, into the dark.
        const step = Math.floor(yy / 5);
        const k = yy % 5;
        if (step < 3) col = k === 0 ? shade(DRESSED[3], 0.35 + step * 0.2) : shade(DRESSED[2], 0.55 + step * 0.13);
        if (xx === 0 && step < 3) col = shade(DRESSED[1], 0.7);
      }
      out.px[(y + FRAME + yy) * out.w + x + FRAME + xx] = col;
    }
  if (!daylight) {
    // A torch on the lintel's inner edge, as before: it leads deeper.
    out.px[(y + 7) * out.w + x + 15] = IRON[1];
    out.px[(y + 7) * out.w + x + 16] = IRON[0];
    out.px[(y + 8) * out.w + x + 15] = P.woodDark;
    out.px[(y + 9) * out.w + x + 15] = P.woodDark;
  }
}

/** A level's still layer, as colours: the floor, the lining and its faces, the hill, the pad, the doorways, the brackets. */
export function stillPixels(def: LevelDef): Pixels {
  const { map } = def;
  const out: Pixels = { w: COLS * TILE, h: ROWS * TILE, px: new Array<string>(COLS * TILE * ROWS * TILE).fill("") };
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (!isWall(map, c, r)) floorTile(out, map, c, r);
      else if (lined(map, c, r)) wallTile(out, map, c, r);
      else deepTile(out, c, r);
    }
  padPixels(out, map);
  if (def === LEVELS[0]) entrancePixels(out);
  finishPixels(out, map, def === LEVELS[LEVELS.length - 1]);
  return out;
}
