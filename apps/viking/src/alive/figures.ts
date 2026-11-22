import { newPlay } from "../game/play";
import { BUILT, loadLevel } from "../levels/index";
import type { LevelDef } from "../levels/types";
import { lookName } from "./census";

// For the tools and the tests only (order 35), never imported by the page: every figure the game draws, by the game's own
// tables, with its name as a player would say it in both languages. `tools/figures.ts` draws each as a sheet at four
// times size and writes `figures.json` from this list; `alive/figures.test.ts` holds that every kind any level uses is in
// it, and `alive/props.test.ts` that every prop kind a level draws has a name. A new enemy, carrier, thrower or level is
// listed by itself; only its name has to be written here (the tests say which is missing).

/** What a figure is: him, an enemy's look, a boss, what carries him in a level, what a thrower throws, a pickup or a thing, a harmless mover, a prop. */
export type FigureGroup = "him" | "enemy" | "boss" | "carrier" | "thrown" | "pickup" | "harmless" | "prop";

export interface FigureKind {
  /** The sheet's file, without `.png`: the group and the kind. */
  file: string;
  group: FigureGroup;
  /** The kind as the game's tables name it: an enemy's look (`lookName`), a level's id, a thrower's look, a prop's kind. */
  kind: string;
  /** The levels it is met in, in line order (the encore last). */
  levels: string[];
}

type Words = { en: string; nb: string };
const n = (en: string, nb: string): Words => ({ en, nb });

