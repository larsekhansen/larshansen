import "@larshansen/pixelkit/chrome.css";
import "./styles.css";
import { aim, follow } from "@larshansen/pixelkit/camera";
import { wireMute } from "@larshansen/pixelkit/chrome";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { buildDoors, doorAt, readAppLinks, type Door } from "@larshansen/pixelkit/doors";
import { readHarness } from "@larshansen/pixelkit/harness";
import { browserLang, soundWords } from "@larshansen/pixelkit/i18n";
import { createInput } from "@larshansen/pixelkit/input";
import { R, target, view } from "@larshansen/pixelkit/paint";
import { helmetPixels, type Look } from "@larshansen/pixelkit/person";
import { createBody, placeBody, stepBody } from "@larshansen/pixelkit/physics";
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
import { strings } from "./game/i18n";
import { GROUND_Y, LEVEL, WORLD, WORLD_W, findDoorSpots, rampAt, type DoorKind } from "./game/level";
import { drawFjord, drawGalgeberg, drawHills, drawLandmarks, drawSkylineBlocks, drawTram } from "./render/backdrop";
import { drawBuildings, drawRuins } from "./render/buildings";
import { drawTiles, lightStreet } from "./render/ground";
import { layoutBoards } from "./render/text";

// The front page: a walk through Gamle Oslo, where every house is a door to one of the apps.
// The scene's own parts are here and in game/ and render/; what every scene does is the kit's.

const { stage, pad, help, announce, enterButton, kit } = openPage([0.12, 0.2, 0.25, 0.4, 0.7, 1]);

// Language: Norwegian for Norwegian browsers, English for everyone else.
const lang = browserLang();
const t = strings(lang);
putWords(lang, t, pad);

// The world.
const params = new URLSearchParams(location.search);
/** `?debug&steps=N`: stepped at load and drawn once, with the clock frozen (see the kit's harness). */
const harness = readHarness(params);
const skies = skyControl(params.get("sky"), () => harness?.now ?? new Date());
const links = readAppLinks();
const doors = buildDoors(findDoorSpots(), links, { cv: "CV", maze: t.maze, qr: "QR-verkstedet", quintle: "Quintle", opera: "?" });
const spawn = LEVEL.spawn();
const body = createBody(spawn.x, spawn.bottom);
const input = createInput();
// The front page is silent until the visitor asks for sound; the games start with it on.
const sfx = createSfx({ mutedUntilChosen: true });
wireMute(byId<HTMLButtonElement>("mute"), sfx, soundWords(lang));
followReducedMotion();
const touch = isTouch();

// Physics runs in fixed steps. Drawing blends the last two steps, so motion is smooth on any screen.
const before = { x: body.x, y: body.y };
const shown = { ...body };

type Building = Door<DoorKind>;
const state = {
  ...sceneState<Building>(LEVEL.districtAt(body.x), lang),
  bubble: null as { text: string; until: number; door: Building } | null,
  /** Back from Vikingfjorden (`?from=viking`): the cape rolls up and the helmet comes off, over ARRIVAL steps. */
  arrive: null as { t: number } | null,
  /** The helmet once it has left his head: it drops behind the Opera and out of the picture. */
  helmet: null as { x: number; y: number; vy: number; facing: number } | null
};
const ARRIVAL = 40;

const LAST_DOOR = "lh:lastDoor";

function place(centerX: number, bottom: number) {
  placeBody(body, centerX, bottom);
  before.x = body.x;
  before.y = body.y;
  state.district = LEVEL.districtAt(body.x);
  state.banner = bannerFor(state.district, lang, state.steps);
}

const standAt = (d: Building) => place(d.x + d.w / 2, d.bottom);

// Back from an app: start outside the door you went through, with nothing frozen or held.
const cameBackBy = doorLeftBy(LAST_DOOR, doors);
if (cameBackBy) standAt(cameBackBy);
window.addEventListener("pageshow", (e) => e.persisted && reopen(state, doors, input));

