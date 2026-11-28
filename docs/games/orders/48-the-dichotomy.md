# Order 48: the dichotomy, seen

Written 28 November 2026, after order 47. Lars has still not played, so no difficulty is
retuned: no route, box, speed, timing, hearts, enemy placement. On 28 November he said
(verbatim in `conversations.md`): "Maybe that's a good general theme anyway, making Oslo
quaint, Nordic-national-romantic, less technological, less crowded, calm? ... the bad guys
are glam, neon, lights, American, loud. ... So the bigger face panels when talking. And
more detail on the character anyway. And the dichotomy." Order 47 wrote the theme down
(ADR 0058, DESIGN's "Calm Oslo, loud glamour") and gave Loki and the hero their talking
faces. This order makes the dichotomy visible in the levels, and finishes what order 47
left. All of it is drawing and words' placing; no word of the story changes.

The plans in `docs/games/handbook/plans-28-nov.md` (the city as real Oslo, the front page
as a home, the runes) are NOT decided and NOT this order. Do not move a landmark, rename a
station, change a route or touch the runes. Keep what you draw reusable if levels are later
rebuilt: figures, props and materials rather than whole backdrops.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources, plans-28-nov), `apps/viking/docs/DESIGN.md`
  and `GRAIN.md`, ADRs 0003, 0014, 0016, 0035, 0036, 0039 to 0058 (0044, 0050, 0052, 0057,
  0058), orders 34, 38 to 40 and 47, `apps/viking/tools/review/o34/thematic.md` and
  `o47/after.md`.
- `git fetch origin`; `git checkout --no-track -b the-dichotomy origin/main`. First commit:
  this order, as `docs/games/orders/48-the-dichotomy.md`. Commit as you go. Do not push,
  do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine (do not run `bunx` for a tool that is not already installed;
  use the tsc the repo's scripts use). Stop preview servers by port (`fuser -k <port>/tcp`)
  and kill your own headless browsers by PID only (never pkill by pattern); remove the
  `/tmp/tmp-*.xpi` files your browsers leave; leave the `/tmp/shots-*` folders alone.
  Pictures go under `~/.cache/claude-scratch-larshansen/o48/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`, `apps/landing`, `infra/` or `.github/`. ADR 0014,
  0003 and 0055 stand. Write only plain text into docs (no control characters).
- The story's limits (ADRs 0050 and 0052) stand exactly: the man who paid is named, never
  drawn, never quoted, not a character. The opening card stays as live. No word in
  `game/story.ts` changes. No real band, song, person, logo or likeness; nothing cruel,
  sexual or violent.
- Sloppy run files on seeds 201 to 260 for all 16 levels and the encore byte-identical with
  `origin/main`; the maze's runs and ghost replay identical. Front page 28 of 28. First
  script under 60 kB (55,980 bytes now) and no larger than now by more than 300 bytes.
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## 1. What order 47 left

- **Slottet's balloon cart** reads as a muddle of red at phone size, and worse where the
  parade's flags pass in front of it (columns 112 and 172). Redraw it in the same box and
  frames so that it can be named at a glance (fewer, larger balloons on strings above a
  plain cart; a clear outline; its tell by ADR 0044), or choose another thing of 17 May
  that reads better in a pigeon's box (an ice cream cart, a pram with a flag); and see
  that the flags do not cross it where it stands (drawing order or the flags' places, not
  the cart's place). Show old and new side by side at 390 x 844.
- **The maze's raven** speaks in its own voice. Give it a portrait (two or three
  expressions: dry, sharp, pleased; a Nordic bird, calm, not glam) and the talk panel of
  ADR 0057 in the maze, by the maze's own rules for where words stand, loaded lazily; the
  maze's runs and ghosts identical. If the maze's package cannot take the panel without
  touching what the front page shares, say so and leave it.
- **The panel on a short phone on its side with the dash shown**: take that picture
  (667 x 375, touch, dash) and mend what it shows, or say that it holds.

## 2. The dichotomy, level by level

- **Look first.** For every level by day and under its own sky, glammed and natural, write
  a table in `apps/viking/tools/review/o48/before.md`: what in the natural (unglammed) Oslo
  reads loud, technological, crowded or neon although it is not Loki's doing; what of
  Loki's glamour reads too tame to tell from the place; a mark from 1 to 3; a ranking.
  The measure is his sentence: calm, quaint, Nordic-national-romantic, less technological,
  less crowded, against glam, neon, lights, loud.
- **Then mend from the top of the ranking**, by drawing, for as many levels as you can do
  well (expect five to seven):
  - the natural side quieter and older: wood, stone, wool, snow, water; warm lamp light
    rather than screens and signs; fewer and calmer bystanders where a crowd is not the
    level's idea (Slottet's 17 May crowd is its idea and stays); details of the national
    romantic kind where the place would truly have them (carved barge boards and dragon
    heads on timber, turf roofs in the forest, a rose-painted door, knitted patterns,
    a kicksled, skis against a wall). Sparingly: one or two a screen, each of its place.
  - the glamour louder where it is tame: more neon, chrome, sequins and stage light in
    what Loki has laid over a thing, so that glammed and natural differ at a glance; the
    breaking of a glamour should feel like quiet returning. ADR 0044's warning red and
    every role colour stay untouched and tested.
  - a place that is honestly modern (Bjørvika's building site, Stortinget's station) stays
    modern: quieten it (less signage, muted colour), do not pretend it is old.
