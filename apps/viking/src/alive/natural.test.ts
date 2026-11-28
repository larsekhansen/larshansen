import { beforeAll, describe, expect, test } from "bun:test";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { target, view } from "@larshansen/pixelkit/paint";
import { census, type Census } from "./census";
import { NATURAL } from "./natural";
import { pixels } from "./frames";
import { deltaE, parseColour } from "../render/fields";

// Order 27 (ADR 0050): the glamour. Every invader is the same map twice: glammed in neon, and its natural self in a ramp of
// its own real colours, which it turns to when the glamour breaks (a stomp, a rune) and then leaves. Natural is Oslo, neon
// is the glamour: nothing natural is neon, and nothing that moves and cannot hurt him uses a neon.

const rgb = (c: string) => parseColour(c)!.rgb;
/** The glamour's family, and the enemy palette's bodies (the warm end of it): what nothing natural may be. */
const NEON = [...new Set([...ROLES.glamour, ENEMY.plumDark, ENEMY.pink, ENEMY.amber, ENEMY.white, ENEMY.whiteShade])];
/** How near a natural colour may come to a neon of the family (CIEDE2000). */
const OFF_NEON = 8;
/** Colours that are contrast, not body: the near-black, an eye, a claw's or a tooth's pale. */
const CONTRAST = new Set<string>([ENEMY.line, ENEMY.eye, ENEMY.pale]);

let looks: Record<string, Census> = {};
beforeAll(async () => {
  looks = await census();
}, 120_000);

describe("every invader has a natural self (order 27)", () => {
  test("every look of every level has a natural ramp and a way of leaving", () => {
    const missing = Object.keys(looks).filter((name) => !NATURAL[name]);
    expect(missing).toEqual([]);
    expect(Object.keys(looks).length).toBeGreaterThanOrEqual(40);
  });

  test(`its natural self is never neon: every colour it is drawn in, but its contrast colours, stands ${OFF_NEON} or more off the glamour's family`, () => {
    const neon: string[] = [];
    for (const [name, l] of Object.entries(looks))
      for (const d of l.natural)
        for (const r of d.rects) {
          if (CONTRAST.has(r.c)) continue;
          const near = NEON.find((n) => deltaE(rgb(r.c), rgb(n)) < OFF_NEON);
          if (near) neon.push(`${name}: ${r.c} near ${near} (${deltaE(rgb(r.c), rgb(near)).toFixed(1)})`);
        }
    expect([...new Set(neon)]).toEqual([]);
  });

  test("its natural self is the same map: still and in its cycle it covers the same pixels as its glammed self without its marks", () => {
    const off: string[] = [];
    for (const [name, l] of Object.entries(looks)) {
      const area = (rs: { w: number; h: number }[]) => rs.reduce((a, r) => a + r.w * r.h, 0);
      const glammed = area(l.glammed.rects);
      const natural = area(l.natural[0].rects);
      // The marks may add pixels over its outline (a crest, shoulder pads) or cover its own (shades): never more than a third of it.
      if (natural < glammed * 0.66 || natural > glammed * 1.05) off.push(`${name}: ${natural} natural pixels to ${glammed} glammed`);
    }
    expect(off).toEqual([]);
  });

  test("every invader that moves has a glam of its own drawn into its maps (shades, a crest, pads, a band, a collar, a bolt, neon fire or tubes)", () => {
    const bare = Object.entries(looks)
      .filter(([, l]) => !l.marks || !l.marks.rects.length)
      .map(([name]) => name);
    // A jumper is drawn under the water while it waits (its marks show as it leaps); fire is its glam (the brazier, the grill).
    expect(bare.filter((n) => !["salmon", "trackrat", "brazier", "grill", "statue", "bronze"].includes(n))).toEqual([]);
  });
});

