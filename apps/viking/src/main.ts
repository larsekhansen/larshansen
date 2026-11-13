import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { buildDoors, doorAt, readAppLinks, type Door } from "./game/doors";
import { wireMute } from "@larshansen/pixelkit/chrome";
import { pickLang, soundWords } from "@larshansen/pixelkit/i18n";
import { strings, type SkyName } from "./game/i18n";
import { createInput, type Action } from "@larshansen/pixelkit/input";
import {
  GROUND_Y,
  RUNE_COUNT,
  WATER_Y,
  WORLD,
  WORLD_W,
  districtAt,
  findDoorSpots,
  findRunes,
  findSheep,
  findSigns,
  findSpawn,
  isOneWay,
  isSolid,
  isWater,
  rampAt,
  type District
} from "./game/level";
import { createStepper } from "@larshansen/pixelkit/loop";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { bounce, createBody, stepBody } from "@larshansen/pixelkit/physics";
import { R, layerOrigin, target, view } from "@larshansen/pixelkit/paint";
import { drawSky, snowfall } from "@larshansen/pixelkit/sky";
import { createStage } from "@larshansen/pixelkit/stage";
import { readHarness, runHarness } from "@larshansen/pixelkit/harness";
import { createSfx } from "@larshansen/pixelkit/sfx";
import { textTarget } from "@larshansen/pixelkit/text";
import type { Look } from "@larshansen/pixelkit/person";
import type { Maze } from "@larshansen/maze/scene";
import { FEATHER_H, FEATHER_W, drawFeather } from "@larshansen/maze/feather";
import { RUNE_STROKES, type RuneChar } from "./game/runes";
import { begin, collect, countOf, elapsedMs, formatTime, judge, newRun, tick, touched } from "./game/run";
import { createSheep, stepSheep, stomped, SHEEP } from "./game/sheep";
import { drawText, layoutBoards, type Board } from "./render/text";
import { drawFjord, drawHeadlands, drawMountains } from "./render/backdrop";
import { drawActors } from "./render/actors";
import { drawBack, drawBoards, lightGround } from "./render/props";
import { drawTiles, drawWater } from "./render/tiles";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const stage = $<HTMLElement>("stage");
const px = $<HTMLCanvasElement>("px");
const ui = $<HTMLCanvasElement>("ui");
const pad = $<HTMLElement>("pad");
const help = $<HTMLElement>("help");
const announce = $<HTMLElement>("announce");
const header = document.querySelector<HTMLElement>(".bar")!;
const enterButton = pad.querySelector<HTMLButtonElement>('[data-action="enter"]')!;

// Four depths: mountains, the far shore of the fjord, near headlands, and the street he walks on.
const kit = createStage({ stage, px, ui, factors: [0.12, 0.2, 0.4, 1] });
const g = kit.g;
textTarget(ui.getContext("2d")!);

// Language: Norwegian for Norwegian browsers, English for everyone else.
const lang = pickLang(navigator.languages?.length ? navigator.languages : [navigator.language]);
const t = strings(lang);
document.documentElement.lang = lang;
document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
  const text = t[el.dataset.i18n as keyof typeof t];
  if (typeof text === "string") el.textContent = text;
});
const actionLabels: Record<string, string> = { left: t.left, right: t.right, jump: t.jump, enter: t.enter };
pad.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((b) => {
  b.setAttribute("aria-label", actionLabels[b.dataset.action ?? ""]);
  if (b.dataset.action === "jump") b.textContent = t.jump;
  if (b.dataset.action === "enter") b.textContent = t.enter;
});

// Storage can be refused in private windows; nothing here may depend on it.
const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // the value lasts for this visit only
    }
  }
};

// The world.
const params = new URLSearchParams(location.search);
let skyOverride = params.get("sky");
/** `?debug&steps=N`: stepped at load and drawn once, with the clock frozen (see the kit's harness). */
const harness = readHarness(params);
const now = () => harness?.now ?? new Date();
let sky = skyFor(now(), skyOverride);
/** The far hills end this far above the ground; the sky's sun and clouds are placed against it. */
const HORIZON_Y = GROUND_Y - 34;
const links = readAppLinks();
const doors = buildDoors(findDoorSpots());
const signs = findSigns();
const runes = findRunes();
const sheep = createSheep(findSheep());
const spawn = findSpawn();
const body = createBody(spawn.x, spawn.bottom);
const input = createInput();
const sfx = createSfx();
wireMute($<HTMLButtonElement>("mute"), sfx, soundWords(lang));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
view.reduced = reducedMotion.matches;
reducedMotion.addEventListener("change", (e) => (view.reduced = e.matches));
const touch = matchMedia("(pointer: coarse)").matches;
/** The double jump is a reward from the maze (order 4); `?feather` gives it for checking. */
const abilities = { doubleJump: store.get("viking.feather") === "1" || params.has("feather") };

