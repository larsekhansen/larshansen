import { JUMP, MOVE, PLAYER, TILE } from "./config";
import { WORLD_W, isOneWay, isSolid, rampAt } from "./level";

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
    cutReady: false
  };
}

/** One physics step at 60 steps per second. */
export function stepBody(b: Body, intent: Intent): StepResult {
  const result: StepResult = { jumped: false, landed: 0 };

  b.buffer = intent.jumpPressed ? JUMP.bufferSteps : Math.max(0, b.buffer - 1);
  b.coyote = b.onGround ? JUMP.coyoteSteps : Math.max(0, b.coyote - 1);
  if (b.buffer > 0 && b.coyote > 0) {
    b.vy = -JUMP.speed;
    b.buffer = 0;
    b.coyote = 0;
    b.onGround = false;
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

  moveX(b, b.vx);
  result.landed = moveY(b, b.vy);
  return result;
}

function moveX(b: Body, dx: number) {
  b.x += dx;
  if (b.x < 0) {
    b.x = 0;
    b.vx = 0;
  }
  if (b.x + PLAYER.w > WORLD_W) {
    b.x = WORLD_W - PLAYER.w;
    b.vx = 0;
  }
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + PLAYER.h - 0.01) / TILE);
  if (dx > 0) {
    const c = Math.floor((b.x + PLAYER.w - 0.01) / TILE);
    for (let r = top; r <= bottom; r++)
      if (isSolid(c, r)) {
        b.x = c * TILE - PLAYER.w;
        b.vx = 0;
        break;
      }
  } else if (dx < 0) {
    const c = Math.floor(b.x / TILE);
    for (let r = top; r <= bottom; r++)
      if (isSolid(c, r)) {
        b.x = (c + 1) * TILE;
        b.vx = 0;
        break;
      }
  }
}

/** Moves vertically and returns the landing speed, or 0 when the body did not land. */
function moveY(b: Body, dy: number): number {
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
      if (isSolid(c, r) || (isOneWay(c, r) && prevBottom <= r * TILE + 0.01)) {
        b.y = r * TILE - PLAYER.h;
        b.vy = 0;
        b.onGround = true;
        break;
      }
    }
  } else if (dy < 0) {
    const r = Math.floor(b.y / TILE);
    for (let c = left; c <= right; c++)
      if (isSolid(c, r)) {
        b.y = (r + 1) * TILE;
        b.vy = 0;
        break;
      }
  }

  // Slopes: land on them from above, walk up them, and stick to them on the way down.
  const foot = b.x + PLAYER.w / 2;
  const surface = rampAt(foot);
  if (surface !== null) {
    const bottom = b.y + PLAYER.h;
    const prevSurface = rampAt(prevFoot) ?? surface;
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
