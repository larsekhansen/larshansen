import { R, ctx, mix, view } from "./paint";

// Frames as data (order 23; in the kit since order 36, so the maze draws him from the same sheet as the viking game): a drawing is rows of letters, one letter a pixel, each letter a colour from a named ramp
// of three to five tones per material (a shade, a middle, a light, a highlight). This is way 3 of `docs/games/GRAIN.md`:
// the same grain, better drawn. A frame keeps no size of its own beyond its letters, so it survives either answer to
// the grain: drawn twice as fine, a frame is the same data at a different scale.
//
// A frame is kept as runs (a row's neighbouring pixels of one colour are one rectangle), worked out once when the
// file is read: drawing one is a rectangle per run, and an outlined thing (an enemy) paints its runs once into the
// sprite cache (`render/sprite.ts`) and is copied from then on.

export interface Frame {
  name: string;
  /** Four numbers a run: x and y from the frame's origin, its length, and its colour's index in `ink`. */
  runs: Int16Array;
  ink: string[];
  /** What it paints, from its origin: the left, top, right and bottom edges. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /**
   * An invader's frame with glam marks (order 27, ADR 0050): the same frame without them (its natural self, drawn in its
   * natural ramp when the glamour breaks), and the marks alone (what flies off).
   */
  bare?: Frame;
  marks?: Frame;
}

/**
 * A piece of a drawing: its rows, put `dx` right and `dy` down of the frame's origin. `glam`: a glam mark (shades, a
 * crest, a headband, leg warmers: order 27), which the glamour put on and a stomp knocks off.
 */
export type Piece = readonly [rows: readonly string[], dx?: number, dy?: number, glam?: boolean];

/**
 * A frame from pieces laid one over another (a later piece's letters over an earlier's; "." leaves what is under
 * it). Every row of a piece as wide as its first, and every letter with a colour, or the file is wrong. With glam
 * marks among the pieces it also has its bare self and its marks.
 */
export function frame(name: string, colours: Record<string, string>, ...pieces: Piece[]): Frame {
  const cells = laid(name, colours, pieces);
  const f = ran(name, colours, cells);
  if (pieces.some((p) => p[3])) {
    const bare = laid(name, colours, pieces.filter((p) => !p[3]));
    f.bare = ran(name, colours, bare);
    // The marks: whatever the glam pieces changed, as it shows over the rest.
    f.marks = ran(`${name}, its glam`, colours, new Map([...cells].filter(([k, ch]) => bare.get(k) !== ch)));
  }
  return f;
}

/** A drawing's cells, "column,row" to its letter, from pieces laid one over another. */
function laid(name: string, colours: Record<string, string>, pieces: readonly Piece[]): Map<string, string> {
  const cells = new Map<string, string>();
  for (const [rows, dx = 0, dy = 0] of pieces) {
    const w = rows[0].length;
    rows.forEach((row, r) => {
      if (row.length !== w) throw new Error(`${name}: row ${r} is ${row.length} wide, not ${w}`);
      for (let c = 0; c < w; c++) {
        const ch = row[c];
        if (ch === ".") continue;
        if (ch === " ") {
          cells.delete(`${c + dx},${r + dy}`);
          continue;
        }
        if (!colours[ch]) throw new Error(`${name}: no colour for "${ch}"`);
        cells.set(`${c + dx},${r + dy}`, ch);
      }
    });
  }
  return cells;
}

/** A frame from its cells: kept as runs. */
function ran(name: string, colours: Record<string, string>, cells: Map<string, string>): Frame {
  const at = [...cells].map(([k, ch]) => {
    const [x, y] = k.split(",").map(Number);
    return { x, y, ch };
  });
  at.sort((a, b) => a.y - b.y || a.x - b.x);
  const ink: string[] = [];
  const index = new Map<string, number>();
  const runs: number[] = [];
  for (let i = 0; i < at.length; ) {
    const { x, y, ch } = at[i];
    let n = 1;
    while (i + n < at.length && at[i + n].y === y && at[i + n].x === x + n && at[i + n].ch === ch) n++;
    if (!index.has(ch)) {
      index.set(ch, ink.length);
      ink.push(colours[ch]);
    }
    runs.push(x, y, n, index.get(ch)!);
    i += n;
  }
  const xs = at.map((a) => a.x);
  const ys = at.map((a) => a.y);
  return { name, runs: Int16Array.from(runs), ink, x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs) + 1, y1: Math.max(...ys) + 1 };
}

