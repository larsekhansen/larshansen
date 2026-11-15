// The sloppy player: the levels' own scripted routes (apps/viking/src/levels/routes), played through
// the real rules (game/play.ts), with a human's timing errors laid over every key.
//
// How the perturbation works. The routes are closed-loop: each step a move looks at the level and
// says which keys it wants. The sloppy player runs that same route, but every *edge* of a key (the
// direction changing, the jump key going down or up, the dash) reaches the game shifted by a random
// offset in [-k, +k] steps. Late edges are a delay; early edges come from a look-ahead: each step
// the level and the route are cloned and played k steps ahead with perfect keys, so the player can
// press "before the bot would". Optionally a jump press is dropped (`drop`, the key not pressed at
// all) or a release of a direction is held too long (`overhold`, an extra 1..2k steps).
//
// After a fall or a lost life he is put back by the rules (flag, bench, last firm ground, start);
// the route is then resumed from the move the perfect run was on at that place. When a move ends
// with him on a different floor than the perfect run (a fall that cost no heart), the route is
// re-synchronised to the nearest place the perfect run stood, so he climbs back as a person would.
//
// The hesitating player (`hesitate=0.2`): the same, but before a share of its moves (seeded) it stands
// still 0.5 to 1.5 s first, as a person who stops to look does. Only where a person would: on the
// ground, not while a raft or a hook carries him, and not right after a move that only stood and
// waited for something (that wait was the timing; a pause after it would be a different plan).
//
// Run:   bun /path/to/sloppy.ts [levels=all|id,id] [ks=0,2,4,8] [seeds=30] [drop=0] [overhold=0] [hesitate=0] [out=file.jsonl]
// e.g.   bun sloppy.ts levels=radhuset ks=4 seeds=20
// Output: one JSON line per run (to out=, default stdout) and a summary table per level and k.

import { LEVELS, POLE, bot as BOT, play as P } from "./common.ts";

const { newPlay, stepPlay } = P;
const { enemyBox, shotBox } = await import("../../src/game/enemies.ts");
const { trollHurts } = await import("../../src/game/troll.ts");

type Intent = { left: boolean; right: boolean; jumpHeld: boolean; jumpPressed: boolean; sit?: boolean; dash?: boolean; shield?: boolean };
const NONE: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const PW = 10;
const PH = 14;
/** The view used for "was it on screen": 1920x1080 at k=5 is 385 x 207 art pixels. */
export const VIEW = { w: 385, h: 207, ahead: 22 };

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The sheep's own generator, as an object whose state can be copied (the game's is a closure). */
function sheepRng(seed: number) {
  const f: any = () => {
    f.s = (f.s * 16807) % 2147483647;
    return f.s / 2147483647;
  };
  f.s = seed;
  return f;
}
function fixSheep(p: any) {
  p.sheep.forEach((s: any, i: number) => (s.rnd = sheepRng(101 + i * 37)));
}

export function clonePlay(p: any): any {
  return {
    ...p,
    body: { ...p.body },
    run: { ...p.run },
    checkpoints: { ...p.checkpoints },
    raisedAt: [...p.raisedAt],
    save: p.save && { ...p.save },
    loaded: p.loaded && { ...p.loaded },
    firedAt: [...p.firedAt],
    drummedAt: [...p.drummedAt],
    rune: p.rune && { ...p.rune },
    sheep: p.sheep.map((s: any) => ({ ...s, rnd: sheepRng(s.rnd.s) })),
    lastGround: { ...p.lastGround },
    enemies: p.enemies.map((e: any) => ({ ...e })),
    shots: p.shots.map((s: any) => ({ ...s })),
    sitting: p.sitting && { ...p.sitting },
    skilling: p.skilling.map((s: any) => ({ box: s.box, at: s.at })),
    chain: { ...p.chain },
    cheese: p.cheese && { ...p.cheese },
    dash: p.dash && { ...p.dash },
    troll: p.troll && { ...p.troll, wave: p.troll.wave && { ...p.troll.wave } },
    // Deep: the serpent's ball and tail are objects of their own, and a shallow copy let the look-ahead
    // move the real run's ball and tail k steps further every step (fixed for order 17).
    boss: p.boss && { rules: p.boss.rules, state: structuredClone(p.boss.state) },
    shield: p.shield && { ...p.shield },
    grounds: p.grounds && { rules: p.grounds.rules, state: structuredClone(p.grounds.state) }
  };
}

