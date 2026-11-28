import { newPlay } from "../game/play";
import { BUILT, ENCORE_STOP, LINE, loadLevel } from "../levels/index";
import type { LevelDef } from "../levels/types";
import { lookName } from "./census";

// For the tools and the tests only (order 35), never imported by the page: every figure the game draws, by the game's own
// tables, with its name as a player would say it in both languages. `tools/figures.ts` draws each as a sheet at four
// times size and writes `figures.json` from this list; `alive/figures.test.ts` holds that every kind any level uses is in
// it, and `alive/props.test.ts` that every prop kind a level draws has a name. A new enemy, carrier, thrower or level is
// listed by itself; only its name has to be written here (the tests say which is missing).

/** What a figure is: him, an enemy's look, a boss, what carries him in a level, what a thrower throws, a pickup or a thing, a harmless mover, a prop, the maze's, a portrait in the talk panel (order 47). */
export type FigureGroup = "him" | "enemy" | "boss" | "carrier" | "thrown" | "pickup" | "harmless" | "prop" | "maze" | "portrait";

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
  // The maze, Jernhaugen (order 36): what it draws, met in the mound (`jernhaugen`), drawn by `@larshansen/maze`.
  "maze-him": n("the viking in the mound, with his torch", "vikingen i haugen, med fakkelen"),
  "maze-ghost": n("the ghost of your best run", "gjenferdet av beste runde"),
  "maze-adder": n("an adder", "en hoggorm"),
  "maze-raven": n("the raven", "ravnen"),
  "maze-stone": n("a standing stone", "en bautastein"),
  "maze-key": n("the rune key", "runenøkkelen"),
  "maze-portal": n("a teleport stone", "en flyttestein"),
  "maze-dweller": n("the mound-dweller", "haugbonden"),
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
  // Figures of their place's own (order 47), each in another look's box and behaviour (`drawAs`).
  "enemy-hare": n("mountain hare", "fjellhare"),
  "enemy-bicycle": n("commuter's bicycle", "pendlersykkel"),
  "enemy-balloons": n("balloon cart", "ballongvogn"),
  "enemy-forklift": n("forklift", "gaffeltruck"),
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
  // The portraits in the talk panel (order 47, ADR 0057): each expression in a row, a row a stage of the fight.
  "portrait-loki": n("Loki talking: smug, delighted, outraged, wounded, scheming, shouting", "Loke som snakker: selvgod, henrykt, rasende, såret, lurende, roper"),
  "portrait-hero": n("the viking listening: calm, surprised, set, pleased", "vikingen som lytter: rolig, overrasket, bestemt, fornøyd"),
  // The raven's, in the mound (order 48): the maze's talk panel.
  "portrait-raven": n("the raven talking: dry, sharp, pleased", "ravnen som snakker: tørr, skarp, fornøyd"),
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
  "prop-barge board": n("carved barge board", "utskåret vindski"),
  "prop-dragon head": n("carved dragon head", "utskåret dragehode"),
  "prop-skis": n("skis against a wall", "ski mot en vegg"),
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

/** What the maze draws (order 36), met in the mound: drawn by `@larshansen/maze`, listed here so the page of every figure has it. */
export const MAZE_FIGURES = ["him", "ghost", "adder", "raven", "stone", "key", "portal", "dweller"] as const;

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
    // The portraits of the talk panel (order 47), in the level that speaks so: who speaks and who listens.
    if (def.talk) for (const kind of ["loki", "hero"]) add("portrait", kind, def.id);
  }
  for (const kind of MAZE_FIGURES) add("maze", kind, "jernhaugen");
  // The raven speaks in the mound with its face beside its words (order 48).
  add("portrait", "raven", "jernhaugen");
  return [...out.values()];
}

/** A figure's name in both languages, or null where none is written. */
export const nameOf = (file: string): Words | null => FIGURE_NAMES[file] ?? null;

// --- The states' names (order 37) -------------------------------------------------------------------------------------------

/**
 * Every state a sheet of the figures' page names (its rows), in both languages (ADR 0016): what the tool writes in `figures.json`
 * beside each row. A state the tool builds from parts is named from its parts (`stateWords`): a look's state and the levels whose
 * lean it is glammed in, what a thrower throws and where, a carrier's kind and its number, Loki's stage and his moves.
 */
