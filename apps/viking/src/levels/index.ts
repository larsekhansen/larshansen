import { LANGKAIA } from "./langkaia";
import type { LevelDef } from "./types";

// The line map's stations, in the order the lines run. Line 1 has ten, one per rune of LARS HANSEN,
// all built. Line 2 leaves the map at Stortinget and has six, one per rune of VIKING; it opens when
// Nabolaget is cleared, and a station whose level is not built yet is under construction.
//
// What the line map needs of a level (its name, rune and line) is here, so the map can be drawn
// without the levels themselves. Each built level's code comes in its own small file when it is
// first needed; Langkaia, where a fresh visitor starts, comes with the page.

export interface Station {
  id: string;
  /** Which of the sixteen runes it ends at: 0 to 9 spell LARS HANSEN, 10 to 15 VIKING. */
  rune: number;
  name: string;
  /** A shorter name for its board on the line map, when the full one is long. */
  short?: string;
  built: boolean;
  /** Line 1 or line 2. */
  line: 1 | 2;
}

const one = (id: string, rune: number, name: string, short?: string): Station => ({ id, rune, name, short, built: true, line: 1 });
const two = (id: string, rune: number, name: string, built: boolean, short?: string): Station => ({ id, rune, name, short, built, line: 2 });

export const LINE: Station[] = [
  one("langkaia", 0, "Langkaia"),
  one("akershus", 1, "Akershus festning", "Akershus"),
  one("radhuset", 2, "Rådhuset"),
  one("slottet", 3, "Slottet"),
  one("holmenkollen", 4, "Holmenkollen"),
  one("akerselva", 5, "Akerselva"),
  one("nordmarka", 6, "Nordmarka"),
  one("stortinget", 7, "Stortinget"),
  one("ekeberg", 8, "Ekeberg"),
  one("nabolaget", 9, "Nabolaget"),
  two("bygdoy", 10, "Bygdøy", true),
  two("vigelandsparken", 11, "Vigelandsparken", true, "Vigeland"),
  two("korketrekkeren", 12, "Korketrekkeren", true),
  two("ostensjovannet", 13, "Østensjøvannet", true, "Østensjø"),
  two("bjorvika", 14, "Bjørvika", false),
  two("gamlebyen", 15, "Gamlebyen", false)
];

/** Every station's id, line 1 then line 2: a station opens when the one before it is cleared, so line 2 opens with Nabolaget. */
export const ORDER = LINE.map((l) => l.id);
/** The ten of line 1, LARS HANSEN: all ten make the gold helmet. */
export const LINE_1 = ORDER.slice(0, 10);
/** The six of line 2, VIKING. */
export const LINE_2 = ORDER.slice(10);
/** Where line 2 begins in ORDER. */
export const LINE_2_AT = 10;
/** The built stations, in order. */
export const BUILT = LINE.filter((l) => l.built);
export const isBuilt = (l: Station) => l.built;

/** One dynamic import per level, so the page only fetches the levels a visitor goes to. */
const LOADERS: Record<string, () => Promise<LevelDef>> = {
  akershus: () => import("./akershus").then((m) => m.AKERSHUS),
  radhuset: () => import("./radhuset").then((m) => m.RADHUSET),
  slottet: () => import("./slottet").then((m) => m.SLOTTET),
  holmenkollen: () => import("./holmenkollen").then((m) => m.HOLMENKOLLEN),
  akerselva: () => import("./akerselva").then((m) => m.AKERSELVA),
  nordmarka: () => import("./nordmarka").then((m) => m.NORDMARKA),
  stortinget: () => import("./stortinget").then((m) => m.STORTINGET),
  ekeberg: () => import("./ekeberg").then((m) => m.EKEBERG),
  nabolaget: () => import("./nabolaget").then((m) => m.NABOLAGET),
  bygdoy: () => import("./bygdoy").then((m) => m.BYGDOY),
  vigelandsparken: () => import("./vigelandsparken").then((m) => m.VIGELANDSPARKEN),
  korketrekkeren: () => import("./korketrekkeren").then((m) => m.KORKETREKKEREN),
  ostensjovannet: () => import("./ostensjovannet").then((m) => m.OSTENSJOVANNET)
};

const loaded = new Map<string, LevelDef>([[LANGKAIA.id, LANGKAIA]]);
const loading = new Map<string, Promise<LevelDef>>();

/** A level whose code is here already, or undefined. */
export const loadedLevel = (id: string): LevelDef | undefined => loaded.get(id);

/** A level's code, fetched the first time it is asked for. Rejects for an id that is not a built level. */
export function loadLevel(id: string): Promise<LevelDef> {
  const have = loaded.get(id);
  if (have) return Promise.resolve(have);
  const load = LOADERS[id];
  if (!load) return Promise.reject(new Error(`No built level called ${id}`));
  let p = loading.get(id);
  if (!p) {
    p = load().then((def) => {
      loaded.set(id, def);
      loading.delete(id);
      return def;
    });
    p.catch(() => loading.delete(id));
    loading.set(id, p);
  }
  return p;
}
