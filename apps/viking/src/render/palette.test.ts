import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES, STAND } from "@larshansen/pixelkit/palette";
import { TINT } from "@larshansen/pixelkit/paint";
import type { Phase } from "@larshansen/pixelkit/oslo";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { drawSky } from "@larshansen/pixelkit/sky";
import { KIND, windingUp, type Enemy } from "../game/enemies";
import { newPlay, type Play } from "../game/play";
import { playMoves, type Move } from "../game/bot";
import { SHIELD_RULES } from "../game/shield";
import { BUILT, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import type { LevelDef, View } from "../levels/types";
import { areaRecorder, colourBlind, deltaE, levelFields, mixRgb, parseColour, tinted, type Rgb } from "./fields";
import { drawEnemy, drawShot } from "./pickups";
import { eyes, outlined } from "./sprite";

// Order 18 (ADR 0039): colour says what a thing is. What can hurt him is drawn from the enemy palette
// (`packages/pixelkit/src/swatches/enemy.ts`) and nothing else, outlined, a quarter larger, its head where
// he lands on it; and no colour of that palette is near a colour any level paints as a field.

const POLE = new Set(["akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget", "bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]);
const routeOf = (id: string) => (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];
const rgb = (c: string) => parseColour(c)!.rgb;

/** The enemy palette's colours, and the ones a body is drawn in (not the outline, the eyes, or the pale of teeth and claws). */
const PALETTE_COLOURS = new Set<string>(Object.values(ENEMY));
const BODY = [...new Set([ENEMY.red, ENEMY.redLight, ENEMY.orange, ENEMY.orangeLight, ENEMY.plum, ENEMY.plumLight, ENEMY.poison, ENEMY.poisonLight])];

/**
 * The smallest difference (CIEDE2000) allowed between an enemy's body colour and a level's field, as each
 * is seen: by day as drawn; under the evening, twilight and night tints, the field tinted and the enemy
 * tinted with a quarter of its own light back over it (as `afterDark` draws it).
 */
const MIN_DELTA = 10;

// What `outlined` paints, recorded: a stand-in for the browser's canvases, so the page's own code path runs.
interface Rec {
  fillStyle: string;
  globalCompositeOperation: string;
  rects: { x: number; y: number; w: number; h: number; c: string; op: string }[];
  images: { img: { ctx: Rec }; x: number; y: number }[];
}
const fakeCtx = (): Rec & { fillRect(x: number, y: number, w: number, h: number): void; drawImage(img: { ctx: Rec }, x: number, y: number): void } => ({
  fillStyle: "",
  globalCompositeOperation: "source-over",
  rects: [],
  images: [],
  fillRect(x, y, w, h) {
    this.rects.push({ x, y, w, h, c: this.fillStyle, op: this.globalCompositeOperation });
  },
  drawImage(img, x, y) {
    this.images.push({ img, x, y });
  }
});

/** Every shape `outlined` makes while drawing: its body rectangles (world pixels) and colours. */
interface Shape {
  rects: { x: number; y: number; w: number; h: number; c: string }[];
}

const viewOf = (p: Play): View => ({ sky: skyFor(new Date(2026, 5, 15, 12), "day"), t: p.t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: p.body.x, y: p.body.y }, flourish: null, facing: p.body.facing, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: p.runeAt, grounds: p.grounds?.state ?? null });

/**
 * Draws one enemy (or a shot) through `outlined`, as the page does, and returns the shape it made: the
 * sprite's body rectangles placed in the world. A shape seen before is copied, not made again: its
 * rectangles come from the first time.
 */
function drawn(draw: () => void, who?: object): Shape | null {
  const screen = fakeCtx();
  target(screen as unknown as CanvasRenderingContext2D);
  made.length = 0;
  outlined(draw, who);
  const image = screen.images.at(-1);
  if (!image) return null;
  const shape = shapes.get(image.img) ?? null;
  if (!shape) return null;
  return { rects: shape.rects.map((r) => ({ ...r, x: r.x + image.x, y: r.y + image.y })) };
}
/** The canvases `outlined` creates: the first of a pair holds the body, kept by the sprite (the second) it ends up in. */
const made: { ctx: Rec }[] = [];
const shapes = new Map<object, Shape>();

describe("what can hurt him: the enemy palette", () => {
  const seen = new Map<string, { colours: Set<string>; tops: { top: number; box: number; level: string; t: number }[] }>();
  const shotColours = new Map<string, Set<string>>();
  const withEyes = new Set<string>();

  beforeAll(async () => {
    // A document whose canvases record what is painted on them.
    (globalThis as Record<string, unknown>).document = {
      createElement() {
        const c = { width: 0, height: 0, ctx: fakeCtx(), getContext: () => c.ctx };
        made.push(c);
        // The second canvas of a pair is the sprite; its body is the first's rectangles.
        if (made.length % 2 === 0) shapes.set(c, { rects: made[made.length - 2].ctx.rects.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h, c: r.c })) });
        return c;
      }
    };
    Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      const p = newPlay(def, { pole: POLE.has(def.id), shield: SHIELD_RULES, hasShield: def.rune > 10 });
      const look = (e: Enemy) => {
        if (!e.alive) return;
        const shape = drawn(() => void (def.art.enemy?.(e, viewOf(p)) || drawEnemy(e, p.t)), e);
        const name = `${e.def.look}${e.def.kind === "thrower" && e.def.look === "gull" ? " (thrower)" : ""}`;
        const s = seen.get(name) ?? { colours: new Set<string>(), tops: [] };
        seen.set(name, s);
        if (!shape) return; // drawn plain: stone, or pulled off to the side
        for (const r of shape.rects) s.colours.add(r.c);
        if (eyes(e).length) withEyes.add(name);
        // Where the picture's head is, over the box, against the box's top (where he lands): not while a
        // thrower's arm is up (its arm and what it throws are over its head then).
        const box = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w };
        const over = shape.rects.filter((r) => r.x < box.x + box.w && r.x + r.w > box.x);
        if (KIND[e.def.kind].stomp && !e.calm && !windingUp(e, p.t) && over.length) s.tops.push({ top: Math.min(...over.map((r) => r.y)), box: box.y, level: def.id, t: p.t });
      };
      playMoves(p, routeOf(def.id), {
        max: 60 * 300,
        until: (q) => {
          if (q.t % 7 === 0) {
            q.enemies.forEach(look);
            for (const sh of q.shots) {
              const name = q.enemies[sh.by]?.def.look ?? "?";
              const shape = drawn(() => void (def.art.shot?.(sh, viewOf(q)) || drawShot(sh)));
              const set = shotColours.get(name) ?? new Set<string>();
              shotColours.set(name, set);
              for (const r of shape?.rects ?? []) set.add(r.c);
            }
          }
          return false;
        }
      });
    }
  }, 120_000);

  afterAll(() => {
    delete (globalThis as Record<string, unknown>).document;
  });

  test("every enemy look's colours, and what it throws, come from the enemy palette and nothing else", () => {
    const strays: string[] = [];
    for (const [name, s] of seen) for (const c of s.colours) if (!PALETTE_COLOURS.has(c)) strays.push(`${name}: ${c}`);
    for (const [name, set] of shotColours) for (const c of set) if (!PALETTE_COLOURS.has(c)) strays.push(`${name}'s shot: ${c}`);
    expect(strays).toEqual([]);
    // Every kind of enemy in the game was drawn.
    expect(seen.size).toBeGreaterThanOrEqual(39);
  });

  test("every enemy has eyes that shine after dark, but the things with none (a scooter, a trolley, a grill, an umbrella, a brazier, an anthill, a hot-dog cart)", () => {
    const eyeless = [...seen.keys()].filter((n) => !withEyes.has(n));
    expect(eyeless.filter((n) => !["scooter", "trolley", "grill", "umbrella", "brazier", "anthill", "hotdog"].includes(n))).toEqual([]);
  });

  test("stomping works as drawn: the head he lands on is where the picture's head is, within two pixels of the box's top", () => {
    const off: string[] = [];
    for (const [name, s] of seen) {
      const worst = s.tops.reduce((w, x) => (Math.abs(x.top - x.box) > Math.abs(w.top - w.box) ? x : w), s.tops[0] ?? { top: 0, box: 0, level: "", t: 0 });
      if (s.tops.length && Math.abs(worst.top - worst.box) > 2) off.push(`${name}: drawn top ${worst.top - worst.box > 0 ? "below" : "above"} its box by ${Math.abs(worst.top - worst.box)} (${worst.level}, step ${worst.t})`);
    }
    expect(off).toEqual([]);
  });
});

