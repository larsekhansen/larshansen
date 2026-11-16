import type { Phase } from "@larshansen/pixelkit/oslo";
import { mix } from "@larshansen/pixelkit/paint";
import { horizonColor } from "@larshansen/pixelkit/sky";
import type { LevelDef } from "../levels/types";

// The haze behind the play lane (order 22, A6; it was there since the far layers were, toward the horizon's colour):
// each far layer is washed toward the level's air, more the further it is, so what he plays with stands forward.
// The wash rides on the fill each far pass already makes (`stage.ts`'s haze; after dusk folded with the night's
// tint into one fill), so it costs no rectangle and no canvas of its own.

/** The far, mid and near layers' haze, unless a level says otherwise: the farthest most. */
export const HAZE: readonly [number, number, number] = [0.5, 0.4, 0.3];

/** A level's haze for its far, mid and near layers. */
export const hazeOf = (def: Pick<LevelDef, "haze">): readonly [number, number, number] => def.haze ?? HAZE;

/** The street's own backdrop (the buildings right behind him): the lightest of the haze; none under the ground, nor on the line map, whose stations are its backdrop. */
export const BACK_HAZE = 0.08;
export const backHazeOf = (def: Pick<LevelDef, "id" | "haze" | "underground">): number => (def.id === "kart" || def.underground || (def.haze && def.haze.every((h) => h === 0)) ? 0 : BACK_HAZE);

/**
 * The colour of a level's air under a phase: the sky's own at its horizon (cool pale blue by day, warm at sunset,
 * deep blue at night), or, in snow and mist (`LevelDef.air`), a grey-white by day and the night's blue a little
 * lightened by it after dusk.
 */
export function airOf(def: Pick<LevelDef, "air">, phase: Phase): string {
  const sky = horizonColor(phase);
  if (!def.air) return sky;
  return phase === "day" ? def.air : mix(sky, def.air, 0.25);
}