// Back from Vikingfjorden through its door Hjem: he stands at the Opera's top door, facing left,
// still in the helmet. The address is cleaned, so a reload starts at the beginning as usual.
if (params.get("from") === "viking") {
  const opera = doors.find((d) => d.secret);
  if (opera) {
    standAt(opera);
    body.facing = -1;
    if (!view.reduced) state.arrive = { t: 0 };
  }
}
dropParam(params, "from");

/** What he wears while the helmet comes off: undefined once it is done, which is the plain person. */
function look(): Look | undefined {
  const a = state.arrive;
  if (!a) return undefined;
  return { outfit: "viking", helmetOffset: a.t < 8 ? 0 : a.t < 20 ? Math.round((a.t - 8) * 0.75) : null, capeRows: Math.max(0, 4 - Math.floor(a.t / 4)) };
}

function stepArrival() {
  const a = state.arrive;
  if (a) {
    a.t++;
    if (a.t === 20) state.helmet = { x: Math.round(body.x), y: Math.round(body.y) - 9, vy: -0.6, facing: body.facing };
    if (a.t >= ARRIVAL) state.arrive = null;
  }
  const h = state.helmet;
  if (h) {
    h.vy += 0.12;
    h.y += h.vy;
    if (h.y > view.camY + view.h + 4) state.helmet = null;
  }
}

function say(text: string) {
  announce.textContent = text;
}

function tryEnter(d: Building) {
  if (d.secret) {
    sfx.play("door");
    state.bubble = { text: t.secret, until: state.steps + 240, door: d };
    say(t.secret);
    if (!view.reduced) fireworks(state.sparks, (burst) => ({ x: d.x - 40 + burst * 40, y: 18 + (burst % 2) * 10 }));
    if (!d.href) return;
    // Let the fireworks play for a moment, then go through to the game behind the door.
    state.mode = "enter";
    state.modeSteps = view.reduced ? 0 : -80;
    state.door = d;
    body.vx = 0;
    return;
  }
  if (d.soon || !d.href) {
    d.shake = view.reduced ? 0 : 14;
    const text = d.id === "cv" ? t.homeSoon : d.id === "quintle" ? t.quintleSoon : t.locked;
    state.bubble = { text, until: state.steps + 180, door: d };
    say(text);
    return;
  }
  state.mode = "enter";
  state.modeSteps = 0;
  state.door = d;
  body.vx = 0;
  sfx.play("door");
  say(t.opening(d.name));
}

function play() {
  const door = doorAt(body, doors);
  if (door && (input.pressed("up") || input.pressed("enter"))) return tryEnter(door);
  // Walking to a clicked house. Any input of the visitor's own takes over again.
  const { intent, enter } = followGoal(state, body, intentFrom(input, !!door), door);
  if (enter) return tryEnter(enter);
  const r = stepBody(body, intent, WORLD);
  afterStep(state, body, intent, r, sfx);
  hardLanding(state, body, r, sfx);
  trackDistrict(state, LEVEL.districtAt(body.x + PLAYER.w / 2), lang);
}

// Through a door: walk in, fade out, then open the app in this tab.
function goThrough() {
  const d = state.door!;
  if (!stepThrough(state, body)) return;
  rememberDoor(LAST_DOOR, d.id);
  if (d.href) location.assign(d.href);
}

function stepOnce() {
  stepStart(state, body, before);
  stepArrival();
  input.pollPad();
  if (state.mode === "play") play();
  else if (state.mode === "enter") goThrough();
  else if (++state.modeSteps > 300) reopen(state, doors, input); // the app never opened
  if (state.bubble && state.steps > state.bubble.until) state.bubble = null;
  stepEnd(state, doors, input, skies);
}

/** The camera follows the player smoothly, at the same pace on every screen. One tile of ground shows below the street. */
function camera(elapsedMs: number, snap: boolean) {
  const focus = { x: shown.x + PLAYER.w / 2, y: shown.y + PLAYER.h / 2, facing: body.facing };
  aim(follow({ x: view.camXf, y: view.camYf }, focus, { width: WORLD_W, bottom: GROUND_Y + TILE }, view, elapsedMs, snap));
}

