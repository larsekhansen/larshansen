# Order 40: what he takes, and what warns: looked at first

Looked at on branch `takes-and-warns`, from `origin/main` at `5335a4b` (after order 39). Pictures and working files outside the repository, in
`~/.cache/claude-scratch-larshansen/o40/`: `shots/` (the hand-back's pictures), `work/` (the places, the measures, their logs), `bin/` (the
scripts, described below). The measures a row a subject: `takes.tsv` (item 1) and `tells.tsv` (item 2), both here.

## 1. What he takes, after dusk

**How** (as order 39 measured it, `bin/takes.ts`, `bin/takerim.py`): in every level the pickups every level has (a skilling, the cheese, the
bracteate, the rune stone, a bench, a flag), drawn by the game's own drawing at step 1, photographed at 390 x 844 with the camera on each
(`?debug&look=`) by day and under every sky after dusk it is met under: Langkaia, which follows the clock, under the evening, the twilight and
the night; Ekeberg, Bjørvika and Korketrekkeren in their evening; Nordmarka and Østensjøvannet at twilight; Gamlebyen at night; Gamle Oslo
in its winter night; a level pinned to day at night as well (never met so: shown, not ranked). 108 subjects, 96 pictures by day and 108 under
the skies. Each found by day where its own colours match (within 24 a channel), and measured as the contrast (CIEDE2000) between its own
edge and the pixel just beyond it under the sky, every edge pixel against each neighbour outside, the median.

**What was found** (`takes.tsv`, "before"): what he takes, met after dusk, under 30:

| Subject | Sky | Before |
|---|---|---|
| the bracteate, Langkaia and Ekeberg | evening | 14.5 |
| the cheese, Ekeberg | evening | 15.0 |
| the skilling, Langkaia | evening | 17.2 |
| the skilling, Ekeberg | evening | 17.7 |
| the skilling, Bjørvika | evening | 18.0 |
| the cheese, Langkaia | evening | 18.3 |
| the cheese, Bjørvika | evening | 21.0 |
| the bracteate, Bjørvika | evening | 23.4 |
| the bracteate, Korketrekkeren | evening | 25.3 |
| the skilling, Korketrekkeren | evening | 29.1 |
| the skilling, Nordmarka | twilight, under its own dark | 4.8 (outside his headlamp the dark covers everything, by design) |

At twilight and at night they stood 33 to 47: it is the evening's warm tint over copper, amber and the cheese's brown that made them warm
on warm. The rune's stone has a dark edge of its own (31 in the evening, but 6.7 to 19 at Langkaia's night and twilight and 13.5 at
Østensjøvannet: a dark edge on the night's dark ground). Benches and flags are not things to take.

**Three in three evening levels, before and after at phone size** (`shots/item1/`): the bracteate at Langkaia, the cheese at Ekeberg and a
skilling at Bjørvika, by day, in the evening before, with the line all round, and with the line on the shadow side only:
`three-evening-day-before-all-shadow-x5.png` (five times), `three-evening-before-all-shadow-x2.png` (twice, with what is round them), and three
more (`three-more-day-before-all-shadow-x5.png`). Judged in `after.md`.

## 2. The tells, ranked

