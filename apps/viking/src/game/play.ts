import { carriersNear, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { fellOut, respawnAt, touchFlags, type Checkpoints, type Flag } from "@larshansen/pixelkit/checkpoint";
import { DASH, MOVE, PLAYER, STEP_MS, TILE } from "@larshansen/pixelkit/config";
import { hazardTouched } from "@larshansen/pixelkit/hazard";
import { LOAD_STEPS, cannon, drum, fire, launcherHit, type Launcher } from "@larshansen/pixelkit/launcher";
import { bounce, createBody, dashStep, launch, placeBody, stepBody, type Body, type Carrier, type Intent, type StepResult } from "@larshansen/pixelkit/physics";
import { timedCarriers, timedPhase } from "@larshansen/pixelkit/timed";
import { footOf, tileMap, type TileMap } from "@larshansen/pixelkit/tilemap";
import { zonePush } from "@larshansen/pixelkit/zone";
import { MARKS, type Boss, type LevelDef } from "../levels/types";
import { KIND, createEnemies, enemyBox, shotBox, stepEnemies, type Enemy, type Shot } from "./enemies";
import { SHEEP, createSheep, stepSheep, stomped, type Sheep } from "./sheep";
import { TROLL, createTroll, resetTroll, stepTroll, trollBox, trollHurts, type Troll, type TrollEvent } from "./troll";

// The rules of a level, as pure state and one step function: no page, no sound, no drawing. The
// page plays it, and the tests play it with a scripted player, so both run exactly the same rules.
//
// He has three hearts and some lives. An enemy's touch, or a fall into water or a pit, takes a
// heart; with no hearts left a life goes, and with no lives left the level is over (and starts
// again from the beginning). Flags keep the spot when touched; a bench keeps it and fills the
// hearts when he sits on it. Skilling are counted, 100 make a life, and a slice of brown cheese is
// a life. With the ski pole (from Holmenkollen) he can dash. Zones push him (a waterfall down), and
// in Nordmarka the troll waits at the end: the rune shows when it has turned to stone.

/** Hearts he has when a level starts or a life begins; lives he starts the game with. */
export const HEARTS = 3;
export const LIVES = 3;
/** Steps he blinks and cannot be hurt after a hit or a fall: a second and a half. */
export const SAFE_STEPS = 90;
/** The knock a hit gives him, away from what hit him. */
export const KNOCK = { vx: 1.8, vy: 3.2 };
/** How high landing on an enemy throws him: with the jump held, and without. */
export const STOMP = { held: 6, plain: 4.2 };
/** Skilling that make a life. */
export const PURSE_LIFE = 100;
/** Steps between two dashes, so the pole is a move, not a way to fly. */
export const DASH_REST = 24;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What the player asks for this step: the keys, plus sitting down (up at a bench) and the dash. */
export interface PlayIntent extends Intent {
  sit?: boolean;
  dash?: boolean;
}

export interface Play {
  def: LevelDef;
  map: TileMap;
  body: Body;
  /** The level's clock in steps since it began: carriers and ledges on a beat run on it. */
  t: number;
  /** The run against the clock: it starts on his first move and stops at the rune. */
  run: { steps: number; state: "idle" | "running" | "done" | "over" };
  feather: boolean;
  /** The ski pole: the dash. */
  pole: boolean;
  start: { x: number; bottom: number };
  flags: Flag[];
  checkpoints: Checkpoints;
  /** The step each flag went up, or null. */
  raisedAt: (number | null)[];
  /** Where a fall or a lost life puts him: the last flag raised or bench sat on. */
  save: { x: number; bottom: number } | null;
  cannons: Launcher[];
  /** In a cannon's barrel: which one, and since when. */
  loaded: { i: number; at: number } | null;
  firedAt: number[];
  drums: Launcher[];
  drummedAt: number[];
  rune: Box | null;
  runeAt: number | null;
  bracteate: Box | null;
  bracteateAt: number | null;
  sheep: Sheep[];
  /** The last firm ground he stood on (not moving ground), where water puts him back before any flag. */
  lastGround: { x: number; bottom: number };
  hearts: number;
  lives: number;
  /** He lost a heart somewhere in this run (the card's waffle mark is for a run without). */
  hurt: boolean;
  /** Until this step he blinks and nothing hurts him. */
  safeUntil: number;
  enemies: Enemy[];
  shots: Shot[];
  benches: { x: number; bottom: number }[];
  /** Sitting on a bench: which, and since when. */
  sitting: { i: number; since: number } | null;
  /** Each skilling on the map: a box, and the step it was taken, or null. */
  skilling: { box: Box; at: number | null }[];
  /** Skilling taken from the map in this run. */
  found: number;
  /** All skilling taken, carried from level to level until a hundred make a life. */
  purse: number;
  /** For the chime that climbs: how many were taken close together, and when the last was. */
  chain: { n: number; at: number };
  cheese: { box: Box; at: number | null } | null;
  /** Dashing: steps left and the way; whether the dash is spent until he lands; when the last one ended. */
  dash: { left: number; dir: 1 | -1 } | null;
  dashSpent: boolean;
  dashEnded: number;
  /** The troll, in the level that has one. */
  troll: Troll | null;
  /** The last boss, in the level that has one: its rules (from the level's own module) and its state. */
  boss: { rules: Boss; state: unknown } | null;
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
  drum: number | null;
  bell: number | null;
  bleat: boolean;
  bracteate: boolean;
  rune: boolean;
  /** A skilling taken: its place in a run of them taken close together (for the climbing chime). */
  coin: number | null;
  /** An enemy he landed on, which is beaten (and gives a skilling). */
  stomp: number | null;
  /** A heart lost, to a touch or a fall; a life lost; a life won; the level over. */
  hurt: boolean;
  lifeLost: boolean;
  life: boolean;
  over: boolean;
  bench: number | null;
  dash: boolean;
  /** Throwers that threw this step. */
  thrown: number[];
  /** What the troll did this step: woke, raised its club, slammed it down, was hit by the dawn, turned to stone. */
  troll: TrollEvent;
  /** What the last boss did this step, in its own words ("wake", "windup", "hit", "beaten"...), or null. */
  boss: string | null;
  /** He touched a hazard (the third rail): it sparks. */
  zap: boolean;
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
  return leftToRight(map.find((ch) => ch === MARKS.cannonRight || ch === MARKS.cannonLeft)).map((t, i) => {
    const dir = t.ch === MARKS.cannonRight ? 1 : -1;
    const c = def.cannons[i] ?? { vx: 4, vy: 6 };
    return cannon(t.c * TILE - 4, (t.r + 1) * TILE, dir, c.vx, c.vy);
  });
}

/** The bass drums on the map: each stands on the floor of its tile and throws him straight up. */
export function drumsOf(def: LevelDef, map: TileMap = levelMap(def)): Launcher[] {
  return leftToRight(marks(map, MARKS.drum)).map((t) => drum(t.c * TILE, (t.r + 1) * TILE, def.drum ?? 7));
}

/** The flags, in the order he meets them: left to right. */
export function flagsOf(map: TileMap): Flag[] {
  return leftToRight(marks(map, MARKS.flag)).map(footOf);
}

export function benchesOf(map: TileMap): { x: number; bottom: number }[] {
  return leftToRight(marks(map, MARKS.bench)).map(footOf);
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

/** A skilling: an 8 x 8 box round the coin in the middle of its tile, a little larger than it looks. */
export function skillingOf(map: TileMap): Box[] {
  return marks(map, MARKS.skilling).map((t) => ({ x: t.c * TILE + 4, y: t.r * TILE + 4, w: 8, h: 8 }));
}

export function cheeseOf(map: TileMap): Box | null {
  const t = marks(map, MARKS.cheese)[0];
  return t ? { x: t.c * TILE + 2, y: t.r * TILE + 4, w: 12, h: 10 } : null;
}

export interface PlayOptions {
  feather?: boolean;
  pole?: boolean;
  start?: { x: number; bottom: number };
  /** Lives and skilling carried from the level before. */
  lives?: number;
  purse?: number;
}

export function newPlay(def: LevelDef, opts: PlayOptions = {}): Play {
  const map = levelMap(def);
  const start = opts.start ?? map.spawn();
  const flags = flagsOf(map);
  const cannons = cannonsOf(def, map);
  const drums = drumsOf(def, map);
  const cheese = cheeseOf(map);
  return {
    def,
    map,
    body: createBody(start.x, start.bottom),
    t: 0,
    run: { steps: 0, state: "idle" },
    feather: !!opts.feather,
    pole: !!opts.pole,
    start,
    flags,
    checkpoints: { reached: null },
    raisedAt: flags.map(() => null),
    save: null,
    cannons,
    loaded: null,
    firedAt: cannons.map(() => -999),
    drums,
    drummedAt: drums.map(() => -999),
    rune: runeOf(map),
    runeAt: null,
    bracteate: bracteateOf(map),
    bracteateAt: null,
    sheep: createSheep(marks(map, MARKS.sheep).map(footOf), def.sheepRange),
    lastGround: { ...start },
    hearts: HEARTS,
    lives: Math.max(1, opts.lives ?? LIVES),
    hurt: false,
    safeUntil: 0,
    enemies: createEnemies(def.enemies ?? [], map),
    shots: [],
    benches: benchesOf(map),
    sitting: null,
    skilling: skillingOf(map).map((box) => ({ box, at: null })),
    found: 0,
    purse: Math.max(0, opts.purse ?? 0),
    chain: { n: 0, at: -999 },
    cheese: cheese ? { box: cheese, at: null } : null,
    dash: null,
    dashSpent: false,
    dashEnded: -999,
    troll: def.troll ? createTroll(def.troll) : null,
    boss: def.boss ? { rules: def.boss, state: def.boss.create() } : null
  };
}

export const overlaps = (b: Body, r: Box) => b.x < r.x + r.w && b.x + PLAYER.w > r.x && b.y < r.y + r.h && b.y + PLAYER.h > r.y;

/** Moving ground this step: the carriers near him and the ledges on a beat that are there. */
export function extraGround(p: Play, t = p.t): Carrier[] {
  const out = [...carriersNear(p.def.carriers, t, p.body), ...timedCarriers(p.def.timed, t)];
  // The troll turned to stone is a boulder he can stand on.
  if (p.troll?.phase === "stone") {
    const box = trollBox(p.troll);
    out.push({ x: box.x, y: box.y, w: box.w, dx: 0, dy: 0 });
  }
  return out;
}

/** The ledge on a beat he stands on, if any. */
function bellUnder(p: Play): number | null {
  const b = p.body;
  if (!b.onGround) return null;
  const feet = b.y + PLAYER.h;
  const i = p.def.timed.findIndex((l) => Math.abs(l.y - feet) < 0.01 && b.x + PLAYER.w > l.x && b.x < l.x + l.w && timedPhase(p.t, l) !== "off");
  return i < 0 ? null : i;
}

/** The bench he stands at, if any: on its ground, within a few pixels of it. */
export function benchAt(p: Play): number | null {
  const b = p.body;
  if (!b.onGround) return null;
  const cx = b.x + PLAYER.w / 2;
  const i = p.benches.findIndex((s) => Math.abs(cx - s.x) < 12 && Math.abs(b.y + PLAYER.h - s.bottom) < 0.5);
  return i < 0 ? null : i;
}

/** Puts him down standing at (x, bottom), still, after a fall. */
function putBack(p: Play, at: { x: number; bottom: number }) {
  placeBody(p.body, at.x, at.bottom);
  p.body.launched = false;
  p.dash = null;
  p.sitting = null;
}

/** No hearts left: a life goes, and he starts again at the last flag or bench with full hearts; with no lives left, the level is over. */
function loseLife(p: Play, ev: Events) {
  p.lives--;
  ev.lifeLost = true;
  if (p.lives <= 0) {
    p.lives = 0;
    p.run.state = "over";
    ev.over = true;
    return;
  }
  p.hearts = HEARTS;
  putBack(p, p.save ?? p.start);
  p.safeUntil = p.t + SAFE_STEPS;
  if (p.troll) resetTroll(p.troll, p.t);
  if (p.boss) p.boss.rules.reset(p.boss.state, p.t);
}

/** A touch from something that hurts, from `fromX`: a heart, a knock away from it, and a moment of safety. */
function hit(p: Play, ev: Events, fromX: number) {
  if (p.t < p.safeUntil || p.run.state === "done" || p.run.state === "over") return;
  p.hearts--;
  p.hurt = true;
  ev.hurt = true;
  p.safeUntil = p.t + SAFE_STEPS;
  p.dash = null;
  p.sitting = null;
  if (p.hearts <= 0) return loseLife(p, ev);
  const away = p.body.x + PLAYER.w / 2 < fromX ? -1 : 1;
  launch(p.body, away * KNOCK.vx, -KNOCK.vy);
}

/** A skilling for the purse: every hundred is a life. */
function addToPurse(p: Play, ev: Events) {
  p.purse++;
  if (p.purse >= PURSE_LIFE) {
    p.purse -= PURSE_LIFE;
    p.lives++;
    ev.life = true;
  }
}

/** The enemies: they move, they throw, and he either lands on them or is hurt by them. */
function meetEnemies(p: Play, ev: Events, intent: PlayIntent, prevBottom: number) {
  const b = p.body;
  ev.thrown = stepEnemies(p.enemies, p.shots, p.map, p.t, b);
  if (p.run.state === "done") return;
  for (let i = 0; i < p.enemies.length; i++) {
    const e = p.enemies[i];
    const box = enemyBox(e, p.t);
    if (!box || !overlaps(b, box)) continue;
    // Coming down on it from above: his feet were over its top (as it was, or as it is now) a step ago.
    const top = Math.min(box.y, e.prevY - e.h);
    const fromAbove = b.vy > 0 && prevBottom <= Math.max(box.y, e.prevY - e.h) + 2 && b.y + PLAYER.h - 1 <= top + Math.max(4, b.vy + 2);
    if (fromAbove && KIND[e.def.kind].stomp) {
      e.alive = false;
      e.beatenAt = p.t;
      ev.stomp = i;
      // Beaten in the step it threw: the throw never leaves its hand.
      for (let k = p.shots.length - 1; k >= 0; k--) if (p.shots[k].by === i && p.shots[k].born === p.t) p.shots.splice(k, 1);
      ev.thrown = ev.thrown.filter((x) => x !== i);
      bounce(b, intent.jumpHeld ? STOMP.held : STOMP.plain);
      b.y = box.y - PLAYER.h;
      p.dashSpent = false;
      addToPurse(p, ev);
      break;
    }
    // Landing on a spiky thing hurts, and throws him up off it so he is not left standing on it.
    hit(p, ev, e.x);
    if (fromAbove && !ev.lifeLost) launch(b, (b.x + PLAYER.w / 2 < e.x ? -1 : 1) * KNOCK.vx, -KNOCK.vy - 1);
    break;
  }
  for (let k = p.shots.length - 1; k >= 0; k--)
    if (overlaps(b, shotBox(p.shots[k]))) {
      const s = p.shots.splice(k, 1)[0];
      hit(p, ev, s.x - s.vx * 4);
    }
}

/** The troll: it moves, it hurts, and the dawn hits it. Once it is stone the rune shows on top of it. */
function meetTroll(p: Play, ev: Events) {
  const t = p.troll;
  if (!t || p.run.state === "done") return;
  ev.troll = stepTroll(t, p.t, p.body);
  if (ev.troll === "stone" && p.rune) p.rune = { ...p.rune, x: t.x - p.rune.w / 2, y: t.def.floor - TROLL.h - p.rune.h - 4 };
  const hurt = trollHurts(t, p.t, p.body);
  if (hurt) hit(p, ev, hurt.fromX);
}

/** The last boss: it moves, it hurts, and coming down on it from above is a hit (or, while it is reeling, a bounce off it). */
function meetBoss(p: Play, ev: Events, intent: PlayIntent, prevBottom: number) {
  const bs = p.boss;
  if (!bs || p.run.state === "done") return;
  const b = p.body;
  ev.boss = bs.rules.step(bs.state, p.t, b);
  const landed = bs.rules.stomped(bs.state, p.t, b, prevBottom);
  if (landed) {
    b.y = landed.top - PLAYER.h;
    bounce(b, landed.speed ?? (intent.jumpHeld ? STOMP.held : STOMP.plain));
    p.dash = null;
    p.dashSpent = false;
    if (landed.hit) ev.boss = "hit";
    else if (landed.event) ev.boss = landed.event;
    return;
  }
  const hurt = bs.rules.hurts(bs.state, p.t, b);
  if (hurt) hit(p, ev, hurt.fromX);
}

/** True when nothing stands between him and the rune any more: no troll, or it is stone; no boss, or it is beaten. */
export const runeFree = (p: Play) => (!p.troll || p.troll.phase === "stone") && (!p.boss || p.boss.rules.beaten(p.boss.state));

/** One step of the level. Pure apart from `p`, which it moves on. */
export function stepPlay(p: Play, intent: PlayIntent): Events {
  const ev: Events = {
    step: { jumped: false, landed: 0 },
    moved: false,
    splash: false,
    flag: null,
    loaded: null,
    fired: null,
    drum: null,
    bell: null,
    bleat: false,
    bracteate: false,
    rune: false,
    coin: null,
    stomp: null,
    hurt: false,
    lifeLost: false,
    life: false,
    over: false,
    bench: null,
    dash: false,
    thrown: [],
    troll: null,
    boss: null,
    zap: false
  };
  if (p.run.state === "over") return ev;
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

  // On a bench he sits until he walks or jumps off it.
  if (p.sitting) {
    if (intent.left || intent.right || intent.jumpPressed) p.sitting = null;
    else intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
  } else if (intent.sit) {
    const i = benchAt(p);
    if (i !== null) {
      p.sitting = { i, since: p.t };
      p.hearts = HEARTS;
      p.save = { ...p.benches[i] };
      b.vx = 0;
      ev.bench = i;
      intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
    }
  }

  // The ski pole: a dash, level, the way he faces or steers, once each time he is off the ground.
  if (p.pole && intent.dash && !p.dash && !p.dashSpent && !p.sitting && p.t - p.dashEnded >= DASH_REST) {
    p.dash = { left: DASH.steps, dir: intent.left ? -1 : intent.right ? 1 : b.facing };
    p.dashSpent = true;
    b.facing = p.dash.dir;
    ev.dash = true;
    ev.moved = true;
  }

  const prevBottom = b.y + PLAYER.h;
  if (p.dash) {
    const going = dashStep(b, p.dash.dir, DASH.speed, p.map);
    if (--p.dash.left <= 0 || !going) {
      b.vx = p.dash.dir * MOVE.run;
      p.dash = null;
      p.dashEnded = p.t;
    }
  } else {
    ev.step = stepBody(b, intent, p.map, { doubleJump: p.feather }, { carriers: extraGround(p), surfaceAt: p.def.surfaceAt ? (x, y) => p.def.surfaceAt!(x, y, p.t) : undefined, push: zonePush(p.def.zones, b, p.t) });
    if (b.onGround) p.dashSpent = false;
  }
  ev.moved = ev.moved || intent.left || intent.right || ev.step.jumped;
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

  // A cannon takes him in; a drum throws him up.
  p.cannons.forEach((l, i) => {
    if (!p.loaded && launcherHit(l, b) && !b.launched) {
      p.loaded = { i, at: p.t };
      ev.loaded = i;
      b.x = l.x + l.w / 2 - PLAYER.w / 2;
      b.y = l.y + l.h - PLAYER.h;
      p.dash = null;
    }
  });
  p.drums.forEach((l, i) => {
    if (!launcherHit(l, b)) return;
    // Landing on its skin, he leaves from the top of it; walking into it, from where he is.
    if (prevBottom <= l.y + 2) b.y = l.y - PLAYER.h;
    fire(l, b);
    p.drummedAt[i] = p.t;
    p.dash = null;
    p.dashSpent = false;
    ev.drum = i;
  });

  meetEnemies(p, ev, intent, prevBottom);
  if (ev.over) return ev;
  meetTroll(p, ev);
  if (ev.over) return ev;
  meetBoss(p, ev, intent, prevBottom);
  if (ev.over) return ev;
  // The third rail, a spark: a heart, as an enemy's touch is. It throws him up clear of it, a tile
  // over its top, and back the way he came, so a rail at the bottom of a trench throws him out of it.
  const zapped = hazardTouched(p.def.hazards, b, p.t);
  if (zapped && p.t >= p.safeUntil && p.run.state !== "done") {
    ev.zap = true;
    b.y = Math.min(b.y, zapped.y - TILE - PLAYER.h);
    hit(p, ev, b.x + PLAYER.w / 2 + b.facing);
    if (ev.over) return ev;
  }

  const before = p.checkpoints.reached;
  p.checkpoints = touchFlags(p.checkpoints, p.flags, b);
  if (p.checkpoints.reached !== before && p.checkpoints.reached !== null) {
    ev.flag = p.checkpoints.reached;
    p.raisedAt[ev.flag] = p.t;
    p.save = { ...p.flags[ev.flag] };
  }

  if (ev.step.landed > 0) ev.bell = bellUnder(p);

  // Skilling, the brown cheese, the bracteate and the rune.
  for (const s of p.skilling)
    if (s.at === null && overlaps(b, s.box)) {
      s.at = p.t;
      p.found++;
      p.chain = { n: p.t - p.chain.at < 40 ? p.chain.n + 1 : 0, at: p.t };
      ev.coin = p.chain.n;
      addToPurse(p, ev);
    }
  if (p.cheese && p.cheese.at === null && overlaps(b, p.cheese.box)) {
    p.cheese.at = p.t;
    p.lives++;
    ev.life = true;
  }
  if (p.bracteate && p.bracteateAt === null && overlaps(b, p.bracteate)) {
    p.bracteateAt = p.t;
    ev.bracteate = true;
  }
  if (p.rune && p.runeAt === null && runeFree(p) && overlaps(b, p.rune)) {
    p.runeAt = p.t;
    p.run.state = "done";
    ev.rune = true;
  }

  // Water, a pit, or off the bottom of the map: a heart, and back to the last flag or bench (the last firm ground before any).
  if (fellOut(b, p.map)) {
    ev.splash = true;
    if (p.run.state === "done") {
      putBack(p, p.lastGround);
      return ev;
    }
    p.hearts--;
    p.hurt = true;
    ev.hurt = true;
    if (p.hearts <= 0) loseLife(p, ev);
    else {
      putBack(p, p.save ?? (p.checkpoints.reached === null ? p.lastGround : respawnAt(p.checkpoints, p.flags, p.start)));
      p.safeUntil = p.t + SAFE_STEPS;
    }
  } else if (b.onGround && firmUnder(p.map, b)) p.lastGround = { x: b.x + PLAYER.w / 2, bottom: b.y + PLAYER.h };
  return ev;
}

/** True when he stands on firm ground (a tile, a ledge or a slope, not moving ground) under all of him, not hanging over an edge. */
function firmUnder(map: TileMap, b: Body): boolean {
  if (!map.supports(b)) return false;
  const feet = b.y + PLAYER.h;
  return [b.x + 1, b.x + PLAYER.w - 1].every((x) => {
    const ramp = map.rampAt(x);
    if (ramp !== null && Math.abs(ramp - feet) < 1.5) return true;
    const r = Math.round(feet / TILE);
    const c = Math.floor(x / TILE);
    return map.isSolid(c, r) || map.isOneWay(c, r);
  });
}

export const elapsedMs = (p: Play) => p.run.steps * STEP_MS;

/** True while he blinks after a hit: drawn every other few steps. */
export const blinking = (p: Play) => p.t < p.safeUntil && p.run.state === "running";

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
