import { PLAYER, TILE } from "./config";
import type { Phase } from "./oslo";
import type { Body, World } from "./physics";
import { view } from "./paint";
import { playerPixels, type Look } from "./person";
import { SIGN_PAINT } from "./palette";

// Words are drawn at full screen resolution on top of the pixel art, so they stay sharp. The player
// is drawn on the same canvas, after the signs, so it is never hidden behind a sign's words.

let u: CanvasRenderingContext2D;
export function textTarget(ctx: CanvasRenderingContext2D) {
  u = ctx;
}
/** The text canvas, for scene code that draws its own furniture on it. */
export function textCtx() {
  return u;
}

export const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Screen pixels per art pixel. */
export const unit = () => view.k / view.dpr;
export const fontPx = () => Math.max(11, Math.round(4.3 * unit()));
// From the camera's real position, so words and the player glide with the art beneath them.
export const sx = (wx: number) => (wx - view.camXf) * unit();
export const sy = (wy: number) => (wy - view.camYf) * unit();
/** Rounded to whole device pixels, so moving pixel art keeps sharp edges. */
export const snap = (v: number) => Math.round(v * view.dpr) / view.dpr;

/** True where there is something to stand on at height y, under world x. */
function standable(world: World, x: number, y: number) {
  const ramp = world.rampAt(x);
  if (ramp !== null && Math.abs(ramp - y) < 1.5) return true;
  if (y % TILE !== 0) return false;
  const c = Math.floor(x / TILE);
  const r = y / TILE;
  return (world.isSolid(c, r) || world.isOneWay(c, r)) && !world.isSolid(c, r - 1);
}

/**
 * The player, with a faint glow so it stands out from the busy scene behind. Its shadow lies on
 * whatever it stands on, and stops at the edge instead of hanging in the air.
 */
export function drawPlayer(world: World, b: Body, walk: number, alpha: number, phase: Phase, look?: Look) {
  if (alpha <= 0) return;
  const n = unit();
  const cx = sx(b.x + PLAYER.w / 2);
  const cy = sy(b.y + PLAYER.h / 2);
  u.globalAlpha = alpha;
  const glow = u.createRadialGradient(cx, cy, 0, cx, cy, 11 * n);
  const tone = phase === "day" ? "255, 255, 255" : "255, 232, 190";
  glow.addColorStop(0, `rgba(${tone}, ${phase === "day" ? 0.09 : 0.11})`);
  glow.addColorStop(1, `rgba(${tone}, 0)`);
  u.fillStyle = glow;
  u.fillRect(cx - 11 * n, cy - 11 * n, 22 * n, 22 * n);
  if (b.onGround) {
    const feet = b.y + PLAYER.h;
    const mid = Math.round(b.x + PLAYER.w / 2);
    u.fillStyle = "rgba(0, 0, 0, 0.22)";
    for (let dx = -6; dx <= 5; dx++) {
      const x = mid + dx;
      const ramp = world.rampAt(x);
      const y = ramp !== null && Math.abs(ramp - feet) < 4 ? Math.round(ramp) : Math.round(feet);
      if (!standable(world, x, y)) continue;
      u.fillRect(snap(sx(x)), snap(sy(y)), n, (Math.abs(dx + 0.5) < 4 ? 2 : 1) * n);
    }
  }
  const ox = snap(sx(b.x));
  const oy = snap(sy(b.y));
  playerPixels(
    b,
    walk,
    phase,
    (c, r, color) => {
      u.fillStyle = color;
      u.fillRect(ox + c * n, oy + r * n, n, n);
    },
    look
  );
  u.globalAlpha = 1;
}

