// Sets the beats of Bjørvika's hooks, sheets, sparks and gust so the scripted route meets each as it
// comes (a step or two of waiting), one after the other along the route; prints the offsets to write in.
const L = await import("../../src/levels/bjorvika.ts");
const R = await import("../../src/levels/routes/bjorvika.ts");
const { newPlay } = await import("../../src/game/play.ts");
const { playMoves } = await import("../../src/game/bot.ts");
const { SHIELD_RULES } = await import("../../src/game/shield.ts");
const run = () => {
  const starts = new Map<string, number>();
  const moves = R.BJORVIKA_ROUTE.map((m: any) => ({ name: m.name, keys: (q: any, s: any) => { if (s.i === 0 && !starts.has(m.name)) starts.set(m.name, q.t); return m.keys(q, s); } }));
  const p = newPlay(L.BJORVIKA, { pole: true, shield: SHIELD_RULES, hasShield: true });
  const r = playMoves(p, moves, { max: 60 * 300 });
  return { starts, r };
};
const mod = (a: number, n: number) => ((a % n) + n) % n;
const steps: [string, (t: number) => void][] = [
  ["the welder's sparks done", (t) => (L.SPARKS.beat!.offset = mod(-(t + 4), 270))],
  ["the first hook at this end", (t) => (L.HOOK_1.offset = mod(-(t + 8), L.HOOK_1.period))],
  ["the second hook at this end", (t) => (L.HOOK_2.offset = mod(-(t + 8), L.HOOK_2.period))],
  ["the third hook at this end", (t) => (L.HOOK_3.offset = mod(-(t + 8), L.HOOK_3.period))],
  ["the sheet over shaft 1 at this end", (t) => {
    const g = L.GUST_BEAT;
    g.offset = mod(-(t + 2), g.rest + g.warn + g.live);
    L.SHEETS[0].offset = mod(-(t + 8), L.SHEETS[0].period);
  }],
  ["the sheet over shaft 2 at this end", (t) => (L.SHEETS[1].offset = mod(-(t + 8), L.SHEETS[1].period))],
  ["the sheet over shaft 3 at this end", (t) => (L.SHEETS[2].offset = mod(-(t + 8), L.SHEETS[2].period))],
  ["the first hook of the traverse at this end", (t) => {
    L.HOOK_5.offset = mod(-(t + 8), L.HOOK_5.period);
    L.HOOK_6.offset = mod(L.HOOK_5.offset + L.HOOK_6.period / 2, L.HOOK_6.period);
    L.HOOK_7.offset = L.HOOK_5.offset;
  }]
];
for (const [name, set] of steps) {
  const { starts } = run();
  const t = starts.get(name);
  if (t === undefined) throw new Error(`no ${name}`);
  set(t);
}
const { r } = run();
console.log({ done: r.done, seconds: r.seconds.toFixed(1), hurt: r.hurt.length });
console.log({ sparks: L.SPARKS.beat!.offset, h1: L.HOOK_1.offset, h2: L.HOOK_2.offset, h3: L.HOOK_3.offset, gust: L.GUST_BEAT.offset, sheets: L.SHEETS.map((s: any) => s.offset), h5: L.HOOK_5.offset, h6: L.HOOK_6.offset, h7: L.HOOK_7.offset });
