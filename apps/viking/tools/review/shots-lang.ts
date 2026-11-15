// Screenshots in another language (line 2's review, 15 November 2026): as tools/shots.ts, without --wait,
// but the fresh Firefox profile asks for `lang` first (default nb-NO), so the game speaks Norwegian.
//   bun shots-lang.ts [--lang=nb-NO] [--size=390x844] <outDir> <url>...
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nameFor } from "../../../../tools/shots.ts";

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith("--lang="))?.slice(7) ?? "nb-NO";
const size = /^--size=(\d+)x(\d+)$/.exec(args.find((a) => a.startsWith("--size=")) ?? "");
const [outDir, ...urls] = args.filter((a) => !a.startsWith("--"));
mkdirSync(outDir, { recursive: true });
for (const url of urls) {
  const file = join(outDir, `${nameFor(url)}_${lang}${size ? `_${size[1]}x${size[2]}` : ""}.png`);
  const profile = mkdtempSync(join(tmpdir(), "shots-"));
  writeFileSync(join(profile, "user.js"), `user_pref("intl.accept_languages", "${lang}");\nuser_pref("intl.locale.requested", "${lang}");\n`);
  const proc = Bun.spawn(["firefox", "--headless", "--no-remote", "--profile", profile, `--window-size=${size ? `${size[1]},${size[2]}` : "1280,800"}`, "--screenshot", file, url], { stdout: "ignore", stderr: "ignore" });
  const timer = setTimeout(() => proc.kill(), 90_000);
  await proc.exited;
  clearTimeout(timer);
  rmSync(profile, { recursive: true, force: true });
  console.log(`${existsSync(file) && statSync(file).size > 0 ? "ok    " : "FAILED"} ${file}`);
}
