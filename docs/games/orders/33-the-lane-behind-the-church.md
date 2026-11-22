# Order 33: the lane behind the church, and room to breathe

Written 22 November 2026, after order 32. Lars is away; his standing words are in
`docs/games/handbook/conversations.md`. Like orders 31 and 32, this order touches nothing that
waits on him: no story words, no change to the encore's fight, no forgiveness numbers, no
route, box, speed or timing.

Order 32 found that Vålerenga's lane behind the church has not been dark since order 15, by
accident (commit 39f30f5 gave `Art.night` to Nordmarka only). DESIGN describes the lane as
dark, with lanterns, the church's windows and eyes showing through. Order 32 put the Pi and the
cranes back but not the dark, because drawn as it was it costs about 1,580 rectangles a frame.
This order brings the dark back cheaply. It also wins back room in the first script, which
stands at 59.60 kB of 60.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0035, 0036, 0039 to 0054,
  `apps/viking/tools/review/o32/before.md` (its end: what bringing the dark back takes) and
  `after.md`, and how Nordmarka's dark is drawn and measured (orders 30 to 32).
- `git fetch origin`; `git checkout --no-track -b the-lane origin/main`. First commit: this
  order, as `docs/games/orders/33-the-lane-behind-the-church.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. The words in
  `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to change.
- Sloppy run files for Langkaia, Nordmarka, Bjørvika, Gamlebyen, Slottet, Vålerenga
  (`nabolaget`) and the encore on seeds 201 to 260 byte-identical with `origin/main`.
- Front page 28 of 28 byte-identical. First script under 60 kB, and see item 3.

## The work, in order

1. **Vålerenga's lane is dark again.** Draw the lane's dark, its lanterns' and the church
   windows' rings through it, and the eyes over it, as DESIGN says and as the code in
   `nabolaget.ts` meant, at a cost of no more than +200 rectangles a frame at 390 x 844 against
   `origin/main` at any place in the level (kept pieces, copied: ADR 0036, 0041, 0045; the
   dark's field can be kept per lantern arrangement and only its moving holes redrawn, or
   whatever you find is cheapest and pixel-true to the old drawing). Then check it as a place
   to play in, not only as a picture:
   - every enemy's red outline reads in the lane's dark at least as well as Nordmarka's does
     now (order 32's `overTheDark` and dark gap; add the lane to the palette test);
   - every platform's yellow top and every coin, door and the plough's tell can be seen: take
     every stretch of the lane at 390 x 844 and 1280 x 800 and look; if a ledge or a hazard
     cannot be seen where the old design had it lit, give it a lantern's light, do not lighten
     the dark;
   - ADR 0054's light table and test hold the lane's lights; reduced motion holds them still;
   - by a day sky (the T key) the level is as on `origin/main`.
   Show the commit before order 15 beside yours if you can build it, to say how close the
   restored lane is to what Lars once saw.
2. **The chairlift chairs' red** (order 32): the new slatted back is a large field 6.1 from the
   warning red. Keep the chair's shape; bring the back to a colour at least 20 from the warning
   red (weathered wood or the frame's painted steel are both true of old Oslo chairlifts) and
   leave the thin seat as it was before order 32. Add the chair to whatever test holds harmless
   things away from the warning red, or write one: no harmless prop may fill more than a few
   pixels within 10 of it. List what else that test finds (Bjørvika's crane lights at 10.3 are
   known and are lights); fix what is a field, name what is a dot.
3. **Room in the first script.** Find at least 1.5 kB gzipped to move from the first script
   into the lazy chunk (or to delete as dead), without changing a pixel or a run file: the
   front page gate, every level's day and night pictures at 390 x 844 from both builds, and the
   map must be byte-identical apart from items 1 and 2. ADR 0053 still holds: without the lazy
   file every level starts and every solid thing is drawn plainly. Report bytes before and
   after and what moved. If 1.5 kB cannot be found safely, report what you found and stop:
   do not risk ADR 0053 for bytes.
4. **Small things order 32 named.** LEVELS.html's words for Vålerenga made true again (they
   are, once item 1 is done: check them); the bite's hint and the pole's note photographed at
   360 wide in both languages (add a debug way to reach them if the harness cannot); and
   `main.ts`'s own drawing that the reduced-motion test cannot import (afterDark, the rune's
   flight, the banner fade) moved to where it can be tested, if that also serves item 3, and
   then covered. The rune still flying to the header under reduced motion is a question for
   Lars: leave it, list it.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources if a tool or debug flag was added); DESIGN where it describes the lane;
amend ADR 0054 for the lane's lights; an ADR only if a decision was made or reversed;
`apps/viking/tools/review/o33/after.md`, one section per item: done, partly, not, and why.
LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where they changed; say
which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside the app and from the repo root;
  `bun run build` clean; first script under 60 kB (item 3 aims for 58.1 or less).
- Front page 28 of 28; run files as said above; the map with any rune missing pixel-identical
  to `origin/main`.
- Perf at 390 x 844, both builds at the same places, day and night: no place more than +200
  rectangles a frame, none over 15,000. The viking suite no slower than 340 s.

## If you cannot do all of it

Do the items in the order given; finish each properly before the next. Docs for what was done
are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o33/shots/` (not `/tmp`): one folder per
   item; for item 1 every stretch of the lane before and after, side by side, at both sizes.
3. Tests, tsc, first-script size, front page, run files, perf, the contrast numbers.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
