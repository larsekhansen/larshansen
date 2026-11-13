import { PLAYER } from "./config";
import type { Phase } from "./oslo";
import type { Body } from "./physics";
import { mix } from "./paint";
import { GOLD, INK, LAMP, PALETTE } from "./palette";

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
  /**
   * The helmet apart from the head, for the moments of putting it on and taking it off (viking outfit).
   * Left out: it is worn. A number: art pixels above the head (0 is worn). `null`: not drawn at all.
   */
  helmetOffset?: number | null;
  /** How many of the cape's four rows are shown (viking outfit). Left out: all four. */
  capeRows?: number;
  /** The helmet in gold, for a finished run. */
  gold?: boolean;
  /** "side" is the 10 x 14 person of the platform scenes; "top" is him seen from above, 8 x 8, in the maze. */
  view?: "side" | "top";
  /** Which way he faces, in the top view: the torch is in the hand on that side. */
  heading?: { x: number; y: number };
  /** Rust red all over, while the iron curse has him (top view). */
  cursed?: boolean;
}

/** The size of the top view's box. */
export const TOP_SIZE = 10;

// From above: an iron helmet disc with a dark outline, the white pompom its centre, sweater-blue
// shoulders either side, and a torch in one hand. 10 x 10, built from a pixel circle.
// o outline, i helmet, l a lighter helmet pixel, w pompom, b shoulder, h hand, f flame.
/** Rows of the left and right shoulder pixels (columns 0 and 9), per walk frame. */
const SHOULDERS = {
  stand: { left: [3, 4, 5, 6], right: [3, 4, 5, 6] },
  walk1: { left: [4, 5, 6, 7], right: [2, 3, 4, 5] },
  walk2: { left: [2, 3, 4, 5], right: [4, 5, 6, 7] }
};

function topPixels(walkSteps: number, phase: Phase, dot: (c: number, r: number, color: string) => void, look: Look) {
  const frame = walkSteps ? (Math.floor(walkSteps / 7) % 2 ? SHOULDERS.walk1 : SHOULDERS.walk2) : SHOULDERS.stand;
  const dome = look.gold ? GOLD : PALETTE.iron;
  const colors: Record<string, string> = { o: INK, i: dome, l: mix(dome, "#ffffff", 0.4), w: "#ffffff", b: COLORS.b, h: COLORS.s, f: LAMP };
  const grid: string[][] = Array.from({ length: 10 }, () => Array<string>(10).fill("."));
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) {
      const dx = c - 4.5;
      const dy = r - 4.5;
      const d = Math.hypot(dx, dy);
      if (d > 4.1) continue;
      grid[r][c] = d > 3.3 ? "o" : dx + dy < -2.6 ? "l" : "i";
    }
  for (const r of frame.left) grid[r][0] = "b";
  for (const r of frame.right) grid[r][9] = "b";
  for (const r of [4, 5]) for (const c of [4, 5]) grid[r][c] = "w";
  // The torch: a skin pixel on the rim, to the right of where he faces, and the flame beside it.
  const h = look.heading ?? { x: 1, y: 0 };
  const a = Math.atan2(h.y, h.x) + 0.6;
  const at = (rad: number) => [Math.max(0, Math.min(9, Math.round(4.5 + Math.cos(a) * rad - 0.0))), Math.max(0, Math.min(9, Math.round(4.5 + Math.sin(a) * rad)))];
  const hand = at(4.2);
  const flame = at(5.3);
  grid[hand[1]][hand[0]] = "h";
  grid[flame[1]][flame[0]] = "f";
  const rust = look.cursed ? PALETTE.curseBright : null;
  grid.forEach((row, r) =>
    row.forEach((ch, c) => {
      if (ch === ".") return;
      const color = mix(colors[ch], "#141c46", DIM[phase]);
      dot(c, r, rust ? mix(color, rust, 0.8) : color);
    })
  );
}

