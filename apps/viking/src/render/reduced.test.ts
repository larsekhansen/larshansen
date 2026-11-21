import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { ctx, lights, target, view } from "@larshansen/pixelkit/paint";
import { drawTimed } from "@larshansen/pixelkit/timed";
import { autopilot, type Move } from "../game/bot";
import { newPlay, stepPlay, type Play } from "../game/play";
import { fresh, type Progress } from "../game/progress";
import { SHIELD_RULES } from "../game/shield";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import { kartDef } from "../levels/kart";
import { kartArt } from "../levels/kartArt";
import * as ROUTES from "../levels/routes";
import { ENCORE_ROUTE } from "../levels/routes/encore";
import type { LevelDef, View } from "../levels/types";
import { areaRecorder, skyOf } from "./fields";
import { STAND_LEDGE } from "./stand";

// Order 30 (debt 5): with reduced motion nothing flashes. Two ways of holding it.
//
// 1. Every place the drawing reads the clock to turn something on and off (`Math.floor(t / n) % k`, `(t >> n) % k`) is held
//    still with reduced motion on its own line, or reads a clock already held (`tt = view.reduced ? 0 : t`), or is named
//    below with why it may run: an idle or a cycle (they say what a thing is doing: DESIGN's "Frames, shadows and depth"),
//    or a drawing that is never reached with reduced motion.
// 2. What the order looked at is drawn with its state held while the clock runs. Every boss at each of its moves, its age in
//    the move held too (what it does as a move goes on is not a flash): no colour's area comes and goes back. The ledges on
//    a beat through their warning, the map's mirror balls and the encore's stop: each colour covers the same area at every
//    step. Without reduced motion the plough's beacons flash, so the test can see one.

const SRC = resolve(dirname(import.meta.path), "..");
/** The kit's own drawing, which the levels call (named below as `kit/<file>`). */
const KIT = resolve(SRC, "../../../packages/pixelkit/src");

/** The clock read to blink, named and allowed: a file, a piece of the line, and why. */
const ALLOWED: { file: string; has: string; why: string }[] = [
  { file: "levels/akerselva.ts", has: "const k = Math.floor(t / 5) % 2", why: "the salmon's tail flicks as it leaps: a cycle, how a leap reads" },
  { file: "levels/stortinget.ts", has: "TRACK_RAT.kicking : TRACK_RAT.falling", why: "the track rat kicks as it falls: a cycle while it falls" },
  { file: "levels/nordmarka.ts", has: 'const bend = t.phase === "stuck"', why: "the troll heaves at its stuck club a pixel every other second: an idle" },
  { file: "levels/nordmarka.ts", has: 'const breath = t.phase === "asleep"', why: "the troll breathes asleep: an idle" },
  { file: "levels/nordmarka.ts", has: "Math.floor(age / 6 + i) % 2", why: "the flourish's birds: the flourish returns first with reduced motion" },
  { file: "levels/langkaia.ts", has: "const wing = Math.floor(a / 5) % 2", why: "the flourish's gulls: drawn after its `if (view.reduced) return`" },
  { file: "levels/radhuset.ts", has: "const wing = Math.floor(a / 5) % 2", why: "the flourish's pigeons: the flourish returns first with reduced motion" },
  { file: "levels/vigelandsparken.ts", has: "Math.floor((clock.t + (e.def.offset ?? 0)) / 60) % 2", why: "a statue's breath while watched: an idle" },
  { file: "levels/gamlebyen.ts", has: 'const breath = spit || s.phase === "rise"', why: "the serpent breathes reared: an idle" },
  { file: "levels/gamlebyen.ts", has: "GUARD_FRAMES.still[Math.floor(", why: "a guard's breath as it stands: an idle" },
  { file: "render/loki.ts", has: "PLAINLY.stand[Math.floor(age / 40) % 2]", why: "Loki plain, standing and breathing: an idle" },
  { file: "alive/him.ts", has: "const breath = Math.floor(s.t / 30) % 2", why: "his breath: an idle (frames.test.ts holds that reduced motion keeps it)" },
  { file: "alive/death.ts", has: "Math.floor(age /", why: "how a broken glamour leaves: `drawBreak` draws a plain change of colour with reduced motion and never calls it" },
  { file: "alive/depth.ts", has: "LAP_FRAMES[side][Math.floor(t / 16) % 3]", why: "water lapping: its clock is `drawWater`'s, held with reduced motion" },
  { file: "render/feel.ts", has: "return Math.floor(p.t / 5) % 2 ? 0.35 : 1", why: "his blink after a hit: the line before returns 1 with reduced motion" }
];

