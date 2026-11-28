import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { mix } from "@larshansen/pixelkit/paint";
import { frame, lit, shade, type Frame } from "../alive/frames";

// The faces when they talk (order 47, ADR 0057). Lars: "Maybe when he talks you can make a more detailed version of his face,
// like they do in many pixel games. Maybe with over the top emoting ... It fits the theme." and "So the bigger face panels when
// talking. And more detail on the character anyway." A portrait is a picture of who speaks, 56 art pixels square, in the game's
// own grain (a ramp of tones a material, the light from the top left, the game's near-black for lines), far more detailed than
// the figure in the level: Loki, the loud glam one, six expressions as large as the theatre allows, at each stage of losing his
// glamour; and the hero, the calm Nordic one, four quiet ones. They are the game's own characters: no real performer's, band's
// or any other game's character's face, costume or likeness (ADR 0050, 0052).
//
// Each portrait is built from parts laid one over another, as Loki's figure is: a backdrop, the shoulders, the neck and the
// head, then by expression the brows, the eyes and the mouth, then the hair, the shades and what the expression throws round
// it (shock lines, sparkles, a sweat drop, speed lines). Facing right; the panel mirrors the one on its right side.

/** A portrait's size, art pixels. */
export const FACE = 56;

/** Loki's six expressions (order 47: "over the top emoting"). */
export const LOKI_FACES = ["smug", "delighted", "outraged", "wounded", "scheming", "shout"] as const;
export type LokiFace = (typeof LOKI_FACES)[number];
/** The hero's four: quiet where Loki is loud. */
export const HERO_FACES = ["calm", "surprised", "set", "pleased"] as const;
export type HeroFace = (typeof HERO_FACES)[number];

const E = ENEMY;

/** A grid of letters, one a pixel, laid over itself part by part ("." leaves what is there). */
class Pic {
  c: string[] = new Array<string>(FACE * FACE).fill(".");
  at(x: number, y: number) {
    return x >= 0 && y >= 0 && x < FACE && y < FACE ? this.c[y * FACE + x] : ".";
  }
  set(x: number, y: number, ch: string) {
    if (x >= 0 && y >= 0 && x < FACE && y < FACE) this.c[y * FACE + x] = ch;
  }
  span(y: number, x0: number, x1: number, ch: string) {
    for (let x = x0; x <= x1; x++) this.set(x, y, ch);
  }
  put(rows: readonly string[], x: number, y: number) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== "." && this.set(x + i, y + j, ch)));
  }
  /** Each pixel of `from` that borders something else on its left or top takes `lightCh`; on its right or bottom, `shadeCh`. */
  rim(from: string, lightCh: string, shadeCh: string) {
    const was = [...this.c];
    const get = (x: number, y: number) => (x >= 0 && y >= 0 && x < FACE && y < FACE ? was[y * FACE + x] : ".");
    for (let y = 0; y < FACE; y++)
      for (let x = 0; x < FACE; x++) {
        if (get(x, y) !== from) continue;
        if (get(x + 1, y) !== from || get(x, y + 1) !== from) this.set(x, y, shadeCh);
        else if (get(x - 1, y) !== from || get(x, y - 1) !== from) this.set(x, y, lightCh);
      }
  }
  /** A line of `ch` round every pixel not in `ground` where it meets `ground` (the figure's outline against its backdrop). */
  outline(ground: string, ch: string) {
    const was = [...this.c];
    const get = (x: number, y: number) => (x >= 0 && y >= 0 && x < FACE && y < FACE ? was[y * FACE + x] : ground[0]);
    for (let y = 0; y < FACE; y++)
      for (let x = 0; x < FACE; x++) {
        if (!ground.includes(get(x, y))) continue;
        if ([get(x + 1, y), get(x - 1, y), get(x, y + 1), get(x, y - 1)].some((n) => !ground.includes(n))) this.set(x, y, ch);
      }
  }
  rows(): string[] {
    return Array.from({ length: FACE }, (_, y) => this.c.slice(y * FACE, y * FACE + FACE).join(""));
  }
}

// --- Loki ----------------------------------------------------------------------------------------------------------------

