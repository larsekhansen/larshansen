export class EventController {
  private keys: { [key: string]: boolean } = {};

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

  public isPressingJump(): boolean {
    return this.isKeyPressed("Space");
  }

  public isPressingRight(): boolean {
    return this.isKeyPressed("ArrowRight") || this.isKeyPressed("KeyD");
  }

  public isPressingLeft(): boolean {
    return this.isKeyPressed("ArrowLeft") || this.isKeyPressed("KeyA");
  }

  public cleanupEventListeners() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
