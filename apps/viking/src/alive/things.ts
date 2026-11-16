import { COIN, FOOD } from "@larshansen/pixelkit/palette";
import { R, light, view } from "@larshansen/pixelkit/paint";
import { frame, lit, shade, stamp, type Frame } from "./frames";

// The small things he takes, drawn as frames (order 23, section 1; way 3 of `docs/games/GRAIN.md`): a skilling that
// turns in four frames and glints now and then, a slice of brown cheese with its cut face lit and the slicer's grain.
// Their boxes and where they stand are as before.

const COPPER: Record<string, string> = { G: COIN.shine, c: COIN.face, d: COIN.rim };
/** The skilling's turn: its face (lit at the top left, the stamp in the middle), turning, on its edge, its back. */
export const SKILLING: Frame[] = [
  frame("skilling, face", COPPER, [[".ccd.", "cGccd", "cGdcd", "cccdd", ".ddd."]]),
  frame("skilling, turning", COPPER, [[".cd..", ".Gcd.", ".ccd.", ".ccd.", "..d.."], 0]),
  frame("skilling, on its edge", COPPER, [["..G..", "..c..", "..c..", "..d..", "..d.."]]),
  frame("skilling, its back", COPPER, [["..dc.", ".dcG.", ".dcc.", ".dcc.", "..d.."]])
];

/** A skilling at (x, y), turning on the clock (each its own, by `seed`); now and then a glint crosses it. */
export function skilling(x: number, y: number, t: number, seed: number) {
  const k = t + seed * 7;
  stamp(SKILLING[Math.floor(k / 10) % 4], x, y);
  // The glint: a four-pointed star at its top left, for six steps in every hundred and fifty, its own moment each.
  const g = (k * 3 + seed * 41) % 150;
  if (g < 6 && !view.reduced) {
    R(x, y + 1, 3, 1, COIN.shine);
    R(x + 1, y, 1, 3, COIN.shine);
  }
}

const CHEESE_INK: Record<string, string> = { H: lit(FOOD.cheeseLight, 0.35), h: FOOD.cheeseLight, c: FOOD.cheese, g: lit(FOOD.cheese, 0.12), d: FOOD.cheeseDark, D: shade(FOOD.cheeseDark, 0.3) };
/** A slice of brown cheese, 12 x 7: the cut face lit at its top, the slicer's grain across it, the rind darker. */
export const CHEESE = frame("cheese", CHEESE_INK, [[".HHhhhhhhhh.", "Hhhhhhhhhhhh", "hccgccccgccc", "ccccccgccccd", "cgccccccccdd", "ccccgccccddd", "dDDDDDDDDDDD"]]);

/** The brown cheese at (x, y), bobbing a pixel: a life. */
export function cheese(x: number, y: number, t: number) {
  const top = y + 2 + (view.reduced ? 0 : Math.round(Math.sin(t * 0.07)));
  stamp(CHEESE, x, top);
  light(x, top, 12, 7, "soft");
}
