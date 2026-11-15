# Order 19: felt at a glance

Written 15 November 2026, after order 18 (colour says what a thing is). Lars's words on order 18's
direction: "do more design polishing like that". Order 18 made things readable while they stand
still. This order makes **what just happened** readable: every event answers at once, at the
place it happened, in the colour of its role (ADR 0039), with a sound, and with a still
equivalent under reduced motion.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0023,
  0035 to 0039, and order 18 with its hand-back numbers in `apps/viking/tools/review/o18/`.
- `git fetch origin`; branch `felt-at-a-glance` from `origin/main`. First commit: this order (it
  is untracked). Commit as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`. Anything added to
  the shared kit is opt-in, as `LedgeLook.topH` was.
- First script: 59.72 kB now, the build fails over 60. Effects code must come lazily or something
  must move out to pay for it. Say what you chose.

## 1. Look first

Before changing anything, make a table (`apps/viking/tools/review/o19/before.md`) of every event
below: what the player sees and hears in the half second after it, as frame strips (every third
step for 30 steps, cropped round him), by day and at night, at 1280 and 390. A tool for frame
strips goes in `apps/viking/tools/glance/`.

Events: he is hit; he stomps an enemy; a stomp that does not kill (bosses, armoured things); he
takes a skilling, the cheese, a bracteate, the feather, the pole, the shield; the shield turns a
thrown thing; a flag goes up; he sits on a bench; he takes a rune; he lands from a fall of more
than three tiles; he falls in water or a pit; he loses a life; Game over; a ledge on a beat is
about to go and goes; a pad or bundle starts to sink; a carrier arrives and leaves; a statue
wakes and freezes; a thrower throws; a swan turns on him; a door opens; a boss is hit, each
boss's tell begins, a boss is beaten; a station opens on the map; line 2 opens.

## 2. The rules, then fix what breaks them

1. **An answer within two frames, where it happened.** Nothing that changes the game's state is
   silent or invisible. The answer is in its role's colour: a hit in the hurt red, a pickup in
   copper and gold, a boss in the "now" violet, a thing done with the tick.
2. **A hit is unmistakable.** He flashes, there is a hit-stop of a few frames (drawing only: the
   rules still step exactly as before, so every scripted clear and review number is unchanged;
   prove it with a test), the lost heart in the header breaks and the rest pulse once. While he
   cannot be hurt he blinks in a way that reads on every backdrop, night included. At one heart
   left the header's hearts keep a slow pulse.
3. **A stomp pays.** The enemy squashes, a puff in the enemy's own colours, his bounce is seen.
   A stomp that does not kill says so: a hard spark and a different sound, not a squash.
4. **What he takes goes somewhere.** A skilling pops and the header's count ticks; the cheese
   fills hearts one by one; a bracteate, the feather, the pole and the shield each get a short
   moment (a rise, a glint, one line of words where there is one already), not a silent vanish.
5. **What is about to happen is seen before it happens.** Everything that gives way trembles
   first; every thrower winds up for at least 0.4 s in a pose that differs in outline from its
   rest; a swan's and a statue's change of mind is a change of outline, not only of position.
   Do not change any timing: add the picture to the timing that is there. Where there is no
   lead time to draw in, say so in the hand-back and leave it.
6. **A fall ends somewhere.** A splash for water, dust for a pit's edge, in the scenery's
   colours; the life leaving the header is seen.
7. **Things done stay done in the picture.** A raised flag's tick pops in; a bench he has sat on
   is marked; a cleared station's stone arrives with a small flourish the first time only.
8. **Reduced motion.** No shake, no hit-stop, no flashing over three times a second; every event
   still has a still answer (a ring, a tick, a held pose).
9. **Cheap.** At most 40 particles alive, all plain rectangles; `?debug&perf` at 390 x 844 on
   Akershus, Stortinget and Bygdøy no more than 300 rectangles a frame over order 18's numbers
   with effects in the air. Nothing allocates each frame.
10. **Sound.** Every event in the table has a sound from the kit's synth, distinct from its
    neighbours (a hit, a stomp, a block and a dud stomp must not be confused with eyes shut).
    The front page's sounds do not change.

Effects are pictures only. No hit box, no speed, no timing, no route changes. The scripted
clears, the reach and dead-end searches and the sloppy player's table must come out exactly as
they are now: rerun four levels (one of each line, Nordmarka and Gamlebyen) on seeds 201 to 260
and show identical numbers.

## 3. Left from order 18

1. His blue under the evening tint: water comes within 5 to 7 of his tunic. Give him what the
   enemies have at night (a rim) under the evening tint too, or move the tinted water; meet the
   distance of 10 or name the shape that tells him apart, and test it.
2. Doors, benches, signs and rune stones as one family "things to use": one shared mark (the
   arrow bubble's colour and a frame), standing off every field by the same test as the others.
3. The header between 760 and 999 px wide with sixteen runes: look at it at 760, 820, 900 and
   999, fix what is cut or wraps badly.
4. Order 18's contact sheets had crops that fell outside the view (Akershus's crow at 1280 by
   day, several one-way ledges and carriers): fix the tool so every row shows its subject.

## 4. Docs

DESIGN (the feedback rules, as a list a level author can follow), HANDOVER, one ADR for the
rules and the drawing-only hit-stop, LEVELS.html if a picture in it has changed.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean; first script under 60 kB.
- Front page 28 of 28 byte-identical.
- The sloppy player's numbers identical on the four levels named.
- Perf as in rule 9.

## Hand back

1. The before and after tables, per event: what is seen, what is heard, reduced motion.
2. Frame strips in `/tmp/shots-felt/`, before and after, named for the event.
3. What had no room for a tell (rule 5) and was left.
4. The identical-numbers proof, perf numbers, first-script size, tests, front page comparison.
5. Departures, doubts, found and not fixed. Branch and commits.
