// Keyboard and touch buttons feed the same actions, so the game never asks where input came from.

export type Action = "left" | "right" | "jump" | "up" | "enter";

const KEYS: Record<string, Action> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  KeyZ: "jump",
  KeyK: "jump",
  ArrowUp: "up",
  KeyW: "up"
};

export interface Input {
  held: Record<Action, boolean>;
  /** True if the action started since the last physics step. */
  pressed(action: Action): boolean;
  press(action: Action): void;
  hold(action: Action, down: boolean): void;
  endStep(): void;
  clear(): void;
}

export function createInput(): Input {
  const held: Record<Action, boolean> = { left: false, right: false, jump: false, up: false, enter: false };
  const started = new Set<Action>();

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
    }
  };

  window.addEventListener("keydown", (e) => {
    const a = KEYS[e.code];
    if (!a || e.metaKey || e.ctrlKey || e.altKey) return;
    // A focused link or button keeps Space for itself.
    const t = e.target as HTMLElement | null;
    if (e.code === "Space" && t?.closest("a, button, input, textarea, select")) return;
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
