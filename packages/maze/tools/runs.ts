// The maze's rules held step for step (order 36): the scripted player's run on every level, at key speed and at pointer
// speed, the long way round and through the teleport stones where a level has them, as one fingerprint a run of every
// step's state and events; and the ghosts those runs leave, written out to be replayed by another checkout.
//
//   bun packages/maze/tools/runs.ts [<root>] [--ghosts=<file.json>] [--replay=<file.json>]
//
// `<root>` is the checkout whose maze is played (default: this one), so the same script plays `origin/main`'s maze in a
// worktree and this branch's. `--ghosts` writes each level's ghost (the pointer run's, as the page stores it) to a file;
// `--replay` reads such a file, decodes each ghost with this checkout's code and says where it ends and whether that is in
// the level's finish. Nothing it writes belongs in the repository.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith("--")) ?? join(import.meta.dir, "../../..");
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const src = join(root, "packages/maze/src");

const bot = await import(join(src, "bot.ts"));
const rules = await import(join(src, "rules.ts"));
const levels = await import(join(src, "levels.ts"));
const ghost = await import(join(src, "ghost.ts"));

const LEVELS = levels.LEVELS as { name: string; map: readonly string[] }[];
const md5 = (s: string) => createHash("md5").update(s).digest("hex").slice(0, 12);

/** Plays the scripted player as `playLevel` does, keeping every step's state and events. */
function play(level: number, speed: "keys" | "pointer", portals: boolean) {
  const b = bot.createBot(level, speed, { portals });
  const state = rules.newState(level);
  const lines: string[] = [];
  const trail: { x: number; y: number }[] = [];
  for (let i = 0; i < 60 * 180 && state.phase !== "cleared"; i++) {
    const intent = b.next(state);
    const ev = rules.stepMaze(state, intent);
    b.after(ev);
    if (state.started) trail.push({ x: state.x, y: state.y });
    lines.push(`${i} ${intent.dx} ${intent.dy} ${state.x} ${state.y} ${state.phase} ${state.steps} ${state.deaths} ${state.lit} ${state.keyTaken} ${state.gate} ${state.portalCool} ${JSON.stringify(ev)}`);
  }
  return { hash: md5(lines.join("\n")), steps: state.steps, cleared: state.phase === "cleared", deaths: state.deaths, trail };
}

const ghosts: Record<number, string> = {};
for (let n = 1; n <= LEVELS.length; n++) {
  const hasPortals = levels.mapInfo(LEVELS[n - 1].map).portals.length > 0;
  for (const speed of ["keys", "pointer"] as const)
    for (const portals of hasPortals ? [false, true] : [false]) {
      const r = play(n, speed, portals);
      console.log(`level ${n} ${LEVELS[n - 1].name.padEnd(13)} ${speed.padEnd(7)} ${portals ? "portals" : "       "} ${r.hash}  ${r.steps} steps ${r.cleared ? "cleared" : "NOT CLEARED"} ${r.deaths} curses`);
      if (speed === "pointer" && !portals) {
        const rec = ghost.createRecorder();
        for (const p of r.trail) rec.push(p.x, p.y);
        ghosts[n] = ghost.encodeGhost(rec.points());
      }
    }
}

const out = opt("ghosts");
if (out) {
  writeFileSync(out, JSON.stringify(ghosts, null, 1));
  console.log(`ghosts of ${Object.keys(ghosts).length} levels written to ${out}`);
}

const replay = opt("replay");
if (replay) {
  const stored = JSON.parse(readFileSync(replay, "utf8")) as Record<string, string>;
  for (const [k, text] of Object.entries(stored)) {
    const n = Number(k);
    const points = ghost.decodeGhost(text);
    if (!points) {
      console.log(`ghost ${n}: DOES NOT DECODE`);
      continue;
    }
    const steps = points.length / 2;
    const end = ghost.ghostAt(points, steps - 1);
    const f = levels.mapInfo(LEVELS[n - 1].map).finish;
    const inFinish = end && end.x >= f.c * 16 && end.x < (f.c + 2) * 16 && end.y >= f.r * 16 && end.y < (f.r + 2) * 16;
    console.log(`ghost ${n}: ${text.length} characters, ${steps} steps, points ${md5(Array.from(points).join(","))}, ends at ${end?.x},${end?.y} ${inFinish ? "in the finish" : "NOT IN THE FINISH"}`);
  }
}
