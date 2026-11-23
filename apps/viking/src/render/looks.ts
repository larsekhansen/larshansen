import { R as rect, view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { SHOT, windingUp, type Enemy, type Shot } from "../game/enemies";
import { FOE_INK, SHADES, drawFoe, drawFoeLook, foeFrame, foeLooks, glamFire, mark, type Looks } from "../alive/foes";
import { frame, type Frame, type Piece } from "../alive/frames";

// The enemy looks that several levels share but the first level does not: they come in a small file
// of their own with the first level that needs one (order 18 moved them out of the first script). Each
// is drawn a quarter larger than before, from the enemy palette only; the page outlines it.

const E = ENEMY;

// Rådhuset's gull on the bank and the rented scooter, drawn as frames (order 23; `src/alive/foes.ts`).
const GULL_STAND = [
  ".......WWW..",
  "......WWelW.",
  "......WWWWoo",
  ".......WWW..",
  ".WWWWWWWWW..",
  "WWWWWWWWWWw.",
  "WWWWWWWWWWw.",
  "llmmmmmmWWw.",
  "llMmmmmmWww.",
  ".ldmmmmmwww.",
  "..wwwwwwww.."
];
const GULL_LEGS = ["...p...p....", "...p...p....", "...p...p....", "...p...p....", "..pp..pp...."];
/** Its glam (order 27): shades over its eye, with its head. */
const gullShades = (dy: number) => mark(SHADES, 7, 1 + dy);
const standing = (name: string, ...more: Piece[]) => frame(name, FOE_INK, [GULL_STAND.slice(4), 0, 4], [GULL_STAND.slice(0, 4), 0, 0], [GULL_LEGS, 0, 11], gullShades(0), ...more);
/** A gull standing on the bank with a chip in its beak, flicking it at him on its beat. 12 x 16. */
const GULL_STANDING: Looks = {
  w: 12,
  h: 16,
  idle: [standing("gull on the bank"), frame("gull on the bank, looking down", FOE_INK, [GULL_STAND.slice(4), 0, 4], [GULL_STAND.slice(0, 4), 0, 1], [GULL_LEGS, 0, 11], gullShades(1))],
  move: [standing("gull on the bank")],
  // Winding up (order 19) it rears: its head up two, its wing over its back, the chip held high.
  windup: frame("gull on the bank, rearing", FOE_INK, [GULL_STAND.slice(4), 0, 4], [GULL_STAND.slice(0, 4), 0, -2], [["WWW", "WWW"], 7, 2], [["mmmmm", "MmmmM", ".mmm."], 1, 1], [["OO", "OO"], 10, -3], [GULL_LEGS, 0, 11], gullShades(-2))
};

/**
 * The e-scooter (order 38, redrawn: order 23's was an L-shaped tube, its wheels lost under its deck when squashed to the box
 * the level keeps). A hire scooter as they stand about on Oslo's pavements, riding itself: a T-bar with its grips, a stem
 * with a headlamp, down to a small front wheel, a low deck lit along its edge between the wheels, its rear end over a small
 * back wheel with a reflector. Its wheels turn by the distance it rolls: a spoke's light goes round each hub. Drawn for the box its
 * levels keep (`fit`, 18 x 13 over a box 14 x 12): its bar's top a pixel over the box's top, where he lands on it. Under the
 * glamour its frame is the acid green with a neon tube down its stem and a neon strip along its deck, and streamers hang from
 * its grips; its own colours (its natural self) are a deep petrol and graphite, no company's.
 */
const SCOOTER_FRAME = [
  "...........llMWW..",
  "..............Gg..",
  "..............Gga.",
  "..............GgW.",
  "...............Gg.",
  "...............Gg.",
  "...............Gg.",
  ".gGGGGGGGGGGGGGGg.",
  "Ogggggggggggggggd."
];
/** A small wheel, 5 across: its tyre near-black, its rim plum, its hub pale; a spoke's light goes round it as it rolls. */
const SCOOTER_WHEEL = [
  [".lll.", "lMmml", "lmamd", "lmmdl", ".lll."],
  [".lll.", "lmmMl", "lmamd", "lmmdl", ".lll."],
  [".lll.", "lmmml", "lmamM", "lmmdl", ".lll."],
  [".lll.", "lmmml", "lmamd", "lMmdl", ".lll."]
];
/** Its glam (order 27's, kept in kind): a neon strip along its deck, a neon tube down its stem, streamers off its grips. */
const SCOOTER_GLAM = [mark(["NNNNNN"], 6, 8), mark(["N", "n", "N"], 16, 4), mark(["N.", "nN", ".n"], 10, 1)];
const scooterFrame = (name: string, k: number, lamp = true) =>
  frame(name, FOE_INK, [SCOOTER_FRAME], [SCOOTER_WHEEL[k], 0, 8], [SCOOTER_WHEEL[(k + 1) % 4], 13, 8], ...(lamp ? [] : [[["l"], 16, 2] as Piece]), ...SCOOTER_GLAM);
/** A rented e-scooter riding itself: a T-bar, a stem with its lamp, a deck, two small wheels that turn. 18 x 13, drawn for its kept box. */
const SCOOTER: Looks = {
  w: 18,
  h: 13,
  fit: true,
  idle: [scooterFrame("scooter, waiting", 0), scooterFrame("scooter, its lamp off", 0, false)],
  move: [0, 1, 2, 3].map((k) => scooterFrame(`scooter, rolling ${k + 1}`, k))
};
foeLooks({ gullStanding: GULL_STANDING, scooter: SCOOTER });

// The looks every other level shares, drawn as frames (order 24; way 3, ADR 0045): a ramp to each material, lit from
// the top left, an idle of two frames, a cycle of four (walkers by the distance they cover, flyers on their own clock),
// a wind-up pose for what throws. Each keeps the size it was drawn at, so its head is where he lands on it.
const make = (name: string, ...pieces: Piece[]) => frame(name, FOE_INK, ...pieces);
const at = (rows: readonly string[], dx = 0, dy = 0): Piece => [rows, dx, dy];
/** A walker's four frames: its body down a pixel as a foot lands (frames 1 and 3), level as it passes. */
const walk = (name: string, body: (dy: number) => Piece[], legs: readonly (readonly string[])[], legsAt: number) =>
  [0, 1, 2, 1].map((k, i) => make(`${name}, walking ${i + 1}`, ...body(k === 1 ? 0 : 1), at(legs[k], 0, legsAt)));

// --- The hedgehog: 15 x 10, its snout on the right; spines lit at their tips, the face orange --------------------------
const HEDGEHOG_BODY = [
  "...M.M.M.M.....",
  "..MmMmMmMmM....",
  ".MmmdmmmdmmM...",
  "MmmmmmdmmmmmO..",
  "mmdmmmmmmdmOOO.",
  "dmmmmdmmmmOOeOO",
  "ddmdmmmmmmoOOOl",
  ".ddddmmmmdoooo.",
  "..ddddddoooo..."
];
const HEDGEHOG_LEGS = [["..pp.....pp...."], ["...pp....pp...."], ["....pp..pp....."]];
/** Its body, with its glam (order 27): its spines' tips teased up in neon, shades over its eye. */
const hedgehog = (dy: number): Piece[] => [at(HEDGEHOG_BODY, 0, dy), mark(["N.N.N.N"], 3, dy), mark(SHADES, 9, 5 + dy)];
const HEDGEHOG: Looks = {
  w: 15,
  h: 10,
  idle: [make("hedgehog, still", ...hedgehog(0), at(HEDGEHOG_LEGS[1], 0, 9)), make("hedgehog, breathing", ...hedgehog(1), at(HEDGEHOG_LEGS[1], 0, 9))],
  move: walk("hedgehog", hedgehog, HEDGEHOG_LEGS, 9)
};

// --- The fox: 16 x 12 at a trot, its snout on the right: orange lit along its back, a pale chin, belly and tail tip, black
// stockings and ear tips -------------------------------------------------------------------------------------------------
const FOX_HEAD = ["l..l..", "Oo.Oo.", "OOOOO.", "OOOeOO", "Ooaaal"];
const FOX_BODY = [
  ".OOOOOOOOO.",
  "oooooooooaa",
  "oooooooooaa",
  "ooooooooo..",
  ".oaaaaaao.."
];
const FOX_TAIL = { down: [".OO.", "OOoo", "aooo", "aao.", ".a.."], up: ["aOO.", "aOoo", ".aoo", "..o.", "...."] };
const FOX_LEGS = [
  ["....l.....l.....", "...ll......ll...", "..ll........ll.."],
  ["....ll....ll....", "....ll....ll....", "....ll....ll...."],
  ["....ll....ll....", ".....ll..ll.....", "......llll......"]
];
const foxBody = (dy: number, tail: readonly string[] = FOX_TAIL.down): Piece[] => [at(tail, 0, 3 + dy), at(FOX_BODY, 3, 4 + dy), at(FOX_HEAD, 10, dy), mark(SHADES, 10, 3 + dy)];
const FOX: Looks = {
  w: 16,
  h: 12,
  idle: [make("fox, still", ...foxBody(0), at(FOX_LEGS[1], 0, 9)), make("fox, still, its tail up", ...foxBody(0, FOX_TAIL.up), at(FOX_LEGS[1], 0, 9))],
  move: [0, 1, 2, 1].map((k, i) => make(`fox, trotting ${i + 1}`, ...foxBody(k === 1 ? 0 : 1, i % 2 ? FOX_TAIL.up : FOX_TAIL.down), at(FOX_LEGS[k], 0, 9)))
};

// --- The owl: 20 x 11, a tawny owl gliding at him, seen from the front: a round head, a pale face, dark eyes, wings that
// beat on their own clock ---------------------------------------------------------------------------------------------
const OWL_BODY = [
  ".oOOo.",
  "oOOOOo",
  "OaaaaO",
  "alelea",
  "oaaOao",
  "oOaaOo",
  "oaoaao",
  ".oaao.",
  "..oo..",
  ".a..a."
];
const OWL_WING: Record<string, readonly string[]> = {
  up: ["l......", "Ol.....", "OOo....", ".OOo...", "..OOo..", "...ooo."],
  high: [".......", ".......", "lOO....", ".lOOo..", "...ooo.", "......."],
  level: [".......", ".......", ".......", "lOOOOo.", ".lloooo", "......."],
  down: [".......", ".......", ".......", "....OOo", "..Oooo.", ".lol..."]
};
const mirror = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(""));
/** Its glam (order 27): ear tufts in neon at the corners of its head, shades across its face (a glint on each lens). */
const owl = (name: string, wing: string, dy = 0) =>
  make(name, at(OWL_WING[wing], 0, dy), at(mirror(OWL_WING[wing]), 13, dy), at(OWL_BODY, 7, 1 + dy), mark(["N....N"], 7, 1 + dy), mark(["lellel"], 7, 4 + dy));
