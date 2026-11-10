import { TILE } from "@larshansen/pixelkit/config";
import { LEVELS, centreOf, findTiles, finishOf, isWall, startCentre, startOf, type LevelDef, type SnakeDef } from "./levels";

// The rules of the maze, with no DOM in them, so they can be tested without a browser.
// Walls do not stop him: touching one is losing. That is the game.

/** His body is 6 x 6 art pixels; x and y are its centre. */
export const BODY = 6;
/** Steps he stands cursed before he wakes at the last lit stone. */
export const CURSE_STEPS = 40;
/** A snake is 12 x 6, lying along its line of travel. */
export const SNAKE_LONG = 12;
export const SNAKE_SHORT = 6;

/** The most he may move in one step, per way of steering, in art pixels. */
export const SPEED = { pointer: 1.6, keys: 1.2, careful: 0.6 } as const;

export interface Stone {
  c: number;
  r: number;
  lit: boolean;
}

export interface SnakeState {
  def: SnakeDef;
  /** Steps since the snake was at its starting end. */
  t: number;
}

export type Phase = "play" | "cursed" | "cleared";
export type Cause = "wall" | "snake";

export interface MazeState {
  /** 1 to 3. */
  level: number;
  x: number;
  y: number;
  /** Index into `stones` of the last lit one, or -1 for the start pad. */
  lit: number;
  stones: Stone[];
  snakes: SnakeState[];
  /** The level clock, in steps, from his first move. */
  steps: number;
  deaths: number;
  phase: Phase;
  /** Steps spent in the current phase. */
  phaseSteps: number;
  /** True from his first move in the level. */
  started: boolean;
  /** What cursed him last, for the raven. */
  cause: Cause | null;
}

/** What he wants to move by this step, in art pixels, already limited to the allowed speed. */
export interface Intent {
  dx: number;
  dy: number;
}

/** What happened during a step, for the scene to react to with sound and words. */
export interface MazeEvents {
  cursed?: Cause;
  /** Index of a stone that was lit for the first time this step. */
  lit?: number;
  /** He woke at the last lit stone. */
  respawned?: boolean;
  cleared?: boolean;
}

export const levelDef = (level: number): LevelDef => LEVELS[level - 1];

function freshSnakes(def: LevelDef): SnakeState[] {
  return def.snakes.map((s) => ({ def: s, t: 0 }));
}

/** A level as it begins: on the start pad, nothing lit, snakes at their starting ends. */
export function newState(level: number, deaths = 0): MazeState {
  const def = levelDef(level);
  const at = startCentre(def.map);
  return {
    level,
    x: at.x,
    y: at.y,
    lit: -1,
    stones: findTiles(def.map, "o").map((s) => ({ ...s, lit: false })),
    snakes: freshSnakes(def),
    steps: 0,
    deaths,
    phase: "play",
    phaseSteps: 0,
    started: false,
    cause: null
  };
}

/** Scales a movement down so that it is no longer than `max`, keeping its direction. */
export function limit(dx: number, dy: number, max: number): { dx: number; dy: number } {
  const len = Math.hypot(dx, dy);
  if (len <= max || len === 0) return { dx, dy };
  return { dx: (dx * max) / len, dy: (dy * max) / len };
}

/** Where a snake's centre is `t` steps after it was at its starting end: eased there and back. */
export function snakeAt(def: SnakeDef, t: number): { x: number; y: number } {
  const phase = (((t % def.period) + def.period) % def.period) / def.period;
  const e = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2); // 0 at the start, 1 half way round, 0 again
  const a = centreOf(def.from[0], def.from[1]);
  const b = centreOf(def.to[0], def.to[1]);
  return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
}

/** Which way the snake is going along its line: 1 is right (or down for a snake that runs up and down). */
export function snakeHeading(def: SnakeDef, t: number): 1 | -1 {
  const phase = (((t % def.period) + def.period) % def.period) / def.period;
  const along = snakeFlat(def) ? def.to[0] - def.from[0] : def.to[1] - def.from[1];
  const out = along >= 0 ? 1 : -1;
  return phase < 0.5 ? out : out === 1 ? -1 : 1;
}

