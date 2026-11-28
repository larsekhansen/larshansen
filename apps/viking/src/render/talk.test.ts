import { afterAll, describe, expect, test } from "bun:test";
import { viewFor } from "@larshansen/pixelkit/stage";
import { textTarget } from "@larshansen/pixelkit/text";
import { view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { pixels } from "../alive/frames";
import { ENCORE, ENCORE_FACES, type EncoreWords } from "../game/story";
import { ENCORE as ENCORE_LEVEL } from "../levels/encore";
import { padLayout, type Insets } from "./pad";
import { FACE, HERO_FACES, LOKI_FACES, allPortraits, heroPortrait, lokiPortrait } from "./faces";
import { drawPanel, flashOf, panelLayout, slid, type PanelLayout, type Rect, type Screen } from "./talk";

// The talk panel (order 47, ADR 0057): when Loki speaks in his own voice, his portrait and the hero's stand beside his words.
// Held here: every line tagged with an expression has it for its speaker, in both languages; the panel overlaps no control of the
// touch pad and keeps off a notch and the bar at a phone's four sizes, upright and on its side, and off the play over the stage's
// floor; with reduced motion nothing of it moves (no slide, no flash); the portraits are whole and each expression its own.

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
/** Words as a system font of weight 600 is about wide: a little over half its size a letter (the browser measures them in play). */
const measure = (t: string, font: number) => t.length * font * 0.6;

describe("every line tagged with an expression (order 47)", () => {
  test("the tags name expressions the portraits have, for lines that exist in both languages", () => {
    for (const [key, faces] of Object.entries(ENCORE_FACES)) {
      const k = key as keyof EncoreWords;
      for (const lang of ["en", "nb"] as const) expect(ENCORE[lang][k]?.length ?? 0, `${lang} ${key}`).toBeGreaterThan(0);
      expect(LOKI_FACES as readonly string[]).toContain(faces!.loki);
      expect(HERO_FACES as readonly string[]).toContain(faces!.hero);
    }
  });

  test("every line Loki says in his own voice has a tag, and no hint has one (a hint tells the player, in its bubble)", () => {
    expect(Object.keys(ENCORE_FACES).sort()).toEqual(["leaving", "piece1", "piece2", "piece3", "shout1", "shout2", "shout3", "shout4", "wake"]);
    for (const hint of ["miss", "missClub", "missCharge", "missBite", "arrival", "ending"]) expect(ENCORE_FACES[hint as keyof EncoreWords]).toBeUndefined();
  });

  test("the encore's talk shows a panel for every line he says and none for a hint", () => {
    const talk = ENCORE_LEVEL.talk!;
    const boss = { def: { floor: 200 }, hits: 0 };
    Object.assign(view, { cssW: 390, cssH: 844, k: 4, dpr: 3, camXf: 0, camYf: 0, reduced: false });
    textTarget(stand().ctx);
    for (const key of Object.keys(ENCORE_LEVEL.bossWords!)) {
      const lines = ENCORE_LEVEL.bossWords![key].en.split("\n");
      const panel = talk({ lines, until: 300, key, since: 0 }, null, null, { bar: 85, pad: [] }, boss, 10);
      expect(!!panel, key).toBe(!/^miss/.test(key));
    }
  });
});

/** A phone's screen as the page lays it out on a touch screen: its art pixels' size, its bar, its pad's controls, a notch or none. */
function screen(w: number, h: number, safe: Insets, floor: number): Screen {
  const v = viewFor(w, h, 3, 240);
  const u = v.k / 3;
  const slots = padLayout(w, h, safe);
  // Every control at once (the way in and the shield share a slot): what the pad may show at the encore.
  const pad = [slots.move, slots.enter, slots.dash, slots.jump];
  // The bar during a level: the run alone, two rows upright, one on its side, under a notch at the top.
  const bar = safe.top + (h > w ? 85 : 39);
  return { w, h, u, bar, pad, safe: { left: safe.left, right: safe.right, bottom: safe.bottom }, floor, playTop: floor - 80 * u };
}

const SIZES: [number, number][] = [[390, 844], [844, 390], [360, 640], [667, 375]];
const NOTCHES: Record<string, Insets> = {
  none: { top: 0, right: 0, bottom: 0, left: 0 },
  left: { top: 0, right: 0, bottom: 21, left: 47 },
  right: { top: 0, right: 47, bottom: 21, left: 0 },
  sides: { top: 0, right: 47, bottom: 21, left: 47 },
  upright: { top: 47, right: 0, bottom: 34, left: 0 }
};

describe("where the panel stands (order 47)", () => {
  const lines = Object.keys(ENCORE_FACES).flatMap((k) => (["en", "nb"] as const).map((lang) => ({ name: `${lang} ${k}`, text: ENCORE[lang][k as keyof EncoreWords].split("\n") })));

  test("at 390 x 844, 844 x 390, 360 x 640 and 667 x 375, with a notch or none, wherever the stage's floor is: never over a control of the pad, a notch, the home bar or the bar, nor over the play", () => {
    const wrong: string[] = [];
    let placed = 0;
    for (const [w, h] of SIZES)
      for (const [notch, safe] of Object.entries(NOTCHES)) {
        if ((notch === "upright") !== h > w && notch !== "none") continue;
        for (let floor = 0; floor <= h; floor += 8) {
          const s = screen(w, h, safe, floor);
          for (const l of lines) {
            const p = panelLayout(s, l.text, measure);
            if (!p) continue;
            placed++;
            const where = `${w}x${h} ${notch} floor ${floor} ${l.name}`;
            for (const r of [p.box, p.speaker, p.words, ...(p.listener ? [p.listener] : [])]) {
              for (const c of s.pad) if (overlaps(r, c)) wrong.push(`${where}: over a control`);
              if (r.x < safe.left || r.x + r.w > w - safe.right) wrong.push(`${where}: under a notch`);
              if (r.y + r.h > h - safe.bottom) wrong.push(`${where}: over the home bar`);
              if (r.y < s.bar) wrong.push(`${where}: under the bar`);
            }
            if (!(p.box.y >= floor || p.box.y + p.box.h <= s.playTop)) wrong.push(`${where}: over the play (${p.box.y} to ${p.box.y + p.box.h}, the floor at ${floor})`);
            if (p.lines.length < l.text.length) wrong.push(`${where}: a line lost`);
          }
        }
      }
    expect([...new Set(wrong)].slice(0, 20)).toEqual([]);
    expect(placed).toBeGreaterThan(1000);
  });

  test("where the page puts the stage's floor (two thirds down above the pad), every line has its panel at every size, both portraits upright and on a phone on its side 844 wide", () => {
    const missing: string[] = [];
    for (const [w, h] of SIZES)
      for (const [notch, safe] of Object.entries(NOTCHES)) {
        if ((notch === "upright") !== h > w && notch !== "none") continue;
        const s0 = screen(w, h, safe, 0);
        const row = Math.min(...s0.pad.map((r) => r.y));
        const s = screen(w, h, safe, Math.round(row * 0.66));
        for (const l of lines) {
          const p = panelLayout(s, l.text, measure);
          if (!p) missing.push(`${w}x${h} ${notch} ${l.name}: no room`);
          else if (!p.listener && (h > w || w >= 844)) missing.push(`${w}x${h} ${notch} ${l.name}: the hero left out`);
        }
      }
    expect(missing).toEqual([]);
  });
});

/** A stand-in document whose canvases record what is drawn on them, and a words' canvas that records every call. */
function stand() {
  const calls: string[] = [];
  const rec = (name: string) => (...a: unknown[]) => void calls.push(`${name}(${a.map((x) => (typeof x === "number" ? x.toFixed(2) : typeof x === "object" ? "canvas" : String(x))).join(",")})`);
  const ctx = new Proxy({ imageSmoothingEnabled: true, measureText: (t: string) => ({ width: t.length * 7 }) } as Record<string, unknown>, {
    get: (o, k: string) => (k in o ? o[k] : rec(k)),
    set: (o, k: string, v) => ((o[k] = v), calls.push(`${k}=${typeof v === "number" ? v.toFixed(2) : v}`), true)
  });
  (globalThis as Record<string, unknown>).document = { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillRect() {}, set fillStyle(_: string) {} }) }) };
  return { calls, ctx: ctx as unknown as CanvasRenderingContext2D };
}

