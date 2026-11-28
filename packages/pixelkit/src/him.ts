import { TILE } from "./config";
import { GOLD, METAL, PALETTE, ROLES } from "./palette";
import { mix } from "./paint";
import type { Body } from "./physics";
import { frame, inked, lit, shade, type Frame, type Piece } from "./frames";

// Him, drawn as frames (order 23, section 1; way 3 of `docs/games/GRAIN.md`; in the kit since order 36, so the viking game
// and the maze draw the same man from one sheet, and the front page keeps its own person, `person.ts`): his 10 x 14 box as before, a ramp of
// tones per material (a lit helmet and a shaded rim, a lit face and the shaded back of the head, the tunic lit at the
// front, the cape behind, trousers and boots with a lit edge), and a frame for every state the game already has:
// standing and breathing, a blink, a run of four frames timed to the distance he covers, rising, the top of a jump,
// falling, landing, a dash, behind the shield, sitting (on a bench and on the sledge, leaning with the slope), thrown
// back by a hit, and pushing into a door. Nothing here changes his box or his timing: the frame is picked from what
// the rules already keep. The front page keeps its own person (`packages/pixelkit/src/person.ts`).
//
// The frames face right; facing left they are mirrored about his box. Their origin is his box's top left; a frame may
// paint outside the box (an arm thrown up, a lean, a crouch's knees), never more than `MARGIN` pixels.

/** How far any frame paints outside his box, at most, on each side. */
export const MARGIN = 3;
/** The run's frames change every this many pixels he covers: a planted foot goes back exactly this far in a frame, so it holds. */
export const STRIDE = 3;

/** His colours, the ramps of each material. Letters: W w the pompom; I i j r R the helmet (lit, iron, shaded, the rim and its lit middle); S s z his skin (lit, skin, shade); e his eyes; B b x P the tunic (lit, blue, shade, its knit); y n the belt and its buckle; C c the cape; D d q the trousers (lit, near leg, far leg); K L k the boots (near, its lit toe, far). */
export const HIM_INK: Record<string, string> = {
  W: "#ffffff",
  w: "#cdd3dd",
  I: lit(PALETTE.ironDark, 0.4),
  i: PALETTE.ironDark,
  j: shade(PALETTE.ironDark, 0.3),
  r: shade(PALETTE.ironDark, 0.5),
  R: lit(PALETTE.ironDark, 0.15),
  S: ROLES.him.skinLit,
  s: ROLES.him.skin,
  z: ROLES.him.skinShade,
  e: "#1f1a17",
  B: ROLES.him.tunicLit,
  b: ROLES.him.tunic,
  x: ROLES.him.tunicShade,
  P: "#ffffff",
  y: "#4a3324",
  n: lit(PALETTE.ironDark, 0.55),
  C: PALETTE.woodDark,
  c: shade(PALETTE.woodDark, 0.35),
  D: "#3a3a48",
  d: "#2a2a35",
  q: "#1f1f29",
  K: "#3b2a20",
  L: "#5e4634",
  k: "#2a1d16"
};

// His top: pompom, helmet, face, tunic, belt (rows 0 to 9 of his box), and his hips (row 10).
// Order 48 (ADR 0058: the calm Nordic one, wool and iron): two marks from his portrait, rivets on the helmet's rim (row 2) and
// the knit's band of white across his yoke, a zigzag of two rows (rows 6 and 7), as a Norwegian sweater has; his box, frames and
// timing as they were.
const TOP = [
  "....Ww....",
  "...jiII...",
  "..rIrRRIr.",
  "..zsSSiS..",
  "..zsSeSe..",
  "..zssSSS..",
  ".cxPbPBP..",
  "cCxbPbPBb.",
  "cCxbbbBbB.",
  ".cxyynyy.."
];
const HIPS = ["..dDDDDd.."];
/** The head alone (rows 0 to 5), for a nod, a lean or a breath. */
const HEAD = TOP.slice(0, 6);
const BODY = TOP.slice(6);
const BLINK: Piece = [["z.z"], 5, 4];
/** The hand: hanging at his side, forward, back behind him, raised. */
const HAND_DOWN: Piece = [["S"], 8, 9];
const HAND_FWD: Piece = [["bS"], 8, 8];
const HAND_BACK: Piece = [["S"], 0, 9];
const HAND_UP: Piece = [["S", "b"], 9, 5];

