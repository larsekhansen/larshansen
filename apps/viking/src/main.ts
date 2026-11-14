import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { aim, follow } from "@larshansen/pixelkit/camera";
import { carrierDrawn, drawCarrier, rideShown } from "@larshansen/pixelkit/carrier";
import { drawCheckpoint } from "@larshansen/pixelkit/checkpoint";
import { darkRow, darknessAt, drawDark, nightCutsOf, type Light, type Ring } from "@larshansen/pixelkit/dark";
import { wireMute } from "@larshansen/pixelkit/chrome";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { buildDoors, doorAt, readAppLinks, type Door, type DoorSpot } from "@larshansen/pixelkit/doors";
import { readHarness } from "@larshansen/pixelkit/harness";
import { browserLang, soundWords } from "@larshansen/pixelkit/i18n";
import { createInput } from "@larshansen/pixelkit/input";
import { drawCannon, drawDrum } from "@larshansen/pixelkit/launcher";
import { R, S, TINT, ctx, lights, mix, target, view } from "@larshansen/pixelkit/paint";
import { COIN, DUST, FEATHER, FOOD, INK, METAL, PAINT, PALETTE, SHIMMER, SWEATER, WHITE } from "@larshansen/pixelkit/palette";
import type { Look } from "@larshansen/pixelkit/person";
import { placeBody, type Body, type Intent } from "@larshansen/pixelkit/physics";
import { drawBoards } from "@larshansen/pixelkit/props";
import {
  afterStep,
  arrived,
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
  startThrough,
  stepEnd,
  stepStart,
  stepThrough,
  wirePad,
  wirePointer,
  wireSkyKey
} from "@larshansen/pixelkit/scene";
import { createSfx } from "@larshansen/pixelkit/sfx";
import { drawSparks, fireworks } from "@larshansen/pixelkit/sparks";
import { drawTimed } from "@larshansen/pixelkit/timed";
import { boardWidth, doorBoard, drawOverlay, sx, sy, textCtx, unit, type Board } from "@larshansen/pixelkit/text";
import { footOf } from "@larshansen/pixelkit/tilemap";
import { walkTo } from "@larshansen/pixelkit/walkto";
import type { Maze } from "@larshansen/maze/scene";
import { FEATHER_H, FEATHER_W, drawFeather } from "@larshansen/maze/feather";
import type { Move } from "./game/bot";
import { strings } from "./game/i18n";
import { carefulStep } from "./game/careful";
import { HEARTS, LIVES, againAtBoss, benchAt, blinking, cannonArc, elapsedMs, formatTime, leftToRight, newPlay, runeFree, stepPlay, type Events, type Play, type PlayIntent } from "./game/play";
import { PROGRESS_KEY, allRunes, clearLevel, findBracteate, fresh, furthestOpen, hasPole, hasProgress, isOpen, readProgress, writeProgress, type Progress } from "./game/progress";
import { RUNE_CHARS, RUNE_STROKES, runeCells, type RuneChar } from "./game/runes";
import { BUILT, LINE, ORDER, isBuilt, loadLevel, loadedLevel } from "./levels/index";
import { FENCE_COL, kartDef } from "./levels/kart";
import { MARKS, type LevelDef, type View } from "./levels/types";
import { drawBracteate, drawBracteateOutline, drawRune, drawSheep } from "./render/actors";
import { drawBench, drawCheese, drawEnemy, drawShot, drawSkilling, enemyEyes } from "./render/pickups";
import { drawTiles, drawWater } from "./render/tiles";

// Vikingfjorden: a T-bane line through Oslo with a level at each stop. The page shows one scene at
// a time, the line map (#kart) or a level (#langkaia ...), and the maze in the burial mound
// (#jernhaugen) as before. The rules of a level are in game/play.ts, the levels in levels/.

const $ = byId;
// Four depths: hills, the far water, a near layer, and the ground he walks on. On an upright phone
// the view stays at least 240 art pixels wide, wider than a thrower's reach either side of him, so
// what comes at him is seen in time (ADR 0019); there is more sky over it.
const { stage, pad, help, announce, enterButton, kit } = openPage([0.12, 0.2, 0.4, 1], { minWidth: 240 });
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

const params = new URLSearchParams(location.search);
const debug = params.has("debug");
/** `?debug`'s own code (errors on the help line, pretended progress, `window.__game`), fetched only under `?debug`. */
const debugging = debug ? import("./debug") : null;
void debugging?.then((d) => d.showErrors(help));
// A stepped page is photographed once its files are in; the level it names is fetched alongside the
// debug code, not after it, so both are here in one round.
if (debug) {
  const named = params.get("level") ?? location.hash.slice(1);
  if (named) void loadLevel(named).catch(() => undefined);
}
/** `?debug&steps=N`: stepped at load and drawn once, with the clock frozen (see the kit's harness). */
const harness = readHarness(params);
const now = () => harness?.now ?? new Date();

/** Progress pretended under `?debug&cleared=...` (set at start, once the debug code is here): never stored. */
let pretend: Progress | null = null;
let progress: Progress = readProgress(store.get(PROGRESS_KEY));
function saveProgress(p: Progress) {
  progress = p;
  if (!pretend) store.set(PROGRESS_KEY, writeProgress(p));
}

const links = readAppLinks();
const input = createInput();
const sfx = createSfx();
wireMute($<HTMLButtonElement>("mute"), sfx, soundWords(lang));
followReducedMotion();
// `?debug&reduced`: reduced motion, for looking at it in a browser that cannot be asked for it.
if (debug && params.has("reduced")) view.reduced = true;
/** A level's file, fetched; `?debug&fetch=hang` (or `fail`) holds it back for ever (or fails it), to look at the board and the card. */
const fetchLevel = (id: string) => {
  const mode = debug ? params.get("fetch") : null;
  if (mode === "hang") return new Promise<never>(() => undefined);
  if (mode === "fail") return Promise.reject(new Error("held back by ?debug&fetch=fail"));
  return loadLevel(id);
};
const touch = isTouch();
/** The double jump is the raven's feather, from the maze; `?feather` gives it for checking. Read again on coming out of the mound. */
const abilities = { doubleJump: false, gold: false, pole: false };
function readFeather() {
  abilities.doubleJump = store.get("viking.feather") === "1" || params.has("feather") || abilities.doubleJump;
  abilities.gold = store.get("viking.featherGold") === "1" || abilities.gold;
  abilities.pole = hasPole(progress) || params.has("pole");
}
readFeather();
/** The gold helmet: all ten runes, now or in the old game (`viking.crowned`, kept by those who earned it). */
const CROWNED = "viking.crowned";
const crowned = () => store.get(CROWNED) === "1" || allRunes(progress, ORDER);
/**
 * Lives and the purse of skilling go with him from level to level for this visit; a new visit starts
 * with three lives. What a level has given already in this visit is remembered, so restarting it is
 * no way to farm lives: its brown cheese once, each of its skilling (and each enemy beaten) once.
 */
const session = { lives: debug && params.has("lives") ? Math.max(1, Number(params.get("lives")) || LIVES) : LIVES, purse: 0, cheese: new Set<string>(), paid: new Map<string, number[]>() };

// ---------------------------------------------------------------------------------------------
// The scene: the line map or a level, its rules, doors and boards.

interface Scene {
  def: LevelDef;
  play: Play;
  doors: Door[];
  boards: Board[];
  signs: { x: number; bottom: number; i: number }[];
  map: boolean;
  skies: ReturnType<typeof skyControl>;
}

const LAST_DOOR = "lh:lastVikingDoor";
const state = { ...sceneState<Door>({ name: "", landmark: null, from: 0 }, lang), ...extraState() };
function extraState() {
  return {
    nearSign: null as string | null,
    bubble: null as { text: string; until: number; door: Door } | null,
    /** The moment the maze's feather floats down onto him. */
    feather: null as { since: number; gold: boolean } | null,
    /** Stepping out of a door with the helmet off (`?from=oslo`): it drops onto him, the cape unrolls. */
    arrive: null as { t: number; off: number | null; door: Door | null } | null,
    /** The rune flying from where he touched it to its slot in the header. */
    flight: null as { from: { x: number; y: number }; since: number } | null,
    finished: false,
    /** Steps the dotted arc has been shown while he sits in a cannon. */
    lastEvents: null as Events | null,
    /** Steps the world holds still after a stomp or a hit, and the little shake of the view. */
    freeze: 0,
    nudge: { x: 0, y: 0, until: 0 },
    /** The card shown: a level cleared, the game over, or a level's file that would not come. */
    card: null as "clear" | "over" | "failed" | null,
    /** What a boss says, shown over it in a bubble for a while: the troll's and the plough's lines, and the hint after a round with no hit. */
    bossLine: null as { lines: string[]; until: number } | null
  };
}
const before = { x: 0, y: 0 };
let shown!: Body;
let scene!: Scene;

const ARRIVE_STEPS = 70;
const frozen = () => !!state.arrive && state.arrive.t < ARRIVE_STEPS;
const STILL = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const FLIGHT_STEPS = 50;
const FEATHER_FALL = 100;
const FEATHER_SHOWN = 340;

function doorSpots(def: LevelDef, play: Play): DoorSpot[] {
  return def.doors.flatMap((d) => {
    const tile = play.map.find(d.tile)[0];
    return tile ? [{ id: d.id, kind: d.id, sign: d.sign, href: d.href || undefined, x: tile.c * TILE, bottom: (tile.r + 1) * TILE }] : [];
  });
}

