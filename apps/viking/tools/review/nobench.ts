// Line 2 review (15 November 2026): a life lost in the serpent's fight without having sat on its bench: where is he put back? Run: bun nobench.ts
import { LEVELS, play as P } from "./common.ts";
const NONE: any = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const def = LEVELS.find((l) => l[0] === "gamlebyen")![1] as any;
const map = P.levelMap(def);
const flags = P.flagsOf(map);
const f = flags.at(-1);
const p = P.newPlay(def, { pole: true });
// As if he had come over the longships: flag 216 raised, standing on the quay at col 237, not having sat at the bench.
P.placeBodyAt(p, 237 * 16 + 8, 13 * 16);
p.save = { ...f }; p.checkpoints = { reached: flags.length - 1 }; for (let i = 0; i < flags.length; i++) p.raisedAt[i] = 0;
const cx = () => p.body.x + 5;
for (let n = 0; n < 60 * 120; n++) {
  const k = cx() < 250 * 16 ? { ...NONE, right: true } : { ...NONE };
  const ev = P.stepPlay(p, k);
  if (ev.lifeLost) { console.log(`life lost at ${(n / 60).toFixed(1)} s; put back at col ${(cx() / 16).toFixed(1)} (save col ${(p.save.x / 16).toFixed(1)}); serpent ${p.boss.state.phase}, hits ${p.boss.state.hits}`); break; }
}
