import { PLAYER } from "./config";
import { doorNear, walkIn, type AppLink, type Door } from "./doors";
import { runHarness, type Harness } from "./harness";
import type { Lang } from "./i18n";
import type { Action, Input } from "./input";
import { createStepper } from "./loop";
import { SKY_NAMES, skyFor, type Sky, type SkyName } from "./oslo";
import { layerOrigin, target, view } from "./paint";
import type { Look } from "./person";
import type { Body, Intent, StepResult } from "./physics";
import type { Sfx } from "./sfx";
import { drawSky, snowfall } from "./sky";
import { dust, stepSparks, type Spark } from "./sparks";
import { createStage, type Stage } from "./stage";
import { textTarget } from "./text";
import type { District } from "./tilemap";
import { walkStep, type WalkGoal } from "./walkto";

// What every side-view scene does around its own world: the page and its canvases, the words on it,
// the touch pad and the header links, the sky and the T key, the banner, going through a door,
// coming back with Back, the frame loop and the harness. Small helpers that a scene's main.ts puts
// together; what the scene itself is (its map, its rules, its art) stays with the scene.

// --- The page ------------------------------------------------------------------------------------

export const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export interface Page {
  stage: HTMLElement;
  px: HTMLCanvasElement;
  ui: HTMLCanvasElement;
  pad: HTMLElement;
  help: HTMLElement;
  announce: HTMLElement;
  enterButton: HTMLButtonElement;
  /** The canvases: sky, one per depth (`factors`), and the text layer on top. */
  kit: Stage;
}

/** The parts every scene's page has, by their ids, and the stage built in it. */
export function openPage(factors: number[]): Page {
  const stage = byId<HTMLElement>("stage");
  const px = byId<HTMLCanvasElement>("px");
  const ui = byId<HTMLCanvasElement>("ui");
  const pad = byId<HTMLElement>("pad");
  const help = byId<HTMLElement>("help");
  const announce = byId<HTMLElement>("announce");
  const enterButton = pad.querySelector<HTMLButtonElement>('[data-action="enter"]')!;
  const kit = createStage({ stage, px, ui, factors });
  textTarget(ui.getContext("2d")!);
  return { stage, px, ui, pad, help, announce, enterButton, kit };
}

/** Every `[data-i18n]` element gets its words from `t`, and the touch pad its labels. */
export function putWords(lang: Lang, t: { left: string; right: string; jump: string; enter: string }, pad: HTMLElement) {
  document.documentElement.lang = lang;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const text = (t as unknown as Record<string, unknown>)[el.dataset.i18n ?? ""];
    if (typeof text === "string") el.textContent = text;
  });
  const labels: Record<string, string> = { left: t.left, right: t.right, jump: t.jump, enter: t.enter };
  pad.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((b) => {
    b.setAttribute("aria-label", labels[b.dataset.action ?? ""]);
    if (b.dataset.action === "jump") b.textContent = t.jump;
    if (b.dataset.action === "enter") b.textContent = t.enter;
  });
}

/** Keeps `view.reduced` in step with the visitor's setting. */
export function followReducedMotion() {
  const m = matchMedia("(prefers-reduced-motion: reduce)");
  view.reduced = m.matches;
  m.addEventListener("change", (e) => (view.reduced = e.matches));
}

export const isTouch = () => matchMedia("(pointer: coarse)").matches;

/** The touch pad feeds the same actions as the keyboard. On a touch screen it shows, instead of the help line. */
export function wirePad(pad: HTMLElement, input: Input, touch: boolean, help: HTMLElement) {
  if (touch) {
    pad.hidden = false;
    help.hidden = true;
    document.body.classList.add("touch");
  }
  pad.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((b) => {
    const action = b.dataset.action as Action;
    const release = () => {
      b.classList.remove("down");
      input.hold(action, false);
    };
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      b.setPointerCapture?.(e.pointerId);
      b.classList.add("down");
      input.hold(action, true);
    });
    b.addEventListener("pointerup", release);
    b.addEventListener("pointercancel", release);
    b.addEventListener("lostpointercapture", release);
    b.addEventListener("contextmenu", (e) => e.preventDefault());
    b.addEventListener("click", (e) => e.detail === 0 && input.press(action)); // keyboard or switch access
  });
}

/** Pointing at a plain link in the header lights up its door in the game. */
export function wireLinks<D extends { id: string }>(links: AppLink[], doors: D[], state: { highlight: D | null }) {
  for (const link of links) {
    const d = doors.find((x) => x.id === link.id);
    if (!d) continue;
    const on = () => (state.highlight = d);
    const off = () => state.highlight === d && (state.highlight = null);
    link.el.addEventListener("mouseenter", on);
    link.el.addEventListener("mouseleave", off);
    link.el.addEventListener("focus", on);
    link.el.addEventListener("blur", off);
  }
}

