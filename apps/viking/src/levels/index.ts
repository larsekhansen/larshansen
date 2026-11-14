import { LANGKAIA } from "./langkaia";
import type { LevelDef, Words } from "./types";

// The ten levels, one per rune of LARS HANSEN, in the order the line runs. Seven are built; the rest
// are on the plan (docs/games/LEVELS.html) and stand behind the hoarding on the line map.
//
// What the line map needs of a level (its name, rune and place) is here, so the map can be drawn
// without the levels themselves. Each built level's code comes in its own small file when it is
// first needed; Langkaia, where a fresh visitor starts, comes with the page.

export interface Station {
  id: string;
  /** Which of the ten runes of LARS HANSEN it ends at, 0 to 9. */
  rune: number;
  name: string;
  /** A shorter name for its board on the line map, when the full one is long. */
  short?: string;
  place: Words;
  built: boolean;
}

export const LINE: Station[] = [
  { id: "langkaia", rune: 0, name: "Langkaia", place: { nb: "Bjørvika, på vannsida av Operaen", en: "Bjørvika, on the water side of the Opera" }, built: true },
  { id: "akershus", rune: 1, name: "Akershus festning", short: "Akershus", place: { nb: "Festningen over havna", en: "The fortress above the harbour" }, built: true },
  { id: "radhuset", rune: 2, name: "Rådhuset", place: { nb: "De to tårnene på Rådhusplassen", en: "The two towers on Rådhusplassen" }, built: true },
  { id: "slottet", rune: 3, name: "Slottet", place: { nb: "Karl Johan, opp til Slottet", en: "Karl Johan, uphill to the palace" }, built: true },
  { id: "holmenkollen", rune: 4, name: "Holmenkollen", place: { nb: "Hoppbakken", en: "The ski jump" }, built: true },
  { id: "akerselva", rune: 5, name: "Akerselva", place: { nb: "Nedover elva fra Nydalen til Vaterland", en: "Down the river from Nydalen to Vaterland" }, built: true },
  { id: "nordmarka", rune: 6, name: "Nordmarka", place: { nb: "Skogen nord for byen", en: "The forest north of the city" }, built: true },
  { id: "stortinget", rune: 7, name: "Stortinget", place: { nb: "T-banestasjonen under sentrum", en: "The T-bane station under the centre" }, built: false },
  { id: "ekeberg", rune: 8, name: "Ekeberg", place: { nb: "Lia over Gamle Oslo", en: "The hillside above Gamle Oslo" }, built: false },
  { id: "nabolaget", rune: 9, name: "Nabolaget", place: { nb: "Takene på Vålerenga og Kampen", en: "The roofs of Vålerenga and Kampen" }, built: false }
];

export const ORDER = LINE.map((l) => l.id);
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
  nordmarka: () => import("./nordmarka").then((m) => m.NORDMARKA)
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
