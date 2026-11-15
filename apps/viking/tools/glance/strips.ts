// Frame strips (order 19): what he sees in the half second after each event, every third step for 30
// steps, cropped round him, with the header's hearts, lives and skilling under each frame and the sounds
// played since the frame before. Each strip is made in the page (`?debug&strip`, in `src/debug.ts`) and
// sent here as a PNG; this serves the small wrapper page headless Firefox opens and holds its load event
// back until the strip has come (or 40 s), so Firefox does not close the page before it is sent.
//
//   bun tools/glance/strips.ts [--size=390x844] [--sky=day|night] [--only=<name>,...] <outDir> <base> <events.tsv>
//
// <base> is where the built game is served, as http://localhost:5184. Each line of the events file is a
// name, a tab, and the address's path and query without the sky (`tools/glance/events.tsv`). The strips
// are written as <outDir>/<name>_<sky>_<width>.png. Bun only; Firefox headless.

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapperPage } from "../../../../tools/shots";

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const [outDir, base, list] = args.filter((a) => !a.startsWith("--"));
if (!outDir || !base || !list) {
  console.error("usage: bun tools/glance/strips.ts [--size=390x844] [--sky=day] [--only=a,b] <outDir> <base> <events.tsv>");
  process.exit(2);
}
const [w, h] = (opt("size") ?? "1280x800").split("x").map(Number);
const sky = opt("sky") ?? "day";
const only = opt("only")?.split(",");
const PORT = Number(opt("port") ?? 5187);
mkdirSync(outDir, { recursive: true });

/** Strips that have come, by name: the wrapper's slow image answers when its strip is here. */
const came = new Map<string, () => void>();
const server = Bun.serve({
  port: PORT,
  hostname: "localhost",
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/strip" && req.method === "POST") {
      const name = u.searchParams.get("name") ?? "strip";
      const data = (await req.text()).replace(/^data:image\/png;base64,/, "");
      writeFileSync(join(outDir, `${name}.png`), Buffer.from(data, "base64"));
      came.get(name)?.();
      return new Response("ok", { headers: { "access-control-allow-origin": "*" } });
    }
    if (u.pathname === "/slow") {
      const name = u.searchParams.get("name") ?? "";
      await new Promise<void>((done) => {
        const timer = setTimeout(done, 40_000);
        came.set(name, () => {
          clearTimeout(timer);
          // A moment more, so the page has finished with it.
          setTimeout(done, 300);
        });
      });
      return new Response(Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0)), { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
    }
    const target = u.searchParams.get("u");
    const name = u.searchParams.get("name") ?? "";
    if (u.pathname === "/" && target) return new Response(wrapperPage(target).replace('src="/slow"', `src="/slow?name=${encodeURIComponent(name)}"`), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    return new Response("not here", { status: 404 });
  }
});

async function shoot(url: string, name: string): Promise<boolean> {
  const profile = mkdtempSync(join(tmpdir(), "strips-"));
  const file = join(profile, "shot.png");
  const out = join(outDir, `${name}.png`);
  rmSync(out, { force: true });
  try {
    const opened = `http://localhost:${PORT}/?name=${encodeURIComponent(name)}&u=${encodeURIComponent(url)}`;
    const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", profile, `--window-size=${w},${h}`, "--screenshot", file, opened], { stdout: "ignore", stderr: "ignore" });
    const timer = setTimeout(() => proc.kill(), 90_000);
    await proc.exited;
    clearTimeout(timer);
    return existsSync(out);
  } finally {
    came.delete(name);
    rmSync(profile, { recursive: true, force: true });
  }
}

let failed = 0;
for (const line of readFileSync(list, "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [event, path] = line.split("\t");
  if (only && !only.includes(event)) continue;
  const name = `${event}_${sky}_${w}`;
  const [front, hash] = path.split("#");
  const url = `${base}${front}&sky=${sky}&strip=${encodeURIComponent(name)}&post=${PORT}${hash ? `#${hash}` : ""}`;
  const t0 = performance.now();
  const ok = await shoot(url, name);
  console.log(`${ok ? "ok    " : "FAILED"} ${((performance.now() - t0) / 1000).toFixed(1).padStart(5)} s  ${name}`);
  if (!ok) failed++;
}
server.stop(true);
if (failed) process.exit(1);
