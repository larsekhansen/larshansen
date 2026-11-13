// Shared swatches. Daylight colours only: dusk and night come from the shared tint, and lamps
// from the shared light list, so no scene keeps a night palette of its own.
// Where a material already exists on the front page (grass, earth, stone, water), the value is
// the front page's, so a viking meadow and a Gamle Oslo garden look like the same grass.

// The person.
export const SKIN = "#f1c27d";
export const HAT_RED = "#c8302b";
export const SWEATER = "#2b4c8c";
export const INK = "#1f1a17";
export const LAMP = "#ffd36b";
export const GOLD = "#e8b923";

export interface Stone {
  base: string;
  light: string;
  dark: string;
  mortar: string;
  moss: string;
}
/** Ruined stone as the front page draws it. */
export const STONE: Stone = { base: "#7d776e", light: "#8c857a", dark: "#6c665e", mortar: "#4b4741", moss: "#5d7a45" };

export const PALETTE = {
  wood: "#9a6a3a", // the front page's crate face
  woodDark: "#5a3d24", // its sign posts
  turf: "#4f8a46", // roof turf: the front page's tree green
  grass: "#5aa04a", // the garden
  grassDark: "#3f7d35",
  earth: "#6b4a2f",
  rock: "#7d776e", // STONE.base
  rockDark: "#5f5c58", // the front page's far ruins
  water: "#3d7fae", // the fjord
  waterDeep: "#2d6590",
  foam: "#d6eef9",
  iron: "#6b7480",
  ironDark: "#5d646e", // the helmet
  sail: "#e8e2d4",
  sailStripe: "#b04a35", // the red of the hill houses
  wool: "#ece8df", // the birch bark white
  runeGlow: "#9fe3ff",
  sand: "#d8c590",
  sandDark: "#b9a36d",
  // The front page's sign boards and crates.
  board: "#6b4a2b",
  boardEdge: "#4a321d",
  crate: "#6e4824",
  crateEdge: "#3d2612",
  crateShade: "#7d5530",
  crateTop: "#d9a466",
  snow: "#f2f5fa",
  // The burial mound (the maze): packed earth in two close browns, the curse, the creatures.
  moundEarth: "#dca652", // daylight colour: after the night tint it lands near #5a4a3c, the lightest step of the mound
  moundEarthDark: "#cf9a48",
  moundEarthLight: "#e4b462",
  moundDeep: "#15131b", // the solid earth around the carved tunnels
  moundDeepSpeck: "#1d1b26",
  skyBlue: "#8fc4ec",
  curse: "#8a2a1e", // the rust-red line along every wall; it pulses between these two
  curseBright: "#c8402b",
  curseFlash: "#ff7a55",
  daylight: "#e6f3f8",
  snakeGreen: "#3f8f3a", // the old game's snakes
  snakePurple: "#7a3f9a",
  tongue: "#d23a3a",
  raven: "#17141a",
  ravenBeak: "#8f897d",
  ravenEye: "#d9d4c8"
} as const;

// ---------------------------------------------------------------------------------------------
// Materials of the side-view scenes, grouped by what things are made of. The values are the ones
// the front page and the viking game drew with before they had names; where a shade is used in one
// place only, its name says where. The two games take every colour from here.

/** Highlights, and the far end of `mix` for a lighter shade. */
export const WHITE = "#ffffff";
/** The paint of the words on sign boards. */
export const SIGN_PAINT = "#fff4dc";
/** Dust kicked up by a hard landing. */
export const DUST = "#ebe1cd";
/** The underside of a sheep's fleece, mixed into the wool for its lower rows. */
export const WOOL_SHADE = "#8a8478";

export const SNOW = {
  lying: PALETTE.snow,
  /** The line under snow lying on the ground. */
  shade: "#cfd8e6",
  /** Snow on far roofs, hills and headlands. */
  far: "#eef3f9",
  /** The far mountains' snowcaps, there all year. */
  peak: "#f1f6fb"
} as const;

/** What the streets are made of. Grass and earth are the palette's. */
export const GROUND = {
  cobble: "#8d8a84", // Vålerenga and Kampen
  cobbleDot: "#6f6c66",
  cobbleFill: "#4a4038",
  paving: "#dcd9d1", // the square in Bjørvika
  pavingDot: "#c4c1b8",
  pavingFill: "#6d6a63",
  gravel: "#c8b98f", // the path through the garden gate
  pebble: "rgba(0, 0, 0, 0.25)"
} as const;

export const PLANTS = {
  hedge: "#2f6b3a",
  hedgeLight: "#3f8a4b",
  hedgeDark: "#285c32",
  hedgeTop: "#7cc06f",
  hedgeEdge: "#173620",
  gateShade: "#24452a", // the garden in the shade behind its gate
  clipped: "#3f7a46", // the rows of hedge seen through the garden gate
  bark: "#5b4030",
  birchBark: "#ece8df",
  birchMark: "#2a2a2a",
  leaves: "#4f8a46",
  leavesShine: "#64a157",
  birchLeaves: "#8fbf5a",
  birchShine: "#a8d06e",
  autumn: "#c8702f",
  autumnShine: "#de8a3f",
  birchAutumn: "#e3b23c",
  birchAutumnShine: "#f2cf5b",
  palmTrunk: "#6b5a3a",
  spruce: "#27492f",
  spruceTrunk: "#3b2a20"
} as const;