// Physics runs in fixed steps. Drawing blends the last two steps, so motion is smooth on any screen.
const before = { x: body.x, y: body.y };
const shown = { ...body };

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const run = newRun();
const savedBest = Number(store.get("viking.best"));
let best: number | null = savedBest > 0 ? savedBest : null;
let crowned = store.get("viking.crowned") === "1";

const state = {
  mode: "play" as "play" | "enter" | "away",
  modeSteps: 0,
  door: null as Door | null,
  fade: 0,
  alpha: 1,
  walk: 0,
  steps: 0,
  moved: false,
  banner: null as { title: string; sub: string; since: number } | null,
  district: districtAt(body.x) as District,
  highlight: null as Door | null,
  /** Where the visitor clicked or tapped: the player walks there, and goes in if it is a door. */
  goal: null as { x: number; y0: number; door: Door | null; best: number; since: number } | null,
  stuck: 0,
  hover: null as Door | null,
  sparks: [] as Spark[],
  /** The last ground he stood on, where the water puts him back. */
  lastGround: { x: spawn.x, bottom: spawn.bottom },
  nearSign: null as string | null,
  finished: false,
  /** The moment at the mound door after the last level: the raven's feather floats down onto him. */
  feather: null as { since: number } | null,
  /** Stepping out of Hjem (`?from=oslo`): bare-headed, then the helmet drops and the cape unrolls. `off` is the helmet's height above his head. */
  arrive: null as { t: number; off: number | null } | null
};
/** Steps during which he stands there and input is ignored. */
const ARRIVE_STEPS = 70;
const frozen = () => !!state.arrive && state.arrive.t < ARRIVE_STEPS;
/** The first double jump of a visit lets three black feather pixels drift down. */
let firstAirJump = true;
/** Set when the maze reports a clear, for the moment at the door once the fjord is back. */
let featherPending = false;
const FEATHER_FALL = 100;
const FEATHER_SHOWN = 340;

state.banner = { title: state.district.name, sub: state.district.landmark ? state.district.landmark[lang] : "", since: 0 };

const LAST_DOOR = "lh:lastVikingDoor";
function remember(id: string) {
  try {
    sessionStorage.setItem(LAST_DOOR, id);
  } catch {
    // private windows can refuse storage, and then Back just starts at the beginning
  }
}
function recall() {
  try {
    return sessionStorage.getItem(LAST_DOOR);
  } catch {
    return null;
  }
}

function place(centerX: number, bottom: number, announceDistrict = true) {
  Object.assign(body, { x: centerX - PLAYER.w / 2, y: bottom - PLAYER.h, vx: 0, vy: 0, onGround: true });
  before.x = body.x;
  before.y = body.y;
  state.lastGround = { x: centerX, bottom };
  state.district = districtAt(body.x);
  if (announceDistrict) state.banner = { title: state.district.name, sub: state.district.landmark ? state.district.landmark[lang] : "", since: state.steps };
}

function standAt(d: Door) {
  place(d.x + d.w / 2, d.bottom);
}

function resetScene() {
  state.mode = "play";
  state.fade = 0;
  state.alpha = 1;
  doors.forEach((d) => (d.open = false));
  input.clear();
}

// Back from a door: start outside the one you went through, with nothing frozen or held.
const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
if (navigation?.type === "back_forward") {
  const d = doors.find((x) => x.id === recall());
  if (d) standAt(d);
}
window.addEventListener("pageshow", (e) => e.persisted && resetScene());

function say(text: string) {
  announce.textContent = text;
}

// ---------------------------------------------------------------------------------------------
// The second scene: Jernhaugen, the maze in the burial mound. Its code is loaded the first time he
// goes in, so the fjord's own script stays small. The address says where he is (#jernhaugen), so
// the browser's Back button leaves the mound.

const MAZE_HASH = "#jernhaugen";
let scene: "fjord" | "maze" = "fjord";
let maze: Maze | null = null;
let loading = false;
/** True when going back in history leaves the mound: false when the page was opened inside it. */
let canGoBack = false;
const mazeUi = {
  hud: $<HTMLElement>("mazehud"),
  back: $<HTMLButtonElement>("mz-back"),
  name: $<HTMLElement>("mz-name"),
  level: $<HTMLButtonElement>("mz-level"),
  clock: $<HTMLElement>("mz-clock"),
  best: $<HTMLElement>("mz-best"),
  deaths: $<HTMLElement>("mz-deaths")
};
const mazeShown = { name: "", level: "", clock: "", best: "", deaths: "" };
let mazeText: { deaths(n: number): string; best(time: string): string; formatTime(ms: number): string } | null = null;
const fjordHelp = { text: "", hidden: false };

function showMazeHud() {
  if (!maze || !mazeText) return;
  const h = maze.hud();
  const next = { name: h.name, level: `${h.level} / ${h.of}`, clock: mazeText.formatTime(h.ms), best: h.best === null ? "" : mazeText.best(mazeText.formatTime(h.best)), deaths: mazeText.deaths(h.deaths) };
  for (const key of Object.keys(next) as (keyof typeof next)[]) {
    if (mazeShown[key] === next[key]) continue;
    mazeShown[key] = next[key];
    mazeUi[key].textContent = next[key];
  }
  if (maze.state.started && !help.hidden) help.hidden = true;
}

