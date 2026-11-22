import { view } from "@larshansen/pixelkit/paint";

/**
 * The place's name on its plate (`plated` in `main.ts`): how much of it shows `age` steps after he arrived. In full from the
 * first frame, fading out from about two and a half seconds over half a second; with reduced motion it simply goes at two
 * and a half seconds. Here since order 33, where the reduced-motion test can ask it.
 */
export const bannerAlpha = (age: number) => (view.reduced ? (age < 150 ? 1 : 0) : Math.max(0, Math.min(1, (165 - age) / 30)));
