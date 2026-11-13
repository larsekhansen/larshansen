import { R } from "@larshansen/pixelkit/paint";
import { PALETTE } from "@larshansen/pixelkit/palette";

// The raven's feather: 5 x 9 art pixels, black with one blue sheen pixel. It is the reward of the
// mound and is drawn both there (floating over the last finish) and in the fjord (falling onto him),
// so it lives in a file of its own that the fjord can import without the whole maze. After all
// seven levels it turns gold: the same feather, gold with a darker spine and a pale sheen.

export const FEATHER_W = 5;
export const FEATHER_H = 9;
const ROWS = ["...kk", "..kkk", "..kkk", ".kkbk", ".kkk.", ".kkk.", "kkk..", "kk...", "k...."];
/** The spine: the pixels a gold feather draws darker, so it still reads as a feather and not a gold blob. */
const SPINE = new Set(["0,8", "1,7", "1,6", "2,5", "2,4", "3,3", "3,2", "4,1"]);

/**
 * Draws the feather with its top left corner at world (x, y), on whatever the kit is drawing onto.
 * `gold` draws the gold one; its colours then replace `black` and `sheen`.
 */
export function drawFeather(x: number, y: number, black = "#14131a", sheen = "#4f9bd8", halo?: string, gold = false) {
  if (halo)
    ROWS.forEach((row, ry) => {
      for (let cx = 0; cx < FEATHER_W; cx++)
        if (row[cx] !== ".") for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) R(x + cx + dx, y + ry + dy, 1, 1, halo);
    });
  ROWS.forEach((row, ry) => {
    for (let cx = 0; cx < FEATHER_W; cx++) {
      const ch = row[cx];
      if (ch === ".") continue;
      const color = gold ? (ch === "b" ? PALETTE.featherGoldSheen : SPINE.has(`${cx},${ry}`) ? PALETTE.featherGoldDark : PALETTE.featherGold) : ch === "b" ? sheen : black;
      R(x + cx, y + ry, 1, 1, color);
    }
  });
}