async function enterMaze() {
  if (scene === "maze" || loading) return;
  loading = true;
  // The fjord goes dark and waits, however long the maze takes to arrive.
  state.mode = "away";
  state.fade = 1;
  state.alpha = 0;
  try {
    const [mod, words, rules] = await Promise.all([import("@larshansen/maze/scene"), import("@larshansen/maze/i18n"), import("@larshansen/maze/rules")]);
    const mt = words.strings(lang);
    mazeText = { deaths: mt.deaths, best: mt.best, formatTime: rules.formatTime };
    mazeUi.level.title = mt.levelsButton;
    mazeUi.level.setAttribute("aria-label", mt.levelsButton);
    mazeUi.back.textContent = mt.back;
    mazeUi.back.setAttribute("aria-label", mt.leaving);
    mazeUi.deaths.title = mt.cursesLabel;
    mazeUi.deaths.setAttribute("aria-label", mt.cursesLabel);
    if (!loading || location.hash !== MAZE_HASH) throw new Error("left before the mound opened");
    input.clear();
    maze = mod.createMaze(
      {
        stage: kit,
        input,
        sfx,
        lang,
        el: stage,
        say,
        topInset: () => (header.getBoundingClientRect().height * view.dpr) / view.k,
        onLeave: (r) => leaveMaze(r.cleared)
      },
      { level: Number(params.get("level")) || undefined }
    );
    scene = "maze";
    loading = false;
    document.body.classList.add("in-maze");
    document.body.classList.remove("touch");
    pad.hidden = true;
    fjordHelp.text = help.textContent ?? "";
    fjordHelp.hidden = help.hidden;
    help.textContent = mt.help;
    help.hidden = false;
    stage.style.cursor = "";
    mazeShown.name = mazeShown.level = mazeShown.clock = mazeShown.best = mazeShown.deaths = "";
    showMazeHud();
    layout();
  } catch {
    // The maze did not load (or he left first): back to the fjord, standing at the mound door.
    loading = false;
    if (location.hash === MAZE_HASH) history.replaceState(null, "", location.pathname + location.search);
    backToFjord();
  }
}

/** He is out of the mound: the fjord again, with him standing at its door. */
function backToFjord() {
  maze?.destroy();
  maze = null;
  scene = "fjord";
  loading = false;
  document.body.classList.remove("in-maze");
  if (touch) {
    document.body.classList.add("touch");
    pad.hidden = false;
  }
  help.textContent = fjordHelp.text || help.textContent;
  help.hidden = fjordHelp.text ? fjordHelp.hidden : help.hidden;
  standAt(mound);
  resetScene();
  if (featherPending) {
    featherPending = false;
    state.feather = { since: state.steps };
  }
  state.moved = state.moved || help.hidden;
  state.fade = 1; // fades back in
  Object.assign(shown, body);
  layout();
}

/** Called by the maze when he walks out, or clears the last level. */
function leaveMaze(cleared: boolean) {
  if (cleared) {
    abilities.doubleJump = true; // the raven's feather: the double jump is on at once
    featherPending = true;
  }
  if (canGoBack && location.hash === MAZE_HASH) {
    history.back(); // the hashchange that follows takes him out
    return;
  }
  if (location.hash === MAZE_HASH) history.replaceState(null, "", location.pathname + location.search);
  backToFjord();
}

/** Keeps the scene in step with the address: Back, Forward, a typed address, or a click. */
function syncScene() {
  const wantMaze = location.hash === MAZE_HASH;
  if (wantMaze && scene === "fjord" && !loading) void enterMaze();
  else if (!wantMaze && (scene === "maze" || loading)) {
    if (scene === "maze") backToFjord();
    else loading = false; // left before it loaded: enterMaze notices and gives up
  }
}
window.addEventListener("hashchange", () => {
  if (location.hash === MAZE_HASH && scene === "fjord" && !loading) canGoBack = true;
  syncScene();
});
mazeUi.level.addEventListener("click", () => {
  maze?.levels.toggle();
  mazeUi.level.blur();
});
mazeUi.back.addEventListener("click", () => {
  leaveMaze(false);
  mazeUi.back.blur();
});

// ---------------------------------------------------------------------------------------------
// The header: ten rune slots, the clock, restart and mute.

const runeSlots = [...document.querySelectorAll<HTMLElement>("#runes li")];
const runesEl = $<HTMLElement>("runes");
const clockEl = $<HTMLElement>("clock");
const bestEl = $<HTMLElement>("best");
const restartButton = $<HTMLButtonElement>("restart");
const finishEl = $<HTMLElement>("finish");

