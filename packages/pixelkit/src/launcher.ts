import { PLAYER } from "./config";
import { launch, type Body } from "./physics";

// Things that throw him: a cannon (up and sideways, far past a run) and a drum (straight up, like
// the sheep). Stepping into one throws him with its velocity; after a sideways throw he keeps his
// speed until he lands and the keys only lean on it (see `launch`). The jump and run constants stay
// as they are. How a cannon and a drum look is `launcherart.ts`, apart, so a page that steps them need not carry
// their drawing (order 42: the viking page's first script steps them; the levels that have them draw them).

/** A launcher: the box he steps into, the velocity it gives him, and where he leaves it from. */
export interface Launcher {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  /** Where he is thrown from: his centre x and his feet. A drum throws him from where he stands. */
  from?: { x: number; bottom: number };
}

/** Steps a cannon holds him in the barrel before it fires: a third of a second. */
export const LOAD_STEPS = 20;

/** The size of a cannon: its carriage and barrel, 24 x 16. */
export const CANNON = { w: 24, h: 16 };

/** A cannon on the ground at x (its left edge), its mouth facing `dir`. */
export function cannon(x: number, bottom: number, dir: 1 | -1, vx = 4, vy = 6): Launcher {
  const mouth = dir > 0 ? x + CANNON.w - 1 : x;
  return { x, y: bottom - CANNON.h, w: CANNON.w, h: CANNON.h, vx: dir * vx, vy: -vy, from: { x: mouth, bottom: bottom - 12 } };
}

/** A drum on the ground at x: lands him back up, higher than a jump, as a sheep does. */
export function drum(x: number, bottom: number, vy = 7): Launcher {
  return { x, y: bottom - 12, w: 16, h: 12, vx: 0, vy: -vy };
}

/** True when the body is in the launcher's box and not already on its way up. */
export function launcherHit(l: Launcher, b: Body): boolean {
  return b.vy >= 0 && b.x < l.x + l.w && b.x + PLAYER.w > l.x && b.y < l.y + l.h && b.y + PLAYER.h > l.y;
}

/** Throws the body from the launcher's mouth (or where it stands) with the launcher's velocity. */
export function fire(l: Launcher, b: Body) {
  if (l.from) {
    b.x = l.from.x - PLAYER.w / 2;
    b.y = l.from.bottom - PLAYER.h;
  }
  launch(b, l.vx, l.vy);
}

/** Throws the body if it stepped into the launcher this step. Returns whether it did. */
export function tryLaunch(l: Launcher, b: Body): boolean {
  if (!launcherHit(l, b)) return false;
  fire(l, b);
  return true;
}
