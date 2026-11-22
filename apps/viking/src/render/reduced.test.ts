import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { carrierDrawn, carrierShown, drawCarrier } from "@larshansen/pixelkit/carrier";
import { drawCheckpoint } from "@larshansen/pixelkit/checkpoint";
import { TILE } from "@larshansen/pixelkit/config";
import { drawCannon, drawDrum } from "@larshansen/pixelkit/launcher";
import { ctx, lights, target, view } from "@larshansen/pixelkit/paint";
import { textTarget } from "@larshansen/pixelkit/text";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { drawSky } from "@larshansen/pixelkit/sky";
import { drawTimed, timedPhase } from "@larshansen/pixelkit/timed";
import { invasion } from "../alive/invasion";
import { autopilot, type Move } from "../game/bot";
import { leap, type Enemy, type Shot } from "../game/enemies";
import { newPlay, stepPlay, type Play } from "../game/play";
import { fresh, type Progress } from "../game/progress";
import { RUNE_CHARS } from "../game/runes";
import { SHIELD_RULES } from "../game/shield";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import { kartDef } from "../levels/kart";
import { kartArt } from "../levels/kartArt";
import * as ROUTES from "../levels/routes";
import { ENCORE_ROUTE } from "../levels/routes/encore";
import type { LevelDef, View } from "../levels/types";
import { drawBracteate, drawRune, drawSheep } from "./actors";
import { bannerAlpha } from "./banner";
import { afterDark, runeFlight } from "./dusk";
import { createFeel } from "./feel";
import { ANY_METHOD, NO_METHOD, areaRecorder, skyOf } from "./fields";
import { LOOKS, drawBench, drawCheese, drawEnemy, drawShot, drawSkilling } from "./pickups";
import { forgetShapes, freshRings, outlined } from "./sprite";
import { STAND_LEDGE, hazardEdge, standTop, standing } from "./stand";
import { drawTiles, drawWater } from "./tiles";

// With reduced motion nothing flashes (order 30, debt 5; order 31, item 4).
//
// 1. Every drawing path, watched with the clock running and the world held (order 31): what a level draws behind and in front
//    of the lane, across the whole level (the sky, the far layers, the street's backdrop and every prop in it, the invaders'
//    scenery, the water, the tiles, what is in front, the night), and every thing in it alone (each carrier, ledge on a beat,
//    cannon, drum, flag, bench, sheep, skilling, cheese, every enemy of every kind as the scripted route finds it, what is
//    thrown, what hurts and is not an enemy, the bracteate, the rune, the standing tops), and the line map with no runes and
//    with every rune. Each is drawn into a recording canvas at several steps of the clock, and every call it makes is kept
//    (its colour, its alpha, its place; a copy by which kept piece it copies): with reduced motion the recordings must be
//    identical where the world is identical. This replaces order 30's search of the source for two blink idioms, which a
//    blink written any other way passed: here nothing is read, everything is drawn.
//    - What a level draws across itself must be identical at every step, but what is named below with why: the world's own
//      motion where its drawing reads the clock (a wheel turning with its buckets, a gust's leaves with its beat, a board
//      counting down to the next train). Nothing named comes back to a recording it left within 24 steps.
//    - A thing held as the route leaves it may change as the clock runs (an idle: a breath, a blink of the eyes; the world
//      under it: a ledge's phase), but it never comes back to a recording it left within 24 steps: anything that turns on and
//      off two and a half times a second or faster does (its colour comes and goes); an idle of a second or slower turns at
//      most once. Where the world it reads moves (a carrier the kit draws, a ledge going through its beat) the window is one
//      in which it stands still.
// 2. Every boss at each of its moves, its age in the move held (order 30): no colour's area comes and goes back.
// 3. The ledges on a beat through their warning, and the map's mirror balls and the encore's stop: each colour the same area
//    at every step (order 30).
// 4. The cards (order 31): the only motion a card has is CSS, and every animation in the page's styles is on a class the page
//    sets only without reduced motion.
// 5. What moves by the clock (order 32): every jumper in its leap (and until order 36 every carrier the kit drew, which no
//    level does any more: a level's own carriers are part 1's),
//    each recorded relative to where it is: at a place it is drawn one way (a leap's own named cycle, as many as its frames), and
//    a drawing it left never comes back elsewhere. (A level's own carriers take their place from the page, so part 1 draws them
//    held where they are with the clock running, whether they stand or move.)
// 6. What `render/feel.ts` draws (order 32): him, the answers to what just happened, the marks of things to use, the shadows,
//    the world held a moment along every route and just after anything happens, the clock running: it never comes back.
// 7. What `main.ts` drew itself until order 33 moved it where a test can reach it: after dusk what moves, what he takes, what hurts
//    and what he stands on keeping their light (`afterDark`, `render/dusk.ts`), along every route at night, the world held and the
//    clock running: it never comes back; the rune's flight to the header (`runeFlight`): one movement, never coming back (it still
//    flies with reduced motion: a question for Lars); the banner's fade (`bannerAlpha`): with reduced motion there and then gone.
//    Not drawn here: the maze.