const SVG = "http://www.w3.org/2000/svg";
const NAME_RUNES = "LARSHANSEN";
runeSlots.forEach((li, i) => {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "-1 -1 12 17");
  svg.setAttribute("aria-hidden", "true");
  for (const stroke of RUNE_STROKES[NAME_RUNES[i] as RuneChar]) {
    const line = document.createElementNS(SVG, "polyline");
    line.setAttribute("points", stroke.map(([x, y]) => `${x * 10},${y * 15}`).join(" "));
    svg.appendChild(line);
  }
  li.appendChild(svg);
});
$<HTMLElement>("run").hidden = false;

let shownClock = "";
let shownCount = -1;
function hud() {
  const ms = elapsedMs(run);
  const text = formatTime(ms);
  if (text !== shownClock) {
    shownClock = text;
    clockEl.textContent = text;
  }
  const n = countOf(run);
  if (n !== shownCount) {
    shownCount = n;
    runeSlots.forEach((li, i) => li.classList.toggle("lit", (run.mask & (1 << i)) !== 0));
    runesEl.setAttribute("aria-label", n === RUNE_COUNT ? t.runesAll : t.runes(n));
  }
  bestEl.textContent = best !== null ? `${t.best} ${formatTime(best)}` : "";
}

function labelButtons() {
  restartButton.setAttribute("aria-label", t.restart);
  restartButton.title = `${t.restart} (R)`;
}
labelButtons();
$<HTMLElement>("finish-title").textContent = t.finishTitle;
$<HTMLElement>("finish-again").textContent = t.finishAgain;
$<HTMLElement>("finish-back").textContent = t.finishBack;

/** Runes back, clock at zero, and him at the start. */
function restart() {
  Object.assign(run, newRun());
  state.finished = false;
  state.goal = null;
  state.sparks = [];
  state.moved = false;
  finishEl.hidden = true;
  place(spawn.x, spawn.bottom);
  input.clear();
  hud();
}

function finish() {
  state.finished = true;
  crowned = true;
  store.set("viking.crowned", "1");
  const ms = elapsedMs(run);
  const verdict = judge(best, ms);
  best = verdict.best;
  store.set("viking.best", String(Math.round(best)));
  $<HTMLElement>("finish-line").textContent = `${formatTime(ms)} · ${verdict.isNew ? t.finishNew : t.finishBest(formatTime(best))}`;
  finishEl.hidden = false;
  say(`${t.finishTitle} ${formatTime(ms)}`);
  sfx.play("fanfare");
  if (!view.reduced) fireworks();
}

