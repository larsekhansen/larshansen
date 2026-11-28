import type { Sfx, Voice } from "@larshansen/pixelkit/sfx";

// The encore's tune (order 34, ADR 0052 amended, ADR 0055). Lars, of the encore: "the music has to be something like glam
// rock ... ideally there should be music". An original glam-rock tune made with the game's own synth (the kit's `voice`: a
// tone that slides from one pitch to another and dies away, or a burst of filtered noise), written down here as data: a
// stomping four-on-the-floor drum with claps on two and four, a bass on the root in eighths, a riff of power chords to shout
// along to, a lead that plays the chorus's hook and a short solo lick. Its own melody and its own chords: no real song, riff,
// lyric or nameable melody (ADR 0050, 0052).
//
// It follows the fight. As Loki wakes, one bar of intro (a crash and a ringing chord, toms falling into the band); then the
// sixteen bars of the loop, over and over, the whole band while he is glammed; one layer drops out with each piece of glamour
// knocked off (the wig: the lead; the shades: the riff; the jacket: the drums and the bass, and the band is gone); and as the
// stage lights go plain, a few plain notes on what sounds like an acoustic guitar, once. It plays through the page's sound,
// so it follows the sound switch, and nothing sounds before the first key or touch (the kit's synth has no sound until then).
// The page asks it once a frame while the level is played, and gives it no sound on a card, after he has left or while the
// page is hidden, and then it stops; muted, it schedules nothing. It comes with the encore's file (`vite.config.ts`, `OWN`).
//
// Time is the game's own: steps of a sixtieth of a second. A beat is 28 steps (about 129 beats a minute), so an eighth is
// 14 and a bar of four beats 112; the loop is sixteen bars (1,792 steps, about 30 seconds).

/** Steps in an eighth note, a beat and a bar (4/4, about 129 beats a minute). */
export const EIGHTH = 14;
export const BEAT = 2 * EIGHTH;
export const BAR = 4 * BEAT;
/** The intro: one bar, as he wakes. */
export const INTRO = BAR;
/** The loop: sixteen bars. */
export const LOOP_BARS = 16;
export const LOOP = LOOP_BARS * BAR;

/** The band's instruments, and the layers that drop out as he is hit: the lead first, then the riff, then the drums and bass together. */
export type Instrument = "drums" | "bass" | "riff" | "lead";
/** What plays with each number of hits taken: one layer fewer with each piece knocked off; none after the third. */
export const PLAYS_BY_HITS: readonly (readonly Instrument[])[] = [["drums", "bass", "riff", "lead"], ["drums", "bass", "riff"], ["drums", "bass"], []];

// --- The tune, bar by bar --------------------------------------------------------------------------------------------------
// Each bar is eight eighths. A "." is a rest. Pitches are semitones: the chords' roots from A (A2, 110 Hz, for the guitars and
// an octave lower for the bass), the lead's notes from A4 (440 Hz), the plain notes from A3 (220 Hz).
//
//   bars  1 to 4   the chorus: D  E  A  A                     the riff on every beat, the lead's hook over it
//   bars  5 to 12  the verse:  A  A  D  E  |  A  A  G  E      the riff stomping, the bass on the root, the drums
//   bars 13 to 16  the solo:   F  G  A  A                     the riff ringing, the lead's lick, a stop and a fill
// It starts on the chorus, so the lead (the first layer to go, with the wig) is heard before the first hit can come.

/** The power chords' roots, a bar each, in semitones from A. */
export const ROOTS: readonly number[] = [5, 7, 0, 0, 0, 0, 5, 7, 0, 0, -2, 7, -4, -2, 0, 0];

/** The riff: X a chord struck open and left to ring, x a short one damped by the palm. */
export const RIFF: readonly string[] = [
  "X.X.X.Xx", "X.X.X.Xx", "X.X.X.Xx", "X.X.XXX.",
  "X..xX..x", "X..xX.xx", "X..xX..x", "X.x.X.x.",
  "X..xX..x", "X..xX.xx", "X..xX..x", "X.X.XXXX",
  "X...X...", "X...X...", "X...X.x.", "X.....xx"
];

/** The bass: r the root, f its fifth, o its octave, a eighth each. */
export const BASS: readonly string[] = [
  "rrrrrrrr", "rrrrrrrr", "rrrrrrrr", "rrrrrrrr",
  "rrrrrrro", "rrrrrrro", "rrrrrrro", "rrrrrrfo",
  "rrrrrrro", "rrrrrrro", "rrrrrrro", "rrrrffoo",
  "r...r...", "r...r...", "r...r.r.", "r.....rr"
];