**How** (`bin/tells.ts`, `bin/tellmeasure.py`): every row of order 39's table (`../o39/after.md`, "Every tell in the game"), one or more
places each: the three jumpers, a thrower of each of the eight kinds, a statue walking, a guard waking, a swan turning, a sledger leaning in,
three ledges on a beat (a bell, a banner, the plinth's step) and the loose slab, a lily pad and a bundle about to sink, a train and a lift
about to leave, the crossing's barrier and the welder's sparks, a gust, a wall closing behind him, the troll's club, the plough revving, the
serpent's ring, rearing and tail, Loki's club, charge and bite. Each staged as the page's harness stages it (he put somewhere and nothing
held, or the scripted route), stepped until the tell is on: pictures under the level's own sky at the step before it (A), a third and two
thirds into it (B, B2), and as far before A as B is after it (C), with motion and with reduced motion, `?debug&where` writing the subject's
place on the screen into the picture. In a window round it: the pixels that differ between A and B (or B2) by 2 or more, less what changes by
itself (C against A, and a pixel round it) and less him (his place at each step, from the staging). **Size**: those 10 or more off what was
there (the tell's frame with the most); **contrast**: their median; **how long**: the steps it stands. Ranked by size times contrast times the
share of a second it stands (`tells.tsv`).

**Limits, said plainly**: a staging along the scripted route has him and the camera's world moving through the window (the guard, the
sledger, the banners); the bosses' windows were not on the bosses (their state's place is not the drawing's), so their own drawing's change is
taken from order 39 (`../o39/after.md`: the troll's club 779 pixels, the plough revving 522 to 1,912, the serpent's ring 355 to 373, its
throat 2,654, its tail 105, Loki's club 294, beacons 573, ring 251); a train passes behind the track rat in its staging, so its picture
measure is the train's (its stones are 6 pixels, dark on the red cover, on and off). The ranking was read with the pictures, not from the
numbers alone.

**The five weakest rows, with motion** (score; size and contrast):

| | Tell | Score | Size, contrast (motion) | With reduced motion |
|---|---|---|---|---|
| 1 | A wall closing behind him (Gamlebyen) | 0.8 | 13 pixels, 14.1, for 25 steps | 10 pixels, 6.0 |
| 2 | The track rat's ballast (Stortinget) | (1.9: the train) | three stones, 6 pixels, dark on red, on and off | the stones held, 6 pixels |
| 3 | What gives way under him: a lily pad (Østensjøvannet), a bundle (Bygdøy) | 3.0, 3.2 | 13 and 24 pixels, a pixel's tremble, half a second | 8 pixels each |
| 4 | A gust coming (Ekeberg) | 3.1 | 53 pixels, 5.9: four to twelve leaves of the evening's own colour | 28, 21.2 |
| 5 | The welder's sparks about to fall (Bjørvika) | 3.6 | 18 pixels, 20.1 | 17, 20.1 |

Next above them: the salmon's water (28 pixels, 20.1), the plinth's step with reduced motion (20 pixels, 8.5), Loki's bite (its window
missed the ring). The throwers' wind-ups stand 76 to 407 pixels, the turns 74 to 510, the bosses hundreds to thousands.

## 3. The eight left at 2

Order 39's marks (`../o39/before.md`, "Item 4") left eight figures at 2. Each on its sheet (`o39/figures/`) and in place:

| Sheet | Why it was left (order 39) | Looked at again |
|---|---|---|
| `enemy-trackrat` | its tell, three dark stones on the third rail's red cover, small with motion or without | the rat itself holds; its tell is item 2's first mend |
| `pickup-pole` | a ski pole is a line; at his side a pixel wide, with its grip, strap and basket | it is all there at its size; a wider pole would stand out from him as a stick |
| `prop-baluster` | one baluster is tiny on its sheet; in a row it reads as a balustrade | two pixels wide, nicked at the waist: a row of bars; a turned baluster can be three wide at the same pitch |
| `prop-fire basket` | the basket alone on its sheet; in place its fire flickers in it | a rim over a bowl, three rows: under its fire it is a dark smear |
| `prop-pontoons` | under the sauna rafts and mostly under water | a dark band under the deck's edge, which covers its top row: two rows of tar mixed with the fjord |
| `prop-post` | lit on its left, a cap, a dark foot | a bar; Holmenkollen's station posts thirty pixels of one column |
| `prop-rail tube` | ADR 0051 keeps a rail a line with a glint | posts two wide, rails lines with a glint: it reads as a railing |
| `prop-stove pipe` | three pixels of steel pipe; with its smoke the chimney | a T: a flat cap on a bar |

In place at 390 x 844 by day and under each level's sky: `shots/item3/` (before and after, see `after.md`).

## 4. The marks again

Order 39's marks (`../o39/before.md`, "Item 4") as they stand after order 40, looked at again on the branch's sheets (`o40/figures/`) and in
place: no 3s; the 2s that remain, each with why it was left.