const OWL: Looks = {
  w: 20,
  h: 11,
  idle: [owl("owl, gliding", "level"), owl("owl, gliding, lower", "level", 1)],
  move: [owl("owl, wings up", "up"), owl("owl, wings half up", "high"), owl("owl, wings out", "level"), owl("owl, wings down", "down")]
};

// --- The wasp: 14 x 9, its head on the right (order 25: one more pass, larger and plainer at real size): a banded abdomen
// pinched at its waist, its sting behind, a thorax lit on its back, a head with an eye and its jaws, legs hanging, wings a
// pale blur over its back that beat on their own clock --------------------------------------------------------------------
// Order 26 (section 3d): amber and black, not poison green: its abdomen in amber bands between black ones, shaded orange
// underneath, the black thorax with an amber mark, an amber face under a black crown.
const WASP_BODY = [
  "..YlYl...ll...",
  ".YYlYlY.lYlY..",
  "lYYlYlOllOlYea",
  ".OOlOlO..OllO.",
  "..olol...o.o.."
];
const WASP_LEGS = ["...l.l...l.l..", "..l...l..l..l."];
// Its wings in the palette's white alone (order 26: the white's shade is greenish; a grey-white comes within 2 of the snow).
const WASP_WING: Record<string, readonly string[]> = {
  up: ["...WWW...", "..WWWWW..", "..WWWWWW.", "...WWWW.."],
  high: ["WW.......", ".WWW.....", "..WWWW...", "...WWWW.."],
  level: [".........", ".........", "WWWWWWW..", ".WWWWWWW."],
  down: [".........", ".........", ".........", "........."]
};
const WASP_DOWN = [".WWWWWWW.", "..WWWW..."];
const wasp = (name: string, wing: string, dy = 0) =>
  make(name, at(WASP_BODY, 0, 3 + dy), at(WASP_LEGS, 0, 7 + dy), at(WASP_WING[wing], 3, dy), ...(wing === "down" ? [at(WASP_DOWN, 3, 6 + dy)] : []), mark(SHADES, 9, 5 + dy));
