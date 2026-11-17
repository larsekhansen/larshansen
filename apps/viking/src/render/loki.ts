import { R, ctx, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, INK, ROLES, WHITE } from "@larshansen/pixelkit/palette";
import { frame, paint, type Frame, type Piece } from "../alive/frames";
import { LOKI, LOKI_RING, LOKI_STEPS, LOKI_WAVE, jawsUp, lokiWave, type Loki } from "../game/loki";
import { outlined, plain } from "./sprite";

// Loki, drawn (order 29, ADR 0052): the trickster of the old stories as an 80s front man, nobody real. Way 3 (ADR 0045):
// per-pixel frames with a ramp of tones a material and a lit side (the light from the top left), built from a small rig of
// parts so every pose is the same man: his head (a thin man's, his own thin hair), his wool sweater, his arms and legs, and
// over them the glamour's pieces, which his hits knock off one by one: the hair (a wig of hot pink and magenta, teased into
// two upswept points, a mullet down his back), the wraparound shades, the jacket (acid green with white shoulder pads, a
// magenta shirt in its open front, a sequin's glint) and with it the rest of the glam (spandex, white boots, the stage
// make-up). After the third he is plain: a thin man in a grey wool sweater with a thermos.
//
// His own neons are hot pink and acid green, the glamour's (`ROLES.glamour`), the magenta and lime as accents; no tell is
// in them: every tell is the bosses' "now" violet (the club raised, the beacons while he revs, the ring), and the opening
// (his pose) is marked in it too, as the serpent's dazed head is. Nothing on him is the paint's yellow.

const E = ENEMY;
/** His colours under the glamour: the enemy palette (he is the Invaders' front man). */
const GLAM: Record<string, string> = {
  k: E.line,
  e: E.eye,
  f: E.pale,
  F: E.pink,
  G: E.plumLight,
  m: E.plum,
  r: E.plumDark,
  R: E.line,
  H: E.hotPink,
  h: E.magenta,
  d: E.plumDark,
  L: E.lime,
  N: E.lime,
  J: E.poisonLight,
  g: E.poison,
  Q: E.white,
  q: E.whiteShade,
  M: E.magenta,
  Y: E.amber,
  W: E.whiteShade,
  w: E.whiteShade,
  v: E.line,
  U: E.purple,
  T: E.purpleDark,
  t: E.line,
  y: E.line,
  B: E.white,
  b: E.whiteShade,
  s: E.whiteShade,
  O: E.poison,
  o: E.line,
  I: E.whiteShade,
  i: E.line
};
/** His natural self, plain (held 8 or more off every neon and 10 off every role by `levels/encore.test.ts`). */
export const PLAIN: Record<string, string> = {
  k: "#2a2420",
  e: "#2a2420",
  f: "#d8bcae",
  F: "#c09890",
  G: "#b08878",
  m: "#9a6a5e",
  r: "#8a7a6a",
  R: "#6a5a4c",
  H: "#8a7a6a",
  h: "#8a7a6a",
  d: "#6a5a4c",
  L: "#8a7a6a",
  N: "#6a5a4c",
  J: "#a8a49c",
  g: "#8a867e",
  Q: "#a8a49c",
  q: "#8a867e",
  M: "#8a867e",
  Y: "#8a867e",
  W: "#a8a49c",
  w: "#8a867e",
  v: "#6e6458",
  U: "#7a6450",
  T: "#6a5440",
  t: "#4a3a2c",
  y: "#6a5a4c",
  B: "#5a3e2c",
  b: "#3e2c20",
  s: "#8a867e",
  O: "#4a6e52",
  o: "#35503b",
  I: "#b8bcc0",
  i: "#8a8e92"
};

// --- The rig ------------------------------------------------------------------------------------------------------------

/** A frame's size: wide enough for his arms out, tall enough for the wig's points; his feet on the bottom row, his middle at x 16. */
export const LOKI_FRAME = { w: 32, h: 46, mid: 16 };

