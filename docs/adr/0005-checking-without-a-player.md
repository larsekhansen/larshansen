# 0005. Checking without a player

Decided 2026-11-10 (the harness) and 2026-11-13 (scripted players, reach search) by the planner.

## Context
The work is done on a Raspberry Pi where Chromium cannot render headless and headless Firefox
fires no animation frames. Lars chose a process in which he sees only the deployed result (0013).

## Decision
Four substitutes for a playtest:
1. **The harness** (`packages/pixelkit/src/harness.ts`): `?debug&steps=N&keys=…` runs N physics
   steps synchronously with a frozen clock and draws one frame; `tools/shots.ts` photographs it.
2. **Scripted players**: a route per level, played through the real rules, asserted to clear
   with the single jump, every flag raised, no heart lost, in at least a minute.
3. **A reach search** over the real `stepBody`, proving each bracteate is out of reach without
   the feather.
4. **The front page gate**: 28 reference screenshots that must stay byte-identical after any kit
   change.

## Consequences
- Regressions in rules and layout are caught. Feel is not: nothing says whether a window is
  humane or a fight is fun.
- A scripted clear time is a floor a designer can game with waits. Orders now forbid that.
- The reach search is approximate (see the handover). Treat "proven" as "very likely".
- The reference screenshots live in `/tmp` and must be re-made after a reboot.

## Not chosen
- Building on another machine with a real browser. Lars's setup is the Pi.
- Recording a person's inputs as the test. Nobody had played.
