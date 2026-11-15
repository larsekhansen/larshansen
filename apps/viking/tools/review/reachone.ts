// One level's reach search and dead-end search, as the tests' worker runs it, for building a level.
//   bun reachone.ts <id>
import { PLAYER } from "@larshansen/pixelkit/config";
const id = process.argv[2];
const W = await import("../../src/game/reach.ts");
const P = await import("../../src/game/play.ts");
const mod = await import(`../../src/levels/${id}.ts`);
const def = Object.values(mod).find((v: any) => v && v.id === id) as any;
const map = P.levelMap(def);
const s = map.spawn();
const boxes = [P.runeOf(map)!, P.bracteateOf(map)!];
const t0 = performance.now();
const r = W.search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, graph: true });
const d = W.deadEnds(r.graph!, true, [0]);
const calm = def.zones?.some((z: any) => z.beat) ? W.search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, calm: true }) : null;
console.log({ rune: r.hit[0] || !!calm?.hit[0], bracteate: r.hit[1] || !!calm?.hit[1], spots: r.spots.length, reached: d.reached, dead: W.describeSpots(d.dead.map((i: number) => r.spots[i])), onlyByFalling: W.describeSpots(d.onlyByFalling.map((i: number) => r.spots[i])), ms: Math.round(performance.now() - t0) });