/** A speech bubble with its bottom edge at y, centred on x (or starting at x with `align: "left"`) and kept on screen. Screen CSS pixels. */
export function bubble(x: number, y: number, text: string, align: "center" | "left" = "center") {
  u.font = `600 ${Math.max(12, fontPx())}px ${FONT}`;
  const w = u.measureText(text).width + 18;
  const h = Math.max(24, fontPx() + 12);
  const left = Math.max(6, Math.min(view.cssW - w - 6, align === "left" ? x : x - w / 2));
  u.fillStyle = "rgba(255, 255, 255, 0.96)";
  u.beginPath();
  if (u.roundRect) u.roundRect(left, y - h, w, h, h / 2);
  else u.rect(left, y - h, w, h);
  u.fill();
  u.fillStyle = "#1f1a17";
  u.fillText(text, left + w / 2, y - h / 2 + 0.5);
}

/**
 * The place name banner near the top of the screen. With `plate` it stands on a dark rounded plate, so
 * it reads over any sky, bright snow or banded sunset alike (the viking game's banner).
 */
export function drawBanner(b: { title: string; sub: string; alpha: number; plate?: boolean; top?: number }) {
  const top = b.top ?? Math.min(110, view.cssH * 0.18);
  if (b.plate) return drawPlatedBanner(b, top);
  u.globalAlpha = b.alpha;
  u.fillStyle = "rgba(10, 14, 30, 0.45)";
  u.font = `700 ${Math.round(fontPx() * 1.7)}px ${FONT}`;
  u.lineWidth = 4;
  u.strokeStyle = "rgba(10, 14, 30, 0.35)";
  u.strokeText(b.title, view.cssW / 2, top);
  u.fillStyle = "#ffffff";
  u.fillText(b.title, view.cssW / 2, top);
  if (b.sub) {
    u.font = `500 ${Math.round(fontPx() * 1.05)}px ${FONT}`;
    u.strokeText(b.sub, view.cssW / 2, top + fontPx() * 1.6);
    u.fillText(b.sub, view.cssW / 2, top + fontPx() * 1.6);
  }
  u.globalAlpha = 1;
}

function drawPlatedBanner(b: { title: string; sub: string; alpha: number }, top: number) {
  const titleFont = `700 ${Math.round(fontPx() * 1.7)}px ${FONT}`;
  const subFont = `500 ${Math.round(fontPx() * 1.05)}px ${FONT}`;
  u.font = titleFont;
  let w = u.measureText(b.title).width;
  if (b.sub) {
    u.font = subFont;
    w = Math.max(w, u.measureText(b.sub).width);
  }
  const padX = Math.round(fontPx() * 1.1);
  const half = Math.round(fontPx() * 1.25);
  const h = half * 2 + (b.sub ? fontPx() * 1.6 : 0);
  const plateW = Math.min(view.cssW - 12, w + padX * 2);
  const x = view.cssW / 2 - plateW / 2;
  const y = top - half;
  u.globalAlpha = b.alpha;
  u.fillStyle = "rgba(20, 22, 34, 0.74)";
  u.beginPath();
  if (u.roundRect) u.roundRect(x, y, plateW, h, Math.min(14, h / 2));
  else u.rect(x, y, plateW, h);
  u.fill();
  u.fillStyle = "#ffffff";
  u.font = titleFont;
  u.fillText(b.title, view.cssW / 2, top);
  if (b.sub) {
    u.font = subFont;
    u.fillStyle = "rgba(255, 255, 255, 0.88)";
    u.fillText(b.sub, view.cssW / 2, top + fontPx() * 1.6);
  }
  u.globalAlpha = 1;
}

/** Falling snow, from the sky's flakes in screen art pixels. It falls in front of everything. */
export function drawSnow(snow: { x: number; y: number; size: number }[]) {
  const n = unit();
  u.fillStyle = "rgba(255, 255, 255, 0.85)";
  for (const f of snow) u.fillRect(snap(f.x * n), snap(f.y * n), f.size * n, n);
}

/** A small arrow bobbing over the spot the player is walking to. */
export function drawMarker(m: { x: number; y: number }, steps: number) {
  const n = unit();
  const bob = view.reduced ? 0 : Math.sin(steps * 0.15) * 1.5 * n;
  const x = sx(m.x);
  const y = sy(m.y) - 5 * n + bob;
  u.fillStyle = "#ffd84d";
  u.strokeStyle = "rgba(31, 26, 23, 0.7)";
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(x, y);
  u.lineTo(x - 3.5 * n, y - 5 * n);
  u.lineTo(x + 3.5 * n, y - 5 * n);
  u.closePath();
  u.fill();
  u.stroke();
}

