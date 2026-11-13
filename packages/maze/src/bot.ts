import { COLS, ROWS, centreOf, findTiles, mapInfo, tileAt, type Cell } from "./levels";
import { SPEED, cloneState, levelDef, limit, newState, stepMaze, type Intent, type MazeEvents, type MazeState } from "./rules";

// The scripted player. It finds a route through a level on the tile map (start, then the rune key if
// there is a gate, then the finish), and walks it the way a visitor can: eight directions at key speed,
// or toward a pointer at pointer speed. It never looks at the future except by stepping copies of the
// rules, so what it does is what a person could do with perfect timing. The tests use it to prove that
// every level can be cleared, and par times come from its clears at key speed.

export type BotSpeed = "keys" | "pointer";

interface Point {
  x: number;
  y: number;
}

/** Legs of waypoints in art pixels. A teleport ends a leg; the next leg starts on the twin. */
export interface Route {
  legs: Point[][];
}

const key = (c: number, r: number) => r * COLS + c;

/**
 * The cheapest tile path from any of `from` to any of `to`, four ways. Gates are wall unless open.
 * Teleport stones are wall unless `portals`; then stepping onto one lands on its twin. Tiles on a
 * snake's line cost extra (there is always a lane beside it), sliders a little.
 */
function tilePath(level: number, from: Cell[], to: Cell[], gatesOpen: boolean, portals: boolean): { tiles: Cell[]; hops: Set<number> } | null {
  const def = levelDef(level);
  const { map } = def;
  const info = mapInfo(map);
  const extra = new Map<number, number>();
  for (const s of def.snakes)
    for (let r = Math.min(s.from[1], s.to[1]); r <= Math.max(s.from[1], s.to[1]); r++)
      for (let c = Math.min(s.from[0], s.to[0]); c <= Math.max(s.from[0], s.to[0]); c++) extra.set(key(c, r), 40);
  for (const s of def.sliders) for (let r = s.at[1]; r < s.at[1] + s.h; r++) for (let c = s.at[0]; c < s.at[0] + s.w; c++) extra.set(key(c, r), 4);
  const portalAt = new Map(info.portals.map((p) => [key(p.c, p.r), p]));

  const n = COLS * ROWS;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  /** Tiles reached by a teleport, keyed by the twin, holding the stone stepped on. */
  const via = new Map<number, number>();
  const done = new Uint8Array(n);
  for (const f of from) dist[key(f.c, f.r)] = 0;
  const goal = new Set(to.map((t) => key(t.c, t.r)));
  const open = (c: number, r: number) => {
    const ch = tileAt(map, c, r);
    if (ch === "#") return false;
    if (ch === "g") return gatesOpen;
    if (portalAt.has(key(c, r))) return portals;
    return true;
  };
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) return null;
    done[u] = 1;
    if (goal.has(u)) {
      const tiles: Cell[] = [];
      const hops = new Set<number>();
      for (let v = u; v >= 0; v = prev[v]) {
        tiles.push({ c: v % COLS, r: Math.floor(v / COLS) });
        const stone = via.get(v);
        if (stone !== undefined && prev[v] >= 0) {
          // He walks onto the stone, and the next tile is its twin: a hop.
          tiles.push({ c: stone % COLS, r: Math.floor(stone / COLS) });
          hops.add(tiles.length - 1);
        }
      }
      tiles.reverse();
      return { tiles, hops: new Set([...hops].map((i) => tiles.length - 1 - i)) };
    }
    const uc = u % COLS;
    const ur = Math.floor(u / COLS);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = uc + dc;
      const r = ur + dr;
      if (c < 0 || r < 0 || c >= COLS || r >= ROWS || !open(c, r)) continue;
      let v = key(c, r);
      const p = portalAt.get(v);
      let stone = -1;
      if (p) {
        stone = v;
        v = key(p.twin.c, p.twin.r);
      }
      const d = dist[u] + 1 + (extra.get(v) ?? 0);
      if (d < dist[v]) {
        dist[v] = d;
        prev[v] = u;
        if (stone >= 0) via.set(v, stone);
        else via.delete(v);
      }
    }
  }
}

/** Tile centres, with straight runs joined into one leg (a turn back, as at the key, is kept). */
function waypoints(tiles: Cell[]): Point[] {
  const pts = tiles.map((t) => centreOf(t.c, t.r));
  return pts.filter((p, i) => {
    if (i === 0 || i === pts.length - 1) return true;
    const a = pts[i - 1];
    const b = pts[i + 1];
    return Math.sign(p.x - a.x) !== Math.sign(b.x - p.x) || Math.sign(p.y - a.y) !== Math.sign(b.y - p.y);
  });
}

/** A route through a level: to the key first if there is a gate, then to the finish. With `portals`, teleport stones may be used. */
export function planRoute(level: number, portals = false): Route {
  const { map } = levelDef(level);
  const info = mapInfo(map);
  const starts = findTiles(map, "S");
  const finish = findTiles(map, "F");
  const stops: Cell[][] = info.key && findTiles(map, "g").length ? [[info.key], finish] : [finish];
  const legs: Cell[][] = [[]];
  let from = starts;
  stops.forEach((to, i) => {
    const path = tilePath(level, from, to, i > 0 || !findTiles(map, "g").length, portals);
    if (!path) throw new Error(`level ${level}: no way through`);
    path.tiles.forEach((t, j) => {
      const leg = legs[legs.length - 1];
      const last = leg[leg.length - 1];
      if (!last || last.c !== t.c || last.r !== t.r) leg.push(t); // the key's tile ends one path and starts the next
      if (path.hops.has(j)) legs.push([]);
    });
    from = [path.tiles[path.tiles.length - 1]];
  });
  // Straight runs joined; a leg after a hop starts on the twin.
  return { legs: legs.map(waypoints) };
}