const FOUR = "k.k.k.k.";
const BACK = "..c...c.";
const HATS = "hhhhhhhh";
/** The drums, a bar each: the kick (k), the claps (c), and the hats (h, or C a crash). Four on the floor, claps on two and four. */
export const DRUMS: readonly (readonly [string, string, string])[] = [
  [FOUR, BACK, "Chhhhhhh"], [FOUR, BACK, HATS], [FOUR, BACK, HATS], [FOUR, "..c.c.cc", HATS],
  [FOUR, BACK, "Chhhhhhh"], [FOUR, BACK, HATS], [FOUR, BACK, HATS], [FOUR, BACK, HATS],
  [FOUR, BACK, HATS], [FOUR, BACK, HATS], [FOUR, BACK, HATS], [FOUR, "..c.cccc", "hhhh...."],
  [FOUR, BACK, "Chhhhhhh"], [FOUR, BACK, HATS], [FOUR, BACK, HATS], ["k.....kk", "....cccc", "C......."]
];

/**
 * The lead, by bar: [the eighth it starts on, semitones from A4, how many eighths, and where a bend takes it]. The chorus's
 * hook in bars 1 to 4 (E E F# E C#, B C# B G#, a climb to the high A, and a long E); the solo's lick in 13 to 15 (down
 * and up the pentatonic over F and G, a bend from D to E over A, and a held C#).
 */
export const LEAD: readonly (readonly (readonly [number, number, number, number?])[])[] = [
  [[0, 7, 2], [2, 7, 1], [3, 9, 1], [4, 7, 2], [6, 4, 2]],
  [[0, 2, 2], [2, 4, 1], [3, 2, 1], [4, -1, 4]],
  [[0, 0, 1], [1, 4, 1], [2, 7, 2], [4, 12, 2], [6, 9, 1], [7, 7, 1]],
  [[0, 7, 5], [6, 4, 1], [7, 2, 1]],
  [], [], [], [], [], [], [], [],
  [[0, 3, 1], [1, 5, 1], [2, 7, 1], [3, 5, 1], [4, 3, 1], [5, 0, 1], [6, 3, 2]],
  [[0, 5, 1], [1, 10, 1], [2, 12, 2], [4, 10, 1], [5, 7, 1], [6, 5, 2]],
  [[0, 5, 2, 7], [2, 4, 1], [3, 0, 1], [4, 4, 4]],
  []
];

/** The intro's bar, as he wakes: a crash and an A ringing on the one, then toms falling (G, E, D, B) into the band. */
export const INTRO_TOMS: readonly (readonly [number, number])[] = [[4, -14], [5, -17], [6, -19], [7, -22]];

/** As the stage lights go plain, once: an A played plainly, string by string (A3, E4, A4, C#5), then E and A. [eighth, semitones from A3] */
export const PLAIN: readonly (readonly [number, number])[] = [[0, 0], [2, 7], [4, 12], [6, 16], [10, 7], [12, 12]];
/** How long the plain notes take, in steps. */
export const PLAIN_STEPS = 14 * EIGHTH;

// --- The sounds ------------------------------------------------------------------------------------------------------------

const hz = (base: number, semis: number) => base * 2 ** (semis / 12);
const sec = (steps: number) => steps / 60;

/** Each sound of the band as the kit's synth's parts. Quieter than the game's own sounds: the band is under them. */
export const SOUND = {
  kick: [["t", "sine", 130, 45, 0.16, 0.22], ["n", 1500, 200, 0.02, 0.06]] as Voice[],
  clap: [["n", 3200, 1400, 0.1, 0.1], ["n", 3200, 1400, 0.08, 0.07, 0.012]] as Voice[],
  hat: [["n", 11000, 7000, 0.03, 0.04]] as Voice[],
  crash: [["n", 12000, 2500, 1.1, 0.06]] as Voice[],
  tom: (semis: number): Voice[] => [["t", "sine", hz(440, semis), hz(440, semis) * 0.6, 0.18, 0.22]],
  /** The bass: a square for its edge and a triangle for its body, an eighth long. */
  bass: (semis: number): Voice[] => {
    const f = hz(55, semis);
    return [["t", "square", f, f, 0.12, 0.04], ["t", "triangle", f, f, 0.12, 0.07]];
  },
  /** A power chord: the root and its fifth in sawtooth, the octave in square; open it rings, damped it is short. */
  chord: (semis: number, open: boolean): Voice[] => {
    const f = hz(110, semis);
    const d = open ? 0.32 : 0.11;
    return [["t", "sawtooth", f, f, d, 0.035], ["t", "sawtooth", f * 1.5, f * 1.5, d, 0.03], ["t", "square", f * 2, f * 2, d, 0.015]];
  },
  /** A lead note: a square, bent from one pitch to another over its length where it bends. */
  lead: (semis: number, eighths: number, to = semis): Voice[] => [["t", "square", hz(440, semis), hz(440, to), sec(eighths * EIGHTH) * 0.95, 0.045]],
  /** A plain note: a triangle that rings and fades as a nylon string does, with a quiet octave over it. */
  plain: (semis: number): Voice[] => [["t", "triangle", hz(220, semis), hz(220, semis), 1.2, 0.14], ["t", "sine", hz(440, semis), hz(440, semis), 0.5, 0.03]]
};

