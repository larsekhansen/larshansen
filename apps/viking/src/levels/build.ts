import { TILE } from "@larshansen/pixelkit/config";
import type { Ramp } from "@larshansen/pixelkit/tilemap";

// A text map put together from strokes (a stretch of ground, a ledge, a letter) rather than typed
// out in full, which is easier to keep straight at 250 columns. The result is the same thing the
// first three levels type out: one string per row, one letter per 16 px tile.

export interface MapBuilder {
  cols: number;
  rows: number;
  /** Fills columns c0 to c1 and rows r0 to r1, both inclusive, with a letter. */
  fill(c0: number, c1: number, r0: number, r1: number, ch: string): MapBuilder;
  /** Ground from row r down to the bottom, over columns c0 to c1. */
  ground(c0: number, c1: number, r: number, ch?: string): MapBuilder;
  /** A one-letter-high run, such as a ledge, from c0 to c1 in row r. */
  run(c0: number, c1: number, r: number, ch: string): MapBuilder;
  /** Puts the letters of `s` from column c in row r. */
  put(c: number, r: number, s: string): MapBuilder;
  /**
   * A slope from the top of row r0 at column c0 to the top of row r1 at column c1, walked on as a
   * ramp. Under it, every tile the slope is clear of (with room for him to stand either side) is
   * filled with `under`, so it reads as solid ground; with `under` null it stands on stilts, open
   * below. The slope itself is drawn by the level.
   */
  slope(c0: number, r0: number, c1: number, r1: number, under?: string | null): Ramp;
  rows_(): string[];
}

export function mapBuilder(cols: number, rows: number): MapBuilder {
  const g = Array.from({ length: rows }, () => Array<string>(cols).fill("."));
  const b: MapBuilder = {
    cols,
    rows,
    fill(c0, c1, r0, r1, ch) {
      for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) g[r][c] = ch;
      return b;
    },
    ground: (c0, c1, r, ch = "#") => b.fill(c0, c1, r, rows - 1, ch),
    run: (c0, c1, r, ch) => b.fill(c0, c1, r, r, ch),
    put(c, r, s) {
      [...s].forEach((ch, i) => {
        if (c + i >= 0 && c + i < cols && r >= 0 && r < rows) g[r][c + i] = ch;
      });
      return b;
    },
    slope(c0, r0, c1, r1, under: string | null = "#") {
      const x0 = c0 * TILE;
      const x1 = c1 * TILE;
      const y0 = r0 * TILE;
      const y1 = r1 * TILE;
      const at = (x: number) => y0 + ((Math.max(x0, Math.min(x1, x)) - x0) / (x1 - x0)) * (y1 - y0);
      for (let c = c0; c < c1 && under !== null; c++) {
        // The lowest the slope comes over this tile and half a body either side of it.
        const low = Math.max(at(c * TILE - 8), at((c + 1) * TILE + 8));
        for (let r = Math.ceil(low / TILE); r < rows; r++) if (g[r][c] === ".") g[r][c] = under;
      }
      // At its high end the slope runs on, flat, over the first tile of the ground there, and that
      // tile's top is left open: so he never stubs his toe on the ground's edge a hair above the slope.
      const up = r1 < r0;
      const edge = up ? c1 : c0 - 1;
      const top = up ? r1 : r0;
      if (edge >= 0 && edge < cols) {
        g[top][edge] = ".";
        if (under !== null) for (let r = top + 1; r < rows; r++) if (g[r][edge] === "." || g[r][edge] === "#") g[r][edge] = under;
      }
      return { points: up ? [[x0, y0], [x1, y1], [x1 + TILE, y1]] : [[x0 - TILE, y0], [x0, y0], [x1, y1]] };
    },
    rows_: () => g.map((row) => row.join(""))
  };
  return b;
}
