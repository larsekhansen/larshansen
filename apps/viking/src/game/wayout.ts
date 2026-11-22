// The maze's way out inside this page (order 37). Gone into the mound through a door, the address changed to `#jernhaugen`
// and the browser made an entry in the page's history for it, so the way out is Back, and Back and Forward keep working as a
// player expects. But a navigation made while the page is still loading replaces the page's entry instead of adding one (the
// HTML standard's rule; order 36 found it), and then Back has nowhere of this page's to go: it does nothing, or leaves the
// site. So the way in notes whether it made an entry, and the way out falls back to where he came from (the line map, or
// the level whose door he took) when it did not, or when Back does not answer.

/** How long the way out waits for Back to answer before it goes to the line map itself. */
export const BACK_WAIT_MS = 1000;

/** Whether going in now makes an entry in the page's history: not while the page is still loading. */
export const makesEntry = (readyState: DocumentReadyState) => readyState === "complete";

export interface WayOut {
  /** The way in made an entry in the history (see `makesEntry`). */
  canGoBack: boolean;
  /** Still in the mound (Back has not answered yet). */
  inMaze(): boolean;
  /** The browser's Back. */
  back(): void;
  /** Out to where he came from without the history: the line map, or the level whose door he took. */
  out(): void;
  wait(ms: number, then: () => void): void;
}

/** Leaves the mound: Back where the way in made an entry, and the line map if it did not, or if Back does not answer. */
export function wayOut(page: WayOut) {
  if (!page.canGoBack) return page.out();
  page.back();
  page.wait(BACK_WAIT_MS, () => {
    if (page.inMaze()) page.out();
  });
}
