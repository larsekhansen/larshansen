import { JUMP, MOVE, PLAYER, TILE } from "./config";

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

/** One physics step at 60 steps per second. */
export function stepBody(b: Body, intent: Intent, world: World, abilities?: Abilities): StepResult {
  const result: StepResult = { jumped: false, landed: 0 };
  if (b.onGround) b.airJumps = 1;

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
  const target = dir * MOVE.run;
  const accel = b.onGround ? (dir ? MOVE.accel : MOVE.decel) : MOVE.airAccel;
  b.vx = b.vx < target ? Math.min(target, b.vx + accel) : Math.max(target, b.vx - accel);
  b.vy = Math.min(JUMP.maxFall, b.vy + (b.vy < 0 ? JUMP.gravityUp : JUMP.gravityDown));

  moveX(b, b.vx, world);
  result.landed = moveY(b, b.vy, world);
  return result;
}

function moveX(b: Body, dx: number, world: World) {
  b.x += dx;
  if (b.x < 0) {
    b.x = 0;
    b.vx = 0;
  }
  if (b.x + PLAYER.w > world.width) {
    b.x = world.width - PLAYER.w;
    b.vx = 0;
  }
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + PLAYER.h - 0.01) / TILE);
  if (dx > 0) {
    const c = Math.floor((b.x + PLAYER.w - 0.01) / TILE);
    for (let r = top; r <= bottom; r++)
      if (world.isSolid(c, r)) {
        b.x = c * TILE - PLAYER.w;
        b.vx = 0;
        break;
      }
  } else if (dx < 0) {
    const c = Math.floor(b.x / TILE);
    for (let r = top; r <= bottom; r++)
      if (world.isSolid(c, r)) {
        b.x = (c + 1) * TILE;
        b.vx = 0;
        break;
      }
  }
}

/** Moves vertically and returns the landing speed, or 0 when the body did not land. */
function moveY(b: Body, dy: number, world: World): number {
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
  }

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
