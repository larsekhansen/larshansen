import { box, lit } from "./backdrop";
import { FACADE } from "./palette";

// Landmarks of Bjørvika that more than one scene shows: MUNCH and the Barcode. Drawn in a far
// layer's own pixels (see backdrop.ts) with their feet at world y `base`.

export function munch(x: number, base: number) {
  // A tall aluminium-clad tower whose top bends towards the fjord.
  box(x - 9, base - 78, 18, 78, FACADE.aluminium);
  box(x - 6, base - 96, 18, 20, FACADE.aluminium);
  for (let y = base - 76; y < base; y += 4) box(x - 9, y, 18, 1, FACADE.aluminiumLine);
  for (let y = base - 94; y < base - 78; y += 4) box(x - 6, y, 18, 1, FACADE.aluminiumLine);
  box(x - 3, base - 92, 12, 3, FACADE.munchWindow);
  lit(x - 3, base - 92, 12, 3);
}

// The Barcode: a row of slim towers with narrow gaps between them, light and dark,
// each with its own stripes, like the bars of a barcode.
const BARCODE = [
  { dx: 0, w: 9, h: 62, color: "#e9edef", stripe: "#a7b1b7", dark: false },
  { dx: 11, w: 7, h: 78, color: "#26303a", stripe: "#3a4652", dark: true },
  { dx: 20, w: 10, h: 70, color: "#d4dadd", stripe: "#8c98a0", dark: false },
  { dx: 32, w: 6, h: 86, color: "#f1e9dc", stripe: "#b9ab95", dark: false },
  { dx: 40, w: 9, h: 74, color: "#1f272f", stripe: "#34404b", dark: true },
  { dx: 51, w: 8, h: 66, color: "#c3ccd1", stripe: "#7d8a92", dark: false },
  { dx: 61, w: 10, h: 82, color: "#eef1f2", stripe: "#a3adb3", dark: false },
  { dx: 73, w: 7, h: 72, color: "#2c3742", stripe: "#46525e", dark: true },
  { dx: 82, w: 9, h: 64, color: "#dfe5e8", stripe: "#95a1a8", dark: false },
  { dx: 93, w: 8, h: 76, color: "#384450", stripe: "#4f5c69", dark: true }
];

export function barcode(x: number, base: number) {
  for (const b of BARCODE) {
    const bx = x + b.dx;
    box(bx, base - b.h, b.w, b.h, b.color);
    for (let i = 1; i < b.w; i += 2) box(bx + i, base - b.h, 1, b.h, b.stripe);
    if (b.dark) for (let y = base - b.h + 6; y < base - 4; y += 12) lit(bx + 1, y, b.w - 2, 2);
  }
}
