// From every flag and bench (as the rules put him back there), at several level clocks, does the perfect route (resumed from there) still clear?
import { LEVELS, POLE, play as P } from "./common.ts";
import { reference, sloppyRun } from "./sloppy.ts";
const only = process.argv[2];
for (const [id, def, moves] of LEVELS) {
  if (only && only !== id) continue;
  const pole = POLE.has(id);
  const ref = reference(def, moves as any, pole);
  const map = P.levelMap(def);
  const flags = P.flagsOf(map);
  const out: string[] = [];
  for (const [k, step] of ref.saveAt) {
    const [x, bottom] = k.split(",").map(Number);
    const fi = flags.findIndex((f: any) => Math.round(f.x) === x && Math.round(f.bottom) === bottom);
    // flags reached by then
    const reached = flags.map((f: any, i: number) => i).filter((i: number) => ref.rec.findIndex((r) => Math.abs(r.x - flags[i].x) <= 6) <= step).pop() ?? null;
    const res: string[] = [];
    for (const dt of [0, 97, 233, 401, 677, 911]) {
      const r = sloppyRun(id, def, moves as any, ref, { k: 0, drop: 0, overhold: 0, seed: 1, pole, from: { step, t: step + dt, save: { x, bottom }, flag: fi >= 0 ? fi : reached }, max: 60 * 240 });
      res.push(r.outcome === "clear" ? `ok${r.hurts.length ? "(" + r.hurts.length + "h)" : ""}` : `${r.outcome}@${r.lastX}:${r.lastMove}`);
    }
    out.push(`  ${fi >= 0 ? "flag" : "bench"} col ${Math.floor(x / 16)}: ${res.join(" ")}`);
  }
  console.log(id + "\n" + out.join("\n"));
}