| Sheet | Name | Met in | Mark after order 39 | Mark now | Why |
|---|---|---|---|---|---|
| `him` | the viking | all | 1 | **1** |  |
| `enemy-anthill` | anthill | nordmarka | 1 | **1** |  |
| `enemy-archer` | archer | gamlebyen | 1 | **1** |  |
| `enemy-bat` | bat | nordmarka | 1 | **1** |  |
| `enemy-boy` | the Angry Boy | vigelandsparken | 1 | **1** |  |
| `enemy-brazier` | brazier | akershus | 1 | **1** |  |
| `enemy-bronze` | bronze statue | vigelandsparken | 1 | **1** |  |
| `enemy-cat` | cat | nabolaget | 1 | **1** |  |
| `enemy-coot` | coot | ostensjovannet | 1 | **1** | was 2; redrawn in order 39: plump and black with its head up, the white shield and bill in the pale (no sheen or lean touches it), big lobed toes |
| `enemy-crab` | crab | bygdoy | 1 | **1** |  |
| `enemy-crow` | crow | akershus, holmenkollen, ekeberg, nabolaget, vigelandsparken, korketrekkeren, bjorvika | 1 | **1** | was 3; redrawn in order 38 as a hooded crow beating through four shapes (held by `alive/frames.test.ts`) |
| `enemy-dog` | dog | gamlebyen | 1 | **1** |  |
| `enemy-duck` | mallard | akerselva, ostensjovannet | 1 | **1** |  |
| `enemy-fox` | fox | holmenkollen, nordmarka, nabolaget, korketrekkeren | 1 | **1** |  |
| `enemy-goose` | goose | gamlebyen | 1 | **1** |  |
| `enemy-grill` | disposable grill | holmenkollen, akerselva | 1 | **1** |  |
| `enemy-guard` | fortress guard | akershus | 1 | **1** |  |
| `enemy-guard (the bishop's)` | the bishop's guard | gamlebyen | 1 | **1** | was 2; redrawn in order 39: a kettle hat with its brim, the bishop's cross, the halberd levelled with its axe-blade across the shaft; told from Akershus's guard by the brim and the levelled halberd (74 pixels apart) |
| `enemy-gull` | gull | langkaia, radhuset, slottet, akerselva, bygdoy | 1 | **1** | was 3; redrawn in order 38 as a herring gull beating through four shapes |
| `enemy-gull (thrower)` | gull with chips | radhuset | 1 | **1** |  |
| `enemy-hedgehog` | hedgehog | holmenkollen, akerselva, nordmarka, ekeberg | 1 | **1** |  |
| `enemy-hotdog` | hot-dog cart | slottet | 1 | **1** |  |
| `enemy-kid` | kid with snowballs | holmenkollen, nabolaget, korketrekkeren | 1 | **1** |  |
| `enemy-magpie` | magpie | ekeberg | 1 | **1** |  |
| `enemy-nester` | nesting gull | ostensjovannet | 1 | **1** |  |
| `enemy-owl` | owl | nordmarka, nabolaget, korketrekkeren, gamlebyen | 1 | **1** |  |
| `enemy-penguin` | penguin | bygdoy | 1 | **1** |  |
| `enemy-pigeon` | pigeon | langkaia, radhuset, slottet, stortinget, bygdoy, vigelandsparken, bjorvika | 1 | **1** |  |
| `enemy-pigeonfly` | pigeon in flight | stortinget | 1 | **1** | was 3; redrawn in order 38, broad wings beating through four shapes |
| `enemy-rat` | rat | langkaia, akershus, akerselva, stortinget, bygdoy, bjorvika, gamlebyen | 1 | **1** |  |
| `enemy-ringer` | ring-throwers | vigelandsparken | 1 | **1** |  |
| `enemy-riveter` | riveter | bjorvika | 1 | **1** |  |
| `enemy-salmon` | salmon | akerselva | 1 | **1** | was 2 (3 for its tell); order 38 drew its water breaking, order 39 held it still at its fullest with reduced motion, so its tell is seen with motion and without |
| `enemy-scooter` | e-scooter | radhuset, stortinget | 1 | **1** | was 3; redrawn in order 38 as a hire scooter, wheels, deck, stem, lamp |
| `enemy-sledger` | sledger | korketrekkeren | 1 | **1** |  |
| `enemy-slinger` | viking with a sling | bygdoy | 1 | **1** |  |
| `enemy-squirrel` | squirrel | nordmarka, ekeberg | 1 | **1** | was 2; redrawn in order 39: its tail a plume flicked back at the tip with sky between it and its back, tufted ears, the cone it holds the cone it throws |
| `enemy-statue` | granite statue | vigelandsparken | 1 | **1** |  |
| `enemy-swan` | swan | ostensjovannet | 1 | **1** |  |
| `enemy-trackrat` | track rat | stortinget | 2 | **1** | was 2: the rat held, its tell (three dark stones on the third rail's red cover) was small; since order 40 its snout pokes up over the cover for the whole of the tell, outlined as the rat is, sniffing with motion and still without |
| `enemy-trolley` | shopping trolley | stortinget | 1 | **1** |  |
| `enemy-umbrella` | umbrella | stortinget | 1 | **1** |  |
| `enemy-wasp` | wasp | akerselva, ekeberg | 1 | **1** | was 2; its beat touched up in order 38 (four shapes, held by the test) |
| `boss-loki` | Loki | encore | 1 | **1** |  |
| `boss-plough` | the snow plough | nabolaget | 1 | **1** |  |
| `boss-serpent` | the sea serpent | gamlebyen | 1 | **1** |  |
| `boss-troll` | the troll | nordmarka | 1 | **1** |  |
| `maze-adder` | an adder | jernhaugen | 1 | **1** |  |
| `maze-dweller` | the mound-dweller | jernhaugen | 1 | **1** | was 2; order 38 gave him a face, order 39 a peaked hood, the cloak in folds and one hand on his knee |
| `maze-ghost` | the ghost of your best run | jernhaugen | 1 | **1** |  |
| `maze-him` | the viking in the mound, with his torch | jernhaugen | 1 | **1** |  |
| `maze-key` | the rune key | jernhaugen | 1 | **1** |  |
| `maze-portal` | a teleport stone | jernhaugen | 1 | **1** |  |
| `maze-raven` | the raven | jernhaugen | 1 | **1** | was 3; redrawn in order 38, 10 x 13 with a hooked bill and a pale eye |
| `maze-stone` | a standing stone | jernhaugen | 1 | **1** |  |
| `harmless-heron` | heron | ostensjovannet | 1 | **1** |  |
| `harmless-sheep` | sheep | akershus, ekeberg | 1 | **1** |  |
| `pickup-bench` | bench | all | 1 | **1** |  |
| `pickup-bracteate` | gold bracteate | all | 1 | **1** |  |
| `pickup-cheese` | brown cheese | all | 1 | **1** |  |
| `pickup-feather` | raven's feather | nordmarka | 1 | **1** |  |
| `pickup-flag` | flag | all | 1 | **1** |  |
| `pickup-pole` | ski pole | holmenkollen | 2 | **2** | left: a ski pole is a line, a pixel wide at his side, with its grip, strap, basket and tip all there; wider, it would stand out from him as a stick he carries before him. Truly as good as it can be at its size |
| `pickup-rune` | rune stone | all | 1 | **1** |  |
| `pickup-shield` | shield | bygdoy | 1 | **1** |  |
| `pickup-skilling` | skilling | all | 1 | **1** |  |
| `thrown-archer` | arrows | gamlebyen | 1 | **1** |  |
| `thrown-gull (thrower)` | the gull's chips | radhuset | 1 | **1** |  |
| `thrown-kid` | snowballs | holmenkollen, nabolaget, korketrekkeren | 1 | **1** |  |
| `thrown-nester` | a nesting gull's dive | ostensjovannet | 1 | **1** |  |
| `thrown-ringer` | stone rings | vigelandsparken | 1 | **1** |  |
| `thrown-riveter` | bolts | bjorvika | 1 | **1** |  |
| `thrown-slinger` | sling stones | bygdoy | 1 | **1** |  |
| `thrown-squirrel` | pine cones | nordmarka, ekeberg | 1 | **1** |  |
| `carrier-akerselva` | the logs and the water wheel's buckets | akerselva | 1 | **1** |  |
| `carrier-akershus` | the hoist | akershus | 1 | **1** |  |
| `carrier-bjorvika` | the hoist, the crane hooks and the steel sheets | bjorvika | 1 | **1** |  |
| `carrier-bygdoy` | the ferry, the raft and the reeds | bygdoy | 1 | **1** |  |
| `carrier-ekeberg` | the trams | ekeberg | 1 | **1** |  |
| `carrier-gamlebyen` | the longships | gamlebyen | 1 | **1** |  |
| `carrier-holmenkollen` | the chairlift and the tower lift | holmenkollen | 1 | **1** |  |
| `carrier-langkaia` | the rafts and the rowing boat | langkaia | 1 | **1** |  |
| `carrier-nabolaget` | the trams | nabolaget | 1 | **1** |  |
| `carrier-nordmarka` | the moose | nordmarka | 1 | **1** |  |
| `carrier-radhuset` | the ferry, the tower lift, the bell and the clock's hands | radhuset | 1 | **1** |  |
| `carrier-slottet` | the banners and the Guard | slottet | 1 | **1** |  |
| `carrier-stortinget` | the trains | stortinget | 1 | **1** |  |
| `carrier-vigelandsparken` | the fountain's jets | vigelandsparken | 1 | **1** |  |
| `prop-baluster` | balusters | slottet | 2 | **1** | was 2; redrawn in order 40: a turned baluster three wide at the same pitch, a square cap, a neck, its swelling body, a neck and a foot, lit on its left |
| `prop-barrier` | crowd barrier | slottet | 1 | **1** |  |
| `prop-chair` | chairlift chair | holmenkollen | 1 | **1** |  |
| `prop-container` | site container | bjorvika | 1 | **1** |  |
| `prop-ferry` | the City Hall ferry | radhuset | 1 | **1** |  |
| `prop-fire basket` | fire basket | akershus | 2 | **1** | was 2; redrawn in order 40: a rim lit on its left, a cage of bars with the coals' dark between them, a bowl, its stem and its foot, under the flame drawn apart |
| `prop-gate lantern` | gate lantern | vigelandsparken | 1 | **1** |  |
| `prop-gate pillar` | gate pillar | vigelandsparken | 1 | **1** |  |
| `prop-gondola` | gondola | radhuset | 1 | **1** |  |
| `prop-hut door` | plank door | langkaia | 1 | **1** |  |
| `prop-ladder` | ladder | langkaia | 1 | **1** |  |
| `prop-lamp old` | old-town lantern | ekeberg, nabolaget, gamlebyen, encore | 1 | **1** |  |
| `prop-lamp park` | park lantern | vigelandsparken | 1 | **1** |  |
| `prop-lamp square` | square lamp | radhuset | 1 | **1** |  |
| `prop-leg` | the diving tower's legs | langkaia | 1 | **1** |  |
| `prop-light pole` | lit-trail pole | korketrekkeren | 1 | **1** |  |
| `prop-log` | log | akerselva | 1 | **1** |  |
| `prop-panel door` | panel door | stortinget, nabolaget | 1 | **1** |  |
| `prop-plank wall` | plank wall | langkaia, nabolaget | 1 | **1** |  |
| `prop-pontoons` | sauna raft pontoons | langkaia | 2 | **1** | was 2; redrawn in order 40: a row of tarred floats under the deck, each lit on its upper left and rounded, darkening into the fjord at the waterline (the deck's edge covers the band that was there) |
| `prop-post` | post | langkaia, holmenkollen, nabolaget | 2 | **1** | was 2; redrawn in order 40: iron with a cap and a dark line under it, a collar and a plinth (Holmenkollen's station posts read as columns); wood with a bolt near its top, a knot, its foot dark and wet |
| `prop-rail bars` | iron railing | radhuset, nabolaget | 1 | **1** |  |
| `prop-rail tube` | tube railing | langkaia, slottet, ekeberg | 2 | **2** | left: ADR 0051 keeps a rail a line with a glint, never a lit top over a shadow line; clamps where the middle rail passes and base plates were tried in order 40 and were not seen in place at phone size, so the old drawing stands |
| `prop-roof truss` | the stage's roof truss | encore | 1 | **1** |  |
| `prop-rowboat` | rowing boat | langkaia | 1 | **1** |  |
| `prop-sauna cabin` | sauna cabin | langkaia | 1 | **1** |  |
| `prop-site fence` | site fence | bjorvika | 1 | **1** |  |
| `prop-speaker stack` | speaker stack | encore | 1 | **1** |  |
| `prop-stove pipe` | stove pipe | langkaia | 2 | **1** | was 2; redrawn in order 40: a rain cap on two legs with the flue's soot under it, the round pipe lit and shaded, a joint's collar on the tall one, the flashing through the roof |
| `prop-tram` | tram | ekeberg, nabolaget | 1 | **1** |  |
| `prop-truss tower` | lighting tower | encore | 1 | **1** |  |
