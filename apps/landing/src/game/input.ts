// Keyboard, touch and gamepad folded into one per-frame snapshot.

export type TouchButton = "left" | "right" | "jump";

export interface InputFrame {
  move: number;
  jumpHeld: boolean;
  jumpPressed: boolean;
  interactPressed: boolean;
  mutePressed: boolean;
  timePressed: boolean;
  /** True on the first frame with any input at all (used to unlock audio). */
  any: boolean;
}

const JUMP = ["Space", "KeyW", "ArrowUp"];
const INTERACT = ["ArrowUp", "KeyW", "Enter", "KeyE"];
const LEFT = ["ArrowLeft", "KeyA"];
const RIGHT = ["ArrowRight", "KeyD"];
const HANDLED = new Set([...JUMP, ...INTERACT, ...LEFT, ...RIGHT, "ArrowDown", "KeyM", "KeyT"]);

export class Input {
  private keys = new Set<string>();
  private pressed = new Set<string>();
  private touch: Record<TouchButton, boolean> = { left: false, right: false, jump: false };
  private touchJumpPressed = false;
  private padJump = false;
  private padInteract = false;

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.release);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Leave focused links and buttons alone so the HTML nav stays keyboard-usable.
    if (e.target instanceof Element && e.target.closest("a,button,input,textarea,select")) return;
    if (!HANDLED.has(e.code)) return;
    e.preventDefault();
    if (!e.repeat) this.pressed.add(e.code);
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private release = () => {
    this.keys.clear();
    this.pressed.clear();
    this.touch = { left: false, right: false, jump: false };
  };

  setTouch(button: TouchButton, down: boolean) {
    if (button === "jump" && down && !this.touch.jump) this.touchJumpPressed = true;
    this.touch[button] = down;
  }

  private has = (codes: string[], set: Set<string>) => codes.some((c) => set.has(c));

  /** Read and clear this frame's edge-triggered state. */
  poll(): InputFrame {
    let move = 0;
    if (this.has(LEFT, this.keys) || this.touch.left) move -= 1;
    if (this.has(RIGHT, this.keys) || this.touch.right) move += 1;
    let jumpHeld = this.has(JUMP, this.keys) || this.touch.jump;
    let jumpPressed = this.has(JUMP, this.pressed) || this.touchJumpPressed;
    let interactPressed = this.has(INTERACT, this.pressed);

    const pad = navigator.getGamepads?.().find((g) => g?.connected);
    if (pad) {
      const axis = pad.axes[0] ?? 0;
      if (Math.abs(axis) > 0.3) move = axis;
      if (pad.buttons[14]?.pressed) move = -1;
      if (pad.buttons[15]?.pressed) move = 1;
      const a = !!pad.buttons[0]?.pressed;
      const x = !!pad.buttons[2]?.pressed || !!pad.buttons[12]?.pressed;
      jumpHeld ||= a;
      jumpPressed ||= a && !this.padJump;
      interactPressed ||= x && !this.padInteract;
      this.padJump = a;
      this.padInteract = x;
    }

    const frame: InputFrame = {
      move,
      jumpHeld,
      jumpPressed,
      interactPressed,
      mutePressed: this.pressed.has("KeyM"),
      timePressed: this.pressed.has("KeyT"),
      any: move !== 0 || jumpPressed || interactPressed || this.pressed.size > 0
    };
    this.pressed.clear();
    this.touchJumpPressed = false;
    return frame;
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.release);
  }
}
