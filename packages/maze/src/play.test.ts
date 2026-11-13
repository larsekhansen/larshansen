import { describe, expect, test } from "bun:test";
import { STEPS_PER_SECOND } from "@larshansen/pixelkit/config";
import { playLevel, planRoute, usesPortal, type BotSpeed } from "./bot";
import { LEVELS, mapInfo } from "./levels";

// Every level played through by the scripted player, as a visitor could: at key speed (eight
// directions, 1.2 art pixels a step) and at pointer speed (toward a point, 1.6 a step). It may wait
// for a snake or a sliding wall, but it may never be cursed. Where a level has teleport stones it
// is played both ways: the long way round, and through the shortcut.

const seconds = (steps: number) => steps / STEPS_PER_SECOND;
/** Par from a scripted clear at key speed: times 1.6, rounded to 5 seconds. */
export const parFrom = (keySteps: number) => Math.round((seconds(keySteps) * 1.6) / 5) * 5;

const speeds: BotSpeed[] = ["keys", "pointer"];

describe.each(LEVELS.map((l, i) => [i + 1, l.name, l] as const))("level %d, %s", (n, _name, level) => {
  const hasPortals = mapInfo(level.map).portals.length > 0;

  test.each(speeds)("cleared the long way round at %s speed, never cursed, inside the time a first clear should take", (speed) => {
    expect(usesPortal(planRoute(n, false))).toBe(false);
    const run = playLevel(n, speed);
    expect(run.cleared).toBe(true);
    expect(run.deaths).toBe(0);
    expect(run.teleports).toBe(0);
    // A perfect run of at most 30 s leaves a first clear (curses, looking about) inside 30 to 90 seconds.
    expect(seconds(run.steps)).toBeLessThanOrEqual(30);
  });

  test.each(speeds)("through the teleport stones at %s speed, if there are any: cleared, never cursed, and quicker", (speed) => {
    if (!hasPortals) return;
    expect(usesPortal(planRoute(n, true))).toBe(true);
    const run = playLevel(n, speed, { portals: true });
    expect(run.cleared).toBe(true);
    expect(run.deaths).toBe(0);
    expect(run.teleports).toBe(1);
    expect(run.steps).toBeLessThan(playLevel(n, speed).steps - 3 * STEPS_PER_SECOND);
  });

  test("par is the quickest scripted clear at key speed, times 1.6, rounded to 5 seconds", () => {
    const fastest = Math.min(playLevel(n, "keys").steps, hasPortals ? playLevel(n, "keys", { portals: true }).steps : Infinity);
    expect(level.par).toBe(parFrom(fastest));
  });
});
