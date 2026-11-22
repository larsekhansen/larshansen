// Screenshots of pages with headless Firefox, one at a time, for comparing a scene before and after
// a change. Chromium cannot render headless on the Pi; Firefox can draw Canvas 2D but fires no
// animation frames, so the pages are opened with `?debug&steps=N` (see packages/pixelkit/src/harness.ts).
//
//   bun tools/shots.ts [--size=390x844] [--wait=<ms>] [--lang=nb-NO] <outDir> <url>...
//
// The window is 1280 x 800 unless `--size` says otherwise (an upright phone: 390x844); a shot at
// another size has the size at the end of its name. Each file is named after the address's path and query. Every run gets a fresh Firefox profile,
// so nothing is remembered between pages (no stored best times, no lock on a shared profile).
//
// Firefox takes the picture at the page's load event. A page that still fetches after it (a built
// viking page under `?debug&auto` fetches the level, the route and the scripted player) can be
// photographed before it has drawn anything. `--wait=<ms>` (default 0) holds the load event back: the
// address is opened in an `<iframe>` filling the window of a small wrapper page served from a local
// port, beside an image from that port's `/slow` route, which answers only after the wait. The
// picture is then of the wrapper, which shows nothing but the page. Since order 35 a viking page under
// `?debug` tells the wrapper when its picture is drawn (`afterStart` in `apps/viking/src/debug.ts`), and
// the image answers then (a fifth of a second after), so `<ms>` is the most it waits: a fixed five seconds
// was sometimes too short on this Pi, and the picture was of the page's empty background.
//
// `--lang=<tag>` has the fresh profile ask for that language first (`nb-NO`: the viking game speaks Norwegian); the
// file's name ends with it.
//
// A picture whose middle is empty (every row between a fifth and four fifths of its height one colour, as the page's own
// background is where no scene was drawn) is named BLANK as it is taken and again at the end, and the run ends with 3
// (order 35: they had been handed back silently).

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readPng } from "./png";

const TIMEOUT_MS = 90_000;

