# Order 47: what Lars said on 28 November

Written 28 November 2026, after order 46. Lars answered part of what was waiting (through
another session, typed by him on the review page; verbatim in
`/tmp/claude-1000/-home-lars-projects-larshansen/f3819549-c84a-449d-953e-29b64ae667a5/scratchpad/lars-answers-28-nov.md`,
which you record in `conversations.md` word for word, with the planner's reading under it).
He has still not played, so no difficulty is retuned; he said of every level whose
difficulty was in question "leave it as it is". This order builds what he decided. Plans he
asked for (the city as real Oslo, the front page as a home, the runes) are NOT this order:
the planner writes those. Do not start on them.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0016 (both languages), 0035, 0036, 0039 to 0056 (0040 tells, 0044 the
  warning red, 0046, 0050 the glamour, 0051, 0052 the encore and Loki, 0055), orders 29, 34,
  35 (the mountain hare it built, and the commit that took it out again), 38 to 40 (how a
  figure is redrawn and judged), and `apps/viking/tools/review/o34/thematic.md`.
- `git fetch origin`; `git checkout --no-track -b lars-28-nov origin/main`. First commit:
  this order, as `docs/games/orders/47-what-lars-said-second.md`. Commit as you go. Do not
  push, do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID only (never pkill by pattern); remove the
  `/tmp/tmp-*.xpi` files your browsers leave; leave the `/tmp/shots-*` folders alone.
  Pictures go under `~/.cache/claude-scratch-larshansen/o47/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`, `apps/landing`, `infra/` or `.github/`. ADR 0014,
  0003 and 0055 stand. Write only plain text into docs (no control characters).
- The story's limits (ADRs 0050 and 0052) stand exactly as they are: the man who paid is
  named, never drawn, never quoted, not a character. Lars has asked for a quote on the
  opening card; that waits for his word in the planner's session and is NOT built here.
  The opening card stays as live. In `game/story.ts` you change only what this order names.
- No real band, song, person, logo or likeness. The faces you draw are the game's own
  characters. Expressions may be as large as the theatre allows; nothing cruel, sexual or
  violent.
- Sloppy run files on seeds 201 to 260 for all 16 levels and the encore byte-identical
  with `origin/main` (every swap of a figure keeps its box, frames' count, timing, speed
  and behaviour); the maze's runs and ghost replay identical. Front page 28 of 28. First
  script under 60 kB (55,878 bytes now) and no larger than now by more than 400 bytes: the
  faces live in a lazy file.

## 1. The words he gave

- When the plough is beaten, in place of what stands: "The plough parks. Gamle Oslo is
  clear." / "Brøytebilen parkerer. Gamle Oslo er fri." Both languages, seen at 360 wide.
- Every other line of Gamle Oslo, and the doors' label Hjem / Home: as live. Record that
  the label was asked about and kept.
- He chose "change it" for Gamle Oslo's first sign without saying to what. Do not change
  it; write three proposals in the game's voice, both languages, into
  `apps/viking/tools/review/o47/after.md` for him to pick from.

## 2. What belongs to the place

All by drawing: each swap keeps the old figure's box, frame count, timing, speed and
behaviour, so the rules and run files do not change. Each new figure by the methods of
orders 38 to 40 (GRAIN.md's ramps, light from the top left, its tell where it has one in
the warning red by ADR 0044, glammed and natural by ADR 0050), shown at four times size
and in place at 390 x 844 by day and under its level's sky, and added to the figures tool's
sheets with a name in both languages.

- **Holmenkollen**: the hedgehog becomes a mountain hare in its white winter coat ("swap
  it for a mountain hare"). Order 35 drew one; start from it if it holds up, and make sure
  white on snow still reads (its outline, its black ear tips, its shadow).
- **Enemies of the place's own** ("yes, draw them"), from `thematic.md`'s proposals:
  - Slottet, 17 May: two or three of the seven pigeons become the day's own: a russ in red
    overalls with a whistle, a child's balloon cart or what else of 17 May fits a pigeon's
    box and way of moving (a pigeon walks and flies: pick what can honestly do what that
    pigeon does, or pick the pigeons that only walk).
  - Bjørvika, the building site: one or two of the six pigeons become the site's own (a
    surveyor with a theodolite, a small forklift), by the same rule.
  - Stortinget: the e-scooter becomes a commuter's bicycle.
  - Anything else `thematic.md` marks as not belonging. Difficulty everywhere stays as it
    is: he said so level by level.
- **The two spires**: Sagene church's copper (the green of old copper, hazed as a far
  thing, off every role colour), Paulus church's slate grey.

## 3. Faces when they talk

