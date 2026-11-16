import { mix } from "@larshansen/pixelkit/paint";
import { COIN, ENEMY, FLAG, FOOD, METAL, PALETTE } from "@larshansen/pixelkit/palette";

// The grain study (order 22, part B): the subjects drawn again by hand, pixel by pixel, as maps of letters (one
// letter a colour from a ramp of three to five tones per material: a shade, a middle, a light, a highlight). Each
// subject twice: at today's grain (`coarse`, way 3: same grain, better drawn) and on a grid twice as fine (`fine`,
// ways 1 and 2). A debug study only (`?debug&grain=...`): nothing here is in the live game.

/** A drawing: its rows (a letter per pixel, "." for none), the letters' colours. */
export interface PixelMap {
  rows: string[];
  colours: Record<string, string>;
}

/** Every row as wide as the first, or the map is wrong. */
function map(rows: string[], colours: Record<string, string>, name: string): PixelMap {
  const w = rows[0].length;
  rows.forEach((r, i) => {
    if (r.length !== w) throw new Error(`${name}: row ${i} is ${r.length} wide, not ${w}`);
    for (const ch of r) if (ch !== "." && !colours[ch]) throw new Error(`${name}: no colour for "${ch}"`);
  });
  return { rows, colours };
}

const shade = (c: string, k: number) => mix(c, "#141018", k);
const light = (c: string, k: number) => mix(c, "#ffffff", k);

// --- Him ----------------------------------------------------------------------------------------------------

const HIM_COLOURS: Record<string, string> = {
  W: "#ffffff",
  w: "#cdd3dd",
  I: light(PALETTE.ironDark, 0.45),
  i: "#6b7480",
  j: shade("#6b7480", 0.35),
  r: shade("#6b7480", 0.55),
  R: light("#6b7480", 0.2),
  S: light("#f1c27d", 0.3),
  s: "#f1c27d",
  z: shade("#f1c27d", 0.22),
  e: "#1f1a17",
  E: "#ffffff",
  B: light("#2b4c8c", 0.22),
  b: "#2b4c8c",
  x: shade("#2b4c8c", 0.35),
  P: light("#2b4c8c", 0.65),
  y: "#5a3a22",
  k: "#c9a24a",
  C: PALETTE.woodDark,
  c: shade(PALETTE.woodDark, 0.35),
  D: "#3a3a48",
  d: "#262632",
  K: "#3b2a20",
  L: "#5e4634"
};

/** Him today's size, 10 x 14, facing right: a lit front and a shaded back, a pompom that tilts as he breathes, a hand that swings. */
const HIM_TOP = ["....WW....", "...jiII...", "..rrrrrrr.", "..zsSSrS..", "..zsSeSe..", "..zssSSS..", ".cxbbBBb..", "cCxbPbBPb.", "cCxbbbBbB.", ".cxyykyy..", "..dDDDDd.."];
const HIM_TOP_BREATH = ["...WW.....", "...jiII...", "..rrrrrrr.", "..zsSSrS..", "..zsSeSe..", "..zssSSS..", ".cxbbBBb..", "cCxbPbBPb.", "cCxbbbBbB.", ".cxyykyy..", "..dDDDDd.."];
const HIM_TOP_SWING = ["....WW....", "...jiII...", "..rrrrrrr.", "..zsSSrS..", "..zsSeSe..", "..zssSSS..", ".cxbbBBb..", "cCxbPbBPbS", "cCxbbbBbB.", ".cxyykyy..", "..dDDDDd.."];
const HIM_LEGS = {
  stand: ["..dD..dD..", "..dD..dD..", "..KL..KL.."],
  walk1: ["..dD..dD..", ".dD....DD.", ".KL....KL."],
  walk2: ["..dD..dD..", "...dDdD...", "...KLKL..."],
  walk3: ["..dD..dD..", ".DD....dD.", ".KL....KL."],
  air: [".dD....dD.", "dD......DD", "KL......KL"]
};
export const HIM = {
  stand: map([...HIM_TOP, ...HIM_LEGS.stand], HIM_COLOURS, "him stand"),
  breath: map([...HIM_TOP_BREATH, ...HIM_LEGS.stand], HIM_COLOURS, "him breath"),
  walk: [map([...HIM_TOP_SWING, ...HIM_LEGS.walk1], HIM_COLOURS, "him walk1"), map([...HIM_TOP, ...HIM_LEGS.walk2], HIM_COLOURS, "him walk2"), map([...HIM_TOP_SWING, ...HIM_LEGS.walk3], HIM_COLOURS, "him walk3"), map([...HIM_TOP, ...HIM_LEGS.walk2], HIM_COLOURS, "him walk4")],
  air: map([...HIM_TOP_SWING, ...HIM_LEGS.air], HIM_COLOURS, "him air")
};

