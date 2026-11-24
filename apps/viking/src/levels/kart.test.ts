import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { viewFor } from "@larshansen/pixelkit/stage";
import { frame } from "../game/frame";
import { formatTime, newPlay } from "../game/play";
import { fresh, type Progress } from "../game/progress";
import { padLayout, type Insets, type Rect } from "../render/pad";
import { ENCORE_STOP, LINE, LINE_1, LINE_2, ORDER } from "./index";
import { ENCORE_COL, LINE_Y, kartDef, stationX } from "./kart";
import { kartArt, stationBoards } from "./kartArt";

// Order 41: on the line map the boards under the stations ran into each other where stations stand three tiles apart (Stortinget,
// Ekeberg, Gamle Oslo; Akershus and Rådhuset four), with best times on them and on a phone without (the look-first table,
// `apps/viking/tools/review/o41/before.md`). A board now hangs in a lower row (of three) where it would meet the one before it, and a line's
// added-up time hangs under every board it would meet (`stationBoards` in `kartArt.ts`, the map's look). Held here at a phone's width upright and on its side and on a
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

/** The station boards as `layoutBoards` (main.ts) lists them, in order along the line, the encore's last, each at its old height. */
function stations(unit: number, times: boolean) {
  const stops = [...LINE.map((l, i) => ({ name: l.short ?? l.name, x: stationX(i) })), { name: ENCORE_STOP.name, x: ENCORE_COL * TILE + TILE / 2 }];
  return stops.map((s) => {
    const text = times ? `${s.name} 12:34.5` : s.name;
    return { text, cx: s.x, y: 186, w: boardWidth(text, unit) };
  });
}
/** With every time, the two lines' added-up times under their last stations (Gamle Oslo, Gamlebyen), at their old height. */
function lines(unit: number) {
  return ["nabolaget", "gamlebyen"].map((id) => {
    const text = "Linje 1 1:23:45.6";
    return { text, cx: stationX(LINE.findIndex((l) => l.id === id)), y: 202, w: boardWidth(text, unit) };
  });
}

const meet = (a: { cx: number; w: number; y: number }, b: { cx: number; w: number; y: number }) => Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 + 2 && Math.abs(a.y - b.y) < 11 + 2;

describe("the line map's boards never run into each other (order 41)", () => {
  for (const size of SIZES)
    for (const times of [false, true])
      test(`${size.name}, ${times ? "every station with a best time" : "no best times"}`, () => {
        const boards = stationBoards(stations(size.unit, times), times ? lines(size.unit) : []);
        const met: string[] = [];
        for (let i = 0; i < boards.length; i++) for (let j = i + 1; j < boards.length; j++) if (meet(boards[i], boards[j])) met.push(`${boards[i].text} / ${boards[j].text}`);
        expect(met).toEqual([]);
      });

  test("a board hangs lower only where it would meet the one before it: at a laptop's size with no times, every board in its old place", () => {
    const boards = stationBoards(stations(4, false), []);
    expect(boards.filter((b) => b.y !== 186).map((b) => b.text)).toEqual([]);
  });
});

// Order 42: on a phone on its side, a board order 41's rows lowered came close to the pad's controls (Ekeberg's, line 1 nearly done).
// On a touch screen the map's camera keeps the boards, as far down as the lowest hangs, clear of the pad's bottom row (the move pad,
// the jump; the dash is not on the map) across the whole view (`below` in `game/frame.ts`), as it keeps him and the ground ahead
// clear of every button; and where the camera stops at the line's two ends no board stands under a notch. Held here as the page
// frames the map (`frame` with the pad's room), walking him along the whole line and back, at the order's four phone sizes, at a
// phone's pixel ratio, without a notch and with one (upright the notch at the top and the home bar; on its side on both sides, or
// on one), with the stations' best times and the lines' added-up times on the boards or none. The raised slot (the way in, over
// the jump on its side) stands over the deck itself by design (ADR 0043): the boards pass under it at the screen's edge as the
// stations do, and that is not held. The boards' widths are the same stand-in as above.

const PHONES: [number, number][] = [
  [390, 844],
  [844, 390],
  [360, 640],
  [667, 375]
];
const NO_NOTCH: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
const notches = (w: number, h: number): [string, Insets][] =>
  h > w
    ? [["no notch", NO_NOTCH], ["notch", { top: 47, right: 0, bottom: 34, left: 0 }]]
    : [["no notch", NO_NOTCH], ["notch both sides", { top: 0, right: 47, bottom: 21, left: 47 }], ["notch left", { top: 0, right: 0, bottom: 21, left: 47 }], ["notch right", { top: 0, right: 47, bottom: 21, left: 0 }]];
