# Order 18: seen at a glance

Written 15 November 2026. Lars played the game on his phone after the speed fix (PR #63, ADR 0036)
and said, in his words: when a level is done there should be no "again" choice, "just take me out
again"; Nabolaget "can be Gamle Oslo or something, or where is that?"; "make the rune checkmarks
much clearer. bigger, more of a difference between those that have been achieved and those that
have not"; "the enemies should be slightly bigger and more obvious. i think grey isnt smart because
the bg often is gray. so make a palette for enemies that dont overlap with the bg".

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0011, 0014,
  0016, 0023, 0034 to 0036.
- `git fetch origin`; branch `seen-at-a-glance` from `origin/main`. Commit this order first (it is
  untracked), then as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`. The front page's own
  creatures and header are not part of this order.
- First script: 59.75 kB of 60, and the build fails over 60. This order adds to it (the header's
  runes, perhaps the enemies' shared looks). Make room first: move the shared enemy looks that
  only some levels use out to those levels' files, or to a chunk fetched with the first level that
  needs them. End at or under 59.8 kB.
- Speed (ADR 0036): nothing here may make a frame heavier. Check two levels with `?debug&perf`
  before and after; an outline drawn as four extra copies of every enemy is not acceptable if it
  shows there.

## 1. A cleared level takes him out

- The card after a rune has no "Once more" / "En gang til". It shows what it shows now (time, best,
  skilling, what is new) and one action, "To the map" / "Til kartet"; any key, tap or click does
  it, and after 6 s it goes by itself (not under reduced motion: there it waits for him). He
  arrives on the map at the station he just cleared, the next one open ahead of him.
- Playing a level again is what the map is for: walk to the station and go in. R during a level
  still restarts it. The Game over card keeps "Try again".
- Gamlebyen's ending (the dawn, the rune on the prow) is not shortened: the card comes after it as
  now, then the map with the longship.
- Remove what only the Again choice needed. Tests for the card's flow follow.

## 2. Nabolaget is named for where it is

The level is a winter night over Vålerenga and Kampen, which lie in the district Gamle Oslo. The
header already has a link called "Gamle Oslo" (the front page), level 16 is Gamlebyen, and Ekeberg's
banner says "above Gamle Oslo", so a station called Gamle Oslo would be the third thing of that
name on one screen. The planner's choice: the station and level are **Vålerenga**, with the banner's
second line "Hjemover gjennom Gamle Oslo" / "Homeward through Gamle Oslo". (If Lars prefers
"Gamle Oslo" as the name, it is a change of two strings: say where they are in the hand-back.)

- Display names only: the id stays `nabolaget` (stored progress, addresses, files). Every place a
  player reads the name changes: the station board, the banner, the cards ("Line 2 opens once …"),
  the loading board, signs that mention it, screen-reader text, LEVELS.html, DESIGN's table.
- The rune is still N (the tenth letter of the name in the header): nothing about runes changes.
- An ADR for the rename (why not "Gamle Oslo", why the id stays).

## 3. Runes that read at a glance

In the header (viking only), at 1280 wide and at 390:

- Larger: at least half again their present size on a desktop, and as large as fits on a phone
  without adding a header row (drop or shrink something else there if needed, and say what; the
  clock and the hearts must stay).
- Earned and not earned must differ in more than tint: an earned rune is a solid gold tile with a
  dark rune and a small tick at its corner; an unearned one is an empty slot, a faint dashed
  outline with the rune barely there. Someone glancing for half a second, or who cannot tell gold
  from grey, must be able to count how many he has. The level he is in now is marked (a ring).
- The same language on the map: a cleared station's rune stone and an uncleared one's must differ
  as clearly (they are lit blue-white or dark now; add the tick and the gold).
- Screen-reader text stays right. Look at it at both sizes, with 0, 3, 10 and 16 earned.

## 4. Enemies that stand out

- **A palette for what can hurt him** (`packages/pixelkit/src/swatches/` as its own file, used by
  every enemy and what they throw): a small family of saturated, warm or acid colours that no
  background uses as a field: for example a signal red, an orange, a magenta-plum, a poison green,
  with one near-black for outlines and one pale for eyes and teeth. No greys, no stone, no muted
  browns, no sky or water blues as body colours. Each kind of enemy keeps a recognisable identity
  (a rat is still a rat) but its body is from this family: a plum-red rat, an orange-breasted
  pigeon, a guard in a red coat. Hazards (rebar, braziers, spikes) get the family's warning colour
  on their dangerous edge.
- **A dark outline** on every enemy, one pixel, drawn as part of its look (not by redrawing it
  four times).
- **Slightly bigger**: each enemy drawn about a quarter larger (redrawn at that size, not scaled:
  pixels stay whole). Hit boxes grow with the picture only where the level still passes its
  scripted clear, its reach and dead-end searches and the jump-landing test without moving
  anything; where a bigger box would break a level, keep the box, grow the picture around it, and
  list those. Stomping must still work as drawn: the head he lands on is where the picture's head
  is.
- A test: every enemy look's body colours come from the palette file, and no colour in it is
  within a set distance (say so in the test, in a perceptual space or plain RGB with a generous
  margin) of any ground, wall, sky, water or far-layer colour of any level, by day and under the
  evening, twilight and night tints.
- The bosses: the troll, the plough and the serpent keep their own looks but get the outline and,
  where they are grey or dark on a like ground, a rim in the palette's warning colour on what
  hurts.
- Night rims and eye-shine (ADR 0023) stay and must still read with the new colours.
- Friendly or neutral things that are not enemies (the heron, statues while stone, sheep) must not
  use the enemy family: the palette is a promise that this colour means danger.
- Fairness must not get worse: rerun the sloppy player (fresh seeds, 60 runs, ±2 and ±4) on every
  level whose boxes changed and three whose boxes did not; no level more than 0.3 hearts a run
  worse than `tools/review/line2-after/` and order 17's line 1 table.

## Look at it

Every enemy kind, by day and at night, on the ground it lives on, at 1280 x 800 and 390 x 844:
one contact sheet of before and after. The header with 0, 3, 10, 16 runes at both sizes. The card
after a level, and the map he arrives on. Fix what you see before handing back.

## Docs

DESIGN (the card, the name, the runes, the enemy palette and its promise), HANDOVER, ADRs (the
rename; the enemy palette; taking him out after a level), LEVELS.html (names, and fresh pictures of
every level since the enemies changed, into `docs/games/shots/`), `tools/facts.ts` rerun.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean; first script at or under 59.8 kB.
- Front page 28 of 28 byte-identical.
- `?debug&perf` on Akershus and Bygdøy at 390 x 844: no more rectangles a frame than before (give
  both numbers).

## Hand back

1. Per section: done, partly, not done and why.
2. Pictures in `/tmp/shots-glance/`: the contact sheets, the header states, the card, the map.
3. Which enemies' hit boxes grew and which did not; the sloppy table before and after.
4. Every changed line of text, both languages, and where the level's display name lives.
5. The perf numbers, first-script size, what was moved out of the first script.
6. Departures, doubts, found and not fixed. Branch, commits, tests, front page comparison.

## 5. Platforms that stand out

Added by the planner the same day, after Lars said: "all platforms also need a separate palette". Done
after section 4.

- Everything he can stand on that is not the level's main ground or wall (ledges of every kind, one-way
  platforms, carriers: rafts, lifts, ferries, bells, hooks, sheets, logs, lily pads, decks, oars, rising
  stones, crates, the statues-as-steps) gets its top from one platform palette, its own file in
  `packages/pixelkit/src/swatches/`, separate from the enemy palette and from every background.
- The promise, as with enemies: one glance says "I can stand there". A bright, consistent top edge (two
  pixels) in the palette's standing colour, a clear body colour under it from a small family (say a warm
  honey wood, a pale stone-cream, a teal metal), and a dark underside line. Each thing keeps its identity
  (a raft is still a raft, a lily pad still a pad) but its top edge and body are from the family. The main
  ground keeps the levels' own surfaces, but its walkable top edge should also read: check it against each
  level's backdrop.
- Things that move or will give way must look different from things that hold: carriers keep the
  standing top and add a marker (a stripe or studs in the palette's moving colour); things that sink, fall
  or vanish on a beat (sinking pads, the lake's lily pads, ledges on a beat, the stone that sinks back) get
  the palette's warning top (not the enemy family's colours), the same everywhere.
- The three families must not collide: add to the palette test that no platform colour is within the set
  distance of any enemy-palette colour or of any background, wall, sky, water or far-layer colour of any
  level, by day and under the evening, twilight and night tints. Under the night tint a platform's top
  edge keeps some light, as ADR 0023 does for skilling.
- No change to any platform's size, place or timing: this is colour and edge only, so routes, the reach
  search and fairness are untouched (say so if any test disagreed).
- The front page is not part of this (28 of 28 byte-identical still); if a kit function it shares draws
  ledges, add an option the viking game passes, as `drawBanner`'s plate did.
- Speed: no more rectangles a frame than before on Akershus and Bygdøy (`?debug&perf`).
- Look at it: one contact sheet of every platform kind before and after, by day and at night, on its own
  level's backdrop, at 1280 x 800 and 390 x 844. An ADR for the platform palette and its promise; DESIGN
  updated. In the hand-back, add a section for it: what each kind looks like now, any that could not take
  the palette and why.

## 6. Every role has its colours

Added by the planner the same day, after Lars asked to "consider other assets that have to have a
different palette too". Done after section 5. It turns the enemy and platform palettes into one system.

Write one file in `packages/pixelkit/src/swatches/` (or an index over the palette files) that names the
roles and owns their colours, so a later level cannot quietly reuse a role's colour for something else.
The roles, beyond enemies (section 4) and platforms (section 5):

- **Him.** His blue tunic, helmet and skin are his alone: no enemy, platform, pickup or backdrop field
  uses his blue. Check every level (Bygdøy's water, Østensjøvannet at dawn, night tints) that he never
  sits blue on blue; where he does, it is the backdrop that moves.
- **Things to take**: skilling, the brown cheese, the bracteate, the feather, the ski pole, the shield
  where they lie. One family (copper and gold with a bright glint), kept away from honey-wood platforms
  and from orange enemies: with section 4's orange and section 5's honey this is the likeliest collision,
  so decide the three together and test their distances.
- **Things that hurt but are not enemies**: spikes, rebar, braziers' fire, sparks, the dig's edge,
  anything a touch costs a heart for. They share the enemy family's warning colour on the dangerous part
  (already asked in section 4); make it the same colour and the same stripe or edge everywhere.
- **Where he falls**: water he drowns in and pits must read as "not ground". Deep water and holes get a
  consistent look (a dark band at the lip, no surface that looks walkable; Slottet's dig was mistaken for
  a slab once). Water that is only scenery (far fjord) must look different from water under his feet.
- **Things to use**: doors, benches, flags before and after they are raised, sign boards, the rune
  stone. One family for "press up here / this saves you" (the flags' red-white-blue and the benches may
  keep their identity, but each must stand off its level's backdrop by day and night, and a raised flag
  must differ from an unraised one at a glance, as the runes now must).
- **What a boss shows before it acts, and where to hit it**: every tell (the troll's raised club, the
  plough's blade and beacons, the serpent's rear and its foam ring) and every weak spot (the dawn shaft,
  the dazed head) uses one "now" colour, the same across the three bosses, not used for anything else.
- **Speech and hints**: the white bubbles and the dark banner plate are theirs; nothing in a backdrop
  should look like a bubble.
- **Scenery.** The inverse promise: backdrops, far layers and decorative foreground are lower in
  saturation and contrast than every role above, and nothing decorative looks standable. Go through each
  level for scenery that breaks this (bright flags and balloons at Slottet, lit windows, Bjørvika's
  yellow crane, lanterns, the Scream sky at Ekeberg) and decide case by case: tone it down, or leave it
  and say why it cannot be mistaken for a role.

Then:

- Extend the palette test to all roles: every role colour at least the set distance from every other
  role's colours and from every level's ground, wall, sky, water and far-layer colours, by day and under
  the evening, twilight and night tints. Where two roles must be near (pickup gold and a flag's yellow
  finial), list the exception by name with the reason.
- A colour-blind check: run the role colours through deuteranopia and protanopia simulation matrices in
  the test, and require enemies, platforms, pickups and him to stay apart there too, or to differ by a
  shape cue (outline, tick, stripe) that the test names.
- One picture for the owner: a "legend" contact sheet in `/tmp/shots-glance/` showing each role's
  swatches and two examples of each in a real level by day and at night. Put the same legend, small,
  into LEVELS.html.
- An ADR for the role system (it can be the same record as the enemy and platform palettes: one
  decision, "colour says what a thing is"), and DESIGN's section on drawing rewritten around it, with
  the rule for anyone adding a level.
- Same limits as before: no change to any hit box, place or timing from this section; front page 28 of
  28 byte-identical; no more rectangles a frame on Akershus and Bygdøy; first script at or under 59.8 kB
  (the palettes that only some levels use go with those levels).
- In the hand-back: the legend, the table of role distances (the smallest ones), every exception, every
  piece of scenery you toned down or left, and anything that could not be made to fit.

If doing all of this properly would make the order much later, do sections 1 to 5 fully first and
commit them, then 6; say in the hand-back how far 6 got.