Lars: "Now it reads more as just... Colorful I guess. Maybe when he talks you can make a
more detailed version of his face, like they do in many pixel games. Maybe with over the
top emoting like JoJo's Adventures or Ace Attorney. It fits the theme." and "So the bigger
face panels when talking. And more detail on the character anyway."

- Find every place where someone speaks (Loki at the encore and wherever else he speaks;
  the hero if he ever speaks; the bosses' bubbles; the signs are not people). Write the
  list in `o47/after.md`.
- Build a talk panel: when a character speaks, a large detailed portrait of that character
  (about 48 to 64 art pixels square, far more detail than the figure in the level) stands
  beside the words, with an expression that fits the line. Over-the-top emoting in the
  manner of the genre he names, but in this game's own drawing and grain, not in the
  style or likeness of any existing game's characters: big readable shapes (brows, mouth,
  eyes), a pose of the head, a few speed or shock lines, a flash behind for a shout.
  - Loki first, in full: at least six expressions (smug, delighted, outraged, wounded,
    scheming, a shout), each glam to the last pixel (ADR 0050 and 0052: generic neon
    glam, the big hair, the make-up, no real band's look). This is where "more detail on
    the character" shows first.
  - The hero second: four expressions (calm, surprised, set, pleased), quiet where Loki
    is loud: he is the calm Nordic one against the loud glam one. That contrast is the
    point; make it visible side by side.
  - Then each boss that speaks, one or two expressions each, if room and time allow;
    else say which are left.
- Which expression goes with which line: a tag per line beside the words in
  `game/story.ts` (or where that speaker's words live), changing no word.
- Where it stands: clear of the play he must see while the line shows, clear of the pad
  and of a notch on both orientations at 390 x 844, 844 x 390, 360 x 640 and 667 x 375;
  it never pauses the play where the words do not pause it now; with reduced motion it
  appears and goes without sliding or flashing. Both languages fit.
- Cost: the portraits in a lazy file loaded before the first line that needs them (no
  pop-in: show the first frame a line is up); no more than +80 rectangles a frame while a
  panel is up (kept and copied, ADR 0036).
- **More detail on Loki in the level** too: look at his figure at the encore beside his
  new portrait and carry over what can be carried at his size (the hair's shape, the
  colours' order, one or two marks that make him him), keeping his box and frames.
- A decision record for the talk panel (a new ADR: what it is, when it shows, the limits
  on likeness, how to turn it off), and tests: every tagged expression exists for its
  speaker in both languages' lines; the panel overlaps no pad control at the four sizes;
  nothing moves with reduced motion.

## 4. Write the theme down

Lars: "making Oslo quaint, Nordic-national-romantic, less technological, less crowded,
calm? ... the bad guys are glam, neon, lights, American, loud. ... He is the god of
mischief. And why would he really like the nordics anyway, they fucked him over. Yeah. It
kinda does make sense. ... And the dichotomy."

Add a short section to `apps/viking/docs/DESIGN.md` (and a new ADR, since it is a decision
about the game's theme) saying this in plain words, with his words quoted: the calm,
quaint, Nordic-romantic Oslo and its people against the loud neon glam Loki lays over it;
Loki's reason (mischief, and a grudge against the gods who wronged him), which may be said
in the game only in lines the planner or Lars writes later. No word in the game changes
for this in this order. Note in the roadmap that the planner is writing plans for the
real-Oslo rebuild, the front page as a home and the runes, and that nothing of those is
decided.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next",
"Questions waiting for Lars"; lessons; resources; `conversations.md`: his answers word for
word from the scratch file, then the planner's reading: what is built here, what is
planned, what waits for his word in the planner's session (the quote on the opening card;
deleting `landing-game-polish`), what was asked back (the first sign)); DESIGN; the two
ADRs; `apps/viking/tools/review/o47/` (`after.md`); `thematic.md` marked where a proposal
was carried out. LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where
they changed; the figures tool rerun into `o47/figures/`; say which sheets changed.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes; the viking suite's time said against
  `origin/main` the same hour (add no more than 10 s).
- Front page 28 of 28; run files as said above; pictures of every level byte-identical
  with `origin/main` except where a swapped figure, a spire or a talk panel stands, each
  kind of difference named.

## If you cannot do all of it

Order: item 1; item 2 (the hare, the spires, then the place's own); item 3 (the panel and
Loki, then the hero, then Loki's figure, then bosses); item 4. Finish each properly before
the next. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o47/shots/`: every new figure at four
   times size and in place; every portrait and expression on one sheet at four times
   size; the panel in place at the four sizes, both languages, with reduced motion.
3. Tests, tsc, sizes (each file that grew), front page, run files, the maze's runs, cost a
   frame.
4. What only a person can judge, as a list for Lars; the three proposals for the sign.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
