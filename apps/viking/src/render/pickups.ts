import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { COIN, CREATURE, FIRE, FOOD, INK, METAL, PALETTE, PLANTS, SKIN, WHITE } from "@larshansen/pixelkit/palette";
import { KIND, SHOT, leap, windingUp, type Enemy, type Shot } from "../game/enemies";

// The small things of a level from Slottet on: skilling, the brown cheese, park benches, and the
// enemies and what they throw. At the person's scale, two or three colours each, a two-frame walk.

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
const stride = (e: Enemy) => (view.reduced ? 0 : Math.floor(e.x / 3) % 2);

function pigeon(e: Enemy) {
  const f = e.dir;
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  const at = (dx: number) => (f > 0 ? x + dx : x + 9 - dx);
  // Body, wing, the green neck, the head bobbing with the step, a pink beak and feet.
  R(x + 1, y - 6, 8, 4, CREATURE.pigeon);
  R(x + 2, y - 5, 5, 2, CREATURE.pigeonDark);
  R(at(0), y - 5, 2, 2, CREATURE.pigeonDark);
  const bob = stride(e);
  R(at(7), y - 8 + bob, 2, 3, CREATURE.pigeonNeck);
  R(at(8), y - 9 + bob, 2, 2, CREATURE.pigeon);
  R(at(9), y - 8 + bob, 1, 1, CREATURE.beak);
  R(at(4) + (stride(e) ? 1 : 0), y - 2, 1, 2, CREATURE.beak);
  R(at(6) - (stride(e) ? 1 : 0), y - 2, 1, 2, CREATURE.beak);
}

function gull(e: Enemy, t: number, color: string, dark: string) {
  const x = Math.round(e.x);
  const y = Math.round(e.y) - 4;
  const wing = view.reduced ? 0 : Math.floor(t / 7) % 2;
  // A white (or black) body, wings up or down, a head the way it flies.
  R(x - 3, y - 1, 7, 3, color);
  R(x + e.dir * 4 - (e.dir < 0 ? 1 : 0), y - 2, 2, 2, color);
  R(x + e.dir * 6 - (e.dir < 0 ? 0 : 1), y - 1, 1, 1, dark === INK ? METAL.gold : dark);
  if (wing) {
    R(x - 6, y - 4, 5, 2, dark);
    R(x + 1, y - 4, 5, 2, dark);
  } else {
    R(x - 6, y + 1, 5, 2, dark);
    R(x + 1, y + 1, 5, 2, dark);
  }
  R(x - e.dir * 4 - 1, y, 2, 1, dark);
}

function scooter(e: Enemy) {
  const x = Math.round(e.x - 7);
  const y = Math.round(e.y);
  const f = e.dir;
  const at = (dx: number) => (f > 0 ? x + dx : x + 13 - dx);
  // A rented e-scooter riding itself: deck, stem, bars, two small wheels.
  R(x + 2, y - 4, 10, 2, CREATURE.scooter);
  R(x + 2, y - 3, 10, 1, CREATURE.scooterDark);
  R(at(11), y - 12, 1, 8, CREATURE.scooterDark);
  R(at(9), y - 12, 4, 1, INK);
  for (const wx of [at(1), at(11)]) {
    R(wx, y - 2, 3, 2, INK);
    R(wx + 1, y - 2, 1, 1, P.iron);
  }
  R(at(10), y - 10, 1, 1, FIRE.glow);
}

function hedgehog(e: Enemy) {
  const x = Math.round(e.x - 6);
  const y = Math.round(e.y);
  const at = (dx: number) => (e.dir > 0 ? x + dx : x + 11 - dx);
  // A brown body under a back of spines, a pointed dark nose.
  R(x + 1, y - 5, 9, 4, CREATURE.hedgehog);
  for (let i = 0; i < 10; i += 2) R(at(i), y - 8 + (i % 4 ? 1 : 0), 2, 3, CREATURE.spines);
  R(at(9), y - 4, 2, 2, CREATURE.hedgehog);
  R(at(11), y - 3, 1, 1, CREATURE.snout);
  R(at(3) + stride(e), y - 1, 1, 1, CREATURE.snout);
  R(at(7) - stride(e), y - 1, 1, 1, CREATURE.snout);
}

