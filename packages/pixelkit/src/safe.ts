// A pretended notch and home bar (order 37): no browser on this Pi has either, so under `?debug&safe=` a page sets the four
// safe-area insets itself. Every stylesheet of the games reads a safe area as `var(--safe-top, env(safe-area-inset-top))`
// (and right, bottom, left), so with nothing pretended it is the device's own, and the pages' probes (the pad's, the maze's)
// read what is pretended as they read the device's.
//
// `safe=top,right,bottom,left` in CSS pixels, or a name: `left` or `right`, a notch on that side of a phone on its side with
// its home bar (as Android phones report a cutout); `sides`, an iPhone on its side (47 both sides, the home bar 21); `upright`,
// the notch at the top (47) and the home bar (34).

const PRESETS: Record<string, string> = { left: "0,0,21,47", right: "0,47,21,0", sides: "0,47,21,47", upright: "47,0,34,0" };

/** Sets the pretended insets on the page's root; true if `spec` named some. */
export function pretendSafe(spec: string | null): boolean {
  const v = (PRESETS[spec ?? ""] ?? spec ?? "").split(",").map(Number);
  if (v.length !== 4 || !v.every(Number.isFinite)) return false;
  ["top", "right", "bottom", "left"].forEach((side, i) => document.documentElement.style.setProperty(`--safe-${side}`, `${v[i]}px`));
  return true;
}
