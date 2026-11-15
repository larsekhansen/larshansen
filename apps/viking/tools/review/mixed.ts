// Gamlebyen's rising stones in mixed states (line 2's review, 15 November 2026). The tests search two
// worlds (every stone risen; none, from the start and from every flag). Here: the states the perfect route
// actually passes through (each time a stone starts to rise), every "all but one group" and "only one
// group" state, and the two walls behind him risen with nothing else. Each world is searched from the start,
// every flag and every bench, with the dead-end search of the tests (`deadEnds` in src/game/reach.ts).
// A dead spot counts only if no unrisen ledge stone could still rise from there (within six tiles across
// and seven rows of it): a ledge only adds ground, so a stone that would rise is a way out the static world
// does not have. A wall that rises behind him is never assumed: its states are enumerated.
//
// Run: bun mixed.ts [quick]
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { LEVELS, POLE, play as P } from "./common.ts";
const W = await import("../../src/game/reach.ts");
const G = await import("../../src/levels/gamlebyen.ts");
const def0 = G.GAMLEBYEN as any;
const STONES = G.STONES as { c: number; r: number; wall: boolean; behind: boolean }[];
const RISE = G.RISE;

/** Each stone's group: a wall behind him (by column) or a run of ledge stones (by row and first column). */
const groupOf = STONES.map((s) => {
  if (s.behind) return `wall ${s.c}`;
  let c0 = s.c;
  while (STONES.some((t) => t.r === s.r && t.c === c0 - 1 && !t.behind)) c0--;
  return `ledge ${c0},${s.r}`;
});
const GROUPS = [...new Set(groupOf)];

function world(up: Set<number>) {
  const rows = def0.map.map((row: string, r: number) =>
    [...row].map((ch, c) => {
      const i = STONES.findIndex((s) => s.c === c && s.r === r);
      if (i < 0) return ch;
      return up.has(i) ? (STONES[i].wall ? "R" : "=") : ".";
    }).join("")
  );
  return { ...def0, map: rows, risen: undefined };
}

const map0 = P.levelMap(def0);
const starts = [map0.spawn(), ...P.flagsOf(map0), ...P.benchesOf(map0)];
const boxes = [P.runeOf(map0)!];

/** Could an unrisen ledge stone still rise with him at this spot? */
const couldRise = (up: Set<number>, s: { x: number; feet: number }) => {
  const hx = s.x + PLAYER.w / 2;
  return STONES.some((st, i) => !st.wall && !up.has(i) && Math.abs(hx - (st.c * TILE + TILE / 2)) < RISE.near * TILE && Math.abs(s.feet - st.r * TILE) < RISE.up * TILE);
};

function check(name: string, up: Set<number>) {
  const def = world(up);
  const found: string[] = [];
  let spots = 0;
  const t0 = performance.now();
  for (const s of starts) {
    const r = W.search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole: true, graph: true });
    const d = W.deadEnds(r.graph!, true, [0]);
    spots += d.reached;
    const real = d.dead.filter((i: number) => !couldRise(up, r.spots[i]));
    if (real.length) found.push(`from col ${Math.floor(s.x / 16)}: ${W.describeSpots(real.map((i: number) => r.spots[i])).join("; ")}`);
  }
  console.log(`${name.padEnd(60)} ${String(spots).padStart(7)} spots, ${((performance.now() - t0) / 1000).toFixed(0)} s: ${found.length ? "DEAD ENDS " + found.join(" | ") : "no dead end"}`);
}

const all = new Set(STONES.map((_, i) => i));
const only = (g: string) => new Set(STONES.flatMap((_, i) => (groupOf[i] === g ? [i] : [])));
const without = (g: string) => new Set(STONES.flatMap((_, i) => (groupOf[i] === g ? [] : [i])));

console.log(`Gamlebyen: ${STONES.length} stones in ${GROUPS.length} groups (${GROUPS.join(", ")}); searched from ${starts.length} starts each.`);
check("every stone risen", all);
check("none risen", new Set());
check("both walls behind him risen, nothing else", new Set([...only("wall 93"), ...only("wall 176")]));
if (process.argv[2] !== "quick") {
  for (const g of GROUPS) check(`all but ${g}`, without(g));
  for (const g of GROUPS) check(`only ${g}`, only(g));
  // The states the perfect route passes through.
  const [, def, moves] = LEVELS.find((l) => l[0] === "gamlebyen")! as any;
  const p = P.newPlay(def, { pole: POLE.has("gamlebyen") });
  const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
  let m = 0, mem: any = { i: 0, air: false };
  const seen = new Set<string>();
  for (let n = 0; n < 60 * 300 && p.run.state !== "done"; n++) {
    let k: any = NONE;
    while (m < moves.length) { const r = moves[m].keys(p, mem); if (r === "done") { m++; mem = { i: 0, air: false }; continue; } mem.i++; k = r; break; }
    P.stepPlay(p, k);
    const st = p.grounds.state;
    const up = new Set<number>(st.up.flatMap((u: boolean, i: number) => (u ? [i] : [])));
    const key = [...up].join(",");
    if (!seen.has(key)) {
      seen.add(key);
      check(`route at col ${Math.floor((p.body.x + 5) / 16)} (${up.size} risen)`, up);
    }
  }
}
