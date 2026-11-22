# Roadmap

As of 22 November 2026, after order 35 was built (not yet reviewed or live). Change this file in the same change that makes it wrong.

## Status

| | |
|---|---|
| Date | 22 November 2026 |
| Last live | Order 35, housekeeping and the figures, PR #83; before it orders 34 (PR #82), 33 (PR #81), 32 (PR #80), 31 (PR #79), 30 (PR #78), 29 (PR #77), 28 (PR #76) and 27 (PR #74) |
| Built, waiting for review | Order 35, housekeeping and the figures, branch `housekeeping` |
| Lars | Away from 17 November for about two and a half weeks; standing permission in [`conversations.md`](conversations.md). On 22 November he answered the waiting questions through another session (`conversations.md`); he has not played yet |
| Weekly allowance | About 23 % used when order 35 was reviewed on 22 November; next reset Saturday 28 November 11:00. No new round above 75 %, nothing heavy at 80 % |
| Paused? | No |

## In flight

**Order 35, housekeeping, and every figure on one page** (`orders/35-housekeeping-and-the-figures.md`), built on branch `housekeeping`,
not yet reviewed. It retunes nothing (Lars has not played). The viking suite under 300 s on the Pi with nothing it held lost, every changed
test shown to fail on a planted fault; `apps/viking/tools/figures.ts`, a sheet of every figure the game draws at four times and
`figures.json` naming each in both languages (the page of every figure, unpublished since order 27, can be rebuilt from it); the encore's
shouts in a still picture without `&say`; the blank harness pictures found (taken before the page had drawn) and named by `tools/shots.ts`;
perf at all 275 places in one browser; Bjørvika's crane lights held by name in the warning test; Holmenkollen's hedgehog drawn as a
mountain hare in its winter coat, which the planner took out again in review (it read worse than the hedgehog; the hedgehog stands). Each item, done or
not, with its measures: `apps/viking/tools/review/o35/after.md`.

