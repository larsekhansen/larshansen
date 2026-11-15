import { describe, expect, test } from "bun:test";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { target, view } from "@larshansen/pixelkit/paint";
import { placeBody } from "@larshansen/pixelkit/physics";
import type { Voice } from "@larshansen/pixelkit/sfx";
import { WINDUP, untilThrow, type Enemy } from "../game/enemies";
import { newPlay, stepPlay, type Play, type PlayIntent } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { autopilot, type Move } from "../game/bot";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import type { LevelDef, View } from "../levels/types";
import { HOLD, PARTICLES, SOUND_OF, VOICES, createFeel, particlesAlive, pools } from "./feel";
import { drawEnemy } from "./pickups";

// Order 19 (ADR 0040): every event answers at once, where it happened, with a sound, and a still answer
// under reduced motion; and the answers are pictures and sounds only. These hold what can be held without
// a browser: that the rules step exactly as they do without the answers (the hold after a hit included),
// that what is in the air stays within its forty, that every event has a sound of its own and the near
// ones are told apart, that what is about to happen shows it first, in its outline.

const IDLE: PlayIntent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const RIGHT: PlayIntent = { ...IDLE, right: true };
const routeOf = (id: string) => (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];
const optsFor = (def: LevelDef) => ({ pole: ORDER.indexOf(def.id) > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: def.rune > 10 });

/** A feel with no page: its sounds are counted, nothing is drawn. */
function quiet() {
  const heard: Voice[][] = [];
  const feel = createFeel({ sfx: { voice: (v) => void heard.push([...v]) } });
  return { feel, heard };
}

/** What the rules hold, to compare two plays step by step. */
const state = (p: Play) => JSON.stringify([p.t, p.body, p.hearts, p.lives, p.enemies.map((e) => [e.x, e.y, e.alive]), p.shots, p.skilling.map((s) => s.at), p.raisedAt, p.run]);

