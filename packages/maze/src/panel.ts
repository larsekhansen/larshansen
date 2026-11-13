import { PALETTE, STONE } from "@larshansen/pixelkit/palette";
import type { Strings } from "./i18n";
import { formatTime } from "./rules";
import { markCount, marksOf, type Marks, type Records } from "./records";

// The maze's cards (the kit's chrome.css `.card`, cream, like the finish card): the level list,
// opened from the level label in the header, and the card that shows when a level is cleared. The
// scene owns them, so both pages that host the maze get the same ones. Their styles are put in the
// page once, here, so neither page needs to know about them. Each level's marks are shown as three
// notches cut in a small standing stone, drawn with filled rectangles on a tiny canvas.

const CSS = `
.mz-levels {
  position: absolute;
  top: 18%;
  left: 50%;
  z-index: 5;
  transform: translateX(-50%);
  align-items: stretch;
  min-width: min(340px, calc(100% - 24px));
  padding: 14px 16px 16px;
}
.mz-levels strong { margin-bottom: 4px; }
.mz-levels .mz-close {
  position: absolute;
  top: 6px;
  right: 10px;
  padding: 0 4px;
  border: 0;
  background: none;
  color: inherit;
  font-size: 20px;
  line-height: 1.2;
  cursor: pointer;
}
.mz-levels .mz-row {
  display: grid;
  grid-template-columns: 1.4em auto 1fr auto;
  align-items: center;
  gap: 4px 10px;
  padding: 5px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.mz-levels .mz-row:hover:not(:disabled),
.mz-levels .mz-row:focus-visible { border-color: #541321; color: #541321; }
.mz-levels .mz-row.here { background: #f1e8d6; }
.mz-levels .mz-row:disabled { color: rgba(31, 26, 23, 0.38); cursor: default; }
.mz-levels .mz-row:disabled .mz-stone { opacity: 0.35; }
.mz-levels .mz-row b { font-variant-numeric: tabular-nums; }
.mz-levels .mz-row span:last-child { font-variant-numeric: tabular-nums; color: rgba(31, 26, 23, 0.7); }
.mz-levels .mz-row:disabled span:last-child { color: inherit; }
/* The stage's own canvases are stacked absolutely; these small ones sit in the card's flow. */
.card canvas.mz-stone { position: static; display: block; flex: none; will-change: auto; image-rendering: pixelated; image-rendering: crisp-edges; }
.mz-done {
  z-index: 5;
  top: 16%;
  min-width: min(300px, calc(100% - 24px));
}
.mz-done .mz-sub { color: var(--muted); }
.mz-done .mz-time { margin-top: 4px; font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
.mz-done .mz-time small { margin-left: 8px; color: #541321; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.mz-marks { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
.mz-marks ul { margin: 0; padding: 0; list-style: none; text-align: left; line-height: 1.5; }
.mz-marks li { color: rgba(31, 26, 23, 0.38); }
.mz-marks li.on { color: var(--ink); }
.mz-marks li.new { font-weight: 700; }
.mz-done .mz-line { max-width: 26em; margin-top: 8px; font-style: italic; }
.mz-done .mz-line:empty { display: none; }
`;

function addStyles() {
  if (document.getElementById("maze-panel-css")) return;
  const style = document.createElement("style");
  style.id = "maze-panel-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

/** Clicks and drags on a card are not steering. */
function keepPointer(el: HTMLElement) {
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) el.addEventListener(type, (e) => e.stopPropagation());
}

/**
 * A standing stone, 10 x 14 art pixels, scaled up `scale` times and kept sharp, with three notches
 * cut across its face: lit in the rune's blue for each mark held, dark mortar for each still to earn.
 */
export function markStone(marks: Marks, scale: number, label: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 10;
  c.height = 14;
  c.className = "mz-stone";
  c.style.width = `${10 * scale}px`;
  c.style.height = `${14 * scale}px`;
  c.setAttribute("role", "img");
  c.setAttribute("aria-label", label);
  c.title = label;
  const g = c.getContext("2d");
  if (!g) return c;
  const R = (x: number, y: number, w: number, h: number, color: string) => {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  };
  // The stone as the maze draws it, with its shadow.
  R(2, 13, 7, 1, "rgba(31, 26, 23, 0.25)");
  R(1, 2, 8, 11, "#b7b2a8");
  R(2, 1, 6, 1, "#d0cbc0");
  R(1, 2, 1, 11, "#d0cbc0");
  R(8, 2, 1, 11, "#8d887f");
  R(1, 12, 8, 1, "#8d887f");
  marks.forEach((on, i) => {
    const y = 4 + i * 3;
    R(2, y, 6, 1, on ? PALETTE.runeGlow : STONE.mortar);
    R(2, y + 1, 6, 1, on ? "#5fa9c9" : "#9a958c"); // the notch's lower lip
  });
  return c;
}

export interface LevelPanel {
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
  /** Fills in the list again from the current records and the furthest level reached. */
  refresh(): void;
  destroy(): void;
}