describe("with reduced motion nothing of it moves (order 47)", () => {
  const was = { ...view };
  afterAll(() => Object.assign(view, was));
  const l = panelLayout(screen(390, 844, NOTCHES.none, 560), ["Higher hair, Oslo!", "Mind the wind!"], measure) as PanelLayout;

  test("no slide and no flash: all in from its first step to its last", () => {
    for (let age = 0; age < 40; age++) for (const left of [null, 0, 2, 5, 100]) expect(slid(age, left, true)).toBe(1);
    for (let age = 0; age < 40; age++) expect(flashOf(true, age, true)).toBe(0);
    // Without reduced motion it does slide in, and a shout flashes once.
    expect(slid(0, null, false)).toBeLessThan(0.5);
    expect(flashOf(true, 0, false)).toBeGreaterThan(0.5);
    expect(flashOf(true, 12, false)).toBe(0);
  });

  test("drawn at every step of a shout, coming and going, it is drawn the same", () => {
    const draws = (reduced: boolean) =>
      [0, 1, 4, 8, 11, 30].map((age) => {
        const s = stand();
        textTarget(s.ctx);
        Object.assign(view, { reduced, cssW: 390, cssH: 844, dpr: 3 });
        drawPanel(l, { loki: "shout", hero: "calm" }, 0, age, age === 30 ? 2 : null);
        return s.calls.join(";");
      });
    expect(new Set(draws(true)).size).toBe(1);
    expect(new Set(draws(false)).size).toBeGreaterThan(1);
  });
});

