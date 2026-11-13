import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import type { SfxName } from "@larshansen/pixelkit/sfx";

// The maze had MC Hammer playing in 2019. Not any more: no audio files, no audio elements, no loops,
// and nothing makes a sound before the visitor's first key or tap. The only sound is the kit's
// short synthesised blips, behind the shared mute.

const MAZE = join(import.meta.dir, "..");
const PAGE = join(import.meta.dir, "../../../apps/iron-maze");
const AUDIO = new Set([".mp3", ".wav", ".ogg", ".oga", ".opus", ".m4a", ".aac", ".flac", ".mid", ".midi", ".weba", ".webm", ".aif", ".aiff", ".caf", ".amr", ".wma", ".mod", ".xm"]);

/** Every file under `dir`, leaving out installed packages. */
function files(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...files(path));
    else out.push(path);
  }
  return out;
}

describe("no music", () => {
  test("no audio file anywhere under packages/maze or apps/iron-maze", () => {
    const all = [...files(MAZE), ...files(PAGE)];
    expect(all.length).toBeGreaterThan(10); // the walk did find the folders
    expect(all.filter((f) => AUDIO.has(extname(f).toLowerCase()))).toEqual([]);
  });

  test("no audio element, no audio context of its own, nothing looping in their code", () => {
    const code = [...files(join(MAZE, "src")), ...files(join(PAGE, "src")), join(PAGE, "index.html")].filter((f) => /\.(ts|html|css)$/.test(f) && !f.endsWith(".test.ts"));
    expect(code.length).toBeGreaterThan(5);
    for (const f of code) {
      const text = readFileSync(f, "utf8");
      expect({ f, hit: /new Audio\b|<audio|<video|AudioContext|\.loop\b|loop\s*[:=]\s*true|autoplay/i.exec(text)?.[0] ?? null }).toEqual({ f, hit: null });
    }
  });
});

// --- the kit's synth, with a stand-in browser ----------------------------------------------------

interface Node {
  kind: string;
  loop?: boolean;
  started: number[];
  stopped: number[];
}
const made: { contexts: number; nodes: Node[] } = { contexts: 0, nodes: [] };
const listeners = new Map<string, (() => void)[]>();
const fire = (type: string) => listeners.get(type)?.forEach((f) => f());

function node(kind: string): Node & Record<string, unknown> {
  const n: Node & Record<string, unknown> = {
    kind,
    started: [],
    stopped: [],
    connect: (to: unknown) => to,
    start: (t: number) => n.started.push(t),
    stop: (t: number) => n.stopped.push(t),
    frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }
  };
  made.nodes.push(n);
  return n;
}

class FakeContext {
  state = "running";
  currentTime = 0;
  sampleRate = 8000;
  destination = {};
  constructor() {
    made.contexts++;
  }
  resume() {}
  createGain = () => node("gain");
  createOscillator = () => node("oscillator");
  createBiquadFilter = () => node("filter");
  createBufferSource = () => node("buffer");
  createBuffer = (_c: number, len: number) => ({ getChannelData: () => new Float32Array(len) });
}

const saved = { window: (globalThis as Record<string, unknown>).window, localStorage: (globalThis as Record<string, unknown>).localStorage };
beforeAll(() => {
  const g = globalThis as Record<string, unknown>;
  g.window = {
    AudioContext: FakeContext,
    addEventListener: (type: string, f: () => void) => listeners.set(type, [...(listeners.get(type) ?? []), f])
  };
  const data = new Map<string, string>();
  g.localStorage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
});
afterAll(() => {
  const g = globalThis as Record<string, unknown>;
  g.window = saved.window;
  g.localStorage = saved.localStorage;
});

describe("the only sound is short blips", () => {
  const ALL: SfxName[] = ["step", "jump", "land", "door", "pickup", "splash", "bleat", "fanfare", "curse", "stone", "gate", "hiss", "teleport"];

  test("nothing sounds before the first key or tap, then every sound is short and none loops", async () => {
    const { createSfx } = await import("@larshansen/pixelkit/sfx");
    const sfx = createSfx();
    for (const name of ALL) sfx.play(name);
    expect(made.contexts).toBe(0);
    expect(made.nodes.length).toBe(0);

    fire("keydown");
    expect(made.contexts).toBe(1);
    for (const name of ALL) {
      made.nodes.length = 0;
      sfx.play(name);
      const sources = made.nodes.filter((n) => n.kind === "oscillator" || n.kind === "buffer");
      expect({ name, sounds: sources.length > 0 }).toEqual({ name, sounds: true });
      for (const s of sources) {
        expect(s.loop).not.toBe(true);
        expect(s.stopped.length).toBe(1);
        // Every blip stops within a second of when it starts (the fanfare's last note is the longest).
        expect(s.stopped[0] - s.started[0]).toBeLessThanOrEqual(1);
      }
    }
  });

  test("the shared mute silences it", async () => {
    const { createSfx } = await import("@larshansen/pixelkit/sfx");
    const sfx = createSfx();
    fire("pointerdown");
    if (!sfx.muted) sfx.toggleMute();
    made.nodes.length = 0;
    sfx.play("teleport");
    expect(made.nodes.filter((n) => n.kind === "oscillator").length).toBe(0);
    expect(localStorage.getItem("larshansen.muted")).toBe("1");
  });
});
