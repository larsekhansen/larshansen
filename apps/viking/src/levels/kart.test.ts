import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { ENCORE_STOP, LINE } from "./index";
import { ENCORE_COL, boardRows, stationX, under } from "./kart";

// Order 41: on the line map the boards under the stations ran into each other where stations stand three tiles apart (Stortinget,
// Ekeberg, Gamle Oslo; Akershus and Rådhuset four), with best times on them and on a phone without (the look-first table,
// `apps/viking/tools/review/o41/before.md`). A board now hangs in a lower row (of three) where it would meet the one before it (`boardRows`), and a
// line's added-up time hangs under every board it would meet (`under`). Held here at a phone's width upright and on its side and on a
// laptop, in either language (the station names are Norwegian in both; the times are numbers), with and without best times: no two
// boards come within two pixels of each other. The words' widths are a generous stand-in for the browser's (no canvas here): 0.62
// of the font's size a character, the board's width as `boardWidth` makes it from that.

/** Screen pixels per art pixel and the boards' font, as the kit's text sets them (`unit`, `fontPx`), at each size. */
const SIZES = [
  { name: "360 x 640 upright", unit: 4 / 3 },
  { name: "390 x 844 upright", unit: 4 / 3 },
  { name: "844 x 390 on its side", unit: 2 },
  { name: "1280 x 800", unit: 4 }
];
const fontPx = (unit: number) => Math.max(11, Math.round(4.3 * unit));
const boardWidth = (text: string, unit: number) => Math.ceil(((text.length * 0.62 * fontPx(unit)) / unit + 8) / 2) * 2;

/** The station boards as `layoutBoards` (main.ts) lays them, in order along the line, the encore's last. */
function stations(unit: number, times: boolean) {
  const stops = [...LINE.map((l, i) => ({ name: l.short ?? l.name, x: stationX(i) })), { name: ENCORE_STOP.name, x: ENCORE_COL * TILE + TILE / 2 }];
  const list = stops.map((s) => {
    const text = times ? `${s.name} 12:34.5` : s.name;
    return { text, cx: s.x, y: 186, w: boardWidth(text, unit) };
  });
  const rows = boardRows(list);
  return list.map((b, i) => ({ ...b, y: b.y + rows[i] * 13 }));
}

const meet = (a: { cx: number; w: number; y: number }, b: { cx: number; w: number; y: number }) => Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 + 2 && Math.abs(a.y - b.y) < 11 + 2;

describe("the line map's boards never run into each other (order 41)", () => {
  for (const size of SIZES)
    for (const times of [false, true])
      test(`${size.name}, ${times ? "every station with a best time" : "no best times"}`, () => {
        const boards = stations(size.unit, times);
        // With every time, the two lines' added-up times under their last stations (Gamle Oslo, Gamlebyen).
        if (times)
          for (const id of ["nabolaget", "gamlebyen"]) {
            const i = LINE.findIndex((l) => l.id === id);
            const text = "Linje 1 1:23:45.6";
            const w = boardWidth(text, size.unit);
            boards.push({ text, cx: stationX(i), y: under(boards, stationX(i), w), w });
          }
        const met: string[] = [];
        for (let i = 0; i < boards.length; i++) for (let j = i + 1; j < boards.length; j++) if (meet(boards[i], boards[j])) met.push(`${boards[i].text} / ${boards[j].text}`);
        expect(met).toEqual([]);
      });

  test("a board hangs lower only where it would meet the one before it: at a laptop's size with no times, every board in its old place", () => {
    const boards = stations(4, false);
    expect(boards.filter((b) => b.y !== 186).map((b) => b.text)).toEqual([]);
  });
});
