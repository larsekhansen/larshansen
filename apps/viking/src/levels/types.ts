import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import type { Flag } from "@larshansen/pixelkit/checkpoint";
import type { Light } from "@larshansen/pixelkit/dark";
import type { Launcher } from "@larshansen/pixelkit/launcher";
import type { Surface as Footing } from "@larshansen/pixelkit/surface";
import type { Enemy, EnemyDef } from "../game/enemies";
import type { Door } from "@larshansen/pixelkit/doors";
import type { Sky, SkyName } from "@larshansen/pixelkit/oslo";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import type { TimedLedge } from "@larshansen/pixelkit/timed";
import type { Ramp, TileMap } from "@larshansen/pixelkit/tilemap";
import type { Zone } from "@larshansen/pixelkit/zone";
import type { Troll, TrollDef } from "../game/troll";

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
  drum: "d"
} as const;

export interface SignDef {
  /** The word on the board. */
  label: Words;
  /** What the sign says in a bubble when he stands by it, first line on top. */
  lines: { nb: string[]; en: string[] };
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
  /** The flourish after the rune, `age` steps in: lights coming on, a flag going up. */
  flourish?(age: number, v: View): void;
  /** Draws flag `i` its own way (a blue-painted trunk) and says so; false leaves it to the kit's flagpole. */
  flag?(i: number, f: Flag, raisedAt: number | null, v: View): boolean;
  /** In a dark level: what shows through the dark besides his headlamp (lit windows, painted trunks), in world pixels. */
  lights?(v: View): Light[];
  /** In a dark level: what is drawn over the dark, so it shines (eyes, a lamp's own flame). */
  overDark?(v: View): void;
  /** Draws the troll. */
  troll?(t: Troll, v: View): void;
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
  art: Art;
}

/** A level on the plan, not built yet: on the line map behind the fence. */
export interface Planned {
  id: string;
  rune: number;
  name: string;
  place: Words;
}
