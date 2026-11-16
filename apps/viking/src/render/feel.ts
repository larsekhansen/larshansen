import { carrierDrawn, carrierShown, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { HOIST_STEPS, POLE } from "@larshansen/pixelkit/checkpoint";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { R, ctx, target as setTarget, view } from "@larshansen/pixelkit/paint";
import { COIN, DUST, ENEMY, FEATHER, FLAG, FOOD, LAMP, METAL, PALETTE, ROLES, STAND, SWEATER, WHITE } from "@larshansen/pixelkit/palette";
import { playerPixels, type Look } from "@larshansen/pixelkit/person";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Sfx, Voice } from "@larshansen/pixelkit/sfx";
import { FONT, fontPx, snap, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { WINDUP, untilThrow, type Enemy } from "../game/enemies";
import { HEARTS, runeFree, type Events, type Play } from "../game/play";
import { LINE_Y, stationX } from "../levels/kart";
import { drawBracteate } from "./actors";
import { LOOKS, drawCheese, drawSkilling } from "./pickups";
import { DEEP_FALL, MARGIN, dressed, himFrame } from "../alive/him";
import { pixels, type Frame } from "../alive/frames";
import { shadows } from "../alive/shadows";
import { DEATH, deathFrame, drawDeath } from "../alive/death";
import { drawFoeLook } from "../alive/foes";
import { clock } from "../alive/parts";
import { bench, bracteate, bracteateOutline, cheese, feather, flag, runeStone, sheep, skiPole, skilling } from "../alive/things";
import { DEPTH } from "./backdrop";
import { fjord } from "../alive/depth";
import { drawFore } from "../alive/fore";

// The frames (order 23): the shared enemies and the small things are drawn from them once this file is here; the
// fjord's water is a plane that recedes.
Object.assign(LOOKS, { enemy: drawFoeLook, skilling, cheese, bench, bracteate, bracteateOutline, rune: runeStone, sheep, flag, pole: skiPole, feather });
DEPTH.fjord = fjord;

// Felt at a glance (order 19, ADR 0040): every event answers at once, where it happened, in its role's
// colour (ADR 0039), with a sound, and with a still answer under reduced motion. This file is the answers:
// what the page draws and plays when the rules say something happened. It never touches the rules: it
// reads the play and its events, and draws and sounds. It comes in a file of its own, fetched with the
// first scene, since the first script has no room for it.
//
// What it keeps is fixed in size and made once: forty particles (plain rectangles), six rings, four sounds
// waiting their turn. Nothing it does in a frame makes anything new.

/** The longest a picture holds after a hit or a boss hit (drawing only: the rules go on), in steps. */
export const HOLD = 4;
/** Particles alive at once, at most. */
export const PARTICLES = 40;

// --- Sounds -----------------------------------------------------------------------------------------

/**
 * Every event's sound, from the kit's synth (its tones and noise). Neighbours are told apart with eyes
 * shut: a hit falls (a square and a burst of noise), a stomp is a thump with a squeak up, a block is a high
 * metallic clang, a dud stomp two dry ticks with no noise at all. The test holds them apart.
 */
export const VOICES = {
  hurt: [["t", "square", 330, 110, 0.18, 0.12], ["n", 1500, 200, 0.12, 0.2]],
  stomp: [["n", 800, 150, 0.06, 0.25], ["t", "square", 220, 440, 0.07, 0.1]],
  block: [["t", "square", 1320, 1180, 0.05, 0.08], ["t", "triangle", 990, 960, 0.2, 0.16, 0.01], ["n", 7000, 4000, 0.05, 0.1]],
  dud: [["t", "triangle", 1760, 1760, 0.035, 0.14], ["t", "triangle", 1760, 1760, 0.035, 0.1, 0.07]],
  bossHit: [["t", "triangle", 220, 130, 0.14, 0.3], ["n", 600, 150, 0.06, 0.15], ["t", "square", 660, 330, 0.12, 0.06]],
  throw: [["n", 900, 4000, 0.13, 0.12]],
  land: [["n", 500, 100, 0.07, 0.25]],
  thud: [["t", "sine", 110, 45, 0.18, 0.35], ["n", 400, 70, 0.12, 0.32]],
  splash: [["n", 2200, 200, 0.28, 0.45]],
  pit: [["n", 1800, 120, 0.45, 0.2], ["t", "sine", 523, 131, 0.45, 0.12]],
  lifeLost: [["t", "triangle", 294, 294, 0.16, 0.2], ["t", "triangle", 220, 220, 0.16, 0.2, 0.16], ["t", "triangle", 147, 140, 0.4, 0.22, 0.32]],
  heart: [["t", "triangle", 784, 784, 0.07, 0.14]],
  rise: [["t", "sine", 1047, 1047, 0.06, 0.1], ["t", "sine", 1568, 1568, 0.12, 0.1, 0.06]],
  tick: [["t", "sine", 1319, 1319, 0.04, 0.1], ["t", "sine", 1976, 1976, 0.09, 0.09, 0.04]],
  pole: [["n", 3000, 9000, 0.14, 0.1], ["t", "triangle", 1047, 2093, 0.16, 0.14, 0.08]],
  feather: [["t", "sine", 2093, 2093, 0.08, 0.08], ["t", "sine", 2637, 2637, 0.08, 0.08, 0.08], ["t", "sine", 3136, 3136, 0.2, 0.08, 0.16]],
  rattle: [["n", 600, 500, 0.03, 0.1], ["n", 600, 500, 0.03, 0.1, 0.07], ["n", 600, 500, 0.03, 0.1, 0.14]],
  crumble: [["n", 1400, 150, 0.2, 0.2], ["t", "triangle", 180, 90, 0.12, 0.12]],
  glug: [["t", "sine", 240, 120, 0.1, 0.22], ["t", "sine", 200, 100, 0.12, 0.18, 0.1]],
  arrive: [["n", 900, 200, 0.1, 0.16], ["t", "sine", 140, 90, 0.12, 0.2]],
  leave: [["t", "sine", 880, 880, 0.14, 0.12], ["t", "sine", 659, 659, 0.24, 0.12, 0.16]],
  wake: [["n", 300, 120, 0.32, 0.22], ["t", "sawtooth", 70, 60, 0.32, 0.07]],
  freeze: [["t", "triangle", 420, 400, 0.05, 0.22], ["n", 2400, 900, 0.03, 0.14]],
  hiss: [["n", 5200, 2400, 0.3, 0.1]],
  rear: [["n", 1500, 6000, 0.5, 0.1], ["t", "sine", 160, 330, 0.5, 0.1]],
  honk: [["t", "square", 392, 330, 0.1, 0.1], ["t", "square", 392, 330, 0.16, 0.1, 0.13]],
  growl: [["t", "sawtooth", 70, 130, 0.7, 0.12]],
  rev: [["t", "sawtooth", 90, 240, 0.9, 0.09], ["n", 300, 1200, 0.9, 0.08]],
  open: [["t", "triangle", 523, 523, 0.1, 0.18], ["t", "triangle", 784, 784, 0.1, 0.18, 0.1], ["t", "triangle", 1047, 1047, 0.3, 0.18, 0.2]],
  stone: [["t", "sine", 2093, 2093, 0.06, 0.08], ["t", "sine", 2637, 2637, 0.06, 0.08, 0.06], ["t", "sine", 3136, 3136, 0.14, 0.08, 0.12]]
} satisfies Record<string, readonly Voice[]>;
export type VoiceName = keyof typeof VOICES;

/**
 * The page's events and the sound each one makes: its own voice here, or the kit's named sound (the page
 * plays those as before). For the table in `tools/review/o19/` and the test that holds them apart.
 */
export const SOUND_OF: Record<string, VoiceName | `kit:${string}`> = {
  hit: "hurt",
  stomp: "stomp",
  "boss stomped": "bossHit",
  "dud stomp": "dud",
  skilling: "kit:coin",
  cheese: "kit:life",
  bracteate: "kit:gold",
  feather: "feather",
  pole: "pole",
  "shield given": "kit:fanfare",
  "shield blocks": "block",
  "flag up": "kit:flag",
  "flag's tick": "tick",
  bench: "kit:bench",
  "heart filled": "heart",
  rune: "kit:pickup",
  "hard landing": "thud",
  water: "splash",
  pit: "pit",
  "life lost": "lifeLost",
  "game over": "kit:over",
  "ledge about to go": "rattle",
  "ledge goes": "crumble",
  "pad starts to sink": "glug",
  "carrier arrives": "arrive",
  "carrier about to leave": "leave",
  "hook comes in to a landing": "arrive",
  "hook turns at a landing": "leave",
  "statue wakes": "wake",
  "statue freezes": "freeze",
  "thrower throws": "throw",
  "swan turns": "hiss",
  "swan comes": "honk",
  "door opens": "kit:door",
  "troll's tell": "growl",
  "plough's tell": "rev",
  "serpent's tell": "rear",
  "boss hit": "bossHit",
  "boss beaten": "kit:fanfare",
  "station opens": "open",
  "stone arrives": "stone",
  "line 2 opens": "rise"
};

// --- Particles and rings: fixed pools ----------------------------------------------------------------

const px = new Float32Array(PARTICLES);
const py = new Float32Array(PARTICLES);
const pvx = new Float32Array(PARTICLES);
const pvy = new Float32Array(PARTICLES);
const pg = new Float32Array(PARTICLES);
const plife = new Int16Array(PARTICLES);
const psize = new Uint8Array(PARTICLES);
const pcol: string[] = Array.from({ length: PARTICLES }, () => "");

/** A particle: the slot of one burnt out, or of the one with least life left. */
function spark(x: number, y: number, vx: number, vy: number, life: number, c: string, size = 1, g = 0.03) {
  let k = 0;
  let least = 1e9;
  for (let i = 0; i < PARTICLES; i++) {
    if (plife[i] <= 0) {
      k = i;
      break;
    }
    if (plife[i] < least) {
      least = plife[i];
      k = i;
    }
  }
  px[k] = x;
  py[k] = y;
  pvx[k] = vx;
  pvy[k] = vy;
  pg[k] = g;
  plife[k] = life;
  psize[k] = size;
  pcol[k] = c;
}

/** `n` particles out from (x, y) in a ring, at `speed`, two colours taking turns. */
function burst(x: number, y: number, n: number, speed: number, life: number, a: string, b = a, g = 0.03, size = 1) {
  if (view.reduced) return;
  for (let k = 0; k < n; k++) {
    const ang = (k / n) * Math.PI * 2 + 0.3;
    spark(x, y, Math.cos(ang) * speed, Math.sin(ang) * speed - 0.15, life, k % 2 ? b : a, size, g);
  }
}

/** How many particles are alive (for the tests and the perf line). */
export function particlesAlive(): number {
  let n = 0;
  for (let i = 0; i < PARTICLES; i++) if (plife[i] > 0) n++;
  return n;
}

/** The pools' arrays, for the test that nothing new is made. */
export const pools = { px, py, plife, pcol };

// --- The alert: a "!" over what has just turned on him (order 22) ---------------------------------------

const ALERTS = 4;
/** What each "!" stands over: an enemy (by its index), the troll, or the boss; and the step it came. */
const alertKind = new Int8Array(ALERTS);
const alertIdx = new Int16Array(ALERTS);
const alertAt = new Int32Array(ALERTS).fill(-9999);
/** How long the "!" stands over it, in steps; how long it swells and shrinks (twice) as it comes (order 23). */
export const ALERT_STEPS = 40;
export const ALERT_PULSE = 24;
let alertNext = 0;
/** A "!" over what has just turned on him: an enemy (`kind` 0, by index), the troll (1) or the boss (2). */
function alert(kind: number, idx: number, now: number) {
  const k = alertNext++ % ALERTS;
  alertKind[k] = kind;
  alertIdx[k] = idx;
  alertAt[k] = now;
}
/** How big the "!" is `age` steps after it came: it springs up, swells and shrinks twice, and stands (still, full, with reduced motion). */
export function alertSize(age: number, reduced: boolean): number {
  if (reduced) return 1;
  const up = Math.min(1, (age + 1) / 3);
  return age < ALERT_PULSE ? up * (1 + 0.45 * Math.abs(Math.sin((age / (ALERT_PULSE / 2)) * Math.PI))) : 1;
}
/** The "!": a red bar and dot with a dark edge, `h` of its full height (wider as it swells), its foot at (x, y). */
function bang(x: number, y: number, h: number) {
  const n = Math.max(1, Math.round(7 * h));
  const w = h > 1.25 ? 4 : 2;
  R(x - w / 2 - 1, y - n - 1, w + 2, n + 1, ENEMY.line);
  R(x - w / 2, y - n, w, n - (n > 3 ? 3 : 0), ENEMY.warning);
  if (n > 3) R(x - w / 2, y - 1, w, 1, ENEMY.warning);
}
/** An arrow at the screen's edge, pointing out to `dir`, its tip at (x, y): something about to come into view (order 23). */
function arrow(x: number, y: number, dir: number) {
  for (let k = 0; k < 4; k++) {
    R(x - dir * k - (dir > 0 ? 1 : 0), y - k - 1, 2, 2 * k + 3, ENEMY.line);
    R(x - dir * k - (dir > 0 ? 0 : 0), y - k, 1, 2 * k + 1, ENEMY.warning);
  }
}
/** Arrows at the screen's edge for throwers and flyers about to come into view: on (order 23, section 5, tried; see the hand-back). */
export const EDGE_ARROWS = { on: true };

const RINGS = 6;
const rx = new Float32Array(RINGS);
const ry = new Float32Array(RINGS);
const rt = new Int32Array(RINGS).fill(-9999);
const rdur = new Int16Array(RINGS);
const rr0 = new Float32Array(RINGS);
const rr1 = new Float32Array(RINGS);
const rcol: string[] = Array.from({ length: RINGS }, () => "");
let ringNext = 0;
/** Twelve points round a circle, worked out once. */
const COS = Float32Array.from({ length: 12 }, (_, k) => Math.cos((k / 12) * Math.PI * 2));
const SIN = Float32Array.from({ length: 12 }, (_, k) => Math.sin((k / 12) * Math.PI * 2));

/**
 * A ring that grows from r0 to r1 over `dur` steps (or shrinks, r1 < r0): where something happened, in its
 * role's colour. With reduced motion it does not grow: it stands at r1 for the time, a still answer.
 */
function ring(x: number, y: number, r0: number, r1: number, dur: number, c: string, now: number) {
  const k = ringNext++ % RINGS;
  rx[k] = x;
  ry[k] = y;
  rt[k] = now;
  rdur[k] = dur;
  rr0[k] = r0;
  rr1[k] = r1;
  rcol[k] = c;
}

// --- Sounds waiting their turn ------------------------------------------------------------------------

const LATER = 4;
const lAt = new Int32Array(LATER).fill(-1);
const lVoice: (VoiceName | null)[] = Array.from({ length: LATER }, () => null);

// --- The answers ---------------------------------------------------------------------------------------

/** What the page gives: its synth, and the header's hearts, lives, skilling and gold, when there is a page. */
export interface Host {
  sfx: Pick<Sfx, "voice">;
  hearts?: SVGSVGElement[];
  lives?: HTMLElement;
  coins?: HTMLElement;
  gold?: HTMLElement;
}

/** A beaten enemy's shape as it was drawn the moment before (its rectangles and colours), for the squash and the puff. */
interface Shape {
  r: number[];
  c: string[];
  /** Its two commonest colours. */
  a: string;
  b: string;
}

export type Feel = ReturnType<typeof createFeel>;

export function createFeel(host: Host) {
  const voice = (name: VoiceName) => host.sfx.voice(VOICES[name]);
  const later = (name: VoiceName, at: number) => {
    for (let k = 0; k < LATER; k++)
      if (lAt[k] < 0) {
        lAt[k] = at;
        lVoice[k] = name;
        return;
      }
  };

  /** His place, hearts and lives before the step; the top of his flight. */
  const was = { x: 0, y: 0, hearts: HEARTS, lives: 0, apex: Infinity, vx: 0, vy: 0, air: 0 };
  /** The page's step count now. */
  let now = 0;
  /** The picture holds from this step until `holdUntil`, once a frame has been drawn in it. */
  let holdFrom = -1;
  let holdUntil = -1;
  let drawn = -1;
  /** He flashes the hurt red until this step. */
  let flashUntil = -1;
  /** The camera's nudge, and until when. */
  const nudge = { x: 0, y: 0, until: -1 };
  /** Benches he has sat on in this scene. */
  const sat = new Uint8Array(8);
  /** Beaten enemies' shapes, and enemies' calm a step ago (statues, guards). */
  const shapes = new Map<Enemy, Shape>();
  let calm: boolean[] = [];
  /** A step has been taken in this scene: what is stone from the start is not heard turning to stone. */
  let primed = false;
  /** Carriers near him: stopped a step ago; the step a "leaving" sound was last played for each. */
  let stopped: boolean[] = [];
  let told: number[] = [];
  /** The header: hearts shown while they fill one by one after a bench or a lost life; the step a pop began on each part. */
  let fill: { from: number; at: number } | null = null;
  const pop = { hearts: -99, coins: -99, lives: -99, gold: -99, broke: -99, broken: -1, livesDown: false };
  /** Things that rise where they were taken: the cheese, the bracteate. */
  const risen = { cheese: { x: 0, y: 0, at: -99 }, bract: { x: 0, y: 0, at: -99 }, pole: { at: -99 } };
  /**
   * What picks his frame (order 23), all of it state the game keeps: when he last landed and from how high, when he
   * was last hit, the last step the rules stepped (walking into a door they do not), and how the ground under him has
   * sloped of late (on the sledge).
   */
  const his = { landAt: -99, deep: false, hurtAt: -999, ruled: -1, ruledT: -1, x: 0, y: 0, moved: false, slope: 0 };

  /** The hearts the header shows: while they fill one by one, fewer than he has. */
  function heartsShown(p: Play): number {
    if (!fill) return p.hearts;
    if (now < fill.at) return fill.from;
    const k = Math.floor((now - fill.at) / 8);
    if (fill.from + k + 1 >= p.hearts) {
      fill = null;
      return p.hearts;
    }
    return fill.from + k + 1;
  }

  const hold = (steps: number) => {
    if (view.reduced) return;
    holdFrom = now;
    holdUntil = now + steps;
  };
  const jolt = (dx: number, dy: number) => {
    if (view.reduced) return;
    nudge.x = dx;
    nudge.y = dy;
    nudge.until = now + 6;
  };
  /** True when (x, y) is in view, or near it. */
  const seen = (x: number, y: number, margin = 2 * TILE) => x > view.camX - margin && x < view.camX + view.w + margin && y > view.camY - margin && y < view.camY + view.h + margin;
  const near = (p: Play, x: number, tiles: number) => Math.abs(x - (p.body.x + PLAYER.w / 2)) < tiles * TILE;

  /** Is the fall at x (just before it) into water, or into a pit with no floor? */
  function water(p: Play, x: number, y: number) {
    const c = Math.floor(x / TILE);
    for (let r = Math.max(0, Math.floor(y / TILE)); r < p.map.rows; r++) {
      if (p.map.isWater(c, r)) return true;
      if (p.map.isSolid(c, r)) return false;
    }
    return false;
  }

  return {
    /** A new scene: nothing in the air, nothing held, nothing remembered. */
    reset(p: Play) {
      plife.fill(0);
      rt.fill(-9999);
      alertAt.fill(-9999);
      lAt.fill(-1);
      holdUntil = flashUntil = nudge.until = -1;
      sat.fill(0);
      shapes.clear();
      calm = p.enemies.map((e) => !!e.calm);
      primed = false;
      stopped = p.def.carriers.map(() => false);
      told = p.def.carriers.map(() => -999);
      fill = null;
      pop.broken = -1;
      risen.cheese.at = risen.bract.at = risen.pole.at = -99;
      was.apex = Infinity;
      was.hearts = p.hearts;
      was.lives = p.lives;
      his.landAt = his.hurtAt = -999;
      his.slope = 0;
    },

    /** Before the rules' step: where he is, what he has. */
    before(p: Play, steps: number) {
      now = steps;
      was.x = p.body.x;
      was.y = p.body.y;
      was.vx = p.body.vx;
      was.vy = p.body.vy;
      was.air = p.body.airJumps;
      was.hearts = p.hearts;
      was.lives = p.lives;
    },

    /**
     * After the rules' step: the answers to what happened. `poleNew`: this rune gave the ski pole; `gold`: the
     * feather is gold; `owned`: this level's bracteate was found before (then it is quiet).
     */
    react(p: Play, ev: Events, poleNew = false, gold = false, owned = false) {
      const b = p.body;
      const cx = b.x + PLAYER.w / 2;
      const t = now;
      // Dust when he turns at speed, a streak behind a dash, the feather's trail on a second jump.
      if (!view.reduced) {
        if (b.onGround && Math.abs(was.vx) > 1.2 && Math.sign(b.vx) !== Math.sign(was.vx)) spark(cx, b.y + PLAYER.h - 1, -was.vx * 0.2, -0.3, 14, DUST, 1, 0);
        if (p.dash) for (let k = 0; k < 3; k++) spark(cx - p.dash.dir * (6 + k * 2), b.y + 3 + k * 4, -p.dash.dir * 0.4, 0, 12, k === 1 ? SWEATER : STREAK, 1, 0);
        if (ev.step.jumped && b.airJumps < was.air) for (let i = 0; i < 3; i++) spark(cx + (i - 1) * 3, b.y + PLAYER.h - 2 + i, (i - 1) * 0.12, 0.02, 70 + i * 12, gold ? METAL.gold : FEATHER.vane, 1, 0);
      }
      if (ev.zap) burst(cx, b.y + PLAYER.h - 2, 8, 1.1, 20, ENEMY.warning, ENEMY.pale);
      // The flourish's fireworks (Slottet), within the forty: thirteen to a burst.
      const bursts = ev.rune ? p.def.fireworks : undefined;
      if (bursts && !view.reduced)
        for (let k = 0; k < 3; k++) {
          const [fx, fy] = bursts[k % bursts.length];
          for (let i = 0; i < 13; i++) {
            const a = (i / 13) * Math.PI * 2;
            const v = 0.6 + ((i * 7) % 5) / 10;
            spark(fx, fy, Math.cos(a) * v, Math.sin(a) * v - 0.2, 50 + k * 12, FIRE[(i + k) % 4]);
          }
        }
      // The top of his flight, for a fall of more than three tiles.
      if (!b.onGround) was.apex = Math.min(was.apex, b.y);
      else if (ev.step.landed > 0 && !ev.splash) {
        const fell = b.y - was.apex;
        was.apex = Infinity;
        his.landAt = t;
        his.deep = fell > DEEP_FALL;
        if (fell > 3 * TILE) {
          voice("thud");
          jolt(0, 1);
          for (let k = 0; k < 8; k++) spark(cx + (k - 3.5) * 1.6, b.y + PLAYER.h - 1, (k - 3.5) * 0.22, -0.35 - (k % 3) * 0.15, 20, k % 2 ? DUST : PALETTE.earth);
        } else if (ev.step.landed > 3 && !ev.bleat && ev.drum === null && ev.stomp === null) {
          voice("land");
          if (!view.reduced) for (const dx of [-2, 2]) spark(cx + dx, b.y + PLAYER.h - 1, dx * 0.15, -0.25, 14, DUST);
        }
      } else was.apex = Infinity;

      if (ev.coin !== null) {
        const s = p.skilling.find((k) => k.at === p.t);
        if (s) {
          ring(s.box.x + 4, s.box.y + 4, 2, 9, 10, COIN.shine, t);
          burst(s.box.x + 4, s.box.y + 4, 4, 0.6, 14, COIN.shine, COIN.gold, 0);
        }
        pop.coins = t;
      }
      if (ev.stomp !== null) {
        const e = p.enemies[ev.stomp];
        voice("stomp");
        jolt(0, 2);
        // His bounce: a little dust kicked off its back.
        if (!view.reduced) for (const dx of [-3, 3]) spark(cx + dx, b.y + PLAYER.h, dx * 0.2, 0.3, 10, WHITE, 1, 0);
        void e;
      }
      if (ev.dud) {
        // A stomp that does nothing: a hard white spark and two dry ticks, no squash.
        voice("dud");
        burst(cx, b.y + PLAYER.h, 6, 1.4, 8, WHITE, ENEMY.pale, 0);
        ring(cx, b.y + PLAYER.h, 2, 7, 6, WHITE, t);
      }
      if (ev.hurt) {
        his.hurtAt = t;
        const fell = ev.splash;
        voice("hurt");
        flashUntil = t + 3;
        if (!fell) {
          hold(HOLD);
          jolt(b.facing * -2, 0);
          burst(cx, b.y + PLAYER.h / 2, 6, 1, 12, ENEMY.warning, ENEMY.pale, 0.02);
        }
        if (view.reduced) ring(cx, b.y + PLAYER.h / 2, 11, 11, 30, ENEMY.warning, t);
        pop.broke = t;
        pop.broken = Math.min(HEARTS - 1, ev.lifeLost ? 0 : p.hearts);
        if (!ev.lifeLost) pop.hearts = t;
      }
      if (ev.lifeLost && !ev.over) {
        voice("lifeLost");
        pop.lives = t;
        pop.livesDown = true;
        // The hearts come back one by one once the last has broken.
        fill = { from: 0, at: t + 30 };
      }
      if (ev.life) {
        pop.lives = t;
        pop.livesDown = false;
        if (p.cheese && p.cheese.at === p.t) {
          // The slice rises from where it was and is gone; the lives count goes up.
          risen.cheese = { x: p.cheese.box.x, y: p.cheese.box.y - 2, at: t };
          burst(p.cheese.box.x + 6, p.cheese.box.y, 8, 0.7, 20, FOOD.cheeseLight, COIN.shine);
        }
      }
      if (ev.bench !== null) {
        sat[ev.bench] = 1;
        const s = p.benches[ev.bench];
        ring(s.x, s.bottom - 12, 4, 14, 14, ROLES.speech.bubble, t);
        // The hearts fill one by one.
        if (was.hearts < HEARTS) fill = { from: was.hearts, at: t + 6 };
      }
      if (ev.flag !== null) {
        const f = p.flags[ev.flag];
        ring(f.x + 4, f.bottom - POLE.h, 3, 12, 12, WHITE, t);
      }
      if (ev.blocked) {
        const sh = p.shield;
        const fx = cx + (sh ? sh.facing : b.facing) * 9;
        voice("block");
        burst(fx, b.y + 4, 6, 1.3, 9, WHITE, PALETTE.iron, 0);
        ring(fx, b.y + 5, 2, 8, 6, WHITE, t);
      }
      if (ev.gift) {
        ring(cx, b.y + 6, 4, 18, 20, COIN.gold, t);
        burst(cx, b.y + 4, 10, 0.8, 24, COIN.gold, COIN.shine);
      }
      if (ev.bracteate && p.bracteate && !owned) {
        risen.bract = { x: p.bracteate.x, y: p.bracteate.y, at: t };
        ring(p.bracteate.x + 6, p.bracteate.y + 6, 4, 16, 16, COIN.gold, t);
        burst(p.bracteate.x + 6, p.bracteate.y + 6, 10, 0.9, 22, COIN.gold, WHITE);
        pop.gold = t;
      }
      if (ev.rune && p.rune) {
        ring(p.rune.x + 8, p.rune.y + 8, 4, 20, 18, COIN.gold, t);
        if (poleNew) {
          risen.pole.at = t;
          voice("pole");
        }
      }
      if (ev.thrown.length) voice("throw");
      if (ev.splash) {
        const x = was.x + PLAYER.w / 2;
        const y = was.y + PLAYER.h;
        if (water(p, x, y - 2)) {
          voice("splash");
          // A splash where he went in, in the water's own colours, and its rings.
          const top = Math.floor(y / TILE) * TILE;
          for (let k = 0; k < 10; k++) spark(x + (k - 4.5) * 1.3, top + 2, (k - 4.5) * 0.16, -0.9 - (k % 4) * 0.25, 26, k % 2 ? PALETTE.foam : PALETTE.water);
          ring(x, top + 3, 3, 14, 18, PALETTE.foam, t);
        } else {
          voice("pit");
          // Dust off the pit's edge, falling in after him.
          const edge = Math.round(x / TILE) * TILE;
          for (let k = 0; k < 6; k++) spark(edge + (k - 2.5) * 2, y - 4 - (k % 3) * 3, (k - 2.5) * 0.05, 0.4 + (k % 3) * 0.2, 30, k % 2 ? DUST : PALETTE.earth, 1, 0.05);
        }
        // Where he is put back: a ring closing on him, so the eye finds him.
        ring(cx, b.y + PLAYER.h / 2, 16, 4, 16, ROLES.speech.bubble, t);
      }
      if (ev.lifeLost) ring(cx, b.y + PLAYER.h / 2, 20, 4, 24, ROLES.speech.bubble, t);
      // The troll rising, the plough starting up, the serpent's first rise: a "!" over it (order 23).
      if (ev.troll === "wake") alert(1, 0, t);
      if (ev.boss === "wake") alert(2, 0, t);
      if (ev.troll) {
        const tr = p.troll;
        const box = tr && p.def.trollRules?.box(tr);
        if (ev.troll === "windup") {
          voice("growl");
          if (box) ring(box.x + box.w / 2, box.y + 6, 6, 18, 16, ROLES.now, t);
        }
        if (ev.troll === "hit" && box) {
          hold(HOLD);
          voice("bossHit");
          burst(box.x + box.w / 2, box.y + 8, 10, 1.2, 16, ROLES.now, WHITE);
        }
        if (ev.troll === "stone" && box) burst(box.x + box.w / 2, box.y + 8, 14, 1, 30, COIN.gold, ROLES.now);
        if (ev.troll === "slam") jolt(0, 3);
      }
      if (ev.boss && p.boss) {
        const top = p.boss.rules.top(p.boss.state);
        if (ev.boss === "windup") {
          voice(p.def.id === "nabolaget" ? "rev" : "rear");
          ring(top.x, top.y + 4, 6, 18, 16, ROLES.now, t);
        }
        if (ev.boss === "hit") {
          hold(HOLD);
          voice("bossHit");
          burst(top.x, top.y + 2, 10, 1.3, 14, ROLES.now, WHITE);
          ring(top.x, top.y + 2, 3, 14, 10, ROLES.now, t);
        }
        if (ev.boss === "beaten") burst(top.x, top.y + 6, 14, 1, 30, COIN.gold, ROLES.now);
        if (ev.boss === "slam") jolt(0, 3);
      }
    },

    /** Every step, held or not: what is in the air moves on, what waits to be heard is heard; and what the clock alone brings on. */
    step(p: Play, steps: number) {
      now = steps;
      // Whether the rules stepped (walking into a door they do not, and he moves), and the slope under him of late.
      const bd = p.body;
      if (p.t !== his.ruledT) {
        his.ruledT = p.t;
        his.ruled = steps;
      }
      his.moved = Math.abs(bd.x - his.x) > 0.05;
      const dx = Math.abs(bd.x - his.x);
      if (dx > 0.2) his.slope = his.slope * 0.8 + 0.2 * ((bd.y - his.y) / dx);
      his.x = bd.x;
      his.y = bd.y;
      for (let i = 0; i < PARTICLES; i++)
        if (plife[i] > 0) {
          px[i] += pvx[i];
          py[i] += pvy[i];
          pvy[i] += pg[i];
          plife[i]--;
        }
      for (let k = 0; k < LATER; k++)
        if (lAt[k] >= 0 && now >= lAt[k]) {
          voice(lVoice[k]!);
          lAt[k] = -1;
        }
      const t = p.t;
      const b = p.body;
      // A flag's tick, as it appears at the top of its pole once the flag is up.
      for (let i = 0; i < p.raisedAt.length; i++) {
        const up = p.raisedAt[i];
        if (up === null || t - up !== HOIST_STEPS) continue;
        const f = p.flags[i];
        ring(f.x + 5, f.bottom - POLE.h - 6, 2, 10, 10, WHITE, now);
        voice("tick");
      }
      // Ledges on a beat near him: a rattle as one starts its warning, a crumble as it goes.
      for (let i = 0; i < p.def.timed.length; i++) {
        const l = p.def.timed[i];
        const ph = timedPhase(t, l);
        const was = timedPhase(t - 1, l);
        if (ph === was || !near(p, l.x + l.w / 2, 4) || Math.abs(l.y - b.y) > 4 * TILE) continue;
        if (ph === "warn") voice("rattle");
        if (ph === "off" && (l.note ?? 0) >= 0) {
          voice("crumble");
          for (let k = 0; k < 4; k++) spark(l.x + 2 + ((k * 5) % l.w), l.y + 1, (k - 1.5) * 0.15, 0.2, 20, STAND.warn, 1, 0.06);
        }
      }
      // Pads and bundles: as one starts to go under.
      const pads = (p.grounds?.state as { pads?: { sinkAt: number | null }[] } | undefined)?.pads;
      if (pads)
        for (let i = 0; i < pads.length; i++)
          if (pads[i].sinkAt === t) {
            voice("glug");
            for (let k = 0; k < 4; k++) spark(b.x + 1 + k * 3, b.y + PLAYER.h + 1, 0, -0.3 - k * 0.05, 18, PALETTE.foam, 1, 0);
          }
      // Statues and guards that wake and freeze; swans that turn. Turning between two statues wakes one and
      // freezes the other in the same step: one sound for the pair, the grind of the one that wakes (order 20).
      let woke = false;
      let froze = false;
      for (let i = 0; i < p.enemies.length; i++) {
        const e = p.enemies[i];
        const c = !!e.calm;
        if (primed && e.alive && c !== calm[i] && STONY.has(e.def.look) && seen(e.x, e.y)) {
          if (c) froze = true;
          else woke = true;
          if (!c) for (let dx = -4; dx <= 4; dx += 8) spark(e.x + dx, e.y - 1, dx * 0.08, -0.2, 16, DUST);
          else ring(e.x, e.y - e.h / 2, e.w / 2 + 6, e.w / 2 + 2, 8, WHITE, now);
        }
        // Whatever turns on him gets a "!" over it (order 22; order 23: more moments): its outline turning from the calm
        // pale to the warning red (a statue, a guard), a swan's warning, a thrower taking aim at him.
        if (primed && e.alive && !c && calm[i] && seen(e.x, e.y)) alert(0, i, now);
        if (e.alive && e.def.kind === "thrower" && untilThrow(e, t) === WINDUP && seen(e.x, e.y, 0) && Math.abs(e.x - (b.x + PLAYER.w / 2)) < (e.def.reach ?? 7) * TILE) alert(0, i, now);
        calm[i] = c;
        if (e.def.look === "swan" && e.alive) {
          if (e.n === 180) {
            alert(0, i, now);
            voice("hiss");
            ring(e.x, e.y - 8, 4, 14, 14, ENEMY.warning, now);
          }
          if (e.n === 240) voice("honk");
        }
      }
      if (woke) voice("wake");
      else if (froze) voice("freeze");
      primed = true;
      // Carriers near him: a clunk as one comes to a stop; a ding-dong two thirds of a second before it leaves.
      for (let i = 0; i < p.def.carriers.length; i++) {
        const d = p.def.carriers[i];
        // A hook swinging between two landings never stops: a clunk as it comes within four pixels of one,
        // the ding-dong as it turns there and goes back (order 20).
        if (d.kind === "travel" && p.def.landings?.includes(i)) {
          const a = carrierDrawn(d, t, 1);
          if (!near(p, a.x + d.w / 2, 8) || Math.abs(a.y - b.y) > 6 * TILE) continue;
          const span = Math.hypot(d.to.x - d.from.x, d.to.y - d.from.y);
          const k = (s: number) => (1 - Math.cos((2 * Math.PI * (s + (d.offset ?? 0))) / d.period)) / 2;
          const landed = (s: number) => Math.min(k(s), 1 - k(s)) * span <= 4;
          if (landed(t) && !landed(t - 1)) {
            voice("arrive");
            spark(a.x + 1, a.y + 2, 0, -0.2, 12, DUST);
            spark(a.x + d.w - 2, a.y + 2, 0, -0.2, 12, DUST);
          }
          const half = (s: number) => Math.floor(((s + (d.offset ?? 0)) * 2) / d.period);
          if (half(t) !== half(t - 1)) voice("leave");
          continue;
        }
        // Only what stops on its way: a lift at its ends, a train at its platforms.
        if (!(d.kind === "lift" || (d.kind === "path" && d.stops?.length)) || !carrierShown(d, t)) continue;
        const a = carrierDrawn(d, t, 1);
        if (!near(p, a.x + d.w / 2, 8) || Math.abs(a.y - b.y) > 6 * TILE) {
          stopped[i] = false;
          continue;
        }
        const prev = carrierDrawn(d, t - 1, 1);
        const still = a.x === prev.x && a.y === prev.y;
        if (still && !stopped[i]) {
          voice("arrive");
          spark(a.x + 1, a.y + 2, 0, -0.2, 12, DUST);
          spark(a.x + d.w - 2, a.y + 2, 0, -0.2, 12, DUST);
        }
        stopped[i] = still;
        if (still && t - told[i] > 60) {
          const soon = carrierDrawn(d, t + 40, 1);
          if (soon.x !== a.x || soon.y !== a.y) {
            told[i] = t;
            voice("leave");
          }
        }
      }
    },

    /** A shadow under everything that moves (order 23), drawn on the street under it: `body` is where he is drawn. Sets the frames' clock. */
    shadows(p: Play, body: { x: number; y: number } | null, alpha: number) {
      clock.t = p.t;
      shadows(p, body, alpha);
    },

    /** Something in front of him now and then (order 23), over him on the text canvas; never over the touch pad's buttons. */
    fore(id: string) {
      const pad = document.body.classList.contains("touch") ? document.getElementById("pad") : null;
      drawFore(id, pad && !pad.hidden ? pad.getBoundingClientRect().top - (document.getElementById("stage")?.getBoundingClientRect().top ?? 0) : null);
    },

    /** The page's step count, for a frame drawn without a step (a stepped page's still frame). */
    at(steps: number) {
      now = steps;
    },

    /** True while the picture holds after a hit (the rules go on stepping): the page draws nothing new. */
    held(steps: number) {
      return steps < holdUntil && drawn >= holdFrom;
    },
    /** A frame was drawn at this step. */
    drew(steps: number) {
      drawn = steps;
    },
    /** How far the camera is nudged now. */
    nudge(steps: number) {
      return steps < nudge.until ? nudge : null;
    },

    /** A beaten enemy: squashed flat in its own shape, then a puff of its own colours and the skilling it gave rising. True when drawn. */
    beaten(e: Enemy, t: number, look: () => void): boolean {
      const age = t - (e.beatenAt ?? t);
      if (age < 0 || age > 30) return true;
      let s = shapes.get(e);
      if (!s) {
        s = record(e, look);
        shapes.set(e, s);
      }
      const feet = Math.round(e.y);
      // Its death in three frames (order 23): hit, fold, gone; the puff of its own colours as it goes.
      const k = deathFrame(age, view.reduced);
      if (k >= 0) drawDeath(s, feet, k, view.reduced);
      if (age === DEATH.gone && !view.reduced) {
        let x0 = 1e9;
        let x1 = -1e9;
        for (let i = 0; i < s.r.length; i += 4) {
          x0 = Math.min(x0, s.r[i]);
          x1 = Math.max(x1, s.r[i] + s.r[i + 2]);
        }
        const cxe = (x0 + x1) / 2;
        for (let k2 = 0; k2 < 8; k2++) spark(cxe + (k2 - 3.5) * 1.5, feet - 3, (k2 - 3.5) * 0.25, -0.6 - (k2 % 3) * 0.2, 22, k2 % 2 ? s.a : s.b, 2, 0.04);
      }
      // The skilling it gave goes up and is gone.
      if (age < 24 && !view.reduced) drawSkilling(Math.round(e.x - 2), Math.round(e.y - e.h - 4 - age * 0.8), t, 0);
      return true;
    },

    /** What is in the air and on the ground of a scene: particles, rings, things rising, marks of things done. Over the street, after the night's tint. */
    world(p: Play, t: number) {
      for (let i = 0; i < PARTICLES; i++) if (plife[i] > 0) R(px[i], py[i], psize[i], psize[i], pcol[i]);
      for (let k = 0; k < RINGS; k++) {
        const age = now - rt[k];
        if (age < 0 || age >= rdur[k]) continue;
        const f = view.reduced ? 1 : age / rdur[k];
        const r = rr0[k] + (rr1[k] - rr0[k]) * f;
        for (let j = 0; j < 12; j++) R(rx[k] + COS[j] * r, ry[k] + SIN[j] * r * 0.8, 1, 1, rcol[k]);
      }
      // A "!" over what has just turned on him: it springs up, swells and shrinks twice, and stands (still, at its full
      // height, with reduced motion).
      for (let k = 0; k < ALERTS; k++) {
        const age = now - alertAt[k];
        if (age < 0 || age >= ALERT_STEPS) continue;
        let x = 0;
        let y = 0;
        if (alertKind[k] === 0) {
          const e = p.enemies[alertIdx[k]];
          if (!e || !e.alive || e.calm) continue;
          x = e.x;
          y = e.y - e.h - 4;
        } else if (alertKind[k] === 1) {
          const box = p.troll && p.def.trollRules?.box(p.troll);
          if (!box) continue;
          x = box.x + box.w / 2;
          y = box.y - 6;
        } else {
          if (!p.boss) continue;
          const top = p.boss.rules.top(p.boss.state);
          x = top.x;
          y = top.y - 6;
        }
        bang(Math.round(x), Math.round(y), alertSize(age, view.reduced));
      }
      // An arrow at the screen's edge for a thrower or a flyer about to come into view: within a second of it (his run
      // toward a thrower, a flyer's own flight toward the view), at its height, pointing where it is.
      if (EDGE_ARROWS.on && !p.def.underground)
        for (let i = 0; i < p.enemies.length; i++) {
          const e = p.enemies[i];
          if (!e.alive || e.calm || (e.def.kind !== "thrower" && e.def.kind !== "flyer")) continue;
          const left = view.camX - e.x;
          const right = e.x - (view.camX + view.w);
          const off = Math.max(left, right);
          if (off <= 0 || e.y < view.camY + 8 || e.y > view.camY + view.h - 8) continue;
          const dir = right > 0 ? 1 : -1;
          // How fast the gap closes: his run toward it, and a flyer's own way.
          const closing = Math.max(0, p.body.vx * dir) + (e.def.kind === "flyer" && e.dir === -dir ? e.def.speed ?? 0.5 : 0);
          if (off > closing * 60 || off > 6 * TILE) continue;
          arrow(dir > 0 ? view.camX + view.w - 3 : view.camX + 2, Math.round(e.y - e.h / 2), dir);
        }
      // The rune stone glows when he is near it (order 23): a ring of its light, breathing, within four tiles.
      if (p.rune && runeFree(p) && p.runeAt === null && near(p, p.rune.x + 8, 4) && Math.abs(p.rune.y - p.body.y) < 4 * TILE) {
        const r = 11 + (view.reduced ? 0 : Math.sin(now * 0.08) * 1.5);
        for (let j = 0; j < 12; j++) R(p.rune.x + 8 + COS[j] * r, p.rune.y + 8 + SIN[j] * r, 1, 1, PALETTE.runeGlow);
      }
      // Benches he has sat on keep a tick at the end of their back.
      for (let i = 0; i < p.benches.length; i++) {
        const s = p.benches[i];
        if (sat[i] && seen(s.x, s.bottom)) tick(s.x + 7, s.bottom - 21);
      }
      // The cheese and the bracteate rise from where they were, and are gone.
      const c = now - risen.cheese.at;
      if (c < 30 && !view.reduced) {
        const g = ctx();
        g.globalAlpha = 1 - c / 30;
        drawCheese(risen.cheese.x, risen.cheese.y - Math.round(c * 0.6), t);
        g.globalAlpha = 1;
      }
      const a = now - risen.bract.at;
      if (a < 40) {
        const g = ctx();
        g.globalAlpha = view.reduced ? 1 : 1 - Math.max(0, a - 20) / 20;
        const y = risen.bract.y - (view.reduced ? 6 : Math.round(Math.min(a, 20) * 0.6));
        drawBracteate(risen.bract.x, y, t);
        // Its glint: a four-pointed star, on and off.
        if (view.reduced || (a >> 2) % 2 === 0) glint(risen.bract.x + 6, y + 1);
        g.globalAlpha = 1;
      }
      // The ski pole, the first time: it stands up beside him out of the snow, with a glint.
      const pa = now - risen.pole.at;
      if (pa < 50) {
        const b = p.body;
        const h = view.reduced ? PLAYER.h + 4 : Math.min(PLAYER.h + 4, Math.round(pa * 1.2));
        const x = Math.round(b.x + PLAYER.w + 4);
        R(x, b.y + PLAYER.h - h, 1, h, METAL.lampPost);
        R(x - 1, b.y + PLAYER.h - 3, 3, 1, METAL.lampPost);
        if (view.reduced || (pa >> 2) % 2 === 0) glint(x, b.y + PLAYER.h - h + 1);
      }
    },

    /**
     * Things to use (order 19): doors, benches and signs have their corners marked in the "use" cyan, one
     * family at a glance, and keep their light after dark.
     */
    use(p: Play, doors: readonly { x: number; w: number; h: number; bottom: number }[], boards: readonly { cx: number; y: number; w: number; post?: number }[], map: boolean) {
      for (let i = 0; i < doors.length; i++) {
        const d = doors[i];
        corners(d.x - 1, d.bottom - d.h - 1, d.w + 2, d.h + 1);
      }
      if (!map)
        for (let i = 0; i < p.benches.length; i++) {
          const s = p.benches[i];
          corners(s.x - 12, s.bottom - 15, 24, 15);
        }
      for (let i = 0; i < boards.length; i++) {
        const b = boards[i];
        if (b.post !== undefined) corners(Math.round(b.cx - b.w / 2) - 1, b.y - 1, Math.round(b.w) + 2, 12);
      }
    },

    /** The bubble that says which key (up at a door, at a bench; down at the shield's lesson): framed in the same cyan. */
    hint(h: { x: number; y: number; text: string } | null) {
      if (!h) return;
      const u = textCtx();
      u.font = `600 ${Math.max(12, fontPx())}px ${FONT}`;
      const w = u.measureText(h.text).width + 18;
      const hh = Math.max(24, fontPx() + 12);
      const left = Math.max(6, Math.min(view.cssW - w - 6, sx(h.x) - w / 2));
      const bottom = sy(h.y) - 8;
      u.strokeStyle = ROLES.use;
      u.lineWidth = 2;
      u.beginPath();
      if (u.roundRect) u.roundRect(left - 1, bottom - hh - 1, w + 2, hh + 2, hh / 2 + 1);
      else u.rect(left - 1, bottom - hh - 1, w + 2, hh + 2);
      u.stroke();
    },

    /** A lift or a train that stands and will set off within two thirds of a second: its stripe flashes (steady with reduced motion). */
    leaving(d: CarrierDef, t: number): boolean {
      if (!(d.kind === "lift" || (d.kind === "path" && d.stops?.length))) return false;
      const a = carrierDrawn(d, t, 1);
      const b = carrierDrawn(d, t - 1, 1);
      if (a.x !== b.x || a.y !== b.y) return false;
      const c = carrierDrawn(d, t + 40, 1);
      return (c.x !== a.x || c.y !== a.y) && (view.reduced || (t >> 3) % 2 === 0);
    },

    /** How strongly he is drawn: blinking after a hit, he is drawn half there every other fifth of a step. */
    alpha(p: Play): number {
      if (!blink(p) || view.reduced) return 1;
      return Math.floor(p.t / 5) % 2 ? 0.35 : 1;
    },

    /**
     * Over him, on the text canvas: the hurt red as he is hit; while he blinks, a pale figure every other
     * fifth of a step (it reads after dark as well as by day; with reduced motion, a still pale outline);
     * and under any sky but the day's, a warm rim round him, as the enemies have theirs (his blue is near the
     * evening's water).
     */
    him(p: Play, body: Body, walk: number, phase: "day" | "evening" | "twilight" | "night", look: Look, alpha: number) {
      if (alpha <= 0) return;
      const g = textCtx();
      const n = unit();
      const seated = !!p.sitting || p.riding;
      // Seated the page lowers him three pixels, as the front page's person sits; his frames sit by themselves.
      const ox = snap(sx(body.x));
      const oy = snap(sy(body.y - (seated ? 3 : 0)));
      // His frame (order 23): picked from what the rules keep. While the helmet comes down onto him at a door the
      // front page's person is drawn, helmet and cape as they come.
      const arriving = look.helmetOffset !== undefined || look.capeRows !== undefined;
      const b = p.body;
      const f = arriving
        ? null
        : dressed(
            himFrame(body, {
              t: p.t,
              walking: walk > 0,
              landed: now - his.landAt,
              deep: his.deep,
              dashing: !!p.dash,
              shield: (p.shield?.raise ?? 0) > 0 && b.onGround,
              seated,
              slope: his.slope,
              thrown: !b.onGround && now - his.hurtAt < 60 && !!b.launched,
              entering: now - his.ruled > 1 && his.moved,
              reduced: view.reduced
            }),
            phase,
            !!look.gold,
            look.pompom
          );
      drawHim(g, f, body, walk, phase, look, ox, oy, n, alpha * (blink(p) && !view.reduced && Math.floor(p.t / 5) % 2 ? 0.35 : 1));
      fillGrid(f, body, walk, phase, look);
      const blinking = blink(p);
      if (phase !== "day" || (blinking && view.reduced)) {
        g.globalAlpha = alpha * (phase === "day" ? 0.75 : RIM_ALPHA[phase]);
        g.fillStyle = blinking && view.reduced ? WHITE : RIM;
        for (let r = 0; r < GH; r++)
          for (let c = 0; c < GW; c++) {
            if (grid[r * GW + c]) continue;
            if (grid[r * GW + c - 1] || grid[r * GW + c + 1] || grid[(r - 1) * GW + c] || grid[(r + 1) * GW + c]) g.fillRect(ox + (c - GM) * n, oy + (r - GM) * n, n, n);
          }
      }
      const flash = now < flashUntil && !view.reduced;
      const pale = blinking && !view.reduced && Math.floor(p.t / 5) % 2 === 1;
      if (flash || pale) {
        g.globalAlpha = flash ? 0.85 : 0.7 * alpha;
        g.fillStyle = flash ? ENEMY.warning : PALE;
        for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) if (grid[r * GW + c]) g.fillRect(ox + (c - GM) * n, oy + (r - GM) * n, n, n);
      }
      g.globalAlpha = 1;
    },

    heartsShown,

    /** The header, every frame: a heart breaking, the rest pulsing once, the last one's slow pulse, the counts ticking. */
    hud(p: Play, map: boolean) {
      const hearts = host.hearts;
      if (!hearts) return;
      const shown = map ? HEARTS : heartsShown(p);
      // A heart filled: a blip, once each.
      if (fill && shown !== lastShown && shown > lastShown) {
        voice("heart");
        pop.hearts = now;
      }
      lastShown = shown;
      const reduced = view.reduced;
      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];
        let s = 1;
        let glow = "";
        const age = now - pop.hearts;
        if (i < shown && age < 12 && !reduced) s = 1 + 0.3 * (1 - age / 12);
        // One heart left: it keeps a slow pulse (with reduced motion, a still red ring).
        if (!map && shown === 1 && i === 0) {
          if (reduced) glow = `drop-shadow(0 0 1.5px ${ENEMY.warning})`;
          else s = Math.max(s, 1 + 0.14 * (0.5 + 0.5 * Math.sin((now / 60) * Math.PI * 2)));
        }
        style(h, s === 1 ? "" : `scale(${s.toFixed(2)})`, glow);
      }
      // The heart lost: it breaks in two where it was, the halves falling apart (still, with reduced motion).
      const broke = now - pop.broke;
      const host0 = hearts[pop.broken];
      if (broke < 30 && host0) {
        const bh = brokenHeart(host0);
        const k = reduced ? 0.2 : Math.min(1, broke / 24);
        bh.svg.style.display = "";
        bh.left.setAttribute("transform", `translate(${(-1.5 * k).toFixed(2)} ${(3 * k * k).toFixed(2)}) rotate(${(-25 * k).toFixed(1)} 3 6)`);
        bh.right.setAttribute("transform", `translate(${(1.5 * k).toFixed(2)} ${(3 * k * k).toFixed(2)}) rotate(${(25 * k).toFixed(1)} 4 6)`);
        bh.svg.style.opacity = reduced ? "1" : (1 - Math.max(0, broke - 12) / 18).toFixed(2);
      } else if (bh0) bh0.svg.style.display = "none";
      ticked(host.coins, now - pop.coins, "#8f5326");
      ticked(host.lives, now - pop.lives, pop.livesDown ? ENEMY.warning : "#2e7d32");
      ticked(host.gold, now - pop.gold, COIN.goldDark);
    },

    /** The maze's feather comes to rest on his shoulder: a glint and three high notes. */
    feather(x: number, y: number) {
      ring(x, y, 3, 12, 14, WHITE, now);
      burst(x, y, 8, 0.6, 20, FEATHER.vane, WHITE, 0.01);
      voice("feather");
    },

    /**
     * On the map after a level cleared for the first time: its stone's tick arrives with a flourish, and the
     * station it opened answers (line 2's first, when Vålerenga opened it). Once only.
     */
    arrive(cleared: number, opened: number | null, line2: boolean) {
      const x = stationX(cleared);
      const y = LINE_Y - 38;
      ring(x, y, 4, 18, 22, COIN.gold, now);
      burst(x, y, 12, 0.8, 26, COIN.gold, WHITE, 0.01);
      voice("stone");
      if (opened !== null) {
        ring(stationX(opened), LINE_Y - 12, 18, 6, 26, ROLES.speech.bubble, now + 30);
        later("open", now + 30);
        if (line2) later("rise", now + 60);
      }
    }
  };
}

