// Keyboard and touch buttons feed the same actions, so the game never asks where input came from.

export type Action = "left" | "right" | "jump" | "up" | "down" | "enter";

const KEYS: Record<string, Action> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  KeyZ: "jump",
  KeyK: "jump",
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down"
};

export interface Input {
  held: Record<Action, boolean>;
  /** True if the action started since the last physics step. */
  pressed(action: Action): boolean;
  press(action: Action): void;
  hold(action: Action, down: boolean): void;
  endStep(): void;
  clear(): void;
  /** Reads a connected gamepad. Call once per physics step. */
  pollPad(): void;
}

export function createInput(): Input {
  const held: Record<Action, boolean> = { left: false, right: false, jump: false, up: false, down: false, enter: false };
  const started = new Set<Action>();
  // What the gamepad held last step, kept apart so it never lets go of a key the keyboard holds.
  const padHeld: Partial<Record<Action, boolean>> = {};

  const input: Input = {
    held,
    pressed: (a) => started.has(a),
    press: (a) => void started.add(a),
    hold: (a, down) => {
      if (down && !held[a]) started.add(a);
      held[a] = down;
    },
    endStep: () => started.clear(),
    clear: () => {
      (Object.keys(held) as Action[]).forEach((a) => (held[a] = false));
      started.clear();
    },
    pollPad: () => {
      const pad = navigator.getGamepads?.().find((p) => p?.connected);
      if (!pad) return;
      const axis = pad.axes[0] ?? 0;
      const now: Partial<Record<Action, boolean>> = {
        left: axis < -0.35 || !!pad.buttons[14]?.pressed,
        right: axis > 0.35 || !!pad.buttons[15]?.pressed,
        jump: !!pad.buttons[0]?.pressed,
        up: !!pad.buttons[12]?.pressed || !!pad.buttons[2]?.pressed,
        down: !!pad.buttons[13]?.pressed
      };
      for (const a of Object.keys(now) as Action[]) {
        if (!!padHeld[a] !== now[a]) input.hold(a, !!now[a]);
        padHeld[a] = now[a];
      }
    }
  };

  window.addEventListener("keydown", (e) => {
    const a = KEYS[e.code];
    if (!a || e.metaKey || e.ctrlKey || e.altKey) return;
    // A focused link or button keeps Space for itself.
    const t = e.target instanceof Element ? e.target.closest("a, button, input, textarea, select") : null;
    if (e.code === "Space" && t) return;
    e.preventDefault(); // no page scrolling while playing
    if (!e.repeat) started.add(a);
    held[a] = true;
  });
  window.addEventListener("keyup", (e) => {
    const a = KEYS[e.code];
    if (a) held[a] = false;
  });
  // Keys let go on another page or in another window would otherwise stay held.
  window.addEventListener("blur", input.clear);
  window.addEventListener("pageshow", input.clear);
  document.addEventListener("visibilitychange", () => document.hidden && input.clear());

  return input;
}
