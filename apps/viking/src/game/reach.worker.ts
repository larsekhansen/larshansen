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
import { search } from "./reach";

// One level's reach search, in a worker of its own, so the tests can search the levels side by side.
// Without the feather, with the ski pole: what the bracteate must be out of reach of.

declare const self: Worker;
const LEVELS: Record<string, LevelDef> = { langkaia: LANGKAIA, akershus: AKERSHUS, radhuset: RADHUSET, slottet: SLOTTET, holmenkollen: HOLMENKOLLEN, akerselva: AKERSELVA, nordmarka: NORDMARKA, stortinget: STORTINGET, ekeberg: EKEBERG, nabolaget: NABOLAGET };

self.onmessage = (e: MessageEvent<string>) => {
  const def = LEVELS[e.data];
  const map = levelMap(def);
  const s = map.spawn();
  const t0 = performance.now();
  const boxes = [runeOf(map)!, bracteateOf(map)!];
  const r = search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true });
  // Gusts on a beat: searched blowing all the time, and again with none at all.
  const calm = def.zones?.some((z) => z.beat) ? search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, calm: true }) : null;
  const hit = (i: number) => r.hit[i] || !!calm?.hit[i];
  self.postMessage({ id: def.id, rune: hit(0), bracteate: hit(1), spots: r.spots.length + (calm?.spots.length ?? 0), ms: Math.round(performance.now() - t0) });
};
