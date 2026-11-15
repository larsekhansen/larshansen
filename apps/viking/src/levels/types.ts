import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import type { Flag } from "@larshansen/pixelkit/checkpoint";
import type { Light } from "@larshansen/pixelkit/dark";
import type { Launcher } from "@larshansen/pixelkit/launcher";
import type { Surface as Footing } from "@larshansen/pixelkit/surface";
import type { Enemy, EnemyDef, Shot } from "../game/enemies";
import type { Door } from "@larshansen/pixelkit/doors";
import type { Sky, SkyName } from "@larshansen/pixelkit/oslo";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import type { TimedLedge } from "@larshansen/pixelkit/timed";
import type { Hazard } from "@larshansen/pixelkit/hazard";
import type { Body, Carrier } from "@larshansen/pixelkit/physics";
import type { Ramp, TileMap } from "@larshansen/pixelkit/tilemap";
import type { Board } from "@larshansen/pixelkit/text";
import type { Zone } from "@larshansen/pixelkit/zone";
import type { Troll, TrollDef, TrollEvent } from "../game/troll";
import type { Play, PlayIntent } from "../game/play";
import type { Standing } from "../render/stand";

// What a level is, as data: its map and legend, the things in it, its words, and how it is drawn.
// One runner (game/play.ts for the rules, main.ts and render/ for the page) plays any of them.

export interface Words {
  nb: string;
  en: string;
}

/** Map letters every level shares. Doors add their own letters (DoorDef.tile). */
export const MARKS = {
  start: "S",
  rune: "r",
  bracteate: "o",
  flag: "f",
  cannonRight: "c",
  cannonLeft: "C",
  sign: "i",
  sheep: "e",
  /** A skilling, the small copper coin: never needed, counted on the card. */
  skilling: "$",
  /** A slice of brown cheese: a life. One per level, in a secret. */
  cheese: "&",
  /** A park bench: sit on it (up) to fill the hearts and keep the spot. */
  bench: "b",
  /** A bass drum: steps on it and it throws him straight up. */
  drum: "d",
  /** Where the shield is given (Bygdøy's prow): he takes it by touching it. */
  shield: "y"
} as const;

export interface SignDef {
  /** The word on the board. */
  label: Words;
  /** What the sign says in a bubble when he stands by it, first line on top. */
  lines: { nb: string[]; en: string[] };
  /** The same for a touch screen with no keyboard, where the lines name keys. */
  touch?: { nb: string[]; en: string[] };
}

export interface DoorDef {
  id: string;
  /** Its letter on the map. */
  tile: string;
  /** The words on the board above it. */
  sign: string;
  /** Where it leads: an address, or "#kart" for the line map. */
  href: string;
}

export interface CannonDef {
  /** Velocity it throws him with: across, in the way it faces, and up. */
  vx: number;
  vy: number;
}

/** A ledge on a beat that rings a bell when he lands on it. */
export interface BellLedge extends TimedLedge {
  /** Which note of the pentatonic set it rings. */
  note?: number;
}

/** A surface for the ground letter `#`: its top band, the dots on it, and the earth below. */
export interface Surface {
  top: string;
  dot: string;
  fill: string;
}

/** What the drawing gets to know each frame. */
export interface View {
  sky: Sky;
  /** The level's clock, in steps: what carriers and ledges on a beat run on. */
  t: number;
  /** How far the screen is between this step and the next. */
  alpha: number;
  doors: Map<string, Door>;
  /** The real (or frozen) time, for a clock face. */
  now: Date;
  /** Where he is (his centre), for things that notice him. */
  him: { x: number; y: number };
  /** Steps since the rune was taken, while the level's flourish plays; otherwise null. */
  flourish: number | null;
  /** The way he faces, for a headlamp. */
  facing: 1 | -1;
  /** The troll, in a level that has one. */
  troll: Troll | null;
  /** The flags and when each went up, and the enemies, for a level that lights them in the dark. */
  flags: readonly { x: number; bottom: number; raisedAt: number | null }[];
  enemies: readonly Enemy[];
  /** The last boss's state, in the level that has one. */
  boss: unknown;
  /** The levels he has cleared, by id: Ekeberg lights them in the city below. */
  cleared: readonly string[];
  /** When the rune was taken (a step), or null: the Pi's light turns green. */
  runeAt: number | null;
  /** The state of the level's own moving ground (`LevelDef.grounds`), for drawing it. */
  grounds: unknown;
}

