import { Graphics } from "pixi.js";

export class EventController {
  private keys: { [key: string]: boolean } = {};
  private isOnGround = true;
  private readonly MOVE_SPEED = 10;

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public isKeyPressed(code: string): boolean {
    return !!this.keys[code];
  }

  public set isGrounded(state: boolean) {
    this.isOnGround = state;
  }

  public get isGrounded(): boolean {
    return this.isOnGround;
  }

  public get moveSpeed(): number {
    return this.MOVE_SPEED;
  }

  public cleanup() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  public isColliding(a: Graphics, b: Graphics): boolean {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }
}
