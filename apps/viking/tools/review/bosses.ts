// The two bosses against naive strategies, from the bench before each, with three lives, through the real rules.
import { LEVELS, play as P } from "./common.ts";
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
type Strat = (p: any, n: number, s: any) => any;
const cx = (p: any) => p.body.x + 5;
function run(id: string, name: string, strat: Strat, seconds = 300) {
  const def = LEVELS.find((l) => l[0] === id)![1];
  const map = P.levelMap(def);
  const bench = P.benchesOf(map).at(-1);
  const p = P.newPlay(def, { pole: true });
  P.placeBodyAt(p, bench.x, bench.bottom);
  p.save = { ...bench };
  p.checkpoints = { reached: P.flagsOf(map).length - 1 };
  const s: any = {};
  let hearts = 0, lives = 0, hits = 0, firstHit = -1;
  const ev0: string[] = [];
  let n = 0;
  for (; n < seconds * 60; n++) {
    const ev = P.stepPlay(p, strat(p, n, s));
    if (ev.hurt) hearts++;
    if (ev.lifeLost) lives++;
    if (ev.troll === "hit" || ev.boss === "hit") { hits++; if (firstHit < 0) firstHit = n; }
    if (ev.over) { ev0.push("GAME OVER"); break; }
    if (p.run.state === "done") { ev0.push("RUNE"); break; }
    if (p.runeAt === null && P.runeFree(p) && !ev0.includes("free")) ev0.push(`free@${(n / 60).toFixed(0)}s`);
  }
  const boss = p.troll ? `${p.troll.phase} hits ${p.troll.hits}` : `${p.boss.state.phase} hits ${p.boss.state.hits}`;
  console.log(`${id.padEnd(9)} ${name.padEnd(38)} ${(n / 60).toFixed(0).padStart(4)} s  boss ${boss.padEnd(16)} hits ${hits} (first ${firstHit < 0 ? "-" : (firstHit / 60).toFixed(0) + "s"}), hearts lost ${hearts}, lives lost ${lives} ${ev0.join(" ")}`);
}
/** Toward x, hopping over whatever stops him (as a person does): a full jump after a few steps stuck. */
let stuckFor = 0;
let hopping = false;
const toward = (p: any, x: number, extra: any = {}) => {
  const want = Math.abs(cx(p) - x) > 2;
  stuckFor = want && p.body.onGround && Math.abs(p.body.vx) < 0.05 ? stuckFor + 1 : 0;
  const hop = stuckFor === 4;
  if (hop) hopping = true;
  if (p.body.onGround && !hop) hopping = false;
  return { ...NONE, left: cx(p) > x + 2, right: cx(p) < x - 2, ...extra, jumpHeld: hop || hopping || !!extra.jumpHeld, jumpPressed: hop || !!extra.jumpPressed };
};
const faceTo = (p: any, x: number) => ({ ...NONE, left: x < cx(p) && p.body.facing > 0, right: x > cx(p) && p.body.facing < 0 });
for (const id of ["nordmarka", "nabolaget"]) {
  const arena = id === "nordmarka" ? { in: 199 * 16 + 8, mid: 212 * 16, left: 200 * 16 + 6, right: 225 * 16 - 6 } : { in: 167 * 16, mid: 190 * 16, left: 175 * 16 + 8, right: 222 * 16 };
  const bossX = (p: any) => (p.troll ? p.troll.x : p.boss.state.x);
  run(id, "walk in, then stand still facing it", (p, n, s) => (!s.in && cx(p) < arena.in ? toward(p, arena.in + 4) : ((s.in = true), faceTo(p, bossX(p)))));
  run(id, "hold right all the time (hops when blocked)", (p) => toward(p, 99999));
  run(id, "hold right, jump whenever down", (p) => ({ ...NONE, right: true, jumpHeld: true, jumpPressed: p.body.onGround }));
  run(id, "walk in, then stand still (any facing)", (p, n, s) => (s.in || cx(p) >= arena.in ? ((s.in = true), NONE) : toward(p, arena.in + 4)));
  run(id, "walk in, jump in place facing it", (p, n, s) => (!s.in && cx(p) < arena.in ? toward(p, arena.in + 4) : ((s.in = true), { ...faceTo(p, bossX(p)), jumpHeld: true, jumpPressed: p.body.onGround })));
  run(id, "go to the middle, stand facing it", (p) => (Math.abs(cx(p) - arena.mid) > 3 ? toward(p, arena.mid) : faceTo(p, bossX(p))));
  run(id, "go to the middle, jump constantly", (p) => (Math.abs(cx(p) - arena.mid) > 3 ? toward(p, arena.mid, { jumpHeld: true, jumpPressed: p.body.onGround }) : { ...faceTo(p, bossX(p)), jumpHeld: true, jumpPressed: p.body.onGround }));
  run(id, "wake it, hide at the left edge facing it", (p, n, s) => { if (!s.woke && (p.troll ? p.troll.phase !== "asleep" : p.boss.state.phase !== "parked")) s.woke = true; return s.woke ? (Math.abs(cx(p) - arena.left) > 3 ? toward(p, arena.left) : faceTo(p, bossX(p))) : toward(p, arena.in + 40); });
  run(id, "run to the far right edge, stand facing it", (p) => (Math.abs(cx(p) - arena.right) > 3 ? toward(p, arena.right, { jumpHeld: true, jumpPressed: p.body.onGround && Math.abs(p.body.vx) < 0.1 }) : faceTo(p, bossX(p))));
  run(id, "run at it, jump when close (stomp-minded)", (p) => { const d = bossX(p) - cx(p); const t = toward(p, bossX(p)); return { ...t, jumpHeld: true, jumpPressed: t.jumpPressed || (p.body.onGround && Math.abs(d) < 60) }; });
}