function fireworks() {
  // The same kind of sparks as the front page's fireworks: single pixels, in the colours of the flag.
  const colors = ["#ba0c2f", "#ffffff", "#00205b", "#ffd36b"];
  const cx = body.x + PLAYER.w / 2;
  for (let burst = 0; burst < 3; burst++) {
    const bx = cx - 40 + burst * 40;
    const by = body.y - 50 - (burst % 2) * 10;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const v = 0.6 + Math.random() * 0.5;
      state.sparks.push({ x: bx, y: by, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.2, life: 50 + burst * 12, color: colors[(i + burst) % 4] });
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Rules.

function tryEnter(d: Door) {
  state.mode = "enter";
  state.modeSteps = 0;
  state.door = d;
  body.vx = 0;
  sfx.play("door");
  say(t.opening(d.sign));
}

/** The y of the first thing to stand on at or below `fromY`, under world x: for the marker and ?x=. */
function surfaceBelow(x: number, fromY: number): number | null {
  const ramp = rampAt(x);
  if (ramp !== null && ramp >= fromY - 1) return ramp;
  const c = Math.floor(x / TILE);
  for (let r = Math.max(0, Math.floor(fromY / TILE)); r < 16; r++) if (isSolid(c, r) || isOneWay(c, r)) return r * TILE;
  return isWater(c, 16) ? null : GROUND_Y;
}

/** True when there is ground, a ledge or a slope right under his feet. */
function supported(): boolean {
  const cx = body.x + PLAYER.w / 2;
  const feet = body.y + PLAYER.h;
  const ramp = rampAt(cx);
  if (ramp !== null && Math.abs(ramp - feet) < 1.5) return true;
  const c = Math.floor(cx / TILE);
  const r = Math.round(feet / TILE);
  return Math.abs(feet - r * TILE) < 0.01 && (isSolid(c, r) || isOneWay(c, r));
}

function intoWater() {
  const from = body.x + PLAYER.w / 2;
  for (let i = 0; i < 8; i++)
    state.sparks.push({ x: from + (i - 4) * 1.5, y: WATER_Y - 1, vx: (i - 3.5) * 0.18, vy: -0.8 - Math.random() * 0.6, life: 22, color: "#d6eef9" });
  sfx.play("splash");
  // Back on the last ground he stood on, turned towards the water, with nothing carried over.
  const toward = from > state.lastGround.x ? 1 : from < state.lastGround.x ? -1 : body.facing;
  place(state.lastGround.x, state.lastGround.bottom, false);
  body.facing = toward;
  state.goal = null;
}

function play() {
  const door = doorAt(body, doors);
  const still = frozen();
  if (door && !still && (input.pressed("up") || input.pressed("enter"))) return tryEnter(door);
  const intent = {
    left: !still && input.held.left,
    right: !still && input.held.right,
    jumpHeld: !still && (input.held.jump || input.held.up),
    jumpPressed: !still && (input.pressed("jump") || (input.pressed("up") && !door))
  };
  // Walking to a clicked spot or door. Any input of the visitor's own takes over again.
  if (state.goal && still) state.goal = null;
  if (state.goal) {
    const goal = state.goal;
    const dx = goal.x - (body.x + PLAYER.w / 2);
    // Getting closer resets the patience; three seconds without progress means it cannot be reached.
    if (Math.abs(dx) < goal.best - 0.5) {
      goal.best = Math.abs(dx);
      goal.since = state.steps;
    }
    if (intent.left || intent.right || intent.jumpPressed || state.steps - goal.since > 180) state.goal = null;
    else if (goal.door && door === goal.door) {
      state.goal = null;
      return tryEnter(goal.door);
    } else if (!goal.door && Math.abs(dx) <= 1.5) state.goal = null;
    else {
      intent.left = dx < -1;
      intent.right = dx > 1;
      // Crates, rocks and walls in the way: hop over when walking gets nowhere.
      state.stuck = body.onGround && Math.abs(body.vx) < 0.05 ? state.stuck + 1 : 0;
      intent.jumpPressed = state.stuck > 4;
      intent.jumpHeld = true; // always the full jump
    }
  }
  const prevBottom = body.y + PLAYER.h;
  const airJumps = body.airJumps;
  const r = stepBody(body, intent, WORLD, abilities);
  if (r.jumped && body.airJumps < airJumps && firstAirJump) {
    // His first jump in mid-air: three black feather pixels drift down from where he took it.
    firstAirJump = false;
    if (!view.reduced)
      for (let i = 0; i < 3; i++) state.sparks.push({ x: body.x + PLAYER.w / 2 + (i - 1) * 3, y: body.y + PLAYER.h - 2 + i, vx: (i - 1) * 0.12, vy: 0.02, life: 70 + i * 12, color: "#14131a" });
  }
  if (intent.left || intent.right || r.jumped) {
    state.moved = true;
    begin(run);
  }
  if (r.jumped) sfx.play("jump");
  state.walk = body.onGround && Math.abs(body.vx) > 0.2 ? state.walk + 1 : 0;
  if (state.walk > 0 && state.walk % 14 === 7) sfx.play("step");

  // Sheep: coming down on one from above is a trampoline.
  let bounced = false;
  for (const s of sheep)
    if (!bounced && stomped(body, prevBottom, s)) {
      bounce(body, 7);
      body.y = s.bottom - SHEEP.h - PLAYER.h;
      s.squash = SHEEP.squashSteps;
      sfx.play("bleat");
      bounced = true;
    }
  if (!bounced && r.landed > 3) {
    sfx.play("land");
    if (!view.reduced)
      for (let i = 0; i < 5; i++)
        state.sparks.push({ x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h - 1, vx: (i - 2) * 0.35, vy: -0.3 - Math.random() * 0.4, life: 18, color: "#ebe1cd" });
  }

  // Water: his feet in a water tile put him back on the last ground.
  const feet = body.y + PLAYER.h;
  if (feet > WATER_Y + 2 && isWater(Math.floor((body.x + PLAYER.w / 2) / TILE), Math.floor((feet - 1) / TILE))) intoWater();
  else if (body.onGround && supported()) state.lastGround = { x: body.x + PLAYER.w / 2, bottom: feet };

  // Runes: touching a rune's tile collects it.
  for (const i of touched(body, runes, run.mask)) {
    const got = collect(run, i);
    if (!got.fresh) continue;
    sfx.play("pickup", countOf(run) - 1);
    say(t.runeAnnounce(countOf(run)));
    if (!view.reduced) {
      const rune = runes[i];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        state.sparks.push({ x: rune.x + 8, y: rune.y + 8, vx: Math.cos(a) * 0.7, vy: Math.sin(a) * 0.7 - 0.1, life: 20, color: "#9fe3ff" });
      }
    }
    if (got.finished) finish();
  }

  const here = districtAt(body.x + PLAYER.w / 2);
  if (here !== state.district) {
    state.district = here;
    state.banner = { title: here.name, sub: here.landmark ? here.landmark[lang] : "", since: state.steps };
  }
}

// Through a door: walk in, fade out, then open the place in this tab.
function goThrough() {
  const d = state.door!;
  const s = ++state.modeSteps;
  const quick = view.reduced;
  const cx = d.x + d.w / 2 - PLAYER.w / 2;
  if (!quick && s <= 10) body.x += (cx - body.x) * 0.35;
  if (!quick && s > 10 && s <= 30) {
    d.open = true;
    state.alpha = Math.max(0, 1 - (s - 10) / 20);
  }
  if (!quick && s > 30) state.fade = Math.min(1, (s - 30) / 14);
  if (quick || s >= 44) {
    state.mode = "away";
    state.modeSteps = 0;
    if (d.id === "maze") {
      // The mound is a scene in this page: the address changes, and Back comes out again.
      canGoBack = true;
      location.hash = MAZE_HASH;
      syncScene();
    } else {
      remember(d.id);
      location.assign(d.href);
    }
  }
}

function stepOnce() {
  before.x = body.x;
  before.y = body.y;
  state.steps++;
  stepArrival();
  input.pollPad();
  tick(run);
  if (state.mode === "play") play();
  else if (state.mode === "enter") goThrough();
  else if (!loading && ++state.modeSteps > 300) resetScene(); // the place never opened
  if (state.feather && state.steps - state.feather.since > FEATHER_SHOWN) state.feather = null;
  if (state.mode === "play" && state.fade > 0) state.fade = Math.max(0, state.fade - 1 / 16); // coming back from the mound
  for (const s of sheep) stepSheep(s);
  doors.forEach((d) => d.shake > 0 && d.shake--);
  state.sparks = state.sparks.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    return --p.life > 0;
  });
  input.endStep();
  if (state.steps % 120 === 0) sky = skyFor(now(), skyOverride);
}