/** Boards: over each door, on each sign post; on the map, under each station, with its best time. */
function layoutBoards(s: Scene): Board[] {
  const boards: Board[] = [];
  for (const d of s.doors) {
    if (s.map && ORDER.includes(d.id)) {
      const i = ORDER.indexOf(d.id);
      const best = progress.best[d.id];
      const text = best !== undefined ? `${d.sign} ${formatTime(best)}` : d.sign;
      boards.push({ text, cx: d.x + d.w / 2, y: d.bottom + 10 + (i % 2) * 0, w: boardWidth(text) });
    } else boards.push(doorBoard(d, 13));
  }
  s.signs.forEach((sg) => {
    const label = s.def.signs[sg.i]?.label[lang] ?? "";
    boards.push({ text: label, cx: sg.x, y: sg.bottom - 30, w: boardWidth(label), post: sg.bottom });
  });
  if (s.map && FENCE_COL >= 0) {
    const text = t.building;
    boards.push({ text, cx: FENCE_COL * TILE + 8, y: 6 * TILE, w: boardWidth(text) });
  }
  return boards;
}

/** Puts him standing with his feet at (x, bottom) in this scene. */
function place(x: number, bottom: number, announceIt = true) {
  placeBody(scene.play.body, x, bottom);
  scene.play.lastGround = { x, bottom };
  arrived(state, scene.play.body, before, state.district, lang, announceIt);
  Object.assign(shown, scene.play.body);
}

const standAt = (d: Door) => place(d.x + d.w / 2, d.bottom);

/** Opens the line map or a level. `at`: a door to stand at on arrival (on the map, a station or the mound). */
function openScene(id: string, at?: string) {
  const def = id === "kart" ? kartDef(progress) : loadedLevel(id) ?? kartDef(progress);
  readFeather();
  // Past Holmenkollen he has the ski pole whatever the progress says: the levels there are only open to those who cleared it.
  const pole = abilities.pole || ORDER.indexOf(def.id) > ORDER.indexOf("holmenkollen");
  // After a Game over (lives at nought) any way back into a level starts with three lives: the card's
  // buttons, R, the header's restart, Back, a header link.
  if (session.lives <= 0) session.lives = LIVES;
  const play = newPlay(def, { feather: abilities.doubleJump, pole, lives: session.lives, purse: session.purse, cheeseTaken: session.cheese.has(def.id), paid: session.paid.get(def.id) });
  // `?debug&hearts=1&lives=1`: start a level with fewer, to look at a hit, a lost life or the game over.
  if (debug && params.has("hearts")) play.hearts = Math.max(1, Math.min(HEARTS, Number(params.get("hearts")) || HEARTS));
  const doors = buildDoors(doorSpots(def, play), links);
  const signs = leftToRight(play.map.find(MARKS.sign)).map((tile, i) => ({ ...footOf(tile), i }));
  const skies = skyControl(params.get("sky") ?? def.sky, now);
  scene = { def, play, doors, boards: [], signs, map: def.id === "kart", skies };
  Object.assign(state, sceneState<Door>({ name: def.name, landmark: def.landmark, from: 0 }, lang), extraState());
  if (scene.map) state.banner = { title: def.name, sub: t.lineSub, since: 0 };
  shown = { ...play.body };
  before.x = play.body.x;
  before.y = play.body.y;
  const door = at ? doors.find((d) => d.id === at) : undefined;
  if (door) standAt(door);
  document.body.classList.toggle("on-map", scene.map);
  finishEl.hidden = true;
  dashButton.hidden = !pole || scene.map;
  help.textContent = scene.map ? t.help : t.helpLevel(pole);
  layout();
  hud();
  // On the map, the open levels' code is fetched while he walks, so going in is quick.
  if (scene.map) for (const [i, l] of LINE.entries()) if (l.built && isOpen(progress, ORDER, i)) void loadLevel(l.id).catch(() => undefined);
}

// ---------------------------------------------------------------------------------------------
// Where he is: the address says which scene, so Back and Forward move between them.

const ROUTES = ["kart", ...BUILT.map((l) => l.id)];
const MAZE_HASH = "#jernhaugen";
/** The station or stop to stand at the next time the map opens. */
let arriveAt: string | null = null;
let mode: "scene" | "maze" = "scene";
let maze: Maze | null = null;
let loading = false;
/** A level whose file is being fetched: the scene holds dark under a board until it is here. */
let fetching: string | null = null;
const loadingEl = $<HTMLElement>("loading");
/** While a level's file is on its way: a board with its name; null takes it down. */
function showFetching(id: string | null) {
  fetching = id;
  const name = id ? LINE.find((l) => l.id === id)?.name ?? id : "";
  loadingEl.hidden = !id;
  if (id) {
    loadingEl.textContent = t.loading(name);
    say(t.loading(name));
  }
}
/** True when going back in history leaves the mound: false when the page was opened inside it. */
let canGoBack = false;

/** A level may be played once the one before it is cleared (and any, for checking under ?debug). */
const levelOpen = (id: string) => debug || isOpen(progress, ORDER, ORDER.indexOf(id));

/** The scene for the address, and the station to stand at on the map. */
function sync() {
  const id = location.hash.slice(1);
  if (`#${id}` === MAZE_HASH) {
    if (mode === "scene" && !loading) void enterMaze();
    return;
  }
  if (mode === "maze" || loading) {
    if (mode === "maze") leaveMazeNow();
    else loading = false;
  }
  const want = ROUTES.includes(id) && (id === "kart" || levelOpen(id)) ? id : "kart";
  if (fetching && fetching !== want) showFetching(null);
  if (scene && scene.def.id === want && !arriveAt) return;
  if (want !== "kart" && !loadedLevel(want)) {
    // The level's code comes first: the scene goes dark under a board while it does, and opens when
    // it is here, unless he has gone somewhere else meanwhile. Failing, a card says so, with a retry.
    if (scene) {
      state.mode = "away";
      state.modeSteps = 0;
      state.fade = 1;
    }
    showFetching(want);
    fetchLevel(want).then(
      () => {
        if (fetching !== want) return;
        showFetching(null);
        if (location.hash === `#${want}`) sync();
      },
      () => {
        if (fetching !== want) return;
        showFetching(null);
        showLoadFailed(want);
      }
    );
    return;
  }
  const at = arriveAt ?? undefined;
  arriveAt = null;
  openScene(want, want === "kart" ? at : undefined);
  if (`#${want}` !== location.hash) history.replaceState(null, "", location.pathname + location.search + `#${want}`);
}
window.addEventListener("hashchange", () => {
  if (location.hash === MAZE_HASH && mode === "scene" && !loading) canGoBack = true;
  sync();
});

/** Goes to a scene through the address, so Back returns. */
function go(id: string, at?: string) {
  arriveAt = at ?? null;
  if (location.hash === `#${id}`) sync();
  else location.hash = `#${id}`;
}

// ---------------------------------------------------------------------------------------------
// The second scene: Jernhaugen, the maze in the burial mound, as before. Its code loads the first
// time he goes in.

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
/** The feather the maze reported, for the moment at the mound's stop once the map is back. */
let featherPending: "plain" | "gold" | null = null;
/** The level he went into the mound from (Nordmarka's door to Jernhaugen), to come back out into, as he left it. */
let moundFrom: Scene | null = null;

function showMazeHud() {
  if (!maze || !mazeText) return;
  const h = maze.hud();
  const next = { name: h.name, level: `${h.level} / ${h.of}`, clock: mazeText.formatTime(h.ms), best: h.best === null ? "" : mazeText.best(mazeText.formatTime(h.best)), deaths: mazeText.deaths(h.deaths) };
  for (const key of Object.keys(next) as (keyof typeof next)[]) {
    if (mazeShown[key] === next[key]) continue;
    mazeShown[key] = next[key];
    mazeUi[key].textContent = next[key];
  }
}

async function enterMaze() {
  if (mode === "maze" || loading) return;
  loading = true;
  // The scene goes dark and waits, however long the maze takes to arrive.
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
    const level = Number(params.get("level"));
    maze = mod.createMaze(
      {
        stage: kit,
        input,
        sfx,
        lang,
        el: stage,
        say,
        topInset: () => (header.getBoundingClientRect().height * view.dpr) / view.k,
        // Only a feather newly won (or newly gold) gets the moment; a level cleared again does not.
        onLeave: (r) => leaveMaze(r.feather ?? null)
      },
      { level: Number.isFinite(level) && level > 0 ? level : undefined }
    );
    mode = "maze";
    loading = false;
    document.body.classList.add("in-maze");
    document.body.classList.remove("touch", "on-map");
    pad.hidden = true;
    fjordHelp.text = help.textContent ?? "";
    fjordHelp.hidden = help.hidden;
    help.textContent = mt.help;
    help.hidden = false;
    stage.style.cursor = "";
    mazeShown.name = mazeShown.level = mazeShown.clock = mazeShown.best = mazeShown.deaths = "";
    showMazeHud();
    layout();
    // A stepped page has no frames to come: the mound is drawn once as it opens.
    if (harness) maze.render(1, 0);
  } catch {
    // The maze did not load (or he left first): back to the map, standing at the mound, or to the level he came from.
    loading = false;
    if (moundFrom) {
      const back = moundFrom;
      moundFrom = null;
      if (location.hash === MAZE_HASH) history.replaceState(null, "", location.pathname + location.search + `#${back.def.id}`);
      resumeScene(back);
      return;
    }
    arriveAt = "maze";
    if (location.hash === MAZE_HASH) history.replaceState(null, "", location.pathname + location.search + "#kart");
    sync();
  }
}

/** Back out of the mound into the level he went in from, as he left it: the clock, the flags, the skilling all where they were. */
function resumeScene(s: Scene) {
  scene = s;
  s.play.feather = abilities.doubleJump;
  s.play.pole = s.play.pole || abilities.pole;
  Object.assign(state, sceneState<Door>({ name: s.def.name, landmark: s.def.landmark, from: 0 }, lang), extraState());
  shown = { ...s.play.body };
  const door = s.doors.find((d) => d.id === "maze");
  if (door) {
    door.open = false;
    standAt(door);
  }
  before.x = s.play.body.x;
  before.y = s.play.body.y;
  s.play.body.facing = 1;
  document.body.classList.remove("on-map");
  finishEl.hidden = true;
  dashButton.hidden = !s.play.pole;
  help.textContent = t.helpLevel(s.play.pole);
  layout();
  hud();
}

