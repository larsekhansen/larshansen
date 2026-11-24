import { RUNE_STROKES, type RuneChar } from "./runes";

// The runes as pixels: `runeCells` turns a rune's strokes (`runes.ts`) into a small grid with one-pixel lines. Only what is drawn
// with `feel`'s file asks for it (the rune on its stone, its flight, the map's stones), so it comes in that file (order 42: it was
// in the first script, which draws the header's runes as strokes).

const cache = new Map<string, boolean[][]>();

/** The rune as `rows` rows of `cols` cells, true where a pixel is lit. Lines run one cell wide. */
export function runeCells(char: RuneChar, cols: number, rows: number): boolean[][] {
  const key = `${char}${cols}x${rows}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const grid = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  for (const stroke of RUNE_STROKES[char])
    for (let i = 0; i < stroke.length - 1; i++) {
      // A straight line between two points, a cell at a time.
      let x0 = Math.round(stroke[i][0] * (cols - 1));
      let y0 = Math.round(stroke[i][1] * (rows - 1));
      const x1 = Math.round(stroke[i + 1][0] * (cols - 1));
      const y1 = Math.round(stroke[i + 1][1] * (rows - 1));
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        grid[y0][x0] = true;
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x0 += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y0 += sy;
        }
      }
    }
  cache.set(key, grid);
  return grid;
}
