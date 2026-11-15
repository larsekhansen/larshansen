// The sea serpent against more players than bosses.ts tries (line 2's review, 15 November 2026): the ten
// naive strategies again, then players who know part of the answer (the shield but not the stomp, the
// stomp but not the tail), a learner who does what each hint says once it has seen it, players who park
// on the prow or behind the bench, and Game over followed by the card's "Try again" (againAtBoss).
// From the serpent's bench, three lives, real rules, up to `seconds` (default 600) per strategy.
//
// Run: bun serpent2.ts [seconds=600] [only=name-substring]
import { LEVELS, play as P } from "./common.ts";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=") as [string, string]));
const SECONDS = Number(args.seconds ?? 600);
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false } as any;
const def = LEVELS.find((l) => l[0] === "gamlebyen")![1] as any;
const map = P.levelMap(def);
const bench = P.benchesOf(map).at(-1);
const cx = (p: any) => p.body.x + 5;
const S = (p: any) => p.boss.state;
const neck = (p: any) => S(p).def.points[S(p).at];
const up = (p: any) => ["rise", "rear", "spit"].includes(S(p).phase);
const T = 16;

type Strat = (p: any, n: number, s: any) => any;
interface Result { name: string; seconds: number; outcome: string; hits: number; hearts: number; lives: number; overs: number; hints: string[]; firstHint: number; byTail: number; byBall: number; still: number; hitTimes: number[] }

function run(name: string, strat: Strat): Result {
  const p = P.newPlay(def, { pole: true });
  P.placeBodyAt(p, bench.x, bench.bottom);
  p.save = { ...bench };
  p.checkpoints = { reached: P.flagsOf(map).length - 1 };
  const s: any = { hints: [] as string[] };
  const r: Result = { name, seconds: 0, outcome: "alive", hits: 0, hearts: 0, lives: 0, overs: 0, hints: [], firstHint: -1, byTail: 0, byBall: 0, still: 0, hitTimes: [] };
  let n = 0;
  for (; n < SECONDS * 60; n++) {
    const k = strat(p, n, s);
    const phase = S(p).phase;
    const tail = S(p).tail;
    const ev = P.stepPlay(p, k);
    if (!k.left && !k.right && !k.jumpHeld && p.body.onGround && Math.abs(p.body.vx) < 0.05) r.still++;
    if (ev.hurt) {
      r.hearts++;
      if (phase === "tail" || tail) r.byTail++;
      else r.byBall++;
      s.hurtBy = phase === "tail" || tail ? "tail" : "ball";
    }
    if (args.trace && n < Number(args.trace) * 60 && (ev.hurt || ev.boss || ev.blocked)) console.log(`  ${(n / 60).toFixed(2)} ${S(p).phase} neck ${(neck(p) / T).toFixed(1)} him ${(cx(p) / T).toFixed(1)} feet ${((p.body.y + 14) / T).toFixed(2)} ${ev.hurt ? "HURT" : ""} ${ev.boss ?? ""} ${ev.blocked ? "blocked" : ""}`);
    if (ev.lifeLost) r.lives++;
    if (ev.boss === "hit") { r.hits++; r.hitTimes.push(n / 60); }
    if (ev.boss && /^(miss|missHead|wake)$/.test(ev.boss)) {
      r.hints.push(`${(n / 60).toFixed(0)}:${ev.boss}`);
      s.hints.push(ev.boss);
      if (r.firstHint < 0 && ev.boss !== "wake") r.firstHint = n / 60;
    }
    if (ev.over) {
      r.overs++;
      if (r.overs === 1) r.outcome = `Game over at ${(n / 60).toFixed(0)} s`;
      // The card's "Try again": on from the bench, three lives, the serpent whole and asleep.
      P.againAtBoss(p);
      s.afterOver = true;
    }
    if (p.run.state === "done" || (S(p).phase === "beaten")) {
      r.outcome = (r.overs ? r.outcome + ", then " : "") + `beaten at ${(n / 60).toFixed(0)} s`;
      break;
    }
  }
  r.seconds = n / 60;
  return r;
}