describe("the portraits (order 47)", () => {
  test(`every portrait is ${FACE} pixels square and whole, Loki's six at each of four stages and the hero's four`, () => {
    const all = allPortraits();
    expect(all.length).toBe(6 * 4 + 4);
    for (const p of all) {
      let n = 0;
      pixels(p.frame, 1, FACE, (c, r) => {
        expect(c >= 0 && c < FACE && r >= 0 && r < FACE).toBe(true);
        n++;
      });
      expect(n, p.frame.name).toBe(FACE * FACE);
    }
  });

  test("each expression is its own: any two of a speaker's at a stage differ by forty pixels or more", () => {
    const grid = (f: ReturnType<typeof heroPortrait>) => {
      const m = new Map<string, string>();
      pixels(f, 1, FACE, (c, r, col) => m.set(`${c},${r}`, col));
      return m;
    };
    const apart = (a: Map<string, string>, b: Map<string, string>) => [...a].filter(([k, c]) => b.get(k) !== c).length;
    const sets = [0, 1, 2, 3].map((st) => LOKI_FACES.map((f) => grid(lokiPortrait(f, st))));
    sets.push(HERO_FACES.map((f) => grid(heroPortrait(f))));
    for (const set of sets) for (let i = 0; i < set.length; i++) for (let j = i + 1; j < set.length; j++) expect(apart(set[i], set[j])).toBeGreaterThanOrEqual(40);
  });

  test("glammed he is in the glamour's neon to the last pixel (his hair, his make-up); plain, none of it is left on him", () => {
    const neon = new Set([ENEMY.hotPink, ENEMY.magenta, ENEMY.lime, ENEMY.purple]);
    const count = (st: number) => {
      let n = 0;
      pixels(lokiPortrait("smug", st), 1, FACE, (_c, _r, col) => void (neon.has(col) && n++));
      return n;
    };
    expect(count(0)).toBeGreaterThan(400);
    expect(count(3)).toBe(0);
  });
});