interface Auto {
  m: number;
  mem: any;
  /** A walk to where the perfect run stood, first, after he was put back or re-synchronised elsewhere. */
  pre?: { move: any; mem: any };
  /** Steps the hesitating player still stands before it goes on. */
  hold?: number;
}
/** A person's walks (any run with timing errors or held keys, never the perfect run): see `personWalk`. */
let lenient = false;
/** The hesitating player's share of moves it stops before, and its seed. */
export interface Hesitate {
  share: number;
  seed: number;
}
/** Riding something of the level's that moves on its own (a raft, a hook, a lift): no time to stop and look. */
const ridingCarrier = (p: any) =>
  p.body.onGround &&
  p.def.carriers.some((d: any) => {
    const c = BOT.carrier(p, d);
    return Math.abs(p.body.y + PH - c.y) < 0.01 && p.body.x + PW > c.x && p.body.x < c.x + d.w;
  });
/**
 * A walk as a person ends it (order 17, the review's A5): the route's walk is done only within 2 px of
 * its mark and at rest, so a direction held a little too long overshoots, turns, overshoots again, for
 * ever (the "mistakes" profile timed out at walks with no heart lost). A person who has turned back once
 * is done within 4 px; and a walk that has carried him onto the sledge, which he cannot steer, is over.
 */
function personWalk(move: any, p: any, mem: any, k: any): any {
  const at = /^walk to (-?[\d.]+)$/.exec(move.name);
  if (!at || k === "done") return k;
  if (p.riding) return "done";
  const d = k.left ? -1 : k.right ? 1 : 0;
  if (d && mem.wd && d !== mem.wd) mem.turned = true;
  if (d) mem.wd = d;
  return mem.turned && p.body.onGround && Math.abs(Number(at[1]) - cx(p)) <= 4 ? "done" : k;
}

function botKeys(moves: any[], p: any, A: Auto, hes?: Hesitate): Intent {
  if (A.hold) {
    A.hold--;
    return NONE;
  }
  if (A.pre) {
    let k = A.pre.move.keys(p, A.pre.mem);
    if (lenient) k = personWalk(A.pre.move, p, A.pre.mem, k);
    if (k !== "done" && A.pre.mem.i < 600) {
      A.pre.mem.i++;
      return k;
    }
    A.pre = undefined;
  }
  while (A.m < moves.length) {
    let k = moves[A.m].keys(p, A.mem);
    if (lenient) k = personWalk(moves[A.m], p, A.mem, k);
    if (k === "done") {
      // A move that only stood still (a wait for a raft, a beat) was the timing: no pause after it.
      const waited = A.mem.i > 1 && !A.mem.busy;
      A.m++;
      A.mem = { i: 0, air: false };
      if (hes && !waited && A.m < moves.length && p.body.onGround && !ridingCarrier(p)) {
        // Seeded by the run, the move and the clock, so the look-ahead's copy decides as the run itself will.
        const r = rng(hes.seed * 1000003 + A.m * 7919 + p.t * 31);
        if (r() < hes.share) {
          A.hold = 30 + Math.floor(r() * 61) - 1;
          return NONE;
        }
      }
      continue;
    }
    A.mem.i++;
    if (k.left || k.right || k.jumpHeld || k.jumpPressed || k.shield || k.dash) A.mem.busy = true;
    return k;
  }
  return NONE;
}

const cx = (p: any) => p.body.x + PW / 2;
const feet = (p: any) => p.body.y + PH;
const key = (s: { x: number; bottom: number }) => `${Math.round(s.x)},${Math.round(s.bottom)}`;

/** Moves whose keys run on a count from their first step: resumed half-way, they would jump in the wrong place. */
/** Tries at one place before the sloppy player is left to wander (a person would have given up long before). */
export const RETRIES = 15;
const timedMove = (name: string) => /^(jump |jump to|leap at|into the cannon)/.test(name);

export interface Ref {
  rec: { m: number; i: number; x: number; feet: number; ground: boolean }[];
  saveAt: Map<string, number>;
  /** Where each move ended in the perfect run (the first step of the next). */
  endOf: Map<number, { x: number; feet: number }>;
  /** The lowest ground (largest feet) the perfect run stood on during each move, its start and end included. */
  lowest: Map<number, number>;
  /** The moves that only stood and waited (no key for two steps or more), and the step each move began. */
  waits: Set<number>;
  first: Map<number, number>;
  steps: number;
  seconds: number;
  done: boolean;
}

