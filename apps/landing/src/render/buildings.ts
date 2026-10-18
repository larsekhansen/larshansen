import type { Door } from "../game/doors";
import { rampAt } from "../game/level";
import type { Sky } from "../game/oslo";
import { R, gable, light, wdisc } from "./paint";

// The street-level landmarks, from Kampen down to Bjørvika. World coordinates; the street is at y 160.

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

function lamp(x: number, tall = 36) {
  R(x, G - tall, 2, tall, "#2f3438");
  R(x - 2, G - tall - 4, 6, 4, "#2f3438");
  light(x - 1, G - tall - 2, 4, 2, "lamp");
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

/** Kampen: small wooden houses around the church. Lars's house is the yellow one. */
function kampen(home: Door | undefined, sky: Sky) {
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
  lamp(118);
  if (sky.flags) {
    flag(124, 70);
    flag(240, 84);
  }
}

/** Tøyen: the palm house and the gate into Botanisk hage. */
function toyen(gate: Door | undefined, sky: Sky) {
  const glass = "#cfe6ee";
  R(386, 120, 52, 40, glass);
  for (let dy = 0; dy <= 16; dy++) {
    const half = Math.round(26 * Math.sqrt(1 - ((16 - dy) / 16) ** 2));
    R(412 - half, 104 + dy, half * 2, 1, glass);
  }
  for (let x = 388; x < 438; x += 6) R(x, 112, 1, 48, TRIM);
  R(386, 132, 52, 1, TRIM);
  R(386, 146, 52, 1, TRIM);
  for (const [px, py] of [[398, 140], [420, 132], [410, 148]]) {
    R(px, py, 2, 160 - py, "#6b5a3a");
    R(px - 5, py, 12, 2, "#2f6b3a");
    R(px - 3, py - 2, 8, 2, "#3f8a4b");
  }
  for (let x = 388; x < 436; x += 8) light(x, 122, 5, 8, "soft");

  if (gate) {
    R(440, 118, 7, 42, "#b9b2a6");
    R(465, 118, 7, 42, "#b9b2a6");
    for (let y = 122; y < 160; y += 6) {
      R(440, y, 7, 1, "#9c958a");
      R(465, y, 7, 1, "#9c958a");
    }
    for (let i = 0; i < 18; i++) R(447 + i, 118 - Math.round(Math.sin((i / 17) * Math.PI) * 8), 1, 2, "#2c2f36");
    wdisc(456, 108, 2, "#2c2f36");
    // Through the gate, a gravel path runs into the hedges.
    const top = gate.bottom - gate.h;
    R(gate.x, top, gate.w, gate.h, gate.open ? "#14200f" : "#2f5a33");
    if (!gate.open)
      for (let y = top + 8; y < gate.bottom; y++) {
        const half = 1 + Math.floor((y - top - 8) / 4);
        R(gate.x + gate.w / 2 - half, y, half * 2, 1, "#c8b98f");
      }
    R(447, top, 1, gate.h, "#2c2f36");
    R(464, top, 1, gate.h, "#2c2f36");
  }
  tree(488, sky);
  tree(584, sky);
}

/** Grønland: Grønland Basar's arcade, market stalls under awnings, and a workshop. */
const STALLS = [648, 680, 808, 840];
const LATTICE = [712, 776];
function gronland(workshop: Door | undefined) {
  R(616, 92, 264, 68, "#d9b47c");
  for (let x = 616; x < 880; x += 8) R(x, 88, 5, 4, "#d9b47c");
  R(616, 154, 264, 6, "#c49a5e");
  const tiles = ["#1f6f8b", "#e8e1d0", "#2f8f5f", "#e8e1d0"];
  for (let i = 0; i < 66; i++) R(616 + i * 4, 114, 4, 4, tiles[i % 4]);
  const arch = (cx: number, color: string) => {
    for (let dy = 0; dy < 8; dy++) {
      const half = Math.round(11 * ((dy + 1) / 8));
      R(cx - half, 124 + dy, half * 2, 1, color);
    }
    R(cx - 11, 132, 22, 28, color);
  };
  for (const cx of [648, 680, 712, 744, 776, 808, 840]) {
    R(cx - 4, 98, 8, 10, "#3b2f2a");
    light(cx - 3, 100, 6, 7);
  }
  for (const cx of STALLS) {
    arch(cx, "#4a3426");
    light(cx - 9, 134, 18, 10, "soft");
    R(cx - 11, 148, 22, 12, "#8a5a33");
    const fruit = ["#f08a24", "#c8352b", "#6aa84f", "#f2c53d"];
    for (let j = 0; j < 7; j++) R(cx - 10 + j * 3, 145, 2, 3, fruit[j % 4]);
  }
  for (const cx of LATTICE) {
    arch(cx, "#2f4f5f");
    light(cx - 9, 128, 18, 30, "soft");
    for (let y = 126; y < 160; y += 4) for (let x = cx - 10; x < cx + 10; x += 4) R(x + ((y / 4) % 2) * 2, y, 1, 1, "#c9a66b");
  }
  if (workshop) {
    arch(744, "#5a3b22");
    drawDoor(workshop, "#7a4b2a", "#8a5a33");
  }
}

/** Gamlebyen: what is left of Mariakirken, in Middelalderparken. */
function gamlebyen(sky: Sky) {
  const stone = "#8a8378";
  const dark = "#746d63";
  for (let x = 1008; x < 1096; x += 4) {
    const h = 44 + Math.round(10 * Math.sin(x * 0.21) + 6 * Math.sin(x * 0.5));
    R(x, G - h, 4, h, stone);
    for (let y = G - h + 2; y < G; y += 6) R(x + ((y / 6) % 2) * 2, y, 2, 1, dark);
  }
  for (let dy = 0; dy < 8; dy++) {
    const half = Math.round(7 * ((dy + 1) / 8));
    R(1048 - half, 100 + dy, half * 2, 1, "#5d6870");
  }
  R(1041, 108, 14, 22, "#5d6870");
  tree(948, sky, true);
  tree(1132, sky, true);
  lamp(1000, 32);
}

/** Bjørvika: Deichman, the library, with its top floor hanging out over the square. */
function deichman(library: Door | undefined) {
  const glass = "#dfe7ea";
  R(1184, 96, 128, 64, glass);
  R(1160, 78, 152, 18, "#e7edef");
  for (let i = 0; i < 19; i++) R(1160 + i * 8, 74 + (i % 2) * 2, 8, 4 - (i % 2) * 2, "#c3ccd1");
  R(1160, 96, 24, 2, "#9aa7ad");
  for (let x = 1184; x < 1312; x += 4) R(x, 96, 1, 64, "#c5cfd4");
  for (let x = 1160; x < 1312; x += 4) R(x, 78, 1, 18, "#cfd8dc");
  R(1184, 114, 128, 1, "#b8c4ca");
  R(1184, 132, 128, 1, "#b8c4ca");
  const books = ["#b8433a", "#2f6db5", "#e0b23a", "#3f8a4f", "#7a4fa0", "#d9734a"];
  for (let x = 1189; x < 1226; x += 2) R(x, 118, 1, 10, books[(x * 7) % books.length]);
  for (let x = 1265; x < 1302; x += 2) R(x, 118, 1, 10, books[(x * 5) % books.length]);
  for (let x = 1185; x < 1311; x += 8) {
    light(x, 98, 3, 15, "soft");
    light(x + 4, 116, 3, 15, "soft");
  }
  for (let x = 1161; x < 1311; x += 8) light(x, 80, 3, 14, "soft");
  if (library) {
    R(library.x - 2, library.bottom - library.h - 2, library.w + 4, library.h + 2, "#8d9aa1");
    drawDoor(library, "#a9bcc4", "#b9cad1");
  }
  lamp(1166, 40);
  lamp(1330, 40);
}

/** Bjørvika: the Opera. The roof is a slope you can walk up, with the stage tower on top. */
function opera(secret: Door | undefined) {
  for (let x = 1344; x < 1600; x++) {
    const s = Math.round(rampAt(x) ?? G);
    R(x, s, 1, 3, "#f3f2ee");
    R(x, s + 3, 1, 1, "#c9c8c0");
    if (x < 1432) {
      R(x, s + 4, 1, G - s - 4, "#e4e3dc");
      if (x % 12 === 0) R(x, s + 4, 1, G - s - 4, "#d6d5cd");
    } else {
      R(x, s + 4, 1, G - s - 4, x % 6 === 0 ? "#8fb0bb" : "#557985");
      if (x % 6 !== 0) light(x, s + 6, 1, G - s - 8, "soft");
    }
  }
  for (let y = 104; y < G; y += 10) R(1432, y, 168, 1, "#8fb0bb");
  R(1536, 40, 48, 56, "#e6ecef");
  R(1536, 40, 48, 2, "#d4dde1");
  for (let y = 44; y < 94; y += 4) for (let x = 1538; x < 1582; x += 4) R(x + ((y / 4) % 2) * 2, y, 1, 1, "#c9d3d8");
  if (secret) {
    R(secret.x - 1, secret.bottom - secret.h - 1, secret.w + 2, secret.h + 1, "#c9d3d8");
    R(secret.x, secret.bottom - secret.h, secret.w, secret.h, secret.open ? "#0c1218" : "#2b3943");
    R(secret.x + secret.w - 4, secret.bottom - 16, 2, 2, "#d9b45a");
  }
}

export function drawBuildings(doors: Door[], sky: Sky) {
  const byId = (id: string) => doors.find((d) => d.id === id);
  kampen(byId("cv"), sky);
  toyen(byId("maze"), sky);
  gronland(byId("qr"));
  gamlebyen(sky);
  deichman(byId("quintle"));
  opera(byId("opera"));
}