/** True when the snake's line runs sideways, so it lies 12 wide and 6 tall. */
export const snakeFlat = (def: SnakeDef) => Math.abs(def.to[0] - def.from[0]) >= Math.abs(def.to[1] - def.from[1]);

/** The box a snake covers, top left corner and size. */
export function snakeBox(s: SnakeState): { x: number; y: number; w: number; h: number } {
  const at = snakeAt(s.def, s.t);
  const w = snakeFlat(s.def) ? SNAKE_LONG : SNAKE_SHORT;
  const h = snakeFlat(s.def) ? SNAKE_SHORT : SNAKE_LONG;
  return { x: at.x - w / 2, y: at.y - h / 2, w, h };
}

const EDGE = 1e-6;

/** True if a body centred at (x, y) overlaps a wall tile. */
export function touchesWall(map: readonly string[], x: number, y: number): boolean {
  const c0 = Math.floor((x - BODY / 2) / TILE);
  const c1 = Math.floor((x + BODY / 2 - EDGE) / TILE);
  const r0 = Math.floor((y - BODY / 2) / TILE);
  const r1 = Math.floor((y + BODY / 2 - EDGE) / TILE);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (isWall(map, c, r)) return true;
  return false;
}

/** True if a body centred at (x, y) overlaps the snake. */
export function touchesSnake(s: SnakeState, x: number, y: number): boolean {
  const b = snakeBox(s);
  return x - BODY / 2 < b.x + b.w && x + BODY / 2 > b.x && y - BODY / 2 < b.y + b.h && y + BODY / 2 > b.y;
}

const insideTile = (x: number, y: number, c: number, r: number, size = 1) =>
  x >= c * TILE && x < (c + size) * TILE && y >= r * TILE && y < (r + size) * TILE;

/** True when his centre is on the start pad. */
export function onStartPad(state: MazeState): boolean {
  const s = startOf(levelDef(state.level).map);
  return insideTile(state.x, state.y, s.c, s.r, 2);
}

/** One physics step, 60 a second. Changes `state` and says what happened. */
export function stepMaze(state: MazeState, intent: Intent): MazeEvents {
  const events: MazeEvents = {};
  const def = levelDef(state.level);
  if (state.phase === "cleared") {
    state.phaseSteps++;
    return events;
  }

  for (const s of state.snakes) s.t++;
  if (state.started) state.steps++;

  if (state.phase === "cursed") {
    if (++state.phaseSteps >= CURSE_STEPS) {
      // Back at the last lit stone, or the start pad, with the snakes at their starting ends.
      const at = state.lit >= 0 ? centreOf(state.stones[state.lit].c, state.stones[state.lit].r) : startCentre(def.map);
      state.x = at.x;
      state.y = at.y;
      state.deaths++;
      state.phase = "play";
      state.phaseSteps = 0;
      state.snakes = freshSnakes(def);
      events.respawned = true;
    }
    return events;
  }

  state.phaseSteps++;
  if (intent.dx !== 0 || intent.dy !== 0) {
    if (!state.started) state.started = true;
    state.x += intent.dx;
    state.y += intent.dy;
  }

  const cause: Cause | null = touchesWall(def.map, state.x, state.y) ? "wall" : state.snakes.some((s) => touchesSnake(s, state.x, state.y)) ? "snake" : null;
  if (cause) {
    state.phase = "cursed";
    state.phaseSteps = 0;
    state.cause = cause;
    events.cursed = cause;
    return events;
  }

  const i = state.stones.findIndex((s) => insideTile(state.x, state.y, s.c, s.r));
  if (i >= 0) {
    if (!state.stones[i].lit) {
      events.lit = i;
      state.stones[i].lit = true;
      state.lit = i;
    }
  }

  const f = finishOf(def.map);
  if (insideTile(state.x, state.y, f.c, f.r, 2)) {
    state.phase = "cleared";
    state.phaseSteps = 0;
    events.cleared = true;
  }
  return events;
}

/** Milliseconds as minutes, seconds and tenths, for the clock. */
export function formatTime(ms: number): string {
  const tenths = Math.floor(ms / 100);
  const m = Math.floor(tenths / 600);
  const s = Math.floor((tenths % 600) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${tenths % 10}`;
}
