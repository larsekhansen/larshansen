import type { Move } from "./game/bot";
import type { Play, PlayIntent } from "./game/play";
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

/** The scripted routes, each its own file, fetched only under `?debug&auto`. */
const AUTO: Record<string, () => Promise<Move[]>> = {
  langkaia: () => import("./levels/routes/langkaia").then((m) => m.LANGKAIA_ROUTE),
  akershus: () => import("./levels/routes/akershus").then((m) => m.AKERSHUS_ROUTE),
  radhuset: () => import("./levels/routes/radhuset").then((m) => m.RADHUSET_ROUTE),
  slottet: () => import("./levels/routes/slottet").then((m) => m.SLOTTET_ROUTE),
  holmenkollen: () => import("./levels/routes/holmenkollen").then((m) => m.HOLMENKOLLEN_ROUTE),
  akerselva: () => import("./levels/routes/akerselva").then((m) => m.AKERSELVA_ROUTE),
  nordmarka: () => import("./levels/routes/nordmarka").then((m) => m.NORDMARKA_ROUTE),
  stortinget: () => import("./levels/routes/stortinget").then((m) => m.STORTINGET_ROUTE),
  ekeberg: () => import("./levels/routes/ekeberg").then((m) => m.EKEBERG_ROUTE),
  nabolaget: () => import("./levels/routes/nabolaget").then((m) => m.NABOLAGET_ROUTE),
  bygdoy: () => import("./levels/routes/bygdoy").then((m) => m.BYGDOY_ROUTE)
};

/** `?debug&auto`: the level's scripted route as a step-by-step autopilot, or null for a level with none. */
export async function autoRoute(id: string): Promise<((p: Play) => PlayIntent | null) | null> {
  const [moves, bot] = await Promise.all([AUTO[id]?.(), import("./game/bot")]);
  return moves ? bot.autopilot(moves) : null;
}
