// The Elder Futhark runes that spell LARS HANSEN (line 1) and VIKING (line 2), as strokes in a 1 x 1
// box, so no runic font is needed. `runeCells` (`runecells.ts`, with `feel`'s file: the first script only draws the
// header's strokes) turns the strokes into a small pixel grid with one-pixel lines. V is written with the u-rune
// (uruz), as the old inscriptions do.

export type RuneChar = "L" | "A" | "R" | "S" | "H" | "N" | "E" | "V" | "I" | "K" | "G";

/** The sixteen runes in the order of the lines: L A R S H A N S E N, then V I K I N G. */
export const RUNE_CHARS = "LARSHANSENVIKING";
type Stroke = [number, number][];

export const RUNE_STROKES: Record<RuneChar, Stroke[]> = {
  L: [
    [[0.35, 0], [0.35, 1]],
    [[0.35, 0], [0.78, 0.36]]
  ],
  A: [
    [[0.3, 0], [0.3, 1]],
    [[0.3, 0], [0.76, 0.3]],
    [[0.3, 0.3], [0.76, 0.6]]
  ],
  R: [
    [[0.27, 0], [0.27, 1]],
    [[0.27, 0], [0.72, 0.25], [0.27, 0.5], [0.76, 1]]
  ],
  S: [[[0.7, 0], [0.3, 0.34], [0.7, 0.62], [0.3, 1]]],
  H: [
    [[0.25, 0], [0.25, 1]],
    [[0.75, 0], [0.75, 1]],
    [[0.25, 0.36], [0.75, 0.64]]
  ],
  N: [
    [[0.5, 0], [0.5, 1]],
    [[0.24, 0.34], [0.76, 0.66]]
  ],
  E: [[[0.2, 1], [0.2, 0], [0.5, 0.36], [0.8, 0], [0.8, 1]]],
  // Uruz: a stem, and from its top a slope down to a shorter leg.
  V: [[[0.26, 1], [0.26, 0], [0.74, 0.34], [0.74, 1]]],
  // Isaz: one stroke.
  I: [[[0.5, 0], [0.5, 1]]],
  // Kaunan: a small angle, open to the right, in the upper half.
  K: [[[0.72, 0.08], [0.3, 0.4], [0.72, 0.72]]],
  // Gebo: a cross.
  G: [
    [[0.2, 0.06], [0.8, 0.94]],
    [[0.8, 0.06], [0.2, 0.94]]
  ]
};
