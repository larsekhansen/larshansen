import "./styles.css";
import { PLAYER, TILE } from "./game/config";
import { buildDoors, doorAt, readAppLinks, type Door } from "./game/doors";
import { pickLang, strings } from "./game/i18n";
import { createInput, type Action } from "./game/input";
import { GROUND_Y, WORLD_W, districtAt, findDoorSpots, findSpawn, type District } from "./game/level";
import { createStepper } from "./game/loop";
import { skyFor } from "./game/oslo";
import { createBody, stepBody } from "./game/physics";
import { drawFjord, drawGalgeberg, drawHills, drawLandmarks, drawSkylineBlocks, drawTram } from "./render/backdrop";
import { drawBuildings, drawRuins } from "./render/buildings";
import { drawBoards, drawTiles, lightStreet } from "./render/ground";
import { R, TINT, drawLights, lights, target, view } from "./render/paint";
import { drawSky, drawSnowfall, horizonColor } from "./render/sky";
import { drawText, layoutBoards, textTarget, type Board } from "./render/text";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const stage = $<HTMLElement>("stage");
const px = $<HTMLCanvasElement>("px");
const ui = $<HTMLCanvasElement>("ui");
const pad = $<HTMLElement>("pad");
const help = $<HTMLElement>("help");
const announce = $<HTMLElement>("announce");
const enterButton = pad.querySelector<HTMLButtonElement>('[data-action="enter"]')!;

const g = px.getContext("2d")!;
const worldCanvas = document.createElement("canvas");
const wg = worldCanvas.getContext("2d")!;
const layerCanvas = document.createElement("canvas");
const lg = layerCanvas.getContext("2d")!;
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

// The world.
const params = new URLSearchParams(location.search);
const skyOverride = params.get("sky");
let sky = skyFor(new Date(), skyOverride);
const links = readAppLinks();
const doors = buildDoors(findDoorSpots(), links, { cv: "CV", maze: t.maze, qr: "QR-verkstedet", quintle: "Quintle", opera: "?" });
const spawn = findSpawn();
const body = createBody(spawn.x, spawn.bottom);
const input = createInput();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
view.reduced = reducedMotion.matches;
reducedMotion.addEventListener("change", (e) => (view.reduced = e.matches));
const touch = matchMedia("(pointer: coarse)").matches;

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const state = {
  mode: "play" as "play" | "enter" | "away",
  modeSteps: 0,
  door: null as Door | null,
  fade: 0,
  alpha: 1,
  walk: 0,
  steps: 0,
  moved: false,
  bubble: null as { text: string; until: number; door: Door } | null,
  district: districtAt(body.x) as District,
  banner: null as { title: string; sub: string; since: number } | null,
  highlight: null as Door | null,
  sparks: [] as Spark[]
};

state.banner = { title: state.district.name, sub: state.district.landmark ? state.district.landmark[lang] : "", since: 0 };

const LAST_DOOR = "lh:lastDoor";
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

function standAt(d: Door) {
  Object.assign(body, { x: d.x + d.w / 2 - PLAYER.w / 2, y: d.bottom - PLAYER.h, vx: 0, vy: 0, onGround: true });
  state.district = districtAt(body.x);
  state.banner = { title: state.district.name, sub: state.district.landmark ? state.district.landmark[lang] : "", since: state.steps };
}

function resetScene() {
  state.mode = "play";
  state.fade = 0;
  state.alpha = 1;
  doors.forEach((d) => (d.open = false));
  input.clear();
}

// Back from an app: start outside the door you went through, with nothing frozen or held.
const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
if (navigation?.type === "back_forward") {
  const d = doors.find((x) => x.id === recall());
  if (d) standAt(d);
}
window.addEventListener("pageshow", (e) => e.persisted && resetScene());

function say(text: string) {
  announce.textContent = text;
}

