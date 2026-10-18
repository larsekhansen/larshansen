import { PLAYER, TILE } from "../game/config";
import { COLS, MAP, ROWS, isSolid } from "../game/level";
import type { Phase, Sky } from "../game/oslo";
import type { Body } from "../game/physics";
import { R, ctx, mix, view } from "./paint";

const SNOW = "#f2f5fa";

// The street changes underfoot: cobbles at Kampen, grass in the garden and the park,
// pavement at Grønland, and pale stone on the square in Bjørvika.
function surface(x: number) {
  if (x < 320) return { top: "#8d8a84", dot: "#6f6c66", fill: "#4a4038" };
  if (x < 608) return { top: "#5aa04a", dot: "#3f7d35", fill: "#6b4a2f" };
  if (x < 896) return { top: "#b4b2ac", dot: "#9a9892", fill: "#55524c" };
  if (x < 1152) return { top: "#5aa04a", dot: "#3f7d35", fill: "#6b4a2f" };
  return { top: "#dcd9d1", dot: "#c4c1b8", fill: "#6d6a63" };
}

export function drawTiles(sky: Sky) {
  const c0 = Math.max(0, Math.floor(view.camX / TILE));
  const c1 = Math.min(COLS - 1, Math.floor((view.camX + view.w) / TILE));
  const r0 = Math.max(0, Math.floor(view.camY / TILE));
  const r1 = Math.min(ROWS - 1, Math.floor((view.camY + view.h) / TILE));
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const t = MAP[r][c];
      const x = c * TILE;
      const y = r * TILE;
      const open = !isSolid(c, r - 1);
      if (t === "#") {
        const s = surface(x);
        R(x, y, TILE, TILE, s.fill);
        R(x + ((c * 7 + r * 3) % 12) + 1, y + ((c * 5 + r * 11) % 9) + 5, 2, 1, "rgba(0, 0, 0, 0.25)");
        if (open) {
          R(x, y, TILE, 4, sky.snow ? SNOW : s.top);
          R(x, y + 4, TILE, 1, sky.snow ? "#cfd8e6" : s.dot);
          if (!sky.snow) for (let i = 1; i < TILE; i += 4) R(x + i + (c % 2), y + 1 + (i % 3), 1, 1, s.dot);
        }
      } else if (t === "H") {
        R(x, y, TILE, TILE, "#2f6b3a");
        for (let i = 0; i < 6; i++) R(x + ((i * 5 + c * 3) % 14), y + ((i * 7 + r * 5) % 14), 2, 2, i % 2 ? "#3f8a4b" : "#285c32");
        if (open && sky.snow) R(x, y, TILE, 2, SNOW);
      } else if (t === "R") {
        // Lighter than the ruin behind, with a worn top, so it reads as something to stand on.
        R(x, y, TILE, TILE, "#a39c90");
        for (let yy = y + 4; yy < y + TILE; yy += 5) R(x + ((yy / 5) % 2) * 6, yy, 6, 1, "#857e74");
        if (open) R(x, y, TILE, 2, sky.snow ? SNOW : "#c2bbae");
      } else if (t === "~") {
        const red = c < 46;
        for (let i = 0; i < TILE; i += 4) {
          R(x + i, y, 2, 4, red ? "#c8352b" : "#2f8f5f");
          R(x + i + 2, y, 2, 4, "#f3eee4");
        }
        for (let i = 0; i < TILE; i += 4) R(x + i + 1, y + 4, 2, 1, red ? "#a52a22" : "#24704a");
        if (sky.snow) R(x, y - 1, TILE, 1, SNOW);
      } else if (t === "_") {
        R(x, y, TILE, 4, "#a39c90");
        R(x, y + 4, TILE, 1, "#7d766c");
        if (sky.snow) R(x, y - 1, TILE, 1, SNOW);
      }
    }
}

/** Wooden sign boards. The words on them are drawn sharp by the text layer. */
export function drawBoards(boards: { cx: number; y: number; w: number; post?: boolean }[]) {
  for (const b of boards) {
    if (b.post) R(b.cx - 1, b.y + 10, 2, 160 - b.y - 10, "#5a3d24");
    R(b.cx - b.w / 2, b.y, b.w, 10, "#6b4a2b");
    R(b.cx - b.w / 2, b.y + 10, b.w, 1, "#4a321d");
  }
}

// The player: a red knitted hat and a patterned sweater.
const SPRITE = ["....ww....", "...rrrr...", "..rrrrrr..", "..ssssss..", "..sssese..", "..ssssss..", "..bbbbbb..", ".bbwbbwbb.", ".bbbbbbbb.", "..bbbbbb..", "..dddddd.."];
const LEGS = {
  stand: ["..dd..dd..", "..dd..dd..", "..kk..kk.."],
  walk1: ["..dd..dd..", ".dd....dd.", ".kk....kk."],
  walk2: ["..dd..dd..", "...dddd...", "...kkkk..."],
  air: [".dd....dd.", "dd......dd", "kk......kk"]
};
const COLORS: Record<string, string> = { w: "#ffffff", r: "#c8302b", s: "#f1c27d", e: "#1f1a17", b: "#2b4c8c", d: "#2a2a35", k: "#3b2a20" };
const DIM: Record<Phase, number> = { day: 0, evening: 0.15, twilight: 0.25, night: 0.35 };

export function drawPlayer(b: Body, walkSteps: number, alpha: number, phase: Phase) {
  if (alpha <= 0) return;
  const legs = !b.onGround ? LEGS.air : walkSteps ? (Math.floor(walkSteps / 6) % 2 ? LEGS.walk1 : LEGS.walk2) : LEGS.stand;
  const x0 = Math.round(b.x);
  const y0 = Math.round(b.y);
  const rows = SPRITE.concat(legs);
  const g = ctx();
  const prev = g.globalAlpha;
  g.globalAlpha = alpha;
  rows.forEach((row, r) => {
    for (let c = 0; c < PLAYER.w; c++) {
      const ch = row[b.facing > 0 ? c : PLAYER.w - 1 - c];
      if (ch !== ".") R(x0 + c, y0 + r, 1, 1, mix(COLORS[ch], "#141c46", DIM[phase]));
    }
  });
  g.globalAlpha = prev;
}
