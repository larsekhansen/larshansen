import { frame, lit, shade } from "./frames";
import { FEATHER, PALETTE } from "./palette";

// The raven's feather, the maze's prize, as the viking game draws it (order 24): 5 x 9, its vane black with a blue sheen lit
// along its leading edge, a pale quill; gold after all seven of the maze's levels. In the kit since order 36, so the mound
// (over its last finish) and the fjord (falling onto him) draw the same feather.
const ROWS = ["...Bq", "..kbB", "..kbk", ".kkbk", ".kbk.", ".kbk.", "kbk..", "kq...", "q...."];
const INK = { k: FEATHER.vane, b: shade(FEATHER.sheen, 0.45), B: FEATHER.sheen, q: lit(FEATHER.vane, 0.55) };
const GOLD_INK = { k: PALETTE.featherGold, b: PALETTE.featherGoldDark, B: PALETTE.featherGoldSheen, q: PALETTE.featherGoldDark };
export const FEATHERS = { black: frame("feather", INK, [ROWS]), gold: frame("feather, gold", GOLD_INK, [ROWS]) };
