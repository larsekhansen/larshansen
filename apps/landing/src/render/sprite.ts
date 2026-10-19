import { PLAYER } from "../game/config";
import type { Phase } from "../game/oslo";
import type { Body } from "../game/physics";
import { mix } from "./paint";

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

/** Calls `dot` for every pixel of the player, as column and row within the sprite. */
export function playerPixels(b: Body, walkSteps: number, phase: Phase, dot: (c: number, r: number, color: string) => void) {
  const legs = !b.onGround ? LEGS.air : walkSteps ? (Math.floor(walkSteps / 6) % 2 ? LEGS.walk1 : LEGS.walk2) : LEGS.stand;
  SPRITE.concat(legs).forEach((row, r) => {
    for (let c = 0; c < PLAYER.w; c++) {
      const ch = row[b.facing > 0 ? c : PLAYER.w - 1 - c];
      if (ch !== ".") dot(c, r, mix(COLORS[ch], "#141c46", DIM[phase]));
    }
  });
}
