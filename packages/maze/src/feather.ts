import { FEATHERS } from "@larshansen/pixelkit/feather";
import { paint } from "@larshansen/pixelkit/frames";

// The raven's feather over the last finish: the viking game's own drawing (`@larshansen/pixelkit/feather`, order 36), so the
// prize in the mound is the feather that falls onto him in the fjord. 5 x 9 art pixels; gold after all seven levels.

export const FEATHER_W = 5;
export const FEATHER_H = 9;

/** Draws the feather with its top left corner at world (x, y), on whatever the kit is drawing onto: the gold one, or black. */
export function drawFeather(x: number, y: number, gold = false) {
  paint(gold ? FEATHERS.gold : FEATHERS.black, x, y, 1, FEATHER_W);
}