/**
 * The page furniture that follows him, once a frame: the pad's enter button and the header link of
 * the door he stands at, and the help line, which goes once he has moved.
 */
export function pageFollows(enterButton: HTMLElement, links: AppLink[], help: HTMLElement) {
  let near: { id: string } | null = null;
  return (door: { id: string } | null, moved: boolean) => {
    enterButton.classList.toggle("show", !!door);
    if (door !== near) {
      near = door;
      for (const link of links) link.el.classList.toggle("here", link.id === door?.id);
    }
    if (moved && !help.hidden) help.hidden = true;
  };
}

/** A pointer event's place in the world. */
export function pointerAt(stage: HTMLElement, e: MouseEvent) {
  const rect = stage.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * view.dpr) / view.k + view.camXf,
    y: ((e.clientY - rect.top) * view.dpr) / view.k + view.camYf
  };
}

/**
 * Clicking or tapping sends him there, into a door or along the ground (`walk` decides); the mouse
 * over a door lights it up and makes the pointer a hand. Only while `active`.
 */
export function wirePointer<D extends Door>(stage: HTMLElement, doors: D[], state: { hover: D | null }, o: { active(): boolean; walk(at: { x: number; y: number }, door: D | null): void }) {
  stage.addEventListener("click", (e) => {
    if (!o.active()) return;
    const at = pointerAt(stage, e);
    o.walk(at, doorNear(doors, at.x, at.y));
  });
  stage.addEventListener("mousemove", (e) => {
    const at = pointerAt(stage, e);
    state.hover = o.active() ? doorNear(doors, at.x, at.y) : null;
    stage.style.cursor = state.hover ? "pointer" : "";
  });
  stage.addEventListener("mouseleave", () => (state.hover = null));
}

/** A key the game may take: no modifier, no repeat, and not typed into a link, button or field. */
export function plainKey(e: KeyboardEvent): boolean {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return false;
  return !(e.target instanceof Element && e.target.closest("a, button, input, textarea, select"));
}

export function onKey(code: string, fn: () => void) {
  window.addEventListener("keydown", (e) => e.code === code && plainKey(e) && fn());
}

// --- Back and forth between pages --------------------------------------------------------------

/** Remembers the door he went through, for this tab, so Back starts outside it. */
export function rememberDoor(key: string, id: string) {
  try {
    sessionStorage.setItem(key, id);
  } catch {
    // private windows can refuse storage, and then Back just starts at the beginning
  }
}

/** The door he left by, when the page was reached with Back or Forward; otherwise null. */
export function doorLeftBy<D extends { id: string }>(key: string, doors: D[]): D | null {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navigation?.type !== "back_forward") return null;
  let id: string | null = null;
  try {
    id = sessionStorage.getItem(key);
  } catch {
    return null;
  }
  return doors.find((x) => x.id === id) ?? null;
}

/** Takes a parameter out of the address without a reload, so a reload starts as usual. */
export function dropParam(params: URLSearchParams, name: string) {
  if (!params.has(name)) return;
  params.delete(name);
  const rest = params.toString();
  history.replaceState(null, "", location.pathname + (rest ? `?${rest}` : "") + location.hash);
}

// --- The sky ---------------------------------------------------------------------------------------

/**
 * The sky over a scene: Oslo's real one, or the one named by `?sky=`, from `now` (the frozen clock
 * under the harness). It catches up with the real sky every two seconds, and the T key steps through them all.
 */
export function skyControl(name: string | null, now: () => Date) {
  let current = name;
  let sky = skyFor(now(), current);
  return {
    get sky(): Sky {
      return sky;
    },
    tick(steps: number) {
      if (steps % 120 === 0) sky = skyFor(now(), current);
    },
    /** The next sky in the list, and back to the real one: its name, or null for the real one. */
    next(): SkyName | null {
      const next = SKY_NAMES[(SKY_NAMES.indexOf(current as SkyName | null) + 1) % SKY_NAMES.length];
      current = next;
      sky = skyFor(now(), current);
      return next;
    }
  };
}

/** The T key steps through every sky and back to the real one, and says which in the banner. */
export function wireSkyKey(skies: ReturnType<typeof skyControl>, state: { banner: Banner | null; steps: number }, words: Record<SkyName | "now", string>, when: () => boolean = () => true) {
  onKey("KeyT", () => {
    if (!when()) return;
    const next = skies.next();
    state.banner = { title: words[next ?? "now"], sub: "", since: state.steps };
  });
}

