// The shield where it can surprise (line 2's review, 15 November 2026): line 1's bosses for a player who
// has it (a replay after Bygdøy), a swan held at the shield, the shield on ice, during a dash, on a
// sinking pad, on a hook and on the sledge. Real rules, made-up keys. Run: bun shieldcases.ts
import { TILE } from "@larshansen/pixelkit/config";
import { LEVELS, play as P } from "./common.ts";
const NONE: any = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const cx = (p: any) => p.body.x + 5;
const lvl = (id: string) => LEVELS.find((l) => l[0] === id)! as any;

/** From the bench before a boss, with the shield, three lives. */
function boss(id: string, name: string, strat: (p: any, n: number, s: any) => any, seconds = 300) {
  const [, def] = lvl(id);
  const map = P.levelMap(def);
  const bench = P.benchesOf(map).at(-1);
  const p = P.newPlay(def, { pole: true, hasShield: true });
  P.placeBodyAt(p, bench.x, bench.bottom);
  p.save = { ...bench };
  p.checkpoints = { reached: P.flagsOf(map).length - 1 };
  let hearts = 0, hits = 0, blocked = 0, n = 0, over = false;
  const said = new Map<string, number>();
  const s: any = {};
  for (; n < seconds * 60; n++) {
    const ev = P.stepPlay(p, strat(p, n, s));
    if (ev.hurt) hearts++;
    if (ev.blocked) blocked++;
    const e = ev.troll ?? ev.boss;
    if (e) said.set(e, (said.get(e) ?? 0) + 1);
    if (ev.troll === "hit" || ev.boss === "hit") hits++;
    if (ev.over) { over = true; break; }
    if (p.run.state === "done") break;
  }
  const b = p.troll ? `${p.troll.phase} ${p.troll.hits}` : `${p.boss.state.phase} ${p.boss.state.hits}`;
  console.log(`  ${id} ${name}: ${(n / 60).toFixed(0)} s, ${over ? "GAME OVER" : "alive"}, hearts lost ${hearts}, shield blocks ${blocked}, hits ${hits}, boss ${b}; events ${[...said].map(([k, v]) => `${k} ${v}`).join(", ")}`);
}
const bossX = (p: any) => (p.troll ? p.troll.x : p.boss.state.x);
let stuck = 0;
/** Toward x, hopping when stopped (as bosses.ts's players do). */
const toward = (p: any, x: number, extra: any = {}) => {
  const want = Math.abs(cx(p) - x) > 2;
  stuck = want && p.body.onGround && Math.abs(p.body.vx) < 0.05 ? stuck + 1 : 0;
  const hop = stuck === 4;
  return { ...NONE, left: cx(p) > x + 2, right: cx(p) < x - 2, ...extra, jumpHeld: hop || (!p.body.onGround && p.body.vy < 0), jumpPressed: hop };
};
const face = (p: any, x: number) => ({ left: x < cx(p) && p.body.facing > 0, right: x > cx(p) && p.body.facing < 0 });

console.log("Line 1's bosses with the shield (a replay after Bygdøy is cleared):");
const ARENA: any = { nordmarka: { in: 199 * 16 + 8, mid: 212 * 16 }, nabolaget: { in: 167 * 16, mid: 190 * 16 } };
for (const id of ["nordmarka", "nabolaget"]) {
  const a = ARENA[id];
  boss(id, "walk in, then the shield up facing it for good", (p, n, s) => (!s.in && cx(p) < a.in ? toward(p, a.in + 4) : ((s.in = true), { ...NONE, ...face(p, bossX(p)), shield: true })));
  boss(id, "middle of the arena, the shield up facing it", (p) => (Math.abs(cx(p) - a.mid) > 3 ? toward(p, a.mid) : { ...NONE, ...face(p, bossX(p)), shield: true }));
  boss(id, "middle, shield up, jumps whenever it is not coming", (p, n) => (Math.abs(cx(p) - a.mid) > 3 ? toward(p, a.mid) : n % 90 < 10 ? { ...NONE, jumpHeld: true, jumpPressed: n % 90 === 0 } : { ...NONE, ...face(p, bossX(p)), shield: true }));
  boss(id, "middle, NO shield, stands facing it (for comparison)", (p) => (Math.abs(cx(p) - a.mid) > 3 ? toward(p, a.mid) : { ...NONE, ...face(p, bossX(p)) }));
}

