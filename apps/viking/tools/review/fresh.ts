// The sloppy and hesitating players on fresh seeds (line 2's review, 15 November 2026).
// `sloppy.ts` always plays seeds 1..N, the same seeds the builders tuned against; this plays seeds
// first..first+N-1, so a level is measured on runs nobody has looked at.
//
// Run:  bun fresh.ts levels=gamlebyen,bjorvika ks=2,4 seeds=100 first=101 [hesitate=0.2] [lives=3] out=file.jsonl
import { LEVELS, POLE } from "./common.ts";
import { reference, sloppyRun, type RunResult } from "./sloppy.ts";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=") as [string, string]));
const ids = args.levels && args.levels !== "all" ? args.levels.split(",") : LEVELS.map((l) => l[0]);
const ks = (args.ks ?? "2,4").split(",").map(Number);
const seeds = Number(args.seeds ?? 100);
const first = Number(args.first ?? 101);
const hesitate = Number(args.hesitate ?? 0);
const lives = args.lives ? Number(args.lives) : undefined;
const lines: string[] = [];
for (const [id, def, moves] of LEVELS) {
  if (!ids.includes(id)) continue;
  const pole = POLE.has(id);
  const ref = reference(def, moves as any[], pole);
  for (const k of ks) {
    const runs: RunResult[] = [];
    for (let seed = first; seed < first + seeds; seed++) {
      const r = sloppyRun(id, def, moves as any[], ref, { k, drop: 0, overhold: 0, seed, pole, hesitate, lives });
      (r as any).hesitate = hesitate;
      runs.push(r);
      lines.push(JSON.stringify(r));
    }
    const n = runs.length;
    const c = (o: string) => runs.filter((x) => x.outcome === o).length;
    const hearts = runs.reduce((a, x) => a + x.hurts.length, 0) / n;
    console.error(`${id} k=${k}${hesitate ? " hesitating" : ""}: clear ${c("clear")}/${n}, over ${c("over")}, offroute ${c("offroute")}, gaveup ${c("gaveup")}, timeout ${c("timeout")}; hearts ${hearts.toFixed(2)}/run`);
  }
}
if (args.out) await Bun.write(args.out, lines.join("\n") + "\n");
