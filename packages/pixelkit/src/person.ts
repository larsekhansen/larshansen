import { PLAYER } from "./config";
import type { Phase } from "./oslo";
import type { Body } from "./physics";
import { mix } from "./paint";
import { GOLD, PALETTE } from "./palette";

// The player: a red knitted hat and a patterned sweater.
const SPRITE = ["....ww....", "...rrrr...", "..rrrrrr..", "..ssssss..", "..sssese..", "..ssssss..", "..bbbbbb..", ".bbwbbwbb.", ".bbbbbbbb.", "..bbbbbb..", "..dddddd.."];
const LEGS = {
  stand: ["..dd..dd..", "..dd..dd..", "..kk..kk.."],
  walk1: ["..dd..dd..", ".dd....dd.", ".kk....kk."],
  walk2: ["..dd..dd..", "...dddd...", "...kkkk..."],
  air: [".dd....dd.", "dd......dd", "kk......kk"]
};
const COLORS: Record<string, string> = { w: "#ffffff", r: "#c8302b", s: "#f1c27d", e: "#1f1a17", b: "#2b4c8c", d: "#2a2a35", k: "#3b2a20" };
const DIM: Record<Phase, number> = { day: 0, evening: 0.12, twilight: 0.18, night: 0.25 };

export interface Look {
  /** "viking": an iron helmet over the hat, pompom on top, and a short cape. */
  outfit?: "plain" | "viking";
  /** The helmet in gold, for a finished run. */
  gold?: boolean;
}

// The viking outfit changes the two hat rows and adds a cape; everything else is the same person.
// Letters: i helmet dome, l one lighter highlight pixel per row, r the rim (full width), n nose guard, c cape. Drawn facing right, mirrored otherwise.
const HELMET_ROWS = ["...ilii...", "..rlrrrr.."];

/** The sprite rows for a look, in the same 10 x 14 box as the plain person. */
function rowsFor(look: Look | undefined): string[] {
  if (look?.outfit !== "viking") return SPRITE;
  const rows = SPRITE.slice();
  rows[1] = HELMET_ROWS[0];
  rows[2] = HELMET_ROWS[1];
  rows[3] = "..ssssns.."; // nose guard: one iron pixel down the face
  // The cape hangs behind the back, rows 6 to 9, joined to the body so it never floats.
  const cape = [1, 0, 0, 1];
  for (let i = 0; i < 4; i++) {
    const r = 6 + i;
    const row = rows[r].split("");
    row[cape[i]] = "c";
    rows[r] = row.join("");
  }
  return rows;
}

/** Calls `dot` for every pixel of the player, as column and row within the sprite. */
export function playerPixels(b: Body, walkSteps: number, phase: Phase, dot: (c: number, r: number, color: string) => void, look?: Look) {
  const legs = !b.onGround ? LEGS.air : walkSteps ? (Math.floor(walkSteps / 6) % 2 ? LEGS.walk1 : LEGS.walk2) : LEGS.stand;
  const dome = look?.gold ? GOLD : PALETTE.ironDark;
  const rim = look?.gold ? mix(GOLD, "#000000", 0.38) : PALETTE.ironDark; // gold keeps a darker rim, so it still reads as a helmet
  const colors: Record<string, string> = look?.outfit === "viking" ? { ...COLORS, i: dome, r: rim, l: mix(dome, "#ffffff", 0.35), n: rim, c: PALETTE.woodDark } : COLORS;
  rowsFor(look)
    .concat(legs)
    .forEach((row, r) => {
      for (let c = 0; c < PLAYER.w; c++) {
        const ch = row[b.facing > 0 ? c : PLAYER.w - 1 - c];
        if (ch !== ".") dot(c, r, mix(colors[ch], "#141c46", DIM[phase]));
      }
    });
}
