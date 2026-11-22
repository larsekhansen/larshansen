// How much a frame draws, at many places at once (order 20): each address is opened with `?debug&perf`,
// the page draws the frame fifty times and sends its perf line here (`post`, in `src/debug.ts`), and the
// line goes into a table.
//
//   bun tools/glance/perf.ts [--size=390x844] [--port=5187] [--each] <out.tsv> <base> <places.tsv>
//
// <base> is where the built game is served, as http://localhost:5184. Each line of the places file is a
// name, a tab, and the address's path and query (`walk.ts` writes such a file). The table has one line per
// place: name, rectangles, colours, images, ms a frame, and who drew most (named on the dev server only).
//
// Since order 35 every place is measured in one browser: headless Firefox opens a small page served here, which opens
// each place in turn in a frame filling the window and waits for its line before it opens the next (the frame is the
// window's size, as the page's own was). The game is served through this tool from <base>, so the small page shares its
// origin and empties the game's storage before each place, as a fresh browser had it. The page's load event, which
// Firefox takes its picture at and closes after, is held back until the last line has come. It took about forty seconds a
// place with a browser started for each (`--each` still does that); in one it takes a few.

import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapperPage } from "../../../../tools/shots";

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const [out, base, list] = args.filter((a) => !a.startsWith("--"));
if (!out || !base || !list) {
  console.error("usage: bun tools/glance/perf.ts [--size=390x844] [--port=5187] [--each] <out.tsv> <base> <places.tsv>");
  process.exit(2);
}
const [w, h] = (opt("size") ?? "1280x800").split("x").map(Number);
const PORT = Number(opt("port") ?? 5187);
const EACH = args.includes("--each");
/** How long a place may take to send its line. */
const PLACE_MS = 40_000;
const GIF = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));

const places: { name: string; url: string }[] = [];
for (const line of readFileSync(list, "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [name, path] = line.split("\t");
  const [front, hash] = path.split("#");
  places.push({ name, url: `${front}&perf&post=${PORT}&name=${encodeURIComponent(name)}${hash ? `#${hash}` : ""}` });
}

const lines = new Map<string, string>();
const came = new Map<string, () => void>();
/** Waits for a place's line, or `ms`. */
const lineOf = (name: string, ms: number) =>
  lines.has(name)
    ? Promise.resolve()
    : new Promise<void>((done) => {
        const timer = setTimeout(done, ms);
        came.set(name, () => {
          clearTimeout(timer);
          done();
        });
      });
let finished: () => void = () => undefined;
const allDone = new Promise<void>((done) => (finished = done));

/** The page that opens every place in turn in one browser, waiting for each one's line. */
const driver = () => `<!doctype html>
<html><head><meta charset="utf-8"><title>perf</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}iframe{position:fixed;left:0;top:0;width:100%;height:100%;border:0}img{position:fixed;left:0;top:0;width:1px;height:1px;opacity:0}</style>
</head><body><iframe src="about:blank"></iframe><img src="/slow" alt="">
<script>
const places = ${JSON.stringify(places)};
const frame = document.querySelector("iframe");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const p of places) {
    frame.src = "about:blank";
    await pause(30);
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
    frame.src = p.url;
    await fetch("/wait?name=" + encodeURIComponent(p.name)).then((r) => r.text()).catch(() => "");
  }
  frame.src = "about:blank";
  await fetch("/done");
})();
</script></body></html>`;

const server = Bun.serve({
  port: PORT,
  hostname: "localhost",
  idleTimeout: 0,
  async fetch(req) {
    const u = new URL(req.url);
    const name = u.searchParams.get("name") ?? "";
    if (u.pathname === "/perf" && req.method === "POST") {
      lines.set(name, await req.text());
      came.get(name)?.();
      return new Response("ok", { headers: { "access-control-allow-origin": "*" } });
    }
    if (u.pathname === "/wait") {
      await lineOf(name, PLACE_MS);
      return new Response(lines.has(name) ? "ok" : "timeout", { headers: { "cache-control": "no-store" } });
    }
    if (u.pathname === "/done") {
      finished();
      return new Response("ok");
    }
    if (u.pathname === "/slow") {
      // One browser for every place: held until the last has sent its line; a browser a place: until its line has come.
      await (EACH ? lineOf(name, PLACE_MS) : allDone);
      return new Response(GIF, { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
    }
    if (u.pathname === "/drive") return new Response(driver(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    const target = u.searchParams.get("u");
    if (EACH && u.pathname === "/" && target) return new Response(wrapperPage(target).replace('src="/slow"', `src="/slow?name=${encodeURIComponent(name)}"`), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    // The game, from where it is served, so it shares this page's origin.
    const got = await fetch(`${base}${u.pathname}${u.search}`);
    const headers = new Headers(got.headers);
    // The body comes decoded: it is passed on as it is.
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(await got.arrayBuffer(), { status: got.status, headers });
  }
});

/** Headless Firefox at the window's size on `url` with a fresh profile, killed after `ms`. */
async function firefox(url: string, ms: number) {
  const profile = mkdtempSync(join(tmpdir(), "perf-"));
  try {
    const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", profile, `--window-size=${w},${h}`, "--screenshot", join(profile, "shot.png"), url], { stdout: "ignore", stderr: "ignore" });
    const timer = setTimeout(() => proc.kill(), ms);
    await proc.exited;
    clearTimeout(timer);
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}

const started = performance.now();
if (EACH)
  for (const p of places) {
    await firefox(`http://localhost:${PORT}/?name=${encodeURIComponent(p.name)}&u=${encodeURIComponent(`${base}${p.url}`)}`, 90_000);
    came.delete(p.name);
  }
else await firefox(`http://localhost:${PORT}/drive`, 60_000 + places.length * (PLACE_MS + 5_000));
server.stop(true);

writeFileSync(out, "");
let failed = 0;
for (const p of places) {
  const got = lines.get(p.name);
  const m = got && /perf: (\d+) rects, (\d+) colours, (\d+) images, ([\d.]+) ms a frame\. ?(.*)$/.exec(got);
  if (!m) failed++;
  const row = m ? [p.name, m[1], m[2], m[3], m[4], m[5]] : [p.name, "", "", "", "", got ?? "no answer"];
  appendFileSync(out, row.join("\t") + "\n");
  console.log(row.slice(0, 5).join("\t"));
}
console.log(`${places.length} places in ${((performance.now() - started) / 1000).toFixed(0)} s, ${failed} without a line`);
if (failed) process.exit(1);
