import { INK, PALETTE, WOOL_SHADE } from "@larshansen/pixelkit/palette";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import type { RuneSpot } from "../game/level";
import { SHEEP, type Sheep } from "../game/sheep";
import { runeCells, type RuneChar } from "../game/runes";

// The things that move or can be picked up: sheep, and the ten runes on their small floating stones.

const P = PALETTE;
const EDGE = mix(P.rockDark, INK, 0.5);

// A sheep facing right: wool (w), a dark face and ears (f), and legs (k). Twelve across, seven down.
const SHEEP_ROWS = [".wwwwww.....", "wwwwwwwww.ff", "wwwwwwwwwfff", "wwwwwwwwwwff", ".wwwwwwww.f.", "..k.k..k.k..", "..k.k..k.k.."];
const SHEEP_COLORS: Record<string, string> = { w: P.wool, f: P.woodDark, k: INK };

function sheep(s: Sheep) {
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

function rune(r: RuneSpot, collected: boolean, steps: number) {
  const { x, y } = r;
  if (collected) {
    // A faint outline is all that is left.
    const ghost = "rgba(255, 255, 255, 0.28)";
    R(x + 2, y + 1, 12, 1, ghost);
    R(x + 2, y + 14, 12, 1, ghost);
    R(x + 1, y + 2, 1, 12, ghost);
    R(x + 14, y + 2, 1, 12, ghost);
    return;
  }
  // The stone bobs one pixel, up and down.
  const b = view.reduced ? 0 : Math.sin(steps * 0.05 + r.index * 1.3) > 0 ? 0 : 1;
  R(x + 2, y + 1 + b, 12, 1, EDGE);
  R(x + 1, y + 2 + b, 14, 12, EDGE);
  R(x + 2, y + 14 + b, 12, 1, EDGE);
  R(x + 2, y + 2 + b, 12, 12, P.rockDark);
  R(x + 2, y + 2 + b, 12, 1, P.rock);
  R(x + 2, y + 2 + b, 1, 12, P.rock);
  runeCells(r.char as RuneChar, 9, 11).forEach((row, ry) =>
    row.forEach((on, rx) => {
      if (!on) return;
      R(x + 4 + rx, y + 3 + b + ry, 1, 1, P.runeGlow);
      light(x + 4 + rx, y + 3 + b + ry, 1, 1, "soft");
    })
  );
}

export function drawActors(flock: Sheep[], runes: RuneSpot[], mask: number, steps: number) {
  for (const s of flock) sheep(s);
  for (const r of runes) rune(r, (mask & (1 << r.index)) !== 0, steps);
}
