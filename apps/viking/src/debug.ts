import type { Move } from "./game/bot";
import type { Play, PlayIntent } from "./game/play";
import type { Progress } from "./game/progress";
import { ORDER } from "./levels/index";
import { sx, sy } from "@larshansen/pixelkit/text";

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

/** `?debug&cleared=langkaia,akershus&gold=langkaia` pretends progress, without storing it; `all` is every station. */
export function debugProgress(params: URLSearchParams): Progress | null {
  if (!params.has("cleared") && !params.has("gold") && !params.has("clean")) return null;
  const list = (k: string) => (params.get(k) === "all" ? [...ORDER] : (params.get(k) ?? "").split(",").filter((id) => ORDER.includes(id)));
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
  bygdoy: () => import("./levels/routes/bygdoy").then((m) => m.BYGDOY_ROUTE),
  vigelandsparken: () => import("./levels/routes/vigelandsparken").then((m) => m.VIGELANDSPARKEN_ROUTE),
  korketrekkeren: () => import("./levels/routes/korketrekkeren").then((m) => m.KORKETREKKEREN_ROUTE),
  ostensjovannet: () => import("./levels/routes/ostensjovannet").then((m) => m.OSTENSJOVANNET_ROUTE),
  bjorvika: () => import("./levels/routes/bjorvika").then((m) => m.BJORVIKA_ROUTE),
  gamlebyen: () => import("./levels/routes/gamlebyen").then((m) => m.GAMLEBYEN_ROUTE)
};

/** `?debug&auto`: the level's scripted route as a step-by-step autopilot, or null for a level with none. */
export async function autoRoute(id: string): Promise<((p: Play) => PlayIntent | null) | null> {
  const [moves, bot] = await Promise.all([AUTO[id]?.(), import("./game/bot")]);
  return moves ? bot.autopilot(moves) : null;
}

/**
 * `?debug&perf`: draws the frame fifty times and writes on the help line how many rectangles and
 * images one frame takes and how long it took here, so a change to the drawing can be measured.
 */
export function perf(frame: () => void, help: HTMLElement) {
  const proto = CanvasRenderingContext2D.prototype;
  const count = { fillRect: 0, drawImage: 0, fillStyle: 0 };
  const { fillRect, drawImage } = proto;
  const style = Object.getOwnPropertyDescriptor(proto, "fillStyle")!;
  // Every fortieth rectangle says who drew it (the first function up the stack that is not the kit's
  // own rectangle helpers), so the line can name the busiest drawers.
  const who = new Map<string, number>();
  proto.fillRect = function (...a) {
    if (++count.fillRect % 40 === 0) {
      const names = (new Error().stack ?? "").split("\n").map((l) => l.split("@")[0].trim()).filter((n) => n && !/^(R|S|disc|wdisc|gable|perf|proto\.fillRect|fillRect)$/.test(n) && !n.includes("debug"));
      const name = names.slice(0, 2).join("<");
      who.set(name, (who.get(name) ?? 0) + 40);
    }
    return fillRect.apply(this, a);
  };
  proto.drawImage = function (this: CanvasRenderingContext2D, ...a: unknown[]) {
    count.drawImage++;
    return (drawImage as (...a: unknown[]) => void).apply(this, a);
  } as typeof drawImage;
  Object.defineProperty(proto, "fillStyle", {
    ...style,
    set(v) {
      count.fillStyle++;
      style.set!.call(this, v);
    }
  });
  const N = 50;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) frame();
  const ms = (performance.now() - t0) / N;
  proto.fillRect = fillRect;
  proto.drawImage = drawImage;
  Object.defineProperty(proto, "fillStyle", style);
  help.textContent = `perf: ${Math.round(count.fillRect / N)} rects, ${Math.round(count.fillStyle / N)} colours, ${Math.round(count.drawImage / N)} images, ${ms.toFixed(1)} ms a frame. ` + [...who].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, c]) => `${n} ${Math.round(c / N)}`).join(", ");
  help.hidden = false;
}

/** What `?debug` does once the page has started and drawn its first frame: `perf`, `where`. */
export function afterStart(params: URLSearchParams, frame: () => void, help: HTMLElement) {
  if (params.has("perf")) perf(frame, help);
  if (params.has("where")) where(params.get("where") ?? "");
}

/**
 * `?debug&where=<wx>,<wy>`: where that world point is on the screen, written into the picture's two
 * bottom-left pixels (x as red and green, then y as red and green), so a script can crop a contact
 * sheet round it from a headless screenshot. They are two one-pixel elements over the page, so a redraw
 * of the canvases does not take them away; they are the only change to the picture.
 */
function where(at: string) {
  const [wx, wy] = at.split(",").map(Number);
  if (!Number.isFinite(wx) || !Number.isFinite(wy)) return;
  const x = Math.max(0, Math.round(sx(wx)));
  const y = Math.max(0, Math.round(sy(wy)));
  [x, y].forEach((v, i) => {
    const px = document.body.appendChild(document.createElement("i"));
    px.style.cssText = `position:fixed;z-index:99;left:${i}px;bottom:0;width:1px;height:1px;background:rgb(${v >> 8},${v & 255},0)`;
  });
}
