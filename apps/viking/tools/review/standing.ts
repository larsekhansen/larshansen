// The perfect route's standing still, split into standing on the map's own ground and standing on what
// is not the map's (moving ground, the bells on their beat), called riding.
import { LEVELS, POLE, play as P } from "./common.ts";
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : LEVELS.map((l) => l[0]);
for (const id of ids) {
  const [, def, moves] = LEVELS.find((l) => l[0] === id)! as any;
  const p = P.newPlay(def, { pole: POLE.has(id) });
  let m = 0, mem: any = { i: 0, air: false }, n = 0, ground = 0, ride = 0;
  for (; n < 60 * 300 && p.run.state !== "done"; n++) {
    let kk: any = NONE;
    while (m < moves.length) { const r = moves[m].keys(p, mem); if (r === "done") { m++; mem = { i: 0, air: false }; continue; } mem.i++; kk = r; break; }
    const still = !kk.left && !kk.right && !kk.jumpHeld && p.body.onGround && Math.abs(p.body.vx) < 0.05;
    if (still) { if (p.map.supports(p.body)) ground++; else ride++; }
    P.stepPlay(p, kk);
  }
  console.log(`${id}: clear ${(n / 60).toFixed(1)} s; standing still ${((ground + ride) / 60).toFixed(1)} s (${(100 * (ground + ride) / n).toFixed(0)}%): on fixed ground ${(ground / 60).toFixed(1)} s (${(100 * ground / n).toFixed(0)}%), riding ${(ride / 60).toFixed(1)} s (${(100 * ride / n).toFixed(0)}%)`);
}
