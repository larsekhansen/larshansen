// A tiny WebAudio synth. Every sound is generated; there are no audio files.
// Short and quiet, from one family: soft square and triangle blips for the person, noise bursts for
// water and wind, and a pentatonic set for pickups. Nothing plays before the first key or pointer
// event (browsers refuse it anyway), and the mute is shared by all the games.

export type SfxName = "step" | "jump" | "land" | "door" | "pickup" | "splash" | "bleat" | "fanfare" | "curse" | "stone" | "gate" | "hiss" | "teleport";

const MUTE_KEY = "larshansen.muted";
const OLD_MUTE_KEY = "viking.muted"; // the viking game's own, read once as a fallback
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const note = (semitones: number, base = 523) => base * 2 ** (semitones / 12);

/** The visitor's choice if they have ever made one, otherwise the page's own default. */
function readMuted(whenUnset: boolean): boolean {
  try {
    const own = localStorage.getItem(MUTE_KEY);
    if (own !== null) return own === "1";
    const old = localStorage.getItem(OLD_MUTE_KEY);
    return old === null ? whenUnset : old === "1";
  } catch {
    return whenUnset;
  }
}

export interface Sfx {
  /** `n` picks the note of the pentatonic set for "pickup", so pickups can climb. */
  play(name: SfxName, n?: number): void;
  readonly muted: boolean;
  /** Flips the mute, remembers it, and returns the new state. */
  toggleMute(): boolean;
}

/** `mutedUntilChosen`: the front page is silent until the visitor turns sound on; the games start with it on. */
export function createSfx(opts: { mutedUntilChosen?: boolean } = {}): Sfx {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let muted = readMuted(!!opts.mutedUntilChosen);

  function unlock() {
    if (ctx) {
      if (ctx.state === "suspended") void ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      ctx = new Ctor();
    } catch {
      return;
    }
    master = ctx.createGain();
    master.gain.value = 0.14;
    master.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.5);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  for (const ev of ["keydown", "pointerdown"] as const) window.addEventListener(ev, unlock, { passive: true });

  function tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0, vibrato = 0) {
    if (!ctx || !master) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    if (vibrato) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 22;
      depth.gain.value = vibrato;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur);
    }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function hiss(f0: number, f1: number, dur: number, vol: number, delay = 0) {
    if (!ctx || !master || !noise) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(f0, t);
    filter.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(master);
    src.start(t);
    src.stop(t + dur);
  }

  function play(name: SfxName, n = 0) {
    if (muted || !ctx) return;
    switch (name) {
      case "step":
        return hiss(700, 200, 0.04, 0.12);
      case "jump":
        return tone("square", 260, 480, 0.1, 0.12);
      case "land":
        return hiss(500, 100, 0.07, 0.25);
      case "door":
        hiss(300, 1200, 0.25, 0.25);
        return tone("sine", 110, 60, 0.3, 0.3);
      case "pickup": {
        const s = PENTATONIC[n % PENTATONIC.length];
        tone("triangle", note(s), note(s), 0.1, 0.3);
        return tone("triangle", note(s + 7), note(s + 7), 0.2, 0.22, 0.06);
      }
      case "splash":
        return hiss(2200, 200, 0.28, 0.45);
      case "bleat":
        return tone("sawtooth", 520, 430, 0.22, 0.1, 0, 40);
      case "fanfare":
        [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone("square", note(s, 392), note(s, 392), i === 6 ? 0.45 : 0.11, 0.12, i * 0.1));
        return;
      case "curse":
        tone("sawtooth", 150, 55, 0.25, 0.16);
        return hiss(900, 120, 0.2, 0.2);
      case "stone":
        tone("triangle", 220, 130, 0.14, 0.3);
        return hiss(600, 150, 0.06, 0.15);
      case "hiss":
        // A snake: 120 ms of filtered noise.
        return hiss(5200, 2400, 0.12, 0.1);
      case "gate":
        hiss(300, 900, 0.3, 0.25);
        return tone("sine", 90, 50, 0.3, 0.3);
      case "teleport":
        // A teleport stone in the maze: a quick climb of two triangle blips and a thin shimmer of noise.
        tone("triangle", note(4), note(16), 0.12, 0.2);
        tone("triangle", note(9), note(21), 0.12, 0.14, 0.06);
        return hiss(7000, 3000, 0.16, 0.05);
    }
  }

  return {
    play,
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      } catch {
        // storage refused: the mute lasts for this visit
      }
      return muted;
    }
  };
}
