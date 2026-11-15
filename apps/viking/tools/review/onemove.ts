// Line 2 review (15 November 2026): one move of a route tried alone at ±k, 40 tries, and what hurt him. Run: bun onemove.ts <level> "<part of the move name>" [k]
// Hurt causes for one move tried alone (as allmoves.ts does).
import { LEVELS, POLE, play as P } from "./common.ts";
import { clonePlay, reference, sloppyRun } from "./sloppy.ts";
const [id, pat, kS] = [process.argv[2], process.argv[3], process.argv[4] ?? "4"];
const [, def, moves] = LEVELS.find((l) => l[0] === id)! as any;
const pole = POLE.has(id);
const ref = reference(def, moves, pole);
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const p = P.newPlay(def, { pole });
let m = 0, mem: any = { i: 0, air: false };
const snap = new Map<number, any>();
for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
  let k: any = NONE;
  while (m < moves.length) { if (!snap.has(m)) snap.set(m, clonePlay(p)); const r = moves[m].keys(p, mem); if (r === "done") { m++; mem = { i: 0, air: false }; continue; } mem.i++; k = r; break; }
  P.stepPlay(p, k);
}
const mi = moves.findIndex((mv: any) => mv.name.includes(pat));
const from = mi > 0 && /^walk/.test(moves[mi - 1].name) ? mi - 1 : mi;
console.log(`move ${mi} '${moves[mi].name}', from ${from} '${moves[from].name}'`);
const causes = new Map<string, number>();
for (let seed = 1; seed <= 40; seed++) {
  const r = sloppyRun(id, def, moves, ref, { k: Number(kS), drop: 0, overhold: 0, seed: 7000 + seed * 101 + mi, pole, startPlay: clonePlay(snap.get(from)), startA: { m: from, mem: { i: 0, air: false } }, stopAt: mi + 1, max: 60 * 30 });
  for (const h of r.hurts) causes.set(`${h.cause} col ${h.col}`, (causes.get(`${h.cause} col ${h.col}`) ?? 0) + 1);
}
console.log([...causes].sort((a, b) => b[1] - a[1]));
