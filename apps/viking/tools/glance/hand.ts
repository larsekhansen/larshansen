// The game in the hand (order 21): pictures of a screen state at a phone's size and pixel ratio, with
// the touch controls showing, and what covers the game's picture measured from the page itself.
//
//   bun tools/glance/hand.ts [--size=390x844] [--dpr=3] [--touch] [--turn=844x390] [--port=5186] <outDir> <base> <states.tsv>
//
// <base> is where a built game is served (http://localhost:5184). Each line of the states file is a name, a
// tab, and an address's path and query (`/viking/?debug&steps=40&level=langkaia#langkaia`). This tool serves
// the game through itself (it passes `/viking/...` on to <base>), so the small page Firefox opens can hold the
// game in a frame of the same origin and read it: the header, the touch pad and each of its buttons, the help
// line, the cards, and from `window.__game` (`?debug`) where he, the enemies and what he can take are on the
// screen and where the banner is drawn. Firefox is given a fresh profile told it has a coarse pointer
// (`--touch`: the page then shows its pad, as on a phone) and a device pixel ratio (`--dpr`, 3 by default, a
// phone's), and its picture is taken once the measuring is done (the frame's page holds its load event).
// `--turn` turns the phone once the page has drawn: the frame is given the second size, and measured again.
//
// Writes <outDir>/<name>_<W>x<H>.png and a line of JSON per state to <outDir>/measure.jsonl; `hand-table.ts`
// makes the tables of them.

import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const [outDir, base, list] = args.filter((a) => !a.startsWith("--"));
if (!outDir || !base || !list) {
  console.error("usage: bun tools/glance/hand.ts [--size=390x844] [--dpr=3] [--touch] [--turn=844x390] [--port=5186] <outDir> <base> <states.tsv>");
  process.exit(2);
}
const [W, H] = (opt("size") ?? "390x844").split("x").map(Number);
const turn = opt("turn")?.split("x").map(Number) ?? null;
const DPR = Number(opt("dpr") ?? 3);
const TOUCH = args.includes("--touch");
const PORT = Number(opt("port") ?? 5186);
mkdirSync(outDir, { recursive: true });