// --- Drawing helpers -----------------------------------------------------------------------------------

/** The pale of his blinking figure; the warm rim round him after dusk (not the enemies' cold one), and how strongly it is drawn. */
const PALE = "#fff6e0";
export const RIM = "#ffe2a0";
export const RIM_ALPHA = { evening: 0.75, twilight: 0.75, night: 0.9 };
/** The dash's streak beside his blue; the fireworks' colours, the flag's and a lamp's. */
const STREAK = "#90a3c6";
const FIRE = [FLAG.red, FLAG.white, FLAG.blue, LAMP];
/** A four-pointed glint round (x, y). */
function glint(x: number, y: number) {
  R(x - 2, y, 5, 1, WHITE);
  R(x, y - 2, 1, 5, WHITE);
}

const CHECK = [3, 4, 3, 2, 1];
/** The corners of a thing to use, two pixels each way, in the "use" cyan. */
function corners(x: number, y: number, w: number, h: number) {
  if (x + w < view.camX || x > view.camX + view.w || y + h < view.camY || y > view.camY + view.h) return;
  const c = ROLES.use;
  R(x, y, 3, 1, c);
  R(x, y, 1, 3, c);
  R(x + w - 3, y, 3, 1, c);
  R(x + w - 1, y, 1, 3, c);
  R(x, y + h - 1, 3, 1, c);
  R(x, y + h - 3, 1, 3, c);
  R(x + w - 3, y + h - 1, 3, 1, c);
  R(x + w - 1, y + h - 3, 1, 3, c);
}

