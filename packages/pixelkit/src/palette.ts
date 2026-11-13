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
  ravenEye: "#d9d4c8",
  // The maze, later: the ghost of a best run, teleport stones, sparks, dust, the gold feather.
  ghost: "#dfe9f2", // the ghost's colours are mixed this far toward pale blue-white
  portalStone: "#8e9aa8", // a teleport stone's flat top, and its darker rim
  portalRim: "#5b6573",
  portalGlow: "#6fc3ff", // the blue of its rune and its shimmer
  curseSpark: "#d0452f", // the rust-red burst when the curse takes him
  curseSparkDark: "#7e2318",
  dust: "#c9a878", // a puff of the mound's floor at his feet, as it looks in his torchlight (drawn after the night tint)
  dustFaint: "#9c8160",
  featherGold: "#e8b923", // the feather after all seven levels: GOLD
  featherGoldDark: "#a8801a",
  featherGoldSheen: "#fff1b8"
} as const;

// ---------------------------------------------------------------------------------------------
// Materials of the side-view scenes, grouped by what things are made of. The values are the ones
// the front page and the viking game drew with before they had names; where a shade is used in one
// place only, its name says where. The two games take every colour from here.
// Each material is a small module in swatches/, exported here as a namespace (`PLANTS.hedge`), so
// the bundler turns every swatch into a short variable and leaves out the ones a page never uses.

/** Highlights, and the far end of `mix` for a lighter shade. */
export const WHITE = "#ffffff";
/** The paint of the words on sign boards. */
export const SIGN_PAINT = "#fff4dc";
/** Dust kicked up by a hard landing. */
export const DUST = "#ebe1cd";
/** The underside of a sheep's fleece, mixed into the wool for its lower rows. */
export const WOOL_SHADE = "#8a8478";
/** The blink of something about to change: the maze's sliding walls, and ledges on a beat. */
export const SHIMMER = "#e7f3ff";
/** Ruined stone further back than the walls you can stand on: darker and cooler. */
export const STONE_BACK: Stone = { base: "#5f5c58", light: "#68645f", dark: "#56534f", mortar: "#474441", moss: "#4c5f40" };

export * as SNOW from "./swatches/snow";
export * as GROUND from "./swatches/ground";
export * as PLANTS from "./swatches/plants";
export * as LAND from "./swatches/land";
export * as MASONRY from "./swatches/masonry";
export * as BRICK from "./swatches/brick";
export * as PAINT from "./swatches/paint";
export * as ROOF from "./swatches/roof";
export * as METAL from "./swatches/metal";
export * as GLASS from "./swatches/glass";
export * as FACADE from "./swatches/facade";
export * as DOORWAY from "./swatches/doorway";
export * as FIRE from "./swatches/fire";
export * as FLAG from "./swatches/flag";
export * as TRAM from "./swatches/tram";
export * as FEATHER from "./swatches/feather";
