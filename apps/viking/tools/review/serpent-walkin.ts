// Line 2 review (15 November 2026): a player who wakes the serpent and walks on to col 250.5, then learns the shield and the stomp from the hints: every event traced. Run: bun serpent-walkin.ts
import { LEVELS, play as P } from "./common.ts";
const def = LEVELS.find((l) => l[0] === "gamlebyen")![1] as any;
const map = P.levelMap(def);
const bench = P.benchesOf(map).at(-1);
const NONE: any = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const p = P.newPlay(def, { pole: true });
P.placeBodyAt(p, bench.x, bench.bottom); p.save = { ...bench };
const cx = () => p.body.x + 5; const S = () => p.boss.state; const neck = () => S().def.points[S().at];
const up = () => ["rise", "rear", "spit"].includes(S().phase);
let hints: string[] = []; let inq = false; let last = "";
for (let n = 0; n < 60 * 45; n++) {
  let k: any = NONE;
  if (!inq && cx() < 248 * 16 + 40) k = { ...NONE, right: true }; else {
    inq = true;
    const st = S();
    if (hints.includes("missHead") && (st.phase === "dazed" || (!p.body.onGround && st.phase === "reel"))) {
      const hx = st.def.points[st.at] + st.dir * 6;
      if (!p.body.onGround) { const aim = hx - p.body.vx * 7 - cx(); k = { ...NONE, left: aim < -2, right: aim > 2, jumpHeld: true }; }
      else { const d = hx - cx(); k = Math.abs(d) > 26 ? { ...NONE, left: d < 0, right: d > 0 } : { ...NONE, left: d < -2, right: d > 2, jumpHeld: true, jumpPressed: true }; }
    } else if (!p.body.onGround) k = { ...NONE, jumpHeld: true };
    else if (hints.includes("miss") && up()) k = { ...NONE, left: neck() < cx() && p.body.facing > 0, right: neck() > cx() && p.body.facing < 0, shield: true };
    else k = { ...NONE, left: neck() < cx() && p.body.facing > 0, right: neck() > cx() && p.body.facing < 0 };
  }
  const ev = P.stepPlay(p, k);
  if (ev.boss && /miss|wake/.test(ev.boss)) hints.push(ev.boss);
  const line = `${S().phase} at=${S().at} neck=${(neck()/16).toFixed(1)} him=${(cx()/16).toFixed(1)} face=${p.body.facing} sh=${p.shield?.raise} ball=${S().ball ? (S().ball.x/16).toFixed(1) + (S().ball.back ? "b" : "") : "-"}`;
  if (ev.hurt || ev.boss || ev.blocked || n % 30 === 0) console.log((n / 60).toFixed(2), line, ev.hurt ? "HURT" : "", ev.boss ?? "", ev.blocked ? "BLOCKED" : "");
}
