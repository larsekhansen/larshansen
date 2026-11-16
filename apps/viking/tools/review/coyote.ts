// The sloppy player on fresh seeds with the edge's forgiveness set (order 24, section 3): `coyote=<steps>` before the
// rest of `fresh.ts`'s arguments. Order 23 measured 6 against 10 this way (ADR 0048).
//
//   bun coyote.ts coyote=6 levels=langkaia ks=2,4 seeds=60 first=201 out=<dir>/langkaia.jsonl
import { JUMP } from "@larshansen/pixelkit/config";

const steps = Number(process.argv.find((a) => a.startsWith("coyote="))?.slice(7));
if (!steps) throw new Error("coyote=<steps> is wanted");
JUMP.coyoteSteps = steps;
await import("./fresh.ts");
