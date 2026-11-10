// The Elder Futhark runes that spell LARS HANSEN, as strokes in a 1 x 1 box, so no runic font is
// needed. `runeCells` turns the strokes into a small pixel grid with one-pixel lines.

export type RuneChar = "L" | "A" | "R" | "S" | "H" | "N" | "E";
type Stroke = [number, number][];

export const RUNE_STROKES: Record<RuneChar, Stroke[]> = {
  L: [
    [[0.35, 0], [0.35, 1]],
    [[0.35, 0], [0.78, 0.36]]
  ],
  A: [
    [[0.3, 0], [0.3, 1]],
    [[0.3, 0], [0.76, 0.3]],
    [[0.3, 0.3], [0.76, 0.6]]
  ],
  R: [
    [[0.27, 0], [0.27, 1]],
    [[0.27, 0], [0.72, 0.25], [0.27, 0.5], [0.76, 1]]
  ],
  S: [[[0.7, 0], [0.3, 0.34], [0.7, 0.62], [0.3, 1]]],
  H: [
    [[0.25, 0], [0.25, 1]],
    [[0.75, 0], [0.75, 1]],
    [[0.25, 0.36], [0.75, 0.64]]
  ],
  N: [
    [[0.5, 0], [0.5, 1]],
    [[0.24, 0.34], [0.76, 0.66]]
  ],
  E: [[[0.2, 1], [0.2, 0], [0.5, 0.36], [0.8, 0], [0.8, 1]]]
};

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