/** His colours under the glamour: the enemy palette's, as his figure's are, with a few tones between for the larger picture. */
const LOKI_GLAM: Record<string, string> = {
  // The stage behind him: the dark of the rig, the purple and magenta of its lights, their rays, a star.
  "1": mix(E.line, E.purpleDark, 0.55),
  "2": E.purpleDark,
  "3": mix(E.purpleDark, E.purple, 0.55),
  "4": mix(E.purple, E.magenta, 0.35),
  "5": E.hotPink,
  "*": E.lime,
  "+": "#ffffff",
  // His skin, powdered for the stage: lit, its middle, shade and deep shade.
  S: E.pale,
  s: mix(E.pale, E.pink, 0.3),
  x: mix(E.pale, E.pink, 0.75),
  X: E.plumLight,
  // The line round his features, his eyes (their white, the iris his trickster's green, the pupil, the shine).
  l: E.line,
  w: mix(E.eye, E.white, 0.3),
  O: E.poison,
  o: E.line,
  e: E.eye,
  // The make-up: lids, the liner's wing, a lime star under his eye, his lips, the mouth's inside, teeth, tongue.
  V: E.purple,
  v: E.purpleDark,
  "#": E.lime,
  M: E.plum,
  m: mix(E.line, E.plumDark, 0.4),
  t: E.eye,
  T: E.pink,
  // His brows, dyed to the wig.
  B: E.magenta,
  // The wig: hot pink lit, magenta, its dark, the lime streak and headband.
  H: E.hotPink,
  h: E.magenta,
  d: E.plumDark,
  L: E.lime,
  // His own thin hair, under it.
  R: "#5a4a3c",
  r: "#3e3228",
  // The shades: frame and lens, the lens's lit band and the lights in it, the arm in lime.
  k: E.line,
  K: mix(E.line, E.purpleDark, 0.6),
  g: mix(E.purple, E.eye, 0.35),
  N: E.lime,
  // The jacket: leopard print, its shade, the rosettes; white shoulder pads and their shade; the magenta shirt and its shade.
  A: E.amber,
  a: E.orange,
  Q: E.white,
  q: E.whiteShade,
  P: E.magenta,
  p: E.plumDark,
  // The sweater (plain) and the emotions' marks: a sweat drop, a vein, the gloom.
  G: "#a8a49c",
  u: "#8a867e",
  U: "#6e6458",
  b: "#bfe8ff",
  y: E.hotPink,
  "~": mix(E.purpleDark, E.line, 0.3)
};
/** Plain, the glamour gone: his own skin and colours, a stage with its lights off. */
const LOKI_PLAIN: Record<string, string> = {
  ...LOKI_GLAM,
  "1": "#24232a",
  "2": "#2e2d34",
  "3": "#38373f",
  "4": "#43424a",
  "5": "#55545c",
  "*": "#8a8a8e",
  S: "#e4ccbe",
  s: "#d2b2a2",
  x: "#b8968a",
  X: "#9a786c",
  w: "#efece4",
  O: "#6e8a6a",
  V: "#c8a89a",
  v: "#a8887a",
  M: "#a8746a",
  m: "#3a2a26",
  t: "#f4efe4",
  T: "#c0707a",
  B: "#5a4a3c",
  y: "#a8746a",
  "~": "#2a2830"
};

/** The rows of a head facing right three-quarters, crown to chin: [row, left, right]. Skull an oval, then the cheekbones, then the jaw to its chin. */
function headRows(top: number, chinY: number, chinX: number, left: number, right: number, cheek: number, jawFull: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const mid = (left + right) / 2;
  const rx = (right - left) / 2;
  for (let y = top; y <= chinY; y++) {
    if (y < cheek) {
      const k = Math.max(0, 1 - ((cheek - y) / (cheek - top + 1)) ** 2);
      const half = rx * Math.sqrt(k);
      out.push([y, Math.round(mid - half), Math.round(mid + half)]);
    } else if (y < jawFull) out.push([y, left, right]);
    else {
      const k = (y - jawFull) / (chinY - jawFull + 1);
      out.push([y, Math.round(left + (chinX - 2 - left) * k ** 1.3), Math.round(right - (right - chinX - 2) * k ** 1.1)]);
    }
  }
  return out;
}

/** Loki's head: long and thin, high cheekbones, a pointed chin, from row 11 to 46. */
const LOKI_HEAD = headRows(11, 46, 30, 15, 40, 25, 32);

