import { R, view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { TILE } from "@larshansen/pixelkit/config";
import { frame, stamp, type Frame } from "./frames";

// What the Neon Invaders left in Oslo (order 27, section 3; ADR 0050): evidence of the glamour that he cannot touch,
// standing in the scenery behind the lane (ADR 0039, 0044), a few in each level, never near a jump he must read (the test
// holds it: `invasion.test.ts`), each a picture painted once and copied. A pink flamingo on a lawn; a neon sign on a pole,
// a heart in tubes that buzzes now and then; a poster on its stand for the Invaders' front man (LOKI over a striped
// sunset and his silhouette, horned and with the hair); a mirror ball turning on a cable from one of Bjørvika's cranes.
// Over the line map, a mirror ball over every station still under the glamour (`kartArt.ts`). Loki is seen no nearer
// than his poster; meeting him is for later.

const INK: Record<string, string> = {
  N: ENEMY.hotPink,
  n: ENEMY.blue,
  X: ENEMY.magenta,
  V: ENEMY.purple,
  v: ENEMY.purpleDark,
  O: ENEMY.orange,
  L: ENEMY.lime,
  l: ENEMY.line,
  a: ENEMY.pale,
  /** The dark of a sign's board and the poster's night. */
  D: "#1c1030",
  /** A mirror ball's silvers, light to dark, and its glint. */
  S: "#d6dce8",
  s: "#9aa3b4",
  t: "#5f6878",
  W: "#ffffff",
  /** Metal of a pole or a stand. */
  m: "#4a4e58"
};
const make = (name: string, rows: readonly string[]) => frame(name, INK, [rows]);

/** A pink plastic flamingo on one leg, its head turned, 8 x 14 from its foot. */
const FLAMINGO = make("flamingo", [
  "...NN...",
  "..NNNl..",
  "..N..ll.",
  "...N....",
  "...N....",
  "..N.....",
  ".NNNNN..",
  "NNXNNNN.",
  ".vNNNNv.",
  "...l....",
  "...l....",
  "..ll....",
  "...l....",
  "..lll..."
]);

/** A neon sign on a pole, 12 x 18: a heart in tubes on a dark board; now and then a tube flickers. */
const HEART = ["llllllllllll", "lD.NN..NN.Dl", "lDN..NN..NDl", "lDN......NDl", "lD.N....N.Dl", "lD..N..N..Dl", "lDD..NN..DDl", "llllllllllll"].map((r) => r.replace(/\./g, "D"));
const POLE = [".....mm.....", ".....mm.....", ".....mm.....", ".....mm.....", ".....mm.....", ".....mm.....", ".....mm.....", ".....mm.....", "....mmmm....", "...mmmmmm..."];
const SIGNS = [make("neon sign", [...HEART, ...POLE]), make("neon sign, a tube flickering", [...HEART.map((r, i) => (i === 2 || i === 3 ? r.replace(/N/g, (_m, k: number) => (k < 6 ? "X" : "N")) : r)), ...POLE])];

/** The Invaders' poster on its stand, 16 x 21: LOKI in lime, a striped sunset, his silhouette (horns, the hair). */
const POSTER = make("poster", [
  "llllllllllllllll",
  "lDLDDLLLDLDLDLDl",
  "lDLDDLDLDLDLDLDl",
  "lDLDDLDLDLLDDLDl",
  "lDLDDLDLDLDLDLDl",
  "lDLLDLLLDLDLDLDl",
  "lDDDDDDDDDDDDDDl",
  "lDDDDDXXXXDDDDDl",
  "lDDDXXlXXlXXDDDl",
  "lDDXXlllllXXXDDl",
  "lDDOOlllllllOODl",
  "lDDDDlllllllDDDl",
  "lDOOllllllllOODl",
  "lDDDlllllllllDDl",
  "lDOlllllllllllDl",
  "llllllllllllllll",
  "..m..........m..",
  "..m..........m..",
  "..m..........m..",
  "..m..........m..",
  ".mmm........mmm."
]);

/** A mirror ball, 9 x 9, turning: its facets light and dark in a check, a glint and a neon glint going round (three frames). */
const BALL: Frame[] = [0, 1, 2].map((k) =>
  make(
    `mirror ball ${k + 1}`,
    Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => {
        const d = Math.hypot(c - 4, r - 4);
        if (d > 4.4) return ".";
        if (r === [2, 4, 6][k] && c === [3, 5, 2][k]) return "W";
        if (r === [6, 2, 3][k] && c === [5, 3, 6][k]) return "N";
        return d > 3.6 ? "t" : (c + r + k) % 2 ? "S" : "s";
      }).join("")
    )
  )
);