**Order 34, what Lars said** (`orders/34-what-lars-said.md`, ADR 0055), live (PR #82): his answers
recorded (`conversations.md`); the tenth station shown as Gamle Oslo, its words an ode to Oslo with no "home"; scenery and ground off the
warning red (ADR 0044 amended); the encore's original glam-rock tune in the game's own synth, following the fight, with an audition
(`?debug&music=`), Loki at the far end of late-1980s glam in general, four shouted lines in time with it; the rule that difficulty and
enemies follow the place, and a table of every level against it with proposals only (`apps/viking/tools/review/o34/thematic.md`). Each item,
done or not, with its measures: `apps/viking/tools/review/o34/after.md`. Waiting for Lars in person, not built: a new line for the opening
card, anything nearer one real band's look than the general style, deleting `landing-game-polish`.

**Order 33, the lane behind the church, and room to breathe** (`orders/33-the-lane-behind-the-church.md`), live (PR #81): Vålerenga's lane behind the church dark again after dusk (missing since order 15), drawn by `drawNightKept`, the same pixels
as `drawNight` at path fills where drawing it so cost about 1,580 rectangles a frame; harmless things held off the warning red (ADR 0044
amended; the chairlift's chairs, the ferries' bands, the trains' stripe, Holmenkollen's lift cage, a balloon, a shirt recoloured, and the
scenery in the kit's red listed for a decision); the first script from 59.60 to 57.94 kB gzipped (ADR 0053 amended); `main.ts`'s drawing
after dusk, of the rune's flight and of the banner's fade held by the reduced-motion test; debug ways to the pole's note and the encore's
bite hint, both photographed at 360 wide. Each item, done or not, with its measures: `apps/viking/tools/review/o33/after.md`. Nothing in
it waits on Lars.

**Order 32, lights after dark** (`orders/32-lights-after-dark.md`, ADR 0054), live (PR #80):
every light in every level, the encore and the map asked after dusk (the table and its decisions: `apps/viking/tools/review/o32/before.md`),
one rule held by `render/lights.test.ts`; Vålerenga's Pi and paper cranes drawn again (missing since order 15; the lane's dark, missing too, left for a decision); then order 31's leftovers (the logs and
the chairs, the outline against its glow in the dark, the reduced-motion test's blind spots, the last Norwegian words at 360). Each item,
done or not, with its measures: `apps/viking/tools/review/o32/after.md`. Nothing in it waits on Lars.

**Order 31, loose ends and a second look** (`orders/31-loose-ends-and-a-second-look.md`), live (PR #79):
what order 30 found and left (the cards under the header with a mouse, Slottet's first pigeon, Nordmarka's invaders in the dark, the
reduced-motion test that read the source), Stortinget's shafts (idea 5), the Norwegian (idea 11), and a second walk for flat things
(the tram, Vigelandsparken's gate and Korketrekkeren's lit trail redrawn). Each item, done or not, with its measures:
`apps/viking/tools/review/o31/after.md`. Nothing in it waits on Lars: no story words, no change to the encore's fight, no difficulty.

**Order 30, small debts** (`orders/30-small-debts.md`, ADR 0053), is live (PR #78).
Each debt, paid or not, with its measures: `apps/viking/tools/review/o30/after.md`.

**Order 29, the encore** (ADR 0052) is live (PR #77). Loki met once, at a stage
on the water in Middelalderparken that appears past the longship only with every rune of both lines. Measures and what was left:
`apps/viking/tools/review/o29/after.md`. Unplayed and unheard: the fight at speed, the four new stings, his frames on a phone.

**Order 28, the last flat things** (ADR 0051) is live (PR #76).
What it did and left: `apps/viking/tools/review/o28/after.md`. Left alone, with reasons: the trains and trams (drawn a column at a
time and clipped), the bells, logs, buckets, chairlift and hoist (lit and detailed already), windows, the lanterns and torches that
flicker, the Opera's door, line 2's low track on the map. The worktree's larger first script was not reproduced (`lessons.md`).
Unplayed: none of it has been seen at speed or on a phone.

Order 27 (the glamour, ADR 0050) is live. What it left that order 28 did not take up: the lean is per level, not per kind; a kind met in
several levels was looked at in place only in its first; line 2's ending card was checked in code only; the four stings are unheard.

Order 26 (the ground, ADR 0049) is live; what it left (lamp posts, railings, panel doors, the sauna rafts, sheds' plank walls, the rowing
boat, the band test) order 28 did. It reported the stone at Gamlebyen, Ekeberg and Akershus as busier than before: the ground's band now
holds every material to a sixth of the figures' contrast, and Akershus's fortress and Gamlebyen's quay planks were quietened for it;
whether figures stand out there on a phone is still for Lars.

## Next

Order 34 answered what Lars had said. What is still his: a line for the opening card (he suggested one; who speaks it is unclear), the
deletion of `landing-game-polish` (in the planner's own session), and his play notes. When he has played, the proposals in
`apps/viking/tools/review/o34/thematic.md` (difficulty and enemies by place) become an order; until then idea 2 below (tune by play) is the
biggest gap, and idea 3's checklist now has the tune on it: nobody has heard it. Order 35 carried out one proposal of that table that is a
drawing only (a mountain hare for Holmenkollen's hedgehog) and it was taken out again in review; all of the table waits. The page of every figure (resources.md) can
be published again from `apps/viking/tools/figures.ts`'s sheets: one sheet a figure, named in both languages, for Lars to comment on.

## After that: ideas in rough order of value

None of these is decided. Each has a reason.

1. **Meet Loki.** Order 29 (ADR 0052): the encore. What a person must judge is in its hand-back.
2. **Tune by play.** No level has been tuned by a person. Ask Lars to play line 1 start to end
   and say where it is unfair, boring or unclear; turn that into an order. The reviews'
   weak-spot lists (HANDOVER, "Known weak spots") are the starting list.
3. **What only a person can judge**, collected from the hand-backs, to put to Lars as a short
   checklist when he has ten minutes:
   - Phone (order 21): the sliding move pad, a held jump, long-press and pull-down doing
     nothing, "Go in" at a door, turning the phone mid-level, the see-through buttons on snow
     and in the dark, any missed tap. On a notched phone on its side the camera can jump when
     he turns near the Dash button (known, not fixed).
   - Motion (orders 23 to 25): does his run read as running; is the idle fidgety; is the
     landing felt; do the strips of water read as depth or shimmer; are things in front a
     distraction; is the "!" on every thrower too much; does the edge arrow help.
   - Sound: nobody has heard any of it, the encore's tune included (order 34; how to hear it: [`resources.md`](resources.md)).
4. **The camera's jump on notched phones** (order 21's one "partly").
5. ~~**Stortinget's escalator shafts**: 3,600 of its 9,950 rectangles a frame.~~ Done in order 31: kept and copied, the shafts' places
   1,363 to 2,947 rectangles a frame at 390 x 844 where they were 4,259 to 6,630.
6. **Way 1 for him alone** (GRAIN.md): only if he still reads as a blob on a phone after way 3.
7. **The 240-pixel upright view** (ADR 0019): at 200 everything is a fifth larger. A question
   for Lars with two pictures, not a thing to decide for him.
8. **The maze** has had none of orders 18 to 27: its help line still names keys on touch; its
   figures are in the old style; it knows nothing of the glamour.
9. **The front page** is frozen by its 28 pictures. If Lars wants the new hero or the glamour
   there, that is a decision to unfreeze it (new references, an ADR).
10. **More frames where order 23 stopped**: no climbing or hanging poses exist because the game
    has no such states.
11. ~~**Norwegian.** ADR 0016 says both languages; check that orders 21 to 27 added both for
    every new line (the touch notes, the story).~~ Done in order 31: every word kept by language has both (`game/words.test.ts`), and
    each line orders 21 to 30 added was seen at 360 wide in both (`apps/viking/tools/review/o31/words.md`).

## Questions waiting for Lars

Kept in [`conversations.md`](conversations.md), "Questions waiting for Lars". Do not let them
block work: pick the reading that is cheapest to undo, say which you picked, carry on.

## Known debts in the tools

- The front page references live in `/tmp` and die on reboot.
- `review.sh` and `frontgate.sh` in [`scripts/`](scripts/) have this session's scratch paths
  written into them: set `S` before using them.
- The viking suite: under 300 s alone since order 35 (`apps/viking/tools/review/o35/after.md` has the three runs and every file's time;
  it was 362.7 s that morning, 370.5 s after order 34). The reach searches are about 100 s of it and CPU-bound on four cores (Akershus's
  alone 52 s, in the kit's physics); the reduced-motion test about 70 s in company. A new test that draws every level should share a
  walk or a recorder already made (`render/fields.ts`: `areaRecorder`, `ANY_METHOD`).
- `tools/pictures.ts` retakes LEVELS.html's pictures; since order 35 it takes none that comes out blank (`tools/shots.ts` names them).
