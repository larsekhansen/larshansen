import type { CarrierDef } from "@larshansen/pixelkit/carrier";
import type { Door } from "@larshansen/pixelkit/doors";
import type { Sky, SkyName } from "@larshansen/pixelkit/oslo";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import type { TimedLedge } from "@larshansen/pixelkit/timed";
import type { Ramp } from "@larshansen/pixelkit/tilemap";

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
  sheep: "e"
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
  /** The look of each one-way letter. */
  ledges: Record<string, LedgeLook>;
  /** Draws carrier `i` at its drawn place; when absent the kit's plain carrier is drawn. */
  carrier?(i: number, at: { x: number; y: number }, v: View): void;
  /** Draws timed ledge `i`; when absent the kit's plain one is drawn. */
  timed?(i: number, v: View): void;
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
  sky: SkyName | null;
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
  art: Art;
}

/** A level on the plan, not built yet: on the line map behind the fence. */
export interface Planned {
  id: string;
  rune: number;
  name: string;
  place: Words;
}
