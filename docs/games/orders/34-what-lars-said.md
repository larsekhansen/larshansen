# Order 34: what Lars said

Written 22 November 2026, after order 33. Lars answered the questions waiting for him on 22
November, through a review page and another session that relayed his text. This order builds
the answers that are plain and safe to build. Three things wait for a word from him directly
and are NOT part of this order (do not build them): a new line for the opening card, anything
closer to one real band's look than "the general style", and deleting an old local branch.

## His answers (record them in `docs/games/handbook/conversations.md`, his words in quotes)

Add a dated section "Lars's answers, 22 November 2026 (relayed by his other session)" and
close or update the matching entries in "Questions waiting for Lars":

- Edge forgiveness: "planner's call". Stays as it is until he has played.
- Again: "no Again; To the map only (as built)".
- The tenth station: "rename it Gamle Oslo". "I don't want references to home. It's more of an
  ode to Oslo. Oslo is my home. Not just gamle Oslo."
- `post/`: "leave post/ out of the repository".
- `landing-game-polish`: "delete". Waits for his word in the planner's session; still open.
- Line 2: "keep line 2 harder". "Keep the difficulty thematic. Is it a touch part of town? Hard.
  Big event? Can also be hard. Less so, lean easy. Also keep enemies thematic." (The relaying
  session reads "touch" as "tough".)
- The opening card: "as live". "I do like the live one. Missing some kind of reason why loki put
  a glamour on them, and the wordplay." He suggested a line; who speaks it is unclear, so it
  waits for him. Still open.
- The encore: keep it; difficulty "leave it as it is"; "Middelalderparken is right". "But the
  music has to be something like glam rock. And Lokis outfit should be Poison's most extreme
  neon glam era. And some fitting, thematic, glammy song or just glsmmy text. But ideally there
  should be music".
- The lane: "restore the dark" (done, order 33). The Pi and the cranes: "keep them".
- Harmless things in red: chairs "painted steel" (done, order 33); "Scenery in the kit's red:
  move it off the red too".
- The rune's flight: "let it fly (as live)".
- The next rounds: "carry on as planned".
- Not answered: his play notes (he has not played yet).

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0035, 0036,
  0039 to 0054, orders 29 and 33 and `apps/viking/tools/review/o29/`, `o33/` (each `after.md`).
