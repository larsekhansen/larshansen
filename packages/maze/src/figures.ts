import { frame, pixels, type Frame } from "@larshansen/pixelkit/frames";
import { R, mix, view } from "@larshansen/pixelkit/paint";
import { COIN, ENEMY, PALETTE } from "@larshansen/pixelkit/palette";

// The mound's figures and the things in it as per-pixel maps (order 36), by the viking game's methods (orders 23 to 28,
// `@larshansen/pixelkit/frames`): each a ramp of tones per material, lit from the top left, kept as runs. The raven, the
// standing stones, the rune key, the teleport stones, the mound-dweller, and the adders, which can hurt him and move, so
// they are outlined as the viking game outlines what hurts (ADR 0044): a near-black line, then the warning red.

const P = PALETTE;
const shade = (c: string, k: number) => mix(c, "#141018", k);
const lit = (c: string, k: number) => mix(c, "#ffffff", k);

/** A standing stone's granite: its dark (a pit, its foot), shade, body, light and highlight. */
export const GRANITE = ["#6c675f", "#8d887f", "#b7b2a8", "#d0cbc0", "#e6e2d8"] as const;

/** A standing stone is 8 x 12 in its tile; the rune is one stroke on it. */
export const STONE_W = 8;
export const STONE_H = 12;
export const STONE_RUNE: [number, number][] = [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [4, 4], [5, 3], [4, 7], [5, 6]];

/** The stone, lit from the top left: a rounded head, a lit left side, a shaded right side and foot, two weathered pits. */
const STONE_ROWS = ["..hlll..", ".hlbbbs.", "hlbbbbbs", "lbbbbbbs", "lbbbbbds", "lbbbbbbs", "lbbbbbbs", "lbdbbbbs", "lbbbbbbs", "lbbbbbbs", "lbbbbbss", "dsssssss"];
const runeRows = (ch: string) => {
  const rows = Array.from({ length: STONE_H }, () => Array<string>(STONE_W).fill("."));
  for (const [x, y] of STONE_RUNE) rows[y][x] = ch;
  return rows.map((r) => r.join(""));
};
const STONE_INK = { d: GRANITE[0], s: GRANITE[1], b: GRANITE[2], l: GRANITE[3], h: GRANITE[4], g: P.moundDeep, u: P.runeGlow, w: "#ffffff", f: "#f4f1ea" };
/** The standing stone: unlit (its rune a dark groove), lit (the rune in the rune's blue), and flaring white as it lights. */
export const STONES = {
  unlit: frame("standing stone", STONE_INK, [STONE_ROWS], [runeRows("g")]),
  lit: frame("standing stone, lit", STONE_INK, [STONE_ROWS], [runeRows("u")]),
  flare: frame("standing stone, lighting", STONE_INK, [STONE_ROWS.map((r) => r.replace(/[bsd]/g, "f").replace(/[lh]/g, "w"))], [runeRows("u")])
};

/** The rune key: a bow of the take-gold (what he picks up, ADR 0039) with the rune's blue in it and a glint, an iron shaft and bit. */
const KEY_ROWS = [".wGG.", "GG.Gg", "GuuuG", "Gg.gg", ".ggg.", "..I..", "..i..", "..iII", "..i..", "..iij"];
const KEY_INK = { G: COIN.gold, g: COIN.goldDark, w: COIN.shine, u: P.runeGlow, I: lit(P.iron, 0.45), i: P.iron, j: shade(P.iron, 0.4) };
export const KEY = frame("rune key", KEY_INK, [KEY_ROWS]);

/**
 * The raven on its wall, perched, facing right (order 38, redrawn: order 36's was a few dark pixels, 7 x 6, lost on the dark
 * stone). A raven as one sits on a wall: a heavy head with the raven's great bill, grey and hooked, a pale eye that can be
 * found, shaggy feathers at its throat; its body leaning forward, wings folded, a long wedge of tail hanging behind and down,
 * its feet gripping the wall's edge. Black lit from the top left in the blue-violet sheen a raven's feathers take from a torch,
 * so it stands off the slate it sits on. 10 x 13: the head (8 x 5) a piece of its own, so it turns toward him, and blinks.
 */
