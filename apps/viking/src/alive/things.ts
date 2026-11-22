import { COIN, FEATHER, FIRE, FLAG, FOOD, GHOST, INK, METAL, PALETTE, PARADE, SKIN, STONE, WHITE, WOOL_SHADE } from "@larshansen/pixelkit/palette";
import { POLE, HOIST_STEPS, type Flag } from "@larshansen/pixelkit/checkpoint";
import { FEATHERS } from "@larshansen/pixelkit/feather";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { runeCells, type RuneChar } from "../game/runes";
import { SHEEP, type Sheep } from "../game/sheep";
import { frame, lit, paint, shade, stamp, type Frame } from "./frames";

// The small things, drawn as frames (orders 23 and 24; way 3 of `docs/games/GRAIN.md`, ADR 0045): a skilling that turns
// in four frames and glints now and then, a slice of brown cheese with its cut face lit; and (order 24) the bench, the
// bracteate, the rune on its stone, the sheep, the flag the viking game flies (three frames in its level's wind; the
// kit's flag is the front page's and stays as it is), the ski pole at his side and the raven's feather. Each a ramp of
// tones to a material, lit from the top left. Their boxes and where they stand are as before. The first script keeps a
// plain shape for each, drawn only if this file never comes (`LOOKS` in `render/pickups.ts`).

const COPPER: Record<string, string> = { G: COIN.shine, c: COIN.face, d: COIN.rim };
/** The skilling's turn: its face (lit at the top left, the stamp in the middle), turning, on its edge, its back. */
export const SKILLING: Frame[] = [
  frame("skilling, face", COPPER, [[".ccd.", "cGccd", "cGdcd", "cccdd", ".ddd."]]),
  frame("skilling, turning", COPPER, [[".cd..", ".Gcd.", ".ccd.", ".ccd.", "..d.."], 0]),
  frame("skilling, on its edge", COPPER, [["..G..", "..c..", "..c..", "..d..", "..d.."]]),
  frame("skilling, its back", COPPER, [["..dc.", ".dcG.", ".dcc.", ".dcc.", "..d.."]])
];

/** A skilling at (x, y), turning on the clock (each its own, by `seed`); now and then a glint crosses it. */
export function skilling(x: number, y: number, t: number, seed: number) {
  const k = t + seed * 7;
  stamp(SKILLING[Math.floor(k / 10) % 4], x, y);
  // The glint: a four-pointed star at its top left, for six steps in every hundred and fifty, its own moment each.
  const g = (k * 3 + seed * 41) % 150;
  if (g < 6 && !view.reduced) {
    R(x, y + 1, 3, 1, COIN.shine);
    R(x + 1, y, 1, 3, COIN.shine);
  }
}

const CHEESE_INK: Record<string, string> = { H: lit(FOOD.cheeseLight, 0.35), h: FOOD.cheeseLight, c: FOOD.cheese, g: lit(FOOD.cheese, 0.12), d: FOOD.cheeseDark, D: shade(FOOD.cheeseDark, 0.3) };
/** A slice of brown cheese, 12 x 7: the cut face lit at its top, the slicer's grain across it, the rind darker. */
export const CHEESE = frame("cheese", CHEESE_INK, [[".HHhhhhhhhh.", "Hhhhhhhhhhhh", "hccgccccgccc", "ccccccgccccd", "cgccccccccdd", "ccccgccccddd", "dDDDDDDDDDDD"]]);

/** The brown cheese at (x, y), bobbing a pixel: a life. */
export function cheese(x: number, y: number, t: number) {
  const top = y + 2 + (view.reduced ? 0 : Math.round(Math.sin(t * 0.07)));
  stamp(CHEESE, x, top);
  light(x, top, 12, 7, "soft");
}

