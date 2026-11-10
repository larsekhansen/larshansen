import { STEP_MS } from "@larshansen/pixelkit/config";
import type { Input } from "@larshansen/pixelkit/input";
import type { Lang } from "@larshansen/pixelkit/i18n";
import { S, target, view } from "@larshansen/pixelkit/paint";
import type { Sfx } from "@larshansen/pixelkit/sfx";
import type { Stage } from "@larshansen/pixelkit/stage";
import { bubble, fontPx, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";
import { strings } from "./i18n";
import { COLS, LEVELS, ROWS, TILE } from "./levels";
import { createLevelPanel } from "./panel";
import { loadRecords, loadReached, recordClear, saveReached, type Records } from "./records";
import { VOID, drawBright, drawDark, drawHim, drawWorld, ravenAnchor, type Frame } from "./render";
import { CURSE_STEPS, SPEED, gateProgress, levelDef, limit, newState, onStartPad, snakeAt, snakeHeading, snakeFlat, stepMaze, type MazeState } from "./rules";

// The maze as a scene. The host page owns the canvases, the loop and the header; this wires the
// rules, the steering, the drawing and the sound, and is driven by `step` and `render`.

export interface MazeHost {
  stage: Stage;
  input: Input;
  sfx: Sfx;
  lang: Lang;
  /** The stage element, for pointer events. */
  el: HTMLElement;
  /** Aria-live announcer. */
  say(text: string): void;
  /** He walked out, or cleared the last level. */
  onLeave(result: { cleared: boolean }): void;
  /** Height of the fixed header bar in art pixels: the camera keeps him clear of it. */
  topInset?(): number;
  /** True on the maze's own page, where the feather cannot be kept for the fjord. */
  standalone?: boolean;
}

export interface Maze {
  /** One physics step, 60 per second. */
  step(): void;
  render(alpha: number, elapsedMs: number): void;
  resize(): void;
  /** Removes its listeners. */
  destroy(): void;
  /** What the header shows: where he is, the clock, the curses, and the best time for this level so far (null if none). */
  hud(): { level: number; of: number; name: string; ms: number; deaths: number; best: number | null };
  /** Starts a level he has reached (1 to the furthest). Returns false if it is not open to him yet. */
  select(level: number): boolean;
  /** The highest level he has entered. */
  reached(): number;
  /** The level list, opened from the level label in the header. */
  readonly levels: { toggle(): void; open(): void; close(): void; readonly isOpen: boolean };
  /** The rules' state, the same object for the whole visit (for checking). */
  readonly state: MazeState;
}

const FEATHER_KEY = "viking.feather";
/** How long the raven's lines stay up, in steps. A start line stays until a second after he first moves, if that is later. */
const START_STEPS = 240;
const LINE_STEPS = 180;
const AFTER_MOVE_STEPS = 60;

export function createMaze(host: MazeHost, opts?: { level?: number }): Maze {
  const { stage, input, sfx, el } = host;
  const t = strings(host.lang);
  const of = LEVELS.length;
  let reached = loadReached(of);
  let records: Records = loadRecords();
  const first = Math.max(1, Math.min(of, Math.round(opts?.level ?? reached)));
  const state = newState(first);
  if (first > reached) reached = first;
  saveReached(reached);
  /** The step on which the gate's sound plays, a moment after the key's. */
  let gateSoundAt = -1;

  let tick = 0;
  let prev = { x: state.x, y: state.y };
  let walk = 0;
  let heading = { x: 1, y: 0 };
  let hissCool = 0;
  let left = false;
  let ending: { since: number; dismissed: boolean } | null = null;
  let fade = 1;
  let fading: "in" | null = "in";
  let words: { text: string; since: number; until: number; start: boolean } | null = null;
  /** The step of his first move in this level, for how long a start line stays. */
  let movedAt: number | null = null;

  // Steering. The mouse gives a target in the world, a finger gives a pile of movement to spend.
  let target_: { x: number; y: number } | null = null;
  let finger: { id: number; x: number; y: number } | null = null;
  const pending = { x: 0, y: 0 };
  let shift = false;

  const cam = { x: 0, y: 0, set: false };

  function speak(text: string, kind: "start" | "line" = "line") {
    words = { text, since: tick, until: tick + (kind === "start" ? START_STEPS : LINE_STEPS), start: kind === "start" };
    host.say(text);
  }

  /** Is the raven's line still up? A start line stays at least until a second after his first move. */
  function wordsShown() {
    if (!words) return false;
    const until = words.start && movedAt !== null ? Math.max(words.until, movedAt + AFTER_MOVE_STEPS) : words.until;
    return tick < until;
  }

  function startLine(level: number) {
    return [t.start1, t.start2, t.start3, t.start4, t.start5, t.start6, t.start7][level - 1];
  }

  function cursedLine() {
    switch (state.level) {
      case 1:
        return t.curse1;
      case 3:
        return t.curse3;
      case 4:
        return state.cause === "pit" ? t.curse4Pit : t.curse2Wall;
      case 5:
        return t.curse5;
      case 6:
        return t.curse1;
      case 7:
        return t.curse7;
      default:
        return state.cause === "snake" ? t.curse2Snake : t.curse2Wall;
    }
  }

  function clearSteering() {
    target_ = null;
    pending.x = pending.y = 0;
  }

  function loadLevel(level: number) {
    if (level > reached) {
      reached = level;
      saveReached(reached);
    }
    gateSoundAt = -1;
    Object.assign(state, newState(level, 0));
    prev = { x: state.x, y: state.y };
    clearSteering();
    walk = 0;
    cam.set = false;
    fade = 1;
    fading = "in";
    speak(startLine(level), "start");
    movedAt = null;
  }

  // --- pointer ---------------------------------------------------------------------------------
  const toArt = (css: number) => (css * view.dpr) / view.k;
  function world(e: PointerEvent) {
    const rect = el.getBoundingClientRect();
    return { x: toArt(e.clientX - rect.left) + view.camXf, y: toArt(e.clientY - rect.top) + view.camYf };
  }
  const onDown = (e: PointerEvent) => {
    if (ending) ending.dismissed = true;
    if (e.pointerType === "touch") {
      finger = { id: e.pointerId, x: e.clientX, y: e.clientY };
      return;
    }
    target_ = world(e);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") {
      if (!finger || finger.id !== e.pointerId) return;
      pending.x += toArt(e.clientX - finger.x);
      pending.y += toArt(e.clientY - finger.y);
      finger.x = e.clientX;
      finger.y = e.clientY;
      return;
    }
    target_ = world(e);
  };
  const onUp = (e: PointerEvent) => {
    if (finger && finger.id === e.pointerId) {
      finger = null;
      pending.x = pending.y = 0; // what is left of the drag is let go
    }
  };
  const onKey = (e: KeyboardEvent) => {
    shift = e.shiftKey;
    if (e.type !== "keydown") return;
    if (e.code === "Escape") {
      if (panel.isOpen) return panel.close();
      return leave(false);
    }
    // The keys 1 to 7 jump to a level he has reached.
    const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
    if (digit && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !ending && !(e.target instanceof Element && e.target.closest("input, textarea, select"))) {
      if (select(Number(digit[1]))) return;
    }
    if (ending && !e.repeat) ending.dismissed = true;
  };
  const onBlur = () => (shift = false);
  const touchAction = el.style.touchAction;
  el.style.touchAction = "none";
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
  window.addEventListener("blur", onBlur);

  const panel = createLevelPanel(el, {
    t,
    names: LEVELS.map((l) => l.name),
    current: () => state.level,
    reached: () => reached,
    records: () => records,
    pick: (n) => select(n)
  });

  /** Starts a level he has reached, from the beginning. */
  function select(level: number): boolean {
    if (ending || !Number.isInteger(level) || level < 1 || level > Math.min(of, reached)) return false;
    panel.close();
    loadLevel(level);
    return true;
  }

  function leave(cleared: boolean) {
    if (left) return;
    left = true;
    host.onLeave({ cleared });
  }

  // --- one step --------------------------------------------------------------------------------
  /** What he wants to move by this step, from whichever way of steering is in use. */
  function steer(): { dx: number; dy: number } {
    const h = input.held;
    const ix = (h.right ? 1 : 0) - (h.left ? 1 : 0);
    const iy = (h.down ? 1 : 0) - (h.up ? 1 : 0);
    const careful = shift || h.jump;
    if (ix || iy) {
      target_ = null; // the keys take over until the pointer moves again
      pending.x = pending.y = 0;
      const max = careful ? SPEED.careful : SPEED.keys;
      return limit(ix * max, iy * max, max);
    }
    const max = careful ? SPEED.careful : SPEED.pointer;
    if (pending.x || pending.y) {
      const m = limit(pending.x, pending.y, max);
      pending.x -= m.dx;
      pending.y -= m.dy;
      return m;
    }
    if (target_) {
      const vx = target_.x - state.x;
      const vy = target_.y - state.y;
      const dist = Math.hypot(vx, vy);
      if (dist <= 0.5) return { dx: 0, dy: 0 };
      return limit(vx, vy, Math.min(max, dist));
    }
    return { dx: 0, dy: 0 };
  }

  function step() {
    prev = { x: state.x, y: state.y };
    if (panel.isOpen) return; // the level list holds the game still
    tick++;
    if (gateSoundAt >= 0 && tick >= gateSoundAt) {
      gateSoundAt = -1;
      sfx.play("gate");
    }
    if (hissCool > 0) hissCool--;
    if (fading === "in" && (fade = Math.max(0, fade - 1 / 24)) === 0) fading = null;

    if (ending) {
      if (ending.dismissed && tick - ending.since > 30) leave(true);
      return;
    }

    if (state.phase === "play") {
      // Leaving: up or enter on the first level's start pad, before the first move.
      if (state.level === 1 && !state.started && onStartPad(state) && (input.pressed("enter") || input.pressed("up"))) return leave(false);
      const intent = state.phase === "play" ? steer() : { dx: 0, dy: 0 };
      const moved = intent.dx !== 0 || intent.dy !== 0;
      if (moved) heading = { x: intent.dx, y: intent.dy };
      walk = moved ? walk + 1 : 0;
      if (walk > 0 && walk % 14 === 7) sfx.play("step");
      react(stepMaze(state, intent));
      if (state.started && movedAt === null) movedAt = tick;
    } else {
      walk = 0;
      react(stepMaze(state, { dx: 0, dy: 0 }));
    }

    if (state.phase === "play" && hissCool === 0)
      for (const s of state.snakes) {
        const c = snakeAt(s.def, s.t);
        if (Math.hypot(c.x - state.x, c.y - state.y) < 40) {
          sfx.play("hiss");
          hissCool = 90;
          break;
        }
      }

    // A cleared level fades out and the next begins; the last one ends with the feather.
    if (state.phase === "cleared" && !ending) {
      fade = Math.min(1, Math.max(fade, (state.phaseSteps - 10) / 30));
      if (state.phaseSteps >= 40) {
        if (state.level < of) loadLevel(state.level + 1);
        else finish();
      }
    }
  }

  function react(ev: ReturnType<typeof stepMaze>) {
    if (ev.cursed) {
      sfx.play("curse");
      clearSteering();
      speak(cursedLine());
    }
    if (ev.key) {
      sfx.play("pickup");
      gateSoundAt = tick + 14;
      speak(t.key);
    }
    if (ev.fell) sfx.play("land");
    if (ev.lit !== undefined) {
      sfx.play("stone");
      speak(t.stone);
    }
    if (ev.cleared) {
      records = recordClear(state.level, state.steps * STEP_MS, state.deaths);
      sfx.play("door");
      host.say(t.cleared(state.level));
    }
  }

  function finish() {
    // The whole mound is done: the next visit starts at the first level again.
    reached = 1;
    saveReached(1);
    try {
      localStorage.setItem(FEATHER_KEY, "1");
    } catch {
      // the feather is kept for this visit only
    }
    sfx.play("fanfare");
    fade = 0;
    ending = { since: tick, dismissed: false };
    speak(host.standalone ? t.endStandalone : t.end);
    words!.until = Infinity;
  }

  // --- drawing ---------------------------------------------------------------------------------
  const inset = () => host.topInset?.() ?? 0;

  function aim(elapsedMs: number, x: number, y: number) {
    const bar = inset();
    const mapW = COLS * TILE;
    const mapH = ROWS * TILE;
    const wantX = view.w >= mapW ? (mapW - view.w) / 2 : Math.max(0, Math.min(mapW - view.w, x - view.w / 2));
    const below = view.h - bar; // what the header bar leaves of the screen
    const wantY = below >= mapH ? -bar - (below - mapH) / 2 : Math.max(-bar, Math.min(mapH - view.h, y - (bar + below / 2)));
    if (!cam.set) {
      cam.x = wantX;
      cam.y = wantY;
      cam.set = true;
    } else {
      const k = 1 - Math.exp(-elapsedMs / 130);
      cam.x += (wantX - cam.x) * k;
      cam.y += (wantY - cam.y) * k;
    }
  }

  function render(alpha: number, elapsedMs: number) {
    const x = prev.x + (state.x - prev.x) * alpha;
    const y = prev.y + (state.y - prev.y) * alpha;
    aim(elapsedMs, x, y);
    // The screen shakes one pixel while the curse has him, unless motion is reduced.
    const shake = state.phase === "cursed" && !view.reduced ? (Math.floor(tick / 2) % 2 ? 1 : -1) : 0;
    view.camXf = cam.x + shake;
    view.camYf = cam.y;
    view.camX = Math.floor(view.camXf);
    view.camY = Math.floor(view.camYf);

    const time = tick + alpha;
    const frame: Frame = {
      level: state.level,
      t: Math.floor(time),
      x,
      y,
      stones: state.stones,
      snakes: state.snakes.map((s) => {
        const at = snakeAt(s.def, s.t + alpha);
        const flat = snakeFlat(s.def);
        return { x: at.x, y: at.y, flat, dir: snakeHeading(s.def, s.t) };
      }),
      cursed: state.phase === "cursed",
      clock: state.steps,
      keyTaken: state.keyTaken,
      gate: gateProgress(state),
      crumble: state.crumble
    };

    target(stage.g);
    S(0, 0, view.w, view.h, VOID);
    stage.nudge(stage.px, 0);
    for (const d of stage.depths) {
      d.g.clearRect(0, 0, view.w, view.h);
      stage.nudge(d.canvas, view.camXf - view.camX);
    }
    const street = stage.depth(1);
    stage.pass(street, () => drawWorld(frame), "night");
    target(street);
    drawBright(frame);
    drawDark(frame);

    // The sharp canvas: him, the raven's words, the fade.
    const u = textCtx();
    u.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    u.clearRect(0, 0, view.cssW, view.cssH);
    u.textAlign = "center";
    u.textBaseline = "middle";
    drawHim(x, y, walk, heading, state.phase === "cursed");
    if (wordsShown() && words) {
      const a = ravenAnchor(state.level);
      const n = unit();
      const h = Math.max(24, fontPx() + 12);
      const top = inset() * n + h + 8;
      const bx = sx(a.x);
      const by = sy(a.y) - 4;
      // Over the raven's head while it is in view; otherwise small, at the top left under the header.
      if (by >= top && bx > 20 && bx < view.cssW - 20 && by < view.cssH) bubble(bx, by, words.text);
      else bubble(8, top, words.text, "left");
    } else if (!wordsShown()) words = null;
    if (state.phase === "cursed" && !view.reduced) {
      // A rust-red frame round the whole view that fades as the curse runs out.
      const n = unit();
      u.fillStyle = `rgba(200, 64, 43, ${(0.85 * (1 - state.phaseSteps / CURSE_STEPS)).toFixed(3)})`;
      u.fillRect(0, 0, view.cssW, n);
      u.fillRect(0, view.cssH - n, view.cssW, n);
      u.fillRect(0, 0, n, view.cssH);
      u.fillRect(view.cssW - n, 0, n, view.cssH);
    }
    if (fade > 0) {
      u.fillStyle = `rgba(5, 5, 12, ${Math.min(1, fade).toFixed(3)})`;
      u.fillRect(0, 0, view.cssW, view.cssH);
    }
  }

  speak(startLine(state.level), "start");

  return {
    step,
    render,
    resize() {
      cam.set = false;
    },
    destroy() {
      panel.destroy();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
      el.style.touchAction = touchAction;
    },
    hud: () => ({ level: state.level, of, name: levelDef(state.level).name, ms: state.steps * STEP_MS, deaths: state.deaths, best: records[state.level]?.ms ?? null }),
    select,
    reached: () => reached,
    levels: panel,
    state
  };
}
