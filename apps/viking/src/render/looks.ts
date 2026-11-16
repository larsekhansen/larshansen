import { R as rect, light, view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { SHOT, windingUp, type Enemy, type Shot } from "../game/enemies";
import { parts, stride } from "../alive/parts";
import { FOE_INK, drawFoeLook, foeLooks, type Looks } from "../alive/foes";
import { frame, type Piece } from "../alive/frames";

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
const standing = (name: string, ...more: Piece[]) => frame(name, FOE_INK, [GULL_STAND.slice(4), 0, 4], [GULL_STAND.slice(0, 4), 0, 0], [GULL_LEGS, 0, 11], ...more);
/** A gull standing on the bank with a chip in its beak, flicking it at him on its beat. 12 x 16. */
const GULL_STANDING: Looks = {
  w: 12,
  h: 16,
  idle: [standing("gull on the bank"), frame("gull on the bank, looking down", FOE_INK, [GULL_STAND.slice(4), 0, 4], [GULL_STAND.slice(0, 4), 0, 1], [GULL_LEGS, 0, 11])],
  move: [standing("gull on the bank")],
  // Winding up (order 19) it rears: its head up two, its wing over its back, the chip held high.
  windup: frame("gull on the bank, rearing", FOE_INK, [GULL_STAND.slice(4), 0, 4], [GULL_STAND.slice(0, 4), 0, -2], [["WWW", "WWW"], 7, 2], [["mmmmm", "MmmmM", ".mmm."], 1, 1], [["OO", "OO"], 10, -3], [GULL_LEGS, 0, 11])
};

const SCOOTER_TOP = [
  "............mmmmm.",
  "..............gG..",
  "..............gG..",
  "..............gGe.",
  "..............gG..",
  "..............gG..",
  "..............gG..",
  "..............gG..",
  "..............gG..",
  "..............gG..",
  "..ggggggggggggggG.",
  "..GGGGGGGGGGGGG..."
];
const WHEEL = [["Mmmm", "mppm", "mmmm"], ["mmmM", "mppm", "mmmm"], ["mmmm", "mppm", "mmmM"], ["mmmm", "mppm", "Mmmm"]];
const scooterFrame = (name: string, k: number, lamp = true) => frame(name, FOE_INK, [SCOOTER_TOP], [WHEEL[k], 1, 12], [WHEEL[k], 14, 12], ...(lamp ? [] : [[["G"], 16, 3] as Piece]));
/** A rented e-scooter riding itself: deck, stem, bars, two wheels that turn, a lamp. 18 x 15. */
const SCOOTER: Looks = {
  w: 18,
  h: 15,
  idle: [scooterFrame("scooter, waiting", 0), scooterFrame("scooter, its lamp off", 0, false)],
  move: [0, 1, 2, 3].map((k) => scooterFrame(`scooter, rolling ${k + 1}`, k))
};
foeLooks({ gullStanding: GULL_STANDING, scooter: SCOOTER });

/** A hedgehog: a red back of spines over an orange body, a pointed snout. 15 x 10. */
function hedgehog(e: Enemy) {
  const r = parts(e, 15);
  const s = stride(e);
  r(1, -6, 11, 5, E.orange);
  for (let i = 0; i < 12; i += 2) r(i, -10 + (i % 4 ? 1 : 0), 2, 4, E.plum);
  r(11, -5, 3, 3, E.orangeLight);
  r(14, -4, 1, 1, E.plum);
  r(12, -5, 1, 1, E.eye);
  r(3 + s, -1, 2, 1, E.plum);
  r(8 - s, -1, 2, 1, E.plum);
}

/** A fire basket on three legs, coals glowing, flames over the rim. 15 x 15. */
function grill(e: Enemy, t: number) {
  const r = parts(e, 15);
  r(1, -9, 13, 5, E.plum);
  r(0, -10, 15, 1, E.pink);
  for (const lx of [2, 7, 12]) r(lx, -4, 1, 4, E.plum);
  const flick = view.reduced ? 0 : Math.floor(t / 5) % 3;
  r(2, -11, 11, 1, E.orange);
  r(3 + flick, -14, 3, 3, E.orange);
  r(9 - flick, -15, 2, 4, E.orangeLight);
  r(6, -13, 2, 2, E.orangeLight);
  light(Math.round(e.x - 5), Math.round(e.y) - 15, 10, 5, "soft");
}

/** A kid in a bobble hat and a puffy jacket, a snowball raised behind while it winds up. 11 x 17. */
function kid(e: Enemy, t: number) {
  const r = parts(e, 11);
  const up = windingUp(e, t);
  const thrown = t - e.thrownAt < 10;
  const jacket = e.def.c % 2 ? E.pink : E.plum;
  r(3, -17, 6, 3, E.poison);
  r(5, -18, 2, 1, E.poisonLight);
  r(3, -14, 6, 4, E.orangeLight);
  r(7, -13, 1, 1, E.eye);
  r(2, -10, 8, 7, jacket);
  r(2, -3, 3, 3, E.plum);
  r(7, -3, 3, 3, E.plum);
  // The arm: down, raised behind with a snowball while it winds up, forward as it throws.
  if (up) {
    r(0, -16, 2, 6, jacket);
    r(-1, -19, 4, 4, E.pink);
  } else if (thrown) r(10, -11, 4, 2, jacket);
  else r(9, -9, 2, 5, jacket);
}

/** A wasp: acid bands, wings a blur over it, a sting behind. 12 x 8. */
function wasp(e: Enemy, t: number) {
  const r = parts(e, 12);
  const buzz = view.reduced ? 0 : Math.floor(t / 2) % 2;
  r(2, -5, 8, 4, E.poisonLight);
  r(4, -5, 1, 4, E.poison);
  r(7, -5, 1, 4, E.poison);
  r(10, -5, 2, 3, E.poison);
  r(11, -5, 1, 1, E.eye);
  r(0, -3, 2, 1, E.line);
  r(3, -8 - buzz, 3, 2, E.plumLight);
  r(6, -8 + buzz - 1, 3, 2, E.plumLight);
}

/** A fox at a trot: a long body, a pale-tipped brush, pointed ears, a light chin. 16 x 12. */
function fox(e: Enemy) {
  const r = parts(e, 16);
  const s = stride(e);
  r(3, -8, 10, 5, E.orange);
  r(11, -10, 4, 5, E.orange);
  r(14, -8, 2, 2, E.orange);
  r(13, -9, 1, 1, E.eye);
  r(11, -12, 1, 2, E.line);
  r(14, -12, 1, 2, E.line);
  r(12, -6, 3, 1, E.orangeLight);
  r(0, -9, 4, 3, E.orange);
  r(-1, -9, 1, 3, E.orangeLight);
  r(4 + s, -3, 1, 3, E.line);
  r(11 - s, -3, 1, 3, E.line);
}

/** A tawny owl gliding: a round head, a light face, wide soft wings. 20 x 11. */
function owl(e: Enemy, t: number) {
  const r = parts(e, 20);
  const up = view.reduced ? 0 : Math.floor(t / 9) % 2;
  r(6, -9, 8, 7, E.orange);
  r(7, -9, 6, 3, E.orangeLight);
  r(8, -11, 4, 2, E.orange);
  r(8, -8, 1, 1, E.eye);
  r(11, -8, 1, 1, E.eye);
  r(9, -6, 2, 1, E.pale);
  if (up) {
    r(0, -9, 6, 3, E.orange);
    r(14, -9, 6, 3, E.orange);
  } else {
    r(0, -5, 6, 3, E.orange);
    r(14, -5, 6, 3, E.orange);
  }
}

/** A red squirrel sitting up, its tail a curl behind, a cone held up to throw. 11 x 17. */
function squirrel(e: Enemy, t: number) {
  const r = parts(e, 11);
  const up = windingUp(e, t);
  r(3, -10, 5, 8, E.orange);
  r(5, -9, 2, 5, E.orangeLight);
  r(5, -14, 4, 4, E.orange);
  r(6, -15, 1, 1, E.orange);
  r(8, -13, 1, 1, E.eye);
  r(-1, -15, 4, 12, E.orange);
  r(-2, -17, 4, 4, E.orangeLight);
  r(3, -2, 2, 2, E.plum);
  r(6, -2, 2, 2, E.plum);
  if (up) r(8, -18, 4, 4, E.plum);
  else r(8, -9, 2, 3, E.plum);
}

/** One of the looks in this file, and says so; false for any other. */
export function drawLook(e: Enemy, t: number): boolean {
  switch (e.def.look) {
    case "gull":
      if (e.def.kind !== "thrower") return false;
      return drawFoeLook(e, t);
    case "scooter":
      return drawFoeLook(e, t);
    case "hedgehog":
      hedgehog(e);
      return true;
    case "grill":
      grill(e, t);
      return true;
    case "kid":
      kid(e, t);
      return true;
    case "wasp":
      wasp(e, t);
      return true;
    case "fox":
      fox(e);
      return true;
    case "owl":
      owl(e, t);
      return true;
    case "squirrel":
      squirrel(e, t);
      return true;
  }
  return false;
}

/** What these looks throw: a gull's chip, a squirrel's cone. False for any other (a snowball is the page's). */
export function drawLookShot(s: Shot, look?: string): boolean {
  const x = Math.round(s.x - SHOT.w / 2);
  const y = Math.round(s.y - SHOT.h / 2);
  const R = (dx: number, dy: number, w: number, h: number, c: string) => rect(x + dx, y + dy, w, h, c);
  if (look === "gull") {
    R(1, 1, 5, 2, E.orangeLight);
    R(0, 2, 2, 3, E.orangeLight);
    R(4, 1, 1, 1, E.orange);
    return true;
  }
  if (look === "squirrel") {
    R(1, 0, 4, 6, E.plum);
    R(0, 1, 6, 4, E.plum);
    for (const [dx, dy] of [[1, 1], [3, 2], [1, 3], [4, 4]]) R(dx, dy, 1, 1, E.plumLight);
    return true;
  }
  return false;
}