/** True if a route uses a teleport stone. */
export const usesPortal = (route: Route) => route.legs.length > 1;

type Action = "go" | "wait" | "back";
interface Progress {
  leg: number;
  /** The waypoint he is heading for in the leg. */
  i: number;
}

const NEAR_KEYS = SPEED.keys / 2;

/** The move for one step of `action`, from where he is; heading for the next waypoint moves `p` on when one is reached. */
function move(route: Route, p: Progress, s: MazeState, speed: BotSpeed, action: Action): Intent {
  if (action === "wait") return { dx: 0, dy: 0 };
  const leg = route.legs[p.leg] ?? [];
  const toward = (t: Point): Intent | null => {
    const vx = t.x - s.x;
    const vy = t.y - s.y;
    if (speed === "pointer") {
      const d = Math.hypot(vx, vy);
      return d <= 0.5 ? null : limit(vx, vy, Math.min(SPEED.pointer, d));
    }
    const ix = Math.abs(vx) >= NEAR_KEYS ? Math.sign(vx) : 0;
    const iy = Math.abs(vy) >= NEAR_KEYS ? Math.sign(vy) : 0;
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

/** After a step: a teleport moves him on to the next leg. */
function track(p: Progress, ev: MazeEvents) {
  if (ev.teleported) {
    p.leg++;
    p.i = 0;
  }
}

/** Steps of looking ahead while walking, and the most steps to wait in one place. */
const AHEAD = 100;
const MAX_WAIT = 400;

/** True if walking on for `n` steps from here curses nobody (or clears the level first). */
function safeAhead(route: Route, s0: MazeState, p0: Progress, speed: BotSpeed, n: number): boolean {
  const s = cloneState(s0);
  const p = { ...p0 };
  for (let k = 0; k < n; k++) {
    const ev = stepMaze(s, move(route, p, s, speed, "go"));
    if (ev.cursed) return false;
    if (s.phase === "cleared") return true;
    track(p, ev);
  }
  return true;
}

/** The next few moves: wait as little as needed, backing off first if waiting here is not safe either. */
function plan(route: Route, s0: MazeState, p0: Progress, speed: BotSpeed): Action[] | null {
  for (const back of [0, 4, 8, 16, 32, 64]) {
    const s = cloneState(s0);
    const p = { ...p0 };
    let ok = true;
    for (let k = 0; k < back && ok; k++) {
      const ev = stepMaze(s, move(route, p, s, speed, "back"));
      ok = !ev.cursed;
      track(p, ev);
    }
    if (!ok) continue;
    for (let w = 0; w <= MAX_WAIT; w++) {
      if (w > 0) {
        const ev = stepMaze(s, { dx: 0, dy: 0 });
        if (ev.cursed) break;
      }
      if (safeAhead(route, s, p, speed, AHEAD + back))
        return [...Array<Action>(back).fill("back"), ...Array<Action>(w).fill("wait"), ...Array<Action>(AHEAD / 2).fill("go")];
    }
  }
  return null;
}

export interface Bot {
  readonly route: Route;
  /** The move for this step. */
  next(state: MazeState): Intent;
  /** What the step did; call it after each step taken with the bot's move. */
  after(ev: MazeEvents): void;
  /** True once it found no safe way on. */
  readonly stuck: boolean;
}

export function createBot(level: number, speed: BotSpeed, opts: { portals?: boolean } = {}): Bot {
  const route = planRoute(level, opts.portals ?? false);
  const p: Progress = { leg: 0, i: 0 };
  let queue: Action[] = [];
  let stuck = false;
  return {
    route,
    get stuck() {
      return stuck;
    },
    next(state) {
      if (state.phase !== "play") return { dx: 0, dy: 0 };
      if (!queue.length) {
        const found = plan(route, state, p, speed);
        if (!found) {
          stuck = true;
          return { dx: 0, dy: 0 };
        }
        queue = found;
      }
      return move(route, p, state, speed, queue.shift()!);
    },
    after(ev) {
      track(p, ev);
      if (ev.cursed) queue = []; // it should never happen; if it does, plan again after waking
    }
  };
}

export interface Played {
  cleared: boolean;
  /** The level clock at the clear, in steps. */
  steps: number;
  deaths: number;
  teleports: number;
  /** His centre after every step from the first move, in art pixels. */
  trail: Point[];
}

/** Plays a level from its start with the bot, at most `limitSteps` steps. */
export function playLevel(level: number, speed: BotSpeed, opts: { portals?: boolean; limitSteps?: number } = {}): Played {
  const s = newState(level);
  const bot = createBot(level, speed, opts);
  const trail: Point[] = [];
  let teleports = 0;
  for (let k = 0; k < (opts.limitSteps ?? 20000) && s.phase !== "cleared"; k++) {
    const ev = stepMaze(s, bot.next(s));
    bot.after(ev);
    if (ev.teleported) teleports++;
    if (s.started) trail.push({ x: s.x, y: s.y });
    if (bot.stuck) break;
  }
  return { cleared: s.phase === "cleared", steps: s.steps, deaths: s.deaths, teleports, trail };
}
