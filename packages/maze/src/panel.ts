import type { Strings } from "./i18n";
import { formatTime } from "./rules";
import type { Records } from "./records";

// The level list: a card (the kit's chrome.css), the same cream panel as the finish card, opened from the level label in
// the header. The scene owns it, so both pages that host the maze get the same panel. Its styles
// are put in the page once, here, so neither page needs to know about it.

const CSS = `
.mz-levels {
  position: absolute;
  top: 18%;
  left: 50%;
  z-index: 5;
  transform: translateX(-50%);
  align-items: stretch;
  min-width: min(320px, calc(100% - 24px));
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
  grid-template-columns: 1.4em 1fr auto;
  align-items: baseline;
  gap: 4px 10px;
  padding: 6px 10px;
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
.mz-levels .mz-row b { font-variant-numeric: tabular-nums; }
.mz-levels .mz-row span:last-child { font-variant-numeric: tabular-nums; color: rgba(31, 26, 23, 0.7); }
.mz-levels .mz-row:disabled span:last-child { color: inherit; }
`;

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
  opts: { t: Strings; names: readonly string[]; current(): number; reached(): number; records(): Records; pick(level: number): void; onChange?(open: boolean): void }
): LevelPanel {
  if (!document.getElementById("maze-panel-css")) {
    const style = document.createElement("style");
    style.id = "maze-panel-css";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  const el = document.createElement("div");
  el.className = "card mz-levels";
  el.id = "mz-levels";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", opts.t.levelsTitle);
  el.hidden = true;
  parent.appendChild(el);
  // Clicks and drags on the panel are not steering.
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) el.addEventListener(type, (e) => e.stopPropagation());

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
    const reached = opts.reached();
    const records = opts.records();
    opts.names.forEach((name, i) => {
      const n = i + 1;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "mz-row" + (n === opts.current() ? " here" : "");
      row.disabled = n > reached;
      const best = records[n];
      const num = document.createElement("b");
      num.textContent = String(n);
      const label = document.createElement("span");
      label.textContent = name;
      const rec = document.createElement("span");
      rec.textContent = n > reached ? opts.t.notReached : best ? opts.t.record(formatTime(best.ms), best.deaths) : "–";
      row.append(num, label, rec);
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
