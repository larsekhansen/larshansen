// Stretches of a level with nothing that can hurt or that moves: no enemy, no water or pit column, no moving ground, no ledge on a beat, no zone or hazard.
import { LEVELS, play as P } from "./common.ts";
const { carrierAt, carrierPeriod } = await import("../../../../packages/pixelkit/src/carrier.ts");
for (const [id, def] of LEVELS) {
  const map = P.levelMap(def);
  const busy = new Array(map.cols).fill(0);
  const mark = (c0: number, c1: number) => { for (let c = Math.max(0, Math.floor(c0)); c <= Math.min(map.cols - 1, Math.ceil(c1)); c++) busy[c]++; };
  for (const e of def.enemies ?? []) mark(e.c - (e.range ?? 0) - (e.kind === "thrower" ? 4 : 0), e.c + (e.range ?? 0) + (e.kind === "thrower" ? 4 : 0));
  for (const d of def.carriers) { const per = Math.min(carrierPeriod(d), 3000); let lo = Infinity, hi = -Infinity; for (let t = 0; t < per; t += 7) { const a = carrierAt(d, t); lo = Math.min(lo, a.x); hi = Math.max(hi, a.x + d.w); } mark(lo / 16, hi / 16); }
  for (const l of def.timed) mark(l.x / 16, (l.x + l.w) / 16);
  for (const z of def.zones ?? []) mark(z.x / 16, (z.x + z.w) / 16);
  for (const h of def.hazards ?? []) mark(h.x / 16, (h.x + h.w) / 16);
  for (const c of P.cannonsOf(def, map)) mark(c.x / 16, (c.x + c.w) / 16);
  // a column with water anywhere or open to the bottom: a pit
  for (let c = 0; c < map.cols; c++) { let pit = true; for (let r = 0; r < map.rows; r++) { if (map.isWater(c, r)) { busy[c]++; pit = false; break; } if (map.isSolid(c, r) || map.isOneWay(c, r)) { pit = false; break; } } if (pit) busy[c]++; }
  if (def.troll) mark(def.troll.x0 / 16, def.troll.x1 / 16);
  const runs: string[] = [];
  let s = -1;
  for (let c = 0; c <= map.cols; c++) {
    const q = c < map.cols && busy[c] === 0;
    if (q && s < 0) s = c;
    if (!q && s >= 0) { if (c - s >= 15) runs.push(`cols ${s}-${c - 1} (${c - s})`); s = -1; }
  }
  console.log(`${id}: quiet stretches of 15+ columns: ${runs.join(", ") || "none"}`);
}