const WASP: Looks = {
  w: 14,
  h: 9,
  // Wings out or down, its body rises a pixel with the beat, so its back is where he lands on it.
  idle: [wasp("wasp, hovering", "up"), wasp("wasp, hovering, wings half up", "high")],
  move: [wasp("wasp, wings up", "up"), wasp("wasp, wings half up", "high"), wasp("wasp, wings out", "level", -1), wasp("wasp, wings down", "down", -1)]
};

// --- The squirrel: 13 x 17 sitting up, facing right, its tail a curl behind; a cone in its paws, raised to throw -------
const SQUIRREL = [
  ".OOOO........",
  "OOOaOO.......",
  "OOooOOo.l....",
  "OOo..oO.OOO..",
  "Ooo...o.OOOe.",
  "ooo...o.OOOOl",
  "ooo......oo..",
  "ooo....OOOO..",
  "ooo...OOaao..",
  ".ooo..OOaaoo.",
  ".ooo..Ooaaoo.",
  "..ooo.ooaaoo.",
  "..oooooooao..",
  "...ooooooooo.",
  "....oooooooo.",
  ".....ll.ll...",
  "....lll.lll.."
];
const CONE = ["dM", "Md", "dm"];
/** Its glam (order 27): a sweatband round its head, in neon. */
const SQUIRREL_BAND = (dy: number) => mark(["NNn"], 6, 3 + dy);
const CONE_UP = [".dd.", "dMdM", "MdMd", ".dm."];
const SQUIRREL_LOOKS: Looks = {
  w: 11,
  h: 17,
  idle: [make("squirrel, a cone in its paws", at(SQUIRREL, -2), at(CONE, 9, 9), SQUIRREL_BAND(0)), make("squirrel, nibbling", at(SQUIRREL, -2), at(["........"], 3, 3), at(SQUIRREL.slice(3, 7), -2, 4), at(CONE, 9, 8), SQUIRREL_BAND(1))],
  move: [make("squirrel, a cone in its paws", at(SQUIRREL, -2), at(CONE, 9, 9), SQUIRREL_BAND(0))],
  // Winding up (order 19): up on its toes, the cone raised high over its head.
  windup: make("squirrel, the cone raised", at(SQUIRREL, -2, -1), SQUIRREL_BAND(-1), at(["o", "O"], 11, 1), at(CONE_UP, 8, -2), at([".....ll.ll..."], -2, 15), at(["....lll.lll.."], -2, 16))
};