export type Piece = "flamingo" | "sign" | "poster" | "ball";
/** The pieces' sizes: their width, and their height from where they stand. */
export const SIZE: Record<Piece, { w: number; h: number }> = { flamingo: { w: 8, h: 14 }, sign: { w: 12, h: 18 }, poster: { w: 16, h: 21 }, ball: { w: 9, h: 9 } };

/**
 * Where they stand, by level: a column and the row of the ground they stand on (their foot on its top), chosen with
 * `tools/glance/invasion.ts`. A mirror ball's row is where it hangs, its cable going up `cable` tiles to the jib.
 */
export const PLACES: Record<string, { c: number; r: number; kind: Piece; cable?: number }[]> = {
  langkaia: [{ c: 18, r: 16, kind: "poster" }, { c: 181, r: 16, kind: "sign" }],
  akershus: [{ c: 50, r: 35, kind: "poster" }, { c: 132, r: 35, kind: "sign" }],
  radhuset: [{ c: 46, r: 48, kind: "poster" }, { c: 100, r: 48, kind: "sign" }],
  slottet: [{ c: 66, r: 25, kind: "flamingo" }, { c: 113, r: 23, kind: "poster" }, { c: 195, r: 20, kind: "sign" }],
  holmenkollen: [{ c: 63, r: 10, kind: "sign" }, { c: 155, r: 16, kind: "poster" }, { c: 218, r: 25, kind: "flamingo" }],
  akerselva: [{ c: 83, r: 12, kind: "flamingo" }, { c: 124, r: 12, kind: "poster" }, { c: 166, r: 26, kind: "sign" }],
  nordmarka: [{ c: 67, r: 18, kind: "sign" }, { c: 118, r: 18, kind: "flamingo" }, { c: 182, r: 18, kind: "poster" }],
  stortinget: [{ c: 58, r: 18, kind: "poster" }, { c: 149, r: 18, kind: "sign" }, { c: 230, r: 16, kind: "poster" }],
  ekeberg: [{ c: 60, r: 12, kind: "flamingo" }, { c: 130, r: 12, kind: "sign" }, { c: 199, r: 8, kind: "poster" }],
  nabolaget: [{ c: 115, r: 10, kind: "poster" }, { c: 181, r: 17, kind: "flamingo" }],
  bygdoy: [{ c: 66, r: 19, kind: "flamingo" }, { c: 204, r: 11, kind: "poster" }],
  vigelandsparken: [{ c: 64, r: 20, kind: "flamingo" }, { c: 120, r: 20, kind: "poster" }, { c: 195, r: 12, kind: "sign" }],
  korketrekkeren: [{ c: 28, r: 12, kind: "sign" }, { c: 252, r: 35, kind: "flamingo" }],
  ostensjovannet: [{ c: 15, r: 19, kind: "poster" }, { c: 131, r: 19, kind: "flamingo" }, { c: 208, r: 19, kind: "sign" }],
  // The mirror ball hangs on its cable from the second crane's jib (row 3), over the site.
  bjorvika: [{ c: 60, r: 18, kind: "poster" }, { c: 147, r: 14, kind: "sign" }, { c: 158, r: 7, kind: "ball", cable: 3 }],
  gamlebyen: [{ c: 80, r: 15, kind: "poster" }, { c: 136, r: 17, kind: "sign" }, { c: 188, r: 12, kind: "flamingo" }]
};

/** Draws a mirror ball turning, its middle at (x, y), on a cable `up` pixels long. */
export function mirrorBall(x: number, y: number, t: number, up = 0) {
  if (up > 0) R(Math.round(x), Math.round(y - 4 - up), 1, up, INK.t);
  stamp(BALL[view.reduced ? 0 : Math.floor(t / 8) % 3], Math.round(x - 4), Math.round(y - 4));
}

/** The level's evidence of the invasion, behind the lane: what is on the screen, each one copy. */
export function invasion(level: string, t: number) {
  const list = PLACES[level];
  if (!list) return;
  for (const p of list) {
    const s = SIZE[p.kind];
    const x = p.c * TILE + TILE / 2 - Math.floor(s.w / 2);
    const foot = p.r * TILE;
    if (x + s.w < view.camX - 8 || x > view.camX + view.w + 8) continue;
    if (p.kind === "flamingo") stamp(FLAMINGO, x, foot - s.h);
    else if (p.kind === "sign") stamp(SIGNS[!view.reduced && Math.floor(t / 7) % 23 === 0 ? 1 : 0], x, foot - s.h);
    else if (p.kind === "poster") stamp(POSTER, x, foot - s.h);
    else mirrorBall(x + 4, foot - 4, t, (p.cable ?? 3) * TILE);
  }
}