/** Every source file of the page and the kit (not the tests), as paths under `src` (the kit's as `kit/...`). */
function sources(dir = SRC, root = SRC, as = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    return d.isDirectory() ? sources(p, root, as) : d.name.endsWith(".ts") && !d.name.endsWith(".test.ts") ? [as + relative(root, p)] : [];
  });
}
const pathOf = (file: string) => (file.startsWith("kit/") ? join(KIT, file.slice(4)) : join(SRC, file));

/** The colours a drawing paints and the area each covers. */
function painted(draw: () => void): Map<string, number> {
  const rec = areaRecorder();
  const was = ctx();
  target(rec.ctx);
  try {
    draw();
  } finally {
    target(was);
    lights.length = 0;
  }
  return rec.area;
}

/** Draws `draw(t)` at `steps + 1` steps of the clock from `t0`: the colours whose area is not the same at every step. */
function changing(draw: (t: number) => void, t0: number, steps = 32): string[] {
  const frames = Array.from({ length: steps + 1 }, (_, k) => painted(() => draw(t0 + k)));
  const all = new Set(frames.flatMap((f) => [...f.keys()]));
  return [...all].filter((c) => frames.some((f) => Math.abs((f.get(c) ?? 0) - (frames[0].get(c) ?? 0)) > 0.5));
}

/** The same, but only the colours whose area changes one way and then back (it came and went, or went and came): a flash. */
function flashing(draw: (t: number) => void, t0: number, steps = 32): string[] {
  const frames = Array.from({ length: steps + 1 }, (_, k) => painted(() => draw(t0 + k)));
  const all = new Set(frames.flatMap((f) => [...f.keys()]));
  return [...all].filter((c) => {
    const turns = frames
      .slice(1)
      .map((f, k) => Math.sign(Math.round((f.get(c) ?? 0) - (frames[k].get(c) ?? 0))))
      .filter((d) => d !== 0);
    return turns.some((d, k) => k > 0 && d !== turns[k - 1]);
  });
}

const W = 320;
const H = 200;
function withView<T>(reduced: boolean, run: () => T): T {
  const was = { ...view };
  Object.assign(view, { w: W, h: H, k: 1, reduced });
  try {
    return run();
  } finally {
    Object.assign(view, was);
  }
}

/** The page's view of a play at clock `t`, the camera on him. */
function viewOf(def: LevelDef, p: Play, t: number): View {
  view.camX = view.camXf = Math.max(0, Math.round(p.body.x - W / 2));
  view.camY = view.camYf = Math.round(p.body.y - (H * 2) / 3);
  return { sky: skyOf(def, "day"), t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: p.body.x + 5, y: p.body.y + 7 }, flourish: null, facing: p.body.facing, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: p.runeAt, grounds: p.grounds?.state ?? null };
}

