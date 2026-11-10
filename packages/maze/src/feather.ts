import { R } from "@larshansen/pixelkit/paint";

// The raven's feather: 5 x 9 art pixels, black with one blue sheen pixel. It is the reward at the
// end of the mound and is drawn both there (floating over the finish) and in the fjord (falling
// onto him), so it lives in a file of its own that the fjord can import without the whole maze.

export const FEATHER_W = 5;
export const FEATHER_H = 9;
const ROWS = ["...kk", "..kkk", "..kkk", ".kkbk", ".kkk.", ".kkk.", "kkk..", "kk...", "k...."];

/** Draws the feather with its top left corner at world (x, y), on whatever the kit is drawing onto. */
export function drawFeather(x: number, y: number, black = "#14131a", sheen = "#4f9bd8", halo?: string) {
  if (halo)
    ROWS.forEach((row, ry) => {
      for (let cx = 0; cx < FEATHER_W; cx++)
        if (row[cx] !== ".") for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) R(x + cx + dx, y + ry + dy, 1, 1, halo);
    });
  ROWS.forEach((row, ry) => {
    for (let cx = 0; cx < FEATHER_W; cx++) {
      const ch = row[cx];
      if (ch !== ".") R(x + cx, y + ry, 1, 1, ch === "b" ? sheen : black);
    }
  });
}
