import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Door } from "@larshansen/pixelkit/doors";
import { barcode, munch } from "@larshansen/pixelkit/landmarks";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { DOORWAY, FACADE, GLASS, INK, LAMP, METAL, PAINT, PALETTE, WHITE } from "@larshansen/pixelkit/palette";
import { STOVE_SMOKE, WOOD_LEDGE, ledge, pane, plankDoor, smoke, type LedgeLook } from "@larshansen/pixelkit/props";
import { rampHeight } from "@larshansen/pixelkit/tilemap";
import { drawFjord, drawGulls, drawOsloHills } from "../render/backdrop";
import { drawLongship } from "../render/ship";
import { tbaneDoor, walls } from "../render/furniture";
import type { LevelDef, View } from "./types";

// Level 1, rune L: Langkaia, the quay on the water side of the Opera. He comes out of the stage
// tower's door, walks down the marble roof to the quay, past two harbour sheds, out along a jetty,
// over three floating sauna rafts, and up the moored longship's mast to the rune over the yard.
// Teaches: walking, the jump, ledges you jump up through, water that puts you back, moving ground.
//
//   M  Opera marble   -  the stage tower's roof   Q  quay   P  jetty   B  crate   _  wooden ledge
//   ~  harbour water  #  the harbour bed   t T-banen  h Hjem  q Runesmia  v Verkstedet

export const MAP = [
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "..o.................................................................................................",
  "-----...............................................................................................",
  "....................................................................................................",
  "..................................................................................r.................",
  ".t..hSi.............................................................................................",
  "MMMMMMM......................................................................._________.............",
  "MMMMMMM.............................................................................................",
  "MMMMMMM............................................................................__...............",
  "MMMMMMM.............................................................................................",
  "MMMMMMM........................................................................__...................",
  "MMMMMMM.................______.B.______.............................................................",
  "MMMMMMM...............i...q...BB...v....i.................................________________..........",
  "MMMMMMMQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQPPPPPP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "MMMMMMMQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "MMMMMMMQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ##########################################################",
  "MMMMMMMQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ##########################################################"
];

const P = PALETTE;
/** The water line, the quay's top. */
const WATER = 16 * TILE;
const RAMP = { points: [[7 * TILE, 9 * TILE], [21 * TILE, WATER]] as [number, number][] };

// Three sauna rafts that bob three pixels on a slow beat, out of step; the third also drifts four
// tiles away from the second and back. Each has a cabin whose roof is a ledge riding with it.
const DECK = WATER - 4;
const ROOF = DECK - 20;
const BOB = { rise: 3, period: 200 };
const raft = (x: number, offset: number): CarrierDef[] => [
  { kind: "bob", x, y: DECK, w: 4 * TILE, rise: BOB.rise, period: BOB.period, offset },
  { kind: "bob", x: x + TILE, y: ROOF, w: 2 * TILE, rise: BOB.rise, period: BOB.period, offset }
];
const drift = (x: number, offset: number): CarrierDef[] => [
  { kind: "travel", from: { x, y: DECK }, to: { x: x + 4 * TILE, y: DECK }, w: 4 * TILE, period: 420, offset, bob: BOB },
  { kind: "travel", from: { x: x + TILE, y: ROOF }, to: { x: x + 5 * TILE, y: ROOF }, w: 2 * TILE, period: 420, offset, bob: BOB }
];
export const RAFTS: CarrierDef[] = [...raft(50 * TILE, 0), ...raft(57 * TILE, 70), ...drift(1016, 140)];

/** The stage tower's roof: white like the rest of the Opera. */
const MARBLE_LEDGE: LedgeLook = { body: FACADE.stageTower, top: FACADE.marble, edge: FACADE.stageTowerDot, joint: FACADE.stageTowerTop };