const SRC = resolve(dirname(import.meta.path), "..");

/**
 * What a level draws across itself that changes as the clock runs with reduced motion, and why: the world's own motion, where
 * the drawing reads the clock for it. A level and a path (`sky`, `far`, `mid`, `near`, `back`, `invasion`, `water`, `tiles`,
 * `front`, `night`).
 */
const MOVES: { level: string; path: string; why: string }[] = [
  { level: "akerselva", path: "back", why: "the water wheel turns with its buckets, which are carriers on its orbit (the world)" },
  { level: "ekeberg", path: "back", why: "a gust's leaves come with its beat (its warning and its push), held in place" },
  { level: "stortinget", path: "front", why: "the platform board counts down to the next train (the timetable)" },
  { level: "bygdoy", path: "front", why: "the rocking decks tilt on their beat (ground he stands on); the balsa bundles sink as the play has it" },
  { level: "vigelandsparken", path: "back", why: "the loose slab over the broken span drops and comes back on the Angry Boy's beat (a ledge on a beat)" },
  { level: "vigelandsparken", path: "front", why: "the same slab's shadow" },
  { level: "korketrekkeren", path: "front", why: "the crossing's barrier comes down on its beat, its lights lit and still while it warns" },
  { level: "bjorvika", path: "back", why: "the welder's sparks come with their beat, held in place, and their light with them" },
  { level: "bjorvika", path: "front", why: "a gust's dust comes with its beat, held in place" }
];

/** A canvas made while the test draws as a browser would: it draws nothing, and its id says which it is. */
const canvasIds = new WeakMap<object, number>();
let canvases = 0;
const NOWHERE = Object.setPrototypeOf({ canvas: { width: 4096, height: 4096 } }, NO_METHOD) as Record<string, unknown>;
function fakeCanvas() {
  const c = { width: 0, height: 0, getContext: () => NOWHERE };
  canvasIds.set(c, ++canvases);
  return c;
}
/**
 * Draws as the page does in a browser (kept pieces, stamps and outlined shapes made once and copied), on canvases that draw
 * nothing: a copy is recorded by which piece it copies. Outside it the test's other drawings are as before.
 */
function asInBrowser<T>(run: () => T): T {
  const g = globalThis as { document?: unknown };
  const was = g.document;
  g.document = { createElement: fakeCanvas };
  try {
    return run();
  } finally {
    if (was === undefined) delete g.document;
    else g.document = was;
  }
}