// --- The kid: 11 x 18, a child in winter clothes, facing right (order 27, redrawn: Lars, "make kid, sledgers more detailed
// ... Just kind of shapes now"): a knitted bobble hat (the poison green, lit at the top left) with its white bobble and a
// turned-up cuff; a face with an eye, a red cheek and a mouth; a scarf (orange, or the plum's light on the orange kid) wound
// at the neck, its end hanging; a puffy jacket (plum, or orange every other kid) in quilted bands, a zip down its front, a
// pocket; dark trousers, boots; mittens in the hat's green. Winding up, the snowball is held up behind its head in a mitten;
// just after the throw, the arm is out in front. Under the glamour its bobble is neon and a lightning bolt crosses its jacket.
const KID_TOP = [
  "....WW.....",
  "...GGGg....",
  "..GGGGgg...",
  "..wwwwwww..",
  "..aaaaela..",
  "..aaapaaa..",
  "...aaala...",
  "..SSSSSs..."
];
const KID_JACKET = [
  "..JJJJJJJ..",
  ".JjjjjljjJ.",
  ".jJJJJlJJj.",
  ".jjjjjljjk.",
  ".jkkJJlJJk.",
  ".kjjjjljjk.",
  "..kkkkkkk.."
];
const KID_LEGS = ["..dd..dd...", "..ll..ll...", ".lll..lll.."];
/** Its scarf's end hanging down its back, and its arm: down at its side (the mitten at its hip), out in front (thrown), or raised behind its head with the snowball in the mitten. */
const KID_SCARF = ["S", "s"];
const KID_ARM = { down: [["j", "j", "k", "G"], 9, 9], fwd: [["jjjG", "kkkg"], 9, 9], back: [[".WW", "WWw", "GGw", "Gg.", "j..", "j..", "k.."], -1, 2] } as const;
/** Its glam (order 27): its bobble in neon, and a lightning bolt across its jacket. */
const KID_GLAM = (dx: number, dy: number) => [mark(["NN"], 4 + dx, dy), mark(["..N", ".nN", "N.."], 3 + dx, 10 + dy)];
/** A kid's looks, and its frame just after it threw (leaning in, the arm out in front). */
const kidLooks = (jacket: Record<string, string>, name: string): Looks & { thrown: Frame } => {
  const ink = { ...FOE_INK, ...jacket };
  const k = (label: string, dy: number, arm: readonly [readonly string[], number, number], lean = 0) =>
    frame(`${name}, ${label}`, ink, at(KID_JACKET, lean, 8 + dy), at(KID_TOP, lean, dy), at(KID_SCARF, 2 + lean, 8 + dy), at(KID_LEGS, 0, 15), [arm[0], arm[1] + lean, arm[2] + dy], ...KID_GLAM(lean, dy));
  return {
    w: 11,
    h: 18,
    idle: [k("standing", 0, KID_ARM.down), k("standing, breathing", 1, KID_ARM.down)],
    move: [k("standing", 0, KID_ARM.down)],
    windup: k("a snowball raised", 0, KID_ARM.back, -1),
    thrown: k("throwing", 0, KID_ARM.fwd, 1)
  };
};
const KID = kidLooks({ J: E.plumLight, j: E.plum, k: E.plumDark, S: E.orangeLight, s: E.orange }, "kid");
const KID_ORANGE = kidLooks({ J: E.orangeLight, j: E.orange, k: E.plumDark, S: E.plumLight, s: E.plum }, "kid");

