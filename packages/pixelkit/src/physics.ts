import { JUMP, LAUNCH, MOVE, PLAYER, TILE } from "./config";
import { keepsSpeed, surfaceSpeed, type Surface } from "./surface";

/** What the body moves through. The scene supplies it; the kit knows nothing about any one map. */
export interface World {
  /** World width in art pixels. */
  width: number;
  isSolid(c: number, r: number): boolean;
  isOneWay(c: number, r: number): boolean;
  rampAt(x: number): number | null;
}

export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  coyote: number;
  buffer: number;
  cutReady: boolean;
  /** Jumps left in the air. Refilled on the ground and by `bounce`; only spent when the ability is on. */
  airJumps: number;
  /** Thrown sideways by a launcher and not landed yet: keeps its speed, steered only gently. Absent on a body never launched. */
  launched?: boolean;
}

/** What the player wants this step. `jumpPressed` is true only on the step the key went down. */
export interface Intent {
  left: boolean;
  right: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;
}

export interface StepResult {
  jumped: boolean;
  /** Downward speed at the moment of landing, or 0 when the body did not land this step. */
  landed: number;
}

export function createBody(centerX: number, bottom: number): Body {
  return {
    x: centerX - PLAYER.w / 2,
    y: bottom - PLAYER.h,
    vx: 0,
    vy: 0,
    onGround: true,
    facing: 1,
    coyote: 0,
    buffer: 0,
    cutReady: false,
    airJumps: 0
  };
}

/** Puts the body standing still with its feet at (centerX, bottom). */
export function placeBody(b: Body, centerX: number, bottom: number) {
  Object.assign(b, { x: centerX - PLAYER.w / 2, y: bottom - PLAYER.h, vx: 0, vy: 0, onGround: true });
}

/** What the person can do beyond the front page's single jump. */
export interface Abilities {
  doubleJump?: boolean;
}

/** Throws the body up at `speed` (a trampoline, a sheep) and refills the jump in the air. */
export function bounce(b: Body, speed: number) {
  b.vy = -speed;
  b.onGround = false;
  b.coyote = 0;
  b.airJumps = 1;
  b.cutReady = false;
}

/**
 * Moving ground near the body this step: a one-way ledge `w` wide whose top left is at (x, y) after
 * this step's move, having moved by (dx, dy) in it. A ledge that is only sometimes there is one
 * with no move, passed only while it is there.
 */
export interface Carrier {
  x: number;
  y: number;
  w: number;
  dx: number;
  dy: number;
  /** Solid from below as well, this many pixels thick: he bumps his head on its underside. */
  under?: number;
}

/** What else holds the body this step, beyond the world's tiles. */
export interface Extra {
  carriers?: readonly Carrier[];
  /** The ground under his feet (centre x, feet y) when it is not plain ground: ice, an inrun, a belt. Null for plain ground. */
  surfaceAt?(x: number, y: number): Surface | null;
  /** A zone's push this step (see zone.ts): across, it moves him as moving ground does; down (+) or up, it adds to his falling speed. */
  push?: { x: number; y: number } | null;
}

/**
 * Throws the body: a cannon (up and sideways) or a drum (straight up). Thrown sideways, it keeps its
 * speed until it lands, even past a run, and the keys only lean on it.
 */
export function launch(b: Body, vx: number, vy: number) {
  b.vx = vx;
  b.vy = vy;
  b.onGround = false;
  b.coyote = 0;
  b.buffer = 0;
  b.cutReady = false;
  b.airJumps = 1;
  b.launched = vx !== 0;
}