// --- The bench ---------------------------------------------------------------------------------------------------
const P = PALETTE;
const BENCH_INK: Record<string, string> = { H: lit(P.wood, 0.4), h: lit(P.wood, 0.18), w: P.wood, g: shade(P.wood, 0.15), d: P.woodDark, i: METAL.castIron, I: lit(METAL.castIron, 0.35), j: shade(METAL.castIron, 0.3) };
/** A park bench, 22 x 13: two planks of back and a seat, each lit along its top with its grain in it and shaded under, iron ends lit on their left with a curl and a foot. */
export const BENCH = frame("bench", BENCH_INK, [
  [
    ".IiHHHHHHHHHHHHHHHHIi.",
    ".Iiwwgwwwwgwwwwwgwwdi.",
    ".Ii.................Ii",
    ".IiHHHHHHHHHHHHHHHHIi.",
    ".Iiwwwgwwwwwgwwwwwgdi.",
    ".Ii.................Ii",
    "HHHHHHHHHHHHHHHHHHHHHH",
    "hwwgwwwwwwgwwwwwwgwwwd",
    ".IdddddddddddddddddId.",
    ".Iij..............Iij.",
    ".Ii.i............i.Ii.",
    ".Ii................Ii.",
    "jjjjj.............jjjj"
  ].map((r) => r.slice(0, 22))
]);

/** A park bench at x, its feet on `bottom`. Sitting, he is drawn on it; the armrest goes in front. */
export function bench(x: number, bottom: number, sitting: boolean) {
  stamp(BENCH, x - 11, bottom - 13);
  if (sitting) {
    R(x + 8, bottom - 9, 2, 3, METAL.castIron);
    R(x + 8, bottom - 9, 1, 3, BENCH_INK.I);
  }
}

// --- The bracteate ----------------------------------------------------------------------------------------------------
const GOLD_INK: Record<string, string> = { G: COIN.shine, L: lit(COIN.gold, 0.35), g: COIN.gold, d: COIN.goldDark, D: shade(COIN.goldDark, 0.35) };
/** A gold bracteate, 12 x 12: a raised rim lit at its top left and shaded under, a ring of dots, a beast curled in the middle (an S, as on the old ones). */
const BEAST = ["..dd..", ".d..dL", ".dL...", "..dd..", "....d.", ".ddd.."];
const BRACTEATE_MAP = Array.from({ length: 12 }, (_, y) =>
  Array.from({ length: 12 }, (_, x) => {
    const dx = x + 0.5 - 6;
    const dy = y + 0.5 - 6;
    const d = Math.hypot(dx, dy);
    const toward = -(dx + dy) / 6;
    if (d > 6) return ".";
    if (d > 5) return toward > 0.3 ? "L" : toward < -0.3 ? "D" : "d";
    if (d > 4) return Math.round((Math.atan2(dy, dx) / Math.PI) * 8) % 2 ? "g" : toward > 0 ? "L" : "d";
    const b = BEAST[y - 3]?.[x - 3];
    if (b && b !== ".") return b;
    return toward > 0.55 ? "L" : "g";
  }).join("")
);

/** The bracteate at (x, y), turning slowly (narrower, then full), bobbing, a glint crossing it now and then. */
export function bracteate(x: number, y: number, steps: number) {
  const turn = view.reduced ? 1 : Math.abs(Math.cos(steps * 0.03));
  const w = Math.max(2, Math.round(12 * (0.35 + 0.65 * turn)));
  const left = x + Math.floor((12 - w) / 2);
  const bob = view.reduced ? 0 : Math.round(Math.sin(steps * 0.06));
  // The loop it hangs from.
  R(x + 5, y - 2 + bob, 2, 2, COIN.goldDark);
  R(x + 5, y - 2 + bob, 1, 1, GOLD_INK.L);
  // Turned, the map is sampled across its width; seen nearly edge on, its rim's dark side shows more.
  for (let r = 0; r < 12; r++)
    for (let c = 0; c < w; c++) {
      const ch = BRACTEATE_MAP[r][Math.min(11, Math.floor((c * 12) / w))];
      if (ch === ".") continue;
      const edge = w < 7 && c === w - 1 && ch !== "D" ? "d" : ch;
      R(left + c, y + r + bob, 1, 1, GOLD_INK[edge]);
    }
  // A glint crosses it now and then.
  const g = (steps % 150) - 20;
  if (!view.reduced && g >= 0 && g < w) R(left + g, y + 2 + bob, 1, 8, mix(COIN.goldLight, WHITE, 0.6));
  // Its own light after dusk on the disc alone, row by row (order 25: a square of light round it read as a tile at night).
  for (let r = 0; r < 12; r++) {
    const half = Math.round(Math.sqrt(Math.max(0, 36 - (r + 0.5 - 6) ** 2)) * (w / 12));
    if (half > 0) light(left + Math.round(w / 2) - half, y + r + bob, half * 2, 1, "soft");
  }
}

