import { carriersNear, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { fellOut, respawnAt, touchFlags, type Checkpoints, type Flag } from "@larshansen/pixelkit/checkpoint";
import { PLAYER, STEP_MS, TILE } from "@larshansen/pixelkit/config";
import { LOAD_STEPS, cannon, fire, launcherHit, type Launcher } from "@larshansen/pixelkit/launcher";
import { bounce, createBody, placeBody, stepBody, type Body, type Carrier, type Intent, type StepResult } from "@larshansen/pixelkit/physics";
import { timedCarriers, timedPhase } from "@larshansen/pixelkit/timed";
import { footOf, tileMap, type TileMap } from "@larshansen/pixelkit/tilemap";
import { MARKS, type LevelDef } from "../levels/types";
import { SHEEP, createSheep, stepSheep, stomped, type Sheep } from "./sheep";

// The rules of a level, as pure state and one step function: no page, no sound, no drawing. The
// page plays it, and the tests play it with a scripted player, so both run exactly the same rules.

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Play {
  def: LevelDef;
  map: TileMap;
  body: Body;
  /** The level's clock in steps since it began: carriers and ledges on a beat run on it. */
  t: number;
  /** The run against the clock: it starts on his first move and stops at the rune. */
  run: { steps: number; state: "idle" | "running" | "done" };
  feather: boolean;
  start: { x: number; bottom: number };
  flags: Flag[];
  checkpoints: Checkpoints;
  /** The step each flag went up, or null. */
  raisedAt: (number | null)[];
  cannons: Launcher[];
  /** In a cannon's barrel: which one, and since when. */
  loaded: { i: number; at: number } | null;
  firedAt: number[];
  rune: Box | null;
  runeAt: number | null;
  bracteate: Box | null;
  bracteateAt: number | null;
  sheep: Sheep[];
  /** The last firm ground he stood on (not moving ground), where water puts him back before any flag. */
  lastGround: { x: number; bottom: number };
}

export interface Events {
  step: StepResult;
  /** He moved by himself this step (the clock starts on the first). */
  moved: boolean;
  splash: boolean;
  /** The index of a flag that went up, a cannon that took him in or fired, a bell he landed on. */
  flag: number | null;
  loaded: number | null;
  fired: number | null;
  bell: number | null;
  bleat: boolean;
  bracteate: boolean;
  rune: boolean;
}

/** The tiles marked with a letter, as boxes or feet. */
const marks = (map: TileMap, letter: string) => map.find(letter);

export function levelMap(def: LevelDef): TileMap {
  return tileMap({ map: def.map, legend: def.legend, ramps: def.ramps });
}

/** Map letters left to right (then top to bottom): the order the level's lists of cannons and signs follow. */
export const leftToRight = <T extends { c: number; r: number }>(tiles: T[]) => tiles.sort((a, b) => a.c - b.c || a.r - b.r);

/** The cannons on the map, left to right, with the level's velocities. */
export function cannonsOf(def: LevelDef, map: TileMap = levelMap(def)): Launcher[] {
  return leftToRight(map.find((ch) => ch === MARKS.cannonRight || ch === MARKS.cannonLeft))
    .map((t, i) => {
      const dir = t.ch === MARKS.cannonRight ? 1 : -1;
      const c = def.cannons[i] ?? { vx: 4, vy: 6 };
      return cannon(t.c * TILE - 4, (t.r + 1) * TILE, dir, c.vx, c.vy);
    });
}

export function flagsOf(map: TileMap): Flag[] {
  return marks(map, MARKS.flag).map(footOf);
}

/** The gold bracteate: a 12 x 12 disc in the middle of its tile. */
export function bracteateOf(map: TileMap): Box | null {
  const t = marks(map, MARKS.bracteate)[0];
  return t ? { x: t.c * TILE + 2, y: t.r * TILE + 2, w: 12, h: 12 } : null;
}

export function runeOf(map: TileMap): Box | null {
  const t = marks(map, MARKS.rune)[0];
  return t ? { x: t.c * TILE, y: t.r * TILE, w: TILE, h: TILE } : null;
}

export function newPlay(def: LevelDef, opts: { feather?: boolean; start?: { x: number; bottom: number } } = {}): Play {
  const map = levelMap(def);
  const start = opts.start ?? map.spawn();
  const flags = flagsOf(map);
  const cannons = cannonsOf(def, map);
  return {
    def,
    map,
    body: createBody(start.x, start.bottom),
    t: 0,
    run: { steps: 0, state: "idle" },
    feather: !!opts.feather,
    start,
    flags,
    checkpoints: { reached: null },
    raisedAt: flags.map(() => null),
    cannons,
    loaded: null,
    firedAt: cannons.map(() => -999),
    rune: runeOf(map),
    runeAt: null,
    bracteate: bracteateOf(map),
    bracteateAt: null,
    sheep: createSheep(marks(map, MARKS.sheep).map(footOf)),
    lastGround: { ...start }
  };
}

const overlaps = (b: Body, r: Box) => b.x < r.x + r.w && b.x + PLAYER.w > r.x && b.y < r.y + r.h && b.y + PLAYER.h > r.y;

/** Moving ground this step: the carriers near him and the ledges on a beat that are there. */
export function extraGround(p: Play, t = p.t): Carrier[] {
  return [...carriersNear(p.def.carriers, t, p.body), ...timedCarriers(p.def.timed, t)];
}

/** The ledge on a beat he stands on, if any. */
function bellUnder(p: Play): number | null {
  const b = p.body;
  if (!b.onGround) return null;
  const feet = b.y + PLAYER.h;
  const i = p.def.timed.findIndex((l) => Math.abs(l.y - feet) < 0.01 && b.x + PLAYER.w > l.x && b.x < l.x + l.w && timedPhase(p.t, l) !== "off");
  return i < 0 ? null : i;
}

/** Puts him down standing at (x, bottom), still, after a fall. */
function putBack(p: Play, at: { x: number; bottom: number }) {
  placeBody(p.body, at.x, at.bottom);
  p.body.launched = false;
}

/** One step of the level. Pure apart from `p`, which it moves on. */
export function stepPlay(p: Play, intent: Intent): Events {
  const ev: Events = { step: { jumped: false, landed: 0 }, moved: false, splash: false, flag: null, loaded: null, fired: null, bell: null, bleat: false, bracteate: false, rune: false };
  p.t++;
  if (p.run.state === "running") p.run.steps++;
  const b = p.body;

  // In a cannon: he waits in the barrel, unseen, then it fires.
  if (p.loaded) {
    const l = p.cannons[p.loaded.i];
    b.vx = 0;
    b.vy = 0;
    if (p.t - p.loaded.at >= LOAD_STEPS) {
      fire(l, b);
      p.firedAt[p.loaded.i] = p.t;
      ev.fired = p.loaded.i;
      p.loaded = null;
    }
    return ev;
  }
  if (p.run.state === "done") intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };

  const prevBottom = b.y + PLAYER.h;
  ev.step = stepBody(b, intent, p.map, { doubleJump: p.feather }, { carriers: extraGround(p) });
  ev.moved = intent.left || intent.right || ev.step.jumped;
  if (ev.moved && p.run.state === "idle") p.run.state = "running";

  // Sheep: coming down on one from above is a trampoline.
  for (const s of p.sheep) stepSheep(s);
  for (const s of p.sheep)
    if (stomped(b, prevBottom, s)) {
      bounce(b, 7);
      b.y = s.bottom - SHEEP.h - PLAYER.h;
      s.squash = SHEEP.squashSteps;
      ev.bleat = true;
      break;
    }

  // A cannon takes him in.
  p.cannons.forEach((l, i) => {
    if (!p.loaded && launcherHit(l, b) && !b.launched) {
      p.loaded = { i, at: p.t };
      ev.loaded = i;
      b.x = l.x + l.w / 2 - PLAYER.w / 2;
      b.y = l.y + l.h - PLAYER.h;
    }
  });

  const before = p.checkpoints.reached;
  p.checkpoints = touchFlags(p.checkpoints, p.flags, b);
  if (p.checkpoints.reached !== before && p.checkpoints.reached !== null) {
    ev.flag = p.checkpoints.reached;
    p.raisedAt[ev.flag] = p.t;
  }

  if (ev.step.landed > 0) ev.bell = bellUnder(p);

  if (p.bracteate && p.bracteateAt === null && overlaps(b, p.bracteate)) {
    p.bracteateAt = p.t;
    ev.bracteate = true;
  }
  if (p.rune && p.runeAt === null && overlaps(b, p.rune)) {
    p.runeAt = p.t;
    p.run.state = "done";
    ev.rune = true;
  }

  // Water, or off the bottom of the map: back to the last flag, or the last firm ground.
  if (fellOut(b, p.map)) {
    ev.splash = true;
    putBack(p, p.checkpoints.reached === null ? p.lastGround : respawnAt(p.checkpoints, p.flags, p.start));
  } else if (b.onGround && p.map.supports(b)) p.lastGround = { x: b.x + PLAYER.w / 2, bottom: b.y + PLAYER.h };
  return ev;
}

export const elapsedMs = (p: Play) => p.run.steps * STEP_MS;

/** 0:00.0, as in a header clock. */
export function formatTime(ms: number): string {
  const tenths = Math.floor(ms / 100);
  const m = Math.floor(tenths / 600);
  const s = Math.floor((tenths % 600) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${tenths % 10}`;
}

/** Where a cannon will throw him: his centre every few steps for a second, over the level's tiles. */
export function cannonArc(p: Play, i: number, steps = 60, every = 3): { x: number; y: number }[] {
  const b = createBody(0, 0);
  fire(p.cannons[i], b);
  const out: { x: number; y: number }[] = [];
  for (let s = 1; s <= steps; s++) {
    stepBody(b, { left: false, right: false, jumpHeld: false, jumpPressed: false }, p.map);
    if (s % every === 0) out.push({ x: b.x + PLAYER.w / 2, y: b.y + PLAYER.h / 2 });
    if (b.onGround) break;
  }
  return out;
}

/** Where a carrier def is in the list, for drawing it. */
export const carrierIndex = (p: Play, d: CarrierDef) => p.def.carriers.indexOf(d);
