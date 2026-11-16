import type { Move } from "./game/bot";
import { windingUp } from "./game/enemies";
import type { Play, PlayIntent } from "./game/play";
import type { Progress } from "./game/progress";
import { ORDER } from "./levels/index";
import { carrierDrawn } from "@larshansen/pixelkit/carrier";
import { parseKeys } from "@larshansen/pixelkit/harness";
import { view } from "@larshansen/pixelkit/paint";
import { timedPhase } from "@larshansen/pixelkit/timed";
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
  if (!moves) return null;
  const pilot = bot.autopilot(moves);
  // A strip may take the keys back from the route partway (`manual`): then the page's own keys count.
  return (p) => (manual ? null : pilot(p));
}
/** The strip has taken the keys back from the scripted route. */
let manual = false;

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

/** `?debug&perf&post=<port>`: the perf line is also sent to `localhost:<port>` (`tools/glance/perf.ts`), so a table can be made of it. */
function sent(params: URLSearchParams, help: HTMLElement) {
  const port = params.get("post");
  if (!port) return;
  const name = params.get("name") ?? location.search;
  void fetch(`http://localhost:${port}/perf?name=${encodeURIComponent(name)}`, { method: "POST", mode: "no-cors", headers: { "content-type": "text/plain" }, body: help.textContent ?? "" });
}

/** What `?debug` does once the page has started and drawn its first frame: `perf`, `where`, `strip`. */
export function afterStart(params: URLSearchParams, frame: () => void, help: HTMLElement) {
  if (params.has("strip")) return void strip(params, help).catch((e) => (help.textContent = `strip: ${e}`));
  // `?debug&fall=<steps>[&gold]` (order 25): the maze's feather floating down onto him, that many steps into its fall (of
  // a hundred), for a picture of a moment that otherwise comes only on the way out of the maze.
  if (params.has("fall")) {
    const g = (window as unknown as { __game: Game & { state: { feather: unknown } } }).__game;
    g.state.feather = { since: g.state.steps - (Number(params.get("fall")) || 50), gold: params.has("gold") };
    frame();
  }
  // `?debug&perf&on=<event>[&skip=N]`: measured with what answers the event in the air (order 19).
  if (params.has("perf") && params.has("on"))
    return void reach(params, (window as unknown as { __game: Game }).__game).then(
      () => (perf(frame, help), sent(params, help)),
      (e) => (help.textContent = `perf: ${e}`)
    );
  if (params.has("perf")) {
    perf(frame, help);
    sent(params, help);
  }
  // `?debug&steps=0&on=<event>[&skip=N]` alone (order 27): a picture of the moment, stepped to the event and N steps on.
  if (params.has("on") && !params.has("perf"))
    return void reach(params, (window as unknown as { __game: Game }).__game).then(
      () => frame(),
      (e) => (help.textContent = `on: ${e}`)
    );
  if (params.has("where")) where(params.get("where") ?? "");
  // `?debug&grain=<way>` (order 22, part B): the grain study, a chunk of its own, drawn over the frame.
  if (params.has("grain"))
    void import("./grain/study").then((m) => m.study(params.get("grain") || "3", (window as unknown as { __game: Parameters<typeof m.study>[1] }).__game, params.has("count") ? help : undefined)).catch((e) => (help.textContent = `grain: ${e}`));
}

/** The page as `window.__game` has it, for the strip. */
interface Game {
  play: Play;
  shown: { x: number; y: number };
  state: { steps: number; mode: string; lastEvents: (Record<string, unknown> & { step: { landed: number; jumped: boolean } }) | null };
  input: { hold(a: string, on: boolean): void; endStep(): void };
  step(): void;
  still(): void;
  sfx?: { play(name: string, n?: number): void; voice?(v: unknown): void };
  feel?: { sounds?: string[] };
}

/**
 * `?debug&steps=N&strip=<name>&on=<event>&post=<port>` (order 19): a frame strip of what he sees in the
 * half second after an event. After the harness's N steps it steps on (with the rest of `keys`) until
 * `on` happens, then draws a frame every `every` steps (3) for `count` frames (11), each cropped round him
 * (or round `at=<wx>,<wy>`), with the header's hearts, lives and skilling under it and the sounds played
 * since the frame before; the strip goes as a PNG to `localhost:<post>` (`tools/glance/strips.ts`).
 */