let stuck = 0;
/** Toward x, hopping when stopped (as a person does). */
const toward = (p: any, x: number, extra: any = {}) => {
  const want = Math.abs(cx(p) - x) > 2;
  stuck = want && p.body.onGround && Math.abs(p.body.vx) < 0.05 ? stuck + 1 : 0;
  const hop = stuck === 4;
  return { ...NONE, left: cx(p) > x + 2, right: cx(p) < x - 2, ...extra, jumpHeld: hop || !!extra.jumpHeld || (!p.body.onGround && p.body.vy < 0), jumpPressed: hop || !!extra.jumpPressed };
};
const faceTo = (p: any, x: number) => ({ ...NONE, left: x < cx(p) && p.body.facing > 0, right: x > cx(p) && p.body.facing < 0 });
/** Shield up facing x (turning first if he faces the other way: the shield comes up again). */
const shieldTo = (p: any, x: number) => ({ ...NONE, left: x < cx(p) && p.body.facing > 0, right: x > cx(p) && p.body.facing < 0, shield: true });
/** The tail is within reach and coming at him. */
const tailNear = (p: any, d = 30) => {
  const st = S(p);
  if (st.phase !== "tail" || !st.tail || p.t - st.since < 60) return false;
  const dx = st.tail.x - cx(p);
  return Math.abs(dx) < d && dx * st.tail.dir < 0;
};
const jump = { jumpHeld: true, jumpPressed: true };
const IN = 248 * T + 8;
const MID = 259 * T;
/** Down onto the dazed head. */
const stompHead = (p: any) => {
  const st = S(p);
  const hx = st.def.points[st.at] + st.dir * 6;
  if (!p.body.onGround) {
    const aim = hx - p.body.vx * 7 - cx(p);
    return { ...NONE, left: aim < -2, right: aim > 2, jumpHeld: true };
  }
  const d = hx - cx(p);
  if (Math.abs(d) > 26) return { ...NONE, left: d < 0, right: d > 0 };
  return { ...NONE, left: d < -2, right: d > 2, ...jump };
};