- `git fetch origin`; `git checkout --no-track -b what-lars-said origin/main`. First commit:
  this order, as `docs/games/orders/34-what-lars-said.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
- Do not add, commit or touch `post/`. Do not delete any branch. ADR 0014 and ADR 0003 stand.
- No route, box, speed or timing changes: sloppy run files for Langkaia, Nordmarka, Bjørvika,
  Gamlebyen, Slottet, the tenth level (`nabolaget`) and the encore on seeds 201 to 260
  byte-identical with `origin/main`. The encore's fight does not change at all.
- Front page 28 of 28 byte-identical. First script under 60 kB (57.94 now; the music goes in
  the encore's own lazy chunk).

## 1. The tenth station is Gamle Oslo, and nothing says "home"

- The level's name becomes "Gamle Oslo" in both languages, everywhere a player sees it (the
  banner, the map's station sign, cards, the header, LEVELS.html, the docs). Its id
  (`nabolaget`) and saved progress keys do not change.
- Its subtitle, its place line and its lines lose "home", "hjem", "homeward" and the claim that
  a house is his: today "Homeward through Gamle Oslo", "From Vålerenga home to Kværnertoppen",
  "the last thing between you and the door home", "The way home is clear", and i18n's "Welcome
  home". Write them as an ode to Oslo instead: the evening walk through the old east side,
  from Vålerenga's wooden houses over the hill; warm, dry, short. The level's own lines are in
  the level file and `i18n.ts`, not `story.ts`; give two alternatives beside each new line in
  `conversations.md` for him to choose from.
- The Pi, the cranes, the yellow house and the place names on plates stay as drawn, without
  any new words about them. The door at the end, and the line map's last door, are labelled
  "Hjem"/"Home" because they lead to the site's home page: keep the label, but check that no
  line around it reads as "his home"; DESIGN and code comments that call the house his home
  are reworded to "the yellow house" (the repository is public).
- Vålerenga stays a place in the level (the church, the sign): it is a neighbourhood inside
  the borough Gamle Oslo, so both are true.
- `story.ts`: the lines above the encore block do not change (their hash test holds). "Oslo
  walks home" in the encore's ending is the crowd's home and stays.

## 2. Scenery off the warning red

Order 33's test (`render/warning.test.ts`) holds what he stands on, uses and passes; it left
scenery and ground. Extend it to backdrops, ground and tiles in the Viking game, with a
sensible limit per view, and move what it finds: Stortinget's walls and kiosk (2,344 px a
view), Holmenkollen's rails and jump, Bygdøy's ticket kiosk, Vålerenga's stained glass,
Frognerseteren's walls, and the rest. Each becomes a shade of its own, true to the real thing
(Stortinget station's tile is a brick red-orange; Frognerseteren is dark brown timber; ski
padding can be blue or orange), at least 10 from the warning red and from every role colour.

- His own hat keeps the kit's red: he is the hero, not scenery. Things that hurt keep theirs.
- The kit's palette constants do not change (the front page is frozen): give the Viking game
  its own swatches.
- Show every changed thing before and after at four times size, by day and under its level's
  sky, and check each still reads as its place.

## 3. The encore gets music, more glam and glammy words

His words are above. What they mean here, and the limits (ADR 0050, 0052; not yours to loosen):

- **Music.** An original glam-rock tune for the encore, made with the game's own synth
  (extend it in the encore's chunk if it needs a sequencer): a stomping four-on-the-floor
  drum, a shouted-chorus kind of riff in power chords, a short solo lick, in a loop of 16 to
  32 bars that changes with the fight: an intro as he wakes, the full band during the fight,
  one layer dropping out with each piece of glamour knocked off, and after the third hit a few
  plain acoustic-sounding notes as the stage lights go plain. It must be your own melody and
  chord sequence: no real song, riff, lyric or nameable melody, nothing that a listener could
  name. Write the notes down in the code as data and describe the tune in the ADR.
  - It follows the sound switch (muted stays silent), starts only after a key or touch as all
    sound does, stops when he leaves, on the card and when the page is hidden, and costs
    nothing when muted.
  - A test: the sequence is deterministic, every note is inside a sane range and volume, the
    loop's length is whole bars, layers drop per hit, nothing plays while muted.
  - Nobody can hear it on this machine: say so, and give Lars the exact URL to hear it
    (`?debug…` with the encore open) and a way to audition each layer.
- **Loki's outfit.** Push him to the far end of late-1980s glam metal in general: hair teased
  as high as the sprite allows, eye make-up, a headband or scarves at the wrists, animal print,
  neon spandex in the glamour's pink, green and yellow, studded belt, a pointed guitar slung on
  his back if it reads. He stays nobody real: do not copy any real band's or performer's actual
  costume, face, logo, album art or pose. Each hit still knocks off a piece (keep three stages
  and the plain man in the grey sweater); the hit boxes, tells and timings do not change. Show
  his sheet before and after, every frame, at four times size and at phone size.
- **Glammy words.** The encore's lines are in `story.ts`'s encore block. Add, do not replace:
  two to four short shouted "lyric" lines of your own that appear during the fight as banner
  text or bubbles in time with the music (the kind of thing a glam front man shouts: about
  hair, lights, the night, Oslo's weather spoiling it), in English and Norwegian, with an
  alternative beside each in `ENCORE_ALTERNATIVES`. Original words only; dry and warm as the
  rest; they must fit a bubble at 360 wide and never cover a tell. The existing lines stay.
- Reduced motion: text appears without bouncing; nothing flashes with the beat.

## 4. The design rule he gave

Write into DESIGN (and an ADR, 0055, with item 1's naming decision and item 3's music): the
difficulty and the enemies of a level follow its place. A tough part of town or a big event may
be hard; elsewhere lean easy; enemies belong to where they are met. Then, in
`apps/viking/tools/review/o34/thematic.md`, a table of every level: the place, what it is in
Oslo (tough, big event, calm), how hard the reviews say it is now, its enemies and whether each
belongs there, and a proposal where they disagree. Propose only: no level is retuned and no
enemy is moved in this order, because he has not played yet.

## Docs, in the same change

`conversations.md` as said at the top (answers, what is still open, the new lines'
alternatives); HANDOVER; the handbook (start-here's table; roadmap's status table, "In
flight", "Next"; lessons; resources for the audition URL); DESIGN; ADR 0055; amend ADR 0052
(music, outfit, the limits restated) and ADR 0044 or 0054 where the red rule reaches scenery;
`apps/viking/tools/review/o34/after.md`, one section per item. LEVELS.html: the level's name
and words, and pictures retaken with `apps/viking/tools/pictures.ts` where they changed; say
which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside the app and from the repo root;
  `bun run build` clean; first script under 60 kB.
- Front page 28 of 28; run files as said above; the map with any rune missing pixel-identical
  to `origin/main` apart from the renamed sign.
- Perf at 390 x 844, both builds at the same places: no place more than +150 rectangles a
  frame, none over 15,000. The viking suite's time: say what it is; if over 360 s, say what
  could be trimmed.

## If you cannot do all of it

Order: the answers recorded in `conversations.md`; item 1; item 2; item 3 (music, then outfit,
then words); item 4. Finish each properly before the next. Docs for what was done are never
skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o34/shots/` (not `/tmp`): one folder per
   item, before and after.
3. Every new or changed line, both languages, with its alternatives. The tune written out
   (notes per bar, per layer) and how to hear it.
4. Tests, tsc, first-script size, front page, run files, perf.
5. What only a person can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
