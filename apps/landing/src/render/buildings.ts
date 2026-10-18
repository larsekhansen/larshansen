import type { Door } from "../game/doors";
import { WORLD_W, districtFrom, rampAt } from "../game/level";
import type { Sky } from "../game/oslo";
import { R, gable, light, view, wdisc } from "./paint";

const reduced = () => view.reduced;

// The street-level landmarks. Each part of town is drawn relative to where its district starts,
// so the map can change without moving every building by hand. The street is at y 160.

const G = 160;
const SNOW = "#f2f5fa";
const TRIM = "#f4efe4";

function pane(x: number, y: number, w: number, h: number, glass = "#a9d2e6") {
  R(x - 1, y - 1, w + 2, h + 2, TRIM);
  R(x, y, w, h, glass);
  R(x + Math.floor(w / 2), y, 1, h, TRIM);
  R(x, y + Math.floor(h / 2), w, 1, TRIM);
  const hw = Math.floor(w / 2);
  const hh = Math.floor(h / 2);
  light(x, y, hw, hh);
  light(x + hw + 1, y, w - hw - 1, hh);
  light(x, y + hh + 1, hw, h - hh - 1);
  light(x + hw + 1, y + hh + 1, w - hw - 1, h - hh - 1);
}

function padlock(x: number, y: number) {
  R(x, y + 3, 6, 5, "#c9a227");
  R(x + 1, y, 4, 3, "#9a9690");
  R(x + 2, y + 1, 2, 2, "#5a4a2a");
}

export function drawDoor(d: Door, color: string, panel: string) {
  const ox = d.shake ? (d.shake % 4 < 2 ? 1 : -1) : 0;
  const top = d.bottom - d.h;
  R(d.x + ox, top, d.w, d.h, d.open ? "#140d08" : color);
  if (!d.open) {
    R(d.x + ox + 2, top + 2, d.w - 4, 12, panel);
    R(d.x + ox + 2, top + 17, d.w - 4, 12, panel);
    R(d.x + ox + d.w - 4, top + 16, 2, 2, "#d9b45a");
  }
  if (d.soon) padlock(d.x + ox + 5, top + 10);
}

function walls(x: number, top: number, w: number, color: string, line: string) {
  R(x, top, w, G - top, color);
  for (let i = 3; i < w - 2; i += 4) R(x + i, top, 1, G - top, line);
  R(x, top, 2, G - top, TRIM);
  R(x + w - 2, top, 2, G - top, TRIM);
}

function flag(x: number, top: number) {
  R(x, top, 1, G - top, "#e9e9e9");
  R(x - 1, top - 2, 3, 2, "#d9b45a");
  R(x + 1, top, 13, 9, "#ba0c2f");
  R(x + 4, top, 3, 9, "#ffffff");
  R(x + 1, top + 3, 13, 3, "#ffffff");
  R(x + 5, top, 1, 9, "#00205b");
  R(x + 1, top + 4, 13, 1, "#00205b");
}

/** Street lamps, by where they stand. The street lights up around them after dark. */
export const LAMPS: { x: number; tall: number }[] = [];

/** A street lamp with a broad hat over the bulb. */
function lamp(x: number, tall = 36) {
  const top = G - tall;
  R(x, top, 2, tall, "#2f3438");
  R(x - 4, top - 7, 10, 2, "#2f3438");
  R(x - 3, top - 5, 8, 1, "#3b4045");
  R(x - 2, top - 4, 6, 3, "#d9dcd2");
  light(x - 2, top - 4, 6, 3, "lamp");
  if (!LAMPS.some((l) => l.x === x)) LAMPS.push({ x, tall });
}

function tree(x: number, sky: Sky, birch = false) {
  const autumn = sky.month >= 9 && sky.month <= 11;
  const bare = sky.month === 12 || sky.month <= 3;
  R(x, G - 26, 3, 26, birch ? "#ece8df" : "#5b4030");
  if (birch) for (let y = G - 24; y < G; y += 5) R(x + (y % 2), y, 2, 1, "#2a2a2a");
  if (bare) {
    R(x - 4, G - 30, 1, 6, "#5b4030");
    R(x + 6, G - 32, 1, 8, "#5b4030");
    if (sky.snow) R(x - 4, G - 31, 12, 1, SNOW);
    return;
  }
  const crown = autumn ? (birch ? "#e3b23c" : "#c8702f") : birch ? "#8fbf5a" : "#4f8a46";
  const shine = autumn ? (birch ? "#f2cf5b" : "#de8a3f") : birch ? "#a8d06e" : "#64a157";
  wdisc(x + 1, G - 34, birch ? 9 : 12, crown);
  wdisc(x - 2, G - 38, birch ? 4 : 5, shine);
}

const QR_BITS = ["111010111", "101001101", "111011111", "000101000", "110111011", "001010100", "111001010", "101110011", "111010101"];

