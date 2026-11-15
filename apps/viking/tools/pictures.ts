// Takes LEVELS.html's pictures again (order 20), from the addresses in `pictures.tsv`, into docs/games/shots/.
// Serve a build of the page first (`bunx vite preview --port 5181`); only the names given are taken, or all.
//
//   bun tools/pictures.ts <base> [name ...]        (from apps/viking; <base> as http://localhost:5181)

import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [base, ...only] = process.argv.slice(2);
if (!base) {
  console.error("usage: bun tools/pictures.ts <base> [name ...]");
  process.exit(2);
}
const here = import.meta.dir;
const shots = join(here, "../../../docs/games/shots");
let failed = 0;
for (const line of readFileSync(join(here, "pictures.tsv"), "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [name, path, how] = line.split("\t");
  if (only.length && !only.includes(name)) continue;
  const dir = mkdtempSync(join(tmpdir(), "pictures-"));
  const proc = Bun.spawn(["bun", join(here, "../../../tools/shots.ts"), ...(how === "wait" ? ["--wait=5000"] : []), dir, `${base}${path}`], { stdout: "ignore", stderr: "inherit" });
  await proc.exited;
  const got = readdirSync(dir).find((f) => f.endsWith(".png"));
  if (got) copyFileSync(join(dir, got), join(shots, `${name}.png`));
  else failed++;
  console.log(`${got ? "ok    " : "FAILED"} ${name}`);
  rmSync(dir, { recursive: true, force: true });
}
if (failed) process.exit(1);
