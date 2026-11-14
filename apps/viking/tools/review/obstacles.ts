// Each jump of each route on its own: from the perfect run's exact state where the move before it
// starts (the walk up to the edge), the sloppy player plays that walk and the jump with timing errors
// of +-k steps, and the jump counts as made when he ends it on the floor the perfect run ended it on,
// with no heart lost. The numbers do not depend on how the sloppy player recovers from a mistake.
//
// Run: bun obstacles.ts [levels=all] [ks=2,4] [seeds=40]
import { LEVELS, POLE, play as P } from "./common.ts";
import { clonePlay, reference, sloppyRun } from "./sloppy.ts";
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=") as [string, string]));
const ids = args.levels && args.levels !== "all" ? args.levels.split(",") : LEVELS.map((l) => l[0]);
const ks = (args.ks ?? "2,4").split(",").map(Number);
const seeds = Number(args.seeds ?? 40);
const timed = (name: string) => /^(jump |jump to|leap at|into the cannon|hop)/.test(name) || /lip|dash|bounce|off the|up off|on the tram|across on the sheep|onto the stone/.test(name);
const all: any[] = [];
for (const [id, def, moves] of LEVELS) {
  if (!ids.includes(id)) continue;
  const pole = POLE.has(id);
  const ref = reference(def, moves as any, pole);
  // Snapshots of the perfect run at the first step of every move.
  const p = P.newPlay(def, { pole });
  p.sheep.forEach((s: any, i: number) => { const f: any = () => { f.s = (f.s * 16807) % 2147483647; return f.s / 2147483647; }; f.s = 101 + i * 37; s.rnd = f; });
  let m = 0, mem: any = { i: 0, air: false };
  const snap = new Map<number, { play: any; mem: any }>();
  for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
    let k: any = NONE;
    while (m < (moves as any).length) {
      if (!snap.has(m)) snap.set(m, { play: clonePlay(p), mem: { ...mem } });
      const r = (moves as any)[m].keys(p, mem);
      if (r === "done") { m++; mem = { i: 0, air: false }; continue; }
      mem.i++; k = r; break;
    }
    P.stepPlay(p, k);
  }
  for (let mi = 0; mi < (moves as any).length; mi++) {
    const mv = (moves as any)[mi];
    if (!timed(mv.name) || !snap.has(mi) || !ref.endOf.get(mi)) continue;
    // Start at the walk before it, if there is one.
    const from = mi > 0 && /^walk/.test((moves as any)[mi - 1].name) ? mi - 1 : mi;
    const end = ref.endOf.get(mi);
    const s0 = snap.get(from)!;
    const startX = s0.play.body.x + 5;
    const row: any = { id, m: mi, name: mv.name, col: Math.floor(startX / 16), endCol: end ? Math.floor(end.x / 16) : null };
    for (const k of ks) {
      let ok = 0, hearts = 0, falls = 0;
      for (let seed = 1; seed <= seeds; seed++) {
        const r = sloppyRun(id, def, moves as any, ref, { k, drop: 0, overhold: 0, seed: seed * 101 + mi, pole, startPlay: clonePlay(s0.play), startA: { m: from, mem: { i: 0, air: false } }, stopAt: mi + 1, max: 60 * 20 });
        const q = r as any;
        const good = r.outcome === "clear" && r.hurts.length === 0;
        if (good) ok++;
        hearts += r.hurts.length;
        falls += r.hurts.filter((h) => h.cause === "fall").length;
      }
      row[`k${k}`] = ok / seeds;
      row[`fall${k}`] = falls / seeds;
      row[`hearts${k}`] = hearts / seeds;
    }
    all.push(row);
  }
  const rows = all.filter((r) => r.id === id);
  const prod = (k: number) => rows.reduce((a, r) => a * r[`k${k}`], 1);
  console.log(`${id}: ${rows.length} jumps and rides; all made without a heart lost: ${ks.map((k) => `k=${k} ${(100 * prod(k)).toFixed(1)}%`).join(", ")}; expected hearts lost on the jumps: ${ks.map((k) => `k=${k} ${rows.reduce((a, r) => a + 1 - r[`k${k}`], 0).toFixed(1)}`).join(", ")}`);
  for (const r of [...rows].sort((a, b) => a[`k${ks[ks.length - 1]}`] - b[`k${ks[ks.length - 1]}`]).slice(0, 6))
    console.log(`   col ${r.col}->${r.endCol} ${r.name.slice(0, 50).padEnd(50)} ${ks.map((k) => `k${k}: ${(100 * (1 - r[`k${k}`])).toFixed(0)}% not made cleanly (${(100 * r[`fall${k}`]).toFixed(0)}% a fall, ${r[`hearts${k}`].toFixed(2)} hearts a try)`).join("; ")}`);
}
await Bun.write(`out/obstacles-${ids.length === 1 ? ids[0] : "all"}.json`, JSON.stringify(all));
