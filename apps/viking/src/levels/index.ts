import { AKERSHUS } from "./akershus";
import { LANGKAIA } from "./langkaia";
import { RADHUSET } from "./radhuset";
import type { LevelDef, Planned } from "./types";

// The ten levels, one per rune of LARS HANSEN, in the order the line runs. Three are built; the
// rest are on the plan (docs/games/LEVELS.html) and stand behind the fence on the line map.

export const BUILT: LevelDef[] = [LANGKAIA, AKERSHUS, RADHUSET];

export const PLANNED: Planned[] = [
  { id: "slottet", rune: 3, name: "Slottet", place: { nb: "Karl Johan, opp til Slottet", en: "Karl Johan, uphill to the palace" } },
  { id: "holmenkollen", rune: 4, name: "Holmenkollen", place: { nb: "Hoppbakken", en: "The ski jump" } },
  { id: "akerselva", rune: 5, name: "Akerselva", place: { nb: "Nedover elva fra Nydalen til Vaterland", en: "Down the river from Nydalen to Vaterland" } },
  { id: "nordmarka", rune: 6, name: "Nordmarka", place: { nb: "Skogen nord for byen", en: "The forest north of the city" } },
  { id: "stortinget", rune: 7, name: "Stortinget", place: { nb: "T-banestasjonen under sentrum", en: "The T-bane station under the centre" } },
  { id: "ekeberg", rune: 8, name: "Ekeberg", place: { nb: "Lia over Gamle Oslo", en: "The hillside above Gamle Oslo" } },
  { id: "nabolaget", rune: 9, name: "Nabolaget", place: { nb: "Takene på Vålerenga og Kampen", en: "The roofs of Vålerenga and Kampen" } }
];

/** All ten in order, built or not. */
export const LINE: (LevelDef | Planned)[] = [...BUILT, ...PLANNED];
export const ORDER = LINE.map((l) => l.id);

export const levelById = (id: string): LevelDef | undefined => BUILT.find((l) => l.id === id);
export const isBuilt = (l: LevelDef | Planned): l is LevelDef => "map" in l;