/** A string's FNV-1a hash, worked out once a string (order 35: the recorder mixed a string it built on every call, char by char). */
const HASHED = new Map<string, number>();
function fnv(s: string, h = 0x811c9dc5): number {
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const hashOf = (s: string) => {
  let h = HASHED.get(s);
  if (h === undefined) HASHED.set(s, (h = fnv(s)));
  return h;
};
const F64 = new Float64Array(1);
const U32 = new Uint32Array(F64.buffer);

/**
 * A context that draws nothing and keeps a fingerprint of every call made to it, and of the lights registered meanwhile; with
 * `at`, every place in it relative to that point (order 32: a moving thing recorded where it is, so only what changes in its
 * drawing besides its place changes the fingerprint). Each call mixes what it is (a fill, a copy, a move, a text), its colour
 * and alpha and how it is laid, and every number it was given, exactly (both halves of each number's bits).
 */
function recorder(w: number, h: number, at = { x: 0, y: 0 }) {
  let print = 0x811c9dc5;
  const mix = (n: number) => {
    print = Math.imul(print ^ n, 16777619);
  };
  const num = (n: number) => {
    // Nought is nought whatever its sign, as it was written into the fingerprint's text before.
    F64[0] = n === 0 ? 0 : n;
    mix(U32[0]);
    mix(U32[1]);
  };
  let style: unknown = "#000000";
  const key = (s: unknown) => (typeof s === "string" ? s : s && typeof s === "object" && "stops" in s ? `g${(s as { stops: string[] }).stops.join()}` : String(s));
  type Self = { globalAlpha: number; globalCompositeOperation: string };
  const base: Record<string, unknown> = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: w, height: h },
    get fillStyle() {
      return style;
    },
    set fillStyle(v: unknown) {
      style = v;
    },
    createLinearGradient: (...at: number[]) => {
      const stops: string[] = [at.join()];
      return { stops, addColorStop: (o: number, c: string) => stops.push(`${o}:${c}`) };
    },
    createRadialGradient: (...at: number[]) => {
      const stops: string[] = [`r${at.join()}`];
      return { stops, addColorStop: (o: number, c: string) => stops.push(`${o}:${c}`) };
    },
    fillRect(this: Self, x: number, y: number, rw: number, rh: number) {
      mix(1);
      mix(hashOf(key(style)));
      num(this.globalAlpha);
      mix(hashOf(this.globalCompositeOperation));
      num(x - at.x);
      num(y - at.y);
      num(rw);
      num(rh);
    },
    drawImage(this: Self, src: object, ...a: number[]) {
      const d = a.length >= 8 ? 4 : 0;
      mix(2);
      mix(canvasIds.get(src) ?? -1);
      mix(a.length);
      for (let i = 0; i < a.length; i++) num(i === d ? a[i] - at.x : i === d + 1 ? a[i] - at.y : a[i]);
      num(this.globalAlpha);
      mix(hashOf(this.globalCompositeOperation));
    },
    translate: (x: number, y: number) => (mix(3), num(x), num(y)),
    setTransform: (...m: number[]) => (mix(4), mix(m.length), m.forEach(num)),
    fillText(this: Self, text: string, x: number, y: number) {
      mix(5);
      mix(hashOf(text));
      num(x - at.x);
      num(y - at.y);
      mix(hashOf(key(style)));
      num(this.globalAlpha);
    }
  };
  Object.setPrototypeOf(base, ANY_METHOD);
  return {
    ctx: base as unknown as CanvasRenderingContext2D,
    done() {
      mix(fnv(JSON.stringify(lights.map((l) => ({ ...l, x: l.x - at.x - view.camX, y: l.y - at.y - view.camY })))));
      lights.length = 0;
      return print >>> 0;
    }
  };
}

/** The recordings of `draw(t)` at each clock in `clocks` (after one drawing at the first, unrecorded, so what is made once is made). */
function recordings(draw: (t: number) => void, clocks: number[], w: number, h: number, known = new Map<number, number>()): number[] {
  const was = ctx();
  try {
    if (!known.size) {
      target(recorder(w, h).ctx);
      freshRings();
      draw(clocks[0]);
      lights.length = 0;
    }
    return clocks.map((t) => {
      // A clock already recorded is not drawn again (order 35): the same drawing makes the same recording.
      const had = known.get(t);
      if (had !== undefined) return had;
      const rec = recorder(w, h);
      target(rec.ctx);
      freshRings();
      draw(t);
      return rec.done();
    });
  } finally {
    target(was);
    lights.length = 0;
  }
}

/** Whether a run of recordings comes back to one it left: A, then B, then A again. */
function comesBack(prints: number[]): boolean {
  const left = new Set<number>();
  for (let i = 1; i < prints.length; i++)
    if (prints[i] !== prints[i - 1]) {
      left.add(prints[i - 1]);
      if (left.has(prints[i])) return true;
    }
  return false;
}

/** Twenty-four steps and one: anything that turns on and off two and a half times a second or faster comes back in it. */
const DENSE = Array.from({ length: 25 }, (_, k) => k);
/** Steps at which to look for any change at all, cheaply: a blink of any period changes at one of them. */
const SPARSE = [0, 1, 3, 7, 13, 21];