/** The stage behind him: the rig's dark at the top, bands of its lights lower down, rays from behind his head, stars. */
function lokiBackdrop(p: Pic, rays: boolean, shout: boolean) {
  for (let y = 0; y < FACE; y++) p.span(y, 0, FACE - 1, y < 14 ? "1" : y < 30 ? "2" : y < 44 ? "3" : "4");
  // Dither between the bands, every other pixel on the row at the edge.
  for (const [y, ch] of [[13, "2"], [29, "3"], [43, "4"]] as const) for (let x = y % 2; x < FACE; x += 2) p.set(x, y, ch);
  if (rays) {
    // Spotlight rays fanning out from behind his head (a shout: many, as speed lines; else a few).
    const n = shout ? 18 : 8;
    for (let k = 0; k < n; k++) {
      const a = -Math.PI * 0.98 + (k / (n - 1)) * Math.PI * 1.96;
      for (let r = 20; r < 46; r++) {
        const x = Math.round(28 + Math.cos(a) * r);
        const y = Math.round(28 + Math.sin(a) * r);
        if (shout || r % 4) p.set(x, y, r > 34 ? "5" : "4");
        if (shout && r > 32) p.set(x, y, "+");
      }
    }
    for (const [x, y] of [[4, 5], [51, 4], [52, 19], [3, 23]]) p.put([".*.", "*+*", ".*."], x - 1, y - 1);
  }
}

/** His shoulders: the jacket (leopard, white pads, the magenta shirt open at the neck) under the glamour; the grey wool sweater plain. */
function lokiShoulders(p: Pic, jacket: boolean) {
  if (jacket) {
    for (let y = 46; y < FACE; y++) {
      const half = Math.min(27, 10 + (y - 46) * 3);
      p.span(y, 28 - half, 28 + half, "A");
    }
    // The rosettes: rings of the near-black round the print's shade.
    for (let y = 48; y < FACE; y += 4)
      for (let x = y % 8 ? 2 : 5; x < FACE; x += 6) if (p.at(x, y) === "A") p.put([".k.", "kak", ".k."], x - 1, y - 1);
    p.rim("A", "A", "a");
    // The shirt in the open front, down from the neck, and the lapels' edges.
    for (let y = 46; y < FACE; y++) {
      const half = Math.min(6, 2 + Math.floor((y - 46) / 2));
      p.span(y, 28 - half, 28 + half, y % 5 === 0 ? "p" : "P");
      p.set(28 - half - 1, y, "k");
      p.set(28 + half + 1, y, "k");
    }
    // The shoulder pads, as big as they go: white, lit along their top, shaded under, a line round each.
    for (const x0 of [0, 42]) {
      p.put(["..QQQQQQQQQQ..", ".QQQQQQQQQQQQq", "QQQQQQQQQQQQqq", "qQQQQQQQQQQqqq", "qqqqqqqqqqqqqq", ".aaaaaaaaaaaa."], x0, 44);
    }
  } else {
    for (let y = 47; y < FACE; y++) {
      const half = Math.min(24, 9 + (y - 47) * 3);
      p.span(y, 28 - half, 28 + half, "G");
    }
    p.rim("G", "G", "u");
    // The collar, and a cable down its front.
    for (let x = 22; x <= 34; x++) p.set(x, 47, "U");
    for (let y = 49; y < FACE; y++) p.set(28 + ((y >> 1) % 2 ? 1 : -1), y, "u"), p.set(28, y, "U");
  }
}