export interface Art {
  /** The three far layers, at depths 0.12, 0.2 and 0.4. */
  far?(v: View): void;
  mid?(v: View): void;
  near?(v: View): void;
  /** Buildings and things behind the tiles, in the street layer. */
  back(v: View): void;
  /** Things in front of the tiles (but behind him and the words). */
  front?(v: View): void;
  /** The ground letter's look along the level. */
  ground(c: number): Surface;
  /** Draws a tile the level has its own look for, and says so (true); false leaves it to the shared drawing. */
  tile?(t: string, c: number, r: number, x: number, y: number, map: TileMap, sky: Sky): boolean;
  /** The look of each one-way letter. */
  ledges: Record<string, LedgeLook>;
  /** Draws carrier `i` at its drawn place; when absent the kit's plain carrier is drawn. */
  carrier?(i: number, at: { x: number; y: number }, v: View): void;
  /** Draws timed ledge `i`; when absent the kit's plain one is drawn. */
  timed?(i: number, v: View): void;
  /** Draws cannon `i` its own way (a snow cannon); without it the kit's iron cannon is drawn. */
  cannon?(i: number, l: Launcher, loadedAt: number, firedAt: number, v: View): void;
  /** Draws enemy `i` (its look), when the level has its own drawing for it. */
  enemy?(e: Enemy, v: View): boolean;
  /** Draws something thrown, when the level has its own drawing for it (a slinger's stone). */
  shot?(s: Shot, v: View): boolean;
  /** The flourish after the rune, `age` steps in: lights coming on, a flag going up. */
  flourish?(age: number, v: View): void;
  /** Draws flag `i` its own way (a blue-painted trunk) and says so; false leaves it to the kit's flagpole. */
  flag?(i: number, f: Flag, raisedAt: number | null, v: View): boolean;
  /** In a dark level: what shows through the dark besides his headlamp (lit windows, painted trunks), in world pixels. */
  lights?(v: View): Light[];
  /** In a dark level: what is drawn over the dark, so it shines (eyes, a lamp's own flame). */
  overDark?(v: View): void;
  /** In a dark level: the dark itself, with his headlamp (`render/night.ts`, which comes with the level). */
  night?(v: View, him: Body, boards: readonly Board[], map: TileMap): void;
  /** Draws the troll. */
  troll?(t: Troll, v: View): void;
  /** Draws the last boss, from its state. */
  boss?(state: unknown, v: View): void;
  /** Draws bass drum `i` its own way (a clothesline); without it the kit's drum is drawn. */
  drum?(i: number, l: Launcher, firedAt: number, v: View): void;
}

/**
 * The troll's rules, from its own module (`game/troll.ts`), which comes with Nordmarka's file: play.ts
 * runs them through the level, so the page does not carry them until the level is fetched.
 */
export interface TrollRules {
  create(def: TrollDef): Troll;
  /** He lost a life: back to sleep, the stone it has turned to kept. */
  reset(t: Troll, step: number): void;
  step(t: Troll, step: number, him: Body): TrollEvent;
  /** Its body (and, stone, what he stands on). */
  box(t: Troll): { x: number; y: number; w: number; h: number };
  hurts(t: Troll, step: number, him: Body): { fromX: number; from?: "above" | "below" } | null;
  /** It ran into his raised shield: pushed back the way `dir` points. */
  shoved?(t: Troll, step: number, dir: 1 | -1): void;
}

/**
 * The last boss's rules, from its own module, which comes with its level: play.ts runs them each
 * step as it runs the troll's. The state is the module's own.
 */