/** Out of the mound: the page is the map again, with him at the mound's stop. */
function leaveMazeNow() {
  maze?.destroy();
  maze = null;
  mode = "scene";
  loading = false;
  document.body.classList.remove("in-maze");
  if (touch) {
    document.body.classList.add("touch");
    pad.hidden = false;
  }
  help.textContent = fjordHelp.text || help.textContent;
  help.hidden = fjordHelp.text ? fjordHelp.hidden : help.hidden;
  readFeather();
  const back = moundFrom;
  moundFrom = null;
  if (back) resumeScene(back);
  else openScene("kart", "maze");
  reopen(state, scene.doors, input);
  if (featherPending) {
    state.feather = { since: state.steps, gold: featherPending === "gold" };
    featherPending = null;
  }
  state.fade = 1; // fades back in
}

/** Called by the maze when he walks out: with the feather it reports newly won, if any. */
function leaveMaze(feather: "plain" | "gold" | null) {
  if (feather) {
    abilities.doubleJump = true;
    if (feather === "gold") abilities.gold = true;
    featherPending = feather;
  }
  if (canGoBack && location.hash === MAZE_HASH) {
    history.back(); // the hashchange that follows takes him out
    return;
  }
  history.replaceState(null, "", location.pathname + location.search + (moundFrom ? `#${moundFrom.def.id}` : "#kart"));
  leaveMazeNow();
}

mazeUi.level.addEventListener("click", () => {
  maze?.levels.toggle();
  mazeUi.level.blur();
});
mazeUi.back.addEventListener("click", () => {
  leaveMaze(null);
  mazeUi.back.blur();
});

// ---------------------------------------------------------------------------------------------
// The header: ten rune slots, the clock, the gold, restart and mute; and the card at a level's end.

const runeSlots = [...document.querySelectorAll<HTMLElement>("#runes li")];
const runesEl = $<HTMLElement>("runes");
const clockEl = $<HTMLElement>("clock");
const bestEl = $<HTMLElement>("best");
const goldEl = $<HTMLElement>("goldcount");
const goldN = $<HTMLElement>("goldn");
const heartsEl = $<HTMLElement>("hearts");
const livesEl = $<HTMLElement>("lives");
const coinsEl = $<HTMLElement>("coins");
const coinN = $<HTMLElement>("coinn");
const dashButton = pad.querySelector<HTMLButtonElement>('[data-action="dash"]')!;
dashButton.textContent = t.dash;
dashButton.setAttribute("aria-label", t.dash);
const restartButton = $<HTMLButtonElement>("restart");
const finishEl = $<HTMLElement>("finish");

const SVG = "http://www.w3.org/2000/svg";
runeSlots.forEach((li, i) => {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "-1 -1 12 17");
  svg.setAttribute("aria-hidden", "true");
  for (const stroke of RUNE_STROKES[RUNE_CHARS[i] as RuneChar]) {
    const line = document.createElementNS(SVG, "polyline");
    line.setAttribute("points", stroke.map(([x, y]) => `${x * 10},${y * 15}`).join(" "));
    svg.appendChild(line);
  }
  li.appendChild(svg);
});
$<HTMLElement>("run").hidden = false;

/** A small picture in pixels for the header: rows of letters, a colour for each letter. */
function pixelSvg(rows: string[], colors: Record<string, string>): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${rows[0].length} ${rows.length}`);
  svg.setAttribute("aria-hidden", "true");
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const r = document.createElementNS(SVG, "rect");
      r.setAttribute("x", String(x));
      r.setAttribute("y", String(y));
      r.setAttribute("width", "1");
      r.setAttribute("height", "1");
      r.setAttribute("fill", colors[ch]);
      svg.appendChild(r);
    })
  );
  return svg;
}
// A waffle heart: crust and dough in a grid, as the waffle iron leaves it.
const WAFFLE_HEART = [".cc.cc.", "cdcdcdc", "dcdcdcd", "cdcdcdc", ".cdcdc.", "..cdc..", "...c..."];
const hearts = Array.from({ length: HEARTS }, () => heartsEl.appendChild(pixelSvg(WAFFLE_HEART, { c: FOOD.waffleCrust, d: FOOD.waffleDough })));
// The helmet over the hat, with the pompom on top: one for the lives, with the number beside it.
livesEl.appendChild(pixelSvg(["...w...", "..iii..", ".iiiii.", "iiiiiii", "rrrrrrr", ".s...s."], { w: WHITE, i: PALETTE.ironDark, r: PALETTE.iron, s: PALETTE.ironDark }));
const livesN = livesEl.appendChild(document.createElement("span"));

const shownHud = { clock: "", lit: "", gold: -1, best: "", hearts: -1, lives: -1, coins: "" };
/** The rune slots light for the levels cleared; the one a rune is flying to waits. */
function hud() {
  const lit = LINE.map((l) => (progress.cleared.includes(l.id) && !(state.flight && scene.def.id === l.id) ? "1" : "0")).join("");
  if (lit !== shownHud.lit) {
    shownHud.lit = lit;
    LINE.forEach((l, i) => runeSlots[l.rune]?.classList.toggle("lit", lit[i] === "1"));
    const n = [...lit].filter((c) => c === "1").length;
    runesEl.setAttribute("aria-label", n === 10 ? t.runesAll : t.runes(n));
    runesEl.classList.toggle("all", n === 10);
  }
  if (!scene.map) {
    const clock = formatTime(elapsedMs(scene.play));
    if (clock !== shownHud.clock) clockEl.textContent = shownHud.clock = clock;
    const best = progress.best[scene.def.id];
    const bestText = best !== undefined ? `${t.best} ${formatTime(best)}` : "";
    if (bestText !== shownHud.best) bestEl.textContent = shownHud.best = bestText;
  }
  const p = scene.play;
  const heartsShown = scene.map ? HEARTS : p.hearts;
  if (heartsShown !== shownHud.hearts) {
    shownHud.hearts = heartsShown;
    hearts.forEach((h, i) => h.classList.toggle("gone", i >= heartsShown));
    heartsEl.setAttribute("aria-label", t.hearts(heartsShown));
  }
  if (p.lives !== shownHud.lives) {
    shownHud.lives = p.lives;
    livesN.textContent = String(p.lives);
    livesEl.setAttribute("aria-label", t.lives(p.lives));
  }
  const total = p.skilling.length;
  const coins = scene.map || total === 0 ? "" : `${p.found}/${total}`;
  if (coins !== shownHud.coins) {
    shownHud.coins = coins;
    coinsEl.hidden = coins === "";
    coinN.textContent = coins;
    coinsEl.setAttribute("aria-label", t.skilling(p.found, total));
  }
  const gold = progress.bracteates.length;
  if (gold !== shownHud.gold) {
    shownHud.gold = gold;
    goldEl.hidden = gold === 0;
    goldN.textContent = String(gold);
    goldEl.setAttribute("aria-label", t.gold(gold));
  }
}

restartButton.setAttribute("aria-label", t.restart);
restartButton.title = `${t.restart} (R)`;
$<HTMLElement>("finish-on").textContent = t.finishOn;
$<HTMLElement>("finish-again").textContent = t.finishAgain;

/** The level again from its start, the clock at zero. Lives stay as they are. On the card after a Game over in a boss's fight: on again from the bench before it. */
function restartLevel() {
  if (scene.map) return;
  if (state.card === "over" && scene.play.overAtBoss) return tryAgainAtBoss();
  openScene(scene.def.id);
}

/** After a Game over in a boss's fight: from the bench before it, three lives, the boss asleep and whole again (ADR 0017). */
function tryAgainAtBoss() {
  const p = scene.play;
  againAtBoss(p);
  session.lives = p.lives;
  state.finished = false;
  state.card = null;
  finishEl.hidden = true;
  Object.assign(shown, p.body);
  before.x = p.body.x;
  before.y = p.body.y;
  layout();
  hud();
}

const finishOn = $<HTMLButtonElement>("finish-on");
const finishAgain = $<HTMLButtonElement>("finish-again");
const finishCoins = $<HTMLElement>("finish-coins");
const finishClean = $<HTMLElement>("finish-clean");

/** The rune is in its slot: the card with the time, the best, the skilling, the bracteate, and a clean run. */
function showCard(r: CardResult) {
  state.finished = true;
  state.card = "clear";
  $<HTMLElement>("finish-title").textContent = `${RUNE_CHARS[scene.def.rune]} · ${scene.def.name}`;
  $<HTMLElement>("finish-line").textContent = `${formatTime(r.ms)} · ${r.newBest ? t.finishNew : t.finishBest(formatTime(progress.best[scene.def.id] ?? r.ms))}`;
  const gold = $<HTMLElement>("finish-gold");
  gold.hidden = false;
  gold.textContent = r.gold ? t.goldFound : t.goldMissed;
  finishCoins.hidden = r.total === 0;
  finishCoins.textContent = t.finishSkilling(r.found, r.total);
  finishClean.hidden = !r.clean && !r.pole;
  finishClean.textContent = [r.clean ? t.finishClean : "", r.pole ? (touch ? t.finishPoleTouch : t.finishPole) : ""].filter(Boolean).join(" ");
  // The last line counts honestly: the runes he has, on the last level built; and with the tenth, the name, plainly, in both languages.
  const more = $<HTMLElement>("finish-more");
  const runes = LINE.filter((l) => progress.cleared.includes(l.id)).length;
  more.hidden = !r.home && scene.def.id !== BUILT[BUILT.length - 1].id;
  more.classList.toggle("home", r.home);
  more.textContent = "";
  if (r.home) {
    const other = strings(lang === "nb" ? "en" : "nb");
    for (const line of [t.homeLine, other.homeLine]) more.appendChild(document.createElement("span")).textContent = line;
  } else more.textContent = BUILT.length < LINE.length ? t.moreToBuild(runes) : t.runesLeft(runes);
  finishOn.textContent = t.finishOn;
  finishAgain.textContent = t.finishAgain;
  finishEl.hidden = false;
  say(`${scene.def.name}. ${formatTime(r.ms)}. ${r.newBest ? t.finishNew : ""}`);
  sfx.play("clear");
  finishOn.focus({ preventScroll: true });
}

/** No lives left: a plain card, and the level starts over with three lives. */
function showOver() {
  state.finished = true;
  state.card = "over";
  const line = scene.play.overAtBoss ? t.overLineBoss : t.overLine;
  $<HTMLElement>("finish-title").textContent = t.overTitle;
  $<HTMLElement>("finish-line").textContent = line;
  $<HTMLElement>("finish-gold").hidden = true;
  finishCoins.hidden = true;
  finishClean.hidden = true;
  $<HTMLElement>("finish-more").hidden = true;
  finishOn.textContent = t.overAgain;
  finishAgain.textContent = t.overMap;
  finishEl.hidden = false;
  say(`${t.overTitle}. ${line}`);
  sfx.play("over");
  finishOn.focus({ preventScroll: true });
}

/** A level's file did not come: a plain card, "Try again" (the page again, at that level) and "To the map". */
let failedLevel: string | null = null;
function showLoadFailed(id: string) {
  failedLevel = id;
  const name = LINE.find((l) => l.id === id)?.name ?? id;
  state.finished = true;
  state.card = "failed";
  $<HTMLElement>("finish-title").textContent = t.loadFailedTitle;
  $<HTMLElement>("finish-line").textContent = t.loadFailedLine(name);
  for (const el of ["finish-gold", "finish-coins", "finish-clean", "finish-more"]) $<HTMLElement>(el).hidden = true;
  finishOn.textContent = t.overAgain;
  finishAgain.textContent = t.overMap;
  finishEl.hidden = false;
  say(`${t.loadFailedTitle}. ${t.loadFailedLine(name)}`);
  finishOn.focus({ preventScroll: true });
}

interface CardResult {
  ms: number;
  newBest: boolean;
  gold: boolean;
  found: number;
  total: number;
  clean: boolean;
  pole: boolean;
  /** This rune was the tenth: the card says so, once. */
  home: boolean;
}
let cardResult: CardResult | null = null;

finishOn.addEventListener("click", () => {
  // A level's file that would not come: the whole page again, at that level (a failed import is not retried in place).
  if (state.card === "failed") {
    history.replaceState(null, "", location.pathname + location.search + `#${failedLevel ?? "kart"}`);
    return location.reload();
  }
  if (state.card === "over") {
    session.lives = LIVES;
    return restartLevel();
  }
  const next = ORDER[ORDER.indexOf(scene.def.id) + 1];
  go("kart", next && isBuilt(LINE[ORDER.indexOf(next)]) ? next : scene.def.id);
});
finishAgain.addEventListener("click", () => {
  if (state.card === "failed") {
    finishEl.hidden = true;
    state.finished = false;
    state.card = null;
    return go("kart", failedLevel ?? undefined);
  }
  if (state.card === "over") {
    session.lives = LIVES;
    return go("kart", scene.def.id);
  }
  restartLevel();
});
restartButton.addEventListener("click", () => {
  restartLevel();
  restartButton.blur(); // give the keyboard back to the game
});