const routeOf = (id: string): Move[] => (id === "encore" ? ENCORE_ROUTE : (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`]);
const optsFor = (def: LevelDef) => ({ pole: def.id === "encore" || ORDER.indexOf(def.id) > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: def.id === "encore" || def.rune > 10 });
const phaseOf = (p: Play) => (p.troll as { phase?: string } | null)?.phase ?? (p.boss?.state as { phase?: string } | undefined)?.phase ?? "";

/** A boss level's route played; twenty steps into each of the boss's moves it is drawn alone, its state and its age in the move held, its clock running. */
async function boss(id: string, reduced: boolean): Promise<string[]> {
  const def = await loadLevel(id);
  const p = newPlay(def, optsFor(def));
  const pilot = autopilot(routeOf(id));
  const out: string[] = [];
  let phase = "";
  let began = 0;
  for (let s = 0; s < 60 * 400 && p.runeAt === null; s++) {
    const now = phaseOf(p);
    if (now !== phase) [phase, began] = [now, s];
    if (now && s === began + 20) {
      const t0 = p.t;
      const held = (t: number) => {
        const v = viewOf(def, p, t);
        if (p.troll) def.art.troll?.({ ...p.troll, since: p.troll.since + t - t0 }, v);
        else def.art.boss?.({ ...(p.boss!.state as { since: number }), since: (p.boss!.state as { since: number }).since + t - t0 }, v);
      };
      // Twenty-four steps: anything that blinks two and a half times a second or faster comes and goes in it; an idle of a
      // second or slower (a breath) turns at most once.
      for (const c of withView(reduced, () => flashing(held, t0, 24))) out.push(`${id} (${now}): ${c}`);
    }
    const keys = pilot(p);
    if (!keys) break;
    stepPlay(p, keys);
    if (phase === "gone") break;
  }
  return out;
}

describe("with reduced motion nothing flashes (order 30)", () => {
  test("every place the drawing reads the clock to turn something on and off holds still with reduced motion, or is an idle or a cycle named here", () => {
    const blink = /Math\.floor\(([^;]*?)\)\s*%\s*\d+|>>\s*\d+\)\s*%\s*\d+/;
    const unheld: string[] = [];
    const used = new Set<(typeof ALLOWED)[number]>();
    for (const file of [...sources(), ...sources(KIT, KIT, "kit/")]) {
      const text = readFileSync(pathOf(file), "utf8");
      const held = /\btt = view\.reduced \? 0 :/.test(text);
      text.split("\n").forEach((line, i) => {
        const m = blink.exec(line);
        if (!m || line.includes("reduced") || line.trim().startsWith("//")) return;
        const read = m[1] ?? line;
        // What it reads: a clock (t, the age of something, steps), not a place (an x, a column) or a count.
        if (!/\b(t|tt|age|a|pa|now|step|steps|time)\b|\.t\b/.test(read) || /\.x\b|\/ TILE/.test(read)) return;
        if (held && /\btt\b/.test(read)) return;
        const named = ALLOWED.find((a) => a.file === file && line.includes(a.has));
        if (named) used.add(named);
        else unheld.push(`${file}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(unheld).toEqual([]);
    // And every name still names something.
    expect(ALLOWED.filter((a) => !used.has(a)).map((a) => `${a.file}: ${a.has}`)).toEqual([]);
  });

  test("every boss, held at each of its moves (its tell, its hit, its daze or pose), draws the same at every step of the clock", async () => {
    const found: string[] = [];
    for (const id of ["nordmarka", "nabolaget", "gamlebyen", "encore"]) found.push(...(await boss(id, true)));
    expect(found).toEqual([]);
    // Without reduced motion the plough's beacons flash: the test sees it.
    expect((await boss("nabolaget", false)).length).toBeGreaterThan(0);
  }, 120_000);

  test("every ledge on a beat, through its warning, draws the same at every step of the clock", async () => {
    const found: string[] = [];
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      def.timed.forEach((l, i) => {
        const p = newPlay(def, {});
        p.body.x = l.x;
        p.body.y = l.y;
        // The first step of its warning (`timedPhase`): there `on` steps, then the warning.
        const period = l.on + l.warn + l.off;
        const warn = (((l.on - (l.offset ?? 0)) % period) + period) % period;
        const draw = (t: number) => (def.art.timed ? def.art.timed(i, viewOf(def, p, t)) : drawTimed(l, t, false, STAND_LEDGE));
        for (const c of withView(true, () => changing(draw, warn, Math.min(24, l.warn - 1)))) found.push(`${st.id} ledge ${i}: ${c}`);
      });
    }
    expect(found).toEqual([]);
  }, 60_000);

  test("the map: its mirror balls, the encore's stop, the longship and the lanterns hold still", () => {
    const all: Progress = { ...fresh(), cleared: [...ORDER], best: Object.fromEntries(ORDER.map((id) => [id, 60000])) };
    const found: string[] = [];
    for (const progress of [fresh(), all]) {
      const def = kartDef(progress, kartArt);
      const p = newPlay(def, {});
      for (const x of [100, 600, 1200, 1700]) {
        p.body.x = x;
        const draw = (t: number) => {
          const v = viewOf(def, p, t);
          def.art.back(v);
          def.art.front?.(v);
        };
        for (const c of withView(true, () => changing(draw, 0, 48))) found.push(`map at ${x}: ${c}`);
      }
    }
    expect(found).toEqual([]);
  }, 60_000);
});
