import type { Action, Input } from "./input";
import { seeded } from "./paint";

// A way to look at a scene where nothing fires animation frames (headless Firefox on the Pi).
// `?debug&steps=N` runs N physics steps at load, in one go, and then draws one frame; nothing moves
// after that. `&keys=r60,j1,r30` holds keys while stepping: r right, l left, j jump, u up, d dash,
// n nothing, each for the number of steps after it. Everything that moves on screen (water, smoke, clouds,
// snow) runs on the step count, the date is fixed and the dice are loaded, so two runs give the
// same pixels.

const LETTERS: Record<string, Action[]> = { r: ["right"], l: ["left"], j: ["jump"], u: ["up"], d: ["dash"], n: [] };
const KEYS: Action[] = ["left", "right", "jump", "up", "dash"];

/** The moment the frozen clock shows: midsummer, at noon in Oslo. */
export const FROZEN_NOW = new Date("2026-06-15T10:00:00Z");

/** "r60,j1,r30" as the actions held on each step, in order. */
export function parseKeys(script: string): Action[][] {
  const out: Action[][] = [];
  for (const part of script.split(",")) {
    const word = part.trim();
    if (!word) continue;
    const m = /^([a-z])(\d+)$/.exec(word);
    if (!m || !(m[1] in LETTERS)) throw new Error(`keys: cannot read "${word}"`);
    for (let i = 0; i < Number(m[2]); i++) out.push(LETTERS[m[1]]);
  }
  return out;
}

export interface Harness {
  steps: number;
  /** The actions held on each step; past the end of the script, nothing is held. */
  script: Action[][];
  now: Date;
}

/** The stepping asked for in the address, or null when the page runs as usual. Only under `?debug`. */
export function readHarness(params: URLSearchParams): Harness | null {
  if (!params.has("debug") || !params.has("steps")) return null;
  const steps = Math.max(0, Math.floor(Number(params.get("steps")) || 0));
  return { steps, script: parseKeys(params.get("keys") ?? ""), now: FROZEN_NOW };
}

/**
 * Runs the steps, holding the script's keys. Sparks and fireworks scatter with `Math.random`, so it
 * is swapped for a seeded one first: a stepped page is for looking at, never for playing.
 */
export function runHarness(h: Harness, input: Input, step: () => void) {
  Math.random = seeded(20261113);
  for (let i = 0; i < h.steps; i++) {
    const held = h.script[i] ?? [];
    for (const a of KEYS) input.hold(a, held.includes(a));
    step();
  }
  for (const a of KEYS) input.hold(a, false);
  input.endStep();
}