- Nothing he must see is hidden or weakened: every tell, ledge, pit and pickup reads as
  well as before (the tests of orders 37 to 43 hold; say the numbers where one is close).
- Cost: no place more than +60 rectangles a frame at 390 x 844, kept and copied where it
  holds still (ADR 0036). Nothing new moves with reduced motion.
- Each level changed shown before and after at 390 x 844 and 844 x 390, by day and under
  its sky, glammed and natural.

## 3. More detail on the characters

Order 47 carried two marks from Loki's portrait to his figure. Do the same the other way
round for the hero and for the three bosses where their figures read as "just colourful":
look at each at four times size beside what the theme says it is (the hero: the calm
Nordic one, wool and iron; the troll: stone and moss, older than the town; the plough:
the municipality's own, glammed by Loki; the serpent: the fjord's) and add the one or two
marks each lacks, keeping every box, frame count and timing. Show each before and after
on the figures tool's sheets.

## 4. Keep it honest

- `o48/after.md`: the table again with new marks; every 3 that remains named with why.
- A test where one can be held cheaply and shared with a walk already made (for instance:
  glammed and natural pictures of each changed level differ by at least a stated share of
  pixels where a glamour stands). The viking suite's time no worse by more than 10 s.
- LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where they changed
  and its words kept true; the figures tool rerun into
  `~/.cache/claude-scratch-larshansen/o48/figures/`; say which sheets changed.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources; `conversations.md`: what the planner decided here on Lars's behalf from
his sentence, and how to undo it); DESIGN where a rule changed; ADR 0058 amended with what
was done (and 0057 for the raven); `apps/viking/tools/review/o48/` (`before.md`,
`after.md`); `thematic.md` marked where it applies.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes; the suite's time against `origin/main`
  the same hour.
- Front page 28 of 28; run files and the maze's runs as said above; pictures of every
  level you did not change byte-identical with `origin/main`, each kind of difference
  elsewhere named.

## If you cannot do all of it

Order: item 1 (the cart, the dash picture, then the raven); item 2's table for every
level; item 2's mending from the top, each level finished properly before the next; item
3; item 4. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. Your ranking and which levels you changed.
2. Pictures in `~/.cache/claude-scratch-larshansen/o48/shots/`: the cart old and new; the
   raven's portraits at four times size and the panel in the maze; per level changed,
   before and after as said; each character before and after.
3. Tests, tsc, sizes (each file that grew), front page, run files, the maze's runs, cost a
   frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
