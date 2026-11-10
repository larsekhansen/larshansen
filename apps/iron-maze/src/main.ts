import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { pickLang } from "@larshansen/pixelkit/i18n";
import { createInput } from "@larshansen/pixelkit/input";
import { createStepper } from "@larshansen/pixelkit/loop";
import { view } from "@larshansen/pixelkit/paint";
import { createSfx } from "@larshansen/pixelkit/sfx";
import { createStage } from "@larshansen/pixelkit/stage";
import { textTarget } from "@larshansen/pixelkit/text";
import { strings } from "@larshansen/maze/i18n";
import { formatTime } from "@larshansen/maze/rules";
import { createMaze } from "@larshansen/maze/scene";

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
help.textContent = t.help;
$<HTMLElement>("blurb").textContent = lang === "nb" ? "Styr gjennom den forbannede haugen uten å røre veggene." : "Steer through the cursed mound without touching the walls.";

const params = new URLSearchParams(location.search);
const input = createInput();
const sfx = createSfx();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
view.reduced = reducedMotion.matches;
reducedMotion.addEventListener("change", (e) => (view.reduced = e.matches));

const finishEl = $<HTMLElement>("finish");
const muteButton = $<HTMLButtonElement>("mute");

function labelMute() {
  const label = sfx.muted ? (lang === "nb" ? "Lyd på" : "Sound on") : lang === "nb" ? "Lyd av" : "Sound off";
  muteButton.setAttribute("aria-pressed", String(sfx.muted));
  muteButton.setAttribute("aria-label", label);
  muteButton.title = `${label} (M)`;
}
labelMute();
muteButton.addEventListener("click", () => {
  sfx.toggleMute();
  labelMute();
  muteButton.blur();
});
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyM" && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target instanceof Element && e.target.closest("a, button"))) {
    sfx.toggleMute();
    labelMute();
  }
});

let over = false;
const startLevel = Number(params.get("level")) || 1;
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
      if (!cleared) return location.assign("https://larshansen.dev/viking/");
      // A small card, since the feather cannot cross to larshansen.dev from here.
      over = true;
      $<HTMLElement>("finish-title").textContent = lang === "nb" ? "Haugen er din" : "The mound is yours";
      $<HTMLElement>("finish-line").textContent = t.endStandalone;
      $<HTMLElement>("finish-link").textContent = t.back;
      finishEl.hidden = false;
    }
  },
  { level: startLevel }
);

// The header's level display.
const nameEl = $<HTMLElement>("name");
const levelEl = $<HTMLElement>("level");
const clockEl = $<HTMLElement>("clock");
const deathsEl = $<HTMLElement>("deaths");
deathsEl.title = t.cursesLabel;
deathsEl.setAttribute("aria-label", t.cursesLabel);
$<HTMLElement>("run").hidden = false;
const shown = { name: "", level: "", clock: "", deaths: "" };
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
}

function layout() {
  kit.resize();
  maze.resize();
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
  if (maze.state.started && !help.hidden) help.hidden = true;
  requestAnimationFrame(frame);
}

new ResizeObserver(layout).observe(stage);
layout();
hud();
requestAnimationFrame((now) => {
  last = now;
  requestAnimationFrame(frame);
});

if (params.has("debug")) Object.assign(window, { __game: { maze, state: maze.state, view, input, frame } });