export interface Boss<S = unknown> {
  create(): S;
  /** One step of it; `him` is where he is. What it did, in its own words ("wake", "windup"...), or null. */
  step(s: S, t: number, him: Body): string | null;
  /**
   * He came down on it (or on something of its own, a clothesline) from above this step: where its top
   * is, whether that was a hit or only a bounce off it, how hard it throws him up if not as a stomp
   * does, and what to call it. Null when he did not.
   */
  stomped(s: S, t: number, him: Body, prevBottom: number): { top: number; hit: boolean; speed?: number; event?: string } | null;
  /** What hurts him this step, and from where (and whether from above or below); null when nothing does. */
  hurts(s: S, t: number, him: Body): { fromX: number; from?: "above" | "below" } | null;
  /** It ran into his raised shield: pushed back a tile the way `dir` points (ADR 0024). */
  shoved?(s: S, t: number, dir: 1 | -1): void;
  /** Its body as a wall he cannot walk through this step (a machine standing still), or null. */
  blocks?(s: S): { x: number; y: number; w: number; h: number } | null;
  /** He lost a life: back to where it waits, keeping the hits it has taken. */
  reset(s: S, t: number): void;
  /** In its fight: woken, and not back asleep or parked. */
  awake(s: S): boolean;
  /** The top of it, in the middle (world x, y), and how wide it is: its words are shown beside it. */
  top(s: S): { x: number; y: number; w?: number };
  /** Beaten for good: the rune shows. */
  beaten(s: S): boolean;
}

/**
 * Moving ground a level brings with it that is not a carrier on the clock: rocking decks and sinking
 * pads (`deck.ts` and `sink.ts` in the kit). It comes with its level's file, so the first script does
 * not carry it; play.ts runs it each step. Its state is plain data.
 */
export interface Grounds<S = unknown> {
  create(): S;
  /** The ground it gives him this step, as the physics takes it. */
  carriers(s: S, t: number, him: Body): Carrier[];
  /** After his step: what it notices of him (the pad he stands on). */
  after?(s: S, t: number, him: Body): void;
  /** Everywhere it ever is, as still ground: for the reach search. */
  everywhere(): Carrier[];
  /** Ground of its own in the map (Gamlebyen's stones that rise as he passes and stay): the map he plays on, from the level's own. */
  map?(s: S, base: TileMap): TileMap;
  /** Its tops as he sees them this step, and whether each holds, moves or gives way: the page marks them (order 18). */
  stands?(s: S, t: number): Standing[];
}

/**
 * A level's own rules, from its own file, for what only it has: statues that move while his back is
 * turned, swans that mind their water, the sledge he cannot stop. play.ts runs them each step, as it
 * runs the troll's, so the first script does not carry them.
 */
export interface LevelRules {
  /** One step of an enemy the level has rules of its own for (by its look); true when it moved it. */
  enemy?(e: Enemy, p: Play): boolean;
  /** Ground of its own this step: a statue he looks at, turned to stone. */
  ground?(p: Play): Carrier[];
  /** Everywhere that ground can ever be in this level, as still ground: for the reach search. */
  everywhere?(def: LevelDef): Carrier[];
  /** After the enemies have moved: what the level's own things do to him (a statue of stone is in his way). */
  after?(p: Play): void;
  /** Before his body moves: the keys he is left with (on the sledge he cannot walk or stop, and down ducks). */
  intent?(p: Play, intent: PlayIntent): PlayIntent;
  /** How fast the ground carries him along at x, for the reach search (the sledge's speed), or 0. */
  carry?(x: number): number;
  /** On the sledge: how far ahead of him the camera looks, in a view `w` art pixels wide. */
  lead?(w: number): number;
}