/** The sun by day and in the evening, and the moon (the kit's `sky.ts`): things in the sky, not fields. */
const SKY_BODIES = ["#fff3b8", "#ffb26b", "#e9eefb"];

/** The field colours of every level, by day, and the skies of every phase. */
const fields = new Map<string, Map<string, number>>();
const SKY_FIELDS = new Map<Phase, string[]>();

describe("what can hurt him stands off every level's fields", () => {
  beforeAll(async () => {
    for (const st of BUILT) {
      const def: LevelDef = await loadLevel(st.id);
      fields.set(st.id, levelFields(def, "day"));
    }
    for (const phase of ["day", "evening", "twilight", "night"] as Phase[]) {
      const rec = areaRecorder();
      target(rec.ctx);
      Object.assign(view, { w: 320, h: 200, camX: 0, camY: 0 });
      drawSky(skyFor(new Date(2026, 5, 15, 12), phase), 0);
      // The sky's own colours and its clouds, but not the sun or the moon: a disc, not a field.
      SKY_FIELDS.set(phase, [...rec.area.keys()].filter((c) => !SKY_BODIES.includes(c)));
    }
  }, 120_000);

  test(`no body colour of the enemy palette is within ${MIN_DELTA} (CIEDE2000) of any level's ground, wall, sky, water or far-layer colour, by day and under the evening, twilight and night tints`, () => {
    const near: string[] = [];
    for (const phase of ["day", "evening", "twilight", "night"] as Phase[])
      for (const [id, f] of fields)
        for (const field of [...f.keys(), ...(SKY_FIELDS.get(phase) ?? [])]) {
          const bg = tinted(rgb(field), phase);
          for (const c of BODY) {
            const fg: Rgb = phase === "day" ? rgb(c) : mixRgb(tinted(rgb(c), phase), rgb(c), 0.25);
            const d = deltaE(fg, bg);
            if (d < MIN_DELTA) near.push(`${c} near ${field} in ${id} (${phase}): ${d.toFixed(1)}`);
          }
        }
    expect([...new Set(near)]).toEqual([]);
  });

  // What he can stand on (order 18, section 5): the standing top, the stripe of what moves and the dashes of
  // what gives way keep their light after dark (a fifth tinted, as the skilling); the bodies are tinted as
  // everything is, so under a tint they are held to the day's distance shrunk as the tint shrinks every
  // difference (a tint of alpha a leaves about 1 - a of it). The dark line under is a contrast line, as the
  // enemies' outline is: it sits on the platform, not on the field.
  const TOPS = [STAND.top, STAND.moving, STAND.warn];
  const BODIES = [STAND.body, STAND.bodyLight, STAND.bodyDark];
  const alphaOf = (phase: Phase) => (TINT[phase] ? parseColour(TINT[phase])!.a : 0);

  test(`no colour of the platform palette is within ${MIN_DELTA} of any level's field by day; its tops keep that under every tint, its bodies the day's distance as the tint shrinks it`, () => {
    const near: string[] = [];
    for (const phase of ["day", "evening", "twilight", "night"] as Phase[])
      for (const [id, f] of fields)
        for (const field of [...f.keys(), ...(SKY_FIELDS.get(phase) ?? [])]) {
          const bg = tinted(rgb(field), phase);
          for (const c of TOPS) {
            const fg: Rgb = phase === "day" ? rgb(c) : mixRgb(tinted(rgb(c), phase), rgb(c), 0.8);
            const d = deltaE(fg, bg);
            if (d < MIN_DELTA) near.push(`top ${c} near ${field} in ${id} (${phase}): ${d.toFixed(1)}`);
          }
          for (const c of BODIES) {
            const d = deltaE(tinted(rgb(c), phase), bg);
            if (d < MIN_DELTA * (1 - alphaOf(phase))) near.push(`body ${c} near ${field} in ${id} (${phase}): ${d.toFixed(1)}`);
          }
        }
    expect([...new Set(near)]).toEqual([]);
  });

  test(`what he can stand on and what can hurt him never share a colour: every platform colour is ${MIN_DELTA} or more from every enemy colour`, () => {
    const near: string[] = [];
    for (const a of [...TOPS, ...BODIES]) for (const b of BODY) if (deltaE(rgb(a), rgb(b)) < MIN_DELTA) near.push(`${a} near ${b}: ${deltaE(rgb(a), rgb(b)).toFixed(1)}`);
    expect(near).toEqual([]);
  });

});

