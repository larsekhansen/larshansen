import { carrierAt } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { carrier, cx, jump, jumpTo, leap, mid, sit, stomp, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { RAFT } from "../langkaia";
import { riding } from "./common";

// Langkaia's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules and the front page's single jump, the way a newcomer would go: down the roof, up onto
// the sheds' roofs for their skilling, over the crates, onto the pigeon, a sit on the club's bench,
// the flag, the rafts, the drifting raft, the hut's roof on the pier, the two rafts that meet, the rat,
// up the diving tower for the cheese, the quay, aboard, up the mast and the yard to the rune.

/** Still on a raft (its deck or its cabin's roof), and the raft not yet at x (going right) or past it (going left). */
const until = (q: Play, d: (typeof RAFT)[keyof typeof RAFT], x: number) => !riding(q) || carrier(q, d).x >= x - 1;

export const LANGKAIA_ROUTE: Move[] = [
  walk(mid(24)),
  jump(0),
  walk(tile(29) + 4),
  jump(1, { release: 22 }),
  jump(1, { release: 22 }),
  walk(tile(44)),
  stomp(0),
  walk(tile(53) + 4),
  jump(1, { release: 14 }),
  walk(mid(55)),
  sit(),
  walk(tile(66) + 6),
  leap(tile(67), 1),
  walk(tile(72) + 8),
  leap(tile(73), 1),
  walk(tile(78) + 8),
  leap(tile(79), 1),
  walk(tile(88) + 6),
  wait("the drifting raft at this end", (q) => carrier(q, RAFT.drift).x <= 91 * TILE + 1),
  leap(tile(89), 1),
  walk(tile(93)),
  wait("the drifting raft at the far end", (q) => until(q, RAFT.drift, 94 * TILE)),
  walk(tile(98) + 8),
  leap(tile(99), 1),
  walk(tile(104)),
  stomp(1),
  walk(mid(110)),
  jump(0),
  walk(tile(114) + 6),
  walk(tile(121) + 6),
  wait("the first of the two rafts at this end", (q) => carrier(q, RAFT.meetA).x <= 123 * TILE + 1),
  leap(tile(122), 1),
  walk(tile(126)),
  wait("the two rafts together", (q) => carrierAt(RAFT.meetB, q.t).x - (carrierAt(RAFT.meetA, q.t).x + 5 * TILE) <= 1),
  // The gull over the meeting flies at the height of the cabins' roofs: it cannot reach the decks.
  walk(tile(134), { careless: true }),
  wait("the second raft at the far end", (q) => until(q, RAFT.meetB, 136 * TILE)),
  walk(tile(139) + 8),
  leap(tile(140), 1),
  walk(tile(146)),
  stomp(3),
  walk(mid(158)),
  jump(0),
  jump(-1, { release: 16 }),
  jump(1, { release: 16 }),
  jump(-1, { release: 8 }),
  walk(mid(159)),
  walk(tile(155) - 8),
  walk(tile(165) + 6),
  leap(tile(166), 1),
  walk(tile(187) + 6),
  leap(tile(188), 1),
  // The boat lies against the longship's stern: up onto it from the boat's bow.
  walk(tile(192) + 2),
  jump(1, { release: 16 }),
  walk(tile(201)),
  stomp(6),
  walk(mid(211)),
  jump(0),
  walk(tile(213) - 6),
  jumpTo(tile(215)),
  walk(tile(214) + 6),
  jumpTo(tile(212)),
  jump(0),
  walk(tile(216)),
  walk(mid(219)),
  walk(mid(213)),
  jump(0),
  jump(0)
];

void cx;
