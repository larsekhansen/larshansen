export class JumpController {
  private jumpForce = -20;
  private gravity = 3;
  private maxJumpHeight = 20;
  private currentJumpHeight = 0;
  private isJumpAllowed = true;
  private velocity = 0;
  private drag = 0.1;
  private maxFallSpeed = 20;

  constructor(options?: { jumpForce?: number; gravity?: number; maxJumpHeight?: number; drag?: number }) {
    Object.assign(this, options);
  }

  updateVelocityY(isJumpKeyPressed: boolean, isOnGround: boolean, delta: number): number {
    // Reset jump when landing
    if (isOnGround) {
      this.isJumpAllowed = true;
      this.currentJumpHeight = 0;
      if (!isJumpKeyPressed) this.velocity = 0;
    }

    // Initial jump and continuous rise
    if (isJumpKeyPressed && this.isJumpAllowed) {
      if (this.currentJumpHeight < this.maxJumpHeight) {
        this.velocity = this.jumpForce * delta * (1 - this.currentJumpHeight / this.maxJumpHeight);
        this.currentJumpHeight++;
      } else this.isJumpAllowed = false;
    } else this.isJumpAllowed = false;

    // Apply gravity and drag
    if (!isOnGround) {
      this.velocity += this.gravity * delta;
      this.velocity *= 1 - this.drag * delta;
    }

    // Clamp velocity
    this.velocity = Math.min(Math.max(this.velocity, this.jumpForce), this.maxFallSpeed);

    return this.velocity;
  }
}
