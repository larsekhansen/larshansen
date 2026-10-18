import { STEP_MS } from "./config";

/**
 * Runs `step` a fixed 60 times per second of elapsed time, however often the screen draws.
 * A 120 Hz screen gets a step every other frame, a 60 Hz screen one per frame, and the game plays
 * the same on both. After a long pause (a background tab) it catches up at most `maxSteps` steps.
 */
export function createStepper(step: () => void, maxSteps = 5) {
  let carry = 0;
  return (elapsedMs: number): number => {
    carry += Math.min(100, Math.max(0, elapsedMs));
    let steps = 0;
    while (carry >= STEP_MS && steps < maxSteps) {
      step();
      carry -= STEP_MS;
      steps++;
    }
    if (steps === maxSteps) carry = 0;
    return steps;
  };
}
