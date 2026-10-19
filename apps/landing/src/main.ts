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
import { R, TINT, drawLights, layerOrigin, lights, target, view } from "./render/paint";
import { drawSky, horizonColor, snowfall } from "./render/sky";
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
const scratch = document.createElement("canvas");
const sg = scratch.getContext("2d")!;
textTarget(ui.getContext("2d")!);

/**
 * One canvas per depth, stacked between the sky and the text layer. Each is drawn at whole art
 * pixels and then moved by the fraction its depth has scrolled, so every depth glides smoothly
 * instead of jumping a whole, large pixel at a time.
 */
const DEPTHS = [0.12, 0.2, 0.25, 0.4, 0.7, 1].map((factor) => {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "depth";
  stage.insertBefore(canvas, ui);
  return { factor, canvas, g: canvas.getContext("2d")! };
});
const depth = (factor: number) => DEPTHS.find((d) => d.factor === factor)!;

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
  before.x = body.x;
  before.y = body.y;
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
  before.x = body.x;
  before.y = body.y;
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
  if (state.steps % 120 === 0) sky = skyFor(new Date(), skyOverride);
}

/** The camera follows the player smoothly, at the same pace on every screen. */
function camera(elapsedMs: number, snap: boolean) {
  const maxX = WORLD_W - view.w;
  const maxY = GROUND_Y + TILE - view.h; // one tile of ground below the street
  const tx = shown.x + PLAYER.w / 2 + body.facing * 22 - view.w / 2;
  const wantX = maxX < 0 ? maxX / 2 : Math.max(0, Math.min(maxX, tx));
  // A tall screen shows more sky, with the street kept at the bottom.
  const wantY = maxY < 0 ? maxY : Math.max(0, Math.min(maxY, shown.y + PLAYER.h / 2 - view.h / 2));
  const k = snap ? 1 : 1 - Math.exp(-elapsedMs / 130);
  view.camXf += (wantX - view.camXf) * k;
  view.camYf += (wantY - view.camYf) * k;
  view.camX = Math.floor(view.camXf);
  view.camY = Math.floor(view.camYf);
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
  // One art pixel more than the screen in each direction, so nudging a layer never shows an edge.
  Object.assign(view, { k, dpr, w: Math.ceil(devW / k) + 1, h: Math.ceil(devH / k) + 1 });
  view.cssW = (view.w * k) / dpr;
  view.cssH = (view.h * k) / dpr;
  for (const c of [px, ui, ...DEPTHS.map((d) => d.canvas)]) {
    c.style.width = `${view.cssW}px`;
    c.style.height = `${view.cssH}px`;
  }
  for (const c of [px, scratch, ...DEPTHS.map((d) => d.canvas)]) {
    c.width = view.w;
    c.height = view.h;
  }
  ui.width = Math.round(view.cssW * dpr);
  ui.height = Math.round(view.cssH * dpr);
  boards = layoutBoards(doors, "larshansen.dev");
  camera(0, true);
}

/**
 * Draws one pass of the scene onto a depth's canvas. Distant passes fade a little towards the
 * colour of the horizon, which keeps them calm behind the player. At dusk and night the pass is
 * darkened and then its own windows and lamps come on, before nearer things cover what they should.
 */
function pass(onto: CanvasRenderingContext2D, draw: () => void, haze = 0) {
  sg.globalCompositeOperation = "source-over";
  sg.clearRect(0, 0, view.w, view.h);
  target(sg);
  lights.length = 0;
  draw();
  if (haze > 0) {
    sg.globalCompositeOperation = "source-atop";
    sg.globalAlpha = haze;
    sg.fillStyle = horizonColor(sky.phase);
    sg.fillRect(0, 0, view.w, view.h);
    sg.globalAlpha = 1;
  }
  const tint = TINT[sky.phase];
  if (tint) {
    sg.globalCompositeOperation = "source-atop";
    sg.fillStyle = tint;
    sg.fillRect(0, 0, view.w, view.h);
    sg.globalCompositeOperation = "source-over";
    drawLights();
  }
  onto.drawImage(scratch, 0, 0);
}

/** Moves a canvas by what is left after drawing at whole art pixels, rounded to device pixels. */
function nudge(canvas: HTMLCanvasElement, fracX: number) {
  const toCss = (art: number) => Math.round(art * view.k) / view.dpr;
  canvas.style.transform = `translate3d(${-toCss(fracX)}px, ${-toCss(view.camYf - view.camY)}px, 0)`;
}

function render() {
  target(g);
  drawSky(sky, state.steps);
  nudge(px, 0);

  for (const d of DEPTHS) {
    d.g.clearRect(0, 0, view.w, view.h);
    const origin = layerOrigin(d.factor);
    nudge(d.canvas, origin - Math.floor(origin));
  }
  pass(depth(0.12).g, () => drawHills(sky), 0.35);
  pass(depth(0.2).g, () => drawFjord(state.steps), 0.35);
  pass(depth(0.25).g, () => drawGalgeberg(sky), 0.28);
  pass(depth(0.4).g, drawSkylineBlocks, 0.25);
  pass(depth(0.4).g, drawLandmarks, 0.18);
  pass(depth(0.7).g, () => drawTram(state.steps), 0.08);
  const street = depth(1).g;
  pass(street, () => drawRuins(sky), 0.12);
  pass(street, () => drawBuildings(doors, sky, state.steps));
  pass(street, () => {
    drawBoards(boards);
    drawTiles(sky);
    lightStreet();
  });
  target(street);
  for (const p of state.sparks) R(p.x, p.y, 1, 1, p.color);

  const door = state.mode === "play" ? doorAt(body, doors) : null;
  const age = state.banner ? state.steps - state.banner.since : 0;
  drawText({
    boards,
    fade: state.fade,
    snow: snowfall(sky, state.steps),
    player: { body: shown, walk: state.walk, alpha: state.alpha * (1 - state.fade), phase: sky.phase },
    hint: door && !touch ? { x: shown.x + PLAYER.w / 2, y: shown.y, text: `↑  ${door.soon ? t.locked : t.goIn}` } : null,
    bubble: state.bubble ? { x: state.bubble.door.x + state.bubble.door.w / 2, y: state.bubble.door.bottom - state.bubble.door.h, text: state.bubble.text } : null,
    banner: state.banner ? { title: state.banner.title, sub: state.banner.sub, alpha: view.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, age / 15, (165 - age) / 30)) } : null,
    highlight: state.highlight,
    steps: state.steps
  });

  enterButton.classList.toggle("show", !!door);
  if (state.moved && !help.hidden) help.hidden = true;
}

const stepper = createStepper(stepOnce);
let last = performance.now();
function frame(now: number) {
  const elapsed = Math.min(100, Math.max(0, now - last));
  last = now;
  stepper.advance(elapsed);
  const a = stepper.alpha();
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

Object.assign(shown, body);
new ResizeObserver(layout).observe(stage);
layout();
requestAnimationFrame((now) => {
  last = now;
  requestAnimationFrame(frame);
});

if (params.has("debug")) Object.assign(window, { __game: { body, shown, doors, state, view, input, step: stepOnce } });
