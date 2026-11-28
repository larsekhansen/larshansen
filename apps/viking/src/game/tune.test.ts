import { describe, expect, test } from "bun:test";
import type { Voice } from "@larshansen/pixelkit/sfx";
import { ENCORE } from "../levels/encore";
import { ENCORE_ROUTE } from "../levels/routes/encore";
import { playMoves } from "./bot";
import type { Loki } from "./loki";
import { newPlay } from "./play";
import { SHIELD_RULES } from "./shield";
import { ENCORE as WORDS, ENCORE_ALTERNATIVES } from "./story";
import { AHEAD, BAR, BEAT, BASS, DRUMS, EIGHTH, INTRO, LEAD, LOOP, LOOP_BARS, PLAIN, PLAIN_STEPS, PLAYS_BY_HITS, RIFF, ROOTS, SHOUTS, bandNotes, encoreMusic, plainNotes, SHOUTING, shoutAt, shoutFrom, type Note } from "./tune";

// The encore's tune (order 34, ADR 0055): deterministic, whole bars, every note in a sane range and volume, a layer fewer with
// each hit, the plain notes after the third, nothing while muted or with no sound, and the shouted lines only while he struts.
// Nobody can hear it on this machine: these hold what can be held without ears.

const every = () => true;
const fight = () => newPlay(ENCORE, { pole: true, shield: SHIELD_RULES, hasShield: true });

/** A fake of the page's sound: what it was asked to play, by the step it was asked at, and what it sounded like. */
function ears(muted = false) {
  const heard: { step: number; parts: readonly Voice[] }[] = [];
  let now = 0;
  return {
    sound: { muted, voice: (parts: readonly Voice[]) => heard.push({ step: now, parts }) },
    at: (step: number) => (now = step),
    heard
  };
}

/** Which instrument a sound is, by its parts (as `SOUND` makes them). */
function kind(parts: readonly Voice[]): string {
  const [a] = parts;
  if (parts.length >= 5) return "intro";
  if (a[0] === "n" || (a[1] === "sine" && a[2] === 130)) return "drums";
  if (a[1] === "sine") return "intro";
  if (a[1] === "triangle") return "plain";
  if (parts.length === 2 && a[1] === "square") return "bass";
  if (parts.length === 3) return "riff";
  return "lead";
}