/** `http://localhost:5181/viking/?debug&steps=1&sky=day#kart` as `viking_debug_steps-1_sky-day_kart`. */
export function nameFor(url: string): string {
  const u = new URL(url);
  const path = u.pathname.replace(/^\/+|\/+$/g, "") || "index";
  const query = u.search.replace(/^\?/, "");
  const hash = u.hash.replace(/^#/, "");
  return [path, query, hash]
    .filter(Boolean)
    .join("_")
    .replace(/=/g, "-")
    .replace(/[^A-Za-z0-9.-]+/g, "_");
}

/**
 * Whether a picture is blank: every row of its middle (a fifth to four fifths of its height, under any header and over any
 * help line) one colour, or nearly (a few levels in any channel), as the page's background gradient is where nothing was
 * drawn. A scene has its far layers, its lane and its sky's clouds or stars there.
 */
export function isBlank(file: string): boolean {
  let p;
  try {
    p = readPng(readFileSync(file));
  } catch {
    return false;
  }
  const { w, h, rgba } = p;
  let flat = 0;
  const y0 = Math.floor(h / 5);
  const y1 = Math.ceil((h * 4) / 5);
  for (let y = y0; y < y1; y++) {
    const o = y * w * 4;
    let same = true;
    for (let x = 1; x < w && same; x++) for (let c = 0; c < 3; c++) if (Math.abs(rgba[o + x * 4 + c] - rgba[o + c]) > 3) same = false;
    if (same) flat++;
  }
  return flat >= (y1 - y0) * 0.98;
}

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The wrapper page: `url` in a frame filling the window, and an image that keeps the load event back. */
export function wrapperPage(url: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>shot</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}iframe{position:fixed;left:0;top:0;width:100%;height:100%;border:0}img{position:fixed;left:0;top:0;width:1px;height:1px;opacity:0}</style>
</head><body><iframe src="${attr(url)}"></iframe><img src="/slow" alt="">
<script>addEventListener("message", (e) => { if (e.data === "viking:drawn") fetch("/drawn"); });</script></body></html>`;
}

/** A transparent 1 x 1 GIF. */
const PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));

/** Serves the wrapper at `/?u=<address>` and the slow image at `/slow`, answering after `wait` ms, or a fifth of a second after the page says it has drawn (`/drawn`). */
function serveWrapper(wait: number) {
  let drawn: (() => void) | null = null;
  return Bun.serve({
    port: 0,
    hostname: "localhost",
    idleTimeout: 0,
    fetch(req) {
      const u = new URL(req.url);
      if (u.pathname === "/drawn") {
        setTimeout(() => drawn?.(), 200);
        return new Response("ok");
      }
      if (u.pathname === "/slow")
        return new Promise<Response>((done) => {
          const answer = () => {
            clearTimeout(timer);
            drawn = null;
            done(new Response(PIXEL, { headers: { "content-type": "image/gif", "cache-control": "no-store" } }));
          };
          const timer = setTimeout(answer, wait);
          drawn = answer;
        });
      const target = u.searchParams.get("u");
      if (u.pathname === "/" && target) return new Response(wrapperPage(target), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      return new Response("not here", { status: 404 });
    }
  });
}

async function shoot(url: string, file: string, size = "1280,800", lang?: string): Promise<boolean> {
  const profile = mkdtempSync(join(tmpdir(), "shots-"));
  if (lang) writeFileSync(join(profile, "user.js"), `user_pref("intl.accept_languages", "${lang}");\nuser_pref("intl.locale.requested", "${lang}");\n`);
  try {
    const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", profile, `--window-size=${size}`, "--screenshot", file, url], {
      stdout: "ignore",
      stderr: "ignore"
    });
    const timer = setTimeout(() => proc.kill(), TIMEOUT_MS);
    await proc.exited;
    clearTimeout(timer);
    return existsSync(file) && statSync(file).size > 0;
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const sizeArg = args.find((a) => a.startsWith("--size="));
  const size = sizeArg ? /^--size=(\d+)x(\d+)$/.exec(sizeArg) : null;
  if (sizeArg && !size) {
    console.error("--size wants WIDTHxHEIGHT, as --size=390x844");
    process.exit(2);
  }
  const waitArg = args.find((a) => a.startsWith("--wait="));
  const waitMatch = waitArg ? /^--wait=(\d+)$/.exec(waitArg) : null;
  if (waitArg && !waitMatch) {
    console.error("--wait wants a number of milliseconds, as --wait=5000");
    process.exit(2);
  }
  const wait = waitMatch ? Number(waitMatch[1]) : 0;
  const langArg = args.find((a) => a.startsWith("--lang="));
  const lang = langArg?.slice(7) || undefined;
  const [outDir, ...urls] = args.filter((a) => a !== sizeArg && a !== waitArg && a !== langArg);
  if (!outDir || urls.length === 0) {
    console.error("usage: bun tools/shots.ts [--size=390x844] [--wait=<ms>] [--lang=nb-NO] <outDir> <url>...");
    process.exit(2);
  }
  mkdirSync(outDir, { recursive: true });
  const server = wait > 0 ? serveWrapper(wait) : null;
  let failed = 0;
  const blank: string[] = [];
  for (const url of urls) {
    const file = join(outDir, `${nameFor(url)}${size ? `_${size[1]}x${size[2]}` : ""}${lang ? `_${lang}` : ""}.png`);
    rmSync(file, { force: true });
    const started = performance.now();
    const opened = server ? `http://localhost:${server.port}/?u=${encodeURIComponent(url)}` : url;
    const ok = await shoot(opened, file, size ? `${size[1]},${size[2]}` : undefined, lang);
    const secs = ((performance.now() - started) / 1000).toFixed(1);
    const empty = ok && isBlank(file);
    console.log(`${!ok ? "FAILED" : empty ? "BLANK " : "ok    "} ${secs.padStart(5)} s  ${file}`);
    if (!ok) failed++;
    if (empty) blank.push(file);
  }
  server?.stop(true);
  if (blank.length) console.error(`${blank.length} blank, nothing drawn in the middle:\n  ${blank.join("\n  ")}`);
  if (failed) process.exit(1);
  if (blank.length) process.exit(3);
}