// Every role has its colours (order 18, section 6): him, what hurts, what he stands on, what he takes, and
// what a boss shows before it acts (`swatches/roles.ts`).
describe("every role has its colours", () => {
  /** How each role is seen under a tint: him dimmed as the kit dims him; what he takes nearly as by day (it shines after dark); a boss's tell tinted, with a quarter of its own light. */
  const DIM: Record<Phase, number> = { day: 0, evening: 0.12, twilight: 0.18, night: 0.25 };
  const shown = (role: string, c: string, phase: Phase): Rgb => {
    if (phase === "day") return rgb(c);
    if (role === "him") return mixRgb(rgb(c), rgb("#141c46"), DIM[phase]);
    return mixRgb(tinted(rgb(c), phase), rgb(c), role === "take" ? 0.8 : 0.25);
  };

  /**
   * His blue is his alone: the tunic is held to the distance by day. Under the tints it is not (the game's
   * water is blue, and the tint brings it nearer him than the day does: the hand-back of order 18 has the
   * numbers), and his helmet's iron and his skin are held only against the other roles: a stone city has
   * greys, and a palace has his skin's cream.
   */
  const FIELDS_OF: Record<string, { colours: readonly string[]; phases: Phase[] }> = {
    him: { colours: [ROLES.him.tunic], phases: ["day"] },
    // The copper of a coin and the gold of a bracteate; their rims and glints are details on them, as an enemy's eyes are.
    take: { colours: [ROLES.take.copper, ROLES.take.gold, ROLES.take.goldDark], phases: ["day", "evening", "twilight", "night"] },
    now: { colours: ROLES.COLOURS.now, phases: ["day", "evening", "twilight", "night"] }
  };

  test(`his blue by day, what he takes and a boss's "now" under every sky, stand ${MIN_DELTA} or more off every level's fields`, () => {
    const near: string[] = [];
    for (const role of ["him", "take", "now"])
      for (const phase of FIELDS_OF[role].phases)
        for (const [id, f] of fields)
          for (const field of [...f.keys(), ...(SKY_FIELDS.get(phase) ?? [])])
            for (const c of FIELDS_OF[role].colours) {
              const d = deltaE(shown(role, c, phase), tinted(rgb(field), phase));
              if (d < MIN_DELTA) near.push(`${role} ${c} near ${field} in ${id} (${phase}): ${d.toFixed(1)}`);
            }
    expect([...new Set(near)]).toEqual([]);
  });

  /** Where two roles may be near, by name, and why: none. */
  const NEAR_BY_DESIGN: string[] = [];

  test(`every role's colours stand ${MIN_DELTA} or more from every other role's`, () => {
    const roles = Object.keys(ROLES.COLOURS);
    const near: string[] = [];
    const smallest: string[] = [];
    for (let i = 0; i < roles.length; i++)
      for (let j = i + 1; j < roles.length; j++) {
        let worst = { d: Infinity, a: "", b: "" };
        for (const a of ROLES.COLOURS[roles[i]]) for (const b of ROLES.COLOURS[roles[j]]) {
          const d = deltaE(rgb(a), rgb(b));
          if (d < worst.d) worst = { d, a, b };
        }
        smallest.push(`${roles[i]} / ${roles[j]}: ${worst.d.toFixed(1)} (${worst.a}, ${worst.b})`);
        if (worst.d < MIN_DELTA && !NEAR_BY_DESIGN.includes(`${roles[i]}/${roles[j]}`)) near.push(smallest.at(-1)!);
      }
    console.log(`The roles' smallest distances (CIEDE2000):\n  ${smallest.join("\n  ")}`);
    expect(near).toEqual([]);
  });

  /**
   * Seen with deuteranopia or protanopia, colour alone cannot keep every role apart (red and gold, teal and
   * grey come together). Where it does not, each role carries a shape of its own, named here: the test holds
   * that every pair that comes nearer than the set distance has one on both sides.
   */
  const SHAPE: Record<string, string> = {
    enemy: "a dark outline round its whole shape",
    stand: "a top edge two pixels thick (striped when it moves, broken when it gives way)",
    take: "small, round, turning, with a glint",
    him: "the one person: helmet, cape, the waffle hearts in the header",
    now: "it comes on and goes with the boss's tell"
  };

  test("seen without telling red from green, the roles that come near each other differ by a shape the test names", () => {
    const roles = ["enemy", "stand", "take", "him", "now"];
    const table: string[] = [];
    const unnamed: string[] = [];
    for (const kind of ["deutan", "protan"] as const)
      for (let i = 0; i < roles.length; i++)
        for (let j = i + 1; j < roles.length; j++) {
          let worst = Infinity;
          for (const a of ROLES.COLOURS[roles[i]]) for (const b of ROLES.COLOURS[roles[j]]) worst = Math.min(worst, deltaE(colourBlind(rgb(a), kind), colourBlind(rgb(b), kind)));
          table.push(`${kind} ${roles[i]} / ${roles[j]}: ${worst.toFixed(1)}${worst < MIN_DELTA ? ` (apart by shape: ${SHAPE[roles[i]]}; ${SHAPE[roles[j]]})` : ""}`);
          if (worst < MIN_DELTA && (!SHAPE[roles[i]] || !SHAPE[roles[j]])) unnamed.push(`${kind} ${roles[i]}/${roles[j]}`);
        }
    console.log(`Colour-blind distances:\n  ${table.join("\n  ")}`);
    expect(unnamed).toEqual([]);
  });

  test("the role index agrees with what draws him: his colours are the person's", async () => {
    const src = await Bun.file(new URL("../../../../packages/pixelkit/src/person.ts", import.meta.url)).text();
    for (const c of [ROLES.him.tunic, ROLES.him.skin]) expect(src).toContain(c);
  });
});