/** A bracteate found on an earlier visit: its ring as a pale outline, still, where it hangs. */
export function bracteateOutline(x: number, y: number) {
  const ring = mix(COIN.gold, WHITE, 0.55);
  R(x + 5, y - 2, 2, 2, ring);
  for (let r = 0; r < 12; r++)
    for (let c = 0; c < 12; c++) {
      if (BRACTEATE_MAP[r][c] === ".") continue;
      const edge = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dc, dr]) => (BRACTEATE_MAP[r + dr]?.[c + dc] ?? ".") === ".");
      if (edge) R(x + c, y + r, 1, 1, ring);
    }
}

// --- The rune on its stone ----------------------------------------------------------------------------------------
const EDGE = mix(P.rockDark, INK, 0.5);
const STONE_INK: Record<string, string> = { E: EDGE, H: lit(P.rock, 0.3), h: P.rock, r: mix(P.rock, P.rockDark, 0.5), d: P.rockDark, D: shade(P.rockDark, 0.3), m: mix(STONE.light, "#7a9a4a", 0.45) };
/** A small floating stone, 16 x 16: its edge dark, its face lit at the top left and shaded to the bottom right, a fleck of lichen. */
const RUNE_STONE = frame("rune stone", STONE_INK, [
  [
    "................",
    "..EEEEEEEEEEEE..",
    ".EHHHHHHHHHHhhE.",
    ".EHhhhhhhhhhhrE.",
    ".EHhhhhhhhhhrrE.",
    ".EHhhhhhhhhrrrE.",
    ".EHhhhhhhhrrrrE.",
    ".Ehhhhhhhrrrrr E",
    ".Ehhhhhhrrrrrd E",
    ".Ehhhhhrrrrrdd E",
    ".Ehhhhrrrrrddd E",
    ".Ehhhrrrrrdddd E",
    ".Ehhrrrrrdddmd E",
    ".Ehrrrrrddddmm E",
    "..EDDDDDDDDDDDD.",
    "................"
  ].map((r) => r.replace(/ E$/, "E.").replace(/ /g, "d"))
]);

/**
 * A rune on its small stone, 16 x 16 from (x, y). "lit": the rune glows, its strokes cut into the stone (a shadow under
 * each on its lower right), and it bobs; "dark": carved, not found yet (the line map); "ghost": taken, a faint outline.
 */
export function runeStone(x: number, y: number, char: string, state: "lit" | "dark" | "ghost", steps: number, seed = 0) {
  if (state === "ghost") {
    R(x + 2, y + 1, 12, 1, GHOST);
    R(x + 2, y + 14, 12, 1, GHOST);
    R(x + 1, y + 2, 1, 12, GHOST);
    R(x + 14, y + 2, 1, 12, GHOST);
    return;
  }
  // The stone bobs one pixel, up and down, while its rune glows.
  const b = state === "lit" && !view.reduced ? (Math.sin(steps * 0.05 + seed * 1.3) > 0 ? 0 : 1) : 0;
  stamp(RUNE_STONE, x, y + b);
  const cells = runeCells(char as RuneChar, 9, 11);
  const on = (rx: number, ry: number) => !!cells[ry]?.[rx];
  const glow = P.runeGlow;
  const cut = shade(P.rockDark, 0.45);
  cells.forEach((row, ry) =>
    row.forEach((v, rx) => {
      if (!v) return;
      const px = x + 4 + rx;
      const py = y + 3 + b + ry;
      // Cut into the stone: its shadow on the lower right of each stroke.
      if (!on(rx + 1, ry + 1)) R(px + 1, py + 1, 1, 1, cut);
      if (state === "lit") {
        R(px, py, 1, 1, on(rx - 1, ry - 1) || on(rx, ry - 1) ? glow : lit(glow, 0.5));
        light(px, py, 1, 1, "soft");
      } else R(px, py, 1, 1, mix(P.rockDark, INK, 0.45));
    })
  );
}

