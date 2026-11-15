// How much a frame draws, at many places at once (order 20): each address is opened with `?debug&perf`,
// the page draws the frame fifty times and sends its perf line here (`post`, in `src/debug.ts`), and the
// line goes into a table. Like `strips.ts`, this serves the small wrapper page headless Firefox opens and
// holds its load event back until the line has come (or 40 s), so Firefox does not close the page first.
//
//   bun tools/glance/perf.ts [--size=390x844] [--port=5187] <out.tsv> <base> <places.tsv>
//
// <base> is where the built game is served, as http://localhost:5184. Each line of the places file is a
// name, a tab, and the address's path and query (`walk.ts` writes such a file). The table has one line per
// place: name, rectangles, colours, images, ms a frame, and who drew most (named on the dev server only).

import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapperPage } from "../../../../tools/shots";

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const [out, base, list] = args.filter((a) => !a.startsWith("--"));
if (!out || !base || !list) {
  console.error("usage: bun tools/glance/perf.ts [--size=390x844] [--port=5187] <out.tsv> <base> <places.tsv>");
  process.exit(2);
}
const [w, h] = (opt("size") ?? "1280x800").split("x").map(Number);
const PORT = Number(opt("port") ?? 5187);

const lines = new Map<string, string>();
const came = new Map<string, () => void>();
const server = Bun.serve({
  port: PORT,
  hostname: "localhost",
  idleTimeout: 60,
  async fetch(req) {
    const u = new URL(req.url);
    const name = u.searchParams.get("name") ?? "";
    if (u.pathname === "/perf" && req.method === "POST") {
      lines.set(name, await req.text());
      came.get(name)?.();
      return new Response("ok", { headers: { "access-control-allow-origin": "*" } });
    }
    if (u.pathname === "/slow") {
      await new Promise<void>((done) => {
        const timer = setTimeout(done, 40_000);
        came.set(name, () => {
          clearTimeout(timer);
          done();
        });
      });
      return new Response(Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0)), { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
    }
    const target = u.searchParams.get("u");
    if (u.pathname === "/" && target) return new Response(wrapperPage(target).replace('src="/slow"', `src="/slow?name=${encodeURIComponent(name)}"`), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    return new Response("not here", { status: 404 });
  }
});

async function measure(url: string, name: string): Promise<string | null> {
  const profile = mkdtempSync(join(tmpdir(), "perf-"));
  try {
    const opened = `http://localhost:${PORT}/?name=${encodeURIComponent(name)}&u=${encodeURIComponent(url)}`;
    const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", profile, `--window-size=${w},${h}`, "--screenshot", join(profile, "shot.png"), opened], { stdout: "ignore", stderr: "ignore" });
    const timer = setTimeout(() => proc.kill(), 90_000);
    await proc.exited;
    clearTimeout(timer);
    return lines.get(name) ?? null;
  } finally {
    came.delete(name);
    rmSync(profile, { recursive: true, force: true });
  }
}

writeFileSync(out, "");
let failed = 0;
for (const line of readFileSync(list, "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [name, path] = line.split("\t");
  const [front, hash] = path.split("#");
  const url = `${base}${front}&perf&post=${PORT}&name=${encodeURIComponent(name)}${hash ? `#${hash}` : ""}`;
  const got = await measure(url, name);
  const m = got && /perf: (\d+) rects, (\d+) colours, (\d+) images, ([\d.]+) ms a frame\. ?(.*)$/.exec(got);
  if (!m) failed++;
  const row = m ? [name, m[1], m[2], m[3], m[4], m[5]] : [name, "", "", "", "", got ?? "no answer"];
  appendFileSync(out, row.join("\t") + "\n");
  console.log(row.slice(0, 5).join("\t"));
}
server.stop(true);
if (failed) process.exit(1);