function tryEnter(d: Door) {
  if (d.secret) {
    state.bubble = { text: t.secret, until: state.steps + 240, door: d };
    say(t.secret);
    if (!view.reduced) fireworks(d);
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
  say(t.opening(d.name));
}

function fireworks(d: Door) {
  const colors = ["#ba0c2f", "#ffffff", "#00205b", "#ffd36b"];
  for (let burst = 0; burst < 3; burst++) {
    const cx = d.x - 40 + burst * 40;
    const cy = 18 + (burst % 2) * 10;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const v = 0.6 + Math.random() * 0.5;
      state.sparks.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.2, life: 50 + burst * 12, color: colors[(i + burst) % 4] });
    }
  }
}

function play() {
  const door = doorAt(body, doors);
  if (door && (input.pressed("up") || input.pressed("enter"))) return tryEnter(door);
  const r = stepBody(body, {
    left: input.held.left,
    right: input.held.right,
    jumpHeld: input.held.jump || input.held.up,
    jumpPressed: input.pressed("jump") || (input.pressed("up") && !door)
  });
  if (input.held.left || input.held.right || r.jumped) state.moved = true;
  state.walk = body.onGround && Math.abs(body.vx) > 0.2 ? state.walk + 1 : 0;
  if (r.landed > 3 && !view.reduced)
    for (let i = 0; i < 5; i++)
      state.sparks.push({ x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h - 1, vx: (i - 2) * 0.35, vy: -0.3 - Math.random() * 0.4, life: 18, color: "#ebe1cd" });
  const here = districtAt(body.x + PLAYER.w / 2);
  if (here !== state.district) {
    state.district = here;
    state.banner = { title: here.name, sub: here.landmark ? here.landmark[lang] : "", since: state.steps };
  }
}

// Through a door: walk in, fade out, then open the app in this tab.
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
    remember(d.id);
    state.mode = "away";
    state.modeSteps = 0;
    if (d.href) location.assign(d.href);
  }
}

function stepOnce() {
  state.steps++;
  if (state.mode === "play") play();
  else if (state.mode === "enter") goThrough();
  else if (++state.modeSteps > 300) resetScene(); // the app never opened
  doors.forEach((d) => d.shake > 0 && d.shake--);
  if (state.bubble && state.steps > state.bubble.until) state.bubble = null;
  state.sparks = state.sparks.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    return --p.life > 0;
  });
  input.endStep();
  camera(false);
  if (state.steps % 120 === 0) sky = skyFor(new Date(), skyOverride);
}

const cam = { x: 0, y: 0 };
function camera(snap: boolean) {
  const maxX = WORLD_W - view.w;
  const maxY = GROUND_Y + TILE - view.h; // one tile of ground below the street
  const tx = body.x + PLAYER.w / 2 + body.facing * 22 - view.w / 2;
  const wantX = maxX < 0 ? maxX / 2 : Math.max(0, Math.min(maxX, tx));
  // A tall screen shows more sky, with the street kept at the bottom.
  const wantY = maxY < 0 ? maxY : Math.max(0, Math.min(maxY, body.y + PLAYER.h / 2 - view.h / 2));
  if (snap) {
    cam.x = wantX;
    cam.y = wantY;
  } else {
    cam.x += (wantX - cam.x) * 0.12;
    cam.y += (wantY - cam.y) * 0.12;
  }
  view.camX = Math.round(cam.x);
  view.camY = Math.round(cam.y);
}

let boards: Board[] = [];
function layout() {
  const rect = stage.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const devW = Math.max(1, Math.round(rect.width * dpr));
  const devH = Math.max(1, Math.round(rect.height * dpr));
  // Whole device pixels per art pixel, keeping about 192 art pixels of height and 180 of width.
  // A tall phone zooms in further, so the street is not a strip under an empty sky.
  let k = Math.max(1, Math.floor(Math.min(devH / 192, devW / 180)));
  if (devH > devW * 1.2) k = Math.max(k, Math.min(Math.ceil(devH / 280), Math.floor(devW / 120)));
  Object.assign(view, { k, dpr, w: Math.ceil(devW / k), h: Math.ceil(devH / k) });
  view.cssW = (view.w * k) / dpr;
  view.cssH = (view.h * k) / dpr;
  for (const c of [px, ui]) {
    c.style.width = `${view.cssW}px`;
    c.style.height = `${view.cssH}px`;
  }
  px.width = worldCanvas.width = layerCanvas.width = view.w;
  px.height = worldCanvas.height = layerCanvas.height = view.h;
  ui.width = Math.round(view.cssW * dpr);
  ui.height = Math.round(view.cssH * dpr);
  g.imageSmoothingEnabled = false;
  boards = layoutBoards(doors, "larshansen.dev");
  camera(true);
}

