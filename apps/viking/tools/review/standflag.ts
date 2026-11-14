import { LEVELS, play as P } from "./common.ts";
const N = { left: false, right: false, jumpHeld: false, jumpPressed: false };
for (const [id, col] of [["akerselva", 160], ["nordmarka", 192], ["nabolaget", 98]] as const) {
  const def = LEVELS.find((l) => l[0] === id)![1];
  const map = P.levelMap(def);
  const f = P.flagsOf(map).find((f: any) => Math.floor(f.x / 16) === col);
  for (const t0 of [0, 50, 100]) {
    const p = P.newPlay(def, { pole: true });
    P.placeBodyAt(p, f.x, f.bottom);
    p.t = t0;
    let hurt = -1;
    for (let i = 0; i < 600; i++) { const ev = P.stepPlay(p, N); if (ev.hurt && hurt < 0) hurt = i; }
    console.log(`${id} flag col ${col}, clock +${t0}: standing still 10 s, first heart lost after ${hurt < 0 ? "never" : (hurt / 60).toFixed(1) + " s"}; hearts left ${p.hearts}`);
  }
}
