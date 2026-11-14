const M = "../../../../packages/maze/src";
const L = await import(`${M}/levels.ts`);
const R = await import(`${M}/rules.ts`);
for (const [i, def] of (L.LEVELS as any[]).entries()) {
  const info = L.mapInfo(def.map);
  const stones = L.findTiles(def.map, "o");
  const start = L.startCentre(def.map);
  const spots = [{ name: "start", ...start }, ...stones.map((s: any, k: number) => ({ name: `stone${k}(${s.c},${s.r})`, ...L.centreOf(s.c, s.r) })), ...info.portals.map((p: any) => ({ name: `portal(${p.c},${p.r})->(${p.twin.c},${p.twin.r})`, ...L.centreOf(p.twin.c, p.twin.r) }))];
  const issues: string[] = [];
  // For each spot, over a full period of every snake, the closest a snake comes, and how many steps after respawn the first touch is.
  for (const s of spots) {
    let firstTouch = Infinity, minDist = Infinity;
    for (let t = 0; t < 2400; t++) {
      for (const sn of def.snakes) {
        const st = { def: sn, t };
        if (R.touchesSnake(st, s.x, s.y)) firstTouch = Math.min(firstTouch, t);
        const a = R.snakeAt(sn, t); minDist = Math.min(minDist, Math.hypot(a.x - s.x, a.y - s.y));
      }
    }
    // sliders: any slider within 1 tile of the spot
    const near = def.sliders.filter((sl: any) => s.x >= (sl.at[0] - 0.5) * 16 && s.x <= (sl.at[0] + sl.w + 0.5) * 16 && s.y >= (sl.at[1] - 0.5) * 16 && s.y <= (sl.at[1] + sl.h + 0.5) * 16);
    if (firstTouch < Infinity || minDist < 20 || near.length) issues.push(`  ${s.name}: snake ${firstTouch < Infinity ? "TOUCHES it " + firstTouch + " steps after a respawn/arrival at t=0" : "closest " + minDist.toFixed(0) + " px"}${near.length ? `, slider within half a tile: ${JSON.stringify(near.map((n: any) => n.at))}` : ""}`);
  }
  console.log(`level ${i + 1} ${def.name}${def.dark ? " (dark)" : ""}: ${def.snakes.length} snakes, ${def.sliders.length} sliders, ${stones.length} stones, ${info.portals.length} portals, par ${def.par}s`);
  for (const x of issues) console.log(x);
}
