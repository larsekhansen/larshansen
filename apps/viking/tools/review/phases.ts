// The step at which each of the boss's phases (and each hit) first comes in the scripted route: for
// screenshot addresses (`?debug&auto&steps=N&level=<id>`). Run: bun phases.ts gamlebyen
import { LEVELS, POLE, play as P } from "./common.ts";
const id = process.argv[2] ?? "gamlebyen";
const [, def, moves] = LEVELS.find((l) => l[0] === id)! as any;
const p = P.newPlay(def, { pole: POLE.has(id) });
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
let m = 0, mem: any = { i: 0, air: false }, last = "";
for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
  let k: any = NONE;
  while (m < moves.length) { const r = moves[m].keys(p, mem); if (r === "done") { m++; mem = { i: 0, air: false }; continue; } mem.i++; k = r; break; }
  const ev = P.stepPlay(p, k);
  const ph = p.boss ? `${p.boss.state.phase}/${p.boss.state.hits}` : "";
  if (ph !== last || ev.boss || ev.rune) console.log(`steps=${n + 1} x=${Math.round(p.body.x + 5)} col=${Math.floor((p.body.x + 5) / 16)} ${ph} ${ev.boss ?? ""} ${ev.rune ? "RUNE" : ""}`);
  last = ph;
}