// ---------------------------------------------------------------------------------------------
// Rules on the page: doors, signs, sounds and sparks around the level's own rules.

function say(text: string) {
  announce.textContent = text;
}

function tryEnter(d: Door) {
  const i = ORDER.indexOf(d.id);
  if (scene.map && i >= 0) {
    // A station: open, not open yet, or not built.
    const notBuilt = !isBuilt(LINE[i]);
    if (notBuilt || !levelOpen(d.id)) {
      d.shake = view.reduced ? 0 : 14;
      const text = notBuilt ? t.notBuilt : t.closed(LINE[i - 1].name);
      state.bubble = { text, until: state.steps + 180, door: d };
      say(text);
      return;
    }
  }
  // A door to something still to come (Quintle's kiosk): the front page's padlock and its words.
  if (!scene.map && d.soon) {
    d.shake = view.reduced ? 0 : 14;
    const text = d.id === "quintle" ? t.quintleSoon : t.locked;
    state.bubble = { text, until: state.steps + 180, door: d };
    say(text);
    return;
  }
  startThrough(state, scene.play.body, d);
  sfx.play("door");
  say(t.opening(d.sign));
}

function intoMaze() {
  canGoBack = true;
  location.hash = MAZE_HASH;
}

/** Through a door: to another scene, into the mound, or out of the page. */
function goThrough() {
  const d = state.door!;
  if (!stepThrough(state, scene.play.body)) return;
  const href = d.href ?? "";
  if (d.id === "maze") {
    moundFrom = scene.map ? null : scene;
    intoMaze();
  }
  else if (href.startsWith("#")) go(href.slice(1), scene.map ? undefined : scene.def.id);
  else if (href) {
    rememberDoor(LAST_DOOR, d.id);
    location.assign(href);
  }
}

function sparksAt(x: number, y: number, n: number, color: string, speed = 0.7) {
  if (view.reduced) return;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    state.sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 0.1, life: 20, color });
  }
}

/** How long a boss's line, and a hint after a round with no hit, stay over it. */
const BOSS_LINE_STEPS = 180;
const BOSS_HINT_STEPS = 300;

/** A boss says something: over it in a bubble, and to a screen reader. */
function bossSays(lines: string[], steps = BOSS_LINE_STEPS) {
  state.bossLine = { lines, until: state.steps + steps };
  say(lines.join(" "));
}

/**
 * Where a boss's words go: beside it, at the height of its top, on the side away from him, so the
 * bubble is never over him, nor over its head or its cab, where he has to look to beat it.
 */
function bossBubbleAt(p: Play, lines: string[]): { x: number; y: number } | null {
  let top: { x: number; y: number; w: number } | null = null;
  if (p.troll && p.def.trollRules) {
    const box = p.def.trollRules.box(p.troll);
    top = { x: p.troll.x, y: box.y, w: box.w };
  } else if (p.boss) {
    const t = p.boss.rules.top(p.boss.state);
    top = { x: t.x, y: t.y, w: t.w ?? 32 };
  }
  if (!top) return null;
  const wide = Math.max(...lines.map((l) => boardWidth(l))) + 6;
  const him = shown.x + PLAYER.w / 2;
  const side = him <= top.x ? 1 : -1;
  return { x: top.x + side * (top.w / 2 + 6 + wide / 2), y: top.y + 2 };
}

/** This level's bracteate was found on an earlier visit: drawn as a pale outline, and quiet. */
const owned = (p: Play) => progress.bracteates.includes(p.def.id);

/** What the level's rules did this step, made audible and visible. */
function react(ev: Events) {
  const p = scene.play;
  const b = p.body;
  if (ev.moved) state.moved = true;
  if (ev.loaded !== null) sfx.play("door");
  if (ev.fired !== null) sfx.play("cannon");
  if (ev.flag !== null) {
    sfx.play("flag");
    say(t.flagAnnounce);
  }
  if (ev.bell !== null) sfx.play("bell", p.def.timed[ev.bell].note ?? ev.bell);
  if (ev.bleat) sfx.play("bleat");
  if (ev.drum !== null) sfx.play("stomp");
  if (ev.coin !== null) {
    sfx.play("coin", ev.coin);
    const s = p.skilling.find((k) => k.at === p.t);
    if (s) sparksAt(s.box.x + 4, s.box.y + 4, 4, COIN.shine, 0.5);
  }
  if (ev.stomp !== null) {
    sfx.play("stomp");
    jolt(0, 2);
  }
  if (ev.hurt) {
    sfx.play("hurt");
    jolt(b.facing * -2, 0);
    if (!ev.lifeLost && p.hearts > 0) say(t.hurt(p.hearts));
  }
  if (ev.lifeLost && !ev.over) say(t.lifeLost(p.lives));
  if (ev.life) {
    sfx.play("life");
    say(t.lifeWon);
    sparksAt(b.x + PLAYER.w / 2, b.y, 8, FOOD.cheeseLight, 0.7);
  }
  if (ev.bench !== null) {
    sfx.play("bench");
    say(t.benchSat);
  }
  if (ev.dash) sfx.play("dash");
  if (ev.troll === "wake") {
    sfx.play("gate");
    bossSays([t.trollWakes]);
  }
  if (ev.troll === "slam") {
    sfx.play("cannon");
    jolt(0, 3);
  }
  if (ev.troll === "hit") {
    sfx.play("stone");
    jolt(2, 0);
    bossSays([t.trollHit(p.troll?.hits ?? 0)]);
  }
  if (ev.troll === "miss" || ev.troll === "rest") bossSays(t.trollHint, BOSS_HINT_STEPS);
  if (ev.troll === "stone") {
    sfx.play("fanfare");
    bossSays([t.trollStone]);
  }
  if (ev.boss) {
    const sound: Record<string, Parameters<typeof sfx.play>[0]> = { wake: "gate", windup: "hiss", slam: "cannon", hit: "stone", line: "stomp", beaten: "fanfare" };
    if (sound[ev.boss]) sfx.play(sound[ev.boss]);
    if (ev.boss === "hit" || ev.boss === "slam") jolt(0, 3);
    const words = p.def.bossWords?.[ev.boss];
    if (words) bossSays(words[lang].split("\n"), /^miss|^rest/.test(ev.boss) ? BOSS_HINT_STEPS : BOSS_LINE_STEPS);
  }
  if (ev.zap && !view.reduced) sparksAt(b.x + PLAYER.w / 2, b.y + PLAYER.h - 2, 8, PAINT.warning, 1.1);
  if (ev.over) {
    session.lives = 0;
    showOver();
  }
  if (ev.splash) {
    sfx.play("splash");
    if (!view.reduced)
      for (let i = 0; i < 8; i++) state.sparks.push({ x: b.x + PLAYER.w / 2 + (i - 4) * 1.5, y: b.y + PLAYER.h - 1, vx: (i - 3.5) * 0.18, vy: -0.8 - Math.random() * 0.6, life: 22, color: PALETTE.foam });
  }
  if (ev.bracteate && p.bracteate && !owned(p)) {
    sfx.play("gold");
    say(t.goldAnnounce);
    saveProgress(findBracteate(progress, p.def.id));
    sparksAt(p.bracteate.x + 6, p.bracteate.y + 6, 10, METAL.goldLight, 0.9);
  }
  if (ev.rune && p.rune) {
    sfx.play("pickup", p.def.rune);
    if (p.def.flourish && !p.def.chime) sfx.play("hurra");
    say(t.runeFound(RUNE_CHARS[p.def.rune], p.def.name));
    const ms = elapsedMs(p);
    const hadPole = hasPole(progress);
    const had = allRunes(progress, ORDER);
    const r = clearLevel(progress, p.def.id, ms, p.bracteateAt !== null, { skilling: p.found, clean: !p.hurt });
    saveProgress(r.progress);
    // The tenth rune: the helmet turns gold, and stays gold.
    const home = !had && allRunes(progress, ORDER);
    if (home && !pretend) store.set(CROWNED, "1");
    if (home && !view.reduced) sparksAt(b.x + PLAYER.w / 2, b.y + 1, 12, METAL.goldLight, 0.8);
    cardResult = { ms, newBest: r.newBest, gold: p.bracteateAt !== null || progress.bracteates.includes(p.def.id), found: p.found, total: p.skilling.length, clean: !p.hurt, pole: !hadPole && hasPole(progress), home };
    state.flight = { from: { x: p.rune.x + 8, y: p.rune.y + 8 }, since: state.steps };
    sparksAt(p.rune.x + 8, p.rune.y + 8, 8, PALETTE.runeGlow);
    const bursts = p.def.fireworks;
    if (bursts && !view.reduced) fireworks(state.sparks, (k) => ({ x: bursts[k % bursts.length][0], y: bursts[k % bursts.length][1] }));
  }
}

