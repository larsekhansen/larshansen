// Tiny WebAudio synth — every sound is generated, there are no audio files.

export type SfxName = "jump" | "doubleJump" | "land" | "rune" | "door" | "splash" | "sheep" | "fanfare";

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (semitones: number, base = 440) => base * 2 ** (semitones / 12);

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted: boolean;

  constructor(muted: boolean) {
    this.muted = muted;
  }

  /** Must be called from a user gesture at least once (browser autoplay policy). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      this.ctx = new Ctor();
    } catch {
      return;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 0.6;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0, vibrato = 0) {
    const { ctx, master } = this;
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
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private hiss(f0: number, f1: number, dur: number, vol: number) {
    const { ctx, master, noise } = this;
    if (!ctx || !master || !noise) return;
    const t = ctx.currentTime;
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

  /** `n` picks the step of the scale for "rune" so pickups climb. */
  play(name: SfxName, n = 0) {
    if (this.muted || !this.ctx) return;
    switch (name) {
      case "jump":
        return this.tone("square", 260, 520, 0.14, 0.25);
      case "doubleJump":
        return this.tone("square", 420, 880, 0.14, 0.22);
      case "land":
        return this.hiss(500, 80, 0.12, 0.5);
      case "rune": {
        const s = PENTATONIC[n % PENTATONIC.length];
        this.tone("triangle", note(s, 523), note(s, 523), 0.18, 0.5);
        return this.tone("triangle", note(s + 7, 523), note(s + 7, 523), 0.35, 0.4, 0.08);
      }
      case "door":
        this.hiss(300, 1800, 0.5, 0.5);
        return this.tone("sine", 110, 55, 0.6, 0.6);
      case "splash":
        return this.hiss(2400, 200, 0.45, 0.9);
      case "sheep":
        return this.tone("sawtooth", 520, 430, 0.4, 0.2, 0, 40);
      case "fanfare":
        [0, 4, 7, 12, 7, 12, 16].forEach((s, i) =>
          this.tone("square", note(s, 392), note(s, 392), i === 6 ? 0.7 : 0.16, 0.22, i * 0.13)
        );
        return;
    }
  }

  destroy() {
    void this.ctx?.close();
    this.ctx = null;
  }
}
