// Which colours could join the enemy palette (order 24): every candidate measured as `render/palette.test.ts` measures a
// body colour, against every level's fields by day and under the evening, twilight and night tints (with a quarter of its
// own light back), against the red outline (20, and 10 without telling red from green), and against every other role's
// colours (10). Prints the candidates that pass, nearest first, and for the named ones (`--show`) where each fails.
//
//   bun tools/glance/tones.ts [--show=#7a4a2a,#5a3a22] [--grid]
//
// `--grid` searches a grid of browns, dark oranges, greens and pinks; without it, only the named candidates.

import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { skyFor, type Phase } from "@larshansen/pixelkit/oslo";
import { target, view } from "@larshansen/pixelkit/paint";
import { drawSky } from "@larshansen/pixelkit/sky";
import { BUILT, loadLevel } from "../../src/levels/index";
import { FIELD_SHARE, areaRecorder, colourBlind, deltaE, hex, levelFields, mixRgb, parseColour, tinted, type Rgb } from "../../src/render/fields";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=") as [string, string]));
const rgb = (c: string) => parseColour(c)!.rgb;
const PHASES: Phase[] = ["day", "evening", "twilight", "night"];
const SKY_BODIES = ["#fff3b8", "#ffb26b", "#e9eefb"];

const fields = new Map<string, string[]>();
for (const st of BUILT) fields.set(st.id, [...levelFields(await loadLevel(st.id), "day", FIELD_SHARE).keys()]);
const skies = new Map<Phase, string[]>();
for (const phase of PHASES) {
  const rec = areaRecorder();
  target(rec.ctx);
  Object.assign(view, { w: 320, h: 200, camX: 0, camY: 0 });
  drawSky(skyFor(new Date(2026, 5, 15, 12), phase), 0);
  skies.set(phase, [...rec.area.keys()].filter((c) => !SKY_BODIES.includes(c)));
}
const OTHER_ROLES = Object.entries(ROLES.COLOURS).filter(([k]) => k !== "enemy").flatMap(([k, cs]) => cs.map((c) => [k, c] as const));

/** The nearest thing a candidate comes to, and how near. */
function measure(c: string): { worst: number; what: string } {
  let worst = Infinity;
  let what = "";
  const me = rgb(c);
  for (const phase of PHASES)
    for (const [id, f] of fields)
      for (const field of [...f, ...(skies.get(phase) ?? [])]) {
        const fg: Rgb = phase === "day" ? me : mixRgb(tinted(me, phase), me, 0.25);
        const d = deltaE(fg, tinted(rgb(field), phase));
        if (d < worst) [worst, what] = [d, `${field} in ${id} (${phase})`];
      }
  const red = deltaE(me, rgb(ENEMY.red));
  if (red / 2 < worst) [worst, what] = [red / 2, `the red outline (${red.toFixed(1)}, 20 wanted)`];
  for (const kind of ["deutan", "protan"] as const) {
    const d = deltaE(colourBlind(me, kind), colourBlind(rgb(ENEMY.red), kind));
    if (d < worst) [worst, what] = [d, `the red outline, ${kind}`];
  }
  for (const [role, o] of OTHER_ROLES) {
    const d = deltaE(me, rgb(o));
    if (d < worst) [worst, what] = [d, `${role} ${o}`];
  }
  return { worst, what };
}

const named = (args.show ?? "").split(",").filter(Boolean);
for (const c of named) {
  const m = measure(c);
  console.log(`${c}: ${m.worst >= 10 ? "passes" : "fails"}, nearest ${m.what} at ${m.worst.toFixed(1)}`);
}
if ("grid" in args) {
  const ok: { c: string; worst: number; what: string }[] = [];
  for (let h = 0; h < 360; h += 6)
    for (const s of [0.35, 0.5, 0.65, 0.8])
      for (const v of [0.25, 0.32, 0.4, 0.48, 0.56]) {
        const k = (n: number) => (n + h / 60) % 6;
        const f = (n: number) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
        const c = hex([f(5) * 255, f(3) * 255, f(1) * 255] as Rgb);
        const m = measure(c);
        if (m.worst >= 10) ok.push({ c, ...m });
      }
  ok.sort((a, b) => b.worst - a.worst);
  console.log(`${ok.length} dark tones pass:`);
  for (const o of ok.slice(0, 60)) console.log(`  ${o.c} nearest ${o.what} at ${o.worst.toFixed(1)}`);
}