/** Land seen from far away: hills, forests, islands, mountains. */
export const LAND = {
  farHills: "#93a6ba",
  forest: "#5f8458", // Ekeberg, and the far shore of the fjord
  forestDark: "#4b6e46",
  island: "#4f7a4c", // Hovedøya, and the grass on the islets
  slope: "#7d9466", // Galgeberg
  mountains: "#bdd0e2",
  mountainsNear: "#a3b9cd",
  headland: "#355f3a",
  headlandDark: "#2f5535",
  river: "#4f8fbf" // the Alna, past Kruttverket
} as const;

export const MASONRY = {
  lintel: "#8a8378",
  worn: "#c2bbae", // the trodden top of ruin walls and lintels
  edge: "#2b2825",
  gatePost: "#b9b2a6",
  gatePostLine: "#9c958a",
  church: "#8f8a83", // Vålerenga kirke
  churchTower: "#857f78",
  churchWindow: "#5a5650",
  chimney: "#7a6f66"
} as const;

/** Ruined stone further back than the walls you can stand on: darker and cooler. */
export const STONE_BACK: Stone = { base: "#5f5c58", light: "#68645f", dark: "#56534f", mortar: "#474441", moss: "#4c5f40" };

export const BRICK = {
  red: "#9b4a3a", // the workshop, and Kampen kirke
  course: "#86402f",
  kampenWindow: "#6f3329",
  kruttverket: "#a2533f",
  kruttverketWindow: "#3f3532",
  kruttverketChimney: "#8c4636",
  kruttverketCap: "#7a3d30"
} as const;

/** Painted wooden houses, their trim and their doors. */
export const PAINT = {
  trim: "#f4efe4",
  mint: "#8fb8a0", // the green house at Vålerenga
  mintLine: "#7ea692",
  ochre: "#d6a347", // the yellow house
  ochreLine: "#c18f38",
  red: "#a8432f",
  redLine: "#93392a",
  // Small houses far away, on Galgeberg and the far shore of the fjord.
  farOchre: "#c9a14a",
  farRed: "#b04a35",
  farWhite: "#e8e2d4",
  farGreen: "#86a98f",
  homeDoor: "#3f6b4f",
  homeDoorPanel: "#4b7a5c",
  shopFrame: "#5a3b22",
  shopDoor: "#7a4b2a",
  shopDoorPanel: "#8a5a33"
} as const;

export const ROOF = {
  red: "#7b2d26",
  slate: "#3e3a3a",
  churchSlate: "#4a4f55",
  far: "#5a3a32", // the small far houses
  factory: "#5b4a46",
  sawTooth: "#77756f"
} as const;

export const METAL = {
  lampPost: "#2f3438",
  lampHat: "#3b4045",
  lampGlass: "#d9dcd2",
  castIron: "#2c2f36", // the workshop window, the garden gate
  pipe: "#4a4f55",
  pipeCap: "#3a3e43",
  pipeShine: "#6a7077",
  brass: "#d9b45a", // door knobs, the flag's finial
  padlock: "#c9a227",
  shackle: "#9a9690",
  keyhole: "#5a4a2a",
  flagpole: "#e9e9e9",
  rail: "#6c7378",
  wire: "#2b2f33"
} as const;

export const GLASS = {
  pane: "#a9d2e6",
  farWindow: "#4b5560", // a dark window in a far house, before it is lit
  palmHouse: "#cfe6ee",
  library: "#dfe7ea",
  foyer: "#557985",
  foyerMullion: "#8fb0bb"
} as const;

/** Bjørvika's new buildings and the ones along the skyline: aluminium, glass, white stone. */
export const FACADE = {
  libraryTop: "#e7edef",
  libraryRidge: "#c3ccd1",
  libraryUnder: "#9aa7ad",
  libraryMullion: "#c5cfd4",
  libraryTopMullion: "#cfd8dc",
  libraryFloor: "#b8c4ca",
  libraryFrame: "#8d9aa1",
  libraryDoor: "#a9bcc4",
  libraryDoorPanel: "#b9cad1",
  marble: "#f3f2ee", // the Opera roof
  marbleEdge: "#c9c8c0",
  marbleWall: "#e4e3dc",
  marbleSeam: "#d6d5cd",
  stageTower: "#e6ecef",
  stageTowerTop: "#d4dde1",
  stageTowerDot: "#c9d3d8",
  stageDoor: "#2b3943",
  aluminium: "#c4ccd2", // Munch
  aluminiumLine: "#aab4bb",
  munchWindow: "#56646e",
  hall: "#8e8c86", // the Kværner hall
  hallWindow: "#4f5560",
  balcony: "#9aa3a8",
  /** The ordinary blocks of the skyline. */
  blocks: ["#b9c2ca", "#c8b8a4", "#aab5a2", "#c3a69a", "#d4ccbe"],
  /** Book spines on Deichman's shelves. */
  books: ["#b8433a", "#2f6db5", "#e0b23a", "#3f8a4f", "#7a4fa0", "#d9734a"]
} as const;

/** The dark inside an open doorway. */
export const DOORWAY = {
  wood: "#140d08",
  garden: "#14200f",
  stage: "#0c1218"
} as const;

export const FIRE = {
  flame: "#ff7a2a",
  glow: "#ffc24a",
  core: "#fff0b0",
  /** Smoke, as rgb for its fading alpha: from a wood stove, and from the forge. */
  smoke: "200, 196, 190",
  soot: "70, 66, 62"
} as const;

/** The Norwegian flag: on 17 May, and in the fireworks. */
export const FLAG = { red: "#ba0c2f", white: "#ffffff", blue: "#00205b" } as const;

export const TRAM = { body: "#1f62b3", glass: "#bfe3ff", skirt: "#16467f" } as const;

/** The raven's feather as it floats down onto him. */
export const FEATHER = { vane: "#14131a", sheen: "#4f9bd8", shine: "rgba(255, 255, 255, 0.7)" } as const;
