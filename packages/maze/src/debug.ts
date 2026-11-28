import { TILE } from "@larshansen/pixelkit/config";
import type { Input } from "@larshansen/pixelkit/input";
import { view } from "@larshansen/pixelkit/paint";
export { pretendSafe } from "@larshansen/pixelkit/safe";
import { createBot, playLevel, type Bot, type BotSpeed } from "./bot";
import type { createRecorder, saveGhost } from "./ghost";
import type { Maze, Steer } from "./scene";

// Checking aids for both pages that host the maze, under `?debug` only (order 36: the maze inside Vikingfjorden had no
// stepped harness of its own; the maze's own page had these in its main script). The viking page fetches this file
// only under `?debug`; the maze's own page imports it, as it imported the scripted player before.
//
// `records=demo` or `records=all` fills in made-up records, `ghost` records the scripted player's clear of the level as
// its ghost, `bot=keys` or `bot=pointer` (with `portals` to use teleport stones) or `walk=dx,dy` steers him while
// stepping, `at=c,r` puts him on a tile, `steps=N` runs N steps and draws one frame at once, `levels` opens the level list.

/**
 * The made-up records, the ghost and the steering the address asks for. The ghost's recorder is handed in from the scene's
 * module (which carries it), so this file shares no module with the scene at run time and the viking page's build splits
 * nothing off the scene's file for it.
 */