// --- The sheep -----------------------------------------------------------------------------------------------------
const WOOL: Record<string, string> = { H: lit(P.wool, 0.4), w: P.wool, s: mix(P.wool, WOOL_SHADE, 0.35), S: mix(P.wool, WOOL_SHADE, 0.6), f: P.woodDark, F: lit(P.woodDark, 0.25), e: lit(P.wool, 0.2), k: INK };
/** A sheep, 12 x 7, its head on the right: wool in four tones lit along its back and curled, a dark face with an eye and an ear, dark legs. */
const SHEEP_BODY = [".HHwHHw.....", "HwHwwHwww.Ff", "wwswwwswwFef", "swwwsswwwwff", ".SssSssSs.f."];
const SHEEP_GRAZE = [".HHwHHw.....", "HwHwwHwww...", "wwswwwswwF..", "swwwsswwwwF.", ".SssSssSs.Ff", "..........ef"];
const SHEEP_LEGS = [["..k.k..k.k..", "..k.k..k.k.."], [".k..k...k.k.", ".k..k..k...k"], ["..kk....kk..", "..kk....kk.."], ["...k.k.k.k..", "..k..k.k..k."]];
const sheepFrame = (name: string, body: string[], legs: number, squash = 0) => frame(name, WOOL, [squash ? body.slice(1) : body, 0, squash], [SHEEP_LEGS[legs], 0, 5]);
export const SHEEP_FRAMES = {
  stand: sheepFrame("sheep, standing", SHEEP_BODY, 0),
  walk: [1, 0, 3, 0].map((k, i) => sheepFrame(`sheep, walking ${i + 1}`, SHEEP_BODY, k)),
  graze: [sheepFrame("sheep, grazing", SHEEP_GRAZE, 0), frame("sheep, grazing, chewing", WOOL, [SHEEP_GRAZE.map((r, i) => (i === 5 ? "..........fe" : r))], [SHEEP_LEGS[0], 0, 5])],
  squash: sheepFrame("sheep, landed on", SHEEP_BODY, 0, 1)
};

/** A sheep: walking in four frames by the distance it covers, grazing (chewing), or flattened a pixel by a landing. */
export function sheep(s: Sheep) {
  const f = s.squash > 0 ? SHEEP_FRAMES.squash : s.grazing > 0 ? SHEEP_FRAMES.graze[Math.floor(s.grazing / 20) % 2] : SHEEP_FRAMES.walk[((Math.floor(s.x / 3) % 4) + 4) % 4];
  paint(f, Math.round(s.x - SHEEP.w / 2), s.bottom - SHEEP.h, s.dir, SHEEP.w);
}

// --- The flag the viking game flies --------------------------------------------------------------------------------
const CLOTH_INK: Record<string, string> = { R: lit(FLAG.red, 0.2), r: FLAG.red, q: shade(FLAG.red, 0.25), W: FLAG.white, w: "#dfe3ea", B: lit(FLAG.blue, 0.25), b: FLAG.blue, v: shade(FLAG.blue, 0.3) };
/**
 * Norway's flag, 13 x 9, in three frames of a ripple running out along it (the folds lit and shaded in turn, the free
 * end lifting and dropping), for a wind that blows it out; and three that hang more, for still air.
 */