/** A note: when (in steps from the start of what it belongs to), what plays it, and its sound. */
export interface Note {
  at: number;
  who: Instrument | "intro" | "plain";
  parts: readonly Voice[];
}

/** The notes of one bar of the loop (0 to 15), starting at step `at`, of the instruments that play. */
function bar(i: number, at: number, plays: (who: Instrument) => boolean, out: Note[]) {
  const root = ROOTS[i];
  for (let e = 0; e < 8; e++) {
    const t = at + e * EIGHTH;
    if (plays("drums")) {
      const [k, c, h] = DRUMS[i];
      if (k[e] === "k") out.push({ at: t, who: "drums", parts: SOUND.kick });
      if (c[e] === "c") out.push({ at: t, who: "drums", parts: SOUND.clap });
      if (h[e] === "h") out.push({ at: t, who: "drums", parts: SOUND.hat });
      if (h[e] === "C") out.push({ at: t, who: "drums", parts: SOUND.crash });
    }
    const b = BASS[i][e];
    if (plays("bass") && b !== ".") out.push({ at: t, who: "bass", parts: SOUND.bass(root + (b === "f" ? 7 : b === "o" ? 12 : 0)) });
    const r = RIFF[i][e];
    if (plays("riff") && r !== ".") out.push({ at: t, who: "riff", parts: SOUND.chord(root, r === "X") });
  }
  if (plays("lead")) for (const [e, s, n, to] of LEAD[i]) out.push({ at: at + e * EIGHTH, who: "lead", parts: SOUND.lead(s, n, to) });
}

/**
 * The band's notes from step `from` to `to` (not including it), counted from the moment he wakes: the intro's bar, then the loop
 * over and over, with the instruments that play. Deterministic: the same span gives the same notes.
 */
export function bandNotes(from: number, to: number, plays: (who: Instrument) => boolean, intro = true): Note[] {
  const out: Note[] = [];
  const all: Note[] = [];
  if (intro && from < INTRO && plays("drums")) {
    all.push({ at: 0, who: "intro", parts: [...SOUND.crash, ...SOUND.kick, ...SOUND.chord(0, true).map((v) => (v[0] === "t" ? (["t", v[1], v[2], v[3], 1.5, v[5]] as Voice) : v))] });
    for (const [e, s] of INTRO_TOMS) all.push({ at: e * EIGHTH, who: "intro", parts: SOUND.tom(s) });
  }
  const start = intro ? INTRO : 0;
  for (let b = Math.max(0, Math.floor((from - start) / BAR)); start + b * BAR < to; b++) bar(b % LOOP_BARS, start + b * BAR, plays, all);
  for (const n of all) if (n.at >= from && n.at < to) out.push(n);
  return out;
}

/** The plain notes from step `from` to `to` after the stage went plain, once. */
export function plainNotes(from: number, to: number): Note[] {
  return PLAIN.map(([e, s]) => ({ at: e * EIGHTH, who: "plain" as const, parts: SOUND.plain(s) })).filter((n) => n.at >= from && n.at < to);
}

// --- The shouted lines ------------------------------------------------------------------------------------------------------

/** How many lines he shouts, in turn (the encore's `shout1` to `shout4` in `game/story.ts`). */
export const SHOUTS = 4;

/**
 * Which shouted line is up at a step (as a number from 1), or null. He shouts while he struts and while he poses (the bubble
 * stands beside him, clear of the stars over his head), never during a tell: a line comes in on a beat he was already
 * strutting or posing on, so it comes in time with the music, and goes the moment his tell begins; the lines take turns, two
 * bars each. The page shows it only while no other line or hint of his is up. `woke`: the step he woke; `since`: the step his
 * strut or pose began, or null when he is doing anything else.
 */
export function shoutAt(step: number, woke: number, since: number | null): number | null {
  if (since === null) return null;
  const m = step - woke - INTRO;
  if (m < 0) return null;
  if (since > step - (m % BEAT)) return null;
  return (Math.floor(m / (2 * BAR)) % SHOUTS) + 1;
}