function play() {
  const p = scene.play;
  const b = p.body;
  const door = doorAt(b, scene.doors);
  const held = frozen() || state.finished || !!state.flight || !!p.loaded;
  if (door && !held && (input.pressed("up") || input.pressed("enter"))) return tryEnter(door);
  // At a bench, up sits down instead of jumping.
  const bench = !held && !scene.map && !p.sitting ? benchAt(p) : null;
  // Walking to a clicked spot or door. Any input of the visitor's own takes over again.
  if (state.goal && held) state.goal = null;
  const walked = followGoal(state, b, held ? STILL : intentFrom(input, !!door || bench !== null), door);
  if (walked.enter) return tryEnter(walked.enter);
  // In a level, walking to a click never jumps, and stops at an edge or before an enemy.
  const keys = state.goal && !scene.map ? carefully(p, walked.intent) : walked.intent;
  // The scripted route (under ?debug&auto) is asked every step, held or not, as the tests ask it.
  const scripted = auto?.(p) ?? null;
  const intent: PlayIntent = (!held && scripted) || { ...keys, sit: bench !== null && (input.pressed("up") || input.pressed("enter")), dash: !held && input.pressed("dash") };
  const airJumps = b.airJumps;
  const vx = b.vx;
  const ev = stepPlay(p, intent);
  session.lives = p.lives;
  session.purse = p.purse;
  if (ev.life && p.cheese?.at === p.t) session.cheese.add(p.def.id);
  if (ev.coin !== null || ev.stomp !== null) session.paid.set(p.def.id, [...p.paid]);
  // Dust when he turns at speed, and a streak behind a dash.
  if (b.onGround && Math.abs(vx) > 1.2 && Math.sign(b.vx) !== Math.sign(vx) && !view.reduced) state.sparks.push({ x: b.x + PLAYER.w / 2, y: b.y + PLAYER.h - 1, vx: -vx * 0.2, vy: -0.3, life: 14, color: DUST });
  if (p.dash && !view.reduced)
    for (let k = 0; k < 3; k++) state.sparks.push({ x: b.x + PLAYER.w / 2 - p.dash.dir * (6 + k * 2), y: b.y + 3 + k * 4, vx: -p.dash.dir * 0.4, vy: 0, life: 12, color: k === 1 ? SWEATER : mix(SWEATER, WHITE, 0.45) });
  state.lastEvents = ev;
  if (ev.step.jumped && b.airJumps < airJumps && !view.reduced)
    for (let i = 0; i < 3; i++) state.sparks.push({ x: b.x + PLAYER.w / 2 + (i - 1) * 3, y: b.y + PLAYER.h - 2 + i, vx: (i - 1) * 0.12, vy: 0.02, life: 70 + i * 12, color: abilities.gold ? METAL.gold : FEATHER.vane });
  afterStep(state, b, intent, ev.step, sfx);
  if (!ev.bleat) hardLanding(state, b, ev.step, sfx);
  react(ev);
  // A level whose flourish is a peal of bells rings them one after another.
  const chime = p.def.chime;
  if (chime && p.runeAt !== null) {
    const age = p.t - p.runeAt;
    if (age > 0 && age % 14 === 0 && age / 14 <= chime.length) sfx.play("bell", chime[age / 14 - 1]);
  }
}

/** Walking to a clicked spot in a level: the walk's keys without its hops; at an edge or before an enemy, no keys, and the walk ends. */
function carefully(p: Play, k: Intent): Intent {
  const walk = carefulStep(p, k);
  if (walk) return walk;
  state.goal = null;
  return STILL;
}

/** A stomp or a hit: the world holds still for two steps and the view gives a little. */
function jolt(dx: number, dy: number) {
  if (view.reduced) return;
  state.freeze = 2;
  state.nudge = { x: dx, y: dy, until: state.steps + 6 };
}

function stepOnce() {
  stepStart(state, scene.play.body, before);
  stepArrival();
  input.pollPad();
  if (state.freeze > 0) state.freeze--;
  else if (state.mode === "play") play();
  else if (state.mode === "enter") goThrough();
  else if (!loading && !fetching && ++state.modeSteps > 300) reopen(state, scene.doors, input); // the place never opened
  if (state.bubble && state.steps > state.bubble.until) state.bubble = null;
  if (state.feather && state.steps - state.feather.since > FEATHER_SHOWN) state.feather = null;
  if (state.mode === "play" && state.fade > 0) state.fade = Math.max(0, state.fade - 1 / 16); // coming back from the mound
  if (state.flight && state.steps - state.flight.since === Math.max(FLIGHT_STEPS, scene.def.flourish ?? 0) && cardResult) {
    state.flight = null;
    showCard(cardResult);
  }
  stepEnd(state, scene.doors, input, scene.skies);
}

/** The moment of putting the outfit on: the helmet falls from above the view at step 30, the cape unrolls from step 45. */
function stepArrival() {
  const a = state.arrive;
  if (!a) return;
  a.t++;
  state.alpha = Math.min(1, a.t / 12);
  if (a.door) a.door.open = a.t < 16; // the door closes behind him
  const b = scene.play.body;
  if (a.t === 30) a.off = Math.max(12, Math.min(105, Math.ceil(b.y - view.camY) + 4));
  else if (a.off !== null && a.off > 0 && a.t > 30) {
    a.off = Math.max(0, a.off - 3);
    if (a.off === 0) {
      sfx.play("land");
      for (const dx of [-3, 3]) state.sparks.push({ x: b.x + PLAYER.w / 2 + dx, y: b.y + 2, vx: dx * 0.1, vy: -0.25, life: 18, color: DUST });
    }
  }
  if (a.t >= ARRIVE_STEPS) {
    state.arrive = null;
    state.alpha = 1;
  }
}

const look = (): Look => {
  const a = state.arrive;
  const base: Look = { outfit: "viking", gold: crowned(), pompom: abilities.gold ? METAL.gold : undefined };
  if (!a) return base;
  return { ...base, helmetOffset: a.off, capeRows: a.t < 45 ? 0 : Math.min(4, Math.floor((a.t - 45) / 4) + 1) };
};

// ---------------------------------------------------------------------------------------------
// The camera and drawing.

/**
 * The camera follows him, at the same pace on every screen, up and down as well; the header bar covers
 * the top, and only sky is up there. On an upright screen he stands about two thirds of the way down,
 * with ground under him (the bottom of the map goes on down), not at the very bottom under a tall sky.
 */
function camera(elapsedMs: number, snap: boolean) {
  const bar = (header.getBoundingClientRect().height * view.dpr) / view.k;
  const p = scene.play;
  const look = p.def.flourishLook && p.runeAt !== null ? Math.min(p.def.flourishLook, (p.t - p.runeAt) * 1.5) : 0;
  const focus = { x: shown.x + PLAYER.w / 2, y: shown.y + PLAYER.h / 2, facing: p.body.facing, lookUp: look };
  const floor = scene.def.floor?.(focus.x) ?? scene.play.map.height;
  const bottom = view.h > view.w ? Math.max(floor, Math.round(focus.y + view.h / 3)) : floor;
  const at = follow({ x: view.camXf - shake.x, y: view.camYf - shake.y }, focus, { width: scene.play.map.width, bottom, top: bar }, view, elapsedMs, snap);
  shake.x = state.steps < state.nudge.until ? state.nudge.x : 0;
  shake.y = state.steps < state.nudge.until ? state.nudge.y : 0;
  aim({ x: at.x + shake.x, y: at.y + shake.y });
}
const shake = { x: 0, y: 0 };

function layout() {
  kit.resize();
  maze?.resize();
  if (!scene) return;
  scene.boards = layoutBoards(scene);
  camera(0, true);
}