/** Every figure's name as a player would say it, by its file. */
export const FIGURE_NAMES: Record<string, Words> = {
  him: n("the viking", "vikingen"),
  // The enemies, by look (as the census names them).
  "enemy-pigeon": n("pigeon", "due"),
  "enemy-pigeonfly": n("pigeon in flight", "flygende due"),
  "enemy-gull": n("gull", "måke"),
  "enemy-gull (thrower)": n("gull with chips", "måke med pommes frites"),
  "enemy-nester": n("nesting gull", "hekkende måke"),
  "enemy-rat": n("rat", "rotte"),
  "enemy-trackrat": n("track rat", "skinnerotte"),
  "enemy-brazier": n("brazier", "fyrfat"),
  "enemy-guard": n("fortress guard", "festningsvakt"),
  "enemy-guard (the bishop's)": n("the bishop's guard", "bispens vakt"),
  "enemy-crow": n("crow", "kråke"),
  "enemy-magpie": n("magpie", "skjære"),
  "enemy-scooter": n("e-scooter", "elsparkesykkel"),
  "enemy-hotdog": n("hot-dog cart", "pølsebod"),
  "enemy-kid": n("kid with snowballs", "unge med snøballer"),
  "enemy-fox": n("fox", "rev"),
  "enemy-grill": n("disposable grill", "engangsgrill"),
  "enemy-hedgehog": n("hedgehog", "pinnsvin"),
  "enemy-hare": n("mountain hare", "fjellhare"),
  "enemy-salmon": n("salmon", "laks"),
  "enemy-duck": n("mallard", "stokkand"),
  "enemy-coot": n("coot", "sothøne"),
  "enemy-swan": n("swan", "svane"),
  "enemy-goose": n("goose", "gås"),
  "enemy-wasp": n("wasp", "veps"),
  "enemy-owl": n("owl", "ugle"),
  "enemy-bat": n("bat", "flaggermus"),
  "enemy-squirrel": n("squirrel", "ekorn"),
  "enemy-anthill": n("anthill", "maurtue"),
  "enemy-trolley": n("shopping trolley", "handlevogn"),
  "enemy-umbrella": n("umbrella", "paraply"),
  "enemy-cat": n("cat", "katt"),
  "enemy-dog": n("dog", "hund"),
  "enemy-crab": n("crab", "krabbe"),
  "enemy-penguin": n("penguin", "pingvin"),
  "enemy-slinger": n("viking with a sling", "viking med slynge"),
  "enemy-statue": n("granite statue", "granittstatue"),
  "enemy-bronze": n("bronze statue", "bronsestatue"),
  "enemy-boy": n("the Angry Boy", "Sinnataggen"),
  "enemy-ringer": n("ring-throwers", "ringkastere"),
  "enemy-sledger": n("sledger", "aker"),
  "enemy-riveter": n("riveter", "naglearbeider"),
  "enemy-archer": n("archer", "bueskytter"),
  // The bosses.
  "boss-troll": n("the troll", "trollet"),
  "boss-plough": n("the snow plough", "brøytebilen"),
  "boss-serpent": n("the sea serpent", "sjøormen"),
  "boss-loki": n("Loki", "Loke"),
  // What carries him, a level at a time.
  "carrier-langkaia": n("the rafts and the rowing boat", "flåtene og robåten"),
  "carrier-akershus": n("the hoist", "heisen"),
  "carrier-radhuset": n("the ferry, the tower lift, the bell and the clock's hands", "ferja, tårnheisen, klokka og viserne"),
  "carrier-slottet": n("the banners and the Guard", "fanene og Garden"),
  "carrier-holmenkollen": n("the chairlift and the tower lift", "stolheisen og tårnheisen"),
  "carrier-akerselva": n("the logs and the water wheel's buckets", "tømmerstokkene og vannhjulets bøtter"),
  "carrier-nordmarka": n("the moose", "elgen"),
  "carrier-stortinget": n("the trains", "T-banetogene"),
  "carrier-ekeberg": n("the trams", "trikkene"),
  "carrier-nabolaget": n("the trams", "trikkene"),
  "carrier-bygdoy": n("the ferry, the raft and the reeds", "ferja, flåten og sivet"),
  "carrier-vigelandsparken": n("the fountain's jets", "fontenens stråler"),
  "carrier-bjorvika": n("the hoist, the crane hooks and the steel sheets", "heisen, krankrokene og stålplatene"),
  "carrier-gamlebyen": n("the longships", "langskipene"),
  // What the throwers throw, by thrower.
  "thrown-gull (thrower)": n("the gull's chips", "måkas pommes frites"),
  "thrown-kid": n("snowballs", "snøballer"),
  "thrown-squirrel": n("pine cones", "kongler"),
  "thrown-slinger": n("sling stones", "slyngesteiner"),
  "thrown-ringer": n("stone rings", "steinringer"),
  "thrown-nester": n("a nesting gull's dive", "en hekkende måkes stup"),
  "thrown-riveter": n("bolts", "bolter"),
  "thrown-archer": n("arrows", "piler"),
  // What he takes, and what every level has.
  "pickup-skilling": n("skilling", "skilling"),
  "pickup-cheese": n("brown cheese", "brunost"),
  "pickup-bracteate": n("gold bracteate", "gullbrakteat"),
  "pickup-rune": n("rune stone", "runestein"),
  "pickup-pole": n("ski pole", "skistav"),
  "pickup-feather": n("raven's feather", "ravnefjær"),
  "pickup-shield": n("shield", "skjold"),
  "pickup-bench": n("bench", "benk"),
  "pickup-flag": n("flag", "flagg"),
  // What moves and does not hurt him (the moose carries him: a carrier).
  "harmless-sheep": n("sheep", "sau"),
  "harmless-heron": n("heron", "hegre"),
  // The props at arm's length (ADR 0051), by kind.
  "prop-baluster": n("balusters", "baluster"),
  "prop-barrier": n("crowd barrier", "sperregjerde"),
  "prop-chair": n("chairlift chair", "stolheisstol"),
  "prop-container": n("site container", "anleggscontainer"),
  "prop-ferry": n("the City Hall ferry", "rådhusferja"),
  "prop-fire basket": n("fire basket", "fyrkurv"),
  "prop-gate lantern": n("gate lantern", "portlykt"),
  "prop-gate pillar": n("gate pillar", "portstolpe"),
  "prop-gondola": n("gondola", "gondol"),
  "prop-hut door": n("plank door", "plankedør"),
  "prop-panel door": n("panel door", "fyllingsdør"),
  "prop-ladder": n("ladder", "stige"),
  "prop-lamp old": n("old-town lantern", "gammel gatelykt"),
  "prop-lamp park": n("park lantern", "parklykt"),
  "prop-lamp square": n("square lamp", "torglykt"),
  "prop-lamp harbour": n("harbour lamp", "havnelykt"),
  "prop-leg": n("the diving tower's legs", "stupetårnets bein"),
  "prop-light pole": n("lit-trail pole", "lysløypestolpe"),
  "prop-log": n("log", "tømmerstokk"),
  "prop-plank wall": n("plank wall", "plankevegg"),
  "prop-pontoons": n("sauna raft pontoons", "badstuflåtenes pongtonger"),
  "prop-post": n("post", "stolpe"),
  "prop-rail bars": n("iron railing", "jernrekkverk"),
  "prop-rail tube": n("tube railing", "rørrekkverk"),
  "prop-rail rope": n("rope railing", "taurekkverk"),
  "prop-roof truss": n("the stage's roof truss", "scenetakets fagverk"),
  "prop-rowboat": n("rowing boat", "robåt"),
  "prop-sauna cabin": n("sauna cabin", "badstuhytte"),
  "prop-site fence": n("site fence", "byggegjerde"),
  "prop-speaker stack": n("speaker stack", "høyttalertårn"),
  "prop-stove pipe": n("stove pipe", "ovnsrør"),
  "prop-tram": n("tram", "trikk"),
  "prop-truss tower": n("lighting tower", "lystårn")
};

