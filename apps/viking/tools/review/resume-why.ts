// Line 2 review (15 November 2026): what hurts the perfect route resumed from one flag at six clocks. Run: bun resume-why.ts <level> <flag column>
import { LEVELS, POLE, play as P } from "./common.ts";
import { reference, sloppyRun } from "./sloppy.ts";
const [id, col] = [process.argv[2], Number(process.argv[3])];
const [, def, moves] = LEVELS.find((l) => l[0] === id)! as any;
const ref = reference(def, moves, POLE.has(id));
const flags = P.flagsOf(P.levelMap(def));
for (const [k, step] of ref.saveAt) {
  const [x, bottom] = k.split(",").map(Number);
  if (Math.floor(x / 16) !== col) continue;
  const fi = flags.findIndex((f: any) => Math.round(f.x) === x && Math.round(f.bottom) === bottom);
  for (const dt of [0, 97, 233, 401, 677, 911]) {
    const r = sloppyRun(id, def, moves, ref, { k: 0, drop: 0, overhold: 0, seed: 1, pole: POLE.has(id), from: { step, t: step + dt, save: { x, bottom }, flag: fi }, max: 60 * 240 });
    console.log(dt, r.outcome, r.hurts.map((h) => `${h.cause} col ${h.col} t=${(h.t / 60).toFixed(1)}s`).join("; "));
  }
}
