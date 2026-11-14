import { PLAYER } from "./config";
import { pulsePhase, type Pulse } from "./timed";

// Hazards: a rectangle of the world that hurts whoever touches it, as an enemy does: the third
// rail in a track bed, a spark. The level draws it, in a colour that warns. On a beat, it hurts
// only while live, after a warning of a second or more, so he always sees it coming.

export interface Hazard {
  /** Top left and size, in world pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** On a beat: it rests, warns, and hurts only while live. Without one it always hurts. */
  beat?: Pulse;
}

/** True when the hazard hurts at this step. */
export const hazardLive = (h: Hazard, step: number) => !h.beat || pulsePhase(step, h.beat) === "live";

/** The first live hazard the body touches at this step, or null. */
export function hazardTouched(hazards: readonly Hazard[] | undefined, b: { x: number; y: number }, step: number): Hazard | null {
  if (!hazards) return null;
  for (const h of hazards) if (b.x < h.x + h.w && b.x + PLAYER.w > h.x && b.y < h.y + h.h && b.y + PLAYER.h > h.y && hazardLive(h, step)) return h;
  return null;
}