/** His neck and head in his skin, shaded from the top left; his ear; the jaw's and the cheekbone's shadow; the long nose. */
function lokiHead(p: Pic, dx: number, dy: number) {
  for (let y = 40; y < 49; y++) p.span(y + dy, 24 + dx, 32 + dx, "s");
  for (let y = 43; y < 49; y++) p.span(y + dy, 29 + dx, 32 + dx, "x");
  for (const [y, x0, x1] of LOKI_HEAD) p.span(y + dy, x0 + dx, x1 + dx, "s");
  p.rim("s", "S", "x");
  // The lit plane of his forehead and of the cheek nearest the light.
  for (let y = 13; y < 24; y++) p.span(y + dy, 20 + dx, 27 + dx, "S");
  for (let y = 29; y < 33; y++) p.span(y + dy, 18 + dx, 21 + dx, "S");
  // The hollow under the cheekbone (a stroke down to his mouth's corner), the jaw's shade, the chin's underside.
  for (let k = 0; k < 9; k++) p.set(30 + k + dx, 34 + Math.floor(k / 3) + dy, "x");
  for (let k = 0; k < 9; k++) p.set(19 + k + dx, 35 + k + dy, "x");
  for (let y = 41; y < 46; y++) p.set(24 + (y - 41) + dx, y + dy, "X");
  // The ear on the far side, its fold.
  p.put([".xs", "xss", "xSs", "xXs", "xXs", "xXs", "xss", ".xs"], 13 + dx, 26 + dy);
  // The long nose: its ridge lit, down to a pointed tip past his cheek, the nostril, its shadow.
  p.put(["S...", "Ss..", "Ss..", "Ss..", "SSs.", "SSs.", "SSSs", "SSSsx", "xlllx"], 37 + dx, 26 + dy);
}

/** Brows, eyes and mouth by expression; with `shades` the eyes are under them and the brows over. */
function lokiFeatures(p: Pic, face: LokiFace, dx: number, dy: number, shades: boolean, makeUp: boolean) {
  const at = (rows: readonly string[], x: number, y: number) => p.put(rows, x + dx, y + dy);
  // The brows, two pixels thick: the far one over the far eye, the near one over the near eye; big, readable shapes.
  const BROWS: Record<LokiFace, [readonly string[], readonly string[]]> = {
    smug: [["......", "BBBBBB", "BBBBBB"], ["....BBB", "..BBBB.", "BBB....", "B......"]],
    delighted: [[".BBBB.", "BB..BB", "B....B"], [".BBBBB.", "BB...BB", "B.....B"]],
    outraged: [["BB....", "BBBB..", ".BBBBB", "...BBB"], ["....BBB", "..BBBB.", "BBBBB..", "BB....."]],
    wounded: [["....BB", "..BBBB", "BBBB..", "BB...."], ["BB.....", "BBBB...", "..BBBB.", "....BBB"]],
    scheming: [["......", "BBBB..", "BBBBBB", "....BB"], ["BB.....", "BBBBBB.", "..BBBBB", "......."]],
    shout: [["BB....", ".BBB..", "..BBBB", "....BB"], ["BBB....", "BBBBB..", "...BBBB", "......B"]]
  };
  const [farBrow, nearBrow] = BROWS[face];
  at(farBrow, 19, 20);
  at(nearBrow, 29, 20);
  if (!shades) {
    // The eyes: the far one narrower (three quarters), the near one whole, the lids' make-up over each.
    const EYES: Record<LokiFace, [readonly string[], readonly string[]]> = {
      smug: [["lllll", "wwOOl", "..ll."], ["llllll", "wwwOOl", ".llll."]],
      delighted: [[".lll.", "l...l", "....."], [".llll.", "l....l", "......"]],
      outraged: [[".lll.", "wwwww", "wwoww", ".lll."], [".llll.", "wwwwww", "wwwoww", ".llll."]],
      wounded: [[".lll.", "wOOel", "wOOOw", ".bbb.", "..b.."], [".llll.", "wwOOel", "wwOOOw", ".llll.", "....b."]],
      scheming: [["lllll", "lwOol", "....."], ["llllll", "llwOol", "......"]],
      shout: [["l...l", ".l.l.", "..l.."], ["l....l", ".l..l.", "..ll.."]]
    };
    const [farEye, nearEye] = EYES[face];
    at(farEye, 20, 25);
    at(nearEye, 30, 25);
    if (makeUp) {
      // The purple on his lids (where an eye is open), the liner's wing at the outer corner.
      if (face !== "delighted" && face !== "shout") {
        at(["VVVVV"], 20, 24);
        at(["VVVVVV"], 30, 24);
      }
      at(["..vv", ".v..", "v..."], 35, 23);
    }
  }
  if (makeUp) at(["..#..", "..#..", "##+##", "..#..", "..#.."], 32, 30);
  // The mouth, large.
  const MOUTH: Record<LokiFace, readonly string[]> = {
    smug: ["..........ll", ".........lM.", "llMMMMMMMMl.", "..llllllll..", "...........x"],
    delighted: ["lMMMMMMMMMMl", "lttttttttttl", "lmmmmmmmmmml", ".lmmTTTTmml.", "..lmTTTTml..", "...llllll..."],
    outraged: ["lMMMMMMMMMl", "lttlttlttll", "lmmmmmmmmml", "lttlttlttll", ".lllllllll."],
    wounded: ["...llll...", "..lMMMMl..", ".l......l.", "l........l", "...xxxx..."],
    scheming: [".........ll", "llMMMMMMMl.", ".lttttttl..", "..llllll...", ".xxxxxx...."],
    shout: ["..lllllllll..", ".lMMMMMMMMMl.", "lMttttttttMMl", "lMmmmmmmmmmMl", "lMmmmmmmmmmMl", "lMmmTTTTTmmMl", "lMmTTTTTTTmMl", ".lMMMMMMMMMl.", "..lllllllll.."]
  };
  at(MOUTH[face], face === "shout" ? 24 : face === "wounded" ? 26 : 25, face === "shout" ? 36 : face === "smug" || face === "scheming" ? 37 : 38);
}