/** One physics step at 60 steps per second. `extra` adds moving ground; without it nothing changes. */
export function stepBody(b: Body, intent: Intent, world: World, abilities?: Abilities, extra?: Extra): StepResult {
  const result: StepResult = { jumped: false, landed: 0 };
  const carriers = extra?.carriers;
  // Standing on moving ground: it takes him along before anything else happens.
  if (carriers && b.onGround) ride(b, carriers, world);
  if (b.onGround) b.airJumps = 1;
  // What he stands on as the step begins: plain ground, unless the scene says otherwise.
  const wasOnGround = b.onGround;
  const surface = b.onGround && extra?.surfaceAt ? extra.surfaceAt(b.x + PLAYER.w / 2, b.y + PLAYER.h) : null;

  b.buffer = intent.jumpPressed ? JUMP.bufferSteps : Math.max(0, b.buffer - 1);
  b.coyote = b.onGround ? JUMP.coyoteSteps : Math.max(0, b.coyote - 1);
  if (b.buffer > 0 && b.coyote > 0) {
    b.vy = -JUMP.speed;
    b.buffer = 0;
    b.coyote = 0;
    b.onGround = false;
    b.cutReady = true;
    result.jumped = true;
  } else if (abilities?.doubleJump && intent.jumpPressed && !b.onGround && b.coyote === 0 && b.airJumps > 0) {
    // The extra jump in the air, the same height as the first.
    b.vy = -JUMP.speed;
    b.airJumps--;
    b.buffer = 0;
    b.cutReady = true;
    result.jumped = true;
  }
  // Letting go early gives a short hop.
  if (b.cutReady && b.vy < 0 && !intent.jumpHeld) {
    b.vy *= JUMP.cut;
    b.cutReady = false;
  }
  if (b.vy >= 0) b.cutReady = false;

  const dir = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
  if (dir !== 0) b.facing = dir > 0 ? 1 : -1;
  if (b.launched) {
    // Thrown: the keys lean on the flight, but never speed it past what it has, or a run.
    const v = b.vx + dir * LAUNCH.steer;
    if (Math.abs(v) <= Math.max(Math.abs(b.vx), MOVE.run)) b.vx = v;
  } else if (surface && b.onGround) {
    b.vx = surfaceSpeed(b.vx, dir, surface);
  } else {
    const target = dir * MOVE.run;
    const accel = b.onGround ? (dir ? MOVE.accel : MOVE.decel) : MOVE.airAccel;
    b.vx = b.vx < target ? Math.min(target, b.vx + accel) : Math.max(target, b.vx - accel);
  }
  b.vy = Math.min(JUMP.maxFall, b.vy + (b.vy < 0 ? JUMP.gravityUp : JUMP.gravityDown));
  const push = extra?.push;
  if (push && push.y) b.vy = Math.max(-JUMP.speed, Math.min(JUMP.maxFall, b.vy + push.y));

  moveX(b, b.vx, world);
  if (push && push.x) moveX(b, push.x, world, true);
  result.landed = moveY(b, b.vy, world, carriers);
  // Off the ground faster than he can run (the lip of an inrun): the speed is kept in the air, as after a throw.
  if (wasOnGround && !b.onGround && keepsSpeed(b.vx)) b.launched = true;
  if (b.launched && b.onGround) b.launched = false;
  return result;
}

/**
 * One step of a dash: level flight at `speed` the way `dir` points, stopped by walls. Going up a
 * slope it rises onto it, so he never ends a dash inside a ramp. Returns false when a wall stopped him.
 * Gravity waits until the dash is over; the caller counts its steps.
 */
export function dashStep(b: Body, dir: 1 | -1, speed: number, world: World): boolean {
  const x0 = b.x;
  b.vx = dir * speed;
  b.vy = 0;
  b.onGround = false;
  b.coyote = 0;
  b.cutReady = false;
  b.launched = false;
  moveX(b, b.vx, world);
  const ramp = world.rampAt(b.x + PLAYER.w / 2);
  if (ramp !== null && ramp < b.y + PLAYER.h && b.y + PLAYER.h - ramp <= speed * 2 + 1) {
    b.y = ramp - PLAYER.h;
    b.onGround = true;
  }
  return Math.abs(b.x - x0) >= speed - 0.01;
}

/** If the body stands on a carrier where it was last step, moves the body with it. */
function ride(b: Body, carriers: readonly Carrier[], world: World) {
  const feet = b.y + PLAYER.h;
  for (const c of carriers) {
    const x0 = c.x - c.dx;
    if (Math.abs(feet - (c.y - c.dy)) > 0.01 || b.x + PLAYER.w <= x0 || b.x >= x0 + c.w) continue;
    if (c.dx) moveX(b, c.dx, world, true);
    if (c.dy) {
      b.y += c.dy;
      // Carried up into a ceiling: he stays under it, and the ground rises past him.
      const r = Math.floor(b.y / TILE);
      if (c.dy < 0)
        for (let col = Math.floor(b.x / TILE); col <= Math.floor((b.x + PLAYER.w - 0.01) / TILE); col++)
          if (world.isSolid(col, r)) {
            b.y = (r + 1) * TILE;
            break;
          }
    }
    return;
  }
}