function grill(e: Enemy, t: number) {
  const x = Math.round(e.x - 6);
  const y = Math.round(e.y);
  // A fire basket on three legs, coals glowing, flames licking over the rim.
  R(x + 1, y - 7, 10, 4, METAL.lampPost);
  R(x, y - 8, 12, 1, METAL.pipeShine);
  R(x + 2, y - 3, 1, 3, METAL.lampPost);
  R(x + 9, y - 3, 1, 3, METAL.lampPost);
  R(x + 5, y - 3, 2, 3, METAL.lampPost);
  const flick = view.reduced ? 0 : Math.floor(t / 5) % 3;
  R(x + 2, y - 9, 8, 1, FIRE.glow);
  R(x + 3 + flick, y - 11, 2, 2, FIRE.flame);
  R(x + 7 - flick, y - 12, 2, 3, FIRE.flame);
  R(x + 5, y - 10, 1, 1, FIRE.core);
  light(x + 2, y - 12, 8, 4, "soft");
}

function kid(e: Enemy, t: number) {
  const x = Math.round(e.x - 4);
  const y = Math.round(e.y);
  const up = windingUp(e, t);
  const thrown = t - e.thrownAt < 10;
  const jacket = e.def.c % 2 ? CREATURE.kidJacket : CREATURE.kidJacketAlt;
  const at = (dx: number) => (e.dir > 0 ? x + dx : x + 8 - dx);
  // A knitted hat with a bobble, a face, a puffy jacket, boots.
  R(x + 2, y - 13, 5, 2, CREATURE.kidHat);
  R(x + 4, y - 14, 1, 1, CREATURE.kidHat);
  R(x + 2, y - 11, 5, 3, SKIN);
  R(at(5), y - 10, 1, 1, INK);
  R(x + 1, y - 8, 7, 6, jacket);
  R(x + 1, y - 2, 3, 2, INK);
  R(x + 5, y - 2, 3, 2, INK);
  // The arm: down, raised behind with a snowball while it winds up, forward as it throws.
  if (up) {
    R(at(-1), y - 13, 2, 5, jacket);
    R(at(-2), y - 15, 3, 3, CREATURE.snowball);
  } else if (thrown) R(at(8), y - 9, 3, 2, jacket);
  else R(at(7), y - 7, 2, 4, jacket);
}

function salmon(e: Enemy) {
  const x = Math.round(e.x - 5);
  const y = Math.round(e.y);
  R(x + 1, y - 10, 8, 6, CREATURE.salmon);
  R(x + 2, y - 11, 6, 1, CREATURE.salmon);
  R(x + 1, y - 6, 8, 2, mix(CREATURE.salmon, WHITE, 0.4));
  R(x + 3, y - 4, 4, 3, CREATURE.salmon);
  R(x + 2, y - 1, 6, 1, CREATURE.salmon);
  R(x + 6, y - 9, 1, 1, INK);
}

/** An enemy in its own look; the level may draw its own looks instead. */
export function drawEnemy(e: Enemy, t: number) {
  if (!e.alive) return puff(e, t);
  switch (e.def.look) {
    case "pigeon":
      return pigeon(e);
    case "gull":
      return gull(e, t, P.wool, CREATURE.gullGrey);
    case "crow":
      return gull(e, t, CREATURE.crow, CREATURE.crowGrey);
    case "scooter":
      return scooter(e);
    case "hedgehog":
      return hedgehog(e);
    case "grill":
      return grill(e, t);
    case "kid":
      return kid(e, t);
    case "salmon": {
      const l = leap(e, t);
      if (l.ripple && !view.reduced && Math.floor(t / 6) % 2) R(Math.round(e.x - 5), Math.round(e.y) - 1, 10, 1, P.foam);
      if (l.up > 0) salmon(e);
      return;
    }
    default:
      R(e.x - e.w / 2, e.y - e.h, e.w, e.h, KIND[e.def.kind].stomp ? PLANTS.hedge : FIRE.flame);
  }
}

/** A snowball (or whatever is thrown) in flight. */
export function drawShot(s: Shot) {
  const x = Math.round(s.x - SHOT.w / 2);
  const y = Math.round(s.y - SHOT.h / 2);
  R(x + 1, y, 3, 5, CREATURE.snowball);
  R(x, y + 1, 5, 3, CREATURE.snowball);
  R(x + 3, y + 3, 1, 1, PALETTE.iron);
}
