import { TILE } from "../game/config";
import { COLS, MAP, ROWS, districtFrom, isSolid } from "../game/level";
import type { Sky } from "../game/oslo";
import { STONE, stoneColumn } from "./buildings";
import { R, view } from "./paint";

const SNOW = "#f2f5fa";

// The street changes underfoot: cobbles at Vålerenga and Kampen, grass in the garden and the
// park, and pale stone on the square in Bjørvika.
function surface(x: number) {
  if (x < districtFrom("Tøyen")) return { top: "#8d8a84", dot: "#6f6c66", fill: "#4a4038" };
  if (x < districtFrom("Bjørvika")) return { top: "#5aa04a", dot: "#3f7d35", fill: "#6b4a2f" };
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
      } else if (t === "B") {
        // A wooden crate.
        R(x, y, TILE, TILE, "#6e4824");
        R(x + 1, y + 1, TILE - 2, TILE - 2, "#9a6a3a");
        for (let i = 0; i < TILE - 2; i++) R(x + 1 + i, y + 1 + i, 1, 1, "#7d5530");
        R(x + 1, y + 1, TILE - 2, 1, open ? (sky.snow ? SNOW : "#b07e48") : "#9a6a3a");
      } else if (t === "H") {
        R(x, y, TILE, TILE, "#2f6b3a");
        for (let i = 0; i < 6; i++) R(x + ((i * 5 + c * 3) % 14), y + ((i * 7 + r * 5) % 14), 2, 2, i % 2 ? "#3f8a4b" : "#285c32");
        if (open && sky.snow) R(x, y, TILE, 2, SNOW);
      } else if (t === "R") {
        // Fallen walls you can stand on: the same rough stone, with a worn, mossy top.
        for (let i = 0; i < TILE; i++) stoneColumn(x + i, y, y + TILE);
        R(x, y, 1, TILE, STONE.mortar);
        R(x + TILE - 1, y, 1, TILE, STONE.mortar);
        if (open) {
          R(x, y, TILE, 2, sky.snow ? SNOW : "#8e887e");
          if (!sky.snow) for (let i = 2; i < TILE; i += 5) R(x + i, y - 1, 2, 1, STONE.moss);
        }
      } else if (t === "_") {
        // A stone lintel left from an arch.
        R(x, y, TILE, 4, "#857f75");
        R(x, y, TILE, 1, sky.snow ? SNOW : "#9a948a");
        R(x, y + 4, TILE, 1, STONE.mortar);
        for (let i = 3; i < TILE; i += 6) R(x + i, y + 1, 1, 3, STONE.mortar);
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