/** Him on a grid twice as fine, 20 x 28: a face with an eye and its glint, a hand, the tunic's knit, boots with a lit toe. */
const HIM_FINE_TOP = [
  "........WW..........",
  ".......WWWW.........",
  ".......wWWw.........",
  "........ww..........",
  "......jjiiIIi.......",
  ".....jjiiiIIIi......",
  "....jjiiiiiIIIi.....",
  "...rrrrrrrrrrrrrr...",
  "...rRRRRRRRRRRRRr...",
  "....zzsssSSSrrSS....",
  "....zzssSEeSrrEe....",
  "....zzssSeeSrrSe....",
  "....zzsssSSSSSSS....",
  ".....zzsssSSSzS.....",
  "...cCxxbbbbBBBb.....",
  "..cCCxxbbPbbBBPb....",
  "..cCCxxbbbbbBBBb....",
  "..cCxxbbbbbbBBBbb...",
  "..ccxxbbPbbbbBPbb...",
  "...cxxbbbbbbbBBbb...",
  "....xyyyyyykkyyy....",
  "....ddddDDDDDDDd...."
];
const HIM_FINE_HAND = HIM_FINE_TOP.map((r, i) => (i === 16 ? "..cCCxxbbbbbBBBbSS.." : i === 17 ? "..cCxxbbbbbbBBBbSz.." : r));
const HIM_FINE_LEGS = {
  stand: ["....ddDD....ddDD....", "....ddDD....ddDD....", "....ddDD....ddDD....", "....ddDD....ddDD....", "...KKKLL...KKKLL....", "...KKKKK...KKKKK...."],
  walk1: ["....ddDD....ddDD....", "...ddDD......ddDD...", "..ddDD........DDDD..", "..dDD..........DDD..", ".KKKL..........KKLL.", ".KKKK..........KKKK."],
  walk2: ["....ddDD....ddDD....", ".....ddDD..ddDD.....", "......dDDddDD.......", "......dDDdDD........", ".....KKKLKKLL.......", ".....KKKKKKKK......."]
};
export const HIM_FINE = {
  stand: map([...HIM_FINE_TOP, ...HIM_FINE_LEGS.stand], HIM_COLOURS, "him fine stand"),
  walk: [map([...HIM_FINE_HAND, ...HIM_FINE_LEGS.walk1], HIM_COLOURS, "him fine walk1"), map([...HIM_FINE_TOP, ...HIM_FINE_LEGS.walk2], HIM_COLOURS, "him fine walk2")]
};

// --- The rat ------------------------------------------------------------------------------------------------

const RAT_COLOURS: Record<string, string> = {
  M: light(ENEMY.plum, 0.3),
  m: ENEMY.plum,
  n: shade(ENEMY.plum, 0.3),
  o: shade(ENEMY.plum, 0.55),
  p: ENEMY.pink,
  q: shade(ENEMY.pink, 0.25),
  e: ENEMY.eye,
  l: ENEMY.line,
  w: ENEMY.pale
};
/** The rat today's size, 13 x 10, facing right: fur lit along its back and dark under, a pink ear, a whisker, a tail that curls. */
export const RAT = {
  stand: map([
    ".........pq..",
    "....mMMMMmq..",
    "...mMMMMMMmm.",
    "..nmmMMmmmmle",
    "..nnmmmmmmmmw",
    "..onnmmmmmnmp",
    "q..onnnnnno..",
    ".q..p..p.....",
    "..qq.........",
    "............."
  ], RAT_COLOURS, "rat"),
  walk: [
    map([
      ".........pq..",
      "....mMMMMmq..",
      "...mMMMMMMmm.",
      "..nmmMMmmmmle",
      "..nnmmmmmmmmw",
      "..onnmmmmmnmp",
      "q..onnnnnno..",
      ".q.p.....p...",
      "..qq.........",
      "............."
    ], RAT_COLOURS, "rat walk1"),
    map([
      ".........pq..",
      "....mMMMMmq..",
      "...mMMMMMMmm.",
      "..nmmMMmmmmle",
      "..nnmmmmmmmmw",
      "..onnmmmmmnmp",
      ".q.onnnnnno..",
      "q....pp......",
      ".qq..........",
      "............."
    ], RAT_COLOURS, "rat walk2")
  ]
};
/** The rat on a grid twice as fine, 26 x 20: fur in strands, a pink ear with its inside, an eye with its glint, whiskers, claws. */
export const RAT_FINE = map([
  "..................qpp.....",
  "..........mmmMMMmqppq.....",
  "........mmMMMMMMMMqq......",
  ".......mMMMMMMMMMMMmm.....",
  "......mmMMmMMMMMMMMMmm....",
  ".....nmmMmmMMmMMMMmmmmm...",
  ".....nmmmmmmmmMMmmmmmlem..",
  "....nnmmmmmmmmmmmmmmmlemm.",
  "....nnmmmmmmmmmmmmmmmmmmmw",
  "....onnmmmmmmmmmmmmmmmmmlw",
  "....onnnmmmmmmmmmmmmmnmmpp",
  ".....onnnmmmmmmmmmmnnnmmp.",
  "......onnnnnnnnnnnnnnoo...",
  "qq.....oonnnnnnnnnnoo.....",
  ".qq.....pq........pq......",
  "..qq...pq.........pq......",
  "...qq..ww.........ww......",
  "....qqq...................",
  "..........................",
  ".........................."
], { ...RAT_COLOURS, l: ENEMY.line }, "rat fine");