function cloth(k: number, slack: boolean): Frame {
  const rows: string[] = [];
  for (let y = 0; y < 14; y++) rows.push(".".repeat(13));
  const g = rows.map((r) => [...r]);
  for (let x = 0; x < 13; x++) {
    const wave = Math.sin((x / 13) * Math.PI * 2.2 - k * 2.1);
    const tone = wave > 0.4 ? 2 : wave < -0.4 ? 0 : 1;
    // The free end lifts and drops with the ripple; in still air the cloth sags toward its end.
    const dy = Math.round(wave * (x / 13) * (slack ? 0.8 : 1.2)) + (slack ? Math.round((x / 12) * 1.6) : 0);
    for (let y = 0; y < 9; y++) {
      if (slack && x > 9 && y < (x - 9)) continue;
      const blue = x === 4 || y === 4;
      const white = (x >= 3 && x <= 5) || (y >= 3 && y <= 5);
      const ch = blue ? "vbB"[tone] : white ? "wwW"[tone] : "qrR"[tone];
      g[y + 1 + dy][x] = ch;
    }
  }
  return frame(`flag${slack ? ", hanging" : ""} ${k + 1}`, CLOTH_INK, [g.map((r) => r.join(""))]);
}
const CLOTH = { out: [0, 1, 2].map((k) => cloth(k, false)), hanging: [0, 1, 2].map((k) => cloth(k, true)) };
const POLE_INK: Record<string, string> = { p: METAL.flagpole, P: lit(METAL.flagpole, 0.35), b: METAL.brass, B: lit(METAL.brass, 0.45), s: STONE.dark, S: STONE.light, r: FLAG.red, W: FLAG.white, v: FLAG.blue, q: shade(FLAG.red, 0.25) };
const KNOB = frame("flagpole's knob", POLE_INK, [[".B.", "Bbb"]]);
const FOOT = frame("flagpole's foot", POLE_INK, [["SSSSs", "sssss"]]);
const BUNDLE = frame("flag, folded", POLE_INK, [["rWrr", "qvqq", "WvWW", "rvrq", "qvqq"]]);

/** How each level's wind blows a flag: the steps a frame of its ripple shows, and whether the air is too still to fly it out. */
const WIND: Record<string, { rate: number; still?: boolean }> = {
  stortinget: { rate: 26, still: true },
  holmenkollen: { rate: 5 },
  ekeberg: { rate: 6 },
  korketrekkeren: { rate: 6 },
  langkaia: { rate: 9 },
  akershus: { rate: 8 },
  bygdoy: { rate: 9 },
  bjorvika: { rate: 8 },
  gamlebyen: { rate: 10 }
};

/**
 * Norway's flag as the game flies it, 13 x 9 (with its ripple's rows, 14), on a wall's pole, a roof's or a tower's (order 26,
 * section 3b: in place of the kit's flat one): its top left at (x, y) as the kit's `flagCloth(x, y + 1)` put its cloth;
 * rippling at `rate` steps a frame, still with reduced motion.
 */
export function flagFlying(x: number, y: number, t: number, rate = 12) {
  stamp(CLOTH.out[view.reduced ? 0 : Math.floor((t + x) / rate) % 3], x, y);
}

/** A flag on its pole (a checkpoint), folded at its foot until he raises it, then run up and flying in its level's wind. */
export function flag(f: Flag, raisedAt: number | null, steps: number, level: string) {
  const top = f.bottom - POLE.h;
  stamp(FOOT, f.x - 2, f.bottom - 2);
  R(f.x, top, 1, POLE.h - 2, METAL.flagpole);
  R(f.x, top, 1, Math.round(POLE.h * 0.4), POLE_INK.P);
  stamp(KNOB, f.x - 1, top - 2);
  if (raisedAt === null) return stamp(BUNDLE, f.x + 1, f.bottom - 7);
  const p = view.reduced ? 1 : Math.max(0, Math.min(1, (steps - raisedAt) / HOIST_STEPS));
  const eased = p * p * (3 - 2 * p);
  const y = Math.round(f.bottom - 12 - (f.bottom - 12 - top) * eased);
  const wind = WIND[level] ?? { rate: 12 };
  const k = view.reduced ? 0 : Math.floor((steps + f.x) / wind.rate) % 3;
  stamp((wind.still ? CLOTH.hanging : CLOTH.out)[k], f.x + 1, y - 1);
}

