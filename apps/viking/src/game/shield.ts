import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { R, ctx, mix, view } from "@larshansen/pixelkit/paint";
import { INK, METAL, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import type { Body } from "@larshansen/pixelkit/physics";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { Enemy, Shot } from "./enemies";
import type { PlayIntent, ShieldRules, ShieldState } from "./play";

// The shield, from the longship at Bygdøy (ADR 0024): a held stance, not a parry. Holding down on the
// ground raises it, facing the way he faces; it takes six steps to come up and stays up as long as
// down is held. While it is up (and while it comes up) he cannot walk or jump (a jump pressed then is kept
// a tenth of a second, and made as down is let go); he can turn, and then it comes up again the other way. Up, it stops what is thrown at its face (the thing falls, harmless)
// and holds off an enemy or a boss that runs into it: pushed back a tile, and no harm to him. It does
// not stop a fall, nor anything from above or below, nor anything from behind.
//
// These are the rules and the drawing, in a file of their own that the page fetches when he has the
// shield or goes to a level that gives it: play.ts runs them through `Play.shield`.

/** Steps from the press of down to the shield being up. */
export const RAISE = 6;
/** Its face, in front of him: this wide, from this far above his head down to his feet. */
export const FACE = { w: 5, over: 5 };
/** Slower than this across, a thrown thing is coming down from above, and the shield does not stop it. */
export const FROM_ABOVE = 0.3;

export const shieldUp = (s: ShieldState) => s.has && s.raise >= RAISE;

/** Its face as a box, while it is up (or coming up). */
export function shieldFace(s: ShieldState, b: Body) {
  return { x: s.facing > 0 ? b.x + PLAYER.w : b.x - FACE.w, y: b.y - FACE.over, w: FACE.w, h: PLAYER.h + FACE.over };
}

const touches = (a: { x: number; y: number; w: number; h: number }, c: { x: number; y: number; w: number; h: number }) => a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;

/** Steps a jump pressed while the shield is up is kept: let go of down within them, and he jumps. */
export const JUMP_KEPT = 6;

/** One step of the shield, before his body moves: down on the ground raises it. The keys he is left with. */
function step(s: ShieldState, b: Body, intent: PlayIntent): PlayIntent {
  if (!s.has || !intent.shield || !b.onGround) {
    // A jump pressed a moment before down was let go is not lost (order 17): he jumps now.
    const kept = s.raise > 0 && (s.jump ?? 0) > 0 && intent.jumpHeld && b.onGround;
    s.raise = 0;
    s.jump = 0;
    return kept ? { ...intent, jumpPressed: true } : intent;
  }
  s.jump = intent.jumpPressed ? JUMP_KEPT : Math.max(0, (s.jump ?? 0) - 1);
  const turn = intent.left ? -1 : intent.right ? 1 : 0;
  if (s.raise === 0) s.facing = b.facing;
  // A turn while it is up brings it round: up again the other way, from the start.
  if (turn && turn !== s.facing) {
    s.facing = turn as 1 | -1;
    s.raise = 0;
  }
  b.facing = s.facing;
  s.raise = Math.min(RAISE, s.raise + 1);
  return { ...intent, left: false, right: false, jumpHeld: false, jumpPressed: false, dash: false };
}

/**
 * A thrown thing that reaches it, coming at him from in front: held up and tilted, the shield covers
 * his front and his head. Not one that drops on him from above (hardly moving across), nor one from
 * behind (moving the way he faces, or already past his back).
 */
function stops(s: ShieldState, b: Body, shot: Shot, box: { x: number; y: number; w: number; h: number }): boolean {
  if (!shieldUp(s)) return false;
  const back = b.x + PLAYER.w / 2 - (s.facing * PLAYER.w) / 2;
  const coming = shot.vx * s.facing <= -FROM_ABOVE && (shot.x - back) * s.facing > 0;
  const body = { x: b.x, y: b.y, w: PLAYER.w, h: PLAYER.h };
  return coming && (touches(shieldFace(s, b), box) || touches(body, box));
}

/** Something that runs into him from in front at his own height (not from above, not from below). */
function holds(s: ShieldState, b: Body, fromX: number, box: { y: number; h: number } | null, from?: "above" | "below"): boolean {
  if (!shieldUp(s) || from) return false;
  if ((fromX - (b.x + PLAYER.w / 2)) * s.facing <= 0) return false;
  // Over his head, or under his feet, it is not at the shield's height.
  return !box || (box.y + box.h > b.y + 3 && box.y < b.y + PLAYER.h - 1);
}

/** Pushes an enemy that ran into the shield back a tile, along its ground (not off it, not through a wall), and turns it away. */
function shove(e: Enemy, map: TileMap, dir: 1 | -1) {
  e.dir = dir;
  if (e.def.kind === "flyer") {
    e.x += dir * TILE;
    return;
  }
  if (e.def.kind !== "walker" && e.def.kind !== "spiky") return;
  for (let k = 0; k < TILE; k++) {
    const ahead = e.x + dir * (e.w / 2 + 1);
    const c = Math.floor(ahead / TILE);
    const r = Math.round(e.y / TILE);
    const ramp = map.rampAt(ahead);
    const ground = (ramp !== null && Math.abs(ramp - e.y) <= 8) || map.isSolid(c, r) || map.isOneWay(c, r);
    if (map.isSolid(c, Math.floor((e.y - 1) / TILE)) || !ground) break;
    e.x += dir;
    if (ramp !== null && Math.abs(ramp - e.y) <= 8) e.y = ramp;
  }
}

export const SHIELD_RULES: ShieldRules = { step, stops, holds, shove };

// --- The drawing ------------------------------------------------------------------------------------

/**
 * How far up it is drawn, 0 (at his side) to 1 (up): it rises over the six steps; with reduced motion
 * it is drawn down until it is up, and then up, so it is shown up exactly when it protects.
 */
export function shieldDrawn(raise: number, reduced: boolean): number {
  if (reduced) return raise >= RAISE ? 1 : 0;
  return Math.min(1, raise / RAISE);
}

/** The round shield's paint: red and cream boards, an iron rim, an iron boss in the middle. */
const RED = PALETTE.sailStripe;
const CREAM = PALETTE.sail;
/** Its ramps (order 24; way 3, ADR 0045): each board lit at the top left and shaded to the bottom right, the rim's iron lit where the light falls on it, the boss with a glint. */
const INK_OF: Record<string, string> = { R: mix(RED, WHITE, 0.25), r: RED, q: mix(RED, INK, 0.3), C: mix(CREAM, WHITE, 0.3), c: CREAM, k: mix(CREAM, INK, 0.25), i: PALETTE.ironDark, I: mix(PALETTE.ironDark, WHITE, 0.4), j: mix(PALETTE.ironDark, INK, 0.3), b: METAL.lampPost, B: mix(PALETTE.iron, WHITE, 0.5) };
/** The shield seen face on, `size` across, as a map of letters: drawn once, copied after. */
function faceMap(size: number): string[] {
  const r = size / 2;
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - r;
      const dy = y + 0.5 - r;
      const d = Math.hypot(dx, dy);
      const toward = -(dx + dy) / r;
      if (d > r) row += ".";
      else if (d > r - 1.2) row += toward > 0.5 ? "I" : toward < -0.5 ? "j" : "i";
      else if (d < (size > 8 ? 1.5 : 1)) row += toward > 0 ? "B" : "b";
      else {
        const board = Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 2)) % 2 === 0;
        const tone = toward > 0.45 ? 2 : toward < -0.45 ? 0 : 1;
        row += board ? "qrR"[tone] : "kcC"[tone];
      }
    }
    rows.push(row);
  }
  return rows;
}
const FACES = new Map<number, HTMLCanvasElement>();
/** The shield seen face on, 12 across: leaning at the longship's prow, or hung on his back. `x, y`: its top left. */
export function drawShieldFace(x: number, y: number, size = 12) {
  if (typeof document !== "undefined") {
    let c = FACES.get(size);
    if (!c) {
      c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      faceMap(size).forEach((row, yy) => [...row].forEach((ch, xx) => ch !== "." && ((g.fillStyle = INK_OF[ch]), g.fillRect(xx, yy, 1, 1))));
      FACES.set(size, c);
    }
    ctx().drawImage(c, Math.round(x) - view.camX, Math.round(y) - view.camY);
    return;
  }
  faceMap(size).forEach((row, yy) => [...row].forEach((ch, xx) => ch !== "." && R(x + xx, y + yy, 1, 1, INK_OF[ch])));
}