export const STATE_WORDS: Record<string, Words> = {
  // Him (`HIM_ROWS`).
  standing: n("standing", "står"),
  running: n("running", "løper"),
  "in the air": n("in the air", "i lufta"),
  landing: n("landing", "lander"),
  dashing: n("dashing", "rykker"),
  "behind the shield": n("behind the shield", "bak skjoldet"),
  sitting: n("sitting", "sitter"),
  "thrown back by a hit": n("thrown back by a hit", "kastet bakover av et slag"),
  "pushing into a door": n("pushing into a door", "skyver seg inn en dør"),
  // Every enemy (`ENEMY_STATES`).
  still: n("still", "i ro"),
  moving: n("moving", "i bevegelse"),
  "winding up": n("winding up", "tar sats"),
  "its glamour breaking": n("its glamour breaking", "synkvervingen brister"),
  natural: n("natural", "slik den egentlig er"),
  "its glam alone": n("its glam alone", "glammen alene"),
  // The bosses, by their frames' names.
  asleep: n("asleep", "sover"),
  waking: n("waking", "våkner"),
  walking: n("walking", "går"),
  "club raised": n("club raised", "køllen hevet"),
  stuck: n("stuck", "sitter fast"),
  hit: n("hit", "truffet"),
  "backing off": n("backing off", "rygger"),
  "all stone": n("all stone", "helt av stein"),
  parked: n("parked", "parkert"),
  driving: n("driving", "kjører"),
  revving: n("revving", "ruser motoren"),
  charging: n("charging", "braser fram"),
  turning: n("turning", "snur"),
  resting: n("resting", "hviler"),
  beaten: n("beaten", "slått"),
  "ring of foam": n("ring of foam", "en ring av skum"),
  ring: n("ring", "ringen"),
  rising: n("rising", "stiger"),
  reared: n("reared", "reist opp"),
  "its tell": n("its tell", "varselet"),
  spitting: n("spitting", "spytter"),
  watching: n("watching", "følger med"),
  "its tail's fin": n("its tail's fin", "halefinnen"),
  "its tail along the quay": n("its tail along the quay", "halen langs kaia"),
  "ducking its ball": n("ducking its ball", "dukker for kula si"),
  dazed: n("dazed", "ør"),
  "reeling from a hit": n("reeling from a hit", "vakler etter et slag"),
  "its coils": n("its coils", "buktene"),
  diving: n("diving", "dykker"),
  // Loki (`LOKI_STAGES`, `LOKI_MOVES`).
  glammed: n("glammed", "glammet"),
  "the wig knocked off": n("the wig knocked off", "parykken slått av"),
  "the shades knocked off": n("the shades knocked off", "solbrillene slått av"),
  "the jacket knocked off": n("the jacket knocked off", "jakka slått av"),
  waiting: n("waiting", "venter"),
  strutting: n("strutting", "spankulerer"),
  "the club raised: its tell": n("the club raised: its tell", "køllen hevet: varselet"),
  "the slam and its wave": n("the slam and its wave", "slaget og bølgen"),
  "revving: its tell": n("revving: its tell", "ruser: varselet"),
  "the charge": n("the charge", "stormløpet"),
  "the ring of foam: its tell": n("the ring of foam: its tell", "skumringen: varselet"),
  "the jaws": n("the jaws", "kjevene"),
  "posing: the opening": n("posing: the opening", "poserer: åpningen"),
  "reeling from the hit that takes the next piece": n("reeling from the hit that takes the next piece", "vakler etter slaget som tar neste plagg"),
  // The portraits (order 47): Loki's rows by the stage of the fight (`LOKI_STAGES`, and plain), the hero's one.
  "his face, glammed": n("his face, glammed", "ansiktet hans, glammet"),
  "his face, the wig knocked off": n("his face, the wig knocked off", "ansiktet hans, parykken slått av"),
  "his face, the shades knocked off": n("his face, the shades knocked off", "ansiktet hans, solbrillene slått av"),
  "his face, plain": n("his face, plain", "ansiktet hans, vanlig"),
  "his face, quiet": n("his face, quiet", "ansiktet hans, stille"),
  "its face, quiet": n("its face, quiet", "ansiktet dens, stille"),
  "plain: standing, shrugging, walking off": n("plain: standing, shrugging, walking off", "vanlig: står, trekker på skuldrene, går av scenen"),
  // The pickups, the things every level has, the harmless movers, by their frames' names.
  spinning: n("spinning", "snurrer"),
  lying: n("lying", "ligger"),
  "as it falls": n("as it falls", "mens den faller"),
  gold: n("gold", "gull"),
  bench: n("bench", "benken"),
  folded: n("folded", "sammenfoldet"),
  "in the wind": n("in the wind", "i vinden"),
  "in still air": n("in still air", "i stille luft"),
  face: n("face", "forsiden"),
  "on his back": n("on his back", "på ryggen hans"),
  "coming up": n("coming up", "på vei opp"),
  up: n("up", "oppe"),
  lit: n("lit", "tent"),
  dark: n("dark", "mørk"),
  ghost: n("ghost", "svakt omriss"),
  grazing: n("grazing", "beiter"),
  chewing: n("chewing", "tygger"),
  "landed on": n("landed on", "landet på"),
  "looking back": n("looking back", "ser seg tilbake"),
  "making ready": n("making ready", "gjør seg klar"),
  "flying off": n("flying off", "flyr av gårde"),
  // The props: their pieces as drawn.
  "its pieces, smallest first": n("its pieces, smallest first", "bitene, de minste først"),
  "its pieces, smallest first, continued": n("its pieces, smallest first, continued", "bitene, de minste først, fortsatt"),
  // The maze (`MAZE_STATES`).
  "standing, breathing, blinking": n("standing, breathing, blinking", "står, puster, blunker"),
  "running the other way": n("running the other way", "løper den andre veien"),
  "going away, standing, breathing": n("going away, standing, breathing", "går fra oss, står, puster"),
  "going away, running": n("going away, running", "går fra oss, løper"),
  "going away, running, facing the other way": n("going away, running, facing the other way", "går fra oss, løper, vendt den andre veien"),
  "coming toward, standing, breathing, blinking": n("coming toward, standing, breathing, blinking", "kommer mot oss, står, puster, blunker"),
  "coming toward, running": n("coming toward, running", "kommer mot oss, løper"),
  "coming toward, running, facing the other way": n("coming toward, running, facing the other way", "kommer mot oss, løper, vendt den andre veien"),
  cursed: n("cursed", "forbannet"),
  "going away": n("going away", "går fra oss"),
  "coming toward": n("coming toward", "kommer mot oss"),
  "along a corridor, its wave": n("along a corridor, its wave", "langs en gang, i bølger"),
  "the other way": n("the other way", "den andre veien"),
  "up and down a corridor": n("up and down a corridor", "opp og ned en gang"),
  "its head toward him, the other way, blinking": n("its head toward him, the other way, blinking", "hodet mot ham, den andre veien, blunker"),
  "unlit, lit, lighting": n("unlit, lit, lighting", "slukt, tent, tennes"),
  "ready, cooling, sending him": n("ready, cooling, sending him", "klar, kjøles, sender ham"),
  "seated, its eyes following him": n("seated, its eyes following him", "sitter, øynene følger ham")
};