/** The camera follows the player smoothly, at the same pace on every screen, up the cliff as well. */
function camera(elapsedMs: number, snap: boolean) {
  const maxX = WORLD_W - view.w;
  const maxY = GROUND_Y + TILE - view.h; // one tile of ground below the street, as on the front page
  const tx = shown.x + PLAYER.w / 2 + body.facing * 22 - view.w / 2;
  const wantX = maxX < 0 ? maxX / 2 : Math.max(0, Math.min(maxX, tx));
  // A tall screen shows more sky, with the street kept at the bottom.
  // The fixed header bar covers the top of the screen, so the camera may rise above the top of the
  // world by the bar's height (it is only sky up there), and the tower and its rune show below it.
  const bar = (header.getBoundingClientRect().height * view.dpr) / view.k;
  const cx = shown.x + PLAYER.w / 2;
  const onPlateau = cx >= 118 * TILE && cx <= 131 * TILE && shown.y + PLAYER.h <= 10 * TILE + 1;
  const lookUp = onPlateau ? 24 : 0; // a hint of the tower's top and its rune
  const wantY = maxY < 0 ? maxY : Math.max(-bar, Math.min(maxY, shown.y + PLAYER.h / 2 - view.h / 2 - lookUp));
  const k = snap ? 1 : 1 - Math.exp(-elapsedMs / 130);
  view.camXf += (wantX - view.camXf) * k;
  view.camYf += (wantY - view.camYf) * k;
  view.camX = Math.floor(view.camXf);
  view.camY = Math.floor(view.camYf);
}

let boards: Board[] = [];
const signLabels = { start: t.boardStart, jetty: t.boardJetty, smithy: t.boardSmithy, beacon: t.boardBeacon };
const signLines = { start: t.signStart, jetty: t.signJetty, smithy: t.signSmithy, beacon: t.signBeacon };
function layout() {
  kit.resize();
  maze?.resize();
  boards = layoutBoards(doors, signs.map((s) => ({ ...s, label: signLabels[s.key] })));
  camera(0, true);
}

const pass = (onto: CanvasRenderingContext2D, draw: () => void, haze = 0) => kit.pass(onto, draw, sky.phase, haze);
const nudge = kit.nudge;
const look = (): Look => {
  const a = state.arrive;
  if (!a) return { outfit: "viking", gold: crowned };
  return { outfit: "viking", gold: crowned, helmetOffset: a.off, capeRows: a.t < 45 ? 0 : Math.min(4, Math.floor((a.t - 45) / 4) + 1) };
};

/** The moment of putting the outfit on: the helmet falls from above the view at step 30, the cape unrolls from step 45. */
function stepArrival() {
  const a = state.arrive;
  if (!a) return;
  a.t++;
  state.alpha = Math.min(1, a.t / 12);
  const home = doors.find((d) => d.id === "home");
  if (home) home.open = a.t < 16; // the door closes behind him
  // From above the view; on a tall screen that is capped at 35 steps of falling, so it has landed before the input unlocks.
  if (a.t === 30) a.off = Math.max(12, Math.min(105, Math.ceil(body.y - view.camY) + 4));
  else if (a.off !== null && a.off > 0 && a.t > 30) {
    a.off = Math.max(0, a.off - 3);
    if (a.off === 0) {
      sfx.play("land");
      for (const dx of [-3, 3]) state.sparks.push({ x: body.x + PLAYER.w / 2 + dx, y: body.y + 2, vx: dx * 0.1, vy: -0.25, life: 18, color: "#ebe1cd" });
    }
  }
  if (a.t >= ARRIVE_STEPS) {
    state.arrive = null;
    state.alpha = 1;
  }
}

/** The mound door's hint, while he has no feather: some runes hang too high. */
const mound = doors.find((d) => d.id === "maze")!;

