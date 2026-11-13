import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { wireMute } from "@larshansen/pixelkit/chrome";
import { pickLang, soundWords } from "@larshansen/pixelkit/i18n";
import { createInput } from "@larshansen/pixelkit/input";
import { createStepper } from "@larshansen/pixelkit/loop";
import { view } from "@larshansen/pixelkit/paint";
import { createSfx } from "@larshansen/pixelkit/sfx";
import { createStage } from "@larshansen/pixelkit/stage";
import { textTarget } from "@larshansen/pixelkit/text";
import { createBot, playLevel, type Bot, type BotSpeed } from "@larshansen/maze/bot";
import { createRecorder, saveGhost } from "@larshansen/maze/ghost";
import { strings } from "@larshansen/maze/i18n";
import { LEVELS, TILE } from "@larshansen/maze/levels";
import { markStone } from "@larshansen/maze/panel";
import { RECORDS_KEY, browserStore, loadFeather, loadRecords, markCount, marksOf } from "@larshansen/maze/records";
import { formatTime } from "@larshansen/maze/rules";
import { createMaze, type Steer } from "@larshansen/maze/scene";

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
const input = createInput();
const sfx = createSfx();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
view.reduced = reducedMotion.matches;
reducedMotion.addEventListener("change", (e) => (view.reduced = e.matches));

const finishEl = $<HTMLElement>("finish");
wireMute($<HTMLButtonElement>("mute"), sfx, soundWords(lang));

const startLevel = Math.max(1, Math.min(LEVELS.length, Number(params.get("level")) || 1));
const steer = debug ? debugSetup() : undefined;

let over = false;
const maze = createMaze(
  {
    stage: kit,
    input,
    sfx,
    lang,
    el: stage,
    say: (text) => (announce.textContent = text),
    standalone: true,
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
  const at = params.get("at")?.split(",").map(Number);
  if (at && at.length === 2 && at.every(Number.isFinite)) Object.assign(maze.state, { x: at[0] * TILE + TILE / 2, y: at[1] * TILE + TILE / 2 });
  // `steps=N`: N steps now, then one frame drawn now, so a headless browser that never draws a frame
  // of its own (Firefox here) can screenshot a real moment of the game.
  const steps = Math.max(0, Math.floor(Number(params.get("steps")) || 0));
  if (params.has("steps")) {
    for (let i = 0; i < steps && !over; i++) {
      maze.step();
      input.endStep();
    }
    if (params.has("levels")) maze.levels.open();
    if (params.has("end")) showEnd();
    maze.render(0, 1000);
    hud();
  }
}

/**
 * Checking aids, with `?debug` only. `records=demo` fills in made-up records, `ghost` records the
 * scripted player's clear of the level as its ghost, and `bot=keys` or `bot=pointer` (with `portals`
 * to use teleport stones) or `walk=dx,dy` steers him while stepping. (`at=c,r`, below, puts him on a tile.)
 */
function debugSetup(): Steer | undefined {
  const store = browserStore();
  const records = params.get("records");
  if (records === "demo" || records === "all") {
    // "demo": the first four levels cleared, with some marks; "all": the first six, so clearing the last turns the feather gold.
    const demo: Record<number, { ms: number; deaths: number; par?: true }> = { 1: { ms: 21000, deaths: 0, par: true }, 2: { ms: 44000, deaths: 2 }, 3: { ms: 52000, deaths: 0 }, 4: { ms: 19000, deaths: 3 } };
    if (records === "all") Object.assign(demo, { 5: { ms: 40000, deaths: 1 }, 6: { ms: 30000, deaths: 0 } });
    store?.setItem(RECORDS_KEY, JSON.stringify(demo));
    store?.setItem("maze.reached", records === "all" ? "7" : "5");
    store?.setItem("viking.feather", "1");
  }
  const portals = params.has("portals");
  if (params.has("ghost")) {
    const run = playLevel(startLevel, (params.get("ghost") || "pointer") as BotSpeed, { portals });
    const rec = createRecorder();
    for (const p of run.trail) rec.push(p.x, p.y);
    saveGhost(startLevel, rec.points(), store);
  }
  const speed = params.get("bot");
  if (speed === "keys" || speed === "pointer") {
    let bot: Bot | null = null;
    let level = 0;
    return {
      next(s) {
        if (s.level !== level) {
          bot = createBot(s.level, speed, { portals });
          level = s.level;
        }
        return bot!.next(s);
      },
      after(ev) {
        bot?.after(ev);
      }
    };
  }
  const walk = params.get("walk")?.split(",").map(Number);
  if (walk && walk.length === 2 && walk.every(Number.isFinite)) return { next: () => ({ dx: walk[0], dy: walk[1] }), after() {} };
  return undefined;
}
