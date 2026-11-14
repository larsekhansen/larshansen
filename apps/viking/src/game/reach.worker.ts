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
import type { LevelDef } from "../levels/types";
import { bracteateOf, levelMap, runeOf } from "./play";
import { TILE } from "@larshansen/pixelkit/config";
import { deadEnds, describeSpots, search } from "./reach";

// One level's reach search, in a worker of its own, so the tests can search the levels side by side.
// Without the feather, with the ski pole: what the bracteate must be out of reach of. The same search,
// kept as a graph, also finds dead ends: places he can get to (with the single jump, and the pole
// where he is sure to have it) from which neither the rune nor a fall that puts him back can be
// reached.

declare const self: Worker;
/** Holmenkollen's rune is reached down the inrun at speed, which the search does not model; the scripted player shows it from the hut at the top. */
const HUT = { x: 207 * TILE, y: 15 * TILE, w: 6 * TILE, h: TILE };
const LEVELS: Record<string, LevelDef> = { langkaia: LANGKAIA, akershus: AKERSHUS, radhuset: RADHUSET, slottet: SLOTTET, holmenkollen: HOLMENKOLLEN, akerselva: AKERSELVA, nordmarka: NORDMARKA, stortinget: STORTINGET, ekeberg: EKEBERG, nabolaget: NABOLAGET };

self.onmessage = (e: MessageEvent<{ id: string; pole: boolean }>) => {
  const def = LEVELS[e.data.id];
  const map = levelMap(def);
  const s = map.spawn();
  const t0 = performance.now();
  const boxes = [runeOf(map)!, bracteateOf(map)!, ...(def.id === "holmenkollen" ? [HUT] : [])];
  const r = search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, graph: true });
  const d = deadEnds(r.graph!, e.data.pole, def.id === "holmenkollen" ? [0, 2] : [0]);
  // Gusts on a beat: searched blowing all the time, and again with none at all.
  const calm = def.zones?.some((z) => z.beat) ? search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, calm: true }) : null;
  const hit = (i: number) => r.hit[i] || !!calm?.hit[i];
  self.postMessage({
    id: def.id,
    rune: hit(0),
    bracteate: hit(1),
    spots: r.spots.length + (calm?.spots.length ?? 0),
    reached: d.reached,
    dead: describeSpots(d.dead.map((i) => r.spots[i])),
    onlyByFalling: describeSpots(d.onlyByFalling.map((i) => r.spots[i])),
    ms: Math.round(performance.now() - t0)
  });
};
