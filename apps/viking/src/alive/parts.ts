import { R } from "@larshansen/pixelkit/paint";
import { KIND, sizeOf, type Enemy } from "../game/enemies";

// How every enemy look is drawn (order 18), and its frames (order 23, section 1). A look is its own rectangles,
// `parts`, from its feet; this gives every look the frames the order asks of it without each level drawing them again:
//
//   moving   a cycle of four by the distance it covers, three pixels a frame (its legs by `stride`: apart, together,
//            apart the other way, together), its body down a pixel as a foot lands and up a pixel as it passes, its legs
//            stretched to meet it; a flyer rises and falls a pixel on the air at half its wing beat, so its two wing
//            poses are four frames; a jumper stretches as it rises and is squashed as it falls
//   still    a breath: its body down a pixel every other second, on its own clock (stone does not breathe: a statue he
//            watches, a guard still a statue)
//
// What reaches its feet (legs, wheels, a base) stays on the ground. Reduced motion keeps all of it: it is how a player
// reads what a thing is doing. The looks drawn as frames (`foes.ts`) have frames of their own and draw with no bob.

/** The clock the frames run on: the level's, set by the page before it draws what moves. */
export const clock = { t: 0 };
/** For the census (the tests and the sheets): every look drawn still, or moving, whatever the rules say; null: as they say. */
export const forced: { state: "idle" | "move" | null } = { state: null };

/** Whether an enemy moves by itself just now: a flyer always; a jumper in the air; a walker with a speed, unless it is calm. */
export function moving(e: Enemy): boolean {
  if (forced.state) return forced.state === "move";
  const kind = e.def.kind;
  if (kind === "flyer") return true;
  if (kind === "jumper") return e.y !== e.prevY;
  return (e.def.speed ?? KIND[kind].speed) > 0 && !e.calm;
}

/** Its frame in a cycle of four, by the distance it has covered (three pixels a frame, so its feet hold). */
export const step4 = (e: Enemy) => ((Math.floor((e.dir > 0 ? e.x : -e.x) / 3) % 4) + 4) % 4;

/** Its legs in the cycle: apart one way (1), together (0), apart the other way (-1), together. */
export const stride = (e: Enemy) => [1, 0, -1, 0][step4(e)];

/** How far its body is moved down (positive) or up in the frame it shows now. */
export function bobOf(e: Enemy): number {
  const own = clock.t + (e.def.offset ?? 0);
  if (e.def.kind === "flyer" && moving(e)) return Math.floor(own / 14) % 2;
  if (e.def.kind === "jumper" && moving(e)) return e.y < e.prevY ? -1 : e.y > e.prevY ? 1 : 0;
  if (moving(e)) return [1, 0, 1, -1][step4(e)];
  return e.calm && STONE.has(e.def.look) ? 0 : Math.floor(own / 60) % 2;
}
const STONE = new Set(["statue", "bronze", "guard"]);

/**
 * A look's own rectangles, `W` pixels wide: `dx` from its back (its left while it faces right), mirrored
 * when it faces left; `dy` from its feet (up is negative). Every look is drawn this way (order 18), with the
 * frame it shows now (order 23); `still` draws it with no bob (a look that has frames of its own).
 */
export function parts(e: Enemy, W: number, still = false) {
  const x = Math.round(e.x - W / 2);
  const y = Math.round(e.y);
  const right = e.dir > 0;
  // One that keeps its old box (`small`) is drawn as wide, but to the box's height: each row moved down
  // in proportion, none lost, so its head is where he lands on it.
  const k = e.def.small ? e.h / sizeOf({ ...e.def, small: false }).h : 1;
  const bob = still || !e.alive ? 0 : bobOf(e);
  const flyer = e.def.kind === "flyer";
  return (dx: number, dy: number, w: number, h: number, c: string) => {
    let top = Math.round(dy * k);
    let bottom = Math.round((dy + h) * k);
    if (flyer || dy + h < 0) {
      top += bob;
      bottom += bob;
    } else if (bob < 0) top += bob;
    R(right ? x + dx : x + W - dx - w, y + top, w, Math.max(1, bottom - top), c);
  };
}
