// Line 2 review (15 November 2026): the serpent fought with the route's own plan at ±0/2/4/8 from the bench: time to beaten, hearts, standing. Run: bun fighttime.ts
import { LEVELS, POLE, play as P } from "./common.ts";
import { clonePlay, reference, sloppyRun } from "./sloppy.ts";
const id = "gamlebyen";
const [, def, moves] = LEVELS.find((l) => l[0] === id)! as any;
const ref = reference(def, moves, true);
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const p = P.newPlay(def, { pole: true });
let m = 0, mem: any = { i: 0, air: false };
const snap = new Map<number, any>();
for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
  let k: any = NONE;
  while (m < moves.length) { if (!snap.has(m)) snap.set(m, clonePlay(p)); const r = moves[m].keys(p, mem); if (r === "done") { m++; mem = { i: 0, air: false }; continue; } mem.i++; k = r; break; }
  P.stepPlay(p, k);
}
const mi = moves.findIndex((mv: any) => mv.name.startsWith("the serpent"));
for (const k of [0, 2, 4, 8]) {
  const times: number[] = []; let hearts = 0, lives = 0, overs = 0, still = 0;
  for (let seed = 1; seed <= (k ? 60 : 1); seed++) {
    const r = sloppyRun(id, def, moves, ref, { k, drop: 0, overhold: 0, seed: 9000 + seed, pole: true, startPlay: clonePlay(snap.get(mi - 1)), startA: { m: mi - 1, mem: { i: 0, air: false } }, stopAt: mi + 1, max: 60 * 400 });
    if (r.outcome === "clear") times.push(r.steps / 60); if (r.outcome === "over") overs++;
    hearts += r.hurts.length; lives += r.livesLost; still += r.idle;
  }
  times.sort((a, b) => a - b);
  const n = k ? 60 : 1;
  console.log(`±${k}: ${times.length}/${n} beaten, Game over ${overs}; time from the bench to beaten: median ${times[Math.floor(times.length / 2)]?.toFixed(0)} s, 90th pct ${times[Math.floor(times.length * 0.9)]?.toFixed(0)} s, max ${times.at(-1)?.toFixed(0)} s; hearts ${(hearts / n).toFixed(2)}, lives ${(lives / n).toFixed(2)} per fight; standing still ${(still / n).toFixed(0)} s per fight`);
}