/** The wig: teased as high as the picture allows, spiked all round, wide behind his head, the lime streak and headband, the fringe, the mullet. */
function lokiWig(p: Pic, dx: number, dy: number) {
  const W = new Pic();
  // The mass: an oval of hair over and behind his head, wider than the picture's middle.
  for (let y = 2; y < 28; y++) {
    const k = (y - 15) / 14;
    const half = 22 * Math.sqrt(Math.max(0, 1 - k * k));
    W.span(y, Math.round(24 - half), Math.round(26 + half * 0.85), "h");
  }
  // Spikes standing out of it all round, teased up and out from his crown.
  for (let k = 0; k < 15; k++) {
    const a = -Math.PI * 1.02 + (k / 14) * Math.PI * 1.04;
    const len = 7 + ((k * 5) % 3);
    for (let r = 0; r < len; r++) {
      const cx = 25 + Math.cos(a) * (20 + r);
      const cy = 17 + Math.sin(a) * (14 + r);
      const half = Math.max(0, Math.round((len - r) / 3) - 1);
      W.span(Math.round(cy), Math.round(cx) - half, Math.round(cx) + half, r > len - 3 ? "H" : "h");
    }
  }
  // Behind his head and down his back: the mullet, over his far shoulder.
  for (let y = 24; y < 47; y++) W.span(y, Math.max(1, 4 + Math.floor((y - 24) / 5)), 15 - Math.floor(Math.max(0, y - 36) / 2), y > 42 ? "d" : "h");
  // Strands: streaks lit hot pink running out from the crown, dark ones between.
  for (let k = 0; k < 22; k++) {
    const a = -Math.PI + (k / 21) * Math.PI * 1.1;
    for (let r = 6; r < 24; r++) {
      const x = Math.round(25 + Math.cos(a) * r * 1.15);
      const y = Math.round(17 + Math.sin(a) * r * 0.8);
      if (W.at(x, y) === "h") W.set(x, y, k % 3 === 1 ? "d" : r % 5 === 0 ? "h" : "H");
    }
  }
  for (let y = 26; y < 44; y += 3) W.set(7 + (y % 2), y, "H");
  // The lime streak swept back from his brow.
  for (let y = 3; y < 19; y++) W.set(31 - Math.floor(y / 2), y, "L"), W.set(32 - Math.floor(y / 2), y, y % 4 ? "L" : "H");
  // Lay it over him, leaving his face: nothing of it below the brows on the face's side of the ear.
  for (let y = 0; y < FACE; y++)
    for (let x = 0; x < FACE; x++) {
      const ch = W.at(x, y);
      if (ch === ".") continue;
      if (y > 20 && x > 17) continue;
      p.set(x + dx, y + dy, ch);
    }
  // The fringe over his forehead, to his brows, spiky.
  p.put(["hHhhHhhHhhHhhHhh", "hhHh.hHhh.hHhhh.", ".hh...hh...hh...", "..h....h....h..."], 18 + dx, 17 + dy);
  // The headband across his brow, knotted behind, its ends hanging.
  p.span(16 + dy, 15 + dx, 40 + dx, "L");
  p.put(["LLL", ".LL", ".L.L", "L...L"], 9 + dx, 16 + dy);
}

