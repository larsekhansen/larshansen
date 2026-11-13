import type { Door } from "../game/doors";
import { WORLD } from "../game/level";
import type { Phase } from "@larshansen/pixelkit/oslo";
import type { Body } from "@larshansen/pixelkit/physics";
import { view } from "@larshansen/pixelkit/paint";
import type { Look } from "@larshansen/pixelkit/person";
import { FONT, bubble, drawBanner, drawHighlight, drawMarker, drawPlayer, drawSnow, fontPx, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";

// The words on the front page: sign boards over the doors, the hint, the banner and the highlight.
// The text canvas and the helpers that every scene shares live in the kit.

export interface Board {
  text: string;
  cx: number;
  y: number;
  w: number;
  post?: boolean;
}

const LIFT = { home: 13, workshop: 22, garden: 30, library: 13, opera: 14 } as const;

/** Sign boards above the doors, each as wide as its words. */
export function layoutBoards(doors: Door[], welcome: string): Board[] {
  const u = textCtx();
  u.font = `600 ${fontPx()}px ${FONT}`;
  // Even widths, so a board sits square on its post.
  const width = (s: string) => Math.ceil((u.measureText(s).width / unit() + 8) / 2) * 2;
  const boards: Board[] = doors.map((d) => ({ text: d.sign, cx: d.x + d.w / 2, y: d.bottom - d.h - LIFT[d.kind], w: width(d.sign) }));
  boards.push({ text: welcome, cx: 104, y: 118, w: width(welcome), post: true });
  return boards;
}

export interface Overlay {
  boards: Board[];
  fade: number;
  snow: { x: number; y: number; size: number }[];
  player: { body: Body; walk: number; alpha: number; phase: Phase; look?: Look };
  hint: { x: number; y: number; text: string } | null;
  bubble: { x: number; y: number; text: string } | null;
  banner: { title: string; sub: string; alpha: number } | null;
  highlight: Door | null;
  /** Where the player is walking to after a click on the street. */
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

  if (o.bubble) bubble(sx(o.bubble.x), sy(o.bubble.y) - 8, o.bubble.text);
  else if (o.hint) bubble(sx(o.hint.x), sy(o.hint.y) - 8, o.hint.text);

  if (o.banner && o.banner.alpha > 0) drawBanner(o.banner);

  if (o.marker) drawMarker(o.marker, o.steps);

  if (o.highlight) drawHighlight(o.highlight, o.steps);
}
