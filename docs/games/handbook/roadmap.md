# Roadmap

As of 24 November 2026, after order 43 was built (branch `far-view`, not yet reviewed); order 42 is live (PR #90). Change this file in the same change that makes it wrong.

## Status

| | |
|---|---|
| Date | 24 November 2026 |
| Last live | Order 42, room, and the edges of the screen, PR #90 (reviewed and merged on 24 November); before it orders 41 (PR #89), 40 (PR #88), 39 (PR #87), 38 (PR #86), 37 (PR #85), 36 (PR #84), 35 (PR #83), 34 (PR #82), 33 (PR #81), 32 (PR #80), 31 (PR #79), 30 (PR #78), 29 (PR #77), 28 (PR #76) and 27 (PR #74) |
| Built, waiting for review | Order 43, the far view (branch `far-view`, 24 November) |
| Lars | Away from 17 November for about two and a half weeks; standing permission in [`conversations.md`](conversations.md). On 22 November he answered the waiting questions through another session (`conversations.md`); he has not played yet |
| Weekly allowance | About 52 % used when order 42 was reviewed on 24 November (a round now costs 4 to 5 points); next reset Saturday 28 November 11:00. No new round above 75 %, nothing heavy at 80 % |
| Paused? | No |

## In flight

**Order 43, the far view, an ode to Oslo** (`orders/43-the-far-view.md`, ADR 0044 and 0047 amended), built on branch `far-view`, waiting for review.
Lars, 22 November: "It's more of an ode to Oslo." Every level's far view, the encore's and the line map's on one table (`apps/viking/tools/review/o43/before.md`:
what stands in it, what a person who knows Oslo looks for from there and whether it is there, repeats, the sky, its colours against every role, a mark);
the four 3s and the first 2 redrawn with a brush for the far view (`alive/far.ts`: a silhouette painted once in its material's tones, copied, its windows
lit after dusk): Rådhuset (Akershus to the east, Aker Brygge and Tjuvholmen to the west, Hovedøya, the far layers rising up the towers), Akershus (the
Opera, the Barcode and MUNCH to the east, Rådhuset to the west, Hovedøya), Bygdøy (the woods open by the water onto Holmenkollen's jump, Rådhuset and
Akershus), Vigelandsparken (the trees stand back round the Monolith's plateau onto the ridge with the jump and the TV tower) and Holmenkollen (Rådhuset
once, islands); every far colour held off the warning red, the paint and every role under every sky (`render/warning.test.ts`). Drawing only. Each item,
done or not, with its measures: `o43/after.md`.

