import { TILE } from "@larshansen/pixelkit/config";
import { isOpen, type Progress } from "../game/progress";
import { mapBuilder } from "./build";
import { LINE, LINE_2_AT, ORDER } from "./index";
import type { Art, LevelDef, SignDef } from "./types";

// The line map, as a level built from the visitor's progress: its ground, its stations and its doors.
// How it looks (the stations' skylines, the viaduct, the mound, line 2's track) is drawn by
// `kartArt.ts`, which the page fetches on its own, so the first script does not carry it.
//
// Line 1 runs on a viaduct, thick and red, with a station for each of its ten levels; a branch dips
// under it to Jernhaugen, the burial mound with the maze; Hjem, the door home, is at the far left.
// Line 2, orange, leaves at Stortinget: it runs under line 1 on a low deck and comes up beside its
// end, where its own viaduct carries on with six stations. Until Nabolaget is cleared a gate stands
// across it, with a sign.
//
//   L  line 1, on its viaduct   O  line 2   #  the floor of the dip   F  the gate   h Hjem
//   j  Jernhaugen   i  line 2's sign   1 to 9, 0  line 1's stations   U V Y Z G J  line 2's

/** Where the stations stand, by column: line 1's ten, then line 2's six. */
export const STATIONS = [6, 20, 24, 29, 34, 39, 44, 49, 52, 55, 65, 71, 77, 83, 89, 95];
export const STATION_TILES = "1234567890UVYZGJ";
export const KART_COLS = 101;
/** Line 1's last column: its buffer stop; line 2's deck starts in the next. */
export const LINE_1_END = 58;
/** The gate across line 2 while it is closed, and its sign just before it. */
export const GATE_COL = 60;
export const SIGN_COL = 58;
/** The sign that tells the story of the glamour again (order 27), past Langkaia's station; its words come with the map's look. */
export const STORY_COL = 8;
export const STORY_SIGN: SignDef = { label: { nb: "", en: "" }, lines: { nb: [], en: [] } };
export const LINE_Y = 11 * TILE;
export const DIP = 14 * TILE;
export const DOWN = { points: [[9 * TILE, LINE_Y], [12 * TILE, DIP]] as [number, number][] };
export const UP = { points: [[15 * TILE, DIP], [18 * TILE, LINE_Y]] as [number, number][] };

/** The map, with the gate across line 2 while it is closed. */
export function kartMap(open: boolean): string[] {
  const k = mapBuilder(KART_COLS, 16);
  k.put(2, 10, "h").put(4, 10, "S").put(13, 13, "j").put(STORY_COL, 10, "i").put(SIGN_COL, 10, "i");
  STATIONS.forEach((c, i) => k.put(c, 10, STATION_TILES[i]));
  k.run(0, LINE_1_END, 11, "L").run(LINE_1_END + 1, KART_COLS - 1, 11, "O").run(9, 17, 11, ".");
  k.fill(9, 17, 14, 15, "#");
  if (!open) k.fill(GATE_COL, GATE_COL, 0, 10, "F");
  return k.rows_();
}

/** The station's x on the line (its door's middle). */
export const stationX = (i: number) => STATIONS[i] * TILE + TILE / 2;

/** Line 2 is open once Nabolaget, the end of line 1, is cleared. */
export const lineTwoOpen = (p: Progress) => isOpen(p, ORDER, LINE_2_AT);

/** The sign by line 2's gate, which says when it opens, and once open, where it goes. */
export const LINE_2_SIGN = (open: boolean): SignDef => ({
  label: { nb: "Linje 2", en: "Line 2" },
  lines: open ? { nb: ["Seks stopp, fra Stortinget."], en: ["Six stops, from Stortinget."] } : { nb: ["Åpner når du har klart Vålerenga."], en: ["Opens once Vålerenga is cleared."] }
});

/** How the map is drawn, from `kartArt.ts`: fetched on its own. */
export type KartArt = (progress: Progress, open: boolean) => Art;

export function kartDef(progress: Progress, art: KartArt): LevelDef {
  const open = lineTwoOpen(progress);
  return {
    id: "kart",
    rune: -1,
    name: "T-banen",
    landmark: open ? { nb: "Linje 1 og 2", en: "Lines 1 and 2" } : { nb: "Linje 1", en: "Line 1" },
    place: { nb: "", en: "" },
    sky: null,
    map: kartMap(open),
    legend: { solid: "LO#F", oneWay: "", water: "" },
    ramps: [DOWN, UP],
    carriers: [],
    timed: [],
    cannons: [],
    signs: [STORY_SIGN, LINE_2_SIGN(open)],
    doors: [
      { id: "home", tile: "h", sign: "Hjem", href: "/?from=viking" },
      { id: "maze", tile: "j", sign: "Jernhaugen", href: "#jernhaugen" },
      ...LINE.map((l, i) => ({ id: l.id, tile: STATION_TILES[i], sign: l.short ?? l.name, href: `#${l.id}` }))
    ],
    art: art(progress, open)
  };
}
