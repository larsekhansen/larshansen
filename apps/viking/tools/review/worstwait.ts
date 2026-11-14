// For each wait in each route: arriving at that spot at any moment of the level's clock, how long until the route may go on?
import { LEVELS, POLE, play as P } from "./common.ts";
import { clonePlay } from "./sloppy.ts";
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
for (const [id, def, moves] of LEVELS) {
  if (["nordmarka", "nabolaget"].includes(id) && false) continue;
  const p = P.newPlay(def, { pole: POLE.has(id) });
  let m = 0, mem: any = { i: 0, air: false };
  const starts: { m: number; snap: any }[] = [];
  for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
    let k: any;
    while (m < (moves as any).length) {
      k = (moves as any)[m].keys(p, mem);
      if (k === "done") { m++; mem = { i: 0, air: false }; continue; }
      if (mem.i === 0 && !/^(walk|jump|leap|stomp|into|sit|hop)/.test((moves as any)[m].name)) starts.push({ m, snap: clonePlay(p) });
      mem.i++;
      break;
    }
    P.stepPlay(p, k ?? NONE);
  }
  const lines: string[] = [];
  for (const { m, snap } of starts) {
    const mv = (moves as any)[m];
    if (/troll|plough|down, round|swept|scoops|on the moose|on the chair|across|through the tunnel|up the trestle|to the|under the|the last log|the tip he rides|far end|express comes|on the express|parks|together/.test(mv.name)) continue; // rides and boss waits: not a wait at a stop
    let worst = 0, sum = 0, cnt = 0;
    for (let d = 0; d < 1800; d += 15) {
      const q = clonePlay(snap);
      q.t = snap.t + d;
      let w = 0;
      for (; w < 3000; w++) { const k = mv.keys(q, { i: w, air: false }); if (k === "done") break; P.stepPlay(q, k); }
      worst = Math.max(worst, w); sum += w; cnt++;
    }
    lines.push(`   ${(worst / 60).toFixed(1)} s worst, ${(sum / cnt / 60).toFixed(1)} s mean: ${mv.name} (col ${Math.floor((snap.body.x + 5) / 16)})`);
  }
  console.log(id + "\n" + lines.join("\n"));
}