/**
 * Draws one depth of the scene. Distant layers fade a little towards the colour of the horizon,
 * which keeps them calm behind the player. At dusk and night the layer is darkened and then its
 * own windows and lamps come on, before the next, nearer layer covers what it should.
 */
function layer(draw: () => void, haze = 0) {
  lg.globalCompositeOperation = "source-over";
  lg.clearRect(0, 0, view.w, view.h);
  target(lg);
  lights.length = 0;
  draw();
  if (haze > 0) {
    lg.globalCompositeOperation = "source-atop";
    lg.globalAlpha = haze;
    lg.fillStyle = horizonColor(sky.phase);
    lg.fillRect(0, 0, view.w, view.h);
    lg.globalAlpha = 1;
  }
  const tint = TINT[sky.phase];
  if (tint) {
    lg.globalCompositeOperation = "source-atop";
    lg.fillStyle = tint;
    lg.fillRect(0, 0, view.w, view.h);
    lg.globalCompositeOperation = "source-over";
    drawLights();
  }
  wg.drawImage(layerCanvas, 0, 0);
}

function render() {
  target(g);
  drawSky(sky, state.steps);

  wg.clearRect(0, 0, view.w, view.h);
  layer(() => {
    drawHills(sky);
    drawFjord(state.steps);
  }, 0.35);
  layer(() => drawGalgeberg(sky), 0.28);
  layer(drawSkylineBlocks, 0.25);
  layer(drawLandmarks, 0.18);
  layer(() => drawTram(state.steps), 0.08);
  layer(() => drawRuins(sky), 0.12);
  layer(() => drawBuildings(doors, sky, state.steps));
  layer(() => {
    drawBoards(boards);
    drawTiles(sky);
    lightStreet();
  });
  target(wg);
  for (const p of state.sparks) R(p.x, p.y, 1, 1, p.color);

  target(g);
  g.drawImage(worldCanvas, 0, 0);
  drawSnowfall(sky, state.steps);
  if (state.fade > 0) {
    g.fillStyle = `rgba(5, 5, 12, ${state.fade.toFixed(3)})`;
    g.fillRect(0, 0, view.w, view.h);
  }

  const door = state.mode === "play" ? doorAt(body, doors) : null;
  const age = state.banner ? state.steps - state.banner.since : 0;
  drawText({
    boards,
    player: { body, walk: state.walk, alpha: state.alpha * (1 - state.fade), phase: sky.phase },
    hint: door && !touch ? { x: body.x + PLAYER.w / 2, y: body.y, text: `↑  ${door.soon ? t.locked : t.goIn}` } : null,
    bubble: state.bubble ? { x: state.bubble.door.x + state.bubble.door.w / 2, y: state.bubble.door.bottom - state.bubble.door.h, text: state.bubble.text } : null,
    banner: state.banner ? { title: state.banner.title, sub: state.banner.sub, alpha: view.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, age / 15, (165 - age) / 30)) } : null,
    highlight: state.highlight,
    steps: state.steps
  });

  enterButton.classList.toggle("show", !!door);
  if (state.moved && !help.hidden) help.hidden = true;
}

const advance = createStepper(stepOnce);
let last = performance.now();
function frame(now: number) {
  advance(now - last);
  last = now;
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

// Pointing at a plain link lights up its house in the game.
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

new ResizeObserver(layout).observe(stage);
layout();
requestAnimationFrame((now) => {
  last = now;
  requestAnimationFrame(frame);
});

if (params.has("debug")) Object.assign(window, { __game: { body, doors, state, view, input, step: stepOnce } });