/** The header over the map on a phone, the site's links whole (CSS pixels, measured): two rows of links and the runes upright, one row on its side. */
const mapBar = (w: number, h: number, safe: Insets) => safe.top + (h > w ? 250 : 39);
/** The most the map's picture may be lifted for its boards, CSS pixels. */
const LIFTED = 48;
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Every board on the map as the page lays it (`layoutBoards`): over each door that is not a station, and under the stations in their rows. */
function mapBoards(progress: Progress, unit: number, safe: Insets) {
  const def = kartDef(progress, kartArt);
  const play = newPlay(def, {});
  const doors = def.doors.flatMap((d) => play.map.find(d.tile).map((t) => ({ id: d.id, sign: d.sign, x: t.c * TILE, w: TILE, h: 2 * TILE, bottom: (t.r + 1) * TILE })));
  const out: { text: string; cx: number; y: number; w: number }[] = [];
  const stations: typeof out = [];
  for (const d of doors) {
    if (ORDER.includes(d.id) || d.id === ENCORE_STOP.id) {
      const text = progress.best[d.id] !== undefined ? `${d.sign} ${formatTime(progress.best[d.id])}` : d.sign;
      stations.push({ text, cx: d.x + d.w / 2, y: d.bottom + 10, w: boardWidth(text, unit) });
    } else out.push({ text: d.sign, cx: d.x + d.w / 2, y: d.bottom - d.h - 13, w: boardWidth(d.sign, unit) });
  }
  const lines: typeof out = [];
  [LINE_1, LINE_2].forEach((ids, n) => {
    const end = doors.find((d) => d.id === ids[ids.length - 1]);
    if (!end || ids.some((id) => progress.best[id] === undefined)) return;
    const text = `Linje ${n + 1} ${formatTime(ids.reduce((a, id) => a + progress.best[id], 0))}`;
    lines.push({ text, cx: end.x + end.w / 2, y: end.bottom + 26, w: boardWidth(text, unit) });
  });
  out.push(...stationBoards(stations, lines, out, Math.ceil(safe.left / unit)));
  return { def, play, boards: out };
}

describe("the line map's boards keep clear of the pad's bottom row and of a notch (order 42)", () => {
  const timed = (ids: string[]): Progress => ({ ...fresh(), cleared: ids, best: Object.fromEntries(ids.map((id) => [id, 754_567])) });
  const PROGRESS: [string, Progress][] = [
    ["nothing cleared", fresh()],
    ["line 1 nearly done, with times", timed(ORDER.slice(0, 9))],
    ["every station, with times", timed([...ORDER, ENCORE_STOP.id].filter((id) => id !== ENCORE_STOP.id).concat([ENCORE_STOP.id]))]
  ];
  for (const [w, h] of PHONES)
    test(`${w} x ${h}`, () => {
      const dpr = 3;
      const v = viewFor(w, h, dpr, 240);
      const unit = v.k / dpr;
      const bad: string[] = [];
      const lifts: string[] = [];
      for (const [label, progress] of PROGRESS) {
        const all = { ...progress, cleared: progress.cleared.filter((id) => ORDER.includes(id)) };
        for (const [notch, safe] of notches(w, h)) {
          const { play, boards } = mapBoards(all, unit, safe);
          const below = Math.max(...boards.map((b) => b.y)) + 11;
          const slots = padLayout(w, h, safe);
          // On the map: the move pad, the way in, the jump (the dash and the shield are not shown there).
          const buttons = [slots.move, slots.enter, slots.jump];
          const row = [slots.move, slots.jump];
          const bar = (mapBar(w, h, safe) * dpr) / v.k;
          let cam: { x: number; y: number } | null = null;
          let plain: { x: number; y: number } | null = null;
          let lift = 0;
          const met = new Set<string>();
          const walk = (x: number, facing: 1 | -1) => {
            // On the deck, or down in Jernhaugen's dip; not on top of line 2's gate, where he cannot stand.
            const bottom = play.map.surfaceBelow(x + PLAYER.w / 2, LINE_Y - TILE);
            if (bottom === null || bottom < LINE_Y) return;
            const him = { x, y: bottom - PLAYER.h };
            const focus = { x: x + PLAYER.w / 2, y: him.y + PLAYER.h / 2, facing };
            const floor = play.map.height;
            const bounds = { width: play.map.width, bottom: v.h > v.w ? Math.max(floor, Math.round(focus.y + v.h / 3)) : floor, top: bar };
            cam = frame(cam ?? { x: 0, y: 0 }, focus, bounds, v, 1000 / 60, cam === null, { buttons, unit, him, facing, vy: 0, below });
            // What the boards cost: how much higher the picture stands than the camera would put it for him alone.
            plain = frame(plain ?? { x: 0, y: 0 }, focus, bounds, v, 1000 / 60, plain === null, { buttons, unit, him, facing, vy: 0 });
            lift = Math.max(lift, (cam.y - plain.y) * unit);
            // Where the camera has stopped at an end of the line, a board on that side of the screen goes no further: it is held there.
            const atLeft = cam.x <= 0.5;
            const atRight = cam.x >= play.map.width - v.w - 0.5;
            for (const b of boards) {
              const r = { x: (b.cx - b.w / 2 - cam.x) * unit, y: (b.y - cam.y) * unit, w: b.w * unit, h: 11 * unit };
              if (r.x + r.w <= 0 || r.x >= w) continue;
              for (const c of row) if (overlaps(r, c)) met.add(`${b.text} under the ${c === slots.move ? "move pad" : "jump"}`);
              if ((atLeft && r.x < safe.left) || (atRight && r.x + r.w > w - safe.right)) met.add(`${b.text} under the notch at the line's ${atLeft ? "start" : "end"} (${Math.round(r.x)} to ${Math.round(r.x + r.w)})`);
            }
          };
          for (let x = TILE; x < play.map.width - 2 * TILE; x += 2) walk(x, 1);
          for (let x = play.map.width - 2 * TILE; x > TILE; x -= 2) walk(x, -1);
          for (const m of met) bad.push(`${label}, ${notch}: ${m}`);
          lifts.push(`${label}, ${notch}: ${Math.round(lift)}`);
          // The lift stays small, the same all along the deck: 0 upright, on its side up to 45 px with every station's time on the boards and a
          // notch (the lines' added-up times hang lowest).
          if (lift > LIFTED) bad.push(`${label}, ${notch}: the picture lifted ${Math.round(lift)} px for the boards`);
        }
      }
      console.log(`${w} x ${h}, the most the picture is lifted for the boards (CSS px): ${lifts.join("; ")}`);
      expect(bad).toEqual([]);
    });
});
