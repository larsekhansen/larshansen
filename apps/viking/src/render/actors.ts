import { COIN, INK, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import { R, light } from "@larshansen/pixelkit/paint";
import { SHEEP, type Sheep } from "../game/sheep";
import { LOOKS } from "./pickups";

// The things that move or can be picked up: sheep, the runes on their small floating stones, and the gold bracteates.
// Since order 24 they are drawn as frames in `alive/things.ts` (with `render/feel.ts`'s file, which every scene waits
// for); here only the ticks, and plain shapes in case that file never comes.

const P = PALETTE;

/** A sheep (`alive/things.ts`): walking, grazing, flattened by a landing. */
export function drawSheep(s: Sheep) {
  if (LOOKS.sheep) return LOOKS.sheep(s);
  R(Math.round(s.x - SHEEP.w / 2), s.bottom - SHEEP.h, SHEEP.w, SHEEP.h - 2, P.wool);
}

/**
 * A rune on its small stone, 16 x 16 from (x, y) (`alive/things.ts`). "lit": glowing, and it bobs; "dark": carved, not
 * found yet (the line map); "ghost": taken, a faint outline left behind.
 */
export function drawRune(x: number, y: number, char: string, state: "lit" | "dark" | "ghost", steps: number, seed = 0) {
  if (LOOKS.rune) return LOOKS.rune(x, y, char, state, steps, seed);
  if (state !== "ghost") R(x + 1, y + 1, 14, 14, P.rockDark);
}

/** A bracteate found on an earlier visit: its ring as a pale outline, still, where it hangs (`alive/things.ts`). */
export function drawBracteateOutline(x: number, y: number) {
  LOOKS.bracteateOutline?.(x, y);
}

/** A gold bracteate, 12 x 12, turning slowly, a glint running over it (`alive/things.ts`). */
export function drawBracteate(x: number, y: number, steps: number) {
  if (LOOKS.bracteate) return LOOKS.bracteate(x, y, steps);
  R(x, y, 12, 12, COIN.gold);
}

/**
 * A tick, 7 x 7 from (x, y): a dark disc with a pale check in it, kept light after dark. What he has done
 * says so the same way everywhere (order 18): an earned rune's stone on the line map, a raised flag.
 */
export function drawTick(x: number, y: number) {
  R(x + 1, y, 5, 7, INK);
  R(x, y + 1, 7, 5, INK);
  for (const [dx, dy] of [[1, 3], [2, 4], [3, 3], [4, 2], [5, 1]]) {
    R(x + dx, y + dy, 1, 1, WHITE);
    light(x + dx, y + dy, 1, 1, "window", WHITE);
  }
}
