// Screenshots of pages with headless Firefox, one at a time, for comparing a scene before and after
// a change. Chromium cannot render headless on the Pi; Firefox can draw Canvas 2D but fires no
// animation frames, so the pages are opened with `?debug&steps=N` (see packages/pixelkit/src/harness.ts).
//
//   bun tools/shots.ts <outDir> <url>...
//
// Each file is named after the address's path and query. Every run gets a fresh Firefox profile,
// so nothing is remembered between pages (no stored best times, no lock on a shared profile).

import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TIMEOUT_MS = 90_000;

/** `http://localhost:5181/viking/?debug&steps=1&sky=day` as `viking_debug_steps-1_sky-day`. */
export function nameFor(url: string): string {
  const u = new URL(url);
  const path = u.pathname.replace(/^\/+|\/+$/g, "") || "index";
  const query = u.search.replace(/^\?/, "");
  return [path, query]
    .filter(Boolean)
    .join("_")
    .replace(/=/g, "-")
    .replace(/[^A-Za-z0-9.-]+/g, "_");
}

async function shoot(url: string, file: string): Promise<boolean> {
  const profile = mkdtempSync(join(tmpdir(), "shots-"));
  try {
    const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", profile, "--window-size=1280,800", "--screenshot", file, url], {
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
  const [outDir, ...urls] = process.argv.slice(2);
  if (!outDir || urls.length === 0) {
    console.error("usage: bun tools/shots.ts <outDir> <url>...");
    process.exit(2);
  }
  mkdirSync(outDir, { recursive: true });
  let failed = 0;
  for (const url of urls) {
    const file = join(outDir, `${nameFor(url)}.png`);
    rmSync(file, { force: true });
    const started = performance.now();
    const ok = await shoot(url, file);
    const secs = ((performance.now() - started) / 1000).toFixed(1);
    console.log(`${ok ? "ok    " : "FAILED"} ${secs.padStart(5)} s  ${file}`);
    if (!ok) failed++;
  }
  if (failed) process.exit(1);
}