/** The pulsing frame round a door, with an arrow and its name when it is off screen. */
export function drawHighlight(d: { x: number; bottom: number; w: number; h: number; sign: string }, steps: number) {
  const pulse = view.reduced ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(steps * 0.08));
  const x = sx(d.x - 6);
  const y = sy(d.bottom - d.h - 8);
  const w = (d.w + 12) * unit();
  const h = (d.h + 8) * unit();
  u.strokeStyle = `rgba(255, 216, 77, ${pulse.toFixed(2)})`;
  u.lineWidth = 3;
  u.strokeRect(x, y, w, h);
  if (x + w < 0 || x > view.cssW) {
    // The door is off screen: point at it from the edge.
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

/** A sign board: its words, centre x, top y and width, and the ground its post stands on when it has one. */
export interface Board {
  text: string;
  cx: number;
  y: number;
  w: number;
  post?: number;
}

/** A board's width for its words, in art pixels. Even, so a board sits square on its post. */
export function boardWidth(text: string) {
  u.font = `600 ${fontPx()}px ${FONT}`;
  return Math.ceil((u.measureText(text).width / unit() + 8) / 2) * 2;
}

/** The board over a door, `lift` art pixels above its top. */
export function doorBoard(d: { sign: string; x: number; w: number; h: number; bottom: number }, lift: number): Board {
  return { text: d.sign, cx: d.x + d.w / 2, y: d.bottom - d.h - lift, w: boardWidth(d.sign) };
}

/** Everything on the text canvas of a side-view scene, in the order it stacks. */
export interface Overlay {
  /** What the player's shadow lies on. */
  world: World;
  boards: Board[];
  /** Going through a door fades everything behind the player to black. */
  fade: number;
  snow: { x: number; y: number; size: number }[];
  player: { body: Body; walk: number; alpha: number; phase: Phase; look?: Look };
  hint: { x: number; y: number; text: string } | null;
  /** Lines in speech bubbles stacked upwards, the first line on top. Shown instead of the hint. */
  bubble: { x: number; y: number; lines: string[]; align?: "left" } | null;
  banner: { title: string; sub: string; alpha: number; plate?: boolean; top?: number } | null;
  highlight: { x: number; bottom: number; w: number; h: number; sign: string } | null;
  /** Where the player is walking to after a click on the ground. */
  marker: { x: number; y: number } | null;
  steps: number;
}

export function drawOverlay(o: Overlay) {
  u.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  u.clearRect(0, 0, view.cssW, view.cssH);
  u.textAlign = "center";
  u.textBaseline = "middle";

  u.font = `600 ${fontPx()}px ${FONT}`;
  u.fillStyle = SIGN_PAINT;
  for (const b of o.boards) u.fillText(b.text, sx(b.cx), sy(b.y + 5) + 0.5);

  if (o.fade > 0) {
    u.fillStyle = `rgba(5, 5, 12, ${o.fade.toFixed(3)})`;
    u.fillRect(0, 0, view.cssW, view.cssH);
  }

  drawPlayer(o.world, o.player.body, o.player.walk, o.player.alpha, o.player.phase, o.player.look);

  if (o.snow.length) drawSnow(o.snow);

  if (o.bubble) {
    const b = o.bubble;
    const h = Math.max(24, fontPx() + 12) + 4;
    const last = b.lines.length - 1;
    b.lines.forEach((line, i) => bubble(sx(b.x), sy(b.y) - 8 - (last - i) * h, line, b.align));
  } else if (o.hint) bubble(sx(o.hint.x), sy(o.hint.y) - 8, o.hint.text);

  if (o.banner && o.banner.alpha > 0) drawBanner(o.banner);
  if (o.marker) drawMarker(o.marker, o.steps);
  if (o.highlight) drawHighlight(o.highlight, o.steps);
}
