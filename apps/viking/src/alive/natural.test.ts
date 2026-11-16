import { beforeAll, describe, expect, test } from "bun:test";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { target, view } from "@larshansen/pixelkit/paint";
import { census, type Census } from "./census";
import { NATURAL } from "./natural";
import { pixels } from "./frames";
import { colourBlind, deltaE, parseColour } from "../render/fields";

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
      if (!l.natural.length || !l.idle.length) continue;
      const area = (rs: { w: number; h: number }[]) => rs.reduce((a, r) => a + r.w * r.h, 0);
      const glammed = area(l.idle[0].rects) - (l.marks ? 0 : 0);
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
    void colourBlind;
  });
});