/** The file of a kind in a group. */
export const figureFile = (group: FigureGroup, kind: string) => (group === "him" ? "him" : `${group}-${kind}`);

/** The pickups and things every level has, and the harmless movers, by the levels they are met in (empty: everywhere). */
const ALWAYS: [FigureGroup, string, (def: LevelDef) => boolean][] = [
  ["pickup", "skilling", () => true],
  ["pickup", "cheese", () => true],
  ["pickup", "bracteate", (d) => d.rune >= 0],
  ["pickup", "rune", (d) => d.rune >= 0],
  ["pickup", "pole", (d) => d.id === "holmenkollen"],
  ["pickup", "feather", (d) => d.id === "nordmarka"],
  ["pickup", "shield", (d) => d.id === "bygdoy"],
  ["pickup", "bench", () => true],
  ["pickup", "flag", () => true],
  ["harmless", "sheep", (d) => newPlay(d, {}).sheep.length > 0],
  ["harmless", "heron", (d) => d.id === "ostensjovannet"]
];

/** The boss of a level: its troll, or the boss its boss slot runs, by the level. */
const BOSS_OF: Record<string, string> = { nordmarka: "troll", nabolaget: "plough", gamlebyen: "serpent", encore: "loki" };

/**
 * Every figure the levels use, read from their tables: him; every enemy look (by `lookName`) and what every thrower throws;
 * every boss; each level's carriers; the pickups and things every level has, and the harmless movers. Props are listed by
 * the kinds a level draws (`PROPS.used`, passed in), since the props kit knows them only as they are drawn.
 */
export async function figureKinds(props: Record<string, Iterable<string>> = {}): Promise<FigureKind[]> {
  const out = new Map<string, FigureKind>();
  const add = (group: FigureGroup, kind: string, level: string) => {
    const file = figureFile(group, kind);
    const f = out.get(file) ?? out.set(file, { file, group, kind, levels: [] }).get(file)!;
    if (!f.levels.includes(level)) f.levels.push(level);
  };
  for (const st of [...BUILT, { id: "encore" }]) {
    const def = await loadLevel(st.id);
    add("him", "him", def.id);
    for (const e of def.enemies ?? []) {
      add("enemy", lookName({ def: e } as never, def.id), def.id);
      if (e.kind === "thrower") add("thrown", lookName({ def: e } as never, def.id), def.id);
    }
    if (def.troll || def.boss) add("boss", BOSS_OF[def.id] ?? def.id, def.id);
    if (def.carriers.length) add("carrier", def.id, def.id);
    for (const [group, kind, here] of ALWAYS) if (here(def)) add(group, kind, def.id);
    for (const kind of props[def.id] ?? []) add("prop", kind, def.id);
  }
  return [...out.values()];
}

/** A figure's name in both languages, or null where none is written. */
export const nameOf = (file: string): Words | null => FIGURE_NAMES[file] ?? null;