const pass = (onto: CanvasRenderingContext2D, draw: () => void, haze = 0) => kit.pass(onto, draw, scene.skies.sky.phase, haze);

/** The height of view the far layers are drawn for. */
const FAR_VIEW_H = 220;
/**
 * A far layer's pass. The far layers are placed for a view of the usual height, with him about in its
 * middle; on an upright screen he stands two thirds of the way down a much taller view, so a layer
 * placed by the screen (hills that sink as the view climbs) would hang high in the sky. There it is
 * drawn as for a view of the usual height round him and moved down to where he stands; what is
 * placed in the world (the far shore at the water line) stays where it is.
 */
function farPass(onto: CanvasRenderingContext2D, draw: () => void, haze: number) {
  const him = shown.y + PLAYER.h / 2 - view.camYf;
  const dy = view.h > view.w && view.h > FAR_VIEW_H && !scene.def.underground ? Math.max(0, Math.round(him - FAR_VIEW_H / 2)) : 0;
  if (!dy) return pass(onto, draw, haze);
  view.camY += dy;
  view.camYf += dy;
  pass(
    onto,
    () => {
      const g = ctx();
      g.setTransform(1, 0, 0, 1, 0, dy);
      draw();
      // The haze and the night's tint go over the whole layer; its windows come on where they were drawn.
      g.setTransform(1, 0, 0, 1, 0, 0);
      for (const l of lights) l.y += dy;
    },
    haze
  );
  view.camY -= dy;
  view.camYf -= dy;
}
const follows = pageFollows(enterButton, links, help);

/** The things of a level: moving ground, ledges on a beat, cannons and their arc, flags, sheep, gold and the rune. */
function drawThings(v: View) {
  const p = scene.play;
  const art = scene.def.art;
  p.def.carriers.forEach((d, i) => {
    const at = carrierDrawn(d, p.t, v.alpha);
    if (art.carrier) art.carrier(i, at, v);
    else drawCarrier(d, p.t, v.alpha, v.sky.snow);
  });
  p.def.timed.forEach((l, i) => (art.timed ? art.timed(i, v) : drawTimed(l, p.t, v.sky.snow)));
  p.cannons.forEach((l, i) => {
    const loadedAt = p.loaded?.i === i ? p.loaded.at : -999;
    if (art.cannon) art.cannon(i, l, loadedAt, p.firedAt[i], v);
    else drawCannon(l, p.t, loadedAt, p.firedAt[i]);
    if (p.loaded?.i === i) {
      // While he sits in the barrel: the first second of the arc, dotted.
      for (const d of cannonArc(p, i, 60, 2)) {
        R(Math.round(d.x), Math.round(d.y), 2, 2, SHIMMER);
        R(Math.round(d.x) + 1, Math.round(d.y) + 2, 2, 1, INK);
      }
    }
  });
  p.drums.forEach((l, i) => (art.drum ? art.drum(i, l, p.drummedAt[i], v) : drawDrum(l, p.t, p.drummedAt[i])));
  p.flags.forEach((f, i) => art.flag?.(i, f, p.raisedAt[i], v) || drawCheckpoint(f, p.raisedAt[i], p.t));
  p.benches.forEach((s, i) => drawBench(s.x, s.bottom, p.sitting?.i === i));
  for (const s of p.sheep) drawSheep(s);
  p.skilling.forEach((s, i) => s.at === null && drawSkilling(s.box.x + 1, s.box.y + 1, p.t, i));
  if (p.cheese && p.cheese.at === null) drawCheese(p.cheese.box.x, p.cheese.box.y - 2, p.t);
  for (const e of p.enemies) if (!art.enemy?.(e, v)) drawEnemy(e, p.t);
  for (const s of p.shots) drawShot(s, p.enemies[s.by]?.def.look);
  if (p.troll) art.troll?.(p.troll, v);
  if (p.boss) art.boss?.(p.boss.state, v);
  if (p.bracteate && p.bracteateAt === null) {
    if (owned(p)) drawBracteateOutline(p.bracteate.x, p.bracteate.y);
    else drawBracteate(p.bracteate.x, p.bracteate.y, p.t);
  }
  if (p.rune && runeFree(p)) drawRune(p.rune.x, p.rune.y, RUNE_CHARS[p.def.rune], p.runeAt === null ? "lit" : "ghost", p.t, p.def.rune);
  if (v.flourish !== null) art.flourish?.(v.flourish, v);
  if (p.pole && !p.loaded) skiPole(v);
}

/** Eye-shine: the one bright pixel that answers a light in the dark; and the moonlit rim round what can hurt him. */
const EYE_SHINE = "#fff1c2";
const RIM = "#c9d8ff";
/** A scratch canvas the size of the view, for the enemies' outlines after dark. */
const rimCanvas = document.createElement("canvas");
const rimG = rimCanvas.getContext("2d")!;

/**
 * After dusk the street layer has the night's tint over it, and a pigeon on dark planks is a dark shape
 * on dark. So what can hurt him and what he can pick up keep some light: each enemy, and what it throws,
 * gets a one-pixel pale rim round its top and sides and is a little lighter than its tinted self, with
 * eye-shine where it has eyes; the hazards get a lit edge; the skilling and the cheese shine nearly as
 * by day. In a level under the trees, the dark that comes after covers all of it but the lamp's circle.
 */
function afterDark(v: View) {
  const p = scene.play;
  const art = scene.def.art;
  const street = ctx();
  const enemies = () => {
    for (const e of p.enemies) if (e.alive && !art.enemy?.(e, v)) drawEnemy(e, p.t);
    for (const s of p.shots) drawShot(s, p.enemies[s.by]?.def.look);
  };
  if (rimCanvas.width !== view.w || rimCanvas.height !== view.h) {
    rimCanvas.width = view.w;
    rimCanvas.height = view.h;
  }
  // Their shapes, in the rim's colour, a pixel up and to each side; then they themselves over it, as tinted.
  rimG.clearRect(0, 0, view.w, view.h);
  target(rimG);
  enemies();
  rimG.globalCompositeOperation = "source-in";
  rimG.fillStyle = RIM;
  rimG.fillRect(0, 0, view.w, view.h);
  rimG.globalCompositeOperation = "source-over";
  street.globalAlpha = v.sky.phase === "night" ? 0.9 : 0.7;
  for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0]]) street.drawImage(rimCanvas, dx, dy);
  street.globalAlpha = 1;
  rimG.clearRect(0, 0, view.w, view.h);
  enemies();
  const tint = TINT[v.sky.phase];
  if (tint) {
    rimG.globalCompositeOperation = "source-atop";
    rimG.fillStyle = tint;
    rimG.fillRect(0, 0, view.w, view.h);
    rimG.globalCompositeOperation = "source-over";
  }
  street.drawImage(rimCanvas, 0, 0);
  target(street);
  street.globalAlpha = 0.25;
  enemies();
  street.globalAlpha = 0.8;
  p.skilling.forEach((s, i) => s.at === null && drawSkilling(s.box.x + 1, s.box.y + 1, p.t, i));
  if (p.cheese && p.cheese.at === null) drawCheese(p.cheese.box.x, p.cheese.box.y - 2, p.t);
  street.globalAlpha = 0.7;
  for (const h of p.def.hazards ?? []) R(h.x, h.y, h.w, 1, PAINT.warning);
  street.globalAlpha = 1;
  for (const e of p.enemies) for (const [x, y] of enemyEyes(e, p.t)) R(x, y, 1, 1, EYE_SHINE);
  // What these drew of their own lights (a brazier's glow) has had its turn: it is not drawn twice.
  lights.length = 0;
}

/** His headlamp: a small ring of light round him, and the beam ahead the way he looks. */
const AROUND: Ring[] = [
  [22, 0.5],
  [16, 0]
];
const BEAM: Ring[] = [
  [60, 0.55],
  [53, 0.28],
  [46, 0]
];

/**
 * Under the trees at night: the dark over everything the street layer shows (the far layers and the
 * sky too), with his headlamp and the level's own lights punched through it, then what shines over
 * it (eyes in the dark, a flame). The person is drawn after, on the text layer, so he always shows.
 */
function drawNight(v: View) {
  const p = scene.play;
  const art = scene.def.art;
  const dark = scene.def.dark!;
  const night = Array.from({ length: view.w }, (_, x) => Math.round(Math.max(0, Math.min(1, dark(x + view.camX, v))) * 20) / 20);
  const hx = Math.round(shown.x + PLAYER.w / 2) - view.camX;
  const hy = Math.round(shown.y + 2) - view.camY;
  const lights: Light[] = [
    { x: hx, y: hy, rings: AROUND },
    { x: hx + p.body.facing * 36, y: hy - 2, rings: BEAM }
  ];
  // The boards on posts and over doors catch the light: their words can always be read.
  for (const bd of scene.boards) lights.push({ rect: { x: Math.round(bd.cx - bd.w / 2 - 1) - view.camX, y: bd.y - 1 - view.camY, w: bd.w + 2, h: 13 }, dark: 0.25 });
  for (const l of art.lights?.(v) ?? [])
    lights.push("rect" in l ? { rect: { ...l.rect, x: l.rect.x - view.camX, y: l.rect.y - view.camY }, dark: l.dark } : { x: l.x - view.camX, y: l.y - view.camY, rings: l.rings });
  drawDark(lights, night, NIGHT);
  lampOnlyLightsTheStreet(lights.slice(0, 2), lights.slice(2), night);
  art.overDark?.(v);
}

const NIGHT = "4, 6, 18";
/** How deep into the soil under his feet the headlamp reaches: the ground's top edge, not a disc of earth. */
const LAMP_SOIL = 6;

