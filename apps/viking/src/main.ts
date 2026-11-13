import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { aim, follow } from "@larshansen/pixelkit/camera";
import { wireMute } from "@larshansen/pixelkit/chrome";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { buildDoors, doorAt, readAppLinks, type Door } from "@larshansen/pixelkit/doors";
import { readHarness } from "@larshansen/pixelkit/harness";
import { browserLang, soundWords } from "@larshansen/pixelkit/i18n";
import { createInput } from "@larshansen/pixelkit/input";
import { target, view } from "@larshansen/pixelkit/paint";
import { DUST, FEATHER, PALETTE } from "@larshansen/pixelkit/palette";
import type { Look } from "@larshansen/pixelkit/person";
import { bounce, createBody, placeBody, stepBody } from "@larshansen/pixelkit/physics";
import { drawBoards } from "@larshansen/pixelkit/props";
import {
  afterStep,
  bannerFor,
  beginLayers,
  blend,
  byId,
  createLoop,
  doorLeftBy,
  dropParam,
  followGoal,
  followReducedMotion,
  hardLanding,
  intentFrom,
  isTouch,
  launch,
  onKey,
  openPage,
  pageFollows,
  putWords,
  rememberDoor,
  reopen,
  sceneOverlay,
  sceneState,
  skyControl,
  stepEnd,
  stepStart,
  stepThrough,
  trackDistrict,
  wireLinks,
  wirePad,
  wirePointer,
  wireSkyKey
} from "@larshansen/pixelkit/scene";
import { createSfx } from "@larshansen/pixelkit/sfx";
import { drawSparks, fireworks } from "@larshansen/pixelkit/sparks";
import { drawOverlay, type Board } from "@larshansen/pixelkit/text";
import { walkTo } from "@larshansen/pixelkit/walkto";
import type { Maze } from "@larshansen/maze/scene";
import { FEATHER_H, FEATHER_W, drawFeather } from "@larshansen/maze/feather";
import { strings } from "./game/i18n";
import { GROUND_Y, LEVEL, RUNE_COUNT, WATER_Y, WORLD, WORLD_W, findDoorSpots, findRunes, findSheep, findSigns, isWater } from "./game/level";
import { RUNE_STROKES, type RuneChar } from "./game/runes";
import { begin, collect, countOf, elapsedMs, formatTime, judge, newRun, tick, touched } from "./game/run";
import { createSheep, stepSheep, stomped, SHEEP } from "./game/sheep";
import { drawActors } from "./render/actors";
import { drawFjord, drawHeadlands, drawMountains } from "./render/backdrop";
import { drawBack, lightGround } from "./render/props";
import { layoutBoards } from "./render/text";
import { drawTiles, drawWater } from "./render/tiles";

const $ = byId;
// Four depths: mountains, the far shore of the fjord, near headlands, and the street he walks on.
const { stage, pad, help, announce, enterButton, kit } = openPage([0.12, 0.2, 0.4, 1]);
const header = document.querySelector<HTMLElement>(".bar")!;

// Language: Norwegian for Norwegian browsers, English for everyone else.
const lang = browserLang();
const t = strings(lang);
putWords(lang, t, pad);

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
/** `?debug&steps=N`: stepped at load and drawn once, with the clock frozen (see the kit's harness). */
const harness = readHarness(params);
const skies = skyControl(params.get("sky"), () => harness?.now ?? new Date());
/** The far hills end this far above the ground; the sky's sun and clouds are placed against it. */
const HORIZON_Y = GROUND_Y - 34;
const links = readAppLinks();
const doors = buildDoors(findDoorSpots());
const signs = findSigns();
const runes = findRunes();
const sheep = createSheep(findSheep());
const spawn = LEVEL.spawn();
const body = createBody(spawn.x, spawn.bottom);
const input = createInput();
const sfx = createSfx();
wireMute($<HTMLButtonElement>("mute"), sfx, soundWords(lang));
followReducedMotion();
const touch = isTouch();
/** The double jump is a reward from the maze (order 4); `?feather` gives it for checking. */
const abilities = { doubleJump: store.get("viking.feather") === "1" || params.has("feather") };

// Physics runs in fixed steps. Drawing blends the last two steps, so motion is smooth on any screen.
const before = { x: body.x, y: body.y };
const shown = { ...body };

const run = newRun();
const savedBest = Number(store.get("viking.best"));
let best: number | null = savedBest > 0 ? savedBest : null;
let crowned = store.get("viking.crowned") === "1";