// --- The pigeon -------------------------------------------------------------------------------------------------

const PIGEON_COLOURS: Record<string, string> = {
  M: light(ENEMY.plum, 0.3),
  m: ENEMY.plum,
  n: shade(ENEMY.plum, 0.3),
  O: ENEMY.orangeLight,
  o: ENEMY.orange,
  g: ENEMY.poison,
  G: ENEMY.poisonLight,
  e: ENEMY.eye,
  l: ENEMY.line,
  p: ENEMY.pink,
  k: ENEMY.orange
};
/** The pigeon today's size, 13 x 11: a lit back, a darker wing with two bars, a sheen on its neck, a beak. */
export const PIGEON = map([
  "...........e.",
  ".........mmlk",
  ".........gGm.",
  ".........gGm.",
  "..mMMMMMoOO..",
  "nnmmlmlMoOO..",
  ".nnmmmmmooO..",
  "..nnnnnnno...",
  "....p..p.....",
  "....p..p.....",
  "...pp.pp....."
], PIGEON_COLOURS, "pigeon");
/** The pigeon on a grid twice as fine, 26 x 22. */
export const PIGEON_FINE = map([
  ".....................mm...",
  "....................mmmm..",
  "...................mmelmkk",
  "...................mmmmmkk",
  "...................gGGmm..",
  "...................gggGm..",
  "..................gGgGGm..",
  "..................ggGGmm..",
  ".....mmMMMMMMMMMMmoOOOO...",
  "....mmMMMMMMMMMMMmoOOOOO..",
  "..nnmmmmMMmmMMMMMmooOOOO..",
  ".nnnmmmmmmmmmmmMMmooOOOO..",
  "nnnnnmmmMMmmMMmmmmoooOO...",
  ".nnnnmmmmmmmmmmmmmoooO....",
  "...nnnnnmmmmmmmmmooo......",
  ".....nnnnnnnnnnnnoo.......",
  "........pp...pp...........",
  "........pp...pp...........",
  "........pp...pp...........",
  ".......ppp..ppp...........",
  "......p.p..p.p............",
  ".........................."
], PIGEON_COLOURS, "pigeon fine");

// --- The cheese ---------------------------------------------------------------------------------------------------

const CHEESE_COLOURS: Record<string, string> = {
  H: light(FOOD.cheeseLight, 0.35),
  h: FOOD.cheeseLight,
  c: FOOD.cheese,
  d: FOOD.cheeseDark,
  D: shade(FOOD.cheeseDark, 0.3),
  g: light(FOOD.cheese, 0.12)
};
/** A slice of brown cheese, 12 x 7: the cut face lit at its top, the grain of the slicer across it, the rind darker. */
export const CHEESE = map([
  ".HHhhhhhhhh.",
  "Hhhhhhhhhhhh",
  "hccgccccgccc",
  "ccccccgccccd",
  "cgccccccccdd",
  "ccccgccccddd",
  "dDDDDDDDDDDD"
], CHEESE_COLOURS, "cheese");
/** The cheese on a grid twice as fine, 24 x 14: the slicer's ridges, a curl at the edge. */
export const CHEESE_FINE = map([
  "...HHHHHHhhhhhhhhhhhh...",
  "..HHHhhhhhhhhhhhhhhhhhh.",
  ".HHhhhhhhhhhhhhhhhhhhhhh",
  "Hhhhhhhhhhhhhhhhhhhhhhhh",
  "hcccgggccccccccgggcccccc",
  "cccccccccgggcccccccccccd",
  "ccgggccccccccccgggccccdd",
  "cccccccccccccccccccccddd",
  "cccccggggcccccccccccdddd",
  "cgccccccccccgggcccccdddd",
  "ccccccccccccccccccdddddd",
  "cccgggccccccccccdddddddd",
  "dDDDDDDDDDDDDDDDDDDDDDDD",
  ".DDDDDDDDDDDDDDDDDDDDDD."
], CHEESE_COLOURS, "cheese fine");

