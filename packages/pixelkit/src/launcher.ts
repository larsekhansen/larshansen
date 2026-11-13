import { PLAYER } from "./config";
import { R, mix, view } from "./paint";
import { FIRE, INK, METAL, PALETTE, WHITE } from "./palette";
import { launch, type Body } from "./physics";

// Things that throw him: a cannon (up and sideways, far past a run) and a drum (straight up, like
// the sheep). Stepping into one throws him with its velocity; after a sideways throw he keeps his
// speed until he lands and the keys only lean on it (see `launch`). The jump and run constants stay
// as they are.

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

/**
 * An iron cannon on a wooden carriage with two wheels, the barrel cocked up towards its mouth.
 * `loadedAt`: the step he went in (the cannon trembles and its fuse glows); `firedAt`: the step it
 * fired (square smoke rolls out of the mouth). Both whole pixels, no rotation.
 */
export function drawCannon(l: Launcher, steps: number, loadedAt = -999, firedAt = -999) {
  const dir = l.vx < 0 ? -1 : 1;
  const bottom = l.y + l.h;
  const loaded = steps - loadedAt >= 0 && steps - loadedAt < LOAD_STEPS;
  const shake = loaded && !view.reduced ? (Math.floor(steps / 2) % 2 ? 1 : 0) : 0;
  const x0 = l.x;
  /** x of column i counted from the breech end, mirrored for a cannon facing left. */
  const at = (i: number) => (dir > 0 ? x0 + i : x0 + l.w - 1 - i);
  const col = (i: number, y: number, h: number, c: string) => R(at(i), y, 1, h, c);
  // The carriage: a wooden block, darker underneath, with a step up towards the mouth.
  const wood = PALETTE.wood;
  const woodDark = PALETTE.woodDark;
  for (let i = 1; i < 17; i++) {
    const top = bottom - 7 - (i > 10 ? 1 : 0);
    col(i, top, bottom - 3 - top, i === 1 || i === 16 ? woodDark : wood);
    col(i, top, 1, i === 1 ? woodDark : mix(wood, WHITE, 0.2));
    col(i, bottom - 4, 1, woodDark);
  }
  // Two wheels: an iron rim round dark wood, and a brass hub.
  for (const [ci, r] of [
    [4, 4],
    [13, 3]
  ] as const) {
    const cx = at(ci);
    const cy = bottom - 1 - r;
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.floor(Math.sqrt(r * r - dy * dy));
      R(cx - w, cy + dy, w * 2 + 1, 1, PALETTE.ironDark);
      const wi = Math.abs(dy) < r ? Math.floor(Math.sqrt((r - 1) * (r - 1) - Math.min(dy * dy, (r - 1) * (r - 1)))) : -1;
      if (wi >= 0) R(cx - wi, cy + dy, wi * 2 + 1, 1, woodDark);
    }
    R(cx, cy, 1, 1, METAL.brass);
  }
  // The barrel: iron, five pixels thick, rising one pixel every five, a band near each end.
  for (let i = 2; i < 24; i++) {
    const top = bottom - 13 - Math.floor(i / 5) + shake;
    const band = i === 6 || i === 17 || i === 21;
    col(i, top, 5, band ? PALETTE.iron : PALETTE.ironDark);
    col(i, top, 1, mix(PALETTE.iron, WHITE, band ? 0.45 : 0.25));
    col(i, top + 4, 1, mix(PALETTE.ironDark, INK, 0.4));
  }
  // The breech knob, and the dark mouth.
  col(0, bottom - 12 + shake, 3, PALETTE.ironDark);
  col(1, bottom - 13 + shake, 5, PALETTE.ironDark);
  col(23, bottom - 17 + shake, 5, INK);
  col(22, bottom - 17 + shake, 1, mix(PALETTE.iron, WHITE, 0.25));
  // The fuse glows while he is inside.
  if (loaded) R(at(3), bottom - 15, 1, 1, steps % 6 < 3 ? FIRE.glow : FIRE.flame);
  // Square smoke rolls out of the mouth when it fires, and thins out.
  const age = steps - firedAt;
  if (age >= 0 && age < 36 && !view.reduced) {
    const a = 1 - age / 36;
    const fade = (k: number) => `rgba(${FIRE.smoke}, ${(0.9 * a * k).toFixed(2)})`;
    const mx = at(23) + dir * 2;
    const my = bottom - 17;
    const puffs: [number, number, number, number][] = [
      [3, -1, 5, 1],
      [8, -4, 4, 0.8],
      [12, -1, 3, 0.6],
      [5, -7, 3, 0.7]
    ];
    for (const [dx, dy, size, k] of puffs) {
      const grow = Math.min(2, Math.floor(age / 8));
      const s = size + grow;
      const px = mx + dir * (dx + Math.floor(age / 4)) - (dir < 0 ? s : 0);
      R(px, my + dy - Math.floor(age / 6) - grow, s, s, fade(k));
    }
  }
}

/** A big drum on the ground: a red shell with a cream rope zigzag between two hoops; the skin dips after it throws. */
export function drawDrum(l: Launcher, steps: number, firedAt = -999) {
  const bottom = l.y + l.h;
  const press = steps - firedAt >= 0 && steps - firedAt < 6 ? 1 : 0;
  const top = l.y + press;
  const hoop = PALETTE.woodDark;
  R(l.x + 1, top + 2, l.w - 2, bottom - top - 2, PALETTE.sailStripe);
  R(l.x + 1, top + 2, 2, bottom - top - 2, mix(PALETTE.sailStripe, WHITE, 0.2));
  R(l.x + l.w - 3, top + 2, 2, bottom - top - 2, mix(PALETTE.sailStripe, INK, 0.3));
  // The rope, zigzag between the hoops.
  const h = bottom - top - 5;
  for (let i = 0; i < l.w - 2; i++) {
    const t = i % 6 < 3 ? i % 3 : 2 - (i % 3);
    R(l.x + 1 + i, top + 3 + Math.round((t / 2) * (h - 1)), 1, 1, PALETTE.sail);
  }
  R(l.x, top + 2, l.w, 1, hoop);
  R(l.x, bottom - 2, l.w, 2, hoop);
  // The skin.
  R(l.x + 1, top, l.w - 2, 2, PALETTE.sail);
  R(l.x + 2, top, l.w - 4, 1, mix(PALETTE.sail, WHITE, 0.5));
}
