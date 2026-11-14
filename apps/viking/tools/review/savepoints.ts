// Every flag and bench: throwers that can reach it, flyers whose wave passes within two tiles, jumpers within three.
import { LEVELS, play as P } from "./common.ts";
const { THROW_REACH } = await import("../../src/game/enemies.ts");
for (const [id, def] of LEVELS) {
  const map = P.levelMap(def);
  const spots = [...P.flagsOf(map).map((f: any) => ({ ...f, k: "flag" })), ...P.benchesOf(map).map((f: any) => ({ ...f, k: "bench" }))];
  const out: string[] = [];
  for (const s of spots) {
    for (const e of def.enemies ?? []) {
      const ex = e.c * 16 + 8, ey = (e.r + 1) * 16;
      const range = (e.range ?? 0) * 16;
      if (e.kind === "thrower" && Math.abs(ex - s.x) < THROW_REACH.x && Math.abs(s.bottom - 14 - ey) < THROW_REACH.y) out.push(`  ${s.k} col ${Math.floor(s.x / 16)}: thrower ${e.look}@${e.c} can throw at it (${Math.abs(ex - s.x)} px away)`);
      if (e.kind === "flyer" && Math.abs(ex - s.x) < range + 32 && Math.abs(ey - s.bottom) < 40) out.push(`  ${s.k} col ${Math.floor(s.x / 16)}: flyer ${e.look}@${e.c} passes within ${Math.max(0, Math.abs(ex - s.x) - range)} px across, ${Math.abs(ey - s.bottom)} px up`);
      if (e.kind === "jumper" && Math.abs(ex - s.x) < 48) out.push(`  ${s.k} col ${Math.floor(s.x / 16)}: jumper ${e.look}@${e.c} leaps ${Math.abs(ex - s.x)} px away`);
    }
  }
  console.log(id + (out.length ? "\n" + out.join("\n") : ": nothing"));
}
