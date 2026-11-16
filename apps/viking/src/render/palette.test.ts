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
import { FIELD_SHARE, areaRecorder, backdropBand, colourBlind, deltaE, levelFields, levelPaint, mixRgb, parseColour, percentile, satVal, shares, tinted, type Painted, type Rgb } from "./fields";
import { airOf, hazeOf } from "./haze";
import { drawEnemy, drawShot } from "./pickups";
import { eyes, lastShape, outlined } from "./sprite";
import { RIM as HIM_RIM, RIM_ALPHA } from "./feel";

// Order 18 (ADR 0039), order 22 (ADR 0044): colour says what a thing is. What can hurt him is drawn from the enemy
// palette (`packages/pixelkit/src/swatches/enemy.ts`) and nothing else, outlined in its warning red, a quarter larger,
// its head where he lands on it; what moves and cannot hurt him just now is outlined in the calm pale; and no
// colour of the enemy palette is near a colour any level paints as a field.

const POLE = new Set(["akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget", "bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]);
const routeOf = (id: string) => (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];
const rgb = (c: string) => parseColour(c)!.rgb;
const viewOf = (p: Play): View => ({ sky: skyFor(new Date(2026, 5, 15, 12), "day"), t: p.t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: p.body.x, y: p.body.y }, flourish: null, facing: p.body.facing, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: p.runeAt, grounds: p.grounds?.state ?? null });

/** The enemy palette's colours, and the ones a body is drawn in (not the outline's red, the near-black, the eyes, or the pale of teeth and claws). */
const PALETTE_COLOURS = new Set<string>(Object.values(ENEMY));
const BODY = [...new Set([ENEMY.plum, ENEMY.plumLight, ENEMY.orange, ENEMY.orangeLight, ENEMY.poison, ENEMY.poisonLight, ENEMY.pink, ENEMY.white])];

/**
 * The smallest difference (CIEDE2000) allowed between an enemy's body colour and a level's field, as each
 * is seen: by day as drawn; under the evening, twilight and night tints, the field tinted and the enemy
 * tinted with a quarter of its own light back over it (as `afterDark` draws it).
 */
const MIN_DELTA = 10;
/** A body and the red outline round it (order 22): by day, and as someone who cannot tell red from green sees them. */
const OFF_OUTLINE = 20;
const OFF_OUTLINE_BLIND = 10;

/** A canvas context that draws nothing: `outlined` paints its sprites on these, and the test reads what it noted. */
const fakeCtx = () => ({ fillStyle: "", globalCompositeOperation: "source-over", globalAlpha: 1, fillRect() {}, drawImage() {} });

/** Every shape `outlined` makes while drawing: its body rectangles (world pixels) and colours, and its outline's colour. */
interface Shape {
  rim: string;
  rects: { x: number; y: number; w: number; h: number; c: string }[];
}

/** Draws one enemy (or a shot) through `outlined`, as the page does (with the outline the page gives it), and returns the shape it made. */
function drawn(draw: () => void, who?: object, rim?: string): Shape | null {
  target(fakeCtx() as unknown as CanvasRenderingContext2D);
  outlined(draw, who, rim);
  const s = lastShape();
  if (!s.colours.length) return null;
  return { rim: s.rim, rects: s.colours.map((c, i) => ({ x: s.rects[i * 4] + view.camX, y: s.rects[i * 4 + 1] + view.camY, w: s.rects[i * 4 + 2], h: s.rects[i * 4 + 3], c })) };
}

describe("what can hurt him: the enemy palette", () => {
  const seen = new Map<string, { colours: Set<string>; tops: { top: number; box: number; level: string; t: number }[] }>();
  const shotColours = new Map<string, Set<string>>();
  const withEyes = new Set<string>();
  /** Outlines that were not what the thing's state says: red round what is calm, the calm pale round what is not. */
  const wrongRim: string[] = [];
  const calmSeen = new Set<string>();

  beforeAll(async () => {
    // A document whose canvases draw nothing.
    (globalThis as Record<string, unknown>).document = {
      createElement() {
        const c = { width: 0, height: 0, ctx: fakeCtx(), getContext: () => c.ctx };
        return c;
      }
    };
    Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      const p = newPlay(def, { pole: POLE.has(def.id), shield: SHIELD_RULES, hasShield: def.rune > 10 });
      const look = (e: Enemy) => {
        if (!e.alive) return;
        // As the page draws it (`foe` in main.ts): the calm pale while it cannot hurt him, the warning red while it can.
        const shape = drawn(() => void (def.art.enemy?.(e, viewOf(p)) || drawEnemy(e, p.t)), e, e.calm ? ROLES.calm : ENEMY.warning);
        const name = `${e.def.look}${e.def.kind === "thrower" && e.def.look === "gull" ? " (thrower)" : ""}`;
        const s = seen.get(name) ?? { colours: new Set<string>(), tops: [] };
        seen.set(name, s);
        if (!shape) return;
        // Calm: as the rules say, or (a guard still a statue before the first step) as its drawing says.
        const isCalm = !!e.calm || (def.id === "gamlebyen" && e.def.look === "guard" && !e.n);
        if (shape.rim !== (isCalm ? ROLES.calm : ENEMY.warning)) wrongRim.push(`${name} in ${def.id} at step ${p.t}: ${shape.rim} while ${isCalm ? "calm" : "not calm"}`);
        // What is calm (a statue as stone, a guard still a statue, a sledger pulled off) is drawn in its own colours.
        if (isCalm) {
          calmSeen.add(name);
          return;
        }
        for (const r of shape.rects) s.colours.add(r.c);
        if (eyes(e).length) withEyes.add(name);
        // Where the picture's head is, over the box, against the box's top (where he lands): not while a
        // thrower's arm is up (its arm and what it throws are over its head then).
        const box = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w };
        const over = shape.rects.filter((r) => r.x < box.x + box.w && r.x + r.w > box.x);
        if (KIND[e.def.kind].stomp && !windingUp(e, p.t) && over.length) s.tops.push({ top: Math.min(...over.map((r) => r.y)), box: box.y, level: def.id, t: p.t });
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
              if (shape && shape.rim !== ENEMY.warning) wrongRim.push(`${name}'s shot in ${def.id}: ${shape.rim}`);
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

  test("no enemy's body is the warning red of its outline (order 22): the red is the outline's alone", () => {
    const red: string[] = [];
    for (const [name, s] of seen) if (s.colours.has(ENEMY.red)) red.push(name);
    for (const [name, set] of shotColours) if (set.has(ENEMY.red)) red.push(`${name}'s shot`);
    expect(red).toEqual([]);
  });

  test(`every body colour stands off the red outline round it: ${OFF_OUTLINE} or more by day, ${OFF_OUTLINE_BLIND} or more without telling red from green`, () => {
    const near: string[] = [];
    const table: string[] = [];
    for (const c of BODY) {
      const d = deltaE(rgb(c), rgb(ENEMY.red));
      const de = deltaE(colourBlind(rgb(c), "deutan"), colourBlind(rgb(ENEMY.red), "deutan"));
      const pr = deltaE(colourBlind(rgb(c), "protan"), colourBlind(rgb(ENEMY.red), "protan"));
      table.push(`${c} ${d.toFixed(1)} (deutan ${de.toFixed(1)}, protan ${pr.toFixed(1)})`);
      if (d < OFF_OUTLINE || de < OFF_OUTLINE_BLIND || pr < OFF_OUTLINE_BLIND) near.push(table.at(-1)!);
    }
    console.log(`Bodies against their outline:\n  ${table.join("\n  ")}`);
    expect(near).toEqual([]);
  });

  test("everything is outlined as its state says: the warning red while it can hurt him, the calm pale while it cannot (a watched statue, a guard still stone, a calm swan, a sledger pulled off)", () => {
    expect(wrongRim).toEqual([]);
    // The calm ones were seen calm.
    for (const name of ["statue", "bronze", "guard", "swan"]) expect(calmSeen.has(name)).toBe(true);
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

/** What every level paints, by layer, by day: walked once, for the fields, the paint and the haze (order 22). */
const PAINTED = new Map<string, Painted>();
async function paintedOf(id: string): Promise<Painted> {
  let p = PAINTED.get(id);
  if (!p) PAINTED.set(id, (p = levelPaint(await loadLevel(id), "day")));
  return p;
}

/** The field colours of every level, by day, and the skies of every phase. */
const fields = new Map<string, Map<string, number>>();
const SKY_FIELDS = new Map<Phase, string[]>();

describe("what can hurt him stands off every level's fields", () => {
  beforeAll(async () => {
    for (const st of BUILT) {
      const def: LevelDef = await loadLevel(st.id);
      fields.set(st.id, levelFields(def, "day", FIELD_SHARE, await paintedOf(st.id)));
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
  // The paint (order 22): one yellow for every top, what moves marked in the paint by the near-black, what gives way broken in dashes.
  const TOPS = [STAND.top];
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
    for (const a of [...TOPS, ...BODIES]) for (const b of [...BODY, ENEMY.red]) if (deltaE(rgb(a), rgb(b)) < MIN_DELTA) near.push(`${a} near ${b}: ${deltaE(rgb(a), rgb(b)).toFixed(1)}`);
    expect(near).toEqual([]);
  });

});

// Every role has its colours (order 18, section 6): him, what hurts, what he stands on, what he takes, and
// what a boss shows before it acts (`swatches/roles.ts`).
describe("every role has its colours", () => {
  /** How each role is seen under a tint: him dimmed as the kit dims him; what he takes nearly as by day (it shines after dark); a boss's tell tinted, with a quarter of its own light. */
  const DIM: Record<Phase, number> = { day: 0, evening: 0.12, twilight: 0.18, night: 0.25 };
  const shown = (role: string, c: string, phase: Phase): Rgb => {
    // Things to use are marked after the night's tint, in their own light (order 19).
    if (phase === "day" || role === "use" || role === "calm") return rgb(c);
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
    now: { colours: ROLES.COLOURS.now, phases: ["day", "evening", "twilight", "night"] },
    use: { colours: ROLES.COLOURS.use, phases: ["day", "evening", "twilight", "night"] },
    // The outline of what moves and cannot hurt him keeps its light after dark, as the warning red does (order 22).
    calm: { colours: ROLES.COLOURS.calm, phases: ["day", "evening", "twilight", "night"] }
  };

  test(`his blue by day, what he takes, a boss's "now" and the mark of things to use under every sky, stand ${MIN_DELTA} or more off every level's fields`, () => {
    const near: string[] = [];
    for (const role of ["him", "take", "now", "use", "calm"])
      for (const phase of FIELDS_OF[role].phases)
        for (const [id, f] of fields)
          for (const field of [...f.keys(), ...(SKY_FIELDS.get(phase) ?? [])])
            for (const c of FIELDS_OF[role].colours) {
              const d = deltaE(shown(role, c, phase), tinted(rgb(field), phase));
              if (d < MIN_DELTA) near.push(`${role} ${c} near ${field} in ${id} (${phase}): ${d.toFixed(1)}`);
            }
    expect([...new Set(near)]).toEqual([]);
  });

  /**
   * Under the tints his blue is not held (the water is blue, and the tint brings it within 5 to 7 of his
   * tunic): what tells him apart there is the shape round him, the warm rim the page draws round him after
   * dusk (`render/feel.ts`, order 19). The rim, as drawn over each tinted field at its strength, stands the
   * set distance off that field, and off the enemies' cold rim.
   */
  test(`after dusk the warm rim round him stands ${MIN_DELTA} or more off every level's tinted fields`, () => {
    const near: string[] = [];
    const worst: Record<string, number> = {};
    for (const phase of ["evening", "twilight", "night"] as const)
      for (const [id, f] of fields)
        for (const field of [...f.keys(), ...(SKY_FIELDS.get(phase) ?? [])]) {
          const bg = tinted(rgb(field), phase);
          const d = deltaE(mixRgb(bg, rgb(HIM_RIM), RIM_ALPHA[phase]), bg);
          worst[phase] = Math.min(worst[phase] ?? Infinity, d);
          if (d < MIN_DELTA) near.push(`rim near ${field} in ${id} (${phase}): ${d.toFixed(1)}`);
        }
    console.log(`His rim's smallest distances: ${Object.entries(worst).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(", ")}; from the enemies' rim ${deltaE(rgb(HIM_RIM), rgb("#c9d8ff")).toFixed(1)}`);
    expect([...new Set(near)]).toEqual([]);
    expect(deltaE(rgb(HIM_RIM), rgb("#c9d8ff"))).toBeGreaterThanOrEqual(MIN_DELTA);
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
    enemy: "a red outline round its whole shape",
    stand: "paint on a top edge, two pixels thick (marked when it moves, broken when it gives way)",
    take: "small, round, turning, with a glint",
    him: "the one person: helmet, cape, the waffle hearts in the header; after dusk a warm rim round him",
    now: "it comes on and goes with the boss's tell",
    use: "marks at a thing's four corners, and the frame of the bubble that names the key",
    calm: "a pale outline round the whole shape of something that moves"
  };

  test("seen without telling red from green, the roles that come near each other differ by a shape the test names", () => {
    const roles = ["enemy", "stand", "take", "him", "now", "use", "calm"];
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

// Order 22 (ADR 0044, A4): flat saturated yellow on a top edge means "stand here", and nothing else in the game is
// that yellow. Every colour every level paints, whatever its share (its far layers, street, water, tiles, what
// moves and is used, and what it draws in front, by day), is held 10 or more from the paint, but by name.
describe("the paint is the only yellow of its kind", () => {
  /** Near the paint by design, and why. */
  const NEAR_PAINT: Record<string, string> = {
    // Rådhuset's bells and the clock hand's tips: he stands on them, and their tops carry the paint.
    "#e8b923": "Rådhuset's bells and the clock hand, things he stands on",
    "#f6dc7a": "the light on Rådhuset's bells",
    // A lamp's light (the kit's `LAMP`): small lit things, on a wall or a ceiling, never a top edge; after dark every light is it.
    "#ffd36b": "lamps and lit windows, never a top edge"
  };
  test("no colour a level paints is within 10 (CIEDE2000) of the paint, but the paint, its worn ends and the named", async () => {
    const near: string[] = [];
    for (const st of BUILT) {
      const painted = await paintedOf(st.id);
      for (const c of shares([painted.sky, painted.far, painted.mid, painted.near, painted.lane, painted.things]).keys()) {
        if (c === STAND.top || c === STAND.worn || NEAR_PAINT[c]) continue;
        const d = deltaE(rgb(c), rgb(STAND.top));
        if (d < MIN_DELTA) near.push(`${c} in ${st.id}: ${d.toFixed(1)}`);
      }
    }
    expect(near).toEqual([]);
  }, 60_000);
});

// Order 22 (A6): behind the play lane the far layers are quieter than what he plays with. Measured by day on every
// level's far, mid and near layers as drawn, each with its haze toward the level's air (`render/haze.ts`), as
// saturation and value (HSV) weighted by the area each colour covers.
describe("what is behind the play lane is quieter than what he plays with", () => {
  /** The figures (him, the enemies' bodies, the paint and the platforms' bodies, what he takes): their middle saturation is 0.69. */
  const FIGURES = ["him", "enemy", "stand", "take"].flatMap((r) => ROLES.COLOURS[r]);
  /** Behind the lane: nine tenths of its area at most this saturated, the middle at most this, and nine tenths of it within this span of value. */
  const BACK_S90 = 0.5;
  const BACK_S50 = 0.3;
  const BACK_V_SPAN = 0.5;
  test(`behind the lane nine tenths of the area is at most ${BACK_S90} saturated and its middle at most ${BACK_S50} (the figures' middle is 0.69), and the middle eight tenths of its value within ${BACK_V_SPAN}`, async () => {
    const figures = FIGURES.map((c) => satVal(rgb(c)));
    const s50 = percentile(figures.map((f) => ({ x: f.s, w: 1 })), 0.5);
    expect(s50).toBeGreaterThan(BACK_S90 + 0.1);
    const loud: string[] = [];
    const table: string[] = [];
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      if (def.underground) continue;
      const b = backdropBand(def, hazeOf(def), airOf(def, "day"), await paintedOf(st.id));
      if (!b.back) continue;
      const span = b.back.v90 - b.back.v10;
      table.push(`${st.id}: saturation ${b.back.s50.toFixed(2)} / ${b.back.s90.toFixed(2)}, value ${b.back.v10.toFixed(2)} to ${b.back.v90.toFixed(2)}; the street ${b.lane.s50.toFixed(2)} / ${b.lane.s90.toFixed(2)}, ${b.lane.v10.toFixed(2)} to ${b.lane.v90.toFixed(2)}`);
      if (b.back.s90 > BACK_S90 || b.back.s50 > BACK_S50 || span > BACK_V_SPAN) loud.push(table.at(-1)!);
    }
    console.log(`Behind the lane (saturation middle / nine tenths, value from a tenth to nine tenths):\n  ${table.join("\n  ")}`);
    expect(loud).toEqual([]);
  }, 60_000);
});