**Order 42, room, and the edges of the screen** (`orders/42-room-and-edges.md`, ADR 0035, 0043 and 0053 amended), reviewed, merged and live
(PR #90, 24 November). Nothing else is in flight. The first script from 58.65 to 55.80 kB gzipped (item 1 alone 55.70) with nothing a player sees changed: what only later files use
moved into files that already existed (`o42/before.md` has the first script's modules on a table, each with what needs it), the dead plain carrier and
ledge out; a card's foot off the home bar's strip, the maze's list kept on the screen on its own page, the opening card holding the map's plate back and
the pad hidden under it, the map's boards kept clear of the pad's bottom row and of a notch at the line's start; every screen kind looked at again at the four
phone sizes with a notch; a thin line of the game's dark round the page's speech bubbles; the "!" three pixels wide with a two-pixel dot. Each item, done or not, with its measures:
`o42/after.md`.

**Order 41, the screens between, and the last weak tells** (`orders/41-the-screens-between.md`, ADR 0044 amended), reviewed, merged and live
(PR #89, 24 November). Nothing else is in flight. Every screen that is not a level on one table (`apps/viking/tools/review/o41/before.md`: the line map, every card, what is drawn
over a level, the maze's own screens, at both sizes, in both languages, with touch and a pretended notch and with a mouse) and from the top of its
ranking redrawn: a pressed pad control darker with a white ring (it went white and vanished over snow or white marble), a heart lost hollow, a dimmed
control with its edge in dashes, the boards under the map's stations in rows so none meets another, a padlock on a shut station, the "!" clear of the
head it stands over, the edge arrow off a notch, the bar's skilling and gold and a level's card's counts drawn as the game draws them; the four tells
order 40 left (the welder's sparks, Bjørvika's gust, Gamlebyen's sinking stone, the heron); the rune's stone a pale rim on its lit side after dusk (the
planner's call). Each item, done or not, with its measures: `o41/after.md`.

**Order 40, what he takes, and what warns** (`orders/40-what-he-takes-and-what-warns.md`, ADR 0044 amended), reviewed, merged and live
(PR #88, 23 November). Nothing else is in flight. What order 39 left: after dusk a line of the level's dark round what he takes (the planner's call; the maze's rule; every
skilling, cheese and bracteate met after dusk 31.6 or more off what is round it); every tell in order 39's table ranked in place by size,
contrast and how long it stands (`apps/viking/tools/review/o40/tells.tsv`), and the four weakest made to read by drawing only (the track rat's
snout over the third rail's cover, a closing wall's stones at Gamlebyen, the water stirring round a lily pad or a bundle about to sink, a gust's
streaks at Ekeberg), held to a size by `render/tells.test.ts`; of the eight figures left at mark 2, five redrawn (the stove pipe, the pontoons,
the post, Slottet's balusters, Akershus's fire baskets) and the track rat by its tell, the ski pole and the tube railing left with reasons. Each
item, done or not, with its measures: `o40/after.md`.

**Order 39, the rest of the table** (`orders/39-the-rest-of-the-table.md`, ADR 0040 amended), reviewed, merged and live
(PR #87, 23 November). Nothing else is in flight. What order 38 left: the bishop's guard (a kettle hat, the halberd's blade), the coot (its white in the pale, which the glamour does not
touch), the squirrel (a plume of a tail, tufted ears, the cone it throws in its paws) and the mound-dweller (folds, a hand) redrawn; with reduced
motion the jumpers' tells held still (they showed nothing), every other tell checked with motion and without (the table in
`apps/viking/tools/review/o39/after.md`); every boss state, carrier, thrown thing and pickup photographed in place and measured against what is
round it (`o39/before.md`, `rim.tsv`, `props.tsv`), what is thrown given a pixel of the dark between its outline and its own glow after dusk;
order 38's marks kept honest (no 3s, each 2 named). Drawing only. Each item, done or not, with its measures: `o39/after.md`.

**Order 38, a third look, with every figure on one table** (`orders/38-a-third-look.md`, ADR 0046 amended), live (PR #86). Lars's standing wish ("keep looking for more assets that should have increased details"): every one of the 119 figures
looked at on its sheet and every enemy in place at phone size, glammed and natural (`?debug&natural`), marked 1 to 3 and ranked
(`apps/viking/tools/review/o38/before.md`); the worst redrawn (the e-scooter as a hire scooter; the gull, the crow and Stortinget's pigeon on
the wing, each beating through shapes; the salmon's water breaking; the maze's raven and mound-dweller with faces), the wasp's beat touched
up; the flyers' beat and every level's silhouettes held by a test; the figures' sheets leave what a look draws plain without an outline.
Drawing only: no box, speed, timing, route or word changed. Each item, done or not, with its measures: `apps/viking/tools/review/o38/after.md`.

**Order 37, up and down in the mound, and the phone's notch** (`orders/37-up-and-down-in-the-mound.md`, ADR 0056 and 0043 amended), live
(PR #85). What order 36 left and idea 4: in the maze his back going up a corridor and his face coming down one
(the kit's `himviews.ts`, four run frames at the side run's rhythm), which drawing shows a little sticky (`maze/heading.ts`), his ghost's run by
distance; the maze's reduced-motion test draws the scene itself through a curse, a level's end and its card; the maze page's checking aids and
synth out of its first script (34.40 to 31.93 kB, the aim of 31 missed by 0.9 with his views in it); a pretended notch (`?debug&safe`) and live
frames (`?debug&live`) in the harness, the camera's jump on a turn reproduced (85 px in a frame) and gone (it eases for the ground ahead either way),
every screen kind looked at with a notch left, right and upright (the raven's words ran under a left notch: bubbles keep off the safe sides now);
the maze's way out inside the page falls back where Back has nowhere to go; `figures.json`'s states in both languages. Each item, done or not, with
its measures: `apps/viking/tools/review/o37/after.md`.

**Order 36, the maze catches up** (`orders/36-the-maze-catches-up.md`, ADR 0056), live (PR #84).
Idea 8: the maze in the game's grain and in the hand, its rules unchanged step for step. Looked at first (`apps/viking/tools/review/o36/before.md`);
one stepped harness for both pages; him from the fjord's own sheet (moved into the kit) standing on the mound's floor with a torch; the mound
redrawn as its own iron-bound place (lining with an iron band on every face, packed earth, the dark hill, the pad, the doorways, the stones,
the raven, the mound-dweller), adders outlined in the warning red, the key in the take-gold, the door's corners in the use cyan; on a phone
the help line says what a finger does and goes at his first move, the raven's words wrap, thumb-sized targets, the viking page's touch styles
kept in the mound; nothing blinks with reduced motion; the joins held by a test and stepped pictures; the figures' bosses and Loki outlined
as the page outlines them and the maze on the page of every figure; the reduced-motion test's dead watch removed. Each item, done or not,
with its measures: `apps/viking/tools/review/o36/after.md`.

**Order 35, housekeeping, and every figure on one page** (`orders/35-housekeeping-and-the-figures.md`), live (PR #83). It retunes nothing (Lars has not played). The viking suite under 300 s on the Pi with nothing it held lost, every changed
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

Order 43 left (`apps/viking/tools/review/o43/after.md`): the 2s of its table not redrawn: Akerselva (a tower on Grefsenkollen three or four to a screen,
and whether one stands there at all), Gamle Oslo (Kampen kirke's spire two to a screen), the encore (Ekeberg over the park, which its slim towers would
have to make room for), Østensjøvannet, Korketrekkeren, Slottet, and Langkaia (the fjord's islands: its far layers are the first script's, shared with
four levels and the map). For Lars: whether each landmark drawn is the place he knows, and where it stands.

Order 42 left (`apps/viking/tools/review/o42/after.md`): on a short phone on its side (667 x 375) the map's bar is two rows of links, and with line 2 open
a third of runes (97 or 159 of 375 px), so the map's stations stand just under it and its rune stones under it; laying the bar out again for that size
moves the links (thumb targets), which order 42 was not to do; there the map's lowest boards may reach the pad. Upright on a short phone
(360 x 640) the map's bar is 204 px, 251 with a notch: the stations' rune stones stand at its foot and the plate over the stations. The maze's level list inside the page lies
over the maze's help line on a short phone (a dialog over it; the help line goes at his first move). The first script's next candidates (ADR 0035
amended): the maze's glue in `main.ts` (about 1.2 kB), the bosses' bubbles' placing.

Order 41 left (`apps/viking/tools/review/o41/after.md`): on a phone on its side with a notch, the story's opening card and the maze's level list reach
into the home bar's strip (their buttons are 56 tall; mending it moves a touch target, which order 41 did not allow: start a card under the bar on a
short screen, or keep a card's height off the safe bottom so it scrolls); the cards are the site's chrome, plain, shared with the front page and the
maze; a bubble on white snow or a cloud has no edge (the kit's, shared with the front page); the "!" is two art pixels wide standing. Order 42 took up
all of it but the cards being plain.

Order 40 left (`apps/viking/tools/review/o40/after.md`): the fifth weakest tell, the welder's sparks at Bjørvika (18 pixels), and Bjørvika's own gust,
the sinking stone at Gamlebyen and the heron, which share the giving-way tell order 40 mended for the pads and bundles; the rune's stone at night
and twilight (its dark edge on the night's dark ground, 6.7 to 19.3; its rune is lit), which a dark line cannot help: a pale rim would be a
decision about the look. The page of every figure is worth publishing again: five props and the track rat changed.

Order 39 finished order 38's table (`apps/viking/tools/review/o39/`). What it left for a decision (what he takes against an evening sky, warm on warm; the track rat's small tell) order 40 took up: the maze's dark line round a thing to take after dusk, and the track rat's snout over the cover.

Order 36 brought the maze up to the rest (idea 8) and order 37 gave him his back and his face there; the page of every figure can be published
again with the maze's figures on it, in either language (`apps/viking/tools/figures.ts`: `figures.json` names every state in both since order 37). Order 34 answered what Lars had said. What is still his: a line for the opening card (he suggested one; who speaks it is unclear), the
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
     and in the dark, any missed tap. On a notched phone on its side, a turn beside a button (the camera's jump there is gone
     since order 37, by measure and with a pretended notch: whether it feels smooth is his).
   - The maze (order 37): whether his back and his face read as the same man going up and down a corridor, and whether turning
     a corner reads without a hitch.
   - Motion (orders 23 to 25): does his run read as running; is the idle fidgety; is the
     landing felt; do the strips of water read as depth or shimmer; are things in front a
     distraction; is the "!" on every thrower too much; does the edge arrow help.
   - Sound: nobody has heard any of it, the encore's tune included (order 34; how to hear it: [`resources.md`](resources.md)).
4. ~~**The camera's jump on notched phones** (order 21's one "partly").~~ Done in order 37: reproduced with a pretended notch and live frames
   (85 px in a frame at a turn) and gone (the camera eases for the ground ahead either way; ADR 0043 amended). Left: a real notched phone.
5. ~~**Stortinget's escalator shafts**: 3,600 of its 9,950 rectangles a frame.~~ Done in order 31: kept and copied, the shafts' places
   1,363 to 2,947 rectangles a frame at 390 x 844 where they were 4,259 to 6,630.
6. **Way 1 for him alone** (GRAIN.md): only if he still reads as a blob on a phone after way 3.
7. **The 240-pixel upright view** (ADR 0019): at 200 everything is a fifth larger. A question
   for Lars with two pictures, not a thing to decide for him.
8. ~~**The maze** has had none of orders 18 to 27: its help line still names keys on touch; its
   figures are in the old style; it knows nothing of the glamour.~~ Done in order 36 (ADR 0056), but for the glamour, which it keeps
   out of on purpose (the mound is not Oslo). Left: whether the maze inside the viking page should be larger on an upright phone (it
   shares the page's 240-pixel view, ADR 0019). His front and back views there: done in order 37.
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
- The viking suite: under 300 s alone since order 35 (277.9 and 272.7 s after order 43, 270.5 and 268.2 s for `origin/main` the same hour, 538 tests; 275.6 and 276.1 s after order 42, 280.5 and 269.6 s for `origin/main` the same hour, 537 tests; 263.1 and 273.6 s after order 41, 273.3 and 275.1 s for `origin/main` the same hour; 272.6 to 277.0 s after order 40, 262.2 and 270.9 s for `origin/main` the same hour; 271.5 s after order 39, 270.0 s for `origin/main` the same hour; 265.6 s after order 38, 265.8 s for `origin/main` the same hour; 268.0 s after order 37, 263.1 s for `origin/main` the same hour; `apps/viking/tools/review/o35/after.md` has the three runs and every file's time;
  it was 362.7 s that morning, 370.5 s after order 34). The reach searches are about 100 s of it and CPU-bound on four cores (Akershus's
  alone 52 s, in the kit's physics); the reduced-motion test about 70 s in company. A new test that draws every level should share a
  walk or a recorder already made (`render/fields.ts`: `areaRecorder`, `ANY_METHOD`).
- `tools/pictures.ts` retakes LEVELS.html's pictures; since order 35 it takes none that comes out blank (`tools/shots.ts` names them).
