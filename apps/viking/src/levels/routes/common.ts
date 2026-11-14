import { PLAYER } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown, rides, type CarrierDef } from "@larshansen/pixelkit/carrier";
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