export function createLevelPanel(
  parent: HTMLElement,
  opts: { t: Strings; names: readonly string[]; pars: readonly number[]; current(): number; open(level: number): boolean; records(): Records; pick(level: number): void; onChange?(open: boolean): void }
): LevelPanel {
  addStyles();
  const el = document.createElement("div");
  el.className = "card mz-levels";
  el.id = "mz-levels";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", opts.t.levelsTitle);
  el.hidden = true;
  parent.appendChild(el);
  keepPointer(el);

  let isOpen = false;
  function refresh() {
    el.textContent = "";
    const title = document.createElement("strong");
    title.textContent = opts.t.levelsTitle;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "mz-close";
    close.textContent = "×";
    close.setAttribute("aria-label", opts.t.levelsClose);
    close.addEventListener("click", () => api.close());
    el.append(title, close);
    const records = opts.records();
    opts.names.forEach((name, i) => {
      const n = i + 1;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "mz-row" + (n === opts.current() ? " here" : "");
      row.disabled = !opts.open(n);
      const best = records[n];
      const num = document.createElement("b");
      num.textContent = String(n);
      const marks = marksOf(best, opts.pars[i] * 1000);
      const stone = markStone(marks, 2, opts.t.marks(markCount(marks)));
      const label = document.createElement("span");
      label.textContent = name;
      const rec = document.createElement("span");
      rec.textContent = row.disabled ? opts.t.notReached : best ? opts.t.record(formatTime(best.ms), best.deaths) : "–";
      row.append(num, stone, label, rec);
      row.addEventListener("click", () => {
        api.close();
        opts.pick(n);
      });
      el.appendChild(row);
    });
  }
  const api: LevelPanel = {
    get isOpen() {
      return isOpen;
    },
    open() {
      if (isOpen) return;
      refresh();
      isOpen = true;
      el.hidden = false;
      opts.onChange?.(true);
      el.querySelector<HTMLElement>(".mz-row:not(:disabled)")?.focus();
    },
    close() {
      if (!isOpen) return;
      isOpen = false;
      el.hidden = true;
      opts.onChange?.(false);
    },
    toggle() {
      if (isOpen) api.close();
      else api.open();
    },
    refresh,
    destroy() {
      el.remove();
    }
  };
  return api;
}

/** What the card after a level shows. */
export interface Cleared {
  level: number;
  name: string;
  ms: number;
  deaths: number;
  parMs: number;
  /** True if this clear was the best time yet. */
  best: boolean;
  /** The level's marks now, and the ones this clear earned for the first time. */
  marks: Marks;
  fresh: Marks;
  /** The raven's words for a feather won, if one was. */
  line: string;
  /** The last level: the card's one button leaves the mound. */
  last: boolean;
}

export interface LevelCard {
  readonly isOpen: boolean;
  show(c: Cleared): void;
  hide(): void;
  destroy(): void;
}

/** The card after a level: its time and curses, the stone with its marks, and on, or out. */
export function createLevelCard(parent: HTMLElement, t: Strings, actions: { next(): void; leave(): void }): LevelCard {
  addStyles();
  const el = document.createElement("div");
  el.className = "card mz-done";
  el.setAttribute("role", "status");
  el.hidden = true;
  parent.appendChild(el);
  keepPointer(el);
  let isOpen = false;
  const api: LevelCard = {
    get isOpen() {
      return isOpen;
    },
    show(c) {
      el.textContent = "";
      const title = document.createElement("strong");
      title.textContent = t.cleared(c.level);
      const sub = document.createElement("p");
      sub.className = "mz-sub";
      sub.textContent = c.name;
      const time = document.createElement("p");
      time.className = "mz-time";
      time.textContent = t.record(formatTime(c.ms), c.deaths);
      if (c.best) {
        const best = document.createElement("small");
        best.textContent = t.newBest;
        time.appendChild(best);
      }
      const marks = document.createElement("div");
      marks.className = "mz-marks";
      const list = document.createElement("ul");
      [t.markCleared, t.markClean, t.markPar(formatTime(c.parMs).replace(/\.0$/, ""))].forEach((label, i) => {
        const li = document.createElement("li");
        li.textContent = label;
        if (c.marks[i]) li.classList.add("on");
        if (c.fresh[i]) li.classList.add("new");
        list.appendChild(li);
      });
      marks.append(markStone(c.marks, 3, t.marks(markCount(c.marks))), list);
      const line = document.createElement("p");
      line.className = "mz-line";
      line.textContent = c.line;
      const buttons = document.createElement("span");
      buttons.className = "actions";
      const on = document.createElement("button");
      on.type = "button";
      on.className = "primary";
      on.textContent = c.last ? t.leaving : t.next;
      on.addEventListener("click", () => actions.next());
      buttons.appendChild(on);
      if (!c.last) {
        const out = document.createElement("button");
        out.type = "button";
        out.textContent = t.leaving;
        out.addEventListener("click", () => actions.leave());
        buttons.appendChild(out);
      }
      el.append(title, sub, time, marks, line, buttons);
      isOpen = true;
      el.hidden = false;
    },
    hide() {
      isOpen = false;
      el.hidden = true;
    },
    destroy() {
      el.remove();
    }
  };
  return api;
}
