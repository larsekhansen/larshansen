// Plays one level's route once, through the real rules, and says where it went: for building a route.
//   bun tryroute.ts <level-file-id> <EXPORT> <ROUTE_EXPORT> [feather]
const [id, exp, rexp, feather] = process.argv.slice(2);
const L = await import(`../../src/levels/${id}.ts`);
const R = await import(`../../src/levels/routes/${id}.ts`);
const { newPlay } = await import("../../src/game/play.ts");
const { playMoves } = await import("../../src/game/bot.ts");
const { SHIELD_RULES } = await import("../../src/game/shield.ts");
const def = L[exp];
const p = newPlay(def, { pole: true, shield: SHIELD_RULES, hasShield: def.rune > 10, feather: !!feather });
const moves = R[rexp];
const names: string[] = [];
const watched = moves.map((m: any, i: number) => ({ name: m.name, keys: (q: any, s: any) => { if (s.i === 0 && names[names.length - 1] !== m.name) names.push(`${(q.t / 60).toFixed(1)}s [${q.t}] ${m.name} @${Math.floor((q.body.x + 5) / 16)},${((q.body.y + 14) / 16).toFixed(2)}`); return m.keys(q, s); } }));
const r = playMoves(p, watched, { max: 60 * 300 });
console.log(names.slice(-200).join("\n"));
console.log({ done: r.done, stuck: r.stuck, seconds: r.seconds, hurt: r.hurt, splashes: r.events.filter((e: any) => e.splash).length, flags: r.events.filter((e: any) => e.flag !== null).map((e: any) => e.flag), found: p.found, of: p.skilling.length, at: [Math.floor((p.body.x + 5) / 16), (p.body.y + 14) / 16] });
