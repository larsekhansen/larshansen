// The site's sound switch, shared by all the games: the visitor's choice is remembered in the browser, so it holds on every page.
// Kept apart from the synth (`sfx.ts`) so a page can show and turn the switch before its synth has come (the viking game's first
// script carries this, and fetches the synth with its other drawing: order 33).

const MUTE_KEY = "larshansen.muted";
const OLD_MUTE_KEY = "viking.muted"; // the viking game's own, read once as a fallback

/** The visitor's choice if they have ever made one, otherwise the page's own default. */
export function readMuted(whenUnset: boolean): boolean {
  try {
    const own = localStorage.getItem(MUTE_KEY);
    if (own !== null) return own === "1";
    const old = localStorage.getItem(OLD_MUTE_KEY);
    return old === null ? whenUnset : old === "1";
  } catch {
    return whenUnset;
  }
}

/** Remembers the choice. */
export function saveMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // storage refused: the mute lasts for this visit
  }
}