type Pt = readonly [number, number];
interface Arm {
  sh: Pt;
  el: Pt;
  ha: Pt;
}
interface Leg {
  hip: Pt;
  knee: Pt;
  ankle: Pt;
  /** The boot flat on its toe behind him (kneeling), not standing on its sole. */
  toe?: boolean;
}
interface Pose {
  name: string;
  /** The head's and the torso's top left. */
  head: Pt;
  torso: Pt;
  back: Arm;
  front: Arm;
  legs: [Leg, Leg];
  /** What the front hand holds: the mic, the thermos, nothing. */
  holds?: "mic" | "thermos";
}

class Grid {
  c: string[];
  constructor(
    public w: number,
    public h: number
  ) {
    this.c = new Array<string>(w * h).fill(".");
  }
  set(x: number, y: number, ch: string) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.c[y * this.w + x] = ch;
  }
  rows(): string[] {
    return Array.from({ length: this.h }, (_, y) => this.c.slice(y * this.w, y * this.w + this.w).join(""));
  }
  /** A part's rows laid on at (x, y), its "." leaving what is there. */
  put(rows: readonly string[], x: number, y: number) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== "." && this.set(x + i, y + j, ch)));
  }
}

/** The points of a line from a to b, one a step along its longer side. */
function along(a: Pt, b: Pt): Pt[] {
  const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  return Array.from({ length: n + 1 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as const);
}

/** A limb two pixels thick from a to b: its lit pixel on the top left side, its shade on the other. */
function limb(g: Grid, a: Pt, b: Pt, lit: string, mid: string, shade: string) {
  for (const [x, y] of along(a, b)) {
    g.set(x, y, mid);
    g.set(x + 1, y, shade);
    g.set(x, y + 1, mid);
    g.set(x + 1, y + 1, shade);
  }
  for (const [x, y] of along(a, b)) g.set(x, y, lit);
}

/** A leg three pixels wide from the hip by the knee to the ankle, and its boot: lit along its front edge, its back edge in shade (the far leg darker). */
function leg(g: Grid, l: Leg, back: boolean) {
  for (const [p, q] of [[l.hip, l.knee], [l.knee, l.ankle]] as const)
    for (const [x, y] of along(p, q)) {
      g.set(x - 1, y, back ? "t" : "T");
      g.set(x, y, "T");
      g.set(x + 1, y, back ? "t" : "U");
    }
  const [ax, ay] = l.ankle;
  if (l.toe) {
    // Kneeling: the boot lies on its toe behind him.
    g.put(["bBBk", "kkkk"], ax - 4, ay - 1);
    return;
  }
  g.put([".BBb.", "BBBBb", "kkkkk"], ax - 2, ay + 1);
}

/** His head, facing right: his own thin hair, an ear, a brow, the eye, a long nose, a mouth, the chin over his neck. */
const HEAD = [".rrrrr..", "rRrrrfff", "RRFfffff", "RGFffyyf", "GGFffeff", ".GFffffF", ".GFfFmmf", "..GFfff.", "...FFG.."];
/** The wraparound shades over his eyes: the arm back to the ear, the dark lens, its glint at the front. */
const SHADES = ["...Nkkkk", "....kkek"];
/** The wig: teased into two upswept points over his crown, a fringe, the volume at the back, a mullet down to his shoulders. */
const WIG = [
  "...H......H...",
  "...HH....HH...",
  "..HhH...HhH...",
  "..HhhHHHhhH...",
  ".HhhhhhhhhhHH.",
  "HhhdhhhhhhhhhH",
  "HhddhhhhhhHHL.",
  "HhdddhhH......",
  "Hhddddhh......",
  "Hhddddhd......",
  ".hhdddhd......",
  ".Hhddhd.......",
  "..hhdhd.......",
  "..Hhhd........",
  "..hhdd........",
  "...hdd........",
  "...hd.........",
  "....d........."
];
/** His wool sweater: the collar, the shoulders, a cable down its front, the ribbed hem. */
const SWEATER = ["..wWWWWw..", ".wWWWWWWw.", "vwWWvWWWwv", "vwWWvWWWwv", "vwWvWvWWwv", "vwWWvWWWwv", "vwWWvWWWwv", ".wWvWvWWw.", ".wWWvWWWw.", ".vwwwwwwv.", ".vvvvvvvv."];
/** The jacket over it: white shoulder pads, the open front with the magenta shirt, a sequin's glint; the belt and its buckle. */
const JACKET = [
  ".QQq....qQQ.",
  "QQQQgJJgQQQq",
  "qQJJgMMgJJgq",
  ".gJJJMMkJJg.",
  ".gJJJkMkJJg.",
  ".gJQJJkJJgg.",
  ".gJJJJkJJgg.",
  ".gJJJgkJQgg.",
  ".gJJJgkJJgg.",
  ".gJJJgkJJgk.",
  ".kkkkkkYkkk."
];
/** In his front hand: the mic (its grille lit), or the thermos (the cup on top, its band). */
const MIC = ["ss", "sk", ".k", ".k"];
const THERMOS = ["iII", "IIi", "OOo", "OOo", "kkk", "OOo", "OOo", "ooo"];

/**
 * His frame in a pose at a stage of losing the glamour: 0 all of it, 1 the hair gone, 2 the shades too, 3 plain. Under the
 * glamour the arms are the jacket's sleeves; plain, the sweater's.
 */
function build(p: Pose, stage: number): Frame {
  const g = new Grid(LOKI_FRAME.w, LOKI_FRAME.h);
  const sleeve = stage < 3 ? (["g", "g", "k"] as const) : (["w", "w", "v"] as const);
  const front = stage < 3 ? (["J", "g", "k"] as const) : (["W", "w", "v"] as const);
  const arm = (a: Arm, s: readonly [string, string, string]) => {
    limb(g, a.sh, a.el, s[0], s[1], s[2]);
    limb(g, a.el, a.ha, s[0], s[1], s[2]);
    g.put(["fF", "FG"], a.ha[0], a.ha[1]);
  };
  arm(p.back, sleeve);
  leg(g, p.legs[0], true);
  leg(g, p.legs[1], false);
  if (stage < 3) g.put(JACKET, p.torso[0] - 1, p.torso[1] - 1);
  else g.put(SWEATER, p.torso[0], p.torso[1]);
  g.put(HEAD, p.head[0], p.head[1]);
  if (stage < 2) g.put(SHADES, p.head[0], p.head[1]);
  if (stage < 1) g.put(WIG, p.head[0] - 5, p.head[1] - 5);
  arm(p.front, front);
  if (p.holds === "mic") g.put(MIC, p.front.ha[0], p.front.ha[1] - 3);
  if (p.holds === "thermos") g.put(THERMOS, p.front.ha[0] + 1, p.front.ha[1] - 5);
  return frame(`Loki, ${p.name}, ${["glammed", "the hair gone", "the shades gone", "plain"][stage]}`, stage < 3 ? GLAM : PLAIN, [g.rows()] as Piece);
}

// The poses, facing right: his middle at x 16, his feet on the bottom row (45), his scalp at row 12 (his box's top).
const HIP = 32;
const standing = (dy = 0, name = "standing"): Pose => ({
  name,
  head: [12, 12 + dy],
  torso: [11, 21 + dy],
  back: { sh: [12, 23 + dy], el: [11, 27 + dy], ha: [11, 30 + dy] },
  front: { sh: [19, 23 + dy], el: [20, 27 + dy], ha: [21, 29 + dy] },
  legs: [
    { hip: [14, HIP], knee: [14, 37], ankle: [14, 42] },
    { hip: [18, HIP], knee: [18, 37], ankle: [18, 42] }
  ],
  holds: "mic"
});
const strut = (k: number): Pose => {
  const [b, f] = [
    [[12, 37, 10, 42], [20, 37, 22, 42]],
    [[14, 37, 15, 42], [18, 36, 17, 41]],
    [[16, 37, 19, 42], [16, 37, 13, 42]]
  ][k] as [number[], number[]];
  const swing = [3, 0, -3][k];
  return {
    name: `strutting ${k + 1}`,
    head: [12, 12],
    torso: [11, 21],
    back: { sh: [12, 23], el: [11 + swing, 27], ha: [11 + swing * 2, 30] },
    front: { sh: [19, 23], el: [20 - swing, 27], ha: [21 - swing, 29] },
    legs: [
      { hip: [14, HIP], knee: [b[0], b[1]], ankle: [b[2], b[3]] },
      { hip: [18, HIP], knee: [f[0], f[1]], ankle: [f[2], f[3]] }
    ],
    holds: "mic"
  };
};
const wide = (back: Arm, front: Arm, name: string, holds?: Pose["holds"], dx = 0): Pose => ({
  name,
  head: [12 + dx, 12],
  torso: [11, 21],
  back,
  front,
  legs: [
    { hip: [14, HIP], knee: [11, 37], ankle: [9, 42] },
    { hip: [18, HIP], knee: [21, 37], ankle: [23, 42] }
  ],
  holds
});
const POSES = {
  stand: [standing(0), standing(1, "standing, breathing")],
  strut: [strut(0), strut(1), strut(2)],
  // The club raised over his head in both hands (the troll's tell).
  club: wide({ sh: [12, 23], el: [11, 16], ha: [13, 8] }, { sh: [19, 23], el: [21, 16], ha: [17, 8] }, "the club raised"),
  // The club down in front of him, crouched over it.
  slam: {
    name: "the club down",
    head: [14, 16],
    torso: [12, 24],
    back: { sh: [13, 26], el: [18, 31], ha: [23, 34] },
    front: { sh: [20, 26], el: [24, 30], ha: [27, 34] },
    legs: [
      { hip: [14, 35], knee: [17, 39], ankle: [12, 42] },
      { hip: [18, 35], knee: [23, 38], ankle: [21, 42] }
    ]
  } as Pose,
  // Down on one knee, the guitar held out like a blade (the plough's tell): the far thigh straight down to its knee on the
  // floor, its shin flat behind; the near foot planted, its knee up. And sliding on both knees, leaning back, an arm flung up.
  rev: {
    name: "on one knee, revving",
    head: [11, 19],
    torso: [10, 28],
    back: { sh: [11, 30], el: [15, 34], ha: [20, 34] },
    front: { sh: [18, 30], el: [22, 33], ha: [25, 32] },
    legs: [
      { hip: [13, 39], knee: [12, 44], ankle: [6, 44], toe: true },
      { hip: [17, 39], knee: [22, 38], ankle: [22, 42] }
    ]
  } as Pose,
  charge: {
    name: "sliding on his knees",
    head: [8, 20],
    torso: [8, 29],
    back: { sh: [9, 31], el: [6, 25], ha: [3, 19] },
    front: { sh: [16, 31], el: [20, 34], ha: [24, 33] },
    legs: [
      { hip: [11, 39], knee: [16, 44], ankle: [8, 44], toe: true },
      { hip: [15, 39], knee: [21, 44], ankle: [13, 44], toe: true }
    ]
  } as Pose,
  // Arms spread wide, conjuring the ring (the serpent's tell).
  conjure: wide({ sh: [12, 23], el: [7, 25], ha: [3, 26] }, { sh: [19, 23], el: [24, 25], ha: [28, 26] }, "conjuring"),
  // The pose: legs wide, the front arm up, pointing at the sky, the other on his hip (the opening).
  pose: [
    wide({ sh: [12, 23], el: [8, 27], ha: [11, 30] }, { sh: [19, 23], el: [22, 15], ha: [23, 5] }, "posing", undefined, -1),
    wide({ sh: [12, 23], el: [8, 27], ha: [11, 30] }, { sh: [19, 23], el: [22, 16], ha: [24, 7] }, "posing, the fist", undefined, -1)
  ],
  // Knocked back: leaning away, arms thrown up, a foot off the floor.
  reel: {
    name: "knocked back",
    head: [9, 13],
    torso: [9, 22],
    back: { sh: [10, 24], el: [6, 18], ha: [4, 12] },
    front: { sh: [17, 24], el: [22, 19], ha: [25, 14] },
    legs: [
      { hip: [12, HIP], knee: [12, 37], ankle: [12, 42] },
      { hip: [16, HIP], knee: [21, 35], ankle: [25, 37] }
    ]
  } as Pose
};
/** Plain: standing a little stooped with the thermos at his chest; shrugging, palms up; walking off with it. */
const PLAIN_POSES = {
  stand: [0, 1].map(
    (dy): Pose => ({
      name: dy ? "plain, breathing" : "plain",
      head: [13, 13 + dy],
      torso: [11, 22 + dy],
      back: { sh: [12, 24 + dy], el: [11, 28 + dy], ha: [11, 31 + dy] },
      front: { sh: [19, 24 + dy], el: [20, 29 + dy], ha: [22, 28 + dy] },
      legs: [
        { hip: [14, HIP], knee: [14, 37], ankle: [14, 42] },
        { hip: [17, HIP], knee: [17, 37], ankle: [17, 42] }
      ],
      holds: "thermos"
    })
  ),
  shrug: {
    name: "plain, shrugging",
    head: [12, 13],
    torso: [11, 21],
    back: { sh: [12, 22], el: [9, 27], ha: [6, 25] },
    front: { sh: [19, 22], el: [23, 27], ha: [25, 25] },
    legs: [
      { hip: [14, HIP], knee: [14, 37], ankle: [14, 42] },
      { hip: [17, HIP], knee: [17, 37], ankle: [17, 42] }
    ],
    holds: "thermos"
  } as Pose,
  walk: [0, 1, 2].map((k): Pose => {
    const s = strut(k);
    return { ...s, name: `plain, walking ${k + 1}`, head: [13, 13], torso: [11, 22], back: { sh: [12, 24], el: [12, 28], ha: [12 + [2, 0, -2][k], 31] }, front: { sh: [19, 24], el: [20, 29], ha: [22, 28] }, holds: "thermos" };
  })
};

/** Every frame, by stage: the fight's poses under the glamour (stages 0 to 2) and plain, and the plain poses. */
const STAGES = [0, 1, 2, 3].map((st) => ({
  stand: POSES.stand.map((p) => build(p, st)),
  strut: POSES.strut.map((p) => build(p, st)),
  club: build(POSES.club, st),
  slam: build(POSES.slam, st),
  rev: build(POSES.rev, st),
  charge: build(POSES.charge, st),
  conjure: build(POSES.conjure, st),
  pose: POSES.pose.map((p) => build(p, st)),
  reel: build(POSES.reel, st)
}));
const PLAINLY = { stand: PLAIN_POSES.stand.map((p) => build(p, 3)), shrug: build(PLAIN_POSES.shrug, 3), walk: PLAIN_POSES.walk.map((p) => build(p, 3)) };

/** For the sheet and the tests: every frame he has, glammed at each stage and plain. */
export function lokiFrames(): Frame[] {
  return [...STAGES.flatMap((s) => [...s.stand, ...s.strut, s.club, s.slam, s.rev, s.charge, s.conjure, ...s.pose, s.reel]), ...PLAINLY.stand, PLAINLY.shrug, ...PLAINLY.walk];
}

/** The frame he is in now. */
export function lokiFrame(s: Loki, t: number): Frame {
  const age = t - s.since;
  const st = STAGES[Math.min(3, s.hits)];
  switch (s.phase) {
    case "asleep":
    case "waking":
      return s.phase === "waking" && age > 40 ? st.pose[0] : st.stand[0];
    case "strut":
      return st.strut[Math.floor(Math.abs(s.x) / 4) % 3];
    case "club":
      return st.club;
    case "slam":
      return st.slam;
    case "rev":
      return st.rev;
    case "charge":
      return st.charge;
    case "ring":
    case "bite":
      return st.conjure;
    case "pose":
      return st.pose[view.reduced ? 0 : Math.floor(age / 30) % 2];
    case "reel":
      return st.reel;
    case "plain":
      return age > 40 && age < 110 ? PLAINLY.shrug : PLAINLY.stand[Math.floor(age / 40) % 2];
    case "leave":
    case "gone":
      return PLAINLY.walk[Math.floor(Math.abs(s.x) / 4) % 3];
  }
}

// --- What he puts on: the bosses' moves in his own neon ----------------------------------------------------------------

const PROP: Record<string, string> = { k: E.line, H: E.hotPink, h: E.magenta, L: E.lime, g: E.poison, J: E.poisonLight, V: ROLES.now, W: E.white };
const prop = (name: string, rows: string[]) => frame(name, PROP, [rows]);
/** The troll's club in his neon: a long haft, the head knobbed; raised, its head in the violet of a tell. */
const CLUB = prop("Loki's club", [".hHH.", "hHLHH", "hHHHh", ".hHh.", "..k..", "..k..", "..k..", "..k..", "..k..", "..k..", "..k.."]);
const CLUB_UP = prop("Loki's club raised", [".VVV.", "VVWVV", "VVVVV", ".VVV.", "..k..", "..k..", "..k..", "..k..", "..k..", "..k..", "..k.."]);
const CLUB_DOWN = prop("Loki's club down", ["kkkkkkk.hhh.", "kkkkkkkhHLHh", ".......hHHHh", "........hhh."]);
/** The plough's blade as a guitar held out in front of him: an angled body, a neck, the strings' glint. */
const GUITAR = prop("Loki's guitar", ["......hH", ".....hHH", "kkkkhHHL", "kkkkhHHh", ".....hHh", "......hh"]);

/** The violet of a tell, and of where to hit him (as at the three bosses). */
const NOW = ROLES.now;

/** Loki's frame drawn with his feet on the floor at x, facing his way. */
function body(s: Loki, t: number) {
  const f = lokiFrame(s, t);
  const x = Math.round(s.x) - LOKI_FRAME.mid;
  const y = s.def.floor - LOKI_FRAME.h;
  paint(f, x, y, s.dir, LOKI_FRAME.w);
  const at = (dx: number) => (s.dir > 0 ? x + dx : x + LOKI_FRAME.w - dx);
  const age = t - s.since;
  if (s.phase === "club") {
    // The club over his head, raised a full second: its head the tell's violet.
    paint(CLUB_UP, Math.min(at(13), at(18)) - 0, y - 3, 1, 5);
  }
  if (s.phase === "slam") paint(CLUB_DOWN, s.dir > 0 ? at(22) : at(22) - 12, s.def.floor - 4, s.dir, 12);
  if (s.phase === "strut" && s.attack === "club") paint(CLUB, s.dir > 0 ? at(20) : at(24), y + 22, 1, 5);
  if (s.phase === "rev" || s.phase === "charge") paint(GUITAR, s.dir > 0 ? at(20) : at(28), s.def.floor - 16, s.dir, 8);
  // Revving: beacons on his shoulder pads, the plough's: in the tell's violet, flashing twice a second (lit, still, with
  // reduced motion).
  if (s.phase === "rev" && s.hits < 3) {
    const on = view.reduced || Math.floor(age / 15) % 2 === 0;
    if (on) for (const dx of [10, 20]) R(at(dx) - 1, y + 26, 3, 2, NOW);
  }
  void age;
}

/** The piece of his glamour a hit knocked off, flying up and away and fading: the wig, the shades, the jacket. */
const PIECES = [frame("the wig, off", GLAM, [WIG]), frame("the shades, off", GLAM, [SHADES]), frame("the jacket, off", GLAM, [JACKET])];
function flying(s: Loki, t: number) {
  // With reduced motion nothing flies: the piece is simply gone from him.
  if (view.reduced || (s.phase !== "reel" && !(s.phase === "plain" && s.hits >= 3))) return;
  const age = t - s.since + (s.phase === "plain" ? LOKI_STEPS.reel : 0);
  if (age > 70) return;
  const p = PIECES[Math.min(2, s.hits - 1)];
  const k = Math.min(1, age / 60);
  const x = s.x - s.dir * (6 + k * 30);
  const y = s.def.floor - LOKI.h - 10 - Math.sin(k * Math.PI) * 26 + k * 20;
  plain(() => paint(p, Math.round(x - 6), Math.round(y), -s.dir, 14));
}

/** Where to hit him, while he poses: the violet stars over him, turning (still with reduced motion), as over the serpent's dazed head. */
function stars(s: Loki, t: number) {
  if (s.phase !== "pose") return;
  const cx = s.x;
  const cy = s.def.floor - LOKI.h - 12;
  for (let k = 0; k < 3; k++) {
    const a = (view.reduced ? 0 : t * 0.05) + (k * Math.PI * 2) / 3;
    const x = Math.round(cx + Math.cos(a) * 9);
    const y = Math.round(cy + Math.sin(a) * 3);
    R(x, y - 1, 1, 3, NOW);
    R(x - 1, y, 3, 1, NOW);
  }
}

/**
 * Loki, outlined as everything that moves is: in the warning red while touching him hurts (strutting at him, the club
 * raised, sliding), in the calm pale while it does not (waking, revving, conjuring, posing, reeling, plain); a little
 * transparent as he goes out by the wing.
 */
export function drawLoki(s: Loki, t: number) {
  if (s.phase === "gone") return;
  const hurts = (s.phase === "strut" && s.hits < 3) || s.phase === "club" || s.phase === "charge";
  const out = s.out === null ? 0 : Math.min(1, (t - s.out) / 24);
  if (out >= 1) return;
  const g = ctx();
  const a = g.globalAlpha;
  g.globalAlpha = a * (1 - out);
  outlined(() => body(s, t), s, hurts ? E.warning : ROLES.calm);
  g.globalAlpha = a;
  flying(s, t);
  stars(s, t);
}

// --- The ring, the jaws, the wave ---------------------------------------------------------------------------------------

/**
 * The bite's ring of neon foam on what he stood on (the serpent's): a ring of dots in the tell's violet and the foam's
 * white, running after him and then holding (dashed while it follows, whole once it holds); then the jaws come up out of
 * it, a serpent's head in his neon, its mouth open, and sink.
 */
export function drawRing(s: Loki, t: number) {
  const r = s.ring;
  if (!r) return;
  if (s.phase === "ring") {
    const age = t - s.since;
    const swell = view.reduced ? 0 : Math.round(Math.sin(age * 0.2));
    const n = 14;
    for (let k = 0; k < n; k++) {
      if (!r.fixed && k % 2) continue;
      const a = (k / n) * Math.PI * 2;
      const x = Math.round(r.x + Math.cos(a) * (LOKI_RING.r + swell));
      const y = Math.round(r.y - 1 + Math.sin(a) * 3);
      R(x, y, 2, 1, k % 3 ? NOW : WHITE);
    }
    return;
  }
  const h = jawsUp(s, t);
  if (h <= 0) return;
  // Only as much of it as has come up out of the floor: the head first, the neck under it.
  const top = r.y - h;
  outlined(
    () => {
      for (let y = 0; y < Math.min(h, JAWS.length); y++) {
        const row = JAWS[y];
        for (let x = 0; x < row.length; x++) if (row[x] !== ".") R(r.x - 10 + x, top + y, 1, 1, JAW_INK[row[x]]);
      }
      // The neck below the head, scaled in his neon, its lit side on the left.
      for (let y = JAWS.length; y < h; y++) {
        R(r.x - 4, top + y, 8, 1, (y >> 1) % 2 ? E.magenta : E.hotPink);
        R(r.x - 4, top + y, 1, 1, E.lime);
        R(r.x + 3, top + y, 1, 1, E.plumDark);
      }
    },
    undefined,
    E.warning
  );
}
/** The jaws coming up out of the ring: a serpent's head in his neon, its mouth open upward, the teeth, an eye, a lime crest. */
const JAWS = [
  "...a...........a....",
  "..aHa.........aHa...",
  "..HHHa.......aHHH...",
  ".hHHHHa.....aHHHh...",
  ".hHHHHHa...aHHHHh...",
  ".hhHHHHHaaaHHHHhh...",
  "..hhHHHHHHHHHHhh....",
  "..LhhHeHHHHHHhh.....",
  "...hhhHHHHHHhh......",
  "....hhhhhhhhh......."
];
const JAW_INK: Record<string, string> = { a: E.pale, H: E.hotPink, h: E.magenta, L: E.lime, e: E.eye };

/** The club's wave running out along the stage floor both ways, in the club's neon: what he must jump. */
export function drawWave(s: Loki, t: number) {
  // A hump in the floor running out, the boards lifting in his neon (its box is the middle six pixels).
  for (const f of lokiWave(s, t)) {
    outlined(() => {
      R(f.x - 2, f.y + 4, f.w + 4, 2, E.magenta);
      R(f.x - 1, f.y + 2, f.w + 2, 2, E.hotPink);
      R(f.x + 1, f.y, f.w - 2, 2, E.hotPink);
      R(f.x + 1, f.y, 2, 1, E.lime);
    });
  }
  void LOKI_WAVE;
}


/** For the frame sheet: a tone between the frames' colours and the dark, for the sheet's ground. */
export const SHEET_GROUND = mix(INK, WHITE, 0.15);