const W = 320;
const H = 200;
/** A view of `w` x `h` with reduced motion (or not), its camera at (x, y). */
function withView<T>(reduced: boolean, run: () => T, at?: { x: number; y: number; w: number; h: number }): T {
  const was = { ...view };
  Object.assign(view, { w: at?.w ?? W, h: at?.h ?? H, k: 1, reduced });
  if (at) Object.assign(view, { camX: at.x, camXf: at.x, camY: at.y, camYf: at.y });
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

/** Every level to watch: the sixteen, the encore, and the line map with no runes and with every rune. */
async function everyLevel(): Promise<{ name: string; def: LevelDef }[]> {
  const all: Progress = { ...fresh(), cleared: [...ORDER], best: Object.fromEntries(ORDER.map((id) => [id, 60000])) };
  const out = [];
  for (const st of BUILT) out.push({ name: st.id, def: await loadLevel(st.id) });
  out.push({ name: "encore", def: await loadLevel("encore") });
  out.push({ name: "kart", def: kartDef(fresh(), kartArt) }, { name: "kart (every rune)", def: kartDef(all, kartArt) });
  return out;
}

/**
 * A level's scenery across the whole of it, view by view, each path watched alone: which paths change, where, and whether
 * one that changes comes back within 24 steps. The play stands at its start.
 */
function scenery(name: string, def: LevelDef) {
  const p = newPlay(def, optsFor(def));
  const map = p.map;
  const sky = skyOf(def, "day");
  const v: View = { sky, t: 0, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: 0, y: 0 }, flourish: null, facing: 1, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: null, grounds: p.grounds?.state ?? null };
  const art = def.art;
  const horizon = map.height - 4 * TILE - 34;
  const paths: [string, (t: number) => void][] = [
    ["sky", (t) => drawSky(sky, t, horizon)],
    ["far", () => art.far?.(v)],
    ["mid", () => art.mid?.(v)],
    ["near", () => art.near?.(v)],
    ["back", () => art.back(v)],
    ["invasion", (t) => invasion(def.id, t)],
    ["water", (t) => drawWater(map, t)],
    ["tiles", () => drawTiles(map, art, sky, def.underground)],
    ["front", () => art.front?.(v)],
    ["night", () => art.night?.(v, p.body, [], map)]
  ];
  const changed = new Map<string, { at: string; back: boolean }>();
  let n = 0;
  // Views four times a phone's: fewer of them to cover the level, and the same drawing.
  const [w, h] = [2 * W, 2 * H];
  for (let y = -h; y < map.height + h / 2; y += h)
    for (let x = 0; x < map.width; x += w) {
      const t0 = 600 + ((n++ * 37) % 500);
      withView(
        true,
        () => {
          v.him = { x: x + w / 2, y: y + h / 2 };
          for (const [path, draw] of paths) {
            const at = (t: number) => ((v.t = t), draw(t));
            const sparse = recordings(at, SPARSE.map((k) => t0 + k), w, h);
            if (sparse.every((r) => r === sparse[0])) continue;
            const key = `${name} ${path}`;
            const dense = recordings(at, DENSE.map((k) => t0 + k), w, h, new Map(SPARSE.map((k, i) => [t0 + k, sparse[i]])));
            const was = changed.get(key);
            changed.set(key, { at: was?.at ?? `${x},${y}`, back: (was?.back ?? false) || comesBack(dense) });
          }
        },
        { x, y, w, h }
      );
    }
  return changed;
}

