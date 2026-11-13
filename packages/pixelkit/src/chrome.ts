import type { Sfx } from "./sfx";

/**
 * The mute button of the header bar, and the M key. The button is plain markup in the page (an icon
 * button with class `tool`); this gives it its label, its pressed state and its work. The choice is
 * the shared one in `sfx`, so it holds on every page of the site.
 */
export function wireMute(button: HTMLButtonElement, sfx: Sfx, words: { on: string; off: string }) {
  function label() {
    const text = sfx.muted ? words.on : words.off;
    button.setAttribute("aria-pressed", String(sfx.muted));
    button.setAttribute("aria-label", text);
    button.title = `${text} (M)`;
  }
  function toggle() {
    sfx.toggleMute();
    label();
  }
  button.addEventListener("click", () => {
    toggle();
    button.blur(); // give the keyboard back to the game
  });
  window.addEventListener("keydown", (e) => {
    if (e.code !== "KeyM" || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest("a, button, input, textarea, select")) return;
    toggle();
  });
  label();
}