describe("the answers are pictures and sounds only", () => {
  test(`a hit holds the picture ${HOLD} steps and the rules step on as before: the same play, step for step, with and without the answers`, async () => {
    const def = await loadLevel("langkaia");
    const plain = newPlay(def, {});
    const felt = newPlay(def, {});
    for (const p of [plain, felt]) placeBody(p.body, 700, 256);
    const { feel, heard } = quiet();
    feel.reset(felt);
    let held = 0;
    let hits = 0;
    // As the page runs: a step of the rules every step, the answers around it, then a frame drawn unless the picture holds.
    for (let s = 1; s <= 400; s++) {
      stepPlay(plain, RIGHT);
      feel.before(felt, s);
      const ev = stepPlay(felt, RIGHT);
      feel.react(felt, ev);
      feel.step(felt, s);
      if (ev.hurt) hits++;
      if (feel.held(s)) held++;
      else feel.drew(s);
      expect(state(felt)).toBe(state(plain));
    }
    expect(hits).toBeGreaterThan(0);
    // The picture held, and only for a moment after each hit.
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThanOrEqual(hits * HOLD);
    expect(heard.length).toBeGreaterThan(0);
  });

  test("every level's scripted route, with the answers attached, clears exactly as it does without them", async () => {
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      const runs = [newPlay(def, optsFor(def)), newPlay(def, optsFor(def))];
      const pilots = runs.map(() => autopilot(routeOf(st.id)));
      const { feel } = quiet();
      feel.reset(runs[1]);
      for (let s = 1; s < 60 * 400 && runs[0].runeAt === null; s++) {
        const k0 = pilots[0](runs[0]);
        const k1 = pilots[1](runs[1]);
        if (!k0 || !k1) break;
        stepPlay(runs[0], k0);
        feel.before(runs[1], s);
        feel.react(runs[1], stepPlay(runs[1], k1));
        feel.step(runs[1], s);
      }
      expect(runs[0].runeAt, st.id).not.toBeNull();
      expect(state(runs[1]), st.id).toBe(state(runs[0]));
    }
  });

  test(`at most ${PARTICLES} particles are alive, from pools made once`, async () => {
    const def = await loadLevel("slottet");
    const p = newPlay(def, {});
    const { feel } = quiet();
    feel.reset(p);
    const arrays = [pools.px, pools.py, pools.plife, pools.pcol];
    const ev = stepPlay(p, IDLE);
    // Everything at once, many times over: a hit, a stomp, a dud, a block, a splash, the rune and its fireworks.
    for (let s = 0; s < 50; s++) {
      feel.before(p, s);
      feel.react(p, { ...ev, hurt: true, stomp: 0, dud: true, blocked: true, splash: true, rune: true, zap: true });
      expect(particlesAlive()).toBeLessThanOrEqual(PARTICLES);
    }
    expect(particlesAlive()).toBe(PARTICLES);
    expect([pools.px, pools.py, pools.plife, pools.pcol]).toEqual(arrays);
    for (const a of arrays) expect(a.length).toBe(PARTICLES);
  });

  test("with reduced motion: no hold, no shake, nothing flying; a hit still answers with a still ring", async () => {
    const def = await loadLevel("langkaia");
    const p = newPlay(def, {});
    placeBody(p.body, 700, 256);
    const { feel } = quiet();
    feel.reset(p);
    view.reduced = true;
    try {
      let hit = -1;
      for (let s = 1; s < 200 && hit < 0; s++) {
        feel.before(p, s);
        const ev = stepPlay(p, RIGHT);
        feel.react(p, ev);
        if (ev.hurt) hit = s;
      }
      expect(hit).toBeGreaterThan(0);
      expect(feel.held(hit + 1)).toBe(false);
      expect(feel.nudge(hit + 1)).toBeNull();
      expect(particlesAlive()).toBe(0);
      // The ring: drawn into a recorder, it has its twelve points.
      const drawn: string[] = [];
      target({ set fillStyle(c: string) { drawn.push(c); }, fillRect() {} } as unknown as CanvasRenderingContext2D);
      feel.at(hit + 10);
      feel.world(p, p.t);
      expect(drawn.length).toBeGreaterThanOrEqual(12);
    } finally {
      view.reduced = false;
    }
  });
});

