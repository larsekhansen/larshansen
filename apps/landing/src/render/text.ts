import type { Door } from "../game/doors";
import { view } from "./paint";

// Words are drawn at full screen resolution on top of the pixel art, so they stay sharp.

let u: CanvasRenderingContext2D;
export function textTarget(ctx: CanvasRenderingContext2D) {
  u = ctx;
}

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Screen pixels per art pixel. */
const unit = () => view.k / view.dpr;
const fontPx = () => Math.max(11, Math.round(4.3 * unit()));
const sx = (wx: number) => (wx - view.camX) * unit();
const sy = (wy: number) => (wy - view.camY) * unit();

export interface Board {
  text: string;
  cx: number;
  y: number;
  w: number;
  post?: boolean;
}

const LIFT = { home: 13, garden: 30, basar: 14, library: 13, opera: 14 } as const;

/** Sign boards above the doors, each as wide as its words. */
export function layoutBoards(doors: Door[], welcome: string): Board[] {
  u.font = `600 ${fontPx()}px ${FONT}`;
  const width = (s: string) => Math.ceil(u.measureText(s).width / unit()) + 8;
  const boards: Board[] = doors.map((d) => ({ text: d.sign, cx: d.x + d.w / 2, y: d.bottom - d.h - LIFT[d.kind], w: width(d.sign) }));
  boards.push({ text: welcome, cx: 104, y: 118, w: width(welcome), post: true });
  return boards;
}

function bubble(x: number, y: number, text: string) {
  u.font = `600 ${Math.max(12, fontPx())}px ${FONT}`;
  const w = u.measureText(text).width + 18;
  const h = Math.max(24, fontPx() + 12);
  const left = Math.max(6, Math.min(view.cssW - w - 6, x - w / 2));
  u.fillStyle = "rgba(255, 255, 255, 0.96)";
  u.beginPath();
  if (u.roundRect) u.roundRect(left, y - h, w, h, h / 2);
  else u.rect(left, y - h, w, h);
  u.fill();
  u.fillStyle = "#1f1a17";
  u.fillText(text, left + w / 2, y - h / 2 + 0.5);
}

export interface Overlay {
  boards: Board[];
  hint: { x: number; y: number; text: string } | null;
  bubble: { x: number; y: number; text: string } | null;
  banner: { title: string; sub: string; alpha: number } | null;
  highlight: Door | null;
  steps: number;
}

export function drawText(o: Overlay) {
  u.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  u.clearRect(0, 0, view.cssW, view.cssH);
  u.textAlign = "center";
  u.textBaseline = "middle";

  u.font = `600 ${fontPx()}px ${FONT}`;
  u.fillStyle = "#fff4dc";
  for (const b of o.boards) u.fillText(b.text, sx(b.cx), sy(b.y + 5) + 0.5);

  if (o.bubble) bubble(sx(o.bubble.x), sy(o.bubble.y) - 8, o.bubble.text);
  else if (o.hint) bubble(sx(o.hint.x), sy(o.hint.y) - 8, o.hint.text);

  if (o.banner && o.banner.alpha > 0) {
    const top = Math.min(110, view.cssH * 0.18);
    u.globalAlpha = o.banner.alpha;
    u.fillStyle = "rgba(10, 14, 30, 0.45)";
    u.font = `700 ${Math.round(fontPx() * 1.7)}px ${FONT}`;
    u.lineWidth = 4;
    u.strokeStyle = "rgba(10, 14, 30, 0.35)";
    u.strokeText(o.banner.title, view.cssW / 2, top);
    u.fillStyle = "#ffffff";
    u.fillText(o.banner.title, view.cssW / 2, top);
    if (o.banner.sub) {
      u.font = `500 ${Math.round(fontPx() * 1.05)}px ${FONT}`;
      u.strokeText(o.banner.sub, view.cssW / 2, top + fontPx() * 1.6);
      u.fillText(o.banner.sub, view.cssW / 2, top + fontPx() * 1.6);
    }
    u.globalAlpha = 1;
  }

  const d = o.highlight;
  if (d) {
    const pulse = view.reduced ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(o.steps * 0.08));
    const x = sx(d.x - 6);
    const y = sy(d.bottom - d.h - 8);
    const w = (d.w + 12) * unit();
    const h = (d.h + 8) * unit();
    u.strokeStyle = `rgba(255, 216, 77, ${pulse.toFixed(2)})`;
    u.lineWidth = 3;
    u.strokeRect(x, y, w, h);
    if (x + w < 0 || x > view.cssW) {
      // The house is off screen: point at it from the edge.
      const left = x + w < 0;
      const ax = left ? 18 : view.cssW - 18;
      const ay = view.cssH * 0.55;
      u.fillStyle = "#ffd84d";
      u.beginPath();
      u.moveTo(ax + (left ? -10 : 10), ay);
      u.lineTo(ax + (left ? 6 : -6), ay - 10);
      u.lineTo(ax + (left ? 6 : -6), ay + 10);
      u.fill();
      bubble(left ? 80 : view.cssW - 80, ay - 16, d.sign === "?" ? "?" : d.sign);
    }
  }
}