// --- The grill: 15 x 15, a fire basket on three legs, coals glowing, flames over the rim on its own clock ----------------
const GRILL_BASE = [
  "MMMMMMMMMMMMMMM",
  "dlmlmlmlmlmlmld",
  ".mOmoOmoOmoOmd.",
  ".mmmmmmmmmmmmd.",
  "..dmmmmmmmmdd..",
  "...ddddddddd...",
  "..l....l....l..",
  "..l....l....l..",
  ".l.....l.....l.",
  ".l.....l.....l."
];
const GRILL_FLAMES = [
  ["......a........", "....O..Oa......", "...OaO.OOO..O..", "..OOoOOOoOOOO.."],
  ["........a......", "...aO...O......", "..OOO.OaOO.O...", "..oOOOoOOOoOO.."],
  [".....a.........", "......OaO......", "..O.OOOOOOa.O..", ".OOoOOOoOOOOo.."],
  [".........a.....", "..a.O..O.......", "..OOOOaO.OO....", "..OOoOOoOOOoO.."]
];
/** Under the glamour (order 27) its flames and its coals burn magenta with lime tongues and tips; its natural self an ordinary orange. */
const grillFrame = (f: readonly string[], k: number) => make(`grill, flames ${k + 1}`, at(glamFire(f)), at(GRILL_BASE, 0, 4), at(glamFire([GRILL_BASE[2]]), 0, 6), ...(k % 2 ? [at(["L"], 4 + k, 6)] : []));
const GRILL: Looks = {
  w: 15,
  h: 15,
  idle: GRILL_FLAMES.map(grillFrame),
  move: GRILL_FLAMES.map(grillFrame),
  rate: 5
};