// Legs, from his hips down (rows 10 to 13), near leg lit, far leg dark.
const STAND = ["..dDDDDd..", "..qd..dD..", "..qd..dD..", "..kk..KL.."];
// The run (feet planted where they land: front at columns 7 and 8, under him at 4 and 5, behind at 1 and 2).
const RUN = [
  // 0: the near foot lands in front, the far foot is behind, about to lift.
  ["..dDDDDd..", "..qq..dD..", ".qq....dD.", ".kk....KL."],
  // 1: the near foot under him; the far leg swings past, its foot raised (him a pixel higher, so his hips are row 9).
  ["...qdD....", "..qqdD....", "..kkdD....", "....KL...."],
  // 2: the far foot lands in front, the near foot behind.
  ["..dDDDDd..", "..dD..qq..", ".dD....qq.", ".KL....kk."],
  // 3: the far foot under him; the near leg swings past.
  ["...dqq....", "..dDqq....", "..KLqq....", "....kk...."]
];
const RISE = ["..dDDDDd..", "..qq.dDD..", "..kk..KL..", ".........."];
const APEX = ["..dDDDDd..", "..qqdDD...", "..kkKL....", ".........."];
const FALL = ["..dDDDDd..", ".qq....dD.", ".qq....dD.", ".kk....KL."];
const LAND = ["..dDDDDd..", ".qq...dD..", ".kk...KL.."];
const LAND_DEEP = [".qdDDDDdD.", "kk.....KL."];
const DASH = ["..dDDDDd..", "qq....dD..", "k......dD.", ".......KL."];
const BRACE = ["..dDDDDd..", ".qq...dD..", ".kk...KL.."];
/** Seated (a bench, the sledge): his legs out in front of him along the seat. */
const SEATED = ["..dDDDDDd.", "...qqqqKL."];

const at = (rows: readonly string[], dx = 0, dy = 0): Piece => [rows, dx, dy];
const make = (name: string, ...pieces: Piece[]) => frame(name, HIM_INK, ...pieces);

/** Every frame he has, by name: the sheet, the tests and the drawing use this table. */
export const HIM = {
  stand: make("stand", at(TOP), at(STAND, 0, 10), HAND_DOWN),
  breath: make("breath", at(BODY, 0, 6), at(HEAD, 0, 1), at(["...Ww ...."], 0, 1), at(STAND, 0, 10), HAND_DOWN),
  blink: make("blink", at(TOP), at(STAND, 0, 10), HAND_DOWN, BLINK),
  breathBlink: make("breath, blinking", at(BODY, 0, 6), at(HEAD, 0, 1), at(["...Ww ...."], 0, 1), at(STAND, 0, 10), HAND_DOWN, [["z.z"], 5, 5]),
  run: [
    make("run 1", at(TOP), at(RUN[0], 0, 10), HAND_BACK),
    make("run 2", at(TOP, 0, -1), at(HIPS, 0, 9), at(RUN[1], 0, 10), [["S"], 8, 8]),
    make("run 3", at(TOP), at(RUN[2], 0, 10), HAND_FWD),
    make("run 4", at(TOP, 0, -1), at(HIPS, 0, 9), at(RUN[3], 0, 10), [["S"], 8, 8])
  ],
  rise: make("rise", at(TOP), at(RISE, 0, 10), HAND_UP),
  apex: make("top of the jump", at(TOP), at(APEX, 0, 10), HAND_FWD),
  fall: make("fall", at(TOP), at(["Ww"], 4, -1), at(["  "], 4, 0), at(FALL, 0, 10), HAND_UP, [["S", "b"], 0, 5]),
  land: make("landing", at(TOP, 0, 1), at(LAND, 0, 11), [["S"], 9, 10]),
  landDeep: make("landing from high", at(TOP, 0, 2), at(LAND_DEEP, 0, 12), [["S"], 9, 10], [["S"], 0, 11]),
  dash: make("dash", at(BODY, 0, 6), at(HEAD, 1, 0), at(DASH, 0, 10), [["Sb"], -1, 8]),
  shield: make("behind the shield", at(TOP, 0, 1), at(BRACE, 0, 11), [["bbS"], 7, 8]),
  sit: make("sitting", at(TOP, 0, 3), at(SEATED, 0, 12), [["S"], 8, 11]),
  sitBack: make("sitting, leaning back", at(BODY, 0, 9), at(HEAD, -1, 3), at(SEATED, 0, 12), [["bS"], 8, 10]),
  sitForward: make("sitting, leaning forward", at(BODY, 0, 9), at(HEAD, 1, 3), at(SEATED, 0, 12), [["S"], 9, 11]),
  hurt: make("thrown back", at(BODY, 0, 6), at(HEAD, -1, 0), at(FALL, 0, 10), HAND_UP, [["S", "b"], -1, 4], [["z.z"], 4, 4]),
  push: make("pushing into a door", at(BODY, 1, 6), at(HEAD, 1, 0), at(RUN[0], 0, 10), [["bbS"], 8, 7])
} satisfies Record<string, Frame | Frame[]>;