export interface LevelDef {
  id: string;
  /** Which of the ten runes of LARS HANSEN it ends at, 0 to 9. */
  rune: number;
  name: string;
  /** A shorter name for its board on the line map, when the full one is long. */
  short?: string;
  landmark: Words;
  /** Where in Oslo, for the line map. */
  place: Words;
  /** A sky it always has, or null for Oslo's real one. */
  sky: SkyName | "winterday" | null;
  map: readonly string[];
  /** Solid, one-way and water letters. Everything else on the map is open, or a mark from MARKS or a door. */
  legend: { solid: string; oneWay: string; water: string };
  ramps: Ramp[];
  carriers: CarrierDef[];
  /** Ledges on a beat: as one-way ledges while on or warning. */
  timed: BellLedge[];
  /** By the cannon letters on the map, left to right, top to bottom. */
  cannons: CannonDef[];
  /** By the sign letters on the map, in the same order. */
  signs: SignDef[];
  doors: DoorDef[];
  /** The things out to get him: kind, place, patrol, look. None in the first three levels. */
  enemies?: EnemyDef[];
  /** Ground that is not plain ground (ice, an inrun), at his feet (x, y) at step t; null or absent for plain ground. */
  surfaceAt?(x: number, y: number, t: number): Footing | null;
  /** How fast the bass drums throw him up (the sheep's bounce is 7). */
  drum?: number;
  /** Steps the level's flourish plays after the rune is taken, before the card; the art draws it. */
  flourish?: number;
  /** Bells (notes of the pentatonic set) that ring one after another while the flourish plays, in place of the cheer. */
  chime?: number[];
  /** The lowest world y the view shows around world x, when that is above the bottom of the map (so a street is not all cellar). */
  floor?(x: number): number;
  /** How far the view looks up while the flourish plays, so it shows (the palace's roof, its flag). */
  flourishLook?: number;
  /** Where fireworks burst when the rune is taken, if anywhere: world x and y. */
  fireworks?: [number, number][];
  /** Zones that push him while he is in them: a waterfall pushes down, a current along. */
  zones?: Zone[];
  /** A level under the trees at night: how dark it is at world x, 0 (open sky) to 1 (black), as things are now. */
  dark?(x: number, v: View): number;
  /** The boss at the end, in the level that has one: the troll of Nordmarka. The rune shows when it has turned to stone. */
  troll?: TrollDef;
  /** Its rules, which come with the level (see `TrollRules`); needed with `troll`. */
  trollRules?: TrollRules;
  /** The last boss, in Nabolaget: its rules come with the level. The rune shows when it is beaten. */
  boss?: Boss<any>;
  /** What the page says when the boss does something, by its event's name. */
  bossWords?: Record<string, Words>;
  /** The last line of its card, from the runes of its line he has and the bracteates left to find (Gamlebyen's, the end of line 2). */
  cardLine?: { nb: (runes: number, left: number) => string; en: (runes: number, left: number) => string };
  /** What a padlocked door says (Quintle's kiosk), when not the front page's "coming soon". */
  soon?: Words;
  /** Things that hurt to touch: the third rail. */
  hazards?: Hazard[];
  /** How far either side of home the sheep graze, in tiles, when not four: on a knoll, they stand. */
  sheepRange?: number;
  /** How much the far, mid and near layers fade towards the horizon (0.35, 0.3, 0.2 when not said): under the ground, nothing does. */
  haze?: [number, number, number];
  /** Under the ground, with no sky: its far layers fill the whole view, however tall, and are not moved down on an upright screen. */
  underground?: boolean;
  /** Its own moving ground: rocking decks, sinking pads. */
  grounds?: Grounds<any>;
  /** Its own rules (see `LevelRules`). */
  rules?: LevelRules;
  /** Letters that are open until they rise (`Grounds.map`), and then solid or one-way: for the tests and the reach search. */
  risen?: { solid: string; oneWay: string };
  /** Where the level first asks for the shield (world x, from and to): its key is shown over him there. */
  shieldLesson?: [number, number];
  art: Art;
}

/** A level on the plan, not built yet: on the line map behind the fence. */
export interface Planned {
  id: string;
  rune: number;
  name: string;
  place: Words;
}
