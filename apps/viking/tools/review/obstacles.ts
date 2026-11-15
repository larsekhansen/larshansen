// Every move of each route on its own (order 17: whatever it is called; the review of line 2 found that
// this tool only tried moves named jump or leap, so the stepping stones "onto the stepping stone at ..."
// were never measured). From the perfect run's exact state where the move before it starts (the walk up to
// the edge), the sloppy player plays that walk and the move with timing errors of +-k steps, on seeds
// nobody tuned against, and the move counts as made when he ends it where the perfect run did, with no
// heart lost. A move is marked "over" when the perfect run is in the air over water or a pit during it:
// those are the places held to 0.4 hearts a try. The numbers do not depend on how the sloppy player
// recovers from a mistake. Walks, waits, sitting and the stones' rising are not tried (they are the
// approach to the next move, which is).
//
// Run: bun obstacles.ts [levels=all] [ks=2,4] [seeds=40] [only=<name substring>]   (writes out/obstacles-<level|all>.json)
import { LEVELS, POLE, play as P } from "./common.ts";
import { clonePlay, reference, sloppyRun } from "./sloppy.ts";
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=") as [string, string]));
const ids = args.levels && args.levels !== "all" ? args.levels.split(",") : LEVELS.map((l) => l[0]);
const ks = (args.ks ?? "2,4").split(",").map(Number);
const seeds = Number(args.seeds ?? 40);
const CAP = 0.4;
const tried = (name: string) => !/^(walk to|sit|the stone at|wait|up on the|on the .* to the far end|the .* at this end|the hoist|the welder|.* as they meet|on the third hook to|the dawn)/.test(name) && (!args.only || name.includes(args.only));
const all: any[] = [];
for (const [id, def, moves] of LEVELS) {
  if (!ids.includes(id)) continue;
  const pole = POLE.has(id);
  const ref = reference(def, moves as any, pole);
  const map = P.levelMap(def);
  const gapAt = (c: number, top: number) => {
    for (let r = top; r < map.rows; r++) {
      if (def.legend.water.includes(map.tileAt(c, r))) return true;
      if (map.isSolid(c, r) || map.isOneWay(c, r)) return false;
    }
    return true;
  };
  // Snapshots of the perfect run at the first step of every move, and which moves go over a gap.
  const p = P.newPlay(def, { pole });
  p.sheep.forEach((s: any, i: number) => { const f: any = () => { f.s = (f.s * 16807) % 2147483647; return f.s / 2147483647; }; f.s = 101 + i * 37; s.rnd = f; });
  let m = 0, mem: any = { i: 0, air: false };
  const snap = new Map<number, { play: any; mem: any }>();
  const over = new Set<number>();
  let last: { x: number; bottom: number } | null = null, from: { x: number; bottom: number } | null = null, fromM = 0;
  for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
    let k: any = NONE;
    while (m < (moves as any).length) {
      if (!snap.has(m)) snap.set(m, { play: clonePlay(p), mem: { ...mem } });
      const r = (moves as any)[m].keys(p, mem);
      if (r === "done") { m++; mem = { i: 0, air: false }; continue; }
      mem.i++; k = r; break;
    }
    const here = { x: p.body.x + 5, bottom: p.body.y + 14 };
    if (p.body.onGround) {
      if (from && !p.riding) {
        const top = Math.floor(Math.min(from.bottom, here.bottom) / 16);
        for (let c = Math.floor(Math.min(from.x, here.x) / 16); c <= Math.floor(Math.max(from.x, here.x) / 16); c++) if (gapAt(c, top)) over.add(fromM);
      }
      from = null;
      last = here;
    } else if (!from && last) {
      from = last;
      fromM = m;
    }
    P.stepPlay(p, k);
  }
  for (let mi = 0; mi < (moves as any).length; mi++) {
    const mv = (moves as any)[mi];
    if (!tried(mv.name) || !snap.has(mi) || !ref.endOf.get(mi)) continue;
    // Start at the walk before it, if there is one.
    const start = mi > 0 && /^walk/.test((moves as any)[mi - 1].name) ? mi - 1 : mi;
    const end = ref.endOf.get(mi);
    const s0 = snap.get(start)!;
    const startX = s0.play.body.x + 5;
    const row: any = { id, m: mi, name: mv.name, col: Math.floor(startX / 16), endCol: end ? Math.floor(end.x / 16) : null, over: over.has(mi), boss: /serpent|troll|plough/.test(mv.name) };
    for (const k of ks) {
      let ok = 0, hearts = 0, falls = 0;
      for (let seed = 1; seed <= seeds; seed++) {
        const r = sloppyRun(id, def, moves as any, ref, { k, drop: 0, overhold: 0, seed: 7000 + seed * 101 + mi, pole, startPlay: clonePlay(s0.play), startA: { m: start, mem: { i: 0, air: false } }, stopAt: mi + 1, max: row.boss ? 60 * 240 : 60 * 30 });
        if (r.outcome === "clear" && r.hurts.length === 0) ok++;
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
  const K = ks[ks.length - 1];
  const capped = rows.filter((r) => r.over && !r.boss && r[`hearts${K}`] > CAP);
  console.log(`${id}: ${rows.length} moves (${rows.filter((r) => r.over).length} over water or a pit); expected hearts lost on them: ${ks.map((k) => `±${k} ${rows.reduce((a, r) => a + r[`hearts${k}`], 0).toFixed(2)}`).join(", ")}; over ${CAP} a try at ±${K} (over a drop or water, not a boss): ${capped.length ? capped.map((r) => `"${r.name}" ${r[`hearts${K}`].toFixed(2)}`).join(", ") : "none"}`);
  for (const r of [...rows].sort((a, b) => b[`hearts${K}`] - a[`hearts${K}`]).slice(0, 8))
    console.log(`   col ${r.col}->${r.endCol} ${r.over ? "over " : "     "}${r.name.slice(0, 56).padEnd(56)} ${ks.map((k) => `±${k}: ${r[`hearts${k}`].toFixed(2)} hearts a try (${(100 * r[`fall${k}`]).toFixed(0)}% a fall)`).join("; ")}`);
}
await Bun.write(`out/obstacles-${ids.length === 1 ? ids[0] : "all"}.json`, JSON.stringify(all));