/** A sauna raft: pontoons, a plank deck, and a tarred cabin with a warm window and a smoking stove pipe. */
function saunaRaft(x: number, y: number, t: number) {
  R(x + 3, y + 4, 4 * TILE - 6, 1, PAINT.tar);
  R(x + 2, y + 5, 4 * TILE - 4, 2, mix(PAINT.tar, P.water, 0.5));
  for (let i = 0; i < 4; i++) ledge(x + i * TILE, y, WOOD_LEDGE, i === 0, i === 3, false);
  // The cabin, between the deck and its roof.
  const cx = x + TILE;
  R(cx, y - 18, 2 * TILE, 18, PAINT.tar);
  for (let i = 2; i < 2 * TILE; i += 4) R(cx + i, y - 18, 1, 18, mix(PAINT.tar, INK, 0.35));
  R(cx, y - 18, 1, 18, mix(PAINT.tar, WHITE, 0.15));
  R(cx + 2 * TILE - 1, y - 18, 1, 18, INK);
  // A small door, and the window with the stove's light behind it.
  R(cx + 4, y - 13, 7, 13, mix(PAINT.tar, INK, 0.5));
  R(cx + 9, y - 8, 1, 1, METAL.brass);
  R(cx + 17, y - 14, 10, 7, P.woodDark);
  R(cx + 18, y - 13, 8, 5, LAMP);
  R(cx + 22, y - 13, 1, 5, P.woodDark);
  light(cx + 18, y - 13, 4, 5, "soft");
  light(cx + 23, y - 13, 3, 5, "soft");
  // The stove pipe through the roof, and its smoke.
  R(cx + 24, y - 27, 3, 7, METAL.pipe);
  R(cx + 23, y - 28, 5, 1, METAL.pipeCap);
  if (!view.reduced) smoke(cx + 24, y - 30, t, { ...STOVE_SMOKE, rise: 18 });
}

/** The roof of a sauna's cabin: tarred boards, a ledge he can stand on. */
const SAUNA_ROOF: LedgeLook = { body: mix(PAINT.tar, P.woodDark, 0.5), top: P.wood, edge: INK, joint: PAINT.tar };

/** The Opera from behind: the stage tower with the door Hjem, the white roof sloping down to the quay over a glass foyer. */
function opera(v: View) {
  // The stage tower, aluminium-white with its dotted cladding.
  R(0, 5 * TILE, 5 * TILE + 8, 4 * TILE, FACADE.stageTower);
  R(0, 5 * TILE + 5, 5 * TILE + 8, 2, FACADE.stageTowerTop);
  for (let y = 5 * TILE + 10; y < 9 * TILE - 2; y += 4) for (let x = 2; x < 5 * TILE + 6; x += 4) R(x + ((y / 4) % 2) * 2, y, 1, 1, FACADE.stageTowerDot);
  const home = v.doors.get("home");
  if (home) {
    R(home.x - 1, home.bottom - home.h - 1, home.w + 2, home.h + 1, FACADE.stageTowerDot);
    R(home.x, home.bottom - home.h, home.w, home.h, home.open ? DOORWAY.stage : FACADE.stageDoor);
    R(home.x + home.w - 4, home.bottom - 16, 2, 2, METAL.brass);
  }
  // The roof slope over the foyer: marble on top, glass below, mullions and lamps behind it.
  for (let x = 7 * TILE; x < 21 * TILE; x++) {
    const s = Math.round(rampHeight([RAMP], x) ?? WATER);
    R(x, s, 1, 3, FACADE.marble);
    R(x, s + 3, 1, 1, FACADE.marbleEdge);
    const mullion = x % 6 === 0;
    if (s + 4 < WATER) R(x, s + 4, 1, WATER - s - 4, mullion ? GLASS.foyerMullion : GLASS.foyer);
    if (!mullion) for (let y = 9 * TILE + 8; y < WATER; y += 10) if (y > s + 4) R(x, y, 1, 1, GLASS.foyerMullion);
    if (x % 6 === 3 && WATER - s > 12) light(x, s + 6, 1, WATER - s - 8, "soft");
  }
}

/** A harbour shed: painted plank walls under its flat roof (the ledge), and its door. */
function shed(x0: number, color: string, line: string, door: Door | undefined) {
  walls(x0, 14 * TILE + 5, 6 * TILE, color, line, WATER);
  R(x0 - 2, 14 * TILE + 5, 6 * TILE + 4, 1, INK);
  pane(x0 + 10, 14 * TILE + 10, 8, 6);
  if (door) plankDoor(door, PAINT.trim);
}