/** Vålerenga and Kampen: small wooden houses, Lars's yellow one, and a brick workshop. */
function valerengaKampen(home: Door | undefined, workshop: Door | undefined, sky: Sky, time: number) {
  const roof = (c: string) => (sky.snow ? SNOW : c);
  walls(8, 112, 80, "#8fb8a0", "#7ea692");
  gable(2, 112, 92, 24, roof("#7b2d26"));
  pane(20, 124, 12, 10);
  pane(56, 124, 12, 10);
  for (let x = 2; x < 100; x += 4) R(x, 150, 2, 10, TRIM);
  R(0, 152, 100, 1, TRIM);
  R(0, 156, 100, 1, TRIM);

  walls(136, 104, 96, "#d6a347", "#c18f38");
  R(206, 78, 6, 14, "#7a6f66");
  gable(130, 104, 108, 28, roof("#3e3a3a"));
  pane(150, 112, 14, 12);
  pane(204, 112, 14, 12);
  pane(150, 134, 14, 12);
  pane(204, 134, 14, 12);
  if (home) {
    R(home.x - 2, home.bottom - home.h - 2, home.w + 4, home.h + 2, TRIM);
    drawDoor(home, "#3f6b4f", "#4b7a5c");
  }

  walls(248, 116, 64, "#a8432f", "#93392a");
  gable(243, 116, 74, 20, roof("#3e3a3a"));
  pane(258, 128, 12, 10);
  pane(290, 128, 12, 10);
  lamp(238);

  // A brick workshop with a cast-iron window, home of QR-verkstedet.
  R(352, 100, 96, 60, "#9b4a3a");
  for (let y = 103; y < G; y += 4) {
    R(352, y, 96, 1, "#86402f");
    for (let x = 352 + ((y / 4) % 2) * 4; x < 448; x += 8) R(x, y - 3, 1, 3, "#86402f");
  }
  gable(346, 100, 108, 14, roof("#3e3a3a"));
  R(424, 78, 4, 18, "#4a4f55");
  R(423, 76, 6, 2, "#3a3e43");
  R(425, 80, 1, 14, "#6a7077");
  if (!reduced())
    for (let i = 0; i < 3; i++) {
      const ph = ((time * 0.5 + i * 24) % 72) / 72;
      R(424 + Math.round(Math.sin(ph * 6 + i) * 2 + ph * 5), 72 - ph * 20, 4, 3, `rgba(200, 196, 190, ${(0.55 * (1 - ph)).toFixed(2)})`);
    }
  R(358, 116, 24, 34, "#2c2f36");
  for (let dy = 0; dy < 6; dy++) {
    const half = Math.round(12 * Math.sqrt(1 - ((6 - dy) / 6) ** 2));
    R(370 - half, 110 + dy, half * 2, 1, "#2c2f36");
  }
  for (let y = 117; y < 149; y += 6)
    for (let x = 359; x < 381; x += 6) {
      R(x, y, 4, 4, "#a9d2e6");
      light(x, y, 4, 4);
    }
  R(410, 118, 24, 24, "#ffffff");
  QR_BITS.forEach((row, r) => [...row].forEach((b, c) => b === "1" && R(413 + c * 2, 121 + r * 2, 2, 2, "#1f1a17")));
  if (workshop) {
    R(workshop.x - 2, workshop.bottom - workshop.h - 2, workshop.w + 4, workshop.h + 2, "#5a3b22");
    drawDoor(workshop, "#7a4b2a", "#8a5a33");
  }
  if (sky.flags) {
    flag(4, 60);
    flag(126, 70);
  }
}