/** The things of a level, each alone as the play has it now: a name and how to draw it at clock `t` (null where its world does not stand still from `t0` to `t1`). */
function thingsOf(def: LevelDef, p: Play, t0: number, t1: number): [string, ((t: number, v: View) => void) | null][] {
  const art = def.art;
  const snow = skyOf(def, "day").snow;
  const out: [string, ((t: number, v: View) => void) | null][] = [];
  const still = <T>(f: (t: number) => T) => {
    const a = JSON.stringify(f(t0));
    for (let t = t0 + 1; t <= t1; t++) if (JSON.stringify(f(t)) !== a) return false;
    return true;
  };
  def.carriers.forEach((d, i) => {
    const at = carrierDrawn(d, p.t, 1);
    // The level's own drawing is given where the carrier is; the kit's reads it from the clock, so only while it stands.
    // (A carrier on a timetable comes and goes as the clock says, a train at a tunnel's mouth: only while it stays.)
    const shown = still((t) => carrierShown(d, t));
    out.push([`carrier ${i}`, !shown ? null : art.carrier ? (_t, v) => art.carrier!(i, at, v) : still((t) => carrierDrawn(d, t, 1)) ? (t) => drawCarrier(d, t, 1, snow, STAND_LEDGE) : null]);
    out.push([`carrier ${i}'s paint`, (t) => standTop(at.x, at.y, d.w, "moves", false, t)]);
  });
  def.timed.forEach((l, i) => {
    const same = still((t) => timedPhase(t, l));
    out.push([`ledge ${i}`, same ? (t, v) => (art.timed ? art.timed(i, v) : drawTimed(l, t, snow, STAND_LEDGE)) : null]);
    out.push([`ledge ${i}'s paint`, same ? (t) => timedPhase(t, l) !== "off" && standTop(l.x, l.y, l.w, "gives", timedPhase(t, l) === "warn") : null]);
  });
  // What happened to a thing (fired, drummed, raised) is held at its age, as the bosses' moves are.
  p.cannons.forEach((l, i) => out.push([`cannon ${i}`, (t, v) => (art.cannon ? art.cannon(i, l, -999, p.firedAt[i] + t - p.t, v) : drawCannon(l, t, -999, p.firedAt[i] + t - p.t))]));
  p.drums.forEach((l, i) => out.push([`drum ${i}`, (t, v) => (art.drum ? art.drum(i, l, p.drummedAt[i] + t - p.t, v) : drawDrum(l, t, p.drummedAt[i] + t - p.t))]));
  p.flags.forEach((f, i) => {
    const up = p.raisedAt[i];
    out.push([`flag ${i}`, (t, v) => void (art.flag?.(i, f, up === null ? null : up + t - p.t, v) || (LOOKS.flag ?? drawCheckpoint)(f, up === null ? null : up + t - p.t, t, def.id))]);
  });
  p.benches.forEach((s, i) => out.push([`bench ${i}`, () => drawBench(s.x, s.bottom, false)]));
  p.sheep.forEach((s, i) => out.push([`sheep ${i}`, () => outlined(() => drawSheep(s), undefined, ROLES.calm)]));
  p.skilling.forEach((s, i) => s.at === null && out.push([`skilling ${i}`, (t) => drawSkilling(s.box.x + 1, s.box.y + 1, t, i)]));
  if (p.cheese && p.cheese.at === null) out.push(["cheese", (t) => drawCheese(p.cheese!.box.x, p.cheese!.box.y - 2, t)]);
  // A jumper leaps on its beat as the clock says (a salmon, the track rat, the Angry Boy): only while its leap stands still.
  p.enemies.forEach((e, i) => {
    if (!e.alive) return;
    const draw = (_t: number, v: View) => outlined(() => void (art.enemy?.(e, v) || drawEnemy(e, v.t)), e, e.calm ? ROLES.calm : ENEMY.warning);
    out.push([`enemy ${i} (${e.def.look ?? e.def.kind})`, e.def.kind !== "jumper" || still((t) => leap(e, t)) ? draw : null]);
  });
  p.shots.forEach((s, i) => out.push([`shot ${i}`, (_t, v) => outlined(() => void (art.shot?.(s, v) || drawShot(s)))]));
  (def.hazards ?? []).forEach((h, i) => out.push([`hazard ${i}`, (t) => hazardEdge(h, t)]));
  if (p.bracteate && p.bracteateAt === null) out.push(["bracteate", (t) => drawBracteate(p.bracteate!.x, p.bracteate!.y, t)]);
  if (p.rune && p.runeAt === null && def.rune >= 0) out.push(["rune", (t) => drawRune(p.rune!.x, p.rune!.y, RUNE_CHARS[def.rune], "lit", t, def.rune)]);
  return out;
}

/** A level's things along its scripted route, every five seconds: which come back to a recording they left within 24 steps. */
function things(name: string, def: LevelDef): string[] {
  const p = newPlay(def, optsFor(def));
  const pilot = autopilot(routeOf(def.id) ?? []);
  const found: string[] = [];
  for (let s = 0; s < 60 * 300 && p.runeAt === null; s++) {
    if (s % 300 === 0)
      for (const [thing, draw] of thingsOf(def, p, p.t, p.t + DENSE.length - 1)) {
        if (!draw) continue;
        const prints = withView(true, () => {
          const v = viewOf(def, p, p.t);
          return recordings((t) => ((v.t = t), draw(t, v)), DENSE.map((k) => p.t + k), W, H);
        });
        if (comesBack(prints)) found.push(`${name} at step ${s}: ${thing}`);
      }
    const keys = pilot(p);
    if (!keys) break;
    stepPlay(p, keys);
  }
  return found;
}

/**
 * Whether a moving thing's drawing changes with the clock but for its place (order 32): steps of it, each its place (and what
 * else its world says, as whether it is shown) and its recording relative to that place. It blinks if at the same place it is
 * drawn two ways, or if its drawing leaves one recording and comes back to it at another place (where its drawing is the same
 * wherever it is, a toggle; where it is not, as a swinging bell's rope, it comes back only where its place does).
 */
function blinksWhileMoving(steps: { at: string; print: number }[], cycle = 0): boolean {
  // A thing with a cycle of its own (`LEAP_CYCLES`) may be drawn as many ways at a place as its cycle has frames, and no more.
  const byAt = new Map<string, Set<number>>();
  for (const s of steps) {
    const was = byAt.get(s.at) ?? new Set<number>();
    was.add(s.print);
    byAt.set(s.at, was);
    if (was.size > Math.max(1, cycle)) return true;
  }
  if (cycle) return false;
  const first = new Map<number, string>();
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (i > 0 && s.print !== steps[i - 1].print && first.has(s.print) && first.get(s.print) !== s.at) return true;
    if (!first.has(s.print)) first.set(s.print, s.at);
  }
  return false;
}