/** His own thin hair, plain: combed back over the crown, thin at the temple, a little behind the ear. */
function lokiOwnHair(p: Pic, dx: number, dy: number) {
  p.put([
    ".....rRRRRRRr.....",
    "...rRRRrRRRRRRr...",
    "..rRrRRrRRrRRRRr..",
    ".rRrr.rRr.rRr.rRr.",
    "rRr.....r.....r...",
    "rr................",
    "rr................",
    "r................."
  ], 17 + dx, 10 + dy);
}

/** The wraparound shades over both eyes: a frame, the lens, its lit band and a light in it, the lime arm to his ear. */
function lokiShades(p: Pic, dx: number, dy: number) {
  p.put([
    "kkkkkkkkkkkkkkkkkkkkk",
    "kKKKKKgKKkkKKKKKgKKKk",
    "kKgg++KKKk.kKKgg++KKk",
    "kKKKKKKKKk.kKKKKKKKKk",
    ".kKKKKKKk...kKKKKKKk.",
    "..kkkkkk.....kkkkkk.."
  ], 18 + dx, 24 + dy);
  p.put(["NNNNN", "....N"], 13 + dx, 24 + dy);
}

/** What his expression throws round him: shock lines, sparkles, a sweat drop, the gloom, the vein. */
function lokiMarks(p: Pic, face: LokiFace, dx: number, dy: number) {
  const at = (rows: readonly string[], x: number, y: number) => p.put(rows, x + dx, y + dy);
  if (face === "outraged") {
    // Shock lines either side of his head, and a vein standing out at the temple.
    for (const [x, y] of [[46, 6], [49, 17], [2, 31]]) at(["+...", ".+..", "..+.", ".+..", "+..."], x, y);
    at(["+..+", ".++.", ".++.", "+..+"], 45, 28);
    at(["y..y", ".yy.", ".yy.", "y..y"], 33, 11);
  }
  if (face === "delighted") {
    for (const [x, y] of [[45, 12], [47, 30], [4, 34]]) at(["...+...", "...+...", "..+*+..", "++*+*++", "..+*+..", "...+...", "...+..."], x, y);
    at(["yy...yy"], 30, 35);
  }
  if (face === "wounded") {
    at(["..b..", ".bbb.", "bbbbb", "bbbbb", ".bbb."], 41, 17);
    for (const x of [22, 27, 32]) at(["~", "~", ".", "~", "~", ".", "~"], x, 6);
  }
  if (face === "scheming") {
    // A glint in the dark: he has had an idea.
    at(["...+...", "..+++..", ".+++++.", "+++++++", ".+++++.", "..+++..", "...+..."], 44, 21);
  }
  if (face === "smug") at(["+.+", ".+.", "+.+"], 38, 36);
}

/**
 * Loki's portrait: an expression at a stage of losing the glamour (0 all of it, 1 the wig gone, 2 the shades too, 3 plain: the
 * jacket and the rest gone, a thin man in a grey sweater).
 */
export function lokiPortrait(face: LokiFace, stage: number): Frame {
  const p = new Pic();
  const plain = stage >= 3;
  // A shout pushes his head forward and up; hurt, he draws it back.
  const [dx, dy] = face === "shout" ? [2, -1] : face === "wounded" ? [-1, 1] : [0, 0];
  lokiBackdrop(p, !plain, face === "shout");
  lokiShoulders(p, !plain);
  lokiHead(p, dx, dy);
  if (stage === 0) lokiWig(p, dx, dy);
  else lokiOwnHair(p, dx, dy);
  lokiFeatures(p, face, dx, dy, stage < 2, !plain);
  if (stage < 2) lokiShades(p, dx, dy);
  p.outline("12345*+", "l");
  lokiMarks(p, face, dx, dy);
  return frame(`Loki, ${face}, ${["glammed", "the wig gone", "the shades gone", "plain"][Math.min(3, stage)]}`, plain ? LOKI_PLAIN : LOKI_GLAM, [p.rows()]);
}

// --- The hero ------------------------------------------------------------------------------------------------------------

