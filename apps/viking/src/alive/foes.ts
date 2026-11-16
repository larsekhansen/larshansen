import { ENEMY } from "@larshansen/pixelkit/palette";
import { windingUp, type Enemy } from "../game/enemies";
import { clock, moving, parts, step4 } from "./parts";
import { frame, type Frame, type Piece } from "./frames";

// The enemies of line 1's first three levels drawn as frames (order 23, section 1; way 3 of `docs/games/GRAIN.md`),
// in the enemy palette's ramps: plum (light, plum, dark, the near-black), white (the eye's pale, white, its shade),
// orange, green and pink (their light, their colour, the near-black). Each has an idle of two frames, a move cycle of
// four (walkers by the distance they cover, so their feet hold; flyers by their own clock), a wind-up pose where it
// throws; its death is the page's (three frames from its own shape: `render/feel.ts`).
//
// Each is drawn through `parts`, as every look is: mirrored when it faces left, and squashed to its box's height
// where a level keeps the boxes enemies had before order 18. The frames are data: drawn twice as fine they would be
// the same rows at another scale.

const E = ENEMY;
/** The enemy palette's ramps by letter: M m d plum (light, plum, dark); W w white (white, shade); O o orange; G g green; p pink; l the near-black; e an eye; a the pale of a beak's tip or a claw. */
export const FOE_INK: Record<string, string> = {
  M: E.plumLight,
  m: E.plum,
  d: E.plumDark,
  W: E.white,
  w: E.whiteShade,
  O: E.orangeLight,
  o: E.orange,
  Y: E.amber,
  G: E.poisonLight,
  g: E.poison,
  p: E.pink,
  l: E.line,
  e: E.eye,
  a: E.pale
};

const make = (name: string, ...pieces: Piece[]) => frame(name, FOE_INK, ...pieces);
const at = (rows: readonly string[], dx = 0, dy = 0): Piece => [rows, dx, dy];

/** A look's frames: still (two), moving (four), and a wind-up pose for one that throws. */
export interface Looks {
  w: number;
  h: number;
  idle: Frame[];
  move: Frame[];
  windup?: Frame;
  /** Steps an idle frame shows: a second (a breath), or less (a flame). */
  rate?: number;
}

// --- The pigeon: 13 x 11, head on the right ----------------------------------------------------------------
const PIGEON_HEAD = ["..MM..", ".Mmem.", ".mmmmo", "..gG.."];
const PIGEON_BODY = [
  "....MMMMMgGm.",
  "..mMMMMMmOOo.",
  "mmmmddmmmOoo.",
  ".mmmmmddmoo..",
  "...ddddddd..."
];
const PIGEON_LEGS = {
  stand: ["....p..p.....", "...pp.pp....."],
  a: ["...p....p....", "..pp....pp..."],
  b: [".....pp......", ".....ppp....."],
  c: ["....p..p.....", "....pp.pp...."]
};
const pigeon = (name: string, head: [number, number], legs: string[]) => make(name, at(PIGEON_BODY, 0, 4), at(PIGEON_HEAD, 7 + head[0], head[1]), at(legs, 0, 9));
export const PIGEON: Looks = {
  w: 13,
  h: 11,
  idle: [pigeon("pigeon, still", [0, 0], PIGEON_LEGS.stand), pigeon("pigeon, pecking", [1, 2], PIGEON_LEGS.stand)],
  // Its head goes forward as a foot lands and comes back as it passes, as a pigeon's does.
  move: [pigeon("pigeon, walking 1", [1, 0], PIGEON_LEGS.a), pigeon("pigeon, walking 2", [0, 0], PIGEON_LEGS.b), pigeon("pigeon, walking 3", [1, 0], PIGEON_LEGS.c), pigeon("pigeon, walking 4", [0, 0], PIGEON_LEGS.b)]
};

// --- The rat: 13 x 10, snout on the right ------------------------------------------------------------------
const RAT_BODY = [
  ".........pp..",
  "....dmMMMmp..",
  "...dmMMMMMmm.",
  "..ddmmmmmmmle",
  "..ddmmmmmmmmm",
  "..dddmmmmmdmp",
  "...ddddddd..."
];
/**
 * Its tail (order 26, section 3d: three pixels were a stub): one pixel thin, pink, as long as its body, from its rump down to
 * the ground and trailing along it behind, its tip lifting, swinging a little over the run (11 x 4, from 9 left of its box).
 */
const RAT_TAIL = {
  a: ["..........p", "pp.......p.", "..pp....p..", "....pppp..."],
  b: ["..........p", ".........p.", "pp.....pp..", "..ppppp...."],
  c: ["..........p", "........pp.", "p.....pp...", ".ppppp....."]
};
const RAT_LEGS = {
  stand: ["...p....p....", "..pp...pp...."],
  a: ["..p......p...", ".pp......pp.."],
  b: ["....p..p.....", "...pp.pp....."],
  c: ["...p.....p...", "..pp.....pp.."]
};
const rat = (name: string, tail: string[], legs: string[], nose = 0) => make(name, at(RAT_BODY, 0, 1), at(tail, -9, 6), at(legs, 0, 8), ...(nose ? [[["a"], 12, 5] as Piece] : []));
export const RAT: Looks = {
  w: 13,
  h: 10,
  idle: [rat("rat, still", RAT_TAIL.a, RAT_LEGS.stand), rat("rat, sniffing", RAT_TAIL.b, RAT_LEGS.stand, 1)],
  move: [rat("rat, running 1", RAT_TAIL.a, RAT_LEGS.a), rat("rat, running 2", RAT_TAIL.b, RAT_LEGS.b), rat("rat, running 3", RAT_TAIL.c, RAT_LEGS.c), rat("rat, running 4", RAT_TAIL.b, RAT_LEGS.b)]
};