// --- The duck: a mallard drake waddling (order 24's, drawn for Akerselva; the lake's since order 25), 13 x 10, its bill on
// the right: a green head lit at its crown, a white ring, a plum breast, a pale grey-white body shaded under its wing, a
// black tail with its curl, orange feet that go by turns ------------------------------------------------------------------
const DUCK_HEAD = ["..GG..", ".gGGG.", ".gGeGOO", ".ggGgOa"].map((r) => r.padEnd(7, "."));
const DUCK_BODY = [
  "l.......WW...",
  "l.WWWWWWmMM..",
  "lWWWwWWWmmM..",
  ".lwwwwwwmm...",
  "..wwwwwwww..."
];
const DUCK_FEET = [["...oo...oo...."], ["....oo..oo...."], [".....oooo....."], ["..oo....oo...."]];
const duckFrame = (name: string, feet: number, nod: number, dy = 0) => make(name, at(DUCK_BODY, 0, 4 + dy), at(DUCK_HEAD, 7, nod + dy), at(DUCK_FEET[feet], 0, 9), mark(SHADES, 8, 2 + nod + dy));
const DUCK: Looks = {
  w: 13,
  h: 10,
  idle: [duckFrame("duck, still", 1, 0), duckFrame("duck, dabbing its head", 1, 1)],
  // Waddling: the head forward and down a pixel as each foot lands.
  move: [duckFrame("duck, waddling 1", 0, 1, 1), duckFrame("duck, waddling 2", 2, 0), duckFrame("duck, waddling 3", 3, 1, 1), duckFrame("duck, waddling 4", 2, 0)]
};

foeLooks({ hedgehog: HEDGEHOG, fox: FOX, owl: OWL, wasp: WASP, squirrel: SQUIRREL_LOOKS, grill: GRILL, kid: KID, duck: DUCK });

/** The kid's frame: its jacket by which kid it is, its arm forward just after it threw. */
function kid(e: Enemy, t: number) {
  const l = e.def.c % 2 ? KID_ORANGE : KID;
  drawFoe(e, t - e.thrownAt < 10 && !windingUp(e, t) ? l.thrown : foeFrame(e, t, l), l.w, l.h);
}

/** One of the looks in this file, and says so; false for any other. */
export function drawLook(e: Enemy, t: number): boolean {
  const look = e.def.look;
  if (look === "gull" && e.def.kind !== "thrower") return false;
  if (look === "kid") {
    kid(e, t);
    return true;
  }
  // The grill's fire is the glamour's: after dark it glows in its own neon (`glows`), not a lamp's warm light (order 32, ADR 0054).
  return drawFoeLook(e, t);
}

// What these looks throw, as frames (order 24): a chip, a cone, a snowball, each turning over in flight (two frames by
// its own clock), in the shot's box.
const CHIP = [make("chip", at(["..OOO.", ".OOoOa", "OOo...", "Oo...."], 0, 1)), make("chip, turning", at(["OO....", "OOo...", ".oOOO.", "..oOOa"], 0, 1))];
const CONE_SHOT = [make("cone", at([".dMd.", "dMdMd", "MdMdm", "dMdmd", ".dmd.", "..l.."], 0, 0)), make("cone, turning", at(["..l...", ".dMdM.", "dMdMdd", ".mdMdM", "..dmd."], 0, 0))];
const SNOWBALL = [make("snowball", at([".aWW.", "aWWWw", "WWWww", "Wwwww", ".www."], 0, 0)), make("snowball, turning", at([".WWa.", "WWWWa", "wWWWW", "wwwWW", ".ww.."], 0, 0))];
const SHOTS: Record<string, Frame[]> = { gull: CHIP, squirrel: CONE_SHOT, kid: SNOWBALL };

/** What these looks throw: a gull's chip, a squirrel's cone, a kid's snowball. False for any other. */
export function drawLookShot(s: Shot, look?: string): boolean {
  const fs = look ? SHOTS[look] : undefined;
  if (!fs) return false;
  const f = fs[view.reduced ? 0 : Math.floor((s.x + s.y) / 6) & 1];
  const x = Math.round(s.x - SHOT.w / 2);
  const y = Math.round(s.y - SHOT.h / 2);
  for (let i = 0; i < f.runs.length; i += 4) rect(x + f.runs[i], y + f.runs[i + 1], f.runs[i + 2], 1, f.ink[f.runs[i + 3]]);
  return true;
}
