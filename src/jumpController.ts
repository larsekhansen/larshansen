export class JumpController {
  private jumpForce = -20;
  private gravity = 2;
  private maxJumpHeight = 15;
  private currentJumpHeight = 0;
  private isJumpAllowed = true;
  private velocity = 0;
  private drag = 0.1;

  constructor(options?: {
    jumpForce?: number;
    gravity?: number;
    maxJumpHeight?: number;
    drag?: number;
  }) {
    Object.assign(this, options);
  }

  update(isJumpKeyPressed: boolean, isOnGround: boolean): number {
    // Reset jump when landing
    if (isOnGround) {
      this.isJumpAllowed = true;
      this.currentJumpHeight = 0;
      if (!isJumpKeyPressed) this.velocity = 0;
    }

    // Initial jump and continuous rise
    if (isJumpKeyPressed && this.isJumpAllowed) {
      if (this.currentJumpHeight < this.maxJumpHeight) {
        this.velocity =
          this.jumpForce * (1 - this.currentJumpHeight / this.maxJumpHeight);
        this.currentJumpHeight++;
      } else {
        this.isJumpAllowed = false;
      }
    } else {
      this.isJumpAllowed = false;
    }

    // Apply gravity and drag
    if (!isOnGround) {
      this.velocity += this.gravity;
      this.velocity *= 1 - this.drag;
    }

    // Clamp velocity
    this.velocity = Math.min(Math.max(this.velocity, -20), 20);

    return this.velocity;
  }

  reset() {
    this.currentJumpHeight = 0;
    this.isJumpAllowed = true;
    this.velocity = 0;
  }
}