/**
 * The shield on him: on his back while he walks; in front of him, edge on and tilted up, while he
 * raises it. `b` is where he is drawn, `facing` the way he faces, `up` from `shieldDrawn`.
 */
export function drawShieldOn(b: { x: number; y: number }, facing: 1 | -1, up: number, sitting: boolean) {
  const x0 = Math.round(b.x);
  const y0 = Math.round(b.y) + (sitting ? 3 : 0);
  if (up <= 0) {
    // On his back: a disc seen at a slant, behind his shoulder.
    const x = facing > 0 ? x0 - 4 : x0 + PLAYER.w - 4;
    drawShieldFace(x, y0 + 2, 8);
    return;
  }
  // Held up in front: the face seen edge on, five pixels thick, its top tilting out as it comes up; its boards lit at
  // the top and shaded toward his feet, the rim's iron on its outer side lit along its upper half.
  const h = Math.round(9 + 9 * up);
  const top = y0 + PLAYER.h - h + 1;
  const x = facing > 0 ? x0 + PLAYER.w - 1 : x0 - 4;
  for (let i = 0; i < h; i++) {
    const out = Math.round((1 - i / h) * 2 * up);
    const xx = x + facing * out;
    const band = Math.floor((i / h) * 4) % 2 === 0;
    const tone = i < h * 0.3 ? 2 : i > h * 0.75 ? 0 : 1;
    const face = band ? "qrR"[tone] : "kcC"[tone];
    R(xx, top + i, 5, 1, INK_OF[face]);
    R(facing > 0 ? xx + 4 : xx, top + i, 1, 1, INK_OF[i < h / 2 ? "I" : "i"]);
    R(facing > 0 ? xx : xx + 4, top + i, 1, 1, INK_OF[band ? "q" : "k"]);
  }
  // The iron boss, in the middle of its face, its glint on the side the light comes from.
  const mid = top + Math.floor(h / 2);
  const bx = facing > 0 ? x + 4 + Math.round(up) : x - 1 - Math.round(up);
  R(bx, mid - 1, 2, 3, METAL.lampPost);
  R(bx, mid - 1, 1, 1, INK_OF.B);
  // A glint along its rim once it is up.
  if (up >= 1 && !view.reduced) R(facing > 0 ? x + 4 : x, top + 1, 1, 3, mix(PALETTE.iron, WHITE, 0.5));
}

/**
 * The shield's words (and the sledge's, where its key ducks), in both languages: they come with the shield,
 * so the first script does not carry them (order 18 made room there).
 */
export const SHIELD_WORDS = {
  nb: {
    help: " Hold pil ned for skjoldet.",
    /** On the sledge he cannot walk or dash, and down ducks. */
    helpSledge: "På kjelken: mellomrom eller pil opp for å hoppe, pil ned for å dukke. R starter banen på nytt.",
    /** The touch pad's shield button, and the moment he is given the shield. */
    shield: "Skjold",
    /** The same button on the sledge, where down ducks. */
    duck: "Dukk",
    given: ["Skjoldet er ditt.", "Hold pil ned for å løfte det."],
    givenTouch: ["Skjoldet er ditt.", "Hold Skjold-knappen for å løfte det."]
  },
  en: {
    help: " Hold down for the shield.",
    helpSledge: "On the sledge: Space or up to jump, down to duck. R starts the level again.",
    shield: "Shield",
    duck: "Duck",
    given: ["The shield is yours.", "Hold down to raise it."],
    givenTouch: ["The shield is yours.", "Hold the Shield button to raise it."]
  }
};