function render() {
  target(g);
  drawSky(sky, state.steps, HORIZON_Y);
  nudge(px, 0);

  for (const d of kit.depths) {
    d.g.clearRect(0, 0, view.w, view.h);
    const origin = layerOrigin(d.factor);
    nudge(d.canvas, origin - Math.floor(origin));
  }
  pass(kit.depth(0.12), () => drawMountains(sky), 0.35);
  pass(kit.depth(0.2), () => drawFjord(state.steps), 0.3);
  pass(kit.depth(0.4), () => drawHeadlands(sky), 0.2);
  const street = kit.depth(1);
  pass(street, () => drawBack(doors, sky, state.steps));
  pass(street, () => {
    drawBoards(boards);
    drawWater(state.steps);
    drawTiles(sky);
    lightGround();
  });
  pass(street, () => drawActors(sheep, runes, run.mask, state.steps));
  target(street);
  for (const p of state.sparks) R(p.x, p.y, 1, 1, p.color);
  if (state.feather) {
    const p = Math.min(1, (state.steps - state.feather.since) / FEATHER_FALL);
    if (p < 1) {
      // The feather floats down, swaying, and comes to rest on his shoulder.
      const sway = view.reduced ? 0 : Math.round(Math.sin((state.steps - state.feather.since) * 0.11) * 5 * (1 - p));
      drawFeather(Math.round(shown.x + PLAYER.w / 2 - FEATHER_W / 2 + sway), Math.round(shown.y - 60 * (1 - p) + 2 - FEATHER_H / 2 + 6 * p), "#14131a", "#4f9bd8", "rgba(255, 255, 255, 0.7)");
    }
  }

  const door = state.mode === "play" ? doorAt(body, doors) : null;
  const age = state.banner ? state.steps - state.banner.since : 0;

  // A sign he is standing by speaks in a bubble; so does the mound while he has no feather.
  const cx = shown.x + PLAYER.w / 2;
  let bubble: { x: number; y: number; lines: string[]; align?: "left" } | null = null;
  if (state.mode === "play" && !door) {
    const sign = signs.find((s) => Math.abs(cx - s.x) < 28 && Math.abs(shown.y + PLAYER.h - s.bottom) < 8);
    // The start sign's bubble grows to the right of its post, so it leaves the title stone free.
    if (sign) bubble = { x: sign.key === "start" ? sign.x - 4 : sign.x, y: sign.bottom - 30, lines: signLines[sign.key], align: sign.key === "start" ? "left" : undefined };
    else if (!abilities.doubleJump && Math.abs(cx - (mound.x + mound.w / 2)) < 5 * TILE && body.onGround && Math.abs(shown.y + PLAYER.h - mound.bottom) < 8)
      bubble = { x: mound.x + mound.w / 2, y: mound.bottom - mound.h, lines: t.moundNoFeather };
  }
  // The feather moment at the mound door: his own bubble, even though he stands at a door.
  const speaking = state.mode === "play" && !!state.feather && state.steps - state.feather.since > FEATHER_FALL * 0.6;
  if (speaking) bubble = { x: cx, y: shown.y - 4, lines: [t.featherLine] };
  const nearKey = bubble ? bubble.lines[0] : null;
  if (nearKey !== state.nearSign) {
    state.nearSign = nearKey;
    if (bubble) say(bubble.lines.join(" "));
  }

  drawText({
    boards,
    fade: state.fade,
    snow: snowfall(sky, state.steps),
    player: { body: shown, walk: state.walk, alpha: state.alpha * (1 - state.fade), phase: sky.phase, look: look() },
    hint: door && !touch && !speaking && !frozen() ? { x: shown.x + PLAYER.w / 2, y: shown.y, text: `↑  ${t.goIn}` } : null,
    bubble: door && !speaking ? null : bubble,
    banner: state.banner ? { title: state.banner.title, sub: state.banner.sub, alpha: view.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, age / 15, (165 - age) / 30)) } : null,
    highlight: state.highlight ?? state.hover ?? state.goal?.door ?? null,
    marker: state.goal && !state.goal.door ? { x: state.goal.x, y: surfaceBelow(state.goal.x, state.goal.y0) ?? GROUND_Y } : null,
    steps: state.steps
  });

  enterButton.classList.toggle("show", !!door);
  // The header link of the door you are standing at lights up.
  if (door !== nearDoor) {
    nearDoor = door;
    for (const link of links) link.el.classList.toggle("here", link.id === door?.id);
  }
  if (state.moved && !help.hidden) help.hidden = true;
  hud();
}

let nearDoor: Door | null = null;
const stepper = createStepper(() => {
  if (scene === "maze" && maze) {
    input.pollPad(0.35);
    maze.step();
    input.endStep();
  } else stepOnce();
});
let last = performance.now();
function frame(now: number) {
  const elapsed = Math.min(100, Math.max(0, now - last));
  last = now;
  stepper.advance(elapsed);
  const a = stepper.alpha();
  if (scene === "maze" && maze) {
    maze.render(a, elapsed);
    showMazeHud();
    requestAnimationFrame(frame);
    return;
  }
  Object.assign(shown, body, { x: before.x + (body.x - before.x) * a, y: before.y + (body.y - before.y) * a });
  camera(elapsed, false);
  render();
  requestAnimationFrame(frame);
}