/** His colours: his figure's (`HIM_INK` in the kit): the helmet's iron, the white pompom, his skin, the tunic's blue and its white knit, the cape. */
const HERO: Record<string, string> = {
  // A winter evening behind him: the sky, paler toward the ridge, the far ridge and the fjord under it, a few flakes.
  "1": "#9fb8d0",
  "2": "#b4c8da",
  "3": "#c8d6e2",
  "4": "#5f7488",
  "5": "#73889a",
  "+": "#eef2f6",
  W: "#ffffff",
  w: "#cdd3dd",
  I: lit("#5d646e", 0.4),
  i: "#5d646e",
  j: shade("#5d646e", 0.3),
  J: shade("#5d646e", 0.5),
  S: ROLES.him.skinLit,
  s: ROLES.him.skin,
  x: ROLES.him.skinShade,
  X: shade(ROLES.him.skinShade, 0.2),
  l: "#1f1a17",
  e: "#ffffff",
  v: "#f4f2ec",
  o: "#3a6a9a",
  B: "#b08a52",
  b: "#8a6a3c",
  M: "#b06a5a",
  m: "#3a2420",
  t: "#f4efe4",
  F: ROLES.him.tunicLit,
  f: ROLES.him.tunic,
  k: ROLES.him.tunicShade,
  P: "#ffffff",
  C: "#5a3d24",
  c: shade("#5a3d24", 0.35),
  y: "#d49a8a"
};

/** His head, facing right three-quarters: broader and rounder than Loki's, a steady jaw, from row 13 to 46. */
const HERO_HEAD = headRows(13, 46, 30, 14, 41, 26, 37);

function heroBackdrop(p: Pic) {
  for (let y = 0; y < FACE; y++) p.span(y, 0, FACE - 1, y < 16 ? "1" : y < 30 ? "2" : "3");
  for (const [y, ch] of [[15, "2"], [29, "3"]] as const) for (let x = y % 2; x < FACE; x += 2) p.set(x, y, ch);
  // The far ridge, low and even, and the fjord's darker line under it.
  for (let x = 0; x < FACE; x++) {
    const top = 38 + Math.round(2 * Math.sin(x * 0.17) + Math.sin(x * 0.41));
    for (let y = top; y < 46; y++) p.set(x, y, y === top ? "5" : "4");
  }
  for (const [x, y] of [[5, 8], [48, 5], [51, 22], [8, 27]]) p.set(x, y, "+");
}

function heroShoulders(p: Pic) {
  for (let y = 45; y < FACE; y++) {
    const half = Math.min(27, 12 + (y - 45) * 3);
    p.span(y, 28 - half, 28 + half, "f");
  }
  p.rim("f", "F", "k");
  // The knit: a band of white rosettes across the yoke and a row of dots under it, as his figure's sweater has.
  for (let x = 4; x < 52; x += 6) p.put(["..P..", ".PfP.", "PfPfP", ".PfP.", "..P.."], x, 47);
  for (let x = 1; x < 55; x += 2) p.set(x, 53, "P");
  // The cape over his far shoulder, its folds.
  for (let y = 45; y < FACE; y++) p.span(y, 0, Math.max(0, 10 - Math.floor((y - 45) / 2)), y % 4 ? "C" : "c");
  // The collar round his neck.
  for (let x = 21; x <= 35; x++) p.set(x, 45, "k");
}

function heroHead(p: Pic) {
  for (let y = 40; y < 46; y++) p.span(y, 23, 33, "s");
  for (let y = 42; y < 46; y++) p.span(y, 29, 33, "x");
  for (const [y, x0, x1] of HERO_HEAD) p.span(y, x0, x1, "s");
  p.rim("s", "S", "x");
  // The light on his brow and the cheek nearest it; the shade down the far side of his jaw.
  for (let y = 22; y < 27; y++) p.span(y, 18, 26, "S");
  for (let y = 30; y < 35; y++) p.span(y, 17, 22, "S");
  for (let y = 34; y < 40; y++) p.set(38 - Math.floor((y - 34) / 2), y, "x");
  // The ear, fair hair under the helmet at the back and over the ear.
  p.put([".xs", "xss", "xSs", "xXs", "xXs", "xss", ".xs"], 12, 26);
  p.put(["bBBb", "bBb.", "Bb..", "b..."], 12, 22);
  // The nose: short and straight, lit down its ridge, its tip and nostril.
  p.put(["S..", "Ss.", "Ss.", "Ss.", "SSs", "SSsx", "xllx"], 36, 27);
}