describe("the encore's tune (order 34)", () => {
  test("is written in whole bars: a loop of 16 to 32 bars, every bar of every part eight eighths, every note inside its bar", () => {
    expect(BAR).toBe(8 * EIGHTH);
    expect(LOOP_BARS).toBeGreaterThanOrEqual(16);
    expect(LOOP_BARS).toBeLessThanOrEqual(32);
    expect(LOOP % BAR).toBe(0);
    expect(INTRO % BAR).toBe(0);
    for (const part of [ROOTS, RIFF, BASS, DRUMS, LEAD]) expect(part.length).toBe(LOOP_BARS);
    for (const bar of [...RIFF, ...BASS, ...DRUMS.flat()]) expect(bar.length).toBe(8);
    for (const bar of LEAD) for (const [e, , n] of bar) expect(e + n).toBeLessThanOrEqual(8);
    for (const [e] of PLAIN) expect(e * EIGHTH).toBeLessThan(PLAIN_STEPS);
  });

  test("is deterministic, and the loop is the same each time round", () => {
    const span = INTRO + 3 * LOOP;
    const a = bandNotes(0, span, every);
    expect(bandNotes(0, span, every)).toEqual(a);
    const round = (k: number) => a.filter((n) => n.at >= INTRO + k * LOOP && n.at < INTRO + (k + 1) * LOOP).map((n) => ({ ...n, at: n.at - k * LOOP }));
    expect(round(1)).toEqual(round(0));
    expect(round(2)).toEqual(round(0));
    // Asked in small spans (as the page asks, a frame at a time) it gives the same notes as asked at once.
    const pieces: Note[] = [];
    for (let t = 0; t < span; t += 7) pieces.push(...bandNotes(t, Math.min(span, t + 7), every));
    // (The order within a step does not matter: every note is scheduled by its own time.)
    const order = (ns: Note[]) => ns.map((n) => JSON.stringify(n)).sort();
    expect(order(pieces)).toEqual(order(a));
  });

  test("every note is in a sane range and volume, and no moment is too loud", () => {
    const loud: number[] = [];
    for (const notes of [bandNotes(0, INTRO + LOOP, every), plainNotes(0, PLAIN_STEPS)]) {
      const load = new Map<number, number>();
      for (const n of notes) {
        for (const v of n.parts) {
          if (v[0] === "t") {
            const [, , f0, f1, dur, vol, delay] = v;
            for (const f of [f0, f1]) {
              expect(f).toBeGreaterThanOrEqual(40);
              expect(f).toBeLessThanOrEqual(4200);
            }
            expect(dur).toBeGreaterThan(0);
            expect(dur).toBeLessThanOrEqual(1.6);
            expect(vol).toBeGreaterThan(0);
            expect(vol).toBeLessThanOrEqual(0.3);
            expect(delay ?? 0).toBeGreaterThanOrEqual(0);
            load.set(n.at, (load.get(n.at) ?? 0) + vol);
          } else {
            const [, f0, f1, dur, vol, delay] = v;
            for (const f of [f0, f1]) {
              expect(f).toBeGreaterThanOrEqual(50);
              expect(f).toBeLessThanOrEqual(13000);
            }
            expect(dur).toBeGreaterThan(0);
            expect(dur).toBeLessThanOrEqual(1.2);
            expect(vol).toBeGreaterThan(0);
            expect(vol).toBeLessThanOrEqual(0.3);
            expect(delay ?? 0).toBeGreaterThanOrEqual(0);
            load.set(n.at, (load.get(n.at) ?? 0) + vol);
          }
        }
      }
      loud.push(Math.max(...load.values()));
    }
    // The game's own sounds are 0.1 to 0.5 at once; the band, all at once on a downbeat, stays under 0.8.
    expect(Math.max(...loud)).toBeLessThan(0.8);
  });

  test("a layer drops out with each piece knocked off: the lead, the riff, then the drums and the bass", () => {
    const heard = (hits: number) => new Set(bandNotes(INTRO, INTRO + LOOP, (who) => PLAYS_BY_HITS[hits].includes(who)).map((n) => n.who));
    expect([...heard(0)].sort()).toEqual(["bass", "drums", "lead", "riff"]);
    for (let h = 1; h <= 3; h++) {
      const before = heard(h - 1);
      const after = heard(h);
      for (const who of after) expect(before.has(who)).toBe(true);
      expect(before.size - after.size).toBeGreaterThanOrEqual(1);
    }
    expect(heard(3).size).toBe(0);
  });

  test("in the scripted fight: the intro as he wakes, the band while he is glammed, a layer fewer a hit, the plain notes once after the third, then nothing", () => {
    const p = fight();
    const music = encoreMusic();
    const e = ears();
    const by: { step: number; hits: number; phase: string; shout: string | null }[] = [];
    playMoves(p, ENCORE_ROUTE, {
      max: 60 * 120,
      until: (q) => {
        const s = q.boss!.state as Loki;
        e.at(q.t);
        const shout = music(e.sound, s, q.t);
        by.push({ step: q.t, hits: s.hits, phase: s.phase, shout });
        return false;
      }
    });
    // The scripted run ends as the clock stops, with him walking off.
    expect(by.at(-1)!.hits).toBe(3);
    const hitsAt = new Map(by.map((b) => [b.step, b.hits] as const));
    const kinds = (h: number) => new Set(e.heard.filter((x) => hitsAt.get(x.step) === h).map((x) => kind(x.parts)));
    // Nothing before he wakes; the intro as he wakes.
    const woke = by.find((b) => b.phase === "waking")!.step;
    expect(e.heard.filter((x) => x.step < woke)).toEqual([]);
    expect(e.heard.some((x) => kind(x.parts) === "intro")).toBe(true);
    const glammed = kinds(0);
    for (const k of ["drums", "bass", "riff", "lead"]) expect(glammed.has(k)).toBe(true);
    expect(kinds(1).has("lead")).toBe(false);
    for (const k of ["drums", "bass", "riff"]) expect(kinds(1).has(k)).toBe(true);
    expect(kinds(2).has("lead") || kinds(2).has("riff")).toBe(false);
    for (const k of ["drums", "bass"]) expect(kinds(2).has(k)).toBe(true);
    // After the third: only the plain notes, once each, and nothing of the band (a note already on its way may still sound,
    // scheduled less than `AHEAD` steps before the hit).
    const third = by.find((b) => b.hits === 3)!.step;
    const late = e.heard.filter((x) => x.step >= third + AHEAD);
    expect(late.map((x) => kind(x.parts)).every((k) => k === "plain")).toBe(true);
    expect(late.length).toBe(PLAIN.length);
  });

  test("nothing plays while muted, with no sound (a card, a hidden page, gone), or before he wakes", () => {
    for (const quiet of ["muted", "none"] as const) {
      const p = fight();
      const music = encoreMusic();
      const e = ears(quiet === "muted");
      playMoves(p, ENCORE_ROUTE, { max: 60 * 120, until: (q) => (e.at(q.t), music(quiet === "none" ? null : e.sound, q.boss!.state, q.t), false) });
      expect(e.heard.length).toBe(0);
    }
    // Waiting at his mark: silent.
    const music = encoreMusic();
    const e = ears();
    const p = fight();
    for (let t = 0; t < 600; t++) music(e.sound, p.boss!.state, t);
    expect(e.heard.length).toBe(0);
  });

  test("played a frame at a time, every note is played once and on time; after lost time the missed notes are never played late", () => {
    const music = encoreMusic();
    const e = ears();
    const s = { phase: "strut", since: 0, hits: 0 };
    // He woke at step 100 (as `waking` says), and the page asks once a frame from then on.
    music(e.sound, { ...s, phase: "waking", since: 100 }, 100);
    for (let t = 101; t < 100 + INTRO + LOOP; t++) (e.at(t), music(e.sound, { ...s, since: 150 }, t));
    const want = bandNotes(0, INTRO + LOOP, every).length;
    const got = e.heard.filter((x) => {
      const d = x.parts.map((v) => (v[0] === "t" ? v[6] ?? 0 : v[5] ?? 0));
      return Math.min(...d) >= 0;
    });
    expect(got.length).toBe(e.heard.length);
    // Every note of the intro and one loop once (the last few steps' notes are scheduled AHEAD of the last frame).
    expect(e.heard.length).toBeGreaterThanOrEqual(want);
    expect(e.heard.length).toBeLessThanOrEqual(bandNotes(0, INTRO + LOOP + AHEAD, every).length);
    // A gap (the page hidden two seconds): nothing scheduled for the steps it missed, nothing with a delay below nought.
    const before = e.heard.length;
    const t0 = 100 + INTRO + LOOP + 120;
    e.at(t0);
    music(e.sound, { ...s, since: 150 }, t0);
    for (const x of e.heard.slice(before)) for (const v of x.parts) expect(v[0] === "t" ? v[6] ?? 0 : v[5] ?? 0).toBeGreaterThanOrEqual(0);
  });

  test("the audition (`?debug&music=…`) plays at once, whatever Loki does, only the parts it names", () => {
    for (const [ask, want] of [["drums", ["drums"]], ["bass,riff", ["bass", "riff"]], ["lead", ["lead"]], ["band", ["bass", "drums", "lead", "riff"]], ["plain", ["plain"]], ["intro", ["intro"]]] as const) {
      const music = encoreMusic();
      music.audition = ask;
      const e = ears();
      for (let t = 0; t < LOOP; t++) (e.at(t), music(e.sound, { phase: "asleep", since: 0, hits: 0 }, t));
      expect([...new Set(e.heard.map((x) => kind(x.parts)))].sort()).toEqual([...want]);
    }
  });

  test("the shouted lines: one at a time, on a beat, only while he struts or poses, never during a tell; in both languages, with an alternative each", () => {
    // Only from a beat he was already strutting or posing on, and only then; the lines take turns, two bars each.
    const woke = 50;
    const beat = woke + INTRO + BAR;
    expect(shoutAt(beat - 1, woke, null)).toBeNull();
    expect(shoutAt(beat, woke, beat)).toBe(1);
    expect(shoutAt(beat + 5, woke, beat + 1)).toBeNull();
    expect(shoutAt(beat + BEAT, woke, beat + 1)).toBe(1);
    expect(shoutAt(woke + INTRO + 2 * BAR, woke, beat)).toBe(2);
    expect(shoutAt(woke + INTRO - 1, woke, woke)).toBeNull();
    // In the scripted fight: shouted, each in turn, only while he struts.
    const p = fight();
    const music = encoreMusic();
    const seen = new Set<string>();
    playMoves(p, ENCORE_ROUTE, {
      max: 60 * 120,
      until: (q) => {
        const s = q.boss!.state as Loki;
        const shout = music(null, s, q.t);
        if (shout) {
          expect(SHOUTING).toContain(s.phase);
          seen.add(shout);
        }
        return false;
      }
    });
    expect(seen.size).toBeGreaterThanOrEqual(1);
    // Every line in both languages, two short lines at most a bubble, each with another way beside it.
    for (let i = 1; i <= SHOUTS; i++) {
      const key = `shout${i}` as "shout1" | "shout2" | "shout3" | "shout4";
      expect(ENCORE.bossWords?.[key]).toBeDefined();
      for (const lang of ["en", "nb"] as const) {
        const lines = WORDS[lang][key].split("\n");
        expect(lines.length).toBeLessThanOrEqual(2);
        for (const l of lines) expect(l.length).toBeLessThanOrEqual(30);
      }
      expect(ENCORE_ALTERNATIVES[key].length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("when a shouted line came in (order 47: the talk panel slides in from it)", () => {
  test("shoutFrom is the first step of the line shoutAt says is up: the same line there and every step since, none or another the step before", () => {
    const woke = 100;
    let checked = 0;
    for (const since of [100, 150, 233, 400, 401, 640])
      for (let step = since; step < since + 6 * BAR; step += 7) {
        const line = shoutAt(step, woke, since);
        if (line === null) continue;
        const from = shoutFrom(step, woke, since);
        expect(from).toBeLessThanOrEqual(step);
        for (let k = from; k <= step; k++) expect(shoutAt(k, woke, since)).toBe(line);
        if (from > since) expect(shoutAt(from - 1, woke, since)).not.toBe(line);
        checked++;
      }
    expect(checked).toBeGreaterThan(50);
  });
});