/** Runs in the frame's parent, with the game's window: everything the tables need, in CSS pixels of the game's window. */
function measure(w: any) {
  const d: Document = w.document;
  const cs = (el: Element) => w.getComputedStyle(el);
  const shown = (el: Element | null): el is HTMLElement => {
    if (!el || (el as HTMLElement).hidden) return false;
    for (let e: Element | null = el; e && e !== d.body; e = e.parentElement) {
      const s = cs(e);
      if (s.display === "none" || s.visibility === "hidden" || (e as HTMLElement).hidden) return false;
    }
    return el.getClientRects().length > 0;
  };
  const rect = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
  };
  const alpha = (el: Element) => {
    const m = /rgba?\(([^)]+)\)/.exec(cs(el).backgroundColor);
    if (!m) return 0;
    const p = m[1].split(",").map((s: string) => Number(s.trim()));
    return p.length > 3 ? p[3] : 1;
  };
  const opacity = (el: Element) => {
    let a = 1;
    for (let e: Element | null = el; e && e !== d.body; e = e.parentElement) a *= Number(cs(e).opacity);
    return Math.round(a * 100) / 100;
  };
  const bar = d.querySelector(".bar")!;
  const parts: Record<string, unknown> = {};
  for (const [name, sel] of [["name", ".me"], ["links", ".apps"], ["runes", "#runes"], ["runes2", "#runes2"], ["clock", ".clock"], ["life", "#life"], ["coins", "#coins"], ["gold", "#goldcount"], ["restart", "#restart"], ["mute", "#mute"]] as const) {
    const el = d.querySelector(sel);
    if (shown(el)) parts[name] = rect(el);
  }
  const targets: { where: string; label: string; r: ReturnType<typeof rect>; dim: number }[] = [];
  for (const [where, sel] of [["header", ".bar a, .bar button"], ["pad", "#pad button, #pad [data-action]"], ["card", ".card button, .card a"]] as const)
    for (const el of d.querySelectorAll(sel)) {
      if (!shown(el)) continue;
      const r = rect(el);
      if (r.w === 0 || r.h === 0) continue;
      if (targets.some((t) => t.r.x === r.x && t.r.y === r.y && t.r.w === r.w && t.r.h === r.h)) continue;
      targets.push({ where, label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24), r, dim: opacity(el) });
    }
  const pad = d.getElementById("pad");
  const help = d.getElementById("help");
  const cards = [...d.querySelectorAll(".card")].filter(shown).map((c) => ({ id: c.id, r: rect(c), overflow: c.scrollHeight > c.clientHeight + 1, scrolls: cs(c).overflowY }));
  const g = w.__game;
  let game: Record<string, unknown> | null = null;
  try {
    if (g && g.play) {
      const v = g.view;
      const unit = v.k / v.dpr;
      const sr = (x: number, y: number, ww: number, hh: number) => ({ x: (x - v.camXf) * unit, y: (y - v.camYf) * unit, w: ww * unit, h: hh * unit });
      const p = g.play;
      const s = g.shown;
      const things: { kind: string; r: ReturnType<typeof sr> }[] = [];
      for (const e of p.enemies) if (e.alive) things.push({ kind: "enemy", r: sr(e.x - e.w / 2, e.y - e.h, e.w, e.h) });
      for (const sh of p.shots) things.push({ kind: "shot", r: sr(sh.x - 3, sh.y - 3, 6, 6) });
      for (const c of p.skilling) if (c.at === null) things.push({ kind: "skilling", r: sr(c.box.x, c.box.y, c.box.w, c.box.h) });
      if (p.cheese && p.cheese.at === null) things.push({ kind: "cheese", r: sr(p.cheese.box.x, p.cheese.box.y, p.cheese.box.w, p.cheese.box.h) });
      if (p.bracteate && p.bracteateAt === null) things.push({ kind: "bracteate", r: sr(p.bracteate.x, p.bracteate.y, p.bracteate.w ?? 12, p.bracteate.h ?? 12) });
      if (p.rune && p.runeAt === null) things.push({ kind: "rune", r: sr(p.rune.x, p.rune.y, p.rune.w ?? 16, p.rune.h ?? 16) });
      const facing = p.body.facing >= 0 ? 1 : -1;
      // He, the two tiles under his feet and six ahead (rule 6).
      const ahead = 6 * 16;
      const rx = facing > 0 ? s.x : s.x - ahead;
      const region = sr(rx, s.y, 10 + ahead, 14 + 32);
      // The banner, where the page drew it (`drawn`, order 21) or, before that, where the old formula put it.
      let banner = g.drawn?.banner ?? null;
      if (!g.drawn && g.state.banner) {
        const b = g.state.banner;
        const age = g.state.steps - b.since;
        const a = v.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, (165 - age) / 30));
        if (a > 0) {
          const fontPx = Math.max(11, Math.round(4.3 * unit));
          const stage = d.getElementById("stage")!.getBoundingClientRect();
          const under = bar.getBoundingClientRect().bottom - stage.top + fontPx * 2.4;
          const top = Math.max(Math.min(110, v.cssH * 0.18), under);
          const cv = d.createElement("canvas").getContext("2d")!;
          const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
          cv.font = `700 ${Math.round(fontPx * 1.7)}px ${FONT}`;
          let tw = cv.measureText(b.title).width;
          if (b.sub) {
            cv.font = `500 ${Math.round(fontPx * 1.05)}px ${FONT}`;
            tw = Math.max(tw, cv.measureText(b.sub).width);
          }
          const padX = Math.round(fontPx * 1.1);
          const half = Math.round(fontPx * 1.25);
          const hh = half * 2 + (b.sub ? fontPx * 1.6 : 0);
          const pw = Math.min(v.cssW - 12, tw + padX * 2);
          banner = { x: v.cssW / 2 - pw / 2, y: top - half, w: pw, h: hh, title: b.title };
        }
      }
      game = { k: v.k, dpr: v.dpr, unit, viewW: v.w, viewH: v.h, steps: g.state.steps, map: !!g.level?.id && g.level.id === "kart", level: g.level?.id, him: sr(s.x, s.y, 10, 14), facing, region, things, banner, riding: !!p.riding, card: g.state.card, clock: d.getElementById("clock")?.textContent };
    }
  } catch (e) {
    game = { error: String(e) };
  }
  return {
    vw: w.innerWidth,
    vh: w.innerHeight,
    header: { r: rect(bar), alpha: alpha(bar), parts },
    pad: shown(pad) ? { r: rect(pad), alpha: alpha(pad) } : null,
    help: shown(help) && help.textContent ? { r: rect(help), text: help.textContent, lines: Math.round((help.getBoundingClientRect().height - parseFloat(cs(help).paddingTop) - parseFloat(cs(help).paddingBottom)) / (cs(help).lineHeight === "normal" ? parseFloat(cs(help).fontSize) * 1.25 : parseFloat(cs(help).lineHeight))) } : null,
    targets,
    cards,
    game,
    stageScroll: [d.scrollingElement?.scrollTop ?? 0, d.scrollingElement?.scrollLeft ?? 0]
  };
}

