import { R, mix } from "@larshansen/pixelkit/paint";
import { COIN, ENEMY, FOOD, METAL, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import { KIND, SHOT, type Enemy, type Shot } from "../game/enemies";

// The small things of a level: skilling, the brown cheese, park benches, and the enemies every level
// may meet (the first level's) and the snowball. Enemies are drawn a quarter larger than before order
// 18, from the enemy palette only, and outlined by the page (`render/sprite.ts`). The looks only some
// levels use are in `render/looks.ts`, which comes with them; a level's own are in its file.

const P = PALETTE;

/**
 * What draws the small things and the shared enemies (order 23: frames, `src/alive/`), once `render/feel.ts`'s file
 * is here, which every scene waits for; until then, if it never comes, plain shapes in their place.
 */
export const LOOKS: { enemy?(e: Enemy, t: number): boolean; skilling?(x: number, y: number, t: number, seed: number): void; cheese?(x: number, y: number, t: number): void } = {};

/** A skilling: a 5 px copper coin that turns, with a glint (`alive/things.ts`). */
export function drawSkilling(x: number, y: number, t: number, seed: number) {
  if (LOOKS.skilling) return LOOKS.skilling(x, y, t, seed);
  R(x, y, 5, 5, COIN.face);
}

/** A slice of brown cheese on its rind: a life (`alive/things.ts`). */
export function drawCheese(x: number, y: number, t: number) {
  if (LOOKS.cheese) return LOOKS.cheese(x, y, t);
  R(x, y + 3, 12, 6, FOOD.cheese);
}

/** A park bench: a wooden seat and back on iron legs. Sitting, he is drawn on it; the armrest goes in front. */
export function drawBench(x: number, bottom: number, sitting: boolean) {
  const left = x - 11;
  // The back.
  R(left + 1, bottom - 13, 20, 2, P.wood);
  R(left + 1, bottom - 10, 20, 2, P.wood);
  R(left + 1, bottom - 13, 20, 1, mix(P.wood, WHITE, 0.25));
  // The seat.
  R(left, bottom - 7, 22, 2, P.wood);
  R(left, bottom - 7, 22, 1, mix(P.wood, WHITE, 0.25));
  R(left, bottom - 5, 22, 1, P.woodDark);
  // The iron ends.
  for (const lx of [left + 1, left + 19]) {
    R(lx, bottom - 13, 2, 13, METAL.castIron);
    R(lx - 1, bottom - 1, 4, 1, METAL.castIron);
  }
  if (sitting) R(left + 19, bottom - 9, 2, 3, METAL.castIron);
}

/** An enemy in one of the looks every level may meet (pigeons, gulls, crows, rats: `alive/foes.ts`). The level draws the rest. */
export function drawEnemy(e: Enemy, t: number) {
  // A beaten enemy is squashed and puffs away in `render/feel.ts` (order 19).
  if (!e.alive || LOOKS.enemy?.(e, t)) return;
  R(e.x - e.w / 2, e.y - e.h, e.w, e.h, KIND[e.def.kind].stomp ? ENEMY.poison : ENEMY.plum);
}

/** A snowball in flight (a level's own throwers have their own shots: `render/looks.ts` and the levels). */
export function drawShot(s: Shot) {
  const x = Math.round(s.x - SHOT.w / 2);
  const y = Math.round(s.y - SHOT.h / 2);
  R(x + 1, y, 4, 6, ENEMY.pink);
  R(x, y + 1, 6, 4, ENEMY.pink);
  R(x + 1, y + 1, 2, 1, ENEMY.pale);
}