export function reference(def: any, moves: any[], pole: boolean): Ref {
  const p = newPlay(def, { pole });
  fixSheep(p);
  const A: Auto = { m: 0, mem: { i: 0, air: false } };
  const rec: Ref["rec"] = [];
  const saveAt = new Map<string, number>();
  const endOf = new Map<number, { x: number; feet: number }>();
  const busy = new Map<number, boolean>();
  const first = new Map<number, number>();
  let n = 0;
  let lastM = 0;
  for (; n < 60 * 300 && p.run.state !== "done"; n++) {
    const intent = botKeys(moves, p, A);
    for (let m = lastM; m < A.m; m++) endOf.set(m, { x: cx(p), feet: feet(p) });
    lastM = A.m;
    if (!first.has(A.m)) first.set(A.m, n);
    const pressed = intent.left || intent.right || intent.jumpHeld || intent.jumpPressed || !!intent.shield || !!intent.dash || !!intent.sit;
    busy.set(A.m, (busy.get(A.m) ?? false) || pressed);
    rec.push({ m: A.m, i: A.mem.i - 1, x: cx(p), feet: feet(p), ground: p.body.onGround });
    (globalThis as any).__refTrace?.push(intent);
    stepPlay(p, intent);
    if (p.save && !saveAt.has(key(p.save))) saveAt.set(key(p.save), n);
  }
  const lowest = new Map<number, number>();
  for (let i = 0; i < rec.length; i++) {
    const r = rec[i];
    if (!r.ground) continue;
    lowest.set(r.m, Math.max(lowest.get(r.m) ?? -Infinity, r.feet));
    if (i > 0 && rec[i - 1].m !== r.m) lowest.set(rec[i - 1].m, Math.max(lowest.get(rec[i - 1].m) ?? -Infinity, r.feet));
  }
  const waits = new Set([...busy].filter(([m, b]) => !b && (endOf.has(m) ? (first.get(m + 1) ?? n) - (first.get(m) ?? 0) >= 2 : false)).map(([m]) => m));
  return { rec, saveAt, endOf, lowest, waits, first, steps: n, seconds: p.run.steps / 60, done: p.run.state === "done" };
}

/**
 * The step of the perfect run to pick up from at (x, feet), among moves up to `maxM`: a place on the
 * same floor that can be walked to (the latest in the route of those about as near as the nearest);
 * failing that, simply the nearest place, which may be on another floor.
 */
