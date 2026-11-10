// Wires the pieces together: stage, loop, camera, doors, runes and the reward.
import { Application, Container, Graphics } from "pixi.js";
import { Sfx } from "./audio";
import { Input, type TouchButton } from "./input";
import {
  ALL_RUNES_MASK,
  BLOCKS,
  DOORS,
  GROUND_Y,
  KILL_Y,
  MIN_VIEW_W,
  PHYS,
  PLAYER_H,
  PLAYER_W,
  RUNES,
  SHEEP,
  SHIP,
  SIGNS,
  SPAWN,
  VIEW_H,
  WATER_Y,
  WORLD_W
} from "./level";
import { Particles, clamp, createTextures, lerp, lerpColor } from "./particles";
import { createPlayer, stepPlayer, type Solid } from "./physics";
import { createDoor, createRuneStone, createSheep, createShip, createSign, createTitle, drawBlock, type Door } from "./props";
import { createScenery } from "./scenery";
import { createViking } from "./viking";

export interface GameCallbacks {
  onRunes(mask: number, crowned: boolean): void;
  onNearDoor(id: string | null): void;
  onMuted(muted: boolean): void;
  /** The rune run: elapsed and best time in ms. Called about ten times a second while running. */
  onTime(ms: number, best: number | null, state: RunState): void;
}

export type RunState = "idle" | "running" | "done";

export interface GameHandle {
  destroy(): void;
  setTouch(button: TouchButton, down: boolean): void;
  toggleMute(): void;
  /** Start the rune run again: runes back, clock at zero, viking at the start. */
  restart(): void;
  /** Enter the door the player is standing at, if any. */
  enterNearest(): void;
}

const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* private mode: progress just is not remembered */
    }
  }
};

const FIREWORK_COLORS = [0xffd166, 0xff6b6b, 0x4cc9f0, 0x80ed99, 0xc77dff, 0xffffff];

