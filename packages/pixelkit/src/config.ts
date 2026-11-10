// Tuning for the game. Distances are world pixels, speeds are per physics step,
// and physics always runs at 60 steps per second, whatever the screen's refresh rate.

export const TILE = 16;
export const STEPS_PER_SECOND = 60;
export const STEP_MS = 1000 / STEPS_PER_SECOND;

export const PLAYER = { w: 10, h: 14 };

export const MOVE = {
  run: 1.6, // top speed
  accel: 0.22, // on the ground, pressing a direction
  decel: 0.32, // on the ground, letting go
  airAccel: 0.14
};

export const JUMP = {
  speed: 5, // upward speed at take-off, about 46 px high when held
  gravityUp: 0.26,
  gravityDown: 0.42,
  cut: 0.45, // share of the speed kept when the key is let go early
  maxFall: 5.5,
  coyoteSteps: 6, // a jump still works this long after walking off an edge
  bufferSteps: 6 // a jump pressed this long before landing still happens
};