/**
 * The headlamp lights what stands in front of the backdrop: the street layer's things, the walls
 * and the top edge of the ground. Where its disc falls on the sky or the far layers, or deeper than
 * a few pixels into the soil below his feet, the night goes back to what it would be without the
 * lamp. The street canvas is see-through where the backdrop shows, so the night is put back there
 * underneath what is drawn (destination-over), and over the soil as usual.
 */
function lampOnlyLightsTheStreet(lamp: Light[], others: Light[], night: number[]) {
  const map = scene.play.map;
  const g = ctx();
  const feet = shown.y + PLAYER.h;
  const r0 = Math.floor(feet / TILE);
  // The top of the soil in each column the lamp reaches: the first solid tile at or below his feet.
  const soil = new Map<number, number>();
  const soilTop = (x: number) => {
    let top = soil.get(x);
    if (top !== undefined) return top;
    const wx = x + view.camX;
    const c = Math.floor(wx / TILE);
    top = Infinity;
    for (let r = r0; r < map.rows; r++)
      if (map.isSolid(c, r)) {
        top = r * TILE;
        break;
      }
    const ramp = map.rampAt(wx);
    if (ramp !== null && ramp >= feet - TILE) top = Math.min(top, ramp);
    top = top - view.camY + LAMP_SOIL;
    soil.set(x, top);
    return top;
  };
  const reach = Math.max(...lamp.map((l) => ("rings" in l ? Math.max(...l.rings.map((r) => r[0])) : 0)));
  const ys = lamp.flatMap((l) => ("rings" in l ? [l.y] : []));
  const cuts = nightCutsOf(night);
  const all = [...lamp, ...others];
  const fill = (x: number, y: number, w: number, a: number) => S(x, y, w, 1, `rgba(${NIGHT}, ${a})`);
  for (let y = Math.max(0, Math.floor(Math.min(...ys) - reach)); y < Math.min(view.h, Math.ceil(Math.max(...ys) + reach)); y++)
    for (const run of darkRow(y, view.w, all, night, cuts)) {
      const without = darknessAt(run.x + run.w / 2, y + 0.5, night[Math.min(night.length - 1, run.x)] ?? 0, others);
      if (without <= run.dark || run.dark >= 1) continue;
      const a = (without - run.dark) / (1 - run.dark);
      // The backdrop behind the street: only where nothing of the street is drawn.
      g.globalCompositeOperation = "destination-over";
      fill(run.x, y, run.w, a);
      g.globalCompositeOperation = "source-over";
      // The soil: from a few pixels under the ground's top down, column by column.
      let from = -1;
      for (let x = run.x; x <= run.x + run.w; x++) {
        const deep = x < run.x + run.w && y >= soilTop(x);
        if (deep && from < 0) from = x;
        else if (!deep && from >= 0) {
          fill(from, y, x - from, a);
          from = -1;
        }
      }
    }
}

/** Once he has it, the ski pole goes with him everywhere: held at his side, its basket near the ground. */
function skiPole(v: View) {
  const b = shown;
  const side = scene.play.body.facing > 0 ? -1 : 1;
  const x = Math.round(b.x + PLAYER.w / 2 + side * 5);
  const top = Math.round(b.y + (scene.play.sitting ? 9 : 6));
  R(x, top, 1, PLAYER.h - 4, METAL.lampPost);
  R(x - 1, top + PLAYER.h - 8, 3, 1, METAL.lampPost);
  R(x, top - 1, 1, 1, PALETTE.sailStripe);
  void v;
}

function render(alpha: number) {
  const sky = scene.skies.sky;
  const art = scene.def.art;
  const p = scene.play;
  const horizon = p.map.height - 4 * TILE - 34;
  beginLayers(kit, sky, state.steps, horizon);
  const doorsById = new Map(scene.doors.map((d) => [d.id, d]));
  const v: View = { sky, t: p.t, alpha, doors: doorsById, now: now(), him: { x: shown.x + PLAYER.w / 2, y: shown.y + PLAYER.h / 2 }, flourish: p.def.flourish && p.runeAt !== null ? p.t - p.runeAt : null, facing: p.body.facing, troll: p.troll, flags: p.flags.map((f, i) => ({ ...f, raisedAt: p.raisedAt[i] })), enemies: p.enemies, boss: p.boss?.state ?? null, cleared: progress.cleared, runeAt: p.runeAt };
  const haze = scene.def.haze ?? [0.35, 0.3, 0.2];
  if (art.far) farPass(kit.depth(0.12), () => art.far!(v), haze[0]);
  if (art.mid) farPass(kit.depth(0.2), () => art.mid!(v), haze[1]);
  if (art.near) farPass(kit.depth(0.4), () => art.near!(v), haze[2]);
  const street = kit.depth(1);
  pass(street, () => art.back(v));
  pass(street, () => {
    drawBoards(scene.boards);
    drawWater(p.map, p.t);
    drawTiles(p.map, art, sky, scene.def.underground);
  });
  pass(street, () => {
    drawThings(v);
    art.front?.(v);
  });
  target(street);
  if (sky.phase !== "day") afterDark(v);
  if (p.def.dark) drawNight(v);
  drawSparks(state.sparks);
  if (state.feather) {
    const f = Math.min(1, (state.steps - state.feather.since) / FEATHER_FALL);
    if (f < 1) {
      // The feather floats down, swaying, and comes to rest on his shoulder.
      const sway = view.reduced ? 0 : Math.round(Math.sin((state.steps - state.feather.since) * 0.11) * 5 * (1 - f));
      drawFeather(Math.round(shown.x + PLAYER.w / 2 - FEATHER_W / 2 + sway), Math.round(shown.y - 60 * (1 - f) + 2 - FEATHER_H / 2 + 6 * f), FEATHER.vane, FEATHER.sheen, FEATHER.shine, state.feather.gold);
    }
  }

  const door = state.mode === "play" && !state.flight && !state.finished ? doorAt(p.body, scene.doors) : null;
  const bench = state.mode === "play" && !state.finished && !scene.map && !p.sitting ? benchAt(p) : null;
  // A sign he is standing by speaks in a bubble; so does the mound's stop while he has no feather.
  const cx = shown.x + PLAYER.w / 2;
  let bubble: { x: number; y: number; lines: string[]; align?: "left" } | null = null;
  if (state.mode === "play" && !door) {
    const sign = scene.signs.find((s) => Math.abs(cx - s.x) < 28 && Math.abs(shown.y + PLAYER.h - s.bottom) < 8);
    if (sign) {
      const def = scene.def.signs[sign.i];
      bubble = { x: sign.x, y: sign.bottom - 30, lines: (touch && def?.touch ? def.touch[lang] : def?.lines[lang]) ?? [] };
    }
    const mound = scene.map ? doorsById.get("maze") : undefined;
    if (!bubble && mound && !abilities.doubleJump && Math.abs(cx - (mound.x + mound.w / 2)) < 3 * TILE && p.body.onGround && Math.abs(shown.y + PLAYER.h - mound.bottom) < 8)
      bubble = { x: mound.x + mound.w / 2, y: mound.bottom - mound.h - 14, lines: t.moundNoFeather };
  }
  if (state.bubble) bubble = { x: state.bubble.door.x + state.bubble.door.w / 2, y: state.bubble.door.bottom - state.bubble.door.h, lines: [state.bubble.text] };
  // A boss's line or hint, beside it, while nothing else is speaking.
  const boss = state.bossLine && state.steps < state.bossLine.until && state.mode === "play" ? bossBubbleAt(p, state.bossLine.lines) : null;
  if (!bubble && boss && state.bossLine) bubble = { x: boss.x, y: boss.y, lines: state.bossLine.lines };
  // The feather moment at the mound: his own bubble, even though he stands at a door.
  const speaking = state.mode === "play" && !!state.feather && state.steps - state.feather.since > FEATHER_FALL * 0.6;
  if (speaking) bubble = { x: cx, y: shown.y - 4, lines: [t.featherLine] };
  const nearKey = bubble ? bubble.lines[0] : null;
  if (nearKey !== state.nearSign) {
    state.nearSign = nearKey;
    if (bubble) say(bubble.lines.join(" "));
  }

  // Blinking after a hit (with reduced motion, drawn at half strength the whole time instead); sitting, a little lower, on the bench.
  const safe = blinking(p) ? (view.reduced ? 0.5 : Math.floor(p.t / 4) % 2 === 0 ? 0.25 : 1) : 1;
  const body = p.sitting ? { ...shown, y: shown.y + 3 } : shown;
  drawOverlay({
    ...sceneOverlay(state, shown, sky, look()),
    banner: plated(state.banner),
    world: p.map,
    boards: scene.boards,
    player: { body, walk: p.sitting ? 0 : state.walk, alpha: p.loaded ? 0 : state.alpha * (1 - state.fade) * safe, phase: sky.phase, look: look() },
    hint:
      door && !touch && !speaking && !frozen() && !state.bubble
        ? { x: shown.x + PLAYER.w / 2, y: shown.y, text: `↑  ${door.soon && !scene.map ? t.locked : t.goIn}` }
        : bench !== null && !touch && !bubble
          ? { x: shown.x + PLAYER.w / 2, y: shown.y, text: `↑  ${t.sit}` }
          : null,
    bubble: door && !speaking && !state.bubble ? null : bubble,
    marker: state.goal && !state.goal.door ? { x: state.goal.x, y: p.map.surfaceBelow(state.goal.x, Math.min(state.goal.y, p.map.height - TILE)) ?? p.map.height } : null
  });
  drawFlight();
  follows(door ?? (bench !== null ? benchStop : null), state.moved);
  // The touch pad's button says what up does here: go in at a door, sit at a bench.
  const label = !door && bench !== null ? t.sitButton : t.enter;
  if (enterButton.textContent !== label) {
    enterButton.textContent = label;
    enterButton.setAttribute("aria-label", label);
  }
  hud();
}
/** What the pad's enter button stands for at a bench. */
const benchStop = { id: "bench" };