// --- The ski pole and the feather -------------------------------------------------------------------------------------
const POLE_SKI: Record<string, string> = { g: "#2a1d16", G: "#5e4634", s: METAL.lampPost, S: lit(METAL.lampPost, 0.4), d: shade(METAL.lampPost, 0.3), r: P.sailStripe, R: lit(P.sailStripe, 0.3) };
/** The ski pole at his side, `h` tall: a leather grip with its strap, a shaft lit along its upper part, the basket's ring near its tip. */
export function skiPole(x: number, top: number, h: number) {
  R(x, top - 1, 1, 1, POLE_SKI.R);
  R(x, top, 1, 3, POLE_SKI.g);
  R(x, top, 1, 1, POLE_SKI.G);
  R(x - 1, top + 1, 1, 2, POLE_SKI.g);
  R(x, top + 3, 1, h - 3, POLE_SKI.s);
  R(x, top + 3, 1, Math.round(h * 0.45), POLE_SKI.S);
  R(x, top + h - 5, 1, 5, POLE_SKI.d);
  R(x - 1, top + h - 4, 3, 1, POLE_SKI.d);
  R(x - 1, top + h - 4, 1, 1, POLE_SKI.S);
  R(x, top + h, 1, 1, INK);
}

// The raven's feather, 5 x 9 (`FEATHERS`): the kit's since order 36, so the maze draws the same feather over its last finish.

/** The feather with its top left at (x, y), with a pale halo round it as it falls onto him. */
export function feather(x: number, y: number, gold: boolean) {
  const f = gold ? FEATHERS.gold : FEATHERS.black;
  for (let i = 0; i < f.runs.length; i += 4) {
    const fx = x + f.runs[i];
    const fy = y + f.runs[i + 1];
    const n = f.runs[i + 2];
    R(fx - 1, fy, n + 2, 1, FEATHER.shine);
    R(fx, fy - 1, n, 3, FEATHER.shine);
  }
  stamp(f, x, y);
}

// --- Flames and lamps (order 24, section 2) -------------------------------------------------------------------------
// Its middle tone is between the flame and the core, not the kit's glow: that is within 10 of the yellow paint, which
// nothing but what he stands on may be (the palette test).
const FLAME_INK: Record<string, string> = { f: FIRE.flame, g: mix(FIRE.flame, FIRE.core, 0.4), c: FIRE.core };
/** A small flame, 5 x 6, in three frames: its tongue licking left and right, its core low and hot. */
const FLAMES = [
  ["..f..", ".fgf.", ".fgf.", "fgcgf", "fgccf", ".fff."],
  ["...f.", "..fg.", ".fgf.", "fgcgf", "fgcgf", ".fff."],
  [".f...", ".gf..", ".fgf.", "fgcgf", "fccgf", ".fff."]
].map((rows, k) => frame(`flame ${k + 1}`, FLAME_INK, [rows]));

/** A flame with its foot at (x, y), flickering on its own clock (`seed`), still with reduced motion. */
export function flame(x: number, y: number, t: number, seed = 0) {
  const k = view.reduced ? 0 : Math.floor((t + seed * 7) / 5) % 3;
  stamp(FLAMES[k], x - 2, y - 6);
}

/** How bright an oil lamp burns just now, 0 to 2, on its own clock (`seed`): it gutters now and then; 1 with reduced motion. */
export function lampFlicker(t: number, seed = 0): number {
  if (view.reduced) return 1;
  const k = (t + seed * 13) % 97;
  return k < 4 ? 0 : k < 40 ? 1 : k < 46 ? 2 : 1;
}