describe("a stomp knocks the glam off (order 27, section 2)", () => {
  test("every look's ending is its glamour breaking: hit in its glammed colours, then its natural self, then leaving its way (a statue or a fire stays)", () => {
    const wrong: string[] = [];
    for (const [name, l] of Object.entries(looks)) {
      const [hit, turned, going] = l.death;
      const neonIn = (d: { rects: { c: string }[] }) => d.rects.some((r) => !CONTRAST.has(r.c) && NEON.some((n) => deltaE(rgb(r.c), rgb(n)) < OFF_NEON));
      if (!hit.rects.length || !turned.rects.length || !going.rects.length) wrong.push(`${name}: a frame of its ending is empty`);
      else {
        // Leaving (its marks have flown and fallen by then), nothing of it is neon.
        if (neonIn(going)) wrong.push(`${name}: its natural self in its ending is neon`);
        const left = (d: { rects: { x: number; y: number }[] }) => Math.min(...d.rects.map((r) => r.x)) + Math.min(...d.rects.map((r) => r.y)) * 1000;
        if (NATURAL[name].leave !== "stay" && left(turned) === left(going)) wrong.push(`${name}: it does not leave`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe("what moves and cannot hurt him is natural (order 27)", () => {
  test(`the sheep, the moose, the heron and the parade's children stand ${OFF_NEON} or more off every neon of the glamour, and so do the colours the glamour's natural selves are drawn in`, async () => {
    const T = await import("./things");
    const { heronArt } = await import("../levels/ostensjovannet");
    const { MOOSE_TOP } = await import("../levels/nordmarka");
    const { paradeKidBody } = await import("../levels/slottet");
    const seen = new Map<string, Set<string>>();
    const record = (name: string, draw: () => void) => {
      const set = seen.get(name) ?? new Set<string>();
      seen.set(name, set);
      const rec = { fillStyle: "", globalAlpha: 1, fillRect() { set.add(rec.fillStyle); }, drawImage() {} };
      target(rec as unknown as CanvasRenderingContext2D);
      draw();
    };
    Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
    for (const g of [0, 10, 30]) record("sheep", () => T.sheep({ home: 20, range: 60, x: 20, bottom: 40, dir: 1, grazing: g, squash: 0, rnd: Math.random } as never));
    for (const k of [0, 400]) record("heron", () => heronArt({ pads: [], landed: null, gone: null } as never, k));
    pixels(MOOSE_TOP, 1, 60, (_c, _r, colour) => (seen.get("moose") ?? seen.set("moose", new Set()).get("moose")!).add(colour));
    for (let i = 0; i < 15; i++) record("parade", () => paradeKidBody(20, 40, i, i * 7));
    const neon: string[] = [];
    for (const [name, set] of seen)
      for (const c of set) {
        if (!c.startsWith("#") || CONTRAST.has(c)) continue;
        const near = NEON.find((n) => deltaE(rgb(c), rgb(n)) < OFF_NEON);
        if (near) neon.push(`${name}: ${c} near ${near} (${deltaE(rgb(c), rgb(near)).toFixed(1)})`);
      }
    expect(seen.size).toBe(4);
    expect([...new Set(neon)]).toEqual([]);
  });
});

// Order 48 (ADR 0058: calm Oslo, loud glamour). "The glamour louder where it is tame ... so that glammed and natural differ at a
// glance": held on the census this file already walks. Every look's glammed self differs from its natural self in at least half of
// its pixels (a pixel differs when it is gone, or 15 or more off, CIEDE2000), but those named here, each with why. Measured on
// 28 November: the swan 97 %, the statues 96 and 97 %, most 70 to 95 %; the squirrel, the nesting gull and the salmon the lowest
// that pass (55 %).
const GLAM_SHARE = 0.5;
const TAME: Record<string, string> = {
  // Lars asked for a wasp in amber and black (order 26): its glam is shades and a sheen, its bands stay its own.
  wasp: "amber and black by Lars's word (33 %)",
  // Vigelandsparken's ring-throwers are granite groups, the park's own sculpture until they throw: by the level's idea.
  ringer: "granite by the park's idea (14 %)",
  // A fox and a cat are orange of their own, and the glamour's orange is near it: found in order 48, left for a decision (a neon of
  // their own would change four levels' pictures; ADR 0058 amended says so).
  fox: "its own orange near the glamour's (25 %): left for a decision",
  cat: "its own orange near the glamour's (15 %): left for a decision"
};
describe("glammed and natural differ at a glance (order 48)", () => {
  test(`every look's glammed self differs from its natural self in ${GLAM_SHARE * 100} % or more of its pixels, but by name`, () => {
    const tame: string[] = [];
    const table: string[] = [];
    for (const [name, l] of Object.entries(looks)) {
      const at = (rs: readonly { x: number; y: number; w: number; h: number; c: string }[]) => {
        const m = new Map<number, string>();
        for (const r of rs) for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) m.set((r.y + j) * 4096 + r.x + i, r.c);
        return m;
      };
      const g = at(l.glammed.rects);
      const n = at(l.natural[0].rects);
      let differ = 0;
      for (const [k, c] of g) {
        const d = n.get(k);
        if (!d || deltaE(rgb(c), rgb(d)) >= 15) differ++;
      }
      const share = differ / g.size;
      table.push(`${name} ${(share * 100).toFixed(0)} %`);
      if (share < GLAM_SHARE && !TAME[name]) tame.push(`${name}: ${(share * 100).toFixed(1)} %`);
      // A look named here that has become loud enough comes off the list.
      if (share >= GLAM_SHARE && TAME[name]) tame.push(`${name} is named as tame but differs ${(share * 100).toFixed(1)} %: take it off the list`);
    }
    console.log(`Glammed against natural, the share of each look's pixels that differ:\n  ${table.join(", ")}`);
    expect(tame).toEqual([]);
  });
});
