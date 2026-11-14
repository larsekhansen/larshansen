// The maze's sloppy player: packages/maze's own route and planner (copied here so its state can be
// cloned), at key speed, with every edge of the horizontal and vertical keys shifted by a random
// [-k, +k] steps (a look-ahead on cloned state gives the early ones). After a curse he wakes at the
// last lit stone (the real rules); the route is picked up at the waypoint nearest to it.
//
// Run: bun mazesloppy.ts [ks=0,2,4,8] [seeds=30]

const M = "../../../../packages/maze/src";
const { planRoute } = await import(`${M}/bot.ts`);
const R = await import(`${M}/rules.ts`);
const L = await import(`${M}/levels.ts`);
const { SPEED, cloneState, limit, newState, stepMaze } = R;

type Pt = { x: number; y: number };
type Action = "go" | "wait" | "back";
interface BotState {
  p: { leg: number; i: number };
  queue: Action[];
}
/** How near a corner's centre counts as reached: the route's own half a step; a person turns within a few pixels of it (sloppy runs). */
let NEAR = SPEED.keys / 2;
function move(route: any, p: { leg: number; i: number }, s: any, action: Action) {
  if (action === "wait") return { dx: 0, dy: 0 };
  const leg: Pt[] = route.legs[p.leg] ?? [];
  const toward = (t: Pt) => {
    const vx = t.x - s.x, vy = t.y - s.y;
    const ix = Math.abs(vx) >= NEAR ? Math.sign(vx) : 0;
    const iy = Math.abs(vy) >= NEAR ? Math.sign(vy) : 0;
    return ix || iy ? limit(ix * SPEED.keys, iy * SPEED.keys, SPEED.keys) : null;
  };
  if (action === "back") return toward(leg[Math.max(0, p.i - 1)] ?? s) ?? { dx: 0, dy: 0 };
  while (p.i < leg.length) {
    const m = toward(leg[p.i]);
    if (m) return m;
    p.i++;
  }
  return { dx: 0, dy: 0 };
}
const track = (p: { leg: number; i: number }, ev: any) => {
  if (ev.teleported) {
    p.leg++;
    p.i = 0;
  }
};
function safeAhead(route: any, s0: any, p0: any, n: number) {
  const s = cloneState(s0);
  const p = { ...p0 };
  for (let k = 0; k < n; k++) {
    const ev = stepMaze(s, move(route, p, s, "go"));
    if (ev.cursed) return false;
    if (s.phase === "cleared") return true;
    track(p, ev);
  }
  return true;
}
function plan(route: any, s0: any, p0: any): Action[] | null {
  for (const back of [0, 8, 32]) {
    const s = cloneState(s0);
    const p = { ...p0 };
    let ok = true;
    for (let k = 0; k < back && ok; k++) {
      const ev = stepMaze(s, move(route, p, s, "back"));
      ok = !ev.cursed;
      track(p, ev);
    }
    if (!ok) continue;
    for (let w = 0; w <= 150; w++) {
      if (w > 0 && stepMaze(s, { dx: 0, dy: 0 }).cursed) break;
      if (safeAhead(route, s, p, 100 + back)) return [...Array<Action>(back).fill("back"), ...Array<Action>(w).fill("wait"), ...Array<Action>(50).fill("go")];
    }
  }
  return null;
}
function botNext(route: any, b: BotState, s: any) {
  if (s.phase !== "play") return { dx: 0, dy: 0 };
  if (!b.queue.length) b.queue = plan(route, s, b.p) ?? ["wait"];
  return move(route, b.p, s, b.queue.shift()!);
}
/** After waking at a stone: the waypoint after the point of the route nearest to him. */
function repick(route: any, b: BotState, s: any) {
  let best = { d: Infinity, leg: 0, i: 0 };
  route.legs.forEach((leg: Pt[], li: number) =>
    leg.forEach((q, i) => {
      if (i === 0) return;
      const a = leg[i - 1];
      const t = Math.max(0, Math.min(1, ((s.x - a.x) * (q.x - a.x) + (s.y - a.y) * (q.y - a.y)) / Math.max(1e-9, (q.x - a.x) ** 2 + (q.y - a.y) ** 2)));
      const d = Math.hypot(a.x + t * (q.x - a.x) - s.x, a.y + t * (q.y - a.y) - s.y);
      if (d < best.d) best = { d, leg: li, i };
    })
  );
  b.p = { leg: best.leg, i: best.i };
  b.queue = [];
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mazeRun(level: number, k: number, seed: number, max = 60 * 240) {
  const r = rng(seed * 31 + k * 977 + level);
  NEAR = k === 0 ? SPEED.keys / 2 : 2.5;
  const draw = () => (k === 0 ? 0 : Math.floor(r() * (2 * k + 1)) - k);
  const route = planRoute(level, false);
  const s = newState(level);
  const b: BotState = { p: { leg: 0, i: 0 }, queue: [] };
  const H: { x: number; y: number }[] = [];
  const ch: { out: number; last: number; delta: number; off?: number }[] = [
    { out: 0, last: -1, delta: draw() },
    { out: 0, last: -1, delta: draw() }
  ];
  const curses: { cause: string; x: number; y: number; c: number; r: number }[] = [];
  let n = 0;
  for (; n < max && s.phase !== "cleared"; n++) {
    const i0 = botNext(route, b, s);
    H[n] = { x: Math.sign(i0.dx), y: Math.sign(i0.dy) };
    const F = [H[n]];
    if (k > 0) {
      const q = cloneState(s);
      const bb: BotState = { p: { ...b.p }, queue: [...b.queue] };
      let iq = i0;
      for (let j = 1; j <= k; j++) {
        stepMaze(q, iq);
        iq = botNext(route, bb, q);
        F.push({ x: Math.sign(iq.dx), y: Math.sign(iq.dy) });
      }
    }
    const src = (t: number, a: 0 | 1) => {
      const v = t < 0 ? { x: 0, y: 0 } : t <= n ? H[t] : F[t - n] ?? F[F.length - 1];
      return a === 0 ? v.x : v.y;
    };
    for (const a of [0, 1] as const) {
      const c = ch[a];
      for (let T = Math.max(c.last + 1, n - 3 * Math.max(k, 1) - 4); T <= n + k; T++) {
        if (src(T, a) === src(T - 1, a)) continue;
        if (n < T + c.delta) break;
        c.last = Math.min(T, n);
        c.delta = draw();
        if (src(T, a) !== c.out) {
          c.out = src(T, a);
          break;
        }
      }
      let pending = false;
      for (let T = c.last + 1; T <= n + k; T++) if (src(T, a) !== src(T - 1, a)) pending = true;
      // As in the viking harness: after 2k+2 steps of keys that differ from the route's, he does what it wants.
      c.off = c.out !== src(n, a) ? (c.off ?? 0) + 1 : 0;
      if (c.out !== src(n, a) && (!pending || c.off > 2 * k + 2)) {
        c.out = src(n, a);
        c.last = n;
        c.off = 0;
      }
    }
    const out = limit(ch[0].out * SPEED.keys, ch[1].out * SPEED.keys, SPEED.keys);
    (globalThis as any).__mz?.(n, s, out, b, i0);
    const ev = stepMaze(s, s.phase === "play" ? out : { dx: 0, dy: 0 });
    track(b.p, ev);
    if (ev.cursed) {
      curses.push({ cause: ev.cursed, x: Math.round(s.x), y: Math.round(s.y), c: Math.floor(s.x / 16), r: Math.floor(s.y / 16) });
      b.queue = [];
    }
    if (ev.respawned) repick(route, b, s);
  }
  return { level, k, seed, cleared: s.phase === "cleared", seconds: s.steps / 60, curses };
}

if (import.meta.main) {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=") as [string, string]));
  const ks = (args.ks ?? "0,2,4,8").split(",").map(Number);
  const seeds = Number(args.seeds ?? 30);
  for (let level = 1; level <= L.LEVELS.length; level++) {
    const def = L.LEVELS[level - 1];
    const parts: string[] = [];
    const spots = new Map<string, number>();
    for (const k of ks) {
      const runs = [];
      for (let seed = 1; seed <= (k === 0 ? 1 : seeds); seed++) runs.push(mazeRun(level, k, seed));
      const cl = runs.filter((x) => x.cleared);
      const curses = runs.reduce((a, x) => a + x.curses.length, 0) / runs.length;
      const t = cl.map((x) => x.seconds).sort((a, b) => a - b);
      parts.push(`k=${k}: clear ${cl.length}/${runs.length}, curses ${curses.toFixed(1)}/run, median ${t.length ? t[Math.floor(t.length / 2)].toFixed(0) : "-"} s`);
      if (k === 4) for (const x of runs) for (const c of x.curses) spots.set(`${c.cause}@(${c.c},${c.r})`, (spots.get(`${c.cause}@(${c.c},${c.r})`) ?? 0) + 1);
    }
    console.log(`level ${level} ${def.name} (par ${def.par} s${def.dark ? ", dark" : ""}): ${parts.join("; ")}`);
    console.log("   most curses at k=4: " + [...spots].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, v]) => `${s} x${v}`).join(", "));
  }
}
