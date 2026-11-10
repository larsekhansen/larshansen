// Pure player physics: no Pixi, no DOM. Call `stepPlayer` at a fixed timestep.
import { PHYS } from "./level";

export interface Solid {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Only catches a body falling onto its top; can be jumped up through. */
  oneWay?: boolean;
  /** How far this solid moved during the current step (moving platforms). */
  dx?: number;
  dy?: number;
}

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  ground: Solid | null;
  coyote: number;
  buffer: number;
  airJumps: number;
  /** True while rising from a jump that can still be cut short. */
  cuttable: boolean;
}

export interface StepInput {
  /** -1..1 */
  move: number;
  jumpHeld: boolean;
  jumpPressed: boolean;
}

export interface StepEvents {
  jumped: boolean;
  doubleJumped: boolean;
  /** Downward speed at touchdown, or 0 if no landing this step. */
  landed: number;
}

export const createPlayer = (x: number, y: number, w: number, h: number): PlayerState => ({
  x,
  y,
  w,
  h,
  vx: 0,
  vy: 0,
  facing: 1,
  grounded: false,
  ground: null,
  coyote: 0,
  buffer: 0,
  airJumps: 1,
  cuttable: false
});

const approach = (v: number, target: number, amount: number) =>
  v < target ? Math.min(v + amount, target) : Math.max(v - amount, target);

export function stepPlayer(p: PlayerState, input: StepInput, solids: readonly Solid[], dt: number): StepEvents {
  const ev: StepEvents = { jumped: false, doubleJumped: false, landed: 0 };
  const wasGrounded = p.grounded;

  // Ride whatever we are standing on.
  if (p.ground) {
    p.x += p.ground.dx ?? 0;
    p.y += p.ground.dy ?? 0;
  }

  // Horizontal
  const move = Math.max(-1, Math.min(1, input.move));
  if (move !== 0) {
    p.vx = approach(p.vx, move * PHYS.runSpeed, (p.grounded ? PHYS.groundAccel : PHYS.airAccel) * dt);
    p.facing = move > 0 ? 1 : -1;
  } else {
    p.vx = approach(p.vx, 0, (p.grounded ? PHYS.friction : PHYS.airAccel * 0.5) * dt);
  }

  // Jumping: buffer + coyote time, one air jump, variable height
  p.buffer = input.jumpPressed ? PHYS.buffer : p.buffer - dt;
  p.coyote = p.grounded ? PHYS.coyote : p.coyote - dt;
  if (p.buffer > 0) {
    if (p.coyote > 0) {
      p.vy = -PHYS.jumpSpeed;
      ev.jumped = true;
    } else if (p.airJumps > 0) {
      p.vy = -PHYS.doubleJumpSpeed;
      p.airJumps--;
      ev.doubleJumped = true;
    }
    if (ev.jumped || ev.doubleJumped) {
      p.buffer = 0;
      p.coyote = 0;
      p.grounded = false;
      p.ground = null;
      p.cuttable = true;
    }
  }
  if (p.cuttable && p.vy < 0 && !input.jumpHeld) {
    p.vy *= PHYS.jumpCut;
    p.cuttable = false;
  }
  if (p.vy >= 0) p.cuttable = false;

  p.vy = Math.min(p.vy + PHYS.gravity * (p.vy > 0 ? PHYS.fallGravityMul : 1) * dt, PHYS.maxFall);

  // Move X, resolve against full solids
  p.x += p.vx * dt;
  for (const s of solids) {
    if (s.oneWay) continue;
    if (p.x < s.x + s.w && p.x + p.w > s.x && p.y < s.y + s.h && p.y + p.h > s.y) {
      if (p.vx > 0 || (p.vx === 0 && p.x + p.w / 2 < s.x + s.w / 2)) p.x = s.x - p.w;
      else p.x = s.x + s.w;
      p.vx = 0;
    }
  }

  // Move Y
  const prevBottom = p.y + p.h;
  const impact = p.vy;
  p.y += p.vy * dt;
  p.grounded = false;
  p.ground = null;
  for (const s of solids) {
    if (!(p.x < s.x + s.w && p.x + p.w > s.x && p.y < s.y + s.h && p.y + p.h > s.y)) continue;
    if (s.oneWay) {
      // Compare against where the top was before the platform moved this step.
      if (p.vy < 0 || prevBottom > s.y - (s.dy ?? 0) + 0.5) continue;
    }
    if (p.vy >= 0) {
      p.y = s.y - p.h;
      p.vy = 0;
      p.grounded = true;
      p.ground = s;
    } else {
      p.y = s.y + s.h;
      p.vy = 0;
      p.cuttable = false;
    }
  }

  if (p.grounded) {
    p.airJumps = 1;
    if (!wasGrounded) ev.landed = impact;
  }
  return ev;
}
