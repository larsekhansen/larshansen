// The perfect route's waits: every stretch of a second or more standing still with no key held, where, and on what move.
import { LEVELS, POLE, play as P } from "./common.ts";
const { playMoves } = await import("../../src/game/bot.ts");
const { THROW_REACH } = await import("../../src/game/enemies.ts");
for (const [id, def, moves] of LEVELS) {
  const p = P.newPlay(def, { pole: POLE.has(id) });
  // record by wrapping each move's keys
  let cur = "";
  const wrapped = (moves as any[]).map((m) => ({ name: m.name, keys: (q: any, s: any) => { cur = m.name; return m.keys(q, s); } }));
  const segs: { from: number; to: number; x: number; feet: number; move: string; riding: boolean }[] = [];
  let run: any = null;
  let idleTotal = 0, rideStill = 0;
  const throwers = (def.enemies ?? []).map((e: any, i: number) => ({ e, i })).filter((o: any) => o.e.kind === "thrower");
  let nearThrowerIdle = new Map<number, number>();
  const r = playMoves(p, [{ name: "probe", keys: () => "done" }, ...wrapped.map((m: any) => ({ name: m.name, keys: (q: any, s: any) => { const k = m.keys(q, s); if (k !== "done") { const still = !k.left && !k.right && !k.jumpHeld && q.body.onGround && Math.abs(q.body.vx) < 0.05; const x = q.body.x + 5, f = q.body.y + 14; if (still) { idleTotal++; if (!run) run = { from: q.t, x, feet: f, move: m.name, riding: !q.map.supports(q.body) }; for (const o of throwers) { const e = q.enemies[o.i]; if (e.alive && Math.abs(x - e.x) < THROW_REACH.x && Math.abs(q.body.y - e.y) < THROW_REACH.y) nearThrowerIdle.set(o.e.c, (nearThrowerIdle.get(o.e.c) ?? 0) + 1); } } else if (run) { run.to = q.t; segs.push(run); run = null; } } return k; } }))], { max: 60 * 300 });
  const long = segs.filter((s) => s.to - s.from >= 60);
  const fmt = (s: any) => `${((s.to - s.from) / 60).toFixed(1)}s @col ${Math.floor(s.x / 16)} row ${(s.feet / 16).toFixed(0)}${s.riding ? " (riding)" : ""} [${s.move}]`;
  console.log(`${id}: clear ${r.seconds.toFixed(1)} s; standing still ${(idleTotal / 60).toFixed(1)} s (${(100 * idleTotal / (r.seconds * 60)).toFixed(0)}%); waits >=1 s: ${long.length}, >3 s: ${long.filter((s) => s.to - s.from > 180).length}`);
  for (const s of long.sort((a, b) => b.to - b.from - (a.to - a.from)).slice(0, 8)) console.log("   " + fmt(s));
  if (nearThrowerIdle.size) console.log("   standing still within a thrower's reach: " + [...nearThrowerIdle].map(([c, n]) => `thrower@${c}: ${(n / 60).toFixed(1)} s`).join(", "));
}
