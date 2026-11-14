import { PLAYER } from "@larshansen/pixelkit/config";
import { AKERSHUS } from "../levels/akershus";
import { HOLMENKOLLEN } from "../levels/holmenkollen";
import { LANGKAIA } from "../levels/langkaia";
import { RADHUSET } from "../levels/radhuset";
import { SLOTTET } from "../levels/slottet";
import type { LevelDef } from "../levels/types";
import { bracteateOf, levelMap, runeOf } from "./play";
import { search } from "./reach";

// One level's reach search, in a worker of its own, so the tests can search the levels side by side.
// Without the feather, with the ski pole: what the bracteate must be out of reach of.

declare const self: Worker;
const LEVELS: Record<string, LevelDef> = { langkaia: LANGKAIA, akershus: AKERSHUS, radhuset: RADHUSET, slottet: SLOTTET, holmenkollen: HOLMENKOLLEN };

self.onmessage = (e: MessageEvent<string>) => {
  const def = LEVELS[e.data];
  const map = levelMap(def);
  const s = map.spawn();
  const t0 = performance.now();
  const r = search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, [runeOf(map)!, bracteateOf(map)!], { pole: true });
  self.postMessage({ id: def.id, rune: r.hit[0], bracteate: r.hit[1], spots: r.spots.length, ms: Math.round(performance.now() - t0) });
};