export function debugSteer(params: URLSearchParams, level: number, ghosts: { createRecorder: typeof createRecorder; saveGhost: typeof saveGhost }): Steer | undefined {
  // localStorage by its keys (`records.ts`'s), so this file shares no module with the scene but the rules and the ghost.
  const store = typeof localStorage === "undefined" ? null : localStorage;
  const records = params.get("records");
  if (records === "demo" || records === "all") {
    // "demo": the first four levels cleared, with some marks; "all": the first six, so clearing the last turns the feather gold.
    const demo: Record<number, { ms: number; deaths: number; par?: true }> = { 1: { ms: 21000, deaths: 0, par: true }, 2: { ms: 44000, deaths: 2 }, 3: { ms: 52000, deaths: 0 }, 4: { ms: 19000, deaths: 3 } };
    if (records === "all") Object.assign(demo, { 5: { ms: 40000, deaths: 1 }, 6: { ms: 30000, deaths: 0 } });
    store?.setItem("maze.records", JSON.stringify(demo));
    store?.setItem("maze.reached", records === "all" ? "7" : "5");
    store?.setItem("viking.feather", "1");
  }
  const portals = params.has("portals");
  if (params.has("ghost")) {
    const run = playLevel(level, (params.get("ghost") || "pointer") as BotSpeed, { portals });
    const rec = ghosts.createRecorder();
    for (const p of run.trail) rec.push(p.x, p.y);
    ghosts.saveGhost(level, rec.points(), store);
  }
  const speed = params.get("bot");
  if (speed === "finger") return finger(level, portals);
  if (speed === "keys" || speed === "pointer") {
    let bot: Bot | null = null;
    let at = 0;
    return {
      next(s) {
        if (s.level !== at) {
          bot = createBot(s.level, speed, { portals });
          at = s.level;
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

/** A steer that also moves him itself before each step, as a person would: `stepped` calls `drive` before every step. */
export interface Driver extends Steer {
  drive(maze: Maze, el: HTMLElement): void;
}

/**
 * `bot=finger` (order 36): the scripted player's moves at pointer speed, made by a finger on a touch screen. Before each step
 * it slides a touch (synthetic pointer events of pointerType "touch") across the stage by that move, in CSS pixels, and the
 * scene steers him from the finger as it would a person's: the same code, `onDown`, `onMove` and `steer()`. It writes on the
 * help line how the level went, so a picture of the stepped page says whether a finger can play it through.
 */
function finger(level: number, portals: boolean): Driver {
  const bot = createBot(level, "pointer", { portals });
  let down: { x: number; y: number } | null = null;
  let curses = 0;
  const fire = (el: HTMLElement, type: string, x: number, y: number) =>
    el.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true }));
  return {
    watch: true,
    next: (s) => bot.next(s),
    after(ev) {
      bot.after(ev);
      if (ev.cursed) curses++;
    },
    drive(maze, el) {
      const s = maze.state;
      if (s.level !== level) return;
      const help = document.getElementById("help");
      if (help) {
        help.hidden = false;
        help.textContent = `finger: level ${level} ${s.phase === "cleared" ? `cleared in ${s.steps} steps` : `not cleared (${s.steps} steps, ${s.phase})`}, ${curses} curses`;
      }
      if (s.phase !== "play") return;
      const r = el.getBoundingClientRect();
      const move = bot.next(s);
      const dx = (move.dx * view.k) / view.dpr;
      const dy = (move.dy * view.k) / view.dpr;
      // The finger is lifted and put down again in the middle before its slide would leave the screen (between steps, so
      // nothing of a slide is let go).
      if (down && (down.x + dx < r.left + 10 || down.x + dx > r.right - 10 || down.y + dy < r.top + 10 || down.y + dy > r.bottom - 10)) {
        fire(el, "pointerup", down.x, down.y);
        down = null;
      }
      if (!down) {
        down = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        fire(el, "pointerdown", down.x, down.y);
      }
      down.x += dx;
      down.y += dy;
      fire(el, "pointermove", down.x, down.y);
    }
  };
}

/**
 * `steps=N`: N steps now, then one frame drawn now, so a headless browser that never draws a frame of its own (Firefox
 * here) can photograph a real moment. `at=c,r` puts him on a tile first. Returns false when the address asks for none.
 * `stop` ends the stepping early (the maze's own page stops at its finish card); `beforeDraw` runs just before the frame.
 */
export function stepped(maze: Maze, params: URLSearchParams, input: Input, opts: { stop?: () => boolean; beforeDraw?: () => void; driver?: Steer; el?: HTMLElement } = {}): boolean {
  const at = params.get("at")?.split(",").map(Number);
  if (at && at.length === 2 && at.every(Number.isFinite)) Object.assign(maze.state, { x: at[0] * TILE + TILE / 2, y: at[1] * TILE + TILE / 2 });
  if (!params.has("steps")) return false;
  const steps = Math.max(0, Math.floor(Number(params.get("steps")) || 0));
  const driver = opts.driver && "drive" in opts.driver && opts.el ? (opts.driver as Driver) : null;
  for (let i = 0; i < steps && !opts.stop?.(); i++) {
    driver?.drive(maze, opts.el!);
    maze.step();
    input.endStep();
  }
  driver?.drive(maze, opts.el!);
  if (params.has("levels")) maze.levels.open();
  opts.beforeDraw?.();
  maze.render(0, 1000);
  // The raven's portraits come in a file of their own (order 48): a picture taken before they came is drawn again once they have.
  lastStepped = maze.talkReady() ? null : maze;
  return true;
}
/** A stepped maze drawn before the raven's portraits had come, to draw again when they have, before the picture is taken. */
let lastStepped: Maze | null = null;

/**
 * `perf` (with `steps`): draws the frame fifty times and writes on `line` how many rectangles, colours set and copies
 * one frame takes, and how long it took here, as the viking page's `?debug&perf` does for a level.
 */
export function perf(maze: Maze, line: HTMLElement, params?: URLSearchParams) {
  const proto = CanvasRenderingContext2D.prototype;
  const count = { fillRect: 0, drawImage: 0, fillStyle: 0 };
  const { fillRect, drawImage } = proto;
  const style = Object.getOwnPropertyDescriptor(proto, "fillStyle")!;
  proto.fillRect = function (...a) {
    count.fillRect++;
    return fillRect.apply(this, a);
  };
  proto.drawImage = function (this: CanvasRenderingContext2D, ...a: unknown[]) {
    count.drawImage++;
    return (drawImage as (...a: unknown[]) => void).apply(this, a);
  } as typeof drawImage;
  Object.defineProperty(proto, "fillStyle", {
    ...style,
    set(v) {
      count.fillStyle++;
      style.set!.call(this, v);
    }
  });
  const N = 50;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) maze.render(0, 0);
  const ms = (performance.now() - t0) / N;
  proto.fillRect = fillRect;
  proto.drawImage = drawImage;
  Object.defineProperty(proto, "fillStyle", style);
  line.textContent = `perf: ${Math.round(count.fillRect / N)} rects, ${Math.round(count.fillStyle / N)} colours, ${Math.round(count.drawImage / N)} images, ${ms.toFixed(1)} ms a frame.`;
  line.hidden = false;
  // `&post=<port>`: the line goes to a small server on this machine too, as the viking page's does (`tools/glance/perf.ts`).
  const port = params?.get("post");
  if (port) void fetch(`http://localhost:${port}/perf?name=${encodeURIComponent(location.search + location.hash)}`, { method: "POST", mode: "no-cors", headers: { "content-type": "text/plain" }, body: line.textContent });
}

/** Tells the frame round the page (`tools/shots.ts --wait`) that its picture is drawn. */
export function drawn() {
  const post = () => window.parent !== window && window.parent.postMessage("viking:drawn", "*");
  const m = lastStepped;
  lastStepped = null;
  if (!m) return void post();
  void m.whenTalkReady().then(() => (m.render(0, 1000), post()));
}