// --- The state every scene keeps ---------------------------------------------------------------------

export interface Banner {
  title: string;
  sub: string;
  since: number;
}

export const bannerFor = (d: District, lang: Lang, since: number): Banner => ({ title: d.name, sub: d.landmark ? d.landmark[lang] : "", since });

/** The banner as drawn: it fades in, stays about two and a half seconds, and fades out. */
export function bannerShown(b: Banner | null, steps: number): { title: string; sub: string; alpha: number } | null {
  if (!b) return null;
  const age = steps - b.since;
  return { title: b.title, sub: b.sub, alpha: view.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, age / 15, (165 - age) / 30)) };
}

export interface SceneState<D extends Door> {
  /** Playing, going through `door`, or gone (waiting for the next page). */
  mode: "play" | "enter" | "away";
  modeSteps: number;
  door: D | null;
  /** The dark over everything, and how much of him shows. */
  fade: number;
  alpha: number;
  /** Steps he has been walking, for the legs and the footsteps. */
  walk: number;
  steps: number;
  /** He has moved, so the help line can go. */
  moved: boolean;
  district: District;
  banner: Banner | null;
  /** The door lit up by a header link, and by the mouse. */
  highlight: D | null;
  hover: D | null;
  /** Where a click or tap sends him. */
  goal: WalkGoal<D> | null;
  sparks: Spark[];
}

export function sceneState<D extends Door>(district: District, lang: Lang): SceneState<D> {
  return { mode: "play", modeSteps: 0, door: null, fade: 0, alpha: 1, walk: 0, steps: 0, moved: false, district, banner: bannerFor(district, lang, 0), highlight: null, hover: null, goal: null, sparks: [] };
}

/** Back to playing with every door shut and no key held: after Back, or when a door led nowhere. */
export function reopen<D extends Door>(state: SceneState<D>, doors: D[], input: Input) {
  state.mode = "play";
  state.fade = 0;
  state.alpha = 1;
  doors.forEach((d) => (d.open = false));
  input.clear();
}

/** He has been put somewhere (at a door, by `?x=`, back on land): nothing to blend from, and the district is where he now is. */
export function arrived<D extends Door>(state: SceneState<D>, body: Body, before: { x: number; y: number }, district: District, lang: Lang, announce = true) {
  before.x = body.x;
  before.y = body.y;
  state.district = district;
  if (announce) state.banner = bannerFor(district, lang, state.steps);
}

/** He sets off through door `d`: keys stop counting, and `stepThrough` takes him in, after `delay` steps when there is something to watch first. */
export function startThrough<D extends Door>(state: SceneState<D>, body: Body, d: D, delay = 0) {
  state.mode = "enter";
  state.modeSteps = delay ? -delay : 0;
  state.door = d;
  body.vx = 0;
}

/** He walks into `state.door` and the scene fades. True on the step he is through. */
export function stepThrough<D extends Door>(state: SceneState<D>, b: Body): boolean {
  const s = ++state.modeSteps;
  if (s <= 0) return false; // a moment before he goes, when the scene asked for one
  const w = walkIn(b, state.door!, s, view.reduced);
  if (w.alpha !== null) state.alpha = w.alpha;
  if (w.fade !== null) state.fade = w.fade;
  if (!w.done) return false;
  state.mode = "away";
  state.modeSteps = 0;
  return true;
}

/** Counts his walking steps, and plays a footstep every fourteen. */
export function footsteps<D extends Door>(state: SceneState<D>, b: Body, sfx: Sfx) {
  state.walk = b.onGround && Math.abs(b.vx) > 0.2 ? state.walk + 1 : 0;
  if (state.walk > 0 && state.walk % 14 === 7) sfx.play("step");
}

/** A new district under him puts its name up in the banner. */
export function trackDistrict<D extends Door>(state: SceneState<D>, here: District, lang: Lang) {
  if (here === state.district) return;
  state.district = here;
  state.banner = bannerFor(here, lang, state.steps);
}

/** The start of every physics step: remember where he was, for drawing between steps, and count it. */
export function stepStart<D extends Door>(state: SceneState<D>, body: Body, before: { x: number; y: number }) {
  before.x = body.x;
  before.y = body.y;
  state.steps++;
}

/** The end of every physics step: shaking doors settle, sparks fly, keys pressed this step are spent, the sky moves on. */
export function stepEnd<D extends Door>(state: SceneState<D>, doors: D[], input: Input, skies: { tick(steps: number): void }) {
  doors.forEach((d) => d.shake > 0 && d.shake--);
  state.sparks = stepSparks(state.sparks);
  input.endStep();
  skies.tick(state.steps);
}