/** A tick: the dark disc with the pale check, as on a raised flag and an earned rune. */
function tick(x: number, y: number) {
  R(x + 1, y, 5, 7, "#1f1a17");
  R(x, y + 1, 7, 5, "#1f1a17");
  for (let k = 0; k < 5; k++) R(x + 1 + k, y + CHECK[k], 1, 1, WHITE);
}

/** The looks that are stone until he looks away or comes near (Vigelandsparken's statues, Gamlebyen's guards). */
const STONY = new Set(["statue", "bronze", "guard"]);

/** True while he blinks after a hit. */
const blink = (p: Play) => p.t < p.safeUntil && p.run.state === "running";

/** His pixels this frame, on a grid a pixel bigger all round than his frames reach, made once. */
const GM = MARGIN + 1;
const GW = PLAYER.w + 2 * GM;
const GH = PLAYER.h + 2 * GM;
const grid = new Uint8Array(GW * GH);
function fillGrid(f: Frame | null, body: Body, walk: number, phase: "day" | "evening" | "twilight" | "night", look: Look) {
  grid.fill(0);
  if (f) pixels(f, body.facing, PLAYER.w, setCell);
  else playerPixels(body, walk, phase, setCell, look);
}
const setCell = (c: number, r: number) => {
  if (c + GM >= 0 && c + GM < GW && r + GM >= 0 && r + GM < GH) grid[(r + GM) * GW + c + GM] = 1;
};