/** The helmet: an iron cap over his brow, lit on its crown, its rim with rivets, and his white wool pompom on top. */
function heroHelmet(p: Pic) {
  for (let y = 7; y < 22; y++) {
    const k = (22 - y) / 15;
    const half = Math.round(15 * Math.sqrt(Math.max(0, 1 - k * k)));
    p.span(y, 28 - half, 28 + half, "i");
  }
  p.rim("i", "I", "j");
  for (let y = 9; y < 17; y++) p.span(y, 20 - Math.floor((16 - y) / 3), 23 - Math.floor((16 - y) / 3), "I");
  // The rim band round its foot, its rivets.
  p.span(20, 12, 44, "J");
  p.span(21, 12, 44, "j");
  p.span(22, 13, 43, "J");
  for (let x = 15; x < 44; x += 5) p.set(x, 21, "I");
  // The pompom: a ball of white wool, its shade on the right and under.
  p.put(["..WWWw..", ".WWWWWw.", "WWWWWWww", "WWWWWWww", "wWWWWwww", ".wwwwww.", "..wwww.."], 24, 0);
}

function heroFeatures(p: Pic, face: HeroFace) {
  const BROWS: Record<HeroFace, [readonly string[], readonly string[]]> = {
    calm: [["bBBBb"], ["bBBBBb"]],
    surprised: [[".BBB.", "B...B"], [".BBBB.", "B....B"]],
    set: [["BB...", "bBBB.", "..BBB"], ["...BBB", ".BBBB.", "BBB..."]],
    pleased: [["..BBb", "bB..."], ["bBBB..", "....Bb"]]
  };
  const [farBrow, nearBrow] = BROWS[face];
  p.put(farBrow, 19, face === "surprised" ? 23 : 24);
  p.put(nearBrow, 29, face === "surprised" ? 23 : 24);
  const EYES: Record<HeroFace, [readonly string[], readonly string[]]> = {
    calm: [["llll", "vool", "...."], ["lllll", "vvool", "....."]],
    surprised: [[".ll.", "lvvl", "lvol", ".ll."], [".lll.", "lvvvl", "lvvol", ".lll."]],
    set: [["llll", "lool", "xxxx"], ["lllll", "lvool", "xxxxx"]],
    pleased: [["....", ".ll.", "l..l"], [".....", ".lll.", "l...l"]]
  };
  const [farEye, nearEye] = EYES[face];
  p.put(farEye, 19, 26);
  p.put(nearEye, 30, 26);
  const MOUTH: Record<HeroFace, readonly string[]> = {
    calm: [".lMMMl", "..xxx."],
    surprised: [".ll.", "lmml", "lmml", ".ll."],
    set: ["xllllx", "l....l", ".xxxx."],
    pleased: ["l....l", ".lMMl.", "..xx.."]
  };
  p.put(MOUTH[face], face === "surprised" ? 29 : 27, face === "surprised" ? 37 : 38);
  if (face === "pleased") p.put(["yyy"], 33, 33), p.put(["yy"], 18, 33);
  // Set: his jaw set, its muscle standing at the corner.
  if (face === "set") p.put(["x.", "xx", ".x"], 36, 36), p.put(["x", "x"], 21, 37);
}

/** The hero's portrait: an expression, quiet. */
export function heroPortrait(face: HeroFace): Frame {
  const p = new Pic();
  heroBackdrop(p);
  heroShoulders(p);
  heroHead(p);
  heroHelmet(p);
  heroFeatures(p, face);
  p.outline("12345+", "l");
  return frame(`the viking, ${face}`, HERO, [p.rows()]);
}

/** Every portrait, for the sheets and the tests: Loki's six at each stage, then the hero's four. */
export function allPortraits(): { who: "loki" | "hero"; face: string; stage: number; frame: Frame }[] {
  return [
    ...[0, 1, 2, 3].flatMap((stage) => LOKI_FACES.map((face) => ({ who: "loki" as const, face, stage, frame: lokiPortrait(face, stage) }))),
    ...HERO_FACES.map((face) => ({ who: "hero" as const, face, stage: 0, frame: heroPortrait(face) }))
  ];
}
