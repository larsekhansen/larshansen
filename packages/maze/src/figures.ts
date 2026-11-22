import { frame, paint, type Frame } from "@larshansen/pixelkit/frames";
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

/** The raven on its wall, facing right: a blue-black sheen on its lit side, a grey beak, an eye; its head turns on its own. */
const RAVEN_HEAD = ["..kKk..", ".kKKebb", "kkKkkB."];
const RAVEN_BODY = ["kKkkkk.", ".kkkd..", "..f.f.."];
const RAVEN_INK = { k: P.raven, K: "#33364f", d: "#0b090e", e: P.ravenEye, b: P.ravenBeak, B: shade(P.ravenBeak, 0.35), f: P.ravenBeak };
export const RAVEN = {
  head: frame("raven's head", RAVEN_INK, [RAVEN_HEAD]),
  blink: frame("raven's head, blinking", RAVEN_INK, [RAVEN_HEAD.map((r) => r.replace("e", "k"))]),
  body: frame("raven", RAVEN_INK, [RAVEN_BODY])
};

/** The mound-dweller on his stone seat, 9 x 12: a grey hood and cloak lit on its left edge, his face in shadow. */
const SEATED = ["..ggggg..", ".ggggggg.", "ggdddddgg", "ggdddddgg", ".gdddddg.", ".ggggggg.", "ggggggggg", "ggGgggGgg", "ggGgggGgg", "ggGgggGgg", "gGGgggGGg", "GGG...GGG"];
const litLeft = (rows: string[]) =>
  rows.map((row) => [...row].map((ch, i) => (ch === "g" && (i === 0 || row[i - 1] === ".") ? "L" : ch === "g" && (i === row.length - 1 || row[i + 1] === ".") ? "G" : ch)).join(""));
export const DWELLER = frame("mound-dweller", { g: "#a3a9a6", L: "#c2c7c4", G: "#7f8582", d: "#1b1c22" }, [litLeft(SEATED)]);

/** Draws a figure's frame in world pixels, facing right or mirrored about its own width. */
export function put(f: Frame, x: number, y: number, facing = 1) {
  paint(f, x, y, facing, f.x1);
}

// --- the adders --------------------------------------------------------------------------------------------------------

/** An adder (Norway's only venomous snake: the mound's own, not an invader): grey-brown, lit along its back, a dark zigzag. */
export const ADDER = { belly: "#5f574c", body: "#8c8274", light: "#b0a694", top: "#cdc3b0", zigzag: "#2b231e", eye: ENEMY.eye, tongue: P.tongue };
/** Its outline, as the viking game outlines what hurts (ADR 0044): the near-black line, then the warning red. */
export const ADDER_LINE = ENEMY.line;
export const ADDER_EDGE = ENEMY.warning;

const ADDER_L = 12;
/** An adder's body in its own 12 x 6 box, lying along x, head toward `dir`, waving by its own clock `t` (not the page's). */
export function adderCells(t: number, dir: 1 | -1): string[][] {
  const grid: string[][] = Array.from({ length: 6 }, () => Array<string>(ADDER_L).fill("."));
  for (let i = 0; i < ADDER_L; i++) {
    // Counted from the tail, so the head is at the end the adder is going toward.
    const k = dir > 0 ? i : ADDER_L - 1 - i;
    const w = Math.sin(t * 0.22 - k * 0.85);
    const off = w > 0.45 ? 1 : w < -0.45 ? -1 : 0;
    const rows = k >= ADDER_L - 2 ? [1, 2, 3, 4] : [1, 2, 3, 4].slice(k < 2 ? 1 : 0, k < 2 ? 3 : 4); // thinner tail, fuller head
    rows.forEach((row, j) => {
      // Lit along its back (the top row), its belly shaded, the zigzag down its middle.
      const zig = k < ADDER_L - 2 && j === 1 + (k % 2);
      grid[row + off][i] = j === 0 ? "t" : j === rows.length - 1 ? "b" : zig ? "z" : j === 1 ? "l" : "m";
    });
  }
  const headI = dir > 0 ? ADDER_L - 1 : 0;
  const eyeRow = grid.findIndex((r) => r[headI] !== ".");
  if (eyeRow >= 0) grid[eyeRow + 1][headI] = "e";
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
    // Past the red, from the middle of its head.
    const head = dir > 0 ? ADDER_L - 1 : 0;
    const rows = grid.map((r, i) => (r[head] !== "." ? i : -1)).filter((i) => i >= 0);
    out[rows[Math.floor(rows.length / 2)] + OY][head + OX + dir * 3] = ADDER.tongue;
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