function wrapper(url: string, name: string, size: [number, number], turned: [number, number] | null, wanted: number): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>hand</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}iframe{position:fixed;left:0;top:0;width:${size[0]}px;height:${size[1]}px;border:0}img{position:fixed;left:0;top:0;width:1px;height:1px;opacity:0}</style>
</head><body><iframe src="${url.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"></iframe><img src="/slow?name=${encodeURIComponent(name)}" alt="">
<script>
const measure = ${measure.toString()};
const f = document.querySelector("iframe");
const t0 = Date.now();
function ready() {
  const w = f.contentWindow;
  if (!w || !w.document || !w.document.body) return false;
  const d = w.document;
  const card = [...d.querySelectorAll(".card")].some((c) => !c.hidden);
  try {
    if (w.__game && w.__game.state && w.__game.state.steps >= ${wanted} && w.__game.play) return true;
  } catch (e) {}
  return card && Date.now() - t0 > 4000;
}
function send(body) {
  return fetch("/measure?name=${encodeURIComponent(name)}", { method: "POST", body: JSON.stringify(body) });
}
(function poll() {
  if (!ready() && Date.now() - t0 < 25000) return setTimeout(poll, 150);
  setTimeout(async () => {
    const first = measure(f.contentWindow);
    let second = null;
    ${turned ? `f.style.width = "${turned[0]}px"; f.style.height = "${turned[1]}px";
    await new Promise((r) => setTimeout(r, 600));
    // A headless Firefox delivers no resize observations: do what the page's observer does, where the page can be asked to.
    try { f.contentWindow.__game.layout?.(); } catch (e) {}
    await new Promise((r) => setTimeout(r, 600));
    second = measure(f.contentWindow);` : ""}
    send({ first, second });
  }, 700);
})();
</script></body></html>`;
}

const results = new Map<string, string>();
const came = new Map<string, () => void>();
const server = Bun.serve({
  port: PORT,
  hostname: "localhost",
  idleTimeout: 120,
  async fetch(req) {
    const u = new URL(req.url);
    const name = u.searchParams.get("name") ?? "";
    if (u.pathname === "/measure" && req.method === "POST") {
      results.set(name, await req.text());
      came.get(name)?.();
      return new Response("ok");
    }
    if (u.pathname === "/slow") {
      await new Promise<void>((done) => {
        const timer = setTimeout(done, 45_000);
        came.set(name, () => {
          clearTimeout(timer);
          setTimeout(done, 300);
        });
      });
      return new Response(Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0)), { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
    }
    if (u.pathname === "/hand") {
      const target = u.searchParams.get("u") ?? "";
      const steps = Number(/[?&]steps=(\d+)/.exec(target)?.[1] ?? 0);
      const size: [number, number] = [W, H];
      return new Response(wrapper(target, name, size, turn as [number, number] | null, steps), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    // Everything else is the game's: passed on to <base>.
    const r = await fetch(`${base}${u.pathname}${u.search}`);
    return new Response(r.body, { status: r.status, headers: { "content-type": r.headers.get("content-type") ?? "application/octet-stream", "cache-control": "no-store" } });
  }
});

function profile(): string {
  const dir = mkdtempSync(join(tmpdir(), "hand-"));
  const prefs = [`user_pref("layout.css.devPixelsPerPx", "${DPR.toFixed(1)}");`];
  // A coarse pointer and no hover, as a phone reports: the page's `(pointer: coarse)` is true.
  if (TOUCH) prefs.push(`user_pref("ui.primaryPointerCapabilities", 1);`, `user_pref("ui.allPointerCapabilities", 1);`);
  writeFileSync(join(dir, "user.js"), prefs.join("\n") + "\n");
  return dir;
}

const out = join(outDir, "measure.jsonl");
let failed = 0;
for (const line of readFileSync(list, "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [name, path] = line.split("\t");
  const key = `${name}_${W}x${H}${turn ? `-${turn[0]}x${turn[1]}` : ""}`;
  const file = join(outDir, `${key}.png`);
  rmSync(file, { force: true });
  const prof = profile();
  const win = turn ? [Math.max(W, turn[0]), Math.max(H, turn[1])] : [W, H];
  const started = performance.now();
  try {
    const opened = `http://localhost:${PORT}/hand?name=${encodeURIComponent(key)}&u=${encodeURIComponent(path)}`;
    const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", prof, `--window-size=${win[0]},${win[1]}`, "--screenshot", file, opened], { stdout: "ignore", stderr: "ignore" });
    const timer = setTimeout(() => proc.kill(), 100_000);
    await proc.exited;
    clearTimeout(timer);
  } finally {
    rmSync(prof, { recursive: true, force: true });
    came.delete(key);
  }
  const got = results.get(key);
  const ok = !!got && existsSync(file) && statSync(file).size > 0;
  if (!ok) failed++;
  appendFileSync(out, JSON.stringify({ name, key, size: [W, H], turn, dpr: DPR, touch: TOUCH, path, m: got ? JSON.parse(got) : null }) + "\n");
  console.log(`${ok ? "ok    " : "FAILED"} ${((performance.now() - started) / 1000).toFixed(1).padStart(5)} s  ${key}`);
}
server.stop(true);
if (failed) process.exit(1);
