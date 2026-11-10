import type { Door } from "../game/doors";
import { WORLD, type SignSpot } from "../game/level";
import type { Phase } from "@larshansen/pixelkit/oslo";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Look } from "@larshansen/pixelkit/person";
import { view } from "@larshansen/pixelkit/paint";
import { FONT, bubble, drawBanner, drawHighlight, drawMarker, drawPlayer, drawSnow, fontPx, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";

// The words in Vikingfjorden: sign boards over the doors and on posts, speech bubbles, the place
// banner, and the person. The same furniture as the front page, drawn by the same kit helpers.

export interface Board {
  text: string;
  cx: number;
  y: number;
  w: number;
  /** A sign post: the board stands on a post down to the ground. */
  post?: { bottom: number };
}

/** How far above a door its board hangs. */
const LIFT = 13;
/** How high a post's board stands above the ground. */
const POST_HEIGHT = 30;

/** Sign boards above the doors and on the sign posts, each as wide as its words. */
export function layoutBoards(doors: Door[], signs: (SignSpot & { label: string })[]): Board[] {
  const u = textCtx();
  u.font = `600 ${fontPx()}px ${FONT}`;
  // Even widths, so a board sits square on its post.
  const width = (s: string) => Math.ceil((u.measureText(s).width / unit() + 8) / 2) * 2;
  const boards: Board[] = doors.map((d) => ({ text: d.sign, cx: d.x + d.w / 2, y: d.bottom - d.h - LIFT, w: width(d.sign) }));
  for (const s of signs) boards.push({ text: s.label, cx: s.x, y: s.bottom - POST_HEIGHT, w: width(s.label), post: { bottom: s.bottom } });
  return boards;
}

export interface Overlay {
  boards: Board[];
  fade: number;
  snow: { x: number; y: number; size: number }[];
  player: { body: Body; walk: number; alpha: number; phase: Phase; look: Look };
  hint: { x: number; y: number; text: string } | null;
  /** Lines in a speech bubble, the first line on top. */
  bubble: { x: number; y: number; lines: string[]; align?: "left" } | null;
  banner: { title: string; sub: string; alpha: number } | null;
  highlight: Door | null;
  /** Where the player is walking to after a click. */
  marker: { x: number; y: number } | null;
  steps: number;
}

export function drawText(o: Overlay) {
  const u = textCtx();
  u.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  u.clearRect(0, 0, view.cssW, view.cssH);
  u.textAlign = "center";
  u.textBaseline = "middle";

  u.font = `600 ${fontPx()}px ${FONT}`;
  u.fillStyle = "#fff4dc";
  for (const b of o.boards) u.fillText(b.text, sx(b.cx), sy(b.y + 5) + 0.5);

  // Going through a door fades everything behind the player to black.
  if (o.fade > 0) {
    u.fillStyle = `rgba(5, 5, 12, ${o.fade.toFixed(3)})`;
    u.fillRect(0, 0, view.cssW, view.cssH);
  }

  drawPlayer(WORLD, o.player.body, o.player.walk, o.player.alpha, o.player.phase, o.player.look);

  if (o.snow.length) drawSnow(o.snow);

  if (o.bubble) {
    // Stacked from the bottom up, so the lines read top to bottom.
    const h = Math.max(24, fontPx() + 12) + 4;
    const last = o.bubble.lines.length - 1;
    o.bubble.lines.forEach((line, i) => bubble(sx(o.bubble!.x), sy(o.bubble!.y) - 8 - (last - i) * h, line, o.bubble!.align));
  } else if (o.hint) bubble(sx(o.hint.x), sy(o.hint.y) - 8, o.hint.text);

  if (o.banner && o.banner.alpha > 0) drawBanner(o.banner);
  if (o.marker) drawMarker(o.marker, o.steps);
  if (o.highlight) drawHighlight(o.highlight, o.steps);
}

