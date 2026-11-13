import { GHOST, INK, METAL, PALETTE, WHITE, WOOL_SHADE } from "@larshansen/pixelkit/palette";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { SHEEP, type Sheep } from "../game/sheep";
import { runeCells, type RuneChar } from "../game/runes";

// The things that move or can be picked up: sheep, the runes on their small floating stones, and
// the gold bracteates.

const P = PALETTE;
const EDGE = mix(P.rockDark, INK, 0.5);

// A sheep facing right: wool (w), a dark face and ears (f), and legs (k). Twelve across, seven down.
const SHEEP_ROWS = [".wwwwww.....", "wwwwwwwww.ff", "wwwwwwwwwfff", "wwwwwwwwwwff", ".wwwwwwww.f.", "..k.k..k.k..", "..k.k..k.k.."];
const SHEEP_COLORS: Record<string, string> = { w: P.wool, f: P.woodDark, k: INK };

export function drawSheep(s: Sheep) {
  const left = Math.round(s.x - SHEEP.w / 2);
  const top = s.bottom - SHEEP.h;
  const squash = s.squash > 0 ? 1 : 0;
  SHEEP_ROWS.forEach((row, r) => {
    if (squash && r === 0) return; // flattened by a landing: the back is one pixel lower
    for (let c = 0; c < SHEEP.w; c++) {
      const ch = row[s.dir > 0 ? c : SHEEP.w - 1 - c];
      if (ch === ".") continue;
      // Grazing: the head goes down to the grass.
      const dip = s.grazing > 0 && (s.dir > 0 ? c >= 9 : c < SHEEP.w - 9) && ch === "f" ? 2 : 0;
      const shade = ch === "w" && r >= 3 ? mix(P.wool, WOOL_SHADE, 0.35) : SHEEP_COLORS[ch];
      R(left + c, top + r + dip + (ch === "k" ? 0 : squash), 1, 1, shade);
    }
  });
}

/**
 * A rune on its small stone, 16 x 16 from (x, y). "lit": glowing, and it bobs; "dark": carved, not
 * found yet (the line map); "ghost": taken, a faint outline left behind.
 */
export function drawRune(x: number, y: number, char: string, state: "lit" | "dark" | "ghost", steps: number, seed = 0) {
  if (state === "ghost") {
    const ghost = GHOST;
    R(x + 2, y + 1, 12, 1, ghost);
    R(x + 2, y + 14, 12, 1, ghost);
    R(x + 1, y + 2, 1, 12, ghost);
    R(x + 14, y + 2, 1, 12, ghost);
    return;
  }
  // The stone bobs one pixel, up and down, while its rune glows.
  const b = state === "lit" && !view.reduced ? (Math.sin(steps * 0.05 + seed * 1.3) > 0 ? 0 : 1) : 0;
  R(x + 2, y + 1 + b, 12, 1, EDGE);
  R(x + 1, y + 2 + b, 14, 12, EDGE);
  R(x + 2, y + 14 + b, 12, 1, EDGE);
  R(x + 2, y + 2 + b, 12, 12, P.rockDark);
  R(x + 2, y + 2 + b, 12, 1, P.rock);
  R(x + 2, y + 2 + b, 1, 12, P.rock);
  const carve = mix(P.rockDark, INK, 0.45);
  runeCells(char as RuneChar, 9, 11).forEach((row, ry) =>
    row.forEach((on, rx) => {
      if (!on) return;
      R(x + 4 + rx, y + 3 + b + ry, 1, 1, state === "lit" ? P.runeGlow : carve);
      if (state === "lit") light(x + 4 + rx, y + 3 + b + ry, 1, 1, "soft");
    })
  );
}

// A gold bracteate, 12 x 12: a thin gold disc with a raised rim and a stamped beast in the middle,
// hung on a loop. It turns slowly (narrower, then full), and a glint runs over it.
const BRACTEATE = ["....rrrr....", "..rrggggrr..", ".rgghgghggr.", ".rggssssggr.", "rgggsddsgggr", "rghgsdsdghgr", "rgggsdddgggr", "rghgssssghgr", ".rggggggggr.", ".rgghgghggr.", "..rrggggrr..", "....rrrr...."];

export function drawBracteate(x: number, y: number, steps: number) {
  const turn = view.reduced ? 1 : Math.abs(Math.cos(steps * 0.03));
  const w = Math.max(2, Math.round(12 * (0.35 + 0.65 * turn)));
  const left = x + Math.floor((12 - w) / 2);
  const bob = view.reduced ? 0 : Math.round(Math.sin(steps * 0.06));
  const colors: Record<string, string> = { r: METAL.goldDark, g: METAL.gold, h: METAL.goldLight, s: METAL.goldLight, d: METAL.goldDark };
  // The loop it hangs from.
  R(x + 5, y - 2 + bob, 2, 2, METAL.goldDark);
  for (let r = 0; r < 12; r++)
    for (let c = 0; c < w; c++) {
      const ch = BRACTEATE[r][Math.min(11, Math.floor((c * 12) / w))];
      if (ch !== ".") R(left + c, y + r + bob, 1, 1, colors[ch]);
    }
  // A glint crosses it now and then.
  const g = (steps % 150) - 20;
  if (!view.reduced && g >= 0 && g < w) R(left + g, y + 2 + bob, 1, 8, mix(METAL.goldLight, WHITE, 0.6));
  light(left, y + bob, w, 12, "soft");
}