/** The same frame with its colours changed (a gold helmet, the night's dimming): its runs shared, its ink new. */
export function inked(f: Frame, recolour: (c: string) => string): Frame {
  return { ...f, ink: f.ink.map(recolour), ...(f.bare && f.marks ? { bare: inked(f.bare, recolour), marks: inked(f.marks, recolour) } : {}) };
}

/**
 * Draws a frame in world pixels with its origin at (x, y), facing right, or mirrored about a box `w` wide when it
 * faces left (a figure's front is its right side as drawn).
 */
export function paint(f: Frame, x: number, y: number, facing: number, w: number) {
  const r = f.runs;
  for (let i = 0; i < r.length; i += 4) R(facing > 0 ? x + r[i] : x + w - r[i] - r[i + 2], y + r[i + 1], r[i + 2], 1, f.ink[r[i + 3]]);
}

const stamps = new Map<Frame, HTMLCanvasElement>();
/**
 * Draws a frame facing right at world (x, y) as one copy of a canvas it is painted onto once (a skilling, the cheese):
 * a copy a frame instead of a rectangle a run. Where there is no page (the tests, which read the colours), as runs.
 */
export function stamp(f: Frame, x: number, y: number) {
  if (typeof document === "undefined") return paint(f, x, y, 1, f.x1);
  let c = stamps.get(f);
  if (!c) {
    c = document.createElement("canvas");
    c.width = f.x1;
    c.height = f.y1;
    const g = c.getContext("2d")!;
    const r = f.runs;
    for (let i = 0; i < r.length; i += 4) {
      g.fillStyle = f.ink[r[i + 3]];
      g.fillRect(r[i], r[i + 1], r[i + 2], 1);
    }
    stamps.set(f, c);
  }
  ctx().drawImage(c, Math.round(x) - view.camX, Math.round(y) - view.camY);
}

/** Every pixel of a frame, as column and row from its origin (mirrored about `w` when it faces left), with its colour. */
export function pixels(f: Frame, facing: number, w: number, dot: (c: number, r: number, colour: string) => void) {
  const r = f.runs;
  for (let i = 0; i < r.length; i += 4)
    for (let k = 0; k < r[i + 2]; k++) dot(facing > 0 ? r[i] + k : w - 1 - r[i] - k, r[i + 1], f.ink[r[i + 3]]);
}

/**
 * A frame turned: a quarter turn with its right side up ("up": a rat's snout pointing up as it leaps), the other way
 * ("down"), or upside down ("over"). Its pixels and colours as they were, its origin at the turned picture's top left.
 */
export function turned(f: Frame, name: string, how: "up" | "down" | "over"): Frame {
  const at: { x: number; y: number; c: string }[] = [];
  pixels(f, 1, f.x1, (c, r, colour) => at.push({ x: c - f.x0, y: r - f.y0, c: colour }));
  const w = f.x1 - f.x0;
  const h = f.y1 - f.y0;
  const moved = at.map((p) => (how === "up" ? { x: p.y, y: w - 1 - p.x, c: p.c } : how === "down" ? { x: h - 1 - p.y, y: p.x, c: p.c } : { x: p.x, y: h - 1 - p.y, c: p.c }));
  const letters = new Map<string, string>();
  const ink: Record<string, string> = {};
  for (const p of moved) if (!letters.has(p.c)) letters.set(p.c, String.fromCharCode(65 + letters.size));
  for (const [c, l] of letters) ink[l] = c;
  const W = Math.max(...moved.map((p) => p.x)) + 1;
  const H = Math.max(...moved.map((p) => p.y)) + 1;
  const rows = Array.from({ length: H }, () => Array<string>(W).fill("."));
  for (const p of moved) rows[p.y][p.x] = letters.get(p.c)!;
  return frame(name, ink, [rows.map((r) => r.join(""))]);
}

/** A ramp's tones from one colour: toward a dark that keeps its hue, and toward white. */
export const shade = (c: string, k: number) => mix(c, "#141018", k);
export const lit = (c: string, k: number) => mix(c, "#ffffff", k);
