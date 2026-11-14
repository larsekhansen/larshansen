import { LEVELS, play as P } from "./common.ts";
const { playMoves } = await import("../../src/game/bot.ts");
for (const id of ["nordmarka", "nabolaget"]) {
  const [, def, moves] = LEVELS.find((l) => l[0] === id)!;
  const p = P.newPlay(def, { pole: true });
  const r = playMoves(p, moves as any, { max: 60 * 300 });
  const ev = r.events;
  const wake = ev.findIndex((e: any) => e.troll === "wake" || e.boss === "wake");
  const end = ev.findIndex((e: any) => e.troll === "stone" || e.boss === "beaten");
  const rune = ev.findIndex((e: any) => e.rune);
  const marks = ev.flatMap((e: any, i: number) => (e.troll || e.boss ? [`${((i - wake) / 60).toFixed(1)}s ${e.troll ?? e.boss}`] : []));
  console.log(`${id}: fight from wake to beaten ${((end - wake) / 60).toFixed(1)} s, rune ${((rune - end) / 60).toFixed(1)} s later; level ${r.seconds.toFixed(1)} s\n   ${marks.join(", ")}`);
}