async function strip(params: URLSearchParams, help: HTMLElement) {
  const g = (window as unknown as { __game: Game }).__game;
  const every = Number(params.get("every") ?? 3);
  const count = Number(params.get("count") ?? 11);
  const heard: string[] = [];
  const { step, was } = await reach(params, g, heard);
  const at = params.get("at") === "was" ? [was.x + 5, was.y + 7] : (params.get("at") ?? "").split(",").map(Number);
  const fixed = at.length === 2 && at.every(Number.isFinite) ? { x: at[0], y: at[1] } : null;
  const CW = 224;
  const CH = 144;
  const HH = 26;
  const LH = 16;
  const out = document.createElement("canvas");
  out.width = 4 + count * (CW + 4);
  out.height = 4 + CH + HH + LH + 4;
  const o = out.getContext("2d")!;
  o.fillStyle = "#202020";
  o.fillRect(0, 0, out.width, out.height);
  const stage = document.getElementById("stage")!;
  for (let f = 0; f < count; f++) {
    if (f > 0) for (let s = 0; s < every; s++) step();
    g.still();
    const x0 = 4 + f * (CW + 4);
    // The crop: CW x CH screen pixels at two per art pixel, round him (or the spot asked for).
    // Two screen pixels to an art pixel; with `scale=1`, one, so the crop takes in twice as much.
    const scale = Number(params.get("scale") ?? 2) / view.k;
    const wx = fixed ? fixed.x : g.shown.x + 5;
    const wy = fixed ? fixed.y : g.shown.y + 7;
    const cx = sx(wx) * view.dpr;
    const cy = sy(wy) * view.dpr;
    o.save();
    o.beginPath();
    o.rect(x0, 4, CW, CH);
    o.clip();
    o.imageSmoothingEnabled = false;
    for (const c of stage.querySelectorAll("canvas")) {
      const m = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(c.style.transform);
      const dx = m ? Number(m[1]) * view.dpr : 0;
      const dy = m ? Number(m[2]) * view.dpr : 0;
      const k = c.id === "ui" ? 1 : view.k;
      o.drawImage(c, x0 + CW / 2 + (dx - cx) * scale, 4 + CH / 2 + (dy - cy) * scale, c.width * k * scale, c.height * k * scale);
    }
    o.restore();
    // The header's hearts, lives and skilling, as the page shows them now.
    o.fillStyle = "#fffcf6";
    o.fillRect(x0, 4 + CH, CW, HH);
    // Each pixel where the page has it now (a heart swelling, the halves of a broken one falling apart), a
    // half again as large, from the left of the hearts; then the lives' number and the skilling's count.
    const life = document.getElementById("life")!.getBoundingClientRect();
    const Z = 1.5;
    const mid = 4 + CH + HH / 2;
    for (const svg of document.querySelectorAll<SVGSVGElement>("#hearts svg, #lives svg")) {
      if (getComputedStyle(svg).display === "none") continue;
      for (const r of svg.querySelectorAll("rect")) {
        const at = r.getBoundingClientRect();
        let a = 1;
        for (let el: Element | null = r; el && el !== document.body; el = el.parentElement) a *= Number(getComputedStyle(el).opacity);
        o.globalAlpha = a;
        o.fillStyle = r.getAttribute("fill") ?? "#000";
        o.fillRect(x0 + 4 + (at.left - life.left) * Z, mid + (at.top - (life.top + life.height / 2)) * Z, Math.max(1, at.width * Z), Math.max(1, at.height * Z));
      }
    }
    o.globalAlpha = 1;
    const hx = x0 + 4 + life.width * Z;
    o.fillStyle = "#1f1a17";
    o.font = "bold 13px system-ui, sans-serif";
    o.textBaseline = "middle";
    const lives = document.querySelector<HTMLElement>("#lives span");
    const coinsEl = document.getElementById("coins") as HTMLElement | null;
    const coins = coinsEl?.hidden ? "" : document.getElementById("coinn")?.textContent ?? "";
    // A count that has just changed is drawn as the page draws it: larger, in its colour.
    const size = (el: Element | null | undefined) => (el ? /scale\(([\d.]+)\)/.exec((el as HTMLElement).style.transform)?.[1] : null);
    o.fillStyle = (lives?.parentElement as HTMLElement | null)?.style.color || "#1f1a17";
    o.font = `bold ${Math.round(13 * Number(size(lives?.parentElement) ?? 1))}px system-ui, sans-serif`;
    o.fillText(lives?.textContent ?? "", hx - 12, mid);
    o.fillStyle = coinsEl?.style.color || "#1f1a17";
    o.font = `bold ${Math.round(13 * Number(size(coinsEl) ?? 1))}px system-ui, sans-serif`;
    if (coins) o.fillText(`¤${coins}`, hx + 14, mid);
    // Which frame, and what was heard since the last.
    o.fillStyle = "#e8e8e8";
    o.font = "11px system-ui, sans-serif";
    o.fillText(`+${f * every}${heard.length ? `  ♪ ${heard.join(" ")}` : ""}`, x0 + 2, 4 + CH + HH + LH / 2);
    heard.length = 0;
  }
  const port = params.get("post");
  const name = params.get("strip") ?? "strip";
  if (!port) {
    // No one to send it to: shown over the page instead.
    out.style.cssText = "position:fixed;left:0;top:0;z-index:99;max-width:100%";
    document.body.appendChild(out);
    return;
  }
  await fetch(`http://localhost:${port}/strip?name=${encodeURIComponent(name)}`, { method: "POST", mode: "no-cors", headers: { "content-type": "text/plain" }, body: out.toDataURL("image/png") });
  help.textContent = `strip ${name} sent`;
}