function nearestRef(ref: Ref, x: number, f: number, maxM: number, map?: any): number {
  // Behind him in the route first (the latest of the nearest); else ahead (a fall that skips a stretch: the earliest).
  for (const behind of [true, false]) {
    let bestDx = Infinity;
    const ok: number[] = [];
    if (map)
      for (let s = 0; s < ref.rec.length; s++) {
        const r = ref.rec[s];
        if (!r.ground || r.m > maxM !== !behind || Math.abs(r.feet - f) >= 4) continue;
        const dx = Math.abs(r.x - x);
        if (dx >= 64 && !floorBetween(map, x, r.x, f)) continue;
        ok.push(s);
        bestDx = Math.min(bestDx, dx);
      }
    if (ok.length) {
      if (behind) {
        for (let i = ok.length - 1; i >= 0; i--) if (Math.abs(ref.rec[ok[i]].x - x) <= bestDx + 24) return ok[i];
      } else for (const i of ok) if (Math.abs(ref.rec[i].x - x) <= bestDx + 24) return i;
    }
  }
  let best = 0;
  let bestD = Infinity;
  for (let s = 0; s < ref.rec.length; s++) {
    const r = ref.rec[s];
    if (!r.ground || r.m > maxM) continue;
    const d = Math.abs(r.x - x) + 3 * Math.abs(r.feet - f);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

/** Firm floor all the way from x0 to x1 at this height, and nothing in the way: safe to walk. */
function floorBetween(map: any, x0: number, x1: number, f: number): boolean {
  const r = Math.round(f / 16);
  if (Math.abs(r * 16 - f) > 0.5) return false;
  for (let c = Math.floor(Math.min(x0, x1) / 16); c <= Math.floor(Math.max(x0, x1) / 16); c++) {
    if (!(map.isSolid(c, r) || map.isOneWay(c, r))) return false;
    if (map.isSolid(c, r - 1)) return false;
  }
  return true;
}

function resumeAt(ref: Ref, moves: any[], s: number, p?: any): Auto {
  // Put back where the perfect run was walking on after a wait (onto the ferry once it stood at the quay),
  // a person waits again first: resume at the latest wait before the place, if it was at the same place
  // (order 17, the review's A5; the harness used to walk him straight back into the water).
  for (let j = ref.rec[s].m - 1; j >= 0 && j >= ref.rec[s].m - 2; j--) {
    if (!/^walk to/.test(moves[j + 1]?.name ?? "")) break;
    if (!ref.waits.has(j)) continue;
    const w = ref.rec[ref.first.get(j) ?? s];
    if (w && Math.abs(w.feet - ref.rec[s].feet) < 4 && Math.abs(w.x - ref.rec[s].x) < 48) s = ref.first.get(j)!;
    break;
  }
  const r = ref.rec[s];
  let m = r.m;
  const pre = p && Math.abs(cx(p) - r.x) > 3 && Math.abs(feet(p) - r.feet) < 4 && (Math.abs(cx(p) - r.x) < 64 || floorBetween(p.map, cx(p), r.x, feet(p))) ? { move: BOT.walk(r.x), mem: { i: 0, air: false } } : undefined;
  // A jump already in the air at that place is over by the time he is put back there: the next move.
  if (!r.ground && r.i > 0 && m < moves.length && timedMove(moves[m].name)) m++;
  return { m, mem: { i: 0, air: false }, pre };
}

/** Moves played one after another as one, for a way back the route never takes. */
const seq = (list: any[]) => ({
  name: `${list.map((m) => m.name).join(", then ")}`,
  keys(p: any, mem: any) {
    mem.k ??= 0;
    mem.sub ??= { i: 0, air: false };
    while (mem.k < list.length) {
      const k = list[mem.k].keys(p, mem.sub);
      if (k !== "done") {
        mem.sub.i++;
        return k;
      }
      mem.k++;
      mem.sub = { i: 0, air: false };
    }
    return "done";
  }
});

/**
 * Ways back that a person takes and the route never needs: where he lands, the moves that bring him back
 * up, and the move of the route to go on from. Bjørvika's net under the first hook catches a miss, and its
 * step leads back up to the floor before the bay.
 */
const RECOVER: Record<string, { at: (p: any) => boolean; moves: (p: any) => any[]; resume: string }> = {
  bjorvika: {
    at: (p) => (Math.abs(feet(p) - 21 * 16) < 1 || Math.abs(feet(p) - 19 * 16) < 1) && cx(p) > 75 * 16 && cx(p) < 84 * 16,
    moves: (p) => (feet(p) > 20 * 16 ? [BOT.walk(77 * 16 + 4), BOT.jumpTo(76 * 16), BOT.jumpTo(73 * 16 + 8)] : [BOT.jumpTo(73 * 16 + 8)]),
    resume: "the first hook at this end"
  },
  // Off St. Clement's rising stones onto the floor inside the ruin: back up the west wall's stub.
  gamlebyen: {
    at: (p) => Math.abs(feet(p) - 19 * 16) < 1 && cx(p) > 35 * 16 && cx(p) < 48 * 16,
    moves: () => [BOT.walk(35 * 16 + 4), BOT.jumpTo(34 * 16 + 8)],
    resume: "the stone at 37,15 risen"
  }
};

export interface Cfg {
  k: number;
  drop: number;
  overhold: number;
  seed: number;
  pole: boolean;
  /** Lives at the start (3 for a new visit). */
  lives?: number;
  /** Start as if put back at a flag or bench (a step of the perfect run where it was saved), at level clock t. */
  from?: { step: number; t: number; save: { x: number; bottom: number }; flag: number | null };
  max?: number;
  /** Start from this (cloned) state and route position instead of the level's start, and stop as soon as the route reaches move `stopAt`. */
  startPlay?: any;
  startA?: { m: number; mem: any };
  stopAt?: number;
  /** The hesitating player: the share of moves before which it stands 0.5 to 1.5 s (0 or absent: never). */
  hesitate?: number;
}

export interface Hurt {
  t: number;
  cause: string;
  x: number;
  col: number;
  feet: number;
  /** Steps the thing that hurt him had been on screen (or the throw's wind-up had begun) before it hurt him. */
  warned: number | null;
  /** A fall within 90 steps of a hit: knocked into the pit. */
  knockedIn?: boolean;
  /** Within 120 steps of being put back. */
  afterRespawn?: boolean;
  lifeLost: boolean;
}
export interface Respawn {
  t: number;
  kind: "fall" | "life";
  fromX: number;
  toX: number;
  toCol: number;
  /** Seconds of the perfect run between the place he was put back and the place he was lost. */
  refCost: number;
}
export interface RunResult {
  level: string;
  k: number;
  drop: number;
  overhold: number;
  seed: number;
  outcome: "clear" | "over" | "timeout" | "offroute" | "gaveup";
  seconds: number;
  steps: number;
  hurts: Hurt[];
  respawns: Respawn[];
  resyncs: { t: number; x: number; feet: number; refCost: number }[];
  livesLost: number;
  lastX: number;
  feet?: number;
  lastMove: string;
  /** Seconds standing still with no key held (the route's waits included). */
  idle: number;
}

export function sloppyRun(id: string, def: any, moves: any[], ref: Ref, cfg: Cfg): RunResult {
  const was = lenient;
  lenient = cfg.k > 0 || cfg.overhold > 0;
  try {
    return run(id, def, moves, ref, cfg);
  } finally {
    lenient = was;
  }
}

function run(id: string, def: any, moves: any[], ref: Ref, cfg: Cfg): RunResult {
  const r = rng(cfg.seed * 7919 + cfg.k * 104729 + 17);
  const hes: Hesitate | undefined = cfg.hesitate ? { share: cfg.hesitate, seed: cfg.seed * 13 + cfg.k } : undefined;
  const p = cfg.startPlay ?? newPlay(def, { pole: cfg.pole, lives: cfg.lives });
  if (!cfg.startPlay) fixSheep(p);
  let A: Auto = cfg.startA ? { m: cfg.startA.m, mem: { ...cfg.startA.mem } } : { m: 0, mem: { i: 0, air: false } };
  if (cfg.from) {
    const f = cfg.from;
    P.placeBodyAt(p, f.save.x, f.save.bottom);
    p.t = f.t;
    p.save = { ...f.save };
    p.lastGround = { ...f.save };
    p.checkpoints = { reached: f.flag };
    if (f.flag !== null) for (let i = 0; i <= f.flag; i++) p.raisedAt[i] = 0;
    A = resumeAt(ref, moves, f.step);
  }
  const K = cfg.k;
  const draw = () => (K === 0 ? 0 : Math.floor(r() * (2 * K + 1)) - K);
  const extra = () => (cfg.overhold > 0 && r() < cfg.overhold ? 1 + Math.floor(r() * 2 * Math.max(1, K)) : 0);
  const H: Intent[] = [];
  /** The jump key as a person holds it: down from a press until the route lets go (the route's walks hold it without ever pressing). */
  const JJ: boolean[] = [];
  const dirCh: { out: number; last: number; delta: number; extra: number; off?: number } = { out: 0, last: -1, delta: draw(), extra: extra() };
  const jumpCh = { out: false, last: -1, delta: draw(), drop: cfg.drop > 0 && r() < cfg.drop };
  const dashCh = { last: -1, delta: draw() };
  /** The shield (down, held): its key going down and coming up each reach the game off by up to k steps, as the direction's do. */
  const shieldCh = { out: false, last: -1, delta: draw() };
  let prevJumpOut = false;
  const res: RunResult = { level: id, k: K, drop: cfg.drop, overhold: cfg.overhold, seed: cfg.seed, outcome: "timeout", seconds: 0, steps: 0, hurts: [], respawns: [], resyncs: [], livesLost: 0, lastX: 0, lastMove: "", idle: 0 };
  const max = cfg.max ?? ref.steps * 4 + 60 * 60;
  const firstSeen = new Map<number, number>();
  let lastHitAt = -999;
  let lastRespawnAt = -999;
  let lastResync = -999;
  let n = 0;
  let prevM = 0;
  /** Re-synchronisations per place: after RETRIES at one place, he is left to go on from there (and usually gets lost: a "timeout"). */
  const tried = new Map<string, number>();
  for (; n < max; n++) {
    if (p.run.state === "done" || (cfg.stopAt !== undefined && A.m >= cfg.stopAt)) {
      res.outcome = "clear";
      break;
    }
    if (p.run.state === "over") {
      res.outcome = "over";
      break;
    }
    const fight = (p.troll && !["asleep", "stone"].includes(p.troll.phase)) || (p.boss && !["parked", "asleep", "beaten"].includes(p.boss.state.phase));
    // A move that never ends (a walk that bounces on a washing line for ever): on to the next. (Not a
    // boss's fight, which is one long move of its own.)
    if (A.m < moves.length && A.mem.i > 900 && !p.body.onGround && !fight) {
      res.resyncs.push({ t: n, x: Math.round(cx(p)), feet: feet(p), refCost: 0 });
      A = { m: A.m + 1, mem: { i: 0, air: false } };
    }
    // Re-synchronise to the nearest place the perfect run stood. If that place cannot be walked to
    // from here (he fell somewhere the route never goes), the run ends "offroute"; after RETRIES
    // at one place it ends "gaveup".
    let why: string | null = null;
    if (p.body.onGround && n - lastResync > 30) {
      if (A.m >= moves.length || (A.mem.i > 900 && !fight)) why = "lost";
      else if (!fight && p.map.supports(p.body) && feet(p) > (ref.lowest.get(A.m) ?? Infinity) + 12) why = "fell";
    }
    if (why) {
      const k = `${Math.round(cx(p) / 16)},${Math.round(feet(p))}`;
      const c = (tried.get(k) ?? 0) + 1;
      tried.set(k, c);
      const s = nearestRef(ref, cx(p), feet(p), Math.min(A.m, moves.length - 1), p.map);
      const r = ref.rec[s];
      const walkable = Math.abs(cx(p) - r.x) <= 3 || (Math.abs(feet(p) - r.feet) < 4 && (Math.abs(cx(p) - r.x) < 64 || floorBetween(p.map, cx(p), r.x, feet(p))));
      if (c > RETRIES) {
        res.outcome = "gaveup";
        break;
      }
      const rec = RECOVER[id];
      if (!walkable && rec?.at(p)) {
        A = { m: moves.findIndex((m: any) => m.name === rec.resume), mem: { i: 0, air: false }, pre: { move: seq(rec.moves(p)), mem: { i: 0, air: false } } };
        res.resyncs.push({ t: n, x: Math.round(cx(p)), feet: feet(p), refCost: 0 });
        lastResync = n;
        prevM = A.m;
      } else if (!walkable) {
        res.outcome = "offroute";
        break;
      } else {
        const at = ref.rec.findIndex((q) => q.m >= A.m);
        res.resyncs.push({ t: n, x: Math.round(cx(p)), feet: feet(p), refCost: why === "fell" ? Math.max(0, (at - s) / 60) : 0 });
        A = resumeAt(ref, moves, s, p);
        lastResync = n;
        prevM = A.m;
      }
    }
    const mBefore = A.m;
    H[n] = botKeys(moves, p, A, hes);
    // A jump that went nowhere (pressed too early from a standstill, or too short, and he is back on
    // the floor he left): a person jumps again. The route would walk on as if it had worked.
    if (A.m > mBefore && p.body.onGround && !fight && timedMove(moves[mBefore].name)) {
      const s0 = ref.rec.findIndex((q) => q.m === mBefore);
      const start = ref.rec[s0];
      const end = ref.endOf.get(mBefore);
      if (start && end && Math.abs(feet(p) - start.feet) < 2 && Math.abs(cx(p) - start.x) < 40 && (Math.abs(feet(p) - end.feet) > 4 || Math.abs(cx(p) - end.x) > 32)) {
        const k = `${Math.round(cx(p) / 16)},${Math.round(feet(p))}`;
        const c = (tried.get(k) ?? 0) + 1;
        tried.set(k, c);
        if (c <= RETRIES) {
          res.resyncs.push({ t: n, x: Math.round(cx(p)), feet: feet(p), refCost: 0 });
          A = { m: mBefore, mem: { i: 0, air: false }, pre: Math.abs(cx(p) - start.x) > 2 ? { move: BOT.walk(start.x), mem: { i: 0, air: false } } : undefined };
          H[n] = botKeys(moves, p, A, hes);
        }
      }
    }
    prevM = A.m;
    // Look ahead k steps with perfect keys.
    const F: Intent[] = [H[n]];
    if (K > 0) {
      const q = clonePlay(p);
      const B: Auto = { m: A.m, mem: { ...A.mem }, pre: A.pre && { move: A.pre.move, mem: { ...A.pre.mem } }, hold: A.hold };
      for (let j = 1; j <= K; j++) {
        stepPlay(q, F[j - 1]);
        F.push(q.run.state === "done" || q.run.state === "over" ? NONE : botKeys(moves, q, B, hes));
      }
    }
    const src = (t: number): Intent => (t < 0 ? NONE : t <= n ? H[t] ?? NONE : F[t - n] ?? F[F.length - 1]);
    const dir = (t: number) => (src(t).left ? -1 : src(t).right ? 1 : 0);
    const jraw = (t: number) => src(t).jumpHeld || src(t).jumpPressed;
    // A press while the key is already held is a let-go and a press: the key is up the step before.
    const press = (t: number) => t >= 0 && t <= n + K && !!src(t).jumpPressed;
    // (Presses on several steps in a row, as the route's walks give while a threat is ahead, are one press held.)
    const jprime = (t: number) => jraw(t) && !(press(t + 1) && !press(t));
    if (n >= 1) JJ[n - 1] = jprime(n - 1) && (press(n - 1) || (JJ[n - 2] ?? false));
    const W: boolean[] = [];
    for (let j = 0; j <= K; j++) W[j] = jprime(n + j) && (press(n + j) || (j === 0 ? JJ[n - 1] ?? false : W[j - 1]));
    const jsrc = (t: number) => (t < 0 ? false : t < n ? JJ[t] ?? false : W[t - n] ?? W[W.length - 1]);
    const lo = n - 3 * Math.max(K, 1) - 4;
    const hi = n + K;
    // Direction.
    for (let T = Math.max(dirCh.last + 1, lo + 1); T <= hi; T++) {
      if (dir(T) === dir(T - 1)) continue;
      const v = dir(T);
      const releasing = v === 0 || v === -dirCh.out;
      if (n < T + dirCh.delta + (releasing ? dirCh.extra : 0)) break;
      dirCh.last = Math.min(T, n);
      dirCh.delta = draw();
      dirCh.extra = extra();
      if (v !== dirCh.out) {
        dirCh.out = v;
        break;
      }
    }
    if (dirCh.out !== dir(n)) {
      let pending = false;
      for (let T = dirCh.last + 1; T <= hi; T++) if (dir(T) !== dir(T - 1)) pending = true;
      // A change made early whose cause then never comes (he stopped short, so the route's stop
      // stays a few steps ahead for ever): after 2k+2 steps of keys that differ from the route's,
      // the player notices and does what it wants.
      dirCh.off = (dirCh.off ?? 0) + 1;
      if (!pending || dirCh.off > 2 * K + 2) {
        dirCh.out = dir(n);
        dirCh.last = n;
        dirCh.off = 0;
      }
    } else dirCh.off = 0;
    // Jump. A let-go and a press both due in one step are a fresh press.
    let repress = false;
    for (let T = Math.max(jumpCh.last + 1, lo + 1); T <= hi; T++) {
      if (jsrc(T) === jsrc(T - 1)) continue;
      const v = jsrc(T);
      if (n < T + jumpCh.delta) break;
      jumpCh.last = Math.min(T, n);
      jumpCh.delta = draw();
      const dropped = v && jumpCh.drop;
      jumpCh.drop = cfg.drop > 0 && r() < cfg.drop;
      if (dropped) continue;
      if (v !== jumpCh.out) {
        jumpCh.out = v;
        if (v) break;
        repress = true;
      }
    }
    if (jumpCh.out !== jsrc(n)) {
      let pending = false;
      for (let T = jumpCh.last + 1; T <= hi; T++) if (jsrc(T) !== jsrc(T - 1)) pending = true;
      if (!pending && !jumpCh.out) {
        /* a dropped press: stays up */
      } else if (!pending) jumpCh.out = jsrc(n);
    }
    // Dash: an event.
    let dashNow = false;
    for (let T = Math.max(dashCh.last + 1, lo + 1); T <= hi; T++) {
      if (!src(T).dash) continue;
      if (n < T + dashCh.delta) break;
      dashNow = true;
      dashCh.last = Math.max(T, n) + 2;
      dashCh.delta = draw();
      break;
    }
    // Shield: a held key, its edges shifted as the direction's are.
    const sh = (t: number) => !!src(t).shield;
    for (let T = Math.max(shieldCh.last + 1, lo + 1); T <= hi; T++) {
      if (sh(T) === sh(T - 1)) continue;
      if (n < T + shieldCh.delta) break;
      shieldCh.last = Math.min(T, n);
      shieldCh.delta = draw();
      shieldCh.out = sh(T);
    }
    // An edge that slid out of the window unseen: the key follows the route again.
    if (shieldCh.out !== sh(n)) {
      let pending = false;
      for (let T = shieldCh.last + 1; T <= hi; T++) if (sh(T) !== sh(T - 1)) pending = true;
      if (!pending) {
        shieldCh.out = sh(n);
        shieldCh.last = n;
      }
    }
    const out: Intent = {
      left: dirCh.out < 0,
      right: dirCh.out > 0,
      jumpHeld: jumpCh.out,
      jumpPressed: jumpCh.out && (!prevJumpOut || repress),
      sit: H[n].sit,
      dash: dashNow,
      shield: shieldCh.out
    };
    prevJumpOut = jumpCh.out;
    if (!out.left && !out.right && !out.jumpHeld && p.body.onGround && Math.abs(p.body.vx) < 0.05) res.idle++;

    // Enemies on screen: when each was first seen in this approach.
    const camX = cx(p) + p.body.facing * VIEW.ahead;
    p.enemies.forEach((e: any, i: number) => {
      const on = e.alive && Math.abs(e.x - camX) < VIEW.w / 2 && Math.abs(e.y - feet(p)) < VIEW.h / 2;
      if (on && !firstSeen.has(i)) firstSeen.set(i, n);
      if (!on) firstSeen.delete(i);
    });
    const shotsBefore = [...p.shots];
    const before = { x: cx(p), feet: feet(p), vx: p.body.vx, vy: p.body.vy };
    (globalThis as any).__trace?.push(out);
    const ev = stepPlay(p, out);
    (globalThis as any).__onStep?.(p, ev, A, moves);
    if (ev.hurt) {
      let cause = "?";
      let warned: number | null = null;
      if (ev.splash) cause = "fall";
      else if (ev.zap) cause = "rail";
      else {
        // A hit that took the last heart has already put him back: judge it where he was.
        const b = ev.lifeLost ? { x: before.x - PW / 2 + before.vx, y: before.feet - PH + before.vy } : p.body;
        const hitE = p.enemies.findIndex((e: any) => {
          const box = enemyBox(e, p.t);
          return box && b.x < box.x + box.w && b.x + PW > box.x && b.y < box.y + box.h && b.y + PH > box.y;
        });
        const gone = shotsBefore.filter((s: any) => !p.shots.includes(s));
        const shot = gone.find((s: any) => {
          const bx = shotBox(s);
          return b.x < bx.x + bx.w + 6 && b.x + PW > bx.x - 6 && b.y < bx.y + bx.h + 6 && b.y + PH > bx.y - 6;
        });
        if (hitE >= 0) {
          const e = p.enemies[hitE];
          cause = `${e.def.kind}:${e.def.look}@${e.def.c}`;
          warned = firstSeen.has(hitE) ? n - firstSeen.get(hitE)! : 0;
        } else if (shot) {
          const e = p.enemies[shot.by];
          cause = `shot:${e.def.look}@${e.def.c}`;
          warned = n - (shot.born - 60);
        } else if (p.troll && trollHurts(p.troll, p.t, b)) cause = `troll:${p.troll.phase}`;
        else if (p.troll) cause = `troll?:${p.troll.phase}`;
        else if (p.boss) cause = `boss:${p.boss.state.phase}`;
        else if (ev.lifeLost) cause = "enemy(lost life)";
      }
      const h: Hurt = { t: n, cause, x: Math.round(before.x), col: Math.floor(before.x / 16), feet: before.feet, warned, lifeLost: ev.lifeLost };
      if (ev.splash && n - lastHitAt < 90) h.knockedIn = true;
      if (n - lastRespawnAt < 120) h.afterRespawn = true;
      res.hurts.push(h);
      if (!ev.splash) lastHitAt = n;
    }
    if (ev.lifeLost) res.livesLost++;
    if (ev.over) {
      res.outcome = "over";
      res.lastX = Math.round(before.x);
      res.lastMove = moves[A.m]?.name ?? "";
      n++;
      break;
    }
    if ((ev.splash && p.run.state !== "done") || ev.lifeLost) {
      // Put back: resume the route where the perfect run was at this place.
      let s: number | undefined = p.save && Math.abs(p.save.x - cx(p)) < 1 && Math.abs(p.save.bottom - feet(p)) < 1 ? ref.saveAt.get(key(p.save)) : undefined;
      if (s === undefined) s = nearestRef(ref, cx(p), feet(p), A.m + 2, p.map);
      const lostAt = nearestRef(ref, before.x, before.feet, A.m + 2);
      res.respawns.push({ t: n, kind: ev.lifeLost ? "life" : "fall", fromX: Math.round(before.x), toX: Math.round(cx(p)), toCol: Math.floor(cx(p) / 16), refCost: Math.max(0, (lostAt - s) / 60) });
      A = resumeAt(ref, moves, s, p);
      prevM = A.m;
      lastRespawnAt = n;
      lastResync = n;
    }
  }
  res.steps = n;
  res.seconds = p.run.steps / 60;
  if (res.outcome !== "over") {
    res.feet = Math.round(feet(p));
    res.lastX = Math.round(cx(p));
    res.lastMove = moves[A.m]?.name ?? "(end of route)";
  }
  res.idle /= 60;
  return res;
}

// ------------------------------------------------------------------------------------------------
if (import.meta.main) {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=") as [string, string]));
  const ids = args.levels && args.levels !== "all" ? args.levels.split(",") : LEVELS.map((l) => l[0]);
  const ks = (args.ks ?? "0,2,4,8").split(",").map(Number);
  const seeds = Number(args.seeds ?? 30);
  const drop = Number(args.drop ?? 0);
  const overhold = Number(args.overhold ?? 0);
  const hesitate = Number(args.hesitate ?? 0);
  const outFile = args.out;
  const lines: string[] = [];
  for (const [id, def, moves] of LEVELS) {
    if (!ids.includes(id)) continue;
    const pole = POLE.has(id);
    const ref = reference(def, moves as any[], pole);
    console.error(`${id}: perfect run ${ref.done ? "clears" : "FAILS"} in ${ref.seconds.toFixed(1)} s (${ref.steps} steps)`);
    for (const k of ks) {
      const runs: RunResult[] = [];
      const t0 = performance.now();
      for (let seed = 1; seed <= (k === 0 ? 1 : seeds); seed++) {
        const res = sloppyRun(id, def, moves as any[], ref, { k, drop, overhold, seed, pole, hesitate });
        runs.push(res);
        lines.push(JSON.stringify(res));
      }
      const clear = runs.filter((x) => x.outcome === "clear").length;
      const over = runs.filter((x) => x.outcome === "over").length;
      const hearts = runs.reduce((a, x) => a + x.hurts.length, 0) / runs.length;
      const lives = runs.reduce((a, x) => a + x.livesLost, 0) / runs.length;
      const secs = runs.filter((x) => x.outcome === "clear").map((x) => x.seconds);
      console.error(
        `  k=${k} drop=${drop} overhold=${overhold}${hesitate ? ` hesitate=${hesitate}` : ""}: clear ${clear}/${runs.length}, game over ${over}, timeout ${runs.length - clear - over}; hearts lost ${hearts.toFixed(1)}/run, lives ${lives.toFixed(2)}/run; clear time median ${secs.length ? secs.sort((a, b) => a - b)[Math.floor(secs.length / 2)].toFixed(0) : "-"} s (${((performance.now() - t0) / 1000).toFixed(0)} s wall)`
      );
    }
  }
  if (outFile) await Bun.write(outFile, lines.join("\n") + "\n");
}