export async function initGame(host: HTMLElement, cb: GameCallbacks): Promise<GameHandle> {
  const params = new URLSearchParams(window.location.search);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const month = new Date().getMonth();
  const winter = params.has("season") ? params.get("season") === "winter" : month >= 10 || month <= 2;

  const app = new Application();
  await app.init({
    resizeTo: window,
    background: 0x0f1a3c,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    preference: "webgl"
  });
  app.canvas.setAttribute("role", "img");
  app.canvas.setAttribute("aria-label", "A small platform game: find the runes, or walk the viking to a door to open one of the links above.");
  host.appendChild(app.canvas);

  const tex = createTextures(app.renderer.name === "canvas" ? "normal" : "add");
  const input = new Input();
  const sfx = new Sfx(store.get("viking.muted") === "1");
  cb.onMuted(sfx.muted);

  // --- Scene graph -------------------------------------------------------
  const root = new Container();
  const world = new Container();
  const scenery = createScenery(tex, { winter, reducedMotion });
  const fade = new Graphics().rect(0, 0, 10, 10).fill(0x0b1026);
  fade.alpha = 0;
  fade.eventMode = "none";
  const shipLayer = new Container(); // behind the nearest waves so the hull sits in the water
  root.addChild(scenery.back, shipLayer, scenery.water, world, scenery.front, fade);
  app.stage.addChild(root);

  world.addChild(createTitle(360, 190, RUNES.map((r) => r.char)));
  BLOCKS.forEach((b, i) => world.addChild(drawBlock(b, winter, i + 1)));
  SIGNS.forEach((s) => world.addChild(createSign(s.x, s.y, s.lines)));

  const doors = DOORS.map((d) => createDoor(d, tex));
  doors.forEach((d) => {
    if (coarse) d.setPrompt("Tap to enter");
    d.view.on("pointertap", () => enter(d));
    world.addChild(d.view);
  });

  const ship = createShip(SHIP.w);
  const shipSolid: Solid = { x: SHIP.minX, y: SHIP.y, w: SHIP.w, h: 12, oneWay: true, dx: 0, dy: 0 };
  let shipDir = 1;
  shipLayer.addChild(ship.view);

  const flock = SHEEP.map((s) => createSheep(s.minX, s.maxX, GROUND_Y));
  flock.forEach((s) => world.addChild(s.view));

  const runes = RUNES.map((r) => createRuneStone(r.char, r.x, r.y, tex));
  runes.forEach((r) => world.addChild(r.view));

  const viking = createViking();
  const particles = new Particles(tex);
  world.addChild(viking.view, particles.view);

  const terrain: Solid[] = BLOCKS.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h, oneWay: b.kind === "island" }));
  const safeGround = new Set(terrain.filter((s) => !s.oneWay));
  const solids = [...terrain, shipSolid];

  // --- State --------------------------------------------------------------
  const startX = import.meta.env.DEV && params.has("x") ? Number(params.get("x")) : SPAWN.x;
  const p = createPlayer(startX, SPAWN.y - (startX === SPAWN.x ? 0 : 320), PLAYER_W, PLAYER_H);
  let lastSafe = { x: SPAWN.x, y: SPAWN.y };
  let time = 0;
  let acc = 0;
  let pendingJump = false;
  let camX = 0;
  let camReady = false;
  let look = 0;
  let shake = 0;
  let runDust = 0;
  let inWater = false;
  let blinkT = 0;
  let nearDoor: Door | null = null;
  let entering: { door: Door; t: number; left: boolean } | null = null;
  let fireworks = 0;
  let fireworkTimer = 0;
  let hourOffset = 0;
  let hourTarget = 0;
  const fixedHour = params.has("hour") ? Number(params.get("hour")) : null;

  let crowned = store.get("viking.crowned") === "1";
  // A run is all ten runes from a fresh start, against the clock. The clock starts on the first move.
  let mask = 0;
  let run: RunState = "idle";
  let runMs = 0;
  let timeEmit = 0;
  const storedBest = Number(store.get("viking.best"));
  let best: number | null = storedBest > 0 ? storedBest : null;
  cb.onTime(0, best, run);
  viking.setCrowned(crowned);
  runes.forEach((r, i) => {
    r.collected = (mask & (1 << i)) !== 0;
    r.view.visible = !r.collected;
  });
  cb.onRunes(mask, crowned);

  const toggleMute = () => {
    sfx.muted = !sfx.muted;
    store.set("viking.muted", sfx.muted ? "1" : null);
    cb.onMuted(sfx.muted);
  };

  function enter(door: Door) {
    if (entering) return;
    sfx.unlock();
    sfx.play("door");
    door.open();
    entering = { door, t: 0, left: false };
  }

  // Coming back with the browser's back button restores the page mid-fade.
  const onPageShow = () => {
    entering?.door.reset();
    entering = null;
    fade.alpha = 0;
    viking.view.alpha = 1;
  };
  window.addEventListener("pageshow", onPageShow);

  const dust = (x: number, y: number, count: number, speed: number) =>
    particles.burst(
      { x, y, life: 0.45, size: 5, endSize: 12, color: winter ? 0xffffff : 0xd9c7a8, alpha: 0.6, gravity: -40, drag: 3 },
      count,
      speed,
      Math.PI,
      -Math.PI / 2
    );

  const collect = (i: number) => {
    const r = runes[i];
    r.collected = true;
    r.view.visible = false;
    mask |= 1 << i;
    const count = runes.filter((x) => x.collected).length;
    sfx.play("rune", count - 1);
    particles.burst({ x: r.x, y: r.y, life: 0.7, size: 16, endSize: 2, color: 0xffd166, glow: true, gravity: 200, drag: 2 }, 16, 220);
    if (mask === ALL_RUNES_MASK) {
      crowned = true;
      store.set("viking.crowned", "1");
      run = "done";
      if (best === null || runMs < best) {
        best = Math.round(runMs);
        store.set("viking.best", String(best));
      }
      cb.onTime(runMs, best, run);
      viking.setCrowned(true);
      viking.squash(1.4);
      sfx.play("fanfare");
      fireworks = 6;
    }
    cb.onRunes(mask, crowned);
  };

  /** Back to the start with every rune in place and the clock at zero. */
  const restart = () => {
    mask = 0;
    run = "idle";
    runMs = 0;
    fireworks = 0;
    runes.forEach((r) => {
      r.collected = false;
      r.view.visible = true;
    });
    Object.assign(p, createPlayer(SPAWN.x, SPAWN.y, PLAYER_W, PLAYER_H));
    lastSafe = { x: SPAWN.x, y: SPAWN.y };
    inWater = false;
    camReady = false;
    cb.onRunes(mask, crowned);
    cb.onTime(0, best, run);
  };

  // --- Fixed-step simulation ------------------------------------------------
  const step = (dt: number, move: number, jumpHeld: boolean, jumpPressed: boolean) => {
    // Longship ferry
    const prevX = shipSolid.x;
    const prevY = shipSolid.y;
    shipSolid.x += shipDir * SHIP.speed * dt;
    if (shipSolid.x >= SHIP.maxX) shipDir = -1;
    else if (shipSolid.x <= SHIP.minX) shipDir = 1;
    shipSolid.x = clamp(shipSolid.x, SHIP.minX, SHIP.maxX);
    shipSolid.y = SHIP.y + (reducedMotion ? 0 : Math.sin(time * 1.5) * 1.5);
    shipSolid.dx = shipSolid.x - prevX;
    shipSolid.dy = shipSolid.y - prevY;

    const ev = stepPlayer(p, { move, jumpHeld, jumpPressed }, solids, dt);
    if (p.x < 0 || p.x > WORLD_W - p.w) {
      p.x = clamp(p.x, 0, WORLD_W - p.w);
      p.vx = 0;
    }
    const cx = p.x + p.w / 2;
    const feet = p.y + p.h;

    if (ev.jumped) {
      sfx.play("jump");
      viking.squash(1.3);
      dust(cx, feet, 5, 90);
    }
    if (ev.doubleJumped) {
      sfx.play("doubleJump");
      viking.squash(1.25);
      particles.burst({ x: cx, y: feet, life: 0.35, size: 6, endSize: 1, color: 0xffffff, alpha: 0.9, drag: 4 }, 12, 200);
    }
    if (ev.landed > 260) {
      viking.squash(clamp(1 - ev.landed / 1800, 0.6, 0.9));
      dust(cx, feet, 7, 130);
      sfx.play("land");
      if (ev.landed > 780) shake = 0.22;
    }

    if (p.grounded && p.ground && safeGround.has(p.ground) && p.x > p.ground.x + 12 && p.x + p.w < p.ground.x + p.ground.w - 12) {
      lastSafe = { x: p.x, y: p.y };
    }

    // Sheep are trampolines.
    for (const s of flock) {
      const top = s.y - s.h;
      if (p.vy > 0 && feet > top && feet < top + 18 && cx > s.x - s.w / 2 - 8 && cx < s.x + s.w / 2 + 8) {
        p.vy = -840;
        p.airJumps = 1;
        p.cuttable = false;
        p.grounded = false;
        p.ground = null;
        s.bounce();
        viking.squash(1.35);
        sfx.play("sheep");
        particles.burst({ x: s.x, y: top + 6, life: 0.6, size: 8, endSize: 3, color: 0xfaf7f0, gravity: 300, drag: 2 }, 8, 160);
      }
    }

    // The fjord: a splash, then back to the last solid ground.
    if (!inWater && feet > WATER_Y + 14 && p.vy > 0) {
      inWater = true;
      sfx.play("splash");
      particles.burst({ x: cx, y: WATER_Y + 4, life: 0.8, size: 7, endSize: 2, color: 0xcfeaff, alpha: 0.9, gravity: 900 }, 22, 380, Math.PI * 0.7);
    }
    if (p.y > KILL_Y) {
      p.x = lastSafe.x;
      p.y = lastSafe.y - 4;
      p.vx = p.vy = 0;
      inWater = false;
      blinkT = 1.2;
      camReady = reducedMotion ? false : camReady;
    }

    runes.forEach((r, i) => {
      // Generous box test: a rune at head height is picked up just by walking through it.
      if (!r.collected && Math.abs(cx - r.x) < 30 && Math.abs(p.y + p.h / 2 - r.y) < 46) collect(i);
    });
  };

  // --- Frame ---------------------------------------------------------------
  app.ticker.add((ticker) => {
    const dt = Math.min(ticker.deltaMS / 1000, 0.05);
    time += dt;

    // Layout: 600 units tall, but never narrower than MIN_VIEW_W.
    const sw = app.screen.width;
    const sh = app.screen.height;
    const scale = Math.min(sh / VIEW_H, sw / MIN_VIEW_W);
    const viewW = sw / scale;
    const viewH = sh / scale;
    root.scale.set(scale);

    const inp = input.poll();
    if (inp.any) sfx.unlock();
    if (inp.mutePressed) toggleMute();
    if (inp.timePressed) hourTarget += 2;
    if (inp.restartPressed && !entering) restart();
    if (run === "idle" && !entering && (inp.move !== 0 || inp.jumpPressed)) run = "running";
    if (run === "running") {
      runMs += dt * 1000;
      timeEmit -= dt;
      if (timeEmit <= 0) {
        timeEmit = 0.1;
        cb.onTime(runMs, best, run);
      }
    }
    hourOffset = lerp(hourOffset, hourTarget, Math.min(1, dt * 3));

    const cx0 = p.x + p.w / 2;
    const found = entering
      ? null
      : (doors.find((d) => Math.abs(cx0 - d.def.x) < 44 && Math.abs(p.y + p.h - d.def.y) < 24) ?? null);
    if (found !== nearDoor) {
      nearDoor?.setNear(false);
      found?.setNear(true);
      nearDoor = found;
      cb.onNearDoor(found?.def.id ?? null);
    }

    let move = inp.move;
    let jumpHeld = inp.jumpHeld;
    if (nearDoor && inp.interactPressed) {
      enter(nearDoor);
      inp.jumpPressed = false;
    }
    if (entering) {
      // Walk him through the door, fade, then leave.
      entering.t += dt;
      const dx = entering.door.def.x - cx0;
      move = Math.abs(dx) > 6 ? Math.sign(dx) * Math.min(1, Math.abs(dx) / 40 + 0.3) : 0;
      jumpHeld = false;
      inp.jumpPressed = false;
      viking.view.alpha = clamp(1 - (entering.t - 0.3) / 0.3, 0, 1);
      fade.alpha = clamp((entering.t - 0.35) / 0.45, 0, 1);
      if (entering.t > 0.9 && !entering.left) {
        entering.left = true;
        window.location.assign(entering.door.def.href);
      }
    }

    pendingJump ||= inp.jumpPressed;
    acc += dt;
    while (acc >= PHYS.step) {
      step(PHYS.step, move, jumpHeld, pendingJump);
      pendingJump = false;
      acc -= PHYS.step;
    }

    const cx = p.x + p.w / 2;
    const feet = p.y + p.h;

    if (p.grounded && Math.abs(p.vx) > 200) {
      runDust -= dt;
      if (runDust <= 0) {
        runDust = 0.11;
        dust(cx - p.facing * 8, feet, 1, 40);
      }
    }

    // Camera: follow with a little look-ahead, clamped to the world.
    look = lerp(look, p.facing * 70, Math.min(1, dt * 2));
    const target = viewW >= WORLD_W ? (WORLD_W - viewW) / 2 : clamp(cx - viewW / 2 + look, 0, WORLD_W - viewW);
    camX = camReady ? lerp(camX, target, 1 - Math.exp(-dt * 7)) : target;
    camReady = true;
    shake = Math.max(0, shake - dt);
    const sx = reducedMotion ? 0 : (Math.random() - 0.5) * shake * 40;
    const sy = reducedMotion ? 0 : (Math.random() - 0.5) * shake * 40;
    world.position.set(-camX + sx, viewH - VIEW_H + sy);
    shipLayer.position.copyFrom(world.position);

    const now = new Date();
    const hour = (fixedHour ?? now.getHours() + now.getMinutes() / 60) + hourOffset;
    scenery.update({ dt, time, camX, viewW, viewH, hour, aurora: crowned });
    world.tint = shipLayer.tint = lerpColor(scenery.ambient, 0xffffff, 0.4);

    viking.view.position.set(cx, feet);
    viking.update(dt, time, p);
    if (blinkT > 0 && !entering) {
      blinkT -= dt;
      viking.view.alpha = blinkT > 0 && Math.floor(blinkT * 12) % 2 ? 0.35 : 1;
    }
    ship.view.position.set(shipSolid.x, shipSolid.y);
    ship.update(reducedMotion ? 0 : time);
    doors.forEach((d) => d.update(dt, time));
    flock.forEach((s) => s.update(dt, time));
    runes.forEach((r) => r.update(time));

    if (fireworks > 0) {
      fireworks -= dt;
      fireworkTimer -= dt;
      if (fireworkTimer <= 0) {
        fireworkTimer = reducedMotion ? 0.9 : 0.22;
        const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        particles.burst(
          { x: camX + viewW * (0.15 + Math.random() * 0.7), y: 60 + Math.random() * 240, life: 1.1, size: 14, endSize: 3, color, glow: true, gravity: 160, drag: 1.6 },
          26,
          300
        );
      }
    }
    particles.update(dt);

    fade.width = viewW;
    fade.height = viewH;
  });

  // Dev-only handle for poking at the game from the console.
  if (import.meta.env.DEV) Object.assign(window, { __game: { app, player: p, root } });

  return {
    destroy() {
      window.removeEventListener("pageshow", onPageShow);
      input.destroy();
      sfx.destroy();
      app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
    },
    setTouch: (button, down) => {
      if (down) sfx.unlock();
      input.setTouch(button, down);
    },
    toggleMute,
    restart: () => {
      if (!entering) restart();
    },
    enterNearest() {
      if (nearDoor) enter(nearDoor);
    }
  };
}
