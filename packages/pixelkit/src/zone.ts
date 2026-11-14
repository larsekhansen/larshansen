import { PLAYER } from "./config";
import { pulsePhase, type Pulse } from "./timed";

// Zones: a rectangle of the world that pushes whoever is in it, every step he is there. A
// waterfall pushes down, a current pushes along, warm air from a chimney lifts. The body's own
// constants never change: the push is the world's, and `stepBody` reads it through its `extra`
// argument as it reads moving ground and surfaces. Across, the push moves him as moving ground
// does (his own speed is kept); up and down, it adds to his falling speed, as gravity does.
// The dash goes straight through a push: while it lasts, `stepBody` is not called at all.
//
// A zone on a beat (a gust of wind) rests, warns for a second, and only pushes while it is live.

export interface Zone {
  /** Top left and size, in world pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Pixels a step across (+ to the right), and pixels a step per step down (+ down). */
  push: { x: number; y: number };
  /** A gust: it pushes only while live, after its warning. Without a beat it always pushes. */
  beat?: Pulse;
}

/** True when any of the body's box is inside the zone. */
export function inZone(z: Zone, b: { x: number; y: number }): boolean {
  return b.x < z.x + z.w && b.x + PLAYER.w > z.x && b.y < z.y + z.h && b.y + PLAYER.h > z.y;
}

/** True when the zone pushes at this step: always, or while its beat is live. Without a step, a zone on a beat counts as live (at its strongest). */
export function zoneLive(z: Zone, step?: number): boolean {
  return !z.beat || step === undefined || pulsePhase(step, z.beat) === "live";
}

/** The push on a body this step: the sum of every live zone it is in, or null when it is in none. */
export function zonePush(zones: readonly Zone[] | undefined, b: { x: number; y: number }, step?: number): { x: number; y: number } | null {
  if (!zones) return null;
  let x = 0;
  let y = 0;
  let any = false;
  for (const z of zones)
    if (inZone(z, b) && zoneLive(z, step)) {
      x += z.push.x;
      y += z.push.y;
      any = true;
    }
  return any ? { x, y } : null;
}