// --- The gull (and the crow, in plum): 17 x 10 on the wing, head on the right ------------------------------
const GULL_BODY = [
  "............WW...",
  "ww...WWWWWWWWeloo",
  ".wwwwWWWWWWWWWW..",
  "...wwwwwwwwwww..."
];
const GULL_WINGS: Record<string, readonly string[]> = {
  up: ["....lll..........", "....wWWW.........", ".....wWWWW.......", "......wWWWW......"],
  high: [".................", ".................", "..llwWWWW........", "....wwWWWW......."],
  level: [".................", ".................", ".................", "lllwwWWWWW......."],
  down: [".................", ".................", ".................", "................."]
};
const GULL_DOWN = [".....wwWWWW......", "....wwWWW........", "....lll.........."];
const gull = (name: string, wing: string, bob = 0) =>
  make(name, at(GULL_WINGS[wing], 0, bob), at(GULL_BODY, 0, 3 + bob), ...(wing === "down" ? [at(GULL_DOWN, 0, 7 + bob)] : []));
export const GULL: Looks = {
  w: 17,
  h: 10,
  // Gliding (a flyer that keeps its place): wings out, rising and falling a pixel on the air.
  idle: [gull("gull, gliding", "level", -1), gull("gull, gliding, lower", "level")],
  // Its wing beat, four frames on its own clock.
  // (Wings down, its body rises a pixel with the beat: so its back is where he lands on it.)
  move: [gull("gull, wings up", "up"), gull("gull, wings half up", "high"), gull("gull, wings out", "level", -1), gull("gull, wings down", "down", -1)]
};
/** The crow: the gull's frames in plum, its wingtips the near-black, its beak dark. */
const CROW_INK: Record<string, string> = { ...FOE_INK, W: E.plum, w: E.plumDark, o: E.line, l: E.line };
const crowed = (f: Frame): Frame => frame(f.name.replace("gull", "crow"), CROW_INK, [toRows(f)]);
/** A frame's letters back as rows (for recolouring one drawing as another). */
function toRows(f: Frame): string[] {
  const rows = Array.from({ length: f.y1 }, () => Array<string>(f.x1).fill("."));
  const letters = Object.entries(FOE_INK);
  for (let i = 0; i < f.runs.length; i += 4) {
    const ch = letters.find(([, c]) => c === f.ink[f.runs[i + 3]])?.[0] ?? ".";
    for (let k = 0; k < f.runs[i + 2]; k++) rows[f.runs[i + 1]][f.runs[i] + k] = ch;
  }
  return rows.map((r) => r.join(""));
}
export const CROW: Looks = { w: 17, h: 9, idle: GULL.idle.map(crowed), move: GULL.move.map(crowed) };

/** The looks drawn as frames, by name: a level's own add theirs (`foeLooks`). */
export const FOES: Record<string, Looks> = { pigeon: PIGEON, rat: RAT, crow: CROW };
/** Gulls on the wing (a gull that throws stands: Rådhuset's is its own look). */
const FLYING: Record<string, Looks> = { gull: GULL };

/** A look's frames, by name: Rådhuset's standing gull and the levels' own register theirs here. */
export function foeLooks(more: Record<string, Looks>) {
  Object.assign(FOES, more);
}

/**
 * The frame an enemy shows: winding up, its pose; moving, its cycle (a walker by the distance it covers, three pixels
 * a frame, so its feet hold; a flyer by its own clock); still, its idle (two frames, a second each). Reduced motion keeps
 * them all: they are how a player reads it.
 */
export function foeFrame(e: Enemy, t: number, l: Looks): Frame {
  if (l.windup && windingUp(e, t)) return l.windup;
  const own = clock.t + (e.def.offset ?? 0);
  if (moving(e)) return e.def.kind === "flyer" ? l.move[Math.floor(own / 6) % l.move.length] : l.move[step4(e) % l.move.length];
  return l.idle[Math.floor(own / (l.rate ?? 60)) % l.idle.length];
}

/**
 * Draws a frame as a look: through `parts`, its foot at the enemy's feet. `fit`: the frame was drawn for the box its
 * level keeps (order 25), so it is not squashed to it.
 */
export function drawFoe(e: Enemy, f: Frame, w: number, h: number, fit = false) {
  const r = parts(e, w, true, fit);
  const runs = f.runs;
  for (let i = 0; i < runs.length; i += 4) r(runs[i], runs[i + 1] - h, runs[i + 2], 1, f.ink[runs[i + 3]]);
}

/** An enemy in one of the looks drawn as frames, and says so; false for any other. */
export function drawFoeLook(e: Enemy, t: number): boolean {
  const l = e.def.look === "gull" ? (e.def.kind === "flyer" ? FLYING.gull : FOES.gullStanding) : FOES[e.def.look];
  if (!l) return false;
  drawFoe(e, foeFrame(e, t, l), l.w, l.h);
  return true;
}

/** For the sheets: every look drawn as frames, by name. */
export const ALL_FOES = (): Record<string, Looks> => ({ ...FOES, gull: GULL });