/**
 * The place's name, on a dark plate, so it reads over any sky: there in full from the first frame,
 * fading out after about two and a half seconds (with reduced motion it simply goes).
 */
function plated(b: typeof state.banner) {
  if (!b) return null;
  const age = state.steps - b.since;
  const alpha = view.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, (165 - age) / 30));
  return alpha > 0 ? { title: b.title, sub: b.sub, alpha, plate: true } : null;
}

/** The rune on its way from the level to its slot in the header, on the text canvas. */
function drawFlight() {
  const f = state.flight;
  if (!f) return;
  const u = textCtx();
  const k = Math.min(1, (state.steps - f.since) / FLIGHT_STEPS);
  const e = k * k * (3 - 2 * k);
  const slot = runeSlots[scene.def.rune]?.getBoundingClientRect();
  const st = stage.getBoundingClientRect();
  const fx = sx(f.from.x);
  const fy = sy(f.from.y);
  const tx = slot ? slot.left + slot.width / 2 - st.left : fx;
  const ty = slot ? slot.top + slot.height / 2 - st.top : fy;
  const x = fx + (tx - fx) * e;
  const y = fy + (ty - fy) * e - Math.sin(e * Math.PI) * 60;
  const n = unit() * (1 - 0.5 * e);
  u.fillStyle = PALETTE.runeGlow;
  runeCells(RUNE_CHARS[scene.def.rune] as RuneChar, 9, 11).forEach((row, ry) => row.forEach((on, rx) => on && u.fillRect(x + (rx - 4.5) * n, y + (ry - 5.5) * n, Math.ceil(n), Math.ceil(n))));
}

const loop = createLoop(
  () => {
    if (mode === "maze" && maze) {
      input.pollPad(0.35);
      maze.step();
      input.endStep();
    } else if (scene) stepOnce();
  },
  (a, elapsed) => {
    if (mode === "maze" && maze) {
      maze.render(a, elapsed);
      showMazeHud();
      return;
    }
    const p = scene.play;
    blend(shown, p.body, before, a);
    rideShown(p.def.carriers, p.t, a, p.body, shown);
    camera(elapsed, false);
    render(a);
  }
);

wirePad(pad, input, touch, help);
// Pointing at a plain link lights up its door in the game.
for (const link of links) {
  const on = () => (state.highlight = scene?.doors.find((d) => d.id === link.id) ?? null);
  const off = () => state.highlight?.id === link.id && (state.highlight = null);
  link.el.addEventListener("mouseenter", on);
  link.el.addEventListener("mouseleave", off);
  link.el.addEventListener("focus", on);
  link.el.addEventListener("blur", off);
}

// Clicking or tapping sends him there: into a door, or just along the ground.
wirePointer(stage, () => scene?.doors ?? [], state, {
  active: () => state.mode === "play" && mode === "scene",
  walk: (at, door) => {
    if (frozen() || state.finished || state.flight) return;
    state.goal = walkTo(at, door, scene.play.map.width, state.steps);
    state.moved = true;
  }
});

// T steps through every sky and back to the real one; R starts the level again (M, the sound, is wired by the kit).
wireSkyKey(() => scene.skies, state, t.skies, () => mode === "scene");
onKey("KeyR", () => mode === "scene" && !scene.map && restartLevel());

// The header link to the maze keeps its address for visitors without JavaScript; with it, a click goes in.
links.find((l) => l.id === "maze")?.el.addEventListener("click", (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  if (mode === "maze" || loading) return;
  intoMaze();
});

// ---------------------------------------------------------------------------------------------
// Arriving. The address says where, when it names a scene. Otherwise: from the front page (`?from=oslo`)
// he steps out of the Opera's door in level 1 the first time, or onto the map at the furthest open
// station once there is progress, with the helmet moment; from the maze's own site (`?from=maze`) at
// the mound's stop; and with no word, on the map if there is progress, in level 1 if not.

const from = params.get("from");
const levelParam = params.get("level");
const debugLevel = debug && levelParam && BUILT.some((l) => l.id === levelParam) ? levelParam : null;
if (levelParam && !debugLevel && location.hash !== MAZE_HASH) history.replaceState(null, "", location.pathname + location.search + MAZE_HASH); // ?level=<n>: the maze at that level

/** `?debug&auto`: the page plays the level's scripted route from the tests, for looking at. */
let auto: ((p: Play) => PlayIntent | null) | null = null;
const AUTO: Record<string, () => Promise<Move[]>> = {
  langkaia: () => import("./levels/routes/langkaia").then((m) => m.LANGKAIA_ROUTE),
  akershus: () => import("./levels/routes/akershus").then((m) => m.AKERSHUS_ROUTE),
  radhuset: () => import("./levels/routes/radhuset").then((m) => m.RADHUSET_ROUTE),
  slottet: () => import("./levels/routes/slottet").then((m) => m.SLOTTET_ROUTE),
  holmenkollen: () => import("./levels/routes/holmenkollen").then((m) => m.HOLMENKOLLEN_ROUTE),
  akerselva: () => import("./levels/routes/akerselva").then((m) => m.AKERSELVA_ROUTE),
  nordmarka: () => import("./levels/routes/nordmarka").then((m) => m.NORDMARKA_ROUTE),
  stortinget: () => import("./levels/routes/stortinget").then((m) => m.STORTINGET_ROUTE),
  ekeberg: () => import("./levels/routes/ekeberg").then((m) => m.EKEBERG_ROUTE),
  nabolaget: () => import("./levels/routes/nabolaget").then((m) => m.NABOLAGET_ROUTE)
};

/** One frame with nothing blended and the camera settled on him: what a stepped page shows. */
function still() {
  if (mode !== "scene" || !scene) return;
  Object.assign(shown, scene.play.body);
  rideShown(scene.play.def.carriers, scene.play.t, 1, scene.play.body, shown);
  camera(0, true);
  render(1);
}

/** Where he arrives, the level's code if it is not here yet, and then the game runs. */
async function start() {
  if (debugging) {
    pretend = (await debugging).debugProgress(params);
    if (pretend) progress = pretend;
    readFeather();
  }
  const started = hasProgress(progress);
  const furthest = ORDER[furthestOpen(progress, ORDER, BUILT.length)];
  let first: string;
  let firstAt: string | undefined;
  if (location.hash === MAZE_HASH) {
    first = "kart";
    firstAt = "maze";
  } else if (debugLevel) first = debugLevel;
  else if (ROUTES.includes(location.hash.slice(1))) first = location.hash.slice(1);
  else if (from === "maze") {
    first = "kart";
    firstAt = "maze";
  } else if (from === "oslo" || !started) {
    first = started ? "kart" : BUILT[0].id;
    firstAt = started ? furthest : undefined;
  } else {
    first = "kart";
    firstAt = furthest;
  }
  if (first !== "kart" && !levelOpen(first)) {
    first = "kart";
    firstAt = furthest;
  }
  // The scripted routes for `?debug&auto` are fetched alongside the level, not after it, so a
  // stepped page has both before it steps.
  // The scripted player itself comes with them, on demand: no visitor's first script carries it.
  const route = debug && params.has("auto") ? Promise.all([AUTO[first]?.(), import("./game/bot")]).catch(() => null) : null;
  let failedAtStart: string | null = null;
  if (first !== "kart") {
    showFetching(first);
    try {
      await fetchLevel(first);
    } catch {
      failedAtStart = first;
      first = "kart";
      firstAt = furthest;
    }
    showFetching(null);
  }
  const scripted = await route;
  openScene(first, firstAt);
  if (location.hash !== MAZE_HASH) history.replaceState(null, "", location.pathname + location.search + `#${first}`);
  if (failedAtStart) showLoadFailed(failedAtStart);
  if (scripted?.[0] && !scene.map) auto = scripted[1].autopilot(scripted[0]);

  // The helmet moment: out of the Opera's door in level 1, or at a station on the map. In level 1 he
  // stands at the start, a step clear of the door he came out of, which closes behind him: so his
  // first press of up is a jump, not the way home.
  if (from === "oslo" && !view.reduced) {
    const home = !scene.map ? scene.doors.find((d) => d.id === "home") ?? null : null;
    state.arrive = { t: 0, off: null, door: home };
    state.alpha = 0;
    if (home) home.open = true;
  }
  dropParam(params, "from");

  // Back from a door that leads off the page: stand outside it again, with nothing frozen or held.
  const cameBackBy = doorLeftBy(LAST_DOOR, scene.doors);
  if (cameBackBy) standAt(cameBackBy);
  window.addEventListener("pageshow", (e) => e.persisted && reopen(state, scene.doors, input));

  // ?x=<art px>[&y=<art px>] drops him at that x, on the first thing to stand on at or below y, so a reviewer can start anywhere.
  if (params.has("x")) {
    const x = Number(params.get("x"));
    const y = Number(params.get("y") ?? 0);
    const at = Number.isFinite(x) ? scene.play.map.surfaceBelow(x, Number.isFinite(y) ? y : 0) : null;
    // Over water (a raft, a ferry) there is no ground below: with a y he is put there, and falls onto what moves under him.
    if (at !== null) place(x, at);
    else if (Number.isFinite(x) && params.has("y") && Number.isFinite(y)) {
      place(x, y);
      scene.play.body.onGround = false;
    }
  }

  launch({ stage, layout, still, loop, harness, input, step: () => (mode === "maze" && maze ? maze.step() : stepOnce()) });
  if (location.hash === MAZE_HASH) sync();
}
void start();

if (debugging)
  void debugging.then((d) =>
    d.expose({
      get body() {
        return scene.play.body;
      },
      get level() {
        return scene.def;
      },
      get play() {
        return scene.play;
      },
      get shown() {
        return shown;
      },
      state,
      view,
      input,
      step: stepOnce,
      frame: loop.frame,
      still,
      get doors() {
        return scene.doors;
      },
      get maze() {
        return maze;
      },
      progress: () => progress,
      fresh
    })
  );
