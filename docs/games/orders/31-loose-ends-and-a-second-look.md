# Order 31: loose ends and a second look

Written 21 November 2026, after order 30. Lars is away; his standing words are in
`docs/games/handbook/conversations.md` ("im giving you permission to continuosly merge and
deploy all improvements. also keep looking for more assets that should have increased details.
and consider them with the rest of the game. interaction, fit, thematics, etc. ... remember to
write docs too btw."). The planner held after order 30 in case Lars was back; three days have
passed without a comment, and `roadmap.md` says questions for Lars do not block work. This order
therefore touches nothing that waits on him: no story words, no change to the encore's fight,
no forgiveness numbers, no difficulty.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0016, 0035, 0036, 0039 to
  0053, and `apps/viking/tools/review/o28/` to `o30/` (each `after.md`).
- `git fetch origin`; branch `loose-ends` from `origin/main`. First commit: this order, as
  `docs/games/orders/31-loose-ends-and-a-second-look.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. The words in
  `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to change.
- No route, box, speed or timing changes: sloppy run files for Langkaia, Nordmarka, Bjørvika,
  Gamlebyen and the encore on seeds 201 to 260 byte-identical with `origin/main`. Item 2 moves
  one pigeon: if that changes a run file, say exactly which and why, and keep every other one
  identical.
- Front page 28 of 28 byte-identical. First script under 60 kB (59.55 now: there is little
  room, so new drawing goes in the lazy chunk or replaces something).

## Part one: what order 30 found and left

1. **A card under the header in a narrow window with a mouse.** At 360 x 640 without touch the
   header's two rows of runes cover the top of a card. Give the header's height to CSS whether
   or not the touch pad is there, and keep every card under it. Photograph every card (opening,
   level end, both lines' endings, the encore's) at 360 x 640 and 390 x 844, with and without
   `&touch`, in both languages.
2. **Slottet's first pigeon walks into the parade's flags at the start.** Move or delay it so
   the first enemy he meets is seen clear of the flags. Drawing and placement only if possible.
3. **Nordmarka's invaders in the dark show as glow only.** Under the level's dark, make the red
   "this hurts" outline (ADR 0040, 0044) read at least as clearly as by day, without making the
   dark less dark. Measure outline against background as the palette test does, before and
   after; add the case to the test.
4. **The reduced-motion source audit knows two blink idioms.** Replace the idiom search with
   something that cannot be written around: for example, run every drawing path under reduced
   motion at several frame-clock values with a recording canvas and require identical output
   wherever the world state is identical. Cover every enemy kind, every prop, every boss, the
   map and the cards, not only the ones the second part covers today.

## Part two: Stortinget's escalator shafts

5. `roadmap.md` idea 5: 3,600 of Stortinget's 9,950 rectangles a frame are the shafts. Draw
   them once into a kept piece and copy it (ADR 0036, 0041, 0045), pixel-identical to now.
   Report rectangles a frame before and after at 390 x 844.

## Part three: Norwegian

6. `roadmap.md` idea 11 (ADR 0016). List every string a player can see that orders 21 to 30
   added (touch notes, help line, story, banners, cards, the encore, signs on the map) and show
   that each exists in both languages and fits its box at 360 wide in both (photograph with
   `--lang=nb-NO`). Fix a missing or overflowing line outside `story.ts`; for `story.ts`, report
   only. Add a test that every key present in one language is present in the other.

## Part four: a second look for flat things

7. Order 28 redrew the last flat things and listed what it left alone, with reasons (trains and
   trams, bells, logs, buckets, chairlift and hoist, windows, lanterns and torches, the Opera's
   door, line 2's low track on the map). Walk every level, the encore and the map once more at
   390 x 844 and 1280 x 800 by day and under its own sky, with fresh eyes, and write
   `apps/viking/tools/review/o31/before.md` with the same table order 28 used (thing, where,
   what he does with it, fits its level?, should the glamour touch it?, decision). Then redraw
   the three to six things that most let their surroundings down, by ADR 0051's rules: of their
   place, natural (no neon of `ROLES.glamour`), quieter than the figures, and never able to be
   mistaken for a coin, a rune, a door or a platform. If you find nothing that deserves it, say
   so and draw nothing: an honest "nothing left" is a good result.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, where "Paused?" becomes a
plain "No", "In flight", "Next" and the idea list with 5 and 11 struck or updated; lessons;
resources if a tool or debug flag was added); DESIGN where a rule changed; an ADR only if a
decision was made or reversed; `apps/viking/tools/review/o31/after.md` with one section per
item: done, partly, not, and why. LEVELS.html's pictures retaken with
`apps/viking/tools/pictures.ts` if any changed, and say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside the app and from the repo root;
  `bun run build` clean; first script under 60 kB.
- Front page 28 of 28; run files as said above; the map with any rune missing pixel-identical
  to `origin/main`.
- Perf at 390 x 844 against `o30/perf.md`: no place more than +100 rectangles a frame, none
  over 15,000; Stortinget lower.

## If you cannot do all of it

Do the items in the order given; finish each properly before the next. Docs for what was done
are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o31/shots/` (not `/tmp`): one folder per
   item, before and after where something changed.
3. Tests, tsc, first-script size, front page, run files, perf.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
