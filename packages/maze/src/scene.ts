import { STEP_MS, TILE } from "@larshansen/pixelkit/config";
import type { Input } from "@larshansen/pixelkit/input";
import type { Lang } from "@larshansen/pixelkit/i18n";
import { S, target, view } from "@larshansen/pixelkit/paint";
import type { Sfx } from "@larshansen/pixelkit/sfx";
import type { Stage } from "@larshansen/pixelkit/stage";
import { bubble, fontPx, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";
import { createFx } from "./fx";
import { createRecorder, ghostAt, loadGhost, saveGhost, type GhostPoints } from "./ghost";
import { strings } from "./i18n";
import { COLS, LEVELS, ROWS, centreOf, finishOf, mapInfo, portalAt } from "./levels";
import { createLevelCard, createLevelPanel, type Cleared } from "./panel";
import { betterFeather, browserStore, featherWon, loadFeather, loadRecords, loadReached, marksOf, recordClear, saveFeather, saveReached, type Feather, type Marks, type Records } from "./records";
import { FLASH, VOID, drawBright, drawDark, drawGhost, drawHim, drawWorld, ravenAnchor, type Frame } from "./render";
import { CURSE_STEPS, SPEED, gateProgress, levelDef, limit, newState, onStartPad, snakeAt, snakeHeading, snakeFlat, stepMaze, type Intent, type MazeEvents, type MazeState } from "./rules";

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
  /**
   * He walked out. `cleared` is true when the last level was cleared this visit; `feather` says
   * which feather this visit newly won ("plain" after level 3, "gold" after all seven), if any.
   */
  onLeave(result: { cleared: boolean; feather?: Feather | null }): void;
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
  /**
   * What the header shows: where he is, the clock, the curses, the best time for this level so far
   * (null if none), and its par, all in milliseconds.
   */
  hud(): { level: number; of: number; name: string; ms: number; deaths: number; best: number | null; par: number };
  /** Starts a level he has reached (1 to the furthest). Returns false if it is not open to him yet. */
  select(level: number): boolean;
  /** The highest level he has entered. */
  reached(): number;
  /** The level list, opened from the level label in the header. */
  readonly levels: { toggle(): void; open(): void; close(): void; readonly isOpen: boolean };
  /** The rules' state, the same object for the whole visit (for checking). */
  readonly state: MazeState;
}

/** Something that steers him in place of the visitor: the scripted player, for checking. */
export interface Steer {
  next(state: MazeState): Intent;
  after(ev: MazeEvents): void;
}

/** How long the raven's lines stay up, in steps. A start line stays until a second after he first moves, if that is later. */
const START_STEPS = 240;
const LINE_STEPS = 180;
const AFTER_MOVE_STEPS = 60;
/** Steps the world stands still when the curse takes him, before it plays out. */
const FREEZE_STEPS = 6;
/** Steps between stepping into the finish and the card, so the doorway's flare is seen. */
const CARD_DELAY = 24;
/** Steps the card is up before a key or tap moves on, so a held key does not skip it. */
const CARD_HOLD = 20;
/** Steps of fading out after the card, before the next level. */
const FADE_OUT = 20;

