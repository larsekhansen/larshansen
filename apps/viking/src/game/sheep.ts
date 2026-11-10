import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { seeded } from "@larshansen/pixelkit/paint";
import type { Body } from "@larshansen/pixelkit/physics";
import type { SheepSpot } from "./level";

// Sheep walk back and forth four tiles either side of where they were placed, stop to graze, and
// turn. Landing on one from above is a trampoline. Touching one from the side does nothing.

export const SHEEP = { w: 12, h: 7, range: 4 * TILE, speed: 0.3, squashSteps: 6 };

export interface Sheep {
  home: number;
  x: number; // centre
  bottom: number;
  dir: 1 | -1;
  grazing: number; // steps left of grazing, 0 while walking
  squash: number; // steps left of being squashed
  rnd: () => number;
}

export function createSheep(spots: SheepSpot[]): Sheep[] {
  return spots.map((s, i) => ({ home: s.x, x: s.x, bottom: s.bottom, dir: i % 2 ? -1 : 1, grazing: 0, squash: 0, rnd: seeded(101 + i * 37) }));
}

/** One physics step. Deterministic, so the same flock walks the same way on every visit. */
export function stepSheep(s: Sheep) {
  if (s.squash > 0) s.squash--;
  if (s.grazing > 0) {
    if (--s.grazing === 0 && s.rnd() < 0.5) s.dir = (s.dir * -1) as 1 | -1;
    return;
  }
  s.x += s.dir * SHEEP.speed;
  if (Math.abs(s.x - s.home) >= SHEEP.range) {
    s.x = s.home + s.dir * SHEEP.range;
    s.dir = (s.dir * -1) as 1 | -1;
    s.grazing = 60;
  } else if (s.rnd() < 0.006) s.grazing = 50 + Math.floor(s.rnd() * 80);
}

/** The y of the top of the sheep's back. */
export const backOf = (s: Sheep) => s.bottom - SHEEP.h + (s.squash > 0 ? 1 : 0);

/**
 * Did the body come down on this sheep during the last step? Its feet were above the sheep's back
 * before, and are at or below it now, falling, with the body over the sheep.
 */
export function stomped(b: Body, prevBottom: number, s: Sheep): boolean {
  const feet = b.y + PLAYER.h;
  const top = backOf(s);
  const over = b.x + PLAYER.w > s.x - SHEEP.w / 2 && b.x < s.x + SHEEP.w / 2;
  return over && prevBottom <= top + 0.5 && feet >= top && b.vy >= 0;
}