/** Tøyen: the palm house and the gate into Botanisk hage. */
function toyen(gate: Door | undefined, sky: Sky) {
  const o = districtFrom("Tøyen");
  const glass = "#cfe6ee";
  R(o + 66, 120, 52, 40, glass);
  for (let dy = 0; dy <= 16; dy++) {
    const half = Math.round(26 * Math.sqrt(1 - ((16 - dy) / 16) ** 2));
    R(o + 92 - half, 104 + dy, half * 2, 1, glass);
  }
  for (let x = o + 68; x < o + 118; x += 6) R(x, 112, 1, 48, TRIM);
  R(o + 66, 132, 52, 1, TRIM);
  R(o + 66, 146, 52, 1, TRIM);
  for (const [px, py] of [[o + 78, 140], [o + 100, 132], [o + 90, 148]]) {
    R(px, py, 2, 160 - py, "#6b5a3a");
    R(px - 5, py, 12, 2, "#2f6b3a");
    R(px - 3, py - 2, 8, 2, "#3f8a4b");
  }
  for (let x = o + 68; x < o + 116; x += 8) light(x, 122, 5, 8, "soft");

  if (gate) {
    R(o + 120, 118, 7, 42, "#b9b2a6");
    R(o + 145, 118, 7, 42, "#b9b2a6");
    for (let y = 122; y < 160; y += 6) {
      R(o + 120, y, 7, 1, "#9c958a");
      R(o + 145, y, 7, 1, "#9c958a");
    }
    for (let i = 0; i < 18; i++) R(o + 127 + i, 118 - Math.round(Math.sin((i / 17) * Math.PI) * 8), 1, 2, "#2c2f36");
    wdisc(o + 136, 108, 2, "#2c2f36");
    // Through the gate: rows of clipped hedge with gaps, like the start of a maze, on gravel.
    const top = gate.bottom - gate.h;
    R(gate.x, top, gate.w, gate.h, gate.open ? "#14200f" : "#24452a");
    if (!gate.open) {
      R(gate.x, top + 6, gate.w - 5, 4, "#3f7a46");
      R(gate.x + 5, top + 15, gate.w - 5, 4, "#3f7a46");
      R(gate.x, top + 24, gate.w - 6, 3, "#3f7a46");
      R(gate.x, gate.bottom - 3, gate.w, 3, "#c8b98f");
    }
    R(o + 127, top, 1, gate.h, "#2c2f36");
    R(o + 144, top, 1, gate.h, "#2c2f36");
  }
  tree(o + 168, sky);
  tree(o + 264, sky);
}

// Ruined stone: irregular blocks with dark mortar, a little moss, and the same stones every visit.
// Walls you can stand on are a little lighter and warmer than the ruins further back.
export interface Stone {
  base: string;
  light: string;
  dark: string;
  mortar: string;
  moss: string;
}
export const STONE: Stone = { base: "#7d776e", light: "#8c857a", dark: "#6c665e", mortar: "#4b4741", moss: "#5d7a45" };
const STONE_BACK: Stone = { base: "#5f5c58", light: "#68645f", dark: "#56534f", mortar: "#474441", moss: "#4c5f40" };

function stoneHash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/** One column of rough stonework from `top` to `bottom`, leaving a gap for an opening. */
export function stoneColumn(x: number, top: number, bottom: number, gapTop = 0, gapBottom = 0, stone: Stone = STONE) {
  for (let y = top; y < bottom; y++) {
    if (y >= gapTop && y < gapBottom) continue;
    const course = Math.floor(y / 4);
    const offset = (course * 5) % 7;
    const block = Math.floor((x + offset) / 6);
    const isMortar = y % 4 === 3 || (x + offset) % 6 === 0;
    const shade = stoneHash(block, course);
    const color = isMortar ? stone.mortar : shade < 0.33 ? stone.dark : shade < 0.75 ? stone.base : stone.light;
    R(x, y, 1, 1, color);
  }
}

/**
 * Gamlebyen: what is left of Mariakirken in Middelalderparken, a broken arch and a ruined wall.
 * This is scenery, drawn in its own layer a little further back than the walls you can stand on.
 */
export function drawRuins(sky: Sky) {
  const o = districtFrom("Gamlebyen");
  const back = (x: number, top: number, bottom: number, gapTop = 0, gapBottom = 0) => stoneColumn(x, top, bottom, gapTop, gapBottom, STONE_BACK);
  const moss = (x: number, y: number) => R(x, y - 1, 1, 2, sky.snow ? SNOW : STONE_BACK.moss);

  // A broken arch: one pillar standing, the other snapped off, and the curve broken past the top.
  const cx = o + 40;
  for (let x = cx - 24; x < cx - 16; x++) back(x, 118, G);
  for (let x = cx + 16; x < cx + 24; x++) back(x, 132 + (x % 3), G);
  for (let x = cx - 24; x <= cx + 9; x++) {
    const dx = x - cx;
    const outer = Math.round(118 - Math.sqrt(24 * 24 - dx * dx));
    const inner = Math.abs(dx) < 16 ? Math.round(118 - Math.sqrt(16 * 16 - dx * dx)) : 118;
    const broken = dx > 4 ? (dx - 4) * 2 : 0; // the stones fall away at the break
    back(x, outer + broken, inner);
    if (dx > 0 && dx % 3 === 0) moss(x, outer + broken);
  }
  moss(cx - 22, 118);
  moss(cx + 18, 132);

  // A wall with round-arched windows you can see through, and a broken top.
  const steps = [52, 58, 64, 61, 56, 48, 42, 46, 38];
  for (let x = o + 100; x < o + 208; x++) {
    const seg = Math.floor((x - o - 100) / 12);
    const top = G - steps[Math.min(seg, steps.length - 1)] + ((x * 7) % 3 === 0 ? 1 : 0);
    let gapTop = 0;
    let gapBottom = 0;
    for (const [cx, wTop, wBottom] of [[o + 126, 118, 142], [o + 170, 112, 136]]) {
      const dx = x - cx;
      if (Math.abs(dx) <= 6) {
        gapTop = wTop + 6 - Math.round(Math.sqrt(Math.max(0, 36 - dx * dx)));
        gapBottom = wBottom;
      }
    }
    back(x, top, G, gapTop, gapBottom);
    if (x % 5 === 0) moss(x, top);
  }
  // Fallen stones in the grass.
  for (const [rx, rw, rh] of [[o + 8, 5, 3], [o + 70, 6, 4], [o + 92, 4, 2], [o + 214, 6, 3]]) {
    for (let x = rx; x < rx + rw; x++) back(x, G - rh, G);
  }
}

