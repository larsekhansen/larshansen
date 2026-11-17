# Order 29: the encore

Written 17 November 2026, after order 28. Lars is away; his standing words are in
`docs/games/handbook/conversations.md` ("I trust you. Be a game designer, plan out something
amazing"; "im giving you permission to continuosly merge and deploy all improvements").

Order 27 told a story and stopped short of its front man: ADR 0050 says "Loki is not met yet".
Line 2's ending says the glamour lifts and Loki keeps the money. This order lets the player
meet him once, as an encore after everything else is done. It is extra: nothing that exists
today may depend on it, be gated by it, or change because of it.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0035, 0036, 0039 to 0051, orders 27
  and 28, and how the three bosses (troll, plough, serpent) are built, told and tested.
- `git fetch origin`; branch `the-encore` from `origin/main`. First commit: this order, as
  `docs/games/orders/29-the-encore.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and kill your own headless browsers by PID when done.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand: his movement numbers do
  not change.
- Every existing level's sloppy run files (Langkaia, Nordmarka, Bjørvika, Gamlebyen, seeds 201
  to 260) byte-identical with `origin/main`. Front page 28 of 28 byte-identical. First script
  under 60 kB (59.07 now): the encore lives in a lazy chunk, loaded when he goes in.

## The limits of the story (ADR 0050; not yours to loosen)

- The existing lines in `game/story.ts` stay as they are. New lines go in the same file, in
  English and Norwegian, with one or two alternatives beside them for Lars to choose from.
- Loki is the mythological trickster, drawn as an 80s front man. He is nobody real: no real
  performer's likeness, costume, pose, logo, band name, song, lyric or nameable melody.
- The man who paid is not named again, not drawn, not present, not quoted. The encore may
  refer to "the invoice" or "the client" at most once. No new joke about any real person.
- Nobody dies. Loki loses his glamour and leaves, like everyone else.

## 1. Where and when

- When every rune of both lines is held, a new stop appears on the line map past the last
  station of line 2: a stage (a small festival stage on the water is fitting; choose a place
  that is true of Oslo and say why). Before that, nothing shows: the map's pictures with fewer
  runes are pixel-identical to today.
- The stop is a door like any other. The encore can be replayed. It gives no rune and changes
  no total; it records only "encore seen" and a best time.

## 2. The encore

One screen-and-a-half arena, a stage: flat floor, two or three platforms (speaker stacks,
yellow-topped per ADR 0044), no pits. Build it from the existing tiles, props kit and scenery.

Loki, the headliner. Design him as a boss in the way the other three are: a clear tell before
every attack (ADR 0040, 0044: red outline hurts, a tell is seen at least as long as the
existing bosses' tells), three hits to break the glamour, each hit a stomp on him at the moment
his pattern leaves him open. A suggestion to design from, not a script:

- **He is a trickster, so his attacks are other people's.** Each phase he puts on a glamour of
  one of the three earlier bosses' moves (a club swing, a charge across the floor, a bite from
  below), drawn in his own neon, with that boss's tell. The player already knows how to answer
  each; the test is recognising which one is coming.
- **Between attacks he poses**, and that is the opening.
- **Each hit knocks off a piece**: the hair, the shades, the jacket. After the third he is a
  thin man in a grey wool sweater with a thermos, who shrugs, says a line and walks off stage.
  The stage lights go plain; the mirror ball stops.
- Difficulty: no harder than the serpent. The sloppy player with ±2 noise should win in a
  reasonable share of seeds; report the share. Hearts and the shield work as in any level.

Sound: stings made from the existing synth only. Reduced motion: no strobe, no flashing; the
stage lights hold still. Nothing may flash faster than three times a second for anyone.

## 3. Words

A banner on arrival, one line as he wakes, one line per hit at most, his leaving line, and an
ending card. Dry, warm, short enough for a bubble at 360 wide. Oslo is teased as warmly as he
is. The ending should leave Oslo plain and content.

## 4. Docs, in the same change

ADR 0052 (the encore: why extra and gating nothing, how Loki fights and why, the limits
restated, not chosen); amend ADR 0050's "Loki is not met yet"; DESIGN; HANDOVER; the handbook
(start-here's table, roadmap status and "In flight", conversations: add the encore's lines to
"Questions waiting for Lars", lessons); LEVELS.html gets the encore and a picture
(`apps/viking/tools/pictures.tsv`); `apps/viking/tools/review/o29/`.

## Measures that must hold

- `bun test` green in all four packages; tsc and `bun run build` clean; first script under 60 kB.
- Front page 28 of 28; run files identical; the map with any incomplete set of runes
  pixel-identical to `origin/main` (show the comparison).
- Tests: the stop is absent without all runes; the encore can be won by the scripted player and
  by the sloppy player on some seeds; every attack has a tell at least as long as the shortest
  existing boss tell; no line in `story.ts` outside the encore's block changed; the reach
  search still passes.
- Perf in the arena at 390 x 844: under 15,000 rectangles a frame.

## If you cannot do all of it

Finish in this order, each properly: (a) the stop and the empty arena, gated; (b) Loki with one
borrowed attack and three hits; (c) the other two attacks; (d) words; (e) sound and lights;
(f) docs. If only (a) is done, leave the stop hidden behind a debug flag so nothing half-built
is live. Docs for what was done are never skipped.

## Hand back

1. What was built and what was not, plainly.
2. Pictures in `~/.cache/claude-scratch-larshansen/o29/shots/`: Loki's sheet (every frame, each
   stage of losing his glam, his plain self), each attack's tell as a strip, the arena at 390 and
   1280 by day and night, the map with and without the stop, every card and bubble.
3. Every line added, both languages, and the alternatives.
4. The sloppy player's win share; tell lengths against the three bosses'; perf; tests;
   first-script size; front page; run files; the map comparison.
5. What only a person can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
