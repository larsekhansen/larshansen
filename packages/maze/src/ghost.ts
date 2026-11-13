// The ghost of his best run on a level: where he was on every step of the level clock, so a later
// attempt can show him walking beside it. Kept in localStorage as `maze.ghost.<level>`, compact:
// positions in half art pixels, each step written as one character for its small move, runs of the
// same move as that character and a count, and the rare long jump (a teleport, waking at a stone)
// written out in full. Three minutes at most, so a ghost stays well under 20 kB.

import type { Store } from "./records";

/** The most steps a ghost keeps: three minutes at 60 steps a second. */
export const GHOST_MAX_STEPS = 3 * 60 * 60;
export const GHOST_PREFIX = "maze.ghost.";
/** Positions are kept in units of half an art pixel. */
const UNIT = 2;
const HEADER = "g1:";
/** The largest move, in units, written as one character: a step is at most 1.6 art pixels, so 4 half pixels after rounding. */
const SMALL = 4;
const SPAN = SMALL * 2 + 1;
/** One character per small move (dx, dy in -4..4): printable ASCII without digits (they are run counts), "," ";" and "~". */
const ALPHABET = (() => {
  let out = "";
  for (let code = 33; code < 126; code++) {
    const ch = String.fromCharCode(code);
    if (!/[0-9,;]/.test(ch)) out += ch;
  }
  return out;
})();
const JUMP = "~";

/** A run of steps as numbers: x0, y0, x1, y1, ... in half art pixels. */
export type GhostPoints = Int16Array;

/** Records one run as it happens. */
export function createRecorder() {
  let data = new Int16Array(GHOST_MAX_STEPS * 2);
  let n = 0;
  return {
    /** His centre after a step, in art pixels. Ignored past three minutes. */
    push(x: number, y: number) {
      if (n >= GHOST_MAX_STEPS) return;
      data[n * 2] = Math.max(0, Math.round(x * UNIT));
      data[n * 2 + 1] = Math.max(0, Math.round(y * UNIT));
      n++;
    },
    reset() {
      n = 0;
    },
    get length() {
      return n;
    },
    /** A copy of what has been recorded. */
    points(): GhostPoints {
      return data.slice(0, n * 2);
    },
    /** Frees the buffer for a recorder that will not be used again. */
    drop() {
      data = new Int16Array(0);
      n = 0;
    }
  };
}

/** Writes a run as text. */
export function encodeGhost(points: GhostPoints): string {
  const n = Math.min(GHOST_MAX_STEPS, Math.floor(points.length / 2));
  if (n === 0) return HEADER;
  const at = (x: number, y: number) => `${x.toString(36)},${y.toString(36)};`;
  let out = HEADER + at(points[0], points[1]);
  let run = "";
  let count = 0;
  const flush = () => {
    if (count === 0) return;
    out += count >= 3 ? run + count : run.repeat(count);
    count = 0;
  };
  for (let i = 1; i < n; i++) {
    const dx = points[i * 2] - points[i * 2 - 2];
    const dy = points[i * 2 + 1] - points[i * 2 - 1];
    if (Math.abs(dx) > SMALL || Math.abs(dy) > SMALL) {
      flush();
      out += JUMP + at(points[i * 2], points[i * 2 + 1]);
      continue;
    }
    const ch = ALPHABET[(dx + SMALL) * SPAN + dy + SMALL];
    if (ch === run) count++;
    else {
      flush();
      run = ch;
      count = 1;
    }
  }
  flush();
  return out;
}

/** Reads a run written by `encodeGhost`; null for anything else. */
export function decodeGhost(text: string | null | undefined): GhostPoints | null {
  if (typeof text !== "string" || !text.startsWith(HEADER)) return null;
  const out: number[] = [];
  let i = HEADER.length;
  /** Reads "x,y;" in base 36 at i. */
  const readAt = (): [number, number] | null => {
    const end = text.indexOf(";", i);
    if (end < 0) return null;
    const parts = text.slice(i, end).split(",");
    if (parts.length !== 2 || !parts.every((p) => /^[0-9a-z]+$/.test(p))) return null;
    i = end + 1;
    return [parseInt(parts[0], 36), parseInt(parts[1], 36)];
  };
  if (i === text.length) return new Int16Array(0);
  const first = readAt();
  if (!first) return null;
  out.push(...first);
  while (i < text.length && out.length < GHOST_MAX_STEPS * 2) {
    const ch = text[i++];
    if (ch === JUMP) {
      const p = readAt();
      if (!p) return null;
      out.push(...p);
      continue;
    }
    const code = ALPHABET.indexOf(ch);
    if (code < 0) return null;
    let digits = "";
    while (i < text.length && text[i] >= "0" && text[i] <= "9") digits += text[i++];
    const times = digits ? Number(digits) : 1;
    const dx = Math.floor(code / SPAN) - SMALL;
    const dy = (code % SPAN) - SMALL;
    for (let k = 0; k < times && out.length < GHOST_MAX_STEPS * 2; k++) {
      const x = out[out.length - 2];
      const y = out[out.length - 1];
      out.push(x + dx, y + dy);
    }
  }
  return Int16Array.from(out);
}

/** Where the ghost is at step `i` of the level clock, blended `alpha` of the way to the next step; null once its run is over. In art pixels. */
export function ghostAt(points: GhostPoints, i: number, alpha = 0): { x: number; y: number } | null {
  const n = points.length / 2;
  if (i < 0 || i >= n) return null;
  const j = Math.min(n - 1, i + 1);
  const ax = points[i * 2];
  const ay = points[i * 2 + 1];
  const bx = points[j * 2];
  const by = points[j * 2 + 1];
  // A long jump (a teleport) is not blended across.
  const far = Math.abs(bx - ax) > SMALL || Math.abs(by - ay) > SMALL;
  const t = far ? 0 : alpha;
  return { x: (ax + (bx - ax) * t) / UNIT, y: (ay + (by - ay) * t) / UNIT };
}

export function saveGhost(level: number, points: GhostPoints, store: Store | null) {
  try {
    store?.setItem(GHOST_PREFIX + level, encodeGhost(points));
  } catch {
    // kept for this visit only
  }
}

export function loadGhost(level: number, store: Store | null): GhostPoints | null {
  try {
    const points = decodeGhost(store?.getItem(GHOST_PREFIX + level));
    return points && points.length >= 2 ? points : null;
  } catch {
    return null;
  }
}