/** A gull standing on the jetty's last post, who takes off when he comes close. */
const PERCH = { x: 47 * TILE + 8, y: WATER - 6 };
let scaredAt: number | null = null;
function perchedGull(v: View, near: boolean) {
  if (scaredAt !== null && v.t < scaredAt) scaredAt = null; // the level began again
  if (near && scaredAt === null) scaredAt = v.t;
  if (!near && scaredAt !== null && v.t - scaredAt > 600) scaredAt = null;
  R(PERCH.x - 1, PERCH.y + 2, 3, 4, mix(P.woodDark, P.water, 0.3));
  if (scaredAt === null) {
    // Sitting: a white body, a grey back, a yellow beak.
    R(PERCH.x - 3, PERCH.y - 3, 6, 3, P.wool);
    R(PERCH.x - 2, PERCH.y - 4, 4, 1, PALETTE.iron);
    R(PERCH.x + 2, PERCH.y - 5, 2, 2, P.wool);
    R(PERCH.x + 4, PERCH.y - 4, 1, 1, METAL.gold);
    R(PERCH.x - 1, PERCH.y, 1, 2, METAL.gold);
    return;
  }
  const a = v.t - scaredAt;
  if (a > 160) return;
  const wing = view.reduced ? 0 : Math.floor(a / 5) % 2 ? 1 : -1;
  const x = PERCH.x - a * 0.9;
  const y = PERCH.y - 4 - a * 0.6 - Math.sin(a * 0.2) * 2;
  R(Math.round(x), Math.round(y), 1, 1, P.wool);
  R(Math.round(x) - 1, Math.round(y) - wing, 1, 1, P.wool);
  R(Math.round(x) + 1, Math.round(y) - wing, 1, 1, P.wool);
  R(Math.round(x) - 2, Math.round(y) - wing * 2, 1, 1, P.wool);
  R(Math.round(x) + 2, Math.round(y) - wing * 2, 1, 1, P.wool);
}

export const LANGKAIA: LevelDef = {
  id: "langkaia",
  rune: 0,
  name: "Langkaia",
  landmark: { nb: "Operaen og badstuene", en: "The Opera and the saunas" },
  place: { nb: "Bjørvika, på vannsida av Operaen", en: "Bjørvika, on the water side of the Opera" },
  sky: null,
  map: MAP,
  legend: { solid: "MQPB#", oneWay: "_-", water: "~" },
  ramps: [RAMP],
  carriers: RAFTS,
  timed: [],
  cannons: [],
  signs: [
    {
      label: { nb: "Operaen", en: "The Opera" },
      lines: { nb: ["Operaen, sett bakfra.", "Samme tak som på forsida. Gå ned."], en: ["The Opera, seen from behind.", "The same roof as on the front page. Walk down."] }
    },
    {
      label: { nb: "Kaia", en: "The quay" },
      lines: { nb: ["Runesmia og Verkstedet har flyttet ned på kaia.", "Husleia var lavere."], en: ["Runesmia and Verkstedet moved down to the quay.", "The rent was lower."] }
    },
    {
      label: { nb: "Badstuene", en: "The saunas" },
      lines: { nb: ["Flytende badstuer. Hopp fra flåte til flåte.", "Vannet er kaldt, men det setter deg bare på brygga igjen."], en: ["Floating saunas. Hop from raft to raft.", "The water is cold, but it only puts you back on the jetty."] }
    }
  ],
  doors: [
    { id: "tbane", tile: "t", sign: "T-banen", href: "#kart" },
    { id: "home", tile: "h", sign: "Hjem", href: "/?from=viking" },
    { id: "qr", tile: "q", sign: "Runesmia", href: "/qr/" },
    { id: "github", tile: "v", sign: "Verkstedet", href: "https://github.com/larsekhansen" }
  ],
  art: {
    far: (v) => drawOsloHills(v.sky, WATER),
    mid: (v) => drawFjord(v.t, WATER),
    near(v) {
      // MUNCH and the Barcode across the water, where the front page has them too.
      const at = (wx: number) => layerX(wx, 0.4);
      munch(at(300), WATER - 2);
      barcode(at(360), WATER - 2);
      drawGulls(v.t, 20);
    },
    back(v) {
      opera(v);
      tbaneDoor(v.doors.get("tbane"));
      shed(24 * TILE, PAINT.red, PAINT.redLine, v.doors.get("qr"));
      shed(33 * TILE, PAINT.ochre, PAINT.ochreLine, v.doors.get("github"));
      drawLongship({ x0: 1164, x1: 1452, deck: 15 * TILE, mast: 82 * TILE + 8, yard: 9 * TILE, sail0: 78 * TILE + 8, sailW: 128 });
      perchedGull(v, Math.abs(v.him.x - PERCH.x) < 56 && Math.abs(v.him.y - PERCH.y) < 40);
    },
    ground: () => ({ top: P.sand, dot: P.sandDark, fill: P.earth }),
    ledges: { _: WOOD_LEDGE, "-": MARBLE_LEDGE },
    carrier(i, at, v) {
      if (i % 2 === 0) saunaRaft(at.x, at.y, v.t + i * 40);
      else for (let k = 0; k < 2; k++) ledge(at.x + k * TILE, at.y, SAUNA_ROOF, k === 0, k === 1, v.sky.snow);
    }
  }
};
