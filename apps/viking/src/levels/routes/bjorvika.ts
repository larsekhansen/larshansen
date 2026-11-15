import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { carrierAt, rides, type Travel } from "@larshansen/pixelkit/carrier";
import { pulseAge, pulsePhase } from "@larshansen/pixelkit/timed";
import { cx, jumpTo, leap, mid, sit, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { THROW_REACH, untilThrow } from "../../game/enemies";
import type { Play } from "../../game/play";
import { shieldedWalk } from "./common";
import { G, GUST_BEAT, HOIST, HOOK_1, HOOK_2, HOOK_3, HOOK_5, HOOK_6, HOOK_7, SHAFTS, SHEETS, SPARKS } from "../bjorvika";

// Bjørvika's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules, the single jump, the ski pole and the shield: along the quay, up the hoist, along the open floor
// over the rebar and past the welder between showers, across the bay on the first hook, up to the slab,
// on the hooks across the drop to the second tower and the third, over the shafts on the sliding sheets
// between gusts, along the girder with the shield up as each bolt comes, under the riveters, up to the
// roof and the bench in the hut, along the traverse hook to hook, up the crane to the rune.

const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** At this end of its beat, flush with the edge he stands at. */
const atFrom = (q: Play, d: Travel) => carrierAt(d, q.t).x === d.from.x;
const atTo = (q: Play, d: Travel) => carrierAt(d, q.t).x === d.to.x;

/** Onto the sheet and to its middle, as it sets off; done once he stands there. */
const board = (d: Travel, name: string): Move => ({
  name: `onto ${name}`,
  keys(q) {
    const middle = carrierAt(d, q.t).x + d.w / 2;
    if (rides(d, q.t, q.body) && Math.abs(cx(q) - middle) < 5) return "done";
    return { ...NONE, left: cx(q) > middle + 2, right: cx(q) < middle - 2 };
  }
});

/** Stands at x until the test holds, walking back to it if the wind moves him. */
const hold = (name: string, x: number, until: (q: Play) => boolean): Move => ({
  name,
  keys: (q) => (until(q) && Math.abs(cx(q) - x) <= 3 ? "done" : { ...NONE, left: cx(q) > x + 2, right: cx(q) < x - 2 })
});

/** A sheet across a shaft, flush with the floor: wait at the edge for it, on, ride it over, and off. */
const across = (d: Travel, name: string, off: number, ready: (q: Play) => boolean = () => true): Move[] => [
  walk(d.from.x - 6),
  hold(`${name} at this end`, d.from.x - 6, (q) => atFrom(q, d) && ready(q)),
  board(d, name),
  wait(`on ${name} to the far end`, (q) => atTo(q, d)),
  walk(off)
];

/** The middle of a hook's block now. */
const blockMiddle = (d: Travel) => (q: Play) => carrierAt(d, q.t).x + d.w / 2;

/**
 * A hook across the drop: to the landing's edge, wait for the block at its near end, a hop onto it, ride
 * it over, and a hop off its far end onto the landing as it comes to its end.
 */
const hook = (d: Travel, name: string, off: number): Move[] => [
  walk(d.from.x - TILE - 6),
  wait(`${name} at this end`, (q) => atFrom(q, d)),
  jumpTo(d.from.x + d.w / 2),
  wait(`on ${name} to the far end`, (q) => atTo(q, d)),
  walk(off)
];

/** To the front of the block he rides, keeping up with it as it goes. */
const toFront = (d: Travel, name: string): Move => ({
  name: `to the front of ${name}`,
  keys(q) {
    const front = carrierAt(d, q.t).x + d.w - PLAYER.w / 2 - 2;
    if (Math.abs(cx(q) - front) <= 2 && rides(d, q.t, q.body)) return "done";
    return { ...NONE, left: cx(q) > front + 2, right: cx(q) < front - 2 };
  }
});

/** From one hook of the traverse to the next as they meet: at the front of the block, and a hop over the tile between them onto the next. */
const hop = (from: Travel, to: Travel, name: string): Move[] => [
  toFront(from, "the block"),
  wait(`${name} as they meet`, (q) => atTo(q, from) && atFrom(q, to)),
  {
    name: `hop ${name}`,
    keys(q, s) {
      if (s.air && q.body.onGround) return "done";
      if (!q.body.onGround) s.air = true;
      const aim = blockMiddle(to)(q) - q.body.vx * 7 - cx(q);
      return { left: aim < -2, right: aim > 2, jumpHeld: s.i < 30, jumpPressed: s.i === 0 };
    }
  }
];

/** The gust is calm, and stays calm while a sheet is crossed. */
const calm = (q: Play) => pulsePhase(q.t, GUST_BEAT) === "rest" && pulseAge(q.t, GUST_BEAT).age < GUST_BEAT.rest - 75;

/** The riveters (enemies 9 and 10): a bolt coming at him, or one of them about to throw at him. */
const RIVETERS = [9, 10];
const bolts = (q: Play): 1 | null => {
  const front = q.body.x + PLAYER.w;
  const coming = q.shots.some((s) => RIVETERS.includes(s.by) && s.spent === undefined && s.vx < 0 && s.x > q.body.x && s.x - front < 64);
  const about = RIVETERS.some((k) => {
    const e = q.enemies[k];
    const hx = cx(q);
    return e.alive && untilThrow(e, q.t) <= 3 && Math.abs(hx - e.x) < 8 * TILE && Math.abs(q.body.y - e.y) < THROW_REACH.y && e.x - hx > 1.5 * TILE;
  });
  return coming || about ? 1 : null;
};

export const BJORVIKA_ROUTE: Move[] = [
  // The quay: past the crow, the pigeon and the rat, through the site's gate to the hoist.
  walk(mid(20)),
  walk(tile(33)),
  wait("the hoist down at the quay", (q) => carrierAt(HOIST, q.t).y === G * TILE && carrierAt(HOIST, q.t - 1).y === G * TILE),
  walk(HOIST.x + HOIST.w / 2),
  wait("up on the hoist", (q) => carrierAt(HOIST, q.t).y === HOIST.top),
  walk(mid(40)),
  // The open floor: over the rebar, past the welder between showers, the pigeon and the rat.
  walk(tile(45) - 2),
  leap(tile(46) - 6, 1),
  walk(tile(54) - 2),
  wait("the welder's sparks done", (q) => pulsePhase(q.t, SPARKS.beat!) === "rest" && pulseAge(q.t, SPARKS.beat!).age < 60),
  walk(tile(67) - 2),
  leap(tile(68) - 6, 1),
  walk(mid(70)),
  // The first hook, over the bay and its net.
  ...hook(HOOK_1, "the first hook", mid(85)),
  // Up to the slab, and on the hooks across the drop.
  jumpTo(mid(87) + 8),
  jumpTo(mid(91)),
  walk(mid(93)),
  ...hook(HOOK_2, "the second hook", mid(109)),
  walk(mid(110)),
  ...hook(HOOK_3, "the third hook", mid(129)),
  walk(mid(130)),
  walk(mid(138)),
  // The shafts: on each sheet as it comes, in the calm between gusts.
  ...SHAFTS.flatMap((c, i) => across(SHEETS[i], `the sheet over shaft ${i + 1}`, mid(c + 6), calm)),
  walk(mid(170)),
  // The girder: the pigeon first, then on with the shield up as each bolt comes, under the riveters.
  stomp(7),
  stomp(8),
  shieldedWalk(`along the girder to ${mid(195)}, the shield up as each bolt comes`, mid(195), bolts, 4),
  // Up past them to the roof, the bench in the hut.
  walk(mid(197) + 4),
  jumpTo(mid(198)),
  jumpTo(mid(201)),
  walk(mid(207)),
  sit(),
  walk(mid(213)),
  // The traverse: the three hooks in a row, each meeting the next.
  ...hook(HOOK_5, "the first hook of the traverse", 0).slice(0, 3),
  ...hop(HOOK_5, HOOK_6, "onto the second hook of the traverse"),
  ...hop(HOOK_6, HOOK_7, "onto the third hook of the traverse"),
  wait("on the third hook to the crane", (q) => atTo(q, HOOK_7)),
  walk(mid(243)),
  // Up the crane's rungs to the walkway, and the rune at the cab.
  walk(mid(245)),
  jumpTo(mid(246)),
  jumpTo(mid(246)),
  jumpTo(mid(247)),
  walk(mid(249))
];