/**
 * Him, on the text canvas over everything: a faint glow behind him (as the front page's person has), then his frame,
 * a rectangle a run; while the helmet comes down onto him, the front page's person.
 */
function drawHim(g: CanvasRenderingContext2D, f: Frame | null, body: Body, walk: number, phase: string, look: Look, ox: number, oy: number, n: number, alpha: number) {
  const cx = ox + (PLAYER.w / 2) * n;
  const cy = oy + (PLAYER.h / 2) * n;
  g.globalAlpha = alpha;
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, 11 * n);
  const tone = phase === "day" ? "255, 255, 255" : "255, 232, 190";
  glow.addColorStop(0, `rgba(${tone}, ${phase === "day" ? 0.09 : 0.11})`);
  glow.addColorStop(1, `rgba(${tone}, 0)`);
  g.fillStyle = glow;
  g.fillRect(cx - 11 * n, cy - 11 * n, 22 * n, 22 * n);
  if (f) {
    const r = f.runs;
    for (let i = 0; i < r.length; i += 4) {
      g.fillStyle = f.ink[r[i + 3]];
      const x = body.facing > 0 ? r[i] : PLAYER.w - r[i] - r[i + 2];
      g.fillRect(ox + x * n, oy + r[i + 1] * n, r[i + 2] * n, n);
    }
  } else
    playerPixels(body, walk, phase as "day", (c, r, colour) => {
      g.fillStyle = colour;
      g.fillRect(ox + c * n, oy + r * n, n, n);
    }, look);
  g.globalAlpha = 1;
}