/** Stops a rising body under a carrier that is solid from below, if its head was under it before. */
function bumpCarrier(b: Body, prevTop: number, carriers: readonly Carrier[]) {
  for (const c of carriers) {
    if (!c.under || b.x + PLAYER.w <= c.x || b.x >= c.x + c.w) continue;
    const under = c.y + c.under;
    if (prevTop >= Math.min(under, under - c.dy) - 0.01 && b.y < under && b.y + PLAYER.h > c.y) {
      b.y = under;
      b.vy = 0;
      return;
    }
  }
}

/** Lands a falling body on a carrier whose top it was above, before or after the carrier's move. */
function landOnCarrier(b: Body, prevBottom: number, carriers: readonly Carrier[]) {
  if (b.vy < 0) return;
  const bottom = b.y + PLAYER.h;
  for (const c of carriers) {
    if (b.x + PLAYER.w <= c.x || b.x >= c.x + c.w) continue;
    if (prevBottom <= Math.max(c.y, c.y - c.dy) + 0.01 && bottom >= c.y && (!b.onGround || c.y < bottom)) {
      b.y = c.y - PLAYER.h;
      b.vy = 0;
      b.onGround = true;
      return;
    }
  }
}

/** Moves sideways, stopping at walls and the ends of the world. `carried`: moved by the ground, so his own speed is kept. */
function moveX(b: Body, dx: number, world: World, carried = false) {
  b.x += dx;
  if (b.x < 0) {
    b.x = 0;
    if (!carried) b.vx = 0;
  }
  if (b.x + PLAYER.w > world.width) {
    b.x = world.width - PLAYER.w;
    if (!carried) b.vx = 0;
  }
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + PLAYER.h - 0.01) / TILE);
  if (dx > 0) {
    const c = Math.floor((b.x + PLAYER.w - 0.01) / TILE);
    for (let r = top; r <= bottom; r++)
      if (world.isSolid(c, r)) {
        b.x = c * TILE - PLAYER.w;
        if (!carried) b.vx = 0;
        break;
      }
  } else if (dx < 0) {
    const c = Math.floor(b.x / TILE);
    for (let r = top; r <= bottom; r++)
      if (world.isSolid(c, r)) {
        b.x = (c + 1) * TILE;
        if (!carried) b.vx = 0;
        break;
      }
  }
}

/** Moves vertically and returns the landing speed, or 0 when the body did not land. */
function moveY(b: Body, dy: number, world: World, carriers?: readonly Carrier[]): number {
  const prevBottom = b.y + PLAYER.h;
  const prevFoot = b.x + PLAYER.w / 2 - b.vx;
  const wasOnGround = b.onGround;
  const fall = b.vy;
  b.y += dy;
  b.onGround = false;

  const left = Math.floor(b.x / TILE);
  const right = Math.floor((b.x + PLAYER.w - 0.01) / TILE);
  if (dy > 0) {
    const r = Math.floor((b.y + PLAYER.h - 0.01) / TILE);
    for (let c = left; c <= right; c++) {
      // Awnings and ledges only hold you when you come down onto them from above.
      if (world.isSolid(c, r) || (world.isOneWay(c, r) && prevBottom <= r * TILE + 0.01)) {
        b.y = r * TILE - PLAYER.h;
        b.vy = 0;
        b.onGround = true;
        break;
      }
    }
  } else if (dy < 0) {
    const r = Math.floor(b.y / TILE);
    for (let c = left; c <= right; c++)
      if (world.isSolid(c, r)) {
        b.y = (r + 1) * TILE;
        b.vy = 0;
        break;
      }
    if (carriers) bumpCarrier(b, prevBottom - PLAYER.h, carriers);
  }

  if (carriers) landOnCarrier(b, prevBottom, carriers);

  // Slopes: land on them from above, walk up them, and stick to them on the way down.
  const foot = b.x + PLAYER.w / 2;
  const surface = world.rampAt(foot);
  if (surface !== null) {
    const bottom = b.y + PLAYER.h;
    const prevSurface = world.rampAt(prevFoot) ?? surface;
    const landing = b.vy >= 0 && prevBottom <= prevSurface + 0.5 && bottom >= surface;
    const walkingUp = wasOnGround && bottom >= surface && bottom - surface <= 4;
    const walkingDown = wasOnGround && bottom < surface && surface - bottom <= 3;
    if (landing || walkingUp || walkingDown) {
      b.y = surface - PLAYER.h;
      b.vy = 0;
      b.onGround = true;
    }
  }

  return b.onGround && !wasOnGround ? Math.max(fall, 0.01) : 0;
}