/**
 * Jumpers whose leap has a cycle of its own, on its own clock, and why it is kept with reduced motion (it says what the thing is
 * doing): watched only for the same place drawn two ways, not for coming back to a frame elsewhere.
 */
const LEAP_CYCLES: Record<string, { frames: number; why: string }> = {
  salmon: { frames: 2, why: "its tail flicks between two frames as it leaps, every five steps (order 30: how a leap reads)" },
  trackrat: { frames: 2, why: "falling, it kicks between two frames every four steps, its tail flying out (orders 26, 30)" }
};

/**
 * A level's moving things along its scripted route every five seconds (order 32: the old watch saw them only where they stood
 * still): every carrier the kit draws, wherever the clock puts it (a level's own carriers are drawn by the watch above wherever
 * they are, the clock running, since their drawing takes their place), and every jumper in its leap, each drawn at 25 steps of
 * the clock and recorded where it is.
 */
function movers(name: string, def: LevelDef): string[] {
  const p = newPlay(def, optsFor(def));
  const pilot = autopilot(routeOf(def.id) ?? []);
  const art = def.art;
  const found: string[] = [];
  for (let s = 0; s < 60 * 300 && p.runeAt === null; s++) {
    if (s % 300 === 0) {
      const t0 = p.t;
      const list: [string, (t: number) => { x: number; y: number; key: string }, (t: number, v: View) => void][] = [];
      // The kit's carriers wherever the clock puts them were watched here (order 32); since every level draws its own
      // (`art.carrier`), no level draws one with the kit's `drawCarrier`, and the watch watched nothing (order 35 found it: a
      // blink planted there passed). It is gone (order 36): a level's own carrier is drawn by part 1 where it is with the
      // clock running, and a blink planted in one fails it (Langkaia's rafts, `tools/review/o36/after.md`); a carrier the kit
      // draws for a level with no drawing of its own is part 1's too, where it stands still.
      p.enemies.forEach((e, i) => {
        if (!e.alive || e.def.kind !== "jumper") return;
        const at = (t: number) => {
          const l = leap(e, t);
          // Where it is in its leap, as its drawing reads it: rising, falling, or lying level at the top.
          const top = Math.abs(leap(e, t + 3).up - leap(e, t - 3).up) <= 1;
          return { x: Math.round(e.x), y: Math.round(e.y) - l.up, key: `${l.ripple}|${Math.sign(leap(e, t + 1).up - l.up)}|${top}` };
        };
        list.push([`jumper ${i} (${e.def.look ?? "jumper"})`, at, (_t, v) => outlined(() => void (art.enemy?.(e, v) || drawEnemy(e, v.t)), e, e.calm ? ROLES.calm : ENEMY.warning)]);
      });
      for (const [thing, at, draw] of list) {
        const steps = withView(true, () => {
          const v = viewOf(def, p, t0);
          const was = ctx();
          try {
            // Every step drawn once unrecorded first, so what is made once (its shapes, as it leaps) is made before it is recorded;
            // the shapes other tests made forgotten first, so the cache does not start over in the middle (it holds 800).
            forgetShapes();
            target(recorder(W, H).ctx);
            for (const k of DENSE) {
              v.t = t0 + k;
              freshRings();
              draw(t0 + k, v);
            }
            lights.length = 0;
            return DENSE.map((k) => {
              const t = t0 + k;
              v.t = t;
              const a = at(t);
              const rec = recorder(W, H, { x: a.x - view.camX, y: a.y - view.camY });
              target(rec.ctx);
              freshRings();
              draw(t, v);
              return { at: `${a.x},${a.y}|${a.key}`, print: rec.done() };
            });
          } finally {
            target(was);
            lights.length = 0;
          }
        });
        const cycle = Object.entries(LEAP_CYCLES).find(([look]) => thing.endsWith(`(${look})`))?.[1].frames ?? 0;
        if (blinksWhileMoving(steps, cycle)) found.push(`${name} at step ${s}: ${thing}`);
      }
    }
    const keys = pilot(p);
    if (!keys) break;
    stepPlay(p, keys);
  }
  return found;
}

/**
 * What `render/feel.ts` draws (order 32: not drawn by the watch before): him (his frame, his rim, his blink after a hit), the
 * answers to what just happened (rings, ticks, the "!", what rises from where it lay, the rune's ring of daylight), the marks of
 * things to use, the shadows under what moves. Along each level's route, every five seconds and a second after anything happens
 * (a stomp, a hit, a flag, a skilling, a bench, the rune), the world is held and the clock runs 25 steps: feel's drawing must never
 * come back to a recording it left (an idle of a second or slower, his breath, turns at most once).
 */