/**
 * Steps the page on from the harness's steps, with the rest of `keys`, until `on` happens (and `skip` steps
 * more): for a strip, and for `perf` with something in the air. `heard` collects the sounds of each step.
 */
async function reach(params: URLSearchParams, g: Game, heard: string[] = []) {
  // (parseKeys and view are imported at the top: a dynamic import of a module in the first script would make it keep the whole module as an object.)
  const keys = parseKeys(params.get("keys") ?? "");
  let k = Math.max(0, Number(params.get("steps")) || 0);
  const max = Number(params.get("max") ?? 6000);
  if (g.sfx) {
    const play = g.sfx.play.bind(g.sfx);
    g.sfx.play = (name: string, n?: number) => {
      heard.push(name);
      play(name, n);
    };
    // The page's own sounds (order 19's), by their names in `render/feel.ts`.
    const voice = g.sfx.voice?.bind(g.sfx);
    if (voice) {
      const { VOICES } = await import("./render/feel");
      g.sfx.voice = (parts: unknown) => {
        heard.push(Object.entries(VOICES).find(([, v]) => v === parts)?.[0] ?? "voice");
        voice(parts);
      };
    }
  }
  const step = () => {
    const held = keys[k++] ?? [];
    for (const a of ["left", "right", "jump", "up", "dash", "down"]) g.input.hold(a, held.includes(a as never));
    g.step();
  };
  // One event after another: `on=boss:hit,bounce` waits for a hit on the boss, then for a bounce.
  const chain = (params.get("on") ?? "now").split(",").map((s) => trigger(s, g));
  let link = 0;
  const on = () => {
    while (link < chain.length && chain[link]()) link++;
    return link >= chain.length;
  };
  let waited = 0;
  /** Where he was the step before the event (`at=was` crops round it: where he fell in, not where he is put back). */
  const was = { x: g.shown.x, y: g.shown.y };
  if (!on()) while (waited++ < max) {
    heard.length = 0;
    was.x = g.play.body.x;
    was.y = g.play.body.y;
    step();
    if (on()) break;
  }
  if (waited > max) throw new Error(`no ${params.get("on")} in ${max} steps`);
  // `skip=N`: the frames begin N steps after the event (the feather is a while falling).
  for (let k = Number(params.get("skip") ?? 0); k > 0; k--) step();
  return { step, was };
}

