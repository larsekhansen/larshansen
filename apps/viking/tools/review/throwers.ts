// Every thrower: where it stands, its beat, and every place the perfect route stands still within its reach (alive or not).
import { LEVELS, POLE, play as P } from "./common.ts";
const { THROW_REACH, WINDUP, SHOT } = await import("../../src/game/enemies.ts");
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
for (const [id, def, moves] of LEVELS) {
  const thr = (def.enemies ?? []).map((e: any, i: number) => ({ e, i })).filter((o: any) => o.e.kind === "thrower");
  if (!thr.length) continue;
  const p = P.newPlay(def, { pole: POLE.has(id) });
  let m = 0, mem: any = { i: 0, air: false };
  const near = new Map<number, Map<string, number>>();
  const killedAt = new Map<number, number>();
  for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
    let k: any = NONE;
    while (m < (moves as any).length) { const r = (moves as any)[m].keys(p, mem); if (r === "done") { m++; mem = { i: 0, air: false }; continue; } mem.i++; k = r; break; }
    const still = p.body.onGround && Math.abs(p.body.vx) < 0.05 && !k.left && !k.right;
    for (const o of thr) {
      const e = p.enemies[o.i];
      if (!e.alive && !killedAt.has(o.i)) killedAt.set(o.i, n);
      const hx = p.body.x + 5;
      if (still && Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(p.body.y - e.y) < THROW_REACH.y) {
        const key = `${(moves as any)[m]?.name ?? "?"} @col ${Math.floor(hx / 16)}${e.alive ? "" : " (it is beaten by then)"}`;
        if (!near.has(o.i)) near.set(o.i, new Map());
        near.get(o.i)!.set(key, (near.get(o.i)!.get(key) ?? 0) + 1);
      }
    }
    P.stepPlay(p, k);
  }
  console.log(id);
  for (const o of thr) {
    const per = o.e.period ?? 170;
    console.log(`  thrower ${o.e.look} at col ${o.e.c} row ${o.e.r}, every ${(per / 60).toFixed(1)} s (wind-up ${WINDUP} steps); ${killedAt.has(o.i) ? "the route stomps it" : "the route leaves it alive"}`);
    for (const [k, v] of near.get(o.i) ?? []) console.log(`     stands still in reach ${(v / 60).toFixed(1)} s: ${k}`);
  }
}