function felt(name: string, def: LevelDef): string[] {
  const p = newPlay(def, optsFor(def));
  const pilot = autopilot(routeOf(def.id) ?? []);
  const feel = createFeel({ sfx: { voice: () => undefined } });
  feel.reset(p);
  const found: string[] = [];
  let due = 300;
  for (let s = 0; s < 60 * 300 && p.runeAt === null; s++) {
    feel.at(s);
    feel.before(p, s);
    const keys = pilot(p);
    if (!keys) break;
    const ev = stepPlay(p, keys);
    feel.react(p, ev);
    feel.step(p, s);
    if (ev.stomp !== null || ev.hurt || ev.flag !== null || ev.coin !== null || ev.bench !== null || ev.rune || ev.bracteate || ev.boss || ev.troll) due = Math.min(due, s + 2);
    // And where his idle blinks his eyes (six steps at the end of every six seconds: `himFrame`), so the window holds one.
    if (s < due && p.t % 360 !== 345) continue;
    due = s + 300;
    const body = { ...p.body };
    const prints = withView(true, () => {
      viewOf(def, p, p.t);
      const draw = (k: number) => {
        feel.at(s + k);
        feel.world(p, p.t + k);
        feel.use(p, [], [], false);
        feel.shadows(p, body, 1);
        feel.him({ ...p, t: p.t + k } as Play, body, 0, "day", {} as never, 1);
      };
      const was = ctx();
      try {
        const first = recorder(W, H);
        target(first.ctx);
        textTarget(first.ctx);
        freshRings();
        draw(0);
        lights.length = 0;
        return DENSE.map((k) => {
          const rec = recorder(W, H);
          target(rec.ctx);
          textTarget(rec.ctx);
          freshRings();
          draw(k);
          return rec.done();
        });
      } finally {
        target(was);
        lights.length = 0;
      }
    });
    feel.at(s);
    if (comesBack(prints)) found.push(`${name} at step ${s}`);
  }
  return found;
}

/**
 * After dusk (`afterDark`, `render/dusk.ts`: `main.ts`'s until order 33): what moves drawn faint over its tinted self, the hazards'
 * edges, the paint, the outlines and the invaders' glow again, the eye-shine. Along each level's route every twenty seconds, at night,
 * the world held (where everything is, every ledge's phase) and the clock running 25 steps: it must never come back to a recording
 * it left. As part 2 holds them: the skilling and the cheese, which turn on their own clock (drawn here they would make every
 * recording new and hide a blink beside them), are left to part 2; a jumper in its leap to part 5 (`LEAP_CYCLES`).
 */
function dusk(name: string, def: LevelDef): string[] {
  const p = newPlay(def, optsFor(def));
  const pilot = autopilot(routeOf(def.id) ?? []);
  const found: string[] = [];
  const art = def.art;
  for (let s = 0; s < 60 * 300 && p.runeAt === null; s++) {
    if (s % 1200 === 300) {
      const held = { ...p, skilling: [], cheese: null, enemies: p.enemies.filter((e) => e.def.kind !== "jumper") } as Play;
      const page = {
        foe: (e: Enemy, v: View) => outlined(() => void (art.enemy?.(e, v) || drawEnemy(e, v.t)), e, e.calm ? ROLES.calm : ENEMY.warning),
        thrown: (sh: Shot, v: View) => outlined(() => void (art.shot?.(sh, v) || drawShot(sh))),
        standing: (v: View) => standing(held, v.alpha)
      };
      const prints = withView(true, () => {
        const v = viewOf(def, p, p.t);
        v.sky = skyOf(def, "night");
        return recordings((t) => afterDark(held, { ...v, t }, page), DENSE.map((k) => p.t + k), W, H);
      });
      if (comesBack(prints)) found.push(`${name} at step ${s}`);
    }
    const keys = pilot(p);
    if (!keys) break;
    stepPlay(p, keys);
  }
  return found;
}

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