describe("every event has a sound, and neighbours are told apart", () => {
  test("Bjørvika's hooks sound as a lift does: a clunk coming in to each landing, the ding-dong as it turns there", async () => {
    const def = await loadLevel("bjorvika");
    const p = newPlay(def, optsFor(def));
    const i = def.landings![0];
    const hook = def.carriers[i] as { from: { x: number; y: number }; period: number };
    placeBody(p.body, hook.from.x + 40, hook.from.y - 40);
    const heard: Voice[][] = [];
    const feel = createFeel({ sfx: { voice: (v) => void heard.push([...v]) } });
    feel.reset(p);
    const count = (name: "arrive" | "leave") => heard.filter((v) => JSON.stringify(v) === JSON.stringify(VOICES[name])).length;
    for (let s = 1; s <= hook.period; s++) {
      p.t = s;
      feel.step(p, s);
    }
    expect(count("arrive")).toBe(2);
    expect(count("leave")).toBe(2);
  });

  test("turning between two statues makes one sound, not two", async () => {
    const def = await loadLevel("vigelandsparken");
    const p = newPlay(def, optsFor(def));
    const [a, b] = p.enemies.filter((e) => e.def.look === "statue");
    Object.assign(view, { camX: Math.min(a.x, b.x) - 40, camY: Math.min(a.y, b.y) - 100, w: 400, h: 300 });
    const heard: Voice[][] = [];
    const feel = createFeel({ sfx: { voice: (v) => void heard.push([...v]) } });
    feel.reset(p);
    a.calm = true;
    b.calm = false;
    feel.step(p, 1);
    heard.length = 0;
    a.calm = false;
    b.calm = true;
    feel.step(p, 2);
    expect(heard.length).toBe(1);
    expect(heard[0]).toEqual([...VOICES.wake]);
  });

  const KIT = ["coin", "life", "gold", "fanfare", "flag", "bench", "pickup", "over", "door", "hiss", "stomp", "hurt"];

  test("every event in the table has a sound: one of the page's own, or one of the kit's", () => {
    expect(Object.keys(SOUND_OF).length).toBeGreaterThanOrEqual(38);
    for (const [event, sound] of Object.entries(SOUND_OF)) {
      if (sound.startsWith("kit:")) expect(KIT, event).toContain(sound.slice(4));
      else expect(VOICES[sound as keyof typeof VOICES]?.length ?? 0, event).toBeGreaterThan(0);
    }
  });

  test("the page's own sounds are all different", () => {
    const seen = new Map<string, string>();
    for (const [name, v] of Object.entries(VOICES)) {
      const key = JSON.stringify(v);
      expect(seen.get(key), `${name} sounds as ${seen.get(key)}`).toBeUndefined();
      seen.set(key, name);
    }
  });

  /** A sound as an ear tells it: its register, whether it falls or climbs, whether there is noise in it, how long it is. */
  const ear = (v: readonly Voice[]) => {
    const tones = v.filter((p) => p[0] === "t") as readonly (readonly ["t", OscillatorType, number, number, number, number, number?])[];
    const f0 = tones.length ? tones[0][2] : 0;
    const f1 = tones.length ? tones[0][3] : 0;
    const register = f0 === 0 ? "none" : f0 < 300 ? "low" : f0 < 1000 ? "mid" : "high";
    const way = f1 < f0 * 0.8 ? "falls" : f1 > f0 * 1.2 ? "climbs" : "level";
    const noise = v.some((p) => p[0] === "n");
    const long = Math.max(...v.map((p) => (p[0] === "t" ? p[4] + (p[6] ?? 0) : p[3] + (p[5] ?? 0))));
    return { register, way, noise, long: long > 0.15 };
  };

  test("a hit, a stomp, a block and a dud stomp: no two alike in register, direction and noise", () => {
    const four = ["hurt", "stomp", "block", "dud"] as const;
    for (let i = 0; i < four.length; i++)
      for (let j = i + 1; j < four.length; j++) {
        const a = ear(VOICES[four[i]]);
        const b = ear(VOICES[four[j]]);
        const differ = (a.register !== b.register ? 1 : 0) + (a.way !== b.way ? 1 : 0) + (a.noise !== b.noise ? 1 : 0) + (a.long !== b.long ? 1 : 0);
        expect(differ, `${four[i]} / ${four[j]}`).toBeGreaterThanOrEqual(2);
      }
  });
});

