import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { COIN, CREATURE, ENEMY, FOOD, METAL, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import { KIND, SHOT, sizeOf, type Enemy, type Shot } from "../game/enemies";

// The small things of a level: skilling, the brown cheese, park benches, and the enemies every level
// may meet (the first level's) and the snowball. Enemies are drawn a quarter larger than before order
// 18, from the enemy palette only, and outlined by the page (`render/sprite.ts`). The looks only some
// levels use are in `render/looks.ts`, which comes with them; a level's own are in its file.

const P = PALETTE;

/** A skilling: a 5 px copper coin that turns (three frames), with a glint. */
export function drawSkilling(x: number, y: number, t: number, seed: number) {
  const frame = view.reduced ? 0 : Math.floor((t + seed * 7) / 10) % 4;
  const w = [5, 3, 1, 3][frame];
  const left = x + Math.floor((5 - w) / 2);
  R(left, y, w, 5, COIN.face);
  if (w > 1) {
    R(left, y, w, 1, COIN.shine);
    R(left, y + 4, w, 1, COIN.rim);
    R(left, y + 1, 1, 3, COIN.shine);
    R(left + w - 1, y + 1, 1, 3, COIN.rim);
  } else R(left, y, 1, 5, COIN.rim);
  if (w === 5) R(left + 2, y + 2, 1, 1, COIN.rim);
}

/** A slice of brown cheese on its rind: a life. */
export function drawCheese(x: number, y: number, t: number) {
  const bob = view.reduced ? 0 : Math.round(Math.sin(t * 0.07));
  const top = y + bob;
  R(x, top + 3, 12, 6, FOOD.cheese);
  R(x + 1, top + 2, 10, 1, FOOD.cheese);
  R(x, top + 3, 12, 1, FOOD.cheeseLight);
  R(x, top + 8, 12, 1, FOOD.cheeseDark);
  R(x + 3, top + 5, 2, 1, FOOD.cheeseLight);
  R(x + 7, top + 6, 2, 1, FOOD.cheeseLight);
  light(x, top + 2, 12, 7, "soft");
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

/** The squares a beaten enemy turns into, flying out for half a second. */
function puff(e: Enemy, t: number) {
  const age = t - (e.beatenAt ?? t);
  if (age < 0 || age > 30) return;
  // The squash: one frame flat before it goes.
  if (age < 3) {
    R(e.x - e.w / 2 - 1, e.y - 3, e.w + 2, 3, CREATURE.puff);
    return;
  }
  const k = age / 30;
  const s = Math.max(1, Math.round(3 * (1 - k)));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    R(e.x + Math.cos(a) * age * 0.5 - s / 2, e.y - e.h / 2 + Math.sin(a) * age * 0.4 - s / 2 - age * 0.1, s, s, CREATURE.puff);
  }
  // The skilling it drops goes up and is gone.
  if (age < 24) drawSkilling(Math.round(e.x - 2), Math.round(e.y - e.h - 4 - age * 0.8), t, 0);
}

/** Two frames of walking, by its place: legs together and apart. */
export const stride = (e: Enemy) => (view.reduced ? 0 : Math.floor(e.x / 3) % 2);

/**
 * A look's own rectangles, `W` pixels wide: `dx` from its back (its left while it faces right), mirrored
 * when it faces left; `dy` from its feet (up is negative). Every look is drawn this way (order 18).
 */
export function parts(e: Enemy, W: number) {
  const x = Math.round(e.x - W / 2);
  const y = Math.round(e.y);
  const right = e.dir > 0;
  // One that keeps its old box (`small`) is drawn as wide, but to the box's height: each row moved down
  // in proportion, none lost, so its head is where he lands on it.
  const k = e.def.small ? e.h / sizeOf({ ...e.def, small: false }).h : 1;
  return (dx: number, dy: number, w: number, h: number, c: string) => {
    const top = Math.round(dy * k);
    R(right ? x + dx : x + W - dx - w, y + top, w, Math.max(1, Math.round((dy + h) * k) - top), c);
  };
}

const E = ENEMY;

/** A pigeon: plum, an orange breast, a poison-green sheen on its neck, its head bobbing with the step. 13 x 11. */
function pigeon(e: Enemy) {
  const r = parts(e, 13);
  const s = stride(e);
  r(1, -8, 9, 5, E.plum);
  r(6, -8, 4, 4, E.orange);
  r(3, -7, 4, 2, E.plumLight);
  r(0, -7, 2, 2, E.plum);
  r(9, -10 + s, 2, 3, E.poison);
  r(9, -11 + s, 3, 2, E.plum);
  r(10, -11 + s, 1, 1, E.eye);
  r(12, -10 + s, 1, 1, E.orange);
  r(4 + s, -3, 1, 3, E.red);
  r(7 - s, -3, 1, 3, E.red);
}

/** A gull (or a crow) on the wing: a body, wings up or down, its head the way it flies. 17 x 9. */
function gull(e: Enemy, t: number, body: string, wing: string) {
  const r = parts(e, 17);
  const up = view.reduced ? 0 : Math.floor(t / 7) % 2;
  r(4, -6, 9, 4, body);
  r(12, -7, 3, 3, body);
  r(13, -6, 1, 1, E.eye);
  r(15, -6, 2, 1, E.red);
  r(1, -5, 3, 2, body);
  if (up) {
    r(1, -9, 6, 3, wing);
    r(9, -9, 5, 3, wing);
  } else {
    r(2, -3, 6, 3, wing);
    r(9, -3, 5, 3, wing);
  }
}

/** A rat: a plum hump, a pointed snout, a red tail behind. 13 x 10. */
function rat(e: Enemy) {
  const r = parts(e, 13);
  const s = stride(e);
  r(2, -8, 8, 6, E.plum);
  r(3, -9, 6, 1, E.plum);
  r(4, -8, 4, 1, E.plumLight);
  r(10, -6, 2, 4, E.plum);
  r(12, -4, 1, 1, E.red);
  r(10, -6, 1, 1, E.eye);
  r(9, -10, 2, 1, E.redLight);
  r(0, -3, 3, 1, E.red);
  r(-2, -4, 2, 1, E.red);
  r(3 + s, -2, 2, 2, E.red);
  r(8 - s, -2, 2, 2, E.red);
}

/** An enemy in one of the looks every level may use (the first level's: pigeons, gulls, rats; and crows). The level draws the rest. */
export function drawEnemy(e: Enemy, t: number) {
  if (!e.alive) return puff(e, t);
  switch (e.def.look) {
    case "pigeon":
      return pigeon(e);
    case "gull":
      return gull(e, t, E.orangeLight, E.orange);
    case "crow":
      return gull(e, t, E.plum, E.plumLight);
    case "rat":
      return rat(e);
    default:
      R(e.x - e.w / 2, e.y - e.h, e.w, e.h, KIND[e.def.kind].stomp ? E.poison : E.red);
  }
}

/** A snowball in flight (a level's own throwers have their own shots: `render/looks.ts` and the levels). */
export function drawShot(s: Shot) {
  const x = Math.round(s.x - SHOT.w / 2);
  const y = Math.round(s.y - SHOT.h / 2);
  R(x + 1, y, 4, 6, ENEMY.redLight);
  R(x, y + 1, 6, 4, ENEMY.redLight);
  R(x + 1, y + 1, 2, 1, ENEMY.pale);
}