// Touch buttons feed the same actions as the keyboard.
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

// Pointing at a plain link lights up its door in the game.
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

// Clicking or tapping sends the player there: into a door, or just along the ground.
function worldAt(e: MouseEvent) {
  const rect = stage.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * view.dpr) / view.k + view.camXf,
    y: ((e.clientY - rect.top) * view.dpr) / view.k + view.camYf
  };
}
function doorUnder(e: MouseEvent): Door | null {
  const { x, y } = worldAt(e);
  return doors.find((d) => x >= d.x - TILE && x <= d.x + d.w + TILE && y >= d.bottom - TILE * 3.5 && y <= d.bottom + 2) ?? null;
}
stage.addEventListener("click", (e) => {
  if (state.mode !== "play" || scene !== "fjord" || frozen()) return;
  const door = doorUnder(e);
  const at = worldAt(e);
  const x = door ? door.x + door.w / 2 : Math.max(PLAYER.w, Math.min(WORLD_W - PLAYER.w, at.x));
  state.goal = { x, y0: at.y, door, best: Infinity, since: state.steps };
  state.stuck = 0;
  state.moved = true;
  begin(run);
});
stage.addEventListener("mousemove", (e) => {
  state.hover = state.mode === "play" && scene === "fjord" ? doorUnder(e) : null;
  stage.style.cursor = state.hover ? "pointer" : "";
});
stage.addEventListener("mouseleave", () => (state.hover = null));

restartButton.addEventListener("click", () => {
  restart();
  restartButton.blur(); // give the keyboard back to the game
});
$<HTMLElement>("finish-again").addEventListener("click", restart);

// T steps through every sky and back to the real one; R starts the run again (M, the sound, is wired by the kit).
const SKIES: (SkyName | null)[] = [null, "day", "evening", "twilight", "night", "winter", "17mai"];
window.addEventListener("keydown", (e) => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target instanceof Element && e.target.closest("a, button, input, textarea, select")) return;
  if (scene !== "fjord") return;
  if (e.code === "KeyT") {
    const next = SKIES[(SKIES.indexOf(skyOverride as SkyName | null) + 1) % SKIES.length];
    skyOverride = next;
    sky = skyFor(now(), skyOverride);
    state.banner = { title: t.skies[next ?? "now"], sub: "", since: state.steps };
  } else if (e.code === "KeyR") restart();
});

// Where he comes from. `from=oslo`: out of the boathouse door Hjem, with the outfit moment. `from=maze`: at the mound door.
// The address is cleaned afterwards, so a reload starts at the start as usual.
const from = params.get("from");
if (from === "oslo") {
  const home = doors.find((d) => d.id === "home");
  if (home) {
    standAt(home);
    if (!view.reduced) {
      state.arrive = { t: 0, off: null };
      state.alpha = 0;
      home.open = true;
    }
  }
} else if (from === "maze") standAt(mound);
if (params.has("from")) {
  params.delete("from");
  const rest = params.toString();
  history.replaceState(null, "", location.pathname + (rest ? `?${rest}` : "") + location.hash);
}

// ?x=<art px> drops him at that x, on the highest thing there, so a reviewer can start anywhere.
const startX = Number(params.get("x"));
const startY = Number.isFinite(startX) ? surfaceBelow(startX, 0) : null;
if (params.has("x") && startY !== null) place(startX, startY);

/** One frame with nothing blended and the camera settled on him: what a stepped page shows. */
function still() {
  Object.assign(shown, body);
  camera(0, true);
  render();
}

Object.assign(shown, body);
// A resize clears the canvases; a stepped page has no next frame to draw them again, so it redraws here.
new ResizeObserver(() => {
  layout();
  if (harness && scene === "fjord") still();
}).observe(stage);
layout();
hud();
if (harness) {
  runHarness(harness, input, stepOnce);
  still();
} else
  requestAnimationFrame((now) => {
    last = now;
    requestAnimationFrame(frame);
  });

// The header link to the maze keeps its address for visitors without JavaScript; with it, a click goes in.
links.find((l) => l.id === "maze")?.el.addEventListener("click", (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  if (scene === "maze" || loading) return;
  canGoBack = true;
  location.hash = MAZE_HASH;
  syncScene();
});

// ?level=<n> opens the mound at that level. Opening /viking/#jernhaugen starts in it too.
if (params.has("level") && location.hash !== MAZE_HASH) history.replaceState(null, "", location.pathname + location.search + MAZE_HASH);
syncScene();

if (params.has("debug"))
  Object.assign(window, {
    __game: {
      body,
      shown,
      state,
      view,
      input,
      step: stepOnce,
      frame,
      still,
      doors,
      runes,
      get maze() {
        return maze;
      }
    }
  });
