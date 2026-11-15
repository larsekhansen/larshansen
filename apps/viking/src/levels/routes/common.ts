import { PLAYER } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown, rides, type CarrierDef } from "@larshansen/pixelkit/carrier";
import type { Move } from "../../game/bot";
import type { Play } from "../../game/play";

/** A carrier over him, at its riding height, wide enough under him to land on from a jump straight up. */
export const over = (p: Play, d: CarrierDef, y: number) => {
  if (!carrierShown(d, p.t)) return false;
  const at = carrierAt(d, p.t);
  return at.y === y && at.x + 4 <= p.body.x && at.x + d.w - 4 >= p.body.x + PLAYER.w + 12;
};
export const onOne = (p: Play, ds: CarrierDef[], y: number) => ds.some((d) => over(p, d, y));
/** Riding: standing on ground that is not the map's. */
export const riding = (p: Play) => p.body.onGround && !p.map.supports(p.body);
export { rides };

const STILL = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/**
 * Walks on to x as a person with the shield does: whenever `danger` says something is coming (and the
 * way it comes from), stops, turns to face it and holds the shield up, a few steps longer than the
 * danger lasts; then walks on.
 */
export const shieldedWalk = (name: string, x: number, danger: (q: Play) => 1 | -1 | null, hold: number, until?: (q: Play) => boolean): Move => ({
  name,
  keys(q, s) {
    const face = danger(q);
    if (face !== null) {
      s.hold = hold;
      s.face = face;
    }
    if (face !== null || (s.hold as number) > 0) {
      s.hold = Math.max(0, (s.hold as number) - 1);
      return { ...STILL, left: s.face === -1 && q.body.facing !== -1, right: s.face === 1 && q.body.facing !== 1, shield: true };
    }
    const dx = x - (q.body.x + PLAYER.w / 2);
    if (Math.abs(dx) <= 2 && q.body.onGround && Math.abs(q.body.vx) < 0.05) return !until || until(q) ? "done" : STILL;
    const near = Math.abs(dx) < Math.abs(q.body.vx) * 4;
    return { ...STILL, left: !near && dx < 0, right: !near && dx > 0 };
  }
});
