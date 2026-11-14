import type { Progress } from "./game/progress";
import { ORDER } from "./levels/index";

// What only `?debug` needs, fetched when it is asked for: no visitor's first script carries it.

/** Under ?debug an error shows on the help line, so a headless screenshot says what went wrong. */
export function showErrors(help: HTMLElement) {
  for (const ev of ["error", "unhandledrejection"] as const)
    window.addEventListener(ev, (e) => {
      const reason = e instanceof ErrorEvent ? e.message : String((e as PromiseRejectionEvent).reason);
      help.textContent = `Error: ${reason}`;
      help.hidden = false;
    });
}

/** `?debug&cleared=langkaia,akershus&gold=langkaia` pretends progress, without storing it. */
export function debugProgress(params: URLSearchParams): Progress | null {
  if (!params.has("cleared") && !params.has("gold") && !params.has("clean")) return null;
  const list = (k: string) => (params.get(k) ?? "").split(",").filter((id) => ORDER.includes(id));
  return { cleared: list("cleared"), best: Object.fromEntries(list("cleared").map((id, i) => [id, 41300 + i * 23700])), bracteates: list("gold"), skilling: {}, clean: list("clean") };
}

/** `window.__game`, for driving a page by hand in a headless browser. */
export function expose(game: object) {
  Object.assign(window, { __game: game });
}
