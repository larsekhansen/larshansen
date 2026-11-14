import { carrierAt } from "@larshansen/pixelkit/carrier";
import { carrier, cx, jump, leap, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { untilThrow } from "../../game/enemies";
import { TROLL_STEPS, type Troll } from "../../game/troll";
import { MOOSE, TROLL_DEF } from "../nordmarka";
import { riding } from "./common";

// Nordmarka's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules, the front page's single jump and the ski pole: into the dark, over the bog pits and the
// stones, the moose across the marsh, past Ullevålseter and Jernhaugen, the dash over the gorge, and
// the troll at dawn: three times it is lured into the light, its wave jumped, its face lit.

const troll = (q: Play) => q.troll as Troll;

/**
 * One round with the troll: stand just short of where the dawn falls, so it stops in the light to
 * swing; step back from the club while it is raised; jump as it comes down, so the wave goes under;
 * then look at it. Done when the dawn has hit it.
 */
function round(k: number): Move[] {
  const stand = TROLL_DEF.dawn[k][0] - 8;
  return [
    walk(stand),
    // (A round may already be won: looked at in the light before the route got here.)
    wait(`the troll comes, round ${k + 1}`, (q) => troll(q).phase === "windup" || troll(q).hits > k),
    {
      name: `back from the club, jump the wave, look at it, round ${k + 1}`,
      keys(q, s) {
        const t = troll(q);
        if (t.hits > k) return "done";
        const age = q.t - t.since;
        if (t.phase === "windup" && age < TROLL_STEPS.windup - 6) return { left: cx(q) > stand - 12, right: false, jumpHeld: false, jumpPressed: false };
        if (t.phase === "windup") {
          s.jumped = true;
          return { left: false, right: false, jumpHeld: true, jumpPressed: age === TROLL_STEPS.windup - 4 };
        }
        // In the air over the wave; once down, a tap towards it to look at it.
        if (!q.body.onGround) return { left: false, right: false, jumpHeld: true, jumpPressed: false };
        return { left: false, right: q.body.facing < 0, jumpHeld: false, jumpPressed: false };
      }
    },
    // It backs off to the far end of the clearing: following it, he would walk into it.
    wait(`the troll backs off, round ${k + 1}`, (q) => troll(q).phase === "walk" || troll(q).phase === "stone")
  ];
}

export const NORDMARKA_ROUTE: Move[] = [
  walk(tile(60)),
  leap(tile(61), 1),
  // The stones are three tiles wide: he stands back from each edge, and runs at it.
  walk(tile(71) - 16),
  leap(tile(71), 1, { release: 26 }),
  walk(tile(76) - 16),
  leap(tile(76), 1, { release: 26 }),
  walk(tile(81) - 16),
  leap(tile(81), 1, { release: 30 }),
  // The moose: on its back at this end of the marsh, off at the other.
  walk(tile(87) + 4),
  wait("the moose at this end", (q) => carrier(q, MOOSE).x <= MOOSE.from.x + 2),
  jump(1, { release: 10 }),
  wait("across on the moose", (q) => riding(q) && carrierAt(MOOSE, q.t).x >= MOOSE.to.x - 2),
  jump(1, { release: 30 }),
  // Past Ullevålseter (under the squirrel just after it has thrown) and Jernhaugen; the gorge, with the dash.
  walk(tile(103)),
  wait("the squirrel by the hut has thrown", (q) => untilThrow(q.enemies.find((e) => e.def.c === 111)!, q.t) > 110 && q.shots.length === 0),
  walk(tile(157) + 4),
  leap(tile(158), 1, { dash: 12 }),
  walk(tile(195) + 8),
  jump(1, { release: 30 }),
  ...round(0),
  ...round(1),
  ...round(2),
  wait("the troll is stone", (q) => troll(q).phase === "stone"),
  // Up onto the boulder it has become, to the rune on top.
  {
    name: "onto the stone troll, to the rune",
    keys(q, s) {
      const t = troll(q);
      const dx = t.x - 30 - cx(q);
      if (s.took === undefined) {
        if (Math.abs(dx) > 3) return { left: dx < 0, right: dx > 0, jumpHeld: false, jumpPressed: false };
        s.took = s.i;
      }
      const k = s.i - (s.took as number);
      return { left: false, right: k < 30, jumpHeld: k < 40, jumpPressed: k === 0 };
    }
  }
];
