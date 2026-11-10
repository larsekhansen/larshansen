import { TILE } from "@larshansen/pixelkit/config";
import { LEVELS, centreOf, findTiles, finishOf, isWall, startCentre, startOf, tileAt, type LevelDef, type SliderDef, type SnakeDef } from "./levels";

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

/** Steps the gate takes to slide open once the key is taken. */
export const GATE_STEPS = 30;
/** Steps a crumbling tile shakes before it falls. */
export const FALL_STEPS = 120;
/** The last steps before a slider turns to wall, in which it shimmers. */
export const WARN_STEPS = 60;
/** Steps a slider takes to rise out of the floor, or sink into it (drawing only: the wall is there at once). */
export const RISE_STEPS = 6;

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
export type Cause = "wall" | "snake" | "pit" | "slider";

export interface MazeState {
  /** 1 to 7. */
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
  /** The rune key has been picked up; a curse does not take it back. */
  keyTaken: boolean;
  /** Steps since the key was taken, up to GATE_STEPS (when the gate is open), or -1 while it is shut. */
  gate: number;
  /** Crumbling tiles he has stepped on, "col,row" to the steps they have shaken. A tile at FALL_STEPS has fallen: a pit. */
  crumble: Map<string, number>;
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
  /** He took the rune key. */
  key?: boolean;
  /** A crumbling tile fell this step. */
  fell?: boolean;
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
    cause: null,
    keyTaken: false,
    gate: -1,
    crumble: new Map()
  };
}

const tileKey = (c: number, r: number) => `${c},${r}`;

/** True once the gate has slid all the way open. */
export const gateOpen = (state: MazeState) => state.gate >= GATE_STEPS;

/** How far the gate has slid open, 0 (shut) to 1 (open). */
export const gateProgress = (state: MazeState) => (state.gate < 0 ? 0 : Math.min(1, state.gate / GATE_STEPS));

/** Steps a crumbling tile has shaken: 0 if he has not stepped on it, FALL_STEPS or more once it has fallen. */
export const crumbleAge = (state: MazeState, c: number, r: number) => state.crumble.get(tileKey(c, r)) ?? -1;

/** A crumbling tile that has fallen is a pit. */
export const isPit = (state: MazeState, c: number, r: number) => crumbleAge(state, c, r) >= FALL_STEPS;

/** Where a slider is in its round: `t` in 0 to period. It is wall while `t < period / 2`. */
export const sliderT = (d: SliderDef, steps: number) => (((steps + d.offset) % d.period) + d.period) % d.period;

/** True while the slider is wall. */
export const sliderSolid = (d: SliderDef, steps: number) => sliderT(d, steps) < d.period / 2;

/** How tall the slider's stone stands, 0 to 1: it rises over RISE_STEPS and sinks over RISE_STEPS. */
export function sliderRise(d: SliderDef, steps: number): number {
  const t = sliderT(d, steps);
  const half = d.period / 2;
  if (t < RISE_STEPS) return (t + 1) / (RISE_STEPS + 1);
  if (t < half) return 1;
  if (t < half + RISE_STEPS) return 1 - (t - half + 1) / (RISE_STEPS + 1);
  return 0;
}

/** True during the last WARN_STEPS before a floor slider turns to wall. */
export const sliderWarning = (d: SliderDef, steps: number) => !sliderSolid(d, steps) && d.period - sliderT(d, steps) <= WARN_STEPS;

/** The slider that covers tile (c, r), if there is one. */
export const sliderAt = (def: LevelDef, c: number, r: number) =>
  def.sliders.find((s) => c >= s.at[0] && c < s.at[0] + s.w && r >= s.at[1] && r < s.at[1] + s.h);

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

/** What a body centred at (x, y) is touching that would curse him: stone, a shut gate, a pit or a slider that is wall. */
export function solidCause(state: MazeState, x: number, y: number): Cause | null {
  const map = levelDef(state.level).map;
  const def = levelDef(state.level);
  const c0 = Math.floor((x - BODY / 2) / TILE);
  const c1 = Math.floor((x + BODY / 2 - EDGE) / TILE);
  const r0 = Math.floor((y - BODY / 2) / TILE);
  const r1 = Math.floor((y + BODY / 2 - EDGE) / TILE);
  let cause: Cause | null = null;
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const ch = tileAt(map, c, r);
      if (ch === "#" || (ch === "g" && !gateOpen(state))) return "wall";
      if (ch === "c" && isPit(state, c, r)) cause = "pit";
      else if (ch === "." && !cause) {
        const sl = sliderAt(def, c, r);
        if (sl && sliderSolid(sl, state.steps)) cause = "slider";
      }
    }
  return cause;
}

/** The crumbling tiles a body centred at (x, y) overlaps. */
function crumblingUnder(map: readonly string[], x: number, y: number): string[] {
  const out: string[] = [];
  const c0 = Math.floor((x - BODY / 2) / TILE);
  const c1 = Math.floor((x + BODY / 2 - EDGE) / TILE);
  const r0 = Math.floor((y - BODY / 2) / TILE);
  const r1 = Math.floor((y + BODY / 2 - EDGE) / TILE);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (tileAt(map, c, r) === "c") out.push(tileKey(c, r));
  return out;
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
  if (state.gate >= 0 && state.gate < GATE_STEPS) state.gate++;

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
      state.crumble = new Map(); // every crumbling tile is whole again
      events.respawned = true;
    }
    return events;
  }

  state.phaseSteps++;
  for (const [k, age] of state.crumble)
    if (age < FALL_STEPS) {
      state.crumble.set(k, age + 1);
      if (age + 1 === FALL_STEPS) events.fell = true;
    }
  if (intent.dx !== 0 || intent.dy !== 0) {
    if (!state.started) state.started = true;
    state.x += intent.dx;
    state.y += intent.dy;
  }

  for (const k of crumblingUnder(def.map, state.x, state.y)) if (!state.crumble.has(k)) state.crumble.set(k, 0);

  const cause: Cause | null = solidCause(state, state.x, state.y) ?? (state.snakes.some((s) => touchesSnake(s, state.x, state.y)) ? "snake" : null);
  if (cause) {
    state.phase = "cursed";
    state.phaseSteps = 0;
    state.cause = cause;
    events.cursed = cause;
    return events;
  }

  if (!state.keyTaken) {
    const k = findTiles(def.map, "k")[0];
    if (k && insideTile(state.x, state.y, k.c, k.r)) {
      state.keyTaken = true;
      state.gate = 0;
      events.key = true;
    }
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