// --- Round things: the skilling, the bracteate, the shield (drawn per pixel from a circle, lit from the top left) ---

type Disc = (dx: number, dy: number, r: number, size: number) => string | null;
function discMap(size: number, paint: Disc, colours: Record<string, string>, name: string): PixelMap {
  const rows: string[] = [];
  const rr = size / 2;
  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - rr;
      const dy = y + 0.5 - rr;
      row += Math.hypot(dx, dy) > rr ? "." : (paint(dx, dy, rr, size) ?? ".");
    }
    rows.push(row);
  }
  return map(rows, colours, name);
}

const COPPER = { G: COIN.shine, L: light(COIN.face, 0.3), c: COIN.face, d: COIN.rim, D: shade(COIN.rim, 0.35) };
/** A skilling: the rim darker below, the face lit above, a stamped mark, the glint. `size` 5 (today) or 10 (finer). */
function skilling(size: number) {
  return discMap(size, (dx, dy, r) => {
    const d = Math.hypot(dx, dy);
    if (d > r - (size > 6 ? 1.2 : 0.9)) return dy > 0.3 ? "D" : dx + dy < -r * 0.6 ? "L" : "d";
    if (size > 6 && Math.abs(dx) < 1 && Math.abs(dy) < 2.4) return "d";
    if (size > 6 && Math.abs(dy) < 1 && Math.abs(dx) < 2.4) return "d";
    if (size <= 6 && Math.abs(dx) < 0.6 && Math.abs(dy) < 0.6) return "d";
    if (dx + dy < -r * 0.55) return "G";
    if (dx + dy < -r * 0.1) return "L";
    return "c";
  }, COPPER, `skilling ${size}`);
}
export const SKILLING = skilling(5);
export const SKILLING_FINE = skilling(10);

const GOLD = { G: COIN.shine, L: light(COIN.gold, 0.35), g: COIN.gold, d: COIN.goldDark, D: shade(COIN.goldDark, 0.35) };
/** A bracteate: a raised rim, a ring of dots, a stamped beast (a head and a looping body) in the middle; 12 (today) or 24. */
function bracteate(size: number) {
  const k = size / 12;
  // The beast, on a 12 x 12 grid: a head (top right), a body looping round, a leg.
  const BEAST = ["............", "............", "............", ".......BB...", "......BBBB..", "....BBB.B...", "...BB.......", "...B..BB....", "...BBBBB....", "....B..B....", "............", "............"];
  return discMap(size, (dx, dy, r, s) => {
    const d = Math.hypot(dx, dy);
    if (d > r - 1.2 * k) return dy > 0 ? "D" : "d";
    if (d > r - 2 * k) return dx + dy < 0 ? "L" : "g";
    if (Math.abs(d - (r - 2.6 * k)) < 0.5 * k && Math.round(Math.atan2(dy, dx) * 6) % 2 === 0) return "d";
    const gx = Math.floor(((dx + r) / s) * 12);
    const gy = Math.floor(((dy + r) / s) * 12);
    if (BEAST[gy]?.[gx] === "B") return size > 12 && (dx + dy) < -1 ? "L" : "d";
    if (dx + dy < -r * 0.5) return "L";
    return "g";
  }, GOLD, `bracteate ${size}`);
}
export const BRACTEATE = bracteate(12);
export const BRACTEATE_FINE = bracteate(24);

const SHIELD_COLOURS = { R: light("#b8322a", 0.25), r: "#b8322a", q: shade("#b8322a", 0.3), C: light("#e9dcc0", 0.3), c: "#e9dcc0", k: shade("#e9dcc0", 0.25), i: PALETTE.ironDark, I: light(PALETTE.ironDark, 0.4), b: METAL.lampPost, B: light(METAL.lampPost, 0.5) };
/** The round shield: four boards red and cream in turn, lit from the top left, an iron rim, the boss with a glint; 12 or 24. */
function shield(size: number) {
  return discMap(size, (dx, dy, r) => {
    const d = Math.hypot(dx, dy);
    if (d > r - (size > 12 ? 1.6 : 1.1)) return dx + dy < -r * 0.5 ? "I" : "i";
    if (d < (size > 12 ? 2.6 : 1.4)) return dx + dy < -0.5 ? "B" : "b";
    const board = Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 2)) % 2 === 0;
    const lit = dx + dy < -r * 0.45 ? 2 : dx + dy > r * 0.45 ? 0 : 1;
    // The planks' joints, on the finer grid.
    if (size > 12 && Math.abs(((dx * 0.7 + dy * 0.7) % 4) + 4) % 4 < 0.5) return board ? "q" : "k";
    return board ? ["q", "r", "R"][lit] : ["k", "c", "C"][lit];
  }, SHIELD_COLOURS, `shield ${size}`);
}
export const SHIELD = shield(12);
export const SHIELD_FINE = shield(24);
/** On his back, as today: eight across (sixteen on the finer grid). */
export const SHIELD_BACK = shield(8);
export const SHIELD_BACK_FINE = shield(16);