/** His rows on his sheet: a state and the frames of his table in it. */
export const HIM_ROWS: [string, string[]][] = [
  ["standing", ["stand", "breath", "blink", "breathBlink"]],
  ["running", ["run"]],
  ["in the air", ["rise", "apex", "fall"]],
  ["landing", ["land", "landDeep"]],
  ["dashing", ["dash"]],
  ["behind the shield", ["shield"]],
  ["sitting", ["sit", "sitBack", "sitForward"]],
  ["thrown back by a hit", ["hurt"]],
  ["pushing into a door", ["push"]]
];
/** An enemy's rows: glammed (in each lean), then its natural self and its marks alone. */
export const ENEMY_STATES = { still: "still", moving: "moving", windup: "winding up", breaking: "its glamour breaking", natural: "natural", marks: "its glam alone" } as const;
/** Loki's stages, and his moves in the order his rows show them. */
export const LOKI_STAGES = ["glammed", "the wig knocked off", "the shades knocked off", "the jacket knocked off"] as const;
export const LOKI_MOVES = ["waiting", "waking", "strutting", "strutting", "strutting", "the club raised: its tell", "the slam and its wave", "revving: its tell", "the charge", "the ring of foam: its tell", "the jaws", "posing: the opening", "posing: the opening", "reeling from the hit that takes the next piece"] as const;
export const LOKI_PLAIN = "plain: standing, shrugging, walking off";
/** The maze's sheets' rows, in order (order 36, and his front and back since order 37). */
export const MAZE_STATES: Record<string, readonly string[]> = {
  "maze-him": ["standing, breathing, blinking", "running", "running the other way", "going away, standing, breathing", "going away, running", "going away, running, facing the other way", "coming toward, standing, breathing, blinking", "coming toward, running", "coming toward, running, facing the other way", "cursed"],
  "maze-ghost": ["running", "going away", "coming toward"],
  "maze-adder": ["along a corridor, its wave", "the other way", "up and down a corridor"],
  "maze-raven": ["its head toward him, the other way, blinking"],
  "maze-stone": ["unlit, lit, lighting"],
  "maze-key": ["lying"],
  "maze-portal": ["ready, cooling, sending him"],
  "maze-dweller": ["seated, its eyes following him"]
};
/** A carrier's kind (the kit's), as its row is named with its number. */
export const CARRIER_WORDS: Record<string, Words> = { path: n("path", "bane"), lift: n("lift", "heis"), orbit: n("orbit", "sirkel"), travel: n("travel", "pendel"), bob: n("bob", "duver") };
/** What a thrower throws: its row, with the levels it is thrown in. */
export const THROWN_STATE = n("in flight, spinning, spent", "i lufta, snurrer, brukt opp");

