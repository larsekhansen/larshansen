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
// Run:   bun /path/to/sloppy.ts [levels=all|id,id] [ks=0,2,4,8] [seeds=30] [drop=0] [overhold=0] [out=file.jsonl]
// e.g.   bun sloppy.ts levels=radhuset ks=4 seeds=20
// Output: one JSON line per run (to out=, default stdout) and a summary table per level and k.

import { LEVELS, POLE, bot as BOT, play as P } from "./common.ts";

const { newPlay, stepPlay } = P;
const { enemyBox, shotBox } = await import("../../src/game/enemies.ts");
const { trollHurts } = await import("../../src/game/troll.ts");

type Intent = { left: boolean; right: boolean; jumpHeld: boolean; jumpPressed: boolean; sit?: boolean; dash?: boolean };
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
    boss: p.boss && { rules: p.boss.rules, state: { ...p.boss.state } }
  };
}

interface Auto {
  m: number;
  mem: any;
  /** A walk to where the perfect run stood, first, after he was put back or re-synchronised elsewhere. */
  pre?: { move: any; mem: any };
}
function botKeys(moves: any[], p: any, A: Auto): Intent {
  if (A.pre) {
    const k = A.pre.move.keys(p, A.pre.mem);
    if (k !== "done" && A.pre.mem.i < 600) {
      A.pre.mem.i++;
      return k;
    }
    A.pre = undefined;
  }
  while (A.m < moves.length) {
    const k = moves[A.m].keys(p, A.mem);
    if (k === "done") {
      A.m++;
      A.mem = { i: 0, air: false };
      continue;
    }
    A.mem.i++;
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
  let n = 0;
  let lastM = 0;
  for (; n < 60 * 300 && p.run.state !== "done"; n++) {
    const intent = botKeys(moves, p, A);
    for (let m = lastM; m < A.m; m++) endOf.set(m, { x: cx(p), feet: feet(p) });
    lastM = A.m;
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
  return { rec, saveAt, endOf, lowest, steps: n, seconds: p.run.steps / 60, done: p.run.state === "done" };
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
  const r = ref.rec[s];
  let m = r.m;
  const pre = p && Math.abs(cx(p) - r.x) > 3 && Math.abs(feet(p) - r.feet) < 4 && (Math.abs(cx(p) - r.x) < 64 || floorBetween(p.map, cx(p), r.x, feet(p))) ? { move: BOT.walk(r.x), mem: { i: 0, air: false } } : undefined;
  // A jump already in the air at that place is over by the time he is put back there: the next move.
  if (!r.ground && r.i > 0 && m < moves.length && timedMove(moves[m].name)) m++;
  return { m, mem: { i: 0, air: false }, pre };
}

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
  const r = rng(cfg.seed * 7919 + cfg.k * 104729 + 17);
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
    // A move that never ends (a walk that bounces on a washing line for ever): on to the next.
    if (A.m < moves.length && A.mem.i > 900 && !p.body.onGround) {
      res.resyncs.push({ t: n, x: Math.round(cx(p)), feet: feet(p), refCost: 0 });
      A = { m: A.m + 1, mem: { i: 0, air: false } };
    }
    const fight = (p.troll && !["asleep", "stone"].includes(p.troll.phase)) || (p.boss && !["parked", "beaten"].includes(p.boss.state.phase));
    // Re-synchronise to the nearest place the perfect run stood. If that place cannot be walked to
    // from here (he fell somewhere the route never goes), the run ends "offroute"; after RETRIES
    // at one place it ends "gaveup".
    let why: string | null = null;
    if (p.body.onGround && n - lastResync > 30) {
      if (A.m >= moves.length || A.mem.i > 900) why = "lost";
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
      if (!walkable) {
        res.outcome = "offroute";
        break;
      }
      const at = ref.rec.findIndex((q) => q.m >= A.m);
      res.resyncs.push({ t: n, x: Math.round(cx(p)), feet: feet(p), refCost: why === "fell" ? Math.max(0, (at - s) / 60) : 0 });
      A = resumeAt(ref, moves, s, p);
      lastResync = n;
      prevM = A.m;
    }
    const mBefore = A.m;
    H[n] = botKeys(moves, p, A);
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
          H[n] = botKeys(moves, p, A);
        }
      }
    }
    prevM = A.m;
    // Look ahead k steps with perfect keys.
    const F: Intent[] = [H[n]];
    if (K > 0) {
      const q = clonePlay(p);
      const B: Auto = { m: A.m, mem: { ...A.mem }, pre: A.pre && { move: A.pre.move, mem: { ...A.pre.mem } } };
      for (let j = 1; j <= K; j++) {
        stepPlay(q, F[j - 1]);
        F.push(q.run.state === "done" || q.run.state === "over" ? NONE : botKeys(moves, q, B));
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
    const out: Intent = {
      left: dirCh.out < 0,
      right: dirCh.out > 0,
      jumpHeld: jumpCh.out,
      jumpPressed: jumpCh.out && (!prevJumpOut || repress),
      sit: H[n].sit,
      dash: dashNow
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
        const res = sloppyRun(id, def, moves as any[], ref, { k, drop, overhold, seed, pole });
        runs.push(res);
        lines.push(JSON.stringify(res));
      }
      const clear = runs.filter((x) => x.outcome === "clear").length;
      const over = runs.filter((x) => x.outcome === "over").length;
      const hearts = runs.reduce((a, x) => a + x.hurts.length, 0) / runs.length;
      const lives = runs.reduce((a, x) => a + x.livesLost, 0) / runs.length;
      const secs = runs.filter((x) => x.outcome === "clear").map((x) => x.seconds);
      console.error(
        `  k=${k} drop=${drop} overhold=${overhold}: clear ${clear}/${runs.length}, game over ${over}, timeout ${runs.length - clear - over}; hearts lost ${hearts.toFixed(1)}/run, lives ${lives.toFixed(2)}/run; clear time median ${secs.length ? secs.sort((a, b) => a - b)[Math.floor(secs.length / 2)].toFixed(0) : "-"} s (${((performance.now() - t0) / 1000).toFixed(0)} s wall)`
      );
    }
  }
  if (outFile) await Bun.write(outFile, lines.join("\n") + "\n");
}