// --- The flag: Norway's, flying from its pole, the cloth in folds -----------------------------------------------

const FLAG_COLOURS = { R: light(FLAG.red, 0.2), r: FLAG.red, q: shade(FLAG.red, 0.25), W: "#ffffff", w: "#dfe3ea", B: light(FLAG.blue, 0.2), b: FLAG.blue, v: shade(FLAG.blue, 0.3) };
/** The cloth, w x h: the cross where it is on Norway's flag (6, 1, 2, 1, 12 in 22), folds lit and shaded down its length. */
function flagCloth(w: number, h: number) {
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      const u = (x / w) * 22;
      const v = (y / h) * 16;
      const fold = Math.sin((x / w) * Math.PI * 3 - 0.6);
      const tone = fold > 0.45 ? 2 : fold < -0.45 ? 0 : 1;
      const blue = (u >= 7 && u < 9) || (v >= 7 && v < 9);
      const white = (u >= 6 && u < 10) || (v >= 6 && v < 10);
      row += blue ? ["v", "b", "B"][tone] : white ? ["w", "w", "W"][tone] : ["q", "r", "R"][tone];
    }
    rows.push(row);
  }
  return map(rows, FLAG_COLOURS, `flag ${w}`);
}
export const FLAG_CLOTH = flagCloth(14, 9);
export const FLAG_CLOTH_FINE = flagCloth(28, 18);

// --- The bench: planks with their grain, iron ends --------------------------------------------------------------

const BENCH_COLOURS = { H: light(PALETTE.wood, 0.4), h: light(PALETTE.wood, 0.18), w: PALETTE.wood, g: shade(PALETTE.wood, 0.15), d: PALETTE.woodDark, i: METAL.castIron, I: light(METAL.castIron, 0.35), j: shade(METAL.castIron, 0.3) };
/**
 * A park bench, 22 x 13 (today's size) or 44 x 26: two planks of back and a seat, each lit along its top, the grain
 * in them, iron ends with a curl and a foot. Drawn from rules for the planks (so their grain does not repeat) and by
 * hand for the iron.
 */
function bench(k: 1 | 2): PixelMap {
  const W = 22 * k;
  const H = 13 * k;
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const plank = (x0: number, y0: number, w: number, h: number) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const grain = ((x * 7 + y * 13 + (x >> 2) * 5) % (k === 2 ? 11 : 9)) === 0;
        g[y0 + y][x0 + x] = y === 0 ? "H" : y === h - 1 ? "d" : grain ? "g" : y === 1 && k === 2 ? "h" : "w";
      }
  };
  plank(1 * k, 0, 20 * k, 2 * k);
  plank(1 * k, 3 * k, 20 * k, 2 * k);
  plank(0, 6 * k, 22 * k, 2 * k);
  g[8 * k - 1 + (k === 2 ? 1 : 0)]?.fill(".");
  for (const x0 of [1 * k, 19 * k]) {
    for (let y = 0; y < 13 * k; y++) for (let x = 0; x < 2 * k; x++) g[y][x0 + x] = x === 0 ? "I" : x === 2 * k - 1 ? "j" : "i";
    // The foot, and on the finer grid a curl under the seat.
    for (let x = -k; x < 3 * k; x++) if (x0 + x >= 0 && x0 + x < W) g[H - 1][x0 + x] = "j";
    if (k === 2) {
      g[17][x0 + (x0 < W / 2 ? 4 : -3)] = "i";
      g[18][x0 + (x0 < W / 2 ? 5 : -4)] = "i";
      g[19][x0 + (x0 < W / 2 ? 4 : -3)] = "i";
    }
  }
  return map(g.map((r) => r.join("")), BENCH_COLOURS, `bench ${k}`);
}
export const BENCH = bench(1);
export const BENCH_FINE = bench(2);
