import { PLAYER } from "./config";
import { R, view } from "./paint";
import { INK, METAL, PALETTE } from "./palette";
import { launch, type Body } from "./physics";

// Things that throw him: a cannon (up and sideways, far past a run) and a drum (straight up, like
// the sheep). Stepping into one throws him with its velocity; after a sideways throw he keeps his
// speed until he lands and the keys only lean on it (see `launch`). The jump and run constants stay
// as they are.

/** A launcher: the box he steps into, and the velocity it gives him. */
export interface Launcher {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
}

/** A cannon on the ground at x, its mouth facing `dir`. The default throw clears about eight tiles. */
export function cannon(x: number, bottom: number, dir: 1 | -1, vx = 4, vy = 6): Launcher {
  return { x, y: bottom - 12, w: 16, h: 12, vx: dir * vx, vy: -vy };
}

/** A drum on the ground at x: lands him back up, higher than a jump, as a sheep does. */
export function drum(x: number, bottom: number, vy = 7): Launcher {
  return { x, y: bottom - 10, w: 16, h: 10, vx: 0, vy: -vy };
}

/** True when the body is in the launcher's box and not already on its way up. */
export function launcherHit(l: Launcher, b: Body): boolean {
  return b.vy >= 0 && b.x < l.x + l.w && b.x + PLAYER.w > l.x && b.y < l.y + l.h && b.y + PLAYER.h > l.y;
}

/** Throws the body if it stepped into the launcher this step. Returns whether it did. */
export function tryLaunch(l: Launcher, b: Body): boolean {
  if (!launcherHit(l, b)) return false;
  launch(b, l.vx, l.vy);
  return true;
}

/** An iron cannon on a wooden carriage, the mouth at the launcher's side it throws towards. */
export function drawCannon(l: Launcher, steps: number, fired = -999) {
  const dir = l.vx < 0 ? -1 : 1;
  const bottom = l.y + l.h;
  const x0 = l.x;
  // The carriage and its wheel.
  R(x0 + 2, bottom - 5, 12, 3, PALETTE.wood);
  R(x0 + 2, bottom - 2, 12, 1, PALETTE.woodDark);
  R(x0 + (dir > 0 ? 3 : 9), bottom - 4, 4, 4, PALETTE.woodDark);
  R(x0 + (dir > 0 ? 4 : 10), bottom - 3, 2, 2, PALETTE.wood);
  // The barrel, stepped up towards the mouth: no rotation, whole pixels.
  for (let i = 0; i < 12; i++) {
    const cx = dir > 0 ? x0 + 2 + i : x0 + 13 - i;
    const lift = Math.floor(i / 3);
    R(cx, bottom - 9 - lift, 1, 4, PALETTE.ironDark);
    R(cx, bottom - 9 - lift, 1, 1, PALETTE.iron);
  }
  R(dir > 0 ? x0 + 13 : x0 + 1, bottom - 13, 2, 5, INK);
  // A puff at the mouth for a moment after it fires.
  const age = steps - fired;
  if (age >= 0 && age < 12 && !view.reduced) R(dir > 0 ? x0 + 15 + Math.floor(age / 3) : x0 - 3 - Math.floor(age / 3), bottom - 15 - Math.floor(age / 2), 3, 3, METAL.lampGlass);
}

/** A big drum, its skin pressed down for a moment after it throws. */
export function drawDrum(l: Launcher, steps: number, fired = -999) {
  const bottom = l.y + l.h;
  const press = steps - fired >= 0 && steps - fired < 6 ? 1 : 0;
  R(l.x + 1, l.y + press, l.w - 2, l.h - press, PALETTE.sailStripe);
  for (let i = 2; i < l.w - 2; i += 3) R(l.x + i, l.y + 2 + press, 1, l.h - 4 - press, PALETTE.wood);
  R(l.x, l.y + press, l.w, 1, PALETTE.sail);
  R(l.x, l.y + 1 + press, l.w, 1, PALETTE.iron);
  R(l.x, bottom - 2, l.w, 1, PALETTE.iron);
}