/**
 * The step the shouted line up at `step` came in (order 47: the talk panel slides in from it): the later of its two bars' start and
 * the first beat of the strut or pose it is shouted in. As `shoutAt`, which says which line it is.
 */
export function shoutFrom(step: number, woke: number, since: number): number {
  const at = woke + INTRO;
  const block = at + Math.floor((step - at) / (2 * BAR)) * 2 * BAR;
  return Math.max(block, at + Math.ceil((since - at) / BEAT) * BEAT);
}

/** Loki's phases he shouts in: strutting and posing. */
export const SHOUTING = ["strut", "pose"];

// --- The player ------------------------------------------------------------------------------------------------------------

/** How far ahead it schedules, in steps: more than the four steps the page holds its picture after a hit. */
export const AHEAD = 16;

/** What the player needs of Loki: his phase, when it began, and his hits. */
export interface Performer {
  phase: string;
  since: number;
  hits: number;
}

/**
 * The encore's music, played by the page once a frame: `sound` the page's sound while the level is played (null on a card,
 * after he has left or while the page is hidden: it stops), `boss` Loki, `step` the level's clock. It returns the shouted line
 * that is up (`shout1` to `shout4`), or null. `audition` (set by `?debug&music=…`): play the loop at once, whatever Loki does,
 * with only the named parts: `drums`, `bass`, `riff`, `lead`, `band` (all four), `intro` (its bar over and over) or `plain`.
 */
export interface Music {
  (sound: Pick<Sfx, "voice" | "muted"> | null, boss: unknown, step: number): string | null;
  audition?: string;
  /** The step he woke (the music's start), or null while he waits (order 47: when a shouted line came in). */
  woke?: () => number | null;
}

export function encoreMusic(): Music {
  /** The step he woke (the music's start), or null while he waits; the step the stage went plain; scheduled up to (not including). */
  let woke: number | null = null;
  let plainAt: number | null = null;
  let until = -1;
  const music: Music = (sound, boss, step) => {
    const s = boss as Performer | null;
    const listen = music.audition;
    if (listen) woke ??= step;
    else if (!s || s.phase === "asleep") woke = plainAt = null;
    else if (s.phase === "waking") woke = s.since;
    else woke ??= step;
    // The plain notes begin a beat after the stage goes plain (its lights fade over a second), so the first is scheduled in time.
    if (s?.phase === "plain") plainAt = s.since + BEAT;
    const line = !listen && s && woke !== null ? shoutAt(step, woke, SHOUTING.includes(s.phase) ? s.since : null) : null;
    const said = line ? `shout${line}` : null;
    // No sound (a card, hidden, gone), muted, nobody playing, or time lost (a slow frame, a restart): nothing is scheduled, and
    // it goes on from the step it is at; a note it missed is never played late.
    if (!sound || sound.muted || woke === null || step > until || until - step > AHEAD) until = step;
    if (!sound || sound.muted || woke === null) return said;
    const to = step + AHEAD;
    const notes: Note[] = [];
    if (listen) {
      const parts = listen.split(",");
      const all = parts.includes("band");
      if (parts.includes("plain")) notes.push(...loopOf(PLAIN_STEPS + 2 * BEAT, until - woke, to - woke, plainNotes));
      if (parts.includes("intro")) notes.push(...loopOf(BAR, until - woke, to - woke, (a, b) => bandNotes(a, b, () => true)));
      notes.push(...bandNotes(until - woke, to - woke, (who) => all || parts.includes(who), false));
    } else {
      const hits = s ? Math.min(3, s.hits) : 0;
      notes.push(...bandNotes(until - woke, to - woke, (who) => PLAYS_BY_HITS[hits].includes(who)));
      if (plainAt !== null) notes.push(...plainNotes(until - plainAt, to - plainAt).map((n) => ({ ...n, at: n.at + plainAt! - woke! })));
    }
    for (const n of notes) {
      const delay = sec(n.at + woke - step);
      sound.voice(n.parts.map((v) => (v[0] === "t" ? (["t", v[1], v[2], v[3], v[4], v[5], (v[6] ?? 0) + delay] as const) : (["n", v[1], v[2], v[3], v[4], (v[5] ?? 0) + delay] as const))));
    }
    until = to;
    return said;
  };
  music.woke = () => woke;
  return music;
}

/** A phrase `len` steps long played over and over: its notes from `from` to `to`. */
function loopOf(len: number, from: number, to: number, notes: (a: number, b: number) => Note[]): Note[] {
  const out: Note[] = [];
  for (let k = Math.floor(Math.max(0, from) / len); k * len < to; k++)
    for (const n of notes(from - k * len, Math.min(len, to - k * len))) out.push({ ...n, at: n.at + k * len });
  return out;
}