/** Records a beaten enemy's look as it was alive: its rectangles and colours, and its two commonest colours. */
function record(e: Enemy, look: () => void): Shape {
  const r: number[] = [];
  const c: string[] = [];
  const g = ctx();
  const rec = {
    fillStyle: "",
    fillRect(x: number, y: number, w: number, h: number) {
      r.push(x + view.camX, y + view.camY, w, h);
      c.push(rec.fillStyle);
    }
  } as unknown as CanvasRenderingContext2D & { fillStyle: string };
  // The look is drawn as it was a step before it was beaten, into the recorder only.
  const alive = e.alive;
  e.alive = true;
  setTarget(rec);
  try {
    look();
  } finally {
    setTarget(g);
    e.alive = alive;
  }
  const area = new Map<string, number>();
  for (let i = 0; i < c.length; i++) if (c[i] !== ENEMY.eye && c[i] !== ENEMY.line) area.set(c[i], (area.get(c[i]) ?? 0) + r[i * 4 + 2] * r[i * 4 + 3]);
  const by = [...area].sort((x, y) => y[1] - x[1]);
  return { r, c, a: by[0]?.[0] ?? ENEMY.plum, b: by[1]?.[0] ?? by[0]?.[0] ?? ENEMY.pink };
}


/** A count in the header that has just changed: it swells and shrinks back (with reduced motion it only takes a colour a moment). */
function ticked(el: HTMLElement | undefined, age: number, colour: string) {
  if (!el) return;
  if (age >= 16) return style(el, "", "");
  if (view.reduced) return style(el, "", "", colour);
  style(el, `scale(${(1 + 0.35 * (1 - age / 16)).toFixed(2)})`, "", colour);
}

