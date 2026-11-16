// The edge's places (order 24, section 3): one seed of the sloppy player replayed step by step with the jump still
// working 6 steps after leaving an edge and with 10, side by side. Says where the two runs part, what the late jump did
// there (how many steps after he left the ground it went, from where, to where), and every heart lost after it in each.
//
//   bun edgeplace.ts <level> <k> <seed> [--steps]      (from tools/review)
//
// `--steps` prints the twenty steps either side of the parting for both runs.

import { JUMP, PLAYER, TILE } from "@larshansen/pixelkit/config";
import { LEVELS, POLE } from "./common";
import { reference, sloppyRun } from "./sloppy";

const [id, kArg, seedArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const showSteps = process.argv.includes("--steps");
/** `--after=<steps>`: also every fifth step that long after the parting, with 10 (where he lands, where he is lost). */
const after = Number(process.argv.find((a) => a.startsWith("--after="))?.slice(8) ?? 0);
const entry = (LEVELS as unknown as [string, any, any[]][]).find((l) => l[0] === id);
if (!entry) throw new Error(`no level ${id}`);
const [, def, moves] = entry;
const k = Number(kArg);
const seed = Number(seedArg);
const pole = POLE.has(id);

interface Step {
  n: number;
  x: number;
  feet: number;
  vy: number;
  ground: boolean;
  /** Steps since he last stood on ground (0 on the ground). */
  air: number;
  move: string;
  hurt: string | null;
  jumped: boolean;
}

function trace(coyote: number) {
  const was = JUMP.coyoteSteps;
  JUMP.coyoteSteps = coyote;
  const steps: Step[] = [];
  let air = 0;
  let prevVy = 0;
  let prevGround = true;
  (globalThis as any).__onStep = (p: any, ev: any, A: any, ms: any[]) => {
    const b = p.body;
    const jumped = b.vy < -2 && prevVy >= -0.5 && !ev.stomp && !ev.launched;
    air = b.onGround ? 0 : air + 1;
    steps.push({ n: steps.length, x: Math.round(b.x + PLAYER.w / 2), feet: Math.round(b.y + PLAYER.h), vy: Math.round(b.vy * 10) / 10, ground: b.onGround, air: prevGround ? 0 : air, move: ms[A.m]?.name ?? "", hurt: ev.hurt ? String(ev.hurtBy ?? ev.hurt) : null, jumped });
    prevVy = b.vy;
    prevGround = b.onGround;
  };
  try {
    const ref = reference(def, moves, pole);
    const res = sloppyRun(id, def, moves, ref, { k, drop: 0, overhold: 0, seed, pole });
    return { steps, res };
  } finally {
    JUMP.coyoteSteps = was;
    delete (globalThis as any).__onStep;
  }
}

const six = trace(6);
const ten = trace(10);
const same = (a: Step, b: Step) => a.x === b.x && a.feet === b.feet && a.ground === b.ground;
let part = -1;
for (let n = 0; n < Math.min(six.steps.length, ten.steps.length); n++)
  if (!same(six.steps[n], ten.steps[n])) {
    part = n;
    break;
  }
const col = (x: number) => Math.floor(x / TILE);
console.log(`${id} ±${k} seed ${seed}: with 6 ${six.res.outcome}, ${six.res.hurts.length} hearts; with 10 ${ten.res.outcome}, ${ten.res.hurts.length} hearts`);
if (part < 0) {
  console.log("  the two runs never part");
  process.exit(0);
}
// The step before they part: the jump that went with 10 and not with 6 (or the other way).
const t = ten.steps[part];
const s = six.steps[part];
const leftAt = (() => {
  let n = part;
  while (n > 0 && !ten.steps[n - 1].ground) n--;
  return ten.steps[Math.max(0, n - 1)];
})();
console.log(`  they part at step ${part} (${(part / 60).toFixed(1)} s), column ${col(t.x)}, in the move "${t.move}"`);
console.log(`  with 10: x ${t.x}, feet ${t.feet}, vy ${t.vy}${t.jumped ? `, a jump ${ten.steps[part - 1]?.air ?? 0 + 1} steps after he left the ground at column ${col(leftAt.x)} (feet ${leftAt.feet})` : ""}`);
console.log(`  with 6:  x ${s.x}, feet ${s.feet}, vy ${s.vy}${s.jumped ? ", a jump" : ""}`);
/** Where each run is a second and two seconds later. */
for (const dt of [30, 60, 120]) {
  const a = ten.steps[part + dt];
  const b = six.steps[part + dt];
  if (a && b) console.log(`  +${(dt / 60).toFixed(1)} s: with 10 column ${col(a.x)} feet ${a.feet}${a.ground ? "" : " (in the air)"}; with 6 column ${col(b.x)} feet ${b.feet}${b.ground ? "" : " (in the air)"}`);
}
const hurtsAfter = (r: typeof six) => r.res.hurts.filter((h: any) => (h.t ?? 0) >= part).map((h: any) => `column ${col(h.x)}${h.cause ? ` (${h.cause})` : ""} at ${((h.t ?? 0) / 60).toFixed(1)} s`);
console.log(`  hearts after it, with 10: ${hurtsAfter(ten).join("; ") || "none"}`);
console.log(`  hearts after it, with 6:  ${hurtsAfter(six).join("; ") || "none"}`);
if (showSteps)
  for (let n = Math.max(0, part - 20); n < part + 20; n++) {
    const a = ten.steps[n];
    const b = six.steps[n];
    const f = (q?: Step) => (q ? `${String(q.x).padStart(5)} ${String(q.feet).padStart(4)} ${q.ground ? "G" : "."} vy${String(q.vy).padStart(5)} air${String(q.air).padStart(3)}${q.jumped ? " J" : "  "}${q.hurt ? " HURT" : "     "}` : "");
    console.log(`  ${String(n).padStart(5)} | 10: ${f(a)} | 6: ${f(b)} | ${a?.move ?? ""}`);
  }

if (after)
  for (let n = part; n < part + after; n += 5) {
    const a = ten.steps[n];
    if (a) console.log(`  +${n - part} with 10: column ${col(a.x)} x ${a.x} feet ${a.feet} ${a.ground ? "on the ground" : "in the air"}${a.hurt ? " HURT" : ""} | ${a.move}`);
  }
console.log(`  with 10 the run ended ${ten.res.outcome} at column ${col(ten.res.lastX)}, feet ${ten.res.feet}, in "${ten.res.lastMove}"`);