/** When the strip begins: an event of the rules, or a change of something drawn. */
function trigger(spec: string, g: Game): () => boolean {
  const [name, arg] = spec.split(":");
  const ev = () => g.state.lastEvents;
  const p = () => g.play;
  const flag = (k: string) => () => !!ev()?.[k];
  const num = (k: string) => () => ev()?.[k] !== null && ev()?.[k] !== undefined;
  const i = Number(arg ?? 0);
  let was: unknown = undefined;
  /** True on the step `now()` turns true. */
  const edge = (now: () => boolean) => () => {
    const v = now();
    const turned = v && was === false;
    was = v;
    return turned;
  };
  switch (name) {
    case "now":
      return () => true;
    case "manual":
      // From here on the strip's keys move him, not the scripted route.
      return () => (manual = true);
    case "feather":
      // The feather from the maze floats down onto him, as when he comes out of the mound with it.
      return () => {
        (g.state as unknown as { feather: unknown }).feather = { since: g.state.steps, gold: false };
        return true;
      };
    case "hurt":
      return () => !!ev()?.hurt && !ev()?.lifeLost;
    case "stomp":
    case "coin":
    case "flag":
    case "bench":
    case "drum":
    case "bell":
      return num(name);
    case "bracteate":
    case "gift":
    case "blocked":
    case "rune":
    case "splash":
    case "over":
    case "dash":
    case "zap":
      return flag(name);
    case "lifeLost":
      return () => !!ev()?.lifeLost && !ev()?.over;
    case "cheese":
      return () => !!ev()?.life && p().cheese?.at === p().t;
    case "thrown":
      return () => ((ev()?.thrown as number[] | undefined)?.length ?? 0) > 0;
    case "troll":
    case "boss":
      return () => ev()?.[name] === arg;
    case "fall": {
      // Landing after a fall of more than three tiles (from the top of his flight).
      let apex = Infinity;
      return () => {
        const b = p().body;
        if (!b.onGround) {
          apex = Math.min(apex, b.y);
          return false;
        }
        const fell = b.y - apex;
        apex = Infinity;
        return (ev()?.step.landed ?? 0) > 0 && fell > 3 * 16;
      };
    }
    case "bounce": {
      // Thrown up off something that is not an enemy, a sheep or a drum: a boss he cannot hurt now.
      let vy = 0;
      return () => {
        const b = p().body;
        const was = vy;
        vy = b.vy;
        const e = ev();
        return was > 1 && b.vy < -2 && !!e && e.stomp === null && !e.bleat && e.drum === null && !e.hurt && !e.step.jumped && !e.boss && !e.troll;
      };
    }
    case "warn":
    case "off":
      return edge(() => timedPhase(p().t, p().def.timed[i]) === name);
    case "sink":
      return () => {
        const s = p().grounds?.state as { pads?: { sinkAt: number | null }[] } | undefined;
        return !!s?.pads?.some((x) => x.sinkAt === p().t);
      };
    case "stop":
    case "go":
      return edge(() => {
        const d = p().def.carriers[i];
        const a = carrierDrawn(d, p().t, 1);
        const b = carrierDrawn(d, p().t - 1, 1);
        const still = a.x === b.x && a.y === b.y;
        return name === "stop" ? still : !still;
      });
    case "calm":
    case "wake":
      // `calm:statue` any statue; `calm:1` the enemy of that index.
      return edge(() => p().enemies.some((e, k) => (e.def.look === arg || String(k) === arg) && e.alive && (name === "calm" ? !!e.calm : !e.calm)));
    case "windup":
      return edge(() => p().enemies.some((e, k) => e.def.kind === "thrower" && (!arg || e.def.look === arg || String(k) === arg) && windingUp(e, p().t)));
    case "swan":
      return () => p().enemies.some((e) => e.def.look === "swan" && e.n === Number(arg ?? 180));
    case "door":
      return () => g.state.mode === "enter";
    case "at":
      return () => p().t >= i;
  }
  throw new Error(`strip: no trigger "${spec}"`);
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