/** A level's name as a player knows it (the station's), the same in both languages. */
const placeName = (id: string) => [...LINE, ENCORE_STOP].find((l) => l.id === id)?.name ?? id;
const places = (ids: string) => ids.split(", ").map(placeName).join(", ");

/** A row's state in both languages, built from its parts where the tool builds it so; null where a part has no words. */
export function stateWords(state: string): Words | null {
  const whole = STATE_WORDS[state];
  if (whole) return whole;
  const glammed = /^(.*), glammed as at (.*)$/.exec(state);
  if (glammed) {
    const base = STATE_WORDS[glammed[1]];
    return base && n(`${base.en}, glammed as at ${places(glammed[2])}`, `${base.nb}, glammet som på ${places(glammed[2])}`);
  }
  const thrown = new RegExp(`^${THROWN_STATE.en} \\((.*)\\)$`).exec(state);
  if (thrown) return n(`${THROWN_STATE.en} (${places(thrown[1])})`, `${THROWN_STATE.nb} (${places(thrown[1])})`);
  const carrier = /^(\w+) (\d+)$/.exec(state);
  if (carrier) {
    const kind = CARRIER_WORDS[carrier[1]];
    return kind && n(`${kind.en} ${carrier[2]}`, `${kind.nb} ${carrier[2]}`);
  }
  const stage = /^([^:]+): (.*)$/.exec(state);
  if (stage && STATE_WORDS[stage[1]]) {
    const moves = stage[2].split("; ").map((m) => STATE_WORDS[m]);
    if (moves.some((m) => !m)) return null;
    return n(`${STATE_WORDS[stage[1]].en}: ${moves.map((m) => m.en).join("; ")}`, `${STATE_WORDS[stage[1]].nb}: ${moves.map((m) => m.nb).join("; ")}`);
  }
  return null;
}

/** A row's state from a frame's name, as the sheets made from frame tables (the bosses', the small things') take it. */
export const stateOfFrame = (name: string) => name.split(/[,:]/)[0].replace(/ \d+$/, "").trim();

/**
 * The name the figures' page gives a frame of one of the small things' sheets (`tools/glance/frames.ts` names them), from which its
 * row's state is taken (`stateOfFrame`): a coin and the bracteate spin, the cheese lies, the pole stands, the feather falls or is
 * gold, the rune stone's state is its last word, the sheep's and the heron's lose their own name.
 */
export function thingState(sheet: string, frame: string): string {
  if (sheet === "skilling" || sheet === "bracteate") return "spinning";
  if (sheet === "cheese") return "lying";
  if (sheet === "pole") return "standing";
  if (sheet === "feather") return frame.includes("gold") ? "gold" : "as it falls";
  if (sheet === "rune stone") return frame.split(", ").at(-1)!;
  if (sheet === "sheep") return frame.replace(/^sheep, /, "");
  if (sheet === "heron") return frame.replace(/^heron, /, "").replace(/^heron$/, "standing");
  return frame;
}