describe("what is about to happen is seen before it happens", () => {
  /** The pixels a drawing covers, drawn into a recorder. */
  const cover = (draw: () => void) => {
    const px = new Set<string>();
    target({ fillStyle: "", fillRect(x: number, y: number, w: number, h: number) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) px.add(`${x + i},${y + j}`); } } as unknown as CanvasRenderingContext2D);
    Object.assign(view, { camX: 0, camY: 0 });
    draw();
    return px;
  };
  const differ = (a: Set<string>, b: Set<string>) => [...a].filter((k) => !b.has(k)).length + [...b].filter((k) => !a.has(k)).length;
  const viewAt = (p: Play, t: number): View => ({ sky: skyFor(new Date(2026, 5, 15, 12), "day"), t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: 0, y: 0 }, flourish: null, facing: 1, troll: null, flags: [], enemies: p.enemies, boss: null, cleared: [], runeAt: null, grounds: p.grounds?.state ?? null });
  const look = (def: LevelDef, p: Play, e: Enemy, t: number) => cover(() => void (def.art.enemy?.(e, viewAt(p, t)) || drawEnemy(e, t)));
  /** How many pixels of outline a pose must change by: a sixth of a thrower's body of about a hundred and ten. */
  const POSE = 18;

  test(`every thrower winds up for ${WINDUP} steps (0.4 s is the least) in a pose ${POSE} or more pixels unlike its rest`, async () => {
    expect(WINDUP).toBeGreaterThanOrEqual(24);
    const seen: string[] = [];
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      const p = newPlay(def, {});
      for (const e of p.enemies) {
        if (e.def.kind !== "thrower" || seen.includes(`${st.id} ${e.def.look}`)) continue;
        seen.push(`${st.id} ${e.def.look}`);
        const at = (n: number) => Array.from({ length: 1000 }, (_, t) => t).find((t) => untilThrow(e, t) === n)!;
        const d = differ(look(def, p, e, at(WINDUP + 30)), look(def, p, e, at(WINDUP - 20)));
        expect(d, `${st.id}'s ${e.def.look}`).toBeGreaterThanOrEqual(POSE);
      }
    }
    expect(seen.length).toBeGreaterThanOrEqual(11);
  });

  test(`a statue that walks, a guard that wakes and a swan that turns on him change outline by ${POSE} pixels or more`, async () => {
    const cases: [string, string, (e: Enemy) => void, (e: Enemy) => void][] = [
      ["vigelandsparken", "statue", (e) => void (e.calm = true), (e) => void (e.calm = false)],
      ["vigelandsparken", "bronze", (e) => void (e.calm = true), (e) => void (e.calm = false)],
      ["gamlebyen", "guard", (e) => Object.assign(e, { calm: true, n: 0 }), (e) => Object.assign(e, { calm: false, n: 5 })],
      ["ostensjovannet", "swan", (e) => Object.assign(e, { calm: true, n: 0 }), (e) => Object.assign(e, { calm: true, n: 200 })]
    ];
    for (const [id, kind, still, turned] of cases) {
      const def = await loadLevel(id);
      const p = newPlay(def, {});
      const e = p.enemies.find((x) => x.def.look === kind)!;
      still(e);
      const a = look(def, p, e, 10);
      turned(e);
      const b = look(def, p, e, 10);
      expect(differ(a, b), `${id}'s ${kind}`).toBeGreaterThanOrEqual(POSE);
    }
  });

  test(`a sledger about to set off leans into a pose ${POSE} or more pixels unlike its rest`, async () => {
    const def = await loadLevel("korketrekkeren");
    const p = newPlay(def, optsFor(def));
    for (const e of p.enemies.filter((x) => x.def.look === "sledger")) {
      const start = e.home - (e.def.range ?? 0) * 16;
      const at = (him: number) => cover(() => void def.art.enemy?.(e, { ...viewAt(p, 10), him: { x: him, y: 0 } }));
      // Far off it sits; four tiles before he sets it going (ten tiles), it leans forward and digs in.
      expect(differ(at(start - 20 * 16), at(start - 12 * 16)), `the sledger at ${e.def.c}`).toBeGreaterThanOrEqual(POSE);
      expect(differ(at(start - 20 * 16), at(start - 15 * 16)), `the sledger at ${e.def.c}`).toBe(0);
    }
  });

  test("a pad, a bundle and the stone that sinks tremble for half a second before they go under him", async () => {
    for (const [id, x] of [["ostensjovannet", 712], ["bygdoy", 2112]] as const) {
      const def = await loadLevel(id);
      const p = newPlay(def, optsFor(def));
      placeBody(p.body, x, 200);
      p.body.onGround = false;
      let soonFrom = -1;
      let sankAt = -1;
      for (let s = 0; s < 300 && sankAt < 0; s++) {
        stepPlay(p, IDLE);
        const stands = def.grounds!.stands!(p.grounds!.state, p.t);
        if (soonFrom < 0 && stands.some((st) => st.soon)) soonFrom = p.t;
        const pads = (p.grounds!.state as { pads: { sinkAt: number | null }[] }).pads;
        if (pads.some((q) => q.sinkAt !== null)) sankAt = p.t;
      }
      expect(sankAt, id).toBeGreaterThan(0);
      expect(sankAt - soonFrom, id).toBeGreaterThanOrEqual(24);
    }
  });
});