describe("with reduced motion nothing flashes (orders 30 and 31)", () => {
  test("every level's scenery and every prop in it, across the whole level, draws the same at every step of the clock but the world's own motion named here, which never comes back within 24 steps", async () => {
    const changed = new Map<string, { at: string; back: boolean }>();
    for (const { name, def } of await everyLevel()) for (const [k, c] of asInBrowser(() => scenery(name, def))) changed.set(k, c);
    const named = (k: string) => MOVES.find((m) => k === `${m.level} ${m.path}`);
    console.log(`What changes as the clock runs with reduced motion: ${[...changed].map(([k, c]) => `${k} (first at ${c.at}${c.back ? ", comes back" : ""})`).join("; ") || "nothing"}`);
    expect([...changed.keys()].filter((k) => !named(k))).toEqual([]);
    expect([...changed].filter(([, c]) => c.back).map(([k]) => k)).toEqual([]);
    // And every name still names something.
    expect(MOVES.filter((m) => !changed.has(`${m.level} ${m.path}`)).map((m) => `${m.level} ${m.path}`)).toEqual([]);
  }, 300_000);

  test("every thing in every level, held as the scripted route finds it every five seconds (carriers, ledges, cannons, drums, flags, benches, sheep, skilling, cheese, every enemy, what is thrown, what hurts, the bracteate, the rune, the paint), never comes back within 24 steps of the clock", async () => {
    const found: string[] = [];
    for (const { name, def } of await everyLevel()) if (!name.startsWith("kart")) found.push(...asInBrowser(() => things(name, def)));
    expect(found).toEqual([]);
  }, 300_000);

  test("every moving thing in every level (every jumper in its leap), drawn as the route finds it every five seconds: its drawing at a place never depends on the clock otherwise", async () => {
    const found: string[] = [];
    for (const { name, def } of await everyLevel()) if (!name.startsWith("kart")) found.push(...asInBrowser(() => movers(name, def)));
    expect(found).toEqual([]);
  }, 300_000);

  test("what feel draws (him, the answers to what just happened, the marks of things to use, the shadows), the world held a moment along every route and a second after anything happens, never comes back within 24 steps", async () => {
    const found: string[] = [];
    for (const { name, def } of await everyLevel()) if (!name.startsWith("kart")) found.push(...asInBrowser(() => felt(name, def)));
    expect(found).toEqual([]);
  }, 300_000);

  test("after dusk, what keeps its light (main.ts's afterDark until order 33), held along every route at night, never comes back within 24 steps", async () => {
    const found: string[] = [];
    for (const { name, def } of await everyLevel()) if (!name.startsWith("kart")) found.push(...asInBrowser(() => dusk(name, def)));
    expect(found).toEqual([]);
  }, 300_000);

  test("the rune's flight to the header is one movement, never coming back (it still flies with reduced motion: a question for Lars); the banner is there and then gone", () => {
    const prints = withView(true, () =>
      Array.from({ length: 51 }, (_, k) => {
        const rec = recorder(W, H);
        runeFlight(rec.ctx, k / 50, { x: 40, y: 150 }, { x: 300, y: 10 }, 3, 2);
        return rec.done();
      })
    );
    expect(comesBack(prints)).toBe(false);
    expect(new Set(prints).size).toBeGreaterThan(40);
    withView(true, () => {
      const seen = Array.from({ length: 300 }, (_, age) => bannerAlpha(age));
      expect([...new Set(seen)].sort()).toEqual([0, 1]);
      expect(seen.findIndex((a) => a === 0)).toBe(150);
      expect(seen.slice(150).every((a) => a === 0)).toBe(true);
    });
    // Without reduced motion it fades, and never comes back either.
    withView(false, () => {
      const seen = Array.from({ length: 300 }, (_, age) => bannerAlpha(age));
      expect(seen.every((a, k) => k === 0 || a <= seen[k - 1])).toBe(true);
    });
  });

  test("the cards: every animation and transition in the page's styles is on a class the page sets only without reduced motion", () => {
    const css = ["styles.css", "../../../packages/pixelkit/src/chrome.css"].map((f) => readFileSync(resolve(SRC, f), "utf8")).join("\n");
    const main = readFileSync(resolve(SRC, "main.ts"), "utf8");
    /** A selector with motion, and the line of the page that sets its class, which must not set it with reduced motion. */
    const HELD: { selector: string; set: RegExp }[] = [{ selector: ".card.auto .primary::after", set: /finishEl\.classList\.toggle\("auto", [^;]*&& !view\.reduced\)/ }];
    const moving: string[] = [];
    for (const m of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g))
      if (/(^|;)\s*(animation|transition)(-[a-z-]+)?\s*:/.test(m[2]) && !/(animation|transition)[a-z-]*\s*:\s*none/.test(m[2])) moving.push(m[1].trim());
    expect(moving.filter((sel) => !HELD.some((h) => h.selector === sel))).toEqual([]);
    for (const h of HELD) expect(main).toMatch(h.set);
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