/** Bjørvika: Deichman, the library, with its top floor hanging out over the square. */
function deichman(library: Door | undefined) {
  const o = districtFrom("Bjørvika");
  const glass = "#dfe7ea";
  R(o + 32, 96, 128, 64, glass);
  R(o + 8, 78, 152, 18, "#e7edef");
  for (let i = 0; i < 19; i++) R(o + 8 + i * 8, 74 + (i % 2) * 2, 8, 4 - (i % 2) * 2, "#c3ccd1");
  R(o + 8, 96, 24, 2, "#9aa7ad");
  for (let x = o + 32; x < o + 160; x += 4) R(x, 96, 1, 64, "#c5cfd4");
  for (let x = o + 8; x < o + 160; x += 4) R(x, 78, 1, 18, "#cfd8dc");
  R(o + 32, 114, 128, 1, "#b8c4ca");
  R(o + 32, 132, 128, 1, "#b8c4ca");
  const books = ["#b8433a", "#2f6db5", "#e0b23a", "#3f8a4f", "#7a4fa0", "#d9734a"];
  for (let x = o + 37; x < o + 74; x += 2) R(x, 118, 1, 10, books[(x * 7) % books.length]);
  for (let x = o + 113; x < o + 150; x += 2) R(x, 118, 1, 10, books[(x * 5) % books.length]);
  for (let x = o + 33; x < o + 159; x += 8) {
    light(x, 98, 3, 15, "soft");
    light(x + 4, 116, 3, 15, "soft");
  }
  for (let x = o + 9; x < o + 159; x += 8) light(x, 80, 3, 14, "soft");
  if (library) {
    R(library.x - 2, library.bottom - library.h - 2, library.w + 4, library.h + 2, "#8d9aa1");
    drawDoor(library, "#a9bcc4", "#b9cad1");
  }
  lamp(o + 14, 40);
  lamp(o + 178, 40);
}

/** Bjørvika: the Opera. The roof is a slope you can walk up, with the stage tower on top. */
function opera(secret: Door | undefined) {
  const o = districtFrom("Bjørvika");
  const foyer = o + 280;
  for (let x = o + 192; x < WORLD_W; x++) {
    const s = Math.round(rampAt(x) ?? G);
    R(x, s, 1, 3, "#f3f2ee");
    R(x, s + 3, 1, 1, "#c9c8c0");
    if (x < foyer) {
      R(x, s + 4, 1, G - s - 4, (x - o) % 12 === 0 ? "#d6d5cd" : "#e4e3dc");
      continue;
    }
    // The glass foyer under the high part of the roof, with mullions only below the roof line.
    const mullion = (x - foyer) % 6 === 0;
    R(x, s + 4, 1, G - s - 4, mullion ? "#8fb0bb" : "#557985");
    if (!mullion) for (let y = 104; y < G; y += 10) if (y > s + 4) R(x, y, 1, 1, "#8fb0bb");
    if ((x - foyer) % 6 === 3) light(x, s + 6, 1, G - s - 8, "soft");
  }
  R(o + 384, 40, 48, 56, "#e6ecef");
  R(o + 384, 40, 48, 2, "#d4dde1");
  for (let y = 44; y < 94; y += 4) for (let x = o + 386; x < o + 430; x += 4) R(x + ((y / 4) % 2) * 2, y, 1, 1, "#c9d3d8");
  if (secret) {
    R(secret.x - 1, secret.bottom - secret.h - 1, secret.w + 2, secret.h + 1, "#c9d3d8");
    R(secret.x, secret.bottom - secret.h, secret.w, secret.h, secret.open ? "#0c1218" : "#2b3943");
    R(secret.x + secret.w - 4, secret.bottom - 16, 2, 2, "#d9b45a");
  }
}

export function drawBuildings(doors: Door[], sky: Sky, time: number) {
  const byId = (id: string) => doors.find((d) => d.id === id);
  valerengaKampen(byId("cv"), byId("qr"), sky, time);
  toyen(byId("maze"), sky);
  tree(districtFrom("Gamlebyen") + 226, sky, true);
  deichman(byId("quintle"));
  opera(byId("opera"));
}
