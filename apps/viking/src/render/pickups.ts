import { R } from "@larshansen/pixelkit/paint";
import { COIN, ENEMY, FOOD, PALETTE } from "@larshansen/pixelkit/palette";
import type { Flag } from "@larshansen/pixelkit/checkpoint";
import { KIND, SHOT, type Enemy, type Shot } from "../game/enemies";
import type { Sheep } from "../game/sheep";

// The small things of a level: skilling, the brown cheese, park benches, and the enemies every level
// may meet (the first level's) and the snowball. Enemies are drawn a quarter larger than before order
// 18, from the enemy palette only, and outlined by the page (`render/sprite.ts`). The looks only some
// levels use are in `render/looks.ts`, which comes with them; a level's own are in its file.

const P = PALETTE;

/**
 * What draws the small things and the shared enemies (order 23: frames, `src/alive/`), once `render/feel.ts`'s file
 * is here, which every scene waits for; until then, if it never comes, plain shapes in their place.
 */
export const LOOKS: {
  enemy?(e: Enemy, t: number): boolean;
  skilling?(x: number, y: number, t: number, seed: number): void;
  cheese?(x: number, y: number, t: number): void;
  bench?(x: number, bottom: number, sitting: boolean): void;
  bracteate?(x: number, y: number, steps: number): void;
  bracteateOutline?(x: number, y: number): void;
  rune?(x: number, y: number, char: string, state: "lit" | "dark" | "ghost", steps: number, seed?: number): void;
  sheep?(s: Sheep): void;
  flag?(f: Flag, raisedAt: number | null, steps: number, level: string): void;
  pole?(x: number, top: number, h: number): void;
  feather?(x: number, y: number, gold: boolean): void;
} = {};

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

/** A park bench: planks on iron ends (`alive/things.ts`). Sitting, he is drawn on it. */
export function drawBench(x: number, bottom: number, sitting: boolean) {
  if (LOOKS.bench) return LOOKS.bench(x, bottom, sitting);
  R(x - 11, bottom - 7, 22, 7, P.wood);
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
