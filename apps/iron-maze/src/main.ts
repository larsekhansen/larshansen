import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { wireMute } from "@larshansen/pixelkit/chrome";
import { pickLang, soundWords } from "@larshansen/pixelkit/i18n";
import { createInput } from "@larshansen/pixelkit/input";
import { createStepper } from "@larshansen/pixelkit/loop";
import { view } from "@larshansen/pixelkit/paint";
import { createSfx } from "@larshansen/pixelkit/sfx";
import { isTouch } from "@larshansen/pixelkit/scene";
import { createStage } from "@larshansen/pixelkit/stage";
import { textTarget } from "@larshansen/pixelkit/text";
import { debugSteer, drawn, perf, stepped } from "@larshansen/maze/debug";
import { helpFor, strings } from "@larshansen/maze/i18n";
import { LEVELS } from "@larshansen/maze/levels";
import { markStone } from "@larshansen/maze/panel";
import { loadFeather, loadRecords, markCount, marksOf } from "@larshansen/maze/records";
import { formatTime } from "@larshansen/maze/rules";
import * as scene from "@larshansen/maze/scene";

// The maze on its own address: the same scene as inside Vikingfjorden, with a thin page around it.

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const stage = $<HTMLElement>("stage");
const px = $<HTMLCanvasElement>("px");
const ui = $<HTMLCanvasElement>("ui");
const help = $<HTMLElement>("help");
const announce = $<HTMLElement>("announce");
const header = document.querySelector<HTMLElement>(".bar")!;

const kit = createStage({ stage, px, ui, factors: [1] });
textTarget(ui.getContext("2d")!);

const lang = pickLang(navigator.languages?.length ? navigator.languages : [navigator.language]);
const t = strings(lang);
document.documentElement.lang = lang;
document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
  const text = t[el.dataset.i18n as keyof typeof t];
  if (typeof text === "string") el.textContent = text;
});

const params = new URLSearchParams(location.search);
const debug = params.has("debug");
/** A touch screen (the kit's test, as Vikingfjorden's), or `?debug&touch` to look at one without it (order 36). */
const touch = isTouch() || (debug && params.has("touch"));
// The help line names no key on a touch screen: it says what a finger does.
help.textContent = helpFor(t, touch);
const input = createInput();
const sfx = createSfx();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
view.reduced = reducedMotion.matches;
reducedMotion.addEventListener("change", (e) => (view.reduced = e.matches));
// `?debug&reduced`: reduced motion, for looking at it in a browser that cannot be asked for it (as in Vikingfjorden).
if (debug && params.has("reduced")) view.reduced = true;

const finishEl = $<HTMLElement>("finish");
wireMute($<HTMLButtonElement>("mute"), sfx, soundWords(lang));

const startLevel = Math.max(1, Math.min(LEVELS.length, Number(params.get("level")) || 1));
const steer = debug ? debugSteer(params, startLevel, scene) : undefined;

let over = false;
const maze = scene.createMaze(
  {
    stage: kit,
    input,
    sfx,
    lang,
    el: stage,
    say: (text) => (announce.textContent = text),
    standalone: true,
    touch,
    topInset: () => (header.getBoundingClientRect().height * view.dpr) / view.k,
    onLeave({ cleared }) {
      if (!cleared) return location.assign("https://larshansen.dev/viking/?from=maze");
      showEnd();
    }
  },
  { level: startLevel, steer }
);

/** The end of the mound: a small card, since the feather cannot cross to larshansen.dev from here. */
function showEnd() {
  over = true;
  $<HTMLElement>("finish-title").textContent = t.endTitle;
  $<HTMLElement>("finish-line").textContent = loadFeather().gold ? t.featherGoldStandalone : t.endStandalone;
  $<HTMLElement>("finish-link").textContent = t.back;
  showMarks();
  finishEl.hidden = false;
}

/** The seven levels' stones on the finish card, each with its notches, and the marks held in all. */
function showMarks() {
  const records = loadRecords();
  const row = $<HTMLElement>("finish-marks");
  row.textContent = "";
  let total = 0;
  LEVELS.forEach((l, i) => {
    const marks = marksOf(records[i + 1], l.par * 1000);
    total += markCount(marks);
    row.appendChild(markStone(marks, 2, `${l.name}: ${t.marks(markCount(marks))}`));
  });
  $<HTMLElement>("finish-total").textContent = t.marksTotal(total, LEVELS.length * 3);
}

// The header's level display.
const nameEl = $<HTMLElement>("name");
const levelEl = $<HTMLButtonElement>("level");
const bestEl = $<HTMLElement>("best");
levelEl.title = t.levelsButton;
levelEl.setAttribute("aria-label", t.levelsButton);
levelEl.addEventListener("click", () => {
  maze.levels.toggle();
  levelEl.blur();
});
const clockEl = $<HTMLElement>("clock");
const deathsEl = $<HTMLElement>("deaths");
deathsEl.title = t.cursesLabel;
deathsEl.setAttribute("aria-label", t.cursesLabel);
$<HTMLElement>("run").hidden = false;
const shown = { name: "", level: "", clock: "", deaths: "", best: "" };
function hud() {
  const h = maze.hud();
  const set = (key: keyof typeof shown, el: HTMLElement, text: string) => {
    if (shown[key] === text) return;
    shown[key] = text;
    el.textContent = text;
  };
  set("name", nameEl, h.name);
  set("level", levelEl, `${h.level} / ${h.of}`);
  set("clock", clockEl, formatTime(h.ms));
  set("deaths", deathsEl, t.deaths(h.deaths));
  set("best", bestEl, h.best === null ? "" : t.best(formatTime(h.best)));
  if (maze.state.started && !help.hidden) help.hidden = true;
}

function layout() {
  kit.resize();
  maze.resize();
  // Resizing a canvas clears it: draw again at once rather than wait for the next frame (which a
  // headless browser never runs).
  maze.render(stepper.alpha(), 0);
}

const stepper = createStepper(() => {
  if (over) return;
  input.pollPad(0.35);
  maze.step();
  input.endStep();
});
let last = performance.now();
function frame(now: number) {
  const elapsed = Math.min(100, Math.max(0, now - last));
  last = now;
  stepper.advance(elapsed);
  maze.render(stepper.alpha(), elapsed);
  hud();
  requestAnimationFrame(frame);
}

new ResizeObserver(layout).observe(stage);
layout();
hud();
requestAnimationFrame((now) => {
  last = now;
  requestAnimationFrame(frame);
});

if (debug) {
  Object.assign(window, { __game: { maze, state: maze.state, view, input, frame } });
  // A screenshot cannot show the console: errors go in the help line instead.
  const showError = (message: string) => {
    help.hidden = false;
    help.textContent = `Error: ${message}`;
  };
  window.addEventListener("error", (e) => showError(e.message));
  window.addEventListener("unhandledrejection", (e) => showError(String(e.reason)));
  // `steps=N` and the rest: `@larshansen/maze/debug`, shared with the maze inside Vikingfjorden (order 36).
  if (stepped(maze, params, input, { stop: () => over, beforeDraw: () => params.has("end") && showEnd(), driver: steer, el: stage })) {
    hud();
    if (params.has("perf")) perf(maze, help, params);
  }
  drawn();
}