let boards: Board[] = [];
function layout() {
  kit.resize();
  boards = layoutBoards(doors, "larshansen.dev");
  camera(0, true);
}

const pass = (onto: CanvasRenderingContext2D, draw: () => void, haze = 0) => kit.pass(onto, draw, skies.sky.phase, haze);
const follows = pageFollows(enterButton, links, help);

function render() {
  const sky = skies.sky;
  beginLayers(kit, sky, state.steps);
  pass(kit.depth(0.12), () => drawHills(sky), 0.35);
  pass(kit.depth(0.2), () => drawFjord(state.steps), 0.35);
  pass(kit.depth(0.25), () => drawGalgeberg(sky), 0.28);
  pass(kit.depth(0.4), drawSkylineBlocks, 0.25);
  pass(kit.depth(0.4), drawLandmarks, 0.18);
  pass(kit.depth(0.7), () => drawTram(state.steps), 0.08);
  const street = kit.depth(1);
  // The helmet that has come off falls behind the buildings.
  const lost = state.helmet;
  if (lost) pass(street, () => helmetPixels(lost.facing, "day", (c, r, color) => R(lost.x + c, Math.round(lost.y) + r, 1, 1, color), 1));
  pass(street, () => drawRuins(sky), 0.12);
  pass(street, () => drawBuildings(doors, sky, state.steps));
  pass(street, () => {
    drawBoards(boards);
    drawTiles(sky);
    lightStreet();
  });
  target(street);
  drawSparks(state.sparks);

  const door = state.mode === "play" ? doorAt(body, doors) : null;
  drawOverlay({
    ...sceneOverlay(state, shown, sky, look()),
    world: WORLD,
    boards,
    hint: door && !touch && !state.arrive ? { x: shown.x + PLAYER.w / 2, y: shown.y, text: `↑  ${door.soon ? t.locked : t.goIn}` } : null,
    bubble: state.bubble ? { x: state.bubble.door.x + state.bubble.door.w / 2, y: state.bubble.door.bottom - state.bubble.door.h, lines: [state.bubble.text] } : null,
    marker: state.goal && !state.goal.door ? { x: state.goal.x, y: rampAt(state.goal.x) ?? GROUND_Y } : null
  });
  // The pad's enter button, the header link of the house you are standing at, and the help line.
  follows(door, state.moved);
}

const loop = createLoop(stepOnce, (a, elapsed) => {
  blend(shown, body, before, a);
  camera(elapsed, false);
  render();
});

wirePad(pad, input, touch, help);
// Pointing at a plain link lights up its house in the game.
wireLinks(links, doors, state);

// Clicking or tapping sends the player there: into a house, or just along the street.
// The secret door has to be found on foot.
wirePointer(stage, doors, state, {
  active: () => state.mode === "play",
  walk: (at, door) => {
    state.goal = walkTo(at, door, WORLD_W, state.steps);
    state.moved = true;
  }
});

// T steps through every sky, and back to the real one.
wireSkyKey(skies, state, t.skies);

// ?debug&x=<art px> drops him at that x, on the highest thing there, so a reviewer can start anywhere.
if (params.has("debug") && params.has("x")) {
  const x = Number(params.get("x"));
  const y = Number.isFinite(x) ? LEVEL.surfaceBelow(x, 0) : null;
  if (y !== null) place(x, y);
}

/** One frame with nothing blended and the camera settled on him: what a stepped page shows. */
function still() {
  Object.assign(shown, body);
  camera(0, true);
  render();
}

Object.assign(shown, body);
launch({ stage, layout, still, loop, harness, input, step: stepOnce });

if (params.has("debug")) Object.assign(window, { __game: { body, shown, doors, state, view, input, step: stepOnce, frame: loop.frame, still } });