const RAVEN_HEAD = ["..SKKk..", ".SKkkkk.", "SKkkeBbb", ".kkkkBb.", "..kkkk.."];
const RAVEN_BODY = ["...SKKkk..", "..SKKkkkkk", ".SKkkkkkkd", ".Kkkkkkkdd", "Kkkkkkkdd.", "kkkkkkdd..", ".kkdkdd...", "dd..f.f...", "d...ff.ff."];
const RAVEN_INK = { k: P.raven, K: "#33364f", S: "#525884", d: "#0b090e", e: P.ravenEye, b: P.ravenBeak, B: shade(P.ravenBeak, 0.35), f: "#6a645a" };
export const RAVEN = {
  head: frame("raven's head", RAVEN_INK, [RAVEN_HEAD]),
  blink: frame("raven's head, blinking", RAVEN_INK, [RAVEN_HEAD.map((r) => r.replace("e", "k"))]),
  body: frame("raven", RAVEN_INK, [RAVEN_BODY])
};
/** The raven's size, and where its head sits on its body (over its breast, at the front, whichever way it faces). */
export const RAVEN_W = 10;
export const RAVEN_H = 13;
/** The raven's pixels, row by row ("" nothing): its body facing `facing`, its head turned toward `look`, blinking or not. */
export function ravenGrid(facing: 1 | -1, look: 1 | -1, blink: boolean): string[][] {
  const g = Array.from({ length: RAVEN_H }, () => Array<string>(RAVEN_W).fill(""));
  pixels(RAVEN.body, facing, RAVEN.body.x1, (c, r, colour) => (g[r + 4][c] = colour));
  const head = blink ? RAVEN.blink : RAVEN.head;
  const hx = facing > 0 ? 2 : 0;
  pixels(head, look, head.x1, (c, r, colour) => (g[r][c + hx] = colour));
  return g;
}
/** Draws the raven at (x, y), a rectangle a pixel (the maze keeps it as a piece and copies it: `render.ts`). */
export function drawRavenAt(x: number, y: number, facing: 1 | -1, look: 1 | -1, blink: boolean) {
  ravenGrid(facing, look, blink).forEach((row, r) => row.forEach((c, k) => c && R(x + k, y + r, 1, 1, c)));
}

/**
 * The mound-dweller on his stone seat, 9 x 12 (order 38, redrawn: order 36's was a grey block whose eyes the page drew apart
 * from it). The hood's peak and its opening rounded round a face in shadow, two pale points of eyes in it that follow him; the
 * cloak falling from his shoulders in folds, lit on its left, his pale hands folded in his lap, its hem parted over his feet.
 * Three frames: his eyes to his left, ahead and to his right.
 */
const SEATED = [
  "..LLggG..",
  ".LgggggG.",
  "LgdddddgG",
  "LgdddddgG",
  ".gdddddG.",
  ".LggdggG.",
  "LgggggggD",
  "LgGgggGgD",
  "LgGgggGGD",
  "LggHHhgGD",
  "LgGgggGGD",
  "DGD...DGD"
];
const DWELLER_INK = { g: "#a3a9a6", L: "#c2c7c4", G: "#7f8582", D: "#5f6562", d: "#1b1c22", e: "#e2dcc0", H: "#c8bfae", h: "#9a9282" };
/** The mound-dweller with his eyes to his left (-1), ahead (0) or to his right (1). */
export const DWELLER: Record<-1 | 0 | 1, Frame> = {
  [-1]: frame("mound-dweller, looking left", DWELLER_INK, [SEATED], [["e.e"], 2, 3]),
  0: frame("mound-dweller", DWELLER_INK, [SEATED], [["e.e"], 3, 3]),
  1: frame("mound-dweller, looking right", DWELLER_INK, [SEATED], [["e.e"], 4, 3])
};

// --- the adders --------------------------------------------------------------------------------------------------------

/** An adder (Norway's only venomous snake: the mound's own, not an invader): grey-brown, lit along its back, a dark zigzag. */
export const ADDER = { belly: "#5f574c", body: "#8c8274", light: "#b0a694", top: "#cdc3b0", zigzag: "#2b231e", eye: ENEMY.eye, tongue: P.tongue };
/** Its outline, as the viking game outlines what hurts (ADR 0044): the near-black line, then the warning red. */
export const ADDER_LINE = ENEMY.line;
export const ADDER_EDGE = ENEMY.warning;