// --- People in a crowd (order 25) -------------------------------------------------------------------------------------
// The crowds along Karl Johan and under the ski jump were the last people drawn in rectangles. A person, 6 x 14 from the
// top of its hair, seen from the front: hair (or a knitted hat with its bobble) in its colour and shaded down its right
// (a blond lit toward white would come near the paint), a face lit and shaded, a coat lit down its left and across its
// shoulders and shaded down its right, its arms at its sides. Each made once for its colours and copied (a crowd is many
// of them); the flag some wave, in two frames.
const PERSON = [
  "..HHh.",
  ".HHhhh",
  ".hSsz.",
  ".hssz.",
  "..sz..",
  "CCCcck",
  "CCccck",
  "Ckccck",
  "Ckcckk",
  "Skcckz",
  ".Cccck",
  ".Ccckk",
  ".Cc.ck",
  ".cc.kk"
];
/** A knitted hat: the hair's rows in its colour, and a bobble on top. */
const PERSON_HAT = ["...H.."];
const people = new Map<string, Frame>();
/**
 * A person in a crowd at (x, y), the top of its hair: its coat's colour, its hair's or hat's, and whether that is a hat.
 * `dark`: its coat is lit in its own colour and shaded below it (a yellow coat lit toward white comes near the paint).
 */
export function person(x: number, y: number, coat: string, hair: string, hat = false, dark = false) {
  const key = `${coat}${hair}${hat}`;
  let f = people.get(key);
  if (!f) {
    const ink = { H: hair, h: shade(hair, 0.22), S: lit(SKIN, 0.2), s: SKIN, z: shade(SKIN, 0.18), C: dark ? coat : lit(coat, 0.18), c: dark ? shade(coat, 0.12) : coat, k: shade(coat, dark ? 0.34 : 0.3) };
    people.set(key, (f = frame(`a person in a crowd`, ink, [PERSON], ...(hat ? [[PERSON_HAT, 0, -1] as [string[], number, number]] : []))));
  }
  stamp(f, x, y);
}
const CROWD_FLAG_INK: Record<string, string> = { p: PARADE.pole, R: lit(FLAG.red, 0.2), r: FLAG.red, q: shade(FLAG.red, 0.25), W: FLAG.white, b: FLAG.blue };
/**
 * A hand flag's cloth, 7 x 5 (order 26, section 3b: at 4 x 3 it was a red patch with a white mark): Norway's, so it cannot
 * be anything else: from the stick, red, white, the blue upright, white, then three red; from the top, red, white, the blue
 * arm, white, red; the cross's arms running the whole width and height, its upright nearer the stick. Lit in the corner by
 * the stick, its free end a shade darker. `dip`: how far each column hangs below the top (a wave).
 */
export const HAND_FLAG = ["RWbWrrr", "WWbWWWW", "bbbbbbb", "WWbWWWW", "rWbWrrq"];
export function handFlag(dip: readonly number[]): string[] {
  const rows = Array.from({ length: 5 + Math.max(...dip) }, () => [..."......."]);
  HAND_FLAG.forEach((row, y) => [...row].forEach((ch, x) => (rows[y + dip[x]][x] = ch)));
  return rows.map((r) => r.join(""));
}
/** The waves a hand flag is shown in: out, its free end dipping, a ripple. */
export const HAND_WAVES: readonly (readonly number[])[] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 2],
  [0, 0, 1, 1, 1, 0, 0]
];
/** A small flag on its stick, waved: the cloth out or dipping, 8 x 8 from the stick's top (the stick down its left). */
const CROWD_FLAGS = HAND_WAVES.slice(0, 2).map((dip, k) => frame(k ? "a waved flag, dipping" : "a waved flag", CROWD_FLAG_INK, [Array(8).fill("p")], [handFlag(dip), 1, 0]));
export function crowdFlag(x: number, y: number, k: number) {
  stamp(CROWD_FLAGS[k], x, y);
}