// The viking outfit changes the two hat rows and adds a cape; everything else is the same person.
// Letters: i helmet dome, l one lighter highlight pixel per row, r the rim (full width), n nose guard, c cape. Drawn facing right, mirrored otherwise.
const HELMET_ROWS = ["...ilii...", "..rlrrrr.."];

/** True while the helmet is not sitting on the head: it floats above it, or is not there. */
function helmetLoose(look: Look | undefined): boolean {
  if (look?.outfit !== "viking" || look.helmetOffset === undefined) return false;
  return look.helmetOffset === null || look.helmetOffset > 0;
}

/** The sprite rows for a look, in the same 10 x 14 box as the plain person. */
function rowsFor(look: Look | undefined): string[] {
  if (look?.outfit !== "viking") return SPRITE;
  const rows = SPRITE.slice();
  if (!helmetLoose(look)) {
    rows[1] = HELMET_ROWS[0];
    rows[2] = HELMET_ROWS[1];
    rows[3] = "..ssssns.."; // nose guard: one iron pixel down the face
  }
  // The cape hangs behind the back, rows 6 to 9, joined to the body so it never floats.
  const cape = [1, 0, 0, 1];
  const shown = Math.max(0, Math.min(4, look.capeRows ?? 4));
  for (let i = 0; i < shown; i++) {
    const r = 6 + i;
    const row = rows[r].split("");
    row[cape[i]] = "c";
    rows[r] = row.join("");
  }
  return rows;
}

function vikingColors(look: Look | undefined): Record<string, string> {
  const dome = look?.gold ? GOLD : PALETTE.ironDark;
  const rim = look?.gold ? mix(GOLD, "#000000", 0.38) : PALETTE.ironDark; // gold keeps a darker rim, so it still reads as a helmet
  return { ...COLORS, i: dome, r: rim, l: mix(dome, "#ffffff", 0.35), n: rim, c: PALETTE.woodDark };
}

/**
 * Just the helmet (its two rows and the nose guard), as it is when it is not on his head. `row` is the
 * sprite row its first row sits on: 1 is where it is worn. Calls `dot` as column and row, like the person.
 */
export function helmetPixels(facing: number, phase: Phase, dot: (c: number, r: number, color: string) => void, row = 1, look?: Look) {
  const colors = vikingColors(look);
  const flip = (c: number) => (facing > 0 ? c : PLAYER.w - 1 - c);
  HELMET_ROWS.forEach((cells, i) => {
    for (let c = 0; c < PLAYER.w; c++) {
      const ch = cells[flip(c)];
      if (ch !== ".") dot(c, row + i, mix(colors[ch], "#141c46", DIM[phase]));
    }
  });
  dot(facing > 0 ? 6 : PLAYER.w - 1 - 6, row + 2, mix(colors.n, "#141c46", DIM[phase]));
}

/** Calls `dot` for every pixel of the player, as column and row within the sprite. */
export function playerPixels(b: Body, walkSteps: number, phase: Phase, dot: (c: number, r: number, color: string) => void, look?: Look) {
  if (look?.view === "top") return topPixels(walkSteps, phase, dot, look);
  const legs = !b.onGround ? LEGS.air : walkSteps ? (Math.floor(walkSteps / 6) % 2 ? LEGS.walk1 : LEGS.walk2) : LEGS.stand;
  // With the helmet apart from his head the hat shows, in its own red: the viking colours turn the hat's `r` into the rim.
  const loose = helmetLoose(look);
  const colors: Record<string, string> = look?.outfit === "viking" ? (loose ? { ...COLORS, c: PALETTE.woodDark } : vikingColors(look)) : COLORS;
  rowsFor(look)
    .concat(legs)
    .forEach((row, r) => {
      for (let c = 0; c < PLAYER.w; c++) {
        const ch = row[b.facing > 0 ? c : PLAYER.w - 1 - c];
        if (ch !== ".") dot(c, r, mix(colors[ch], "#141c46", DIM[phase]));
      }
    });
  if (loose && look?.helmetOffset != null) helmetPixels(b.facing, phase, dot, 1 - Math.round(look.helmetOffset), look);
}