/** Sets an element's transform, filter and colour only when they change. */
function style(el: HTMLElement | SVGElement, transform: string, filter: string, colour = "") {
  const s = (el as HTMLElement).style;
  if (s.transform !== transform) s.transform = transform;
  if (s.filter !== filter) s.filter = filter;
  if (s.color !== colour) s.color = colour;
}

let lastShown = HEARTS;
let bh0: { svg: SVGSVGElement; left: SVGGElement; right: SVGGElement } | null = null;
/** The broken heart: the waffle heart in two halves along a crack, laid over the heart that was lost. */
function brokenHeart(over: SVGSVGElement) {
  const SVG = "http://www.w3.org/2000/svg";
  if (!bh0) {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 7 7");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("broken");
    const left = svg.appendChild(document.createElementNS(SVG, "g"));
    const right = svg.appendChild(document.createElementNS(SVG, "g"));
    // The crack runs down the middle, zigzagging: on each row, the columns left of it go with the left half.
    const CRACK = [3, 3, 4, 3, 3, 4, 4];
    WAFFLE.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch === ".") return;
        const r = document.createElementNS(SVG, "rect");
        r.setAttribute("x", String(x));
        r.setAttribute("y", String(y));
        r.setAttribute("width", "1");
        r.setAttribute("height", "1");
        r.setAttribute("fill", ch === "c" ? FOOD.waffleCrust : FOOD.waffleDough);
        (x < CRACK[y] ? left : right).appendChild(r);
      })
    );
    svg.style.cssText = "position:absolute;pointer-events:none;overflow:visible;display:none";
    bh0 = { svg, left, right };
  }
  const parent = over.parentElement!;
  if (bh0.svg.parentElement !== parent) parent.appendChild(bh0.svg);
  if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
  const at = over.getBoundingClientRect();
  const box = parent.getBoundingClientRect();
  bh0.svg.style.left = `${at.left - box.left}px`;
  bh0.svg.style.top = `${at.top - box.top}px`;
  bh0.svg.style.width = `${at.width}px`;
  bh0.svg.style.height = `${at.height}px`;
  return bh0;
}
const WAFFLE = [".cc.cc.", "cdcdcdc", "dcdcdcd", "cdcdcdc", ".cdcdc.", "..cdc..", "...c..."];
