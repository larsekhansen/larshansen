import { LEVELS, play as P } from "./common.ts";
const out: string[] = [];
const n = Number(process.argv[2] ?? 6);
for (const [id, def] of LEVELS) {
  const map = P.levelMap(def);
  const xs: number[] = [];
  for (let k = 0; k < n; k++) {
    let c = Math.round(((k + 0.5) / n) * map.cols);
    for (let d = 0; d < 20; d++) { const x = (c + d) * 16 + 8; if (map.surfaceBelow(x, 0) !== null) { xs.push(x); break; } }
  }
  for (const x of xs) out.push(`http://localhost:5181/viking/?debug&steps=2&level=${id}&x=${x}`);
}
console.log(out.join(" "));