const state = {
  ...sceneState<Door>(LEVEL.districtAt(body.x), lang),
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
/** No keys: what he does while the outfit moment holds him still. */
const STILL = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const frozen = () => !!state.arrive && state.arrive.t < ARRIVE_STEPS;
/** The first double jump of a visit lets three black feather pixels drift down. */
let firstAirJump = true;
/** Set when the maze reports a clear, for the moment at the door once the fjord is back. */
let featherPending = false;
const FEATHER_FALL = 100;
const FEATHER_SHOWN = 340;

const LAST_DOOR = "lh:lastVikingDoor";

function place(centerX: number, bottom: number, announceDistrict = true) {
  placeBody(body, centerX, bottom);
  before.x = body.x;
  before.y = body.y;
  state.lastGround = { x: centerX, bottom };
  state.district = LEVEL.districtAt(body.x);
  if (announceDistrict) state.banner = bannerFor(state.district, lang, state.steps);
}

const standAt = (d: Door) => place(d.x + d.w / 2, d.bottom);
const resetScene = () => reopen(state, doors, input);

// Back from a door: start outside the one you went through, with nothing frozen or held.
const cameBackBy = doorLeftBy(LAST_DOOR, doors);
if (cameBackBy) standAt(cameBackBy);
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
  if (!view.reduced) {
    // The front page's fireworks, over his head.
    const cx = body.x + PLAYER.w / 2;
    fireworks(state.sparks, (burst) => ({ x: cx - 40 + burst * 40, y: body.y - 50 - (burst % 2) * 10 }));
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

/** The y of the first thing to stand on at or below `fromY`, under world x: for the marker and ?x=. A point below the ground counts as on it. */
const surfaceBelow = (x: number, fromY: number) => LEVEL.surfaceBelow(x, Math.min(fromY, GROUND_Y));

function intoWater() {
  const from = body.x + PLAYER.w / 2;
  for (let i = 0; i < 8; i++)
    state.sparks.push({ x: from + (i - 4) * 1.5, y: WATER_Y - 1, vx: (i - 3.5) * 0.18, vy: -0.8 - Math.random() * 0.6, life: 22, color: PALETTE.foam });
  sfx.play("splash");
  // Back on the last ground he stood on, turned towards the water, with nothing carried over.
  const toward = from > state.lastGround.x ? 1 : from < state.lastGround.x ? -1 : body.facing;
  place(state.lastGround.x, state.lastGround.bottom, false);
  body.facing = toward;
  state.goal = null;
}

function play() {
  const door = doorAt(body, doors);
  const held = frozen();
  if (door && !held && (input.pressed("up") || input.pressed("enter"))) return tryEnter(door);
  // Walking to a clicked spot or door. Any input of the visitor's own takes over again.
  if (state.goal && held) state.goal = null;
  const { intent, enter } = followGoal(state, body, held ? STILL : intentFrom(input, !!door), door);
  if (enter) return tryEnter(enter);
  const prevBottom = body.y + PLAYER.h;
  const airJumps = body.airJumps;
  const r = stepBody(body, intent, WORLD, abilities);
  if (r.jumped && body.airJumps < airJumps && firstAirJump) {
    // His first jump in mid-air: three black feather pixels drift down from where he took it.
    firstAirJump = false;
    if (!view.reduced)
      for (let i = 0; i < 3; i++) state.sparks.push({ x: body.x + PLAYER.w / 2 + (i - 1) * 3, y: body.y + PLAYER.h - 2 + i, vx: (i - 1) * 0.12, vy: 0.02, life: 70 + i * 12, color: FEATHER.vane });
  }
  if (afterStep(state, body, intent, r, sfx)) begin(run);

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
  if (!bounced) hardLanding(state, body, r, sfx);

  // Water: his feet in a water tile put him back on the last ground.
  const feet = body.y + PLAYER.h;
  if (feet > WATER_Y + 2 && isWater(Math.floor((body.x + PLAYER.w / 2) / TILE), Math.floor((feet - 1) / TILE))) intoWater();
  else if (body.onGround && LEVEL.supports(body)) state.lastGround = { x: body.x + PLAYER.w / 2, bottom: feet };

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
        state.sparks.push({ x: rune.x + 8, y: rune.y + 8, vx: Math.cos(a) * 0.7, vy: Math.sin(a) * 0.7 - 0.1, life: 20, color: PALETTE.runeGlow });
      }
    }
    if (got.finished) finish();
  }

  trackDistrict(state, LEVEL.districtAt(body.x + PLAYER.w / 2), lang);
}

// Through a door: walk in, fade out, then open the place in this tab.
function goThrough() {
  const d = state.door!;
  if (!stepThrough(state, body)) return;
  if (d.id === "maze") {
    // The mound is a scene in this page: the address changes, and Back comes out again.
    canGoBack = true;
    location.hash = MAZE_HASH;
    syncScene();
  } else {
    rememberDoor(LAST_DOOR, d.id);
    if (d.href) location.assign(d.href);
  }
}

function stepOnce() {
  stepStart(state, body, before);
  stepArrival();
  input.pollPad();
  tick(run);
  if (state.mode === "play") play();
  else if (state.mode === "enter") goThrough();
  else if (!loading && ++state.modeSteps > 300) resetScene(); // the place never opened
  if (state.feather && state.steps - state.feather.since > FEATHER_SHOWN) state.feather = null;
  if (state.mode === "play" && state.fade > 0) state.fade = Math.max(0, state.fade - 1 / 16); // coming back from the mound
  for (const s of sheep) stepSheep(s);
  stepEnd(state, doors, input, skies);
}

