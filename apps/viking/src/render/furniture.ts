import type { Door } from "@larshansen/pixelkit/doors";
import { R, mix, wdisc } from "@larshansen/pixelkit/paint";
import { DOORWAY, FACADE, INK, PAINT, WHITE } from "@larshansen/pixelkit/palette";

// Pieces more than one level draws: painted plank walls, and the T-bane entrance at each level's start.

/** Painted plank walls from `top` down to the ground, white trim at the corners, as on the front page. */
export function walls(x: number, top: number, w: number, color: string, line: string, ground: number) {
  R(x, top, w, ground - top, color);
  for (let i = 3; i < w - 2; i += 4) R(x + i, top, 1, ground - top, line);
  R(x, top, 2, ground - top, PAINT.trim);
  R(x + w - 2, top, 2, ground - top, PAINT.trim);
}

/**
 * The T-bane entrance: steps going down into the dark between two concrete cheeks, and the round
 * blue sign with its white T on a post beside it. The door back to the line map.
 */
export function tbaneDoor(d: Door | undefined) {
  if (!d) return;
  const top = d.bottom - d.h;
  R(d.x - 3, top + 8, d.w + 6, d.h - 8, FACADE.libraryFrame);
  R(d.x - 3, top + 8, d.w + 6, 1, mix(FACADE.libraryFrame, WHITE, 0.4));
  R(d.x, top + 10, d.w, d.h - 10, d.open ? DOORWAY.stage : mix(DOORWAY.stage, PAINT.tbane, 0.25));
  for (let i = 0; i < 4; i++) R(d.x + 1, d.bottom - 3 - i * 4, d.w - 2, 1, mix(FACADE.libraryFrame, INK, 0.3));
  // The round blue sign with its white T, on the entrance's left cheek.
  const px = d.x - 8;
  const py = top + 16;
  wdisc(px, py, 5, PAINT.tbane);
  R(px - 3, py - 3, 7, 2, WHITE);
  R(px, py - 1, 1, 5, WHITE);
}
