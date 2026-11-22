import { PLAYER } from "@larshansen/pixelkit/config";
import { AKERSELVA } from "../levels/akerselva";
import { AKERSHUS } from "../levels/akershus";
import { HOLMENKOLLEN } from "../levels/holmenkollen";
import { LANGKAIA } from "../levels/langkaia";
import { NORDMARKA } from "../levels/nordmarka";
import { RADHUSET } from "../levels/radhuset";
import { SLOTTET } from "../levels/slottet";
import { STORTINGET } from "../levels/stortinget";
import { EKEBERG } from "../levels/ekeberg";
import { NABOLAGET } from "../levels/nabolaget";
import { BYGDOY } from "../levels/bygdoy";
import { VIGELANDSPARKEN } from "../levels/vigelandsparken";
import { KORKETREKKEREN } from "../levels/korketrekkeren";
import { OSTENSJOVANNET } from "../levels/ostensjovannet";
import { BJORVIKA } from "../levels/bjorvika";
import { GAMLEBYEN } from "../levels/gamlebyen";
import type { LevelDef } from "../levels/types";
import { bracteateOf, flagsOf, levelMap, runeOf } from "./play";
import { TILE } from "@larshansen/pixelkit/config";
import { deadEnds, describeSpots, search } from "./reach";

// One level's reach search (run in a worker of its own, `reach.worker.ts`, so the tests can search the levels side by side).
// Without the feather, with the ski pole: what the bracteate must be out of reach of. The same search, kept as a graph,
// also finds dead ends: places he can get to (with the single jump, and the pole where he is sure to have it) from which
// neither the rune nor a fall that puts him back can be reached.

/** Holmenkollen's rune is reached down the inrun at speed, which the search does not model; the scripted player shows it from the hut at the top. */
const HUT = { x: 207 * TILE, y: 15 * TILE, w: 6 * TILE, h: TILE };
export const LEVELS: Record<string, LevelDef> = { langkaia: LANGKAIA, akershus: AKERSHUS, radhuset: RADHUSET, slottet: SLOTTET, holmenkollen: HOLMENKOLLEN, akerselva: AKERSELVA, nordmarka: NORDMARKA, stortinget: STORTINGET, ekeberg: EKEBERG, nabolaget: NABOLAGET, bygdoy: BYGDOY, vigelandsparken: VIGELANDSPARKEN, korketrekkeren: KORKETREKKEREN, ostensjovannet: OSTENSJOVANNET, bjorvika: BJORVIKA, gamlebyen: GAMLEBYEN };

/**
 * One world's searches: where he can get to, the dead ends, and (with gusts on a beat) the calm too. A
 * level whose stones rise as he passes (Gamlebyen) is searched twice: with every stone risen, and with
 * none (`risen`): the rune and the dead ends as everywhere in the first, and in the second, no spot he can
 * get to from which neither the rune nor a fall can be reached (before the stones rise, he is not stuck).
 */
function searchWorld(def: LevelDef, pole: boolean, from?: { x: number; bottom: number }) {
  const map = levelMap(def);
  const s = from ?? map.spawn();
  const t0 = performance.now();
  const boxes = [runeOf(map)!, bracteateOf(map)!, ...(def.id === "holmenkollen" ? [HUT] : [])];
  const r = search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, graph: true });
  const d = deadEnds(r.graph!, pole, def.id === "holmenkollen" ? [0, 2] : [0]);
  // Gusts on a beat: searched blowing all the time, and again with none at all.
  const calm = def.zones?.some((z) => z.beat) ? search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, calm: true }) : null;
  const hit = (i: number) => r.hit[i] || !!calm?.hit[i];
  return {
    rune: hit(0),
    bracteate: hit(1),
    spots: r.spots.length + (calm?.spots.length ?? 0),
    reached: d.reached,
    dead: describeSpots(d.dead.map((i) => r.spots[i])),
    onlyByFalling: describeSpots(d.onlyByFalling.map((i) => r.spots[i])),
    ms: Math.round(performance.now() - t0)
  };
}

/** What one search of a level found. */
export type Found = ReturnType<typeof searchWorld>;

/** Every stone risen (Gamlebyen): the world the rune and the dead ends are searched in. */
const risenOf = (def: LevelDef): LevelDef => ({ ...def, legend: { ...def.legend, solid: def.legend.solid + def.risen!.solid, oneWay: def.legend.oneWay + def.risen!.oneWay } });

/**
 * How many searches a level is: one, or for a level whose stones rise (Gamlebyen) one with every stone risen, then with none
 * from the start and from every flag (each stretch as it is before its stones rise). Since order 35 each is a job of its
 * own, so the tests can spread a level's searches over the cores.
 */
export const partsOf = (def: LevelDef) => (def.risen ? 2 + flagsOf(levelMap(def)).length : 1);

/** One of a level's searches (`partsOf`): 0 the level as it is (or with every stone risen); 1, 2, ... with none risen, from the start and from each flag. */
export function searchPart(def: LevelDef, pole: boolean, part: number): Found {
  if (!def.risen) return searchWorld(def, pole);
  return part === 0 ? searchWorld(risenOf(def), pole) : searchWorld(def, pole, [undefined, ...flagsOf(levelMap(def))][part - 1]);
}

/** A level's searches put together: the rune, the spots and the dead ends of the first; the bracteate if any reached it; the dead ends before the stones rise. */
export function joinParts(id: string, [first, ...rest]: Found[]) {
  return {
    id,
    ...first,
    bracteate: first.bracteate || rest.some((d) => d.bracteate),
    dead: [...first.dead, ...rest.flatMap((d) => d.dead.map((s) => `before the stones rise: ${s}`))],
    ms: first.ms + rest.reduce((n, d) => n + d.ms, 0)
  };
}

/** A whole level's searches, one after another. */
export const searchLevel = (id: string, pole: boolean) => joinParts(id, Array.from({ length: partsOf(LEVELS[id]) }, (_, k) => searchPart(LEVELS[id], pole, k)));