/** The camera follows the player smoothly, at the same pace on every screen, up the cliff as well. */
function camera(elapsedMs: number, snap: boolean) {
  // One tile of ground below the street, as on the front page. The fixed header bar covers the top
  // of the screen, so the camera may rise above the top of the world by the bar's height (it is
  // only sky up there), and the tower and its rune show below it.
  const bar = (header.getBoundingClientRect().height * view.dpr) / view.k;
  const cx = shown.x + PLAYER.w / 2;
  const onPlateau = cx >= 118 * TILE && cx <= 131 * TILE && shown.y + PLAYER.h <= 10 * TILE + 1;
  const focus = { x: cx, y: shown.y + PLAYER.h / 2, facing: body.facing, lookUp: onPlateau ? 24 : 0 }; // a hint of the tower's top and its rune
  aim(follow({ x: view.camXf, y: view.camYf }, focus, { width: WORLD_W, bottom: GROUND_Y + TILE, top: bar }, view, elapsedMs, snap));
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

const pass = (onto: CanvasRenderingContext2D, draw: () => void, haze = 0) => kit.pass(onto, draw, skies.sky.phase, haze);
const follows = pageFollows(enterButton, links, help);
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
      for (const dx of [-3, 3]) state.sparks.push({ x: body.x + PLAYER.w / 2 + dx, y: body.y + 2, vx: dx * 0.1, vy: -0.25, life: 18, color: DUST });
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
  const sky = skies.sky;
  beginLayers(kit, sky, state.steps, HORIZON_Y);
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
  drawSparks(state.sparks);
  if (state.feather) {
    const p = Math.min(1, (state.steps - state.feather.since) / FEATHER_FALL);
    if (p < 1) {
      // The feather floats down, swaying, and comes to rest on his shoulder.
      const sway = view.reduced ? 0 : Math.round(Math.sin((state.steps - state.feather.since) * 0.11) * 5 * (1 - p));
      drawFeather(Math.round(shown.x + PLAYER.w / 2 - FEATHER_W / 2 + sway), Math.round(shown.y - 60 * (1 - p) + 2 - FEATHER_H / 2 + 6 * p), FEATHER.vane, FEATHER.sheen, FEATHER.shine);
    }
  }

  const door = state.mode === "play" ? doorAt(body, doors) : null;

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

  drawOverlay({
    ...sceneOverlay(state, shown, sky, look()),
    world: WORLD,
    boards,
    hint: door && !touch && !speaking && !frozen() ? { x: shown.x + PLAYER.w / 2, y: shown.y, text: `↑  ${t.goIn}` } : null,
    bubble: door && !speaking ? null : bubble,
    marker: state.goal && !state.goal.door ? { x: state.goal.x, y: surfaceBelow(state.goal.x, state.goal.y) ?? GROUND_Y } : null
  });
  // The pad's enter button, the header link of the door you are standing at, and the help line.
  follows(door, state.moved);
  hud();
}

// The maze, while he is in the mound; the fjord otherwise.
const loop = createLoop(
  () => {
    if (scene === "maze" && maze) {
      input.pollPad(0.35);
      maze.step();
      input.endStep();
    } else stepOnce();
  },
  (a, elapsed) => {
    if (scene === "maze" && maze) {
      maze.render(a, elapsed);
      showMazeHud();
      return;
    }
    blend(shown, body, before, a);
    camera(elapsed, false);
    render();
  }
);

wirePad(pad, input, touch, help);
// Pointing at a plain link lights up its door in the game.
wireLinks(links, doors, state);

// Clicking or tapping sends the player there: into a door, or just along the ground.
wirePointer(stage, doors, state, {
  active: () => state.mode === "play" && scene === "fjord",
  walk: (at, door) => {
    if (frozen()) return;
    state.goal = walkTo(at, door, WORLD_W, state.steps);
    state.moved = true;
    begin(run);
  }
});

restartButton.addEventListener("click", () => {
  restart();
  restartButton.blur(); // give the keyboard back to the game
});
$<HTMLElement>("finish-again").addEventListener("click", restart);

// T steps through every sky and back to the real one; R starts the run again (M, the sound, is wired by the kit).
wireSkyKey(skies, state, t.skies, () => scene === "fjord");
onKey("KeyR", () => scene === "fjord" && restart());

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
dropParam(params, "from");

// ?x=<art px> drops him at that x, on the highest thing there, so a reviewer can start anywhere.
const startX = Number(params.get("x"));
const startY = Number.isFinite(startX) ? surfaceBelow(startX, 0) : null;
if (params.has("x") && startY !== null) place(startX, startY);

/** One frame with nothing blended and the camera settled on him: what a stepped page shows. */
function still() {
  if (scene !== "fjord") return;
  Object.assign(shown, body);
  camera(0, true);
  render();
}

Object.assign(shown, body);
hud();
launch({ stage, layout, still, loop, harness, input, step: stepOnce });

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
      frame: loop.frame,
      still,
      doors,
      runes,
      get maze() {
        return maze;
      }
    }
  });