export function createMaze(host: MazeHost, opts?: { level?: number; steer?: Steer }): Maze {
  const { stage, input, sfx, el } = host;
  const t = strings(host.lang);
  const of = LEVELS.length;
  const store = browserStore();
  let reached = loadReached(of);
  let records: Records = loadRecords();
  let held = loadFeather();
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
  let fade = 1;
  let fading: "in" | null = "in";
  let words: { text: string; since: number; until: number; start: boolean } | null = null;
  /** The step of his first move in this level, for how long a start line stays. */
  let movedAt: number | null = null;
  /** The world stands still for a few steps when the curse takes him. */
  let freeze = 0;
  /** True once the last level has been cleared in this visit. */
  let clearedLast = false;
  /** The best feather won in this visit. */
  let won: Feather | null = null;
  /** After a clear: when the card is due, and when it was shown; then the fade out to the next level. */
  let done: { at: number; card: Cleared; shown: number | null } | null = null;
  let leaving: number | null = null;
  /** The ghost of the best run on this level, and the run being recorded. */
  let ghost: GhostPoints | null = loadGhost(first, store);
  let ghostHeading = { x: 1, y: 0 };
  const rec = createRecorder();
  /** Teleport stones say something the first time they send him on a level. */
  let toldTeleport = false;

  // Moments that flare, by the tick they began.
  const fx = createFx();
  let portalFlash: { pair: number; at: number } | null = null;
  const stoneFlash = new Map<number, number>();
  let keyAt: number | null = null;
  let finishAt: number | null = null;

  // Steering. The mouse gives a target in the world, a finger gives a pile of movement to spend.
  let target_: { x: number; y: number } | null = null;
  let finger: { id: number; x: number; y: number } | null = null;
  const pending = { x: 0, y: 0 };
  let shift = false;

  const cam = { x: 0, y: 0, set: false };

  function speak(text: string, kind: "start" | "line" | "stay" = "line") {
    words = { text, since: tick, until: kind === "stay" ? Infinity : tick + (kind === "start" ? START_STEPS : LINE_STEPS), start: kind === "start" };
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
    freeze = 0;
    done = null;
    leaving = null;
    card.hide();
    fx.clear();
    portalFlash = null;
    stoneFlash.clear();
    keyAt = finishAt = null;
    toldTeleport = false;
    ghost = loadGhost(level, store);
    rec.reset();
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
    if (cardReady()) return next();
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
      return leave();
    }
    if ((e.code === "Enter" || e.code === "NumpadEnter") && cardReady() && !(e.target instanceof Element && e.target.closest("a, button"))) return next();
    // The keys 1 to 7 jump to a level he has reached.
    const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
    if (digit && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target instanceof Element && e.target.closest("input, textarea, select"))) select(Number(digit[1]));
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

  /**
   * A level can be picked once he has reached it, cleared it, or cleared the one before. (`reached`
   * goes back to 1 after the last level, but the levels he has cleared stay open, for their marks.)
   */
  const isOpen = (n: number) => n >= 1 && n <= of && (n <= reached || !!records[n] || !!records[n - 1]);

  const panel = createLevelPanel(el, {
    t,
    names: LEVELS.map((l) => l.name),
    pars: LEVELS.map((l) => l.par),
    current: () => state.level,
    open: isOpen,
    records: () => records,
    pick: (n) => select(n)
  });
  const card = createLevelCard(el, t, { next: () => next(), leave: () => leave() });

  /** Starts a level that is open to him, from the beginning. */
  function select(level: number): boolean {
    if (left || !Number.isInteger(level) || !isOpen(level)) return false;
    panel.close();
    loadLevel(level);
    return true;
  }

  function leave() {
    if (left) return;
    left = true;
    card.hide();
    host.onLeave({ cleared: clearedLast, feather: won });
  }

  /** True while the card after a level is up and has been for long enough to be read. */
  const cardReady = () => !!done && done.shown !== null && tick - done.shown >= CARD_HOLD && leaving === null;

  /** From the card: on to the next level, or out after the last. */
  function next() {
    if (!done || leaving !== null) return;
    card.hide();
    if (done.card.last) return leave();
    leaving = tick;
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

  /** One step of the rules, recorded for the ghost from his first move to the clear. */
  function rules(intent: Intent) {
    const wasCleared = state.phase === "cleared";
    const ev = stepMaze(state, intent);
    opts?.steer?.after(ev);
    if (state.started && !wasCleared) rec.push(state.x, state.y);
    react(ev);
  }

  function step() {
    prev = { x: state.x, y: state.y };
    if (panel.isOpen) return; // the level list holds the game still
    fx.step();
    if (freeze > 0) {
      freeze--;
      return;
    }
    tick++;
    if (gateSoundAt >= 0 && tick >= gateSoundAt) {
      gateSoundAt = -1;
      sfx.play("gate");
    }
    if (hissCool > 0) hissCool--;
    if (fading === "in" && (fade = Math.max(0, fade - 1 / 24)) === 0) fading = null;

    if (done) {
      // A cleared level: the doorway flares, the card comes up, then a fade to the next.
      if (done.shown === null && tick >= done.at) {
        done.shown = tick;
        card.show(done.card);
      }
      if (cardReady() && (["enter", "jump", "up", "down", "left", "right"] as const).some((a) => input.pressed(a))) next();
      if (leaving !== null) {
        fade = Math.min(1, (tick - leaving) / FADE_OUT);
        if (tick - leaving >= FADE_OUT) return loadLevel(state.level + 1);
      }
      rules({ dx: 0, dy: 0 });
      return;
    }

    if (state.phase === "play") {
      // Leaving: up or enter on the first level's start pad, before the first move.
      if (state.level === 1 && !state.started && onStartPad(state) && (input.pressed("enter") || input.pressed("up")) && !opts?.steer) return leave();
      const intent = opts?.steer ? opts.steer.next(state) : steer();
      const moved = intent.dx !== 0 || intent.dy !== 0;
      if (moved) heading = { x: intent.dx, y: intent.dy };
      walk = moved ? walk + 1 : 0;
      if (walk > 0 && walk % 14 === 7) sfx.play("step");
      // Dust at his feet, kicked up behind him.
      if (walk > 0 && walk % 9 === 4) fx.burst("dust", state.x - Math.sign(heading.x) * 2, state.y - Math.sign(heading.y) * 2 + 2, tick, { x: -heading.x, y: -heading.y });
      rules(intent);
      if (state.started && movedAt === null) movedAt = tick;
    } else {
      walk = 0;
      rules({ dx: 0, dy: 0 });
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
  }

  function react(ev: MazeEvents) {
    if (ev.cursed) {
      sfx.play("curse");
      clearSteering();
      speak(cursedLine());
      fx.burst("curse", state.x, state.y, tick * 31 + state.deaths);
      if (!view.reduced) freeze = FREEZE_STEPS;
    }
    if (ev.key) {
      sfx.play("pickup");
      gateSoundAt = tick + 14;
      speak(t.key);
      keyAt = tick;
      const k = mapInfo(levelDef(state.level).map).key;
      if (k) fx.burst("key", k.c * TILE + 7, k.r * TILE + 7, tick);
    }
    if (ev.fell) sfx.play("land");
    if (ev.lit !== undefined) {
      sfx.play("stone");
      speak(t.stone);
      stoneFlash.set(ev.lit, tick);
      const s = state.stones[ev.lit];
      fx.burst("stone", s.c * TILE + 8, s.r * TILE + 6, tick + ev.lit);
    }
    if (ev.teleported) {
      sfx.play("teleport");
      const map = levelDef(state.level).map;
      portalFlash = { pair: portalAt(map, ev.teleported.to.c, ev.teleported.to.r)?.pair ?? 0, at: tick };
      for (const end of [ev.teleported.from, ev.teleported.to]) {
        const c = centreOf(end.c, end.r);
        fx.burst("teleport", c.x, c.y, tick + end.c * 7 + end.r);
      }
      prev = { x: state.x, y: state.y }; // no smear across the jump
      cam.set = false; // and the camera is with him at once
      clearSteering();
      if (!toldTeleport) {
        toldTeleport = true;
        speak(t.teleport);
      }
    }
    if (ev.cleared) cleared();
  }

  /** He stepped into the finish: the records, the marks, the ghost, the feather, and the card. */
  function cleared() {
    const level = state.level;
    const ms = state.steps * STEP_MS;
    const parMs = levelDef(level).par * 1000;
    const before = records[level];
    const old = marksOf(before, parMs);
    records = recordClear(level, ms, state.deaths, store, parMs);
    const now = marksOf(records[level], parMs);
    const best = !before || ms < before.ms;
    // The ghost is the best run's; a level cleared before there were ghosts gets this run's until one beats it.
    if ((best || !ghost) && rec.length) saveGhost(level, rec.points(), store);

    const prize = featherWon(level, records, held, of);
    let line = "";
    if (prize) {
      saveFeather(prize, store);
      held = { plain: true, gold: held.gold || prize === "gold" };
      won = betterFeather(won, prize);
      if (prize === "gold") line = host.standalone ? t.featherGoldStandalone : t.featherGold;
      else line = host.standalone ? t.endStandalone : t.feather;
    } else if (level === of) line = t.endAgain;
    if (level === of) {
      clearedLast = true;
      // The whole mound is done: the next visit starts at the first level again.
      reached = 1;
      saveReached(1);
    }

    sfx.play("door");
    if (prize || level === of) sfx.play("fanfare");
    host.say(t.cleared(level));
    if (line) speak(line, "stay");
    finishAt = tick;
    const f = finishOf(levelDef(level).map);
    fx.burst("finish", (f.c + 1) * TILE, (f.r + 1) * TILE, tick);
    done = {
      at: tick + CARD_DELAY,
      shown: null,
      card: { level, name: levelDef(level).name, ms, deaths: state.deaths, parMs, best, marks: now, fresh: now.map((m, i) => m && !old[i]) as Marks, line, last: level === of }
    };
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

  /** Steps since a moment began, while it is still within `steps`; null otherwise. */
  const since = (at: number | null, steps: number) => (at !== null && tick - at < steps ? tick - at : null);

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
    const flashes = new Map<number, number>();
    for (const [i, at] of stoneFlash) if (tick - at < FLASH.stone) flashes.set(i, tick - at);
    const pf = since(portalFlash?.at ?? null, FLASH.portal);
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
      crumble: state.crumble,
      portalCool: state.portalCool,
      portalFlash: pf !== null && portalFlash ? { pair: portalFlash.pair, age: pf } : null,
      stoneFlash: flashes,
      keyFly: since(keyAt, FLASH.key),
      finishFlash: since(finishAt, FLASH.finish)
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
    fx.draw();
    drawDark(frame);

    // The sharp canvas: the ghost, him, the raven's words, the fade.
    const u = textCtx();
    u.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    u.clearRect(0, 0, view.cssW, view.cssH);
    u.textAlign = "center";
    u.textBaseline = "middle";
    if (ghost && state.started && !done) {
      const k = state.steps;
      const gi = Math.max(0, k - 1);
      const g = ghostAt(ghost, gi, k === 0 ? 0 : alpha);
      if (g) {
        const a = ghostAt(ghost, gi);
        const b = ghostAt(ghost, gi + 1);
        const moving = !!a && !!b && (a.x !== b.x || a.y !== b.y);
        if (moving && a && b && Math.hypot(b.x - a.x, b.y - a.y) < 3) ghostHeading = { x: b.x - a.x, y: b.y - a.y };
        drawGhost(g.x, g.y, moving ? k + 7 : 0, ghostHeading);
      }
    }
    drawHim(x, y, walk, heading, state.phase === "cursed", 1, tick);
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
      card.destroy();
      rec.drop();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
      el.style.touchAction = touchAction;
    },
    hud: () => ({
      level: state.level,
      of,
      name: levelDef(state.level).name,
      ms: state.steps * STEP_MS,
      deaths: state.deaths,
      best: records[state.level]?.ms ?? null,
      par: levelDef(state.level).par * 1000
    }),
    select,
    reached: () => reached,
    levels: panel,
    state
  };
}
