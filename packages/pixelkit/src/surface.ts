import { MOVE } from "./config";

// Ground that is not plain ground: ice, a ski inrun, a belt. The world answers `surfaceAt(x, y)` for
// the spot under his feet, and `stepBody` reads it through its `extra` argument, as it reads moving
// ground. The body's own constants (`MOVE`, `JUMP`) never change: a surface only says how much of
// them takes hold, and what the ground itself does to him.

export interface Surface {
  /** How much of the usual accel and decel his keys get: 1 on firm ground, little on ice, 0 where they do nothing at all. */
  grip: number;
  /** The most speed he can have on it. Above the run it lets him go faster than he runs (an inrun). */
  cap?: number;
  /**
   * The ground's own speed, + to the right. With grip, his keys run him relative to it (a belt);
   * without grip it draws him towards it at `SLIDE.pull` (the slope of an inrun).
   */
  belt?: number;
}

/** How fast ground he has no grip on draws him towards its belt speed, per step: the pull of a slope. */
export const SLIDE = { pull: 0.03 };

/** Ice: his keys get an eighth of their grip, so he is slow to start, slow to stop, and slides. */
export const ICE: Surface = { grip: 0.12 };

/** His speed after one step standing on a surface, from his speed and the way his keys point (-1, 0, 1). */
export function surfaceSpeed(vx: number, dir: number, s: Surface): number {
  const keys = s.grip > 0 ? dir : 0;
  const target = (s.belt ?? 0) + keys * MOVE.run;
  const rate = s.grip > 0 ? (keys ? MOVE.accel : MOVE.decel) * s.grip : SLIDE.pull;
  const v = vx < target ? Math.min(target, vx + rate) : Math.max(target, vx - rate);
  return s.cap === undefined ? v : Math.max(-s.cap, Math.min(s.cap, v));
}

/** True when leaving this ground at this speed keeps the speed in the air, as a throw does: he goes faster than he can run. */
export const keepsSpeed = (vx: number) => Math.abs(vx) > MOVE.run + 1e-9;