const strategies: [string, Strat][] = [
  ["walk in, stand facing it", (p, n, s) => (!s.in && cx(p) < IN ? toward(p, IN) : ((s.in = true), faceTo(p, neck(p))))],
  ["hold right (hops when blocked)", (p) => toward(p, 99999)],
  ["hold right, jump whenever down", (p) => ({ ...NONE, right: true, ...(p.body.onGround ? jump : { jumpHeld: true }) })],
  ["walk in, jump in place", (p, n, s) => (!s.in && cx(p) < IN ? toward(p, IN) : ((s.in = true), { ...faceTo(p, neck(p)), jumpHeld: true, jumpPressed: p.body.onGround }))],
  ["middle, stand facing it", (p) => (Math.abs(cx(p) - MID) > 3 ? toward(p, MID) : faceTo(p, neck(p)))],
  ["middle, jump constantly", (p) => (Math.abs(cx(p) - MID) > 3 ? toward(p, MID) : { ...faceTo(p, neck(p)), jumpHeld: true, jumpPressed: p.body.onGround })],
  ["far right end of the quay (on the quay)", (p) => (Math.abs(cx(p) - 267 * T) > 3 ? toward(p, 267 * T) : faceTo(p, neck(p)))],
  ["run at it, jump when close", (p) => { const d = neck(p) - cx(p); const t = toward(p, neck(p)); return { ...t, jumpHeld: true, jumpPressed: t.jumpPressed || (p.body.onGround && Math.abs(d) < 60) }; }],
  ["dash at it whenever it is up", (p) => { const d = neck(p) - cx(p); const t = toward(p, neck(p)); return { ...t, dash: up(p) && Math.abs(d) < 60 && p.body.onGround, jumpPressed: t.jumpPressed || (p.body.onGround && Math.abs(d) < 40), jumpHeld: true }; }],
  // Players who know part of the answer.
  ["shield held all the time, facing it, never jumps", (p) => (cx(p) < IN ? toward(p, IN + 32) : shieldTo(p, neck(p)))],
  ["shield when it is up, jumps the tail, never stomps", (p) => (cx(p) < IN ? toward(p, IN + 32) : tailNear(p) ? { ...NONE, ...jump } : !p.body.onGround ? { ...NONE, jumpHeld: true } : up(p) ? shieldTo(p, neck(p)) : NONE)],
  ["shield when it is up, stomps, never jumps the tail", (p) => (cx(p) < IN ? toward(p, IN + 32) : S(p).phase === "dazed" || (!p.body.onGround && S(p).phase === "reel") ? stompHead(p) : up(p) ? shieldTo(p, neck(p)) : NONE)],
  ["shield facing right only (never turns)", (p) => (cx(p) < IN ? toward(p, IN + 8) : { ...NONE, shield: true })],
  // The learner: plain at first; after "the shield" hint, the shield as it rises; after "jump on its head", the stomp; after the tail has hurt it once, jumps the tail.
  ["learner: does what each hint says, once seen", (p, n, s) => {
    if (cx(p) < IN && !s.in) return toward(p, IN + 32);
    s.in = true;
    const knowsShield = s.hints.includes("miss");
    const knowsStomp = s.hints.includes("missHead");
    s.knowsTail ||= s.hurtBy === "tail";
    if (s.knowsTail && tailNear(p)) return { ...NONE, ...jump };
    if (knowsStomp && (S(p).phase === "dazed" || (!p.body.onGround && S(p).phase === "reel"))) return stompHead(p);
    if (!p.body.onGround) return { ...NONE, jumpHeld: true };
    if (knowsShield && up(p)) return shieldTo(p, neck(p));
    return faceTo(p, neck(p));
  }],
  ["learner who also keeps 5 tiles from the neck", (p, n, s) => {
    if (cx(p) < IN && !s.in) return toward(p, IN + 32);
    s.in = true;
    const knowsShield = s.hints.includes("miss");
    const knowsStomp = s.hints.includes("missHead");
    s.knowsTail ||= s.hurtBy === "tail";
    if (s.knowsTail && tailNear(p)) return { ...NONE, ...jump };
    if (knowsStomp && (S(p).phase === "dazed" || (!p.body.onGround && S(p).phase === "reel"))) return stompHead(p);
    if (!p.body.onGround) return { ...NONE, jumpHeld: true };
    if (knowsShield && up(p)) return shieldTo(p, neck(p));
    const d = neck(p) - cx(p);
    if (Math.abs(d) < 5 * T) { const away = d > 0 ? -1 : 1; const room = away < 0 ? cx(p) - 247 * T > 32 : 271 * T - cx(p) > 32; const go = room ? away : -away; return { ...NONE, left: go < 0, right: go > 0 }; }
    return faceTo(p, neck(p));
  }],
  ["knows everything (shield, stomp, tail)", (p, n, s) => {
    if (cx(p) < IN && !s.in) return toward(p, IN + 32);
    s.in = true;
    if (tailNear(p)) return { ...NONE, ...jump };
    if (S(p).phase === "dazed" || (!p.body.onGround && S(p).phase === "reel")) return stompHead(p);
    if (!p.body.onGround) return { ...NONE, jumpHeld: true };
    if (up(p)) return shieldTo(p, neck(p));
    return faceTo(p, neck(p));
  }],
  // Parked.
  ["wake it, then up on the prow", (p) => (cx(p) < 268 * T ? toward(p, 269 * T + 8) : NONE)],
  ["wake it, then back to the bench", (p, n, s) => { if (S(p).phase !== "asleep") s.woke = true; return s.woke ? toward(p, bench.x) : toward(p, IN + 16); }]
];

const only = args.only;
console.log(`From the serpent's bench (col ${Math.floor(bench.x / 16)}), three lives, ${SECONDS} s each; after Game over, "Try again" from the bench.`);
console.log("| strategy | outcome | hits (times, s) | hearts lost (ball / tail) | lives | Game overs | first hint (s) | hints said | standing still |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const [name, strat] of strategies) {
  if (only && !name.includes(only)) continue;
  stuck = 0;
  const r = run(name, strat);
  const said = r.hints.filter((h) => !h.endsWith("wake"));
  console.log(`| ${name} | ${r.outcome === "alive" ? `alive at ${r.seconds.toFixed(0)} s` : r.outcome} | ${r.hits}${r.hitTimes.length ? ` (${r.hitTimes.map((t) => t.toFixed(0)).join(", ")})` : ""} | ${r.hearts} (${r.byBall} / ${r.byTail}) | ${r.lives} | ${r.overs} | ${r.firstHint < 0 ? "–" : r.firstHint.toFixed(0)} | ${said.length}: ${said.slice(0, 6).join(" ")}${said.length > 6 ? " …" : ""} | ${((100 * r.still) / (r.seconds * 60)).toFixed(0)} % |`);
}