/** What the keys ask for this step. Up jumps, except at a door, where it goes in instead. */
export function intentFrom(input: Input, atDoor: boolean): Intent {
  return {
    left: input.held.left,
    right: input.held.right,
    jumpHeld: input.held.jump || input.held.up,
    jumpPressed: input.pressed("jump") || (input.pressed("up") && !atDoor)
  };
}

/** Walking to a click, when there is a goal: the intent to step with, and the door to go in now if he has reached it. */
export function followGoal<D extends Door>(state: SceneState<D>, b: Body, intent: Intent, here: D | null): { intent: Intent; enter: D | null } {
  if (!state.goal) return { intent, enter: null };
  const w = walkStep(state.goal, b, intent, here, state.steps);
  state.goal = w.goal;
  return { intent: w.intent, enter: w.enter };
}

/** After the body's step: the jump and the footsteps sound, and the help line may go. True when he moved himself. */
export function afterStep<D extends Door>(state: SceneState<D>, b: Body, intent: Intent, r: StepResult, sfx: Sfx): boolean {
  const moved = intent.left || intent.right || r.jumped;
  if (moved) state.moved = true;
  if (r.jumped) sfx.play("jump");
  footsteps(state, b, sfx);
  return moved;
}

/** A hard landing thuds, and kicks up dust from his feet. */
export function hardLanding<D extends Door>(state: SceneState<D>, b: Body, r: StepResult, sfx: Sfx) {
  if (r.landed > 3) sfx.play("land");
  if (r.landed > 3 && !view.reduced) dust(state.sparks, b.x + PLAYER.w / 2, b.y + PLAYER.h - 1);
}

/** The parts of the text overlay every scene fills the same way: the fade, the snow, him, the banner, the lit door. */
export function sceneOverlay<D extends Door>(state: SceneState<D>, shown: Body, sky: Sky, look?: Look) {
  return {
    fade: state.fade,
    snow: snowfall(sky, state.steps),
    player: { body: shown, walk: state.walk, alpha: state.alpha * (1 - state.fade), phase: sky.phase, look },
    banner: bannerShown(state.banner, state.steps),
    highlight: state.highlight ?? state.hover ?? state.goal?.door ?? null,
    steps: state.steps
  };
}

// --- Drawing and running ---------------------------------------------------------------------------

/** The start of a frame: the sky on the back canvas, and every depth layer cleared and moved by its fraction. */
export function beginLayers(kit: Stage, sky: Sky, steps: number, horizonY?: number) {
  target(kit.g);
  drawSky(sky, steps, horizonY);
  kit.nudge(kit.px, 0);
  for (const d of kit.depths) {
    d.g.clearRect(0, 0, view.w, view.h);
    const origin = layerOrigin(d.factor);
    kit.nudge(d.canvas, origin - Math.floor(origin));
  }
}

/** Where to draw him: between his last two steps, by how far the clock is towards the next. */
export function blend(shown: Body, body: Body, before: { x: number; y: number }, a: number) {
  Object.assign(shown, body, { x: before.x + (body.x - before.x) * a, y: before.y + (body.y - before.y) * a });
}

export interface Loop {
  /** One screen frame: the steps that are due, then the drawing. Exposed under ?debug. */
  frame(now: number): void;
  start(): void;
}

/** Physics in fixed steps, drawing on every screen frame with how far the clock is between two steps. */
export function createLoop(step: () => void, draw: (alpha: number, elapsedMs: number) => void): Loop {
  const stepper = createStepper(step);
  let last = performance.now();
  function frame(now: number) {
    const elapsed = Math.min(100, Math.max(0, now - last));
    last = now;
    stepper.advance(elapsed);
    draw(stepper.alpha(), elapsed);
    requestAnimationFrame(frame);
  }
  return {
    frame,
    start() {
      requestAnimationFrame((now) => {
        last = now;
        requestAnimationFrame(frame);
      });
    }
  };
}

/**
 * Lays the page out now and on every resize, then runs: the frame loop, or, under the harness, its
 * steps and one `still` frame. A resize clears the canvases, and a stepped page has no next frame to
 * draw them again, so then it draws the still frame again.
 */
export function launch(o: { stage: HTMLElement; layout(): void; still(): void; loop: Loop; harness: Harness | null; input: Input; step(): void }) {
  new ResizeObserver(() => {
    o.layout();
    if (o.harness) o.still();
  }).observe(o.stage);
  o.layout();
  if (o.harness) {
    runHarness(o.harness, o.input, o.step);
    o.still();
  } else o.loop.start();
}