const ADDER_L = 12;
/**
 * An adder's body in its own 12 x 6 box, lying along x, head toward `dir`, waving by its own clock `t` (not the page's): a
 * tail tapering to a point, a body three pixels thick lit along its back with the dark zigzag down it, a broad head with the
 * dark mark on its crown and an eye.
 */
export function adderCells(t: number, dir: 1 | -1): string[][] {
  const grid: string[][] = Array.from({ length: 6 }, () => Array<string>(ADDER_L).fill("."));
  for (let i = 0; i < ADDER_L; i++) {
    // Counted from the tail, so the head is at the end the adder is going toward.
    const k = dir > 0 ? i : ADDER_L - 1 - i;
    const head = k >= ADDER_L - 3;
    // The head holds its line; the body waves behind it, more toward the tail.
    const w = head ? 0 : Math.sin(t * 0.22 - k * 0.85);
    const off = w > 0.5 ? 1 : w < -0.5 ? -1 : 0;
    const rows = head ? [1, 2, 3, 4] : k <= 1 ? [3] : k <= 3 ? [2, 3] : [1, 2, 3];
    rows.forEach((row, j) => {
      const top = j === 0;
      const foot = j === rows.length - 1 && rows.length > 1;
      // The zigzag: dark on its back every third pixel, and on its flank the pixel after; on the head the crown's mark.
      const zig = (top && k % 3 === 0) || (!top && !foot && k % 3 === 1);
      grid[row + off][i] = head ? (top ? (k === ADDER_L - 2 ? "z" : "t") : foot ? "b" : "m") : zig ? "z" : top ? "l" : foot ? "b" : "m";
    });
  }
  // The eye, on the side of its head, a pixel behind its snout.
  const eyeAt = dir > 0 ? ADDER_L - 2 : 1;
  grid[2][eyeAt] = "e";
  return grid;
}

const ADDER_INK: Record<string, string> = { t: ADDER.top, l: ADDER.light, m: ADDER.body, b: ADDER.belly, z: ADDER.zigzag, e: ADDER.eye };

/**
 * Draws an adder centred at world (x, y): `flat` lies along x, otherwise it is turned on its side to run up and down. Its
 * body, the near-black line round it, the warning red round that, and its tongue past the red when it flicks.
 */
export function drawAdder(x: number, y: number, flat: boolean, dir: 1 | -1, t: number) {
  // The tongue flicks out by the adder's own clock; with reduced motion it stays out, still.
  const tongue = view.reduced || Math.floor(t / 7) % 3 !== 0;
  const grid = adderCells(t, dir);
  // Its box with room round the body for the line and the red (two pixels), and a third pixel for the tongue beyond them.
  const OX = 3;
  const OY = 2;
  const H = 6 + 2 * OY;
  const W = ADDER_L + 2 * OX;
  const cell = (c: number, r: number) => grid[r - OY]?.[c - OX] ?? ".";
  const body = (c: number, r: number) => cell(c, r) !== ".";
  const out: string[][] = Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => (body(c, r) ? ADDER_INK[cell(c, r)] : "")));
  const near = (c: number, r: number, test: (c: number, r: number) => boolean) => test(c - 1, r) || test(c + 1, r) || test(c, r - 1) || test(c, r + 1);
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (!out[r][c] && near(c, r, body)) out[r][c] = ADDER_LINE;
  const lined = (c: number, r: number) => out[r]?.[c] === ADDER_LINE;
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (!out[r][c] && near(c, r, lined)) out[r][c] = ADDER_EDGE;
  if (tongue) {
    // Past the red, from the middle of its snout, forked: two pixels.
    const head = dir > 0 ? ADDER_L - 1 : 0;
    out[3 + OY][head + OX + dir * 3] = ADDER.tongue;
    out[2 + OY][head + OX + dir * 3] = ADDER.tongue;
  }
  const left = Math.round(x - (flat ? W : H) / 2);
  const top = Math.round(y - (flat ? H : W) / 2);
  // In runs along its length: a rectangle a run of one colour.
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; ) {
      const col = out[r][c];
      let n = 1;
      while (c + n < W && out[r][c + n] === col) n++;
      if (col) {
        if (flat) R(left + c, top + r, n, 1, col);
        else R(left + r, top + c, 1, n, col);
      }
      c += n;
    }
}