// A swan held at the shield: on the first swan's near shore, the shield up facing the water.
{
  console.log("\nØstensjøvannet, the first swan's near shore (cols 56-62), standing still:");
  const [, def] = lvl("ostensjovannet");
  for (const [label, x, sh] of [["at col 61, no shield", 61 * TILE + 8, false], ["at the shore's edge (his middle at x 1007), no shield", 1007, false], ["on the first pad (x 1020), the shield up facing the water", 1020, true]] as const) {
    const p = P.newPlay(def, { pole: true, hasShield: true });
    P.placeBodyAt(p, x, 20 * TILE);
    p.save = { x, bottom: 20 * TILE };
    let hurt = -1, blocked = 0;
    const swan = p.enemies.find((e: any) => e.def.look === "swan");
    for (let n = 0; n < 60 * 20; n++) {
      const ev = P.stepPlay(p, n < 2 ? { ...NONE, right: true } : { ...NONE, shield: sh });
      if (ev.blocked) blocked++;
      if (ev.hurt && hurt < 0) hurt = n;
    }
    console.log(`  ${label}: ${hurt < 0 ? "never hurt in 20 s" : `hurt after ${(hurt / 60).toFixed(1)} s`}; shield blocks ${blocked}; swan n=${swan.n}, x=${(swan.x / 16).toFixed(1)}`);
  }
}

// The shield on ice: Holmenkollen's first icy steps, running onto the ice and holding down.
{
  console.log("\nThe shield on ice and during a dash:");
  const [, def] = lvl("holmenkollen");
  const map = P.levelMap(def);
  const p = P.newPlay(def, { pole: true, hasShield: true });
  // Find the first ice: run along until the surface is ice.
  P.placeBodyAt(p, 60 * TILE, map.surfaceBelow(60 * TILE, 0));
  let n = 0, x0 = 0, raisedAt = -1;
  for (; n < 400; n++) {
    const surf = def.surfaceAt ? def.surfaceAt(p.body.x + 5, p.body.y + 14, p.t) : null;
    const onIce = surf && p.body.onGround && (surf.kind === "ice" || surf === "ice" || surf.grip !== undefined);
    if (onIce && raisedAt < 0) { raisedAt = n; x0 = cx(p); }
    P.stepPlay(p, raisedAt < 0 ? { ...NONE, right: true } : { ...NONE, shield: true });
    if (raisedAt >= 0 && n - raisedAt > 120) break;
  }
  console.log(raisedAt < 0 ? "  (no ice found from col 60)" : `  ran onto the ice at col ${(x0 / 16).toFixed(1)} and held down: 2 s later at col ${(cx(p) / 16).toFixed(1)}, shield raise ${p.shield.raise}, vx ${p.body.vx.toFixed(2)}`);
  // Dash on flat ground, then hold down while the dash runs.
  const [, def2] = lvl("akerselva");
  const q = P.newPlay(def2, { pole: true, hasShield: true });
  const m2 = P.levelMap(def2);
  P.placeBodyAt(q, 8 * TILE, m2.surfaceBelow(8 * TILE, 0));
  for (let i = 0; i < 30; i++) P.stepPlay(q, NONE);
  const start = cx(q);
  let upDuringDash = 0;
  for (let i = 0; i < 20; i++) {
    P.stepPlay(q, i === 0 ? { ...NONE, right: true, dash: true } : { ...NONE, shield: i > 1 });
    if (q.dash && q.shield.raise >= 6) upDuringDash++;
  }
  console.log(`  a ground dash with down pressed after its first step: moved ${((cx(q) - start) / 16).toFixed(1)} tiles; steps with the shield up while the dash still carried him: ${upDuringDash}`);
}

// The sledge: down held from the top of the run to Midtstuen: is it a duck all the way, and what is up at the end?
{
  console.log("\nThe sledge with down held all the way, then at Midtstuen:");
  const [, def] = lvl("korketrekkeren");
  const p = P.newPlay(def, { pole: true, hasShield: true });
  const map = P.levelMap(def);
  P.placeBodyAt(p, 32 * TILE, map.surfaceBelow(32 * TILE, 0));
  let ducked = 0, riding = 0, raisedOnSledge = 0, hurt = 0, n = 0;
  for (; n < 60 * 90; n++) {
    const ev = P.stepPlay(p, { ...NONE, right: !p.riding, shield: p.riding || cx(p) > 249 * TILE });
    if (ev.hurt) hurt++;
    if (p.riding) { riding++; if (p.ducking) ducked++; if (p.shield.raise > 0) raisedOnSledge++; }
    if (cx(p) > 252 * TILE && p.body.onGround && !p.riding) break;
  }
  console.log(`  rode ${(riding / 60).toFixed(1)} s, ducking ${(ducked / 60).toFixed(1)} s, shield raised on the sledge ${raisedOnSledge} steps; hearts lost ${hurt}; off at col ${(cx(p) / 16).toFixed(1)}, shield raise now ${p.shield.raise} (up the step after he leaves the sledge if down is still held)`);
}
