// One level's reach search and dead-end search, as the tests' worker runs it (with every stone risen and
// with none, for a level whose stones rise), for building a level.   bun reachone.ts <id>
import { PLAYER } from "@larshansen/pixelkit/config";
const id = process.argv[2];
const W = await import("../../src/game/reach.ts");
const P = await import("../../src/game/play.ts");
const mod = await import(`../../src/levels/${id}.ts`);
const def0 = Object.values(mod).find((v: any) => v && v.id === id) as any;
const world = (def: any, from?: any) => {
  const map = P.levelMap(def);
  const s = from ?? map.spawn();
  const boxes = [P.runeOf(map)!, P.bracteateOf(map)!];
  const t0 = performance.now();
  const r = W.search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, graph: true });
  const d = W.deadEnds(r.graph!, true, [0]);
  const calm = def.zones?.some((z: any) => z.beat) ? W.search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, calm: true }) : null;
  return { rune: r.hit[0] || !!calm?.hit[0], bracteate: r.hit[1] || !!calm?.hit[1], spots: r.spots.length, reached: d.reached, dead: W.describeSpots(d.dead.map((i: number) => r.spots[i])), onlyByFalling: W.describeSpots(d.onlyByFalling.map((i: number) => r.spots[i])), ms: Math.round(performance.now() - t0) };
};
if (def0.risen) {
  console.log("every stone risen", world({ ...def0, legend: { ...def0.legend, solid: def0.legend.solid + def0.risen.solid, oneWay: def0.legend.oneWay + def0.risen.oneWay } }));
  for (const f of [undefined, ...P.flagsOf(P.levelMap(def0))]) console.log(`no stone risen, from ${f ? `the flag at column ${Math.floor(f.x / 16)}` : "the start"}`, world(def0, f));
} else console.log(world(def0));