/** Every frame in the table, with its name (for the sheet and the tests). */
export const ALL_FRAMES: Frame[] = Object.values(HIM).flat();

// --- Picking a frame ---------------------------------------------------------------------------------------

/** What the page knows of him at a frame, beyond his body: all of it state the game already keeps. */
export interface HimState {
  /** Steps on the clock (his breath, his blink). */
  t: number;
  /** Walking on the ground. */
  walking: boolean;
  /** Steps since he landed, and whether from high (more than three tiles). */
  landed: number;
  deep: boolean;
  dashing: boolean;
  shield: boolean;
  /** Sitting on a bench or the sledge; on the sledge, how the run slopes (down is positive). */
  seated: boolean;
  slope: number;
  /** Thrown back by a hit, until he lands. */
  thrown: boolean;
  /** Walking into a door. */
  entering: boolean;
  reduced: boolean;
}

/** Steps a landing shows: a short one, and one from high. */
export const LAND_STEPS = { low: 4, high: 6 };

/** The frame for his body and state. Reduced motion keeps the breath and the cycles (they are how he reads state), not the squash. */
export function himFrame(b: Body, s: HimState): Frame {
  if (s.entering) return HIM.push;
  if (s.thrown) return HIM.hurt;
  if (s.seated) return s.slope > 0.3 ? HIM.sitBack : s.slope < -0.3 ? HIM.sitForward : HIM.sit;
  if (s.dashing) return HIM.dash;
  if (s.shield) return HIM.shield;
  if (!b.onGround) return b.vy < -1 ? HIM.rise : b.vy > 1 ? HIM.fall : HIM.apex;
  if (!s.reduced && s.landed < (s.deep ? LAND_STEPS.high : LAND_STEPS.low)) return s.deep ? HIM.landDeep : HIM.land;
  if (s.walking) return HIM.run[runFrame(b.x, b.facing)];
  const breath = Math.floor(s.t / 30) % 2 === 1;
  // A blink now and then: six steps at the end of every three and a half seconds or so, every other one sooner.
  const k = s.t % 360;
  const blink = (k >= 205 && k < 211) || k >= 354;
  return breath ? (blink ? HIM.breathBlink : HIM.breath) : blink ? HIM.blink : HIM.stand;
}

/** The run's frame at x: by the distance covered, so his feet hold on the ground as he goes (`STRIDE` pixels a frame). */
export function runFrame(x: number, facing: number): number {
  const d = facing > 0 ? x : -x;
  return ((Math.floor(d / STRIDE) % 4) + 4) % 4;
}

// --- His looks: the gold helmet, the gold pompom, the night's dimming --------------------------------------

const DIM_TO = "#141c46";
const DIM: Record<string, number> = { day: 0, evening: 0.12, twilight: 0.18, night: 0.25 };
const HELMET = new Set(["I", "i", "j", "r", "R"]);
/** The same frames recoloured, made once per look and phase. */
const looks = new Map<string, Map<Frame, Frame>>();

/** A frame in his look: the helmet gold for a finished run, the pompom gold for the gold feather, dimmed for the phase. */
export function dressed(f: Frame, phase: string, gold: boolean, pompom?: string): Frame {
  const key = `${phase}${gold ? "g" : ""}${pompom ?? ""}`;
  let m = looks.get(key);
  if (!m) looks.set(key, (m = new Map()));
  let d = m.get(f);
  if (!d) {
    const letters = Object.entries(HIM_INK);
    const helmet = gold ? { I: lit(GOLD, 0.35), i: GOLD, j: shade(GOLD, 0.25), r: shade(GOLD, 0.38), R: lit(GOLD, 0.12) } : null;
    const k = DIM[phase] ?? 0;
    d = inked(f, (c) => {
      const letter = letters.find(([, v]) => v === c)?.[0] ?? "";
      let colour = c;
      if (helmet && HELMET.has(letter)) colour = helmet[letter as keyof typeof helmet];
      if (pompom && (letter === "W" || letter === "w")) colour = letter === "W" ? pompom : shade(pompom, 0.2);
      return k ? mix(colour, DIM_TO, k) : colour;
    });
    m.set(f, d);
  }
  return d;
}

/** The ski pole's gold, as the page gives the gold pompom. */
export const GOLD_POMPOM = METAL.gold;
/** A fall from higher than this lands deep. */
export const DEEP_FALL = 3 * TILE;
